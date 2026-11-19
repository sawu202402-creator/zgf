import { AudioFX } from '../audio/GuofengAudio';
import { BOSS_RUSH_ORDER, ENEMY_PROFILES, EnemyProfile } from '../data/enemies';
import {
  ABILITIES_META,
  ARMORS,
  CONSUMABLES,
  SKILLS,
  SUB_WEAPONS,
  WEAPONS,
  YAO_CORES,
} from '../data/itemsAndSkills';
import { STORY_SCENES } from '../data/storyAndNpcs';
import {
  BuiltRoom,
  CELL_PIXEL_W,
  getRoomSideDoors,
  sampleCeilingY,
  sampleEntitySurfaceY,
  sampleGroundY,
  sampleSolidGroundY,
  WorldMap,
} from '../data/worldMap';
import { getClockGearOrbitPlatforms } from './GuofengWorldArt';
import { SaveManager } from '../meta/SaveManager';
import { NativeApp } from '../platform/NativeAppBridge';
import {
  AbilityKey,
  CastleRealm,
  EnemyKind,
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
  comboStep: number;
  pogoDown: boolean;
  progress: number; // 0..1 (0..0.28 前摇蓄势, 0.28..0.82 刀光挥斩判定, 0.82..1 收刀余韵)
  duration: number;
  reachX: number;
  reachY: number;
  color: string;
  glowColor: string;
  slammedGround?: boolean;
}

export interface Projectile {
  fromPlayer: boolean;
  kind: 'qi_wave' | 'dagger' | 'holy_fire' | 'fire_pillar' | 'bagua' | 'seal' | 'ink_spear';
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
  hitIds: Set<number>;
}

export interface SkyStrikeTelegraph {
  x: number;
  groundY: number;
  timer: number;
  maxTimer: number;
  dmg: number;
}

export type EnemyAIState = 'stalk' | 'windup' | 'lunge_slash' | 'recover' | 'staggered';

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
  aiState: EnemyAIState;
  stateTimer: number;
  animPhase: number;
  hurtFlash: number;
  baseY: number;
  bossMoveIdx: number;
  slashHitPlayer: boolean;
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
  vy: number;
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
  onOpenInteractModal: (kind: 'smith' | 'merchant' | 'warp') => void;
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
    orbitSwordTimer: 0,
    orbitAngle: 0,
    animTime: 0,
    runCycle: 0,
    landSquash: 0,
    sprintTimer: 0,
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

  public activeSlash: ActiveSlash | null = null;
  private slashHitIds = new Set<number>();
  private kickHitIds = new Set<number>();
  public skillBanner: { name: string; timer: number; color: string } | null = null;
  public taijiFlashTimer = 0;
  public soulStealFlashTimer = 0;
  public levelUpPillarTimer = 0;
  public grappleLineTimer = 0;
  public grappleTarget: { x: number; y: number } | null = null;

  public enemies: EnemyEntity[] = [];
  public dyingSouls: DyingEnemySoul[] = [];
  public liveLanterns: BreakableLanternEntity[] = [];
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
  private hitstopTimer = 0;
  private nextEntityId = 1;
  private lastVisitedRegion = '';
  public nearbyInteract: {
    kind: 'save' | 'warp' | 'smith' | 'merchant' | 'su_qingyan' | 'invert_portal';
    label: string;
    x: number;
    y: number;
  } | null = null;

  constructor(
    public input: InputController,
    private cb: EngineCallbacks
  ) {}

  public startSession(slot: SaveSlotData): void {
    this.slot = slot;
    this.paused = false;
    this.bossRushWave = 0;
    this.recalcStats(true);

    if (slot.mode === 'boss_rush') {
      const arena = WorldMap.getRoom('normal', 'boss_rush_arena');
      this.loadRoom(arena, 260, sampleGroundY(arena, 260));
      return;
    }

    const startRoom = WorldMap.getRoom(slot.currentRealm, slot.currentRoomId);
    const spawnX =
      startRoom.id === 'gate_1' && startRoom.realm === 'normal' ? 190 : startRoom.focalX;
    this.loadRoom(startRoom, spawnX, sampleEntitySurfaceY(startRoom, spawnX, startRoom.focalY));
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

    const weapon = WEAPONS[wId] || WEAPONS.sword_1;
    const armor = ARMORS[aId] || ARMORS.cloth_tunic;
    const acc = ARMORS[accId] || ARMORS.broken_jade;
    const core = cId ? YAO_CORES[cId] : undefined;

    const lv = s.level;
    const str = 7 + lv * 2 + armor.strBonus + acc.strBonus;
    const con = 6 + Math.floor(lv * 1.6) + Math.floor(armor.def * 0.5);
    const intStat = 7 + lv * 2 + armor.intBonus + acc.intBonus;
    const lck = 5 + lv + armor.lckBonus + acc.lckBonus;

    const maxHp = 95 + lv * 16 + s.maxHpBonus + armor.hpBonus + acc.hpBonus;
    const maxMp = 60 + lv * 9 + s.maxMpBonus + armor.mpBonus + acc.mpBonus;
    const temperBonus = (s.weaponTemperLv?.[wId] || 0) * 6;
    let atk = Math.round((weapon.atk + temperBonus + str * 1.55) * (1 + (core?.atkPct || 0)));
    if (s.mode === 'xiaoduanshui') atk = Math.round(atk * 1.2);
    const def = 3 + Math.floor(lv * 1.2) + armor.def + acc.def;

    return { maxHp, maxMp, atk, def, str, con, int: intStat, lck };
  }

  public recalcStats(fullRestore = false): void {
    const s = this.slot;
    if (!s) return;

    const weapon = WEAPONS[s.equippedWeapon] || WEAPONS.sword_1;
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
    this.player.critChance = Math.min(
      0.75,
      0.06 + weapon.critBonus + st.lck * 0.004 + (core?.critPct || 0)
    );
    const baseSpd =
      weapon.archetype === 'greatsword'
        ? 0.94
        : weapon.archetype === 'daggers'
          ? 1.14
          : s.mode === 'xiaoduanshui'
            ? 1.16
            : 1.04;
    this.player.speedMult = baseSpd + (core?.speedPct || 0);
    this.player.lifesteal = core?.lifestealRatio || 0;

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
    } else if (room.region === 'library' || room.region === 'opera') {
      AudioFX.setMood('library');
    } else if (room.region === 'clock_tower') {
      AudioFX.setMood('clock');
    } else if (room.region === 'prison' || room.region === 'forge') {
      AudioFX.setMood('prison');
    } else {
      AudioFX.setMood('castle');
    }
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
    const localGy = Math.max(
      0,
      Math.min(this.room.gridH - 1, Math.floor((this.player.y / Math.max(1, this.room.pixelH)) * this.room.gridH))
    );
    const cellKey = `cell:${this.room.realm}:${this.room.mapX + localGx},${this.room.mapY + localGy}`;
    if (!this.slot.visitedRooms.includes(cellKey)) {
      this.slot.visitedRooms.push(cellKey);
      const pct = WorldMap.calcExplorationPct(this.slot.visitedRooms);
      if (pct > SaveManager.getMeta().bestExplorationPct) {
        SaveManager.saveMeta({ bestExplorationPct: pct });
      }
    }
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
    this.roomFadeTimer = 0.22;
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
    this.camX = this.player.x + this.player.facing * 50;
    this.camY = this.player.y - 95;

    this.enemies = [];
    this.dyingSouls = [];
    this.projectiles = [];
    this.skyStrikes = [];
    this.drops = [];
    this.slashImpacts = [];
    this.activeSlash = null;
    this.player.diveKicking = false;
    this.player.slideTimer = 0;
    this.familiar.x = entryX - this.player.facing * 32;
    this.familiar.y = entryY - 68;
    this.familiar.swoopTimer = 0;
    this.secretWallHits.clear();

    // 恶魔城经典机制：每个房间的红绸宫灯皆可挥兵击碎爆出灵符/纹银，并在跨房重进时自动复燃！
    this.liveLanterns = nextRoom.torches.map((tc, idx) => ({
      id: idx + 1,
      x: tc.x,
      y: tc.y,
      broken: false,
    }));

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
        this.spawnEnemy(nextRoom.bossKind, nextRoom.focalX, nextRoom.focalY);
      }
    }

    // 仅在踏入全新大区域或特殊密室时弹出区域横幅（零赘字副标题，保持恶魔城丝滑留白体验！）
    if (prevRegion !== nextRoom.region || nextRoom.special === 'boss_room') {
      if (visitKey !== this.lastVisitedRegion) {
        this.lastVisitedRegion = visitKey;
        this.cb.onShowBanner(nextRoom.name, '');
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
        this.cb.onStartStory(scene);
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
   * 六阶循序渐进区域难度曲线：
   * 第一阶（瓮城古桥）平易近人供熟悉身法；随深入正殿 ➔ 寒潭藏书阁 ➔ 梨园赤火窖 ➔ 观星阁钟楼祭天坛 ➔ 180°倒悬里城层层递进！
   */
  private getRoomDifficultyScale(room: BuiltRoom): { hpMult: number; atkMult: number; spdMult: number } {
    let hpMult = 1.0;
    let atkMult = 1.0;
    let spdMult = 1.0;

    if (room.id === 'east_outer_tower' || room.region === 'clock_tower' || room.region === 'altar') {
      hpMult = 2.35;
      atkMult = 1.88;
      spdMult = 1.2;
    } else if (room.region === 'opera' || room.region === 'forge') {
      if (room.id === 'alchemy_lab') {
        hpMult = 1.32;
        atkMult = 1.24;
        spdMult = 1.06;
      } else {
        hpMult = 1.95;
        atkMult = 1.65;
        spdMult = 1.15;
      }
    } else if (room.region === 'prison' || room.region === 'library') {
      hpMult = 1.62;
      atkMult = 1.44;
      spdMult = 1.1;
    } else if (room.region === 'main_hall' || room.id === 'west_armory_secret') {
      hpMult = 1.3;
      atkMult = 1.22;
      spdMult = 1.05;
    }

    if (room.realm === 'inverted') {
      hpMult *= 1.68;
      atkMult *= 1.38;
      spdMult *= 1.1;
    }

    return { hpMult, atkMult, spdMult };
  }

  private spawnEnemy(kind: EnemyKind, x: number, y: number): void {
    const baseProf = ENEMY_PROFILES[kind];
    const scale =
      this.room && !baseProf.isBoss
        ? this.getRoomDifficultyScale(this.room)
        : this.room?.realm === 'inverted' && baseProf.kind !== 'boss_zhuyin'
          ? { hpMult: 1.55, atkMult: 1.35, spdMult: 1.12 }
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
            exp: Math.round(baseProf.exp * (0.7 + scale.hpMult * 0.3)),
            gold: Math.round(baseProf.gold * (0.75 + scale.hpMult * 0.25)),
          };

    this.enemies.push({
      id: this.nextEntityId++,
      profile: prof,
      x,
      y: prof.flying ? y - 92 : y,
      baseY: prof.flying ? y - 92 : y,
      vx: 0,
      vy: 0,
      facing: -1,
      hp: prof.hp,
      hpTrail: prof.hp,
      maxHp: prof.hp,
      aiState: 'stalk',
      stateTimer: 0.45 + Math.random() * 0.45,
      animPhase: Math.random() * 6,
      hurtFlash: 0,
      bossMoveIdx: 0,
      slashHitPlayer: false,
    });
  }

  public hasAbility(key: AbilityKey): boolean {
    return Boolean(this.slot?.abilities.includes(key));
  }

  public grantAbility(key: AbilityKey): void {
    if (!this.slot) return;
    if (!this.slot.abilities.includes(key)) {
      this.slot.abilities.push(key);
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

    if (!this.slot || !this.room || this.paused || this.landscapePaused || this.input.uiBlocked) {
      return;
    }

    const dt = Math.min(0.033, rawDt);
    this.slot.playTimeSec += dt;

    // 平滑延迟残血烧灼槽 (Sekiro / 斩妖行 打击反馈核心细节)
    if (this.player.hpTrail > this.player.hp) {
      this.player.hpTrail = Math.max(this.player.hp, this.player.hpTrail - 48 * dt);
    } else {
      this.player.hpTrail = this.player.hp;
    }

    if (this.roomFadeTimer > 0) this.roomFadeTimer = Math.max(0, this.roomFadeTimer - dt);
    if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt * 28);
    if (this.taijiFlashTimer > 0) this.taijiFlashTimer = Math.max(0, this.taijiFlashTimer - dt);
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

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.updateParticles(dt);
      return;
    }

    // 降低纯挂机回蓝，改为“以战养气”（近战挥砍命中敌人额外回复真气，鼓励积极拼刀博弈！）
    const core = this.slot.equippedYaoCore ? YAO_CORES[this.slot.equippedYaoCore] : undefined;
    const mpRegen = 1.05 + this.player.int * 0.065 + (core?.mpRegenBonus || 0) * 0.65;
    this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpRegen * dt);

    this.updatePlayer(dt);
    this.updateSwordFamiliar(dt);
    this.markCurrentMapCellVisited();
    this.updateCamera(dt);
    this.updateActiveSlash(dt);
    this.updateOrbitSwords(dt);
    this.updateProjectiles(dt);
    this.updateSkyStrikes(dt);
    this.updateEnemies(dt);
    this.updateDrops(dt);
    this.updateParticles(dt);
    this.checkRoomTransition();
    this.updateNearbyInteract();
  }

  private updateCamera(dt: number): void {
    const p = this.player;
    const targetX = p.x + p.facing * 55;
    const targetY = p.y - 98;
    const smooth = 1 - Math.pow(0.0006, dt);
    this.camX += (targetX - this.camX) * smooth;
    this.camY += (targetY - this.camY) * smooth;
  }

  private updatePlayer(dt: number): void {
    const p = this.player;
    const inp = this.input;
    p.animTime += dt;

    if (p.invulnTimer > 0) p.invulnTimer -= dt;
    if (p.attackCooldown > 0) p.attackCooldown -= dt;
    if (p.doubleJumpSpinTimer > 0) p.doubleJumpSpinTimer = Math.max(0, p.doubleJumpSpinTimer - dt);
    if (p.landSquash > 0) p.landSquash = Math.max(0, p.landSquash - dt * 5);
    if (p.comboResetTimer > 0) {
      p.comboResetTimer -= dt;
      if (p.comboResetTimer <= 0) p.comboStep = 0;
    }
    if (p.dropThroughTimer > 0) p.dropThroughTimer -= dt;

    if (inp.consumeWeaponSwap()) {
      this.cycleWeapon();
    }
    if (inp.consumePotion()) {
      this.useQuickHealPotion();
    }
    if (inp.consumeInteract() && this.nearbyInteract) {
      this.executeInteract(this.nearbyInteract.kind);
      return;
    }

    // 疾退残影步 / 缩地化雾取消硬直
    if (inp.consumeDash()) {
      if (this.hasAbility('mist_dash') && p.mistDashTimer <= 0) {
        p.mistDashTimer = 0.25;
        p.invulnTimer = Math.max(p.invulnTimer, 0.3);
        const dir = inp.moveX !== 0 ? (Math.sign(inp.moveX) as 1 | -1) : p.facing;
        p.facing = dir;
        p.vx = dir * 560;
        p.vy = 0;
        AudioFX.playJump();
        NativeApp.haptic('light');
        this.spawnInkBurst(p.x, p.y - 36, '#a855f7', '#090d16', 14);
      } else if (p.backdashTimer <= 0) {
        p.backdashTimer = 0.22;
        p.invulnTimer = Math.max(p.invulnTimer, 0.16);
        p.attackCooldown = 0;
        this.activeSlash = null;
        p.vx = -p.facing * 450;
        AudioFX.playJump();
        this.spawnInkBurst(p.x, p.y - 8, '#94a3b8', '#0f172a', 6);
      }
    }

    if (inp.consumeSubWeapon()) {
      this.castSubWeapon();
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
        p.jumpBuffer = 0;
        AudioFX.playJump();
        this.spawnInkBurst(p.x - kickDir * 14, p.y - 24, '#fde047', '#1e293b', 10);
      } else if (p.airJumpsLeft > 0) {
        p.airJumpsLeft--;
        p.vy = -590;
        p.doubleJumpSpinTimer = 0.34;
        p.diveKicking = false;
        p.jumpBuffer = 0;
        AudioFX.playJump();
        this.spawnInkBurst(p.x, p.y - 18, '#2dd4bf', '#0f172a', 12);
      } else if (!p.onGround && this.hasAbility('grapple_hook') && this.tryGrappleOverheadLantern()) {
        p.jumpBuffer = 0;
      } else if (
        !p.onGround &&
        inp.moveY > 0.5 &&
        this.hasAbility('double_jump') &&
        !p.diveKicking
      ) {
        // 致敬《月下夜想曲》阿鲁卡多标志性体术二：【凌空飞踢 (`二段跳后 ↓ + 跃`)】，踩怪/踩宫灯自动弹起！
        p.diveKicking = true;
        p.jumpBuffer = 0;
        if (inp.moveX !== 0) p.facing = Math.sign(inp.moveX) as 1 | -1;
        p.vx = p.facing * 395;
        p.vy = 560;
        this.kickHitIds.clear();
        AudioFX.playSlash('spear');
      }
    }

    if (!inp.jumpHeld && p.vy < -220 && !p.diveKicking) {
      p.vy *= 0.62;
    }

    // 地面按住 ↓ 进入低姿下蹲（可躲避书妖符弹与高处横斩，按斩使出低身刺剑！）
    p.crouching = p.onGround && inp.moveY > 0.55 && p.slideTimer <= 0 && !this.isOnPavilionDeck();

    // 攻击、靠近人物/古祠/法阵时直接按【斩】交互对话，以及【↑ + 斩】奇门副器与手搓绝学
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
        this.performWeaponAttack();
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
      p.vx = p.facing * 395;
      p.vy = 560;
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
          p.diveKicking = false;
          p.vy = -520;
          p.vx = -p.facing * 140;
          AudioFX.playJump();
          break;
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
    } else if (this.activeSlash && p.onGround && this.activeSlash.progress < 0.42) {
      p.vx *= 0.88;
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
          if (Math.floor(p.runCycle * 0.5) !== prevStep && p.sprintTimer > 0.25) {
            this.particles.push({
              kind: 'ink',
              x: p.x - p.facing * 10,
              y: p.y - 2,
              vx: -p.facing * (45 + Math.random() * 35),
              vy: -18 - Math.random() * 24,
              size: 2.6,
              color: 'rgba(148, 163, 184, 0.55)',
              life: 0.24,
              maxLife: 0.24,
            });
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

  private updateSwordFamiliar(dt: number): void {
    if (!this.slot || !this.room || !this.hasAbility('familiar_sword')) return;
    const p = this.player;
    const fam = this.familiar;

    if (fam.calloutTimer > 0) fam.calloutTimer -= dt;
    if (fam.cooldown > 0) fam.cooldown -= dt;

    // 靠近未击碎的暗裂砖墙时，剑灵无字星芒闪耀提示（0文字干扰！）
    if (this.room.secretWalls && fam.calloutTimer <= 0) {
      for (const sw of this.room.secretWalls) {
        if (this.slot.brokenSecretWalls.includes(sw.id)) continue;
        if (Math.hypot(sw.x - p.x, sw.y + sw.h * 0.5 - (p.y - 36)) < 165) {
          fam.calloutText = '';
          fam.calloutTimer = 2.6;
          this.spawnInkBurst(sw.x + sw.w * 0.5, sw.y + sw.h * 0.5, '#38bdf8', '#fde047', 6);
          break;
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
    const anchorX = p.x - p.facing * 34;
    const anchorY = p.y - 70 + Math.sin(p.animTime * 3.8) * 6;
    fam.x += (anchorX - fam.x) * Math.min(1, dt * 8.5);
    fam.y += (anchorY - fam.y) * Math.min(1, dt * 8.5);
    fam.facing = p.facing;

    // 自动索敌御剑飞刺！
    if (fam.cooldown <= 0 && this.enemies.length > 0) {
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
        const famLv = 1 + Math.min(8, Math.floor((this.slot.familiarExp || 0) / 100));
        fam.cooldown = Math.max(1.05, 1.85 - famLv * 0.08);
        fam.swoopTimer = 0.32;
        fam.targetX = nearest.x;
        fam.targetY = nearest.y - nearest.profile.h * 0.55;
        fam.facing = nearest.x >= fam.x ? 1 : -1;
        const dmg = Math.max(8, Math.round(p.atk * (0.45 + famLv * 0.07)));
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
    }
  }

  private performWeaponAttack(): void {
    if (!this.slot) return;
    const p = this.player;
    const w = WEAPONS[this.slot.equippedWeapon] || WEAPONS.sword_1;
    const arch = w.archetype;

    const maxSteps = arch === 'greatsword' || arch === 'whip' ? 2 : 3;
    p.comboStep = (p.comboStep + 1) % maxSteps;
    p.comboResetTimer = 0.78;

    let duration = 0.24;
    let cd = 0.2;
    if (arch === 'greatsword') {
      duration = 0.44;
      cd = 0.42;
    } else if (arch === 'daggers') {
      duration = 0.16;
      cd = 0.12;
      if (!p.onGround && p.vy > -45) p.vy = -48; // 双刺空中乱舞短暂滞空！
    } else if (arch === 'spear') {
      duration = 0.27;
      cd = 0.23;
    } else if (arch === 'whip') {
      duration = 0.32;
      cd = 0.29;
    } else if (p.comboStep === 2) {
      duration = 0.3;
      cd = 0.22;
    }
    p.attackCooldown = cd;

    if (p.onGround) {
      const stepV =
        arch === 'greatsword'
          ? 145
          : arch === 'daggers'
            ? 85
            : arch === 'whip'
              ? 40
              : p.comboStep === 2
                ? 210
                : 105;
      p.vx = p.facing * stepV;
    }

    const pogoDown = arch === 'sword' && !p.onGround && this.input.moveY > 0.5;

    // 终极三阶名剑【七星龙渊剑】第三式普攻自带一道剑芒破空！
    if (w.id === 'sword_3' && p.comboStep === 2) {
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

    this.slashHitIds.clear();
    this.activeSlash = {
      x: p.x,
      y: p.y - 40,
      facing: p.facing,
      aimX: this.input.moveX !== 0 ? this.input.moveX : p.facing,
      aimY: this.input.moveY,
      archetype: arch,
      comboStep: p.comboStep,
      pogoDown,
      progress: 0,
      duration,
      reachX: Math.max(w.reachX + 20, arch === 'greatsword' ? 128 : 74),
      reachY: Math.max(w.reachY + 14, arch === 'greatsword' ? 105 : 48),
      color: w.color,
      glowColor: w.glowColor,
      slammedGround: false,
    };

    AudioFX.playSlash(arch === 'greatsword' || arch === 'whip' ? 'heavy' : 'light');
  }

  private tryCastMartialSkill(skillId: SkillId): boolean {
    if (!this.slot) return false;
    const sk = SKILLS[skillId];
    const p = this.player;
    if (p.mp < sk.mpCost) {
      this.floats.push({
        x: p.x,
        y: p.y - 82,
        vy: -36,
        text: '真气不足',
        color: '#94a3b8',
        size: 13,
        life: 0.75,
      });
      return false;
    }

    if (!this.slot.learnedSkills.includes(skillId)) {
      this.slot.learnedSkills.push(skillId);
    }

    p.mp -= sk.mpCost;
    p.attackCooldown = 0.26;
    AudioFX.playSkillCast();
    NativeApp.haptic('medium');

    const skillDmg = Math.round((p.atk + p.int * 1.6) * sk.dmgMult);
    const w = WEAPONS[this.slot.equippedWeapon] || WEAPONS.sword_1;
    const isHeavy = w.archetype === 'greatsword';

    if (skillId === 'shuofeng_wave') {
      this.projectiles.push({
        fromPlayer: true,
        kind: 'qi_wave',
        x: p.x + p.facing * 32,
        y: p.y - 38,
        vx: p.facing * (isHeavy ? 480 : 620),
        vy: 0,
        r: isHeavy ? 46 : 34,
        dmg: skillDmg,
        color: isHeavy ? '#f97316' : '#2dd4bf',
        life: 0.95,
        maxLife: 0.95,
        pierce: 99,
        hitIds: new Set(),
      });
      this.spawnInkBurst(p.x + p.facing * 26, p.y - 38, isHeavy ? '#fb923c' : '#2dd4bf', '#090d16', 16);
    } else if (skillId === 'shunying_flash') {
      const startX = p.x;
      const endX = Math.max(40, Math.min((this.room?.pixelW || 2000) - 40, startX + p.facing * 230));
      p.invulnTimer = Math.max(p.invulnTimer, 0.4);
      for (let i = 1; i <= 6; i++) {
        const ix = startX + ((endX - startX) * i) / 6;
        this.afterImages.push({ x: ix, y: p.y, facing: p.facing, color: '#fde68a', alpha: 0.85 });
      }
      p.x = endX;
      p.y = Math.min(p.y, sampleGroundY(this.room!, p.x));
      this.slashImpacts.push({
        x: (startX + endX) * 0.5,
        y: p.y - 42,
        angle: 0,
        length: Math.abs(endX - startX) * 0.68,
        thickness: 9,
        color: '#fde68a',
        ringRadius: 52,
        life: 0.26,
        maxLife: 0.26,
      });
      const minX = Math.min(startX, endX) - 24;
      const maxX = Math.max(startX, endX) + 24;
      this.damageEnemiesInBox(minX, p.y - 84, maxX - minX, 92, skillDmg, true, 50);
      this.screenShake = 6;
    } else if (skillId === 'jinghong_rising') {
      p.vy = -660;
      p.onGround = false;
      p.invulnTimer = Math.max(p.invulnTimer, 0.42);
      this.slashImpacts.push({
        x: p.x + p.facing * 18,
        y: p.y - 68,
        angle: -Math.PI * 0.46 * p.facing,
        length: 96,
        thickness: 11,
        color: '#38bdf8',
        ringRadius: 48,
        life: 0.28,
        maxLife: 0.28,
      });
      this.damageEnemiesInBox(p.x - 66, p.y - 140, 132, 146, skillDmg, true, 50);
      this.spawnInkBurst(p.x, p.y - 48, '#38bdf8', '#090d16', 22);
      this.screenShake = 5;
    } else if (skillId === 'taiji_parry') {
      // ↓↙← + 斩：太极震气弹反一闪！若敌方正处于出招前摇(windup)或扑斩(lunge_slash)，触发【金铁弹反大破招】！
      this.taijiFlashTimer = 0.42;
      p.invulnTimer = Math.max(p.invulnTimer, 0.48);
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const pr = this.projectiles[i];
        if (!pr.fromPlayer && Math.hypot(pr.x - p.x, pr.y - (p.y - 38)) <= 175) {
          this.spawnInkBurst(pr.x, pr.y, '#fde047', '#090d16', 8);
          this.projectiles.splice(i, 1);
          AudioFX.playParryClang();
        }
      }
      for (const e of this.enemies) {
        if (Math.hypot(e.x - p.x, e.y - 34 - (p.y - 38)) <= 170) {
          const parriedAttack = e.aiState === 'windup' || e.aiState === 'lunge_slash';
          e.aiState = 'staggered';
          e.stateTimer = parriedAttack ? 2.2 : 1.3;
          e.vx = -e.facing * 220;
          if (parriedAttack) {
            AudioFX.playParryClang();
            this.hitstopTimer = 0.085;
            this.screenShake = 9;
            NativeApp.haptic('heavy');
            this.floats.push({
              x: e.x,
              y: e.y - e.profile.h - 24,
              vy: -36,
              text: '✦ 弹反破招！✦',
              color: '#fde047',
              size: 18,
              life: 1.1,
            });
          }
          this.applyDamageToEnemy(e, parriedAttack ? Math.round(skillDmg * 1.45) : skillDmg, true, 80);
        }
      }
    } else if (skillId === 'jiuyou_soulsteal') {
      this.soulStealFlashTimer = 0.65;
      p.invulnTimer = Math.max(p.invulnTimer, 0.55);
      let totalHeal = 0;
      for (const e of [...this.enemies]) {
        if (Math.hypot(e.x - p.x, e.y - p.y) > 660) continue;
        this.spawnInkBurst(e.x, e.y - e.profile.h * 0.5, '#ef4444', '#090d16', 18);
        this.applyDamageToEnemy(e, skillDmg, true, 65);
        totalHeal += 20;
      }
      if (totalHeal > 0) {
        p.hp = Math.min(p.maxHp, p.hp + totalHeal);
        this.floats.push({
          x: p.x,
          y: p.y - 78,
          vy: -40,
          text: `噬魂汲血 +${totalHeal}`,
          color: '#4ade80',
          size: 15,
          life: 1.0,
        });
      }
      this.screenShake = 9;
      NativeApp.haptic('heavy');
    }

    return true;
  }

  private castSubWeapon(): void {
    if (!this.slot) return;
    const sub = SUB_WEAPONS[this.slot.equippedSubWeapon] || SUB_WEAPONS.dagger_throw;
    if (this.slot.talismanHearts < sub.talismanCost) {
      this.floats.push({
        x: this.player.x,
        y: this.player.y - 72,
        vy: -32,
        text: '灵符不足',
        color: '#f59e0b',
        size: 12,
        life: 0.7,
      });
      return;
    }

    this.slot.talismanHearts -= sub.talismanCost;
    const core = this.slot.equippedYaoCore ? YAO_CORES[this.slot.equippedYaoCore] : undefined;
    const subMult = 1 + (core?.subWeaponMult || 0);
    const dmg = Math.round((sub.baseDmg + this.player.int * 1.9) * subMult);
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

    // 1. 恶魔城灵魂交互：挥兵击碎红绸宫灯，爆出朱砂灵符或纹银！
    for (const ln of this.liveLanterns) {
      if (ln.broken) continue;
      if (ln.x >= bx - 16 && ln.x <= bx + bw + 16 && ln.y + 18 >= by && ln.y - 18 <= by + bh) {
        ln.broken = true;
        AudioFX.playLanternBreak();
        this.spawnInkBurst(ln.x, ln.y + 12, '#fb923c', '#991b1b', 10);
        const dropGold = Math.random() < 0.35;
        this.drops.push({
          id: `lantern_${this.nextEntityId++}`,
          isStaticPickup: false,
          kind: dropGold ? 'gold' : 'heart',
          itemId: dropGold ? 'gold' : 'heart',
          amount: dropGold ? 12 + Math.floor(Math.random() * 14) : Math.random() < 0.25 ? 5 : 2,
          x: ln.x,
          y: ln.y + 10,
          vy: -170,
          color: dropGold ? '#fde047' : '#fb923c',
          label: dropGold ? '纹银' : '灵符',
        });
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
            this.cb.onShowBanner('暗壁崩裂 · 墙中秘藏显形', '古墙夹层中竟藏着滚烫的荷叶叫花鸡！');
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
          } else {
            this.floats.push({
              x: sw.x + sw.w * 0.5,
              y: sw.y + 18,
              vy: -28,
              text: `古砖暗裂 (${next}/3)`,
              color: '#fde047',
              size: 12.5,
              life: 0.75,
            });
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

      // 检测是否挥刀劈中【玄铁千斤闸门 / 剧毒紫瘴铁栅】（兼顾纵向高度匹配）
      const room = this.room;
      if (room.ironGate && !this.slot.brokenSecretWalls.includes(room.ironGate.id)) {
        const gx = room.ironGate.x;
        if (
          gx >= bx - 14 &&
          gx <= bx + bw + 14 &&
          by + bh >= room.ironGate.topY &&
          by <= room.ironGate.bottomY &&
          !this.slashHitIds.has(-999)
        ) {
          this.slashHitIds.add(-999);
          if (room.ironGate.gateKind === 'mist_only') {
            AudioFX.playParryClang();
            this.spawnInkBurst(gx, room.ironGate.bottomY - 64, '#a855f7', '#0f172a', 12);
            this.floats.push({
              x: gx,
              y: room.ironGate.bottomY - 110,
              vy: -28,
              text: '需缩地化雾',
              color: '#d8b4fe',
              size: 12,
              life: 0.9,
            });
          } else if (sl.archetype === 'greatsword') {
            this.slot.brokenSecretWalls.push(room.ironGate.id);
            AudioFX.playParryClang();
            this.screenShake = 9;
            NativeApp.haptic('heavy');
            this.slashImpacts.push({
              x: gx,
              y: (room.ironGate.topY + room.ironGate.bottomY) * 0.5,
              angle: 0.35,
              length: 92,
              thickness: 10,
              color: '#fb923c',
              ringRadius: 58,
              life: 0.28,
              maxLife: 0.28,
            });
            this.spawnInkBurst(gx, room.ironGate.bottomY - 70, '#fb923c', '#1e293b', 26);
          } else {
            AudioFX.playParryClang();
            this.spawnInkBurst(gx, room.ironGate.bottomY - 64, '#fde047', '#0f172a', 10);
            this.floats.push({
              x: gx,
              y: room.ironGate.bottomY - 110,
              vy: -28,
              text: '需重刃破闸',
              color: '#fde047',
              size: 12,
              life: 0.9,
            });
          }
        }
      }

      const wDef = WEAPONS[this.slot.equippedWeapon] || WEAPONS.sword_1;
      for (const e of [...this.enemies]) {
        if (this.slashHitIds.has(e.id)) continue;

        const ex1 = e.x - e.profile.w * 0.55;
        const ex2 = e.x + e.profile.w * 0.55;
        const ey1 = e.y - e.profile.h * 1.25;
        const ey2 = e.y;

        if (ex2 >= bx && ex1 <= bx + bw && ey2 >= by && ey1 <= by + bh) {
          this.slashHitIds.add(e.id);

          let dmgMult = sl.comboStep === 2 ? 1.32 : sl.archetype === 'greatsword' ? 1.25 : 1;
          let forceCrit = e.aiState === 'staggered';

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
            this.spawnInkBurst(e.x, e.y - e.profile.h * 0.5, '#fde047', '#090d16', 10);
          }

          if (e.aiState === 'staggered') dmgMult *= 1.35;

          if (
            e.profile.shieldedFront &&
            e.aiState !== 'staggered' &&
            sl.facing !== e.facing
          ) {
            if (sl.archetype === 'greatsword') {
              e.aiState = 'staggered';
              e.stateTimer = 1.6;
              AudioFX.playParryClang();
            } else {
              dmgMult *= 0.25;
              AudioFX.playParryClang();
              this.spawnInkBurst(e.x - sl.facing * 14, e.y - 38, '#fde047', '#0f172a', 8);
              this.floats.push({
                x: e.x,
                y: e.y - e.profile.h - 18,
                vy: -26,
                text: '格挡',
                color: '#cbd5e1',
                size: 11.5,
                life: 0.65,
              });
            }
          }

          // 以战养气：近战挥砍命中敌人恢复真气！
          p.mp = Math.min(p.maxMp, p.mp + 3.5);

          this.applyDamageToEnemy(
            e,
            Math.round(this.player.atk * dmgMult),
            forceCrit,
            wDef.poiseDmg
          );

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
      if (!pr.fromPlayer && Math.hypot(pr.x - cx, pr.y - cy) <= 78) {
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

      if (pr.kind === 'holy_fire') pr.vy += 980 * dt;
      else if (pr.kind === 'seal') pr.vy += 1380 * dt;
      else if (pr.kind === 'bagua' && !pr.returning && pr.life < pr.maxLife * 0.58) {
        pr.returning = true;
        pr.vx = -pr.vx;
        pr.hitIds.clear();
      }

      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;

      if (pr.fromPlayer) {
        this.shatterLanternsAndWallsInBox(pr.x - pr.r, pr.y - pr.r, pr.r * 2, pr.r * 2, false, 0);
      }

      const groundY = sampleGroundY(this.room, pr.x);
      if (pr.kind === 'holy_fire' && pr.y >= groundY - 4) {
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
            this.applyDamageToEnemy(e, pr.dmg, false, 18);
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
          p.invulnTimer <= 0 &&
          p.mistDashTimer <= 0 &&
          Math.abs(pr.x - p.x) < p.w * 0.5 + pr.r &&
          pr.y >= p.y - effH &&
          pr.y <= p.y
        ) {
          this.damagePlayer(pr.dmg, pr.x < p.x ? 1 : -1);
          this.projectiles.splice(i, 1);
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
        // 墨枪轰落地面！
        this.spawnInkBurst(sk.x, sk.groundY, '#38bdf8', '#090d16', 18);
        this.screenShake = Math.max(this.screenShake, 5);
        AudioFX.playSlash('heavy');
        if (
          p.invulnTimer <= 0 &&
          p.mistDashTimer <= 0 &&
          Math.abs(p.x - sk.x) < 34 &&
          Math.abs(p.y - sk.groundY) < 90
        ) {
          this.damagePlayer(sk.dmg, p.x >= sk.x ? 1 : -1);
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
    // 悬崖边缘、竖井深坑或深水寒潭前自动收步驻守，保持高台立体压迫感！
    const intoDeepWater = room.waterZones.some(
      (wz) => candX > wz.x1 + 14 && candX < wz.x2 - 14 && nextSurfY > wz.surfaceY + 10
    );
    if (Math.abs(nextSurfY - e.y) > 24 || intoDeepWater) {
      e.vx = 0;
      return;
    }

    e.x = candX;
    e.y = nextSurfY;
  }

  // ==================== 真实多状态前摇博弈 AI（彻底告别傻瓜式平移吐圆球！） ====================
  private updateEnemies(dt: number): void {
    const p = this.player;
    const room = this.room;
    if (!room) return;

    for (const e of [...this.enemies]) {
      if (e.hurtFlash > 0) e.hurtFlash -= dt;
      if (e.hpTrail > e.hp) {
        e.hpTrail = Math.max(e.hp, e.hpTrail - 85 * dt);
      } else {
        e.hpTrail = e.hp;
      }

      const dx = p.x - e.x;
      const absDx = Math.abs(dx);
      const dy = p.y - e.y;

      if (e.aiState === 'staggered') {
        e.stateTimer -= dt;
        e.vx *= Math.pow(0.01, dt);
        if (e.profile.flying) {
          e.x = Math.max(48, Math.min(room.pixelW - 48, e.x + e.vx * dt));
        } else {
          this.stepGroundEnemyX(e, e.vx * dt);
        }
        if (e.stateTimer <= 0) {
          e.aiState = 'stalk';
          e.stateTimer = 0.5;
        }
        continue;
      }

      if (e.aiState === 'stalk') {
        e.facing = dx >= 0 ? 1 : -1;
        e.stateTimer -= dt;

        if (e.profile.isBoss) {
          // 七大守关妖王/宿敌：各自拥有地面重步或凌空虚浮身法与三式绝学轮转！
          e.animPhase += dt * 4;
          const bossSurfY = sampleEntitySurfaceY(room, e.x, e.y);
          if (e.profile.flying) {
            const hoverY = bossSurfY - 24 + Math.sin(e.animPhase) * 10;
            e.y += (hoverY - e.y) * 5 * dt;
          } else {
            e.y = bossSurfY;
          }
          if (absDx > 165) {
            e.vx = e.facing * e.profile.speed;
          } else {
            e.vx *= 0.85;
          }
          e.x = Math.max(90, Math.min(room.pixelW - 90, e.x + e.vx * dt));

          if (e.stateTimer <= 0) {
            e.bossMoveIdx = (e.bossMoveIdx + 1) % 3;
            if (e.bossMoveIdx === 1) {
              if (e.profile.kind === 'boss_furnace_titan') {
                // 赤铜镇火巨灵：连续抛射三枚高爆熔金岩浆火弹！
                for (let m = -1; m <= 1; m++) {
                  this.projectiles.push({
                    fromPlayer: false,
                    kind: 'holy_fire',
                    x: e.x + e.facing * 26,
                    y: e.y - 54,
                    vx: e.facing * (220 + (m + 1) * 95),
                    vy: -340 - m * 55,
                    r: 13,
                    dmg: e.profile.atk,
                    color: '#fb923c',
                    life: 1.7,
                    maxLife: 1.7,
                    pierce: 1,
                    hitIds: new Set(),
                  });
                }
              } else if (e.profile.kind === 'boss_opera_god') {
                // 惊梦百戏傩神：凌空扇面齐射五道赤金傀儡飞针！
                for (let n = -2; n <= 2; n++) {
                  const baseAng = Math.atan2(p.y - 40 - (e.y - 42), p.x - e.x);
                  const ang = baseAng + n * 0.16;
                  this.projectiles.push({
                    fromPlayer: false,
                    kind: 'dagger',
                    x: e.x + e.facing * 22,
                    y: e.y - 42,
                    vx: Math.cos(ang) * 365,
                    vy: Math.sin(ang) * 365,
                    r: 10,
                    dmg: e.profile.atk,
                    color: '#f472b6',
                    life: 1.7,
                    maxLife: 1.7,
                    pierce: 1,
                    hitIds: new Set(),
                  });
                }
              } else if (
                e.profile.kind === 'boss_xiao_duanshui' ||
                e.profile.kind === 'boss_pei_wuji' ||
                e.profile.kind === 'boss_zhuyin'
              ) {
                // 萧断水破军龙胆枪芒 / 裴无极&烛阴血月裂空剑波！
                const waveCount = e.profile.kind === 'boss_zhuyin' ? 2 : 1;
                for (let wIdx = 0; wIdx < waveCount; wIdx++) {
                  this.projectiles.push({
                    fromPlayer: false,
                    kind: 'qi_wave',
                    x: e.x + e.facing * 36,
                    y: e.y - 42 - wIdx * 28,
                    vx: e.facing * (440 + wIdx * 70),
                    vy: 0,
                    r: 28,
                    dmg: e.profile.atk,
                    color: e.profile.accentColor,
                    life: 1.5,
                    maxLife: 1.5,
                    pierce: 1,
                    hitIds: new Set(),
                  });
                }
              }
              if (e.profile.kind !== 'boss_xiao_duanshui') {
                const strikeCnt = e.profile.kind === 'boss_zhuyin' ? 4 : 3;
                for (let k = -1; k < strikeCnt - 1; k++) {
                  const sx = Math.max(120, Math.min(room.pixelW - 120, p.x + k * 115));
                  this.skyStrikes.push({
                    x: sx,
                    groundY: sampleGroundY(room, sx),
                    timer: 0.82,
                    maxTimer: 0.82,
                    dmg: e.profile.atk,
                  });
                }
              }
              AudioFX.playSkillCast();
              e.stateTimer = 1.55;
            } else {
              if (e.bossMoveIdx === 2) {
                const behindX = Math.max(
                  110,
                  Math.min(room.pixelW - 110, p.x - p.facing * 105)
                );
                this.spawnInkBurst(e.x, e.y - 45, e.profile.accentColor, '#090d16', 14);
                e.x = behindX;
                e.facing = p.x >= e.x ? 1 : -1;
                this.spawnInkBurst(e.x, e.y - 45, e.profile.accentColor, '#090d16', 14);
              }
              e.aiState = 'windup';
              e.stateTimer = 0.54;
              e.vx = 0;
              e.slashHitPlayer = false;
            }
          }
        } else if (e.profile.flying) {
          e.animPhase += dt * 4.5;
          // 飞天书妖走八字盘旋轨迹；金翅夜叉走大波浪美杜莎式掠袭轨迹！
          const waveAmp = e.profile.kind === 'bell_gargoyle' ? 34 : 18;
          e.y = e.baseY + Math.sin(e.animPhase) * waveAmp;
          if (absDx < 480 && absDx > 95) {
            e.vx = e.facing * e.profile.speed;
            e.x = Math.max(54, Math.min(room.pixelW - 54, e.x + e.vx * dt));
          }
          if (e.stateTimer <= 0 && absDx < 380) {
            if (e.profile.ranged) {
              // 飞天书妖发射追踪符咒赤弹 / 金翅夜叉斜射黄金雷叉！
              const ang = Math.atan2(p.y - 42 - (e.y - 24), p.x - e.x);
              const spd = e.profile.kind === 'bell_gargoyle' ? 360 : 285;
              this.projectiles.push({
                fromPlayer: false,
                kind: 'dagger',
                x: e.x + e.facing * 18,
                y: e.y - 24,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                r: 9,
                dmg: e.profile.atk,
                color: e.profile.accentColor,
                life: 1.8,
                maxLife: 1.8,
                pierce: 1,
                hitIds: new Set(),
              });
              AudioFX.playSlash('light');
              e.stateTimer = 1.65;
            } else if (absDx < 220) {
              e.aiState = 'windup';
              e.stateTimer = 0.5;
              e.slashHitPlayer = false;
            }
          }
        } else {
          // 地面妖邪差异化 AI：毒沼三足蟾弹跳扑击吐毒，重盾傀儡中距掷回旋铜斧，刀客/木偶突步蓄斩！
          if (e.profile.kind === 'plague_toad') {
            const curSurfY = sampleEntitySurfaceY(room, e.x, e.y);
            if (e.vy !== 0 || e.y < curSurfY - 2) {
              e.vy += 1280 * dt;
              const nextToadX = Math.max(50, Math.min(room.pixelW - 50, e.x + e.vx * dt));
              e.x = nextToadX;
              const gy = sampleEntitySurfaceY(room, e.x, e.y);
              if (e.y + e.vy * dt >= gy) {
                e.y = gy;
                e.vy = 0;
                e.vx = 0;
              } else {
                e.y += e.vy * dt;
              }
            } else if (e.stateTimer <= 0 && absDx < 420) {
              // 蛤蟆高跃扑击 + 喷吐紫毒珠！
              e.vy = -450;
              e.vx = e.facing * 230;
              e.stateTimer = 1.45;
              this.projectiles.push({
                fromPlayer: false,
                kind: 'holy_fire',
                x: e.x + e.facing * 18,
                y: e.y - 22,
                vx: e.facing * 240,
                vy: -260,
                r: 9,
                dmg: e.profile.atk,
                color: '#a855f7',
                life: 1.4,
                maxLife: 1.4,
                pierce: 1,
                hitIds: new Set(),
              });
            }
          } else {
            const attackRange = e.profile.shieldedFront ? 96 : 108;
            if (absDx < 460 && absDx > attackRange) {
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

            // 玄甲重盾卫中距离投掷恶魔城经典高低回旋铜斧（蹲下可躲过高斧！）
            if (
              e.profile.shieldedFront &&
              e.stateTimer <= 0 &&
              absDx > 145 &&
              absDx < 350 &&
              Math.abs(dy) < 90
            ) {
              this.projectiles.push({
                fromPlayer: false,
                kind: 'bagua',
                x: e.x + e.facing * 22,
                y: e.y - 56, // 高位飞斧：少侠按 ↓ 下蹲即可帅气低头闪过！
                vx: e.facing * 310,
                vy: 0,
                r: 14,
                dmg: e.profile.atk,
                color: '#f59e0b',
                life: 1.5,
                maxLife: 1.5,
                pierce: 1,
                hitIds: new Set(),
              });
              AudioFX.playSlash('heavy');
              e.stateTimer = 1.85;
            } else if (e.stateTimer <= 0 && absDx <= attackRange + 18 && Math.abs(dy) < 90) {
              e.aiState = 'windup';
              e.stateTimer = e.profile.shieldedFront ? 0.58 : 0.46;
              e.vx = 0;
              e.slashHitPlayer = false;
            }
          }
        }
      } else if (e.aiState === 'windup') {
        // 蓄力前摇：沉身蓄势、刀锋绽放红金寒芒预警（此时可用 ↓↙←+斩 完美弹反！）
        e.stateTimer -= dt;
        if (e.stateTimer <= 0) {
          e.aiState = 'lunge_slash';
          e.stateTimer = e.profile.isBoss ? 0.28 : 0.22;
          e.vx = e.facing * (e.profile.isBoss ? 460 : 320);
          AudioFX.playSlash(e.profile.shieldedFront ? 'heavy' : 'light');
        }
      } else if (e.aiState === 'lunge_slash') {
        // 突步挥刀斩击判定帧！
        e.stateTimer -= dt;
        if (e.profile.flying || e.profile.isBoss) {
          e.x = Math.max(50, Math.min(room.pixelW - 50, e.x + e.vx * dt));
          if (e.profile.isBoss && !e.profile.flying) {
            e.y = sampleEntitySurfaceY(room, e.x, e.y);
          }
        } else {
          this.stepGroundEnemyX(e, e.vx * dt);
        }

        const reach = e.profile.isBoss ? 115 : 86;
        const slashMinX = e.facing === 1 ? e.x - 16 : e.x - reach;
        const slashMaxX = e.facing === 1 ? e.x + reach : e.x + 16;

        if (
          !e.slashHitPlayer &&
          p.invulnTimer <= 0 &&
          p.mistDashTimer <= 0 &&
          p.x + p.w * 0.4 >= slashMinX &&
          p.x - p.w * 0.4 <= slashMaxX &&
          p.y > e.y - e.profile.h * 1.15 &&
          p.y - p.h < e.y + 8
        ) {
          e.slashHitPlayer = true;
          this.damagePlayer(e.profile.atk, e.facing);
        }

        if (e.stateTimer <= 0) {
          e.aiState = 'recover';
          e.stateTimer = e.profile.isBoss ? 0.65 : 0.58;
          e.vx = 0;
        }
      } else if (e.aiState === 'recover') {
        e.stateTimer -= dt;
        if (e.stateTimer <= 0) {
          const enraged = e.profile.isBoss && e.hp < e.maxHp * 0.55;
          e.aiState = 'stalk';
          e.stateTimer = e.profile.isBoss ? (enraged ? 0.58 : 0.82) : 0.72;
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
    poise: number
  ): void {
    this.shatterLanternsAndWallsInBox(bx, by, bw, bh, poise >= 50, 0);
    for (const e of [...this.enemies]) {
      if (
        e.x + e.profile.w * 0.55 >= bx &&
        e.x - e.profile.w * 0.55 <= bx + bw &&
        e.y >= by &&
        e.y - e.profile.h * 1.2 <= by + bh
      ) {
        this.applyDamageToEnemy(e, dmg, forceCrit, poise);
      }
    }
  }

  private applyDamageToEnemy(
    e: EnemyEntity,
    rawDmg: number,
    forceCrit: boolean,
    poiseDmg: number
  ): void {
    if (!this.slot) return;
    const isCrit = forceCrit || Math.random() < this.player.critChance;
    const critMult = isCrit ? 1.55 : 1;
    const finalDmg = Math.max(1, Math.round(rawDmg * critMult - e.profile.def * 0.4));

    e.hp -= finalDmg;
    e.hurtFlash = 0.14;
    if (this.player.lifesteal > 0) {
      const heal = Math.max(1, Math.round(finalDmg * this.player.lifesteal));
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
    }
    if (poiseDmg >= 35 && !e.profile.isBoss && e.aiState !== 'staggered') {
      e.aiState = 'staggered';
      e.stateTimer = 0.42;
      e.vx = this.player.facing * 160;
    } else if (!e.profile.isBoss && e.aiState === 'stalk') {
      e.x += this.player.facing * 9;
    }

    AudioFX.playHit(isCrit);
    this.hitstopTimer = isCrit ? 0.042 : 0.022;
    const wCur = WEAPONS[this.slot.equippedWeapon] || WEAPONS.sword_1;
    const hitAngle =
      (this.player.comboStep === 2 ? -0.62 : this.player.comboStep === 1 ? 0.48 : 0.08) *
        this.player.facing +
      (Math.random() - 0.5) * 0.25;
    this.slashImpacts.push({
      x: e.x + (Math.random() - 0.5) * 12,
      y: e.y - e.profile.h * 0.58,
      angle: hitAngle,
      length: isCrit ? 68 : wCur.archetype === 'greatsword' ? 62 : 48,
      thickness: isCrit ? 7.5 : wCur.archetype === 'greatsword' ? 6.5 : 4.5,
      color: isCrit ? '#fde047' : wCur.glowColor,
      ringRadius: isCrit ? 44 : 28,
      life: 0.19,
      maxLife: 0.19,
    });
    this.spawnInkBurst(
      e.x,
      e.y - e.profile.h * 0.6,
      isCrit ? '#fbbf24' : wCur.glowColor,
      '#060911',
      isCrit ? 16 : 10
    );

    this.floats.push({
      x: e.x + (Math.random() - 0.5) * 16,
      y: e.y - e.profile.h * 1.12,
      vy: -48,
      text: isCrit ? `${finalDmg}!` : `${finalDmg}`,
      color: isCrit ? '#fde047' : '#f8fafc',
      size: isCrit ? 16 : 13,
      life: 0.62,
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
    if (this.hasAbility('familiar_sword')) {
      s.familiarExp = (s.familiarExp || 0) + e.profile.exp;
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
      this.screenShake = 12;
      this.skyStrikes = [];
      NativeApp.haptic('heavy');
    }

    // 百鬼试炼·镇妖塔连战模式处理
    if (s.mode === 'boss_rush' && this.room.id === 'boss_rush_arena') {
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
      this.recalcStats(true);
      this.levelUpPillarTimer = 1.45;
      AudioFX.playRelicBell();
      this.spawnInkBurst(this.player.x, this.player.y - 40, '#fde047', '#090d16', 28);
      this.cb.onShowBanner(`境界突破 · 武道第 ${s.level} 境`, '真阳天柱贯顶，气血真气全满！');
    }

    this.drops.push({
      id: `drop_${this.nextEntityId++}`,
      isStaticPickup: false,
      kind: Math.random() < 0.55 ? 'gold' : 'heart',
      itemId: 'gold',
      amount: Math.random() < 0.55 ? e.profile.gold : e.profile.isBoss ? 10 : 3,
      x: e.x,
      y: e.y - 12,
      vy: -230,
      color: '#facc15',
      label: '银两',
    });

    const coreId = e.profile.yaoCoreId;
    const dropRate = (e.profile.yaoDropChance || 0.22) + this.player.lck * 0.008;
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

    // 3) 水牢宿敌【少统领·萧断水】战后赠予缩地化雾符与名枪【寒星龙胆枪】！
    if (e.profile.kind === 'boss_xiao_duanshui') {
      if (!s.ownedWeapons.includes('spear_2')) {
        this.drops.push({
          id: 'boss_drop_spear2',
          isStaticPickup: false,
          kind: 'weapon',
          itemId: 'spear_2',
          amount: 1,
          x: e.x,
          y: e.y - 24,
          vy: -240,
          color: '#38bdf8',
          label: WEAPONS.spear_2.name,
        });
      }
      if (s.mode === 'story' && STORY_SCENES.boss_xiao_post) {
        this.cb.onStartStory(STORY_SCENES.boss_xiao_post, () => {
          this.grantAbility('mist_dash');
          SaveManager.saveSlot(s);
        });
        return;
      }
    }

    if (e.profile.rewardAbility) {
      this.grantAbility(e.profile.rewardAbility);
      SaveManager.saveSlot(s);
    }
  }

  public getExpForNextLevel(lv: number): number {
    return Math.round(65 * Math.pow(1.24, lv - 1));
  }

  private damagePlayer(rawAtk: number, knockDir: 1 | -1): void {
    const p = this.player;
    const dmg = Math.max(3, Math.round(rawAtk - p.def * 0.55));
    p.hp = Math.max(0, p.hp - dmg);
    p.invulnTimer = 0.85;
    this.activeSlash = null;
    p.vx = knockDir * 250;
    p.vy = -220;
    p.onGround = false;
    this.screenShake = 7;
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
        const gy = sampleEntitySurfaceY(this.room, d.x, prevDropY);
        if (d.y >= gy && d.vy >= 0) {
          d.y = gy;
          d.vy = 0;
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
      this.floats.push({
        x: d.x,
        y: d.y - 24,
        vy: -38,
        text: `+${d.amount}`,
        color: '#fde047',
        size: 12,
        life: 0.65,
      });
      return;
    }

    if (d.kind === 'heart') {
      s.talismanHearts = Math.min(99, s.talismanHearts + d.amount);
      this.floats.push({
        x: d.x,
        y: d.y - 24,
        vy: -38,
        text: `+${d.amount}`,
        color: '#fb923c',
        size: 12,
        life: 0.65,
      });
      return;
    }

    AudioFX.playRelicBell();
    NativeApp.haptic('medium');

    if (d.kind === 'yao_core') {
      if (!s.ownedYaoCores.includes(d.itemId)) s.ownedYaoCores.push(d.itemId);
      if (!s.equippedYaoCore) s.equippedYaoCore = d.itemId;
      this.recalcStats(false);
      this.cb.onShowBanner(`吸纳妖丹 · ${d.label}`, '');
    } else if (d.kind === 'ability') {
      this.grantAbility(d.itemId as AbilityKey);
    } else if (d.kind === 'skill_scroll') {
      const skId = d.itemId as SkillId;
      if (!s.learnedSkills.includes(skId)) s.learnedSkills.push(skId);
      const sk = SKILLS[skId];
      this.cb.onShowBanner(`参悟绝学 · ${sk.name}`, sk.commandText);
    } else if (d.kind === 'weapon') {
      if (d.itemId.startsWith('sub:')) {
        const subId = d.itemId.slice(4) as SubWeaponId;
        if (!s.ownedSubWeapons.includes(subId)) s.ownedSubWeapons.push(subId);
        s.equippedSubWeapon = subId;
        const sub = SUB_WEAPONS[subId];
        this.cb.onShowBanner(`奇门副器 · ${sub.name}`, '');
      } else {
        if (!s.ownedWeapons.includes(d.itemId)) s.ownedWeapons.push(d.itemId);
        s.equippedWeapon = d.itemId;
        this.recalcStats(false);
        const w = WEAPONS[d.itemId];
        this.cb.onShowBanner(`神兵入鞘 · ${w.name}`, '');
      }
    } else if (d.kind === 'armor') {
      const arm = ARMORS[d.itemId];
      if (arm) {
        if (!s.ownedArmors.includes(d.itemId)) s.ownedArmors.push(d.itemId);
        if (arm.slot === 'armor') s.equippedArmor = d.itemId;
        else s.equippedAccessory = d.itemId;
        this.recalcStats(false);
        this.cb.onShowBanner(`披挂宝器 · ${arm.name}`, '');
      }
    } else if (d.kind === 'max_up') {
      if (d.itemId === 'hp_vessel') {
        s.maxHpBonus += 25;
        this.recalcStats(false);
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 50);
        this.cb.onShowBanner('千年朱果 · 气血上限 +25', '');
      } else {
        s.maxMpBonus += 20;
        this.recalcStats(false);
        this.player.mp = Math.min(this.player.maxMp, this.player.mp + 40);
        this.cb.onShowBanner('天山雪莲 · 真气上限 +20', '');
      }
    } else if (d.kind === 'consumable') {
      s.consumables[d.itemId] = (s.consumables[d.itemId] || 0) + 1;
      this.floats.push({
        x: d.x,
        y: d.y - 28,
        vy: -40,
        text: `+${d.label}`,
        color: '#4ade80',
        size: 13,
        life: 0.85,
      });
    }
  }

  public cycleWeapon(): void {
    const s = this.slot;
    if (!s || s.ownedWeapons.length <= 1) return;
    const idx = s.ownedWeapons.indexOf(s.equippedWeapon);
    s.equippedWeapon = s.ownedWeapons[(idx + 1) % s.ownedWeapons.length];
    this.recalcStats(false);
    const w = WEAPONS[s.equippedWeapon];
    AudioFX.playParryClang();
    this.spawnInkBurst(this.player.x, this.player.y - 40, w.glowColor, '#090d16', 10);
    this.floats.push({
      x: this.player.x,
      y: this.player.y - 78,
      vy: -34,
      text: `易兵 · ${w.name}`,
      color: '#fde047',
      size: 14,
      life: 0.9,
    });
  }

  public useQuickHealPotion(): void {
    const s = this.slot;
    if (!s) return;
    for (const id of ['jinchuang_yao', 'beggar_chicken', 'osmanthus_wine', 'huiqi_dan']) {
      if ((s.consumables[id] || 0) > 0) {
        this.useConsumable(id);
        return;
      }
    }
    this.floats.push({
      x: this.player.x,
      y: this.player.y - 72,
      vy: -32,
      text: '丹药已尽',
      color: '#94a3b8',
      size: 12,
      life: 0.8,
    });
  }

  public useConsumable(id: string): boolean {
    const s = this.slot;
    const def = CONSUMABLES[id];
    if (!s || !def || (s.consumables[id] || 0) <= 0) return false;
    s.consumables[id]--;
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + def.hpRestore);
    this.player.mp = Math.min(this.player.maxMp, this.player.mp + def.mpRestore);
    AudioFX.playRelicBell();
    this.spawnInkBurst(this.player.x, this.player.y - 36, '#4ade80', '#090d16', 12);
    this.floats.push({
      x: this.player.x,
      y: this.player.y - 78,
      vy: -40,
      text: `${def.name} +${def.hpRestore}`,
      color: '#4ade80',
      size: 14,
      life: 0.95,
    });
    return true;
  }

  private isOnPavilionDeck(): boolean {
    if (!this.room) return false;
    const p = this.player;
    return this.room.pavilions.some(
      (pv) => p.x >= pv.x + 8 && p.x <= pv.x + pv.w - 8 && Math.abs(p.y - pv.y) < 8
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

    // 0A. 玄铁千斤闸门 / 九幽紫瘴栅阻挡判定（精准匹配闸门垂直标高，化雾冲刺可无视穿过！）
    if (
      room.ironGate &&
      !this.slot.brokenSecretWalls.includes(room.ironGate.id) &&
      p.mistDashTimer <= 0 &&
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

    // 0A-1. 恶魔城月下式实心建筑石台/阶梯 (SolidBlock) 左右立壁阻挡与贴墙检测
    if (room.solidBlocks) {
      for (const sb of room.solidBlocks) {
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

    // 0B. 左右边界实心城墙与多层竖塔分标高门廊碰撞（精准判定每一层门洞开启区间！）
    if (p.x < 32) {
      const leftDoors = getRoomSideDoors(room, 'left');
      const inOpenLeftDoor = leftDoors.some(
        (d) => p.y >= d.floorY - 120 && p.y <= d.floorY + 26
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
        (d) => p.y >= d.floorY - 120 && p.y <= d.floorY + 26
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

    // 0C. 室内宫殿藻井 / 城门石券洞 / 暗渠石拱顶 / 实心石台下沿真实头顶碰撞（竖井口自动敞开！）
    const ceilY = sampleCeilingY(room, p.x, bossCleared);
    if (ceilY > -100 && p.vy < 0 && nextY - p.h < ceilY) {
      nextY = ceilY + p.h;
      p.vy = 0;
    }
    if (p.vy < 0 && room.solidBlocks) {
      for (const sb of room.solidBlocks) {
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

    // 0D. 实心建筑石台/阶梯 (SolidBlock) 上表面硬着陆（实心石砌绝不会因 ↓+跃 穿台坠落！）
    if (p.vy >= 0 && room.solidBlocks) {
      for (const sb of room.solidBlocks) {
        if (p.x >= sb.x - 10 && p.x <= sb.x + sb.w + 10) {
          if (prevY <= sb.y + 16 && nextY >= sb.y) {
            p.y = sb.y;
            if (!wasGrounded && p.vy > 260) p.landSquash = 1;
            p.vy = 0;
            p.onGround = true;
            break;
          }
        }
      }
    }

    // 1. 检测雕栏阁台、旋转青铜机关齿轮踏板、石壁顶端与竖井井口单向栈板着陆
    if (!p.onGround && p.vy >= 0 && p.dropThroughTimer <= 0) {
      const orbitPlats = getClockGearOrbitPlatforms(room, p.animTime);
      for (const op of orbitPlats) {
        if (p.x >= op.x + 4 && p.x <= op.x + op.w - 4) {
          if (prevY <= op.y + 16 && nextY >= op.y - 4) {
            p.y = op.y;
            p.x = Math.max(36, Math.min(room.pixelW - 36, p.x + op.vx * dt));
            p.vy = 0;
            p.onGround = true;
            break;
          }
        }
      }

      if (!p.onGround) {
        for (const pv of room.pavilions) {
          if (p.x >= pv.x + 8 && p.x <= pv.x + pv.w - 8) {
            if (prevY <= pv.y + 12 && nextY >= pv.y) {
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

    // 2. 检测连续起伏青石地面/石拱桥/台阶贴合（向下竖井处地面自动敞开下坠！）
    if (!p.onGround) {
      const groundY = sampleGroundY(room, p.x);
      if (wasGrounded && p.vy >= 0 && Math.abs(nextY - groundY) <= 22) {
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

    // 剑侠核心手感：跳斩落地瞬间自动取消空中挥剑后摇 + 【千斤坠 ground_slam】震地火环！
    if (!wasGrounded && p.onGround) {
      if (p.diveKicking && this.hasAbility('ground_slam')) {
        this.screenShake = Math.max(this.screenShake, 7);
        AudioFX.playSlash('heavy');
        this.spawnInkBurst(p.x, p.y - 8, '#fb923c', '#090d16', 22);
        this.damageEnemiesInBox(p.x - 105, p.y - 68, 210, 74, Math.round(p.atk * 1.25), true, 45);
      }
      p.diveKicking = false;
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

  private checkRoomTransition(): void {
    if (!this.room || !this.slot) return;
    const room = this.room;

    if (this.enemies.some((e) => e.profile.isBoss)) {
      this.player.x = Math.max(36, Math.min(room.pixelW - 36, this.player.x));
      return;
    }

    const p = this.player;
    const bossCleared = this.isBossClearedInRoom(room);

    // 1. 左右多层竖塔门廊无缝跨房（自动按当前身位高度匹配所穿过的那扇门，完美保留跳跃高度！）
    if (p.x < 12) {
      const tr = WorldMap.resolveTransition(room, 'left', p.y);
      if (tr) {
        const lift = Math.min(0, p.y - tr.curFloorY);
        this.loadRoom(tr.nextRoom, tr.nextX, tr.nextFloorY + lift, true);
        return;
      }
      p.x = 32;
    } else if (p.x > room.pixelW - 12) {
      const tr = WorldMap.resolveTransition(room, 'right', p.y);
      if (tr) {
        const lift = Math.min(0, p.y - tr.curFloorY);
        this.loadRoom(tr.nextRoom, tr.nextX, tr.nextFloorY + lift, true);
        return;
      }
      p.x = room.pixelW - 32;
    }

    // 2. 向下坠入地宫暗井 / 天井竖井（贯通上下层房间！）
    if (p.y > room.pixelH - 6 && p.vy > 0) {
      const downTr = WorldMap.resolveVerticalShaft(room, p.x, 'down', bossCleared);
      if (downTr) {
        this.loadRoom(downTr.nextRoom, downTr.nextX, downTr.nextY, true);
        return;
      }
      // 兜底防掉出界
      p.y = sampleSolidGroundY(room, p.x);
      p.vy = 0;
      p.onGround = true;
    }

    // 3. 向上纵跃冲出天井竖井直登二楼飞阁！（动态适配任意挑高厅堂地面标高！）
    if (p.y - p.h < 6 && p.vy < 0) {
      const upTr = WorldMap.resolveVerticalShaft(room, p.x, 'up', bossCleared);
      if (upTr) {
        p.dropThroughTimer = 0;
        p.vy = -560;
        p.onGround = false;
        const targetFloor = sampleSolidGroundY(upTr.nextRoom, upTr.nextX);
        this.loadRoom(upTr.nextRoom, upTr.nextX, targetFloor + 32, true);
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
    if (kind === 'save') {
      this.recalcStats(true);
      SaveManager.saveSlot(this.slot);
      AudioFX.playRelicBell();
      NativeApp.haptic('medium');
      this.spawnInkBurst(this.player.x, this.player.y - 36, '#fde047', '#090d16', 22);
      // 若已探知多座祠堂/灵泉，留档后可直接唤出传送阵列表！
      const warpCount = this.getUnlockedWarpStops().length;
      if (warpCount > 1) {
        this.cb.onOpenInteractModal('warp');
      } else {
        this.cb.onShowBanner('镇魂留档', '');
      }
    } else if (kind === 'warp') {
      AudioFX.playRelicBell();
      NativeApp.haptic('medium');
      this.cb.onOpenInteractModal('warp');
    } else if (kind === 'invert_portal') {
      AudioFX.playSkillCast();
      NativeApp.haptic('heavy');
      const nextRealm: CastleRealm = this.room.realm === 'normal' ? 'inverted' : 'normal';
      this.warpToRoom(nextRealm, 'sky_altar');
    } else if (kind === 'su_qingyan') {
      const sceneKey =
        this.room.id === 'gate_1'
          ? 'su_gate_chat'
          : this.room.id === 'upper_library'
            ? 'meet_library_su'
            : 'su_shrine_guide';
      const sc = STORY_SCENES[sceneKey];
      if (sc) {
        this.cb.onStartStory(sc);
      }
    } else if (kind === 'smith' || kind === 'merchant') {
      this.cb.onOpenInteractModal(kind);
    }
  }

  public getUnlockedWarpStops(): { realm: CastleRealm; roomId: string; name: string }[] {
    if (!this.slot) return [];
    const stops: { realm: CastleRealm; roomId: string; name: string }[] = [];
    for (const realm of ['normal', 'inverted'] as CastleRealm[]) {
      if (realm === 'inverted' && !this.slot.invertedUnlocked) continue;
      for (const rm of WorldMap.getAllRooms(realm)) {
        if (!rm.warpName) continue;
        if (this.slot.visitedRooms.includes(`${realm}:${rm.id}`)) {
          stops.push({ realm, roomId: rm.id, name: rm.warpName });
        }
      }
    }
    return stops;
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
        size: isInk ? 3.5 + Math.random() * 4.5 : 2.2 + Math.random() * 2.8,
        color: isInk ? inkColor : accentColor,
        life: isInk ? 0.28 + Math.random() * 0.28 : 0.2 + Math.random() * 0.24,
        maxLife: 0.56,
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
  }
}
