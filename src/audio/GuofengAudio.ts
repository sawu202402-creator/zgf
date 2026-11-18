export type BgmMood = 'off' | 'title' | 'castle' | 'opera' | 'inverted' | 'boss';

function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// D羽调式五声音阶 (D, F, G, A, C) 极具中国古风苍凉/夜行韵味
const SCALE_CASTLE = [50, 53, 55, 57, 60, 62, 65, 67, 69, 72, 74];
const SCALE_OPERA = [52, 55, 57, 59, 62, 64, 67, 69, 71, 74, 76];
const SCALE_BOSS = [50, 53, 56, 57, 60, 62, 65, 68, 69, 72, 74];

class GuofengAudioEngine {
  private ctx: AudioContext | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private sfxMuted = false;
  private bgmMuted = false;
  private mood: BgmMood = 'off';
  private step = 0;
  private timerId: number | null = null;
  private bound = false;

  public init(sfxMuted: boolean, bgmMuted: boolean): void {
    this.sfxMuted = sfxMuted;
    this.bgmMuted = bgmMuted;
    if (this.bound) return;
    this.bound = true;

    const unlock = () => this.resume();
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.ctx && this.ctx.state === 'running') {
        this.ctx.suspend().catch(() => {});
      } else if (!document.hidden) {
        this.resume();
      }
    });
  }

  public setMute(sfx: boolean, bgm: boolean): void {
    this.sfxMuted = sfx;
    this.bgmMuted = bgm;
    if (this.bgmMuted && this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    } else if (!this.bgmMuted && this.mood !== 'off') {
      this.ensureBgmLoop();
    }
  }

  public getMuteState(): { sfxMuted: boolean; bgmMuted: boolean } {
    return { sfxMuted: this.sfxMuted, bgmMuted: this.bgmMuted };
  }

  private ensureContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (Ctx) {
        this.ctx = new Ctx();
        const len = this.ctx.sampleRate * 0.35;
        this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const data = this.noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) {
          data[i] = Math.random() * 2 - 1;
        }
      }
    }
    return this.ctx;
  }

  public resume(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (!this.bgmMuted && this.mood !== 'off') {
      this.ensureBgmLoop();
    }
  }

  public setMood(mood: BgmMood): void {
    if (this.mood === mood) return;
    this.mood = mood;
    this.step = 0;
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    if (mood !== 'off' && !this.bgmMuted) {
      this.ensureBgmLoop();
    }
  }

  private ensureBgmLoop(): void {
    if (this.timerId !== null || this.bgmMuted || this.mood === 'off') return;
    const intervalMs = this.mood === 'boss' ? 165 : this.mood === 'inverted' ? 195 : 240;
    this.timerId = window.setInterval(() => this.tickBgm(), intervalMs);
  }

  // 合成古琴/琵琶拨弦泛音
  private playPluck(freq: number, dur: number, vol: number, bright = false): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = bright ? 'sawtooth' : 'triangle';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 2, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(bright ? freq * 5.2 : freq * 3.1, now);
    filter.frequency.exponentialRampToValueAtTime(Math.max(180, freq * 0.9), now + dur);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur + 0.02);
    osc2.stop(now + dur + 0.02);
  }

  // 合成战鼓低音
  private playDrum(vol: number, pitch = 68): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch * 1.9, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.55, now + 0.16);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  private tickBgm(): void {
    if (this.bgmMuted || document.hidden || !this.ctx || this.ctx.state !== 'running') return;
    const s = this.step++;
    const scale =
      this.mood === 'boss'
        ? SCALE_BOSS
        : this.mood === 'opera'
          ? SCALE_OPERA
          : SCALE_CASTLE;

    if (this.mood === 'boss') {
      if (s % 4 === 0 || s % 8 === 3) this.playDrum(0.11, 62);
      const pattern = [0, 3, 4, 6, 4, 3, 7, 5, 0, 2, 4, 8, 7, 6, 4, 3];
      const idx = pattern[s % pattern.length];
      this.playPluck(midiToHz(scale[idx]), 0.26, 0.055, true);
      if (s % 8 === 0) {
        this.playPluck(midiToHz(scale[0] - 12), 0.75, 0.065, false);
      }
      return;
    }

    if (this.mood === 'inverted') {
      if (s % 6 === 0) this.playDrum(0.07, 54);
      const pat = [8, 7, 5, 4, 6, 4, 2, 0, 7, 5, 3, 1];
      const idx = pat[s % pat.length];
      this.playPluck(midiToHz(scale[idx] + 2), 0.42, 0.048, true);
      return;
    }

    // title / castle / opera
    const melody = [0, 2, 3, 4, 6, 4, 3, 2, 0, 3, 5, 7, 6, 4, 3, 1];
    if (s % 2 === 0 || s % 7 === 0) {
      const idx = melody[(s >> 1) % melody.length];
      this.playPluck(midiToHz(scale[idx]), 0.55, 0.046, this.mood === 'opera');
    }
    if (s % 8 === 0) {
      this.playPluck(midiToHz(scale[0] - 12), 1.15, 0.052, false);
    }
  }

  public playSlash(weight: 'light' | 'heavy' | 'spear' | 'whip'): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running' || !this.noiseBuf) return;
    const now = ctx.currentTime;

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const baseFreq =
      weight === 'heavy' ? 420 : weight === 'whip' ? 1450 : weight === 'spear' ? 1050 : 880;
    filter.frequency.setValueAtTime(baseFreq * 1.4, now);
    filter.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, now + 0.14);
    filter.Q.value = weight === 'whip' ? 3.5 : 1.8;

    const gain = ctx.createGain();
    const dur = weight === 'heavy' ? 0.19 : 0.11;
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
    src.stop(now + dur + 0.01);
  }

  public playHit(crit = false): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    this.playDrum(crit ? 0.18 : 0.12, crit ? 95 : 75);
    if (crit) {
      this.playPluck(midiToHz(79), 0.18, 0.09, true);
    }
  }

  public playParryClang(): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    this.playPluck(midiToHz(84), 0.35, 0.14, true);
    this.playPluck(midiToHz(91), 0.28, 0.11, true);
  }

  public playSkillCast(): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    // 五声琶音上扬
    const notes = [62, 67, 69, 74, 79];
    notes.forEach((n, idx) => {
      window.setTimeout(() => {
        this.playPluck(midiToHz(n), 0.32, 0.085, true);
      }, idx * 28);
    });
  }

  public playRelicBell(): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    // 青铜编钟双音
    const notes = [57, 62, 69, 74];
    notes.forEach((n, idx) => {
      window.setTimeout(() => {
        this.playPluck(midiToHz(n), 0.9, 0.1, false);
      }, idx * 90);
    });
  }

  public playJump(): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(410, now + 0.09);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  public playHurt(): void {
    if (this.sfxMuted) return;
    this.playDrum(0.2, 52);
  }
}

export const AudioFX = new GuofengAudioEngine();
