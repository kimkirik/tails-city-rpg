'use client';
import {useEffect,useRef} from 'react';
import {drawTraveler} from '@/lib/game/traveler-art';
import type {Appearance} from '@/lib/game/appearance';
export default function TravelerPreview({appearance,size=180,facing=0,walking=false}:{appearance:Appearance;size?:number;facing?:0|1|2|3;walking?:boolean}){
 const {head,outfit,color}=appearance;
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const el=canvas.current!,ctx=el.getContext('2d')!,dpr=Math.min(devicePixelRatio||1,3);el.width=size*dpr;el.height=size*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);let frame=0,attempts=0;
  const draw=(time:number)=>{ctx.clearRect(0,0,size,size);ctx.imageSmoothingEnabled=false;const ready=drawTraveler(ctx,{head,outfit,color},size/2,size*.9,size,{facing,moving:walking,distance:walking?Math.floor(time/130)%4*24:0});if(walking||(!ready&&attempts++<300))frame=requestAnimationFrame(draw);};
  frame=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame);
 },[head,outfit,color,size,facing,walking]);
 return <canvas ref={canvas} className="traveler-preview" style={{width:size,height:size}} aria-label="여행자 모습 미리보기"/>;
}
