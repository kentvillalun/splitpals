"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createPortal } from "react-dom";
import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { PageContent } from "@/app/components/layout/PageContent";
import { supabase } from "@/app/lib/supabase";
import { haptic } from "@/app/lib/haptic";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

let idCounter = 0;
function tempId() {
  idCounter += 1;
  return `temp-${idCounter}`;
}

function emptyPerson() {
  return {
    id: tempId(),
    name: "",
    items: [{ id: tempId(), name: "", price: "", note: "" }],
  };
}

export default function EditBillPage() {
  const router = useRouter();
  const { id: billId } = useParams();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [billName, setBillName] = useState("");
  const [isEditingBillName, setIsEditingBillName] = useState(false);
  const [draftBillName, setDraftBillName] = useState("");
  const [persons, setPersons] = useState([]);
  // Track original person/item IDs so we know what to delete on save
  // (anything removed locally that existed in the DB needs explicit deletion)
  const [originalPersonIds, setOriginalPersonIds] = useState([]);
  const [originalItemIds, setOriginalItemIds] = useState([]);

  const [sheetMode, setSheetMode] = useState(null); // 'review' | 'abandon' | null
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Load existing bill ──
  useEffect(() => {
    async function loadBill() {
      setIsLoading(true);
      setLoadError(false);

      const { data: bill, error } = await supabase
        .from("bills")
        .select(
          `id, name, persons (id, name, is_paid, items (id, name, price, note))`
        )
        .eq("id", billId)
        .single();

      if (error || !bill) {
        setLoadError(true);
        setIsLoading(false);
        return;
      }

      setBillName(bill.name);
      setDraftBillName(bill.name);

      const loadedPersons = (bill.persons ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        isPaid: p.is_paid,
        items:
          p.items && p.items.length > 0
            ? p.items.map((i) => ({
                id: i.id,
                name: i.name,
                price: String(i.price),
                note: i.note ?? "",
              }))
            : [{ id: tempId(), name: "", price: "", note: "" }],
      }));

      setPersons(
        loadedPersons.length > 0 ? loadedPersons : [emptyPerson()]
      );
      setOriginalPersonIds(loadedPersons.map((p) => p.id));
      setOriginalItemIds(
        loadedPersons.flatMap((p) => p.items.map((i) => i.id))
      );

      setIsLoading(false);
    }

    if (billId) loadBill();
  }, [billId]);

  // ── Bill name editing ──
  function startEditingBillName() {
    haptic.light();
    setDraftBillName(billName);
    setIsEditingBillName(true);
  }

  function saveBillName() {
    const trimmed = draftBillName.trim();
    setBillName(trimmed || billName);
    setIsEditingBillName(false);
  }

  // ── Person management ──
  function addPerson() {
    haptic.light();
    setPersons((prev) => [...prev, emptyPerson()]);
  }

  function removePerson(personId) {
    haptic.light();
    setPersons((prev) => prev.filter((p) => p.id !== personId));
  }

  function updatePersonName(personId, name) {
    setPersons((prev) =>
      prev.map((p) => (p.id === personId ? { ...p, name } : p))
    );
  }

  // ── Item management ──
  function addItem(personId) {
    haptic.light();
    setPersons((prev) =>
      prev.map((p) =>
        p.id === personId
          ? {
              ...p,
              items: [...p.items, { id: tempId(), name: "", price: "", note: "" }],
            }
          : p
      )
    );
  }

  function removeItem(personId, itemId) {
    haptic.light();
    setPersons((prev) =>
      prev.map((p) =>
        p.id === personId
          ? { ...p, items: p.items.filter((i) => i.id !== itemId) }
          : p
      )
    );
  }

  function updateItem(personId, itemId, field, value) {
    setPersons((prev) =>
      prev.map((p) =>
        p.id === personId
          ? {
              ...p,
              items: p.items.map((i) =>
                i.id === itemId ? { ...i, [field]: value } : i
              ),
            }
          : p
      )
    );
  }

  // ── Derived totals ──
  function personSubtotal(person) {
    return person.items.reduce(
      (sum, item) => sum + (parseFloat(item.price) || 0),
      0
    );
  }

  const grandTotal = persons.reduce(
    (sum, p) => sum + personSubtotal(p),
    0
  );

  const hasValidItem = persons.some((p) =>
    p.items.some((i) => i.name.trim() && parseFloat(i.price) > 0)
  );

  const hasUnsavedChanges = true; // always allow exit-confirmation while editing

  // ── Cancel flow ──
  function handleCancelTap() {
    haptic.light();
    setSheetMode("abandon");
    setSheetOpen(true);
  }

  function handleConfirmAbandon() {
    haptic.medium();
    router.push(`/history/${billId}`);
  }

  // ── Save flow ──
  function handleReviewTap() {
    if (!hasValidItem) {
      toast.error("Add at least one item before saving.");
      return;
    }
    haptic.medium();
    setSheetMode("review");
    setSheetOpen(true);
  }

  function isTempId(id) {
    return typeof id === "string" && id.startsWith("temp-");
  }

  async function handleConfirmSave() {
    setIsSaving(true);
    haptic.medium();

    // 1. Update bill name
    const { error: billError } = await supabase
      .from("bills")
      .update({ name: billName })
      .eq("id", billId);

    if (billError) {
      haptic.error();
      toast.error("Couldn't save changes. Please try again.");
      setIsSaving(false);
      return;
    }

    const currentPersonIds = persons.map((p) => p.id).filter((id) => !isTempId(id));
    const currentItemIds = persons
      .flatMap((p) => p.items.map((i) => i.id))
      .filter((id) => !isTempId(id));

    // 2. Delete persons that existed before but were removed locally
    //    (cascade delete on the DB handles their items automatically)
    const personsToDelete = originalPersonIds.filter(
      (id) => !currentPersonIds.includes(id)
    );
    if (personsToDelete.length > 0) {
      await supabase.from("persons").delete().in("id", personsToDelete);
    }

    // 3. Delete items that existed before but were removed locally
    //    (only for persons that still exist — already-deleted persons
    //    cascade their items automatically)
    const itemsToDelete = originalItemIds.filter(
      (id) => !currentItemIds.includes(id)
    );
    if (itemsToDelete.length > 0) {
      await supabase.from("items").delete().in("id", itemsToDelete);
    }

    // 4. Upsert persons + items
    for (const person of persons) {
      const validItems = person.items.filter(
        (i) => i.name.trim() && parseFloat(i.price) > 0
      );
      if (!person.name.trim() || validItems.length === 0) continue;

      let personId = person.id;

      if (isTempId(person.id)) {
        // new person — insert
        const { data: createdPerson, error: personError } = await supabase
          .from("persons")
          .insert({ name: person.name.trim(), bill_id: billId })
          .select()
          .single();

        if (personError || !createdPerson) continue;
        personId = createdPerson.id;
      } else {
        // existing person — update name
        await supabase
          .from("persons")
          .update({ name: person.name.trim() })
          .eq("id", personId);
      }

      for (const item of validItems) {
        const itemPayload = {
          name: item.name.trim(),
          price: parseFloat(item.price),
          note: item.note?.trim() || null,
          person_id: personId,
        };

        if (isTempId(item.id)) {
          await supabase.from("items").insert(itemPayload);
        } else {
          await supabase.from("items").update(itemPayload).eq("id", item.id);
        }
      }
    }

    haptic.success();
    setSheetOpen(false);
    router.push(`/history/${billId}`);
  }

  // ── Loading / error states ──
  if (isLoading) {
    return (
      <>
        <DesktopGuard />
        <Page className="bg-backgroud">
          <PageContent className="px-4 pt-6">
            <div className="max-w-xl mx-auto w-full flex flex-col gap-3">
              <Skeleton height={28} width={140} className="mx-auto" />
              <Skeleton height={160} className="rounded-2xl" />
              <Skeleton height={160} className="rounded-2xl" />
            </div>
          </PageContent>
        </Page>
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <DesktopGuard />
        <Page className="bg-backgroud">
          <PageContent className="px-4 flex flex-col items-center text-center py-20 gap-2">
            <p className="font-bold text-text-primary text-base">
              Couldn't load this bill
            </p>
            <p className="text-text-secondary text-sm max-w-55">
              It may have been deleted, or something went wrong.
            </p>
            <button
              className="text-sm font-semibold text-primary mt-1"
              onClick={() => router.push("/dashboard")}
            >
              Back to dashboard
            </button>
          </PageContent>
        </Page>
      </>
    );
  }

  return (
    <>
      <DesktopGuard />
      <Page className="bg-backgroud">
        <PageContent className="px-0" withBottomNav={false}>
          <div className="flex flex-col w-full gap-5">
            {/* Header — fixed at top */}
            <div className="gradient-button w-full px-4 pt-5 pb-6 rounded-b-3xl fixed top-0 left-0 right-0 z-30">
              <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
                <button
                  onClick={handleCancelTap}
                  className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors duration-150 shrink-0"
                >
                  <ArrowLeftIcon className="w-4 stroke-white" />
                </button>

                {isEditingBillName ? (
                  <input
                    autoFocus
                    value={draftBillName}
                    onChange={(e) => setDraftBillName(e.target.value)}
                    onBlur={saveBillName}
                    onKeyDown={(e) => e.key === "Enter" && saveBillName()}
                    maxLength={40}
                    className="text-base font-semibold text-white bg-white/15 rounded-lg px-2 py-1 outline-none flex-1 min-w-0 text-center"
                  />
                ) : (
                  <button
                    onClick={startEditingBillName}
                    className="flex items-center gap-1.5 min-w-0 flex-1 justify-center"
                  >
                    <p className="text-base font-semibold text-white truncate">
                      {billName}
                    </p>
                    <PencilIcon className="w-3.5 stroke-white/70 shrink-0" />
                  </button>
                )}

                <div className="w-8 h-8 shrink-0" />
              </div>
            </div>

            {/* Spacer so content doesn't sit under the fixed header */}
            <div className="h-22" />

            <div className="max-w-xl mx-auto w-full px-4 flex flex-col gap-4 pb-32 -mt-5">
              {/* Person cards */}
              <AnimatePresence initial={false}>
                {persons.map((person, idx) => (
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3"
                  >
                    {/* Person header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <UserCircleIcon className="w-5 text-orange shrink-0" />
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                          Person {idx + 1}
                        </p>
                      </div>
                      {persons.length > 1 && (
                        <button
                          onClick={() => removePerson(person.id)}
                          className="shrink-0"
                        >
                          <TrashIcon className="w-4 text-text-secondary/50" />
                        </button>
                      )}
                    </div>

                    {/* Name input */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-text-secondary">
                        Name
                      </label>
                      <input
                        value={person.name}
                        onChange={(e) =>
                          updatePersonName(person.id, e.target.value)
                        }
                        placeholder="e.g. Kent"
                        className="border border-black/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange/40 transition-colors duration-150"
                      />
                    </div>

                    {/* Items */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-text-secondary">
                        Orders
                      </label>
                      <div className="flex flex-col gap-2">
                        <AnimatePresence initial={false}>
                          {person.items.map((item) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.96 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="border border-black/10 rounded-xl p-2.5 flex flex-col gap-2"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  value={item.name}
                                  onChange={(e) =>
                                    updateItem(
                                      person.id,
                                      item.id,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Item name"
                                  className="flex-1 text-sm outline-none min-w-0"
                                />
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-sm text-text-secondary">
                                    ₱
                                  </span>
                                  <input
                                    value={item.price}
                                    onChange={(e) =>
                                      updateItem(
                                        person.id,
                                        item.id,
                                        "price",
                                        e.target.value.replace(/[^0-9.]/g, "")
                                      )
                                    }
                                    placeholder="0"
                                    inputMode="decimal"
                                    className="w-14 text-sm font-semibold text-orange outline-none"
                                  />
                                </div>
                                {person.items.length > 1 && (
                                  <button
                                    onClick={() =>
                                      removeItem(person.id, item.id)
                                    }
                                    className="shrink-0"
                                  >
                                    <TrashIcon className="w-3.5 text-text-secondary/40" />
                                  </button>
                                )}
                              </div>

                              <input
                                value={item.note}
                                onChange={(e) =>
                                  updateItem(
                                    person.id,
                                    item.id,
                                    "note",
                                    e.target.value
                                  )
                                }
                                placeholder="Add a note (optional)"
                                className="text-xs text-text-secondary outline-none bg-black/2 rounded-lg px-2 py-1.5"
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      <button
                        onClick={() => addItem(person.id)}
                        className="flex items-center justify-center gap-1.5 mt-1 py-2 rounded-xl border border-dashed border-orange/40 text-orange text-sm font-semibold bg-orange-tint/50 transition-all duration-150 active:scale-95"
                      >
                        <PlusIcon className="w-4" />
                        Add item
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="flex justify-between items-center pt-1 border-t border-dashed border-black/10">
                      <p className="text-xs text-text-secondary">
                        {person.name.trim() || "This person"}'s total
                      </p>
                      <p className="font-bold text-orange text-sm">
                        ₱{personSubtotal(person).toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add person */}
              <button
                onClick={addPerson}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-orange/40 text-orange text-sm font-semibold bg-orange-tint/40 transition-all duration-150 active:scale-95"
              >
                <UserCircleIcon className="w-4" />
                Add another person
              </button>
            </div>
          </div>

          {/* Sticky bottom bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-backgroud px-4 pt-3 pb-6 border-t border-black/4">
            <div className="max-w-xl mx-auto flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  Grand total
                </p>
                <p className="font-bold text-base">
                  ₱{grandTotal.toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleReviewTap}
                disabled={!hasValidItem}
                className="w-full gradient-button py-3.5 rounded-2xl text-white font-semibold text-sm transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                Save changes
              </button>
            </div>
          </div>
        </PageContent>
      </Page>

      {/* Confirmation bottom sheet */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {sheetOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.15, ease: "easeIn" },
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="fixed inset-0 z-40 bg-black/40 font-body"
                  onClick={() => !isSaving && setSheetOpen(false)}
                />
                <motion.div
                  className="bg-white h-auto w-full flex flex-col items-center fixed bottom-0 rounded-t-4xl gap-6 pt-4 px-5 pb-17 z-50"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{
                    y: "100%",
                    transition: { duration: 0.25, ease: "easeIn" },
                  }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  drag={isSaving ? false : "y"}
                  dragConstraints={{ top: 0 }}
                  dragElastic={{ top: 0, bottom: 0.2 }}
                  onDragEnd={(_, info) => {
                    if (!isSaving && info.offset.y > 100) setSheetOpen(false);
                  }}
                >
                  <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-1" />

                  {sheetMode === "review" ? (
                    <>
                      <div className="flex flex-col gap-1 items-center text-center">
                        <p className="font-display text-xl font-bold">
                          Save these changes?
                        </p>
                        <p className="text-text-secondary text-sm max-w-60">
                          {persons.filter((p) => p.name.trim()).length} people
                          · ₱{grandTotal.toFixed(2)} total. Double-check
                          before saving.
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 w-full items-center max-w-xl">
                        <button
                          onClick={handleConfirmSave}
                          disabled={isSaving}
                          className="flex flex-row items-center justify-center w-full transition-all duration-200 ease-in-out hover:opacity-90 active:scale-95 rounded-2xl py-4 gap-2 font-bold text-white font-body disabled:opacity-60"
                          style={{
                            background:
                              "linear-gradient(to bottom, #2a2a2a, #1a1a1a)",
                            borderBottom: "1.5px solid #0a0a0a",
                          }}
                        >
                          {isSaving && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          )}
                          {isSaving ? "Saving..." : "Yes, save"}
                        </button>
                        <button
                          className="text-text-secondary font-body text-xs"
                          disabled={isSaving}
                          onClick={() => {
                            haptic.light();
                            setSheetOpen(false);
                          }}
                        >
                          Let me check again
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1 items-center text-center">
                        <p className="font-display text-xl font-bold">
                          Discard changes?
                        </p>
                        <p className="text-text-secondary text-sm max-w-60">
                          Any edits you made won't be saved. Are you sure you
                          want to leave?
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 w-full items-center max-w-xl">
                        <button
                          onClick={handleConfirmAbandon}
                          className="flex flex-row items-center justify-center w-full transition-all duration-200 ease-in-out hover:opacity-90 active:scale-95 rounded-2xl py-4 gap-2 font-bold text-white font-body"
                          style={{
                            background:
                              "linear-gradient(to bottom, #2a2a2a, #1a1a1a)",
                            borderBottom: "1.5px solid #0a0a0a",
                          }}
                        >
                          Yes, discard
                        </button>
                        <button
                          className="text-text-secondary font-body text-xs"
                          onClick={() => {
                            haptic.light();
                            setSheetOpen(false);
                          }}
                        >
                          No, keep editing
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}