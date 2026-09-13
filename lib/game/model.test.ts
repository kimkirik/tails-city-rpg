import { routeSpawn } from './route-layouts.ts';
import { fieldGame } from './test-fixtures.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newGame,
  act,
  entities,
  walkable,
  packSave,
  unpackSave,
  currentDog,
  putItem,
  countItem,
  enemyStats,
  REGIONS,
  ITEMS,
  type GameState,
  type Entity,
} from './model.ts';
function closeTo(s: GameState, e: Entity) {
  if (walkable(e.x, e.y, s.region, s.place)) {
    s.x = e.x;
    s.y = e.y;
    return;
  }
  for (let y = e.y - 85; y <= e.y + 85; y += 8)
    for (let x = e.x - 85; x <= e.x + 85; x += 8)
      if (
        walkable(x, y, s.region, s.place) &&
        Math.hypot(x - e.x, y - e.y) < 100
      ) {
        s.x = x;
        s.y = y;
        return;
      }
  throw Error(`Unreachable: ${e.id}`);
}
test('bags expand from25 to1000 at the convenience counter without losing items', () => {
  let s = newGame();
  const original = structuredClone(s.bag);
  s.place = 'shop';
  s.outside = routeSpawn(1);
  s.x = 1024;
  s.y = 820;
  s.coins = 100000;
  for (const cap of [50, 100, 200, 400, 700, 1000]) {
    const before = s.coins;
    s = act(s, { type: 'buy', id: `bag${cap}` }).state;
    assert.equal(s.capacity, cap);
    assert.equal(s.bag.length, cap);
    assert.ok(s.coins < before);
    assert.deepEqual(s.bag.slice(0, 25), original);
    assert.equal(act(s, { type: 'buy', id: `bag${cap}` }).state, s);
  }
  assert.deepEqual(unpackSave(packSave(s)), s);
});
test('full bag cannot partially consume loot or coins', () => {
  let s = fieldGame();
  s.bag = Array.from({ length: 25 }, () => ({ item: 'berry', qty: 9 }));
  const e = entities(s).find((e) => e.kind === 'loot')!;
  closeTo(s, e);
  const r = act(s, { type: 'interact', id: e.id });
  assert.equal(r.state.coins, s.coins);
  assert.equal(r.state.looted.length, 0);
  assert.equal(putItem(s, 'potion', 2), false);
});
test('recruiting consumes exactly one treat and cannot duplicate dogs', () => {
  let s = newGame();
  const e = entities(s).find((e) => e.kind === 'dog')!;
  closeTo(s, e);
  s = act(s, { type: 'interact', id: e.id }).state;
  assert.equal(s.dogs.length, 2);
  assert.equal(countItem(s, 'treat'), 4);
  s = act(s, { type: 'interact', id: e.id }).state;
  assert.equal(s.dogs.length, 2);
  s = act(s, { type: 'switch', id: e.id }).state;
  assert.equal(currentDog(s).name, e.name);
});
test('no treat denies recruitment without mutation', () => {
  const s = newGame();
  s.bag = s.bag.map((v) => (v?.item === 'treat' ? null : v));
  const e = entities(s).find((e) => e.kind === 'dog')!;
  closeTo(s, e);
  assert.equal(act(s, { type: 'interact', id: e.id }).state.dogs.length, 1);
});
test('save restores inventory, expansion, companions, location, progression', () => {
  let s = fieldGame();
  s = act(s, { type: 'expand' }).state;
  s.visited.push(1);
  s.region = 1;
  Object.assign(s, routeSpawn(1));
  s.defeated.push('enemy-0-0');
  assert.deepEqual(unpackSave(packSave(s)), s);
  s.region = 0;
  s.x = 1200;
  s.y = 1480;
  assert.ok(walkable(s.x, s.y, 0));
  assert.equal(unpackSave(packSave(s)).x, 1200);
});
test('malformed and oversized saves are rejected', () => {
  assert.throws(() => unpackSave('not json'));
  assert.throws(() => unpackSave('x'.repeat(200001)));
  for (const patch of [
    { capacity: 999 },
    { coins: -1 },
    { dogs: [] },
    { x: NaN },
    { region: 80 },
    { active: 'missing' },
    { bag: [{ item: 'bad', qty: 2 }] },
    { recruited: ['<bad>'] },
  ]) {
    const s = { ...newGame(), ...patch };
    assert.throws(() =>
      unpackSave(JSON.stringify({ game: 'tails-city', state: s })),
    );
  }
});
test('all region entities are reachable from walkable ground', () => {
  for (let region = 0; region < REGIONS.length; region++) {
    const s = newGame();
    s.region = region;
    for (const e of entities(s)) closeTo(s, e);
  }
});
test('all twelve regions connected; travel only through correct gates or discovered shortcuts', () => {
  let s = fieldGame();
  assert.equal(act(s, { type: 'travel', region: 5 }).state.region, 0);
  s.x = 2000;
  s.y = 970;
  s = act(s, { type: 'travel', region: 1, gate: true }).state;
  assert.equal(s.region, 1);
  assert.equal(s.x, 160);
  assert.equal(act(s, { type: 'travel', region: 0 }).state.region, 0);
  const found = new Set([0]),
    queue = [0];
  for (const id of queue)
    for (const n of REGIONS[id].neighbors)
      if (n >= 0 && !found.has(n)) {
        found.add(n);
        queue.push(n);
      }
  assert.equal(found.size, REGIONS.length);
  s.region = 2;
  s.x = 1024;
  s.y = 2000;
  s = act(s, { type: 'travel', region: 5, gate: true }).state;
  assert.equal(s.region, 5);
  assert.equal(s.y, 160);
  s.y = 60;
  s = act(s, { type: 'travel', region: 2, gate: true }).state;
  assert.equal(s.region, 2);
});
test('combat awards one reward and skill cooldown is enforced', () => {
  let s = fieldGame();
  const e = entities(s).find((e) => e.kind === 'enemy')!;
  closeTo(s, e);
  s = act(s, { type: 'interact', id: e.id }).state;
  assert.ok(s.battle);
  const coins = s.coins;
  s = act(s, { type: 'skill' }).state;
  if (s.battle) {
    const hp = s.battle.enemy.hp;
    s = act(s, { type: 'skill' }).state;
    assert.equal(s.battle!.enemy.hp, hp);
    while (s.battle) s = act(s, { type: 'attack' }).state;
  }
  assert.equal(s.battle, null);
  assert.equal(s.coins, coins + 65);
  assert.equal(s.defeated.filter((id) => id === e.id).length, 1);
  assert.equal(act(s, { type: 'attack' }).state.coins, s.coins);
});
test('items consume a combat turn; rest revives whole party for free', () => {
  let s = newGame();
  currentDog(s).hp = 10;
  s = act(s, { type: 'item', id: 'potion' }).state;
  assert.equal(currentDog(s).hp, 70);
  assert.equal(countItem(s, 'potion'), 3);
  const e = entities(s).find((e) => e.kind === 'rest')!;
  closeTo(s, e);
  s = act(s, { type: 'interact', id: e.id }).state;
  assert.equal(currentDog(s).hp, currentDog(s).maxHp);
  assert.equal(s.coins, 320);
});
test('total defeat has a recoverable checkpoint and safe retreat retains enemy damage', () => {
  let s = fieldGame();
  const e = entities(s).find((e) => e.kind === 'enemy')!;
  closeTo(s, e);
  s = act(s, { type: 'interact', id: e.id }).state;
  currentDog(s).hp = 1;
  s.hero.hp = 0;
  s = act(s, { type: 'attack' }).state;
  assert.equal(s.battle, null);
  assert.equal(s.region, 1);
  assert.equal(s.coins, 304);
  assert.equal(currentDog(s).hp, currentDog(s).maxHp);
  s.region = 0;
  closeTo(s, e);
  s = act(s, { type: 'interact', id: e.id }).state;
  s = act(s, { type: 'flee' }).state;
  assert.equal(s.battle, null);
});
test('complete six-region campaign can be won with starter and earned rewards', () => {
  let s = newGame();
  s.region = 5;
  let e = entities(s).find((e) => e.captain)!;
  closeTo(s, e);
  assert.equal(act(s, { type: 'interact', id: e.id }).state.battle, null);
  s.region = 0;
  for (const region of [0, 6, 2, 3, 4, 5]) {
    s.region = region;
    if (!s.visited.includes(region)) s.visited.push(region);
    for (const id of entities(s)
      .filter((e) => e.kind === 'enemy' && !e.id.startsWith('mob-'))
      .map((e) => e.id)) {
      s.region = 1;
      const rest = entities(s).find((e) => e.kind === 'rest')!;
      closeTo(s, rest);
      s = act(s, { type: 'interact', id: rest.id }).state;
      s.region = region;
      const enemy = entities(s).find((e) => e.id === id)!;
      closeTo(s, enemy);
      s = act(s, { type: 'interact', id }).state;
      assert.ok(s.battle);
      let turns = 0;
      while (s.battle && turns++ < 30) {
        const dog = currentDog(s);
        if (dog.hp < 35 && countItem(s, 'revive'))
          s = act(s, { type: 'item', id: 'revive' }).state;
        else if (dog.hp < 35 && countItem(s, 'potion'))
          s = act(s, { type: 'item', id: 'potion' }).state;
        else
          s = act(s, {
            type: s.battle.cooldown === 0 ? 'skill' : 'attack',
          }).state;
      }
      assert.ok(
        s.defeated.includes(id),
        `${id} defeated with ${currentDog(s).hp} HP`,
      );
    }
  }
  assert.equal(s.won, true);
  assert.equal(s.defeated.length, 18);
  assert.equal(unpackSave(packSave(s)).won, true);
});
test('legacy Kongi saves become Richi without changing progress or other Shibas', () => {
  const legacy = newGame();
  legacy.coins = 1234;
  legacy.visited = [0, 2];
  legacy.region = 2;
  legacy.defeated = ['enemy-0-0'];
  const starter = currentDog(legacy);
  starter.name = '콩이';
  starter.breed = 0;
  starter.level = 7;
  starter.xp = 42;
  starter.hp = 63;
  starter.maxHp = 136;
  starter.atk = 30;
  starter.bond = 12;
  delete starter.sex;
  delete starter.coat;
  const other = { ...starter, id: 'dog-1-b', name: '밤이' };
  legacy.dogs.push(other);
  legacy.recruited.push(other.id);
  const loaded = unpackSave(packSave(legacy));
  assert.deepEqual(loaded, {
    ...legacy,
    dogs: [
      { ...starter, name: '리치', breed: 6, sex: 'female', coat: 'brown' },
      other,
    ],
  });
  assert.deepEqual(unpackSave(packSave(loaded)), loaded);
});

test('shop has a walkable interior, counter purchases and an exit to the original position', () => {
  let s = newGame();
  assert.equal(act(s, { type: 'buy', id: 'potion' }).state, s);
  const shop = entities(s).find((e) => e.kind === 'shop')!;
  closeTo(s, shop);
  const outside = { x: s.x, y: s.y };
  let r = act(s, { type: 'interact', id: shop.id });
  assert.equal(r.event, 'enter_shop');
  s = r.state;
  assert.equal(s.place, 'shop');
  assert.deepEqual(s.outside, outside);
  assert.ok(walkable(s.x, s.y, s.region, s.place));
  assert.ok(entities(s).every((e) => e.kind !== 'enemy'));
  assert.equal(act(s, { type: 'buy', id: 'potion' }).state, s);
  assert.equal(act(s, { type: 'travel', region: 0 }).state, s);
  const counter = entities(s).find((e) => e.kind === 'merchant')!;
  for (let y = s.y; y >= counter.y; y -= 8)
    assert.ok(walkable(1024, y, s.region, s.place));
  closeTo(s, counter);
  assert.equal(act(s, { type: 'interact', id: counter.id }).event, 'shop');
  s = act(s, { type: 'buy', id: 'potion' }).state;
  assert.equal(countItem(s, 'potion'), 5);
  assert.equal(s.coins, 275);
  assert.equal(act(s, { type: 'buy', id: 'bat' }).state, s);
  s.shopType = 'armory';
  s = act(s, { type: 'buy', id: 'bat' }).state;
  assert.equal(s.weapon, 'bat');
  assert.equal(s.coins, 155);
  assert.equal(countItem(s, 'bat'), 1);
  s = act(s, { type: 'buy', id: 'bat' }).state;
  assert.equal(countItem(s, 'bat'), 2);
  assert.equal(s.coins, 35);
  assert.deepEqual(unpackSave(packSave(s)), s);
  const exit = entities(s).find((e) => e.kind === 'exit')!;
  closeTo(s, exit);
  s = act(s, { type: 'interact', id: exit.id }).state;
  assert.equal(s.place, 'field');
  assert.equal(s.outside, undefined);
  assert.equal(s.x, outside.x);
  assert.equal(s.y, outside.y);
  assert.deepEqual(unpackSave(packSave(s)), s);
});
test('weapons boost only the traveler and equipment changes require safety', () => {
  let s = fieldGame();
  const e = entities(s).find((e) => e.captain)!;
  putItem(s, 'bat');
  putItem(s, 'sword');
  s = act(s, { type: 'item', id: 'bat' }).state;
  closeTo(s, e);
  s = act(s, { type: 'interact', id: e.id }).state;
  s = act(s, { type: 'actor', id: 'traveler' }).state;
  const original = structuredClone(s);
  s = act(s, { type: 'attack' }).state;
  assert.equal(original.battle!.enemy.hp - s.battle!.enemy.hp, 23);
  assert.equal(countItem(s, 'bat'), 1);
  assert.equal(act(s, { type: 'item', id: 'sword' }).state, s);
});
test('village is safe and every other region has living combat enemies', () => {
  for (const region of REGIONS) {
    const s = newGame();
    s.region = region.id;
    const enemies = entities(s).filter((e) => e.kind === 'enemy');
    if (region.town) assert.equal(enemies.length, 0);
    else {
      assert.ok(enemies.length >= 5);
      for (const e of enemies) {
        const stats = enemyStats(s, e);
        assert.ok(stats.hp > 0);
        assert.equal(stats.hp, stats.maxHp);
      }
    }
  }
});
test('enemy damage persists after retreat and patrols respawn with full health after 45 seconds', () => {
  let s = fieldGame();
  const e = entities(s).find((e) => e.id === 'mob-0-0')!;
  closeTo(s, e);
  s = act(s, { type: 'interact', id: e.id }).state;
  s = act(s, { type: 'attack' }).state;
  const damaged = s.battle!.enemy.hp;
  s = act(s, { type: 'flee' }).state;
  assert.ok(walkable(s.x, s.y, s.region));
  assert.equal(enemyStats(s, e).hp, damaged);
  s = unpackSave(packSave(s));
  closeTo(s, e);
  s = act(s, { type: 'interact', id: e.id }).state;
  assert.equal(s.battle!.enemy.hp, damaged);
  while (s.battle) s = act(s, { type: 'attack' }).state;
  assert.equal(s.battle, null);
  assert.equal(s.kills, 1);
  assert.ok(!s.defeated.includes(e.id));
  assert.ok(!entities(s).some((n) => n.id === e.id));
  s.seconds = 44;
  assert.ok(!entities(s).some((n) => n.id === e.id));
  s.seconds = 45;
  assert.ok(entities(s).some((n) => n.id === e.id));
  assert.equal(enemyStats(s, e).hp, enemyStats(s, e).maxHp);
  closeTo(s, e);
  s = act(s, { type: 'interact', id: e.id }).state;
  assert.equal(s.battle!.enemy.hp, s.battle!.enemy.maxHp);
});
test('older saves receive shop, equipment and enemy defaults, invalid equipment is rejected', () => {
  const raw = JSON.parse(packSave(newGame()));
  for (const key of [
    'place',
    'weapon',
    'enemyHealth',
    'respawnAt',
    'kills',
    'encounterGraceUntil',
  ])
    delete raw.state[key];
  const loaded = unpackSave(JSON.stringify(raw));
  assert.deepEqual(loaded, newGame());
  raw.state.weapon = 'sword';
  assert.throws(() => unpackSave(JSON.stringify(raw)));
  raw.state.weapon = null;
  raw.state.place = 'shop';
  assert.throws(() => unpackSave(JSON.stringify(raw)));
  raw.state.place = 'field';
  raw.state.enemyHealth = { 'mob-0-0': -1 };
  assert.throws(() => unpackSave(JSON.stringify(raw)));
});

test('each defeated mob drops many reachable supplies, captains also drop usable equipment', () => {
  for (const region of [0, 6, 2, 3, 4, 5]) {
    let s = newGame();
    s.region = region;
    currentDog(s).atk = 1000;
    const e = entities(s).find((e) => e.id === `mob-${region}-0`)!;
    closeTo(s, e);
    s = act(s, { type: 'interact', id: e.id }).state;
    const result = act(s, { type: 'attack' });
    s = result.state;
    assert.equal(s.battle, null);
    assert.ok(s.drops.length >= 6);
    assert.ok(s.drops.reduce((n, d) => n + d.qty, 0) >= 15);
    assert.ok(
      s.drops.every((d) => d.region === region && walkable(d.x, d.y, region)),
    );
    assert.equal(act(s, { type: 'attack' }).state.drops.length, s.drops.length);
    const boss = entities(s).find((e) => e.captain)!;
    if (region === 5)
      s.defeated = [
        'captain-0',
        'captain-6',
        'captain-2',
        'captain-3',
        'captain-4',
      ];
    closeTo(s, boss);
    s = act(s, { type: 'interact', id: boss.id }).state;
    const victory = act(s, { type: 'attack' });
    assert.ok(victory.loot!.reduce((n, d) => n + d.qty, 0) >= 36);
    assert.ok(
      victory.loot!.some(
        (d) =>
          ITEMS[d.item].slot === 'weapon' ||
          ITEMS[d.item].slot === 'clothes' ||
          ITEMS[d.item].slot === 'accessory',
      ),
    );
  }
});
test('pickup transfers only available capacity and leaves the rest without duplication', () => {
  let s = fieldGame();
  currentDog(s).atk = 1000;
  const e = entities(s).find((e) => e.id === 'mob-0-0')!;
  closeTo(s, e);
  s = act(s, { type: 'interact', id: e.id }).state;
  s = act(s, { type: 'attack' }).state;
  const drop = s.drops.find((d) => d.item === 'potion')!;
  s.x = drop.x;
  s.y = drop.y;
  s.bag = Array.from({ length: 25 }, () => ({ item: 'berry', qty: 9 }));
  const full = s;
  assert.equal(act(s, { type: 'pickup' }).state, full);
  s.bag[0] = { item: 'potion', qty: 8 };
  const before = s.drops.reduce((n, d) => n + d.qty, 0);
  s = act(s, { type: 'pickup' }).state;
  assert.equal(countItem(s, 'potion'), 9);
  assert.equal(
    s.drops.reduce((n, d) => n + d.qty, 0),
    before - 1,
  );
  assert.equal(
    full.drops.reduce((n, d) => n + d.qty, 0),
    before,
  );
  assert.equal(act(s, { type: 'pickup' }).state, s);
  s.bag = Array(25).fill(null);
  const available = s.drops.reduce((n, d) => n + d.qty, 0);
  s = act(s, { type: 'interact', id: s.drops[0].id }).state;
  const stored = s.bag.reduce((n, slot) => n + (slot?.qty ?? 0), 0);
  assert.equal(stored + s.drops.reduce((n, d) => n + d.qty, 0), available);
});
test('ground loot is saved across travel and legacy saves receive an empty drop list', () => {
  let s = fieldGame();
  currentDog(s).atk = 1000;
  const e = entities(s).find((e) => e.kind === 'enemy')!;
  closeTo(s, e);
  s = act(s, { type: 'interact', id: e.id }).state;
  s = act(s, { type: 'attack' }).state;
  s.visited.push(1);
  const drops = structuredClone(s.drops);
  s = act(s, { type: 'travel', region: 1 }).state;
  s = unpackSave(packSave(s));
  assert.deepEqual(s.drops, drops);
  assert.ok(!entities(s).some((e) => e.kind === 'drop'));
  s = act(s, { type: 'travel', region: 0 }).state;
  assert.equal(
    entities(s).filter((e) => e.kind === 'drop').length,
    drops.length,
  );
  const raw = JSON.parse(packSave(fieldGame()));
  delete raw.state.drops;
  assert.deepEqual(unpackSave(JSON.stringify(raw)).drops, []);
  raw.state.drops = [{ ...drops[0], qty: -1 }];
  assert.throws(() => unpackSave(JSON.stringify(raw)));
});
test('large uncollected loot piles merge without losing items or overflowing the save', () => {
  let s = fieldGame(),
    total = 0;
  currentDog(s).atk = 1000;
  for (let i = 0; i < 40; i++) {
    s.seconds = s.respawnAt['mob-0-0'] ?? 0;
    const e = entities(s).find((e) => e.id === 'mob-0-0')!;
    closeTo(s, e);
    s = act(s, { type: 'interact', id: e.id }).state;
    const victory = act(s, { type: 'attack' });
    total += victory.loot!.reduce((n, d) => n + d.qty, 0);
    s = victory.state;
  }
  assert.ok(s.drops.length <= 840);
  assert.equal(
    s.drops.reduce((n, d) => n + d.qty, 0),
    total,
  );
  assert.ok(packSave(s).length < 200000);
  assert.deepEqual(unpackSave(packSave(s)).drops, s.drops);
});
