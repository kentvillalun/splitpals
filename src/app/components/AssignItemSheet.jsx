"use client";

import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { hapticTrigger } from "ios-haptics";
import { BottomSheet } from "./ui/BottomSheet";
import { PersonPicker } from "./PersonPicker";

/**
 * AssignItemSheet — the scan flow's single item editor. Every item row
 * (unassigned, solo, or shared) opens this sheet now; name/price editing no
 * longer happens inline in the row, so this is the only place they can be
 * corrected — same name/price card as manual entry's EditItemSplitSheet.
 *
 * Props:
 * - item: { id, name, price, assignedTo }
 * - persons: [{ id, name }] — everyone currently on this bill.
 * - contacts: [{ id, name }] — contacts not yet added to this bill.
 * - currentUser: { id, name } | null
 * - showYou: boolean
 * - initialPersonIds: string[] — who's currently assigned (empty for
 *   unassigned, one id for solo, several for an already-shared item).
 * - onAssign: ({ existingPersonIds, contacts, newNames, includeYou, name, price }) => void
 * - onDelete: (() => void) | undefined — permanently removes the item
 *   instead of reassigning it. Only passed for a person-card-originated item
 *   (solo or shared) — an unassigned item has no equivalent row-level delete
 *   in this file, so this stays undefined for that entry point.
 */
export const AssignItemSheet = ({
  item,
  persons,
  contacts,
  currentUser,
  showYou,
  onAssign,
  onDelete,
  onClose,
  initialPersonIds = [],
}) => {
  const [name, setName] = useState(item.name || "");
  const [price, setPrice] = useState(item.price ? String(item.price) : "");

  const hasValidItem = name.trim().length > 0 && parseFloat(price) > 0;

  function handleConfirm(selection) {
    onAssign({
      ...selection,
      name: name.trim(),
      price: parseFloat(price),
    });
  }

  return (
    <BottomSheet setSheetOpen={onClose} sheetClassName="pb-0!">
      <div className="flex flex-col items-start w-full gap-4 font-body">
        <div className="flex items-center justify-between w-full">
          <h1 className="font-display text-text-primary text-xl font-bold">
            Assign item
          </h1>
          {onDelete && (
            <button
              ref={hapticTrigger}
              onClick={onDelete}
              className="flex items-center gap-1 text-xs font-semibold text-red-500"
            >
              <TrashIcon className="w-3.5" />
              Delete
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1 w-full">
          <label className="text-xs font-medium text-text-secondary">
            Item name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Family-size fries"
            className="border border-black/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange/40 transition-colors duration-150"
          />
        </div>

        <div className="flex flex-col gap-1 w-full">
          <label className="text-xs font-medium text-text-secondary">
            Total price
          </label>
          <div className="flex items-center gap-1 border border-black/10 rounded-xl px-3 py-2 focus-within:border-orange/40 transition-colors duration-150">
            <span className="text-sm text-text-secondary">₱</span>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0"
              inputMode="decimal"
              className="flex-1 text-sm outline-none min-w-0"
            />
          </div>
        </div>

        {!hasValidItem && (
          <p className="text-xs text-text-secondary -mt-2">
            Enter a name and price before saving.
          </p>
        )}

        <PersonPicker
          persons={persons}
          contacts={contacts}
          currentUser={currentUser}
          showYou={showYou}
          mode="multi"
          confirmLabel="Assign"
          initialPersonIds={initialPersonIds}
          disabled={!hasValidItem}
          note={
            onDelete
              ? "Check more names to split this item. Uncheck everyone to move it to Unassigned instead of deleting it."
              : undefined
          }
          onConfirm={handleConfirm}
        />
      </div>
    </BottomSheet>
  );
};
