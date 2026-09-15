import { routeLayout, routeSpawn } from './route-layouts.ts';

// Each combat area gets two wildlife encounters, distinct from the bandits.
export const FIELD_MONSTERS: Record<number, readonly [string, number][]> = {
  0: [
    ['공원 들쥐', 0],
    ['이슬 슬라임', 1],
  ],
  2: [
    ['덩굴 버섯', 5],
    ['숲그늘 독거미', 3],
  ],
  3: [
    ['부두 왕쥐', 0],
    ['소금물 슬라임', 1],
  ],
  4: [
    ['고철 골렘', 4],
    ['전선 박쥐', 2],
  ],
  5: [
    ['경비 골렘', 4],
    ['검은 독거미', 3],
  ],
  6: [
    ['꽃가루 버섯', 5],
    ['꿀방울 슬라임', 1],
  ],
  8: [
    ['자수정 박쥐', 2],
    ['수정 골렘', 4],
  ],
  10: [
    ['폭풍 박쥐', 2],
    ['번개 거미', 3],
  ],
};
const positions = new Map<number, { x: number; y: number }[]>();
export function fieldMonsterPositions(region: number) {
  const cached = positions.get(region);
  if (cached) return cached;
  const layout = routeLayout(region);
  const occupied = [
    routeSpawn(region),
    ...Object.values(layout.anchors).map(([x, y]) => ({ x, y })),
    { x: 1024, y: 60 },
    { x: 1988, y: 970 },
    { x: 1024, y: 1988 },
    { x: 60, y: 970 },
  ];
  const candidates = layout.paths
    .flatMap((path) =>
      path
        .slice(1)
        .flatMap((b, i) =>
          [0.25, 0.5, 0.75].map((t) => ({
            x: path[i][0] + (b[0] - path[i][0]) * t,
            y: path[i][1] + (b[1] - path[i][1]) * t,
          })),
        ),
    )
    .filter((p) => p.x > 200 && p.x < 1848 && p.y > 200 && p.y < 1848);
  const selected: { x: number; y: number }[] = [];
  for (let i = 0; i < 2; i++) {
    const distance = (p: { x: number; y: number }) =>
      Math.min(...occupied.map((o) => Math.hypot(p.x - o.x, p.y - o.y)));
    const point = candidates.toSorted((a, b) => distance(b) - distance(a))[0];
    selected.push(point);
    occupied.push(point);
  }
  positions.set(region, selected);
  return selected;
}
export const MONSTER_MOVES = [
  { name: '빠른 물어뜯기', every: 3, multiplier: 1.25, color: '#e6be83' },
  { name: '물방울 발사', every: 3, multiplier: 1.35, color: '#75dbef' },
  { name: '급강하', every: 3, multiplier: 1.5, color: '#c3a2ff' },
  {
    name: '독니 물기',
    every: 2,
    multiplier: 1.1,
    color: '#a9df73',
    poison: true,
  },
  { name: '바위 내리치기', every: 3, multiplier: 1.6, color: '#e6b26c' },
  {
    name: '포자 폭발',
    every: 3,
    multiplier: 1.15,
    color: '#edb5dc',
    poison: true,
  },
];
export function monsterMove(creature: number | undefined, turn: number) {
  const move = creature === undefined ? undefined : MONSTER_MOVES[creature];
  return move && turn % move.every === 0 ? move : null;
}
