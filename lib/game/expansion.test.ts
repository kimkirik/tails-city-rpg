import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newGame,
  act,
  entities,
  walkable,
  REGIONS,
  RAID_LIST,
  RAIDS,
  QUESTS,
  NPCS,
  ITEMS,
  heroStats,
  charmNeeded,
  questProgress,
  putItem,
  countItem,
  packSave,
  unpackSave,
  gatePoints,
  closedGates,
  type GameState,
  type Entity,
} from './model.ts';
import { findPath } from './navigation.ts';
import { makeBattleClip, visibleBattleHp } from './battle-motion.ts';
function approach(s: GameState, id: string) {
  const e = entities(s).find((e) => e.id === id);
  assert.ok(e, id);
  const path = findPath(s, { x: e.x, y: e.y + 30 });
  if (path.length) {
    s.x = path.at(-1)!.x;
    s.y = path.at(-1)!.y;
  }
  assert.ok(Math.hypot(s.x - e.x, s.y - e.y) < 110, `reachable ${id}`);
  return e;
}
function interact(s: GameState, id: string) {
  approach(s, id);
  return act(s, { type: 'interact', id }).state;
}
function cave(region = 0) {
  let s = newGame();
  s.region = region;
  s.visited = [...new Set([0, region])];
  s = interact(s, `raid-entry-${region}`);
  return s;
}
function win(s: GameState, id: string) {
  s.dogs[0].atk = 10000;
  s = interact(s, id);
  assert.ok(s.battle, id);
  return act(s, { type: 'attack' }).state;
}

test('visible gate topology and collision agree at every boundary and all links are reciprocal', () => {
  for (const region of REGIONS) {
    const s = newGame();
    s.region = region.id;
    s.visited.push(region.id);
    for (const [edge, point] of gatePoints(region.id).entries()) {
      const neighbor = region.neighbors[edge];
      if (neighbor < 0) {
        assert.equal(walkable(point.x, point.y, region.id), false);
        const wall = closedGates(region.id).find((g) => g.index === edge)!;
        assert.equal(walkable(wall.x, wall.y, region.id), false);
      } else {
        assert.equal(REGIONS[neighbor].neighbors[(edge + 2) % 4], region.id);
        const path = findPath(s, point);
        assert.ok(path.length, `${region.id} gate ${edge}`);
        const last = path.at(-1)!;
        s.x = last.x;
        s.y = last.y;
        const result = act(s, { type: 'travel', region: neighbor, gate: true });
        assert.equal(result.state.region, neighbor);
        assert.ok(walkable(result.state.x, result.state.y, neighbor));
        s.x = 1024;
        s.y = 1190;
      }
    }
  }
});
test('all field and cave interactions can be reached using the actual touch pathfinder', () => {
  for (const { id: region } of REGIONS)
    for (const place of ['field', 'cave'] as const) {
      if (place === 'cave' && !RAIDS[region]) continue;
      const s = place === 'cave' ? cave(region) : newGame();
      s.region = region;
      s.x = 1024;
      s.y = place === 'cave' ? 1720 : 1190;
      for (const e of entities(s)) approach(s, e.id);
    }
});
test('eight raids have distinct bosses outside towns and guards gate bosses', () => {
  const names = new Set<string>();
  for (const { region } of RAID_LIST) {
    let s = cave(region);
    const boss = entities(s).find((e) => e.dragon)!;
    names.add(boss.name);
    approach(s, boss.id);
    assert.equal(act(s, { type: 'interact', id: boss.id }).state, s);
    assert.equal(entities(s).filter((e) => e.creature !== undefined).length, 3);
    for (const id of [0, 1, 2]) s = win(s, `cave-${region}-${id}`);
    approach(s, boss.id);
    if (region === 5) {
      assert.equal(act(s, { type: 'interact', id: boss.id }).state, s);
      s.raids = [0, 6, 2, 3, 4];
    }
    s = win(s, boss.id);
    assert.ok(s.raids.includes(region));
    assert.equal(s.progress[`raid-${region}`], 1);
    assert.ok(s.drops.every((d) => walkable(d.x, d.y, region, d.place)));
    assert.deepEqual(unpackSave(packSave(s)), s);
  }
  assert.equal(names.size, 8);
  const village = newGame();
  village.region = 1;
  assert.equal(entities(village).filter((e) => e.kind === 'enemy').length, 0);
  assert.equal(entities(village).filter((e) => e.kind === 'cave').length, 0);
});
test('cave cats require guards; rescue and boss rewards persist and cannot repeat', () => {
  let s = cave();
  approach(s, 'cat-0');
  assert.equal(act(s, { type: 'interact', id: 'cat-0' }).state, s);
  for (const i of [0, 1, 2]) s = win(s, `cave-0-${i}`);
  s = interact(s, 'cat-0');
  assert.equal(s.progress.cats, 1);
  const coins = s.coins;
  s = act(s, { type: 'interact', id: 'cat-0' }).state;
  assert.equal(s.coins, coins);
  s = interact(s, 'cave-exit-0');
  assert.equal(s.place, 'field');
  s = interact(s, 'raid-entry-0');
  assert.equal(s.caveCleared.length, 0);
  assert.ok(!entities(s).some((e) => e.kind === 'cat'));
  assert.equal(entities(s).filter((e) => e.creature !== undefined).length, 3);
  assert.deepEqual(unpackSave(packSave(s)).rescued, [0]);
});
test('NPC information, prerequisites, claim proximity and rewards are consistent and atomic', () => {
  let s = newGame();
  s.region = 1;
  s.visited.push(1);
  s = interact(s, 'npc-elder');
  s = act(s, { type: 'quest', id: 'rumors' }).state;
  assert.equal(s.quests.rumors, 'active');
  for (const npc of ['detective', 'vet', 'worker'])
    s = interact(s, `npc-${npc}`);
  assert.equal(questProgress(s, 'rumors'), 3);
  assert.equal(act(s, { type: 'quest', id: 'rumors' }).state, s);
  s = interact(s, 'npc-elder');
  s.bag = Array.from({ length: 25 }, () => ({ item: 'berry', qty: 9 }));
  assert.equal(act(s, { type: 'quest', id: 'rumors' }).state, s);
  s.bag[0] = null;
  const coins = s.coins,
    charm = s.hero.charm;
  s = act(s, { type: 'quest', id: 'rumors' }).state;
  assert.equal(s.coins, coins + 220);
  assert.equal(s.hero.charm, charm + 2);
  assert.equal(s.quests.rumors, 'claimed');
  assert.equal(act(s, { type: 'quest', id: 'rumors' }).state, s);
  s = interact(s, 'npc-detective');
  s = act(s, { type: 'quest', id: 'thieves' }).state;
  assert.equal(s.quests.thieves, 'active');
  assert.deepEqual(unpackSave(packSave(s)), s);
});
test('charm gates recruitment without wasting treats; equipment raises real stats and strengthens recruitment', () => {
  let s = newGame();
  approach(s, 'dog-1-b');
  const treats = countItem(s, 'treat');
  assert.equal(act(s, { type: 'interact', id: 'dog-1-b' }).state, s);
  assert.equal(countItem(s, 'treat'), treats);
  putItem(s, 'ribbon');
  s = act(s, { type: 'item', id: 'ribbon' }).state;
  assert.equal(heroStats(s).charm, 10);
  s = act(s, { type: 'interact', id: 'dog-1-b' }).state;
  assert.equal(s.dogs.length, 2);
  assert.equal(countItem(s, 'treat'), treats - 1);
  putItem(s, 'ranger');
  s = act(s, { type: 'item', id: 'ranger' }).state;
  assert.equal(heroStats(s).maxHp, 155);
  assert.equal(heroStats(s).defense, 4);
  assert.equal(heroStats(s).charm, 14);
  assert.equal(s.hero.hp, 155);
});
test('boosts stop at20 and poison, healing, revival respect targets and turn costs', () => {
  let s = newGame();
  putItem(s, 'tonic', 21);
  for (let i = 0; i < 20; i++)
    s = act(s, { type: 'item', id: 'tonic', target: 'traveler' }).state;
  assert.equal(s.hero.boosts, 20);
  assert.equal(
    act(s, { type: 'item', id: 'tonic', target: 'traveler' }).state,
    s,
  );
  s = cave(2);
  for (const i of [0, 1, 2]) s = win(s, `cave-2-${i}`);
  s.dogs[0].atk = 15;
  s = interact(s, 'dragon-2');
  s.battle!.turn = 3;
  const original = structuredClone(s),
    result = act(s, { type: 'guard' }),
    clip = makeBattleClip(s, 'guard', result);
  assert.ok(result.state.dogs[0].poison);
  assert.equal(clip.counters[0].breath, true);
  assert.equal(
    visibleBattleHp(original, clip, clip.duration).dogs.starter,
    result.state.dogs[0].hp,
  );
  s = result.state;
  putItem(s, 'antidote');
  const turn = s.battle!.turn;
  s = act(s, { type: 'item', id: 'antidote', target: 'starter' }).state;
  assert.equal(s.battle!.turn, turn + 1);
  assert.equal(s.dogs[0].poison, false);
  s = act(s, { type: 'flee' }).state;
  s.hero.hp = 0;
  assert.equal(
    act(s, { type: 'item', id: 'potion', target: 'traveler' }).state,
    s,
  );
  s = act(s, { type: 'item', id: 'revive', target: 'traveler' }).state;
  assert.equal(s.hero.hp, heroStats(s).maxHp);
});
test('legacy saves migrate blocked-edge positions while invalid new state is rejected', () => {
  const raw = JSON.parse(packSave(newGame()));
  for (const key of [
    'hero',
    'equipment',
    'quests',
    'progress',
    'talked',
    'rescued',
    'raids',
    'caveCleared',
    'npc',
    'shopType',
  ])
    delete raw.state[key];
  raw.state.y = 70;
  const s = unpackSave(JSON.stringify(raw));
  assert.equal(s.hero.charm, 5);
  assert.ok(walkable(s.x, s.y, s.region));
  for (const patch of [
    { hero: { ...s.hero, hp: 99999 } },
    { quests: { bogus: 'claimed' } },
    { progress: { rats: -1 } },
    { raids: [1, 1] },
    { equipment: { clothes: 'potion', accessory: null } },
    { capacity: 1005 },
    { place: 'cave', outside: undefined },
  ])
    assert.throws(() => unpackSave(packSave({ ...s, ...patch } as GameState)));
});
