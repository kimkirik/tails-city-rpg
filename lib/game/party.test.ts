import { fieldGame as newGame } from './test-fixtures.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeDog,
  act,
  entities,
  packSave,
  unpackSave,
  partyDogs,
  currentDog,
  type GameState,
} from './model.ts';
import { enemyLook, ENEMY_LOOKS } from './enemies.ts';

function withParty() {
  const s = newGame();
  s.dogs.push(makeDog('dog-0', '구름', 1), makeDog('dog-0-b', '쿠키', 4));
  s.recruited.push('dog-0', 'dog-0-b');
  s.party.push('dog-0');
  return s;
}
function battle(s: GameState) {
  const enemy = entities(s).find((e) => e.id === 'captain-0')!;
  s.x = enemy.x;
  s.y = enemy.y;
  return act(s, { type: 'interact', id: enemy.id }).state;
}

test('recruiting fills the second follower slot but never a third', () => {
  let s = newGame();
  s.hero.charm = 20;
  for (const id of ['dog-0', 'dog-0-b']) {
    const e = entities(s).find((e) => e.id === id)!;
    s.x = e.x;
    s.y = e.y;
    s = act(s, { type: 'interact', id }).state;
  }
  assert.deepEqual(s.party, ['starter', 'dog-0']);
  assert.equal(s.dogs.length, 3);
  const denied = act(s, { type: 'party', id: 'dog-0-b' });
  assert.equal(denied.state, s);
  s = act(s, { type: 'party', id: 'dog-0' }).state;
  s = act(s, { type: 'party', id: 'dog-0-b' }).state;
  assert.deepEqual(s.party, ['starter', 'dog-0-b']);
  s = act(s, { type: 'party', id: 'starter' }).state;
  assert.equal(s.active, 'dog-0-b');
  assert.equal(act(s, { type: 'party', id: 'dog-0-b' }).state, s);
  assert.equal(act(s, { type: 'party', id: 'missing' }).state, s);
});

test('only the selected actor attacks and takes the counter, benches cannot join combat', () => {
  let s = battle(withParty());
  const initial = structuredClone(s);
  s = act(s, { type: 'attack' }).state;
  assert.equal(initial.battle!.enemy.hp - s.battle!.enemy.hp, 15);
  assert.ok(s.dogs[0].hp < initial.dogs[0].hp);
  assert.equal(s.dogs[1].hp, initial.dogs[1].hp);
  const turn = s.battle!.turn;
  s = act(s, { type: 'actor', id: 'dog-0' }).state;
  assert.equal(s.battle!.turn, turn);
  const after = structuredClone(s);
  s = act(s, { type: 'attack' }).state;
  assert.equal(s.dogs[0].hp, after.dogs[0].hp);
  assert.ok(s.dogs[1].hp < after.dogs[1].hp);
  assert.equal(act(s, { type: 'actor', id: 'dog-0-b' }).state, s);
  assert.equal(act(s, { type: 'party', id: 'dog-0-b' }).state, s);
});
test('fainted actors are excluded, survivors act and the whole field party gains experience', () => {
  let s = battle(withParty());
  currentDog(s).hp = 1;
  s = act(s, { type: 'attack' }).state;
  assert.equal(s.battle!.actor, 'traveler');
  assert.equal(act(s, { type: 'actor', id: 'starter' }).state, s);
  s = withParty();
  s.dogs.forEach((d) => {
    d.level = 10;
    d.xp = 0;
  });
  currentDog(s).atk = 1000;
  s = battle(s);
  s = act(s, { type: 'attack' }).state;
  assert.equal(s.battle, null);
  assert.equal(s.dogs[0].xp, 80);
  assert.equal(s.dogs[1].xp, 80);
  assert.equal(s.dogs[2].xp, 0);
  assert.deepEqual(unpackSave(packSave(s)), s);
});

test('player name and two companions persist; old saves gain safe defaults', () => {
  let s = act(withParty(), { type: 'rename', name: '  리치친구  ' }).state;
  assert.equal(s.playerName, '리치친구');
  for (const name of ['', ' '.repeat(3), 'a'.repeat(13), 'bad\nname'])
    assert.equal(act(s, { type: 'rename', name }).state, s);
  s = act(s, { type: 'switch', id: 'dog-0' }).state;
  assert.deepEqual(unpackSave(packSave(s)), s);
  const raw = JSON.parse(packSave(s));
  delete raw.state.playerName;
  delete raw.state.party;
  const restored = unpackSave(JSON.stringify(raw));
  assert.equal(restored.playerName, '여행자');
  assert.deepEqual(restored.party, ['dog-0', 'starter']);
  assert.equal(restored.coins, s.coins);
  assert.deepEqual(restored.dogs, s.dogs);
  for (const party of [
    [],
    ['starter', 'starter'],
    ['starter', 'missing'],
    ['starter', 'dog-0', 'dog-0-b'],
    ['starter'],
  ]) {
    raw.state.party = party;
    assert.throws(() => unpackSave(JSON.stringify(raw)));
  }
  delete raw.state.party;
  raw.state.playerName = 'a'.repeat(13);
  assert.throws(() => unpackSave(JSON.stringify(raw)));
});

test('enemy identities select distinct outfits consistently across encounters and saves', () => {
  const found = new Set<number>();
  for (const r of [0, 2, 3, 4, 5]) {
    const s = newGame();
    s.region = r;
    s.visited.push(r);
    for (const e of entities(s).filter((e) => e.kind === 'enemy')) {
      const look = enemyLook(e.id, r);
      found.add(look);
      assert.ok(ENEMY_LOOKS[look]);
      assert.equal(enemyLook(e.id, unpackSave(packSave(s)).region), look);
    }
  }
  assert.equal(found.size, 8);
  assert.equal(enemyLook('captain-5', 5), 7);
  assert.notEqual(enemyLook('enemy-0-0', 0), enemyLook('enemy-0-1', 0));
  assert.notEqual(enemyLook('mob-2-0', 2), enemyLook('mob-3-0', 3));
});
