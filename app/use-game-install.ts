'use client';
import {useEffect,useState,useSyncExternalStore} from 'react';
import {InstallController,installPlatform,type InstallPromptEvent} from '@/lib/game/install';
export function useGameInstall(){
 const [controller]=useState(()=>new InstallController());
 const state=useSyncExternalStore(controller.subscribe,controller.getSnapshot,controller.getSnapshot);
 useEffect(()=>{
  const display=window.matchMedia('(display-mode: standalone)');
  const installed=()=>controller.installed();
  const check=()=>{if(display.matches||(navigator as Navigator&{standalone?:boolean}).standalone)installed();};
  const before=(event:Event)=>controller.capture(event as InstallPromptEvent);
  controller.platform(installPlatform(navigator.userAgent,navigator.maxTouchPoints));check();
  window.addEventListener('beforeinstallprompt',before);window.addEventListener('appinstalled',installed);display.addEventListener('change',check);
  return()=>{window.removeEventListener('beforeinstallprompt',before);window.removeEventListener('appinstalled',installed);display.removeEventListener('change',check);controller.clear();};
 },[controller]);
 return {...state,request:()=>controller.request()};
}
