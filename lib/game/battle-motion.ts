import {
  act,
  partyDogs,
  BREEDS,
  type GameState,
  type Result,
  type AttackKind,
} from './model.ts';
export type { AttackKind } from './model.ts';
export type AttackStyle = 'dash' | 'tail' | 'leap';
export type BattleStrike = {
  actorId: string;
  slot: number;
  style: AttackStyle;
  damage: number;
  start: number;
  impact: number;
  end: number;
  color: string;
};
export type BattleCounter = {
  dogId: string;
  damage: number;
  poisonDamage: number;
  breath: boolean;
  start: number;
  impact: number;
  end: number;
};
export type BattleClip = {
  id: number;
  kind: AttackKind;
  title: string;
  strikes: BattleStrike[];
  counters: BattleCounter[];
  counter: BattleCounter | null;
  participants: string[];
  enemyHp: number;
  duration: number;
  victory: boolean;
};
export type PlayingClip = BattleClip & { startedAt: number };
const COLORS = [
  '#ff9b49',
  '#adf6ff',
  '#d4e8ff',
  '#f6c17b',
  '#b9f483',
  '#a9ddff',
  '#ffad60',
];
export function makeBattleClip(
  s: GameState,
  kind: AttackKind,
  result: Result,
  id = 0,
): BattleClip {
  const battle = s.battle!,
    combat = result.combat!;
  const participants =
    kind === 'team'
      ? [
          'traveler',
          ...partyDogs(s)
            .filter((d) => d.hp > 0)
            .map((d) => d.id),
        ]
      : [battle.actor];
  const strikes = combat.hits.map((hit, i) => {
    const dog = s.dogs.find((d) => d.id === hit.actorId),
      owner = hit.actorId === 'traveler',
      start = 100 + i * 340;
    const style: AttackStyle = owner
      ? 'dash'
      : kind === 'tail'
        ? 'tail'
        : kind === 'skill'
          ? [1, 5].includes(dog!.breed)
            ? 'leap'
            : [3, 4].includes(dog!.breed)
              ? 'tail'
              : 'dash'
          : kind === 'team' && i % 2 === 0
            ? 'leap'
            : 'dash';
    return {
      ...hit,
      start,
      impact: start + 400,
      end: start + 860,
      style,
      color: owner ? '#ffe18c' : COLORS[dog!.breed],
    };
  });
  const counterStart = (strikes.at(-1)?.end ?? 400) + 90;
  const counters = combat.counters.map((counter, i) => ({
    ...counter,
    dogId: counter.actorId,
    start: counterStart + i * 820,
    impact: counterStart + i * 820 + 340,
    end: counterStart + i * 820 + 720,
  }));
  return {
    id,
    kind,
    title: combat.title,
    strikes,
    counters,
    counter: counters[0] ?? null,
    participants,
    enemyHp: Math.max(
      0,
      battle.enemy.hp - strikes.reduce((n, h) => n + h.damage, 0),
    ),
    duration: (counters.at(-1)?.end ?? strikes.at(-1)?.end ?? 400) + 300,
    victory: result.event === 'win',
  };
}
// Reserve the result until animation ends so repeated input cannot duplicate damage or loot.
export class BattleDirector {
  private pending: Result | null = null;
  private serial = 0;
  get busy() {
    return this.pending !== null;
  }
  begin(s: GameState, kind: AttackKind) {
    if (this.pending) return null;
    const result = act(s, { type: kind });
    if (result.state === s || !s.battle || !result.combat)
      return { result, clip: null };
    const clip = makeBattleClip(s, kind, result, ++this.serial);
    this.pending = result;
    return { result, clip };
  }
  finish() {
    const result = this.pending;
    this.pending = null;
    return result;
  }
  cancel() {
    this.pending = null;
  }
}
export function visibleBattleHp(
  s: GameState,
  clip: BattleClip | null,
  elapsed: number,
) {
  const dogs = Object.fromEntries(partyDogs(s).map((d) => [d.id, d.hp]));
  let hero = s.hero.hp,
    enemy = s.battle?.enemy.hp ?? 0;
  if (clip) {
    for (const hit of clip.strikes)
      if (elapsed >= hit.impact) enemy -= hit.damage;
    for (const counter of clip.counters)
      if (elapsed >= counter.impact) {
        const damage = counter.damage + counter.poisonDamage;
        if (counter.dogId === 'traveler') hero = Math.max(0, hero - damage);
        else dogs[counter.dogId] = Math.max(0, dogs[counter.dogId] - damage);
      }
  }
  return { enemy: Math.max(0, enemy), dogs, hero };
}
export const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => {
  const t = clamp(n);
  return t * t * (3 - 2 * t);
};
export function strikePose(strike: BattleStrike, elapsed: number) {
  const t = elapsed - strike.start,
    move = t < 400 ? smooth((t - 100) / 260) : 1 - smooth((t - 570) / 260);
  const active = t >= 0 && t < 860,
    spinning = strike.style === 'tail' && t >= 270 && t <= 600;
  return {
    move,
    active,
    spinning,
    jump:
      strike.style === 'leap' ? Math.sin(clamp((t - 110) / 520) * Math.PI) : 0,
    frame: Math.floor(Math.max(0, t) / 70) % 4,
    facing: spinning
      ? ([2, 3, 1, 0] as const)[Math.floor((t - 270) / 65) % 4]
      : t > 570
        ? 1
        : 2,
  };
}

export function stagePositions(
  width: number,
  height: number,
  count: number,
  dragon = false,
) {
  const size = Math.min(125, width * 0.27, height * 0.43),
    travelerSize = Math.min(150, width * 0.28, height * 0.49),
    enemySize = Math.min(
      dragon ? 205 : 180,
      width * (dragon ? 0.46 : 0.42),
      height * 0.62,
    );
  return {
    dogSize: size,
    travelerSize,
    traveler: { x: width * 0.18, y: height * 0.66 },
    enemySize,
    enemy: {
      x: Math.min(width * 0.78, width - enemySize / 2 - 6),
      y: Math.max(enemySize * 0.87 + 5, height * 0.34),
    },
    dogs: Array.from({ length: count }, (_, i) => ({
      x: width * (i === 0 ? 0.37 : 0.57),
      y: height * (i === 0 ? 0.79 : 0.9),
    })),
  };
}

export function dogStagePose(
  layout: ReturnType<typeof stagePositions>,
  slot: number,
  strike: BattleStrike | undefined,
  elapsed: number,
) {
  const home = layout.dogs[slot],
    pose = strike ? strikePose(strike, elapsed) : null;
  const x =
    home.x +
    (layout.enemy.x - layout.enemySize * 0.3 - home.x) * (pose?.move ?? 0);
  const y =
    home.y +
    (layout.enemy.y + layout.dogSize * 0.15 - home.y) * (pose?.move ?? 0) -
    (pose?.jump ?? 0) * layout.dogSize * 0.6;
  return { x, y: Math.max(layout.dogSize * 0.83 + 3, y), pose };
}

export function travelerStagePose(
  layout: ReturnType<typeof stagePositions>,
  strike: BattleStrike | undefined,
  elapsed: number,
) {
  const home = layout.traveler,
    pose = strike ? strikePose(strike, elapsed) : null;
  return {
    x:
      home.x +
      (layout.enemy.x - layout.enemySize * 0.36 - home.x) * (pose?.move ?? 0),
    y: Math.max(
      layout.travelerSize * 0.83 + 3,
      home.y +
        (layout.enemy.y + layout.travelerSize * 0.22 - home.y) *
          (pose?.move ?? 0),
    ),
    pose,
  };
}
