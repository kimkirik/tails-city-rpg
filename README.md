# Tails City · 테일즈 시티

Korean-language modern dog companion RPG. Six explorable connected regions, twelve recruitable dogs plus Richi, a brown female poodle starter, companion following, turn-based combat and a complete six-boss campaign. Inventory begins at 25 slots, stacks up to nine, and expands five slots at a time to 100. Three browser save slots, 15-second exploration autosave, JSON export/import with validation.

Yeondu Village is safe. Other regions contain enemies with visible persistent HP, and roaming patrols return after 30 seconds of exploration. Shops have opening doors and a separate walkable interior; approach the counter to buy supplies or one of three weapons, then use the southern exit. Weapons occupy inventory slots, auto-equip on purchase, and add damage to the joint attack. Older saves receive defaults for these features without losing existing progression.

## Local development

- `npm install`
- `npm run dev`
- `npm run build`
- `npx tsc --noEmit`
- `node --test lib/game/model.test.ts` (Node with native TypeScript support)

WASD/arrows move, Shift runs, E interacts, B/M/P/J open panels, Escape closes panels. Pointer pathfinding and touch directional controls are also available.

## Validation

18 game-model checks cover saves, corrupt imports, inventory limits, recruitment, connected travel, battle rewards/cooldowns, recovery, a full campaign simulation, progress-preserving migration from the original starter, indoor shop purchases and exits, weapon damage/equipment, safe-village rules, and persistent enemy HP with patrol respawning. TypeScript compilation and production build are checked separately. Browser UI automation was not requested and was not run. Optional WebMCP read/panel tools feature-detect document.modelContext; no supported live validation context was available, so those optional tools are not claimed as verified.

## Art

Six individual 1254×1254px region maps (about six times the original pixels per region), a 1254×1254px shop interior, and a 1774×887px closed/open shop entrance atlas, generated with the built-in image generation tool. Character atlas: eight transparent 384×512px cells. Richi uses a separate 1086×1448px RGBA poodle sprite; edge-connected checkerboard pixels were removed with user-approved image postprocessing while preserving the eyes and fur. Regional textures are framed at render time to keep paths aligned with movement coordinates. High-DPI canvas resolution supports device pixel ratios up to three. Sources in public/art. All game progression is device-local; JSON saves can transfer progress between browsers.
