'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PawPrint,
  Save,
  Compass,
  ChevronRight,
  Check,
  Download,
  Upload,
  FolderOpen,
  Hand,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  newGame,
  currentDog,
  dogDescription,
  REGIONS,
  BREEDS,
  ITEMS,
  act,
  nearest,
  countItem,
  packSave,
  unpackSave,
  type GameState,
  type Action,
  type Result,
} from '@/lib/game/model';
import World from './world';
import {
  Inventory,
  Shop,
  NpcConversation,
  QuestJournal,
} from './adventure-panels';
import { useGameMusic } from './use-game-music';
import AdventureHUD, { type AdventureMessage } from './adventure-hud';
import BattleView from './battle';
import { BattleDirector, type PlayingClip } from '@/lib/game/battle-motion';
import Portrait from './portrait';
import Wardrobe from './wardrobe';
import InstallGame from './install-game';
import { useGameInstall } from './use-game-install';
type Panel =
  | 'npc'
  | 'install'
  | 'wardrobe'
  | 'map'
  | 'bag'
  | 'dogs'
  | 'journal'
  | 'save'
  | 'shop'
  | 'help'
  | null;
type SaveMeta = {
  slot: number;
  name: string;
  date: string;
  region: string;
  dogs: number;
} | null;
export default function Home() {
  const install = useGameInstall();
  const [state, setState] = useState<GameState>(newGame);
  const game = useRef(state);
  const [panel, setPanel] = useState<Panel>(null);
  const paused = useRef(false);
  const [notice, setNotice] = useState('');
  const [running, setRunning] = useState(false);
  const [messages, setMessages] = useState<AdventureMessage[]>([]);
  const [chatReady, setChatReady] = useState(false);
  const messageSequence = useRef(0);
  const [zoom, setZoom] = useState(0.74);
  const [sound, setSound] = useState(false);
  const soundRef = useRef(false);
  const audioRef = useRef<AudioContext | null>(null);
  const [saveStatus, setSaveStatus] = useState('자동 저장 대기');
  const [saves, setSaves] = useState<SaveMeta[]>([null, null, null]);
  const [overwrite, setOverwrite] = useState<number | null>(null);
  const [burst, setBurst] = useState('');
  const [lootReward, setLootReward] = useState<{ item: string; qty: number }[]>(
    [],
  );
  const [ready, setReady] = useState(false);
  const inputFile = useRef<HTMLInputElement>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const write = useCallback((s: GameState) => {
    game.current = s;
    setState({ ...s });
  }, []);
  const director = useRef(new BattleDirector());
  const [clip, setClip] = useState<PlayingClip | null>(null);
  const combatTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(
    () => () => {
      combatTimers.current.forEach(clearTimeout);
      director.current.cancel();
    },
    [],
  );
  const { music, toggleMusic, musicLabel } = useGameMusic(!!state.battle);
  const addMessage = useCallback(
    (
      text: string,
      kind: AdventureMessage['kind'] = 'system',
      author = '안내',
    ) => {
      if (!text) return;
      const entry: AdventureMessage = {
        id: `${Date.now()}-${++messageSequence.current}`,
        text: text.slice(0, 500),
        kind,
        author,
        time: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      };
      setMessages((old) =>
        kind === 'system' && old.at(-1)?.text === entry.text
          ? old
          : [...old, entry].slice(-100),
      );
    },
    [],
  );
  const tell = useCallback(
    (text: string) => {
      if (!text) return;
      addMessage(text);
      setNotice(text);
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
      noticeTimer.current = setTimeout(() => setNotice(''), 6500);
    },
    [addMessage],
  );
  const beep = useCallback((kind: string) => {
    if (!soundRef.current) return;
    try {
      const ac = audioRef.current ?? new AudioContext();
      audioRef.current = ac;
      void ac.resume();
      const frequencies =
        kind === 'win'
          ? [523, 659, 784]
          : kind === 'recruit'
            ? [659, 784, 1047]
            : kind === 'attack'
              ? [220, 165]
              : [440];
      frequencies.forEach((f, i) => {
        const o = ac.createOscillator(),
          g = ac.createGain();
        o.type = 'triangle';
        o.frequency.value = f;
        o.connect(g);
        g.connect(ac.destination);
        g.gain.setValueAtTime(0.055, ac.currentTime + i * 0.11);
        g.gain.exponentialRampToValueAtTime(
          0.001,
          ac.currentTime + i * 0.11 + 0.16,
        );
        o.start(ac.currentTime + i * 0.11);
        o.stop(ac.currentTime + i * 0.11 + 0.18);
      });
    } catch {}
  }, []);
  const commitResult = useCallback(
    (r: Result, animated = false) => {
      const previousTurn = game.current.battle?.turn,
        previousLine = game.current.battle?.log.at(-1);
      write(r.state);
      tell(r.message);
      if (r.state.battle && r.state.battle.turn !== previousTurn) {
        for (const line of r.state.battle.log.slice(-2))
          if (line !== r.message && line !== previousLine)
            addMessage(line, 'system', '전투');
      }
      if (r.event === 'shop') setPanel('shop');
      if (r.event === 'npc') setPanel('npc');
      if (r.loot) {
        const totals: Record<string, number> = {};
        for (const drop of r.loot)
          totals[drop.item] = (totals[drop.item] ?? 0) + drop.qty;
        setLootReward(
          Object.entries(totals).map(([item, qty]) => ({ item, qty })),
        );
      }
      if (r.event === 'pickup') beep('pickup');
      if (
        r.event &&
        r.event !== 'pickup' &&
        !(animated && r.event === 'attack')
      ) {
        beep(r.event);
        setBurst(r.event);
        if (burstTimer.current) clearTimeout(burstTimer.current);
        burstTimer.current = setTimeout(
          () => setBurst(''),
          r.event === 'enter_shop'
            ? 1400
            : r.event === 'leave_shop'
              ? 700
              : r.event === 'win'
                ? 2200
                : 1100,
        );
      }
      return r;
    },
    [write, tell, beep, addMessage],
  );
  const dispatch = useCallback(
    (a: Action): Result => {
      if (director.current.busy)
        return {
          state: game.current,
          message: '공격 동작이 끝나면 다음 행동을 골라 주세요.',
        };
      if (
        game.current.battle &&
        (a.type === 'attack' ||
          a.type === 'skill' ||
          a.type === 'tail' ||
          a.type === 'team' ||
          a.type === 'guard')
      ) {
        const turn = director.current.begin(game.current, a.type)!;
        if (!turn.clip) return commitResult(turn.result);
        combatTimers.current.forEach(clearTimeout);
        combatTimers.current = [];
        setClip({ ...turn.clip, startedAt: performance.now() });
        for (const hit of turn.clip.strikes)
          combatTimers.current.push(
            setTimeout(() => beep('attack'), hit.impact),
          );
        for (const counter of turn.clip.counters)
          combatTimers.current.push(
            setTimeout(() => beep('counter'), counter.impact),
          );
        combatTimers.current.push(
          setTimeout(() => {
            const result = director.current.finish();
            setClip(null);
            if (result) commitResult(result, true);
            combatTimers.current = [];
          }, turn.clip.duration),
        );
        return turn.result;
      }
      return commitResult(act(game.current, a));
    },
    [commitResult, beep],
  );
  const tick = useCallback(() => setState({ ...game.current }), []);
  const open = useCallback(
    (p: Panel) => {
      if (director.current.busy) return;
      if (game.current.battle && p !== 'dogs' && p !== 'bag') {
        tell('전투를 마친 뒤 열 수 있어요.');
        return;
      }
      setPanel(p);
      setOverwrite(null);
    },
    [tell],
  );
  const transitioning = burst === 'enter_shop' || burst === 'leave_shop';
  paused.current = !!panel || transitioning;
  const region = REGIONS[state.region];
  const near = nearest(state);
  const bagUsed = state.bag.filter(Boolean).length;
  const readSaveList = useCallback(() => {
    try {
      setSaves(
        [0, 1, 2].map((i) => {
          const raw = localStorage.getItem(`tails-city-slot-${i}`);
          if (!raw) return null;
          const s = unpackSave(raw);
          return {
            slot: i,
            name: currentDog(s).name,
            date: JSON.parse(raw).savedAt,
            region: REGIONS[s.region].name,
            dogs: s.dogs.length,
          };
        }),
      );
    } catch {
      tell('일부 저장 데이터를 읽을 수 없어요. 파일 저장본을 열어 주세요.');
    }
  }, [tell]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('tails-city-auto');
      if (raw) {
        write(unpackSave(raw));
        setSaveStatus('자동 저장 불러옴');
      }
    } catch {
      tell('자동 저장을 읽지 못했어요. 새 모험으로 시작합니다.');
    }
    readSaveList();
    setReady(true);
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
      if (burstTimer.current) clearTimeout(burstTimer.current);
    };
  }, [write, tell, readSaveList]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('tails-city-messages');
      if (raw && raw.length < 100000) {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          const valid = data
            .filter(
              (m) =>
                m &&
                typeof m.id === 'string' &&
                typeof m.text === 'string' &&
                m.text.length <= 500 &&
                typeof m.author === 'string' &&
                m.author.length <= 20 &&
                typeof m.time === 'string' &&
                ['system', 'memo'].includes(m.kind),
            )
            .slice(-100);
          setMessages((old) => [...valid, ...old].slice(-100));
        }
      } else
        addMessage(
          '방향키 또는 길을 터치해 이동하세요. 강아지나 상점을 터치하면 다가갑니다. 공원 동쪽의 연두 마을에서 주민들의 의뢰를 받아 보세요.',
        );
    } catch {
      addMessage('가고 싶은 길을 터치해 이동하세요.');
    }
    setChatReady(true);
  }, [addMessage]);
  useEffect(() => {
    if (!chatReady) return;
    try {
      localStorage.setItem('tails-city-messages', JSON.stringify(messages));
    } catch {}
  }, [messages, chatReady]);
  useEffect(() => {
    if (!ready) return;
    const auto = () => {
      if (game.current.battle) return;
      try {
        localStorage.setItem('tails-city-auto', packSave(game.current));
        setSaveStatus('자동 저장됨');
      } catch {
        setSaveStatus('자동 저장 실패 · 파일 저장 권장');
      }
    };
    const t = setInterval(auto, 15000);
    window.addEventListener('pagehide', auto);
    return () => {
      clearInterval(t);
      window.removeEventListener('pagehide', auto);
    };
  }, [ready]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (e.target as HTMLElement)?.tagName,
        )
      )
        return;
      const k = e.key.toLowerCase();
      const panels: Record<string, Panel> = {
        b: 'bag',
        i: 'bag',
        m: 'map',
        p: 'dogs',
        j: 'journal',
      };
      if (panels[k] && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        open(panel === panels[k] ? null : panels[k]);
      }
      if (k === 'escape') {
        setPanel(null);
      }
      if (e.ctrlKey && k === 's') {
        e.preventDefault();
        open('save');
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [panel, open]);
  // A small optional WebMCP surface shares the exact inventory and save actions used by the UI.
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: unknown,
            options: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tools = [
      {
        name: 'read_adventure',
        description: '현재 지역, 동료, 가방과 전투 상태를 읽습니다.',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        execute: () => ({
          region: REGIONS[game.current.region].name,
          place: game.current.place,
          position: { x: game.current.x, y: game.current.y },
          hero: game.current.hero,
          equipment: game.current.equipment,
          quests: game.current.quests,
          progress: game.current.progress,
          raids: game.current.raids,
          playerName: game.current.playerName,
          party: game.current.party,
          dogs: game.current.dogs,
          capacity: game.current.capacity,
          coins: game.current.coins,
          battle: game.current.battle,
        }),
      },
      {
        name: 'open_adventure_panel',
        description: '게임의 세계 지도, 가방, 동료 또는 저장 창을 엽니다.',
        inputSchema: {
          type: 'object',
          properties: {
            panel: { type: 'string', enum: ['map', 'bag', 'dogs', 'save'] },
          },
          required: ['panel'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false },
        execute: async (input: unknown) => {
          const p = (input as { panel?: Panel })?.panel;
          if (!p || !['map', 'bag', 'dogs', 'save'].includes(p))
            throw Error('올바른 창을 선택하세요.');
          if (game.current.battle && !['bag', 'dogs'].includes(p))
            throw Error('전투를 먼저 마치세요.');
          open(p);
          await new Promise<void>((resolve) =>
            requestAnimationFrame(() => resolve()),
          );
          return { opened: p };
        },
      },
    ];
    for (const tool of tools) {
      try {
        void Promise.resolve(
          context.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {});
      } catch {}
    }
    return () => lifecycle.abort();
  }, [open]);
  function manualSave(slot: number) {
    if (saves[slot] && overwrite !== slot) {
      setOverwrite(slot);
      return;
    }
    try {
      localStorage.setItem(`tails-city-slot-${slot}`, packSave(game.current));
      readSaveList();
      setOverwrite(null);
      tell(`저장 칸 ${slot + 1}에 모험을 저장했어요.`);
    } catch {
      tell(
        '저장 공간이 부족하거나 브라우저 저장이 차단되었어요. 파일로 저장해 주세요.',
      );
    }
  }
  function loadSave(slot: number) {
    try {
      const raw = localStorage.getItem(`tails-city-slot-${slot}`);
      if (!raw) throw Error('저장 파일이 없어요.');
      write(unpackSave(raw));
      setPanel(null);
      tell('모험을 불러왔어요.');
    } catch (e) {
      tell(e instanceof Error ? e.message : '불러오지 못했어요.');
    }
  }
  function exportSave() {
    const blob = new Blob([packSave(game.current)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tails-city-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    tell('모험을 파일로 저장했어요.');
  }
  async function importSave(file: File | undefined) {
    if (!file) return;
    try {
      if (file.size > 600000)
        throw Error('600KB 이하의 저장 파일을 선택해 주세요.');
      const s = unpackSave(await file.text());
      write(s);
      setPanel(null);
      tell('저장 파일을 열었어요.');
    } catch (e) {
      tell(e instanceof Error ? e.message : '파일을 열지 못했어요.');
    }
    if (inputFile.current) inputFile.current.value = '';
  }
  const titles: Record<string, string> = {
    npc: '마을 사람들의 이야기',
    install: '게임 설치',
    wardrobe: '나만의 여행자',
    map: '세계 지도',
    bag: '나의 가방',
    dogs: '우리의 동료들',
    journal: '모험 일지',
    save: '모험을 간직하기',
    shop: state.shopType === 'armory' ? '태오의 무기상' : '미로의 편의점',
    help: '여행자 안내서',
  };
  return (
    <main className="touch-game-shell">
      <section
        className={`playfield touch-world ${burst === 'attack' ? 'attack-flash' : ''}`}
      >
        <World
          game={game}
          paused={paused}
          onAction={dispatch}
          onTick={tick}
          zoom={zoom}
          running={running}
        />
        {near && !state.battle && !panel && !transitioning && (
          <button
            className="interact-prompt"
            onClick={() => dispatch({ type: 'interact', id: near.id })}
          >
            <Hand size={19} />
            <span>
              {near.kind === 'drop'
                ? '전리품 줍기'
                : near.kind === 'shop'
                  ? `${near.name} 들어가기`
                  : near.kind === 'merchant'
                    ? '물건 사고팔기'
                    : near.kind === 'npc'
                      ? `${near.name} 대화`
                      : near.kind === 'cave'
                        ? '레이드 동굴 입장'
                        : near.kind === 'cat'
                          ? '고양이 구출'
                          : near.kind === 'exit'
                            ? '밖으로 나가기'
                            : near.kind === 'rest'
                              ? '모두 회복'
                              : near.kind === 'enemy'
                                ? '전투하기'
                                : near.kind === 'dog'
                                  ? `${near.name} 친구 되기`
                                  : '상자 열기'}
            </span>
            <ChevronRight size={16} />
          </button>
        )}
        <BattleView
          state={state}
          clip={clip}
          onAction={dispatch}
          onBag={() => open('bag')}
        />
        {transitioning && (
          <div
            className={`shop-transition ${burst === 'leave_shop' ? 'leaving' : ''}`}
            role="status"
            aria-label={
              burst === 'enter_shop'
                ? '상점 문을 열고 들어가는 중'
                : '상점에서 나가는 중'
            }
          >
            {burst === 'enter_shop' && (
              <>
                <div className="opening-door" />
                <span>어서 오세요, 여행자님.</span>
              </>
            )}
          </div>
        )}
        {burst === 'win' && (
          <div className="victory-banner loot-victory">
            VICTORY!{' '}
            <span>
              아이템 {lootReward.reduce((n, v) => n + v.qty, 0)}개 드롭!
            </span>
            <div className="loot-reward">
              {lootReward.map((v) => (
                <span key={v.item} title={ITEMS[v.item].name}>
                  {ITEMS[v.item].icon}
                  <b>×{v.qty}</b>
                </span>
              ))}
            </div>
          </div>
        )}
        {burst === 'recruit' && (
          <div className="victory-banner">
            <PawPrint /> NEW FRIEND <span>새로운 동료가 함께합니다!</span>
          </div>
        )}
      </section>
      <AdventureHUD
        state={state}
        messages={messages}
        notice={notice}
        onMessage={(text) => addMessage(text, 'memo', state.playerName)}
        onAction={dispatch}
        onOpen={open}
        zoom={zoom}
        onZoom={setZoom}
        running={running}
        onRunning={() => setRunning((value) => !value)}
        music={music}
        onMusic={toggleMusic}
        musicLabel={musicLabel}
        sound={sound}
        onSound={() => {
          soundRef.current = !sound;
          setSound(!sound);
          if (!sound) beep('toggle');
        }}
        saveStatus={saveStatus}
        installed={install.installed}
      />
      <Dialog
        open={!!panel}
        onOpenChange={(o) => {
          if (!o) setPanel(null);
        }}
      >
        <DialogContent
          className={`game-dialog ${panel === 'map' ? 'map-dialog' : ''} ${panel === 'bag' ? 'bag-dialog' : ''} ${panel === 'wardrobe' ? 'wardrobe-dialog' : ''} ${panel === 'install' ? 'install-dialog' : ''}`}
        >
          <div className="dialog-heading">
            <span className="eyebrow">
              TAILS CITY ·{' '}
              {panel === 'map' ? 'EXPLORE THE WORLD' : 'YOUR ADVENTURE'}
            </span>
            <DialogTitle className="dialog-title">
              {titles[panel || 'help']}
            </DialogTitle>
            <DialogDescription>
              {panel === 'npc'
                ? '주민에게 의뢰를 받고, 단서를 모아 보상을 받으세요.'
                : panel === 'install'
                  ? '홈 화면에 리치 아이콘을 추가하고 바로 모험을 시작하세요.'
                  : panel === 'wardrobe'
                    ? '옷을 입혀 보고, 마음에 드는 모습으로 떠나세요.'
                    : panel === 'map'
                      ? '연결된 길로 새 지역을 발견하세요. 방문한 곳은 빠르게 돌아갈 수 있어요.'
                      : panel === 'bag'
                        ? `${bagUsed} / ${state.capacity}칸 사용 중 · 같은 아이템은 한 칸에 9개까지 보관`
                        : panel === 'dogs'
                          ? `${state.dogs.length}마리의 친구 · ${state.party.length}/2 동행 중. 최대 두 마리가 함께 걷고 싸웁니다.`
                          : panel === 'save'
                            ? '이 브라우저에 저장하거나, 파일로 보관하고 다시 열 수 있어요.'
                            : panel === 'shop'
                              ? '필요한 물건을 사고, 남는 아이템을 팔아 코인을 모으세요.'
                              : panel === 'journal'
                                ? '작은 발자국들이 모여 도시를 바꿉니다.'
                                : '첫 산책을 위한 몇 가지 안내'}
            </DialogDescription>
          </div>
          {notice && panel !== 'npc' && (
            <p className="dialog-message" role="status">
              {notice}
            </p>
          )}
          {panel === 'install' && (
            <InstallGame install={install} onExport={exportSave} />
          )}
          {panel === 'wardrobe' && (
            <Wardrobe
              name={state.playerName}
              appearance={state.appearance}
              onCancel={() => setPanel(null)}
              onApply={(name, appearance) => {
                dispatch({ type: 'rename', name });
                dispatch({ type: 'dress', appearance });
                setPanel(null);
              }}
            />
          )}
          {panel === 'map' && (
            <>
              <div className="world-map-grid">
                {REGIONS.map((r) => (
                  <button
                    key={r.id}
                    className={`region-card ${r.id === state.region ? 'current' : ''} ${!state.visited.includes(r.id) ? 'undiscovered' : ''}`}
                    onClick={() => {
                      const res = dispatch({ type: 'travel', region: r.id });
                      if (
                        res.state !== game.current ||
                        (res.state.region === r.id &&
                          state.visited.includes(r.id))
                      )
                        setPanel(null);
                    }}
                  >
                    <div
                      className="region-art"
                      style={{
                        backgroundImage: `url(/art/regions/${r.id}.png)`,
                        backgroundPosition: 'center',
                      }}
                    />
                    <span className="region-index">0{r.id + 1}</span>
                    {state.visited.includes(r.id) && (
                      <span className="visited-badge">
                        {r.id === state.region ? '현재 위치' : '발견함'}
                      </span>
                    )}
                    <div className="region-card-text">
                      <small>{r.en}</small>
                      <h3>{r.name}</h3>
                      <span>
                        {r.tag}
                        <b>Lv.{r.level}+</b>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="map-legend">
                <span>
                  <i className="legend-dot" />
                  발견한 지역: 클릭해 빠른 이동
                </span>
                <span>출구 표시가 있는 길로만 이동 · 막힌 길은 통행 불가</span>
              </div>
              <div className="route-guide">
                <Compass size={18} />
                <span>
                  현재 연결된 길:{' '}
                  {region.neighbors
                    .map((n, i) =>
                      n >= 0
                        ? `${['북쪽', '동쪽', '남쪽', '서쪽'][i]} ${REGIONS[n].name}`
                        : '',
                    )
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
            </>
          )}
          {panel === 'bag' && (
            <Inventory
              state={state}
              onAction={dispatch}
              onClose={() => setPanel(null)}
            />
          )}
          {panel === 'dogs' && (
            <div className="dogs-grid">
              {state.dogs.map((dog) => (
                <div
                  className={`dog-card ${state.party.includes(dog.id) ? 'selected' : ''}`}
                  key={dog.id}
                >
                  <div className="dog-card-top">
                    <span>Lv.{dog.level}</span>
                    {state.party.includes(dog.id) ? (
                      <span className="following">
                        <Check size={12} />
                        {dog.id === state.active ? '선두' : '지원 동료'}
                      </span>
                    ) : (
                      <span>대기 중</span>
                    )}
                  </div>
                  <Portrait sprite={BREEDS[dog.breed].sprite} size={150} />
                  <h3>
                    {dog.name}
                    <small>{dogDescription(dog)}</small>
                  </h3>
                  <Progress value={(dog.hp / dog.maxHp) * 100} />
                  <div className="stat-line">
                    <span>
                      HP {dog.hp}/{dog.maxHp}
                    </span>
                    <span>공격 {dog.atk}</span>
                  </div>
                  <div className="dog-skill">
                    <PawPrint size={13} />
                    {BREEDS[dog.breed].skill}
                  </div>
                  <div className="party-card-actions">
                    <button
                      disabled={
                        !!state.battle ||
                        (state.party.includes(dog.id)
                          ? state.party.length === 1
                          : state.party.length === 2)
                      }
                      onClick={() => dispatch({ type: 'party', id: dog.id })}
                    >
                      {state.party.includes(dog.id) ? '동행 해제' : '함께하기'}
                    </button>
                    <button
                      disabled={
                        state.active === dog.id ||
                        (!!state.battle && dog.hp <= 0)
                      }
                      onClick={() => dispatch({ type: 'switch', id: dog.id })}
                    >
                      {state.active === dog.id ? '선두' : '선두로 변경'}
                    </button>
                  </div>
                </div>
              ))}
              <div className="new-friend">
                <PawPrint size={36} />
                <h3>새로운 동료 만나기</h3>
                <p>
                  강아지를 터치해 다가가면
                  <br />
                  필요한 매력을 확인하세요.
                  <br />
                  조건을 만족하면 간식으로 친구가 됩니다.
                </p>
                <span>친구 간식 {countItem(state, 'treat')}개 보유</span>
              </div>
            </div>
          )}
          {panel === 'journal' && (
            <QuestJournal
              state={state}
              onAction={dispatch}
              onClose={() => setPanel(null)}
            />
          )}
          {panel === 'npc' && (
            <NpcConversation state={state} onAction={dispatch} />
          )}
          {panel === 'save' && (
            <>
              <div className="save-slots">
                {[0, 1, 2].map((i) => (
                  <div className="save-slot" key={i}>
                    <span className="slot-number">0{i + 1}</span>
                    <div>
                      <h3>
                        {saves[i] ? saves[i]!.region : '아직 쓰지 않은 이야기'}
                      </h3>
                      <p>
                        {saves[i]
                          ? `${new Date(saves[i]!.date).toLocaleString('ko-KR')} · 동료 ${saves[i]!.dogs}마리`
                          : '이 칸에 현재 모험을 저장할 수 있어요.'}
                      </p>
                      {overwrite === i && (
                        <p className="overwrite-note">
                          기존 저장을 현재 모험으로 바꿉니다. 다시 누르면
                          저장돼요.
                        </p>
                      )}
                    </div>
                    <div className="slot-actions">
                      <button onClick={() => manualSave(i)}>
                        <Save size={15} />
                        {overwrite === i ? '덮어쓰기 확인' : '저장'}
                      </button>
                      <button disabled={!saves[i]} onClick={() => loadSave(i)}>
                        <FolderOpen size={15} />
                        불러오기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="file-actions">
                <button onClick={exportSave}>
                  <Download size={19} />
                  <span>
                    파일로 저장<small>다른 기기로 가져갈 수 있어요</small>
                  </span>
                </button>
                <button onClick={() => inputFile.current?.click()}>
                  <Upload size={19} />
                  <span>
                    저장 파일 열기<small>이전에 저장한 JSON 파일</small>
                  </span>
                </button>
              </div>
              <p className="save-explainer">
                <Check size={14} />
                탐험 중 15초마다 자동 저장됩니다. 브라우저 데이터를 지우기
                전에는 파일로 보관하세요.
              </p>
            </>
          )}
          {panel === 'shop' && (
            <Shop key={state.shopType} state={state} onAction={dispatch} />
          )}
          {panel === 'help' && (
            <div className="help-content">
              <div className="help-tips">
                <h3>터치로 떠나는 모험</h3>
                <p>
                  키보드 방향키 또는 가고 싶은 길을 터치해 이동합니다. 강아지,
                  몹, 상점, 전리품을 터치하면 다가가 상호작용합니다.
                </p>
                <p>
                  아래 메뉴에서 메시지·미니맵·상태 레이어를 열 수 있습니다.
                  레이어를 닫아도 탐험 화면 크기는 그대로 유지됩니다.
                </p>
                <p>
                  상태에서 이름과 외모·옷을 바꾸고 걷기·달리기, 화면 확대,
                  배경음과 효과음을 조절할 수 있습니다. 첫 터치 후 레트로
                  탐험곡이 시작되고, 전투에서는 긴장감 있는 곡으로 바뀝니다.
                </p>
                <p>
                  동료 창에서 최대 두 마리를 편성하세요. 행동할 한 명을 선택해
                  공격하며, 모두 함께 경험치를 얻습니다. 새 친구는 빈 동행 칸에
                  자동으로 합류합니다.
                </p>
                <p>
                  상점 문을 터치해 들어간 뒤 카운터의 상인에게 다가가세요.
                  편의점에서는 회복·해독·강화 물품과 최대 1000칸 가방을,
                  무기상에서는 무기·옷·액세서리를 구입합니다. 아래쪽 문을
                  터치하면 밖으로 나갑니다.
                </p>
                <p>
                  연두 마을은 안전 지역입니다. 그 밖의 지역에서 몹을 쓰러뜨리면
                  전리품이 쏟아집니다. 가까이 가면 자동으로 줍고, 가방이 가득
                  차면 남은 아이템은 바닥에 보관됩니다.
                </p>
                <p>
                  기본은 선택한 한 명의 단독 공격입니다. 행동할 캐릭터 선택은
                  무료이며 공격·방어·회복은 1턴을 사용합니다. 별빛 협공은
                  3턴부터 전투당 1회, 여행자와 살아 있는 강아지가 함께 공격하고
                  2턴을 사용합니다. 적이 살아남으면 두 번 반격합니다. 드래곤은
                  매 3번째 턴 강한 공격을 예고하니 방어를 활용하세요.
                </p>
                <p>
                  길 끝의 출구로 다른 지역을 발견하세요. 미니맵의 세계 지도를
                  열면 방문한 지역으로 빠르게 이동할 수 있습니다.
                </p>
                <p>
                  15초마다 자동 저장됩니다. 저장 메뉴에서 직접 저장하거나 파일로
                  보관할 수도 있습니다.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <input
        ref={inputFile}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={(e) => void importSave(e.target.files?.[0])}
      />
    </main>
  );
}
