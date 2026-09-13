import type { ItemDef } from './content.ts';
export type CatalogEntry = [string, ItemDef];
export type ProductGroup = {
  key: string;
  name: string;
  entries: CatalogEntry[];
};
// Variants remain real items; one shelf card represents their shared kind.
export function groupProducts(entries: CatalogEntry[]): ProductGroup[] {
  const groups = new Map<string, ProductGroup>();
  for (const entry of entries) {
    const [id, item] = entry,
      name = item.family ?? (item.capacity ? '확장 가방' : item.name),
      key = item.family ? `family:${item.family}` : item.capacity ? 'bags' : id;
    if (!groups.has(key)) groups.set(key, { key, name, entries: [] });
    groups.get(key)!.entries.push(entry);
  }
  return [...groups.values()];
}
export function defaultProduct(
  group: ProductGroup,
  level: number,
  capacity: number,
): CatalogEntry {
  const available = group.entries.filter(([, i]) => i.level <= level);
  const pool = available.length ? available : group.entries;
  if (pool[0][1].capacity)
    return (
      [...pool]
        .sort((a, b) => a[1].capacity! - b[1].capacity!)
        .find(([, i]) => i.capacity! > capacity) ?? pool.at(-1)!
    );
  return [...pool].sort(
    (a, b) => b[1].level - a[1].level || a[1].price - b[1].price,
  )[0];
}
