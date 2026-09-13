import { routeSpawn } from './route-layouts.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newGame,
  act,
  putItem,
  countItem,
  sellPrice,
  ITEMS,
  heroStats,
  packSave,
  unpackSave,
  type GameState,
} from './model.ts';
function shop(shopType: GameState['shopType'] = 'convenience') {
  const s = newGame();
  Object.assign(s, {
    place: 'shop',
    shopType,
    x: 1024,
    y: 850,
    outside: routeSpawn(1),
  });
  return s;
}
test('both shops buy multiple inventory stacks atomically, free slots and preserve sales in saves', () => {
  for (const type of ['convenience', 'armory'] as const) {
    const s = shop(type);
    s.bag = Array(s.capacity).fill(null);
    putItem(s, 'potion', 20);
    putItem(s, 'sword');
    const sold = act(s, { type: 'sell', id: 'potion', qty: 12 });
    assert.equal(sold.state.coins, s.coins + 12 * 22);
    assert.equal(countItem(sold.state, 'potion'), 8);
    assert.equal(sold.state.bag[0], null);
    assert.equal(countItem(sold.state, 'sword'), 1);
    assert.equal(countItem(s, 'potion'), 20);
    const all = act(sold.state, { type: 'sell', id: 'potion', qty: 8 }).state;
    assert.equal(countItem(all, 'potion'), 0);
    assert.equal(all.capacity, s.capacity);
    const loaded = unpackSave(packSave(all));
    assert.equal(loaded.coins, all.coins);
    assert.deepEqual(loaded.bag, all.bag);
    assert.equal(act(all, { type: 'sell', id: 'potion', qty: 1 }).state, all);
  }
});
test('invalid quantities, unavailable items, expanded bags, distant counters and combat cannot create coins', () => {
  const s = shop();
  for (const qty of [0, -1, 0.5, NaN, Infinity, 9999]) {
    assert.equal(act(s, { type: 'sell', id: 'potion', qty }).state, s);
  }
  for (const id of ['missing', 'sword', 'bag1000'])
    assert.equal(act(s, { type: 'sell', id, qty: 1 }).state, s);
  for (const change of [
    { place: 'field' },
    { place: 'cave' },
    { x: 1024, y: 1600 },
    { battle: { turn: 1 } },
  ]) {
    const blocked = { ...s, ...change } as GameState;
    assert.equal(
      act(blocked, { type: 'sell', id: 'potion', qty: 1 }).state,
      blocked,
    );
  }
  const limit = { ...s, coins: 99999999 };
  assert.equal(act(limit, { type: 'sell', id: 'potion', qty: 1 }).state, limit);
});
test('selling last equipped items removes bonuses and clamps HP without losing remaining gear', () => {
  let s = shop('armory');
  s.coins = 20000;
  for (const id of ['dragonblade', 'hoodie', 'ribbon']) {
    putItem(s, id);
    s = act(s, { type: 'item', id }).state;
  }
  assert.equal(s.weapon, 'dragonblade');
  putItem(s, 'hoodie');
  s.hero.hp = heroStats(s).maxHp;
  s = act(s, { type: 'sell', id: 'hoodie', qty: 1 }).state;
  assert.equal(s.equipment.clothes, 'hoodie');
  assert.equal(s.hero.hp, heroStats(s).maxHp);
  for (const id of ['hoodie', 'ribbon', 'dragonblade']) {
    s = act(s, { type: 'sell', id, qty: 1 }).state;
    assert.equal(countItem(s, id), 0);
    assert.ok(s.hero.hp <= heroStats(s).maxHp);
    assert.doesNotThrow(() => unpackSave(packSave(s)));
  }
  assert.equal(s.weapon, null);
  assert.deepEqual(s.equipment, { clothes: null, accessory: null });
  assert.equal(heroStats(s).attack, s.hero.atk);
  assert.equal(heroStats(s).charm, s.hero.charm);
});
test('all sale prices stay below purchase prices and a buy/sell round trip cannot earn money', () => {
  for (const [id, item] of Object.entries(ITEMS)) {
    assert.equal(sellPrice(id), item.capacity ? 0 : Math.floor(item.price / 2));
    if (item.capacity) continue;
    const s = shop(item.shop);
    s.bag = Array(s.capacity).fill(null);
    s.coins = 200000;
    s.hero.level = item.level;
    if (item.source !== 'shop') {
      assert.equal(act(s, { type: 'buy', id }).state, s);
      putItem(s, id);
      const sold = act(s, { type: 'sell', id, qty: 1 }).state;
      assert.equal(countItem(sold, id), 0);
      assert.equal(sold.coins, s.coins + sellPrice(id));
      continue;
    }
    const bought = act(s, { type: 'buy', id }).state;
    const sold = act(bought, { type: 'sell', id, qty: 1 }).state;
    assert.equal(sold.coins, s.coins - item.price + sellPrice(id));
    assert.ok(sold.coins < s.coins);
  }
});
