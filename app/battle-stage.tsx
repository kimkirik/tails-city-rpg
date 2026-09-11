'use client';
import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  partyDogs,
  BREEDS,
  ITEMS,
  RAIDS,
  actorName,
  type GameState,
} from '@/lib/game/model';
import { DOG_WALK_SHEETS } from '@/lib/game/dog-art';
import { drawTraveler } from '@/lib/game/traveler-art';
import { enemyLook } from '@/lib/game/enemies';
import { sprite, animatedSprite, atlasSprite } from '@/lib/game/render';
import {
  clamp,
  stagePositions,
  dogStagePose,
  travelerStagePose,
  type PlayingClip,
} from '@/lib/game/battle-motion';

export default function BattleStage({
  state,
  clip,
}: {
  state: GameState;
  clip: PlayingClip | null;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    live = useRef({ state, clip });
  useLayoutEffect(() => {
    live.current = { state, clip };
  }, [state, clip]);
  useEffect(() => {
    const el = canvas.current!,
      ctx = el.getContext('2d')!;
    const load = (src: string) => {
      const img = new Image();
      img.src = src;
      return img;
    };
    const dogs = DOG_WALK_SHEETS.map(load),
      enemies = load('/art/enemies.png'),
      fallback = load('/art/sprites.png'),
      poodle = load('/art/richi-poodle.png'),
      player = load('/art/player-walk.png'),
      dragons = load('/art/raids/dragons.png'),
      creatures = load('/art/raids/creatures-npcs.png');
    let width = 1,
      height = 1,
      frame = 0;
    const resize = () => {
      const box = el.getBoundingClientRect(),
        dpr = Math.min(devicePixelRatio || 1, 3);
      width = box.width;
      height = box.height;
      el.width = width * dpr;
      el.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    function draw(time: number) {
      const { state: s, clip: action } = live.current,
        battle = s.battle;
      const participants = action?.participants ?? [battle?.actor ?? s.active],
        party = partyDogs(s).filter((d) => participants.includes(d.id)),
        showOwner = participants.includes('traveler');
      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = false;
      if (!battle) {
        frame = requestAnimationFrame(draw);
        return;
      }
      const elapsed = action ? Math.max(0, time - action.startedAt) : 0,
        layout = stagePositions(
          width,
          height,
          party.length,
          !!battle.enemy.dragon,
        ),
        enemy = layout.enemy;
      if (participants.length === 1) {
        layout.traveler = { x: width * 0.29, y: height * 0.78 };
        if (layout.dogs.length)
          layout.dogs[0] = { x: width * 0.31, y: height * 0.8 };
      }
      const scale = layout.dogSize / 125,
        hitTimes = action?.strikes.map((h) => h.impact) ?? [];
      const impactAge =
        elapsed - Math.max(-10000, ...hitTimes.filter((t) => t <= elapsed));
      const counter =
          action?.counters.filter((c) => elapsed >= c.start).at(-1) ??
          action?.counters[0],
        counterAge = counter ? elapsed - counter.impact : -10000;
      const counterHome =
        counter?.dogId === 'traveler'
          ? layout.traveler
          : layout.dogs[party.findIndex((d) => d.id === counter?.dogId)];
      const shake =
        impactAge >= 0 && impactAge < 150
          ? Math.sin(impactAge * 0.2) * (1 - impactAge / 150) * 4
          : 0;
      ctx.save();
      ctx.translate(
        shake,
        counterAge >= 0 && counterAge < 120
          ? Math.cos(counterAge * 0.17) * 2
          : 0,
      );
      ctx.fillStyle = '#224e3625';
      ctx.beginPath();
      ctx.ellipse(
        enemy.x,
        enemy.y + 5,
        layout.enemySize * 0.45,
        layout.enemySize * 0.1,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      for (const home of [
        ...(showOwner ? [layout.traveler] : []),
        ...layout.dogs,
      ]) {
        ctx.beginPath();
        ctx.ellipse(
          home.x,
          home.y + 3,
          layout.dogSize * 0.35,
          layout.dogSize * 0.1,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      let enemyX = enemy.x,
        enemyY = enemy.y;
      if (counter && !counter.breath) {
        const home = counterHome;
        if (home) {
          const t = elapsed - counter.start,
            progress = t < 340 ? clamp(t / 280) : 1 - clamp((t - 410) / 270);
          enemyX += (home.x + layout.dogSize * 0.25 - enemy.x) * progress;
          enemyY += (home.y - enemy.y) * progress;
        }
      }
      ctx.save();
      if (action?.victory) {
        const vanish = clamp(
          (elapsed - (action.strikes.at(-1)?.impact ?? 0) - 260) / 450,
        );
        ctx.globalAlpha = 1 - vanish;
        enemyY += vanish * 20;
      }
      if (impactAge >= 0 && impactAge < 130) {
        ctx.filter = 'brightness(2)';
        enemyX += Math.sin(impactAge * 0.15) * 6;
      }
      if (battle.enemy.dragon)
        atlasSprite(
          ctx,
          dragons,
          battle.enemy.region,
          3,
          2,
          enemyX,
          enemyY + Math.sin(time * 0.003) * 4,
          layout.enemySize,
        );
      else if (battle.enemy.creature !== undefined)
        atlasSprite(
          ctx,
          creatures,
          battle.enemy.creature,
          4,
          3,
          enemyX,
          enemyY + Math.sin(time * 0.003) * 3,
          layout.enemySize,
        );
      else
        sprite(
          ctx,
          enemies,
          enemyLook(battle.enemy.id, battle.enemy.region),
          enemyX,
          enemyY + Math.sin(time * 0.003) * 2,
          layout.enemySize,
        );
      ctx.restore();
      if (counter?.breath && counterHome) {
        const phase = elapsed - counter.start;
        if (phase >= 0 && phase < 650) {
          ctx.save();
          ctx.globalAlpha = Math.sin(clamp(phase / 650) * Math.PI) * 0.85;
          const color = RAIDS[s.region].color,
            gradient = ctx.createLinearGradient(
              enemy.x,
              enemy.y,
              counterHome.x,
              counterHome.y,
            );
          gradient.addColorStop(0, '#fff5db');
          gradient.addColorStop(0.4, color);
          gradient.addColorStop(1, color + '22');
          ctx.strokeStyle = gradient;
          ctx.lineWidth = (22 + Math.sin(phase * 0.07) * 5) * scale;
          ctx.shadowColor = color;
          ctx.shadowBlur = 25;
          ctx.beginPath();
          ctx.moveTo(
            enemy.x - layout.enemySize * 0.25,
            enemy.y - layout.enemySize * 0.3,
          );
          ctx.lineTo(counterHome.x, counterHome.y - layout.dogSize * 0.35);
          ctx.stroke();
          for (let n = 0; n < 12; n++) {
            const q = (phase * 0.002 + n / 12) % 1;
            ctx.fillStyle = n % 2 ? color : '#fff4cc';
            ctx.fillRect(
              enemy.x +
                (counterHome.x - enemy.x) * q +
                Math.sin(n + phase * 0.015) * 15,
              enemy.y + (counterHome.y - enemy.y) * q - layout.dogSize * 0.35,
              6 * scale,
              6 * scale,
            );
          }
          ctx.restore();
        }
      }
      if (action?.kind === 'guard') {
        const home = showOwner ? layout.traveler : layout.dogs[0];
        if (home) {
          ctx.save();
          ctx.strokeStyle = '#a5eeff';
          ctx.shadowColor = '#83dbff';
          ctx.shadowBlur = 18;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.ellipse(
            home.x,
            home.y - layout.dogSize * 0.35,
            layout.dogSize * 0.5,
            layout.dogSize * 0.62,
            0,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
          ctx.restore();
        }
      }
      if (showOwner) {
        const ownerStrike = action?.strikes.find(
            (hit) => hit.actorId === 'traveler',
          ),
          owner = travelerStagePose(layout, ownerStrike, elapsed),
          ownerMotion = {
            facing: (owner.pose?.active ? owner.pose.facing : 2) as
              | 0
              | 1
              | 2
              | 3,
            moving: owner.pose?.active ?? false,
            distance: (owner.pose?.frame ?? 0) * 24,
          };
        if (owner.pose?.active && owner.pose.move > 0.05) {
          ctx.save();
          ctx.strokeStyle = '#ffe7a8';
          ctx.globalAlpha = 0.6;
          ctx.lineWidth = 2;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(
              owner.x - layout.travelerSize * 0.25,
              owner.y - layout.travelerSize * (0.25 + i * 0.1),
            );
            ctx.lineTo(
              owner.x - layout.travelerSize * 0.55,
              owner.y - layout.travelerSize * (0.25 + i * 0.1),
            );
            ctx.stroke();
          }
          ctx.restore();
        }
        if (
          !drawTraveler(
            ctx,
            s.appearance,
            owner.x,
            owner.y,
            layout.travelerSize,
            ownerMotion,
          )
        )
          animatedSprite(
            ctx,
            player,
            owner.x,
            owner.y,
            layout.travelerSize,
            ownerMotion,
          );
        const swing = ownerStrike ? elapsed - ownerStrike.impact : -10000;
        if (s.weapon) {
          ctx.save();
          ctx.translate(
            owner.x + layout.travelerSize * 0.15,
            owner.y - layout.travelerSize * 0.4,
          );
          ctx.rotate(
            swing >= -120 && swing < 220
              ? -1 + clamp((swing + 120) / 340) * 2.2
              : -0.5,
          );
          ctx.font = `${layout.travelerSize * 0.22}px Arial`;
          ctx.textAlign = 'center';
          ctx.fillText(ITEMS[s.weapon].icon, 0, 0);
          ctx.restore();
        }
        if (swing >= -70 && swing < 240) {
          ctx.save();
          ctx.translate(
            owner.x + layout.travelerSize * 0.23,
            owner.y - layout.travelerSize * 0.43,
          );
          ctx.scale(1, 0.65);
          ctx.strokeStyle = '#fff4bf';
          ctx.shadowColor = '#ffd274';
          ctx.shadowBlur = 12;
          ctx.lineWidth = 5 * scale;
          ctx.beginPath();
          ctx.arc(
            0,
            0,
            layout.travelerSize * 0.39,
            -1.8 + clamp((swing + 70) / 310),
            1.3 + clamp((swing + 70) / 310),
          );
          ctx.stroke();
          ctx.restore();
        }
        if (!owner.pose?.active) {
          ctx.save();
          ctx.font = `600 ${Math.max(10, 12 * scale)}px Arial`;
          ctx.textAlign = 'center';
          ctx.strokeStyle = '#f7ffe9';
          ctx.lineWidth = 3;
          ctx.fillStyle = '#345341';
          ctx.strokeText(s.playerName, owner.x, owner.y + 14 * scale);
          ctx.fillText(s.playerName, owner.x, owner.y + 14 * scale);
          ctx.restore();
        }
      }
      for (const [slot, dog] of party.entries()) {
        const strike = action?.strikes.find((h) => h.actorId === dog.id),
          position = dogStagePose(layout, slot, strike, elapsed),
          pose = position.pose;
        let x = position.x;
        const y = position.y;
        const isHit = counter?.dogId === dog.id && counterAge >= 0;
        if (isHit && counterAge < 220)
          x -= Math.sin(clamp(counterAge / 220) * Math.PI) * 14 * scale;
        if (pose?.active && pose.move > 0.05) {
          ctx.save();
          ctx.strokeStyle = strike!.color;
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = 2 * scale;
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(
              x - 35 * scale - i * 9 * scale,
              y - 20 * scale + i * 8 * scale,
            );
            ctx.lineTo(
              x - 70 * scale - i * 10 * scale,
              y - 20 * scale + i * 8 * scale,
            );
            ctx.stroke();
          }
          ctx.restore();
        }
        ctx.save();
        if (
          dog.hp <= 0 ||
          (isHit &&
            counter!.damage + counter!.poisonDamage >= dog.hp &&
            counterAge > 160)
        )
          ctx.globalAlpha = 0.4;
        if (isHit && counterAge < 120) ctx.filter = 'brightness(1.8)';
        const moving = pose?.active ?? false,
          facing = pose?.active ? pose.facing : 2;
        const motion = {
          facing: facing as 0 | 1 | 2 | 3,
          distance: (moving ? pose!.frame : Math.floor(time / 340) % 4) * 19,
          moving: true,
        };
        if (
          !animatedSprite(
            ctx,
            dogs[dog.breed],
            x,
            y + (!moving ? Math.sin(time * 0.003 + slot) * 2 : 0),
            layout.dogSize,
            motion,
            19,
          )
        )
          sprite(
            ctx,
            fallback,
            BREEDS[dog.breed].sprite,
            x,
            y,
            layout.dogSize,
            false,
            poodle,
          );
        ctx.restore();
        if (pose?.spinning) {
          const phase = (elapsed - strike!.start) * 0.025;
          ctx.save();
          ctx.translate(x, y - layout.dogSize * 0.3);
          ctx.scale(1, 0.5);
          ctx.strokeStyle = strike!.color;
          ctx.lineWidth = 6 * scale;
          ctx.shadowBlur = 12;
          ctx.shadowColor = strike!.color;
          ctx.beginPath();
          ctx.arc(0, 0, layout.dogSize * 0.55, phase, phase + Math.PI * 1.55);
          ctx.stroke();
          ctx.restore();
        }
      }
      if (action) {
        for (const [i, hit] of action.strikes.entries()) {
          const age = elapsed - hit.impact;
          if (age < 0 || age > 700) continue;
          const fade = 1 - clamp(age / 700);
          ctx.save();
          ctx.globalAlpha = fade;
          ctx.translate(enemy.x, enemy.y - layout.enemySize * 0.35);
          if (age < 250) {
            ctx.strokeStyle = hit.color;
            ctx.lineWidth = 3 * scale;
            const radius = (10 + age * 0.18) * scale;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();
            for (let n = 0; n < 9; n++) {
              const angle = (n * Math.PI * 2) / 9 + i;
              ctx.fillStyle = n % 2 ? hit.color : '#fff8d4';
              ctx.fillRect(
                Math.cos(angle) * radius * 1.2,
                Math.sin(angle) * radius * 0.8,
                5 * scale,
                5 * scale,
              );
            }
          }
          ctx.font = `900 ${Math.max(19, 27 * scale)}px Arial`;
          ctx.textAlign = 'center';
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#24432e';
          ctx.fillStyle = hit.slot < 0 ? '#fff1ad' : '#e0ffc0';
          const y = -30 - age * 0.055;
          ctx.strokeText(`−${hit.damage}`, (i - 1) * 27, y);
          ctx.fillText(`−${hit.damage}`, (i - 1) * 27, y);
          ctx.restore();
        }
        if (counter && counterAge >= 0 && counterAge < 650) {
          const home = counterHome;
          if (home) {
            ctx.save();
            ctx.globalAlpha = 1 - counterAge / 650;
            ctx.font = `900 ${Math.max(18, 24 * scale)}px Arial`;
            ctx.textAlign = 'center';
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#3a312d';
            ctx.fillStyle = '#ffc7b6';
            ctx.strokeText(
              `−${counter.damage}${counter.poisonDamage ? ' ☠' : ''}`,
              home.x,
              home.y - layout.dogSize * 0.6 - counterAge * 0.055,
            );
            ctx.fillText(
              `−${counter.damage}${counter.poisonDamage ? ' ☠' : ''}`,
              home.x,
              home.y - layout.dogSize * 0.6 - counterAge * 0.055,
            );
            ctx.restore();
          }
        }
      }
      ctx.restore();
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);
  return (
    <canvas
      className="battle-stage"
      ref={canvas}
      data-combat-mode={clip?.kind === 'team' ? 'team' : 'solo'}
      data-participants={(
        clip?.participants ?? [state.battle?.actor ?? state.active]
      ).join(',')}
      aria-label={
        clip?.kind === 'team'
          ? '여행자와 동료들이 함께 공격하는 협공 장면'
          : `${actorName(state, state.battle?.actor ?? state.active)} 혼자 싸우는 전투 장면`
      }
    />
  );
}
