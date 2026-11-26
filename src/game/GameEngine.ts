import { AudioFX } from '../audio/GuofengAudio';
import {
  AssetKey,
  Assets,
  resolveEnemyAssetKeys,
  resolveFamiliarAssetKey,
  resolveWeaponAssetKey,
} from './AssetLoader';
import { BOSS_RUSH_ORDER, ENEMY_PROFILES, EnemyProfile, EnemyWeakness } from '../data/enemies';
import {
  ABILITIES_META,
  ALL_FAMILIAR_IDS,
  ARMORS,
  CONSUMABLES,
  FAMILIARS,
  getWeaponRefinedAtk,
  getWeaponRefinedCritBonus,
  getWeaponUpgradeCost,
  getWeaponUpgradeLevel,
  MAX_WEAPON_UPGRADE,
  SKILLS,
  SUB_WEAPONS,
  WEAPONS,
  YAO_CORES,
} from '../data/itemsAndSkills';
import {
  BOSS_PHASE2_LINES,
  CASTLE_BOUNTIES,
  getDynamicSuQingyanScene,
  LORE_STELES,
  STORY_SCENES,
} from '../data/storyAndNpcs';
import {
  BuiltRoom,
  CELL_PIXEL_W,
  getArchBridgeGeometry,
  getRoomSideDoors,
  INVERTED_REGION_NAMES,
  isGroundRestingSolidBlock,
  REGION_NAMES,
  sampleCeilingY,
  sampleEntitySurfaceY,
  sampleGroundY,
  sampleSolidGroundY,
  SideDoor,
  WorldMap,
} from '../data/worldMap';
import { getClockGearOrbitPlatforms } from './GuofengWorldArt';
import { SaveManager } from '../meta/SaveManager';
import { NativeApp } from '../platform/NativeAppBridge';
import {
  AbilityKey,
  CastleRealm,
  CombatBuffKind,
  EnemyKind,
  FamiliarId,
  SaveSlotData,
  SkillId,
  StoryScene,
  SubWeaponId,
} from '../types';
import { InputController } from './MotionInput';

export interface ActiveSlash {
  x: number;
  y: number;
  facing: 1 | -1;
  aimX: number;
  aimY: number;
  archetype: string;
  weaponId?: string;
  comboStep: number;
  pogoDown: boolean;
  progress: number; // 0..1 (0..0.28 前摇蓄势, 0.28..0.82 刀光挥斩判定, 0.82..1 收刀余韵)
  duration: number;
  reachX: number;
  reachY: number;
  color: string;
  glowColor: string;
  slammedGround?: boolean;
  chargedHeavy?: boolean;
  specialEffect?: string;
}

export interface ActiveSkillAnim {
  kind: SkillId | 'sub_throw';
  progress: number; // 0..1
  duration: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  facing: 1 | -1;
  color: string;
  parrySuccess?: boolean;
  soulTargets?: { x: number; y: number }[];
}

export type EnemyProjectileFx =
  | 'venom_glob'
  | 'venom_pool'
  | 'bronze_axe'
  | 'cursed_talisman'
  | 'thunder_lance'
  | 'opera_needle'
  | 'magma_bomb'
  | 'magma_pool'
  | 'lava_wave'
  | 'bone_bolt'
  | 'cinnabar_flask'
  | 'frost_flail'
  | 'ink_calligraphy'
  | 'bronze_gear';

export interface Projectile {
  fromPlayer: boolean;
  ownerId?: number;
  kind: 'qi_wave' | 'dagger' | 'holy_fire' | 'fire_pillar' | 'bagua' | 'seal' | 'ink_spear';
  enemyFx?: EnemyProjectileFx;
  affinity?: EnemyWeakness;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  dmg: number;
  color: string;
  life: number;
  maxLife: number;
  pierce: number;
  returning?: boolean;
  burnOnHit?: boolean;
  gravity?: number;
  homingRate?: number;
  orbitParentId?: number;
  orbitAngle?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
  orbitReleaseTime?: number;
  waveAmp?: number;
  waveFreq?: number;
  wavePhase?: number;
  waveBaseY?: number;
  returnAtRatio?: number;
  hitIds: Set<number>;
}

export interface SkyStrikeTelegraph {
  x: number;
  groundY: number;
  timer: number;
  maxTimer: number;
  dmg: number;
  color?: string;
  discColor?: string;
}

export type EnemyAIState = 'stalk' | 'windup' | 'lunge_slash' | 'recover' | 'staggered';

export type BossActionKind =
  | 'lunge'
  | 'leap_slam'
  | 'dive_bomb'
  | 'multi_dash'
  | 'spin_whirl'
  | 'air_sweep'
  | 'backstep_vault';

export interface EnemyEntity {
  id: number;
  profile: EnemyProfile;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  hp: number;
  hpTrail: number;
  maxHp: number;
  poise: number;
  maxPoise: number;
  poiseRegenDelay?: number;
  guardStanceTimer?: number;
  aiState: EnemyAIState;
  stateTimer: number;
  stateDuration?: number;
  castAnimTimer?: number;
  cleaveSlamDone?: boolean;
  bossAction?: BossActionKind;
  bossSubStep?: number;
  bossTargetX?: number;
  bossTargetY?: number;
  bossAuxTimer?: number;
  animPhase: number;
  hurtFlash: number;
  hurtJoltTimer?: number;
  burrowEmergeTimer?: number;
  burrowTriggered?: boolean;
  roosting?: boolean;
  baseY: number;
  bossMoveIdx: number;
  slashHitPlayer: boolean;
  enragedTriggered?: boolean;
  chillTimer?: number;
  dotTimer?: number;
  dotTickTimer?: number;
  dotDmg?: number;
  dotColor?: string;
}

export interface WorldDrop {
  id: string;
  isStaticPickup: boolean;
  kind:
    | 'gold'
    | 'heart'
    | 'yao_core'
    | 'weapon'
    | 'armor'
    | 'consumable'
    | 'ability'
    | 'skill_scroll'
    | 'max_up';
  itemId: string;
  amount: number;
  x: number;
  y: number;
  vx?: number;
  vy: number;
  spinAngle?: number;
  bounced?: boolean;
  color: string;
  label: string;
}

export interface FloatingText {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  size: number;
  life: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  kind?: 'ink' | 'spark';
}

export interface SlashImpact {
  x: number;
  y: number;
  angle: number;
  length: number;
  thickness: number;
  color: string;
  ringRadius: number;
  life: number;
  maxLife: number;
}

export interface AfterImage {
  x: number;
  y: number;
  facing: 1 | -1;
  color: string;
  alpha: number;
}

export interface DyingEnemySoul {
  x: number;
  y: number;
  w: number;
  h: number;
  isBoss: boolean;
  color: string;
  timer: number;
  maxTimer: number;
}

export interface BreakableLanternEntity {
  id: number;
  x: number;
  y: number;
  broken: boolean;
}

export interface EngineCallbacks {
  onShowBanner: (title: string, sub: string) => void;
  onStartStory: (scene: StoryScene, onDone?: () => void) => void;
  onOpenInteractModal: (kind: 'smith' | 'merchant' | 'warp', opts?: { consumeTalisman?: boolean }) => void;
  onToggleMap: () => void;
  onTogglePause: () => void;
  onGameOver: () => void;
  onEndingReached: (endingKind: 'normal' | 'true' | 'boss_rush', timeSec: number) => void;
}

export class GameEngine {
  public slot: SaveSlotData | null = null;
  public room: BuiltRoom | null = null;
  public paused = false;
  public landscapePaused = false;

  public camX = 440;
  public camY = 280;
  private camLookX = 0;
  private camAnchorY = 404;

  public player = {
    x: 190,
    y: 426,
    w: 28,
    h: 74,
    vx: 0,
    vy: 0,
    facing: 1 as 1 | -1,
    hp: 100,
    hpTrail: 100,
    maxHp: 100,
    mp: 60,
    maxMp: 60,
    atk: 22,
    def: 5,
    str: 8,
    con: 8,
    int: 8,
    lck: 5,
    critChance: 0.08,
    speedMult: 1,
    lifesteal: 0,
    onGround: false,
    onWall: 0 as -1 | 0 | 1,
    coyoteTimer: 0,
    jumpBuffer: 0,
    airJumpsLeft: 0,
    doubleJumpSpinTimer: 0,
    dropThroughTimer: 0,
    attackCooldown: 0,
    skillCooldown: 0,
    subWeaponCooldown: 0,
    potionCooldown: 0,
    dashCooldown: 0,
    airDashUsed: false,
    comboStep: 0,
    comboResetTimer: 0,
    mistDashTimer: 0,
    backdashTimer: 0,
    crouching: false,
    slideTimer: 0,
    diveKicking: false,
    trailSpawnTimer: 0,
    groundSlamming: false,
    invulnTimer: 0,
    hurtBlinkTimer: 0,
    hurtStunTimer: 0,
    orbitSwordTimer: 0,
    orbitAngle: 0,
    animTime: 0,
    runCycle: 0,
    landSquash: 0,
    sprintTimer: 0,
    chargeTimer: 0,
    chargeReadyChimed: false,
  };

  public familiar = {
    x: 160,
    y: 360,
    facing: 1 as 1 | -1,
    swoopTimer: 0,
    targetX: 0,
    targetY: 0,
    cooldown: 0.8,
    calloutText: '',
    calloutTimer: 0,
  };
  public tortoiseShieldReady = true;
  private tortoiseShieldTimer = 0;
  private foxBlessingTimer = 3.2;

  public activeSlash: ActiveSlash | null = null;
  public activeSkillAnim: ActiveSkillAnim | null = null;
  public activeBuffs: Record<CombatBuffKind, number> = {
    berserk_wine: 0,
    iron_skin: 0,
    wind_crit: 0,
  };
  private slashHitIds = new Set<number>();
  private kickHitIds = new Set<number>();
  public skillBanner: { name: string; subtext?: string; timer: number; color: string } | null = null;
  public taijiFlashTimer = 0;
  public perfectDodgeBuffTimer = 0;
  public perfectDodgeFlashTimer = 0;
  private perfectDodgeCooldown = 0;
  public soulStealFlashTimer = 0;
  public levelUpPillarTimer = 0;
  public bossKillSlowTimer = 0;
  public parryZoomTimer = 0;
  public bellRingTimers = new Map<number, number>();
  private bellCooldowns = new Map<number, number>();
  private arrowTrapCycles = new Map<number, number>();
  private bossFightTookDamage = false;
  private secretWallDustTimer = 0;
  public lightningArcs: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
    life: number;
    maxLife: number;
  }[] = [];
  public grappleLineTimer = 0;
  public grappleTarget: { x: number; y: number } | null = null;

  public enemies: EnemyEntity[] = [];
  public dyingSouls: DyingEnemySoul[] = [];
  public liveLanterns: BreakableLanternEntity[] = [];
  public liveCrumbleSlabs: {
    id: string;
    x: number;
    y: number;
    w: number;
    state: 'solid' | 'shaking' | 'broken';
    timer: number;
  }[] = [];
  public waterRipples: { x: number; y: number; r: number; maxR: number; alpha: number }[] = [];
  private secretWallHits = new Map<string, number>();
  private orbitTickTimer = 0;
  public bossRushWave = 0;
  public projectiles: Projectile[] = [];
  public skyStrikes: SkyStrikeTelegraph[] = [];
  public drops: WorldDrop[] = [];
  public floats: FloatingText[] = [];
  public particles: Particle[] = [];
  public slashImpacts: SlashImpact[] = [];
  public afterImages: AfterImage[] = [];

  public screenShake = 0;
  public roomFadeTimer = 0;
  public pendingTransition: {
    nextRoom: BuiltRoom;
    nextX: number;
    nextY: number;
    phase: 'out' | 'in';
    timer: number;
    duration: number;
    walkVx: number;
    walkVy: number;
    postVy?: number;
  } | null = null;
  public ambushSealed = false;
  public storyDialogueActive = false;
  private pendingRoomStory: StoryScene | null = null;
  private pendingRoomStoryTimer = 0;
  private introWalkInTimer = 0;
  private hitstopTimer = 0;
  private nextEntityId = 1;
  private lastVisitedRegion = '';
  private lastSealHintMs = 0;
  public nearbyInteract: {
    kind:
      | 'save'
      | 'warp'
      | 'smith'
      | 'merchant'
      | 'su_qingyan'
      | 'invert_portal'
      | 'stele'
      | 'lever';
    steleId?: string;
    gateId?: string;
    label: string;
    x: number;
    y: number;
  } | null = null;

  constructor(
    public input: InputController,
    private cb: EngineCallbacks
  ) {}

  public startSession(slot: SaveSlotData, isPrologueWalkIn = false): void {
    this.slot = slot;
    this.paused = false;
    this.storyDialogueActive = false;
    this.pendingRoomStory = null;
    this.pendingRoomStoryTimer = 0;
    this.introWalkInTimer = 0;
    this.bossRushWave = 0;
    this.activeBuffs = { berserk_wine: 0, iron_skin: 0, wind_crit: 0 };
    this.tortoiseShieldReady = true;
    this.tortoiseShieldTimer = 0;
    this.foxBlessingTimer = 3.2;
    if (!slot.discoveredDrops) slot.discoveredDrops = [];
    if (!slot.readSteles) slot.readSteles = [];
    if (!slot.noHitBosses) slot.noHitBosses = [];
    if (!slot.claimedBounties) slot.claimedBounties = [];
    if (!slot.familiarExps) slot.familiarExps = {};
    if (slot.familiarExp && !slot.familiarExps.familiar_sword) {
      slot.familiarExps.familiar_sword = slot.familiarExp;
    }
    // 兼容旧存档中已合并/更名的兵刃与妖丹 ID
    const migrateWeaponId = (id: string) =>
      id === 'daggers_phantom' ? 'daggers_3' : id === 'whip_fire' ? 'whip_2' : WEAPONS[id] ? id : 'sword_0';
    slot.ownedWeapons = Array.from(new Set(slot.ownedWeapons.map(migrateWeaponId)));
    slot.equippedWeapon = migrateWeaponId(slot.equippedWeapon);
    if (slot.equippedYaoCore === 'core_bat') slot.equippedYaoCore = 'core_crow';
    slot.ownedYaoCores = slot.ownedYaoCores.map((c) => (c === 'core_bat' ? 'core_crow' : c));
    if (WorldMap.migrateSlotVisitedCells(slot)) {
      SaveManager.saveSlot(slot);
    }
    this.recalcStats(true);

    if (slot.mode === 'boss_rush') {
      const arena = WorldMap.getRoom('normal', 'boss_rush_arena');
      this.loadRoom(arena, 260, sampleGroundY(arena, 260));
      return;
    }

    const startRoom = WorldMap.getRoom(slot.currentRealm, slot.currentRoomId);
    const spawnX =
      isPrologueWalkIn && startRoom.id === 'bamboo_outpost'
        ? 78
        : startRoom.id === 'gate_1' && startRoom.realm === 'normal'
          ? 190
          : startRoom.focalX;
    this.loadRoom(startRoom, spawnX, sampleEntitySurfaceY(startRoom, spawnX, startRoom.focalY));
    if (isPrologueWalkIn && startRoom.id === 'bamboo_outpost') {
      this.roomFadeTimer = 0;
      this.player.facing = 1;
      this.introWalkInTimer = 0.9;
    }
  }

  public stopSession(): void {
    this.slot = null;
    this.room = null;
    AudioFX.setMood('title');
  }

  public computePreviewStats(overrides?: {
    weaponId?: string;
    armorId?: string;
    accessoryId?: string;
    coreId?: string;
  }): {
    maxHp: number;
    maxMp: number;
    atk: number;
    def: number;
    str: number;
    con: number;
    int: number;
    lck: number;
  } {
    const s = this.slot;
    if (!s) {
      return { maxHp: 110, maxMp: 65, atk: 24, def: 5, str: 9, con: 8, int: 9, lck: 6 };
    }
    const wId = overrides?.weaponId ?? s.equippedWeapon;
    const aId = overrides?.armorId ?? s.equippedArmor;
    const accId = overrides?.accessoryId ?? s.equippedAccessory;
    const cId = overrides?.coreId ?? s.equippedYaoCore;

    const weapon = WEAPONS[wId] || WEAPONS.sword_0;
    const upLv = getWeaponUpgradeLevel(s.weaponUpgrades, weapon.id);
    const wpnAtk = getWeaponRefinedAtk(weapon, upLv);
    const armor = ARMORS[aId] || ARMORS.cloth_tunic;
    const acc = ARMORS[accId] || ARMORS.broken_jade;
    const core = cId ? YAO_CORES[cId] : undefined;

    const lv = s.level;
    const str = 6 + Math.floor(lv * 0.8) + armor.strBonus + acc.strBonus;
    const con = 6 + Math.floor(lv * 0.9) + Math.floor(armor.def * 0.5);
    const intStat = 7 + Math.floor(lv * 0.85) + armor.intBonus + acc.intBonus;
    const lck = 5 + Math.floor(lv * 0.7) + armor.lckBonus + acc.lckBonus;

    const maxHp = 100 + lv * 8 + s.maxHpBonus + armor.hpBonus + acc.hpBonus;
    const maxMp = 64 + lv * 5 + s.maxMpBonus + armor.mpBonus + acc.mpBonus;
    const wineMult = this.activeBuffs.berserk_wine > 0 ? 1.28 : 1;
    let atk = Math.round((wpnAtk + str * 1.05) * (1 + (core?.atkPct || 0)) * wineMult);
    if (s.mode === 'xiaoduanshui') atk = Math.round(atk * 1.18);
    const rawDef = 3 + Math.floor(lv * 0.65) + armor.def + acc.def;
    const def = Math.round(rawDef * (1 + (core?.defPct || 0)));

    return { maxHp, maxMp, atk, def, str, con, int: intStat, lck };
  }

  public recalcStats(fullRestore = false): void {
    const s = this.slot;
    if (!s) return;

    const weapon = WEAPONS[s.equippedWeapon] || WEAPONS.sword_0;
    const upLv = getWeaponUpgradeLevel(s.weaponUpgrades, weapon.id);
    const armor = ARMORS[s.equippedArmor] || ARMORS.cloth_tunic;
    const acc = ARMORS[s.equippedAccessory] || ARMORS.broken_jade;
    const core = s.equippedYaoCore ? YAO_CORES[s.equippedYaoCore] : undefined;
    const st = this.computePreviewStats();

    this.player.str = st.str;
    this.player.con = st.con;
    this.player.int = st.int;
    this.player.lck = st.lck;
    this.player.maxHp = st.maxHp;
    this.player.maxMp = st.maxMp;
    this.player.atk = st.atk;
    this.player.def = st.def;
    const windCrit = this.activeBuffs.wind_crit > 0 ? 0.2 : 0;
    const windSpd = this.activeBuffs.wind_crit > 0 ? 0.14 : 0;
    this.player.critChance = Math.min(
      0.85,
      0.06 + getWeaponRefinedCritBonus(weapon, upLv) + st.lck * 0.004 + (core?.critPct || 0) + windCrit
    );
    const baseSpd =
      weapon.archetype === 'greatsword'
        ? 0.94
        : weapon.archetype === 'daggers'
          ? 1.14
          : s.mode === 'xiaoduanshui'
            ? 1.16
            : 1.04;
    this.player.speedMult =
      baseSpd +
      (core?.speedPct || 0) +
      (armor.speedBonus || 0) +
      (acc.speedBonus || 0) +
      windSpd;
    this.player.lifesteal =
      (core?.lifestealRatio || 0) +
      (weapon.lifestealBonus || 0) +
      (armor.lifestealBonus || 0) +
      (acc.lifestealBonus || 0);

    if (fullRestore) {
      this.player.hp = st.maxHp;
      this.player.hpTrail = st.maxHp;
      this.player.mp = st.maxMp;
    } else {
      this.player.hp = Math.min(this.player.hp, st.maxHp);
      this.player.hpTrail = Math.min(this.player.hpTrail, st.maxHp);
      this.player.mp = Math.min(this.player.mp, st.maxMp);
    }
  }

  public warpToRoom(realm: CastleRealm, roomId: string): void {
    const target = WorldMap.getRoom(realm, roomId);
    this.loadRoom(target, target.focalX, target.focalY);
    this.cb.onShowBanner(target.name, '');
  }

  private resolveRoomBgmMood(room: BuiltRoom, hasLiveBoss: boolean): void {
    if (hasLiveBoss) {
      AudioFX.setMood('boss');
    } else if (room.realm === 'inverted') {
      AudioFX.setMood('inverted');
    } else if (room.region === 'colosseum') {
      AudioFX.setMood('colosseum');
    } else if (room.region === 'forge') {
      AudioFX.setMood('forge');
    } else if (room.region === 'nether') {
      AudioFX.setMood('nether');
    } else if (room.region === 'opera') {
      AudioFX.setMood('opera');
    } else if (room.region === 'library' || room.region === 'alchemy') {
      AudioFX.setMood('library');
    } else if (room.region === 'clock_tower' || room.region === 'altar') {
      AudioFX.setMood('clock');
    } else if (
      room.region === 'prison' ||
      room.region === 'shipyard' ||
      room.region === 'catacomb'
    ) {
      AudioFX.setMood('prison');
    } else {
      AudioFX.setMood('castle');
    }

    // 区域环境白噪音织体：铸剑炉风箱铁砧、水牢归墟滴水暗潮、九幽极渊阴风、外城夜雨！
    if (room.region === 'forge') {
      AudioFX.setAmbient('forge');
    } else if (room.region === 'prison' || room.region === 'shipyard' || room.waterZones.length > 0) {
      AudioFX.setAmbient('water');
    } else if (room.region === 'nether' || room.region === 'catacomb' || room.realm === 'inverted') {
      AudioFX.setAmbient('nether');
    } else if (!room.indoor && (room.region === 'gatehouse' || room.region === 'clock_tower')) {
      AudioFX.setAmbient('rain');
    } else {
      AudioFX.setAmbient('none');
    }
  }

  public isSideDoorOpen(d: SideDoor): boolean {
    if (!d.secretWallId) return true;
    return Boolean(this.slot?.brokenSecretWalls.includes(d.secretWallId));
  }

  public isBossClearedInRoom(room: BuiltRoom): boolean {
    if (!room.bossKind) return true;
    if (!this.slot) return false;
    return (
      this.slot.defeatedBosses.includes(`${room.realm}:${room.bossKind}`) &&
      !this.enemies.some((e) => e.profile.isBoss)
    );
  }

  private markCurrentMapCellVisited(): void {
    if (!this.slot || !this.room || this.room.id === 'boss_rush_arena') return;
    const localGx = Math.max(
      0,
      Math.min(this.room.gridW - 1, Math.floor((this.player.x / Math.max(1, this.room.pixelW)) * this.room.gridW))
    );
    const localGyFoot = Math.max(
      0,
      Math.min(this.room.gridH - 1, Math.floor((this.player.y / Math.max(1, this.room.pixelH)) * this.room.gridH))
    );
    const localGyHead = Math.max(
      0,
      Math.min(
        this.room.gridH - 1,
        Math.floor((Math.max(0, this.player.y - this.player.h) / Math.max(1, this.room.pixelH)) * this.room.gridH)
      )
    );
    const gyList: number[] =
      this.room.pixelH <= 560 && this.room.gridH > 1
        ? Array.from({ length: this.room.gridH }, (_, idx) => idx)
        : localGyHead === localGyFoot
          ? [localGyFoot]
          : [localGyFoot, localGyHead];

    let changed = false;
    for (const gy of gyList) {
      const cellKey = `cell:${this.room.realm}:${this.room.mapX + localGx},${this.room.mapY + gy}`;
      if (!this.slot.visitedRooms.includes(cellKey)) {
        this.slot.visitedRooms.push(cellKey);
        changed = true;
      }
    }
    if (changed) {
      const pct = WorldMap.calcExplorationPct(this.slot.visitedRooms);
      if (pct > SaveManager.getMeta().bestExplorationPct) {
        SaveManager.saveMeta({ bestExplorationPct: pct });
      }
    }
  }

  public getTransitionCurtainAlpha(): number {
    let a = this.roomFadeTimer > 0 ? Math.min(1, this.roomFadeTimer / 0.24) : 0;
    if (this.pendingTransition) {
      const tr = this.pendingTransition;
      const pAlpha =
        tr.phase === 'out'
          ? 1 - Math.max(0, tr.timer / Math.max(0.01, tr.duration))
          : Math.max(0, tr.timer / Math.max(0.01, tr.duration));
      a = Math.max(a, pAlpha);
    }
    return Math.min(1, a);
  }

  public loadRoom(
    nextRoom: BuiltRoom,
    entryX: number,
    entryY: number,
    keepMomentum = false
  ): void {
    const s = this.slot;
    if (!s) return;

    const prevRegion = this.room?.region;
    this.room = nextRoom;
    this.pendingRoomStory = null;
    this.pendingRoomStoryTimer = 0;
    if (!this.pendingTransition) {
      this.roomFadeTimer = 0.24;
    }
    s.currentRoomId = nextRoom.id;
    s.currentRealm = nextRoom.realm;

    const visitKey = `${nextRoom.realm}:${nextRoom.id}`;
    if (!s.visitedRooms.includes(visitKey)) {
      s.visitedRooms.push(visitKey);
    }

    this.player.x = entryX;
    this.player.y = entryY;
    if (!keepMomentum) {
      this.player.vx = 0;
      this.player.vy = 0;
    }
    this.markCurrentMapCellVisited();
    this.camLookX = 0;
    this.camAnchorY = this.player.y;
    this.camX = this.player.x;
    this.camY =
      nextRoom.pixelH <= 520 ? nextRoom.pixelH - 210 : this.player.y - 95;

    this.enemies = [];
    this.dyingSouls = [];
    this.projectiles = [];
    this.skyStrikes = [];
    this.drops = [];
    this.slashImpacts = [];
    this.lightningArcs = [];
    this.activeSlash = null;
    this.activeSkillAnim = null;
    this.player.diveKicking = false;
    this.player.slideTimer = 0;
    this.player.dropThroughTimer = 0;
    this.player.chargeTimer = 0;
    this.player.chargeReadyChimed = false;
    this.familiar.x = entryX - this.player.facing * 32;
    this.familiar.y = entryY - 68;
    this.familiar.swoopTimer = 0;
    this.secretWallHits.clear();
    this.bellRingTimers.clear();
    this.bellCooldowns.clear();
    this.arrowTrapCycles.clear();
    this.bossFightTookDamage = false;

    // 优先预热当前房间及 1-hop 相邻房间的背景画卷、神兵护法灵与驻场妖邪贴图，确保流式加载零等待同时节省移动端显存！
    const curWpn = WEAPONS[s.equippedWeapon] || WEAPONS.sword_0;
    const prioSet = new Set<AssetKey>();
    const addKey = (k?: AssetKey) => {
      if (k) prioSet.add(k);
    };
    const queueRoomAssets = (rm: BuiltRoom) => {
      addKey(rm.bgKey as AssetKey);
      if (rm.bossKind) {
        for (const bk of resolveEnemyAssetKeys(rm.bossKind)) addKey(bk);
      }
      for (const sp of rm.spawns) {
        for (const mk of resolveEnemyAssetKeys(sp.kind)) addKey(mk);
      }
    };
    addKey(resolveWeaponAssetKey(curWpn.archetype, curWpn.id));
    if (s.equippedFamiliar) addKey(resolveFamiliarAssetKey(s.equippedFamiliar));
    queueRoomAssets(nextRoom);
    const neighborIds = new Set<string>([
      ...getRoomSideDoors(nextRoom).map((d) => d.targetRoomId),
      ...nextRoom.shafts.map((sh) => sh.targetRoomId),
    ]);
    for (const nid of neighborIds) {
      if (nid) {
        queueRoomAssets(WorldMap.getRoom(nextRoom.realm, nid));
      }
    }
    Assets.ensurePriorityKeys([...prioSet]);

    // 恶魔城经典机制：每个房间的红绸宫灯皆可挥兵击碎爆出灵符/纹银，并在跨房重进时自动复燃！
    this.liveLanterns = nextRoom.torches.map((tc, idx) => ({
      id: idx + 1,
      x: tc.x,
      y: tc.y,
      broken: false,
    }));
    this.liveCrumbleSlabs = (nextRoom.crumbleSlabs || []).map((cs) => ({
      id: cs.id,
      x: cs.x,
      y: cs.y,
      w: cs.w,
      state: 'solid',
      timer: 0,
    }));
    this.waterRipples = [];

    const bossPendingInRoom =
      Boolean(nextRoom.bossKind) &&
      !s.defeatedBosses.includes(`${nextRoom.realm}:${nextRoom.bossKind}`);

    if (!bossPendingInRoom) {
      for (const pk of nextRoom.pickups) {
        if (s.collectedPickups.includes(pk.id)) continue;
        const py = pk.y ?? sampleEntitySurfaceY(nextRoom, pk.x, 0);
        this.drops.push({
          id: pk.id,
          isStaticPickup: true,
          kind: pk.kind,
          itemId: pk.itemId,
          amount: 1,
          x: pk.x,
          y: py,
          vy: 0,
          color: pk.kind === 'weapon' ? '#f59e0b' : '#2dd4bf',
          label: this.getPickupLabel(pk.kind, pk.itemId),
        });
      }
    }

    if (s.mode === 'boss_rush' && nextRoom.id === 'boss_rush_arena') {
      this.bossRushWave = 0;
      this.spawnNextBossRushWave();
      AudioFX.setMood('boss');
      return;
    }

    for (const sp of nextRoom.spawns) {
      this.spawnEnemy(sp.kind, sp.x, sp.y ?? sampleEntitySurfaceY(nextRoom, sp.x, 0));
    }

    if (nextRoom.bossKind) {
      const bossKey = `${nextRoom.realm}:${nextRoom.bossKind}`;
      if (!s.defeatedBosses.includes(bossKey)) {
        const bossSpawnX =
          Math.abs(entryX - nextRoom.focalX) < 140
            ? Math.min(nextRoom.pixelW - 140, nextRoom.focalX + 190)
            : nextRoom.focalX;
        const bossSpawnY =
          bossSpawnX === nextRoom.focalX
            ? nextRoom.focalY
            : sampleEntitySurfaceY(nextRoom, bossSpawnX, nextRoom.focalY);
        this.spawnEnemy(nextRoom.bossKind, bossSpawnX, bossSpawnY);
      }
    }

    const ambushKey = `ambush_clear:${nextRoom.realm}:${nextRoom.id}`;
    this.ambushSealed = Boolean(
      nextRoom.ambushSeal &&
        this.enemies.length > 0 &&
        !s.brokenSecretWalls.includes(ambushKey)
    );

    // 踏入全新大关卡时弹出章节幕次名，隐藏密室弹出简短厅名
    const enteringNewStage = prevRegion !== nextRoom.region;
    if (enteringNewStage || nextRoom.isSecretRoom) {
      if (visitKey !== this.lastVisitedRegion || enteringNewStage) {
        this.lastVisitedRegion = visitKey;
        if (nextRoom.isSecretRoom) {
          this.cb.onShowBanner(nextRoom.name, '');
        } else {
          const stageTitle =
            nextRoom.realm === 'inverted'
              ? INVERTED_REGION_NAMES[nextRoom.region]
              : REGION_NAMES[nextRoom.region];
          this.cb.onShowBanner(stageTitle, nextRoom.name);
        }
      }
    }

    const hasLiveBoss = this.enemies.some((e) => e.profile.isBoss);
    this.resolveRoomBgmMood(nextRoom, hasLiveBoss);

    if (
      s.mode === 'story' &&
      nextRoom.storyTriggerId &&
      !s.triggeredStories.includes(nextRoom.storyTriggerId)
    ) {
      const scene = STORY_SCENES[nextRoom.storyTriggerId];
      if (scene) {
        s.triggeredStories.push(nextRoom.storyTriggerId);
        // 先让过门黑幕完全散去、角色自然踏入实景厅堂后再展开对白，彻底杜绝黑屏出字！
        this.pendingRoomStory = scene;
        this.pendingRoomStoryTimer = 0.32;
      }
    }
  }

  private getPickupLabel(kind: WorldDrop['kind'], itemId: string): string {
    if (kind === 'ability') return ABILITIES_META[itemId as AbilityKey]?.name || itemId;
    if (kind === 'skill_scroll') return SKILLS[itemId as SkillId]?.name || itemId;
    if (kind === 'max_up') {
      return itemId === 'hp_vessel' ? '千年朱果' : '天山雪莲';
    }
    if (kind === 'weapon') {
      if (itemId.startsWith('sub:')) {
        const subId = itemId.slice(4) as SubWeaponId;
        return SUB_WEAPONS[subId]?.name || itemId;
      }
      return WEAPONS[itemId]?.name || itemId;
    }
    if (kind === 'armor') return ARMORS[itemId]?.name || itemId;
    if (kind === 'consumable') return CONSUMABLES[itemId]?.name || itemId;
    return itemId;
  }

  /**
   * 十幕逐阶平滑区域难度曲线（配合凡铁 -> 军械 -> 名器 -> 神兵四阶装备成长）：
   * 第一幕城门(0.86x) -> 第二幕盘龙殿(1.02x) -> 第三幕炼丹司(1.16x) -> 第四幕铸剑坊(1.30x)
   * -> 第五幕九曲寒潭(1.44x) -> 第六幕九幽荒冢(1.58x) -> 第七幕藏书阁(1.72x)
   * -> 第八幕百戏梨园(1.88x) -> 第九幕望月塔(2.08x) -> 终幕祭天坛(2.30x) -> 倒悬里城(×1.40 HP / ×1.25 ATK)
   */
  private getRoomDifficultyScale(room: BuiltRoom): { hpMult: number; atkMult: number; spdMult: number } {
    let hpMult = 0.92;
    let atkMult = 0.92;
    let spdMult = 0.98;

    switch (room.region) {
      case 'gatehouse':
        hpMult = room.id === 'bamboo_outpost' || room.id === 'entrance_bamboo_woods' ? 0.85 : 0.96;
        atkMult = 0.92;
        spdMult = 0.98;
        break;
      case 'main_hall':
        hpMult = 1.22;
        atkMult = 1.15;
        spdMult = 1.02;
        break;
      case 'alchemy':
        hpMult = 1.45;
        atkMult = 1.3;
        spdMult = 1.04;
        break;
      case 'colosseum':
        hpMult = 1.85;
        atkMult = 1.54;
        spdMult = 1.07;
        break;
      case 'forge':
        hpMult = 1.72;
        atkMult = 1.46;
        spdMult = 1.06;
        break;
      case 'prison':
        hpMult = 2.0;
        atkMult = 1.62;
        spdMult = 1.07;
        break;
      case 'shipyard':
        hpMult = 2.46;
        atkMult = 1.86;
        spdMult = 1.09;
        break;
      case 'catacomb':
        hpMult = 2.3;
        atkMult = 1.78;
        spdMult = 1.08;
        break;
      case 'nether':
        hpMult = 3.55;
        atkMult = 2.42;
        spdMult = 1.13;
        break;
      case 'library':
        hpMult = 2.62;
        atkMult = 1.95;
        spdMult = 1.09;
        break;
      case 'opera':
        hpMult = 2.98;
        atkMult = 2.14;
        spdMult = 1.11;
        break;
      case 'clock_tower':
        hpMult = room.id === 'east_outer_tower' ? 2.25 : 3.38;
        atkMult = room.id === 'east_outer_tower' ? 1.75 : 2.34;
        spdMult = 1.13;
        break;
      case 'altar':
        hpMult = 3.85;
        atkMult = 2.58;
        spdMult = 1.15;
        break;
    }

    if (room.realm === 'inverted') {
      hpMult *= 1.48;
      atkMult *= 1.32;
      spdMult *= 1.08;
    }

    return { hpMult, atkMult, spdMult };
  }

  private spawnEnemy(kind: EnemyKind, x: number, y: number): void {
    const baseProf = ENEMY_PROFILES[kind];
    const scale =
      this.room && !baseProf.isBoss
        ? this.getRoomDifficultyScale(this.room)
        : this.room?.realm === 'inverted' && baseProf.kind !== 'boss_zhuyin'
          ? { hpMult: 1.45, atkMult: 1.3, spdMult: 1.08 }
          : { hpMult: 1, atkMult: 1, spdMult: 1 };

    const scaledHp = Math.round(baseProf.hp * scale.hpMult);
    const prof: EnemyProfile =
      scale.hpMult === 1
        ? baseProf
        : {
            ...baseProf,
            hp: scaledHp,
            atk: Math.round(baseProf.atk * scale.atkMult),
            speed: Math.round(baseProf.speed * scale.spdMult),
            exp: Math.round(baseProf.exp * (0.68 + scale.hpMult * 0.22)),
            gold: Math.round(baseProf.gold * (0.7 + scale.hpMult * 0.2)),
          };

    const basePoise = prof.isBoss
      ? kind === 'boss_zhuyin'
        ? 340
        : kind === 'boss_pei_wuji' ||
            kind === 'boss_furnace_titan' ||
            kind === 'boss_dragon_warden'
          ? 290
          : kind === 'boss_colosseum_general' || kind === 'boss_shipyard_leviathan'
            ? 250
            : 220
      : kind === 'bronze_guard' ||
          kind === 'armored_tortoise' ||
          kind === 'bixie_stone_beast' ||
          kind === 'jinwu_mace_guard' ||
          kind === 'magma_crucible_golem' ||
          kind === 'terracotta_halberdier' ||
          kind === 'frost_chain_jailer'
        ? 108
        : kind === 'demon_wolf' ||
            kind === 'bell_gargoyle' ||
            kind === 'guixu_water_fiend' ||
            kind === 'wuchang_reaper' ||
            kind === 'celestial_sentinel' ||
            kind === 'clockwork_mantis' ||
            kind === 'ink_brush_scholar'
          ? 82
          : kind === 'plague_toad' ||
              kind === 'opera_puppet' ||
              kind === 'bone_archer' ||
              kind === 'shenji_musketeer' ||
              kind === 'taoist_talisman_priest' ||
              kind === 'opera_sleeve_siren' ||
              kind === 'drowned_corpse_bride' ||
              kind === 'mine_pickaxe_ghoul'
            ? 60
            : kind === 'spirit_crow' ||
                kind === 'alchemy_homunculus' ||
                kind === 'bronze_gear_wisp'
              ? 34
              : 42;
    const maxPoise = prof.isBoss
      ? basePoise
      : Math.round(basePoise * (0.85 + scale.hpMult * 0.34));

    const groundRefY = this.room ? sampleSolidGroundY(this.room, x) : 400;
    const isNearGround = groundRefY - y < 48;
    const initY =
      kind === 'spirit_crow'
        ? isNearGround
          ? Math.max(150, y - 120)
          : Math.max(155, y)
        : prof.flying
          ? isNearGround
            ? Math.max(150, y - 92)
            : Math.max(155, y)
          : y;

    this.enemies.push({
      id: this.nextEntityId++,
      profile: prof,
      x,
      y: initY,
      baseY: initY,
      vx: 0,
      vy: 0,
      facing: -1,
      hp: prof.hp,
      hpTrail: prof.hp,
      maxHp: prof.hp,
      poise: maxPoise,
      maxPoise,
      poiseRegenDelay: 0,
      guardStanceTimer: 0,
      aiState: 'stalk',
      stateTimer: 0.45 + Math.random() * 0.45,
      animPhase: Math.random() * 6,
      hurtFlash: 0,
      hurtJoltTimer: 0,
      burrowEmergeTimer: 0,
      burrowTriggered: false,
      roosting: kind === 'spirit_crow',
      bossMoveIdx: 0,
      slashHitPlayer: false,
    });
  }

  public hasAbility(key: AbilityKey): boolean {
    return Boolean(this.slot?.abilities.includes(key));
  }

  public getOwnedFamiliars(): FamiliarId[] {
    return ALL_FAMILIAR_IDS.filter((k) => this.hasAbility(k));
  }

  public getActiveFamiliar(): FamiliarId | null {
    if (!this.slot) return null;
    const owned = this.getOwnedFamiliars();
    if (owned.length === 0) return null;
    if (this.slot.equippedFamiliar && owned.includes(this.slot.equippedFamiliar)) {
      return this.slot.equippedFamiliar;
    }
    this.slot.equippedFamiliar = owned[0];
    return owned[0];
  }

  public getFamiliarExp(id: FamiliarId): number {
    if (!this.slot) return 0;
    return (
      this.slot.familiarExps?.[id] ??
      (id === 'familiar_sword' ? this.slot.familiarExp || 0 : 0)
    );
  }

  public getFamiliarLevel(id: FamiliarId): number {
    return 1 + Math.min(8, Math.floor(this.getFamiliarExp(id) / 110));
  }

  public equipFamiliar(id: FamiliarId): void {
    if (!this.slot || !this.hasAbility(id)) return;
    this.slot.equippedFamiliar = id;
    this.familiar.cooldown = 0.35;
    this.familiar.swoopTimer = 0;
    if (id === 'familiar_tortoise' && this.tortoiseShieldTimer <= 0) {
      this.tortoiseShieldReady = true;
    }
    const def = FAMILIARS[id];
    AudioFX.playRelicBell();
    this.spawnInkBurst(
      this.player.x - this.player.facing * 26,
      this.player.y - 66,
      def.color,
      '#090d16',
      14
    );
    this.skillBanner = { name: `唤灵 · ${def.name}`, timer: 1.05, color: def.color };
  }

  public cycleActiveFamiliar(): void {
    const owned = this.getOwnedFamiliars();
    if (owned.length <= 1) return;
    const cur = this.getActiveFamiliar() || owned[0];
    const next = owned[(owned.indexOf(cur) + 1) % owned.length];
    this.equipFamiliar(next);
  }

  public grantAbility(key: AbilityKey): void {
    if (!this.slot) return;
    if (!this.slot.abilities.includes(key)) {
      this.slot.abilities.push(key);
    }
    if (ALL_FAMILIAR_IDS.includes(key as FamiliarId)) {
      this.slot.equippedFamiliar = key as FamiliarId;
      if (key === 'familiar_tortoise') {
        this.tortoiseShieldReady = true;
        this.tortoiseShieldTimer = 0;
      }
    }
    AudioFX.playRelicBell();
    NativeApp.haptic('heavy');
    const meta = ABILITIES_META[key];
    this.cb.onShowBanner(`习得神通 · ${meta.name}`, meta.subtitle);
  }

  public update(rawDt: number): void {
    this.input.pollGamepad();
    this.input.fadeTrails(rawDt);

    if (this.input.consumeMapToggle()) {
      this.cb.onToggleMap();
      return;
    }
    if (this.input.consumePauseToggle()) {
      this.cb.onTogglePause();
      return;
    }

    if (!this.slot || !this.room || this.paused || this.landscapePaused) {
      return;
    }

    const baseDt = Math.min(0.033, rawDt);
    if (this.bossKillSlowTimer > 0) {
      this.bossKillSlowTimer = Math.max(0, this.bossKillSlowTimer - baseDt);
    }
    if (this.parryZoomTimer > 0) {
      this.parryZoomTimer = Math.max(0, this.parryZoomTimer - baseDt);
    }
    const dt = this.bossKillSlowTimer > 0 ? baseDt * 0.16 : baseDt;

    // 即使在剧情对白或界面打开时，也必须推进过门揭幕，绝不让黑幕卡死在 100% 遮住实景画面！
    if (this.roomFadeTimer > 0) {
      this.roomFadeTimer = Math.max(0, this.roomFadeTimer - dt);
    }
    if (this.pendingTransition && this.pendingTransition.phase === 'in') {
      this.pendingTransition.timer -= dt;
      if (this.pendingTransition.timer <= 0) {
        this.pendingTransition = null;
      }
    }

    if (this.input.uiBlocked) {
      // 实景剧情演出态：保持背景宫灯火光、落叶粒子与人物呼吸轻柔律动，并平滑构图同框对视！
      if (this.storyDialogueActive) {
        this.player.animTime += dt * 0.85;
        this.player.vx = 0;
        const bossFocus = this.enemies.find((e) => e.profile.isBoss);
        const npcFocus = this.room.npcs[0];
        const partnerX = bossFocus ? bossFocus.x : npcFocus ? npcFocus.x : this.player.x;
        if (Math.abs(partnerX - this.player.x) > 18) {
          this.player.facing = partnerX >= this.player.x ? 1 : -1;
        }
        const midX =
          this.player.x + Math.max(-150, Math.min(150, (partnerX - this.player.x) * 0.42));
        this.camX += (midX - this.camX) * (1 - Math.pow(0.02, dt));
        this.updateParticles(dt * 0.6);
      }
      return;
    }

    if (this.introWalkInTimer > 0) {
      this.introWalkInTimer = Math.max(0, this.introWalkInTimer - dt);
      this.player.facing = 1;
      this.player.vx = 148;
      this.player.runCycle += dt * 10.5;
      this.player.animTime += dt;
      this.moveAndCollideTerrain(dt);
      this.updateActiveFamiliar(dt);
      this.updateCamera(dt);
      this.updateParticles(dt);
      if (this.introWalkInTimer <= 0) {
        this.player.vx = 0;
      }
      return;
    }

    if (this.pendingRoomStory) {
      this.pendingRoomStoryTimer -= dt;
      const bossFocus = this.enemies.find((e) => e.profile.isBoss);
      const npcFocus = this.room.npcs[0];
      const partnerX = bossFocus ? bossFocus.x : npcFocus ? npcFocus.x : this.room.focalX;
      const walkDir: 1 | -1 = partnerX >= this.player.x ? 1 : -1;
      this.player.facing = walkDir;
      if (Math.abs(partnerX - this.player.x) > 135) {
        this.player.vx = walkDir * 135;
        this.player.runCycle += dt * 9.5;
        this.moveAndCollideTerrain(dt);
      } else {
        this.player.vx = 0;
      }
      this.player.animTime += dt;
      this.updateActiveFamiliar(dt);
      this.updateCamera(dt);
      this.updateParticles(dt);
      if (this.pendingRoomStoryTimer <= 0 && this.getTransitionCurtainAlpha() <= 0.02) {
        const sc = this.pendingRoomStory;
        this.pendingRoomStory = null;
        this.player.vx = 0;
        this.cb.onStartStory(sc);
      }
      return;
    }

    this.slot.playTimeSec += dt;

    // 平滑延迟残血烧灼槽 (Sekiro / 斩妖行 打击反馈核心细节)
    if (this.player.hpTrail > this.player.hp) {
      this.player.hpTrail = Math.max(this.player.hp, this.player.hpTrail - 48 * dt);
    } else {
      this.player.hpTrail = this.player.hp;
    }

    if (this.pendingTransition) {
      const tr = this.pendingTransition;
      if (tr.phase === 'out') {
        tr.timer -= dt;
        this.player.x += tr.walkVx * dt;
        this.player.y += tr.walkVy * dt;
        if (Math.abs(tr.walkVx) > 10) {
          this.player.runCycle += dt * 11;
        }
        if (tr.timer <= 0) {
          this.loadRoom(tr.nextRoom, tr.nextX, tr.nextY, true);
          if (tr.postVy !== undefined) {
            this.player.vy = tr.postVy;
            this.player.onGround = false;
          }
          tr.phase = 'in';
          tr.timer = 0.24;
          tr.duration = 0.24;
        } else {
          this.updateParticles(dt);
          return;
        }
      }
    }
    if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt * 28);
    if (this.taijiFlashTimer > 0) this.taijiFlashTimer = Math.max(0, this.taijiFlashTimer - dt);
    if (this.perfectDodgeBuffTimer > 0) {
      this.perfectDodgeBuffTimer = Math.max(0, this.perfectDodgeBuffTimer - dt);
      if (Math.random() < dt * 16) {
        this.particles.push({
          kind: 'spark',
          x: this.player.x + (Math.random() - 0.5) * 34,
          y: this.player.y - 12 - Math.random() * 48,
          vx: (Math.random() - 0.5) * 24,
          vy: -36 - Math.random() * 34,
          size: 2.3,
          color: Math.random() < 0.5 ? '#2dd4bf' : '#fde047',
          life: 0.25,
          maxLife: 0.25,
        });
      }
    }
    if (this.perfectDodgeFlashTimer > 0) {
      this.perfectDodgeFlashTimer = Math.max(0, this.perfectDodgeFlashTimer - dt);
    }
    if (this.perfectDodgeCooldown > 0) {
      this.perfectDodgeCooldown = Math.max(0, this.perfectDodgeCooldown - dt);
    }
    for (const [bIdx, rem] of this.bellRingTimers) {
      const next = rem - dt;
      if (next <= 0) this.bellRingTimers.delete(bIdx);
      else this.bellRingTimers.set(bIdx, next);
    }
    for (const [bIdx, rem] of this.bellCooldowns) {
      const next = rem - dt;
      if (next <= 0) this.bellCooldowns.delete(bIdx);
      else this.bellCooldowns.set(bIdx, next);
    }
    if (this.secretWallDustTimer > 0) {
      this.secretWallDustTimer -= dt;
    } else if (this.room && this.slot) {
      this.secretWallDustTimer = 0.44;
      const p = this.player;
      if (this.room.secretWalls) {
        for (const sw of this.room.secretWalls) {
          if (this.slot.brokenSecretWalls.includes(sw.id)) continue;
          if (Math.hypot(sw.x + sw.w * 0.5 - p.x, sw.y + sw.h * 0.5 - (p.y - 36)) < 175) {
            this.particles.push({
              kind: 'ink',
              x: sw.x + Math.random() * sw.w,
              y: sw.y + 8 + Math.random() * (sw.h * 0.6),
              vx: (Math.random() - 0.5) * 14,
              vy: 18 + Math.random() * 24,
              size: 1.9,
              color: '#fde047',
              life: 0.36,
              maxLife: 0.36,
            });
          }
        }
      }
      for (const sd of getRoomSideDoors(this.room)) {
        if (!sd.secretWallId || this.slot.brokenSecretWalls.includes(sd.secretWallId)) continue;
        const dx = sd.side === 'left' ? 18 : this.room.pixelW - 18;
        const dy = sd.floorY - 56;
        if (Math.hypot(dx - p.x, dy - (p.y - 36)) < 185) {
          this.particles.push({
            kind: 'ink',
            x: dx + (Math.random() - 0.5) * 16,
            y: dy + (Math.random() - 0.5) * 44,
            vx: (Math.random() - 0.5) * 16,
            vy: 20 + Math.random() * 24,
            size: 2.1,
            color: '#fde047',
            life: 0.38,
            maxLife: 0.38,
          });
        }
      }
    }
    if (this.soulStealFlashTimer > 0) {
      this.soulStealFlashTimer = Math.max(0, this.soulStealFlashTimer - dt);
    }
    if (this.levelUpPillarTimer > 0) {
      this.levelUpPillarTimer = Math.max(0, this.levelUpPillarTimer - dt);
    }
    if (this.grappleLineTimer > 0) {
      this.grappleLineTimer = Math.max(0, this.grappleLineTimer - dt);
      if (this.grappleLineTimer <= 0) this.grappleTarget = null;
    }
    if (this.skillBanner) {
      this.skillBanner.timer -= dt;
      if (this.skillBanner.timer <= 0) this.skillBanner = null;
    }
    if (this.activeSkillAnim) {
      this.activeSkillAnim.progress += dt / Math.max(0.05, this.activeSkillAnim.duration);
      if (this.activeSkillAnim.progress >= 1) {
        this.activeSkillAnim = null;
      }
    }

    // 战术丹酒增益倒计时（烈酒增攻 / 金刚减伤 / 疾风暴击，到期自动刷新武道面板！）
    let buffExpired = false;
    for (const bk of ['berserk_wine', 'iron_skin', 'wind_crit'] as CombatBuffKind[]) {
      if (this.activeBuffs[bk] > 0) {
        this.activeBuffs[bk] = Math.max(0, this.activeBuffs[bk] - dt);
        if (this.activeBuffs[bk] <= 0) buffExpired = true;
      }
    }
    if (buffExpired) {
      this.recalcStats(false);
    }

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.updateParticles(dt);
      return;
    }

    // 大幅压缩纯挂机自然回蓝，强化“以战养气”（必须主动近身挥兵命中妖邪积攒真气，杜绝站桩无限放波！）
    const core = this.slot.equippedYaoCore ? YAO_CORES[this.slot.equippedYaoCore] : undefined;
    const mpRegen = 0.32 + this.player.int * 0.025 + (core?.mpRegenBonus || 0) * 0.45;
    this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpRegen * dt);

    this.updatePlayer(dt);
    this.updateActiveFamiliar(dt);
    this.markCurrentMapCellVisited();
    this.updateCamera(dt);
    this.updateActiveSlash(dt);
    this.updateOrbitSwords(dt);
    this.updateProjectiles(dt);
    this.updateSkyStrikes(dt);
    this.updateRoomHazardsAndSlabs(dt);
    this.updateEnemies(dt);
    if (this.ambushSealed && this.enemies.length === 0 && this.room && this.slot) {
      this.ambushSealed = false;
      const ambushKey = `ambush_clear:${this.room.realm}:${this.room.id}`;
      if (!this.slot.brokenSecretWalls.includes(ambushKey)) {
        this.slot.brokenSecretWalls.push(ambushKey);
        AudioFX.playRelicBell();
        this.drops.push({
          id: `ambush_prize_${this.nextEntityId++}`,
          isStaticPickup: false,
          kind: 'consumable',
          itemId: 'osmanthus_wine',
          amount: 1,
          x: this.player.x,
          y: this.player.y - 24,
          vy: -240,
          color: '#4ade80',
          label: CONSUMABLES.osmanthus_wine.name,
        });
        this.slot.gold += 65;
      }
    }
    this.updateDrops(dt);
    this.updateParticles(dt);
    this.checkRoomTransition();
    this.updateNearbyInteract();
  }

  private updateCamera(dt: number): void {
    const p = this.player;
    const room = this.room;

    // 1. 横向防眩晕平滑跟随：告别原地转身 110px 甩镜头！仅在持续奔跑时轻柔前瞻，带 16px 静止死区
    const desiredLookX = Math.abs(p.vx) > 90 ? Math.max(-24, Math.min(24, p.vx * 0.08)) : 0;
    this.camLookX += (desiredLookX - this.camLookX) * (1 - Math.pow(0.04, dt));

    const focusX = p.x + this.camLookX;
    let targetX = this.camX;
    if (focusX > this.camX + 16) targetX = focusX - 16;
    else if (focusX < this.camX - 16) targetX = focusX + 16;

    const smoothX = 1 - Math.pow(0.004, dt);
    this.camX += (targetX - this.camX) * smoothX;

    // 2. 纵向《月下》平台锚定防抖：单层厅堂地面跳跃镜头稳如泰山，仅登高台或竖塔跨层时柔和升降！
    if (p.onGround) {
      this.camAnchorY = p.y;
    } else if (p.y > this.camAnchorY + 55) {
      this.camAnchorY = p.y - 55;
    } else if (p.y < this.camAnchorY - 135) {
      this.camAnchorY = p.y + 135;
    }

    let targetY = this.camAnchorY - 96;
    if (room && room.pixelH <= 520 && this.camAnchorY > 235) {
      targetY = room.pixelH - 208;
    }
    const smoothY = 1 - Math.pow(0.012, dt);
    this.camY += (targetY - this.camY) * smoothY;
  }

  private updatePlayer(dt: number): void {
    const p = this.player;
    const inp = this.input;
    p.animTime += dt;

    if (p.invulnTimer > 0) p.invulnTimer -= dt;
    if (p.hurtBlinkTimer > 0) p.hurtBlinkTimer = Math.max(0, p.hurtBlinkTimer - dt);
    if (p.attackCooldown > 0) p.attackCooldown -= dt;
    if (p.skillCooldown > 0) p.skillCooldown = Math.max(0, p.skillCooldown - dt);
    if (p.subWeaponCooldown > 0) p.subWeaponCooldown = Math.max(0, p.subWeaponCooldown - dt);
    if (p.potionCooldown > 0) p.potionCooldown = Math.max(0, p.potionCooldown - dt);
    if (p.dashCooldown > 0) p.dashCooldown = Math.max(0, p.dashCooldown - dt);
    if (p.doubleJumpSpinTimer > 0) p.doubleJumpSpinTimer = Math.max(0, p.doubleJumpSpinTimer - dt);
    if (p.landSquash > 0) p.landSquash = Math.max(0, p.landSquash - dt * 5);
    if (p.comboResetTimer > 0) {
      p.comboResetTimer -= dt;
      if (p.comboResetTimer <= 0) p.comboStep = 0;
    }
    if (p.dropThroughTimer > 0) p.dropThroughTimer -= dt;

    // 《恶魔城》核心受击后仰硬直（Hurt Stun）：受创瞬间锁定操作并向后抛退滑步，杜绝顶着伤害无反应滑行！
    if (p.hurtStunTimer > 0) {
      p.hurtStunTimer = Math.max(0, p.hurtStunTimer - dt);
      if (p.onGround) {
        p.vx *= Math.pow(0.015, dt);
      }
      p.vy = Math.min(880, p.vy + 1580 * dt);
      this.moveAndCollideTerrain(dt);
      return;
    }

    if (inp.consumeWeaponSwap()) {
      this.cycleWeapon();
    }
    if (inp.consumeFamiliarSwap()) {
      this.cycleActiveFamiliar();
    }
    if (inp.consumePotion()) {
      this.useQuickHealPotion();
    }
    if (inp.consumeInteract() && this.nearbyInteract) {
      this.executeInteract(this.nearbyInteract.kind);
      return;
    }

    // 疾退残影步 / 缩地化雾（加入调息冷却与空中单次限制，防止无限悬空飞渡或无限无敌帧！）
    if (inp.consumeDash()) {
      if (
        this.hasAbility('mist_dash') &&
        p.mistDashTimer <= 0 &&
        p.dashCooldown <= 0 &&
        (p.onGround || !p.airDashUsed)
      ) {
        if (!p.onGround) p.airDashUsed = true;
        p.mistDashTimer = 0.22;
        p.dashCooldown = 0.75;
        p.invulnTimer = Math.max(p.invulnTimer, 0.24);
        const dir = inp.moveX !== 0 ? (Math.sign(inp.moveX) as 1 | -1) : p.facing;
        p.facing = dir;
        p.vx = dir * 520;
        p.vy = 0;
        AudioFX.playJump();
        NativeApp.haptic('light');
        this.spawnInkBurst(p.x, p.y - 36, '#a855f7', '#090d16', 14);
      } else if (p.backdashTimer <= 0 && p.dashCooldown <= 0 && p.onGround) {
        p.backdashTimer = 0.2;
        p.dashCooldown = 0.48;
        p.invulnTimer = Math.max(p.invulnTimer, 0.14);
        p.attackCooldown = 0;
        this.activeSlash = null;
        p.vx = -p.facing * 430;
        AudioFX.playJump();
        this.spawnInkBurst(p.x, p.y - 8, '#94a3b8', '#0f172a', 6);
      }
    }

    if (inp.consumeSubWeapon()) {
      this.castSubWeapon();
    }

    // 移动端 RT 绝技键 / 键盘 O,R 键：一键施放战术真气武学（空中自动衔接朔风剑气，瞬影/升龙严格限制地面立足施展！）
    if (inp.consumeQuickSkill()) {
      if (inp.moveX !== 0) {
        p.facing = Math.sign(inp.moveX) as 1 | -1;
      }
      let targetSkill: SkillId = 'shuofeng_wave';
      if (inp.moveY < -0.45) {
        targetSkill = p.onGround ? 'jinghong_rising' : 'shuofeng_wave';
      } else if (inp.moveY > 0.45) {
        if (
          Math.abs(inp.moveX) > 0.35 &&
          this.slot!.learnedSkills.includes('jiuyou_soulsteal') &&
          p.mp >= SKILLS.jiuyou_soulsteal.mpCost
        ) {
          targetSkill = 'jiuyou_soulsteal';
        } else {
          targetSkill = 'taiji_parry';
        }
      } else if (Math.abs(inp.moveX) > 0.35) {
        targetSkill = p.onGround ? 'shunying_flash' : 'shuofeng_wave';
      }
      this.tryCastMartialSkill(targetSkill);
    }

    // 跳跃、下穿木阁楼与踏云步二段空翻
    if (inp.consumeJump()) {
      p.jumpBuffer = 0.13;
    } else if (p.jumpBuffer > 0) {
      p.jumpBuffer -= dt;
    }

    if (p.onGround) {
      p.coyoteTimer = 0.11;
      p.airJumpsLeft = this.hasAbility('double_jump') ? 1 : 0;
      p.airDashUsed = false;
    } else if (p.coyoteTimer > 0) {
      p.coyoteTimer -= dt;
    }

    if (p.jumpBuffer > 0) {
      if (p.onGround && inp.moveY > 0.5 && this.isOnPavilionDeck()) {
        p.dropThroughTimer = 0.24;
        p.onGround = false;
        p.coyoteTimer = 0;
        p.jumpBuffer = 0;
        p.y += 6;
      } else if (p.onGround && inp.moveY > 0.5 && p.slideTimer <= 0) {
        // 致敬《月下夜想曲》阿鲁卡多标志性体术一：【贴地滑铲踢 (`↓ + 跃`)】！
        p.slideTimer = 0.28;
        p.crouching = false;
        p.jumpBuffer = 0;
        p.invulnTimer = Math.max(p.invulnTimer, 0.16);
        p.vx = p.facing * 435;
        this.kickHitIds.clear();
        AudioFX.playJump();
        this.spawnInkBurst(p.x - p.facing * 12, p.y, '#cbd5e1', '#0f172a', 8);
      } else if (p.coyoteTimer > 0) {
        p.vy = -610;
        p.onGround = false;
        p.coyoteTimer = 0;
        p.jumpBuffer = 0;
        AudioFX.playJump();
        this.spawnInkBurst(p.x, p.y, '#cbd5e1', '#1e293b', 6);
      } else if (!p.onGround && p.onWall !== 0 && this.hasAbility('wall_jump')) {
        const kickDir = (-p.onWall) as 1 | -1;
        p.facing = kickDir;
        p.vx = kickDir * 335;
        p.vy = -610;
        p.onWall = 0;
        p.diveKicking = false;
        p.groundSlamming = false;
        p.jumpBuffer = 0;
        AudioFX.playJump();
        this.spawnInkBurst(p.x - kickDir * 14, p.y - 24, '#fde047', '#1e293b', 10);
      } else if (p.airJumpsLeft > 0) {
        p.airJumpsLeft--;
        p.vy = -590;
        p.doubleJumpSpinTimer = 0.34;
        p.diveKicking = false;
        p.groundSlamming = false;
        p.jumpBuffer = 0;
        AudioFX.playJump();
        this.spawnInkBurst(p.x, p.y - 18, '#2dd4bf', '#0f172a', 12);
      } else if (!p.onGround && this.hasAbility('grapple_hook') && this.tryGrappleOverheadLantern()) {
        p.jumpBuffer = 0;
      } else if (
        !p.onGround &&
        inp.moveY > 0.5 &&
        (this.hasAbility('double_jump') || this.hasAbility('ground_slam')) &&
        !p.diveKicking
      ) {
        // 致敬《月下夜想曲》阿鲁卡多体术：【凌空斜踢 (`↘/↙ + 跃`)】与【千斤直坠 (`↓ + 跃`)】！
        p.diveKicking = true;
        p.jumpBuffer = 0;
        if (this.hasAbility('ground_slam') && Math.abs(inp.moveX) < 0.35) {
          p.groundSlamming = true;
          p.vx = 0;
          p.vy = 740;
        } else {
          p.groundSlamming = false;
          if (inp.moveX !== 0) p.facing = Math.sign(inp.moveX) as 1 | -1;
          p.vx = p.facing * 395;
          p.vy = 560;
        }
        this.kickHitIds.clear();
        AudioFX.playSlash(p.groundSlamming ? 'heavy' : 'spear');
      }
    }

    if (!inp.jumpHeld && p.vy < -220 && !p.diveKicking) {
      p.vy *= 0.62;
    }

    // 地面按住 ↓ 进入低姿下蹲（可躲避书妖符弹与高处横斩，按斩使出低身刺剑！）
    p.crouching = p.onGround && inp.moveY > 0.55 && p.slideTimer <= 0 && !this.isOnPavilionDeck();

    // 攻击、重刃长按蓄力【霸王破甲重劈】、靠近人物/古祠/法阵按【斩】交互，以及【↑ + 斩】奇门副器与手搓绝学
    const eqWpnNow = WEAPONS[this.slot!.equippedWeapon] || WEAPONS.sword_0;
    if (
      eqWpnNow.archetype === 'greatsword' &&
      inp.attackHeld &&
      !this.activeSlash &&
      p.hurtStunTimer <= 0 &&
      p.mistDashTimer <= 0
    ) {
      p.chargeTimer = Math.min(1.2, p.chargeTimer + dt);
      if (p.chargeTimer >= 0.22 && Math.random() < 0.55) {
        this.particles.push({
          x: p.x + (Math.random() - 0.5) * 44,
          y: p.y - 8 - Math.random() * 42,
          vx: (p.x - (p.x + (Math.random() - 0.5) * 44)) * 2.5,
          vy: -65 - Math.random() * 55,
          size: p.chargeTimer >= 0.46 ? 3.6 : 2.4,
          color: p.chargeTimer >= 0.46 ? '#fde047' : '#fb923c',
          life: 0.24,
          maxLife: 0.24,
          kind: 'spark',
        });
      }
      if (p.chargeTimer >= 0.46 && !p.chargeReadyChimed) {
        p.chargeReadyChimed = true;
        AudioFX.playParryClang();
        this.spawnInkBurst(p.x, p.y - 38, '#fde047', '#dc2626', 12);
      }
    } else if (!inp.attackHeld && p.chargeTimer >= 0.46 && eqWpnNow.archetype === 'greatsword') {
      p.chargeTimer = 0;
      p.chargeReadyChimed = false;
      this.performWeaponAttack(true);
    } else if (!inp.attackHeld) {
      p.chargeTimer = 0;
      p.chargeReadyChimed = false;
    }

    if (inp.consumeAttack()) {
      if (this.canAttackTriggerInteract() && this.nearbyInteract) {
        this.executeInteract(this.nearbyInteract.kind);
        return;
      }
      const motionSkill = inp.consumeMotionSkill(p.facing);
      const subDef = SUB_WEAPONS[this.slot!.equippedSubWeapon] || SUB_WEAPONS.dagger_throw;
      if (motionSkill && this.tryCastMartialSkill(motionSkill)) {
        // 手搓绝技触发
      } else if (
        inp.moveY < -0.6 &&
        Math.abs(inp.moveX) < 0.25 &&
        this.slot!.talismanHearts >= subDef.talismanCost
      ) {
        this.castSubWeapon();
      } else if (p.attackCooldown <= 0) {
        this.performWeaponAttack(false);
      }
    }

    // 水平加速度与阿鲁卡多标志性蓝紫流光残影推进
    if (p.mistDashTimer > 0) {
      p.mistDashTimer -= dt;
      if (Math.random() < 0.75) {
        this.afterImages.push({ x: p.x, y: p.y, facing: p.facing, color: '#a855f7', alpha: 0.68 });
      }
    } else if (p.slideTimer > 0) {
      p.slideTimer -= dt;
      p.vx *= Math.pow(0.25, dt);
      this.shatterLanternsAndWallsInBox(p.x - 28, p.y - 36, 56, 38, false, 0);
      for (const e of [...this.enemies]) {
        if (this.kickHitIds.has(e.id)) continue;
        if (Math.abs(e.x - p.x) < e.profile.w * 0.6 + 26 && Math.abs(e.y - p.y) < 42) {
          this.kickHitIds.add(e.id);
          this.applyDamageToEnemy(e, Math.round(p.atk * 0.88), false, 24);
        }
      }
    } else if (p.diveKicking) {
      if (p.groundSlamming) {
        p.vx = 0;
        p.vy = 740;
      } else {
        p.vx = p.facing * 395;
        p.vy = 560;
      }
      this.shatterLanternsAndWallsInBox(p.x - 24, p.y - 32, 48, 42, false, 0);
      for (const e of [...this.enemies]) {
        if (this.kickHitIds.has(e.id)) continue;
        if (
          Math.abs(e.x - p.x) < e.profile.w * 0.65 + 22 &&
          p.y >= e.y - e.profile.h * 1.25 &&
          p.y - 38 <= e.y
        ) {
          this.kickHitIds.add(e.id);
          this.applyDamageToEnemy(e, Math.round(p.atk * 1.15), true, 35);
          if (!p.groundSlamming) {
            p.diveKicking = false;
            p.vy = -520;
            p.vx = -p.facing * 140;
            AudioFX.playJump();
            break;
          }
        }
      }
    } else if (p.backdashTimer > 0) {
      p.backdashTimer -= dt;
      p.vx *= 0.88;
      if (Math.random() < 0.72) {
        this.afterImages.push({ x: p.x, y: p.y, facing: p.facing, color: '#38bdf8', alpha: 0.58 });
      }
    } else if (p.crouching) {
      p.vx *= Math.pow(0.0005, dt);
      if (inp.moveX !== 0 && !this.activeSlash) p.facing = Math.sign(inp.moveX) as 1 | -1;
    } else if (
      this.activeSlash &&
      p.onGround &&
      this.activeSlash.progress < 0.78 &&
      WEAPONS[this.slot!.equippedWeapon]?.specialEffect !== 'multi_phantom'
    ) {
      // 地面挥兵扎马驻足感（消除边滑冰边挥空气的飘浮感，跳劈则保持空中灵动惯性！）
      p.vx *= Math.pow(0.0025, dt);
    } else {
      if (inp.moveX !== 0) {
        const wantDir = Math.sign(inp.moveX) as 1 | -1;
        // 急停反折转身：触发真实重心下沉蹬地尘烟！
        if (p.onGround && Math.abs(p.vx) > 210 && Math.sign(p.vx) !== wantDir) {
          p.landSquash = Math.max(p.landSquash, 0.42);
          p.sprintTimer = 0;
          this.spawnInkBurst(p.x, p.y - 4, '#94a3b8', '#1e293b', 5);
        }
        if (!this.activeSlash) p.facing = wantDir;
        p.sprintTimer = Math.min(1.0, p.sprintTimer + dt);

        // 持续奔跑 0.22s 自动提气进入【轻功疾奔 Sprint】态，配合 Spine 骨骼前倾与飘带飞扬！
        const sprintBoost = p.sprintTimer > 0.22 ? 1.15 : 1.0;
        const targetVx = inp.moveX * 274 * p.speedMult * sprintBoost;
        const accelRate = p.onGround ? 18 : 11;
        p.vx += (targetVx - p.vx) * Math.min(1, dt * accelRate);

        if (p.onGround) {
          const prevStep = Math.floor(p.runCycle * 0.5);
          p.runCycle += dt * 13.8 * p.speedMult * sprintBoost;
          if (Math.floor(p.runCycle * 0.5) !== prevStep) {
            const waterY = this.getShallowWaterSurfaceAt(p.x, p.y);
            if (waterY !== null) {
              this.spawnWaterSplash(p.x, waterY, 4, 0.75);
            } else if (p.sprintTimer > 0.22) {
              this.particles.push({
                kind: 'ink',
                x: p.x - p.facing * 10,
                y: p.y - 2,
                vx: -p.facing * (45 + Math.random() * 35),
                vy: -18 - Math.random() * 24,
                size: 2.8,
                color: 'rgba(148, 163, 184, 0.55)',
                life: 0.24,
                maxLife: 0.24,
              });
            }
          }
        }
      } else {
        p.sprintTimer = 0;
        p.vx *= Math.pow(0.0006, dt);
        if (Math.abs(p.vx) < 8) p.vx = 0;
      }
    }

    // 致敬《恶魔城：月下夜想曲》阿鲁卡多招牌蓝青靛紫残影轨迹！
    p.trailSpawnTimer -= dt;
    const fastMotion =
      !p.onGround || p.slideTimer > 0 || p.diveKicking || Math.abs(p.vx) > 295;
    if (fastMotion && p.trailSpawnTimer <= 0 && p.mistDashTimer <= 0) {
      p.trailSpawnTimer = p.slideTimer > 0 || p.diveKicking ? 0.036 : 0.055;
      const palette = ['#38bdf8', '#6366f1', '#2dd4bf'];
      const col = palette[Math.floor(p.animTime * 18) % palette.length];
      this.afterImages.push({ x: p.x, y: p.y, facing: p.facing, color: col, alpha: 0.48 });
    }

    if (p.mistDashTimer <= 0 && !p.diveKicking) {
      p.vy = Math.min(880, p.vy + 1580 * dt);
    }

    this.moveAndCollideTerrain(dt);
  }

  private openLeverGate(gateId: string, gx: number, bottomY: number): void {
    if (!this.slot || this.slot.brokenSecretWalls.includes(gateId)) return;
    this.slot.brokenSecretWalls.push(gateId);
    AudioFX.playRelicBell();
    AudioFX.playParryClang();
    this.screenShake = Math.max(this.screenShake, 7.5);
    NativeApp.haptic('heavy');
    this.spawnInkBurst(gx, bottomY - 64, '#fbbf24', '#090d16', 24);
    this.skillBanner = { name: '枢机扳动 · 捷径铁闸已开', timer: 1.35, color: '#fbbf24' };
  }

  private updateActiveFamiliar(dt: number): void {
    const activeFam = this.getActiveFamiliar();
    if (!this.slot || !this.room || !activeFam) return;
    const p = this.player;
    const fam = this.familiar;
    const famLv = this.getFamiliarLevel(activeFam);

    if (fam.calloutTimer > 0) fam.calloutTimer -= dt;
    if (fam.cooldown > 0) fam.cooldown -= dt;

    if (!this.tortoiseShieldReady && this.tortoiseShieldTimer > 0) {
      this.tortoiseShieldTimer -= dt;
      if (this.tortoiseShieldTimer <= 0) {
        this.tortoiseShieldReady = true;
        if (activeFam === 'familiar_tortoise') {
          this.spawnInkBurst(p.x, p.y - 38, '#22d3ee', '#0f172a', 8);
        }
      }
    }

    // 1. 环环相扣五灵共鸣锁：携对应护法灵踏近石柱封印时，护法灵主动飞掠破印开路！
    const gate = this.room.ironGate;
    if (gate && !this.slot.brokenSecretWalls.includes(gate.id)) {
      const gk = gate.gateKind;
      const matched =
        (gk === 'ice_phoenix' && activeFam === 'familiar_phoenix') ||
        (gk === 'sluice_tortoise' && activeFam === 'familiar_tortoise') ||
        (gk === 'gear_kestrel' && activeFam === 'familiar_kestrel') ||
        (gk === 'illusion_fox' && activeFam === 'familiar_fox');
      if (
        matched &&
        Math.abs(p.x - gate.x) < 185 &&
        p.y > gate.topY - 24 &&
        p.y - p.h < gate.bottomY + 24
      ) {
        this.slot.brokenSecretWalls.push(gate.id);
        fam.swoopTimer = 0.52;
        fam.targetX = gate.x;
        fam.targetY = (gate.topY + gate.bottomY) * 0.52;
        fam.facing = gate.x >= p.x ? 1 : -1;
        const fDef = FAMILIARS[activeFam];
        AudioFX.playRelicBell();
        AudioFX.playParryClang();
        this.screenShake = Math.max(this.screenShake, 7.5);
        NativeApp.haptic('heavy');
        this.spawnInkBurst(gate.x, fam.targetY, fDef.color, '#090d16', 28);
        const bannerText =
          gk === 'ice_phoenix'
            ? '丹火融冰 · 寒髓障破'
            : gk === 'sluice_tortoise'
              ? '镇岳压枢 · 水闸轰开'
              : gk === 'gear_kestrel'
                ? '木鸢拨锁 · 天机门启'
                : '玉狐破妄 · 迷障消散';
        this.skillBanner = { name: bannerText, timer: 1.5, color: fDef.color };
      }
    }

    // 2. 剑灵 / 玉狐感知暗裂石壁与裂地石板星芒提示
    if (
      (activeFam === 'familiar_sword' || activeFam === 'familiar_fox') &&
      fam.calloutTimer <= 0
    ) {
      const sparkCol = activeFam === 'familiar_fox' ? '#a7f3d0' : '#38bdf8';
      let hinted = false;
      if (this.room.secretWalls) {
        for (const sw of this.room.secretWalls) {
          if (this.slot.brokenSecretWalls.includes(sw.id)) continue;
          if (Math.hypot(sw.x - p.x, sw.y + sw.h * 0.5 - (p.y - 36)) < 165) {
            fam.calloutText = activeFam === 'familiar_fox' ? '灵狐嗅秘…' : '此壁空鸣…';
            fam.calloutTimer = 2.8;
            this.spawnInkBurst(sw.x + sw.w * 0.5, sw.y + sw.h * 0.5, sparkCol, '#fde047', 6);
            hinted = true;
            break;
          }
        }
      }
      if (!hinted) {
        for (const sd of getRoomSideDoors(this.room)) {
          if (!sd.secretWallId || this.slot.brokenSecretWalls.includes(sd.secretWallId)) continue;
          const dx = sd.side === 'left' ? 20 : this.room.pixelW - 20;
          const dy = sd.floorY - 56;
          if (Math.hypot(dx - p.x, dy - (p.y - 36)) < 195) {
            fam.calloutText = '暗格藏锋!';
            fam.calloutTimer = 2.8;
            this.spawnInkBurst(dx, dy, sparkCol, '#fde047', 8);
            hinted = true;
            break;
          }
        }
      }
      if (!hinted) {
        for (const sh of this.room.shafts) {
          if (
            sh.dir !== 'down' ||
            !sh.sealId ||
            this.slot.brokenSecretWalls.includes(sh.sealId)
          ) {
            continue;
          }
          const cx = (sh.x1 + sh.x2) * 0.5;
          const sy = sampleSolidGroundY(this.room, cx);
          if (Math.hypot(cx - p.x, sy - p.y) < 175) {
            fam.calloutTimer = 2.6;
            this.spawnInkBurst(cx, sy - 8, sparkCol, '#fde047', 7);
            break;
          }
        }
      }
    }

    // 3. 天机木鸢：牵引周身散落纹银与符心自动归囊
    if (activeFam === 'familiar_kestrel') {
      for (const d of this.drops) {
        if (d.isStaticPickup || (d.kind !== 'gold' && d.kind !== 'heart')) continue;
        const dx = p.x - d.x;
        const dy = p.y - 30 - d.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 8 && dist < 215) {
          const pull = Math.min(340, 145 + (215 - dist) * 1.4);
          d.x += (dx / dist) * pull * dt;
          d.y += (dy / dist) * pull * dt;
          d.vy = Math.min(d.vy, 30);
        }
      }
    }

    // 4. 青丘玉狐：清辉润脉，周期吐纳缓慢温养气血与真气
    if (activeFam === 'familiar_fox') {
      this.foxBlessingTimer -= dt;
      if (this.foxBlessingTimer <= 0) {
        this.foxBlessingTimer = Math.max(3.8, 5.6 - famLv * 0.2);
        if (p.hp < p.maxHp || p.mp < p.maxMp) {
          const hpGain = Math.min(p.maxHp - p.hp, 3 + famLv);
          const mpGain = Math.min(p.maxMp - p.mp, 3 + Math.floor(famLv * 0.8));
          p.hp += hpGain;
          p.mp += mpGain;
          this.spawnInkBurst(p.x, p.y - 42, '#a7f3d0', '#0f172a', 6);
          if (hpGain > 0) {
            this.floats.push({
              x: p.x,
              y: p.y - 74,
              vy: -26,
              text: `+${hpGain}`,
              color: '#86efac',
              size: 11,
              life: 0.55,
            });
          }
        }
      }
    }

    if (fam.swoopTimer > 0) {
      fam.swoopTimer -= dt;
      fam.x += (fam.targetX - fam.x) * Math.min(1, dt * 15);
      fam.y += (fam.targetY - fam.y) * Math.min(1, dt * 15);
      return;
    }

    // 平时轻盈悬浮于少侠肩后
    const anchorX = p.x - p.facing * 36;
    const anchorY = p.y - 72 + Math.sin(p.animTime * 3.8) * 6;
    fam.x += (anchorX - fam.x) * Math.min(1, dt * 8.5);
    fam.y += (anchorY - fam.y) * Math.min(1, dt * 8.5);
    fam.facing = p.facing;

    // 5. 五大护法灵各具神通自动协战！
    if (fam.cooldown > 0 || this.enemies.length === 0) return;

    if (activeFam === 'familiar_sword') {
      let nearest: EnemyEntity | null = null;
      let bestDist = 285;
      for (const e of this.enemies) {
        const d = Math.hypot(e.x - p.x, e.y - e.profile.h * 0.5 - (p.y - 40));
        if (d < bestDist) {
          bestDist = d;
          nearest = e;
        }
      }
      if (nearest) {
        fam.cooldown = Math.max(1.0, 1.8 - famLv * 0.08);
        fam.swoopTimer = 0.32;
        fam.targetX = nearest.x;
        fam.targetY = nearest.y - nearest.profile.h * 0.55;
        fam.facing = nearest.x >= fam.x ? 1 : -1;
        const dmg = Math.max(8, Math.round(p.atk * (0.46 + famLv * 0.07)));
        this.slashImpacts.push({
          x: fam.targetX,
          y: fam.targetY,
          angle: -0.4 * fam.facing,
          length: 44,
          thickness: 4,
          color: '#38bdf8',
          ringRadius: 24,
          life: 0.18,
          maxLife: 0.18,
        });
        this.applyDamageToEnemy(nearest, dmg, false, 14);
      }
    } else if (activeFam === 'familiar_phoenix') {
      let nearest: EnemyEntity | null = null;
      let bestDist = 350;
      for (const e of this.enemies) {
        const d = Math.hypot(e.x - p.x, e.y - e.profile.h * 0.5 - (p.y - 44));
        if (d < bestDist) {
          bestDist = d;
          nearest = e;
        }
      }
      if (nearest) {
        fam.cooldown = Math.max(1.35, 2.25 - famLv * 0.09);
        const tx = nearest.x;
        const ty = nearest.y - nearest.profile.h * 0.55;
        const dx = tx - fam.x;
        const dy = ty - fam.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        fam.facing = dx >= 0 ? 1 : -1;
        fam.swoopTimer = 0.18;
        fam.targetX = fam.x + (dx / dist) * 20;
        fam.targetY = fam.y - 10;
        const dmg = Math.max(
          10,
          Math.round((p.atk * 0.38 + p.int * 0.85) * (1 + famLv * 0.08))
        );
        this.spawnInkBurst(fam.x + fam.facing * 12, fam.y, '#fb923c', '#fde047', 8);
        this.projectiles.push({
          fromPlayer: true,
          kind: 'qi_wave',
          affinity: 'fire',
          burnOnHit: true,
          x: fam.x + fam.facing * 14,
          y: fam.y,
          vx: (dx / dist) * 510,
          vy: (dy / dist) * 510,
          r: 18,
          dmg,
          color: '#fb923c',
          life: 0.85,
          maxLife: 0.85,
          pierce: 2,
          hitIds: new Set(),
        });
      }
    } else if (activeFam === 'familiar_tortoise') {
      const nearby = this.enemies.filter(
        (e) => Math.hypot(e.x - p.x, e.y - e.profile.h * 0.5 - (p.y - 36)) <= 160
      );
      if (nearby.length > 0) {
        fam.cooldown = Math.max(1.55, 2.45 - famLv * 0.09);
        const lead = nearby[0];
        fam.swoopTimer = 0.28;
        fam.targetX = (p.x + lead.x) * 0.5;
        fam.targetY = p.y - 44;
        fam.facing = lead.x >= p.x ? 1 : -1;
        const dmg = Math.max(
          9,
          Math.round((p.atk * 0.42 + p.def * 0.7) * (1 + famLv * 0.07))
        );
        this.slashImpacts.push({
          x: p.x,
          y: p.y - 38,
          angle: 0,
          length: 36,
          thickness: 4,
          color: '#22d3ee',
          ringRadius: 58,
          life: 0.24,
          maxLife: 0.24,
        });
        this.spawnInkBurst(p.x, p.y - 36, '#22d3ee', '#083344', 14);
        for (const e of nearby) {
          e.chillTimer = Math.max(e.chillTimer || 0, 2.5);
          this.applyDamageToEnemy(e, dmg, false, 24, 'frost');
        }
      }
    } else if (activeFam === 'familiar_kestrel') {
      let bestTarget: EnemyEntity | null = null;
      let bestScore = Infinity;
      for (const e of this.enemies) {
        const d = Math.hypot(e.x - p.x, e.y - e.profile.h * 0.5 - (p.y - 42));
        if (d > 380) continue;
        const score = d - (e.profile.flying ? 125 : e.profile.ranged ? 65 : 0);
        if (score < bestScore) {
          bestScore = score;
          bestTarget = e;
        }
      }
      if (bestTarget) {
        fam.cooldown = Math.max(0.78, 1.38 - famLv * 0.065);
        const tx = bestTarget.x;
        const ty = bestTarget.y - bestTarget.profile.h * 0.55;
        const dx = tx - fam.x;
        const dy = ty - fam.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        fam.facing = dx >= 0 ? 1 : -1;
        fam.swoopTimer = 0.14;
        fam.targetX = fam.x + fam.facing * 12;
        fam.targetY = fam.y - 8;
        const dmg = Math.max(7, Math.round(p.atk * (0.36 + famLv * 0.06)));
        this.projectiles.push({
          fromPlayer: true,
          kind: 'dagger',
          affinity: 'lightning',
          x: fam.x + fam.facing * 14,
          y: fam.y,
          vx: (dx / dist) * 720,
          vy: (dy / dist) * 720,
          r: 9,
          dmg,
          color: '#facc15',
          life: 0.75,
          maxLife: 0.75,
          pierce: 2,
          hitIds: new Set(),
        });
      }
    } else if (activeFam === 'familiar_fox') {
      let nearest: EnemyEntity | null = null;
      let bestDist = 320;
      for (const e of this.enemies) {
        const d = Math.hypot(e.x - p.x, e.y - e.profile.h * 0.5 - (p.y - 40));
        if (d < bestDist) {
          bestDist = d;
          nearest = e;
        }
      }
      if (nearest) {
        fam.cooldown = Math.max(1.25, 2.05 - famLv * 0.08);
        const tx = nearest.x;
        const ty = nearest.y - nearest.profile.h * 0.55;
        const baseAng = Math.atan2(ty - fam.y, tx - fam.x);
        fam.facing = tx >= fam.x ? 1 : -1;
        const dmg = Math.max(
          6,
          Math.round((p.atk * 0.24 + p.int * 0.55) * (1 + famLv * 0.07))
        );
        for (const spread of [-0.11, 0.11]) {
          const ang = baseAng + spread;
          this.projectiles.push({
            fromPlayer: true,
            kind: 'qi_wave',
            x: fam.x + fam.facing * 10,
            y: fam.y,
            vx: Math.cos(ang) * 470,
            vy: Math.sin(ang) * 470,
            r: 12,
            dmg,
            color: '#a7f3d0',
            life: 0.82,
            maxLife: 0.82,
            pierce: 1,
            hitIds: new Set(),
          });
        }
      }
    }
  }

  private performWeaponAttack(chargedHeavy = false): void {
    if (!this.slot) return;
    const p = this.player;
    const w = WEAPONS[this.slot.equippedWeapon] || WEAPONS.sword_0;
    const arch = w.archetype;

    const maxSteps = 3;
    p.comboStep = chargedHeavy ? 2 : (p.comboStep + 1) % maxSteps;
    p.comboResetTimer = 0.85;
    const isFinisher = p.comboStep === 2;
    const isSpearLunge = arch === 'spear' && (isFinisher || this.input.moveX * p.facing > 0.35);

    let duration = 0.24;
    let cd = 0.2;
    if (arch === 'greatsword') {
      duration = chargedHeavy ? 0.54 : isFinisher ? 0.5 : 0.44;
      cd = chargedHeavy ? 0.52 : isFinisher ? 0.48 : 0.42;
    } else if (arch === 'daggers') {
      duration = isFinisher ? 0.22 : 0.16;
      cd = isFinisher ? 0.17 : 0.12;
      if (!p.onGround && p.vy > -45) p.vy = -52; // 双刺空中乱舞短暂滞空！
      if (isFinisher) {
        // 双刺终结技【幻影掠步】：赋予 0.20s 贴身闪身无敌帧与残影步！
        p.invulnTimer = Math.max(p.invulnTimer, 0.2);
        this.afterImages.push({ x: p.x, y: p.y, facing: p.facing, color: w.glowColor, alpha: 0.78 });
      }
    } else if (arch === 'spear') {
      duration = isFinisher ? 0.32 : 0.27;
      cd = isFinisher ? 0.26 : 0.23;
    } else if (arch === 'whip') {
      duration = isFinisher ? 0.36 : 0.32;
      cd = isFinisher ? 0.32 : 0.29;
    } else if (isFinisher) {
      duration = 0.31;
      cd = 0.23;
    }
    p.attackCooldown = cd;

    if (p.onGround) {
      const stepV =
        arch === 'greatsword'
          ? chargedHeavy
            ? 275
            : isFinisher
              ? 215
              : 145
          : arch === 'spear'
            ? isSpearLunge
              ? 280
              : 115
            : arch === 'daggers'
              ? isFinisher
                ? 215
                : 90
              : arch === 'whip'
                ? isFinisher
                  ? 95
                  : 40
                : isFinisher
                  ? 225
                  : 105;
      p.vx = p.facing * stepV;
      if (isSpearLunge) {
        this.afterImages.push({ x: p.x, y: p.y, facing: p.facing, color: w.glowColor, alpha: 0.66 });
      }
    }

    const pogoDown = arch === 'sword' && !p.onGround && this.input.moveY > 0.5;

    // 重刃长按满蓄【霸王破甲重劈】：额外震出一段裂地罡气重波！
    if (chargedHeavy && arch === 'greatsword') {
      AudioFX.playElementalSlash('charge');
      this.projectiles.push({
        fromPlayer: true,
        kind: 'qi_wave',
        x: p.x + p.facing * 42,
        y: p.y - 34,
        vx: p.facing * 490,
        vy: 0,
        r: 32,
        dmg: Math.round(p.atk * 1.15),
        color: '#fb923c',
        life: 0.42,
        maxLife: 0.42,
        pierce: 4,
        hitIds: new Set(),
      });
      this.screenShake = Math.max(this.screenShake, 7.5);
      NativeApp.haptic('heavy');
    }

    // 终极三阶名剑【七星龙渊剑】第三式普攻自带一道剑芒破空！
    if (w.id === 'sword_3' && isFinisher) {
      this.projectiles.push({
        fromPlayer: true,
        kind: 'qi_wave',
        x: p.x + p.facing * 30,
        y: p.y - 38,
        vx: p.facing * 680,
        vy: 0,
        r: 22,
        dmg: Math.round(p.atk * 0.6),
        color: '#fde047',
        life: 0.45,
        maxLife: 0.45,
        pierce: 3,
        hitIds: new Set(),
      });
    }

    // 传说神兵挥砍瞬间元素音效（纯手绘刀罡负责挥砍视觉，不额外喷射空挥椭圆粒子）
    if (w.specialEffect || w.lifestealBonus) {
      const eff = w.specialEffect || 'blood_leech';
      AudioFX.playElementalSlash(
        eff === 'frost_slow'
          ? 'frost'
          : eff === 'chain_lightning'
            ? 'lightning'
            : eff === 'armor_sunder'
              ? 'charge'
              : 'blood'
      );
    }

    const reachMult = chargedHeavy ? 1.32 : isSpearLunge ? 1.26 : isFinisher ? 1.18 : 1.0;
    const baseReachY = Math.round(
      Math.max(w.reachY + 14, arch === 'greatsword' ? 105 : 48) * (isFinisher ? 1.12 : 1)
    );
    const finalReachY = w.id === 'spear_3' && isFinisher ? Math.round(baseReachY * 1.65) : baseReachY;
    this.slashHitIds.clear();
    this.activeSlash = {
      x: p.x,
      y: p.y - 40,
      facing: p.facing,
      aimX: this.input.moveX !== 0 ? this.input.moveX : p.facing,
      aimY: this.input.moveY,
      archetype: arch,
      weaponId: w.id,
      comboStep: p.comboStep,
      pogoDown,
      progress: 0,
      duration,
      reachX: Math.round(Math.max(w.reachX + 20, arch === 'greatsword' ? 128 : 74) * reachMult),
      reachY: finalReachY,
      color: chargedHeavy ? '#fde047' : w.color,
      glowColor: chargedHeavy ? '#ef4444' : isFinisher && w.tier >= 3 ? '#fde047' : w.glowColor,
      slammedGround: false,
      chargedHeavy,
      specialEffect: w.specialEffect || (w.lifestealBonus ? 'blood_leech' : undefined),
    };

    AudioFX.playSlash(
      arch === 'greatsword' || arch === 'whip' || isFinisher ? 'heavy' : arch === 'spear' ? 'spear' : 'light'
    );
  }

  /**
   * 逐步射线检测【瞬影一闪】安全落点：严格受铁闸、紫瘴障、实心断崖、蹬墙壁、悬崖断口与熔岩火潭阻挡，彻底杜绝穿门越界跳关！
   */
  private computeSafeFlashEndX(startX: number, dir: 1 | -1, maxDist: number): { x: number; y: number } {
    const room = this.room;
    const p = this.player;
    if (!room || !this.slot) return { x: startX, y: p.y };

    let safeX = startX;
    let safeY = p.y;
    const step = 8;
    for (let d = step; d <= maxDist; d += step) {
      const nx = startX + dir * d;
      if (nx < 38 || nx > room.pixelW - 38) break;

      // 1. 绝不可穿过未开启的玄铁重闸或九幽紫瘴封魔障！
      if (
        room.ironGate &&
        !this.slot.brokenSecretWalls.includes(room.ironGate.id) &&
        safeY > room.ironGate.topY + 8 &&
        safeY - p.h < room.ironGate.bottomY &&
        Math.abs(nx - room.ironGate.x) < 20
      ) {
        break;
      }

      // 2. 绝不可穿过实心能力锁断崖 (`sb.blocking`)、落地厚重石墩 (`h >= 52`) 或蹬墙石壁 (`climbWalls`)！
      const hitCliff = room.solidBlocks?.some(
        (sb) =>
          (Boolean(sb.blocking) || (isGroundRestingSolidBlock(room, sb) && sb.h >= 52)) &&
          safeY > sb.y + 8 &&
          safeY - p.h < sb.y + sb.h - 4 &&
          nx >= sb.x - 14 &&
          nx <= sb.x + sb.w + 14
      );
      if (hitCliff) break;

      const hitClimbWall = room.climbWalls?.some(
        (cw) =>
          safeY > cw.topY + 10 &&
          safeY - p.h < cw.bottomY &&
          Math.abs(nx - cw.x) < 28
      );
      if (hitClimbWall) break;

      // 3. 立足地面居合步：遇悬崖断口、竖井深坑或熔岩火潭边缘自动在岸边收步，允许顺滑踏上 <=48px 矮石阶，绝不飞渡深渊跳关！
      const nextSurfY = sampleEntitySurfaceY(room, nx, safeY);
      if (Math.abs(nextSurfY - safeY) > 48) break;

      const intoLava = room.waterZones.some(
        (wz) =>
          wz.liquidKind === 'lava' &&
          nx >= wz.x1 - 8 &&
          nx <= wz.x2 + 8 &&
          nextSurfY >= wz.surfaceY - 8
      );
      if (intoLava) break;

      safeX = nx;
      safeY = nextSurfY;
    }

    return { x: safeX, y: safeY };
  }

  private tryCastMartialSkill(skillId: SkillId): boolean {
    if (!this.slot || !this.room) return false;

    // 终极禁卷【九幽噬魂引】必须亲赴云梯古武秘阁取得秘卷后方可施展！
    if (!this.slot.learnedSkills.includes(skillId)) {
      return false;
    }

    const sk = SKILLS[skillId];
    const p = this.player;

    if (p.skillCooldown > 0) {
      return false;
    }

    if ((skillId === 'shunying_flash' || skillId === 'jinghong_rising') && !p.onGround) {
      return false;
    }

    if (p.mp < sk.mpCost) {
      return false;
    }

    p.mp -= sk.mpCost;
    p.attackCooldown = 0.34;
    this.activeSlash = null;
    p.skillCooldown =
      skillId === 'jiuyou_soulsteal' ? 4.5 : skillId === 'taiji_parry' ? 2.4 : 1.6;
    AudioFX.playSkillCast();
    NativeApp.haptic('medium');

    const skillDmg = Math.round((p.atk * 0.85 + p.int * 0.9) * sk.dmgMult);
    const w = WEAPONS[this.slot.equippedWeapon] || WEAPONS.sword_0;
    const isHeavy = w.archetype === 'greatsword';

    if (skillId === 'shuofeng_wave') {
      const waveCol = isHeavy ? '#f97316' : '#2dd4bf';
      this.activeSkillAnim = {
        kind: 'shuofeng_wave',
        progress: 0,
        duration: 0.4,
        startX: p.x,
        startY: p.y,
        endX: p.x,
        endY: p.y,
        facing: p.facing,
        color: waveCol,
      };
      this.projectiles.push({
        fromPlayer: true,
        kind: 'qi_wave',
        x: p.x + p.facing * 34,
        y: p.y - 38,
        vx: p.facing * (isHeavy ? 460 : 560),
        vy: 0,
        r: isHeavy ? 38 : 28,
        dmg: skillDmg,
        color: waveCol,
        life: 0.62,
        maxLife: 0.62,
        pierce: 3,
        hitIds: new Set(),
      });
      this.spawnInkBurst(
        p.x + p.facing * 26,
        p.y - 38,
        isHeavy ? '#fb923c' : '#2dd4bf',
        '#090d16',
        6
      );
    } else if (skillId === 'shunying_flash') {
      const startX = p.x;
      const startY = p.y;
      const dest = this.computeSafeFlashEndX(startX, p.facing, 144);
      const endX = dest.x;
      p.invulnTimer = Math.max(p.invulnTimer, 0.24);
      for (let i = 1; i <= 2; i++) {
        const ix = startX + ((endX - startX) * i) / 3;
        this.afterImages.push({ x: ix, y: p.y, facing: p.facing, color: '#fde68a', alpha: 0.4 });
      }
      p.x = endX;
      p.y = dest.y;
      this.activeSkillAnim = {
        kind: 'shunying_flash',
        progress: 0,
        duration: 0.44,
        startX,
        startY,
        endX,
        endY: dest.y,
        facing: p.facing,
        color: '#fde68a',
      };
      this.slashImpacts.push({
        x: (startX + endX) * 0.5,
        y: p.y - 42,
        angle: 0,
        length: Math.max(36, Math.abs(endX - startX) * 0.68),
        thickness: 6,
        color: '#fde68a',
        ringRadius: 0,
        life: 0.22,
        maxLife: 0.22,
      });
      const minX = Math.min(startX, endX) - 22;
      const maxX = Math.max(startX, endX) + 22;
      this.damageEnemiesInBox(minX, p.y - 80, maxX - minX, 88, skillDmg, false, 32);
      this.screenShake = 4;
    } else if (skillId === 'jinghong_rising') {
      const launchX = p.x;
      const launchY = p.y;
      // 升龙高度严格控制在 99px（低于常规单跳 117px），纯粹服务防空挑斩，绝不顶替二段跳跳关！
      p.vy = -560;
      p.onGround = false;
      p.coyoteTimer = 0;
      p.invulnTimer = Math.max(p.invulnTimer, 0.22);
      this.activeSkillAnim = {
        kind: 'jinghong_rising',
        progress: 0,
        duration: 0.48,
        startX: launchX,
        startY: launchY,
        endX: launchX,
        endY: launchY - 96,
        facing: p.facing,
        color: '#38bdf8',
      };
      this.slashImpacts.push({
        x: p.x + p.facing * 18,
        y: p.y - 64,
        angle: -Math.PI * 0.46 * p.facing,
        length: 76,
        thickness: 7,
        color: '#38bdf8',
        ringRadius: 0,
        life: 0.22,
        maxLife: 0.22,
      });
      this.damageEnemiesInBox(p.x - 56, p.y - 126, 112, 132, skillDmg, false, 35);
      this.spawnInkBurst(p.x, p.y - 48, '#38bdf8', '#090d16', 7);
      this.screenShake = 4;
    } else if (skillId === 'taiji_parry') {
      // 真正吃时机的弹反绝技：仅当抹除敌方飞弹或抓准敌方出招瞬间(windup/lunge_slash)才触发高伤破招；盲目空放威力减半且不晕 Boss！
      this.taijiFlashTimer = 0.42;
      p.invulnTimer = Math.max(p.invulnTimer, 0.2);
      let deflectedBullet = false;
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const pr = this.projectiles[i];
        if (!pr.fromPlayer && Math.hypot(pr.x - p.x, pr.y - (p.y - 38)) <= 155) {
          this.spawnInkBurst(pr.x, pr.y, '#fde047', '#090d16', 8);
          this.projectiles.splice(i, 1);
          deflectedBullet = true;
        }
      }
      if (deflectedBullet) AudioFX.playParryClang();

      let parriedAnyStrike = deflectedBullet;
      for (const e of [...this.enemies]) {
        const parryRad = 155 + (e.profile.isBoss ? e.profile.w * 0.3 : 0);
        if (Math.hypot(e.x - p.x, e.y - e.profile.h * 0.48 - (p.y - 38)) <= parryRad) {
          const parriedAttack = e.aiState === 'windup' || e.aiState === 'lunge_slash';
          if (parriedAttack) {
            parriedAnyStrike = true;
            p.invulnTimer = Math.max(p.invulnTimer, 0.42);
            if (!e.profile.isBoss) {
              e.vx = -e.facing * 180;
            } else {
              e.vx = 0;
              e.vy = 0;
            }
            AudioFX.playParryClang();
            this.hitstopTimer = 0.085;
            this.screenShake = 7;
            NativeApp.haptic('heavy');
            this.applyDamageToEnemy(
              e,
              Math.round(skillDmg * 1.45),
              true,
              e.profile.isBoss ? 125 : 999
            );
          } else {
            if (!e.profile.isBoss) {
              this.stepGroundEnemyX(e, (e.x >= p.x ? 1 : -1) * 28);
            }
            this.applyDamageToEnemy(e, Math.round(skillDmg * 0.55), false, 18);
          }
        }
      }
      this.activeSkillAnim = {
        kind: 'taiji_parry',
        progress: 0,
        duration: 0.52,
        startX: p.x,
        startY: p.y,
        endX: p.x,
        endY: p.y,
        facing: p.facing,
        color: '#fde047',
        parrySuccess: parriedAnyStrike,
      };
      if (parriedAnyStrike) {
        p.mp = Math.min(p.maxMp, p.mp + 10);
        this.parryZoomTimer = 0.24;
      }
    } else if (skillId === 'jiuyou_soulsteal') {
      this.soulStealFlashTimer = 0.55;
      p.invulnTimer = Math.max(p.invulnTimer, 0.35);
      let totalHeal = 0;
      const targets: { x: number; y: number }[] = [];
      for (const e of [...this.enemies]) {
        if (Math.hypot(e.x - p.x, e.y - p.y) > 420) continue;
        targets.push({ x: e.x, y: e.y - e.profile.h * 0.52 });
        this.spawnInkBurst(e.x, e.y - e.profile.h * 0.5, '#ef4444', '#090d16', 14);
        this.applyDamageToEnemy(e, skillDmg, false, 40);
        totalHeal += 8;
      }
      this.activeSkillAnim = {
        kind: 'jiuyou_soulsteal',
        progress: 0,
        duration: 0.68,
        startX: p.x,
        startY: p.y,
        endX: p.x,
        endY: p.y,
        facing: p.facing,
        color: '#ef4444',
        soulTargets: targets,
      };
      totalHeal = Math.min(32, totalHeal);
      if (totalHeal > 0) {
        p.hp = Math.min(p.maxHp, p.hp + totalHeal);
        this.floats.push({
          x: p.x,
          y: p.y - 74,
          vy: -34,
          text: `+${totalHeal}`,
          color: '#4ade80',
          size: 12,
          life: 0.65,
        });
      }
      this.screenShake = 6;
      NativeApp.haptic('heavy');
    }

    return true;
  }

  private castSubWeapon(): void {
    if (!this.slot) return;
    if (this.player.subWeaponCooldown > 0) return;
    const sub = SUB_WEAPONS[this.slot.equippedSubWeapon] || SUB_WEAPONS.dagger_throw;
    if (this.slot.talismanHearts < sub.talismanCost) {
      return;
    }

    this.slot.talismanHearts -= sub.talismanCost;
    this.player.subWeaponCooldown = 0.48;
    this.activeSkillAnim = {
      kind: 'sub_throw',
      progress: 0,
      duration: 0.25,
      startX: this.player.x,
      startY: this.player.y,
      endX: this.player.x,
      endY: this.player.y,
      facing: this.player.facing,
      color: sub.color,
    };
    const core = this.slot.equippedYaoCore ? YAO_CORES[this.slot.equippedYaoCore] : undefined;
    const subMult = (1 + (core?.subWeaponMult || 0)) * (1 + this.slot.level * 0.045);
    const dmg = Math.round((sub.baseDmg + this.player.int * 1.45) * subMult);
    const p = this.player;
    AudioFX.playSlash('light');

    if (sub.id === 'holy_fire') {
      this.projectiles.push({
        fromPlayer: true,
        kind: 'holy_fire',
        x: p.x + p.facing * 18,
        y: p.y - 44,
        vx: p.facing * 250,
        vy: -260,
        r: 10,
        dmg,
        color: sub.color,
        life: 1.5,
        maxLife: 1.5,
        pierce: 1,
        hitIds: new Set(),
      });
    } else if (sub.id === 'bagua_cross') {
      this.projectiles.push({
        fromPlayer: true,
        kind: 'bagua',
        x: p.x + p.facing * 22,
        y: p.y - 38,
        vx: p.facing * 440,
        vy: 0,
        r: 20,
        dmg,
        color: sub.color,
        life: 1.7,
        maxLife: 1.7,
        pierce: 99,
        hitIds: new Set(),
      });
    } else if (sub.id === 'mountain_seal') {
      // 致敬恶魔城战斧：高抛重型镇岳金印，专克高台与飞天妖魔！
      this.projectiles.push({
        fromPlayer: true,
        kind: 'seal',
        x: p.x + p.facing * 16,
        y: p.y - 52,
        vx: p.facing * 215,
        vy: -675,
        r: 18,
        dmg,
        color: sub.color,
        life: 1.8,
        maxLife: 1.8,
        pierce: 99,
        hitIds: new Set(),
      });
    } else if (sub.id === 'sword_orbit') {
      // 召唤三柄子母护体灵剑环绕周身高速旋转护体 6.5 秒！
      p.orbitSwordTimer = 6.5;
      this.orbitTickTimer = 0;
      AudioFX.playSkillCast();
      this.spawnInkBurst(p.x, p.y - 42, '#60a5fa', '#090d16', 16);
    } else {
      for (let i = -1; i <= 1; i++) {
        this.projectiles.push({
          fromPlayer: true,
          kind: 'dagger',
          x: p.x + p.facing * 20,
          y: p.y - 38 + i * 9,
          vx: p.facing * 650,
          vy: i * 22,
          r: 8,
          dmg,
          color: sub.color,
          life: 0.85,
          maxLife: 0.85,
          pierce: 1,
          hitIds: new Set(),
        });
      }
    }
  }

  private shatterLanternsAndWallsInBox(
    bx: number,
    by: number,
    bw: number,
    bh: number,
    isHeavyHit = false,
    hitTag = 0
  ): void {
    if (!this.slot || !this.room) return;

    // 1. 恶魔城灵魂交互：挥兵劈碎贴地青瓷封酒瓮、铜烛台、青石宫灯柱与悬吊宫灯，爆出灵符、纹银或金疮药！
    for (let idx = 0; idx < this.liveLanterns.length; idx++) {
      const ln = this.liveLanterns[idx];
      if (ln.broken) continue;
      const gy = sampleSolidGroundY(this.room, ln.x);
      const isGroundedProp = gy - ln.y <= 135 && gy < 2000;
      const isUrn = isGroundedProp && idx % 2 === 1;
      const topHitY = isGroundedProp ? gy - (isUrn ? 58 : 110) : ln.y - 20;
      const botHitY = isGroundedProp ? gy + 6 : ln.y + 20;

      if (ln.x >= bx - 22 && ln.x <= bx + bw + 22 && botHitY >= by && topHitY <= by + bh) {
        ln.broken = true;
        AudioFX.playLanternBreak();
        const burstY = isGroundedProp ? gy - (isUrn ? 28 : 58) : ln.y + 12;
        this.spawnInkBurst(
          ln.x,
          burstY,
          isUrn ? '#7dd3fc' : '#fb923c',
          isUrn ? '#334155' : '#991b1b',
          12
        );
        const roll = Math.random();
        if (isUrn && roll < 0.025) {
          this.drops.push({
            id: `lantern_${this.nextEntityId++}`,
            isStaticPickup: false,
            kind: 'consumable',
            itemId: 'jinchuang_yao',
            amount: 1,
            x: ln.x,
            y: burstY,
            vy: -175,
            color: '#4ade80',
            label: '金疮药',
          });
        } else if (roll < 0.32) {
          const dropGold = roll < 0.14;
          this.drops.push({
            id: `lantern_${this.nextEntityId++}`,
            isStaticPickup: false,
            kind: dropGold ? 'gold' : 'heart',
            itemId: dropGold ? 'gold' : 'heart',
            amount: dropGold ? 4 + Math.floor(Math.random() * 6) : Math.random() < 0.22 ? 2 : 1,
            x: ln.x,
            y: burstY,
            vy: -170,
            color: dropGold ? '#fde047' : '#fb923c',
            label: dropGold ? '纹银' : '灵符',
          });
        }
      }
    }

    // 2. 恶魔城经典【隐藏可击碎密室砖墙 / 墙中烤鸡】！
    if (this.room.secretWalls) {
      for (const sw of this.room.secretWalls) {
        if (this.slot.brokenSecretWalls.includes(sw.id)) continue;
        const wallTag = -2000 - sw.x;
        if (hitTag !== 0 && this.slashHitIds.has(wallTag)) continue;
        if (sw.x + sw.w >= bx && sw.x <= bx + bw && sw.y + sw.h >= by && sw.y <= by + bh) {
          if (hitTag !== 0) this.slashHitIds.add(wallTag);
          const prev = this.secretWallHits.get(sw.id) || 0;
          const next = prev + (isHeavyHit ? 3 : 1);
          this.secretWallHits.set(sw.id, next);
          AudioFX.playParryClang();
          this.spawnInkBurst(sw.x + sw.w * 0.5, sw.y + sw.h * 0.5, '#fde047', '#334155', 14);
          this.screenShake = Math.max(this.screenShake, 5);

          if (next >= 3) {
            this.slot.brokenSecretWalls.push(sw.id);
            this.screenShake = 9;
            NativeApp.haptic('heavy');
            this.spawnInkBurst(sw.x + sw.w * 0.5, sw.y + sw.h * 0.5, '#fb923c', '#0f172a', 26);
            this.drops.push({
              id: `wall_prize_${sw.id}`,
              isStaticPickup: false,
              kind: sw.dropKind,
              itemId: sw.dropItemId,
              amount: 1,
              x: sw.x + sw.w * 0.5,
              y: sw.y + sw.h - 14,
              vy: -210,
              color: '#4ade80',
              label: this.getPickupLabel(sw.dropKind, sw.dropItemId),
            });
          }
        }
      }
    }

    // 3. 破壁洞开独立隐藏密室
    for (const sd of getRoomSideDoors(this.room)) {
      if (!sd.secretWallId || this.slot.brokenSecretWalls.includes(sd.secretWallId)) continue;
      const wx = sd.side === 'left' ? 0 : this.room.pixelW - 46;
      const wy = sd.floorY - 124;
      const ww = 46;
      const wh = 128;
      const doorTag =
        (sd.side === 'left' ? -3100 : -3600) - Math.round(sd.floorY * 0.1);
      if (hitTag !== 0 && this.slashHitIds.has(doorTag)) continue;
      if (wx + ww >= bx && wx <= bx + bw && wy + wh >= by && wy <= by + bh) {
        if (hitTag !== 0) this.slashHitIds.add(doorTag);
        const prev = this.secretWallHits.get(sd.secretWallId) || 0;
        const next = prev + (isHeavyHit ? 3 : 1);
        this.secretWallHits.set(sd.secretWallId, next);
        AudioFX.playParryClang();
        const fxX = sd.side === 'left' ? 24 : this.room.pixelW - 24;
        const fxY = sd.floorY - 58;
        this.spawnInkBurst(fxX, fxY, '#fde047', '#334155', 16);
        this.screenShake = Math.max(this.screenShake, 5.5);

        if (next >= 3) {
          this.slot.brokenSecretWalls.push(sd.secretWallId);
          AudioFX.playRelicBell();
          this.screenShake = 10;
          NativeApp.haptic('heavy');
          this.spawnInkBurst(fxX, fxY, '#fb923c', '#0f172a', 32);
        }
      }
    }

    // 4. 敲响高堂【共振镇魂青铜古钟 (`giant_bell`)】：击中钟身迸发金色声浪震晕周围妖邪并扫落盏灯！
    if (this.room.decorProps) {
      for (let dIdx = 0; dIdx < this.room.decorProps.length; dIdx++) {
        const dp = this.room.decorProps[dIdx];
        if (dp.kind !== 'giant_bell' || (this.bellCooldowns.get(dIdx) || 0) > 0) continue;
        const sc = dp.scale ?? 1;
        const bellH = 215 * sc;
        const bellW = 118 * sc;
        const bellLeft = dp.x - bellW * 0.5;
        const bellTop = dp.y - bellH * 0.94;
        if (
          bellLeft + bellW >= bx &&
          bellLeft <= bx + bw &&
          bellTop + bellH * 1.04 >= by &&
          bellTop <= by + bh
        ) {
          this.bellCooldowns.set(dIdx, 1.8);
          this.bellRingTimers.set(dIdx, 1.8);
          AudioFX.playRelicBell();
          this.screenShake = Math.max(this.screenShake, 7.5);
          NativeApp.haptic('medium');
          const bellMidY = dp.y - bellH * 0.45;
          this.slashImpacts.push({
            x: dp.x,
            y: bellMidY,
            angle: 0,
            length: 72,
            thickness: 5,
            color: '#fde047',
            ringRadius: 175,
            life: 0.42,
            maxLife: 0.42,
          });
          this.spawnInkBurst(dp.x, bellMidY, '#fde047', '#f97316', 20);
          this.floats.push({
            x: dp.x,
            y: bellTop - 6,
            vy: -32,
            text: '钟鸣镇魂!',
            color: '#fde047',
            size: 13.5,
            life: 0.78,
          });
          const bellDmg = Math.max(18, Math.round(this.player.atk * 0.9 + 18));
          for (const e of [...this.enemies]) {
            if (Math.hypot(e.x - dp.x, e.y - e.profile.h * 0.5 - bellMidY) <= 320) {
              this.applyDamageToEnemy(e, bellDmg, true, 85, 'lightning');
            }
          }
          for (let li = 0; li < this.liveLanterns.length; li++) {
            const ln = this.liveLanterns[li];
            if (!ln.broken && Math.hypot(ln.x - dp.x, ln.y - bellMidY) <= 240) {
              ln.broken = true;
              this.spawnInkBurst(ln.x, ln.y, '#fb923c', '#1e293b', 8);
            }
          }
        }
      }
    }
  }

  private updateActiveSlash(dt: number): void {
    const sl = this.activeSlash;
    if (!sl || !this.slot || !this.room) return;

    const p = this.player;
    sl.x = p.x;
    sl.y = p.y - 40;
    sl.progress += dt / sl.duration;

    const activeStart =
      sl.archetype === 'greatsword' ? 0.3 : sl.archetype === 'daggers' ? 0.06 : 0.14;
    const activeEnd = 0.88;

    if (
      sl.archetype === 'greatsword' &&
      sl.comboStep === 1 &&
      sl.progress >= 0.56 &&
      !sl.slammedGround &&
      p.onGround
    ) {
      sl.slammedGround = true;
      this.screenShake = 6.5;
      NativeApp.haptic('medium');
      this.spawnInkBurst(p.x + sl.facing * 78, p.y, '#fb923c', '#1e293b', 16);
    }

    if (sl.progress >= activeStart && sl.progress <= activeEnd) {
      let bx = p.x;
      let by = p.y - 68;
      let bw = sl.reachX;
      let bh = sl.reachY;

      if (sl.pogoDown) {
        bx = p.x - 34;
        by = p.y - 18;
        bw = 68;
        bh = 64;
      } else if (sl.archetype === 'greatsword') {
        bx = sl.facing === 1 ? p.x - 36 : p.x - sl.reachX;
        by = p.y - sl.reachY - 12;
        bw = sl.reachX + 36;
        bh = sl.reachY + 18;
      } else if (sl.archetype === 'whip' && Math.abs(sl.aimY) > 0.35) {
        // 乌金九节鞭支持八向甩鞭：斜上/正上抽击高空冥火鬼与吊灯！
        bx = sl.facing === 1 ? p.x - 10 : p.x - sl.reachX * 0.92;
        by = sl.aimY < 0 ? p.y - 44 - sl.reachX * 0.78 : p.y - 26;
        bw = sl.reachX * 0.92 + 10;
        bh = sl.reachX * 0.78;
      } else if (sl.archetype === 'spear' && sl.aimY < -0.35) {
        // 寒星长枪支持 ↑+斩 斜上护空挑刺！
        bx = sl.facing === 1 ? p.x - 6 : p.x - sl.reachX * 0.88;
        by = p.y - 44 - sl.reachX * 0.65;
        bw = sl.reachX * 0.88 + 6;
        bh = sl.reachX * 0.68;
      } else {
        bx = sl.facing === 1 ? p.x - 10 : p.x - sl.reachX;
        by = p.y - 42 - sl.reachY * 0.55;
        bw = sl.reachX + 10;
        bh = sl.reachY + 18;
      }

      this.shatterLanternsAndWallsInBox(bx, by, bw, bh, sl.archetype === 'greatsword', 1);

      // 普攻拼刀仅可挑落轻型实体白骨弩矢；重型雷叉、回旋铜斧、咒符与梨园飞针需借重刃猛劈、身法闪避或【太极卸力】化解！
      for (let pi = this.projectiles.length - 1; pi >= 0; pi--) {
        const pr = this.projectiles[pi];
        const canCutWithLight = pr.enemyFx === 'bone_bolt';
        const canCutWithHeavy =
          sl.archetype === 'greatsword' &&
          (pr.enemyFx === 'bone_bolt' ||
            pr.enemyFx === 'opera_needle' ||
            pr.enemyFx === 'cursed_talisman');
        if (pr.fromPlayer || (!canCutWithLight && !canCutWithHeavy)) {
          continue;
        }
        if (
          pr.x + pr.r >= bx &&
          pr.x - pr.r <= bx + bw &&
          pr.y + pr.r >= by &&
          pr.y - pr.r <= by + bh
        ) {
          AudioFX.playParryClang();
          this.slashImpacts.push({
            x: pr.x,
            y: pr.y,
            angle: (Math.random() - 0.5) * 0.9,
            length: 44,
            thickness: 4.5,
            color: pr.color || '#fde047',
            ringRadius: 22,
            life: 0.16,
            maxLife: 0.16,
          });
          this.spawnInkBurst(pr.x, pr.y, pr.color || '#fde047', '#0f172a', 7);
          this.projectiles.splice(pi, 1);
        }
      }

      // 检测是否挥刀劈中【青铜拉杆 / 玄铁重闸 / 五灵共鸣封门 / 剧毒紫瘴铁栅】（兼顾纵向高度匹配）
      const room = this.room;
      if (room.ironGate && !this.slot.brokenSecretWalls.includes(room.ironGate.id)) {
        const g = room.ironGate;
        const gx = g.x;
        const gk = g.gateKind;
        if (gk === 'lever_shortcut') {
          const leverX = gx + (g.leverSide === 'left' ? -64 : 64);
          const onLeverSide = g.leverSide === 'left' ? p.x < gx : p.x > gx;
          if (
            onLeverSide &&
            leverX >= bx - 24 &&
            leverX <= bx + bw + 24 &&
            by + bh >= g.bottomY - 78 &&
            by <= g.bottomY + 12 &&
            !this.slashHitIds.has(-999)
          ) {
            this.slashHitIds.add(-999);
            this.openLeverGate(g.id, gx, g.bottomY);
          }
        }

        if (
          !this.slot.brokenSecretWalls.includes(g.id) &&
          gx >= bx - 14 &&
          gx <= bx + bw + 14 &&
          by + bh >= g.topY &&
          by <= g.bottomY &&
          !this.slashHitIds.has(-999)
        ) {
          this.slashHitIds.add(-999);
          const showGateHint = (text: string, color: string) => {
            AudioFX.playParryClang();
            this.spawnInkBurst(gx, g.bottomY - 64, color, '#0f172a', 12);
            this.floats.push({
              x: gx,
              y: g.bottomY - 110,
              vy: -28,
              text,
              color,
              size: 12,
              life: 0.95,
            });
          };

          if (gk === 'mist_only') {
            showGateHint('需缩地化雾', '#d8b4fe');
          } else if (gk === 'lever_shortcut') {
            const onLeverSide = g.leverSide === 'left' ? p.x < gx : p.x > gx;
            if (onLeverSide) {
              this.openLeverGate(g.id, gx, g.bottomY);
            } else {
              showGateHint('枢机反锁 · 需绕至彼端拉杆', '#fbbf24');
            }
          } else if (gk === 'ice_phoenix') {
            showGateHint('需唤【朱雀丹火】融冰', '#fb923c');
          } else if (gk === 'sluice_tortoise') {
            showGateHint('需唤【玄武镇岳】压枢', '#22d3ee');
          } else if (gk === 'gear_kestrel') {
            showGateHint('需唤【天机木鸢】拨锁', '#facc15');
          } else if (gk === 'illusion_fox') {
            showGateHint('需唤【青丘玉狐】破妄', '#a7f3d0');
          } else if (sl.archetype === 'greatsword') {
            this.slot.brokenSecretWalls.push(g.id);
            AudioFX.playParryClang();
            this.screenShake = 9;
            NativeApp.haptic('heavy');
            this.slashImpacts.push({
              x: gx,
              y: (g.topY + g.bottomY) * 0.5,
              angle: 0.35,
              length: 92,
              thickness: 10,
              color: '#fb923c',
              ringRadius: 58,
              life: 0.28,
              maxLife: 0.28,
            });
            this.spawnInkBurst(gx, g.bottomY - 70, '#fb923c', '#1e293b', 26);
          } else {
            showGateHint('需重刃破闸', '#fde047');
          }
        }
      }

      const wDef = WEAPONS[this.slot.equippedWeapon] || WEAPONS.sword_0;
      for (const e of [...this.enemies]) {
        if (this.slashHitIds.has(e.id)) continue;

        const ex1 = e.x - e.profile.w * 0.55;
        const ex2 = e.x + e.profile.w * 0.55;
        const ey1 = e.y - e.profile.h * 1.25;
        const ey2 = e.y;

        if (ex2 >= bx && ex1 <= bx + bw && ey2 >= by && ey1 <= by + bh) {
          this.slashHitIds.add(e.id);

          let dmgMult = sl.chargedHeavy
            ? 1.78
            : sl.comboStep === 2
              ? 1.32
              : sl.archetype === 'greatsword'
                ? 1.25
                : 1;
          let forceCrit = Boolean(sl.chargedHeavy) || e.aiState === 'staggered';

          if (sl.archetype === 'spear' && Math.abs(e.x - p.x) >= sl.reachX * 0.58) {
            forceCrit = true;
            dmgMult *= 1.35;
          }

          if (sl.archetype === 'daggers' && sl.facing === e.facing) {
            forceCrit = true;
            dmgMult *= 1.55;
          }

          if (sl.archetype === 'whip' && Math.abs(e.x - p.x) >= sl.reachX * 0.55) {
            dmgMult *= 1.22;
            if (!e.profile.isBoss) e.x += sl.facing * 26;
            this.spawnInkBurst(e.x, e.y - e.profile.h * 0.5, '#fde047', '#090d16', 4);
          }

          if (e.aiState === 'staggered') dmgMult *= 1.35;

          let bonusPoiseBreak = 0;
          if (
            e.profile.shieldedFront &&
            e.aiState !== 'staggered' &&
            sl.facing !== e.facing
          ) {
            // 重兵陌刀或任意武器第三式【破军终结斩】皆可强行震碎正盾架势！
            if (sl.archetype === 'greatsword' || sl.comboStep === 2) {
              bonusPoiseBreak = 80;
              e.vx = sl.facing * 185;
              AudioFX.playParryClang();
              this.screenShake = Math.max(this.screenShake, 6);
              this.hitstopTimer = 0.065;
              NativeApp.haptic('heavy');
              this.slashImpacts.push({
                x: e.x,
                y: e.y - 38,
                angle: 0.4 * sl.facing,
                length: 84,
                thickness: 9,
                color: '#fb923c',
                ringRadius: 52,
                life: 0.25,
                maxLife: 0.25,
              });
            } else {
              dmgMult *= 0.25;
              bonusPoiseBreak = -Math.round(wDef.poiseDmg * 0.72);
              AudioFX.playParryClang();
              this.spawnInkBurst(e.x - sl.facing * 14, e.y - 38, '#fde047', '#0f172a', 4);
            }
          } else if (
            e.profile.kind === 'paper_swordsman' &&
            (e.guardStanceTimer || 0) > 0 &&
            e.aiState !== 'staggered' &&
            sl.facing !== e.facing
          ) {
            if (sl.archetype === 'greatsword' || sl.comboStep === 2 || sl.pogoDown) {
              e.guardStanceTimer = 0;
              bonusPoiseBreak = 65;
              AudioFX.playParryClang();
            } else {
              dmgMult *= 0.2;
              bonusPoiseBreak = -Math.round(wDef.poiseDmg * 0.8);
              AudioFX.playParryClang();
              this.spawnInkBurst(e.x - sl.facing * 14, e.y - 36, '#7dd3fc', '#0f172a', 4);
            }
          }

          if (sl.comboStep === 2) {
            this.hitstopTimer = Math.max(this.hitstopTimer, 0.042);
            this.screenShake = Math.max(this.screenShake, 4.2);
          }
          if (sl.weaponId === 'greatsword_sunder') {
            this.screenShake = Math.max(this.screenShake, sl.comboStep === 2 ? 6.5 : 4.2);
          }

          // 以战养气：近战挥砍命中敌人微量回气（抑制无脑连放武技，鼓励节奏攻防！）
          const eqArm = ARMORS[this.slot.equippedArmor] || ARMORS.cloth_tunic;
          const eqAcc = ARMORS[this.slot.equippedAccessory] || ARMORS.broken_jade;
          const eqCore = this.slot.equippedYaoCore ? YAO_CORES[this.slot.equippedYaoCore] : undefined;
          const mpGain = 2.4 + (eqArm.mpOnHitBonus || 0) + (eqAcc.mpOnHitBonus || 0);
          p.mp = Math.min(p.maxMp, p.mp + mpGain);

          let slashForceCrit = forceCrit;
          if (this.perfectDodgeBuffTimer > 0) {
            this.perfectDodgeBuffTimer = 0;
            slashForceCrit = true;
            dmgMult *= 1.2;
            this.floats.push({
              x: e.x,
              y: e.y - e.profile.h * 1.18,
              vy: -48,
              text: '破隙暴击!',
              color: '#2dd4bf',
              size: 13.5,
              life: 0.62,
            });
          }

          const baseHitDmg = Math.round(this.player.atk * dmgMult);
          const finalPoiseDmg = Math.max(
            4,
            Math.round(
              wDef.poiseDmg * (sl.chargedHeavy ? 2.2 : sl.comboStep === 2 ? 1.4 : 1)
            ) +
              bonusPoiseBreak +
              (sl.chargedHeavy ? 60 : 0)
          );
          this.applyDamageToEnemy(e, baseHitDmg, slashForceCrit, finalPoiseDmg);

          // 泣血饮魂妖刀专属腥红血珠飞散特效
          if (wDef.lifestealBonus && wDef.lifestealBonus > 0) {
            this.spawnInkBurst(e.x, e.y - e.profile.h * 0.55, '#ef4444', '#7f1d1d', 4);
          }

          // 神兵专属词条异象触发（霜冻迟缓 / 火毒灼烧 / 千影多段剑气 / 紫电链锁奔雷！）
          if (e.hp > 0) {
            if (wDef.specialEffect === 'frost_slow') {
              e.chillTimer = 2.8;
              this.spawnInkBurst(e.x, e.y - e.profile.h * 0.5, '#38bdf8', '#e0f2fe', 4);
            }
            if (wDef.specialEffect === 'burn_dot' || eqCore?.poisonOnHit) {
              const isPoison = wDef.id === 'daggers_poison' || (!wDef.specialEffect && Boolean(eqCore?.poisonOnHit));
              e.dotTimer = 3.2;
              if ((e.dotTickTimer || 0) <= 0) e.dotTickTimer = 0.48;
              e.dotDmg = Math.max(4, Math.round(this.player.atk * 0.22));
              e.dotColor = isPoison ? '#4ade80' : '#fb923c';
            }
          }

          if (wDef.specialEffect === 'multi_phantom' && e.hp > 0) {
            const echoDmg = Math.max(3, Math.round(baseHitDmg * 0.32));
            for (let ph = 0; ph < 2; ph++) {
              if (e.hp <= 0) break;
              this.slashImpacts.push({
                x: e.x + (ph === 0 ? -14 : 14),
                y: e.y - e.profile.h * (0.42 + ph * 0.24),
                angle: (ph === 0 ? -0.55 : 0.52) * sl.facing,
                length: 38,
                thickness: 3.2,
                color: wDef.glowColor,
                ringRadius: 0,
                life: 0.16 + ph * 0.05,
                maxLife: 0.21,
              });
              this.applyDamageToEnemy(e, echoDmg, false, 6);
            }
          } else if (wDef.specialEffect === 'chain_lightning') {
            let chainTarget: EnemyEntity | null = null;
            let bestDist = 230;
            for (const other of this.enemies) {
              if (other.id === e.id || other.hp <= 0) continue;
              const d = Math.hypot(other.x - e.x, other.y - e.y);
              if (d < bestDist) {
                bestDist = d;
                chainTarget = other;
              }
            }
            if (chainTarget) {
              const arcAngle = Math.atan2(chainTarget.y - e.y, chainTarget.x - e.x);
              this.lightningArcs.push({
                x1: e.x,
                y1: e.y - e.profile.h * 0.55,
                x2: chainTarget.x,
                y2: chainTarget.y - chainTarget.profile.h * 0.55,
                color: '#e879f9',
                life: 0.24,
                maxLife: 0.24,
              });
              this.slashImpacts.push({
                x: (e.x + chainTarget.x) * 0.5,
                y: (e.y + chainTarget.y) * 0.5 - 32,
                angle: arcAngle,
                length: Math.max(48, bestDist * 0.85),
                thickness: 5.5,
                color: '#fde047',
                ringRadius: 0,
                life: 0.22,
                maxLife: 0.22,
              });
              this.spawnInkBurst(
                chainTarget.x,
                chainTarget.y - chainTarget.profile.h * 0.55,
                '#c084fc',
                '#fde047',
                5
              );
              this.applyDamageToEnemy(
                chainTarget,
                Math.max(6, Math.round(this.player.atk * 0.62)),
                false,
                16
              );
            }
          }

          if (sl.pogoDown) {
            p.vy = -525;
            p.airJumpsLeft = this.hasAbility('double_jump') ? 1 : 0;
          }
        }
      }
    }

    if (sl.progress >= 1) {
      this.activeSlash = null;
    }
  }

  private updateOrbitSwords(dt: number): void {
    const p = this.player;
    if (p.orbitSwordTimer <= 0) return;
    p.orbitSwordTimer -= dt;
    p.orbitAngle += dt * 6.8;

    // 护体灵剑持续斩碎靠近的敌方弹幕，并每 0.26s 切割周围妖邪与宫灯！
    const cx = p.x;
    const cy = p.y - 40;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      if (
        !pr.fromPlayer &&
        pr.enemyFx !== 'lava_wave' &&
        pr.enemyFx !== 'venom_pool' &&
        pr.enemyFx !== 'magma_pool' &&
        Math.hypot(pr.x - cx, pr.y - cy) <= 78
      ) {
        this.spawnInkBurst(pr.x, pr.y, '#60a5fa', '#090d16', 6);
        this.projectiles.splice(i, 1);
      }
    }

    this.orbitTickTimer -= dt;
    if (this.orbitTickTimer <= 0) {
      this.orbitTickTimer = 0.26;
      this.shatterLanternsAndWallsInBox(cx - 72, cy - 72, 144, 144, false, 0);
      const orbitDmg = Math.max(8, Math.round(14 + p.int * 1.35));
      for (const e of [...this.enemies]) {
        if (Math.hypot(e.x - cx, e.y - e.profile.h * 0.5 - cy) <= 84) {
          this.applyDamageToEnemy(e, orbitDmg, false, 12);
        }
      }
    }
  }

  private updateProjectiles(dt: number): void {
    if (!this.room) return;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.life -= dt;
      if (pr.life <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      if (pr.orbitParentId !== undefined) {
        const parent = this.enemies.find((en) => en.id === pr.orbitParentId);
        if (parent && pr.orbitReleaseTime !== undefined && pr.life > pr.orbitReleaseTime) {
          pr.orbitAngle = (pr.orbitAngle ?? 0) + (pr.orbitSpeed ?? 2.8) * dt;
          const rad = pr.orbitRadius ?? 78;
          const cy = parent.y - parent.profile.h * 0.54;
          pr.x = parent.x + Math.cos(pr.orbitAngle) * rad;
          pr.y = cy + Math.sin(pr.orbitAngle) * rad;
        } else {
          pr.orbitParentId = undefined;
          const spd = Math.hypot(pr.vx, pr.vy) || 355;
          const ang = Math.atan2(this.player.y - 36 - pr.y, this.player.x - pr.x);
          pr.vx = Math.cos(ang) * spd;
          pr.vy = Math.sin(ang) * spd;
          this.spawnInkBurst(pr.x, pr.y, pr.color, '#090d16', 5);
        }
      } else {
        if (pr.gravity !== undefined) pr.vy += pr.gravity * dt;
        else if (pr.kind === 'holy_fire') pr.vy += 980 * dt;
        else if (pr.kind === 'seal') pr.vy += 1380 * dt;
        else if (
          pr.kind === 'bagua' &&
          !pr.returning &&
          pr.life < pr.maxLife * (pr.returnAtRatio ?? 0.58)
        ) {
          pr.returning = true;
          pr.vx = -pr.vx;
          pr.hitIds.clear();
        }

        if (!pr.fromPlayer && pr.homingRate && pr.homingRate > 0 && pr.life > 0.42) {
          const spd = Math.hypot(pr.vx, pr.vy);
          if (spd > 10) {
            const curA = Math.atan2(pr.vy, pr.vx);
            const tgtA = Math.atan2(this.player.y - 36 - pr.y, this.player.x - pr.x);
            let diff = tgtA - curA;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            const step = Math.max(-pr.homingRate * dt, Math.min(pr.homingRate * dt, diff));
            const nextA = curA + step;
            pr.vx = Math.cos(nextA) * spd;
            pr.vy = Math.sin(nextA) * spd;
          }
        }

        pr.x += pr.vx * dt;
        if (pr.waveAmp && pr.waveFreq) {
          pr.waveBaseY = (pr.waveBaseY ?? pr.y) + pr.vy * dt;
          const elapsed = pr.maxLife - pr.life;
          pr.y = pr.waveBaseY + Math.sin(elapsed * pr.waveFreq + (pr.wavePhase ?? 0)) * pr.waveAmp;
        } else {
          pr.y += pr.vy * dt;
        }
      }

      if (pr.enemyFx === 'lava_wave') {
        if (pr.x < 36 || pr.x > this.room.pixelW - 36) {
          this.spawnInkBurst(pr.x, pr.y, '#fb923c', '#fde047', 6);
          this.projectiles.splice(i, 1);
          continue;
        }
        pr.y = sampleSolidGroundY(this.room, pr.x) - 18;
        if (Math.random() < dt * 24) {
          this.particles.push({
            kind: 'spark',
            x: pr.x + (Math.random() - 0.5) * 18,
            y: pr.y + 12,
            vx: -pr.vx * 0.16 + (Math.random() - 0.5) * 35,
            vy: -45 - Math.random() * 55,
            size: 2.5,
            color: Math.random() < 0.5 ? '#fde047' : '#f97316',
            life: 0.24,
            maxLife: 0.24,
          });
        }
      }

      if (pr.fromPlayer) {
        this.shatterLanternsAndWallsInBox(pr.x - pr.r, pr.y - pr.r, pr.r * 2, pr.r * 2, false, 0);
      }

      const groundY = sampleGroundY(this.room, pr.x);
      if (pr.kind === 'holy_fire' && pr.y >= groundY - 4) {
        if (pr.fromPlayer) {
          for (let k = -1; k <= 1; k++) {
            const fx = pr.x + k * 28;
            this.projectiles.push({
              fromPlayer: true,
              kind: 'fire_pillar',
              x: fx,
              y: sampleGroundY(this.room, fx),
              vx: 0,
              vy: 0,
              r: 22,
              dmg: Math.max(9, Math.round(pr.dmg * 0.55)),
              color: '#f97316',
              life: 1.5,
              maxLife: 1.5,
              pierce: 99,
              hitIds: new Set(),
            });
          }
        } else if (pr.enemyFx === 'venom_glob') {
          // 毒沼金蟾剧毒囊珠落地炸裂为冒泡紫绿腐蚀毒潭（敌方判定，绝不再误伤蛤蟆自身！）
          const gy = sampleGroundY(this.room, pr.x);
          this.spawnInkBurst(pr.x, gy - 4, '#4ade80', '#a855f7', 10);
          this.projectiles.push({
            fromPlayer: false,
            kind: 'fire_pillar',
            enemyFx: 'venom_pool',
            x: pr.x,
            y: gy,
            vx: 0,
            vy: 0,
            r: 24,
            dmg: Math.max(8, Math.round(pr.dmg * 0.72)),
            color: '#4ade80',
            life: 1.35,
            maxLife: 1.35,
            pierce: 99,
            hitIds: new Set(),
          });
        } else {
          // 赤铜熔炉巨灵火弹 / 丹鼎朱砂药葫芦落地溅起赤金烈焰灼烧潭
          const gy = sampleGroundY(this.room, pr.x);
          const isFlask = pr.enemyFx === 'cinnabar_flask';
          this.spawnInkBurst(pr.x, gy - 4, isFlask ? '#ef4444' : '#fb923c', '#fde047', 12);
          this.projectiles.push({
            fromPlayer: false,
            kind: 'fire_pillar',
            enemyFx: 'magma_pool',
            x: pr.x,
            y: gy,
            vx: 0,
            vy: 0,
            r: 24,
            dmg: Math.max(10, Math.round(pr.dmg * 0.75)),
            color: '#fb923c',
            life: 1.3,
            maxLife: 1.3,
            pierce: 99,
            hitIds: new Set(),
          });
        }
        this.projectiles.splice(i, 1);
        continue;
      }

      if (pr.fromPlayer) {
        if (
          pr.kind === 'fire_pillar' &&
          Math.floor(pr.life * 3) !== Math.floor((pr.life + dt) * 3)
        ) {
          pr.hitIds.clear();
        }
        for (const e of [...this.enemies]) {
          if (pr.hitIds.has(e.id)) continue;
          if (
            pr.x + pr.r >= e.x - e.profile.w * 0.55 &&
            pr.x - pr.r <= e.x + e.profile.w * 0.55 &&
            pr.y + pr.r >= e.y - e.profile.h * 1.2 &&
            pr.y - pr.r <= e.y
          ) {
            pr.hitIds.add(e.id);
            const antiAirBonus = pr.kind === 'dagger' && e.profile.flying ? 1.35 : 1;
            const projPoise = pr.kind === 'seal' ? 68 : pr.kind === 'bagua' ? 24 : 16;
            const projAffinity: EnemyWeakness | undefined =
              pr.affinity ??
              (pr.kind === 'seal'
                ? 'heavy'
                : pr.kind === 'bagua'
                  ? 'lightning'
                  : pr.kind === 'fire_pillar' || pr.kind === 'holy_fire' || pr.burnOnHit
                    ? 'fire'
                    : undefined);
            this.applyDamageToEnemy(
              e,
              Math.round(pr.dmg * antiAirBonus),
              antiAirBonus > 1,
              projPoise,
              projAffinity
            );
            if ((pr.kind === 'fire_pillar' || pr.burnOnHit) && e.hp > 0) {
              e.dotTimer = Math.max(e.dotTimer || 0, 2.8);
              if ((e.dotTickTimer || 0) <= 0) e.dotTickTimer = 0.5;
              e.dotDmg = Math.max(4, Math.round(pr.dmg * 0.35));
              e.dotColor = '#fb923c';
            }
            pr.pierce--;
            if (pr.pierce <= 0) {
              this.projectiles.splice(i, 1);
              break;
            }
          }
        }
      } else {
        const p = this.player;
        const effH = p.crouching || p.slideTimer > 0 ? 44 : p.h;
        if (
          Math.abs(pr.x - p.x) < p.w * 0.5 + pr.r &&
          pr.y >= p.y - effH &&
          pr.y <= p.y + 8
        ) {
          if (this.tryTriggerPerfectDodge(pr.x, pr.y)) {
            continue;
          }
          if (p.invulnTimer <= 0 && p.mistDashTimer <= 0) {
            this.damagePlayer(pr.dmg, pr.x < p.x ? 1 : -1);
            pr.pierce--;
            if (pr.pierce <= 0) {
              this.projectiles.splice(i, 1);
            }
          }
        }
      }
    }
  }

  public getShallowWaterSurfaceAt(x: number, y: number): number | null {
    if (!this.room) return null;
    const bridgeGeo = getArchBridgeGeometry(this.room);
    if (bridgeGeo && x >= bridgeGeo.drawX && x <= bridgeGeo.drawX + bridgeGeo.drawW) {
      return null;
    }
    for (const wz of this.room.waterZones) {
      if (wz.liquidKind === 'lava') continue;
      if (x >= wz.x1 + 8 && x <= wz.x2 - 8 && y >= wz.surfaceY - 8 && y <= wz.surfaceY + 56) {
        return wz.surfaceY;
      }
    }
    return null;
  }

  public spawnWaterSplash(x: number, surfaceY: number, count = 6, scale = 1): void {
    this.waterRipples.push({
      x,
      y: surfaceY + 2,
      r: 6 * scale,
      maxR: (34 + Math.random() * 14) * scale,
      alpha: 0.72,
    });
    if (this.waterRipples.length > 28) this.waterRipples.shift();

    for (let i = 0; i < count; i++) {
      const ang = -Math.PI * (0.22 + Math.random() * 0.56);
      const spd = (75 + Math.random() * 95) * scale;
      this.particles.push({
        kind: 'spark',
        x: x + (Math.random() - 0.5) * 14,
        y: surfaceY,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 35,
        size: 2.2 * scale,
        color: i % 2 === 0 ? '#bae6fd' : '#5eead4',
        life: 0.28 + Math.random() * 0.14,
        maxLife: 0.42,
      });
    }
  }

  private updateRoomHazardsAndSlabs(dt: number): void {
    const room = this.room;
    const p = this.player;
    if (!room) return;

    // 1. 水面涟漪扩散衰减
    for (let i = this.waterRipples.length - 1; i >= 0; i--) {
      const rp = this.waterRipples[i];
      rp.r += (rp.maxR - rp.r) * Math.min(1, dt * 6.5) + 18 * dt;
      rp.alpha -= dt * 1.35;
      if (rp.alpha <= 0.02) {
        this.waterRipples.splice(i, 1);
      }
    }

    // 2. 龟裂踏陷青石板状态机（踩踏震颤落尘 0.55s -> 崩塌悬空 3.0s -> 机关复位）
    for (const cs of this.liveCrumbleSlabs) {
      if (cs.state === 'shaking') {
        cs.timer -= dt;
        if (Math.random() < dt * 24) {
          this.particles.push({
            kind: 'ink',
            x: cs.x + Math.random() * cs.w,
            y: cs.y + 8,
            vx: (Math.random() - 0.5) * 28,
            vy: 35 + Math.random() * 45,
            size: 2.6,
            color: '#94a3b8',
            life: 0.34,
            maxLife: 0.34,
          });
        }
        if (cs.timer <= 0) {
          cs.state = 'broken';
          cs.timer = 3.0;
          AudioFX.playLanternBreak();
          this.spawnInkBurst(cs.x + cs.w * 0.5, cs.y + 8, '#94a3b8', '#1e293b', 12);
        }
      } else if (cs.state === 'broken') {
        cs.timer -= dt;
        if (cs.timer <= 0) {
          cs.state = 'solid';
          cs.timer = 0;
        }
      }
    }

    // 3. 区域机关伤害、灵脉升龙风道托举、暗箭连弩机关与武侠拼刀弹开交互
    if (!room.hazards || room.hazards.length === 0) return;

    for (let hi = 0; hi < room.hazards.length; hi++) {
      const hz = room.hazards[hi];
      if (hz.kind === 'updraft') {
        const halfW = (hz.width ?? 82) * 0.5;
        if (Math.random() < dt * 20) {
          this.particles.push({
            kind: 'spark',
            x: hz.x + (Math.random() - 0.5) * (halfW * 1.4),
            y: hz.y - 10 - Math.random() * (hz.span * 0.45),
            vx: (Math.random() - 0.5) * 18,
            vy: -135 - Math.random() * 95,
            size: 2.2,
            color: room.region === 'forge' ? '#fb923c' : '#5eead4',
            life: 0.42,
            maxLife: 0.42,
          });
        }
        if (
          Math.abs(p.x - hz.x) <= halfW &&
          p.y >= hz.y - hz.span &&
          p.y - 44 <= hz.y + 8 &&
          !p.onGround &&
          !p.groundSlamming
        ) {
          p.vy = Math.min(80, p.vy);
          p.vy = Math.max(-420, p.vy - 1750 * dt);
        }
      } else if (hz.kind === 'arrow_trap') {
        const period = hz.speed ?? 3.0;
        const dir: 1 | -1 = hz.dir ?? -1;
        const cycTime = p.animTime + (hz.phase ?? 0);
        const cycIdx = Math.floor(cycTime / period);
        const prevCyc = this.arrowTrapCycles.get(hi);
        const norm = (((cycTime % period) + period) % period) / period;
        if (norm >= 0.72 && norm < 0.97 && Math.random() < dt * 22) {
          this.particles.push({
            kind: 'spark',
            x: hz.x + dir * 10,
            y: hz.y + (Math.random() - 0.5) * 8,
            vx: dir * (28 + Math.random() * 24),
            vy: (Math.random() - 0.5) * 24,
            size: 2.3,
            color: '#fbbf24',
            life: 0.22,
            maxLife: 0.22,
          });
        }
        if (prevCyc === undefined) {
          this.arrowTrapCycles.set(hi, cycIdx);
        } else if (cycIdx !== prevCyc) {
          this.arrowTrapCycles.set(hi, cycIdx);
          if (Math.abs(p.x - hz.x) <= 680) {
            const boltSpeed = 370;
            this.projectiles.push({
              fromPlayer: false,
              kind: 'dagger',
              enemyFx: 'bone_bolt',
              x: hz.x + dir * 20,
              y: hz.y,
              vx: dir * boltSpeed,
              vy: 0,
              r: 9,
              dmg: Math.max(12, Math.round(p.maxHp * 0.09)),
              color: '#f59e0b',
              life: Math.min(2.2, hz.span / boltSpeed),
              maxLife: 2.2,
              pierce: 1,
              hitIds: new Set(),
            });
            AudioFX.playSlash('light');
            this.spawnInkBurst(hz.x + dir * 14, hz.y, '#fbbf24', '#1e293b', 6);
          }
        }
      } else if (hz.kind === 'fire_vent') {
        const period = hz.speed ?? 3.4;
        const cyc = (((p.animTime + (hz.phase ?? 0)) % period) + period) % period;
        const norm = cyc / period;
        // 蓄势火星预警 (0.48..0.68)
        if (norm >= 0.48 && norm < 0.68 && Math.random() < dt * 26) {
          this.particles.push({
            kind: 'spark',
            x: hz.x + (Math.random() - 0.5) * 26,
            y: hz.y - 6,
            vx: (Math.random() - 0.5) * 36,
            vy: -75 - Math.random() * 65,
            size: 2.5,
            color: '#fde047',
            life: 0.28,
            maxLife: 0.28,
          });
        }
        // 烈焰火柱喷发帧 (0.68..0.92)
        if (
          norm >= 0.68 &&
          norm <= 0.92 &&
          Math.abs(p.x - hz.x) <= 24 &&
          p.y >= hz.y - hz.span + 10 &&
          p.y - 54 <= hz.y
        ) {
          if (this.tryTriggerPerfectDodge(hz.x, p.y - 36)) {
            continue;
          }
          if (p.invulnTimer <= 0 && p.mistDashTimer <= 0) {
            this.damagePlayer(
              Math.max(15, Math.round(p.maxHp * 0.12)),
              p.x >= hz.x ? 1 : -1
            );
            p.vy = -390;
            p.onGround = false;
          }
        }
      } else if (hz.kind === 'spikes') {
        if (
          p.invulnTimer <= 0 &&
          p.mistDashTimer <= 0 &&
          p.x >= hz.x + 8 &&
          p.x <= hz.x + hz.span - 8 &&
          p.y >= hz.y - 18 &&
          p.y <= hz.y + 12
        ) {
          this.damagePlayer(
            Math.max(14, Math.round(p.maxHp * 0.1)),
            -p.facing as 1 | -1
          );
          p.vy = -410;
          p.onGround = false;
          this.spawnInkBurst(p.x, hz.y - 10, '#e2e8f0', '#ef4444', 10);
        }
      } else if (hz.kind === 'pendulum') {
        const ang = Math.sin(p.animTime * (hz.speed ?? 1.9) + (hz.phase ?? 0)) * 0.68;
        const bx = hz.x + Math.sin(ang) * hz.span;
        const by = hz.y + Math.cos(ang) * hz.span;
        const heroCenterY = p.y - (p.crouching || p.slideTimer > 0 ? 18 : 34);
        const dist = Math.hypot(p.x - bx, heroCenterY - by);
        if (dist <= 31) {
          // 挥兵瞬间可金铁交鸣借力弹开摆斧，尽显武侠身法！
          if (this.activeSlash && this.activeSlash.progress < 0.62) {
            AudioFX.playParryClang();
            p.vx = (p.x >= bx ? 1 : -1) * 240;
            p.invulnTimer = Math.max(p.invulnTimer, 0.22);
            this.spawnInkBurst(bx, by, '#fde047', '#f97316', 10);
          } else if (this.tryTriggerPerfectDodge(bx, by)) {
            continue;
          } else if (p.invulnTimer <= 0 && p.mistDashTimer <= 0) {
            this.damagePlayer(
              Math.max(16, Math.round(p.maxHp * 0.12)),
              p.x >= bx ? 1 : -1
            );
          }
        }
      }
    }
  }

  private updateSkyStrikes(dt: number): void {
    const p = this.player;
    for (let i = this.skyStrikes.length - 1; i >= 0; i--) {
      const sk = this.skyStrikes[i];
      sk.timer -= dt;
      if (sk.timer <= 0) {
        // 墨枪/天雷/水柱轰落地面！
        this.spawnInkBurst(sk.x, sk.groundY, sk.color || '#38bdf8', '#090d16', 18);
        this.screenShake = Math.max(this.screenShake, 5);
        AudioFX.playSlash('heavy');
        if (Math.abs(p.x - sk.x) < 34 && Math.abs(p.y - sk.groundY) < 90) {
          if (this.tryTriggerPerfectDodge(sk.x, sk.groundY - 32)) {
            // dodged cleanly
          } else if (p.invulnTimer <= 0 && p.mistDashTimer <= 0) {
            this.damagePlayer(sk.dmg, p.x >= sk.x ? 1 : -1);
          }
        }
        this.skyStrikes.splice(i, 1);
      }
    }
  }

  /**
   * 恶魔城月下式智能石台巡逻步进：驻守高台的甲士/刀客不会傻傻走下悬崖、竖井或撞穿实心石壁/铁闸！
   */
  private stepGroundEnemyX(e: EnemyEntity, dx: number): void {
    const room = this.room;
    if (!room || dx === 0) return;

    const candX = Math.max(48, Math.min(room.pixelW - 48, e.x + dx));

    if (
      room.ironGate &&
      this.slot &&
      !this.slot.brokenSecretWalls.includes(room.ironGate.id) &&
      e.y > room.ironGate.topY + 8 &&
      e.y - e.profile.h < room.ironGate.bottomY &&
      Math.abs(candX - room.ironGate.x) < 22
    ) {
      e.vx = 0;
      return;
    }

    if (room.solidBlocks) {
      for (const sb of room.solidBlocks) {
        const actsAsWall =
          Boolean(sb.blocking) || (isGroundRestingSolidBlock(room, sb) && sb.h >= 52);
        if (!actsAsWall) continue;
        if (
          e.y > sb.y + 8 &&
          e.y - e.profile.h < sb.y + sb.h - 4 &&
          candX >= sb.x - 14 &&
          candX <= sb.x + sb.w + 14
        ) {
          e.vx = 0;
          return;
        }
      }
    }

    const nextSurfY = sampleEntitySurfaceY(room, candX, e.y);
    // 悬崖边缘、竖井深坑或无桥深水寒潭前自动收步驻守（石拱桥面正常巡逻！）
    const hasBridge = Boolean(getArchBridgeGeometry(room));
    const intoDeepWater =
      !hasBridge &&
      room.waterZones.some(
        (wz) => candX > wz.x1 + 14 && candX < wz.x2 - 14 && nextSurfY > wz.surfaceY + 10
      );
    if (Math.abs(nextSurfY - e.y) > 24 || intoDeepWater) {
      e.vx = 0;
      return;
    }

    e.x = candX;
    e.y = nextSurfY;
  }

  private startBossAction(
    e: EnemyEntity,
    action: BossActionKind,
    windupDur: number,
    opts?: {
      subSteps?: number;
      targetX?: number;
      targetY?: number;
      flashColor?: string;
    }
  ): void {
    e.aiState = 'windup';
    e.bossAction = action;
    e.stateTimer = windupDur;
    e.stateDuration = windupDur;
    e.bossSubStep = opts?.subSteps ?? 1;
    e.bossTargetX = opts?.targetX;
    e.bossTargetY = opts?.targetY;
    e.bossAuxTimer = 0;
    e.vx = 0;
    e.vy = 0;
    e.slashHitPlayer = false;
    if (opts?.flashColor) {
      this.spawnInkBurst(
        e.x + e.facing * Math.round(e.profile.w * 0.32),
        e.y - Math.round(e.profile.h * 0.55),
        opts.flashColor,
        '#090d16',
        12
      );
    }
  }

  private spawnTwinShockwaves(
    x: number,
    y: number,
    speed: number,
    dmg: number,
    color: string,
    useLavaFx: boolean
  ): void {
    for (const dir of [-1, 1] as const) {
      this.projectiles.push({
        fromPlayer: false,
        kind: 'qi_wave',
        enemyFx: useLavaFx ? 'lava_wave' : undefined,
        x: x + dir * 34,
        y,
        vx: dir * speed,
        vy: 0,
        r: useLavaFx ? 19 : 25,
        dmg,
        color,
        life: 2.1,
        maxLife: 2.1,
        pierce: useLavaFx ? 99 : 1,
        hitIds: new Set(),
      });
    }
  }

  // ==================== 真实多状态前摇博弈 AI（彻底告别傻瓜式平移吐圆球！） ====================
  private updateEnemies(rawEnemyDt: number): void {
    const p = this.player;
    const room = this.room;
    if (!room) return;

    for (const e of [...this.enemies]) {
      if (e.hurtFlash > 0) e.hurtFlash -= rawEnemyDt;
      if (e.hurtJoltTimer && e.hurtJoltTimer > 0) {
        e.hurtJoltTimer = Math.max(0, e.hurtJoltTimer - rawEnemyDt);
      }
      if (e.burrowEmergeTimer && e.burrowEmergeTimer > 0) {
        e.burrowEmergeTimer = Math.max(0, e.burrowEmergeTimer - rawEnemyDt);
      }
      if (e.castAnimTimer && e.castAnimTimer > 0) {
        e.castAnimTimer = Math.max(0, e.castAnimTimer - rawEnemyDt);
      }
      if (e.guardStanceTimer && e.guardStanceTimer > 0) {
        e.guardStanceTimer = Math.max(0, e.guardStanceTimer - rawEnemyDt);
      }
      if ((e.poiseRegenDelay || 0) > 0) {
        e.poiseRegenDelay = Math.max(0, (e.poiseRegenDelay || 0) - rawEnemyDt);
      } else if (e.aiState !== 'staggered' && e.poise < e.maxPoise) {
        e.poise = Math.min(e.maxPoise, e.poise + (e.profile.isBoss ? 22 : 14) * rawEnemyDt);
      }
      if (e.hpTrail > e.hp) {
        e.hpTrail = Math.max(e.hp, e.hpTrail - 85 * rawEnemyDt);
      } else {
        e.hpTrail = e.hp;
      }

      if (e.chillTimer && e.chillTimer > 0) {
        e.chillTimer = Math.max(0, e.chillTimer - rawEnemyDt);
      }

      if (e.dotTimer && e.dotTimer > 0) {
        e.dotTimer = Math.max(0, e.dotTimer - rawEnemyDt);
        e.dotTickTimer = (e.dotTickTimer || 0.5) - rawEnemyDt;
        if (e.dotTickTimer <= 0) {
          e.dotTickTimer = 0.5;
          const tickDmg = Math.max(2, e.dotDmg || 5);
          e.hp -= tickDmg;
          const dCol = e.dotColor || '#fb923c';
          this.spawnInkBurst(e.x, e.y - e.profile.h * 0.5, dCol, '#090d16', 5);
          if (e.hp <= 0) {
            this.handleEnemyKilled(e);
            continue;
          }
        }
      }

      const dt = e.chillTimer && e.chillTimer > 0 ? rawEnemyDt * 0.56 : rawEnemyDt;

      const dx = p.x - e.x;
      const absDx = Math.abs(dx);
      const dy = p.y - e.y;

      if (e.aiState === 'staggered') {
        e.stateTimer -= dt;
        e.vx *= Math.pow(0.01, dt);
        if (e.profile.flying) {
          e.x = Math.max(48, Math.min(room.pixelW - 48, e.x + e.vx * dt));
        } else if (e.profile.isBoss) {
          e.x = Math.max(82, Math.min(room.pixelW - 82, e.x + e.vx * dt));
          const gY = sampleEntitySurfaceY(room, e.x, e.y);
          if (e.y < gY) {
            e.vy += 1500 * dt;
            e.y = Math.min(gY, e.y + e.vy * dt);
            if (e.y >= gY) e.vy = 0;
          } else {
            e.y = gY;
            e.vy = 0;
          }
        } else {
          this.stepGroundEnemyX(e, e.vx * dt);
        }
        if (e.stateTimer <= 0) {
          e.poise = e.maxPoise;
          e.bossAction = undefined;
          e.bossSubStep = 0;
          e.aiState = 'stalk';
          e.stateTimer = 0.55;
        }
        continue;
      }

      if (e.aiState === 'stalk') {
        e.facing = dx >= 0 ? 1 : -1;
        e.stateTimer -= dt;

        if (e.profile.isBoss) {
          // 十大守关妖王 / 宿敌：四阶体型威压 + 各自专属四至五式差异化宗派机制！
          e.animPhase += dt * 4;
          const enraged = e.hp <= e.maxHp * 0.55;
          const bossSurfY = sampleEntitySurfaceY(room, e.x, e.y);
          if (e.profile.flying) {
            const hoverOffset =
              e.profile.kind === 'boss_thunder_yaksha' ||
              e.profile.kind === 'boss_shipyard_leviathan'
                ? 28
                : 22;
            const hoverY = bossSurfY - hoverOffset + Math.sin(e.animPhase) * 9;
            e.y += (hoverY - e.y) * 5 * dt;
          } else {
            e.y = bossSurfY;
          }
          const keepDist =
            e.profile.kind === 'boss_scroll_king' || e.profile.kind === 'boss_opera_god'
              ? 235
              : e.profile.w * 1.45 + 110;
          if (absDx > keepDist) {
            e.vx = e.facing * e.profile.speed * (enraged ? 1.12 : 1);
          } else {
            e.vx *= 0.84;
          }
          e.x = Math.max(90, Math.min(room.pixelW - 90, e.x + e.vx * dt));

          if (e.stateTimer <= 0) {
            const moveCycle = e.profile.kind === 'boss_zhuyin' ? 5 : 4;
            e.bossMoveIdx = (e.bossMoveIdx + 1) % moveCycle;
            const mv = e.bossMoveIdx;

            if (e.profile.kind === 'boss_xiao_duanshui') {
              // 【镇妖司少统领·萧断水】俊逸快枪宗师：0 二/三连疾风破军突刺；1 后空翻腾跃回马枪；2 腾龙破空重坠击；3 蓄势金枪突刺（绝佳弹反口）
              if (mv === 0) {
                this.startBossAction(e, 'multi_dash', enraged ? 0.38 : 0.46, {
                  subSteps: enraged ? 3 : 2,
                  flashColor: '#c084fc',
                });
              } else if (mv === 1) {
                this.startBossAction(e, 'backstep_vault', 0.34, {
                  flashColor: '#fde047',
                });
              } else if (mv === 2) {
                this.startBossAction(e, 'leap_slam', enraged ? 0.42 : 0.5, {
                  targetX: Math.max(115, Math.min(room.pixelW - 115, p.x)),
                  flashColor: '#38bdf8',
                });
              } else {
                this.startBossAction(e, 'lunge', 0.48, { flashColor: '#fde047' });
              }
            } else if (e.profile.kind === 'boss_scroll_king') {
              // 【万卷妖宗·墨千秋】御符阵道：0 周天环绕镇妖符阵依次攒射；1 缩地角遁+缓速追踪咒符；2 高低俯冲洒墨掠斩；3 书卷疾步斩
              if (mv === 0) {
                e.castAnimTimer = 0.42;
                const count = enraged ? 6 : 4;
                const rad = 76;
                for (let idx = 0; idx < count; idx++) {
                  const ang = (idx / count) * Math.PI * 2;
                  const cy = e.y - e.profile.h * 0.54;
                  this.projectiles.push({
                    fromPlayer: false,
                    kind: 'dagger',
                    enemyFx: 'cursed_talisman',
                    x: e.x + Math.cos(ang) * rad,
                    y: cy + Math.sin(ang) * rad,
                    vx: 350,
                    vy: 0,
                    r: 11,
                    dmg: Math.round(e.profile.atk * 0.92),
                    color: '#38bdf8',
                    life: 3.6,
                    maxLife: 3.6,
                    pierce: 1,
                    orbitParentId: e.id,
                    orbitAngle: ang,
                    orbitRadius: rad,
                    orbitSpeed: 2.9,
                    orbitReleaseTime: 2.35 - idx * 0.22,
                    hitIds: new Set(),
                  });
                }
                AudioFX.playSkillCast();
                e.stateTimer = enraged ? 1.5 : 1.75;
              } else if (mv === 1) {
                const farX = e.x < room.pixelW * 0.5 ? room.pixelW - 180 : 180;
                this.spawnInkBurst(e.x, e.y - 52, '#38bdf8', '#090d16', 18);
                e.x = farX;
                e.facing = p.x >= e.x ? 1 : -1;
                this.spawnInkBurst(e.x, e.y - 52, '#c084fc', '#090d16', 18);
                e.castAnimTimer = 0.42;
                const cnt = enraged ? 4 : 3;
                const baseAng = Math.atan2(p.y - 40 - (e.y - 52), p.x - e.x);
                for (let k = 0; k < cnt; k++) {
                  const ang = baseAng + (k - (cnt - 1) * 0.5) * 0.34;
                  this.projectiles.push({
                    fromPlayer: false,
                    kind: 'dagger',
                    enemyFx: 'cursed_talisman',
                    x: e.x + e.facing * 24,
                    y: e.y - 52,
                    vx: Math.cos(ang) * 265,
                    vy: Math.sin(ang) * 265,
                    r: 11,
                    dmg: e.profile.atk,
                    color: '#c084fc',
                    life: 2.6,
                    maxLife: 2.6,
                    pierce: 1,
                    homingRate: 1.95,
                    hitIds: new Set(),
                  });
                }
                AudioFX.playSkillCast();
                e.stateTimer = 1.65;
              } else if (mv === 2) {
                this.startBossAction(e, 'air_sweep', 0.46, {
                  subSteps: 1,
                  flashColor: '#38bdf8',
                });
              } else {
                this.startBossAction(e, 'lunge', 0.5, { flashColor: '#c084fc' });
              }
            } else if (e.profile.kind === 'boss_colosseum_general') {
              // 【镇武大将军·拓跋烈】演武铁血重戟：0 错位高低双回旋大铜钺；1 霸体跃空重戟震地裂；2 旋戟无双推进斩；3 二连裂空重劈
              if (mv === 0) {
                e.castAnimTimer = 0.4;
                const count = enraged ? 2 : 1;
                for (let idx = 0; idx < count; idx++) {
                  const hOff = idx === 0 ? 54 : 92;
                  this.projectiles.push({
                    fromPlayer: false,
                    kind: 'bagua',
                    enemyFx: 'bronze_axe',
                    x: e.x + e.facing * 36,
                    y: e.y - hOff,
                    vx: e.facing * (idx === 0 ? 375 : 315),
                    vy: 0,
                    r: 19,
                    dmg: e.profile.atk,
                    color: '#f59e0b',
                    life: 2.05,
                    maxLife: 2.05,
                    returnAtRatio: idx === 0 ? 0.58 : 0.46,
                    pierce: 2,
                    hitIds: new Set(),
                  });
                }
                AudioFX.playSlash('heavy');
                e.stateTimer = enraged ? 1.35 : 1.55;
              } else if (mv === 1) {
                this.startBossAction(e, 'leap_slam', 0.52, {
                  targetX: Math.max(120, Math.min(room.pixelW - 120, p.x)),
                  flashColor: '#f59e0b',
                });
              } else if (mv === 2) {
                this.startBossAction(e, 'spin_whirl', 0.56, {
                  flashColor: '#ef4444',
                });
              } else {
                this.startBossAction(e, 'multi_dash', 0.48, {
                  subSteps: enraged ? 2 : 1,
                  flashColor: '#f59e0b',
                });
              }
            } else if (e.profile.kind === 'boss_furnace_titan') {
              // 【赤铜镇火巨灵】纯粹百战重甲巨兽（绝不瞬移！）：0 跺地双熔浪+震落穹顶火陨；1 抛射熔岩炮阵；2 巨灵震山高跃践踏；3 蛮牛撞柱破绽冲锋
              if (mv === 0) {
                e.castAnimTimer = 0.48;
                this.screenShake = Math.max(this.screenShake, 9);
                AudioFX.playSlash('heavy');
                NativeApp.haptic('heavy');
                this.spawnInkBurst(e.x, e.y - 10, '#fb923c', '#fde047', 24);
                this.spawnTwinShockwaves(
                  e.x,
                  sampleSolidGroundY(room, e.x) - 18,
                  enraged ? 345 : 295,
                  e.profile.atk,
                  '#f97316',
                  true
                );
                const dropCnt = enraged ? 5 : 3;
                for (let k = 0; k < dropCnt; k++) {
                  const rx = Math.max(
                    130,
                    Math.min(room.pixelW - 130, p.x + (k - (dropCnt - 1) * 0.5) * 145)
                  );
                  this.projectiles.push({
                    fromPlayer: false,
                    kind: 'holy_fire',
                    enemyFx: 'magma_bomb',
                    x: rx,
                    y: Math.max(70, e.y - 290 - (k % 2) * 50),
                    vx: (Math.random() - 0.5) * 40,
                    vy: 85,
                    r: 14,
                    dmg: Math.round(e.profile.atk * 0.92),
                    color: '#fb923c',
                    life: 2.0,
                    maxLife: 2.0,
                    gravity: 680,
                    pierce: 1,
                    hitIds: new Set(),
                  });
                }
                e.stateTimer = enraged ? 1.45 : 1.7;
              } else if (mv === 1) {
                e.castAnimTimer = 0.44;
                const mCnt = enraged ? 6 : 4;
                for (let m = 0; m < mCnt; m++) {
                  this.projectiles.push({
                    fromPlayer: false,
                    kind: 'holy_fire',
                    enemyFx: 'magma_bomb',
                    x: e.x + e.facing * 42,
                    y: e.y - 84,
                    vx: e.facing * (155 + m * 78),
                    vy: -340 - (m % 2) * 75,
                    r: 14,
                    dmg: e.profile.atk,
                    color: '#fb923c',
                    life: 2.0,
                    maxLife: 2.0,
                    pierce: 1,
                    hitIds: new Set(),
                  });
                }
                AudioFX.playSkillCast();
                e.stateTimer = 1.65;
              } else if (mv === 2) {
                this.startBossAction(e, 'leap_slam', 0.6, {
                  targetX: Math.max(135, Math.min(room.pixelW - 135, p.x)),
                  flashColor: '#fb923c',
                });
              } else {
                this.startBossAction(e, 'lunge', 0.64, { flashColor: '#fde047' });
              }
            } else if (e.profile.kind === 'boss_opera_god') {
              // 【惊梦百戏傩神】梨园鬼戏幻宗：0 反相正弦双波金针阵；1 登台召偶/花旦双戏；2 落英幻影二段背刺；3 悬丝天女飞袖掠阵
              if (mv === 0) {
                e.castAnimTimer = 0.4;
                const count = enraged ? 4 : 2;
                for (let n = 0; n < count; n++) {
                  const phase = (n % 2) * Math.PI;
                  this.projectiles.push({
                    fromPlayer: false,
                    kind: 'dagger',
                    enemyFx: 'opera_needle',
                    x: e.x + e.facing * 26,
                    y: e.y - 46 - Math.floor(n / 2) * 32,
                    vx: e.facing * 325,
                    vy: 0,
                    r: 10,
                    dmg: e.profile.atk,
                    color: '#f472b6',
                    life: 2.3,
                    maxLife: 2.3,
                    pierce: 1,
                    waveAmp: 40,
                    waveFreq: 7.4,
                    wavePhase: phase,
                    waveBaseY: e.y - 46 - Math.floor(n / 2) * 32,
                    hitIds: new Set(),
                  });
                }
                AudioFX.playSkillCast();
                e.stateTimer = enraged ? 1.3 : 1.5;
              } else if (mv === 1) {
                e.castAnimTimer = 0.42;
                const activeMinion = this.enemies.some(
                  (o) =>
                    o.profile.kind === 'opera_puppet' ||
                    o.profile.kind === 'opera_sleeve_siren'
                );
                if (!activeMinion) {
                  const minionKind: EnemyKind = enraged ? 'opera_sleeve_siren' : 'opera_puppet';
                  const sx = Math.max(150, Math.min(room.pixelW - 150, e.x + e.facing * 120));
                  const sy =
                    minionKind === 'opera_sleeve_siren'
                      ? Math.max(160, sampleSolidGroundY(room, sx) - 115)
                      : sampleSolidGroundY(room, sx);
                  this.spawnEnemy(minionKind, sx, sy);
                  this.spawnInkBurst(sx, sy - 36, '#f472b6', '#fde047', 16);
                }
                const baseAng = Math.atan2(p.y - 40 - (e.y - 52), p.x - e.x);
                for (let f = -1; f <= 1; f++) {
                  const ang = baseAng + f * 0.24;
                  this.projectiles.push({
                    fromPlayer: false,
                    kind: 'dagger',
                    enemyFx: 'opera_needle',
                    x: e.x + e.facing * 24,
                    y: e.y - 52,
                    vx: Math.cos(ang) * 350,
                    vy: Math.sin(ang) * 350,
                    r: 10,
                    dmg: Math.round(e.profile.atk * 0.9),
                    color: '#f472b6',
                    life: 1.85,
                    maxLife: 1.85,
                    pierce: 1,
                    hitIds: new Set(),
                  });
                }
                AudioFX.playSkillCast();
                e.stateTimer = 1.65;
              } else if (mv === 2) {
                const behindX = Math.max(120, Math.min(room.pixelW - 120, p.x - p.facing * 128));
                this.spawnInkBurst(e.x, e.y - 52, '#f472b6', '#fde047', 16);
                e.x = behindX;
                e.facing = p.x >= e.x ? 1 : -1;
                this.spawnInkBurst(e.x, e.y - 52, '#f472b6', '#fde047', 16);
                this.startBossAction(e, 'multi_dash', 0.48, {
                  subSteps: enraged ? 2 : 1,
                  flashColor: '#f472b6',
                });
              } else {
                this.startBossAction(e, 'air_sweep', 0.46, {
                  subSteps: 1,
                  flashColor: '#f472b6',
                });
              }
            } else if (e.profile.kind === 'boss_shipyard_leviathan') {
              // 【归墟镇海蛟王·敖溟】沧溟龙神四式：0 波涛正弦碎浪弧刃；1 顺序冲天暗潮水柱；2 沧溟斜向狂龙怒坠；3 盘空翻浪散水球
              if (mv === 0) {
                e.castAnimTimer = 0.4;
                const wCnt = enraged ? 4 : 3;
                for (let n = 0; n < wCnt; n++) {
                  const baseY = e.y - 34 - n * 24;
                  this.projectiles.push({
                    fromPlayer: false,
                    kind: 'qi_wave',
                    x: e.x + e.facing * 36,
                    y: baseY,
                    vx: e.facing * (350 - n * 25),
                    vy: 0,
                    r: 22,
                    dmg: e.profile.atk,
                    color: '#22d3ee',
                    life: 2.05,
                    maxLife: 2.05,
                    pierce: 1,
                    waveAmp: 36,
                    waveFreq: 6.2,
                    wavePhase: n * 1.1,
                    waveBaseY: baseY,
                    hitIds: new Set(),
                  });
                }
                AudioFX.playSkillCast();
                e.stateTimer = enraged ? 1.25 : 1.48;
              } else if (mv === 1) {
                e.castAnimTimer = 0.42;
                const cnt = enraged ? 6 : 4;
                for (let k = 0; k < cnt; k++) {
                  const sx = Math.max(
                    115,
                    Math.min(room.pixelW - 115, p.x + (k - (cnt - 1) * 0.5) * 116)
                  );
                  const tWait = 0.62 + k * 0.16;
                  this.skyStrikes.push({
                    x: sx,
                    groundY: sampleGroundY(room, sx),
                    timer: tWait,
                    maxTimer: tWait,
                    dmg: e.profile.atk,
                    color: '#22d3ee',
                    discColor: '#0ea5e9',
                  });
                }
                AudioFX.playSkillCast();
                e.stateTimer = 1.55;
              } else if (mv === 2) {
                this.startBossAction(e, 'dive_bomb', 0.56, {
                  targetX: Math.max(125, Math.min(room.pixelW - 125, p.x)),
                  flashColor: '#22d3ee',
                });
              } else {
                this.startBossAction(e, 'air_sweep', 0.46, {
                  subSteps: 1,
                  flashColor: '#22d3ee',
                });
              }
            } else if (e.profile.kind === 'boss_thunder_yaksha') {
              // 【雷音金翅大鹏王】制空雷禽：0 高空漫天雷叉雨扇；1 陨星高速金雷俯冲爆破；2 九天黄金雷阵落雷；3 往返双掠低空撒雷
              if (mv === 0) {
                e.castAnimTimer = 0.38;
                const half = enraged ? 3 : 2;
                const baseAng = Math.atan2(p.y - 38 - (e.y - 54), p.x - e.x);
                for (let n = -half; n <= half; n++) {
                  const ang = baseAng + n * 0.17;
                  this.projectiles.push({
                    fromPlayer: false,
                    kind: 'dagger',
                    enemyFx: 'thunder_lance',
                    x: e.x + e.facing * 32,
                    y: e.y - 54,
                    vx: Math.cos(ang) * 425,
                    vy: Math.sin(ang) * 425,
                    r: 12,
                    dmg: e.profile.atk,
                    color: '#facc15',
                    life: 1.85,
                    maxLife: 1.85,
                    pierce: 1,
                    hitIds: new Set(),
                  });
                }
                AudioFX.playSkillCast();
                e.stateTimer = enraged ? 1.2 : 1.45;
              } else if (mv === 1) {
                this.startBossAction(e, 'dive_bomb', 0.54, {
                  targetX: Math.max(125, Math.min(room.pixelW - 125, p.x)),
                  flashColor: '#facc15',
                });
              } else if (mv === 2) {
                e.castAnimTimer = 0.42;
                const cnt = enraged ? 6 : 4;
                for (let k = 0; k < cnt; k++) {
                  const sx = Math.max(
                    115,
                    Math.min(room.pixelW - 115, p.x + (k - (cnt - 1) * 0.5) * 122)
                  );
                  const tWait = 0.62 + k * 0.14;
                  this.skyStrikes.push({
                    x: sx,
                    groundY: sampleGroundY(room, sx),
                    timer: tWait,
                    maxTimer: tWait,
                    dmg: e.profile.atk,
                    color: '#facc15',
                    discColor: '#f59e0b',
                  });
                }
                AudioFX.playSkillCast();
                e.stateTimer = 1.55;
              } else {
                this.startBossAction(e, 'air_sweep', 0.44, {
                  subSteps: enraged ? 2 : 1,
                  flashColor: '#facc15',
                });
              }
            } else if (e.profile.kind === 'boss_dragon_warden') {
              // 【守陵太古战魄·刑天】无首重装战神：0 回旋双巨铜钺；1 震陵战神重跃砸地；2 干戚旋转狂风斧；3 盾冲二连破山斧斩+血波
              if (mv === 0) {
                e.castAnimTimer = 0.42;
                for (let idx = 0; idx < 2; idx++) {
                  const hOff = idx === 0 ? 44 : 96;
                  this.projectiles.push({
                    fromPlayer: false,
                    kind: 'bagua',
                    enemyFx: 'bronze_axe',
                    x: e.x + e.facing * 42,
                    y: e.y - hOff,
                    vx: e.facing * (idx === 0 ? 370 : 300),
                    vy: 0,
                    r: 22,
                    dmg: e.profile.atk,
                    color: '#f43f5e',
                    life: 2.15,
                    maxLife: 2.15,
                    returnAtRatio: idx === 0 ? 0.58 : 0.45,
                    pierce: 2,
                    hitIds: new Set(),
                  });
                }
                AudioFX.playSlash('heavy');
                e.stateTimer = enraged ? 1.25 : 1.48;
              } else if (mv === 1) {
                this.startBossAction(e, 'leap_slam', 0.58, {
                  targetX: Math.max(135, Math.min(room.pixelW - 135, p.x)),
                  flashColor: '#f43f5e',
                });
              } else if (mv === 2) {
                this.startBossAction(e, 'spin_whirl', 0.56, {
                  flashColor: '#f59e0b',
                });
              } else {
                this.startBossAction(e, 'multi_dash', 0.5, {
                  subSteps: 2,
                  flashColor: '#f43f5e',
                });
              }
            } else if (e.profile.kind === 'boss_pei_wuji') {
              // 【恩师·堕魔剑魁裴无极】纯粹宗师剑意对决：0 高低错落血月三段剑波；1 缩地瞬身三连拔刀斩；2 升龙跃空血剑震斩；3 疾步后撤漫天赤剑气扇
              if (mv === 0) {
                e.castAnimTimer = 0.4;
                const offsets = [
                  { dy: 28, spd: 465, r: 24, col: '#ef4444' },
                  { dy: 72, spd: 370, r: 24, col: '#f87171' },
                  { dy: 112, spd: 315, r: 22, col: '#fda4af' },
                ];
                for (let wIdx = 0; wIdx < (enraged ? 3 : 2); wIdx++) {
                  const cfg = offsets[wIdx];
                  this.projectiles.push({
                    fromPlayer: false,
                    kind: 'qi_wave',
                    x: e.x + e.facing * 32,
                    y: e.y - cfg.dy,
                    vx: e.facing * cfg.spd,
                    vy: 0,
                    r: cfg.r,
                    dmg: e.profile.atk,
                    color: cfg.col,
                    life: 1.75,
                    maxLife: 1.75,
                    pierce: 1,
                    hitIds: new Set(),
                  });
                }
                AudioFX.playSkillCast();
                e.stateTimer = enraged ? 1.18 : 1.42;
              } else if (mv === 1) {
                const behindX = Math.max(120, Math.min(room.pixelW - 120, p.x - p.facing * 125));
                this.spawnInkBurst(e.x, e.y - 44, '#ef4444', '#090d16', 16);
                e.x = behindX;
                e.y = sampleEntitySurfaceY(room, e.x, e.y);
                e.facing = p.x >= e.x ? 1 : -1;
                this.spawnInkBurst(e.x, e.y - 44, '#ef4444', '#fde047', 16);
                this.startBossAction(e, 'multi_dash', 0.44, {
                  subSteps: enraged ? 3 : 2,
                  flashColor: '#ef4444',
                });
              } else if (mv === 2) {
                this.startBossAction(e, 'leap_slam', 0.48, {
                  targetX: Math.max(115, Math.min(room.pixelW - 115, p.x)),
                  flashColor: '#ef4444',
                });
              } else {
                this.startBossAction(e, 'backstep_vault', 0.34, {
                  flashColor: '#fde047',
                });
              }
            } else {
              // 【九幽冥主·太古尸仙烛阴】终焉五式神威轮转：0 日月轮转蚀光护体星轨射弹；1 烛龙盘空焚世毒炎吐息；2 血月黄金极光天柱阵；3 九幽灭世俯冲砸击；4 撕裂阴阳二连赤月波斩
              if (mv === 0) {
                e.castAnimTimer = 0.46;
                const count = enraged ? 8 : 6;
                const rad = 96;
                for (let idx = 0; idx < count; idx++) {
                  const ang = (idx / count) * Math.PI * 2;
                  const cy = e.y - e.profile.h * 0.55;
                  const isGold = idx % 2 === 0;
                  this.projectiles.push({
                    fromPlayer: false,
                    kind: 'dagger',
                    enemyFx: isGold ? 'thunder_lance' : 'cursed_talisman',
                    x: e.x + Math.cos(ang) * rad,
                    y: cy + Math.sin(ang) * rad,
                    vx: 385,
                    vy: 0,
                    r: 12,
                    dmg: Math.round(e.profile.atk * 0.92),
                    color: isGold ? '#fbbf24' : '#f43f5e',
                    life: 3.9,
                    maxLife: 3.9,
                    pierce: 1,
                    orbitParentId: e.id,
                    orbitAngle: ang,
                    orbitRadius: rad,
                    orbitSpeed: isGold ? 2.8 : -2.8,
                    orbitReleaseTime: 2.55 - idx * 0.2,
                    hitIds: new Set(),
                  });
                }
                AudioFX.playSkillCast();
                e.stateTimer = enraged ? 1.55 : 1.85;
              } else if (mv === 1) {
                this.startBossAction(e, 'air_sweep', 0.48, {
                  subSteps: 1,
                  flashColor: '#f43f5e',
                });
              } else if (mv === 2) {
                e.castAnimTimer = 0.44;
                const cnt = enraged ? 7 : 5;
                for (let k = 0; k < cnt; k++) {
                  const sx = Math.max(
                    115,
                    Math.min(room.pixelW - 115, p.x + (k - (cnt - 1) * 0.5) * 112)
                  );
                  const tWait = 0.62 + k * 0.13;
                  this.skyStrikes.push({
                    x: sx,
                    groundY: sampleGroundY(room, sx),
                    timer: tWait,
                    maxTimer: tWait,
                    dmg: e.profile.atk,
                    color: '#f43f5e',
                    discColor: '#fbbf24',
                  });
                }
                AudioFX.playSkillCast();
                e.stateTimer = 1.6;
              } else if (mv === 3) {
                this.startBossAction(e, 'dive_bomb', 0.58, {
                  targetX: Math.max(135, Math.min(room.pixelW - 135, p.x)),
                  flashColor: '#f43f5e',
                });
              } else {
                this.startBossAction(e, 'multi_dash', 0.5, {
                  subSteps: enraged ? 2 : 1,
                  flashColor: '#fde047',
                });
              }
            }
          }
        } else if (e.profile.flying) {
          if (e.roosting) {
            // 玄冥三足阴鸦：敛翼栖驻于飞檐横梁，待少侠踏入索敌圈瞬间振翼惊起俯冲！
            e.vx = 0;
            if (absDx < 330 && Math.abs(dy) < 285) {
              e.roosting = false;
              e.stateTimer = 0.34;
              this.spawnInkBurst(e.x, e.y - 18, '#10b981', '#090d16', 8);
              AudioFX.playSlash('light');
            }
            continue;
          }
          e.animPhase += dt * (e.profile.kind === 'spirit_crow' ? 7.4 : 4.6);
          if (e.profile.kind === 'spirit_crow') {
            // 三足阴鸦动态锁定少侠胸腹高度盘旋掠袭！
            const targetBaseY = Math.max(82, Math.min(room.pixelH - 72, p.y - 44));
            e.baseY += (targetBaseY - e.baseY) * Math.min(1, dt * 3.1);
          }
          const waveAmp =
            e.profile.kind === 'bell_gargoyle' || e.profile.kind === 'celestial_sentinel'
              ? 32
              : e.profile.kind === 'opera_sleeve_siren'
                ? 28
                : e.profile.kind === 'bronze_gear_wisp'
                  ? 22
                  : e.profile.kind === 'spirit_crow' || e.profile.kind === 'drowned_corpse_bride'
                    ? 15
                    : 18;
          e.y = e.baseY + Math.sin(e.animPhase) * waveAmp;
          const minFlyDist =
            e.profile.kind === 'spirit_crow' || e.profile.kind === 'drowned_corpse_bride' ? 60 : 95;
          if (e.profile.kind === 'opera_sleeve_siren' && absDx < 360) {
            // 百戏水袖花旦：水袖蝶步 8 字缠绕滑翔！
            e.vx = Math.cos(e.animPhase * 0.72) * e.profile.speed * 0.85 + e.facing * 42;
            e.x = Math.max(54, Math.min(room.pixelW - 54, e.x + e.vx * dt));
          } else if (absDx < 480 && absDx > minFlyDist) {
            e.vx = e.facing * e.profile.speed;
            e.x = Math.max(54, Math.min(room.pixelW - 54, e.x + e.vx * dt));
          }
          if (e.stateTimer <= 0 && absDx < 420) {
            const fk = e.profile.kind;
            if (fk === 'drowned_corpse_bride') {
              // 寒渊沉尸怨灵：0 怨雾闪烁瞬移换位+追踪怨魄；1 双发寒霜冰泣弹！
              e.castAnimTimer = 0.4;
              e.bossMoveIdx = (e.bossMoveIdx + 1) % 2;
              if (e.bossMoveIdx === 0) {
                const blinkX = Math.max(
                  75,
                  Math.min(room.pixelW - 75, p.x + (dx >= 0 ? 142 : -142))
                );
                this.spawnInkBurst(e.x, e.y - 26, '#67e8f9', '#0f766e', 14);
                e.x = blinkX;
                e.facing = p.x >= e.x ? 1 : -1;
                this.spawnInkBurst(e.x, e.y - 26, '#67e8f9', '#0f766e', 14);
                const ang = Math.atan2(p.y - 38 - (e.y - 26), p.x - e.x);
                for (const off of [-0.28, 0.28]) {
                  this.projectiles.push({
                    fromPlayer: false,
                    kind: 'dagger',
                    enemyFx: 'cursed_talisman',
                    x: e.x + e.facing * 16,
                    y: e.y - 26,
                    vx: Math.cos(ang + off) * 235,
                    vy: Math.sin(ang + off) * 235,
                    r: 10,
                    dmg: Math.round(e.profile.atk * 0.92),
                    color: '#67e8f9',
                    life: 2.3,
                    maxLife: 2.3,
                    pierce: 1,
                    homingRate: 1.55,
                    hitIds: new Set(),
                  });
                }
              } else {
                for (const yOff of [-12, 16]) {
                  this.projectiles.push({
                    fromPlayer: false,
                    kind: 'dagger',
                    enemyFx: 'cursed_talisman',
                    x: e.x + e.facing * 18,
                    y: e.y - 24 + yOff,
                    vx: e.facing * 335,
                    vy: 0,
                    r: 9,
                    dmg: e.profile.atk,
                    color: '#22d3ee',
                    life: 1.75,
                    maxLife: 1.75,
                    pierce: 1,
                    hitIds: new Set(),
                  });
                }
              }
              AudioFX.playSkillCast();
              e.stateTimer = 1.65;
            } else if (fk === 'opera_sleeve_siren') {
              // 百戏水袖花旦：反相正弦螺旋绸浪金针！
              e.castAnimTimer = 0.38;
              for (const phase of [0, Math.PI]) {
                this.projectiles.push({
                  fromPlayer: false,
                  kind: 'dagger',
                  enemyFx: 'opera_needle',
                  x: e.x + e.facing * 20,
                  y: e.y - 26,
                  vx: e.facing * 315,
                  vy: 0,
                  r: 9,
                  dmg: Math.round(e.profile.atk * 0.94),
                  color: '#f472b6',
                  life: 2.1,
                  maxLife: 2.1,
                  pierce: 1,
                  waveAmp: 34,
                  waveFreq: 8.0,
                  wavePhase: phase,
                  waveBaseY: e.y - 26,
                  hitIds: new Set(),
                });
              }
              this.spawnInkBurst(e.x + e.facing * 18, e.y - 24, '#f472b6', '#9f1239', 8);
              AudioFX.playSlash('light');
              e.stateTimer = 1.6;
            } else if (fk === 'bronze_gear_wisp') {
              // 浑天铜轮机灵：十字 <-> 斜叉交替四向旋转铜齿轮齐射！
              e.castAnimTimer = 0.38;
              e.bossMoveIdx = (e.bossMoveIdx + 1) % 2;
              const baseRot = e.bossMoveIdx === 0 ? 0 : Math.PI * 0.25;
              for (let k = 0; k < 4; k++) {
                const a = baseRot + k * Math.PI * 0.5;
                this.projectiles.push({
                  fromPlayer: false,
                  kind: 'dagger',
                  enemyFx: 'bronze_gear',
                  x: e.x,
                  y: e.y - 24,
                  vx: Math.cos(a) * 245,
                  vy: Math.sin(a) * 245,
                  r: 12,
                  dmg: e.profile.atk,
                  color: '#22d3ee',
                  life: 2.0,
                  maxLife: 2.0,
                  pierce: 1,
                  hitIds: new Set(),
                });
              }
              this.spawnInkBurst(e.x, e.y - 24, '#22d3ee', '#78350f', 9);
              AudioFX.playSlash('heavy');
              e.stateTimer = 1.7;
            } else if (fk === 'celestial_sentinel') {
              // 凌霄金甲天将：0 金甲天降俯冲掠袭；1 三连金矛+黄金天雷柱！
              e.bossMoveIdx = (e.bossMoveIdx + 1) % 2;
              if (e.bossMoveIdx === 0 && absDx < 320) {
                e.aiState = 'windup';
                e.stateTimer = 0.44;
                e.stateDuration = 0.44;
                e.bossAction = 'dive_bomb';
                e.bossTargetX = Math.max(70, Math.min(room.pixelW - 70, p.x));
                e.bossTargetY = sampleSolidGroundY(room, e.bossTargetX);
                e.vx = 0;
                e.slashHitPlayer = false;
                this.spawnInkBurst(e.x, e.y - 28, '#fde047', '#a16207', 12);
              } else {
                e.castAnimTimer = 0.38;
                const ang = Math.atan2(p.y - 42 - (e.y - 26), p.x - e.x);
                for (const offAng of [-0.16, 0, 0.16]) {
                  const a = ang + offAng;
                  this.projectiles.push({
                    fromPlayer: false,
                    kind: 'dagger',
                    enemyFx: 'thunder_lance',
                    x: e.x + e.facing * 20,
                    y: e.y - 26,
                    vx: Math.cos(a) * 415,
                    vy: Math.sin(a) * 415,
                    r: 10,
                    dmg: e.profile.atk,
                    color: '#fde047',
                    life: 1.8,
                    maxLife: 1.8,
                    pierce: 1,
                    hitIds: new Set(),
                  });
                }
                const sx = Math.max(95, Math.min(room.pixelW - 95, p.x));
                this.skyStrikes.push({
                  x: sx,
                  groundY: sampleGroundY(room, sx),
                  timer: 0.78,
                  maxTimer: 0.78,
                  dmg: Math.round(e.profile.atk * 1.08),
                  color: '#facc15',
                  discColor: '#f59e0b',
                });
                this.spawnInkBurst(e.x + e.facing * 18, e.y - 24, '#fde047', '#a16207', 8);
                AudioFX.playSkillCast();
                e.stateTimer = 1.7;
              }
            } else if (e.profile.ranged) {
              const isGargoyle = fk === 'bell_gargoyle' || fk === 'guixu_water_fiend';
              const isWaterFiend = fk === 'guixu_water_fiend';
              const isWuchang = fk === 'wuchang_reaper';
              const ang = Math.atan2(p.y - 42 - (e.y - 24), p.x - e.x);
              const spd = isGargoyle ? 415 : isWuchang ? 365 : 320;
              e.castAnimTimer = 0.36;
              const isLateStage =
                room.realm === 'inverted' ||
                (room.region !== 'gatehouse' &&
                  room.region !== 'main_hall' &&
                  room.region !== 'alchemy');
              const spreadOffsets =
                isGargoyle || isWuchang ? [-0.12, 0.12] : isLateStage ? [-0.22, 0, 0.22] : [0];
              const projFx = isGargoyle ? 'thunder_lance' : 'cursed_talisman';
              const projColor = isWaterFiend
                ? '#22d3ee'
                : isGargoyle
                  ? '#facc15'
                  : isWuchang
                    ? '#c084fc'
                    : '#ef4444';
              for (const offAng of spreadOffsets) {
                const a = ang + offAng;
                this.projectiles.push({
                  fromPlayer: false,
                  kind: 'dagger',
                  enemyFx: projFx,
                  x: e.x + e.facing * 18,
                  y: e.y - 24,
                  vx: Math.cos(a) * spd,
                  vy: Math.sin(a) * spd,
                  r: isGargoyle ? 10 : 9,
                  dmg: e.profile.atk,
                  color: projColor,
                  life: 1.85,
                  maxLife: 1.85,
                  pierce: 1,
                  hitIds: new Set(),
                });
              }
              if (isGargoyle && isLateStage) {
                const sx = Math.max(95, Math.min(room.pixelW - 95, p.x));
                this.skyStrikes.push({
                  x: sx,
                  groundY: sampleGroundY(room, sx),
                  timer: 0.78,
                  maxTimer: 0.78,
                  dmg: Math.round(e.profile.atk * 1.08),
                });
              }
              this.spawnInkBurst(
                e.x + e.facing * 18,
                e.y - 24,
                projColor,
                isWaterFiend ? '#0f766e' : isGargoyle ? '#38bdf8' : '#090d16',
                6
              );
              AudioFX.playSlash('light');
              e.stateTimer = isGargoyle ? 1.55 : 1.5;
            } else if (absDx < 225) {
              e.aiState = 'windup';
              const crowWind = e.profile.kind === 'spirit_crow' ? 0.34 : 0.46;
              e.stateTimer = crowWind;
              e.stateDuration = crowWind;
              e.slashHitPlayer = false;
            }
          }
        } else {
          // 破土荒冢阴兵：少侠踏近 385px 时从泥土砖缝中破土钻出！
          if (e.profile.kind === 'corpse_soldier' && !e.burrowTriggered && absDx < 385) {
            e.burrowTriggered = true;
            e.burrowEmergeTimer = 0.55;
            e.stateTimer = Math.max(e.stateTimer, 0.72);
            this.spawnInkBurst(e.x, e.y - 4, '#78716c', '#1c1917', 12);
          }
          if ((e.burrowEmergeTimer || 0) > 0) {
            e.vx = 0;
            continue;
          }

          // 地面妖邪差异化 AI：金蟾高跃毒潭、药傀后跳双瓶、矿奴跃空裂石、妖道周天符阵、巨傀震地火泉、狱卒锁链寒槌、书魔游龙狂草+墨遁、螳螂齿轮+双剪、秦俑重戟破空！
          const curSurfY = sampleEntitySurfaceY(room, e.x, e.y);
          if (
            e.profile.kind === 'plague_toad' ||
            ((e.profile.kind === 'alchemy_homunculus' || e.profile.kind === 'mine_pickaxe_ghoul') &&
              (e.vy !== 0 || e.y < curSurfY - 2))
          ) {
            const isToad = e.profile.kind === 'plague_toad';
            const isGhoul = e.profile.kind === 'mine_pickaxe_ghoul';
            if (e.vy !== 0 || e.y < curSurfY - 2) {
              e.vy += 1260 * dt;
              e.x = Math.max(50, Math.min(room.pixelW - 50, e.x + e.vx * dt));
              const gy = sampleEntitySurfaceY(room, e.x, e.y);
              if (e.y + e.vy * dt >= gy) {
                if (e.vy > 180) {
                  this.spawnInkBurst(
                    e.x,
                    gy - 3,
                    isGhoul ? '#f59e0b' : isToad ? '#4ade80' : '#ef4444',
                    '#1e1b4b',
                    8
                  );
                }
                e.y = gy;
                e.vy = 0;
                e.vx = 0;
                if (isGhoul) {
                  AudioFX.playSlash('heavy');
                  this.projectiles.push({
                    fromPlayer: false,
                    kind: 'holy_fire',
                    enemyFx: 'magma_bomb',
                    x: e.x + e.facing * 20,
                    y: gy - 20,
                    vx: e.facing * 225,
                    vy: -295,
                    r: 8,
                    dmg: Math.round(e.profile.atk * 0.85),
                    color: '#f59e0b',
                    life: 1.25,
                    maxLife: 1.25,
                    pierce: 1,
                    hitIds: new Set(),
                  });
                  this.projectiles.push({
                    fromPlayer: false,
                    kind: 'dagger',
                    enemyFx: 'bone_bolt',
                    x: e.x + e.facing * 22,
                    y: gy - 26,
                    vx: e.facing * 355,
                    vy: 0,
                    r: 8,
                    dmg: Math.round(e.profile.atk * 0.82),
                    color: '#fde047',
                    life: 1.15,
                    maxLife: 1.15,
                    pierce: 1,
                    hitIds: new Set(),
                  });
                }
              } else {
                e.y += e.vy * dt;
              }
            } else if (e.stateTimer <= 0 && absDx < 420) {
              e.vy = -450;
              e.vx = e.facing * 230;
              e.stateTimer = 1.45;
              e.castAnimTimer = 0.38;
              this.spawnInkBurst(e.x + e.facing * 18, e.y - 22, '#4ade80', '#a855f7', 7);
              this.projectiles.push({
                fromPlayer: false,
                kind: 'holy_fire',
                enemyFx: 'venom_glob',
                x: e.x + e.facing * 18,
                y: e.y - 22,
                vx: e.facing * 240,
                vy: -260,
                r: 10,
                dmg: e.profile.atk,
                color: '#a855f7',
                life: 1.45,
                maxLife: 1.45,
                pierce: 1,
                hitIds: new Set(),
              });
            }
          } else {
            // 纸人剑客战术博弈：正面察觉少侠挥轻刀时自动横刀架挡 0.65s（引导少侠翻滚绕背、跳劈或重斩破架！）
            if (
              e.profile.kind === 'paper_swordsman' &&
              this.activeSlash &&
              absDx < 155 &&
              Math.abs(dy) < 75 &&
              dx * e.facing > 0 &&
              (e.guardStanceTimer || 0) <= 0 &&
              e.stateTimer > 0.2
            ) {
              e.guardStanceTimer = 0.65;
              e.vx = 0;
            }

            const gk = e.profile.kind;
            const isKiteCaster =
              gk === 'bone_archer' ||
              gk === 'shenji_musketeer' ||
              gk === 'taoist_talisman_priest' ||
              gk === 'alchemy_homunculus';
            const attackRange = isKiteCaster
              ? 285
              : gk === 'ink_brush_scholar'
                ? 245
                : gk === 'demon_wolf' || gk === 'bixie_stone_beast' || gk === 'clockwork_mantis'
                  ? 200
                  : gk === 'terracotta_halberdier'
                    ? 235
                    : gk === 'paper_swordsman'
                      ? 175
                      : gk === 'frost_chain_jailer'
                        ? 150
                        : gk === 'magma_crucible_golem'
                          ? 145
                          : e.profile.shieldedFront || gk === 'jinwu_mace_guard'
                            ? 98
                            : 108;
            if ((e.guardStanceTimer || 0) > 0) {
              e.vx = 0;
            } else if (gk === 'alchemy_homunculus' && absDx < 95 && e.stateTimer <= 0.35) {
              e.vy = -295;
              e.vx = -e.facing * 235;
              e.y = curSurfY - 3;
              e.stateTimer = 1.25;
              continue;
            } else if (isKiteCaster && absDx < 125) {
              e.vx = -e.facing * e.profile.speed * 0.85;
              e.animPhase += dt * 8;
            } else if (absDx < 460 && absDx > attackRange) {
              e.vx = e.facing * e.profile.speed;
              e.animPhase += dt * 10;
            } else if (absDx >= 460) {
              e.vx = Math.sin(p.animTime + e.id) * 45;
              e.facing = e.vx >= 0 ? 1 : -1;
              e.animPhase += dt * 4;
            } else {
              e.vx = 0;
            }

            this.stepGroundEnemyX(e, e.vx * dt);

            if (gk === 'alchemy_homunculus' && e.stateTimer <= 0 && absDx >= 90 && absDx < 395) {
              // 丹鼎朱砂药傀：止步抛掷高低双发朱砂爆裂药瓶！
              e.castAnimTimer = 0.4;
              for (const cfg of [
                { vx: 210, vy: -345 },
                { vx: 325, vy: -395 },
              ]) {
                this.projectiles.push({
                  fromPlayer: false,
                  kind: 'holy_fire',
                  enemyFx: 'cinnabar_flask',
                  x: e.x + e.facing * 18,
                  y: e.y - 26,
                  vx: e.facing * cfg.vx,
                  vy: cfg.vy,
                  r: 10,
                  dmg: Math.round(e.profile.atk * 0.92),
                  color: '#ef4444',
                  life: 1.6,
                  maxLife: 1.6,
                  gravity: 960,
                  pierce: 1,
                  hitIds: new Set(),
                });
              }
              this.spawnInkBurst(e.x + e.facing * 18, e.y - 26, '#ef4444', '#fb923c', 8);
              AudioFX.playSkillCast();
              e.stateTimer = 1.75;
            } else if (gk === 'taoist_talisman_priest' && e.stateTimer <= 0 && absDx < 440) {
              // 镇魔符箓妖道：0 周天三枚护身咒符依次攒射；1 红金天雷镇魂柱！
              e.castAnimTimer = 0.4;
              e.bossMoveIdx = (e.bossMoveIdx + 1) % 2;
              if (e.bossMoveIdx === 0) {
                for (let idx = 0; idx < 3; idx++) {
                  const ang = (idx / 3) * Math.PI * 2;
                  const rad = 46;
                  this.projectiles.push({
                    fromPlayer: false,
                    kind: 'dagger',
                    enemyFx: 'cursed_talisman',
                    x: e.x + Math.cos(ang) * rad,
                    y: e.y - e.profile.h * 0.54 + Math.sin(ang) * rad,
                    vx: 335,
                    vy: 0,
                    r: 9,
                    dmg: Math.round(e.profile.atk * 0.9),
                    color: '#ef4444',
                    life: 3.3,
                    maxLife: 3.3,
                    pierce: 1,
                    orbitParentId: e.id,
                    orbitAngle: ang,
                    orbitRadius: rad,
                    orbitSpeed: 3.3,
                    orbitReleaseTime: 2.35 - idx * 0.25,
                    hitIds: new Set(),
                  });
                }
              } else {
                const sx = Math.max(85, Math.min(room.pixelW - 85, p.x));
                this.skyStrikes.push({
                  x: sx,
                  groundY: sampleGroundY(room, sx),
                  timer: 0.74,
                  maxTimer: 0.74,
                  dmg: Math.round(e.profile.atk * 1.12),
                  color: '#ef4444',
                  discColor: '#fde047',
                });
              }
              this.spawnInkBurst(e.x + e.facing * 20, e.y - 38, '#fde047', '#dc2626', 8);
              AudioFX.playSkillCast();
              e.stateTimer = 1.85;
            } else if (
              gk === 'ink_brush_scholar' &&
              e.stateTimer <= 0 &&
              absDx < 395 &&
              Math.abs(dy) < 110
            ) {
              if (absDx < 115) {
                // 翰林执笔书魔：近身触发墨遁闪避！原地泼墨后闪身拉开！
                this.spawnInkBurst(e.x, e.y - 34, '#38bdf8', '#090d16', 14);
                this.stepGroundEnemyX(e, -e.facing * 115);
                this.spawnInkBurst(e.x, e.y - 34, '#38bdf8', '#090d16', 10);
                this.projectiles.push({
                  fromPlayer: false,
                  kind: 'holy_fire',
                  enemyFx: 'magma_bomb',
                  x: e.x,
                  y: e.y - 36,
                  vx: e.facing * 120,
                  vy: -260,
                  r: 9,
                  dmg: Math.round(e.profile.atk * 0.85),
                  color: '#38bdf8',
                  life: 1.25,
                  maxLife: 1.25,
                  pierce: 1,
                  hitIds: new Set(),
                });
                AudioFX.playSlash('light');
                e.stateTimer = 1.45;
              } else {
                e.castAnimTimer = 0.38;
                const yMid = e.y - 40;
                this.projectiles.push({
                  fromPlayer: false,
                  kind: 'qi_wave',
                  enemyFx: 'ink_calligraphy',
                  x: e.x + e.facing * 24,
                  y: yMid,
                  vx: e.facing * 335,
                  vy: 0,
                  r: 15,
                  dmg: e.profile.atk,
                  color: '#38bdf8',
                  life: 1.85,
                  maxLife: 1.85,
                  pierce: 2,
                  waveAmp: 28,
                  waveFreq: 6.8,
                  wavePhase: 0,
                  waveBaseY: yMid,
                  hitIds: new Set(),
                });
                this.spawnInkBurst(e.x + e.facing * 24, yMid, '#38bdf8', '#090d16', 9);
                AudioFX.playSlash('spear');
                e.stateTimer = 1.58;
              }
            } else if (
              gk === 'magma_crucible_golem' &&
              e.stateTimer <= 0 &&
              absDx < 275 &&
              Math.abs(dy) < 105
            ) {
              // 地肺熔金巨傀：重拳震地迸发双侧熔岩地波 + 喷溅两枚火山火陨！
              e.castAnimTimer = 0.48;
              this.screenShake = Math.max(this.screenShake, 4.5);
              const surfY = sampleSolidGroundY(room, e.x);
              this.spawnTwinShockwaves(
                e.x,
                surfY - 18,
                310,
                Math.round(e.profile.atk * 0.96),
                '#f97316',
                true
              );
              for (const dir of [-1, 1]) {
                this.projectiles.push({
                  fromPlayer: false,
                  kind: 'holy_fire',
                  enemyFx: 'magma_bomb',
                  x: e.x + dir * 20,
                  y: surfY - 46,
                  vx: dir * 115,
                  vy: -435,
                  r: 10,
                  dmg: Math.round(e.profile.atk * 0.88),
                  color: '#fb923c',
                  life: 1.65,
                  maxLife: 1.65,
                  pierce: 1,
                  hitIds: new Set(),
                });
              }
              this.spawnInkBurst(e.x, surfY - 12, '#fb923c', '#7c2d12', 14);
              AudioFX.playSlash('heavy');
              e.stateTimer = 2.05;
            } else if (
              gk === 'mine_pickaxe_ghoul' &&
              e.stateTimer <= 0 &&
              absDx > 85 &&
              absDx < 255 &&
              Math.abs(dy) < 95
            ) {
              // 古矿赤铜矿奴：助跑高跃重镐劈地！
              e.vy = -345;
              e.vx = e.facing * 255;
              e.y = curSurfY - 3;
              e.castAnimTimer = 0.42;
              AudioFX.playJump();
              continue;
            } else if (
              gk === 'frost_chain_jailer' &&
              e.stateTimer <= 0 &&
              absDx > 105 &&
              absDx < 325 &&
              Math.abs(dy) < 95
            ) {
              // 寒潭玄铁狱卒：铁链牵引寒霜链槌高低交替甩击折返！
              e.castAnimTimer = 0.4;
              e.bossMoveIdx = (e.bossMoveIdx + 1) % 2;
              const flailY = e.bossMoveIdx === 0 ? e.y - 18 : e.y - 52;
              this.projectiles.push({
                fromPlayer: false,
                ownerId: e.id,
                kind: 'bagua',
                enemyFx: 'frost_flail',
                x: e.x + e.facing * 24,
                y: flailY,
                vx: e.facing * 380,
                vy: 0,
                r: 13,
                dmg: e.profile.atk,
                color: '#38bdf8',
                life: 1.45,
                maxLife: 1.45,
                returnAtRatio: 0.52,
                pierce: 1,
                hitIds: new Set(),
              });
              this.spawnInkBurst(e.x + e.facing * 24, flailY, '#38bdf8', '#0f172a', 8);
              AudioFX.playSlash('heavy');
              e.stateTimer = 1.8;
            } else if (
              gk === 'clockwork_mantis' &&
              e.stateTimer <= 0 &&
              absDx >= 195 &&
              absDx < 345 &&
              Math.abs(dy) < 95
            ) {
              // 墨家青铜螳螂：中距离弹射旋转青铜机括锯齿飞轮！
              e.castAnimTimer = 0.36;
              this.projectiles.push({
                fromPlayer: false,
                kind: 'bagua',
                enemyFx: 'bronze_gear',
                x: e.x + e.facing * 22,
                y: e.y - 32,
                vx: e.facing * 350,
                vy: 0,
                r: 12,
                dmg: e.profile.atk,
                color: '#fbbf24',
                life: 1.5,
                maxLife: 1.5,
                returnAtRatio: 0.56,
                pierce: 1,
                hitIds: new Set(),
              });
              this.spawnInkBurst(e.x + e.facing * 22, e.y - 32, '#22d3ee', '#fbbf24', 7);
              AudioFX.playSlash('light');
              e.stateTimer = 1.65;
            } else if (
              (gk === 'bone_archer' || gk === 'shenji_musketeer') &&
              e.stateTimer <= 0 &&
              absDx < 430 &&
              Math.abs(dy) < 115
            ) {
              const isMusket = e.profile.kind === 'shenji_musketeer';
              e.castAnimTimer = 0.36;
              e.bossMoveIdx = (e.bossMoveIdx + 1) % 2;
              const boltY = e.bossMoveIdx === 0 ? e.y - 54 : e.y - 34;
              this.projectiles.push({
                fromPlayer: false,
                kind: isMusket ? 'qi_wave' : 'dagger',
                enemyFx: isMusket ? undefined : 'bone_bolt',
                x: e.x + e.facing * 26,
                y: boltY,
                vx: e.facing * (isMusket ? 470 : 395),
                vy: 0,
                r: isMusket ? 11 : 8,
                dmg: e.profile.atk,
                color: isMusket ? '#fb923c' : '#fde047',
                life: 1.6,
                maxLife: 1.6,
                pierce: 1,
                hitIds: new Set(),
              });
              this.spawnInkBurst(
                e.x + e.facing * 26,
                boltY,
                isMusket ? '#fb923c' : '#fbbf24',
                isMusket ? '#450a0a' : '#1c1917',
                isMusket ? 11 : 6
              );
              AudioFX.playSlash(isMusket ? 'heavy' : 'spear');
              e.stateTimer = isMusket ? 1.55 : 1.65;
            } else if (
              // 百戏傀儡：中近距提线后撤旋身齐射三枚梨园红绸金针！
              e.profile.kind === 'opera_puppet' &&
              e.stateTimer <= 0 &&
              absDx > 115 &&
              absDx < 320 &&
              Math.abs(dy) < 95
            ) {
              this.stepGroundEnemyX(e, -e.facing * 26);
              e.castAnimTimer = 0.36;
              const baseAng = Math.atan2(p.y - 38 - (e.y - 38), p.x - e.x);
              for (let m = -1; m <= 1; m++) {
                const ang = baseAng + m * 0.16;
                this.projectiles.push({
                  fromPlayer: false,
                  kind: 'dagger',
                  enemyFx: 'opera_needle',
                  x: e.x + e.facing * 16,
                  y: e.y - 38,
                  vx: Math.cos(ang) * 320,
                  vy: Math.sin(ang) * 320,
                  r: 8,
                  dmg: e.profile.atk,
                  color: '#f472b6',
                  life: 1.5,
                  maxLife: 1.5,
                  pierce: 1,
                  hitIds: new Set(),
                });
              }
              this.spawnInkBurst(e.x + e.facing * 14, e.y - 38, '#f472b6', '#fde047', 7);
              AudioFX.playSlash('light');
              e.stateTimer = 1.85;
            } else if (
              // 玄甲重盾卫中距离投掷恶魔城经典高低回旋双刃铜斧（皇陵秦俑戟将专精长戟刺杀，不共用扔斧！）
              e.profile.shieldedFront &&
              gk !== 'terracotta_halberdier' &&
              e.stateTimer <= 0 &&
              absDx > 145 &&
              absDx < 350 &&
              Math.abs(dy) < 90
            ) {
              e.castAnimTimer = 0.38;
              this.projectiles.push({
                fromPlayer: false,
                kind: 'bagua',
                enemyFx: 'bronze_axe',
                x: e.x + e.facing * 22,
                y: e.y - 56, // 高位飞斧：少侠按 ↓ 下蹲即可帅气低头闪过！
                vx: e.facing * 310,
                vy: 0,
                r: 15,
                dmg: e.profile.atk,
                color: '#f59e0b',
                life: 1.5,
                maxLife: 1.5,
                pierce: 1,
                hitIds: new Set(),
              });
              this.spawnInkBurst(e.x + e.facing * 20, e.y - 54, '#fbbf24', '#78350f', 7);
              AudioFX.playSlash('heavy');
              e.stateTimer = 1.85;
            } else if (e.stateTimer <= 0 && absDx <= attackRange + 18 && Math.abs(dy) < 90) {
              e.guardStanceTimer = 0;
              e.aiState = 'windup';
              e.bossAction = undefined;
              e.bossSubStep = gk === 'clockwork_mantis' ? 2 : 1;
              const wDur =
                gk === 'terracotta_halberdier'
                  ? 0.48
                  : e.profile.shieldedFront || gk === 'frost_chain_jailer'
                    ? 0.56
                    : gk === 'clockwork_mantis'
                      ? 0.34
                      : gk === 'paper_swordsman'
                        ? 0.42
                        : 0.46;
              e.stateTimer = wDur;
              e.stateDuration = wDur;
              e.vx = 0;
              e.slashHitPlayer = false;
              if (gk === 'paper_swordsman' || gk === 'clockwork_mantis') {
                this.spawnInkBurst(e.x - e.facing * 10, e.y - 32, '#e0f2fe', '#38bdf8', 7);
              }
            }
          }
        }
      } else if (e.aiState === 'windup') {
        // 蓄力前摇：沉身蓄势、刀锋绽放红金寒芒预警（此时可用 ↓↙←+斩 完美弹反！）
        if (e.profile.isBoss && e.bossAction === 'dive_bomb') {
          const safeLift = Math.max(88, 255 - e.profile.h);
          const highHover = Math.max(150, sampleSolidGroundY(room, e.x) - safeLift);
          e.y += (highHover - e.y) * Math.min(1, dt * 7);
        }
        e.stateTimer -= dt;
        if (e.stateTimer <= 0) {
          e.aiState = 'lunge_slash';
          const act = e.profile.isBoss ? e.bossAction ?? 'lunge' : 'lunge';
          const enraged = e.profile.isBoss && e.hp <= e.maxHp * 0.55;

          if (e.profile.isBoss && act === 'leap_slam') {
            const tx = Math.max(105, Math.min(room.pixelW - 105, e.bossTargetX ?? p.x));
            const destY = sampleSolidGroundY(room, tx);
            const tFlight = 0.66;
            const grav = 1650;
            e.vx = Math.max(-620, Math.min(620, (tx - e.x) / tFlight));
            e.vy = Math.min(-460, (destY - e.y - 0.5 * grav * tFlight * tFlight) / tFlight);
            e.facing = e.vx >= 0 ? 1 : -1;
            e.stateTimer = 1.15;
            e.stateDuration = 1.15;
            e.bossAuxTimer = 0;
            e.slashHitPlayer = false;
            AudioFX.playJump();
            continue;
          }

          if (e.profile.isBoss && act === 'dive_bomb') {
            const tx = Math.max(105, Math.min(room.pixelW - 105, e.bossTargetX ?? p.x));
            const ty = sampleSolidGroundY(room, tx);
            const ang = Math.atan2(ty - e.y, tx - e.x);
            const spd = e.profile.kind === 'boss_thunder_yaksha' ? 780 : 730;
            e.vx = Math.cos(ang) * spd;
            e.vy = Math.sin(ang) * spd;
            e.facing = e.vx >= 0 ? 1 : -1;
            e.stateTimer = 1.05;
            e.stateDuration = 1.05;
            e.slashHitPlayer = false;
            AudioFX.playSlash('heavy');
            continue;
          }

          if (e.profile.isBoss && act === 'air_sweep') {
            e.facing = p.x >= e.x ? 1 : -1;
            const spd =
              e.profile.kind === 'boss_thunder_yaksha'
                ? 560
                : e.profile.kind === 'boss_zhuyin'
                  ? 470
                  : 420;
            e.vx = e.facing * spd;
            e.vy = 0;
            e.bossAuxTimer = 0.14;
            const sweepLift = Math.max(76, 225 - e.profile.h);
            e.bossTargetY = Math.max(155, sampleSolidGroundY(room, e.x) - sweepLift);
            e.stateTimer = 0.96;
            e.stateDuration = 0.96;
            e.slashHitPlayer = false;
            AudioFX.playSkillCast();
            continue;
          }

          if (e.profile.isBoss && act === 'spin_whirl') {
            e.vx = e.facing * (e.profile.kind === 'boss_colosseum_general' ? 255 : 225);
            e.vy = 0;
            e.bossAuxTimer = 0.22;
            e.stateTimer = 1.25;
            e.stateDuration = 1.25;
            e.slashHitPlayer = false;
            AudioFX.playSlash('heavy');
            continue;
          }

          if (e.profile.isBoss && act === 'backstep_vault') {
            e.facing = p.x >= e.x ? 1 : -1;
            e.vx = -e.facing * 315;
            e.vy = -375;
            e.stateTimer = 0.58;
            e.stateDuration = 0.58;
            e.slashHitPlayer = false;
            if (e.profile.kind === 'boss_xiao_duanshui') {
              const ang = Math.atan2(p.y - 38 - (e.y - 46), p.x - e.x);
              const invAngles = room.realm === 'inverted' ? [0, -0.26, 0.26] : [0];
              for (const offA of invAngles) {
                const a = ang + offA;
                this.projectiles.push({
                  fromPlayer: false,
                  kind: 'dagger',
                  enemyFx: 'thunder_lance',
                  x: e.x + e.facing * 24,
                  y: e.y - 46,
                  vx: Math.cos(a) * 425,
                  vy: Math.sin(a) * 425,
                  r: 11,
                  dmg: Math.round(e.profile.atk * 0.92),
                  color: offA === 0 ? '#fde047' : '#c084fc',
                  life: 1.7,
                  maxLife: 1.7,
                  pierce: 1,
                  hitIds: new Set(),
                });
              }
              if (enraged) {
                this.projectiles.push({
                  fromPlayer: false,
                  kind: 'qi_wave',
                  x: e.x + e.facing * 26,
                  y: sampleSolidGroundY(room, e.x) - 26,
                  vx: e.facing * 380,
                  vy: 0,
                  r: 22,
                  dmg: e.profile.atk,
                  color: '#c084fc',
                  life: 1.6,
                  maxLife: 1.6,
                  pierce: 1,
                  hitIds: new Set(),
                });
              }
            } else {
              const half = enraged ? 3 : 2;
              const baseAng = Math.atan2(p.y - 38 - (e.y - 48), p.x - e.x);
              for (let f = -half; f <= half; f++) {
                const ang = baseAng + f * 0.16;
                this.projectiles.push({
                  fromPlayer: false,
                  kind: 'dagger',
                  enemyFx: 'thunder_lance',
                  x: e.x + e.facing * 22,
                  y: e.y - 48,
                  vx: Math.cos(ang) * 405,
                  vy: Math.sin(ang) * 405,
                  r: 11,
                  dmg: Math.round(e.profile.atk * 0.88),
                  color: '#ef4444',
                  life: 1.75,
                  maxLife: 1.75,
                  pierce: 1,
                  hitIds: new Set(),
                });
              }
            }
            AudioFX.playJump();
            continue;
          }

          const isIaido = e.profile.kind === 'paper_swordsman' || e.profile.kind === 'clockwork_mantis';
          const isWarg =
            e.profile.kind === 'demon_wolf' || e.profile.kind === 'bixie_stone_beast';
          const isTitanCharge =
            e.profile.kind === 'boss_furnace_titan' || e.profile.kind === 'boss_dragon_warden';
          const sDur =
            e.profile.isBoss && act === 'multi_dash'
              ? 0.24
              : isTitanCharge
                ? 0.46
                : isWarg
                  ? 0.3
                  : e.profile.isBoss
                    ? 0.3
                    : e.profile.shieldedFront
                      ? 0.26
                      : isIaido
                        ? 0.24
                        : 0.23;
          e.stateTimer = sDur;
          e.stateDuration = sDur;
          e.cleaveSlamDone = false;
          const lungeSpd =
            e.profile.kind === 'boss_thunder_yaksha' || isWarg
              ? 595
              : e.profile.kind === 'clockwork_mantis'
                ? 560
                : e.profile.kind === 'boss_zhuyin' || e.profile.kind === 'boss_pei_wuji'
                  ? 565
                  : isTitanCharge
                    ? 500
                    : e.profile.isBoss
                      ? 505
                      : isIaido
                        ? 455
                        : e.profile.kind === 'spirit_crow'
                          ? 420
                          : e.profile.kind === 'corpse_soldier'
                            ? 250
                            : e.profile.shieldedFront
                              ? 315
                              : 340;
          e.vx = e.facing * lungeSpd;
          if (e.profile.kind === 'celestial_sentinel' && e.bossAction === 'dive_bomb') {
            const tx = e.bossTargetX ?? p.x;
            const ty = e.bossTargetY ?? sampleSolidGroundY(room, tx);
            const diveA = Math.atan2(ty - e.y, tx - e.x);
            e.vx = Math.cos(diveA) * 580;
            e.vy = Math.sin(diveA) * 580;
            e.stateTimer = 0.42;
            e.stateDuration = 0.42;
          }
          AudioFX.playSlash(e.profile.shieldedFront || isTitanCharge || isWarg ? 'heavy' : 'light');
          if (e.profile.kind === 'lantern_ghost') {
            this.spawnInkBurst(e.x + e.facing * 24, e.y - 42, '#5eead4', '#a855f7', 9);
          } else if (isIaido) {
            this.spawnInkBurst(e.x + e.facing * 28, e.y - 36, '#e0f2fe', '#38bdf8', 8);
          } else if (e.profile.kind === 'terracotta_halberdier') {
            // 皇陵秦俑戟将：长戟破空突刺 + 赤血罡风！
            this.projectiles.push({
              fromPlayer: false,
              kind: 'qi_wave',
              x: e.x + e.facing * 32,
              y: e.y - 34,
              vx: e.facing * 385,
              vy: 0,
              r: 18,
              dmg: Math.round(e.profile.atk * 0.92),
              color: '#ef4444',
              life: 0.72,
              maxLife: 0.72,
              pierce: 1,
              hitIds: new Set(),
            });
          }
        }
      } else if (e.aiState === 'lunge_slash') {
        // 突步挥刀 / Boss 专属招式判定帧！
        e.stateTimer -= dt;
        const bossAct = e.profile.isBoss ? e.bossAction : undefined;
        const bossEnraged = e.profile.isBoss && e.hp <= e.maxHp * 0.55;

        if (bossAct === 'leap_slam') {
          e.bossAuxTimer = (e.bossAuxTimer || 0) + dt;
          e.vy += 1650 * dt;
          e.x = Math.max(88, Math.min(room.pixelW - 88, e.x + e.vx * dt));
          e.y += e.vy * dt;
          const gY = sampleEntitySurfaceY(room, e.x, e.y);
          if (((e.bossAuxTimer || 0) >= 0.16 && e.vy > 0 && e.y >= gY) || e.stateTimer <= 0) {
            e.y = gY;
            e.vx = 0;
            e.vy = 0;
            this.screenShake = Math.max(this.screenShake, 9);
            AudioFX.playSlash('heavy');
            NativeApp.haptic('heavy');
            this.spawnInkBurst(e.x, e.y - 10, e.profile.accentColor, '#090d16', 24);
            if (Math.abs(p.x - e.x) < e.profile.w * 0.95 + 24 && Math.abs(p.y - e.y) < 76) {
              if (
                !this.tryTriggerPerfectDodge(e.x, e.y - 24) &&
                p.invulnTimer <= 0 &&
                p.mistDashTimer <= 0
              ) {
                this.damagePlayer(e.profile.atk, p.x >= e.x ? 1 : -1);
              }
            }
            const useLava =
              e.profile.kind === 'boss_furnace_titan' ||
              e.profile.kind === 'boss_colosseum_general' ||
              e.profile.kind === 'boss_dragon_warden';
            this.spawnTwinShockwaves(
              e.x,
              gY - 22,
              e.profile.kind === 'boss_pei_wuji' ? 395 : 325,
              Math.round(e.profile.atk * 0.92),
              e.profile.accentColor,
              useLava
            );
            if (
              e.profile.kind === 'boss_dragon_warden' ||
              (room.realm === 'inverted' && e.profile.kind !== 'boss_zhuyin')
            ) {
              for (const dir of [-1, 1]) {
                this.projectiles.push({
                  fromPlayer: false,
                  kind: 'holy_fire',
                  enemyFx: 'magma_bomb',
                  x: e.x + dir * 28,
                  y: gY - 28,
                  vx: dir * (room.realm === 'inverted' ? 245 : 225),
                  vy: -380,
                  r: 13,
                  dmg: Math.round(e.profile.atk * 0.85),
                  color: e.profile.kind === 'boss_dragon_warden' ? '#f43f5e' : '#c084fc',
                  life: 1.7,
                  maxLife: 1.7,
                  pierce: 1,
                  hitIds: new Set(),
                });
              }
            }
            e.bossAction = undefined;
            e.aiState = 'recover';
            e.stateTimer = e.profile.kind === 'boss_furnace_titan' ? 0.72 : 0.56;
          }
          continue;
        }

        if (bossAct === 'dive_bomb') {
          e.x = Math.max(88, Math.min(room.pixelW - 88, e.x + e.vx * dt));
          e.y += e.vy * dt;
          if (Math.random() < dt * 28) {
            this.particles.push({
              kind: 'spark',
              x: e.x,
              y: e.y - e.profile.h * 0.45,
              vx: (Math.random() - 0.5) * 60,
              vy: (Math.random() - 0.5) * 60,
              size: 3.2,
              color: e.profile.accentColor,
              life: 0.26,
              maxLife: 0.26,
            });
          }
          if (
            !e.slashHitPlayer &&
            Math.abs(p.x - e.x) < e.profile.w * 0.68 &&
            p.y > e.y - e.profile.h * 0.9 &&
            p.y - p.h < e.y + 8
          ) {
            if (this.tryTriggerPerfectDodge(e.x, e.y - e.profile.h * 0.5)) {
              e.slashHitPlayer = true;
            } else if (p.invulnTimer <= 0 && p.mistDashTimer <= 0) {
              e.slashHitPlayer = true;
              this.damagePlayer(e.profile.atk, e.facing);
            }
          }
          const gY = sampleSolidGroundY(room, e.x);
          if (e.y >= gY - 6 || e.stateTimer <= 0) {
            e.y = gY;
            e.vx = 0;
            e.vy = 0;
            this.screenShake = Math.max(this.screenShake, 10);
            AudioFX.playSlash('heavy');
            NativeApp.haptic('heavy');
            this.spawnInkBurst(e.x, gY - 12, e.profile.accentColor, '#fde047', 26);
            if (Math.abs(p.x - e.x) < e.profile.w * 1.05 + 26 && Math.abs(p.y - gY) < 76) {
              if (
                !this.tryTriggerPerfectDodge(e.x, gY - 24) &&
                p.invulnTimer <= 0 &&
                p.mistDashTimer <= 0
              ) {
                this.damagePlayer(Math.round(e.profile.atk * 1.08), p.x >= e.x ? 1 : -1);
              }
            }
            this.spawnTwinShockwaves(
              e.x,
              gY - 22,
              370,
              Math.round(e.profile.atk * 0.92),
              e.profile.accentColor,
              e.profile.kind === 'boss_zhuyin'
            );
            e.bossAction = undefined;
            e.aiState = 'recover';
            e.stateTimer = 0.68;
          }
          continue;
        }

        if (bossAct === 'air_sweep') {
          const prog = Math.max(0, Math.min(1, 1 - e.stateTimer / (e.stateDuration || 0.96)));
          e.x = Math.max(88, Math.min(room.pixelW - 88, e.x + e.vx * dt));
          if (e.x <= 90 || e.x >= room.pixelW - 90) {
            e.facing = e.x <= 90 ? 1 : -1;
            e.vx = e.facing * Math.abs(e.vx);
          }
          e.y = (e.bossTargetY ?? 260) + Math.sin(prog * Math.PI) * 52;
          e.bossAuxTimer = (e.bossAuxTimer || 0) - dt;
          if ((e.bossAuxTimer || 0) <= 0) {
            const baseAux = e.profile.kind === 'boss_thunder_yaksha' ? 0.2 : 0.25;
            const isInvVariant = room.realm === 'inverted' && e.profile.kind !== 'boss_zhuyin';
            e.bossAuxTimer = isInvVariant ? baseAux * 0.84 : baseAux;
            if (e.profile.kind === 'boss_scroll_king') {
              const vxMain = (p.x - e.x) * 0.45;
              this.projectiles.push({
                fromPlayer: false,
                kind: 'dagger',
                enemyFx: 'cursed_talisman',
                x: e.x,
                y: e.y - 24,
                vx: vxMain,
                vy: 295,
                r: 10,
                dmg: Math.round(e.profile.atk * 0.86),
                color: '#38bdf8',
                life: 1.6,
                maxLife: 1.6,
                pierce: 1,
                hitIds: new Set(),
              });
              if (isInvVariant) {
                this.projectiles.push({
                  fromPlayer: false,
                  kind: 'dagger',
                  enemyFx: 'cursed_talisman',
                  x: e.x,
                  y: e.y - 24,
                  vx: -vxMain * 0.65 + e.facing * 135,
                  vy: 315,
                  r: 10,
                  dmg: Math.round(e.profile.atk * 0.8),
                  color: '#c084fc',
                  life: 1.6,
                  maxLife: 1.6,
                  pierce: 1,
                  hitIds: new Set(),
                });
              }
            } else if (e.profile.kind === 'boss_opera_god') {
              for (const off of [-0.25, 0.25]) {
                this.projectiles.push({
                  fromPlayer: false,
                  kind: 'dagger',
                  enemyFx: 'opera_needle',
                  x: e.x,
                  y: e.y - 26,
                  vx: Math.sin(off) * 280,
                  vy: Math.cos(off) * 320,
                  r: 10,
                  dmg: Math.round(e.profile.atk * 0.85),
                  color: '#f472b6',
                  life: 1.6,
                  maxLife: 1.6,
                  pierce: 1,
                  hitIds: new Set(),
                });
              }
            } else if (e.profile.kind === 'boss_shipyard_leviathan') {
              this.projectiles.push({
                fromPlayer: false,
                kind: 'dagger',
                enemyFx: 'thunder_lance',
                x: e.x,
                y: e.y - 24,
                vx: -e.facing * 120,
                vy: 335,
                r: 11,
                dmg: Math.round(e.profile.atk * 0.88),
                color: '#22d3ee',
                life: 1.6,
                maxLife: 1.6,
                pierce: 1,
                hitIds: new Set(),
              });
              if (isInvVariant) {
                this.projectiles.push({
                  fromPlayer: false,
                  kind: 'dagger',
                  enemyFx: 'thunder_lance',
                  x: e.x,
                  y: e.y - 24,
                  vx: e.facing * 155,
                  vy: 325,
                  r: 11,
                  dmg: Math.round(e.profile.atk * 0.82),
                  color: '#f43f5e',
                  life: 1.6,
                  maxLife: 1.6,
                  pierce: 1,
                  hitIds: new Set(),
                });
              }
            } else if (e.profile.kind === 'boss_thunder_yaksha') {
              const vxY = (p.x - e.x) * 0.35;
              this.projectiles.push({
                fromPlayer: false,
                kind: 'dagger',
                enemyFx: 'thunder_lance',
                x: e.x,
                y: e.y - 26,
                vx: vxY,
                vy: 380,
                r: 11,
                dmg: Math.round(e.profile.atk * 0.88),
                color: '#facc15',
                life: 1.5,
                maxLife: 1.5,
                pierce: 1,
                hitIds: new Set(),
              });
              if (isInvVariant) {
                this.projectiles.push({
                  fromPlayer: false,
                  kind: 'dagger',
                  enemyFx: 'thunder_lance',
                  x: e.x,
                  y: e.y - 26,
                  vx: -vxY * 0.6 + e.facing * 140,
                  vy: 365,
                  r: 11,
                  dmg: Math.round(e.profile.atk * 0.82),
                  color: '#c084fc',
                  life: 1.5,
                  maxLife: 1.5,
                  pierce: 1,
                  hitIds: new Set(),
                });
              }
            } else {
              const isVenom = Math.floor(prog * 10) % 2 === 1;
              this.projectiles.push({
                fromPlayer: false,
                kind: 'holy_fire',
                enemyFx: isVenom ? 'venom_glob' : 'magma_bomb',
                x: e.x,
                y: e.y - 28,
                vx: e.facing * 90,
                vy: 190,
                r: 13,
                dmg: Math.round(e.profile.atk * 0.9),
                color: isVenom ? '#a855f7' : '#fb923c',
                life: 1.8,
                maxLife: 1.8,
                pierce: 1,
                hitIds: new Set(),
              });
            }
          }
          if (
            !e.slashHitPlayer &&
            Math.abs(p.x - e.x) < e.profile.w * 0.65 &&
            p.y > e.y - e.profile.h * 0.92 &&
            p.y - p.h < e.y + 8
          ) {
            if (this.tryTriggerPerfectDodge(e.x, e.y - e.profile.h * 0.5)) {
              e.slashHitPlayer = true;
            } else if (p.invulnTimer <= 0 && p.mistDashTimer <= 0) {
              e.slashHitPlayer = true;
              this.damagePlayer(e.profile.atk, e.facing);
            }
          }
          if (e.stateTimer <= 0) {
            if ((e.bossSubStep || 1) > 1) {
              e.bossSubStep = (e.bossSubStep || 1) - 1;
              e.facing = p.x >= e.x ? 1 : -1;
              this.startBossAction(e, 'air_sweep', 0.28, {
                subSteps: e.bossSubStep,
                flashColor: e.profile.accentColor,
              });
            } else {
              e.bossAction = undefined;
              e.aiState = 'recover';
              e.stateTimer = 0.56;
              e.vx = 0;
            }
          }
          continue;
        }

        if (bossAct === 'spin_whirl') {
          const turnDir = p.x >= e.x ? 1 : -1;
          if (turnDir !== e.facing && Math.abs(p.x - e.x) > 36) e.facing = turnDir;
          e.vx += (e.facing * 245 - e.vx) * 3.5 * dt;
          e.x = Math.max(88, Math.min(room.pixelW - 88, e.x + e.vx * dt));
          e.y = sampleEntitySurfaceY(room, e.x, e.y);
          e.animPhase += dt * 18;
          e.bossAuxTimer = (e.bossAuxTimer || 0) - dt;
          if ((e.bossAuxTimer || 0) <= 0) {
            e.bossAuxTimer = 0.26;
            e.slashHitPlayer = false;
            this.spawnInkBurst(
              e.x,
              e.y - e.profile.h * 0.52,
              e.profile.accentColor,
              '#fde047',
              6
            );
            if (bossEnraged) {
              this.projectiles.push({
                fromPlayer: false,
                kind: 'dagger',
                enemyFx: e.profile.kind === 'boss_dragon_warden' ? 'magma_bomb' : 'thunder_lance',
                x: e.x + e.facing * 36,
                y: e.y - 52,
                vx: e.facing * 320,
                vy: -90,
                r: 11,
                dmg: Math.round(e.profile.atk * 0.78),
                color: e.profile.accentColor,
                life: 1.3,
                maxLife: 1.3,
                pierce: 1,
                hitIds: new Set(),
              });
            }
          }
          if (
            !e.slashHitPlayer &&
            Math.abs(p.x - e.x) < e.profile.w * 0.85 &&
            p.y > e.y - e.profile.h * 0.95 &&
            p.y - p.h < e.y + 8
          ) {
            if (this.tryTriggerPerfectDodge(e.x, e.y - e.profile.h * 0.5)) {
              e.slashHitPlayer = true;
            } else if (p.invulnTimer <= 0 && p.mistDashTimer <= 0) {
              e.slashHitPlayer = true;
              this.damagePlayer(Math.round(e.profile.atk * 0.72), p.x >= e.x ? 1 : -1);
            }
          }
          if (e.stateTimer <= 0) {
            e.bossAction = undefined;
            e.aiState = 'recover';
            e.stateTimer = 0.62;
            e.vx = 0;
          }
          continue;
        }

        if (bossAct === 'backstep_vault') {
          e.vy += 1350 * dt;
          e.x = Math.max(88, Math.min(room.pixelW - 88, e.x + e.vx * dt));
          e.y += e.vy * dt;
          const gY = sampleEntitySurfaceY(room, e.x, e.y);
          if ((e.vy > 0 && e.y >= gY) || e.stateTimer <= 0) {
            e.y = gY;
            e.vx = 0;
            e.vy = 0;
            e.bossAction = undefined;
            e.aiState = 'recover';
            e.stateTimer = 0.44;
          }
          continue;
        }

        if (
          (e.profile.shieldedFront || e.profile.kind === 'jinwu_mace_guard') &&
          !e.cleaveSlamDone &&
          e.stateTimer <= (e.stateDuration || 0.26) * 0.45
        ) {
          e.cleaveSlamDone = true;
          this.spawnInkBurst(e.x + e.facing * 52, e.y - 2, '#fbbf24', '#451a03', 10);
          // 第四幕起玄甲重盾傀儡重戟砸地迸出一段贴地裂石震波，逼迫少侠腾跃或翻滚绕背！
          if (
            room.realm === 'inverted' ||
            (room.region !== 'gatehouse' && room.region !== 'main_hall')
          ) {
            this.projectiles.push({
              fromPlayer: false,
              kind: 'qi_wave',
              enemyFx: 'lava_wave',
              x: e.x + e.facing * 36,
              y: sampleSolidGroundY(room, e.x) - 18,
              vx: e.facing * 315,
              vy: 0,
              r: 16,
              dmg: Math.round(e.profile.atk * 0.9),
              color: '#f97316',
              life: 0.72,
              maxLife: 0.72,
              pierce: 99,
              hitIds: new Set(),
            });
          }
        }
        if (e.profile.flying || e.profile.isBoss) {
          const nextBossX = e.x + e.vx * dt;
          if (
            e.profile.kind === 'boss_furnace_titan' &&
            (nextBossX <= 92 || nextBossX >= room.pixelW - 92)
          ) {
            // 赤铜巨灵蛮牛冲撞轰击殿柱自陷眩晕破绽！
            e.x = Math.max(92, Math.min(room.pixelW - 92, nextBossX));
            e.vx = -e.facing * 120;
            e.bossAction = undefined;
            e.aiState = 'staggered';
            e.stateTimer = 1.45;
            this.screenShake = Math.max(this.screenShake, 10);
            AudioFX.playParryClang();
            this.spawnInkBurst(e.x + e.facing * 32, e.y - 54, '#fb923c', '#fde047', 22);
            continue;
          }
          e.x = Math.max(50, Math.min(room.pixelW - 50, nextBossX));
          if (e.profile.kind === 'celestial_sentinel' && e.bossAction === 'dive_bomb') {
            e.y = Math.min(sampleSolidGroundY(room, e.x), e.y + e.vy * dt);
          } else if (e.profile.isBoss && !e.profile.flying) {
            e.y = sampleEntitySurfaceY(room, e.x, e.y);
          }
        } else {
          this.stepGroundEnemyX(e, e.vx * dt);
        }

        const reach = e.profile.isBoss
          ? Math.max(106, Math.round(e.profile.w * 1.15 + 52))
          : e.profile.kind === 'terracotta_halberdier'
            ? 158
            : 86;
        const slashMinX = e.facing === 1 ? e.x - 16 : e.x - reach;
        const slashMaxX = e.facing === 1 ? e.x + reach : e.x + 16;

        if (
          !e.slashHitPlayer &&
          p.x + p.w * 0.4 >= slashMinX &&
          p.x - p.w * 0.4 <= slashMaxX &&
          p.y > e.y - e.profile.h * 1.15 &&
          p.y - p.h < e.y + 8
        ) {
          if (this.tryTriggerPerfectDodge(e.x, e.y - e.profile.h * 0.5)) {
            e.slashHitPlayer = true;
          } else if (p.invulnTimer <= 0 && p.mistDashTimer <= 0) {
            e.slashHitPlayer = true;
            this.damagePlayer(e.profile.atk, e.facing);
          }
        }

        if (e.stateTimer <= 0) {
          if (
            e.profile.isBoss &&
            bossAct === 'multi_dash' &&
            (e.profile.kind === 'boss_zhuyin' ||
              (e.profile.kind === 'boss_dragon_warden' && (e.bossSubStep || 1) === 1))
          ) {
            this.projectiles.push({
              fromPlayer: false,
              kind: 'qi_wave',
              x: e.x + e.facing * 42,
              y: e.y - Math.round(e.profile.h * 0.45),
              vx: e.facing * 430,
              vy: 0,
              r: 28,
              dmg: Math.round(e.profile.atk * 0.92),
              color: e.profile.accentColor,
              life: 1.6,
              maxLife: 1.6,
              pierce: 1,
              hitIds: new Set(),
            });
          }

          if (e.profile.isBoss && bossAct === 'multi_dash' && (e.bossSubStep || 1) > 1) {
            const nextSub = (e.bossSubStep || 1) - 1;
            if (
              e.profile.kind === 'boss_pei_wuji' ||
              e.profile.kind === 'boss_opera_god'
            ) {
              const bx = Math.max(115, Math.min(room.pixelW - 115, p.x - p.facing * 120));
              this.spawnInkBurst(e.x, e.y - 44, e.profile.accentColor, '#090d16', 12);
              e.x = bx;
              if (!e.profile.flying) e.y = sampleEntitySurfaceY(room, e.x, e.y);
            }
            e.facing = p.x >= e.x ? 1 : -1;
            this.startBossAction(e, 'multi_dash', 0.28, {
              subSteps: nextSub,
              flashColor: e.profile.accentColor,
            });
            continue;
          }

          // 墨家青铜螳螂二连交剪逆袭！
          if (e.profile.kind === 'clockwork_mantis' && (e.bossSubStep || 1) > 1) {
            e.bossSubStep = (e.bossSubStep || 1) - 1;
            e.facing = p.x >= e.x ? 1 : -1;
            e.aiState = 'windup';
            e.stateTimer = 0.24;
            e.stateDuration = 0.24;
            e.vx = 0;
            e.slashHitPlayer = false;
            this.spawnInkBurst(e.x, e.y - 30, '#fbbf24', '#22d3ee', 8);
            continue;
          }

          // 中后期玄甲苍狼二连猛扑追咬！
          const isLateWolf =
            e.profile.kind === 'demon_wolf' &&
            e.bossMoveIdx === 0 &&
            Math.abs(p.x - e.x) < 175 &&
            (room.realm === 'inverted' ||
              (room.region !== 'gatehouse' && room.region !== 'main_hall'));
          if (isLateWolf) {
            e.bossMoveIdx = 1;
            e.facing = p.x >= e.x ? 1 : -1;
            e.aiState = 'windup';
            e.stateTimer = 0.24;
            e.stateDuration = 0.24;
            e.vx = 0;
            e.slashHitPlayer = false;
          } else {
            e.bossMoveIdx = 0;
            e.bossAction = undefined;
            e.bossSubStep = 0;
            e.vy = 0;
            e.aiState = 'recover';
            e.stateTimer = e.profile.isBoss ? 0.56 : e.profile.kind === 'demon_wolf' ? 0.42 : 0.52;
            e.vx = 0;
          }
        }
      } else if (e.aiState === 'recover') {
        e.stateTimer -= dt;
        if (e.profile.flying && !e.profile.isBoss) {
          e.y += (e.baseY - e.y) * Math.min(1, dt * 5);
        }
        if (e.stateTimer <= 0) {
          const enraged = e.profile.isBoss && e.hp < e.maxHp * 0.55;
          e.bossAction = undefined;
          e.aiState = 'stalk';
          e.stateTimer = e.profile.isBoss ? (enraged ? 0.58 : 0.85) : 0.72;
        }
      }
    }
  }

  private damageEnemiesInBox(
    bx: number,
    by: number,
    bw: number,
    bh: number,
    dmg: number,
    forceCrit: boolean,
    poise: number,
    explicitAffinity?: EnemyWeakness
  ): void {
    this.shatterLanternsAndWallsInBox(bx, by, bw, bh, poise >= 50, 0);
    for (const e of [...this.enemies]) {
      if (
        e.x + e.profile.w * 0.55 >= bx &&
        e.x - e.profile.w * 0.55 <= bx + bw &&
        e.y >= by &&
        e.y - e.profile.h * 1.2 <= by + bh
      ) {
        this.applyDamageToEnemy(e, dmg, forceCrit, poise, explicitAffinity);
      }
    }
  }

  private applyDamageToEnemy(
    e: EnemyEntity,
    rawDmg: number,
    forceCrit: boolean,
    poiseDmg: number,
    explicitAffinity?: EnemyWeakness
  ): void {
    if (!this.slot) return;
    const wCur = WEAPONS[this.slot.equippedWeapon] || WEAPONS.sword_0;
    let affinity: EnemyWeakness | undefined = explicitAffinity;
    if (!affinity) {
      if (wCur.archetype === 'greatsword' || wCur.specialEffect === 'armor_sunder') {
        affinity = 'heavy';
      } else if (wCur.specialEffect === 'burn_dot') {
        affinity = 'fire';
      } else if (wCur.specialEffect === 'chain_lightning') {
        affinity = 'lightning';
      } else if (wCur.specialEffect === 'frost_slow') {
        affinity = 'frost';
      }
    }
    const hitWeakness = Boolean(e.profile.weakness && affinity === e.profile.weakness);
    const effectivePoiseDmg = hitWeakness ? Math.round(poiseDmg * 1.3) : poiseDmg;

    const isCrit = forceCrit || Math.random() < this.player.critChance;
    const critMult = isCrit ? 1.52 : 1;
    const effDef = wCur.specialEffect === 'armor_sunder' ? e.profile.def * 0.15 : e.profile.def;
    const rawCrit = rawDmg * critMult;
    const defMitigation = 0.34 + 0.66 * (rawCrit / (rawCrit + effDef * 2.1 + 1));
    const finalDmg = Math.max(
      2,
      Math.round(rawCrit * defMitigation * (hitWeakness ? 1.25 : 1))
    );

    e.hp -= finalDmg;
    e.hurtFlash = 0.14;
    e.hurtJoltTimer = 0.12;
    if (this.player.lifesteal > 0) {
      const heal = Math.max(1, Math.round(finalDmg * this.player.lifesteal));
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
    }

    // 真实韧性架势条博弈：积累削韧击穿架势才触发失衡大硬直，彻底告别无脑无限平A控死小怪与Boss木桩化！
    if (e.hp > 0 && e.aiState !== 'staggered' && effectivePoiseDmg > 0) {
      e.poiseRegenDelay = e.profile.isBoss ? 2.4 : 1.8;
      e.poise -= effectivePoiseDmg;
      if (e.poise <= 0) {
        e.poise = e.maxPoise;
        e.guardStanceTimer = 0;
        e.bossAction = undefined;
        e.bossSubStep = 0;
        e.aiState = 'staggered';
        e.stateTimer = e.profile.isBoss ? 0.92 : 0.72;
        e.vx = this.player.facing * (e.profile.isBoss ? 85 : 150);
        e.vy = 0;
        AudioFX.playParryClang();
        this.screenShake = Math.max(this.screenShake, e.profile.isBoss ? 7 : 4.5);
        this.floats.push({
          x: e.x,
          y: e.y - e.profile.h * 1.18,
          vy: -52,
          text: '破势!',
          color: '#facc15',
          size: 16,
          life: 0.78,
        });
        this.slashImpacts.push({
          x: e.x,
          y: e.y - e.profile.h * 0.52,
          angle: 0,
          length: 68,
          thickness: 6,
          color: '#facc15',
          ringRadius: e.profile.isBoss ? 54 : 36,
          life: 0.24,
          maxLife: 0.24,
        });
        this.spawnInkBurst(
          e.x,
          e.y - e.profile.h * 0.55,
          '#fde047',
          '#b45309',
          e.profile.isBoss ? 14 : 8
        );
      } else if (!e.profile.isBoss && e.aiState === 'stalk') {
        this.stepGroundEnemyX(e, this.player.facing * 8);
      }
    }

    // 守关妖王 / 宿敌半血狂暴二阶段觉醒演出
    if (e.profile.isBoss && e.hp > 0 && e.hp <= e.maxHp * 0.55 && !e.enragedTriggered) {
      e.enragedTriggered = true;
      this.screenShake = Math.max(this.screenShake, 9);
      this.hitstopTimer = Math.max(this.hitstopTimer, 0.14);
      AudioFX.playSkillCast();
      NativeApp.haptic('heavy');
      this.spawnInkBurst(e.x, e.y - e.profile.h * 0.55, e.profile.accentColor, '#fde047', 28);
      this.slashImpacts.push({
        x: e.x,
        y: e.y - e.profile.h * 0.5,
        angle: 0,
        length: 96,
        thickness: 8,
        color: e.profile.accentColor,
        ringRadius: 68,
        life: 0.32,
        maxLife: 0.32,
      });
      const p2 = BOSS_PHASE2_LINES[e.profile.kind];
      if (p2) {
        this.skillBanner = {
          name: p2.title,
          subtext: p2.cry,
          timer: 2.35,
          color: p2.color,
        };
      }
    }

    const isHeavyStrike = wCur.archetype === 'greatsword' || this.player.comboStep === 2;
    AudioFX.playHit(isCrit, isHeavyStrike);
    this.hitstopTimer = Math.max(
      this.hitstopTimer,
      isCrit ? 0.056 : wCur.archetype === 'greatsword' ? 0.05 : 0.034
    );
    if (isCrit || isHeavyStrike) {
      this.screenShake = Math.max(this.screenShake, isCrit ? 4.5 : 3.2);
    }
    const hitAngle =
      (this.player.comboStep === 2 ? -0.62 : this.player.comboStep === 1 ? 0.48 : 0.08) *
        this.player.facing +
      (Math.random() - 0.5) * 0.25;
    this.slashImpacts.push({
      x: e.x + (Math.random() - 0.5) * 12,
      y: e.y - e.profile.h * 0.58,
      angle: hitAngle,
      length: isCrit ? 52 : wCur.tier === 1 ? 30 : 38,
      thickness: isCrit ? 5.2 : wCur.tier === 1 ? 3.0 : 3.8,
      color: wCur.tier <= 2 && !isCrit ? '#e2e8f0' : isCrit ? '#fde047' : wCur.glowColor,
      ringRadius: 0,
      life: 0.16,
      maxLife: 0.16,
    });
    this.spawnInkBurst(
      e.x,
      e.y - e.profile.h * 0.6,
      isCrit ? '#fbbf24' : wCur.glowColor,
      '#060911',
      isCrit ? 7 : wCur.tier === 1 ? 3 : 5
    );

    const weakPrefix = hitWeakness
      ? affinity === 'heavy'
        ? '破甲 '
        : affinity === 'fire'
          ? '焚邪 '
          : affinity === 'lightning'
            ? '雷克 '
            : '冰克 '
      : '';
    const floatColor = hitWeakness
      ? affinity === 'heavy'
        ? '#fbbf24'
        : affinity === 'fire'
          ? '#fb923c'
          : affinity === 'lightning'
            ? '#c084fc'
            : '#38bdf8'
      : isCrit
        ? '#fde047'
        : '#e2e8f0';

    if (hitWeakness) {
      this.spawnInkBurst(e.x, e.y - e.profile.h * 0.58, floatColor, '#0f172a', 7);
    }

    this.floats.push({
      x: e.x + (Math.random() - 0.5) * 12,
      y: e.y - e.profile.h * 1.06,
      vy: -38,
      text: `${weakPrefix}${finalDmg}${hitWeakness ? '!' : ''}`,
      color: floatColor,
      size: hitWeakness ? 15 : isCrit ? 14 : 11.5,
      life: hitWeakness ? 0.68 : 0.48,
    });

    if (e.hp <= 0) {
      this.handleEnemyKilled(e);
    }
  }

  public spawnNextBossRushWave(): void {
    if (!this.room || !this.slot) return;
    if (this.bossRushWave >= BOSS_RUSH_ORDER.length) {
      const sec = Math.round(this.slot.playTimeSec);
      const prevBest = SaveManager.getMeta().bestBossRushSec;
      if (prevBest === null || sec < prevBest) {
        SaveManager.saveMeta({ bestBossRushSec: sec });
      }
      this.cb.onEndingReached('boss_rush', sec);
      return;
    }
    const nextKind = BOSS_RUSH_ORDER[this.bossRushWave];
    this.bossRushWave++;
    this.bossFightTookDamage = false;
    this.spawnEnemy(nextKind, this.room.pixelW * 0.72, this.room.focalY);
    this.cb.onShowBanner(
      `镇妖塔 第 ${this.bossRushWave}/${BOSS_RUSH_ORDER.length} 层`,
      ENEMY_PROFILES[nextKind].name
    );
  }

  private handleEnemyKilled(e: EnemyEntity): void {
    const s = this.slot;
    if (!s || !this.room) return;

    const idx = this.enemies.indexOf(e);
    if (idx >= 0) this.enemies.splice(idx, 1);

    if (!s.bestiaryKills) s.bestiaryKills = {};
    s.bestiaryKills[e.profile.kind] = (s.bestiaryKills[e.profile.kind] || 0) + 1;
    const activeFam = this.getActiveFamiliar();
    if (activeFam) {
      if (!s.familiarExps) s.familiarExps = {};
      const nextExp = this.getFamiliarExp(activeFam) + e.profile.exp;
      s.familiarExps[activeFam] = nextExp;
      if (activeFam === 'familiar_sword') {
        s.familiarExp = nextExp;
      }
    }

    // 恶魔城标志性妖魂三连炎柱爆散演出！
    AudioFX.playEnemyDie(e.profile.isBoss);
    this.dyingSouls.push({
      x: e.x,
      y: e.y,
      w: e.profile.w,
      h: e.profile.h,
      isBoss: e.profile.isBoss,
      color: e.profile.accentColor,
      timer: e.profile.isBoss ? 0.95 : 0.44,
      maxTimer: e.profile.isBoss ? 0.95 : 0.44,
    });

    this.spawnInkBurst(
      e.x,
      e.y - e.profile.h * 0.6,
      e.profile.accentColor,
      '#090d16',
      e.profile.isBoss ? 40 : 18
    );
    if (e.profile.isBoss) {
      this.screenShake = 14;
      this.bossKillSlowTimer = 0.68;
      this.skyStrikes = [];
      // 妖王伏诛瞬间自动驱散其悬丝召唤的伴生傀儡
      this.enemies = this.enemies.filter((o) => o.profile.isBoss);
      NativeApp.haptic('heavy');

      // 《被夺走的封印》/《血污》经典【Boss 无伤破阵勋章】：全程无伤克敌永久赏赐气血真气与鎏金勋章！
      if (!this.bossFightTookDamage) {
        const medalKey =
          s.mode === 'boss_rush'
            ? `boss_rush:${e.profile.kind}`
            : `${this.room.realm}:${e.profile.kind}`;
        if (!s.noHitBosses) s.noHitBosses = [];
        const isFirstMedal = !s.noHitBosses.includes(medalKey);
        if (isFirstMedal) {
          s.noHitBosses.push(medalKey);
          s.maxHpBonus += 10;
          s.maxMpBonus += 5;
          s.gold += Math.round(e.profile.gold * 0.5);
          this.recalcStats(false);
          SaveManager.saveSlot(s);
        }
        AudioFX.playRelicBell();
        this.spawnInkBurst(e.x, e.y - 48, '#fde047', '#2dd4bf', 28);
        this.skillBanner = {
          name: '✦ 无伤破阵勋章 ✦',
          subtext: isFirstMedal
            ? `${e.profile.name} · 永久气血+10 真气+5`
            : `${e.profile.name} · 无伤破阵完美克敌`,
          timer: 2.6,
          color: '#fde047',
        };
      }
    }

    // 百鬼试炼·镇妖塔连战模式处理（仅当守层妖王本体伏诛时进入下一层！）
    if (s.mode === 'boss_rush' && this.room.id === 'boss_rush_arena' && e.profile.isBoss) {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + Math.round(this.player.maxHp * 0.35));
      this.player.mp = Math.min(this.player.maxMp, this.player.mp + Math.round(this.player.maxMp * 0.5));
      this.spawnNextBossRushWave();
      return;
    }

    s.exp += e.profile.exp;
    let needExp = this.getExpForNextLevel(s.level);
    if (s.exp >= needExp) {
      while (s.exp >= needExp) {
        s.exp -= needExp;
        s.level++;
        needExp = this.getExpForNextLevel(s.level);
      }
      this.recalcStats(false);
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + Math.round(this.player.maxHp * 0.25));
      this.player.mp = Math.min(this.player.maxMp, this.player.mp + Math.round(this.player.maxMp * 0.25));
      this.levelUpPillarTimer = 1.05;
      AudioFX.playRelicBell();
      this.spawnInkBurst(this.player.x, this.player.y - 40, '#fde047', '#090d16', 20);
    }

    // 大幅收紧日常小怪基础银两与灵符掉落率（76% 小怪斩杀无额外杂落，使每一份收获更显珍贵！）
    if (e.profile.isBoss || Math.random() < 0.24) {
      const dropGold = e.profile.isBoss || Math.random() < 0.5;
      this.drops.push({
        id: `drop_${this.nextEntityId++}`,
        isStaticPickup: false,
        kind: dropGold ? 'gold' : 'heart',
        itemId: dropGold ? 'gold' : 'heart',
        amount: dropGold ? e.profile.gold : e.profile.isBoss ? 8 : Math.random() < 0.35 ? 2 : 1,
        x: e.x,
        y: e.y - 12,
        vy: -230,
        color: '#facc15',
        label: '银两',
      });
    }

    const accDropMult = ARMORS[s.equippedAccessory]?.dropRateMult || 1;
    const dropLuckMult = Math.min(1.85, (1 + this.player.lck * 0.012) * accDropMult);

    const coreId = e.profile.yaoCoreId;
    const dropRate = Math.min(
      0.35,
      ((e.profile.yaoDropChance || 0.03) + this.player.lck * 0.0025) * accDropMult
    );
    if (coreId && !s.ownedYaoCores.includes(coreId) && Math.random() < dropRate) {
      this.drops.push({
        id: `core_${this.nextEntityId++}`,
        isStaticPickup: false,
        kind: 'yao_core',
        itemId: coreId,
        amount: 1,
        x: e.x + 14,
        y: e.y - 18,
        vy: -280,
        color: '#c084fc',
        label: YAO_CORES[coreId].name,
      });
    }

    // 恶魔城《月下夜想曲》经典双层战利品表：每种妖邪皆有【常掉物 + 稀世神兵/宝甲/秘药】，受福缘与摸金天师符翻倍加成！
    if (!s.discoveredDrops) s.discoveredDrops = [];
    const canDropEntry = (kind: 'consumable' | 'weapon' | 'armor', id: string) => {
      if (kind === 'weapon') return !s.ownedWeapons.includes(id);
      if (kind === 'armor') return !s.ownedArmors.includes(id);
      return true;
    };

    let spawnedLoot: { tier: 'rare' | 'common'; kind: 'consumable' | 'weapon' | 'armor'; itemId: string } | null = null;
    if (
      e.profile.rareDrop &&
      canDropEntry(e.profile.rareDrop.kind, e.profile.rareDrop.itemId) &&
      Math.random() < e.profile.rareDrop.chance * dropLuckMult
    ) {
      spawnedLoot = {
        tier: 'rare',
        kind: e.profile.rareDrop.kind,
        itemId: e.profile.rareDrop.itemId,
      };
    } else if (
      e.profile.commonDrop &&
      canDropEntry(e.profile.commonDrop.kind, e.profile.commonDrop.itemId) &&
      Math.random() < e.profile.commonDrop.chance * dropLuckMult
    ) {
      spawnedLoot = {
        tier: 'common',
        kind: e.profile.commonDrop.kind,
        itemId: e.profile.commonDrop.itemId,
      };
    }

    if (spawnedLoot) {
      const discKey = `${e.profile.kind}:${spawnedLoot.tier}`;
      if (!s.discoveredDrops.includes(discKey)) {
        s.discoveredDrops.push(discKey);
      }
      const isRare = spawnedLoot.tier === 'rare';
      this.drops.push({
        id: `loot_${this.nextEntityId++}`,
        isStaticPickup: false,
        kind: spawnedLoot.kind,
        itemId: spawnedLoot.itemId,
        amount: 1,
        x: e.x - 16,
        y: e.y - 16,
        vy: isRare ? -295 : -245,
        color: isRare ? '#f472b6' : '#4ade80',
        label: this.getPickupLabel(spawnedLoot.kind, spawnedLoot.itemId),
      });
      if (isRare) {
        AudioFX.playRelicBell();
        this.spawnInkBurst(e.x - 16, e.y - 24, '#fde047', '#f472b6', 18);
      }
    }

    if (!e.profile.isBoss) return;

    this.resolveRoomBgmMood(this.room, false);

    // 1) 表城王座之巅【裴无极】真假结局分歧（100% 致敬《恶魔城：月下夜想曲》里希特破除控制神机制！）
    if (e.profile.kind === 'boss_pei_wuji' && this.room.realm === 'normal') {
      const hasBothRelics =
        this.hasAbility('mirror_truth') && this.hasAbility('jade_pendant_full');
      if (!hasBothRelics && s.mode === 'story') {
        const normalSc = STORY_SCENES.altar_normal_end;
        if (normalSc) {
          this.cb.onStartStory(normalSc, () => {
            this.cb.onEndingReached('normal', Math.round(s.playTimeSec));
          });
        } else {
          this.cb.onEndingReached('normal', Math.round(s.playTimeSec));
        }
        return;
      }

      // 已携双信物破除九幽蚀心蛊 -> 永久开启 180° 九幽倒悬里城！
      const bossKey = `${this.room.realm}:${e.profile.kind}`;
      if (!s.defeatedBosses.includes(bossKey)) s.defeatedBosses.push(bossKey);
      s.invertedUnlocked = true;
      SaveManager.saveSlot(s);
      const awakeSc = STORY_SCENES.altar_invert_awakening;
      if (awakeSc && s.mode === 'story') {
        this.cb.onStartStory(awakeSc, () => {
          this.cb.onShowBanner('乾坤倒悬 · 九幽里城已现', '踏入祭坛中央裂隙即可攻入 180° 倒悬里城！');
        });
      } else {
        this.cb.onShowBanner('乾坤倒悬 · 九幽里城已现', '踏入祭坛中央裂隙即可攻入 180° 倒悬里城！');
      }
      return;
    }

    // 2) 九幽倒悬里城真最终 Boss【太古尸仙·烛阴】伏诛 -> 真结局 + 解锁萧断水模式与百鬼试炼塔！
    if (e.profile.kind === 'boss_zhuyin') {
      const bossKey = `${this.room.realm}:${e.profile.kind}`;
      if (!s.defeatedBosses.includes(bossKey)) s.defeatedBosses.push(bossKey);
      SaveManager.saveMeta({ unlockedXiaoMode: true, unlockedBossRush: true });
      SaveManager.saveSlot(s);
      const trueSc = STORY_SCENES.true_ending;
      if (trueSc && s.mode === 'story') {
        this.cb.onStartStory(trueSc, () => {
          this.cb.onEndingReached('true', Math.round(s.playTimeSec));
        });
      } else {
        this.cb.onEndingReached('true', Math.round(s.playTimeSec));
      }
      return;
    }

    const bossKey = `${this.room.realm}:${e.profile.kind}`;
    if (!s.defeatedBosses.includes(bossKey)) {
      s.defeatedBosses.push(bossKey);
    }

    // 守关神将/妖王伏诛后，当场显化本厅供奉的镇殿宝甲/奇珍！
    for (const pk of this.room.pickups) {
      if (s.collectedPickups.includes(pk.id)) continue;
      if (this.drops.some((d) => d.id === pk.id)) continue;
      const py = pk.y ?? sampleEntitySurfaceY(this.room, pk.x, 0);
      this.drops.push({
        id: pk.id,
        isStaticPickup: true,
        kind: pk.kind,
        itemId: pk.itemId,
        amount: 1,
        x: pk.x,
        y: py,
        vy: 0,
        color: '#fde047',
        label: this.getPickupLabel(pk.kind, pk.itemId),
      });
      this.spawnInkBurst(pk.x, py - 24, '#fde047', '#f97316', 24);
    }

    // 3) 首战宿敌【少统领·萧断水】战后赠予镇军信物【白虎啸风兵符】（不再越级提前赠送缩地化雾！）
    if (e.profile.kind === 'boss_xiao_duanshui') {
      if (!s.ownedArmors.includes('tiger_tally')) {
        this.drops.push({
          id: 'boss_drop_tiger_tally',
          isStaticPickup: false,
          kind: 'armor',
          itemId: 'tiger_tally',
          amount: 1,
          x: e.x,
          y: e.y - 24,
          vy: -240,
          color: '#f59e0b',
          label: ARMORS.tiger_tally.name,
        });
      }
      if (s.mode === 'story' && STORY_SCENES.boss_xiao_post) {
        this.cb.onStartStory(STORY_SCENES.boss_xiao_post, () => {
          SaveManager.saveSlot(s);
        });
        return;
      }
    }

    if (e.profile.rewardAbility) {
      this.grantAbility(e.profile.rewardAbility);
      SaveManager.saveSlot(s);
    }

    if (s.mode === 'story' && this.room.realm === 'normal') {
      const postBossSceneMap: Partial<Record<EnemyKind, string>> = {
        boss_furnace_titan: 'boss_titan_post',
        boss_scroll_king: 'boss_scroll_post',
        boss_opera_god: 'boss_opera_post',
        boss_thunder_yaksha: 'boss_yaksha_post',
        boss_colosseum_general: 'boss_general_post',
        boss_shipyard_leviathan: 'boss_leviathan_post',
        boss_dragon_warden: 'boss_warden_post',
      };
      const postKey = postBossSceneMap[e.profile.kind];
      const postScene = postKey ? STORY_SCENES[postKey] : undefined;
      if (postKey && postScene && !s.triggeredStories.includes(postKey)) {
        s.triggeredStories.push(postKey);
        SaveManager.saveSlot(s);
        this.cb.onStartStory(postScene);
      }
    }
  }

  public getExpForNextLevel(lv: number): number {
    return Math.round(92 * Math.pow(1.34, lv - 1));
  }

  private tryTriggerPerfectDodge(srcX: number, srcY: number): boolean {
    const p = this.player;
    if (
      (p.backdashTimer <= 0.03 && p.mistDashTimer <= 0.04) ||
      this.perfectDodgeCooldown > 0
    ) {
      return false;
    }
    this.perfectDodgeCooldown = 0.65;
    this.perfectDodgeBuffTimer = 3.5;
    this.perfectDodgeFlashTimer = 0.36;
    p.invulnTimer = Math.max(p.invulnTimer, 0.32);
    p.mp = Math.min(p.maxMp, p.mp + 15);
    this.hitstopTimer = Math.max(this.hitstopTimer, 0.058);
    AudioFX.playParryClang();
    NativeApp.haptic('light');
    this.spawnInkBurst((p.x + srcX) * 0.5, (p.y - 38 + srcY) * 0.5, '#2dd4bf', '#fde047', 16);
    this.afterImages.push(
      { x: p.x - p.facing * 10, y: p.y, facing: p.facing, color: '#2dd4bf', alpha: 0.72 },
      { x: p.x - p.facing * 20, y: p.y, facing: p.facing, color: '#fde047', alpha: 0.54 }
    );
    this.floats.push({
      x: p.x,
      y: p.y - p.h - 14,
      vy: -44,
      text: '踏影! +15真气',
      color: '#2dd4bf',
      size: 13,
      life: 0.72,
    });
    return true;
  }

  private damagePlayer(rawAtk: number, knockDir: 1 | -1): void {
    const p = this.player;
    if (this.enemies.some((e) => e.profile.isBoss)) {
      this.bossFightTookDamage = true;
    }
    let tortoiseMult = 1;
    if (this.getActiveFamiliar() === 'familiar_tortoise' && this.tortoiseShieldReady) {
      this.tortoiseShieldReady = false;
      const tLv = this.getFamiliarLevel('familiar_tortoise');
      this.tortoiseShieldTimer = Math.max(5.2, 9.0 - tLv * 0.45);
      tortoiseMult = 0.58;
      AudioFX.playParryClang();
      this.spawnInkBurst(p.x, p.y - 38, '#22d3ee', '#083344', 18);
      const counterDmg = Math.max(8, Math.round(p.def * 1.4));
      for (const e of [...this.enemies]) {
        if (Math.hypot(e.x - p.x, e.y - e.profile.h * 0.5 - (p.y - 38)) <= 150) {
          e.chillTimer = Math.max(e.chillTimer || 0, 2.6);
          this.applyDamageToEnemy(e, counterDmg, false, 20);
        }
      }
    }
    const skinMult = (this.activeBuffs.iron_skin > 0 ? 0.65 : 1) * tortoiseMult;
    const minFloor = Math.round(rawAtk * 0.34 * skinMult);
    const reduced = Math.round((rawAtk - p.def * 0.6) * skinMult);
    const dmg = Math.max(4, minFloor, reduced);
    p.hp = Math.max(0, p.hp - dmg);
    p.hurtStunTimer = 0.34;
    p.invulnTimer = 0.92;
    p.hurtBlinkTimer = 0.92;
    p.slideTimer = 0;
    p.diveKicking = false;
    p.groundSlamming = false;
    p.crouching = false;
    p.facing = (-knockDir) as 1 | -1;
    this.activeSlash = null;
    this.activeSkillAnim = null;
    this.hitstopTimer = Math.max(this.hitstopTimer, 0.046);
    p.vx = knockDir * 215;
    p.vy = -245;
    p.onGround = false;
    this.screenShake = 7.5;
    AudioFX.playHurt();
    NativeApp.haptic('heavy');
    this.spawnInkBurst(p.x, p.y - 38, '#ef4444', '#090d16', 12);

    this.floats.push({
      x: p.x,
      y: p.y - p.h - 8,
      vy: -42,
      text: `-${dmg}`,
      color: '#f87171',
      size: 16,
      life: 0.8,
    });

    if (p.hp <= 0) {
      this.cb.onGameOver();
    }
  }

  private updateDrops(dt: number): void {
    if (!this.slot || !this.room) return;
    const p = this.player;

    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      if (!d.isStaticPickup) {
        const prevDropY = d.y;
        d.vy = Math.min(540, d.vy + 1100 * dt);
        d.y += d.vy * dt;
        if (d.vx) {
          d.x = Math.max(38, Math.min(this.room.pixelW - 38, d.x + d.vx * dt));
        }
        if (Math.abs(d.vy) > 20) {
          d.spinAngle = (d.spinAngle || 0) + dt * 11;
        }
        const gy = sampleEntitySurfaceY(this.room, d.x, prevDropY);
        if (d.y >= gy && d.vy >= 0) {
          d.y = gy;
          if (!d.bounced && d.vy > 130) {
            d.vy = -d.vy * 0.36;
            d.vx = (d.vx || (Math.random() - 0.5) * 70) * 0.45;
            d.bounced = true;
          } else {
            d.vy = 0;
            d.vx = 0;
          }
        }
      }

      if (Math.abs(d.x - p.x) < 40 && Math.abs(d.y - 16 - (p.y - 36)) < 46) {
        this.collectDrop(d);
        this.drops.splice(i, 1);
      }
    }
  }

  private collectDrop(d: WorldDrop): void {
    const s = this.slot;
    if (!s) return;

    if (d.isStaticPickup && !s.collectedPickups.includes(d.id)) {
      s.collectedPickups.push(d.id);
    }

    if (d.kind === 'gold') {
      s.gold += d.amount;
      AudioFX.playHit(false);
      this.spawnInkBurst(d.x, d.y - 12, '#fde047', '#090d16', 5);
      return;
    }

    if (d.kind === 'heart') {
      s.talismanHearts = Math.min(99, s.talismanHearts + d.amount);
      this.spawnInkBurst(d.x, d.y - 12, '#fb923c', '#090d16', 5);
      return;
    }

    AudioFX.playRelicBell();
    NativeApp.haptic('medium');
    this.spawnInkBurst(d.x, d.y - 18, d.color || '#fde047', '#090d16', 14);

    if (d.kind === 'yao_core') {
      if (!s.ownedYaoCores.includes(d.itemId)) s.ownedYaoCores.push(d.itemId);
      if (!s.equippedYaoCore) s.equippedYaoCore = d.itemId;
      this.recalcStats(false);
    } else if (d.kind === 'ability') {
      this.grantAbility(d.itemId as AbilityKey);
    } else if (d.kind === 'skill_scroll') {
      const skId = d.itemId as SkillId;
      if (!s.learnedSkills.includes(skId)) s.learnedSkills.push(skId);
    } else if (d.kind === 'weapon') {
      if (d.itemId.startsWith('sub:')) {
        const subId = d.itemId.slice(4) as SubWeaponId;
        if (!s.ownedSubWeapons.includes(subId)) s.ownedSubWeapons.push(subId);
        s.equippedSubWeapon = subId;
      } else {
        if (!s.ownedWeapons.includes(d.itemId)) {
          s.ownedWeapons.push(d.itemId);
        } else {
          const wDef = WEAPONS[d.itemId];
          const dupGold = wDef ? Math.max(180, Math.round((wDef.price || 600) * 0.35)) : 220;
          s.gold += dupGold;
          this.floats.push({
            x: this.player.x,
            y: this.player.y - 72,
            vy: -36,
            text: `+${dupGold} 银 (已藏此刃)`,
            color: '#fde047',
            size: 13,
            life: 0.9,
          });
        }
      }
    } else if (d.kind === 'armor') {
      const arm = ARMORS[d.itemId];
      if (arm) {
        if (!s.ownedArmors.includes(d.itemId)) s.ownedArmors.push(d.itemId);
      }
    } else if (d.kind === 'max_up') {
      if (d.itemId === 'hp_vessel') {
        s.maxHpBonus += 25;
        this.recalcStats(false);
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 50);
      } else {
        s.maxMpBonus += 20;
        this.recalcStats(false);
        this.player.mp = Math.min(this.player.maxMp, this.player.mp + 40);
      }
    } else if (d.kind === 'consumable') {
      s.consumables[d.itemId] = (s.consumables[d.itemId] || 0) + 1;
    }
  }

  public upgradeWeapon(weaponId: string): boolean {
    const s = this.slot;
    const w = WEAPONS[weaponId];
    if (!s || !w || !s.ownedWeapons.includes(weaponId)) return false;
    const curLv = getWeaponUpgradeLevel(s.weaponUpgrades, weaponId);
    if (curLv >= MAX_WEAPON_UPGRADE) return false;
    const cost = getWeaponUpgradeCost(w, curLv);
    if (s.gold < cost) {
      AudioFX.playHurt();
      return false;
    }
    s.gold -= cost;
    if (!s.weaponUpgrades) s.weaponUpgrades = {};
    s.weaponUpgrades[weaponId] = curLv + 1;
    this.recalcStats(false);
    SaveManager.saveSlot(s);
    AudioFX.playParryClang();
    AudioFX.playRelicBell();
    return true;
  }

  public cycleWeapon(): void {
    const s = this.slot;
    if (!s || s.ownedWeapons.length <= 1) return;
    const idx = s.ownedWeapons.indexOf(s.equippedWeapon);
    s.equippedWeapon = s.ownedWeapons[(idx + 1) % s.ownedWeapons.length];
    this.recalcStats(false);
    const w = WEAPONS[s.equippedWeapon] || WEAPONS.sword_0;
    AudioFX.playParryClang();
    this.spawnInkBurst(this.player.x, this.player.y - 40, w.glowColor, '#090d16', 10);
  }

  public useQuickHealPotion(): void {
    const s = this.slot;
    if (!s || this.player.potionCooldown > 0) return;
    const needHeal = this.player.hp < this.player.maxHp * 0.85;
    const priority = needHeal
      ? [
          'jinchuang_yao',
          'beggar_chicken',
          'jingang_dan',
          'osmanthus_wine',
          'jiuzhuan_jin_dan',
          'tiger_bone_wine',
          'shenxing_san',
          'huiqi_dan',
        ]
      : [
          'tiger_bone_wine',
          'shenxing_san',
          'jingang_dan',
          'huiqi_dan',
          'osmanthus_wine',
          'jinchuang_yao',
          'beggar_chicken',
          'jiuzhuan_jin_dan',
        ];
    for (const id of priority) {
      if ((s.consumables[id] || 0) > 0) {
        this.useConsumable(id);
        return;
      }
    }
  }

  public useConsumable(id: string): boolean {
    const s = this.slot;
    const def = CONSUMABLES[id];
    if (!s || !def || (s.consumables[id] || 0) <= 0) return false;
    if (def.warpTalisman) {
      if (this.enemies.some((e) => e.profile.isBoss) || this.ambushSealed) {
        AudioFX.playHurt();
        this.cb.onShowBanner('结界封锁', '妖王或封印结界未破，暂不可催动千山缩地符');
        return false;
      }
      AudioFX.playRelicBell();
      NativeApp.haptic('medium');
      this.cb.onOpenInteractModal('warp', { consumeTalisman: true });
      return true;
    }
    if (this.player.potionCooldown > 0) return false;
    s.consumables[id]--;
    this.player.potionCooldown = 3.5;

    if (def.fullRestore) {
      this.player.hp = this.player.maxHp;
      this.player.hpTrail = this.player.maxHp;
      this.player.mp = this.player.maxMp;
    } else {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + def.hpRestore);
      this.player.mp = Math.min(this.player.maxMp, this.player.mp + def.mpRestore);
    }

    let burstCol = '#4ade80';
    if (def.buffKind) {
      const sec = def.buffSec || 30;
      this.activeBuffs[def.buffKind] = sec;
      this.recalcStats(false);
      if (def.buffKind === 'berserk_wine') burstCol = '#fb923c';
      else if (def.buffKind === 'iron_skin') burstCol = '#fde047';
      else if (def.buffKind === 'wind_crit') burstCol = '#38bdf8';
    }

    AudioFX.playRelicBell();
    this.spawnInkBurst(this.player.x, this.player.y - 36, burstCol, '#090d16', 14);
    if (def.hpRestore > 0 && !def.fullRestore) {
      this.floats.push({
        x: this.player.x,
        y: this.player.y - 72,
        vy: -32,
        text: `+${def.hpRestore}`,
        color: '#4ade80',
        size: 12,
        life: 0.65,
      });
    }
    return true;
  }

  private isOnPavilionDeck(): boolean {
    if (!this.room) return false;
    const p = this.player;
    if (
      this.room.pavilions.some(
        (pv) => p.x >= pv.x + 8 && p.x <= pv.x + pv.w - 8 && Math.abs(p.y - pv.y) < 8
      )
    ) {
      return true;
    }
    const orbitPlats = getClockGearOrbitPlatforms(this.room, p.animTime);
    if (
      orbitPlats.some(
        (op) => p.x >= op.x - 6 && p.x <= op.x + op.w + 6 && Math.abs(p.y - op.y) < 12
      )
    ) {
      return true;
    }
    if (
      this.liveCrumbleSlabs.some(
        (cs) =>
          cs.state !== 'broken' &&
          p.x >= cs.x + 6 &&
          p.x <= cs.x + cs.w - 6 &&
          Math.abs(p.y - cs.y) < 10
      )
    ) {
      return true;
    }
    return Boolean(
      this.room.solidBlocks?.some(
        (sb) =>
          !isGroundRestingSolidBlock(this.room!, sb) &&
          p.x >= sb.x - 8 &&
          p.x <= sb.x + sb.w + 8 &&
          Math.abs(p.y - sb.y) < 8
      )
    );
  }

  private moveAndCollideTerrain(dt: number): void {
    if (!this.room || !this.slot) return;
    const room = this.room;
    const p = this.player;
    const wasGrounded = p.onGround;
    const bossCleared = this.isBossClearedInRoom(room);

    const prevX = p.x;
    p.x += p.vx * dt;
    p.onWall = 0;

    // 0A. 玄铁千斤闸门 / 五灵封印 / 剧毒紫瘴铁栅阻挡判定（唯独紫瘴铁栅可借【缩地化雾】穿过！）
    if (
      room.ironGate &&
      !this.slot.brokenSecretWalls.includes(room.ironGate.id) &&
      !(p.mistDashTimer > 0 && room.ironGate.gateKind === 'mist_only') &&
      p.y > room.ironGate.topY + 8 &&
      p.y - p.h < room.ironGate.bottomY
    ) {
      const gx = room.ironGate.x;
      if (prevX >= gx + 18 && p.x < gx + 18) {
        p.x = gx + 18;
        p.vx = 0;
      } else if (prevX <= gx - 18 && p.x > gx - 18) {
        p.x = gx - 18;
        p.vx = 0;
      }
    }

    // 0A-1. 针对端头能力锁高崖 (`sb.blocking`) 及厚重落地须弥石墩 (`groundResting && sb.h >= 52`) 执行真实立壁碰撞，彻底杜绝平地穿入实心石砖内部！
    if (room.solidBlocks) {
      for (const sb of room.solidBlocks) {
        const actsAsSolidWall =
          Boolean(sb.blocking) || (isGroundRestingSolidBlock(room, sb) && sb.h >= 52);
        if (!actsAsSolidWall) continue;
        if (p.y > sb.y + 8 && p.y - p.h < sb.y + sb.h - 4) {
          if (prevX <= sb.x - 13 && p.x > sb.x - 13) {
            p.x = sb.x - 13;
            p.vx = 0;
            p.onWall = 1;
          } else if (prevX >= sb.x + sb.w + 13 && p.x < sb.x + sb.w + 13) {
            p.x = sb.x + sb.w + 13;
            p.vx = 0;
            p.onWall = -1;
          } else if (Math.abs(p.x - (sb.x - 13)) <= 3) {
            p.onWall = 1;
          } else if (Math.abs(p.x - (sb.x + sb.w + 13)) <= 3) {
            p.onWall = -1;
          }
        }
      }
    }

    // 0A-2. 蹬墙古武石壁井道碰撞与【壁虎游墙功】贴墙检测
    if (room.climbWalls) {
      for (const cw of room.climbWalls) {
        const halfW = 18;
        if (p.y > cw.topY + 10 && p.y - p.h < cw.bottomY) {
          if (prevX <= cw.x - halfW - 10 && p.x >= cw.x - halfW - 10) {
            p.x = cw.x - halfW - 10;
            p.vx = 0;
            p.onWall = 1;
          } else if (prevX >= cw.x + halfW + 10 && p.x <= cw.x + halfW + 10) {
            p.x = cw.x + halfW + 10;
            p.vx = 0;
            p.onWall = -1;
          } else if (Math.abs(p.x - (cw.x - halfW - 10)) <= 3) {
            p.onWall = 1;
          } else if (Math.abs(p.x - (cw.x + halfW + 10)) <= 3) {
            p.onWall = -1;
          }
        }
      }
    }

    // 0B. 左右边界实心城墙、多层竖塔分标高门廊与未破封门暗壁碰撞（支持跳跃顺畅穿门，未破暗壁呈真实实心石墙！）
    const doorHeadClearance = room.gridH > 1 ? 175 : 280;
    if (p.x < 32) {
      const leftDoors = getRoomSideDoors(room, 'left');
      const inOpenLeftDoor = leftDoors.some(
        (d) =>
          this.isSideDoorOpen(d) &&
          p.y >= d.floorY - doorHeadClearance &&
          p.y <= d.floorY + 34
      );
      if (!inOpenLeftDoor) {
        p.x = 32;
        p.vx = 0;
        p.onWall = -1;
      }
    }

    if (p.x > room.pixelW - 32) {
      const rightDoors = getRoomSideDoors(room, 'right');
      const inOpenRightDoor = rightDoors.some(
        (d) =>
          this.isSideDoorOpen(d) &&
          p.y >= d.floorY - doorHeadClearance &&
          p.y <= d.floorY + 34
      );
      if (!inOpenRightDoor) {
        p.x = room.pixelW - 32;
        p.vx = 0;
        p.onWall = 1;
      }
    }

    // 贴墙滑行减缓下坠（【壁虎游墙功】视觉手感反馈！）
    if (!wasGrounded && p.onWall !== 0 && this.hasAbility('wall_jump') && p.vy > 115) {
      p.vy = 115;
    }

    const prevY = p.y;
    let nextY = p.y + p.vy * dt;

    // 0C. 室内宫殿藻井 / 城门石券洞 / 暗渠石拱顶真实头顶碰撞（竖井口与单向踏石从下方起跳完全敞开！）
    const ceilY = sampleCeilingY(room, p.x, bossCleared);
    if (ceilY > -100 && p.vy < 0 && nextY - p.h < ceilY) {
      nextY = ceilY + p.h;
      p.vy = 0;
    }
    if (p.vy < 0 && room.solidBlocks) {
      for (const sb of room.solidBlocks) {
        if (!sb.blocking) continue;
        if (
          p.x >= sb.x - 10 &&
          p.x <= sb.x + sb.w + 10 &&
          prevY - p.h >= sb.y + sb.h - 14 &&
          nextY - p.h < sb.y + sb.h
        ) {
          nextY = sb.y + sb.h + p.h;
          p.vy = 0;
        }
      }
    }

    p.onGround = false;

    // 0D. 石砌建筑台面、两级半阶踏步自动登阶、八卦法阵石阶与断崖高台着陆：
    // - 落地矮石阶 (`groundAtMid - sb.y <= 54`)：靠近左右 18px 踏步自动先升半阶、踏入主台面升至顶层，丝滑如真实拾级而上，且绝不下穿陷入石砖内！
    // - 八卦乾坤传送阵 (`room.special === 'warp_bagua'`)：靠近汉白玉前阶自动拾级登上发光阵眼台面 (`focalY - 26`)！
    if (room.solidBlocks) {
      const baseFloorHere = sampleSolidGroundY(room, p.x);
      for (const sb of room.solidBlocks) {
        const groundResting = isGroundRestingSolidBlock(room, sb);
        const stepRise = baseFloorHere - sb.y;
        const isLowGroundStep = groundResting && stepRise >= 16 && stepRise <= 54;
        if (!groundResting && p.dropThroughTimer > 0) continue;

        if (isLowGroundStep && p.vy >= -40) {
          const midStepY = Math.round(baseFloorHere - stepRise * 0.5);
          if (p.x >= sb.x - 4 && p.x <= sb.x + sb.w + 4) {
            if (prevY <= sb.y + 54 && nextY >= sb.y - 2) {
              p.y = sb.y;
              if (!wasGrounded && p.vy > 260) p.landSquash = 1;
              if (p.vy > 0) p.vy = 0;
              p.onGround = true;
              break;
            }
          } else if (
            ((sb.x > 44 && p.x >= sb.x - 20 && p.x < sb.x - 4) ||
              (sb.x + sb.w < room.pixelW - 44 && p.x > sb.x + sb.w + 4 && p.x <= sb.x + sb.w + 20)) &&
            prevY <= midStepY + 34 &&
            nextY >= midStepY - 2
          ) {
            p.y = midStepY;
            if (p.vy > 0) p.vy = 0;
            p.onGround = true;
            break;
          }
        } else if (p.x >= sb.x - 6 && p.x <= sb.x + sb.w + 6) {
          const landSnapTol = wasGrounded ? 12 : 5;
          if (p.vy >= 0 && prevY <= sb.y + landSnapTol && nextY >= sb.y) {
            p.y = sb.y;
            if (!wasGrounded && p.vy > 260) p.landSquash = 1;
            p.vy = 0;
            p.onGround = true;
            break;
          }
        }
      }
    }

    if (!p.onGround && room.special === 'warp_bagua' && p.vy >= -40) {
      const dxAltar = Math.abs(p.x - room.focalX);
      const topAltarY = room.focalY - 26;
      const midAltarY = room.focalY - 13;
      if (dxAltar <= 56 && prevY <= room.focalY + 8 && nextY >= topAltarY - 2) {
        p.y = topAltarY;
        if (p.vy > 0) p.vy = 0;
        p.onGround = true;
      } else if (dxAltar > 56 && dxAltar <= 78 && prevY <= room.focalY + 8 && nextY >= midAltarY - 2) {
        p.y = midAltarY;
        if (p.vy > 0) p.vy = 0;
        p.onGround = true;
      }
    }

    // 1. 检测雕栏阁台、旋转青铜机关齿轮踏板、高速配重升降梯、石壁顶端与竖井井口单向栈板着陆
    if (!p.onGround && p.vy >= 0 && p.dropThroughTimer <= 0) {
      const orbitPlats = getClockGearOrbitPlatforms(room, p.animTime);
      for (const op of orbitPlats) {
        const prevPlatX = op.x - op.vx * dt;
        const prevPlatY = op.y - op.vy * dt;
        const withinCurX = p.x >= op.x - 6 && p.x <= op.x + op.w + 6;
        const withinPrevX = p.x >= prevPlatX - 10 && p.x <= prevPlatX + op.w + 10;
        const stickyRide = wasGrounded && withinPrevX && Math.abs(prevY - prevPlatY) <= 18;
        const sweptLanding = withinCurX && prevY <= prevPlatY + 14 && nextY >= op.y - 6;
        if (stickyRide || sweptLanding) {
          p.y = op.y;
          p.x = Math.max(36, Math.min(room.pixelW - 36, p.x + op.vx * dt));
          if (!wasGrounded && p.vy > 260) p.landSquash = 1;
          p.vy = 0;
          p.onGround = true;
          break;
        }
      }

      if (!p.onGround) {
        for (const cs of this.liveCrumbleSlabs) {
          if (cs.state === 'broken') continue;
          if (p.x >= cs.x + 6 && p.x <= cs.x + cs.w - 6) {
            if (prevY <= cs.y + 12 && nextY >= cs.y) {
              p.y = cs.y;
              if (!wasGrounded && p.vy > 260) p.landSquash = 1;
              p.vy = 0;
              p.onGround = true;
              if (cs.state === 'solid') {
                cs.state = 'shaking';
                cs.timer = 0.55;
              }
              break;
            }
          }
        }
      }

      if (!p.onGround) {
        for (const pv of room.pavilions) {
          if (p.x >= pv.x - 4 && p.x <= pv.x + pv.w + 4) {
            const pvSnapTol = wasGrounded ? 10 : 5;
            if (prevY <= pv.y + pvSnapTol && nextY >= pv.y) {
              p.y = pv.y;
              if (!wasGrounded && p.vy > 260) p.landSquash = 1;
              p.vy = 0;
              p.onGround = true;
              break;
            }
          }
        }
      }
      if (!p.onGround && room.climbWalls) {
        for (const cw of room.climbWalls) {
          if (Math.abs(p.x - cw.x) <= 24 && prevY <= cw.topY + 12 && nextY >= cw.topY) {
            p.y = cw.topY;
            p.vy = 0;
            p.onGround = true;
            break;
          }
        }
      }
    }

    // 2. 检测连续起伏青石地面/石拱桥/多级丹陛台阶贴合（向下竖井处地面自动敞开下坠，未碎裂地石板保持实心！）
    if (!p.onGround) {
      const groundY = sampleGroundY(room, p.x, this.slot.brokenSecretWalls);
      if (wasGrounded && p.vy >= 0 && Math.abs(nextY - groundY) <= 36) {
        p.y = groundY;
        p.vy = 0;
        p.onGround = true;
      } else if (nextY >= groundY && p.vy >= 0) {
        p.y = groundY;
        if (!wasGrounded && p.vy > 260) p.landSquash = 1;
        p.vy = 0;
        p.onGround = true;
      } else {
        p.y = nextY;
      }
    }

    // 3. 赤火古窖熔金铁渠灼烧地形伤害（需二段跳/飞燕钩锁腾跃避开！）
    for (const wz of room.waterZones) {
      if (wz.liquidKind !== 'lava') continue;
      if (p.x >= wz.x1 + 14 && p.x <= wz.x2 - 14 && p.y >= wz.surfaceY - 4) {
        if (p.invulnTimer <= 0 && p.mistDashTimer <= 0) {
          this.damagePlayer(
            Math.max(18, Math.round(p.maxHp * 0.16)),
            p.facing === 1 ? -1 : 1
          );
        }
        p.vy = -530;
        p.onGround = false;
        this.spawnInkBurst(p.x, wz.surfaceY, '#fb923c', '#991b1b', 14);
        break;
      }
    }

    // 剑侠核心手感：跳斩落地瞬间自动取消空中挥剑后摇 + 落地水花/石阶烟尘 + 【千斤坠 ground_slam】震地火环！
    if (!wasGrounded && p.onGround) {
      const landWaterY = this.getShallowWaterSurfaceAt(p.x, p.y);
      if (landWaterY !== null) {
        this.spawnWaterSplash(p.x, landWaterY, 8, 1.05);
      } else {
        for (const side of [-1, 1]) {
          this.particles.push({
            kind: 'ink',
            x: p.x + side * 8,
            y: p.y - 2,
            vx: side * (36 + Math.random() * 28),
            vy: -14 - Math.random() * 18,
            size: 3.1,
            color: 'rgba(148, 163, 184, 0.58)',
            life: 0.25,
            maxLife: 0.25,
          });
        }
      }

      if (p.diveKicking && this.hasAbility('ground_slam')) {
        this.screenShake = Math.max(this.screenShake, 7);
        AudioFX.playSlash('heavy');
        this.spawnInkBurst(p.x, p.y - 8, '#fb923c', '#090d16', 22);
        this.damageEnemiesInBox(
          p.x - 105,
          p.y - 68,
          210,
          74,
          Math.round(p.atk * 1.25),
          true,
          45,
          'heavy'
        );
        for (const sh of room.shafts) {
          if (
            sh.dir === 'down' &&
            sh.sealId &&
            !this.slot.brokenSecretWalls.includes(sh.sealId) &&
            p.x >= sh.x1 - 24 &&
            p.x <= sh.x2 + 24
          ) {
            this.slot.brokenSecretWalls.push(sh.sealId);
            AudioFX.playParryClang();
            AudioFX.playRelicBell();
            this.screenShake = Math.max(this.screenShake, 10);
            NativeApp.haptic('heavy');
            this.spawnInkBurst((sh.x1 + sh.x2) * 0.5, p.y - 6, '#fbbf24', '#1e293b', 28);
            this.skillBanner = { name: '千斤破封 · 地脉暗井贯通', timer: 1.4, color: '#fb923c' };
            p.x = Math.max(sh.x1 + 22, Math.min(sh.x2 - 22, p.x));
            p.onGround = false;
            p.vy = 340;
            break;
          }
        }
      }
      p.diveKicking = false;
      p.groundSlamming = false;
      if (this.activeSlash && this.activeSlash.archetype !== 'greatsword') {
        this.activeSlash = null;
        p.attackCooldown = Math.min(p.attackCooldown, 0.04);
      }
    }
  }

  private tryGrappleOverheadLantern(): boolean {
    if (!this.room) return false;
    const p = this.player;
    let best: { x: number; y: number } | null = null;
    let bestDist = 235;
    for (const ln of this.room.lanterns) {
      if (ln.y >= p.y - 14) continue;
      const d = Math.hypot(ln.x - p.x, ln.y - (p.y - 40));
      if (d < bestDist) {
        bestDist = d;
        best = ln;
      }
    }
    if (!best) return false;

    const dx = best.x - p.x;
    p.facing = dx >= 0 ? 1 : -1;
    p.vx = Math.max(-420, Math.min(420, dx * 3.1));
    p.vy = -645;
    p.diveKicking = false;
    p.doubleJumpSpinTimer = 0.34;
    this.grappleTarget = { x: best.x, y: best.y };
    this.grappleLineTimer = 0.24;
    AudioFX.playJump();
    this.spawnInkBurst(best.x, best.y, '#fde047', '#ef4444', 14);
    return true;
  }

  private beginSmoothRoomTransition(
    nextRoom: BuiltRoom,
    nextX: number,
    nextY: number,
    walkVx: number,
    walkVy: number,
    postVy?: number
  ): void {
    if (this.pendingTransition) return;
    this.pendingTransition = {
      nextRoom,
      nextX,
      nextY,
      phase: 'out',
      timer: 0.16,
      duration: 0.16,
      walkVx,
      walkVy,
      postVy,
    };
  }

  private checkRoomTransition(): void {
    if (!this.room || !this.slot || this.pendingTransition) return;
    const room = this.room;

    if (this.ambushSealed || this.enemies.some((e) => e.profile.isBoss)) {
      this.player.x = Math.max(36, Math.min(room.pixelW - 36, this.player.x));
      return;
    }

    const p = this.player;
    const bossCleared = this.isBossClearedInRoom(room);

    // 1. 左右多层竖塔门廊与破壁密室无缝跨房（触发《恶魔城》经典渐暗入廊 -> 满黑切景 -> 渐明出廊双段过渡！）
    if (p.x < 14) {
      const tr = WorldMap.resolveTransition(room, 'left', p.y, this.slot.brokenSecretWalls);
      if (tr) {
        if (
          tr.backDoor?.secretWallId &&
          !this.slot.brokenSecretWalls.includes(tr.backDoor.secretWallId)
        ) {
          this.slot.brokenSecretWalls.push(tr.backDoor.secretWallId);
        }
        const lift = Math.max(-75, Math.min(0, p.y - tr.curFloorY));
        this.beginSmoothRoomTransition(
          tr.nextRoom,
          tr.nextX,
          Math.max(115, tr.nextFloorY + lift),
          -185,
          0
        );
        return;
      }
      p.x = 32;
    } else if (p.x > room.pixelW - 14) {
      const tr = WorldMap.resolveTransition(room, 'right', p.y, this.slot.brokenSecretWalls);
      if (tr) {
        if (
          tr.backDoor?.secretWallId &&
          !this.slot.brokenSecretWalls.includes(tr.backDoor.secretWallId)
        ) {
          this.slot.brokenSecretWalls.push(tr.backDoor.secretWallId);
        }
        const lift = Math.max(-75, Math.min(0, p.y - tr.curFloorY));
        this.beginSmoothRoomTransition(
          tr.nextRoom,
          tr.nextX,
          Math.max(115, tr.nextFloorY + lift),
          185,
          0
        );
        return;
      }
      p.x = room.pixelW - 32;
    }

    // 2. 向下坠入地宫暗井 / 天井竖井（贯通上下层房间！）
    if (p.y > room.pixelH - 8 && p.vy > 0) {
      const downTr = WorldMap.resolveVerticalShaft(
        room,
        p.x,
        'down',
        bossCleared,
        this.slot.brokenSecretWalls
      );
      if (downTr) {
        this.beginSmoothRoomTransition(downTr.nextRoom, downTr.nextX, downTr.nextY, 0, 260);
        return;
      }
      // 兜底防掉出界
      p.y = sampleSolidGroundY(room, p.x);
      p.vy = 0;
      p.onGround = true;
    }

    // 3. 向上纵跃冲出天井竖井直登二楼飞阁！（若上方井口盖有千斤坠裂地石板封印，禁止自下逆向顶破，必须自上层以千斤坠震开！）
    if (p.y - p.h < 8 && p.vy < 0) {
      const upTr = WorldMap.resolveVerticalShaft(
        room,
        p.x,
        'up',
        bossCleared,
        this.slot.brokenSecretWalls,
        false
      );
      if (upTr) {
        p.dropThroughTimer = 0;
        const targetFloor = sampleSolidGroundY(upTr.nextRoom, upTr.nextX);
        this.beginSmoothRoomTransition(
          upTr.nextRoom,
          upTr.nextX,
          targetFloor + 32,
          0,
          -240,
          -560
        );
      } else if (room.shafts.some((sh) => sh.dir === 'up' && p.x >= sh.x1 - 6 && p.x <= sh.x2 + 6)) {
        const blockedSeal = WorldMap.resolveVerticalShaft(
          room,
          p.x,
          'up',
          bossCleared,
          this.slot.brokenSecretWalls,
          true
        );
        if (blockedSeal?.matchSealId && performance.now() - this.lastSealHintMs > 1800) {
          this.lastSealHintMs = performance.now();
          this.floats.push({
            x: p.x,
            y: Math.max(48, p.y - p.h - 12),
            vy: -20,
            text: '上方石板封印 · 须自上层千斤坠震开',
            color: '#fcd34d',
            size: 12,
            life: 1.1,
          });
        }
        p.y = p.h + 8;
        p.vy = 0;
      }
    }
  }

  /**
   * 靠近 NPC / 镇魂祠 / 传送阵且身周 120px 内无近身妖邪威胁时，直接按【斩 / 攻】即可触发交互！
   */
  public canAttackTriggerInteract(): boolean {
    if (!this.nearbyInteract) return false;
    const p = this.player;
    return !this.enemies.some((e) => Math.hypot(e.x - p.x, e.y - p.y) < 120);
  }

  private updateNearbyInteract(): void {
    this.nearbyInteract = null;
    if (!this.room || !this.slot) return;
    const p = this.player;

    for (const npc of this.room.npcs) {
      const ny = sampleGroundY(this.room, npc.x);
      if (Math.abs(p.x - npc.x) < 72 && Math.abs(p.y - ny) < 78) {
        if (npc.id === 'ouye_can') {
          this.nearbyInteract = {
            kind: 'smith',
            label: '按【斩】淬炼神兵',
            x: npc.x,
            y: ny,
          };
        } else if (npc.id === 'bai_zhanggui') {
          this.nearbyInteract = {
            kind: 'merchant',
            label: '按【斩】鬼市交易',
            x: npc.x,
            y: ny,
          };
        } else {
          this.nearbyInteract = {
            kind: 'su_qingyan',
            label: `按【斩】与${npc.name}交谈`,
            x: npc.x,
            y: ny,
          };
        }
        return;
      }
    }

    if (
      this.room.id === 'sky_altar' &&
      this.slot.invertedUnlocked &&
      !this.enemies.some((e) => e.profile.isBoss)
    ) {
      const cx = this.room.focalX;
      const gy = sampleSolidGroundY(this.room, cx);
      if (Math.abs(p.x - cx) < 92 && Math.abs(p.y - gy) < 84) {
        this.nearbyInteract = {
          kind: 'invert_portal',
          label: this.room.realm === 'normal' ? '按【斩】踏入倒悬里城' : '按【斩】折返阳表玄城',
          x: cx,
          y: gy,
        };
        return;
      }
    }

    if (this.room.ironGate && !this.slot.brokenSecretWalls.includes(this.room.ironGate.id)) {
      const g = this.room.ironGate;
      if (g.gateKind === 'lever_shortcut') {
        const leverX = g.x + (g.leverSide === 'left' ? -64 : 64);
        const onLeverSide = g.leverSide === 'left' ? p.x < g.x : p.x > g.x;
        if (onLeverSide && Math.abs(p.x - leverX) < 58 && Math.abs(p.y - g.bottomY) < 64) {
          this.nearbyInteract = {
            kind: 'lever',
            gateId: g.id,
            label: '按【斩】扳动青铜枢机',
            x: leverX,
            y: g.bottomY,
          };
          return;
        }
      }
    }

    if (this.room.steles) {
      for (const st of this.room.steles) {
        const gy = sampleSolidGroundY(this.room, st.x);
        if (Math.abs(p.x - st.x) < 76 && Math.abs(p.y - gy) < 82) {
          const isRead = this.slot.readSteles?.includes(st.id);
          this.nearbyInteract = {
            kind: 'stele',
            steleId: st.id,
            label: isRead ? '按【斩】重温残碑秘档' : '按【斩】拓印血月残碑',
            x: st.x,
            y: gy,
          };
          return;
        }
      }
    }

    if (this.room.special === 'save_shrine') {
      const cx = this.room.focalX;
      const gy = this.room.focalY;
      if (Math.abs(p.x - cx) < 88 && Math.abs(p.y - gy) < 76) {
        this.nearbyInteract = {
          kind: 'save',
          label: '按【斩】焚香留档',
          x: cx,
          y: gy,
        };
      }
    } else if (this.room.special === 'warp_bagua') {
      const cx = this.room.focalX;
      const gy = this.room.focalY;
      if (Math.abs(p.x - cx) < 88 && Math.abs(p.y - gy) < 76) {
        this.nearbyInteract = {
          kind: 'warp',
          label: '按【斩】开启传送阵',
          x: cx,
          y: gy,
        };
      }
    }
  }

  private executeInteract(kind: NonNullable<GameEngine['nearbyInteract']>['kind']): void {
    if (!this.slot || !this.room) return;
    if (kind === 'lever' && this.room.ironGate) {
      this.openLeverGate(this.room.ironGate.id, this.room.ironGate.x, this.room.ironGate.bottomY);
      return;
    }
    if (kind === 'stele') {
      const steleId = this.nearbyInteract?.steleId;
      const entry = steleId ? LORE_STELES[steleId] : undefined;
      if (!steleId || !entry) return;
      if (!this.slot.readSteles) this.slot.readSteles = [];
      const firstRead = !this.slot.readSteles.includes(steleId);
      if (firstRead) {
        this.slot.readSteles.push(steleId);
        SaveManager.saveSlot(this.slot);
      }
      AudioFX.playRelicBell();
      NativeApp.haptic('medium');
      this.spawnInkBurst(this.player.x, this.player.y - 36, '#38bdf8', '#090d16', 18);
      const steleScene: StoryScene = {
        id: `stele_${steleId}`,
        title: entry.volume,
        lines: [
          {
            speaker: entry.title,
            role: `${entry.author} · ${entry.locationHint}`,
            portraitColor: '#38bdf8',
            text: entry.content,
          },
          ...(firstRead
            ? [
                {
                  speaker: '李逸承',
                  role: '已拓印收录至【兵匣 -> 列传】',
                  portraitColor: '#48c9b0',
                  text: `已将${entry.title}拓印入册（当前已集齐 ${this.slot.readSteles.length} / ${Object.keys(LORE_STELES).length} 卷血月残碑）。`,
                },
              ]
            : []),
        ],
      };
      this.cb.onStartStory(steleScene);
      return;
    }
    if (kind === 'save') {
      this.recalcStats(true);
      SaveManager.saveSlot(this.slot);
      AudioFX.playRelicBell();
      NativeApp.haptic('medium');
      this.spawnInkBurst(this.player.x, this.player.y - 36, '#fde047', '#090d16', 22);
      this.cb.onShowBanner('已留档', '');
    } else if (kind === 'warp') {
      SaveManager.saveSlot(this.slot);
      AudioFX.playRelicBell();
      NativeApp.haptic('medium');
      this.cb.onOpenInteractModal('warp');
    } else if (kind === 'invert_portal') {
      AudioFX.playSkillCast();
      NativeApp.haptic('heavy');
      const nextRealm: CastleRealm = this.room.realm === 'normal' ? 'inverted' : 'normal';
      this.warpToRoom(nextRealm, 'sky_altar');
    } else if (kind === 'su_qingyan') {
      let sc: StoryScene | undefined;
      if (this.room.id === 'gate_1' && !this.slot.triggeredStories.includes('su_gate_chat')) {
        this.slot.triggeredStories.push('su_gate_chat');
        SaveManager.saveSlot(this.slot);
        sc = STORY_SCENES.su_gate_chat;
      } else if (
        this.room.id === 'upper_library' &&
        !this.slot.triggeredStories.includes('meet_library_su')
      ) {
        this.slot.triggeredStories.push('meet_library_su');
        SaveManager.saveSlot(this.slot);
        sc = STORY_SCENES.meet_library_su;
      } else {
        sc = getDynamicSuQingyanScene(this.slot, this.room.id);
      }
      if (sc) {
        this.cb.onStartStory(sc);
      }
    } else if (kind === 'smith' || kind === 'merchant') {
      const firstMeetKey = kind === 'smith' ? 'meet_smith_ouye' : 'meet_merchant_bai';
      const firstScene = STORY_SCENES[firstMeetKey];
      if (
        this.slot.mode === 'story' &&
        firstScene &&
        !this.slot.triggeredStories.includes(firstMeetKey)
      ) {
        this.slot.triggeredStories.push(firstMeetKey);
        SaveManager.saveSlot(this.slot);
        this.cb.onStartStory(firstScene, () => {
          this.cb.onOpenInteractModal(kind);
        });
      } else {
        this.cb.onOpenInteractModal(kind);
      }
    }
  }

  public getUnlockedWarpStops(): {
    realm: CastleRealm;
    roomId: string;
    name: string;
    stageTitle: string;
    mapX: number;
    mapY: number;
    gridW: number;
    gridH: number;
  }[] {
    if (!this.slot) return [];
    const stops: {
      realm: CastleRealm;
      roomId: string;
      name: string;
      stageTitle: string;
      mapX: number;
      mapY: number;
      gridW: number;
      gridH: number;
    }[] = [];
    for (const realm of ['normal', 'inverted'] as CastleRealm[]) {
      if (realm === 'inverted' && !this.slot.invertedUnlocked) continue;
      const realmStops = WorldMap.getAllRooms(realm)
        .filter(
          (rm) =>
            rm.special === 'warp_bagua' &&
            Boolean(rm.warpName) &&
            this.slot!.visitedRooms.includes(`${realm}:${rm.id}`)
        )
        .sort((a, b) => a.mapX - b.mapX || a.mapY - b.mapY);
      for (const rm of realmStops) {
        stops.push({
          realm,
          roomId: rm.id,
          name: rm.warpName!,
          stageTitle:
            realm === 'inverted'
              ? INVERTED_REGION_NAMES[rm.region]
              : REGION_NAMES[rm.region],
          mapX: rm.mapX,
          mapY: rm.mapY,
          gridW: rm.gridW,
          gridH: rm.gridH,
        });
      }
    }
    return stops;
  }

  public getTalismanWarpStops(): ReturnType<GameEngine['getUnlockedWarpStops']> {
    const warps = this.getUnlockedWarpStops();
    if (warps.length > 0 || !this.slot) return warps;
    const shrines: ReturnType<GameEngine['getUnlockedWarpStops']> = [];
    for (const realm of ['normal', 'inverted'] as CastleRealm[]) {
      if (realm === 'inverted' && !this.slot.invertedUnlocked) continue;
      for (const rm of WorldMap.getAllRooms(realm)) {
        if (rm.special === 'save_shrine' && this.slot.visitedRooms.includes(`${realm}:${rm.id}`)) {
          shrines.push({
            realm,
            roomId: rm.id,
            name: rm.name,
            stageTitle: realm === 'inverted' ? INVERTED_REGION_NAMES[rm.region] : REGION_NAMES[rm.region],
            mapX: rm.mapX,
            mapY: rm.mapY,
            gridW: rm.gridW,
            gridH: rm.gridH,
          });
        }
      }
    }
    if (shrines.length === 0) {
      const outpost = WorldMap.getRoom('normal', 'bamboo_outpost');
      if (outpost) {
        shrines.push({
          realm: 'normal',
          roomId: outpost.id,
          name: outpost.name,
          stageTitle: REGION_NAMES[outpost.region],
          mapX: outpost.mapX,
          mapY: outpost.mapY,
          gridW: outpost.gridW,
          gridH: outpost.gridH,
        });
      }
    }
    return shrines.sort((a, b) => a.mapX - b.mapX || a.mapY - b.mapY);
  }

  public claimBounty(bountyId: string): boolean {
    const s = this.slot;
    if (!s) return false;
    if (!s.claimedBounties) s.claimedBounties = [];
    if (s.claimedBounties.includes(bountyId)) return false;
    const b = CASTLE_BOUNTIES.find((x) => x.id === bountyId);
    if (!b || b.getProgress(s) < b.targetCount) return false;

    s.claimedBounties.push(bountyId);
    s.gold += b.rewardGold;
    if (b.rewardConsumables) {
      for (const [cid, qty] of Object.entries(b.rewardConsumables)) {
        s.consumables[cid] = (s.consumables[cid] || 0) + qty;
      }
    }
    if (b.rewardMaxHp) s.maxHpBonus += b.rewardMaxHp;
    if (b.rewardMaxMp) s.maxMpBonus += b.rewardMaxMp;
    this.recalcStats(false);
    SaveManager.saveSlot(s);
    AudioFX.playRelicBell();
    NativeApp.haptic('medium');
    this.spawnInkBurst(this.player.x, this.player.y - 40, '#fde047', '#2dd4bf', 20);
    return true;
  }

  // 喷溅定向拉长水墨飞白与刀锋金铁火星（彻底告别廉价圆点粒子！）
  public spawnInkBurst(
    x: number,
    y: number,
    accentColor: string,
    inkColor: string,
    count: number
  ): void {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const isInk = i % 2 === 0;
      const spd = isInk ? 70 + Math.random() * 190 : 120 + Math.random() * 290;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - (isInk ? 35 : 55),
        size: isInk ? 1.6 + Math.random() * 1.8 : 1.4 + Math.random() * 1.4,
        color: isInk ? inkColor : accentColor,
        life: isInk ? 0.2 + Math.random() * 0.18 : 0.16 + Math.random() * 0.16,
        maxLife: 0.38,
        kind: isInk ? 'ink' : 'spark',
      });
    }
  }

  private updateParticles(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vx *= Math.pow(0.22, dt);
      pt.vy += 420 * dt;
    }
    for (let i = this.slashImpacts.length - 1; i >= 0; i--) {
      this.slashImpacts[i].life -= dt;
      if (this.slashImpacts[i].life <= 0) {
        this.slashImpacts.splice(i, 1);
      }
    }
    for (let i = this.floats.length - 1; i >= 0; i--) {
      const fl = this.floats[i];
      fl.life -= dt;
      fl.y += fl.vy * dt;
      if (fl.life <= 0) this.floats.splice(i, 1);
    }
    for (let i = this.afterImages.length - 1; i >= 0; i--) {
      this.afterImages[i].alpha -= dt * 2.8;
      if (this.afterImages[i].alpha <= 0) this.afterImages.splice(i, 1);
    }
    for (let i = this.dyingSouls.length - 1; i >= 0; i--) {
      this.dyingSouls[i].timer -= dt;
      if (this.dyingSouls[i].timer <= 0) this.dyingSouls.splice(i, 1);
    }
    for (let i = this.lightningArcs.length - 1; i >= 0; i--) {
      this.lightningArcs[i].life -= dt;
      if (this.lightningArcs[i].life <= 0) this.lightningArcs.splice(i, 1);
    }
  }
}
