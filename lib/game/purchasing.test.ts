import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newGame,
  act,
  ITEMS,
  countItem,
  putItem,
  packSave,
  unpackSave,
  heroStats,
  type GameState,
} from './model.ts';
import { ITEM_ENTRIES } from './content.ts';
import { groupProducts, defaultProduct } from './shop-catalog.ts';
import { routeSpawn } from './route-layouts.ts';
function shop(type: GameState['shopType'] = 'convenience') {
  const s = newGame();
  Object.assign(s, {
    place: 'shop',
    shopType: type,
    x: 1024,
    y: 820,
    outside: routeSpawn(1),
    coins: 100000,
  });
  return s;
}
test('catalog groups thousands of level variants into one card per kind without hiding individual choices', () => {
  const entries = ITEM_ENTRIES.filter(
    ([, i]) =>
      i.shop === 'armory' && i.source === 'shop' && i.slot === 'weapon',
  );
  const groups = groupProducts(entries);
  assert.ok(groups.length < 8);
  assert.equal(new Set(groups.map((g) => g.key)).size, groups.length);
  assert.equal(
    groups.reduce((sum, g) => sum + g.entries.length, 0),
    entries.length,
  );
  for (const g of groups) {
    const [, chosen] = defaultProduct(g, 20, 25);
    assert.ok(chosen.level <= 20);
  }
  const bags = groupProducts(ITEM_ENTRIES.filter(([, i]) => !!i.capacity));
  assert.equal(bags.length, 1);
  assert.equal(defaultProduct(bags[0], 1, 50)[1].capacity, 100);
});
test('bulk purchases charge exact total, fill multiple stacks, and persist', () => {
  const s = shop(),
    before = countItem(s, 'potion');
  const purchased = act(s, { type: 'buy', id: 'potion', qty: 23 }).state;
  assert.equal(countItem(purchased, 'potion'), before + 23);
  assert.equal(purchased.coins, s.coins - ITEMS.potion.price * 23);
  assert.ok(purchased.bag.every((slot) => !slot || slot.qty <= 9));
  assert.deepEqual(unpackSave(packSave(purchased)), purchased);
});
test('gear is purchasable in quantity and repeated purchases, equipping only one copy', () => {
  let s = shop('armory');
  const [id, item] = ITEM_ENTRIES.find(
    ([, i]) => i.source === 'shop' && i.slot === 'weapon' && i.level === 1,
  )!;
  s = act(s, { type: 'buy', id, qty: 3 }).state;
  assert.equal(countItem(s, id), 3);
  assert.equal(s.weapon, id);
  assert.equal(heroStats(s).attack, s.hero.atk + item.attack!);
  s = act(s, { type: 'buy', id, qty: 2 }).state;
  assert.equal(countItem(s, id), 5);
  s = act(s, { type: 'sell', id, qty: 4 }).state;
  assert.equal(s.weapon, id);
  assert.equal(countItem(s, id), 1);
});
test('invalid quantities, insufficient funds, full bags, locked gear and exclusive loot fail atomically', () => {
  for (const qty of [0, -1, 1.5, NaN, Infinity, 1000]) {
    const s = shop();
    assert.equal(act(s, { type: 'buy', id: 'potion', qty }).state, s);
  }
  const full = shop();
  full.bag = Array(25)
    .fill(null)
    .map(() => ({ item: 'berry', qty: 9 }));
  full.bag[0] = { item: 'potion', qty: 8 };
  assert.equal(act(full, { type: 'buy', id: 'potion', qty: 2 }).state, full);
  const poor = shop();
  poor.coins = ITEMS.potion.price * 2 - 1;
  assert.equal(act(poor, { type: 'buy', id: 'potion', qty: 2 }).state, poor);
  const armory = shop('armory');
  assert.equal(act(armory, { type: 'buy', id: 'sword', qty: 3 }).state, armory);
  const [high] = ITEM_ENTRIES.find(
    ([, i]) => i.level === 20 && i.source === 'shop' && i.slot === 'weapon',
  )!;
  assert.equal(act(armory, { type: 'buy', id: high, qty: 2 }).state, armory);
  const s = shop();
  assert.equal(act(s, { type: 'buy', id: 'bag50', qty: 2 }).state, s);
  assert.equal(act(s, { type: 'buy', id: 'bag50', qty: 1 }).state.capacity, 50);
});
