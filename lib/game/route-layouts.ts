// Outdoor artwork, collision, navigation and save migration share this route graph.
export type RoutePoint = readonly [number, number];
export type RouteLayout = {
  name: string;
  theme: string;
  spawn: RoutePoint;
  width: number;
  paths: RoutePoint[][];
  anchors: Record<string, RoutePoint>;
  plazas: { x: number; y: number; r: number }[];
};
export const ROUTE_LAYOUTS: RouteLayout[] = [
  {
    name: '호수 둘레길',
    theme:
      'sunlit riverside park, a large blue lake inside the oval loop, flowering gardens and trees',
    spawn: [1200, 1480],
    paths: [
      [
        [1700, 970],
        [1660, 760],
        [1400, 610],
        [950, 560],
        [620, 760],
        [540, 1140],
        [770, 1410],
        [1200, 1480],
        [1540, 1300],
        [1700, 970],
      ],
      [
        [1700, 970],
        [2048, 970],
      ],
      [
        [1200, 1480],
        [1024, 1670],
        [1024, 2048],
      ],
    ],
    anchors: {
      dog: [1540, 1300],
      'dog-b': [950, 560],
      enemy0: [1660, 760],
      enemy1: [620, 760],
      captain: [1400, 610],
      cave: [540, 1140],
      loot: [770, 1410],
      'loot-b': [1660, 970],
      mob0: [1024, 1840],
      mob1: [1024, 1670],
      spare: [1200, 1480],
    },
    width: 168,
    plazas: [
      {
        x: 1540,
        y: 1300,
        r: 92,
      },
      {
        x: 950,
        y: 560,
        r: 92,
      },
      {
        x: 1660,
        y: 760,
        r: 92,
      },
      {
        x: 620,
        y: 760,
        r: 92,
      },
      {
        x: 1400,
        y: 610,
        r: 92,
      },
      {
        x: 540,
        y: 1140,
        r: 112,
      },
      {
        x: 770,
        y: 1410,
        r: 92,
      },
      {
        x: 1660,
        y: 970,
        r: 92,
      },
      {
        x: 1024,
        y: 1840,
        r: 92,
      },
      {
        x: 1024,
        y: 1670,
        r: 92,
      },
      {
        x: 1200,
        y: 1480,
        r: 92,
      },
    ],
  },
  {
    name: '굽은 골목 순환로',
    theme:
      'cozy modern Korean small town, colorful tiled roofs, flower gardens, warm stone paving; houses ONLY outside the marked roads; green garden inside ring',
    spawn: [1000, 1350],
    paths: [
      [
        [750, 750],
        [1300, 750],
        [1490, 1030],
        [1300, 1350],
        [750, 1350],
        [560, 1030],
        [750, 750],
      ],
      [
        [1024, 0],
        [1024, 330],
        [750, 500],
        [750, 750],
      ],
      [
        [1490, 1030],
        [1730, 1160],
        [2048, 970],
      ],
      [
        [1300, 1350],
        [1400, 1650],
        [1024, 1840],
        [1024, 2048],
      ],
      [
        [560, 1030],
        [340, 780],
        [0, 970],
      ],
    ],
    anchors: {
      dog: [1490, 1030],
      'dog-b': [750, 500],
      shop: [750, 750],
      armory: [1300, 750],
      rest: [1400, 1650],
      npc0: [1160, 1350],
      npc1: [1730, 1160],
      npc2: [750, 1350],
      npc3: [560, 1030],
    },
    width: 184,
    plazas: [
      {
        x: 1490,
        y: 1030,
        r: 92,
      },
      {
        x: 750,
        y: 500,
        r: 92,
      },
      {
        x: 750,
        y: 750,
        r: 112,
      },
      {
        x: 1300,
        y: 750,
        r: 112,
      },
      {
        x: 1400,
        y: 1650,
        r: 92,
      },
      {
        x: 1160,
        y: 1350,
        r: 92,
      },
      {
        x: 1730,
        y: 1160,
        r: 92,
      },
      {
        x: 750,
        y: 1350,
        r: 92,
      },
      {
        x: 560,
        y: 1030,
        r: 92,
      },
    ],
  },
  {
    name: '안개숲 S자 샛길',
    theme:
      'lush misty pine forest, moss and ferns, winding warm dirt trails, dark forest outside path; small clearings around road ends',
    spawn: [550, 1260],
    paths: [
      [
        [0, 970],
        [400, 970],
        [550, 1260],
        [940, 1370],
        [1300, 1100],
        [1250, 720],
        [860, 500],
        [590, 610],
        [500, 380],
      ],
      [
        [940, 1370],
        [1310, 1660],
        [1024, 1810],
        [1024, 2048],
      ],
      [
        [1250, 720],
        [1610, 520],
      ],
    ],
    anchors: {
      dog: [940, 1370],
      'dog-b': [590, 610],
      enemy0: [1300, 1100],
      enemy1: [400, 970],
      captain: [500, 380],
      cave: [1610, 520],
      loot: [1310, 1660],
      'loot-b': [860, 500],
      mob0: [1024, 1870],
      mob1: [1250, 720],
      spare: [550, 1260],
    },
    width: 168,
    plazas: [
      {
        x: 940,
        y: 1370,
        r: 92,
      },
      {
        x: 590,
        y: 610,
        r: 92,
      },
      {
        x: 1300,
        y: 1100,
        r: 92,
      },
      {
        x: 400,
        y: 970,
        r: 92,
      },
      {
        x: 500,
        y: 380,
        r: 92,
      },
      {
        x: 1610,
        y: 520,
        r: 112,
      },
      {
        x: 1310,
        y: 1660,
        r: 92,
      },
      {
        x: 860,
        y: 500,
        r: 92,
      },
      {
        x: 1024,
        y: 1870,
        r: 92,
      },
      {
        x: 1250,
        y: 720,
        r: 92,
      },
      {
        x: 550,
        y: 1260,
        r: 92,
      },
    ],
  },
  {
    name: '물굽이와 막다른 부두',
    theme:
      'occupied modern cargo harbor, blue ocean, stone waterfront U curve with wood plank piers at dead ends, shipping crates and warehouses off route',
    spawn: [850, 1250],
    paths: [
      [
        [1024, 0],
        [1024, 400],
        [520, 550],
        [520, 1030],
        [850, 1250],
        [1450, 1250],
        [1660, 960],
        [2048, 970],
      ],
      [
        [850, 1250],
        [650, 1600],
        [1024, 1800],
        [1024, 2048],
      ],
      [
        [520, 1030],
        [260, 1200],
      ],
      [
        [1450, 1250],
        [1450, 1700],
      ],
      [
        [1660, 960],
        [1670, 510],
      ],
    ],
    anchors: {
      dog: [650, 1600],
      'dog-b': [1024, 400],
      enemy0: [1450, 1250],
      enemy1: [520, 550],
      captain: [1670, 510],
      cave: [1450, 1700],
      loot: [260, 1200],
      'loot-b': [520, 1030],
      mob0: [1024, 1870],
      mob1: [1660, 960],
      spare: [850, 1250],
    },
    width: 168,
    plazas: [
      {
        x: 650,
        y: 1600,
        r: 92,
      },
      {
        x: 1024,
        y: 400,
        r: 92,
      },
      {
        x: 1450,
        y: 1250,
        r: 92,
      },
      {
        x: 520,
        y: 550,
        r: 92,
      },
      {
        x: 1670,
        y: 510,
        r: 92,
      },
      {
        x: 1450,
        y: 1700,
        r: 112,
      },
      {
        x: 260,
        y: 1200,
        r: 92,
      },
      {
        x: 520,
        y: 1030,
        r: 92,
      },
      {
        x: 1024,
        y: 1870,
        r: 92,
      },
      {
        x: 1660,
        y: 960,
        r: 92,
      },
      {
        x: 850,
        y: 1250,
        r: 92,
      },
    ],
  },
  {
    name: '공장 지그재그 우회로',
    theme:
      'abandoned industrial rail district, orange brick factories and railway tracks outside walkways, worn light concrete roads, machinery in blocked zones',
    spawn: [720, 1700],
    paths: [
      [
        [1024, 0],
        [1024, 280],
        [520, 280],
        [520, 700],
        [1480, 700],
        [1480, 1180],
        [720, 1180],
        [720, 1700],
        [1024, 1700],
        [1024, 2048],
      ],
      [
        [0, 970],
        [260, 970],
        [520, 700],
      ],
      [
        [2048, 970],
        [1780, 970],
        [1480, 1180],
      ],
      [
        [1480, 1180],
        [1700, 1480],
        [1700, 1740],
      ],
      [
        [720, 1180],
        [400, 1480],
      ],
      [
        [520, 700],
        [520, 1180],
        [720, 1180],
      ],
    ],
    anchors: {
      dog: [1024, 1700],
      'dog-b': [520, 280],
      enemy0: [1480, 700],
      enemy1: [260, 970],
      captain: [400, 1480],
      cave: [1700, 1740],
      loot: [520, 1180],
      'loot-b': [1024, 280],
      mob0: [1780, 970],
      mob1: [1480, 1180],
      spare: [720, 1700],
    },
    width: 168,
    plazas: [
      {
        x: 1024,
        y: 1700,
        r: 92,
      },
      {
        x: 520,
        y: 280,
        r: 92,
      },
      {
        x: 1480,
        y: 700,
        r: 92,
      },
      {
        x: 260,
        y: 970,
        r: 92,
      },
      {
        x: 400,
        y: 1480,
        r: 92,
      },
      {
        x: 1700,
        y: 1740,
        r: 112,
      },
      {
        x: 520,
        y: 1180,
        r: 92,
      },
      {
        x: 1024,
        y: 280,
        r: 92,
      },
      {
        x: 1780,
        y: 970,
        r: 92,
      },
      {
        x: 1480,
        y: 1180,
        r: 92,
      },
      {
        x: 720,
        y: 1700,
        r: 92,
      },
    ],
  },
  {
    name: '엇갈린 안뜰',
    theme:
      'sinister modern headquarters compound at twilight, navy buildings with amber windows, two offset courtyards, security fences only outside marked paths, grey paving',
    spawn: [820, 1450],
    paths: [
      [
        [0, 970],
        [380, 970],
        [380, 520],
        [850, 520],
        [850, 1000],
        [380, 1000],
      ],
      [
        [850, 1000],
        [1230, 1000],
        [1230, 1450],
        [1750, 1450],
        [1750, 1000],
        [2048, 970],
      ],
      [
        [1230, 1450],
        [820, 1450],
        [820, 1750],
        [1024, 1840],
        [1024, 2048],
      ],
      [
        [850, 520],
        [1024, 330],
        [1024, 0],
      ],
      [
        [1230, 1000],
        [1450, 680],
        [1710, 680],
      ],
      [
        [1750, 1450],
        [1760, 1740],
      ],
    ],
    anchors: {
      dog: [820, 1450],
      'dog-b': [1024, 330],
      enemy0: [850, 1000],
      enemy1: [380, 520],
      captain: [1710, 680],
      cave: [1760, 1740],
      loot: [820, 1750],
      'loot-b': [850, 520],
      mob0: [1750, 1000],
      mob1: [1450, 680],
      spare: [1230, 1450],
    },
    width: 168,
    plazas: [
      {
        x: 820,
        y: 1450,
        r: 92,
      },
      {
        x: 1024,
        y: 330,
        r: 92,
      },
      {
        x: 850,
        y: 1000,
        r: 92,
      },
      {
        x: 380,
        y: 520,
        r: 92,
      },
      {
        x: 1710,
        y: 680,
        r: 92,
      },
      {
        x: 1760,
        y: 1740,
        r: 112,
      },
      {
        x: 820,
        y: 1750,
        r: 92,
      },
      {
        x: 850,
        y: 520,
        r: 92,
      },
      {
        x: 1750,
        y: 1000,
        r: 92,
      },
      {
        x: 1450,
        y: 680,
        r: 92,
      },
      {
        x: 1230,
        y: 1450,
        r: 92,
      },
    ],
  },
  {
    name: '꽃밭 세 갈래 탐험로',
    theme:
      'bright wildflower meadow, colorful flower fields and tall grass off winding tan dirt paths; tree clusters at edges, no houses',
    spawn: [1024, 1670],
    paths: [
      [
        [1024, 2048],
        [1024, 1670],
        [850, 1410],
        [1040, 1110],
      ],
      [
        [1040, 1110],
        [650, 900],
        [480, 570],
        [700, 330],
      ],
      [
        [1040, 1110],
        [1370, 950],
        [1600, 620],
        [1430, 330],
      ],
      [
        [1040, 1110],
        [950, 700],
        [1080, 460],
      ],
      [
        [650, 900],
        [510, 1230],
        [850, 1410],
      ],
      [
        [1370, 950],
        [1650, 1210],
        [1600, 1530],
      ],
    ],
    anchors: {
      dog: [850, 1410],
      'dog-b': [950, 700],
      enemy0: [1370, 950],
      enemy1: [650, 900],
      captain: [700, 330],
      cave: [1430, 330],
      loot: [1600, 1530],
      'loot-b': [1080, 460],
      mob0: [1024, 1840],
      mob1: [480, 570],
      spare: [1650, 1210],
    },
    width: 168,
    plazas: [
      {
        x: 850,
        y: 1410,
        r: 92,
      },
      {
        x: 950,
        y: 700,
        r: 92,
      },
      {
        x: 1370,
        y: 950,
        r: 92,
      },
      {
        x: 650,
        y: 900,
        r: 92,
      },
      {
        x: 700,
        y: 330,
        r: 92,
      },
      {
        x: 1430,
        y: 330,
        r: 112,
      },
      {
        x: 1600,
        y: 1530,
        r: 92,
      },
      {
        x: 1080,
        y: 460,
        r: 92,
      },
      {
        x: 1024,
        y: 1840,
        r: 92,
      },
      {
        x: 480,
        y: 570,
        r: 92,
      },
      {
        x: 1650,
        y: 1210,
        r: 92,
      },
    ],
  },
  {
    name: '해안 초승달 산책로',
    theme:
      'peaceful seaside village, turquoise sea outside the curved coastline, coral and blue cottage roofs, palm gardens, a broad crescent promenade with short shopping alleys; absolutely no monsters or caves',
    spawn: [960, 1280],
    paths: [
      [
        [1024, 0],
        [1024, 330],
        [650, 520],
        [500, 860],
        [610, 1150],
        [960, 1280],
        [1310, 1170],
        [1570, 880],
        [1800, 970],
        [2048, 970],
      ],
      [
        [650, 520],
        [980, 650],
        [1240, 520],
      ],
      [
        [960, 1280],
        [1000, 1650],
        [1360, 1650],
        [1570, 1370],
        [1570, 880],
      ],
      [
        [610, 1150],
        [350, 1390],
      ],
    ],
    anchors: {
      dog: [610, 1150],
      'dog-b': [1240, 520],
      shop: [650, 520],
      armory: [1570, 880],
      rest: [1000, 1650],
      npc0: [960, 1280],
      npc1: [1360, 1650],
      npc2: [350, 1390],
      npc3: [980, 650],
    },
    width: 184,
    plazas: [
      {
        x: 610,
        y: 1150,
        r: 92,
      },
      {
        x: 1240,
        y: 520,
        r: 92,
      },
      {
        x: 650,
        y: 520,
        r: 112,
      },
      {
        x: 1570,
        y: 880,
        r: 112,
      },
      {
        x: 1000,
        y: 1650,
        r: 92,
      },
      {
        x: 960,
        y: 1280,
        r: 92,
      },
      {
        x: 1360,
        y: 1650,
        r: 92,
      },
      {
        x: 350,
        y: 1390,
        r: 92,
      },
      {
        x: 980,
        y: 650,
        r: 92,
      },
    ],
  },
  {
    name: '수정다리 번개길',
    theme:
      'violet crystal gorge, deep purple chasms between rocky islands, pale stone zigzag paths with bridges across chasm segments exactly following guide, glowing crystals outside roads',
    spawn: [780, 1280],
    paths: [
      [
        [0, 970],
        [330, 970],
        [540, 660],
        [830, 850],
        [1060, 520],
        [1320, 760],
        [1530, 480],
        [1024, 220],
        [1024, 0],
      ],
      [
        [1320, 760],
        [1550, 1080],
        [1810, 970],
        [2048, 970],
      ],
      [
        [830, 850],
        [620, 1100],
        [780, 1280],
        [1150, 1450],
        [1480, 1380],
        [1710, 1600],
      ],
      [
        [780, 1280],
        [500, 1540],
        [700, 1750],
      ],
    ],
    anchors: {
      dog: [780, 1280],
      'dog-b': [1530, 480],
      enemy0: [1320, 760],
      enemy1: [540, 660],
      captain: [1710, 1600],
      cave: [700, 1750],
      loot: [1480, 1380],
      'loot-b': [1024, 220],
      mob0: [1810, 970],
      mob1: [1060, 520],
      spare: [620, 1100],
    },
    width: 168,
    plazas: [
      {
        x: 780,
        y: 1280,
        r: 92,
      },
      {
        x: 1530,
        y: 480,
        r: 92,
      },
      {
        x: 1320,
        y: 760,
        r: 92,
      },
      {
        x: 540,
        y: 660,
        r: 92,
      },
      {
        x: 1710,
        y: 1600,
        r: 92,
      },
      {
        x: 700,
        y: 1750,
        r: 112,
      },
      {
        x: 1480,
        y: 1380,
        r: 92,
      },
      {
        x: 1024,
        y: 220,
        r: 92,
      },
      {
        x: 1810,
        y: 970,
        r: 92,
      },
      {
        x: 1060,
        y: 520,
        r: 92,
      },
      {
        x: 620,
        y: 1100,
        r: 92,
      },
    ],
  },
  {
    name: '산마을 계단식 고리길',
    theme:
      'peaceful hillside pine village, terraced gardens and cozy mountain cottages, stone paths with shallow decorative stairs aligned with path, no caves or monsters',
    spawn: [830, 1390],
    paths: [
      [
        [0, 970],
        [300, 970],
        [480, 1300],
        [830, 1390],
        [1210, 1260],
        [1490, 1390],
        [1750, 1100],
        [2048, 970],
      ],
      [
        [480, 1300],
        [520, 750],
        [850, 610],
        [1230, 740],
        [1430, 1020],
        [1210, 1260],
      ],
      [
        [850, 610],
        [1024, 330],
        [1024, 0],
      ],
      [
        [830, 1390],
        [1010, 1670],
        [1400, 1720],
        [1490, 1390],
      ],
    ],
    anchors: {
      dog: [1210, 1260],
      'dog-b': [1024, 330],
      shop: [520, 750],
      armory: [1230, 740],
      rest: [1010, 1670],
      npc0: [830, 1390],
      npc1: [1750, 1100],
      npc2: [1400, 1720],
      npc3: [850, 610],
    },
    width: 184,
    plazas: [
      {
        x: 1210,
        y: 1260,
        r: 92,
      },
      {
        x: 1024,
        y: 330,
        r: 92,
      },
      {
        x: 520,
        y: 750,
        r: 112,
      },
      {
        x: 1230,
        y: 740,
        r: 112,
      },
      {
        x: 1010,
        y: 1670,
        r: 92,
      },
      {
        x: 830,
        y: 1390,
        r: 92,
      },
      {
        x: 1750,
        y: 1100,
        r: 92,
      },
      {
        x: 1400,
        y: 1720,
        r: 92,
      },
      {
        x: 850,
        y: 610,
        r: 92,
      },
    ],
  },
  {
    name: '폭풍 능선 굽이길',
    theme:
      'stormy mountain plateau, dark slate rock and purple clouds in abysses, pale rocky serpentine ridge trails, luminous blue lightning crystals away from clear roads',
    spawn: [820, 1310],
    paths: [
      [
        [0, 970],
        [300, 970],
        [440, 1320],
        [820, 1310],
        [1110, 1060],
        [800, 810],
        [560, 540],
        [930, 390],
        [1230, 520],
        [1530, 350],
        [1300, 170],
        [1024, 170],
        [1024, 0],
      ],
      [
        [1110, 1060],
        [1530, 1080],
        [1670, 1410],
        [1420, 1690],
        [1000, 1690],
        [820, 1310],
      ],
      [
        [1530, 1080],
        [1780, 750],
      ],
    ],
    anchors: {
      dog: [820, 1310],
      'dog-b': [1230, 520],
      enemy0: [1110, 1060],
      enemy1: [440, 1320],
      captain: [1780, 750],
      cave: [1420, 1690],
      loot: [1000, 1690],
      'loot-b': [560, 540],
      mob0: [1530, 350],
      mob1: [800, 810],
      spare: [1670, 1410],
    },
    width: 168,
    plazas: [
      {
        x: 820,
        y: 1310,
        r: 92,
      },
      {
        x: 1230,
        y: 520,
        r: 92,
      },
      {
        x: 1110,
        y: 1060,
        r: 92,
      },
      {
        x: 440,
        y: 1320,
        r: 92,
      },
      {
        x: 1780,
        y: 750,
        r: 92,
      },
      {
        x: 1420,
        y: 1690,
        r: 112,
      },
      {
        x: 1000,
        y: 1690,
        r: 92,
      },
      {
        x: 560,
        y: 540,
        r: 92,
      },
      {
        x: 1530,
        y: 350,
        r: 92,
      },
      {
        x: 800,
        y: 810,
        r: 92,
      },
      {
        x: 1670,
        y: 1410,
        r: 92,
      },
    ],
  },
  {
    name: '별빛 이중 산책길',
    theme:
      'safe magical modern night village, indigo sky palette, golden star lanterns, lavender roof cottages and gardens, two nested curved paths around a glowing garden, no cave or monsters',
    spawn: [1100, 1510],
    paths: [
      [
        [0, 970],
        [330, 970],
        [490, 650],
        [820, 440],
        [1260, 460],
        [1580, 720],
        [1660, 1120],
        [1430, 1430],
        [1100, 1510],
        [690, 1410],
        [410, 1180],
        [330, 970],
      ],
      [
        [1100, 1510],
        [1024, 1770],
        [1024, 2048],
      ],
      [
        [490, 650],
        [810, 800],
        [1210, 790],
        [1370, 1110],
        [1080, 1240],
        [810, 1110],
        [810, 800],
      ],
      [
        [1370, 1110],
        [1660, 1120],
      ],
    ],
    anchors: {
      dog: [1080, 1240],
      'dog-b': [1260, 460],
      shop: [810, 800],
      armory: [1370, 1110],
      rest: [1024, 1770],
      npc0: [1100, 1510],
      npc1: [690, 1410],
      npc2: [1580, 720],
      npc3: [820, 440],
    },
    width: 184,
    plazas: [
      {
        x: 1080,
        y: 1240,
        r: 92,
      },
      {
        x: 1260,
        y: 460,
        r: 92,
      },
      {
        x: 810,
        y: 800,
        r: 112,
      },
      {
        x: 1370,
        y: 1110,
        r: 112,
      },
      {
        x: 1024,
        y: 1770,
        r: 92,
      },
      {
        x: 1100,
        y: 1510,
        r: 92,
      },
      {
        x: 690,
        y: 1410,
        r: 92,
      },
      {
        x: 1580,
        y: 720,
        r: 92,
      },
      {
        x: 820,
        y: 440,
        r: 92,
      },
    ],
  },
];
export const routeLayout = (region: number) =>
  ROUTE_LAYOUTS[region] ?? ROUTE_LAYOUTS[1];
export function closestOnSegment(
  x: number,
  y: number,
  a: RoutePoint,
  b: RoutePoint,
) {
  const dx = b[0] - a[0],
    dy = b[1] - a[1];
  const t = Math.max(
    0,
    Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1)),
  );
  return { x: a[0] + t * dx, y: a[1] + t * dy };
}
export function onRoute(x: number, y: number, region: number) {
  if (x < 24 || x > 2024 || y < 24 || y > 2024) return false;
  const layout = routeLayout(region);
  return (
    layout.plazas.some((p) => Math.hypot(x - p.x, y - p.y) <= p.r) ||
    layout.paths.some((path) =>
      path.slice(1).some((b, i) => {
        const p = closestOnSegment(x, y, path[i], b);
        return Math.hypot(x - p.x, y - p.y) <= layout.width / 2;
      }),
    )
  );
}
export function nearestRoutePoint(x: number, y: number, region: number) {
  const points = routeLayout(region).paths.flatMap((path) =>
    path.slice(1).map((b, i) => closestOnSegment(x, y, path[i], b)),
  );
  const p = points.sort(
    (a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y),
  )[0];
  return {
    x: Math.max(24, Math.min(2024, p.x)),
    y: Math.max(24, Math.min(2024, p.y)),
  };
}
export function routeSpawn(region: number) {
  const [x, y] = routeLayout(region).spawn;
  return { x, y };
}
