export const EQUIPMENT_SLOTS = [
  { id: 'weapon', name: '무기', icon: '⚔️' },
  { id: 'clothes', name: '상의', icon: '🧥' },
  { id: 'pants', name: '바지', icon: '👖' },
  { id: 'necklace', name: '목걸이', icon: '📿' },
  { id: 'earrings', name: '귀걸이', icon: '💎' },
  { id: 'cape', name: '망토', icon: '🧣' },
  { id: 'accessory', name: '장식', icon: '🎀' },
] as const;
export type EquipmentSlot = (typeof EQUIPMENT_SLOTS)[number]['id'];
export type Equipment = Record<Exclude<EquipmentSlot, 'weapon'>, string | null>;
export const emptyEquipment = (): Equipment => ({
  clothes: null,
  pants: null,
  necklace: null,
  earrings: null,
  cape: null,
  accessory: null,
});
export function equippedItem(
  s: { weapon: string | null; equipment: Equipment },
  slot: EquipmentSlot,
) {
  return slot === 'weapon' ? s.weapon : s.equipment[slot];
}
export function equippedIds(s: {
  weapon: string | null;
  equipment: Equipment;
}) {
  return EQUIPMENT_SLOTS.map((slot) => equippedItem(s, slot.id)).filter(
    (id): id is string => !!id,
  );
}
