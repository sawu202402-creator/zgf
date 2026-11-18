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
import { BuiltRoom, REGION_NAMES, TILE_SIZE, UNIT_COLS, WorldMap } from '../data/worldMap';
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
  progress: number;
  duration: number;
  reachX: number;
  reachY: number;
  color: string;
  glowColor: string;
}

export interface Projectile {
  fromPlayer: boolean;
  kind: 'qi_wave' | 'dagger' | 'holy_fire' | 'fire_pillar' | 'bagua' | 'seal' | 'enemy_orb';
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

export interface EnemyEntity {
  id: number;
  profile: EnemyProfile;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  hp: number;
  maxHp: number;
  aiTimer: number;
  actionTimer: number;
  hurtFlash: number;
  stunTimer: number;
  baseY: number;
  hasGuParasite?: boolean;
  guHp?: number;
  guMaxHp?: number;
  guX?: number;
  guY?: number;
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

  // 平滑跟随相机世界中心坐标
  public camX = 440;
  public camY = 240;

  public player = {
    x: 180,
    y: 400,
    w: 26,
    h: 60,
    vx: 0,
    vy: 0,
    facing: 1 as 1 | -1,
    hp: 100,
    maxHp: 100,
    mp: 60,
    maxMp: 60,
    atk: 20,
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
  };

  public activeSlash: ActiveSlash | null = null;
  private slashHitIds = new Set<number>();
  public skillBanner: { name: string; timer: number; color: string } | null = null;
  public taijiFlashTimer = 0;
  public soulStealFlashTimer = 0;

  public enemies: EnemyEntity[] = [];
  public projectiles: Projectile[] = [];
  public drops: WorldDrop[] = [];
  public floats: FloatingText[] = [];
  public particles: Particle[] = [];
  public afterImages: AfterImage[] = [];

  public screenShake = 0;
  private hitstopTimer = 0;
  private nextEntityId = 1;
  private lastVisitedRegion = '';
  public nearbyInteract: {
    kind: 'save' | 'warp' | 'smith' | 'merchant' | 'su_qingyan' | 'invert_portal';
    label: string;
    x: number;
    y: number;
  } | null = null;

  public bossRushIndex = 0;

  constructor(
    public input: InputController,
    private cb: EngineCallbacks
  ) {}

  public startSession(slot: SaveSlotData): void {
    this.slot = slot;
    this.paused = false;
    this.bossRushIndex = 0;
    this.recalcStats(true);

    if (slot.mode === 'boss_rush') {
      this.enterBossRushWave(0);
      return;
    }

    const startRoom = WorldMap.getRoom(slot.currentRealm, slot.currentRoomId);
    const spawnX = startRoom.id === 'gate_1' ? 180 : startRoom.focalX;
    this.loadRoom(startRoom, spawnX, startRoom.focalY, true);
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
      return { maxHp: 100, maxMp: 60, atk: 20, def: 5, str: 8, con: 8, int: 8, lck: 5 };
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

    const maxHp = 90 + lv * 16 + s.maxHpBonus + armor.hpBonus + acc.hpBonus;
    const maxMp = 55 + lv * 9 + s.maxMpBonus + armor.mpBonus + acc.mpBonus;
    let atk = Math.round((weapon.atk + str * 1.45) * (1 + (core?.atkPct || 0)));
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
      0.05 + weapon.critBonus + st.lck * 0.004 + (core?.critPct || 0)
    );
    this.player.speedMult =
      1 + (weapon.archetype === 'daggers' ? 0.12 : 0) + (core?.speedPct || 0);
    this.player.lifesteal = core?.lifestealRatio || 0;

    if (fullRestore) {
      this.player.hp = st.maxHp;
      this.player.mp = st.maxMp;
    } else {
      this.player.hp = Math.min(this.player.hp, st.maxHp);
      this.player.mp = Math.min(this.player.mp, st.maxMp);
    }
  }

  private enterBossRushWave(idx: number): void {
    if (!this.slot) return;
    this.bossRushIndex = idx;
    const arena = WorldMap.createBossRushRoom();
    const bossKind = BOSS_RUSH_ORDER[idx];
    arena.bossKind = bossKind;
    arena.name = `百鬼试炼 · 第 ${idx + 1}/${BOSS_RUSH_ORDER.length} 阵`;
    this.room = arena;
    this.enemies = [];
    this.projectiles = [];
    this.drops = [];
    this.player.x = 200;
    this.player.y = arena.focalY;
    this.player.vx = 0;
    this.player.vy = 0;
    this.camX = this.player.x;
    this.camY = this.player.y - 80;
    this.player.hp = Math.min(
      this.player.maxHp,
      this.player.hp + Math.round(this.player.maxHp * 0.35)
    );
    this.player.mp = this.player.maxMp;
    this.spawnEnemy(bossKind, arena.pixelW - 220, arena.focalY, 1);
    AudioFX.setMood('boss');
    this.cb.onShowBanner(arena.name, ENEMY_PROFILES[bossKind].name);
  }

  public warpToRoom(realm: CastleRealm, roomId: string): void {
    const target = WorldMap.getRoom(realm, roomId);
    this.loadRoom(target, target.focalX, target.focalY, true);
    this.cb.onShowBanner(target.warpName || target.name, '太极八卦挪移阵');
  }

  public loadRoom(
    nextRoom: BuiltRoom,
    entryX: number,
    entryY: number,
    snapSafeFloor = false
  ): void {
    const s = this.slot;
    if (!s) return;

    this.room = nextRoom;
    s.currentRoomId = nextRoom.id;
    s.currentRealm = nextRoom.realm;

    const visitKey = `${nextRoom.realm}:${nextRoom.id}`;
    if (!s.visitedRooms.includes(visitKey)) {
      s.visitedRooms.push(visitKey);
      const pct = WorldMap.calcExplorationPct(s.visitedRooms);
      if (pct > SaveManager.getMeta().bestExplorationPct) {
        SaveManager.saveMeta({ bestExplorationPct: pct });
      }
    }

    const wallPrefix = `${visitKey}:`;
    for (let r = 0; r < nextRoom.rows; r++) {
      for (let c = 0; c < nextRoom.cols; c++) {
        if (
          (nextRoom.tiles[r][c] === 6 || nextRoom.tiles[r][c] === 3) &&
          s.brokenSecretWalls.includes(`${wallPrefix}${r},${c}`)
        ) {
          nextRoom.tiles[r][c] = 0;
        }
      }
    }

    this.player.x = entryX;
    this.player.y = entryY;
    if (snapSafeFloor) {
      this.player.y = nextRoom.focalY;
    } else {
      this.alignPlayerToOpenDoorway(nextRoom);
    }

    this.camX = this.player.x;
    this.camY = this.player.y - 70;

    this.enemies = [];
    this.projectiles = [];
    this.drops = [];
    this.activeSlash = null;

    for (const pk of nextRoom.pickups) {
      if (s.collectedPickups.includes(pk.id)) continue;
      if (s.mode === 'xiaoduanshui' && (pk.kind === 'ability' || pk.kind === 'skill_scroll')) {
        continue;
      }
      this.drops.push({
        id: pk.id,
        isStaticPickup: true,
        kind: pk.kind,
        itemId: pk.itemId,
        amount: 1,
        x: (pk.gx + 0.5) * TILE_SIZE,
        y: (pk.gy + 1) * TILE_SIZE,
        vy: 0,
        color: pk.kind === 'ability' ? '#facc15' : '#48c9b0',
        label: this.getPickupLabel(pk.kind, pk.itemId),
      });
    }

    const scaleMult = nextRoom.realm === 'inverted' ? 1.85 : 1;
    for (const sp of nextRoom.spawns) {
      if (sp.gx < nextRoom.cols - 1 && sp.gy < nextRoom.rows - 1) {
        this.spawnEnemy(sp.kind, (sp.gx + 0.5) * TILE_SIZE, (sp.gy + 1) * TILE_SIZE, scaleMult);
      }
    }

    if (nextRoom.bossKind) {
      const bossKey = `${nextRoom.realm}:${nextRoom.bossKind}`;
      if (!s.defeatedBosses.includes(bossKey)) {
        this.spawnEnemy(nextRoom.bossKind, nextRoom.pixelW * 0.72, nextRoom.focalY, 1);
      }
    }

    const regKey = `${nextRoom.realm}:${nextRoom.region}`;
    if (regKey !== this.lastVisitedRegion) {
      this.lastVisitedRegion = regKey;
      const prefix = nextRoom.realm === 'inverted' ? '九幽倒悬里城 · ' : '九幽玄城 · ';
      this.cb.onShowBanner(`${prefix}${REGION_NAMES[nextRoom.region]}`, nextRoom.name);
    }

    const hasLiveBoss = this.enemies.some((e) => e.profile.isBoss);
    if (hasLiveBoss) AudioFX.setMood('boss');
    else if (nextRoom.realm === 'inverted') AudioFX.setMood('inverted');
    else if (nextRoom.region === 'opera') AudioFX.setMood('opera');
    else AudioFX.setMood('castle');

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

  private alignPlayerToOpenDoorway(room: BuiltRoom): void {
    const col = Math.max(0, Math.min(room.cols - 1, Math.floor(this.player.x / TILE_SIZE)));
    const footRow = Math.max(1, Math.min(room.rows - 2, Math.floor((this.player.y - 4) / TILE_SIZE)));
    if (room.tiles[footRow]?.[col] === 0 && room.tiles[footRow - 1]?.[col] === 0) {
      // 顺带向下寻最近落脚砖避免悬空卡门框
      for (let r = footRow; r < room.rows - 1; r++) {
        if (room.tiles[r + 1]?.[col] !== 0) {
          this.player.y = (r + 1) * TILE_SIZE;
          return;
        }
      }
      return;
    }
    let bestR = -1;
    let bestDist = 999;
    for (let r = 2; r <= room.rows - 3; r++) {
      if (room.tiles[r][col] === 0 && room.tiles[r - 1][col] === 0) {
        const d = Math.abs(r - footRow);
        if (d < bestDist) {
          bestDist = d;
          bestR = r;
        }
      }
    }
    if (bestR > 0) {
      this.player.y = (bestR + 1) * TILE_SIZE;
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

  private spawnEnemy(kind: EnemyKind, x: number, y: number, scale: number): void {
    const prof = ENEMY_PROFILES[kind];
    const hp = Math.round(prof.hp * scale);
    const ent: EnemyEntity = {
      id: this.nextEntityId++,
      profile: prof,
      x,
      y: prof.flying ? Math.min(y, y - 90) : y,
      baseY: prof.flying ? Math.max(120, y - 105) : y,
      vx: 0,
      vy: 0,
      facing: -1,
      hp,
      maxHp: hp,
      aiTimer: Math.random() * 1.2,
      actionTimer: 0,
      hurtFlash: 0,
      stunTimer: 0,
    };

    if (
      kind === 'boss_pei_wuji' &&
      this.slot &&
      this.slot.abilities.includes('mirror_truth') &&
      this.slot.abilities.includes('jade_pendant_full')
    ) {
      ent.hasGuParasite = true;
      ent.guMaxHp = 480;
      ent.guHp = 480;
      ent.guX = x;
      ent.guY = y - 96;
      this.cb.onShowBanner('破妄古镜显威！', '跃起斩碎师父头顶的【九幽蚀心蛊】方可救师！');
    }

    this.enemies.push(ent);
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
    this.cb.onShowBanner(`习得神通：${meta.name}`, meta.subtitle);
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
    const mpRegen = 2.4 + this.player.int * 0.16 + (core?.mpRegenBonus || 0);
    this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpRegen * dt);

    this.updatePlayer(dt);
    this.updateCamera(dt);
    this.updateActiveSlash(dt);
    this.updateOrbitSwords(dt);
    this.updateProjectiles(dt);
    this.updateEnemies(dt);
    this.updateDrops(dt);
    this.updateParticles(dt);
    this.checkRoomTransition();
    this.updateNearbyInteract();
  }

  private updateCamera(dt: number): void {
    const p = this.player;
    const targetX = p.x + p.facing * 42;
    const targetY = p.y - 68;
    const smooth = 1 - Math.pow(0.0008, dt);
    this.camX += (targetX - this.camX) * smooth;
    this.camY += (targetY - this.camY) * smooth;
  }

  private updatePlayer(dt: number): void {
    const p = this.player;
    const inp = this.input;
    p.animTime += dt;

    if (p.invulnTimer > 0) p.invulnTimer -= dt;
    if (p.attackCooldown > 0) p.attackCooldown -= dt;
    if (p.comboResetTimer > 0) {
      p.comboResetTimer -= dt;
      if (p.comboResetTimer <= 0) p.comboStep = 0;
    }
    if (p.dropThroughTimer > 0) p.dropThroughTimer -= dt;

    if (inp.consumePotion()) {
      this.useQuickHealPotion();
    }

    if (inp.consumeInteract() && this.nearbyInteract) {
      this.executeInteract(this.nearbyInteract.kind);
      return;
    }

    if (inp.consumeDash()) {
      if (this.tryGrappleLantern()) {
        return;
      }
      if (this.hasAbility('mist_dash') && p.mistDashTimer <= 0) {
        p.mistDashTimer = 0.25;
        p.invulnTimer = Math.max(p.invulnTimer, 0.28);
        const dir = inp.moveX !== 0 ? (Math.sign(inp.moveX) as 1 | -1) : p.facing;
        p.facing = dir;
        p.vx = dir * 560;
        p.vy = 0;
        AudioFX.playJump();
        NativeApp.haptic('light');
        this.spawnBurst(p.x, p.y - 30, '#a855f7', 12);
      } else if (p.backdashTimer <= 0) {
        p.backdashTimer = 0.2;
        p.attackCooldown = 0;
        p.vx = -p.facing * 430;
        AudioFX.playJump();
      }
    }

    if (inp.consumeSubWeapon()) {
      if (!this.tryGrappleLantern()) {
        this.castSubWeapon();
      }
    }

    if (inp.consumeJump()) {
      p.jumpBuffer = 0.13;
    } else if (p.jumpBuffer > 0) {
      p.jumpBuffer -= dt;
    }

    if (p.onGround) {
      p.coyoteTimer = 0.11;
      p.airJumpsLeft = this.hasAbility('double_jump') ? 1 : 0;
      p.groundSlamming = false;
    } else if (p.coyoteTimer > 0) {
      p.coyoteTimer -= dt;
    }

    if (p.jumpBuffer > 0) {
      if (p.onGround && inp.moveY > 0.5 && this.isStandingOnOneWayPlatform()) {
        p.dropThroughTimer = 0.22;
        p.onGround = false;
        p.coyoteTimer = 0;
        p.jumpBuffer = 0;
        p.y += 4;
      } else if (
        !p.onGround &&
        inp.moveY > 0.6 &&
        this.hasAbility('ground_slam') &&
        !p.groundSlamming
      ) {
        p.groundSlamming = true;
        p.vx = 0;
        p.vy = 940;
        p.invulnTimer = Math.max(p.invulnTimer, 0.35);
        p.jumpBuffer = 0;
        AudioFX.playSlash('heavy');
      } else if (p.coyoteTimer > 0) {
        p.vy = -605;
        p.onGround = false;
        p.coyoteTimer = 0;
        p.jumpBuffer = 0;
        AudioFX.playJump();
      } else if (p.onWall !== 0 && this.hasAbility('wall_jump')) {
        p.vy = -585;
        p.vx = -p.onWall * 390;
        p.facing = (-p.onWall) as 1 | -1;
        p.jumpBuffer = 0;
        AudioFX.playJump();
        this.spawnBurst(p.x + p.onWall * 12, p.y - 28, '#facc15', 8);
      } else if (p.airJumpsLeft > 0) {
        p.airJumpsLeft--;
        p.vy = -565;
        p.jumpBuffer = 0;
        AudioFX.playJump();
        this.spawnBurst(p.x, p.y, '#48c9b0', 10);
      }
    }

    if (!inp.jumpHeld && p.vy < -220 && !p.groundSlamming) {
      p.vy *= 0.62;
    }

    if (inp.consumeAttack()) {
      const motionSkill = inp.consumeMotionSkill(p.facing);
      if (motionSkill && this.tryCastMartialSkill(motionSkill)) {
        // skill triggered
      } else if (p.attackCooldown <= 0) {
        this.performWeaponAttack();
      }
    }

    if (p.mistDashTimer > 0) {
      p.mistDashTimer -= dt;
      if (Math.random() < 0.7) {
        this.afterImages.push({ x: p.x, y: p.y, facing: p.facing, color: '#a855f7', alpha: 0.65 });
      }
    } else if (p.backdashTimer > 0) {
      p.backdashTimer -= dt;
      p.vx *= 0.9;
      if (Math.random() < 0.6) {
        this.afterImages.push({ x: p.x, y: p.y, facing: p.facing, color: '#48c9b0', alpha: 0.55 });
      }
    } else if (!p.groundSlamming) {
      const moveSpeed = 268 * p.speedMult;
      if (inp.moveX !== 0) {
        p.facing = Math.sign(inp.moveX) as 1 | -1;
        p.vx = inp.moveX * moveSpeed;
      } else {
        p.vx *= Math.pow(0.001, dt);
        if (Math.abs(p.vx) < 8) p.vx = 0;
      }
    }

    if (p.mistDashTimer <= 0 && !p.groundSlamming) {
      p.vy = Math.min(860, p.vy + 1560 * dt);
    }

    this.moveAndCollidePlayer(dt);
  }

  private tryGrappleLantern(): boolean {
    if (!this.hasAbility('grapple_hook') || !this.room) return false;
    const p = this.player;
    let best: { x: number; y: number; dist: number } | null = null;
    for (const l of this.room.lanterns) {
      const d = Math.hypot(l.x - p.x, l.y - (p.y - 32));
      if (d <= 290 && (!best || d < best.dist)) {
        best = { x: l.x, y: l.y, dist: d };
      }
    }
    if (!best) return false;

    this.spawnBurst(p.x, p.y - 30, '#ef4444', 10);
    p.x = best.x;
    p.y = best.y + 8;
    p.vy = -520;
    p.vx = p.facing * 270;
    p.onGround = false;
    p.airJumpsLeft = this.hasAbility('double_jump') ? 1 : 0;
    AudioFX.playSlash('whip');
    NativeApp.haptic('medium');
    this.spawnBurst(best.x, best.y, '#facc15', 14);
    return true;
  }

  private performWeaponAttack(): void {
    if (!this.slot) return;
    const p = this.player;
    const w = WEAPONS[this.slot.equippedWeapon] || WEAPONS.sword_1;

    p.comboStep = (p.comboStep + 1) % 3;
    p.comboResetTimer = 0.65;

    const totalSec = (w.windupMs + w.activeMs + w.recoveryMs) / 1000;
    p.attackCooldown = totalSec * 0.72;

    if (w.archetype === 'daggers' && !p.onGround && p.vy > -60) {
      p.vy = -135;
    }

    const pogoDown = w.archetype === 'sword' && !p.onGround && this.input.moveY > 0.5;
    const aimX = this.input.moveX !== 0 ? this.input.moveX : p.facing;
    const aimY = this.input.moveY;

    this.slashHitIds.clear();
    this.activeSlash = {
      x: p.x,
      y: p.y - 34,
      facing: p.facing,
      aimX,
      aimY,
      archetype: w.archetype,
      comboStep: p.comboStep,
      pogoDown,
      progress: 0,
      duration: Math.max(0.14, (w.windupMs + w.activeMs) / 1000),
      reachX: w.reachX,
      reachY: w.reachY,
      color: w.color,
      glowColor: w.glowColor,
    };

    const sfxWeight =
      w.archetype === 'greatsword'
        ? 'heavy'
        : w.archetype === 'whip'
          ? 'whip'
          : w.archetype === 'spear'
            ? 'spear'
            : 'light';
    AudioFX.playSlash(sfxWeight);
  }

  private tryCastMartialSkill(skillId: SkillId): boolean {
    if (!this.slot) return false;
    const sk = SKILLS[skillId];
    const p = this.player;
    if (p.mp < sk.mpCost) {
      this.floats.push({
        x: p.x,
        y: p.y - 68,
        vy: -36,
        text: '真气不足！',
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
    p.attackCooldown = 0.28;
    AudioFX.playSkillCast();
    NativeApp.haptic('medium');
    this.skillBanner = { name: `【${sk.name}】`, timer: 1.15, color: sk.color };

    const skillDmg = Math.round((p.atk + p.int * 1.6) * sk.dmgMult);
    const w = WEAPONS[this.slot.equippedWeapon] || WEAPONS.sword_1;

    if (skillId === 'shuofeng_wave') {
      this.projectiles.push({
        fromPlayer: true,
        kind: 'qi_wave',
        x: p.x + p.facing * 28,
        y: p.y - 34,
        vx: p.facing * (w.archetype === 'spear' ? 680 : 520),
        vy: 0,
        r: w.archetype === 'greatsword' ? 40 : 30,
        dmg: skillDmg,
        color: w.glowColor,
        life: 0.95,
        maxLife: 0.95,
        pierce: 99,
        hitIds: new Set(),
      });
      this.spawnBurst(p.x + p.facing * 24, p.y - 34, w.glowColor, 14);
    } else if (skillId === 'shunying_flash') {
      const startX = p.x;
      const dist = 220;
      p.invulnTimer = Math.max(p.invulnTimer, 0.38);
      for (let step = 1; step <= 6; step++) {
        const testX = startX + p.facing * ((dist * step) / 6);
        if (!this.isSolidAtPixel(testX, p.y - 22)) {
          p.x = testX;
          this.afterImages.push({
            x: testX,
            y: p.y,
            facing: p.facing,
            color: '#f7d788',
            alpha: 0.85,
          });
        }
      }
      const minX = Math.min(startX, p.x) - 24;
      const maxX = Math.max(startX, p.x) + 24;
      this.damageEnemiesInBox(minX, p.y - 74, maxX - minX, 80, skillDmg, true, 40);
      this.screenShake = 5;
    } else if (skillId === 'jinghong_rising') {
      p.vy = -680;
      p.onGround = false;
      p.invulnTimer = Math.max(p.invulnTimer, 0.4);
      this.damageEnemiesInBox(p.x - 58, p.y - 130, 116, 136, skillDmg, true, 45);
      this.spawnBurst(p.x, p.y - 44, '#38bdf8', 20);
      this.screenShake = 5;
    } else if (skillId === 'taiji_parry') {
      this.taijiFlashTimer = 0.42;
      p.invulnTimer = Math.max(p.invulnTimer, 0.45);
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const pr = this.projectiles[i];
        if (!pr.fromPlayer && Math.hypot(pr.x - p.x, pr.y - (p.y - 32)) <= 170) {
          this.spawnBurst(pr.x, pr.y, '#fde047', 6);
          this.projectiles.splice(i, 1);
          AudioFX.playParryClang();
        }
      }
      for (const e of this.enemies) {
        if (Math.hypot(e.x - p.x, e.y - 28 - (p.y - 32)) <= 160) {
          e.stunTimer = 1.6;
          this.applyDamageToEnemy(e, skillDmg, true, 55);
        }
      }
      this.screenShake = 6;
    } else if (skillId === 'jiuyou_soulsteal') {
      this.soulStealFlashTimer = 0.65;
      p.invulnTimer = Math.max(p.invulnTimer, 0.55);
      let totalHeal = 0;
      for (const e of [...this.enemies]) {
        if (Math.hypot(e.x - p.x, e.y - p.y) > 640) continue;
        this.spawnBurst(e.x, e.y - e.profile.h * 0.5, '#ef4444', 14);
        this.applyDamageToEnemy(e, skillDmg, true, 60);
        totalHeal += 18;
      }
      if (totalHeal > 0) {
        p.hp = Math.min(p.maxHp, p.hp + totalHeal);
        this.floats.push({
          x: p.x,
          y: p.y - 70,
          vy: -40,
          text: `噬魂回血 +${totalHeal}`,
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
        y: this.player.y - 64,
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
    const dmg = Math.round(
      (sub.baseDmg + this.player.int * 1.9) * (1 + (core?.subWeaponMult || 0))
    );
    const p = this.player;
    AudioFX.playSlash('light');

    if (sub.id === 'dagger_throw') {
      for (let i = -1; i <= 1; i++) {
        this.projectiles.push({
          fromPlayer: true,
          kind: 'dagger',
          x: p.x + p.facing * 18,
          y: p.y - 34 + i * 9,
          vx: p.facing * 640,
          vy: i * 24,
          r: 8,
          dmg,
          color: sub.color,
          life: 0.85,
          maxLife: 0.85,
          pierce: 1,
          hitIds: new Set(),
        });
      }
    } else if (sub.id === 'holy_fire') {
      this.projectiles.push({
        fromPlayer: true,
        kind: 'holy_fire',
        x: p.x + p.facing * 16,
        y: p.y - 38,
        vx: p.facing * 240,
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
        x: p.x + p.facing * 20,
        y: p.y - 34,
        vx: p.facing * 430,
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
      this.projectiles.push({
        fromPlayer: true,
        kind: 'seal',
        x: p.x + p.facing * 14,
        y: p.y - 46,
        vx: p.facing * 230,
        vy: -560,
        r: 22,
        dmg,
        color: sub.color,
        life: 1.8,
        maxLife: 1.8,
        pierce: 4,
        hitIds: new Set(),
      });
    } else if (sub.id === 'sword_orbit') {
      p.orbitSwordTimer = 6.0;
      this.spawnBurst(p.x, p.y - 30, '#60a5fa', 16);
    }
  }

  private updateActiveSlash(dt: number): void {
    const sl = this.activeSlash;
    if (!sl || !this.slot || !this.room) return;

    const p = this.player;
    sl.x = p.x;
    sl.y = p.y - 34;
    sl.progress += dt / sl.duration;

    if (sl.progress >= 0.15 && sl.progress <= 0.9) {
      let bx = p.x;
      let by = p.y - 58;
      let bw = sl.reachX;
      let bh = sl.reachY;

      if (sl.pogoDown) {
        bx = p.x - 32;
        by = p.y - 14;
        bw = 64;
        bh = 58;
      } else if (sl.archetype === 'greatsword') {
        bx = sl.facing === 1 ? p.x - 36 : p.x - sl.reachX;
        by = p.y - sl.reachY - 14;
        bw = sl.reachX + 36;
        bh = sl.reachY + 18;
      } else if (sl.archetype === 'spear' && sl.aimY < -0.5) {
        bx = sl.facing === 1 ? p.x : p.x - sl.reachX * 0.82;
        by = p.y - sl.reachX * 0.88;
        bw = sl.reachX * 0.82;
        bh = sl.reachX * 0.8;
      } else if (sl.archetype === 'whip' && (sl.aimY !== 0 || sl.aimX !== 0)) {
        const dirX = sl.aimX !== 0 ? sl.aimX : sl.facing;
        const dirY = sl.aimY;
        const endX = p.x + dirX * sl.reachX;
        const endY = p.y - 34 + dirY * sl.reachX * 0.75;
        bx = Math.min(p.x, endX) - 18;
        by = Math.min(p.y - 34, endY) - 20;
        bw = Math.abs(endX - p.x) + 36;
        bh = Math.abs(endY - (p.y - 34)) + 40;
      } else {
        bx = sl.facing === 1 ? p.x - 8 : p.x - sl.reachX;
        by = p.y - 34 - sl.reachY * 0.55;
        bw = sl.reachX + 8;
        bh = sl.reachY + 14;
      }

      this.checkBreakSecretWalls(bx, by, bw, bh);

      const wDef = WEAPONS[this.slot.equippedWeapon] || WEAPONS.sword_1;
      for (const e of [...this.enemies]) {
        if (this.slashHitIds.has(e.id)) continue;

        if (e.hasGuParasite && e.guHp && e.guHp > 0 && e.guX !== undefined && e.guY !== undefined) {
          if (
            e.guX + 22 >= bx &&
            e.guX - 22 <= bx + bw &&
            e.guY + 22 >= by &&
            e.guY - 22 <= by + bh &&
            !this.slashHitIds.has(e.id + 90000)
          ) {
            this.slashHitIds.add(e.id + 90000);
            e.guHp -= this.player.atk;
            AudioFX.playHit(true);
            this.spawnBurst(e.guX, e.guY, '#c084fc', 12);
            this.floats.push({
              x: e.guX,
              y: e.guY - 18,
              vy: -42,
              text: `斩蛊 -${this.player.atk}`,
              color: '#e879f9',
              size: 15,
              life: 0.85,
            });
            if (sl.pogoDown) p.vy = -500;
            if (e.guHp <= 0) {
              this.triggerInvertedCastleAwakening();
              return;
            }
          }
        }

        const ex1 = e.x - e.profile.w * 0.5;
        const ex2 = e.x + e.profile.w * 0.5;
        const ey1 = e.y - e.profile.h;
        const ey2 = e.y;

        if (ex2 >= bx && ex1 <= bx + bw && ey2 >= by && ey1 <= by + bh) {
          this.slashHitIds.add(e.id);

          let dmgMult = 1;
          let forceCrit = false;
          const distFromHero = Math.abs(e.x - p.x);

          if (sl.archetype === 'spear' && distFromHero >= sl.reachX * 0.65) {
            dmgMult *= 1.35;
            forceCrit = true;
          }
          if (sl.archetype === 'daggers' && sl.facing === e.facing) {
            dmgMult *= 1.65;
            forceCrit = true;
          }
          if (sl.archetype === 'whip' && distFromHero >= sl.reachX * 0.68) {
            dmgMult *= 1.28;
            e.vx += sl.facing * 220;
          }

          if (
            e.profile.shieldedFront &&
            sl.archetype !== 'greatsword' &&
            sl.facing !== e.facing
          ) {
            dmgMult *= 0.25;
            AudioFX.playParryClang();
            this.floats.push({
              x: e.x,
              y: e.y - e.profile.h - 8,
              vy: -30,
              text: '玄盾格挡!(绕背或重刃破盾)',
              color: '#cbd5e1',
              size: 11,
              life: 0.8,
            });
          }

          const rawDmg = Math.round(this.player.atk * dmgMult);
          this.applyDamageToEnemy(e, rawDmg, forceCrit, wDef.poiseDmg);

          if (sl.pogoDown) {
            p.vy = -515;
            p.airJumpsLeft = this.hasAbility('double_jump') ? 1 : 0;
          }
        }
      }
    }

    if (sl.progress >= 1) {
      this.activeSlash = null;
    }
  }

  private checkBreakSecretWalls(bx: number, by: number, bw: number, bh: number): void {
    if (!this.room || !this.slot) return;
    const c1 = Math.max(0, Math.floor(bx / TILE_SIZE));
    const c2 = Math.min(this.room.cols - 1, Math.floor((bx + bw) / TILE_SIZE));
    const r1 = Math.max(0, Math.floor(by / TILE_SIZE));
    const r2 = Math.min(this.room.rows - 1, Math.floor((by + bh) / TILE_SIZE));

    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        if (this.room.tiles[r][c] === 6) {
          this.room.tiles[r][c] = 0;
          const key = `${this.room.realm}:${this.room.id}:${r},${c}`;
          if (!this.slot.brokenSecretWalls.includes(key)) {
            this.slot.brokenSecretWalls.push(key);
          }
          AudioFX.playHit(true);
          NativeApp.haptic('medium');
          this.spawnBurst((c + 0.5) * TILE_SIZE, (r + 0.5) * TILE_SIZE, '#f59e0b', 14);
          this.floats.push({
            x: (c + 0.5) * TILE_SIZE,
            y: r * TILE_SIZE,
            vy: -36,
            text: '击破暗墙密室！',
            color: '#fde047',
            size: 13,
            life: 1.1,
          });
        }
      }
    }
  }

  private updateOrbitSwords(dt: number): void {
    const p = this.player;
    if (p.orbitSwordTimer <= 0) return;
    p.orbitSwordTimer -= dt;
    p.orbitAngle += dt * 6.2;

    for (let i = 0; i < 3; i++) {
      const ang = p.orbitAngle + (i * Math.PI * 2) / 3;
      const sx = p.x + Math.cos(ang) * 62;
      const sy = p.y - 32 + Math.sin(ang) * 62;
      for (const e of [...this.enemies]) {
        if (
          Math.abs(sx - e.x) < e.profile.w * 0.6 + 12 &&
          sy >= e.y - e.profile.h - 10 &&
          sy <= e.y + 10 &&
          e.hurtFlash <= 0
        ) {
          this.applyDamageToEnemy(e, Math.round(p.int * 1.6 + 12), false, 8);
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

      if (pr.kind === 'holy_fire') {
        pr.vy += 980 * dt;
      } else if (pr.kind === 'seal') {
        pr.vy += 1280 * dt;
      } else if (pr.kind === 'bagua' && !pr.returning && pr.life < pr.maxLife * 0.58) {
        pr.returning = true;
        pr.vx = -pr.vx;
        pr.hitIds.clear();
      }

      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;

      if (pr.kind === 'holy_fire' && this.isSolidAtPixel(pr.x, pr.y + 6)) {
        for (let k = -1; k <= 1; k++) {
          this.projectiles.push({
            fromPlayer: true,
            kind: 'fire_pillar',
            x: pr.x + k * 26,
            y: Math.floor((pr.y + 6) / TILE_SIZE) * TILE_SIZE,
            vx: 0,
            vy: 0,
            r: 20,
            dmg: Math.max(8, Math.round(pr.dmg * 0.55)),
            color: '#f97316',
            life: 1.5,
            maxLife: 1.5,
            pierce: 99,
            hitIds: new Set(),
          });
        }
        this.spawnBurst(pr.x, pr.y, '#f97316', 12);
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
            pr.x + pr.r >= e.x - e.profile.w * 0.5 &&
            pr.x - pr.r <= e.x + e.profile.w * 0.5 &&
            pr.y + pr.r >= e.y - e.profile.h &&
            pr.y - pr.r <= e.y
          ) {
            pr.hitIds.add(e.id);
            this.applyDamageToEnemy(e, pr.dmg, false, 16);
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
          Math.abs(pr.x - p.x) < p.w * 0.5 + pr.r - 3 &&
          pr.y >= p.y - p.h - pr.r &&
          pr.y <= p.y + pr.r
        ) {
          this.damagePlayer(pr.dmg, pr.x < p.x ? 1 : -1);
          this.projectiles.splice(i, 1);
        }
      }
    }
  }

  private updateEnemies(dt: number): void {
    const p = this.player;
    const room = this.room;
    if (!room) return;

    for (const e of [...this.enemies]) {
      if (e.hurtFlash > 0) e.hurtFlash -= dt;
      if (e.stunTimer > 0) {
        e.stunTimer -= dt;
        continue;
      }

      e.aiTimer += dt;
      const dx = p.x - e.x;
      const dy = p.y - 30 - (e.y - e.profile.h * 0.5);
      const dist = Math.hypot(dx, dy);
      e.facing = dx >= 0 ? 1 : -1;

      if (e.profile.flying) {
        const targetY = e.baseY + Math.sin(e.aiTimer * 2.6) * 34;
        e.vy = (targetY - e.y) * 2.4;
        if (dist < 520) {
          e.vx = Math.sign(dx) * e.profile.speed * (dist < 110 ? -0.4 : 0.75);
        } else {
          e.vx = Math.cos(e.aiTimer * 1.4) * 55;
        }
      } else {
        if (e.profile.kind === 'boss_xiao_duanshui' || e.profile.kind === 'boss_pei_wuji') {
          if (Math.floor(e.aiTimer * 0.8) % 3 === 1) {
            e.vx = e.facing * e.profile.speed * 1.55;
          } else {
            e.vx = e.facing * e.profile.speed * 0.7;
          }
          if (Math.abs(dx) < 130 && e.vy === 0 && Math.random() < dt * 1.2) {
            e.vy = -520;
          }
        } else if (dist < 440) {
          e.vx = e.facing * e.profile.speed;
        } else {
          e.vx = Math.sin(e.aiTimer * 1.5) * e.profile.speed * 0.6;
          e.facing = e.vx >= 0 ? 1 : -1;
        }
        e.vy = Math.min(720, e.vy + 1450 * dt);
      }

      if (e.profile.ranged) {
        e.actionTimer += dt;
        const fireInterval = e.profile.isBoss ? 1.85 : 2.6;
        if (e.actionTimer >= fireInterval && dist < 560) {
          e.actionTimer = 0;
          const count =
            e.profile.kind === 'boss_zhuyin' ? 5 : e.profile.isBoss ? 3 : 1;
          const baseAng = Math.atan2(dy, dx);
          for (let k = 0; k < count; k++) {
            const spread = (k - (count - 1) / 2) * 0.24;
            const ang = baseAng + spread;
            this.projectiles.push({
              fromPlayer: false,
              kind: 'enemy_orb',
              x: e.x,
              y: e.y - e.profile.h * 0.55,
              vx: Math.cos(ang) * (e.profile.isBoss ? 290 : 230),
              vy: Math.sin(ang) * (e.profile.isBoss ? 290 : 230),
              r: e.profile.isBoss ? 11 : 8,
              dmg: e.profile.atk,
              color: e.profile.accentColor,
              life: 3.2,
              maxLife: 3.2,
              pierce: 1,
              hitIds: new Set(),
            });
          }
        }
      }

      const nextX = Math.max(48, Math.min(room.pixelW - 48, e.x + e.vx * dt));
      if (e.profile.flying || !this.isSolidAtPixel(nextX, e.y - 12)) {
        e.x = nextX;
      }
      if (e.profile.flying) {
        e.y = Math.max(85, Math.min(room.pixelH - 92, e.y + e.vy * dt));
      } else {
        e.y += e.vy * dt;
        const footRow = Math.floor(e.y / TILE_SIZE);
        const col = Math.floor(e.x / TILE_SIZE);
        if (
          footRow >= 0 &&
          footRow < room.rows &&
          (room.tiles[footRow]?.[col] === 1 ||
            room.tiles[footRow]?.[col] === 2 ||
            room.tiles[footRow]?.[col] === 3) &&
          e.vy >= 0
        ) {
          e.y = footRow * TILE_SIZE;
          e.vy = 0;
        }
      }

      if (e.hasGuParasite && e.guHp && e.guHp > 0) {
        e.guX = e.x + Math.sin(e.aiTimer * 3.4) * 34;
        e.guY = e.y - e.profile.h - 38 + Math.cos(e.aiTimer * 2.7) * 14;
      }

      if (
        p.invulnTimer <= 0 &&
        p.mistDashTimer <= 0 &&
        Math.abs(p.x - e.x) < (p.w + e.profile.w) * 0.44 &&
        p.y > e.y - e.profile.h + 6 &&
        p.y - p.h < e.y - 4
      ) {
        this.damagePlayer(e.profile.atk, p.x >= e.x ? 1 : -1);
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
        e.x + e.profile.w * 0.5 >= bx &&
        e.x - e.profile.w * 0.5 <= bx + bw &&
        e.y >= by &&
        e.y - e.profile.h <= by + bh
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
    const finalDmg = Math.max(1, Math.round(rawDmg * critMult - e.profile.def * 0.45));

    e.hp -= finalDmg;
    e.hurtFlash = 0.14;
    if (poiseDmg >= 35 && !e.profile.isBoss) {
      e.stunTimer = Math.max(e.stunTimer, 0.32);
      e.vx = this.player.facing * 140;
    }

    if (this.player.lifesteal > 0) {
      const heal = Math.max(1, Math.round(finalDmg * this.player.lifesteal));
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
    }

    AudioFX.playHit(isCrit);
    this.hitstopTimer = isCrit ? 0.032 : 0.016;
    this.spawnBurst(
      e.x,
      e.y - e.profile.h * 0.5,
      isCrit ? '#fde047' : '#ef4444',
      isCrit ? 10 : 6
    );
    this.floats.push({
      x: e.x + (Math.random() - 0.5) * 18,
      y: e.y - e.profile.h - 6,
      vy: -48,
      text: isCrit ? `暴击 ${finalDmg}!` : `${finalDmg}`,
      color: isCrit ? '#fde047' : '#f8fafc',
      size: isCrit ? 16 : 13,
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

    this.spawnBurst(
      e.x,
      e.y - e.profile.h * 0.5,
      e.profile.accentColor,
      e.profile.isBoss ? 34 : 14
    );
    if (e.profile.isBoss) {
      this.screenShake = 11;
      NativeApp.haptic('heavy');
    }

    s.exp += e.profile.exp;
    const needExp = this.getExpForNextLevel(s.level);
    if (s.exp >= needExp) {
      s.exp -= needExp;
      s.level++;
      this.recalcStats(true);
      AudioFX.playRelicBell();
      this.cb.onShowBanner(`境界突破 · 等级 ${s.level}`, '气血与真气已完全充盈！');
    }

    if (Math.random() < 0.55) {
      this.drops.push({
        id: `drop_${this.nextEntityId++}`,
        isStaticPickup: false,
        kind: 'gold',
        itemId: 'gold',
        amount: e.profile.gold + Math.floor(this.player.lck * 0.8),
        x: e.x,
        y: e.y - 12,
        vy: -220,
        color: '#facc15',
        label: '银两',
      });
    } else {
      this.drops.push({
        id: `drop_${this.nextEntityId++}`,
        isStaticPickup: false,
        kind: 'heart',
        itemId: 'heart',
        amount: e.profile.isBoss ? 12 : 3,
        x: e.x,
        y: e.y - 12,
        vy: -220,
        color: '#f97316',
        label: '灵符',
      });
    }

    const coreId = e.profile.yaoCoreId;
    if (
      coreId &&
      !s.ownedYaoCores.includes(coreId) &&
      Math.random() < (e.profile.yaoDropChance || 0.15) + this.player.lck * 0.008
    ) {
      this.drops.push({
        id: `core_${this.nextEntityId++}`,
        isStaticPickup: false,
        kind: 'yao_core',
        itemId: coreId,
        amount: 1,
        x: e.x + 12,
        y: e.y - 18,
        vy: -280,
        color: '#c084fc',
        label: YAO_CORES[coreId].name,
      });
    }

    if (!e.profile.isBoss) return;

    if (s.mode === 'boss_rush') {
      if (this.bossRushIndex + 1 < BOSS_RUSH_ORDER.length) {
        window.setTimeout(() => this.enterBossRushWave(this.bossRushIndex + 1), 1100);
      } else {
        const best = SaveManager.getMeta().bestBossRushSec;
        if (best === null || s.playTimeSec < best) {
          SaveManager.saveMeta({ bestBossRushSec: Math.round(s.playTimeSec) });
        }
        this.cb.onEndingReached('boss_rush', s.playTimeSec);
      }
      return;
    }

    const bossKey = `${this.room.realm}:${e.profile.kind}`;
    if (!s.defeatedBosses.includes(bossKey)) {
      s.defeatedBosses.push(bossKey);
    }
    AudioFX.setMood(this.room.realm === 'inverted' ? 'inverted' : 'castle');

    if (e.profile.kind === 'boss_xiao_duanshui' && s.mode === 'story') {
      this.grantAbility('mist_dash');
      this.cb.onStartStory(STORY_SCENES.boss_xiao_post);
      return;
    }

    if (e.profile.kind === 'boss_pei_wuji') {
      if (s.mode === 'xiaoduanshui') {
        this.enterInvertedCastle();
      } else {
        this.cb.onStartStory(STORY_SCENES.altar_normal_end, () => {
          this.cb.onEndingReached('normal', s.playTimeSec);
        });
      }
      return;
    }

    if (e.profile.kind === 'boss_zhuyin') {
      SaveManager.saveMeta({ unlockedXiaoMode: true, unlockedBossRush: true });
      SaveManager.saveSlot(s);
      if (s.mode === 'story') {
        this.cb.onStartStory(STORY_SCENES.true_ending, () => {
          this.cb.onEndingReached('true', s.playTimeSec);
        });
      } else {
        this.cb.onEndingReached('true', s.playTimeSec);
      }
      return;
    }

    if (e.profile.rewardAbility) {
      this.grantAbility(e.profile.rewardAbility);
    }
  }

  private triggerInvertedCastleAwakening(): void {
    const s = this.slot;
    if (!s) return;
    this.enemies = [];
    this.projectiles = [];
    const bossKey = 'normal:boss_pei_wuji';
    if (!s.defeatedBosses.includes(bossKey)) s.defeatedBosses.push(bossKey);

    AudioFX.playRelicBell();
    NativeApp.haptic('heavy');
    this.cb.onStartStory(STORY_SCENES.altar_invert_awakening, () => {
      this.enterInvertedCastle();
    });
  }

  public enterInvertedCastle(): void {
    if (!this.slot) return;
    const invEntry = WorldMap.getRoom('inverted', 'altar_save');
    this.loadRoom(invEntry, invEntry.focalX, invEntry.focalY, true);
    SaveManager.saveSlot(this.slot);
    this.cb.onShowBanner('天地翻转 · 九幽倒悬里城', '探索率上限已突破至 200.0%！');
  }

  public getExpForNextLevel(lv: number): number {
    return Math.round(65 * Math.pow(1.24, lv - 1));
  }

  private damagePlayer(rawAtk: number, knockDir: 1 | -1): void {
    const p = this.player;
    const dmg = Math.max(2, Math.round(rawAtk - p.def * 0.55));
    p.hp = Math.max(0, p.hp - dmg);
    p.invulnTimer = 0.85;
    p.groundSlamming = false;
    p.vx = knockDir * 240;
    p.vy = -240;
    this.screenShake = 6;
    AudioFX.playHurt();
    NativeApp.haptic('heavy');

    this.floats.push({
      x: p.x,
      y: p.y - p.h - 6,
      vy: -42,
      text: `-${dmg}`,
      color: '#ef4444',
      size: 15,
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
        const r = Math.floor(d.y / TILE_SIZE);
        const c = Math.floor(d.x / TILE_SIZE);
        if (
          r >= 0 &&
          r < this.room.rows &&
          (this.room.tiles[r]?.[c] === 1 || this.room.tiles[r]?.[c] === 2) &&
          d.vy >= 0
        ) {
          d.y = r * TILE_SIZE;
          d.vy = 0;
        }
      }

      if (Math.abs(d.x - p.x) < 36 && Math.abs(d.y - 16 - (p.y - 30)) < 42) {
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
        y: d.y - 22,
        vy: -38,
        text: `+${d.amount} 银两`,
        color: '#facc15',
        size: 13,
        life: 0.8,
      });
      return;
    }

    if (d.kind === 'heart') {
      s.talismanHearts = Math.min(99, s.talismanHearts + d.amount);
      this.floats.push({
        x: d.x,
        y: d.y - 22,
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
      this.cb.onShowBanner(`吸纳妖丹 · ${d.label}`, YAO_CORES[d.itemId].desc);
    } else if (d.kind === 'ability') {
      this.grantAbility(d.itemId as AbilityKey);
    } else if (d.kind === 'skill_scroll') {
      const skId = d.itemId as SkillId;
      if (!s.learnedSkills.includes(skId)) s.learnedSkills.push(skId);
      this.cb.onShowBanner(
        `领悟秘卷 · ${SKILLS[skId].name}`,
        `手搓指令：${SKILLS[skId].commandText}`
      );
    } else if (d.kind === 'max_up') {
      if (d.itemId === 'hp_vessel') s.maxHpBonus += 25;
      else s.maxMpBonus += 20;
      this.recalcStats(true);
      this.cb.onShowBanner(d.label, '周身经脉拓宽，状态已完全恢复！');
    } else if (d.kind === 'weapon') {
      if (d.itemId.startsWith('sub:')) {
        const subId = d.itemId.slice(4) as SubWeaponId;
        if (!s.ownedSubWeapons.includes(subId)) s.ownedSubWeapons.push(subId);
        s.equippedSubWeapon = subId;
        this.cb.onShowBanner(`获得奇门法器 · ${SUB_WEAPONS[subId].name}`, SUB_WEAPONS[subId].desc);
      } else {
        if (!s.ownedWeapons.includes(d.itemId)) s.ownedWeapons.push(d.itemId);
        this.cb.onShowBanner(
          `获得神兵 · ${WEAPONS[d.itemId].name}`,
          '可点击左上角兵器框或进入【装备】随时切换！'
        );
      }
    } else if (d.kind === 'armor') {
      if (!s.ownedArmors.includes(d.itemId)) s.ownedArmors.push(d.itemId);
      this.cb.onShowBanner(`获得宝甲 · ${ARMORS[d.itemId].name}`, ARMORS[d.itemId].desc);
    } else if (d.kind === 'consumable') {
      s.consumables[d.itemId] = (s.consumables[d.itemId] || 0) + 1;
      this.floats.push({
        x: d.x,
        y: d.y - 26,
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
    AudioFX.playSlash('light');
    this.floats.push({
      x: this.player.x,
      y: this.player.y - 68,
      vy: -34,
      text: `佩兵：${w.name}`,
      color: w.glowColor,
      size: 13,
      life: 0.9,
    });
  }

  public useQuickHealPotion(): void {
    const s = this.slot;
    if (!s) return;
    const order = ['jinchuang_yao', 'beggar_chicken', 'osmanthus_wine', 'huiqi_dan'];
    for (const id of order) {
      if ((s.consumables[id] || 0) > 0) {
        this.useConsumable(id);
        return;
      }
    }
    this.floats.push({
      x: this.player.x,
      y: this.player.y - 64,
      vy: -32,
      text: '行囊中已无丹药',
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
    this.spawnBurst(this.player.x, this.player.y - 30, '#4ade80', 12);
    this.floats.push({
      x: this.player.x,
      y: this.player.y - 68,
      vy: -40,
      text: `服用 ${def.name}`,
      color: '#4ade80',
      size: 13,
      life: 0.95,
    });
    return true;
  }

  private moveAndCollidePlayer(dt: number): void {
    if (!this.room || !this.slot) return;
    const room = this.room;
    const p = this.player;
    const halfW = p.w * 0.5;

    const nextX = p.x + p.vx * dt;
    p.onWall = 0;
    const checkRows = [
      Math.floor((p.y - 6) / TILE_SIZE),
      Math.floor((p.y - p.h * 0.5) / TILE_SIZE),
      Math.floor((p.y - p.h + 6) / TILE_SIZE),
    ];

    if (p.vx > 0) {
      const rightCol = Math.floor((nextX + halfW) / TILE_SIZE);
      if (rightCol >= 0 && rightCol < room.cols && checkRows.some((r) => this.blocksPlayerHoriz(r, rightCol))) {
        p.x = rightCol * TILE_SIZE - halfW - 0.01;
        p.vx = 0;
        if (!p.onGround && room.tiles[checkRows[1]]?.[rightCol] === 1) {
          p.onWall = 1;
          if (this.hasAbility('wall_jump') && p.vy > 130) p.vy = 130;
        }
      } else {
        p.x = nextX;
      }
    } else if (p.vx < 0) {
      const leftCol = Math.floor((nextX - halfW) / TILE_SIZE);
      if (leftCol >= 0 && leftCol < room.cols && checkRows.some((r) => this.blocksPlayerHoriz(r, leftCol))) {
        p.x = (leftCol + 1) * TILE_SIZE + halfW + 0.01;
        p.vx = 0;
        if (!p.onGround && room.tiles[checkRows[1]]?.[leftCol] === 1) {
          p.onWall = -1;
          if (this.hasAbility('wall_jump') && p.vy > 130) p.vy = 130;
        }
      } else {
        p.x = nextX;
      }
    }

    const prevY = p.y;
    const nextY = p.y + p.vy * dt;
    const leftC = Math.max(0, Math.min(room.cols - 1, Math.floor((p.x - halfW + 3) / TILE_SIZE)));
    const rightC = Math.max(0, Math.min(room.cols - 1, Math.floor((p.x + halfW - 3) / TILE_SIZE)));

    p.onGround = false;
    if (p.vy >= 0) {
      const footR = Math.floor(nextY / TILE_SIZE);
      if (footR >= 0 && footR < room.rows) {
        for (let c = leftC; c <= rightC; c++) {
          const t = room.tiles[footR][c];
          if (t === 7) {
            this.damagePlayer(24, -p.facing as 1 | -1);
            p.x = 3.5 * TILE_SIZE;
            p.y = (room.rows - 2) * TILE_SIZE;
            p.vy = 0;
            return;
          }
          if (t === 3 && p.groundSlamming) {
            const cellStart = Math.floor(c / UNIT_COLS) * UNIT_COLS;
            for (let bc = cellStart + 8; bc <= cellStart + 14 && bc < room.cols; bc++) {
              if (room.tiles[footR][bc] === 3) {
                room.tiles[footR][bc] = 0;
                const key = `${room.realm}:${room.id}:${footR},${bc}`;
                if (!this.slot.brokenSecretWalls.includes(key)) {
                  this.slot.brokenSecretWalls.push(key);
                }
              }
            }
            this.screenShake = 10;
            AudioFX.playHit(true);
            NativeApp.haptic('heavy');
            this.spawnBurst(p.x, footR * TILE_SIZE, '#fb923c', 22);
            this.cb.onShowBanner('千斤坠破障！', '地下【九曲幽冥水牢】通道已贯通！');
            continue;
          }
          const isSolid = t === 1 || t === 3 || t === 6;
          const isOneWay =
            t === 2 && p.dropThroughTimer <= 0 && prevY <= footR * TILE_SIZE + 8;

          if (isSolid || isOneWay) {
            p.y = footR * TILE_SIZE;
            if (p.groundSlamming) {
              p.groundSlamming = false;
              this.screenShake = 7;
              this.damageEnemiesInBox(
                p.x - 95,
                p.y - 60,
                190,
                68,
                Math.round(p.atk * 1.6),
                true,
                55
              );
              this.spawnBurst(p.x, p.y, '#f97316', 16);
            }
            p.vy = 0;
            p.onGround = true;
            break;
          }
        }
      }
      if (!p.onGround) p.y = nextY;
    } else {
      const headR = Math.floor((nextY - p.h) / TILE_SIZE);
      if (headR >= 0 && headR < room.rows) {
        let blocked = false;
        for (let c = leftC; c <= rightC; c++) {
          const t = room.tiles[headR][c];
          if (t === 1 || t === 3 || t === 6) {
            blocked = true;
            break;
          }
        }
        if (blocked) {
          p.y = (headR + 1) * TILE_SIZE + p.h;
          p.vy = 0;
        } else {
          p.y = nextY;
        }
      } else {
        p.y = nextY;
      }
    }
  }

  private blocksPlayerHoriz(r: number, c: number): boolean {
    if (!this.room || r < 0 || r >= this.room.rows || c < 0 || c >= this.room.cols) return false;
    const t = this.room.tiles[r][c];
    if (t === 1 || t === 3 || t === 6) return true;
    if (t === 4) {
      return this.player.mistDashTimer <= 0;
    }
    if (t === 5) {
      if (this.player.mistDashTimer > 0) return false;
      if (this.player.invulnTimer <= 0) {
        this.damagePlayer(18, -this.player.facing as 1 | -1);
        this.floats.push({
          x: this.player.x,
          y: this.player.y - 68,
          vy: -32,
          text: '九幽毒瘴！(需缩地化雾穿过)',
          color: '#a855f7',
          size: 12,
          life: 1.1,
        });
      }
      return true;
    }
    return false;
  }

  private isStandingOnOneWayPlatform(): boolean {
    if (!this.room) return false;
    const r = Math.floor((this.player.y + 2) / TILE_SIZE);
    const c = Math.floor(this.player.x / TILE_SIZE);
    return this.room.tiles[r]?.[c] === 2;
  }

  private isSolidAtPixel(px: number, py: number): boolean {
    if (!this.room) return false;
    const c = Math.floor(px / TILE_SIZE);
    const r = Math.floor(py / TILE_SIZE);
    if (r < 0 || r >= this.room.rows || c < 0 || c >= this.room.cols) return true;
    const t = this.room.tiles[r][c];
    return t === 1 || t === 3 || t === 6;
  }

  private checkRoomTransition(): void {
    if (!this.room || !this.slot || this.slot.mode === 'boss_rush') return;
    const room = this.room;

    if (this.enemies.some((e) => e.profile.isBoss)) {
      this.player.x = Math.max(26, Math.min(room.pixelW - 26, this.player.x));
      this.player.y = Math.max(64, Math.min(room.pixelH - 4, this.player.y));
      return;
    }

    const p = this.player;
    if (p.x < 6) {
      const tr = WorldMap.resolveTransition(room, 'left', p.x, p.y - 20);
      if (tr) this.loadRoom(tr.nextRoom, tr.nextX, tr.nextY);
      else p.x = 18;
    } else if (p.x > room.pixelW - 6) {
      const tr = WorldMap.resolveTransition(room, 'right', p.x, p.y - 20);
      if (tr) this.loadRoom(tr.nextRoom, tr.nextX, tr.nextY);
      else p.x = room.pixelW - 18;
    } else if (p.y - p.h < 4) {
      const tr = WorldMap.resolveTransition(room, 'up', p.x, p.y);
      if (tr) {
        p.vy = -430;
        this.loadRoom(tr.nextRoom, tr.nextX, tr.nextY);
      } else {
        p.y = p.h + 6;
      }
    } else if (p.y > room.pixelH - 2) {
      const tr = WorldMap.resolveTransition(room, 'down', p.x, p.y);
      if (tr) this.loadRoom(tr.nextRoom, tr.nextX, tr.nextY);
      else p.y = room.focalY;
    }
  }

  private updateNearbyInteract(): void {
    this.nearbyInteract = null;
    if (!this.room || !this.slot) return;
    const cx = this.room.focalX;
    const gy = this.room.focalY;

    if (
      this.room.id === 'altar_save' &&
      this.slot.defeatedBosses.includes('normal:boss_pei_wuji') &&
      Math.abs(this.player.x - 5 * TILE_SIZE) < 72
    ) {
      this.nearbyInteract = {
        kind: 'invert_portal',
        label:
          this.room.realm === 'normal'
            ? '乾坤裂隙：踏入【九幽倒悬里城】 [E / 点击]'
            : '乾坤裂隙：返回【阳表九幽玄城】 [E / 点击]',
        x: 5 * TILE_SIZE,
        y: gy,
      };
      return;
    }

    if (Math.abs(this.player.x - cx) > 84 || Math.abs(this.player.y - gy) > 76) {
      return;
    }

    const sp = this.room.special;
    if (sp === 'save_shrine') {
      this.nearbyInteract = {
        kind: 'save',
        label: '镇魂土地祠 · 调息留档 [E / 点击]',
        x: cx,
        y: gy,
      };
    } else if (sp === 'warp_bagua') {
      this.nearbyInteract = {
        kind: 'warp',
        label: '太极八卦阵 · 缩地传送 [E / 点击]',
        x: cx,
        y: gy,
      };
    } else if (sp === 'npc_smith') {
      this.nearbyInteract = {
        kind: 'smith',
        label: '独臂神匠欧冶残 · 神兵百炼 [E / 点击]',
        x: cx,
        y: gy,
      };
    } else if (sp === 'npc_merchant') {
      this.nearbyInteract = {
        kind: 'merchant',
        label: '鬼市狐商白掌柜 · 奇珍交易 [E / 点击]',
        x: cx,
        y: gy,
      };
    } else if (sp === 'npc_su_qingyan') {
      this.nearbyInteract = {
        kind: 'su_qingyan',
        label: '司辰女官苏清晏 · 问询天机 [E / 点击]',
        x: cx,
        y: gy,
      };
    }
  }

  private executeInteract(kind: NonNullable<GameEngine['nearbyInteract']>['kind']): void {
    if (!this.slot || !this.room) return;
    if (kind === 'save') {
      this.recalcStats(true);
      SaveManager.saveSlot(this.slot);
      AudioFX.playRelicBell();
      NativeApp.haptic('medium');
      this.spawnBurst(this.player.x, this.player.y - 30, '#facc15', 22);
      this.cb.onShowBanner('镇魂灯燃 · 卷宗已留档', '气血与真气已完全充盈');
    } else if (kind === 'smith') {
      this.cb.onOpenInteractModal('smith');
    } else if (kind === 'merchant') {
      this.cb.onOpenInteractModal('merchant');
    } else if (kind === 'warp') {
      this.cb.onOpenInteractModal('warp');
    } else if (kind === 'su_qingyan') {
      this.cb.onStartStory(STORY_SCENES.meet_library_su);
    } else if (kind === 'invert_portal') {
      const targetRealm: CastleRealm = this.room.realm === 'normal' ? 'inverted' : 'normal';
      const target = WorldMap.getRoom(targetRealm, 'altar_save');
      this.loadRoom(target, 5 * TILE_SIZE, target.focalY, true);
    }
  }

  private spawnBurst(x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 50 + Math.random() * 190;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 40,
        size: 2.5 + Math.random() * 4,
        color,
        life: 0.35 + Math.random() * 0.35,
        maxLife: 0.65,
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
      pt.vy += 320 * dt;
    }
    for (let i = this.floats.length - 1; i >= 0; i--) {
      const fl = this.floats[i];
      fl.life -= dt;
      fl.y += fl.vy * dt;
      if (fl.life <= 0) this.floats.splice(i, 1);
    }
    for (let i = this.afterImages.length - 1; i >= 0; i--) {
      this.afterImages[i].alpha -= dt * 2.6;
      if (this.afterImages[i].alpha <= 0) this.afterImages.splice(i, 1);
    }
  }
}
