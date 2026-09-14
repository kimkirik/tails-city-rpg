// The shopkeeper is part of the room artwork. Scale the room and its collision
// geometry together, while keeping the traveler and pets at their usual size.
const SCALE = 0.6;
export const SHOP_LAYOUT_REVISION = 2;
export function shopPoint(x: number, y: number) {
  return { x: 1024 + (x - 1024) * SCALE, y: 820 + (y - 820) * SCALE };
}
export const SHOP_BOUNDS = {
  ...shopPoint(0, 0),
  width: 2048 * SCALE,
  height: 2048 * SCALE,
};
export const SHOP_ENTRY = shopPoint(1024, 1660);
export const SHOP_COUNTER = shopPoint(1024, 820);
export const SHOP_EXIT = shopPoint(1024, 1840);
const floorMin = shopPoint(280, 780);
const floorMax = shopPoint(1768, 1600);
const entranceMin = shopPoint(870, 1600);
const entranceMax = shopPoint(1178, 1875);
export function shopWalkable(x: number, y: number) {
  return (
    y >= floorMin.y &&
    y <= entranceMax.y &&
    (y <= floorMax.y
      ? x >= floorMin.x && x <= floorMax.x
      : x >= entranceMin.x && x <= entranceMax.x)
  );
}
