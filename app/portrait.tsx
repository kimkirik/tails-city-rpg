import {BREEDS} from '@/lib/game/model';
import {DOG_WALK_SHEETS} from '@/lib/game/dog-art';
export default function Portrait({sprite,size=120}:{sprite:number;size?:number}){
 const breed=BREEDS.findIndex(b=>b.sprite===sprite);
 if(breed>=0)return <div className="portrait animated-dog-portrait" role="img" aria-label={`${BREEDS[breed].name} · 움직이는 강아지`} style={{width:size*.85,maxWidth:'100%',aspectRatio:'1',backgroundImage:`url(${DOG_WALK_SHEETS[breed]})`,backgroundSize:'400% 400%'}}/>;
 return <div className="portrait" role="img" aria-label={sprite===0?'여행자':'목줄단'} style={{width:size*.75,height:size,backgroundSize:`${size*3}px ${size*2}px`,backgroundPosition:`-${sprite%4*size*.75}px -${Math.floor(sprite/4)*size}px`}}/>;
}
