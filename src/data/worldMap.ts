import {
  CastleRealm,
  EnemyKind,
  LanternAnchor,
  RegionId,
  RoomPickupSpawn,
  RoomSpecial,
} from '../types';

export const TILE_SIZE = 40;
export const CELL_PIXEL_W = 800;
export const CELL_PIXEL_H = 480;
export const MAP_GRID_TOTAL_W = 10;
export const MAP_GRID_TOTAL_H = 3;

export interface GroundNode {
  x: number;
  y: number;
  style: 'flagstone' | 'arch_bridge' | 'stairs' | 'marble' | 'crypt_stone';
}

export interface CeilingSpan {
  x1: number;
  x2: number;
  bottomY: number;
  style: 'gate_tunnel' | 'palace_timber' | 'crypt_vault';
}

export interface VerticalShaft {
  x1: number;
  x2: number;
  dir: 'up' | 'down';
  targetRoomId: string;
  requireBossClear?: boolean;
}

export interface BreakableIronGate {
  id: string;
  x: number;
  topY: number;
  bottomY: number;
  /** 'heavy_weapon' = 重刃劈碎(或化雾穿过); 'mist_only' = 剧毒紫瘴铁栅(唯缩地化雾可穿!) */
  gateKind?: 'heavy_weapon' | 'mist_only';
}

export interface BreakableSecretWall {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  dropKind: 'consumable' | 'max_up' | 'gold';
  dropItemId: string;
}

export interface ClimbableWall {
  x: number;
  topY: number;
  bottomY: number;
}

export interface PavilionPlatform {
  x: number;
  y: number;
  w: number;
  hasPillars: boolean;
  label?: string;
}

export interface WaterZone {
  x1: number;
  x2: number;
  surfaceY: number;
}

export interface ArchwayProp {
  x: number;
  title?: string;
}

export interface ForegroundProp {
  x: number;
  kind: 'bamboo' | 'dragon_pillar' | 'hanging_lantern';
  parallax: number;
}

export interface SceneSpawn {
  kind: EnemyKind;
  x: number;
  y?: number;
}

export interface ScenePickup {
  id: string;
  kind: RoomPickupSpawn['kind'];
  itemId: string;
  x: number;
  y?: number;
}

export interface SceneNpc {
  id: 'su_qingyan' | 'ouye_can' | 'bai_zhanggui';
  name: string;
  title: string;
  x: number;
  defaultFacing: 1 | -1;
}

export interface CastleDecorProp {
  kind: 'bookshelf' | 'chandelier' | 'lattice_window';
  x: number;
  y: number;
  scale?: number;
}

export interface ClockworkGear {
  x: number;
  y: number;
  radius: number;
  speed: number; // rad/s (+ 顺时针, - 逆时针)
  hasOrbitPlatforms?: boolean;
}

export interface BuiltRoom {
  id: string;
  name: string;
  subtitle: string;
  region: RegionId;
  realm: CastleRealm;
  indoor?: boolean;
  mapX: number;
  mapY: number;
  gridW: number;
  gridH: number;
  pixelW: number;
  pixelH: number;
  special: RoomSpecial;
  focalX: number;
  focalY: number;
  bossKind?: EnemyKind;
  storyTriggerId?: string;
  warpName?: string;
  leftRoomId?: string;
  rightRoomId?: string;
  leftDoorFloorY?: number;
  rightDoorFloorY?: number;
  groundNodes: GroundNode[];
  ceilingSpans: CeilingSpan[];
  shafts: VerticalShaft[];
  ironGate?: BreakableIronGate;
  secretWalls?: BreakableSecretWall[];
  climbWalls?: ClimbableWall[];
  decorProps?: CastleDecorProp[];
  clockGears?: ClockworkGear[];
  pavilions: PavilionPlatform[];
  waterZones: WaterZone[];
  archways: ArchwayProp[];
  torches: { x: number; y: number }[];
  foregrounds: ForegroundProp[];
  lanterns: LanternAnchor[];
  npcs: SceneNpc[];
  spawns: SceneSpawn[];
  pickups: ScenePickup[];
}

export const REGION_NAMES: Record<RegionId, string> = {
  gatehouse: '苦竹瓮城',
  main_hall: '奉天正殿',
  library: '万卷藏书阁',
  forge: '赤火古窖',
  prison: '幽冥地下水牢',
  opera: '百戏梨园鬼市',
  clock_tower: '晨钟飞虹阁',
  altar: '凌霄祭天坛',
};

export function isInsideDownShaft(room: BuiltRoom, px: number): boolean {
  for (const sh of room.shafts) {
    if (sh.dir === 'down' && px > sh.x1 + 8 && px < sh.x2 - 8) {
      return true;
    }
  }
  return false;
}

export function sampleSolidGroundY(room: BuiltRoom, px: number): number {
  const nodes = room.groundNodes;
  if (nodes.length === 0) return 400;
  if (px <= nodes[0].x) return nodes[0].y;
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    if (px >= a.x && px <= b.x) {
      const t = (px - a.x) / Math.max(1, b.x - a.x);
      if (a.style === 'arch_bridge') {
        const linear = a.y + (b.y - a.y) * t;
        return linear - Math.sin(t * Math.PI) * 14;
      }
      return a.y + (b.y - a.y) * t;
    }
  }
  return nodes[nodes.length - 1].y;
}

export function sampleGroundY(room: BuiltRoom, px: number): number {
  if (isInsideDownShaft(room, px)) {
    return room.pixelH + 140;
  }
  return sampleSolidGroundY(room, px);
}

export function sampleCeilingY(room: BuiltRoom, px: number, bossCleared = true): number {
  for (const sh of room.shafts) {
    if (sh.dir === 'up' && px > sh.x1 + 6 && px < sh.x2 - 6) {
      if (!sh.requireBossClear || bossCleared) {
        return -9999;
      }
    }
  }
  let lowest = -9999;
  for (const cs of room.ceilingSpans) {
    if (px >= cs.x1 && px <= cs.x2) {
      lowest = Math.max(lowest, cs.bottomY);
    }
  }
  return lowest;
}

function createNormalCastleRooms(): BuiltRoom[] {
  // =========================================================================
  // 【中层 Row 1 (mapY=1)：断魂苦竹渡 ➔ 瓮城镇魂古祠 ➔ 奉天盘龙廊 ➔ 洗墨堂 ➔ 东宫镇魂偏殿】
  // =========================================================================

  // 1. [0,1 .. 1,1] 断魂苦竹渡
  const gate1: BuiltRoom = {
    id: 'gate_1',
    name: '断魂苦竹渡',
    subtitle: '苦竹瓮城 · 护城古桥与西城门洞',
    region: 'gatehouse',
    realm: 'normal',
    mapX: 0,
    mapY: 1,
    gridW: 2,
    gridH: 1,
    pixelW: 1600,
    pixelH: 480,
    special: 'none',
    focalX: 260,
    focalY: 402,
    storyTriggerId: 'intro_gate',
    rightRoomId: 'gate_2',
    rightDoorFloorY: 400,
    groundNodes: [
      { x: 0, y: 402, style: 'flagstone' },
      { x: 355, y: 402, style: 'arch_bridge' },
      { x: 650, y: 326, style: 'arch_bridge' },
      { x: 830, y: 326, style: 'arch_bridge' },
      { x: 1125, y: 400, style: 'flagstone' },
      { x: 1600, y: 400, style: 'flagstone' },
    ],
    ceilingSpans: [{ x1: 1180, x2: 1600, bottomY: 236, style: 'gate_tunnel' }],
    shafts: [],
    waterZones: [{ x1: 350, x2: 1130, surfaceY: 362 }],
    pavilions: [{ x: 960, y: 282, w: 190, hasPillars: true, label: '城门望哨台' }],
    archways: [{ x: 1175, title: '九幽西瓮门' }],
    torches: [
      { x: 240, y: 342 },
      { x: 520, y: 315 },
      { x: 750, y: 274 },
      { x: 1290, y: 325 },
      { x: 1510, y: 325 },
    ],
    foregrounds: [
      { x: 120, kind: 'bamboo', parallax: 1.22 },
      { x: 1080, kind: 'bamboo', parallax: 1.2 },
    ],
    lanterns: [],
    npcs: [
      {
        id: 'su_qingyan',
        name: '苏清晏',
        title: '钦天监司辰女官',
        x: 310,
        defaultFacing: -1,
      },
    ],
    spawns: [
      { kind: 'paper_swordsman', x: 740 },
      { kind: 'lantern_ghost', x: 1040 },
      { kind: 'paper_swordsman', x: 1380 },
    ],
    pickups: [
      { id: 'pk_bridge_potion', kind: 'consumable', itemId: 'jinchuang_yao', x: 1055, y: 282 },
    ],
  };

  // 2. [2,1 .. 3,1] 瓮城镇魂古祠
  const gate2: BuiltRoom = {
    id: 'gate_2',
    name: '瓮城镇魂古祠',
    subtitle: '苦竹瓮城 · 四通枢机庭院',
    region: 'gatehouse',
    realm: 'normal',
    mapX: 2,
    mapY: 1,
    gridW: 2,
    gridH: 1,
    pixelW: 1600,
    pixelH: 480,
    special: 'save_shrine',
    focalX: 1080,
    focalY: 392,
    warpName: '瓮城镇魂古祠',
    leftRoomId: 'gate_1',
    leftDoorFloorY: 400,
    rightRoomId: 'hall_corridor',
    rightDoorFloorY: 392,
    groundNodes: [
      { x: 0, y: 400, style: 'flagstone' },
      { x: 680, y: 400, style: 'flagstone' },
      { x: 920, y: 400, style: 'stairs' },
      { x: 1010, y: 392, style: 'marble' },
      { x: 1600, y: 392, style: 'marble' },
    ],
    ceilingSpans: [
      { x1: 0, x2: 220, bottomY: 236, style: 'gate_tunnel' },
      { x1: 1410, x2: 1600, bottomY: 155, style: 'palace_timber' },
    ],
    shafts: [{ x1: 740, x2: 868, dir: 'down', targetRoomId: 'crypt_canal' }],
    waterZones: [],
    pavilions: [
      { x: 310, y: 288, w: 220, hasPillars: true },
      { x: 738, y: 400, w: 132, hasPillars: false, label: '幽冥暗井（↓+跃 下潜）' },
    ],
    archways: [{ x: 1405, title: '奉天前殿门' }],
    torches: [
      { x: 140, y: 325 },
      { x: 680, y: 332 },
      { x: 925, y: 332 },
      { x: 1210, y: 325 },
      { x: 1510, y: 315 },
    ],
    foregrounds: [{ x: 260, kind: 'bamboo', parallax: 1.2 }],
    lanterns: [],
    npcs: [
      {
        id: 'ouye_can',
        name: '欧冶残',
        title: '赤火坊独臂铸剑师',
        x: 430,
        defaultFacing: -1,
      },
      {
        id: 'su_qingyan',
        name: '苏清晏',
        title: '钦天监司辰女官',
        x: 1205,
        defaultFacing: -1,
      },
      {
        id: 'bai_zhanggui',
        name: '白掌柜',
        title: '子夜鬼市狐商',
        x: 1345,
        defaultFacing: -1,
      },
    ],
    spawns: [],
    pickups: [
      { id: 'pk_modao_rack', kind: 'weapon', itemId: 'greatsword_1', x: 555, y: 400 },
    ],
  };

  // 3. [4,1 .. 5,1] 奉天前殿 · 盘龙廊（挑高 560px 宏伟室内礼拜堂级正殿：破窗斜射月光柱 + 青铜百烛吊灯 + 雕栏二层回廊 + 青冥剑灵使魔！）
  const hallCorridor: BuiltRoom = {
    id: 'hall_corridor',
    name: '奉天前殿 · 盘龙廊',
    subtitle: '奉天正殿 · 破窗月华与百烛长廊',
    region: 'main_hall',
    realm: 'normal',
    indoor: true,
    mapX: 4,
    mapY: 1,
    gridW: 2,
    gridH: 1,
    pixelW: 1600,
    pixelH: 560,
    special: 'none',
    focalX: 800,
    focalY: 472,
    leftRoomId: 'gate_2',
    leftDoorFloorY: 472,
    rightRoomId: 'lib_boss',
    rightDoorFloorY: 472,
    groundNodes: [
      { x: 0, y: 472, style: 'marble' },
      { x: 520, y: 472, style: 'stairs' },
      { x: 660, y: 448, style: 'marble' },
      { x: 940, y: 448, style: 'marble' },
      { x: 1080, y: 472, style: 'stairs' },
      { x: 1600, y: 472, style: 'marble' },
    ],
    ceilingSpans: [
      { x1: 0, x2: 680, bottomY: 64, style: 'palace_timber' },
      { x1: 860, x2: 1600, bottomY: 64, style: 'palace_timber' },
    ],
    shafts: [{ x1: 680, x2: 860, dir: 'up', targetRoomId: 'upper_library' }],
    decorProps: [
      { kind: 'lattice_window', x: 260, y: 370, scale: 1.05 },
      { kind: 'lattice_window', x: 560, y: 350, scale: 1.05 },
      { kind: 'lattice_window', x: 1040, y: 350, scale: 1.05 },
      { kind: 'lattice_window', x: 1340, y: 370, scale: 1.05 },
      { kind: 'chandelier', x: 410, y: 62, scale: 0.95 },
      { kind: 'chandelier', x: 1190, y: 62, scale: 0.95 },
    ],
    waterZones: [],
    pavilions: [
      { x: 220, y: 352, w: 250, hasPillars: false, label: '西侧御剑廊（藏有剑灵使魔）' },
      { x: 480, y: 244, w: 190, hasPillars: false },
      { x: 910, y: 352, w: 250, hasPillars: false },
      { x: 695, y: 118, w: 150, hasPillars: false, label: '藏书阁接引飞梯（需踏云步）' },
    ],
    archways: [],
    torches: [
      { x: 180, y: 392 },
      { x: 640, y: 372 },
      { x: 960, y: 372 },
      { x: 1420, y: 392 },
    ],
    foregrounds: [
      { x: 340, kind: 'dragon_pillar', parallax: 1.2 },
      { x: 1220, kind: 'dragon_pillar', parallax: 1.2 },
    ],
    lanterns: [],
    npcs: [],
    spawns: [
      { kind: 'paper_swordsman', x: 380 },
      { kind: 'scroll_demon', x: 770 },
      { kind: 'bronze_guard', x: 1260 },
    ],
    pickups: [
      // 致敬《月下夜想曲》使魔系统：前殿西侧二层木廊直接唤醒【本命使魔·青冥剑灵】随身助战！
      { id: 'pk_hall_familiar', kind: 'ability', itemId: 'familiar_sword', x: 315, y: 352 },
      { id: 'pk_hall_spear1', kind: 'weapon', itemId: 'spear_1', x: 1035, y: 352 },
    ],
  };

  // 4. [6,1 .. 7,1] 奉天内殿 · 洗墨堂（Boss 墨千秋 -> 踏云步 double_jump）
  const libBoss: BuiltRoom = {
    id: 'lib_boss',
    name: '奉天内殿 · 洗墨堂',
    subtitle: '奉天正殿 · 万卷妖宗死斗堂',
    region: 'main_hall',
    realm: 'normal',
    indoor: true,
    mapX: 6,
    mapY: 1,
    gridW: 2,
    gridH: 1,
    pixelW: 1600,
    pixelH: 540,
    special: 'boss_room',
    focalX: 800,
    focalY: 452,
    bossKind: 'boss_scroll_king',
    leftRoomId: 'hall_corridor',
    leftDoorFloorY: 452,
    rightRoomId: 'east_sanctum',
    rightDoorFloorY: 452,
    groundNodes: [
      { x: 0, y: 452, style: 'marble' },
      { x: 1600, y: 452, style: 'marble' },
    ],
    ceilingSpans: [
      { x1: 0, x2: 1280, bottomY: 64, style: 'palace_timber' },
      { x1: 1440, x2: 1600, bottomY: 64, style: 'palace_timber' },
    ],
    shafts: [
      {
        x1: 1280,
        x2: 1440,
        dir: 'up',
        targetRoomId: 'clock_balcony',
        requireBossClear: true,
      },
    ],
    decorProps: [
      { kind: 'lattice_window', x: 460, y: 360, scale: 1.05 },
      { kind: 'lattice_window', x: 960, y: 360, scale: 1.05 },
      { kind: 'chandelier', x: 710, y: 62, scale: 1.0 },
    ],
    waterZones: [],
    pavilions: [
      { x: 220, y: 336, w: 230, hasPillars: false },
      { x: 1050, y: 292, w: 220, hasPillars: false },
      { x: 1295, y: 126, w: 130, hasPillars: false, label: '晨钟机关楼天梯' },
    ],
    archways: [],
    torches: [
      { x: 380, y: 372 },
      { x: 800, y: 372 },
      { x: 1220, y: 372 },
    ],
    foregrounds: [{ x: 620, kind: 'dragon_pillar', parallax: 1.22 }],
    lanterns: [],
    npcs: [],
    spawns: [],
    pickups: [],
  };

  // 5. [8,1 .. 9,1] 东宫镇魂偏殿
  const eastSanctum: BuiltRoom = {
    id: 'east_sanctum',
    name: '东宫镇魂偏殿',
    subtitle: '奉天东翼 · 登坛镇魂祠与乾坤井',
    region: 'main_hall',
    realm: 'normal',
    indoor: true,
    mapX: 8,
    mapY: 1,
    gridW: 2,
    gridH: 1,
    pixelW: 1600,
    pixelH: 520,
    special: 'save_shrine',
    warpName: '东宫镇魂偏殿',
    focalX: 780,
    focalY: 432,
    leftRoomId: 'lib_boss',
    leftDoorFloorY: 432,
    groundNodes: [
      { x: 0, y: 432, style: 'marble' },
      { x: 1600, y: 432, style: 'marble' },
    ],
    ceilingSpans: [
      { x1: 0, x2: 220, bottomY: 68, style: 'palace_timber' },
      { x1: 368, x2: 1600, bottomY: 68, style: 'palace_timber' },
    ],
    shafts: [
      { x1: 220, x2: 368, dir: 'up', targetRoomId: 'sky_altar' },
      { x1: 1180, x2: 1320, dir: 'down', targetRoomId: 'prison_treasure' },
    ],
    decorProps: [
      { kind: 'lattice_window', x: 600, y: 345, scale: 1.0 },
      { kind: 'chandelier', x: 980, y: 66, scale: 0.92 },
    ],
    secretWalls: [
      {
        id: 'sw_east_chicken',
        x: 1500,
        y: 314,
        w: 58,
        h: 118,
        dropKind: 'consumable',
        dropItemId: 'beggar_chicken',
      },
    ],
    waterZones: [],
    pavilions: [
      { x: 160, y: 294, w: 220, hasPillars: false },
      { x: 228, y: 122, w: 132, hasPillars: false, label: '凌霄祭天坛（需踏云步）' },
      { x: 1178, y: 432, w: 144, hasPillars: false, label: '赤火古窖井（↓+跃 下潜）' },
    ],
    archways: [],
    torches: [
      { x: 480, y: 352 },
      { x: 780, y: 352 },
      { x: 1080, y: 352 },
      { x: 1410, y: 352 },
    ],
    foregrounds: [],
    lanterns: [],
    npcs: [],
    spawns: [],
    pickups: [],
  };

  // =========================================================================
  // 【上层 Row 0 (mapY=0)：禁书天机阁 ⬍➔ 万卷藏书飞阁 ⬍➔ 百丈晨钟机关楼(740px纵深齿轮塔!) ⬍➔ 凌霄祭天坛(皇家登坛长阶!)】
  // =========================================================================

  // 6. [2,0 .. 3,0] 禁书天机阁
  const secretArchive: BuiltRoom = {
    id: 'secret_archive',
    name: '禁书天机阁',
    subtitle: '藏书绝顶 · 万卷书架与破妄秘室',
    region: 'library',
    realm: 'normal',
    indoor: true,
    mapX: 2,
    mapY: 0,
    gridW: 2,
    gridH: 1,
    pixelW: 1600,
    pixelH: 580,
    special: 'relic_pedestal',
    focalX: 300,
    focalY: 192,
    rightRoomId: 'upper_library',
    rightDoorFloorY: 492,
    groundNodes: [
      { x: 0, y: 492, style: 'marble' },
      { x: 1600, y: 492, style: 'marble' },
    ],
    ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 60, style: 'palace_timber' }],
    shafts: [],
    climbWalls: [
      { x: 530, topY: 186, bottomY: 430 },
      { x: 720, topY: 186, bottomY: 492 },
    ],
    decorProps: [
      { kind: 'bookshelf', x: 160, y: 492, scale: 1.0 },
      { kind: 'bookshelf', x: 340, y: 492, scale: 1.0 },
      { kind: 'bookshelf', x: 920, y: 492, scale: 1.05 },
      { kind: 'bookshelf', x: 1120, y: 492, scale: 1.05 },
      { kind: 'bookshelf', x: 1320, y: 492, scale: 1.05 },
      { kind: 'chandelier', x: 1080, y: 58, scale: 0.95 },
    ],
    waterZones: [],
    pavilions: [
      { x: 150, y: 192, w: 380, hasPillars: false, label: '天机破妄坛（需壁虎游墙功攀登）' },
      { x: 940, y: 368, w: 280, hasPillars: false },
    ],
    archways: [],
    torches: [
      { x: 260, y: 412 },
      { x: 840, y: 412 },
      { x: 1420, y: 412 },
    ],
    foregrounds: [],
    lanterns: [],
    npcs: [],
    spawns: [
      { kind: 'scroll_demon', x: 880 },
      { kind: 'bell_gargoyle', x: 1180 },
      { kind: 'opera_puppet', x: 1380 },
    ],
    pickups: [
      { id: 'pk_mirror_truth', kind: 'ability', itemId: 'mirror_truth', x: 270, y: 192 },
      { id: 'pk_scroll_soulsteal', kind: 'skill_scroll', itemId: 'jiuyou_soulsteal', x: 420, y: 192 },
      { id: 'pk_whip_1', kind: 'weapon', itemId: 'whip_1', x: 1080, y: 368 },
    ],
  };

  // 7. [4,0 .. 5,0] 万卷藏书飞阁（双层巨型书库：致敬月下夜想曲藏书馆！）
  const upperLibrary: BuiltRoom = {
    id: 'upper_library',
    name: '万卷藏书飞阁',
    subtitle: '高阁秘境 · 双层典籍长廊',
    region: 'library',
    realm: 'normal',
    indoor: true,
    mapX: 4,
    mapY: 0,
    gridW: 2,
    gridH: 1,
    pixelW: 1600,
    pixelH: 600,
    special: 'relic_pedestal',
    storyTriggerId: 'meet_library_su',
    focalX: 420,
    focalY: 508,
    leftRoomId: 'secret_archive',
    leftDoorFloorY: 508,
    rightRoomId: 'clock_balcony',
    rightDoorFloorY: 508,
    groundNodes: [
      { x: 0, y: 508, style: 'marble' },
      { x: 1600, y: 508, style: 'marble' },
    ],
    ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 64, style: 'palace_timber' }],
    shafts: [{ x1: 680, x2: 860, dir: 'down', targetRoomId: 'hall_corridor' }],
    decorProps: [
      { kind: 'bookshelf', x: 180, y: 508, scale: 1.05 },
      { kind: 'bookshelf', x: 370, y: 508, scale: 1.05 },
      { kind: 'bookshelf', x: 1040, y: 508, scale: 1.05 },
      { kind: 'bookshelf', x: 1240, y: 508, scale: 1.05 },
      { kind: 'bookshelf', x: 260, y: 366, scale: 0.88 },
      { kind: 'bookshelf', x: 1120, y: 366, scale: 0.88 },
      { kind: 'chandelier', x: 770, y: 62, scale: 1.0 },
    ],
    secretWalls: [
      {
        id: 'sw_lib_wallmeat',
        x: 585,
        y: 396,
        w: 54,
        h: 112,
        dropKind: 'consumable',
        dropItemId: 'beggar_chicken',
      },
    ],
    waterZones: [],
    pavilions: [
      { x: 160, y: 366, w: 310, hasPillars: false, label: '御书二层藏剑廊' },
      { x: 520, y: 242, w: 220, hasPillars: false },
      { x: 678, y: 508, w: 184, hasPillars: false, label: '前殿天井（↓+跃 下落）' },
      { x: 980, y: 366, w: 300, hasPillars: false },
    ],
    archways: [],
    torches: [
      { x: 260, y: 428 },
      { x: 640, y: 428 },
      { x: 920, y: 428 },
      { x: 1380, y: 428 },
    ],
    foregrounds: [],
    lanterns: [],
    npcs: [
      {
        id: 'su_qingyan',
        name: '苏清晏',
        title: '钦天监司辰女官',
        x: 495,
        defaultFacing: 1,
      },
    ],
    spawns: [
      { kind: 'scroll_demon', x: 620 },
      { kind: 'scroll_demon', x: 960 },
      { kind: 'opera_puppet', x: 1260 },
    ],
    pickups: [
      { id: 'pk_lib_sword2', kind: 'weapon', itemId: 'sword_2', x: 245, y: 366 },
      { id: 'pk_lib_bell', kind: 'armor', itemId: 'qingxin_bell', x: 1140, y: 366 },
    ],
  };

  // 8. [6,0 .. 7,0] 百丈晨钟机关楼（740px 超高纵向齿轮钟塔！旋转青铜巨齿轮 + 飞天金翅夜叉 + 雷音金翅大鹏王！）
  const clockBalcony: BuiltRoom = {
    id: 'clock_balcony',
    name: '百丈晨钟机关楼',
    subtitle: '晨钟暮鼓楼 · 旋转青铜齿轮与大鹏王座',
    region: 'clock_tower',
    realm: 'normal',
    indoor: true,
    mapX: 6,
    mapY: 0,
    gridW: 2,
    gridH: 1,
    pixelW: 1600,
    pixelH: 740,
    special: 'boss_room',
    bossKind: 'boss_thunder_yaksha',
    focalX: 1080,
    focalY: 280,
    leftRoomId: 'upper_library',
    leftDoorFloorY: 648,
    rightRoomId: 'sky_altar',
    rightDoorFloorY: 280,
    groundNodes: [
      { x: 0, y: 648, style: 'marble' },
      { x: 920, y: 648, style: 'marble' },
      { x: 1180, y: 648, style: 'marble' },
      { x: 1600, y: 648, style: 'marble' },
    ],
    ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 56, style: 'palace_timber' }],
    shafts: [{ x1: 1280, x2: 1440, dir: 'down', targetRoomId: 'lib_boss' }],
    // 五座持续咬合旋转的巨型青铜八卦机关齿轮（其中两座附带旋转升降踏台，还原恶魔城钟塔攀爬精髓！）
    clockGears: [
      { x: 380, y: 515, radius: 112, speed: 0.55, hasOrbitPlatforms: true },
      { x: 565, y: 390, radius: 96, speed: -0.68 },
      { x: 760, y: 355, radius: 118, speed: 0.52, hasOrbitPlatforms: true },
      { x: 1120, y: 470, radius: 105, speed: -0.48 },
      { x: 1360, y: 220, radius: 88, speed: 0.72 },
    ],
    decorProps: [
      { kind: 'lattice_window', x: 240, y: 540, scale: 1.05 },
      { kind: 'lattice_window', x: 960, y: 210, scale: 1.05 },
    ],
    waterZones: [],
    pavilions: [
      { x: 160, y: 530, w: 200, hasPillars: false },
      { x: 450, y: 418, w: 210, hasPillars: false, label: '钟楼中层枢机台' },
      { x: 920, y: 280, w: 680, hasPillars: false, label: '晨钟顶层飞虹台（通往凌霄祭天坛 ▸）' },
      { x: 1278, y: 648, w: 164, hasPillars: false, label: '洗墨堂天梯（↓+跃 下落）' },
    ],
    archways: [],
    torches: [
      { x: 260, y: 572 },
      { x: 720, y: 572 },
      { x: 1040, y: 208 },
      { x: 1460, y: 208 },
    ],
    foregrounds: [],
    lanterns: [],
    npcs: [],
    spawns: [
      { kind: 'bell_gargoyle', x: 460 },
      { kind: 'bell_gargoyle', x: 820 },
    ],
    pickups: [{ id: 'pk_roof_hp_up', kind: 'max_up', itemId: 'hp_vessel', x: 555, y: 418 }],
  };

  // 9. [8,0 .. 9,0] 凌霄祭天坛（致敬《月下夜想曲》伯爵王座前的血月通天大理石长阶梯！）
  const skyAltar: BuiltRoom = {
    id: 'sky_altar',
    name: '凌霄祭天坛',
    subtitle: '表城绝巅 · 血月登坛长阶与镇脉阵眼',
    region: 'altar',
    realm: 'normal',
    mapX: 8,
    mapY: 0,
    gridW: 2,
    gridH: 1,
    pixelW: 1600,
    pixelH: 580,
    special: 'boss_room',
    bossKind: 'boss_pei_wuji',
    focalX: 1080,
    focalY: 318,
    leftRoomId: 'clock_balcony',
    leftDoorFloorY: 492,
    groundNodes: [
      { x: 0, y: 492, style: 'marble' },
      { x: 390, y: 492, style: 'stairs' },
      { x: 820, y: 318, style: 'marble' },
      { x: 1600, y: 318, style: 'marble' },
    ],
    ceilingSpans: [],
    shafts: [{ x1: 220, x2: 368, dir: 'down', targetRoomId: 'east_sanctum' }],
    waterZones: [],
    pavilions: [
      { x: 218, y: 492, w: 152, hasPillars: false, label: '东宫偏殿天阶（↓+跃 下落）' },
      { x: 1220, y: 206, w: 220, hasPillars: true, label: '镇脉望星台' },
    ],
    archways: [{ x: 830, title: '凌霄祭天门' }],
    torches: [
      { x: 440, y: 416 },
      { x: 640, y: 336 },
      { x: 940, y: 248 },
      { x: 1320, y: 248 },
    ],
    foregrounds: [],
    lanterns: [],
    npcs: [],
    spawns: [],
    pickups: [],
  };

  // =========================================================================
  // 【下层 Row 2 (mapY=2)：玄鸟西密室 ⬍➔ 幽冥藏甲室 ⬍➔ 九曲暗渠 ⬍➔ 地脉灵泉 ⬍➔ 寒潭水牢(萧断水) ⬍➔ 赤火古窖】
  // =========================================================================

  // 10. [0,2] 玄鸟秘冢 · 西密室（需击败萧断水习得【缩地化雾】穿过紫瘴铁栅方可进入，夺取真相法器二【完整玄鸟合璧佩】！）
  const prisonJadeVault: BuiltRoom = {
    id: 'prison_jade_vault',
    name: '玄鸟秘冢 · 西密室',
    subtitle: '水牢极西 · 镇族玉佩封藏室',
    region: 'prison',
    realm: 'normal',
    indoor: true,
    mapX: 0,
    mapY: 2,
    gridW: 1,
    gridH: 1,
    pixelW: 800,
    pixelH: 480,
    special: 'relic_pedestal',
    focalX: 250,
    focalY: 396,
    rightRoomId: 'crypt_vault',
    rightDoorFloorY: 396,
    groundNodes: [
      { x: 0, y: 396, style: 'crypt_stone' },
      { x: 800, y: 396, style: 'crypt_stone' },
    ],
    ceilingSpans: [{ x1: 0, x2: 800, bottomY: 86, style: 'crypt_vault' }],
    shafts: [],
    ironGate: {
      id: 'gate_mist_jade',
      x: 590,
      topY: 86,
      bottomY: 396,
      gateKind: 'mist_only',
    },
    waterZones: [],
    pavilions: [{ x: 150, y: 292, w: 250, hasPillars: true, label: '玄鸟合璧祭坛' }],
    archways: [],
    torches: [
      { x: 260, y: 316 },
      { x: 680, y: 316 },
    ],
    foregrounds: [],
    lanterns: [],
    npcs: [],
    spawns: [{ kind: 'opera_puppet', x: 430 }],
    pickups: [
      // 真相法器之二：【完整玄鸟合璧佩】！
      { id: 'pk_jade_full', kind: 'ability', itemId: 'jade_pendant_full', x: 235, y: 292 },
      { id: 'pk_daggers_2', kind: 'weapon', itemId: 'daggers_2', x: 355, y: 292 },
    ],
  };

  // 11. [1,2] 幽冥藏甲密室（修复原 iron_mail 错名 -> 正品【唐制明光山文铠】+【分水峨眉双刺】！）
  const cryptVault: BuiltRoom = {
    id: 'crypt_vault',
    name: '幽冥藏甲密室',
    subtitle: '幽冥地下水牢 · 玄铁封锁秘库',
    region: 'prison',
    realm: 'normal',
    indoor: true,
    mapX: 1,
    mapY: 2,
    gridW: 1,
    gridH: 1,
    pixelW: 800,
    pixelH: 480,
    special: 'relic_pedestal',
    focalX: 280,
    focalY: 396,
    leftRoomId: 'prison_jade_vault',
    leftDoorFloorY: 396,
    rightRoomId: 'crypt_canal',
    rightDoorFloorY: 396,
    groundNodes: [
      { x: 0, y: 396, style: 'crypt_stone' },
      { x: 800, y: 396, style: 'crypt_stone' },
    ],
    ceilingSpans: [{ x1: 0, x2: 800, bottomY: 86, style: 'crypt_vault' }],
    shafts: [],
    ironGate: {
      id: 'gate_crypt_armor',
      x: 540,
      topY: 86,
      bottomY: 396,
      gateKind: 'heavy_weapon',
    },
    waterZones: [],
    pavilions: [{ x: 160, y: 294, w: 240, hasPillars: true, label: '镇军武库台' }],
    archways: [],
    torches: [
      { x: 275, y: 316 },
      { x: 640, y: 316 },
    ],
    foregrounds: [],
    lanterns: [],
    npcs: [],
    spawns: [{ kind: 'bronze_guard', x: 410 }],
    pickups: [
      { id: 'pk_crypt_armor', kind: 'armor', itemId: 'mingguang_armor', x: 220, y: 294 },
      { id: 'pk_crypt_daggers1', kind: 'weapon', itemId: 'daggers_1', x: 340, y: 294 },
    ],
  };

  // 12. [2,2 .. 3,2] 九曲幽冥暗渠
  const cryptCanal: BuiltRoom = {
    id: 'crypt_canal',
    name: '九曲幽冥暗渠',
    subtitle: '幽冥地下水牢 · 瓮城地底水道',
    region: 'prison',
    realm: 'normal',
    indoor: true,
    mapX: 2,
    mapY: 2,
    gridW: 2,
    gridH: 1,
    pixelW: 1600,
    pixelH: 480,
    special: 'none',
    focalX: 800,
    focalY: 396,
    leftRoomId: 'crypt_vault',
    leftDoorFloorY: 396,
    rightRoomId: 'crypt_warp',
    rightDoorFloorY: 396,
    groundNodes: [
      { x: 0, y: 396, style: 'crypt_stone' },
      { x: 380, y: 396, style: 'crypt_stone' },
      { x: 460, y: 416, style: 'crypt_stone' },
      { x: 1140, y: 416, style: 'crypt_stone' },
      { x: 1220, y: 396, style: 'crypt_stone' },
      { x: 1600, y: 396, style: 'crypt_stone' },
    ],
    ceilingSpans: [
      { x1: 0, x2: 740, bottomY: 82, style: 'crypt_vault' },
      { x1: 868, x2: 1600, bottomY: 82, style: 'crypt_vault' },
    ],
    shafts: [{ x1: 740, x2: 868, dir: 'up', targetRoomId: 'gate_2' }],
    waterZones: [{ x1: 420, x2: 1180, surfaceY: 410 }],
    pavilions: [
      { x: 520, y: 326, w: 190, hasPillars: true },
      { x: 890, y: 242, w: 190, hasPillars: true },
      { x: 640, y: 156, w: 170, hasPillars: true },
      { x: 752, y: 74, w: 108, hasPillars: false, label: '返回瓮城古祠' },
    ],
    archways: [],
    torches: [
      { x: 240, y: 320 },
      { x: 720, y: 320 },
      { x: 1340, y: 320 },
    ],
    foregrounds: [],
    lanterns: [],
    npcs: [],
    spawns: [
      { kind: 'paper_swordsman', x: 320 },
      { kind: 'lantern_ghost', x: 1020 },
      { kind: 'plague_toad', x: 1350 },
    ],
    pickups: [],
  };

  // 13. [4,2 .. 5,2] 地脉镇魂灵泉（八卦传送阵 + 镇岳金印副器 + 天山雪莲）
  const cryptWarp: BuiltRoom = {
    id: 'crypt_warp',
    name: '地脉镇魂灵泉',
    subtitle: '地脉镇魂坛 · 太极八卦传送阵',
    region: 'altar',
    realm: 'normal',
    indoor: true,
    mapX: 4,
    mapY: 2,
    gridW: 2,
    gridH: 1,
    pixelW: 1600,
    pixelH: 480,
    special: 'warp_bagua',
    warpName: '地脉镇魂灵泉',
    focalX: 520,
    focalY: 396,
    leftRoomId: 'crypt_canal',
    leftDoorFloorY: 396,
    rightRoomId: 'xiao_arena',
    rightDoorFloorY: 396,
    groundNodes: [
      { x: 0, y: 396, style: 'crypt_stone' },
      { x: 1600, y: 396, style: 'crypt_stone' },
    ],
    ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 88, style: 'crypt_vault' }],
    shafts: [],
    waterZones: [],
    pavilions: [{ x: 980, y: 292, w: 240, hasPillars: true, label: '灵泉法器台' }],
    archways: [],
    torches: [
      { x: 260, y: 318 },
      { x: 780, y: 318 },
      { x: 1340, y: 318 },
    ],
    foregrounds: [],
    lanterns: [],
    npcs: [],
    spawns: [{ kind: 'lantern_ghost', x: 1220 }],
    pickups: [
      { id: 'pk_crypt_mp_up', kind: 'max_up', itemId: 'mp_vessel', x: 1045, y: 292 },
      { id: 'pk_sub_seal', kind: 'weapon', itemId: 'sub:mountain_seal', x: 1165, y: 292 },
    ],
  };

  // 14. [6,2 .. 7,2] 九曲寒潭 · 问剑水牢（宿敌 Boss：大师兄·萧断水 -> 缩地化雾符 mist_dash！）
  const xiaoArena: BuiltRoom = {
    id: 'xiao_arena',
    name: '九曲寒潭 · 问剑水牢',
    subtitle: '幽冥水牢深处 · 少统领萧断水试剑处',
    region: 'prison',
    realm: 'normal',
    indoor: true,
    mapX: 6,
    mapY: 2,
    gridW: 2,
    gridH: 1,
    pixelW: 1600,
    pixelH: 480,
    special: 'boss_room',
    bossKind: 'boss_xiao_duanshui',
    storyTriggerId: 'boss_xiao_pre',
    focalX: 800,
    focalY: 396,
    leftRoomId: 'crypt_warp',
    leftDoorFloorY: 396,
    rightRoomId: 'prison_treasure',
    rightDoorFloorY: 396,
    groundNodes: [
      { x: 0, y: 396, style: 'crypt_stone' },
      { x: 1600, y: 396, style: 'crypt_stone' },
    ],
    ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 84, style: 'crypt_vault' }],
    shafts: [],
    waterZones: [],
    pavilions: [
      { x: 240, y: 286, w: 200, hasPillars: true },
      { x: 1140, y: 286, w: 200, hasPillars: true },
    ],
    archways: [],
    torches: [
      { x: 360, y: 318 },
      { x: 800, y: 318 },
      { x: 1240, y: 318 },
    ],
    foregrounds: [],
    lanterns: [],
    npcs: [],
    spawns: [],
    pickups: [],
  };

  // 15. [8,2 .. 9,2] 赤火古窖 · 镇岳库（水牢最东连通东宫镇魂偏殿，形成全城闭环！）
  const prisonTreasure: BuiltRoom = {
    id: 'prison_treasure',
    name: '赤火古窖 · 镇岳库',
    subtitle: '地底铸兵秘窟 · 护体灵剑与兵符藏处',
    region: 'forge',
    realm: 'normal',
    indoor: true,
    mapX: 8,
    mapY: 2,
    gridW: 2,
    gridH: 1,
    pixelW: 1600,
    pixelH: 480,
    special: 'relic_pedestal',
    focalX: 780,
    focalY: 396,
    leftRoomId: 'xiao_arena',
    leftDoorFloorY: 396,
    groundNodes: [
      { x: 0, y: 396, style: 'crypt_stone' },
      { x: 1600, y: 396, style: 'crypt_stone' },
    ],
    ceilingSpans: [
      { x1: 0, x2: 1180, bottomY: 84, style: 'crypt_vault' },
      { x1: 1320, x2: 1600, bottomY: 84, style: 'crypt_vault' },
    ],
    shafts: [{ x1: 1180, x2: 1320, dir: 'up', targetRoomId: 'east_sanctum' }],
    ironGate: {
      id: 'gate_mist_forge',
      x: 340,
      topY: 84,
      bottomY: 396,
      gateKind: 'mist_only',
    },
    waterZones: [],
    pavilions: [
      { x: 560, y: 292, w: 260, hasPillars: true, label: '赤火镇岳台' },
      { x: 960, y: 214, w: 190, hasPillars: true },
      { x: 1192, y: 116, w: 118, hasPillars: false, label: '攀回东宫偏殿' },
    ],
    archways: [],
    torches: [
      { x: 220, y: 318 },
      { x: 690, y: 318 },
      { x: 1380, y: 318 },
    ],
    foregrounds: [],
    lanterns: [],
    npcs: [],
    spawns: [
      { kind: 'opera_puppet', x: 520 },
      { kind: 'bronze_guard', x: 940 },
    ],
    pickups: [
      { id: 'pk_forge_tally', kind: 'armor', itemId: 'tiger_tally', x: 620, y: 292 },
      { id: 'pk_sub_orbit', kind: 'weapon', itemId: 'sub:sword_orbit', x: 755, y: 292 },
    ],
  };

  return [
    gate1,
    gate2,
    hallCorridor,
    libBoss,
    eastSanctum,
    secretArchive,
    upperLibrary,
    clockBalcony,
    skyAltar,
    prisonJadeVault,
    cryptVault,
    cryptCanal,
    cryptWarp,
    xiaoArena,
    prisonTreasure,
  ];
}

/**
 * 自动构建《恶魔城：月下夜想曲》灵魂机制 —— 180° 乾坤翻转【九幽倒悬里城】！
 * 地图网格中心对称翻转 (`invMapX = 10 - mapX - gridW`, `invMapY = 2 - mapY`)，
 * 镇藏三阶传世神兵与终极防具，而表城起点【断魂苦竹渡】在里城化作最终决战殿【倒悬魔渊·烛阴冥坛】！
 */
function createInvertedCastleRooms(normalRooms: BuiltRoom[]): BuiltRoom[] {
  const invertedUpgradePickups: Record<string, ScenePickup[]> = {
    gate_2: [{ id: 'inv_pk_robe', kind: 'armor', itemId: 'xuanniao_robe', x: 520, y: 392 }],
    upper_library: [{ id: 'inv_pk_sword3', kind: 'weapon', itemId: 'sword_3', x: 1280, y: 366 }],
    secret_archive: [{ id: 'inv_pk_whip3', kind: 'weapon', itemId: 'whip_3', x: 510, y: 368 }],
    crypt_vault: [
      { id: 'inv_pk_gs3', kind: 'weapon', itemId: 'greatsword_3', x: 540, y: 294 },
    ],
    prison_jade_vault: [
      { id: 'inv_pk_dag3', kind: 'weapon', itemId: 'daggers_3', x: 520, y: 292 },
    ],
    prison_treasure: [
      { id: 'inv_pk_spear3', kind: 'weapon', itemId: 'spear_3', x: 920, y: 292 },
    ],
    crypt_warp: [
      { id: 'inv_pk_gourd', kind: 'armor', itemId: 'fortune_gourd', x: 520, y: 292 },
    ],
    clock_balcony: [
      { id: 'inv_pk_hp2', kind: 'max_up', itemId: 'hp_vessel', x: 1020, y: 418 },
    ],
    hall_corridor: [
      { id: 'inv_pk_wine', kind: 'consumable', itemId: 'osmanthus_wine', x: 560, y: 352 },
    ],
  };

  return normalRooms.map((rm) => {
    const W = rm.pixelW;
    const invMapX = MAP_GRID_TOTAL_W - rm.mapX - rm.gridW;
    const invMapY = MAP_GRID_TOTAL_H - 1 - rm.mapY;

    const flippedNodes: GroundNode[] = [...rm.groundNodes]
      .reverse()
      .map((n, idx, arr) => ({
        x: W - n.x,
        y: n.y,
        style: idx < arr.length - 1 ? arr[idx + 1].style : n.style,
      }));

    const flippedCeilings: CeilingSpan[] = rm.ceilingSpans.map((cs) => ({
      x1: W - cs.x2,
      x2: W - cs.x1,
      bottomY: cs.bottomY,
      style: cs.style,
    }));

    const flippedShafts: VerticalShaft[] = rm.shafts.map((sh) => ({
      x1: W - sh.x2,
      x2: W - sh.x1,
      dir: sh.dir === 'up' ? 'down' : 'up',
      targetRoomId: sh.targetRoomId,
      requireBossClear: false,
    }));

    const baseFloorY = flippedNodes[0]?.y || 396;
    const flippedPavilions: PavilionPlatform[] = rm.pavilions
      .filter((pv) => Math.abs(pv.y - baseFloorY) > 16 && pv.y > 140)
      .map((pv) => ({
        x: W - pv.x - pv.w,
        y: pv.y,
        w: pv.w,
        hasPillars: pv.hasPillars,
        label: pv.label,
      }));

    for (const sh of flippedShafts) {
      const sw = sh.x2 - sh.x1;
      const shFloor = sampleSolidGroundY({ ...rm, groundNodes: flippedNodes }, (sh.x1 + sh.x2) * 0.5);
      if (sh.dir === 'down') {
        flippedPavilions.push({
          x: sh.x1 - 4,
          y: shFloor,
          w: sw + 8,
          hasPillars: false,
          label: '里城暗井（↓+跃 下潜）',
        });
      } else {
        flippedPavilions.push({
          x: sh.x1 + 8,
          y: 122,
          w: sw - 16,
          hasPillars: false,
          label: '里城飞梯',
        });
        flippedPavilions.push({
          x: Math.max(80, sh.x1 - 140),
          y: Math.min(shFloor - 120, 276),
          w: 170,
          hasPillars: false,
        });
      }
    }

    const isTrueFinalRoom = rm.id === 'gate_1';
    const isEntryAltar = rm.id === 'sky_altar';

    const eliteSpawns: SceneSpawn[] = isTrueFinalRoom
      ? []
      : isEntryAltar
        ? []
        : [
            { kind: 'bell_gargoyle', x: Math.round(W * 0.34) },
            { kind: 'opera_puppet', x: Math.round(W * 0.66) },
          ];

    return {
      id: rm.id,
      name: isTrueFinalRoom ? '倒悬魔渊 · 烛阴冥坛' : `里 · ${rm.name}`,
      subtitle: isTrueFinalRoom
        ? '九幽倒悬里城 · 太古尸仙最终决战殿'
        : `九幽倒悬里城 · 阴阳逆乱之境`,
      region: rm.region,
      realm: 'inverted',
      indoor: rm.indoor,
      mapX: invMapX,
      mapY: invMapY,
      gridW: rm.gridW,
      gridH: rm.gridH,
      pixelW: W,
      pixelH: rm.pixelH,
      special: isTrueFinalRoom
        ? 'boss_room'
        : rm.special === 'boss_room' && !isEntryAltar
          ? 'none'
          : rm.special,
      bossKind: isTrueFinalRoom ? 'boss_zhuyin' : undefined,
      storyTriggerId: undefined,
      warpName: rm.warpName ? `里 · ${rm.warpName}` : undefined,
      focalX: W - rm.focalX,
      focalY: rm.focalY,
      leftRoomId: rm.rightRoomId,
      rightRoomId: rm.leftRoomId,
      leftDoorFloorY: rm.rightDoorFloorY,
      rightDoorFloorY: rm.leftDoorFloorY,
      groundNodes: flippedNodes,
      ceilingSpans: isTrueFinalRoom ? [] : flippedCeilings,
      shafts: flippedShafts,
      decorProps: rm.decorProps?.map((dp) => ({ ...dp, x: W - dp.x })),
      clockGears: rm.clockGears?.map((cg) => ({ ...cg, x: W - cg.x, speed: -cg.speed })),
      waterZones: rm.waterZones.map((wz) => ({
        x1: W - wz.x2,
        x2: W - wz.x1,
        surfaceY: wz.surfaceY,
      })),
      pavilions: flippedPavilions,
      archways: rm.archways.map((ar) => ({ x: W - ar.x, title: ar.title })),
      torches: rm.torches.map((tc) => ({ x: W - tc.x, y: tc.y })),
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: eliteSpawns,
      pickups: invertedUpgradePickups[rm.id] || [],
    };
  });
}

function createBossRushArena(): BuiltRoom {
  return {
    id: 'boss_rush_arena',
    name: '百鬼试炼 · 镇妖塔',
    subtitle: '巅峰连战 · 七大妖王宿敌车轮死斗',
    region: 'altar',
    realm: 'normal',
    mapX: 4,
    mapY: 1,
    gridW: 2,
    gridH: 1,
    pixelW: 1400,
    pixelH: 480,
    special: 'boss_room',
    focalX: 700,
    focalY: 392,
    groundNodes: [
      { x: 0, y: 392, style: 'marble' },
      { x: 1400, y: 392, style: 'marble' },
    ],
    ceilingSpans: [],
    shafts: [],
    waterZones: [],
    pavilions: [
      { x: 200, y: 274, w: 210, hasPillars: true },
      { x: 990, y: 274, w: 210, hasPillars: true },
    ],
    archways: [{ x: 700, title: '百鬼镇妖塔' }],
    torches: [
      { x: 320, y: 316 },
      { x: 700, y: 316 },
      { x: 1080, y: 316 },
    ],
    foregrounds: [],
    lanterns: [],
    npcs: [],
    spawns: [],
    pickups: [],
  };
}

class CastleWorldRegistry {
  private normalRooms = new Map<string, BuiltRoom>();
  private invertedRooms = new Map<string, BuiltRoom>();
  private bossRushRoom: BuiltRoom;
  private normalCellCount = 0;

  constructor() {
    const normals = createNormalCastleRooms();
    for (const rm of normals) {
      this.normalRooms.set(rm.id, rm);
      this.normalCellCount += rm.gridW * rm.gridH;
    }
    for (const irm of createInvertedCastleRooms(normals)) {
      this.invertedRooms.set(irm.id, irm);
    }
    this.bossRushRoom = createBossRushArena();
  }

  public getRoom(realm: CastleRealm, id: string): BuiltRoom {
    if (id === 'boss_rush_arena') return this.bossRushRoom;
    const map = realm === 'inverted' ? this.invertedRooms : this.normalRooms;
    return map.get(id) || this.normalRooms.get('gate_1')!;
  }

  public getAllRooms(realm: CastleRealm): BuiltRoom[] {
    return Array.from(
      (realm === 'inverted' ? this.invertedRooms : this.normalRooms).values()
    );
  }

  public resolveTransition(
    cur: BuiltRoom,
    dir: 'left' | 'right'
  ): { nextRoom: BuiltRoom; nextX: number; nextFloorY: number; curFloorY: number } | null {
    const nextId = dir === 'left' ? cur.leftRoomId : cur.rightRoomId;
    if (!nextId) return null;
    const map = cur.realm === 'inverted' ? this.invertedRooms : this.normalRooms;
    const nextRoom = map.get(nextId);
    if (!nextRoom) return null;
    const curFloorY =
      (dir === 'left' ? cur.leftDoorFloorY : cur.rightDoorFloorY) ??
      sampleSolidGroundY(cur, dir === 'left' ? 20 : cur.pixelW - 20);
    const nextX = dir === 'left' ? nextRoom.pixelW - 42 : 42;
    const nextFloorY =
      (dir === 'left' ? nextRoom.rightDoorFloorY : nextRoom.leftDoorFloorY) ??
      sampleSolidGroundY(nextRoom, nextX);
    return { nextRoom, nextX, nextFloorY, curFloorY };
  }

  public resolveVerticalShaft(
    cur: BuiltRoom,
    px: number,
    dir: 'up' | 'down',
    bossCleared: boolean
  ): { nextRoom: BuiltRoom; nextX: number; nextY: number } | null {
    const map = cur.realm === 'inverted' ? this.invertedRooms : this.normalRooms;
    for (const sh of cur.shafts) {
      if (sh.dir !== dir) continue;
      if (sh.requireBossClear && !bossCleared) continue;
      if (px >= sh.x1 - 6 && px <= sh.x2 + 6) {
        const nextRoom = map.get(sh.targetRoomId);
        if (!nextRoom) return null;
        const worldX = cur.mapX * CELL_PIXEL_W + px;
        const localNextX = Math.max(
          48,
          Math.min(nextRoom.pixelW - 48, worldX - nextRoom.mapX * CELL_PIXEL_W)
        );
        const nextY = dir === 'down' ? 28 : nextRoom.pixelH - 26;
        return { nextRoom, nextX: localNextX, nextY };
      }
    }
    return null;
  }

  /**
   * 致敬《恶魔城：月下夜想曲》经典 200.0% 双城探索度算法！
   * 阳表玄城全探满为 100%，踏破九幽倒悬里城最高可达 200%！
   */
  public calcExplorationPct(visitedRoomKeys: string[]): number {
    const normalSet = new Set<string>();
    const invSet = new Set<string>();

    for (const k of visitedRoomKeys) {
      if (k.startsWith('cell:inverted:')) {
        invSet.add(k.slice('cell:inverted:'.length));
      } else if (k.startsWith('cell:normal:')) {
        normalSet.add(k.slice('cell:normal:'.length));
      } else if (k.startsWith('cell:')) {
        normalSet.add(k.slice('cell:'.length));
      } else if (k.startsWith('inverted:')) {
        const rm = this.invertedRooms.get(k.slice('inverted:'.length));
        if (rm) {
          for (let dx = 0; dx < rm.gridW; dx++) invSet.add(`${rm.mapX + dx},${rm.mapY}`);
        }
      } else {
        const id = k.includes(':') ? k.split(':')[1] : k;
        const rm = this.normalRooms.get(id);
        if (rm) {
          for (let dx = 0; dx < rm.gridW; dx++) normalSet.add(`${rm.mapX + dx},${rm.mapY}`);
        }
      }
    }

    const totalBase = Math.max(1, this.normalCellCount);
    const pct = Math.round(((normalSet.size + invSet.size) / totalBase) * 100);
    return Math.min(200, pct);
  }
}

export const WorldMap = new CastleWorldRegistry();
