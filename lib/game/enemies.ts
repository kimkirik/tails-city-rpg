export const ENEMY_LOOKS = [
 {name:'목줄단 정찰병',outfit:'남색 후드 · 붉은 스카프'},
 {name:'목줄단 추격자',outfit:'보라색 머리 · 바이커 재킷'},
 {name:'숲의 매복병',outfit:'위장 조끼 · 정글 모자'},
 {name:'항구 약탈자',outfit:'주황색 우비 · 파란 비니'},
 {name:'공장 감시병',outfit:'안전모 · 중장갑 작업복'},
 {name:'신호기 기술병',outfit:'청록 고글 · 흰 연구복'},
 {name:'목줄단 지역대장',outfit:'붉은 제복 · 금빛 견장'},
 {name:'블랙테일 대장',outfit:'백발 · 검은 갑옷과 망토'},
] as const;

// Derive appearance from stable enemy identity, so existing saves need no migration.
export function enemyLook(id:string,region:number){
 if(id==='captain-5')return 7;
 if(id.startsWith('captain-'))return 6;
 if(id.startsWith('enemy-'))return id.endsWith('-1')?1:0;
 if(id.endsWith('-1'))return region>=4?5:4;
 return region===2?2:region===3?3:region>=4?4:2;
}
