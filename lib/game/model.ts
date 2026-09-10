import {enemyLook,ENEMY_LOOKS} from './enemies.ts';
export const SIZE = 2048;
export const REGIONS = [
 {id:0,name:'솔빛 강변공원',en:'SOLBIT RIVERSIDE',tag:'여정의 시작',level:1,color:'#7ca965',desc:'강가의 작은 공원. 잃어버린 강아지들의 첫 단서가 남아 있다.',neighbors:[-1,1,3,-1]},
 {id:1,name:'연두 마을',en:'YEONDU NEIGHBORHOOD',tag:'골목의 소문',level:2,color:'#cfa36f',desc:'상점과 주민들이 모인 안전한 마을. 마을 외곽의 대장을 쓰러뜨려 골목을 지켜라.',neighbors:[-1,2,4,0]},
 {id:2,name:'안개솔 숲',en:'MISTPINE FOREST',tag:'숲의 수호자',level:3,color:'#547e64',desc:'도시 외곽의 깊은 숲. 검은 목줄단이 비밀 신호기를 숨겨 놓았다.',neighbors:[-1,-1,5,1]},
 {id:3,name:'파도빛 항구',en:'TIDELIGHT HARBOR',tag:'수상한 화물',level:4,color:'#649ca9',desc:'푸른 바다 너머로 사라지는 수상한 배. 컨테이너 속 단서를 찾아라.',neighbors:[0,4,-1,-1]},
 {id:4,name:'철길 공업지대',en:'IRON RAIL DISTRICT',tag:'멈춰 버린 공장',level:5,color:'#a27f68',desc:'기계 소리에 가려진 작은 울음. 목줄단의 공급망이 이곳을 지난다.',neighbors:[1,5,-1,3]},
 {id:5,name:'블랙테일 본부',en:'BLACKTAIL HEADQUARTERS',tag:'마지막 신호',level:7,color:'#536780',desc:'다섯 신호기를 끄고 도시를 되찾자. 블랙테일의 대장이 기다린다.',neighbors:[2,-1,-1,4]},
];
export const BREEDS = [
 {name:'시바',sprite:1,skill:'불꽃 돌진',type:'용맹',color:'#dd9852',atk:12,hp:76},
 {name:'사모예드',sprite:2,skill:'눈꽃 바람',type:'수호',color:'#90b9c4',atk:11,hp:88},
 {name:'보더콜리',sprite:3,skill:'번개 질주',type:'민첩',color:'#7e8aab',atk:15,hp:66},
 {name:'닥스훈트',sprite:4,skill:'대지 울림',type:'끈기',color:'#b68563',atk:13,hp:82},
 {name:'웰시코기',sprite:5,skill:'응원의 짖음',type:'활력',color:'#dbad5f',atk:12,hp:90},
 {name:'허스키',sprite:6,skill:'서리 송곳니',type:'용맹',color:'#7c9ba8',atk:17,hp:78},
 {name:'푸들',sprite:8,skill:'불꽃 돌진',type:'용맹',color:'#a86d42',atk:12,hp:76},
];
export const WEAPONS:Record<string,{attack:number}>= {bat:{attack:4},sword:{attack:9},stun:{attack:15}};
export const ITEMS:Record<string,{name:string;icon:string;desc:string;price:number}> = {
 treat:{name:'친구 간식',icon:'🦴',desc:'야생 강아지와 친구가 됩니다. 가까이 다가가 강아지를 터치하세요.',price:35},
 potion:{name:'회복 포션',icon:'🧪',desc:'현재 동료의 체력을 45 회복합니다.',price:45},
 berry:{name:'산딸기',icon:'🍓',desc:'현재 동료의 체력을 20 회복합니다.',price:15},
 revive:{name:'든든한 도시락',icon:'🍱',desc:'현재 동료를 완전히 회복하고 다시 일으킵니다.',price:90},
 bat:{name:'나무 방망이',icon:'🏏',desc:'여행자의 함께 공격 피해가 4 증가합니다. 구입하면 바로 장착됩니다.',price:120},
 sword:{name:'강철 검',icon:'🗡️',desc:'여행자의 함께 공격 피해가 9 증가합니다. 구입하면 바로 장착됩니다.',price:320},
 stun:{name:'전기 진압봉',icon:'⚡',desc:'여행자의 함께 공격 피해가 15 증가합니다. 구입하면 바로 장착됩니다.',price:680},
};
export type Dog={id:string;name:string;breed:number;level:number;xp:number;hp:number;maxHp:number;atk:number;bond:number;sex?:'female'|'male';coat?:'brown'};
export type Slot={item:string;qty:number}|null;
export type Drop={id:string;region:number;x:number;y:number;originX:number;originY:number;item:string;qty:number;createdAt:number};
export type Enemy={id:string;name:string;hp:number;maxHp:number;atk:number;captain:boolean;region:number};
export type Battle={enemy:Enemy;turn:number;cooldown:number;log:string[]};
export type GameState={version:1;region:number;x:number;y:number;coins:number;capacity:number;bag:Slot[];dogs:Dog[];active:string;defeated:string[];recruited:string[];looted:string[];visited:number[];battle:Battle|null;steps:number;won:boolean;seconds:number;place:'field'|'shop';outside?:{x:number;y:number};weapon:string|null;enemyHealth:Record<string,number>;respawnAt:Record<string,number>;kills:number;encounterGraceUntil:number;drops:Drop[];playerName:string;party:string[]};
export type Entity={id:string;kind:'dog'|'enemy'|'shop'|'rest'|'loot'|'merchant'|'exit'|'drop';name:string;x:number;y:number;breed?:number;captain?:boolean;item?:string;qty?:number};
export function makeDog(id:string,name:string,breed:number,level=1):Dog {const b=BREEDS[breed];return {id,name,breed,level,xp:0,hp:b.hp+(level-1)*10,maxHp:b.hp+(level-1)*10,atk:b.atk+(level-1)*3,bond:1};}
export function newGame():GameState {return {version:1,region:0,x:1024,y:1190,coins:320,capacity:25,bag:[{item:'treat',qty:5},{item:'potion',qty:4},{item:'berry',qty:3},{item:'revive',qty:1},...Array(21).fill(null)],dogs:[asRichi(makeDog('starter','리치',6,2))],active:'starter',defeated:[],recruited:[],looted:[],visited:[0],battle:null,steps:0,won:false,seconds:0,place:'field',weapon:null,enemyHealth:{},respawnAt:{},kills:0,encounterGraceUntil:0,drops:[],playerName:'여행자',party:['starter']};}
export function asRichi(dog:Dog):Dog {return {...dog,name:'리치',breed:6,sex:'female',coat:'brown'};}
export function dogDescription(dog:Dog){return [dog.coat==='brown'?'갈색':null,BREEDS[dog.breed].name,dog.sex==='female'?'♀ 암컷':dog.sex==='male'?'♂ 수컷':null].filter(Boolean).join(' · ');}
export function partyDogs(s:GameState){return s.party.map(id=>s.dogs.find(d=>d.id===id)!).filter(Boolean);}
function leadWith(s:GameState,id:string){const support=s.party.filter(other=>other!==id&&other!==s.active);s.party=[id,...(s.party.includes(id)?s.party.filter(other=>other!==id):support)].slice(0,2);s.active=id;}
export function currentDog(s:GameState){return s.dogs.find(d=>d.id===s.active)!;}
export function countItem(s:GameState,id:string){return s.bag.reduce((n,v)=>n+(v?.item===id?v.qty:0),0);}
export function bagRoom(s:GameState,id:string){return s.bag.reduce((n,v)=>n+(!v?9:v.item===id?9-v.qty:0),0);}
export function putItem(s:GameState,id:string,qty=1):boolean {const free=bagRoom(s,id);if(free<qty)return false;for(let i=0;i<s.bag.length&&qty>0;i++){const v=s.bag[i];if(v?.item===id&&v.qty<9){const add=Math.min(9-v.qty,qty);v.qty+=add;qty-=add;}}for(let i=0;i<s.bag.length&&qty>0;i++)if(!s.bag[i]){const add=Math.min(9,qty);s.bag[i]={item:id,qty:add};qty-=add;}return true;}
function takeItem(s:GameState,id:string){const i=s.bag.findIndex(v=>v?.item===id);if(i<0)return false;if(--s.bag[i]!.qty===0)s.bag[i]=null;return true;}
export function entities(s:GameState):Entity[]{const r=s.region;if(s.place==='shop')return [{id:`counter-${r}`,kind:'merchant',name:'상인 미로',x:1024,y:820},{id:`exit-${r}`,kind:'exit',name:'상점 출구',x:1024,y:1840}];const names=['구름','보리','번개','초코','두부','루나'];return [
 {id:`dog-${r}`,kind:'dog',name:names[r],breed:[1,4,2,3,0,5][r],x:1120,y:1110},
 {id:`dog-${r}-b`,kind:'dog',name:['쿠키','밤이','솔이','바다','철이','별이'][r],breed:[4,0,5,2,1,3][r],x:1024,y:r===5?1700:360},
 {id:`enemy-${r}-0`,kind:'enemy',name:'목줄단 정찰병',x:1470,y:1024},
 {id:`enemy-${r}-1`,kind:'enemy',name:'목줄단 추격자',x:580,y:1024},
 {id:`captain-${r}`,kind:'enemy',name:r===5?'블랙테일 대장':'목줄단 지역대장',captain:true,x:1024,y:r===5?900:610},
 {id:`shop-${r}`,kind:'shop',name:'여행 상점',x:890,y:1024},
 {id:`rest-${r}`,kind:'rest',name:'쉼터',x:1024,y:1350},
 {id:`loot-${r}`,kind:'loot',name:'보급 상자',x:1800,y:1024},
 {id:`loot-${r}-b`,kind:'loot',name:'숨겨진 배낭',x:1024,y:1770},
 {id:`mob-${r}-0`,kind:'enemy',name:r===2?'숲의 매복병':r===3?'항구 약탈자':'목줄단 순찰병',x:1024,y:1490},
 {id:`mob-${r}-1`,kind:'enemy',name:r===4?'공장 감시병':'목줄단 경비병',x:1630,y:970},
 ...s.drops.filter(d=>d.region===r).map(d=>({id:d.id,kind:'drop',name:`${ITEMS[d.item].name} ×${d.qty}`,x:d.x,y:d.y,item:d.item,qty:d.qty})),
 ...(r===0?[{id:'captain-1',kind:'enemy',name:'마을 외곽 대장',captain:true,x:1024,y:450}]:[]),
 ].map(e=>e.kind==='enemy'?{...e,name:e.id==='captain-1'?'마을 외곽 대장':ENEMY_LOOKS[enemyLook(e.id,r)].name}:e).filter(e=>(r!==1||e.kind!=='enemy')&&!s.defeated.includes(e.id)&&!s.recruited.includes(e.id)&&!s.looted.includes(e.id)&&(!(e.id in s.respawnAt)||s.respawnAt[e.id]<=s.seconds)) as Entity[];}
export function nearest(s:GameState){return entities(s).map(e=>({...e,d:Math.hypot(e.x-s.x,e.y-s.y)})).filter(e=>e.d<105).sort((a,b)=>a.d-b.d)[0];}
export function walkable(x:number,y:number,region=-1,place:'field'|'shop'='field'){if(place==='shop')return y>=780&&y<=1875&&(y<=1600?x>=280&&x<=1768:x>=870&&x<=1178);const bounds=(region!==5||y>=830)&&x>=24&&x<=SIZE-24&&y>=24&&y<=SIZE-24;const road=Math.abs(x-1024)<87||Math.abs(y-970)<73;const plaza=region===0&&x>860&&x<1190&&y>785&&y<1125;const fountain=region===0&&Math.hypot(x-1024,y-935)<115;return bounds&&(road||plaza)&&!fountain;}
export type Action={type:'interact';id:string}|{type:'attack'|'skill'|'flee'|'expand'|'pickup'}|{type:'item'|'buy';id:string}|{type:'switch'|'party';id:string}|{type:'rename';name:string}|{type:'travel';region:number;gate?:boolean;edge?:number};
export type Result={state:GameState;message:string;event?:'shop'|'win'|'loss'|'recruit'|'attack'|'enter_shop'|'leave_shop'|'pickup';loot?:{item:string;qty:number}[]};
export function act(source:GameState,a:Action):Result {const s=structuredClone(source);let message='';let event:Result['event'];let loot:Result['loot'];const fail=(m:string)=>({state:source,message:m});
 if(s.battle&&['interact','expand','buy','travel','pickup'].includes(a.type))return fail('전투를 마친 뒤 이용할 수 있어요.');
 if(a.type==='rename'){const name=a.name.trim();if(!name||name.length>12||/[\u0000-\u001f\u007f]/.test(name))return fail('이름을 1~12자로 입력하세요.');s.playerName=name;return {state:s,message:`이제 ${name}(으)로 모험합니다.`};}
 if(a.type==='party'){if(s.battle)return fail('전투를 마친 뒤 동료를 편성하세요.');const dog=s.dogs.find(d=>d.id===a.id);if(!dog)return fail('아직 만나지 못한 동료예요.');if(s.party.includes(a.id)){if(s.party.length===1)return fail('최소 한 마리의 동료가 함께해야 해요.');s.party=s.party.filter(id=>id!==a.id);s.active=s.party[0];return {state:s,message:`${dog.name}(이)가 잠시 쉬어요.`};}if(s.party.length===2)return fail('두 마리까지 동행할 수 있어요. 다른 동료의 동행을 해제하세요.');s.party.push(a.id);return {state:s,message:`${dog.name}(이)도 함께 걷고 싸웁니다!`};}
 if(a.type==='pickup')return collectDrops(source,90);
 if(a.type==='interact') {const e=entities(s).find(e=>e.id===a.id);if(!e||Math.hypot(e.x-s.x,e.y-s.y)>110)return fail('조금 더 가까이 다가가세요.');
 if(e.kind==='drop')return collectDrops(source,145);
 if(e.kind==='shop'){s.outside={x:s.x,y:s.y};s.place='shop';s.x=1024;s.y=1660;return {state:s,message:'문을 열고 상점에 들어왔어요. 카운터의 상인에게 말을 걸어 보세요.',event:'enter_shop'};}
 if(e.kind==='merchant')return {state:s,message:'포션과 무기를 골라 보세요.',event:'shop'};
 if(e.kind==='exit'){s.place='field';s.x=s.outside?.x??1024;s.y=s.outside?.y??1190;delete s.outside;s.encounterGraceUntil=s.seconds+4;return {state:s,message:'상점 밖으로 나왔어요.',event:'leave_shop'};}
 if(e.kind==='rest'){s.dogs.forEach(d=>d.hp=d.maxHp);message='잠깐 쉬었어요. 모든 동료의 체력이 회복되었습니다.';}
 if(e.kind==='loot'){if(!putItem(s,'potion',2))return fail('가방이 가득 찼어요. 공간을 비워 주세요.');s.looted.push(e.id);s.coins+=60;message='회복 포션 2개와 60 코인을 찾았어요!';}
 if(e.kind==='dog'){if(!takeItem(s,'treat'))return fail('친구 간식이 필요해요. 상점에서 구할 수 있어요.');s.dogs.push(makeDog(e.id,e.name,e.breed!,Math.max(1,s.region+1)));s.recruited.push(e.id);if(s.party.length<2)s.party.push(e.id);message=`${e.name}(이)가 새로운 친구가 되었어요! 동료 창에서 두 마리까지 함께할 수 있어요.`;event='recruit';}
 if(e.kind==='enemy'){if(!s.dogs.some(d=>d.hp>0))return fail('동료들이 지쳤어요. 쉼터에서 쉬어 주세요.');if(e.id==='captain-5'&&s.defeated.filter(id=>id.startsWith('captain-')).length<5)return fail('마을 밖의 다섯 대장을 먼저 쓰러뜨리고 신호기를 꺼야 해요.');if(currentDog(s).hp<=0)leadWith(s,partyDogs(s).find(d=>d.hp>0)?.id??s.dogs.find(d=>d.hp>0)!.id);s.battle={enemy:enemyStats(s,e),turn:1,cooldown:0,log:[`${e.name}(이)가 길을 막아섰다!`]};message='동료와 힘을 합쳐 싸우세요.';}
 }
 if(a.type==='expand'){const cost=200+(s.capacity-25)*12;if(s.capacity>=100)return fail('최대 100칸까지 확장했습니다.');if(s.coins<cost)return fail(`${cost} 코인이 필요해요.`);s.coins-=cost;s.capacity+=5;s.bag.push(...Array(5).fill(null));message=`가방이 ${s.capacity}칸으로 넓어졌어요!`;}
 if(a.type==='buy'){if(!ITEMS[a.id])return fail('알 수 없는 아이템입니다.');if(s.place!=='shop'||!entities(s).some(e=>e.kind==='merchant'&&Math.hypot(e.x-s.x,e.y-s.y)<=110))return fail('상점 안의 상인에게 가까이 가세요.');if(WEAPONS[a.id]&&countItem(s,a.id)>0)return fail('이미 보유한 무기예요. 가방에서 장착할 수 있어요.');if(s.coins<ITEMS[a.id].price)return fail('코인이 부족해요.');if(!putItem(s,a.id))return fail('가방이 가득 찼어요.');s.coins-=ITEMS[a.id].price;if(WEAPONS[a.id])s.weapon=a.id;message=`${ITEMS[a.id].name} 1개를 구입했어요.`;}
 if(a.type==='switch'){const d=s.dogs.find(d=>d.id===a.id);if(!d)return fail('아직 만나지 못한 동료예요.');if(s.battle&&d.hp<=0)return fail('이 동료는 회복이 필요해요.');if(s.active===d.id)return fail('이미 함께하고 있어요.');leadWith(s,d.id);message=`${d.name}(이)가 앞장섭니다!`;if(s.battle)enemyTurn(s);}
 if(a.type==='item'&&WEAPONS[a.id]){if(!countItem(s,a.id))return fail('아직 보유하지 않은 무기예요.');if(s.weapon===a.id)return fail('이미 장착 중입니다.');s.weapon=a.id;message=`${ITEMS[a.id].name} 장착! 함께 공격 +${WEAPONS[a.id].attack}`;if(s.battle){s.battle.log.push(message);enemyTurn(s);}}
 if(a.type==='item'&&!WEAPONS[a.id]){if(!ITEMS[a.id])return fail('알 수 없는 아이템입니다.');if(a.id==='treat')return fail('강아지 가까이 다가가 터치하면 간식을 줄 수 있어요.');const d=currentDog(s);if(d.hp===d.maxHp)return fail('이미 체력이 가득 차 있어요.');if(d.hp<=0&&a.id!=='revive')return fail('쓰러진 동료에게는 든든한 도시락을 사용해 주세요.');if(!takeItem(s,a.id))return fail('아이템이 없어요.');d.hp=Math.min(d.maxHp,d.hp+(a.id==='potion'?45:a.id==='berry'?20:d.maxHp));message=`${d.name}(이)의 체력이 회복되었어요.`;if(s.battle){s.battle.log.push(message);enemyTurn(s);}}
 if(a.type==='attack'||a.type==='skill'){if(!s.battle)return fail('전투 중에 사용할 수 있어요.');if(a.type==='skill'&&s.battle.cooldown>0)return fail(`${s.battle.cooldown}턴 뒤에 기술을 쓸 수 있어요.`);const d=currentDog(s);const support=partyDogs(s).find(p=>p.id!==d.id&&p.hp>0);const assist=support?Math.max(1,Math.round(support.atk*(a.type==='skill'?.8:.65))):0;const primary=d.atk+(a.type==='skill'?18+d.level*2:7+(s.weapon?WEAPONS[s.weapon].attack:0));const damage=primary+assist;s.battle.enemy.hp=Math.max(0,s.battle.enemy.hp-damage);s.enemyHealth[s.battle.enemy.id]=s.battle.enemy.hp;message=`${d.name}의 ${a.type==='skill'?BREEDS[d.breed].skill:'함께 공격'}! ${primary} 피해${support?` · ${support.name} 지원 +${assist}`:''}`;s.battle.log.push(message);event='attack';if(a.type==='skill')s.battle.cooldown=3;
 if(s.battle.enemy.hp<=0){const en=s.battle.enemy;const reward=55+en.region*25+(en.captain?100:0);s.coins+=reward;s.kills++;loot=dropRewards(s,en);s.encounterGraceUntil=s.seconds+4;if(en.id.startsWith('mob-'))s.respawnAt[en.id]=s.seconds+30;else s.defeated.push(en.id);for(const member of partyDogs(s)){member.xp+=Math.round((35+en.region*15+(en.captain?30:0))*(member.id===d.id?1:.75));member.bond++;while(member.xp>=member.level*45){member.xp-=member.level*45;member.level++;member.maxHp+=10;member.atk+=3;member.hp=member.maxHp;}}s.battle=null;message=`승리! +${reward} 코인 · 아이템 ${loot.reduce((n,v)=>n+v.qty,0)}개가 쏟아졌어요!`;event='win';if(en.id==='captain-5'){s.won=true;message='도시를 되찾았어요! 강아지들과 함께 여섯 지역을 자유롭게 탐험하세요.';}}
 else enemyTurn(s);
 }
 if(a.type==='flee'){if(!s.battle)return fail('진행 중인 전투가 없어요.');s.battle=null;s.encounterGraceUntil=s.seconds+5;if(walkable(s.x,s.y+110,s.region))s.y+=110;else if(walkable(s.x+110,s.y,s.region))s.x+=110;message='안전하게 물러났어요. 회복한 뒤 다시 도전하세요.';}
 if(a.type==='travel'){if(s.place==='shop')return fail('상점 밖으로 나온 뒤 이동하세요.');if(!REGIONS[a.region])return fail('존재하지 않는 지역입니다.');if(a.gate){const dx=s.x,dy=s.y;const edge=(s.region===5?dy<860:dy<80)?0:dx>SIZE-80?1:dy>SIZE-80?2:dx<80?3:-1;if(edge<0||REGIONS[s.region].neighbors[edge]!==a.region)return fail('출구 가까이로 이동하세요.');s.x=edge===1?80:edge===3?SIZE-80:1024;s.y=edge===2?80:edge===0?SIZE-80:1024;}else{if(!s.visited.includes(a.region))return fail('먼저 연결된 길을 따라 이 지역을 발견하세요.');s.x=1024;s.y=1190;}s.region=a.region;if(a.region===5&&s.y<860)s.y=970;if(!s.visited.includes(a.region))s.visited.push(a.region);message=`${REGIONS[a.region].name}에 도착했어요.`;}
 if(s.battle){s.battle.log=s.battle.log.slice(-5);if(currentDog(s).hp<=0){const next=partyDogs(s).find(d=>d.hp>0)??s.dogs.find(d=>d.hp>0);if(next){leadWith(s,next.id);s.battle.log.push(`${next.name}(이)가 대신 나섰다!`);}else{s.battle=null;s.place='field';delete s.outside;s.region=0;s.x=1024;s.y=1350;s.encounterGraceUntil=s.seconds+5;s.coins=Math.floor(s.coins*.9);s.dogs.forEach(d=>d.hp=d.maxHp);message='쉼터에서 다시 눈을 떴어요. 동료들은 회복했고 코인을 10% 잃었어요.';event='loss';}}}
 return {state:s,message,event,loot};
}
// Ground rewards survive travel and saves; dense piles merge without losing items.
function dropRewards(s:GameState,en:Enemy){
 const actor=entities(s).find(e=>e.id===en.id);const origin={x:actor?.x??s.x,y:actor?.y??s.y};
 const rewards=[{item:'potion',qty:3},{item:'berry',qty:4},{item:'treat',qty:2},{item:'potion',qty:2},{item:'berry',qty:3},{item:'revive',qty:1}];
 if(en.captain){rewards.forEach(r=>r.qty*=2);rewards.push({item:'revive',qty:2},{item:'treat',qty:3});}
 if(en.captain||s.kills%4===0)rewards.push({item:en.region>=4?'stun':en.region>=2?'sword':'bat',qty:1});
 rewards.forEach((r,i)=>{
  const angle=i*2.399963+s.kills*.6,radius=45+(i%3)*27,tx=origin.x+Math.cos(angle)*radius,ty=origin.y+Math.sin(angle)*radius;
  let x=s.x,y=s.y,best=Infinity;
  for(let yy=ty-108;yy<=ty+108;yy+=12)for(let xx=tx-108;xx<=tx+108;xx+=12){const dist=(xx-tx)**2+(yy-ty)**2;if(dist<best&&walkable(Math.round(xx),Math.round(yy),s.region)){x=Math.round(xx);y=Math.round(yy);best=dist;}}
  const same=s.drops.find(d=>d.region===s.region&&d.item===r.item);
  if(same&&s.drops.filter(d=>d.region===s.region).length>=72){same.qty+=r.qty;return;}
  s.drops.push({id:`drop-${s.kills}-${i}`,region:s.region,x:Math.round(x),y:Math.round(y),originX:origin.x,originY:origin.y,item:r.item,qty:r.qty,createdAt:s.seconds});
 });
 return rewards;
}
function collectDrops(source:GameState,radius:number):Result {
 if(source.place!=='field'||source.battle)return {state:source,message:'탐험 중에 전리품을 주울 수 있어요.'};
 const nearby=source.drops.filter(d=>d.region===source.region&&Math.hypot(d.x-source.x,d.y-source.y)<=radius);
 if(!nearby.length)return {state:source,message:'전리품 가까이로 이동하세요.'};
 const s=structuredClone(source),picked:Record<string,number>={};let remaining=false;
 for(const original of nearby){const drop=s.drops.find(d=>d.id===original.id)!;const qty=Math.min(drop.qty,bagRoom(s,drop.item));if(qty>0&&putItem(s,drop.item,qty)){drop.qty-=qty;picked[drop.item]=(picked[drop.item]??0)+qty;if(WEAPONS[drop.item]&&(!s.weapon||WEAPONS[drop.item].attack>WEAPONS[s.weapon].attack))s.weapon=drop.item;}if(drop.qty)remaining=true;}
 s.drops=s.drops.filter(d=>d.qty>0);
 const total=Object.values(picked).reduce((a,b)=>a+b,0);
 if(!total)return {state:source,message:'가방이 가득 찼어요. 아이템은 바닥에 남아 있으니 가방을 비우거나 확장하세요.'};
 return {state:s,event:'pickup',message:`${Object.entries(picked).map(([id,n])=>`${ITEMS[id].icon} ${ITEMS[id].name} +${n}`).join(' · ')}${remaining?' · 남은 전리품은 바닥에 보관됩니다.':''}`};
}
export function enemyStats(s:GameState,e:Entity):Enemy {const maxHp=(e.captain?90:42)+s.region*(e.captain?27:16);const damaged=s.enemyHealth[e.id];return {id:e.id,name:e.name,hp:damaged>0?Math.min(damaged,maxHp):maxHp,maxHp,atk:8+s.region*3+(e.captain?3:0),captain:!!e.captain,region:s.region};}
function enemyTurn(s:GameState){const b=s.battle!;const living=partyDogs(s).filter(d=>d.hp>0);const d=living[(b.turn-1)%living.length]??currentDog(s);const damage=Math.max(2,b.enemy.atk-Math.floor(d.level/2));d.hp=Math.max(0,d.hp-damage);b.log.push(`${b.enemy.name}의 반격! ${d.name} -${damage} HP`);b.turn++;b.cooldown=Math.max(0,b.cooldown-1);}
export function packSave(s:GameState){return JSON.stringify({game:'tails-city',savedAt:new Date().toISOString(),state:s});}
export function unpackSave(text:string):GameState {if(text.length>200000)throw Error('저장 파일이 너무 큽니다.');const p=JSON.parse(text);const s=p?.state;const int=(v:unknown,min:number,max:number)=>Number.isInteger(v)&&Number(v)>=min&&Number(v)<=max;const ids=(v:unknown,re:RegExp,max:number)=>Array.isArray(v)&&v.length<=max&&new Set(v).size===v.length&&v.every(x=>typeof x==='string'&&re.test(x));if(p.game!=='tails-city'||!s||s.version!==1||!int(s.region,0,5)||!Number.isFinite(s.x)||!Number.isFinite(s.y)||!walkable(s.x,s.y,s.region,s.place??'field')||!int(s.coins,0,99999999)||!int(s.capacity,25,100)||(s.capacity-25)%5!==0||!Array.isArray(s.bag)||s.bag.length!==s.capacity||!s.bag.every((v:Slot)=>v===null||(v&&ITEMS[v.item]&&int(v.qty,1,9)))||!Array.isArray(s.dogs)||s.dogs.length<1||s.dogs.length>13||!s.dogs.every((d:Dog)=>d&&typeof d.id==='string'&&/^(starter|dog-[0-5](-b)?)$/.test(d.id)&&typeof d.name==='string'&&d.name.length>0&&d.name.length<=20&&int(d.breed,0,BREEDS.length-1)&&(d.sex===undefined||d.sex==='female'||d.sex==='male')&&(d.coat===undefined||d.coat==='brown')&&int(d.level,1,999)&&int(d.xp,0,999999)&&int(d.hp,0,d.maxHp)&&int(d.maxHp,1,99999)&&int(d.atk,1,99999)&&int(d.bond,0,999999))||new Set(s.dogs.map((d:Dog)=>d.id)).size!==s.dogs.length||!s.dogs.some((d:Dog)=>d.id===s.active)||!ids(s.defeated,/^(enemy-[0-5]-[01]|captain-[0-5])$/,18)||!ids(s.recruited,/^dog-[0-5](-b)?$/,12)||!ids(s.looted,/^loot-[0-5](-b)?$/,12)||!Array.isArray(s.visited)||!s.visited.includes(s.region)||!s.visited.every((r:number)=>int(r,0,5))||!int(s.steps,0,999999999)||!int(s.seconds,0,999999999)||typeof s.won!=='boolean')throw Error('테일즈 시티 저장 파일 형식이 올바르지 않습니다.');
 const playerName=s.playerName??'여행자';const party=s.party??[s.active,...s.dogs.filter((d:Dog)=>d.id!==s.active).slice(0,1).map((d:Dog)=>d.id)];
 if(typeof playerName!=='string'||!playerName.trim()||playerName!==playerName.trim()||playerName.length>12||/[\u0000-\u001f\u007f]/.test(playerName)||!Array.isArray(party)||party.length<1||party.length>2||new Set(party).size!==party.length||party[0]!==s.active||!party.every((id:unknown)=>s.dogs.some((d:Dog)=>d.id===id)))throw Error('이름 또는 동행 편성 정보가 올바르지 않습니다.');
 const drops=s.drops??[];
 if(!Array.isArray(drops)||drops.length>474||new Set(drops.map((d:Drop)=>d?.id)).size!==drops.length||!drops.every((d:Drop)=>d&&/^drop-[0-9]+-[0-9]+$/.test(d.id)&&int(d.region,0,5)&&Object.hasOwn(ITEMS,d.item)&&int(d.qty,1,999999999)&&int(d.createdAt,0,s.seconds)&&Number.isFinite(d.x)&&Number.isFinite(d.y)&&walkable(d.x,d.y,d.region)&&Number.isFinite(d.originX)&&Number.isFinite(d.originY)&&d.originX>=0&&d.originX<=SIZE&&d.originY>=0&&d.originY<=SIZE))throw Error('전리품 저장 정보가 올바르지 않습니다.');
 const place=s.place??'field';const weapon=s.weapon??null;const enemyHealth=s.enemyHealth??{};const respawnAt=s.respawnAt??{};const record=(value:unknown)=>!!value&&typeof value==='object'&&!Array.isArray(value)&&Object.entries(value).length<=40&&Object.entries(value).every(([id,n])=>/^(enemy-[0-5]-[01]|captain-[0-5]|mob-[0-5]-[01])$/.test(id)&&int(n,0,999999999));
 if(!['field','shop'].includes(place)||(weapon!==null&&(!WEAPONS[weapon]||!s.bag.some((slot:Slot)=>slot?.item===weapon)))||!record(enemyHealth)||!record(respawnAt)||!int(s.kills??0,0,999999999)||!int(s.encounterGraceUntil??0,0,999999999)||(place==='shop'&&(!s.outside||!Number.isFinite(s.outside.x)||!Number.isFinite(s.outside.y)||!walkable(s.outside.x,s.outside.y,s.region))))throw Error('상점 또는 전투 저장 정보가 올바르지 않습니다.');
 // Normalize legacy fields and preserve progression when updating the starter.
 return {...s,playerName,party,drops,place,weapon,enemyHealth,respawnAt,kills:s.kills??0,encounterGraceUntil:s.encounterGraceUntil??0,dogs:s.dogs.map((dog:Dog)=>dog.id==='starter'?asRichi(dog):dog),battle:null} as GameState;
}
