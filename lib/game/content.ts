import { createCatalog } from './item-catalog.ts';
export type EquipmentSlot = 'weapon' | 'clothes' | 'accessory';
export type ItemDef = {
  level: number;
  rarity: number;
  name: string;
  icon: string;
  desc: string;
  price: number;
  shop: 'convenience' | 'armory';
  heal?: number;
  target?: 'owner' | 'dog' | 'any';
  revive?: boolean;
  antidote?: boolean;
  boost?: 'owner' | 'dog';
  capacity?: number;
  slot?: EquipmentSlot;
  attack?: number;
  hp?: number;
  charm?: number;
  defense?: number;
};
const BASE_ITEMS: Record<string, Omit<ItemDef, 'level' | 'rarity'>> = {
  treat: {
    name: '친구 간식',
    icon: '🦴',
    desc: '매력 조건을 만족한 강아지에게 주면 친구가 됩니다. 실패 시 소모하지 않아요.',
    price: 35,
    shop: 'convenience',
  },
  berry: {
    name: '산딸기',
    icon: '🍓',
    desc: '선택한 대상 HP +25',
    price: 15,
    shop: 'convenience',
    heal: 25,
    target: 'any',
  },
  potion: {
    name: '회복 포션',
    icon: '🧪',
    desc: '선택한 대상 HP +60',
    price: 45,
    shop: 'convenience',
    heal: 60,
    target: 'any',
  },
  milk: {
    name: '든든한 우유',
    icon: '🥛',
    desc: '여행자 HP +100',
    price: 65,
    shop: 'convenience',
    heal: 100,
    target: 'owner',
  },
  deluxe: {
    name: '특제 영양식',
    icon: '🥩',
    desc: '강아지 HP +150',
    price: 95,
    shop: 'convenience',
    heal: 150,
    target: 'dog',
  },
  revive: {
    name: '든든한 도시락',
    icon: '🍱',
    desc: '선택한 대상을 완전히 회복하고 다시 일으킵니다.',
    price: 150,
    shop: 'convenience',
    heal: 99999,
    target: 'any',
    revive: true,
  },
  antidote: {
    name: '해독약',
    icon: '💊',
    desc: '선택한 대상의 중독을 치료합니다. 중독은 행동 후 HP를 4 잃습니다.',
    price: 30,
    shop: 'convenience',
    antidote: true,
    target: 'any',
  },
  dogtonic: {
    name: '튼튼 멍멍 영양제',
    icon: '🐾',
    desc: '선택한 강아지 공격 +2, 최대 HP +8. 최대 20회 강화.',
    price: 280,
    shop: 'convenience',
    boost: 'dog',
  },
  tonic: {
    name: '여행자 훈련 비타민',
    icon: '💪',
    desc: '여행자 공격 +2, 최대 HP +8. 최대 20회 강화.',
    price: 280,
    shop: 'convenience',
    boost: 'owner',
  },
  bag50: {
    name: '산책 배낭 · 50칸',
    icon: '🎒',
    desc: '가방 용량을 50칸으로 늘립니다.',
    price: 240,
    shop: 'convenience',
    capacity: 50,
  },
  bag100: {
    name: '등산 배낭 · 100칸',
    icon: '🎒',
    desc: '가방 용량을 100칸으로 늘립니다.',
    price: 700,
    shop: 'convenience',
    capacity: 100,
  },
  bag200: {
    name: '탐험 배낭 · 200칸',
    icon: '🧳',
    desc: '가방 용량을 200칸으로 늘립니다.',
    price: 1600,
    shop: 'convenience',
    capacity: 200,
  },
  bag400: {
    name: '구조대 가방 · 400칸',
    icon: '🧳',
    desc: '가방 용량을 400칸으로 늘립니다.',
    price: 3400,
    shop: 'convenience',
    capacity: 400,
  },
  bag700: {
    name: '용의 보물 가방 · 700칸',
    icon: '🧰',
    desc: '가방 용량을 700칸으로 늘립니다.',
    price: 6400,
    shop: 'convenience',
    capacity: 700,
  },
  bag1000: {
    name: '별빛 공간 가방 · 1000칸',
    icon: '✨',
    desc: '최대 1000칸! 소지품을 보존한 채 용량을 늘립니다.',
    price: 10000,
    shop: 'convenience',
    capacity: 1000,
  },
  bat: {
    name: '나무 방망이',
    icon: '🏏',
    desc: '공격 +6',
    price: 120,
    shop: 'armory',
    slot: 'weapon',
    attack: 6,
  },
  sword: {
    name: '강철 검',
    icon: '🗡️',
    desc: '공격 +14',
    price: 400,
    shop: 'armory',
    slot: 'weapon',
    attack: 14,
  },
  stun: {
    name: '전기 진압봉',
    icon: '⚡',
    desc: '공격 +23',
    price: 900,
    shop: 'armory',
    slot: 'weapon',
    attack: 23,
  },
  lunar: {
    name: '달빛 구조검',
    icon: '⚔️',
    desc: '공격 +36 · 매력 +3',
    price: 2200,
    shop: 'armory',
    slot: 'weapon',
    attack: 36,
    charm: 3,
  },
  dragonblade: {
    name: '용의 심장검',
    icon: '🔥',
    desc: '공격 +50 · 최대 HP +25',
    price: 4800,
    shop: 'armory',
    slot: 'weapon',
    attack: 50,
    hp: 25,
  },
  hoodie: {
    name: '포근한 후드',
    icon: '🧥',
    desc: '최대 HP +25 · 방어 +2',
    price: 180,
    shop: 'armory',
    slot: 'clothes',
    hp: 25,
    defense: 2,
  },
  ranger: {
    name: '숲지기 코트',
    icon: '🥼',
    desc: '최대 HP +45 · 방어 +4 · 매력 +4',
    price: 550,
    shop: 'armory',
    slot: 'clothes',
    hp: 45,
    defense: 4,
    charm: 4,
  },
  starlight: {
    name: '별빛 탐험복',
    icon: '👘',
    desc: '최대 HP +85 · 방어 +7 · 매력 +8',
    price: 1500,
    shop: 'armory',
    slot: 'clothes',
    hp: 85,
    defense: 7,
    charm: 8,
  },
  dragoncoat: {
    name: '용비늘 재킷',
    icon: '🛡️',
    desc: '최대 HP +140 · 방어 +12',
    price: 3200,
    shop: 'armory',
    slot: 'clothes',
    hp: 140,
    defense: 12,
  },
  ribbon: {
    name: '우정 리본',
    icon: '🎀',
    desc: '매력 +5',
    price: 160,
    shop: 'armory',
    slot: 'accessory',
    charm: 5,
  },
  bell: {
    name: '은빛 방울',
    icon: '🔔',
    desc: '매력 +10 · 최대 HP +15',
    price: 550,
    shop: 'armory',
    slot: 'accessory',
    charm: 10,
    hp: 15,
  },
  pendant: {
    name: '별의 펜던트',
    icon: '💎',
    desc: '매력 +18 · 최대 HP +30',
    price: 1400,
    shop: 'armory',
    slot: 'accessory',
    charm: 18,
    hp: 30,
  },
  crown: {
    name: '드래곤의 증표',
    icon: '👑',
    desc: '매력 +26 · 공격 +6 · 최대 HP +40',
    price: 3200,
    shop: 'armory',
    slot: 'accessory',
    charm: 26,
    attack: 6,
    hp: 40,
  },
};
export const ITEMS = createCatalog(BASE_ITEMS);
export const ITEM_ENTRIES = Object.entries(ITEMS);
export const GENERATED_BY_LEVEL = Array.from({ length: 101 }, (_, level) =>
  ITEM_ENTRIES.filter(
    ([id, item]) => id.startsWith('gear-') && item.level === level,
  ),
);
export const WEAPONS: Record<string, { attack: number }> = Object.fromEntries(
  Object.entries(ITEMS)
    .filter(([, i]) => i.slot === 'weapon')
    .map(([id, i]) => [id, { attack: i.attack! }]),
);
export const RAIDS = [
  {
    name: '이끼별 동굴',
    boss: '녹음룡 모스혼',
    element: '신록',
    color: '#6fe4a3',
    move: '덩굴 폭풍',
    hint: '3번째 턴마다 덩굴 폭풍. 방어로 피해를 줄여요.',
  },
  {
    name: '마을 아래 꽃굴',
    boss: '햇살룡 플로라',
    element: '햇살',
    color: '#ffdc70',
    move: '태양 꽃가루',
    hint: '마을은 안전하지만 동굴 안에는 몹이 있어요.',
  },
  {
    name: '보랏빛 독굴',
    boss: '독안개룡 바이올렛',
    element: '맹독',
    color: '#cc8bff',
    move: '맹독 숨결',
    hint: '숨결에 중독될 수 있어요. 해독약을 준비하세요.',
  },
  {
    name: '해저 메아리 동굴',
    boss: '해일룡 네리온',
    element: '파도',
    color: '#79dcff',
    move: '거대한 해일',
    hint: '3번째 턴의 해일을 막고 협공으로 반격하세요.',
  },
  {
    name: '잿불 기계 동굴',
    boss: '강철룡 볼케론',
    element: '용광로',
    color: '#ff996a',
    move: '용광로 포격',
    hint: '방어력 높은 옷과 강화 아이템이 도움이 됩니다.',
  },
  {
    name: '밤의 심장 동굴',
    boss: '그림자룡 녹스',
    element: '그림자',
    color: '#ff739b',
    move: '멸야의 불꽃',
    hint: '다섯 용의 봉인을 해방한 뒤 도전하세요.',
  },
];
export const CAVE_MOBS = [
  { name: '동굴 왕쥐', sprite: 0 },
  { name: '물방울 슬라임', sprite: 1 },
  { name: '수정 박쥐', sprite: 2 },
  { name: '맹독 거미', sprite: 3 },
  { name: '철갑 골렘', sprite: 4 },
  { name: '걸어다니는 버섯', sprite: 5 },
];
export const NPCS = [
  {
    id: 'elder',
    level: 18,
    name: '은별 할머니',
    sprite: 6,
    x: 1024,
    y: 1180,
    line: '검은 목줄단이 동굴 속 용에게 신호 목줄을 채웠단다. 마을 사람들의 이야기를 모아 주겠니?',
  },
  {
    id: 'detective',
    level: 12,
    name: '형사 준',
    sprite: 7,
    x: 1260,
    y: 970,
    line: '도둑들이 훔친 물건을 공원과 항구로 옮겨. 목줄단 정찰병과 추격자를 잡아 단서를 찾아 줘.',
  },
  {
    id: 'vet',
    level: 10,
    name: '수의사 하나',
    sprite: 8,
    x: 1024,
    y: 1460,
    line: '쥐들이 구조 물자를 훔쳐 갔어요. 동굴의 고양이들도 구해 주세요. 구조를 도우면 강아지들이 마음을 열 거예요.',
  },
  {
    id: 'worker',
    level: 15,
    name: '조사대 민',
    sprite: 9,
    x: 650,
    y: 970,
    line: '동굴의 세 수문장을 이기면 용의 봉인이 풀려. 각 지역의 용은 생김새와 숨결이 다르니 조심해!',
  },
];
export type QuestDef = {
  id: string;
  title: string;
  npc: string;
  description: string;
  goal: number;
  metric: string;
  coins: number;
  charm: number;
  requires?: string;
  items: { item: string; qty: number }[];
};
export const QUESTS: QuestDef[] = [
  {
    id: 'rumors',
    title: '사라진 목줄의 비밀',
    npc: 'elder',
    description:
      '연두 마을에서 형사 준, 수의사 하나, 조사대 민에게 이야기를 들어 보세요.',
    goal: 3,
    metric: 'rumors',
    coins: 220,
    charm: 2,
    items: [{ item: 'treat', qty: 3 }],
  },
  {
    id: 'thieves',
    title: '도둑의 꼬리를 잡아라',
    npc: 'detective',
    requires: 'rumors',
    description:
      '마을 밖 목줄단 정찰병·추격자 2명을 잡아 도난 물자를 되찾으세요.',
    goal: 2,
    metric: 'thieves',
    coins: 360,
    charm: 3,
    items: [{ item: 'tonic', qty: 1 }],
  },
  {
    id: 'rats',
    title: '쥐 소탕 대작전',
    npc: 'vet',
    description:
      '아무 동굴에서 왕쥐 3마리를 물리치세요. 수문장은 동굴을 다시 방문하면 돌아옵니다.',
    goal: 3,
    metric: 'rats',
    coins: 300,
    charm: 3,
    items: [{ item: 'dogtonic', qty: 1 }],
  },
  {
    id: 'cats',
    title: '야옹 구조대',
    npc: 'vet',
    requires: 'thieves',
    description:
      '각 동굴의 수문장 셋을 이기고 갇힌 고양이 3마리를 풀어 주세요.',
    goal: 3,
    metric: 'cats',
    coins: 750,
    charm: 5,
    items: [{ item: 'revive', qty: 3 }],
  },
  ...RAIDS.map((r, i) => ({
    id: `raid-${i}`,
    title: `${r.boss}의 목줄을 풀어라`,
    npc: 'worker',
    description: `${r.name}에서 수문장 셋을 이긴 뒤 ${r.boss}를 진정시키세요.`,
    goal: 1,
    metric: `raid-${i}`,
    coins: 450 + i * 180,
    charm: 2,
    items: [
      { item: 'dogtonic', qty: 1 },
      { item: 'tonic', qty: 1 },
    ],
  })),
];
