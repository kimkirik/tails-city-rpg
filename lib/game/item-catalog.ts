import type { ItemDef } from './content.ts';

export const RARITIES = [
  '일반',
  '고급',
  '희귀',
  '영웅',
  '전설',
  '신화',
] as const;
export const ITEM_SOURCES = {
  shop: '상점 · 일반 전리품',
  monster: '몬스터 확률 드롭',
  raid: '레이드 전용 드롭',
} as const;
const monsterOnly = new Set([
  'sword',
  'stun',
  'ranger',
  'bell',
  'dogtonic',
  'tonic',
]);
const raidOnly = new Set([
  'lunar',
  'dragonblade',
  'starlight',
  'dragoncoat',
  'pendant',
  'crown',
]);
const districts = [
  '솔빛',
  '연두',
  '안개솔',
  '파도빛',
  '철길',
  '밤하늘',
  '달빛',
  '오로라',
  '태양',
  '별무리',
];
const ranks = [
  '새싹',
  '산책',
  '탐험',
  '구조대',
  '수호자',
  '명장',
  '하늘길',
  '왕관',
  '별바다',
  '은하수',
];
const profiles = [
  '산뜻한',
  '든든한',
  '날렵한',
  '포근한',
  '단단한',
  '빛나는',
  '용맹한',
  '다정한',
  '찬란한',
  '기적의',
];
const families = [
  '전해질 음료',
  '과일 스무디',
  '회복 젤',
  '수제 육포',
  '연어 도시락',
  '영양 비스킷',
  '구조봉',
  '호위검',
  '탐험 재킷',
  '우정 펜던트',
];
const icons = ['🥤', '🧃', '🧪', '🥓', '🍱', '🍪', '🏏', '🗡️', '🧥', '💎'];
const baseLevels: Record<string, number> = {
  sword: 3,
  stun: 5,
  lunar: 8,
  dragonblade: 10,
  ranger: 3,
  starlight: 6,
  dragoncoat: 9,
  bell: 3,
  pendant: 6,
  crown: 9,
  milk: 2,
  deluxe: 3,
  revive: 3,
  dogtonic: 3,
  tonic: 3,
};

// Stable recipes are the save-file contract: never reorder families or change IDs.
export function createCatalog(
  base: Record<string, Omit<ItemDef, 'level' | 'rarity' | 'source'>>,
) {
  const catalog: Record<string, ItemDef> = {};
  for (const [id, item] of Object.entries(base)) {
    const level = baseLevels[id] ?? 1;
    catalog[id] = {
      ...item,
      source: raidOnly.has(id)
        ? 'raid'
        : monsterOnly.has(id)
          ? 'monster'
          : 'shop',
      level,
      rarity: level >= 9 ? 4 : level >= 6 ? 3 : level >= 3 ? 2 : 0,
    };
  }
  const baseCount = Object.keys(base).length;
  const generatedCount = 10000 - baseCount;
  for (let n = 0; n < generatedCount; n++) {
    const recipe = n + baseCount;
    const level = Math.floor(recipe / 100) + 1,
      family = recipe % 10,
      variant = Math.floor(recipe / 10) % 10;
    const rarity =
      variant < 5
        ? 0
        : variant < 8
          ? 1
          : variant === 8
            ? level >= 3
              ? 2
              : 1
            : level >= 60
              ? 5
              : level >= 20
                ? 4
                : level >= 8
                  ? 3
                  : level >= 3
                    ? 2
                    : 1;
    const item: ItemDef = {
      family: families[family],
      name: `${ranks[Math.floor((level - 1) / 10)]} ${districts[(level - 1) % 10]} ${profiles[variant]} ${families[family]}`,
      icon: icons[family],
      level,
      rarity,
      price: Math.round(
        (family < 6 ? 22 + level * 8 : 70 + Math.pow(level, 1.3) * 28) *
          (1 + rarity * 0.35 + variant * 0.04),
      ),
      source: variant === 9 ? 'raid' : variant === 8 ? 'monster' : 'shop',
      shop: family < 6 ? 'convenience' : 'armory',
      desc: '',
    };
    if (family < 6) {
      item.heal =
        24 + level * (family >= 3 ? 12 : 9) + variant * 4 + family * 3;
      item.target = family < 2 ? 'owner' : family < 3 ? 'any' : 'dog';
      item.revive = level >= 8 && rarity >= 3 && family === 4;
      item.desc = `${item.target === 'owner' ? '여행자' : item.target === 'dog' ? '강아지' : '선택한 대상'} HP +${item.heal}${item.revive ? ' · 쓰러진 동료도 회복' : ''}`;
    } else if (family < 8) {
      item.slot = 'weapon';
      item.attack =
        3 + level * 3 + variant + rarity * 2 + (family === 7 ? 2 : 0);
      item.hp = family === 6 ? level * 2 + variant : 0;
      item.charm = variant >= 7 ? Math.ceil(level / 5) : 0;
      item.desc = `공격 +${item.attack}${item.hp ? ` · 최대 HP +${item.hp}` : ''}${item.charm ? ` · 매력 +${item.charm}` : ''}`;
    } else if (family === 8) {
      item.slot = 'clothes';
      item.hp = 15 + level * 9 + variant * 3;
      item.defense = 1 + Math.floor(level * 0.55) + Math.floor(variant / 3);
      item.charm = variant >= 5 ? Math.ceil(level / 4) + variant - 4 : 0;
      item.desc = `최대 HP +${item.hp} · 방어 +${item.defense}${item.charm ? ` · 매력 +${item.charm}` : ''}`;
    } else {
      item.slot = 'accessory';
      item.charm = 2 + Math.ceil(level / 2) + variant;
      item.hp = level * 3 + variant * 2;
      item.attack = Math.floor((level + variant) / 4);
      item.desc = `매력 +${item.charm} · 최대 HP +${item.hp}${item.attack ? ` · 공격 +${item.attack}` : ''}`;
    }
    catalog[`gear-${String(n + 1).padStart(5, '0')}`] = item;
  }
  return catalog;
}
