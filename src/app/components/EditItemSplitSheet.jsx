"use client";

import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { hapticTrigger } from "ios-haptics";
import { BottomSheet } from "./ui/BottomSheet";
import { PersonPicker } from "./PersonPicker";

/**
 * EditItemSplitSheet — manual entry's chevron-driven split editor. Lets an
 * already-added item (a single person's individual item, an existing shared
 * item, or an unassigned item) be reassigned across people on the bill, and
 * its name/price corrected in the same place — same name/price card as
 * AddSharedItemSheet, since this is otherwise the only place a shared item's
 * name or price could never be fixed after creation (its row only shows a
 * read-only per-person share, not an editable price). Mirrors the scan
 * flow's AssignItemSheet's picker exactly — same "In this bill" /
 * "From contacts" / "New person" picker — since correcting who splits an
 * existing item may mean pulling in someone who isn't on the bill yet, not
 * just re-picking among people already there.
 *
 * Props:
 * - item: { id, name, price }
 * - persons: [{ id, name }] — everyone currently on this bill.
 * - contacts: [{ id, name }] — contacts not yet added to this bill.
 * - currentUser: { id, name } | null
 * - showYou: boolean
 * - initialPersonIds: string[] — who's currently assigned (one id for a
 *   regular item, several for an already-shared one, none for an unassigned one).
 * - onConfirm: ({ existingPersonIds, contacts, newNames, includeYou, name, price }) => void
 * - onDelete: (() => void) | undefined — permanently removes the item
 *   instead of reassigning it. Only passed for a person-card-originated item
 *   (solo or shared) — an unassigned item already has its own row-level
 *   trash icon, so this stays undefined for that entry point to avoid two
 *   different delete affordances on the same item.
 */
export const EditItemSplitSheet = ({
  item,
  persons,
  contacts,
  currentUser,
  showYou,
  initialPersonIds = [],
  onConfirm,
  onDelete,
  onClose,
}) => {
  const [name, setName] = useState(item.name || "");
  const [price, setPrice] = useState(item.price ? String(item.price) : "");

  const hasValidItem = name.trim().length > 0 && parseFloat(price) > 0;

  function handleConfirm(selection) {
    onConfirm({
      ...selection,
      name: name.trim(),
      price: parseFloat(price),
    });
  }

  return (
    <BottomSheet setSheetOpen={onClose} sheetClassName="pb-0">
      <div className="flex flex-col items-start w-full gap-4 font-body">
        <div className="flex items-center justify-between w-full">
          <h1 className="font-display text-text-primary text-xl font-bold">
            Edit split
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
          confirmLabel="Save split"
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
