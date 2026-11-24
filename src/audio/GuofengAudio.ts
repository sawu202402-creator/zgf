export type BgmMood =
  | 'off'
  | 'title'
  | 'castle'
  | 'library'
  | 'clock'
  | 'prison'
  | 'opera'
  | 'colosseum'
  | 'forge'
  | 'nether'
  | 'inverted'
  | 'boss';

export type AmbientEnvKind = 'none' | 'rain' | 'forge' | 'water' | 'nether';

function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

interface ChordBar {
  bass: number;
  arp: [number, number, number, number];
  lead: (number | null)[]; // 8 steps per bar
}

/**
 * 纯正国风五声调式 16 小节起承转合交响曲谱（古筝轮指 + 二胡揉弦 + 竹笛吹管 + 编钟战鼓）：
 * 每首曲目包含 起(A) -> 承(A') -> 转(B 高潮转调) -> 合(C 归韵) 完整四段式乐章，彻底告别单调 4 小节短循环！
 */
const SCORE_CASTLE: ChordBar[] = [
  // 起：D 羽五声（D F G A C）苍劲破阵
  { bass: 38, arp: [50, 55, 57, 62], lead: [62, null, 65, 69, 74, null, 72, 69] },
  { bass: 36, arp: [48, 55, 60, 65], lead: [72, null, 69, 67, 65, null, 67, 69] },
  { bass: 34, arp: [46, 53, 58, 62], lead: [67, null, 69, 72, 74, null, 77, 74] },
  { bass: 33, arp: [45, 52, 57, 60], lead: [72, null, null, 69, 67, null, 65, 62] },
  // 承：低回递进
  { bass: 38, arp: [50, 57, 62, 65], lead: [69, null, 72, 74, 77, null, 74, 72] },
  { bass: 36, arp: [48, 55, 60, 62], lead: [74, 72, 69, null, 67, 69, 72, null] },
  { bass: 31, arp: [43, 50, 55, 58], lead: [65, null, 67, 69, 72, null, 69, 67] },
  { bass: 38, arp: [50, 55, 57, 62], lead: [69, null, 65, null, 62, null, null, null] },
  // 转：高八度竹笛清越拔起
  { bass: 43, arp: [55, 60, 62, 67], lead: [79, null, 81, 79, 77, 74, 77, 79] },
  { bass: 41, arp: [53, 57, 62, 65], lead: [81, null, 79, 77, 74, null, 72, 74] },
  { bass: 36, arp: [48, 55, 60, 64], lead: [76, null, 79, 76, 74, 72, 69, 72] },
  { bass: 33, arp: [45, 52, 57, 62], lead: [74, null, 72, 69, 74, null, 77, null] },
  // 合：编钟余韵收束
  { bass: 34, arp: [46, 53, 58, 62], lead: [77, 74, 72, 69, 74, null, 69, 67] },
  { bass: 36, arp: [48, 55, 60, 62], lead: [72, null, 69, 67, 65, 67, 69, null] },
  { bass: 33, arp: [45, 50, 55, 57], lead: [67, null, 65, 62, 65, null, 69, null] },
  { bass: 38, arp: [50, 55, 57, 62], lead: [62, null, 69, null, 62, null, null, null] },
];

const SCORE_LIBRARY: ChordBar[] = [
  // E 羽五声（E G A B D）：万卷书阁与百戏梨园的清雅琴箫
  { bass: 40, arp: [52, 57, 59, 64], lead: [76, 74, 71, 74, 76, null, 79, null] },
  { bass: 36, arp: [48, 55, 57, 62], lead: [76, 74, 71, 69, 67, null, 71, null] },
  { bass: 38, arp: [50, 55, 57, 62], lead: [74, 71, 69, 71, 74, null, 76, null] },
  { bass: 33, arp: [45, 52, 55, 59], lead: [71, null, 69, null, 67, 69, 71, 64] },
  { bass: 40, arp: [52, 59, 64, 67], lead: [79, null, 81, 79, 76, null, 74, 71] },
  { bass: 43, arp: [55, 59, 62, 67], lead: [74, 76, 79, null, 83, 81, 79, 76] },
  { bass: 38, arp: [50, 57, 62, 66], lead: [78, 76, 74, 71, 74, null, 76, null] },
  { bass: 40, arp: [52, 57, 59, 64], lead: [76, null, 71, null, 64, null, null, null] },
  { bass: 36, arp: [48, 55, 60, 64], lead: [79, 81, 83, null, 81, 79, 76, 74] },
  { bass: 38, arp: [50, 57, 62, 64], lead: [76, null, 74, 71, 69, 71, 74, null] },
  { bass: 35, arp: [47, 54, 59, 62], lead: [71, 74, 76, 79, 76, null, 74, 71] },
  { bass: 40, arp: [52, 57, 59, 64], lead: [71, null, 69, 67, 64, null, null, null] },
];

const SCORE_CLOCK: ChordBar[] = [
  // 东垣望月塔 & 凌霄天坛：急促琵琶轮指与编钟星象
  { bass: 38, arp: [50, 57, 62, 65], lead: [74, 69, 74, 77, 79, 74, 77, 81] },
  { bass: 41, arp: [53, 57, 60, 65], lead: [77, 72, 77, 81, 79, 72, 74, 69] },
  { bass: 36, arp: [48, 55, 60, 62], lead: [72, 67, 72, 74, 76, 72, 74, 79] },
  { bass: 38, arp: [50, 55, 57, 62], lead: [74, 69, 72, 69, 74, null, 69, 62] },
  { bass: 43, arp: [55, 62, 65, 69], lead: [81, 79, 77, 79, 81, 84, 81, 79] },
  { bass: 41, arp: [53, 60, 65, 69], lead: [79, 77, 74, 77, 79, 81, 77, 74] },
  { bass: 34, arp: [46, 53, 58, 62], lead: [77, 74, 72, 69, 74, 77, 79, 77] },
  { bass: 38, arp: [50, 57, 62, 65], lead: [74, null, 81, null, 74, null, null, null] },
];

const SCORE_COLOSSEUM: ChordBar[] = [
  // 神武演武校场：金戈铁马《破阵乐》重鼓角调
  { bass: 38, arp: [50, 57, 62, 67], lead: [74, 74, null, 77, 79, null, 77, 74] },
  { bass: 36, arp: [48, 55, 60, 65], lead: [72, 72, null, 74, 77, null, 74, 72] },
  { bass: 34, arp: [46, 53, 58, 62], lead: [70, 74, 77, null, 79, 77, 74, 72] },
  { bass: 38, arp: [50, 55, 57, 62], lead: [74, null, 69, 72, 74, null, null, null] },
  { bass: 43, arp: [55, 62, 67, 69], lead: [81, null, 79, 77, 81, null, 84, 81] },
  { bass: 41, arp: [53, 60, 65, 67], lead: [79, 77, 74, 77, 79, null, 74, 72] },
  { bass: 36, arp: [48, 55, 60, 62], lead: [72, 74, 77, 79, 77, 74, 72, 69] },
  { bass: 38, arp: [50, 57, 62, 65], lead: [74, null, 74, null, 62, null, null, null] },
];

const SCORE_FORGE: ChordBar[] = [
  // 赤火铸剑坊：低沉炉火铁砧律动与古瑟铮鸣
  { bass: 36, arp: [48, 55, 58, 60], lead: [67, null, 70, 72, 75, null, 72, 70] },
  { bass: 34, arp: [46, 53, 55, 58], lead: [70, null, 67, 65, 67, null, 70, null] },
  { bass: 31, arp: [43, 50, 55, 58], lead: [67, 70, 72, null, 74, 72, 70, 67] },
  { bass: 36, arp: [48, 55, 58, 63], lead: [72, null, 67, null, 60, null, null, null] },
  { bass: 39, arp: [51, 58, 63, 67], lead: [75, null, 77, 75, 72, 70, 72, 75] },
  { bass: 38, arp: [50, 55, 60, 62], lead: [74, null, 72, 70, 67, null, 70, 72] },
  { bass: 32, arp: [44, 51, 56, 60], lead: [72, 70, 67, 65, 67, null, 72, null] },
  { bass: 36, arp: [48, 55, 58, 60], lead: [67, null, 60, null, null, null, null, null] },
];

const SCORE_PRISON: ChordBar[] = [
  // 九曲寒潭 & 归墟沉船坞：幽邃空灵 C 羽洞箫水滴曲
  { bass: 36, arp: [48, 55, 58, 63], lead: [72, null, null, 75, 77, null, 70, null] },
  { bass: 32, arp: [44, 51, 55, 60], lead: [67, null, 70, null, 75, null, 72, 70] },
  { bass: 34, arp: [46, 53, 58, 63], lead: [70, null, null, 75, 77, null, 75, null] },
  { bass: 36, arp: [48, 53, 55, 60], lead: [72, null, 70, null, 67, null, null, null] },
  { bass: 39, arp: [51, 58, 63, 67], lead: [79, null, 77, 75, 72, null, 75, 77] },
  { bass: 34, arp: [46, 53, 58, 62], lead: [74, null, 72, 70, 67, null, 70, null] },
  { bass: 32, arp: [44, 51, 56, 60], lead: [72, null, 75, null, 70, 67, 65, null] },
  { bass: 36, arp: [48, 55, 58, 60], lead: [67, null, 60, null, null, null, null, null] },
];

const SCORE_NETHER: ChordBar[] = [
  // 九幽荒冢 & 忘川太古龙陵：幽冥编磬与招魂低吟
  { bass: 33, arp: [45, 52, 56, 60], lead: [69, null, null, 72, 71, null, 69, 64] },
  { bass: 31, arp: [43, 50, 55, 59], lead: [67, null, 71, null, 69, 67, 64, null] },
  { bass: 29, arp: [41, 48, 53, 57], lead: [65, null, 69, 72, 71, null, 69, null] },
  { bass: 33, arp: [45, 52, 55, 57], lead: [64, null, null, 60, 57, null, null, null] },
  { bass: 36, arp: [48, 55, 60, 64], lead: [76, null, 74, 72, 71, null, 72, 76] },
  { bass: 34, arp: [46, 53, 57, 62], lead: [74, null, 72, 69, 67, null, 69, null] },
  { bass: 31, arp: [43, 50, 55, 59], lead: [71, 69, 67, 64, 67, null, 69, null] },
  { bass: 33, arp: [45, 52, 57, 60], lead: [69, null, 57, null, null, null, null, null] },
];

const SCORE_INVERTED: ChordBar[] = [
  // 九幽倒悬里城：诡谲磅礴雅乐变徵曲
  { bass: 38, arp: [50, 55, 57, 62], lead: [74, 77, 81, 77, 74, 69, 74, 77] },
  { bass: 34, arp: [46, 53, 57, 62], lead: [70, 74, 77, 74, 81, null, 79, 77] },
  { bass: 36, arp: [48, 55, 57, 60], lead: [72, 76, 79, 76, 72, 69, 72, 76] },
  { bass: 33, arp: [45, 50, 55, 57], lead: [74, null, 79, null, 81, 79, 74, 69] },
  { bass: 41, arp: [53, 59, 62, 65], lead: [81, 84, 81, 77, 79, 74, 77, 81] },
  { bass: 39, arp: [51, 58, 62, 67], lead: [79, 82, 79, 74, 77, 72, 74, 79] },
  { bass: 34, arp: [46, 53, 58, 62], lead: [77, 74, 70, 74, 79, 77, 74, 72] },
  { bass: 38, arp: [50, 57, 62, 65], lead: [74, null, 86, null, 74, null, null, null] },
];

const SCORE_BOSS: ChordBar[] = [
  // 十面埋伏妖王死斗曲
  { bass: 38, arp: [50, 55, 57, 62], lead: [74, 74, 77, 74, 79, 77, 74, 72] },
  { bass: 38, arp: [50, 55, 60, 62], lead: [72, 74, 79, 77, 74, 69, 72, 74] },
  { bass: 34, arp: [46, 53, 58, 62], lead: [77, null, 79, 77, 81, null, 79, 77] },
  { bass: 36, arp: [48, 55, 60, 64], lead: [81, 79, 76, 72, 79, null, 81, null] },
  { bass: 41, arp: [53, 57, 62, 65], lead: [81, 81, 84, 81, 86, 84, 81, 79] },
  { bass: 39, arp: [51, 55, 60, 63], lead: [79, 81, 84, 81, 79, 76, 74, 72] },
  { bass: 34, arp: [46, 53, 58, 62], lead: [74, 77, 79, 81, 84, 81, 79, 77] },
  { bass: 33, arp: [45, 52, 57, 61], lead: [81, null, 79, 76, 74, null, 69, null] },
];

class GuofengAudioEngine {
  private ctx: AudioContext | null = null;
  private masterBus: GainNode | null = null;
  private echoDelay: DelayNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private foley = new Map<string, AudioBuffer>();
  private zitherCache = new Map<number, AudioBuffer>();
  private sfxMuted = false;
  private bgmMuted = false;
  private mood: BgmMood = 'off';
  private ambientKind: AmbientEnvKind = 'none';
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
        this.bakeFoleyBank(this.ctx);
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

  public setAmbient(env: AmbientEnvKind): void {
    this.ambientKind = env;
  }

  private ensureBgmLoop(): void {
    if (this.timerId !== null || this.bgmMuted || this.mood === 'off') return;
    const stepMs =
      this.mood === 'boss'
        ? 135
        : this.mood === 'clock' || this.mood === 'colosseum'
          ? 148
          : this.mood === 'inverted'
            ? 155
            : this.mood === 'title' || this.mood === 'prison' || this.mood === 'nether'
              ? 205
              : 168;
    this.timerId = window.setInterval(() => this.tickBgm(), stepMs);
  }

  private sendToHall(node: AudioNode, useEcho = true): void {
    if (!this.masterBus) return;
    node.connect(this.masterBus);
    if (useEcho && this.echoDelay) {
      node.connect(this.echoDelay);
    }
  }

  /**
   * 离线预烘培写实国风拟音与物理建模音源库（彻底取代早期纯正弦/锯齿电子机械音！）
   */
  private bakeFoleyBank(ctx: AudioContext): void {
    if (this.foley.size > 0) return;
    const sr = ctx.sampleRate;
    let seed = 0x5f3759df;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const makeBuf = (dur: number, fn: (out: Float32Array, sr: number) => void): AudioBuffer => {
      const n = Math.max(64, Math.floor(sr * dur));
      const buf = ctx.createBuffer(1, n, sr);
      const out = buf.getChannelData(0);
      fn(out, sr);
      let peak = 0;
      for (let i = 0; i < n; i++) {
        const a = Math.abs(out[i]);
        if (a > peak) peak = a;
      }
      if (peak > 0.92) {
        const sc = 0.88 / peak;
        for (let i = 0; i < n; i++) out[i] *= sc;
      }
      return buf;
    };

    const addModalBurst = (
      out: Float32Array,
      startSec: number,
      modes: ReadonlyArray<readonly [number, number, number]>,
      noiseAmp = 0,
      noiseDecay = 80
    ) => {
      const i0 = Math.floor(startSec * sr);
      let lp = 0;
      for (let i = i0; i < out.length; i++) {
        const dt = (i - i0) / sr;
        let s = 0;
        let active = false;
        for (const [hz, amp, damp] of modes) {
          const env = Math.exp(-dt * damp);
          if (env > 0.001) {
            s += Math.sin(2 * Math.PI * hz * dt) * amp * env;
            active = true;
          }
        }
        if (noiseAmp > 0) {
          const ne = Math.exp(-dt * noiseDecay);
          if (ne > 0.001) {
            lp = lp * 0.65 + (rand() * 2 - 1) * 0.35;
            s += lp * noiseAmp * ne;
            active = true;
          }
        }
        if (!active) break;
        out[i] += s;
      }
    };

    // 1. 轻功踏石跃起：青石鞋底轻叩 + 麻布衣袂兜风声（绝无机械嘀声！）
    this.foley.set(
      'jump',
      makeBuf(0.14, (out) => {
        addModalBurst(
          out,
          0,
          [
            [175, 0.36, 95],
            [410, 0.24, 145],
            [790, 0.14, 210],
          ],
          0.42,
          120
        );
        let p0 = 0;
        let p1 = 0;
        let hp = 0;
        let prev = 0;
        for (let i = 0; i < out.length; i++) {
          const t = i / sr;
          const w = rand() * 2 - 1;
          p0 = p0 * 0.84 + w * 0.16;
          p1 = p1 * 0.92 + p0 * 0.08;
          hp = p0 - p1 * 0.65;
          const bp = hp - prev * 0.45;
          prev = hp;
          const env = Math.sin(Math.min(1, t / 0.025) * Math.PI * 0.5) * Math.exp(-Math.max(0, t - 0.015) * 26);
          out[i] += bp * env * 0.48;
        }
      })
    );

    // 2. 挥刃斩风拟音（轻剑 / 重刃 / 银枪 / 九节铁鞭各具真声！）
    const makeAirCut = (dur: number, cutLo: number, cutHi: number, edgeHz: number, edgeAmp: number) =>
      makeBuf(dur, (out) => {
        let lp = 0;
        let bpState = 0;
        for (let i = 0; i < out.length; i++) {
          const u = i / out.length;
          const t = i / sr;
          const sweepHz = cutHi * Math.exp(-u * 1.45) + cutLo * u;
          const alpha = Math.min(0.85, (2 * Math.PI * sweepHz) / sr);
          const n = rand() * 2 - 1;
          lp += alpha * (n - lp);
          const air = lp - bpState;
          bpState += Math.min(0.75, alpha * 0.38) * (lp - bpState);
          const env = Math.sin(Math.min(1, u / 0.22) * Math.PI * 0.5) * Math.pow(Math.max(0, 1 - u), 1.45);
          out[i] += air * env * 0.92;
          if (edgeAmp > 0) {
            out[i] += Math.sin(2 * Math.PI * edgeHz * t) * edgeAmp * Math.exp(-t * 24) * env;
          }
        }
      });

    this.foley.set('slash_light', makeAirCut(0.14, 520, 2200, 3150, 0.06));
    this.foley.set('slash_heavy', makeAirCut(0.24, 165, 760, 142, 0.22));
    this.foley.set('slash_spear', makeAirCut(0.13, 860, 2950, 1180, 0.09));
    this.foley.set(
      'slash_whip',
      makeBuf(0.16, (out) => {
        // 5 声错落铁链环扣清脆互碰
        for (let k = 0; k < 5; k++) {
          const t0 = k * 0.011;
          const base = 2450 + k * 460;
          addModalBurst(out, t0, [
            [base, 0.18, 95],
            [base * 1.47, 0.13, 130],
            [base * 2.13, 0.09, 175],
          ]);
        }
        // 0.056s 鞭梢破音障脆响
        let lp = 0;
        const crackIdx = Math.floor(0.056 * sr);
        for (let i = crackIdx; i < out.length; i++) {
          const dt = (i - crackIdx) / sr;
          lp = lp * 0.45 + (rand() * 2 - 1) * 0.55;
          out[i] += (rand() * 0.55 + lp * 0.45) * Math.exp(-dt * 85) * 0.95;
        }
      })
    );

    // 3. 刀刀入肉击打感（沉实皮革/皮肉闷响 + 甲胄破裂瞬态 + 暴击冷铁震颤）
    const makeHit = (dur: number, thumpHz: number, crackAmp: number, metalAmp: number) =>
      makeBuf(dur, (out) => {
        let lp = 0;
        let phase = 0;
        for (let i = 0; i < out.length; i++) {
          const t = i / sr;
          const f = thumpHz * (0.46 + 0.78 * Math.exp(-t * 36));
          phase += (2 * Math.PI * f) / sr;
          const thump = Math.sin(phase) * Math.exp(-t * 28) * 0.72;
          const n = rand() * 2 - 1;
          lp = lp * 0.62 + n * 0.38;
          const snap = (n * 0.4 + lp * 0.6) * Math.exp(-t * 62) * crackAmp;
          out[i] += thump + snap;
        }
        if (metalAmp > 0) {
          addModalBurst(out, 0.002, [
            [2180, metalAmp, 22],
            [3490, metalAmp * 0.75, 29],
            [5080, metalAmp * 0.45, 38],
          ]);
        }
      });

    this.foley.set('hit_normal', makeHit(0.13, 128, 0.58, 0));
    this.foley.set('hit_heavy', makeHit(0.18, 96, 0.76, 0.1));
    this.foley.set('hit_crit', makeHit(0.24, 114, 0.85, 0.28));

    // 4. 陶罐 / 宫灯破碎：竹框折断声 + 9 枚高低错落瓷片溅落
    this.foley.set(
      'lantern_break',
      makeBuf(0.24, (out) => {
        addModalBurst(
          out,
          0,
          [
            [560, 0.25, 58],
            [1140, 0.22, 85],
          ],
          0.55,
          65
        );
        for (let i = 0; i < 9; i++) {
          const hz = 1650 + ((i * 577) % 3600);
          addModalBurst(out, 0.008 + i * 0.014, [
            [hz, 0.16, 42 + i * 4],
            [hz * 1.63, 0.1, 64 + i * 5],
          ]);
        }
      })
    );

    // 5. 生铁剑刃拼刀弹反（7 阶冷钢非谐振泛音列，清越凄厉！）
    this.foley.set(
      'parry_clang',
      makeBuf(0.42, (out) => {
        const modes = [1390, 2180, 2960, 3840, 4790, 5920, 7150];
        addModalBurst(
          out,
          0,
          modes.map((hz, idx) => [hz, 0.34 / (1 + idx * 0.38), 6.8 + idx * 2.9]),
          0.65,
          190
        );
      })
    );

    // 6. 妖魔溃灭 & 镇关魔神轰塌钟鸣
    this.foley.set(
      'enemy_die',
      makeBuf(0.28, (out) => {
        let lp = 0;
        let phase = 0;
        for (let i = 0; i < out.length; i++) {
          const t = i / sr;
          const f = 94 * (0.45 + 0.65 * Math.exp(-t * 18));
          phase += (2 * Math.PI * f) / sr;
          lp = lp * 0.88 + (rand() * 2 - 1) * 0.12;
          out[i] += Math.sin(phase) * Math.exp(-t * 15) * 0.6 + lp * Math.exp(-t * 11) * 0.55;
        }
      })
    );
    this.foley.set(
      'boss_die',
      makeBuf(0.95, (out) => {
        let lp = 0;
        let phase = 0;
        for (let i = 0; i < out.length; i++) {
          const t = i / sr;
          const f = 68 * (0.48 + 0.72 * Math.exp(-t * 11));
          phase += (2 * Math.PI * f) / sr;
          lp = lp * 0.92 + (rand() * 2 - 1) * 0.08;
          out[i] += Math.sin(phase) * Math.exp(-t * 5.2) * 0.68 + lp * Math.exp(-t * 4.5) * 0.42;
        }
        addModalBurst(out, 0.015, [
          [110, 0.38, 2.8],
          [174, 0.24, 3.6],
          [256, 0.18, 4.8],
          [342, 0.11, 6.2],
        ]);
      })
    );

    // 7. 施展玄门绝学：丹田真炁吐纳涌流 + 青霜出鞘剑鸣
    this.foley.set(
      'skill_cast',
      makeBuf(0.38, (out) => {
        let lp = 0;
        let bp = 0;
        for (let i = 0; i < out.length; i++) {
          const t = i / sr;
          const u = i / out.length;
          const n = rand() * 2 - 1;
          const hz = 240 + Math.sin(u * Math.PI) * 920;
          const a = Math.min(0.8, (2 * Math.PI * hz) / sr);
          lp += a * (n - lp);
          const band = lp - bp;
          bp += a * 0.42 * (lp - bp);
          const env = Math.sin(u * Math.PI);
          out[i] += band * env * 0.82;
        }
        addModalBurst(out, 0.02, [
          [293.66, 0.22, 6.5],
          [440, 0.16, 8.2],
          [2080, 0.11, 14],
          [3290, 0.08, 19],
        ]);
      })
    );

    // 8. 奇宝秘卷现世：先秦合瓦形双音青铜编钟清越长鸣
    this.foley.set(
      'relic_bell',
      makeBuf(0.95, (out) => {
        const hitBianzhong = (startSec: number, rootHz: number, amp: number) =>
          addModalBurst(
            out,
            startSec,
            [
              [rootHz, 0.42 * amp, 3.1],
              [rootHz * 1.21, 0.26 * amp, 4.4],
              [rootHz * 2.02, 0.22 * amp, 6.2],
              [rootHz * 2.78, 0.14 * amp, 9.5],
              [rootHz * 3.62, 0.08 * amp, 14],
            ],
            0.22 * amp,
            160
          );
        hitBianzhong(0, 293.66, 1.0);
        hitBianzhong(0.15, 440, 0.85);
      })
    );

    // 9. 主角受创痛感：沉闷护体硬直撞击 + 衣袍裂响
    this.foley.set(
      'hurt',
      makeBuf(0.2, (out) => {
        let lp = 0;
        let phase = 0;
        for (let i = 0; i < out.length; i++) {
          const t = i / sr;
          const f = 96 * (0.42 + 0.72 * Math.exp(-t * 28));
          phase += (2 * Math.PI * f) / sr;
          lp = lp * 0.78 + (rand() * 2 - 1) * 0.22;
          out[i] += Math.sin(phase) * Math.exp(-t * 17) * 0.78 + lp * Math.exp(-t * 22) * 0.56;
        }
      })
    );

    // 10. 玄门大堂牛皮战鼓（圆膜贝塞尔泛音 + 鼓槌皮面敲击瞬态！）
    this.foley.set(
      'war_drum',
      makeBuf(0.3, (out) => {
        let phase1 = 0;
        let phase2 = 0;
        let phase3 = 0;
        let lp = 0;
        const base = 68;
        for (let i = 0; i < out.length; i++) {
          const t = i / sr;
          const tension = 1 + 0.34 * Math.exp(-t * 48);
          phase1 += (2 * Math.PI * base * tension) / sr;
          phase2 += (2 * Math.PI * base * 1.59 * tension) / sr;
          phase3 += (2 * Math.PI * base * 2.14 * tension) / sr;
          lp = lp * 0.72 + (rand() * 2 - 1) * 0.28;
          const body =
            Math.sin(phase1) * Math.exp(-t * 11.5) * 0.78 +
            Math.sin(phase2) * Math.exp(-t * 18) * 0.24 +
            Math.sin(phase3) * Math.exp(-t * 26) * 0.12;
          const stick = lp * Math.exp(-t * 110) * 0.52;
          out[i] += body + stick;
        }
      })
    );

    // 11. 五行兵刃附魔瞬态（寒霜碎冰 / 紫电雷爆 / 饮血脉动 / 蓄力龙吟）
    this.foley.set(
      'elem_frost',
      makeBuf(0.28, (out) => {
        for (let i = 0; i < 7; i++) {
          const hz = 2900 + ((i * 811) % 3400);
          addModalBurst(out, i * 0.016, [
            [hz, 0.18, 36],
            [hz * 1.38, 0.12, 48],
          ]);
        }
      })
    );
    this.foley.set(
      'elem_lightning',
      makeBuf(0.22, (out) => {
        let lp = 0;
        for (let i = 0; i < out.length; i++) {
          const t = i / sr;
          const n = rand() * 2 - 1;
          lp = lp * 0.88 + n * 0.12;
          const arc = i < sr * 0.045 ? n * 0.65 * Math.exp(-t * 42) : 0;
          const thunder = lp * Math.exp(-t * 14) * 0.72;
          out[i] += arc + thunder;
        }
      })
    );
    this.foley.set(
      'elem_blood',
      makeBuf(0.18, (out) => {
        addModalBurst(out, 0, [[82, 0.55, 16], [124, 0.28, 22]], 0.35, 38);
      })
    );
    this.foley.set(
      'elem_charge',
      makeBuf(0.45, (out) => {
        addModalBurst(
          out,
          0.02,
          [
            [220, 0.26, 5.2],
            [330, 0.2, 6.8],
            [587.3, 0.16, 8.5],
          ],
          0.22,
          16
        );
      })
    );
  }

  private playFoley(
    key: string,
    vol: number,
    rateJitter = 0.08,
    useEcho = false,
    baseRate = 1
  ): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const buf = this.foley.get(key);
    if (!buf) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = baseRate * (1 + (Math.random() - 0.5) * rateJitter);
    const g = ctx.createGain();
    g.gain.value = vol;
    src.connect(g);
    this.sendToHall(g, useEcho);
    src.start(ctx.currentTime);
  }

  /**
   * Karplus-Strong 物理建模古筝/琵琶丝弦（温润木腔共鸣 + 自然弦衰，彻底去除锯齿机械味！）
   */
  private getZitherBuffer(midi: number): AudioBuffer | null {
    const cached = this.zitherCache.get(midi);
    if (cached || !this.ctx) return cached ?? null;
    const sr = this.ctx.sampleRate;
    const hz = midiToHz(midi);
    const delayN = Math.max(8, Math.round(sr / hz));
    const len = Math.floor(sr * 0.62);
    const buf = this.ctx.createBuffer(1, len, sr);
    const out = buf.getChannelData(0);
    const ring = new Float32Array(delayN);

    // 温润拨片滤波白噪初始激励 + 古桐木共鸣音色微调
    let lp = 0;
    for (let i = 0; i < delayN; i++) {
      const white = Math.random() * 2 - 1;
      lp = lp * 0.55 + white * 0.45;
      ring[i] = lp * Math.sin((i / delayN) * Math.PI);
    }

    const damping = hz > 520 ? 0.992 : 0.9955;
    let bodyPhase = 0;
    let idx = 0;
    for (let i = 0; i < len; i++) {
      const nextIdx = (idx + 1) % delayN;
      const s = 0.5 * (ring[idx] + ring[nextIdx]) * damping;
      ring[idx] = s;
      idx = nextIdx;
      bodyPhase += (2 * Math.PI * Math.min(260, hz * 0.5)) / sr;
      const woodBody = Math.sin(bodyPhase) * Math.exp((-i / sr) * 18) * 0.16;
      out[i] = s * 0.72 + woodBody;
    }
    this.zitherCache.set(midi, buf);
    return buf;
  }

  // 声部一：物理建模古筝/琵琶清脆丝弦琶音
  private playHarpsichordGuzheng(freq: number, dur: number, vol: number): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const midi = Math.round(69 + 12 * Math.log2(Math.max(55, freq) / 440));
    const buf = this.getZitherBuffer(midi);
    if (!buf) return;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const exactRatio = freq / midiToHz(midi);
    src.playbackRate.value = Math.max(0.5, Math.min(2, exactRatio));

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol * 1.45, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.min(0.6, Math.max(0.16, dur * 1.4)));
    src.connect(gain);
    this.sendToHall(gain, true);
    src.start(now);
  }

  // 声部二：温润二胡/洞箫揉弦歌唱主旋律（木腔柔和滤波 + 自然松香呼吸泛音）
  private playBowedLead(freq: number, dur: number, vol: number): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 2, now);
    g2.gain.value = 0.24;

    lfo.type = 'sine';
    lfo.frequency.value = 5.3;
    lfoGain.gain.value = freq * 0.009;
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);

    filter.type = 'lowpass';
    filter.frequency.value = Math.min(2200, freq * 2.5);
    filter.Q.value = 1.4;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol * 1.15, now + 0.055);
    gain.gain.setValueAtTime(vol * 0.92, now + dur * 0.65);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc1.connect(filter);
    osc2.connect(g2);
    g2.connect(filter);
    filter.connect(gain);
    this.sendToHall(gain, true);

    osc1.start(now);
    osc2.start(now);
    lfo.start(now);
    osc1.stop(now + dur + 0.03);
    osc2.stop(now + dur + 0.03);
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

  // 声部四：堂鼓牛皮战鼓（调用预烘培鼓腔拟音而非单一正弦波扫频）与竹木击节
  private playDrum(vol: number, pitch = 68): void {
    this.playFoley('war_drum', vol * 2.1, 0.06, false, Math.max(0.55, Math.min(1.65, pitch / 68)));
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

  // 声部五：竹笛/洞箫空灵气声吹奏（转段交替主奏）
  private playBambooFlute(freq: number, dur: number, vol: number): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc2.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 2, now);
    const g2 = ctx.createGain();
    g2.gain.value = 0.18;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.055);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(gain);
    osc2.connect(g2);
    g2.connect(gain);
    this.sendToHall(gain, true);
    osc.start(now);
    osc2.start(now);
    osc.stop(now + dur + 0.03);
    osc2.stop(now + dur + 0.03);
  }

  // 声部六：先秦青铜编钟/编磬清越泛音 + 场景微环境白噪音（夜雨/炉火/寒潭水滴/冥风）
  private playBronzeBell(freq: number, dur: number, vol: number): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    o1.type = 'sine';
    o2.type = 'sine';
    o1.frequency.setValueAtTime(freq, now);
    o2.frequency.setValueAtTime(freq * 2.76, now);
    const g2 = ctx.createGain();
    g2.gain.value = 0.25;
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o1.connect(g);
    o2.connect(g2);
    g2.connect(g);
    this.sendToHall(g, true);
    o1.start(now);
    o2.start(now);
    o1.stop(now + dur + 0.04);
    o2.stop(now + dur + 0.04);
  }

  private tickAmbientSoundscape(sub: number): void {
    if (this.sfxMuted || this.ambientKind === 'none' || !this.ctx || !this.noiseBuf) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    if (this.ambientKind === 'rain' && sub % 2 === 0) {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 3200;
      bp.Q.value = 0.7;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.014, now + 0.12);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);
      src.connect(bp);
      bp.connect(g);
      this.sendToHall(g, false);
      src.start(now);
      src.stop(now + 0.38);
    } else if (this.ambientKind === 'forge' && sub % 4 === 0) {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 280;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.024, now + 0.18);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
      src.connect(lp);
      lp.connect(g);
      this.sendToHall(g, false);
      src.start(now);
      src.stop(now + 0.39);
    } else if (this.ambientKind === 'water' && sub === 3 && Math.random() < 0.55) {
      const dropHz = 980 + Math.random() * 480;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(dropHz, now);
      osc.frequency.exponentialRampToValueAtTime(dropHz * 1.45, now + 0.065);
      g.gain.setValueAtTime(0.022, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      osc.connect(g);
      this.sendToHall(g, true);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (this.ambientKind === 'nether' && sub === 0) {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 420;
      bp.Q.value = 2.4;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.018, now + 0.16);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.39);
      src.connect(bp);
      bp.connect(g);
      this.sendToHall(g, true);
      src.start(now);
      src.stop(now + 0.4);
    }
  }

  private tickBgm(): void {
    if (this.bgmMuted || document.hidden || !this.ctx || this.ctx.state !== 'running') return;
    const s = this.step++;
    const sub = s % 8; // 每小节 8 拍

    let score = SCORE_CASTLE;
    if (this.mood === 'library' || this.mood === 'title' || this.mood === 'opera') score = SCORE_LIBRARY;
    else if (this.mood === 'clock') score = SCORE_CLOCK;
    else if (this.mood === 'colosseum') score = SCORE_COLOSSEUM;
    else if (this.mood === 'forge') score = SCORE_FORGE;
    else if (this.mood === 'prison') score = SCORE_PRISON;
    else if (this.mood === 'nether') score = SCORE_NETHER;
    else if (this.mood === 'inverted') score = SCORE_INVERTED;
    else if (this.mood === 'boss') score = SCORE_BOSS;

    const barIdx = Math.floor(s / 8) % score.length;
    const bar = score[barIdx];

    this.tickAmbientSoundscape(sub);

    // 1. 古筝分解琶音持续流淌
    const arpOrder = [0, 1, 2, 3, 2, 1, 3, 2];
    const arpMidi = bar.arp[arpOrder[sub]];
    this.playHarpsichordGuzheng(midiToHz(arpMidi), 0.28, this.mood === 'title' ? 0.025 : 0.032);

    // 2. 行进低音与首拍青铜编钟点染
    if (sub === 0 || sub === 4 || (this.mood === 'boss' && sub % 2 === 0)) {
      const octaveShift = sub === 4 ? 12 : 0;
      this.playBassNote(midiToHz(bar.bass + octaveShift), 0.34, 0.072);
    }
    if (sub === 0 && barIdx % 4 === 0 && this.mood !== 'boss') {
      this.playBronzeBell(midiToHz(bar.arp[3] + 12), 0.95, 0.026);
    }

    // 3. 二胡揉弦 ⟷ 竹笛吹管 交替主奏（前段二胡深沉，转段竹笛清越！）
    const leadMidi = bar.lead[sub];
    if (leadMidi !== null && (s >= 8 || this.mood === 'boss')) {
      const useFlute =
        this.mood === 'library' ||
        this.mood === 'prison' ||
        this.mood === 'nether' ||
        barIdx >= 8;
      if (useFlute && this.mood !== 'boss') {
        this.playBambooFlute(midiToHz(leadMidi), 0.44, this.mood === 'title' ? 0.034 : 0.044);
      } else {
        this.playBowedLead(midiToHz(leadMidi), 0.42, this.mood === 'title' ? 0.032 : 0.045);
      }
    }

    // 4. 鼓点律动
    if (
      this.mood === 'boss' ||
      this.mood === 'colosseum' ||
      this.mood === 'clock' ||
      this.mood === 'forge' ||
      this.mood === 'castle' ||
      this.mood === 'inverted'
    ) {
      if (
        sub === 0 ||
        ((this.mood === 'boss' || this.mood === 'colosseum') && (sub === 3 || sub === 6))
      ) {
        this.playDrum(this.mood === 'boss' ? 0.095 : this.mood === 'colosseum' ? 0.082 : 0.058, 58);
      }
      if (sub % 2 === 1) {
        this.playHiTick(0.017);
      }
    }
  }

  public playElementalSlash(kind: 'frost' | 'blood' | 'lightning' | 'charge'): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    if (kind === 'frost') {
      this.playFoley('elem_frost', 0.26, 0.12, true);
    } else if (kind === 'lightning') {
      this.playFoley('elem_lightning', 0.28, 0.14, true);
    } else if (kind === 'blood') {
      this.playFoley('elem_blood', 0.28, 0.1, false);
    } else if (kind === 'charge') {
      this.playFoley('elem_charge', 0.3, 0.06, true);
    }
  }

  public playSlash(weight: 'light' | 'heavy' | 'spear' | 'whip'): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    const key =
      weight === 'heavy'
        ? 'slash_heavy'
        : weight === 'whip'
          ? 'slash_whip'
          : weight === 'spear'
            ? 'slash_spear'
            : 'slash_light';
    this.playFoley(key, weight === 'heavy' ? 0.32 : 0.26, 0.1, false);
  }

  public playHit(crit = false, heavy = false): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    const key = crit ? 'hit_crit' : heavy ? 'hit_heavy' : 'hit_normal';
    this.playFoley(key, crit ? 0.36 : heavy ? 0.32 : 0.26, 0.1, false);
  }

  public playLanternBreak(): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    this.playFoley('lantern_break', 0.28, 0.12, true);
  }

  public playEnemyDie(isBoss = false): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    this.playFoley(isBoss ? 'boss_die' : 'enemy_die', isBoss ? 0.36 : 0.28, 0.08, isBoss);
  }

  public playParryClang(): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    this.playFoley('parry_clang', 0.32, 0.07, true);
  }

  public playSkillCast(): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    this.playFoley('skill_cast', 0.3, 0.06, true);
  }

  public playRelicBell(): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    this.playFoley('relic_bell', 0.34, 0.04, true);
  }

  public playJump(): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    this.playFoley('jump', 0.24, 0.12, false);
  }

  public playHurt(): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    this.playFoley('hurt', 0.32, 0.08, false);
  }
}

export const AudioFX = new GuofengAudioEngine();
