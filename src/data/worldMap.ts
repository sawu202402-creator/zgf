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
export const MAP_GRID_TOTAL_W = 17;
export const MAP_GRID_TOTAL_H = 7;

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
  /** 当前房间该门廊地面标高 Y */
  floorY: number;
  /** 连通的目标房间 ID */
  targetRoomId: string;
  /** 目标房间对应落点标高 Y（省略时自动匹配对侧回连门标高） */
  targetFloorY?: number;
  /** 在多层竖塔 (`gridH > 1`) 中对应的地图行偏移 `0 .. gridH - 1` */
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
  /** 'water' = 寒潭碧水; 'lava' = 赤火古窖熔金铁水 */
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
  gatehouse: '苦竹瓮城 · 东垣望月塔',
  main_hall: '奉天盘龙殿 · 紫微寝宫',
  library: '万卷藏书阁 · 禁书秘院',
  forge: '赤火古窖 · 熔金铸剑窟',
  prison: '九曲寒潭 · 千丈飞瀑涧',
  opera: '百戏梨园 · 子夜鬼市',
  clock_tower: '紫微星阁 · 晨钟机关楼',
  altar: '凌霄祭天坛 · 乾坤灵枢',
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
 * 为全城每一座房间自动补齐浓郁饱满的中景陈设（赤金火盆、朱雀垂帷、盘龙巨柱、瑞鹤香炉、镇殿石猊、兵戈武架）、
 * 可击碎红绸宫灯与 1.28x 近景视差遮挡柱/宫灯，彻底告别空旷冷清！
 */
function enrichRoomAtmosphere(room: BuiltRoom): BuiltRoom {
  const props: CastleDecorProp[] = [...(room.decorProps || [])];
  const fg: ForegroundProp[] = [...room.foregrounds];
  const torches = [...room.torches];

  const hasNearProp = (x: number, minDist = 135) =>
    props.some((p) => Math.abs(p.x - x) < minDist) ||
    room.npcs.some((n) => Math.abs(n.x - x) < 95) ||
    room.archways.some((a) => Math.abs(a.x - x) < 110) ||
    (room.special === 'save_shrine' && Math.abs(room.focalX - x) < 125) ||
    (room.special === 'warp_bagua' && Math.abs(room.focalX - x) < 125) ||
    room.shafts.some((s) => x > s.x1 - 45 && x < s.x2 + 45);

  const isWaterAt = (x: number) =>
    room.waterZones.some((wz) => x >= wz.x1 - 30 && x <= wz.x2 + 30);

  // 1. 按区域主题沿全房间铺设暖色盘龙火盆、仙鹤香炉、垂帷旌旗、盘龙金柱、镇殿石猊与兵戈武架
  const step = room.pixelW <= 900 ? 250 : 310;
  let slotIdx = 0;
  for (let x = 165; x <= room.pixelW - 165; x += step) {
    slotIdx++;
    if (isWaterAt(x) || hasNearProp(x, 128)) continue;
    const gy = sampleSolidGroundY(room, x);

    if (room.region === 'opera') {
      const kind: CastleDecorKind =
        slotIdx % 3 === 0 ? 'dragon_brazier' : slotIdx % 3 === 1 ? 'silk_banner' : 'incense_burner';
      props.push({
        kind,
        x,
        y: kind === 'silk_banner' ? gy - 42 : gy,
        scale: kind === 'silk_banner' ? 0.96 : 0.88,
      });
    } else if (room.region === 'forge') {
      const kind: CastleDecorKind =
        slotIdx % 3 === 0 ? 'weapon_rack' : slotIdx % 2 === 0 ? 'dragon_brazier' : 'guardian_statue';
      props.push({ kind, x, y: gy, scale: kind === 'dragon_brazier' ? 0.94 : 0.9 });
    } else if (room.region === 'main_hall') {
      const kind: CastleDecorKind =
        slotIdx % 4 === 0
          ? 'coiled_pillar'
          : slotIdx % 4 === 1
            ? 'dragon_brazier'
            : slotIdx % 4 === 2
              ? 'silk_banner'
              : 'guardian_statue';
      props.push({
        kind,
        x,
        y: kind === 'silk_banner' ? gy - 48 : gy,
        scale: kind === 'coiled_pillar' ? 1.08 : 0.9,
      });
    } else if (room.region === 'library') {
      const kind: CastleDecorKind =
        slotIdx % 3 === 0 ? 'incense_burner' : slotIdx % 3 === 1 ? 'silk_banner' : 'bookshelf';
      props.push({
        kind,
        x,
        y: kind === 'silk_banner' ? gy - 50 : gy,
        scale: kind === 'bookshelf' ? 1.02 : 0.88,
      });
    } else if (room.region === 'clock_tower' || room.region === 'altar') {
      const kind: CastleDecorKind =
        slotIdx % 3 === 0
          ? 'dragon_brazier'
          : slotIdx % 3 === 1
            ? 'silk_banner'
            : 'guardian_statue';
      props.push({
        kind,
        x,
        y: kind === 'silk_banner' ? gy - 44 : gy,
        scale: 0.92,
      });
    } else if (room.region === 'prison') {
      const kind: CastleDecorKind =
        slotIdx % 2 === 0 ? 'dragon_brazier' : 'guardian_statue';
      props.push({ kind, x, y: gy, scale: 0.86 });
    } else {
      // gatehouse & outer wall
      const kind: CastleDecorKind =
        slotIdx % 3 === 0
          ? 'dragon_brazier'
          : slotIdx % 3 === 1
            ? 'weapon_rack'
            : 'guardian_statue';
      props.push({ kind, x, y: gy, scale: 0.9 });
    }
  }

  // 2. 加密可挥剑击碎爆灵符/银两的暖红宫灯（每 ~260px 一盏，温暖照亮整条走廊！）
  for (let tx = 140; tx <= room.pixelW - 140; tx += 275) {
    if (torches.some((t) => Math.abs(t.x - tx) < 150)) continue;
    const gy = sampleSolidGroundY(room, tx);
    torches.push({ x: tx, y: gy - 78 });
  }

  // 3. 补齐 1.26x 前景视差遮挡层（盘龙暗影巨柱与近景垂挂红灯笼掠过镜头，彻底拉开纵深厚度！）
  if (fg.length === 0 && room.pixelW >= 1200) {
    const span = room.pixelW >= 1800 ? 560 : 640;
    for (let fx = 320; fx <= room.pixelW - 260; fx += span) {
      fg.push({
        x: fx,
        kind: room.indoor || room.region === 'main_hall' ? 'dragon_pillar' : 'hanging_lantern',
        parallax: 1.25,
      });
    }
  }

  room.decorProps = props;
  room.torches = torches;
  room.foregrounds = fg;
  return room;
}

function createNormalCastleRooms(): BuiltRoom[] {
  // =========================================================================================
  // 八大主题城域 · 36座精密咬合立体房间（17×7 恶魔城全尺寸迷宫蓝图！）
  //   gy=0: 云端司辰古祠[1,0] ━ 景阳摘星钟楼[2..3,0]            凌霄登坛神道[13,0..1] ━ 凌霄祭天坛[14..16,0]
  //   gy=1: 紫微飞虹礼拜堂[1..3,1] ━ 禁书天机阁[4..5,1] ━ 乾坤中枢坛[6,1] ━ 玄枢钟摆井[7,1..3] ━ 飞虹天廊[8..10,1] ━ 百丈晨钟机关楼[11..12,1..2] ┛
  //   gy=2: 镇军西武库[1,2] ━ 钦天炼丹司[2..3,2]   静心丹房[4,2] ━ 紫微画壁寝殿[5..6,2] ┫ ━ 万卷藏书飞阁[8..10,2] ━ ┫ ━ 东城望月塔[13,2..4] ━ 望月秘阁[14,2]
  //   gy=3: 断魂苦竹渡[0..1,3] ━ 瓮城镇魂古祠[2..3,3] ━ 奉天盘龙廊[4..6,3] ━━━━━━━┫ ━ 奉天洗墨堂[8..9,3] ━ 东宫镇魂偏殿[10..12,3] ━ ┫ ━ 东垣传送阵[14,3]
  //   gy=4: 玄鸟西密室[0,4] ━ 幽冥藏甲室[1,4] ━ 九曲暗渠[2..3,4] ━ 千丈飞瀑涧[4..5,4..5] ━ 地脉灵泉[6..7,4] ━ 问剑寒潭[8..9,4] ━ 梨园鬼市灯街[10..12,4] ━ ┫ ━ 惊梦大戏台[14..15,4]
  //   gy=5:                                寒潭渡口祠[3,5] ━ ┛ ━ 赤火铸剑廊[6..7,5] ━ 赤火镇火神殿[8..9,5] ━ 赤火镇岳秘库[10..11,5]
  //   gy=6:                                                    九幽地脉深渊窟[6..8,6]
  // =========================================================================================

  const rooms: BuiltRoom[] = [
    // -------------------- 【一、苦竹瓮城 & 钦天监炼丹西翼】 --------------------
    {
      id: 'gate_1',
      name: '断魂苦竹渡',
      subtitle: '苦竹瓮城 · 护城古桥与朱雀火盆道',
      region: 'gatehouse',
      bgKey: 'bg_gatehouse',
      realm: 'normal',
      mapX: 0,
      mapY: 3,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 500,
      special: 'none',
      focalX: 260,
      focalY: 412,
      storyTriggerId: 'intro_gate',
      rightRoomId: 'gate_2',
      rightDoorFloorY: 410,
      groundNodes: [
        { x: 0, y: 412, style: 'flagstone' },
        { x: 180, y: 412, style: 'stairs' },
        { x: 240, y: 398, style: 'flagstone' },
        { x: 355, y: 398, style: 'arch_bridge' },
        { x: 650, y: 326, style: 'arch_bridge' },
        { x: 830, y: 326, style: 'arch_bridge' },
        { x: 1125, y: 398, style: 'flagstone' },
        { x: 1320, y: 398, style: 'stairs' },
        { x: 1410, y: 410, style: 'flagstone' },
        { x: 1600, y: 410, style: 'flagstone' },
      ],
      ceilingSpans: [{ x1: 1180, x2: 1600, bottomY: 232, style: 'gate_tunnel' }],
      shafts: [],
      waterZones: [{ x1: 350, x2: 1130, surfaceY: 368 }],
      decorProps: [
        { kind: 'dragon_brazier', x: 225, y: 398, scale: 0.92 },
        { kind: 'guardian_statue', x: 1148, y: 398, scale: 0.95 },
        { kind: 'dragon_brazier', x: 1265, y: 398, scale: 0.95 },
        { kind: 'weapon_rack', x: 1455, y: 410, scale: 0.92 },
      ],
      pavilions: [
        { x: 120, y: 292, w: 180, hasPillars: true },
        { x: 955, y: 278, w: 195, hasPillars: true, label: '城门望哨阁' },
      ],
      archways: [{ x: 1175, title: '九幽西瓮门' }],
      torches: [
        { x: 150, y: 334 },
        { x: 345, y: 320 },
        { x: 560, y: 274 },
        { x: 740, y: 262 },
        { x: 920, y: 274 },
        { x: 1310, y: 328 },
        { x: 1515, y: 328 },
      ],
      foregrounds: [
        { x: 210, kind: 'hanging_lantern', parallax: 1.24 },
        { x: 1090, kind: 'dragon_pillar', parallax: 1.26 },
      ],
      lanterns: [
        { x: 560, y: 198 },
        { x: 890, y: 198 },
      ],
      npcs: [
        {
          id: 'su_qingyan',
          name: '苏清晏',
          title: '钦天监司辰女官',
          x: 305,
          defaultFacing: -1,
        },
      ],
      spawns: [
        { kind: 'paper_swordsman', x: 735 },
        { kind: 'lantern_ghost', x: 1035 },
        { kind: 'paper_swordsman', x: 1385 },
      ],
      pickups: [
        { id: 'pk_bridge_potion', kind: 'consumable', itemId: 'jinchuang_yao', x: 1052, y: 278 },
      ],
    },

    {
      id: 'gate_2',
      name: '瓮城镇魂古祠',
      subtitle: '苦竹瓮城 · 铁匠炉火与四通枢机院',
      region: 'gatehouse',
      bgKey: 'bg_gatehouse',
      realm: 'normal',
      mapX: 2,
      mapY: 3,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 520,
      special: 'save_shrine',
      focalX: 980,
      focalY: 416,
      warpName: '瓮城镇魂古祠',
      leftRoomId: 'gate_1',
      leftDoorFloorY: 410,
      rightRoomId: 'hall_corridor',
      rightDoorFloorY: 404,
      groundNodes: [
        { x: 0, y: 410, style: 'flagstone' },
        { x: 280, y: 410, style: 'stairs' },
        { x: 360, y: 424, style: 'flagstone' },
        { x: 760, y: 424, style: 'stairs' },
        { x: 860, y: 416, style: 'marble' },
        { x: 1240, y: 416, style: 'stairs' },
        { x: 1330, y: 404, style: 'marble' },
        { x: 1600, y: 404, style: 'marble' },
      ],
      ceilingSpans: [
        { x1: 0, x2: 210, bottomY: 232, style: 'gate_tunnel' },
        { x1: 210, x2: 1110, bottomY: 64, style: 'palace_timber' },
        { x1: 1270, x2: 1600, bottomY: 158, style: 'palace_timber' },
      ],
      shafts: [
        { x1: 520, x2: 656, dir: 'down', targetRoomId: 'crypt_canal' },
        { x1: 1110, x2: 1270, dir: 'up', targetRoomId: 'alchemy_lab' },
      ],
      decorProps: [
        { kind: 'dragon_brazier', x: 355, y: 424, scale: 0.96 },
        { kind: 'weapon_rack', x: 485, y: 424, scale: 0.94 },
        { kind: 'incense_burner', x: 885, y: 416, scale: 0.92 },
        { kind: 'silk_banner', x: 1080, y: 372, scale: 0.95 },
        { kind: 'dragon_brazier', x: 1455, y: 404, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [
        { x: 220, y: 304, w: 230, hasPillars: true, label: '赤火铸剑棚' },
        { x: 518, y: 424, w: 140, hasPillars: false, label: '幽冥暗井（↓+跃 下潜）' },
        { x: 920, y: 274, w: 200, hasPillars: true },
        { x: 1122, y: 148, w: 136, hasPillars: false, label: '钦天炼丹司（需踏云步）' },
      ],
      archways: [{ x: 1395, title: '奉天前殿门' }],
      torches: [
        { x: 140, y: 334 },
        { x: 690, y: 342 },
        { x: 1135, y: 336 },
        { x: 1510, y: 326 },
      ],
      foregrounds: [
        { x: 260, kind: 'hanging_lantern', parallax: 1.22 },
        { x: 1280, kind: 'dragon_pillar', parallax: 1.25 },
      ],
      lanterns: [],
      npcs: [
        {
          id: 'ouye_can',
          name: '欧冶残',
          title: '赤火坊独臂铸剑师',
          x: 420,
          defaultFacing: -1,
        },
        {
          id: 'su_qingyan',
          name: '苏清晏',
          title: '钦天监司辰女官',
          x: 1175,
          defaultFacing: -1,
        },
        {
          id: 'bai_zhanggui',
          name: '白掌柜',
          title: '子夜鬼市狐商',
          x: 1335,
          defaultFacing: -1,
        },
      ],
      spawns: [],
      pickups: [{ id: 'pk_modao_rack', kind: 'weapon', itemId: 'greatsword_1', x: 275, y: 304 }],
    },

    {
      id: 'alchemy_lab',
      name: '钦天监炼丹司',
      subtitle: '西翼丹炉坊 · 赤铜丹鼎与试药回廊',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 2,
      mapY: 2,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 560,
      special: 'none',
      focalX: 800,
      focalY: 468,
      leftRoomId: 'west_armory_secret',
      leftDoorFloorY: 468,
      groundNodes: [
        { x: 0, y: 468, style: 'marble' },
        { x: 520, y: 468, style: 'stairs' },
        { x: 640, y: 438, style: 'marble' },
        { x: 980, y: 438, style: 'stairs' },
        { x: 1080, y: 468, style: 'marble' },
        { x: 1600, y: 468, style: 'marble' },
      ],
      ceilingSpans: [
        { x1: 0, x2: 410, bottomY: 62, style: 'palace_timber' },
        { x1: 570, x2: 1600, bottomY: 62, style: 'palace_timber' },
      ],
      shafts: [
        { x1: 1110, x2: 1270, dir: 'down', targetRoomId: 'gate_2' },
        { x1: 410, x2: 570, dir: 'up', targetRoomId: 'chapel_stair_hall' },
      ],
      decorProps: [
        { kind: 'incense_burner', x: 220, y: 468, scale: 1.05 },
        { kind: 'bookshelf', x: 350, y: 468, scale: 0.98 },
        { kind: 'dragon_brazier', x: 740, y: 438, scale: 1.0 },
        { kind: 'incense_burner', x: 890, y: 438, scale: 1.05 },
        { kind: 'weapon_rack', x: 1380, y: 468, scale: 0.96 },
        { kind: 'chandelier', x: 810, y: 60, scale: 0.95 },
      ],
      waterZones: [],
      pavilions: [
        { x: 180, y: 344, w: 220, hasPillars: false, label: '丹鼎藏药架' },
        { x: 420, y: 226, w: 160, hasPillars: false },
        { x: 422, y: 118, w: 136, hasPillars: false, label: '紫微观星台飞梯' },
        { x: 960, y: 332, w: 240, hasPillars: false },
        { x: 1108, y: 468, w: 164, hasPillars: false, label: '瓮城古祠天井（↓+跃）' },
      ],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [{ x: 760, y: 210 }],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 330 },
        { kind: 'plague_toad', x: 790 },
        { kind: 'scroll_demon', x: 1060 },
        { kind: 'paper_swordsman', x: 1390 },
      ],
      pickups: [
        { id: 'pk_alch_holyfire', kind: 'weapon', itemId: 'sub:holy_fire', x: 265, y: 344 },
        { id: 'pk_alch_huiqi', kind: 'consumable', itemId: 'huiqi_dan', x: 1080, y: 332 },
      ],
    },

    {
      id: 'west_armory_secret',
      name: '镇军西武库',
      subtitle: '玄铁秘闸 · 前朝神兵甲胄封藏室',
      region: 'gatehouse',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 1,
      mapY: 2,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 500,
      special: 'relic_pedestal',
      focalX: 250,
      focalY: 412,
      rightRoomId: 'alchemy_lab',
      rightDoorFloorY: 412,
      groundNodes: [
        { x: 0, y: 412, style: 'marble' },
        { x: 800, y: 412, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 74, style: 'palace_timber' }],
      shafts: [],
      ironGate: {
        id: 'gate_west_armory',
        x: 590,
        topY: 74,
        bottomY: 412,
        gateKind: 'heavy_weapon',
      },
      decorProps: [
        { kind: 'weapon_rack', x: 145, y: 412, scale: 1.02 },
        { kind: 'dragon_brazier', x: 270, y: 412, scale: 0.96 },
        { kind: 'weapon_rack', x: 405, y: 412, scale: 1.02 },
        { kind: 'guardian_statue', x: 510, y: 412, scale: 0.95 },
        { kind: 'silk_banner', x: 270, y: 365, scale: 0.95 },
      ],
      waterZones: [],
      pavilions: [{ x: 140, y: 294, w: 260, hasPillars: false, label: '雷音神鞭武架' }],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [{ kind: 'bronze_guard', x: 440 }],
      pickups: [
        { id: 'pk_west_whip2', kind: 'weapon', itemId: 'whip_2', x: 225, y: 294 },
        { id: 'pk_west_wine', kind: 'consumable', itemId: 'osmanthus_wine', x: 345, y: 294 },
      ],
    },

    // -------------------- 【二、钦天紫微观星台（西翼云端天阙 gy=0..1）】 --------------------
    {
      id: 'chapel_stair_hall',
      name: '紫微观星飞虹阁',
      subtitle: '钦天星台 · 浑天青铜仪与登云汉白玉长阶',
      region: 'clock_tower',
      bgKey: 'bg_chapel_spire',
      realm: 'normal',
      indoor: true,
      mapX: 1,
      mapY: 1,
      gridW: 3,
      gridH: 1,
      pixelW: 2000,
      pixelH: 620,
      special: 'none',
      focalX: 1000,
      focalY: 430,
      rightRoomId: 'secret_archive',
      rightDoorFloorY: 360,
      groundNodes: [
        { x: 0, y: 528, style: 'marble' },
        { x: 460, y: 528, style: 'stairs' },
        { x: 960, y: 442, style: 'marble' },
        { x: 1220, y: 442, style: 'stairs' },
        { x: 1620, y: 360, style: 'marble' },
        { x: 2000, y: 360, style: 'marble' },
      ],
      ceilingSpans: [
        { x1: 0, x2: 1020, bottomY: 58, style: 'palace_timber' },
        { x1: 1180, x2: 2000, bottomY: 58, style: 'palace_timber' },
      ],
      shafts: [
        { x1: 960, x2: 1110, dir: 'down', targetRoomId: 'alchemy_lab' },
        { x1: 1020, x2: 1180, dir: 'up', targetRoomId: 'chapel_bell_spire' },
      ],
      decorProps: [
        { kind: 'lattice_window', x: 310, y: 430, scale: 1.08 },
        { kind: 'lattice_window', x: 760, y: 360, scale: 1.08 },
        { kind: 'lattice_window', x: 1420, y: 280, scale: 1.08 },
        { kind: 'silk_banner', x: 520, y: 450, scale: 1.0 },
        { kind: 'silk_banner', x: 1240, y: 365, scale: 1.0 },
        { kind: 'dragon_brazier', x: 240, y: 528, scale: 0.95 },
        { kind: 'dragon_brazier', x: 1720, y: 360, scale: 0.95 },
        { kind: 'chandelier', x: 620, y: 56, scale: 0.96 },
        { kind: 'chandelier', x: 1560, y: 56, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [
        { x: 200, y: 404, w: 230, hasPillars: false },
        { x: 958, y: 442, w: 154, hasPillars: false, label: '炼丹司天梯（↓+跃）' },
        { x: 860, y: 298, w: 200, hasPillars: false },
        { x: 1030, y: 158, w: 142, hasPillars: false, label: '景阳摘星钟楼' },
      ],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [
        { x: 640, y: 260 },
        { x: 1360, y: 210 },
      ],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 580 },
        { kind: 'bronze_guard', x: 910 },
        { kind: 'bell_gargoyle', x: 1420 },
        { kind: 'scroll_demon', x: 1760 },
      ],
      pickups: [{ id: 'pk_chapel_potion', kind: 'consumable', itemId: 'osmanthus_wine', x: 295, y: 404 }],
    },

    {
      id: 'chapel_bell_spire',
      name: '景阳摘星钟楼',
      subtitle: '云端钟阁 · 洪武千钧铜钟与星盘秘宝',
      region: 'clock_tower',
      bgKey: 'bg_chapel_spire',
      realm: 'normal',
      indoor: true,
      mapX: 2,
      mapY: 0,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 580,
      special: 'relic_pedestal',
      focalX: 800,
      focalY: 486,
      leftRoomId: 'chapel_cloud_shrine',
      leftDoorFloorY: 486,
      groundNodes: [
        { x: 0, y: 486, style: 'marble' },
        { x: 1600, y: 486, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 56, style: 'palace_timber' }],
      shafts: [{ x1: 520, x2: 680, dir: 'down', targetRoomId: 'chapel_stair_hall' }],
      decorProps: [
        { kind: 'giant_bell', x: 420, y: 288, scale: 1.05 },
        { kind: 'giant_bell', x: 1080, y: 268, scale: 1.12 },
        { kind: 'lattice_window', x: 760, y: 375, scale: 1.06 },
        { kind: 'dragon_brazier', x: 220, y: 486, scale: 0.96 },
        { kind: 'incense_burner', x: 920, y: 486, scale: 0.98 },
        { kind: 'guardian_statue', x: 1380, y: 486, scale: 0.98 },
      ],
      waterZones: [],
      pavilions: [
        { x: 220, y: 348, w: 250, hasPillars: false, label: '西钟御枪台' },
        { x: 518, y: 486, w: 164, hasPillars: false, label: '紫微观星阁天井（↓+跃）' },
        { x: 960, y: 332, w: 280, hasPillars: false, label: '东钟灵莲台' },
      ],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [{ x: 760, y: 220 }],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 480 },
        { kind: 'bell_gargoyle', x: 1060 },
        { kind: 'bronze_guard', x: 1290 },
      ],
      pickups: [
        { id: 'pk_chapel_spear2', kind: 'weapon', itemId: 'spear_2', x: 310, y: 348 },
        { id: 'pk_chapel_mp', kind: 'max_up', itemId: 'mp_vessel', x: 1120, y: 332 },
      ],
    },

    {
      id: 'chapel_cloud_shrine',
      name: '云端司辰古祠',
      subtitle: '西塔极巅 · 烛影观星镇魂祠',
      region: 'clock_tower',
      bgKey: 'bg_chapel_spire',
      realm: 'normal',
      indoor: true,
      mapX: 1,
      mapY: 0,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'save_shrine',
      warpName: '云端司辰古祠',
      focalX: 380,
      focalY: 396,
      rightRoomId: 'chapel_bell_spire',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'marble' },
        { x: 800, y: 396, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 64, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 210, y: 396, scale: 0.92 },
        { kind: 'incense_burner', x: 550, y: 396, scale: 0.95 },
        { kind: 'silk_banner', x: 180, y: 350, scale: 0.95 },
        { kind: 'silk_banner', x: 620, y: 350, scale: 0.95 },
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

    // -------------------- 【三、奉天盘龙正殿、玄枢三层通天井 & 紫微寝宫】 --------------------
    {
      id: 'hall_corridor',
      name: '奉天前殿 · 盘龙廊',
      subtitle: '奉天正殿 · 擎天金柱与百烛长廊',
      region: 'main_hall',
      bgKey: 'bg_main_hall',
      realm: 'normal',
      indoor: true,
      mapX: 4,
      mapY: 3,
      gridW: 3,
      gridH: 1,
      pixelW: 2200,
      pixelH: 580,
      special: 'none',
      focalX: 1100,
      focalY: 484,
      leftRoomId: 'gate_2',
      leftDoorFloorY: 484,
      rightRoomId: 'central_pendulum_shaft',
      rightDoorFloorY: 484,
      groundNodes: [
        { x: 0, y: 484, style: 'marble' },
        { x: 520, y: 484, style: 'stairs' },
        { x: 680, y: 448, style: 'marble' },
        { x: 1520, y: 448, style: 'stairs' },
        { x: 1680, y: 484, style: 'marble' },
        { x: 2200, y: 484, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 2200, bottomY: 62, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'coiled_pillar', x: 340, y: 484, scale: 1.15 },
        { kind: 'coiled_pillar', x: 960, y: 448, scale: 1.15 },
        { kind: 'coiled_pillar', x: 1420, y: 448, scale: 1.15 },
        { kind: 'coiled_pillar', x: 1920, y: 484, scale: 1.15 },
        { kind: 'lattice_window', x: 540, y: 365, scale: 1.06 },
        { kind: 'lattice_window', x: 1190, y: 345, scale: 1.06 },
        { kind: 'lattice_window', x: 1720, y: 365, scale: 1.06 },
        { kind: 'dragon_brazier', x: 210, y: 484, scale: 0.96 },
        { kind: 'dragon_brazier', x: 780, y: 448, scale: 0.96 },
        { kind: 'dragon_brazier', x: 1610, y: 472, scale: 0.96 },
        { kind: 'chandelier', x: 460, y: 58, scale: 0.96 },
        { kind: 'chandelier', x: 1190, y: 58, scale: 1.0 },
        { kind: 'chandelier', x: 1820, y: 58, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [
        { x: 210, y: 356, w: 260, hasPillars: false, label: '西侧剑灵祭廊' },
        { x: 580, y: 256, w: 240, hasPillars: false },
        { x: 980, y: 328, w: 280, hasPillars: false, label: '盘龙中庭御廊' },
        { x: 1480, y: 356, w: 260, hasPillars: false },
      ],
      archways: [],
      torches: [],
      foregrounds: [
        { x: 420, kind: 'dragon_pillar', parallax: 1.25 },
        { x: 1180, kind: 'dragon_pillar', parallax: 1.25 },
        { x: 1840, kind: 'dragon_pillar', parallax: 1.25 },
      ],
      lanterns: [
        { x: 860, y: 210 },
        { x: 1380, y: 210 },
      ],
      npcs: [],
      spawns: [
        { kind: 'paper_swordsman', x: 420 },
        { kind: 'scroll_demon', x: 860 },
        { kind: 'bronze_guard', x: 1240 },
        { kind: 'opera_puppet', x: 1740 },
      ],
      pickups: [
        { id: 'pk_hall_familiar', kind: 'ability', itemId: 'familiar_sword', x: 315, y: 356 },
        { id: 'pk_hall_spear1', kind: 'weapon', itemId: 'spear_1', x: 1595, y: 356 },
      ],
    },

    // 【全城核心立体枢纽！1×3 纵贯三层通天钟摆竖井（6道分层门廊 + 底井连通地下灵泉！）】
    {
      id: 'central_pendulum_shaft',
      name: '玄枢通天钟摆井',
      subtitle: '皇城中枢 · 纵贯三层六门枢机井',
      region: 'main_hall',
      bgKey: 'bg_main_hall',
      realm: 'normal',
      indoor: true,
      mapX: 7,
      mapY: 1,
      gridW: 1,
      gridH: 3,
      pixelW: 800,
      pixelH: 1320,
      special: 'none',
      focalX: 400,
      focalY: 1216,
      sideDoors: [
        // 顶层 gy=1 (rowOffset=0)
        { side: 'left', floorY: 320, targetRoomId: 'central_warp_room', rowOffset: 0 },
        { side: 'right', floorY: 320, targetRoomId: 'sky_bridge_corridor', rowOffset: 0 },
        // 中层 gy=2 (rowOffset=1)
        { side: 'left', floorY: 772, targetRoomId: 'inner_painting_hall', rowOffset: 1 },
        { side: 'right', floorY: 772, targetRoomId: 'upper_library', rowOffset: 1 },
        // 底层 gy=3 (rowOffset=2)
        { side: 'left', floorY: 1216, targetRoomId: 'hall_corridor', rowOffset: 2 },
        { side: 'right', floorY: 1216, targetRoomId: 'lib_boss', rowOffset: 2 },
      ],
      groundNodes: [
        { x: 0, y: 1216, style: 'marble' },
        { x: 800, y: 1216, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 56, style: 'palace_timber' }],
      shafts: [{ x1: 320, x2: 480, dir: 'down', targetRoomId: 'crypt_warp' }],
      clockGears: [
        { x: 400, y: 980, radius: 105, speed: 0.52, hasOrbitPlatforms: true },
        { x: 400, y: 540, radius: 108, speed: -0.56, hasOrbitPlatforms: true },
      ],
      decorProps: [
        { kind: 'silk_banner', x: 180, y: 290, scale: 0.96 },
        { kind: 'silk_banner', x: 620, y: 290, scale: 0.96 },
        { kind: 'silk_banner', x: 180, y: 740, scale: 0.96 },
        { kind: 'silk_banner', x: 620, y: 740, scale: 0.96 },
        { kind: 'dragon_brazier', x: 185, y: 1216, scale: 0.94 },
        { kind: 'dragon_brazier', x: 615, y: 1216, scale: 0.94 },
        { kind: 'chandelier', x: 400, y: 54, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [
        // 底层通往中层踏台
        { x: 318, y: 1216, w: 164, hasPillars: false, label: '地脉灵泉竖井（↓+跃）' },
        { x: 90, y: 1105, w: 190, hasPillars: false },
        { x: 520, y: 1095, w: 190, hasPillars: false },
        { x: 110, y: 885, w: 180, hasPillars: false },
        // 中层左右门廊平台 (y=772)
        { x: 0, y: 772, w: 255, hasPillars: false, label: '◂ 紫微寝宫' },
        { x: 545, y: 772, w: 255, hasPillars: false, label: '万卷藏书阁 ▸' },
        { x: 300, y: 668, w: 200, hasPillars: false },
        { x: 110, y: 432, w: 180, hasPillars: false },
        // 顶层左右门廊平台 (y=320)
        { x: 0, y: 320, w: 265, hasPillars: false, label: '◂ 乾坤传送坛' },
        { x: 535, y: 320, w: 265, hasPillars: false, label: '飞虹悬空长廊 ▸' },
      ],
      archways: [],
      torches: [
        { x: 140, y: 1140 },
        { x: 660, y: 1140 },
        { x: 140, y: 696 },
        { x: 660, y: 696 },
        { x: 140, y: 244 },
        { x: 660, y: 244 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 400, y: 760 },
        { x: 400, y: 310 },
      ],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 400, y: 920 },
        { kind: 'scroll_demon', x: 400, y: 500 },
      ],
      pickups: [],
    },

    {
      id: 'central_warp_room',
      name: '乾坤中枢传送坛',
      subtitle: '上层枢机 · 太极八卦传送阵',
      region: 'main_hall',
      bgKey: 'bg_chapel_spire',
      realm: 'normal',
      indoor: true,
      mapX: 6,
      mapY: 1,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'warp_bagua',
      warpName: '乾坤中枢传送坛',
      focalX: 400,
      focalY: 396,
      leftRoomId: 'secret_archive',
      leftDoorFloorY: 396,
      rightRoomId: 'central_pendulum_shaft',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'marble' },
        { x: 800, y: 396, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 64, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 190, y: 396, scale: 0.94 },
        { kind: 'dragon_brazier', x: 610, y: 396, scale: 0.94 },
        { kind: 'silk_banner', x: 260, y: 350, scale: 0.92 },
        { kind: 'silk_banner', x: 540, y: 350, scale: 0.92 },
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
      id: 'inner_painting_hall',
      name: '紫微画壁寝殿',
      subtitle: '内廷秘苑 · 锦绣帷幔与博山香雾',
      region: 'main_hall',
      bgKey: 'bg_chapel_spire',
      realm: 'normal',
      indoor: true,
      mapX: 5,
      mapY: 2,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 540,
      special: 'relic_pedestal',
      focalX: 800,
      focalY: 452,
      leftRoomId: 'inner_save_shrine',
      leftDoorFloorY: 452,
      rightRoomId: 'central_pendulum_shaft',
      rightDoorFloorY: 452,
      groundNodes: [
        { x: 0, y: 452, style: 'marble' },
        { x: 480, y: 452, style: 'stairs' },
        { x: 600, y: 424, style: 'marble' },
        { x: 1000, y: 424, style: 'stairs' },
        { x: 1120, y: 452, style: 'marble' },
        { x: 1600, y: 452, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 60, style: 'palace_timber' }],
      shafts: [],
      secretWalls: [
        {
          id: 'sw_inner_chicken',
          x: 780,
          y: 312,
          w: 56,
          h: 112,
          dropKind: 'consumable',
          dropItemId: 'beggar_chicken',
        },
      ],
      decorProps: [
        { kind: 'silk_banner', x: 240, y: 402, scale: 1.02 },
        { kind: 'incense_burner', x: 410, y: 452, scale: 1.0 },
        { kind: 'lattice_window', x: 800, y: 345, scale: 1.04 },
        { kind: 'incense_burner', x: 1190, y: 452, scale: 1.0 },
        { kind: 'silk_banner', x: 1360, y: 402, scale: 1.02 },
        { kind: 'chandelier', x: 520, y: 58, scale: 0.95 },
        { kind: 'chandelier', x: 1080, y: 58, scale: 0.95 },
      ],
      waterZones: [],
      pavilions: [
        { x: 220, y: 326, w: 240, hasPillars: false, label: '流光八卦秘匣' },
        { x: 1120, y: 326, w: 240, hasPillars: false },
      ],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'opera_puppet', x: 520 },
        { kind: 'scroll_demon', x: 960 },
        { kind: 'bronze_guard', x: 1290 },
      ],
      pickups: [
        { id: 'pk_inner_bagua', kind: 'weapon', itemId: 'sub:bagua_cross', x: 320, y: 326 },
        { id: 'pk_inner_hp', kind: 'max_up', itemId: 'hp_vessel', x: 1240, y: 326 },
      ],
    },

    {
      id: 'inner_save_shrine',
      name: '紫微静心丹房',
      subtitle: '内廷暖阁 · 瑞鹤香炉镇魂祠',
      region: 'main_hall',
      bgKey: 'bg_chapel_spire',
      realm: 'normal',
      indoor: true,
      mapX: 4,
      mapY: 2,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'save_shrine',
      focalX: 380,
      focalY: 396,
      rightRoomId: 'inner_painting_hall',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'marble' },
        { x: 800, y: 396, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 64, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'incense_burner', x: 210, y: 396, scale: 0.96 },
        { kind: 'dragon_brazier', x: 560, y: 396, scale: 0.94 },
        { kind: 'bookshelf', x: 665, y: 396, scale: 0.94 },
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

    // -------------------- 【四、万卷藏书阁、洗墨堂 & 飞虹天廊】 --------------------
    {
      id: 'secret_archive',
      name: '禁书天机阁',
      subtitle: '藏书绝顶 · 万卷书架与破妄秘室',
      region: 'library',
      bgKey: 'bg_library_opera',
      realm: 'normal',
      indoor: true,
      mapX: 4,
      mapY: 1,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 580,
      special: 'relic_pedestal',
      focalX: 300,
      focalY: 192,
      leftRoomId: 'chapel_stair_hall',
      leftDoorFloorY: 492,
      rightRoomId: 'central_warp_room',
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
        { kind: 'bookshelf', x: 160, y: 492, scale: 1.02 },
        { kind: 'bookshelf', x: 345, y: 492, scale: 1.02 },
        { kind: 'bookshelf', x: 920, y: 492, scale: 1.05 },
        { kind: 'bookshelf', x: 1120, y: 492, scale: 1.05 },
        { kind: 'bookshelf', x: 1320, y: 492, scale: 1.05 },
        { kind: 'dragon_brazier', x: 825, y: 492, scale: 0.94 },
        { kind: 'chandelier', x: 1080, y: 58, scale: 0.95 },
      ],
      waterZones: [],
      pavilions: [
        { x: 150, y: 192, w: 380, hasPillars: false, label: '天机破妄坛（需壁虎游墙功攀登）' },
        { x: 940, y: 368, w: 280, hasPillars: false },
      ],
      archways: [],
      torches: [],
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
    },

    {
      id: 'upper_library',
      name: '万卷藏书飞阁',
      subtitle: '皇家书库 · 双层典籍与香炉长廊',
      region: 'library',
      bgKey: 'bg_library_opera',
      realm: 'normal',
      indoor: true,
      mapX: 8,
      mapY: 2,
      gridW: 3,
      gridH: 1,
      pixelW: 2000,
      pixelH: 600,
      special: 'relic_pedestal',
      storyTriggerId: 'meet_library_su',
      focalX: 480,
      focalY: 508,
      leftRoomId: 'central_pendulum_shaft',
      leftDoorFloorY: 508,
      rightRoomId: 'clock_balcony',
      rightDoorFloorY: 508,
      groundNodes: [
        { x: 0, y: 508, style: 'marble' },
        { x: 680, y: 508, style: 'stairs' },
        { x: 780, y: 482, style: 'marble' },
        { x: 1220, y: 482, style: 'stairs' },
        { x: 1320, y: 508, style: 'marble' },
        { x: 2000, y: 508, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 2000, bottomY: 62, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'bookshelf', x: 185, y: 508, scale: 1.06 },
        { kind: 'bookshelf', x: 375, y: 508, scale: 1.06 },
        { kind: 'bookshelf', x: 900, y: 482, scale: 1.06 },
        { kind: 'bookshelf', x: 1100, y: 482, scale: 1.06 },
        { kind: 'bookshelf', x: 1480, y: 508, scale: 1.06 },
        { kind: 'bookshelf', x: 1680, y: 508, scale: 1.06 },
        { kind: 'bookshelf', x: 280, y: 366, scale: 0.88 },
        { kind: 'bookshelf', x: 1560, y: 366, scale: 0.88 },
        { kind: 'incense_burner', x: 615, y: 508, scale: 0.96 },
        { kind: 'dragon_brazier', x: 1365, y: 508, scale: 0.94 },
        { kind: 'chandelier', x: 640, y: 60, scale: 0.98 },
        { kind: 'chandelier', x: 1360, y: 60, scale: 0.98 },
      ],
      secretWalls: [
        {
          id: 'sw_lib_wallmeat',
          x: 785,
          y: 370,
          w: 54,
          h: 112,
          dropKind: 'consumable',
          dropItemId: 'beggar_chicken',
        },
      ],
      waterZones: [],
      pavilions: [
        { x: 170, y: 366, w: 320, hasPillars: false, label: '御书二层藏剑廊' },
        { x: 580, y: 248, w: 260, hasPillars: false },
        { x: 960, y: 342, w: 280, hasPillars: false },
        { x: 1420, y: 366, w: 320, hasPillars: false },
      ],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [{ x: 1100, y: 215 }],
      npcs: [
        {
          id: 'su_qingyan',
          name: '苏清晏',
          title: '钦天监司辰女官',
          x: 525,
          defaultFacing: 1,
        },
      ],
      spawns: [
        { kind: 'scroll_demon', x: 740 },
        { kind: 'scroll_demon', x: 1120 },
        { kind: 'opera_puppet', x: 1460 },
        { kind: 'bronze_guard', x: 1790 },
      ],
      pickups: [
        { id: 'pk_lib_sword2', kind: 'weapon', itemId: 'sword_2', x: 265, y: 366 },
        { id: 'pk_lib_bell', kind: 'armor', itemId: 'qingxin_bell', x: 1580, y: 366 },
      ],
    },

    {
      id: 'lib_boss',
      name: '奉天内殿 · 洗墨堂',
      subtitle: '奉天正殿 · 万卷妖宗死斗堂',
      region: 'main_hall',
      bgKey: 'bg_main_hall',
      realm: 'normal',
      indoor: true,
      mapX: 8,
      mapY: 3,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 540,
      special: 'boss_room',
      focalX: 800,
      focalY: 452,
      bossKind: 'boss_scroll_king',
      leftRoomId: 'central_pendulum_shaft',
      leftDoorFloorY: 452,
      rightRoomId: 'east_sanctum',
      rightDoorFloorY: 452,
      groundNodes: [
        { x: 0, y: 452, style: 'marble' },
        { x: 1600, y: 452, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 64, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'lattice_window', x: 420, y: 360, scale: 1.05 },
        { kind: 'lattice_window', x: 1180, y: 360, scale: 1.05 },
        { kind: 'dragon_brazier', x: 260, y: 452, scale: 0.96 },
        { kind: 'dragon_brazier', x: 1340, y: 452, scale: 0.96 },
        { kind: 'silk_banner', x: 640, y: 404, scale: 0.98 },
        { kind: 'silk_banner', x: 960, y: 404, scale: 0.98 },
        { kind: 'chandelier', x: 800, y: 60, scale: 1.0 },
      ],
      waterZones: [],
      pavilions: [
        { x: 220, y: 336, w: 230, hasPillars: false },
        { x: 1150, y: 336, w: 230, hasPillars: false },
      ],
      archways: [],
      torches: [],
      foregrounds: [{ x: 800, kind: 'dragon_pillar', parallax: 1.24 }],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    {
      id: 'sky_bridge_corridor',
      name: '飞虹悬空长廊',
      subtitle: '云海天桥 · 朱雀旌旗与悬灯飞索廊',
      region: 'clock_tower',
      bgKey: 'bg_chapel_spire',
      realm: 'normal',
      mapX: 8,
      mapY: 1,
      gridW: 3,
      gridH: 1,
      pixelW: 2000,
      pixelH: 520,
      special: 'none',
      focalX: 1000,
      focalY: 420,
      leftRoomId: 'central_pendulum_shaft',
      leftDoorFloorY: 420,
      rightRoomId: 'clock_balcony',
      rightDoorFloorY: 420,
      groundNodes: [
        { x: 0, y: 420, style: 'marble' },
        { x: 460, y: 420, style: 'arch_bridge' },
        { x: 780, y: 368, style: 'arch_bridge' },
        { x: 1220, y: 368, style: 'arch_bridge' },
        { x: 1540, y: 420, style: 'marble' },
        { x: 2000, y: 420, style: 'marble' },
      ],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'guardian_statue', x: 240, y: 420, scale: 0.96 },
        { kind: 'dragon_brazier', x: 410, y: 420, scale: 0.95 },
        { kind: 'dragon_brazier', x: 1590, y: 420, scale: 0.95 },
        { kind: 'guardian_statue', x: 1760, y: 420, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [
        { x: 220, y: 294, w: 210, hasPillars: true },
        { x: 890, y: 246, w: 220, hasPillars: true, label: '飞虹观云亭' },
        { x: 1570, y: 294, w: 210, hasPillars: true },
      ],
      archways: [
        { x: 445, title: '飞虹西阙' },
        { x: 1555, title: '晨钟东阙' },
      ],
      torches: [],
      foregrounds: [],
      lanterns: [
        { x: 640, y: 205 },
        { x: 1000, y: 165 },
        { x: 1360, y: 205 },
      ],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 660 },
        { kind: 'bronze_guard', x: 1000 },
        { kind: 'bell_gargoyle', x: 1360 },
      ],
      pickups: [{ id: 'pk_bridge_jinchuang', kind: 'consumable', itemId: 'jinchuang_yao', x: 1000, y: 246 }],
    },

    // -------------------- 【五、2×2 百丈晨钟机关楼、凌霄祭天坛 & 1×3 东城断壁望月塔】 --------------------
    {
      id: 'clock_balcony',
      name: '百丈晨钟机关楼',
      subtitle: '2×2 巨型齿轮塔 · 青铜枢机与大鹏王座',
      region: 'clock_tower',
      bgKey: 'bg_library_opera',
      realm: 'normal',
      indoor: true,
      mapX: 11,
      mapY: 1,
      gridW: 2,
      gridH: 2,
      pixelW: 1600,
      pixelH: 920,
      special: 'boss_room',
      bossKind: 'boss_thunder_yaksha',
      focalX: 1080,
      focalY: 320,
      sideDoors: [
        // 上层 gy=1 (rowOffset=0)
        { side: 'left', floorY: 320, targetRoomId: 'sky_bridge_corridor', rowOffset: 0 },
        { side: 'right', floorY: 320, targetRoomId: 'keep_stair_approach', rowOffset: 0 },
        // 下层 gy=2 (rowOffset=1)
        { side: 'left', floorY: 820, targetRoomId: 'upper_library', rowOffset: 1 },
        { side: 'right', floorY: 820, targetRoomId: 'east_outer_tower', rowOffset: 1 },
      ],
      groundNodes: [
        { x: 0, y: 820, style: 'marble' },
        { x: 1600, y: 820, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 56, style: 'palace_timber' }],
      shafts: [],
      clockGears: [
        { x: 360, y: 675, radius: 114, speed: 0.54, hasOrbitPlatforms: true },
        { x: 560, y: 530, radius: 98, speed: -0.66 },
        { x: 770, y: 465, radius: 120, speed: 0.5, hasOrbitPlatforms: true },
        { x: 1140, y: 635, radius: 108, speed: -0.48, hasOrbitPlatforms: true },
        { x: 1350, y: 470, radius: 92, speed: 0.68 },
        { x: 480, y: 245, radius: 90, speed: -0.62 },
      ],
      decorProps: [
        { kind: 'giant_bell', x: 800, y: 242, scale: 1.08 },
        { kind: 'lattice_window', x: 250, y: 710, scale: 1.05 },
        { kind: 'lattice_window', x: 1350, y: 710, scale: 1.05 },
        { kind: 'dragon_brazier', x: 185, y: 820, scale: 0.96 },
        { kind: 'dragon_brazier', x: 1415, y: 820, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [
        { x: 0, y: 320, w: 340, hasPillars: false, label: '◂ 飞虹悬空长廊' },
        { x: 160, y: 695, w: 200, hasPillars: false },
        { x: 460, y: 565, w: 220, hasPillars: false, label: '钟楼中层枢机台' },
        { x: 920, y: 320, w: 680, hasPillars: false, label: '晨钟顶层飞虹台（通往凌霄神道 ▸）' },
      ],
      archways: [],
      torches: [
        { x: 240, y: 244 },
        { x: 1060, y: 244 },
        { x: 1460, y: 244 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 620, y: 310 },
        { x: 940, y: 560 },
      ],
      npcs: [],
      spawns: [
        { kind: 'bell_gargoyle', x: 460, y: 660 },
        { kind: 'bell_gargoyle', x: 840, y: 520 },
      ],
      pickups: [{ id: 'pk_roof_hp_up', kind: 'max_up', itemId: 'hp_vessel', x: 565, y: 565 }],
    },

    {
      id: 'keep_stair_approach',
      name: '凌霄登坛神道',
      subtitle: '王座前庭 · 镇魂古祠与登天丹陛',
      region: 'altar',
      bgKey: 'bg_chapel_spire',
      realm: 'normal',
      indoor: true,
      mapX: 13,
      mapY: 0,
      gridW: 1,
      gridH: 2,
      pixelW: 900,
      pixelH: 880,
      special: 'save_shrine',
      warpName: '凌霄神道古祠',
      focalX: 450,
      focalY: 784,
      sideDoors: [
        // 顶层 gy=0 (rowOffset=0) -> 向右踏入凌霄祭天坛！
        { side: 'right', floorY: 304, targetRoomId: 'sky_altar', rowOffset: 0 },
        // 下层 gy=1 (rowOffset=1) -> 向左连通晨钟机关楼顶层！
        { side: 'left', floorY: 784, targetRoomId: 'clock_balcony', rowOffset: 1 },
      ],
      groundNodes: [
        { x: 0, y: 784, style: 'marble' },
        { x: 900, y: 784, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 900, bottomY: 56, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 220, y: 784, scale: 0.98 },
        { kind: 'dragon_brazier', x: 680, y: 784, scale: 0.98 },
        { kind: 'silk_banner', x: 240, y: 268, scale: 1.0 },
        { kind: 'silk_banner', x: 660, y: 268, scale: 1.0 },
        { kind: 'guardian_statue', x: 720, y: 304, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [
        { x: 140, y: 656, w: 220, hasPillars: false },
        { x: 460, y: 534, w: 220, hasPillars: false },
        { x: 180, y: 416, w: 220, hasPillars: false },
        { x: 480, y: 304, w: 420, hasPillars: false, label: '凌霄祭天门 ▸' },
      ],
      archways: [],
      torches: [
        { x: 620, y: 228 },
        { x: 810, y: 228 },
      ],
      foregrounds: [],
      lanterns: [{ x: 440, y: 380 }],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    // 【致敬月下夜想曲悬挑于东北绝巅的伯爵王座长阶梯 —— 凌霄祭天坛 [14..16, 0]！】
    {
      id: 'sky_altar',
      name: '凌霄祭天坛',
      subtitle: '表城绝巅 · 血月登坛长阶与镇脉阵眼',
      region: 'altar',
      bgKey: 'bg_main_hall',
      realm: 'normal',
      mapX: 14,
      mapY: 0,
      gridW: 3,
      gridH: 1,
      pixelW: 1800,
      pixelH: 580,
      special: 'boss_room',
      bossKind: 'boss_pei_wuji',
      focalX: 1260,
      focalY: 308,
      leftRoomId: 'keep_stair_approach',
      leftDoorFloorY: 496,
      groundNodes: [
        { x: 0, y: 496, style: 'marble' },
        { x: 340, y: 496, style: 'stairs' },
        { x: 940, y: 308, style: 'marble' },
        { x: 1800, y: 308, style: 'marble' },
      ],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 240, y: 496, scale: 1.0 },
        { kind: 'coiled_pillar', x: 520, y: 440, scale: 1.1 },
        { kind: 'coiled_pillar', x: 780, y: 358, scale: 1.1 },
        { kind: 'dragon_brazier', x: 1020, y: 308, scale: 1.02 },
        { kind: 'incense_burner', x: 1520, y: 308, scale: 1.04 },
        { kind: 'guardian_statue', x: 1660, y: 308, scale: 1.02 },
      ],
      waterZones: [],
      pavilions: [{ x: 1320, y: 196, w: 240, hasPillars: true, label: '镇脉望星坛' }],
      archways: [{ x: 955, title: '凌霄祭天门' }],
      torches: [
        { x: 420, y: 406 },
        { x: 680, y: 326 },
        { x: 1120, y: 232 },
        { x: 1480, y: 232 },
      ],
      foregrounds: [
        { x: 620, kind: 'dragon_pillar', parallax: 1.24 },
        { x: 1380, kind: 'dragon_pillar', parallax: 1.24 },
      ],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    {
      id: 'east_sanctum',
      name: '东宫镇魂偏殿',
      subtitle: '奉天东翼 · 盘龙暖殿与梨园暗井',
      region: 'main_hall',
      bgKey: 'bg_main_hall',
      realm: 'normal',
      indoor: true,
      mapX: 10,
      mapY: 3,
      gridW: 3,
      gridH: 1,
      pixelW: 1800,
      pixelH: 520,
      special: 'save_shrine',
      warpName: '东宫镇魂偏殿',
      focalX: 620,
      focalY: 432,
      leftRoomId: 'lib_boss',
      leftDoorFloorY: 432,
      rightRoomId: 'east_outer_tower',
      rightDoorFloorY: 432,
      groundNodes: [
        { x: 0, y: 432, style: 'marble' },
        { x: 1800, y: 432, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 1800, bottomY: 66, style: 'palace_timber' }],
      shafts: [{ x1: 860, x2: 1020, dir: 'down', targetRoomId: 'opera_foyer' }],
      decorProps: [
        { kind: 'coiled_pillar', x: 320, y: 432, scale: 1.08 },
        { kind: 'dragon_brazier', x: 480, y: 432, scale: 0.95 },
        { kind: 'lattice_window', x: 1180, y: 345, scale: 1.02 },
        { kind: 'coiled_pillar', x: 1460, y: 432, scale: 1.08 },
        { kind: 'chandelier', x: 1180, y: 64, scale: 0.94 },
      ],
      secretWalls: [
        {
          id: 'sw_east_chicken',
          x: 1620,
          y: 314,
          w: 58,
          h: 118,
          dropKind: 'consumable',
          dropItemId: 'beggar_chicken',
        },
      ],
      waterZones: [],
      pavilions: [
        { x: 200, y: 308, w: 220, hasPillars: false },
        { x: 858, y: 432, w: 164, hasPillars: false, label: '百戏梨园鬼市井（↓+跃）' },
        { x: 1240, y: 308, w: 240, hasPillars: false },
      ],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'paper_swordsman', x: 1180 },
        { kind: 'bronze_guard', x: 1490 },
      ],
      pickups: [],
    },

    // 【致敬月下夜想曲东侧悬崖外壁 —— 1×3 东城断壁望月塔 [13, 2..4]！】
    {
      id: 'east_outer_tower',
      name: '东城断壁望月塔',
      subtitle: '东垣外壁 · 血月凭栏三层箭楼',
      region: 'gatehouse',
      bgKey: 'bg_gatehouse',
      realm: 'normal',
      mapX: 13,
      mapY: 2,
      gridW: 1,
      gridH: 3,
      pixelW: 800,
      pixelH: 1320,
      special: 'none',
      focalX: 400,
      focalY: 776,
      sideDoors: [
        // 顶层 gy=2 (rowOffset=0)
        { side: 'left', floorY: 320, targetRoomId: 'clock_balcony', rowOffset: 0 },
        { side: 'right', floorY: 320, targetRoomId: 'outer_mist_vault', rowOffset: 0 },
        // 中层 gy=3 (rowOffset=1)
        { side: 'left', floorY: 776, targetRoomId: 'east_sanctum', rowOffset: 1 },
        { side: 'right', floorY: 776, targetRoomId: 'outer_cliff_warp', rowOffset: 1 },
        // 底层 gy=4 (rowOffset=2)
        { side: 'left', floorY: 1216, targetRoomId: 'opera_foyer', rowOffset: 2 },
        { side: 'right', floorY: 1216, targetRoomId: 'opera_stage_boss', rowOffset: 2 },
      ],
      groundNodes: [
        { x: 0, y: 1216, style: 'flagstone' },
        { x: 800, y: 1216, style: 'flagstone' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 56, style: 'gate_tunnel' }],
      shafts: [],
      climbWalls: [{ x: 400, topY: 360, bottomY: 1120 }],
      decorProps: [
        { kind: 'dragon_brazier', x: 185, y: 1216, scale: 0.96 },
        { kind: 'weapon_rack', x: 615, y: 1216, scale: 0.96 },
        { kind: 'guardian_statue', x: 185, y: 776, scale: 0.92 },
        { kind: 'dragon_brazier', x: 615, y: 320, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [
        { x: 110, y: 1090, w: 200, hasPillars: true },
        { x: 490, y: 980, w: 200, hasPillars: true },
        { x: 110, y: 880, w: 200, hasPillars: false },
        // 中层门廊平台 (y=776)
        { x: 0, y: 776, w: 265, hasPillars: false, label: '◂ 东宫偏殿' },
        { x: 535, y: 776, w: 265, hasPillars: false, label: '断崖传送阵 ▸' },
        { x: 480, y: 650, w: 200, hasPillars: false },
        { x: 120, y: 530, w: 200, hasPillars: false },
        { x: 480, y: 425, w: 200, hasPillars: false },
        // 顶层门廊平台 (y=320)
        { x: 0, y: 320, w: 265, hasPillars: false, label: '◂ 晨钟机关楼' },
        { x: 535, y: 320, w: 265, hasPillars: false, label: '望月观星秘阁 ▸' },
      ],
      archways: [],
      torches: [
        { x: 140, y: 1136 },
        { x: 660, y: 1136 },
        { x: 140, y: 696 },
        { x: 660, y: 696 },
        { x: 140, y: 244 },
        { x: 660, y: 244 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 310, y: 940 },
        { x: 490, y: 510 },
      ],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 520, y: 1216 },
        { kind: 'bell_gargoyle', x: 260, y: 920 },
        { kind: 'bell_gargoyle', x: 540, y: 520 },
      ],
      pickups: [],
    },

    {
      id: 'outer_mist_vault',
      name: '望月观星秘阁',
      subtitle: '紫瘴封藏 · 观星露台与赤炎巨阙',
      region: 'clock_tower',
      bgKey: 'bg_chapel_spire',
      realm: 'normal',
      indoor: true,
      mapX: 14,
      mapY: 2,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'relic_pedestal',
      focalX: 540,
      focalY: 396,
      leftRoomId: 'east_outer_tower',
      leftDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'marble' },
        { x: 800, y: 396, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 64, style: 'palace_timber' }],
      shafts: [],
      ironGate: {
        id: 'gate_outer_mist',
        x: 230,
        topY: 64,
        bottomY: 396,
        gateKind: 'mist_only',
      },
      decorProps: [
        { kind: 'dragon_brazier', x: 380, y: 396, scale: 0.95 },
        { kind: 'weapon_rack', x: 650, y: 396, scale: 1.0 },
        { kind: 'lattice_window', x: 520, y: 318, scale: 1.02 },
      ],
      waterZones: [],
      pavilions: [{ x: 380, y: 286, w: 260, hasPillars: false, label: '观星神兵台' }],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [
        { id: 'pk_outer_gs2', kind: 'weapon', itemId: 'greatsword_2', x: 455, y: 286 },
        { id: 'pk_outer_hp', kind: 'max_up', itemId: 'hp_vessel', x: 575, y: 286 },
      ],
    },

    {
      id: 'outer_cliff_warp',
      name: '东垣断崖传送阵',
      subtitle: '东城悬崖 · 太极八卦传送阵',
      region: 'gatehouse',
      bgKey: 'bg_gatehouse',
      realm: 'normal',
      mapX: 14,
      mapY: 3,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'warp_bagua',
      warpName: '东垣断崖传送阵',
      focalX: 440,
      focalY: 396,
      leftRoomId: 'east_outer_tower',
      leftDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'flagstone' },
        { x: 800, y: 396, style: 'flagstone' },
      ],
      ceilingSpans: [],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 220, y: 396, scale: 0.94 },
        { kind: 'guardian_statue', x: 640, y: 396, scale: 0.96 },
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

    // -------------------- 【六、百戏梨园鬼市（全新暖红灯海主题城域 gy=4！）】 --------------------
    {
      id: 'opera_foyer',
      name: '子夜百戏鬼市灯街',
      subtitle: '百戏梨园 · 千灯戏楼与傀儡夜市',
      region: 'opera',
      bgKey: 'bg_opera_market',
      realm: 'normal',
      mapX: 10,
      mapY: 4,
      gridW: 3,
      gridH: 1,
      pixelW: 2000,
      pixelH: 560,
      special: 'none',
      focalX: 1000,
      focalY: 468,
      leftRoomId: 'xiao_arena',
      leftDoorFloorY: 468,
      rightRoomId: 'east_outer_tower',
      rightDoorFloorY: 468,
      groundNodes: [
        { x: 0, y: 468, style: 'flagstone' },
        { x: 580, y: 468, style: 'stairs' },
        { x: 700, y: 440, style: 'marble' },
        { x: 1320, y: 440, style: 'stairs' },
        { x: 1440, y: 468, style: 'flagstone' },
        { x: 2000, y: 468, style: 'flagstone' },
      ],
      ceilingSpans: [
        { x1: 0, x2: 860, bottomY: 64, style: 'palace_timber' },
        { x1: 1020, x2: 2000, bottomY: 64, style: 'palace_timber' },
      ],
      shafts: [
        { x1: 860, x2: 1020, dir: 'up', targetRoomId: 'east_sanctum' },
        { x1: 280, x2: 430, dir: 'down', targetRoomId: 'forge_east_treasury' },
      ],
      decorProps: [
        { kind: 'silk_banner', x: 210, y: 418, scale: 1.02 },
        { kind: 'dragon_brazier', x: 520, y: 468, scale: 0.98 },
        { kind: 'incense_burner', x: 780, y: 440, scale: 0.98 },
        { kind: 'silk_banner', x: 1180, y: 392, scale: 1.02 },
        { kind: 'dragon_brazier', x: 1520, y: 468, scale: 0.98 },
        { kind: 'chandelier', x: 640, y: 60, scale: 0.96 },
        { kind: 'chandelier', x: 1420, y: 60, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [
        { x: 278, y: 468, w: 154, hasPillars: false, label: '赤火秘库暗井（↓+跃）' },
        { x: 480, y: 336, w: 240, hasPillars: true, label: '西厢听戏楼' },
        { x: 868, y: 218, w: 150, hasPillars: false, label: '攀回东宫偏殿' },
        { x: 1160, y: 320, w: 280, hasPillars: true, label: '子夜锦衣坊' },
      ],
      archways: [{ x: 1680, title: '惊梦梨园坊' }],
      torches: [
        { x: 160, y: 388 },
        { x: 440, y: 388 },
        { x: 740, y: 362 },
        { x: 1080, y: 362 },
        { x: 1380, y: 388 },
        { x: 1640, y: 388 },
        { x: 1860, y: 388 },
      ],
      foregrounds: [
        { x: 380, kind: 'hanging_lantern', parallax: 1.25 },
        { x: 1020, kind: 'hanging_lantern', parallax: 1.25 },
        { x: 1620, kind: 'hanging_lantern', parallax: 1.25 },
      ],
      lanterns: [
        { x: 620, y: 205 },
        { x: 1020, y: 185 },
        { x: 1420, y: 205 },
      ],
      npcs: [
        {
          id: 'bai_zhanggui',
          name: '白掌柜',
          title: '子夜鬼市狐商',
          x: 1780,
          defaultFacing: -1,
        },
      ],
      spawns: [
        { kind: 'opera_puppet', x: 610 },
        { kind: 'lantern_ghost', x: 960 },
        { kind: 'opera_puppet', x: 1290 },
        { kind: 'paper_swordsman', x: 1560 },
      ],
      pickups: [
        { id: 'pk_opera_robe2', kind: 'armor', itemId: 'night_silk_robe', x: 1295, y: 320 },
        { id: 'pk_opera_wine', kind: 'consumable', itemId: 'osmanthus_wine', x: 585, y: 336 },
      ],
    },

    {
      id: 'opera_stage_boss',
      name: '惊梦梨园 · 大戏台',
      subtitle: '梨园主台 · 惊梦百戏傩神试炼殿（夺【飞燕钩锁】！）',
      region: 'opera',
      bgKey: 'bg_opera_market',
      realm: 'normal',
      indoor: true,
      mapX: 14,
      mapY: 4,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 560,
      special: 'boss_room',
      bossKind: 'boss_opera_god',
      focalX: 860,
      focalY: 444,
      leftRoomId: 'east_outer_tower',
      leftDoorFloorY: 468,
      groundNodes: [
        { x: 0, y: 468, style: 'marble' },
        { x: 320, y: 468, style: 'stairs' },
        { x: 420, y: 444, style: 'marble' },
        { x: 1180, y: 444, style: 'stairs' },
        { x: 1280, y: 468, style: 'marble' },
        { x: 1600, y: 468, style: 'marble' },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 58, style: 'palace_timber' }],
      shafts: [],
      decorProps: [
        { kind: 'silk_banner', x: 260, y: 400, scale: 1.06 },
        { kind: 'dragon_brazier', x: 440, y: 444, scale: 1.02 },
        { kind: 'dragon_brazier', x: 1160, y: 444, scale: 1.02 },
        { kind: 'silk_banner', x: 1340, y: 400, scale: 1.06 },
        { kind: 'chandelier', x: 540, y: 56, scale: 0.98 },
        { kind: 'chandelier', x: 1060, y: 56, scale: 0.98 },
      ],
      waterZones: [],
      pavilions: [
        { x: 200, y: 326, w: 220, hasPillars: false, label: '西看台' },
        { x: 1180, y: 326, w: 220, hasPillars: false, label: '东看台（高悬宝阁）' },
        { x: 660, y: 204, w: 280, hasPillars: false, label: '藻井悬灯梁（飞燕钩锁可达）' },
      ],
      archways: [],
      torches: [],
      foregrounds: [
        { x: 320, kind: 'hanging_lantern', parallax: 1.24 },
        { x: 1280, kind: 'hanging_lantern', parallax: 1.24 },
      ],
      lanterns: [
        { x: 520, y: 220 },
        { x: 800, y: 175 },
        { x: 1080, y: 220 },
      ],
      npcs: [],
      spawns: [],
      pickups: [{ id: 'pk_opera_mp_up', kind: 'max_up', itemId: 'mp_vessel', x: 800, y: 204 }],
    },

    // -------------------- 【七、九曲寒潭水牢 & 2×2 千丈荧光飞瀑涧 (gy=4..5)】 --------------------
    {
      id: 'prison_jade_vault',
      name: '玄鸟秘冢 · 西密室',
      subtitle: '水牢极西 · 镇族玉佩封藏室',
      region: 'prison',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      indoor: true,
      mapX: 0,
      mapY: 4,
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
      decorProps: [
        { kind: 'dragon_brazier', x: 150, y: 396, scale: 0.94 },
        { kind: 'guardian_statue', x: 465, y: 396, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [{ x: 150, y: 292, w: 250, hasPillars: true, label: '玄鸟合璧祭坛' }],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [{ kind: 'opera_puppet', x: 430 }],
      pickups: [
        { id: 'pk_jade_full', kind: 'ability', itemId: 'jade_pendant_full', x: 235, y: 292 },
        { id: 'pk_daggers_2', kind: 'weapon', itemId: 'daggers_2', x: 355, y: 292 },
      ],
    },

    {
      id: 'crypt_vault',
      name: '幽冥藏甲密室',
      subtitle: '幽冥水牢 · 玄铁封锁秘库',
      region: 'prison',
      bgKey: 'bg_forge_prison',
      realm: 'normal',
      indoor: true,
      mapX: 1,
      mapY: 4,
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
      decorProps: [
        { kind: 'weapon_rack', x: 145, y: 396, scale: 0.96 },
        { kind: 'dragon_brazier', x: 430, y: 396, scale: 0.92 },
      ],
      waterZones: [],
      pavilions: [{ x: 160, y: 294, w: 240, hasPillars: true, label: '镇军武库台' }],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [{ kind: 'bronze_guard', x: 410 }],
      pickups: [
        { id: 'pk_crypt_armor', kind: 'armor', itemId: 'mingguang_armor', x: 220, y: 294 },
        { id: 'pk_crypt_daggers1', kind: 'weapon', itemId: 'daggers_1', x: 340, y: 294 },
      ],
    },

    {
      id: 'crypt_canal',
      name: '九曲幽冥暗渠',
      subtitle: '幽冥地下水牢 · 荧光水栈与石拱暗河',
      region: 'prison',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      indoor: true,
      mapX: 2,
      mapY: 4,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 520,
      special: 'none',
      focalX: 800,
      focalY: 416,
      leftRoomId: 'crypt_vault',
      leftDoorFloorY: 416,
      rightRoomId: 'cavern_waterfall_chasm',
      rightDoorFloorY: 416,
      groundNodes: [
        { x: 0, y: 416, style: 'crypt_stone' },
        { x: 380, y: 416, style: 'crypt_stone' },
        { x: 460, y: 446, style: 'crypt_stone' },
        { x: 1140, y: 446, style: 'crypt_stone' },
        { x: 1220, y: 416, style: 'crypt_stone' },
        { x: 1600, y: 416, style: 'crypt_stone' },
      ],
      ceilingSpans: [
        { x1: 0, x2: 520, bottomY: 78, style: 'crypt_vault' },
        { x1: 656, x2: 1600, bottomY: 78, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 520, x2: 656, dir: 'up', targetRoomId: 'gate_2' }],
      waterZones: [{ x1: 420, x2: 1180, surfaceY: 432 }],
      decorProps: [
        { kind: 'dragon_brazier', x: 240, y: 416, scale: 0.94 },
        { kind: 'guardian_statue', x: 1350, y: 416, scale: 0.94 },
      ],
      pavilions: [
        { x: 460, y: 334, w: 200, hasPillars: true },
        { x: 760, y: 252, w: 200, hasPillars: true },
        { x: 520, y: 158, w: 160, hasPillars: false, label: '返回瓮城古祠' },
        { x: 1020, y: 334, w: 190, hasPillars: true },
      ],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [{ x: 860, y: 185 }],
      npcs: [],
      spawns: [
        { kind: 'paper_swordsman', x: 280 },
        { kind: 'lantern_ghost', x: 880 },
        { kind: 'plague_toad', x: 1320 },
      ],
      pickups: [],
    },

    // 【2×2 地下千丈荧光飞瀑涧 —— 连通上层暗渠/灵泉与下层渡口古祠/赤火古窖！】
    {
      id: 'cavern_waterfall_chasm',
      name: '千丈荧光飞瀑涧',
      subtitle: '地底奇观 · 荧光灵瀑与悬索栈桥',
      region: 'prison',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      mapX: 4,
      mapY: 4,
      gridW: 2,
      gridH: 2,
      pixelW: 1600,
      pixelH: 920,
      special: 'none',
      focalX: 800,
      focalY: 816,
      sideDoors: [
        // 上层 gy=4 (rowOffset=0)
        { side: 'left', floorY: 340, targetRoomId: 'crypt_canal', rowOffset: 0 },
        { side: 'right', floorY: 340, targetRoomId: 'crypt_warp', rowOffset: 0 },
        // 下层 gy=5 (rowOffset=1)
        { side: 'left', floorY: 816, targetRoomId: 'sunken_ferry_shrine', rowOffset: 1 },
        { side: 'right', floorY: 816, targetRoomId: 'forge_west_hall', rowOffset: 1 },
      ],
      groundNodes: [
        { x: 0, y: 816, style: 'crypt_stone' },
        { x: 420, y: 816, style: 'arch_bridge' },
        { x: 800, y: 782, style: 'arch_bridge' },
        { x: 1180, y: 816, style: 'crypt_stone' },
        { x: 1600, y: 816, style: 'crypt_stone' },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 64, style: 'crypt_vault' }],
      shafts: [],
      waterZones: [{ x1: 360, x2: 1240, surfaceY: 828 }],
      decorProps: [
        { kind: 'dragon_brazier', x: 210, y: 816, scale: 0.95 },
        { kind: 'guardian_statue', x: 350, y: 816, scale: 0.96 },
        { kind: 'guardian_statue', x: 1250, y: 816, scale: 0.96 },
        { kind: 'dragon_brazier', x: 1390, y: 816, scale: 0.95 },
      ],
      pavilions: [
        // 上层左右栈道 (y=340)
        { x: 0, y: 340, w: 360, hasPillars: false, label: '◂ 九曲幽冥暗渠' },
        { x: 560, y: 368, w: 220, hasPillars: false },
        { x: 900, y: 368, w: 220, hasPillars: false },
        { x: 1240, y: 340, w: 360, hasPillars: false, label: '地脉镇魂灵泉 ▸' },
        // 中层飞瀑悬空栈桥
        { x: 240, y: 520, w: 240, hasPillars: false },
        { x: 680, y: 565, w: 240, hasPillars: false, label: '观瀑灵莲台' },
        { x: 1120, y: 520, w: 240, hasPillars: false },
        { x: 420, y: 690, w: 210, hasPillars: true },
        { x: 970, y: 690, w: 210, hasPillars: true },
      ],
      archways: [],
      torches: [
        { x: 180, y: 264 },
        { x: 1420, y: 264 },
        { x: 800, y: 488 },
      ],
      foregrounds: [],
      lanterns: [
        { x: 460, y: 260 },
        { x: 800, y: 240 },
        { x: 1140, y: 260 },
      ],
      npcs: [],
      spawns: [
        { kind: 'plague_toad', x: 280, y: 816 },
        { kind: 'bell_gargoyle', x: 800, y: 480 },
        { kind: 'lantern_ghost', x: 1180, y: 620 },
        { kind: 'plague_toad', x: 1340, y: 816 },
      ],
      pickups: [{ id: 'pk_waterfall_huiqi', kind: 'consumable', itemId: 'osmanthus_wine', x: 800, y: 565 }],
    },

    {
      id: 'sunken_ferry_shrine',
      name: '寒潭渡口古祠',
      subtitle: '飞瀑西岸 · 渔火暖炉镇魂祠',
      region: 'prison',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      indoor: true,
      mapX: 3,
      mapY: 5,
      gridW: 1,
      gridH: 1,
      pixelW: 800,
      pixelH: 480,
      special: 'save_shrine',
      warpName: '寒潭渡口古祠',
      focalX: 400,
      focalY: 396,
      rightRoomId: 'cavern_waterfall_chasm',
      rightDoorFloorY: 396,
      groundNodes: [
        { x: 0, y: 396, style: 'crypt_stone' },
        { x: 800, y: 396, style: 'crypt_stone' },
      ],
      ceilingSpans: [{ x1: 0, x2: 800, bottomY: 76, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 220, y: 396, scale: 0.95 },
        { kind: 'incense_burner', x: 580, y: 396, scale: 0.95 },
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
      id: 'crypt_warp',
      name: '地脉镇魂灵泉',
      subtitle: '地脉镇魂坛 · 太极八卦传送阵',
      region: 'altar',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      indoor: true,
      mapX: 6,
      mapY: 4,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 500,
      special: 'warp_bagua',
      warpName: '地脉镇魂灵泉',
      focalX: 520,
      focalY: 412,
      leftRoomId: 'cavern_waterfall_chasm',
      leftDoorFloorY: 412,
      rightRoomId: 'xiao_arena',
      rightDoorFloorY: 412,
      groundNodes: [
        { x: 0, y: 412, style: 'crypt_stone' },
        { x: 1600, y: 412, style: 'crypt_stone' },
      ],
      ceilingSpans: [
        { x1: 0, x2: 1120, bottomY: 82, style: 'crypt_vault' },
        { x1: 1280, x2: 1600, bottomY: 82, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 1120, x2: 1280, dir: 'up', targetRoomId: 'central_pendulum_shaft' }],
      decorProps: [
        { kind: 'dragon_brazier', x: 340, y: 412, scale: 0.95 },
        { kind: 'dragon_brazier', x: 700, y: 412, scale: 0.95 },
        { kind: 'incense_burner', x: 1420, y: 412, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [
        { x: 920, y: 302, w: 240, hasPillars: true, label: '灵泉法器台' },
        { x: 1130, y: 176, w: 140, hasPillars: false, label: '攀回玄枢钟摆井' },
      ],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [{ kind: 'lantern_ghost', x: 1320 }],
      pickups: [
        { id: 'pk_crypt_mp_up', kind: 'max_up', itemId: 'mp_vessel', x: 985, y: 302 },
        { id: 'pk_sub_seal', kind: 'weapon', itemId: 'sub:mountain_seal', x: 1105, y: 302 },
      ],
    },

    {
      id: 'xiao_arena',
      name: '九曲寒潭 · 问剑水牢',
      subtitle: '水牢深处 · 少统领萧断水试剑处（夺【缩地化雾】！）',
      region: 'prison',
      bgKey: 'bg_cavern_waterfall',
      realm: 'normal',
      indoor: true,
      mapX: 8,
      mapY: 4,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 520,
      special: 'boss_room',
      bossKind: 'boss_xiao_duanshui',
      storyTriggerId: 'boss_xiao_pre',
      focalX: 800,
      focalY: 416,
      leftRoomId: 'crypt_warp',
      leftDoorFloorY: 416,
      rightRoomId: 'opera_foyer',
      rightDoorFloorY: 416,
      groundNodes: [
        { x: 0, y: 416, style: 'crypt_stone' },
        { x: 1600, y: 416, style: 'crypt_stone' },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 80, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 220, y: 416, scale: 0.96 },
        { kind: 'guardian_statue', x: 520, y: 416, scale: 0.96 },
        { kind: 'guardian_statue', x: 1080, y: 416, scale: 0.96 },
        { kind: 'dragon_brazier', x: 1380, y: 416, scale: 0.96 },
      ],
      waterZones: [],
      pavilions: [
        { x: 240, y: 298, w: 210, hasPillars: true },
        { x: 1150, y: 298, w: 210, hasPillars: true },
      ],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    // -------------------- 【八、赤火古窖 · 熔金铸剑地宫 & 九幽最深层 (gy=5..6)】 --------------------
    {
      id: 'forge_west_hall',
      name: '赤火古窖 · 铸剑长廊',
      subtitle: '熔金地宫 · 龙口高炉与淬火铁渠',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 6,
      mapY: 5,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 540,
      special: 'none',
      focalX: 800,
      focalY: 432,
      leftRoomId: 'cavern_waterfall_chasm',
      leftDoorFloorY: 432,
      rightRoomId: 'forge_titan_arena',
      rightDoorFloorY: 432,
      groundNodes: [
        { x: 0, y: 432, style: 'crypt_stone' },
        { x: 460, y: 432, style: 'arch_bridge' },
        { x: 760, y: 396, style: 'arch_bridge' },
        { x: 1040, y: 432, style: 'crypt_stone' },
        { x: 1600, y: 432, style: 'crypt_stone' },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 74, style: 'crypt_vault' }],
      shafts: [{ x1: 1160, x2: 1310, dir: 'down', targetRoomId: 'catacomb_bone_crypt' }],
      waterZones: [{ x1: 470, x2: 1020, surfaceY: 454, liquidKind: 'lava' }],
      decorProps: [
        { kind: 'dragon_brazier', x: 220, y: 432, scale: 1.02 },
        { kind: 'weapon_rack', x: 370, y: 432, scale: 1.0 },
        { kind: 'dragon_brazier', x: 1090, y: 432, scale: 1.02 },
        { kind: 'weapon_rack', x: 1430, y: 432, scale: 1.0 },
      ],
      pavilions: [
        { x: 220, y: 312, w: 200, hasPillars: false },
        { x: 640, y: 276, w: 230, hasPillars: false, label: '熔金悬台' },
        { x: 1158, y: 432, w: 154, hasPillars: false, label: '九幽深渊井（↓+跃）' },
      ],
      archways: [],
      torches: [],
      foregrounds: [{ x: 760, kind: 'dragon_pillar', parallax: 1.24 }],
      lanterns: [{ x: 755, y: 185 }],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 320 },
        { kind: 'bell_gargoyle', x: 760 },
        { kind: 'opera_puppet', x: 1410 },
      ],
      pickups: [{ id: 'pk_forge_potion', kind: 'consumable', itemId: 'jinchuang_yao', x: 755, y: 276 }],
    },

    {
      id: 'forge_titan_arena',
      name: '赤火丹炉 · 镇火神殿',
      subtitle: '地脉丹炉心 · 赤铜镇火巨灵死斗殿（夺【千斤坠】！）',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 8,
      mapY: 5,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 560,
      special: 'boss_room',
      bossKind: 'boss_furnace_titan',
      focalX: 840,
      focalY: 452,
      leftRoomId: 'forge_west_hall',
      leftDoorFloorY: 452,
      rightRoomId: 'forge_east_treasury',
      rightDoorFloorY: 452,
      groundNodes: [
        { x: 0, y: 452, style: 'crypt_stone' },
        { x: 1600, y: 452, style: 'crypt_stone' },
      ],
      ceilingSpans: [{ x1: 0, x2: 1600, bottomY: 70, style: 'crypt_vault' }],
      shafts: [],
      decorProps: [
        { kind: 'dragon_brazier', x: 240, y: 452, scale: 1.06 },
        { kind: 'incense_burner', x: 560, y: 452, scale: 1.04 },
        { kind: 'incense_burner', x: 1040, y: 452, scale: 1.04 },
        { kind: 'dragon_brazier', x: 1360, y: 452, scale: 1.06 },
        { kind: 'coiled_pillar', x: 410, y: 452, scale: 1.1 },
        { kind: 'coiled_pillar', x: 1190, y: 452, scale: 1.1 },
      ],
      waterZones: [],
      pavilions: [
        { x: 220, y: 326, w: 220, hasPillars: false },
        { x: 1160, y: 326, w: 220, hasPillars: false },
      ],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [{ x: 800, y: 205 }],
      npcs: [],
      spawns: [],
      pickups: [],
    },

    {
      id: 'forge_east_treasury',
      name: '赤火镇岳秘库',
      subtitle: '地底铸兵秘窟 · 护体灵剑与兵符藏处',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 10,
      mapY: 5,
      gridW: 2,
      gridH: 1,
      pixelW: 1600,
      pixelH: 520,
      special: 'relic_pedestal',
      focalX: 780,
      focalY: 416,
      leftRoomId: 'forge_titan_arena',
      leftDoorFloorY: 416,
      groundNodes: [
        { x: 0, y: 416, style: 'crypt_stone' },
        { x: 1600, y: 416, style: 'crypt_stone' },
      ],
      ceilingSpans: [
        { x1: 0, x2: 280, bottomY: 78, style: 'crypt_vault' },
        { x1: 430, x2: 1600, bottomY: 78, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 280, x2: 430, dir: 'up', targetRoomId: 'opera_foyer' }],
      ironGate: {
        id: 'gate_mist_forge',
        x: 560,
        topY: 78,
        bottomY: 416,
        gateKind: 'mist_only',
      },
      secretWalls: [
        {
          id: 'sw_forge_chicken',
          x: 1490,
          y: 300,
          w: 58,
          h: 116,
          dropKind: 'consumable',
          dropItemId: 'beggar_chicken',
        },
      ],
      decorProps: [
        { kind: 'weapon_rack', x: 720, y: 416, scale: 1.02 },
        { kind: 'dragon_brazier', x: 960, y: 416, scale: 1.0 },
        { kind: 'weapon_rack', x: 1220, y: 416, scale: 1.02 },
      ],
      waterZones: [],
      pavilions: [
        { x: 286, y: 168, w: 138, hasPillars: false, label: '攀回百戏鬼市' },
        { x: 140, y: 294, w: 190, hasPillars: false },
        { x: 760, y: 302, w: 280, hasPillars: false, label: '赤火镇岳台' },
      ],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [],
      npcs: [],
      spawns: [
        { kind: 'opera_puppet', x: 740 },
        { kind: 'bronze_guard', x: 1180 },
      ],
      pickups: [
        { id: 'pk_forge_tally', kind: 'armor', itemId: 'tiger_tally', x: 835, y: 302 },
        { id: 'pk_sub_orbit', kind: 'weapon', itemId: 'sub:sword_orbit', x: 965, y: 302 },
      ],
    },

    {
      id: 'catacomb_bone_crypt',
      name: '九幽地脉深渊窟',
      subtitle: '玄城最深层 · 熔岩暗河与上古灵脉宝穴',
      region: 'forge',
      bgKey: 'bg_molten_forge',
      realm: 'normal',
      indoor: true,
      mapX: 6,
      mapY: 6,
      gridW: 3,
      gridH: 1,
      pixelW: 2000,
      pixelH: 540,
      special: 'relic_pedestal',
      focalX: 1000,
      focalY: 436,
      groundNodes: [
        { x: 0, y: 436, style: 'crypt_stone' },
        { x: 480, y: 436, style: 'arch_bridge' },
        { x: 820, y: 398, style: 'arch_bridge' },
        { x: 1180, y: 398, style: 'arch_bridge' },
        { x: 1520, y: 436, style: 'crypt_stone' },
        { x: 2000, y: 436, style: 'crypt_stone' },
      ],
      ceilingSpans: [
        { x1: 0, x2: 1160, bottomY: 74, style: 'crypt_vault' },
        { x1: 1310, x2: 2000, bottomY: 74, style: 'crypt_vault' },
      ],
      shafts: [{ x1: 1160, x2: 1310, dir: 'up', targetRoomId: 'forge_west_hall' }],
      waterZones: [{ x1: 490, x2: 1510, surfaceY: 458, liquidKind: 'lava' }],
      decorProps: [
        { kind: 'guardian_statue', x: 220, y: 436, scale: 1.02 },
        { kind: 'dragon_brazier', x: 380, y: 436, scale: 1.02 },
        { kind: 'dragon_brazier', x: 1620, y: 436, scale: 1.02 },
        { kind: 'guardian_statue', x: 1780, y: 436, scale: 1.02 },
      ],
      pavilions: [
        { x: 180, y: 306, w: 260, hasPillars: false, label: '深渊西宝坛' },
        { x: 880, y: 274, w: 240, hasPillars: false },
        { x: 1168, y: 168, w: 136, hasPillars: false, label: '返回铸剑长廊' },
        { x: 1560, y: 306, w: 260, hasPillars: false, label: '深渊东宝坛' },
      ],
      archways: [],
      torches: [],
      foregrounds: [],
      lanterns: [
        { x: 640, y: 205 },
        { x: 1380, y: 205 },
      ],
      npcs: [],
      spawns: [
        { kind: 'bronze_guard', x: 320 },
        { kind: 'bell_gargoyle', x: 760 },
        { kind: 'bell_gargoyle', x: 1320 },
        { kind: 'bronze_guard', x: 1710 },
      ],
      pickups: [
        { id: 'pk_abyss_hp', kind: 'max_up', itemId: 'hp_vessel', x: 290, y: 306 },
        { id: 'pk_abyss_mp', kind: 'max_up', itemId: 'mp_vessel', x: 1690, y: 306 },
      ],
    },
  ];

  return rooms.map((r) => enrichRoomAtmosphere(r));
}

/**
 * 自动构建《恶魔城：月下夜想曲》灵魂机制 —— 180° 乾坤翻转【九幽倒悬里城】！
 * 36 座表城房间悉数 180° 镜像翻转 (`invMapX = 17 - mapX - gridW`, `invMapY = 7 - mapY - gridH`)，
 * 包括所有多层竖塔的左右门廊与上下层标高自动翻转对齐！
 */
function createInvertedCastleRooms(normalRooms: BuiltRoom[]): BuiltRoom[] {
  const invertedUpgradePickups: Record<string, ScenePickup[]> = {
    gate_2: [{ id: 'inv_pk_robe', kind: 'armor', itemId: 'xuanniao_robe', x: 520, y: 416 }],
    upper_library: [{ id: 'inv_pk_sword3', kind: 'weapon', itemId: 'sword_3', x: 1520, y: 366 }],
    secret_archive: [{ id: 'inv_pk_whip3', kind: 'weapon', itemId: 'whip_3', x: 520, y: 368 }],
    crypt_vault: [{ id: 'inv_pk_gs3', kind: 'weapon', itemId: 'greatsword_3', x: 540, y: 294 }],
    prison_jade_vault: [{ id: 'inv_pk_dag3', kind: 'weapon', itemId: 'daggers_3', x: 520, y: 292 }],
    forge_east_treasury: [{ id: 'inv_pk_spear3', kind: 'weapon', itemId: 'spear_3', x: 720, y: 302 }],
    crypt_warp: [{ id: 'inv_pk_gourd', kind: 'armor', itemId: 'fortune_gourd', x: 580, y: 302 }],
    clock_balcony: [{ id: 'inv_pk_hp2', kind: 'max_up', itemId: 'hp_vessel', x: 1020, y: 565 }],
    opera_foyer: [{ id: 'inv_pk_wine2', kind: 'consumable', itemId: 'osmanthus_wine', x: 720, y: 320 }],
    catacomb_bone_crypt: [{ id: 'inv_pk_hp3', kind: 'max_up', itemId: 'hp_vessel', x: 1000, y: 274 }],
  };

  return normalRooms.map((rm) => {
    const W = rm.pixelW;
    const invMapX = MAP_GRID_TOTAL_W - rm.mapX - rm.gridW;
    const invMapY = MAP_GRID_TOTAL_H - rm.mapY - rm.gridH;

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

    // 翻转多层竖塔侧门：左右对调，且在 gridH > 1 竖塔中将 rowOffset 翻转为 gridH - 1 - rowOffset 并互换对应楼层标高！
    const origDoors = getRoomSideDoors(rm);
    const rowElevationMap = new Map<number, number>();
    for (const d of origDoors) {
      rowElevationMap.set(d.rowOffset ?? 0, d.floorY);
    }
    const flippedSideDoors: SideDoor[] = origDoors.map((d) => {
      const origRow = d.rowOffset ?? 0;
      const invRow = rm.gridH - 1 - origRow;
      const invFloorY = rowElevationMap.get(invRow) ?? d.floorY;
      return {
        side: d.side === 'left' ? 'right' : 'left',
        floorY: invFloorY,
        targetRoomId: d.targetRoomId,
        rowOffset: invRow,
      };
    });

    const baseFloorY = flippedNodes[0]?.y || 412;
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
      const shFloor = sampleSolidGroundY(
        { ...rm, groundNodes: flippedNodes },
        (sh.x1 + sh.x2) * 0.5
      );
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

    const eliteSpawns: SceneSpawn[] =
      isTrueFinalRoom || isEntryAltar
        ? []
        : [
            { kind: 'bell_gargoyle', x: Math.round(W * 0.32) },
            { kind: 'opera_puppet', x: Math.round(W * 0.68) },
          ];

    return {
      id: rm.id,
      name: isTrueFinalRoom ? '倒悬魔渊 · 烛阴冥坛' : `里 · ${rm.name}`,
      subtitle: isTrueFinalRoom
        ? '九幽倒悬里城 · 太古尸仙最终决战殿'
        : '九幽倒悬里城 · 阴阳逆乱之境',
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
      storyTriggerId: undefined,
      warpName: rm.warpName ? `里 · ${rm.warpName}` : undefined,
      focalX: W - rm.focalX,
      focalY: rm.focalY,
      sideDoors: flippedSideDoors,
      groundNodes: flippedNodes,
      ceilingSpans: isTrueFinalRoom ? [] : flippedCeilings,
      shafts: flippedShafts,
      decorProps: rm.decorProps?.map((dp) => ({ ...dp, x: W - dp.x })),
      clockGears: rm.clockGears?.map((cg) => ({ ...cg, x: W - cg.x, speed: -cg.speed })),
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
  return enrichRoomAtmosphere({
    id: 'boss_rush_arena',
    name: '百鬼试炼 · 镇妖塔',
    subtitle: '巅峰连战 · 七大妖王宿敌车轮死斗',
    region: 'altar',
    bgKey: 'bg_molten_forge',
    realm: 'normal',
    mapX: 8,
    mapY: 3,
    gridW: 2,
    gridH: 1,
    pixelW: 1500,
    pixelH: 500,
    special: 'boss_room',
    focalX: 750,
    focalY: 412,
    groundNodes: [
      { x: 0, y: 412, style: 'marble' },
      { x: 1500, y: 412, style: 'marble' },
    ],
    ceilingSpans: [],
    shafts: [],
    waterZones: [],
    pavilions: [
      { x: 200, y: 288, w: 220, hasPillars: true },
      { x: 1080, y: 288, w: 220, hasPillars: true },
    ],
    archways: [{ x: 750, title: '百鬼镇妖塔' }],
    torches: [
      { x: 320, y: 332 },
      { x: 750, y: 332 },
      { x: 1180, y: 332 },
    ],
    foregrounds: [],
    lanterns: [{ x: 750, y: 180 }],
    npcs: [],
    spawns: [],
    pickups: [],
  });
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

  /**
   * 支持多层竖塔多标高门廊的无缝跨房解析：自动按玩家当前高度匹配所穿过的那扇门，并精准对齐目标房回连门标高！
   */
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
        // 若目标房中有反向对应天井口，优先精准对齐目标天井中心 X！
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
