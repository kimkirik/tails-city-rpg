'use client';
import { useState } from 'react';
import {
  Backpack,
  Check,
  ChevronLeft,
  ChevronRight,
  Coins,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  ITEMS,
  NPCS,
  QUESTS,
  RAIDS,
  REGIONS,
  heroStats,
  questProgress,
  countItem,
  actorName,
  partyDogs,
  type GameState,
  type Action,
  type Result,
} from '@/lib/game/model';
type Props = { state: GameState; onAction: (a: Action) => Result };
export function Inventory({
  state: s,
  onAction,
  onClose,
}: { onClose: () => void } & Props) {
  const [filter, setFilter] = useState('all'),
    [page, setPage] = useState(0),
    [selected, setSelected] = useState(0),
    [target, setTarget] = useState(s.battle?.actor ?? s.active);
  const entries = s.bag
    .map((slot, index) => ({ slot, index }))
    .filter(
      ({ slot }) =>
        filter === 'all' ||
        (slot &&
          (filter === 'gear'
            ? !!ITEMS[slot.item].slot
            : filter === 'heal'
              ? !!(ITEMS[slot.item].heal || ITEMS[slot.item].antidote)
              : !ITEMS[slot.item].slot &&
                !ITEMS[slot.item].heal &&
                !ITEMS[slot.item].antidote)),
    );
  const pages = Math.max(1, Math.ceil(entries.length / 30)),
    safePage = Math.min(page, pages - 1),
    slot = s.bag[selected],
    item = slot ? ITEMS[slot.item] : null,
    stats = heroStats(s),
    targets = s.battle ? partyDogs(s) : s.dogs;
  const equipped =
    slot &&
    (s.weapon === slot.item ||
      s.equipment.clothes === slot.item ||
      s.equipment.accessory === slot.item);
  return (
    <>
      <div className="bag-toolbar">
        <Tabs
          value={filter}
          onValueChange={(v) => {
            setFilter(String(v));
            setPage(0);
          }}
        >
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="heal">회복</TabsTrigger>
            <TabsTrigger value="gear">장비</TabsTrigger>
            <TabsTrigger value="other">기타</TabsTrigger>
          </TabsList>
        </Tabs>
        <span>
          <Coins size={16} />
          {s.coins}
        </span>
      </div>
      <div className="bag-layout">
        <div>
          <div className="bag-grid">
            {entries
              .slice(safePage * 30, safePage * 30 + 30)
              .map(({ slot, index }) => (
                <button
                  className={`bag-slot ${selected === index ? 'selected' : ''}`}
                  key={index}
                  onClick={() => setSelected(index)}
                  aria-label={
                    slot
                      ? `${index + 1}번 칸 ${ITEMS[slot.item].name} ${slot.qty}개`
                      : `${index + 1}번 빈 칸`
                  }
                >
                  <small>{index + 1}</small>
                  {slot && (
                    <>
                      <span>{ITEMS[slot.item].icon}</span>
                      <b>{slot.qty}</b>
                    </>
                  )}
                </button>
              ))}
          </div>
          {entries.length === 0 && <p>이 종류의 아이템이 없어요.</p>}
          <div className="bag-pagination">
            <button
              aria-label="이전 가방 페이지"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            <span>
              {safePage + 1} / {pages} 페이지
            </span>
            <button
              aria-label="다음 가방 페이지"
              disabled={safePage >= pages - 1}
              onClick={() => setPage(safePage + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="item-details">
          {slot && item ? (
            <>
              <div className="item-visual">{item.icon}</div>
              <h3>{item.name}</h3>
              <p>{item.desc}</p>
              {item.slot ? (
                <p className="equipment-tag">
                  {equipped
                    ? '현재 장착 중'
                    : '보유 장비 · 장착하면 능력치가 바뀝니다'}
                </p>
              ) : (
                <div className="item-target">
                  <label>사용 대상</label>
                  <Select
                    value={target}
                    onValueChange={(v) => setTarget(String(v))}
                  >
                    <SelectTrigger aria-label="아이템 사용 대상">
                      <SelectValue>{actorName(s, target)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="traveler">
                        {s.playerName} · HP {s.hero.hp}/{stats.maxHp}
                      </SelectItem>
                      {targets.map((d) => (
                        <SelectItem value={d.id} key={d.id}>
                          {d.name} · HP {d.hp}/{d.maxHp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <button
                className="primary-button"
                disabled={!!equipped || !!(item.slot && s.battle)}
                onClick={() => {
                  const result = onAction({
                    type: 'item',
                    id: slot.item,
                    target,
                  });
                  if (s.battle && result.state.battle?.turn !== s.battle.turn)
                    onClose();
                }}
              >
                {item.slot
                  ? equipped
                    ? '장착 중'
                    : '장착하기'
                  : s.battle
                    ? '사용하기 · 1턴'
                    : '사용하기'}
              </button>
            </>
          ) : (
            <div className="empty-item">
              <Backpack size={36} />
              <p>아이템을 선택하세요.</p>
            </div>
          )}
        </div>
      </div>
      <div className="inventory-footer">
        <Backpack size={20} />
        <span>
          {s.bag.filter(Boolean).length} / {s.capacity}칸 · 편의점에서 최대
          1000칸 가방 구입
        </span>
      </div>
    </>
  );
}
export function Shop({ state: s, onAction }: Props) {
  const armory = s.shopType === 'armory',
    categories = armory
      ? [
          ['weapon', '무기'],
          ['clothes', '옷'],
          ['accessory', '액세서리'],
        ]
      : [
          ['supplies', '회복·간식'],
          ['bags', '가방'],
          ['boost', '강화'],
        ];
  const [category, setCategory] = useState(armory ? 'weapon' : 'supplies');
  const stats = heroStats(s);
  const items = Object.entries(ITEMS).filter(
    ([, item]) =>
      item.shop === s.shopType &&
      (armory
        ? item.slot === category
        : category === 'bags'
          ? !!item.capacity
          : category === 'boost'
            ? !!item.boost
            : !item.capacity && !item.boost),
  );
  return (
    <>
      <div className="shop-toolbar">
        <Tabs value={category} onValueChange={(v) => setCategory(String(v))}>
          <TabsList>
            {categories.map(([id, name]) => (
              <TabsTrigger key={id} value={id}>
                {name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="shop-summary">
        ◈ {s.coins.toLocaleString()} ·{' '}
        {armory
          ? `공격 ${stats.attack} / 방어 ${stats.defense} / 매력 ${stats.charm}`
          : `가방 ${s.bag.filter(Boolean).length} / ${s.capacity}칸`}
      </div>
      <div className="shop-items">
        {items.map(([id, item]) => {
          const owned = item.capacity
            ? s.capacity >= item.capacity
            : !!item.slot && countItem(s, id) > 0;
          const current = item.slot
            ? item.slot === 'weapon'
              ? s.weapon
              : s.equipment[item.slot]
            : null;
          const before = current ? ITEMS[current] : null;
          return (
            <div className="shop-item" key={id}>
              <span>{item.icon}</span>
              <div>
                <h3>{item.name}</h3>
                <p>{item.desc}</p>
                {item.slot ? (
                  <small>
                    {current ? `현재: ${before!.name}` : '현재: 미착용'}
                    {item.attack
                      ? ` · 공격 변화 ${item.attack - (before?.attack ?? 0) >= 0 ? '+' : ''}${item.attack - (before?.attack ?? 0)}`
                      : ''}
                  </small>
                ) : (
                  <small>
                    {item.capacity
                      ? `현재 ${s.capacity}칸 → ${Math.max(s.capacity, item.capacity)}칸`
                      : `보유 ${countItem(s, id)}개`}
                  </small>
                )}
              </div>
              <button
                className="primary-button"
                disabled={owned || s.coins < item.price}
                onClick={() => onAction({ type: 'buy', id })}
              >
                ◈ {item.price.toLocaleString()}
                <small>
                  {owned
                    ? '보유 중'
                    : item.capacity
                      ? '구입 · 확장'
                      : item.slot
                        ? '구입 · 장착'
                        : '1개 구입'}
                </small>
              </button>
            </div>
          );
        })}
      </div>
      <p className="shop-note">
        {armory
          ? '장비는 능력치를 올립니다. 외모·옷 꾸미기는 상태 창에서 자유롭게 바꿀 수 있어요.'
          : '큰 가방은 구입 즉시 확장되며 기존 아이템을 그대로 보관합니다.'}
      </p>
    </>
  );
}
function QuestCard({
  id,
  state: s,
  onAction,
  atNpc = false,
}: Props & { id: string; atNpc?: boolean }) {
  const q = QUESTS.find((q) => q.id === id)!,
    progress = questProgress(s, id),
    status = s.quests[id],
    locked = q.requires && s.quests[q.requires] !== 'claimed',
    complete = progress >= q.goal;
  return (
    <article
      className={`quest-card ${status === 'claimed' ? 'quest-claimed' : ''}`}
    >
      <div className="quest-card-heading">
        <strong>{q.title}</strong>
        <span>
          {status === 'claimed'
            ? '완료'
            : status === 'active'
              ? complete
                ? '보상 받기'
                : '진행 중'
              : locked
                ? '다음 이야기'
                : '새 의뢰'}
        </span>
      </div>
      <p>{q.description}</p>
      <Progress value={(progress / q.goal) * 100} />
      <div className="quest-card-meta">
        <span>
          {progress} / {q.goal} · {NPCS.find((n) => n.id === q.npc)!.name}
        </span>
        <strong>
          ◈ {q.coins} · 매력 +{q.charm}
        </strong>
      </div>
      {q.items.length > 0 && (
        <p className="quest-loot">
          {q.items
            .map((i) => `${ITEMS[i.item].icon} ${ITEMS[i.item].name} ×${i.qty}`)
            .join(' · ')}
        </p>
      )}
      {atNpc && status !== 'claimed' && (
        <button
          className="primary-button"
          disabled={!!locked || (status === 'active' && !complete)}
          onClick={() => onAction({ type: 'quest', id })}
        >
          {locked
            ? '이전 의뢰를 먼저 완료'
            : !status
              ? '의뢰 수락'
              : complete
                ? '보상 받기'
                : '진행 중'}
        </button>
      )}
    </article>
  );
}
export function NpcConversation({ state: s, onAction }: Props) {
  const npc = NPCS.find((n) => n.id === s.npc);
  if (!npc) return null;
  return (
    <div className="npc-conversation">
      <div className="npc-dialogue">
        <div
          className="npc-portrait"
          style={{
            backgroundImage: 'url(/art/raids/creatures-npcs.png)',
            backgroundSize: '400% 300%',
            backgroundPosition: `${((npc.sprite % 4) / 3) * 100}% ${(Math.floor(npc.sprite / 4) / 2) * 100}%`,
          }}
        />
        <div>
          <h3>{npc.name}</h3>
          <p>{npc.line}</p>
        </div>
      </div>
      {QUESTS.filter((q) => q.npc === npc.id).map((q) => (
        <QuestCard key={q.id} id={q.id} state={s} onAction={onAction} atNpc />
      ))}
    </div>
  );
}
export function QuestJournal({
  state: s,
  onAction,
  onClose,
}: Props & { onClose: () => void }) {
  return (
    <div className="journal-content">
      <div className="story-intro">
        <span>THE SIGNAL COLLARS</span>
        <h3>사라진 목줄의 비밀</h3>
        <p>
          검은 목줄단이 도시의 동물과 여섯 용을 붙잡았습니다. 마을 주민에게
          단서를 모으고 도난 물자를 되찾아, 동굴의 봉인을 풀어 주세요.
        </p>
        <button
          className="primary-button"
          disabled={!s.visited.includes(1) || s.place !== 'field'}
          onClick={() => {
            onAction({ type: 'travel', region: 1 });
            onClose();
          }}
        >
          연두 마을로 돌아가기
        </button>
        {!s.visited.includes(1) && (
          <p>공원 동쪽 길을 따라가면 연두 마을에 도착해요.</p>
        )}
      </div>
      <div className="journal-stats">
        <span>
          <b>
            {Object.values(s.quests).filter((v) => v === 'claimed').length} /{' '}
            {QUESTS.length}
          </b>
          완료한 의뢰
        </span>
        <span>
          <b>{s.rescued.length} / 6</b>구조한 고양이
        </span>
        <span>
          <b>{s.raids.length} / 6</b>해방한 드래곤
        </span>
      </div>
      <h3>마을의 부탁</h3>
      <p>의뢰 수락과 보상 수령은 연두 마을 주민에게 직접 말을 걸어 주세요.</p>
      {QUESTS.filter((q) => !q.id.startsWith('raid-')).map((q) => (
        <QuestCard key={q.id} id={q.id} state={s} onAction={onAction} />
      ))}
      <h3>여섯 용의 신호</h3>
      {RAIDS.map((raid, i) => (
        <div className="raid-journal" key={raid.name}>
          <div
            className="dragon-portrait"
            style={{
              backgroundImage: 'url(/art/raids/dragons.png)',
              backgroundSize: '300% 200%',
              backgroundPosition: `${((i % 3) / 2) * 100}% ${Math.floor(i / 3) * 100}%`,
            }}
          />
          <div>
            <strong>
              {raid.boss} {s.raids.includes(i) && <Check size={15} />}
            </strong>
            <p>
              {REGIONS[i].name} · {raid.name}
            </p>
            <small>{raid.hint}</small>
          </div>
        </div>
      ))}
      {QUESTS.filter((q) => q.id.startsWith('raid-')).map((q) => (
        <QuestCard key={q.id} id={q.id} state={s} onAction={onAction} />
      ))}
      {s.raids.length === 6 && (
        <div className="ending">
          <h3>여섯 용이 자유를 되찾았어요.</h3>
          <p>친구들과의 산책은 계속됩니다!</p>
        </div>
      )}
    </div>
  );
}
