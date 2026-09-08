// @ts-nocheck -- Dynamic Phaser scene decorators are validated against the runtime scene.
// Act II garden ambience: a light WebAudio layer of fountain water, breeze,
// birds and glassy flower chimes. It sits beneath the existing melodic score
// and deliberately yields whenever battle music starts.

type SceneCtor = { prototype: Record<string, any> };

type GardenAudio = {
  ctx: AudioContext;
  master: GainNode;
  noise: AudioBufferSourceNode;
  birdTimer: number;
  chimeTimer: number;
  stopped: boolean;
};

const AUDIO_KEY = "__act2GardenAudio";

function audioContextCtor() {
  if (typeof window === "undefined") return undefined;
  return window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
}

function makeNoise(ctx: AudioContext, seconds = 2) {
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function softChime(ctx: AudioContext, out: AudioNode, frequency: number, gain = 0.018) {
  const at = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency, at);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.linearRampToValueAtTime(gain, at + 0.025);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 1.8);
  osc.connect(g).connect(out);
  osc.start(at);
  osc.stop(at + 1.9);
}

function birdCall(ctx: AudioContext, out: AudioNode) {
  const at = ctx.currentTime;
  const base = 1500 + Math.random() * 500;
  for (let i = 0; i < 2; i++) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const start = at + i * 0.17;
    osc.type = "sine";
    osc.frequency.setValueAtTime(base, start);
    osc.frequency.exponentialRampToValueAtTime(base * 1.32, start + 0.08);
    osc.frequency.exponentialRampToValueAtTime(base * 0.92, start + 0.2);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(0.009, start + 0.025);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);
    osc.connect(g).connect(out);
    osc.start(start);
    osc.stop(start + 0.26);
  }
}

function stopGarden(scene: Record<string, any>) {
  const audio = scene[AUDIO_KEY] as GardenAudio | undefined;
  if (!audio || audio.stopped) return;
  audio.stopped = true;
  window.clearTimeout(audio.birdTimer);
  window.clearTimeout(audio.chimeTimer);
  const now = audio.ctx.currentTime;
  try {
    audio.master.gain.cancelScheduledValues(now);
    audio.master.gain.setValueAtTime(Math.max(0.0001, audio.master.gain.value), now);
    audio.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
  } catch {
    // Context may already be gone during scene teardown.
  }
  window.setTimeout(() => {
    try {
      audio.noise.stop();
      audio.master.disconnect();
      void audio.ctx.close();
    } catch {
      // already stopped
    }
  }, 900);
  scene[AUDIO_KEY] = undefined;
}

function startGarden(scene: Record<string, any>) {
  if (scene?.save?.current_zone !== "wedding_garden" || scene[AUDIO_KEY]) return;
  const AC = audioContextCtor();
  if (!AC) return;
  const ctx = new AC();
  const master = ctx.createGain();
  master.gain.value = 0.0001;
  master.connect(ctx.destination);
  master.gain.exponentialRampToValueAtTime(0.24, ctx.currentTime + 2.5);

  // Fountain + leaf breeze: filtered noise, intentionally quiet under music.
  const noise = ctx.createBufferSource();
  noise.buffer = makeNoise(ctx);
  noise.loop = true;
  const water = ctx.createBiquadFilter();
  water.type = "bandpass";
  water.frequency.value = 720;
  water.Q.value = 0.45;
  const waterGain = ctx.createGain();
  waterGain.gain.value = 0.032;
  noise.connect(water).connect(waterGain).connect(master);

  const breeze = ctx.createBiquadFilter();
  breeze.type = "lowpass";
  breeze.frequency.value = 430;
  const breezeGain = ctx.createGain();
  breezeGain.gain.value = 0.018;
  noise.connect(breeze).connect(breezeGain).connect(master);
  noise.start();

  const audio: GardenAudio = { ctx, master, noise, birdTimer: 0, chimeTimer: 0, stopped: false };
  scene[AUDIO_KEY] = audio;

  const wake = () => void ctx.resume();
  window.addEventListener("pointerdown", wake, { once: true });
  window.addEventListener("keydown", wake, { once: true });

  const birds = () => {
    if (audio.stopped) return;
    birdCall(ctx, master);
    audio.birdTimer = window.setTimeout(birds, 5200 + Math.random() * 6500);
  };
  const chimes = () => {
    if (audio.stopped) return;
    const keys = Number(scene?.zoneState?.["keysFound"] ?? 0);
    // The harmony literally blooms as Maria restores the seasons.
    const scale = [659.25, 783.99, 880, 987.77, 1174.66, 1318.51];
    const available = Math.min(scale.length, 2 + keys);
    const f = scale[Math.floor(Math.random() * available)] ?? scale[0]!;
    softChime(ctx, master, f, 0.012 + keys * 0.0025);
    audio.chimeTimer = window.setTimeout(chimes, Math.max(1800, 4200 - keys * 450) + Math.random() * 1800);
  };
  audio.birdTimer = window.setTimeout(birds, 1800);
  audio.chimeTimer = window.setTimeout(chimes, 1200);
}

export function installAct2GardenMusic(QuestScene: SceneCtor) {
  const proto = QuestScene.prototype;
  if (proto.__act2GardenMusicInstalled) return;
  proto.__act2GardenMusicInstalled = true;

  const originalCreate = proto.create;
  proto.create = function (...args: unknown[]) {
    const result = originalCreate.apply(this, args);
    if (this?.save?.current_zone === "wedding_garden") {
      this.time?.delayedCall?.(500, () => startGarden(this));
      this.game?.events?.on?.("quest:music", (mode: string) => {
        if (mode === "battle") stopGarden(this);
        else if (mode === "explore" && this?.save?.current_zone === "wedding_garden") startGarden(this);
      });
    }
    return result;
  };

  const originalShutdown = proto.shutdown;
  if (typeof originalShutdown === "function") {
    proto.shutdown = function (...args: unknown[]) {
      stopGarden(this);
      return originalShutdown.apply(this, args);
    };
  }
}
