import test from 'node:test';
import assert from 'node:assert/strict';
import { KeyboardMovement } from './keyboard.ts';
import {
  defaultAppearance,
  validAppearance,
  HEADS,
  OUTFITS,
  CLOTH_COLORS,
  type Appearance,
} from './appearance.ts';
import {
  newGame,
  act,
  packSave,
  unpackSave,
  entities,
  combatHits,
  WEAPONS,
} from './model.ts';
import { makeBattleClip, visibleBattleHp } from './battle-motion.ts';

function encounter() {
  const s = newGame(),
    enemy = entities(s).find((e) => e.id === 'captain-0')!;
  s.x = enemy.x;
  s.y = enemy.y;
  return act(s, { type: 'interact', id: enemy.id }).state;
}

void test('arrow keys hold and release movement, normalize diagonals and cancel opposite directions', () => {
  const keys = new KeyboardMovement();
  assert.equal(keys.down('b'), false);
  assert.deepEqual(keys.vector(), { x: 0, y: 0 });
  keys.down('ArrowRight');
  keys.down('ArrowRight');
  assert.deepEqual(keys.vector(), { x: 1, y: 0 });
  keys.down('ArrowUp');
  assert.equal(Math.hypot(keys.vector().x, keys.vector().y), 1);
  assert.ok(keys.vector().y < 0);
  keys.up('ArrowRight');
  assert.deepEqual(keys.vector(), { x: 0, y: -1 });
  keys.down('ArrowDown');
  assert.deepEqual(keys.vector(), { x: 0, y: 0 });
  keys.up('ArrowUp');
  assert.deepEqual(keys.vector(), { x: 0, y: 1 });
  keys.up('ArrowDown');
  assert.deepEqual(keys.vector(), { x: 0, y: 0 });
});

void test('typing, paused game, loss of focus and touch takeover clear held movement', () => {
  const keys = new KeyboardMovement();
  keys.down('ArrowLeft');
  assert.equal(keys.down('ArrowDown', true), false);
  assert.deepEqual(keys.vector(), { x: 0, y: 0 });
  for (let event = 0; event < 4; event++) {
    keys.down('ArrowRight');
    keys.clear();
    assert.deepEqual(keys.vector(), { x: 0, y: 0 });
  }
  assert.equal(keys.down('ArrowUp'), true);
  assert.deepEqual(keys.vector(), { x: 0, y: -1 });
});

void test('all 60 appearance combinations save and restore without changing progression', () => {
  const initial = newGame();
  initial.coins = 812;
  initial.steps = 245;
  initial.seconds = 125;
  for (let head = 0; head < HEADS.length; head++)
    for (let outfit = 0; outfit < OUTFITS.length; outfit++)
      for (let color = 0; color < CLOTH_COLORS.length; color++) {
        const appearance = { head, outfit, color },
          named = act(initial, { type: 'rename', name: '리치의 친구' }).state,
          s = act(named, { type: 'dress', appearance }).state;
        assert.deepEqual(s.appearance, appearance);
        assert.deepEqual(unpackSave(packSave(s)), s);
        const { appearance: _a, playerName: _n, ...progress } = s,
          { appearance: _b, playerName: _m, ...before } = initial;
        assert.deepEqual(progress, before);
      }
  assert.deepEqual(initial.appearance, defaultAppearance());
});

void test('legacy saves receive appearance defaults and invalid outfits never enter game state', () => {
  const initial = newGame(),
    raw = JSON.parse(packSave(initial));
  delete raw.state.appearance;
  const restored = unpackSave(JSON.stringify(raw));
  assert.deepEqual(restored, initial);
  for (const appearance of [
    { head: 4, outfit: 0, color: 0 },
    { head: 0, outfit: -1, color: 0 },
    { head: 0, outfit: 3, color: 0 },
    { head: 0, outfit: 0, color: 5 },
    { head: 0, outfit: 1.5, color: 0 },
    { head: '1', outfit: 0, color: 0 },
    [],
    {},
  ]) {
    assert.equal(validAppearance(appearance), false);
    assert.equal(
      act(initial, { type: 'dress', appearance: appearance as Appearance })
        .state,
      initial,
    );
    raw.state.appearance = appearance;
    assert.throws(() => unpackSave(JSON.stringify(raw)));
  }
  const battle = encounter();
  assert.equal(
    act(battle, { type: 'dress', appearance: { head: 1, outfit: 2, color: 3 } })
      .state,
    battle,
  );
});

void test('owner uses equipped weapons only during their own single action', () => {
  const plain = encounter();
  plain.battle!.actor = 'traveler';
  for (const kind of ['attack', 'skill'] as const) {
    const armed = structuredClone(plain),
      weapon = Object.keys(WEAPONS)[0];
    armed.weapon = weapon;
    const plainHits = combatHits(plain, kind),
      hits = combatHits(armed, kind);
    assert.equal(hits[0].actorId, 'traveler');
    assert.equal(hits[0].damage - plainHits[0].damage, WEAPONS[weapon].attack);
    assert.equal(hits.length, 1);
    const result = act(armed, { type: kind }),
      clip = makeBattleClip(armed, kind, result);
    assert.equal(
      plain.battle!.enemy.hp - result.state.battle!.enemy.hp,
      hits.reduce((n, h) => n + h.damage, 0),
    );
    assert.equal(
      visibleBattleHp(armed, clip, clip.duration).enemy,
      result.state.battle!.enemy.hp,
    );
  }
});

void test('an owner finishing blow stops further strikes and awards exactly one victory', () => {
  const s = encounter();
  s.battle!.actor = 'traveler';
  s.battle!.enemy.hp = 3;
  const result = act(s, { type: 'attack' }),
    clip = makeBattleClip(s, 'attack', result);
  assert.equal(clip.strikes.length, 1);
  assert.equal(clip.strikes[0].actorId, 'traveler');
  assert.equal(clip.strikes[0].damage, 3);
  assert.equal(clip.counter, null);
  assert.equal(result.state.kills, 1);
  assert.equal(result.event, 'win');
  assert.equal(visibleBattleHp(s, clip, clip.duration).enemy, 0);
});
