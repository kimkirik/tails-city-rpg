'use client';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { ITEM_ENTRIES } from '@/lib/game/content';
import { RARITIES, ITEM_SOURCES } from '@/lib/game/item-catalog';
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
  RAID_LIST,
  REGIONS,
  heroStats,
  questProgress,
  countItem,
  sellPrice,
  actorName,
  partyDogs,
  type GameState,
  type Action,
  type Result,
} from '@/lib/game/model';
function ItemLevel({ item }: { item: (typeof ITEMS)[string] }) {
  return (
    <span className={`item-level rarity-${item.rarity}`}>
      Lv.{item.level} · {RARITIES[item.rarity]} · {ITEM_SOURCES[item.source]}
    </span>
  );
}
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
              <ItemLevel item={item} />
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
  const [mode, setMode] = useState('buy');
  const [search, setSearch] = useState(''),
    [page, setPage] = useState(0),
    [scope, setScope] = useState('available');
  const stats = heroStats(s);
  const items = useMemo(
    () =>
      ITEM_ENTRIES.filter(
        ([id, item]) =>
          item.shop === s.shopType &&
          (mode === 'loot' ? item.source !== 'shop' : item.source === 'shop') &&
          (scope === 'all' || item.level <= s.hero.level) &&
          (!search.trim() ||
            `${item.name} ${item.desc} ${RARITIES[item.rarity]}`.includes(
              search.trim(),
            )) &&
          (armory
            ? item.slot === category
            : category === 'bags'
              ? !!item.capacity
              : category === 'boost'
                ? !!item.boost
                : !item.capacity && !item.boost),
      ).sort(
        ([a, ai], [b, bi]) =>
          bi.level - ai.level ||
          Number(b.startsWith('gear-')) - Number(a.startsWith('gear-')),
      ),
    [s.shopType, s.hero.level, scope, search, armory, category, mode],
  );
  const pages = Math.max(1, Math.ceil(items.length / 12)),
    safePage = Math.min(page, pages - 1);
  return (
    <>
      <Tabs
        value={mode}
        onValueChange={(v) => {
          setMode(String(v));
          setPage(0);
          setCategory(armory ? 'weapon' : 'supplies');
        }}
      >
        <TabsList className="shop-mode-tabs" aria-label="상점 거래 선택">
          <TabsTrigger value="buy">사기</TabsTrigger>
          <TabsTrigger value="sell">팔기</TabsTrigger>
          <TabsTrigger value="loot">전리품 도감</TabsTrigger>
        </TabsList>
      </Tabs>
      {mode !== 'sell' && (
        <div className="shop-toolbar">
          <Tabs
            value={category}
            onValueChange={(v) => {
              setCategory(String(v));
              setPage(0);
            }}
          >
            <TabsList>
              {categories
                .filter(([id]) =>
                  mode === 'loot' ? id !== 'bags' : id !== 'boost',
                )
                .map(([id, name]) => (
                  <TabsTrigger key={id} value={id}>
                    {name}
                  </TabsTrigger>
                ))}
            </TabsList>
          </Tabs>
        </div>
      )}
      {mode !== 'sell' && (
        <div className="catalog-search">
          <Input
            aria-label="상점 아이템 검색"
            placeholder="이름·효과·등급 검색"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
          <Select
            value={scope}
            onValueChange={(v) => {
              setScope(String(v));
              setPage(0);
            }}
          >
            <SelectTrigger aria-label="상품 레벨 범위">
              <SelectValue>
                {scope === 'available' ? '내 레벨 상품' : '모든 레벨'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">내 레벨 상품</SelectItem>
              <SelectItem value="all">모든 레벨</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="shop-summary">
        Lv.{s.hero.level} · ◈ {s.coins.toLocaleString()} ·{' '}
        {armory
          ? `공격 ${stats.attack} / 방어 ${stats.defense} / 매력 ${stats.charm}`
          : `가방 ${s.bag.filter(Boolean).length} / ${s.capacity}칸`}
      </div>
      {mode === 'sell' ? (
        <SellItems state={s} onAction={onAction} />
      ) : (
        <div className="shop-items">
          {items.slice(safePage * 12, safePage * 12 + 12).map(([id, item]) => {
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
                  <ItemLevel item={item} />
                  <p>{item.desc}</p>
                  {mode === 'loot' && (
                    <p className="loot-acquisition">
                      {item.source === 'raid'
                        ? '동굴 수문장·드래곤'
                        : '전투 지역 몬스터'}
                      <br />
                      무작위 획득 · 상점 판매 안 함
                    </p>
                  )}
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
                {mode !== 'loot' && (
                  <button
                    className="primary-button"
                    disabled={
                      owned || s.coins < item.price || s.hero.level < item.level
                    }
                    onClick={() => onAction({ type: 'buy', id })}
                  >
                    ◈ {item.price.toLocaleString()}
                    <small>
                      {s.hero.level < item.level
                        ? `Lv.${item.level} 필요`
                        : owned
                          ? '보유 중'
                          : item.capacity
                            ? '구입 · 확장'
                            : item.slot
                              ? '구입 · 장착'
                              : '1개 구입'}
                    </small>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      {mode !== 'sell' && (
        <div className="bag-pagination catalog-pagination">
          <button
            aria-label="이전 상품 페이지"
            disabled={safePage === 0}
            onClick={(e) => {
              setPage(safePage - 1);
              e.currentTarget
                .closest('[role=dialog]')
                ?.querySelector('.shop-items')
                ?.scrollIntoView({ block: 'start' });
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <span>
            {items.length.toLocaleString()}종 · {safePage + 1} / {pages} 페이지
          </span>
          <button
            aria-label="다음 상품 페이지"
            disabled={safePage >= pages - 1}
            onClick={(e) => {
              setPage(safePage + 1);
              e.currentTarget
                .closest('[role=dialog]')
                ?.querySelector('.shop-items')
                ?.scrollIntoView({ block: 'start' });
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
      {mode !== 'sell' && !items.length && (
        <p className="shop-empty">
          조건에 맞는 상품이 없어요. 검색어나 레벨 범위를 바꿔 보세요.
        </p>
      )}
      <p className="shop-note">
        {mode === 'sell'
          ? '두 상점 모두 아이템을 구매가의 50%에 매입합니다(소수점 버림). 확장한 가방은 판매되지 않아요.'
          : mode === 'loot'
            ? '추가 전리품 확률: 일반 몬스터 18% · 대장 45%. 레이드 전용: 수문장 10% · 드래곤 80%. 내 레벨과 적 레벨 이하 아이템 중 무작위 1종. 회복 물품은 별도 지급.'
            : '상점은 기본 보급품과 일반 장비를 판매해요. 희귀 장비·강화제는 전리품 도감에서 획득처를 확인하세요.'}
      </p>
    </>
  );
}
function SellItems({ state: s, onAction }: Props) {
  const [page, setPage] = useState(0),
    [search, setSearch] = useState('');
  const owned = [
    ...new Set(s.bag.flatMap((slot) => (slot ? [slot.item] : []))),
  ].filter((id) => sellPrice(id) > 0 && ITEMS[id].name.includes(search.trim()));
  const pages = Math.max(1, Math.ceil(owned.length / 12)),
    safePage = Math.min(page, pages - 1);
  return (
    <div className="shop-items" aria-label="판매할 소지품">
      <Input
        aria-label="판매 아이템 검색"
        placeholder="판매할 아이템 찾기"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0);
        }}
      />
      {owned.length ? (
        owned
          .slice(safePage * 12, safePage * 12 + 12)
          .map((id) => (
            <SellItem key={id} id={id} state={s} onAction={onAction} />
          ))
      ) : (
        <p className="shop-empty">
          판매할 아이템이 없어요. 검색어와 소지품을 확인하세요.
        </p>
      )}
      <div className="bag-pagination">
        <button
          aria-label="이전 판매 페이지"
          disabled={!safePage}
          onClick={() => setPage(safePage - 1)}
        >
          <ChevronLeft size={18} />
        </button>
        <span>
          {safePage + 1} / {pages} 페이지
        </span>
        <button
          aria-label="다음 판매 페이지"
          disabled={safePage + 1 >= pages}
          onClick={() => setPage(safePage + 1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
function SellItem({ id, state: s, onAction }: Props & { id: string }) {
  const [quantity, setQuantity] = useState('1');
  const item = ITEMS[id],
    owned = countItem(s, id),
    price = sellPrice(id);
  const qty = quantity === '' ? 0 : Math.min(Number(quantity), owned);
  const valid = Number.isInteger(qty) && qty > 0;
  const equipped =
    s.weapon === id ||
    s.equipment.clothes === id ||
    s.equipment.accessory === id;
  return (
    <article className="shop-item shop-sell-item">
      <span aria-hidden="true">{item.icon}</span>
      <div className="sell-description">
        <h3>{item.name}</h3>
        <ItemLevel item={item} />
        <p>
          보유 {owned}개 · 개당 ◈ {price.toLocaleString()}
        </p>
        {equipped && (
          <small className="sell-equipped">
            장착 중 · 마지막 1개 판매 시 장착 해제
          </small>
        )}
      </div>
      <div className="sell-controls">
        <label>
          수량
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={owned}
            step={1}
            aria-label={`${item.name} 판매 수량`}
            value={quantity === '' ? '' : qty}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </label>
        <button
          className="sell-max"
          aria-label={`${item.name} 최대 수량 선택`}
          onClick={() => setQuantity(String(owned))}
        >
          최대
        </button>
        <button
          className="primary-button"
          disabled={!valid}
          onClick={() => {
            const result = onAction({ type: 'sell', id, qty });
            if (countItem(result.state, id) < owned) setQuantity('1');
          }}
          aria-label={`${item.name} ${valid ? qty : 0}개 판매`}
        >
          <span>+◈ {(valid ? qty * price : 0).toLocaleString()}</span>
          <small>{valid ? qty : 0}개 팔기</small>
        </button>
      </div>
    </article>
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
          <h3>
            {npc.name} · Lv.{npc.level}
          </h3>
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
          <b>
            {s.rescued.length} / {RAID_LIST.length}
          </b>
          구조한 고양이
        </span>
        <span>
          <b>
            {s.raids.length} / {RAID_LIST.length}
          </b>
          해방한 드래곤
        </span>
      </div>
      <h3>마을의 부탁</h3>
      <p>의뢰 수락과 보상 수령은 연두 마을 주민에게 직접 말을 걸어 주세요.</p>
      {QUESTS.filter((q) => !q.id.startsWith('raid-')).map((q) => (
        <QuestCard key={q.id} id={q.id} state={s} onAction={onAction} />
      ))}
      <h3>여덟 용의 신호</h3>
      {RAID_LIST.map((raid) => (
        <div className="raid-journal" key={raid.name}>
          <div
            className="dragon-portrait"
            style={{
              backgroundImage: 'url(/art/raids/dragons.png)',
              backgroundSize: '300% 200%',
              backgroundPosition: `${((raid.sprite % 3) / 2) * 100}% ${Math.floor(raid.sprite / 3) * 100}%`,
            }}
          />
          <div>
            <strong>
              {raid.boss} {s.raids.includes(raid.region) && <Check size={15} />}
            </strong>
            <p>
              {REGIONS[raid.region].name} · {raid.name}
            </p>
            <small>{raid.hint}</small>
          </div>
        </div>
      ))}
      {QUESTS.filter((q) => q.id.startsWith('raid-')).map((q) => (
        <QuestCard key={q.id} id={q.id} state={s} onAction={onAction} />
      ))}
      {s.raids.length === RAID_LIST.length && (
        <div className="ending">
          <h3>여덟 용이 자유를 되찾았어요.</h3>
          <p>친구들과의 산책은 계속됩니다!</p>
        </div>
      )}
    </div>
  );
}
