import type {Appearance} from './appearance';
import {walkFrame,type WalkMotion} from './motion';
const images=new Map<string,HTMLImageElement>();
function asset(src:string){let image=images.get(src);if(!image){image=new Image();image.src=src;images.set(src,image);}return image;}
// Shared paper-doll renderer: the same saved appearance is used in every scene.
export function drawTraveler(ctx:CanvasRenderingContext2D,appearance:Appearance,x:number,y:number,size:number,motion:WalkMotion,stride=24){
 const body=asset(`/art/traveler/body-${appearance.outfit}-${appearance.color}.png`),heads=asset('/art/traveler/heads.png');
 if(!body.complete||!body.naturalWidth||!heads.complete||!heads.naturalWidth)return false;
 const frame=walkFrame(motion,stride),cx=x-size/2,cy=y-size*.83,bob=motion.moving&&frame%2?size*.006:0;
 ctx.drawImage(body,frame*256,motion.facing*256,256,256,cx,cy,size,size);
 ctx.drawImage(heads,motion.facing*256,appearance.head*256,256,256,cx,cy-bob,size,size);
 return true;
}
