"use client";

import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { hapticTrigger } from "ios-haptics";
import { BottomSheet } from "./ui/BottomSheet";

/**
 * AddItemSheet — manual entry's simple, no-picker item sheet, opened from
 * within one specific person's card: either "Add item" (item is null) or
 * tapping an existing SOLO item's row (item is provided, prefilling the
 * fields). Unlike AddSharedItemSheet/EditItemSplitSheet, there's no
 * person-picker here at all — the assignee is already fixed by context
 * (whichever card this was opened from), so this is just name + price.
 * A shared item's row still opens the full EditItemSplitSheet instead,
 * since reassignment is genuinely on the table there.
 *
 * Props:
 * - item: { id, name, price, note } | null — null when adding a new item,
 *   provided when editing an existing solo item in place.
 * - onAdd: ({ name, price, note }) => void
 * - onDelete: (() => void) | undefined — only relevant (and shown) when
 *   editing an existing item; there's nothing to delete yet in add mode.
 */
export const AddItemSheet = ({ item, onAdd, onDelete, onClose }) => {
  const [name, setName] = useState(item?.name || "");
  const [price, setPrice] = useState(item?.price ? String(item.price) : "");
  const [note, setNote] = useState(item?.note || "");

  const hasValidItem = name.trim().length > 0 && parseFloat(price) > 0;

  function handleAdd() {
    if (!hasValidItem) return;
    onAdd({ name: name.trim(), price: parseFloat(price), note: note.trim() });
  }

  return (
    <BottomSheet setSheetOpen={onClose}>
      <div className="flex flex-col items-start w-full gap-4 font-body">
        <div className="flex items-center justify-between w-full">
          <h1 className="font-display text-text-primary text-xl font-bold">
            {item ? "Edit item" : "Add item"}
          </h1>
          {item && onDelete && (
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
            placeholder="e.g. Iced latte"
            autoFocus
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

        <div className="flex flex-col gap-1 w-full">
          <label className="text-xs font-medium text-text-secondary">
            Note (optional)
          </label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)"
            className="border border-black/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange/40 transition-colors duration-150"
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={!hasValidItem}
          className="w-full gradient-button rounded-2xl py-3.5 text-white font-semibold text-sm transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
        >
          {item ? "Save" : "Add item"}
        </button>
      </div>
    </BottomSheet>
  );
};
