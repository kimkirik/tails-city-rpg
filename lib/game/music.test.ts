import test from 'node:test';
import assert from 'node:assert/strict';
import {
  scoreStep,
  MUSIC_TEMPO,
  MUSIC_STEPS,
  RetroMusic,
  musicModeFor,
  type MusicMode,
} from './music.ts';

test('exploration, battle, raid and raid battle themes loop cleanly with distinct arrangements', () => {
  const signatures: string[] = [];
  for (const mode of [
    'explore',
    'battle',
    'raid',
    'raid-battle',
  ] as MusicMode[]) {
    const notes = Array.from({ length: MUSIC_STEPS }, (_, step) =>
      scoreStep(mode, step),
    );
    assert.deepEqual(scoreStep(mode, MUSIC_STEPS), scoreStep(mode, 0));
    assert.equal(
      notes.flat().filter((n) => n.voice === 'lead').length > 50,
      true,
    );
    for (const n of notes.flat()) {
      assert.ok(Number.isFinite(n.midi));
      assert.ok(n.duration > 0 && n.duration < 1);
      assert.ok(n.volume > 0 && n.volume <= 0.3);
    }
    signatures.push(JSON.stringify(notes));
  }
  assert.equal(new Set(signatures).size, 4);
  assert.ok(MUSIC_TEMPO.battle > MUSIC_TEMPO.explore);
  assert.ok(MUSIC_TEMPO.raid > MUSIC_TEMPO.explore);
  assert.ok(MUSIC_TEMPO['raid-battle'] > MUSIC_TEMPO.battle);
  const percussion = (mode: MusicMode) =>
    Array.from({ length: MUSIC_STEPS }, (_, i) => scoreStep(mode, i))
      .flat()
      .filter((n) => ['kick', 'snare', 'hat'].includes(n.voice)).length;
  assert.ok(percussion('raid') > percussion('explore'));
  assert.ok(percussion('raid-battle') > percussion('raid'));
  assert.ok(scoreStep('battle', 1).length > scoreStep('explore', 1).length);
});
test('entering a cave, starting or leaving combat and exiting select the correct music', () => {
  assert.equal(musicModeFor(false, false), 'explore');
  assert.equal(musicModeFor(false, true), 'raid');
  assert.equal(musicModeFor(true, true), 'raid-battle');
  assert.equal(musicModeFor(false, true), 'raid');
  assert.equal(musicModeFor(true, false), 'battle');
  assert.equal(musicModeFor(false, false), 'explore');
});

class FakeParam {
  value = 0;
  targets: number[] = [];
  cancelScheduledValues() {}
  setTargetAtTime(n: number) {
    this.targets.push(n);
  }
  setValueAtTime(n: number) {
    this.value = n;
  }
  linearRampToValueAtTime(n: number) {
    this.value = n;
  }
  exponentialRampToValueAtTime(n: number) {
    this.value = n;
  }
}
class FakeNode {
  gain = new FakeParam();
  frequency = new FakeParam();
  Q = new FakeParam();
  type = '';
  buffer: unknown;
  onended: () => void = () => {};
  disconnected = false;
  connect() {}
  disconnect() {
    this.disconnected = true;
  }
  start() {}
  stop() {
    this.onended();
  }
}
class FakeContext {
  state = 'suspended';
  currentTime = 0;
  sampleRate = 44100;
  destination = {};
  oscillators = 0;
  gains: FakeNode[] = [];
  closed = false;
  createGain() {
    const node = new FakeNode();
    this.gains.push(node);
    return node;
  }
  createBuffer(_channels: number, length: number) {
    return { getChannelData: () => new Float32Array(length) };
  }
  createBufferSource() {
    return new FakeNode();
  }
  createBiquadFilter() {
    return new FakeNode();
  }
  createOscillator() {
    this.oscillators++;
    return new FakeNode();
  }
  async resume() {
    this.state = 'running';
  }
  async suspend() {
    this.state = 'suspended';
  }
  async close() {
    this.state = 'closed';
    this.closed = true;
  }
}

test('music waits for unlock, changes tracks, respects mute and hidden tabs, and closes on teardown', async () => {
  const ctx = new FakeContext(),
    engine = new RetroMusic(ctx as unknown as AudioContext);
  try {
    engine.configure('explore', true);
    assert.equal(ctx.oscillators, 0);
    await engine.unlock();
    assert.ok(ctx.oscillators > 0);
    const firstBus = ctx.gains[1];
    engine.configure('battle', true);
    assert.ok(firstBus.gain.targets.includes(0));
    for (const mode of [
      'raid',
      'raid-battle',
      'raid',
      'explore',
    ] as MusicMode[]) {
      const bus = ctx.gains.findLast((n) => n.gain.value === 1)!;
      engine.configure(mode, true);
      assert.ok(bus.gain.targets.includes(0));
    }
    engine.configure('battle', false);
    const mutedCount = ctx.oscillators;
    await engine.unlock();
    assert.equal(ctx.oscillators, mutedCount);
    assert.equal(ctx.gains[0].gain.targets.at(-1), 0);
    engine.setVisible(false);
    assert.equal(ctx.state, 'suspended');
    engine.configure('explore', true);
    await engine.unlock();
    assert.equal(ctx.oscillators, mutedCount);
    engine.setVisible(true);
    await engine.unlock();
    assert.ok(ctx.oscillators > mutedCount);
  } finally {
    engine.dispose();
  }
  assert.ok(ctx.closed);
  assert.ok(ctx.gains[0].disconnected);
});
