# Routes, grouped shops and quest history

Changes verified locally on 2026-09-13.

## Outdoor routes

All twelve outdoor maps use different connected road graphs: lakeside loop, crooked village ring, S-shaped forest forks, harbor piers, factory switchbacks, offset headquarters courtyards, meadow branches, coastal crescent, zigzag crystal bridges, terraced mountain loops, storm ridge bends and nested night-village loops.

Roads reach map edges only where a neighboring region exists. Natural scenery blocks other directions. Shared geometry controls collision, gate travel, entity placement and touch paths. A* navigation smooths straight sections only after checking the entire segment against collision, so shortcuts cannot cross lakes, cliffs or gardens. Arrivals are offset inward to prevent immediate return travel. Companions are kept on the roads around tight corners.

Artwork lives in `public/art/routes/0.png` through `11.png`; selected prompts are recorded in [route-map-prompts.md](route-map-prompts.md). Images are native 1254×1254 mapped to 2048 game coordinates. Visual boundaries have a small tolerance; collision lies inside the reference road footprint.

Save revision 3 preserves inventory, companions, currency, quests, raids and ground loot. Earlier field positions, interior return points and field drops project to a reachable new road when their former cross-road position is now blocked. New malformed off-road revision 3 positions are still rejected. The earlier town/raid migration runs only for saves predating revision 2.

## Shops

A family appears once on a shelf; its level and grade choices stay inside that card. All original item IDs, statistics, acquisition sources and stored inventory remain intact. The weapon shelf shows three families instead of hundreds of generated variants. Bags occupy one card with size choices. Monster/raid-exclusive goods remain unavailable for purchase.

Quantity controls allow 1–999 consumables or copies of equipment. Total price is exact; maximum quantity accounts for currency and inventory stack room. Purchases are atomic when funds or capacity are insufficient. Buying equipment equips one copy, and remaining copies stay in inventory. Bags remain single upgrades. Selling stacks continues to aggregate identical item IDs and to remove equipment bonuses only when the last equipped copy is sold.

## Quests

Both the journal and NPC conversations put claimed quests in a native details section labeled “지난 퀘스트”, closed by default. The count remains visible. Active quests appear separately in the journal. Expanding or collapsing history does not change quest progress or rewards.

## Verification

- All **82 automated tests passed**; TypeScript and `git diff --check` passed.
- New tests check all smoothed route segments, all reciprocal gate arrivals, every old-map save/drop migration, old cross-road obstruction, catalog grouping and exact atomic bulk transactions. Existing eight-raid balance, combat animation, saves, party, items, selling, NPC and installation checks still pass.
- Isolated browser session loaded all twelve new map images. Portrait playfield measured 759.59px of an 844px viewport (90%). No horizontal page overflow at 390px or 320px widths; a 320px shop dialog measured 286px client/scroll width and had usable quantity controls.
- Actual touch guide: traveler followed the village ring to the elder, then entered the convenience store and walked to its counter. Buying three potions changed coins from 320 to 185 and potion quantity from 4 to 7.
- Prepared level-20 shop save: buying three matching weapons charged 4,338 coins once, stored three copies and applied one copy's bonuses. Level/grade selection stayed within one family card.
- Actual named east-exit navigation took the traveler from Yeondu to Mistpine at the reciprocal road entrance (160,970), without bouncing back.
- Actual crystal-gorge guide reached the raid entrance through its winding route.
- Completed quest history was closed on load, opened to show the claimed quest, and closed again while the active thief quest stayed visible.

Prepared local save fixtures were used for advanced regions and inventory scenarios. No public player saves were changed during verification.
