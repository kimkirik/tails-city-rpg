# Tails City · 테일즈 시티

Korean-language modern dog companion RPG. Six explorable connected regions, twelve recruitable dogs plus a starter, companion following, turn-based combat and a complete six-boss campaign. Inventory begins at 25 slots, stacks up to nine, and expands five slots at a time to 100. Three browser save slots, 15-second exploration autosave, JSON export/import with validation.

## Local development

- `npm install`
- `npm run dev`
- `npm run build`
- `npx tsc --noEmit`
- `node --test lib/game/model.test.ts` (Node with native TypeScript support)

WASD/arrows move, Shift runs, E interacts, B/M/P/J open panels, Escape closes panels. Pointer pathfinding and touch directional controls are also available.

## Validation

12 game-model checks cover saves, corrupt imports, inventory limits, recruitment, connected travel, battle rewards/cooldowns, recovery, and a full campaign simulation. TypeScript compilation and production build are checked separately. Browser UI automation was not requested and was not run. Optional WebMCP read/panel tools feature-detect document.modelContext; no supported live validation context was available, so those optional tools are not claimed as verified.

## Art

Two original pixel art atlases generated with the built-in image generation tool. Map atlas: six 512px square regions. Character atlas: eight transparent 384×512px cells. Sources in public/art. All game progression is device-local; JSON saves can transfer progress between browsers.
