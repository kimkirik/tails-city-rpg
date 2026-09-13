'use client';
import { useEffect, useRef, useState } from 'react';
import {
  MessageCircle,
  Map,
  UserRound,
  Backpack,
  PawPrint,
  Save,
  X,
  Send,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  BookOpen,
  HelpCircle,
  ChevronRight,
  Footprints,
  Music2,
  Download,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  SIZE,
  REGIONS,
  isTown,
  ITEMS,
  WEAPONS,
  RAIDS,
  NPCS,
  QUESTS,
  heroStats,
  xpNeeded,
  MAX_LEVEL,
  questProgress,
  gatePoints,
  partyDogs,
  entities,
  type GameState,
  type Action,
} from '@/lib/game/model';
import TravelerPreview from './traveler-preview';
import { routeLayout } from '@/lib/game/route-layouts';
import { MAP_FRAMES, mapAsset } from '@/lib/game/maps';
export type AdventureMessage = {
  id: string;
  text: string;
  author: string;
  time: string;
  kind: 'system' | 'memo';
};
type Layer = 'chat' | 'map' | 'status';
type OpenPanel =
  | 'install'
  | 'wardrobe'
  | 'map'
  | 'bag'
  | 'dogs'
  | 'journal'
  | 'save'
  | 'help';
export default function AdventureHUD({
  state,
  messages,
  notice,
  onMessage,
  onAction,
  onNavigate,
  onOpen,
  zoom,
  onZoom,
  running,
  onRunning,
  sound,
  onSound,
  music,
  onMusic,
  musicLabel,
  saveStatus,
  installed,
}: {
  installed: boolean;
  state: GameState;
  messages: AdventureMessage[];
  notice: string;
  onMessage: (text: string) => void;
  onAction: (a: Action) => unknown;
  onNavigate: (target: { id?: string; edge?: number }) => void;
  onOpen: (p: OpenPanel) => void;
  zoom: number;
  onZoom: (n: number) => void;
  running: boolean;
  onRunning: () => void;
  sound: boolean;
  onSound: () => void;
  music: boolean;
  onMusic: () => void;
  musicLabel: string;
  saveStatus: string;
}) {
  const [layer, setLayer] = useState<Layer | null>(null),
    [draft, setDraft] = useState(''),
    [name, setName] = useState(state.playerName),
    [lastRead, setLastRead] = useState('');
  const log = useRef<HTMLDivElement>(null);
  const latest = messages.at(-1),
    unread = !!latest && latest.id !== lastRead,
    party = partyDogs(state),
    region = REGIONS[state.region];
  useEffect(() => setName(state.playerName), [state.playerName]);
  useEffect(() => {
    if (layer === 'chat') {
      setLastRead(latest?.id ?? '');
      if (log.current) log.current.scrollTop = log.current.scrollHeight;
    }
  }, [layer, latest?.id]);
  const toggle = (next: Layer) =>
    setLayer((old) => (old === next ? null : next));
  const stats = heroStats(state),
    cave = state.place === 'cave',
    indoors = state.place === 'shop',
    [fw, fh] = indoors || cave ? [1254, 1254] : MAP_FRAMES[state.region];
  return (
    <div className="adventure-hud">
      <div className="field-hud-top">
        <button
          className="traveler-badge"
          onClick={() => toggle('status')}
          aria-label="플레이어 상태와 이름 변경"
        >
          <UserRound size={18} />
          <strong>
            {state.playerName} <small>Lv.{state.hero.level}</small>
          </strong>
        </button>
        <button className="location-badge" onClick={() => toggle('map')}>
          <Map size={16} />
          <span>
            {indoors
              ? state.shopType === 'armory'
                ? '무기상'
                : '편의점'
              : cave
                ? RAIDS[state.region].name
                : region.name}
          </span>
        </button>
        <span
          className={`zone-badge ${isTown(state.region) && !cave ? 'safe' : 'combat'}`}
        >
          {indoors || (isTown(state.region) && !cave)
            ? '안전 마을'
            : cave
              ? '레이드'
              : '전투 지역'}
        </span>
        <span className="wallet-badge">◈ {state.coins.toLocaleString()}</span>
      </div>
      {!state.battle && !layer && (
        <button className="quest-tracker" onClick={() => onOpen('journal')}>
          <BookOpen size={16} />
          <span>
            {(() => {
              const q = QUESTS.find((q) => state.quests[q.id] === 'active');
              return q
                ? `${q.title} · ${questProgress(state, q.id)}/${q.goal}`
                : '연두 마을 주민에게 이야기 듣기';
            })()}
          </span>
          <ChevronRight size={14} />
        </button>
      )}
      {!installed && !state.battle && (
        <button
          className="install-launch"
          onClick={() => onOpen('install')}
          aria-label="게임 설치 · 홈 화면에 추가"
          title="게임 설치"
        >
          <Download size={20} />
          <span>설치</span>
        </button>
      )}
      {!layer && notice && !state.battle && (
        <button
          className="message-peek"
          onClick={() => setLayer('chat')}
          aria-label="메시지 기록 열기"
        >
          <MessageCircle size={16} />
          <span>{notice}</span>
        </button>
      )}
      {layer && (
        <section
          data-game-input
          className={`hud-layer ${state.battle ? 'over-battle' : ''}`}
          aria-label="메시지 지도 상태 레이어"
        >
          <div className="hud-layer-head">
            <Tabs value={layer} onValueChange={(v) => setLayer(v as Layer)}>
              <TabsList>
                <TabsTrigger value="chat">메시지</TabsTrigger>
                <TabsTrigger value="map">미니맵</TabsTrigger>
                <TabsTrigger value="status">상태</TabsTrigger>
              </TabsList>
            </Tabs>
            <button
              className="close-layer"
              onClick={() => setLayer(null)}
              aria-label="레이어 닫기"
            >
              <X size={19} />
            </button>
          </div>
          {layer === 'chat' && (
            <>
              <div className="chat-tools">
                <button onClick={() => onOpen('help')}>
                  <HelpCircle size={14} />
                  도움말
                </button>
                <button onClick={() => onOpen('journal')}>
                  <BookOpen size={14} />
                  모험 일지
                </button>
              </div>
              <div
                className="adventure-chat"
                ref={log}
                role="log"
                aria-label="모험 메시지"
              >
                {messages.map((m) => (
                  <div className={`chat-line ${m.kind}`} key={m.id}>
                    <div>
                      <strong>{m.author}</strong>
                      <time>{m.time}</time>
                    </div>
                    <p>{m.text}</p>
                  </div>
                ))}
              </div>
              <form
                className="chat-compose"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!draft.trim()) return;
                  onMessage(draft.trim());
                  setDraft('');
                }}
              >
                <Input
                  aria-label="모험 메모"
                  placeholder="모험 메모 남기기"
                  value={draft}
                  maxLength={300}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  aria-label="메모 남기기"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
          {layer === 'map' && (
            <div className="hud-layer-body">
              <div className="mini-map-heading">
                <strong>
                  {indoors
                    ? state.shopType === 'armory'
                      ? '무기상'
                      : '편의점'
                    : cave
                      ? RAIDS[state.region].name
                      : region.name}
                </strong>
                <span>
                  {indoors || (isTown(state.region) && !cave)
                    ? '안전 지역'
                    : cave
                      ? '레이드 지역'
                      : '전투 지역'}
                </span>
              </div>
              {!indoors && !cave && (
                <p className="route-caption">
                  {routeLayout(state.region).name} · 표식을 누르면 길 안내
                </p>
              )}
              <div
                className="layer-minimap"
                aria-label={`${region.name} 미니맵. 주민과 상점 표식을 누르면 길을 안내합니다.`}
                style={{
                  backgroundImage: `url(${indoors ? '/art/shop-interior.png' : cave ? '/art/raids/cave-map.png' : mapAsset(state.region)})`,
                  backgroundSize: `${(1254 / fw) * 100}% ${(1254 / fh) * 100}%`,
                }}
              >
                {entities(state)
                  .filter((e) =>
                    [
                      'enemy',
                      'shop',
                      'exit',
                      'merchant',
                      'npc',
                      'cave',
                      'cat',
                    ].includes(e.kind),
                  )
                  .map((e) => (
                    <button
                      key={e.id}
                      className={`map-marker ${e.kind}`}
                      title={e.name}
                      aria-label={`${e.name} 길 안내`}
                      onClick={() => {
                        onNavigate({ id: e.id });
                        setLayer(null);
                      }}
                      style={{
                        left: `${(e.x / SIZE) * 100}%`,
                        top: `${(e.y / SIZE) * 100}%`,
                      }}
                    >
                      {e.kind === 'npc'
                        ? '💬'
                        : e.kind === 'shop'
                          ? '▣'
                          : e.kind === 'cave'
                            ? '◆'
                            : ''}
                    </button>
                  ))}
                {!indoors &&
                  !cave &&
                  gatePoints(state.region).map((g, i) =>
                    region.neighbors[i] >= 0 ? (
                      <b
                        key={i}
                        className="minimap-exit"
                        style={{
                          left: `${(g.x / SIZE) * 100}%`,
                          top: `${(g.y / SIZE) * 100}%`,
                        }}
                      >
                        {['↑', '→', '↓', '←'][i]}
                      </b>
                    ) : null,
                  )}
                <i
                  className="map-marker player"
                  style={{
                    left: `${(state.x / SIZE) * 100}%`,
                    top: `${(state.y / SIZE) * 100}%`,
                  }}
                />
              </div>
              <div className="minimap-legend">
                <span>● 내 위치</span>
                <span>● 적</span>
                <span>● 상점</span>
                <span>◆ 주민·동굴</span>
              </div>
              <div className="local-guide">
                <strong>
                  {indoors
                    ? '상점 안내'
                    : isTown(state.region) && !cave
                      ? '마을 안내'
                      : '탐험 안내'}
                </strong>
                <p>목적지를 누르면 길을 따라 이동해요.</p>
                <div className="guide-destinations">
                  {entities(state)
                    .filter((e) =>
                      [
                        'npc',
                        'shop',
                        'merchant',
                        'rest',
                        'cave',
                        'exit',
                      ].includes(e.kind),
                    )
                    .map((e) => (
                      <button
                        key={e.id}
                        onClick={() => {
                          onNavigate({ id: e.id });
                          setLayer(null);
                        }}
                      >
                        <span>
                          {e.kind === 'npc'
                            ? '💬'
                            : e.kind === 'shop'
                              ? '🛍️'
                              : e.kind === 'rest'
                                ? '⛺'
                                : e.kind === 'cave'
                                  ? '◆'
                                  : '↪'}{' '}
                          {e.name}
                        </span>
                        <small>
                          {e.kind === 'npc'
                            ? '주민에게 대화'
                            : e.kind === 'cave'
                              ? '레이드 입구'
                              : '길 안내'}
                        </small>
                      </button>
                    ))}
                </div>
                {!indoors && !cave && (
                  <div className="guide-exits">
                    {region.neighbors.map(
                      (n, i) =>
                        n >= 0 && (
                          <button
                            key={i}
                            onClick={() => {
                              onNavigate({ edge: i });
                              setLayer(null);
                            }}
                          >
                            <span>
                              {['↑ 북쪽', '→ 동쪽', '↓ 남쪽', '← 서쪽'][i]} ·{' '}
                              {REGIONS[n].name}
                            </span>
                            <small>
                              {isTown(n)
                                ? '안전 마을'
                                : `전투 지역 Lv.${REGIONS[n].level}+`}
                            </small>
                          </button>
                        ),
                    )}
                  </div>
                )}
              </div>
              <button
                className="layer-wide-button"
                onClick={() => onOpen('map')}
              >
                세계 지도 열기
                <ChevronRight size={16} />
              </button>
            </div>
          )}
          {layer === 'status' && (
            <div className="hud-layer-body">
              <form
                className="name-editor"
                onSubmit={(e) => {
                  e.preventDefault();
                  onAction({ type: 'rename', name });
                  e.currentTarget.querySelector('input')?.blur();
                }}
              >
                <label htmlFor="traveler-name">내 이름</label>
                <div>
                  <Input
                    id="traveler-name"
                    value={name}
                    maxLength={12}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!name.trim() || name === state.playerName}
                  >
                    변경
                  </button>
                </div>
              </form>
              <button
                className="wardrobe-entry"
                disabled={!!state.battle}
                onClick={() => onOpen('wardrobe')}
              >
                <TravelerPreview appearance={state.appearance} size={76} />
                <span>
                  <strong>외모·옷 꾸미기</strong>
                  <small>
                    {state.battle
                      ? '전투가 끝나면 변경할 수 있어요'
                      : '얼굴 · 머리 · 옷 · 색상'}
                  </small>
                </span>
                <ChevronRight size={18} />
              </button>
              <div className="hero-status">
                <strong>
                  {state.playerName} · Lv.{state.hero.level}{' '}
                  {state.hero.poison ? '· 중독' : ''}
                </strong>
                <Progress value={(state.hero.hp / stats.maxHp) * 100} />
                <p>
                  HP {state.hero.hp}/{stats.maxHp} · 공격 {stats.attack} · 방어{' '}
                  {stats.defense}
                </p>
                <div className="level-progress">
                  <Progress
                    value={
                      state.hero.level === MAX_LEVEL
                        ? 100
                        : (state.hero.xp / xpNeeded(state.hero.level)) * 100
                    }
                  />
                  <span>
                    {state.hero.level === MAX_LEVEL
                      ? '최고 레벨'
                      : `EXP ${state.hero.xp} / ${xpNeeded(state.hero.level)}`}
                  </span>
                </div>
                <b>♥ 매력 {stats.charm}</b>
                <small>
                  전투·의뢰로 함께 성장해요. 레벨업: HP +12, 공격 +3. 높은
                  매력은 새 친구를 만나는 데 도움이 돼요.
                </small>
              </div>
              <div className="status-weapon">
                <span>장착 무기</span>
                <strong>
                  {state.weapon
                    ? `${ITEMS[state.weapon].name} +${WEAPONS[state.weapon].attack}`
                    : '맨손'}
                </strong>
              </div>
              <div className="status-weapon">
                <span>옷 · 액세서리</span>
                <strong>
                  {state.equipment.clothes
                    ? ITEMS[state.equipment.clothes].name
                    : '미착용'}{' '}
                  /{' '}
                  {state.equipment.accessory
                    ? ITEMS[state.equipment.accessory].name
                    : '미착용'}
                </strong>
              </div>
              <div className="status-party-heading">
                <strong>동행 {party.length} / 2</strong>
                <button onClick={() => onOpen('dogs')}>
                  편성
                  <ChevronRight size={14} />
                </button>
              </div>
              {party.map((dog, i) => (
                <div className="status-companion" key={dog.id}>
                  <div>
                    <PawPrint size={16} />
                    <strong>{dog.name}</strong>
                    <small>
                      {i === 0 ? '선두' : '동행'} · Lv.{dog.level}
                    </small>
                  </div>
                  <Progress value={(dog.hp / dog.maxHp) * 100} />
                  <span>
                    HP {dog.hp} / {dog.maxHp} · 공격 {dog.atk}
                  </span>
                  <div className="level-progress">
                    <Progress
                      value={
                        dog.level === MAX_LEVEL
                          ? 100
                          : (dog.xp / xpNeeded(dog.level)) * 100
                      }
                    />
                    <span>
                      {dog.level === MAX_LEVEL
                        ? '최고 레벨'
                        : `EXP ${dog.xp} / ${xpNeeded(dog.level)}`}
                    </span>
                  </div>
                </div>
              ))}
              {party.length < 2 && (
                <button
                  className="empty-party-slot"
                  onClick={() => onOpen('dogs')}
                >
                  <Plus size={16} />두 번째 동료 선택
                </button>
              )}
              <div className="status-controls">
                <button aria-pressed={running} onClick={onRunning}>
                  <Footprints size={17} />
                  {running ? '달리기' : '걷기'}
                </button>
                <button
                  aria-pressed={sound}
                  onClick={onSound}
                  aria-label={sound ? '효과음 끄기' : '효과음 켜기'}
                >
                  {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}효과음
                </button>
                <button
                  aria-label="화면 축소"
                  disabled={zoom <= 0.49}
                  onClick={() => onZoom(Math.max(0.49, zoom - 0.12))}
                >
                  <Minus size={17} />
                </button>
                <button
                  aria-label="화면 확대"
                  disabled={zoom >= 1.1}
                  onClick={() => onZoom(Math.min(1.1, zoom + 0.12))}
                >
                  <Plus size={17} />
                </button>
              </div>
              <button
                className="layer-wide-button music-control"
                aria-pressed={music}
                onClick={onMusic}
              >
                <Music2 size={17} />
                <span>
                  배경음<small>{musicLabel}</small>
                </span>
                <b>{music ? 'ON' : 'OFF'}</b>
              </button>
              <button
                className="layer-wide-button"
                onClick={() => onOpen('save')}
              >
                <Save size={16} />
                {saveStatus}
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>
      )}
      <nav className="touch-navigation" aria-label="게임 메뉴">
        <button aria-pressed={layer === 'chat'} onClick={() => toggle('chat')}>
          <span>
            <MessageCircle />
            {unread && <i />}
          </span>
          메시지
        </button>
        <button aria-pressed={layer === 'map'} onClick={() => toggle('map')}>
          <Map />
          미니맵
        </button>
        <button
          aria-pressed={layer === 'status'}
          onClick={() => toggle('status')}
        >
          <UserRound />
          상태
        </button>
        <button onClick={() => onOpen('bag')}>
          <Backpack />
          가방
        </button>
        <button onClick={() => onOpen('dogs')}>
          <PawPrint />
          동료
        </button>
        <button onClick={() => onOpen('save')}>
          <Save />
          저장
        </button>
      </nav>
    </div>
  );
}
