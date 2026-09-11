'use client';
import { useEffect, useState } from 'react';
import {
  Swords,
  PawPrint,
  Backpack,
  Flag,
  RotateCw,
  UsersRound,
  Shield,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  partyDogs,
  actorName,
  heroStats,
  teamCondition,
  enemyIntent,
  BREEDS,
  type GameState,
  type Action,
} from '@/lib/game/model';
import { visibleBattleHp, type PlayingClip } from '@/lib/game/battle-motion';
import BattleStage from './battle-stage';
export default function BattleView({
  state,
  clip,
  onAction,
  onBag,
}: {
  state: GameState;
  clip: PlayingClip | null;
  onAction: (a: Action) => unknown;
  onBag: () => void;
}) {
  const [clock, setClock] = useState({ id: 0, elapsed: 0 });
  const elapsed = clock.id === clip?.id ? clock.elapsed : 0;
  useEffect(() => {
    if (!clip) return;
    let frame = 0,
      last = 0;
    const tick = (time: number) => {
      if (time - last > 32) {
        setClock({ id: clip.id, elapsed: Math.max(0, time - clip.startedAt) });
        last = time;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [clip]);
  const b = state.battle;
  if (!b) return null;
  const party = partyDogs(state),
    busy = !!clip,
    hp = visibleBattleHp(
      state,
      clip,
      clip ? Math.min(elapsed, clip.duration) : 0,
    ),
    owner = b.actor === 'traveler',
    dog = party.find((d) => d.id === b.actor),
    condition = teamCondition(state);
  const actors = [
    {
      id: 'traveler',
      name: state.playerName,
      hp: hp.hero,
      maxHp: heroStats(state).maxHp,
      poison: state.hero.poison,
    },
    ...party.map((d) => ({ ...d, hp: hp.dogs[d.id] })),
  ];
  const counter = clip?.counters.find(
    (c) => elapsed >= c.start && elapsed < c.end,
  );
  return (
    <div
      className={`battle-screen touch-battle action-battle solo-rules ${busy ? 'is-acting' : ''} ${b.enemy.dragon ? 'dragon-battle' : ''}`}
    >
      <div className="combat-enemy-stat">
        <div>
          <strong>
            {b.enemy.dragon ? '🐉 ' : ''}
            {b.enemy.name}
          </strong>
          <small>TURN {b.turn}</small>
          <button
            className="battle-flee"
            disabled={busy}
            onClick={() => onAction({ type: 'flee' })}
          >
            <Flag size={14} />
            후퇴
          </button>
        </div>
        <Progress value={(hp.enemy / b.enemy.maxHp) * 100} />
        <span>
          {hp.enemy} / {b.enemy.maxHp} HP
        </span>
        <p
          className={
            b.enemy.dragon && b.turn % 3 === 0
              ? 'enemy-intent danger'
              : 'enemy-intent'
          }
        >
          {enemyIntent(state)}
          {b.enemy.dragon && b.turn % 3 !== 0
            ? ` · 강한 공격까지 ${3 - (b.turn % 3)}턴`
            : ''}
        </p>
      </div>
      <div
        className={`combat-scene action-scene ${state.place === 'cave' ? 'cave-battle' : ''}`}
      >
        <BattleStage state={state} clip={clip} />
        <div
          className="move-title"
          key={clip?.id ?? b.actor}
          aria-live="polite"
        >
          {clip
            ? counter
              ? `${counter.breath ? '강력한 숨결' : '반격'}${clip.counters.length > 1 ? ` ${clip.counters.indexOf(counter) + 1}/2` : ''}`
              : clip.title
            : `${actorName(state, b.actor)} 혼자 행동`}
          <small>
            {clip?.kind === 'team'
              ? '전투당 1회 · 2턴 소모'
              : busy
                ? '동작이 끝나면 다음 행동을 선택하세요'
                : '아래에서 행동할 한 명을 선택하세요'}
          </small>
        </div>
      </div>
      <div className="combat-party-stats actor-selector">
        {actors.map((a) => (
          <button
            key={a.id}
            disabled={busy || a.hp <= 0}
            className={b.actor === a.id ? 'chosen-actor' : ''}
            onClick={() => onAction({ type: 'actor', id: a.id })}
            aria-pressed={b.actor === a.id}
            aria-label={`${a.name} 선택 · 혼자 행동`}
          >
            <div>
              <strong>{a.name}</strong>
              <small>
                {a.poison ? '중독' : b.actor === a.id ? '행동 선택' : '대기'}
              </small>
            </div>
            <Progress value={(a.hp / a.maxHp) * 100} />
            <span>
              {a.hp} / {a.maxHp}
            </span>
          </button>
        ))}
      </div>
      <div className="combat-actions action-buttons" aria-busy={busy}>
        <button disabled={busy} onClick={() => onAction({ type: 'attack' })}>
          <Swords />
          <span>단독 공격</span>
          <small>{actorName(state, b.actor)} · 1턴</small>
        </button>
        <button
          disabled={busy || owner}
          onClick={() => onAction({ type: 'tail' })}
        >
          <RotateCw />
          <span>꼬리치기</span>
          <small>피해↓ 반격 25% 감소</small>
        </button>
        <button
          className="skill-button"
          disabled={busy || b.cooldown > 0}
          onClick={() => onAction({ type: 'skill' })}
        >
          <PawPrint />
          <span>{owner ? '집중 베기' : BREEDS[dog!.breed].skill}</span>
          <small>
            {b.cooldown ? `${b.cooldown}턴 뒤` : '강한 단독 기술 · 1턴'}
          </small>
        </button>
        <button
          className="team-button"
          disabled={busy || !!condition}
          onClick={() => onAction({ type: 'team' })}
        >
          <UsersRound />
          <span>별빛 협공</span>
          <small>{condition || '전원 공격 · 2턴'}</small>
        </button>
        <button disabled={busy} onClick={() => onAction({ type: 'guard' })}>
          <Shield />
          <span>방어</span>
          <small>반격 70% 감소 · 1턴</small>
        </button>
        <button disabled={busy} onClick={onBag}>
          <Backpack />
          <span>아이템</span>
          <small>회복 · 해독 · 1턴</small>
        </button>
      </div>
    </div>
  );
}
