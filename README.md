# Tails City · 테일즈 시티

[Play the public game](https://tails-city-rpg.kimkirik.chatgpt.site)

A Korean modern pixel RPG starring the traveler and **Richi (리치), a brown female poodle**. Touch destinations or use arrow keys to explore twelve connected regions: four safe towns and eight outdoor combat zones. The world occupies 90% of the portrait viewport, with messages, minimap and status in collapsible layers.

## Adventure and combat

- The minimap doubles as a local guide: tap a resident, shop, rest stop, cave or named exit to follow an actual walkable route. NPCs use larger sprites, glowing ground markers and floating speech labels.
- Each map only allows travel through connected gates. Closed directions have visible barriers and matching collision; the minimap marks open exits and blocked roads.
- **Normal attacks are solo actions.** Choose the traveler or one accompanying dog without spending a turn. Only that actor appears and attacks in the solo scene. Tail attacks trade some damage for reduced retaliation; skills have a cooldown; guarding reduces the next counter by 70%.
- **Team attack is once per battle, available from turn3**, requires a living traveler and at least one living dog, and consumes **two turns**. All eligible actors appear together. A surviving enemy retaliates twice. Damage, HP, motion trails, running/leaping/spinning and defeat rewards share one reserved animation result, preventing duplicate taps.
- Recruit up to twenty-four dogs in addition to Richi, with a maximum of two following companions. Each dog has a visible charm requirement. Insufficient charm does not consume a treat. Quest rewards, rescued cats and equipped accessories increase charm.
- Yeondu, Seabreeze, Pinehill and Starlight villages have shops, visible residents and free rest; no enemies or cave entrances exist in towns. Every outdoor combat region has a raid cave, three guardians, a rescue cat and a named elemental dragon. The former village cave and its saved progress move to Wildflower Outskirts. Cave rats, slimes, bats, spiders, golems and mushrooms appear across regions. Dragons telegraph a stronger elemental breath every third turn; the poison dragon can inflict poison. The final dragon requires the first five liberated dragons.
- Ten residents provide local directions; four story NPCs connect twelve quests: gather rumors, recover stolen goods, clear cave rats, rescue cats and free the eight dragons. Accept and claim quests with the relevant NPC. Progress made before acceptance is retained. Rewards cannot be claimed twice.
- The original six-captain campaign remains playable. Patrols respawn after45 seconds of exploration. Cave guardians reset on reentry, while freed cats and dragons remain freed.

## Levels and 10,000 items

The traveler and traveling dogs gain XP from victories and completed quests, level up with real HP/attack growth and show XP in status. Monsters, wild dogs, residents and merchants display levels. Cleared cave guardians scale to the traveler on repeat visits. Existing dog progression and saves migrate automatically.

Exactly 10,000 item definitions combine 100 acquisition levels, six rarity grades and functional healing, weapon, clothing and accessory profiles. 7,988 basic item recipes are sold in shops; 1,006 monster-exclusive and 1,006 raid-exclusive recipes cannot be bought, even with enough coins or levels. Shops have Buy/Sell/Loot Codex tabs, search, acquisition labels and 12 items per page; high-level previews cannot be purchased early. Each victory includes varied new recipe drops, with item level limited by both traveler and enemy level. Existing owned equipment remains usable. See `docs/level-items-verification.md` for catalog totals and verification.

## Shops, equipment and saves

Separate convenience-store and armory entrances retain opening-door transitions and walkable interiors. Approach the counter to shop and use the southern exit to leave.

The convenience store sells healing foods/potions, revival lunches, antidotes, and bags of50/100/200/400/700/1000 slots. Bags start at25 slots; each slot stacks9 items. Buying a larger bag immediately preserves and expands the existing inventory. Inventory pages display at most30 slots.

Both counters have Buy/Sell/Loot Codex tabs. Sell any held consumable or equipment in a chosen quantity for half its purchase price (rounded down). The preview shows unit and total coins; selling the last equipped copy removes its bonuses and clamps current HP to the new maximum. Expanded bag capacity cannot be sold. Sales free inventory slots and persist in saves.

The armory sells starter equipment and common level-based alternatives with actual attack, maximum HP, defense and charm bonuses. Purchases equip immediately; owned equipment can be changed from the bag outside combat. Free paper-doll appearance customization remains separate: four face/hair choices, three outfit shapes, five colors and an editable1–12 character traveler name.

Normal enemies drop at least15 items in visible piles; captains and dragons drop more, including level-appropriate equipment. Separate bonus rolls award one monster-exclusive item (18% normal, 45% captain, 30% cave guardian, 45% dragon) and one raid-exclusive item (10% guardian, 80% dragon). These are pool probabilities, not per-item rates. Important upgrades and signature equipment have no guaranteed shop/quest path. Nearby loot is picked up automatically. Full bags leave excess loot on the ground. Field and cave drops retain separate locations and survive travel and saves.

Three browser save slots, a15-second exploration autosave and validated JSON import/export preserve progress. Legacy saves migrate to new fields without losing companions, items or completed encounters. All progress remains device-local. The install panel retains the cute Richi PWA icon, native installation where supported, and platform-specific guidance. Initial launch requires a connection; there is no offline service-worker cache.

## Development

```sh
npm install
npm run dev
npx tsc --noEmit
node --experimental-strip-types --test lib/game/*.test.ts
npm run build
```

Node22.13+ is required. The game is hosted independently on Sites. GitHub is a source backup only: no GitHub Pages, runtime raw-file dependencies or Actions-based hosting.

## Validation

74 automated checks cover legacy and malformed saves, 1000-slot bags, atomic purchases/rewards, charm, equipment bonuses, capped upgrades, poison/healing targets, one-actor combat, once-per-battle two-turn team attacks, impact timing, duplicate-tap prevention, all map gates, the actual touch pathfinder reaching every field/cave entity, eight raid bosses outside all towns, rescue persistence, NPC quest prerequisites, both campaigns, party limits, keyboard controls, animation bounds, music and install controllers.

An earned-supplies simulation clears all eight raids using town purchases, healing items actually owned and a deliberately selected equipped traveler. Bosses take6–7 actions in this policy; skills, guarding and the two-turn team attack remain meaningful. This is a reproducible balance check, not a guarantee for every player strategy. See `docs/world-loot-verification.md` for drop sampling and migration checks.

Browser QA uses an isolated local session. Real touch recruitment, arrow movement, solo Richi and traveler scenes, team attacks, loot, cave entry, NPC acceptance, shops, inventory paging, save/export/import and responsive layouts are checked. Prepared save files are used for targeted boss, large-inventory and map-boundary cases. No test progress is written to players' public saves. See `docs/expansion-verification.md` for the final checks.

## Art and music

Original assets generated with the built-in image tool include twelve high-resolution region maps, shop doors/interior, traveler and seven dog breed walking sheets, eight distinct human enemies, six dragons, twelve cave/NPC/prop sprites and the cave map. User-authorized alpha cleanup, resizing and sprite alignment preserve standalone raster art. Six new map prompts and paths: `docs/expanded-map-prompts.md`. Raid prompts: `public/art/raids/prompts.md`; earlier prompts remain in `docs/`.

Two original Web Audio chip compositions provide exploration (108BPM) and battle (156BPM) music with separate sound effects, first-gesture unlock, mute preferences and hidden-tab suspension. No external music recordings or services are used.
