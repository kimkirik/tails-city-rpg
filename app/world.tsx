'use client';
import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import {
  SIZE,
  REGIONS,
  isTown,
  gatePoints,
  gateAt,
  walkable,
  entities,
  bagRoom,
  type GameState,
  type Action,
} from '@/lib/game/model';
import { mapAsset } from '@/lib/game/maps';
import { SHOP_BOUNDS } from '@/lib/game/shop-layout';
import { nearestRoutePoint } from '@/lib/game/route-layouts';
import { findPath } from '@/lib/game/navigation';
import { KeyboardMovement } from '@/lib/game/keyboard';
import { DOG_WALK_SHEETS } from '@/lib/game/dog-art';
import { advanceMotion, idleMotion } from '@/lib/game/motion';
import { render, type View } from '@/lib/game/render';
export type NavigationRequest = {
  region: number;
  place: GameState['place'];
  id?: string;
  edge?: number;
};
export default function World({
  game,
  navigation,
  paused,
  onAction,
  onTick,
  zoom,
  running,
}: {
  game: RefObject<GameState>;
  navigation: RefObject<NavigationRequest | null>;
  paused: RefObject<boolean>;
  onAction: (a: Action) => void;
  onTick: () => void;
  zoom: number;
  running: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const zoomRef = useRef(zoom);
  const runningRef = useRef(running);
  useLayoutEffect(() => {
    zoomRef.current = zoom;
    runningRef.current = running;
  }, [zoom, running]);
  useEffect(() => {
    const el = canvas.current!;
    const c = el.getContext('2d')!;
    const maps = REGIONS.map((region) => {
        const image = new Image();
        image.src = mapAsset(region.id);
        return image;
      }),
      sprites = new Image(),
      poodle = new Image(),
      interior = new Image(),
      entrance = new Image(),
      playerWalk = new Image(),
      enemies = new Image(),
      cave = new Image(),
      dragons = new Image(),
      creatures = new Image();
    cave.src = '/art/raids/cave-map.png';
    dragons.src = '/art/raids/dragons.png';
    creatures.src = '/art/raids/creatures-npcs.png';
    const dogWalk = DOG_WALK_SHEETS.map((src) => {
      const image = new Image();
      image.src = src;
      return image;
    });
    enemies.src = '/art/enemies.png';
    playerWalk.src = '/art/player-walk.png';
    interior.src = '/art/shop-interior.png';
    entrance.src = '/art/shop-entrance.png';
    sprites.src = '/art/sprites.png';
    poodle.src = '/art/richi-poodle.png';
    let w = 900,
      h = 600,
      frame = 0,
      last = 0,
      lastUI = 0,
      lastSecond = 0,
      lastPlace = game.current.region + ':' + game.current.place,
      lastParty = game.current.party.join(','),
      steps = 0,
      lastPickup = 0;
    let path: { x: number; y: number }[] = [];
    let interactId: string | null = null;
    const keyboard = new KeyboardMovement();
    const v: View = {
      width: w,
      height: h,
      zoom: zoomRef.current,
      cx: game.current.x,
      cy: game.current.y,
      petX: game.current.x - 52,
      petY: game.current.y + 44,
      target: null,
      walking: false,
      playerMotion: idleMotion(),
      petMotion: idleMotion(),
      secondPetX: game.current.x - 75,
      secondPetY: game.current.y + 100,
      secondMotion: idleMotion(),
      dropSeen: new Map(),
    };
    const resize = () => {
      const r = el.getBoundingClientRect();
      w = r.width;
      h = r.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      el.width = w * dpr;
      el.height = h * dpr;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      v.width = w;
      v.height = h;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    function blur() {
      keyboard.clear();
      path = [];
      v.target = null;
      interactId = null;
    }
    const editing = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      !!target.closest(
        'input,textarea,select,[contenteditable=true],[data-game-input],[role=tab]',
      );
    function keydown(e: KeyboardEvent) {
      if (
        keyboard.down(
          e.key,
          paused.current ||
            !!game.current.battle ||
            editing(e.target) ||
            e.ctrlKey ||
            e.metaKey ||
            e.altKey,
        )
      ) {
        e.preventDefault();
        path = [];
        v.target = null;
        interactId = null;
      }
    }
    const keyup = (e: KeyboardEvent) => keyboard.up(e.key);
    const focus = (e: FocusEvent) => {
      if (editing(e.target)) keyboard.clear();
    };
    const visibility = () => {
      if (document.hidden) blur();
    };
    function click(e: PointerEvent) {
      if (paused.current || game.current.battle) return;
      keyboard.clear();
      e.preventDefault();
      el.focus();
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - w / 2) / v.zoom + v.cx,
        y = (e.clientY - rect.top - h / 2) / v.zoom + v.cy;
      const ent = entities(game.current).find(
        (a) => Math.hypot(a.x - x, a.y - 20 - y) < 70,
      );
      if (
        ent &&
        Math.hypot(game.current.x - ent.x, game.current.y - ent.y) < 105
      ) {
        onAction({ type: 'interact', id: ent.id });
        return;
      }
      interactId = ent?.id || null;
      const goal = ent ? { x: ent.x, y: ent.y + 38 } : { x, y };
      path = findPath(game.current, goal);
      v.target = path.length ? path[path.length - 1] : null;
    }
    window.addEventListener('blur', blur);
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
    document.addEventListener('focusin', focus);
    document.addEventListener('visibilitychange', visibility);
    el.addEventListener('pointerdown', click);
    function tick(time: number) {
      const dt = Math.min((time - last) / 1000 || 0, 0.04);
      last = time;
      const s = game.current;
      v.zoom =
        s.place === 'shop' ? Math.min(zoomRef.current, 0.5) : zoomRef.current;
      if (
        lastPlace !== s.region + ':' + s.place ||
        Math.hypot(s.x - v.cx, s.y - v.cy) > 1100
      ) {
        lastPlace = s.region + ':' + s.place;
        v.cx = s.x;
        v.cy = s.y;
        v.petX = s.x - 40;
        v.petY = s.y + 50;
        v.playerMotion = idleMotion();
        v.petMotion = idleMotion();
        v.secondPetX = s.x - 70;
        v.secondPetY = s.y + 100;
        v.secondMotion = idleMotion();
        path = [];
        v.target = null;
      }
      if (lastParty !== s.party.join(',')) {
        lastParty = s.party.join(',');
        v.petX = s.x - 40;
        v.petY = s.y + 50;
        v.secondPetX = s.x - 70;
        v.secondPetY = s.y + 100;
        v.petMotion = idleMotion();
        v.secondMotion = idleMotion();
      }
      if (!paused.current && !s.battle) {
        const request = navigation.current;
        if (request) {
          navigation.current = null;
          if (request.region === s.region && request.place === s.place) {
            const ent = request.id
              ? entities(s).find((e) => e.id === request.id)
              : null;
            const gate =
              request.edge !== undefined &&
              s.place === 'field' &&
              REGIONS[s.region].neighbors[request.edge] >= 0
                ? gatePoints(s.region)[request.edge]
                : null;
            const goal = ent ? { x: ent.x, y: ent.y + 38 } : gate;
            keyboard.clear();
            path = goal ? findPath(s, goal) : [];
            interactId = ent?.id ?? null;
            v.target = path.at(-1) ?? null;
          }
        }
        const input = keyboard.vector();
        let dx = input.x,
          dy = input.y,
          remaining = Infinity;
        if (!dx && !dy && path.length) {
          const p = path[0];
          const distance = Math.hypot(p.x - s.x, p.y - s.y);
          remaining = distance;
          if (distance < 7) {
            path.shift();
            if (!path.length) {
              v.target = null;
              if (interactId) {
                onAction({ type: 'interact', id: interactId });
                interactId = null;
              }
            }
          } else {
            dx = (p.x - s.x) / distance;
            dy = (p.y - s.y) / distance;
          }
        }
        const len = Math.hypot(dx, dy),
          speed = runningRef.current ? 365 : 235,
          oldX = s.x,
          oldY = s.y;
        if (len) {
          const step = Math.min(speed * dt, remaining);
          dx = (dx / len) * step;
          dy = (dy / len) * step;
          if (walkable(s.x + dx, s.y, s.region, s.place)) s.x += dx;
          if (walkable(s.x, s.y + dy, s.region, s.place)) s.y += dy;
        }
        const traveled = Math.hypot(s.x - oldX, s.y - oldY);
        v.playerMotion = advanceMotion(v.playerMotion, s.x - oldX, s.y - oldY);
        v.walking = v.playerMotion.moving;
        steps += traveled;
        if (steps > 36) {
          s.steps += Math.floor(steps / 36);
          steps %= 36;
        }
        const oldPetX = v.petX,
          oldPetY = v.petY,
          pd = Math.hypot(s.x - v.petX, s.y - v.petY);
        if (pd > 59) {
          const follow = Math.min(1, dt * 8);
          v.petX += (s.x - v.petX) * (1 - 53 / pd) * follow;
          v.petY += (s.y - v.petY) * (1 - 53 / pd) * follow;
        }
        if (s.place === 'field' && !walkable(v.petX, v.petY, s.region)) {
          const p = nearestRoutePoint(v.petX, v.petY, s.region);
          v.petX = p.x;
          v.petY = p.y;
        }
        v.petMotion = advanceMotion(
          v.petMotion,
          v.petX - oldPetX,
          v.petY - oldPetY,
        );
        const secondX = v.secondPetX,
          secondY = v.secondPetY,
          sd = Math.hypot(v.petX - secondX, v.petY - secondY);
        if (s.party.length > 1 && sd > 62) {
          const follow = Math.min(1, dt * 8);
          v.secondPetX += (v.petX - secondX) * (1 - 56 / sd) * follow;
          v.secondPetY += (v.petY - secondY) * (1 - 56 / sd) * follow;
        }
        if (
          s.place === 'field' &&
          !walkable(v.secondPetX, v.secondPetY, s.region)
        ) {
          const p = nearestRoutePoint(v.secondPetX, v.secondPetY, s.region);
          v.secondPetX = p.x;
          v.secondPetY = p.y;
        }
        v.secondMotion = advanceMotion(
          v.secondMotion,
          v.secondPetX - secondX,
          v.secondPetY - secondY,
        );
        const edge = gateAt(s.x, s.y, s.region);
        if (s.place === 'field' && edge >= 0) {
          const nr = REGIONS[s.region].neighbors[edge];
          if (nr >= 0)
            onAction({ type: 'travel', region: nr, gate: true, edge });
        }
        if (time - lastSecond > 1000) {
          s.seconds++;
          lastSecond = time;
        }
        if (
          (s.place === 'cave' || (s.place === 'field' && !isTown(s.region))) &&
          s.seconds >= s.encounterGraceUntil &&
          game.current === s
        ) {
          const enemy = entities(s).find(
            (e) =>
              e.kind === 'enemy' &&
              !e.captain &&
              Math.hypot(e.x - s.x, e.y - s.y) < 55,
          );
          if (enemy) {
            path = [];
            v.target = null;
            interactId = null;
            onAction({ type: 'interact', id: enemy.id });
          }
        }

        if (
          s.place !== 'shop' &&
          game.current === s &&
          time - lastPickup > 450
        ) {
          const drop = s.drops.find(
            (d) =>
              d.region === s.region &&
              (d.place ?? 'field') === s.place &&
              Math.hypot(d.x - s.x, d.y - s.y) <= 90 &&
              time - (v.dropSeen.get(d.id) ?? time) > 1100 &&
              bagRoom(s, d.item) > 0,
          );
          if (drop) {
            lastPickup = time;
            onAction({ type: 'pickup' });
          }
        }
      } else {
        keyboard.clear();
        v.walking = false;
        v.playerMotion = advanceMotion(v.playerMotion, 0, 0);
        v.petMotion = advanceMotion(v.petMotion, 0, 0);
        v.secondMotion = advanceMotion(v.secondMotion, 0, 0);
        path = [];
        v.target = null;
      }
      const visibleW = w / v.zoom,
        visibleH = h / v.zoom;
      const bounds =
        s.place === 'shop'
          ? SHOP_BOUNDS
          : { x: 0, y: 0, width: SIZE, height: SIZE };
      const cx =
        visibleW >= bounds.width
          ? bounds.x + bounds.width / 2
          : Math.max(
              bounds.x + visibleW / 2,
              Math.min(bounds.x + bounds.width - visibleW / 2, s.x),
            );
      const cy =
        visibleH >= bounds.height
          ? bounds.y + bounds.height / 2
          : Math.max(
              bounds.y + visibleH / 2,
              Math.min(bounds.y + bounds.height - visibleH / 2, s.y),
            );
      v.cx += (cx - v.cx) * Math.min(1, dt * 8);
      v.cy += (cy - v.cy) * Math.min(1, dt * 8);
      render(
        c,
        game.current,
        v,
        {
          maps,
          sprites,
          poodle,
          interior,
          entrance,
          playerWalk,
          dogWalk,
          enemies,
          cave,
          dragons,
          creatures,
        },
        time,
      );
      if (time - lastUI > 250) {
        onTick();
        lastUI = time;
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener('blur', blur);
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
      document.removeEventListener('focusin', focus);
      document.removeEventListener('visibilitychange', visibility);
      el.removeEventListener('pointerdown', click);
    };
  }, [game, navigation, paused, onAction, onTick]);
  return (
    <canvas
      ref={canvas}
      tabIndex={0}
      aria-label="키보드 방향키나 길을 터치해 이동합니다. 강아지, 악당, 상점, 전리품을 터치하면 다가가 상호작용합니다."
    />
  );
}
