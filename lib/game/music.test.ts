import test from 'node:test';
import assert from 'node:assert/strict';
import {scoreStep,MUSIC_TEMPO,MUSIC_STEPS,RetroMusic,type MusicMode} from './music.ts';

test('original exploration and battle themes loop cleanly with different melodies and pacing',()=>{
 const signatures:string[]=[];
 for(const mode of ['explore','battle'] as MusicMode[]){
  const notes=Array.from({length:MUSIC_STEPS},(_,step)=>scoreStep(mode,step));
  assert.deepEqual(scoreStep(mode,MUSIC_STEPS),scoreStep(mode,0));
  assert.equal(notes.flat().filter(n=>n.voice==='lead').length>50,true);
  for(const n of notes.flat()){assert.ok(Number.isFinite(n.midi));assert.ok(n.duration>0&&n.duration<1);assert.ok(n.volume>0&&n.volume<=.3);}
  signatures.push(JSON.stringify(notes));
 }
 assert.notEqual(signatures[0],signatures[1]);assert.ok(MUSIC_TEMPO.battle>MUSIC_TEMPO.explore);
 assert.ok(scoreStep('battle',1).length>scoreStep('explore',1).length);
});

class FakeParam{value=0;targets:number[]=[];cancelScheduledValues(){}setTargetAtTime(n:number){this.targets.push(n);}setValueAtTime(n:number){this.value=n;}linearRampToValueAtTime(n:number){this.value=n;}exponentialRampToValueAtTime(n:number){this.value=n;}}
class FakeNode{gain=new FakeParam();frequency=new FakeParam();Q=new FakeParam();type='';buffer:unknown;onended:()=>void=()=>{};disconnected=false;connect(){}disconnect(){this.disconnected=true;}start(){}stop(){this.onended();}}
class FakeContext{
 state='suspended';currentTime=0;sampleRate=44100;destination={};oscillators=0;gains:FakeNode[]=[];closed=false;
 createGain(){const node=new FakeNode();this.gains.push(node);return node;}
 createBuffer(_channels:number,length:number){return {getChannelData:()=>new Float32Array(length)};}
 createBufferSource(){return new FakeNode();}createBiquadFilter(){return new FakeNode();}
 createOscillator(){this.oscillators++;return new FakeNode();}
 async resume(){this.state='running';}async suspend(){this.state='suspended';}async close(){this.state='closed';this.closed=true;}
}

test('music waits for unlock, changes tracks, respects mute and hidden tabs, and closes on teardown',async()=>{
 const ctx=new FakeContext(),engine=new RetroMusic(ctx as unknown as AudioContext);
 try{
  engine.configure('explore',true);assert.equal(ctx.oscillators,0);
  await engine.unlock();assert.ok(ctx.oscillators>0);
  const firstBus=ctx.gains[1];engine.configure('battle',true);assert.ok(firstBus.gain.targets.includes(0));
  engine.configure('battle',false);const mutedCount=ctx.oscillators;await engine.unlock();assert.equal(ctx.oscillators,mutedCount);assert.equal(ctx.gains[0].gain.targets.at(-1),0);
  engine.setVisible(false);assert.equal(ctx.state,'suspended');engine.configure('explore',true);await engine.unlock();assert.equal(ctx.oscillators,mutedCount);
  engine.setVisible(true);await engine.unlock();assert.ok(ctx.oscillators>mutedCount);
 }finally{engine.dispose();}
 assert.ok(ctx.closed);assert.ok(ctx.gains[0].disconnected);
});
