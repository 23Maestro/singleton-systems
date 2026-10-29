function sortedValue(value) {
  if (Array.isArray(value)) return value.map(sortedValue);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0).map(([key, item]) => [key, sortedValue(item)]));
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(sortedValue(value));
}
