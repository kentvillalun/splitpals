import { getPersonDisplayName } from "@/app/lib/displayName";

// Same "Split with X and Y" label as the scan/edit flows' splitWithLabel,
// just built from raw item_shares person ids instead of an in-progress
// item's assignedTo/personIds array.
function splitWithNote(sharerIds, currentPersonId, personById, currentUserId) {
  const others = sharerIds
    .filter((id) => id !== currentPersonId)
    .map((id) => {
      const person = personById.get(id);
      return person ? getPersonDisplayName(person, currentUserId) : "someone";
    });

  if (others.length === 0) return null;
  if (others.length <= 2) return `Split with ${others.join(" and ")}`;
  return `Split with ${others[0]}, ${others[1]} +${others.length - 2}`;
}

// A saved shared item is only nested under its "owner" person (items.person_id
// — always the first assignee, per the scan/edit flows' RLS workaround) and
// carries its full, undivided price there. item_shares is the real source of
// truth for who's splitting it. This reconstructs the display-time shape:
// every participant gets their own copy of the item, with price divided by
// the number of sharers and a "Split with ..." note — the same thing
// AssignItemsPage/EditBillPage already show while building the split, just
// rebuilt here from a saved bill's item_shares rows.
export function expandSharedItems(persons, currentUserId) {
  const personById = new Map(persons.map((p) => [p.id, p]));
  const itemsByPerson = new Map(persons.map((p) => [p.id, []]));

  for (const person of persons) {
    for (const item of person.items ?? []) {
      const sharerIds = (item.item_shares ?? []).map((s) => s.person_id);

      if (sharerIds.length <= 1) {
        itemsByPerson.get(person.id)?.push({ ...item, note: null });
        continue;
      }

      const share = item.price / sharerIds.length;
      for (const sharerId of sharerIds) {
        if (!itemsByPerson.has(sharerId)) continue;
        itemsByPerson.get(sharerId).push({
          ...item,
          price: share,
          note: splitWithNote(sharerIds, sharerId, personById, currentUserId),
        });
      }
    }
  }

  return persons.map((p) => ({ ...p, items: itemsByPerson.get(p.id) ?? [] }));
}
