import { GameMode, GlobalMetaUnlock, SaveSlotData } from '../types';

const SLOT_KEY_PREFIX = 'xuancheng_vs_slot_v2_';
const META_KEY = 'xuancheng_global_meta_v1';
export const MAX_SAVE_SLOTS = 4;

export function createFreshSaveSlot(slotIndex: number, mode: GameMode = 'story'): SaveSlotData {
  const isXiao = mode === 'xiaoduanshui';
  return {
    slotIndex,
    updatedAt: Date.now(),
    mode,
    heroName: isXiao ? '萧断水' : '李逸承',
    level: isXiao ? 12 : 1,
    exp: 0,
    gold: isXiao ? 500 : 80,
    talismanHearts: isXiao ? 40 : 15,
    maxHpBonus: isXiao ? 80 : 0,
    maxMpBonus: isXiao ? 60 : 0,
    currentRoomId: mode === 'boss_rush' ? 'boss_rush_arena' : 'bamboo_outpost',
    currentRealm: 'normal',
    equippedWeapon: isXiao ? 'spear_2' : 'sword_0',
    equippedSubWeapon: isXiao ? 'bagua_cross' : 'dagger_throw',
    equippedArmor: isXiao ? 'mingguang_armor' : 'cloth_tunic',
    equippedAccessory: 'broken_jade',
    equippedYaoCore: '',
    ownedWeapons: isXiao ? ['spear_2', 'sword_2'] : ['sword_0'],
    ownedSubWeapons: isXiao ? ['dagger_throw', 'bagua_cross', 'holy_fire'] : ['dagger_throw'],
    ownedArmors: isXiao ? ['mingguang_armor', 'broken_jade'] : ['cloth_tunic', 'broken_jade'],
    ownedYaoCores: [],
    // 基础武学秘技随身掌握，第5式禁术在禁阁习得
    learnedSkills: ['shuofeng_wave', 'shunying_flash', 'jinghong_rising', 'taiji_parry'],
    abilities: isXiao
      ? ['double_jump', 'ground_slam', 'mist_dash', 'grapple_hook', 'wall_jump']
      : [],
    consumables: {
      jinchuang_yao: 2,
      huiqi_dan: 1,
    },
    mapLayoutVersion: 3,
    visitedRooms: mode === 'boss_rush' ? [] : ['normal:bamboo_outpost'],
    collectedPickups: [],
    defeatedBosses: [],
    triggeredStories: [],
    readSteles: [],
    mapPins: [],
    brokenSecretWalls: [],
    playTimeSec: 0,
  };
}

class SaveSystem {
  private meta: GlobalMetaUnlock = {
    unlockedXiaoMode: false,
    unlockedBossRush: false,
    bestExplorationPct: 0,
    bestBossRushSec: null,
    controlStyle: 'joystick',
    padScale: 1.0,
    sfxMuted: false,
    bgmMuted: false,
  };

  public loadMeta(): GlobalMetaUnlock {
    try {
      const raw = localStorage.getItem(META_KEY);
      if (raw) {
        this.meta = { ...this.meta, ...JSON.parse(raw) };
      }
    } catch {
      // ignore storage errors
    }
    return this.meta;
  }

  public getMeta(): GlobalMetaUnlock {
    return this.meta;
  }

  public saveMeta(patch: Partial<GlobalMetaUnlock>): void {
    this.meta = { ...this.meta, ...patch };
    try {
      localStorage.setItem(META_KEY, JSON.stringify(this.meta));
    } catch {
      // ignore
    }
  }

  public getSlot(slotIndex: number): SaveSlotData | null {
    if (slotIndex < 1 || slotIndex > MAX_SAVE_SLOTS) return null;
    try {
      const raw = localStorage.getItem(`${SLOT_KEY_PREFIX}${slotIndex}`);
      if (!raw) return null;
      return JSON.parse(raw) as SaveSlotData;
    } catch {
      return null;
    }
  }

  public listSlots(): (SaveSlotData | null)[] {
    const out: (SaveSlotData | null)[] = [];
    for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
      out.push(this.getSlot(i));
    }
    return out;
  }

  public getLatestSlot(): SaveSlotData | null {
    const slots = this.listSlots().filter(
      (s): s is SaveSlotData => Boolean(s && s.mode !== 'boss_rush')
    );
    if (slots.length === 0) return null;
    const preferred = this.meta.lastActiveSlot
      ? slots.find((s) => s.slotIndex === this.meta.lastActiveSlot)
      : undefined;
    let newest = slots[0];
    for (const s of slots) {
      if ((s.updatedAt || 0) > (newest.updatedAt || 0)) newest = s;
    }
    if (preferred && (preferred.updatedAt || 0) >= (newest.updatedAt || 0)) {
      return preferred;
    }
    return newest;
  }

  public findFirstEmptySlot(): number | null {
    for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
      if (!this.getSlot(i)) return i;
    }
    return null;
  }

  public saveSlot(data: SaveSlotData): void {
    if (data.mode === 'boss_rush' || data.slotIndex < 1 || data.slotIndex > MAX_SAVE_SLOTS) {
      return;
    }
    data.updatedAt = Date.now();
    try {
      localStorage.setItem(`${SLOT_KEY_PREFIX}${data.slotIndex}`, JSON.stringify(data));
      this.saveMeta({ lastActiveSlot: data.slotIndex });
    } catch {
      // ignore
    }
  }

  public deleteSlot(slotIndex: number): void {
    try {
      localStorage.removeItem(`${SLOT_KEY_PREFIX}${slotIndex}`);
      if (this.meta.lastActiveSlot === slotIndex) {
        const nextLatest = this.getLatestSlot();
        this.saveMeta({ lastActiveSlot: nextLatest?.slotIndex });
      }
    } catch {
      // ignore
    }
  }
}

export const SaveManager = new SaveSystem();
