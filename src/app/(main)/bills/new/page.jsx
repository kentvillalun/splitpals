"use client";

import { useState, useEffect, useRef, ViewTransition } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { PageContent } from "@/app/components/layout/PageContent";
import { supabase } from "@/app/lib/supabase";
import { hapticTrigger } from "ios-haptics";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "@/app/components/layout/PageHeader";
import { toast } from "sonner";
import { AddPersonSheet } from "@/app/components/AddPersonSheet";
import { AddSharedItemSheet } from "@/app/components/AddSharedItemSheet";
import { EditItemSplitSheet } from "@/app/components/EditItemSplitSheet";
import { useCurrentUser } from "@/app/lib/hooks/useCurrentUser";
import { getPersonDisplayName, withDisplayNames } from "@/app/lib/displayName";

// crypto.randomUUID() (rather than an incrementing counter) so ids stay
// unique across Fast Refresh reloads, which reset any module-level counter
// but preserve this component's existing state — a reset counter would
// otherwise start re-issuing ids already in use and collide as React keys.
function tempId() {
  return `temp-${crypto.randomUUID()}`;
}

// Resolves a PersonPicker confirm payload (existingPersonIds + freshly
// picked contacts/typed names/YOU) against the bill's current persons —
// reusing an existing person's id (matched by contactId, currentUser id, or
// case-insensitive name) instead of minting a duplicate person for someone
// already added earlier in this session. Without this, re-picking an
// already-in-bill contact across multiple item-split edits would create a
// second person row for the same real person, inflating grandTotal and
// breaking name lookups (splitWithLabel etc. would find the "wrong" id).
function resolvePersonSelection(
  persons,
  currentUser,
  { existingPersonIds, contacts: selectedContacts, newNames, includeYou }
) {
  const personIds = [...existingPersonIds];
  const newPersons = [];

  function findExisting(predicate) {
    return persons.find(predicate) ?? newPersons.find(predicate);
  }

  for (const contact of selectedContacts) {
    const existing = findExisting((p) => p.contactId === contact.id);
    if (existing) {
      personIds.push(existing.id);
      continue;
    }
    const newPerson = {
      id: tempId(),
      name: contact.name,
      contactId: contact.id,
      userId: null,
      items: [{ id: tempId(), name: "", price: "", note: "" }],
    };
    newPersons.push(newPerson);
    personIds.push(newPerson.id);
  }

  for (const name of newNames) {
    const trimmed = name.trim().toLowerCase();
    const existing = findExisting((p) => p.name.trim().toLowerCase() === trimmed);
    if (existing) {
      personIds.push(existing.id);
      continue;
    }
    const newPerson = {
      id: tempId(),
      name,
      contactId: null,
      userId: null,
      items: [{ id: tempId(), name: "", price: "", note: "" }],
    };
    newPersons.push(newPerson);
    personIds.push(newPerson.id);
  }

  if (includeYou && currentUser) {
    const existing = findExisting((p) => p.userId === currentUser.id);
    if (existing) {
      personIds.push(existing.id);
    } else {
      const newPerson = {
        id: tempId(),
        name: currentUser.name,
        contactId: null,
        userId: currentUser.id,
        items: [{ id: tempId(), name: "", price: "", note: "" }],
      };
      newPersons.push(newPerson);
      personIds.push(newPerson.id);
    }
  }

  return { personIds: [...new Set(personIds)], newPersons };
}

// Same "Split with X and Y" label as the scan flow's AssignItemsPage, just
// adapted to this page's sharedItems shape (personIds instead of assignedTo).
function splitWithLabel(item, persons, currentPersonId, currentUserId) {
  const others = item.personIds
    .filter((id) => id !== currentPersonId)
    .map((id) => {
      const person = persons.find((p) => p.id === id);
      return person ? getPersonDisplayName(person, currentUserId) : "someone";
    });

  if (others.length === 0) return null;
  if (others.length <= 2) return `Split with ${others.join(" and ")}`;
  return `Split with ${others[0]}, ${others[1]} +${others.length - 2}`;
}

export default function NewBillPage() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const [mounted, setMounted] = useState(false);
  const [billName, setBillName] = useState("Bill 1");
  const [isEditingBillName, setIsEditingBillName] = useState(false);
  const [draftBillName, setDraftBillName] = useState("Bill 1");
  // Starts empty — currentUser resolves asynchronously, so the default YOU
  // card is seeded by the effect below once it's available, rather than
  // synchronously here.
  const [persons, setPersons] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [addPersonSheetOpen, setAddPersonSheetOpen] = useState(false);
  const [sharedItems, setSharedItems] = useState([]);
  const [sharedItemSheetOpen, setSharedItemSheetOpen] = useState(false);
  const [editSplitTarget, setEditSplitTarget] = useState(null);
  const [removePersonId, setRemovePersonId] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Seed a default "YOU" person once currentUser resolves — but only once,
  // and only if nothing was added in the meantime (e.g. the user opened the
  // Add Person sheet before currentUser finished loading).
  const hasSeededYou = useRef(false);
  useEffect(() => {
    if (hasSeededYou.current || !currentUser) return;
    hasSeededYou.current = true;
    setPersons((prev) =>
      prev.length === 0
        ? [
            {
              id: tempId(),
              name: currentUser.name,
              contactId: null,
              userId: currentUser.id,
              items: [{ id: tempId(), name: "", price: "", note: "" }],
            },
          ]
        : prev
    );
  }, [currentUser]);

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

  // ── Bill name editing ──
  function startEditingBillName() {
    setDraftBillName(billName);
    setIsEditingBillName(true);
  }

  function saveBillName() {
    const trimmed = draftBillName.trim();
    setBillName(trimmed || "Bill 1");
    setIsEditingBillName(false);
  }

  // ── Person management ──
  function openAddPersonSheet() {
    setAddPersonSheetOpen(true);
  }

  function handleAddPersonConfirm({ contacts: selectedContacts, newNames, includeYou }) {
    let newPerson;
    let existingMatch;

    if (includeYou && currentUser) {
      existingMatch = persons.find((p) => p.userId === currentUser.id);
      newPerson = { name: currentUser.name, contactId: null, userId: currentUser.id };
    } else if (selectedContacts.length > 0) {
      existingMatch = persons.find((p) => p.contactId === selectedContacts[0].id);
      newPerson = { name: selectedContacts[0].name, contactId: selectedContacts[0].id, userId: null };
    } else if (newNames.length > 0) {
      const trimmed = newNames[0].trim().toLowerCase();
      existingMatch = persons.find((p) => p.name.trim().toLowerCase() === trimmed);
      newPerson = { name: newNames[0], contactId: null, userId: null };
    } else {
      setAddPersonSheetOpen(false);
      return;
    }

    // Already on the bill (added earlier this session) — reuse them rather
    // than minting a duplicate person for the same real person.
    if (existingMatch) {
      toast.error(
        `${getPersonDisplayName(existingMatch, currentUser?.id)} is already on this bill.`
      );
      setAddPersonSheetOpen(false);
      return;
    }

    setPersons((prev) => [
      ...prev,
      {
        id: tempId(),
        ...newPerson,
        items: [{ id: tempId(), name: "", price: "", note: "" }],
      },
    ]);
    setAddPersonSheetOpen(false);
  }

  // Drops a person and cleans up any shared items they were part of — same
  // filter-then-drop-if-empty logic as removeShare, since leaving orphaned
  // personIds behind would silently inflate the remaining participants'
  // calculated shares.
  function removePersonAndCleanup(personId) {
    setPersons((prev) => prev.filter((p) => p.id !== personId));
    setSharedItems((prev) =>
      prev
        .map((item) =>
          item.personIds.includes(personId)
            ? { ...item, personIds: item.personIds.filter((id) => id !== personId) }
            : item
        )
        .filter((item) => item.personIds.length > 0)
    );
  }

  // A person with real data (a valid individual item, or a share of a
  // shared item) gets a confirmation before their items are deleted along
  // with them — an empty/unused person card is removed immediately, same
  // as before.
  function removePerson(personId) {
    const person = persons.find((p) => p.id === personId);
    if (!person) return;

    const hasValidItems = person.items.some(
      (i) => i.name.trim() && parseFloat(i.price) > 0
    );
    const hasSharedParticipation = sharedItems.some((i) =>
      i.personIds.includes(personId)
    );

    if (!hasValidItems && !hasSharedParticipation) {
      removePersonAndCleanup(personId);
      return;
    }

    setRemovePersonId(personId);
    setSheetMode("removePerson");
    setSheetOpen(true);
  }

  function handleConfirmRemovePerson() {
    if (!removePersonId) return;
    removePersonAndCleanup(removePersonId);
    setSheetOpen(false);
    setRemovePersonId(null);
  }

  // ── Shared item management ──
  function openSharedItemSheet() {
    setSharedItemSheetOpen(true);
  }

  function handleAddSharedItem({
    name,
    price,
    existingPersonIds,
    contacts: selectedContacts,
    newNames,
    includeYou,
  }) {
    const { personIds, newPersons } = resolvePersonSelection(persons, currentUser, {
      existingPersonIds,
      contacts: selectedContacts,
      newNames,
      includeYou,
    });

    if (newPersons.length > 0) {
      setPersons((prev) => [...prev, ...newPersons]);
    }

    setSharedItems((prev) => [...prev, { id: tempId(), name, price, personIds }]);
    setSharedItemSheetOpen(false);
  }

  // Removes just one person from a shared item's split — mirrors the scan
  // flow's handleRemoveShare. If that leaves no one on it, drop the item
  // entirely (unlike the scan flow, there's no "unassigned" bucket here to
  // fall back to). Lightweight undo via a toast action rather than a
  // confirmation dialog — losing a split is cheap to recover from, unlike
  // removePerson's "their items get deleted" stakes.
  function removeShare(itemId, personId) {
    const item = sharedItems.find((i) => i.id === itemId);
    if (!item) return;

    const wasLastPerson = item.personIds.length <= 1;
    const person = persons.find((p) => p.id === personId);
    const personName = person ? getPersonDisplayName(person, currentUser?.id) : "";

    setSharedItems((prev) =>
      prev
        .map((i) =>
          i.id === itemId
            ? { ...i, personIds: i.personIds.filter((id) => id !== personId) }
            : i
        )
        .filter((i) => i.personIds.length > 0)
    );

    toast(`Removed "${item.name || "Item"}" from ${personName || "their"} split`, {
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          setSharedItems((prev) => {
            const stillThere = prev.find((i) => i.id === itemId);
            if (stillThere) {
              if (stillThere.personIds.includes(personId)) return prev;
              return prev.map((i) =>
                i.id === itemId
                  ? { ...i, personIds: [...i.personIds, personId] }
                  : i
              );
            }
            // The item was dropped entirely because this was its last
            // person — restore it whole rather than re-adding a person to
            // an item that no longer exists.
            return wasLastPerson ? [...prev, item] : prev;
          });
        },
      },
    });
  }

  // ── Edit an item's split (chevron on an item row or a shared item row) ──
  function openEditSplitForItem(item, person) {
    setEditSplitTarget({
      item: {
        id: item.id,
        name: item.name,
        price: parseFloat(item.price) || 0,
        note: item.note,
      },
      initialPersonIds: [person.id],
    });
  }

  function openEditSplitForSharedItem(item) {
    setEditSplitTarget({
      item: { id: item.id, name: item.name, price: item.price, note: "" },
      initialPersonIds: item.personIds,
    });
  }

  // Moves the target item into a single person's items array (exactly one
  // person selected) or into sharedItems (more than one) — removing it from
  // wherever it currently lives first, so this works for both directions:
  // converting a regular item into a shared one, and converting an
  // already-shared item back down to a single owner. Mirrors the scan
  // flow's handleAssignCommit: the picker can also introduce people who
  // aren't on the bill yet (from contacts, typed fresh, or YOU), which get
  // created here alongside reassigning the item.
  //
  // item.price is always carried through unchanged — it's the item's fixed
  // total, never recalculated off however many people end up sharing it.
  // Each participant's share is a derived, display-time-only value
  // (price / personIds.length) computed where it's shown, never stored.
  function handleEditSplitConfirm({
    existingPersonIds,
    contacts: selectedContacts,
    newNames,
    includeYou,
  }) {
    const { item } = editSplitTarget;

    const { personIds: selectedIds, newPersons } = resolvePersonSelection(
      persons,
      currentUser,
      { existingPersonIds, contacts: selectedContacts, newNames, includeYou }
    );

    if (newPersons.length > 0) {
      setPersons((prev) => [...prev, ...newPersons]);
    }

    setPersons((prev) =>
      prev.map((p) => ({ ...p, items: p.items.filter((i) => i.id !== item.id) }))
    );
    setSharedItems((prev) => prev.filter((i) => i.id !== item.id));

    if (selectedIds.length > 1) {
      setSharedItems((prev) => [
        ...prev,
        { id: item.id, name: item.name, price: item.price, personIds: selectedIds },
      ]);
    } else {
      const [onlyId] = selectedIds;
      setPersons((prev) =>
        prev.map((p) =>
          p.id === onlyId
            ? {
                ...p,
                items: [
                  ...p.items,
                  {
                    id: item.id,
                    name: item.name,
                    price: String(item.price),
                    note: item.note ?? "",
                  },
                ],
              }
            : p
        )
      );
    }

    setEditSplitTarget(null);
  }

  // ── Item management ──
  function addItem(personId) {
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

  // Lightweight undo via a toast action rather than a confirmation dialog —
  // an individual item is quick to re-type, so it doesn't need the same
  // "are you sure" gate as removePerson.
  function removeItem(personId, itemId) {
    const person = persons.find((p) => p.id === personId);
    const itemIndex = person ? person.items.findIndex((i) => i.id === itemId) : -1;
    const removedItem = itemIndex > -1 ? person.items[itemIndex] : null;

    setPersons((prev) =>
      prev.map((p) =>
        p.id === personId
          ? { ...p, items: p.items.filter((i) => i.id !== itemId) }
          : p
      )
    );

    if (!removedItem) return;

    toast(`Removed "${removedItem.name || "Item"}"`, {
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          setPersons((prev) =>
            prev.map((p) => {
              if (p.id !== personId) return p;
              if (p.items.some((i) => i.id === itemId)) return p;
              const items = [...p.items];
              items.splice(Math.min(itemIndex, items.length), 0, removedItem);
              return { ...p, items };
            })
          );
        },
      },
    });
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
  // Includes this person's share of any sharedItems they're part of — a
  // shared item's full price is only counted once overall since each
  // participant's share already sums back up to it (price / personIds.length
  // times personIds.length), so grandTotal below doesn't need to add
  // sharedItems separately.
  function personSubtotal(person) {
    const individualTotal = person.items.reduce(
      (sum, item) => sum + (parseFloat(item.price) || 0),
      0
    );
    const sharedTotal = sharedItems
      .filter((i) => i.personIds.includes(person.id))
      .reduce((sum, i) => sum + i.price / i.personIds.length, 0);
    return individualTotal + sharedTotal;
  }

  const grandTotal = persons.reduce((sum, p) => sum + personSubtotal(p), 0);

  // Stats for the "Remove [name]?" confirmation sheet — re-derived from live
  // state via the stored id rather than a snapshot, so they can't go stale.
  const removePersonTarget = persons.find((p) => p.id === removePersonId) ?? null;
  const removePersonItemCount = removePersonTarget
    ? removePersonTarget.items.filter(
        (i) => i.name.trim() && parseFloat(i.price) > 0
      ).length +
      sharedItems.filter((i) => i.personIds.includes(removePersonTarget.id)).length
    : 0;
  const removePersonAmount = removePersonTarget
    ? personSubtotal(removePersonTarget)
    : 0;

  const availableContacts = contacts.filter(
    (contact) => !persons.some((p) => p.contactId === contact.id)
  );
  const showYou =
    Boolean(currentUser) && !persons.some((p) => p.userId === currentUser.id);

  // A person with no individual items is still fine if they're a
  // participant in a shared item — otherwise item_shares would have nothing
  // to point at for them. Same set used by handleConfirmSave below, so the
  // "does this person have something assigned" rule lives in one place.
  const personIdsInSharedItems = new Set(sharedItems.flatMap((i) => i.personIds));
  function personHasNoItems(person) {
    return (
      !person.items.some((i) => i.name.trim() && parseFloat(i.price) > 0) &&
      !personIdsInSharedItems.has(person.id)
    );
  }

  // ── Validation — at least 1 person with at least 1 named, priced item, or
  // at least 1 shared item (which is always valid — name/price/participants
  // are all required to confirm the Add Shared Item sheet) — and every
  // person on the bill has something assigned to them ──
  const hasValidItem =
    (persons.some((p) =>
      p.items.some((i) => i.name.trim() && parseFloat(i.price) > 0)
    ) ||
      sharedItems.length > 0) &&
    !persons.some(personHasNoItems);

  // ── Save flow ──
  function handleReviewTap() {
    const personWithNoItems = persons.find(personHasNoItems);
    if (personWithNoItems) {
      toast.error(
        `${getPersonDisplayName(personWithNoItems, currentUser?.id)} has no items assigned — remove them or assign something first.`
      );
      return;
    }
    if (!hasValidItem) {
      toast.error("Add at least one item before continuing.");
      return;
    }
    setSheetMode("review");
    setSheetOpen(true);
  }

  async function handleConfirmSave() {
    setIsSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You need to be signed in.");
      setIsSaving(false);
      return;
    }

    // 1. Create the bill
    const { data: bill, error: billError } = await supabase
      .from("bills")
      .insert({ name: billName, user_id: user.id })
      .select()
      .single();

    if (billError || !bill) {
      toast.error("Couldn't save the bill. Please try again.");
      setIsSaving(false);
      return;
    }

    // 2. Create persons + their individual items. A person with no valid
    // individual items is still created if they're a participant in a
    // shared item below — otherwise item_shares would have nothing to
    // point at for them. (personIdsInSharedItems computed above, alongside
    // hasValidItem.)
    const personIdMap = new Map();

    for (const person of persons) {
      const validItems = person.items.filter(
        (i) => i.name.trim() && parseFloat(i.price) > 0
      );
      const hasSharedParticipation = personIdsInSharedItems.has(person.id);
      if (!person.name.trim() || (validItems.length === 0 && !hasSharedParticipation))
        continue;

      const { data: createdPerson, error: personError } = await supabase
        .from("persons")
        .insert({
          name: person.name.trim(),
          bill_id: bill.id,
          contact_id: person.contactId ?? null,
          user_id: person.userId ?? null,
        })
        .select()
        .single();

      if (personError || !createdPerson) continue;
      personIdMap.set(person.id, createdPerson.id);

      if (validItems.length > 0) {
        const itemsToInsert = validItems.map((i) => ({
          name: i.name.trim(),
          price: parseFloat(i.price),
          note: i.note?.trim() || null,
          person_id: createdPerson.id,
        }));

        await supabase.from("items").insert(itemsToInsert);
      }
    }

    // 3. Create shared items — person_id gets the first assignee (same RLS
    // requirement as the scan flow), item_shares records every assignee.
    for (const sharedItem of sharedItems) {
      const realAssigneeIds = sharedItem.personIds
        .map((localId) => personIdMap.get(localId))
        .filter(Boolean);

      if (realAssigneeIds.length === 0) continue;

      const { data: createdItem, error: itemError } = await supabase
        .from("items")
        .insert({
          name: sharedItem.name,
          price: sharedItem.price,
          person_id: realAssigneeIds[0],
        })
        .select()
        .single();

      if (itemError || !createdItem) continue;

      if (realAssigneeIds.length > 1) {
        await supabase.from("item_shares").insert(
          realAssigneeIds.map((personId) => ({
            item_id: createdItem.id,
            person_id: personId,
          }))
        );
      }
    }

    setSheetOpen(false);
    router.push(`/receipt?id=${bill.id}`, { transitionTypes: ["nav-forward"] });
  }

  const [sheetMode, setSheetMode] = useState(null); // 'review' | 'abandon' | 'removePerson' | null

  // The default YOU card always has a name, so name presence no longer
  // signals user-entered progress — more than the single default person, or
  // an actual item typed, does.
  const hasUnsavedProgress =
    persons.length > 1 ||
    sharedItems.length > 0 ||
    persons.some((p) => p.items.some((i) => i.name.trim()));

  function handleCancelTap() {
    if (!hasUnsavedProgress) {
      router.push("/dashboard", { transitionTypes: ["nav-back"] });
      return;
    }
    setSheetMode("abandon");
    setSheetOpen(true);
  }

  function handleConfirmAbandon() {
    router.push("/dashboard", { transitionTypes: ["nav-back"] });
  }

  return (
    <>
      <DesktopGuard />
      <ViewTransition
        enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
        exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
        default="none"
      >
      <Page className="bg-backgroud">
        <PageContent className="px-0" withBottomNav={false}>
          <div className="flex flex-col w-full gap-5">
            {/* Header — fixed at top */}
            <PageHeader onBack={handleCancelTap}>
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
                  ref={hapticTrigger}
                  onClick={startEditingBillName}
                  className="flex items-center gap-1.5 min-w-0 flex-1 justify-center"
                >
                  <p className="text-base font-semibold text-white truncate">
                    {billName}
                  </p>
                  <PencilIcon className="w-3.5 stroke-white/70 shrink-0" />
                </button>
              )}
            </PageHeader>

            {/* Spacer so content doesn't sit under the fixed header */}
            <div className="h-23.5" />

            <div className="max-w-xl mx-auto w-full px-4 flex flex-col gap-4 pb-32 -mt-5">
              {/* Person cards */}
              <AnimatePresence initial={false}>
                {persons.map((person) => (
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
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide truncate">
                          {getPersonDisplayName(person, currentUser?.id)}
                        </p>
                      </div>
                      {persons.length > 1 && (
                        <button
                          ref={hapticTrigger}
                          onClick={() => removePerson(person.id)}
                          className="shrink-0"
                        >
                          <TrashIcon className="w-4 text-text-secondary/50" />
                        </button>
                      )}
                    </div>

                    {/* Items */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-text-secondary">
                        Orders
                      </label>
                      <div className="flex flex-col gap-2">
                        <AnimatePresence initial={false}>
                          {sharedItems
                            .filter((item) => item.personIds.includes(person.id))
                            .map((item) => {
                              const note = splitWithLabel(
                                item,
                                persons,
                                person.id,
                                currentUser?.id
                              );
                              const share = item.price / item.personIds.length;

                              return (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.96 }}
                                  transition={{ duration: 0.2, ease: "easeOut" }}
                                  onClick={() => openEditSplitForSharedItem(item)}
                                  className="border border-black/10 rounded-xl p-2.5 flex flex-col gap-2 cursor-pointer transition-colors duration-150 active:bg-black/5"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-medium truncate min-w-0 flex-1">
                                      {item.name}
                                    </p>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <p className="text-sm font-semibold text-orange">
                                        ₱{share.toFixed(2)}
                                      </p>
                                      <button
                                        ref={hapticTrigger}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeShare(item.id, person.id);
                                        }}
                                      >
                                        <TrashIcon className="w-3.5 text-text-secondary/40" />
                                      </button>
                                      <ChevronRightIcon className="w-4 text-text-secondary/40" />
                                    </div>
                                  </div>

                                  {note && (
                                    <p className="text-xs text-text-secondary truncate bg-black/2 rounded-lg px-2 py-1.5">
                                      {note}
                                    </p>
                                  )}
                                </motion.div>
                              );
                            })}
                          {person.items.map((item) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.96 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              onClick={() => openEditSplitForItem(item, person)}
                              className="border border-black/10 rounded-xl p-2.5 flex flex-col gap-2 cursor-pointer transition-colors duration-150 active:bg-black/5"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  value={item.name}
                                  onClick={(e) => e.stopPropagation()}
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
                                    onClick={(e) => e.stopPropagation()}
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
                                    ref={hapticTrigger}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeItem(person.id, item.id);
                                    }}
                                    className="shrink-0"
                                  >
                                    <TrashIcon className="w-3.5 text-text-secondary/40" />
                                  </button>
                                )}
                                <ChevronRightIcon className="w-4 text-text-secondary/40 shrink-0" />
                              </div>

                              <input
                                value={item.note}
                                onClick={(e) => e.stopPropagation()}
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
                        ref={hapticTrigger}
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
                        {getPersonDisplayName(person, currentUser?.id).trim() ||
                          "This person"}
                        's total
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
                ref={hapticTrigger}
                onClick={openAddPersonSheet}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-orange/40 text-orange text-sm font-semibold bg-orange-tint/40 transition-all duration-150 active:scale-95"
              >
                <UserCircleIcon className="w-4" />
                Add another person
              </button>

              {/* Add shared item */}
              <button
                onClick={openSharedItemSheet}
                disabled={persons.length === 0}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-orange/40 text-orange text-sm font-semibold bg-orange-tint/40 transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                <PlusIcon className="w-4" />
                Add shared item
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
                Review & Share
              </button>
            </div>
          </div>
        </PageContent>
      </Page>
      </ViewTransition>

      {/* Confirmation bottom sheet — same pattern as onboarding sign-up sheet */}
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
                          Double-check before sharing
                        </p>
                        <p className="text-text-secondary text-sm max-w-60">
                          {persons.length} people
                          · ₱{grandTotal.toFixed(2)} total. Make sure names
                          and amounts are correct.
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
                          {isSaving ? "Saving..." : "Yes, continue"}
                        </button>
                        <button
                          className="text-text-secondary font-body text-xs"
                          disabled={isSaving}
                          onClick={() => {
                            setSheetOpen(false);
                          }}
                        >
                          Let me check again
                        </button>
                      </div>
                    </>
                  ) : sheetMode === "removePerson" ? (
                    <>
                      <div className="flex flex-col gap-1 items-center text-center">
                        <p className="font-display text-xl font-bold">
                          Remove{" "}
                          {removePersonTarget
                            ? getPersonDisplayName(removePersonTarget, currentUser?.id)
                            : "this person"}
                          ?
                        </p>
                        <p className="text-text-secondary text-sm max-w-60">
                          Their items ({removePersonItemCount} item(s), ₱
                          {removePersonAmount.toFixed(2)}) will be deleted too.
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 w-full items-center max-w-xl">
                        <button
                          ref={hapticTrigger}
                          onClick={handleConfirmRemovePerson}
                          className="flex flex-row items-center justify-center w-full transition-all duration-200 ease-in-out hover:opacity-90 active:scale-95 rounded-2xl py-4 gap-2 font-bold text-white font-body"
                          style={{
                            background:
                              "linear-gradient(to bottom, #2a2a2a, #1a1a1a)",
                            borderBottom: "1.5px solid #0a0a0a",
                          }}
                        >
                          Yes, remove
                        </button>
                        <button
                          ref={hapticTrigger}
                          className="text-text-secondary font-body text-xs"
                          onClick={() => {
                            setSheetOpen(false);
                            setRemovePersonId(null);
                          }}
                        >
                          No, keep them
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1 items-center text-center">
                        <p className="font-display text-xl font-bold">
                          Abandon this bill?
                        </p>
                        <p className="text-text-secondary text-sm max-w-60">
                          Your progress won't be saved. Are you sure you want
                          to leave?
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 w-full items-center max-w-xl">
                        <button
                          ref={hapticTrigger}
                          onClick={handleConfirmAbandon}
                          className="flex flex-row items-center justify-center w-full transition-all duration-200 ease-in-out hover:opacity-90 active:scale-95 rounded-2xl py-4 gap-2 font-bold text-white font-body"
                          style={{
                            background:
                              "linear-gradient(to bottom, #2a2a2a, #1a1a1a)",
                            borderBottom: "1.5px solid #0a0a0a",
                          }}
                        >
                          Yes, abandon
                        </button>
                        <button
                          ref={hapticTrigger}
                          className="text-text-secondary font-body text-xs"
                          onClick={() => setSheetOpen(false)}
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

      {addPersonSheetOpen && (
        <AddPersonSheet
          persons={withDisplayNames(persons, currentUser?.id)}
          contacts={availableContacts}
          currentUser={currentUser}
          showYou={showYou}
          onAdd={handleAddPersonConfirm}
          onClose={() => setAddPersonSheetOpen(false)}
        />
      )}

      {sharedItemSheetOpen && (
        <AddSharedItemSheet
          persons={withDisplayNames(persons, currentUser?.id)}
          contacts={availableContacts}
          currentUser={currentUser}
          showYou={showYou}
          onAdd={handleAddSharedItem}
          onClose={() => setSharedItemSheetOpen(false)}
        />
      )}

      {editSplitTarget && (
        <EditItemSplitSheet
          key={editSplitTarget.item.id}
          item={editSplitTarget.item}
          persons={withDisplayNames(persons, currentUser?.id)}
          contacts={availableContacts}
          currentUser={currentUser}
          showYou={showYou}
          initialPersonIds={editSplitTarget.initialPersonIds}
          onConfirm={handleEditSplitConfirm}
          onClose={() => setEditSplitTarget(null)}
        />
      )}
    </>
  );
}