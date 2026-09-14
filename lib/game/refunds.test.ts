import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newGame,
  act,
  ITEMS,
  entities,
  countItem,
  putItem,
  packSave,
  unpackSave,
  heroStats,
  type GameState,
} from './model.ts';
import { REFUND_WINDOW_MS, refundStatus } from './purchases.ts';
import { routeSpawn } from './route-layouts.ts';
const time = Date.now();
function shop(type: GameState['shopType'] = 'convenience') {
  const s = newGame();
  Object.assign(s, {
    place: 'shop',
    shopType: type,
    x: 1024,
    y: 820,
    outside: routeSpawn(1),
    coins: 100000,
    bag: Array(25).fill(null),
  });
  return s;
}
function buy(s: GameState, item = 'potion', qty = 1, at = time) {
  const r = act(s, { type: 'buy', id: item, qty }, at);
  assert.equal(r.event, 'purchase', r.message);
  return r.state;
}
function refund(s: GameState, id = s.purchases.at(-1)!.id, at = time + 1) {
  return act(s, { type: 'refund', id }, at);
}

test('bulk order cancellation returns the exact original coins once and survives saving', () => {
  const original = shop();
  let s = buy(original, 'potion', 23);
  assert.equal(refundStatus(s, s.purchases[0], time).seconds, 600);
  s = unpackSave(packSave(s));
  const r = refund(s);
  assert.equal(r.event, 'refund');
  assert.equal(r.state.coins, original.coins);
  assert.equal(countItem(r.state, 'potion'), 0);
  assert.equal(r.state.purchases[0].refunded, 23);
  assert.equal(refund(r.state).state, r.state);
  assert.deepEqual(unpackSave(packSave(r.state)), r.state);
});

test('deadline uses absolute purchase time across reopening and ignores game pause time', () => {
  const s = buy(shop());
  s.seconds = 12345;
  assert.equal(
    refund(
      unpackSave(packSave(s)),
      s.purchases[0].id,
      time + REFUND_WINDOW_MS - 1,
    ).event,
    'refund',
  );
  assert.equal(refund(s, s.purchases[0].id, time + REFUND_WINDOW_MS).state, s);
  assert.equal(refund(s, s.purchases[0].id, time - 1).state, s);
});

test('only remaining unused units are refunded; selling or consuming cannot create coins or restore rights', () => {
  let s = buy(shop(), 'potion', 5);
  s.hero.hp = 1;
  s = act(
    s,
    { type: 'item', id: 'potion', target: 'traveler' },
    time + 10,
  ).state;
  s = act(s, { type: 'sell', id: 'potion', qty: 2 }, time + 20).state;
  assert.equal(s.purchases[0].remaining, 2);
  const before = s.coins;
  putItem(s, 'potion', 1);
  const r = refund(s);
  assert.equal(r.state.coins, before + ITEMS.potion.price * 2);
  assert.equal(countItem(r.state, 'potion'), 1);
  assert.equal(r.state.hero.hp, s.hero.hp);
});

test('existing stock is used before the purchased stock and repeat orders remain independent', () => {
  const original = shop();
  putItem(original, 'potion', 2);
  let s = buy(original, 'potion', 3);
  s = buy(s, 'potion', 4, time + 2);
  s = act(s, { type: 'sell', id: 'potion', qty: 4 }, time + 3).state;
  assert.deepEqual(
    s.purchases.map((p) => p.remaining),
    [1, 4],
  );
  const second = s.purchases[1].id;
  s = refund(s, second, time + 4).state;
  assert.equal(countItem(s, 'potion'), 1);
  assert.equal(s.purchases[0].remaining, 1);
  assert.deepEqual(unpackSave(packSave(s)), s);
});

test('unused equipment restores the previous owned item without a free healing loop', () => {
  const original = shop('armory');
  original.hero.level = 20;
  putItem(original, 'ribbon');
  const prepared = act(original, { type: 'item', id: 'ribbon' }).state;
  prepared.hero.hp = 30;
  const clothes = Object.keys(ITEMS).find(
    (id) =>
      ITEMS[id].source === 'shop' &&
      ITEMS[id].slot === 'clothes' &&
      ITEMS[id].level <= 20 &&
      (ITEMS[id].hp ?? 0) > 0,
  )!;
  const s = buy(prepared, clothes);
  const r = refund(s);
  assert.equal(countItem(r.state, clothes), 0);
  assert.equal(r.state.hero.hp, 30);
  assert.equal(r.state.coins, prepared.coins);
  assert.equal(heroStats(r.state).maxHp, heroStats(prepared).maxHp);
  const [first, second] = Object.keys(ITEMS).filter(
    (id) =>
      ITEMS[id].source === 'shop' &&
      ITEMS[id].slot === 'weapon' &&
      ITEMS[id].level === 1,
  );
  let gear = buy(prepared, first);
  gear = buy(gear, second);
  assert.equal(refund(gear).state.weapon, first);
});

test('combat-used equipment is excluded while extra unused copies remain refundable', () => {
  const id = Object.keys(ITEMS).find(
    (id) =>
      ITEMS[id].source === 'shop' &&
      ITEMS[id].slot === 'weapon' &&
      ITEMS[id].level === 1,
  )!;
  let s = buy(shop('armory'), id, 3);
  Object.assign(s, { region: 0, visited: [1, 0], place: 'field' });
  const enemy = entities(s).find((e) => e.kind === 'enemy' && !e.captain)!;
  s.x = enemy.x;
  s.y = enemy.y;
  s = act(s, { type: 'interact', id: enemy.id }, time + 10).state;
  assert.ok(s.battle);
  assert.equal(s.purchases[0].remaining, 2);
  assert.equal(refund(s).state, s);
  s = act(s, { type: 'flee' }).state;
  Object.assign(s, { region: 1, place: 'shop', x: 1024, y: 820 });
  const r = refund(s);
  assert.equal(countItem(r.state, id), 1);
  assert.equal(r.state.weapon, id);
});

test('bag upgrades roll back newest first, preserve items, and refuse overflow atomically', () => {
  let s = buy(shop(), 'bag50');
  const first = s.purchases[0].id;
  s = buy(s, 'bag100', 1, time + 1);
  assert.equal(refund(s, first, time + 2).state, s);
  s = refund(s, s.purchases[1].id, time + 2).state;
  assert.equal(s.capacity, 50);
  s.bag[49] = { item: 'potion', qty: 2 };
  s = refund(s, first, time + 3).state;
  assert.equal(s.capacity, 25);
  assert.equal(s.bag.length, 25);
  assert.equal(countItem(s, 'potion'), 2);
  assert.deepEqual(unpackSave(packSave(s)), s);
  const full = buy(shop(), 'bag50');
  full.bag = Array.from({ length: 50 }, (_, i) =>
    i < 26 ? { item: 'berry', qty: 9 } : null,
  );
  assert.equal(refund(full).state, full);
});

test('refunds require a merchant, accept either shop, and reject unknown records and coin overflow', () => {
  const s = buy(shop());
  assert.equal(refund(s, crypto.randomUUID()).state, s);
  const far = structuredClone(s);
  far.x = 100;
  assert.equal(refund(far).state, far);
  const rich = structuredClone(s);
  rich.coins = 99999999;
  assert.equal(refund(rich).state, rich);
  s.shopType = 'armory';
  assert.equal(refund(s).event, 'refund');
});

test('old saves load without receipts; malformed or inflated refund records are rejected', () => {
  const old = JSON.parse(packSave(shop()));
  delete old.state.purchases;
  assert.deepEqual(unpackSave(JSON.stringify(old)).purchases, []);
  const s = buy(shop());
  for (const patch of [
    { remaining: 10 },
    { refunded: 2 },
    { unitPrice: -1 },
    { purchasedAt: 'yesterday' },
    { previousCapacity: 0 },
  ]) {
    const bad = JSON.parse(packSave(s));
    Object.assign(bad.state.purchases[0], patch);
    assert.throws(() => unpackSave(JSON.stringify(bad)));
  }
});

test('expired inventory consumption stays save-compatible and cannot renew the deadline', () => {
  let s = buy(shop(), 'potion', 3);
  s = act(
    s,
    { type: 'sell', id: 'potion', qty: 1 },
    time + REFUND_WINDOW_MS + 1,
  ).state;
  assert.deepEqual(unpackSave(packSave(s)), s);
  assert.equal(
    refund(s, s.purchases[0].id, time + REFUND_WINDOW_MS + 2).state,
    s,
  );
});
