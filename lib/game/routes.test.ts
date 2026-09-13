import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newGame,
  REGIONS,
  entities,
  gatePoints,
  gateAt,
  act,
  packSave,
  unpackSave,
  walkable,
  putItem,
  type GameState,
} from './model.ts';
import { ROUTE_LAYOUTS, routeSpawn } from './route-layouts.ts';
import { findPath, clearSegment } from './navigation.ts';

test('all outdoor touch routes stay on walkable ground including every smoothed segment and arrival', () => {
  for (const region of REGIONS) {
    const s = newGame();
    s.region = region.id;
    s.visited = [region.id];
    Object.assign(s, routeSpawn(region.id));
    const destinations = [
      ...entities(s).map((e) => ({ x: e.x, y: e.y + 38 })),
      ...gatePoints(region.id).filter((_, i) => region.neighbors[i] >= 0),
    ];
    for (const target of destinations) {
      const path = findPath(s, target);
      assert.ok(path.length, `${region.name}: ${JSON.stringify(target)}`);
      let previous = { x: s.x, y: s.y };
      for (const point of path) {
        assert.ok(
          clearSegment(s, previous, point),
          `${region.name}: shortcut crosses scenery`,
        );
        previous = point;
      }
      assert.ok(Math.hypot(previous.x - target.x, previous.y - target.y) < 45);
    }
    for (const [edge, neighbor] of region.neighbors.entries())
      if (neighbor >= 0) {
        Object.assign(s, gatePoints(region.id)[edge]);
        const arrival = act(s, {
          type: 'travel',
          region: neighbor,
          gate: true,
        }).state;
        assert.equal(arrival.region, neighbor);
        assert.equal(
          gateAt(arrival.x, arrival.y, neighbor),
          -1,
          'arrival must not immediately travel back',
        );
      }
  }
});
test('route silhouettes differ and old center-cross shortcuts are blocked', () => {
  assert.equal(
    new Set(ROUTE_LAYOUTS.map((r) => JSON.stringify(r.paths))).size,
    12,
  );
  assert.equal(walkable(1024, 970, 0), false, 'lake interior stays blocked');
  assert.equal(walkable(1024, 1000, 1), false, 'village garden stays blocked');
  const s = newGame();
  s.region = 0;
  Object.assign(s, { x: 620, y: 760 });
  const target = { x: 1540, y: 1300 };
  assert.equal(clearSegment(s, s, target), false, 'cannot cut across lake');
  assert.ok(findPath(s, target).length > 1, 'must follow the lake loop');
});
test('revision2 saves relocate outdoor heroes, interior returns and every ground drop without losing progress', () => {
  for (const region of REGIONS) {
    const old = newGame();
    old.worldRevision = 2;
    old.region = region.id;
    old.visited = [region.id];
    old.x = 1024;
    old.y = 1190;
    old.coins = 6543;
    old.playerName = '리치랑';
    putItem(old, 'potion', 12);
    old.quests = { rumors: 'claimed' };
    old.raids = [0];
    old.drops = [
      {
        id: 'drop-0-1',
        region: region.id,
        place: 'field',
        x: 1024,
        y: 1700,
        originX: 1024,
        originY: 1700,
        item: 'berry',
        qty: 17,
        createdAt: 0,
      },
    ];
    const restored = unpackSave(packSave(old));
    assert.equal(restored.worldRevision, 3);
    assert.ok(walkable(restored.x, restored.y, region.id));
    assert.deepEqual(restored.bag, old.bag);
    assert.deepEqual(restored.dogs, old.dogs);
    assert.deepEqual(restored.quests, old.quests);
    assert.equal(restored.coins, 6543);
    assert.equal(restored.drops[0].qty, 17);
    assert.ok(walkable(restored.drops[0].x, restored.drops[0].y, region.id));
    Object.assign(old, {
      place: region.town ? 'shop' : 'cave',
      outside: { x: 1024, y: 1620 },
      x: 1024,
      y: region.town ? 820 : 1720,
    });
    const interior = unpackSave(packSave(old));
    assert.ok(walkable(interior.outside!.x, interior.outside!.y, region.id));
    assert.deepEqual(unpackSave(packSave(interior)), interior);
  }
});
test('revision3 saves reject new off-road positions instead of accepting corrupt movement', () => {
  const s = newGame();
  s.region = 0;
  s.visited = [0];
  s.x = 1024;
  s.y = 970;
  assert.throws(() => unpackSave(packSave(s)));
});
