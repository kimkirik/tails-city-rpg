export type MusicMode='explore'|'battle';
export type ChipNote={voice:'lead'|'arp'|'bass'|'kick'|'snare'|'hat';midi:number;duration:number;volume:number};
export const MUSIC_TEMPO={explore:108,battle:156};
export const MUSIC_STEPS=128;

// Original eight-bar themes. Numbers are MIDI pitches; zero is a rest.
const exploreMelody=[
 [72,0,76,79,81,79,76,74], [72,76,79,0,76,74,72,0],
 [69,0,72,76,79,76,72,71], [69,72,76,0,74,72,69,0],
 [65,69,72,0,74,72,69,67], [67,71,74,79,77,74,71,0],
 [76,79,84,83,81,79,76,74], [72,76,79,74,71,74,72,0],
];
const battleMelody=[
 [76,76,79,78,76,83,82,79], [78,78,81,79,78,75,78,83],
 [76,79,84,83,79,78,76,79], [78,75,71,75,78,81,83,87],
 [88,83,79,83,86,83,79,78], [86,81,78,81,84,81,78,75],
 [84,83,79,78,76,79,83,86], [87,83,81,78,75,78,83,75],
];
const exploreChords=[[48,52,55],[48,52,55],[45,48,52],[45,48,52],[41,45,48],[43,47,50],[48,52,55],[43,47,50]];
const battleChords=[[40,43,47],[38,42,45],[36,40,43],[35,39,42],[40,43,47],[38,42,45],[36,40,43],[35,39,42]];

export function scoreStep(mode:MusicMode,step:number):ChipNote[]{
 const index=((step%MUSIC_STEPS)+MUSIC_STEPS)%MUSIC_STEPS,bar=Math.floor(index/16),beat=index%16;
 const sixteenth=60/MUSIC_TEMPO[mode]/4,tense=mode==='battle';
 const chord=(tense?battleChords:exploreChords)[bar],notes:ChipNote[]=[];
 if(beat%2===0){const midi=(tense?battleMelody:exploreMelody)[bar][beat/2];if(midi)notes.push({voice:'lead',midi,duration:sixteenth*(tense?1.45:1.75),volume:tense?.095:.085});}
 if(tense||beat%2===0)notes.push({voice:'arp',midi:chord[[0,1,2,1][(tense?beat:Math.floor(beat/2))%4]]+24,duration:sixteenth*.65,volume:tense?.035:.025});
 if(beat%(tense?2:4)===0)notes.push({voice:'bass',midi:chord[beat%8>=4?2:0],duration:sixteenth*(tense?1.65:3.1),volume:.17});
 if(beat%8===0||(tense&&beat===10))notes.push({voice:'kick',midi:36,duration:.14,volume:tense?.28:.2});
 if(beat%8===4)notes.push({voice:'snare',midi:0,duration:.085,volume:tense?.10:.055});
 if(beat%2===0)notes.push({voice:'hat',midi:0,duration:.035,volume:tense?.034:.021});
 return notes;
}

export class RetroMusic {
 private mode:MusicMode='explore';
 private enabled=true;
 private visible=true;
 private master:GainNode;
 private bus:GainNode;
 private noise:AudioBuffer;
 private nextTime=0;
 private step=0;
 private timer:ReturnType<typeof setInterval>|null=null;
 private disposed=false;
 private retired=new Map<GainNode,ReturnType<typeof setTimeout>>();
 private context:AudioContext;

 constructor(context:AudioContext){
  this.context=context;this.master=context.createGain();this.master.gain.value=.38;this.master.connect(context.destination);
  this.bus=context.createGain();this.bus.connect(this.master);
  this.noise=context.createBuffer(1,Math.ceil(context.sampleRate*.2),context.sampleRate);
  const data=this.noise.getChannelData(0);let seed=7421;for(let i=0;i<data.length;i++){seed=(seed*16807)%2147483647;data[i]=seed/1073741824-1;}
 }

 configure(mode:MusicMode,enabled:boolean){
  if(this.disposed)return;
  const changed=mode!==this.mode;this.mode=mode;this.enabled=enabled;
  if(changed)this.replaceTrack();
  this.master.gain.cancelScheduledValues(this.context.currentTime);
  this.master.gain.setTargetAtTime(enabled?.38:0,this.context.currentTime,.045);
  if(!enabled)this.stopTimer();else this.startTimer();
 }

 async unlock(){
  if(this.disposed||!this.visible||!this.enabled)return;
  if(this.context.state!=='running')await this.context.resume();
  if(!this.disposed&&this.context.state==='running')this.startTimer();
 }

 setVisible(visible:boolean){
  this.visible=visible;
  if(!visible){this.stopTimer();void this.context.suspend().catch(()=>{});}
  else void this.unlock().catch(()=>{});
 }

 private replaceTrack(){
  const now=this.context.currentTime,old=this.bus;
  old.gain.cancelScheduledValues(now);old.gain.setTargetAtTime(0,now,.025);
  const cleanup=setTimeout(()=>{old.disconnect();this.retired.delete(old);},500);this.retired.set(old,cleanup);
  this.bus=this.context.createGain();this.bus.gain.setValueAtTime(0,now);this.bus.gain.linearRampToValueAtTime(1,now+.12);this.bus.connect(this.master);
  this.step=0;this.nextTime=now+.035;
 }

 private startTimer(){
  if(this.timer!==null||!this.visible||!this.enabled||this.context.state!=='running')return;
  this.nextTime=this.context.currentTime+.04;
  this.schedule();this.timer=setInterval(()=>this.schedule(),25);
 }
 private stopTimer(){if(this.timer!==null)clearInterval(this.timer);this.timer=null;}

 private schedule(){
  if(this.context.state!=='running')return;
  const now=this.context.currentTime;
  if(this.nextTime<now-.1)this.nextTime=now+.03;
  while(this.nextTime<now+.12){
   for(const note of scoreStep(this.mode,this.step))this.playNote(note,this.nextTime);
   this.step=(this.step+1)%MUSIC_STEPS;this.nextTime+=60/MUSIC_TEMPO[this.mode]/4;
  }
 }

 private playNote(note:ChipNote,time:number){
  const ac=this.context,envelope=ac.createGain();envelope.connect(this.bus);
  envelope.gain.setValueAtTime(.0001,time);envelope.gain.linearRampToValueAtTime(note.volume,time+.004);envelope.gain.exponentialRampToValueAtTime(.0001,time+note.duration);
  let source:OscillatorNode|AudioBufferSourceNode;let filter:BiquadFilterNode|undefined;
  if(note.voice==='hat'||note.voice==='snare'){
   const noise=ac.createBufferSource();noise.buffer=this.noise;
   filter=ac.createBiquadFilter();filter.type=note.voice==='hat'?'highpass':'bandpass';filter.frequency.value=note.voice==='hat'?6500:1800;filter.Q.value=.7;
   noise.connect(filter);filter.connect(envelope);source=noise;
  }else{
   const oscillator=ac.createOscillator();oscillator.type=note.voice==='lead'?'square':note.voice==='kick'?'sine':'triangle';
   if(note.voice==='kick'){oscillator.frequency.setValueAtTime(130,time);oscillator.frequency.exponentialRampToValueAtTime(42,time+note.duration);}
   else oscillator.frequency.value=440*2**((note.midi-69)/12);
   oscillator.connect(envelope);source=oscillator;
  }
  source.onended=()=>{source.disconnect();filter?.disconnect();envelope.disconnect();};source.start(time);source.stop(time+note.duration+.01);
 }

 dispose(){
  this.disposed=true;this.stopTimer();for(const [bus,timer] of this.retired){clearTimeout(timer);bus.disconnect();}this.retired.clear();this.bus.disconnect();this.master.disconnect();void this.context.close().catch(()=>{});
 }
}
