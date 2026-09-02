"use client";

import { BottomSheet } from "./ui/BottomSheet";
import { PersonPicker } from "./PersonPicker";

/**
 * AddPersonSheet — manual-entry's "Add another person" flow. Same
 * "In this bill" / "From contacts" / "New person" picker as AssignItemSheet,
 * but single-select (there's no item to split at this step, just a roster
 * being built) and without an item-name/price header.
 */
export const AddPersonSheet = ({
  persons,
  contacts,
  currentUser,
  showYou,
  onAdd,
  onClose,
}) => {
  return (
    <BottomSheet setSheetOpen={onClose} sheetClassName="pb-0!">
      <div className="flex flex-col items-start w-full gap-4 font-body">
        <h1 className="font-display text-text-primary text-xl font-bold">
          Add a person
        </h1>

        <PersonPicker
          persons={persons}
          contacts={contacts}
          currentUser={currentUser}
          showYou={showYou}
          mode="single"
          confirmLabel="Add"
          onConfirm={onAdd}
        />
      </div>
    </BottomSheet>
  );
};
