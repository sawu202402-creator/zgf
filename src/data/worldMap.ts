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
export const MAP_GRID_TOTAL_W = 11;
export const MAP_GRID_TOTAL_H = 6;

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

export interface SideDoor {
  side: 'left' | 'right';
  floorY: number;
  targetRoomId: string;
  targetFloorY?: number;
  rowOffset?: number;
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

export type CastleDecorKind =
  | 'bookshelf'
  | 'chandelier'
  | 'lattice_window'
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

export interface BuiltRoom {
  id: string;
  name: string;
  subtitle: string;
  region: RegionId;
  realm: CastleRealm;
  bgKey?: AssetKey;
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
  gatehouse: '苦竹瓮城 · 外城门廊',
  main_hall: '奉天盘龙殿 · 中央枢机',
  library: '万卷藏书阁 · 万宝斋',
  forge: '钦天炼丹司 · 铸剑坊',
  prison: '九曲寒潭 · 镇水地宫',
  opera: '百戏梨园 · 子夜灯坊',
  clock_tower: '东垣望月塔 · 天机阁',
  altar: '凌霄祭天坛 · 观星台',
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

/**
 * 采样实体（怪物/掉落物）在 `(px, curY)` 处脚下最近的支撑面（支持实心石台 SolidBlock、单向阁台 Pavilion 与主地面！）
 */
export function sampleEntitySurfaceY(room: BuiltRoom, px: number, curY: number): number {
  let bestY = sampleGroundY(room, px);
  if (room.solidBlocks) {
    for (const sb of room.solidBlocks) {
      if (px >= sb.x + 8 && px <= sb.x + sb.w - 8 && sb.y >= curY - 22 && sb.y < bestY) {
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
  return [
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
      focalX: 240,
      focalY: 404,
      rightRoomId: 'gate_2',
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
      pavilions: [],
      archways: [{ x: 1460, title: '九幽瓮城门' }],
      torches: [
        { x: 430, y: 322 },
        { x: 740, y: 266 },
        { x: 1040, y: 322 },
        { x: 1360, y: 332 },
      ],
      foregrounds: [{ x: 240, kind: 'hanging_lantern', parallax: 1.2 }],
      lanterns: [],
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
        { kind: 'paper_swordsman', x: 720 },
        { kind: 'lantern_ghost', x: 1020 },
        { kind: 'paper_swordsman', x: 1340 },
      ],
      pickups: [],
    },

    {
      id: 'gate_2',
      name: '瓮城分道门厅',
      subtitle: '上下分道 · 炼丹司石阶与地火重闸',
      region: 'gatehouse',
      bgKey: 'bg_gatehouse',
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
      leftRoomId: 'gate_1',
      leftDoorFloorY: 424,
      rightRoomId: 'gate_save',
      rightDoorFloorY: 424,
      groundNodes: [
        { x: 0, y: 424, style: 'flagstone' },
        { x: 1600, y: 424, style: 'flagstone' },
      ],
      // 石砌阶梯悬台（主地面全程畅通无阻！东侧 4 级 84px 单跳踏石直通炼丹司天井，西侧 172px 二段跳高台悬置千年朱果）
      solidBlocks: [
        { x: 96, y: 252, w: 220, h: 34 }, // 西高台 (424->252 = 172px，标准二段跳奖励台)
        { x: 820, y: 340, w: 180, h: 34 }, // 东第1阶 (424->340 = 84px)
        { x: 980, y: 256, w: 190, h: 34 }, // 东第2阶 (340->256 = 84px)
        { x: 1120, y: 172, w: 220, h: 32 }, // 东第3阶 (256->172 = 84px)
        { x: 1170, y: 92, w: 170, h: 28 }, // 登顶踏石 (172->92 = 80px，丝滑跃出天井！)
      ],
      ceilingSpans: [
        { x1: 0, x2: 1140, bottomY: 34, style: 'gate_tunnel' },
        { x1: 1360, x2: 1600, bottomY: 34, style: 'gate_tunnel' },
      ],
      shafts: [
        { x1: 420, x2: 556, dir: 'down', targetRoomId: 'forge_smithy' },
        { x1: 1140, x2: 1360, dir: 'up', targetRoomId: 'alchemy_lab' },
      ],
      decorProps: [{ kind: 'dragon_brazier', x: 700, y: 424, scale: 0.9 }],
      waterZones: [],
      pavilions: [
        // 横跨下潜井口的单向木栈板（平时可直接平地跑过；站上去按 ↓+跃 下潜至赤火铸剑坊见欧冶残！）
        { x: 414, y: 424, w: 152, hasPillars: false },
      ],
      archways: [],
      torches: [
        { x: 200, y: 350 },
        { x: 760, y: 350 },
        { x: 1480, y: 350 },
      ],
      foregrounds: [],
      lanterns: [],
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
      bgKey: 'bg_main_hall',
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
      focalY: 384,
      leftRoomId: 'gate_2',
      leftDoorFloorY: 384,
      rightRoomId: 'hall_corridor',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'incense_burner', x: 185, y: 384, scale: 0.9 },
        { kind: 'incense_burner', x: 615, y: 384, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 250, y: 306 },
        { x: 550, y: 306 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    // ==================== 二、钦天炼丹司（致敬月下：炼金研究栋 -> 重刃武库 -> 首战萧断水 -> 二段跳） ====================
    {
      id: 'alchemy_lab',
      name: '钦天炼丹阶梯廊',
      subtitle: '错落石台与重盾亲卫',
      region: 'forge',
      bgKey: 'bg_molten_forge',
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
        { x: 1600, y: 424, style: 'marble' },
      ],
      // 经典月下炼金栋高低悬台：主地面左右直通【镇军西武库】取斩马刀，上方拾级而上登顶决战萧断水！
      solidBlocks: [
        { x: 340, y: 336, w: 230, h: 34 }, // 西石台 (424->336 = 88px，重盾卫驻守！)
        { x: 640, y: 252, w: 220, h: 34 }, // 中高台 (336->252 = 84px)
        { x: 910, y: 168, w: 220, h: 34 }, // 东高台 (252->168 = 84px)
        { x: 1090, y: 88, w: 165, h: 28 }, // 天井登顶石 (168->88 = 80px，跃入试剑堂！)
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
        { kind: 'dragon_brazier', x: 760, y: 424, scale: 0.92 },
        { kind: 'weapon_rack', x: 1450, y: 424, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [
        // 承接下方瓮城天井跃上的单向安全木栈板（不会刚跳上来又掉回去！）
        { x: 1134, y: 424, w: 232, hasPillars: false },
      ],
      archways: [],
      torches: [
        { x: 240, y: 348 },
        { x: 620, y: 348 },
        { x: 1010, y: 348 },
      ],
      foregrounds: [],
      lanterns: [],
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
      region: 'forge',
      bgKey: 'bg_molten_forge',
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
      rightRoomId: 'alchemy_lab',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      solidBlocks: [{ x: 140, y: 296, w: 220, h: 34 }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      // 致敬月下墙中烤鸡：西端可劈碎暗裂石砖藏有荷叶叫花鸡！
      secretWalls: [
        {
          id: 'sw_armory_chicken',
          x: 38,
          y: 284,
          w: 44,
          h: 100,
          dropKind: 'consumable',
          dropItemId: 'beggar_chicken',
        },
      ],
      decorProps: [
        { kind: 'weapon_rack', x: 440, y: 384, scale: 0.95 },
        { kind: 'dragon_brazier', x: 620, y: 384, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [{ x: 530, y: 308 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [{ kind: 'bronze_guard', x: 510, y: 384 }],
      pickups: [
        { id: 'pk_modao_1', kind: 'weapon', itemId: 'greatsword_1', x: 215, y: 296 },
        { id: 'pk_sub_fire', kind: 'weapon', itemId: 'sub:holy_fire', x: 305, y: 296 },
      ],
    },

    {
      id: 'xiao_boss_hall',
      name: '钦天试剑堂',
      subtitle: '镇妖司少统领决战殿',
      region: 'forge',
      bgKey: 'bg_main_hall',
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
      focalX: 1080,
      focalY: 404,
      leftRoomId: 'relic_double_jump',
      leftDoorFloorY: 404,
      rightRoomId: 'alchemy_save',
      rightDoorFloorY: 404,
      groundNodes: [
        { x: 0, y: 404, style: 'marble' },
        { x: 1500, y: 404, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 1500, bottomY: 36, style: 'palace_timber' }],
      shafts: [{ x1: 260, x2: 480, dir: 'down', targetRoomId: 'alchemy_lab' }],
      decorProps: [
        { kind: 'silk_banner', x: 210, y: 248, scale: 0.88 },
        { kind: 'dragon_brazier', x: 640, y: 404, scale: 0.94 },
        { kind: 'chandelier', x: 900, y: 20, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1180, y: 404, scale: 0.94 },
        { kind: 'silk_banner', x: 1340, y: 248, scale: 0.88 },
      ],
      waterZones: [],
      pavilions: [
        // 下方天井口单向栈板
        { x: 254, y: 404, w: 232, hasPillars: false },
      ],
      archways: [],
      torches: [
        { x: 160, y: 326 },
        { x: 1350, y: 326 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    {
      id: 'alchemy_save',
      name: '丹阁镇魂祠',
      subtitle: '试剑堂前留档室',
      region: 'forge',
      bgKey: 'bg_molten_forge',
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
      focalX: 400,
      focalY: 384,
      leftRoomId: 'xiao_boss_hall',
      leftDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'incense_burner', x: 190, y: 384, scale: 0.92 },
        { kind: 'incense_burner', x: 610, y: 384, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 255, y: 306 },
        { x: 545, y: 306 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    {
      id: 'relic_double_jump',
      name: '丹鼎古武秘室',
      subtitle: '镇司轻功 · 踏云步传承坛',
      region: 'forge',
      bgKey: 'bg_chapel_spire',
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
      focalY: 348,
      rightRoomId: 'xiao_boss_hall',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      solidBlocks: [{ x: 270, y: 348, w: 220, h: 36 }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 165, y: 384, scale: 0.9 },
        { kind: 'dragon_brazier', x: 605, y: 384, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [{ id: 'pk_relic_djump', kind: 'ability', itemId: 'double_jump', x: 380, y: 348 }],
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
      focalX: 1100,
      focalY: 432,
      leftRoomId: 'gate_save',
      leftDoorFloorY: 432,
      rightRoomId: 'east_outer_tower',
      rightDoorFloorY: 264, // 东端出口位于 168px 高的皇城须弥石台上（必须习得【踏云二段跳】方可登台东进望月塔！）
      groundNodes: [
        { x: 0, y: 432, style: 'marble' },
        { x: 2200, y: 432, style: 'marble' },
      ],
      solidBlocks: [
        { x: 820, y: 344, w: 260, h: 34 }, // 中殿御阶悬台 (432->344 = 88px 单跳可达，地面可自由穿行)
        { x: 1180, y: 260, w: 250, h: 34 }, // 本命剑灵悬台 (344->260 = 84px 单跳可达)
        { x: 1820, y: 264, w: 380, h: 168, blocking: true }, // 东端 168px 实心断崖须弥高台（432->264 = 168px，标准【踏云二段跳】能力锁！）
      ],
      ceilingSpans: [],
      shafts: [{ x1: 320, x2: 460, dir: 'down', targetRoomId: 'central_warp' }],
      decorProps: [
        { kind: 'silk_banner', x: 165, y: 256, scale: 0.9 },
        { kind: 'lattice_window', x: 520, y: 268, scale: 0.92 },
        { kind: 'dragon_brazier', x: 640, y: 432, scale: 0.94 },
        { kind: 'chandelier', x: 950, y: 18, scale: 0.94 },
        { kind: 'lattice_window', x: 1460, y: 268, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1580, y: 432, scale: 0.94 },
        { kind: 'silk_banner', x: 1960, y: 186, scale: 0.86 },
      ],
      waterZones: [],
      pavilions: [{ x: 316, y: 432, w: 148, hasPillars: false }],
      archways: [],
      torches: [
        { x: 210, y: 354 },
        { x: 740, y: 354 },
        { x: 1480, y: 354 },
        { x: 2040, y: 188 },
      ],
      foregrounds: [{ x: 1100, kind: 'hanging_lantern', parallax: 1.2 }],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'paper_swordsman', x: 620, y: 432 },
        { kind: 'bronze_guard', x: 950, y: 344 },
        { kind: 'opera_puppet', x: 1560, y: 432 },
        { kind: 'scroll_demon', x: 1720, y: 220 },
      ],
      pickups: [
        { id: 'pk_hall_familiar', kind: 'ability', itemId: 'familiar_sword', x: 1305, y: 260 },
      ],
    },

    {
      id: 'central_warp',
      name: '中枢八卦传送室',
      subtitle: '乾坤龙脉传送阵',
      region: 'main_hall',
      bgKey: 'bg_chapel_spire',
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
      focalY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'marble' },
        { x: 800, y: 396, style: 'marble' },
      ],
      // 84px 单跳踏石直通顶部井口返回盘龙长廊
      solidBlocks: [
        { x: 140, y: 312, w: 150, h: 32 },
        { x: 210, y: 228, w: 150, h: 32 },
        { x: 280, y: 144, w: 150, h: 30 },
        { x: 315, y: 76, w: 150, h: 26 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 300, bottomY: 32, style: 'palace_timber' },
        { x1: 480, x2: 800, bottomY: 32, style: 'palace_timber' },
      ],
      shafts: [{ x1: 300, x2: 480, dir: 'up', targetRoomId: 'hall_corridor' }],
      decorProps: [{ kind: 'dragon_brazier', x: 610, y: 396, scale: 0.9 }],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [],
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
      focalX: 340,
      focalY: 408,
      leftRoomId: 'forge_molten_hall',
      leftDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 800, y: 408, style: 'marble' },
      ],
      // 左侧返程踏石（84px 单跳级差，随时可跃回上方瓮城门厅）；东侧下水牢暗井由玄铁重闸镇守！
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
      // 镇守水牢入口的玄铁通天重闸（前期可随时下来找欧冶残淬炼兵器；取得西武库【镇军斩马刀】后一刀破闸入水牢！）
      ironGate: {
        id: 'gate_forge_entry',
        x: 572,
        topY: 0,
        bottomY: 408,
        gateKind: 'heavy_weapon',
      },
      decorProps: [
        { kind: 'dragon_brazier', x: 245, y: 408, scale: 0.94 },
        { kind: 'weapon_rack', x: 465, y: 408, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [{ x: 590, y: 408, w: 156, hasPillars: false }],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [],
      npcs: [
        {
          id: 'ouye_can',
          name: '欧冶残',
          title: '赤火坊独臂铸剑师',
          x: 375,
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
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      // 东岸安全石台供前期直接拾取【幽冥分水刺】；中部熔岩火潭上方悬置 164px 二段跳踏石与飞燕宫灯！
      solidBlocks: [
        { x: 590, y: 368, w: 145, h: 36 },
        { x: 330, y: 244, w: 140, h: 32 }, // 408->244 = 164px 标准【踏云二段跳】能力锁！
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      waterZones: [{ x1: 245, x2: 555, surfaceY: 396, liquidKind: 'lava' }],
      decorProps: [
        { kind: 'dragon_brazier', x: 135, y: 408, scale: 0.9 },
        { kind: 'weapon_rack', x: 725, y: 408, scale: 0.9 },
      ],
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
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 90, y: 320, w: 150, h: 32 },
        { x: 560, y: 320, w: 150, h: 32 },
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
        { kind: 'dragon_brazier', x: 195, y: 408, scale: 0.94 },
        { kind: 'dragon_brazier', x: 605, y: 408, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [{ x: 304, y: 408, w: 192, hasPillars: false }],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [],
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
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 500, y: 372, w: 220, h: 36 },
        { x: 120, y: 324, w: 150, h: 32 },
        { x: 190, y: 240, w: 150, h: 32 },
        { x: 260, y: 156, w: 150, h: 30 },
        { x: 320, y: 80, w: 155, h: 26 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 310, bottomY: 32, style: 'crypt_vault' },
        { x1: 490, x2: 800, bottomY: 32, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 310, x2: 490, dir: 'up', targetRoomId: 'forge_boss_arena' }],
      decorProps: [{ kind: 'guardian_statue', x: 140, y: 408, scale: 0.92 }],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [],
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
        { x: 2000, y: 416, style: 'crypt_stone' },
      ],
      // 水上错落青石桥墩 + 返程登顶踏石（不阻挡横向涉水，单跳丝滑跃回铸剑坊！）
      solidBlocks: [
        { x: 320, y: 332, w: 150, h: 32 },
        { x: 410, y: 248, w: 150, h: 32 },
        { x: 500, y: 164, w: 150, h: 30 },
        { x: 585, y: 86, w: 145, h: 26 },
        { x: 780, y: 344, w: 200, h: 72 }, // 寒潭第1石墩
        { x: 1080, y: 312, w: 210, h: 104 }, // 寒潭第2石墩（藏长枪！）
        { x: 1390, y: 344, w: 200, h: 72 }, // 寒潭第3石墩
      ],
      ceilingSpans: [
        { x1: 0, x2: 570, bottomY: 32, style: 'crypt_vault' },
        { x1: 750, x2: 2000, bottomY: 32, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 570, x2: 750, dir: 'up', targetRoomId: 'forge_smithy' }],
      waterZones: [{ x1: 720, x2: 1650, surfaceY: 386 }],
      decorProps: [
        { kind: 'dragon_brazier', x: 200, y: 416, scale: 0.9 },
        { kind: 'dragon_brazier', x: 1760, y: 416, scale: 0.9 },
      ],
      pavilions: [],
      archways: [],
      torches: [
        { x: 880, y: 268 },
        { x: 1185, y: 236 },
        { x: 1490, y: 268 },
        { x: 1840, y: 340 },
      ],
      foregrounds: [],
      lanterns: [],
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
      focalX: 980,
      focalY: 408,
      leftRoomId: 'prison_waterway',
      leftDoorFloorY: 408,
      rightRoomId: 'relic_mist_vault',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 1500, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 240, y: 320, w: 180, h: 28 },
        { x: 1080, y: 320, w: 180, h: 28 },
      ],
      ceilingSpans: [{ x1: 0, x2: 1500, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 560, y: 408, scale: 0.92 },
        { kind: 'dragon_brazier', x: 940, y: 408, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 150, y: 332 },
        { x: 1350, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
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
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      // 右侧回环踏石直通上方【寒潭渡口古祠】与【东垣望月竖塔】底层（经典银河恶魔城打通捷径体验！）
      solidBlocks: [
        { x: 220, y: 372, w: 220, h: 36 },
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
      decorProps: [{ kind: 'guardian_statue', x: 135, y: 408, scale: 0.92 }],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [],
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
      focalX: 280,
      focalY: 396,
      rightRoomId: 'east_outer_tower',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'crypt_stone' },
        { x: 800, y: 396, style: 'crypt_stone' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'crypt_vault' }],
      shafts: [{ x1: 500, x2: 700, dir: 'down', targetRoomId: 'relic_mist_vault' }],
      decorProps: [{ kind: 'incense_burner', x: 135, y: 396, scale: 0.9 }],
      waterZones: [],
      pavilions: [{ x: 494, y: 396, w: 212, hasPillars: false }],
      archways: [],
      torches: [{ x: 430, y: 318 }],
      foregrounds: [],
      lanterns: [],
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
      bgKey: 'bg_chapel_spire',
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
        { x: 800, y: 1548, style: 'marble' },
      ],
      // 经典月下外壁左右交替实心石阶（每阶约 82~96px，节奏分明，绝无废跳！）
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
        { kind: 'dragon_brazier', x: 390, y: 1548, scale: 0.92 },
        { kind: 'lattice_window', x: 400, y: 1220, scale: 0.9 },
        { kind: 'silk_banner', x: 400, y: 805, scale: 0.88 },
        { kind: 'lattice_window', x: 220, y: 410, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 160, y: 1066 },
        { x: 640, y: 1066 },
        { x: 180, y: 658 },
        { x: 560, y: 246 },
      ],
      foregrounds: [],
      lanterns: [],
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
      bgKey: 'bg_chapel_spire',
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
      focalX: 420,
      focalY: 384,
      leftRoomId: 'east_outer_tower',
      leftDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 200, y: 384, scale: 0.9 },
        { kind: 'dragon_brazier', x: 620, y: 384, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [],
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
      focalY: 424,
      leftRoomId: 'library_shop',
      leftDoorFloorY: 424,
      rightRoomId: 'east_outer_tower',
      rightDoorFloorY: 424,
      groundNodes: [
        { x: 0, y: 424, style: 'marble' },
        { x: 1600, y: 424, style: 'marble' },
      ],
      // 双层藏书回廊（下层主通道全程贯通，上层藏剑夹层经二段跳直通【子夜百戏勾栏】天井！）
      solidBlocks: [
        { x: 360, y: 336, w: 210, h: 34 },
        { x: 660, y: 252, w: 340, h: 34 },
        { x: 755, y: 116, w: 150, h: 28 }, // 252->116 = 136px 需二段跳跃入上方百戏梨园！
        { x: 1090, y: 336, w: 210, h: 34 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 730, bottomY: 34, style: 'palace_timber' },
        { x1: 930, x2: 1600, bottomY: 34, style: 'palace_timber' },
      ],
      shafts: [{ x1: 730, x2: 930, dir: 'up', targetRoomId: 'opera_gallery' }],
      decorProps: [
        { kind: 'bookshelf', x: 190, y: 424, scale: 0.96 },
        { kind: 'lattice_window', x: 615, y: 266, scale: 0.88 },
        { kind: 'bookshelf', x: 830, y: 424, scale: 0.96 },
        { kind: 'chandelier', x: 1210, y: 22, scale: 0.9 },
        { kind: 'bookshelf', x: 1410, y: 424, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 280, y: 348 },
        { x: 960, y: 348 },
        { x: 1340, y: 348 },
      ],
      foregrounds: [],
      lanterns: [],
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
        { kind: 'opera_puppet', x: 760, y: 424 },
        { kind: 'scroll_demon', x: 1060, y: 220 },
        { kind: 'bronze_guard', x: 1195, y: 336 },
      ],
      pickups: [{ id: 'pk_lib_whip1', kind: 'weapon', itemId: 'whip_1', x: 830, y: 252 }],
    },

    {
      id: 'library_shop',
      name: '藏书万宝斋',
      subtitle: '子夜狐商 · 奇门兵甲丹药铺',
      region: 'opera',
      bgKey: 'bg_opera_market',
      realm: 'normal',
      indoor: true,
      mapX: 5,
      mapY: 2,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 440,
      special: 'none',
      focalX: 360,
      focalY: 384,
      rightRoomId: 'upper_library',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'bookshelf', x: 165, y: 384, scale: 0.94 },
        { kind: 'incense_burner', x: 520, y: 384, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [{ x: 640, y: 308 }],
      foregrounds: [{ x: 260, kind: 'hanging_lantern', parallax: 1.18 }],
      lanterns: [],
      npcs: [
        {
          id: 'bai_zhanggui',
          name: '白掌柜',
          title: '万宝斋狐商',
          x: 360,
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
      bgKey: 'bg_library_opera',
      realm: 'normal',
      indoor: true,
      mapX: 9,
      mapY: 1,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 440,
      special: 'relic_pedestal',
      focalX: 460,
      focalY: 348,
      leftRoomId: 'east_outer_tower',
      leftDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      solidBlocks: [{ x: 330, y: 348, w: 260, h: 36 }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'bookshelf', x: 185, y: 384, scale: 0.94 },
        { kind: 'dragon_brazier', x: 655, y: 384, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [
        { id: 'pk_mirror_truth', kind: 'ability', itemId: 'mirror_truth', x: 405, y: 348 },
        { id: 'pk_sword_2', kind: 'weapon', itemId: 'sword_2', x: 520, y: 348 },
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
        { x: 1600, y: 424, style: 'marble' },
      ],
      solidBlocks: [
        { x: 240, y: 320, w: 240, h: 34 }, // 西高台悬置【青冥寒影双刺】
        { x: 960, y: 336, w: 180, h: 34 },
        { x: 1060, y: 248, w: 180, h: 34 },
        { x: 1120, y: 164, w: 190, h: 32 },
        { x: 1150, y: 86, w: 160, h: 28 },
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
        { kind: 'silk_banner', x: 190, y: 246, scale: 0.92 },
        { kind: 'chandelier', x: 600, y: 20, scale: 0.92 },
        { kind: 'silk_banner', x: 1450, y: 246, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [{ x: 724, y: 424, w: 212, hasPillars: false }],
      archways: [],
      torches: [
        { x: 490, y: 348 },
        { x: 1420, y: 348 },
      ],
      foregrounds: [{ x: 820, kind: 'hanging_lantern', parallax: 1.2 }],
      lanterns: [
        { x: 520, y: 185 },
        { x: 920, y: 185 },
      ],
      npcs: [],
      spawns: [
        { kind: 'opera_puppet', x: 520, y: 424 },
        { kind: 'scroll_demon', x: 660, y: 215 },
        { kind: 'opera_puppet', x: 1360, y: 424 },
      ],
      pickups: [{ id: 'pk_daggers_2', kind: 'weapon', itemId: 'daggers_2', x: 360, y: 320 }],
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
      focalX: 520,
      focalY: 408,
      leftRoomId: 'relic_grapple_vault',
      leftDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 1500, y: 408, style: 'marble' },
      ],
      solidBlocks: [
        { x: 240, y: 316, w: 190, h: 32 },
        { x: 780, y: 316, w: 190, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 1500, bottomY: 36, style: 'palace_timber' }],
      shafts: [{ x1: 1080, x2: 1300, dir: 'down', targetRoomId: 'opera_gallery' }],
      decorProps: [
        { kind: 'silk_banner', x: 165, y: 248, scale: 0.9 },
        { kind: 'dragon_brazier', x: 600, y: 408, scale: 0.92 },
        { kind: 'silk_banner', x: 1360, y: 248, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [{ x: 1074, y: 408, w: 232, hasPillars: false }],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [{ x: 610, y: 175 }],
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
      focalX: 380,
      focalY: 348,
      rightRoomId: 'opera_boss_stage',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      solidBlocks: [{ x: 250, y: 348, w: 260, h: 36 }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'silk_banner', x: 145, y: 240, scale: 0.88 },
        { kind: 'incense_burner', x: 635, y: 384, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [
        { id: 'pk_relic_grapple', kind: 'ability', itemId: 'grapple_hook', x: 325, y: 348 },
        { id: 'pk_whip_2', kind: 'weapon', itemId: 'whip_2', x: 440, y: 348 },
      ],
    },

    {
      id: 'clock_gear_hall',
      name: '浑天铜轮机巧廊',
      subtitle: '旋转青铜齿轮与龙胆亮银枪',
      region: 'clock_tower',
      bgKey: 'bg_chapel_spire',
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
      focalY: 408,
      leftRoomId: 'east_outer_tower',
      leftDoorFloorY: 408,
      rightRoomId: 'clock_boss_spire',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 800, y: 408, style: 'marble' },
      ],
      solidBlocks: [
        { x: 110, y: 316, w: 160, h: 32 },
        { x: 320, y: 232, w: 160, h: 32 },
        { x: 530, y: 316, w: 160, h: 32 },
      ],
      clockGears: [
        { x: 260, y: 220, radius: 74, speed: 0.65, hasOrbitPlatforms: true },
        { x: 540, y: 220, radius: 74, speed: -0.65, hasOrbitPlatforms: true },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 34, style: 'palace_timber' }],
      shafts: [],
      decorProps: [{ kind: 'lattice_window', x: 400, y: 268, scale: 0.9 }],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 140, y: 332 },
        { x: 660, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 320, y: 190 },
        { kind: 'bronze_guard', x: 580, y: 408 },
      ],
      pickups: [
        { id: 'pk_spear_2', kind: 'weapon', itemId: 'spear_2', x: 400, y: 232 },
        { id: 'pk_sub_seal', kind: 'weapon', itemId: 'sub:mountain_seal', x: 610, y: 316 },
      ],
    },

    {
      id: 'clock_boss_spire',
      name: '雷音镇钟天阙',
      subtitle: '洪武巨钟 · 雷音金翅大鹏王决战殿',
      region: 'clock_tower',
      bgKey: 'bg_chapel_spire',
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
      focalX: 540,
      focalY: 408,
      leftRoomId: 'clock_gear_hall',
      leftDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 800, y: 408, style: 'marble' },
      ],
      solidBlocks: [
        { x: 140, y: 322, w: 150, h: 32 },
        { x: 220, y: 238, w: 150, h: 32 },
        { x: 290, y: 154, w: 155, h: 30 },
        { x: 325, y: 80, w: 155, h: 26 },
      ],
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
        { kind: 'giant_bell', x: 640, y: 245, scale: 0.96 },
        { kind: 'dragon_brazier', x: 620, y: 408, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    {
      id: 'relic_wall_vault',
      name: '云梯古武秘阁',
      subtitle: '壁虎游墙功与九幽噬魂禁卷',
      region: 'clock_tower',
      bgKey: 'bg_chapel_spire',
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
        { x: 800, y: 396, style: 'marble' },
      ],
      solidBlocks: [{ x: 540, y: 360, w: 210, h: 36 }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [{ x1: 310, x2: 510, dir: 'down', targetRoomId: 'clock_boss_spire' }],
      decorProps: [{ kind: 'incense_burner', x: 140, y: 396, scale: 0.9 }],
      waterZones: [],
      pavilions: [{ x: 304, y: 396, w: 212, hasPillars: false }],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [
        { id: 'pk_relic_walljump', kind: 'ability', itemId: 'wall_jump', x: 590, y: 360 },
        { id: 'pk_scroll_soulsteal', kind: 'skill_scroll', itemId: 'jiuyou_soulsteal', x: 700, y: 360 },
      ],
    },

    // ==================== 七、云端天守祭天坛（致敬月下：恶魔城最上部 -> 王座决战 -> 开启180°倒悬里城！） ====================
    {
      id: 'altar_save',
      name: '观星登坛古祠',
      subtitle: '祭天坛前留档室',
      region: 'altar',
      bgKey: 'bg_chapel_spire',
      realm: 'normal',
      indoor: true,
      mapX: 8,
      mapY: 0,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'save_shrine',
      warpName: '观星登坛古祠',
      focalX: 200,
      focalY: 396,
      rightRoomId: 'sky_altar',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'marble' },
        { x: 800, y: 396, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [{ x1: 290, x2: 510, dir: 'down', targetRoomId: 'east_outer_tower' }],
      decorProps: [{ kind: 'dragon_brazier', x: 615, y: 396, scale: 0.92 }],
      waterZones: [],
      pavilions: [{ x: 284, y: 396, w: 232, hasPillars: false }],
      archways: [],
      torches: [
        { x: 540, y: 318 },
        { x: 690, y: 318 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    {
      id: 'sky_altar',
      name: '凌霄祭天坛',
      subtitle: '九幽天顶 · 魁首决战与乾坤倒悬枢机',
      region: 'altar',
      bgKey: 'bg_chapel_spire',
      realm: 'normal',
      mapX: 9,
      mapY: 0,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 500,
      special: 'boss_room',
      bossKind: 'boss_pei_wuji',
      focalX: 1120,
      focalY: 340,
      leftRoomId: 'altar_save',
      leftDoorFloorY: 424,
      // 致敬月下伯爵王座前长阶：由 424 汉白玉丹陛拾级而上登临 340 祭天高坛！
      groundNodes: [
        { x: 0, y: 424, style: 'marble' },
        { x: 380, y: 424, style: 'stairs' },
        { x: 640, y: 340, style: 'marble' },
        { x: 1600, y: 340, style: 'marble' },
      ],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 720, y: 340, scale: 0.95 },
        { kind: 'dragon_brazier', x: 1380, y: 340, scale: 0.95 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [{ x: 240, title: '凌霄登天阙' }],
      torches: [
        { x: 150, y: 348 },
        { x: 330, y: 348 },
        { x: 860, y: 264 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
    },
  ];
}

/**
 * 180° 九幽倒悬里城生成器（完整镜像翻转全部 22 座手工关卡、实心石台与门廊，组成 200% 双城探索终局！）
 */
function createInvertedCastleRooms(normalRooms: BuiltRoom[]): BuiltRoom[] {
  const invertedUpgradePickups: Record<string, ScenePickup[]> = {
    west_armory: [{ id: 'inv_pk_gs3', kind: 'weapon', itemId: 'greatsword_3', x: 520, y: 296 }],
    secret_archive: [{ id: 'inv_pk_sw3', kind: 'weapon', itemId: 'sword_3', x: 390, y: 348 }],
    relic_double_jump: [{ id: 'inv_pk_sp3', kind: 'weapon', itemId: 'spear_3', x: 420, y: 348 }],
    relic_mist_vault: [{ id: 'inv_pk_dg3', kind: 'weapon', itemId: 'daggers_3', x: 480, y: 372 }],
    relic_grapple_vault: [{ id: 'inv_pk_wh3', kind: 'weapon', itemId: 'whip_3', x: 440, y: 348 }],
    relic_wall_vault: [
      { id: 'inv_pk_robe_xn', kind: 'armor', itemId: 'xuanniao_robe', x: 210, y: 360 },
    ],
    relic_ground_slam: [
      { id: 'inv_pk_gourd', kind: 'armor', itemId: 'fortune_gourd', x: 220, y: 372 },
    ],
    library_shop: [
      { id: 'inv_pk_armor_mg', kind: 'armor', itemId: 'mingguang_armor', x: 440, y: 384 },
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

    const baseFloor = flippedNodes[0]?.y ?? rm.focalY;
    for (const sh of flippedShafts) {
      if (sh.dir === 'down') {
        // 为倒悬后的下潜井口自动铺设单向安全木栈板
        const hasGrate = flippedPavilions.some(
          (pv) => Math.abs(pv.y - baseFloor) <= 12 && pv.x <= sh.x1 + 16 && pv.x + pv.w >= sh.x2 - 16
        );
        if (!hasGrate) {
          flippedPavilions.push({
            x: sh.x1 - 6,
            y: baseFloor,
            w: sh.x2 - sh.x1 + 12,
            hasPillars: false,
          });
        }
      } else {
        // 为倒悬后的上跃天井自动增设两级踏脚石台，确保任意层高皆可丝滑跃出顶井！
        const midX = Math.round((sh.x1 + sh.x2) * 0.5) - 75;
        const step1Y = Math.max(220, baseFloor - 125);
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
      rm.special === 'warp_bagua'
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
      bgKey: rm.bgKey,
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
      warpName: rm.warpName ? `里 · ${rm.warpName}` : undefined,
      focalX: W - rm.focalX,
      focalY: rm.focalY,
      sideDoors: flippedSideDoors,
      groundNodes: flippedNodes,
      solidBlocks: mergedSolidBlocks,
      ceilingSpans: isTrueFinalRoom ? [] : openCeilings,
      shafts: flippedShafts,
      clockGears: rm.clockGears?.map((cg) => ({
        ...cg,
        x: W - cg.x,
        speed: -cg.speed,
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
      pickups: invertedUpgradePickups[rm.id] || [],
    };
  });
}

function createBossRushArena(): BuiltRoom {
  return {
    id: 'boss_rush_arena',
    name: '百鬼试炼 · 镇妖塔',
    subtitle: '宿敌连战',
    region: 'altar',
    bgKey: 'bg_molten_forge',
    realm: 'normal',
    mapX: 5,
    mapY: 3,
    gridW: 2,
    gridH: 1,
    pixelW: 1500,
    pixelH: 480,
    special: 'boss_room',
    focalX: 750,
    focalY: 408,
    groundNodes: [
      { x: 0, y: 408, style: 'marble' },
      { x: 1500, y: 408, style: 'marble' },
    ],
    solidBlocks: [
      { x: 180, y: 320, w: 200, h: 28 },
      { x: 1120, y: 320, w: 200, h: 28 },
    ],
    ceilingSpans: [],
    shafts: [],
    decorProps: [
      { kind: 'dragon_brazier', x: 460, y: 408, scale: 0.92 },
      { kind: 'dragon_brazier', x: 1040, y: 408, scale: 0.92 },
    ],
    waterZones: [],
    pavilions: [],
    archways: [{ x: 750, title: '百鬼镇妖塔' }],
    torches: [
      { x: 300, y: 332 },
      { x: 1200, y: 332 },
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
    dir: 'left' | 'right',
    playerY?: number
  ): { nextRoom: BuiltRoom; nextX: number; nextFloorY: number; curFloorY: number } | null {
    const doors = getRoomSideDoors(cur, dir);
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
    return { nextRoom, nextX, nextFloorY, curFloorY: chosen.floorY };
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
    return Math.min(200, pct);
  }
}

export const WorldMap = new CastleWorldRegistry();
