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
export const MAP_GRID_TOTAL_W = 36;
export const MAP_GRID_TOTAL_H = 12;

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
  gatehouse: '第一幕 · 正阳皇城门',
  main_hall: '第二幕 · 奉天盘龙殿',
  alchemy: '第三幕 · 钦天炼丹司',
  colosseum: '第四幕 · 神武演武校场',
  forge: '第五幕 · 赤火铸剑坊',
  prison: '第六幕 · 九曲寒潭',
  shipyard: '第七幕 · 归墟艨艟船坞',
  catacomb: '第八幕 · 九幽荒冢',
  nether: '第九幕 · 九幽忘川极渊',
  library: '第十幕 · 万卷藏书阁',
  opera: '第十一幕 · 百戏梨园',
  clock_tower: '第十二幕 · 东垣望月塔',
  altar: '终幕 · 凌霄祭天坛',
};

export const INVERTED_REGION_NAMES: Record<RegionId, string> = {
  gatehouse: '终局逆城 · 倒悬苦竹渡',
  main_hall: '逆城 · 倒悬盘龙殿',
  alchemy: '逆城 · 倒悬炼丹司',
  colosseum: '逆城 · 倒悬神武场',
  forge: '逆城 · 倒悬铸剑坊',
  prison: '逆城 · 倒悬寒潭狱',
  shipyard: '逆城 · 倒悬沉舰坞',
  catacomb: '逆城 · 倒悬守陵冢',
  nether: '逆城 · 倒悬忘川渊',
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
      name: '端门镇魂祠',
      subtitle: '入殿前留档室',
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
      special: 'save_shrine',
      focalX: 400,
      focalY: 356,
      leftRoomId: 'gate_2',
      leftDoorFloorY: 384,
      rightRoomId: 'hall_courtyard',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 165, y: 384, style: 'stairs' },
        { x: 255, y: 356, style: 'marble' },
        { x: 545, y: 356, style: 'stairs' },
        { x: 635, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      solidBlocks: [],
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
        { x: 205, y: 312 },
        { x: 595, y: 312 },
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
      focalX: 380,
      focalY: 320,
      leftRoomId: 'west_cliff_watchtower',
      leftDoorFloorY: 384,
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
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [{ id: 'pk_relic_djump', kind: 'ability', itemId: 'double_jump', x: 380, y: 320 }],
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
      leftDoorFloorY: 408,
      rightRoomId: 'forge_antechamber',
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 75, y: 408, style: 'stairs' },
        { x: 115, y: 428, style: 'crypt_stone' },
        { x: 185, y: 428, style: 'stairs' },
        { x: 255, y: 382, style: 'marble' },
        { x: 540, y: 382, style: 'stairs' },
        { x: 608, y: 408, style: 'marble' },
        { x: 800, y: 408, style: 'marble' },
      ],
      solidBlocks: [],
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
        { x: 85, y: 340 },
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
        topY: 34,
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
      name: '寒潭地脉传送室',
      subtitle: '东塔底层龙脉传送阵',
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
      special: 'warp_bagua',
      warpName: '九曲寒潭传送阵',
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
      solidBlocks: [],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'crypt_vault' }],
      shafts: [{ x1: 500, x2: 700, dir: 'down', targetRoomId: 'relic_mist_vault' }],
      decorProps: [{ kind: 'incense_burner', x: 145, y: 366, scale: 0.9 }],
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
      name: '书阁梨园传送室',
      subtitle: '西楼乾坤龙脉阵',
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
      special: 'warp_bagua',
      warpName: '书阁梨园传送阵',
      focalX: 400,
      focalY: 356,
      leftRoomId: 'library_automaton_loft',
      leftDoorFloorY: 384,
      rightRoomId: 'opera_dressing_room',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 185, y: 384, style: 'stairs' },
        { x: 255, y: 356, style: 'marble' },
        { x: 545, y: 356, style: 'stairs' },
        { x: 615, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'bookshelf', x: 135, y: 384, scale: 0.92 },
        { kind: 'incense_burner', x: 615, y: 384, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 165, y: 312 },
        { x: 635, y: 312 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
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
      decorProps: [
        { kind: 'guardian_statue', x: 105, y: 396, scale: 0.94 },
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
      subtitle: '三格星汉长桥 · 天罡聚气扳指与飞燕宫灯',
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
        { x: 760, y: 412, style: 'stairs' },
        { x: 860, y: 372, style: 'marble' },
        { x: 1340, y: 372, style: 'stairs' },
        { x: 1440, y: 412, style: 'marble' },
        { x: 1620, y: 412, style: 'stairs' },
        { x: 1700, y: 388, style: 'marble' },
        { x: 1960, y: 388, style: 'stairs' },
        { x: 2040, y: 412, style: 'marble' },
        { x: 2200, y: 412, style: 'marble' },
      ],
      movingPlatforms: [
        {
          x1: 560,
          y1: 288,
          x2: 740,
          y2: 248,
          w: 120,
          speed: 0.76,
          style: 'wood_ferry',
        },
        {
          x1: 1340,
          y1: 248,
          x2: 1520,
          y2: 288,
          w: 120,
          speed: 0.76,
          phase: 3.14,
          style: 'wood_ferry',
        },
      ],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 310, y: 388, scale: 0.92 },
        { kind: 'coiled_pillar', x: 920, y: 372, scale: 0.94 },
        { kind: 'coiled_pillar', x: 1280, y: 372, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1890, y: 388, scale: 0.92 },
      ],
      steles: [{ id: 'stele_observatory_mirror', x: 420 }],
      waterZones: [],
      pavilions: [{ x: 965, y: 224, w: 270, hasPillars: false }],
      archways: [],
      torches: [
        { x: 495, y: 312 },
        { x: 1720, y: 312 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 480, y: 195 },
        { x: 860, y: 165 },
        { x: 1340, y: 165 },
        { x: 1720, y: 195 },
      ],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 760, y: 235 },
        { kind: 'opera_puppet', x: 1100, y: 372 },
        { kind: 'bell_gargoyle', x: 1620, y: 235 },
      ],
      pickups: [
        { id: 'pk_obs_qi_ring', kind: 'armor', itemId: 'celestial_qi_ring', x: 1100, y: 224 },
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
    opera_gallery: {
      hazards: [{ kind: 'pendulum', x: 830, y: 34, span: 152, speed: 1.85, phase: 1.1 }],
    },
    clock_gear_hall: {
      hazards: [
        { kind: 'spikes', x: 235, y: 442, span: 100 },
        { kind: 'spikes', x: 465, y: 442, span: 100 },
        { kind: 'pendulum', x: 400, y: 34, span: 148, speed: 2.05, phase: 0.7 },
      ],
    },
    catacomb_hall: {
      hazards: [
        { kind: 'spikes', x: 545, y: 450, span: 96 },
        { kind: 'spikes', x: 1190, y: 452, span: 105 },
        { kind: 'pendulum', x: 885, y: 34, span: 156, speed: 1.85, phase: 0.5 },
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
    'colosseum_grand_arena',
    'outer_wall_battlement',
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
        { x: 830, y: 268, w: 210, h: 30 },
      ],
      climbWalls: [
        { x: 555, topY: 72, bottomY: 408 },
        { x: 745, topY: 72, bottomY: 408 },
      ],
      ceilingSpans: [],
      shafts: [{ x1: 560, x2: 740, dir: 'up', targetRoomId: 'west_cliff_skybridge' }],
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
        { kind: 'bone_archer', x: 910, y: 268 },
        { kind: 'spirit_crow', x: 520, y: 185 },
        { kind: 'bone_archer', x: 220, y: 276 },
        { kind: 'paper_swordsman', x: 760, y: 408 },
      ],
      pickups: [
        { id: 'pk_battlement_spear', kind: 'weapon', itemId: 'spear_1', x: 195, y: 276 },
        { id: 'pk_battlement_mp', kind: 'consumable', itemId: 'huiqi_dan', x: 925, y: 268 },
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
      name: '朱雀街镇魂祠',
      subtitle: '外城中段留档室',
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
      special: 'save_shrine',
      focalX: 400,
      focalY: 356,
      leftRoomId: 'entrance_imperial_plaza',
      leftDoorFloorY: 384,
      rightRoomId: 'gate_2',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 185, y: 384, style: 'stairs' },
        { x: 255, y: 356, style: 'marble' },
        { x: 545, y: 356, style: 'stairs' },
        { x: 615, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'incense_burner', x: 265, y: 356, scale: 0.9 },
        { kind: 'incense_burner', x: 535, y: 356, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 165, y: 312 },
        { x: 635, y: 312 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    {
      id: 'outer_city_warp',
      name: '朱雀外城乾坤室',
      subtitle: '外城龙脉传送阵',
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
      special: 'warp_bagua',
      warpName: '朱雀外城乾坤阵',
      focalX: 400,
      focalY: 356,
      leftRoomId: 'gate_2',
      leftDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 185, y: 384, style: 'stairs' },
        { x: 255, y: 356, style: 'marble' },
        { x: 545, y: 356, style: 'stairs' },
        { x: 615, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 245, y: 356, scale: 0.9 },
        { kind: 'dragon_brazier', x: 555, y: 356, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 165, y: 312 },
        { x: 635, y: 312 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
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
        { x: 660, y: 276, w: 220, h: 32 },
        { x: 820, y: 176, w: 190, h: 30 },
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
        { kind: 'bone_archer', x: 770, y: 276 },
        { kind: 'bronze_guard', x: 1280, y: 404 },
      ],
      pickups: [],
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
      name: '文华殿镇魂祠',
      subtitle: '正殿东侧留档室',
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
      special: 'save_shrine',
      focalX: 400,
      focalY: 356,
      leftRoomId: 'hall_corridor',
      leftDoorFloorY: 384,
      rightRoomId: 'hall_east_vestibule',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 185, y: 384, style: 'stairs' },
        { x: 255, y: 356, style: 'marble' },
        { x: 545, y: 356, style: 'stairs' },
        { x: 615, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'incense_burner', x: 265, y: 356, scale: 0.9 },
        { kind: 'incense_burner', x: 535, y: 356, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 165, y: 312 },
        { x: 635, y: 312 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
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
      pickups: [],
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
        { x: 110, y: 324, w: 150, h: 32 },
        { x: 200, y: 240, w: 150, h: 32 },
        { x: 295, y: 156, w: 155, h: 30 },
        { x: 405, y: 82, w: 145, h: 26 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 396, bottomY: 32, style: 'crypt_vault' },
        { x1: 564, x2: 800, bottomY: 32, style: 'crypt_vault' },
      ],
      shafts: [
        { x1: 396, x2: 564, dir: 'up', targetRoomId: 'gate_2' },
        { x1: 595, x2: 740, dir: 'down', targetRoomId: 'prison_sluice_entry' },
      ],
      ironGate: {
        id: 'gate_forge_entry',
        x: 572,
        topY: 0,
        bottomY: 408,
        gateKind: 'heavy_weapon',
      },
      decorProps: [
        { kind: 'weapon_rack', x: 75, y: 408, scale: 0.92 },
        { kind: 'dragon_brazier', x: 365, y: 408, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [{ x: 590, y: 408, w: 156, hasPillars: false }],
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
        { x1: 1340, x2: 1500, dir: 'down', targetRoomId: 'catacomb_entry' },
      ],
      waterZones: [{ x1: 320, x2: 870, surfaceY: 404 }],
      decorProps: [
        { kind: 'guardian_statue', x: 145, y: 416, scale: 0.92 },
        { kind: 'dragon_brazier', x: 960, y: 416, scale: 0.9 },
      ],
      pavilions: [{ x: 1334, y: 416, w: 172, hasPillars: false }],
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
      name: '九幽镇魂古祠',
      subtitle: '帝陵中段留档室',
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
      special: 'save_shrine',
      focalX: 400,
      focalY: 368,
      leftRoomId: 'catacomb_entry',
      leftDoorFloorY: 396,
      rightRoomId: 'catacomb_hall',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'crypt_stone' },
        { x: 185, y: 396, style: 'stairs' },
        { x: 255, y: 368, style: 'marble' },
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

    // --- 第七幕 · 万卷藏书阁拓展 (2 座) ---
    {
      id: 'library_save',
      name: '翰林镇魂书祠',
      subtitle: '万宝斋旁留档室',
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
      special: 'save_shrine',
      focalX: 400,
      focalY: 356,
      leftRoomId: 'library_shop',
      leftDoorFloorY: 384,
      rightRoomId: 'library_grand_hall',
      rightDoorFloorY: 384,
      groundNodes: [
        { x: 0, y: 384, style: 'marble' },
        { x: 185, y: 384, style: 'stairs' },
        { x: 255, y: 356, style: 'palace_wood' },
        { x: 545, y: 356, style: 'stairs' },
        { x: 615, y: 384, style: 'marble' },
        { x: 800, y: 384, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'bookshelf', x: 125, y: 384, scale: 0.92 },
        { kind: 'incense_burner', x: 545, y: 356, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 215, y: 312 },
        { x: 635, y: 312 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
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
      subtitle: '双格悬钟高阁 · 唐制明光山文铠',
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
      rightDoorFloorY: 408,
      groundNodes: [
        { x: 0, y: 408, style: 'marble' },
        { x: 340, y: 408, style: 'stairs' },
        { x: 420, y: 376, style: 'marble' },
        { x: 1180, y: 376, style: 'stairs' },
        { x: 1260, y: 408, style: 'marble' },
        { x: 1600, y: 408, style: 'marble' },
      ],
      solidBlocks: [
        { x: 640, y: 264, w: 320, h: 32 },
      ],
      clockGears: [
        { x: 320, y: 224, radius: 64, speed: 0.56, hasOrbitPlatforms: true },
        { x: 1280, y: 224, radius: 64, speed: -0.56, hasOrbitPlatforms: true },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 34, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'giant_bell', x: 520, y: 215, scale: 0.92 },
        { kind: 'dragon_brazier', x: 800, y: 376, scale: 0.92 },
        { kind: 'giant_bell', x: 1080, y: 215, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 220, y: 332 },
        { x: 1380, y: 332 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 480, y: 185 },
        { x: 1120, y: 185 },
      ],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 560, y: 376 },
        { kind: 'bell_gargoyle', x: 800, y: 190 },
        { kind: 'bronze_guard', x: 1040, y: 376 },
      ],
      pickups: [
        { id: 'pk_clock_mingguang', kind: 'armor', itemId: 'mingguang_armor', x: 800, y: 264 },
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
      decorProps: [
        { kind: 'coiled_pillar', x: 160, y: 404, scale: 0.96 },
        { kind: 'dragon_brazier', x: 420, y: 372, scale: 0.94 },
        { kind: 'dragon_brazier', x: 880, y: 372, scale: 0.94 },
      ],
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
        { x: 315, y: 248, w: 170, h: 28 },
        { x: 320, y: 142, w: 160, h: 26 },
        { x: 290, y: 448, w: 200, h: 32 },
        { x: 460, y: 538, w: 200, h: 32 },
        { x: 290, y: 628, w: 200, h: 32 },
        { x: 470, y: 716, w: 190, h: 32 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 310, bottomY: 34, style: 'palace_timber' },
        { x1: 490, x2: 800, bottomY: 34, style: 'palace_timber' },
      ],
      shafts: [{ x1: 310, x2: 490, dir: 'up', targetRoomId: 'colosseum_west_gate' }],
      ironGate: {
        id: 'gate_west_watch_shortcut',
        x: 180,
        topY: 34,
        bottomY: 356,
        gateKind: 'lever_shortcut',
        leverSide: 'right',
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
        { kind: 'bone_archer', x: 390, y: 448 },
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
        { x: 520, y: 332, w: 160, h: 30 },
        { x: 610, y: 248, w: 160, h: 30 },
        { x: 540, y: 164, w: 160, h: 28 },
        { x: 575, y: 84, w: 150, h: 26 },
        { x: 1020, y: 368, w: 190, h: 32 },
      ],
      ceilingSpans: [
        { x1: 0, x2: 560, bottomY: 34, style: 'crypt_vault' },
        { x1: 740, x2: 1600, bottomY: 34, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 560, x2: 740, dir: 'up', targetRoomId: 'entrance_bamboo_woods' }],
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
        topY: 34,
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
        topY: 34,
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
        topY: 34,
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
        topY: 34,
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
        topY: 34,
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
      shafts: [{ x1: 1060, x2: 1240, dir: 'down', targetRoomId: 'abyss_dragon_vein_west' }],
      ironGate: {
        id: 'gate_forge_catacomb_mist',
        x: 780,
        topY: 34,
        bottomY: 408,
        gateKind: 'mist_only',
      },
      waterZones: [{ x1: 315, x2: 655, surfaceY: 428, liquidKind: 'lava' }],
      decorProps: [
        { kind: 'dragon_brazier', x: 180, y: 408, scale: 0.9 },
        { kind: 'guardian_statue', x: 1430, y: 408, scale: 0.92 },
      ],
      pavilions: [{ x: 1054, y: 408, w: 192, hasPillars: false }],
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
      name: '地脉镇龙古祠',
      subtitle: '九幽龙渊留档祠',
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
      special: 'save_shrine',
      focalX: 400,
      focalY: 368,
      leftRoomId: 'abyss_dragon_vein_west',
      leftDoorFloorY: 396,
      rightRoomId: 'abyss_dragon_spine',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'crypt_stone' },
        { x: 185, y: 396, style: 'stairs' },
        { x: 255, y: 368, style: 'marble' },
        { x: 545, y: 368, style: 'stairs' },
        { x: 615, y: 396, style: 'crypt_stone' },
        { x: 800, y: 396, style: 'crypt_stone' },
      ],
      solidBlocks: [],
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
        topY: 34,
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
        { x1: 180, x2: 350, dir: 'down', targetRoomId: 'nether_east_descent' },
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
        topY: 34,
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
      subtitle: '云顶戏楼瑶台 · 护法青丘玉狐祭坛',
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
      focalX: 960,
      focalY: 368,
      leftRoomId: 'opera_save',
      leftDoorFloorY: 404,
      rightRoomId: 'cloud_star_gallery',
      rightDoorFloorY: 404,
      groundNodes: [
        { x: 0, y: 404, style: 'marble' },
        { x: 640, y: 404, style: 'stairs' },
        { x: 720, y: 368, style: 'marble' },
        { x: 1180, y: 368, style: 'stairs' },
        { x: 1260, y: 404, style: 'marble' },
        { x: 1600, y: 404, style: 'marble' },
      ],
      solidBlocks: [],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'coiled_pillar', x: 260, y: 404, scale: 0.94 },
        { kind: 'dragon_brazier', x: 760, y: 368, scale: 0.92 },
        { kind: 'dragon_brazier', x: 1140, y: 368, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 460, y: 332 },
        { x: 1380, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'opera_puppet', x: 440, y: 404 },
        { kind: 'bell_gargoyle', x: 1320, y: 195 },
      ],
      pickups: [
        { id: 'pk_fam_fox', kind: 'ability', itemId: 'familiar_fox', x: 960, y: 368 },
      ],
    },

    // 19. 摘星霓裳云廊 (21,0 3×1)：横跨梨园天顶与凌霄祭天坛前庭的汉白玉云海长廊，凭【青丘玉狐】破除九幽幻障即可直达天坛！
    {
      id: 'cloud_star_gallery',
      name: '摘星霓裳云廊',
      subtitle: '三格云顶天街 · 青丘破障直通圜丘天坛',
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
      leftDoorFloorY: 412,
      rightRoomId: 'altar_forecourt',
      rightDoorFloorY: 412,
      groundNodes: [
        { x: 0, y: 412, style: 'marble' },
        { x: 720, y: 412, style: 'stairs' },
        { x: 820, y: 376, style: 'marble' },
        { x: 1460, y: 376, style: 'stairs' },
        { x: 1560, y: 412, style: 'marble' },
        { x: 2200, y: 412, style: 'marble' },
      ],
      solidBlocks: [],
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
        { kind: 'dragon_brazier', x: 1360, y: 376, scale: 0.94 },
        { kind: 'coiled_pillar', x: 1940, y: 412, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 660, y: 336 },
        { x: 1640, y: 336 },
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
        topY: 34,
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
      name: '断崖听涛古祠',
      subtitle: '西岭松风留档祠',
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
      special: 'save_shrine',
      focalX: 520,
      focalY: 372,
      rightRoomId: 'cliff_wind_pavilion',
      rightDoorFloorY: 404,
      groundNodes: [
        { x: 0, y: 404, style: 'flagstone' },
        { x: 310, y: 404, style: 'stairs' },
        { x: 390, y: 372, style: 'marble' },
        { x: 650, y: 372, style: 'stairs' },
        { x: 730, y: 404, style: 'flagstone' },
        { x: 1600, y: 404, style: 'flagstone' },
      ],
      solidBlocks: [],
      ceilingSpans: [],
      shafts: [{ x1: 910, x2: 1090, dir: 'down', targetRoomId: 'cliff_pine_trail' }],
      decorProps: [
        { kind: 'incense_burner', x: 405, y: 372, scale: 0.9 },
        { kind: 'incense_burner', x: 635, y: 372, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [{ x: 904, y: 404, w: 192, hasPillars: false }],
      archways: [],
      torches: [
        { x: 260, y: 332 },
        { x: 1280, y: 332 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
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
        { x: 315, y: 248, w: 170, h: 28 },
        { x: 320, y: 148, w: 160, h: 26 },
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
        { kind: 'bone_archer', x: 910, y: 604 },
        { kind: 'bronze_guard', x: 1260, y: 744 },
        { kind: 'bell_gargoyle', x: 1640, y: 260 },
        { kind: 'paper_swordsman', x: 2080, y: 356 },
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
          sealId: 'seal_colosseum_watchtower',
        },
      ],
      decorProps: [
        { kind: 'weapon_rack', x: 200, y: 408, scale: 0.94 },
        { kind: 'dragon_brazier', x: 780, y: 376, scale: 0.94 },
        { kind: 'dragon_brazier', x: 1120, y: 376, scale: 0.94 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [{ x: 1380, y: 332 }],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'demon_wolf', x: 880, y: 376 },
        { kind: 'bronze_guard', x: 1320, y: 408 },
      ],
      pickups: [],
    },
    {
      id: 'colosseum_grand_arena',
      name: '神武百战演武场',
      subtitle: '三格血月校场 · 破阵夺魁赐【神武吞猊山文甲】',
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
      special: 'relic_pedestal',
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
      spawns: [
        { kind: 'bronze_guard', x: 520, y: 412 },
        { kind: 'demon_wolf', x: 860, y: 376 },
        { kind: 'demon_wolf', x: 1340, y: 376 },
        { kind: 'bronze_guard', x: 1680, y: 412 },
        { kind: 'bone_archer', x: 440, y: 288 },
        { kind: 'bone_archer', x: 1740, y: 288 },
      ],
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
      name: '校场旌旗古祠',
      subtitle: '神武演武场东侧留档祠',
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
      special: 'save_shrine',
      focalX: 400,
      focalY: 368,
      leftRoomId: 'colosseum_grand_arena',
      leftDoorFloorY: 396,
      rightRoomId: 'colosseum_east_armory',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'marble' },
        { x: 190, y: 396, style: 'stairs' },
        { x: 260, y: 368, style: 'marble' },
        { x: 540, y: 368, style: 'stairs' },
        { x: 610, y: 396, style: 'marble' },
        { x: 800, y: 396, style: 'marble' },
      ],
      solidBlocks: [],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'incense_burner', x: 270, y: 368, scale: 0.9 },
        { kind: 'incense_burner', x: 530, y: 368, scale: 0.9 },
      ],
      waterZones: [],
      pavilions: [],
      archways: [],
      torches: [
        { x: 155, y: 322 },
        { x: 645, y: 322 },
      ],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
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
        topY: 34,
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
        { kind: 'bronze_guard', x: 280, y: 408 },
        { kind: 'opera_puppet', x: 1080, y: 408 },
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
        { kind: 'plague_toad', x: 1110, y: 348 },
        { kind: 'spirit_crow', x: 780, y: 210 },
        { kind: 'bone_archer', x: 1880, y: 408 },
      ],
      pickups: [],
    },
    {
      id: 'sunken_water_shrine',
      name: '沉渊镇水古祠',
      subtitle: '地下古渡留档祠',
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
      special: 'save_shrine',
      focalX: 400,
      focalY: 368,
      leftRoomId: 'sunken_reed_wharf',
      leftDoorFloorY: 396,
      rightRoomId: 'sunken_sluice_cavern',
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
        { x: 260, y: 324, w: 165, h: 30 },
        { x: 330, y: 238, w: 165, h: 30 },
        { x: 270, y: 154, w: 160, h: 28 },
        { x: 295, y: 80, w: 150, h: 26 },
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
        topY: 34,
        bottomY: 408,
        gateKind: 'lever_shortcut',
        leverSide: 'right',
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
        topY: 34,
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
      pickups: [{ id: 'pk_mine_deep_hp', kind: 'max_up', itemId: 'hp_vessel', x: 1370, y: 342 }],
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
        { x1: 480, y1: 376, x2: 860, y2: 376, w: 175, speed: 1.0, style: 'bronze_lift' },
      ],
      ceilingSpans: [{ x1: 0, x2: 2200, bottomY: 34, style: 'crypt_vault' }],
      shafts: [{ x1: 1080, x2: 1260, dir: 'down', targetRoomId: 'nether_west_descent' }],
      waterZones: [{ x1: 430, x2: 970, surfaceY: 432, liquidKind: 'lava' }],
      decorProps: [
        { kind: 'dragon_brazier', x: 220, y: 416, scale: 0.92 },
        { kind: 'guardian_statue', x: 1860, y: 416, scale: 0.94 },
      ],
      pavilions: [{ x: 1074, y: 416, w: 192, hasPillars: false }],
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
        topY: 36,
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
        { x: 0, y: 356, w: 280, h: 36 },
        { x: 340, y: 468, w: 220, h: 32 },
        { x: 160, y: 578, w: 220, h: 32 },
        { x: 360, y: 688, w: 220, h: 32 },
        { x: 0, y: 796, w: 260, h: 36 },
        { x: 540, y: 796, w: 260, h: 36 },
        { x: 290, y: 908, w: 220, h: 32 },
        { x: 460, y: 1018, w: 220, h: 32 },
        { x: 180, y: 1128, w: 220, h: 32 },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 36, style: 'palace_timber' }],
      shafts: [{ x1: 310, x2: 490, dir: 'down', targetRoomId: 'outer_wall_lower' }],
      ironGate: {
        id: 'gate_altar_outer_lever',
        x: 195,
        topY: 36,
        bottomY: 356,
        gateKind: 'lever_shortcut',
        leverSide: 'right',
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
        { x: 315, y: 248, w: 170, h: 28 },
        { x: 320, y: 142, w: 160, h: 26 },
        { x: 0, y: 796, w: 260, h: 36 },
        { x: 540, y: 796, w: 260, h: 36 },
        { x: 180, y: 940, w: 210, h: 32 },
        { x: 420, y: 1088, w: 210, h: 32 },
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
      name: '望海戍楼古祠',
      subtitle: '东垣外壁留档祠',
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
      special: 'save_shrine',
      focalX: 400,
      focalY: 368,
      leftRoomId: 'outer_wall_telescope',
      leftDoorFloorY: 396,
      rightRoomId: 'outer_wall_battlement',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'marble' },
        { x: 190, y: 396, style: 'stairs' },
        { x: 260, y: 368, style: 'marble' },
        { x: 540, y: 368, style: 'stairs' },
        { x: 610, y: 396, style: 'marble' },
        { x: 800, y: 396, style: 'marble' },
      ],
      solidBlocks: [],
      ceilingSpans: [],
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
      subtitle: '四格双层巨舰残骸洞窟 · 藏【鲛绡避水云霓裳】与《镇海楼船手札》',
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
      special: 'relic_pedestal',
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
      spawns: [
        { kind: 'bone_archer', x: 580, y: 468 },
        { kind: 'plague_toad', x: 1020, y: 592 },
        { kind: 'bell_gargoyle', x: 1260, y: 330 },
        { kind: 'bronze_guard', x: 1620, y: 486 },
        { kind: 'opera_puppet', x: 2180, y: 592 },
        { kind: 'demon_wolf', x: 2680, y: 804 },
      ],
      pickups: [
        {
          id: 'pk_shipyard_pearl_robe',
          kind: 'armor',
          itemId: 'sunken_pearl_robe',
          x: 1620,
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
        topY: 34,
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
        { kind: 'scroll_demon', x: 1120, y: 215 },
        { kind: 'bone_archer', x: 1330, y: 356 },
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
        { kind: 'bell_gargoyle', x: 1320, y: 205 },
        { kind: 'demon_wolf', x: 2180, y: 416 },
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
        { kind: 'bronze_guard', x: 560, y: 412 },
        { kind: 'bell_gargoyle', x: 1340, y: 205 },
        { kind: 'opera_puppet', x: 1840, y: 412 },
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
        { kind: 'bell_gargoyle', x: 1540, y: 205 },
        { kind: 'scroll_demon', x: 2280, y: 205 },
        { kind: 'bronze_guard', x: 3180, y: 420 },
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
        topY: 34,
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
        topY: 34,
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
      name: '忘川渡口古祠',
      subtitle: '九幽忘川中枢留档祠',
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
      special: 'save_shrine',
      focalX: 400,
      focalY: 368,
      leftRoomId: 'nether_soul_bridge',
      leftDoorFloorY: 396,
      rightRoomId: 'nether_lantern_avenue',
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
        { kind: 'bronze_guard', x: 520, y: 416 },
        { kind: 'opera_puppet', x: 940, y: 382 },
        { kind: 'demon_wolf', x: 1260, y: 382 },
        { kind: 'bell_gargoyle', x: 1100, y: 195 },
        { kind: 'bronze_guard', x: 1680, y: 416 },
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
        topY: 34,
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
        { kind: 'scroll_demon', x: 760, y: 205 },
        { kind: 'opera_puppet', x: 1580, y: 416 },
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
        { kind: 'corpse_soldier', x: 620, y: 416 },
        { kind: 'bone_archer', x: 1480, y: 352 },
        { kind: 'bell_gargoyle', x: 1960, y: 205 },
        { kind: 'bronze_guard', x: 2380, y: 416 },
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
        { kind: 'demon_wolf', x: 560, y: 420 },
        { kind: 'bell_gargoyle', x: 1680, y: 205 },
        { kind: 'bronze_guard', x: 2320, y: 420 },
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
      subtitle: '五格地心龙脉圣殿 · 供奉至宝【九幽祖龙逆鳞铠】',
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
      special: 'relic_pedestal',
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
      spawns: [
        { kind: 'bronze_guard', x: 480, y: 420 },
        { kind: 'bell_gargoyle', x: 1080, y: 200 },
        { kind: 'opera_puppet', x: 1720, y: 372 },
        { kind: 'demon_wolf', x: 2080, y: 372 },
        { kind: 'bell_gargoyle', x: 2720, y: 200 },
        { kind: 'bronze_guard', x: 3320, y: 420 },
      ],
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
        topY: 34,
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

  // 全城 30×8 立体堪舆网格坐标单一事实表（十大剧情关卡严丝合缝、零重叠、每场 Boss 门前必配留档祠！）
  const STAGE_GRID_LAYOUT: Record<string, { mapX: number; mapY: number }> = {
    // 第一幕 · 正阳皇城门 (12 座, x=0..14, Row 3..5)
    bamboo_outpost: { mapX: 0, mapY: 4 },
    entrance_bamboo_woods: { mapX: 1, mapY: 4 },
    bridge_save: { mapX: 3, mapY: 4 },
    gate_1: { mapX: 4, mapY: 4 },
    entrance_battlement_tower: { mapX: 4, mapY: 3 },
    entrance_imperial_plaza: { mapX: 6, mapY: 3 }, // 4×2 巨型立体广场 (6..9, 3..4)
    entrance_moat_cavern: { mapX: 6, mapY: 5 }, // 2×1 桥下暗渠 (6..7, 5)
    entrance_guard_pavilion: { mapX: 10, mapY: 3 },
    entrance_mid_save: { mapX: 10, mapY: 4 },
    gate_2: { mapX: 11, mapY: 3 }, // 3×2 皇城端门双层巨殿 (11..13, 3..4)
    outer_city_warp: { mapX: 14, mapY: 3 },
    gate_save: { mapX: 14, mapY: 4 },

    // 第二幕 · 奉天盘龙殿 (6 座, x=15..21, Row 3..5)
    hall_west_gallery: { mapX: 15, mapY: 3 }, // 2×1 (15..16, 3)
    hall_courtyard: { mapX: 15, mapY: 4 }, // 2×1 (15..16, 4)
    central_warp: { mapX: 15, mapY: 5 },
    hall_corridor: { mapX: 17, mapY: 3 }, // 3×2 皇家双层金銮殿 (17..19, 3..4)
    hall_save: { mapX: 20, mapY: 4 },
    hall_east_vestibule: { mapX: 21, mapY: 4 },

    // 第三幕 · 钦天炼丹司 (8 座, x=7..13, Row 1..2)
    secret_armory_vault: { mapX: 7, mapY: 2 },
    west_armory: { mapX: 8, mapY: 2 },
    alchemy_lab: { mapX: 9, mapY: 2 }, // 2×1 (9..10, 2)
    alchemy_foyer: { mapX: 11, mapY: 2 }, // 2×1 (11..12, 2)
    alchemy_herb_garden: { mapX: 13, mapY: 2 },
    alchemy_save: { mapX: 10, mapY: 1 },
    xiao_boss_hall: { mapX: 8, mapY: 1 }, // 2×1 (8..9, 1)
    relic_double_jump: { mapX: 7, mapY: 1 },

    // 第四幕 · 赤火铸剑坊 (8 座, x=7..13, Row 5..7)
    forge_antechamber: { mapX: 13, mapY: 5 },
    forge_smithy: { mapX: 12, mapY: 5 },
    forge_molten_hall: { mapX: 10, mapY: 5 }, // 2×1 (10..11, 5)
    forge_slag_bridge: { mapX: 9, mapY: 5 },
    forge_save: { mapX: 9, mapY: 6 },
    forge_boss_arena: { mapX: 7, mapY: 6 }, // 2×1 (7..8, 6)
    relic_ground_slam: { mapX: 7, mapY: 7 },
    secret_forge_smeltery: { mapX: 8, mapY: 7 },

    // 第五幕 · 九曲寒潭 (8 座, x=12..22, Row 5..6)
    prison_sluice_entry: { mapX: 12, mapY: 6 }, // 2×1 (12..13, 6)
    prison_waterway: { mapX: 14, mapY: 6 }, // 3×1 (14..16, 6)
    prison_cellblock: { mapX: 17, mapY: 6 },
    prison_pre_save: { mapX: 18, mapY: 6 },
    prison_boss_hall: { mapX: 19, mapY: 6 }, // 2×1 (19..20, 6)
    relic_mist_vault: { mapX: 21, mapY: 6 },
    secret_ice_spring: { mapX: 22, mapY: 6 },
    prison_save: { mapX: 21, mapY: 5 }, // 寒潭地脉传送阵

    // 第六幕 · 九幽荒冢 (6 座, x=11..19, Row 7)
    secret_catacomb_treasury: { mapX: 11, mapY: 7 },
    catacomb_west_crypt: { mapX: 12, mapY: 7 },
    catacomb_entry: { mapX: 13, mapY: 7 },
    catacomb_save: { mapX: 14, mapY: 7 },
    catacomb_hall: { mapX: 15, mapY: 7 }, // 3×1 (15..17, 7)
    catacomb_shrine: { mapX: 18, mapY: 7 }, // 2×1 (18..19, 7)

    // 第七幕 · 万卷藏书阁 (5 座 / 8 格, x=15..21, Row 2..3)
    secret_library_study: { mapX: 15, mapY: 2 },
    library_shop: { mapX: 16, mapY: 2 },
    library_save: { mapX: 17, mapY: 2 },
    library_grand_hall: { mapX: 18, mapY: 2 }, // 2×1 (18..19, 2)
    upper_library: { mapX: 20, mapY: 2 }, // 2×2 双层藏书重楼 (20..21, 2..3)

    // 第八幕 · 百戏梨园 (7 座, x=15..21, Row 0..1)
    library_warp: { mapX: 15, mapY: 1 },
    opera_dressing_room: { mapX: 16, mapY: 1 },
    opera_gallery: { mapX: 17, mapY: 1 }, // 3×1 (17..19, 1)
    opera_foyer: { mapX: 20, mapY: 1 }, // 2×1 (20..21, 1)
    opera_save: { mapX: 18, mapY: 0 },
    opera_boss_stage: { mapX: 16, mapY: 0 }, // 2×1 (16..17, 0)
    relic_grapple_vault: { mapX: 15, mapY: 0 },

    // 第九幕 · 东垣望月塔 (12 座, x=22..29, Row 2..5)
    east_outer_tower: { mapX: 22, mapY: 2 }, // 1×4 四层枢机竖塔 (22, 2..5)
    secret_archive: { mapX: 23, mapY: 2 },
    clock_gear_hall: { mapX: 23, mapY: 3 }, // 2×1 (23..24, 3)
    clock_bell_gallery: { mapX: 25, mapY: 3 }, // 2×1 (25..26, 3)
    clock_save: { mapX: 27, mapY: 3 },
    clock_boss_spire: { mapX: 28, mapY: 3 },
    secret_thunder_vault: { mapX: 29, mapY: 3 },
    relic_wall_vault: { mapX: 28, mapY: 2 },
    east_warp: { mapX: 23, mapY: 4 },
    observatory_bridge: { mapX: 24, mapY: 4 }, // 3×1 (24..26, 4)
    observatory_pavilion: { mapX: 27, mapY: 4 },
    secret_sword_tomb: { mapX: 28, mapY: 4 },

    // 终幕 · 凌霄祭天坛 (5 座, x=22..29, Row 0..1)
    altar_cloud_bridge: { mapX: 22, mapY: 1 }, // 3×1 (22..24, 1)
    altar_vestibule: { mapX: 25, mapY: 1 },
    altar_forecourt: { mapX: 24, mapY: 0 }, // 2×1 (24..25, 0)
    altar_save: { mapX: 26, mapY: 0 },
    sky_altar: { mapX: 27, mapY: 0 }, // 3×1 (27..29, 0)

    // 八大环环相扣枢纽回廊与九幽地脉龙渊 (20 座互通枢纽)
    west_cliff_watchtower: { mapX: 6, mapY: 1 }, // 1×2 (6, 1..2)
    west_cliff_skybridge: { mapX: 4, mapY: 2 }, // 2×1 (4..5, 2)
    bamboo_cliff_grotto: { mapX: 1, mapY: 5 }, // 2×1 (1..2, 5)
    moat_west_tunnel: { mapX: 3, mapY: 5 }, // 3×1 (3..5, 5)
    forge_moat_sluice: { mapX: 8, mapY: 5 },
    alchemy_fire_sanctum: { mapX: 11, mapY: 1 }, // 2×1 (11..12, 1)
    library_automaton_loft: { mapX: 13, mapY: 1 }, // 2×1 (13..14, 1)
    alchemy_library_bridge: { mapX: 14, mapY: 2 },
    central_underpass: { mapX: 14, mapY: 5 },
    imperial_aqueduct_west: { mapX: 16, mapY: 5 }, // 2×1 (16..17, 5)
    imperial_aqueduct_east: { mapX: 18, mapY: 5 }, // 3×1 (18..20, 5)
    forge_catacomb_tunnel: { mapX: 9, mapY: 7 }, // 2×1 (9..10, 7)
    abyss_dragon_vein_west: { mapX: 10, mapY: 8 }, // 4×1 (10..13, 8)
    abyss_sanctum_save: { mapX: 14, mapY: 8 },
    abyss_dragon_spine: { mapX: 15, mapY: 8 }, // 5×1 (15..19, 8)
    abyss_east_corridor: { mapX: 20, mapY: 8 }, // 3×1 (20..22, 8)
    abyss_ascension_shaft: { mapX: 22, mapY: 7 },
    opera_moon_pavilion: { mapX: 19, mapY: 0 }, // 2×1 (19..20, 0)
    cloud_star_gallery: { mapX: 21, mapY: 0 }, // 3×1 (21..23, 0)
    clock_east_bastion: { mapX: 29, mapY: 4 },

    // 月下级 36×12 全城大扩建新增侧翼与极渊殿宇
    cliff_pine_trail: { mapX: 0, mapY: 3 },
    cliff_hermit_shrine: { mapX: 0, mapY: 2 },
    cliff_wind_pavilion: { mapX: 2, mapY: 2 },
    west_cliff_pagoda: { mapX: 3, mapY: 2 },
    chapel_cloud_stair: { mapX: 3, mapY: 0 },
    colosseum_west_gate: { mapX: 6, mapY: 0 },
    colosseum_grand_arena: { mapX: 8, mapY: 0 },
    colosseum_save: { mapX: 11, mapY: 0 },
    colosseum_east_armory: { mapX: 12, mapY: 0 },
    colosseum_sky_bridge: { mapX: 14, mapY: 0 },
    sunken_ferry_shaft: { mapX: 0, mapY: 5 },
    sunken_reed_wharf: { mapX: 1, mapY: 6 },
    sunken_water_shrine: { mapX: 4, mapY: 6 },
    sunken_sluice_cavern: { mapX: 5, mapY: 6 },
    mine_vertical_pit: { mapX: 1, mapY: 7 },
    mine_secret_geode: { mapX: 0, mapY: 8 },
    mine_timber_gallery: { mapX: 2, mapY: 7 },
    mine_crystal_cavern: { mapX: 5, mapY: 7 },
    mine_deep_vein: { mapX: 2, mapY: 8 },
    mine_warp: { mapX: 6, mapY: 8 },
    mine_lava_bridge: { mapX: 7, mapY: 8 },
    clock_sky_aqueduct: { mapX: 24, mapY: 2 },
    altar_east_terrace: { mapX: 26, mapY: 1 },
    outer_wall_armory: { mapX: 29, mapY: 2 },
    outer_wall_upper: { mapX: 30, mapY: 0 },
    celestial_bell_sanctum: { mapX: 31, mapY: 1 },
    celestial_star_vault: { mapX: 34, mapY: 1 },
    outer_wall_lower: { mapX: 30, mapY: 3 },
    outer_wall_telescope: { mapX: 31, mapY: 4 },
    outer_wall_save: { mapX: 33, mapY: 4 },
    outer_wall_battlement: { mapX: 34, mapY: 3 },
    dock_sluice_passage: { mapX: 23, mapY: 5 },
    dock_shipyard_hall: { mapX: 26, mapY: 5 },
    dock_east_beacon: { mapX: 31, mapY: 5 },
    dock_flooded_hold: { mapX: 23, mapY: 6 },
    dock_underwater_tunnel: { mapX: 23, mapY: 7 },
    dock_save: { mapX: 27, mapY: 7 },
    dock_coral_grotto: { mapX: 28, mapY: 7 },
    dock_abyss_trench: { mapX: 23, mapY: 8 },
    dock_warp: { mapX: 28, mapY: 8 },
    dock_treasure_vault: { mapX: 29, mapY: 8 },
    forge_prison_conduit: { mapX: 10, mapY: 6 },
    catacomb_prison_vault: { mapX: 20, mapY: 7 },
    nether_west_descent: { mapX: 8, mapY: 9 },
    nether_soul_bridge: { mapX: 10, mapY: 9 },
    nether_ferry_save: { mapX: 15, mapY: 9 },
    nether_lantern_avenue: { mapX: 16, mapY: 9 },
    nether_east_descent: { mapX: 20, mapY: 9 },
    nether_pillar_hall: { mapX: 10, mapY: 10 },
    nether_trial_colosseum: { mapX: 14, mapY: 10 },
    nether_mirror_crypt: { mapX: 17, mapY: 10 },
    nether_east_ossuary: { mapX: 22, mapY: 10 },
    nether_ancient_stele_room: { mapX: 26, mapY: 10 },
    dragon_tomb_west: { mapX: 11, mapY: 11 },
    dragon_tomb_save: { mapX: 15, mapY: 11 },
    dragon_tomb_heart: { mapX: 16, mapY: 11 },
    dragon_tomb_warp: { mapX: 21, mapY: 11 },
    dragon_tomb_sanctuary: { mapX: 22, mapY: 11 },
  };

  return [
    ...coreRooms,
    ...expandedRooms,
    ...entranceStageRooms,
    ...allStagesExpandedRooms,
    ...interlockingRooms,
    ...sotnWingsPart1,
    ...sotnWingsPart2,
  ]
    .map((rm) => {
      const pos = STAGE_GRID_LAYOUT[rm.id];
      const extra = roomHazardLayouts[rm.id];
      const waterZones = dryNonWaterRoomIds.has(rm.id) ? [] : rm.waterZones;
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
        mapX: pos ? pos.mapX : rm.mapX,
        mapY: pos ? pos.mapY : rm.mapY,
        waterZones,
        pavilions,
        lanterns,
        ceilingSpans,
        ambushSeal: ambushRoomIds.has(rm.id),
        hazards: extra?.hazards ?? rm.hazards,
        crumbleSlabs: extra?.crumbleSlabs ?? rm.crumbleSlabs,
      };
    })
    .map(widenSingleCellRoomForUltraWide)
    .map(sanitizeRoomDecorAndSpawns);
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

  // 2. 净化落地陈设（火盆、石兽、盘龙柱、书架、兵器架）：严禁落水、悬空于竖井、贴门或叠压残碑/古祠！
  const cleanDecor: CastleDecorProp[] = [];
  for (const dp of workRm.decorProps || []) {
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

  return {
    ...workRm,
    decorProps: cleanDecor,
    torches: cleanTorches,
  };
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
    relic_double_jump: [{ id: 'inv_pk_dj_hp', kind: 'max_up', itemId: 'hp_vessel', x: 420 }],
    relic_mist_vault: [{ id: 'inv_pk_dg3', kind: 'weapon', itemId: 'daggers_3', x: 480 }],
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
      { id: 'inv_pk_ice_hp', kind: 'max_up', itemId: 'hp_vessel', x: 340 },
      { id: 'inv_pk_ice_wine', kind: 'consumable', itemId: 'tiger_bone_wine', x: 430 },
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

    const rowFloorsForMultiH =
      rm.gridH === 2
        ? [356, 804]
        : rm.gridH === 3
          ? [356, 796, 1236]
          : rm.gridH >= 4
            ? [320, 732, 1140, 1548]
            : [];
    const flippedSideDoors: SideDoor[] = getRoomSideDoors(rm).map((d) => {
      const invRow = d.rowOffset !== undefined ? rm.gridH - 1 - d.rowOffset : 0;
      const mappedFloorY =
        rm.gridH > 1 && invRow < rowFloorsForMultiH.length ? rowFloorsForMultiH[invRow] : d.floorY;
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
      if (W >= 1500) {
        eliteSpawns.push({ kind: 'bell_gargoyle', x: Math.round(W * 0.28), y: 210 });
        const gx1 = findSafeDrySpawnX(W * 0.52);
        if (gx1 !== null) eliteSpawns.push({ kind: 'bronze_guard', x: gx1 });
        const gx2 = findSafeDrySpawnX(W * 0.78);
        if (gx2 !== null && (gx1 === null || Math.abs(gx2 - gx1) > 140)) {
          eliteSpawns.push({ kind: 'opera_puppet', x: gx2 });
        }
      } else {
        eliteSpawns.push({ kind: 'bell_gargoyle', x: Math.round(W * 0.48), y: 200 });
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
    bossCleared: boolean
  ): { nextRoom: BuiltRoom; nextX: number; nextY: number; matchSealId?: string } | null {
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
        return { nextRoom, nextX: localNextX, nextY, matchSealId: matchSh?.sealId };
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
