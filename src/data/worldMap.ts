import { AssetKey } from '../game/AssetLoader';
import {
  CastleRealm,
  EnemyKind,
  LanternAnchor,
  RegionId,
  RoomPickupSpawn,
  RoomSpecial,
  SaveSlotData,
} from '../types';

export const TILE_SIZE = 40;
export const CELL_PIXEL_W = 800;
export const CELL_PIXEL_H = 440;
export const MAP_GRID_TOTAL_W = 54;
export const MAP_GRID_TOTAL_H = 30;
export const MAP_LAYOUT_VERSION = 5;

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
  /** 若存在，代表井口覆有【千斤裂地封印石板】，需凭千斤坠震碎（或自下层顶破）后方可贯通！ */
  sealId?: string;
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

export type GateMechanismKind =
  | 'heavy_weapon'
  | 'mist_only'
  | 'lever_shortcut'
  | 'ice_phoenix'
  | 'sluice_tortoise'
  | 'gear_kestrel'
  | 'illusion_fox';

export interface BreakableIronGate {
  id: string;
  x: number;
  topY: number;
  bottomY: number;
  gateKind?: GateMechanismKind;
  /** 当 gateKind === 'lever_shortcut' 时，青铜龙头拉杆所在侧；绕行至该侧拉动铜杆即可永久升起千斤闸！ */
  leverSide?: 'left' | 'right';
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
  kind: 'spikes' | 'pendulum' | 'fire_vent' | 'updraft' | 'arrow_trap';
  x: number;
  y: number;
  /** 地刺宽度 / 摆斧臂长 / 地肺喷火高度 / 升龙风道高度 / 暗箭射程 */
  span: number;
  /** 升龙风道水平宽度 */
  width?: number;
  /** 连弩暗箭墙朝向 */
  dir?: 1 | -1;
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
  gatehouse: '正阳皇城门',
  main_hall: '奉天盘龙殿',
  alchemy: '钦天炼丹司',
  colosseum: '神武演武校场',
  forge: '赤火铸剑坊',
  prison: '九曲寒潭',
  shipyard: '归墟艨艟船坞',
  catacomb: '九幽荒冢',
  nether: '九幽忘川极渊',
  library: '万卷藏书阁',
  opera: '百戏梨园',
  clock_tower: '东垣望月塔',
  altar: '凌霄祭天坛',
};

export const INVERTED_REGION_NAMES: Record<RegionId, string> = {
  gatehouse: '倒悬 · 苦竹渡',
  main_hall: '倒悬 · 盘龙殿',
  alchemy: '倒悬 · 炼丹司',
  colosseum: '倒悬 · 神武场',
  forge: '倒悬 · 铸剑坊',
  prison: '倒悬 · 寒潭狱',
  shipyard: '倒悬 · 沉舰坞',
  catacomb: '倒悬 · 守陵冢',
  nether: '倒悬 · 忘川渊',
  library: '倒悬 · 藏书阁',
  opera: '倒悬 · 百戏台',
  clock_tower: '倒悬 · 望月塔',
  altar: '倒悬 · 祭天坛',
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

export function isInsideDownShaft(
  room: BuiltRoom,
  px: number,
  brokenSecretWalls?: string[]
): boolean {
  for (const sh of room.shafts) {
    if (sh.dir === 'down' && px > sh.x1 + 8 && px < sh.x2 - 8) {
      if (sh.sealId && brokenSecretWalls && !brokenSecretWalls.includes(sh.sealId)) {
        continue;
      }
      return true;
    }
  }
  return false;
}

const ENV_BRIDGE_ASPECT = 279 / 780;
export const BRIDGE_ABUTMENT_DECK_RATIO = 0.568;
export const BRIDGE_CROWN_RISE_RATIO = 0.298;

export interface ArchBridgeGeometry {
  drawX: number;
  drawTopY: number;
  drawW: number;
  drawH: number;
  endRoadY: number;
}

/**
 * 统一三孔石拱桥 (`env_bridge.webp`) 物理碰撞与手绘渲染几何单一事实源：
 * 两端桥头平踏面严格对齐 `0.568 * drawH`（与河岸路面 0px 无缝衔接），桥拱中段按 `0.298 * sin(s * PI)` 贴合石桥面真实弧度！
 */
export function getArchBridgeGeometry(room: BuiltRoom): ArchBridgeGeometry | null {
  if (
    !room.waterZones ||
    room.waterZones.length === 0 ||
    room.waterZones[0].liquidKind === 'lava' ||
    !room.groundNodes ||
    !room.groundNodes.some((n) => n.style === 'arch_bridge')
  ) {
    return null;
  }
  const wz = room.waterZones[0];
  const drawX = wz.x1 - 32;
  const drawW = wz.x2 - wz.x1 + 64;
  const drawH = drawW * ENV_BRIDGE_ASPECT;
  const bridgeStartNode =
    room.groundNodes.find((n) => n.style === 'arch_bridge') ?? room.groundNodes[0];
  const endRoadY = bridgeStartNode ? bridgeStartNode.y : 404;
  const drawTopY = endRoadY - drawH * BRIDGE_ABUTMENT_DECK_RATIO;
  return { drawX, drawTopY, drawW, drawH, endRoadY };
}

export function sampleStairSegmentY(a: GroundNode, b: GroundNode, px: number): number {
  const span = Math.max(1, b.x - a.x);
  const dy = b.y - a.y;
  if (Math.abs(dy) < 12) {
    return a.y + (dy * (px - a.x)) / span;
  }
  const steps = Math.max(2, Math.round(Math.abs(dy) / 11));
  const t = Math.max(0, Math.min(0.9999, (px - a.x) / span));
  const k = Math.floor(t * steps);
  return a.y + (dy * (k + 0.5)) / steps;
}

export function sampleSolidGroundY(room: BuiltRoom, px: number): number {
  const nodes = room.groundNodes;
  if (nodes.length === 0) return 400;

  const bridgeGeo = getArchBridgeGeometry(room);
  if (bridgeGeo && px >= bridgeGeo.drawX && px <= bridgeGeo.drawX + bridgeGeo.drawW) {
    const u = (px - bridgeGeo.drawX) / Math.max(1, bridgeGeo.drawW);
    if (u <= 0.065 || u >= 0.935) {
      return bridgeGeo.endRoadY;
    }
    const s = (u - 0.065) / (0.935 - 0.065);
    return (
      bridgeGeo.drawTopY +
      bridgeGeo.drawH * (BRIDGE_ABUTMENT_DECK_RATIO - BRIDGE_CROWN_RISE_RATIO * Math.sin(s * Math.PI))
    );
  }

  if (px <= nodes[0].x) return nodes[0].y;
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    if (px >= a.x && px <= b.x) {
      if (a.style === 'stairs') {
        return sampleStairSegmentY(a, b, px);
      }
      const t = (px - a.x) / Math.max(1, b.x - a.x);
      return a.y + (b.y - a.y) * t;
    }
  }
  return nodes[nodes.length - 1].y;
}

export function sampleGroundY(
  room: BuiltRoom,
  px: number,
  brokenSecretWalls?: string[]
): number {
  for (const sh of room.shafts) {
    if (sh.dir === 'down' && px > sh.x1 + 8 && px < sh.x2 - 8) {
      if (sh.sealId && (!brokenSecretWalls || !brokenSecretWalls.includes(sh.sealId))) {
        return sampleSolidGroundY(room, px);
      }
      return room.pixelH + 140;
    }
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
    if (px >= pv.x - 4 && px <= pv.x + pv.w + 4 && pv.y >= curY - 22 && pv.y < bestY) {
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
      subtitle: '正阳护城古桥',
      region: 'gatehouse',
      bgKey: 'bg_gatehouse',
      realm: 'normal',
      mapX: 4,
      mapY: 3,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      storyTriggerId: 'intro_gate',
      focalX: 240,
      focalY: 404,
      leftRoomId: 'bridge_save',
      leftDoorFloorY: 404,
      rightRoomId: 'entrance_imperial_plaza',
      rightDoorFloorY: 404,
      groundNodes: [
        { x: 0, y: 404, style: 'flagstone' },
        { x: 350, y: 404, style: 'arch_bridge' },
        { x: 1130, y: 404, style: 'flagstone' },
        { x: 1600, y: 404, style: 'flagstone' },
      ],
      ceilingSpans: [],
      shafts: [],
      waterZones: [{ x1: 350, x2: 1130, surfaceY: 426 }],
      decorProps: [
        { kind: 'dragon_brazier', x: 105, y: 404, scale: 0.9 },
        { kind: 'dragon_brazier', x: 1265, y: 404, scale: 0.9 },
      ],
      pavilions: [],
      archways: [],
      torches: [
        { x: 1185, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [
        {
          id: 'su_qingyan',
          name: '苏清晏',
          title: '钦天监司辰女官',
          x: 295,
          defaultFacing: -1,
        },
      ],
      spawns: [
        { kind: 'paper_swordsman', x: 680 },
        { kind: 'spirit_crow', x: 880, y: 205 },
        { kind: 'bone_archer', x: 1185, y: 404 },
        { kind: 'paper_swordsman', x: 1380 },
      ],
      pickups: [],
    },

    {
      id: 'gate_2',
      name: '皇城端门大殿',
      subtitle: '双层宫门巨殿 · 上通钦天丹司 · 下潜赤火铸坊',
      region: 'gatehouse',
      bgKey: 'bg_gatehouse_interior',
      realm: 'normal',
      indoor: true,
      mapX: 11,
      mapY: 2,
      gridW: 3,
      gridH: 2,
      pixelW: 2400,
      pixelH: 880,
      special: 'none',
      focalX: 1200,
      focalY: 804,
      sideDoors: [
        { side: 'left', floorY: 356, targetRoomId: 'entrance_guard_pavilion', rowOffset: 0 },
        { side: 'left', floorY: 804, targetRoomId: 'entrance_mid_save', rowOffset: 1 },
        { side: 'right', floorY: 356, targetRoomId: 'outer_city_warp', rowOffset: 0 },
        { side: 'right', floorY: 804, targetRoomId: 'gate_save', rowOffset: 1 },
      ],
      groundNodes: [
        { x: 0, y: 804, style: 'marble' },
        { x: 640, y: 804, style: 'stairs' },
        { x: 740, y: 768, style: 'marble' },
        { x: 1620, y: 768, style: 'stairs' },
        { x: 1720, y: 804, style: 'marble' },
        { x: 2400, y: 804, style: 'marble' },
      ],
      // 3×2 双层朱柱穿堂大殿：下层演武丹陛 + 中层雕栏回廊 + 二层东西贯通飞阁 + 登顶钦天炼丹司石阶
      solidBlocks: [
        // 两侧二层接门长廊 (y=356)
        { x: 0, y: 356, w: 380, h: 36 },
        { x: 2020, y: 356, w: 380, h: 36 },
        // 中央由一层拾级登上二层的对称丹陛飞阁阶梯
        { x: 460, y: 684, w: 230, h: 34 },
        { x: 640, y: 598, w: 240, h: 34 },
        { x: 440, y: 514, w: 230, h: 34 },
        { x: 620, y: 432, w: 260, h: 34 },
        { x: 860, y: 356, w: 680, h: 36 }, // 二层中央御道主廊台
        // 东侧由一层通往二层及外城传送室的对称踏台
        { x: 1520, y: 684, w: 220, h: 34 },
        { x: 1710, y: 598, w: 220, h: 34 },
        { x: 1560, y: 514, w: 220, h: 34 },
        { x: 1740, y: 432, w: 240, h: 34 },
        // 二层中央向顶层天井攀登的钦天司云阶 (356 -> 268 -> 182 -> 94)
        { x: 980, y: 268, w: 210, h: 32 },
        { x: 1120, y: 182, w: 220, h: 30 },
        { x: 1160, y: 94, w: 180, h: 28 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 1130, bottomY: 34, style: 'palace_timber' },
        { x1: 1370, x2: 2400, bottomY: 34, style: 'palace_timber' },
      ],
      shafts: [
        { x1: 1780, x2: 1940, dir: 'down', targetRoomId: 'forge_antechamber' },
        { x1: 1130, x2: 1370, dir: 'up', targetRoomId: 'alchemy_foyer' },
      ],
      decorProps: [
        { kind: 'guardian_statue', x: 220, y: 804, scale: 0.96 },
        { kind: 'dragon_brazier', x: 820, y: 768, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1560, y: 768, scale: 0.94 },
        { kind: 'weapon_rack', x: 2180, y: 804, scale: 0.94 },
        { kind: 'incense_burner', x: 1200, y: 356, scale: 0.92 },
        { kind: 'silk_banner', x: 420, y: 196, scale: 0.9 },
        { kind: 'silk_banner', x: 1980, y: 196, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [
        { x: 1774, y: 804, w: 172, hasPillars: false },
        { x: 1080, y: 668, w: 240, hasPillars: true },
      ],
      archways: [],
      torches: [
        { x: 350, y: 728 },
        { x: 955, y: 696 },
        { x: 1425, y: 696 },
        { x: 2040, y: 728 },
        { x: 260, y: 284 },
        { x: 2140, y: 284 },
      ],
      foregrounds: [{ x: 1200, kind: 'hanging_lantern', parallax: 1.18 }],
      lanterns: [
        { x: 410, y: 260 },
        { x: 830, y: 260 },
        { x: 1590, y: 260 },
        { x: 1990, y: 260 },
      ],
      npcs: [],
      spawns: [
        { kind: 'paper_swordsman', x: 520, y: 804 },
        { kind: 'bronze_guard', x: 1200, y: 768 },
        { kind: 'bone_archer', x: 980, y: 356 },
        { kind: 'paper_swordsman', x: 1420, y: 356 },
        { kind: 'lantern_ghost', x: 1760, y: 260 },
      ],
      pickups: [{ id: 'pk_gate2_hp_up', kind: 'max_up', itemId: 'hp_vessel', x: 195, y: 356 }],
    },

    {
      id: 'gate_save',
      name: '端门御渠虹桥廊',
      subtitle: '端门内金水暗渠 · 汉白玉单拱石桥横跨清波',
      region: 'gatehouse',
      bgKey: 'bg_gatehouse_interior',
      realm: 'normal',
      indoor: true,
      mapX: 14,
      mapY: 3,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 440,
      special: 'none',
      focalX: 400,
      focalY: 384,
      leftRoomId: 'gate_2',
      leftDoorFloorY: 384,
      rightRoomId: 'hall_courtyard',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 210, y: 384, style: 'arch_bridge' },
        { x: 590, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      solidBlocks: [],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'weapon_rack', x: 105, y: 384, scale: 0.92 },
        { kind: 'dragon_brazier', x: 695, y: 384, scale: 0.9 },
      ],
      waterZones: [{ x1: 210, x2: 590, surfaceY: 408 }],
      pavilions: [{ x: 290, y: 268, w: 220, hasPillars: false }],
      archways: [],
      torches: [
        { x: 175, y: 312 },
        { x: 625, y: 312 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'corpse_soldier', x: 390, y: 384 },
        { kind: 'spirit_crow', x: 520, y: 190 },
      ],
      pickups: [{ id: 'pk_gate_bridge_yao', kind: 'consumable', itemId: 'jinchuang_yao', x: 400, y: 268 }],
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
      rightRoomId: 'alchemy_foyer',
      rightDoorFloorY: 424,
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
      solidBlocks: [
        { x: 340, y: 312, w: 220, h: 32 },
        { x: 1020, y: 336, w: 190, h: 32 },
        { x: 1140, y: 252, w: 190, h: 32 },
        { x: 1220, y: 168, w: 220, h: 34 },
        { x: 1275, y: 88, w: 170, h: 28 },
      ],
      movingPlatforms: [
        { x1: 635, y1: 318, x2: 795, y2: 244, w: 135, speed: 1.15, style: 'bronze_lift' },
      ],
      ceilingSpans: [
        { x1: 0, x2: 1240, bottomY: 32, style: 'palace_timber' },
        { x1: 1460, x2: 1600, bottomY: 32, style: 'palace_timber' },
      ],
      shafts: [
        { x1: 1240, x2: 1460, dir: 'up', targetRoomId: 'alchemy_save' },
      ],
      decorProps: [
        { kind: 'incense_burner', x: 155, y: 424, scale: 0.94 },
        { kind: 'coiled_pillar', x: 520, y: 392, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1050, y: 424, scale: 0.92 },
        { kind: 'weapon_rack', x: 1480, y: 424, scale: 0.92 },
      ],
      steles: [{ id: 'stele_alchemy_edict', x: 260 }],
      waterZones: [{ x1: 635, x2: 935, surfaceY: 416 }],
      pavilions: [],
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
          x: 752,
          y: 288,
          w: 44,
          h: 96,
          dropKind: 'consumable',
          dropItemId: 'beggar_chicken',
        },
      ],
      decorProps: [
        { kind: 'weapon_rack', x: 485, y: 354, scale: 0.95 },
        { kind: 'dragon_brazier', x: 615, y: 354, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [{ x: 530, y: 288 }],
      foregrounds: [],
      lanterns: [],
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
      shafts: [],
      decorProps: [
        { kind: 'silk_banner', x: 210, y: 248, scale: 0.88 },
        { kind: 'dragon_brazier', x: 640, y: 432, scale: 0.94 },
        { kind: 'chandelier', x: 900, y: 20, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1170, y: 432, scale: 0.94 },
        { kind: 'silk_banner', x: 1340, y: 248, scale: 0.88 },
      ],
      waterZones: [],
      pavilions: [],
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
      region: 'alchemy',
      bgKey: 'bg_alchemy_palace',
      realm: 'normal',
      indoor: true,
      mapX: 12,
      mapY: 0,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 440,
      special: 'save_shrine',
      focalX: 540,
      focalY: 358,
      leftRoomId: 'xiao_boss_hall',
      leftDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 375, y: 384, style: 'stairs' },
        { x: 455, y: 358, style: 'marble' },
        { x: 665, y: 358, style: 'stairs' },
        { x: 735, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [{ x1: 150, x2: 350, dir: 'down', targetRoomId: 'alchemy_lab' }],
      decorProps: [
        { kind: 'incense_burner', x: 115, y: 384, scale: 0.92 },
        { kind: 'incense_burner', x: 645, y: 358, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [{ x: 144, y: 384, w: 212, hasPillars: false }],
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
      focalX: 400,
      focalY: 348,
      leftRoomId: 'west_cliff_watchtower',
      leftDoorFloorY: 196,
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
        { x: 0, y: 196, w: 185, h: 188, blocking: true },
        { x: 290, y: 348, w: 220, h: 36 },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 220, y: 384, scale: 0.9 },
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
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [{ id: 'pk_relic_djump', kind: 'ability', itemId: 'double_jump', x: 400, y: 348 }],
    },

    // ==================== 三、奉天盘龙正殿（3×2 双层皇家金銮宝殿 + 丹陛御苑 + 朝房飞阁 + 中枢八卦室） ====================
    {
      id: 'hall_corridor',
      name: '奉天盘龙正殿',
      subtitle: '皇城双层金銮殿 · 盘龙御阶与青冥剑座',
      region: 'main_hall',
      bgKey: 'bg_main_hall',
      realm: 'normal',
      indoor: true,
      mapX: 17,
      mapY: 3,
      gridW: 3,
      gridH: 2,
      pixelW: 2400,
      pixelH: 880,
      special: 'none',
      storyTriggerId: 'enter_main_hall',
      focalX: 1200,
      focalY: 804,
      sideDoors: [
        { side: 'left', floorY: 356, targetRoomId: 'hall_west_gallery', rowOffset: 0 },
        { side: 'left', floorY: 804, targetRoomId: 'hall_courtyard', rowOffset: 1 },
        { side: 'right', floorY: 804, targetRoomId: 'hall_save', rowOffset: 1 },
      ],
      groundNodes: [
        { x: 0, y: 804, style: 'marble' },
        { x: 520, y: 804, style: 'stairs' },
        { x: 620, y: 768, style: 'marble' },
        { x: 940, y: 768, style: 'stairs' },
        { x: 1040, y: 742, style: 'marble' },
        { x: 1360, y: 742, style: 'stairs' },
        { x: 1460, y: 768, style: 'marble' },
        { x: 1780, y: 768, style: 'stairs' },
        { x: 1880, y: 804, style: 'marble' },
        { x: 2400, y: 804, style: 'marble' },
      ],
      solidBlocks: [
        { x: 0, y: 356, w: 380, h: 36 },
        { x: 460, y: 668, w: 220, h: 34 },
        { x: 640, y: 584, w: 220, h: 34 },
        { x: 470, y: 502, w: 220, h: 34 },
        { x: 660, y: 424, w: 240, h: 34 },
        { x: 920, y: 356, w: 560, h: 36 },
        { x: 1520, y: 432, w: 230, h: 34 },
        { x: 1720, y: 516, w: 220, h: 34 },
        { x: 1540, y: 600, w: 220, h: 34 },
        { x: 1740, y: 684, w: 220, h: 34 },
      ],
      ceilingSpans: [{ x1: 0, x2: 2400, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'silk_banner', x: 210, y: 210, scale: 0.9 },
        { kind: 'coiled_pillar', x: 280, y: 804, scale: 0.96 },
        { kind: 'dragon_brazier', x: 760, y: 768, scale: 0.94 },
        { kind: 'chandelier', x: 1200, y: 20, scale: 0.94 },
        { kind: 'coiled_pillar', x: 1200, y: 742, scale: 0.96 },
        { kind: 'dragon_brazier', x: 1640, y: 768, scale: 0.94 },
        { kind: 'coiled_pillar', x: 2120, y: 804, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 185, y: 726 },
        { x: 880, y: 696 },
        { x: 1520, y: 696 },
        { x: 2215, y: 726 },
        { x: 240, y: 286 },
      ],
      foregrounds: [{ x: 1200, kind: 'hanging_lantern', parallax: 1.2 }],
      lanterns: [
        { x: 420, y: 260 },
        { x: 1020, y: 240 },
        { x: 1380, y: 240 },
        { x: 1960, y: 290 },
      ],
      npcs: [],
      spawns: [
        { kind: 'paper_swordsman', x: 720, y: 768 },
        { kind: 'bronze_guard', x: 1200, y: 742 },
        { kind: 'paper_swordsman', x: 1680, y: 768 },
        { kind: 'scroll_demon', x: 1040, y: 260 },
        { kind: 'bronze_guard', x: 1340, y: 356 },
      ],
      pickups: [
        { id: 'pk_hall_familiar', kind: 'ability', itemId: 'familiar_sword', x: 1200, y: 356 },
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
      mapX: 15,
      mapY: 5,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'warp_bagua',
      warpName: '中枢八卦传送阵',
      focalX: 400,
      focalY: 372,
      leftRoomId: 'central_underpass',
      leftDoorFloorY: 396,
      rightRoomId: 'imperial_aqueduct_west',
      rightDoorFloorY: 396,
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
      clockGears: [],
      ceilingSpans: [
        { x1: 0, x2: 300, bottomY: 32, style: 'palace_timber' },
        { x1: 480, x2: 800, bottomY: 32, style: 'palace_timber' },
      ],
      shafts: [{ x1: 300, x2: 480, dir: 'up', targetRoomId: 'hall_courtyard' }],
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
      focalX: 305,
      focalY: 382,
      leftRoomId: 'forge_molten_hall',
      leftDoorFloorY: 224,
      rightRoomId: 'forge_antechamber',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 245, y: 408, style: 'stairs' },
        { x: 305, y: 382, style: 'marble' },
        { x: 540, y: 382, style: 'stairs' },
        { x: 608, y: 408, style: 'marble' },
        { x: 800, y: 408, style: 'marble' },
      ],
      solidBlocks: [{ x: 0, y: 224, w: 165, h: 184, blocking: true }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 265, y: 382, scale: 0.94 },
        { kind: 'weapon_rack', x: 485, y: 382, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 215, y: 340 },
        { x: 685, y: 340 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [
        {
          id: 'ouye_can',
          name: '欧冶残',
          title: '赤火坊独臂铸剑师',
          x: 365,
          defaultFacing: 1,
        },
      ],
      spawns: [],
      pickups: [],
    },

    {
      id: 'forge_molten_hall',
      name: '赤火熔金巨渠',
      subtitle: '双格熔岩炉道 · 青铜吊台与边军铁札甲',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 10,
      mapY: 5,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 500,
      special: 'none',
      focalX: 800,
      focalY: 408,
      leftRoomId: 'forge_slag_bridge',
      leftDoorFloorY: 408,
      rightRoomId: 'forge_smithy',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 220, y: 408, style: 'stairs' },
        { x: 280, y: 448, style: 'crypt_stone' },
        { x: 680, y: 448, style: 'stairs' },
        { x: 740, y: 392, style: 'crypt_stone' },
        { x: 920, y: 392, style: 'stairs' },
        { x: 980, y: 448, style: 'crypt_stone' },
        { x: 1320, y: 448, style: 'stairs' },
        { x: 1380, y: 408, style: 'crypt_stone' },
        { x: 1600, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 735, y: 288, w: 195, h: 32 },
        { x: 1185, y: 302, w: 155, h: 32 },
      ],
      movingPlatforms: [
        { x1: 290, y1: 356, x2: 550, y2: 356, w: 130, speed: 1.05, style: 'bronze_lift' },
        { x1: 990, y1: 356, x2: 1190, y2: 356, w: 130, speed: 1.05, phase: 2.1, style: 'bronze_lift' },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      ironGate: {
        id: 'gate_forge_molten_heavy',
        x: 1445,
        topY: 0,
        bottomY: 408,
        gateKind: 'heavy_weapon',
      },
      waterZones: [
        { x1: 255, x2: 705, surfaceY: 416, liquidKind: 'lava' },
        { x1: 955, x2: 1345, surfaceY: 416, liquidKind: 'lava' },
      ],
      decorProps: [
        { kind: 'dragon_brazier', x: 135, y: 408, scale: 0.9 },
        { kind: 'weapon_rack', x: 830, y: 392, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1495, y: 408, scale: 0.9 },
      ],
      steles: [{ id: 'stele_forge_arm', x: 195 }],
      pavilions: [],
      archways: [],
      torches: [
        { x: 160, y: 330 },
        { x: 830, y: 318 },
        { x: 1430, y: 330 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 480, y: 185 },
        { x: 1150, y: 185 },
      ],
      npcs: [],
      spawns: [
        { kind: 'lantern_ghost', x: 480, y: 225 },
        { kind: 'bronze_guard', x: 830, y: 392 },
        { kind: 'lantern_ghost', x: 1150, y: 225 },
      ],
      pickups: [
        { id: 'pk_forge_lamellar', kind: 'armor', itemId: 'iron_lamellar', x: 830, y: 288 },
      ],
    },

    {
      id: 'forge_save',
      name: '赤火镇魂古祠',
      subtitle: '镇火巨窟前留档室',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 9,
      mapY: 6,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'save_shrine',
      focalX: 540,
      focalY: 368,
      leftRoomId: 'forge_boss_arena',
      leftDoorFloorY: 396,
      rightRoomId: 'forge_prison_conduit',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'crypt_stone' },
        { x: 435, y: 396, style: 'stairs' },
        { x: 505, y: 368, style: 'marble' },
        { x: 675, y: 368, style: 'stairs' },
        { x: 745, y: 396, style: 'crypt_stone' },
        { x: 800, y: 396, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 180, y: 312, w: 150, h: 30 },
        { x: 240, y: 228, w: 150, h: 30 },
        { x: 285, y: 146, w: 150, h: 28 },
        { x: 300, y: 78, w: 145, h: 26 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 280, bottomY: 36, style: 'crypt_vault' },
        { x1: 460, x2: 800, bottomY: 36, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 280, x2: 460, dir: 'up', targetRoomId: 'forge_slag_bridge' }],
      decorProps: [
        { kind: 'dragon_brazier', x: 135, y: 396, scale: 0.9 },
        { kind: 'incense_burner', x: 655, y: 368, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 160, y: 320 },
        { x: 640, y: 320 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    {
      id: 'forge_boss_arena',
      name: '地肺镇火巨窟',
      subtitle: '赤铜镇火巨灵决战殿',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 9,
      mapY: 4,
      gridW: 2,
      gridH: 1,
      pixelW: 1500,
      pixelH: 480,
      special: 'boss_room',
      bossKind: 'boss_furnace_titan',
      storyTriggerId: 'boss_titan_pre',
      focalX: 620,
      focalY: 408,
      leftRoomId: 'sunken_sluice_cavern',
      leftDoorFloorY: 408,
      rightRoomId: 'forge_save',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 140, y: 408, style: 'stairs' },
        { x: 220, y: 382, style: 'crypt_stone' },
        { x: 380, y: 382, style: 'stairs' },
        { x: 450, y: 408, style: 'crypt_stone' },
        { x: 1050, y: 408, style: 'stairs' },
        { x: 1120, y: 382, style: 'crypt_stone' },
        { x: 1280, y: 382, style: 'stairs' },
        { x: 1360, y: 408, style: 'crypt_stone' },
        { x: 1500, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 185, y: 292, w: 195, h: 30 },
        { x: 640, y: 232, w: 220, h: 28 },
        { x: 1120, y: 292, w: 195, h: 30 },
      ],
      ceilingSpans: [{ x1: 0, x2: 1500, bottomY: 36, style: 'crypt_vault' }],
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
        { kind: 'dragon_brazier', x: 300, y: 382, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1200, y: 382, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [{ x: 304, y: 408, w: 192, hasPillars: false }],
      archways: [],
      torches: [
        { x: 150, y: 322 },
        { x: 750, y: 322 },
        { x: 1350, y: 322 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 460, y: 186 },
        { x: 1040, y: 186 },
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
      leftRoomId: 'mine_crystal_cavern',
      leftDoorFloorY: 408,
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
      clockGears: [],
      ceilingSpans: [
        { x1: 0, x2: 310, bottomY: 32, style: 'crypt_vault' },
        { x1: 490, x2: 800, bottomY: 32, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 310, x2: 490, dir: 'up', targetRoomId: 'forge_boss_arena' }],
      ironGate: {
        id: 'gate_slam_mine_tortoise',
        x: 110,
        topY: 0,
        bottomY: 408,
        gateKind: 'sluice_tortoise',
      },
      decorProps: [{ kind: 'guardian_statue', x: 65, y: 408, scale: 0.92 }],
      waterZones: [{ x1: 135, x2: 260, surfaceY: 420 }],
      pavilions: [],
      archways: [],
      torches: [
        { x: 455, y: 340 },
        { x: 745, y: 340 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [
        { id: 'pk_relic_slam', kind: 'ability', itemId: 'ground_slam', x: 555, y: 372 },
        { id: 'pk_slam_hp', kind: 'max_up', itemId: 'hp_vessel', x: 665, y: 372 },
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
      leftRoomId: 'prison_sluice_entry',
      leftDoorFloorY: 416,
      rightRoomId: 'prison_cellblock',
      rightDoorFloorY: 416,
      groundNodes: [
        { x: 0, y: 416, style: 'crypt_stone' },
        { x: 460, y: 416, style: 'stairs' },
        { x: 525, y: 448, style: 'crypt_stone' },
        { x: 1585, y: 448, style: 'stairs' },
        { x: 1655, y: 416, style: 'crypt_stone' },
        { x: 2000, y: 416, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 220, y: 320, w: 190, h: 32 },
        { x: 610, y: 344, w: 190, h: 104 },
        { x: 960, y: 312, w: 220, h: 136 },
        { x: 1340, y: 344, w: 200, h: 104 },
      ],
      movingPlatforms: [
        { x1: 790, y1: 238, x2: 1290, y2: 238, w: 135, speed: 0.85, style: 'wood_ferry' },
      ],
      ceilingSpans: [{ x1: 0, x2: 2000, bottomY: 32, style: 'crypt_vault' }],
      shafts: [],
      waterZones: [{ x1: 485, x2: 1650, surfaceY: 388 }],
      decorProps: [
        { kind: 'dragon_brazier', x: 135, y: 416, scale: 0.9 },
        { kind: 'dragon_brazier', x: 1760, y: 416, scale: 0.9 },
      ],
      pavilions: [
        { x: 1685, y: 328, w: 215, hasPillars: true },
      ],
      archways: [],
      torches: [
        { x: 700, y: 268 },
        { x: 1070, y: 236 },
        { x: 1440, y: 268 },
        { x: 1840, y: 340 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 720, y: 188 },
        { x: 1440, y: 188 },
        { x: 1790, y: 225 },
      ],
      npcs: [],
      spawns: [
        { kind: 'plague_toad', x: 700, y: 344 },
        { kind: 'lantern_ghost', x: 1070, y: 200 },
        { kind: 'plague_toad', x: 1440, y: 344 },
        { kind: 'bronze_guard', x: 1790, y: 416 },
      ],
      pickups: [
        { id: 'pk_prison_bell', kind: 'armor', itemId: 'qingxin_bell', x: 1070, y: 312 },
        { id: 'pk_prison_bagua', kind: 'weapon', itemId: 'sub:bagua_cross', x: 315, y: 320 },
      ],
    },

    {
      id: 'prison_pre_save',
      name: '镇水殿前古祠',
      subtitle: '万卷妖宗决战前留档室',
      region: 'prison',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      indoor: true,
      mapX: 18,
      mapY: 6,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'save_shrine',
      focalX: 400,
      focalY: 368,
      leftRoomId: 'prison_cellblock',
      leftDoorFloorY: 396,
      rightRoomId: 'prison_boss_hall',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'crypt_stone' },
        { x: 185, y: 396, style: 'stairs' },
        { x: 255, y: 368, style: 'crypt_stone' },
        { x: 545, y: 368, style: 'stairs' },
        { x: 615, y: 396, style: 'crypt_stone' },
        { x: 800, y: 396, style: 'crypt_stone' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'incense_burner', x: 265, y: 368, scale: 0.9 },
        { kind: 'incense_burner', x: 535, y: 368, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 165, y: 318 },
        { x: 635, y: 318 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    {
      id: 'prison_boss_hall',
      name: '寒潭镇水古殿',
      subtitle: '万卷妖宗决战殿',
      region: 'prison',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      indoor: true,
      mapX: 16,
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
      leftRoomId: 'prison_pre_save',
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
      name: '寒潭地脉暗枢',
      subtitle: '连通水牢秘窟与东垣塔底 · 单向铜杆捷径',
      region: 'prison',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      indoor: true,
      mapX: 18,
      mapY: 4,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'none',
      focalX: 255,
      focalY: 366,
      leftRoomId: 'imperial_aqueduct_east',
      leftDoorFloorY: 396,
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
      solidBlocks: [{ x: 155, y: 268, w: 195, h: 30 }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'crypt_vault' }],
      shafts: [{ x1: 500, x2: 700, dir: 'down', targetRoomId: 'relic_mist_vault' }],
      ironGate: {
        id: 'gate_prison_tower_lever',
        x: 715,
        topY: 0,
        bottomY: 396,
        gateKind: 'lever_shortcut',
        leverSide: 'left',
      },
      decorProps: [
        { kind: 'guardian_statue', x: 105, y: 396, scale: 0.9 },
        { kind: 'dragon_brazier', x: 405, y: 396, scale: 0.88 },
      ],
      waterZones: [],
      pavilions: [{ x: 494, y: 396, w: 212, hasPillars: false }],
      archways: [],
      torches: [{ x: 430, y: 318 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [{ kind: 'guixu_water_fiend', x: 255, y: 210 }],
      pickups: [{ id: 'pk_pris_hub_yao', kind: 'consumable', itemId: 'jinchuang_yao', x: 252, y: 268 }],
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
        { side: 'right', floorY: 320, targetRoomId: 'secret_archive', rowOffset: 0 },
        { side: 'left', floorY: 732, targetRoomId: 'upper_library', rowOffset: 1 },
        { side: 'right', floorY: 732, targetRoomId: 'clock_gear_hall', rowOffset: 1 },
        { side: 'left', floorY: 1140, targetRoomId: 'hall_east_vestibule', rowOffset: 2 },
        { side: 'right', floorY: 1140, targetRoomId: 'east_warp', rowOffset: 2 },
        { side: 'left', floorY: 1548, targetRoomId: 'prison_save', rowOffset: 3 },
        { side: 'right', floorY: 1548, targetRoomId: 'dock_sluice_passage', rowOffset: 3 },
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

        // 第2层(732) -> 第1层(320)（二段跳高台）
        { x: 200, y: 536, w: 240, h: 32 },
        { x: 460, y: 320, w: 340, h: 36 }, // 右门台(紫瘴栅后连 secret_archive)
      ],
      climbWalls: [
        { x: 285, topY: 36, bottomY: 240 },
        { x: 530, topY: 36, bottomY: 240 },
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
      shafts: [{ x1: 290, x2: 510, dir: 'up', targetRoomId: 'altar_cloud_bridge' }],
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
      pavilions: [],
      archways: [],
      torches: [
        { x: 145, y: 318 },
        { x: 675, y: 318 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    // ==================== 六、万卷藏书阁 & 万宝斋（致敬月下：藏书库双层书廊 + 深处万宝商铺） ====================
    {
      id: 'upper_library',
      name: '万卷藏书重楼',
      subtitle: '双层翰林巨阁 · 飞天书妖与通天书梯',
      region: 'library',
      bgKey: 'bg_library_opera',
      realm: 'normal',
      indoor: true,
      mapX: 20,
      mapY: 2,
      gridW: 2,
      gridH: 2,
      pixelW: 1600,
      pixelH: 880,
      special: 'none',
      focalX: 800,
      focalY: 804,
      sideDoors: [
        { side: 'left', floorY: 356, targetRoomId: 'library_grand_hall', rowOffset: 0 },
        { side: 'right', floorY: 804, targetRoomId: 'east_outer_tower', rowOffset: 1 },
      ],
      groundNodes: [
        { x: 0, y: 804, style: 'marble' },
        { x: 340, y: 804, style: 'stairs' },
        { x: 420, y: 774, style: 'palace_wood' },
        { x: 1180, y: 774, style: 'stairs' },
        { x: 1260, y: 804, style: 'marble' },
        { x: 1600, y: 804, style: 'marble' },
      ],
      solidBlocks: [
        { x: 0, y: 356, w: 380, h: 36 },
        { x: 360, y: 676, w: 220, h: 34 },
        { x: 640, y: 588, w: 320, h: 34 },
        { x: 1020, y: 502, w: 220, h: 34 },
        { x: 760, y: 424, w: 240, h: 34 },
        { x: 520, y: 356, w: 560, h: 36 },
        { x: 690, y: 248, w: 220, h: 32 },
        { x: 725, y: 118, w: 160, h: 28 },
      ],
      movingPlatforms: [
        {
          x1: 260,
          y1: 502,
          x2: 460,
          y2: 424,
          w: 120,
          speed: 0.78,
          style: 'scholar_ladder',
        },
        {
          x1: 1140,
          y1: 676,
          x2: 1290,
          y2: 588,
          w: 120,
          speed: 0.78,
          phase: 3.14,
          style: 'scholar_ladder',
        },
      ],
      ceilingSpans: [
        { x1: 0, x2: 680, bottomY: 34, style: 'palace_timber' },
        { x1: 920, x2: 1600, bottomY: 34, style: 'palace_timber' },
      ],
      shafts: [{ x1: 680, x2: 920, dir: 'up', targetRoomId: 'opera_foyer' }],
      decorProps: [
        { kind: 'bookshelf', x: 190, y: 804, scale: 0.96 },
        { kind: 'bookshelf', x: 620, y: 774, scale: 0.96 },
        { kind: 'bookshelf', x: 980, y: 774, scale: 0.96 },
        { kind: 'chandelier', x: 1260, y: 22, scale: 0.9 },
        { kind: 'bookshelf', x: 185, y: 356, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 310, y: 724 },
        { x: 800, y: 698 },
        { x: 1320, y: 724 },
        { x: 310, y: 286 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 380, y: 260 },
        { x: 800, y: 185 },
        { x: 1220, y: 320 },
      ],
      npcs: [
        {
          id: 'su_qingyan',
          name: '苏清晏',
          title: '钦天监司辰女官',
          x: 1445,
          defaultFacing: -1,
        },
      ],
      spawns: [
        { kind: 'scroll_demon', x: 540, y: 540 },
        { kind: 'opera_puppet', x: 800, y: 774 },
        { kind: 'scroll_demon', x: 1060, y: 310 },
        { kind: 'bronze_guard', x: 800, y: 356 },
      ],
      pickups: [{ id: 'pk_lib_hp_up', kind: 'max_up', itemId: 'hp_vessel', x: 980, y: 356 }],
    },

    {
      id: 'library_shop',
      name: '藏书万宝斋',
      subtitle: '子夜狐商 · 奇门兵甲丹药铺',
      region: 'library',
      bgKey: 'bg_library_opera',
      realm: 'normal',
      indoor: true,
      mapX: 16,
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
      rightRoomId: 'library_save',
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
      pavilions: [],
      archways: [],
      torches: [{ x: 650, y: 308 }],
      foregrounds: [],
      lanterns: [],
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
      rightRoomId: 'clock_sky_aqueduct',
      rightDoorFloorY: 384,
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
      ],
      clockGears: [],
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
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [
        { id: 'pk_mirror_truth', kind: 'ability', itemId: 'mirror_truth', x: 405, y: 322 },
        { id: 'pk_arch_mp', kind: 'max_up', itemId: 'mp_vessel', x: 515, y: 322 },
      ],
    },

    // ==================== 六之二、子夜百戏鬼市 & 天机钟鼓楼（致敬月下：恶魔城礼拜堂/斗技场 & 时计塔） ====================
    {
      id: 'library_warp',
      name: '梨园悬丝妆台廊',
      subtitle: '百戏后场朱栏步廊 · 悬灯梁下傀儡起舞',
      region: 'opera',
      bgKey: 'bg_library_opera',
      realm: 'normal',
      indoor: true,
      mapX: 15,
      mapY: 1,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 440,
      special: 'none',
      focalX: 400,
      focalY: 416,
      leftRoomId: 'library_automaton_loft',
      leftDoorFloorY: 384,
      rightRoomId: 'opera_dressing_room',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 175, y: 384, style: 'stairs' },
        { x: 245, y: 416, style: 'palace_wood' },
        { x: 555, y: 416, style: 'stairs' },
        { x: 625, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'bookshelf', x: 105, y: 384, scale: 0.9 },
        { kind: 'dragon_brazier', x: 695, y: 384, scale: 0.9 },
        { kind: 'silk_banner', x: 400, y: 196, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [{ x: 270, y: 272, w: 260, hasPillars: true }],
      archways: [],
      torches: [
        { x: 190, y: 312 },
        { x: 610, y: 312 },
      ],
      foregrounds: [],
      lanterns: [{ x: 400, y: 168 }],
      npcs: [],
      spawns: [
        { kind: 'opera_puppet', x: 375, y: 416 },
        { kind: 'opera_puppet', x: 445, y: 272 },
      ],
      pickups: [{ id: 'pk_lib_opera_san', kind: 'consumable', itemId: 'shenxing_san', x: 400, y: 272 }],
    },

    {
      id: 'opera_gallery',
      name: '子夜百戏勾栏',
      subtitle: '三坊红绸戏街 · 悬丝傀儡与升平戏楼',
      region: 'opera',
      bgKey: 'bg_opera_market',
      realm: 'normal',
      indoor: true,
      mapX: 17,
      mapY: 1,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 500,
      special: 'none',
      focalX: 1100,
      focalY: 424,
      leftRoomId: 'opera_dressing_room',
      leftDoorFloorY: 424,
      rightRoomId: 'opera_foyer',
      rightDoorFloorY: 424,
      groundNodes: [
        { x: 0, y: 424, style: 'marble' },
        { x: 320, y: 424, style: 'stairs' },
        { x: 420, y: 392, style: 'palace_wood' },
        { x: 960, y: 392, style: 'stairs' },
        { x: 1060, y: 424, style: 'marble' },
        { x: 1620, y: 424, style: 'stairs' },
        { x: 1710, y: 394, style: 'palace_wood' },
        { x: 1960, y: 394, style: 'stairs' },
        { x: 2040, y: 424, style: 'marble' },
        { x: 2200, y: 424, style: 'marble' },
      ],
      solidBlocks: [
        { x: 920, y: 336, w: 190, h: 34 },
        { x: 1040, y: 248, w: 190, h: 34 },
        { x: 1110, y: 164, w: 190, h: 32 },
        { x: 1140, y: 86, w: 165, h: 28 },
      ],
      movingPlatforms: [
        {
          x1: 520,
          y1: 262,
          x2: 810,
          y2: 262,
          w: 125,
          speed: 0.82,
          style: 'wood_ferry',
        },
        {
          x1: 1460,
          y1: 286,
          x2: 1720,
          y2: 286,
          w: 125,
          speed: 0.82,
          phase: 2.2,
          style: 'wood_ferry',
        },
      ],
      ceilingSpans: [
        { x1: 0, x2: 1110, bottomY: 34, style: 'palace_timber' },
        { x1: 1340, x2: 2200, bottomY: 34, style: 'palace_timber' },
      ],
      shafts: [
        { x1: 1110, x2: 1340, dir: 'up', targetRoomId: 'opera_save' },
      ],
      secretWalls: [
        {
          id: 'sw_opera_wine',
          x: 2152,
          y: 324,
          w: 44,
          h: 100,
          dropKind: 'consumable',
          dropItemId: 'osmanthus_wine',
        },
      ],
      decorProps: [
        { kind: 'silk_banner', x: 150, y: 246, scale: 0.92 },
        { kind: 'chandelier', x: 680, y: 20, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1820, y: 394, scale: 0.9 },
        { kind: 'silk_banner', x: 2060, y: 236, scale: 0.92 },
      ],
      steles: [{ id: 'stele_opera_nuo', x: 260 }],
      waterZones: [],
      pavilions: [
        { x: 175, y: 292, w: 235, hasPillars: true },
      ],
      archways: [],
      torches: [
        { x: 480, y: 318 },
        { x: 1380, y: 348 },
        { x: 1980, y: 322 },
      ],
      foregrounds: [{ x: 1100, kind: 'hanging_lantern', parallax: 1.2 }],
      lanterns: [
        { x: 470, y: 175 },
        { x: 760, y: 165 },
        { x: 1580, y: 185 },
        { x: 1920, y: 210 },
      ],
      npcs: [],
      spawns: [
        { kind: 'opera_puppet', x: 560, y: 392 },
        { kind: 'scroll_demon', x: 820, y: 215 },
        { kind: 'opera_puppet', x: 1460, y: 424 },
        { kind: 'bronze_guard', x: 1860, y: 394 },
      ],
      pickups: [{ id: 'pk_op_wine', kind: 'consumable', itemId: 'tiger_bone_wine', x: 295, y: 292 }],
    },

    {
      id: 'opera_save',
      name: '梨园镇魂古祠',
      subtitle: '登傩台前留档室',
      region: 'opera',
      bgKey: 'bg_opera_market',
      realm: 'normal',
      indoor: true,
      mapX: 18,
      mapY: 0,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 440,
      special: 'save_shrine',
      focalX: 540,
      focalY: 356,
      leftRoomId: 'opera_boss_stage',
      leftDoorFloorY: 384,
      rightRoomId: 'opera_moon_pavilion',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 375, y: 384, style: 'stairs' },
        { x: 445, y: 356, style: 'palace_wood' },
        { x: 665, y: 356, style: 'stairs' },
        { x: 735, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [{ x1: 150, x2: 350, dir: 'down', targetRoomId: 'opera_gallery' }],
      decorProps: [
        { kind: 'silk_banner', x: 110, y: 235, scale: 0.88 },
        { kind: 'incense_burner', x: 645, y: 356, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [{ x: 144, y: 384, w: 218, hasPillars: false }],
      archways: [],
      torches: [
        { x: 215, y: 312 },
        { x: 635, y: 296 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    {
      id: 'opera_boss_stage',
      name: '惊梦百戏傩台',
      subtitle: '惊梦百戏傩神决战殿',
      region: 'opera',
      bgKey: 'bg_opera_market',
      realm: 'normal',
      indoor: true,
      mapX: 16,
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
      rightRoomId: 'opera_save',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 250, y: 408, style: 'stairs' },
        { x: 330, y: 374, style: 'palace_wood' },
        { x: 1170, y: 374, style: 'stairs' },
        { x: 1250, y: 408, style: 'marble' },
        { x: 1500, y: 408, style: 'marble' },
      ],
      solidBlocks: [],
      ceilingSpans: [{ x1: 0, x2: 1500, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'silk_banner', x: 165, y: 248, scale: 0.9 },
        { kind: 'dragon_brazier', x: 365, y: 374, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1135, y: 374, scale: 0.92 },
        { kind: 'silk_banner', x: 1360, y: 248, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 215, y: 340 },
        { x: 1385, y: 340 },
      ],
      foregrounds: [],
      lanterns: [],
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
      leftRoomId: 'colosseum_sky_bridge',
      leftDoorFloorY: 384,
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
      name: '浑天铜轮机巧殿',
      subtitle: '双格枢机巨室 · 旋转青铜浑仪轮与寒星龙胆枪',
      region: 'clock_tower',
      bgKey: 'bg_tower_interior',
      realm: 'normal',
      indoor: true,
      mapX: 23,
      mapY: 3,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 500,
      special: 'none',
      focalX: 800,
      focalY: 442,
      leftRoomId: 'east_outer_tower',
      leftDoorFloorY: 408,
      rightRoomId: 'clock_bell_gallery',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 190, y: 408, style: 'stairs' },
        { x: 265, y: 442, style: 'crypt_stone' },
        { x: 690, y: 442, style: 'stairs' },
        { x: 760, y: 392, style: 'marble' },
        { x: 920, y: 392, style: 'stairs' },
        { x: 990, y: 442, style: 'crypt_stone' },
        { x: 1340, y: 442, style: 'stairs' },
        { x: 1410, y: 408, style: 'marble' },
        { x: 1600, y: 408, style: 'marble' },
      ],
      solidBlocks: [
        { x: 160, y: 316, w: 175, h: 32 },
        { x: 735, y: 224, w: 195, h: 32 },
        { x: 1265, y: 316, w: 175, h: 32 },
      ],
      clockGears: [
        { x: 465, y: 246, radius: 78, speed: 0.62, hasOrbitPlatforms: true },
        { x: 830, y: 356, radius: 60, speed: -0.74, hasOrbitPlatforms: false },
        { x: 1155, y: 246, radius: 78, speed: -0.62, hasOrbitPlatforms: true },
      ],
      movingPlatforms: [
        {
          x1: 775,
          y1: 386,
          x2: 775,
          y2: 266,
          w: 110,
          speed: 0.85,
          style: 'bronze_lift',
        },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 34, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 115, y: 408, scale: 0.9 },
        { kind: 'dragon_brazier', x: 1485, y: 408, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 145, y: 332 },
        { x: 830, y: 318 },
        { x: 1455, y: 332 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 320, y: 185 },
        { x: 1280, y: 185 },
      ],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 480, y: 190 },
        { kind: 'bronze_guard', x: 830, y: 392 },
        { kind: 'bell_gargoyle', x: 1160, y: 190 },
      ],
      pickups: [
        { id: 'pk_spear_2', kind: 'weapon', itemId: 'spear_2', x: 830, y: 224 },
        { id: 'pk_sub_seal', kind: 'weapon', itemId: 'sub:mountain_seal', x: 1350, y: 316 },
      ],
    },

    {
      id: 'clock_save',
      name: '镇钟古祠',
      subtitle: '雷音天阙前留档室',
      region: 'clock_tower',
      bgKey: 'bg_tower_interior',
      realm: 'normal',
      indoor: true,
      mapX: 27,
      mapY: 3,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'save_shrine',
      focalX: 400,
      focalY: 368,
      leftRoomId: 'clock_bell_gallery',
      leftDoorFloorY: 396,
      rightRoomId: 'clock_boss_spire',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'marble' },
        { x: 185, y: 396, style: 'stairs' },
        { x: 255, y: 368, style: 'marble' },
        { x: 545, y: 368, style: 'stairs' },
        { x: 615, y: 396, style: 'marble' },
        { x: 800, y: 396, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'incense_burner', x: 265, y: 368, scale: 0.9 },
        { kind: 'incense_burner', x: 535, y: 368, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 165, y: 318 },
        { x: 635, y: 318 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    {
      id: 'clock_boss_spire',
      name: '雷音镇钟天阙',
      subtitle: '洪武巨钟 · 雷音金翅大鹏王决战殿',
      region: 'clock_tower',
      bgKey: 'bg_tower_interior',
      realm: 'normal',
      indoor: true,
      mapX: 22,
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
      leftRoomId: 'clock_save',
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
      leftRoomId: 'clock_sky_aqueduct',
      leftDoorFloorY: 396,
      rightRoomId: 'outer_wall_armory',
      rightDoorFloorY: 396,
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
        { x: 228, topY: 128, bottomY: 300 },
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
      mapX: 26,
      mapY: 0,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'save_shrine',
      focalX: 400,
      focalY: 364,
      leftRoomId: 'altar_forecourt',
      leftDoorFloorY: 396,
      rightRoomId: 'sky_altar',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'marble' },
        { x: 185, y: 396, style: 'stairs' },
        { x: 255, y: 364, style: 'marble' },
        { x: 545, y: 364, style: 'stairs' },
        { x: 615, y: 396, style: 'marble' },
        { x: 800, y: 396, style: 'marble' },
      ],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 265, y: 364, scale: 0.9 },
        { kind: 'dragon_brazier', x: 535, y: 364, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 155, y: 318 },
        { x: 645, y: 318 },
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
      subtitle: '三层汉白玉圜丘 · 魁首决战与乾坤倒悬枢机',
      region: 'altar',
      bgKey: 'bg_sky_altar',
      realm: 'normal',
      mapX: 27,
      mapY: 0,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 520,
      special: 'boss_room',
      bossKind: 'boss_pei_wuji',
      storyTriggerId: 'boss_pei_pre',
      focalX: 1480,
      focalY: 326,
      leftRoomId: 'altar_save',
      leftDoorFloorY: 424,
      rightRoomId: 'outer_wall_upper',
      rightDoorFloorY: 352,
      groundNodes: [
        { x: 0, y: 424, style: 'marble' },
        { x: 320, y: 424, style: 'stairs' },
        { x: 430, y: 388, style: 'marble' },
        { x: 660, y: 388, style: 'stairs' },
        { x: 770, y: 352, style: 'marble' },
        { x: 1020, y: 352, style: 'stairs' },
        { x: 1130, y: 326, style: 'marble' },
        { x: 1840, y: 326, style: 'stairs' },
        { x: 1940, y: 352, style: 'marble' },
        { x: 2200, y: 352, style: 'marble' },
      ],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'coiled_pillar', x: 480, y: 388, scale: 0.96 },
        { kind: 'dragon_brazier', x: 1180, y: 326, scale: 0.95 },
        { kind: 'dragon_brazier', x: 1780, y: 326, scale: 0.95 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 210, y: 348 },
        { x: 890, y: 278 },
      ],
      foregrounds: [],
      lanterns: [],
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
      solidBlocks: [],
      decorProps: [],
      steles: [{ id: 'stele_outpost_oath', x: 610 }],
      waterZones: [],
      pavilions: [{ x: 24, y: 268, w: 165, hasPillars: true }],
      archways: [],
      torches: [
        { x: 678, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'paper_swordsman', x: 615, y: 404 },
        { kind: 'lantern_ghost', x: 340, y: 255 },
      ],
      pickups: [
        { id: 'pk_outpost_wine', kind: 'consumable', itemId: 'tiger_bone_wine', x: 72, y: 268 },
        { id: 'pk_outpost_heal', kind: 'consumable', itemId: 'jinchuang_yao', x: 142, y: 268 },
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
      rightRoomId: 'forge_catacomb_tunnel',
      rightDoorFloorY: 408,
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
        { id: 'pk_sec_tiger_wine', kind: 'consumable', itemId: 'tiger_bone_wine', x: 465, y: 344 },
        { id: 'pk_sec_jingang', kind: 'consumable', itemId: 'jingang_dan', x: 555, y: 344 },
      ],
    },

    // 4. 九幽白骨冥廊（深层地底墓穴长廊，致敬月下地下墓地 Catacombs！）
    {
      id: 'catacomb_hall',
      name: '九幽白骨冥廊',
      subtitle: '三格帝陵神道 · 蚀骨毒刺与镇墓铜甲卫',
      region: 'catacomb',
      bgKey: 'bg_catacomb_tomb',
      realm: 'normal',
      indoor: true,
      mapX: 15,
      mapY: 7,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 500,
      special: 'none',
      focalX: 1100,
      focalY: 388,
      leftRoomId: 'catacomb_save',
      leftDoorFloorY: 420,
      rightRoomId: 'catacomb_shrine',
      rightDoorFloorY: 420,
      groundNodes: [
        { x: 0, y: 420, style: 'crypt_stone' },
        { x: 380, y: 420, style: 'stairs' },
        { x: 460, y: 450, style: 'crypt_stone' },
        { x: 720, y: 450, style: 'stairs' },
        { x: 820, y: 388, style: 'marble' },
        { x: 1280, y: 388, style: 'stairs' },
        { x: 1380, y: 452, style: 'crypt_stone' },
        { x: 1840, y: 452, style: 'stairs' },
        { x: 1920, y: 420, style: 'crypt_stone' },
        { x: 2200, y: 420, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 520, y: 336, w: 180, h: 32 },
        { x: 960, y: 288, w: 240, h: 32 },
      ],
      movingPlatforms: [
        {
          x1: 1410,
          y1: 396,
          x2: 1690,
          y2: 396,
          w: 125,
          speed: 0.78,
          style: 'wood_ferry',
        },
      ],
      ceilingSpans: [{ x1: 0, x2: 2200, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'guardian_statue', x: 165, y: 420, scale: 0.92 },
        { kind: 'dragon_brazier', x: 860, y: 388, scale: 0.9 },
        { kind: 'dragon_brazier', x: 1240, y: 388, scale: 0.9 },
        { kind: 'guardian_statue', x: 2040, y: 420, scale: 0.92 },
      ],
      steles: [{ id: 'stele_catacomb_origin', x: 1050 }],
      waterZones: [
        { x1: 445, x2: 735, surfaceY: 436 },
        { x1: 1365, x2: 1855, surfaceY: 438 },
      ],
      pavilions: [{ x: 1490, y: 296, w: 230, hasPillars: true }],
      archways: [],
      torches: [
        { x: 340, y: 342 },
        { x: 1050, y: 312 },
        { x: 1960, y: 342 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 600, y: 220 },
        { x: 1080, y: 195 },
        { x: 1605, y: 185 },
      ],
      npcs: [],
      spawns: [
        { kind: 'corpse_soldier', x: 280, y: 420 },
        { kind: 'plague_toad', x: 590, y: 450 },
        { kind: 'bone_archer', x: 1080, y: 288 },
        { kind: 'bronze_guard', x: 1605, y: 296 },
        { kind: 'spirit_crow', x: 1820, y: 215 },
      ],
      pickups: [
        { id: 'pk_cat_poison_dag', kind: 'weapon', itemId: 'daggers_poison', x: 1605, y: 296 },
      ],
    },

    // 5. 独立隐藏密室三：摸金古墓宝库（由守陵古碑耳室西端暗壁破开进入！）
    {
      id: 'secret_catacomb_treasury',
      name: '摸金古墓宝库',
      subtitle: '独立隐藏密室 · 摸金寻宝天师符秘冢',
      region: 'catacomb',
      bgKey: 'bg_catacomb_tomb',
      realm: 'normal',
      indoor: true,
      isSecretRoom: true,
      mapX: 11,
      mapY: 7,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'relic_pedestal',
      focalX: 395,
      focalY: 344,
      leftRoomId: 'forge_catacomb_tunnel',
      leftDoorFloorY: 396,
      rightRoomId: 'catacomb_west_crypt',
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
      ironGate: {
        id: 'gate_mojin_treasury_mist',
        x: 135,
        topY: 0,
        bottomY: 396,
        gateKind: 'mist_only',
      },
      decorProps: [
        { kind: 'guardian_statue', x: 75, y: 396, scale: 0.94 },
        { kind: 'incense_burner', x: 685, y: 396, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 255, y: 318 },
        { x: 535, y: 318 },
      ],
      foregrounds: [],
      lanterns: [],
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
      name: '守陵玄女帝陵殿',
      subtitle: '双格地下玄宫 · 贪狼饮血玉与紫金纳福葫',
      region: 'catacomb',
      bgKey: 'bg_catacomb_tomb',
      realm: 'normal',
      indoor: true,
      mapX: 18,
      mapY: 7,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'relic_pedestal',
      focalX: 1080,
      focalY: 336,
      leftRoomId: 'catacomb_hall',
      leftDoorFloorY: 408,
      rightRoomId: 'catacomb_prison_vault',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 240, y: 408, style: 'stairs' },
        { x: 320, y: 432, style: 'crypt_stone' },
        { x: 680, y: 432, style: 'stairs' },
        { x: 780, y: 372, style: 'marble' },
        { x: 1360, y: 372, style: 'stairs' },
        { x: 1440, y: 408, style: 'crypt_stone' },
        { x: 1600, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 960, y: 336, w: 240, h: 36 },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 36, style: 'crypt_vault' }],
      shafts: [
        {
          x1: 480,
          x2: 650,
          dir: 'down',
          targetRoomId: 'abyss_dragon_spine',
          sealId: 'seal_catacomb_abyss',
        },
      ],
      ironGate: {
        id: 'gate_catacomb_abyss_mist',
        x: 340,
        topY: 0,
        bottomY: 408,
        gateKind: 'mist_only',
      },
      decorProps: [
        { kind: 'guardian_statue', x: 160, y: 408, scale: 0.94 },
        { kind: 'dragon_brazier', x: 840, y: 372, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1310, y: 372, scale: 0.92 },
        { kind: 'guardian_statue', x: 1490, y: 408, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 385, y: 342 },
        { x: 1080, y: 302 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 520, y: 432 },
        { kind: 'demon_wolf', x: 860, y: 372 },
        { kind: 'scroll_demon', x: 1180, y: 215 },
      ],
      pickups: [
        { id: 'pk_shrine_wolf_jade', kind: 'armor', itemId: 'greedy_wolf_jade', x: 1020, y: 336 },
        { id: 'pk_shrine_gourd', kind: 'armor', itemId: 'fortune_gourd', x: 1140, y: 336 },
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
      rightRoomId: 'dock_flooded_hold',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 180, y: 408, style: 'arch_bridge' },
        { x: 530, y: 408, style: 'crypt_stone' },
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [{ x: 535, y: 308, w: 150, h: 32 }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'crypt_vault' }],
      shafts: [{ x1: 565, x2: 715, dir: 'down', targetRoomId: 'abyss_ascension_shaft' }],
      ironGate: {
        id: 'gate_ice_spring_mist',
        x: 505,
        topY: 0,
        bottomY: 408,
        gateKind: 'mist_only',
      },
      waterZones: [{ x1: 180, x2: 530, surfaceY: 428 }],
      decorProps: [{ kind: 'guardian_statue', x: 115, y: 408, scale: 0.92 }],
      pavilions: [
        { x: 245, y: 280, w: 220, hasPillars: false },
        { x: 558, y: 408, w: 164, hasPillars: false },
      ],
      archways: [],
      torches: [{ x: 155, y: 326 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [
        { id: 'pk_sec_sword_frost', kind: 'weapon', itemId: 'sword_frost', x: 355, y: 280 },
        { id: 'pk_sec_jiuzhuan_1', kind: 'consumable', itemId: 'jiuzhuan_jin_dan', x: 610, y: 308 },
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
      leftRoomId: 'alchemy_library_bridge',
      leftDoorFloorY: 352,
      rightRoomId: 'library_shop',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 352, style: 'palace_wood' },
        { x: 435, y: 352, style: 'stairs' },
        { x: 505, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      solidBlocks: [{ x: 395, y: 312, w: 110, h: 72 }],
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
      subtitle: '三格星汉长桥 · 飞燕钩锁高台与天罡聚气扳指',
      region: 'clock_tower',
      bgKey: 'bg_chapel_spire',
      realm: 'normal',
      mapX: 24,
      mapY: 4,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 500,
      special: 'none',
      focalX: 1100,
      focalY: 412,
      leftRoomId: 'east_warp',
      leftDoorFloorY: 412,
      rightRoomId: 'observatory_pavilion',
      rightDoorFloorY: 412,
      groundNodes: [
        { x: 0, y: 412, style: 'marble' },
        { x: 185, y: 412, style: 'stairs' },
        { x: 265, y: 388, style: 'marble' },
        { x: 520, y: 388, style: 'stairs' },
        { x: 600, y: 412, style: 'marble' },
        { x: 1620, y: 412, style: 'stairs' },
        { x: 1700, y: 388, style: 'marble' },
        { x: 1960, y: 388, style: 'stairs' },
        { x: 2040, y: 412, style: 'marble' },
        { x: 2200, y: 412, style: 'marble' },
      ],
      solidBlocks: [
        { x: 880, y: 144, w: 440, h: 268, blocking: true },
      ],
      movingPlatforms: [],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 310, y: 388, scale: 0.92 },
        { kind: 'coiled_pillar', x: 960, y: 144, scale: 0.88 },
        { kind: 'coiled_pillar', x: 1240, y: 144, scale: 0.88 },
        { kind: 'dragon_brazier', x: 1890, y: 388, scale: 0.92 },
      ],
      steles: [{ id: 'stele_observatory_mirror', x: 420 }],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 495, y: 312 },
        { x: 1720, y: 312 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 750, y: 160 },
        { x: 1450, y: 160 },
      ],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 760, y: 235 },
        { kind: 'opera_puppet', x: 1100, y: 144 },
        { kind: 'bell_gargoyle', x: 1620, y: 235 },
      ],
      pickups: [
        { id: 'pk_obs_qi_ring', kind: 'armor', itemId: 'celestial_qi_ring', x: 1100, y: 144 },
      ],
    },

    // 10. 独立隐藏密室六：青莲太白剑冢（由司天浑仪观星台东壁破开进入；倒悬里城此室更封藏终极千影神剑！）
    {
      id: 'secret_sword_tomb',
      name: '青莲太白剑冢',
      subtitle: '独立隐藏密室 · 剑仙遗蜕与仙丹洞天',
      region: 'clock_tower',
      bgKey: 'bg_tower_interior',
      realm: 'normal',
      indoor: true,
      isSecretRoom: true,
      mapX: 28,
      mapY: 4,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'relic_pedestal',
      focalX: 500,
      focalY: 342,
      leftRoomId: 'observatory_pavilion',
      leftDoorFloorY: 396,
      rightRoomId: 'clock_east_bastion',
      rightDoorFloorY: 396,
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
        { x: 605, y: 274, w: 155, hasPillars: false },
      ],
      archways: [],
      torches: [
        { x: 270, y: 318 },
        { x: 625, y: 318 },
      ],
      foregrounds: [],
      lanterns: [],
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
      rightRoomId: 'outer_wall_lower',
      rightDoorFloorY: 408,
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
      shafts: [{ x1: 235, x2: 415, dir: 'down', targetRoomId: 'clock_east_bastion' }],
      ironGate: {
        id: 'gate_thunder_outer_lever',
        x: 120,
        topY: 0,
        bottomY: 408,
        gateKind: 'lever_shortcut',
        leverSide: 'left',
      },
      decorProps: [
        { kind: 'dragon_brazier', x: 115, y: 408, scale: 0.94 },
        { kind: 'giant_bell', x: 640, y: 215, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [{ x: 228, y: 442, w: 194, hasPillars: false }],
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
    alchemy_lab: {
      hazards: [
        { kind: 'pendulum', x: 960, y: 32, span: 150, speed: 1.85, phase: 0.4 },
      ],
    },
    forge_molten_hall: {
      hazards: [
        { kind: 'fire_vent', x: 320, y: 408, span: 142, speed: 3.4, phase: 0 },
        { kind: 'fire_vent', x: 480, y: 408, span: 142, speed: 3.4, phase: 1.7 },
        { kind: 'updraft', x: 615, y: 448, span: 195, width: 78 },
      ],
    },
    secret_forge_smeltery: {
      hazards: [{ kind: 'fire_vent', x: 265, y: 432, span: 135, speed: 3.2, phase: 0.9 }],
    },
    mine_lava_bridge: {
      hazards: [{ kind: 'updraft', x: 1640, y: 416, span: 190, width: 84 }],
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
    opera_gallery: {
      hazards: [
        { kind: 'pendulum', x: 830, y: 34, span: 152, speed: 1.85, phase: 1.1 },
        { kind: 'updraft', x: 1480, y: 424, span: 195, width: 82 },
      ],
    },
    clock_gear_hall: {
      hazards: [
        { kind: 'spikes', x: 235, y: 442, span: 100 },
        { kind: 'spikes', x: 465, y: 442, span: 100 },
        { kind: 'pendulum', x: 400, y: 34, span: 148, speed: 2.05, phase: 0.7 },
        { kind: 'updraft', x: 615, y: 442, span: 185, width: 78 },
        { kind: 'arrow_trap', x: 1360, y: 392, span: 440, dir: -1, speed: 3.0, phase: 1.0 },
      ],
    },
    clock_bell_gallery: {
      hazards: [
        { kind: 'arrow_trap', x: 1120, y: 358, span: 460, dir: -1, speed: 3.1, phase: 0.7 },
      ],
    },
    observatory_bridge: {
      hazards: [
        { kind: 'arrow_trap', x: 880, y: 362, span: 440, dir: -1, speed: 2.9, phase: 0.3 },
      ],
    },
    altar_cloud_bridge: {
      hazards: [{ kind: 'updraft', x: 1100, y: 376, span: 205, width: 86 }],
    },
    catacomb_hall: {
      hazards: [
        { kind: 'spikes', x: 545, y: 450, span: 96 },
        { kind: 'spikes', x: 1190, y: 452, span: 105 },
        { kind: 'pendulum', x: 885, y: 34, span: 156, speed: 1.85, phase: 0.5 },
        { kind: 'arrow_trap', x: 1300, y: 402, span: 500, dir: 1, speed: 3.0, phase: 0.4 },
      ],
    },
    abyss_dragon_spine: {
      hazards: [
        { kind: 'arrow_trap', x: 1550, y: 406, span: 520, dir: -1, speed: 3.0, phase: 0.5 },
      ],
    },
    secret_catacomb_treasury: {
      hazards: [
        { kind: 'spikes', x: 205, y: 428, span: 56 },
        { kind: 'spikes', x: 530, y: 428, span: 56 },
      ],
    },
    secret_sword_tomb: {
      hazards: [{ kind: 'spikes', x: 205, y: 428, span: 100 }],
    },
    clock_pendulum_vault: {
      hazards: [{ kind: 'pendulum', x: 800, y: 36, span: 152, speed: 1.9, phase: 0.5 }],
      crumbleSlabs: [{ id: 'cs_pend_1', x: 1120, y: 644, w: 115 }],
    },
    mine_ember_grotto: {
      hazards: [
        { kind: 'fire_vent', x: 620, y: 408, span: 135, speed: 3.3, phase: 0.4 },
        { kind: 'updraft', x: 1040, y: 408, span: 175, width: 78 },
      ],
    },
    mine_obsidian_hall: {
      hazards: [
        { kind: 'fire_vent', x: 940, y: 760, span: 140, speed: 3.4, phase: 0.8 },
        { kind: 'updraft', x: 1300, y: 760, span: 185, width: 82 },
      ],
    },
    nether_bone_vault: {
      hazards: [{ kind: 'pendulum', x: 420, y: 36, span: 145, speed: 1.9, phase: 0.7 }],
      crumbleSlabs: [{ id: 'cs_nbone_1', x: 1120, y: 536, w: 115 }],
    },
    dock_reef_descent: {
      hazards: [{ kind: 'updraft', x: 320, y: 2516, span: 200, width: 84 }],
      crumbleSlabs: [{ id: 'cs_dock_reef_1', x: 240, y: 1960, w: 115 }],
    },
    dock_sunken_galleon: {
      hazards: [
        { kind: 'pendulum', x: 940, y: 36, span: 155, speed: 1.85, phase: 0.3 },
        { kind: 'updraft', x: 1320, y: 760, span: 185, width: 82 },
      ],
    },
    dock_trench_lantern: {
      hazards: [{ kind: 'updraft', x: 960, y: 408, span: 180, width: 80 }],
      crumbleSlabs: [{ id: 'cs_trench_1', x: 900, y: 292, w: 115 }],
    },
    dock_pearl_grotto: {
      hazards: [{ kind: 'pendulum', x: 800, y: 36, span: 150, speed: 1.85, phase: 1.1 }],
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
    'entrance_guard_pavilion',
    'library_grand_hall',
    'outer_wall_battlement',
    'celestial_bell_sanctum',
    'nether_trial_colosseum',
  ]);

  // ==================== 第一幕 · 正阳皇城门（苍竹野径 -> 桥头古祠 -> 正阳古桥 -> 4×2 朱雀天街巨型广场 + 城楼箭台 + 巡防兵阁 + 街心古祠 -> 3×2 端门大殿） ====================
  const entranceStageRooms: BuiltRoom[] = [
    {
      id: 'entrance_bamboo_woods',
      name: '苦竹荒冢林道',
      subtitle: '城郊野径 · 破土阴兵与踏云高崖秘径',
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
      rightRoomId: 'bridge_save',
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
        { x: 1290, y: 228, w: 160, h: 30 },
        { x: 1150, y: 146, w: 155, h: 28 },
      ],
      ceilingSpans: [],
      shafts: [
        {
          x1: 560,
          x2: 740,
          dir: 'down',
          targetRoomId: 'bamboo_cliff_grotto',
          sealId: 'seal_bamboo_grotto',
        },
        {
          x1: 1140,
          x2: 1320,
          dir: 'up',
          targetRoomId: 'cliff_pine_trail',
        },
      ],
      decorProps: [
        { kind: 'guardian_statue', x: 205, y: 404, scale: 0.9 },
        { kind: 'dragon_brazier', x: 1035, y: 392, scale: 0.88 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 315, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'corpse_soldier', x: 485, y: 432 },
        { kind: 'spirit_crow', x: 690, y: 195 },
        { kind: 'corpse_soldier', x: 960, y: 392 },
        { kind: 'spirit_crow', x: 1190, y: 185 },
        { kind: 'corpse_soldier', x: 1350, y: 404 },
      ],
      pickups: [
        { id: 'pk_woods_heal', kind: 'consumable', itemId: 'jinchuang_yao', x: 1015, y: 392 },
      ],
    },

    {
      id: 'bridge_save',
      name: '断桥驿亭古祠',
      subtitle: '护城桥头留档亭',
      region: 'gatehouse',
      bgKey: 'bg_bamboo_cliff',
      realm: 'normal',
      indoor: false,
      mapX: 3,
      mapY: 3,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'save_shrine',
      focalX: 400,
      focalY: 372,
      leftRoomId: 'entrance_bamboo_woods',
      leftDoorFloorY: 404,
      rightRoomId: 'gate_1',
      rightDoorFloorY: 404,
      groundNodes: [
        { x: 0, y: 404, style: 'flagstone' },
        { x: 195, y: 404, style: 'stairs' },
        { x: 265, y: 372, style: 'marble' },
        { x: 535, y: 372, style: 'stairs' },
        { x: 605, y: 404, style: 'flagstone' },
        { x: 800, y: 404, style: 'flagstone' },
      ],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'incense_burner', x: 275, y: 372, scale: 0.9 },
        { kind: 'incense_burner', x: 525, y: 372, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 165, y: 332 },
        { x: 635, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    // 入城首座 4×2 八格巨型立体无缝广场：彻底告别“进门地牢”，展现大靖旧都正阳朱雀天街与重檐游廊！
    {
      id: 'entrance_imperial_plaza',
      name: '正阳朱雀天街',
      subtitle: '外城四街巨阙 · 双层飞檐游廊与御道石狮',
      region: 'gatehouse',
      bgKey: 'bg_city_avenue',
      realm: 'normal',
      indoor: false,
      mapX: 6,
      mapY: 2,
      gridW: 4,
      gridH: 2,
      pixelW: 3200,
      pixelH: 900,
      special: 'none',
      focalX: 1600,
      focalY: 804,
      sideDoors: [
        { side: 'left', floorY: 356, targetRoomId: 'entrance_battlement_tower', rowOffset: 0 },
        { side: 'left', floorY: 804, targetRoomId: 'gate_1', rowOffset: 1 },
        { side: 'right', floorY: 356, targetRoomId: 'entrance_guard_pavilion', rowOffset: 0 },
        { side: 'right', floorY: 804, targetRoomId: 'entrance_mid_save', rowOffset: 1 },
      ],
      groundNodes: [
        { x: 0, y: 804, style: 'marble' },
        { x: 620, y: 804, style: 'stairs' },
        { x: 720, y: 774, style: 'marble' },
        { x: 1190, y: 774, style: 'arch_bridge' },
        { x: 1970, y: 774, style: 'marble' },
        { x: 2440, y: 774, style: 'stairs' },
        { x: 2540, y: 804, style: 'marble' },
        { x: 3200, y: 804, style: 'marble' },
      ],
      // 4×2 立体双层皇城天街：西端登城墙箭楼云阶 + 中轴天街飞阁游廊 + 东端巡防兵阁高廊
      solidBlocks: [
        // 东西两端二层城垣接门长台 (y=356)
        { x: 0, y: 356, w: 420, h: 36 },
        { x: 2780, y: 356, w: 420, h: 36 },
        // 西侧由朱雀街拾级登上【正阳城楼箭台】的飞檐街楼石阶 (774 -> 690 -> 604 -> 518 -> 436 -> 356)
        { x: 740, y: 690, w: 230, h: 34 },
        { x: 540, y: 604, w: 230, h: 34 },
        { x: 720, y: 518, w: 230, h: 34 },
        { x: 480, y: 436, w: 250, h: 34 },
        // 天街中央上空横跨的朱漆雕栏望月天桥 (y=412 / y=332)
        { x: 1120, y: 486, w: 260, h: 34 },
        { x: 1440, y: 404, w: 340, h: 34 },
        { x: 1840, y: 486, w: 260, h: 34 },
        // 东侧由朱雀街拾级登上【朱雀巡防兵阁】的演武街楼阶梯
        { x: 2180, y: 690, w: 230, h: 34 },
        { x: 2380, y: 604, w: 230, h: 34 },
        { x: 2190, y: 518, w: 230, h: 34 },
        { x: 2450, y: 436, w: 260, h: 34 },
      ],
      ceilingSpans: [],
      // 御道拱桥西侧桥头设隐秘下水石井，直潜正下方【御河桥下暗渠】寻宝
      shafts: [{ x1: 985, x2: 1140, dir: 'down', targetRoomId: 'entrance_moat_cavern' }],
      decorProps: [
        { kind: 'guardian_statue', x: 465, y: 804, scale: 0.96 },
        { kind: 'dragon_brazier', x: 860, y: 774, scale: 0.94 },
        { kind: 'dragon_brazier', x: 2265, y: 774, scale: 0.94 },
        { kind: 'guardian_statue', x: 2635, y: 804, scale: 0.96 },
        { kind: 'incense_burner', x: 1610, y: 404, scale: 0.9 },
      ],
      waterZones: [{ x1: 1190, x2: 1970, surfaceY: 818 }],
      pavilions: [
        { x: 978, y: 774, w: 174, hasPillars: false },
      ],
      archways: [],
      torches: [
        { x: 965, y: 702 },
        { x: 2235, y: 702 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'paper_swordsman', x: 520, y: 804 },
        { kind: 'demon_wolf', x: 1020, y: 774 },
        { kind: 'paper_swordsman', x: 1620 },
        { kind: 'demon_wolf', x: 2340, y: 774 },
        { kind: 'bronze_guard', x: 2760, y: 804 },
        { kind: 'bone_archer', x: 610, y: 604 },
        { kind: 'paper_swordsman', x: 1600, y: 404 },
        { kind: 'bone_archer', x: 2490, y: 604 },
        { kind: 'spirit_crow', x: 1350, y: 280 },
      ],
      pickups: [
        { id: 'pk_inner_court_wine', kind: 'consumable', itemId: 'tiger_bone_wine', x: 1610, y: 404 },
      ],
    },

    {
      id: 'entrance_battlement_tower',
      name: '正阳城楼箭台',
      subtitle: '城头飞檐 · 神臂弩阵与点钢长枪',
      region: 'gatehouse',
      bgKey: 'bg_gatehouse',
      realm: 'normal',
      indoor: false,
      mapX: 4,
      mapY: 2,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 800,
      focalY: 396,
      leftRoomId: 'west_cliff_pagoda',
      leftDoorFloorY: 372,
      rightRoomId: 'entrance_imperial_plaza',
      rightDoorFloorY: 396,
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
        { x: 760, y: 248, w: 200, h: 30 },
      ],
      ceilingSpans: [],
      shafts: [{ x1: 560, x2: 740, dir: 'up', targetRoomId: 'west_cliff_skybridge' }],
      ironGate: {
        id: 'gate_battlement_pagoda_lever',
        x: 350,
        topY: 34,
        bottomY: 372,
        gateKind: 'lever_shortcut',
        leverSide: 'left',
      },
      decorProps: [
        { kind: 'weapon_rack', x: 260, y: 372, scale: 0.92 },
        { kind: 'dragon_brazier', x: 465, y: 408, scale: 0.9 },
        { kind: 'dragon_brazier', x: 1360, y: 396, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 430, y: 332 },
        { x: 1220, y: 324 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bone_archer', x: 860, y: 248 },
        { kind: 'spirit_crow', x: 520, y: 185 },
        { kind: 'bone_archer', x: 220, y: 276 },
        { kind: 'paper_swordsman', x: 760, y: 408 },
      ],
      pickups: [
        { id: 'pk_battlement_spear', kind: 'weapon', itemId: 'spear_1', x: 195, y: 276 },
        { id: 'pk_battlement_mp', kind: 'consumable', itemId: 'huiqi_dan', x: 880, y: 248 },
      ],
    },

    {
      id: 'entrance_moat_cavern',
      name: '御河桥下暗渠',
      subtitle: '天街桥底水关 · 寒潭石墩与藏肉暗壁',
      region: 'gatehouse',
      bgKey: 'bg_moat_sluice',
      realm: 'normal',
      indoor: true,
      mapX: 7,
      mapY: 4,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 500,
      special: 'none',
      focalX: 800,
      focalY: 408,
      leftRoomId: 'moat_west_tunnel',
      leftDoorFloorY: 408,
      rightRoomId: 'forge_moat_sluice',
      rightDoorFloorY: 408,
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
      shafts: [{ x1: 395, x2: 575, dir: 'up', targetRoomId: 'entrance_imperial_plaza' }],
      secretWalls: [
        {
          id: 'sec_wall_moat_chicken',
          x: 470,
          y: 312,
          w: 44,
          h: 96,
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
        { kind: 'spirit_crow', x: 960, y: 175 },
        { kind: 'plague_toad', x: 1065, y: 356 },
      ],
      pickups: [
        { id: 'pk_moat_leather', kind: 'armor', itemId: 'leather_armor', x: 1475, y: 408 },
      ],
    },

    {
      id: 'entrance_guard_pavilion',
      name: '朱雀巡防兵阁',
      subtitle: '上层城防武阁 · 守城将校值房',
      region: 'gatehouse',
      bgKey: 'bg_gatehouse_interior',
      realm: 'normal',
      indoor: true,
      mapX: 10,
      mapY: 3,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'none',
      focalX: 400,
      focalY: 396,
      leftRoomId: 'entrance_imperial_plaza',
      leftDoorFloorY: 396,
      rightRoomId: 'gate_2',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'marble' },
        { x: 210, y: 396, style: 'stairs' },
        { x: 280, y: 368, style: 'marble' },
        { x: 520, y: 368, style: 'stairs' },
        { x: 590, y: 396, style: 'marble' },
        { x: 800, y: 396, style: 'marble' },
      ],
      solidBlocks: [{ x: 260, y: 268, w: 280, h: 32 }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'weapon_rack', x: 185, y: 396, scale: 0.94 },
        { kind: 'dragon_brazier', x: 400, y: 368, scale: 0.92 },
        { kind: 'weapon_rack', x: 615, y: 396, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 150, y: 318 },
        { x: 650, y: 318 },
      ],
      foregrounds: [],
      lanterns: [{ x: 400, y: 180 }],
      npcs: [],
      spawns: [
        { kind: 'paper_swordsman', x: 320, y: 368 },
        { kind: 'bone_archer', x: 490, y: 268 },
      ],
      pickups: [
        { id: 'pk_guard_sword1', kind: 'weapon', itemId: 'sword_1', x: 350, y: 268 },
        { id: 'pk_guard_pav_heal', kind: 'consumable', itemId: 'jinchuang_yao', x: 455, y: 268 },
      ],
    },

    {
      id: 'entrance_mid_save',
      name: '御街甲仗巡防庑',
      subtitle: '天街东段宿卫兵庑 · 双层木架陈列刀枪火器',
      region: 'gatehouse',
      bgKey: 'bg_gatehouse_interior',
      realm: 'normal',
      indoor: true,
      mapX: 10,
      mapY: 3,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 440,
      special: 'none',
      focalX: 400,
      focalY: 412,
      leftRoomId: 'entrance_imperial_plaza',
      leftDoorFloorY: 384,
      rightRoomId: 'gate_2',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 170, y: 384, style: 'stairs' },
        { x: 240, y: 412, style: 'flagstone' },
        { x: 560, y: 412, style: 'stairs' },
        { x: 630, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      solidBlocks: [
        { x: 120, y: 286, w: 190, h: 30 },
        { x: 490, y: 286, w: 190, h: 30 },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'weapon_rack', x: 330, y: 412, scale: 0.92 },
        { kind: 'dragon_brazier', x: 470, y: 412, scale: 0.9 },
        { kind: 'silk_banner', x: 400, y: 192, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 95, y: 312 },
        { x: 705, y: 312 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'paper_swordsman', x: 380, y: 412 },
        { kind: 'bone_archer', x: 585, y: 286 },
      ],
      pickups: [{ id: 'pk_mid_armory_wine', kind: 'consumable', itemId: 'tiger_bone_wine', x: 215, y: 286 }],
    },

    {
      id: 'outer_city_warp',
      name: '端门东翼望楼库',
      subtitle: '朱雀内城双层军械角楼 · 绝顶封藏【天山雪莲】',
      region: 'gatehouse',
      bgKey: 'bg_gatehouse_interior',
      realm: 'normal',
      indoor: true,
      mapX: 14,
      mapY: 2,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 440,
      special: 'none',
      focalX: 470,
      focalY: 344,
      leftRoomId: 'gate_2',
      leftDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 390, y: 384, style: 'stairs' },
        { x: 470, y: 344, style: 'marble' },
        { x: 800, y: 344, style: 'marble' },
      ],
      solidBlocks: [
        { x: 210, y: 292, w: 185, h: 30 },
        { x: 455, y: 216, w: 225, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'weapon_rack', x: 125, y: 384, scale: 0.94 },
        { kind: 'guardian_statue', x: 705, y: 344, scale: 0.92 },
        { kind: 'silk_banner', x: 565, y: 148, scale: 0.88 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 340, y: 312 },
        { x: 615, y: 272 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 560, y: 344 },
        { kind: 'bone_archer', x: 300, y: 292 },
      ],
      pickups: [
        { id: 'pk_outer_watch_mp', kind: 'max_up', itemId: 'mp_vessel', x: 565, y: 216 },
        { id: 'pk_outer_watch_chicken', kind: 'consumable', itemId: 'beggar_chicken', x: 640, y: 344 },
      ],
    },
  ];

  // ==================== 第二至终幕 · 全关卡建筑空间拓展房间群（共 22 座全新殿宇、廊院、暗渠与云阶神道！） ====================
  const allStagesExpandedRooms: BuiltRoom[] = [
    // --- 第二幕 · 奉天盘龙殿拓展 (4 座) ---
    {
      id: 'hall_courtyard',
      name: '奉天丹陛前庑',
      subtitle: '入殿汉白玉穿堂庑廊 · 上通西配殿下接乾坤阵',
      region: 'main_hall',
      bgKey: 'bg_gatehouse_interior',
      realm: 'normal',
      indoor: true,
      mapX: 15,
      mapY: 4,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 500,
      special: 'none',
      focalX: 800,
      focalY: 404,
      leftRoomId: 'gate_save',
      leftDoorFloorY: 404,
      rightRoomId: 'hall_corridor',
      rightDoorFloorY: 404,
      groundNodes: [
        { x: 0, y: 404, style: 'marble' },
        { x: 460, y: 404, style: 'stairs' },
        { x: 560, y: 372, style: 'marble' },
        { x: 1080, y: 372, style: 'stairs' },
        { x: 1180, y: 404, style: 'marble' },
        { x: 1600, y: 404, style: 'marble' },
      ],
      solidBlocks: [
        { x: 840, y: 212, w: 200, h: 30 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 840, bottomY: 34, style: 'palace_timber' },
        { x1: 1040, x2: 1600, bottomY: 34, style: 'palace_timber' },
      ],
      shafts: [
        { x1: 280, x2: 440, dir: 'down', targetRoomId: 'central_warp' },
        { x1: 840, x2: 1040, dir: 'up', targetRoomId: 'hall_west_gallery' },
      ],
      decorProps: [
        { kind: 'guardian_statue', x: 180, y: 404, scale: 0.94 },
        { kind: 'dragon_brazier', x: 610, y: 372, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1030, y: 372, scale: 0.92 },
        { kind: 'guardian_statue', x: 1420, y: 404, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [{ x: 274, y: 404, w: 172, hasPillars: false }],
      archways: [],
      torches: [
        { x: 480, y: 332 },
        { x: 1210, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'paper_swordsman', x: 640, y: 372 },
        { kind: 'bone_archer', x: 940, y: 212 },
        { kind: 'bronze_guard', x: 1280, y: 404 },
      ],
      pickups: [{ id: 'pk_suodi_hall', kind: 'consumable', itemId: 'suodi_talisman', x: 760, y: 372 }],
    },
    {
      id: 'hall_west_gallery',
      name: '西华朝房飞阁',
      subtitle: '上层御前武廊 · 生铁九节鞭与百官值庐',
      region: 'main_hall',
      bgKey: 'bg_main_hall',
      realm: 'normal',
      indoor: true,
      mapX: 15,
      mapY: 3,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 800,
      focalY: 404,
      rightRoomId: 'hall_corridor',
      rightDoorFloorY: 404,
      groundNodes: [
        { x: 0, y: 404, style: 'marble' },
        { x: 260, y: 404, style: 'stairs' },
        { x: 340, y: 372, style: 'palace_wood' },
        { x: 780, y: 372, style: 'stairs' },
        { x: 860, y: 404, style: 'marble' },
        { x: 1600, y: 404, style: 'marble' },
      ],
      solidBlocks: [
        { x: 140, y: 274, w: 230, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 36, style: 'palace_timber' }],
      shafts: [{ x1: 840, x2: 1040, dir: 'down', targetRoomId: 'hall_courtyard' }],
      decorProps: [
        { kind: 'weapon_rack', x: 110, y: 404, scale: 0.94 },
        { kind: 'bookshelf', x: 520, y: 372, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1380, y: 404, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [{ x: 834, y: 404, w: 212, hasPillars: false }],
      archways: [],
      torches: [
        { x: 420, y: 328 },
        { x: 1220, y: 328 },
      ],
      secretWalls: [
        {
          id: 'sw_hall_west_jg',
          x: 8,
          y: 308,
          w: 44,
          h: 96,
          dropKind: 'consumable',
          dropItemId: 'jingang_dan',
        },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'paper_swordsman', x: 460, y: 372 },
        { kind: 'lantern_ghost', x: 720, y: 225 },
        { kind: 'bone_archer', x: 1250, y: 404 },
      ],
      pickups: [
        { id: 'pk_hall_whip1', kind: 'weapon', itemId: 'whip_1', x: 215, y: 274 },
        { id: 'pk_hall_mp1', kind: 'consumable', itemId: 'huiqi_dan', x: 305, y: 274 },
      ],
    },
    {
      id: 'hall_save',
      name: '文华殿丹青回廊',
      subtitle: '奉天东翼朱漆敞轩 · 画屏书卷间暗藏杀机',
      region: 'main_hall',
      bgKey: 'bg_main_hall',
      realm: 'normal',
      indoor: true,
      mapX: 20,
      mapY: 4,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 440,
      special: 'none',
      focalX: 400,
      focalY: 414,
      leftRoomId: 'hall_corridor',
      leftDoorFloorY: 384,
      rightRoomId: 'hall_east_vestibule',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 180, y: 384, style: 'stairs' },
        { x: 250, y: 414, style: 'palace_wood' },
        { x: 550, y: 414, style: 'stairs' },
        { x: 620, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'bookshelf', x: 105, y: 384, scale: 0.92 },
        { kind: 'coiled_pillar', x: 695, y: 384, scale: 0.92 },
        { kind: 'silk_banner', x: 400, y: 188, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [{ x: 265, y: 268, w: 270, hasPillars: true }],
      archways: [],
      torches: [
        { x: 195, y: 312 },
        { x: 605, y: 312 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'paper_swordsman', x: 380, y: 414 },
        { kind: 'lantern_ghost', x: 480, y: 205 },
      ],
      pickups: [{ id: 'pk_hall_gallery_dan', kind: 'consumable', itemId: 'huiqi_dan', x: 400, y: 268 }],
    },
    {
      id: 'hall_east_vestibule',
      name: '东华须弥偏殿',
      subtitle: '丈余须弥石崖 · 踏云二段跳东进门户',
      region: 'main_hall',
      bgKey: 'bg_main_hall',
      realm: 'normal',
      indoor: true,
      mapX: 21,
      mapY: 4,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 520,
      special: 'none',
      focalX: 400,
      focalY: 432,
      leftRoomId: 'hall_save',
      leftDoorFloorY: 432,
      rightRoomId: 'east_outer_tower',
      rightDoorFloorY: 264,
      groundNodes: [
        { x: 0, y: 432, style: 'marble' },
        { x: 800, y: 432, style: 'marble' },
      ],
      solidBlocks: [
        { x: 500, y: 264, w: 300, h: 168, blocking: true },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'coiled_pillar', x: 195, y: 432, scale: 0.96 },
        { kind: 'dragon_brazier', x: 395, y: 432, scale: 0.92 },
        { kind: 'silk_banner', x: 640, y: 186, scale: 0.88 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 135, y: 352 },
        { x: 640, y: 190 },
      ],
      foregrounds: [],
      lanterns: [{ x: 340, y: 235 }],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 320, y: 432 },
      ],
      pickups: [],
    },

    // --- 第三幕 · 钦天炼丹司拓展 (2 座) ---
    {
      id: 'alchemy_foyer',
      name: '钦天迎仙前殿',
      subtitle: '紫微八卦炉庭 · 上接端门云梯',
      region: 'alchemy',
      bgKey: 'bg_alchemy_palace',
      realm: 'normal',
      indoor: true,
      mapX: 11,
      mapY: 2,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 500,
      special: 'none',
      focalX: 800,
      focalY: 424,
      leftRoomId: 'alchemy_lab',
      leftDoorFloorY: 424,
      rightRoomId: 'alchemy_herb_garden',
      rightDoorFloorY: 424,
      groundNodes: [
        { x: 0, y: 424, style: 'marble' },
        { x: 320, y: 424, style: 'stairs' },
        { x: 400, y: 392, style: 'marble' },
        { x: 960, y: 392, style: 'stairs' },
        { x: 1040, y: 424, style: 'marble' },
        { x: 1600, y: 424, style: 'marble' },
      ],
      solidBlocks: [
        { x: 565, y: 236, w: 190, h: 30 },
        { x: 580, y: 96, w: 160, h: 26 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 560, bottomY: 34, style: 'palace_timber' },
        { x1: 760, x2: 1600, bottomY: 34, style: 'palace_timber' },
      ],
      shafts: [
        { x1: 560, x2: 760, dir: 'up', targetRoomId: 'alchemy_fire_sanctum' },
        { x1: 1130, x2: 1370, dir: 'down', targetRoomId: 'gate_2' },
      ],
      decorProps: [
        { kind: 'dragon_brazier', x: 210, y: 424, scale: 0.92 },
        { kind: 'incense_burner', x: 820, y: 392, scale: 0.94 },
        { kind: 'coiled_pillar', x: 1460, y: 424, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [{ x: 1124, y: 424, w: 252, hasPillars: false }],
      archways: [],
      torches: [
        { x: 310, y: 348 },
        { x: 990, y: 348 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'paper_swordsman', x: 480, y: 392 },
        { kind: 'scroll_demon', x: 650, y: 195 },
        { kind: 'bone_archer', x: 860, y: 392 },
      ],
      pickups: [{ id: 'pk_suodi_alch', kind: 'consumable', itemId: 'suodi_talisman', x: 760, y: 392 }],
    },
    {
      id: 'alchemy_herb_garden',
      name: '紫微丹鼎东庑',
      subtitle: '御制灵药值房 · 云纹蚕丝软甲',
      region: 'alchemy',
      bgKey: 'bg_alchemy_palace',
      realm: 'normal',
      indoor: true,
      mapX: 13,
      mapY: 2,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'none',
      focalX: 480,
      focalY: 368,
      leftRoomId: 'alchemy_foyer',
      leftDoorFloorY: 396,
      rightRoomId: 'alchemy_library_bridge',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'marble' },
        { x: 220, y: 396, style: 'stairs' },
        { x: 290, y: 368, style: 'marble' },
        { x: 620, y: 368, style: 'stairs' },
        { x: 690, y: 396, style: 'marble' },
        { x: 800, y: 396, style: 'marble' },
      ],
      solidBlocks: [{ x: 350, y: 272, w: 220, h: 32 }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'bookshelf', x: 155, y: 396, scale: 0.94 },
        { kind: 'incense_burner', x: 585, y: 368, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 250, y: 318 },
        { x: 660, y: 318 },
      ],
      foregrounds: [],
      lanterns: [{ x: 460, y: 185 }],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 460, y: 368 },
      ],
      pickups: [
        { id: 'pk_alch_brocade', kind: 'armor', itemId: 'cloud_brocade', x: 420, y: 272 },
        { id: 'pk_alch_jg', kind: 'consumable', itemId: 'jingang_dan', x: 515, y: 272 },
      ],
    },

    // --- 第四幕 · 赤火铸剑坊拓展 (2 座) ---
    {
      id: 'forge_antechamber',
      name: '赤火玄铁竖井厅',
      subtitle: '重刃千斤铁闸 · 上通端门下接寒潭',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 13,
      mapY: 5,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'none',
      focalX: 400,
      focalY: 408,
      leftRoomId: 'forge_smithy',
      leftDoorFloorY: 408,
      rightRoomId: 'central_underpass',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 300, y: 324, w: 140, h: 32 },
        { x: 355, y: 240, w: 140, h: 32 },
        { x: 405, y: 156, w: 150, h: 30 },
        { x: 405, y: 82, w: 145, h: 26 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 396, bottomY: 32, style: 'crypt_vault' },
        { x1: 564, x2: 800, bottomY: 32, style: 'crypt_vault' },
      ],
      shafts: [
        { x1: 396, x2: 564, dir: 'up', targetRoomId: 'gate_2' },
        {
          x1: 595,
          x2: 740,
          dir: 'down',
          targetRoomId: 'prison_sluice_entry',
          sealId: 'seal_forge_prison_shaft',
        },
      ],
      ironGate: {
        id: 'gate_forge_entry',
        x: 250,
        topY: 0,
        bottomY: 408,
        gateKind: 'heavy_weapon',
      },
      decorProps: [
        { kind: 'weapon_rack', x: 75, y: 408, scale: 0.92 },
        { kind: 'dragon_brazier', x: 365, y: 408, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 165, y: 332 },
        { x: 515, y: 332 },
      ],
      foregrounds: [],
      lanterns: [{ x: 665, y: 250 }],
      npcs: [],
      spawns: [
        { kind: 'paper_swordsman', x: 280, y: 408 },
      ],
      pickups: [],
    },
    {
      id: 'forge_slag_bridge',
      name: '地肺火桥长廊',
      subtitle: '下潜熔窟竖井 · 生铁短匕与火鸦冥灯',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 9,
      mapY: 5,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'none',
      focalX: 400,
      focalY: 408,
      leftRoomId: 'forge_moat_sluice',
      leftDoorFloorY: 408,
      rightRoomId: 'forge_molten_hall',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 95, y: 296, w: 175, h: 32 },
        { x: 530, y: 312, w: 175, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 34, style: 'crypt_vault' }],
      shafts: [{ x1: 280, x2: 460, dir: 'down', targetRoomId: 'forge_save' }],
      decorProps: [
        { kind: 'dragon_brazier', x: 165, y: 408, scale: 0.9 },
        { kind: 'weapon_rack', x: 695, y: 408, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [{ x: 274, y: 408, w: 192, hasPillars: false }],
      archways: [],
      torches: [
        { x: 240, y: 332 },
        { x: 580, y: 332 },
      ],
      foregrounds: [],
      lanterns: [{ x: 370, y: 195 }],
      npcs: [],
      spawns: [
        { kind: 'lantern_ghost', x: 370, y: 235 },
        { kind: 'bone_archer', x: 615, y: 312 },
      ],
      pickups: [
        { id: 'pk_daggers_1', kind: 'weapon', itemId: 'daggers_1', x: 165, y: 296 },
      ],
    },

    // --- 第五幕 · 九曲寒潭拓展 (2 座) ---
    {
      id: 'prison_sluice_entry',
      name: '寒潭暗瀑前室',
      subtitle: '双龙水闸枢纽 · 上接赤火下通荒冢',
      region: 'prison',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      indoor: true,
      mapX: 12,
      mapY: 6,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 500,
      special: 'none',
      focalX: 800,
      focalY: 416,
      leftRoomId: 'forge_prison_conduit',
      leftDoorFloorY: 416,
      rightRoomId: 'prison_waterway',
      rightDoorFloorY: 416,
      groundNodes: [
        { x: 0, y: 416, style: 'crypt_stone' },
        { x: 280, y: 416, style: 'stairs' },
        { x: 350, y: 448, style: 'crypt_stone' },
        { x: 840, y: 448, style: 'stairs' },
        { x: 910, y: 416, style: 'crypt_stone' },
        { x: 1600, y: 416, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 460, y: 344, w: 220, h: 104 },
        { x: 920, y: 332, w: 155, h: 32 },
        { x: 1010, y: 248, w: 155, h: 32 },
        { x: 1090, y: 164, w: 155, h: 30 },
        { x: 1135, y: 86, w: 150, h: 26 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 1110, bottomY: 32, style: 'crypt_vault' },
        { x1: 1310, x2: 1600, bottomY: 32, style: 'crypt_vault' },
      ],
      shafts: [
        { x1: 1110, x2: 1310, dir: 'up', targetRoomId: 'forge_antechamber' },
        {
          x1: 1340,
          x2: 1500,
          dir: 'down',
          targetRoomId: 'catacomb_entry',
          sealId: 'seal_prison_catacomb',
        },
      ],
      waterZones: [{ x1: 320, x2: 870, surfaceY: 404 }],
      decorProps: [
        { kind: 'guardian_statue', x: 145, y: 416, scale: 0.92 },
        { kind: 'dragon_brazier', x: 960, y: 416, scale: 0.9 },
      ],
      secretWalls: [
        {
          id: 'sw_prison_sluice_hp',
          x: 632,
          y: 248,
          w: 44,
          h: 96,
          dropKind: 'max_up',
          dropItemId: 'hp_vessel',
        },
      ],
      pavilions: [],
      archways: [],
      torches: [
        { x: 250, y: 336 },
        { x: 1290, y: 336 },
      ],
      foregrounds: [],
      lanterns: [{ x: 570, y: 205 }],
      npcs: [],
      spawns: [
        { kind: 'plague_toad', x: 570, y: 344 },
        { kind: 'spirit_crow', x: 760, y: 195 },
      ],
      pickups: [],
    },
    {
      id: 'prison_cellblock',
      name: '镇水寒铁囚廊',
      subtitle: '寒泉浸石牢房 · 千年朱果秘匣',
      region: 'prison',
      bgKey: 'bg_moat_sluice',
      realm: 'normal',
      indoor: true,
      mapX: 17,
      mapY: 6,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'none',
      focalX: 400,
      focalY: 408,
      leftRoomId: 'prison_waterway',
      leftDoorFloorY: 408,
      rightRoomId: 'prison_pre_save',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 190, y: 408, style: 'stairs' },
        { x: 255, y: 438, style: 'crypt_stone' },
        { x: 545, y: 438, style: 'stairs' },
        { x: 610, y: 408, style: 'crypt_stone' },
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 290, y: 292, w: 220, h: 32 },
        { x: 315, y: 176, w: 170, h: 30 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 310, bottomY: 34, style: 'crypt_vault' },
        { x1: 490, x2: 800, bottomY: 34, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 310, x2: 490, dir: 'up', targetRoomId: 'imperial_aqueduct_west' }],
      waterZones: [{ x1: 235, x2: 565, surfaceY: 416 }],
      decorProps: [
        { kind: 'dragon_brazier', x: 135, y: 408, scale: 0.9 },
        { kind: 'dragon_brazier', x: 665, y: 408, scale: 0.9 },
      ],
      steles: [{ id: 'stele_prison_flood', x: 735 }],
      pavilions: [],
      archways: [],
      torches: [
        { x: 175, y: 330 },
        { x: 625, y: 330 },
      ],
      foregrounds: [],
      lanterns: [{ x: 400, y: 185 }],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 165, y: 408 },
        { kind: 'lantern_ghost', x: 520, y: 215 },
      ],
      pickups: [
        { id: 'pk_pris_cell_hp', kind: 'max_up', itemId: 'hp_vessel', x: 400, y: 304 },
      ],
    },

    // --- 第六幕 · 九幽荒冢拓展 (3 座) ---
    {
      id: 'catacomb_entry',
      name: '九幽冥道前室',
      subtitle: '帝陵墓道井口 · 石兽守门',
      region: 'catacomb',
      bgKey: 'bg_catacomb_tomb',
      realm: 'normal',
      indoor: true,
      mapX: 13,
      mapY: 7,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'none',
      focalX: 400,
      focalY: 408,
      leftRoomId: 'catacomb_west_crypt',
      leftDoorFloorY: 408,
      rightRoomId: 'catacomb_save',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 140, y: 324, w: 150, h: 32 },
        { x: 220, y: 240, w: 150, h: 32 },
        { x: 300, y: 156, w: 150, h: 30 },
        { x: 365, y: 82, w: 145, h: 26 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 340, bottomY: 34, style: 'crypt_vault' },
        { x1: 520, x2: 800, bottomY: 34, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 340, x2: 520, dir: 'up', targetRoomId: 'prison_sluice_entry' }],
      decorProps: [
        { kind: 'guardian_statue', x: 95, y: 408, scale: 0.92 },
        { kind: 'guardian_statue', x: 695, y: 408, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 185, y: 332 },
        { x: 615, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'corpse_soldier', x: 560, y: 408 },
      ],
      pickups: [],
    },
    {
      id: 'catacomb_west_crypt',
      name: '守陵古碑耳室',
      subtitle: '西侧陪葬石室 · 封门古砖暗壁',
      region: 'catacomb',
      bgKey: 'bg_catacomb_tomb',
      realm: 'normal',
      indoor: true,
      mapX: 12,
      mapY: 7,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'none',
      focalX: 400,
      focalY: 408,
      leftRoomId: 'secret_catacomb_treasury',
      leftDoorFloorY: 408,
      leftDoorSecretId: 'sec_door_mojin',
      rightRoomId: 'catacomb_entry',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 220, y: 408, style: 'stairs' },
        { x: 290, y: 376, style: 'crypt_stone' },
        { x: 510, y: 376, style: 'stairs' },
        { x: 580, y: 408, style: 'crypt_stone' },
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [{ x: 295, y: 276, w: 210, h: 32 }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 400, y: 376, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 165, y: 332 },
        { x: 635, y: 332 },
      ],
      foregrounds: [],
      lanterns: [{ x: 400, y: 185 }],
      npcs: [],
      spawns: [
        { kind: 'bone_archer', x: 340, y: 376 },
        { kind: 'corpse_soldier', x: 640, y: 408 },
      ],
      pickups: [
        { id: 'pk_cat_west_mp', kind: 'max_up', itemId: 'mp_vessel', x: 400, y: 276 },
      ],
    },
    {
      id: 'catacomb_save',
      name: '九幽悬刃陪葬室',
      subtitle: '荒冢下陷石椁墓坑 · 断头摆斧横掠冥廊',
      region: 'catacomb',
      bgKey: 'bg_catacomb_tomb',
      realm: 'normal',
      indoor: true,
      mapX: 14,
      mapY: 7,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'none',
      focalX: 400,
      focalY: 432,
      leftRoomId: 'catacomb_entry',
      leftDoorFloorY: 396,
      rightRoomId: 'catacomb_hall',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'crypt_stone' },
        { x: 180, y: 396, style: 'stairs' },
        { x: 250, y: 432, style: 'crypt_stone' },
        { x: 550, y: 432, style: 'stairs' },
        { x: 620, y: 396, style: 'crypt_stone' },
        { x: 800, y: 396, style: 'crypt_stone' },
      ],
      crumbleSlabs: [{ id: 'cs_cat_tomb_1', x: 330, y: 312, w: 140 }],
      hazards: [{ kind: 'pendulum', x: 400, y: 36, span: 144, speed: 1.8, phase: 0.5 }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'guardian_statue', x: 110, y: 396, scale: 0.92 },
        { kind: 'coiled_pillar', x: 690, y: 396, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 175, y: 318 },
        { x: 625, y: 318 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'corpse_soldier', x: 350, y: 432 },
        { kind: 'bone_archer', x: 520, y: 432 },
      ],
      pickups: [{ id: 'pk_cat_tomb_dan', kind: 'consumable', itemId: 'huiqi_dan', x: 400, y: 312 }],
    },

    // --- 第七幕 · 万卷藏书阁拓展 (2 座) ---
    {
      id: 'library_save',
      name: '翰林双层藏书楼',
      subtitle: '万卷阁西翼重檐书库 · 飞天书妖盘踞高阁',
      region: 'library',
      bgKey: 'bg_library_opera',
      realm: 'normal',
      indoor: true,
      mapX: 17,
      mapY: 2,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 440,
      special: 'none',
      focalX: 400,
      focalY: 384,
      leftRoomId: 'library_shop',
      leftDoorFloorY: 384,
      rightRoomId: 'library_grand_hall',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 120, y: 384, style: 'palace_wood' },
        { x: 680, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      solidBlocks: [
        { x: 135, y: 282, w: 195, h: 28 },
        { x: 470, y: 282, w: 195, h: 28 },
        { x: 300, y: 184, w: 200, h: 28 },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'bookshelf', x: 395, y: 384, scale: 0.94 },
        { kind: 'silk_banner', x: 230, y: 190, scale: 0.88 },
        { kind: 'silk_banner', x: 570, y: 190, scale: 0.88 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 95, y: 312 },
        { x: 705, y: 312 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'scroll_demon', x: 250, y: 210 },
        { kind: 'scroll_demon', x: 550, y: 210 },
        { kind: 'paper_swordsman', x: 480, y: 384 },
      ],
      pickups: [{ id: 'pk_lib_loft_wine', kind: 'consumable', itemId: 'osmanthus_wine', x: 400, y: 184 }],
    },
    {
      id: 'library_grand_hall',
      name: '翰林经史长廊',
      subtitle: '双格楠木书库 · 子母护体灵剑秘匣',
      region: 'library',
      bgKey: 'bg_library_opera',
      realm: 'normal',
      indoor: true,
      mapX: 18,
      mapY: 2,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 800,
      focalY: 408,
      leftRoomId: 'library_save',
      leftDoorFloorY: 408,
      rightRoomId: 'upper_library',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 280, y: 408, style: 'stairs' },
        { x: 360, y: 382, style: 'palace_wood' },
        { x: 1240, y: 382, style: 'stairs' },
        { x: 1320, y: 408, style: 'marble' },
        { x: 1600, y: 408, style: 'marble' },
      ],
      solidBlocks: [
        { x: 950, y: 282, w: 230, h: 32 },
      ],
      movingPlatforms: [],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 34, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'bookshelf', x: 160, y: 408, scale: 0.96 },
        { kind: 'bookshelf', x: 640, y: 382, scale: 0.96 },
        { kind: 'chandelier', x: 800, y: 22, scale: 0.9 },
        { kind: 'bookshelf', x: 960, y: 382, scale: 0.96 },
        { kind: 'bookshelf', x: 1440, y: 408, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 320, y: 320 },
        { x: 1280, y: 320 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'scroll_demon', x: 535, y: 215 },
        { kind: 'opera_puppet', x: 800, y: 382 },
        { kind: 'scroll_demon', x: 1065, y: 215 },
      ],
      pickups: [
        { id: 'pk_lib_orbit', kind: 'weapon', itemId: 'sub:sword_orbit', x: 1065, y: 282 },
      ],
    },

    // --- 第八幕 · 百戏梨园拓展 (2 座) ---
    {
      id: 'opera_foyer',
      name: '梨园听雨前廊',
      subtitle: '上接藏书重楼 · 朱栏画栋与戏班灯廊',
      region: 'opera',
      bgKey: 'bg_opera_market',
      realm: 'normal',
      indoor: true,
      mapX: 20,
      mapY: 1,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 800,
      focalY: 416,
      leftRoomId: 'opera_gallery',
      leftDoorFloorY: 416,
      groundNodes: [
        { x: 0, y: 416, style: 'marble' },
        { x: 340, y: 416, style: 'stairs' },
        { x: 420, y: 386, style: 'palace_wood' },
        { x: 1180, y: 386, style: 'stairs' },
        { x: 1260, y: 416, style: 'marble' },
        { x: 1600, y: 416, style: 'marble' },
      ],
      solidBlocks: [
        { x: 1120, y: 288, w: 220, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 34, style: 'palace_timber' }],
      shafts: [{ x1: 680, x2: 920, dir: 'down', targetRoomId: 'upper_library' }],
      decorProps: [
        { kind: 'silk_banner', x: 145, y: 236, scale: 0.9 },
        { kind: 'chandelier', x: 520, y: 20, scale: 0.9 },
        { kind: 'dragon_brazier', x: 1380, y: 416, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [{ x: 674, y: 386, w: 252, hasPillars: false }],
      archways: [],
      torches: [
        { x: 460, y: 318 },
        { x: 1140, y: 318 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'opera_puppet', x: 520, y: 386 },
        { kind: 'lantern_ghost', x: 1080, y: 225 },
      ],
      pickups: [
        { id: 'pk_opfoyer_sx', kind: 'consumable', itemId: 'shenxing_san', x: 1230, y: 288 },
      ],
    },
    {
      id: 'opera_dressing_room',
      name: '百戏粉墨后台',
      subtitle: '傩面衣箱阁 · 分水精钢双刺',
      region: 'opera',
      bgKey: 'bg_opera_market',
      realm: 'normal',
      indoor: true,
      mapX: 16,
      mapY: 1,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'none',
      focalX: 400,
      focalY: 396,
      leftRoomId: 'library_warp',
      leftDoorFloorY: 396,
      rightRoomId: 'opera_gallery',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'marble' },
        { x: 205, y: 396, style: 'stairs' },
        { x: 275, y: 368, style: 'palace_wood' },
        { x: 525, y: 368, style: 'stairs' },
        { x: 595, y: 396, style: 'marble' },
        { x: 800, y: 396, style: 'marble' },
      ],
      solidBlocks: [{ x: 270, y: 268, w: 260, h: 32 }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'silk_banner', x: 145, y: 236, scale: 0.88 },
        { kind: 'incense_burner', x: 400, y: 368, scale: 0.9 },
        { kind: 'silk_banner', x: 655, y: 236, scale: 0.88 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 215, y: 318 },
        { x: 585, y: 318 },
      ],
      foregrounds: [],
      lanterns: [{ x: 400, y: 180 }],
      npcs: [],
      spawns: [
        { kind: 'opera_puppet', x: 340, y: 368 },
      ],
      pickups: [
        { id: 'pk_daggers_2', kind: 'weapon', itemId: 'daggers_2', x: 400, y: 268 },
      ],
    },

    // --- 第九幕 · 东垣望月塔拓展 (2 座) ---
    {
      id: 'clock_bell_gallery',
      name: '晨钟暮鼓悬廊',
      subtitle: '双格悬钟高阁 · 紫瘴封门与飞燕绝壁 · 唐制明光山文铠',
      region: 'clock_tower',
      bgKey: 'bg_tower_interior',
      realm: 'normal',
      indoor: true,
      mapX: 25,
      mapY: 3,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 800,
      focalY: 408,
      leftRoomId: 'clock_gear_hall',
      leftDoorFloorY: 408,
      rightRoomId: 'clock_save',
      rightDoorFloorY: 148,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 340, y: 408, style: 'stairs' },
        { x: 420, y: 376, style: 'marble' },
        { x: 820, y: 376, style: 'stairs' },
        { x: 900, y: 408, style: 'marble' },
        { x: 1600, y: 408, style: 'marble' },
      ],
      solidBlocks: [
        { x: 1120, y: 148, w: 480, h: 260, blocking: true },
      ],
      clockGears: [
        { x: 420, y: 244, radius: 60, speed: 0.56, hasOrbitPlatforms: false },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 34, style: 'palace_timber' }],
      shafts: [],
      ironGate: {
        id: 'gate_clock_bell_mist',
        x: 240,
        topY: 0,
        bottomY: 408,
        gateKind: 'mist_only',
      },
      decorProps: [
        { kind: 'giant_bell', x: 520, y: 215, scale: 0.92 },
        { kind: 'dragon_brazier', x: 640, y: 376, scale: 0.92 },
        { kind: 'giant_bell', x: 1360, y: 80, scale: 0.86 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 120, y: 332 },
        { x: 1380, y: 110 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 980, y: 162 },
      ],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 560, y: 376 },
        { kind: 'bell_gargoyle', x: 800, y: 190 },
        { kind: 'bronze_guard', x: 1020, y: 408 },
      ],
      pickups: [
        { id: 'pk_clock_mingguang', kind: 'armor', itemId: 'mingguang_armor', x: 760, y: 376 },
      ],
    },
    {
      id: 'observatory_pavilion',
      name: '司天浑仪观星台',
      subtitle: '东垣尽头星台 · 神行御风佩与剑冢暗壁',
      region: 'clock_tower',
      bgKey: 'bg_chapel_spire',
      realm: 'normal',
      indoor: false,
      mapX: 27,
      mapY: 4,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'none',
      focalX: 400,
      focalY: 396,
      leftRoomId: 'observatory_bridge',
      leftDoorFloorY: 396,
      rightRoomId: 'secret_sword_tomb',
      rightDoorFloorY: 396,
      rightDoorSecretId: 'sec_door_lotus',
      groundNodes: [
        { x: 0, y: 396, style: 'marble' },
        { x: 210, y: 396, style: 'stairs' },
        { x: 280, y: 364, style: 'marble' },
        { x: 520, y: 364, style: 'stairs' },
        { x: 590, y: 396, style: 'marble' },
        { x: 800, y: 396, style: 'marble' },
      ],
      solidBlocks: [{ x: 285, y: 262, w: 230, h: 32 }],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'guardian_statue', x: 155, y: 396, scale: 0.92 },
        { kind: 'incense_burner', x: 400, y: 364, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 235, y: 318 },
        { x: 565, y: 318 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 480, y: 205 },
      ],
      pickups: [
        { id: 'pk_obs_wind_pend', kind: 'armor', itemId: 'wind_step_pendant', x: 400, y: 262 },
      ],
    },

    // --- 终幕 · 凌霄祭天坛拓展 (3 座) ---
    {
      id: 'altar_cloud_bridge',
      name: '登天白玉神道',
      subtitle: '三格云海华表长桥 · 飞越重霄直趋天坛',
      region: 'altar',
      bgKey: 'bg_sky_altar',
      realm: 'normal',
      indoor: false,
      mapX: 22,
      mapY: 1,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 500,
      special: 'none',
      focalX: 1100,
      focalY: 412,
      rightRoomId: 'altar_vestibule',
      rightDoorFloorY: 412,
      groundNodes: [
        { x: 0, y: 412, style: 'marble' },
        { x: 640, y: 412, style: 'stairs' },
        { x: 740, y: 376, style: 'marble' },
        { x: 1460, y: 376, style: 'stairs' },
        { x: 1560, y: 412, style: 'marble' },
        { x: 2200, y: 412, style: 'marble' },
      ],
      solidBlocks: [],
      ceilingSpans: [],
      shafts: [{ x1: 290, x2: 510, dir: 'down', targetRoomId: 'east_outer_tower' }],
      decorProps: [
        { kind: 'coiled_pillar', x: 180, y: 412, scale: 0.96 },
        { kind: 'dragon_brazier', x: 820, y: 376, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1380, y: 376, scale: 0.94 },
        { kind: 'coiled_pillar', x: 1920, y: 412, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [{ x: 284, y: 412, w: 232, hasPillars: false }],
      archways: [],
      torches: [
        { x: 610, y: 332 },
        { x: 1590, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 880, y: 376 },
        { kind: 'bell_gargoyle', x: 1100, y: 195 },
        { kind: 'bronze_guard', x: 1320, y: 376 },
      ],
      pickups: [
        { id: 'pk_altar_bridge_jz', kind: 'consumable', itemId: 'jiuzhuan_jin_dan', x: 1100, y: 376 },
      ],
    },
    {
      id: 'altar_vestibule',
      name: '斋宫沐风玉阙',
      subtitle: '登坛云梯阁 · 直上圜丘祈年台',
      region: 'altar',
      bgKey: 'bg_sky_altar',
      realm: 'normal',
      indoor: false,
      mapX: 25,
      mapY: 1,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'none',
      focalX: 400,
      focalY: 404,
      leftRoomId: 'altar_cloud_bridge',
      leftDoorFloorY: 404,
      rightRoomId: 'altar_east_terrace',
      rightDoorFloorY: 404,
      groundNodes: [
        { x: 0, y: 404, style: 'marble' },
        { x: 800, y: 404, style: 'marble' },
      ],
      solidBlocks: [
        { x: 160, y: 320, w: 165, h: 32 },
        { x: 260, y: 236, w: 165, h: 32 },
        { x: 340, y: 154, w: 165, h: 30 },
        { x: 370, y: 82, w: 150, h: 26 },
      ],
      ceilingSpans: [],
      shafts: [{ x1: 350, x2: 530, dir: 'up', targetRoomId: 'altar_forecourt' }],
      decorProps: [
        { kind: 'guardian_statue', x: 655, y: 404, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 135, y: 332 },
        { x: 590, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 520, y: 225 },
      ],
      pickups: [
        { id: 'pk_altar_vest_hp', kind: 'max_up', itemId: 'hp_vessel', x: 645, y: 404 },
      ],
    },
    {
      id: 'altar_forecourt',
      name: '圜丘祈年丹墀',
      subtitle: '天坛前庭广场 · 血月苍穹与九鼎华表',
      region: 'altar',
      bgKey: 'bg_sky_altar',
      realm: 'normal',
      indoor: false,
      mapX: 24,
      mapY: 0,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 800,
      focalY: 404,
      leftRoomId: 'cloud_star_gallery',
      leftDoorFloorY: 404,
      rightRoomId: 'altar_save',
      rightDoorFloorY: 404,
      groundNodes: [
        { x: 0, y: 404, style: 'marble' },
        { x: 260, y: 404, style: 'stairs' },
        { x: 340, y: 372, style: 'marble' },
        { x: 960, y: 372, style: 'stairs' },
        { x: 1040, y: 404, style: 'marble' },
        { x: 1600, y: 404, style: 'marble' },
      ],
      solidBlocks: [],
      ceilingSpans: [],
      shafts: [{ x1: 1150, x2: 1330, dir: 'down', targetRoomId: 'altar_vestibule' }],
      ironGate: {
        id: 'gate_altar_forecourt_fox',
        x: 1460,
        topY: 44,
        bottomY: 404,
        gateKind: 'illusion_fox',
      },
      decorProps: [
        { kind: 'coiled_pillar', x: 160, y: 404, scale: 0.96 },
        { kind: 'dragon_brazier', x: 420, y: 372, scale: 0.94 },
        { kind: 'dragon_brazier', x: 880, y: 372, scale: 0.94 },
      ],
      steles: [{ id: 'stele_altar_oath', x: 225 }],
      waterZones: [],
      pavilions: [{ x: 1144, y: 404, w: 184, hasPillars: false }],
      archways: [],
      torches: [
        { x: 310, y: 320 },
        { x: 990, y: 320 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 650, y: 372 },
      ],
      pickups: [
        { id: 'pk_altar_fore_wine', kind: 'consumable', itemId: 'osmanthus_wine', x: 650, y: 372 },
      ],
    },
  ];

  // ==================== 九、30×9 八大环环相扣枢纽回廊、五灵共鸣锁钥殿与九幽地脉龙渊（20 座全新立体互通关卡！） ====================
  const interlockingRooms: BuiltRoom[] = [
    // 1. 西垣烽火谯楼 (6,1 1×2)：贯通钦天试剑堂(踏云步秘室)与西郊城墙，设单向青铜枢机拉杆捷径！
    {
      id: 'west_cliff_watchtower',
      name: '西垣烽火谯楼',
      subtitle: '双层城垣竖阁 · 单向青铜枢机重闸',
      region: 'alchemy',
      bgKey: 'bg_tower_interior',
      realm: 'normal',
      indoor: true,
      mapX: 6,
      mapY: 1,
      gridW: 1,
      gridH: 2,
      pixelW: 800,
      pixelH: 880,
      special: 'none',
      focalX: 400,
      focalY: 804,
      sideDoors: [
        { side: 'left', floorY: 356, targetRoomId: 'chapel_cloud_stair', rowOffset: 0 },
        { side: 'right', floorY: 356, targetRoomId: 'relic_double_jump', rowOffset: 0 },
        { side: 'left', floorY: 804, targetRoomId: 'west_cliff_skybridge', rowOffset: 1 },
      ],
      groundNodes: [
        { x: 0, y: 804, style: 'marble' },
        { x: 800, y: 804, style: 'marble' },
      ],
      solidBlocks: [
        { x: 0, y: 356, w: 250, h: 36 },
        { x: 520, y: 356, w: 280, h: 36 },
        { x: 315, y: 196, w: 170, h: 28 },
        { x: 290, y: 496, w: 200, h: 32 },
        { x: 450, y: 648, w: 200, h: 32 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 310, bottomY: 34, style: 'palace_timber' },
        { x1: 490, x2: 800, bottomY: 34, style: 'palace_timber' },
      ],
      shafts: [{ x1: 310, x2: 490, dir: 'up', targetRoomId: 'colosseum_west_gate' }],
      ironGate: {
        id: 'gate_west_watch_shortcut',
        x: 180,
        topY: 0,
        bottomY: 356,
        gateKind: 'lever_shortcut',
        leverSide: 'left',
      },
      decorProps: [
        { kind: 'weapon_rack', x: 685, y: 804, scale: 0.92 },
        { kind: 'silk_banner', x: 185, y: 210, scale: 0.88 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 640, y: 286 },
        { x: 620, y: 728 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'paper_swordsman', x: 560, y: 804 },
        { kind: 'bone_archer', x: 390, y: 496 },
      ],
      pickups: [],
    },

    // 2. 断崖飞栈悬廊 (4,2 2×1)：西接烽火谯楼下潜正阳城楼箭台，形成钦天司回环外城的飞檐大捷径！
    {
      id: 'west_cliff_skybridge',
      name: '断崖飞栈悬廊',
      subtitle: '西垣悬空栈道 · 下通正阳城楼箭台',
      region: 'gatehouse',
      bgKey: 'bg_bamboo_cliff',
      realm: 'normal',
      indoor: false,
      mapX: 4,
      mapY: 2,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 800,
      focalY: 404,
      leftRoomId: 'west_cliff_pagoda',
      leftDoorFloorY: 376,
      rightRoomId: 'west_cliff_watchtower',
      rightDoorFloorY: 404,
      groundNodes: [
        { x: 0, y: 376, style: 'flagstone' },
        { x: 340, y: 376, style: 'stairs' },
        { x: 420, y: 404, style: 'flagstone' },
        { x: 1600, y: 404, style: 'flagstone' },
      ],
      solidBlocks: [],
      ceilingSpans: [],
      shafts: [{ x1: 560, x2: 740, dir: 'down', targetRoomId: 'entrance_battlement_tower' }],
      decorProps: [
        { kind: 'guardian_statue', x: 160, y: 376, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1180, y: 404, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [{ x: 554, y: 404, w: 192, hasPillars: false }],
      archways: [],
      torches: [{ x: 960, y: 332 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'spirit_crow', x: 920, y: 195 },
        { kind: 'paper_swordsman', x: 1280, y: 404 },
      ],
      pickups: [
        { id: 'pk_skybridge_hp', kind: 'max_up', itemId: 'hp_vessel', x: 220, y: 376 },
      ],
    },

    // 3. 苍竹玄武灵潭 (1,5 2×1)：苦竹林道地底寒潭秘窟，既可由护城暗渠融冰西进，亦可凭千斤坠自竹林震碎封印坠入！供奉【玄武镇岳灵】！
    {
      id: 'bamboo_cliff_grotto',
      name: '苍竹玄武灵潭',
      subtitle: '竹林地底灵窟 · 护法玄武镇岳灵祭坛',
      region: 'gatehouse',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      indoor: true,
      mapX: 1,
      mapY: 5,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 500,
      special: 'relic_pedestal',
      focalX: 310,
      focalY: 368,
      leftRoomId: 'sunken_ferry_shaft',
      leftDoorFloorY: 404,
      rightRoomId: 'moat_west_tunnel',
      rightDoorFloorY: 416,
      groundNodes: [
        { x: 0, y: 404, style: 'crypt_stone' },
        { x: 140, y: 404, style: 'stairs' },
        { x: 210, y: 368, style: 'marble' },
        { x: 430, y: 368, style: 'stairs' },
        { x: 510, y: 416, style: 'crypt_stone' },
        { x: 820, y: 416, style: 'stairs' },
        { x: 890, y: 448, style: 'crypt_stone' },
        { x: 1320, y: 448, style: 'stairs' },
        { x: 1390, y: 416, style: 'crypt_stone' },
        { x: 1600, y: 416, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 560, y: 204, w: 170, h: 28 },
        { x: 1020, y: 368, w: 190, h: 32 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 560, bottomY: 34, style: 'crypt_vault' },
        { x1: 740, x2: 1600, bottomY: 34, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 560, x2: 740, dir: 'up', targetRoomId: 'entrance_bamboo_woods' }],
      ironGate: {
        id: 'gate_grotto_tortoise_out',
        x: 960,
        topY: 0,
        bottomY: 448,
        gateKind: 'sluice_tortoise',
      },
      waterZones: [{ x1: 870, x2: 1340, surfaceY: 420 }],
      decorProps: [
        { kind: 'guardian_statue', x: 110, y: 404, scale: 0.94 },
        { kind: 'dragon_brazier', x: 410, y: 368, scale: 0.9 },
      ],
      pavilions: [],
      archways: [],
      torches: [{ x: 1450, y: 336 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'plague_toad', x: 1110, y: 368 },
      ],
      pickups: [
        { id: 'pk_fam_tortoise', kind: 'ability', itemId: 'familiar_tortoise', x: 310, y: 368 },
      ],
    },

    // 4. 护城寒泉暗渠 (3,5 3×1)：串联御河桥下暗渠与苍竹玄武灵潭，东口由【玄冥寒髓冰障】封锁（需朱雀丹火灵融开）！
    {
      id: 'moat_west_tunnel',
      name: '护城寒泉暗渠',
      subtitle: '三格城底冰渠 · 玄冥寒髓封门冰障',
      region: 'gatehouse',
      bgKey: 'bg_moat_sluice',
      realm: 'normal',
      indoor: true,
      mapX: 3,
      mapY: 5,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 500,
      special: 'none',
      focalX: 1100,
      focalY: 416,
      leftRoomId: 'bamboo_cliff_grotto',
      leftDoorFloorY: 416,
      rightRoomId: 'entrance_moat_cavern',
      rightDoorFloorY: 416,
      groundNodes: [
        { x: 0, y: 416, style: 'crypt_stone' },
        { x: 420, y: 416, style: 'stairs' },
        { x: 500, y: 450, style: 'crypt_stone' },
        { x: 1520, y: 450, style: 'stairs' },
        { x: 1600, y: 416, style: 'crypt_stone' },
        { x: 2200, y: 416, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 640, y: 368, w: 210, h: 32 },
        { x: 1020, y: 348, w: 230, h: 32 },
        { x: 1360, y: 368, w: 190, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 2200, bottomY: 34, style: 'crypt_vault' }],
      shafts: [
        {
          x1: 1620,
          x2: 1790,
          dir: 'down',
          targetRoomId: 'sunken_sluice_cavern',
          sealId: 'seal_moat_sunken',
        },
      ],
      ironGate: {
        id: 'gate_moat_ice_phoenix',
        x: 1840,
        topY: 0,
        bottomY: 416,
        gateKind: 'ice_phoenix',
      },
      waterZones: [{ x1: 480, x2: 1540, surfaceY: 420 }],
      decorProps: [
        { kind: 'dragon_brazier', x: 260, y: 416, scale: 0.9 },
        { kind: 'guardian_statue', x: 2020, y: 416, scale: 0.92 },
      ],
      pavilions: [],
      archways: [],
      torches: [
        { x: 340, y: 336 },
        { x: 1710, y: 336 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'corpse_soldier', x: 310, y: 416 },
        { kind: 'plague_toad', x: 740, y: 368 },
        { kind: 'bone_archer', x: 1135, y: 348 },
        { kind: 'spirit_crow', x: 1420, y: 205 },
      ],
      pickups: [],
    },

    // 5. 水火交泰枢闸 (8,5 1×1)：连接第一幕御河暗渠与第四幕赤火铸剑坊，由【玄武镇岳灵】镇压千斤水枢重闸开启！
    {
      id: 'forge_moat_sluice',
      name: '水火交泰枢闸',
      subtitle: '寒泉入炉枢纽 · 玄武千斤水枢重闸',
      region: 'forge',
      bgKey: 'bg_moat_sluice',
      realm: 'normal',
      indoor: true,
      mapX: 8,
      mapY: 5,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'none',
      focalX: 400,
      focalY: 408,
      leftRoomId: 'entrance_moat_cavern',
      leftDoorFloorY: 408,
      rightRoomId: 'forge_slag_bridge',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      ironGate: {
        id: 'gate_sluice_tortoise',
        x: 400,
        topY: 0,
        bottomY: 408,
        gateKind: 'sluice_tortoise',
      },
      decorProps: [
        { kind: 'dragon_brazier', x: 640, y: 408, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 165, y: 332 },
        { x: 635, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 590, y: 408 },
      ],
      pickups: [],
    },

    // 6. 紫微丹火秘殿 (11,1 2×1)：由钦天迎仙前殿凭【踏云步】二段跳纵跃而上，供奉【朱雀丹火灵】！
    {
      id: 'alchemy_fire_sanctum',
      name: '紫微丹火秘殿',
      subtitle: '太清八卦丹炉 · 护法朱雀丹火灵祭坛',
      region: 'alchemy',
      bgKey: 'bg_alchemy_palace',
      realm: 'normal',
      indoor: true,
      mapX: 11,
      mapY: 1,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'relic_pedestal',
      focalX: 320,
      focalY: 368,
      rightRoomId: 'library_automaton_loft',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 150, y: 408, style: 'stairs' },
        { x: 220, y: 368, style: 'marble' },
        { x: 440, y: 368, style: 'stairs' },
        { x: 510, y: 408, style: 'marble' },
        { x: 1600, y: 408, style: 'marble' },
      ],
      solidBlocks: [],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 34, style: 'palace_timber' }],
      shafts: [{ x1: 560, x2: 760, dir: 'down', targetRoomId: 'alchemy_foyer' }],
      decorProps: [
        { kind: 'dragon_brazier', x: 230, y: 368, scale: 0.94 },
        { kind: 'dragon_brazier', x: 420, y: 368, scale: 0.94 },
        { kind: 'incense_burner', x: 1120, y: 408, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [{ x: 554, y: 408, w: 212, hasPillars: false }],
      archways: [],
      torches: [
        { x: 920, y: 332 },
        { x: 1380, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'scroll_demon', x: 1020, y: 205 },
        { kind: 'bronze_guard', x: 1260, y: 408 },
      ],
      pickups: [
        { id: 'pk_fam_phoenix', kind: 'ability', itemId: 'familiar_phoenix', x: 320, y: 368 },
      ],
    },

    // 7. 天机木鸢秘阁 (13,1 2×1)：东连书阁梨园传送室、西设单向青铜拉杆直通钦天丹火秘殿，供奉墨家【天机木鸢】！
    {
      id: 'library_automaton_loft',
      name: '天机木鸢秘阁',
      subtitle: '墨家鲁班工坊 · 护法天机木鸢与东西贯通枢杆',
      region: 'library',
      bgKey: 'bg_library_opera',
      realm: 'normal',
      indoor: true,
      mapX: 13,
      mapY: 1,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'relic_pedestal',
      focalX: 1020,
      focalY: 372,
      leftRoomId: 'alchemy_fire_sanctum',
      leftDoorFloorY: 408,
      rightRoomId: 'library_warp',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 760, y: 408, style: 'stairs' },
        { x: 840, y: 372, style: 'palace_wood' },
        { x: 1200, y: 372, style: 'stairs' },
        { x: 1280, y: 408, style: 'marble' },
        { x: 1600, y: 408, style: 'marble' },
      ],
      solidBlocks: [
        { x: 520, y: 318, w: 165, h: 30 },
        { x: 580, y: 228, w: 165, h: 30 },
        { x: 535, y: 142, w: 160, h: 28 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 530, bottomY: 34, style: 'palace_timber' },
        { x1: 710, x2: 1600, bottomY: 34, style: 'palace_timber' },
      ],
      shafts: [{ x1: 530, x2: 710, dir: 'up', targetRoomId: 'colosseum_east_armory' }],
      ironGate: {
        id: 'gate_loft_lever',
        x: 420,
        topY: 0,
        bottomY: 408,
        gateKind: 'lever_shortcut',
        leverSide: 'right',
      },
      decorProps: [
        { kind: 'bookshelf', x: 640, y: 408, scale: 0.94 },
        { kind: 'chandelier', x: 1020, y: 20, scale: 0.9 },
        { kind: 'bookshelf', x: 1420, y: 408, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 560, y: 332 },
        { x: 1340, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'opera_puppet', x: 680, y: 408 },
        { kind: 'scroll_demon', x: 1240, y: 205 },
      ],
      pickups: [
        { id: 'pk_fam_kestrel', kind: 'ability', itemId: 'familiar_kestrel', x: 1020, y: 372 },
      ],
    },

    // 8. 丹霞飞虹天廊 (14,2 1×1)：架于皇城正殿穹顶之上的飞阁天桥，凭【天机木鸢】拨开高墙铜锁即可横向贯通炼丹司与藏书阁！
    {
      id: 'alchemy_library_bridge',
      name: '丹霞飞虹天廊',
      subtitle: '东西两翼天桥 · 天机高墙齿轮铜锁',
      region: 'library',
      bgKey: 'bg_city_avenue',
      realm: 'normal',
      indoor: false,
      mapX: 14,
      mapY: 2,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'none',
      focalX: 400,
      focalY: 396,
      leftRoomId: 'alchemy_herb_garden',
      leftDoorFloorY: 396,
      rightRoomId: 'secret_library_study',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'marble' },
        { x: 800, y: 396, style: 'marble' },
      ],
      solidBlocks: [],
      ceilingSpans: [],
      shafts: [],
      ironGate: {
        id: 'gate_bridge_kestrel',
        x: 400,
        topY: 40,
        bottomY: 396,
        gateKind: 'gear_kestrel',
      },
      decorProps: [
        { kind: 'coiled_pillar', x: 165, y: 396, scale: 0.94 },
        { kind: 'coiled_pillar', x: 635, y: 396, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [{ x: 245, y: 320 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 560, y: 195 },
      ],
      pickups: [],
    },

    // 9. 皇城龙脉暗甬 (14,5 1×1)：连接中枢八卦传送阵与赤火玄铁竖井厅的单向拉杆捷径！
    {
      id: 'central_underpass',
      name: '皇城龙脉暗甬',
      subtitle: '中枢地底捷径 · 单向青铜枢机重闸',
      region: 'main_hall',
      bgKey: 'bg_moat_sluice',
      realm: 'normal',
      indoor: true,
      mapX: 14,
      mapY: 5,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'none',
      focalX: 400,
      focalY: 408,
      leftRoomId: 'forge_antechamber',
      leftDoorFloorY: 408,
      rightRoomId: 'central_warp',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      ironGate: {
        id: 'gate_central_forge_lever',
        x: 380,
        topY: 0,
        bottomY: 408,
        gateKind: 'lever_shortcut',
        leverSide: 'left',
      },
      decorProps: [
        { kind: 'dragon_brazier', x: 615, y: 408, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 165, y: 332 },
        { x: 635, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    // 10. 太液涵洞西渠 (16,5 2×1)：中枢传送阵向东暗渠，地板嵌有【千斤裂地封印石板】，震碎可直坠九曲寒潭囚廊！
    {
      id: 'imperial_aqueduct_west',
      name: '太液涵洞西渠',
      subtitle: '内廷暗河西段 · 千斤裂地封印暗井',
      region: 'prison',
      bgKey: 'bg_moat_sluice',
      realm: 'normal',
      indoor: true,
      mapX: 16,
      mapY: 5,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 800,
      focalY: 408,
      leftRoomId: 'central_warp',
      leftDoorFloorY: 408,
      rightRoomId: 'imperial_aqueduct_east',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 340, y: 408, style: 'stairs' },
        { x: 420, y: 438, style: 'crypt_stone' },
        { x: 920, y: 438, style: 'stairs' },
        { x: 1000, y: 408, style: 'crypt_stone' },
        { x: 1600, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 560, y: 344, w: 220, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 34, style: 'crypt_vault' }],
      shafts: [
        {
          x1: 1080,
          x2: 1260,
          dir: 'down',
          targetRoomId: 'prison_cellblock',
          sealId: 'seal_aqueduct_prison',
        },
      ],
      waterZones: [{ x1: 400, x2: 940, surfaceY: 416 }],
      decorProps: [
        { kind: 'guardian_statue', x: 190, y: 408, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1420, y: 408, scale: 0.9 },
      ],
      pavilions: [],
      archways: [],
      torches: [
        { x: 290, y: 332 },
        { x: 1360, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'plague_toad', x: 670, y: 344 },
        { kind: 'bone_archer', x: 1380, y: 408 },
      ],
      pickups: [],
    },

    // 11. 太液镇水东渠 (18,5 3×1)：横向串联中枢与东塔寒潭传送阵，东段由【玄武千斤水枢闸】把守！
    {
      id: 'imperial_aqueduct_east',
      name: '太液镇水东渠',
      subtitle: '内廷暗河东段 · 玄武镇压水枢重闸',
      region: 'prison',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      indoor: true,
      mapX: 18,
      mapY: 5,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 500,
      special: 'none',
      focalX: 1100,
      focalY: 412,
      leftRoomId: 'imperial_aqueduct_west',
      leftDoorFloorY: 412,
      rightRoomId: 'prison_save',
      rightDoorFloorY: 412,
      groundNodes: [
        { x: 0, y: 412, style: 'crypt_stone' },
        { x: 460, y: 412, style: 'stairs' },
        { x: 540, y: 446, style: 'crypt_stone' },
        { x: 1460, y: 446, style: 'stairs' },
        { x: 1540, y: 412, style: 'crypt_stone' },
        { x: 2200, y: 412, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 680, y: 360, w: 210, h: 32 },
        { x: 1080, y: 342, w: 220, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 2200, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      ironGate: {
        id: 'gate_aqueduct_tortoise',
        x: 1760,
        topY: 0,
        bottomY: 412,
        gateKind: 'sluice_tortoise',
      },
      waterZones: [{ x1: 520, x2: 1480, surfaceY: 418 }],
      decorProps: [
        { kind: 'dragon_brazier', x: 260, y: 412, scale: 0.9 },
        { kind: 'guardian_statue', x: 2010, y: 412, scale: 0.92 },
      ],
      pavilions: [],
      archways: [],
      torches: [
        { x: 380, y: 336 },
        { x: 1640, y: 336 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 340, y: 412 },
        { kind: 'plague_toad', x: 785, y: 360 },
        { kind: 'scroll_demon', x: 1190, y: 205 },
      ],
      pickups: [
        { id: 'pk_aqueduct_mp', kind: 'max_up', itemId: 'mp_vessel', x: 1190, y: 342 },
      ],
    },

    // 12. 地肺火脉冥道 (9,7 2×1)：横向打通赤火藏锋剑冢与九幽摸金古墓宝库，并设深井下潜第 9 层【九幽镇龙地脉渊】！
    {
      id: 'forge_catacomb_tunnel',
      name: '地肺火脉冥道',
      subtitle: '熔岩交汇古墓 · 下潜九幽地脉龙渊',
      region: 'catacomb',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 9,
      mapY: 7,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 800,
      focalY: 408,
      leftRoomId: 'secret_forge_smeltery',
      leftDoorFloorY: 408,
      rightRoomId: 'secret_catacomb_treasury',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 260, y: 408, style: 'stairs' },
        { x: 330, y: 442, style: 'crypt_stone' },
        { x: 640, y: 442, style: 'stairs' },
        { x: 710, y: 408, style: 'crypt_stone' },
        { x: 1600, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 410, y: 348, w: 170, h: 30 },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 34, style: 'crypt_vault' }],
      shafts: [
        {
          x1: 1060,
          x2: 1240,
          dir: 'down',
          targetRoomId: 'abyss_dragon_vein_west',
          sealId: 'seal_forge_dragon_vein',
        },
      ],
      ironGate: {
        id: 'gate_forge_catacomb_mist',
        x: 780,
        topY: 0,
        bottomY: 408,
        gateKind: 'mist_only',
      },
      waterZones: [{ x1: 315, x2: 655, surfaceY: 428, liquidKind: 'lava' }],
      decorProps: [
        { kind: 'dragon_brazier', x: 180, y: 408, scale: 0.9 },
        { kind: 'guardian_statue', x: 1430, y: 408, scale: 0.92 },
      ],
      pavilions: [],
      archways: [],
      torches: [
        { x: 220, y: 332 },
        { x: 1350, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'demon_wolf', x: 920, y: 408 },
        { kind: 'corpse_soldier', x: 1360, y: 408 },
      ],
      pickups: [],
    },

    // 13. 九幽地脉西渊 (10,8 4×1)：玄城最底层地脉巨窟西段！
    {
      id: 'abyss_dragon_vein_west',
      name: '九幽地脉西渊',
      subtitle: '四格极渊冥河 · 盘龙古柱与镇狱群妖',
      region: 'catacomb',
      bgKey: 'bg_catacomb_tomb',
      realm: 'normal',
      indoor: true,
      mapX: 10,
      mapY: 8,
      gridW: 4,
      gridH: 1,
      pixelW: 3000,
      pixelH: 520,
      special: 'none',
      focalX: 1500,
      focalY: 424,
      leftRoomId: 'mine_lava_bridge',
      leftDoorFloorY: 424,
      rightRoomId: 'abyss_sanctum_save',
      rightDoorFloorY: 424,
      groundNodes: [
        { x: 0, y: 424, style: 'crypt_stone' },
        { x: 660, y: 424, style: 'stairs' },
        { x: 760, y: 458, style: 'crypt_stone' },
        { x: 1620, y: 458, style: 'stairs' },
        { x: 1720, y: 396, style: 'marble' },
        { x: 2380, y: 396, style: 'stairs' },
        { x: 2480, y: 424, style: 'crypt_stone' },
        { x: 3000, y: 424, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 180, y: 336, w: 165, h: 30 },
        { x: 260, y: 250, w: 165, h: 30 },
        { x: 210, y: 166, w: 165, h: 28 },
        { x: 245, y: 84, w: 155, h: 26 },
        { x: 920, y: 368, w: 220, h: 32 },
        { x: 1280, y: 352, w: 220, h: 32 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 240, bottomY: 34, style: 'crypt_vault' },
        { x1: 420, x2: 3000, bottomY: 34, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 240, x2: 420, dir: 'up', targetRoomId: 'forge_catacomb_tunnel' }],
      ironGate: {
        id: 'gate_dragon_vein_mist',
        x: 560,
        topY: 0,
        bottomY: 424,
        gateKind: 'mist_only',
      },
      waterZones: [{ x1: 740, x2: 1640, surfaceY: 428 }],
      decorProps: [
        { kind: 'coiled_pillar', x: 560, y: 424, scale: 0.96 },
        { kind: 'dragon_brazier', x: 1840, y: 396, scale: 0.94 },
        { kind: 'dragon_brazier', x: 2260, y: 396, scale: 0.94 },
        { kind: 'guardian_statue', x: 2760, y: 424, scale: 0.94 },
      ],
      pavilions: [],
      archways: [],
      torches: [
        { x: 610, y: 348 },
        { x: 2050, y: 320 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'demon_wolf', x: 580, y: 424 },
        { kind: 'plague_toad', x: 1030, y: 368 },
        { kind: 'bell_gargoyle', x: 1390, y: 205 },
        { kind: 'bronze_guard', x: 2050, y: 396 },
        { kind: 'demon_wolf', x: 2640, y: 424 },
      ],
      pickups: [
        { id: 'pk_abyss_west_hp', kind: 'max_up', itemId: 'hp_vessel', x: 2050, y: 396 },
      ],
    },

    // 14. 地脉镇龙古祠 (14,8 1×1)：地底第 9 层核心中继存档祠！
    {
      id: 'abyss_sanctum_save',
      name: '地脉盘龙石兽殿',
      subtitle: '深渊龙脉双层石廊 · 镇陵辟邪石兽盘踞中庭',
      region: 'catacomb',
      bgKey: 'bg_catacomb_tomb',
      realm: 'normal',
      indoor: true,
      mapX: 14,
      mapY: 8,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'none',
      focalX: 400,
      focalY: 428,
      leftRoomId: 'abyss_dragon_vein_west',
      leftDoorFloorY: 396,
      rightRoomId: 'abyss_dragon_spine',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'crypt_stone' },
        { x: 175, y: 396, style: 'stairs' },
        { x: 245, y: 428, style: 'crypt_stone' },
        { x: 555, y: 428, style: 'stairs' },
        { x: 625, y: 396, style: 'crypt_stone' },
        { x: 800, y: 396, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 125, y: 284, w: 185, h: 30 },
        { x: 490, y: 284, w: 185, h: 30 },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'coiled_pillar', x: 355, y: 428, scale: 0.94 },
        { kind: 'dragon_brazier', x: 465, y: 428, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 95, y: 318 },
        { x: 705, y: 318 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [{ kind: 'bixie_stone_beast', x: 400, y: 428 }],
      pickups: [{ id: 'pk_abyss_beast_dan', kind: 'consumable', itemId: 'jingang_dan', x: 582, y: 284 }],
    },

    // 15. 九幽镇龙骨渊 (15,8 5×1)：五格地脉巨殿，上通守陵玄女帝陵殿，东端设【九幽鬼打墙幻障】（需青丘玉狐勘破）！
    {
      id: 'abyss_dragon_spine',
      name: '九幽镇龙骨渊',
      subtitle: '五格太古龙脉殿 · 上贯守陵玄宫 · 东锁九幽幻障',
      region: 'catacomb',
      bgKey: 'bg_catacomb_tomb',
      realm: 'normal',
      indoor: true,
      mapX: 15,
      mapY: 8,
      gridW: 5,
      gridH: 1,
      pixelW: 3800,
      pixelH: 520,
      special: 'none',
      focalX: 1900,
      focalY: 424,
      leftRoomId: 'abyss_sanctum_save',
      leftDoorFloorY: 424,
      rightRoomId: 'abyss_east_corridor',
      rightDoorFloorY: 424,
      groundNodes: [
        { x: 0, y: 424, style: 'crypt_stone' },
        { x: 520, y: 424, style: 'stairs' },
        { x: 620, y: 456, style: 'crypt_stone' },
        { x: 1480, y: 456, style: 'stairs' },
        { x: 1580, y: 392, style: 'marble' },
        { x: 2260, y: 392, style: 'stairs' },
        { x: 2360, y: 424, style: 'crypt_stone' },
        { x: 3800, y: 424, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 780, y: 364, w: 230, h: 32 },
        { x: 1160, y: 348, w: 230, h: 32 },
        { x: 2620, y: 336, w: 170, h: 30 },
        { x: 2710, y: 250, w: 170, h: 30 },
        { x: 2640, y: 164, w: 170, h: 28 },
        { x: 2690, y: 84, w: 155, h: 26 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 2680, bottomY: 34, style: 'crypt_vault' },
        { x1: 2860, x2: 3800, bottomY: 34, style: 'crypt_vault' },
      ],
      shafts: [
        { x1: 2680, x2: 2860, dir: 'up', targetRoomId: 'catacomb_shrine' },
        {
          x1: 1860,
          x2: 2040,
          dir: 'down',
          targetRoomId: 'nether_lantern_avenue',
          sealId: 'seal_dragon_spine_nether',
        },
      ],
      ironGate: {
        id: 'gate_abyss_fox_illusion',
        x: 3360,
        topY: 0,
        bottomY: 424,
        gateKind: 'illusion_fox',
      },
      waterZones: [{ x1: 600, x2: 1500, surfaceY: 428 }],
      decorProps: [
        { kind: 'coiled_pillar', x: 380, y: 424, scale: 0.96 },
        { kind: 'dragon_brazier', x: 1680, y: 392, scale: 0.95 },
        { kind: 'dragon_brazier', x: 2160, y: 392, scale: 0.95 },
        { kind: 'coiled_pillar', x: 3120, y: 424, scale: 0.96 },
      ],
      pavilions: [],
      archways: [],
      torches: [
        { x: 460, y: 348 },
        { x: 1920, y: 316 },
        { x: 3180, y: 348 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 420, y: 424 },
        { kind: 'bell_gargoyle', x: 960, y: 205 },
        { kind: 'opera_puppet', x: 1780, y: 392 },
        { kind: 'demon_wolf', x: 2060, y: 392 },
        { kind: 'scroll_demon', x: 2480, y: 210 },
        { kind: 'bronze_guard', x: 3080, y: 424 },
      ],
      pickups: [
        { id: 'pk_abyss_spine_jz', kind: 'consumable', itemId: 'jiuzhuan_jin_dan', x: 1920, y: 392 },
      ],
    },

    // 16. 寒渊玄冰暗河 (20,8 3×1)：九幽极渊东翼寒脉，东端升龙古井直通寒髓冰泉秘洞！
    {
      id: 'abyss_east_corridor',
      name: '寒渊玄冰暗河',
      subtitle: '三格极寒冥水 · 东通寒渊升龙古井',
      region: 'prison',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      indoor: true,
      mapX: 20,
      mapY: 8,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 500,
      special: 'none',
      focalX: 1100,
      focalY: 416,
      leftRoomId: 'abyss_dragon_spine',
      leftDoorFloorY: 416,
      rightRoomId: 'dock_abyss_trench',
      rightDoorFloorY: 416,
      groundNodes: [
        { x: 0, y: 416, style: 'crypt_stone' },
        { x: 420, y: 416, style: 'stairs' },
        { x: 500, y: 450, style: 'crypt_stone' },
        { x: 1440, y: 450, style: 'stairs' },
        { x: 1520, y: 416, style: 'crypt_stone' },
        { x: 2200, y: 416, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 660, y: 364, w: 220, h: 32 },
        { x: 1080, y: 348, w: 220, h: 32 },
        { x: 1680, y: 332, w: 165, h: 30 },
        { x: 1780, y: 248, w: 165, h: 30 },
        { x: 1710, y: 164, w: 165, h: 28 },
        { x: 1765, y: 84, w: 155, h: 26 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 1760, bottomY: 34, style: 'crypt_vault' },
        { x1: 1940, x2: 2200, bottomY: 34, style: 'crypt_vault' },
      ],
      shafts: [
        { x1: 1760, x2: 1940, dir: 'up', targetRoomId: 'abyss_ascension_shaft' },
        {
          x1: 180,
          x2: 350,
          dir: 'down',
          targetRoomId: 'nether_east_descent',
          sealId: 'seal_abyss_nether_east',
        },
      ],
      waterZones: [{ x1: 480, x2: 1460, surfaceY: 420 }],
      decorProps: [
        { kind: 'guardian_statue', x: 115, y: 416, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1610, y: 416, scale: 0.9 },
      ],
      pavilions: [{ x: 174, y: 416, w: 182, hasPillars: false }],
      archways: [],
      torches: [
        { x: 340, y: 336 },
        { x: 1580, y: 336 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'plague_toad', x: 770, y: 364 },
        { kind: 'bell_gargoyle', x: 1190, y: 205 },
        { kind: 'bronze_guard', x: 1620, y: 416 },
      ],
      pickups: [
        { id: 'pk_abyss_east_mp', kind: 'max_up', itemId: 'mp_vessel', x: 2040, y: 416 },
      ],
    },

    // 17. 寒渊升龙古井 (22,7 1×1)：连接九幽地脉渊(22,8)与寒髓冰泉秘洞(22,6)，内设寒髓冰封障闭环东翼地宫！
    {
      id: 'abyss_ascension_shaft',
      name: '寒渊升龙古井',
      subtitle: '地脉东极竖井 · 上贯寒髓冰泉秘洞',
      region: 'prison',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      indoor: true,
      mapX: 22,
      mapY: 7,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'none',
      focalX: 400,
      focalY: 408,
      leftRoomId: 'catacomb_prison_vault',
      leftDoorFloorY: 408,
      rightRoomId: 'dock_underwater_tunnel',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 545, y: 326, w: 155, h: 30 },
        { x: 585, y: 242, w: 155, h: 30 },
        { x: 545, y: 158, w: 155, h: 28 },
        { x: 565, y: 82, w: 145, h: 26 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 565, bottomY: 34, style: 'crypt_vault' },
        { x1: 715, x2: 800, bottomY: 34, style: 'crypt_vault' },
      ],
      shafts: [
        { x1: 260, x2: 440, dir: 'down', targetRoomId: 'abyss_east_corridor' },
        { x1: 565, x2: 715, dir: 'up', targetRoomId: 'secret_ice_spring' },
      ],
      ironGate: {
        id: 'gate_ascension_ice',
        x: 495,
        topY: 0,
        bottomY: 408,
        gateKind: 'ice_phoenix',
      },
      decorProps: [
        { kind: 'guardian_statue', x: 140, y: 408, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [{ x: 254, y: 408, w: 192, hasPillars: false }],
      archways: [],
      torches: [{ x: 195, y: 332 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    // 18. 梨园拜月灵狐台 (19,0 2×1)：百戏梨园东顶露天拜月瑶台，供奉山海经【青丘玉狐】！
    {
      id: 'opera_moon_pavilion',
      name: '梨园拜月灵狐台',
      subtitle: '云顶戏楼瑶台 · 飞燕钩锁绝壁与护法青丘玉狐祭坛',
      region: 'opera',
      bgKey: 'bg_sky_altar',
      realm: 'normal',
      indoor: false,
      mapX: 19,
      mapY: 0,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'relic_pedestal',
      focalX: 1080,
      focalY: 148,
      leftRoomId: 'opera_save',
      leftDoorFloorY: 404,
      rightRoomId: 'cloud_star_gallery',
      rightDoorFloorY: 148,
      groundNodes: [
        { x: 0, y: 404, style: 'marble' },
        { x: 1600, y: 404, style: 'marble' },
      ],
      solidBlocks: [
        { x: 820, y: 148, w: 780, h: 256, blocking: true },
      ],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'coiled_pillar', x: 260, y: 404, scale: 0.94 },
        { kind: 'dragon_brazier', x: 900, y: 148, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1260, y: 148, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 460, y: 332 },
        { x: 1380, y: 112 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 690, y: 162 },
      ],
      npcs: [],
      spawns: [
        { kind: 'opera_puppet', x: 440, y: 404 },
        { kind: 'bell_gargoyle', x: 1320, y: 148 },
      ],
      pickups: [
        { id: 'pk_fam_fox', kind: 'ability', itemId: 'familiar_fox', x: 1080, y: 148 },
      ],
    },

    // 19. 摘星霓裳云廊 (21,0 3×1)：横跨梨园天顶与凌霄祭天坛前庭的汉白玉云海长廊，凭【青丘玉狐】破除九幽幻障 + 【壁虎游墙】翻越高崖直达天坛！
    {
      id: 'cloud_star_gallery',
      name: '摘星霓裳云廊',
      subtitle: '三格云顶天街 · 青丘破障与飞檐登壁直通圜丘天坛',
      region: 'altar',
      bgKey: 'bg_sky_altar',
      realm: 'normal',
      indoor: false,
      mapX: 21,
      mapY: 0,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 500,
      special: 'none',
      focalX: 1100,
      focalY: 412,
      leftRoomId: 'opera_moon_pavilion',
      leftDoorFloorY: 148,
      rightRoomId: 'altar_forecourt',
      rightDoorFloorY: 100,
      groundNodes: [
        { x: 0, y: 412, style: 'marble' },
        { x: 720, y: 412, style: 'stairs' },
        { x: 820, y: 376, style: 'marble' },
        { x: 1280, y: 376, style: 'stairs' },
        { x: 1380, y: 412, style: 'marble' },
        { x: 2200, y: 412, style: 'marble' },
      ],
      solidBlocks: [
        { x: 1680, y: 100, w: 520, h: 312, blocking: true },
      ],
      climbWalls: [
        { x: 1490, topY: 100, bottomY: 310 },
      ],
      ceilingSpans: [],
      shafts: [],
      ironGate: {
        id: 'gate_cloud_fox_illusion',
        x: 520,
        topY: 44,
        bottomY: 412,
        gateKind: 'illusion_fox',
      },
      decorProps: [
        { kind: 'coiled_pillar', x: 260, y: 412, scale: 0.96 },
        { kind: 'dragon_brazier', x: 920, y: 376, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1220, y: 376, scale: 0.94 },
        { kind: 'coiled_pillar', x: 1940, y: 100, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 660, y: 336 },
        { x: 1380, y: 336 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 980, y: 195 },
        { kind: 'bronze_guard', x: 1140, y: 376 },
        { kind: 'bell_gargoyle', x: 1620, y: 195 },
      ],
      pickups: [],
    },

    // 20. 东垣镇海机巧楼 (29,4 1×1)：连接青莲太白剑冢(28,4)与紫电雷池秘殿(29,3)，凭【天机木鸢】开启高格齿轮铜锁贯通上下双秘室！
    {
      id: 'clock_east_bastion',
      name: '东垣镇海机巧楼',
      subtitle: '东极双秘室枢塔 · 上贯紫电雷池 · 西接太白剑冢',
      region: 'clock_tower',
      bgKey: 'bg_tower_interior',
      realm: 'normal',
      indoor: true,
      mapX: 29,
      mapY: 4,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'none',
      focalX: 400,
      focalY: 408,
      leftRoomId: 'secret_sword_tomb',
      leftDoorFloorY: 408,
      rightRoomId: 'outer_wall_lower',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 800, y: 408, style: 'marble' },
      ],
      solidBlocks: [
        { x: 250, y: 326, w: 160, h: 30 },
        { x: 310, y: 242, w: 160, h: 30 },
        { x: 250, y: 158, w: 160, h: 28 },
        { x: 265, y: 82, w: 150, h: 26 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 235, bottomY: 34, style: 'palace_timber' },
        { x1: 415, x2: 800, bottomY: 34, style: 'palace_timber' },
      ],
      shafts: [{ x1: 235, x2: 415, dir: 'up', targetRoomId: 'secret_thunder_vault' }],
      ironGate: {
        id: 'gate_bastion_kestrel',
        x: 195,
        topY: 0,
        bottomY: 408,
        gateKind: 'gear_kestrel',
      },
      decorProps: [
        { kind: 'giant_bell', x: 620, y: 220, scale: 0.92 },
        { kind: 'dragon_brazier', x: 590, y: 408, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [{ x: 660, y: 332 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 540, y: 195 },
      ],
      pickups: [],
    },
  ];

  // ==================== 十、月下级全城大扩建（上篇：神武演武校场 · 西崖摘星梯 · 沉船古渡 · 太古朱砂矿脉，21 座殿宇） ====================
  const sotnWingsPart1: BuiltRoom[] = [
    {
      id: 'cliff_pine_trail',
      name: '苍松悬栈古道',
      subtitle: '苦竹崖顶云栈 · 下接荒冢林道 · 上通听涛古祠',
      region: 'gatehouse',
      bgKey: 'bg_bamboo_cliff',
      realm: 'normal',
      indoor: false,
      mapX: 0,
      mapY: 3,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 500,
      special: 'none',
      focalX: 1100,
      focalY: 408,
      rightRoomId: 'west_cliff_pagoda',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 384, style: 'flagstone' },
        { x: 520, y: 384, style: 'stairs' },
        { x: 620, y: 408, style: 'flagstone' },
        { x: 2200, y: 408, style: 'flagstone' },
      ],
      solidBlocks: [
        { x: 880, y: 318, w: 170, h: 30 },
        { x: 980, y: 226, w: 165, h: 30 },
        { x: 890, y: 136, w: 160, h: 28 },
      ],
      ceilingSpans: [],
      shafts: [
        { x1: 1860, x2: 2040, dir: 'down', targetRoomId: 'entrance_bamboo_woods' },
        { x1: 910, x2: 1090, dir: 'up', targetRoomId: 'cliff_hermit_shrine' },
      ],
      decorProps: [
        { kind: 'guardian_statue', x: 240, y: 384, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1460, y: 408, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [{ x: 1854, y: 408, w: 192, hasPillars: false }],
      archways: [],
      torches: [
        { x: 460, y: 316 },
        { x: 1580, y: 336 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'spirit_crow', x: 520, y: 190 },
        { kind: 'paper_swordsman', x: 760, y: 408 },
        { kind: 'bone_archer', x: 1420, y: 408 },
        { kind: 'spirit_crow', x: 1680, y: 195 },
      ],
      pickups: [],
    },
    {
      id: 'cliff_hermit_shrine',
      name: '断崖孤松望云坪',
      subtitle: '西郊千仞绝壁险峰 · 攀越悬岩可得【千年朱果】',
      region: 'gatehouse',
      bgKey: 'bg_bamboo_cliff',
      realm: 'normal',
      indoor: false,
      mapX: 0,
      mapY: 2,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 520,
      focalY: 408,
      rightRoomId: 'cliff_wind_pavilion',
      rightDoorFloorY: 404,
      groundNodes: [
        { x: 0, y: 360, style: 'flagstone' },
        { x: 260, y: 360, style: 'stairs' },
        { x: 350, y: 408, style: 'flagstone' },
        { x: 740, y: 408, style: 'stairs' },
        { x: 810, y: 404, style: 'flagstone' },
        { x: 1600, y: 404, style: 'flagstone' },
      ],
      solidBlocks: [
        { x: 420, y: 292, w: 200, h: 30 },
        { x: 150, y: 224, w: 210, h: 30 },
      ],
      ceilingSpans: [],
      shafts: [{ x1: 910, x2: 1090, dir: 'down', targetRoomId: 'cliff_pine_trail' }],
      decorProps: [
        { kind: 'coiled_pillar', x: 110, y: 360, scale: 0.94 },
        { kind: 'guardian_statue', x: 790, y: 404, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1320, y: 404, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [{ x: 904, y: 404, w: 192, hasPillars: false }],
      archways: [],
      torches: [
        { x: 310, y: 332 },
        { x: 1190, y: 332 },
      ],
      foregrounds: [],
      lanterns: [{ x: 680, y: 175 }],
      npcs: [],
      spawns: [
        { kind: 'demon_wolf', x: 560, y: 408 },
        { kind: 'spirit_crow', x: 380, y: 180 },
        { kind: 'corpse_soldier', x: 1360, y: 404 },
      ],
      pickups: [
        { id: 'pk_cliff_hermit_hp', kind: 'max_up', itemId: 'hp_vessel', x: 255, y: 224 },
        { id: 'pk_cliff_hermit_wine', kind: 'consumable', itemId: 'osmanthus_wine', x: 520, y: 292 },
      ],
    },
    {
      id: 'cliff_wind_pavilion',
      name: '绝壁风雷亭',
      subtitle: '飞燕悬灯秘径 · 千年朱果奇珍台',
      region: 'gatehouse',
      bgKey: 'bg_bamboo_cliff',
      realm: 'normal',
      indoor: false,
      mapX: 2,
      mapY: 2,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'none',
      focalX: 400,
      focalY: 404,
      leftRoomId: 'cliff_hermit_shrine',
      leftDoorFloorY: 404,
      rightRoomId: 'west_cliff_pagoda',
      rightDoorFloorY: 404,
      groundNodes: [
        { x: 0, y: 404, style: 'flagstone' },
        { x: 220, y: 404, style: 'arch_bridge' },
        { x: 580, y: 404, style: 'flagstone' },
        { x: 800, y: 404, style: 'flagstone' },
      ],
      solidBlocks: [{ x: 290, y: 248, w: 220, h: 32 }],
      ceilingSpans: [],
      shafts: [],
      decorProps: [{ kind: 'dragon_brazier', x: 660, y: 404, scale: 0.9 }],
      waterZones: [{ x1: 220, x2: 580, surfaceY: 428 }],
      pavilions: [],
      archways: [],
      torches: [{ x: 140, y: 332 }],
      foregrounds: [],
      lanterns: [{ x: 400, y: 175 }],
      npcs: [],
      spawns: [{ kind: 'spirit_crow', x: 400, y: 180 }],
      pickups: [{ id: 'pk_cliff_wind_hp', kind: 'max_up', itemId: 'hp_vessel', x: 400, y: 248 }],
    },
    {
      id: 'west_cliff_pagoda',
      name: '西垣望江谯楼',
      subtitle: '双层枢机塔楼 · 四向贯通竹崖与神武百步梯',
      region: 'gatehouse',
      bgKey: 'bg_tower_interior',
      realm: 'normal',
      indoor: true,
      mapX: 3,
      mapY: 2,
      gridW: 1,
      gridH: 2,
      pixelW: 800,
      pixelH: 880,
      special: 'none',
      focalX: 400,
      focalY: 804,
      sideDoors: [
        { side: 'left', floorY: 356, targetRoomId: 'cliff_wind_pavilion', rowOffset: 0 },
        { side: 'right', floorY: 356, targetRoomId: 'west_cliff_skybridge', rowOffset: 0 },
        { side: 'left', floorY: 804, targetRoomId: 'cliff_pine_trail', rowOffset: 1 },
        { side: 'right', floorY: 804, targetRoomId: 'entrance_battlement_tower', rowOffset: 1 },
      ],
      groundNodes: [
        { x: 0, y: 804, style: 'marble' },
        { x: 800, y: 804, style: 'marble' },
      ],
      solidBlocks: [
        { x: 0, y: 356, w: 250, h: 36 },
        { x: 550, y: 356, w: 250, h: 36 },
        { x: 315, y: 196, w: 170, h: 28 },
        { x: 440, y: 492, w: 200, h: 32 },
        { x: 260, y: 626, w: 210, h: 32 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 310, bottomY: 34, style: 'palace_timber' },
        { x1: 490, x2: 800, bottomY: 34, style: 'palace_timber' },
      ],
      shafts: [{ x1: 310, x2: 490, dir: 'up', targetRoomId: 'chapel_cloud_stair' }],
      decorProps: [
        { kind: 'weapon_rack', x: 160, y: 804, scale: 0.92 },
        { kind: 'dragon_brazier', x: 640, y: 804, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 160, y: 286 },
        { x: 640, y: 728 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bone_archer', x: 630, y: 356 },
        { kind: 'paper_swordsman', x: 420, y: 804 },
      ],
      pickups: [],
    },
    {
      id: 'chapel_cloud_stair',
      name: '钦天登云百步梯',
      subtitle: '三格双层皇家钟阶 · 致敬月下礼拜堂长阶 · 贯通神武演武场',
      region: 'colosseum',
      bgKey: 'bg_chapel_spire',
      realm: 'normal',
      indoor: false,
      mapX: 3,
      mapY: 0,
      gridW: 3,
      gridH: 2,
      pixelW: 2400,
      pixelH: 880,
      special: 'none',
      focalX: 1200,
      focalY: 804,
      sideDoors: [
        { side: 'right', floorY: 356, targetRoomId: 'colosseum_west_gate', rowOffset: 0 },
        { side: 'right', floorY: 804, targetRoomId: 'west_cliff_watchtower', rowOffset: 1 },
      ],
      groundNodes: [
        { x: 0, y: 804, style: 'marble' },
        { x: 760, y: 804, style: 'stairs' },
        { x: 920, y: 744, style: 'marble' },
        { x: 1580, y: 744, style: 'stairs' },
        { x: 1740, y: 804, style: 'marble' },
        { x: 2400, y: 804, style: 'marble' },
      ],
      solidBlocks: [
        { x: 460, y: 696, w: 240, h: 32 },
        { x: 780, y: 604, w: 260, h: 32 },
        { x: 1120, y: 516, w: 260, h: 32 },
        { x: 1480, y: 432, w: 260, h: 32 },
        { x: 1840, y: 356, w: 560, h: 36 },
      ],
      ceilingSpans: [],
      shafts: [{ x1: 280, x2: 460, dir: 'down', targetRoomId: 'west_cliff_pagoda' }],
      decorProps: [
        { kind: 'giant_bell', x: 640, y: 220, scale: 0.96 },
        { kind: 'giant_bell', x: 1360, y: 180, scale: 0.96 },
        { kind: 'coiled_pillar', x: 1080, y: 744, scale: 0.95 },
        { kind: 'dragon_brazier', x: 2040, y: 356, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [{ x: 274, y: 804, w: 192, hasPillars: false }],
      archways: [],
      torches: [
        { x: 560, y: 732 },
        { x: 1980, y: 732 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 960, y: 380 },
        { x: 1620, y: 260 },
      ],
      npcs: [],
      spawns: [
        { kind: 'spirit_crow', x: 680, y: 420 },
        { kind: 'shenji_musketeer', x: 910, y: 604 },
        { kind: 'jinwu_mace_guard', x: 1260, y: 744 },
        { kind: 'bell_gargoyle', x: 1640, y: 260 },
        { kind: 'shenji_musketeer', x: 2080, y: 356 },
      ],
      pickups: [],
    },
    {
      id: 'colosseum_west_gate',
      name: '神武校场西阙',
      subtitle: '皇家演武场前门 · 裂地封印暗通西垣谯楼',
      region: 'colosseum',
      bgKey: 'bg_martial_colosseum',
      realm: 'normal',
      indoor: false,
      mapX: 6,
      mapY: 0,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 800,
      focalY: 408,
      leftRoomId: 'chapel_cloud_stair',
      leftDoorFloorY: 408,
      rightRoomId: 'colosseum_grand_arena',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 640, y: 408, style: 'stairs' },
        { x: 720, y: 376, style: 'marble' },
        { x: 1180, y: 376, style: 'stairs' },
        { x: 1260, y: 408, style: 'marble' },
        { x: 1600, y: 408, style: 'marble' },
      ],
      solidBlocks: [],
      ceilingSpans: [],
      shafts: [
        {
          x1: 310,
          x2: 490,
          dir: 'down',
          targetRoomId: 'west_cliff_watchtower',
        },
      ],
      decorProps: [
        { kind: 'weapon_rack', x: 200, y: 408, scale: 0.94 },
        { kind: 'dragon_brazier', x: 780, y: 376, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1120, y: 376, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [{ x: 304, y: 408, w: 192, hasPillars: false }],
      archways: [],
      torches: [{ x: 1380, y: 332 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'shenji_musketeer', x: 880, y: 376 },
        { kind: 'jinwu_mace_guard', x: 1320, y: 408 },
      ],
      pickups: [],
    },
    {
      id: 'colosseum_grand_arena',
      name: '神武百战演武场',
      subtitle: '镇武大将军·拓跋烈镇守 · 破阵夺魁赐【神武吞猊山文甲】',
      region: 'colosseum',
      bgKey: 'bg_martial_colosseum',
      realm: 'normal',
      indoor: false,
      mapX: 8,
      mapY: 0,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 500,
      special: 'boss_room',
      bossKind: 'boss_colosseum_general',
      storyTriggerId: 'boss_general_pre',
      focalX: 1100,
      focalY: 376,
      leftRoomId: 'colosseum_west_gate',
      leftDoorFloorY: 412,
      rightRoomId: 'colosseum_save',
      rightDoorFloorY: 412,
      groundNodes: [
        { x: 0, y: 412, style: 'marble' },
        { x: 560, y: 412, style: 'stairs' },
        { x: 660, y: 376, style: 'marble' },
        { x: 1540, y: 376, style: 'stairs' },
        { x: 1640, y: 412, style: 'marble' },
        { x: 2200, y: 412, style: 'marble' },
      ],
      solidBlocks: [
        { x: 340, y: 288, w: 220, h: 32 },
        { x: 1640, y: 288, w: 220, h: 32 },
      ],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'weapon_rack', x: 220, y: 412, scale: 0.95 },
        { kind: 'dragon_brazier', x: 740, y: 376, scale: 0.96 },
        { kind: 'dragon_brazier', x: 1460, y: 376, scale: 0.96 },
        { kind: 'weapon_rack', x: 1980, y: 412, scale: 0.95 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 480, y: 336 },
        { x: 1720, y: 336 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      steles: [{ id: 'stele_colosseum_valor', x: 920 }],
      spawns: [],
      pickups: [
        {
          id: 'pk_colosseum_cuirass',
          kind: 'armor',
          itemId: 'martial_tiger_cuirass',
          x: 1100,
          y: 376,
        },
      ],
    },
    {
      id: 'colosseum_save',
      name: '神武点将钟鼓台',
      subtitle: '演武场东翼聚兵重台 · 洪钟战鼓激励军魂',
      region: 'colosseum',
      bgKey: 'bg_martial_colosseum',
      realm: 'normal',
      indoor: false,
      mapX: 11,
      mapY: 0,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'none',
      focalX: 400,
      focalY: 430,
      leftRoomId: 'colosseum_grand_arena',
      leftDoorFloorY: 396,
      rightRoomId: 'colosseum_east_armory',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'marble' },
        { x: 175, y: 396, style: 'stairs' },
        { x: 250, y: 430, style: 'flagstone' },
        { x: 550, y: 430, style: 'stairs' },
        { x: 625, y: 396, style: 'marble' },
        { x: 800, y: 396, style: 'marble' },
      ],
      solidBlocks: [{ x: 255, y: 288, w: 290, h: 32 }],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'weapon_rack', x: 110, y: 396, scale: 0.94 },
        { kind: 'giant_bell', x: 400, y: 206, scale: 0.92 },
        { kind: 'dragon_brazier', x: 690, y: 396, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 185, y: 322 },
        { x: 615, y: 322 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'jinwu_mace_guard', x: 395, y: 430 },
        { kind: 'shenji_musketeer', x: 650, y: 396 },
      ],
      pickups: [{ id: 'pk_col_bell_jingang', kind: 'consumable', itemId: 'jingang_dan', x: 400, y: 288 }],
    },
    {
      id: 'colosseum_east_armory',
      name: '神武御前武库',
      subtitle: '天机齿轮秘库 · 藏【雷音破阵战鼓佩】 · 下通木鸢秘阁',
      region: 'colosseum',
      bgKey: 'bg_martial_colosseum',
      realm: 'normal',
      indoor: true,
      mapX: 12,
      mapY: 0,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'relic_pedestal',
      focalX: 780,
      focalY: 372,
      leftRoomId: 'colosseum_save',
      leftDoorFloorY: 408,
      rightRoomId: 'colosseum_sky_bridge',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 560, y: 408, style: 'stairs' },
        { x: 640, y: 372, style: 'marble' },
        { x: 960, y: 372, style: 'stairs' },
        { x: 1040, y: 408, style: 'marble' },
        { x: 1600, y: 408, style: 'marble' },
      ],
      solidBlocks: [],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 34, style: 'palace_timber' }],
      shafts: [{ x1: 1220, x2: 1400, dir: 'down', targetRoomId: 'library_automaton_loft' }],
      ironGate: {
        id: 'gate_colosseum_armory_kestrel',
        x: 420,
        topY: 0,
        bottomY: 408,
        gateKind: 'gear_kestrel',
      },
      decorProps: [
        { kind: 'weapon_rack', x: 220, y: 408, scale: 0.94 },
        { kind: 'dragon_brazier', x: 680, y: 372, scale: 0.92 },
        { kind: 'weapon_rack', x: 1480, y: 408, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [{ x: 1214, y: 408, w: 192, hasPillars: false }],
      archways: [],
      torches: [
        { x: 320, y: 332 },
        { x: 1120, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'jinwu_mace_guard', x: 280, y: 408 },
        { kind: 'shenji_musketeer', x: 1080, y: 408 },
      ],
      pickups: [
        {
          id: 'pk_colosseum_drum',
          kind: 'armor',
          itemId: 'colosseum_war_drum',
          x: 780,
          y: 372,
        },
      ],
    },
    {
      id: 'colosseum_sky_bridge',
      name: '摘星连云栈',
      subtitle: '天顶互通飞栈 · 贯通神武校场与百戏梨园秘阁',
      region: 'colosseum',
      bgKey: 'bg_martial_colosseum',
      realm: 'normal',
      indoor: false,
      mapX: 14,
      mapY: 0,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'none',
      focalX: 400,
      focalY: 404,
      leftRoomId: 'colosseum_east_armory',
      leftDoorFloorY: 404,
      rightRoomId: 'relic_grapple_vault',
      rightDoorFloorY: 404,
      groundNodes: [
        { x: 0, y: 404, style: 'marble' },
        { x: 800, y: 404, style: 'marble' },
      ],
      solidBlocks: [],
      ceilingSpans: [],
      shafts: [],
      ironGate: {
        id: 'gate_colosseum_opera_lever',
        x: 420,
        topY: 44,
        bottomY: 404,
        gateKind: 'lever_shortcut',
        leverSide: 'right',
      },
      decorProps: [
        { kind: 'coiled_pillar', x: 200, y: 404, scale: 0.94 },
        { kind: 'dragon_brazier', x: 620, y: 404, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [{ x: 260, y: 332 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [{ kind: 'bell_gargoyle', x: 300, y: 195 }],
      pickups: [],
    },
    {
      id: 'sunken_ferry_shaft',
      name: '断桥沉江竖井',
      subtitle: '西极三层暗瀑深渊 · 贯通玄武灵潭、沉船古渡与朱砂矿井',
      region: 'shipyard',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      indoor: true,
      mapX: 0,
      mapY: 5,
      gridW: 1,
      gridH: 3,
      pixelW: 800,
      pixelH: 1320,
      special: 'none',
      focalX: 400,
      focalY: 1236,
      sideDoors: [
        { side: 'right', floorY: 356, targetRoomId: 'bamboo_cliff_grotto', rowOffset: 0 },
        { side: 'right', floorY: 796, targetRoomId: 'sunken_reed_wharf', rowOffset: 1 },
        { side: 'right', floorY: 1236, targetRoomId: 'mine_vertical_pit', rowOffset: 2 },
      ],
      groundNodes: [
        { x: 0, y: 1236, style: 'crypt_stone' },
        { x: 800, y: 1236, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 520, y: 356, w: 280, h: 36 },
        { x: 240, y: 468, w: 210, h: 32 },
        { x: 460, y: 578, w: 210, h: 32 },
        { x: 220, y: 688, w: 210, h: 32 },
        { x: 520, y: 796, w: 280, h: 36 },
        { x: 260, y: 908, w: 210, h: 32 },
        { x: 460, y: 1018, w: 210, h: 32 },
        { x: 240, y: 1128, w: 210, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'guardian_statue', x: 140, y: 1236, scale: 0.92 },
        { kind: 'dragon_brazier', x: 640, y: 1236, scale: 0.9 },
      ],
      waterZones: [{ x1: 180, x2: 510, surfaceY: 1244 }],
      pavilions: [],
      archways: [],
      torches: [
        { x: 620, y: 286 },
        { x: 620, y: 726 },
        { x: 620, y: 1166 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'spirit_crow', x: 380, y: 420 },
        { kind: 'plague_toad', x: 340, y: 688 },
        { kind: 'bone_archer', x: 340, y: 1128 },
      ],
      pickups: [],
    },
    {
      id: 'sunken_reed_wharf',
      name: '沉船芦苇古渡',
      subtitle: '三格地下冥河摆渡 · 乘木筏横渡沉江暗流',
      region: 'shipyard',
      bgKey: 'bg_sunken_shipyard',
      realm: 'normal',
      indoor: true,
      mapX: 1,
      mapY: 6,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 500,
      special: 'none',
      focalX: 1100,
      focalY: 408,
      leftRoomId: 'sunken_ferry_shaft',
      leftDoorFloorY: 408,
      rightRoomId: 'sunken_water_shrine',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 420, y: 408, style: 'stairs' },
        { x: 500, y: 454, style: 'crypt_stone' },
        { x: 1700, y: 454, style: 'stairs' },
        { x: 1780, y: 408, style: 'crypt_stone' },
        { x: 2200, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [{ x: 1010, y: 348, w: 200, h: 32 }],
      movingPlatforms: [
        { x1: 540, y1: 392, x2: 920, y2: 392, w: 170, speed: 0.9, style: 'wood_ferry' },
        { x1: 1260, y1: 392, x2: 1640, y2: 392, w: 170, speed: 0.9, phase: 1.5, style: 'wood_ferry' },
      ],
      ceilingSpans: [{ x1: 0, x2: 2200, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      waterZones: [{ x1: 480, x2: 1720, surfaceY: 416 }],
      decorProps: [
        { kind: 'dragon_brazier', x: 240, y: 408, scale: 0.92 },
        { kind: 'guardian_statue', x: 1960, y: 408, scale: 0.92 },
      ],
      pavilions: [],
      archways: [],
      torches: [
        { x: 340, y: 332 },
        { x: 1860, y: 332 },
      ],
      foregrounds: [],
      lanterns: [{ x: 1110, y: 210 }],
      npcs: [],
      spawns: [
        { kind: 'armored_tortoise', x: 1110, y: 348 },
        { kind: 'guixu_water_fiend', x: 780, y: 210 },
        { kind: 'shenji_musketeer', x: 1880, y: 408 },
      ],
      pickups: [],
    },
    {
      id: 'sunken_water_shrine',
      name: '沉渊栈桥暗渡池',
      subtitle: '芦苇暗河木拱津渡 · 寒潭深水潜伏水妖',
      region: 'shipyard',
      bgKey: 'bg_sunken_shipyard',
      realm: 'normal',
      indoor: true,
      mapX: 4,
      mapY: 6,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'none',
      focalX: 400,
      focalY: 396,
      leftRoomId: 'sunken_reed_wharf',
      leftDoorFloorY: 396,
      rightRoomId: 'sunken_sluice_cavern',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'crypt_stone' },
        { x: 195, y: 396, style: 'arch_bridge' },
        { x: 605, y: 396, style: 'crypt_stone' },
        { x: 800, y: 396, style: 'crypt_stone' },
      ],
      solidBlocks: [],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'guardian_statue', x: 105, y: 396, scale: 0.92 },
        { kind: 'dragon_brazier', x: 695, y: 396, scale: 0.9 },
      ],
      waterZones: [{ x1: 195, x2: 605, surfaceY: 418 }],
      pavilions: [{ x: 285, y: 272, w: 230, hasPillars: false }],
      archways: [],
      torches: [
        { x: 165, y: 320 },
        { x: 635, y: 320 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'guixu_water_fiend', x: 400, y: 205 },
        { kind: 'plague_toad', x: 520, y: 396 },
      ],
      pickups: [{ id: 'pk_sunken_bridge_wine', kind: 'consumable', itemId: 'tiger_bone_wine', x: 400, y: 272 }],
    },
    {
      id: 'sunken_sluice_cavern',
      name: '黑水潜流溶洞',
      subtitle: '上接护城寒泉暗渠 · 东设单向铜杆捷径直通镇火巨窟',
      region: 'shipyard',
      bgKey: 'bg_sunken_shipyard',
      realm: 'normal',
      indoor: true,
      mapX: 5,
      mapY: 6,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 800,
      focalY: 408,
      leftRoomId: 'sunken_water_shrine',
      leftDoorFloorY: 408,
      rightRoomId: 'forge_boss_arena',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 520, y: 408, style: 'stairs' },
        { x: 600, y: 442, style: 'crypt_stone' },
        { x: 1080, y: 442, style: 'stairs' },
        { x: 1160, y: 408, style: 'crypt_stone' },
        { x: 1600, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 275, y: 204, w: 165, h: 28 },
        { x: 740, y: 360, w: 210, h: 32 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 280, bottomY: 34, style: 'crypt_vault' },
        { x1: 450, x2: 1600, bottomY: 34, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 280, x2: 450, dir: 'up', targetRoomId: 'moat_west_tunnel' }],
      ironGate: {
        id: 'gate_sunken_forge_lever',
        x: 1320,
        topY: 0,
        bottomY: 408,
        gateKind: 'lever_shortcut',
        leverSide: 'left',
      },
      waterZones: [{ x1: 580, x2: 1100, surfaceY: 414 }],
      decorProps: [
        { kind: 'guardian_statue', x: 150, y: 408, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1210, y: 408, scale: 0.9 },
      ],
      pavilions: [],
      archways: [],
      torches: [{ x: 1180, y: 332 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'plague_toad', x: 840, y: 360 },
        { kind: 'bronze_guard', x: 1190, y: 408 },
      ],
      pickups: [],
    },
    {
      id: 'mine_vertical_pit',
      name: '朱砂古矿深井',
      subtitle: '双层升降吊笼竖井 · 西壁暗藏太古火晶秘窟',
      region: 'forge',
      bgKey: 'bg_forge_prison',
      realm: 'normal',
      indoor: true,
      mapX: 1,
      mapY: 7,
      gridW: 1,
      gridH: 2,
      pixelW: 800,
      pixelH: 880,
      special: 'none',
      focalX: 400,
      focalY: 804,
      sideDoors: [
        { side: 'left', floorY: 356, targetRoomId: 'sunken_ferry_shaft', rowOffset: 0 },
        { side: 'right', floorY: 356, targetRoomId: 'mine_timber_gallery', rowOffset: 0 },
        {
          side: 'left',
          floorY: 804,
          targetRoomId: 'mine_secret_geode',
          rowOffset: 1,
          secretWallId: 'sec_mine_geode',
        },
        { side: 'right', floorY: 804, targetRoomId: 'mine_deep_vein', rowOffset: 1 },
      ],
      groundNodes: [
        { x: 0, y: 804, style: 'crypt_stone' },
        { x: 800, y: 804, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 0, y: 356, w: 250, h: 36 },
        { x: 550, y: 356, w: 250, h: 36 },
      ],
      movingPlatforms: [
        { x1: 310, y1: 724, x2: 310, y2: 412, w: 180, speed: 1.05, style: 'bronze_lift' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [{ kind: 'dragon_brazier', x: 640, y: 804, scale: 0.9 }],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 160, y: 286 },
        { x: 640, y: 728 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bone_archer', x: 150, y: 356 },
        { kind: 'corpse_soldier', x: 480, y: 804 },
      ],
      pickups: [],
    },
    {
      id: 'mine_secret_geode',
      name: '太古火晶秘窟',
      subtitle: '独立破壁密室 · 天山雪莲与九转金丹',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      isSecretRoom: true,
      mapX: 0,
      mapY: 8,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'relic_pedestal',
      focalX: 380,
      focalY: 368,
      rightRoomId: 'mine_vertical_pit',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 220, y: 408, style: 'stairs' },
        { x: 300, y: 368, style: 'marble' },
        { x: 520, y: 368, style: 'stairs' },
        { x: 600, y: 408, style: 'crypt_stone' },
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 260, y: 408, scale: 0.92 },
        { kind: 'guardian_statue', x: 660, y: 408, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [{ x: 620, y: 332 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [
        { id: 'pk_mine_geode_mp', kind: 'max_up', itemId: 'mp_vessel', x: 360, y: 368 },
        { id: 'pk_mine_geode_jz', kind: 'consumable', itemId: 'jiuzhuan_jin_dan', x: 460, y: 368 },
      ],
    },
    {
      id: 'mine_timber_gallery',
      name: '荒废坑木矿道',
      subtitle: '三格废弃采矿坑道 · 立有《工部严封太古朱砂矿脉碑》',
      region: 'forge',
      bgKey: 'bg_forge_prison',
      realm: 'normal',
      indoor: true,
      mapX: 2,
      mapY: 7,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 500,
      special: 'none',
      focalX: 1100,
      focalY: 412,
      leftRoomId: 'mine_vertical_pit',
      leftDoorFloorY: 412,
      rightRoomId: 'mine_crystal_cavern',
      rightDoorFloorY: 412,
      groundNodes: [
        { x: 0, y: 412, style: 'crypt_stone' },
        { x: 540, y: 412, style: 'stairs' },
        { x: 640, y: 444, style: 'crypt_stone' },
        { x: 1460, y: 444, style: 'stairs' },
        { x: 1560, y: 412, style: 'crypt_stone' },
        { x: 2200, y: 412, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 740, y: 352, w: 220, h: 32 },
        { x: 1140, y: 352, w: 220, h: 32 },
      ],
      hazards: [
        { kind: 'spikes', x: 980, y: 444, span: 120 },
      ],
      ceilingSpans: [{ x1: 0, x2: 2200, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 320, y: 412, scale: 0.9 },
        { kind: 'weapon_rack', x: 1880, y: 412, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 460, y: 336 },
        { x: 1680, y: 336 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      steles: [{ id: 'stele_mine_dragon_iron', x: 1740 }],
      spawns: [
        { kind: 'corpse_soldier', x: 680, y: 444 },
        { kind: 'bone_archer', x: 850, y: 352 },
        { kind: 'demon_wolf', x: 1320, y: 444 },
        { kind: 'bronze_guard', x: 1640, y: 412 },
      ],
      pickups: [],
    },
    {
      id: 'mine_crystal_cavern',
      name: '赤晶地火溶窟',
      subtitle: '寒髓封晶洞 · 朱雀融冰贯通千斤坠秘坛',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 5,
      mapY: 7,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 800,
      focalY: 408,
      leftRoomId: 'mine_timber_gallery',
      leftDoorFloorY: 408,
      rightRoomId: 'relic_ground_slam',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 1600, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [{ x: 660, y: 312, w: 240, h: 32 }],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      ironGate: {
        id: 'gate_mine_crystal_phoenix',
        x: 1240,
        topY: 0,
        bottomY: 408,
        gateKind: 'ice_phoenix',
      },
      decorProps: [
        { kind: 'dragon_brazier', x: 320, y: 408, scale: 0.92 },
        { kind: 'guardian_statue', x: 1420, y: 408, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [{ x: 960, y: 332 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'demon_wolf', x: 540, y: 408 },
        { kind: 'bell_gargoyle', x: 920, y: 195 },
      ],
      pickups: [],
    },
    {
      id: 'mine_deep_vein',
      name: '地肺太古铜脉',
      subtitle: '四格赤火熔岩脉 · 喷火地隙与千锤铁卫',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 2,
      mapY: 8,
      gridW: 4,
      gridH: 1,
      pixelW: 3000,
      pixelH: 520,
      special: 'none',
      focalX: 1500,
      focalY: 416,
      leftRoomId: 'mine_vertical_pit',
      leftDoorFloorY: 416,
      rightRoomId: 'mine_warp',
      rightDoorFloorY: 416,
      groundNodes: [
        { x: 0, y: 416, style: 'crypt_stone' },
        { x: 680, y: 416, style: 'stairs' },
        { x: 780, y: 458, style: 'crypt_stone' },
        { x: 1620, y: 458, style: 'stairs' },
        { x: 1720, y: 416, style: 'crypt_stone' },
        { x: 3000, y: 416, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 860, y: 356, w: 220, h: 32 },
        { x: 1260, y: 342, w: 220, h: 32 },
      ],
      hazards: [
        { kind: 'fire_vent', x: 2120, y: 416, span: 150, speed: 1.1 },
      ],
      ceilingSpans: [{ x1: 0, x2: 3000, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      waterZones: [{ x1: 760, x2: 1640, surfaceY: 432, liquidKind: 'lava' }],
      decorProps: [
        { kind: 'dragon_brazier', x: 420, y: 416, scale: 0.94 },
        { kind: 'coiled_pillar', x: 1920, y: 416, scale: 0.96 },
        { kind: 'dragon_brazier', x: 2640, y: 416, scale: 0.94 },
      ],
      pavilions: [],
      archways: [],
      torches: [
        { x: 540, y: 336 },
        { x: 2420, y: 336 },
      ],
      foregrounds: [],
      lanterns: [{ x: 1180, y: 205 }],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 520, y: 416 },
        { kind: 'bell_gargoyle', x: 1180, y: 205 },
        { kind: 'demon_wolf', x: 1860, y: 416 },
        { kind: 'bronze_guard', x: 2480, y: 416 },
      ],
      pickups: [
        { id: 'pk_mine_deep_hp', kind: 'max_up', itemId: 'hp_vessel', x: 1370, y: 342 },
        { id: 'pk_suodi_mine', kind: 'consumable', itemId: 'suodi_talisman', x: 1980, y: 416 },
      ],
    },
    {
      id: 'mine_warp',
      name: '地肺矿脉乾坤阵',
      subtitle: '地肺深层八卦传送阵',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 6,
      mapY: 8,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'warp_bagua',
      warpName: '地肺古矿脉',
      focalX: 400,
      focalY: 408,
      leftRoomId: 'mine_deep_vein',
      leftDoorFloorY: 408,
      rightRoomId: 'mine_lava_bridge',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 210, y: 408, scale: 0.9 },
        { kind: 'dragon_brazier', x: 590, y: 408, scale: 0.9 },
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
      id: 'mine_lava_bridge',
      name: '熔岩断索危桥',
      subtitle: '三格熔金火渊 · 东连九幽地脉西渊 · 下潜黄泉西落冥井',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 7,
      mapY: 8,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 500,
      special: 'none',
      focalX: 1100,
      focalY: 416,
      leftRoomId: 'mine_warp',
      leftDoorFloorY: 416,
      rightRoomId: 'abyss_dragon_vein_west',
      rightDoorFloorY: 416,
      groundNodes: [
        { x: 0, y: 416, style: 'crypt_stone' },
        { x: 360, y: 416, style: 'stairs' },
        { x: 440, y: 458, style: 'crypt_stone' },
        { x: 960, y: 458, style: 'stairs' },
        { x: 1040, y: 416, style: 'crypt_stone' },
        { x: 2200, y: 416, style: 'crypt_stone' },
      ],
      movingPlatforms: [
        { x1: 480, y1: 376, x2: 815, y2: 376, w: 175, speed: 1.0, style: 'bronze_lift' },
      ],
      ceilingSpans: [{ x1: 0, x2: 2200, bottomY: 34, style: 'crypt_vault' }],
      shafts: [
        {
          x1: 1080,
          x2: 1260,
          dir: 'down',
          targetRoomId: 'nether_west_descent',
          sealId: 'seal_mine_nether',
        },
      ],
      ironGate: {
        id: 'gate_lava_bridge_mist',
        x: 1010,
        topY: 0,
        bottomY: 458,
        gateKind: 'mist_only',
      },
      waterZones: [{ x1: 430, x2: 970, surfaceY: 432, liquidKind: 'lava' }],
      decorProps: [
        { kind: 'dragon_brazier', x: 220, y: 416, scale: 0.92 },
        { kind: 'guardian_statue', x: 1860, y: 416, scale: 0.94 },
      ],
      pavilions: [],
      archways: [],
      torches: [{ x: 1580, y: 336 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 720, y: 195 },
        { kind: 'bronze_guard', x: 1560, y: 416 },
      ],
      pickups: [],
    },
  ];

  // ==================== 十一、月下级全城大扩建（下篇：东垣镇海外壁 · 归墟艨艟废船坞 · 九幽忘川冥府 · 太古祖龙极渊，37 座殿宇） ====================
  const sotnWingsPart2: BuiltRoom[] = [
    {
      id: 'clock_sky_aqueduct',
      name: '浑天引水飞虹栈',
      subtitle: '四格高空引水铜栈 · 横贯天机秘阁与云梯古武阁',
      region: 'clock_tower',
      bgKey: 'bg_tower_interior',
      realm: 'normal',
      indoor: true,
      mapX: 24,
      mapY: 2,
      gridW: 4,
      gridH: 1,
      pixelW: 3000,
      pixelH: 480,
      special: 'none',
      focalX: 1500,
      focalY: 404,
      leftRoomId: 'secret_archive',
      leftDoorFloorY: 404,
      rightRoomId: 'relic_wall_vault',
      rightDoorFloorY: 404,
      groundNodes: [
        { x: 0, y: 404, style: 'marble' },
        { x: 780, y: 404, style: 'stairs' },
        { x: 880, y: 438, style: 'crypt_stone' },
        { x: 2040, y: 438, style: 'stairs' },
        { x: 2140, y: 404, style: 'marble' },
        { x: 3000, y: 404, style: 'marble' },
      ],
      solidBlocks: [
        { x: 1020, y: 344, w: 220, h: 32 },
        { x: 1680, y: 344, w: 220, h: 32 },
      ],
      clockGears: [{ x: 1460, y: 248, radius: 74, speed: 0.58, hasOrbitPlatforms: true }],
      hazards: [{ kind: 'pendulum', x: 2360, y: 42, span: 185, speed: 1.8 }],
      ceilingSpans: [{ x1: 0, x2: 3000, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      ironGate: {
        id: 'gate_clock_aqueduct_lever',
        x: 2660,
        topY: 0,
        bottomY: 404,
        gateKind: 'lever_shortcut',
        leverSide: 'right',
      },
      waterZones: [{ x1: 860, x2: 2060, surfaceY: 416 }],
      decorProps: [
        { kind: 'dragon_brazier', x: 420, y: 404, scale: 0.92 },
        { kind: 'giant_bell', x: 2240, y: 210, scale: 0.92 },
      ],
      pavilions: [],
      archways: [],
      torches: [
        { x: 580, y: 328 },
        { x: 2480, y: 328 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bone_archer', x: 1130, y: 344 },
        { kind: 'bell_gargoyle', x: 1520, y: 190 },
        { kind: 'bronze_guard', x: 2260, y: 404 },
      ],
      pickups: [],
    },
    {
      id: 'altar_east_terrace',
      name: '封禅东极丹陛',
      subtitle: '四格汉白玉观海长阶 · 东连凌霄东极天梯',
      region: 'altar',
      bgKey: 'bg_sky_altar',
      realm: 'normal',
      indoor: false,
      mapX: 26,
      mapY: 1,
      gridW: 4,
      gridH: 1,
      pixelW: 3000,
      pixelH: 480,
      special: 'none',
      focalX: 1500,
      focalY: 408,
      leftRoomId: 'altar_vestibule',
      leftDoorFloorY: 408,
      rightRoomId: 'outer_wall_upper',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 860, y: 408, style: 'stairs' },
        { x: 960, y: 372, style: 'marble' },
        { x: 2040, y: 372, style: 'stairs' },
        { x: 2140, y: 408, style: 'marble' },
        { x: 3000, y: 408, style: 'marble' },
      ],
      solidBlocks: [{ x: 1380, y: 276, w: 240, h: 32 }],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'coiled_pillar', x: 460, y: 408, scale: 0.96 },
        { kind: 'dragon_brazier', x: 1080, y: 372, scale: 0.95 },
        { kind: 'dragon_brazier', x: 1920, y: 372, scale: 0.95 },
        { kind: 'coiled_pillar', x: 2540, y: 408, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 640, y: 332 },
        { x: 2360, y: 332 },
      ],
      foregrounds: [],
      lanterns: [{ x: 1500, y: 180 }],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 1180, y: 372 },
        { kind: 'bell_gargoyle', x: 1500, y: 195 },
        { kind: 'opera_puppet', x: 1840, y: 372 },
      ],
      pickups: [],
    },
    {
      id: 'outer_wall_armory',
      name: '天机神弩秘库',
      subtitle: '连接云梯古武秘阁与东极外壁天梯',
      region: 'clock_tower',
      bgKey: 'bg_tower_interior',
      realm: 'normal',
      indoor: true,
      mapX: 29,
      mapY: 2,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'none',
      focalX: 400,
      focalY: 404,
      leftRoomId: 'relic_wall_vault',
      leftDoorFloorY: 404,
      rightRoomId: 'outer_wall_upper',
      rightDoorFloorY: 404,
      groundNodes: [
        { x: 0, y: 404, style: 'marble' },
        { x: 800, y: 404, style: 'marble' },
      ],
      solidBlocks: [{ x: 290, y: 296, w: 220, h: 32 }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'weapon_rack', x: 210, y: 404, scale: 0.94 },
        { kind: 'weapon_rack', x: 590, y: 404, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [{ x: 400, y: 328 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [{ kind: 'bone_archer', x: 400, y: 296 }],
      pickups: [{ id: 'pk_outer_armory_wine', kind: 'consumable', itemId: 'tiger_bone_wine', x: 400, y: 296 }],
    },
    {
      id: 'outer_wall_upper',
      name: '凌霄东极天梯',
      subtitle: '东垣上三层千仞塔 · 上通祭天坛顶 · 东辟太虚钟楼',
      region: 'clock_tower',
      bgKey: 'bg_tower_interior',
      realm: 'normal',
      indoor: true,
      mapX: 30,
      mapY: 0,
      gridW: 1,
      gridH: 3,
      pixelW: 800,
      pixelH: 1320,
      special: 'none',
      focalX: 400,
      focalY: 1236,
      sideDoors: [
        { side: 'left', floorY: 356, targetRoomId: 'sky_altar', rowOffset: 0 },
        { side: 'left', floorY: 796, targetRoomId: 'altar_east_terrace', rowOffset: 1 },
        { side: 'right', floorY: 796, targetRoomId: 'celestial_bell_sanctum', rowOffset: 1 },
        { side: 'left', floorY: 1236, targetRoomId: 'outer_wall_armory', rowOffset: 2 },
      ],
      groundNodes: [
        { x: 0, y: 1236, style: 'marble' },
        { x: 800, y: 1236, style: 'marble' },
      ],
      solidBlocks: [
        { x: 0, y: 356, w: 280, h: 110, blocking: true },
        { x: 340, y: 468, w: 220, h: 32 },
        { x: 260, y: 578, w: 220, h: 32 },
        { x: 360, y: 688, w: 220, h: 32 },
        { x: 0, y: 796, w: 260, h: 36 },
        { x: 540, y: 796, w: 260, h: 36 },
      ],
      climbWalls: [
        { x: 305, topY: 796, bottomY: 1130 },
        { x: 495, topY: 796, bottomY: 1130 },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [{ x1: 310, x2: 490, dir: 'down', targetRoomId: 'outer_wall_lower' }],
      ironGate: {
        id: 'gate_altar_outer_lever',
        x: 195,
        topY: 0,
        bottomY: 356,
        gateKind: 'lever_shortcut',
        leverSide: 'left',
      },
      decorProps: [
        { kind: 'giant_bell', x: 600, y: 220, scale: 0.94 },
        { kind: 'dragon_brazier', x: 640, y: 1236, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [{ x: 304, y: 1236, w: 192, hasPillars: false }],
      archways: [],
      torches: [
        { x: 560, y: 286 },
        { x: 620, y: 726 },
        { x: 620, y: 1166 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 460, y: 320 },
        { kind: 'bronze_guard', x: 400, y: 908 },
      ],
      pickups: [],
    },
    {
      id: 'celestial_bell_sanctum',
      name: '东极太虚钟楼',
      subtitle: '三格云端钟阁 · 九天罡风与金钟法音',
      region: 'altar',
      bgKey: 'bg_sky_altar',
      realm: 'normal',
      indoor: false,
      mapX: 31,
      mapY: 1,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 500,
      special: 'none',
      focalX: 1100,
      focalY: 408,
      leftRoomId: 'outer_wall_upper',
      leftDoorFloorY: 408,
      rightRoomId: 'celestial_star_vault',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 640, y: 408, style: 'stairs' },
        { x: 740, y: 372, style: 'marble' },
        { x: 1460, y: 372, style: 'stairs' },
        { x: 1560, y: 408, style: 'marble' },
        { x: 2200, y: 408, style: 'marble' },
      ],
      solidBlocks: [
        { x: 960, y: 276, w: 280, h: 32 },
      ],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'giant_bell', x: 520, y: 205, scale: 0.96 },
        { kind: 'dragon_brazier', x: 840, y: 372, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1360, y: 372, scale: 0.94 },
        { kind: 'giant_bell', x: 1680, y: 205, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 380, y: 332 },
        { x: 1820, y: 332 },
      ],
      foregrounds: [],
      lanterns: [{ x: 1100, y: 175 }],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 760, y: 205 },
        { kind: 'bronze_guard', x: 1100, y: 372 },
        { kind: 'bell_gargoyle', x: 1480, y: 205 },
      ],
      pickups: [],
    },
    {
      id: 'celestial_star_vault',
      name: '太虚星宿秘阁',
      subtitle: '东极云顶尽头 · 青丘破障得【镇海定风司南佩】',
      region: 'altar',
      bgKey: 'bg_sky_altar',
      realm: 'normal',
      indoor: false,
      mapX: 34,
      mapY: 1,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'relic_pedestal',
      focalX: 1120,
      focalY: 368,
      leftRoomId: 'celestial_bell_sanctum',
      leftDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 780, y: 408, style: 'stairs' },
        { x: 880, y: 368, style: 'marble' },
        { x: 1360, y: 368, style: 'stairs' },
        { x: 1440, y: 408, style: 'marble' },
        { x: 1600, y: 408, style: 'marble' },
      ],
      solidBlocks: [],
      ceilingSpans: [],
      shafts: [],
      ironGate: {
        id: 'gate_star_vault_fox',
        x: 520,
        topY: 44,
        bottomY: 408,
        gateKind: 'illusion_fox',
      },
      decorProps: [
        { kind: 'coiled_pillar', x: 260, y: 408, scale: 0.96 },
        { kind: 'dragon_brazier', x: 940, y: 368, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1300, y: 368, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [{ x: 680, y: 332 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [{ kind: 'opera_puppet', x: 720, y: 408 }],
      pickups: [
        {
          id: 'pk_star_vault_compass',
          kind: 'armor',
          itemId: 'outer_sea_compass',
          x: 1120,
          y: 368,
        },
      ],
    },
    {
      id: 'outer_wall_lower',
      name: '东垣外壁千仞梯',
      subtitle: '致敬月下恶魔城外壁 · 升降铁笼纵贯钟塔与归墟船坞',
      region: 'clock_tower',
      bgKey: 'bg_tower_interior',
      realm: 'normal',
      indoor: true,
      mapX: 30,
      mapY: 3,
      gridW: 1,
      gridH: 3,
      pixelW: 800,
      pixelH: 1320,
      special: 'none',
      focalX: 400,
      focalY: 796,
      sideDoors: [
        { side: 'left', floorY: 356, targetRoomId: 'secret_thunder_vault', rowOffset: 0 },
        { side: 'left', floorY: 796, targetRoomId: 'clock_east_bastion', rowOffset: 1 },
        { side: 'right', floorY: 796, targetRoomId: 'outer_wall_telescope', rowOffset: 1 },
        { side: 'left', floorY: 1236, targetRoomId: 'dock_shipyard_hall', rowOffset: 2 },
        { side: 'right', floorY: 1236, targetRoomId: 'dock_east_beacon', rowOffset: 2 },
      ],
      groundNodes: [
        { x: 0, y: 1236, style: 'marble' },
        { x: 800, y: 1236, style: 'marble' },
      ],
      solidBlocks: [
        { x: 0, y: 356, w: 260, h: 36 },
        { x: 0, y: 796, w: 260, h: 36 },
        { x: 540, y: 796, w: 260, h: 36 },
        { x: 180, y: 940, w: 210, h: 32 },
        { x: 420, y: 1088, w: 210, h: 32 },
      ],
      climbWalls: [
        { x: 305, topY: 36, bottomY: 270 },
        { x: 495, topY: 36, bottomY: 270 },
      ],
      movingPlatforms: [
        { x1: 310, y1: 750, x2: 310, y2: 408, w: 180, speed: 1.0, style: 'bronze_lift' },
      ],
      ceilingSpans: [
        { x1: 0, x2: 310, bottomY: 36, style: 'palace_timber' },
        { x1: 490, x2: 800, bottomY: 36, style: 'palace_timber' },
      ],
      shafts: [{ x1: 310, x2: 490, dir: 'up', targetRoomId: 'outer_wall_upper' }],
      decorProps: [
        { kind: 'weapon_rack', x: 640, y: 356, scale: 0.92 },
        { kind: 'dragon_brazier', x: 160, y: 1236, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 160, y: 286 },
        { x: 620, y: 726 },
        { x: 620, y: 1166 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 150, y: 796 },
        { kind: 'bone_archer', x: 520, y: 1088 },
      ],
      pickups: [],
    },
    {
      id: 'outer_wall_telescope',
      name: '浑天望海悬台',
      subtitle: '致敬月下外壁望远镜露台 · 血月观澜飞廊',
      region: 'clock_tower',
      bgKey: 'bg_chapel_spire',
      realm: 'normal',
      indoor: false,
      mapX: 31,
      mapY: 4,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 800,
      focalY: 408,
      leftRoomId: 'outer_wall_lower',
      leftDoorFloorY: 408,
      rightRoomId: 'outer_wall_save',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 560, y: 408, style: 'stairs' },
        { x: 640, y: 372, style: 'marble' },
        { x: 960, y: 372, style: 'stairs' },
        { x: 1040, y: 408, style: 'marble' },
        { x: 1600, y: 408, style: 'marble' },
      ],
      solidBlocks: [],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'coiled_pillar', x: 260, y: 408, scale: 0.95 },
        { kind: 'dragon_brazier', x: 800, y: 372, scale: 0.94 },
        { kind: 'guardian_statue', x: 1340, y: 408, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 420, y: 332 },
        { x: 1180, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'spirit_crow', x: 640, y: 195 },
        { kind: 'bronze_guard', x: 1140, y: 408 },
      ],
      pickups: [],
    },
    {
      id: 'outer_wall_save',
      name: '望海神机火铳台',
      subtitle: '东垣海防双层谯楼 · 神机营火铳兵据守高台',
      region: 'clock_tower',
      bgKey: 'bg_chapel_spire',
      realm: 'normal',
      indoor: false,
      mapX: 33,
      mapY: 4,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'none',
      focalX: 400,
      focalY: 426,
      leftRoomId: 'outer_wall_telescope',
      leftDoorFloorY: 396,
      rightRoomId: 'outer_wall_battlement',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'marble' },
        { x: 175, y: 396, style: 'stairs' },
        { x: 245, y: 426, style: 'flagstone' },
        { x: 555, y: 426, style: 'stairs' },
        { x: 625, y: 396, style: 'marble' },
        { x: 800, y: 396, style: 'marble' },
      ],
      solidBlocks: [],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'weapon_rack', x: 110, y: 396, scale: 0.92 },
        { kind: 'dragon_brazier', x: 690, y: 396, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [{ x: 255, y: 278, w: 290, hasPillars: true }],
      archways: [],
      torches: [
        { x: 175, y: 320 },
        { x: 625, y: 320 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'shenji_musketeer', x: 400, y: 278 },
        { kind: 'bell_gargoyle', x: 530, y: 180 },
      ],
      pickups: [{ id: 'pk_outer_gun_chicken', kind: 'consumable', itemId: 'beggar_chicken', x: 400, y: 426 }],
    },
    {
      id: 'outer_wall_battlement',
      name: '镇海烽火瓮城',
      subtitle: '双格双层东极海防重镇 · 破敌得【千年朱果】',
      region: 'clock_tower',
      bgKey: 'bg_chapel_spire',
      realm: 'normal',
      indoor: false,
      mapX: 34,
      mapY: 3,
      gridW: 2,
      gridH: 2,
      pixelW: 1600,
      pixelH: 880,
      special: 'relic_pedestal',
      focalX: 1120,
      focalY: 368,
      sideDoors: [
        { side: 'left', floorY: 804, targetRoomId: 'outer_wall_save', rowOffset: 1 },
      ],
      groundNodes: [
        { x: 0, y: 804, style: 'marble' },
        { x: 580, y: 804, style: 'stairs' },
        { x: 680, y: 768, style: 'marble' },
        { x: 1180, y: 768, style: 'stairs' },
        { x: 1280, y: 804, style: 'marble' },
        { x: 1600, y: 804, style: 'marble' },
      ],
      solidBlocks: [
        { x: 420, y: 668, w: 230, h: 32 },
        { x: 740, y: 568, w: 230, h: 32 },
        { x: 480, y: 468, w: 230, h: 32 },
        { x: 880, y: 368, w: 460, h: 36 },
      ],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'weapon_rack', x: 260, y: 804, scale: 0.94 },
        { kind: 'dragon_brazier', x: 940, y: 768, scale: 0.95 },
        { kind: 'dragon_brazier', x: 1260, y: 368, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 360, y: 732 },
        { x: 1380, y: 732 },
      ],
      foregrounds: [],
      lanterns: [{ x: 780, y: 310 }],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 780, y: 768 },
        { kind: 'demon_wolf', x: 1120, y: 768 },
        { kind: 'bone_archer', x: 850, y: 568 },
        { kind: 'bell_gargoyle', x: 980, y: 240 },
      ],
      pickups: [{ id: 'pk_battlement_hp', kind: 'max_up', itemId: 'hp_vessel', x: 1120, y: 368 }],
    },
    {
      id: 'dock_sluice_passage',
      name: '东水关铁索渠',
      subtitle: '三格暗河引水廊 · 西接望月竖塔底层 · 东入皇家废船坞',
      region: 'shipyard',
      bgKey: 'bg_sunken_shipyard',
      realm: 'normal',
      indoor: true,
      mapX: 23,
      mapY: 5,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 500,
      special: 'none',
      focalX: 1100,
      focalY: 416,
      leftRoomId: 'east_outer_tower',
      leftDoorFloorY: 416,
      rightRoomId: 'dock_shipyard_hall',
      rightDoorFloorY: 416,
      groundNodes: [
        { x: 0, y: 416, style: 'crypt_stone' },
        { x: 520, y: 416, style: 'stairs' },
        { x: 600, y: 452, style: 'crypt_stone' },
        { x: 1580, y: 452, style: 'stairs' },
        { x: 1660, y: 416, style: 'crypt_stone' },
        { x: 2200, y: 416, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 740, y: 360, w: 220, h: 32 },
        { x: 1180, y: 348, w: 220, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 2200, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      ironGate: {
        id: 'gate_dock_sluice_tortoise',
        x: 380,
        topY: 0,
        bottomY: 416,
        gateKind: 'sluice_tortoise',
      },
      waterZones: [{ x1: 580, x2: 1600, surfaceY: 420 }],
      decorProps: [
        { kind: 'dragon_brazier', x: 280, y: 416, scale: 0.9 },
        { kind: 'guardian_statue', x: 1920, y: 416, scale: 0.92 },
      ],
      pavilions: [],
      archways: [],
      torches: [
        { x: 380, y: 336 },
        { x: 1800, y: 336 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'plague_toad', x: 850, y: 360 },
        { kind: 'bone_archer', x: 1290, y: 348 },
        { kind: 'demon_wolf', x: 1780, y: 416 },
      ],
      pickups: [],
    },
    {
      id: 'dock_shipyard_hall',
      name: '皇家艨艟废船坞',
      subtitle: '归墟镇海蛟王·敖溟镇守 · 藏【鲛绡避水云霓裳】与《镇海楼船手札》',
      region: 'shipyard',
      bgKey: 'bg_sunken_shipyard',
      realm: 'normal',
      indoor: true,
      mapX: 26,
      mapY: 5,
      gridW: 4,
      gridH: 2,
      pixelW: 3200,
      pixelH: 880,
      special: 'boss_room',
      bossKind: 'boss_shipyard_leviathan',
      storyTriggerId: 'boss_leviathan_pre',
      focalX: 1620,
      focalY: 486,
      sideDoors: [
        { side: 'left', floorY: 356, targetRoomId: 'dock_sluice_passage', rowOffset: 0 },
        { side: 'right', floorY: 356, targetRoomId: 'outer_wall_lower', rowOffset: 0 },
        { side: 'left', floorY: 804, targetRoomId: 'dock_flooded_hold', rowOffset: 1 },
      ],
      groundNodes: [
        { x: 0, y: 804, style: 'crypt_stone' },
        { x: 640, y: 804, style: 'stairs' },
        { x: 740, y: 838, style: 'crypt_stone' },
        { x: 2460, y: 838, style: 'stairs' },
        { x: 2560, y: 804, style: 'crypt_stone' },
        { x: 3200, y: 804, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 0, y: 356, w: 380, h: 36 },
        { x: 2820, y: 356, w: 380, h: 36 },
        { x: 520, y: 696, w: 240, h: 32 },
        { x: 880, y: 592, w: 280, h: 34 },
        { x: 1380, y: 486, w: 480, h: 36 },
        { x: 2040, y: 592, w: 280, h: 34 },
        { x: 2420, y: 696, w: 240, h: 32 },
        { x: 2540, y: 468, w: 240, h: 32 },
        { x: 460, y: 468, w: 240, h: 32 },
      ],
      movingPlatforms: [
        { x1: 980, y1: 786, x2: 2120, y2: 786, w: 190, speed: 0.85, style: 'wood_ferry' },
      ],
      ceilingSpans: [{ x1: 0, x2: 3200, bottomY: 34, style: 'crypt_vault' }],
      shafts: [{ x1: 280, x2: 460, dir: 'down', targetRoomId: 'dock_underwater_tunnel' }],
      ironGate: {
        id: 'gate_shipyard_east_lever',
        x: 2800,
        topY: 0,
        bottomY: 804,
        gateKind: 'lever_shortcut',
        leverSide: 'left',
      },
      waterZones: [{ x1: 720, x2: 2480, surfaceY: 810 }],
      decorProps: [
        { kind: 'dragon_brazier', x: 560, y: 804, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1460, y: 486, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1780, y: 486, scale: 0.94 },
        { kind: 'guardian_statue', x: 2740, y: 804, scale: 0.94 },
      ],
      pavilions: [{ x: 274, y: 804, w: 192, hasPillars: false }],
      archways: [],
      torches: [
        { x: 220, y: 286 },
        { x: 2980, y: 286 },
        { x: 2660, y: 728 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 1180, y: 340 },
        { x: 2020, y: 340 },
      ],
      npcs: [],
      steles: [{ id: 'stele_shipyard_fleet', x: 2920 }],
      spawns: [],
      pickups: [
        {
          id: 'pk_shipyard_pearl_robe',
          kind: 'armor',
          itemId: 'sunken_pearl_robe',
          x: 1620,
          y: 486,
        },
        {
          id: 'pk_suodi_dock',
          kind: 'consumable',
          itemId: 'suodi_talisman',
          x: 1580,
          y: 486,
        },
      ],
    },
    {
      id: 'dock_east_beacon',
      name: '镇海暗礁水寨',
      subtitle: '东水关外哨 · 玄武镇压水枢得【天山雪莲】',
      region: 'shipyard',
      bgKey: 'bg_sunken_shipyard',
      realm: 'normal',
      indoor: true,
      mapX: 31,
      mapY: 5,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'relic_pedestal',
      focalX: 1180,
      focalY: 372,
      leftRoomId: 'outer_wall_lower',
      leftDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 840, y: 408, style: 'stairs' },
        { x: 920, y: 372, style: 'marble' },
        { x: 1380, y: 372, style: 'stairs' },
        { x: 1460, y: 408, style: 'crypt_stone' },
        { x: 1600, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      ironGate: {
        id: 'gate_dock_beacon_tortoise',
        x: 560,
        topY: 0,
        bottomY: 408,
        gateKind: 'sluice_tortoise',
      },
      decorProps: [
        { kind: 'guardian_statue', x: 240, y: 408, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1020, y: 372, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1320, y: 372, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [{ x: 740, y: 332 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [{ kind: 'bronze_guard', x: 760, y: 408 }],
      pickups: [{ id: 'pk_dock_beacon_mp', kind: 'max_up', itemId: 'mp_vessel', x: 1180, y: 372 }],
    },
    {
      id: 'dock_flooded_hold',
      name: '沉舰浸水底舱',
      subtitle: '三格沉船暗舱 · 西接寒髓冰泉秘洞 · 东通皇家废船坞',
      region: 'shipyard',
      bgKey: 'bg_sunken_shipyard',
      realm: 'normal',
      indoor: true,
      mapX: 23,
      mapY: 6,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 500,
      special: 'none',
      focalX: 1100,
      focalY: 416,
      leftRoomId: 'secret_ice_spring',
      leftDoorFloorY: 416,
      rightRoomId: 'dock_shipyard_hall',
      rightDoorFloorY: 416,
      groundNodes: [
        { x: 0, y: 416, style: 'crypt_stone' },
        { x: 460, y: 416, style: 'stairs' },
        { x: 540, y: 452, style: 'crypt_stone' },
        { x: 1620, y: 452, style: 'stairs' },
        { x: 1700, y: 416, style: 'crypt_stone' },
        { x: 2200, y: 416, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 720, y: 356, w: 230, h: 32 },
        { x: 1220, y: 356, w: 230, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 2200, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      waterZones: [{ x1: 520, x2: 1640, surfaceY: 420 }],
      decorProps: [
        { kind: 'dragon_brazier', x: 280, y: 416, scale: 0.9 },
        { kind: 'dragon_brazier', x: 1920, y: 416, scale: 0.9 },
      ],
      pavilions: [],
      archways: [],
      torches: [
        { x: 380, y: 336 },
        { x: 1820, y: 336 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'plague_toad', x: 830, y: 356 },
        { kind: 'guixu_water_fiend', x: 1120, y: 215 },
        { kind: 'armored_tortoise', x: 1330, y: 356 },
      ],
      pickups: [],
    },
    {
      id: 'dock_underwater_tunnel',
      name: '潜渊寒蛟水道',
      subtitle: '四格深潜水道 · 西贯寒渊升龙井 · 上通皇家废船坞',
      region: 'shipyard',
      bgKey: 'bg_sunken_shipyard',
      realm: 'normal',
      indoor: true,
      mapX: 23,
      mapY: 7,
      gridW: 4,
      gridH: 1,
      pixelW: 3000,
      pixelH: 500,
      special: 'none',
      focalX: 1500,
      focalY: 416,
      leftRoomId: 'abyss_ascension_shaft',
      leftDoorFloorY: 416,
      rightRoomId: 'dock_save',
      rightDoorFloorY: 416,
      groundNodes: [
        { x: 0, y: 416, style: 'crypt_stone' },
        { x: 620, y: 416, style: 'stairs' },
        { x: 720, y: 454, style: 'crypt_stone' },
        { x: 1980, y: 454, style: 'stairs' },
        { x: 2080, y: 416, style: 'crypt_stone' },
        { x: 3000, y: 416, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 880, y: 358, w: 220, h: 32 },
        { x: 1420, y: 344, w: 220, h: 32 },
        { x: 2460, y: 328, w: 165, h: 30 },
        { x: 2540, y: 242, w: 165, h: 30 },
        { x: 2470, y: 158, w: 160, h: 28 },
        { x: 2505, y: 82, w: 150, h: 26 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 2480, bottomY: 34, style: 'crypt_vault' },
        { x1: 2660, x2: 3000, bottomY: 34, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 2480, x2: 2660, dir: 'up', targetRoomId: 'dock_shipyard_hall' }],
      waterZones: [{ x1: 700, x2: 2000, surfaceY: 420 }],
      decorProps: [
        { kind: 'guardian_statue', x: 320, y: 416, scale: 0.92 },
        { kind: 'dragon_brazier', x: 2240, y: 416, scale: 0.92 },
      ],
      pavilions: [],
      archways: [],
      torches: [
        { x: 480, y: 336 },
        { x: 2320, y: 336 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'plague_toad', x: 990, y: 358 },
        { kind: 'guixu_water_fiend', x: 1320, y: 205 },
        { kind: 'armored_tortoise', x: 2180, y: 416 },
      ],
      pickups: [],
    },
    {
      id: 'dock_save',
      name: '船坞镇海古祠',
      subtitle: '归墟船坞深层留档祠',
      region: 'shipyard',
      bgKey: 'bg_sunken_shipyard',
      realm: 'normal',
      indoor: true,
      mapX: 27,
      mapY: 7,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'save_shrine',
      focalX: 400,
      focalY: 368,
      leftRoomId: 'dock_underwater_tunnel',
      leftDoorFloorY: 396,
      rightRoomId: 'dock_coral_grotto',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'crypt_stone' },
        { x: 190, y: 396, style: 'stairs' },
        { x: 260, y: 368, style: 'marble' },
        { x: 540, y: 368, style: 'stairs' },
        { x: 610, y: 396, style: 'crypt_stone' },
        { x: 800, y: 396, style: 'crypt_stone' },
      ],
      solidBlocks: [],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'incense_burner', x: 270, y: 368, scale: 0.9 },
        { kind: 'incense_burner', x: 530, y: 368, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 155, y: 320 },
        { x: 645, y: 320 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
    },
    {
      id: 'dock_coral_grotto',
      name: '玄冥寒渊石窟',
      subtitle: '三格钟乳海窟 · 暗井下通归墟沉宝秘库',
      region: 'shipyard',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      indoor: true,
      mapX: 28,
      mapY: 7,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 500,
      special: 'none',
      focalX: 1100,
      focalY: 412,
      leftRoomId: 'dock_save',
      leftDoorFloorY: 412,
      groundNodes: [
        { x: 0, y: 412, style: 'crypt_stone' },
        { x: 760, y: 412, style: 'stairs' },
        { x: 860, y: 448, style: 'crypt_stone' },
        { x: 1680, y: 448, style: 'stairs' },
        { x: 1780, y: 412, style: 'crypt_stone' },
        { x: 2200, y: 412, style: 'crypt_stone' },
      ],
      solidBlocks: [{ x: 1220, y: 348, w: 240, h: 32 }],
      ceilingSpans: [{ x1: 0, x2: 2200, bottomY: 34, style: 'crypt_vault' }],
      shafts: [{ x1: 1080, x2: 1260, dir: 'down', targetRoomId: 'dock_treasure_vault' }],
      waterZones: [{ x1: 840, x2: 1700, surfaceY: 418 }],
      decorProps: [
        { kind: 'dragon_brazier', x: 380, y: 412, scale: 0.92 },
        { kind: 'guardian_statue', x: 1960, y: 412, scale: 0.92 },
      ],
      pavilions: [{ x: 1074, y: 448, w: 192, hasPillars: false }],
      archways: [],
      torches: [{ x: 520, y: 336 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'armored_tortoise', x: 560, y: 412 },
        { kind: 'guixu_water_fiend', x: 1340, y: 205 },
        { kind: 'armored_tortoise', x: 1840, y: 412 },
      ],
      pickups: [],
    },
    {
      id: 'dock_abyss_trench',
      name: '东渊归墟海沟',
      subtitle: '五格深海地沟 · 西连寒渊玄冰暗河 · 东达归墟乾坤阵',
      region: 'shipyard',
      bgKey: 'bg_sunken_shipyard',
      realm: 'normal',
      indoor: true,
      mapX: 23,
      mapY: 8,
      gridW: 5,
      gridH: 1,
      pixelW: 3800,
      pixelH: 520,
      special: 'none',
      focalX: 1900,
      focalY: 420,
      leftRoomId: 'abyss_east_corridor',
      leftDoorFloorY: 420,
      rightRoomId: 'dock_warp',
      rightDoorFloorY: 420,
      groundNodes: [
        { x: 0, y: 420, style: 'crypt_stone' },
        { x: 640, y: 420, style: 'stairs' },
        { x: 740, y: 458, style: 'crypt_stone' },
        { x: 2960, y: 458, style: 'stairs' },
        { x: 3060, y: 420, style: 'crypt_stone' },
        { x: 3800, y: 420, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 960, y: 364, w: 230, h: 32 },
        { x: 1780, y: 352, w: 240, h: 32 },
        { x: 2560, y: 364, w: 230, h: 32 },
      ],
      movingPlatforms: [
        { x1: 1240, y1: 402, x2: 1680, y2: 402, w: 180, speed: 0.9, style: 'wood_ferry' },
        { x1: 2080, y1: 402, x2: 2480, y2: 402, w: 180, speed: 0.9, phase: 1.4, style: 'wood_ferry' },
      ],
      ceilingSpans: [{ x1: 0, x2: 3800, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      waterZones: [{ x1: 720, x2: 2980, surfaceY: 424 }],
      decorProps: [
        { kind: 'coiled_pillar', x: 420, y: 420, scale: 0.96 },
        { kind: 'dragon_brazier', x: 1900, y: 352, scale: 0.92 },
        { kind: 'coiled_pillar', x: 3380, y: 420, scale: 0.96 },
      ],
      pavilions: [],
      archways: [],
      torches: [
        { x: 540, y: 340 },
        { x: 3220, y: 340 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'plague_toad', x: 1070, y: 364 },
        { kind: 'guixu_water_fiend', x: 1540, y: 205 },
        { kind: 'guixu_water_fiend', x: 2280, y: 205 },
        { kind: 'armored_tortoise', x: 3180, y: 420 },
      ],
      pickups: [],
    },
    {
      id: 'dock_warp',
      name: '归墟海眼乾坤阵',
      subtitle: '东渊船坞八卦传送阵',
      region: 'shipyard',
      bgKey: 'bg_sunken_shipyard',
      realm: 'normal',
      indoor: true,
      mapX: 28,
      mapY: 8,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'warp_bagua',
      warpName: '东渊归墟船坞',
      focalX: 400,
      focalY: 408,
      leftRoomId: 'dock_abyss_trench',
      leftDoorFloorY: 408,
      rightRoomId: 'dock_treasure_vault',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 210, y: 408, scale: 0.9 },
        { kind: 'dragon_brazier', x: 590, y: 408, scale: 0.9 },
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
      id: 'dock_treasure_vault',
      name: '归墟沉宝秘库',
      subtitle: '双格海底宝船密库 · 藏九转金丹与千年朱果',
      region: 'shipyard',
      bgKey: 'bg_sunken_shipyard',
      realm: 'normal',
      indoor: true,
      mapX: 29,
      mapY: 8,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'relic_pedestal',
      focalX: 1120,
      focalY: 368,
      leftRoomId: 'dock_warp',
      leftDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 840, y: 408, style: 'stairs' },
        { x: 920, y: 368, style: 'marble' },
        { x: 1340, y: 368, style: 'stairs' },
        { x: 1420, y: 408, style: 'crypt_stone' },
        { x: 1600, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 260, y: 324, w: 165, h: 30 },
        { x: 340, y: 238, w: 165, h: 30 },
        { x: 270, y: 154, w: 160, h: 28 },
        { x: 295, y: 80, w: 150, h: 26 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 280, bottomY: 34, style: 'crypt_vault' },
        { x1: 460, x2: 1600, bottomY: 34, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 280, x2: 460, dir: 'up', targetRoomId: 'dock_coral_grotto' }],
      decorProps: [
        { kind: 'guardian_statue', x: 680, y: 408, scale: 0.94 },
        { kind: 'dragon_brazier', x: 980, y: 368, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1280, y: 368, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [{ x: 760, y: 332 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [{ kind: 'bronze_guard', x: 740, y: 408 }],
      pickups: [
        { id: 'pk_dock_vault_hp', kind: 'max_up', itemId: 'hp_vessel', x: 1080, y: 368 },
        { id: 'pk_dock_vault_jz', kind: 'consumable', itemId: 'jiuzhuan_jin_dan', x: 1180, y: 368 },
      ],
    },
    {
      id: 'forge_prison_conduit',
      name: '水火既济暗枢',
      subtitle: '城心横向暗渠 · 打通赤火镇魂祠与寒潭暗瀑前室',
      region: 'forge',
      bgKey: 'bg_moat_sluice',
      realm: 'normal',
      indoor: true,
      mapX: 10,
      mapY: 6,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 800,
      focalY: 408,
      leftRoomId: 'forge_save',
      leftDoorFloorY: 408,
      rightRoomId: 'prison_sluice_entry',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 520, y: 408, style: 'stairs' },
        { x: 600, y: 444, style: 'crypt_stone' },
        { x: 1040, y: 444, style: 'stairs' },
        { x: 1120, y: 408, style: 'crypt_stone' },
        { x: 1600, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [{ x: 720, y: 352, w: 200, h: 32 }],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      ironGate: {
        id: 'gate_forge_prison_lever',
        x: 340,
        topY: 0,
        bottomY: 408,
        gateKind: 'lever_shortcut',
        leverSide: 'right',
      },
      waterZones: [{ x1: 580, x2: 1060, surfaceY: 416 }],
      decorProps: [
        { kind: 'dragon_brazier', x: 180, y: 408, scale: 0.9 },
        { kind: 'guardian_statue', x: 1380, y: 408, scale: 0.92 },
      ],
      pavilions: [],
      archways: [],
      torches: [{ x: 1240, y: 332 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'plague_toad', x: 820, y: 352 },
        { kind: 'demon_wolf', x: 1260, y: 408 },
      ],
      pickups: [],
    },
    {
      id: 'catacomb_prison_vault',
      name: '寒狱守陵秘道',
      subtitle: '化雾铁栅暗廊 · 横向贯通守陵帝陵殿与寒渊升龙井',
      region: 'catacomb',
      bgKey: 'bg_catacomb_tomb',
      realm: 'normal',
      indoor: true,
      mapX: 20,
      mapY: 7,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 800,
      focalY: 408,
      leftRoomId: 'catacomb_shrine',
      leftDoorFloorY: 408,
      rightRoomId: 'abyss_ascension_shaft',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 1600, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [{ x: 680, y: 308, w: 240, h: 32 }],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      ironGate: {
        id: 'gate_catacomb_prison_mist',
        x: 1180,
        topY: 0,
        bottomY: 408,
        gateKind: 'mist_only',
      },
      decorProps: [
        { kind: 'guardian_statue', x: 260, y: 408, scale: 0.92 },
        { kind: 'dragon_brazier', x: 980, y: 408, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [{ x: 520, y: 332 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'scroll_demon', x: 560, y: 205 },
        { kind: 'bronze_guard', x: 880, y: 408 },
      ],
      pickups: [{ id: 'pk_cat_pris_wine', kind: 'consumable', itemId: 'osmanthus_wine', x: 800, y: 308 }],
    },

    // --- 第九幕 · 九幽忘川冥府与太古祖龙极渊 (Rows 9..11, 14 座极渊巨殿！) ---
    {
      id: 'nether_west_descent',
      name: '黄泉西落冥井',
      subtitle: '双格双层深渊冥井 · 上承熔岩断桥 · 东入奈何忘川与十殿柱廊',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 8,
      mapY: 9,
      gridW: 2,
      gridH: 2,
      pixelW: 1600,
      pixelH: 880,
      special: 'none',
      focalX: 800,
      focalY: 804,
      sideDoors: [
        { side: 'right', floorY: 356, targetRoomId: 'nether_soul_bridge', rowOffset: 0 },
        { side: 'right', floorY: 804, targetRoomId: 'nether_pillar_hall', rowOffset: 1 },
      ],
      groundNodes: [
        { x: 0, y: 804, style: 'crypt_stone' },
        { x: 1600, y: 804, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 1240, y: 356, w: 360, h: 36 },
        { x: 910, y: 356, w: 220, h: 32 },
        { x: 560, y: 356, w: 230, h: 32 },
        { x: 860, y: 468, w: 240, h: 32 },
        { x: 520, y: 580, w: 240, h: 32 },
        { x: 880, y: 694, w: 240, h: 32 },
        { x: 310, y: 248, w: 180, h: 30 },
        { x: 320, y: 148, w: 165, h: 28 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 280, bottomY: 34, style: 'crypt_vault' },
        { x1: 460, x2: 1600, bottomY: 34, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 280, x2: 460, dir: 'up', targetRoomId: 'mine_lava_bridge' }],
      decorProps: [
        { kind: 'coiled_pillar', x: 260, y: 804, scale: 0.96 },
        { kind: 'dragon_brazier', x: 1360, y: 804, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 1380, y: 286 },
        { x: 1240, y: 728 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 740, y: 320 },
        { kind: 'demon_wolf', x: 640, y: 804 },
        { kind: 'bronze_guard', x: 1180, y: 804 },
      ],
      pickups: [],
    },
    {
      id: 'nether_soul_bridge',
      name: '奈何忘川石桥',
      subtitle: '五格黄泉巨拱桥 · 碧磷忘川水与镇桥群魔',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 10,
      mapY: 9,
      gridW: 5,
      gridH: 1,
      pixelW: 3800,
      pixelH: 520,
      special: 'none',
      focalX: 1900,
      focalY: 416,
      leftRoomId: 'nether_west_descent',
      leftDoorFloorY: 416,
      rightRoomId: 'nether_ferry_save',
      rightDoorFloorY: 416,
      groundNodes: [
        { x: 0, y: 416, style: 'crypt_stone' },
        { x: 680, y: 416, style: 'arch_bridge' },
        { x: 1640, y: 416, style: 'marble' },
        { x: 2160, y: 416, style: 'arch_bridge' },
        { x: 3120, y: 416, style: 'crypt_stone' },
        { x: 3800, y: 416, style: 'crypt_stone' },
      ],
      solidBlocks: [{ x: 1760, y: 304, w: 280, h: 32 }],
      ceilingSpans: [{ x1: 0, x2: 3800, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      waterZones: [
        { x1: 680, x2: 1640, surfaceY: 438 },
        { x1: 2160, x2: 3120, surfaceY: 438 },
      ],
      decorProps: [
        { kind: 'guardian_statue', x: 420, y: 416, scale: 0.95 },
        { kind: 'dragon_brazier', x: 1720, y: 416, scale: 0.94 },
        { kind: 'dragon_brazier', x: 2080, y: 416, scale: 0.94 },
        { kind: 'guardian_statue', x: 3380, y: 416, scale: 0.95 },
      ],
      pavilions: [],
      archways: [],
      torches: [
        { x: 540, y: 336 },
        { x: 1900, y: 336 },
        { x: 3260, y: 336 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 560, y: 416 },
        { kind: 'bell_gargoyle', x: 1180, y: 205 },
        { kind: 'opera_puppet', x: 1900, y: 416 },
        { kind: 'bell_gargoyle', x: 2620, y: 205 },
        { kind: 'demon_wolf', x: 3240, y: 416 },
      ],
      pickups: [],
    },
    {
      id: 'nether_ferry_save',
      name: '忘川奈何古石桥',
      subtitle: '横跨黄泉冥河的拱桥咽喉 · 勾魂无常巡游桥畔',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 15,
      mapY: 9,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'none',
      focalX: 400,
      focalY: 396,
      leftRoomId: 'nether_soul_bridge',
      leftDoorFloorY: 396,
      rightRoomId: 'nether_lantern_avenue',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'crypt_stone' },
        { x: 185, y: 396, style: 'arch_bridge' },
        { x: 615, y: 396, style: 'crypt_stone' },
        { x: 800, y: 396, style: 'crypt_stone' },
      ],
      solidBlocks: [{ x: 305, y: 274, w: 190, h: 30 }],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'coiled_pillar', x: 100, y: 396, scale: 0.94 },
        { kind: 'guardian_statue', x: 700, y: 396, scale: 0.94 },
      ],
      waterZones: [{ x1: 185, x2: 615, surfaceY: 420 }],
      pavilions: [],
      archways: [],
      torches: [
        { x: 165, y: 320 },
        { x: 635, y: 320 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'wuchang_reaper', x: 390, y: 205 },
        { kind: 'armored_tortoise', x: 520, y: 396 },
      ],
      pickups: [{ id: 'pk_nether_bridge_jz', kind: 'consumable', itemId: 'jiuzhuan_jin_dan', x: 400, y: 274 }],
    },
    {
      id: 'nether_lantern_avenue',
      name: '幽冥引魂灯街',
      subtitle: '四格冥府长街 · 上贯九幽镇龙骨渊 · 东入归墟落魂井',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 16,
      mapY: 9,
      gridW: 4,
      gridH: 1,
      pixelW: 3000,
      pixelH: 500,
      special: 'none',
      focalX: 1500,
      focalY: 416,
      leftRoomId: 'nether_ferry_save',
      leftDoorFloorY: 416,
      rightRoomId: 'nether_east_descent',
      rightDoorFloorY: 416,
      groundNodes: [
        { x: 0, y: 416, style: 'crypt_stone' },
        { x: 920, y: 416, style: 'stairs' },
        { x: 1020, y: 384, style: 'marble' },
        { x: 1980, y: 384, style: 'stairs' },
        { x: 2080, y: 416, style: 'crypt_stone' },
        { x: 3000, y: 416, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 1060, y: 304, w: 170, h: 30 },
        { x: 1140, y: 222, w: 170, h: 30 },
        { x: 1070, y: 142, w: 165, h: 28 },
        { x: 1100, y: 78, w: 150, h: 26 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 1080, bottomY: 34, style: 'crypt_vault' },
        { x1: 1260, x2: 3000, bottomY: 34, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 1080, x2: 1260, dir: 'up', targetRoomId: 'abyss_dragon_spine' }],
      ironGate: {
        id: 'gate_nether_avenue_fox',
        x: 2560,
        topY: 0,
        bottomY: 416,
        gateKind: 'illusion_fox',
      },
      decorProps: [
        { kind: 'coiled_pillar', x: 460, y: 416, scale: 0.96 },
        { kind: 'dragon_brazier', x: 1500, y: 384, scale: 0.94 },
        { kind: 'coiled_pillar', x: 2540, y: 416, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 620, y: 336 },
        { x: 1840, y: 308 },
        { x: 2420, y: 336 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'scroll_demon', x: 740, y: 215 },
        { kind: 'opera_puppet', x: 1580, y: 384 },
        { kind: 'bronze_guard', x: 2260, y: 416 },
      ],
      pickups: [],
    },
    {
      id: 'nether_east_descent',
      name: '归墟落魂深井',
      subtitle: '双格双层东冥深渊 · 上连寒渊暗河 · 下通孽镜冥殿与埋骨剑渊',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 20,
      mapY: 9,
      gridW: 2,
      gridH: 2,
      pixelW: 1600,
      pixelH: 880,
      special: 'none',
      focalX: 800,
      focalY: 804,
      sideDoors: [
        { side: 'left', floorY: 356, targetRoomId: 'nether_lantern_avenue', rowOffset: 0 },
        { side: 'left', floorY: 804, targetRoomId: 'nether_mirror_crypt', rowOffset: 1 },
        { side: 'right', floorY: 804, targetRoomId: 'nether_east_ossuary', rowOffset: 1 },
      ],
      groundNodes: [
        { x: 0, y: 804, style: 'crypt_stone' },
        { x: 1600, y: 804, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 0, y: 356, w: 360, h: 36 },
        { x: 430, y: 356, w: 210, h: 32 },
        { x: 740, y: 356, w: 210, h: 32 },
        { x: 520, y: 468, w: 240, h: 32 },
        { x: 860, y: 580, w: 240, h: 32 },
        { x: 520, y: 694, w: 240, h: 32 },
        { x: 960, y: 248, w: 180, h: 30 },
        { x: 980, y: 148, w: 165, h: 28 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 980, bottomY: 34, style: 'crypt_vault' },
        { x1: 1160, x2: 1600, bottomY: 34, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 980, x2: 1160, dir: 'up', targetRoomId: 'abyss_east_corridor' }],
      decorProps: [
        { kind: 'guardian_statue', x: 260, y: 804, scale: 0.94 },
        { kind: 'coiled_pillar', x: 1340, y: 804, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 220, y: 286 },
        { x: 1220, y: 728 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 820, y: 320 },
        { kind: 'bronze_guard', x: 460, y: 804 },
        { kind: 'demon_wolf', x: 1120, y: 804 },
      ],
      pickups: [],
    },
    {
      id: 'nether_pillar_hall',
      name: '十殿镇狱石柱廊',
      subtitle: '四格镇魔巨柱殿 · 下潜太古祖龙西陵',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 10,
      mapY: 10,
      gridW: 4,
      gridH: 1,
      pixelW: 3000,
      pixelH: 500,
      special: 'none',
      focalX: 1500,
      focalY: 416,
      leftRoomId: 'nether_west_descent',
      leftDoorFloorY: 416,
      rightRoomId: 'nether_trial_colosseum',
      rightDoorFloorY: 416,
      groundNodes: [
        { x: 0, y: 416, style: 'crypt_stone' },
        { x: 960, y: 416, style: 'stairs' },
        { x: 1060, y: 448, style: 'crypt_stone' },
        { x: 2140, y: 448, style: 'stairs' },
        { x: 2240, y: 416, style: 'crypt_stone' },
        { x: 3000, y: 416, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 1220, y: 352, w: 240, h: 32 },
        { x: 1680, y: 352, w: 240, h: 32 },
      ],
      hazards: [
        { kind: 'pendulum', x: 820, y: 40, span: 185, speed: 1.9 },
        { kind: 'pendulum', x: 2380, y: 40, span: 185, speed: 1.9, phase: 1.5 },
      ],
      ceilingSpans: [{ x1: 0, x2: 3000, bottomY: 34, style: 'crypt_vault' }],
      shafts: [{ x1: 1860, x2: 2040, dir: 'down', targetRoomId: 'dragon_tomb_west' }],
      decorProps: [
        { kind: 'coiled_pillar', x: 460, y: 416, scale: 0.96 },
        { kind: 'coiled_pillar', x: 1560, y: 448, scale: 0.96 },
        { kind: 'coiled_pillar', x: 2620, y: 416, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [{ x: 1854, y: 448, w: 192, hasPillars: false }],
      archways: [],
      torches: [
        { x: 620, y: 336 },
        { x: 2480, y: 336 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 640, y: 416 },
        { kind: 'bell_gargoyle', x: 1340, y: 205 },
        { kind: 'demon_wolf', x: 2320, y: 416 },
      ],
      pickups: [],
    },
    {
      id: 'nether_trial_colosseum',
      name: '九幽百鬼修罗场',
      subtitle: '三格极渊血战困阵 · 镇压群魔破除结界',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 14,
      mapY: 10,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 500,
      special: 'none',
      focalX: 1100,
      focalY: 416,
      leftRoomId: 'nether_pillar_hall',
      leftDoorFloorY: 416,
      rightRoomId: 'nether_mirror_crypt',
      rightDoorFloorY: 416,
      groundNodes: [
        { x: 0, y: 416, style: 'crypt_stone' },
        { x: 540, y: 416, style: 'stairs' },
        { x: 640, y: 382, style: 'marble' },
        { x: 1560, y: 382, style: 'stairs' },
        { x: 1660, y: 416, style: 'crypt_stone' },
        { x: 2200, y: 416, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 360, y: 292, w: 220, h: 32 },
        { x: 1620, y: 292, w: 220, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 2200, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 740, y: 382, scale: 0.95 },
        { kind: 'dragon_brazier', x: 1460, y: 382, scale: 0.95 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 480, y: 336 },
        { x: 1720, y: 336 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bixie_stone_beast', x: 520, y: 416 },
        { kind: 'wuchang_reaper', x: 940, y: 210 },
        { kind: 'jinwu_mace_guard', x: 1260, y: 382 },
        { kind: 'wuchang_reaper', x: 1480, y: 195 },
        { kind: 'bixie_stone_beast', x: 1680, y: 416 },
      ],
      pickups: [{ id: 'pk_nether_trial_mp', kind: 'max_up', itemId: 'mp_vessel', x: 1100, y: 382 }],
    },
    {
      id: 'nether_mirror_crypt',
      name: '往生孽镜冥殿',
      subtitle: '三格幻镜幽殿 · 青丘破妄得【忘川引魂青灯坠】',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 17,
      mapY: 10,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 500,
      special: 'relic_pedestal',
      focalX: 1100,
      focalY: 376,
      leftRoomId: 'nether_trial_colosseum',
      leftDoorFloorY: 416,
      rightRoomId: 'nether_east_descent',
      rightDoorFloorY: 416,
      groundNodes: [
        { x: 0, y: 416, style: 'crypt_stone' },
        { x: 780, y: 416, style: 'stairs' },
        { x: 880, y: 376, style: 'marble' },
        { x: 1320, y: 376, style: 'stairs' },
        { x: 1420, y: 416, style: 'crypt_stone' },
        { x: 2200, y: 416, style: 'crypt_stone' },
      ],
      solidBlocks: [],
      ceilingSpans: [{ x1: 0, x2: 2200, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      ironGate: {
        id: 'gate_nether_mirror_fox',
        x: 560,
        topY: 0,
        bottomY: 416,
        gateKind: 'illusion_fox',
      },
      decorProps: [
        { kind: 'guardian_statue', x: 280, y: 416, scale: 0.94 },
        { kind: 'dragon_brazier', x: 940, y: 376, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1260, y: 376, scale: 0.94 },
        { kind: 'guardian_statue', x: 1920, y: 416, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 680, y: 336 },
        { x: 1620, y: 336 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'wuchang_reaper', x: 760, y: 205 },
        { kind: 'bixie_stone_beast', x: 1580, y: 416 },
      ],
      pickups: [
        {
          id: 'pk_nether_soul_lantern',
          kind: 'armor',
          itemId: 'abyss_soul_lantern',
          x: 1100,
          y: 376,
        },
      ],
    },
    {
      id: 'nether_east_ossuary',
      name: '万古埋骨剑渊',
      subtitle: '四格古战骨渊 · 下通太古玄鸟祭坛 · 东达镇魔碑窟',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 22,
      mapY: 10,
      gridW: 4,
      gridH: 1,
      pixelW: 3000,
      pixelH: 500,
      special: 'none',
      focalX: 1500,
      focalY: 416,
      leftRoomId: 'nether_east_descent',
      leftDoorFloorY: 416,
      rightRoomId: 'nether_ancient_stele_room',
      rightDoorFloorY: 416,
      groundNodes: [
        { x: 0, y: 416, style: 'crypt_stone' },
        { x: 760, y: 416, style: 'stairs' },
        { x: 860, y: 448, style: 'crypt_stone' },
        { x: 2140, y: 448, style: 'stairs' },
        { x: 2240, y: 416, style: 'crypt_stone' },
        { x: 3000, y: 416, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 1360, y: 352, w: 240, h: 32 },
        { x: 1840, y: 352, w: 240, h: 32 },
      ],
      hazards: [{ kind: 'spikes', x: 1620, y: 448, span: 150 }],
      ceilingSpans: [{ x1: 0, x2: 3000, bottomY: 34, style: 'crypt_vault' }],
      shafts: [{ x1: 1060, x2: 1240, dir: 'down', targetRoomId: 'dragon_tomb_sanctuary' }],
      decorProps: [
        { kind: 'weapon_rack', x: 420, y: 416, scale: 0.94 },
        { kind: 'coiled_pillar', x: 2560, y: 416, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [{ x: 1054, y: 448, w: 192, hasPillars: false }],
      archways: [],
      torches: [
        { x: 580, y: 336 },
        { x: 2420, y: 336 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bixie_stone_beast', x: 620, y: 416 },
        { kind: 'shenji_musketeer', x: 1480, y: 352 },
        { kind: 'wuchang_reaper', x: 1960, y: 205 },
        { kind: 'bixie_stone_beast', x: 2380, y: 416 },
      ],
      pickups: [],
    },
    {
      id: 'nether_ancient_stele_room',
      name: '太古镇魔碑窟',
      subtitle: '双格先秦石刻殿 · 供奉终卷《太古玄鸟封魔总纲石刻》',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 26,
      mapY: 10,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 980,
      focalY: 372,
      leftRoomId: 'nether_east_ossuary',
      leftDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 640, y: 408, style: 'stairs' },
        { x: 740, y: 372, style: 'marble' },
        { x: 1260, y: 372, style: 'stairs' },
        { x: 1360, y: 408, style: 'crypt_stone' },
        { x: 1600, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'coiled_pillar', x: 320, y: 408, scale: 0.96 },
        { kind: 'dragon_brazier', x: 820, y: 372, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1180, y: 372, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [{ x: 520, y: 332 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      steles: [{ id: 'stele_nether_zhuyin', x: 1000 }],
      spawns: [{ kind: 'bronze_guard', x: 520, y: 408 }],
      pickups: [{ id: 'pk_stele_zhuyin_jz', kind: 'consumable', itemId: 'jiuzhuan_jin_dan', x: 1220, y: 372 }],
    },
    {
      id: 'dragon_tomb_west',
      name: '太古祖龙西陵',
      subtitle: '四格地心极渊 · 第 12 层祖龙骸骨玄宫',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 11,
      mapY: 11,
      gridW: 4,
      gridH: 1,
      pixelW: 3000,
      pixelH: 520,
      special: 'none',
      focalX: 1500,
      focalY: 420,
      rightRoomId: 'dragon_tomb_save',
      rightDoorFloorY: 420,
      groundNodes: [
        { x: 0, y: 420, style: 'crypt_stone' },
        { x: 740, y: 420, style: 'stairs' },
        { x: 840, y: 456, style: 'crypt_stone' },
        { x: 2040, y: 456, style: 'stairs' },
        { x: 2140, y: 420, style: 'crypt_stone' },
        { x: 3000, y: 420, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 1040, y: 364, w: 170, h: 30 },
        { x: 1120, y: 274, w: 170, h: 30 },
        { x: 1050, y: 184, w: 165, h: 28 },
        { x: 1080, y: 92, w: 155, h: 26 },
        { x: 1580, y: 356, w: 240, h: 32 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 1060, bottomY: 34, style: 'crypt_vault' },
        { x1: 1240, x2: 3000, bottomY: 34, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 1060, x2: 1240, dir: 'up', targetRoomId: 'nether_pillar_hall' }],
      waterZones: [{ x1: 820, x2: 2060, surfaceY: 424 }],
      decorProps: [
        { kind: 'coiled_pillar', x: 420, y: 420, scale: 0.96 },
        { kind: 'guardian_statue', x: 2560, y: 420, scale: 0.95 },
      ],
      pavilions: [],
      archways: [],
      torches: [
        { x: 580, y: 340 },
        { x: 2380, y: 340 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bixie_stone_beast', x: 560, y: 420 },
        { kind: 'wuchang_reaper', x: 1680, y: 205 },
        { kind: 'armored_tortoise', x: 2320, y: 420 },
      ],
      pickups: [],
    },
    {
      id: 'dragon_tomb_save',
      name: '祖龙镇脉古祠',
      subtitle: '玄城地心极渊留档祠',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 15,
      mapY: 11,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 460,
      special: 'save_shrine',
      focalX: 400,
      focalY: 368,
      leftRoomId: 'dragon_tomb_west',
      leftDoorFloorY: 396,
      rightRoomId: 'dragon_tomb_heart',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'crypt_stone' },
        { x: 190, y: 396, style: 'stairs' },
        { x: 260, y: 368, style: 'marble' },
        { x: 540, y: 368, style: 'stairs' },
        { x: 610, y: 396, style: 'crypt_stone' },
        { x: 800, y: 396, style: 'crypt_stone' },
      ],
      solidBlocks: [],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'incense_burner', x: 270, y: 368, scale: 0.9 },
        { kind: 'incense_burner', x: 530, y: 368, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 155, y: 320 },
        { x: 645, y: 320 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
    },
    {
      id: 'dragon_tomb_heart',
      name: '九幽龙脉盘龙渊',
      subtitle: '守陵太古战魄·刑天镇守 · 供奉至宝【九幽祖龙逆鳞铠】',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 16,
      mapY: 11,
      gridW: 5,
      gridH: 1,
      pixelW: 3800,
      pixelH: 520,
      special: 'boss_room',
      bossKind: 'boss_dragon_warden',
      storyTriggerId: 'boss_warden_pre',
      focalX: 1900,
      focalY: 372,
      leftRoomId: 'dragon_tomb_save',
      leftDoorFloorY: 420,
      rightRoomId: 'dragon_tomb_warp',
      rightDoorFloorY: 420,
      groundNodes: [
        { x: 0, y: 420, style: 'crypt_stone' },
        { x: 560, y: 420, style: 'stairs' },
        { x: 660, y: 456, style: 'crypt_stone' },
        { x: 1460, y: 456, style: 'stairs' },
        { x: 1580, y: 372, style: 'marble' },
        { x: 2220, y: 372, style: 'stairs' },
        { x: 2340, y: 456, style: 'crypt_stone' },
        { x: 3140, y: 456, style: 'stairs' },
        { x: 3240, y: 420, style: 'crypt_stone' },
        { x: 3800, y: 420, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 960, y: 356, w: 240, h: 32 },
        { x: 2600, y: 356, w: 240, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 3800, bottomY: 34, style: 'crypt_vault' }],
      shafts: [],
      waterZones: [
        { x1: 640, x2: 1480, surfaceY: 426 },
        { x1: 2320, x2: 3160, surfaceY: 426 },
      ],
      decorProps: [
        { kind: 'coiled_pillar', x: 380, y: 420, scale: 0.98 },
        { kind: 'dragon_brazier', x: 1680, y: 372, scale: 0.96 },
        { kind: 'dragon_brazier', x: 2120, y: 372, scale: 0.96 },
        { kind: 'coiled_pillar', x: 3420, y: 420, scale: 0.98 },
      ],
      pavilions: [],
      archways: [],
      torches: [
        { x: 480, y: 340 },
        { x: 1900, y: 300 },
        { x: 3320, y: 340 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [
        {
          id: 'pk_dragon_tomb_armor',
          kind: 'armor',
          itemId: 'nether_dragon_armor',
          x: 1900,
          y: 372,
        },
      ],
    },
    {
      id: 'dragon_tomb_warp',
      name: '九幽极渊乾坤阵',
      subtitle: '第 12 层祖龙极渊八卦传送阵',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 21,
      mapY: 11,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'warp_bagua',
      warpName: '九幽祖龙极渊',
      focalX: 400,
      focalY: 408,
      leftRoomId: 'dragon_tomb_heart',
      leftDoorFloorY: 408,
      rightRoomId: 'dragon_tomb_sanctuary',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 800, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 210, y: 408, scale: 0.9 },
        { kind: 'dragon_brazier', x: 590, y: 408, scale: 0.9 },
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
      id: 'dragon_tomb_sanctuary',
      name: '太古玄鸟祭坛',
      subtitle: '三格极渊东陵 · 朱雀融冰上贯万古埋骨剑渊',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 22,
      mapY: 11,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 500,
      special: 'relic_pedestal',
      focalX: 1760,
      focalY: 372,
      leftRoomId: 'dragon_tomb_warp',
      leftDoorFloorY: 416,
      groundNodes: [
        { x: 0, y: 416, style: 'crypt_stone' },
        { x: 1460, y: 416, style: 'stairs' },
        { x: 1560, y: 372, style: 'marble' },
        { x: 1960, y: 372, style: 'stairs' },
        { x: 2060, y: 416, style: 'crypt_stone' },
        { x: 2200, y: 416, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 1040, y: 328, w: 170, h: 30 },
        { x: 1120, y: 242, w: 170, h: 30 },
        { x: 1050, y: 158, w: 165, h: 28 },
        { x: 1080, y: 82, w: 155, h: 26 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 1060, bottomY: 34, style: 'crypt_vault' },
        { x1: 1240, x2: 2200, bottomY: 34, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 1060, x2: 1240, dir: 'up', targetRoomId: 'nether_east_ossuary' }],
      ironGate: {
        id: 'gate_dragon_sanctuary_phoenix',
        x: 1380,
        topY: 0,
        bottomY: 416,
        gateKind: 'ice_phoenix',
      },
      decorProps: [
        { kind: 'guardian_statue', x: 340, y: 416, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1620, y: 372, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1900, y: 372, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [{ x: 780, y: 336 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'scroll_demon', x: 680, y: 205 },
        { kind: 'bronze_guard', x: 880, y: 416 },
      ],
      pickups: [{ id: 'pk_dragon_sanc_hp', kind: 'max_up', itemId: 'hp_vessel', x: 1760, y: 372 }],
    },
  ];

  // 54×30 版图下盘夯实与长廊立体化扩展群（共 28 座错落偏殿、矿道地窟、忘川钟阁与沉舰礁穴！）
  const silhouetteExpansionRooms: BuiltRoom[] = [
    // Group 1: 中上层平直长廊立体化偏阁 (3 座)
    {
      id: 'entrance_watch_loft',
      name: '城楼望哨阁',
      subtitle: '朱雀城堞之上 · 居高俯瞰箭楼飞檐的戍守重阁',
      region: 'gatehouse',
      bgKey: 'bg_gatehouse_interior',
      realm: 'normal',
      indoor: true,
      mapX: 10,
      mapY: 7,
      gridW: 2,
      gridH: 2,
      pixelW: 1600,
      pixelH: 840,
      special: 'none',
      focalX: 800,
      focalY: 760,
      groundNodes: [
        { x: 0, y: 760, style: 'flagstone' },
        { x: 1600, y: 760, style: 'flagstone' },
      ],
      solidBlocks: [
        { x: 520, y: 620, w: 220, h: 32 },
        { x: 860, y: 492, w: 220, h: 32 },
        { x: 460, y: 356, w: 460, h: 34 },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 36, style: 'gate_tunnel' }],
      shafts: [{ x1: 710, x2: 890, dir: 'down', targetRoomId: 'entrance_battlement_tower' }],
      decorProps: [
        { kind: 'weapon_rack', x: 340, y: 760, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1260, y: 760, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [{ x: 704, y: 760, w: 194, hasPillars: false }],
      archways: [],
      torches: [
        { x: 440, y: 684 },
        { x: 1160, y: 684 },
      ],
      foregrounds: [],
      lanterns: [{ x: 800, y: 210 }],
      npcs: [],
      spawns: [
        { kind: 'bone_archer', x: 640, y: 356 },
        { kind: 'bell_gargoyle', x: 1020, y: 540 },
      ],
      pickups: [{ id: 'pk_exp_watch_hp', kind: 'max_up', itemId: 'hp_vessel', x: 690, y: 356 }],
    },
    {
      id: 'hall_bell_tower',
      name: '奉天悬钟楼',
      subtitle: '西厢穹顶悬垂千斤铜钟 · 撞响铜钟可震彻玄城尘封暗壁',
      region: 'main_hall',
      bgKey: 'bg_main_hall',
      realm: 'normal',
      indoor: true,
      mapX: 26,
      mapY: 8,
      gridW: 2,
      gridH: 2,
      pixelW: 1600,
      pixelH: 840,
      special: 'none',
      focalX: 800,
      focalY: 760,
      groundNodes: [
        { x: 0, y: 760, style: 'marble' },
        { x: 1600, y: 760, style: 'marble' },
      ],
      solidBlocks: [
        { x: 480, y: 624, w: 220, h: 32 },
        { x: 880, y: 496, w: 220, h: 32 },
        { x: 560, y: 368, w: 480, h: 34 },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 36, style: 'palace_timber' }],
      shafts: [{ x1: 880, x2: 1060, dir: 'down', targetRoomId: 'hall_west_gallery' }],
      decorProps: [
        { kind: 'giant_bell', x: 800, y: 185, scale: 1.02 },
        { kind: 'incense_burner', x: 360, y: 760, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1260, y: 760, scale: 0.92 },
      ],
      steles: [{ id: 'stele_main_hall_bell', x: 240 }],
      waterZones: [],
      pavilions: [{ x: 874, y: 760, w: 194, hasPillars: false }],
      archways: [],
      torches: [
        { x: 520, y: 684 },
        { x: 1120, y: 684 },
      ],
      foregrounds: [],
      lanterns: [{ x: 460, y: 220 }],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 780, y: 520 },
        { kind: 'jinwu_mace_guard', x: 1220, y: 760 },
      ],
      pickups: [
        { id: 'pk_exp_bell_tiger_tally', kind: 'armor', itemId: 'tiger_tally', x: 800, y: 368 },
      ],
    },
    {
      id: 'clock_pendulum_vault',
      name: '星枢摆钟秘室',
      subtitle: '观星长桥底部的黄铜齿轮摆室 · 巨轮咬合星仪秘宝',
      region: 'clock_tower',
      bgKey: 'bg_tower_interior',
      realm: 'normal',
      indoor: true,
      mapX: 37,
      mapY: 9,
      gridW: 2,
      gridH: 2,
      pixelW: 1600,
      pixelH: 840,
      special: 'none',
      focalX: 800,
      focalY: 760,
      groundNodes: [
        { x: 0, y: 760, style: 'marble' },
        { x: 1600, y: 760, style: 'marble' },
      ],
      solidBlocks: [
        { x: 500, y: 644, w: 200, h: 32 },
        { x: 960, y: 536, w: 200, h: 32 },
        { x: 760, y: 428, w: 200, h: 32 },
        { x: 1040, y: 324, w: 200, h: 30 },
        { x: 900, y: 224, w: 190, h: 30 },
        { x: 1050, y: 132, w: 180, h: 28 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 1030, bottomY: 36, style: 'palace_timber' },
        { x1: 1210, x2: 1600, bottomY: 36, style: 'palace_timber' },
      ],
      shafts: [{ x1: 1030, x2: 1210, dir: 'up', targetRoomId: 'observatory_bridge' }],
      clockGears: [
        { x: 420, y: 320, radius: 72, speed: 0.48, hasOrbitPlatforms: false },
        { x: 1180, y: 360, radius: 76, speed: -0.45, hasOrbitPlatforms: false },
      ],
      decorProps: [
        { kind: 'guardian_statue', x: 300, y: 760, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1300, y: 760, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 420, y: 684 },
        { x: 1180, y: 684 },
      ],
      secretWalls: [
        {
          id: 'sw_clock_pend_mp',
          x: 8,
          y: 664,
          w: 44,
          h: 96,
          dropKind: 'max_up',
          dropItemId: 'mp_vessel',
        },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'clockwork_mantis', x: 1080, y: 760 },
        { kind: 'bronze_gear_wisp', x: 800, y: 460 },
      ],
      pickups: [
        { id: 'pk_exp_pend_suodi', kind: 'consumable', itemId: 'suodi_talisman', x: 340, y: 760 },
        { id: 'pk_exp_pend_sx', kind: 'consumable', itemId: 'shenxing_san', x: 1240, y: 760 },
      ],
    },

    // Group 2: 中下层裂谷错落坑室与化石玄殿 (y=16..19, 4 座)
    {
      id: 'mine_shaft_pocket',
      name: '古矿绞车暗坑',
      subtitle: '沉木矿道底部的废弃卷扬竖穴 · 地脉晶石幽光闪烁',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 7,
      mapY: 16,
      gridW: 2,
      gridH: 2,
      pixelW: 1600,
      pixelH: 840,
      special: 'none',
      focalX: 800,
      focalY: 760,
      groundNodes: [
        { x: 0, y: 760, style: 'crypt_stone' },
        { x: 1600, y: 760, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 540, y: 644, w: 200, h: 32 },
        { x: 880, y: 536, w: 200, h: 32 },
        { x: 660, y: 428, w: 200, h: 32 },
        { x: 960, y: 324, w: 200, h: 30 },
        { x: 780, y: 224, w: 190, h: 30 },
        { x: 920, y: 132, w: 180, h: 28 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 890, bottomY: 36, style: 'crypt_vault' },
        { x1: 1070, x2: 1600, bottomY: 36, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 890, x2: 1070, dir: 'up', targetRoomId: 'mine_timber_gallery' }],
      decorProps: [
        { kind: 'dragon_brazier', x: 320, y: 760, scale: 0.94 },
        { kind: 'weapon_rack', x: 1280, y: 760, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 440, y: 684 },
        { x: 1140, y: 684 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'magma_crucible_golem', x: 1060, y: 760 },
        { kind: 'mine_pickaxe_ghoul', x: 540, y: 760 },
      ],
      pickups: [{ id: 'pk_exp_mine_pocket_hp', kind: 'max_up', itemId: 'hp_vessel', x: 380, y: 760 }],
    },
    {
      id: 'catacomb_burial_niche',
      name: '玄陵陪葬耳室',
      subtitle: '赤焰隧道南侧凿出的皇陵耳窟 · 藏有前朝镇墓符龛',
      region: 'catacomb',
      bgKey: 'bg_catacomb_tomb',
      realm: 'normal',
      indoor: true,
      mapX: 17,
      mapY: 16,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 800,
      focalY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 1600, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 650, y: 318, w: 170, h: 30 },
        { x: 790, y: 230, w: 170, h: 30 },
        { x: 690, y: 146, w: 170, h: 28 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 710, bottomY: 36, style: 'crypt_vault' },
        { x1: 890, x2: 1600, bottomY: 36, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 710, x2: 890, dir: 'up', targetRoomId: 'forge_catacomb_tunnel' }],
      decorProps: [
        { kind: 'guardian_statue', x: 320, y: 408, scale: 0.94 },
        { kind: 'coiled_pillar', x: 1280, y: 408, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 460, y: 332 },
        { x: 1120, y: 332 },
      ],
      secretWalls: [
        {
          id: 'sw_burial_jz',
          x: 1548,
          y: 312,
          w: 44,
          h: 96,
          dropKind: 'consumable',
          dropItemId: 'jiuzhuan_jin_dan',
        },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'terracotta_halberdier', x: 1080, y: 408 },
        { kind: 'bone_archer', x: 440, y: 408 },
      ],
      pickups: [{ id: 'pk_exp_niche_mp', kind: 'max_up', itemId: 'mp_vessel', x: 1200, y: 408 }],
    },
    {
      id: 'abyss_fossil_alcove',
      name: '龙骨化石灵窟',
      subtitle: '西镇龙脉上方嵌满巨龙椎骨的高岩秘窟',
      region: 'catacomb',
      bgKey: 'bg_catacomb_tomb',
      realm: 'normal',
      indoor: true,
      mapX: 18,
      mapY: 19,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 800,
      focalY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 1600, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [{ x: 420, y: 292, w: 280, h: 32 }],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 36, style: 'crypt_vault' }],
      shafts: [{ x1: 1250, x2: 1430, dir: 'down', targetRoomId: 'abyss_dragon_vein_west' }],
      decorProps: [
        { kind: 'coiled_pillar', x: 300, y: 408, scale: 0.96 },
        { kind: 'dragon_brazier', x: 960, y: 408, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [{ x: 1244, y: 408, w: 194, hasPillars: false }],
      archways: [],
      torches: [
        { x: 540, y: 332 },
        { x: 1120, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'corpse_soldier', x: 760, y: 408 },
        { kind: 'wuchang_reaper', x: 560, y: 210 },
      ],
      pickups: [{ id: 'pk_exp_fossil_jz', kind: 'consumable', itemId: 'jiuzhuan_jin_dan', x: 560, y: 292 }],
    },
    {
      id: 'abyss_rib_vault',
      name: '镇龙肋骨玄殿',
      subtitle: '太古龙脊正上方耸立的拱骨祭殿 · 阴风啸聚龙角石柱',
      region: 'catacomb',
      bgKey: 'bg_catacomb_tomb',
      realm: 'normal',
      indoor: true,
      mapX: 28,
      mapY: 18,
      gridW: 2,
      gridH: 2,
      pixelW: 1600,
      pixelH: 840,
      special: 'none',
      focalX: 800,
      focalY: 760,
      groundNodes: [
        { x: 0, y: 760, style: 'crypt_stone' },
        { x: 1600, y: 760, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 580, y: 626, w: 220, h: 32 },
        { x: 900, y: 496, w: 220, h: 32 },
        { x: 640, y: 368, w: 460, h: 34 },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 36, style: 'crypt_vault' }],
      shafts: [{ x1: 310, x2: 490, dir: 'down', targetRoomId: 'abyss_dragon_spine' }],
      decorProps: [
        { kind: 'coiled_pillar', x: 760, y: 760, scale: 0.98 },
        { kind: 'guardian_statue', x: 1280, y: 760, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [{ x: 304, y: 760, w: 194, hasPillars: false }],
      archways: [],
      torches: [
        { x: 760, y: 684 },
        { x: 1180, y: 684 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bixie_stone_beast', x: 1080, y: 760 },
        { kind: 'wuchang_reaper', x: 860, y: 450 },
      ],
      pickups: [{ id: 'pk_exp_rib_daggers3', kind: 'weapon', itemId: 'daggers_3', x: 860, y: 368 }],
    },

    // Group 3: 左下深层赤熔地火矿区 (cols 0..9, y=21..27, 6 座 — 敦实玄城左翼下盘！)
    {
      id: 'mine_magma_shaft',
      name: '赤熔深井天梯',
      subtitle: '直落岩浆地心七层矿井 · 青铜升降机穿行四座古炉秘窟',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 6,
      mapY: 21,
      gridW: 1,
      gridH: 7,
      pixelW: 1080,
      pixelH: 2600,
      special: 'none',
      focalX: 540,
      focalY: 2516,
      sideDoors: [
        { side: 'left', floorY: 540, targetRoomId: 'mine_smelter_vault', rowOffset: 1 },
        { side: 'right', floorY: 920, targetRoomId: 'mine_ember_grotto', rowOffset: 2 },
        { side: 'left', floorY: 1720, targetRoomId: 'mine_obsidian_hall', rowOffset: 4 },
        { side: 'right', floorY: 2120, targetRoomId: 'mine_deep_reliquary', rowOffset: 5 },
      ],
      groundNodes: [
        { x: 0, y: 2516, style: 'crypt_stone' },
        { x: 1080, y: 2516, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 0, y: 540, w: 400, h: 36 },
        { x: 680, y: 920, w: 400, h: 36 },
        { x: 0, y: 1720, w: 400, h: 36 },
        { x: 680, y: 2120, w: 400, h: 36 },
        { x: 640, y: 2320, w: 210, h: 32 },
        { x: 230, y: 2120, w: 210, h: 32 },
        { x: 230, y: 1920, w: 210, h: 32 },
        { x: 640, y: 1500, w: 210, h: 32 },
        { x: 230, y: 1280, w: 210, h: 32 },
        { x: 640, y: 1100, w: 210, h: 32 },
        { x: 640, y: 720, w: 210, h: 32 },
        { x: 230, y: 360, w: 210, h: 32 },
        { x: 440, y: 185, w: 200, h: 28 },
      ],
      movingPlatforms: [
        { x1: 450, y1: 2450, x2: 450, y2: 240, w: 180, speed: 1.3, style: 'bronze_lift' },
      ],
      ceilingSpans: [
        { x1: 0, x2: 450, bottomY: 36, style: 'crypt_vault' },
        { x1: 630, x2: 1080, bottomY: 36, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 450, x2: 630, dir: 'up', targetRoomId: 'mine_deep_vein' }],
      decorProps: [
        { kind: 'dragon_brazier', x: 240, y: 2516, scale: 0.94 },
        { kind: 'coiled_pillar', x: 840, y: 2516, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 200, y: 464 },
        { x: 840, y: 2440 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 540, y: 660 },
        { kind: 'magma_crucible_golem', x: 820, y: 2120 },
        { kind: 'mine_pickaxe_ghoul', x: 320, y: 2516 },
      ],
      pickups: [],
    },
    {
      id: 'mine_smelter_vault',
      name: '千钧赤炉地窖',
      subtitle: '两层高耸青铜锻造地窖 · 铁砧余烬尚温',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 4,
      mapY: 22,
      gridW: 2,
      gridH: 2,
      pixelW: 1600,
      pixelH: 840,
      special: 'none',
      focalX: 800,
      focalY: 760,
      sideDoors: [{ side: 'right', floorY: 356, targetRoomId: 'mine_magma_shaft', rowOffset: 0 }],
      groundNodes: [
        { x: 0, y: 760, style: 'crypt_stone' },
        { x: 1600, y: 760, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 1180, y: 356, w: 420, h: 36 },
        { x: 960, y: 626, w: 220, h: 32 },
        { x: 700, y: 492, w: 240, h: 32 },
        { x: 420, y: 356, w: 240, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 340, y: 760, scale: 0.96 },
        { kind: 'weapon_rack', x: 1320, y: 760, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 520, y: 684 },
        { x: 1120, y: 684 },
      ],
      secretWalls: [
        {
          id: 'sw_smelter_chicken',
          x: 8,
          y: 664,
          w: 44,
          h: 96,
          dropKind: 'consumable',
          dropItemId: 'beggar_chicken',
        },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'magma_crucible_golem', x: 640, y: 760 },
        { kind: 'alchemy_homunculus', x: 1160, y: 760 },
      ],
      pickups: [{ id: 'pk_exp_smelter_sx', kind: 'consumable', itemId: 'shenxing_san', x: 540, y: 356 }],
    },
    {
      id: 'mine_ember_grotto',
      name: '赤烬地火岩廊',
      subtitle: '赤熔深井东侧延伸的天然硫火岩道',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 7,
      mapY: 23,
      gridW: 3,
      gridH: 1,
      pixelW: 1880,
      pixelH: 480,
      special: 'none',
      focalX: 940,
      focalY: 408,
      leftRoomId: 'mine_magma_shaft',
      leftDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 1880, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [{ x: 860, y: 292, w: 260, h: 32 }],
      ceilingSpans: [{ x1: 0, x2: 1880, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 460, y: 408, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1460, y: 408, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 720, y: 332 },
        { x: 1220, y: 332 },
      ],
      secretWalls: [
        {
          id: 'sw_ember_wine',
          x: 1828,
          y: 312,
          w: 44,
          h: 96,
          dropKind: 'consumable',
          dropItemId: 'tiger_bone_wine',
        },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'mine_pickaxe_ghoul', x: 780, y: 408 },
        { kind: 'magma_crucible_golem', x: 1340, y: 408 },
      ],
      pickups: [{ id: 'pk_exp_ember_hp', kind: 'max_up', itemId: 'hp_vessel', x: 1580, y: 408 }],
    },
    {
      id: 'mine_obsidian_hall',
      name: '玄曜黑石巨窟',
      subtitle: '漆黑曜岩雕琢的双层矿殿 · 连通地心玄武尽窟',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 3,
      mapY: 25,
      gridW: 3,
      gridH: 2,
      pixelW: 1880,
      pixelH: 840,
      special: 'none',
      focalX: 940,
      focalY: 760,
      sideDoors: [
        { side: 'right', floorY: 356, targetRoomId: 'mine_magma_shaft', rowOffset: 0 },
        { side: 'left', floorY: 760, targetRoomId: 'mine_basalt_spur', rowOffset: 1 },
      ],
      groundNodes: [
        { x: 0, y: 760, style: 'crypt_stone' },
        { x: 1880, y: 760, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 1460, y: 356, w: 420, h: 36 },
        { x: 1180, y: 626, w: 220, h: 32 },
        { x: 960, y: 492, w: 220, h: 32 },
        { x: 660, y: 360, w: 560, h: 34 },
        { x: 340, y: 492, w: 220, h: 32 },
        { x: 180, y: 626, w: 220, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 1880, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'coiled_pillar', x: 460, y: 760, scale: 0.96 },
        { kind: 'guardian_statue', x: 1420, y: 760, scale: 0.94 },
      ],
      steles: [{ id: 'stele_obsidian_vein', x: 260 }],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 640, y: 684 },
        { x: 1280, y: 684 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'magma_crucible_golem', x: 760, y: 760 },
        { kind: 'lantern_ghost', x: 1080, y: 410 },
      ],
      pickups: [],
    },
    {
      id: 'mine_basalt_spur',
      name: '地心玄武尽窟',
      subtitle: '九幽玄城最西南角玄武岩崖尽头 · 古矿源脉遗宝安卧于此',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 0,
      mapY: 26,
      gridW: 3,
      gridH: 1,
      pixelW: 1880,
      pixelH: 480,
      special: 'none',
      focalX: 940,
      focalY: 408,
      rightRoomId: 'mine_obsidian_hall',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 1880, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [{ x: 420, y: 292, w: 280, h: 32 }],
      ceilingSpans: [{ x1: 0, x2: 1880, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'guardian_statue', x: 320, y: 408, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1420, y: 408, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 520, y: 332 },
        { x: 1220, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'jinwu_mace_guard', x: 860, y: 408 },
        { kind: 'mine_pickaxe_ghoul', x: 1280, y: 408 },
      ],
      pickups: [
        { id: 'pk_exp_basalt_blood_sw', kind: 'weapon', itemId: 'sword_blood', x: 560, y: 292 },
      ],
    },
    {
      id: 'mine_deep_reliquary',
      name: '炎脉古剑藏室',
      subtitle: '深藏于熔井最底层的两层古兵秘殿 · 封存上古炼丹金丸',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 7,
      mapY: 26,
      gridW: 2,
      gridH: 2,
      pixelW: 1600,
      pixelH: 840,
      special: 'none',
      focalX: 800,
      focalY: 760,
      sideDoors: [{ side: 'left', floorY: 356, targetRoomId: 'mine_magma_shaft', rowOffset: 0 }],
      groundNodes: [
        { x: 0, y: 760, style: 'crypt_stone' },
        { x: 1600, y: 760, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 0, y: 356, w: 420, h: 36 },
        { x: 460, y: 626, w: 220, h: 32 },
        { x: 700, y: 492, w: 220, h: 32 },
        { x: 960, y: 356, w: 260, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'weapon_rack', x: 340, y: 760, scale: 0.96 },
        { kind: 'dragon_brazier', x: 1260, y: 760, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 520, y: 684 },
        { x: 1120, y: 684 },
      ],
      secretWalls: [
        {
          id: 'sw_reliquary_hp',
          x: 1548,
          y: 664,
          w: 44,
          h: 96,
          dropKind: 'max_up',
          dropItemId: 'hp_vessel',
        },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'magma_crucible_golem', x: 780, y: 760 },
        { kind: 'bronze_guard', x: 1180, y: 760 },
      ],
      pickups: [
        { id: 'pk_exp_deep_jz', kind: 'consumable', itemId: 'jiuzhuan_jin_dan', x: 1200, y: 760 },
        { id: 'pk_exp_deep_sword3', kind: 'weapon', itemId: 'sword_3', x: 1090, y: 356 },
      ],
    },

    // Group 4: 中下层忘川冥府与太古祖龙陵立体错层 (8 座)
    {
      id: 'nether_weeping_hall',
      name: '幽泣魂灯偏殿',
      subtitle: '西落渊井侧畔的双层冥殿 · 鬼火幽灯悬照石阶',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 12,
      mapY: 22,
      gridW: 2,
      gridH: 2,
      pixelW: 1600,
      pixelH: 840,
      special: 'none',
      focalX: 800,
      focalY: 760,
      sideDoors: [{ side: 'right', floorY: 356, targetRoomId: 'nether_west_descent', rowOffset: 0 }],
      groundNodes: [
        { x: 0, y: 760, style: 'crypt_stone' },
        { x: 1600, y: 760, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 1180, y: 356, w: 420, h: 36 },
        { x: 960, y: 626, w: 220, h: 32 },
        { x: 700, y: 492, w: 220, h: 32 },
        { x: 420, y: 356, w: 240, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'coiled_pillar', x: 320, y: 760, scale: 0.96 },
        { kind: 'dragon_brazier', x: 1260, y: 760, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 520, y: 684 },
        { x: 1120, y: 684 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'wuchang_reaper', x: 720, y: 500 },
        { kind: 'demon_wolf', x: 1020, y: 760 },
      ],
      pickups: [{ id: 'pk_exp_weeping_mp', kind: 'max_up', itemId: 'mp_vessel', x: 380, y: 760 }],
    },
    {
      id: 'nether_ferry_loft',
      name: '忘川渡口瞭阁',
      subtitle: '横跨黄泉冥河长桥中央的了望石亭 · 缩地归阵符静候渡人',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 17,
      mapY: 22,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 800,
      focalY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 1600, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [{ x: 460, y: 288, w: 260, h: 32 }],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 36, style: 'crypt_vault' }],
      shafts: [{ x1: 1090, x2: 1270, dir: 'down', targetRoomId: 'nether_soul_bridge' }],
      decorProps: [
        { kind: 'guardian_statue', x: 300, y: 408, scale: 0.94 },
        { kind: 'incense_burner', x: 860, y: 408, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [{ x: 1084, y: 408, w: 194, hasPillars: false }],
      archways: [],
      torches: [
        { x: 440, y: 332 },
        { x: 1000, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'scroll_demon', x: 760, y: 210 },
        { kind: 'terracotta_halberdier', x: 640, y: 408 },
      ],
      pickups: [
        { id: 'pk_exp_ferry_suodi', kind: 'consumable', itemId: 'suodi_talisman', x: 560, y: 288 },
      ],
    },
    {
      id: 'nether_wisp_belfry',
      name: '冥火引魂钟阁',
      subtitle: '引魂灯街上方双层孤阁 · 高悬黄泉惊魂铜钟',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 25,
      mapY: 21,
      gridW: 2,
      gridH: 2,
      pixelW: 1600,
      pixelH: 840,
      special: 'none',
      focalX: 800,
      focalY: 760,
      groundNodes: [
        { x: 0, y: 760, style: 'crypt_stone' },
        { x: 1600, y: 760, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 520, y: 626, w: 220, h: 32 },
        { x: 860, y: 496, w: 220, h: 32 },
        { x: 560, y: 368, w: 480, h: 34 },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 36, style: 'crypt_vault' }],
      shafts: [{ x1: 710, x2: 890, dir: 'down', targetRoomId: 'nether_lantern_avenue' }],
      decorProps: [
        { kind: 'giant_bell', x: 800, y: 185, scale: 1.0 },
        { kind: 'coiled_pillar', x: 320, y: 760, scale: 0.96 },
        { kind: 'dragon_brazier', x: 1280, y: 760, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [{ x: 704, y: 760, w: 194, hasPillars: false }],
      archways: [],
      torches: [
        { x: 460, y: 684 },
        { x: 1140, y: 684 },
      ],
      foregrounds: [],
      lanterns: [{ x: 480, y: 220 }],
      npcs: [],
      spawns: [
        { kind: 'celestial_sentinel', x: 780, y: 480 },
        { kind: 'scroll_demon', x: 1160, y: 540 },
      ],
      pickups: [{ id: 'pk_exp_wisp_hp', kind: 'max_up', itemId: 'hp_vessel', x: 800, y: 368 }],
    },
    {
      id: 'nether_mirror_cellar',
      name: '玄镜沉影暗窖',
      subtitle: '孽镜冥殿下方私藏秘窖 · 青丘灵石掩映镜影丹鼎',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 26,
      mapY: 26,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 800,
      focalY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 1600, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 780, y: 318, w: 170, h: 30 },
        { x: 920, y: 230, w: 170, h: 30 },
        { x: 820, y: 146, w: 170, h: 28 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 840, bottomY: 36, style: 'crypt_vault' },
        { x1: 1020, x2: 1600, bottomY: 36, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 840, x2: 1020, dir: 'up', targetRoomId: 'nether_mirror_crypt' }],
      decorProps: [
        { kind: 'dragon_brazier', x: 340, y: 408, scale: 0.94 },
        { kind: 'guardian_statue', x: 1320, y: 408, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 480, y: 332 },
        { x: 1180, y: 332 },
      ],
      secretWalls: [
        {
          id: 'sw_mirror_cellar_sx',
          x: 1548,
          y: 312,
          w: 44,
          h: 96,
          dropKind: 'consumable',
          dropItemId: 'shenxing_san',
        },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'drowned_corpse_bride', x: 540, y: 240 },
        { kind: 'bixie_stone_beast', x: 1180, y: 408 },
      ],
      pickups: [{ id: 'pk_exp_mirror_jz', kind: 'consumable', itemId: 'jiuzhuan_jin_dan', x: 360, y: 408 }],
    },
    {
      id: 'dragon_west_crypt',
      name: '太古西陵龙室',
      subtitle: '祖龙西翼长陵以外的古老配室 · 顶通西陵镇魂高阁',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 11,
      mapY: 29,
      gridW: 3,
      gridH: 1,
      pixelW: 1880,
      pixelH: 480,
      special: 'none',
      focalX: 940,
      focalY: 408,
      rightRoomId: 'dragon_tomb_west',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 1880, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 470, y: 318, w: 170, h: 30 },
        { x: 610, y: 230, w: 170, h: 30 },
        { x: 520, y: 146, w: 170, h: 28 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 540, bottomY: 36, style: 'crypt_vault' },
        { x1: 720, x2: 1880, bottomY: 36, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 540, x2: 720, dir: 'up', targetRoomId: 'dragon_west_belfry' }],
      decorProps: [
        { kind: 'coiled_pillar', x: 300, y: 408, scale: 0.96 },
        { kind: 'guardian_statue', x: 1480, y: 408, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 420, y: 332 },
        { x: 1300, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'terracotta_halberdier', x: 1020, y: 408 },
        { kind: 'demon_wolf', x: 1520, y: 408 },
      ],
      pickups: [],
    },
    {
      id: 'dragon_west_belfry',
      name: '西陵镇魂高阁',
      subtitle: '太古龙陵西巅双层守墓高阁 · 镇魂钟鸣震慑九幽亡魂',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 11,
      mapY: 27,
      gridW: 2,
      gridH: 2,
      pixelW: 1600,
      pixelH: 840,
      special: 'none',
      focalX: 800,
      focalY: 760,
      groundNodes: [
        { x: 0, y: 760, style: 'crypt_stone' },
        { x: 1600, y: 760, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 540, y: 626, w: 220, h: 32 },
        { x: 860, y: 496, w: 220, h: 32 },
        { x: 560, y: 368, w: 480, h: 34 },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 36, style: 'crypt_vault' }],
      shafts: [{ x1: 710, x2: 890, dir: 'down', targetRoomId: 'dragon_west_crypt' }],
      decorProps: [
        { kind: 'giant_bell', x: 800, y: 185, scale: 1.0 },
        { kind: 'coiled_pillar', x: 320, y: 760, scale: 0.96 },
      ],
      steles: [{ id: 'stele_west_belfry', x: 200 }],
      waterZones: [],
      pavilions: [{ x: 704, y: 760, w: 194, hasPillars: false }],
      archways: [],
      torches: [
        { x: 460, y: 684 },
        { x: 1140, y: 684 },
      ],
      foregrounds: [],
      lanterns: [{ x: 460, y: 220 }],
      npcs: [],
      spawns: [
        { kind: 'celestial_sentinel', x: 780, y: 480 },
        { kind: 'scroll_demon', x: 1160, y: 520 },
      ],
      pickups: [
        { id: 'pk_exp_west_belfry_spear3', kind: 'weapon', itemId: 'spear_3', x: 800, y: 368 },
      ],
    },
    {
      id: 'nether_bone_vault',
      name: '万骨沉渊秘库',
      subtitle: '埋骨长廊南坠的两层白骨幽库 · 冥兵残甲堆叠如山',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 32,
      mapY: 26,
      gridW: 2,
      gridH: 2,
      pixelW: 1600,
      pixelH: 840,
      special: 'none',
      focalX: 800,
      focalY: 760,
      groundNodes: [
        { x: 0, y: 760, style: 'crypt_stone' },
        { x: 1600, y: 760, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 500, y: 644, w: 200, h: 32 },
        { x: 860, y: 536, w: 200, h: 32 },
        { x: 520, y: 428, w: 200, h: 32 },
        { x: 840, y: 324, w: 200, h: 30 },
        { x: 640, y: 224, w: 190, h: 30 },
        { x: 780, y: 132, w: 180, h: 28 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 710, bottomY: 36, style: 'crypt_vault' },
        { x1: 890, x2: 1600, bottomY: 36, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 710, x2: 890, dir: 'up', targetRoomId: 'nether_east_ossuary' }],
      decorProps: [
        { kind: 'guardian_statue', x: 320, y: 760, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1280, y: 760, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 460, y: 684 },
        { x: 1140, y: 684 },
      ],
      secretWalls: [
        {
          id: 'sw_bone_vault_hp',
          x: 8,
          y: 664,
          w: 44,
          h: 96,
          dropKind: 'max_up',
          dropItemId: 'hp_vessel',
        },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'bixie_stone_beast', x: 1060, y: 760 },
        { kind: 'wuchang_reaper', x: 560, y: 500 },
      ],
      pickups: [{ id: 'pk_exp_bone_mp', kind: 'max_up', itemId: 'mp_vessel', x: 340, y: 760 }],
    },
    {
      id: 'dragon_east_annex',
      name: '东陵祖龙祀廊',
      subtitle: '太古玄鸟祭坛东侧延展的祀龙古殿 · 长明青铜火炬未熄',
      region: 'nether',
      bgKey: 'bg_nether_abyss',
      realm: 'normal',
      indoor: true,
      mapX: 31,
      mapY: 29,
      gridW: 3,
      gridH: 1,
      pixelW: 1880,
      pixelH: 480,
      special: 'none',
      focalX: 940,
      focalY: 408,
      leftRoomId: 'dragon_tomb_sanctuary',
      leftDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 1880, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [{ x: 1120, y: 292, w: 260, h: 32 }],
      ceilingSpans: [{ x1: 0, x2: 1880, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'coiled_pillar', x: 480, y: 408, scale: 0.96 },
        { kind: 'dragon_brazier', x: 1520, y: 408, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 640, y: 332 },
        { x: 1280, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'terracotta_halberdier', x: 860, y: 408 },
        { kind: 'wuchang_reaper', x: 1240, y: 210 },
      ],
      pickups: [{ id: 'pk_exp_east_annex_jz', kind: 'consumable', itemId: 'jiuzhuan_jin_dan', x: 1620, y: 408 }],
    },

    // Group 5: 右下深海沉舰鬼礁大翼 (cols 41..53, y=21..27, 7 座 — 敦实玄城右翼下盘！)
    {
      id: 'dock_reef_descent',
      name: '归墟海礁深井',
      subtitle: '纵贯东海归墟海沟的七层沉舰水井 · 连通珊瑚窟、幽冥巨舰与海珠洞',
      region: 'shipyard',
      bgKey: 'bg_sunken_shipyard',
      realm: 'normal',
      indoor: true,
      mapX: 43,
      mapY: 21,
      gridW: 1,
      gridH: 7,
      pixelW: 1080,
      pixelH: 2600,
      special: 'none',
      focalX: 540,
      focalY: 2516,
      sideDoors: [
        { side: 'left', floorY: 356, targetRoomId: 'dock_treasure_vault', rowOffset: 0 },
        { side: 'right', floorY: 740, targetRoomId: 'dock_sunken_galleon', rowOffset: 1 },
        { side: 'left', floorY: 1120, targetRoomId: 'dock_barnacle_crypt', rowOffset: 2 },
        { side: 'right', floorY: 1760, targetRoomId: 'dock_leviathan_rib', rowOffset: 4 },
        { side: 'left', floorY: 2140, targetRoomId: 'dock_pearl_grotto', rowOffset: 5 },
      ],
      groundNodes: [
        { x: 0, y: 2516, style: 'crypt_stone' },
        { x: 1080, y: 2516, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 0, y: 356, w: 400, h: 36 },
        { x: 680, y: 740, w: 400, h: 36 },
        { x: 0, y: 1120, w: 400, h: 36 },
        { x: 680, y: 1760, w: 400, h: 36 },
        { x: 0, y: 2140, w: 400, h: 36 },
        { x: 640, y: 2340, w: 210, h: 32 },
        { x: 640, y: 1960, w: 210, h: 32 },
        { x: 230, y: 1560, w: 210, h: 32 },
        { x: 640, y: 1340, w: 210, h: 32 },
        { x: 640, y: 940, w: 210, h: 32 },
        { x: 230, y: 550, w: 210, h: 32 },
      ],
      movingPlatforms: [
        { x1: 450, y1: 2450, x2: 450, y2: 390, w: 180, speed: 1.3, style: 'bronze_lift' },
      ],
      ceilingSpans: [{ x1: 0, x2: 1080, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'guardian_statue', x: 240, y: 2516, scale: 0.94 },
        { kind: 'coiled_pillar', x: 840, y: 2516, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 220, y: 280 },
        { x: 840, y: 2440 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'guixu_water_fiend', x: 540, y: 880 },
        { kind: 'armored_tortoise', x: 820, y: 1760 },
      ],
      pickups: [],
    },
    {
      id: 'dock_sunken_galleon',
      name: '沉海艨艟船舱',
      subtitle: '横卧归墟海底的两层古代大福船遗骸 · 舱底宝匣犹存',
      region: 'shipyard',
      bgKey: 'bg_sunken_shipyard',
      realm: 'normal',
      indoor: true,
      mapX: 44,
      mapY: 22,
      gridW: 3,
      gridH: 2,
      pixelW: 1880,
      pixelH: 840,
      special: 'none',
      focalX: 940,
      focalY: 760,
      sideDoors: [{ side: 'left', floorY: 356, targetRoomId: 'dock_reef_descent', rowOffset: 0 }],
      groundNodes: [
        { x: 0, y: 760, style: 'crypt_stone' },
        { x: 1880, y: 760, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 0, y: 356, w: 420, h: 36 },
        { x: 460, y: 626, w: 220, h: 32 },
        { x: 700, y: 492, w: 220, h: 32 },
        { x: 960, y: 356, w: 260, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 1880, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'coiled_pillar', x: 380, y: 760, scale: 0.96 },
        { kind: 'dragon_brazier', x: 1460, y: 760, scale: 0.94 },
      ],
      steles: [{ id: 'stele_sunken_galleon', x: 240 }],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 540, y: 684 },
        { x: 1260, y: 684 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'guixu_water_fiend', x: 860, y: 480 },
        { kind: 'frost_chain_jailer', x: 1320, y: 760 },
      ],
      pickups: [{ id: 'pk_exp_galleon_hp', kind: 'max_up', itemId: 'hp_vessel', x: 1540, y: 760 }],
    },
    {
      id: 'dock_barnacle_crypt',
      name: '珊瑚暗礁石窟',
      subtitle: '海礁深井西侧贝壳附生的阴湿海窟',
      region: 'shipyard',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      indoor: true,
      mapX: 41,
      mapY: 23,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 480,
      special: 'none',
      focalX: 800,
      focalY: 408,
      rightRoomId: 'dock_reef_descent',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 1600, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [{ x: 420, y: 292, w: 260, h: 32 }],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'guardian_statue', x: 320, y: 408, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1180, y: 408, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 460, y: 332 },
        { x: 1080, y: 332 },
      ],
      secretWalls: [
        {
          id: 'sw_barnacle_wine',
          x: 8,
          y: 312,
          w: 44,
          h: 96,
          dropKind: 'consumable',
          dropItemId: 'tiger_bone_wine',
        },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'drowned_corpse_bride', x: 640, y: 220 },
        { kind: 'armored_tortoise', x: 1020, y: 408 },
      ],
      pickups: [{ id: 'pk_exp_barnacle_sx', kind: 'consumable', itemId: 'shenxing_san', x: 520, y: 292 }],
    },
    {
      id: 'dock_leviathan_rib',
      name: '沧溟巨鲸骨廊',
      subtitle: '上古鲲鲸遗骨筑成的海渊长廊 · 西连海礁井 · 东通幽冥楼船巨艏',
      region: 'shipyard',
      bgKey: 'bg_sunken_shipyard',
      realm: 'normal',
      indoor: true,
      mapX: 44,
      mapY: 25,
      gridW: 4,
      gridH: 1,
      pixelW: 2200,
      pixelH: 480,
      special: 'none',
      focalX: 1100,
      focalY: 408,
      leftRoomId: 'dock_reef_descent',
      leftDoorFloorY: 408,
      rightRoomId: 'dock_abyssal_prow',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 2200, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 760, y: 300, w: 220, h: 32 },
        { x: 1220, y: 300, w: 220, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 2200, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'coiled_pillar', x: 480, y: 408, scale: 0.96 },
        { kind: 'coiled_pillar', x: 1720, y: 408, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 640, y: 332 },
        { x: 1560, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'guixu_water_fiend', x: 960, y: 220 },
        { kind: 'shenji_musketeer', x: 1460, y: 408 },
      ],
      pickups: [],
    },
    {
      id: 'dock_abyssal_prow',
      name: '幽冥楼船巨艏',
      subtitle: '高耸两层的宝船舰艏残躯 · 底层延伸至归墟尽头灯礁',
      region: 'shipyard',
      bgKey: 'bg_sunken_shipyard',
      realm: 'normal',
      indoor: true,
      mapX: 48,
      mapY: 25,
      gridW: 3,
      gridH: 2,
      pixelW: 1880,
      pixelH: 840,
      special: 'none',
      focalX: 940,
      focalY: 760,
      sideDoors: [
        { side: 'left', floorY: 356, targetRoomId: 'dock_leviathan_rib', rowOffset: 0 },
        { side: 'right', floorY: 760, targetRoomId: 'dock_trench_lantern', rowOffset: 1 },
      ],
      groundNodes: [
        { x: 0, y: 760, style: 'crypt_stone' },
        { x: 1880, y: 760, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 0, y: 356, w: 420, h: 36 },
        { x: 460, y: 626, w: 220, h: 32 },
        { x: 700, y: 492, w: 220, h: 32 },
        { x: 660, y: 360, w: 560, h: 34 },
        { x: 1320, y: 486, w: 220, h: 32 },
        { x: 1480, y: 626, w: 220, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 1880, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 380, y: 760, scale: 0.94 },
        { kind: 'guardian_statue', x: 1460, y: 760, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 540, y: 684 },
        { x: 1260, y: 684 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'drowned_corpse_bride', x: 860, y: 440 },
        { kind: 'armored_tortoise', x: 1300, y: 760 },
      ],
      pickups: [],
    },
    {
      id: 'dock_trench_lantern',
      name: '归墟尽头灯礁',
      subtitle: '玄城最东南角孤悬深海的石灯角 · 东海沉船遗宝长眠于斯',
      region: 'shipyard',
      bgKey: 'bg_sunken_shipyard',
      realm: 'normal',
      indoor: true,
      mapX: 51,
      mapY: 26,
      gridW: 3,
      gridH: 1,
      pixelW: 1880,
      pixelH: 480,
      special: 'none',
      focalX: 940,
      focalY: 408,
      leftRoomId: 'dock_abyssal_prow',
      leftDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'crypt_stone' },
        { x: 1880, y: 408, style: 'crypt_stone' },
      ],
      solidBlocks: [{ x: 1180, y: 292, w: 280, h: 32 }],
      ceilingSpans: [{ x1: 0, x2: 1880, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 460, y: 408, scale: 0.94 },
        { kind: 'coiled_pillar', x: 1520, y: 408, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 640, y: 332 },
        { x: 1320, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'guixu_water_fiend', x: 760, y: 220 },
        { kind: 'mine_pickaxe_ghoul', x: 1240, y: 408 },
      ],
      pickups: [{ id: 'pk_exp_trench_whip3', kind: 'weapon', itemId: 'whip_3', x: 1300, y: 292 }],
    },
    {
      id: 'dock_pearl_grotto',
      name: '沧海明珠秘洞',
      subtitle: '海礁深井底层西侧双层珍珠秘窟 · 贝壳生辉',
      region: 'shipyard',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      indoor: true,
      mapX: 41,
      mapY: 26,
      gridW: 2,
      gridH: 2,
      pixelW: 1600,
      pixelH: 840,
      special: 'none',
      focalX: 800,
      focalY: 760,
      sideDoors: [{ side: 'right', floorY: 356, targetRoomId: 'dock_reef_descent', rowOffset: 0 }],
      groundNodes: [
        { x: 0, y: 760, style: 'crypt_stone' },
        { x: 1600, y: 760, style: 'crypt_stone' },
      ],
      solidBlocks: [
        { x: 1180, y: 356, w: 420, h: 36 },
        { x: 960, y: 626, w: 220, h: 32 },
        { x: 700, y: 492, w: 220, h: 32 },
        { x: 420, y: 356, w: 240, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 36, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'guardian_statue', x: 340, y: 760, scale: 0.94 },
        { kind: 'incense_burner', x: 1280, y: 760, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 520, y: 684 },
        { x: 1120, y: 684 },
      ],
      secretWalls: [
        {
          id: 'sw_pearl_mp',
          x: 8,
          y: 664,
          w: 44,
          h: 96,
          dropKind: 'max_up',
          dropItemId: 'mp_vessel',
        },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'drowned_corpse_bride', x: 780, y: 480 },
        { kind: 'armored_tortoise', x: 560, y: 760 },
      ],
      pickups: [{ id: 'pk_exp_pearl_jz', kind: 'consumable', itemId: 'jiuzhuan_jin_dan', x: 380, y: 760 }],
    },
  ];

  // 全城 54×30《恶魔城》均衡金字塔树状枝蔓骨架布局 [mapX, mapY, gridW, gridH]（共 183 座殿宇，密度 42.0%！上塔收束+左右宽阔地心矿渊/沉舰下盘+高低错落偏阁！）
  const DISPERSED_WORLD_LAYOUT: Record<string, readonly [number, number, number, number]> = {
    // 1. 凌霄祭天坛孤峰 (y=0..2；东端收束为双层钟殿+星库塔尖)
    altar_save:                [38,  0, 1, 1],
    sky_altar:                 [39,  0, 4, 2],
    outer_wall_upper:          [43,  0, 1, 6],
    cloud_star_gallery:        [30,  1, 3, 3],
    altar_forecourt:           [33,  1, 6, 1],
    altar_cloud_bridge:        [34,  2, 3, 1],
    altar_vestibule:           [37,  2, 1, 1],
    altar_east_terrace:        [38,  2, 5, 1],
    celestial_bell_sanctum:    [44,  1, 2, 2],
    celestial_star_vault:      [46,  2, 2, 1],

    // 2. 神武演武校场 & 百戏梨园上层脊廊 (y=2..3)
    colosseum_grand_arena:     [12,  2, 4, 2],
    opera_boss_stage:          [24,  2, 3, 2],
    opera_save:                [27,  2, 1, 1],
    chapel_cloud_stair:        [ 6,  3, 4, 3],
    colosseum_west_gate:       [10,  3, 2, 1],
    colosseum_save:            [16,  3, 1, 1],
    colosseum_east_armory:     [17,  3, 3, 1],
    colosseum_sky_bridge:      [20,  3, 3, 1],
    relic_grapple_vault:       [23,  3, 1, 1],
    opera_moon_pavilion:       [27,  3, 3, 1],
    east_outer_tower:          [34,  3, 1, 10],

    // 3. 钦天炼丹司 / 百戏下层 / 万卷藏书阁 / 钟楼 (y=4..8)
    west_cliff_watchtower:     [10,  4, 1, 3],
    xiao_boss_hall:            [12,  4, 3, 2],
    alchemy_save:              [15,  4, 1, 1],
    alchemy_fire_sanctum:      [17,  4, 2, 2],
    library_automaton_loft:    [19,  4, 4, 1],
    library_warp:              [23,  4, 1, 1],
    opera_dressing_room:       [24,  4, 1, 1],
    opera_gallery:             [25,  4, 4, 1],
    opera_foyer:               [29,  4, 4, 1],
    relic_double_jump:         [11,  5, 1, 1],
    library_grand_hall:        [29,  5, 3, 2],
    upper_library:             [32,  5, 2, 2],
    secret_archive:            [35,  5, 1, 1],
    clock_sky_aqueduct:        [36,  5, 5, 1],
    relic_wall_vault:          [41,  5, 1, 1],
    outer_wall_armory:         [42,  5, 1, 1],
    cliff_hermit_shrine:       [ 3,  6, 2, 1],
    cliff_wind_pavilion:       [ 5,  6, 1, 1],
    west_cliff_pagoda:         [ 6,  6, 1, 5],
    west_cliff_skybridge:      [ 7,  6, 3, 1],
    secret_armory_vault:       [12,  6, 1, 1],
    west_armory:               [13,  6, 1, 1],
    alchemy_lab:               [14,  6, 3, 1],
    alchemy_foyer:             [17,  6, 3, 1],
    alchemy_herb_garden:       [20,  6, 1, 1],
    alchemy_library_bridge:    [21,  6, 5, 1],
    secret_library_study:      [26,  6, 1, 1],
    library_shop:              [27,  6, 1, 1],
    library_save:              [28,  6, 1, 1],
    clock_gear_hall:           [35,  6, 2, 1],
    clock_bell_gallery:        [37,  6, 2, 1],
    clock_boss_spire:          [39,  6, 3, 2],
    outer_wall_lower:          [43,  6, 1, 7],

    // 4. 中庭错层偏阁 (y=7..10) & 观星东翼 & 正阳皇城门 (y=9..11)
    gate_2:                    [18,  7, 3, 5],
    entrance_watch_loft:       [10,  7, 2, 2],
    clock_save:                [38,  7, 1, 1],
    secret_thunder_vault:      [42,  7, 1, 1],
    outer_wall_battlement:     [47,  7, 2, 2],
    hall_bell_tower:           [26,  8, 2, 2],
    observatory_bridge:        [35,  8, 5, 1],
    observatory_pavilion:      [40,  8, 1, 1],
    secret_sword_tomb:         [41,  8, 1, 1],
    clock_east_bastion:        [42,  8, 1, 1],
    outer_wall_telescope:      [44,  8, 2, 1],
    outer_wall_save:           [46,  8, 1, 1],
    clock_pendulum_vault:      [37,  9, 2, 2],
    entrance_battlement_tower: [ 7,  9, 6, 1],
    entrance_imperial_plaza:   [13,  9, 4, 3],
    east_warp:                 [35, 10, 1, 1],
    cliff_pine_trail:          [ 3, 10, 3, 1],
    bridge_save:               [ 8, 10, 1, 1],
    gate_1:                    [ 9, 10, 4, 2],
    entrance_guard_pavilion:   [17, 10, 1, 1],
    outer_city_warp:           [21, 10, 1, 1],
    central_warp:              [23, 10, 1, 1],
    hall_west_gallery:         [25, 10, 3, 1],
    hall_corridor:             [28, 10, 4, 2],
    bamboo_outpost:            [ 2, 11, 1, 1],
    entrance_bamboo_woods:     [ 3, 11, 6, 1],
    entrance_mid_save:         [17, 11, 1, 1],
    gate_save:                 [21, 11, 1, 1],
    hall_courtyard:            [22, 11, 6, 1],
    hall_save:                 [32, 11, 1, 1],
    hall_east_vestibule:       [33, 11, 1, 1],

    // 5. 地宫上脉 + 巨型铸剑/寒潭/沉舰大殿 (y=12..14)
    sunken_ferry_shaft:        [ 3, 12, 1, 4],
    bamboo_cliff_grotto:       [ 4, 12, 2, 1],
    moat_west_tunnel:          [ 6, 12, 6, 1],
    entrance_moat_cavern:      [12, 12, 2, 1],
    forge_moat_sluice:         [14, 12, 1, 1],
    forge_slag_bridge:         [15, 12, 1, 1],
    forge_molten_hall:         [16, 12, 2, 1],
    forge_smithy:              [18, 12, 1, 1],
    forge_antechamber:         [19, 12, 1, 1],
    central_underpass:         [20, 12, 5, 1],
    imperial_aqueduct_west:    [25, 12, 4, 1],
    imperial_aqueduct_east:    [29, 12, 4, 1],
    prison_save:               [33, 12, 1, 1],
    dock_sluice_passage:       [35, 12, 4, 1],
    dock_shipyard_hall:        [39, 12, 4, 3],
    dock_east_beacon:          [44, 12, 3, 1],
    sunken_reed_wharf:         [ 4, 13, 4, 1],
    sunken_water_shrine:       [ 8, 13, 1, 1],
    sunken_sluice_cavern:      [ 9, 13, 2, 1],
    forge_boss_arena:          [11, 13, 5, 2],
    forge_prison_conduit:      [16, 13, 3, 1],
    prison_sluice_entry:       [19, 13, 2, 1],
    prison_waterway:           [21, 13, 6, 1],
    prison_cellblock:          [27, 13, 1, 1],
    prison_boss_hall:          [28, 13, 5, 2],
    relic_mist_vault:          [33, 13, 1, 1],
    secret_ice_spring:         [34, 13, 1, 1],
    dock_flooded_hold:         [35, 13, 4, 1],
    forge_save:                [16, 14, 1, 1],
    prison_pre_save:           [27, 14, 1, 1],
    abyss_ascension_shaft:     [34, 14, 1, 6],

    // 6. 古矿脉 / 九幽帝陵 / 潜渊双层海道 (y=15..19 错落起伏！)
    mine_vertical_pit:         [ 4, 15, 1, 6],
    mine_timber_gallery:       [ 5, 15, 5, 1],
    mine_crystal_cavern:       [10, 15, 2, 1],
    relic_ground_slam:         [12, 15, 1, 1],
    secret_forge_smeltery:     [13, 15, 1, 1],
    forge_catacomb_tunnel:     [14, 15, 6, 1],
    secret_catacomb_treasury:  [20, 15, 1, 1],
    catacomb_west_crypt:       [21, 15, 1, 1],
    catacomb_entry:            [22, 15, 1, 1],
    catacomb_save:             [23, 15, 1, 1],
    catacomb_hall:             [24, 15, 5, 2],
    catacomb_shrine:           [29, 15, 2, 1],
    catacomb_prison_vault:     [31, 15, 3, 1],
    dock_underwater_tunnel:    [35, 15, 5, 2],
    dock_coral_grotto:         [40, 16, 4, 1],
    mine_shaft_pocket:         [ 7, 16, 2, 2],
    catacomb_burial_niche:     [17, 16, 2, 1],
    dock_save:                 [43, 17, 1, 1],
    mine_warp:                 [ 3, 17, 1, 1],
    abyss_rib_vault:           [29, 18, 2, 2],
    abyss_fossil_alcove:       [18, 19, 2, 1],

    // 7. 极渊上脉：深矿脉 / 镇龙渊 / 双层归墟海沟 (y=20..22)
    mine_secret_geode:         [ 3, 20, 1, 1],
    mine_deep_vein:            [ 5, 20, 6, 1],
    mine_lava_bridge:          [11, 20, 5, 1],
    abyss_dragon_vein_west:    [16, 20, 6, 1],
    abyss_sanctum_save:        [22, 20, 1, 1],
    abyss_dragon_spine:        [23, 20, 7, 1],
    abyss_east_corridor:       [30, 20, 5, 1],
    dock_abyss_trench:         [35, 20, 4, 2],
    dock_treasure_vault:       [39, 21, 4, 1],
    dock_warp:                 [38, 22, 1, 1],

    // 8. 左下深熔岩矿翼 & 右下归墟沉舰礁翼 & 中央九幽忘川冥府 (y=21..29)
    mine_magma_shaft:          [ 6, 21, 1, 7],
    mine_smelter_vault:        [ 4, 22, 2, 2],
    mine_ember_grotto:         [ 7, 23, 3, 1],
    mine_obsidian_hall:        [ 3, 25, 3, 2],
    mine_basalt_spur:          [ 0, 26, 3, 1],
    mine_deep_reliquary:       [ 7, 26, 2, 2],

    nether_west_descent:       [14, 21, 1, 8],
    nether_east_descent:       [30, 21, 1, 8],
    nether_wisp_belfry:        [25, 21, 2, 2],
    nether_weeping_hall:       [12, 22, 2, 2],
    nether_ferry_loft:         [17, 22, 2, 1],
    nether_soul_bridge:        [15, 23, 7, 1],
    nether_ferry_save:         [22, 23, 1, 1],
    nether_lantern_avenue:     [23, 23, 7, 1],
    nether_pillar_hall:        [15, 25, 5, 1],
    nether_trial_colosseum:    [20, 24, 5, 2],
    nether_mirror_crypt:       [25, 25, 5, 1],
    nether_east_ossuary:       [31, 25, 5, 1],
    nether_ancient_stele_room: [36, 25, 2, 2],
    nether_mirror_cellar:      [26, 26, 2, 1],
    nether_bone_vault:         [32, 26, 2, 2],
    dragon_west_belfry:        [11, 27, 2, 2],
    dragon_tomb_save:          [19, 28, 1, 1],
    dragon_tomb_heart:         [20, 28, 5, 2],
    dragon_tomb_warp:          [25, 28, 1, 1],
    dragon_west_crypt:         [11, 29, 3, 1],
    dragon_tomb_west:          [14, 29, 6, 1],
    dragon_tomb_sanctuary:     [25, 29, 6, 1],
    dragon_east_annex:         [31, 29, 3, 1],

    dock_reef_descent:         [43, 21, 1, 7],
    dock_sunken_galleon:       [44, 22, 3, 2],
    dock_barnacle_crypt:       [41, 23, 2, 1],
    dock_leviathan_rib:        [44, 25, 4, 1],
    dock_abyssal_prow:         [48, 25, 3, 2],
    dock_pearl_grotto:         [41, 26, 2, 2],
    dock_trench_lantern:       [51, 26, 3, 1],
  };

  const baseRooms: BuiltRoom[] = [
    ...coreRooms,
    ...expandedRooms,
    ...entranceStageRooms,
    ...allStagesExpandedRooms,
    ...interlockingRooms,
    ...sotnWingsPart1,
    ...sotnWingsPart2,
    ...silhouetteExpansionRooms,
  ].map((rm) => {
    const geom = DISPERSED_WORLD_LAYOUT[rm.id];
    const extra = roomHazardLayouts[rm.id];
    const waterZones = dryNonWaterRoomIds.has(rm.id) ? [] : rm.waterZones;
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
      mapX: geom ? geom[0] : rm.mapX,
      mapY: geom ? geom[1] : rm.mapY,
      gridW: geom ? geom[2] : rm.gridW,
      gridH: geom ? geom[3] : rm.gridH,
      waterZones,
      pavilions,
      lanterns,
      ceilingSpans,
      ambushSeal: ambushRoomIds.has(rm.id),
      hazards: extra?.hazards ? [...(rm.hazards || []), ...extra.hazards] : rm.hazards,
      crumbleSlabs: extra?.crumbleSlabs ?? rm.crumbleSlabs,
    };
  });

  return applyDispersedWorldLayout(baseRooms)
    .map(widenRoomToDispersedWidth)
    .map(enrichRegionalEnemySpawns)
    .map(thinCrowdedRoomInteriors)
    .map(sanitizeRoomDecorAndSpawns);
}

const FLYING_ENEMY_KINDS = new Set<EnemyKind>([
  'spirit_crow',
  'lantern_ghost',
  'scroll_demon',
  'bell_gargoyle',
  'guixu_water_fiend',
  'wuchang_reaper',
  'drowned_corpse_bride',
  'opera_sleeve_siren',
  'bronze_gear_wisp',
  'celestial_sentinel',
]);

interface RegionEcology {
  ground: readonly EnemyKind[];
  air: readonly EnemyKind[];
}

const REGION_ENEMY_ECOLOGY: Record<Exclude<RegionId, 'gatehouse'>, RegionEcology> = {
  main_hall: {
    ground: ['taoist_talisman_priest', 'jinwu_mace_guard', 'bronze_guard', 'taoist_talisman_priest'],
    air: ['lantern_ghost', 'scroll_demon', 'celestial_sentinel'],
  },
  alchemy: {
    ground: ['alchemy_homunculus', 'taoist_talisman_priest', 'alchemy_homunculus', 'plague_toad'],
    air: ['lantern_ghost', 'scroll_demon'],
  },
  colosseum: {
    ground: ['jinwu_mace_guard', 'shenji_musketeer', 'clockwork_mantis', 'terracotta_halberdier'],
    air: ['bell_gargoyle', 'celestial_sentinel'],
  },
  forge: {
    ground: ['magma_crucible_golem', 'mine_pickaxe_ghoul', 'alchemy_homunculus', 'jinwu_mace_guard'],
    air: ['lantern_ghost'],
  },
  prison: {
    ground: ['frost_chain_jailer', 'mine_pickaxe_ghoul', 'armored_tortoise', 'frost_chain_jailer'],
    air: ['drowned_corpse_bride', 'guixu_water_fiend'],
  },
  shipyard: {
    ground: ['armored_tortoise', 'frost_chain_jailer', 'shenji_musketeer', 'mine_pickaxe_ghoul'],
    air: ['guixu_water_fiend', 'drowned_corpse_bride'],
  },
  catacomb: {
    ground: ['terracotta_halberdier', 'mine_pickaxe_ghoul', 'bixie_stone_beast', 'bone_archer', 'corpse_soldier'],
    air: ['wuchang_reaper', 'drowned_corpse_bride'],
  },
  nether: {
    ground: ['terracotta_halberdier', 'bixie_stone_beast', 'magma_crucible_golem', 'armored_tortoise'],
    air: ['wuchang_reaper', 'drowned_corpse_bride', 'celestial_sentinel'],
  },
  library: {
    ground: ['ink_brush_scholar', 'paper_swordsman', 'taoist_talisman_priest', 'ink_brush_scholar'],
    air: ['scroll_demon', 'opera_sleeve_siren', 'lantern_ghost'],
  },
  opera: {
    ground: ['opera_puppet', 'ink_brush_scholar', 'taoist_talisman_priest', 'opera_puppet'],
    air: ['opera_sleeve_siren', 'lantern_ghost'],
  },
  clock_tower: {
    ground: ['clockwork_mantis', 'shenji_musketeer', 'clockwork_mantis', 'terracotta_halberdier'],
    air: ['bronze_gear_wisp', 'bell_gargoyle'],
  },
  altar: {
    ground: ['taoist_talisman_priest', 'jinwu_mace_guard', 'bronze_guard', 'clockwork_mantis'],
    air: ['celestial_sentinel', 'bronze_gear_wisp', 'celestial_sentinel', 'bell_gargoyle'],
  },
};

function hashRoomId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function enrichRegionalEnemySpawns(rm: BuiltRoom): BuiltRoom {
  if (rm.special === 'boss_room' || rm.region === 'gatehouse' || rm.spawns.length === 0) {
    return rm;
  }
  const eco = REGION_ENEMY_ECOLOGY[rm.region];
  const baseSeed = hashRoomId(rm.id);
  let groundIdx = baseSeed;
  let airIdx = baseSeed;

  const spawns = rm.spawns.map((sp) => {
    if (sp.kind.startsWith('boss_')) return sp;
    if (FLYING_ENEMY_KINDS.has(sp.kind)) {
      const kind = eco.air[airIdx % eco.air.length];
      airIdx++;
      return { ...sp, kind };
    }
    const kind = eco.ground[groundIdx % eco.ground.length];
    groundIdx++;
    return { ...sp, kind };
  });

  return { ...rm, spawns };
}

function sanitizeRoomDecorAndSpawns(rm: BuiltRoom): BuiltRoom {
  const bridge = getArchBridgeGeometry(rm);

  // 1. 清理顶井洞口下方 y < 105 的冗余“堵洞石板”：凡下方已有 y <= 238 跳台可单跳/二段跳直穿顶井，即移除洞口遮挡砖，保证下坠顺畅、井口通透！
  let cleanSolids = rm.solidBlocks ? [...rm.solidBlocks] : undefined;
  if (cleanSolids && rm.shafts.some((sh) => sh.dir === 'up')) {
    cleanSolids = cleanSolids.filter((sb) => {
      if (sb.blocking || sb.y >= 105) return true;
      for (const sh of rm.shafts) {
        if (sh.dir !== 'up') continue;
        const plugsMouth = sb.x <= sh.x1 + 30 && sb.x + sb.w >= sh.x2 - 30;
        if (!plugsMouth) continue;
        const hasLowerStep = cleanSolids!.some(
          (other) =>
            other !== sb &&
            other.y >= 115 &&
            other.y <= 240 &&
            other.x + other.w >= sh.x1 - 155 &&
            other.x <= sh.x2 + 155
        );
        if (hasLowerStep) return false;
      }
      return true;
    });
  }

  const workRm: BuiltRoom = { ...rm, solidBlocks: cleanSolids };

  const isXInsideOpenLiquid = (x: number, surfY: number): boolean => {
    if (bridge && x >= bridge.drawX && x <= bridge.drawX + bridge.drawW) return false;
    for (const wz of workRm.waterZones) {
      if (x >= wz.x1 - 22 && x <= wz.x2 + 22 && surfY >= wz.surfaceY - 8) {
        return true;
      }
    }
    return false;
  };

  const isXNearKeyAnchor = (x: number, padShrine = 86, padStele = 70): boolean => {
    if (
      (workRm.special === 'save_shrine' || workRm.special === 'warp_bagua') &&
      Math.abs(x - workRm.focalX) < padShrine
    ) {
      return true;
    }
    if (workRm.ironGate && Math.abs(x - workRm.ironGate.x) < 68) return true;
    if (workRm.steles?.some((st) => Math.abs(x - st.x) < padStele)) return true;
    if (workRm.npcs?.some((npc) => Math.abs(x - npc.x) < 70)) return true;
    return false;
  };

  const hasClearanceAt = (kind: CastleDecorKind, x: number, y: number): boolean => {
    if (x < 90 || x > workRm.pixelW - 90) return false;
    if (isInsideDownShaft(workRm, x)) return false;
    if (isXInsideOpenLiquid(x, y)) return false;
    if (isXNearKeyAnchor(x, 88, 70)) return false;

    const estH =
      kind === 'coiled_pillar'
        ? 190
        : kind === 'bookshelf'
          ? 132
          : kind === 'dragon_brazier'
            ? 128
            : kind === 'guardian_statue'
              ? 116
              : 86;
    for (const pv of workRm.pavilions) {
      if (x >= pv.x - 24 && x <= pv.x + pv.w + 24 && pv.y < y - 8 && y - pv.y < estH + 14) {
        return false;
      }
    }
    for (const sb of workRm.solidBlocks || []) {
      if (x >= sb.x - 20 && x <= sb.x + sb.w + 20 && sb.y < y - 8 && y - sb.y < estH + 10) {
        return false;
      }
    }
    return true;
  };

  // 2. 净化落地陈设（火盆、石兽、盘龙柱、书架、兵器架）：严禁落水、悬空于竖井、露天悬钟、贴门或叠压残碑/古祠！
  const cleanDecor: CastleDecorProp[] = [];
  const rawDecor = (workRm.decorProps || []).map((dp) =>
    !workRm.indoor && workRm.ceilingSpans.length === 0 && dp.kind === 'giant_bell'
      ? { kind: 'dragon_brazier' as const, x: dp.x, y: sampleSolidGroundY(workRm, dp.x), scale: 0.92 }
      : dp
  );
  for (const dp of rawDecor) {
    if (dp.kind === 'chandelier' || dp.kind === 'silk_banner' || dp.kind === 'giant_bell') {
      cleanDecor.push(dp);
      continue;
    }
    const baseSurfY = sampleEntitySurfaceY(workRm, dp.x, dp.y - 16);
    const overlapsChosen = (cx: number, cy: number) =>
      cleanDecor.some(
        (o) =>
          o.kind !== 'chandelier' &&
          o.kind !== 'silk_banner' &&
          o.kind !== 'giant_bell' &&
          Math.abs(o.x - cx) < 82 &&
          Math.abs(o.y - cy) < 60
      );

    if (hasClearanceAt(dp.kind, dp.x, baseSurfY) && !overlapsChosen(dp.x, baseSurfY)) {
      cleanDecor.push({ ...dp, y: baseSurfY });
      continue;
    }
    let relocated: CastleDecorProp | null = null;
    for (const off of [-115, 115, -195, 195, -285, 285, -380, 380]) {
      const nx = dp.x + off;
      if (nx < 90 || nx > workRm.pixelW - 90) continue;
      const ny = sampleEntitySurfaceY(workRm, nx, dp.y - 24);
      if (ny > workRm.pixelH) continue;
      if (Math.abs(ny - baseSurfY) <= 46 && hasClearanceAt(dp.kind, nx, ny) && !overlapsChosen(nx, ny)) {
        relocated = { ...dp, x: nx, y: ny };
        break;
      }
    }
    if (relocated) {
      cleanDecor.push(relocated);
    }
  }

  // 3. 净化可破坏青石宫灯柱与青瓷酒瓮 (`torches`)：杜绝悬空于竖井坑洞、泡在水中或与火盆/古祠/残碑重叠！
  const cleanTorches: { x: number; y: number }[] = [];
  const validGroundTorchX = (tx: number, ty: number): boolean => {
    if (tx < 88 || tx > workRm.pixelW - 88) return false;
    if (isInsideDownShaft(workRm, tx)) return false;
    const gy = sampleSolidGroundY(workRm, tx);
    if (isXInsideOpenLiquid(tx, gy)) return false;
    if (isXNearKeyAnchor(tx, 80, 64)) return false;
    if (
      cleanDecor.some(
        (dp) =>
          dp.kind !== 'chandelier' &&
          dp.kind !== 'silk_banner' &&
          dp.kind !== 'giant_bell' &&
          Math.abs(dp.x - tx) < 64
      )
    ) {
      return false;
    }
    if (cleanTorches.some((o) => Math.abs(o.x - tx) < 76 && Math.abs(o.y - ty) < 80)) {
      return false;
    }
    return true;
  };

  for (const tc of workRm.torches) {
    const gy = sampleSolidGroundY(workRm, tc.x);
    const isHanging = gy - tc.y > 135;
    if (isHanging) {
      cleanTorches.push(tc);
      continue;
    }
    if (validGroundTorchX(tc.x, tc.y)) {
      cleanTorches.push(tc);
      continue;
    }
    for (const off of [-95, 95, -170, 170, -255, 255, -340, 340]) {
      const nx = tc.x + off;
      if (nx < 88 || nx > workRm.pixelW - 88) continue;
      const ngy = sampleSolidGroundY(workRm, nx);
      const nty = ngy - 74;
      if (validGroundTorchX(nx, nty)) {
        cleanTorches.push({ x: nx, y: nty });
        break;
      }
    }
  }

  // 4. 校准机关、龟裂石板与拾取物高度：防止拓宽后地刺/火井/风道/丹药浮空或与实心踏石重叠
  const cleanHazards = workRm.hazards?.map((hz) => {
    if (hz.kind !== 'spikes' && hz.kind !== 'fire_vent' && hz.kind !== 'updraft') return hz;
    const refX = hz.kind === 'spikes' ? hz.x + hz.span * 0.5 : hz.x;
    const onPlat = (workRm.solidBlocks || []).some(
      (sb) => hz.x >= sb.x - 12 && hz.x <= sb.x + sb.w + 12 && Math.abs(hz.y - sb.y) <= 18
    );
    if (onPlat) return hz;
    const gy = Math.round(sampleSolidGroundY(workRm, refX));
    return Math.abs(hz.y - gy) > 22 ? { ...hz, y: gy } : hz;
  });

  const cleanCrumbles = workRm.crumbleSlabs?.filter(
    (cs) =>
      !(workRm.solidBlocks || []).some(
        (sb) => cs.x < sb.x + sb.w - 6 && cs.x + cs.w > sb.x + 6 && Math.abs(cs.y - sb.y) < 24
      )
  );

  const cleanPickups = workRm.pickups.map((pk) => {
    if (typeof pk.y !== 'number') return pk;
    const onPlat =
      (workRm.solidBlocks || []).some(
        (sb) => pk.x >= sb.x - 18 && pk.x <= sb.x + sb.w + 18 && Math.abs(pk.y! - sb.y) <= 28
      ) ||
      workRm.pavilions.some(
        (pv) => pk.x >= pv.x - 18 && pk.x <= pv.x + pv.w + 18 && Math.abs(pk.y! - pv.y) <= 28
      );
    if (onPlat) return pk;
    const gy = Math.round(sampleSolidGroundY(workRm, pk.x));
    return Math.abs(pk.y - gy) > 28 ? { ...pk, y: gy } : pk;
  });

  return {
    ...workRm,
    hazards: cleanHazards,
    crumbleSlabs: cleanCrumbles,
    pickups: cleanPickups,
    decorProps: cleanDecor,
    torches: cleanTorches,
  };
}

/**
 * 对全城 155 座房间执行 49×28《恶魔城》树状枝蔓重构：
 * 1) 全 9 座古祠存档房与全 5 座乾坤传送阵彻底化为独立 1×1 悬臂死胡同耳室，红金双色标识一目了然；
 * 2) 剪除地宫三行玄石空洞及中庭/极渊冗余穿行井，将监狱通帝陵秘印移至寒潭大殿左岸乾地；
 * 3) 将全部 10 座首领决战大殿及万卷藏书阁、九转真火炉殿同步扩建为可实景上下攀跃的双层/三层巨殿；
 * 4) 按最终格子跨度真等比重建 15 座多层竖井/天梯与对应侧门/井口 X 轴对齐，严格保留 100% 能力锁。
 */
function applyDispersedWorldLayout(rooms: BuiltRoom[]): BuiltRoom[] {
  const cloned: BuiltRoom[] = rooms.map((r) => ({
    ...r,
    groundNodes: r.groundNodes.map((gn) => ({ ...gn })),
    shafts: r.shafts.map((sh) => ({ ...sh })),
    ceilingSpans: r.ceilingSpans.map((cs) => ({ ...cs })),
    pavilions: r.pavilions.map((pv) => ({ ...pv })),
    solidBlocks: r.solidBlocks ? r.solidBlocks.map((sb) => ({ ...sb })) : undefined,
    sideDoors: r.sideDoors ? r.sideDoors.map((sd) => ({ ...sd })) : undefined,
    movingPlatforms: r.movingPlatforms ? r.movingPlatforms.map((mp) => ({ ...mp })) : undefined,
    climbWalls: r.climbWalls ? r.climbWalls.map((cw) => ({ ...cw })) : undefined,
    hazards: r.hazards ? r.hazards.map((hz) => ({ ...hz })) : undefined,
    crumbleSlabs: r.crumbleSlabs ? r.crumbleSlabs.map((cs) => ({ ...cs })) : undefined,
    clockGears: r.clockGears ? r.clockGears.map((cg) => ({ ...cg })) : undefined,
    lanterns: r.lanterns.map((ln) => ({ ...ln })),
    decorProps: r.decorProps ? r.decorProps.map((dp) => ({ ...dp })) : undefined,
    torches: r.torches.map((tc) => ({ ...tc })),
    spawns: r.spawns.map((sp) => ({ ...sp })),
    pickups: r.pickups.map((pk) => ({ ...pk })),
    archways: r.archways.map((ar) => ({ ...ar })),
    foregrounds: r.foregrounds.map((fg) => ({ ...fg })),
  }));
  const byId = new Map<string, BuiltRoom>(cloned.map((r) => [r.id, r]));

  const widenInPlace = (id: string): BuiltRoom | undefined => {
    const cur = byId.get(id);
    if (!cur) return undefined;
    const widened = widenRoomToDispersedWidth(cur);
    byId.set(id, widened);
    return widened;
  };

  const dropShaft = (id: string, dir: 'up' | 'down', targetId: string) => {
    const rm = byId.get(id);
    if (!rm) return;
    rm.shafts = rm.shafts.filter((sh) => !(sh.dir === dir && sh.targetRoomId === targetId));
  };

  const syncCeilingsWithUpShafts = (
    id: string,
    defaultStyle: 'gate_tunnel' | 'palace_timber' | 'crypt_vault' = 'crypt_vault'
  ) => {
    const rm = byId.get(id);
    if (!rm) return;
    const upShafts = rm.shafts.filter((s) => s.dir === 'up').sort((a, b) => a.x1 - b.x1);
    if (upShafts.length === 0) {
      if (rm.ceilingSpans.length > 0) {
        rm.ceilingSpans = [
          {
            x1: 0,
            x2: rm.pixelW,
            bottomY: rm.ceilingSpans[0].bottomY,
            style: rm.ceilingSpans[0].style || defaultStyle,
          },
        ];
      }
      return;
    }
    if (rm.ceilingSpans.length === 0 && !rm.indoor) return;
    const style = rm.ceilingSpans[0]?.style || defaultStyle;
    const bottomY = rm.ceilingSpans[0]?.bottomY || 34;
    const spans: CeilingSpan[] = [];
    let curX = 0;
    for (const sh of upShafts) {
      if (sh.x1 > curX) spans.push({ x1: curX, x2: sh.x1, bottomY, style });
      curX = Math.max(curX, sh.x2);
    }
    if (curX < rm.pixelW) spans.push({ x1: curX, x2: rm.pixelW, bottomY, style });
    rm.ceilingSpans = spans;
  };

  const setSimpleSideDoors = (id: string, leftId: string | undefined, rightId: string | undefined) => {
    const rm = byId.get(id);
    if (!rm) return;
    rm.sideDoors = undefined;
    rm.leftRoomId = leftId;
    rm.rightRoomId = rightId;
    if (!leftId) {
      rm.leftDoorFloorY = undefined;
      rm.leftDoorSecretId = undefined;
    }
    if (!rightId) {
      rm.rightDoorFloorY = undefined;
      rm.rightDoorSecretId = undefined;
    }
  };

  const setColAlignedUpShaft = (
    id: string,
    targetId: string,
    x1: number,
    x2: number,
    defaultStyle: 'gate_tunnel' | 'palace_timber' | 'crypt_vault' = 'crypt_vault',
    stepXs?: [number, number, number]
  ) => {
    const rm = byId.get(id);
    if (!rm) return;
    rm.shafts = [...rm.shafts.filter((s) => !(s.dir === 'up' && s.targetRoomId === targetId)), { x1, x2, dir: 'up', targetRoomId: targetId }];
    syncCeilingsWithUpShafts(id, defaultStyle);
    const sx = stepXs ?? [
      Math.max(40, x1 - 75),
      Math.min(rm.pixelW - 220, Math.round((x1 + x2) * 0.5) - 65),
      Math.max(40, x1 - 15),
    ];
    rm.solidBlocks = [
      ...(rm.solidBlocks || []),
      { x: sx[0], y: 318, w: 165, h: 30 },
      { x: sx[1], y: 230, w: 165, h: 30 },
      { x: sx[2], y: 146, w: 165, h: 28 },
    ];
  };

  const upgradeRoomToGrandTwoStoryHall = (
    id: string,
    targetW: number,
    targetH: number,
    sideDoors: SideDoor[],
    opts?: {
      balconyLeft?: number;
      balconyRight?: number;
      balconyY?: number;
      stepGapY?: number;
      extraLeftSteps?: SolidBlock[];
      extraRightSteps?: SolidBlock[];
      extraShafts?: VerticalShaft[];
      extraPavilions?: PavilionPlatform[];
      keepExistingShafts?: boolean;
      shiftExistingShaftsByPad?: boolean;
    }
  ): BuiltRoom | undefined => {
    const foundRm = byId.get(id);
    if (!foundRm) return undefined;
    let rm: BuiltRoom = foundRm;
    if (rm.pixelW < targetW) {
      const oldW = rm.pixelW;
      rm = widenRoomToDispersedWidth({ ...rm, gridW: Math.max(rm.gridW, Math.round((targetW - 920) / 320)) });
      // 若仍不足 targetW 则再精确居中补齐
      if (rm.pixelW < targetW) {
        const pad = Math.round((targetW - rm.pixelW) * 0.5);
        const pw = rm.pixelW;
        const nw = pw + pad * 2;
        rm = {
          ...rm,
          pixelW: nw,
          focalX: rm.focalX + pad,
          groundNodes: rm.groundNodes.map((gn) => ({
            ...gn,
            x: gn.x <= 2 ? 0 : gn.x >= pw - 2 ? nw : gn.x + pad,
          })),
          ceilingSpans: rm.ceilingSpans.map((cs) => ({
            ...cs,
            x1: cs.x1 <= 2 ? 0 : cs.x1 + pad,
            x2: cs.x2 >= pw - 2 ? nw : cs.x2 + pad,
          })),
          shafts: rm.shafts.map((sh) => ({ ...sh, x1: sh.x1 + pad, x2: sh.x2 + pad })),
          solidBlocks: rm.solidBlocks?.map((sb) => ({
            ...sb,
            x: sb.x <= 4 ? 0 : sb.x + pad,
            w: sb.x <= 4 || sb.x + sb.w >= pw - 4 ? sb.w + pad : sb.w,
          })),
          ironGate: rm.ironGate ? { ...rm.ironGate, x: rm.ironGate.x + pad } : undefined,
          pavilions: rm.pavilions.map((pv) => ({ ...pv, x: pv.x + pad })),
          waterZones: rm.waterZones.map((wz) => ({
            ...wz,
            x1: wz.x1 <= 2 ? 0 : wz.x1 + pad,
            x2: wz.x2 >= pw - 2 ? nw : wz.x2 + pad,
          })),
          decorProps: rm.decorProps?.map((dp) => ({ ...dp, x: dp.x + pad })),
          torches: rm.torches.map((tc) => ({ ...tc, x: tc.x + pad })),
          lanterns: rm.lanterns.map((ln) => ({ ...ln, x: ln.x + pad })),
          npcs: rm.npcs.map((n) => ({ ...n, x: n.x + pad })),
          steles: rm.steles?.map((st) => ({ ...st, x: st.x + pad })),
          spawns: rm.spawns.map((sp) => ({ ...sp, x: sp.x + pad })),
          pickups: rm.pickups.map((pk) => ({ ...pk, x: pk.x + pad })),
        };
      } else if (oldW === rm.pixelW) {
        // noop
      }
    }

    const dy = targetH - rm.pixelH;
    rm.pixelH = targetH;
    rm.focalY = rm.focalY + dy;
    rm.groundNodes = rm.groundNodes.map((gn) => ({ ...gn, y: gn.y + dy }));
    rm.waterZones = rm.waterZones.map((wz) => ({ ...wz, surfaceY: wz.surfaceY + dy }));
    rm.pavilions = rm.pavilions.map((pv) => ({ ...pv, y: pv.y + dy }));
    rm.solidBlocks = (rm.solidBlocks || []).map((sb) => ({ ...sb, y: sb.y + dy }));
    rm.decorProps = rm.decorProps?.map((dp) =>
      dp.kind === 'chandelier' || dp.kind === 'silk_banner' || dp.kind === 'giant_bell'
        ? dp
        : { ...dp, y: dp.y + dy }
    );
    rm.torches = rm.torches.map((tc) => ({ ...tc, y: tc.y + dy }));
    rm.spawns = rm.spawns.map((sp) => ({
      ...sp,
      y: sp.y !== undefined ? sp.y + dy : undefined,
    }));
    rm.pickups = rm.pickups.map((pk) => ({
      ...pk,
      y: pk.y !== undefined ? pk.y + dy : undefined,
    }));
    rm.lanterns = rm.lanterns.map((ln) => ({ ...ln, y: ln.y + Math.round(dy * 0.5) }));
    rm.hazards = rm.hazards?.map((hz) =>
      hz.kind === 'pendulum' ? hz : { ...hz, y: hz.y + dy }
    );
    rm.crumbleSlabs = rm.crumbleSlabs?.map((cs) => ({ ...cs, y: cs.y + dy }));
    rm.movingPlatforms = rm.movingPlatforms?.map((mp) => ({ ...mp, y1: mp.y1 + dy, y2: mp.y2 + dy }));
    if (rm.ironGate) {
      rm.ironGate = { ...rm.ironGate, bottomY: rm.ironGate.bottomY + dy };
    }

    const balY = opts?.balconyY ?? 356;
    if (opts?.balconyLeft) {
      rm.solidBlocks.push({ x: 0, y: balY, w: opts.balconyLeft, h: 36 });
    }
    if (opts?.balconyRight) {
      rm.solidBlocks.push({ x: rm.pixelW - opts.balconyRight, y: balY, w: opts.balconyRight, h: 36 });
    }
    if (opts?.extraLeftSteps) rm.solidBlocks.push(...opts.extraLeftSteps);
    if (opts?.extraRightSteps) rm.solidBlocks.push(...opts.extraRightSteps);

    rm.sideDoors = sideDoors;
    rm.leftRoomId = undefined;
    rm.rightRoomId = undefined;
    rm.leftDoorSecretId = undefined;
    rm.rightDoorSecretId = undefined;

    if (!opts?.keepExistingShafts) {
      rm.shafts = opts?.extraShafts ? [...opts.extraShafts] : [];
      if (opts?.extraPavilions) {
        rm.pavilions = rm.pavilions.filter((pv) => pv.y < rm.focalY - 40);
      }
    } else if (opts?.extraShafts) {
      rm.shafts = [...rm.shafts, ...opts.extraShafts];
    }
    if (opts?.extraPavilions) {
      rm.pavilions.push(...opts.extraPavilions);
    }
    byId.set(id, rm);
    syncCeilingsWithUpShafts(id, rm.region === 'forge' || rm.region === 'prison' || rm.region === 'nether' ? 'crypt_vault' : 'palace_timber');
    return rm;
  };

  // 先预拓宽所有需要精确定位新竖井的平层主道与耳室（确保 pixelW 与后续 widenRoomToDispersedWidth 完全一致！）
  for (const wid of [
    'hall_courtyard',
    'central_underpass',
    'central_warp',
    'alchemy_lab',
    'alchemy_foyer',
    'catacomb_hall',
    'dock_coral_grotto',
    'dock_underwater_tunnel',
    'dock_save',
    'dock_warp',
    'entrance_bamboo_woods',
    'entrance_battlement_tower',
    'cliff_pine_trail',
    'hall_west_gallery',
    'library_automaton_loft',
    'opera_foyer',
    'observatory_bridge',
    'altar_forecourt',
    'mine_timber_gallery',
    'forge_catacomb_tunnel',
    'mine_deep_vein',
    'mine_lava_bridge',
    'abyss_dragon_vein_west',
    'abyss_dragon_spine',
    'abyss_east_corridor',
    'dock_abyss_trench',
    'dock_treasure_vault',
    'nether_soul_bridge',
    'nether_lantern_avenue',
    'nether_mirror_crypt',
    'nether_east_ossuary',
    'dragon_tomb_west',
    'dragon_tomb_sanctuary',
    'colosseum_east_armory',
    'forge_slag_bridge',
    'forge_antechamber',
    'relic_ground_slam',
    'relic_wall_vault',
  ]) {
    widenInPlace(wid);
  }

  // 1) 剪除西崖错层、三行地下岩隙(y=16..18)及极渊断层(y=20..25)冗余直通竖井
  dropShaft('cliff_hermit_shrine', 'down', 'cliff_pine_trail');
  const hermitShrine = byId.get('cliff_hermit_shrine');
  if (hermitShrine) {
    hermitShrine.pavilions = hermitShrine.pavilions.filter((pv) => Math.abs(pv.x - 904) > 25);
  }
  dropShaft('cliff_pine_trail', 'up', 'cliff_hermit_shrine');
  syncCeilingsWithUpShafts('cliff_pine_trail', 'gate_tunnel');
  const pineTrail = byId.get('cliff_pine_trail');
  if (pineTrail?.solidBlocks) {
    pineTrail.solidBlocks = pineTrail.solidBlocks.filter(
      (sb) => !(sb.x >= 860 && sb.x <= 1020 && sb.y <= 340)
    );
  }

  dropShaft('west_cliff_skybridge', 'down', 'entrance_battlement_tower');
  const cliffSkybridge = byId.get('west_cliff_skybridge');
  if (cliffSkybridge) {
    cliffSkybridge.pavilions = cliffSkybridge.pavilions.filter((pv) => Math.abs(pv.x - 554) > 25);
  }
  dropShaft('entrance_battlement_tower', 'up', 'west_cliff_skybridge');
  syncCeilingsWithUpShafts('entrance_battlement_tower', 'gate_tunnel');

  dropShaft('forge_catacomb_tunnel', 'down', 'abyss_dragon_vein_west');
  const forgeCatTun = byId.get('forge_catacomb_tunnel');
  if (forgeCatTun) {
    forgeCatTun.pavilions = forgeCatTun.pavilions.filter((pv) => pv.x < 1300);
  }
  dropShaft('abyss_dragon_vein_west', 'up', 'forge_catacomb_tunnel');
  syncCeilingsWithUpShafts('abyss_dragon_vein_west', 'crypt_vault');

  dropShaft('catacomb_shrine', 'down', 'abyss_dragon_spine');
  dropShaft('abyss_dragon_spine', 'up', 'catacomb_shrine');
  syncCeilingsWithUpShafts('abyss_dragon_spine', 'crypt_vault');

  dropShaft('dock_coral_grotto', 'down', 'dock_treasure_vault');
  const dockCoral = byId.get('dock_coral_grotto');
  if (dockCoral) {
    dockCoral.pavilions = dockCoral.pavilions.filter((pv) => pv.x > 1900 || pv.x < 1100);
  }
  dropShaft('dock_treasure_vault', 'up', 'dock_coral_grotto');
  syncCeilingsWithUpShafts('dock_treasure_vault', 'crypt_vault');

  dropShaft('prison_sluice_entry', 'down', 'catacomb_entry');
  dropShaft('catacomb_entry', 'up', 'prison_sluice_entry');
  syncCeilingsWithUpShafts('catacomb_entry', 'crypt_vault');

  dropShaft('abyss_dragon_spine', 'down', 'nether_lantern_avenue');
  dropShaft('nether_lantern_avenue', 'up', 'abyss_dragon_spine');
  syncCeilingsWithUpShafts('nether_lantern_avenue', 'crypt_vault');

  // 太古祖龙极渊西坛 / 东殿由黄泉东西双七层落渊竖井直下贯通（东井井口移至右岸 x=2510..2690 对齐 col 28）
  dropShaft('nether_pillar_hall', 'down', 'dragon_tomb_west');
  const pillarHall = byId.get('nether_pillar_hall');
  if (pillarHall) {
    pillarHall.pavilions = pillarHall.pavilions.filter((pv) => Math.abs(pv.x - 1854) > 25);
  }
  dropShaft('nether_east_ossuary', 'down', 'dragon_tomb_sanctuary');
  const netherEastOss = byId.get('nether_east_ossuary');
  if (netherEastOss) {
    netherEastOss.pavilions = netherEastOss.pavilions.filter((pv) => Math.abs(pv.x - 1054) > 25);
  }
  const tombWest = byId.get('dragon_tomb_west');
  if (tombWest) {
    tombWest.shafts = [{ x1: 160, x2: 340, dir: 'up', targetRoomId: 'nether_west_descent' }];
    syncCeilingsWithUpShafts('dragon_tomb_west', 'crypt_vault');
    tombWest.solidBlocks = [
      { x: 145, y: 318, w: 165, h: 30 },
      { x: 245, y: 222, w: 165, h: 28 },
      { x: 165, y: 126, w: 160, h: 26 },
      { x: 1580, y: 356, w: 240, h: 32 },
    ];
  }
  const tombSanc = byId.get('dragon_tomb_sanctuary');
  if (tombSanc) {
    // 2840px, cols 23..28, nEast at col 28 -> x=2600px [2510..2690]
    tombSanc.shafts = [{ x1: 2510, x2: 2690, dir: 'up', targetRoomId: 'nether_east_descent' }];
    syncCeilingsWithUpShafts('dragon_tomb_sanctuary', 'crypt_vault');
    tombSanc.solidBlocks = [
      { x: 2475, y: 324, w: 165, h: 30 },
      { x: 2575, y: 232, w: 165, h: 28 },
      { x: 2495, y: 138, w: 165, h: 26 },
    ];
  }

  // 2) 全 9 座古祠与全 5 座乾坤传送阵彻底化为独立 1×1 悬臂死胡同耳室（红金分明，零穿堂）
  // Save 1: altar_save (L off sky_altar@0)
  setSimpleSideDoors('altar_save', undefined, 'sky_altar');
  setSimpleSideDoors('altar_forecourt', 'cloud_star_gallery', 'sky_altar');

  // Save 2: opera_save (R off opera_boss_stage@0; opera_gallery -> opera_boss_stage)
  setSimpleSideDoors('opera_save', 'opera_boss_stage', undefined);
  const operaSave = byId.get('opera_save');
  if (operaSave) {
    operaSave.shafts = [];
    operaSave.pavilions = [];
    operaSave.focalX = 540;
  }
  setSimpleSideDoors('opera_moon_pavilion', 'opera_boss_stage', 'cloud_star_gallery');
  const opGal = byId.get('opera_gallery');
  if (opGal) {
    opGal.shafts = [{ x1: 735, x2: 915, dir: 'up', targetRoomId: 'opera_boss_stage' }];
    syncCeilingsWithUpShafts('opera_gallery', 'palace_timber');
    opGal.solidBlocks = [
      { x: 640, y: 312, w: 175, h: 32 },
      { x: 755, y: 224, w: 175, h: 30 },
      { x: 675, y: 140, w: 170, h: 28 },
    ];
  }

  // Save 3: alchemy_save (R off xiao_boss_hall@0; alchemy_lab -> xiao_boss_hall)
  setSimpleSideDoors('alchemy_save', 'xiao_boss_hall', undefined);
  const alchSave = byId.get('alchemy_save');
  if (alchSave) {
    alchSave.shafts = [];
    alchSave.pavilions = [];
    alchSave.focalX = 540;
  }
  const alchLab = byId.get('alchemy_lab');
  if (alchLab) {
    // 1880px, cols 12..14, xiao_boss_hall overlaps col 12 -> x=313px [223..403] (dry left shore!)
    alchLab.shafts = [{ x1: 223, x2: 403, dir: 'up', targetRoomId: 'xiao_boss_hall' }];
    syncCeilingsWithUpShafts('alchemy_lab', 'palace_timber');
    alchLab.solidBlocks = [
      { x: 165, y: 332, w: 185, h: 32 },
      { x: 265, y: 244, w: 185, h: 32 },
      { x: 195, y: 156, w: 185, h: 30 },
      { x: 1080, y: 168, w: 220, h: 34 },
    ];
    alchLab.pickups = alchLab.pickups.map((pk) => ({ ...pk, x: 1185, y: 168 }));
  }

  // Save 4: clock_save (L off clock_boss_spire@1)
  setSimpleSideDoors('clock_save', undefined, 'clock_boss_spire');
  setSimpleSideDoors('clock_bell_gallery', 'clock_gear_hall', 'clock_boss_spire');

  // Save 5: bridge_save (L off gate_1@0)
  setSimpleSideDoors('bridge_save', undefined, 'gate_1');
  setSimpleSideDoors('entrance_bamboo_woods', 'bamboo_outpost', 'gate_1');

  // Save 6: forge_save (R off forge_boss_arena@1; forge_slag_bridge -> forge_boss_arena)
  setSimpleSideDoors('forge_save', 'forge_boss_arena', undefined);
  const forgeSave = byId.get('forge_save');
  if (forgeSave) {
    forgeSave.shafts = [];
    syncCeilingsWithUpShafts('forge_save', 'crypt_vault');
    forgeSave.solidBlocks = [];
    forgeSave.focalX = 540;
  }
  setSimpleSideDoors('forge_prison_conduit', 'forge_boss_arena', 'prison_sluice_entry');
  const slagBridge = byId.get('forge_slag_bridge');
  if (slagBridge) {
    slagBridge.shafts = [{ x1: 450, x2: 630, dir: 'down', targetRoomId: 'forge_boss_arena' }];
    slagBridge.pavilions = [{ x: 444, y: 408, w: 192, hasPillars: false }];
  }

  // Save 7: prison_pre_save (L off prison_boss_hall@1)
  setSimpleSideDoors('prison_pre_save', undefined, 'prison_boss_hall');
  setSimpleSideDoors('prison_cellblock', 'prison_waterway', 'prison_boss_hall');

  // Save 8: dock_save (DOWN below dock_coral_grotto dry right shore)
  const dockSave = byId.get('dock_save');
  if (dockSave) {
    dockSave.sideDoors = undefined;
    dockSave.leftRoomId = undefined;
    dockSave.rightRoomId = undefined;
    dockSave.focalX = 240;
    setColAlignedUpShaft('dock_save', 'dock_coral_grotto', 450, 630, 'crypt_vault', [260, 410, 480]);
  }
  setSimpleSideDoors('dock_underwater_tunnel', 'abyss_ascension_shaft', 'dock_coral_grotto');
  setSimpleSideDoors('dock_coral_grotto', 'dock_underwater_tunnel', undefined);
  const dockCoralNew = byId.get('dock_coral_grotto');
  if (dockCoralNew) {
    // 2200px, cols 40..43, dock_save at col 43 -> 87.5% = 1925px [1835..2015] (dry right shore > water 1700!)
    dockCoralNew.shafts = [{ x1: 1835, x2: 2015, dir: 'down', targetRoomId: 'dock_save' }];
    dockCoralNew.pavilions.push({ x: 1829, y: 412, w: 192, hasPillars: false });
  }

  // Save 9: dragon_tomb_save (L off dragon_tomb_heart@0) & 延展太古西陵龙室
  setSimpleSideDoors('dragon_tomb_save', undefined, 'dragon_tomb_heart');
  setSimpleSideDoors('dragon_tomb_west', 'dragon_west_crypt', 'dragon_tomb_heart');

  // Warp 1: central_warp (UP pocket above hall_courtyard@21, keeping hall_courtyard -> central_underpass right of gate!)
  const centralWarp = byId.get('central_warp');
  if (centralWarp) {
    centralWarp.sideDoors = undefined;
    centralWarp.leftRoomId = undefined;
    centralWarp.rightRoomId = undefined;
    centralWarp.focalX = 240;
    centralWarp.shafts = [{ x1: 450, x2: 630, dir: 'down', targetRoomId: 'hall_courtyard' }];
    centralWarp.solidBlocks = [];
    centralWarp.pavilions = [{ x: 444, y: 396, w: 192, hasPillars: false }];
    syncCeilingsWithUpShafts('central_warp', 'palace_timber');
  }
  setSimpleSideDoors('central_underpass', 'forge_antechamber', 'imperial_aqueduct_west');
  setSimpleSideDoors('imperial_aqueduct_west', 'central_underpass', 'imperial_aqueduct_east');
  const centUnder = byId.get('central_underpass');
  if (centUnder) {
    // 2520px, cols 18..22, hall_courtyard overlaps col 22 -> 90% = 2268px (strictly RIGHT of lever gate@1240!)
    setColAlignedUpShaft('central_underpass', 'hall_courtyard', 2178, 2358, 'crypt_vault', [1980, 2120, 2210]);
  }
  const hallYard = byId.get('hall_courtyard');
  if (hallYard) {
    // 2840px, cols 20..25:
    // - col 21 -> central_warp UP (25% = 710px [620..800], single-jump stairs for Stage 0!)
    // - col 22 -> central_underpass DOWN (41.7% = 1183px [1093..1273])
    // - col 24 -> hall_west_gallery UP (75% = 2130px [2040..2220], single high platform y=212 -> double_jump!)
    hallYard.shafts = [
      { x1: 620, x2: 800, dir: 'up', targetRoomId: 'central_warp' },
      { x1: 1093, x2: 1273, dir: 'down', targetRoomId: 'central_underpass' },
      { x1: 2040, x2: 2220, dir: 'up', targetRoomId: 'hall_west_gallery' },
    ];
    syncCeilingsWithUpShafts('hall_courtyard', 'palace_timber');
    hallYard.pavilions = [{ x: 1087, y: 404, w: 192, hasPillars: false }];
    hallYard.solidBlocks = [
      { x: 520, y: 318, w: 165, h: 30 },
      { x: 640, y: 232, w: 165, h: 30 },
      { x: 560, y: 146, w: 165, h: 28 },
      { x: 2030, y: 212, w: 200, h: 30 },
    ];
  }

  // Warp 2: east_warp (R off east_outer_tower@7 in open sea-cliff void)
  setSimpleSideDoors('east_warp', 'east_outer_tower', undefined);
  setSimpleSideDoors('observatory_bridge', 'east_outer_tower', 'observatory_pavilion');

  // Warp 3: mine_warp (L off mine_vertical_pit@2)
  setSimpleSideDoors('mine_warp', undefined, 'mine_vertical_pit');
  setSimpleSideDoors('mine_deep_vein', 'mine_vertical_pit', 'mine_lava_bridge');
  setSimpleSideDoors('mine_lava_bridge', 'mine_deep_vein', 'abyss_dragon_vein_west');

  // Warp 4: dock_warp (DOWN below dock_abyss_trench dry right shore) & 东接归墟海礁深井
  const dockWarp = byId.get('dock_warp');
  if (dockWarp) {
    dockWarp.sideDoors = undefined;
    dockWarp.leftRoomId = undefined;
    dockWarp.rightRoomId = undefined;
    dockWarp.focalX = 240;
    setColAlignedUpShaft('dock_warp', 'dock_abyss_trench', 450, 630, 'crypt_vault', [260, 410, 480]);
  }
  setSimpleSideDoors('dock_treasure_vault', 'dock_abyss_trench', 'dock_reef_descent');

  // Warp 5: dragon_tomb_warp (R off dragon_tomb_heart@0) & 东接东陵祖龙祀廊
  setSimpleSideDoors('dragon_tomb_warp', 'dragon_tomb_heart', undefined);
  setSimpleSideDoors('dragon_tomb_sanctuary', 'dragon_tomb_heart', 'dragon_east_annex');

  // 3) 对齐全城其余单层室垂直井道列坐标，杜绝穿墙错位与水中竖井
  const entWoods = byId.get('entrance_bamboo_woods');
  if (entWoods) {
    // 2840px, cols 1..6: cliff_pine_trail [1..3] col 3 = 1183, bamboo_cliff_grotto [2..3] col 2 = 710
    entWoods.shafts = [
      { x1: 620, x2: 800, dir: 'down', targetRoomId: 'bamboo_cliff_grotto', sealId: 'seal_bamboo_grotto' },
      { x1: 1093, x2: 1273, dir: 'up', targetRoomId: 'cliff_pine_trail' },
    ];
    entWoods.pavilions = [{ x: 614, y: 404, w: 192, hasPillars: false }];
    entWoods.solidBlocks = [
      { x: 1010, y: 316, w: 165, h: 30 },
      { x: 1120, y: 230, w: 165, h: 30 },
      { x: 1040, y: 146, w: 160, h: 28 },
    ];
    const pineT = byId.get('cliff_pine_trail');
    if (pineT) {
      pineT.shafts = [{ x1: 1477, x2: 1657, dir: 'down', targetRoomId: 'entrance_bamboo_woods' }];
      pineT.pavilions = [{ x: 1470, y: 404, w: 194, hasPillars: false }];
    }
    const grotto = byId.get('bamboo_cliff_grotto');
    if (grotto) {
      grotto.shafts = [{ x1: 310, x2: 490, dir: 'up', targetRoomId: 'entrance_bamboo_woods' }];
      syncCeilingsWithUpShafts('bamboo_cliff_grotto', 'crypt_vault');
      grotto.solidBlocks = (grotto.solidBlocks || []).map((sb) =>
        sb.y < 360 ? { ...sb, x: Math.max(200, Math.min(480, sb.x - 120)) } : sb
      );
      grotto.solidBlocks.push(
        { x: 240, y: 320, w: 165, h: 30 },
        { x: 320, y: 234, w: 165, h: 30 },
        { x: 270, y: 148, w: 160, h: 28 }
      );
    }
  }

  const moatCav = byId.get('entrance_moat_cavern');
  if (moatCav) {
    // 1600px, cols 10..11 -> col 11 dry right shore [1370..1530] aligns plaza@col 11 [310..490]
    moatCav.solidBlocks = (moatCav.solidBlocks || []).filter((sb) => !(sb.x === 1240 && sb.y === 328));
    setColAlignedUpShaft('entrance_moat_cavern', 'entrance_imperial_plaza', 1370, 1530, 'crypt_vault', [1190, 1340, 1390]);
  }
  const forgeAnte = byId.get('forge_antechamber');
  if (forgeAnte) {
    forgeAnte.shafts = [
      { x1: 450, x2: 630, dir: 'up', targetRoomId: 'gate_2' },
      { x1: 770, x2: 950, dir: 'down', targetRoomId: 'prison_sluice_entry', sealId: 'seal_forge_prison_shaft' },
    ];
    syncCeilingsWithUpShafts('forge_antechamber', 'crypt_vault');
    forgeAnte.pavilions = [{ x: 764, y: 408, w: 192, hasPillars: false }];
    forgeAnte.solidBlocks = [
      ...(forgeAnte.solidBlocks || []).filter((sb) => sb.y >= 340),
      { x: 350, y: 316, w: 165, h: 30 },
      { x: 460, y: 230, w: 165, h: 30 },
      { x: 390, y: 146, w: 160, h: 28 },
    ];
  }
  const prisSluice = byId.get('prison_sluice_entry');
  if (prisSluice) {
    // 1600px, cols 17..18 -> col 17.85 [600..780] sits right above stone bridge {460..680}
    prisSluice.shafts = [{ x1: 600, x2: 780, dir: 'up', targetRoomId: 'forge_antechamber' }];
    syncCeilingsWithUpShafts('prison_sluice_entry', 'crypt_vault');
    prisSluice.solidBlocks = [
      { x: 460, y: 344, w: 220, h: 104 },
      { x: 530, y: 256, w: 165, h: 30 },
      { x: 610, y: 170, w: 165, h: 28 },
    ];
  }
  const alchFoy = byId.get('alchemy_foyer');
  if (alchFoy) {
    // 1880px, cols 15..17: up alchemy_fire_sanctum@col16 = 940px, down gate_2@col17 = 1567px
    alchFoy.shafts = [
      { x1: 850, x2: 1030, dir: 'up', targetRoomId: 'alchemy_fire_sanctum' },
      { x1: 1477, x2: 1657, dir: 'down', targetRoomId: 'gate_2' },
    ];
    syncCeilingsWithUpShafts('alchemy_foyer', 'palace_timber');
    alchFoy.pavilions = [{ x: 1470, y: 424, w: 194, hasPillars: false }];
    alchFoy.solidBlocks = [{ x: 850, y: 236, w: 190, h: 30 }];
  }
  const opFoy = byId.get('opera_foyer');
  if (opFoy) {
    // 2200px, cols 27..30 -> down upper_library@col 30 = 1925px [1835..2015]
    opFoy.shafts = [{ x1: 1835, x2: 2015, dir: 'down', targetRoomId: 'upper_library' }];
    opFoy.pavilions = [{ x: 1829, y: 386, w: 194, hasPillars: false }];
  }
  const hallGal = byId.get('hall_west_gallery');
  if (hallGal) {
    // 1880px, cols 23..25 -> down hall_courtyard@col 24 = 940px [850..1030]
    hallGal.shafts = [{ x1: 850, x2: 1030, dir: 'down', targetRoomId: 'hall_courtyard' }];
    hallGal.pavilions = [{ x: 844, y: 404, w: 192, hasPillars: false }];
  }
  const colArm = byId.get('colosseum_east_armory');
  if (colArm) {
    // 1880px, cols 15..17 -> down library_automaton_loft@col 17.85 = 1710px [1620..1800]
    colArm.shafts = [{ x1: 1620, x2: 1800, dir: 'down', targetRoomId: 'library_automaton_loft' }];
    colArm.pavilions = [{ x: 1614, y: 408, w: 192, hasPillars: false }];
  }
  const libLoft = byId.get('library_automaton_loft');
  if (libLoft) {
    // 2200px, cols 17..20 -> col 17.85 = 470px [385..555], keep strictly RIGHT of gate_loft_lever@310!
    libLoft.ironGate = {
      id: 'gate_loft_lever',
      x: 310,
      topY: 0,
      bottomY: 408,
      gateKind: 'lever_shortcut',
      leverSide: 'right',
    };
    setColAlignedUpShaft('library_automaton_loft', 'colosseum_east_armory', 385, 555, 'palace_timber', [355, 425, 375]);
  }
  const altarFore = byId.get('altar_forecourt');
  if (altarFore) {
    // 2840px, cols 31..36 -> down altar_vestibule@col35 = 1990px [1900..2080], keep fox gate@2280 on right!
    altarFore.shafts = [{ x1: 1900, x2: 2080, dir: 'down', targetRoomId: 'altar_vestibule' }];
    altarFore.pavilions = [{ x: 1894, y: 404, w: 192, hasPillars: false }];
    if (altarFore.ironGate) altarFore.ironGate = { ...altarFore.ironGate, x: 2280 };
  }
  const mineLava = byId.get('mine_lava_bridge');
  if (mineLava) {
    // 2520px, cols 9..13 -> down nether_west_descent@col 12 = 1764px [1674..1854]
    mineLava.shafts = [
      { x1: 1674, x2: 1854, dir: 'down', targetRoomId: 'nether_west_descent', sealId: 'seal_mine_nether' },
    ];
  }
  const abyssEast = byId.get('abyss_east_corridor');
  if (abyssEast) {
    // 2520px, cols 28..32 -> down nether_east_descent@col 28 = 252px [162..342], up abyss_ascension_shaft@col 32 = 2268px [2178..2358]
    abyssEast.shafts = [
      { x1: 162, x2: 342, dir: 'down', targetRoomId: 'nether_east_descent', sealId: 'seal_abyss_nether_east' },
      { x1: 2178, x2: 2358, dir: 'up', targetRoomId: 'abyss_ascension_shaft' },
    ];
    syncCeilingsWithUpShafts('abyss_east_corridor', 'crypt_vault');
    abyssEast.pavilions = [{ x: 156, y: 416, w: 192, hasPillars: false }];
    abyssEast.solidBlocks = (abyssEast.solidBlocks || []).map((sb) =>
      sb.y < 340 ? { ...sb, x: sb.x + 410 } : sb
    );
  }
  // 3b) 为中上层与中下层平直长廊接驳上下错层偏殿与地火矿脉竖井
  const entBattlement = byId.get('entrance_battlement_tower');
  if (entBattlement) {
    // 2840px, cols 7..12 -> entrance_watch_loft [10..11] col 11.0 = 1893px [1800..1980]（右离拉杆门@970）
    setColAlignedUpShaft('entrance_battlement_tower', 'entrance_watch_loft', 1800, 1980, 'gate_tunnel', [1710, 1840, 1760]);
  }
  const hallGal2 = byId.get('hall_west_gallery');
  if (hallGal2) {
    // 1880px, cols 25..27 -> hall_bell_tower [26..27] col 27.22 = 1390px [1300..1480]
    setColAlignedUpShaft('hall_west_gallery', 'hall_bell_tower', 1300, 1480, 'palace_timber', [1210, 1340, 1260]);
  }
  const obsBridge = byId.get('observatory_bridge');
  if (obsBridge) {
    // 2520px, cols 35..39 -> clock_pendulum_vault [37..38] col 38.40 = 1713px [1623..1803]（右离高台@1040..1480）
    obsBridge.shafts = [...obsBridge.shafts, { x1: 1623, x2: 1803, dir: 'down', targetRoomId: 'clock_pendulum_vault' }];
    obsBridge.pavilions.push({ x: 1617, y: 412, w: 192, hasPillars: false });
  }
  const mineTim = byId.get('mine_timber_gallery');
  if (mineTim) {
    // 2520px, cols 5..9 -> mine_shaft_pocket [7..8] col 8.23 = 1628px [1540..1720]
    mineTim.shafts = [...mineTim.shafts, { x1: 1540, x2: 1720, dir: 'down', targetRoomId: 'mine_shaft_pocket' }];
    mineTim.pavilions.push({ x: 1534, y: 412, w: 192, hasPillars: false });
  }
  const forgeCat = byId.get('forge_catacomb_tunnel');
  if (forgeCat) {
    // 2840px, cols 14..19 -> catacomb_burial_niche [17..18] col 18.0 = 1893px [1800..1980]（右离 mist_only@1400 与岩浆@935..1275）
    forgeCat.shafts = [...forgeCat.shafts, { x1: 1800, x2: 1980, dir: 'down', targetRoomId: 'catacomb_burial_niche' }];
    forgeCat.pavilions.push({ x: 1794, y: 408, w: 192, hasPillars: false });
  }
  const abyssVeinW = byId.get('abyss_dragon_vein_west');
  if (abyssVeinW) {
    // 3000px, cols 16..21 -> abyss_fossil_alcove [18..19] col 19.68 = 1840px [1750..1930]（右离水面 740..1640）
    setColAlignedUpShaft('abyss_dragon_vein_west', 'abyss_fossil_alcove', 1750, 1930, 'crypt_vault', [1670, 1790, 1715]);
  }
  const abyssSp = byId.get('abyss_dragon_spine');
  if (abyssSp) {
    // 3800px, cols 23..29 -> abyss_rib_vault [29..30] col 29.50 = 3528px [3438..3618]（右离狐幻闸 3360，干岸！）
    setColAlignedUpShaft('abyss_dragon_spine', 'abyss_rib_vault', 3438, 3618, 'crypt_vault', [3390, 3490, 3440]);
  }
  const mineDeep = byId.get('mine_deep_vein');
  if (mineDeep) {
    // 3000px, cols 5..10 -> mine_magma_shaft [6, 21, 1, 7] col 6.26 = 630px [540..720]（左离岩浆池 760..1640）
    mineDeep.shafts = [...mineDeep.shafts, { x1: 540, x2: 720, dir: 'down', targetRoomId: 'mine_magma_shaft' }];
    mineDeep.pavilions.push({ x: 534, y: 416, w: 192, hasPillars: false });
  }
  const netherBridge = byId.get('nether_soul_bridge');
  if (netherBridge) {
    // 3800px, cols 15..21 -> nether_ferry_loft [17..18] col 18.48 = 1890px [1800..1980]（落于两岸水泽之间的中央石墩 1640..2160）
    netherBridge.solidBlocks = (netherBridge.solidBlocks || []).filter((sb) => sb.y < 200 || sb.y > 330);
    setColAlignedUpShaft('nether_soul_bridge', 'nether_ferry_loft', 1800, 1980, 'crypt_vault', [1710, 1840, 1760]);
  }
  const netherAv = byId.get('nether_lantern_avenue');
  if (netherAv) {
    // 3160px, cols 23..29 -> nether_wisp_belfry [25..26] col 26.0 = 1354px [1264..1444]（左离狐幻闸 2640）
    netherAv.solidBlocks = [];
    setColAlignedUpShaft('nether_lantern_avenue', 'nether_wisp_belfry', 1264, 1444, 'crypt_vault', [1170, 1300, 1220]);
  }
  const netherMirror = byId.get('nether_mirror_crypt');
  if (netherMirror) {
    // 2520px, cols 25..29 -> nether_mirror_cellar [26..27] col 27.16 = 1090px [1000..1180]（右离狐幻闸 720）
    netherMirror.shafts = [...netherMirror.shafts, { x1: 1000, x2: 1180, dir: 'down', targetRoomId: 'nether_mirror_cellar' }];
    netherMirror.pavilions.push({ x: 994, y: 416, w: 192, hasPillars: false });
  }
  const netherOss = byId.get('nether_east_ossuary');
  if (netherOss) {
    // 3000px, cols 31..35 -> nether_bone_vault [32..33] col 33.0 = 1200px [1110..1290]
    netherOss.shafts = [...netherOss.shafts, { x1: 1110, x2: 1290, dir: 'down', targetRoomId: 'nether_bone_vault' }];
    netherOss.pavilions.push({ x: 1104, y: 416, w: 192, hasPillars: false });
  }

  const groundSlam = byId.get('relic_ground_slam');
  if (groundSlam) {
    groundSlam.shafts = [{ x1: 450, x2: 630, dir: 'up', targetRoomId: 'forge_boss_arena' }];
    syncCeilingsWithUpShafts('relic_ground_slam', 'crypt_vault');
  }
  const wallVault = byId.get('relic_wall_vault');
  if (wallVault) {
    wallVault.shafts = [{ x1: 450, x2: 630, dir: 'down', targetRoomId: 'clock_boss_spire' }];
    wallVault.pavilions = [
      ...wallVault.pavilions.filter((pv) => pv.y < 300),
      { x: 444, y: 396, w: 192, hasPillars: false },
    ];
  }

  // 4) 扩建全 10 座首领决战大殿 + 万卷藏书阁 + 九转真火炉殿 + 6 座地下/穹顶跨层巨室为真实双层/三层巨殿（含精确 focalY & 无跌落阶梯）
  upgradeRoomToGrandTwoStoryHall(
    'celestial_bell_sanctum',
    2200,
    840,
    [
      { side: 'left', floorY: 760, targetRoomId: 'outer_wall_upper', rowOffset: 1 },
      { side: 'right', floorY: 760, targetRoomId: 'celestial_star_vault', rowOffset: 1 },
    ],
    {
      // ambushSeal 伏魔房：仅设净空悬廊，不放铁闸/机关/水池/实心阻挡墩
      extraLeftSteps: [
        { x: 420, y: 610, w: 240, h: 30 },
        { x: 640, y: 460, w: 260, h: 30 },
      ],
      extraRightSteps: [
        { x: 1540, y: 610, w: 240, h: 30 },
        { x: 1300, y: 460, w: 260, h: 30 },
      ],
    }
  );

  upgradeRoomToGrandTwoStoryHall(
    'catacomb_hall',
    2520,
    840,
    [
      { side: 'left', floorY: 356, targetRoomId: 'catacomb_save', rowOffset: 0 },
      { side: 'right', floorY: 356, targetRoomId: 'catacomb_shrine', rowOffset: 0 },
    ],
    {
      balconyLeft: 420,
      balconyRight: 420,
      keepExistingShafts: false,
      extraShafts: [{ x1: 2178, x2: 2358, dir: 'up', targetRoomId: 'prison_boss_hall' }],
      extraLeftSteps: [
        { x: 260, y: 630, w: 200, h: 32 },
        { x: 380, y: 492, w: 200, h: 32 },
      ],
      extraRightSteps: [
        { x: 2080, y: 630, w: 200, h: 32 },
        { x: 1960, y: 492, w: 200, h: 32 },
        { x: 2080, y: 248, w: 190, h: 30 },
        { x: 2170, y: 140, w: 185, h: 28 },
      ],
    }
  );

  upgradeRoomToGrandTwoStoryHall(
    'dock_underwater_tunnel',
    3000,
    840,
    [
      { side: 'left', floorY: 356, targetRoomId: 'abyss_ascension_shaft', rowOffset: 0 },
      { side: 'right', floorY: 756, targetRoomId: 'dock_coral_grotto', rowOffset: 1 },
    ],
    {
      balconyLeft: 420,
      keepExistingShafts: false,
      extraShafts: [{ x1: 2610, x2: 2790, dir: 'up', targetRoomId: 'dock_shipyard_hall' }],
      extraLeftSteps: [
        { x: 460, y: 626, w: 210, h: 32 },
        { x: 320, y: 492, w: 210, h: 32 },
      ],
      extraRightSteps: [
        { x: 2360, y: 626, w: 210, h: 32 },
        { x: 2580, y: 492, w: 210, h: 32 },
        { x: 2440, y: 360, w: 210, h: 30 },
        { x: 2640, y: 244, w: 200, h: 30 },
        { x: 2610, y: 132, w: 190, h: 28 },
      ],
    }
  );
  const dockTunDual = byId.get('dock_underwater_tunnel');
  if (dockTunDual) {
    dockTunDual.solidBlocks = (dockTunDual.solidBlocks || []).filter((sb) => sb.y >= 110);
  }

  upgradeRoomToGrandTwoStoryHall(
    'dock_abyss_trench',
    3800,
    840,
    [
      { side: 'left', floorY: 356, targetRoomId: 'abyss_east_corridor', rowOffset: 0 },
      { side: 'right', floorY: 740, targetRoomId: 'dock_treasure_vault', rowOffset: 1 },
    ],
    {
      balconyLeft: 440,
      keepExistingShafts: false,
      extraShafts: [{ x1: 3438, x2: 3618, dir: 'down', targetRoomId: 'dock_warp' }],
      extraPavilions: [{ x: 3432, y: 740, w: 192, hasPillars: false }],
      extraLeftSteps: [
        { x: 440, y: 618, w: 210, h: 32 },
        { x: 320, y: 486, w: 210, h: 32 },
      ],
    }
  );

  upgradeRoomToGrandTwoStoryHall(
    'nether_trial_colosseum',
    2520,
    840,
    [
      { side: 'left', floorY: 756, targetRoomId: 'nether_pillar_hall', rowOffset: 1 },
      { side: 'right', floorY: 756, targetRoomId: 'nether_mirror_crypt', rowOffset: 1 },
    ],
    {
      extraLeftSteps: [
        { x: 460, y: 610, w: 240, h: 30 },
        { x: 740, y: 460, w: 260, h: 30 },
      ],
      extraRightSteps: [
        { x: 1820, y: 610, w: 240, h: 30 },
        { x: 1520, y: 460, w: 260, h: 30 },
      ],
    }
  );

  upgradeRoomToGrandTwoStoryHall(
    'nether_ancient_stele_room',
    1880,
    840,
    [{ side: 'left', floorY: 356, targetRoomId: 'nether_east_ossuary', rowOffset: 0 }],
    {
      balconyLeft: 420,
      extraLeftSteps: [
        { x: 480, y: 626, w: 210, h: 32 },
        { x: 340, y: 492, w: 210, h: 32 },
      ],
    }
  );
  upgradeRoomToGrandTwoStoryHall(
    'sky_altar',
    2200,
    880,
    [
      { side: 'left', floorY: 356, targetRoomId: 'altar_save', rowOffset: 0 },
      { side: 'left', floorY: 784, targetRoomId: 'altar_forecourt', rowOffset: 1 },
      { side: 'right', floorY: 356, targetRoomId: 'outer_wall_upper', rowOffset: 0 },
    ],
    {
      balconyLeft: 320,
      balconyRight: 320,
      extraLeftSteps: [
        { x: 240, y: 676, w: 185, h: 30 },
        { x: 160, y: 568, w: 185, h: 30 },
        { x: 250, y: 460, w: 185, h: 30 },
      ],
      extraRightSteps: [
        { x: 1780, y: 604, w: 185, h: 30 },
        { x: 1880, y: 482, w: 185, h: 30 },
      ],
    }
  );

  upgradeRoomToGrandTwoStoryHall(
    'colosseum_grand_arena',
    2200,
    880,
    [
      { side: 'left', floorY: 792, targetRoomId: 'colosseum_west_gate', rowOffset: 1 },
      { side: 'right', floorY: 792, targetRoomId: 'colosseum_save', rowOffset: 1 },
    ],
    {
      extraLeftSteps: [{ x: 140, y: 580, w: 220, h: 32 }, { x: 220, y: 400, w: 240, h: 32 }],
      extraRightSteps: [{ x: 1840, y: 580, w: 220, h: 32 }, { x: 1740, y: 400, w: 240, h: 32 }],
    }
  );

  upgradeRoomToGrandTwoStoryHall(
    'opera_boss_stage',
    1880,
    880,
    [
      { side: 'left', floorY: 808, targetRoomId: 'relic_grapple_vault', rowOffset: 1 },
      { side: 'right', floorY: 356, targetRoomId: 'opera_save', rowOffset: 0 },
      { side: 'right', floorY: 808, targetRoomId: 'opera_moon_pavilion', rowOffset: 1 },
    ],
    {
      balconyRight: 320,
      extraShafts: [{ x1: 1477, x2: 1657, dir: 'down', targetRoomId: 'opera_gallery' }],
      extraPavilions: [{ x: 1470, y: 808, w: 194, hasPillars: false }],
      extraRightSteps: [
        { x: 1660, y: 696, w: 185, h: 30 },
        { x: 1520, y: 582, w: 185, h: 30 },
        { x: 1650, y: 468, w: 185, h: 30 },
      ],
    }
  );

  upgradeRoomToGrandTwoStoryHall(
    'xiao_boss_hall',
    1880,
    840,
    [
      { side: 'left', floorY: 764, targetRoomId: 'relic_double_jump', rowOffset: 1 },
      { side: 'right', floorY: 356, targetRoomId: 'alchemy_save', rowOffset: 0 },
    ],
    {
      balconyRight: 320,
      extraShafts: [{ x1: 1477, x2: 1657, dir: 'down', targetRoomId: 'alchemy_lab' }],
      extraPavilions: [{ x: 1470, y: 764, w: 194, hasPillars: false }],
      // Stage 0 单跳阶梯（dy<=86px）供攀往 alchemy_save，中场彻底留空！
      extraRightSteps: [
        { x: 1660, y: 678, w: 175, h: 30 },
        { x: 1460, y: 592, w: 175, h: 30 },
        { x: 1650, y: 506, w: 175, h: 30 },
        { x: 1480, y: 422, w: 175, h: 30 },
      ],
    }
  );

  upgradeRoomToGrandTwoStoryHall(
    'alchemy_fire_sanctum',
    1600,
    840,
    [{ side: 'right', floorY: 356, targetRoomId: 'library_automaton_loft', rowOffset: 0 }],
    {
      balconyRight: 340,
      extraShafts: [{ x1: 1110, x2: 1290, dir: 'down', targetRoomId: 'alchemy_foyer' }],
      extraPavilions: [{ x: 1104, y: 768, w: 194, hasPillars: false }],
      extraRightSteps: [
        { x: 1320, y: 678, w: 175, h: 30 },
        { x: 1140, y: 588, w: 175, h: 30 },
        { x: 1320, y: 498, w: 175, h: 30 },
        { x: 1160, y: 412, w: 175, h: 30 },
      ],
    }
  );

  upgradeRoomToGrandTwoStoryHall(
    'library_grand_hall',
    1880,
    840,
    [
      { side: 'left', floorY: 768, targetRoomId: 'library_save', rowOffset: 1 },
      { side: 'right', floorY: 768, targetRoomId: 'upper_library', rowOffset: 1 },
    ],
    {
      // ambushSeal 房禁止加任何柱墩/铁闸/陷阱/水池，仅放高空无阻挡藏书雕花夹层！
      extraLeftSteps: [{ x: 260, y: 560, w: 260, h: 28 }, { x: 480, y: 410, w: 300, h: 28 }],
      extraRightSteps: [{ x: 1120, y: 410, w: 300, h: 28 }, { x: 1360, y: 560, w: 260, h: 28 }],
    }
  );
  const upLib = byId.get('upper_library');
  if (upLib) {
    upLib.sideDoors = [
      { side: 'left', floorY: 804, targetRoomId: 'library_grand_hall', rowOffset: 1 },
      { side: 'right', floorY: 804, targetRoomId: 'east_outer_tower', rowOffset: 1 },
    ];
    // cols 30..31, opera_foyer overlaps col 30 -> up shaft at 25% = 400px [310..490]
    upLib.shafts = [{ x1: 310, x2: 490, dir: 'up', targetRoomId: 'opera_foyer' }];
    syncCeilingsWithUpShafts('upper_library', 'palace_timber');
    upLib.solidBlocks = [
      { x: 360, y: 676, w: 220, h: 34 },
      { x: 640, y: 588, w: 320, h: 34 },
      { x: 1020, y: 502, w: 220, h: 34 },
      { x: 520, y: 356, w: 560, h: 36 },
      { x: 340, y: 248, w: 210, h: 32 },
      { x: 380, y: 128, w: 170, h: 28 },
    ];
  }

  // clock_boss_spire: 原 1x1 钟楼扩建为 3x2 (1880x880) 宏伟雷音镇钟天阙，严保右秘门 sec_door_thunder！
  const clockBoss = byId.get('clock_boss_spire');
  if (clockBoss) {
    clockBoss.pixelW = 1880;
    clockBoss.pixelH = 880;
    clockBoss.focalX = 940;
    clockBoss.focalY = 774;
    clockBoss.groundNodes = [
      { x: 0, y: 804, style: 'marble' },
      { x: 420, y: 804, style: 'stairs' },
      { x: 520, y: 774, style: 'marble' },
      { x: 1360, y: 774, style: 'stairs' },
      { x: 1460, y: 804, style: 'marble' },
      { x: 1880, y: 804, style: 'marble' },
    ];
    clockBoss.sideDoors = [
      { side: 'left', floorY: 148, targetRoomId: 'clock_bell_gallery', rowOffset: 0 },
      { side: 'left', floorY: 804, targetRoomId: 'clock_save', rowOffset: 1 },
      {
        side: 'right',
        floorY: 804,
        targetRoomId: 'secret_thunder_vault',
        rowOffset: 1,
        secretWallId: 'sec_door_thunder',
      },
    ];
    clockBoss.leftRoomId = undefined;
    clockBoss.rightRoomId = undefined;
    // 37..39, relic_wall_vault@39 -> 83.3% = 1567px [1477..1657]
    clockBoss.shafts = [{ x1: 1477, x2: 1657, dir: 'up', targetRoomId: 'relic_wall_vault', requireBossClear: true }];
    syncCeilingsWithUpShafts('clock_boss_spire', 'palace_timber');
    clockBoss.solidBlocks = [
      { x: 0, y: 148, w: 360, h: 36 },
      { x: 220, y: 282, w: 185, h: 32 },
      { x: 120, y: 416, w: 185, h: 32 },
      { x: 240, y: 550, w: 185, h: 32 },
      { x: 140, y: 680, w: 185, h: 32 },
      { x: 1460, y: 676, w: 185, h: 32 },
      { x: 1600, y: 544, w: 185, h: 32 },
      { x: 1450, y: 412, w: 185, h: 32 },
      { x: 1580, y: 280, w: 185, h: 32 },
      { x: 1480, y: 152, w: 185, h: 30 },
    ];
    clockBoss.clockGears = [
      { x: 940, y: 290, radius: 112, speed: 0.42, hasOrbitPlatforms: true },
    ];
    clockBoss.decorProps = [
      { kind: 'giant_bell', x: 940, y: 165, scale: 1.08 },
      { kind: 'dragon_brazier', x: 560, y: 774, scale: 0.96 },
      { kind: 'dragon_brazier', x: 1320, y: 774, scale: 0.96 },
    ];
    clockBoss.torches = [
      { x: 380, y: 724 },
      { x: 1500, y: 724 },
    ];
    clockBoss.lanterns = [
      { x: 520, y: 260 },
      { x: 1360, y: 260 },
    ];
  }

  // gate_1: 4x2 (2200x880) 正阳护城石拱古桥（里城最终头目烛阴冥坛！）
  const gate1 = upgradeRoomToGrandTwoStoryHall(
    'gate_1',
    2200,
    880,
    [
      { side: 'left', floorY: 356, targetRoomId: 'bridge_save', rowOffset: 0 },
      { side: 'left', floorY: 804, targetRoomId: 'entrance_bamboo_woods', rowOffset: 1 },
      { side: 'right', floorY: 804, targetRoomId: 'entrance_imperial_plaza', rowOffset: 1 },
    ],
    {
      balconyLeft: 250,
      extraLeftSteps: [
        { x: 190, y: 696, w: 155, h: 28 },
        { x: 40, y: 584, w: 155, h: 28 },
        { x: 180, y: 470, w: 155, h: 28 },
      ],
    }
  );
  if (gate1) {
    gate1.focalX = 485;
    gate1.decorProps = gate1.decorProps?.map((dp) =>
      dp.kind === 'dragon_brazier' && dp.x < 600 ? { ...dp, x: 470 } : dp
    );
  }

  // forge_boss_arena: 5x2 (2520x880), cols 9..13 -> U: forge_slag_bridge@13 (2268px), D: relic_ground_slam@10 (756px)
  upgradeRoomToGrandTwoStoryHall(
    'forge_boss_arena',
    2520,
    880,
    [
      { side: 'left', floorY: 356, targetRoomId: 'sunken_sluice_cavern', rowOffset: 0 },
      { side: 'right', floorY: 356, targetRoomId: 'forge_prison_conduit', rowOffset: 0 },
      { side: 'right', floorY: 808, targetRoomId: 'forge_save', rowOffset: 1 },
    ],
    {
      balconyLeft: 340,
      balconyRight: 340,
      extraShafts: [
        { x1: 2178, x2: 2358, dir: 'up', targetRoomId: 'forge_slag_bridge' },
        { x1: 666, x2: 846, dir: 'down', targetRoomId: 'relic_ground_slam', requireBossClear: true },
      ],
      extraPavilions: [{ x: 660, y: 808, w: 194, hasPillars: false }],
      extraLeftSteps: [
        { x: 140, y: 682, w: 185, h: 30 },
        { x: 260, y: 560, w: 185, h: 30 },
        { x: 150, y: 452, w: 185, h: 30 },
      ],
      extraRightSteps: [
        { x: 2200, y: 682, w: 185, h: 30 },
        { x: 2070, y: 560, w: 185, h: 30 },
        { x: 2190, y: 452, w: 185, h: 30 },
        { x: 2140, y: 252, w: 185, h: 30 },
        { x: 2220, y: 148, w: 185, h: 28 },
      ],
    }
  );

  // prison_boss_hall: 5x2 (2520x880), cols 26..30 -> D: catacomb_hall@26 (252px dry shore, seal_prison_catacomb!)
  upgradeRoomToGrandTwoStoryHall(
    'prison_boss_hall',
    2520,
    880,
    [
      { side: 'left', floorY: 356, targetRoomId: 'prison_cellblock', rowOffset: 0 },
      { side: 'left', floorY: 808, targetRoomId: 'prison_pre_save', rowOffset: 1 },
      { side: 'right', floorY: 356, targetRoomId: 'relic_mist_vault', rowOffset: 0 },
    ],
    {
      balconyLeft: 340,
      balconyRight: 340,
      extraShafts: [
        { x1: 162, x2: 342, dir: 'down', targetRoomId: 'catacomb_hall', sealId: 'seal_prison_catacomb' },
      ],
      extraPavilions: [{ x: 156, y: 808, w: 194, hasPillars: false }],
      extraLeftSteps: [
        { x: 390, y: 696, w: 180, h: 30 },
        { x: 230, y: 582, w: 180, h: 30 },
        { x: 370, y: 468, w: 180, h: 30 },
      ],
      extraRightSteps: [
        { x: 1960, y: 696, w: 180, h: 30 },
        { x: 2120, y: 582, w: 180, h: 30 },
        { x: 1980, y: 468, w: 180, h: 30 },
      ],
    }
  );

  // dragon_tomb_heart: 5x2 (3800x880), cols 18..22 -> 太古祖龙心殿
  upgradeRoomToGrandTwoStoryHall(
    'dragon_tomb_heart',
    3800,
    880,
    [
      { side: 'left', floorY: 356, targetRoomId: 'dragon_tomb_save', rowOffset: 0 },
      { side: 'left', floorY: 780, targetRoomId: 'dragon_tomb_west', rowOffset: 1 },
      { side: 'right', floorY: 356, targetRoomId: 'dragon_tomb_warp', rowOffset: 0 },
      { side: 'right', floorY: 780, targetRoomId: 'dragon_tomb_sanctuary', rowOffset: 1 },
    ],
    {
      balconyLeft: 340,
      balconyRight: 340,
      extraLeftSteps: [
        { x: 240, y: 676, w: 185, h: 30 },
        { x: 140, y: 568, w: 185, h: 30 },
        { x: 260, y: 460, w: 185, h: 30 },
      ],
      extraRightSteps: [
        { x: 3360, y: 676, w: 185, h: 30 },
        { x: 3460, y: 568, w: 185, h: 30 },
        { x: 3340, y: 460, w: 185, h: 30 },
      ],
    }
  );

  // 5) 真等比重建全部 15 座多层垂直高塔、天梯与三层沉舰干船坞
  const cloudGallery = byId.get('cloud_star_gallery');
  if (cloudGallery) {
    cloudGallery.pixelW = 2200;
    cloudGallery.pixelH = 1280;
    cloudGallery.focalX = 280;
    cloudGallery.focalY = 1212;
    cloudGallery.groundNodes = [
      { x: 0, y: 1212, style: 'marble' },
      { x: 2200, y: 1212, style: 'marble' },
    ];
    cloudGallery.ceilingSpans = [];
    cloudGallery.sideDoors = [
      { side: 'left', floorY: 1212, targetRoomId: 'opera_moon_pavilion', rowOffset: 2 },
      { side: 'right', floorY: 220, targetRoomId: 'altar_forecourt', rowOffset: 0 },
    ];
    cloudGallery.leftRoomId = undefined;
    cloudGallery.rightRoomId = undefined;
    cloudGallery.ironGate = {
      id: 'gate_cloud_fox_illusion',
      x: 460,
      topY: 0,
      bottomY: 1212,
      gateKind: 'illusion_fox',
    };
    cloudGallery.solidBlocks = [
      { x: 580, y: 1088, w: 230, h: 32 },
      { x: 840, y: 956, w: 230, h: 32 },
      { x: 640, y: 824, w: 230, h: 32 },
      { x: 960, y: 680, w: 320, h: 36 },
      { x: 1520, y: 220, w: 680, h: 992, blocking: true },
    ];
    cloudGallery.climbWalls = [{ x: 1490, topY: 180, bottomY: 620 }];
    cloudGallery.decorProps = [
      { kind: 'coiled_pillar', x: 280, y: 1212, scale: 0.96 },
      { kind: 'dragon_brazier', x: 1120, y: 680, scale: 0.94 },
      { kind: 'coiled_pillar', x: 1920, y: 220, scale: 0.92 },
    ];
    cloudGallery.torches = [
      { x: 760, y: 1138 },
      { x: 1780, y: 146 },
    ];
    cloudGallery.spawns = [
      { kind: 'bell_gargoyle', x: 880, y: 760 },
      { kind: 'bronze_guard', x: 1120, y: 680 },
      { kind: 'bell_gargoyle', x: 1720, y: 190 },
    ];
  }

  // chapel_cloud_stair: 4x3 (2400x1280, y=3..5) SotN 礼拜堂斜升云阶，下接 west_cliff_pagoda@col 4
  const chapelStair = byId.get('chapel_cloud_stair');
  if (chapelStair) {
    chapelStair.pixelW = 2400;
    chapelStair.pixelH = 1280;
    chapelStair.focalX = 1200;
    chapelStair.focalY = 1204;
    chapelStair.groundNodes = [
      { x: 0, y: 1204, style: 'marble' },
      { x: 2400, y: 1204, style: 'marble' },
    ];
    chapelStair.sideDoors = [
      { side: 'right', floorY: 356, targetRoomId: 'colosseum_west_gate', rowOffset: 0 },
      { side: 'right', floorY: 764, targetRoomId: 'west_cliff_watchtower', rowOffset: 1 },
    ];
    chapelStair.leftRoomId = undefined;
    chapelStair.rightRoomId = undefined;
    // 4..7, west_cliff_pagoda@4 -> 12.5% = 300px [210..390]
    chapelStair.shafts = [{ x1: 210, x2: 390, dir: 'down', targetRoomId: 'west_cliff_pagoda' }];
    chapelStair.pavilions = [{ x: 204, y: 1204, w: 194, hasPillars: false }];
    chapelStair.solidBlocks = [
      { x: 460, y: 1084, w: 250, h: 32 },
      { x: 820, y: 968, w: 260, h: 32 },
      { x: 1220, y: 860, w: 260, h: 32 },
      { x: 1880, y: 764, w: 520, h: 36 },
      { x: 1460, y: 632, w: 260, h: 32 },
      { x: 1760, y: 492, w: 260, h: 32 },
      { x: 1880, y: 356, w: 520, h: 36 },
    ];
    chapelStair.decorProps = [
      { kind: 'coiled_pillar', x: 520, y: 1204, scale: 0.94 },
      { kind: 'dragon_brazier', x: 2020, y: 764, scale: 0.9 },
      { kind: 'coiled_pillar', x: 2120, y: 356, scale: 0.9 },
    ];
    chapelStair.torches = [
      { x: 780, y: 1126 },
      { x: 1980, y: 280 },
    ];
  }

  // west_cliff_watchtower: 1x3 (1080x1280, y=4..6), preserve gate_west_watch_shortcut@0 & double_jump@1!
  const watchTower = byId.get('west_cliff_watchtower');
  if (watchTower) {
    watchTower.pixelW = 1080;
    watchTower.pixelH = 1280;
    watchTower.focalY = 1204;
    watchTower.groundNodes = [
      { x: 0, y: 1204, style: 'marble' },
      { x: 1080, y: 1204, style: 'marble' },
    ];
    watchTower.sideDoors = [
      { side: 'left', floorY: 356, targetRoomId: 'chapel_cloud_stair', rowOffset: 0 },
      { side: 'right', floorY: 764, targetRoomId: 'relic_double_jump', rowOffset: 1 },
      { side: 'left', floorY: 1204, targetRoomId: 'west_cliff_skybridge', rowOffset: 2 },
    ];
    watchTower.leftRoomId = undefined;
    watchTower.rightRoomId = undefined;
    watchTower.ironGate = {
      id: 'gate_west_watch_shortcut',
      x: 320,
      topY: 0,
      bottomY: 356,
      gateKind: 'lever_shortcut',
      leverSide: 'left',
    };
    watchTower.solidBlocks = [
      { x: 0, y: 356, w: 390, h: 36 },
      { x: 660, y: 356, w: 420, h: 36 },
      { x: 455, y: 196, w: 170, h: 28 },
      { x: 420, y: 506, w: 220, h: 32 },
      { x: 640, y: 632, w: 220, h: 32 },
      { x: 660, y: 764, w: 420, h: 36 },
      { x: 380, y: 912, w: 220, h: 32 },
      { x: 600, y: 1058, w: 220, h: 32 },
    ];
  }

  // west_cliff_pagoda: 1x5 (1080x2000, y=6..10), dy=160~192px (>118, no lift!) keeps double_jump lock!
  const pagoda = byId.get('west_cliff_pagoda');
  if (pagoda) {
    pagoda.pixelW = 1080;
    pagoda.pixelH = 2000;
    pagoda.focalY = 1916;
    pagoda.groundNodes = [
      { x: 0, y: 1916, style: 'marble' },
      { x: 1080, y: 1916, style: 'marble' },
    ];
    pagoda.sideDoors = [
      { side: 'left', floorY: 356, targetRoomId: 'cliff_wind_pavilion', rowOffset: 0 },
      { side: 'right', floorY: 356, targetRoomId: 'west_cliff_skybridge', rowOffset: 0 },
      { side: 'right', floorY: 1560, targetRoomId: 'entrance_battlement_tower', rowOffset: 3 },
      { side: 'left', floorY: 1916, targetRoomId: 'cliff_pine_trail', rowOffset: 4 },
    ];
    pagoda.leftRoomId = undefined;
    pagoda.rightRoomId = undefined;
    // 严格维持每级阶梯 dy=160~192px (>118 且 <=228)，绝不放升降梯，死锁二段跳前绝不可越塔！
    pagoda.solidBlocks = [
      { x: 0, y: 356, w: 390, h: 36 },
      { x: 690, y: 356, w: 390, h: 36 },
      { x: 455, y: 196, w: 170, h: 28 },
      { x: 380, y: 540, w: 220, h: 32 },
      { x: 600, y: 720, w: 220, h: 32 },
      { x: 360, y: 900, w: 220, h: 32 },
      { x: 600, y: 1080, w: 220, h: 32 },
      { x: 380, y: 1260, w: 220, h: 32 },
      { x: 620, y: 1410, w: 220, h: 32 },
      { x: 690, y: 1560, w: 390, h: 36 },
      { x: 440, y: 1740, w: 220, h: 32 },
    ];
    pagoda.decorProps = pagoda.decorProps?.map((dp) => ({ ...dp, y: 1916 }));
    pagoda.torches = pagoda.torches.map((tc) =>
      tc.y > 400 ? { ...tc, y: 1840 } : tc
    );
    pagoda.spawns = [
      { kind: 'bone_archer', x: 770, y: 356 },
      { kind: 'bell_gargoyle', x: 520, y: 980 },
      { kind: 'paper_swordsman', x: 560, y: 1916 },
    ];
  }

  // entrance_imperial_plaza: 4x3 (3200x1200, y=9..11) 皇城正阳朱雀大广场，全阶 dy<=92px 供 Stage 0 自由攀行！
  const plaza = byId.get('entrance_imperial_plaza');
  if (plaza) {
    plaza.pixelW = 3200;
    plaza.pixelH = 1200;
    plaza.focalY = 1104;
    plaza.groundNodes = plaza.groundNodes.map((gn) => ({ ...gn, y: gn.y + 300 }));
    plaza.waterZones = plaza.waterZones.map((wz) => ({ ...wz, surfaceY: wz.surfaceY + 300 }));
    plaza.sideDoors = [
      { side: 'left', floorY: 356, targetRoomId: 'entrance_battlement_tower', rowOffset: 0 },
      { side: 'right', floorY: 720, targetRoomId: 'entrance_guard_pavilion', rowOffset: 1 },
      { side: 'left', floorY: 1104, targetRoomId: 'gate_1', rowOffset: 2 },
      { side: 'right', floorY: 1104, targetRoomId: 'entrance_mid_save', rowOffset: 2 },
    ];
    plaza.leftRoomId = undefined;
    plaza.rightRoomId = undefined;
    // 11..14, entrance_moat_cavern@col 11 -> 12.5% = 400px [310..490] (dry left shore!)
    plaza.shafts = [{ x1: 310, x2: 490, dir: 'down', targetRoomId: 'entrance_moat_cavern' }];
    plaza.pavilions = [{ x: 304, y: 1104, w: 194, hasPillars: false }];
    plaza.decorProps = plaza.decorProps?.map((dp) =>
      dp.y > 460 ? { ...dp, y: dp.y + 300 } : dp
    );
    plaza.torches = plaza.torches.map((tc) => (tc.y > 460 ? { ...tc, y: tc.y + 300 } : tc));
    plaza.spawns = plaza.spawns.map((sp) => ({
      ...sp,
      y: sp.y !== undefined ? (sp.y > 460 ? sp.y + 300 : sp.y + 220) : undefined,
    }));
    plaza.pickups = plaza.pickups.map((pk) => ({
      ...pk,
      y: pk.y !== undefined ? pk.y + 180 : undefined,
    }));
    plaza.solidBlocks = [
      // 左门箭台顶层 (y=356) & 单跳之字长阶 (1074 -> 988 -> 902 -> 814 -> 726 -> 638 -> 550 -> 454 -> 356)
      { x: 0, y: 356, w: 420, h: 36 },
      { x: 740, y: 988, w: 230, h: 34 },
      { x: 520, y: 902, w: 230, h: 34 },
      { x: 720, y: 814, w: 230, h: 34 },
      { x: 500, y: 726, w: 230, h: 34 },
      { x: 700, y: 638, w: 230, h: 34 },
      { x: 480, y: 550, w: 230, h: 34 },
      { x: 360, y: 454, w: 230, h: 34 },
      // 中央飞桥天廊（y=584，pk_inner_court_wine = 404+180 = 584 正落此桥！）
      { x: 1120, y: 668, w: 260, h: 34 },
      { x: 1440, y: 584, w: 340, h: 34 },
      { x: 1840, y: 668, w: 260, h: 34 },
      // 右门巡防阁中层 (y=720) & 单跳长阶 (1074 -> 988 -> 902 -> 810 -> 720)
      { x: 2180, y: 988, w: 230, h: 34 },
      { x: 2380, y: 902, w: 230, h: 34 },
      { x: 2200, y: 810, w: 230, h: 34 },
      { x: 2450, y: 720, w: 750, h: 36 },
    ];
  }

  // gate_2: 3x5 (2400x2000, y=7..11) 雄镇端门五层大阙，Stage 0 单跳直上炼丹司！
  const gate2 = byId.get('gate_2');
  if (gate2) {
    gate2.pixelW = 2400;
    gate2.pixelH = 2000;
    gate2.focalY = 1916;
    gate2.groundNodes = gate2.groundNodes.map((gn) => ({ ...gn, y: gn.y + 1120 }));
    gate2.sideDoors = [
      { side: 'left', floorY: 1480, targetRoomId: 'entrance_guard_pavilion', rowOffset: 3 },
      { side: 'right', floorY: 1480, targetRoomId: 'outer_city_warp', rowOffset: 3 },
      { side: 'left', floorY: 1916, targetRoomId: 'entrance_mid_save', rowOffset: 4 },
      { side: 'right', floorY: 1916, targetRoomId: 'gate_save', rowOffset: 4 },
    ];
    gate2.leftRoomId = undefined;
    gate2.rightRoomId = undefined;
    // 16..18: alchemy_foyer@17 (1200px), forge_antechamber@17 (1200px)
    gate2.shafts = [
      { x1: 1110, x2: 1290, dir: 'up', targetRoomId: 'alchemy_foyer' },
      { x1: 1110, x2: 1290, dir: 'down', targetRoomId: 'forge_antechamber' },
    ];
    syncCeilingsWithUpShafts('gate_2', 'palace_timber');
    gate2.pavilions = [
      { x: 1104, y: 1916, w: 194, hasPillars: false },
      { x: 1080, y: 1788, w: 240, hasPillars: true },
    ];
    gate2.lanterns = gate2.lanterns.map((ln) => ({ ...ln, y: ln.y + 920 }));
    gate2.pickups = gate2.pickups.map((pk) => ({
      ...pk,
      y: pk.y !== undefined ? 1480 : undefined,
    }));
    gate2.spawns = gate2.spawns.map((sp) => ({
      ...sp,
      y: sp.y !== undefined ? sp.y + 1120 : undefined,
    }));
    gate2.decorProps = gate2.decorProps?.map((dp) => ({ ...dp, y: dp.y + 1120 }));
    gate2.torches = gate2.torches.map((tc) => ({ ...tc, y: tc.y + 1120 }));
    gate2.solidBlocks = [
      // y=1916 -> y=1480 左右单跳阶
      { x: 0, y: 1480, w: 380, h: 36 },
      { x: 2020, y: 1480, w: 380, h: 36 },
      { x: 460, y: 1820, w: 230, h: 34 },
      { x: 640, y: 1732, w: 240, h: 34 },
      { x: 440, y: 1646, w: 230, h: 34 },
      { x: 620, y: 1562, w: 260, h: 34 },
      { x: 860, y: 1480, w: 680, h: 36 },
      { x: 1520, y: 1820, w: 220, h: 34 },
      { x: 1710, y: 1732, w: 220, h: 34 },
      { x: 1560, y: 1646, w: 220, h: 34 },
      { x: 1740, y: 1562, w: 240, h: 34 },
      // y=1480 -> y=146（高耸五层飞檐木梯，每级 dy<=88px <= 118！）
      { x: 960, y: 1392, w: 220, h: 30 },
      { x: 1200, y: 1304, w: 220, h: 30 },
      { x: 960, y: 1216, w: 220, h: 30 },
      { x: 1200, y: 1128, w: 220, h: 30 },
      { x: 960, y: 1040, w: 220, h: 30 },
      { x: 1200, y: 952, w: 220, h: 30 },
      { x: 960, y: 864, w: 220, h: 30 },
      { x: 1200, y: 776, w: 220, h: 30 },
      { x: 960, y: 688, w: 220, h: 30 },
      { x: 1200, y: 600, w: 220, h: 30 },
      { x: 960, y: 512, w: 220, h: 30 },
      { x: 1200, y: 424, w: 220, h: 30 },
      { x: 960, y: 336, w: 220, h: 30 },
      { x: 1200, y: 248, w: 220, h: 30 },
      { x: 1100, y: 158, w: 220, h: 30 },
    ];
    gate2.movingPlatforms = [
      { x1: 700, y1: 1440, x2: 700, y2: 200, w: 150, speed: 1.45, style: 'bronze_lift' },
    ];
  }

  // east_outer_tower: 1x10 (1080x3640, y=3..12), 严格保留 gate_mist_archive & 顶层壁虎攀壁锁!
  const eastTower = byId.get('east_outer_tower');
  if (eastTower) {
    eastTower.pixelW = 1080;
    eastTower.pixelH = 3640;
    eastTower.focalY = 3548;
    eastTower.groundNodes = [
      { x: 0, y: 3548, style: 'marble' },
      { x: 1080, y: 3548, style: 'marble' },
    ];
    eastTower.pavilions = [{ x: 410, y: 3544, w: 240, hasPillars: false }];
    eastTower.sideDoors = [
      { side: 'right', floorY: 760, targetRoomId: 'secret_archive', rowOffset: 2 },
      { side: 'left', floorY: 1160, targetRoomId: 'upper_library', rowOffset: 3 },
      { side: 'right', floorY: 1160, targetRoomId: 'clock_gear_hall', rowOffset: 3 },
      { side: 'right', floorY: 1920, targetRoomId: 'observatory_bridge', rowOffset: 5 },
      { side: 'right', floorY: 2680, targetRoomId: 'east_warp', rowOffset: 7 },
      { side: 'left', floorY: 3080, targetRoomId: 'hall_east_vestibule', rowOffset: 8 },
      { side: 'left', floorY: 3548, targetRoomId: 'prison_save', rowOffset: 9 },
      { side: 'right', floorY: 3548, targetRoomId: 'dock_sluice_passage', rowOffset: 9 },
    ];
    eastTower.leftRoomId = undefined;
    eastTower.rightRoomId = undefined;
    eastTower.shafts = [{ x1: 430, x2: 650, dir: 'up', targetRoomId: 'altar_cloud_bridge' }];
    syncCeilingsWithUpShafts('east_outer_tower', 'palace_timber');
    eastTower.ironGate = {
      id: 'gate_mist_archive',
      x: 820,
      topY: 0,
      bottomY: 760,
      gateKind: 'mist_only',
    };
    eastTower.climbWalls = [
      { x: 425, topY: 36, bottomY: 660 },
      { x: 670, topY: 36, bottomY: 660 },
    ];
    eastTower.solidBlocks = [
      // y=3548 -> y=3080 (中央 x=485..595 专留升降机井道！)
      { x: 640, y: 3420, w: 240, h: 32 },
      { x: 220, y: 3280, w: 240, h: 32 },
      { x: 600, y: 3180, w: 240, h: 32 },
      { x: 0, y: 3080, w: 430, h: 36 },
      { x: 650, y: 3080, w: 430, h: 36 },
      // y=3080 -> y=2680 (east_warp)
      { x: 230, y: 2940, w: 230, h: 32 },
      { x: 620, y: 2810, w: 240, h: 32 },
      { x: 650, y: 2680, w: 430, h: 36 },
      // y=2680 -> y=1920 (observatory_bridge)
      { x: 230, y: 2510, w: 230, h: 32 },
      { x: 620, y: 2340, w: 240, h: 32 },
      { x: 230, y: 2170, w: 230, h: 32 },
      { x: 620, y: 2040, w: 240, h: 32 },
      { x: 0, y: 1920, w: 430, h: 36 },
      { x: 650, y: 1920, w: 430, h: 36 },
      // y=1920 -> y=1160 (upper_library / clock_gear_hall)
      { x: 230, y: 1750, w: 230, h: 32 },
      { x: 620, y: 1580, w: 240, h: 32 },
      { x: 230, y: 1410, w: 230, h: 32 },
      { x: 620, y: 1280, w: 240, h: 32 },
      { x: 0, y: 1160, w: 430, h: 36 },
      { x: 650, y: 1160, w: 430, h: 36 },
      // y=1160 -> y=760 (secret_archive；以上零踏板！)
      { x: 340, y: 980, w: 240, h: 32 },
      { x: 600, y: 760, w: 480, h: 36 },
    ];
    eastTower.movingPlatforms = [
      { x1: 485, y1: 3500, x2: 485, y2: 2700, w: 110, speed: 1.2, style: 'bronze_lift' },
      { x1: 485, y1: 2660, x2: 485, y2: 1940, w: 110, speed: 1.25, style: 'bronze_lift' },
      { x1: 485, y1: 1900, x2: 485, y2: 1180, w: 110, speed: 1.25, style: 'bronze_lift' },
    ];
    eastTower.crumbleSlabs = [
      { id: 'cs_tow_1', x: 515, y: 3280, w: 105 },
      { id: 'cs_tow_2', x: 590, y: 870, w: 110 },
    ];
    eastTower.pickups = [
      { id: 'pk_tower_mp_up', kind: 'max_up', itemId: 'mp_vessel', x: 380, y: 3280 },
    ];
    eastTower.lanterns = [
      { x: 530, y: 3360 },
      { x: 530, y: 2420 },
      { x: 530, y: 1680 },
      { x: 295, y: 1020 },
      { x: 785, y: 940 },
    ];
    eastTower.hazards = [
      { kind: 'pendulum', x: 540, y: 2240, span: 145, speed: 1.9, phase: 0 },
      { kind: 'pendulum', x: 540, y: 880, span: 140, speed: 2.05, phase: 1.6 },
    ];
    eastTower.clockGears = [
      { x: 540, y: 3260, radius: 66, speed: 0.48, hasOrbitPlatforms: false },
      { x: 540, y: 2180, radius: 68, speed: 0.5, hasOrbitPlatforms: false },
      { x: 540, y: 940, radius: 70, speed: -0.52, hasOrbitPlatforms: false },
    ];
    eastTower.decorProps = [
      { kind: 'dragon_brazier', x: 285, y: 3548, scale: 0.92 },
      { kind: 'silk_banner', x: 540, y: 2740, scale: 0.88 },
      { kind: 'silk_banner', x: 540, y: 1980, scale: 0.88 },
      { kind: 'silk_banner', x: 540, y: 1230, scale: 0.88 },
      { kind: 'silk_banner', x: 360, y: 830, scale: 0.86 },
    ];
    eastTower.torches = [
      { x: 300, y: 3006 },
      { x: 780, y: 2606 },
      { x: 320, y: 1086 },
      { x: 700, y: 686 },
    ];
    eastTower.spawns = [
      { kind: 'bronze_guard', x: 740, y: 3420 },
      { kind: 'bell_gargoyle', x: 540, y: 2420 },
      { kind: 'bronze_guard', x: 320, y: 1920 },
      { kind: 'bronze_guard', x: 760, y: 1160 },
      { kind: 'bell_gargoyle', x: 520, y: 890 },
    ];
  }

  // outer_wall_upper: 1x6 (1080x2200, y=0..5), y=960..2116 之间零悬台仅 twin climbWalls，严格锁死壁虎游墙!
  const outerUpper = byId.get('outer_wall_upper');
  if (outerUpper) {
    outerUpper.pixelW = 1080;
    outerUpper.pixelH = 2200;
    outerUpper.focalY = 2116;
    outerUpper.groundNodes = [
      { x: 0, y: 2116, style: 'marble' },
      { x: 1080, y: 2116, style: 'marble' },
    ];
    outerUpper.pavilions = [{ x: 444, y: 2116, w: 192, hasPillars: false }];
    outerUpper.sideDoors = [
      { side: 'left', floorY: 356, targetRoomId: 'sky_altar', rowOffset: 0 },
      { side: 'left', floorY: 960, targetRoomId: 'altar_east_terrace', rowOffset: 2 },
      { side: 'right', floorY: 960, targetRoomId: 'celestial_bell_sanctum', rowOffset: 2 },
      { side: 'left', floorY: 2116, targetRoomId: 'outer_wall_armory', rowOffset: 5 },
    ];
    outerUpper.leftRoomId = undefined;
    outerUpper.rightRoomId = undefined;
    outerUpper.climbWalls = [
      { x: 445, topY: 960, bottomY: 2010 },
      { x: 635, topY: 960, bottomY: 2010 },
    ];
    outerUpper.solidBlocks = [
      { x: 0, y: 356, w: 420, h: 110, blocking: true },
      { x: 480, y: 500, w: 220, h: 32 },
      { x: 380, y: 650, w: 220, h: 32 },
      { x: 500, y: 800, w: 220, h: 32 },
      { x: 0, y: 960, w: 400, h: 36 },
      { x: 680, y: 960, w: 400, h: 36 },
    ];
    outerUpper.decorProps = outerUpper.decorProps?.map((dp) =>
      dp.kind === 'dragon_brazier' ? { ...dp, y: 2116 } : dp
    );
    outerUpper.torches = outerUpper.torches.map((tc) =>
      tc.y > 1000 ? { ...tc, y: 2040 } : tc
    );
  }

  // outer_wall_lower: 1x7 (1080x2560, y=6..12)
  const outerLower = byId.get('outer_wall_lower');
  if (outerLower) {
    outerLower.pixelW = 1080;
    outerLower.pixelH = 2560;
    outerLower.focalY = 2476;
    outerLower.groundNodes = [
      { x: 0, y: 2476, style: 'marble' },
      { x: 1080, y: 2476, style: 'marble' },
    ];
    outerLower.sideDoors = [
      { side: 'left', floorY: 520, targetRoomId: 'secret_thunder_vault', rowOffset: 1 },
      { side: 'left', floorY: 920, targetRoomId: 'clock_east_bastion', rowOffset: 2 },
      { side: 'right', floorY: 920, targetRoomId: 'outer_wall_telescope', rowOffset: 2 },
      { side: 'left', floorY: 2476, targetRoomId: 'dock_shipyard_hall', rowOffset: 6 },
      { side: 'right', floorY: 2476, targetRoomId: 'dock_east_beacon', rowOffset: 6 },
    ];
    outerLower.leftRoomId = undefined;
    outerLower.rightRoomId = undefined;
    outerLower.climbWalls = [
      { x: 445, topY: 36, bottomY: 430 },
      { x: 635, topY: 36, bottomY: 430 },
    ];
    outerLower.solidBlocks = [
      { x: 0, y: 520, w: 400, h: 36 },
      { x: 0, y: 920, w: 400, h: 36 },
      { x: 680, y: 920, w: 400, h: 36 },
      { x: 215, y: 1180, w: 215, h: 32 },
      { x: 650, y: 1440, w: 215, h: 32 },
      { x: 215, y: 1700, w: 215, h: 32 },
      { x: 650, y: 1960, w: 215, h: 32 },
      { x: 215, y: 2220, w: 215, h: 32 },
    ];
    outerLower.movingPlatforms = [
      { x1: 450, y1: 880, x2: 450, y2: 560, w: 180, speed: 1.0, style: 'bronze_lift' },
      { x1: 450, y1: 2440, x2: 450, y2: 960, w: 180, speed: 1.3, style: 'bronze_lift' },
    ];
    outerLower.decorProps = outerLower.decorProps?.map((dp) =>
      dp.kind === 'dragon_brazier' ? { ...dp, y: 2476 } : { ...dp, y: 920 }
    );
    outerLower.torches = outerLower.torches.map((tc) =>
      tc.y > 1000 ? { ...tc, y: 2400 } : tc
    );
    outerLower.spawns = [
      { kind: 'bronze_guard', x: 290, y: 920 },
      { kind: 'bone_archer', x: 660, y: 1960 },
      { kind: 'bell_gargoyle', x: 540, y: 1520 },
    ];
  }

  // sunken_ferry_shaft: 1x4 (1080x1640, y=12..15)
  const ferryShaft = byId.get('sunken_ferry_shaft');
  if (ferryShaft) {
    ferryShaft.pixelW = 1080;
    ferryShaft.pixelH = 1640;
    ferryShaft.focalY = 1556;
    ferryShaft.groundNodes = [
      { x: 0, y: 1556, style: 'crypt_stone' },
      { x: 1080, y: 1556, style: 'crypt_stone' },
    ];
    ferryShaft.waterZones = [{ x1: 320, x2: 650, surfaceY: 1564 }];
    ferryShaft.sideDoors = [
      { side: 'right', floorY: 356, targetRoomId: 'bamboo_cliff_grotto', rowOffset: 0 },
      { side: 'right', floorY: 764, targetRoomId: 'sunken_reed_wharf', rowOffset: 1 },
      { side: 'right', floorY: 1556, targetRoomId: 'mine_vertical_pit', rowOffset: 3 },
    ];
    ferryShaft.leftRoomId = undefined;
    ferryShaft.rightRoomId = undefined;
    ferryShaft.solidBlocks = [
      { x: 660, y: 356, w: 420, h: 36 },
      { x: 210, y: 492, w: 215, h: 32 },
      { x: 635, y: 628, w: 215, h: 32 },
      { x: 660, y: 764, w: 420, h: 36 },
      { x: 210, y: 956, w: 215, h: 32 },
      { x: 635, y: 1148, w: 215, h: 32 },
      { x: 210, y: 1340, w: 215, h: 32 },
    ];
    ferryShaft.movingPlatforms = [
      { x1: 450, y1: 1510, x2: 450, y2: 396, w: 165, speed: 1.15, style: 'bronze_lift' },
    ];
  }

  // mine_vertical_pit: 1x6 (1080x2280, y=15..20)，严保 sec_mine_geode & mine_warp 左耳室！
  const minePit = byId.get('mine_vertical_pit');
  if (minePit) {
    minePit.pixelW = 1080;
    minePit.pixelH = 2280;
    minePit.focalY = 2196;
    minePit.groundNodes = [
      { x: 0, y: 2196, style: 'crypt_stone' },
      { x: 1080, y: 2196, style: 'crypt_stone' },
    ];
    minePit.sideDoors = [
      { side: 'left', floorY: 356, targetRoomId: 'sunken_ferry_shaft', rowOffset: 0 },
      { side: 'right', floorY: 356, targetRoomId: 'mine_timber_gallery', rowOffset: 0 },
      { side: 'left', floorY: 1120, targetRoomId: 'mine_warp', rowOffset: 2 },
      {
        side: 'left',
        floorY: 2196,
        targetRoomId: 'mine_secret_geode',
        rowOffset: 5,
        secretWallId: 'sec_mine_geode',
      },
      { side: 'right', floorY: 2196, targetRoomId: 'mine_deep_vein', rowOffset: 5 },
    ];
    minePit.leftRoomId = undefined;
    minePit.rightRoomId = undefined;
    minePit.solidBlocks = [
      { x: 0, y: 356, w: 390, h: 36 },
      { x: 690, y: 356, w: 390, h: 36 },
      { x: 210, y: 540, w: 215, h: 32 },
      { x: 645, y: 730, w: 215, h: 32 },
      { x: 210, y: 920, w: 215, h: 32 },
      { x: 0, y: 1120, w: 400, h: 36 },
      { x: 645, y: 1340, w: 215, h: 32 },
      { x: 210, y: 1560, w: 215, h: 32 },
      { x: 645, y: 1780, w: 215, h: 32 },
      { x: 210, y: 2000, w: 215, h: 32 },
    ];
    minePit.movingPlatforms = [
      { x1: 450, y1: 2150, x2: 450, y2: 396, w: 175, speed: 1.25, style: 'bronze_lift' },
    ];
    minePit.spawns = [
      { kind: 'bell_gargoyle', x: 540, y: 980 },
      { kind: 'bronze_guard', x: 540, y: 2196 },
    ];
  }

  // dock_shipyard_hall: 4x3 (3200x1200, y=12..14) 三层沉舰干船坞巨殿，井口落左岸 col 39.50 对齐 dock_underwater_tunnel！
  const shipyard = byId.get('dock_shipyard_hall');
  if (shipyard) {
    shipyard.pixelW = 3200;
    shipyard.pixelH = 1200;
    shipyard.focalY = 806;
    shipyard.groundNodes = shipyard.groundNodes.map((gn) => ({ ...gn, y: gn.y + 320 }));
    shipyard.waterZones = shipyard.waterZones.map((wz) => ({ ...wz, surfaceY: wz.surfaceY + 320 }));
    shipyard.sideDoors = [
      { side: 'left', floorY: 356, targetRoomId: 'dock_sluice_passage', rowOffset: 0 },
      { side: 'right', floorY: 356, targetRoomId: 'outer_wall_lower', rowOffset: 0 },
      { side: 'left', floorY: 764, targetRoomId: 'dock_flooded_hold', rowOffset: 1 },
    ];
    shipyard.leftRoomId = undefined;
    shipyard.rightRoomId = undefined;
    // cols 39..42, dock_underwater_tunnel [35..39] overlaps col 39 -> 400px [310..490] (dry left shore!)
    shipyard.shafts = [{ x1: 310, x2: 490, dir: 'down', targetRoomId: 'dock_underwater_tunnel' }];
    shipyard.ironGate = {
      id: 'gate_shipyard_east_lever',
      x: 2920,
      topY: 0,
      bottomY: 1124,
      gateKind: 'lever_shortcut',
      leverSide: 'left',
    };
    shipyard.pavilions = [{ x: 304, y: 1124, w: 192, hasPillars: false }];
    shipyard.solidBlocks = [
      { x: 0, y: 356, w: 380, h: 36 },
      { x: 2940, y: 356, w: 260, h: 36 },
      { x: 0, y: 764, w: 380, h: 36 },
      { x: 460, y: 980, w: 230, h: 32 },
      { x: 520, y: 630, w: 240, h: 32 },
      { x: 880, y: 890, w: 280, h: 34 },
      { x: 1380, y: 806, w: 480, h: 36 },
      { x: 2040, y: 890, w: 280, h: 34 },
      { x: 2420, y: 980, w: 240, h: 32 },
      { x: 2540, y: 630, w: 240, h: 32 },
      { x: 2560, y: 492, w: 240, h: 32 },
      { x: 2660, y: 356, w: 230, h: 36 },
      { x: 420, y: 492, w: 240, h: 32 },
    ];
    shipyard.pickups = shipyard.pickups.map((pk) => ({
      ...pk,
      y: pk.y !== undefined ? pk.y + 320 : undefined,
    }));
    shipyard.steles = [{ id: 'stele_shipyard_fleet', x: 3060 }];
    shipyard.decorProps = shipyard.decorProps?.map((dp) => ({ ...dp, y: dp.y + 320 }));
    shipyard.torches = shipyard.torches.map((tc) => ({ ...tc, y: tc.y + 320 }));
    shipyard.spawns = shipyard.spawns.map((sp) => ({
      ...sp,
      y: sp.y !== undefined ? sp.y + 320 : undefined,
    }));
  }

  // abyss_ascension_shaft: 1x6 (1080x2280, y=14..19), 严保 gate_ascension_ice(ice_phoenix)@y=720!
  const ascShaft = byId.get('abyss_ascension_shaft');
  if (ascShaft) {
    ascShaft.pixelW = 1080;
    ascShaft.pixelH = 2280;
    ascShaft.focalY = 2196;
    ascShaft.groundNodes = [
      { x: 0, y: 2196, style: 'crypt_stone' },
      { x: 1080, y: 2196, style: 'crypt_stone' },
    ];
    ascShaft.sideDoors = [
      { side: 'left', floorY: 720, targetRoomId: 'catacomb_prison_vault', rowOffset: 1 },
      { side: 'right', floorY: 720, targetRoomId: 'dock_underwater_tunnel', rowOffset: 1 },
    ];
    ascShaft.leftRoomId = undefined;
    ascShaft.rightRoomId = undefined;
    ascShaft.shafts = [
      { x1: 450, x2: 630, dir: 'up', targetRoomId: 'secret_ice_spring' },
      { x1: 450, x2: 630, dir: 'down', targetRoomId: 'abyss_east_corridor' },
    ];
    syncCeilingsWithUpShafts('abyss_ascension_shaft', 'crypt_vault');
    ascShaft.ironGate = {
      id: 'gate_ascension_ice',
      x: 680,
      topY: 0,
      bottomY: 720,
      gateKind: 'ice_phoenix',
    };
    ascShaft.pavilions = [{ x: 444, y: 2196, w: 194, hasPillars: false }];
    // 全登攀踏石仅排布于 gate_ascension_ice (x=680) 左侧，杜绝不解寒凰印锁直跃东侧归墟水洞！
    ascShaft.solidBlocks = [
      { x: 0, y: 720, w: 430, h: 36 },
      { x: 540, y: 720, w: 540, h: 36 },
      { x: 340, y: 540, w: 185, h: 32 },
      { x: 440, y: 340, w: 185, h: 32 },
      { x: 420, y: 156, w: 185, h: 28 },
      { x: 210, y: 960, w: 215, h: 32 },
      { x: 635, y: 1180, w: 215, h: 32 },
      { x: 210, y: 1400, w: 215, h: 32 },
      { x: 635, y: 1620, w: 215, h: 32 },
      { x: 210, y: 1840, w: 215, h: 32 },
      { x: 635, y: 2040, w: 215, h: 32 },
    ];
    ascShaft.movingPlatforms = [
      { x1: 450, y1: 2140, x2: 450, y2: 760, w: 165, speed: 1.25, style: 'bronze_lift' },
    ];
    ascShaft.decorProps = [{ kind: 'guardian_statue', x: 180, y: 2196, scale: 0.94 }];
    ascShaft.torches = [{ x: 820, y: 644 }];
  }

  // nether_west_descent & nether_east_descent: 1x8 (1080x2960, y=21..28) 极渊双八层竖井
  const nWest = byId.get('nether_west_descent');
  if (nWest) {
    nWest.pixelW = 1080;
    nWest.pixelH = 2960;
    nWest.focalX = 540;
    nWest.focalY = 2876;
    nWest.groundNodes = [
      { x: 0, y: 2876, style: 'crypt_stone' },
      { x: 1080, y: 2876, style: 'crypt_stone' },
    ];
    nWest.ceilingSpans = [
      { x1: 0, x2: 450, bottomY: 34, style: 'crypt_vault' },
      { x1: 630, x2: 1080, bottomY: 34, style: 'crypt_vault' },
    ];
    nWest.shafts = [
      { x1: 450, x2: 630, dir: 'up', targetRoomId: 'mine_lava_bridge' },
      { x1: 450, x2: 630, dir: 'down', targetRoomId: 'dragon_tomb_west' },
    ];
    nWest.pavilions = [{ x: 444, y: 2876, w: 192, hasPillars: false }];
    nWest.sideDoors = [
      { side: 'left', floorY: 540, targetRoomId: 'nether_weeping_hall', rowOffset: 1 },
      { side: 'right', floorY: 920, targetRoomId: 'nether_soul_bridge', rowOffset: 2 },
      { side: 'right', floorY: 1720, targetRoomId: 'nether_pillar_hall', rowOffset: 4 },
    ];
    nWest.leftRoomId = undefined;
    nWest.rightRoomId = undefined;
    nWest.solidBlocks = [
      { x: 0, y: 540, w: 400, h: 36 },
      { x: 680, y: 920, w: 400, h: 36 },
      { x: 680, y: 1720, w: 400, h: 36 },
      { x: 220, y: 2680, w: 210, h: 32 },
      { x: 640, y: 2480, w: 210, h: 32 },
      { x: 220, y: 2280, w: 210, h: 32 },
      { x: 640, y: 2080, w: 210, h: 32 },
      { x: 220, y: 1900, w: 210, h: 32 },
      { x: 220, y: 1500, w: 210, h: 32 },
      { x: 640, y: 1300, w: 210, h: 32 },
      { x: 220, y: 1120, w: 210, h: 32 },
      { x: 220, y: 720, w: 210, h: 32 },
      { x: 640, y: 400, w: 210, h: 32 },
      { x: 440, y: 200, w: 200, h: 28 },
    ];
    nWest.movingPlatforms = [
      { x1: 450, y1: 2810, x2: 450, y2: 240, w: 180, speed: 1.3, style: 'bronze_lift' },
    ];
    nWest.decorProps = [
      { kind: 'coiled_pillar', x: 220, y: 2876, scale: 0.96 },
      { kind: 'dragon_brazier', x: 860, y: 2876, scale: 0.94 },
    ];
    nWest.torches = [
      { x: 880, y: 844 },
      { x: 840, y: 2802 },
    ];
    nWest.spawns = [
      { kind: 'bell_gargoyle', x: 540, y: 620 },
      { kind: 'demon_wolf', x: 320, y: 2876 },
      { kind: 'bronze_guard', x: 820, y: 1720 },
    ];
  }

  const nEast = byId.get('nether_east_descent');
  if (nEast) {
    nEast.pixelW = 1080;
    nEast.pixelH = 2960;
    nEast.focalX = 540;
    nEast.focalY = 2876;
    nEast.groundNodes = [
      { x: 0, y: 2876, style: 'crypt_stone' },
      { x: 1080, y: 2876, style: 'crypt_stone' },
    ];
    nEast.ceilingSpans = [
      { x1: 0, x2: 450, bottomY: 34, style: 'crypt_vault' },
      { x1: 630, x2: 1080, bottomY: 34, style: 'crypt_vault' },
    ];
    nEast.shafts = [
      { x1: 450, x2: 630, dir: 'up', targetRoomId: 'abyss_east_corridor' },
      { x1: 450, x2: 630, dir: 'down', targetRoomId: 'dragon_tomb_sanctuary' },
    ];
    nEast.pavilions = [{ x: 444, y: 2876, w: 192, hasPillars: false }];
    nEast.sideDoors = [
      { side: 'left', floorY: 920, targetRoomId: 'nether_lantern_avenue', rowOffset: 2 },
      { side: 'left', floorY: 1720, targetRoomId: 'nether_mirror_crypt', rowOffset: 4 },
      { side: 'right', floorY: 1720, targetRoomId: 'nether_east_ossuary', rowOffset: 4 },
    ];
    nEast.leftRoomId = undefined;
    nEast.rightRoomId = undefined;
    nEast.solidBlocks = [
      { x: 0, y: 920, w: 400, h: 36 },
      { x: 0, y: 1720, w: 400, h: 36 },
      { x: 680, y: 1720, w: 400, h: 36 },
      { x: 650, y: 2680, w: 210, h: 32 },
      { x: 230, y: 2480, w: 210, h: 32 },
      { x: 650, y: 2280, w: 210, h: 32 },
      { x: 230, y: 2080, w: 210, h: 32 },
      { x: 650, y: 1900, w: 210, h: 32 },
      { x: 650, y: 1500, w: 210, h: 32 },
      { x: 230, y: 1300, w: 210, h: 32 },
      { x: 650, y: 1120, w: 210, h: 32 },
      { x: 650, y: 680, w: 210, h: 32 },
      { x: 230, y: 440, w: 210, h: 32 },
      { x: 440, y: 200, w: 200, h: 28 },
    ];
    nEast.movingPlatforms = [
      { x1: 450, y1: 2810, x2: 450, y2: 240, w: 180, speed: 1.3, style: 'bronze_lift' },
    ];
    nEast.decorProps = [
      { kind: 'guardian_statue', x: 220, y: 2876, scale: 0.94 },
      { kind: 'coiled_pillar', x: 860, y: 2876, scale: 0.96 },
    ];
    nEast.torches = [
      { x: 200, y: 844 },
      { x: 840, y: 2802 },
    ];
    nEast.spawns = [
      { kind: 'bell_gargoyle', x: 540, y: 620 },
      { kind: 'bronze_guard', x: 260, y: 1720 },
      { kind: 'demon_wolf', x: 760, y: 2876 },
    ];
  }

  const rebuiltMultiStoryIds = new Set([
    'sky_altar',
    'celestial_bell_sanctum',
    'colosseum_grand_arena',
    'opera_boss_stage',
    'xiao_boss_hall',
    'alchemy_fire_sanctum',
    'library_grand_hall',
    'upper_library',
    'clock_boss_spire',
    'gate_1',
    'forge_boss_arena',
    'prison_boss_hall',
    'catacomb_hall',
    'dock_underwater_tunnel',
    'dock_abyss_trench',
    'nether_trial_colosseum',
    'nether_ancient_stele_room',
    'dragon_tomb_heart',
    'cloud_star_gallery',
    'chapel_cloud_stair',
    'west_cliff_watchtower',
    'west_cliff_pagoda',
    'entrance_imperial_plaza',
    'gate_2',
    'east_outer_tower',
    'outer_wall_upper',
    'outer_wall_lower',
    'sunken_ferry_shaft',
    'mine_vertical_pit',
    'dock_shipyard_hall',
    'abyss_ascension_shaft',
    'nether_west_descent',
    'nether_east_descent',
    'entrance_watch_loft',
    'hall_bell_tower',
    'clock_pendulum_vault',
    'mine_shaft_pocket',
    'abyss_rib_vault',
    'mine_magma_shaft',
    'mine_smelter_vault',
    'mine_obsidian_hall',
    'mine_deep_reliquary',
    'nether_weeping_hall',
    'nether_wisp_belfry',
    'dragon_west_belfry',
    'nether_bone_vault',
    'dock_reef_descent',
    'dock_sunken_galleon',
    'dock_abyssal_prow',
    'dock_pearl_grotto',
  ]);

  // 6) 自动根据 54×30 网格坐标精确校准其余多层房间侧门的 rowOffset（含 hall_corridor & outer_wall_battlement）
  const out = Array.from(byId.values());
  for (const rm of out) {
    const doors = getRoomSideDoors(rm);
    if (rm.gridH === 1) {
      if (rm.sideDoors) {
        rm.sideDoors = doors.map((d) => ({ ...d, rowOffset: 0 }));
      }
      continue;
    }
    if (rebuiltMultiStoryIds.has(rm.id)) continue;

    rm.sideDoors = doors.map((d) => {
      const nb = byId.get(d.targetRoomId);
      if (!nb) return d;
      const ovMin = Math.max(rm.mapY, nb.mapY);
      const ovMax = Math.min(rm.mapY + rm.gridH - 1, nb.mapY + nb.gridH - 1);
      let ovY = ovMin;
      if (ovMax > ovMin && d.floorY >= rm.pixelH - 90) {
        ovY = ovMax;
      }
      return {
        ...d,
        rowOffset: Math.max(0, Math.min(rm.gridH - 1, ovY - rm.mapY)),
      };
    });
    rm.leftRoomId = undefined;
    rm.rightRoomId = undefined;
  }

  return out;
}

/**
 * 适配 46×18 舒展大版图与全面屏横版视口 (`vH = 440` 时 `vW ≈ 955~1045px`)：
 * 单格窄厅统一拓宽至 ≥ 1080px 消弭右侧黑边，中等走廊适度放宽以体现关卡舒展尺度，
 * 同时保持两端接门地坪与内部跳台相对跨度 100% 像素级精确！
 */
function widenRoomToDispersedWidth(rm: BuiltRoom): BuiltRoom {
  const TARGET_MIN_W =
    rm.gridW <= 1 ? 1080 : Math.min(3200, Math.max(rm.pixelW, 920 + rm.gridW * 320));
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
 * 房间内部减密（响应玩家手感调疏需求）：
 * 1) 保留 Boss 战与伏魔封锁战，压降普通房过密刷怪并拉开同层怪物水平间距 (>= 420~480px)；
 * 2) 对非多层房间中叠床架屋的非必要中间悬石进行安全减负（绝不删堵门砖、井口台阶、宝物台与水上跳石）；
 * 3) 对窄房冗余摆件做留白间距梳理。
 */
function thinCrowdedRoomInteriors(rm: BuiltRoom): BuiltRoom {
  let spawns = [...rm.spawns];
  if (rm.special !== 'boss_room' && !rm.ambushSeal && spawns.length > 1) {
    const sorted = [...spawns].sort((a, b) => a.x - b.x);
    const minGap = rm.pixelW <= 1250 ? 480 : 420;
    const cap =
      rm.pixelH > 560
        ? Math.min(6, Math.max(3, Math.round((rm.pixelW * rm.pixelH) / 480000)))
        : rm.pixelW <= 1250
          ? 2
          : rm.pixelW <= 2050
            ? 3
            : rm.pixelW <= 2850
              ? 4
              : 5;

    const kept: typeof spawns = [];
    for (const sp of sorted) {
      const sy = sp.y ?? 390;
      const tooCloseSameTier = kept.some(
        (k) => Math.abs(k.x - sp.x) < minGap && Math.abs((k.y ?? 390) - sy) < 96
      );
      if (!tooCloseSameTier) {
        kept.push(sp);
      } else {
        // 尽量保留尚未出现的异种怪，但仅当同层间隔至少 > 290px
        const isNovel = !kept.some((k) => k.kind === sp.kind);
        const notStacked = kept.every(
          (k) => Math.abs(k.x - sp.x) >= 290 || Math.abs((k.y ?? 390) - sy) >= 96
        );
        if (isNovel && notStacked && kept.length < cap) {
          kept.push(sp);
        }
      }
    }
    if (kept.length > cap) {
      // 保留首尾哨兵与中间代表怪，均匀稀疏
      const thinned: typeof spawns = [kept[0]];
      const innerCount = cap - 2;
      for (let i = 1; i <= innerCount; i++) {
        const idx = Math.round((i * (kept.length - 1)) / (innerCount + 1));
        if (!thinned.includes(kept[idx])) thinned.push(kept[idx]);
      }
      thinned.push(kept[kept.length - 1]);
      spawns = thinned;
    } else {
      spawns = kept;
    }
  }

  // 对普通平层拥挤平台做安全减密（仅剪除被周围已保留跳台在 160×65 范围内覆盖的纯冗余踏板）
  let solidBlocks = rm.solidBlocks ? [...rm.solidBlocks] : undefined;
  const totalPlats =
    (solidBlocks?.length || 0) +
    rm.pavilions.length +
    (rm.crumbleSlabs?.length || 0) +
    (rm.movingPlatforms?.length || 0);
  if (solidBlocks && rm.pixelH <= 560 && totalPlats >= 5) {
    const isProtectedBlock = (sb: SolidBlock): boolean => {
      if (sb.blocking) return true;
      if (sb.x <= 32 || sb.x + sb.w >= rm.pixelW - 32) return true;
      const cx = sb.x + sb.w * 0.5;
      if (rm.shafts.some((sh) => sb.x + sb.w >= sh.x1 - 140 && sb.x <= sh.x2 + 140)) return true;
      if (rm.waterZones.some((wz) => sb.x + sb.w >= wz.x1 - 40 && sb.x <= wz.x2 + 40)) return true;
      if (
        rm.pickups.some(
          (pk) =>
            pk.x >= sb.x - 30 &&
            pk.x <= sb.x + sb.w + 30 &&
            Math.abs((pk.y ?? sb.y) - sb.y) < 34
        )
      ) {
        return true;
      }
      if (rm.npcs.some((n) => Math.abs(n.x - cx) < sb.w * 0.5 + 32)) return true;
      if (rm.steles?.some((st) => Math.abs(st.x - cx) < sb.w * 0.5 + 32)) return true;
      return false;
    };

    const protectedList = solidBlocks.filter(isProtectedBlock);
    const optionalList = solidBlocks.filter((sb) => !isProtectedBlock(sb));
    const finalBlocks = [...protectedList];
    for (const opt of optionalList) {
      const ocx = opt.x + opt.w * 0.5;
      const redundantNear = finalBlocks.some((kept) => {
        const kcx = kept.x + kept.w * 0.5;
        return Math.abs(kcx - ocx) <= 160 && Math.abs(kept.y - opt.y) <= 65;
      });
      if (!redundantNear) {
        finalBlocks.push(opt);
      }
    }
    solidBlocks = finalBlocks;
  }

  // 窄房装饰物去拥挤：超过 3 件且间距 < 180px 时适度留白
  let decorProps = rm.decorProps ? [...rm.decorProps] : undefined;
  if (decorProps && rm.pixelW <= 1250 && decorProps.length > 3) {
    const keptDecor: typeof decorProps = [];
    for (const dp of decorProps) {
      const isFocal = dp.kind === 'dragon_brazier' || dp.kind === 'guardian_statue';
      const tooClose = keptDecor.some((k) => Math.abs(k.x - dp.x) < 180);
      if (!tooClose || (isFocal && keptDecor.length < 3)) {
        keptDecor.push(dp);
      }
    }
    decorProps = keptDecor;
  }

  return {
    ...rm,
    spawns,
    solidBlocks,
    decorProps,
  };
}

/**
 * 180° 九幽倒悬里城生成器（完整镜像翻转全部 42 座手工关卡、破壁密室与门廊，组成超 200% 双城探索终局！）
 */
function createInvertedCastleRooms(normalRooms: BuiltRoom[]): BuiltRoom[] {
  const invertedUpgradePickups: Record<string, ScenePickup[]> = {
    west_armory: [{ id: 'inv_pk_gs3', kind: 'weapon', itemId: 'greatsword_3', x: 520 }],
    secret_archive: [{ id: 'inv_pk_sw3', kind: 'weapon', itemId: 'sword_3', x: 390 }],
    relic_double_jump: [{ id: 'inv_pk_dj_hp', kind: 'max_up', itemId: 'hp_vessel', x: 420 }],
    relic_mist_vault: [{ id: 'inv_pk_dg3', kind: 'weapon', itemId: 'daggers_3', x: 470, y: 372 }],
    relic_grapple_vault: [{ id: 'inv_pk_gp_mp', kind: 'max_up', itemId: 'mp_vessel', x: 440 }],
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
      { id: 'inv_pk_ice_hp', kind: 'max_up', itemId: 'hp_vessel', x: 395, y: 280 },
      { id: 'inv_pk_ice_wine', kind: 'consumable', itemId: 'tiger_bone_wine', x: 495, y: 280 },
    ],
    secret_library_study: [
      { id: 'inv_pk_study_jz', kind: 'consumable', itemId: 'jiuzhuan_jin_dan', x: 420 },
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

    const origDoors = getRoomSideDoors(rm);
    const distinctFloors = [...new Set(origDoors.map((d) => Math.round(d.floorY / 20) * 20))].sort(
      (a, b) => a - b
    );
    const isMultiTierRoom = rm.pixelH > 560 && distinctFloors.length >= 2;
    const origRowKeys = [...new Set(origDoors.map((d) => d.rowOffset ?? 0))].sort((a, b) => a - b);
    const origFloorTiers = origRowKeys.map((rKey) => {
      const hit = origDoors.find((d) => (d.rowOffset ?? 0) === rKey);
      return hit ? hit.floorY : rm.pixelH - 76;
    });

    const flippedSideDoors: SideDoor[] = origDoors.map((d) => {
      const invRow = d.rowOffset !== undefined ? rm.gridH - 1 - d.rowOffset : 0;
      let mappedFloorY = d.floorY;
      if (isMultiTierRoom) {
        const rowIdx = origRowKeys.indexOf(d.rowOffset ?? 0);
        const mirroredTier =
          rowIdx >= 0 ? origFloorTiers[origFloorTiers.length - 1 - rowIdx] : d.floorY;
        mappedFloorY = Math.max(180, Math.min(rm.pixelH - 56, mirroredTier));
      }
      return {
        side: d.side === 'left' ? 'right' : 'left',
        floorY: mappedFloorY,
        targetRoomId: d.targetRoomId,
        targetFloorY: d.targetFloorY,
        rowOffset: invRow,
        secretWallId: d.secretWallId ? `inv_${d.secretWallId}` : undefined,
      };
    });

    const flippedWaterZones = rm.waterZones.map((wz) => ({
      x1: W - wz.x2,
      x2: W - wz.x1,
      surfaceY: wz.surfaceY,
      liquidKind: wz.liquidKind,
    }));
    const tempFlippedRoom = {
      groundNodes: flippedNodes,
      waterZones: flippedWaterZones,
    } as BuiltRoom;

    const mergedSolidBlocks: SolidBlock[] = rm.solidBlocks
      ? rm.solidBlocks.map((sb) => {
          const fx = W - sb.x - sb.w;
          const wasResting = isGroundRestingSolidBlock(rm, sb);
          const fGround = sampleSolidGroundY(tempFlippedRoom, fx + sb.w * 0.5);
          const fh =
            wasResting && fGround - sb.y <= 76
              ? Math.max(38, Math.round(fGround - sb.y + 6))
              : Math.min(sb.h, 38);
          return {
            x: fx,
            y: sb.y,
            w: sb.w,
            h: fh,
            blocking: false,
          };
        })
      : [];

    // 多层竖塔倒悬后，确保每一扇分标高侧门脚下均有承重石门台且垂直跨度不超过 120px
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
      if (isMultiTierRoom) {
        const tierYs = [
          ...new Set([
            ...flippedSideDoors.map((d) => d.floorY),
            sampleSolidGroundY(tempFlippedRoom, Math.round(W * 0.5)),
          ]),
        ].sort((a, b) => a - b);
        for (let ti = 0; ti < tierYs.length - 1; ti++) {
          const upperY = tierYs[ti];
          const lowerY = tierYs[ti + 1];
          if (lowerY - upperY > 195) {
            const steps = Math.ceil((lowerY - upperY) / 112) - 1;
            for (let si = 1; si <= steps; si++) {
              const sy = Math.round(upperY + ((lowerY - upperY) * si) / (steps + 1));
              const hasStepNear = mergedSolidBlocks.some((sb) => Math.abs(sb.y - sy) <= 72);
              if (!hasStepNear) {
                const sx = Math.round(
                  si % 2 === 1 ? Math.max(120, W * 0.22) : Math.min(W - 340, W * 0.56)
                );
                mergedSolidBlocks.push({ x: sx, y: sy, w: 220, h: 30 });
              }
            }
          }
        }
      }
    }

    for (const sh of flippedShafts) {
      const midShaftX = Math.round((sh.x1 + sh.x2) * 0.5);
      const shaftFloor = sampleSolidGroundY(tempFlippedRoom, midShaftX);
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
        // 为倒悬后的上跃天井按真实层高自适应递推阶梯石台（直至 y <= 176），确保任意多层巨殿皆可跃出顶井且绝不重叠或堵井口！
        let curY = shaftFloor;
        let alt = 0;
        while (curY > 184) {
          const nextY = Math.max(168, curY - 112);
          const nearExisting = mergedSolidBlocks.find(
            (sb) =>
              sb.y >= nextY - 46 &&
              sb.y <= curY - 38 &&
              sb.x + sb.w >= sh.x1 - 135 &&
              sb.x <= sh.x2 + 135
          );
          if (nearExisting) {
            curY = nearExisting.y;
            alt++;
            continue;
          }
          const shift = alt % 2 === 0 ? -36 : 36;
          const bx = Math.max(44, Math.min(W - 194, midShaftX - 75 + shift));
          const collides = mergedSolidBlocks.some(
            (sb) =>
              Math.min(bx + 150, sb.x + sb.w) - Math.max(bx, sb.x) > 8 &&
              Math.abs(sb.y - nextY) < 42
          );
          if (!collides) {
            mergedSolidBlocks.push({ x: bx, y: nextY, w: 150, h: 28, blocking: false });
          }
          curY = nextY;
          alt++;
        }
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

    // 确保倒悬后的存档祠或八卦阵眼绝不落在下潜竖井坑口之上
    let invFocalX = W - rm.focalX;
    if (rm.special === 'save_shrine' || rm.special === 'warp_bagua') {
      const inDownHole = flippedShafts.some(
        (sh) => sh.dir === 'down' && invFocalX > sh.x1 - 58 && invFocalX < sh.x2 + 58
      );
      if (inDownHole) {
        invFocalX = invFocalX > W * 0.5 ? 250 : W - 250;
      }
    }
    const invFocalY = sampleSolidGroundY(tempFlippedRoom, invFocalX);

    const hasBridge = getArchBridgeGeometry(tempFlippedRoom) !== null;
    const findSafeDrySpawnX = (idealX: number): number | null => {
      for (const off of [0, -180, 180, -320, 320, -460, 460]) {
        const cx = Math.round(idealX + off);
        if (cx < 155 || cx > W - 155) continue;
        if (flippedShafts.some((sh) => sh.dir === 'down' && cx > sh.x1 - 24 && cx < sh.x2 + 24)) {
          continue;
        }
        if (
          !hasBridge &&
          flippedWaterZones.some((wz) => cx >= wz.x1 - 18 && cx <= wz.x2 + 18)
        ) {
          continue;
        }
        return cx;
      }
      return null;
    };

    const eliteSpawns: SceneSpawn[] = [];
    if (
      !isTrueFinalRoom &&
      !isEntryAltar &&
      rm.special !== 'save_shrine' &&
      rm.special !== 'warp_bagua' &&
      (!rm.isSecretRoom || rm.id === 'secret_sword_tomb')
    ) {
      const invEco =
        rm.region === 'gatehouse' ? REGION_ENEMY_ECOLOGY.main_hall : REGION_ENEMY_ECOLOGY[rm.region];
      const invSeed = hashRoomId(rm.id);
      const flyerKind: EnemyKind = invEco.air[invSeed % invEco.air.length];
      const groundKind1: EnemyKind = invEco.ground[invSeed % invEco.ground.length];
      const groundKind2: EnemyKind = invEco.ground[(invSeed + 1) % invEco.ground.length];
      if (W >= 1500) {
        eliteSpawns.push({ kind: flyerKind, x: Math.round(W * 0.28), y: 210 });
        const gx1 = findSafeDrySpawnX(W * 0.52);
        if (gx1 !== null) eliteSpawns.push({ kind: groundKind1, x: gx1 });
        const gx2 = findSafeDrySpawnX(W * 0.78);
        if (gx2 !== null && (gx1 === null || Math.abs(gx2 - gx1) > 140)) {
          eliteSpawns.push({ kind: groundKind2, x: gx2 });
        }
      } else {
        eliteSpawns.push({ kind: flyerKind, x: Math.round(W * 0.48), y: 200 });
      }
    }

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
      focalX: invFocalX,
      focalY: invFocalY,
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
        dir: hz.dir ? ((-hz.dir) as 1 | -1) : undefined,
      })),
      crumbleSlabs: rm.crumbleSlabs?.map((cs) => ({
        ...cs,
        id: `inv_${cs.id}`,
        x: W - cs.x - cs.w,
      })),
      decorProps: rm.decorProps?.map((dp) => ({ ...dp, x: W - dp.x })),
      waterZones: flippedWaterZones,
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
    solidBlocks: [],
    ceilingSpans: [],
    shafts: [],
    decorProps: [
      { kind: 'dragon_brazier', x: 500, y: 382, scale: 0.92 },
      { kind: 'dragon_brazier', x: 1000, y: 382, scale: 0.92 },
    ],
    waterZones: [],
    pavilions: [],
    archways: [],
    torches: [
      { x: 300, y: 340 },
      { x: 1200, y: 340 },
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
      // 非隐藏主城占基准 100%（双城主厅 200%，破壁踏入 14 座独立隐藏密室可突破至 228%，致敬月下 200.6%！）
      if (!rm.isSecretRoom) {
        this.normalCellCount += rm.gridW * rm.gridH;
      }
    }
    for (const irm of createInvertedCastleRooms(normals).map(sanitizeRoomDecorAndSpawns)) {
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
    const maxHeadClearance = cur.gridH > 1 ? 185 : 290;
    const doors = allDoors.filter((d) => {
      if (brokenSecretWalls && d.secretWallId && !brokenSecretWalls.includes(d.secretWallId)) {
        return false;
      }
      if (playerY !== undefined && (playerY < d.floorY - maxHeadClearance || playerY > d.floorY + 42)) {
        return false;
      }
      return true;
    });
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
    bossCleared: boolean,
    brokenSecretWalls?: string[],
    canBreakSealFromBelow = false
  ): { nextRoom: BuiltRoom; nextX: number; nextY: number; matchSealId?: string } | null {
    const map = cur.realm === 'inverted' ? this.invertedRooms : this.normalRooms;
    for (const sh of cur.shafts) {
      if (sh.dir !== dir) continue;
      if (sh.requireBossClear && !bossCleared) continue;
      if (
        dir === 'down' &&
        sh.sealId &&
        brokenSecretWalls &&
        !brokenSecretWalls.includes(sh.sealId)
      ) {
        continue;
      }
      if (px >= sh.x1 - 6 && px <= sh.x2 + 6) {
        const nextRoom = map.get(sh.targetRoomId);
        if (!nextRoom) return null;
        const oppDir = dir === 'up' ? 'down' : 'up';
        const matchSh = nextRoom.shafts.find(
          (ns) => ns.dir === oppDir && ns.targetRoomId === cur.id
        );
        if (
          dir === 'up' &&
          matchSh?.sealId &&
          brokenSecretWalls &&
          !brokenSecretWalls.includes(matchSh.sealId) &&
          !canBreakSealFromBelow
        ) {
          continue;
        }
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
        return { nextRoom, nextX: localNextX, nextY, matchSealId: matchSh?.sealId };
      }
    }
    return null;
  }

  public migrateSlotVisitedCells(slot: SaveSlotData): boolean {
    if ((slot.mapLayoutVersion ?? 1) >= MAP_LAYOUT_VERSION) return false;
    const roomEntries = slot.visitedRooms.filter((k) => !k.startsWith('cell:'));
    const nextVisited = new Set<string>(roomEntries);
    for (const k of roomEntries) {
      if (k.startsWith('inverted:')) {
        const rm = this.invertedRooms.get(k.slice('inverted:'.length));
        if (rm) {
          for (let dy = 0; dy < rm.gridH; dy++) {
            for (let dx = 0; dx < rm.gridW; dx++) {
              nextVisited.add(`cell:inverted:${rm.mapX + dx},${rm.mapY + dy}`);
            }
          }
        }
      } else {
        const id = k.startsWith('normal:') ? k.slice('normal:'.length) : k;
        const rm = this.normalRooms.get(id);
        if (rm) {
          for (let dy = 0; dy < rm.gridH; dy++) {
            for (let dx = 0; dx < rm.gridW; dx++) {
              nextVisited.add(`cell:normal:${rm.mapX + dx},${rm.mapY + dy}`);
            }
          }
        }
      }
    }
    slot.visitedRooms = [...nextVisited];
    slot.mapLayoutVersion = MAP_LAYOUT_VERSION;
    return true;
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
        if (rm && (rm.gridH === 1 || rm.pixelH <= 560)) {
          for (let dy = 0; dy < rm.gridH; dy++) {
            for (let dx = 0; dx < rm.gridW; dx++) invSet.add(`${rm.mapX + dx},${rm.mapY + dy}`);
          }
        }
      } else {
        const id = k.includes(':') ? k.split(':')[1] : k;
        const rm = this.normalRooms.get(id);
        if (rm && (rm.gridH === 1 || rm.pixelH <= 560)) {
          for (let dy = 0; dy < rm.gridH; dy++) {
            for (let dx = 0; dx < rm.gridW; dx++) normalSet.add(`${rm.mapX + dx},${rm.mapY + dy}`);
          }
        }
      }
    }

    const totalBase = Math.max(1, this.normalCellCount);
    const pct = Math.round(((normalSet.size + invSet.size) / totalBase) * 100);
    return Math.min(240, pct);
  }
}

export const WorldMap = new CastleWorldRegistry();
