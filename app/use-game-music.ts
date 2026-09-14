'use client';
import { useEffect, useRef, useState } from 'react';
import { RetroMusic, musicModeFor, MUSIC_LABELS } from '@/lib/game/music';

export function useGameMusic(inBattle: boolean, inRaid: boolean) {
  const [music, setMusic] = useState(true),
    [loaded, setLoaded] = useState(false);
  const [started, setStarted] = useState(false);
  const engine = useRef<RetroMusic | null>(null);
  const mode = musicModeFor(inBattle, inRaid);
  const settings = useRef({ mode, music });
  settings.current = { mode, music };
  useEffect(() => {
    try {
      setMusic(localStorage.getItem('tails-city-music') !== 'off');
    } catch {}
    setLoaded(true);
    const unlock = () => {
      try {
        if (!engine.current)
          engine.current = new RetroMusic(new AudioContext());
        engine.current.configure(settings.current.mode, settings.current.music);
        void engine.current
          .unlock()
          .then(() => {
            if (settings.current.music) setStarted(true);
          })
          .catch(() => {});
      } catch {}
    };
    const visibility = () => engine.current?.setVisible(!document.hidden);
    document.addEventListener('pointerdown', unlock);
    document.addEventListener('keydown', unlock);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('visibilitychange', visibility);
      engine.current?.dispose();
      engine.current = null;
    };
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem('tails-city-music', music ? 'on' : 'off');
    } catch {}
    engine.current?.configure(mode, music);
    if (music)
      void engine.current
        ?.unlock()
        .then(() => setStarted(true))
        .catch(() => {});
  }, [mode, music, loaded]);
  return {
    music,
    toggleMusic: () => setMusic((on) => !on),
    musicLabel: !music
      ? '꺼짐'
      : !started
        ? '첫 터치 후 재생'
        : MUSIC_LABELS[mode],
  };
}
