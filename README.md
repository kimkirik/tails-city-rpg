# Tails City · 테일즈 시티

Korean-language modern dog companion RPG. Six explorable connected regions, twelve recruitable dogs plus Richi, a brown female poodle starter, companion following, turn-based combat and a complete six-boss campaign. Inventory begins at 25 slots, stacks up to nine, and expands five slots at a time to 100. Three browser save slots, 15-second exploration autosave, JSON export/import with validation.

Yeondu Village is safe. Other regions contain enemies with visible persistent HP, and roaming patrols return after 30 seconds of exploration. Shops have opening doors and a separate walkable interior; approach the counter to buy supplies or one of three weapons, then use the southern exit. Weapons occupy inventory slots, auto-equip on purchase, and add damage to the joint attack. Older saves receive defaults for these features without losing existing progression.

Player and Richi have aligned 16-frame walking sheets (four directions and four phases). Animation follows actual distance traveled, including running and independent pet following, and stops when the actor stops. Normal enemies drop 15–16 items in six or seven piles; captains drop 36, including a weapon. Rewards scatter onto reachable ground, are picked up automatically nearby or with E, and remain on the ground when inventory fills. Uncollected items persist across travel and saves.

## Local development

- `npm install`
- `npm run dev`
- `npm run build`
- `npx tsc --noEmit`
- `node --test lib/game/model.test.ts lib/game/motion.test.ts` (Node with native TypeScript support)

WASD/arrows move, Shift runs, E interacts, B/M/P/J open panels, Escape closes panels. Pointer pathfinding and touch directional controls are also available.

## Validation

24 game-model and motion checks cover saves, corrupt imports, inventory limits, recruitment, connected travel, battle rewards/cooldowns, recovery, a full campaign simulation, progress-preserving migration from the original starter, indoor shop purchases and exits, weapon damage/equipment, safe-village rules, persistent enemy HP with patrol respawning, generous reachable loot drops, partial pickups, saved ground items, bounded merging without quantity loss, and movement-driven animation frames. TypeScript compilation and production build are checked separately. Browser UI automation was not requested and was not run. Optional WebMCP read/panel tools feature-detect document.modelContext; no supported live validation context was available, so those optional tools are not claimed as verified.

## Art

Six individual 1254×1254px region maps (about six times the original pixels per region), a 1254×1254px shop interior, and a 1774×887px closed/open shop entrance atlas, generated with the built-in image generation tool. Character atlas: eight transparent 384×512px cells. Richi uses a separate 1086×1448px RGBA poodle sprite; edge-connected checkerboard pixels were removed with user-approved image postprocessing while preserving the eyes and fur. Regional textures are framed at render time to keep paths aligned with movement coordinates. High-DPI canvas resolution supports device pixel ratios up to three. Two 1024×1024px RGBA walk atlases were generated from the existing player and Richi references, with authorized background cleanup and consistent cell alignment. Sources in public/art. All game progression is device-local; JSON saves can transfer progress between browsers.
