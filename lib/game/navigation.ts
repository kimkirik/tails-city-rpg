import { walkable, type GameState } from './model.ts';
export function findPath(s: GameState, goal: { x: number; y: number }) {
  const unit = 32,
    N = 64,
    key = (x: number, y: number) => y * N + x;
  const sx = Math.floor(s.x / unit),
    sy = Math.floor(s.y / unit);
  let gx = Math.max(0, Math.min(63, Math.floor(goal.x / unit))),
    gy = Math.max(0, Math.min(63, Math.floor(goal.y / unit)));
  let best = Infinity;
  const originalX = gx,
    originalY = gy;
  for (
    let y = Math.max(0, originalY - 4);
    y <= Math.min(63, originalY + 4);
    y++
  )
    for (
      let x = Math.max(0, originalX - 4);
      x <= Math.min(63, originalX + 4);
      x++
    )
      if (walkable(x * unit + 16, y * unit + 16, s.region, s.place)) {
        const dist = Math.hypot(x * unit + 16 - goal.x, y * unit + 16 - goal.y);
        if (dist < best) {
          best = dist;
          gx = x;
          gy = y;
        }
      }
  const target = key(gx, gy),
    start = key(sx, sy);
  const queue = [start],
    parents = new Map<number, number>([[start, -1]]);
  let found = false;
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i];
    if (id === target) {
      found = true;
      break;
    }
    const x = id % N,
      y = Math.floor(id / N);
    for (const [dx, dy] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]) {
      const nx = x + dx,
        ny = y + dy,
        n = key(nx, ny);
      if (
        nx >= 0 &&
        nx < N &&
        ny >= 0 &&
        ny < N &&
        !parents.has(n) &&
        walkable(nx * unit + 16, ny * unit + 16, s.region, s.place)
      ) {
        parents.set(n, id);
        queue.push(n);
      }
    }
  }
  if (!found) return [];
  const result = [];
  for (let p = target; p !== start && p !== -1; p = parents.get(p) ?? -1)
    result.unshift({
      x: (p % N) * unit + 16,
      y: Math.floor(p / N) * unit + 16,
    });
  return result;
}
