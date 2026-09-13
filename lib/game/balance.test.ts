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
test('earned supplies and equipment can clear all six raids without excessive turn or healing loops', (t) => {
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
      if (
        d.hp < Math.max(30, b.enemy.atk * 2.3) &&
        countItem(s, 'potion') &&
        d.hp < max - 40
      ) {
        a = { type: 'item', id: 'potion', target: actor };
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
  interact('dog-0');
  for (let region = 0; region < 6; region++) {
    s.region = region;
    s.place = 'field';
    s.x = 1024;
    s.y = 1190;
    if (!s.visited.includes(region)) s.visited.push(region);
    interact(`armory-${region}`);
    s.x = 1024;
    s.y = 820;
    for (const id of [
      'bat',
      'hoodie',
      'sword',
      'ranger',
      'stun',
      'starlight',
      'lunar',
      'dragoncoat',
      'dragonblade',
    ])
      if (s.coins >= ITEMS[id].price && !countItem(s, id))
        s = act(s, { type: 'buy', id }).state;
    interact(`exit-${region}`);
    interact(`rest-${region}`);
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
  assert.equal(s.raids.length, 6);
  for (const fight of results) {
    assert.ok(
      fight.actions <= (fight.id.startsWith('dragon') ? 18 : 6),
      JSON.stringify(fight),
    );
    assert.ok(fight.heals <= 6, JSON.stringify(fight));
  }
});
