import { ITEMS } from './content.ts';
import type { GameState } from './model.ts';

export const REFUND_WINDOW_MS = 10 * 60 * 1000;
export const MAX_PURCHASE_RECORDS = 500;
export type Purchase = {
  id: string;
  item: string;
  qty: number;
  remaining: number;
  refunded: number;
  unitPrice: number;
  purchasedAt: number;
  previousCapacity?: number;
  previousEquipment?: string | null;
  hpGranted: number;
};

export function refundStatus(
  s: GameState,
  purchase: Purchase,
  now = Date.now(),
) {
  const seconds = Math.max(
    0,
    Math.min(
      600,
      Math.ceil((purchase.purchasedAt + REFUND_WINDOW_MS - now) / 1000),
    ),
  );
  let reason = '';
  const item = ITEMS[purchase.item];
  if (!purchase.remaining)
    reason = purchase.refunded ? '취소 완료' : '사용·판매 완료';
  else if (now < purchase.purchasedAt) reason = '기기 시간을 확인해 주세요.';
  else if (now >= purchase.purchasedAt + REFUND_WINDOW_MS)
    reason = '10분 기한 만료';
  else if (item.capacity) {
    if (s.capacity !== item.capacity)
      reason = '나중에 확장한 가방부터 취소해 주세요.';
    else if (s.bag.filter(Boolean).length > purchase.previousCapacity!)
      reason = `가방을 ${purchase.previousCapacity}칸 이하로 정리해 주세요.`;
  } else if (
    s.bag.reduce(
      (n, slot) => n + (slot?.item === purchase.item ? slot.qty : 0),
      0,
    ) < purchase.remaining
  )
    reason = '반환할 아이템이 부족해요.';
  const coins = purchase.remaining * purchase.unitPrice;
  if (!reason && s.coins + coins > 99999999)
    reason = '보유 코인 한도를 넘어요.';
  return {
    seconds,
    reason,
    qty: purchase.remaining,
    coins,
    available: !reason,
  };
}

// Untracked stock is used first; purchased units lose return rights as they are used.
export function consumePurchaseRights(s: GameState, item: string, qty: number) {
  const records = s.purchases.filter((p) => p.item === item && p.remaining);
  const total = s.bag.reduce(
    (n, slot) => n + (slot?.item === item ? slot.qty : 0),
    0,
  );
  let used = Math.max(
    0,
    qty - (total - records.reduce((n, p) => n + p.remaining, 0)),
  );
  for (const record of records) {
    const amount = Math.min(used, record.remaining);
    record.remaining -= amount;
    if (amount) record.hpGranted = 0;
    used -= amount;
    if (!used) break;
  }
}

export function retainedPurchases(records: Purchase[], now: number) {
  return records.filter(
    (p, i) =>
      (p.remaining > 0 && now < p.purchasedAt + REFUND_WINDOW_MS) ||
      i >= records.length - 20,
  );
}
