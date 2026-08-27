"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrashIcon,
  XMarkIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { PageContent } from "@/app/components/layout/PageContent";
import { PageHeader } from "@/app/components/layout/PageHeader";
import { useReceiptCapture } from "@/app/components/ReceiptCaptureProvider";
import { AssignItemSheet } from "@/app/components/AssignItemSheet";
import { haptic } from "@/app/lib/haptic";
import { supabase } from "@/app/lib/supabase";

let idCounter = 0;
function tempId() {
  idCounter += 1;
  return `assign-temp-${idCounter}`;
}

function splitWithLabel(item, persons, currentPersonId) {
  const others = item.assignedTo
    .filter((id) => id !== currentPersonId)
    .map((id) => persons.find((p) => p.id === id)?.name || "someone");

  if (others.length === 0) return null;
  if (others.length <= 2) return `Split with ${others.join(" and ")}`;
  return `Split with ${others[0]}, ${others[1]} +${others.length - 2}`;
}

export default function AssignItemsPage() {
  const router = useRouter();
  const { scannedItems } = useReceiptCapture();
  const [items, setItems] = useState([]);
  const [persons, setPersons] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [assigningItem, setAssigningItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchContacts() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("contacts")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name");

      if (!error && data) setContacts(data);
    }

    fetchContacts();
  }, []);

  // Only guard against landing here with nothing scanned (e.g. a hard
  // refresh, which loses the in-memory scannedItems).
  const hadItemsOnMount = useRef(Boolean(scannedItems?.length));
  useEffect(() => {
    if (!hadItemsOnMount.current) {
      router.replace("/dashboard");
      return;
    }
    setItems(
      scannedItems.map((i) => ({
        id: tempId(),
        name: i.name ?? "",
        price: i.price ?? 0,
        assignedTo: [],
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Same "accidental exit" scenario as manual entry: once real progress
  // exists (a person added, or an item assigned), leaving should confirm.
  const hasProgress =
    persons.length > 0 || items.some((item) => item.assignedTo.length > 0);

  const hasProgressRef = useRef(hasProgress);
  useEffect(() => {
    hasProgressRef.current = hasProgress;
  }, [hasProgress]);

  // Browser/gesture back: trap it with a sentinel history entry so we get a
  // cancelable popstate instead of immediately losing the page.
  const guardArmed = useRef(false);
  useEffect(() => {
    if (hasProgress && !guardArmed.current) {
      guardArmed.current = true;
      window.history.pushState({ splitpalsAssignGuard: true }, "");
    }
  }, [hasProgress]);

  useEffect(() => {
    function handlePopState() {
      if (!hasProgressRef.current) return;
      // Re-arm immediately so the back-navigation doesn't actually complete yet.
      window.history.pushState({ splitpalsAssignGuard: true }, "");
      haptic.light();
      setSheetOpen(true);
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function handleBack() {
    haptic.light();
    if (!hasProgress) {
      router.push("/dashboard");
      return;
    }
    setSheetOpen(true);
  }

  function handleConfirmAbandon() {
    haptic.medium();
    router.push("/dashboard");
  }

  function handleAssignTap(item) {
    setAssigningItem(item);
  }

  function handleAssignCommit({ existingPersonIds, contacts: selectedContacts, newNames }) {
    const newPersonsFromContacts = selectedContacts.map((contact) => ({
      id: tempId(),
      name: contact.name,
      contactId: contact.id,
    }));
    const newPersonsFromNames = newNames.map((name) => ({
      id: tempId(),
      name,
      contactId: null,
    }));
    const newPersons = [...newPersonsFromContacts, ...newPersonsFromNames];

    const allAssigneeIds = [
      ...existingPersonIds,
      ...newPersons.map((p) => p.id),
    ];

    if (newPersons.length > 0) {
      setPersons((prev) => [...prev, ...newPersons]);
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === assigningItem.id
          ? {
              ...item,
              assignedTo: [...new Set([...item.assignedTo, ...allAssigneeIds])],
            }
          : item
      )
    );

    haptic.medium();
    setAssigningItem(null);
  }

  function removePerson(personId) {
    haptic.light();
    setPersons((prev) => prev.filter((p) => p.id !== personId));
    setItems((prev) =>
      prev.map((item) =>
        item.assignedTo.includes(personId)
          ? { ...item, assignedTo: item.assignedTo.filter((id) => id !== personId) }
          : item
      )
    );
  }

  function handleRemoveShare(itemId, personId) {
    haptic.light();
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, assignedTo: item.assignedTo.filter((id) => id !== personId) }
          : item
      )
    );
  }

  function personSubtotal(personId) {
    return items
      .filter((item) => item.assignedTo.includes(personId))
      .reduce((sum, item) => sum + item.price / item.assignedTo.length, 0);
  }

  const unassignedItems = items.filter((item) => item.assignedTo.length === 0);
  const grandTotal = items.reduce((sum, item) => sum + item.price, 0);
  const canReview = items.length > 0 && unassignedItems.length === 0;
  const availableContacts = contacts.filter(
    (contact) => !persons.some((p) => p.contactId === contact.id)
  );

  async function handleSaveTap() {
    if (!canReview || isSaving) return;

    setIsSaving(true);
    haptic.medium();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You need to be signed in.");
      setIsSaving(false);
      return;
    }

    // 1. Create the bill — no merchant name was ever extracted by the scan,
    // so fall back to a placeholder (matches manual entry's "Bill 1" default).
    const { data: bill, error: billError } = await supabase
      .from("bills")
      .insert({ name: "Scanned bill", user_id: user.id })
      .select()
      .single();

    if (billError || !bill) {
      if (billError) console.error("Bill insert error:", billError);
      haptic.error();
      toast.error("Couldn't save the bill. Please try again.");
      setIsSaving(false);
      return;
    }

    const insertedItemIds = [];

    try {
      // 2. Create persons — reuse an existing contact_id where we have one
      // (from "From contacts"); insert a new contact for freshly typed names.
      // A failed contact insert shouldn't sink the whole save, so it just
      // falls back to a null contact_id for that person.
      const personIdMap = new Map();

      for (const person of persons) {
        let contactId = person.contactId ?? null;

        if (!contactId) {
          const { data: newContact, error: contactError } = await supabase
            .from("contacts")
            .insert({ user_id: user.id, name: person.name })
            .select()
            .single();

          if (contactError) console.error("Contact insert error:", contactError);
          if (!contactError && newContact) {
            contactId = newContact.id;
          }
        }

        const { data: createdPerson, error: personError } = await supabase
          .from("persons")
          .insert({ name: person.name, bill_id: bill.id, contact_id: contactId })
          .select()
          .single();

        if (personError) console.error("Person insert error:", personError);
        if (personError || !createdPerson) {
          throw new Error("Couldn't save one of the people on this bill.");
        }

        personIdMap.set(person.id, createdPerson.id);
      }

      // 3. Create items — person_id always gets the first assignee, even for
      // a shared item (the items RLS policy joins person_id → persons →
      // bills → user_id, so a null person_id has nothing to join against and
      // fails RLS). This value is never treated as authoritative for shared
      // items elsewhere in the app — item_shares is the real source of truth
      // for who's splitting it and records every assignee, including this one.
      for (const item of items) {
        const realAssigneeIds = item.assignedTo
          .map((localId) => personIdMap.get(localId))
          .filter(Boolean);

        const isShared = realAssigneeIds.length > 1;

        const { data: createdItem, error: itemError } = await supabase
          .from("items")
          .insert({
            name: item.name,
            price: item.price,
            person_id: realAssigneeIds[0],
          })
          .select()
          .single();

        if (itemError) console.error("Item insert error:", itemError);
        if (itemError || !createdItem) {
          throw new Error("Couldn't save one of the items on this bill.");
        }

        insertedItemIds.push(createdItem.id);

        if (isShared) {
          const { error: shareError } = await supabase.from("item_shares").insert(
            realAssigneeIds.map((personId) => ({
              item_id: createdItem.id,
              person_id: personId,
            }))
          );

          if (shareError) {
            console.error("Item shares insert error:", shareError);
            throw new Error("Couldn't save the split for one of the items.");
          }
        }
      }
    } catch {
      haptic.error();
      // Roll back rather than leave a half-saved bill. Items are deleted
      // explicitly first — a shared item can have a null person_id, so it
      // wouldn't otherwise be reachable via a cascade off the bill/persons.
      if (insertedItemIds.length > 0) {
        await supabase.from("items").delete().in("id", insertedItemIds);
      }
      await supabase.from("bills").delete().eq("id", bill.id);

      toast.error("Couldn't save this bill. Please try again.");
      setIsSaving(false);
      return;
    }

    haptic.success();
    router.push(`/receipt?id=${bill.id}`);
  }

  return (
    <>
      <DesktopGuard />
      <Page className="bg-backgroud">
        <PageContent className="px-0" withBottomNav={false}>
          <div className="flex flex-col w-full gap-5">
            <PageHeader onBack={handleBack}>
              <p className="text-base font-semibold text-white truncate flex-1 text-center">
                Assign items
              </p>
            </PageHeader>

            <div className="h-23.5" />

            <div className="max-w-xl mx-auto w-full px-4 flex flex-col gap-4 pb-32 -mt-5">
              {/* Unassigned */}
              {unassignedItems.length > 0 && (
                <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3">
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                    Unassigned
                  </p>
                  <div className="flex flex-col gap-2">
                    <AnimatePresence initial={false}>
                      {unassignedItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="flex items-center justify-between gap-2 border border-black/10 rounded-xl p-2.5"
                        >
                          <div className="flex flex-col min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-text-secondary">
                              ₱{item.price.toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleAssignTap(item)}
                            className="shrink-0 text-xs font-semibold text-orange bg-orange-tint px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95"
                          >
                            Assign
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Person cards */}
              <AnimatePresence initial={false}>
                {persons.map((person, idx) => {
                  const personItems = items.filter((item) =>
                    item.assignedTo.includes(person.id)
                  );

                  return (
                    <motion.div
                      key={person.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <UserCircleIcon className="w-5 text-orange shrink-0" />
                          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide truncate">
                            {person.name || `Person ${idx + 1}`}
                          </p>
                        </div>
                        <button
                          onClick={() => removePerson(person.id)}
                          className="shrink-0"
                        >
                          <TrashIcon className="w-4 text-text-secondary/50" />
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        {personItems.length === 0 ? (
                          <p className="text-xs text-text-secondary italic">
                            No items assigned yet
                          </p>
                        ) : (
                          <AnimatePresence initial={false}>
                            {personItems.map((item) => {
                              const share = item.price / item.assignedTo.length;
                              const note = splitWithLabel(item, persons, person.id);

                              return (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.96 }}
                                  transition={{ duration: 0.2, ease: "easeOut" }}
                                  className="flex items-center justify-between gap-2 border border-black/10 rounded-xl p-2.5"
                                >
                                  <div className="flex flex-col min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {item.name}
                                    </p>
                                    {note && (
                                      <p className="text-xs text-text-secondary truncate">
                                        {note}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <p className="text-sm font-semibold text-orange">
                                      ₱{share.toFixed(2)}
                                    </p>
                                    <button
                                      onClick={() =>
                                        handleRemoveShare(item.id, person.id)
                                      }
                                    >
                                      <XMarkIcon className="w-3.5 text-text-secondary/40" />
                                    </button>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </AnimatePresence>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-dashed border-black/10">
                        <p className="text-xs text-text-secondary">
                          {person.name || `Person ${idx + 1}`}'s total
                        </p>
                        <p className="font-bold text-orange text-sm">
                          ₱{personSubtotal(person.id).toFixed(2)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Sticky bottom bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-backgroud px-4 pt-3 pb-6 border-t border-black/4">
            <div className="max-w-xl mx-auto flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  Grand total
                </p>
                <p className="font-bold text-base">₱{grandTotal.toFixed(2)}</p>
              </div>
              <button
                onClick={handleSaveTap}
                disabled={!canReview || isSaving}
                className="w-full flex flex-row items-center justify-center gap-2 gradient-button py-3.5 rounded-2xl text-white font-semibold text-sm transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                {isSaving && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {isSaving ? "Saving..." : "Review & Share"}
              </button>
            </div>
          </div>
        </PageContent>
      </Page>

      {/* Accidental-exit confirmation — same pattern as manual entry's abandon sheet */}
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
                  onClick={() => setSheetOpen(false)}
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
                  drag="y"
                  dragConstraints={{ top: 0 }}
                  dragElastic={{ top: 0, bottom: 0.2 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.y > 100) setSheetOpen(false);
                  }}
                >
                  <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-1" />

                  <div className="flex flex-col gap-1 items-center text-center">
                    <p className="font-display text-xl font-bold">
                      Abandon this bill?
                    </p>
                    <p className="text-text-secondary text-sm max-w-60">
                      Your progress won't be saved. Are you sure you want to
                      leave?
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full items-center max-w-xl">
                    <button
                      onClick={handleConfirmAbandon}
                      className="flex flex-row items-center justify-center w-full transition-all duration-200 ease-in-out hover:opacity-90 active:scale-95 rounded-2xl py-4 gap-2 font-bold text-white font-body"
                      style={{
                        background: "linear-gradient(to bottom, #2a2a2a, #1a1a1a)",
                        borderBottom: "1.5px solid #0a0a0a",
                      }}
                    >
                      Yes, abandon
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
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}

      {assigningItem && (
        <AssignItemSheet
          item={assigningItem}
          persons={persons}
          contacts={availableContacts}
          onAssign={handleAssignCommit}
          onClose={() => setAssigningItem(null)}
        />
      )}
    </>
  );
}
