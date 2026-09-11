'use client';
import {useEffect,useState} from 'react';
import {Swords,PawPrint,Backpack,Flag,RotateCw,UsersRound} from 'lucide-react';
import {Progress} from '@/components/ui/progress';
import {partyDogs,currentDog,BREEDS,type GameState,type Action} from '@/lib/game/model';
import {visibleBattleHp,type PlayingClip} from '@/lib/game/battle-motion';
import BattleStage from './battle-stage';

export default function BattleView({state,clip,onAction,onBag,onParty}:{state:GameState;clip:PlayingClip|null;onAction:(a:Action)=>unknown;onBag:()=>void;onParty:()=>void}){
 const [elapsed,setElapsed]=useState(0);
 useEffect(()=>{if(!clip){setElapsed(0);return;}let frame=0,last=0;const tick=(time:number)=>{if(time-last>32){setElapsed(Math.max(0,time-clip.startedAt));last=time;}frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[clip]);
 const battle=state.battle;if(!battle)return null;
 const party=partyDogs(state),busy=!!clip,lead=currentDog(state),hp=visibleBattleHp(state,clip,clip?Math.min(elapsed,clip.duration):0);
 return <div className={`battle-screen touch-battle action-battle ${busy?'is-acting':''}`}>
  <div className="combat-enemy-stat"><div><strong>{battle.enemy.name}</strong><small>TURN {battle.turn}</small></div><Progress value={hp.enemy/battle.enemy.maxHp*100}/><span>{hp.enemy} / {battle.enemy.maxHp} HP</span></div>
  <div className="combat-scene action-scene"><BattleStage state={state} clip={clip}/>{clip&&<div className="move-title" key={clip.id} aria-live="polite">{clip.counter&&elapsed>=clip.counter.start?'적의 반격':elapsed>clip.strikes.at(-1)!.impact&&clip.victory?'마무리!':clip.title}{clip.strikes.length>1&&elapsed>=clip.strikes[1].start&&elapsed<clip.strikes[1].end&&<small>동료 연계!</small>}</div>}</div>
  <div className="combat-party-stats">{party.map(dog=><button key={dog.id} disabled={busy||dog.id===state.active||dog.hp<=0} onClick={()=>onAction({type:'switch',id:dog.id})} aria-label={`${dog.name} · ${dog.id===state.active?'선두':'선두로 바꾸기, 한 턴 사용'}`}><div><strong>{dog.name}</strong><small>{dog.id===state.active?'선두':'지원'} · Lv.{dog.level}</small></div><Progress value={hp.dogs[dog.id]/dog.maxHp*100}/><span>{hp.dogs[dog.id]} / {dog.maxHp} HP</span></button>)}</div>
  <div className="combat-actions action-buttons" aria-busy={busy}>
   <button disabled={busy} onClick={()=>onAction({type:'attack'})}><Swords/><span>돌진 공격</span><small>달려가 부딪치기</small></button>
   <button disabled={busy} onClick={()=>onAction({type:'tail'})}><RotateCw/><span>꼬리치기</span><small>돌아서 꼬리 공격</small></button>
   <button className="skill-button" disabled={busy||battle.cooldown>0} onClick={()=>onAction({type:'skill'})}><PawPrint/><span>{BREEDS[lead.breed].skill}</span><small>{battle.cooldown?`${battle.cooldown}턴 뒤`:'동료의 특별한 기술'}</small></button>
   <button disabled={busy} onClick={onBag}><Backpack/><span>아이템</span><small>회복 / 장비</small></button>
   <button disabled={busy} onClick={onParty}><UsersRound/><span>동료</span><small>선두 바꾸기</small></button>
   <button disabled={busy} onClick={()=>onAction({type:'flee'})}><Flag/><span>물러나기</span><small>전투에서 후퇴</small></button>
  </div>
 </div>;
}
