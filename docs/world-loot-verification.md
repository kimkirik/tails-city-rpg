# Towns, expanded world and exclusive loot

Updated 2026-09-13. Live hosting remains Sites; GitHub is a secondary source backup.

## Final behavior

- 12 connected regions, including six newly illustrated maps. Safe towns are Yeondu (1), Seabreeze (7), Pinehill (9) and Starlight (11). Each has two shops, free rest, residents and no enemies or cave entrances. The remaining eight regions contain outdoor enemies and one raid each, without shops or town residents.
- New games start in Yeondu. Ten residents are rendered with larger sprites, glowing ground markers and speech labels. Local guide destinations and clickable minimap markers use the existing pathfinder. Named exits show whether the destination is safe or a combat region, its level, and its direction; world cards list neighboring regions.
- The former village raid, captain and progress identifiers move from region1 to Wildflower Outskirts (6). Legacy saves inside that cave remain inside the moved cave. Old shops formerly located outside towns resume in Yeondu. Inventory, equipment, coins, dogs, claimed quests, cats, bosses and cave guard damage are preserved.
- Exactly 10,000 stable item IDs remain: 7,988 shop/basic recipes, 1,006 monster-exclusive recipes and 1,006 raid-exclusive recipes. Generated variant8 is monster-exclusive and variant9 raid-exclusive. Training supplements and selected original equipment are also exclusive. The model rejects exclusive purchases even with unlimited coins and high levels. Existing held items remain usable and sellable.
- Every victory retains generous basic supplies and level-appropriate generated items. Independent bonus rolls award at most one item from each exclusive pool; rewards never exceed either traveler or enemy level. Cleared-cave guardians continue scaling to Lv100+ for late-level item access. Quest rewards provide recovery supplies rather than bypassing exclusive drops.
- Buy, Sell and Loot Codex tabs share readable item level, rarity and source labels. Only Buy has purchase buttons. Rare Codex entries explain where to obtain the item.

## Probability verification

Each row samples 2,000 victories from the deterministic encounter/kill-count generator. Rates are for an extra item from the indicated pool, not for one particular item. Basic supplies are separate.

| Encounter | Monster pool configured / observed | Raid pool configured / observed |
|---|---|---|
| Normal monster | 18% / 18.05% | 0% / 0% |
| Field captain | 45% / 45.35% | 0% / 0% |
| Cave guardian | 30% / 29.75% | 10% / 9.05% |
| Dragon | 45% / 43.70% | 80% / 81.35% |

## Automated validation

74 tests pass, including all12 region connections and blocked edges; the actual touch pathfinder reaches every field/cave entity; eight raid gate/boss sequences; safe-town action restrictions; all10,000 item sale prices and exclusive purchase denial; level-ceiling drops and rarity access; legacy migration; new-region save round trips; 1000-slot inventories; combat timing, solo/team staging and duplicate input guards.

The earned-inventory raid simulation uses town shops, owned healing supplies and the equipped traveler when stronger. All eight dragons finish in6–7 actions with this policy. This verifies campaign feasibility, not a claim that all player choices result in the same difficulty.

Commands: `node --experimental-strip-types --test lib/game/*.test.ts`, `npx tsc --noEmit`, `git diff --check`, Sites `build-site.mjs`.

## Browser checks

Isolated local browser sessions, never public-player saves: portrait390×844 and320×568, desktop1366×900. Verified new safe start, local-guide auto-walk to resident and NPC dialogue, opening shop door/interior, walking to counter, buying and selling, and rare item discovery. A Lv20 traveler sees no "용의 심장검" in Buy; Loot Codex shows its level, raid source and no purchase button. Small-screen shop/sell/codex dialogs fit within the viewport (320px page scroll width at320px viewport). New maps use full local raster assets and functional collision/exit overlays.

New asset paths and exact built-in generation prompts: [expanded-map-prompts.md](expanded-map-prompts.md).
