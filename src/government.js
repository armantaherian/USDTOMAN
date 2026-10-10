export function governmentForYear(year, records) {
  const groups = new Map();
  for (const person of records) {
    if (person.startYear > year || person.endYear < year) continue;
    if (!groups.has(person.role)) groups.set(person.role, new Map());
    const members = groups.get(person.role);
    const key = person.en || person.fa;
    const existing = members.get(key);
    if (!existing) members.set(key, { ...person });
    else {
      if (person.startYear < existing.startYear) {
        existing.startYear = person.startYear;
        existing.start = person.start;
      }
      if (person.endYear > existing.endYear) {
        existing.endYear = person.endYear;
        existing.end = person.end;
      }
    }
  }
  return [...groups].map(([role, members]) => ({ role, members: [...members.values()] }));
}

function persianYearStart(year) {
  const formatter = new Intl.DateTimeFormat("en-US-u-ca-persian", {
    year: "numeric", month: "numeric", day: "numeric", timeZone: "UTC",
  });
  for (let day = 19; day <= 22; day++) {
    const time = Date.UTC(year + 621, 2, day);
    const parts = Object.fromEntries(formatter.formatToParts(time).map(part => [part.type, part.value]));
    if (Number(parts.year) === year && Number(parts.month) === 1 && Number(parts.day) === 1) return time;
  }
  throw Error("Unable to determine Persian year start");
}

export function primaryGovernmentPerson(row, terms) {
  if (row.government.length <= 1) return row.government[0];
  const start = persianYearStart(row.year);
  const end = persianYearStart(row.year + 1);
  const duration = person => {
    const term = terms.find(term => term.en === person.en);
    if (!term) return 0;
    return Math.max(0, Math.min(end, term.end ? Date.parse(term.end) : end) - Math.max(start, Date.parse(term.start)));
  };
  return row.government.reduce((chosen, person) => duration(person) > duration(chosen) ? person : chosen);
}

export function organizationNodes(root, groups, lang) {
  return [
    { id: "root", parentId: null, ...root },
    ...groups.map((group, index) => ({
      id: "role-" + index,
      parentId: "root",
      label: group.label,
      names: group.members.map(person => person[lang]).join(lang === "fa" ? "، " : ", "),
      members: group.members,
    })),
  ];
}
