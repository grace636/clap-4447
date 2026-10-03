// Tiny synthesized clap (no audio file). AudioContext is created/resumed on first tap.
let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    noise = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") void ctx.resume();
}

export function playClap() {
  unlockAudio();
  if (!ctx || !noise) return;
  const t = ctx.currentTime;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1100 + Math.random() * 500;
  filter.Q.value = 0.9;
  const gain = ctx.createGain();
  // three quick bursts + tail = clap texture
  gain.gain.setValueAtTime(0, t);
  [0, 0.011, 0.022].forEach((o) => {
    gain.gain.setValueAtTime(0.9, t + o);
    gain.gain.exponentialRampToValueAtTime(0.15, t + o + 0.009);
  });
  gain.gain.setValueAtTime(0.7, t + 0.032);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(t);
  src.stop(t + 0.22);
}
