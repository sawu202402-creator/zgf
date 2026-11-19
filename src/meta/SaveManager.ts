import { GameMode, GlobalMetaUnlock, SaveSlotData } from '../types';

const SLOT_KEY_PREFIX = 'xuancheng_vs_slot_v2_';
const META_KEY = 'xuancheng_global_meta_v1';

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
    currentRoomId: mode === 'boss_rush' ? 'boss_rush_arena' : 'gate_1',
    currentRealm: 'normal',
    equippedWeapon: isXiao ? 'spear_2' : 'sword_1',
    equippedSubWeapon: isXiao ? 'bagua_cross' : 'dagger_throw',
    equippedArmor: isXiao ? 'mingguang_armor' : 'cloth_tunic',
    equippedAccessory: 'broken_jade',
    equippedYaoCore: '',
    ownedWeapons: isXiao ? ['spear_2', 'sword_2'] : ['sword_1'],
    ownedSubWeapons: isXiao ? ['dagger_throw', 'bagua_cross', 'holy_fire'] : ['dagger_throw'],
    ownedArmors: isXiao ? ['mingguang_armor', 'broken_jade'] : ['cloth_tunic', 'broken_jade'],
    ownedYaoCores: [],
    // 前4式基础秘传武学默认铭刻于心，玩家随时可直接手搓释放！第5式终极禁术也可盲搓或在禁书室习得
    learnedSkills: ['shuofeng_wave', 'shunying_flash', 'jinghong_rising', 'taiji_parry'],
    abilities: isXiao
      ? ['double_jump', 'ground_slam', 'mist_dash', 'grapple_hook', 'wall_jump']
      : [],
    consumables: {
      jinchuang_yao: 2,
      huiqi_dan: 1,
    },
    visitedRooms: mode === 'boss_rush' ? [] : ['normal:gate_1'],
    collectedPickups: [],
    defeatedBosses: [],
    triggeredStories: [],
    readSteles: [],
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
    try {
      const raw = localStorage.getItem(`${SLOT_KEY_PREFIX}${slotIndex}`);
      if (!raw) return null;
      return JSON.parse(raw) as SaveSlotData;
    } catch {
      return null;
    }
  }

  public saveSlot(data: SaveSlotData): void {
    data.updatedAt = Date.now();
    try {
      localStorage.setItem(`${SLOT_KEY_PREFIX}${data.slotIndex}`, JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  public deleteSlot(slotIndex: number): void {
    try {
      localStorage.removeItem(`${SLOT_KEY_PREFIX}${slotIndex}`);
    } catch {
      // ignore
    }
  }
}

export const SaveManager = new SaveSystem();
