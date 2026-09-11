const ARROWS=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
export class KeyboardMovement{
 private held=new Set<string>();
 down(key:string,blocked=false){if(!ARROWS.has(key))return false;if(blocked){this.clear();return false;}this.held.add(key);return true;}
 up(key:string){this.held.delete(key);}
 clear(){this.held.clear();}
 vector(){const x=Number(this.held.has('ArrowRight'))-Number(this.held.has('ArrowLeft')),y=Number(this.held.has('ArrowDown'))-Number(this.held.has('ArrowUp')),length=Math.hypot(x,y)||1;return {x:x/length,y:y/length};}
}
