'use client';
import { ITEMS, type Action, type GameState } from '@/lib/game/model';
import { EQUIPMENT_SLOTS, equippedItem } from '@/lib/game/equipment-slots';
import { RARITIES } from '@/lib/game/item-catalog';

export default function EquipmentPanel({
  state,
  onAction,
  onBag,
}: {
  state: GameState;
  onAction: (action: Action) => unknown;
  onBag: () => void;
}) {
  return (
    <section className="equipment-panel" aria-label="부위별 장착 장비">
      <div className="equipment-heading">
        <strong>착용 장비</strong>
        <button onClick={onBag}>가방에서 장착</button>
      </div>
      <p>
        {state.battle
          ? '전투가 끝나면 장비를 변경할 수 있어요.'
          : '해제한 장비는 가방에 남아요. 최대 HP가 줄면 현재 HP도 조정돼요.'}
      </p>
      <div className="equipment-slots">
        {EQUIPMENT_SLOTS.map((slot) => {
          const id = equippedItem(state, slot.id);
          const item = id ? ITEMS[id] : null;
          return (
            <article
              className={`equipment-slot ${item ? 'occupied' : 'empty'}`}
              key={slot.id}
              aria-label={`${slot.name} 장비`}
            >
              <span
                className={`equipment-icon rarity-${item?.rarity ?? 0}`}
                aria-hidden="true"
              >
                {item?.icon ?? slot.icon}
              </span>
              <div className="equipment-description">
                <span className="equipment-part">{slot.name}</span>
                <strong>{item?.name ?? '미착용'}</strong>
                {item && (
                  <>
                    <small>
                      Lv.{item.level} · {RARITIES[item.rarity]}
                    </small>
                    <p>{item.desc}</p>
                  </>
                )}
              </div>
              {item && (
                <button
                  className="equipment-remove"
                  disabled={!!state.battle}
                  aria-label={`${slot.name} ${item.name} 해제`}
                  onClick={() => onAction({ type: 'unequip', slot: slot.id })}
                >
                  해제
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
