import test from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  entities,
  newGame,
  packSave,
  unpackSave,
  walkable,
} from './model.ts';
import { clearSegment, findPath } from './navigation.ts';
import {
  SHOP_COUNTER,
  SHOP_ENTRY,
  SHOP_EXIT,
  shopPoint,
} from './shop-layout.ts';

test('both shops have a shorter, navigable entrance and a working return exit', () => {
  for (const shopType of ['convenience', 'armory']) {
    const outdoors = newGame();
    const door = entities(outdoors).find(
      (e) => e.kind === 'shop' && e.shopType === shopType,
    )!;
    Object.assign(outdoors, { x: door.x, y: door.y });
    let s = act(outdoors, { type: 'interact', id: door.id }).state;
    assert.equal(s.place, 'shop');
    assert.equal(s.shopType, shopType);
    assert.equal(s.x, SHOP_ENTRY.x);
    assert.equal(s.y, SHOP_ENTRY.y);
    assert.equal(Math.hypot(s.x - SHOP_COUNTER.x, s.y - SHOP_COUNTER.y), 504);
    for (const target of [SHOP_COUNTER, SHOP_EXIT]) {
      const path = findPath(s, { x: target.x, y: target.y + 38 });
      assert.ok(path.length);
      for (const point of path) {
        assert.ok(clearSegment(s, s, point));
        Object.assign(s, point);
      }
      const entity = entities(s).find(
        (e) => e.kind === (target === SHOP_COUNTER ? 'merchant' : 'exit'),
      )!;
      const result = act(s, { type: 'interact', id: entity.id });
      assert.equal(
        result.event,
        target === SHOP_COUNTER ? 'shop' : 'leave_shop',
      );
      s = result.state;
    }
    assert.equal(s.place, 'field');
    assert.equal(s.x, outdoors.x);
    assert.equal(s.y, outdoors.y);
  }
});

test('compact shop collision blocks walls and the counter while allowing the floor', () => {
  for (const [x, y, expected] of [
    [1024, 770, false],
    [270, 1100, false],
    [1778, 1100, false],
    [600, 1700, false],
    [1024, 1890, false],
    [1024, 800, true],
    [300, 1100, true],
    [1750, 1100, true],
    [1024, 1850, true],
    [280, 780, true],
    [1768, 1600, true],
    [1178, 1875, true],
  ] as const) {
    const p = shopPoint(x, y);
    assert.equal(walkable(p.x, p.y, 1, 'shop'), expected, `${x},${y}`);
  }
});

test('legacy indoor saves migrate once without changing the outdoor return point or purchases', () => {
  let s = newGame();
  const outside = { x: s.x, y: s.y };
  Object.assign(s, { place: 'shop', outside, ...SHOP_COUNTER });
  s = act(s, { type: 'buy', id: 'potion', qty: 2 }).state;
  assert.equal(s.purchases.length, 1);
  delete s.shopLayout;
  Object.assign(s, { x: 1200, y: 1400 });
  const migrated = unpackSave(packSave(s));
  assert.deepEqual({ x: migrated.x, y: migrated.y }, shopPoint(1200, 1400));
  assert.deepEqual(migrated.outside, outside);
  assert.deepEqual(migrated.bag, s.bag);
  assert.deepEqual(migrated.purchases, s.purchases);
  assert.equal(migrated.coins, s.coins);
  assert.deepEqual(unpackSave(packSave(migrated)), migrated);
  const outdoor = newGame();
  delete outdoor.shopLayout;
  const loaded = unpackSave(packSave(outdoor));
  assert.equal(loaded.x, outdoor.x);
  assert.equal(loaded.y, outdoor.y);
});
