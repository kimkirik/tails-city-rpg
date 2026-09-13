import { routeSpawn } from './route-layouts.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newGame,
  entities,
  act,
  REGIONS,
  RAID_LIST,
  NPCS,
  isTown,
  packSave,
  unpackSave,
  lootForEnemy,
  enemyStats,
  DROP_CHANCES,
  ITEMS,
  putItem,
  countItem,
} from './model.ts';
import { GENERATED_BY_LEVEL, ITEM_ENTRIES } from './content.ts';

test('twelve regions separate four safe inhabited towns from eight combat zones and raids', () => {
  assert.equal(REGIONS.length, 12);
  assert.equal(REGIONS.filter((r) => r.town).length, 4);
  assert.equal(RAID_LIST.length, 8);
  const start = newGame();
  assert.equal(start.region, 1);
  assert.ok(isTown(start.region));
  for (const region of REGIONS) {
    const s = newGame();
    s.region = region.id;
    s.visited = [region.id];
    const all = entities(s);
    if (region.town) {
      assert.equal(all.filter((e) => e.kind === 'shop').length, 2);
      assert.ok(all.filter((e) => e.kind === 'npc').length >= 2);
      assert.ok(all.some((e) => e.kind === 'rest'));
      assert.ok(all.every((e) => !['enemy', 'cave', 'loot'].includes(e.kind)));
      for (const kind of ['captain', 'raid-entry'])
        assert.equal(
          act(s, { type: 'interact', id: `${kind}-${region.id}` }).state,
          s,
        );
      s.place = 'cave';
      assert.equal(entities(s).length, 0);
    } else {
      assert.equal(all.filter((e) => e.kind === 'cave').length, 1);
      assert.ok(all.filter((e) => e.kind === 'enemy').length >= 5);
      assert.ok(all.every((e) => !['shop', 'npc', 'rest'].includes(e.kind)));
      s.place = 'shop';
      s.x = 1024;
      s.y = 820;
      assert.equal(act(s, { type: 'buy', id: 'potion' }).state, s);
    }
  }
});

test('all catalog items have reachable acquisition pools and exclusives cannot be purchased at any level', () => {
  const counts = { shop: 0, monster: 0, raid: 0 };
  for (const [id, item] of ITEM_ENTRIES) {
    counts[item.source]++;
    if (item.source === 'shop') continue;
    const s = newGame();
    s.place = 'shop';
    s.shopType = item.shop;
    s.x = 1024;
    s.y = 820;
    s.coins = 99999999;
    s.hero.level = 999;
    assert.equal(act(s, { type: 'buy', id }).state, s, id);
  }
  assert.deepEqual(counts, { shop: 7988, monster: 1006, raid: 1006 });
  for (let level = 1; level <= 100; level++)
    for (const source of ['shop', 'monster', 'raid']) {
      const pool = GENERATED_BY_LEVEL[level].filter(
        ([, i]) => i.source === source,
      );
      assert.ok(pool.some(([, i]) => i.heal));
      assert.ok(pool.some(([, i]) => i.slot === 'weapon'));
    }
  assert.equal(ITEMS.tonic.source, 'monster');
  assert.equal(ITEMS.dragonblade.source, 'raid');
});

test('bonus drops are randomized per victory, level-gated and match encounter probabilities', (t) => {
  for (const kind of ['monster', 'captain', 'guardian', 'dragon'] as const) {
    const s = newGame();
    s.region = 10;
    s.hero.level = 100;
    if (kind === 'guardian' || kind === 'dragon') s.place = 'cave';
    const entity = entities(s).find((e) =>
      kind === 'monster'
        ? e.id.startsWith('mob-')
        : kind === 'captain'
          ? e.captain
          : kind === 'guardian'
            ? e.creature !== undefined
            : e.dragon,
    )!;
    const enemy = enemyStats(s, entity);
    const hits = { monster: 0, raid: 0 },
      seen = new Set<string>();
    for (let i = 1; i <= 2000; i++) {
      s.kills = i;
      const rewards = lootForEnemy(s, enemy);
      assert.deepEqual(lootForEnemy(s, enemy), rewards);
      const sources = rewards.map((x) => ITEMS[x.item].source);
      for (const source of ['monster', 'raid'] as const) {
        const drops = rewards.filter((x) => ITEMS[x.item].source === source);
        assert.ok(drops.length <= 1);
        if (drops.length) {
          hits[source]++;
          assert.equal(drops[0].qty, 1);
        }
      }
      assert.ok(rewards.reduce((n, x) => n + x.qty, 0) >= 15);
      for (const drop of rewards) {
        assert.ok(
          ITEMS[drop.item].level <= Math.min(s.hero.level, enemy.level),
        );
        seen.add(drop.item);
      }
      if (kind === 'monster' || kind === 'captain')
        assert.ok(!sources.includes('raid'));
    }
    for (const source of ['monster', 'raid'] as const)
      assert.ok(
        Math.abs(hits[source] / 2000 - DROP_CHANCES[kind][source]) < 0.035,
        `${kind}/${source}: ${hits[source]}`,
      );
    assert.ok(seen.size > 40);
    t.diagnostic(
      `${kind}: monster=${hits.monster / 20}%, raid=${hits.raid / 20}%`,
    );
  }
});

test('legacy village raids and shops migrate safely while earned items and boss progress persist', () => {
  const old = newGame();
  delete old.worldRevision;
  Object.assign(old, {
    region: 1,
    visited: [0, 1],
    place: 'cave',
    x: 1024,
    y: 1700,
    outside: { x: 1024, y: 1580 },
    raids: [1],
    rescued: [1],
    caveCleared: ['cave-1-0'],
    defeated: ['captain-1'],
    quests: { 'raid-1': 'claimed' },
    progress: { 'raid-1': 1 },
    enemyHealth: { 'cave-1-1': 20 },
  });
  putItem(old, 'dragonblade');
  const s = unpackSave(packSave(old));
  assert.equal(s.region, 6);
  assert.equal(s.place, 'cave');
  assert.equal(s.worldRevision, 3);
  assert.deepEqual(s.raids, [6]);
  assert.deepEqual(s.rescued, [6]);
  assert.deepEqual(s.caveCleared, ['cave-6-0']);
  assert.deepEqual(s.defeated, ['captain-6']);
  assert.equal(s.quests['raid-6'], 'claimed');
  assert.equal(s.progress['raid-6'], 1);
  assert.equal(s.enemyHealth['cave-6-1'], 20);
  assert.equal(countItem(s, 'dragonblade'), 1);
  assert.deepEqual(unpackSave(packSave(s)), s);
  Object.assign(old, {
    region: 0,
    place: 'shop',
    x: 1024,
    y: 820,
    outside: { x: 840, y: 970 },
  });
  const shop = unpackSave(packSave(old));
  assert.equal(shop.region, 1);
  assert.equal(shop.place, 'shop');
  assert.equal(shop.coins, old.coins);
});

test('new region companions, towns, cave progress and NPC conversations round-trip in saves', () => {
  for (const region of REGIONS) {
    let s = newGame();
    s.region = region.id;
    s.visited = [region.id];
    s.hero.charm = 1000;
    const dog = entities(s).find((e) => e.kind === 'dog')!;
    s.x = dog.x;
    s.y = dog.y;
    s = act(s, { type: 'interact', id: dog.id }).state;
    assert.equal(s.dogs.length, 2);
    for (const npc of NPCS.filter((n) => n.region === region.id)) {
      const e = entities(s).find((e) => e.npc === npc.id)!;
      s.x = e.x;
      s.y = e.y;
      s = act(s, { type: 'interact', id: e.id }).state;
    }
    Object.assign(s, routeSpawn(region.id));
    assert.deepEqual(unpackSave(packSave(s)), s);
    const invalid = JSON.parse(packSave(s));
    invalid.state.region = 12;
    assert.throws(() => unpackSave(JSON.stringify(invalid)));
  }
});
