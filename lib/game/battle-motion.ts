import {act,partyDogs,currentDog,BREEDS,WEAPONS,type GameState,type Result} from './model.ts';
export type AttackKind='attack'|'tail'|'skill';
export type AttackStyle='dash'|'tail'|'leap';
export type BattleStrike={dogId:string;slot:number;style:AttackStyle;damage:number;start:number;impact:number;end:number;color:string};
export type BattleClip={id:number;kind:AttackKind;title:string;strikes:BattleStrike[];counter:{dogId:string;damage:number;start:number;impact:number;end:number}|null;enemyHp:number;duration:number;victory:boolean};
export type PlayingClip=BattleClip&{startedAt:number};
const COLORS=['#ff9b49','#adf6ff','#d4e8ff','#f6c17b','#b9f483','#a9ddff','#ffad60'];

export function makeBattleClip(s:GameState,kind:AttackKind,result:Result,id=0):BattleClip{
 const party=partyDogs(s),lead=currentDog(s),battle=s.battle!;
 let hp=battle.enemy.hp;
 const strikes:BattleStrike[]=[];
 for(const [slot,dog] of party.entries()){
  if(dog.hp<=0||hp<=0)continue;
  const damage=slot===0?dog.atk+(kind==='skill'?18+dog.level*2:7+(s.weapon?WEAPONS[s.weapon].attack:0)):Math.max(1,Math.round(dog.atk*(kind==='skill'?.8:.65)));
  const start=slot===0?100:590,style:AttackStyle=kind==='tail'?'tail':kind==='skill'?[1,5].includes(dog.breed)?'leap':[3,4].includes(dog.breed)?'tail':'dash':'dash';
  strikes.push({dogId:dog.id,slot,style,damage:Math.min(hp,damage),start,impact:start+400,end:start+860,color:COLORS[dog.breed]});
  hp=Math.max(0,hp-damage);
 }
 const last=strikes.at(-1)!,counterStart=last.end+70;
 const living=party.filter(d=>d.hp>0),target=living[(battle.turn-1)%living.length];
 const counter=hp>0&&target?{dogId:target.id,damage:Math.min(target.hp,Math.max(2,battle.enemy.atk-Math.floor(target.level/2))),start:counterStart,impact:counterStart+340,end:counterStart+690}:null;
 return {id,kind,title:kind==='tail'?'회전 꼬리치기':kind==='skill'?BREEDS[lead.breed].skill:'돌진 공격',strikes,counter,enemyHp:hp,duration:counter?counter.end+100:last.end+420,victory:result.event==='win'};
}

// Reserve one turn until its animation ends. Repeated taps cannot award extra hits or loot.
export class BattleDirector{
 private pending:Result|null=null;
 private serial=0;
 get busy(){return this.pending!==null;}
 begin(s:GameState,kind:AttackKind){
  if(this.pending)return null;
  const result=act(s,{type:kind});
  if(result.state===s||!s.battle)return {result,clip:null};
  const clip=makeBattleClip(s,kind,result,++this.serial);this.pending=result;
  return {result,clip};
 }
 finish(){const result=this.pending;this.pending=null;return result;}
 cancel(){this.pending=null;}
}

export function visibleBattleHp(s:GameState,clip:BattleClip|null,elapsed:number){
 const dogs=Object.fromEntries(partyDogs(s).map(d=>[d.id,d.hp]));let enemy=s.battle?.enemy.hp??0;
 if(clip){for(const hit of clip.strikes)if(elapsed>=hit.impact)enemy-=hit.damage;const counter=clip.counter;if(counter&&elapsed>=counter.impact)dogs[counter.dogId]=Math.max(0,dogs[counter.dogId]-counter.damage);}
 return {enemy:Math.max(0,enemy),dogs};
}

export const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const smooth=(n:number)=>{const t=clamp(n);return t*t*(3-2*t);};
export function strikePose(strike:BattleStrike,elapsed:number){
 const t=elapsed-strike.start,move=t<400?smooth((t-100)/260):1-smooth((t-570)/260);
 const active=t>=0&&t<860,spinning=strike.style==='tail'&&t>=270&&t<=600;
 return {move,active,spinning,jump:strike.style==='leap'?Math.sin(clamp((t-110)/520)*Math.PI):0,frame:Math.floor(Math.max(0,t)/70)%4,facing:spinning?([2,3,1,0] as const)[Math.floor((t-270)/65)%4]:t>570?1:2};
}

export function stagePositions(width:number,height:number,count:number){
 const size=Math.min(140,width*.31,height*.50),enemySize=Math.min(180,width*.42,height*.65);
 return {dogSize:size,enemySize,enemy:{x:width*.76,y:Math.max(enemySize*.85,height*.34)},dogs:Array.from({length:count},(_,i)=>({x:width*(i===0?.18:.4),y:height*(i===0?.73:.88)}))};
}

export function dogStagePose(layout:ReturnType<typeof stagePositions>,slot:number,strike:BattleStrike|undefined,elapsed:number){
 const home=layout.dogs[slot],pose=strike?strikePose(strike,elapsed):null;
 const x=home.x+(layout.enemy.x-layout.enemySize*.30-home.x)*(pose?.move??0);
 const y=home.y+(layout.enemy.y+layout.dogSize*.15-home.y)*(pose?.move??0)-(pose?.jump??0)*layout.dogSize*.6;
 return {x,y:Math.max(layout.dogSize*.83+3,y),pose};
}
