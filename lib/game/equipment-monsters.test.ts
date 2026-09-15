import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  newGame,
  act,
  ITEMS,
  heroStats,
  putItem,
  countItem,
  packSave,
  unpackSave,
  entities,
  REGIONS,
  walkable,
  enemyIntent,
  enemyStats,
  lootForEnemy,
} from './model.ts';
import { EQUIPMENT_SLOTS, equippedItem } from './equipment-slots.ts';
import { FIELD_MONSTERS, MONSTER_MOVES } from './field-monsters.ts';
import { routeSpawn } from './route-layouts.ts';
import { findPath, clearSegment } from './navigation.ts';

test('all original 10,000 item recipes stay byte-for-byte compatible', () => {
  const old = Object.fromEntries(
    Object.entries(ITEMS).filter(([id]) => !id.startsWith('outfit-')),
  );
  assert.equal(
    createHash('sha256').update(JSON.stringify(old)).digest('hex'),
    'd8e1e351d63eee9a4d550c5bc816bdb18c690e24f7b881418910a0af6ca6d279',
  );
});

test('seven independent slots equip, survive saves, and unequip without consuming stock or creating HP', () => {
  let s = newGame();
  s.hero.hp = 20;
  const chosen = EQUIPMENT_SLOTS.map((part) =>
    Object.keys(ITEMS).find(
      (id) => ITEMS[id].slot === part.id && ITEMS[id].level === 1,
    )!,
  );
  for (const id of chosen) {
    putItem(s, id);
    s = act(s, { type: 'item', id }).state;
  }
  assert.equal(s.hero.hp, 20);
  assert.ok(heroStats(s).maxHp > s.hero.maxHp);
  s = unpackSave(packSave(s));
  for (const [i, part] of EQUIPMENT_SLOTS.entries()) {
    assert.equal(equippedItem(s, part.id), chosen[i]);
    const before = structuredClone(s.bag);
    s = act(s, { type: 'unequip', slot: part.id }).state;
    assert.equal(equippedItem(s, part.id), null);
    assert.deepEqual(s.bag, before);
    assert.equal(s.hero.hp, 20);
    s = act(s, { type: 'item', id: chosen[i] }).state;
    assert.equal(s.hero.hp, 20);
  }
  s.hero.hp = heroStats(s).maxHp;
  for (const part of EQUIPMENT_SLOTS)
    s = act(s, { type: 'unequip', slot: part.id }).state;
  assert.equal(s.hero.hp, s.hero.maxHp);
  assert.equal(heroStats(s).attack, s.hero.atk);
  assert.deepEqual(unpackSave(packSave(s)), s);
});

test('new equipment respects level, full bags, battle locks, sales and exact refunds', () => {
  for (const slot of ['pants', 'necklace', 'earrings', 'cape'] as const) {
    let s = newGame();
    const id = `outfit-${slot}-001-0`;
    const high = `outfit-${slot}-100-2`;
    putItem(s, high);
    assert.equal(act(s, { type: 'item', id: high }).state, s);
    Object.assign(s, {
      place: 'shop',
      shopType: 'armory',
      x: 1024,
      y: 820,
      outside: routeSpawn(1),
      coins: 10000,
    });
    s = act(s, { type: 'buy', id }).state;
    const purchase = s.purchases.at(-1)!;
    assert.equal(equippedItem(s, slot), id);
    s.bag = s.bag.map((v) => v ?? { item: 'berry', qty: 9 });
    s = act(s, { type: 'unequip', slot }).state;
    assert.equal(
      countItem(s, id),
      1,
      'full inventory still keeps the unequipped item',
    );
    const refunded = act(s, { type: 'refund', id: purchase.id }).state;
    assert.equal(refunded.coins, 10000);
    assert.equal(countItem(refunded, id), 0);
    s = act(s, { type: 'item', id }).state;
    s = act(s, { type: 'sell', id, qty: 1 }).state;
    assert.equal(equippedItem(s, slot), null);
    assert.equal(countItem(s, id), 0);
    Object.assign(s, { region: 0, place: 'field' });
    const enemy = entities(s).find((e) => e.kind === 'enemy')!;
    Object.assign(s, { x: enemy.x, y: enemy.y });
    s = act(s, { type: 'interact', id: enemy.id }).state;
    assert.ok(s.battle);
    assert.equal(act(s, { type: 'unequip', slot }).state, s);
  }
});

test('old three-slot saves gain empty new slots without losing equipment or coins', () => {
  let s = newGame();
  putItem(s, 'hoodie');
  s = act(s, { type: 'item', id: 'hoodie' }).state;
  const old = JSON.parse(packSave(s));
  old.state.equipment = { clothes: 'hoodie', accessory: null };
  const migrated = unpackSave(JSON.stringify(old));
  assert.equal(migrated.equipment.clothes, 'hoodie');
  for (const slot of ['pants', 'necklace', 'earrings', 'cape'] as const)
    assert.equal(migrated.equipment[slot], null);
  assert.deepEqual(migrated.bag, s.bag);
  assert.equal(migrated.coins, s.coins);
  old.state.equipment.pants = 'hoodie';
  assert.throws(() => unpackSave(JSON.stringify(old)));
  delete old.state.equipment.pants;
  old.state.equipment.weapon = null;
  assert.throws(() => unpackSave(JSON.stringify(old)));
});

test('16 new wildlife encounters are reachable, saveable, respawn and never appear in towns', () => {
  let total = 0;
  for (const region of REGIONS) {
    let s = newGame();
    Object.assign(s, {
      region: region.id,
      visited: [region.id],
      ...routeSpawn(region.id),
    });
    const wildlife = entities(s).filter((e) => e.creature !== undefined);
    assert.equal(wildlife.length, region.town ? 0 : 2);
    total += wildlife.length;
    if (region.town)
      assert.ok(
        !entities(s).some((e) => e.kind === 'enemy' || e.kind === 'cave'),
      );
    for (const e of wildlife) {
      assert.ok(walkable(e.x, e.y, region.id));
      assert.ok(Math.hypot(s.x - e.x, s.y - e.y) > 160);
      const path = findPath(s, { x: e.x, y: e.y + 38 });
      assert.ok(path.length);
      let from = { x: s.x, y: s.y };
      for (const p of path) {
        assert.ok(clearSegment(s, from, p));
        from = p;
      }
      let battle = structuredClone(s);
      Object.assign(battle, { x: e.x, y: e.y });
      battle.dogs[0].atk = 9999;
      battle = act(battle, { type: 'interact', id: e.id }).state;
      battle = act(battle, { type: 'attack' }).state;
      assert.ok(!entities(battle).some((m) => m.id === e.id));
      battle = unpackSave(packSave(battle));
      battle.seconds = battle.respawnAt[e.id];
      assert.ok(entities(battle).some((m) => m.id === e.id));
      for (let n = 0; n < 40; n++) {
        s.kills = n;
        assert.ok(
          lootForEnemy(s, enemyStats(s, e)).every(
            (d) => ITEMS[d.item].source !== 'raid',
          ),
        );
      }
    }
  }
  assert.equal(total, 16);
});

test('each creature announces its real special move; guarding reduces that attack', () => {
  for (const [creature, move] of MONSTER_MOVES.entries()) {
    const region = Number(
      Object.keys(FIELD_MONSTERS).find((r) =>
        FIELD_MONSTERS[Number(r)].some(([, c]) => c === creature),
      ),
    );
    let s = newGame();
    Object.assign(s, { region, ...routeSpawn(region) });
    const e = entities(s).find((e) => e.creature === creature)!;
    Object.assign(s, { x: e.x, y: e.y });
    s = act(s, { type: 'interact', id: e.id }).state;
    s.battle!.turn = move.every;
    s.battle!.enemy.hp = 9999;
    assert.match(enemyIntent(s), new RegExp(move.name));
    const attack = act(s, { type: 'attack' });
    const guard = act(s, { type: 'guard' });
    assert.equal(guard.combat!.counters[0].move, move.name);
    assert.ok(
      guard.combat!.counters[0].damage < attack.combat!.counters[0].damage,
    );
  }
});
