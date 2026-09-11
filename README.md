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

Touch or click a destination to move; touch a dog, enemy, entrance or drop to approach and interact. Arrow keys also move the traveler, with normalized diagonals and collision checks. Touch and keyboard take over from each other; typing, dialogs, battles, blur and hidden tabs stop held movement. On-screen directional pads remain removed. The map occupies about 90% of the portrait viewport, with a compact bottom dock. Messages, minimap and status share a collapsible overlay; game events and device-local adventure memos are retained there. Status allows a 1–12-character player name, walk/run, zoom, music and sound toggles. The companion panel manages two followers. B/M/P/J still open menus; Escape closes dialogs. Existing saves receive player-name and party defaults without losing progress.

## Validation

45 model, motion, party, music, customization, keyboard and battle-animation checks cover saves, corrupt imports, inventory limits, recruitment, connected travel, battle rewards/cooldowns, recovery, a full campaign simulation, progress-preserving migration from the original starter, indoor shop purchases and exits, weapon damage/equipment, safe-village rules, persistent enemy HP with patrol respawning, generous reachable loot drops, partial pickups, saved ground items, bounded merging without quantity loss, movement-driven animation frames, two-pet attack/counterattack/XP behavior, formation limits and fallback, name persistence and migration, stable enemy appearances, original music scores, audio unlock, mute, visibility and teardown, impact-timed health, turn reservation, duplicate-tap protection, tail attacks, four-direction spins, and attack bounds on short and tall stages, arrow holds/releases and reset, all 60 appearance save combinations, old-save defaults, invalid appearance rejection, owner weapon contributions on every attack style, and owner finishing blows. TypeScript compilation and production build are checked separately. Browser UI automation was not requested and was not run. Optional WebMCP read/panel tools feature-detect document.modelContext; no supported live validation context was available, so those optional tools are not claimed as verified.

## Art

Six individual 1254×1254px region maps (about six times the original pixels per region), a 1254×1254px shop interior, and a 1774×887px closed/open shop entrance atlas, generated with the built-in image generation tool. Character atlas: eight transparent 384×512px cells. Richi uses a separate 1086×1448px RGBA poodle sprite; edge-connected checkerboard pixels were removed with user-approved image postprocessing while preserving the eyes and fur. Regional textures are framed at render time to keep paths aligned with movement coordinates. High-DPI canvas resolution supports device pixel ratios up to three. Two 1024×1024px RGBA walk atlases were generated from the existing player and Richi references, with authorized background cleanup and consistent cell alignment. Eight enemy variants in public/art/enemies.png have distinct faces, clothing, equipment and silhouettes. Their stable IDs choose the same appearance on the map and in battle. Generated with the built-in image tool using the original character atlas as a style reference; user-authorized background cleanup preserves coat highlights. Prompt in docs/enemies-prompt.txt. Sources in public/art. All game progression is device-local; JSON saves can transfer progress between browsers.

## Music

Two original eight-bar retro chip compositions run through Web Audio: a bright 108 BPM exploration theme and a tense 156 BPM battle theme. Square-wave lead, triangle arpeggios/bass and synthesized percussion use scheduled envelopes. The first interaction unlocks playback, battle transitions crossfade between tracks, the music toggle persists locally, and hidden tabs suspend audio. No external recordings or music services are used. Effect sounds have a separate toggle.

## Companion animation and battle action

All seven breeds have four-direction, four-phase sprite sheets. The six added breed atlases use 1024×1024 RGBA frames with aligned feet, original coat colors and alternating paws/tails. Field companions animate from actual movement; wild friends, portraits and battle stances also move. Generation prompts are in docs/dog-motion-prompts.json.

Combat now plays a complete reserved turn: the lead runs, spins for a tail strike or leaps for its breed skill, the second dog follows with a separate hit, and the enemy approaches to retaliate. Damage numbers, HP changes, motion trails, impact flashes and defeat fades follow the same timing. A final blow finishes visibly before awarding coins and persistent ground loot; repeated taps cannot execute another turn during the sequence. Existing saves remain compatible. Normal and tail damage totals remain the same; skills now also include the equipped weapon bonus.

## Traveler customization and co-op

Status → 외모·옷 꾸미기 opens a free paper-doll editor. Change the 1–12-character name, choose one of four combined face/hair identities, three outfits and five garment colors. Preview walking and all four directions before applying. Cancel leaves the character unchanged. Saved appearance is shared by the field, status portrait and battle; old saves use the default short-haired traveler and teal jacket without losing progress. Four generated transparent art atlases were aligned by the neck/feet and garment-only recolored into local sheets. Prompts are in docs/traveler-wardrobe-prompts.json.

Every attack now includes the visible traveler and lead dog. The traveler rushes in with a weapon strike (or unarmed swipe), the lead follows while the traveler is still attacking, and a second equipped dog can add a third hit. Damage calculation and animation use the same actor hit list, so HP changes at each impact and a finishing blow suppresses later hits. Enemy retaliation still happens once per turn after the attackers return.

## Installable game icon

The floating 설치 button opens a compact install panel. The app manifest uses a stable root id/start URL, standalone display, Korean title, 192/512px icons and a padded 512px maskable icon. An opaque 180px Apple touch icon and 32px favicon use the same generated Richi illustration. On supporting browsers, a user gesture triggers the captured native install prompt once; cancellation, failed prompts, in-flight duplicate clicks and appinstalled/display-mode changes are handled. Safari/iOS, Android, desktop and embedded browsers receive appropriate manual instructions and a copyable public game address. The install dialog also offers JSON save export to transfer progress if the installed window uses separate storage. Game launch requires a connection; no offline cache or service worker was added.

Four additional install-controller checks cover one-shot prompts, rejection/cancellation, duplicate click prevention, installed state, cleanup and platform guidance. Full original game suite remains available. Browser or operating-system installation was not automated or claimed as tested. Artwork was generated once using built-in image_gen; prompt: docs/install-icon-prompt.txt. Original 1254px artwork was resized to required launcher sizes with extra padding for Android masks.

Implementation references: [MDN installability](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable), [MDN install prompt](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt), [Apple home-screen web apps](https://support.apple.com/en-euro/guide/iphone/iphea86e5236/ios).

The current launcher artwork uses a targeted cute Richi revision: rounder puppy face, larger sparkling eyes, plush brown curls, rosy cheeks and a peach-pink bow. The installation panel, favicon, Apple icon and manifest use new richi-cute asset URLs so browser caches can distinguish the new artwork. The app id, start URL and saves are unchanged. Edit prompt: docs/install-icon-cute-prompt.txt.
