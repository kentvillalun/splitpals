"use client";

import { BottomSheet } from "./ui/BottomSheet";
import { PersonPicker } from "./PersonPicker";

/**
 * EditItemSplitSheet — manual entry's chevron-driven split editor. Lets an
 * already-added item (a single person's individual item, or an existing
 * shared item) be reassigned across people on the bill. Mirrors the scan
 * flow's AssignItemSheet exactly — same "In this bill" / "From contacts" /
 * "New person" picker — since correcting who splits an existing item may
 * mean pulling in someone who isn't on the bill yet, not just re-picking
 * among people already there.
 *
 * Props:
 * - item: { id, name, price }
 * - persons: [{ id, name }] — everyone currently on this bill.
 * - contacts: [{ id, name }] — contacts not yet added to this bill.
 * - currentUser: { id, name } | null
 * - showYou: boolean
 * - initialPersonIds: string[] — who's currently assigned (one id for a
 *   regular item, several for an already-shared one).
 * - onConfirm: ({ existingPersonIds, contacts, newNames, includeYou }) => void
 */
export const EditItemSplitSheet = ({
  item,
  persons,
  contacts,
  currentUser,
  showYou,
  initialPersonIds = [],
  onConfirm,
  onClose,
}) => {
  return (
    <BottomSheet setSheetOpen={onClose}>
      <div className="flex flex-col items-start w-full gap-4 font-body">
        <div className="flex flex-col">
          <h1 className="font-display text-text-primary text-xl font-bold">
            Edit split
          </h1>
          <p className="text-text-secondary text-sm">
            {item.name || "Untitled item"} · ₱{Number(item.price || 0).toFixed(2)}
          </p>
        </div>

        <PersonPicker
          persons={persons}
          contacts={contacts}
          currentUser={currentUser}
          showYou={showYou}
          mode="multi"
          confirmLabel="Save split"
          initialPersonIds={initialPersonIds}
          onConfirm={onConfirm}
        />
      </div>
    </BottomSheet>
  );
};
