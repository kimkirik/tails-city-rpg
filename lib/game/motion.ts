export type Facing=0|1|2|3; // down, left, right, up; matches the sprite-sheet rows.
export type WalkMotion={facing:Facing;distance:number;moving:boolean};
export const idleMotion=():WalkMotion=>({facing:0,distance:0,moving:false});
export function advanceMotion(motion:WalkMotion,dx:number,dy:number):WalkMotion {
 const distance=Math.hypot(dx,dy);
 if(distance<.05)return {...motion,moving:false};
 const facing:Facing=Math.abs(dx)>Math.abs(dy)?dx<0?1:2:dy<0?3:0;
 return {facing,distance:motion.distance+distance,moving:true};
}
export function walkFrame(motion:WalkMotion,stride=24){return motion.moving?Math.floor(motion.distance/stride)%4:1;}
