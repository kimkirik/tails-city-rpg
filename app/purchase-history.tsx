'use client';
import { useEffect, useState } from 'react';
import { Clock3, RotateCcw } from 'lucide-react';
import {
  ITEMS,
  type GameState,
  type Action,
  type Result,
} from '@/lib/game/model';
import {
  REFUND_WINDOW_MS,
  refundStatus,
  type Purchase,
} from '@/lib/game/purchases';

export default function PurchaseHistory({
  state,
  onAction,
}: {
  state: GameState;
  onAction: (action: Action) => Result;
}) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const recent = [...state.purchases].reverse();
  const current = recent.filter(
    (p) => p.remaining > 0 && now < p.purchasedAt + REFUND_WINDOW_MS,
  );
  const past = recent.filter((p) => !current.includes(p));
  const receipt = (p: Purchase) => {
    const item = ITEMS[p.item],
      status = refundStatus(state, p, now);
    return (
      <article className="purchase-receipt" key={p.id}>
        <div className="receipt-item">
          <span aria-hidden="true">{item.icon}</span>
          <div>
            <h3>{item.name}</h3>
            <p>
              {p.qty}개 구매 · 개당 ◈ {p.unitPrice.toLocaleString()}
            </p>
            <small>
              {new Date(p.purchasedAt).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              · {item.shop === 'armory' ? '무기상' : '편의점'}
            </small>
          </div>
        </div>
        {p.remaining > 0 && status.seconds > 0 && (
          <p className="receipt-countdown">
            <Clock3 size={15} /> 취소 가능 시간{' '}
            {Math.floor(status.seconds / 60)}:
            {String(status.seconds % 60).padStart(2, '0')}
            {p.remaining < p.qty && ` · 미사용 ${p.remaining}개`}
          </p>
        )}
        {status.reason && <p className="receipt-reason">{status.reason}</p>}
        {p.refunded > 0 && (
          <p className="refund-guide">
            {p.refunded}개 취소 · ◈{' '}
            {(p.refunded * p.unitPrice).toLocaleString()} 환불 완료
          </p>
        )}
        {p.remaining > 0 && status.seconds > 0 && (
          <button
            className="primary-button"
            disabled={!status.available}
            aria-label={`${item.name} ${p.remaining}개 구매 취소`}
            onClick={() => {
              onAction({ type: 'refund', id: p.id });
              setNow(Date.now());
            }}
          >
            <RotateCcw size={16} />
            {p.remaining}개 취소 · ◈ {status.coins.toLocaleString()} 환불
          </button>
        )}
      </article>
    );
  };
  return (
    <section className="purchase-history" aria-label="최근 구매 내역과 취소">
      <p className="refund-guide">
        구매 후 10분 안에 미사용 수량을 반환하면 결제한 코인을 전액 돌려받아요.
        두 상점 어디서든 취소할 수 있어요.
      </p>
      {current.length ? (
        current.map(receipt)
      ) : (
        <p className="shop-empty">지금 취소할 수 있는 구매가 없어요.</p>
      )}
      {!!past.length && (
        <details className="past-purchases">
          <summary>지난 거래 {past.length}건</summary>
          {past.map(receipt)}
        </details>
      )}
      {!recent.length && (
        <p className="refund-guide">새로 구매한 내역부터 여기에 기록됩니다.</p>
      )}
      <p className="refund-guide">
        사용·판매한 수량과 전투에 사용한 장비는 제외돼요. 가방은 나중에 확장한
        것부터, 이전 크기에 아이템이 모두 들어갈 때 취소할 수 있어요. 장비 취소
        시 장착 상태와 구입 당시 받은 체력 보너스도 되돌립니다.
      </p>
    </section>
  );
}
