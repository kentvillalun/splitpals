"use client";

import { useState } from "react";
import { CheckIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { hapticTrigger } from "ios-haptics";

export function SelectableRow({ label, selected, onToggle, disabled = false }) {
  if (disabled) {
    return (
      <div className="flex flex-row items-center justify-between w-full text-left rounded-xl p-3 gap-3 border-[1.5px] border-black/5 bg-black/2 opacity-60">
        <p className="text-sm font-medium text-text-primary truncate">{label}</p>
        <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wide shrink-0">
          Already added
        </p>
      </div>
    );
  }

  return (
    <button
      ref={hapticTrigger}
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

/**
 * PersonPicker — the "In this bill" / "From contacts" / "New person" picker
 * shared by AssignItemSheet (multi-select, assigning an item to one or more
 * people) and AddPersonSheet (single-select, just adding one person to the
 * bill's roster).
 *
 * Props:
 * - persons: [{ id, name }] — people already on this bill ("In this bill").
 *   In single-select mode these rows are shown for context only and are not
 *   selectable, since picking someone already on the bill would be a no-op.
 * - contacts: [{ id, name }] — contacts not yet added to this bill.
 * - currentUser: { id, name } | null — the signed-in user, for the "YOU" row.
 * - showYou: boolean — whether "YOU" should be offered (false once a persons
 *   row for the current user already exists on this bill).
 * - mode: "multi" | "single"
 * - confirmLabel: label for the confirm button (before any "(N selected)" suffix)
 * - disabled: extra condition (e.g. other required fields not filled in yet)
 *   that keeps the confirm button disabled regardless of selection
 * - onConfirm: ({ existingPersonIds, contacts, newNames, includeYou }) => void
 */
export function PersonPicker({
  persons = [],
  contacts = [],
  currentUser = null,
  showYou = false,
  mode = "multi",
  confirmLabel = "Assign",
  initialPersonIds = [],
  disabled = false,
  onConfirm,
}) {
  const [selectedPersonIds, setSelectedPersonIds] = useState(initialPersonIds);
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [includeYou, setIncludeYou] = useState(false);
  const [pendingNewNames, setPendingNewNames] = useState([]);
  const [draftName, setDraftName] = useState("");

  const isSingle = mode === "single";

  function togglePerson(id) {
    if (isSingle) return; // already-on-the-bill rows are informational only
    setSelectedPersonIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function toggleContact(id) {
    if (isSingle) {
      setSelectedContactIds((prev) => (prev.includes(id) ? [] : [id]));
      setIncludeYou(false);
      setPendingNewNames([]);
      return;
    }
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function toggleYou() {
    if (isSingle) {
      setIncludeYou((prev) => {
        const next = !prev;
        if (next) {
          setSelectedContactIds([]);
          setPendingNewNames([]);
        }
        return next;
      });
      return;
    }
    setIncludeYou((prev) => !prev);
  }

  function confirmDraftName() {
    const trimmed = draftName.trim();
    if (!trimmed || pendingNewNames.includes(trimmed)) {
      setDraftName("");
      return;
    }
    if (isSingle) {
      setPendingNewNames([trimmed]);
      setSelectedContactIds([]);
      setIncludeYou(false);
    } else {
      setPendingNewNames((prev) => [...prev, trimmed]);
    }
    setDraftName("");
  }

  function removePendingName(name) {
    setPendingNewNames((prev) => prev.filter((n) => n !== name));
  }

  const selectedCount =
    selectedPersonIds.length +
    selectedContactIds.length +
    pendingNewNames.length +
    (includeYou ? 1 : 0);

  function handleConfirmTap() {
    if (selectedCount === 0 || disabled) return;
    onConfirm({
      existingPersonIds: selectedPersonIds,
      contacts: contacts.filter((c) => selectedContactIds.includes(c.id)),
      newNames: pendingNewNames,
      includeYou,
    });
  }

  return (
    <div className="font-body flex flex-col items-start w-full gap-4 max-h-[70vh] overflow-y-auto">
      {(persons.length > 0 || (showYou && currentUser)) && (
        <div className="flex flex-col gap-2 w-full">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
            In this bill
          </p>
          <div className="flex flex-col gap-2">
            {showYou && currentUser && (
              <SelectableRow label="YOU" selected={includeYou} onToggle={toggleYou} />
            )}
            {persons.map((person) => (
              <SelectableRow
                key={person.id}
                label={person.name}
                selected={selectedPersonIds.includes(person.id)}
                onToggle={() => togglePerson(person.id)}
                disabled={isSingle}
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
                <button ref={hapticTrigger} onClick={() => removePendingName(name)}>
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
        onClick={handleConfirmTap}
        disabled={selectedCount === 0 || disabled}
        className="w-full gradient-button rounded-2xl py-3.5 text-white font-semibold text-sm transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
      >
        {confirmLabel}
        {!isSingle && selectedCount > 0 ? ` (${selectedCount} selected)` : ""}
      </button>
    </div>
  );
}
