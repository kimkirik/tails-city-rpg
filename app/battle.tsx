'use client';
import {Swords,PawPrint,Backpack,Flag} from 'lucide-react';
import {Progress} from '@/components/ui/progress';
import {partyDogs,currentDog,BREEDS,WEAPONS,type GameState,type Action} from '@/lib/game/model';
import {enemyLook,ENEMY_LOOKS} from '@/lib/game/enemies';
import Portrait from './portrait';
export default function BattleView({state,onAction,onBag}:{state:GameState;onAction:(a:Action)=>unknown;onBag:()=>void}){
 const battle=state.battle;if(!battle)return null;const party=partyDogs(state),lead=currentDog(state);
 return <div className="battle-screen touch-battle">
  <div className="combat-enemy-stat"><div><strong>{battle.enemy.name}</strong><small>TURN {battle.turn}</small></div><Progress value={battle.enemy.hp/battle.enemy.maxHp*100}/><span>{battle.enemy.hp} / {battle.enemy.maxHp} HP</span></div>
  <div className="combat-scene"><div className="battle-enemy"><div className="enemy-portrait" role="img" aria-label={ENEMY_LOOKS[enemyLook(battle.enemy.id,battle.enemy.region)].outfit} style={{width:158,height:210,backgroundImage:'url(/art/enemies.png)',backgroundSize:'400% 200%',backgroundPosition:`${enemyLook(battle.enemy.id,battle.enemy.region)%4*100/3}% ${Math.floor(enemyLook(battle.enemy.id,battle.enemy.region)/4)*100}%`}}/></div><div className="combat-pets">{party.map(dog=><div key={dog.id} className={dog.hp<=0?'tired':''}><Portrait sprite={BREEDS[dog.breed].sprite} size={165}/></div>)}</div></div>
  <div className="combat-party-stats">{party.map(dog=><button key={dog.id} disabled={dog.id===state.active||dog.hp<=0} onClick={()=>onAction({type:'switch',id:dog.id})} aria-label={`${dog.name} · ${dog.id===state.active?'선두':`선두로 바꾸기, 한 턴 사용`}`}><div><strong>{dog.name}</strong><small>{dog.id===state.active?'선두':'지원'} · Lv.{dog.level}</small></div><Progress value={dog.hp/dog.maxHp*100}/><span>{dog.hp} / {dog.maxHp} HP</span></button>)}</div>
  <div className="combat-actions"><button onClick={()=>onAction({type:'attack'})}><Swords/>함께 공격<small>{party.filter(d=>d.hp>0).length}마리 협공{state.weapon?` · 무기 +${WEAPONS[state.weapon].attack}`:''}</small></button><button className="skill-button" disabled={battle.cooldown>0} onClick={()=>onAction({type:'skill'})}><PawPrint/>{BREEDS[lead.breed].skill}<small>{battle.cooldown?`${battle.cooldown}턴 뒤`:'동료 지원 포함'}</small></button><button onClick={onBag}><Backpack/>아이템<small>회복 / 장비</small></button><button onClick={()=>onAction({type:'flee'})}><Flag/>물러나기<small>전투에서 후퇴</small></button></div>
 </div>;
}
