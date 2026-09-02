"use client";

import { useState } from "react";
import { BottomSheet } from "./ui/BottomSheet";
import { PersonPicker } from "./PersonPicker";

/**
 * AddSharedItemSheet — manual entry's "Add shared item" flow. A single item
 * (name + price) assigned to more than one person on the bill at once,
 * instead of typed under one person's individual item list.
 *
 * Same "In this bill" / "From contacts" / "New person" picker as
 * AssignItemSheet, plus the item name/price fields up front since — unlike
 * the scan flow — the item doesn't exist yet at this point.
 *
 * Props:
 * - persons: [{ id, name }] — people already added to this bill.
 * - contacts: [{ id, name }] — contacts not yet added to this bill.
 * - currentUser: { id, name } | null
 * - showYou: boolean
 * - onAdd: ({ name, price, existingPersonIds, contacts, newNames, includeYou }) => void
 */
export const AddSharedItemSheet = ({
  persons,
  contacts,
  currentUser,
  showYou,
  onAdd,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const hasValidItem = name.trim().length > 0 && parseFloat(price) > 0;

  function handleConfirm(selection) {
    onAdd({
      name: name.trim(),
      price: parseFloat(price),
      ...selection,
    });
  }

  return (
    <BottomSheet setSheetOpen={onClose} sheetClassName="pb-0">
      <div className="flex flex-col items-start w-full gap-4 font-body">
        <h1 className="font-display text-text-primary text-xl font-bold">
          Add shared item
        </h1>

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
            Price
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
            Enter a name and price before picking who's splitting it.
          </p>
        )}

        <PersonPicker
          persons={persons}
          contacts={contacts}
          currentUser={currentUser}
          showYou={showYou}
          mode="multi"
          confirmLabel="Add item"
          disabled={!hasValidItem}
          onConfirm={handleConfirm}
        />
      </div>
    </BottomSheet>
  );
};
