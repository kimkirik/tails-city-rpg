# Character levels and 10,000-item catalog

The traveler, every dog, human enemies, cave creatures, dragons, residents and merchants show levels. The traveler and current traveling dogs receive XP from victories and claimed quests; benched dogs wait. Thresholds remain 45 × current level, preserving dog progression. Traveler levels add 12 maximum HP and 3 attack; dogs add 10 HP and 3 attack. Level-ups restore HP. Progression stops at level 999. Older saves without traveler progression inherit the highest dog's level and receive the corresponding new traveler growth; items, dog stats, currency and quest progress remain intact.

The catalog has exactly 10,000 persistent item IDs and unique names: 28 original items and 9,972 deterministic recipes. Recipes combine 100 acquisition levels, ten item families and ten stat profiles, with six rarity grades. There are 6,039 distinct effect/stat combinations; recipes also have distinct names and prices. No generated image or per-item network request is required. Do not renumber or reorder the recipe IDs after publishing.

- 5,987 healing foods and drinks, 1 friend treat, 1 antidote and 2 strengthening items.
- 1,999 weapons, 1,002 outfits, 1,002 accessories and 6 bag upgrades.
- The shop defaults to items at or below the traveler's level. Search covers name, effect and rarity. “모든 레벨” previews higher-level items with disabled purchase buttons. Both purchase and sale lists render at most 12 item rows per page. Inventory still preserves the 1,000-slot limit and 9-item stacks.
- Existing owned items remain usable, including pre-update high-level equipment. Newly purchased items require the displayed traveler level. Bag capacity upgrades stay level 1.
- Each victory guarantees several new recipe items alongside the existing generous staple drops. Recipe selection varies deterministically with enemy ID and victory count. Drop level is at most both the enemy's and traveler's level, capped at catalog level 100. Higher levels introduce better stats and rarities. Food and equipment are functional in the same use/equip/sale/save paths as original items.
- Cleared caves have repeatable guardians that scale up to the traveler's level. The initial six-region story retains its fixed difficulty. Existing ground loot is preserved; after 840 piles, duplicate items merge and overflow of new item types converts to coins at the displayed sale price with a victory message.

## Verification

69 automated tests include catalog uniqueness and valid effects, buy/sell round trips for all 10,000 items, multi-level growth, maximum level, bench exclusion, level-gated purchases, generated food/gear effects, variation and level ceilings in 1,500 loot samples, high rarity reachability, legacy migration, 1,000-slot mixed-item saves, bounded ground loot and level 20/60/100 repeatable cave combat.

The earned-supplies six-raid simulation remains winnable without inflated starting stats or money. Dragon battles take 9, 9, 10, 10, 12 and 15 actions; healing actions are 1, 2, 3, 1, 3 and 5. This policy uses the starter and recruited companion, normal rewards, affordable level-unlocked gear, guarded breath turns and one team attack per fight.

Browser checks use isolated local save fixtures, never public player saves. Verified level-1 convenience purchases, search and page navigation; high-level preview locks; level-20 armory purchase (attack 74→137); fresh-page combat leveling (traveler 1→2, Richi 2→3); status experience bars; save export/import; mobile and desktop bounds. TypeScript and production build pass. A full reload was used after development hot updates so retained animation-controller instances used the final combat logic.
