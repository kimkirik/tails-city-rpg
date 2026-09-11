# Adventure expansion verification — 2026-09-12

## Automated validation

- 57 Node tests pass; TypeScript compilation passes.
- Every open field gate has a reciprocal destination and lands on walkable ground. Every closed boundary and rendered barrier blocks movement.
- The production touch pathfinder reaches every interactive entity in all six field maps and all six caves.
- Solo actions produce one actor/strike; owner and both pet selections are tested. Team attack requires turn3+, a living traveler and dog, occurs once per battle, spends two turns and produces two counters if the enemy survives.
- Staged HP matches authoritative damage at impacts; duplicate input cannot award another attack or reward. Defeat clips truncate subsequent strikes.
- Store-specific catalogs, bags through1000 slots, equipment bonuses, charm recruitment, upgrades capped at20, healing targets, poison and revival are validated. Failed purchases or claims do not partially consume money or items.
- NPC prerequisites, information gathering, guarded cages, unique boss identities, final-boss gating, reward claims, reentry and old-save migration are validated.
- The original captain campaign and all six raids can be completed using starting companions and earned supplies. No real-player saves are modified by tests.

## Browser checks

An isolated Chromium session exercised the local game. Desktop1366×900, mobile390×844, small mobile320×568 and landscape844×390 were inspected. The viewport does not overflow horizontally or vertically; the portrait playfield is90% of the screen height (759.6 of844 pixels).

- Touch recruitment added 구름 and consumed one treat; arrow-key travel moved the player and followers.
- Solo Richi and solo traveler scenes show only the acting ally. A team scene shows the traveler and both dogs. A surviving dragon took84 team damage; the turn advanced from4 to6, both counterattacks appeared in the log, and repeat team attack was disabled.
- Cave entry and movement, guardians, dragon art, breath warning and guard effect were inspected. A dragon clipping issue was fixed by bounding the rendered size and position.
- A closed northern gate physically stopped held movement at y198.25; the visible barrier is at y176. Open-gate traversal is also covered by pathfinder/model checks.
- Village NPC dialogue and quest acceptance worked. The active quest appeared in the field tracker.
- Convenience-store entrance/door transition, indoor arrow movement, counter interaction and category tabs worked. A1000-slot bag cost10000 coins once, kept the original contents and rendered30 cells per page; the second page showed slots31–60.
- Armory weapon, clothing and accessory tabs and purchases were exercised. Owned equipment buttons became disabled and real equipped state updated.
- Manual save, downloaded JSON export and JSON upload worked. The exported save contained capacity1000, exactly1000 bag entries,10000 coins after the bag purchase, and the accepted quest. Separate fixtures targeted bosses and boundaries.
- Selecting a full-health healing target left the inventory open and consumed neither item nor turn; selecting injured Richi consumed one potion/turn and returned to battle.
- Optional WebMCP read/panel tools worked in the QA browser. No browser page errors were reported.

## Balance changes from playthrough findings

The first raid simulation reached42 actions and27 healing actions at the final dragon. Boss HP/damage and dog level-based defense were adjusted. The same policy now clears guardians in3–4 actions and dragons in9,12,12,12,13,15 actions, using1–5 heals per dragon. This policy deliberately uses the starter as the main solo actor, affordable equipment, earned loot, guarded breath turns and one team attack. Other play styles and equipment choices change the outcome.

A small-screen layout issue put action labels into a narrow leftover icon column. Compact buttons now use a vertical flex layout; the entire battle, actor selectors and all six actions fit at320×568. Landscape keeps the scene and actor/enemy status separate from the action buttons.

Native OS installation and subjective long-term enjoyment were not measured. Existing music/install tests are retained. There is no offline cache; saves remain local to each browser/device.
