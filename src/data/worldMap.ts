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
export const MAP_GRID_TOTAL_W = 8;
export const MAP_GRID_TOTAL_H = 3;

export interface GroundNode {
  x: number;
  y: number;
  style: 'flagstone' | 'arch_bridge' | 'stairs' | 'marble' | 'crypt_stone';
}

export interface CeilingSpan {
  x1: number;
  x2: number;
  bottomY: number; // 天花板/城门券洞下沿Y坐标（既有厚重石木实体渲染，也有真实头顶碰撞！）
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
}

export interface PavilionPlatform {
  x: number;
  y: number; // 玩家站立的石木台面Y坐标
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

export interface BuiltRoom {
  id: string;
  name: string;
  subtitle: string;
  region: RegionId;
  realm: CastleRealm;
  mapX: number; // 在恶魔城 8x3 全局大地图上的网格X
  mapY: number; // 在恶魔城 8x3 全局大地图上的网格Y (0=高阁层, 1=主城层, 2=地底暗渠层)
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
  forge: '赤火铸剑坊',
  prison: '幽冥地下暗渠',
  opera: '百戏梨园鬼市',
  clock_tower: '晨钟飞虹阁',
  altar: '地脉镇魂坛',
};

/**
 * 采样任意世界X坐标处的真实地面高度；若处于向下贯通的地宫暗井竖井口内，地面自动敞开下通下层房间！
 */
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

/**
 * 采样任意X处的天花板下沿高度（露天区域返回 -9999；竖井口在解锁后自动敞开直通上层！）
 */
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

function createInterconnectedCastleRooms(): BuiltRoom[] {
  // =========================================================================
  // 【中层 Row 1 (mapY=1)：瓮城护城桥 ➔ 瓮城城门券洞 ➔ 枢机古祠院 ➔ 奉天盘龙殿 ➔ 洗墨妖宗殿】
  // 注意：每一处左右相邻门洞的地面标高 (leftDoorFloorY / rightDoorFloorY) 与门廊券顶 100% 严丝合缝！
  // =========================================================================

  // 1. [0,1 .. 1,1] 断魂苦竹渡 · 瓮城关门（露天石拱桥 -> 步入厚重青砖城门券洞隧道直通瓮城内院！）
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
    focalY: 404,
    storyTriggerId: 'intro_gate',
    rightRoomId: 'gate_2',
    rightDoorFloorY: 400,
    groundNodes: [
      { x: 0, y: 404, style: 'flagstone' },
      { x: 360, y: 404, style: 'arch_bridge' },
      { x: 640, y: 356, style: 'arch_bridge' },
      { x: 860, y: 356, style: 'arch_bridge' },
      { x: 1120, y: 400, style: 'flagstone' },
      { x: 1600, y: 400, style: 'flagstone' },
    ],
    // 右侧 x=1160..1600 为真实瓮城城楼厚重石砌门洞隧道（露天自然过渡进城门内！）
    ceilingSpans: [{ x1: 1180, x2: 1600, bottomY: 236, style: 'gate_tunnel' }],
    shafts: [],
    waterZones: [{ x1: 350, x2: 1130, surfaceY: 422 }],
    pavilions: [
      { x: 960, y: 282, w: 190, hasPillars: true, label: '城门望哨台' },
    ],
    archways: [{ x: 1175, title: '九幽西瓮门' }],
    torches: [
      { x: 330, y: 342 },
      { x: 750, y: 292 },
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

  // 2. [2,1 .. 3,1] 瓮城镇魂古祠 · 枢机院（左接城门东券洞 y=400，中设下通幽冥暗渠石井，右接奉天殿丹陛门廊 y=392！）
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
    // 左侧 x=0..220 延续西瓮城门洞东出口，右侧 x=1410..1600 步入奉天正殿前檐廊！
    ceilingSpans: [
      { x1: 0, x2: 220, bottomY: 236, style: 'gate_tunnel' },
      { x1: 1410, x2: 1600, bottomY: 155, style: 'palace_timber' },
    ],
    // 中央 x=740..868 为【幽冥地宫竖井口】，纵身跃下即直坠下层 [2,2..3,2] 九曲幽冥暗渠！
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
      // 独臂铸剑师身旁的青石镇剑座：可直接拔取重刃【赤炎斩马陌刀】（并可用它劈开地底水牢玄铁重闸！）
      { id: 'pk_modao_rack', kind: 'weapon', itemId: 'greatsword_1', x: 555, y: 400 },
    ],
  };

  // 3. [4,1 .. 5,1] 奉天前殿 · 盘龙长廊（全室内雕梁画栋宫殿长廊 + 顶部通往藏书飞阁的天井竖井！）
  const hallCorridor: BuiltRoom = {
    id: 'hall_corridor',
    name: '奉天前殿 · 盘龙廊',
    subtitle: '奉天正殿 · 室内穿斗宫廊',
    region: 'main_hall',
    realm: 'normal',
    mapX: 4,
    mapY: 1,
    gridW: 2,
    gridH: 1,
    pixelW: 1600,
    pixelH: 480,
    special: 'none',
    focalX: 800,
    focalY: 392,
    leftRoomId: 'gate_2',
    leftDoorFloorY: 392,
    rightRoomId: 'lib_boss',
    rightDoorFloorY: 392,
    groundNodes: [
      { x: 0, y: 392, style: 'marble' },
      { x: 1600, y: 392, style: 'marble' },
    ],
    // 全室内宫殿藻井顶棚，仅在中央 x=680..860 敞开通往二楼【万卷藏书飞阁】的贯通天井！
    ceilingSpans: [
      { x1: 0, x2: 680, bottomY: 84, style: 'palace_timber' },
      { x1: 860, x2: 1600, bottomY: 84, style: 'palace_timber' },
    ],
    shafts: [{ x1: 680, x2: 860, dir: 'up', targetRoomId: 'upper_library' }],
    waterZones: [],
    pavilions: [
      // 一层东/西藻井副阶（单跳可达）
      { x: 430, y: 292, w: 220, hasPillars: true },
      { x: 890, y: 292, w: 220, hasPillars: true },
      // 天井高悬接引飞阁（距下层高差 182px，唯有习得【踏云步·二段跳】方可跃上直入二楼藏书阁！）
      { x: 695, y: 110, w: 150, hasPillars: false, label: '藏书阁接引飞梯（需踏云步）' },
    ],
    archways: [],
    torches: [
      { x: 220, y: 312 },
      { x: 640, y: 312 },
      { x: 960, y: 312 },
      { x: 1380, y: 312 },
    ],
    foregrounds: [
      { x: 340, kind: 'dragon_pillar', parallax: 1.2 },
      { x: 1220, kind: 'dragon_pillar', parallax: 1.2 },
    ],
    lanterns: [],
    npcs: [],
    spawns: [
      { kind: 'paper_swordsman', x: 380 },
      { kind: 'lantern_ghost', x: 770 },
      { kind: 'bronze_guard', x: 1240 }, // 重盾甲士把守内殿大门：提示玩家用斩马陌刀破盾或绕背！
    ],
    pickups: [],
  };

  // 4. [6,1 .. 7,1] 奉天内殿 · 洗墨堂（守关妖王殿：击败墨千秋习得二段跳后，东侧天梯敞开直冲二楼晨钟飞虹桥！）
  const libBoss: BuiltRoom = {
    id: 'lib_boss',
    name: '奉天内殿 · 洗墨堂',
    subtitle: '奉天正殿 · 万卷妖宗死斗堂',
    region: 'main_hall',
    realm: 'normal',
    mapX: 6,
    mapY: 1,
    gridW: 2,
    gridH: 1,
    pixelW: 1600,
    pixelH: 480,
    special: 'boss_room',
    focalX: 800,
    focalY: 392,
    bossKind: 'boss_scroll_king',
    leftRoomId: 'hall_corridor',
    leftDoorFloorY: 392,
    groundNodes: [
      { x: 0, y: 392, style: 'marble' },
      { x: 1600, y: 392, style: 'marble' },
    ],
    ceilingSpans: [
      { x1: 0, x2: 1280, bottomY: 78, style: 'palace_timber' },
      { x1: 1440, x2: 1600, bottomY: 78, style: 'palace_timber' },
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
    waterZones: [],
    pavilions: [
      { x: 240, y: 282, w: 220, hasPillars: true },
      { x: 1040, y: 266, w: 210, hasPillars: true },
      // 击败妖王习得踏云步后，可当场连跳跃上东侧天梯直入上层【晨钟飞虹天桥】完成恶魔城式回环探索！
      { x: 1295, y: 112, w: 130, hasPillars: false, label: '晨钟阁天梯' },
    ],
    archways: [],
    torches: [
      { x: 380, y: 312 },
      { x: 800, y: 312 },
      { x: 1220, y: 312 },
    ],
    foregrounds: [{ x: 620, kind: 'dragon_pillar', parallax: 1.22 }],
    lanterns: [{ x: 800, y: 175 }],
    npcs: [],
    spawns: [],
    pickups: [],
  };

  // =========================================================================
  // 【上层 Row 0 (mapY=0)：万卷藏书飞阁 ⬍➔ 晨钟飞虹天桥（二段跳高空回环秘境层）】
  // =========================================================================

  // 5. [4,0 .. 5,0] 万卷藏书飞阁（下通奉天前殿天井，右接晨钟飞虹天桥，藏有名剑【墨渊秋水剑】！）
  const upperLibrary: BuiltRoom = {
    id: 'upper_library',
    name: '万卷藏书飞阁',
    subtitle: '高阁秘境 · 前朝镇妖典籍楼',
    region: 'library',
    realm: 'normal',
    mapX: 4,
    mapY: 0,
    gridW: 2,
    gridH: 1,
    pixelW: 1600,
    pixelH: 480,
    special: 'relic_pedestal',
    focalX: 420,
    focalY: 392,
    rightRoomId: 'clock_balcony',
    rightDoorFloorY: 392,
    groundNodes: [
      { x: 0, y: 392, style: 'marble' },
      { x: 1600, y: 392, style: 'marble' },
    ],
    ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 76, style: 'palace_timber' }],
    shafts: [{ x1: 680, x2: 860, dir: 'down', targetRoomId: 'hall_corridor' }],
    waterZones: [],
    pavilions: [
      { x: 180, y: 268, w: 280, hasPillars: true, label: '御书藏剑台' },
      { x: 678, y: 392, w: 184, hasPillars: false, label: '前殿天井（↓+跃 下落）' },
      { x: 1020, y: 278, w: 240, hasPillars: true },
    ],
    archways: [{ x: 1470, title: '飞虹天桥门' }],
    torches: [
      { x: 260, y: 312 },
      { x: 640, y: 312 },
      { x: 920, y: 312 },
      { x: 1340, y: 312 },
    ],
    foregrounds: [{ x: 520, kind: 'dragon_pillar', parallax: 1.18 }],
    lanterns: [],
    npcs: [],
    spawns: [
      { kind: 'lantern_ghost', x: 560 },
      { kind: 'bronze_guard', x: 1140 },
    ],
    pickups: [
      { id: 'pk_lib_sword2', kind: 'weapon', itemId: 'sword_2', x: 260, y: 268 },
      { id: 'pk_lib_chicken', kind: 'consumable', itemId: 'beggar_chicken', x: 380, y: 268 },
    ],
  };

  // 6. [6,0 .. 7,0] 晨钟飞虹天桥（宫城绝顶露天血月连廊：下接洗墨堂天梯，左通万卷藏书飞阁！）
  const clockBalcony: BuiltRoom = {
    id: 'clock_balcony',
    name: '晨钟飞虹天桥',
    subtitle: '晨钟飞虹阁 · 凌霄望月长桥',
    region: 'clock_tower',
    realm: 'normal',
    mapX: 6,
    mapY: 0,
    gridW: 2,
    gridH: 1,
    pixelW: 1600,
    pixelH: 480,
    special: 'none',
    focalX: 800,
    focalY: 392,
    leftRoomId: 'upper_library',
    leftDoorFloorY: 392,
    groundNodes: [
      { x: 0, y: 392, style: 'marble' },
      { x: 360, y: 392, style: 'arch_bridge' },
      { x: 960, y: 392, style: 'arch_bridge' },
      { x: 1600, y: 392, style: 'marble' },
    ],
    ceilingSpans: [{ x1: 0, x2: 180, bottomY: 96, style: 'palace_timber' }],
    shafts: [{ x1: 1280, x2: 1440, dir: 'down', targetRoomId: 'lib_boss' }],
    waterZones: [],
    pavilions: [
      { x: 540, y: 266, w: 260, hasPillars: true, label: '望月钟亭' },
      { x: 1278, y: 392, w: 164, hasPillars: false, label: '洗墨堂天梯（↓+跃 下落）' },
    ],
    archways: [{ x: 1120, title: '凌霄飞虹' }],
    torches: [
      { x: 320, y: 322 },
      { x: 980, y: 322 },
      { x: 1480, y: 322 },
    ],
    foregrounds: [],
    lanterns: [],
    npcs: [],
    spawns: [
      { kind: 'bronze_guard', x: 520 },
      { kind: 'lantern_ghost', x: 920 },
    ],
    pickups: [
      { id: 'pk_roof_hp_up', kind: 'max_up', itemId: 'hp_vessel', x: 670, y: 266 },
    ],
  };

  // =========================================================================
  // 【下层 Row 2 (mapY=2)：幽冥藏甲密室 ⬍➔ 九曲幽冥暗渠 ⬍➔ 地脉太极古泉（地下石拱水道层）】
  // =========================================================================

  // 7. [2,2 .. 3,2] 九曲幽冥暗渠（古祠正下方的地下石拱水道：无需二段跳即可踩阶梯木台攀回古祠，左右连通密室与灵泉！）
  const cryptCanal: BuiltRoom = {
    id: 'crypt_canal',
    name: '九曲幽冥暗渠',
    subtitle: '幽冥地下暗渠 · 瓮城地底水道',
    region: 'prison',
    realm: 'normal',
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
    // 精心设计的四级盘旋攀升栈桥（每级高差仅 84~88px，哪怕只有一段跳也能随时从地底轻松爬回古祠地面！）
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
      { kind: 'paper_swordsman', x: 1350 },
    ],
    pickups: [],
  };

  // 8. [1,2] 幽冥藏甲密室（西侧铁闸秘库：被千斤玄铁锁链闸门封锁，需用【赤炎斩马陌刀】重劈斩碎铁锁方可入内夺取宝甲！）
  const cryptVault: BuiltRoom = {
    id: 'crypt_vault',
    name: '幽冥藏甲密室',
    subtitle: '幽冥地下暗渠 · 玄铁封锁秘库',
    region: 'prison',
    realm: 'normal',
    mapX: 1,
    mapY: 2,
    gridW: 1,
    gridH: 1,
    pixelW: 800,
    pixelH: 480,
    special: 'relic_pedestal',
    focalX: 280,
    focalY: 396,
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
    },
    waterZones: [],
    pavilions: [{ x: 160, y: 294, w: 230, hasPillars: true, label: '镇军武库台' }],
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
      { id: 'pk_crypt_armor', kind: 'armor', itemId: 'iron_mail', x: 225, y: 294 },
      { id: 'pk_crypt_mp_pot', kind: 'consumable', itemId: 'huiqi_dan', x: 330, y: 294 },
    ],
  };

  // 9. [4,2] 地脉镇魂泉 · 八卦阵（东侧地底灵脉室：设太极八卦传送阵，可一键与地面瓮城古祠双向瞬移！）
  const cryptWarp: BuiltRoom = {
    id: 'crypt_warp',
    name: '地脉镇魂灵泉',
    subtitle: '地脉镇魂坛 · 太极八卦传送阵',
    region: 'altar',
    realm: 'normal',
    mapX: 4,
    mapY: 2,
    gridW: 1,
    gridH: 1,
    pixelW: 800,
    pixelH: 480,
    special: 'warp_bagua',
    warpName: '地脉镇魂灵泉',
    focalX: 420,
    focalY: 396,
    leftRoomId: 'crypt_canal',
    leftDoorFloorY: 396,
    groundNodes: [
      { x: 0, y: 396, style: 'crypt_stone' },
      { x: 800, y: 396, style: 'crypt_stone' },
    ],
    ceilingSpans: [{ x1: 0, x2: 800, bottomY: 88, style: 'crypt_vault' }],
    shafts: [],
    waterZones: [],
    pavilions: [],
    archways: [],
    torches: [
      { x: 240, y: 318 },
      { x: 580, y: 318 },
    ],
    foregrounds: [],
    lanterns: [],
    npcs: [],
    spawns: [],
    pickups: [
      { id: 'pk_crypt_mp_up', kind: 'max_up', itemId: 'mp_vessel', x: 640, y: 396 },
    ],
  };

  return [
    gate1,
    gate2,
    hallCorridor,
    libBoss,
    upperLibrary,
    clockBalcony,
    cryptCanal,
    cryptVault,
    cryptWarp,
  ];
}

class CastleWorldRegistry {
  private rooms = new Map<string, BuiltRoom>();
  private totalCells = 0;

  constructor() {
    for (const rm of createInterconnectedCastleRooms()) {
      this.rooms.set(rm.id, rm);
      this.totalCells += rm.gridW * rm.gridH;
    }
  }

  public getRoom(_realm: CastleRealm, id: string): BuiltRoom {
    return this.rooms.get(id) || this.rooms.get('gate_1')!;
  }

  public getAllRooms(_realm: CastleRealm): BuiltRoom[] {
    return Array.from(this.rooms.values());
  }

  public resolveTransition(
    cur: BuiltRoom,
    dir: 'left' | 'right'
  ): { nextRoom: BuiltRoom; nextX: number; nextFloorY: number; curFloorY: number } | null {
    const nextId = dir === 'left' ? cur.leftRoomId : cur.rightRoomId;
    if (!nextId) return null;
    const nextRoom = this.rooms.get(nextId);
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
    for (const sh of cur.shafts) {
      if (sh.dir !== dir) continue;
      if (sh.requireBossClear && !bossCleared) continue;
      if (px >= sh.x1 - 6 && px <= sh.x2 + 6) {
        const nextRoom = this.rooms.get(sh.targetRoomId);
        if (!nextRoom) return null;
        // 通过全局世界坐标自动映射在目标房间的精确 X 轴落点（上下层竖井100%对齐！）
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

  public calcExplorationPct(visitedRoomKeys: string[]): number {
    let exploredCells = 0;
    const cellSet = new Set<string>();
    for (const k of visitedRoomKeys) {
      if (k.startsWith('cell:')) {
        cellSet.add(k);
      } else {
        const id = k.includes(':') ? k.split(':')[1] : k;
        const rm = this.rooms.get(id);
        if (rm) {
          for (let gx = rm.mapX; gx < rm.mapX + rm.gridW; gx++) {
            for (let gy = rm.mapY; gy < rm.mapY + rm.gridH; gy++) {
              cellSet.add(`cell:${gx},${gy}`);
            }
          }
        }
      }
    }
    exploredCells = cellSet.size;
    return Math.min(100, Math.round((exploredCells / Math.max(1, this.totalCells)) * 1000) / 10);
  }

  public createBossRushRoom(): BuiltRoom {
    return this.getRoom('normal', 'lib_boss');
  }
}

export const WorldMap = new CastleWorldRegistry();
