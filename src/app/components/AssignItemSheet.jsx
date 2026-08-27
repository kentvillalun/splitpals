"use client";

import { useState } from "react";
import { CheckIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { BottomSheet } from "./ui/BottomSheet";
import { haptic } from "@/app/lib/haptic";

function SelectableRow({ label, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex flex-row items-center justify-between w-full text-left rounded-xl p-3 gap-3 border-[1.5px] transition-colors duration-150 ${
        selected ? "bg-orange/10 border-orange" : "bg-transparent border-black/10"
      }`}
    >
      <p className="text-sm font-medium text-text-primary truncate">{label}</p>
      <div
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors duration-150 ${
          selected ? "bg-orange border-orange" : "border-black/15"
        }`}
      >
        {selected && <CheckIcon className="w-3 stroke-white stroke-3" />}
      </div>
    </button>
  );
}

export const AssignItemSheet = ({ item, persons, contacts, onAssign, onClose }) => {
  const [selectedPersonIds, setSelectedPersonIds] = useState([]);
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [pendingNewNames, setPendingNewNames] = useState([]);
  const [draftName, setDraftName] = useState("");

  function togglePerson(id) {
    haptic.light();
    setSelectedPersonIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function toggleContact(id) {
    haptic.light();
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function confirmDraftName() {
    const trimmed = draftName.trim();
    if (!trimmed || pendingNewNames.includes(trimmed)) {
      setDraftName("");
      return;
    }
    haptic.light();
    setPendingNewNames((prev) => [...prev, trimmed]);
    setDraftName("");
  }

  function removePendingName(name) {
    haptic.light();
    setPendingNewNames((prev) => prev.filter((n) => n !== name));
  }

  const selectedCount =
    selectedPersonIds.length + selectedContactIds.length + pendingNewNames.length;

  function handleAssignTap() {
    if (selectedCount === 0) return;
    haptic.medium();
    onAssign({
      existingPersonIds: selectedPersonIds,
      contacts: contacts.filter((c) => selectedContactIds.includes(c.id)),
      newNames: pendingNewNames,
    });
  }

  return (
    <BottomSheet setSheetOpen={onClose}>
      <div className="font-body flex flex-col items-start w-full gap-4 max-h-[70vh] overflow-y-auto">
        <div className="flex flex-col">
          <h1 className="font-display text-text-primary text-xl font-bold">
            Assign item
          </h1>
          <p className="text-text-secondary text-sm">
            {item.name} · ₱{item.price.toFixed(2)}
          </p>
        </div>

        {persons.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              In this bill
            </p>
            <div className="flex flex-col gap-2">
              {persons.map((person) => (
                <SelectableRow
                  key={person.id}
                  label={person.name}
                  selected={selectedPersonIds.includes(person.id)}
                  onToggle={() => togglePerson(person.id)}
                />
              ))}
            </div>
          </div>
        )}

        {contacts.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              From contacts
            </p>
            <div className="flex flex-col gap-2">
              {contacts.map((contact) => (
                <SelectableRow
                  key={contact.id}
                  label={contact.name}
                  selected={selectedContactIds.includes(contact.id)}
                  onToggle={() => toggleContact(contact.id)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 w-full">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
            New person
          </p>

          {pendingNewNames.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {pendingNewNames.map((name) => (
                <div
                  key={name}
                  className="flex items-center gap-1 bg-orange-tint text-orange text-xs font-semibold pl-3 pr-2 py-1 rounded-full"
                >
                  {name}
                  <button onClick={() => removePendingName(name)}>
                    <XMarkIcon className="w-3.5 stroke-orange" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={confirmDraftName}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  confirmDraftName();
                }
              }}
              placeholder="Type a name"
              className="flex-1 border border-black/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange/40 transition-colors duration-150 min-w-0"
            />
            <button
              onClick={confirmDraftName}
              className="shrink-0 w-9 h-9 rounded-xl bg-orange-tint flex items-center justify-center transition-all duration-150 active:scale-95"
            >
              <PlusIcon className="w-4 text-orange" />
            </button>
          </div>
          <p className="text-xs text-text-secondary">
            Tip: use the exact same spelling next time so it's recognized as
            the same person.
          </p>
        </div>

        <button
          onClick={handleAssignTap}
          disabled={selectedCount === 0}
          className="w-full gradient-button rounded-2xl py-3.5 text-white font-semibold text-sm transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
        >
          Assign{selectedCount > 0 ? ` (${selectedCount} selected)` : ""}
        </button>
      </div>
    </BottomSheet>
  );
};
