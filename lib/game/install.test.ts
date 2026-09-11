import test from 'node:test';
import assert from 'node:assert/strict';
import {InstallController,installPlatform,type InstallPromptEvent} from './install.ts';
function promptEvent(outcome:'accepted'|'dismissed',prompt:()=>Promise<void>=async()=>{}){return Object.assign(new Event('beforeinstallprompt',{cancelable:true}),{prompt,userChoice:Promise.resolve({outcome})}) as InstallPromptEvent;}
void test('native install prompts can be used only once and do not claim acceptance is installation',async()=>{
 const control=new InstallController();let calls=0,updates=0;const unsubscribe=control.subscribe(()=>updates++),event=promptEvent('accepted',async()=>{calls++;});
 control.capture(event);assert.equal(event.defaultPrevented,true);assert.equal(control.getSnapshot().available,true);
 assert.equal(await control.request(),'accepted');assert.equal(control.getSnapshot().installed,false);assert.equal(await control.request(),'unavailable');assert.equal(calls,1);
 control.installed();assert.equal(control.getSnapshot().installed,true);assert.equal(control.getSnapshot().available,false);assert.ok(updates>=3);unsubscribe();
});
void test('duplicate clicks do not open duplicate prompts; dismissed and failed prompts can be replaced',async()=>{
 const control=new InstallController();let finish!:()=>void;control.capture(promptEvent('dismissed',()=>new Promise<void>(resolve=>{finish=resolve;})));
 const first=control.request();assert.equal(await control.request(),'busy');finish();assert.equal(await first,'dismissed');assert.equal(control.getSnapshot().pending,false);
 control.capture(promptEvent('accepted',async()=>{throw Error('unsupported');}));assert.equal(await control.request(),'failed');assert.equal(control.getSnapshot().available,false);
 control.capture(promptEvent('accepted'));assert.equal(await control.request(),'accepted');
});
void test('installed and cleaned-up controllers never reuse captured events',async()=>{
 const control=new InstallController();control.capture(promptEvent('accepted'));control.clear();assert.equal(control.getSnapshot().available,false);assert.equal(await control.request(),'unavailable');
 control.installed();control.capture(promptEvent('accepted'));assert.equal(await control.request(),'unavailable');assert.equal(control.getSnapshot().available,false);
});
void test('install guidance distinguishes iOS, desktop iPad, Android, Safari and in-app browsers',()=>{
 assert.equal(installPlatform('iPhone OS Safari'),'ios');assert.equal(installPlatform('Macintosh Safari',5),'ios');
 assert.equal(installPlatform('Android Chrome'),'android');assert.equal(installPlatform('Macintosh Safari'),'mac-safari');
 assert.equal(installPlatform('Macintosh Chrome Safari'),'desktop');assert.equal(installPlatform('Windows Edg'),'desktop');
 assert.equal(installPlatform('Android; wv) Chrome'),'embedded');assert.equal(installPlatform('iPhone Safari KAKAOTALK'),'embedded');assert.equal(installPlatform('Electron Chrome'),'embedded');
});
