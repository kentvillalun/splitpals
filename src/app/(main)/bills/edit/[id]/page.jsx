"use client";

import { useState, useEffect, useRef, ViewTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import { createPortal } from "react-dom";
import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { PageContent } from "@/app/components/layout/PageContent";
import { supabase } from "@/app/lib/supabase";
import { hapticTrigger } from "ios-haptics";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { AddPersonSheet } from "@/app/components/AddPersonSheet";
import { AddSharedItemSheet } from "@/app/components/AddSharedItemSheet";
import { AddItemSheet } from "@/app/components/AddItemSheet";
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
      items: [],
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
      items: [],
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
        items: [],
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

export default function EditBillPage() {
  const router = useRouter();
  const { id: billId } = useParams();
  const currentUser = useCurrentUser();
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
  const [contacts, setContacts] = useState([]);
  const [addPersonSheetOpen, setAddPersonSheetOpen] = useState(false);
  const [sharedItems, setSharedItems] = useState([]);
  // Items that lost their only owner land here instead of being deleted
  // outright — same "Unassigned" bucket as the scan flow's AssignItemsPage.
  // A shared item can only ever get here in two steps: the edit sheet first
  // shrinks it down to one remaining person (converting it to that person's
  // individual item — see handleEditSplitConfirm, which can never confirm
  // down to zero people since the picker disables its own confirm button at
  // that point), then removeItem parks it here if that individual item is
  // later removed too. Save/Review stays blocked while anything is in here,
  // so an unassigned item never needs to be persisted (see hasValidItem) —
  // this never needs to be seeded from the loaded bill, since a DB item can
  // never actually exist with no assignee (items.person_id has to resolve
  // through RLS's persons → bills → user_id join).
  const [unassignedItems, setUnassignedItems] = useState([]);
  const [sharedItemSheetOpen, setSharedItemSheetOpen] = useState(false);
  // Drives AddItemSheet (name/price only, no person-picker) — either
  // { personId, item: null } for "Add item" (creating a new one), or
  // { personId, item } for tapping an existing SOLO item's row: its owner is
  // already fixed by which card it's in, so it stays the simple sheet too.
  // A shared item's row uses editSplitTarget/the full sheet instead, since
  // reassignment is genuinely on the table there.
  const [simpleItemTarget, setSimpleItemTarget] = useState(null);
  const [editSplitTarget, setEditSplitTarget] = useState(null);
  const [removePersonId, setRemovePersonId] = useState(null);

  const [sheetMode, setSheetMode] = useState(null); // 'review' | 'abandon' | 'removePerson' | null
  const [sheetOpen, setSheetOpen] = useState(false);
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

  // ── Load existing bill ──
  useEffect(() => {
    async function loadBill() {
      setIsLoading(true);
      setLoadError(false);

      const { data: bill, error } = await supabase
        .from("bills")
        .select(
          `id, name, persons (id, name, is_paid, contact_id, user_id, items (id, name, price, note, item_shares(person_id)))`
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

      // An item with 2+ item_shares rows is genuinely shared — it's nested
      // here under its "owner" person only (items.person_id, the first
      // assignee — see the save flow's step 5 comment), so it's pulled out
      // into loadedSharedItems instead of that person's individual items.
      // Without this split, a previously-shared item would load as a plain
      // single-owner item, and saving the bill again would then delete its
      // real item_shares rows via the individual-item cleanup below,
      // silently destroying the split.
      const loadedSharedItems = [];

      const loadedPersons = (bill.persons ?? []).map((p) => {
        const individualItems = [];

        for (const i of p.items ?? []) {
          const sharerIds = (i.item_shares ?? []).map((s) => s.person_id);
          if (sharerIds.length > 1) {
            loadedSharedItems.push({
              id: i.id,
              name: i.name,
              price: i.price,
              personIds: sharerIds,
            });
            continue;
          }
          individualItems.push({
            id: i.id,
            name: i.name,
            price: String(i.price),
            note: i.note ?? "",
          });
        }

        return {
          id: p.id,
          name: p.name,
          isPaid: p.is_paid,
          contactId: p.contact_id ?? null,
          userId: p.user_id ?? null,
          // No forced blank starter row here — a person whose only real
          // items are shared ones (or who genuinely has nothing yet) just
          // gets an empty individual-items array. "Add item" can always
          // create a fresh row on demand, same reasoning as the trash icon
          // no longer being hidden on a person's last item.
          items: individualItems,
        };
      });

      setPersons(loadedPersons);
      setSharedItems(loadedSharedItems);
      setOriginalPersonIds(loadedPersons.map((p) => p.id));
      setOriginalItemIds([
        ...loadedPersons.flatMap((p) => p.items.map((i) => i.id)),
        ...loadedSharedItems.map((i) => i.id),
      ]);

      setIsLoading(false);
    }

    if (billId) loadBill();
  }, [billId]);

  // Seed a default "YOU" person for the empty-bill edge case only — a bill
  // that loaded with zero persons (e.g. one abandoned before any were
  // added). Bills that already have real persons are left exactly as
  // loaded. Deferred to its own effect (rather than done inline in loadBill)
  // because currentUser resolves asynchronously via useCurrentUser and may
  // not be ready yet when the bill finishes loading.
  const hasSeededYou = useRef(false);
  useEffect(() => {
    if (hasSeededYou.current || isLoading) return;
    if (persons.length > 0) {
      hasSeededYou.current = true;
      return;
    }
    if (!currentUser) return;
    hasSeededYou.current = true;
    setPersons([
      {
        id: tempId(),
        name: currentUser.name,
        contactId: null,
        userId: currentUser.id,
        items: [],
      },
    ]);
  }, [isLoading, persons.length, currentUser]);

  // ── Bill name editing ──
  function startEditingBillName() {
    setDraftBillName(billName);
    setIsEditingBillName(true);
  }

  function saveBillName() {
    const trimmed = draftBillName.trim();
    setBillName(trimmed || billName);
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
        items: [],
      },
    ]);
    setAddPersonSheetOpen(false);
  }

  // Drops a person and cleans up any shared items they were part of. A shared
  // item that still has 2+ people left just shrinks its personIds. One that
  // drops to a single remaining person is converted to that person's
  // individual item (same convention as handleEditSplitConfirm below) rather
  // than being left alive in sharedItems at its full, unsplit price — leaving
  // it there would silently double the remaining person's total once a new
  // item is added later. One that drops to zero remaining people really is
  // gone (this person's removal is an explicit, confirmed deletion — see
  // removePerson below — unlike removeItem, which parks a removed individual
  // item in Unassigned instead of deleting it outright).
  function removePersonAndCleanup(personId) {
    const orphanedToSingle = sharedItems
      .filter((item) => item.personIds.includes(personId))
      .map((item) => ({
        item,
        remainingIds: item.personIds.filter((id) => id !== personId),
      }))
      .filter(({ remainingIds }) => remainingIds.length === 1);

    setPersons((prev) => prev.filter((p) => p.id !== personId));
    setSharedItems((prev) =>
      prev
        .map((item) =>
          item.personIds.includes(personId)
            ? { ...item, personIds: item.personIds.filter((id) => id !== personId) }
            : item
        )
        .filter((item) => item.personIds.length > 1)
    );

    for (const { item, remainingIds } of orphanedToSingle) {
      const [onlyId] = remainingIds;
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
                    note: "",
                  },
                ],
              }
            : p
        )
      );
    }
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

  // ── Edit an item's split (chevron on a shared item row) ──
  function openEditSplitForSharedItem(item) {
    setEditSplitTarget({
      item: { id: item.id, name: item.name, price: item.price, note: "" },
      initialPersonIds: item.personIds,
    });
  }

  function openEditSplitForUnassignedItem(item) {
    setEditSplitTarget({
      item: { id: item.id, name: item.name, price: item.price, note: "" },
      initialPersonIds: [],
    });
  }

  // No confirmation dialog — matches removeItem's "lightweight undo" pattern,
  // since an unassigned item has no one relying on it yet.
  function removeUnassignedItem(itemId) {
    const removedItem = unassignedItems.find((i) => i.id === itemId);
    if (!removedItem) return;

    setUnassignedItems((prev) => prev.filter((i) => i.id !== itemId));

    toast(`Removed "${removedItem.name || "Item"}"`, {
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          setUnassignedItems((prev) =>
            prev.some((i) => i.id === itemId) ? prev : [...prev, removedItem]
          );
        },
      },
    });
  }

  // Moves the target item into a single person's items array (exactly one
  // person selected) or into sharedItems (more than one) — removing it from
  // wherever it currently lives first, so this works for both directions:
  // converting a regular item into a shared one, and converting an
  // already-shared item back down to a single owner. The item keeps its own
  // id throughout (real DB id or temp id alike) so the save flow below can
  // tell an existing item apart from a brand new one regardless of which
  // array it currently sits in. Mirrors the scan flow's handleAssignCommit:
  // the picker can also introduce people who aren't on the bill yet (from
  // contacts, typed fresh, or YOU), which get created here alongside
  // reassigning the item.
  //
  // The sheet's own name/price card (EditItemSplitSheet) is the only place a
  // shared item's name or price can be corrected after creation, since a
  // shared item's row only shows a read-only per-person share, not an
  // editable price — so this always uses the sheet's edited name/price
  // rather than the item's original values. price is stored as the item's
  // fixed total either way, never recalculated off however many people end
  // up sharing it — each participant's share is a derived, display-time-only
  // value (price / personIds.length) computed where it's shown, never stored.
  function handleEditSplitConfirm({
    existingPersonIds,
    contacts: selectedContacts,
    newNames,
    includeYou,
    name,
    price,
  }) {
    const { item } = editSplitTarget;
    const finalName = name?.trim() || item.name;
    const finalPrice = Number.isFinite(price) ? price : item.price;

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
    setUnassignedItems((prev) => prev.filter((i) => i.id !== item.id));

    if (selectedIds.length > 1) {
      setSharedItems((prev) => [
        ...prev,
        { id: item.id, name: finalName, price: finalPrice, personIds: selectedIds },
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
                    name: finalName,
                    price: String(finalPrice),
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

  // The sheet's own "Delete" action (person-card items only — see onDelete's
  // wiring below) — a full removal, distinct from unchecking everyone in the
  // picker (which parks the item in Unassigned instead). Lightweight undo
  // via a toast action, same pattern as every other deletion on this page —
  // reads item/initialPersonIds from editSplitTarget via closure before
  // clearing it, so the undo callback still has what it needs afterward.
  function handleDeleteItem() {
    const { item, initialPersonIds } = editSplitTarget;

    setPersons((prev) =>
      prev.map((p) => ({ ...p, items: p.items.filter((i) => i.id !== item.id) }))
    );
    setSharedItems((prev) => prev.filter((i) => i.id !== item.id));
    setUnassignedItems((prev) => prev.filter((i) => i.id !== item.id));
    setEditSplitTarget(null);

    toast(`Removed "${item.name || "Item"}"`, {
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          if (initialPersonIds.length > 1) {
            setSharedItems((prev) =>
              prev.some((i) => i.id === item.id)
                ? prev
                : [
                    ...prev,
                    { id: item.id, name: item.name, price: item.price, personIds: initialPersonIds },
                  ]
            );
          } else {
            const [onlyId] = initialPersonIds;
            setPersons((prev) =>
              prev.map((p) =>
                p.id === onlyId && !p.items.some((i) => i.id === item.id)
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
        },
      },
    });
  }

  // ── Item management ──
  function openAddItemSheet(personId) {
    setSimpleItemTarget({ personId, item: null });
  }

  // A solo item's owner is already fixed by which card it's in — tapping its
  // row (whether freshly blank or already filled in) opens the same simple
  // sheet as "Add item", not the full picker-based one. Only a genuinely
  // shared item's row (openEditSplitForSharedItem) opens the full sheet.
  function openSimpleEditForItem(item, person) {
    setSimpleItemTarget({ personId: person.id, item });
  }

  // The assignee is already fixed by context — AddItemSheet only collects
  // name/price/note, so this either creates a new item directly under that
  // person ("Add item") or updates an existing solo item in place (tapped
  // from its row).
  function handleSimpleItemConfirm({ name, price, note }) {
    const { personId, item } = simpleItemTarget;

    setPersons((prev) =>
      prev.map((p) => {
        if (p.id !== personId) return p;
        if (item) {
          return {
            ...p,
            items: p.items.map((i) =>
              i.id === item.id ? { ...i, name, price: String(price), note } : i
            ),
          };
        }
        return {
          ...p,
          items: [...p.items, { id: tempId(), name, price: String(price), note }],
        };
      })
    );
    setSimpleItemTarget(null);
  }

  // Delete from the simple sheet (existing solo item only — no-op in "Add
  // item" mode since there's nothing to delete yet). Same undo-toast pattern
  // as every other deletion on this page.
  function handleDeleteSimpleItem() {
    const { personId, item } = simpleItemTarget;
    if (!item) return;

    setPersons((prev) =>
      prev.map((p) =>
        p.id === personId
          ? { ...p, items: p.items.filter((i) => i.id !== item.id) }
          : p
      )
    );
    setSimpleItemTarget(null);

    toast(`Removed "${item.name || "Item"}"`, {
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          setPersons((prev) =>
            prev.map((p) =>
              p.id === personId && !p.items.some((i) => i.id === item.id)
                ? { ...p, items: [...p.items, item] }
                : p
            )
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

  // Unassigned items have no owner yet, but their price is still a real part
  // of the bill's total — otherwise the grand total would silently shrink
  // whenever an item lands in Unassigned, then jump back up once assigned.
  const unassignedTotal = unassignedItems.reduce(
    (sum, item) => sum + (parseFloat(item.price) || 0),
    0
  );
  const grandTotal =
    persons.reduce((sum, p) => sum + personSubtotal(p), 0) + unassignedTotal;

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

  const hasValidItem =
    (persons.some((p) =>
      p.items.some((i) => i.name.trim() && parseFloat(i.price) > 0)
    ) ||
      sharedItems.length > 0) &&
    !persons.some(personHasNoItems) &&
    unassignedItems.length === 0;

  const hasUnsavedChanges = true; // always allow exit-confirmation while editing

  // ── Cancel flow ──
  function handleCancelTap() {
    setSheetMode("abandon");
    setSheetOpen(true);
  }

  function handleConfirmAbandon() {
    router.push(`/history/${billId}`, { transitionTypes: ["nav-back"] });
  }

  // ── Save flow ──
  function handleReviewTap() {
    const personWithNoItems = persons.find(personHasNoItems);
    if (personWithNoItems) {
      toast.error(
        `${getPersonDisplayName(personWithNoItems, currentUser?.id)} has no items assigned — remove them or assign something first.`
      );
      return;
    }
    if (unassignedItems.length > 0) {
      toast.error("Assign every item to someone before saving.");
      return;
    }
    if (!hasValidItem) {
      toast.error("Add at least one item before saving.");
      return;
    }
    setSheetMode("review");
    setSheetOpen(true);
  }

  function isTempId(id) {
    return typeof id === "string" && id.startsWith("temp-");
  }

  async function handleConfirmSave() {
    setIsSaving(true);

    // 1. Update bill name
    const { error: billError } = await supabase
      .from("bills")
      .update({ name: billName })
      .eq("id", billId);

    if (billError) {
      toast.error("Couldn't save changes. Please try again.");
      setIsSaving(false);
      return;
    }

    const currentPersonIds = persons.map((p) => p.id).filter((id) => !isTempId(id));
    // Includes sharedItems' ids too — an item converted to shared via the
    // split editor keeps its real id, and would otherwise look deleted here
    // since it's no longer in any person's individual items array.
    const currentItemIds = [
      ...persons.flatMap((p) => p.items.map((i) => i.id)),
      ...sharedItems.map((i) => i.id),
    ].filter((id) => !isTempId(id));

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

    // 4. Upsert persons + items. A person with no valid individual items is
    // still upserted if they're a participant in a shared item below —
    // otherwise item_shares would have nothing to point at for them.
    // (personIdsInSharedItems computed above, alongside hasValidItem.)
    const personIdMap = new Map();

    for (const person of persons) {
      const validItems = person.items.filter(
        (i) => i.name.trim() && parseFloat(i.price) > 0
      );
      const hasSharedParticipation = personIdsInSharedItems.has(person.id);
      if (!person.name.trim() || (validItems.length === 0 && !hasSharedParticipation))
        continue;

      let personId = person.id;

      if (isTempId(person.id)) {
        // new person — insert
        const { data: createdPerson, error: personError } = await supabase
          .from("persons")
          .insert({
            name: person.name.trim(),
            bill_id: billId,
            contact_id: person.contactId ?? null,
            user_id: person.userId ?? null,
          })
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

      personIdMap.set(person.id, personId);

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
          // This item may have previously been converted to a shared item
          // (via the split editor) and back — drop any stale item_shares
          // now that it's single-owner again.
          await supabase.from("item_shares").delete().eq("item_id", item.id);
        }
      }
    }

    // 5. Create or update shared items — person_id gets the first assignee
    // (same RLS requirement as the scan flow), item_shares records every
    // assignee. A shared item added fresh this session has a temp id and is
    // inserted; one converted from an existing single-person item (via the
    // split editor) keeps its real id and is updated in place instead, with
    // its item_shares rows replaced to match the current split.
    for (const sharedItem of sharedItems) {
      const realAssigneeIds = sharedItem.personIds
        .map((localId) => personIdMap.get(localId))
        .filter(Boolean);

      if (realAssigneeIds.length === 0) continue;

      let itemId = sharedItem.id;

      if (isTempId(sharedItem.id)) {
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
        itemId = createdItem.id;
      } else {
        const { error: itemError } = await supabase
          .from("items")
          .update({
            name: sharedItem.name,
            price: sharedItem.price,
            note: null,
            person_id: realAssigneeIds[0],
          })
          .eq("id", itemId);

        if (itemError) continue;

        // Replace any item_shares this item had before this edit.
        await supabase.from("item_shares").delete().eq("item_id", itemId);
      }

      if (realAssigneeIds.length > 1) {
        await supabase.from("item_shares").insert(
          realAssigneeIds.map((personId) => ({
            item_id: itemId,
            person_id: personId,
          }))
        );
      }
    }

    setSheetOpen(false);
    router.push(`/history/${billId}`, { transitionTypes: ["nav-back"] });
  }

  // ── Error state — nothing to show without the bill, so this stays a
  // separate full-page branch. Loading, unlike error, now renders through
  // the same tree as the loaded page (skeletons in place of data) so the
  // header/save button stay put and the nav-forward/nav-back transition has
  // a consistent wrapped tree to animate on every load, not just once data
  // arrives. ──
  if (loadError) {
    return (
      <>
        <DesktopGuard />
        <Page className="bg-backgroud lg:hidden">
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
      <ViewTransition
        enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
        exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
        default="none"
      >
      <Page className="bg-backgroud lg:hidden">
        <PageContent className="px-0" withBottomNav={false}>
          <div className="flex flex-col w-full gap-5">
            {/* Header — fixed at top */}
            <div className="gradient-button w-full px-4 pt-5 pb-6 rounded-b-3xl fixed top-0 left-0 right-0 z-30">
              <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
                <button
                  ref={hapticTrigger}
                  onClick={handleCancelTap}
                  className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors duration-150 shrink-0"
                >
                  <ArrowLeftIcon className="w-4 stroke-white" />
                </button>

                {isLoading ? (
                  <Skeleton
                    width={120}
                    height={16}
                    baseColor="rgba(255,255,255,0.2)"
                    highlightColor="rgba(255,255,255,0.35)"
                  />
                ) : isEditingBillName ? (
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

                <div className="w-8 h-8 shrink-0" />
              </div>
            </div>

            {/* Spacer so content doesn't sit under the fixed header */}
            <div className="h-23.5" />

            <div className="max-w-xl mx-auto w-full px-4 flex flex-col gap-4 pb-32 -mt-5">
              {/* Unassigned */}
              {!isLoading && unassignedItems.length > 0 && (
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
                          <div className="flex flex-col min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {item.name || "Untitled item"}
                            </p>
                            <p className="text-xs text-text-secondary">
                              ₱{Number(item.price || 0).toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              ref={hapticTrigger}
                              onClick={() => openEditSplitForUnassignedItem(item)}
                              className="text-xs font-semibold text-orange bg-orange-tint px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95"
                            >
                              Assign
                            </button>
                            <button
                              ref={hapticTrigger}
                              onClick={() => removeUnassignedItem(item.id)}
                            >
                              <TrashIcon className="w-3.5 text-text-secondary/40" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Person cards */}
              {isLoading ? (
                <div className="flex flex-col gap-4">
                  <Skeleton height={160} className="rounded-2xl" />
                  <Skeleton height={160} className="rounded-2xl" />
                </div>
              ) : (
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
                              onClick={() => openSimpleEditForItem(item, person)}
                              className="border border-black/10 rounded-xl p-2.5 flex flex-col gap-2 cursor-pointer transition-colors duration-150 active:bg-black/5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium truncate min-w-0 flex-1">
                                  {item.name || "Item name"}
                                </p>
                                <div className="flex items-center gap-2 shrink-0">
                                  <p className="text-sm font-semibold text-orange">
                                    ₱{Number(item.price || 0).toFixed(2)}
                                  </p>
                                  <ChevronRightIcon className="w-4 text-text-secondary/40" />
                                </div>
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
                        onClick={() => openAddItemSheet(person.id)}
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
              )}

              {!isLoading && (
                <>
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
                </>
              )}
            </div>
          </div>

          {/* Sticky bottom bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-backgroud px-4 pt-3 pb-6 border-t border-black/4">
            <div className="max-w-xl mx-auto flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  Grand total
                </p>
                {isLoading ? (
                  <Skeleton width={60} height={16} />
                ) : (
                  <p className="font-bold text-base">
                    ₱{grandTotal.toFixed(2)}
                  </p>
                )}
              </div>
              <button
                onClick={handleReviewTap}
                disabled={isLoading || !hasValidItem}
                className="w-full gradient-button py-3.5 rounded-2xl text-white font-semibold text-sm transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                Save changes
              </button>
            </div>
          </div>
        </PageContent>
      </Page>
      </ViewTransition>

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
                          Discard changes?
                        </p>
                        <p className="text-text-secondary text-sm max-w-60">
                          Any edits you made won't be saved. Are you sure you
                          want to leave?
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
                          Yes, discard
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

      {simpleItemTarget && (
        <AddItemSheet
          key={simpleItemTarget.item?.id ?? "new"}
          item={simpleItemTarget.item}
          onAdd={handleSimpleItemConfirm}
          onDelete={simpleItemTarget.item ? handleDeleteSimpleItem : undefined}
          onClose={() => setSimpleItemTarget(null)}
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
          onDelete={
            editSplitTarget.initialPersonIds.length > 0
              ? handleDeleteItem
              : undefined
          }
          onClose={() => setEditSplitTarget(null)}
        />
      )}
    </>
  );
}