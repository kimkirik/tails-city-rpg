import { routeSpawn } from './route-layouts.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newGame,
  act,
  entities,
  heroStats,
  partyDogs,
  teamCondition,
  ITEMS,
  countItem,
} from './model.ts';
test('earned supplies and equipment can clear all eight raids without excessive turn or healing loops', (t) => {
  let s = newGame();
  const results: {
    id: string;
    actions: number;
    heals: number;
    guards: number;
    teams: number;
    level: number;
    coins: number;
  }[] = [];
  function interact(id: string) {
    const e = entities(s).find((e) => e.id === id);
    if (!e) throw Error('missing ' + id);
    s.x = e.x;
    s.y = e.y;
    s = act(s, { type: 'interact', id }).state;
  }
  function fight(id: string) {
    interact(id);
    if (!s.battle) throw Error('no battle ' + id);
    if (heroStats(s).attack > s.dogs[0].atk && s.hero.hp > 0)
      s = act(s, { type: 'actor', id: 'traveler' }).state;
    let n = 0,
      heals = 0,
      guards = 0,
      teams = 0;
    while (s.battle && n++ < 50) {
      let a: Parameters<typeof act>[1];
      const b = s.battle,
        actor = b.actor,
        d = actor === 'traveler' ? s.hero : s.dogs.find((d) => d.id === actor)!,
        max = actor === 'traveler' ? heroStats(s).maxHp : d.maxHp;
      const healing = Object.entries(ITEMS)
        .filter(
          ([id, item]) =>
            countItem(s, id) &&
            item.heal &&
            (item.target === 'any' ||
              item.target === (actor === 'traveler' ? 'owner' : 'dog')),
        )
        .sort(
          ([, a], [, b]) =>
            Math.min(b.heal!, max - d.hp) - Math.min(a.heal!, max - d.hp),
        )[0];
      if (
        d.hp < Math.max(30, b.enemy.atk * 2.3) &&
        healing &&
        d.hp < max - 40
      ) {
        a = { type: 'item', id: healing[0], target: actor };
        heals++;
      } else if (b.enemy.dragon && b.turn % 3 === 0) {
        a = { type: 'guard' };
        guards++;
      } else if (!teamCondition(s) && b.enemy.hp > 70 && b.turn % 3 === 1) {
        a = { type: 'team' };
        teams++;
      } else a = { type: b.cooldown === 0 ? 'skill' : 'attack' };
      const out = act(s, a);
      if (out.state === s) throw Error(out.message);
      s = out.state;
      if (out.event === 'loss') throw Error('lost ' + id);
    }
    if (s.battle) throw Error('long battle ' + id);
    results.push({
      id,
      actions: n,
      heals,
      guards,
      teams,
      level: s.dogs[0].level,
      coins: s.coins,
    });
    for (const drop of [...s.drops])
      if (drop.region === s.region && (drop.place ?? 'field') === s.place) {
        s.x = drop.x;
        s.y = drop.y;
        s = act(s, { type: 'pickup' }).state;
      }
  }
  interact('dog-1');
  for (const region of [0, 6, 2, 3, 4, 5, 8, 10]) {
    s.region = 1;
    s.place = 'field';
    Object.assign(s, routeSpawn(1));
    if (!s.visited.includes(region)) s.visited.push(region);
    interact('armory-1');
    s.x = 1024;
    s.y = 820;
    for (const slot of ['weapon', 'clothes', 'accessory']) {
      const gear = Object.entries(ITEMS)
        .filter(
          ([id, item]) =>
            item.slot === slot &&
            item.source === 'shop' &&
            item.level <= s.hero.level &&
            item.price <= s.coins &&
            !countItem(s, id),
        )
        .sort(
          ([, a], [, b]) =>
            (b.attack ?? 0) +
            (b.hp ?? 0) +
            (b.charm ?? 0) -
            ((a.attack ?? 0) + (a.hp ?? 0) + (a.charm ?? 0)),
        )[0];
      if (gear) s = act(s, { type: 'buy', id: gear[0] }).state;
    }
    s.shopType = 'convenience';
    const bag = Object.entries(ITEMS)
      .filter(
        ([, item]) =>
          item.capacity && item.capacity > s.capacity && item.price <= s.coins,
      )
      .sort(([, a], [, b]) => a.capacity! - b.capacity!)[0];
    if (bag) s = act(s, { type: 'buy', id: bag[0] }).state;
    interact('exit-1');
    interact('rest-1');
    s.region = region;
    interact(`raid-entry-${region}`);
    for (let i = 0; i < 3; i++) fight(`cave-${region}-${i}`);
    fight(`dragon-${region}`);
    interact(`cave-exit-${region}`);
  }
  t.diagnostic(
    JSON.stringify(
      results
        .filter((r) => r.id.startsWith('dragon'))
        .map(({ id, actions, heals, level }) => ({
          id,
          actions,
          heals,
          level,
        })),
    ),
  );
  assert.equal(s.raids.length, 8);
  assert.equal(s.won, true);
  assert.equal(s.endingSeen, false);
  for (const fight of results) {
    assert.ok(
      fight.actions <= (fight.id.startsWith('dragon') ? 18 : 6),
      JSON.stringify(fight),
    );
    assert.ok(fight.heals <= 6, JSON.stringify(fight));
  }
});
