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
      this.playBronzeBell(midiToHz(88), 0.28, 0.055);
      this.playBronzeBell(midiToHz(95), 0.22, 0.045);
    } else if (kind === 'lightning') {
      this.playHarpsichordGuzheng(midiToHz(84), 0.14, 0.07);
      this.playHiTick(0.065);
    } else if (kind === 'blood') {
      this.playDrum(0.14, 52);
    } else if (kind === 'charge') {
      this.playDrum(0.24, 46);
      this.playBronzeBell(midiToHz(74), 0.48, 0.085);
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

  public playHit(crit = false, heavy = false): void {
    if (this.sfxMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    // 1. 沉实入肉低频闷击声
    this.playDrum(crit ? 0.24 : heavy ? 0.2 : 0.16, crit ? 96 : heavy ? 66 : 78);

    // 2. 刀刃切裂甲胄噪波瞬态（恶魔城刀刀入肉核心听感！）
    if (this.noiseBuf) {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(crit ? 2100 : 1450, now);
      bp.frequency.exponentialRampToValueAtTime(380, now + 0.075);
      bp.Q.value = 1.6;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(crit ? 0.19 : 0.13, now);
      ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      src.connect(bp);
      bp.connect(ng);
      this.sendToHall(ng, false);
      src.start(now);
      src.stop(now + 0.085);
    }

    // 3. 冷冽金铁泛音余韵
    if (crit || heavy) {
      this.playHarpsichordGuzheng(midiToHz(crit ? 81 : 74), 0.18, crit ? 0.09 : 0.06);
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
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    this.playDrum(0.28, 48);
    if (this.noiseBuf) {
      const now = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(920, now);
      lp.frequency.exponentialRampToValueAtTime(220, now + 0.14);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      src.connect(lp);
      lp.connect(gain);
      this.sendToHall(gain, false);
      src.start(now);
      src.stop(now + 0.16);
    }
  }
}

export const AudioFX = new GuofengAudioEngine();
