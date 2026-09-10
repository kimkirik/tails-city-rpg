# Tails City · 테일즈 시티

Korean-language modern dog companion RPG. Six explorable connected regions, twelve recruitable dogs plus Richi, a brown female poodle starter, up to two equipped companions following and assisting attacks, turn-based combat and a complete six-boss campaign. Inventory begins at 25 slots, stacks up to nine, and expands five slots at a time to 100. Three browser save slots, 15-second exploration autosave, JSON export/import with validation.

Yeondu Village is safe. Other regions contain enemies with visible persistent HP, and roaming patrols return after 30 seconds of exploration. Shops have opening doors and a separate walkable interior; approach the counter to buy supplies or one of three weapons, then use the southern exit. Weapons occupy inventory slots, auto-equip on purchase, and add damage to the joint attack. Older saves receive defaults for these features without losing existing progression.

Player and Richi have aligned 16-frame walking sheets (four directions and four phases). Animation follows actual distance traveled, including running and independent pet following, and stops when the actor stops. Normal enemies drop 15–16 items in six or seven piles; captains drop 36, including a weapon. Rewards scatter onto reachable ground, are picked up automatically nearby or by touch, and remain on the ground when inventory fills. Uncollected items persist across travel and saves.

## Local development

- `npm install`
- `npm run dev`
- `npm run build`
- `npx tsc --noEmit`
- `node --test lib/game/*.test.ts` (Node with native TypeScript support)

Touch or click a destination to move; touch a dog, enemy, entrance or drop to approach and interact. Keyboard movement and directional pads are removed. The map occupies about 90% of the portrait viewport, with a compact bottom dock. Messages, minimap and status share a collapsible overlay; game events and device-local adventure memos are retained there. Status allows a 1–12-character player name, walk/run, zoom, music and sound toggles. The companion panel manages two followers. B/M/P/J still open menus; Escape closes dialogs. Existing saves receive player-name and party defaults without losing progress.

## Validation

32 model, motion, party and music checks cover saves, corrupt imports, inventory limits, recruitment, connected travel, battle rewards/cooldowns, recovery, a full campaign simulation, progress-preserving migration from the original starter, indoor shop purchases and exits, weapon damage/equipment, safe-village rules, persistent enemy HP with patrol respawning, generous reachable loot drops, partial pickups, saved ground items, bounded merging without quantity loss, movement-driven animation frames, two-pet attack/counterattack/XP behavior, formation limits and fallback, name persistence and migration, stable enemy appearances, original music scores, audio unlock, mute, visibility and teardown. TypeScript compilation and production build are checked separately. Browser UI automation was not requested and was not run. Optional WebMCP read/panel tools feature-detect document.modelContext; no supported live validation context was available, so those optional tools are not claimed as verified.

## Art

Six individual 1254×1254px region maps (about six times the original pixels per region), a 1254×1254px shop interior, and a 1774×887px closed/open shop entrance atlas, generated with the built-in image generation tool. Character atlas: eight transparent 384×512px cells. Richi uses a separate 1086×1448px RGBA poodle sprite; edge-connected checkerboard pixels were removed with user-approved image postprocessing while preserving the eyes and fur. Regional textures are framed at render time to keep paths aligned with movement coordinates. High-DPI canvas resolution supports device pixel ratios up to three. Two 1024×1024px RGBA walk atlases were generated from the existing player and Richi references, with authorized background cleanup and consistent cell alignment. Eight enemy variants in public/art/enemies.png have distinct faces, clothing, equipment and silhouettes. Their stable IDs choose the same appearance on the map and in battle. Generated with the built-in image tool using the original character atlas as a style reference; user-authorized background cleanup preserves coat highlights. Prompt in docs/enemies-prompt.txt. Sources in public/art. All game progression is device-local; JSON saves can transfer progress between browsers.

## Music

Two original eight-bar retro chip compositions run through Web Audio: a bright 108 BPM exploration theme and a tense 156 BPM battle theme. Square-wave lead, triangle arpeggios/bass and synthesized percussion use scheduled envelopes. The first interaction unlocks playback, battle transitions crossfade between tracks, the music toggle persists locally, and hidden tabs suspend audio. No external recordings or music services are used. Effect sounds have a separate toggle.
