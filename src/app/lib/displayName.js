// "YOU" is a display-time substitution only — the persons.name column in the
// database always keeps the person's real name. Anywhere a person's name is
// rendered in the live UI, run it through these helpers first so the owner's
// own row reads "YOU" instead of their real name.
export function getPersonDisplayName(person, currentUserId) {
  if (!person) return "";
  const personUserId = person.user_id ?? person.userId ?? null;
  if (currentUserId && personUserId === currentUserId) return "YOU";
  return person.name;
}

export function withDisplayNames(persons, currentUserId) {
  if (!Array.isArray(persons)) return persons;
  return persons.map((p) => ({ ...p, name: getPersonDisplayName(p, currentUserId) }));
}
