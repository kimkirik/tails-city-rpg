import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newGame,
  act,
  entities,
  RAID_LIST,
  CAMPAIGN_REGIONS,
  campaignComplete,
  packSave,
  unpackSave,
} from './model.ts';
import { routeSpawn } from './route-layouts.ts';

test('every raid can trigger the ending when it is the last uncleared boss', () => {
  for (const { region } of RAID_LIST) {
    let s = newGame();
    Object.assign(s, {
      region,
      place: 'cave',
      outside: routeSpawn(region),
      visited: [1, region],
      raids: RAID_LIST.filter((r) => r.region !== region).map((r) => r.region),
      caveCleared: [0, 1, 2].map((i) => `cave-${region}-${i}`),
    });
    assert.equal(campaignComplete(s), false);
    const boss = entities(s).find((e) => e.dragon)!;
    s.x = boss.x;
    s.y = boss.y + 32;
    s.dogs[0].atk = 90000;
    s = act(s, { type: 'interact', id: boss.id }).state;
    assert.ok(s.battle);
    const result = act(s, { type: 'attack' });
    assert.equal(result.event, 'win');
    assert.ok(result.combat?.hits.length);
    assert.ok(result.loot?.length);
    assert.equal(result.state.battle, null);
    assert.equal(result.state.won, true);
    assert.equal(result.state.endingSeen, false);
    assert.equal(campaignComplete(result.state), true);
    assert.deepEqual(unpackSave(packSave(result.state)), result.state);
  }
});

test('headquarters captain alone no longer finishes the story', () => {
  let s = newGame();
  s.region = 5;
  s.visited = [1, 5];
  s.defeated = CAMPAIGN_REGIONS.map((region) => `captain-${region}`);
  const captain = entities(s).find((e) => e.id === 'captain-5')!;
  s.x = captain.x;
  s.y = captain.y;
  s.dogs[0].atk = 90000;
  s = act(s, { type: 'interact', id: captain.id }).state;
  assert.ok(s.battle);
  s = act(s, { type: 'attack' }).state;
  assert.ok(s.defeated.includes(captain.id));
  assert.equal(s.won, false);
});

test('old saves derive the new ending from real raid IDs, not the old victory flag', () => {
  const old = newGame();
  old.won = true;
  const raw = JSON.parse(packSave(old));
  delete raw.state.endingSeen;
  assert.equal(unpackSave(JSON.stringify(raw)).won, false);
  raw.state.raids = RAID_LIST.map((r) => r.region);
  raw.state.won = false;
  const migrated = unpackSave(JSON.stringify(raw));
  assert.equal(migrated.won, true);
  assert.equal(migrated.endingSeen, false);
  assert.equal(campaignComplete({ raids: Array(8).fill(0) }), false);
  raw.state.endingSeen = 'yes';
  assert.throws(() => unpackSave(JSON.stringify(raw)));
});

test('ending acknowledgement persists once, grants no repeat rewards, and allows continued play', () => {
  const incomplete = newGame();
  assert.equal(act(incomplete, { type: 'ending-seen' }).state, incomplete);
  const s = newGame();
  s.raids = RAID_LIST.map((r) => r.region);
  s.won = true;
  const ended = act(s, { type: 'ending-seen' }).state;
  assert.equal(ended.endingSeen, true);
  assert.equal(ended.coins, s.coins);
  assert.deepEqual(ended.bag, s.bag);
  assert.deepEqual(unpackSave(packSave(ended)), ended);
  assert.equal(act(ended, { type: 'ending-seen' }).state, ended);
  const continued = act(ended, { type: 'rename', name: '리치친구' }).state;
  assert.equal(continued.playerName, '리치친구');
  assert.equal(continued.won, true);
});
