export type InstallPlatform='ios'|'android'|'mac-safari'|'desktop'|'embedded';
export type InstallPromptEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>};
export type InstallSnapshot={available:boolean;pending:boolean;installed:boolean;platform:InstallPlatform};
export function installPlatform(userAgent:string,touchPoints=0):InstallPlatform{
 if(/KAKAOTALK|NAVER\(|FBAN|FBAV|Instagram|Line\/|; wv\)|Electron|Codex/i.test(userAgent))return 'embedded';
 if(/iPad|iPhone|iPod/i.test(userAgent)||(/Macintosh/i.test(userAgent)&&touchPoints>1))return 'ios';
 if(/Android/i.test(userAgent))return 'android';
 if(/Macintosh/i.test(userAgent)&&/Safari/i.test(userAgent)&&!/Chrome|Chromium|Edg|OPR/i.test(userAgent))return 'mac-safari';
 return 'desktop';
}
// A native prompt is single-use, and acceptance is not proof that installation finished.
export class InstallController{
 private event:InstallPromptEvent|null=null;
 private listeners=new Set<()=>void>();
 private snapshot:InstallSnapshot={available:false,pending:false,installed:false,platform:'desktop'};
 getSnapshot=()=>this.snapshot;
 subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener);};};
 private update(change:Partial<InstallSnapshot>){this.snapshot={...this.snapshot,...change};for(const listener of this.listeners)listener();}
 platform(value:InstallPlatform){this.update({platform:value});}
 capture(event:InstallPromptEvent){event.preventDefault();if(this.snapshot.installed)return;this.event=event;this.update({available:!this.snapshot.pending});}
 installed(){this.event=null;this.update({installed:true,available:false,pending:false});}
 clear(){this.event=null;this.update({available:false});}
 async request():Promise<'accepted'|'dismissed'|'unavailable'|'busy'|'failed'>{
  if(this.snapshot.pending)return 'busy';
  const event=this.event;if(!event||this.snapshot.installed)return 'unavailable';
  this.event=null;this.update({pending:true,available:false});
  try{await event.prompt();return (await event.userChoice).outcome;}catch{return 'failed';}
  finally{this.update({pending:false,available:!!this.event&&!this.snapshot.installed});}
 }
}
