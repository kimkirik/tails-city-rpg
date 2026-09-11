import {
  defaultAppearance,
  validAppearance,
  type Appearance,
} from './appearance.ts';
import { enemyLook, ENEMY_LOOKS } from './enemies.ts';
export const SIZE = 2048;
export const REGIONS = [
  {
    id: 0,
    name: '솔빛 강변공원',
    en: 'SOLBIT RIVERSIDE',
    tag: '여정의 시작',
    level: 1,
    color: '#7ca965',
    desc: '강가의 작은 공원. 잃어버린 강아지들의 첫 단서가 남아 있다.',
    neighbors: [-1, 1, 3, -1],
  },
  {
    id: 1,
    name: '연두 마을',
    en: 'YEONDU NEIGHBORHOOD',
    tag: '골목의 소문',
    level: 2,
    color: '#cfa36f',
    desc: '상점과 주민들이 모인 안전한 마을. 마을 외곽의 대장을 쓰러뜨려 골목을 지켜라.',
    neighbors: [-1, 2, 4, 0],
  },
  {
    id: 2,
    name: '안개솔 숲',
    en: 'MISTPINE FOREST',
    tag: '숲의 수호자',
    level: 3,
    color: '#547e64',
    desc: '도시 외곽의 깊은 숲. 검은 목줄단이 비밀 신호기를 숨겨 놓았다.',
    neighbors: [-1, -1, 5, 1],
  },
  {
    id: 3,
    name: '파도빛 항구',
    en: 'TIDELIGHT HARBOR',
    tag: '수상한 화물',
    level: 4,
    color: '#649ca9',
    desc: '푸른 바다 너머로 사라지는 수상한 배. 컨테이너 속 단서를 찾아라.',
    neighbors: [0, 4, -1, -1],
  },
  {
    id: 4,
    name: '철길 공업지대',
    en: 'IRON RAIL DISTRICT',
    tag: '멈춰 버린 공장',
    level: 5,
    color: '#a27f68',
    desc: '기계 소리에 가려진 작은 울음. 목줄단의 공급망이 이곳을 지난다.',
    neighbors: [1, 5, -1, 3],
  },
  {
    id: 5,
    name: '블랙테일 본부',
    en: 'BLACKTAIL HEADQUARTERS',
    tag: '마지막 신호',
    level: 7,
    color: '#536780',
    desc: '다섯 신호기를 끄고 도시를 되찾자. 블랙테일의 대장이 기다린다.',
    neighbors: [2, -1, -1, 4],
  },
];
export const BREEDS = [
  {
    name: '시바',
    sprite: 1,
    skill: '불꽃 돌진',
    type: '용맹',
    color: '#dd9852',
    atk: 12,
    hp: 76,
  },
  {
    name: '사모예드',
    sprite: 2,
    skill: '눈꽃 바람',
    type: '수호',
    color: '#90b9c4',
    atk: 11,
    hp: 88,
  },
  {
    name: '보더콜리',
    sprite: 3,
    skill: '번개 질주',
    type: '민첩',
    color: '#7e8aab',
    atk: 15,
    hp: 66,
  },
  {
    name: '닥스훈트',
    sprite: 4,
    skill: '대지 울림',
    type: '끈기',
    color: '#b68563',
    atk: 13,
    hp: 82,
  },
  {
    name: '웰시코기',
    sprite: 5,
    skill: '응원의 짖음',
    type: '활력',
    color: '#dbad5f',
    atk: 12,
    hp: 90,
  },
  {
    name: '허스키',
    sprite: 6,
    skill: '서리 송곳니',
    type: '용맹',
    color: '#7c9ba8',
    atk: 17,
    hp: 78,
  },
  {
    name: '푸들',
    sprite: 8,
    skill: '불꽃 돌진',
    type: '용맹',
    color: '#a86d42',
    atk: 12,
    hp: 76,
  },
];
import {
  ITEMS,
  WEAPONS,
  RAIDS,
  CAVE_MOBS,
  NPCS,
  QUESTS,
  type EquipmentSlot,
} from './content.ts';
export { ITEMS, WEAPONS, RAIDS, CAVE_MOBS, NPCS, QUESTS };
export type Place = 'field' | 'shop' | 'cave';
export type Dog = {
  id: string;
  name: string;
  breed: number;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  atk: number;
  bond: number;
  sex?: 'female' | 'male';
  coat?: 'brown';
  poison?: boolean;
  boosts?: number;
};
export type Slot = { item: string; qty: number } | null;
export type Drop = {
  id: string;
  region: number;
  place?: 'field' | 'cave';
  x: number;
  y: number;
  originX: number;
  originY: number;
  item: string;
  qty: number;
  createdAt: number;
};
export type Enemy = {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  captain: boolean;
  region: number;
  dragon?: boolean;
  creature?: number;
};
export type Battle = {
  enemy: Enemy;
  turn: number;
  cooldown: number;
  log: string[];
  actor: string;
  teamUsed: boolean;
};
export type Hero = {
  hp: number;
  maxHp: number;
  atk: number;
  charm: number;
  boosts: number;
  poison: boolean;
};
export type GameState = {
  version: 1;
  region: number;
  x: number;
  y: number;
  coins: number;
  capacity: number;
  bag: Slot[];
  dogs: Dog[];
  active: string;
  defeated: string[];
  recruited: string[];
  looted: string[];
  visited: number[];
  battle: Battle | null;
  steps: number;
  won: boolean;
  seconds: number;
  place: Place;
  shopType: 'convenience' | 'armory';
  outside?: { x: number; y: number };
  weapon: string | null;
  equipment: { clothes: string | null; accessory: string | null };
  hero: Hero;
  enemyHealth: Record<string, number>;
  respawnAt: Record<string, number>;
  kills: number;
  encounterGraceUntil: number;
  drops: Drop[];
  playerName: string;
  party: string[];
  appearance: Appearance;
  quests: Record<string, 'active' | 'claimed'>;
  progress: Record<string, number>;
  talked: string[];
  rescued: number[];
  raids: number[];
  caveCleared: string[];
  npc: string | null;
};
export type Entity = {
  id: string;
  kind:
    | 'dog'
    | 'enemy'
    | 'shop'
    | 'rest'
    | 'loot'
    | 'merchant'
    | 'exit'
    | 'drop'
    | 'cave'
    | 'npc'
    | 'cat';
  name: string;
  x: number;
  y: number;
  breed?: number;
  captain?: boolean;
  item?: string;
  qty?: number;
  dragon?: boolean;
  creature?: number;
  shopType?: 'convenience' | 'armory';
  npc?: string;
};
export function makeDog(
  id: string,
  name: string,
  breed: number,
  level = 1,
): Dog {
  const b = BREEDS[breed];
  return {
    id,
    name,
    breed,
    level,
    xp: 0,
    hp: b.hp + (level - 1) * 10,
    maxHp: b.hp + (level - 1) * 10,
    atk: b.atk + (level - 1) * 3,
    bond: 1,
  };
}
export function newGame(): GameState {
  return {
    version: 1,
    region: 0,
    x: 1024,
    y: 1190,
    coins: 320,
    capacity: 25,
    bag: [
      { item: 'treat', qty: 5 },
      { item: 'potion', qty: 4 },
      { item: 'berry', qty: 3 },
      { item: 'revive', qty: 1 },
      ...Array(21).fill(null),
    ],
    dogs: [asRichi(makeDog('starter', '리치', 6, 2))],
    active: 'starter',
    defeated: [],
    recruited: [],
    looted: [],
    visited: [0],
    battle: null,
    steps: 0,
    won: false,
    seconds: 0,
    place: 'field',
    shopType: 'convenience',
    weapon: null,
    equipment: { clothes: null, accessory: null },
    hero: { hp: 110, maxHp: 110, atk: 17, charm: 5, boosts: 0, poison: false },
    enemyHealth: {},
    respawnAt: {},
    kills: 0,
    encounterGraceUntil: 0,
    drops: [],
    playerName: '여행자',
    party: ['starter'],
    appearance: defaultAppearance(),
    quests: {},
    progress: {},
    talked: [],
    rescued: [],
    raids: [],
    caveCleared: [],
    npc: null,
  };
}
export function asRichi(dog: Dog): Dog {
  return { ...dog, name: '리치', breed: 6, sex: 'female', coat: 'brown' };
}
export function dogDescription(dog: Dog) {
  return [
    dog.coat === 'brown' ? '갈색' : null,
    BREEDS[dog.breed].name,
    dog.sex === 'female' ? '♀ 암컷' : dog.sex === 'male' ? '♂ 수컷' : null,
  ]
    .filter(Boolean)
    .join(' · ');
}
export function partyDogs(s: GameState) {
  return s.party.map((id) => s.dogs.find((d) => d.id === id)!).filter(Boolean);
}
export function currentDog(s: GameState) {
  return s.dogs.find((d) => d.id === s.active)!;
}
function leadWith(s: GameState, id: string) {
  s.party = [id, ...s.party.filter((other) => other !== id)].slice(0, 2);
  s.active = id;
}
export function heroStats(s: GameState) {
  const equipped = [s.weapon, s.equipment.clothes, s.equipment.accessory]
    .filter(Boolean)
    .map((id) => ITEMS[id!]);
  return {
    maxHp: s.hero.maxHp + equipped.reduce((n, i) => n + (i.hp ?? 0), 0),
    attack: s.hero.atk + equipped.reduce((n, i) => n + (i.attack ?? 0), 0),
    charm: s.hero.charm + equipped.reduce((n, i) => n + (i.charm ?? 0), 0),
    defense: equipped.reduce((n, i) => n + (i.defense ?? 0), 0),
  };
}
export function charmNeeded(id: string, region: number) {
  return 5 + region * 5 + (id.endsWith('-b') ? 4 : 0);
}
export function countItem(s: GameState, id: string) {
  return s.bag.reduce((n, v) => n + (v?.item === id ? v.qty : 0), 0);
}
export function bagRoom(s: GameState, id: string) {
  return s.bag.reduce(
    (n, v) => n + (!v ? 9 : v.item === id ? 9 - v.qty : 0),
    0,
  );
}
export function putItem(s: GameState, id: string, qty = 1): boolean {
  if (!ITEMS[id] || !Number.isInteger(qty) || qty < 1 || bagRoom(s, id) < qty)
    return false;
  for (const v of s.bag)
    if (v?.item === id && v.qty < 9) {
      const add = Math.min(9 - v.qty, qty);
      v.qty += add;
      qty -= add;
    }
  for (let i = 0; i < s.bag.length && qty > 0; i++)
    if (!s.bag[i]) {
      const add = Math.min(9, qty);
      s.bag[i] = { item: id, qty: add };
      qty -= add;
    }
  return true;
}
function takeItem(s: GameState, id: string) {
  const i = s.bag.findIndex((v) => v?.item === id);
  if (i < 0) return false;
  if (--s.bag[i]!.qty === 0) s.bag[i] = null;
  return true;
}
export function gatePoints(region: number) {
  return [
    { x: 1024, y: region === 5 ? 850 : 60 },
    { x: 1988, y: 970 },
    { x: 1024, y: 1988 },
    { x: 60, y: 970 },
  ];
}
export function closedGates(region: number) {
  return gatePoints(region)
    .map((p, i) => ({
      ...p,
      index: i,
      x: i === 1 ? 1872 : i === 3 ? 176 : p.x,
      y: i === 0 ? 176 : i === 2 ? 1872 : p.y,
    }))
    .filter((p) => REGIONS[region].neighbors[p.index] < 0);
}
export function walkable(
  x: number,
  y: number,
  region = -1,
  place: Place = 'field',
) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
  if (place === 'shop')
    return (
      y >= 780 &&
      y <= 1875 &&
      (y <= 1600 ? x >= 280 && x <= 1768 : x >= 870 && x <= 1178)
    );
  if (place === 'cave')
    return (
      ((x - 1024) / 245) ** 2 + ((y - 410) / 180) ** 2 <= 1 ||
      (x >= 975 && x <= 1090 && y >= 520 && y <= 780) ||
      ((x - 1024) / 310) ** 2 + ((y - 955) / 280) ** 2 <= 1 ||
      (x >= 420 && x <= 1670 && y >= 1000 && y <= 1100) ||
      ((x - 420) / 210) ** 2 + ((y - 1045) / 135) ** 2 <= 1 ||
      ((x - 1670) / 195) ** 2 + ((y - 1030) / 155) ** 2 <= 1 ||
      (x >= 965 && x <= 1100 && y >= 1190 && y <= 1830)
    );
  const bounds =
    (region !== 5 || y >= 830) &&
    x >= 24 &&
    x <= SIZE - 24 &&
    y >= 24 &&
    y <= SIZE - 24;
  const road = Math.abs(x - 1024) < 87 || Math.abs(y - 970) < 73;
  const plaza = region === 0 && x > 860 && x < 1190 && y > 785 && y < 1125;
  const fountain = region === 0 && Math.hypot(x - 1024, y - 935) < 115;
  const connected =
    region < 0 ||
    closedGates(region).every((p) =>
      p.index === 0
        ? y >= p.y + 22
        : p.index === 1
          ? x <= p.x - 22
          : p.index === 2
            ? y <= p.y - 22
            : x >= p.x + 22,
    );
  return bounds && connected && (road || plaza) && !fountain;
}
export function entities(s: GameState): Entity[] {
  const r = s.region;
  if (s.place === 'shop')
    return [
      {
        id: `counter-${r}`,
        kind: 'merchant',
        name: s.shopType === 'armory' ? '무기상 태오' : '편의점 미로',
        x: 1024,
        y: 820,
      },
      { id: `exit-${r}`, kind: 'exit', name: '상점 출구', x: 1024, y: 1840 },
    ];
  const drops: Entity[] = s.drops
    .filter((d) => d.region === r && (d.place ?? 'field') === s.place)
    .map((d) => ({
      id: d.id,
      kind: 'drop',
      name: `${ITEMS[d.item].name} ×${d.qty}`,
      x: d.x,
      y: d.y,
      item: d.item,
      qty: d.qty,
    }));
  if (s.place === 'cave')
    return [
      ...[0, 1, 2]
        .filter((i) => !s.caveCleared.includes(`cave-${r}-${i}`))
        .map((i) => {
          const creature = i === 0 ? 0 : (r + i) % CAVE_MOBS.length;
          return {
            id: `cave-${r}-${i}`,
            kind: 'enemy' as const,
            name: CAVE_MOBS[creature].name,
            creature,
            x: [530, 1510, 1024][i],
            y: [1100, 1100, 780][i],
          };
        }),
      ...(!s.raids.includes(r)
        ? [
            {
              id: `dragon-${r}`,
              kind: 'enemy' as const,
              name: RAIDS[r].boss,
              dragon: true,
              captain: true,
              x: 1024,
              y: 440,
            },
          ]
        : []),
      ...(!s.rescued.includes(r)
        ? [
            {
              id: `cat-${r}`,
              kind: 'cat' as const,
              name: '갇힌 고양이',
              x: 1210,
              y: 1160,
            },
          ]
        : []),
      {
        id: `cave-exit-${r}`,
        kind: 'exit',
        name: '동굴 밖으로',
        x: 1024,
        y: 1830,
      },
      ...drops,
    ];
  const names = ['구름', '보리', '번개', '초코', '두부', '루나'];
  const list: Entity[] = [
    {
      id: `dog-${r}`,
      kind: 'dog',
      name: names[r],
      breed: [1, 4, 2, 3, 0, 5][r],
      x: 1120,
      y: 1110,
    },
    {
      id: `dog-${r}-b`,
      kind: 'dog',
      name: ['쿠키', '밤이', '솔이', '바다', '철이', '별이'][r],
      breed: [4, 0, 5, 2, 1, 3][r],
      x: 1024,
      y: r === 5 ? 1700 : 360,
    },
    {
      id: `enemy-${r}-0`,
      kind: 'enemy',
      name: '목줄단 정찰병',
      x: 1470,
      y: 1000,
    },
    {
      id: `enemy-${r}-1`,
      kind: 'enemy',
      name: '목줄단 추격자',
      x: 580,
      y: 1000,
    },
    {
      id: `captain-${r}`,
      kind: 'enemy',
      name: '목줄단 지역대장',
      captain: true,
      x: 1024,
      y: r === 5 ? 900 : 610,
    },
    {
      id: `shop-${r}`,
      kind: 'shop',
      name: '편의점',
      shopType: 'convenience',
      x: 840,
      y: 970,
    },
    {
      id: `armory-${r}`,
      kind: 'shop',
      name: '무기상',
      shopType: 'armory',
      x: 1165,
      y: 970,
    },
    {
      id: `rest-${r}`,
      kind: 'rest',
      name: '쉼터 · 무료 회복',
      x: 1024,
      y: 1350,
    },
    {
      id: `raid-entry-${r}`,
      kind: 'cave',
      name: RAIDS[r].name,
      x: 1024,
      y: 1620,
    },
    { id: `loot-${r}`, kind: 'loot', name: '보급 상자', x: 1770, y: 970 },
    { id: `loot-${r}-b`, kind: 'loot', name: '숨겨진 배낭', x: 1024, y: 1790 },
    {
      id: `mob-${r}-0`,
      kind: 'enemy',
      name: '목줄단 순찰병',
      x: 1024,
      y: 1490,
    },
    { id: `mob-${r}-1`, kind: 'enemy', name: '목줄단 경비병', x: 1630, y: 970 },
    ...drops,
    ...(r === 0
      ? [
          {
            id: 'captain-1',
            kind: 'enemy' as const,
            name: '마을 외곽 대장',
            captain: true,
            x: 1024,
            y: 450,
          },
        ]
      : []),
    ...(r === 1
      ? NPCS.map((n) => ({
          id: `npc-${n.id}`,
          kind: 'npc' as const,
          name: n.name,
          npc: n.id,
          x: n.x,
          y: n.y,
        }))
      : []),
  ];
  return list
    .map((e) =>
      e.kind === 'enemy'
        ? {
            ...e,
            name:
              e.id === 'captain-1'
                ? '마을 외곽 대장'
                : ENEMY_LOOKS[enemyLook(e.id, r)].name,
          }
        : e,
    )
    .filter(
      (e) =>
        (r !== 1 || e.kind !== 'enemy') &&
        !s.defeated.includes(e.id) &&
        !s.recruited.includes(e.id) &&
        !s.looted.includes(e.id) &&
        (!(e.id in s.respawnAt) || s.respawnAt[e.id] <= s.seconds),
    );
}
export function nearest(s: GameState) {
  return entities(s)
    .map((e) => ({ ...e, d: Math.hypot(e.x - s.x, e.y - s.y) }))
    .filter((e) => e.d < 105)
    .sort((a, b) => a.d - b.d)[0];
}
export function questProgress(s: GameState, id: string) {
  const q = QUESTS.find((q) => q.id === id);
  return q ? Math.min(q.goal, s.progress[q.metric] ?? 0) : 0;
}
export function actorHp(s: GameState, id: string) {
  return id === 'traveler'
    ? s.hero.hp
    : (s.dogs.find((d) => d.id === id)?.hp ?? 0);
}
export function actorName(s: GameState, id: string) {
  return id === 'traveler'
    ? s.playerName
    : (s.dogs.find((d) => d.id === id)?.name ?? '동료');
}
export function teamCondition(s: GameState) {
  if (!s.battle) return '전투 중에 사용';
  if (s.battle.teamUsed) return '이번 전투에서 이미 사용';
  if (s.battle.turn < 3) return '3턴부터 사용 가능';
  if (s.hero.hp <= 0 || !partyDogs(s).some((d) => d.hp > 0))
    return '여행자와 동료 1마리 이상 필요';
  return '';
}
export type AttackKind = 'attack' | 'tail' | 'skill' | 'team' | 'guard';
export type CombatHit = { actorId: string; slot: number; damage: number };
export type CounterHit = {
  actorId: string;
  damage: number;
  poisonDamage: number;
  breath: boolean;
};
export function combatHits(s: GameState, kind: AttackKind): CombatHit[] {
  if (kind === 'guard') return [];
  const ids =
    kind === 'team'
      ? [
          'traveler',
          ...partyDogs(s)
            .filter((d) => d.hp > 0)
            .map((d) => d.id),
        ]
      : [s.battle?.actor ?? s.active];
  return ids
    .filter((id) => actorHp(s, id) > 0)
    .map((id) => {
      const dog = s.dogs.find((d) => d.id === id),
        base = id === 'traveler' ? heroStats(s).attack : dog!.atk;
      return {
        actorId: id,
        slot: id === 'traveler' ? -1 : s.party.indexOf(id),
        damage:
          Math.round(
            base * (kind === 'team' ? 1.7 : kind === 'tail' ? 0.85 : 1),
          ) +
          (kind === 'skill'
            ? id === 'traveler'
              ? 16
              : 11 + dog!.level * 2
            : 0),
      };
    });
}
export type Action =
  | { type: 'interact'; id: string }
  | { type: AttackKind | 'flee' | 'expand' | 'pickup' }
  | { type: 'item' | 'buy'; id: string; target?: string }
  | { type: 'switch' | 'party' | 'actor' | 'quest'; id: string }
  | { type: 'rename'; name: string }
  | { type: 'dress'; appearance: Appearance }
  | { type: 'travel'; region: number; gate?: boolean; edge?: number };
export type Result = {
  state: GameState;
  message: string;
  event?:
    | 'shop'
    | 'win'
    | 'loss'
    | 'recruit'
    | 'attack'
    | 'enter_shop'
    | 'leave_shop'
    | 'pickup'
    | 'npc'
    | 'quest'
    | 'enter_cave';
  loot?: { item: string; qty: number }[];
  combat?: {
    hits: CombatHit[];
    counters: CounterHit[];
    turnCost: number;
    title: string;
  };
};
export function act(source: GameState, a: Action): Result {
  const s = structuredClone(source),
    fail = (message: string): Result => ({ state: source, message });
  let message = '',
    event: Result['event'],
    loot: Result['loot'],
    combat: Result['combat'];
  if (
    s.battle &&
    [
      'interact',
      'expand',
      'buy',
      'travel',
      'pickup',
      'quest',
      'party',
      'dress',
    ].includes(a.type)
  )
    return fail('전투를 마친 뒤 이용할 수 있어요.');
  if (a.type === 'rename') {
    const name = a.name.trim();
    if (!name || name.length > 12 || /[\u0000-\u001f\u007f]/.test(name))
      return fail('이름을 1~12자로 입력하세요.');
    s.playerName = name;
    return { state: s, message: `이제 ${name}(으)로 모험합니다.` };
  }
  if (a.type === 'dress') {
    if (!validAppearance(a.appearance))
      return fail('꾸미기 정보를 확인해 주세요.');
    s.appearance = { ...a.appearance };
    return { state: s, message: '새로운 모습으로 갈아입었어요!' };
  }
  if (a.type === 'actor') {
    if (!s.battle) return fail('전투 중에 선택하세요.');
    if (a.id !== 'traveler' && !s.party.includes(a.id))
      return fail('동행 중인 친구를 선택하세요.');
    if (actorHp(s, a.id) <= 0) return fail('먼저 회복해 주세요.');
    s.battle.actor = a.id;
    return {
      state: s,
      message: `${actorName(s, a.id)} 혼자 행동합니다. 선택은 턴을 쓰지 않아요.`,
    };
  }
  if (a.type === 'party') {
    const dog = s.dogs.find((d) => d.id === a.id);
    if (!dog) return fail('아직 만나지 못한 동료예요.');
    if (s.party.includes(a.id)) {
      if (s.party.length === 1)
        return fail('최소 한 마리의 동료가 함께해야 해요.');
      s.party = s.party.filter((id) => id !== a.id);
      s.active = s.party[0];
      message = `${dog.name}(이)가 잠시 쉬어요.`;
    } else {
      if (s.party.length === 2)
        return fail(
          '두 마리까지 동행할 수 있어요. 먼저 한 마리의 동행을 해제하세요.',
        );
      s.party.push(a.id);
      message = `${dog.name}(이)도 함께 걷습니다!`;
    }
    return { state: s, message };
  }
  if (a.type === 'switch') {
    const dog = s.dogs.find((d) => d.id === a.id);
    if (!dog) return fail('아직 만나지 못한 동료예요.');
    if (s.battle) return act(source, { type: 'actor', id: a.id });
    leadWith(s, a.id);
    return { state: s, message: `${dog.name}(이)가 앞장섭니다.` };
  }
  if (a.type === 'pickup') return collectDrops(source, 100);
  if (a.type === 'quest') {
    const q = QUESTS.find((q) => q.id === a.id);
    if (!q) return fail('존재하지 않는 의뢰예요.');
    if (
      s.place !== 'field' ||
      s.region !== 1 ||
      !entities(s).some(
        (e) => e.npc === q.npc && Math.hypot(e.x - s.x, e.y - s.y) <= 110,
      )
    )
      return fail('의뢰를 준 마을 주민에게 돌아가세요.');
    if (s.quests[q.id] === 'claimed') return fail('이미 보상을 받은 의뢰예요.');
    if (q.requires && s.quests[q.requires] !== 'claimed')
      return fail(
        `먼저 「${QUESTS.find((x) => x.id === q.requires)!.title}」를 마쳐 주세요.`,
      );
    if (!s.quests[q.id]) {
      s.quests[q.id] = 'active';
      return {
        state: s,
        event: 'quest',
        message: `의뢰 수락: ${q.title}. ${q.description}`,
      };
    }
    if (questProgress(s, q.id) < q.goal)
      return fail(`${q.description} (${questProgress(s, q.id)}/${q.goal})`);
    for (const reward of q.items)
      if (!putItem(s, reward.item, reward.qty))
        return fail('보상을 받을 가방 공간을 먼저 비워 주세요.');
    s.coins += q.coins;
    s.hero.charm += q.charm;
    s.quests[q.id] = 'claimed';
    return {
      state: s,
      event: 'quest',
      message: `「${q.title}」 완료! +${q.coins} 코인 · 매력 +${q.charm}`,
    };
  }
  if (a.type === 'interact') {
    const e = entities(s).find((e) => e.id === a.id);
    if (!e || Math.hypot(e.x - s.x, e.y - s.y) > 110)
      return fail('조금 더 가까이 다가가세요.');
    if (e.kind === 'drop') return collectDrops(source, 145);
    if (e.kind === 'shop') {
      s.outside = { x: s.x, y: s.y };
      s.place = 'shop';
      s.shopType = e.shopType!;
      s.x = 1024;
      s.y = 1660;
      return {
        state: s,
        message: `${e.name}에 들어왔어요. 위쪽 카운터에 말을 걸어 보세요.`,
        event: 'enter_shop',
      };
    }
    if (e.kind === 'merchant')
      return {
        state: s,
        message:
          s.shopType === 'armory'
            ? '무기와 옷, 액세서리를 골라 보세요.'
            : '회복 물품과 강화제, 더 큰 가방이 준비되어 있어요.',
        event: 'shop',
      };
    if (e.kind === 'cave') {
      s.outside = { x: s.x, y: s.y };
      s.place = 'cave';
      s.x = 1024;
      s.y = 1720;
      s.caveCleared = s.caveCleared.filter(
        (id) => !id.startsWith(`cave-${s.region}-`),
      );
      for (const id of Object.keys(s.enemyHealth))
        if (id.startsWith(`cave-${s.region}-`)) delete s.enemyHealth[id];
      s.encounterGraceUntil = s.seconds + 3;
      return {
        state: s,
        message: `${RAIDS[s.region].name} · 수문장 3명을 이기면 보스에게 도전할 수 있어요.`,
        event: 'enter_cave',
      };
    }
    if (e.kind === 'exit') {
      const cave = s.place === 'cave';
      s.place = 'field';
      s.x = s.outside?.x ?? 1024;
      s.y = s.outside?.y ?? 1190;
      delete s.outside;
      s.encounterGraceUntil = s.seconds + 5;
      return {
        state: s,
        message: cave
          ? '동굴에서 나왔어요. 쉼터에서 회복하고 다시 도전할 수 있어요.'
          : '상점 밖으로 나왔어요.',
        event: cave ? undefined : 'leave_shop',
      };
    }
    if (e.kind === 'npc') {
      const npc = NPCS.find((n) => n.id === e.npc)!;
      s.npc = npc.id;
      if (!s.talked.includes(npc.id)) s.talked.push(npc.id);
      s.progress.rumors = s.talked.filter((id) => id !== 'elder').length;
      return { state: s, message: `${npc.name}: ${npc.line}`, event: 'npc' };
    }
    if (e.kind === 'cat') {
      if (
        [0, 1, 2].some((i) => !s.caveCleared.includes(`cave-${s.region}-${i}`))
      )
        return fail('수문장 세 명을 이겨 고양이를 지키는 잠금을 풀어 주세요.');
      s.rescued.push(s.region);
      s.progress.cats = s.rescued.length;
      s.hero.charm += 1;
      s.coins += 100;
      return {
        state: s,
        message: '야옹! 고양이가 무사히 돌아갔어요. 매력 +1 · 100 코인',
        event: 'quest',
      };
    }
    if (e.kind === 'rest') {
      s.hero.hp = heroStats(s).maxHp;
      s.hero.poison = false;
      s.dogs.forEach((d) => {
        d.hp = d.maxHp;
        d.poison = false;
      });
      return {
        state: s,
        message: '여행자와 모든 동료가 완전히 회복했어요. 중독도 사라졌습니다.',
      };
    }
    if (e.kind === 'loot') {
      if (!putItem(s, 'potion', 2)) return fail('가방 공간이 부족해요.');
      s.looted.push(e.id);
      s.coins += 60;
      return { state: s, message: '회복 포션 2개와 60 코인을 찾았어요!' };
    }
    if (e.kind === 'dog') {
      const needed = charmNeeded(e.id, s.region),
        charm = heroStats(s).charm;
      if (charm < needed)
        return fail(
          `${e.name}: 조금 더 친해지고 싶어요! 매력 ${charm}/${needed} 필요. 주민을 돕거나 액세서리를 착용해 보세요. 간식은 소모되지 않았어요.`,
        );
      if (!takeItem(s, 'treat'))
        return fail('친구 간식이 필요해요. 편의점에서 구할 수 있어요.');
      s.dogs.push(makeDog(e.id, e.name, e.breed!, Math.max(1, s.region + 1)));
      s.recruited.push(e.id);
      if (s.party.length < 2) s.party.push(e.id);
      return {
        state: s,
        message: `매력으로 마음을 열었어요! ${e.name}(이)가 새로운 친구가 되었습니다.`,
        event: 'recruit',
      };
    }
    if (e.kind === 'enemy') {
      const living = partyDogs(s).find((d) => d.hp > 0);
      if (!living && s.hero.hp <= 0)
        return fail('쉼터에서 먼저 회복해 주세요.');
      if (
        e.id === 'captain-5' &&
        s.defeated.filter((id) => id.startsWith('captain-')).length < 5
      )
        return fail('마을 밖의 다섯 대장을 먼저 쓰러뜨리세요.');
      if (
        e.dragon &&
        [0, 1, 2].some((i) => !s.caveCleared.includes(`cave-${s.region}-${i}`))
      )
        return fail('수문장 세 명을 먼저 이겨 용의 봉인을 풀어 주세요.');
      if (e.id === 'dragon-5' && s.raids.length < 5)
        return fail('다른 다섯 지역의 용을 먼저 해방해 주세요.');
      s.battle = {
        enemy: enemyStats(s, e),
        turn: 1,
        cooldown: 0,
        teamUsed: false,
        actor: living?.id ?? 'traveler',
        log: [`${e.name}(이)가 나타났다!`],
      };
      return {
        state: s,
        message: e.dragon
          ? RAIDS[s.region].hint
          : '행동할 한 명을 선택하세요. 협공은 3턴부터 전투당 한 번 사용할 수 있어요.',
      };
    }
  }
  if (a.type === 'expand')
    return fail(
      '편의점에서 원하는 크기의 가방을 구입하세요. 최대 1000칸까지 늘릴 수 있어요.',
    );
  if (a.type === 'buy') {
    const item = ITEMS[a.id];
    if (!item) return fail('알 수 없는 아이템이에요.');
    if (
      s.place !== 'shop' ||
      !entities(s).some(
        (e) => e.kind === 'merchant' && Math.hypot(e.x - s.x, e.y - s.y) <= 110,
      )
    )
      return fail('상점 안의 상인에게 가까이 가세요.');
    if (item.shop !== s.shopType)
      return fail(
        item.shop === 'armory'
          ? '무기상에서 판매하는 장비예요.'
          : '편의점에서 판매하는 물건이에요.',
      );
    if (item.slot && countItem(s, a.id) > 0)
      return fail('이미 보유한 장비예요.');
    if (item.capacity && s.capacity >= item.capacity)
      return fail('현재 가방이 같거나 더 큽니다.');
    if (s.coins < item.price) return fail('코인이 부족해요.');
    if (item.capacity) {
      s.bag.push(...Array(item.capacity - s.capacity).fill(null));
      s.capacity = item.capacity;
    } else if (!putItem(s, a.id)) return fail('가방이 가득 찼어요.');
    s.coins -= item.price;
    if (item.slot) equip(s, a.id, item.slot);
    return {
      state: s,
      message: item.capacity
        ? `${item.name} 구입! 기존 아이템을 그대로 보관하고 ${s.capacity}칸으로 확장했어요.`
        : `${item.name} 구입${item.slot ? ' · 장착' : ''}!`,
    };
  }
  if (a.type === 'item') {
    const item = ITEMS[a.id];
    if (!item || !countItem(s, a.id))
      return fail('가지고 있지 않은 아이템이에요.');
    const target = a.target ?? s.battle?.actor ?? s.active;
    if (target !== 'traveler' && !s.dogs.some((d) => d.id === target))
      return fail('대상을 선택하세요.');
    if (s.battle && target !== 'traveler' && !s.party.includes(target))
      return fail('전투 중에는 동행 중인 동료만 회복할 수 있어요.');
    if (item.slot) {
      if (s.battle) return fail('장비는 전투 전에 장착하세요.');
      equip(s, a.id, item.slot);
      return { state: s, message: `${item.name} 장착! ${item.desc}` };
    }
    if (a.id === 'treat')
      return fail(
        '강아지에게 다가가 말을 걸어 보세요. 필요한 매력을 확인할 수 있어요.',
      );
    if (item.capacity)
      return fail('가방은 편의점에서 구입하는 즉시 확장됩니다.');
    const who =
      target === 'traveler' ? s.hero : s.dogs.find((d) => d.id === target)!;
    const max = target === 'traveler' ? heroStats(s).maxHp : who.maxHp;
    if (
      (item.target === 'owner' && target !== 'traveler') ||
      (item.target === 'dog' && target === 'traveler')
    )
      return fail(
        item.target === 'owner'
          ? '여행자에게 사용하는 물품이에요.'
          : '강아지에게 사용하는 물품이에요.',
      );
    if (item.boost) {
      if (s.battle) return fail('강화는 전투가 끝난 뒤 할 수 있어요.');
      if (
        (item.boost === 'owner' && target !== 'traveler') ||
        (item.boost === 'dog' && target === 'traveler')
      )
        return fail('강화 아이템에 맞는 대상을 선택하세요.');
      if ((who.boosts ?? 0) >= 20)
        return fail('이 대상은 최대 20회 강화했어요.');
      who.boosts = (who.boosts ?? 0) + 1;
      who.atk += 2;
      who.maxHp += 8;
      who.hp += 8;
    } else if (item.antidote) {
      if (!who.poison) return fail('중독 상태가 아니에요.');
      who.poison = false;
    } else if (item.heal) {
      if (who.hp >= max) return fail('이미 체력이 가득 차 있어요.');
      if (who.hp <= 0 && !item.revive)
        return fail('쓰러졌을 때는 든든한 도시락이 필요해요.');
      who.hp = Math.min(max, who.hp + item.heal);
    } else return fail('사용할 수 없는 아이템이에요.');
    takeItem(s, a.id);
    message = `${actorName(s, target)}에게 ${item.name} 사용!`;
    if (s.battle) {
      s.battle.log.push(message);
      enemyTurn(s, s.battle.actor, 1);
    }
  }
  if (['attack', 'tail', 'skill', 'team', 'guard'].includes(a.type)) {
    if (!s.battle) return fail('전투 중에 사용할 수 있어요.');
    const kind = a.type as AttackKind,
      b = s.battle;
    if (actorHp(s, b.actor) <= 0)
      return fail('행동할 수 있는 대상을 선택하세요.');
    if (kind === 'team' && teamCondition(s)) return fail(teamCondition(s));
    if (kind === 'skill' && b.cooldown > 0)
      return fail(`${b.cooldown}턴 뒤에 기술을 쓸 수 있어요.`);
    if (kind === 'tail' && b.actor === 'traveler')
      return fail('꼬리치기는 강아지만 사용할 수 있어요.');
    const hits: CombatHit[] = [];
    for (const hit of combatHits(s, kind)) {
      if (b.enemy.hp <= 0) break;
      const damage = Math.min(b.enemy.hp, hit.damage);
      hits.push({ ...hit, damage });
      b.enemy.hp -= damage;
    }
    s.enemyHealth[b.enemy.id] = b.enemy.hp;
    const turnCost = kind === 'team' ? 2 : 1;
    const title =
      kind === 'team'
        ? '별빛 협공'
        : kind === 'guard'
          ? '방어'
          : kind === 'tail'
            ? '회전 꼬리치기'
            : kind === 'skill'
              ? b.actor === 'traveler'
                ? '집중 베기'
                : BREEDS[s.dogs.find((d) => d.id === b.actor)!.breed].skill
              : '단독 공격';
    message = `${kind === 'team' ? '모두 함께' : actorName(s, b.actor)} · ${title}${hits.length ? `! ${hits.reduce((n, h) => n + h.damage, 0)} 피해` : '! 다음 반격 피해 70% 감소'}`;
    b.log.push(message);
    event = 'attack';
    if (kind === 'team') b.teamUsed = true;
    if (kind === 'skill') b.cooldown = 3;
    combat = {
      hits,
      counters: [],
      turnCost,
      title:
        kind === 'team'
          ? '별빛 협공 · 2턴'
          : `${actorName(s, b.actor)} · ${title}`,
    };
    if (b.enemy.hp <= 0) {
      const en = b.enemy;
      const reward =
        (en.dragon ? 380 : en.captain ? 155 : 65) +
        en.region * (en.dragon ? 110 : 30);
      s.coins += reward;
      s.kills++;
      loot = dropRewards(s, en);
      s.encounterGraceUntil = s.seconds + 4;
      if (en.id.startsWith('cave-')) {
        s.caveCleared.push(en.id);
        if (en.creature === 0) s.progress.rats = (s.progress.rats ?? 0) + 1;
      } else if (en.dragon) {
        s.raids.push(s.region);
        s.progress[`raid-${s.region}`] = 1;
        s.hero.charm += 2;
      } else if (en.id.startsWith('mob-')) s.respawnAt[en.id] = s.seconds + 45;
      else {
        s.defeated.push(en.id);
        if (en.id.startsWith('enemy-'))
          s.progress.thieves = (s.progress.thieves ?? 0) + 1;
      }
      for (const member of partyDogs(s)) {
        member.xp += 35 + en.region * 15 + (en.captain ? 45 : 0);
        member.bond++;
        while (member.xp >= member.level * 45) {
          member.xp -= member.level * 45;
          member.level++;
          member.maxHp += 10;
          member.atk += 3;
          member.hp = member.maxHp;
        }
      }
      s.battle = null;
      message = `승리! +${reward} 코인 · 전리품 ${loot.reduce((n, v) => n + v.qty, 0)}개${en.dragon ? ' · 용 해방! 매력 +2' : ''}`;
      event = 'win';
      if (en.id === 'captain-5') s.won = true;
    } else {
      for (let i = 0; i < turnCost; i++) {
        const preferred =
          kind === 'team' ? (i === 0 ? 'traveler' : s.active) : b.actor;
        const target =
          actorHp(s, preferred) > 0
            ? preferred
            : ['traveler', ...s.party].find((id) => actorHp(s, id) > 0);
        if (!target) break;
        combat.counters.push(
          enemyTurn(
            s,
            target,
            kind === 'guard' ? 0.3 : kind === 'tail' ? 0.75 : 1,
          ),
        );
      }
    }
  }
  if (a.type === 'flee') {
    if (!s.battle) return fail('진행 중인 전투가 없어요.');
    s.battle = null;
    s.encounterGraceUntil = s.seconds + 6;
    if (walkable(s.x, s.y + 110, s.region, s.place)) s.y += 110;
    message = '안전하게 물러났어요. 회복한 뒤 다시 도전하세요.';
  }
  if (a.type === 'travel') {
    if (s.place !== 'field') return fail('밖으로 나온 뒤 이동하세요.');
    if (!REGIONS[a.region]) return fail('존재하지 않는 지역이에요.');
    if (a.gate) {
      const edge = (s.region === 5 ? s.y < 860 : s.y < 80)
        ? 0
        : s.x > SIZE - 80
          ? 1
          : s.y > SIZE - 80
            ? 2
            : s.x < 80
              ? 3
              : -1;
      if (edge < 0 || REGIONS[s.region].neighbors[edge] !== a.region)
        return fail('연결된 출구 가까이로 이동하세요.');
      s.x = edge === 1 ? 90 : edge === 3 ? SIZE - 90 : 1024;
      s.y = edge === 2 ? 90 : edge === 0 ? SIZE - 90 : 970;
    } else {
      if (!s.visited.includes(a.region))
        return fail('먼저 연결된 길로 이 지역을 발견하세요.');
      s.x = 1024;
      s.y = 1190;
    }
    s.region = a.region;
    if (s.region === 5 && s.y < 860) s.y = 900;
    if (!s.visited.includes(a.region)) s.visited.push(a.region);
    s.encounterGraceUntil = s.seconds + 4;
    message = `${REGIONS[a.region].name}에 도착했어요.`;
  }
  if (s.battle) {
    s.battle.log = s.battle.log.slice(-6);
    if (actorHp(s, s.battle.actor) <= 0) {
      const next = ['traveler', ...s.party].find((id) => actorHp(s, id) > 0);
      if (next) s.battle.actor = next;
    }
    if (!['traveler', ...s.party].some((id) => actorHp(s, id) > 0)) {
      s.battle = null;
      s.place = 'field';
      delete s.outside;
      s.region = 1;
      s.x = 1024;
      s.y = 1350;
      if (!s.visited.includes(1)) s.visited.push(1);
      s.encounterGraceUntil = s.seconds + 5;
      s.coins = Math.floor(s.coins * 0.95);
      s.hero.hp = heroStats(s).maxHp;
      s.hero.poison = false;
      s.dogs.forEach((d) => {
        d.hp = d.maxHp;
        d.poison = false;
      });
      message =
        '마을 쉼터에서 회복했어요. 코인 5%를 잃었지만 아이템과 진행 상황은 그대로예요.';
      event = 'loss';
    }
  }
  const ready = QUESTS.filter(
    (q) =>
      s.quests[q.id] === 'active' &&
      questProgress(source, q.id) < q.goal &&
      questProgress(s, q.id) >= q.goal,
  );
  if (ready.length)
    message += ` · 의뢰 달성: ${ready.map((q) => q.title).join(', ')}. 마을 주민에게 보상을 받으세요!`;
  return { state: s, message, event, loot, combat };
}
function equip(s: GameState, id: string, slot: EquipmentSlot) {
  const oldMax = heroStats(s).maxHp;
  if (slot === 'weapon') s.weapon = id;
  else s.equipment[slot] = id;
  const max = heroStats(s).maxHp;
  s.hero.hp = Math.min(max, s.hero.hp + Math.max(0, max - oldMax));
}
export function enemyStats(s: GameState, e: Entity): Enemy {
  const maxHp = e.dragon
    ? 210 + s.region * 55
    : e.creature !== undefined
      ? 60 + s.region * 20
      : (e.captain ? 125 : 45) + s.region * (e.captain ? 30 : 18);
  const damaged = s.enemyHealth[e.id];
  return {
    id: e.id,
    name: e.name,
    hp: damaged > 0 ? Math.min(damaged, maxHp) : maxHp,
    maxHp,
    atk: (e.dragon ? 14 : e.captain ? 12 : 8) + s.region * 3,
    captain: !!e.captain,
    region: s.region,
    dragon: e.dragon,
    creature: e.creature,
  };
}
export function enemyIntent(s: GameState) {
  const b = s.battle;
  if (!b) return '';
  return b.enemy.dragon && b.turn % 3 === 0
    ? `${RAIDS[s.region].move} 예고 · 강한 공격!`
    : '일반 반격';
}
function enemyTurn(s: GameState, id: string, multiplier: number): CounterHit {
  const b = s.battle!,
    who = id === 'traveler' ? s.hero : s.dogs.find((d) => d.id === id)!,
    breath = !!b.enemy.dragon && b.turn % 3 === 0;
  const defense =
    id === 'traveler' ? heroStats(s).defense : Math.floor((who as Dog).level);
  const damage = Math.min(
    who.hp,
    Math.max(
      1,
      Math.round(
        Math.max(2, b.enemy.atk * (breath ? 1.9 : 1) - defense) * multiplier,
      ),
    ),
  );
  who.hp -= damage;
  if (
    ((breath && s.region === 2) ||
      (b.enemy.creature === 3 && b.turn % 2 === 0)) &&
    who.hp > 0
  )
    who.poison = true;
  const poisonDamage = who.poison ? Math.min(who.hp, 4) : 0;
  who.hp -= poisonDamage;
  b.log.push(
    `${b.enemy.name} ${breath ? RAIDS[s.region].move : '반격'}! ${actorName(s, id)} −${damage}${poisonDamage ? ` · 중독 −${poisonDamage}` : ''} HP`,
  );
  b.turn++;
  b.cooldown = Math.max(0, b.cooldown - 1);
  return { actorId: id, damage, poisonDamage, breath };
}
function dropRewards(s: GameState, en: Enemy) {
  const actor = entities(s).find((e) => e.id === en.id),
    origin = { x: actor?.x ?? s.x, y: actor?.y ?? s.y };
  const rewards = [
    { item: 'potion', qty: 3 },
    { item: 'berry', qty: 4 },
    { item: 'treat', qty: 2 },
    { item: 'potion', qty: 2 },
    { item: 'berry', qty: 3 },
    { item: 'antidote', qty: 1 },
  ];
  if (en.captain) {
    rewards.forEach((r) => (r.qty *= 2));
    rewards.push(
      { item: 'revive', qty: 2 },
      { item: 'dogtonic', qty: 1 },
      { item: 'tonic', qty: 1 },
    );
  }
  if (en.captain && !en.dragon)
    rewards.push(
      { item: 'treat', qty: 3 },
      {
        item: en.region >= 4 ? 'stun' : en.region >= 2 ? 'sword' : 'bat',
        qty: 1,
      },
    );
  if (en.dragon)
    rewards.push({
      item: en.region >= 4 ? 'lunar' : en.region >= 2 ? 'stun' : 'sword',
      qty: 1,
    });
  else if (s.kills % 4 === 0) rewards.push({ item: 'dogtonic', qty: 1 });
  rewards.forEach((reward, i) => {
    const angle = i * 2.399963 + s.kills * 0.6,
      radius = 40 + (i % 3) * 27,
      tx = origin.x + Math.cos(angle) * radius,
      ty = origin.y + Math.sin(angle) * radius;
    let x = s.x,
      y = s.y,
      best = Infinity;
    for (let yy = ty - 120; yy <= ty + 120; yy += 12)
      for (let xx = tx - 120; xx <= tx + 120; xx += 12) {
        const dist = (xx - tx) ** 2 + (yy - ty) ** 2;
        if (
          dist < best &&
          walkable(Math.round(xx), Math.round(yy), s.region, s.place)
        ) {
          x = Math.round(xx);
          y = Math.round(yy);
          best = dist;
        }
      }
    const same = s.drops.find(
      (d) =>
        d.region === s.region &&
        (d.place ?? 'field') === s.place &&
        d.item === reward.item,
    );
    if (
      same &&
      s.drops.filter(
        (d) => d.region === s.region && (d.place ?? 'field') === s.place,
      ).length >= 60
    ) {
      same.qty += reward.qty;
      return;
    }
    s.drops.push({
      id: `drop-${s.kills}-${i}`,
      region: s.region,
      place: s.place === 'cave' ? 'cave' : 'field',
      x,
      y,
      originX: origin.x,
      originY: origin.y,
      item: reward.item,
      qty: reward.qty,
      createdAt: s.seconds,
    });
  });
  return rewards;
}
function collectDrops(source: GameState, radius: number): Result {
  if (source.place === 'shop' || source.battle)
    return { state: source, message: '탐험 중에 전리품을 주울 수 있어요.' };
  const nearby = source.drops.filter(
    (d) =>
      d.region === source.region &&
      (d.place ?? 'field') === source.place &&
      Math.hypot(d.x - source.x, d.y - source.y) <= radius,
  );
  if (!nearby.length)
    return { state: source, message: '전리품 가까이로 이동하세요.' };
  const s = structuredClone(source),
    picked: Record<string, number> = {};
  let remaining = false;
  for (const original of nearby) {
    const drop = s.drops.find((d) => d.id === original.id)!;
    const qty = Math.min(drop.qty, bagRoom(s, drop.item));
    if (qty > 0 && putItem(s, drop.item, qty)) {
      drop.qty -= qty;
      picked[drop.item] = (picked[drop.item] ?? 0) + qty;
    }
    if (drop.qty) remaining = true;
  }
  s.drops = s.drops.filter((d) => d.qty > 0);
  if (!Object.keys(picked).length)
    return {
      state: source,
      message: '가방이 가득 찼어요. 전리품은 바닥에 남아 있습니다.',
    };
  return {
    state: s,
    event: 'pickup',
    message: `${Object.entries(picked)
      .map(([id, n]) => `${ITEMS[id].icon} ${ITEMS[id].name} +${n}`)
      .join(' · ')}${remaining ? ' · 남은 전리품은 바닥에 있어요.' : ''}`,
  };
}
export function packSave(s: GameState) {
  return JSON.stringify({
    game: 'tails-city',
    savedAt: new Date().toISOString(),
    state: s,
  });
}
export function unpackSave(text: string): GameState {
  if (text.length > 600000) throw Error('저장 파일이 너무 큽니다.');
  const p = JSON.parse(text),
    s = p?.state;
  const int = (v: unknown, min: number, max: number) =>
    Number.isInteger(v) && Number(v) >= min && Number(v) <= max;
  const ids = (v: unknown, re: RegExp, max: number) =>
    Array.isArray(v) &&
    v.length <= max &&
    new Set(v).size === v.length &&
    v.every((x) => typeof x === 'string' && re.test(x));
  const bad = () => {
    throw Error('테일즈 시티 저장 파일 형식이 올바르지 않습니다.');
  };
  if (
    p.game !== 'tails-city' ||
    !s ||
    s.version !== 1 ||
    !int(s.region, 0, 5) ||
    !Number.isFinite(s.x) ||
    !Number.isFinite(s.y) ||
    s.x < 24 ||
    s.x > 2024 ||
    s.y < 24 ||
    s.y > 2024 ||
    !int(s.coins, 0, 99999999) ||
    !int(s.capacity, 25, 1000) ||
    (s.capacity - 25) % 5 !== 0 ||
    !Array.isArray(s.bag) ||
    s.bag.length !== s.capacity ||
    !s.bag.every(
      (v: Slot) =>
        v === null || (v && Object.hasOwn(ITEMS, v.item) && int(v.qty, 1, 9)),
    ) ||
    !Array.isArray(s.dogs) ||
    s.dogs.length < 1 ||
    s.dogs.length > 13 ||
    !s.dogs.every(
      (d: Dog) =>
        d &&
        typeof d.id === 'string' &&
        /^(starter|dog-[0-5](-b)?)$/.test(d.id) &&
        typeof d.name === 'string' &&
        d.name.length > 0 &&
        d.name.length <= 20 &&
        int(d.breed, 0, BREEDS.length - 1) &&
        (d.sex === undefined || d.sex === 'female' || d.sex === 'male') &&
        (d.coat === undefined || d.coat === 'brown') &&
        int(d.level, 1, 999) &&
        int(d.xp, 0, 999999) &&
        int(d.hp, 0, d.maxHp) &&
        int(d.maxHp, 1, 99999) &&
        int(d.atk, 1, 99999) &&
        int(d.bond, 0, 999999) &&
        (d.poison === undefined || typeof d.poison === 'boolean') &&
        int(d.boosts ?? 0, 0, 20),
    ) ||
    new Set(s.dogs.map((d: Dog) => d.id)).size !== s.dogs.length ||
    !s.dogs.some((d: Dog) => d.id === s.active) ||
    !ids(s.defeated, /^(enemy-[0-5]-[01]|captain-[0-5])$/, 18) ||
    !ids(s.recruited, /^dog-[0-5](-b)?$/, 12) ||
    !ids(s.looted, /^loot-[0-5](-b)?$/, 12) ||
    !Array.isArray(s.visited) ||
    !s.visited.includes(s.region) ||
    !s.visited.every((n: number) => int(n, 0, 5)) ||
    !int(s.steps, 0, 999999999) ||
    !int(s.seconds, 0, 999999999) ||
    typeof s.won !== 'boolean'
  )
    bad();
  const defaults = newGame(),
    legacy = s.hero === undefined,
    place = s.place ?? 'field',
    appearance = s.appearance ?? defaultAppearance(),
    playerName = s.playerName ?? '여행자',
    party = s.party ?? [
      s.active,
      ...s.dogs
        .filter((d: Dog) => d.id !== s.active)
        .slice(0, 1)
        .map((d: Dog) => d.id),
    ];
  if (
    !['field', 'shop', 'cave'].includes(place) ||
    !validAppearance(appearance) ||
    typeof playerName !== 'string' ||
    playerName !== playerName.trim() ||
    !playerName ||
    playerName.length > 12 ||
    /[\u0000-\u001f\u007f]/.test(playerName) ||
    !Array.isArray(party) ||
    party.length < 1 ||
    party.length > 2 ||
    new Set(party).size !== party.length ||
    party[0] !== s.active ||
    !party.every((id: unknown) => s.dogs.some((d: Dog) => d.id === id))
  )
    bad();
  const weapon = s.weapon ?? null,
    equipment = s.equipment ?? defaults.equipment,
    hero = s.hero ?? defaults.hero;
  if (
    !hero ||
    !int(hero.maxHp, 1, 99999) ||
    !int(hero.hp, 0, 199999) ||
    !int(hero.atk, 1, 99999) ||
    !int(hero.charm, 0, 99999) ||
    !int(hero.boosts, 0, 20) ||
    typeof hero.poison !== 'boolean' ||
    !equipment
  )
    bad();
  for (const [slot, id] of Object.entries({ weapon, ...equipment }))
    if (
      !['weapon', 'clothes', 'accessory'].includes(slot) ||
      (id !== null &&
        (typeof id !== 'string' ||
          !Object.hasOwn(ITEMS, id) ||
          ITEMS[id].slot !== slot ||
          !s.bag.some((v: Slot) => v?.item === id)))
    )
      bad();
  if (equipment.clothes === undefined || equipment.accessory === undefined)
    bad();
  const enemyHealth = s.enemyHealth ?? {},
    respawnAt = s.respawnAt ?? {};
  const record = (value: unknown) =>
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.entries(value).length <= 70 &&
    Object.entries(value).every(
      ([id, n]) =>
        /^(enemy-[0-5]-[01]|captain-[0-5]|mob-[0-5]-[01]|cave-[0-5]-[012]|dragon-[0-5])$/.test(
          id,
        ) && int(n, 0, 999999999),
    );
  if (
    !record(enemyHealth) ||
    !record(respawnAt) ||
    !int(s.kills ?? 0, 0, 999999999) ||
    !int(s.encounterGraceUntil ?? 0, 0, 999999999) ||
    !['convenience', 'armory'].includes(s.shopType ?? 'convenience')
  )
    bad();
  const quests = s.quests ?? {},
    progress = s.progress ?? {},
    talked = s.talked ?? [],
    rescued = s.rescued ?? [],
    raids = s.raids ?? [],
    caveCleared = s.caveCleared ?? [];
  const regionList = (v: unknown) =>
    Array.isArray(v) &&
    v.length <= 6 &&
    new Set(v).size === v.length &&
    v.every((n) => int(n, 0, 5));
  if (
    !quests ||
    Array.isArray(quests) ||
    Object.entries(quests).some(
      ([id, v]) =>
        !QUESTS.some((q) => q.id === id) ||
        !['active', 'claimed'].includes(String(v)),
    ) ||
    !progress ||
    Array.isArray(progress) ||
    Object.entries(progress).some(
      ([id, v]) =>
        !QUESTS.some((q) => q.metric === id) || !int(v, 0, 999999999),
    ) ||
    !ids(talked, /^(elder|detective|vet|worker)$/, 4) ||
    !regionList(rescued) ||
    !regionList(raids) ||
    !ids(caveCleared, /^cave-[0-5]-[012]$/, 18) ||
    (s.npc !== undefined && s.npc !== null && !NPCS.some((n) => n.id === s.npc))
  )
    bad();
  const drops = s.drops ?? [];
  if (
    !Array.isArray(drops) ||
    drops.length > 850 ||
    new Set(drops.map((d: Drop) => d?.id)).size !== drops.length ||
    !drops.every(
      (d: Drop) =>
        d &&
        /^drop-[0-9]+-[0-9]+$/.test(d.id) &&
        int(d.region, 0, 5) &&
        Object.hasOwn(ITEMS, d.item) &&
        int(d.qty, 1, 999999999) &&
        int(d.createdAt, 0, s.seconds) &&
        ['field', 'cave'].includes(d.place ?? 'field') &&
        Number.isFinite(d.x) &&
        Number.isFinite(d.y) &&
        d.x >= 24 &&
        d.x <= 2024 &&
        d.y >= 24 &&
        d.y <= 2024 &&
        (legacy || walkable(d.x, d.y, d.region, d.place ?? 'field')) &&
        Number.isFinite(d.originX) &&
        Number.isFinite(d.originY) &&
        d.originX >= 0 &&
        d.originX <= SIZE &&
        d.originY >= 0 &&
        d.originY <= SIZE,
    )
  )
    bad();
  if (
    place !== 'field' &&
    (!s.outside ||
      !Number.isFinite(s.outside.x) ||
      !Number.isFinite(s.outside.y) ||
      !walkable(s.outside.x, s.outside.y, s.region))
  )
    bad();
  if (!walkable(s.x, s.y, s.region, place)) {
    if (!legacy) bad();
    s.x = 1024;
    s.y = 1190;
  }
  if (legacy)
    for (const drop of drops)
      if (!walkable(drop.x, drop.y, drop.region)) {
        drop.x = 1024;
        drop.y = 1190;
      }
  const result: GameState = {
    ...s,
    appearance: { ...appearance },
    playerName,
    party,
    drops,
    place,
    weapon,
    equipment,
    hero,
    enemyHealth,
    respawnAt,
    quests,
    progress,
    talked,
    rescued,
    raids,
    caveCleared,
    npc: s.npc ?? null,
    shopType: s.shopType ?? 'convenience',
    kills: s.kills ?? 0,
    encounterGraceUntil: s.encounterGraceUntil ?? 0,
    dogs: s.dogs.map((dog: Dog) => (dog.id === 'starter' ? asRichi(dog) : dog)),
    battle: null,
  };
  if (result.hero.hp > heroStats(result).maxHp) bad();
  return result;
}
