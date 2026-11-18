export type BgmMood =
  | 'off'
  | 'title'
  | 'castle'
  | 'library'
  | 'clock'
  | 'prison'
  | 'opera'
  | 'inverted'
  | 'boss';

function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

interface ChordBar {
  bass: number;
  arp: [number, number, number, number];
  lead: (number | null)[]; // 8 steps per bar (16th/8th notes)
}

/**
 * 致敬山根美智留《恶魔城：月下夜想曲》巴洛克羽调式交响曲谱：
 * 古筝/羽管键琴分解和弦 + 二胡/大提琴揉弦主旋律 + 行进低音贝斯 + 大殿残响延迟！
 */
const SCORE_CASTLE: ChordBar[] = [
  // Dm -> Bb -> Gm -> A7 (经典《Dracula's Castle / 悲境贵公子》式激昂悲怆进行！)
  { bass: 38, arp: [50, 53, 57, 62], lead: [62, null, 65, 69, 74, null, 72, 69] },
  { bass: 34, arp: [46, 50, 53, 58], lead: [70, null, 69, 65, 67, null, 65, 62] },
  { bass: 43, arp: [43, 46, 50, 55], lead: [67, null, 70, 74, 77, null, 76, 74] },
  { bass: 33, arp: [45, 49, 52, 57], lead: [73, null, null, 69, 76, null, 73, 69] },
];

const SCORE_LIBRARY: ChordBar[] = [
  // 致敬《Wood Carving Partita 木雕帕蒂塔》巴洛克古琴室内乐！
  { bass: 40, arp: [52, 55, 59, 64], lead: [76, 74, 71, 74, 76, null, 79, null] },
  { bass: 36, arp: [48, 52, 55, 60], lead: [76, 74, 72, 71, 69, null, 72, null] },
  { bass: 38, arp: [50, 54, 57, 62], lead: [74, 72, 69, 72, 74, null, 78, null] },
  { bass: 35, arp: [47, 51, 54, 59], lead: [75, null, 71, null, 76, 75, 71, 69] },
];

const SCORE_CLOCK: ChordBar[] = [
  // 致敬恶魔城钟塔高速齿轮赋格曲！
  { bass: 38, arp: [50, 57, 62, 65], lead: [74, 69, 74, 77, 76, 69, 76, 79] },
  { bass: 41, arp: [53, 57, 60, 65], lead: [77, 72, 77, 81, 79, 72, 76, 72] },
  { bass: 34, arp: [46, 53, 58, 62], lead: [70, 65, 70, 74, 72, 67, 72, 76] },
  { bass: 33, arp: [45, 52, 57, 61], lead: [73, 69, 76, 73, 81, null, 79, 76] },
];

const SCORE_PRISON: ChordBar[] = [
  // 致敬《Crystal Teardrops 地下水脉》空灵冷冽洞窟回响！
  { bass: 36, arp: [48, 55, 58, 63], lead: [72, null, null, 75, 74, null, 70, null] },
  { bass: 32, arp: [44, 51, 56, 60], lead: [68, null, 72, null, 75, null, 74, 72] },
  { bass: 34, arp: [46, 53, 58, 62], lead: [70, null, null, 74, 77, null, 74, null] },
  { bass: 31, arp: [43, 50, 55, 59], lead: [74, null, 71, null, 67, null, null, null] },
];

const SCORE_INVERTED: ChordBar[] = [
  // 致敬《Finale Toccata 逆城终曲》诡谲庄严对位！
  { bass: 37, arp: [49, 52, 56, 61], lead: [73, 76, 80, 76, 73, 68, 73, 76] },
  { bass: 33, arp: [45, 49, 52, 57], lead: [69, 73, 76, 73, 81, null, 80, 76] },
  { bass: 35, arp: [47, 50, 54, 59], lead: [74, 78, 81, 78, 74, 71, 74, 78] },
  { bass: 32, arp: [44, 48, 51, 56], lead: [75, null, 80, null, 84, 80, 75, 72] },
];

const SCORE_BOSS: ChordBar[] = [
  // 疾风骤雨妖王死斗曲！
  { bass: 38, arp: [50, 53, 56, 62], lead: [74, 74, 77, 74, 80, 77, 74, 72] },
  { bass: 38, arp: [50, 55, 58, 62], lead: [70, 74, 79, 77, 74, 70, 72, 74] },
  { bass: 34, arp: [46, 50, 53, 58], lead: [77, null, 80, 77, 82, null, 80, 77] },
  { bass: 33, arp: [45, 49, 52, 57], lead: [81, 79, 76, 73, 81, null, 85, null] },
];

class GuofengAudioEngine {
  private ctx: AudioContext | null = null;
  private masterBus: GainNode | null = null;
  private echoDelay: DelayNode | null = null;
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
        this.masterBus = this.ctx.createGain();
        this.masterBus.gain.value = 0.88;
        this.masterBus.connect(this.ctx.destination);

        // 古堡石殿空间回声总线（让古琴/羽管键琴自带恶魔城礼拜堂空灵泛音！）
        this.echoDelay = this.ctx.createDelay(1.0);
        this.echoDelay.delayTime.value = 0.24;
        const fb = this.ctx.createGain();
        fb.gain.value = 0.28;
        const echoFilter = this.ctx.createBiquadFilter();
        echoFilter.type = 'lowpass';
        echoFilter.frequency.value = 2200;
        const wet = this.ctx.createGain();
        wet.gain.value = 0.26;

        this.echoDelay.connect(echoFilter);
        echoFilter.connect(fb);
        fb.connect(this.echoDelay);
        echoFilter.connect(wet);
        wet.connect(this.masterBus);

        const len = Math.floor(this.ctx.sampleRate * 0.4);
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
    const stepMs =
      this.mood === 'boss'
        ? 135
        : this.mood === 'clock'
          ? 145
          : this.mood === 'inverted'
            ? 155
            : this.mood === 'title' || this.mood === 'prison'
              ? 205
              : 165;
    this.timerId = window.setInterval(() => this.tickBgm(), stepMs);
  }

  private sendToHall(node: AudioNode, useEcho = true): void {
    if (!this.masterBus) return;
    node.connect(this.masterBus);
    if (useEcho && this.echoDelay) {
      node.connect(this.echoDelay);
    }
  }

  // 声部一：巴洛克羽管键琴 × 古筝清脆拨弦琶音
  private playHarpsichordGuzheng(freq: number, dur: number, vol: number): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 2, now);
    osc1.detune.value = 4;

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(5400, freq * 6.5), now);
    filter.frequency.exponentialRampToValueAtTime(Math.max(260, freq * 1.15), now + dur);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    this.sendToHall(gain, true);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur + 0.02);
    osc2.stop(now + dur + 0.02);
  }

  // 声部二：二胡/哥特大提琴揉弦歌唱主旋律（自带微颤音 Vibrato！）
  private playBowedLead(freq: number, dur: number, vol: number): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    lfo.type = 'sine';
    lfo.frequency.value = 5.6;
    lfoGain.gain.value = freq * 0.011;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    filter.type = 'bandpass';
    filter.frequency.value = Math.min(2800, freq * 2.4);
    filter.Q.value = 1.25;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.045);
    gain.gain.setValueAtTime(vol * 0.85, now + dur * 0.65);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(filter);
    filter.connect(gain);
    this.sendToHall(gain, true);

    osc.start(now);
    lfo.start(now);
    osc.stop(now + dur + 0.03);
    lfo.stop(now + dur + 0.03);
  }

  // 声部三：深沉行进管风琴/贝斯低音
  private playBassNote(freq: number, dur: number, vol: number): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    filter.type = 'lowpass';
    filter.frequency.value = 340;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(filter);
    filter.connect(gain);
    this.sendToHall(gain, false);

    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  // 声部四：定音战鼓与细碎节拍镲
  private playDrum(vol: number, pitch = 68): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch * 1.9, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.52, now + 0.16);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    osc.connect(gain);
    this.sendToHall(gain, false);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  private playHiTick(vol = 0.022): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running' || !this.noiseBuf) return;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 5800;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
    src.connect(hp);
    hp.connect(gain);
    this.sendToHall(gain, false);
    src.start(now);
    src.stop(now + 0.04);
  }

  private tickBgm(): void {
    if (this.bgmMuted || document.hidden || !this.ctx || this.ctx.state !== 'running') return;
    const s = this.step++;
    const sub = s % 8; // 每小节 8 拍

    let score = SCORE_CASTLE;
    if (this.mood === 'library' || this.mood === 'title') score = SCORE_LIBRARY;
    else if (this.mood === 'clock') score = SCORE_CLOCK;
    else if (this.mood === 'prison') score = SCORE_PRISON;
    else if (this.mood === 'inverted') score = SCORE_INVERTED;
    else if (this.mood === 'boss') score = SCORE_BOSS;

    const bar = score[Math.floor(s / 8) % score.length];

    // 1. 巴洛克羽管键琴/古筝分解琶音持续流淌
    const arpOrder = [0, 1, 2, 3, 2, 1, 3, 2];
    const arpMidi = bar.arp[arpOrder[sub]];
    this.playHarpsichordGuzheng(midiToHz(arpMidi), 0.28, this.mood === 'title' ? 0.026 : 0.034);

    // 2. 行进低音贝斯（恶魔城灵魂驱动力！）
    if (sub === 0 || sub === 4 || (this.mood === 'boss' && sub % 2 === 0)) {
      const octaveShift = sub === 4 ? 12 : 0;
      this.playBassNote(midiToHz(bar.bass + octaveShift), 0.34, 0.075);
    }

    // 3. 二胡/大提琴歌唱主旋律（第二轮起切入，层次递进！）
    const leadMidi = bar.lead[sub];
    if (leadMidi !== null && (s >= 8 || this.mood === 'boss')) {
      this.playBowedLead(midiToHz(leadMidi), 0.42, this.mood === 'title' ? 0.032 : 0.045);
    }

    // 4. 鼓点律动
    if (this.mood === 'boss' || this.mood === 'clock' || this.mood === 'castle' || this.mood === 'inverted') {
      if (sub === 0 || (this.mood === 'boss' && sub === 3)) {
        this.playDrum(this.mood === 'boss' ? 0.095 : 0.06, 58);
      }
      if (sub % 2 === 1) {
        this.playHiTick(0.018);
      }
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
    filter.frequency.setValueAtTime(baseFreq * 1.45, now);
    filter.frequency.exponentialRampToValueAtTime(baseFreq * 0.42, now + 0.14);
    filter.Q.value = weight === 'whip' ? 3.5 : 1.8;

    const gain = ctx.createGain();
    const dur = weight === 'heavy' ? 0.19 : 0.11;
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    src.connect(filter);
    filter.connect(gain);
    this.sendToHall(gain, false);
    src.start(now);
    src.stop(now + dur + 0.01);
  }

  public playHit(crit = false): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    this.playDrum(crit ? 0.18 : 0.12, crit ? 98 : 76);
    if (crit) {
      this.playHarpsichordGuzheng(midiToHz(81), 0.2, 0.085);
    }
  }

  public playLanternBreak(): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    this.playHarpsichordGuzheng(midiToHz(88), 0.14, 0.065);
    this.playHarpsichordGuzheng(midiToHz(93), 0.18, 0.055);
  }

  public playEnemyDie(isBoss = false): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    this.playDrum(isBoss ? 0.24 : 0.15, isBoss ? 44 : 58);
    this.playSlash('heavy');
  }

  public playParryClang(): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    this.playHarpsichordGuzheng(midiToHz(84), 0.35, 0.13);
    this.playHarpsichordGuzheng(midiToHz(91), 0.28, 0.1);
  }

  public playSkillCast(): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    const notes = [62, 67, 69, 74, 79];
    notes.forEach((n, idx) => {
      window.setTimeout(() => {
        this.playHarpsichordGuzheng(midiToHz(n), 0.32, 0.075);
      }, idx * 26);
    });
  }

  public playRelicBell(): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    const notes = [57, 62, 69, 74];
    notes.forEach((n, idx) => {
      window.setTimeout(() => {
        this.playHarpsichordGuzheng(midiToHz(n), 0.85, 0.09);
      }, idx * 85);
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
    this.sendToHall(gain, false);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  public playHurt(): void {
    if (this.sfxMuted) return;
    this.playDrum(0.2, 52);
  }
}

export const AudioFX = new GuofengAudioEngine();
