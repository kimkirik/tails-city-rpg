import { walkable, type GameState } from './model.ts';
type Point = { x: number; y: number };
// Check the whole movement segment: diagonal shortcuts must never cut through scenery.
export function clearSegment(
  s: Pick<GameState, 'region' | 'place'>,
  a: Point,
  b: Point,
) {
  const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 8));
  for (let i = 0; i <= steps; i++)
    if (
      !walkable(
        a.x + ((b.x - a.x) * i) / steps,
        a.y + ((b.y - a.y) * i) / steps,
        s.region,
        s.place,
      )
    )
      return false;
  return true;
}
export function findPath(s: GameState, goal: Point): Point[] {
  if (!walkable(s.x, s.y, s.region, s.place)) return [];
  const N = 64,
    unit = 32,
    key = (x: number, y: number) => y * N + x;
  const point = (id: number) => ({
    x: (id % N) * unit + 16,
    y: Math.floor(id / N) * unit + 16,
  });
  const nearestCell = (p: Point, start = false) => {
    let best = -1,
      distance = Infinity;
    const gx = Math.floor(p.x / unit),
      gy = Math.floor(p.y / unit);
    for (let y = Math.max(0, gy - 4); y <= Math.min(N - 1, gy + 4); y++)
      for (let x = Math.max(0, gx - 4); x <= Math.min(N - 1, gx + 4); x++) {
        const id = key(x, y),
          candidate = point(id),
          d = Math.hypot(candidate.x - p.x, candidate.y - p.y);
        if (
          d < distance &&
          walkable(candidate.x, candidate.y, s.region, s.place) &&
          (!start || clearSegment(s, p, candidate))
        ) {
          best = id;
          distance = d;
        }
      }
    return best;
  };
  const start = nearestCell(s, true),
    target = nearestCell(goal);
  if (start < 0 || target < 0) return [];
  const end = point(target);
  if (clearSegment(s, s, end)) return [end];
  const heuristic = (id: number) =>
    Math.hypot(point(id).x - end.x, point(id).y - end.y);
  const open = [start],
    closed = new Set<number>(),
    parents = new Map<number, number>(),
    cost = new Map([[start, 0]]);
  while (open.length) {
    open.sort(
      (a, b) => cost.get(a)! + heuristic(a) - (cost.get(b)! + heuristic(b)),
    );
    const id = open.shift()!;
    if (id === target) {
      const raw = [end];
      for (let n = target; parents.has(n);) {
        n = parents.get(n)!;
        raw.unshift(point(n));
      }
      const result: Point[] = [];
      let from: Point = s,
        index = 0;
      while (index < raw.length) {
        let next = index;
        for (let j = index + 1; j < raw.length; j++)
          if (clearSegment(s, from, raw[j])) next = j;
        result.push(raw[next]);
        from = raw[next];
        index = next + 1;
      }
      return result;
    }
    closed.add(id);
    const a = point(id),
      x = id % N,
      y = Math.floor(id / N);
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]) {
      const nx = x + dx,
        ny = y + dy,
        n = key(nx, ny);
      if (nx < 0 || nx >= N || ny < 0 || ny >= N || closed.has(n)) continue;
      const b = point(n),
        candidate = cost.get(id)! + Math.hypot(dx, dy) * unit;
      if (candidate >= (cost.get(n) ?? Infinity) || !clearSegment(s, a, b))
        continue;
      cost.set(n, candidate);
      parents.set(n, id);
      if (!open.includes(n)) open.push(n);
    }
  }
  return [];
}
