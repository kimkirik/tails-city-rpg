export type Region = {
  id: number;
  name: string;
  en: string;
  tag: string;
  level: number;
  color: string;
  desc: string;
  neighbors: number[];
  town: boolean;
};
export const REGIONS: Region[] = [
  {
    id: 0,
    name: '솔빛 강변공원',
    en: 'SOLBIT RIVERSIDE',
    tag: '강변 전투지',
    level: 1,
    color: '#7ca965',
    desc: '목줄단이 점거한 공원. 동쪽 연두 마을에서 보급한 뒤 도전하세요.',
    neighbors: [-1, 1, 3, -1],
    town: false,
  },
  {
    id: 1,
    name: '연두 마을',
    en: 'YEONDU VILLAGE',
    tag: '첫 번째 쉼터',
    level: 1,
    color: '#cfa36f',
    desc: '안전한 시작 마을. 주민 네 명에게 정보를 얻고 두 상점에서 준비하세요.',
    neighbors: [6, 2, 4, 0],
    town: true,
  },
  {
    id: 2,
    name: '안개솔 숲',
    en: 'MISTPINE FOREST',
    tag: '숲의 수호자',
    level: 3,
    color: '#547e64',
    desc: '깊은 숲 전투지. 해독약을 준비하고 독안개 동굴에 도전하세요.',
    neighbors: [-1, -1, 5, 1],
    town: false,
  },
  {
    id: 3,
    name: '파도빛 항구',
    en: 'TIDELIGHT HARBOR',
    tag: '수상한 화물',
    level: 4,
    color: '#649ca9',
    desc: '목줄단의 화물 기지. 남쪽 바람포구 마을에서 쉬어 갈 수 있어요.',
    neighbors: [0, 4, 7, -1],
    town: false,
  },
  {
    id: 4,
    name: '철길 공업지대',
    en: 'IRON RAIL DISTRICT',
    tag: '멈춘 공장',
    level: 5,
    color: '#a27f68',
    desc: '목줄단의 공급망을 끊고 남쪽 수정 협곡을 탐험하세요.',
    neighbors: [1, 5, 8, 3],
    town: false,
  },
  {
    id: 5,
    name: '블랙테일 본부',
    en: 'BLACKTAIL HEADQUARTERS',
    tag: '마지막 신호',
    level: 7,
    color: '#536780',
    desc: '다섯 지역의 대장과 용을 이긴 뒤 마지막 신호를 끄세요.',
    neighbors: [2, 11, 9, 4],
    town: false,
  },
  {
    id: 6,
    name: '꽃바람 들판',
    en: 'WILDFLOWER OUTSKIRTS',
    tag: '마을 밖 첫 원정',
    level: 2,
    color: '#b4bd70',
    desc: '연두 마을 북쪽의 전투지. 햇살룡의 꽃굴이 들판 깊숙이 있어요.',
    neighbors: [-1, -1, 1, -1],
    town: false,
  },
  {
    id: 7,
    name: '바람포구 마을',
    en: 'SEABREEZE VILLAGE',
    tag: '바닷바람 쉼터',
    level: 4,
    color: '#81b9c3',
    desc: '항구 원정대의 안전한 보급 마을. 주민과 이야기하며 다음 길을 찾아요.',
    neighbors: [3, 8, -1, -1],
    town: true,
  },
  {
    id: 8,
    name: '수정 협곡',
    en: 'CRYSTAL GORGE',
    tag: '빛나는 심연',
    level: 8,
    color: '#ad9adc',
    desc: '수정 몬스터와 수정룡의 레이드. 동서쪽 마을에서 준비하세요.',
    neighbors: [4, 9, -1, 7],
    town: false,
  },
  {
    id: 9,
    name: '솔마루 마을',
    en: 'PINEHILL VILLAGE',
    tag: '산길의 쉼표',
    level: 8,
    color: '#a2b389',
    desc: '수정 협곡과 폭풍 고원을 잇는 안전한 산마을.',
    neighbors: [5, 10, -1, 8],
    town: true,
  },
  {
    id: 10,
    name: '폭풍 고원',
    en: 'STORM PLATEAU',
    tag: '번개의 끝',
    level: 10,
    color: '#8890c6',
    desc: '번개가 흐르는 마지막 고원. 폭풍룡에게 도전해 희귀 전리품을 찾아요.',
    neighbors: [11, -1, -1, 9],
    town: false,
  },
  {
    id: 11,
    name: '별빛 마을',
    en: 'STARLIGHT VILLAGE',
    tag: '별 아래 휴식',
    level: 10,
    color: '#9188b3',
    desc: '본부와 고원 사이의 안전한 마을. 무료 회복과 상점으로 원정을 준비해요.',
    neighbors: [-1, -1, 10, 5],
    town: true,
  },
];
export const isTown = (region: number) => REGIONS[region]?.town === true;
export const CAMPAIGN_REGIONS = [0, 6, 2, 3, 4];
export const roadY = (region: number) =>
  (({ 7: 1016, 8: 1000, 9: 930, 10: 1005, 11: 990 }) as Record<number, number>)[
    region
  ] ?? 970;
