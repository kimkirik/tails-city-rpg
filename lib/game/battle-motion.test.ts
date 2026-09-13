import { fieldGame as newGame } from './test-fixtures.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeDog,
  act,
  entities,
  currentDog,
  packSave,
  unpackSave,
  teamCondition,
} from './model.ts';
import {
  BattleDirector,
  makeBattleClip,
  visibleBattleHp,
  strikePose,
  stagePositions,
  dogStagePose,
  travelerStagePose,
  type AttackKind,
} from './battle-motion.ts';
import { DOG_WALK_SHEETS } from './dog-art.ts';
function battle() {
  let s = newGame();
  s.dogs.push(makeDog('dog-0', '구름', 1));
  s.recruited.push('dog-0');
  s.party.push('dog-0');
  const enemy = entities(s).find((e) => e.id === 'captain-0')!;
  s.x = enemy.x;
  s.y = enemy.y;
  s = act(s, { type: 'interact', id: enemy.id }).state;
  s.battle!.enemy.hp = s.battle!.enemy.maxHp = 500;
  return s;
}
test('solo actions animate only their actor and update HP at each actual impact', () => {
  for (const actor of ['traveler', 'starter', 'dog-0'])
    for (const kind of ['attack', 'skill', 'tail'] as AttackKind[]) {
      if (actor === 'traveler' && kind === 'tail') continue;
      const s = battle();
      s.battle!.actor = actor;
      const result = act(s, { type: kind }),
        clip = makeBattleClip(s, kind, result);
      assert.deepEqual(clip.participants, [actor]);
      assert.equal(clip.strikes.length, 1);
      assert.equal(clip.strikes[0].actorId, actor);
      assert.equal(clip.counters.length, 1);
      assert.ok(clip.counter!.start > clip.strikes[0].end);
      assert.equal(
        visibleBattleHp(s, clip, clip.strikes[0].impact - 1).enemy,
        500,
      );
      assert.equal(
        visibleBattleHp(s, clip, clip.duration).enemy,
        result.state.battle!.enemy.hp,
      );
      const hp = visibleBattleHp(s, clip, clip.duration);
      assert.equal(hp.hero, result.state.hero.hp);
      for (const dog of result.state.dogs)
        assert.equal(hp.dogs[dog.id], dog.hp);
    }
});
test('team attack is locked until turn3, allowed once and consumes exactly two counters', () => {
  let s = battle();
  assert.match(teamCondition(s), /3턴/);
  assert.equal(act(s, { type: 'team' }).state, s);
  s = act(s, { type: 'guard' }).state;
  s = act(s, { type: 'attack' }).state;
  const result = act(s, { type: 'team' }),
    clip = makeBattleClip(s, 'team', result);
  assert.equal(result.state.battle!.turn, 5);
  assert.equal(result.state.battle!.teamUsed, true);
  assert.equal(act(result.state, { type: 'team' }).state, result.state);
  assert.deepEqual(clip.participants, ['traveler', 'starter', 'dog-0']);
  assert.equal(clip.strikes.length, 3);
  assert.equal(clip.counters.length, 2);
  assert.ok(clip.counters[1].start > clip.counters[0].end);
  const hp = visibleBattleHp(s, clip, clip.duration);
  assert.equal(hp.hero, result.state.hero.hp);
  assert.equal(hp.dogs.starter, result.state.dogs[0].hp);
  s.hero.hp = 0;
  assert.match(teamCondition(s), /여행자/);
  s.hero.hp = 100;
  s.dogs.forEach((d) => (d.hp = 0));
  assert.match(teamCondition(s), /동료/);
});
test('guard has no attack strikes, solo staging and one reduced counter', () => {
  const s = battle(),
    normal = act(s, { type: 'attack' }),
    guard = act(s, { type: 'guard' }),
    clip = makeBattleClip(s, 'guard', guard);
  assert.equal(clip.strikes.length, 0);
  assert.equal(clip.counters.length, 1);
  assert.deepEqual(clip.participants, ['starter']);
  assert.equal(guard.state.battle!.enemy.hp, 500);
  assert.ok(guard.state.dogs[0].hp > normal.state.dogs[0].hp);
});
test('queued victory cannot be double-tapped or award loot twice', () => {
  const s = battle();
  currentDog(s).atk = 1000;
  const director = new BattleDirector(),
    pending = director.begin(s, 'tail')!;
  assert.ok(director.busy);
  assert.equal(s.kills, 0);
  assert.equal(s.drops.length, 0);
  assert.equal(director.begin(s, 'attack'), null);
  assert.equal(pending.clip!.strikes.length, 1);
  assert.equal(pending.clip!.counter, null);
  assert.equal(pending.clip!.strikes[0].damage, 500);
  const result = director.finish()!;
  assert.equal(result.state.kills, 1);
  assert.ok(result.state.drops.length > 0);
  assert.equal(director.finish(), null);
  assert.equal(director.busy, false);
  assert.equal(unpackSave(packSave(result.state)).kills, 1);
});
test('cooldowns reject clips and team staging excludes fainted support', () => {
  const s = battle();
  s.battle!.cooldown = 2;
  const d = new BattleDirector();
  assert.equal(d.begin(s, 'skill')!.clip, null);
  assert.equal(d.busy, false);
  s.battle!.turn = 3;
  s.dogs[1].hp = 0;
  const next = d.begin(s, 'team')!;
  assert.deepEqual(next.clip!.participants, ['traveler', 'starter']);
  assert.equal(next.clip!.strikes.length, 2);
  d.cancel();
  assert.equal(d.finish(), null);
});
test('tail attack rotates through four facings, reaches target and returns home', () => {
  const s = battle(),
    clip = makeBattleClip(s, 'tail', act(s, { type: 'tail' })),
    hit = clip.strikes[0];
  assert.equal(strikePose(hit, hit.start).move, 0);
  assert.ok(strikePose(hit, hit.impact).move > 0.99);
  assert.equal(strikePose(hit, hit.end).move, 0);
  const directions = new Set(
    Array.from(
      { length: 6 },
      (_, i) => strikePose(hit, hit.start + 275 + i * 55).facing,
    ),
  );
  assert.equal(directions.size, 4);
  assert.equal(DOG_WALK_SHEETS.length, 7);
});
test('all attack paths fit short and tall battle stages', () => {
  for (const [w, h] of [
    [292, 160],
    [360, 320],
    [740, 150],
    [980, 520],
  ])
    for (const style of ['dash', 'tail', 'leap'] as const) {
      const layout = stagePositions(w, h, 2);
      for (let elapsed = 0; elapsed <= 1000; elapsed += 40) {
        const strike = {
          actorId: 'starter',
          slot: 0,
          style,
          damage: 10,
          start: 100,
          impact: 500,
          end: 960,
          color: '#fff',
        };
        for (const slot of [0, 1]) {
          const p = dogStagePose(layout, slot, strike, elapsed);
          assert.ok(
            p.x - layout.dogSize / 2 >= 0 && p.x + layout.dogSize / 2 <= w,
          );
          assert.ok(
            p.y - layout.dogSize * 0.82 >= 0 &&
              p.y + layout.dogSize * 0.18 <= h,
          );
        }
        const p = travelerStagePose(layout, strike, elapsed);
        assert.ok(
          p.x - layout.travelerSize / 2 >= 0 &&
            p.x + layout.travelerSize / 2 <= w,
        );
        assert.ok(
          p.y - layout.travelerSize * 0.82 >= 0 &&
            p.y + layout.travelerSize * 0.18 <= h,
        );
      }
    }
});
