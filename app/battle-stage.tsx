'use client';
import {useEffect,useRef} from 'react';
import {partyDogs,BREEDS,type GameState} from '@/lib/game/model';
import {DOG_WALK_SHEETS} from '@/lib/game/dog-art';
import {enemyLook} from '@/lib/game/enemies';
import {sprite,animatedSprite} from '@/lib/game/render';
import {clamp,stagePositions,dogStagePose,type PlayingClip} from '@/lib/game/battle-motion';

export default function BattleStage({state,clip}:{state:GameState;clip:PlayingClip|null}){
 const canvas=useRef<HTMLCanvasElement>(null),live=useRef({state,clip});live.current={state,clip};
 useEffect(()=>{
  const el=canvas.current!,ctx=el.getContext('2d')!;
  const load=(src:string)=>{const img=new Image();img.src=src;return img;};
  const dogs=DOG_WALK_SHEETS.map(load),enemies=load('/art/enemies.png'),fallback=load('/art/sprites.png'),poodle=load('/art/richi-poodle.png');
  let width=1,height=1,frame=0;
  const resize=()=>{const box=el.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,3);width=box.width;height=box.height;el.width=width*dpr;el.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);};
  const observer=new ResizeObserver(resize);observer.observe(el);resize();
  function draw(time:number){
   const {state:s,clip:action}=live.current,party=partyDogs(s),battle=s.battle;
   ctx.clearRect(0,0,width,height);if(!battle){frame=requestAnimationFrame(draw);return;}
   const elapsed=action?Math.max(0,time-action.startedAt):0,layout=stagePositions(width,height,party.length),enemy=layout.enemy;
   const scale=layout.dogSize/125,hitTimes=action?.strikes.map(h=>h.impact)??[];
   const impactAge=elapsed-Math.max(-10000,...hitTimes.filter(t=>t<=elapsed));
   const counter=action?.counter,counterAge=counter?elapsed-counter.impact:-10000;
   const shake=impactAge>=0&&impactAge<150?Math.sin(impactAge*.2)*(1-impactAge/150)*4:0;
   ctx.save();ctx.translate(shake,counterAge>=0&&counterAge<120?Math.cos(counterAge*.17)*2:0);
   ctx.fillStyle='#224e3625';ctx.beginPath();ctx.ellipse(enemy.x,enemy.y+5,layout.enemySize*.45,layout.enemySize*.1,0,0,Math.PI*2);ctx.fill();
   for(const home of layout.dogs){ctx.beginPath();ctx.ellipse(home.x,home.y+3,layout.dogSize*.35,layout.dogSize*.1,0,0,Math.PI*2);ctx.fill();}
   let enemyX=enemy.x,enemyY=enemy.y;
   if(counter){const home=layout.dogs[party.findIndex(d=>d.id===counter.dogId)];if(home){const t=elapsed-counter.start,progress=t<340?clamp(t/280):1-clamp((t-410)/270);enemyX+=(home.x+layout.dogSize*.25-enemy.x)*progress;enemyY+=(home.y-enemy.y)*progress;}}
   ctx.save();
   if(action?.victory){const vanish=clamp((elapsed-action.strikes.at(-1)!.impact-260)/450);ctx.globalAlpha=1-vanish;enemyY+=vanish*20;}
   if(impactAge>=0&&impactAge<130){ctx.filter='brightness(2)';enemyX+=Math.sin(impactAge*.15)*6;}
   sprite(ctx,enemies,enemyLook(battle.enemy.id,battle.enemy.region),enemyX,enemyY+Math.sin(time*.003)*2,layout.enemySize);ctx.restore();
   for(const [slot,dog] of party.entries()){
    const strike=action?.strikes.find(h=>h.dogId===dog.id),position=dogStagePose(layout,slot,strike,elapsed),pose=position.pose;
    let {x,y}=position;
    const isHit=counter?.dogId===dog.id&&counterAge>=0;
    if(isHit&&counterAge<220)x-=Math.sin(clamp(counterAge/220)*Math.PI)*14*scale;
    if(pose?.active&&pose.move>.05){
     ctx.save();ctx.strokeStyle=strike!.color;ctx.globalAlpha=.3;ctx.lineWidth=2*scale;
     for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(x-35*scale-i*9*scale,y-20*scale+i*8*scale);ctx.lineTo(x-70*scale-i*10*scale,y-20*scale+i*8*scale);ctx.stroke();}ctx.restore();
    }
    ctx.save();if(dog.hp<=0||(isHit&&counter!.damage>=dog.hp&&counterAge>160))ctx.globalAlpha=.4;
    if(isHit&&counterAge<120)ctx.filter='brightness(1.8)';
    const moving=pose?.active??false,facing=pose?.active?pose.facing:2;
    const motion={facing:facing as 0|1|2|3,distance:(moving?pose!.frame:Math.floor(time/340)%4)*19,moving:true};
    if(!animatedSprite(ctx,dogs[dog.breed],x,y+(!moving?Math.sin(time*.003+slot)*2:0),layout.dogSize,motion,19))sprite(ctx,fallback,BREEDS[dog.breed].sprite,x,y,layout.dogSize,false,poodle);
    ctx.restore();
    if(pose?.spinning){
     const phase=(elapsed-strike!.start)*.025;ctx.save();ctx.translate(x,y-layout.dogSize*.3);ctx.scale(1,.5);ctx.strokeStyle=strike!.color;ctx.lineWidth=6*scale;ctx.shadowBlur=12;ctx.shadowColor=strike!.color;ctx.beginPath();ctx.arc(0,0,layout.dogSize*.55,phase,phase+Math.PI*1.55);ctx.stroke();ctx.restore();
    }
   }
   if(action){
    for(const [i,hit] of action.strikes.entries()){
     const age=elapsed-hit.impact;if(age<0||age>700)continue;
     const fade=1-clamp(age/700);ctx.save();ctx.globalAlpha=fade;ctx.translate(enemy.x,enemy.y-layout.enemySize*.35);
     if(age<250){ctx.strokeStyle=hit.color;ctx.lineWidth=3*scale;const radius=(10+age*.18)*scale;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke();for(let n=0;n<9;n++){const angle=n*Math.PI*2/9+i;ctx.fillStyle=n%2?hit.color:'#fff8d4';ctx.fillRect(Math.cos(angle)*radius*1.2,Math.sin(angle)*radius*.8,5*scale,5*scale);}}
     ctx.font=`900 ${Math.max(19,27*scale)}px Arial`;ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#24432e';ctx.fillStyle=i?'#e0ffc0':'#fff1ad';const y=-30-age*.055;ctx.strokeText(`−${hit.damage}`,i?22:-14,y);ctx.fillText(`−${hit.damage}`,i?22:-14,y);ctx.restore();
    }
    if(counter&&counterAge>=0&&counterAge<650){const home=layout.dogs[party.findIndex(d=>d.id===counter.dogId)];if(home){ctx.save();ctx.globalAlpha=1-counterAge/650;ctx.font=`900 ${Math.max(18,24*scale)}px Arial`;ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#3a312d';ctx.fillStyle='#ffc7b6';ctx.strokeText(`−${counter.damage}`,home.x,home.y-layout.dogSize*.6-counterAge*.055);ctx.fillText(`−${counter.damage}`,home.x,home.y-layout.dogSize*.6-counterAge*.055);ctx.restore();}}
   }
   ctx.restore();frame=requestAnimationFrame(draw);
  }
  frame=requestAnimationFrame(draw);return()=>{cancelAnimationFrame(frame);observer.disconnect();};
 },[]);
 return <canvas className="battle-stage" ref={canvas} aria-label="강아지들이 달려가 공격하고 돌아오는 전투 장면"/>;
}
