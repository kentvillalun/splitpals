"use client";

import { BottomSheet } from "./ui/BottomSheet";
import { PersonPicker } from "./PersonPicker";

export const AssignItemSheet = ({
  item,
  persons,
  contacts,
  currentUser,
  showYou,
  onAssign,
  onClose,
  initialPersonIds = [],
}) => {
  return (
    <BottomSheet setSheetOpen={onClose}>
      <div className="flex flex-col items-start w-full gap-4 font-body">
        <div className="flex flex-col">
          <h1 className="font-display text-text-primary text-xl font-bold">
            Assign item
          </h1>
          <p className="text-text-secondary text-sm">
            {item.name} · ₱{item.price.toFixed(2)}
          </p>
        </div>

        <PersonPicker
          persons={persons}
          contacts={contacts}
          currentUser={currentUser}
          showYou={showYou}
          mode="multi"
          confirmLabel="Assign"
          initialPersonIds={initialPersonIds}
          onConfirm={onAssign}
        />
      </div>
    </BottomSheet>
  );
};
