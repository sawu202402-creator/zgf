import { AssetKey } from '../game/AssetLoader';
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
export const CELL_PIXEL_H = 440;
export const MAP_GRID_TOTAL_W = 20;
export const MAP_GRID_TOTAL_H = 7;

export interface GroundNode {
  x: number;
  y: number;
  style: 'flagstone' | 'arch_bridge' | 'stairs' | 'marble' | 'crypt_stone' | 'palace_wood';
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

export interface SideDoor {
  side: 'left' | 'right';
  floorY: number;
  targetRoomId: string;
  targetFloorY?: number;
  rowOffset?: number;
  /** 若存在则代表此门被可击碎古砖暗壁封死，挥兵击碎后永久洞开进入独立隐藏密室！ */
  secretWallId?: string;
}

export interface BreakableIronGate {
  id: string;
  x: number;
  topY: number;
  bottomY: number;
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

/**
 * 《恶魔城：月下夜想曲》式石砌建筑台面与断崖高台：
 * - 默认 (`blocking` 为 `false`)：单向石砌悬台/竖井踏石/书廊夹层，可从下方与两侧丝滑起跳穿过，绝不卡头堵路，站上后亦可按 `↓+跃` 快速下跳；
 * - 仅端头能力锁高崖设为 `blocking: true`（如奉天盘龙长廊东端 168px 二段跳须弥断崖），形成真实垂直石壁阻挡。
 */
export interface SolidBlock {
  x: number;
  y: number;
  w: number;
  h: number;
  blocking?: boolean;
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
  liquidKind?: 'water' | 'lava';
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

export interface SceneStele {
  id: string;
  x: number;
}

export type CastleDecorKind =
  | 'bookshelf'
  | 'chandelier'
  | 'dragon_brazier'
  | 'silk_banner'
  | 'weapon_rack'
  | 'guardian_statue'
  | 'coiled_pillar'
  | 'incense_burner'
  | 'giant_bell';

export interface CastleDecorProp {
  kind: CastleDecorKind;
  x: number;
  y: number;
  scale?: number;
}

export interface ClockworkGear {
  x: number;
  y: number;
  radius: number;
  speed: number;
  hasOrbitPlatforms?: boolean;
}

export interface MovingPlatformDef {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  w: number;
  speed: number;
  phase?: number;
  style?: 'wood_ferry' | 'bronze_lift' | 'scholar_ladder';
}

export interface RoomHazardDef {
  kind: 'spikes' | 'pendulum' | 'fire_vent';
  x: number;
  y: number;
  /** 地刺宽度 / 摆斧臂长 / 地肺喷火高度 */
  span: number;
  speed?: number;
  phase?: number;
}

export interface CrumbleSlabDef {
  id: string;
  x: number;
  y: number;
  w: number;
}

export interface BuiltRoom {
  id: string;
  name: string;
  subtitle: string;
  region: RegionId;
  realm: CastleRealm;
  bgKey?: AssetKey;
  indoor?: boolean;
  isSecretRoom?: boolean;
  ambushSeal?: boolean;
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
  leftDoorSecretId?: string;
  rightDoorSecretId?: string;
  sideDoors?: SideDoor[];
  groundNodes: GroundNode[];
  solidBlocks?: SolidBlock[];
  ceilingSpans: CeilingSpan[];
  shafts: VerticalShaft[];
  ironGate?: BreakableIronGate;
  secretWalls?: BreakableSecretWall[];
  climbWalls?: ClimbableWall[];
  decorProps?: CastleDecorProp[];
  clockGears?: ClockworkGear[];
  movingPlatforms?: MovingPlatformDef[];
  hazards?: RoomHazardDef[];
  crumbleSlabs?: CrumbleSlabDef[];
  pavilions: PavilionPlatform[];
  waterZones: WaterZone[];
  archways: ArchwayProp[];
  torches: { x: number; y: number }[];
  foregrounds: ForegroundProp[];
  lanterns: LanternAnchor[];
  npcs: SceneNpc[];
  steles?: SceneStele[];
  spawns: SceneSpawn[];
  pickups: ScenePickup[];
}

export const REGION_NAMES: Record<RegionId, string> = {
  gatehouse: '第一幕 · 苦竹瓮城',
  main_hall: '第二幕 · 奉天盘龙殿',
  alchemy: '第三幕 · 钦天炼丹司',
  forge: '第四幕 · 赤火铸剑坊',
  prison: '第五幕 · 九曲寒潭',
  catacomb: '第六幕 · 九幽荒冢',
  library: '第七幕 · 万卷藏书阁',
  opera: '第八幕 · 百戏梨园',
  clock_tower: '第九幕 · 东垣望月塔',
  altar: '终幕 · 凌霄祭天坛',
};

export const INVERTED_REGION_NAMES: Record<RegionId, string> = {
  gatehouse: '终局逆城 · 倒悬苦竹渡',
  main_hall: '逆城 · 倒悬盘龙殿',
  alchemy: '逆城 · 倒悬炼丹司',
  forge: '逆城 · 倒悬铸剑坊',
  prison: '逆城 · 倒悬寒潭狱',
  catacomb: '逆城 · 倒悬守陵冢',
  library: '逆城 · 倒悬藏书阁',
  opera: '逆城 · 倒悬百戏台',
  clock_tower: '逆城 · 倒悬望月塔',
  altar: '逆城起点 · 倒悬祭天坛',
};

export function getRoomSideDoors(room: BuiltRoom, side?: 'left' | 'right'): SideDoor[] {
  const list: SideDoor[] = [];
  if (room.sideDoors && room.sideDoors.length > 0) {
    for (const d of room.sideDoors) {
      if (!side || d.side === side) list.push(d);
    }
  }
  if (room.leftRoomId && (!side || side === 'left')) {
    if (!list.some((d) => d.side === 'left' && d.targetRoomId === room.leftRoomId)) {
      list.push({
        side: 'left',
        floorY: room.leftDoorFloorY ?? sampleSolidGroundY(room, 18),
        targetRoomId: room.leftRoomId,
        rowOffset: 0,
        secretWallId: room.leftDoorSecretId,
      });
    }
  }
  if (room.rightRoomId && (!side || side === 'right')) {
    if (!list.some((d) => d.side === 'right' && d.targetRoomId === room.rightRoomId)) {
      list.push({
        side: 'right',
        floorY: room.rightDoorFloorY ?? sampleSolidGroundY(room, room.pixelW - 18),
        targetRoomId: room.rightRoomId,
        rowOffset: 0,
        secretWallId: room.rightDoorSecretId,
      });
    }
  }
  return list;
}

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

export function isGroundRestingSolidBlock(room: BuiltRoom, sb: SolidBlock): boolean {
  if (sb.blocking) return true;
  const groundAtMid = sampleSolidGroundY(room, sb.x + sb.w * 0.5);
  return sb.y + sb.h >= groundAtMid - 10;
}

/**
 * 采样实体（怪物/掉落物）在 `(px, curY)` 处脚下最近的支撑面（支持实心石阶自动踏上、悬空石台 SolidBlock、单向阁台 Pavilion 与主地面！）
 */
export function sampleEntitySurfaceY(room: BuiltRoom, px: number, curY: number): number {
  let bestY = sampleGroundY(room, px);
  if (room.solidBlocks) {
    for (const sb of room.solidBlocks) {
      const groundResting = isGroundRestingSolidBlock(room, sb);
      const stepTol = groundResting && bestY - sb.y <= 54 ? 56 : 22;
      if (px >= sb.x + 4 && px <= sb.x + sb.w - 4 && sb.y >= curY - stepTol && sb.y < bestY) {
        bestY = sb.y;
      }
    }
  }
  for (const pv of room.pavilions) {
    if (px >= pv.x + 8 && px <= pv.x + pv.w - 8 && pv.y >= curY - 22 && pv.y < bestY) {
      bestY = pv.y;
    }
  }
  return bestY;
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

/**
 * 对标《恶魔城：月下夜想曲》经典关卡设计规范的核心城堡蓝图（11×6 紧凑高密度回环迷宫，22座功能分明的手工关卡！）：
 * ---------------------------------------------------------------------------------------------------------
 * 1. 严格跳跃物理标定（单跳极限 117px，二段跳极限 227px）：
 *    - 普通单跳石阶层高严格锁定 80~92px（手感干脆利落，绝不顶头卡脚）；
 *    - 【踏云二段跳】能力锁高台严格锁定 164~176px（前期清晰可见却跳不上，击败萧断水习得二段跳后豁然贯通！）。
 * 2. 纯粹月下房间职能划分（彻底告别大杂烩堆砌！）：
 *    - 独立 1×1 镇魂存档室（4座）、独立 1×1 八卦传送室（2座）、独立 1×1 铸剑坊（欧冶残）、独立 1×1 藏书万宝斋（白掌柜）、独立 1×1 古武秘宝室！
 * 3. 真实实心石砌高低台 (`SolidBlock`) 与纵向之字形攀爬竖塔 (`1×4 东垣望月竖塔`)：
 *    Row 0:                                                             [8,0 观星存档祠] ━ [9..10,0 凌霄祭天坛(Boss 裴无极)]
 *    Row 1:        [2,1 丹鼎秘宝室(二段跳)] ━ [3..4,1 钦天试剑堂(Boss 萧断水)] ━ [5,1 丹阁存档祠]   [8,1..4 东垣望月竖塔] ━(化雾栅)━ [9,1 天机秘阁(破妄镜)]
 *                                                   ┃                                                 ┃
 *    Row 2:        [1,2 镇军西武库(斩马刀)] ━ [2..3,2 钦天炼丹阶梯廊]              [5,2 万宝斋(商铺)] ━ [6..7,2 万卷藏书阁] ━┫
 *                                                   ┃                                                               ┃
 *    Row 3: [0..1,3 断魂护城古桥] ━ [2..3,3 瓮城分道门厅] ━ [4,3 瓮城存档祠] ━ [5..7,3 奉天盘龙长廊(中央枢纽)] ━━━(高台二段跳)━━━┫ ━ [9,3 东垣传送室]
 *                                    ┃(重刃破闸)                                 ┃                                  ┃
 *    Row 4:                      [2,4 赤火铸剑坊(铁匠)]                      [5,4 中枢传送室]              [7,4 水牢存档祠] ━┛
 *                                    ┃                                                                      ┃
 *    Row 5:                      [2..4,5 九曲寒潭水牢(水上石墩)] ━━━━━━━━━━ [5..6,5 寒潭镇水殿(Boss 墨千秋)] ━ [7,5 玄鸟秘宝室(化雾+玄鸟佩)]
 */
function createNormalCastleRooms(): BuiltRoom[] {
  const coreRooms: BuiltRoom[] = [
    // ==================== 一、城门入口区（致敬月下：森林吊桥 -> 双层门厅 -> 独立存档室） ====================
    {
      id: 'gate_1',
      name: '断魂苦竹渡',
      subtitle: '护城古桥',
      region: 'gatehouse',
      bgKey: 'bg_gatehouse',
      realm: 'normal',
      mapX: 0,
      mapY: 3,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      storyTriggerId: 'intro_gate',
      focalX: 240,
      focalY: 404,
      leftRoomId: 'entrance_bamboo_woods',
      leftDoorFloorY: 404,
      rightRoomId: 'entrance_barbican_hall',
      rightDoorFloorY: 404,
      groundNodes: [
        { x: 0, y: 404, style: 'flagstone' },
        { x: 355, y: 404, style: 'arch_bridge' },
        { x: 650, y: 326, style: 'arch_bridge' },
        { x: 830, y: 326, style: 'arch_bridge' },
        { x: 1125, y: 404, style: 'flagstone' },
        { x: 1600, y: 404, style: 'flagstone' },
      ],
      ceilingSpans: [],
      shafts: [],
      waterZones: [{ x1: 350, x2: 1130, surfaceY: 368 }],
      decorProps: [
        { kind: 'dragon_brazier', x: 140, y: 404, scale: 0.9 },
        { kind: 'dragon_brazier', x: 1260, y: 404, scale: 0.9 },
      ],
      pavilions: [{ x: 1180, y: 318, w: 220, hasPillars: true }],
      archways: [{ x: 1460, title: '九幽瓮城门' }],
      torches: [
        { x: 430, y: 322 },
        { x: 740, y: 266 },
        { x: 1040, y: 322 },
        { x: 1360, y: 332 },
      ],
      foregrounds: [{ x: 240, kind: 'hanging_lantern', parallax: 1.2 }],
      lanterns: [
        { x: 520, y: 226 },
        { x: 740, y: 204 },
        { x: 960, y: 226 },
        { x: 1290, y: 218 },
      ],
      npcs: [
        {
          id: 'su_qingyan',
          name: '苏清晏',
          title: '钦天监司辰女官',
          x: 290,
          defaultFacing: -1,
        },
      ],
      spawns: [
        { kind: 'corpse_soldier', x: 660 },
        { kind: 'blood_bat', x: 880, y: 205 },
        { kind: 'bone_archer', x: 1185, y: 404 },
        { kind: 'paper_swordsman', x: 1380 },
      ],
      pickups: [],
    },

    {
      id: 'gate_2',
      name: '瓮城分道门厅',
      subtitle: '上下分道 · 炼丹司石阶与地火重闸',
      region: 'gatehouse',
      bgKey: 'bg_gatehouse_interior',
      realm: 'normal',
      indoor: true,
      mapX: 2,
      mapY: 3,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 520,
      special: 'none',
      focalX: 800,
      focalY: 424,
      leftRoomId: 'entrance_inner_court',
      leftDoorFloorY: 424,
      rightRoomId: 'gate_save',
      rightDoorFloorY: 424,
      groundNodes: [
        { x: 0, y: 424, style: 'flagstone' },
        { x: 590, y: 424, style: 'stairs' },
        { x: 660, y: 456, style: 'flagstone' },
        { x: 910, y: 456, style: 'stairs' },
        { x: 980, y: 424, style: 'flagstone' },
        { x: 1600, y: 424, style: 'flagstone' },
      ],
      // 石砌阶梯悬台 + 下沉瓮城演武坑 + 西侧箭楼飞阁
      solidBlocks: [
        { x: 96, y: 252, w: 220, h: 34 }, // 西高台 (二段跳奖励台)
        { x: 820, y: 340, w: 180, h: 34 }, // 东第1阶
        { x: 980, y: 256, w: 190, h: 34 }, // 东第2阶
        { x: 1120, y: 172, w: 220, h: 32 }, // 东第3阶
        { x: 1170, y: 92, w: 170, h: 28 }, // 登顶踏石
      ],
      ceilingSpans: [
        { x1: 0, x2: 1140, bottomY: 34, style: 'gate_tunnel' },
        { x1: 1360, x2: 1600, bottomY: 34, style: 'gate_tunnel' },
      ],
      shafts: [
        { x1: 420, x2: 556, dir: 'down', targetRoomId: 'forge_smithy' },
        { x1: 1140, x2: 1360, dir: 'up', targetRoomId: 'alchemy_lab' },
      ],
      decorProps: [
        { kind: 'dragon_brazier', x: 785, y: 456, scale: 0.9 },
        { kind: 'weapon_rack', x: 1430, y: 424, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [
        { x: 414, y: 424, w: 152, hasPillars: false },
        { x: 150, y: 340, w: 205, hasPillars: true },
      ],
      archways: [],
      torches: [
        { x: 200, y: 350 },
        { x: 760, y: 376 },
        { x: 1480, y: 350 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 490, y: 245 },
        { x: 785, y: 268 },
        { x: 1440, y: 270 },
      ],
      npcs: [],
      spawns: [
        { kind: 'paper_swordsman', x: 680, y: 424 },
        { kind: 'paper_swordsman', x: 1085, y: 256 },
        { kind: 'lantern_ghost', x: 960, y: 180 },
      ],
      pickups: [{ id: 'pk_gate2_hp_up', kind: 'max_up', itemId: 'hp_vessel', x: 185, y: 252 }],
    },

    {
      id: 'gate_save',
      name: '瓮城镇魂祠',
      subtitle: '独立留档室',
      region: 'gatehouse',
      bgKey: 'bg_gatehouse_interior',
      realm: 'normal',
      indoor: true,
      mapX: 4,
      mapY: 3,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 440,
      special: 'save_shrine',
      warpName: '瓮城镇魂祠',
      focalX: 400,
      focalY: 356,
      leftRoomId: 'gate_2',
      leftDoorFloorY: 384,
      rightRoomId: 'hall_corridor',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 165, y: 384, style: 'stairs' },
        { x: 255, y: 356, style: 'marble' },
        { x: 545, y: 356, style: 'stairs' },
        { x: 635, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      solidBlocks: [
        { x: 65, y: 278, w: 140, h: 28 },
        { x: 595, y: 278, w: 140, h: 28 },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'incense_burner', x: 280, y: 356, scale: 0.9 },
        { kind: 'incense_burner', x: 520, y: 356, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 250, y: 286 },
        { x: 550, y: 286 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 135, y: 210 },
        { x: 665, y: 210 },
      ],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    // ==================== 二、钦天炼丹司（致敬月下：炼金研究栋 -> 重刃武库 -> 首战萧断水 -> 二段跳） ====================
    {
      id: 'alchemy_lab',
      name: '钦天炼丹阶梯廊',
      subtitle: '错落石台与重盾亲卫',
      region: 'alchemy',
      bgKey: 'bg_alchemy_palace',
      realm: 'normal',
      indoor: true,
      mapX: 2,
      mapY: 2,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 520,
      special: 'none',
      focalX: 800,
      focalY: 424,
      leftRoomId: 'west_armory',
      leftDoorFloorY: 424,
      groundNodes: [
        { x: 0, y: 424, style: 'marble' },
        { x: 310, y: 424, style: 'stairs' },
        { x: 385, y: 392, style: 'marble' },
        { x: 575, y: 392, style: 'stairs' },
        { x: 645, y: 436, style: 'crypt_stone' },
        { x: 925, y: 436, style: 'stairs' },
        { x: 995, y: 424, style: 'marble' },
        { x: 1600, y: 424, style: 'marble' },
      ],
      // 多层丹炉台地 + 寒泉淬丹池 + 青铜滑索吊台
      solidBlocks: [
        { x: 340, y: 312, w: 220, h: 32 },
        { x: 910, y: 168, w: 220, h: 34 },
        { x: 1090, y: 88, w: 165, h: 28 },
      ],
      movingPlatforms: [
        { x1: 635, y1: 318, x2: 795, y2: 244, w: 135, speed: 1.15, style: 'bronze_lift' },
      ],
      ceilingSpans: [
        { x1: 0, x2: 1060, bottomY: 32, style: 'palace_timber' },
        { x1: 1280, x2: 1600, bottomY: 32, style: 'palace_timber' },
      ],
      shafts: [
        { x1: 1140, x2: 1360, dir: 'down', targetRoomId: 'gate_2' },
        { x1: 1060, x2: 1280, dir: 'up', targetRoomId: 'xiao_boss_hall' },
      ],
      decorProps: [
        { kind: 'incense_burner', x: 180, y: 424, scale: 0.94 },
        { kind: 'coiled_pillar', x: 520, y: 392, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1045, y: 424, scale: 0.92 },
        { kind: 'weapon_rack', x: 1450, y: 424, scale: 0.92 },
      ],
      steles: [{ id: 'stele_alchemy_edict', x: 260 }],
      waterZones: [{ x1: 635, x2: 935, surfaceY: 416 }],
      pavilions: [
        { x: 1134, y: 424, w: 232, hasPillars: false },
      ],
      archways: [],
      torches: [
        { x: 240, y: 348 },
        { x: 620, y: 328 },
        { x: 1010, y: 348 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 450, y: 224 },
        { x: 785, y: 165 },
        { x: 1420, y: 270 },
      ],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 455, y: 336 },
        { kind: 'scroll_demon', x: 750, y: 200 },
        { kind: 'paper_swordsman', x: 960, y: 424 },
      ],
      pickups: [{ id: 'pk_alch_huiqi', kind: 'consumable', itemId: 'huiqi_dan', x: 995, y: 168 }],
    },

    {
      id: 'west_armory',
      name: '镇军西武库',
      subtitle: '前朝重兵封藏室',
      region: 'alchemy',
      bgKey: 'bg_alchemy_palace',
      realm: 'normal',
      indoor: true,
      mapX: 1,
      mapY: 2,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 440,
      special: 'relic_pedestal',
      focalX: 240,
      focalY: 384,
      leftRoomId: 'secret_armory_vault',
      leftDoorFloorY: 384,
      leftDoorSecretId: 'sec_door_armory',
      rightRoomId: 'alchemy_lab',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 380, y: 384, style: 'stairs' },
        { x: 440, y: 354, style: 'marble' },
        { x: 645, y: 354, style: 'stairs' },
        { x: 705, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      solidBlocks: [{ x: 140, y: 296, w: 220, h: 34 }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      secretWalls: [
        {
          id: 'sw_armory_chicken',
          x: 228,
          y: 296,
          w: 44,
          h: 88,
          dropKind: 'consumable',
          dropItemId: 'beggar_chicken',
        },
      ],
      decorProps: [
        { kind: 'weapon_rack', x: 485, y: 354, scale: 0.95 },
        { kind: 'dragon_brazier', x: 615, y: 354, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [{ x: 440, y: 266, w: 210, hasPillars: true }],
      archways: [],
      torches: [{ x: 530, y: 288 }],
      foregrounds: [],
      lanterns: [
        { x: 250, y: 205 },
        { x: 545, y: 196 },
      ],
      npcs: [],
      spawns: [{ kind: 'bronze_guard', x: 510, y: 354 }],
      pickups: [
        { id: 'pk_modao_1', kind: 'weapon', itemId: 'greatsword_1', x: 215, y: 296 },
        { id: 'pk_sub_fire', kind: 'weapon', itemId: 'sub:holy_fire', x: 305, y: 296 },
      ],
    },

    {
      id: 'xiao_boss_hall',
      name: '钦天试剑堂',
      subtitle: '镇妖司少统领决战殿',
      region: 'alchemy',
      bgKey: 'bg_alchemy_palace',
      realm: 'normal',
      indoor: true,
      mapX: 3,
      mapY: 1,
      gridW: 2,
      gridH: 1,
      pixelW: 1500,
      pixelH: 480,
      special: 'boss_room',
      bossKind: 'boss_xiao_duanshui',
      storyTriggerId: 'boss_xiao_pre',
      focalX: 1080,
      focalY: 432,
      leftRoomId: 'relic_double_jump',
      leftDoorFloorY: 404,
      rightRoomId: 'alchemy_save',
      rightDoorFloorY: 404,
      groundNodes: [
        { x: 0, y: 404, style: 'marble' },
        { x: 515, y: 404, style: 'stairs' },
        { x: 595, y: 432, style: 'marble' },
        { x: 1215, y: 432, style: 'stairs' },
        { x: 1295, y: 404, style: 'marble' },
        { x: 1500, y: 404, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 1500, bottomY: 36, style: 'palace_timber' }],
      shafts: [{ x1: 260, x2: 480, dir: 'down', targetRoomId: 'alchemy_lab' }],
      decorProps: [
        { kind: 'silk_banner', x: 210, y: 248, scale: 0.88 },
        { kind: 'dragon_brazier', x: 640, y: 432, scale: 0.94 },
        { kind: 'chandelier', x: 900, y: 20, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1170, y: 432, scale: 0.94 },
        { kind: 'silk_banner', x: 1340, y: 248, scale: 0.88 },
      ],
      waterZones: [],
      pavilions: [
        { x: 254, y: 404, w: 232, hasPillars: false },
        { x: 560, y: 318, w: 175, hasPillars: false },
        { x: 1055, y: 318, w: 175, hasPillars: false },
      ],
      archways: [],
      torches: [
        { x: 160, y: 326 },
        { x: 1350, y: 326 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 740, y: 205 },
        { x: 1060, y: 205 },
      ],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    {
      id: 'alchemy_save',
      name: '丹阁镇魂祠',
      subtitle: '试剑堂前留档室',
      region: 'alchemy',
      bgKey: 'bg_alchemy_palace',
      realm: 'normal',
      indoor: true,
      mapX: 5,
      mapY: 1,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 440,
      special: 'save_shrine',
      warpName: '丹阁镇魂祠',
      focalX: 540,
      focalY: 358,
      leftRoomId: 'xiao_boss_hall',
      leftDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 135, y: 384, style: 'stairs' },
        { x: 205, y: 410, style: 'crypt_stone' },
        { x: 375, y: 410, style: 'stairs' },
        { x: 455, y: 358, style: 'marble' },
        { x: 665, y: 358, style: 'stairs' },
        { x: 735, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'incense_burner', x: 115, y: 384, scale: 0.92 },
        { kind: 'incense_burner', x: 645, y: 358, scale: 0.92 },
      ],
      waterZones: [{ x1: 195, x2: 385, surfaceY: 396 }],
      pavilions: [{ x: 185, y: 286, w: 205, hasPillars: false }],
      archways: [],
      torches: [
        { x: 255, y: 306 },
        { x: 545, y: 286 },
      ],
      foregrounds: [],
      lanterns: [{ x: 290, y: 205 }],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    {
      id: 'relic_double_jump',
      name: '丹鼎古武秘室',
      subtitle: '镇司轻功 · 踏云步传承坛',
      region: 'alchemy',
      bgKey: 'bg_alchemy_palace',
      realm: 'normal',
      indoor: true,
      mapX: 2,
      mapY: 1,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 440,
      special: 'relic_pedestal',
      focalX: 380,
      focalY: 320,
      rightRoomId: 'xiao_boss_hall',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 165, y: 384, style: 'stairs' },
        { x: 245, y: 356, style: 'marble' },
        { x: 515, y: 356, style: 'stairs' },
        { x: 595, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      solidBlocks: [
        { x: 270, y: 320, w: 220, h: 36 },
        { x: 75, y: 214, w: 175, h: 28 },
        { x: 540, y: 214, w: 175, h: 28 },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 135, y: 384, scale: 0.9 },
        { kind: 'dragon_brazier', x: 635, y: 384, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 210, y: 316 },
        { x: 560, y: 316 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 160, y: 155 },
        { x: 625, y: 155 },
      ],
      npcs: [],
      spawns: [],
      pickups: [{ id: 'pk_relic_djump', kind: 'ability', itemId: 'double_jump', x: 380, y: 320 }],
    },

    // ==================== 三、奉天盘龙正殿（致敬月下：大理石廊下枢纽 + 传送室 + 二段跳高台锁） ====================
    {
      id: 'hall_corridor',
      name: '奉天盘龙长廊',
      subtitle: '皇城中枢 · 须弥高台与剑灵秘座',
      region: 'main_hall',
      bgKey: 'bg_main_hall',
      realm: 'normal',
      indoor: true,
      mapX: 5,
      mapY: 3,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 520,
      special: 'none',
      storyTriggerId: 'enter_main_hall',
      focalX: 1100,
      focalY: 432,
      leftRoomId: 'gate_save',
      leftDoorFloorY: 432,
      rightRoomId: 'east_outer_tower',
      rightDoorFloorY: 264, // 东端出口位于 168px 高的皇城须弥石台上（必须习得【踏云二段跳】方可登台东进望月塔！）
      groundNodes: [
        { x: 0, y: 432, style: 'marble' },
        { x: 520, y: 432, style: 'stairs' },
        { x: 615, y: 398, style: 'marble' },
        { x: 760, y: 398, style: 'stairs' },
        { x: 850, y: 372, style: 'marble' },
        { x: 1140, y: 372, style: 'stairs' },
        { x: 1230, y: 404, style: 'marble' },
        { x: 1470, y: 404, style: 'stairs' },
        { x: 1555, y: 432, style: 'marble' },
        { x: 2200, y: 432, style: 'marble' },
      ],
      solidBlocks: [
        { x: 840, y: 292, w: 250, h: 32 }, // 中殿御阶悬台
        { x: 1180, y: 224, w: 250, h: 32 }, // 本命剑灵悬台
        { x: 1820, y: 264, w: 380, h: 168, blocking: true }, // 东端 168px 实心断崖须弥高台（踏云二段跳能力锁）
      ],
      movingPlatforms: [
        { x1: 1445, y1: 324, x2: 1630, y2: 264, w: 135, speed: 1.05, style: 'scholar_ladder' },
      ],
      ceilingSpans: [{ x1: 0, x2: 2200, bottomY: 36, style: 'palace_timber' }],
      shafts: [{ x1: 320, x2: 460, dir: 'down', targetRoomId: 'central_warp' }],
      decorProps: [
        { kind: 'silk_banner', x: 165, y: 256, scale: 0.9 },
        { kind: 'coiled_pillar', x: 260, y: 432, scale: 0.96 },
        { kind: 'dragon_brazier', x: 685, y: 398, scale: 0.94 },
        { kind: 'chandelier', x: 985, y: 18, scale: 0.94 },
        { kind: 'coiled_pillar', x: 1120, y: 372, scale: 0.96 },
        { kind: 'dragon_brazier', x: 1620, y: 432, scale: 0.94 },
        { kind: 'coiled_pillar', x: 1755, y: 432, scale: 0.96 },
        { kind: 'silk_banner', x: 1960, y: 186, scale: 0.86 },
      ],
      waterZones: [],
      pavilions: [
        { x: 316, y: 432, w: 148, hasPillars: false },
        { x: 530, y: 308, w: 205, hasPillars: true },
      ],
      archways: [],
      torches: [
        { x: 210, y: 354 },
        { x: 740, y: 324 },
        { x: 1480, y: 332 },
        { x: 2040, y: 188 },
      ],
      foregrounds: [{ x: 1100, kind: 'hanging_lantern', parallax: 1.2 }],
      lanterns: [
        { x: 420, y: 240 },
        { x: 965, y: 196 },
        { x: 1305, y: 152 },
        { x: 1730, y: 248 },
      ],
      npcs: [],
      spawns: [
        { kind: 'paper_swordsman', x: 680, y: 398 },
        { kind: 'bronze_guard', x: 965, y: 292 },
        { kind: 'opera_puppet', x: 1620, y: 432 },
        { kind: 'scroll_demon', x: 1720, y: 220 },
      ],
      pickups: [
        { id: 'pk_hall_familiar', kind: 'ability', itemId: 'familiar_sword', x: 1305, y: 224 },
      ],
    },

    {
      id: 'central_warp',
      name: '中枢八卦传送室',
      subtitle: '乾坤龙脉传送阵',
      region: 'main_hall',
      bgKey: 'bg_main_hall',
      realm: 'normal',
      indoor: true,
      mapX: 5,
      mapY: 4,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'warp_bagua',
      warpName: '中枢八卦传送阵',
      focalX: 400,
      focalY: 372,
      groundNodes: [
        { x: 0, y: 396, style: 'marble' },
        { x: 105, y: 396, style: 'stairs' },
        { x: 155, y: 416, style: 'crypt_stone' },
        { x: 220, y: 416, style: 'stairs' },
        { x: 290, y: 372, style: 'marble' },
        { x: 490, y: 372, style: 'stairs' },
        { x: 560, y: 416, style: 'crypt_stone' },
        { x: 635, y: 416, style: 'stairs' },
        { x: 685, y: 396, style: 'marble' },
        { x: 800, y: 396, style: 'marble' },
      ],
      solidBlocks: [
        { x: 110, y: 312, w: 145, h: 30 },
        { x: 195, y: 228, w: 145, h: 30 },
        { x: 275, y: 144, w: 145, h: 28 },
        { x: 315, y: 76, w: 150, h: 26 },
      ],
      clockGears: [
        { x: 615, y: 245, radius: 64, speed: 0.55, hasOrbitPlatforms: true },
      ],
      ceilingSpans: [
        { x1: 0, x2: 300, bottomY: 32, style: 'palace_timber' },
        { x1: 480, x2: 800, bottomY: 32, style: 'palace_timber' },
      ],
      shafts: [{ x1: 300, x2: 480, dir: 'up', targetRoomId: 'hall_corridor' }],
      decorProps: [{ kind: 'dragon_brazier', x: 715, y: 396, scale: 0.9 }],
      waterZones: [
        { x1: 145, x2: 235, surfaceY: 402 },
        { x1: 550, x2: 645, surfaceY: 402 },
      ],
      pavilions: [],
      archways: [],
      torches: [
        { x: 75, y: 328 },
        { x: 735, y: 328 },
      ],
      foregrounds: [],
      lanterns: [{ x: 615, y: 138 }],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    // ==================== 四、地下铸剑坊 & 九曲寒潭水牢（重刃破闸开启 -> 墨千秋 -> 缩地化雾回环捷径） ====================
    {
      id: 'forge_smithy',
      name: '赤火铸剑坊',
      subtitle: '欧冶残淬兵台',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 2,
      mapY: 4,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'none',
      focalX: 305,
      focalY: 382,
      leftRoomId: 'forge_molten_hall',
      leftDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 75, y: 408, style: 'stairs' },
        { x: 115, y: 428, style: 'crypt_stone' },
        { x: 185, y: 428, style: 'stairs' },
        { x: 255, y: 382, style: 'marble' },
        { x: 340, y: 382, style: 'stairs' },
        { x: 388, y: 408, style: 'marble' },
        { x: 800, y: 408, style: 'marble' },
      ],
      solidBlocks: [
        { x: 80, y: 324, w: 150, h: 32 },
        { x: 170, y: 240, w: 150, h: 32 },
        { x: 280, y: 156, w: 155, h: 30 },
        { x: 405, y: 82, w: 145, h: 26 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 396, bottomY: 32, style: 'crypt_vault' },
        { x1: 564, x2: 800, bottomY: 32, style: 'crypt_vault' },
      ],
      shafts: [
        { x1: 396, x2: 564, dir: 'up', targetRoomId: 'gate_2' },
        { x1: 595, x2: 740, dir: 'down', targetRoomId: 'prison_waterway' },
      ],
      ironGate: {
        id: 'gate_forge_entry',
        x: 572,
        topY: 0,
        bottomY: 408,
        gateKind: 'heavy_weapon',
      },
      decorProps: [
        { kind: 'dragon_brazier', x: 265, y: 382, scale: 0.94 },
        { kind: 'weapon_rack', x: 455, y: 408, scale: 0.92 },
      ],
      waterZones: [{ x1: 105, x2: 195, surfaceY: 414 }],
      pavilions: [{ x: 590, y: 408, w: 156, hasPillars: false }],
      archways: [],
      torches: [
        { x: 55, y: 340 },
        { x: 515, y: 340 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 155, y: 210 },
        { x: 665, y: 250 },
      ],
      npcs: [
        {
          id: 'ouye_can',
          name: '欧冶残',
          title: '赤火坊独臂铸剑师',
          x: 310,
          defaultFacing: 1,
        },
      ],
      spawns: [],
      pickups: [],
    },

    {
      id: 'forge_molten_hall',
      name: '赤火熔金暗渠',
      subtitle: '幽冥分水刺与踏云越火潭',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 1,
      mapY: 4,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'none',
      focalX: 650,
      focalY: 408,
      leftRoomId: 'forge_boss_arena',
      leftDoorFloorY: 408,
      rightRoomId: 'forge_smithy',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 210, y: 408, style: 'stairs' },
        { x: 265, y: 444, style: 'crypt_stone' },
        { x: 535, y: 444, style: 'stairs' },
        { x: 590, y: 408, style: 'crypt_stone' },
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 600, y: 368, w: 140, h: 40 },
        { x: 330, y: 244, w: 140, h: 32 },
      ],
      movingPlatforms: [
        { x1: 245, y1: 356, x2: 435, y2: 356, w: 120, speed: 1.15, style: 'bronze_lift' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      waterZones: [{ x1: 235, x2: 565, surfaceY: 402, liquidKind: 'lava' }],
      decorProps: [
        { kind: 'dragon_brazier', x: 135, y: 408, scale: 0.9 },
        { kind: 'weapon_rack', x: 725, y: 408, scale: 0.9 },
      ],
      steles: [{ id: 'stele_forge_arm', x: 205 }],
      pavilions: [],
      archways: [],
      torches: [{ x: 180, y: 330 }],
      foregrounds: [],
      lanterns: [{ x: 400, y: 152 }],
      npcs: [],
      spawns: [{ kind: 'lantern_ghost', x: 400, y: 196 }],
      pickups: [{ id: 'pk_daggers_1', kind: 'weapon', itemId: 'daggers_1', x: 660, y: 368 }],
    },

    {
      id: 'forge_boss_arena',
      name: '地肺镇火巨窟',
      subtitle: '赤铜镇火巨灵决战殿',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 0,
      mapY: 4,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'boss_room',
      bossKind: 'boss_furnace_titan',
      focalX: 280,
      focalY: 408,
      rightRoomId: 'forge_molten_hall',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 55, y: 408, style: 'stairs' },
        { x: 115, y: 382, style: 'crypt_stone' },
        { x: 215, y: 382, style: 'stairs' },
        { x: 265, y: 408, style: 'crypt_stone' },
        { x: 535, y: 408, style: 'stairs' },
        { x: 585, y: 382, style: 'crypt_stone' },
        { x: 685, y: 382, style: 'stairs' },
        { x: 745, y: 408, style: 'crypt_stone' },
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 85, y: 298, w: 150, h: 30 },
        { x: 325, y: 232, w: 150, h: 28 },
        { x: 565, y: 298, w: 150, h: 30 },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'crypt_vault' }],
      shafts: [
        {
          x1: 310,
          x2: 490,
          dir: 'down',
          targetRoomId: 'relic_ground_slam',
          requireBossClear: true,
        },
      ],
      decorProps: [
        { kind: 'dragon_brazier', x: 165, y: 382, scale: 0.94 },
        { kind: 'dragon_brazier', x: 635, y: 382, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [{ x: 304, y: 408, w: 192, hasPillars: false }],
      archways: [],
      torches: [
        { x: 95, y: 322 },
        { x: 705, y: 322 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 240, y: 186 },
        { x: 560, y: 186 },
      ],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    {
      id: 'relic_ground_slam',
      name: '地肺玄钧秘坛',
      subtitle: '霸体秘印 · 千斤坠与赤炎巨阙',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 0,
      mapY: 5,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'relic_pedestal',
      focalX: 560,
      focalY: 408,
      rightRoomId: 'secret_forge_smeltery',
      rightDoorFloorY: 408,
      rightDoorSecretId: 'sec_door_smelt',
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 95, y: 408, style: 'stairs' },
        { x: 145, y: 436, style: 'crypt_stone' },
        { x: 250, y: 436, style: 'stairs' },
        { x: 300, y: 408, style: 'crypt_stone' },
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 500, y: 372, w: 220, h: 36 },
        { x: 120, y: 338, w: 150, h: 32 },
        { x: 190, y: 248, w: 150, h: 32 },
        { x: 260, y: 158, w: 150, h: 30 },
        { x: 320, y: 80, w: 155, h: 26 },
      ],
      clockGears: [{ x: 635, y: 215, radius: 58, speed: -0.5, hasOrbitPlatforms: false }],
      ceilingSpans: [
        { x1: 0, x2: 310, bottomY: 32, style: 'crypt_vault' },
        { x1: 490, x2: 800, bottomY: 32, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 310, x2: 490, dir: 'up', targetRoomId: 'forge_boss_arena' }],
      decorProps: [{ kind: 'guardian_statue', x: 65, y: 408, scale: 0.92 }],
      waterZones: [{ x1: 135, x2: 260, surfaceY: 420 }],
      pavilions: [],
      archways: [],
      torches: [
        { x: 455, y: 340 },
        { x: 745, y: 340 },
      ],
      foregrounds: [],
      lanterns: [{ x: 610, y: 248 }],
      npcs: [],
      spawns: [],
      pickups: [
        { id: 'pk_relic_slam', kind: 'ability', itemId: 'ground_slam', x: 555, y: 372 },
        { id: 'pk_gs_2', kind: 'weapon', itemId: 'greatsword_2', x: 665, y: 372 },
      ],
    },

    {
      id: 'prison_waterway',
      name: '九曲寒潭水牢',
      subtitle: '水上石墩与飞瀑暗渠',
      region: 'prison',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      indoor: true,
      mapX: 2,
      mapY: 5,
      gridW: 3,
      gridH: 1,
      pixelW: 2000,
      pixelH: 500,
      special: 'none',
      focalX: 900,
      focalY: 416,
      rightRoomId: 'prison_boss_hall',
      rightDoorFloorY: 416,
      groundNodes: [
        { x: 0, y: 416, style: 'crypt_stone' },
        { x: 760, y: 416, style: 'stairs' },
        { x: 815, y: 448, style: 'crypt_stone' },
        { x: 1585, y: 448, style: 'stairs' },
        { x: 1655, y: 416, style: 'crypt_stone' },
        { x: 2000, y: 416, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 320, y: 332, w: 150, h: 32 },
        { x: 410, y: 248, w: 150, h: 32 },
        { x: 500, y: 164, w: 150, h: 30 },
        { x: 585, y: 86, w: 145, h: 26 },
        { x: 820, y: 344, w: 190, h: 104 },
        { x: 1085, y: 312, w: 205, h: 136 },
        { x: 1390, y: 344, w: 200, h: 104 },
      ],
      movingPlatforms: [
        { x1: 910, y1: 238, x2: 1340, y2: 238, w: 135, speed: 0.85, style: 'wood_ferry' },
      ],
      ceilingSpans: [
        { x1: 0, x2: 570, bottomY: 32, style: 'crypt_vault' },
        { x1: 750, x2: 2000, bottomY: 32, style: 'crypt_vault' },
      ],
      shafts: [
        { x1: 570, x2: 750, dir: 'up', targetRoomId: 'forge_smithy' },
        { x1: 220, x2: 400, dir: 'down', targetRoomId: 'catacomb_hall' },
      ],
      waterZones: [{ x1: 765, x2: 1650, surfaceY: 388 }],
      decorProps: [
        { kind: 'dragon_brazier', x: 120, y: 416, scale: 0.9 },
        { kind: 'dragon_brazier', x: 1760, y: 416, scale: 0.9 },
      ],
      pavilions: [
        { x: 214, y: 416, w: 192, hasPillars: false },
        { x: 1685, y: 328, w: 215, hasPillars: true },
      ],
      archways: [],
      torches: [
        { x: 880, y: 268 },
        { x: 1185, y: 236 },
        { x: 1490, y: 268 },
        { x: 1840, y: 340 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 880, y: 188 },
        { x: 1490, y: 188 },
        { x: 1790, y: 225 },
      ],
      npcs: [],
      spawns: [
        { kind: 'plague_toad', x: 880, y: 344 },
        { kind: 'lantern_ghost', x: 1190, y: 200 },
        { kind: 'plague_toad', x: 1490, y: 344 },
        { kind: 'bronze_guard', x: 1790, y: 416 },
      ],
      pickups: [
        { id: 'pk_prison_spear1', kind: 'weapon', itemId: 'spear_1', x: 1185, y: 312 },
        { id: 'pk_prison_bagua', kind: 'weapon', itemId: 'sub:bagua_cross', x: 180, y: 416 },
      ],
    },

    {
      id: 'prison_boss_hall',
      name: '寒潭镇水古殿',
      subtitle: '万卷妖宗决战殿',
      region: 'prison',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      indoor: true,
      mapX: 5,
      mapY: 5,
      gridW: 2,
      gridH: 1,
      pixelW: 1500,
      pixelH: 480,
      special: 'boss_room',
      bossKind: 'boss_scroll_king',
      storyTriggerId: 'boss_scroll_pre',
      focalX: 980,
      focalY: 408,
      leftRoomId: 'prison_waterway',
      leftDoorFloorY: 408,
      rightRoomId: 'relic_mist_vault',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 200, y: 408, style: 'stairs' },
        { x: 265, y: 434, style: 'crypt_stone' },
        { x: 1235, y: 434, style: 'stairs' },
        { x: 1300, y: 408, style: 'crypt_stone' },
        { x: 1500, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 240, y: 320, w: 185, h: 28 },
        { x: 635, y: 376, w: 230, h: 58 },
        { x: 1075, y: 320, w: 185, h: 28 },
      ],
      ceilingSpans: [{ x1: 0, x2: 1500, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 155, y: 408, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1345, y: 408, scale: 0.92 },
      ],
      waterZones: [{ x1: 215, x2: 1285, surfaceY: 406 }],
      pavilions: [],
      archways: [],
      torches: [
        { x: 150, y: 332 },
        { x: 1350, y: 332 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 520, y: 208 },
        { x: 980, y: 208 },
      ],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    {
      id: 'relic_mist_vault',
      name: '玄鸟秘宝冢',
      subtitle: '缩地化雾与玄鸟合璧佩 · 贯通东塔回环井',
      region: 'prison',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      indoor: true,
      mapX: 7,
      mapY: 5,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'relic_pedestal',
      focalX: 310,
      focalY: 408,
      leftRoomId: 'prison_boss_hall',
      leftDoorFloorY: 408,
      rightRoomId: 'secret_ice_spring',
      rightDoorFloorY: 408,
      rightDoorSecretId: 'sec_door_ice',
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 130, y: 408, style: 'stairs' },
        { x: 185, y: 432, style: 'crypt_stone' },
        { x: 465, y: 432, style: 'stairs' },
        { x: 515, y: 408, style: 'crypt_stone' },
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 220, y: 372, w: 220, h: 60 },
        { x: 495, y: 320, w: 165, h: 32 },
        { x: 535, y: 234, w: 165, h: 32 },
        { x: 505, y: 150, w: 165, h: 30 },
        { x: 525, y: 78, w: 150, h: 26 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 500, bottomY: 32, style: 'crypt_vault' },
        { x1: 700, x2: 800, bottomY: 32, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 500, x2: 700, dir: 'up', targetRoomId: 'prison_save' }],
      decorProps: [{ kind: 'guardian_statue', x: 95, y: 408, scale: 0.92 }],
      waterZones: [{ x1: 140, x2: 490, surfaceY: 404 }],
      pavilions: [],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [{ x: 330, y: 245 }],
      npcs: [],
      spawns: [],
      pickups: [
        { id: 'pk_relic_mist', kind: 'ability', itemId: 'mist_dash', x: 275, y: 372 },
        { id: 'pk_relic_jade', kind: 'ability', itemId: 'jade_pendant_full', x: 385, y: 372 },
      ],
    },

    {
      id: 'prison_save',
      name: '寒潭渡口古祠',
      subtitle: '东塔底层留档枢纽',
      region: 'prison',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      indoor: true,
      mapX: 7,
      mapY: 4,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'save_shrine',
      warpName: '寒潭渡口古祠',
      focalX: 255,
      focalY: 366,
      rightRoomId: 'east_outer_tower',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'crypt_stone' },
        { x: 75, y: 396, style: 'stairs' },
        { x: 145, y: 366, style: 'crypt_stone' },
        { x: 365, y: 366, style: 'stairs' },
        { x: 445, y: 396, style: 'crypt_stone' },
        { x: 800, y: 396, style: 'crypt_stone' },
      ],
      solidBlocks: [{ x: 520, y: 292, w: 185, h: 28 }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'crypt_vault' }],
      shafts: [{ x1: 500, x2: 700, dir: 'down', targetRoomId: 'relic_mist_vault' }],
      decorProps: [{ kind: 'incense_burner', x: 145, y: 366, scale: 0.9 }],
      waterZones: [],
      pavilions: [{ x: 494, y: 396, w: 212, hasPillars: false }],
      archways: [],
      torches: [{ x: 430, y: 318 }],
      foregrounds: [],
      lanterns: [{ x: 610, y: 215 }],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    // ==================== 五、1×4 东垣望月竖塔（致敬月下：外壁巨塔，纵向串联全城四层 6 扇门！） ====================
    {
      id: 'east_outer_tower',
      name: '东垣望月竖塔',
      subtitle: '纵贯四层外壁枢机塔',
      region: 'clock_tower',
      bgKey: 'bg_tower_interior',
      realm: 'normal',
      indoor: true,
      mapX: 8,
      mapY: 1,
      gridW: 1,
      gridH: 4,
      pixelW: 800,
      pixelH: 1640,
      special: 'none',
      focalX: 400,
      focalY: 1140,
      sideDoors: [
        // 顶层 rowOffset=0 (mapY=1)：右门经【紫瘴封魔栅（需缩地化雾）】通往天机秘阁！
        { side: 'right', floorY: 320, targetRoomId: 'secret_archive', rowOffset: 0 },
        // 上中层 rowOffset=1 (mapY=2)：左门通往万卷藏书阁，右门通往浑天铜轮机巧廊（钟鼓楼翼区）！
        { side: 'left', floorY: 732, targetRoomId: 'upper_library', rowOffset: 1 },
        { side: 'right', floorY: 732, targetRoomId: 'clock_gear_hall', rowOffset: 1 },
        // 下中层 rowOffset=2 (mapY=3)：左门连奉天盘龙长廊，右门连东垣八卦传送室！
        { side: 'left', floorY: 1140, targetRoomId: 'hall_corridor', rowOffset: 2 },
        { side: 'right', floorY: 1140, targetRoomId: 'east_warp', rowOffset: 2 },
        // 底层 rowOffset=3 (mapY=4)：左门连寒潭渡口古祠！
        { side: 'left', floorY: 1548, targetRoomId: 'prison_save', rowOffset: 3 },
      ],
      groundNodes: [
        { x: 0, y: 1548, style: 'marble' },
        { x: 185, y: 1548, style: 'stairs' },
        { x: 240, y: 1574, style: 'crypt_stone' },
        { x: 545, y: 1574, style: 'stairs' },
        { x: 600, y: 1548, style: 'marble' },
        { x: 800, y: 1548, style: 'marble' },
      ],
      // 经典月下外壁左右交替实心石阶 + 中轴青铜升降吊台与旋转机巧轮
      solidBlocks: [
        // 第4层(底 1548) -> 第3层(1140)
        { x: 500, y: 1456, w: 240, h: 32 },
        { x: 120, y: 1356, w: 240, h: 32 },
        { x: 460, y: 1252, w: 240, h: 32 },
        { x: 0, y: 1140, w: 290, h: 36 }, // 左门台(连 hall_corridor)
        { x: 510, y: 1140, w: 290, h: 36 }, // 右门台(连 east_warp)

        // 第3层(1140) -> 第2层(732)
        { x: 280, y: 1042, w: 240, h: 32 },
        { x: 500, y: 940, w: 240, h: 32 },
        { x: 220, y: 836, w: 240, h: 32 },
        { x: 0, y: 732, w: 300, h: 36 }, // 左门台(连 upper_library)
        { x: 500, y: 732, w: 300, h: 36 }, // 右门台(连 clock_gear_hall)

        // 第2层(732) -> 第1层(320)
        { x: 460, y: 634, w: 240, h: 32 },
        { x: 160, y: 532, w: 240, h: 32 },
        { x: 380, y: 428, w: 240, h: 32 },
        { x: 460, y: 320, w: 340, h: 36 }, // 右门台(紫瘴栅后连 secret_archive)

        // 第1层(320) -> 塔顶天井(84 -> 跃上观星登坛古祠！)
        { x: 160, y: 236, w: 220, h: 30 },
        { x: 300, y: 156, w: 200, h: 28 },
        { x: 315, y: 84, w: 170, h: 26 },
      ],
      clockGears: [
        { x: 400, y: 1295, radius: 66, speed: 0.48, hasOrbitPlatforms: false },
        { x: 400, y: 585, radius: 70, speed: -0.52, hasOrbitPlatforms: false },
      ],
      movingPlatforms: [
        {
          x1: 345,
          y1: 1124,
          x2: 345,
          y2: 752,
          w: 110,
          speed: 0.68,
          style: 'bronze_lift',
        },
      ],
      ceilingSpans: [
        { x1: 0, x2: 290, bottomY: 32, style: 'palace_timber' },
        { x1: 510, x2: 800, bottomY: 32, style: 'palace_timber' },
      ],
      shafts: [{ x1: 290, x2: 510, dir: 'up', targetRoomId: 'altar_save' }],
      // 致敬月下外壁迷雾铁栅：必须从水牢习得【缩地化雾】方可穿栅入内取得【破妄古镜】！
      ironGate: {
        id: 'gate_mist_archive',
        x: 680,
        topY: 0,
        bottomY: 320,
        gateKind: 'mist_only',
      },
      decorProps: [
        { kind: 'dragon_brazier', x: 145, y: 1548, scale: 0.92 },
        { kind: 'silk_banner', x: 400, y: 1190, scale: 0.88 },
        { kind: 'silk_banner', x: 400, y: 805, scale: 0.88 },
        { kind: 'silk_banner', x: 220, y: 390, scale: 0.86 },
      ],
      waterZones: [{ x1: 215, x2: 570, surfaceY: 1560 }],
      pavilions: [{ x: 270, y: 1544, w: 240, hasPillars: false }],
      archways: [],
      torches: [
        { x: 160, y: 1066 },
        { x: 640, y: 1066 },
        { x: 180, y: 658 },
        { x: 560, y: 246 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 390, y: 1405 },
        { x: 390, y: 1185 },
        { x: 155, y: 940 },
        { x: 645, y: 855 },
        { x: 320, y: 585 },
        { x: 400, y: 265 },
      ],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 600, y: 1456 },
        { kind: 'bell_gargoyle', x: 400, y: 980 },
        { kind: 'bronze_guard', x: 180, y: 732 },
        { kind: 'bell_gargoyle', x: 380, y: 460 },
      ],
      pickups: [{ id: 'pk_tower_mp_up', kind: 'max_up', itemId: 'mp_vessel', x: 240, y: 1356 }],
    },

    {
      id: 'east_warp',
      name: '东垣八卦传送室',
      subtitle: '外壁龙脉传送阵',
      region: 'clock_tower',
      bgKey: 'bg_tower_interior',
      realm: 'normal',
      indoor: true,
      mapX: 9,
      mapY: 3,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 440,
      special: 'warp_bagua',
      warpName: '东垣望月传送阵',
      focalX: 410,
      focalY: 356,
      leftRoomId: 'east_outer_tower',
      leftDoorFloorY: 384,
      rightRoomId: 'observatory_bridge',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 185, y: 384, style: 'stairs' },
        { x: 250, y: 356, style: 'marble' },
        { x: 570, y: 356, style: 'stairs' },
        { x: 635, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 275, y: 356, scale: 0.9 },
        { kind: 'dragon_brazier', x: 545, y: 356, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [
        { x: 65, y: 252, w: 175, hasPillars: true },
        { x: 560, y: 252, w: 175, hasPillars: true },
      ],
      archways: [],
      torches: [
        { x: 145, y: 318 },
        { x: 675, y: 318 },
      ],
      foregrounds: [],
      lanterns: [{ x: 410, y: 180 }],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    // ==================== 六、万卷藏书阁 & 万宝斋（致敬月下：藏书库双层书廊 + 深处万宝商铺） ====================
    {
      id: 'upper_library',
      name: '万卷藏书飞阁',
      subtitle: '双层书廊 · 飞天书妖与九节雷鞭',
      region: 'library',
      bgKey: 'bg_library_opera',
      realm: 'normal',
      indoor: true,
      mapX: 6,
      mapY: 2,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 500,
      special: 'none',
      focalX: 800,
      focalY: 450,
      leftRoomId: 'library_shop',
      leftDoorFloorY: 424,
      rightRoomId: 'east_outer_tower',
      rightDoorFloorY: 424,
      groundNodes: [
        { x: 0, y: 424, style: 'marble' },
        { x: 350, y: 424, style: 'stairs' },
        { x: 430, y: 450, style: 'palace_wood' },
        { x: 1170, y: 450, style: 'stairs' },
        { x: 1250, y: 424, style: 'marble' },
        { x: 1600, y: 424, style: 'marble' },
      ],
      // 双层藏书回廊（下沉经卷内庭 + 东西飞檐书亭 + 滑轨云梯 + 上层夹层直通【子夜百戏勾栏】天井！）
      solidBlocks: [
        { x: 360, y: 336, w: 210, h: 34 },
        { x: 660, y: 252, w: 340, h: 34 },
        { x: 755, y: 116, w: 150, h: 28 }, // 252->116 = 136px 需二段跳跃入上方百戏梨园！
        { x: 1090, y: 336, w: 210, h: 34 },
      ],
      movingPlatforms: [
        {
          x1: 420,
          y1: 214,
          x2: 545,
          y2: 214,
          w: 110,
          speed: 0.76,
          style: 'scholar_ladder',
        },
        {
          x1: 1015,
          y1: 214,
          x2: 1135,
          y2: 214,
          w: 110,
          speed: 0.76,
          phase: 3.14,
          style: 'scholar_ladder',
        },
      ],
      ceilingSpans: [
        { x1: 0, x2: 730, bottomY: 34, style: 'palace_timber' },
        { x1: 930, x2: 1600, bottomY: 34, style: 'palace_timber' },
      ],
      shafts: [{ x1: 730, x2: 930, dir: 'up', targetRoomId: 'opera_gallery' }],
      decorProps: [
        { kind: 'bookshelf', x: 190, y: 424, scale: 0.96 },
        { kind: 'bookshelf', x: 560, y: 424, scale: 0.96 },
        { kind: 'bookshelf', x: 830, y: 450, scale: 0.96 },
        { kind: 'chandelier', x: 1210, y: 22, scale: 0.9 },
        { kind: 'bookshelf', x: 1410, y: 424, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [
        { x: 120, y: 312, w: 210, hasPillars: true },
        { x: 1270, y: 312, w: 210, hasPillars: true },
      ],
      archways: [],
      torches: [
        { x: 280, y: 348 },
        { x: 960, y: 348 },
        { x: 1340, y: 348 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 345, y: 185 },
        { x: 640, y: 165 },
        { x: 1020, y: 165 },
        { x: 1255, y: 185 },
      ],
      npcs: [
        {
          id: 'su_qingyan',
          name: '苏清晏',
          title: '钦天监司辰女官',
          x: 1475,
          defaultFacing: 1,
        },
      ],
      spawns: [
        { kind: 'scroll_demon', x: 540, y: 220 },
        { kind: 'opera_puppet', x: 760, y: 450 },
        { kind: 'scroll_demon', x: 1060, y: 220 },
        { kind: 'bronze_guard', x: 1195, y: 336 },
      ],
      pickups: [{ id: 'pk_lib_whip1', kind: 'weapon', itemId: 'whip_1', x: 830, y: 252 }],
    },

    {
      id: 'library_shop',
      name: '藏书万宝斋',
      subtitle: '子夜狐商 · 奇门兵甲丹药铺',
      region: 'library',
      bgKey: 'bg_library_opera',
      realm: 'normal',
      indoor: true,
      mapX: 5,
      mapY: 2,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 440,
      special: 'none',
      focalX: 380,
      focalY: 354,
      leftRoomId: 'secret_library_study',
      leftDoorFloorY: 384,
      leftDoorSecretId: 'sec_door_lib',
      rightRoomId: 'upper_library',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 205, y: 384, style: 'stairs' },
        { x: 265, y: 354, style: 'palace_wood' },
        { x: 545, y: 354, style: 'stairs' },
        { x: 605, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'bookshelf', x: 145, y: 384, scale: 0.94 },
        { kind: 'incense_burner', x: 505, y: 354, scale: 0.92 },
        { kind: 'chandelier', x: 395, y: 22, scale: 0.88 },
      ],
      waterZones: [],
      pavilions: [{ x: 255, y: 238, w: 290, hasPillars: true }],
      archways: [],
      torches: [{ x: 650, y: 308 }],
      foregrounds: [{ x: 260, kind: 'hanging_lantern', parallax: 1.18 }],
      lanterns: [
        { x: 175, y: 205 },
        { x: 635, y: 205 },
      ],
      npcs: [
        {
          id: 'bai_zhanggui',
          name: '白掌柜',
          title: '万宝斋狐商',
          x: 380,
          defaultFacing: 1,
        },
      ],
      spawns: [],
      pickups: [],
    },

    {
      id: 'secret_archive',
      name: '望月天机秘阁',
      subtitle: '化雾秘室 · 破妄古镜与名剑墨渊',
      region: 'clock_tower',
      bgKey: 'bg_tower_interior',
      realm: 'normal',
      indoor: true,
      mapX: 9,
      mapY: 1,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 440,
      special: 'relic_pedestal',
      focalX: 455,
      focalY: 322,
      leftRoomId: 'east_outer_tower',
      leftDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 185, y: 384, style: 'stairs' },
        { x: 250, y: 358, style: 'marble' },
        { x: 615, y: 358, style: 'stairs' },
        { x: 675, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      solidBlocks: [
        { x: 330, y: 322, w: 250, h: 36 },
        { x: 105, y: 252, w: 175, h: 28 },
      ],
      clockGears: [{ x: 455, y: 176, radius: 64, speed: 0.44, hasOrbitPlatforms: true }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'bookshelf', x: 145, y: 384, scale: 0.94 },
        { kind: 'dragon_brazier', x: 710, y: 384, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 285, y: 292 },
        { x: 640, y: 316 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 245, y: 185 },
        { x: 645, y: 185 },
      ],
      npcs: [],
      spawns: [],
      pickups: [
        { id: 'pk_mirror_truth', kind: 'ability', itemId: 'mirror_truth', x: 405, y: 322 },
        { id: 'pk_sword_2', kind: 'weapon', itemId: 'sword_2', x: 515, y: 322 },
      ],
    },

    // ==================== 六之二、子夜百戏鬼市 & 天机钟鼓楼（致敬月下：恶魔城礼拜堂/斗技场 & 时计塔） ====================
    {
      id: 'opera_gallery',
      name: '子夜百戏勾栏',
      subtitle: '红绸吊灯与傀儡戏廊',
      region: 'opera',
      bgKey: 'bg_opera_market',
      realm: 'normal',
      indoor: true,
      mapX: 6,
      mapY: 1,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 500,
      special: 'none',
      focalX: 800,
      focalY: 424,
      groundNodes: [
        { x: 0, y: 424, style: 'marble' },
        { x: 260, y: 424, style: 'arch_bridge' },
        { x: 470, y: 380, style: 'arch_bridge' },
        { x: 680, y: 424, style: 'marble' },
        { x: 1350, y: 424, style: 'stairs' },
        { x: 1420, y: 394, style: 'palace_wood' },
        { x: 1535, y: 394, style: 'stairs' },
        { x: 1600, y: 424, style: 'marble' },
      ],
      solidBlocks: [
        { x: 960, y: 336, w: 180, h: 34 },
        { x: 1060, y: 248, w: 180, h: 34 },
        { x: 1120, y: 164, w: 190, h: 32 },
        { x: 1150, y: 86, w: 160, h: 28 },
      ],
      movingPlatforms: [
        {
          x1: 505,
          y1: 256,
          x2: 815,
          y2: 256,
          w: 125,
          speed: 0.82,
          style: 'wood_ferry',
        },
      ],
      ceilingSpans: [
        { x1: 0, x2: 1120, bottomY: 34, style: 'palace_timber' },
        { x1: 1340, x2: 1600, bottomY: 34, style: 'palace_timber' },
      ],
      shafts: [
        { x1: 730, x2: 930, dir: 'down', targetRoomId: 'upper_library' },
        { x1: 1120, x2: 1340, dir: 'up', targetRoomId: 'opera_boss_stage' },
      ],
      secretWalls: [
        {
          id: 'sw_opera_wine',
          x: 38,
          y: 324,
          w: 44,
          h: 100,
          dropKind: 'consumable',
          dropItemId: 'osmanthus_wine',
        },
      ],
      decorProps: [
        { kind: 'silk_banner', x: 150, y: 246, scale: 0.92 },
        { kind: 'chandelier', x: 600, y: 20, scale: 0.92 },
        { kind: 'silk_banner', x: 1475, y: 236, scale: 0.92 },
      ],
      steles: [{ id: 'stele_opera_nuo', x: 190 }],
      waterZones: [{ x1: 280, x2: 660, surfaceY: 430 }],
      pavilions: [
        { x: 175, y: 292, w: 235, hasPillars: true },
        { x: 724, y: 424, w: 212, hasPillars: false },
      ],
      archways: [],
      torches: [
        { x: 470, y: 312 },
        { x: 1445, y: 322 },
      ],
      foregrounds: [{ x: 820, kind: 'hanging_lantern', parallax: 1.2 }],
      lanterns: [
        { x: 470, y: 175 },
        { x: 690, y: 165 },
        { x: 920, y: 175 },
        { x: 1450, y: 210 },
      ],
      npcs: [],
      spawns: [
        { kind: 'opera_puppet', x: 470, y: 380 },
        { kind: 'scroll_demon', x: 660, y: 215 },
        { kind: 'opera_puppet', x: 1465, y: 394 },
      ],
      pickups: [{ id: 'pk_daggers_2', kind: 'weapon', itemId: 'daggers_2', x: 295, y: 292 }],
    },

    {
      id: 'opera_boss_stage',
      name: '惊梦百戏傩台',
      subtitle: '惊梦百戏傩神决战殿',
      region: 'opera',
      bgKey: 'bg_opera_market',
      realm: 'normal',
      indoor: true,
      mapX: 6,
      mapY: 0,
      gridW: 2,
      gridH: 1,
      pixelW: 1500,
      pixelH: 480,
      special: 'boss_room',
      bossKind: 'boss_opera_god',
      storyTriggerId: 'boss_opera_pre',
      focalX: 635,
      focalY: 374,
      leftRoomId: 'relic_grapple_vault',
      leftDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 250, y: 408, style: 'stairs' },
        { x: 330, y: 374, style: 'palace_wood' },
        { x: 940, y: 374, style: 'stairs' },
        { x: 1020, y: 408, style: 'marble' },
        { x: 1500, y: 408, style: 'marble' },
      ],
      solidBlocks: [{ x: 540, y: 258, w: 190, h: 28 }],
      ceilingSpans: [{ x1: 0, x2: 1500, bottomY: 36, style: 'palace_timber' }],
      shafts: [{ x1: 1080, x2: 1300, dir: 'down', targetRoomId: 'opera_gallery' }],
      decorProps: [
        { kind: 'silk_banner', x: 165, y: 248, scale: 0.9 },
        { kind: 'dragon_brazier', x: 365, y: 374, scale: 0.92 },
        { kind: 'dragon_brazier', x: 905, y: 374, scale: 0.92 },
        { kind: 'silk_banner', x: 1360, y: 248, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [
        { x: 85, y: 284, w: 195, hasPillars: true },
        { x: 1074, y: 408, w: 232, hasPillars: false },
        { x: 1315, y: 284, w: 155, hasPillars: true },
      ],
      archways: [],
      torches: [
        { x: 215, y: 340 },
        { x: 1385, y: 340 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 420, y: 175 },
        { x: 635, y: 155 },
        { x: 850, y: 175 },
      ],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    {
      id: 'relic_grapple_vault',
      name: '飞燕绫罗秘阁',
      subtitle: '墨家飞燕钩锁与紫电九节鞭',
      region: 'opera',
      bgKey: 'bg_opera_market',
      realm: 'normal',
      indoor: true,
      mapX: 5,
      mapY: 0,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 440,
      special: 'relic_pedestal',
      focalX: 385,
      focalY: 276,
      rightRoomId: 'opera_boss_stage',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 175, y: 384, style: 'stairs' },
        { x: 235, y: 416, style: 'crypt_stone' },
        { x: 555, y: 416, style: 'stairs' },
        { x: 615, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      solidBlocks: [
        { x: 65, y: 348, w: 135, h: 36 },
        { x: 255, y: 276, w: 260, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'silk_banner', x: 135, y: 235, scale: 0.88 },
        { kind: 'incense_burner', x: 695, y: 384, scale: 0.9 },
      ],
      waterZones: [{ x1: 215, x2: 575, surfaceY: 402 }],
      pavilions: [{ x: 555, y: 296, w: 175, hasPillars: true }],
      archways: [],
      torches: [
        { x: 145, y: 318 },
        { x: 640, y: 318 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 215, y: 172 },
        { x: 390, y: 154 },
        { x: 565, y: 172 },
      ],
      npcs: [],
      spawns: [],
      pickups: [
        { id: 'pk_relic_grapple', kind: 'ability', itemId: 'grapple_hook', x: 330, y: 276 },
        { id: 'pk_whip_2', kind: 'weapon', itemId: 'whip_2', x: 445, y: 276 },
      ],
    },

    {
      id: 'clock_gear_hall',
      name: '浑天铜轮机巧廊',
      subtitle: '旋转青铜齿轮与龙胆亮银枪',
      region: 'clock_tower',
      bgKey: 'bg_tower_interior',
      realm: 'normal',
      indoor: true,
      mapX: 9,
      mapY: 2,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'none',
      focalX: 400,
      focalY: 442,
      leftRoomId: 'east_outer_tower',
      leftDoorFloorY: 408,
      rightRoomId: 'clock_boss_spire',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 145, y: 408, style: 'stairs' },
        { x: 210, y: 442, style: 'crypt_stone' },
        { x: 590, y: 442, style: 'stairs' },
        { x: 655, y: 408, style: 'marble' },
        { x: 800, y: 408, style: 'marble' },
      ],
      solidBlocks: [
        { x: 105, y: 316, w: 155, h: 32 },
        { x: 320, y: 224, w: 160, h: 32 },
        { x: 540, y: 316, w: 155, h: 32 },
      ],
      clockGears: [
        { x: 245, y: 226, radius: 74, speed: 0.65, hasOrbitPlatforms: true },
        { x: 400, y: 356, radius: 58, speed: -0.78, hasOrbitPlatforms: false },
        { x: 555, y: 226, radius: 74, speed: -0.65, hasOrbitPlatforms: true },
      ],
      movingPlatforms: [
        {
          x1: 350,
          y1: 396,
          x2: 350,
          y2: 266,
          w: 100,
          speed: 0.85,
          style: 'bronze_lift',
        },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 34, style: 'palace_timber' }],
      shafts: [],
      decorProps: [],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 130, y: 332 },
        { x: 670, y: 332 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 155, y: 185 },
        { x: 645, y: 185 },
      ],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 320, y: 190 },
        { kind: 'bronze_guard', x: 700, y: 408 },
      ],
      pickups: [
        { id: 'pk_spear_2', kind: 'weapon', itemId: 'spear_2', x: 400, y: 224 },
        { id: 'pk_sub_seal', kind: 'weapon', itemId: 'sub:mountain_seal', x: 615, y: 316 },
      ],
    },

    {
      id: 'clock_boss_spire',
      name: '雷音镇钟天阙',
      subtitle: '洪武巨钟 · 雷音金翅大鹏王决战殿',
      region: 'clock_tower',
      bgKey: 'bg_tower_interior',
      realm: 'normal',
      indoor: true,
      mapX: 10,
      mapY: 2,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'boss_room',
      bossKind: 'boss_thunder_yaksha',
      storyTriggerId: 'boss_yaksha_pre',
      focalX: 500,
      focalY: 378,
      leftRoomId: 'clock_gear_hall',
      leftDoorFloorY: 408,
      rightRoomId: 'secret_thunder_vault',
      rightDoorFloorY: 408,
      rightDoorSecretId: 'sec_door_thunder',
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 170, y: 408, style: 'stairs' },
        { x: 235, y: 378, style: 'marble' },
        { x: 575, y: 378, style: 'stairs' },
        { x: 640, y: 408, style: 'marble' },
        { x: 800, y: 408, style: 'marble' },
      ],
      solidBlocks: [
        { x: 120, y: 314, w: 150, h: 32 },
        { x: 210, y: 232, w: 150, h: 32 },
        { x: 285, y: 152, w: 155, h: 30 },
        { x: 325, y: 80, w: 155, h: 26 },
      ],
      clockGears: [{ x: 645, y: 148, radius: 56, speed: -0.48, hasOrbitPlatforms: false }],
      ceilingSpans: [
        { x1: 0, x2: 310, bottomY: 34, style: 'palace_timber' },
        { x1: 510, x2: 800, bottomY: 34, style: 'palace_timber' },
      ],
      shafts: [
        {
          x1: 310,
          x2: 510,
          dir: 'up',
          targetRoomId: 'relic_wall_vault',
          requireBossClear: true,
        },
      ],
      decorProps: [
        { kind: 'giant_bell', x: 665, y: 255, scale: 0.96 },
        { kind: 'dragon_brazier', x: 545, y: 378, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 95, y: 340 },
        { x: 715, y: 340 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 195, y: 175 },
        { x: 585, y: 185 },
      ],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    {
      id: 'relic_wall_vault',
      name: '云梯古武秘阁',
      subtitle: '壁虎游墙功与九幽噬魂禁卷',
      region: 'clock_tower',
      bgKey: 'bg_tower_interior',
      realm: 'normal',
      indoor: true,
      mapX: 10,
      mapY: 1,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'relic_pedestal',
      focalX: 220,
      focalY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'marble' },
        { x: 530, y: 396, style: 'stairs' },
        { x: 590, y: 364, style: 'marble' },
        { x: 745, y: 364, style: 'stairs' },
        { x: 800, y: 396, style: 'marble' },
      ],
      solidBlocks: [{ x: 575, y: 328, w: 185, h: 36 }],
      climbWalls: [
        { x: 70, topY: 128, bottomY: 396 },
        { x: 228, topY: 128, bottomY: 336 },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [{ x1: 310, x2: 510, dir: 'down', targetRoomId: 'clock_boss_spire' }],
      decorProps: [{ kind: 'incense_burner', x: 265, y: 396, scale: 0.9 }],
      waterZones: [],
      pavilions: [
        { x: 84, y: 168, w: 130, hasPillars: false },
        { x: 304, y: 396, w: 212, hasPillars: false },
      ],
      archways: [],
      torches: [
        { x: 165, y: 328 },
        { x: 545, y: 328 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 148, y: 118 },
        { x: 665, y: 205 },
      ],
      npcs: [],
      spawns: [],
      pickups: [
        { id: 'pk_relic_walljump', kind: 'ability', itemId: 'wall_jump', x: 620, y: 328 },
        { id: 'pk_scroll_soulsteal', kind: 'skill_scroll', itemId: 'jiuyou_soulsteal', x: 715, y: 328 },
      ],
    },

    // ==================== 七、云端天守祭天坛（致敬月下：恶魔城最上部 -> 王座决战 -> 开启180°倒悬里城！） ====================
    {
      id: 'altar_save',
      name: '观星登坛古祠',
      subtitle: '祭天坛前留档室',
      region: 'altar',
      bgKey: 'bg_sky_altar',
      realm: 'normal',
      indoor: false,
      mapX: 8,
      mapY: 0,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'save_shrine',
      warpName: '观星登坛古祠',
      focalX: 162,
      focalY: 364,
      rightRoomId: 'sky_altar',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'marble' },
        { x: 45, y: 396, style: 'stairs' },
        { x: 95, y: 364, style: 'marble' },
        { x: 230, y: 364, style: 'stairs' },
        { x: 280, y: 396, style: 'marble' },
        { x: 800, y: 396, style: 'marble' },
      ],
      ceilingSpans: [],
      shafts: [{ x1: 290, x2: 510, dir: 'down', targetRoomId: 'east_outer_tower' }],
      decorProps: [{ kind: 'dragon_brazier', x: 635, y: 396, scale: 0.92 }],
      waterZones: [],
      pavilions: [
        { x: 284, y: 396, w: 232, hasPillars: false },
        { x: 545, y: 274, w: 195, hasPillars: true },
      ],
      archways: [{ x: 705, title: '凌霄封天坛' }],
      torches: [
        { x: 540, y: 318 },
        { x: 690, y: 318 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 162, y: 195 },
        { x: 642, y: 185 },
      ],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    {
      id: 'sky_altar',
      name: '凌霄祭天坛',
      subtitle: '九幽天顶 · 魁首决战与乾坤倒悬枢机',
      region: 'altar',
      bgKey: 'bg_sky_altar',
      realm: 'normal',
      mapX: 9,
      mapY: 0,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 500,
      special: 'boss_room',
      bossKind: 'boss_pei_wuji',
      storyTriggerId: 'boss_pei_pre',
      focalX: 1080,
      focalY: 326,
      leftRoomId: 'altar_save',
      leftDoorFloorY: 424,
      // 致敬月下伯爵王座前长阶：三层汉白玉圜丘丹陛拾级而上登临 326 祭天极顶！
      groundNodes: [
        { x: 0, y: 424, style: 'marble' },
        { x: 220, y: 424, style: 'stairs' },
        { x: 320, y: 388, style: 'marble' },
        { x: 450, y: 388, style: 'stairs' },
        { x: 560, y: 352, style: 'marble' },
        { x: 700, y: 352, style: 'stairs' },
        { x: 800, y: 326, style: 'marble' },
        { x: 1320, y: 326, style: 'stairs' },
        { x: 1410, y: 340, style: 'marble' },
        { x: 1600, y: 340, style: 'marble' },
      ],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 835, y: 326, scale: 0.95 },
        { kind: 'dragon_brazier', x: 1285, y: 326, scale: 0.95 },
      ],
      waterZones: [],
      pavilions: [
        { x: 335, y: 262, w: 190, hasPillars: false },
        { x: 965, y: 214, w: 220, hasPillars: false },
      ],
      archways: [{ x: 190, title: '凌霄登天阙' }],
      torches: [
        { x: 140, y: 348 },
        { x: 385, y: 312 },
        { x: 860, y: 250 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 430, y: 185 },
        { x: 760, y: 195 },
        { x: 1075, y: 145 },
        { x: 1380, y: 205 },
      ],
      npcs: [],
      spawns: [],
      pickups: [],
    },
  ];

  // ==================== 八、14×7 迷宫外围翼区拓展 + 7 座破壁进入的独立隐藏密室（致敬月下 200.6%+ 超额探索！） ====================
  const expandedRooms: BuiltRoom[] = [
    // 1. 城西断崖古亭（起始桥西侧探索区）
    {
      id: 'bamboo_outpost',
      name: '苍竹断崖古亭',
      subtitle: '西郊悬崖 · 侠客古碑与烈酒藏瓮',
      region: 'gatehouse',
      bgKey: 'bg_bamboo_cliff',
      realm: 'normal',
      mapX: 0,
      mapY: 3,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'none',
      focalX: 400,
      focalY: 404,
      rightRoomId: 'entrance_bamboo_woods',
      rightDoorFloorY: 404,
      groundNodes: [
        { x: 0, y: 362, style: 'flagstone' },
        { x: 245, y: 362, style: 'stairs' },
        { x: 325, y: 422, style: 'crypt_stone' },
        { x: 525, y: 422, style: 'stairs' },
        { x: 595, y: 404, style: 'flagstone' },
        { x: 800, y: 404, style: 'flagstone' },
      ],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'guardian_statue', x: 75, y: 362, scale: 0.92 },
        { kind: 'dragon_brazier', x: 605, y: 404, scale: 0.9 },
      ],
      steles: [{ id: 'stele_outpost_oath', x: 665 }],
      waterZones: [{ x1: 315, x2: 535, surfaceY: 408 }],
      pavilions: [
        { x: 55, y: 256, w: 195, hasPillars: true },
        { x: 355, y: 394, w: 145, hasPillars: false },
      ],
      archways: [{ x: 710, title: '苍竹古亭' }],
      torches: [
        { x: 245, y: 288 },
        { x: 635, y: 328 },
      ],
      foregrounds: [{ x: 260, kind: 'hanging_lantern', parallax: 1.18 }],
      lanterns: [
        { x: 340, y: 215 },
        { x: 520, y: 225 },
      ],
      npcs: [],
      spawns: [
        { kind: 'paper_swordsman', x: 615, y: 404 },
        { kind: 'lantern_ghost', x: 340, y: 255 },
      ],
      pickups: [
        { id: 'pk_outpost_wine', kind: 'consumable', itemId: 'tiger_bone_wine', x: 115, y: 256 },
        { id: 'pk_outpost_heal', kind: 'consumable', itemId: 'jinchuang_yao', x: 195, y: 256 },
      ],
    },

    // 2. 独立隐藏密室一：玄武封甲库（由镇军西武库西端暗裂古壁破开进入！）
    {
      id: 'secret_armory_vault',
      name: '玄武封甲秘室',
      subtitle: '独立隐藏密室 · 前朝镇岳重铠封藏处',
      region: 'alchemy',
      bgKey: 'bg_alchemy_palace',
      realm: 'normal',
      indoor: true,
      isSecretRoom: true,
      mapX: 1,
      mapY: 2,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 440,
      special: 'relic_pedestal',
      focalX: 385,
      focalY: 262,
      rightRoomId: 'west_armory',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 195, y: 384, style: 'stairs' },
        { x: 255, y: 414, style: 'crypt_stone' },
        { x: 545, y: 414, style: 'stairs' },
        { x: 605, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      solidBlocks: [
        { x: 65, y: 336, w: 135, h: 48 },
        { x: 595, y: 336, w: 135, h: 48 },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'guardian_statue', x: 130, y: 336, scale: 0.92 },
        { kind: 'weapon_rack', x: 325, y: 414, scale: 0.94 },
        { kind: 'weapon_rack', x: 465, y: 414, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [{ x: 245, y: 262, w: 290, hasPillars: true }],
      archways: [],
      torches: [
        { x: 205, y: 306 },
        { x: 575, y: 306 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 200, y: 185 },
        { x: 580, y: 185 },
      ],
      npcs: [],
      spawns: [],
      pickups: [
        { id: 'pk_sec_tortoise_mail', kind: 'armor', itemId: 'black_tortoise_mail', x: 335, y: 262 },
        { id: 'pk_sec_arm_wine', kind: 'consumable', itemId: 'tiger_bone_wine', x: 445, y: 262 },
      ],
    },

    // 3. 独立隐藏密室二：赤火藏锋剑冢（由地肺玄钧秘坛东侧暗壁破开进入！）
    {
      id: 'secret_forge_smeltery',
      name: '赤火藏锋剑冢',
      subtitle: '独立隐藏密室 · 欧冶地肺私藏软鞭秘窟',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      isSecretRoom: true,
      mapX: 2,
      mapY: 5,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'relic_pedestal',
      focalX: 505,
      focalY: 344,
      leftRoomId: 'relic_ground_slam',
      leftDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 145, y: 408, style: 'stairs' },
        { x: 205, y: 444, style: 'crypt_stone' },
        { x: 315, y: 444, style: 'stairs' },
        { x: 410, y: 380, style: 'marble' },
        { x: 625, y: 380, style: 'stairs' },
        { x: 685, y: 408, style: 'crypt_stone' },
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 215, y: 344, w: 125, h: 28 },
        { x: 425, y: 344, w: 175, h: 36 },
      ],
      clockGears: [{ x: 510, y: 196, radius: 64, speed: 0.52, hasOrbitPlatforms: true }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 115, y: 408, scale: 0.94 },
        { kind: 'weapon_rack', x: 715, y: 408, scale: 0.94 },
      ],
      waterZones: [{ x1: 195, x2: 355, surfaceY: 428, liquidKind: 'lava' }],
      pavilions: [],
      archways: [],
      torches: [{ x: 645, y: 312 }],
      foregrounds: [],
      lanterns: [
        { x: 275, y: 205 },
        { x: 685, y: 215 },
      ],
      npcs: [],
      spawns: [],
      pickups: [
        { id: 'pk_sec_whip_fire', kind: 'weapon', itemId: 'whip_fire', x: 465, y: 344 },
        { id: 'pk_sec_jingang', kind: 'consumable', itemId: 'jingang_dan', x: 555, y: 344 },
      ],
    },

    // 4. 九幽白骨冥廊（深层地底墓穴长廊，致敬月下地下墓地 Catacombs！）
    {
      id: 'catacomb_hall',
      name: '九幽白骨冥廊',
      subtitle: '深层古墓 · 蚀骨毒刺与镇墓铜甲卫',
      region: 'catacomb',
      bgKey: 'bg_catacomb_tomb',
      realm: 'normal',
      indoor: true,
      mapX: 3,
      mapY: 6,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 500,
      special: 'none',
      focalX: 830,
      focalY: 388,
      leftRoomId: 'secret_catacomb_treasury',
      leftDoorFloorY: 420,
      leftDoorSecretId: 'sec_door_mojin',
      rightRoomId: 'catacomb_shrine',
      rightDoorFloorY: 420,
      groundNodes: [
        { x: 0, y: 420, style: 'crypt_stone' },
        { x: 430, y: 420, style: 'stairs' },
        { x: 510, y: 450, style: 'crypt_stone' },
        { x: 675, y: 450, style: 'stairs' },
        { x: 775, y: 388, style: 'marble' },
        { x: 995, y: 388, style: 'stairs' },
        { x: 1095, y: 452, style: 'crypt_stone' },
        { x: 1365, y: 452, style: 'stairs' },
        { x: 1445, y: 420, style: 'crypt_stone' },
        { x: 1600, y: 420, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 520, y: 336, w: 160, h: 32 },
        { x: 430, y: 252, w: 160, h: 32 },
        { x: 340, y: 168, w: 160, h: 30 },
        { x: 245, y: 86, w: 145, h: 26 },
      ],
      movingPlatforms: [
        {
          x1: 1095,
          y1: 396,
          x2: 1265,
          y2: 396,
          w: 115,
          speed: 0.78,
          style: 'wood_ferry',
        },
      ],
      ceilingSpans: [
        { x1: 0, x2: 220, bottomY: 34, style: 'crypt_vault' },
        { x1: 400, x2: 1600, bottomY: 34, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 220, x2: 400, dir: 'up', targetRoomId: 'prison_waterway' }],
      decorProps: [
        { kind: 'guardian_statue', x: 145, y: 420, scale: 0.92 },
        { kind: 'dragon_brazier', x: 830, y: 388, scale: 0.9 },
        { kind: 'guardian_statue', x: 1485, y: 420, scale: 0.92 },
      ],
      steles: [{ id: 'stele_catacomb_origin', x: 925 }],
      waterZones: [
        { x1: 495, x2: 705, surfaceY: 436 },
        { x1: 1085, x2: 1375, surfaceY: 438 },
      ],
      pavilions: [{ x: 1090, y: 296, w: 230, hasPillars: true }],
      archways: [],
      torches: [
        { x: 690, y: 342 },
        { x: 900, y: 312 },
        { x: 1455, y: 342 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 600, y: 220 },
        { x: 895, y: 205 },
        { x: 1205, y: 185 },
        { x: 1460, y: 225 },
      ],
      npcs: [],
      spawns: [
        { kind: 'corpse_soldier', x: 390, y: 420 },
        { kind: 'plague_toad', x: 600, y: 450 },
        { kind: 'bone_archer', x: 880, y: 388 },
        { kind: 'bronze_guard', x: 1205, y: 296 },
        { kind: 'blood_bat', x: 1380, y: 215 },
      ],
      pickups: [
        { id: 'pk_cat_poison_dag', kind: 'weapon', itemId: 'daggers_poison', x: 1205, y: 296 },
      ],
    },

    // 5. 独立隐藏密室三：摸金古墓宝库（由九幽白骨冥廊西端暗壁破开进入！）
    {
      id: 'secret_catacomb_treasury',
      name: '摸金古墓宝库',
      subtitle: '独立隐藏密室 · 摸金寻宝天师符秘冢',
      region: 'catacomb',
      bgKey: 'bg_catacomb_tomb',
      realm: 'normal',
      indoor: true,
      isSecretRoom: true,
      mapX: 2,
      mapY: 6,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'relic_pedestal',
      focalX: 395,
      focalY: 344,
      rightRoomId: 'catacomb_hall',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'crypt_stone' },
        { x: 145, y: 396, style: 'stairs' },
        { x: 205, y: 428, style: 'crypt_stone' },
        { x: 585, y: 428, style: 'stairs' },
        { x: 645, y: 396, style: 'crypt_stone' },
        { x: 800, y: 396, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 265, y: 384, w: 260, h: 44 },
        { x: 310, y: 344, w: 170, h: 40 },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'guardian_statue', x: 105, y: 396, scale: 0.94 },
        { kind: 'incense_burner', x: 685, y: 396, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [
        { x: 65, y: 274, w: 165, hasPillars: false },
        { x: 570, y: 274, w: 165, hasPillars: false },
      ],
      archways: [],
      torches: [
        { x: 255, y: 318 },
        { x: 535, y: 318 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 255, y: 195 },
        { x: 535, y: 195 },
      ],
      npcs: [],
      spawns: [],
      pickups: [
        { id: 'pk_sec_mojin', kind: 'armor', itemId: 'mojin_talisman', x: 355, y: 344 },
        { id: 'pk_sec_cat_hp', kind: 'max_up', itemId: 'hp_vessel', x: 435, y: 344 },
      ],
    },

    // 6. 冥廊镇魂碑林（冥廊东端古墓祭堂，供奉贪狼饮血古玉）
    {
      id: 'catacomb_shrine',
      name: '冥廊镇魂碑林',
      subtitle: '古墓深处 · 贪狼饮血古玉祭坛',
      region: 'catacomb',
      bgKey: 'bg_catacomb_tomb',
      realm: 'normal',
      indoor: true,
      mapX: 5,
      mapY: 6,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'relic_pedestal',
      focalX: 565,
      focalY: 336,
      leftRoomId: 'catacomb_hall',
      leftDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'crypt_stone' },
        { x: 135, y: 396, style: 'stairs' },
        { x: 190, y: 422, style: 'crypt_stone' },
        { x: 345, y: 422, style: 'stairs' },
        { x: 420, y: 372, style: 'marble' },
        { x: 695, y: 372, style: 'stairs' },
        { x: 750, y: 396, style: 'crypt_stone' },
        { x: 800, y: 396, style: 'crypt_stone' },
      ],
      solidBlocks: [{ x: 475, y: 336, w: 190, h: 36 }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 245, y: 422, scale: 0.92 },
        { kind: 'guardian_statue', x: 700, y: 372, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [{ x: 120, y: 282, w: 195, hasPillars: true }],
      archways: [],
      torches: [{ x: 385, y: 306 }],
      foregrounds: [],
      lanterns: [
        { x: 380, y: 195 },
        { x: 570, y: 185 },
      ],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 275, y: 422 },
        { kind: 'scroll_demon', x: 540, y: 215 },
      ],
      pickups: [
        { id: 'pk_shrine_wolf_jade', kind: 'armor', itemId: 'greedy_wolf_jade', x: 570, y: 336 },
      ],
    },

    // 7. 独立隐藏密室四：寒髓冰泉秘洞（由玄鸟秘宝冢东侧暗壁破开进入！）
    {
      id: 'secret_ice_spring',
      name: '寒髓冰泉秘洞',
      subtitle: '独立隐藏密室 · 玄冥寒魄名剑封冰坛',
      region: 'prison',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      indoor: true,
      isSecretRoom: true,
      mapX: 9,
      mapY: 5,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'relic_pedestal',
      focalX: 355,
      focalY: 280,
      leftRoomId: 'relic_mist_vault',
      leftDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 165, y: 408, style: 'arch_bridge' },
        { x: 355, y: 368, style: 'arch_bridge' },
        { x: 545, y: 408, style: 'crypt_stone' },
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [{ x: 555, y: 368, w: 165, h: 40 }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      waterZones: [{ x1: 180, x2: 530, surfaceY: 416 }],
      decorProps: [{ kind: 'guardian_statue', x: 745, y: 408, scale: 0.92 }],
      pavilions: [{ x: 245, y: 280, w: 220, hasPillars: false }],
      archways: [],
      torches: [{ x: 120, y: 326 }],
      foregrounds: [],
      lanterns: [
        { x: 185, y: 185 },
        { x: 585, y: 195 },
      ],
      npcs: [],
      spawns: [],
      pickups: [
        { id: 'pk_sec_sword_frost', kind: 'weapon', itemId: 'sword_frost', x: 355, y: 280 },
        { id: 'pk_sec_jiuzhuan_1', kind: 'consumable', itemId: 'jiuzhuan_jin_dan', x: 635, y: 368 },
      ],
    },

    // 8. 独立隐藏密室五：翰林藏珍暗阁（由藏书万宝斋西侧书架暗壁破开进入！）
    {
      id: 'secret_library_study',
      name: '翰林藏珍暗阁',
      subtitle: '独立隐藏密室 · 水墨道袍与天山雪莲密库',
      region: 'library',
      bgKey: 'bg_library_opera',
      realm: 'normal',
      indoor: true,
      isSecretRoom: true,
      mapX: 5,
      mapY: 2,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 440,
      special: 'relic_pedestal',
      focalX: 265,
      focalY: 254,
      rightRoomId: 'library_shop',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 352, style: 'palace_wood' },
        { x: 435, y: 352, style: 'stairs' },
        { x: 505, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      solidBlocks: [{ x: 395, y: 312, w: 110, h: 40 }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'bookshelf', x: 95, y: 352, scale: 0.95 },
        { kind: 'chandelier', x: 380, y: 22, scale: 0.88 },
        { kind: 'bookshelf', x: 655, y: 384, scale: 0.95 },
      ],
      steles: [{ id: 'stele_library_star', x: 565 }],
      waterZones: [],
      pavilions: [{ x: 130, y: 254, w: 255, hasPillars: true }],
      archways: [],
      torches: [{ x: 545, y: 308 }],
      foregrounds: [],
      lanterns: [
        { x: 455, y: 185 },
        { x: 635, y: 195 },
      ],
      npcs: [],
      spawns: [],
      pickups: [
        { id: 'pk_sec_ink_robe', kind: 'armor', itemId: 'ink_scholar_robe', x: 195, y: 254 },
        { id: 'pk_sec_lib_mp', kind: 'max_up', itemId: 'mp_vessel', x: 315, y: 254 },
        { id: 'pk_sec_shenxing', kind: 'consumable', itemId: 'shenxing_san', x: 245, y: 352 },
      ],
    },

    // 9. 东垣观星飞虹桥（东垣传送室东侧露天星汉廊桥，连接城东最深处的太白剑冢！）
    {
      id: 'observatory_bridge',
      name: '东垣观星飞虹桥',
      subtitle: '星汉长桥 · 天罡聚气扳指与飞燕宫灯',
      region: 'clock_tower',
      bgKey: 'bg_chapel_spire',
      realm: 'normal',
      mapX: 11,
      mapY: 3,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 500,
      special: 'none',
      focalX: 800,
      focalY: 412,
      leftRoomId: 'east_warp',
      leftDoorFloorY: 412,
      rightRoomId: 'secret_sword_tomb',
      rightDoorFloorY: 412,
      rightDoorSecretId: 'sec_door_lotus',
      groundNodes: [
        { x: 0, y: 412, style: 'marble' },
        { x: 135, y: 412, style: 'stairs' },
        { x: 205, y: 388, style: 'marble' },
        { x: 385, y: 388, style: 'stairs' },
        { x: 455, y: 412, style: 'marble' },
        { x: 495, y: 412, style: 'arch_bridge' },
        { x: 800, y: 364, style: 'arch_bridge' },
        { x: 1105, y: 412, style: 'marble' },
        { x: 1145, y: 412, style: 'stairs' },
        { x: 1215, y: 388, style: 'marble' },
        { x: 1395, y: 388, style: 'stairs' },
        { x: 1465, y: 412, style: 'marble' },
        { x: 1600, y: 412, style: 'marble' },
      ],
      movingPlatforms: [
        {
          x1: 390,
          y1: 288,
          x2: 525,
          y2: 248,
          w: 115,
          speed: 0.76,
          style: 'wood_ferry',
        },
        {
          x1: 960,
          y1: 248,
          x2: 1095,
          y2: 288,
          w: 115,
          speed: 0.76,
          phase: 3.14,
          style: 'wood_ferry',
        },
      ],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 220, y: 388, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1380, y: 388, scale: 0.92 },
      ],
      steles: [{ id: 'stele_observatory_mirror', x: 310 }],
      waterZones: [{ x1: 510, x2: 1090, surfaceY: 420 }],
      pavilions: [{ x: 665, y: 224, w: 270, hasPillars: false }],
      archways: [{ x: 1500, title: '望月观星阙' }],
      torches: [
        { x: 365, y: 312 },
        { x: 1235, y: 312 },
      ],
      foregrounds: [{ x: 800, kind: 'hanging_lantern', parallax: 1.18 }],
      lanterns: [
        { x: 380, y: 195 },
        { x: 620, y: 165 },
        { x: 980, y: 165 },
        { x: 1220, y: 195 },
      ],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 580, y: 235 },
        { kind: 'opera_puppet', x: 1280, y: 388 },
      ],
      pickups: [
        { id: 'pk_obs_qi_ring', kind: 'armor', itemId: 'celestial_qi_ring', x: 800, y: 224 },
      ],
    },

    // 10. 独立隐藏密室六：青莲太白剑冢（由观星飞虹桥尽头暗壁破开进入；倒悬里城此室更封藏终极千影神剑！）
    {
      id: 'secret_sword_tomb',
      name: '青莲太白剑冢',
      subtitle: '独立隐藏密室 · 剑仙遗蜕与仙丹洞天',
      region: 'clock_tower',
      bgKey: 'bg_tower_interior',
      realm: 'normal',
      indoor: true,
      isSecretRoom: true,
      mapX: 13,
      mapY: 3,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'relic_pedestal',
      focalX: 500,
      focalY: 342,
      leftRoomId: 'observatory_bridge',
      leftDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'marble' },
        { x: 135, y: 396, style: 'stairs' },
        { x: 195, y: 428, style: 'crypt_stone' },
        { x: 320, y: 428, style: 'stairs' },
        { x: 390, y: 380, style: 'marble' },
        { x: 615, y: 380, style: 'stairs' },
        { x: 685, y: 412, style: 'crypt_stone' },
        { x: 750, y: 396, style: 'marble' },
        { x: 800, y: 396, style: 'marble' },
      ],
      solidBlocks: [{ x: 415, y: 342, w: 185, h: 38 }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'weapon_rack', x: 255, y: 428, scale: 0.95 },
        { kind: 'weapon_rack', x: 605, y: 380, scale: 0.95 },
        { kind: 'guardian_statue', x: 735, y: 396, scale: 0.95 },
      ],
      steles: [{ id: 'stele_sword_tomb', x: 115 }],
      waterZones: [],
      pavilions: [
        { x: 115, y: 274, w: 170, hasPillars: false },
        { x: 605, y: 274, w: 155, hasPillars: false },
      ],
      archways: [],
      torches: [
        { x: 270, y: 318 },
        { x: 625, y: 318 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 335, y: 195 },
        { x: 565, y: 185 },
      ],
      npcs: [],
      spawns: [],
      pickups: [
        { id: 'pk_sec_tomb_hp', kind: 'max_up', itemId: 'hp_vessel', x: 455, y: 342 },
        { id: 'pk_sec_tomb_mp', kind: 'max_up', itemId: 'mp_vessel', x: 545, y: 342 },
        { id: 'pk_sec_tomb_jz', kind: 'consumable', itemId: 'jiuzhuan_jin_dan', x: 680, y: 274 },
      ],
    },

    // 11. 独立隐藏密室七：紫电雷池秘殿（由雷音镇钟天阙东壁破开进入，供奉紫电惊雷神枪！）
    {
      id: 'secret_thunder_vault',
      name: '紫电雷池秘殿',
      subtitle: '独立隐藏密室 · 紫电惊雷神枪封藏坛',
      region: 'clock_tower',
      bgKey: 'bg_tower_interior',
      realm: 'normal',
      indoor: true,
      isSecretRoom: true,
      mapX: 12,
      mapY: 2,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'relic_pedestal',
      focalX: 635,
      focalY: 344,
      leftRoomId: 'clock_boss_spire',
      leftDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 145, y: 408, style: 'stairs' },
        { x: 210, y: 442, style: 'crypt_stone' },
        { x: 445, y: 442, style: 'stairs' },
        { x: 540, y: 382, style: 'marble' },
        { x: 725, y: 382, style: 'stairs' },
        { x: 775, y: 408, style: 'marble' },
        { x: 800, y: 408, style: 'marble' },
      ],
      solidBlocks: [{ x: 555, y: 344, w: 165, h: 38 }],
      clockGears: [{ x: 335, y: 248, radius: 68, speed: 0.62, hasOrbitPlatforms: true }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 115, y: 408, scale: 0.94 },
        { kind: 'giant_bell', x: 640, y: 215, scale: 0.9 },
      ],
      waterZones: [{ x1: 195, x2: 475, surfaceY: 426 }],
      pavilions: [],
      archways: [],
      torches: [{ x: 145, y: 328 }],
      foregrounds: [],
      lanterns: [
        { x: 215, y: 195 },
        { x: 495, y: 195 },
      ],
      npcs: [],
      spawns: [],
      pickups: [
        { id: 'pk_sec_spear_thunder', kind: 'weapon', itemId: 'spear_thunder', x: 605, y: 344 },
        { id: 'pk_sec_thun_wine', kind: 'consumable', itemId: 'tiger_bone_wine', x: 685, y: 344 },
      ],
    },
  ];

  // 全城差异化《恶魔城》式区域机关与陷阱（寒铁地刺、钟楼斩仙摆斧、地肺间歇火柱、龟裂踏陷石板）
  const roomHazardLayouts: Record<
    string,
    { hazards?: RoomHazardDef[]; crumbleSlabs?: CrumbleSlabDef[] }
  > = {
    gate_2: {
      hazards: [{ kind: 'spikes', x: 675, y: 456, span: 95 }],
      crumbleSlabs: [{ id: 'cs_gate2_1', x: 585, y: 340, w: 115 }],
    },
    alchemy_lab: {
      hazards: [
        { kind: 'pendulum', x: 960, y: 32, span: 150, speed: 1.85, phase: 0.4 },
      ],
      crumbleSlabs: [{ id: 'cs_alch_1', x: 185, y: 342, w: 115 }],
    },
    west_armory: {
      hazards: [{ kind: 'pendulum', x: 400, y: 36, span: 142, speed: 1.9, phase: 1.2 }],
      crumbleSlabs: [{ id: 'cs_warm_1', x: 38, y: 316, w: 96 }],
    },
    hall_corridor: {
      hazards: [{ kind: 'pendulum', x: 1380, y: 26, span: 162, speed: 1.8, phase: 0.8 }],
      crumbleSlabs: [{ id: 'cs_hall_1', x: 685, y: 248, w: 120 }],
    },
    forge_smithy: {
      hazards: [{ kind: 'fire_vent', x: 150, y: 428, span: 128, speed: 3.5, phase: 0.5 }],
    },
    forge_molten_hall: {
      hazards: [
        { kind: 'fire_vent', x: 320, y: 408, span: 142, speed: 3.4, phase: 0 },
        { kind: 'fire_vent', x: 480, y: 408, span: 142, speed: 3.4, phase: 1.7 },
      ],
    },
    secret_forge_smeltery: {
      hazards: [{ kind: 'fire_vent', x: 265, y: 432, span: 135, speed: 3.2, phase: 0.9 }],
    },
    prison_waterway: {
      hazards: [{ kind: 'pendulum', x: 1035, y: 32, span: 158, speed: 1.75, phase: 0.3 }],
      crumbleSlabs: [
        { id: 'cs_pris_1', x: 635, y: 356, w: 115 },
        { id: 'cs_pris_2', x: 1300, y: 288, w: 110 },
      ],
    },
    east_outer_tower: {
      hazards: [
        { kind: 'pendulum', x: 400, y: 840, span: 145, speed: 1.9, phase: 0 },
        { kind: 'pendulum', x: 400, y: 440, span: 140, speed: 2.05, phase: 1.6 },
      ],
      crumbleSlabs: [
        { id: 'cs_tow_1', x: 375, y: 1356, w: 105 },
        { id: 'cs_tow_2', x: 205, y: 634, w: 110 },
      ],
    },
    upper_library: {
      crumbleSlabs: [
        { id: 'cs_lib_1', x: 590, y: 336, w: 105 },
        { id: 'cs_lib_2', x: 965, y: 336, w: 105 },
      ],
    },
    opera_gallery: {
      hazards: [{ kind: 'pendulum', x: 830, y: 34, span: 152, speed: 1.85, phase: 1.1 }],
      crumbleSlabs: [{ id: 'cs_op_1', x: 430, y: 292, w: 105 }],
    },
    clock_gear_hall: {
      hazards: [
        { kind: 'spikes', x: 235, y: 442, span: 100 },
        { kind: 'spikes', x: 465, y: 442, span: 100 },
        { kind: 'pendulum', x: 400, y: 34, span: 148, speed: 2.05, phase: 0.7 },
      ],
    },
    bamboo_outpost: {
      crumbleSlabs: [{ id: 'cs_bam_1', x: 265, y: 308, w: 108 }],
    },
    catacomb_hall: {
      hazards: [
        { kind: 'spikes', x: 545, y: 450, span: 96 },
        { kind: 'spikes', x: 1190, y: 452, span: 105 },
        { kind: 'pendulum', x: 885, y: 34, span: 156, speed: 1.85, phase: 0.5 },
      ],
      crumbleSlabs: [{ id: 'cs_cat_1', x: 935, y: 320, w: 115 }],
    },
    secret_catacomb_treasury: {
      hazards: [
        { kind: 'spikes', x: 205, y: 428, span: 56 },
        { kind: 'spikes', x: 530, y: 428, span: 56 },
      ],
    },
    catacomb_shrine: {
      hazards: [{ kind: 'pendulum', x: 415, y: 36, span: 152, speed: 1.9, phase: 1.4 }],
    },
    observatory_bridge: {
      crumbleSlabs: [
        { id: 'cs_obs_1', x: 540, y: 318, w: 110 },
        { id: 'cs_obs_2', x: 950, y: 318, w: 110 },
      ],
    },
    secret_sword_tomb: {
      hazards: [{ kind: 'spikes', x: 205, y: 428, span: 100 }],
      crumbleSlabs: [{ id: 'cs_tomb_1', x: 300, y: 308, w: 105 }],
    },
    secret_thunder_vault: {
      hazards: [{ kind: 'pendulum', x: 485, y: 36, span: 148, speed: 2.0, phase: 0.6 }],
    },
  };

  const dryNonWaterRoomIds = new Set([
    'alchemy_save',
    'central_warp',
    'forge_smithy',
    'relic_ground_slam',
    'east_outer_tower',
    'opera_gallery',
    'relic_grapple_vault',
    'observatory_bridge',
    'secret_thunder_vault',
  ]);
  const ambushRoomIds = new Set([
    'west_armory',
    'forge_molten_hall',
    'prison_waterway',
    'opera_gallery',
    'catacomb_hall',
    'clock_gear_hall',
  ]);

  // ==================== 恶魔城《月下》式完整入口大关卡扩建（苦竹荒冢林 -> 护城桥 -> 瓮城狼道 + 戍卫箭楼 + 暗河水窟 -> 水闸内廊 -> 门厅 -> 古祠） ====================
  const entranceStageRooms: BuiltRoom[] = [
    {
      id: 'entrance_bamboo_woods',
      name: '苦竹荒冢林道',
      subtitle: '城郊野径 · 破土阴兵与夜蝠寒林',
      region: 'gatehouse',
      bgKey: 'bg_bamboo_cliff',
      realm: 'normal',
      mapX: 1,
      mapY: 3,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 800,
      focalY: 404,
      leftRoomId: 'bamboo_outpost',
      leftDoorFloorY: 404,
      rightRoomId: 'gate_1',
      rightDoorFloorY: 404,
      groundNodes: [
        { x: 0, y: 404, style: 'flagstone' },
        { x: 340, y: 404, style: 'stairs' },
        { x: 430, y: 432, style: 'crypt_stone' },
        { x: 760, y: 432, style: 'stairs' },
        { x: 850, y: 392, style: 'flagstone' },
        { x: 1180, y: 392, style: 'stairs' },
        { x: 1260, y: 404, style: 'flagstone' },
        { x: 1600, y: 404, style: 'flagstone' },
      ],
      solidBlocks: [
        { x: 520, y: 340, w: 190, h: 30 },
        { x: 910, y: 296, w: 210, h: 30 },
      ],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'guardian_statue', x: 245, y: 404, scale: 0.9 },
        { kind: 'dragon_brazier', x: 1015, y: 392, scale: 0.88 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [{ x: 1465, title: '断魂古渡' }],
      torches: [
        { x: 310, y: 332 },
        { x: 890, y: 320 },
        { x: 1380, y: 332 },
      ],
      foregrounds: [
        { x: 380, kind: 'bamboo', parallax: 1.18 },
        { x: 1180, kind: 'bamboo', parallax: 1.2 },
      ],
      lanterns: [
        { x: 615, y: 235 },
        { x: 1015, y: 205 },
        { x: 1320, y: 245 },
      ],
      npcs: [],
      spawns: [
        { kind: 'corpse_soldier', x: 485, y: 432 },
        { kind: 'blood_bat', x: 690, y: 195 },
        { kind: 'corpse_soldier', x: 960, y: 392 },
        { kind: 'blood_bat', x: 1190, y: 185 },
        { kind: 'corpse_soldier', x: 1350, y: 404 },
      ],
      pickups: [
        { id: 'pk_woods_heal', kind: 'consumable', itemId: 'jinchuang_yao', x: 1015, y: 296 },
      ],
    },

    {
      id: 'entrance_barbican_hall',
      name: '玄城瓮城狼道',
      subtitle: '入城首殿 · 镇狱苍狼与上下暗道',
      region: 'gatehouse',
      bgKey: 'bg_gatehouse_interior',
      realm: 'normal',
      indoor: true,
      mapX: 5,
      mapY: 3,
      gridW: 2,
      gridH: 1,
      pixelW: 1680,
      pixelH: 520,
      special: 'none',
      focalX: 840,
      focalY: 424,
      leftRoomId: 'gate_1',
      leftDoorFloorY: 424,
      rightRoomId: 'entrance_inner_court',
      rightDoorFloorY: 424,
      groundNodes: [
        { x: 0, y: 424, style: 'flagstone' },
        { x: 640, y: 424, style: 'stairs' },
        { x: 710, y: 448, style: 'flagstone' },
        { x: 1040, y: 448, style: 'stairs' },
        { x: 1110, y: 424, style: 'flagstone' },
        { x: 1680, y: 424, style: 'flagstone' },
      ],
      solidBlocks: [
        { x: 180, y: 326, w: 200, h: 32 },
        { x: 830, y: 342, w: 185, h: 32 },
        { x: 990, y: 258, w: 185, h: 32 },
        { x: 1130, y: 174, w: 210, h: 30 },
        { x: 1165, y: 92, w: 165, h: 28 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 1135, bottomY: 34, style: 'gate_tunnel' },
        { x1: 1355, x2: 1680, bottomY: 34, style: 'gate_tunnel' },
      ],
      shafts: [
        { x1: 420, x2: 575, dir: 'down', targetRoomId: 'entrance_moat_cavern' },
        { x1: 1135, x2: 1355, dir: 'up', targetRoomId: 'entrance_battlement_tower' },
      ],
      decorProps: [
        { kind: 'weapon_rack', x: 165, y: 424, scale: 0.92 },
        { kind: 'dragon_brazier', x: 875, y: 448, scale: 0.92 },
        { kind: 'guardian_statue', x: 1510, y: 424, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [{ x: 414, y: 424, w: 168, hasPillars: false }],
      archways: [],
      torches: [
        { x: 280, y: 348 },
        { x: 810, y: 365 },
        { x: 1460, y: 348 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 280, y: 245 },
        { x: 750, y: 268 },
        { x: 1480, y: 268 },
      ],
      npcs: [],
      spawns: [
        { kind: 'demon_wolf', x: 640, y: 424 },
        { kind: 'bone_archer', x: 275, y: 326 },
        { kind: 'demon_wolf', x: 1020, y: 448 },
        { kind: 'blood_bat', x: 920, y: 145 },
      ],
      pickups: [],
    },

    {
      id: 'entrance_battlement_tower',
      name: '瓮城戍卫谯楼',
      subtitle: '城楼飞檐 · 神臂弩阵与点钢长枪',
      region: 'gatehouse',
      bgKey: 'bg_gatehouse',
      realm: 'normal',
      indoor: false,
      mapX: 5,
      mapY: 2,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 800,
      focalY: 396,
      groundNodes: [
        { x: 0, y: 372, style: 'flagstone' },
        { x: 340, y: 372, style: 'stairs' },
        { x: 420, y: 408, style: 'flagstone' },
        { x: 1040, y: 408, style: 'stairs' },
        { x: 1110, y: 396, style: 'flagstone' },
        { x: 1600, y: 396, style: 'flagstone' },
      ],
      solidBlocks: [
        { x: 110, y: 276, w: 220, h: 32 },
        { x: 560, y: 312, w: 210, h: 32 },
        { x: 830, y: 248, w: 195, h: 30 },
      ],
      ceilingSpans: [],
      shafts: [{ x1: 1135, x2: 1355, dir: 'down', targetRoomId: 'entrance_barbican_hall' }],
      decorProps: [
        { kind: 'weapon_rack', x: 260, y: 372, scale: 0.92 },
        { kind: 'dragon_brazier', x: 665, y: 408, scale: 0.9 },
        { kind: 'silk_banner', x: 1460, y: 248, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [{ x: 1129, y: 396, w: 232, hasPillars: false }],
      archways: [],
      torches: [
        { x: 190, y: 302 },
        { x: 960, y: 332 },
        { x: 1450, y: 324 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 480, y: 225 },
        { x: 925, y: 175 },
      ],
      npcs: [],
      spawns: [
        { kind: 'bone_archer', x: 665, y: 312 },
        { kind: 'blood_bat', x: 520, y: 185 },
        { kind: 'bone_archer', x: 220, y: 276 },
        { kind: 'paper_swordsman', x: 860, y: 408 },
      ],
      pickups: [
        { id: 'pk_battlement_spear', kind: 'weapon', itemId: 'spear_1', x: 195, y: 276 },
        { id: 'pk_battlement_mp', kind: 'consumable', itemId: 'huiqi_dan', x: 925, y: 248 },
      ],
    },

    {
      id: 'entrance_moat_cavern',
      name: '瓮城暗河水窟',
      subtitle: '城底水闸 · 寒潭石墩与藏肉暗壁',
      region: 'gatehouse',
      bgKey: 'bg_moat_sluice',
      realm: 'normal',
      indoor: true,
      mapX: 5,
      mapY: 4,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 500,
      special: 'none',
      focalX: 800,
      focalY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 540, y: 408, style: 'stairs' },
        { x: 610, y: 454, style: 'crypt_stone' },
        { x: 1340, y: 454, style: 'stairs' },
        { x: 1410, y: 408, style: 'crypt_stone' },
        { x: 1600, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 235, y: 326, w: 155, h: 30 },
        { x: 320, y: 242, w: 155, h: 30 },
        { x: 390, y: 160, w: 160, h: 28 },
        { x: 415, y: 84, w: 150, h: 26 },
        { x: 690, y: 374, w: 165, h: 32 },
        { x: 980, y: 356, w: 175, h: 32 },
        { x: 1240, y: 328, w: 160, h: 30 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 395, bottomY: 34, style: 'crypt_vault' },
        { x1: 575, x2: 1600, bottomY: 34, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 395, x2: 575, dir: 'up', targetRoomId: 'entrance_barbican_hall' }],
      secretWalls: [
        {
          id: 'sec_wall_moat_chicken',
          x: 1548,
          y: 308,
          w: 44,
          h: 100,
          dropKind: 'consumable',
          dropItemId: 'beggar_chicken',
        },
      ],
      decorProps: [{ kind: 'dragon_brazier', x: 165, y: 408, scale: 0.88 }],
      waterZones: [{ x1: 590, x2: 1360, surfaceY: 422 }],
      pavilions: [],
      archways: [],
      torches: [
        { x: 210, y: 332 },
        { x: 1450, y: 332 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 770, y: 255 },
        { x: 1065, y: 235 },
      ],
      npcs: [],
      spawns: [
        { kind: 'corpse_soldier', x: 260, y: 408 },
        { kind: 'plague_toad', x: 775, y: 374 },
        { kind: 'blood_bat', x: 960, y: 175 },
        { kind: 'plague_toad', x: 1065, y: 356 },
      ],
      pickups: [
        { id: 'pk_moat_brocade', kind: 'armor', itemId: 'cloud_brocade', x: 1475, y: 408 },
      ],
    },

    {
      id: 'entrance_inner_court',
      name: '瓮城千斤水闸廊',
      subtitle: '重垣内道 · 悬斧石梁与苍狼巡卫',
      region: 'gatehouse',
      bgKey: 'bg_gatehouse_interior',
      realm: 'normal',
      indoor: true,
      mapX: 7,
      mapY: 3,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 500,
      special: 'none',
      focalX: 800,
      focalY: 424,
      leftRoomId: 'entrance_barbican_hall',
      leftDoorFloorY: 424,
      rightRoomId: 'gate_2',
      rightDoorFloorY: 424,
      groundNodes: [
        { x: 0, y: 424, style: 'flagstone' },
        { x: 460, y: 424, style: 'stairs' },
        { x: 540, y: 452, style: 'flagstone' },
        { x: 1060, y: 452, style: 'stairs' },
        { x: 1140, y: 424, style: 'flagstone' },
        { x: 1600, y: 424, style: 'flagstone' },
      ],
      solidBlocks: [
        { x: 340, y: 332, w: 210, h: 32 },
        { x: 685, y: 268, w: 230, h: 32 },
        { x: 1045, y: 332, w: 210, h: 32 },
      ],
      hazards: [{ kind: 'pendulum', x: 800, y: 36, span: 142, speed: 1.75, phase: 0.5 }],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 34, style: 'gate_tunnel' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 215, y: 424, scale: 0.9 },
        { kind: 'weapon_rack', x: 800, y: 452, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1385, y: 424, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 280, y: 348 },
        { x: 800, y: 368 },
        { x: 1320, y: 348 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 445, y: 225 },
        { x: 800, y: 185 },
        { x: 1150, y: 225 },
      ],
      npcs: [],
      spawns: [
        { kind: 'demon_wolf', x: 640, y: 452 },
        { kind: 'bone_archer', x: 1145, y: 332 },
        { kind: 'paper_swordsman', x: 1340, y: 424 },
      ],
      pickups: [
        { id: 'pk_inner_court_wine', kind: 'consumable', itemId: 'tiger_bone_wine', x: 800, y: 268 },
      ],
    },
  ];

  return [
    ...coreRooms.map((r) => (r.id === 'gate_1' ? { ...r, mapX: 3 } : { ...r, mapX: r.mapX + 7 })),
    ...expandedRooms.map((r) => (r.id === 'bamboo_outpost' ? r : { ...r, mapX: r.mapX + 6 })),
    ...entranceStageRooms,
  ]
    .map((rm) => {
      const extra = roomHazardLayouts[rm.id];
      let waterZones = dryNonWaterRoomIds.has(rm.id) ? [] : rm.waterZones;
      if (rm.id === 'alchemy_lab') {
        waterZones = waterZones.map((wz) => ({ ...wz, liquidKind: 'lava' as const }));
      }
      // 殿堂留白减法：镇魂祠与八卦传送室保持庄严肃穆，剔除杂乱悬空宫灯与多余浮亭，仅保留竖井安全盖板
      const isSanctuary = rm.special === 'save_shrine' || rm.special === 'warp_bagua';
      const pavilions = isSanctuary
        ? rm.pavilions.filter((pv) =>
            rm.shafts.some(
              (sh) => sh.dir === 'down' && pv.x <= sh.x1 + 20 && pv.x + pv.w >= sh.x2 - 20
            )
          )
        : rm.pavilions;
      const lanterns = isSanctuary && rm.shafts.every((s) => s.dir !== 'up') ? [] : rm.lanterns;
      const ceilingSpans =
        rm.id === 'secret_thunder_vault' && rm.ceilingSpans.length === 0
          ? [{ x1: 0, x2: rm.pixelW, bottomY: 36, style: 'gate_tunnel' as const }]
          : rm.ceilingSpans;

      return {
        ...rm,
        waterZones,
        pavilions,
        lanterns,
        ceilingSpans,
        ambushSeal: ambushRoomIds.has(rm.id),
        hazards: extra?.hazards ?? rm.hazards,
        crumbleSlabs: extra?.crumbleSlabs ?? rm.crumbleSlabs,
      };
    })
    .map(widenSingleCellRoomForUltraWide);
}

/**
 * 适配现代 19.5:9 / 20:9 / 21:9 全系超宽全面屏横版视口 (`vH = 440` 时 `vW ≈ 955~1045px`)：
 * 将原本仅 `800px` 宽的单格厅堂与竖塔对称拓宽至 `1080px`（左右各延展 `140px` 殿宇空间，两端接门石台向两侧墙体无缝延展，内部跳台相对跨度保持 100% 像素级不变！），
 * 从根源上消灭窄房间在全面屏手机右侧出现断层黑条或漏出墙外远景的穿帮问题！
 */
function widenSingleCellRoomForUltraWide(rm: BuiltRoom): BuiltRoom {
  const TARGET_MIN_W = 1080;
  if (rm.pixelW >= TARGET_MIN_W) return rm;

  const oldW = rm.pixelW;
  const pad = Math.round((TARGET_MIN_W - oldW) * 0.5);
  const newW = oldW + pad * 2;

  return {
    ...rm,
    pixelW: newW,
    focalX: rm.focalX + pad,
    groundNodes: rm.groundNodes.map((gn) => ({
      ...gn,
      x: gn.x <= 2 ? 0 : gn.x >= oldW - 2 ? newW : gn.x + pad,
    })),
    ceilingSpans: rm.ceilingSpans.map((cs) => ({
      ...cs,
      x1: cs.x1 <= 2 ? 0 : cs.x1 + pad,
      x2: cs.x2 >= oldW - 2 ? newW : cs.x2 + pad,
    })),
    shafts: rm.shafts.map((sh) => ({
      ...sh,
      x1: sh.x1 + pad,
      x2: sh.x2 + pad,
    })),
    solidBlocks: rm.solidBlocks?.map((sb) => {
      if (sb.x <= 4) {
        return { ...sb, x: 0, w: sb.w + pad };
      }
      if (sb.x + sb.w >= oldW - 4) {
        return { ...sb, x: sb.x + pad, w: sb.w + pad };
      }
      return { ...sb, x: sb.x + pad };
    }),
    ironGate: rm.ironGate ? { ...rm.ironGate, x: rm.ironGate.x + pad } : undefined,
    secretWalls: rm.secretWalls?.map((sw) => {
      if (sw.x <= 8) return { ...sw };
      if (sw.x + sw.w >= oldW - 8) return { ...sw, x: sw.x + pad * 2 };
      return { ...sw, x: sw.x + pad };
    }),
    climbWalls: rm.climbWalls?.map((cw) => ({ ...cw, x: cw.x + pad })),
    decorProps: rm.decorProps?.map((dp) => ({ ...dp, x: dp.x + pad })),
    clockGears: rm.clockGears?.map((cg) => ({ ...cg, x: cg.x + pad })),
    movingPlatforms: rm.movingPlatforms?.map((mp) => ({
      ...mp,
      x1: mp.x1 + pad,
      x2: mp.x2 + pad,
    })),
    hazards: rm.hazards?.map((hz) => ({
      ...hz,
      x: hz.x + pad,
    })),
    crumbleSlabs: rm.crumbleSlabs?.map((cs) => ({
      ...cs,
      x: cs.x + pad,
    })),
    pavilions: rm.pavilions.map((pv) => ({ ...pv, x: pv.x + pad })),
    waterZones: rm.waterZones.map((wz) => ({
      ...wz,
      x1: wz.x1 <= 2 ? 0 : wz.x1 + pad,
      x2: wz.x2 >= oldW - 2 ? newW : wz.x2 + pad,
    })),
    archways: rm.archways.map((ar) => ({ ...ar, x: ar.x + pad })),
    torches: rm.torches.map((tc) => ({ ...tc, x: tc.x + pad })),
    foregrounds: rm.foregrounds.map((fg) => ({ ...fg, x: fg.x + pad })),
    lanterns: rm.lanterns.map((ln) => ({ ...ln, x: ln.x + pad })),
    npcs: rm.npcs.map((npc) => ({ ...npc, x: npc.x + pad })),
    steles: rm.steles?.map((st) => ({ ...st, x: st.x + pad })),
    spawns: rm.spawns.map((sp) => ({ ...sp, x: sp.x + pad })),
    pickups: rm.pickups.map((pk) => ({ ...pk, x: pk.x + pad })),
  };
}

/**
 * 180° 九幽倒悬里城生成器（完整镜像翻转全部 42 座手工关卡、破壁密室与门廊，组成超 200% 双城探索终局！）
 */
function createInvertedCastleRooms(normalRooms: BuiltRoom[]): BuiltRoom[] {
  const invertedUpgradePickups: Record<string, ScenePickup[]> = {
    west_armory: [{ id: 'inv_pk_gs3', kind: 'weapon', itemId: 'greatsword_3', x: 520 }],
    secret_archive: [{ id: 'inv_pk_sw3', kind: 'weapon', itemId: 'sword_3', x: 390 }],
    relic_double_jump: [{ id: 'inv_pk_sp3', kind: 'weapon', itemId: 'spear_3', x: 420 }],
    relic_mist_vault: [{ id: 'inv_pk_dg3', kind: 'weapon', itemId: 'daggers_3', x: 480 }],
    relic_grapple_vault: [{ id: 'inv_pk_wh3', kind: 'weapon', itemId: 'whip_3', x: 440 }],
    relic_wall_vault: [
      { id: 'inv_pk_robe_xn', kind: 'armor', itemId: 'xuanniao_robe', x: 210 },
    ],
    relic_ground_slam: [
      { id: 'inv_pk_gourd', kind: 'armor', itemId: 'fortune_gourd', x: 220 },
    ],
    library_shop: [
      { id: 'inv_pk_armor_mg', kind: 'armor', itemId: 'mingguang_armor', x: 440 },
    ],
    bamboo_outpost: [
      { id: 'inv_pk_wind_pend', kind: 'armor', itemId: 'wind_step_pendant', x: 530 },
    ],
    secret_armory_vault: [
      { id: 'inv_pk_gs_sunder', kind: 'weapon', itemId: 'greatsword_sunder', x: 430 },
    ],
    secret_forge_smeltery: [
      { id: 'inv_pk_smelt_hp', kind: 'max_up', itemId: 'hp_vessel', x: 340 },
      { id: 'inv_pk_smelt_jg', kind: 'consumable', itemId: 'jingang_dan', x: 430 },
    ],
    catacomb_shrine: [
      { id: 'inv_pk_sw_blood', kind: 'weapon', itemId: 'sword_blood', x: 240 },
    ],
    secret_catacomb_treasury: [
      { id: 'inv_pk_cat_mp', kind: 'max_up', itemId: 'mp_vessel', x: 420 },
      { id: 'inv_pk_cat_jz', kind: 'consumable', itemId: 'jiuzhuan_jin_dan', x: 510 },
    ],
    secret_ice_spring: [
      { id: 'inv_pk_ice_hp', kind: 'max_up', itemId: 'hp_vessel', x: 340 },
      { id: 'inv_pk_ice_wine', kind: 'consumable', itemId: 'tiger_bone_wine', x: 430 },
    ],
    secret_library_study: [
      { id: 'inv_pk_dg_phantom', kind: 'weapon', itemId: 'daggers_phantom', x: 420 },
    ],
    observatory_bridge: [
      { id: 'inv_pk_obs_mp', kind: 'max_up', itemId: 'mp_vessel', x: 800 },
    ],
    secret_sword_tomb: [
      { id: 'inv_pk_sw_phantom', kind: 'weapon', itemId: 'sword_phantom', x: 330 },
      { id: 'inv_pk_tomb_jz', kind: 'consumable', itemId: 'jiuzhuan_jin_dan', x: 430 },
    ],
    secret_thunder_vault: [
      { id: 'inv_pk_thun_hp', kind: 'max_up', itemId: 'hp_vessel', x: 340 },
      { id: 'inv_pk_thun_sx', kind: 'consumable', itemId: 'shenxing_san', x: 430 },
    ],
  };

  return normalRooms.map((rm) => {
    const W = rm.pixelW;
    const invMapX = MAP_GRID_TOTAL_W - rm.mapX - rm.gridW;
    const invMapY = MAP_GRID_TOTAL_H - rm.mapY - rm.gridH;

    const flippedNodes: GroundNode[] = [...rm.groundNodes]
      .reverse()
      .map((n, idx, arr) => {
        const prevStyle = idx < arr.length - 1 ? arr[idx + 1].style : n.style;
        return {
          x: W - n.x,
          y: n.y,
          style: prevStyle,
        };
      });

    const flippedPavilions: PavilionPlatform[] = rm.pavilions.map((pv) => ({
      x: W - pv.x - pv.w,
      y: pv.y,
      w: pv.w,
      hasPillars: pv.hasPillars,
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
    }));

    const towerRowFloors = [320, 732, 1140, 1548];
    const flippedSideDoors: SideDoor[] = getRoomSideDoors(rm).map((d) => {
      const invRow = d.rowOffset !== undefined ? rm.gridH - 1 - d.rowOffset : 0;
      const mappedFloorY =
        rm.gridH > 1 && invRow < towerRowFloors.length ? towerRowFloors[invRow] : d.floorY;
      return {
        side: d.side === 'left' ? 'right' : 'left',
        floorY: mappedFloorY,
        targetRoomId: d.targetRoomId,
        targetFloorY: d.targetFloorY,
        rowOffset: invRow,
        secretWallId: d.secretWallId ? `inv_${d.secretWallId}` : undefined,
      };
    });

    const mergedSolidBlocks: SolidBlock[] = rm.solidBlocks
      ? rm.solidBlocks.map((sb) => ({
          x: W - sb.x - sb.w,
          y: sb.y,
          w: sb.w,
          h: Math.min(sb.h, 38),
          blocking: false,
        }))
      : [];

    // 多层竖塔倒悬后，确保每一扇分标高侧门脚下均有承重石门台
    if (rm.gridH > 1) {
      for (const d of flippedSideDoors) {
        if (d.floorY >= rm.pixelH - 120) continue;
        const doorX = d.side === 'left' ? 0 : W - 290;
        const hasLedge = mergedSolidBlocks.some(
          (sb) =>
            Math.abs(sb.y - d.floorY) <= 12 &&
            (d.side === 'left' ? sb.x <= 16 : sb.x + sb.w >= W - 16)
        );
        if (!hasLedge) {
          mergedSolidBlocks.push({ x: doorX, y: d.floorY, w: 290, h: 36 });
        }
      }
    }

    for (const sh of flippedShafts) {
      const midShaftX = Math.round((sh.x1 + sh.x2) * 0.5);
      const shaftFloor = sampleSolidGroundY({ groundNodes: flippedNodes } as BuiltRoom, midShaftX);
      if (sh.dir === 'down') {
        // 为倒悬后的下潜井口自动铺设单向安全木栈板
        const hasGrate = flippedPavilions.some(
          (pv) =>
            Math.abs(pv.y - shaftFloor) <= 14 && pv.x <= sh.x1 + 16 && pv.x + pv.w >= sh.x2 - 16
        );
        if (!hasGrate) {
          flippedPavilions.push({
            x: sh.x1 - 6,
            y: shaftFloor,
            w: sh.x2 - sh.x1 + 12,
            hasPillars: false,
          });
        }
      } else {
        // 为倒悬后的上跃天井自动增设两级踏脚石台，确保任意层高皆可丝滑跃出顶井！
        const midX = midShaftX - 75;
        const step1Y = Math.max(220, shaftFloor - 125);
        const step2Y = Math.max(105, step1Y - 125);
        mergedSolidBlocks.push(
          { x: midX, y: step1Y, w: 150, h: 30, blocking: false },
          { x: midX, y: step2Y, w: 150, h: 28, blocking: false }
        );
      }
    }

    // 倒悬后凡有向上天井处，自动在藻井顶梁切出敞亮井口
    const openCeilings: CeilingSpan[] = [];
    for (const cs of flippedCeilings) {
      let segs: CeilingSpan[] = [cs];
      for (const sh of flippedShafts) {
        if (sh.dir !== 'up') continue;
        const nextSegs: CeilingSpan[] = [];
        for (const sg of segs) {
          if (sh.x2 <= sg.x1 || sh.x1 >= sg.x2) {
            nextSegs.push(sg);
          } else {
            if (sg.x1 < sh.x1) nextSegs.push({ ...sg, x2: sh.x1 });
            if (sh.x2 < sg.x2) nextSegs.push({ ...sg, x1: sh.x2 });
          }
        }
        segs = nextSegs;
      }
      openCeilings.push(...segs);
    }

    const isTrueFinalRoom = rm.id === 'gate_1';
    const isEntryAltar = rm.id === 'sky_altar';

    const eliteSpawns: SceneSpawn[] =
      isTrueFinalRoom ||
      isEntryAltar ||
      rm.special === 'save_shrine' ||
      rm.special === 'warp_bagua' ||
      (rm.isSecretRoom && rm.id !== 'secret_sword_tomb')
        ? []
        : W >= 1500
          ? [
              { kind: 'bell_gargoyle', x: Math.round(W * 0.28), y: 210 },
              { kind: 'bronze_guard', x: Math.round(W * 0.52) },
              { kind: 'opera_puppet', x: Math.round(W * 0.76) },
            ]
          : [{ kind: 'bell_gargoyle', x: Math.round(W * 0.48), y: 200 }];

    return {
      id: rm.id,
      name: isTrueFinalRoom ? '倒悬魔渊 · 烛阴冥坛' : `里 · ${rm.name}`,
      subtitle: isTrueFinalRoom ? '太古尸仙最终决战殿' : '九幽倒悬里城',
      region: rm.region,
      bgKey: isTrueFinalRoom ? 'bg_sky_altar' : rm.bgKey,
      realm: 'inverted',
      indoor: rm.indoor,
      isSecretRoom: rm.isSecretRoom,
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
      storyTriggerId: isTrueFinalRoom ? 'boss_zhuyin_pre' : undefined,
      warpName: rm.warpName ? `里 · ${rm.warpName}` : undefined,
      focalX: W - rm.focalX,
      focalY: rm.focalY,
      sideDoors: flippedSideDoors,
      groundNodes: flippedNodes,
      solidBlocks: mergedSolidBlocks,
      ceilingSpans: isTrueFinalRoom ? [] : openCeilings,
      shafts: flippedShafts,
      climbWalls: rm.climbWalls?.map((cw) => ({
        ...cw,
        x: W - cw.x,
      })),
      clockGears: rm.clockGears?.map((cg) => ({
        ...cg,
        x: W - cg.x,
        speed: -cg.speed,
      })),
      movingPlatforms: rm.movingPlatforms?.map((mp) => ({
        ...mp,
        x1: W - mp.x1 - mp.w,
        x2: W - mp.x2 - mp.w,
      })),
      hazards: rm.hazards?.map((hz) => ({
        ...hz,
        x: hz.kind === 'spikes' ? W - hz.x - hz.span : W - hz.x,
      })),
      crumbleSlabs: rm.crumbleSlabs?.map((cs) => ({
        ...cs,
        id: `inv_${cs.id}`,
        x: W - cs.x - cs.w,
      })),
      decorProps: rm.decorProps?.map((dp) => ({ ...dp, x: W - dp.x })),
      waterZones: rm.waterZones.map((wz) => ({
        x1: W - wz.x2,
        x2: W - wz.x1,
        surfaceY: wz.surfaceY,
        liquidKind: wz.liquidKind,
      })),
      pavilions: flippedPavilions,
      archways: rm.archways.map((ar) => ({ x: W - ar.x, title: ar.title })),
      torches: rm.torches.map((tc) => ({ x: W - tc.x, y: tc.y })),
      foregrounds: rm.foregrounds.map((fg) => ({ ...fg, x: W - fg.x })),
      lanterns: rm.lanterns.map((ln) => ({ x: W - ln.x, y: ln.y })),
      npcs: [],
      spawns: eliteSpawns,
      pickups: (invertedUpgradePickups[rm.id] || []).map((pk) => ({
        ...pk,
        x: rm.gridW === 1 ? pk.x + 140 : pk.x,
      })),
    };
  });
}

function createBossRushArena(): BuiltRoom {
  return {
    id: 'boss_rush_arena',
    name: '百鬼试炼 · 镇妖塔',
    subtitle: '宿敌连战',
    region: 'altar',
    bgKey: 'bg_sky_altar',
    realm: 'normal',
    mapX: 5,
    mapY: 3,
    gridW: 2,
    gridH: 1,
    pixelW: 1500,
    pixelH: 480,
    special: 'boss_room',
    focalX: 750,
    focalY: 382,
    groundNodes: [
      { x: 0, y: 416, style: 'marble' },
      { x: 380, y: 416, style: 'stairs' },
      { x: 470, y: 382, style: 'marble' },
      { x: 1030, y: 382, style: 'stairs' },
      { x: 1120, y: 416, style: 'marble' },
      { x: 1500, y: 416, style: 'marble' },
    ],
    solidBlocks: [{ x: 645, y: 266, w: 210, h: 28 }],
    ceilingSpans: [],
    shafts: [],
    decorProps: [
      { kind: 'dragon_brazier', x: 500, y: 382, scale: 0.92 },
      { kind: 'dragon_brazier', x: 1000, y: 382, scale: 0.92 },
    ],
    waterZones: [],
    pavilions: [
      { x: 130, y: 298, w: 210, hasPillars: true },
      { x: 1160, y: 298, w: 210, hasPillars: true },
    ],
    archways: [{ x: 750, title: '百鬼镇妖塔' }],
    torches: [
      { x: 300, y: 340 },
      { x: 1200, y: 340 },
    ],
    foregrounds: [],
    lanterns: [
      { x: 480, y: 185 },
      { x: 1020, y: 185 },
    ],
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
      // 非隐藏主城占基准 100%（双城主厅 200%，破壁踏入 14 座独立隐藏密室可突破至 228%，致敬月下 200.6%！）
      if (!rm.isSecretRoom) {
        this.normalCellCount += rm.gridW * rm.gridH;
      }
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
    dir: 'left' | 'right',
    playerY?: number,
    brokenSecretWalls?: string[]
  ): {
    nextRoom: BuiltRoom;
    nextX: number;
    nextFloorY: number;
    curFloorY: number;
    chosenDoor: SideDoor;
    backDoor?: SideDoor;
  } | null {
    const allDoors = getRoomSideDoors(cur, dir);
    const doors = brokenSecretWalls
      ? allDoors.filter((d) => !d.secretWallId || brokenSecretWalls.includes(d.secretWallId))
      : allDoors;
    if (doors.length === 0) return null;

    let chosen = doors[0];
    if (playerY !== undefined && doors.length > 1) {
      let bestDist = Infinity;
      for (const d of doors) {
        const dist = Math.abs(playerY - d.floorY);
        if (dist < bestDist) {
          bestDist = dist;
          chosen = d;
        }
      }
    }

    const map = cur.realm === 'inverted' ? this.invertedRooms : this.normalRooms;
    const nextRoom = map.get(chosen.targetRoomId);
    if (!nextRoom) return null;

    const nextX = dir === 'left' ? nextRoom.pixelW - 42 : 42;
    const oppSide = dir === 'left' ? 'right' : 'left';
    const backDoor = getRoomSideDoors(nextRoom, oppSide).find((bd) => bd.targetRoomId === cur.id);

    const nextFloorY =
      chosen.targetFloorY ?? backDoor?.floorY ?? sampleSolidGroundY(nextRoom, nextX);
    return {
      nextRoom,
      nextX,
      nextFloorY,
      curFloorY: chosen.floorY,
      chosenDoor: chosen,
      backDoor,
    };
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
        const oppDir = dir === 'up' ? 'down' : 'up';
        const matchSh = nextRoom.shafts.find(
          (ns) => ns.dir === oppDir && ns.targetRoomId === cur.id
        );
        let localNextX: number;
        if (matchSh) {
          const curRel = (px - sh.x1) / Math.max(1, sh.x2 - sh.x1);
          localNextX = matchSh.x1 + curRel * (matchSh.x2 - matchSh.x1);
        } else {
          const worldX = cur.mapX * CELL_PIXEL_W + px;
          localNextX = worldX - nextRoom.mapX * CELL_PIXEL_W;
        }
        localNextX = Math.max(48, Math.min(nextRoom.pixelW - 48, localNextX));
        const nextY = dir === 'down' ? 28 : nextRoom.pixelH - 26;
        return { nextRoom, nextX: localNextX, nextY };
      }
    }
    return null;
  }

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
        if (rm && rm.gridH === 1) {
          for (let dx = 0; dx < rm.gridW; dx++) invSet.add(`${rm.mapX + dx},${rm.mapY}`);
        }
      } else {
        const id = k.includes(':') ? k.split(':')[1] : k;
        const rm = this.normalRooms.get(id);
        if (rm && rm.gridH === 1) {
          for (let dx = 0; dx < rm.gridW; dx++) normalSet.add(`${rm.mapX + dx},${rm.mapY}`);
        }
      }
    }

    const totalBase = Math.max(1, this.normalCellCount);
    const pct = Math.round(((normalSet.size + invSet.size) / totalBase) * 100);
    return Math.min(240, pct);
  }
}

export const WorldMap = new CastleWorldRegistry();
