# Equipment and wildlife expansion

- Seven slots: weapon, top, pants, necklace, earrings, cape, and ornament. Status offers a direct equipment shortcut, per-slot effects, and unequip controls; inventory can re-equip or unequip. Equipment remains in inventory, including when every slot is occupied.
- Added 1,200 level 1–100 recipes: 400 shop items, 400 monster drops, 400 raid drops. Original 10,000 definitions retain identical IDs, names, effects, prices, and acquisition sources (SHA-256 regression check).
- Legacy saves gain four empty slots. Equip/unequip immediately autosaves; sales, refunds, combat purchase use, HP limits, and load validation cover all slots. Equipping does not heal; under-level gear and in-combat changes are blocked.
- Two additional wildlife encounters in each of eight combat areas (16 total). Six creature types reuse the existing creature artwork and have telegraphed special attacks with effects. Towns remain free of combat. Ordinary wildlife cannot drop raid-exclusive items.

## Verification

- 106 game tests passed; TypeScript and whitespace checks passed.
- Campaign simulation starts with new-game supplies and earns its upgrades, clears all eight raids and unlocks the ending. Movement between encounters is simulated; this is not a manual full campaign run. Boss fights took 6–7 actions with the existing three-slot strategy.
- Browser playthrough at 390×844: new game → elder quest → armory through touch navigation → buy weapon, pants and necklace → status unequip → inventory re-equip → leave shop → travel to park → fight new slime with the traveler → see turn-three special warning → guard → win and collect loot.
- Verified immediate saved equipment data, all seven slot labels, mobile tab wrapping, and equipment readability at 390×844 and 1280×800. No browser runtime errors observed.
