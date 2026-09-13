import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ITEMS,
  newGame,
  act,
  entities,
  entityLevel,
  enemyStats,
  lootForEnemy,
  gainExperience,
  xpNeeded,
  MAX_LEVEL,
  makeDog,
  heroStats,
  countItem,
  putItem,
  packSave,
  unpackSave,
} from './model.ts';
import { ITEM_ENTRIES, GENERATED_BY_LEVEL } from './content.ts';

test('catalog contains exactly 10,000 stable unique named items with usable effects, levels and fair prices', () => {
  assert.equal(ITEM_ENTRIES.length, 10000);
  assert.equal(new Set(ITEM_ENTRIES.map(([, i]) => i.name)).size, 10000);
  const effects = new Set<string>();
  for (const [id, i] of ITEM_ENTRIES) {
    assert.ok(i.name && i.desc && i.icon, id);
    assert.ok(Number.isInteger(i.level) && i.level >= 1 && i.level <= 100, id);
    assert.ok(Number.isInteger(i.rarity) && i.rarity >= 0 && i.rarity <= 5, id);
    assert.ok(Number.isInteger(i.price) && i.price > 0, id);
    assert.ok(
      i.slot || i.heal || i.boost || i.antidote || i.capacity || id === 'treat',
      id,
    );
    if (i.rarity === 5) assert.ok(i.level >= 60);
    if (id.startsWith('gear-'))
      effects.add(
        JSON.stringify([
          i.slot,
          i.heal,
          i.attack,
          i.hp,
          i.charm,
          i.defense,
          i.target,
          i.revive,
        ]),
      );
  }
  assert.ok(
    effects.size > 5000,
    `${effects.size} distinct functional combinations`,
  );
  for (let level = 1; level <= 100; level++) {
    assert.ok(GENERATED_BY_LEVEL[level].some(([, i]) => i.heal));
    assert.ok(GENERATED_BY_LEVEL[level].some(([, i]) => i.slot === 'weapon'));
    assert.ok(GENERATED_BY_LEVEL[level].some(([, i]) => i.slot === 'clothes'));
    assert.ok(
      GENERATED_BY_LEVEL[level].some(([, i]) => i.slot === 'accessory'),
    );
  }
});
test('traveler and accompanying dogs gain XP, multiple levels and actual stats while benched dogs wait', () => {
  const s = newGame();
  s.dogs.push(makeDog('dog-0', '구름', 1), makeDog('dog-0-b', '쿠키', 4));
  s.party.push('dog-0');
  const before = structuredClone(s);
  const raised = gainExperience(s, 140);
  assert.equal(s.hero.level, 3);
  assert.equal(s.hero.xp, 5);
  assert.equal(s.hero.maxHp, before.hero.maxHp + 24);
  assert.equal(s.hero.atk, before.hero.atk + 6);
  assert.equal(s.hero.hp, heroStats(s).maxHp);
  assert.equal(s.dogs[0].level, 3);
  assert.equal(s.dogs[1].level, 3);
  assert.deepEqual(s.dogs[2], before.dogs[2]);
  assert.equal(raised.length, 3);
  s.hero.level = MAX_LEVEL - 1;
  s.hero.xp = 0;
  s.dogs[0].level = MAX_LEVEL - 1;
  s.dogs[0].xp = 0;
  gainExperience(s, xpNeeded(MAX_LEVEL - 1) + 100);
  assert.equal(s.hero.level, MAX_LEVEL);
  assert.equal(s.hero.xp, 0);
  assert.equal(s.dogs[0].level, MAX_LEVEL);
  assert.equal(s.dogs[0].xp, 0);
});
test('shop locks new higher-level items then unlocks them, and generated gear/food/sales really work', () => {
  let s = newGame();
  Object.assign(s, {
    place: 'shop',
    shopType: 'armory',
    x: 1024,
    y: 850,
    outside: { x: 840, y: 970 },
    coins: 100000,
  });
  const weapon = GENERATED_BY_LEVEL[3].find(([, i]) => i.slot === 'weapon')![0];
  const denied = act(s, { type: 'buy', id: weapon });
  assert.equal(denied.state, s);
  gainExperience(s, 135);
  s = act(s, { type: 'buy', id: weapon }).state;
  assert.equal(s.weapon, weapon);
  assert.equal(heroStats(s).attack, s.hero.atk + ITEMS[weapon].attack!);
  const before = s.coins;
  s = act(s, { type: 'sell', id: weapon, qty: 1 }).state;
  assert.equal(s.weapon, null);
  assert.ok(s.coins > before);
  s.shopType = 'convenience';
  const drink = GENERATED_BY_LEVEL[3].find(
    ([, i]) => i.heal && i.target === 'owner',
  )![0];
  s = act(s, { type: 'buy', id: drink }).state;
  s.hero.hp = 1;
  s = act(s, { type: 'item', id: drink, target: 'traveler' }).state;
  assert.equal(s.hero.hp, Math.min(heroStats(s).maxHp, 1 + ITEMS[drink].heal!));
  assert.equal(countItem(s, drink), 0);
  assert.deepEqual(unpackSave(packSave(s)), s);
});
test('monster levels are visible and cleared cave challenges scale, while the original campaign stays fixed', () => {
  const s = newGame();
  const dog = entities(s).find((e) => e.kind === 'dog')!;
  s.x = dog.x;
  s.y = dog.y;
  const recruited = act(s, { type: 'interact', id: dog.id }).state;
  assert.equal(recruited.dogs[1].level, entityLevel(s, dog));
  s.region = 0;
  s.visited = [0];
  s.place = 'cave';
  const guard = entities(s).find((e) => e.creature !== undefined)!;
  const dragon = entities(s).find((e) => e.dragon)!;
  assert.ok(entityLevel(s, dragon) > entityLevel(s, guard));
  const before = enemyStats(s, guard);
  s.hero.level = 80;
  assert.equal(enemyStats(s, guard).level, before.level);
  s.raids.push(0);
  const after = enemyStats(s, guard);
  assert.equal(after.level, 80);
  assert.ok(after.maxHp > before.maxHp);
  assert.ok(after.atk > before.atk);
  s.region = 1;
  s.visited.push(1);
  s.place = 'field';
  assert.ok(
    entities(s)
      .filter((e) => e.kind === 'npc')
      .every((e) => entityLevel(s, e) > 0),
  );
});
test('loot varies by victory and level, never exceeds traveler or enemy level, and includes new items and rare tiers', () => {
  const seen = new Set<string>(),
    rarities = new Set<number>();
  for (const level of [1, 3, 8, 20, 60, 100]) {
    const s = newGame();
    s.region = 0;
    s.visited = [0];
    s.place = 'cave';
    s.raids = [0];
    s.hero.level = level;
    const e = entities(s).find((e) => e.creature !== undefined)!;
    const enemy = enemyStats(s, e);
    for (let kills = 1; kills <= 250; kills++) {
      s.kills = kills;
      const loot = lootForEnemy(s, enemy);
      assert.ok(loot.some((x) => x.item.startsWith('gear-')));
      assert.ok(loot.reduce((n, x) => n + x.qty, 0) >= 15);
      for (const x of loot) {
        assert.ok(ITEMS[x.item].level <= Math.min(level, enemy.level), x.item);
        if (x.item.startsWith('gear-')) {
          seen.add(x.item);
          rarities.add(ITEMS[x.item].rarity);
        }
      }
    }
  }
  assert.ok(seen.size > 200);
  assert.ok(rarities.has(4));
  assert.ok(rarities.has(5));
  const s = newGame();
  s.hero.level = 100;
  s.region = 0;
  s.visited = [0];
  s.place = 'cave';
  const low = enemyStats(
    s,
    entities(s).find((e) => e.creature !== undefined)!,
  );
  assert.ok(
    lootForEnemy(s, low).every((x) => ITEMS[x.item].level <= low.level),
  );
});
test('old saves migrate hero progression and preserve equipment and 1,000-slot mixed new inventories', () => {
  let s = newGame();
  s.dogs[0] = makeDog('starter', '리치', 6, 8);
  const raw = JSON.parse(packSave(s));
  delete raw.state.hero.level;
  delete raw.state.hero.xp;
  const migrated = unpackSave(JSON.stringify(raw));
  assert.equal(migrated.hero.level, 8);
  assert.ok(migrated.hero.atk > s.hero.atk);
  assert.deepEqual(migrated.bag, s.bag);
  assert.equal(migrated.dogs[0].level, 8);
  const capped = JSON.parse(JSON.stringify(raw));
  capped.state.hero.maxHp = 99999;
  capped.state.hero.hp = 99999;
  assert.equal(unpackSave(JSON.stringify(capped)).hero.hp, 99999);
  s = migrated;
  s.capacity = 1000;
  s.bag = Array(1000).fill(null);
  for (const [id] of ITEM_ENTRIES.slice(-1000)) assert.ok(putItem(s, id, 1));
  assert.ok(packSave(s).length < 600000);
  assert.deepEqual(unpackSave(packSave(s)).bag, s.bag);
  for (const patch of [
    { level: 0 },
    { level: 1000 },
    { xp: -1 },
    { level: 1, xp: 45 },
    { level: 2.5 },
    { level: 999, xp: 1 },
  ]) {
    const invalid = JSON.parse(packSave(newGame()));
    Object.assign(invalid.state.hero, patch);
    assert.throws(() => unpackSave(JSON.stringify(invalid)));
  }
});

test('long sessions keep all existing ground loot and convert only overflow to coins without breaking saves', () => {
  let s = newGame();
  s.region = 0;
  s.visited = [0];
  s.drops = Array.from({ length: 840 }, (_, i) => ({
    id: `drop-0-${i}`,
    region: 0,
    place: 'field' as const,
    x: 1024,
    y: 1190,
    originX: 1024,
    originY: 1190,
    item: 'berry',
    qty: 1,
    createdAt: 0,
  }));
  const e = entities(s).find((e) => e.id === 'mob-0-0')!;
  s.x = e.x;
  s.y = e.y;
  s.dogs[0].atk = 1000;
  s = act(s, { type: 'interact', id: e.id }).state;
  const before = s.coins,
    result = act(s, { type: 'attack' });
  assert.equal(result.event, 'win');
  assert.ok(result.message.includes('환전'));
  assert.equal(result.state.drops.length, 840);
  assert.ok(result.state.coins > before + 65);
  assert.ok(result.state.drops.reduce((n, d) => n + d.qty, 0) > 840);
  assert.doesNotThrow(() => unpackSave(packSave(result.state)));
});

test('level 20, 60 and 100 cave challenges are winnable with matching gear and meaningful combat', () => {
  for (const level of [20, 60, 100]) {
    let s = newGame();
    gainExperience(s, (45 * (level - 1) * level) / 2);
    Object.assign(s, {
      place: 'shop',
      shopType: 'armory',
      x: 1024,
      y: 850,
      outside: { x: 840, y: 970 },
      coins: 1000000,
    });
    for (const slot of ['weapon', 'clothes', 'accessory']) {
      const id = GENERATED_BY_LEVEL[level].find(([, i]) => i.slot === slot)![0];
      s = act(s, { type: 'buy', id }).state;
    }
    Object.assign(s, { region: 0, visited: [0, 1], place: 'cave', raids: [0] });
    const e = entities(s).find((e) => e.id === 'cave-0-0')!;
    s.x = e.x;
    s.y = e.y;
    s = act(s, { type: 'interact', id: e.id }).state;
    s = act(s, { type: 'actor', id: 'traveler' }).state;
    let turns = 0;
    while (s.battle && turns++ < 12) {
      const result = act(s, {
        type: s.battle.cooldown === 0 ? 'skill' : 'attack',
      });
      assert.notEqual(result.event, 'loss');
      s = result.state;
    }
    assert.ok(!s.battle);
    assert.ok(turns >= 2 && turns <= 8, `Lv.${level}: ${turns}`);
  }
});
