import { drawTraveler } from './traveler-art';
import { enemyLook } from './enemies';
import {
  SIZE,
  REGIONS,
  BREEDS,
  ITEMS,
  WEAPONS,
  RAIDS,
  NPCS,
  closedGates,
  gatePoints,
  charmNeeded,
  entities,
  partyDogs,
  nearest,
  enemyStats,
  entityLevel,
  type GameState,
} from './model';
import { MAP_FRAMES } from './maps';
import { walkFrame, type WalkMotion } from './motion';
export type View = {
  width: number;
  height: number;
  zoom: number;
  cx: number;
  cy: number;
  petX: number;
  petY: number;
  target: { x: number; y: number } | null;
  walking: boolean;
  playerMotion: WalkMotion;
  petMotion: WalkMotion;
  dropSeen: Map<string, number>;
  secondPetX: number;
  secondPetY: number;
  secondMotion: WalkMotion;
};
export type Art = {
  cave: HTMLImageElement;
  dragons: HTMLImageElement;
  creatures: HTMLImageElement;
  enemies: HTMLImageElement;
  maps: HTMLImageElement[];
  sprites: HTMLImageElement;
  poodle: HTMLImageElement;
  interior: HTMLImageElement;
  entrance: HTMLImageElement;
  playerWalk: HTMLImageElement;
  dogWalk: HTMLImageElement[];
};
export function sprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  index: number,
  x: number,
  y: number,
  height: number,
  flip = false,
  standalone?: HTMLImageElement,
) {
  if (index === 8) {
    if (!standalone?.complete || !standalone.naturalWidth) return;
    ctx.save();
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(
      standalone,
      -height * 0.375,
      -height * 0.83,
      height * 0.75,
      height,
    );
    ctx.restore();
    return;
  }
  if (!img.complete || !img.naturalWidth) return;
  const cw = img.naturalWidth / 4,
    ch = img.naturalHeight / 2;
  const width = height * 0.75;
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(
    img,
    (index % 4) * cw,
    Math.floor(index / 4) * ch,
    cw,
    ch,
    -width / 2,
    -height * 0.83,
    width,
    height,
  );
  ctx.restore();
}
export function atlasSprite(
  c: CanvasRenderingContext2D,
  img: HTMLImageElement,
  index: number,
  cols: number,
  rows: number,
  x: number,
  y: number,
  size: number,
) {
  if (!img.complete || !img.naturalWidth) return;
  const cw = img.naturalWidth / cols,
    ch = img.naturalHeight / rows;
  c.drawImage(
    img,
    (index % cols) * cw,
    Math.floor(index / cols) * ch,
    cw,
    ch,
    x - size / 2,
    y - size * 0.86,
    size,
    size,
  );
}
export function animatedSprite(
  c: CanvasRenderingContext2D,
  sheet: HTMLImageElement,
  x: number,
  y: number,
  height: number,
  motion: WalkMotion,
  stride = 24,
) {
  if (!sheet.complete || !sheet.naturalWidth) return false;
  const cw = sheet.naturalWidth / 4,
    ch = sheet.naturalHeight / 4,
    frame = walkFrame(motion, stride);
  c.drawImage(
    sheet,
    frame * cw,
    motion.facing * ch,
    cw,
    ch,
    x - height / 2,
    y - height * 0.82,
    height,
    height,
  );
  return true;
}
function label(
  c: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color = '#fffdeb',
  bg = '#294932db',
) {
  c.font = '600 12px Arial';
  const w = c.measureText(text).width + 18;
  c.fillStyle = bg;
  c.beginPath();
  c.roundRect(x - w / 2, y - 12, w, 23, 6);
  c.fill();
  c.fillStyle = color;
  c.textAlign = 'center';
  c.fillText(text, x, y + 4);
}
export function render(
  c: CanvasRenderingContext2D,
  s: GameState,
  v: View,
  art: Art,
  t: number,
) {
  const { width: w, height: h, zoom: z } = v;
  const indoors = s.place === 'shop';
  const cave = s.place === 'cave';
  const map = indoors ? art.interior : cave ? art.cave : art.maps[s.region];
  const [fw, fh] = indoors || cave ? [1254, 1254] : MAP_FRAMES[s.region];
  c.clearRect(0, 0, w, h);
  const tx = w / 2 - v.cx * z,
    ty = h / 2 - v.cy * z;
  const screen = (x: number, y: number) => ({ x: x * z + tx, y: y * z + ty });
  c.imageSmoothingEnabled = false;
  c.fillStyle = '#78996b';
  c.fillRect(0, 0, w, h);
  if (map.complete && map.naturalWidth) {
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    c.drawImage(
      map,
      0,
      0,
      (map.naturalWidth * fw) / 1254,
      (map.naturalHeight * fh) / 1254,
      tx,
      ty,
      SIZE * z,
      SIZE * z,
    );
    c.imageSmoothingEnabled = false;
  }
  if (!indoors && !cave) {
    for (const gate of closedGates(s.region)) {
      const p = screen(gate.x, gate.y),
        horizontal = gate.index % 2 === 0;
      const width = (horizontal ? 184 : 42) * z,
        height = (horizontal ? 42 : 152) * z;
      c.save();
      c.fillStyle = '#28342fee';
      c.fillRect(p.x - width / 2, p.y - height / 2, width, height);
      c.strokeStyle = '#f5bf65';
      c.lineWidth = 5 * z;
      c.beginPath();
      for (let i = -100; i < 110; i += 25) {
        if (horizontal) {
          c.moveTo(p.x + i * z, p.y - 17 * z);
          c.lineTo(p.x + (i + 22) * z, p.y + 17 * z);
        } else {
          c.moveTo(p.x - 17 * z, p.y + i * z * 0.7);
          c.lineTo(p.x + 17 * z, p.y + (i + 22) * z * 0.7);
        }
      }
      c.stroke();
      c.restore();
      label(
        c,
        '통행 불가 · 막힌 길',
        p.x,
        p.y - 40 * z,
        '#ffe9be',
        '#553c2eea',
      );
    }
  }
  if (v.dropSeen.size > 600) {
    const ids = new Set(s.drops.map((d) => d.id));
    for (const id of v.dropSeen.keys()) if (!ids.has(id)) v.dropSeen.delete(id);
  }
  const near = nearest(s);
  const all = entities(s),
    party = partyDogs(s);
  const at = [
    ...all.map((e) => ({ kind: 'entity', y: e.y, e })),
    ...party.map((dog, slot) => ({
      kind: 'pet',
      y: slot === 0 ? v.petY : v.secondPetY,
      slot,
    })),
    { kind: 'player', y: s.y },
  ].sort((a, b) => a.y - b.y);
  // Destination indicator and navigational markers are functional overlays.
  if (v.target) {
    const p = screen(v.target.x, v.target.y);
    c.strokeStyle = '#f6e99b';
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(p.x, p.y, 10, 5, 0, 0, 7);
    c.stroke();
  }
  for (const entry of at) {
    if (entry.kind === 'entity' && 'e' in entry) {
      const e = entry.e!;
      const p = screen(e.x, e.y);
      if (p.x < -100 || p.x > w + 100 || p.y < -100 || p.y > h + 100) continue;
      if (e.kind === 'drop') {
        const drop = s.drops.find((d) => d.id === e.id)!;
        if (!v.dropSeen.has(e.id))
          v.dropSeen.set(e.id, drop.createdAt < s.seconds - 2 ? t - 1500 : t);
        const age = t - v.dropSeen.get(e.id)!,
          progress = Math.min(1, age / 800),
          ease = 1 - (1 - progress) ** 3;
        const origin = screen(drop.originX, drop.originY),
          px = origin.x + (p.x - origin.x) * ease,
          py =
            origin.y +
            (p.y - origin.y) * ease -
            Math.sin(progress * Math.PI) * 65 * z;
        const bob = progress === 1 ? Math.sin(t * 0.004 + e.x) * 2 : 0;
        c.save();
        c.shadowColor = WEAPONS[e.item!] ? '#ffd26e' : '#fff2a6';
        c.shadowBlur = 14;
        c.fillStyle = WEAPONS[e.item!] ? '#e5b34855' : '#fff3b044';
        c.beginPath();
        c.ellipse(p.x, p.y, 20 * z, 9 * z, 0, 0, 7);
        c.fill();
        c.shadowBlur = 0;
        c.font = `${Math.max(21, 34 * z)}px Arial`;
        c.textAlign = 'center';
        c.fillText(ITEMS[e.item!].icon, px, py - 7 * z + bob);
        c.font = 'bold 10px Arial';
        c.strokeStyle = '#293b31';
        c.lineWidth = 3;
        c.strokeText(`×${e.qty}`, px + 13 * z, py + 4);
        c.fillStyle = '#fffbe6';
        c.fillText(`×${e.qty}`, px + 13 * z, py + 4);
        c.restore();
      } else if (e.kind === 'dog' || e.kind === 'enemy') {
        c.fillStyle = '#172f3029';
        c.beginPath();
        c.ellipse(p.x, p.y, 18 * z, 7 * z, 0, 0, 7);
        c.fill();
        e.kind === 'dog'
          ? animatedSprite(
              c,
              art.dogWalk[e.breed!],
              p.x,
              p.y,
              88 * z,
              {
                facing: 0,
                distance: (Math.floor(t / 340 + e.x) % 4) * 19,
                moving: true,
              },
              19,
            ) ||
            sprite(
              c,
              art.sprites,
              BREEDS[e.breed!].sprite,
              p.x,
              p.y,
              94 * z,
              false,
              art.poodle,
            )
          : e.dragon
            ? atlasSprite(c, art.dragons, s.region, 3, 2, p.x, p.y, 190 * z)
            : e.creature !== undefined
              ? atlasSprite(
                  c,
                  art.creatures,
                  e.creature,
                  4,
                  3,
                  p.x,
                  p.y,
                  110 * z,
                )
              : sprite(
                  c,
                  art.enemies,
                  enemyLook(e.id, s.region),
                  p.x,
                  p.y,
                  (e.captain ? 112 : 94) * z,
                );
        label(
          c,
          `${e.name} Lv.${entityLevel(s, e)}`,
          p.x,
          p.y + 20,
          e.kind === 'enemy' ? '#ffe9df' : '#fffdeb',
          e.kind === 'enemy' ? '#703d38e8' : '#386653e8',
        );
        const bounce = Math.sin(t * 0.002 + e.x) * 3;
        label(
          c,
          e.kind === 'dog'
            ? `♥ 매력 ${charmNeeded(e.id, s.region)}`
            : e.dragon
              ? '🐉'
              : e.captain
                ? '★'
                : '!',
          p.x,
          p.y - 75 * z + bounce,
          e.kind === 'dog' ? '#af533b' : '#fff2d9',
          e.kind === 'dog' ? '#fff6ddd9' : '#bd6752ed',
        );
        if (e.kind === 'enemy') {
          const enemy = enemyStats(s, e),
            bw = Math.max(54, 76 * z),
            by = p.y - 108 * z;
          c.fillStyle = '#302b2ce8';
          c.beginPath();
          c.roundRect(p.x - bw / 2 - 2, by - 2, bw + 4, 18, 4);
          c.fill();
          c.fillStyle = '#5d3739';
          c.fillRect(p.x - bw / 2, by, bw, 5);
          c.fillStyle = e.captain ? '#e9a35f' : '#e16c6c';
          c.fillRect(p.x - bw / 2, by, (bw * enemy.hp) / enemy.maxHp, 5);
          c.font = 'bold 9px Arial';
          c.fillStyle = '#fff5e2';
          c.textAlign = 'center';
          c.fillText(`${enemy.hp} / ${enemy.maxHp}`, p.x, by + 14);
        }
      } else if (e.kind === 'npc' || e.kind === 'cat' || e.kind === 'cave') {
        const index =
          e.kind === 'npc'
            ? NPCS.find((n) => n.id === e.npc)!.sprite
            : e.kind === 'cat'
              ? 10
              : 11;
        atlasSprite(
          c,
          art.creatures,
          index,
          4,
          3,
          p.x,
          p.y,
          (e.kind === 'cave' ? 145 : 110) * z,
        );
        label(
          c,
          e.kind === 'cave' ? e.name : `${e.name} Lv.${entityLevel(s, e)}`,
          p.x,
          p.y + 24,
          '#fff8da',
          e.kind === 'npc' ? '#56528feb' : '#384658eb',
        );
        if (e.kind === 'npc')
          label(c, '! 의뢰 · 대화', p.x, p.y - 90 * z, '#ffdc81', '#40385ce8');
        if (e.kind === 'cave')
          label(
            c,
            s.raids.includes(s.region)
              ? `재도전 · Lv.${Math.max(REGIONS[s.region].level + 1, s.hero.level)}`
              : `레이드 · Lv.${REGIONS[s.region].level + 3}`,
            p.x,
            p.y - 125 * z,
            RAIDS[s.region].color,
            '#233843e8',
          );
      } else if (e.kind === 'shop') {
        if (art.entrance.complete && art.entrance.naturalWidth) {
          const frame = art.entrance.naturalWidth / 2;
          c.drawImage(
            art.entrance,
            0,
            0,
            frame,
            art.entrance.naturalHeight,
            p.x - 85 * z,
            p.y - 131 * z,
            170 * z,
            170 * z,
          );
        }
        label(
          c,
          e.name,
          p.x,
          p.y + 34,
          e.shopType === 'armory' ? '#ffe7b0' : '#d9ffef',
          e.shopType === 'armory' ? '#714927ed' : '#2b624fed',
        );
      } else if (e.kind === 'merchant' || e.kind === 'exit') {
        label(
          c,
          e.kind === 'merchant'
            ? `${e.name} Lv.${entityLevel(s, e)} · 사고팔기`
            : '↓ 밖으로 나가기',
          p.x,
          p.y - 28,
          '#fff4d6',
          '#61472de8',
        );
      } else {
        const icon = e.kind === 'rest' ? '⛺' : '🎒';
        c.font = `${32 * z}px Arial`;
        c.textAlign = 'center';
        c.fillText(icon, p.x, p.y);
        label(c, e.name, p.x, p.y + 21);
      }
      if (near?.id === e.id) {
        c.strokeStyle = '#fff8ce';
        c.lineWidth = 2;
        c.beginPath();
        c.ellipse(p.x, p.y, 26 * z, 10 * z, 0, 0, Math.PI * 2);
        c.stroke();
      }
    } else if (entry.kind === 'player') {
      const p = screen(s.x, s.y);
      c.fillStyle = '#27392c33';
      c.beginPath();
      c.ellipse(p.x, p.y, 16 * z, 6 * z, 0, 0, 7);
      c.fill();
      if (
        !drawTraveler(c, s.appearance, p.x, p.y, 110 * z, v.playerMotion) &&
        !animatedSprite(c, art.playerWalk, p.x, p.y, 110 * z, v.playerMotion)
      )
        sprite(c, art.sprites, 0, p.x, p.y, 110 * z);
      label(
        c,
        `${s.playerName} Lv.${s.hero.level}`,
        p.x,
        p.y + 19,
        '#315143',
        '#fffbedef',
      );
    } else if (entry.kind === 'pet' && 'slot' in entry) {
      const slot = entry.slot,
        pet = party[slot],
        motion = slot === 0 ? v.petMotion : v.secondMotion,
        p = screen(
          slot === 0 ? v.petX : v.secondPetX,
          slot === 0 ? v.petY : v.secondPetY,
        );
      const breed = BREEDS[pet.breed];
      c.save();
      if (pet.hp <= 0) c.globalAlpha = 0.55;
      if (
        !animatedSprite(c, art.dogWalk[pet.breed], p.x, p.y, 86 * z, motion, 19)
      )
        sprite(
          c,
          art.sprites,
          breed.sprite,
          p.x,
          p.y + (motion.moving ? Math.sin(motion.distance * 0.18) * 2 : 0),
          81 * z,
          motion.facing === 1,
          art.poodle,
        );
      c.restore();
      label(
        c,
        `${pet.name} Lv.${pet.level}`,
        p.x,
        p.y + 18,
        '#fff4d5',
        '#8a6945df',
      );
    }
  }

  const gates = gatePoints(s.region);
  if (!indoors && !cave)
    REGIONS[s.region].neighbors.forEach((id, i) => {
      if (id < 0) return;
      const p = screen(gates[i].x, gates[i].y);
      c.strokeStyle = '#ffffc899';
      c.lineWidth = 3;
      c.beginPath();
      c.arc(p.x, p.y, 22 + Math.sin(t * 0.003) * 3, 0, 7);
      c.stroke();
      label(
        c,
        `${['↑', '→', '↓', '←'][i]} ${REGIONS[id].name}`,
        p.x,
        p.y - 37,
        '#fff8de',
        '#2c4c3ce8',
      );
    });
}
