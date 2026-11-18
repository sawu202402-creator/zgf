import { AudioFX } from '../audio/GuofengAudio';
import { ENEMY_PROFILES, EnemyProfile } from '../data/enemies';
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
  CELL_PIXEL_H,
  CELL_PIXEL_W,
  sampleCeilingY,
  sampleGroundY,
  sampleSolidGroundY,
  WorldMap,
} from '../data/worldMap';
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
    groundSlamming: false,
    invulnTimer: 0,
    orbitSwordTimer: 0,
    orbitAngle: 0,
    animTime: 0,
    runCycle: 0,
    landSquash: 0,
  };

  public activeSlash: ActiveSlash | null = null;
  private slashHitIds = new Set<number>();
  public skillBanner: { name: string; timer: number; color: string } | null = null;
  public taijiFlashTimer = 0;
  public soulStealFlashTimer = 0;

  public enemies: EnemyEntity[] = [];
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
    this.recalcStats(true);

    const startRoom = WorldMap.getRoom(slot.currentRealm, slot.currentRoomId);
    const spawnX = startRoom.id === 'gate_1' ? 190 : startRoom.focalX;
    this.loadRoom(startRoom, spawnX, sampleGroundY(startRoom, spawnX));
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
    this.player.speedMult =
      (weapon.archetype === 'greatsword' ? 0.94 : 1.04) + (core?.speedPct || 0);
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
    this.cb.onShowBanner(target.name, target.subtitle);
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
    if (!this.slot || !this.room) return;
    const localGx = Math.max(
      0,
      Math.min(this.room.gridW - 1, Math.floor(this.player.x / CELL_PIXEL_W))
    );
    const localGy = Math.max(
      0,
      Math.min(this.room.gridH - 1, Math.floor(this.player.y / CELL_PIXEL_H))
    );
    const cellKey = `cell:${this.room.mapX + localGx},${this.room.mapY + localGy}`;
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
    this.projectiles = [];
    this.skyStrikes = [];
    this.drops = [];
    this.slashImpacts = [];
    this.activeSlash = null;

    for (const pk of nextRoom.pickups) {
      if (s.collectedPickups.includes(pk.id)) continue;
      const py = pk.y ?? sampleGroundY(nextRoom, pk.x);
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

    for (const sp of nextRoom.spawns) {
      this.spawnEnemy(sp.kind, sp.x, sampleGroundY(nextRoom, sp.x));
    }

    if (nextRoom.bossKind) {
      const bossKey = `${nextRoom.realm}:${nextRoom.bossKind}`;
      if (!s.defeatedBosses.includes(bossKey)) {
        this.spawnEnemy(nextRoom.bossKind, nextRoom.pixelW * 0.68, nextRoom.focalY);
      }
    }

    // 仅在踏入全新大区域或特殊密室时弹出区域横幅（同区域跨门保持恶魔城丝滑连贯体验！）
    if (prevRegion !== nextRoom.region || nextRoom.special === 'boss_room') {
      if (visitKey !== this.lastVisitedRegion) {
        this.lastVisitedRegion = visitKey;
        this.cb.onShowBanner(nextRoom.name, nextRoom.subtitle);
      }
    }

    const hasLiveBoss = this.enemies.some((e) => e.profile.isBoss);
    AudioFX.setMood(hasLiveBoss ? 'boss' : 'castle');

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
    if (kind === 'skill_scroll') return `秘卷·${SKILLS[itemId as SkillId]?.name || itemId}`;
    if (kind === 'max_up') {
      return itemId === 'hp_vessel' ? '千年朱果(气血上限+25)' : '天山雪莲(真气上限+20)';
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

  private spawnEnemy(kind: EnemyKind, x: number, y: number): void {
    const prof = ENEMY_PROFILES[kind];
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
      stateTimer: 0.6 + Math.random() * 0.6,
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
    if (this.skillBanner) {
      this.skillBanner.timer -= dt;
      if (this.skillBanner.timer <= 0) this.skillBanner = null;
    }

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.updateParticles(dt);
      return;
    }

    const core = this.slot.equippedYaoCore ? YAO_CORES[this.slot.equippedYaoCore] : undefined;
    const mpRegen = 2.8 + this.player.int * 0.16 + (core?.mpRegenBonus || 0);
    this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpRegen * dt);

    this.updatePlayer(dt);
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
      } else if (p.coyoteTimer > 0) {
        p.vy = -610;
        p.onGround = false;
        p.coyoteTimer = 0;
        p.jumpBuffer = 0;
        AudioFX.playJump();
        this.spawnInkBurst(p.x, p.y, '#cbd5e1', '#1e293b', 6);
      } else if (p.airJumpsLeft > 0) {
        p.airJumpsLeft--;
        p.vy = -590;
        p.doubleJumpSpinTimer = 0.34;
        p.jumpBuffer = 0;
        AudioFX.playJump();
        this.spawnInkBurst(p.x, p.y - 18, '#2dd4bf', '#0f172a', 12);
      }
    }

    if (!inp.jumpHeld && p.vy < -220) {
      p.vy *= 0.62;
    }

    // 攻击与手搓真气绝学
    if (inp.consumeAttack()) {
      const motionSkill = inp.consumeMotionSkill(p.facing);
      if (motionSkill && this.tryCastMartialSkill(motionSkill)) {
        // 手搓绝技触发
      } else if (p.attackCooldown <= 0) {
        this.performWeaponAttack();
      }
    }

    // 水平加速度与步态相位推进
    if (p.mistDashTimer > 0) {
      p.mistDashTimer -= dt;
      if (Math.random() < 0.7) {
        this.afterImages.push({ x: p.x, y: p.y, facing: p.facing, color: '#a855f7', alpha: 0.65 });
      }
    } else if (p.backdashTimer > 0) {
      p.backdashTimer -= dt;
      p.vx *= 0.88;
      if (Math.random() < 0.65) {
        this.afterImages.push({ x: p.x, y: p.y, facing: p.facing, color: '#2dd4bf', alpha: 0.5 });
      }
    } else if (this.activeSlash && p.onGround && this.activeSlash.progress < 0.5) {
      // 挥剑/劈刀时自然弓步前踏寸劲！
      p.vx *= 0.84;
    } else {
      const moveSpeed = 276 * p.speedMult;
      if (inp.moveX !== 0) {
        if (!this.activeSlash) p.facing = Math.sign(inp.moveX) as 1 | -1;
        p.vx = inp.moveX * moveSpeed;
        if (p.onGround) {
          p.runCycle += dt * 13.5 * p.speedMult;
        }
      } else {
        p.vx *= Math.pow(0.0008, dt);
        if (Math.abs(p.vx) < 8) p.vx = 0;
      }
    }

    if (p.mistDashTimer <= 0) {
      p.vy = Math.min(880, p.vy + 1580 * dt);
    }

    this.moveAndCollideTerrain(dt);
  }

  private performWeaponAttack(): void {
    if (!this.slot) return;
    const p = this.player;
    const w = WEAPONS[this.slot.equippedWeapon] || WEAPONS.sword_1;

    const maxSteps = w.archetype === 'greatsword' ? 2 : 3;
    p.comboStep = (p.comboStep + 1) % maxSteps;
    p.comboResetTimer = 0.75;

    const isHeavy = w.archetype === 'greatsword';
    const duration = isHeavy ? 0.44 : p.comboStep === 2 ? 0.3 : 0.24;
    p.attackCooldown = isHeavy ? 0.42 : 0.2;

    // 地面挥斩踏步前冲寸劲
    if (p.onGround) {
      p.vx = p.facing * (isHeavy ? 145 : p.comboStep === 2 ? 210 : 105);
    }

    const pogoDown = w.archetype === 'sword' && !p.onGround && this.input.moveY > 0.5;

    this.slashHitIds.clear();
    this.activeSlash = {
      x: p.x,
      y: p.y - 40,
      facing: p.facing,
      aimX: this.input.moveX !== 0 ? this.input.moveX : p.facing,
      aimY: this.input.moveY,
      archetype: w.archetype,
      comboStep: p.comboStep,
      pogoDown,
      progress: 0,
      duration,
      reachX: isHeavy ? 128 : 96,
      reachY: isHeavy ? 105 : 58,
      color: w.color,
      glowColor: isHeavy ? '#f97316' : '#2dd4bf',
      slammedGround: false,
    };

    AudioFX.playSlash(isHeavy ? 'heavy' : 'light');
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
    this.skillBanner = { name: sk.name, timer: 1.1, color: sk.color };

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
    const dmg = Math.round(sub.baseDmg + this.player.int * 1.9);
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

  private updateActiveSlash(dt: number): void {
    const sl = this.activeSlash;
    if (!sl || !this.slot || !this.room) return;

    const p = this.player;
    sl.x = p.x;
    sl.y = p.y - 40;
    sl.progress += dt / sl.duration;

    const activeStart = sl.archetype === 'greatsword' ? 0.32 : 0.14;
    const activeEnd = 0.86;

    // 重刃陌刀开山劈砸地瞬间：迸发碎石火星与震屏冲击！
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
      } else {
        bx = sl.facing === 1 ? p.x - 10 : p.x - sl.reachX;
        by = p.y - 42 - sl.reachY * 0.55;
        bw = sl.reachX + 10;
        bh = sl.reachY + 18;
      }

      // 检测是否挥刀劈中【可破坏玄铁千斤闸门】(恶魔城双武器能力锁机制！)
      const room = this.room;
      if (room.ironGate && !this.slot.brokenSecretWalls.includes(room.ironGate.id)) {
        const gx = room.ironGate.x;
        if (gx >= bx - 14 && gx <= bx + bw + 14 && !this.slashHitIds.has(-999)) {
          this.slashHitIds.add(-999);
          if (sl.archetype === 'greatsword') {
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
            this.cb.onShowBanner('重刃断索 · 玄铁秘闸洞开', '斩马陌刀一击劈碎千斤铁锁！');
          } else {
            AudioFX.playParryClang();
            this.spawnInkBurst(gx, room.ironGate.bottomY - 64, '#fde047', '#0f172a', 10);
            this.floats.push({
              x: gx,
              y: room.ironGate.bottomY - 110,
              vy: -32,
              text: '千斤玄铁锁！(需换【赤炎斩马陌刀】重劈破门)',
              color: '#fde047',
              size: 12.5,
              life: 1.05,
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
          if (forceCrit) dmgMult *= 1.45;

          // 玄甲重盾卫正面格挡逻辑：轻剑正面砍盾会火星弹刀，而重刃【赤炎斩马陌刀】直接一刀破盾震晕！
          if (
            e.profile.shieldedFront &&
            e.aiState !== 'staggered' &&
            sl.facing !== e.facing
          ) {
            if (sl.archetype === 'greatsword') {
              e.aiState = 'staggered';
              e.stateTimer = 1.6;
              AudioFX.playParryClang();
              this.floats.push({
                x: e.x,
                y: e.y - e.profile.h - 24,
                vy: -36,
                text: '重刃破盾！',
                color: '#fb923c',
                size: 15,
                life: 0.95,
              });
            } else {
              dmgMult *= 0.25;
              AudioFX.playParryClang();
              this.spawnInkBurst(e.x - sl.facing * 14, e.y - 38, '#fde047', '#0f172a', 8);
              this.floats.push({
                x: e.x,
                y: e.y - e.profile.h - 20,
                vy: -30,
                text: '重盾格挡!(换斩马陌刀破盾或疾退绕背)',
                color: '#cbd5e1',
                size: 11.5,
                life: 0.9,
              });
            }
          }

          this.applyDamageToEnemy(e, Math.round(this.player.atk * dmgMult), forceCrit, wDef.poiseDmg);

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
    p.orbitAngle += dt * 6.2;
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
      else if (pr.kind === 'bagua' && !pr.returning && pr.life < pr.maxLife * 0.58) {
        pr.returning = true;
        pr.vx = -pr.vx;
        pr.hitIds.clear();
      }

      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;

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
        if (
          p.invulnTimer <= 0 &&
          p.mistDashTimer <= 0 &&
          Math.abs(pr.x - p.x) < p.w * 0.5 + pr.r &&
          pr.y >= p.y - p.h &&
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
        e.x = Math.max(48, Math.min(room.pixelW - 48, e.x + e.vx * dt));
        if (!e.profile.flying) e.y = sampleGroundY(room, e.x);
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
          // 守关妖宗·墨千秋：三式武学轮转！
          e.animPhase += dt * 4;
          const hoverY = sampleGroundY(room, e.x) - 24 + Math.sin(e.animPhase) * 10;
          e.y += (hoverY - e.y) * 5 * dt;
          if (absDx > 165) {
            e.vx = e.facing * e.profile.speed;
          } else {
            e.vx *= 0.85;
          }
          e.x = Math.max(90, Math.min(room.pixelW - 90, e.x + e.vx * dt));

          if (e.stateTimer <= 0) {
            e.bossMoveIdx = (e.bossMoveIdx + 1) % 3;
            if (e.bossMoveIdx === 1) {
              // 招式二：【万卷天落】地面红金光柱预警轰击！
              for (let k = -1; k <= 2; k++) {
                const sx = Math.max(120, Math.min(room.pixelW - 120, p.x + k * 115));
                this.skyStrikes.push({
                  x: sx,
                  groundY: sampleGroundY(room, sx),
                  timer: 0.82,
                  maxTimer: 0.82,
                  dmg: e.profile.atk,
                });
              }
              AudioFX.playSkillCast();
              e.stateTimer = 1.65;
            } else {
              if (e.bossMoveIdx === 2) {
                // 招式三：【画皮瞬步】闪现至李逸承身后蓄力挥斩！
                const behindX = Math.max(
                  110,
                  Math.min(room.pixelW - 110, p.x - p.facing * 105)
                );
                this.spawnInkBurst(e.x, e.y - 45, '#38bdf8', '#090d16', 14);
                e.x = behindX;
                e.facing = p.x >= e.x ? 1 : -1;
                this.spawnInkBurst(e.x, e.y - 45, '#38bdf8', '#090d16', 14);
              }
              e.aiState = 'windup';
              e.stateTimer = 0.56;
              e.vx = 0;
              e.slashHitPlayer = false;
            }
          }
        } else if (e.profile.flying) {
          e.animPhase += dt * 4.5;
          e.y = e.baseY + Math.sin(e.animPhase) * 18;
          if (absDx < 420 && absDx > 95) {
            e.vx = e.facing * e.profile.speed;
            e.x += e.vx * dt;
          }
          if (e.stateTimer <= 0 && absDx < 220) {
            e.aiState = 'windup';
            e.stateTimer = 0.5;
            e.slashHitPlayer = false;
          }
        } else {
          // 地面刀客/重盾甲士：迈步逼近至出刀距离后进入蓄势前摇！
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

          e.x = Math.max(50, Math.min(room.pixelW - 50, e.x + e.vx * dt));
          e.y = sampleGroundY(room, e.x);

          if (e.stateTimer <= 0 && absDx <= attackRange + 18 && Math.abs(dy) < 90) {
            e.aiState = 'windup';
            e.stateTimer = e.profile.shieldedFront ? 0.58 : 0.46;
            e.vx = 0;
            e.slashHitPlayer = false;
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
        e.x = Math.max(50, Math.min(room.pixelW - 50, e.x + e.vx * dt));
        if (!e.profile.flying && !e.profile.isBoss) {
          e.y = sampleGroundY(room, e.x);
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
          e.aiState = 'stalk';
          e.stateTimer = e.profile.isBoss ? 0.95 : 0.85;
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
      x: e.x + (Math.random() - 0.5) * 18,
      y: e.y - e.profile.h * 1.15,
      vy: -52,
      text: isCrit ? `暴斩 ${finalDmg}` : `${finalDmg}`,
      color: isCrit ? '#fde047' : '#f8fafc',
      size: isCrit ? 17 : 14,
      life: 0.72,
    });

    if (e.hp <= 0) {
      this.handleEnemyKilled(e);
    }
  }

  private handleEnemyKilled(e: EnemyEntity): void {
    const s = this.slot;
    if (!s || !this.room) return;

    const idx = this.enemies.indexOf(e);
    if (idx >= 0) this.enemies.splice(idx, 1);

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

    s.exp += e.profile.exp;
    const needExp = this.getExpForNextLevel(s.level);
    if (s.exp >= needExp) {
      s.exp -= needExp;
      s.level++;
      this.recalcStats(true);
      AudioFX.playRelicBell();
      this.cb.onShowBanner(`武道精进 · 等级 ${s.level}`, '周天经脉畅通，气血真气回满');
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
    if (coreId && !s.ownedYaoCores.includes(coreId) && Math.random() < 0.26) {
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

    const bossKey = `${this.room.realm}:${e.profile.kind}`;
    if (!s.defeatedBosses.includes(bossKey)) {
      s.defeatedBosses.push(bossKey);
    }
    AudioFX.setMood('castle');

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
        d.vy = Math.min(540, d.vy + 1100 * dt);
        d.y += d.vy * dt;
        const gy = sampleGroundY(this.room, d.x);
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
        text: `+${d.amount} 文银`,
        color: '#fde047',
        size: 13,
        life: 0.8,
      });
      return;
    }

    if (d.kind === 'heart') {
      s.talismanHearts = Math.min(99, s.talismanHearts + d.amount);
      this.floats.push({
        x: d.x,
        y: d.y - 24,
        vy: -38,
        text: `+${d.amount} 灵符`,
        color: '#fb923c',
        size: 13,
        life: 0.8,
      });
      return;
    }

    AudioFX.playRelicBell();
    NativeApp.haptic('medium');

    if (d.kind === 'yao_core') {
      if (!s.ownedYaoCores.includes(d.itemId)) s.ownedYaoCores.push(d.itemId);
      if (!s.equippedYaoCore) s.equippedYaoCore = d.itemId;
      this.recalcStats(false);
      this.cb.onShowBanner(`吸纳本命妖丹 · ${d.label}`, YAO_CORES[d.itemId].desc);
    } else if (d.kind === 'ability') {
      this.grantAbility(d.itemId as AbilityKey);
    } else if (d.kind === 'weapon') {
      if (!s.ownedWeapons.includes(d.itemId)) s.ownedWeapons.push(d.itemId);
      s.equippedWeapon = d.itemId;
      this.recalcStats(false);
      const w = WEAPONS[d.itemId];
      this.cb.onShowBanner(`拔取神兵 · ${w.name}`, '按 [Q] 或点击左上角刀匣可随时双兵瞬切！');
    } else if (d.kind === 'consumable') {
      s.consumables[d.itemId] = (s.consumables[d.itemId] || 0) + 1;
      this.floats.push({
        x: d.x,
        y: d.y - 28,
        vy: -40,
        text: `获得 ${d.label}`,
        color: '#4ade80',
        size: 14,
        life: 1.0,
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

    // 0A. 玄铁千斤闸门阻挡判定（未劈碎前阻隔通行，化雾冲刺可穿过）
    if (
      room.ironGate &&
      !this.slot.brokenSecretWalls.includes(room.ironGate.id) &&
      p.mistDashTimer <= 0
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

    // 0B. 左右边界实心城墙与门洞上沿门楣碰撞（必须在门洞高度内穿过，绝不穿墙！）
    if (!room.leftRoomId && p.x < 32) {
      p.x = 32;
      p.vx = 0;
    } else if (room.leftRoomId && p.x < 30) {
      const doorFloor = room.leftDoorFloorY ?? 400;
      if (p.y < doorFloor - 118) {
        p.x = 30;
        p.vx = 0;
      }
    }

    if (!room.rightRoomId && p.x > room.pixelW - 32) {
      p.x = room.pixelW - 32;
      p.vx = 0;
    } else if (room.rightRoomId && p.x > room.pixelW - 30) {
      const doorFloor = room.rightDoorFloorY ?? 400;
      if (p.y < doorFloor - 118) {
        p.x = room.pixelW - 30;
        p.vx = 0;
      }
    }

    const prevY = p.y;
    let nextY = p.y + p.vy * dt;

    // 0C. 室内宫殿藻井 / 城门石券洞 / 暗渠石拱顶真实头顶碰撞（竖井口自动敞开！）
    const ceilY = sampleCeilingY(room, p.x, bossCleared);
    if (ceilY > -100 && p.vy < 0 && nextY - p.h < ceilY) {
      nextY = ceilY + p.h;
      p.vy = 0;
    }

    p.onGround = false;

    // 1. 检测雕栏木阁楼与竖井井口单向栈板着陆
    if (p.vy >= 0 && p.dropThroughTimer <= 0) {
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

    // 1. 左右门廊无缝跨房（完美保留跳跃离地高度与横向速度！）
    if (p.x < 12) {
      const tr = WorldMap.resolveTransition(room, 'left');
      if (tr) {
        const lift = Math.min(0, p.y - tr.curFloorY);
        this.loadRoom(tr.nextRoom, tr.nextX, tr.nextFloorY + lift, true);
        return;
      }
      p.x = 32;
    } else if (p.x > room.pixelW - 12) {
      const tr = WorldMap.resolveTransition(room, 'right');
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

    // 3. 向上纵跃冲出天井竖井直登二楼飞阁！（穿过上层单向井口木栈板稳稳落于上层地面！）
    if (p.y - p.h < 6 && p.vy < 0) {
      const upTr = WorldMap.resolveVerticalShaft(room, p.x, 'up', bossCleared);
      if (upTr) {
        p.vy = -540;
        p.onGround = false;
        this.loadRoom(upTr.nextRoom, upTr.nextX, 424, true);
      }
    }
  }

  private updateNearbyInteract(): void {
    this.nearbyInteract = null;
    if (!this.room || !this.slot) return;
    const p = this.player;

    // 1. 优先检测场景内驻场真人 NPC（苏清晏 / 独臂铸剑师·欧冶残 / 狐商·白掌柜）
    for (const npc of this.room.npcs) {
      const ny = sampleGroundY(this.room, npc.x);
      if (Math.abs(p.x - npc.x) < 68 && Math.abs(p.y - ny) < 76) {
        if (npc.id === 'ouye_can') {
          this.nearbyInteract = {
            kind: 'smith',
            label: `${npc.name} · 赤火淬炼神兵 [E / 点击]`,
            x: npc.x,
            y: ny,
          };
        } else if (npc.id === 'bai_zhanggui') {
          this.nearbyInteract = {
            kind: 'merchant',
            label: `${npc.name} · 子夜鬼市交易 [E / 点击]`,
            x: npc.x,
            y: ny,
          };
        } else {
          this.nearbyInteract = {
            kind: 'su_qingyan',
            label: `与 ${npc.name}（${npc.title}）交谈 [E / 点击]`,
            x: npc.x,
            y: ny,
          };
        }
        return;
      }
    }

    // 2. 镇魂土地祠焚香留档 / 太极八卦传送阵跨层瞬移
    if (this.room.special === 'save_shrine') {
      const cx = this.room.focalX;
      const gy = this.room.focalY;
      if (Math.abs(p.x - cx) < 88 && Math.abs(p.y - gy) < 76) {
        this.nearbyInteract = {
          kind: 'save',
          label: '镇魂土地祠 · 焚香调息留档 [E / 点击]',
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
          label: '太极八卦阵 · 瞬移返还【瓮城镇魂古祠】[E / 点击]',
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
      this.cb.onShowBanner('镇魂香燃 · 卷宗已铭刻', '气血与真气已完全充盈');
    } else if (kind === 'warp') {
      AudioFX.playRelicBell();
      NativeApp.haptic('medium');
      this.warpToRoom('normal', 'gate_2');
    } else if (kind === 'su_qingyan') {
      const sceneKey = this.room.id === 'gate_1' ? 'su_gate_chat' : 'su_shrine_guide';
      const sc = STORY_SCENES[sceneKey];
      if (sc) {
        this.cb.onStartStory(sc);
      }
    } else if (kind === 'smith' || kind === 'merchant') {
      this.cb.onOpenInteractModal(kind);
    }
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
  }
}
