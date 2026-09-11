import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,makeDog,act,entities,currentDog,packSave,unpackSave} from './model.ts';
import {BattleDirector,makeBattleClip,visibleBattleHp,strikePose,stagePositions,dogStagePose,travelerStagePose,type AttackKind} from './battle-motion.ts';
import {DOG_WALK_SHEETS} from './dog-art.ts';

function battle(){let s=newGame();s.dogs.push(makeDog('dog-0','구름',1));s.recruited.push('dog-0');s.party.push('dog-0');const enemy=entities(s).find(e=>e.id==='captain-0')!;s.x=enemy.x;s.y=enemy.y;return act(s,{type:'interact',id:enemy.id}).state;}

test('tail attack is a real turn with support damage and one enemy counterattack',()=>{
 const s=battle(),tail=act(s,{type:'tail'}),normal=act(s,{type:'attack'});
 assert.equal(tail.state.battle!.enemy.hp,normal.state.battle!.enemy.hp);
 assert.equal(tail.state.battle!.turn,s.battle!.turn+1);assert.match(tail.message,/꼬리치기/);
 assert.ok(tail.state.dogs[0].hp<s.dogs[0].hp);assert.equal(tail.state.dogs[1].hp,s.dogs[1].hp);
 assert.equal(act(newGame(),{type:'tail'}).state.battle,null);
});

test('attack numbers and HP change at impacts, and the retaliation comes after both pets return',()=>{
 const s=battle();for(const kind of ['attack','tail','skill'] as AttackKind[]){const result=act(s,{type:kind}),clip=makeBattleClip(s,kind,result);
  assert.equal(clip.strikes.length,3);assert.ok(clip.counter!.start>clip.strikes.at(-1)!.end);
  assert.equal(visibleBattleHp(s,clip,clip.strikes[0].impact-1).enemy,s.battle!.enemy.hp);
  assert.equal(visibleBattleHp(s,clip,clip.strikes[0].impact).enemy,s.battle!.enemy.hp-clip.strikes[0].damage);
  assert.equal(visibleBattleHp(s,clip,clip.duration).enemy,result.state.battle!.enemy.hp);
  assert.equal(visibleBattleHp(s,clip,clip.counter!.impact-1).dogs.starter,s.dogs[0].hp);
  assert.equal(visibleBattleHp(s,clip,clip.duration).dogs.starter,result.state.dogs[0].hp);
 }
});

test('queued combat cannot be double-tapped or award victory loot more than once',()=>{
 const s=battle();currentDog(s).atk=1000;const director=new BattleDirector(),pending=director.begin(s,'tail')!;
 assert.ok(director.busy);assert.equal(s.kills,0);assert.equal(s.drops.length,0);assert.equal(director.begin(s,'attack'),null);
 assert.equal(pending.clip!.strikes.length,2);assert.equal(pending.clip!.counter,null);assert.equal(pending.clip!.strikes.reduce((n,h)=>n+h.damage,0),s.battle!.enemy.hp);
 const result=director.finish()!;assert.equal(result.state.kills,1);assert.ok(result.state.drops.length>0);assert.equal(director.finish(),null);assert.equal(director.busy,false);
 assert.equal(unpackSave(packSave(result.state)).kills,1);
 const other=new BattleDirector();other.begin(battle(),'attack');other.cancel();assert.equal(other.finish(),null);assert.equal(other.busy,false);
});

test('skill cooldown rejects a clip and fainted support never gets an animation strike',()=>{
 const s=battle();s.battle!.cooldown=2;const director=new BattleDirector();assert.equal(director.begin(s,'skill')!.clip,null);assert.equal(director.busy,false);
 s.dogs[1].hp=0;const next=director.begin(s,'tail')!;assert.equal(next.clip!.strikes.length,2);director.cancel();
});

test('running reaches the enemy and returns home; tail attacks turn through all four directions',()=>{
 const s=battle(),clip=makeBattleClip(s,'tail',act(s,{type:'tail'})),hit=clip.strikes[1];
 assert.equal(strikePose(hit,hit.start).move,0);assert.ok(strikePose(hit,hit.impact).move>.99);assert.equal(strikePose(hit,hit.end).move,0);
 const directions=new Set(Array.from({length:6},(_,i)=>strikePose(hit,hit.start+275+i*55).facing));assert.equal(directions.size,4);
 assert.equal(DOG_WALK_SHEETS.length,7);assert.equal(new Set(DOG_WALK_SHEETS).size,7);
});

test('all breed attack paths fit both short and tall stages without clipping the dogs',()=>{
 for(const [w,h] of [[292,160],[360,320],[740,150],[980,520]])for(let breed=0;breed<7;breed++){
  const s=battle();s.dogs[0].breed=breed;const clip=makeBattleClip(s,'skill',act(s,{type:'skill'}));const layout=stagePositions(w,h,2);
  for(let t=0;t<=clip.duration;t+=35)for(const [slot,dog] of s.dogs.entries()){
   const p=dogStagePose(layout,slot,clip.strikes.find(hit=>hit.actorId===dog.id),t);
   assert.ok(p.x-layout.dogSize*.5>=0);assert.ok(p.x+layout.dogSize*.5<=w);assert.ok(p.y-layout.dogSize*.82>=0);assert.ok(p.y+layout.dogSize*.18<=h);
  }
 }
});

 test('owner visibly attacks alongside the lead, and all actor paths fit the stage',()=>{
  const s=battle(),clip=makeBattleClip(s,'attack',act(s,{type:'attack'}));
  assert.equal(clip.strikes[0].actorId,'traveler');assert.equal(clip.strikes[1].actorId,s.active);
  assert.ok(clip.strikes[1].start<clip.strikes[0].impact);assert.ok(clip.strikes[1].impact<clip.strikes[0].end);
  for(const [w,h] of [[260,90],[292,160],[360,320],[740,150],[980,520]]){
   const layout=stagePositions(w,h,2);
   for(let t=0;t<=clip.duration;t+=35){const p=travelerStagePose(layout,clip.strikes[0],t);
    assert.ok(p.x-layout.travelerSize*.5>=0);assert.ok(p.x+layout.travelerSize*.5<=w);assert.ok(p.y-layout.travelerSize*.83>=0);assert.ok(p.y+layout.travelerSize*.17<=h);
   }
  }
 });
