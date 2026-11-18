import {
  CastleRealm,
  EnemyKind,
  LanternAnchor,
  RegionId,
  RoomPickupSpawn,
  RoomSpecial,
} from '../types';

export const TILE_SIZE = 40;
export const MAP_GRID_TOTAL_W = 6;
export const MAP_GRID_TOTAL_H = 3;

export interface GroundNode {
  x: number;
  y: number;
  style: 'flagstone' | 'arch_bridge' | 'stairs' | 'marble';
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
  parallax: number; // > 1.0 前景视差遮挡层（如 1.24）
}

export interface SceneSpawn {
  kind: EnemyKind;
  x: number;
}

export interface ScenePickup {
  id: string;
  kind: RoomPickupSpawn['kind'];
  itemId: string;
  x: number;
  y?: number; // 若省略则自动贴合地面或阁楼台面
}

export interface BuiltRoom {
  id: string;
  name: string;
  subtitle: string;
  region: RegionId;
  realm: CastleRealm;
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
  groundNodes: GroundNode[];
  pavilions: PavilionPlatform[];
  waterZones: WaterZone[];
  archways: ArchwayProp[];
  torches: { x: number; y: number }[];
  foregrounds: ForegroundProp[];
  lanterns: LanternAnchor[];
  spawns: SceneSpawn[];
  pickups: ScenePickup[];
}

export const REGION_NAMES: Record<RegionId, string> = {
  gatehouse: '苦竹瓮城',
  main_hall: '奉天残殿',
  library: '万卷藏书阁',
  forge: '赤火铸剑坊',
  prison: '九曲幽冥水牢',
  opera: '百戏梨园鬼市',
  clock_tower: '百丈晨钟暮鼓楼',
  altar: '凌霄祭天坛',
};

/**
 * 采样任意世界X坐标处的真实连续石阶/拱桥/地面高度（彻底告别方块格子地面！）
 */
export function sampleGroundY(room: BuiltRoom, px: number): number {
  const nodes = room.groundNodes;
  if (nodes.length === 0) return 420;
  if (px <= nodes[0].x) return nodes[0].y;
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    if (px >= a.x && px <= b.x) {
      const t = (px - a.x) / Math.max(1, b.x - a.x);
      if (a.style === 'arch_bridge') {
        // 柔和微拱圆弧桥面曲线
        const linear = a.y + (b.y - a.y) * t;
        const archLift = Math.sin(t * Math.PI) * 14;
        return linear - archLift;
      }
      return a.y + (b.y - a.y) * t;
    }
  }
  return nodes[nodes.length - 1].y;
}

function createShowcaseScenes(): BuiltRoom[] {
  // ==================== 第一幕：断魂苦竹渡（石拱桥 + 临水箭楼 + 夜竹迷雾） ====================
  const scene1: BuiltRoom = {
    id: 'gate_1',
    name: '断魂苦竹渡',
    subtitle: '卷壹 · 护城古桥',
    region: 'gatehouse',
    realm: 'normal',
    mapX: 0,
    mapY: 1,
    gridW: 2,
    gridH: 1,
    pixelW: 2400,
    pixelH: 540,
    special: 'none',
    focalX: 300,
    focalY: 426,
    storyTriggerId: 'intro_gate',
    rightRoomId: 'gate_2',
    groundNodes: [
      { x: 0, y: 426, style: 'flagstone' },
      { x: 420, y: 426, style: 'arch_bridge' },
      { x: 760, y: 366, style: 'arch_bridge' },
      { x: 1060, y: 366, style: 'arch_bridge' },
      { x: 1400, y: 426, style: 'flagstone' },
      { x: 1840, y: 426, style: 'stairs' },
      { x: 2080, y: 388, style: 'flagstone' },
      { x: 2400, y: 388, style: 'flagstone' },
    ],
    waterZones: [{ x1: 400, x2: 1420, surfaceY: 448 }],
    pavilions: [
      {
        x: 1460,
        y: 288,
        w: 330,
        hasPillars: true,
        label: '临水望楼',
      },
    ],
    archways: [{ x: 2220, title: '瓮城外关' }],
    torches: [
      { x: 390, y: 365 },
      { x: 910, y: 300 },
      { x: 1430, y: 365 },
      { x: 2090, y: 325 },
    ],
    foregrounds: [
      { x: 140, kind: 'bamboo', parallax: 1.24 },
      { x: 680, kind: 'hanging_lantern', parallax: 1.18 },
      { x: 1320, kind: 'bamboo', parallax: 1.26 },
      { x: 1960, kind: 'bamboo', parallax: 1.22 },
    ],
    lanterns: [],
    spawns: [
      { kind: 'paper_swordsman', x: 940 },
      { kind: 'lantern_ghost', x: 1320 },
      { kind: 'paper_swordsman', x: 1620 },
      { kind: 'paper_swordsman', x: 2040 },
    ],
    pickups: [
      { id: 'pk_bridge_potion', kind: 'consumable', itemId: 'jinchuang_yao', x: 1625, y: 288 },
    ],
  };

  // ==================== 第二幕：瓮城镇魂古祠（镇魂祠留档 + 斩马陌刀兵器架 + 二段跳高阁秘宝） ====================
  const scene2: BuiltRoom = {
    id: 'gate_2',
    name: '瓮城镇魂古祠',
    subtitle: '卷壹 · 谯楼丹陛',
    region: 'gatehouse',
    realm: 'normal',
    mapX: 2,
    mapY: 1,
    gridW: 2,
    gridH: 1,
    pixelW: 2200,
    pixelH: 540,
    special: 'save_shrine',
    focalX: 1120,
    focalY: 374,
    leftRoomId: 'gate_1',
    rightRoomId: 'lib_boss',
    groundNodes: [
      { x: 0, y: 416, style: 'flagstone' },
      { x: 520, y: 416, style: 'stairs' },
      { x: 780, y: 374, style: 'marble' },
      { x: 1460, y: 374, style: 'stairs' },
      { x: 1720, y: 414, style: 'flagstone' },
      { x: 2200, y: 414, style: 'flagstone' },
    ],
    waterZones: [],
    pavilions: [
      // 高悬谯楼飞檐秘阁：离地面高差 226px，普通一跳(约145px)绝不可及，击败第三幕妖王习得【踏云步·二段跳】后回溯跃上！
      {
        x: 240,
        y: 190,
        w: 360,
        hasPillars: true,
        label: '谯楼藏兵秘阁（需踏云步二段跳）',
      },
      // 中段助跳飞檐檐廊（从374地面先二段跳上278或从这里连跳上190秘阁！）
      {
        x: 640,
        y: 274,
        w: 220,
        hasPillars: true,
      },
    ],
    archways: [
      { x: 130, title: '苦竹渡口' },
      { x: 2040, title: '奉天殿门' },
    ],
    torches: [
      { x: 510, y: 350 },
      { x: 960, y: 310 },
      { x: 1280, y: 310 },
      { x: 1740, y: 350 },
    ],
    foregrounds: [
      { x: 380, kind: 'bamboo', parallax: 1.25 },
      { x: 1580, kind: 'dragon_pillar', parallax: 1.22 },
    ],
    lanterns: [],
    spawns: [
      { kind: 'paper_swordsman', x: 420 },
      { kind: 'bronze_guard', x: 1840 }, // 重盾甲士守门：正好测试重刃【赤炎斩马陌刀】破盾威力！
    ],
    pickups: [
      // 祠堂旁神兵架直接供李逸承拔取第二把核心重兵器【赤炎斩马陌刀】！
      { id: 'pk_modao_rack', kind: 'weapon', itemId: 'greatsword_1', x: 900, y: 374 },
      // 二层高阁二段跳回溯大奖：名器【墨渊秋水剑】+【荷叶叫花鸡】！
      { id: 'pk_high_sword2', kind: 'weapon', itemId: 'sword_2', x: 360, y: 190 },
      { id: 'pk_high_chicken', kind: 'consumable', itemId: 'beggar_chicken', x: 470, y: 190 },
    ],
  };

  // ==================== 第三幕：奉天残殿 · 洗墨天池（多阶段妖王死斗堂 -> 解锁二段跳） ====================
  const scene3: BuiltRoom = {
    id: 'lib_boss',
    name: '奉天残殿 · 洗墨堂',
    subtitle: '卷壹 · 守关妖宗',
    region: 'main_hall',
    realm: 'normal',
    mapX: 4,
    mapY: 1,
    gridW: 2,
    gridH: 1,
    pixelW: 1960,
    pixelH: 540,
    special: 'boss_room',
    focalX: 980,
    focalY: 386,
    bossKind: 'boss_scroll_king',
    leftRoomId: 'gate_2',
    groundNodes: [
      { x: 0, y: 414, style: 'marble' },
      { x: 360, y: 414, style: 'stairs' },
      { x: 540, y: 386, style: 'marble' },
      { x: 1440, y: 386, style: 'stairs' },
      { x: 1620, y: 414, style: 'marble' },
      { x: 1960, y: 414, style: 'marble' },
    ],
    waterZones: [],
    pavilions: [
      { x: 260, y: 274, w: 250, hasPillars: true },
      { x: 1450, y: 274, w: 250, hasPillars: true },
    ],
    archways: [{ x: 130 }],
    torches: [
      { x: 560, y: 315 },
      { x: 980, y: 315 },
      { x: 1400, y: 315 },
    ],
    foregrounds: [
      { x: 460, kind: 'dragon_pillar', parallax: 1.24 },
      { x: 1520, kind: 'dragon_pillar', parallax: 1.24 },
    ],
    lanterns: [{ x: 980, y: 175 }],
    spawns: [],
    pickups: [],
  };

  return [scene1, scene2, scene3];
}

class CastleWorldRegistry {
  private rooms = new Map<string, BuiltRoom>();
  private totalCells = 0;

  constructor() {
    for (const rm of createShowcaseScenes()) {
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
  ): { nextRoom: BuiltRoom; nextX: number; nextY: number } | null {
    const nextId = dir === 'left' ? cur.leftRoomId : cur.rightRoomId;
    if (!nextId) return null;
    const nextRoom = this.rooms.get(nextId);
    if (!nextRoom) return null;
    const nextX = dir === 'left' ? nextRoom.pixelW - 44 : 44;
    const nextY = sampleGroundY(nextRoom, nextX);
    return { nextRoom, nextX, nextY };
  }

  public calcExplorationPct(visitedRoomKeys: string[]): number {
    let explored = 0;
    const seen = new Set(visitedRoomKeys);
    for (const k of seen) {
      const id = k.includes(':') ? k.split(':')[1] : k;
      const rm = this.rooms.get(id);
      if (rm) explored += rm.gridW * rm.gridH;
    }
    return Math.round((explored / Math.max(1, this.totalCells)) * 1000) / 10;
  }

  public createBossRushRoom(): BuiltRoom {
    return this.getRoom('normal', 'lib_boss');
  }
}

export const WorldMap = new CastleWorldRegistry();
