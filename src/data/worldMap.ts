import {
  CastleRealm,
  EnemyKind,
  LanternAnchor,
  RegionId,
  RoomEnemySpawn,
  RoomPickupSpawn,
  RoomSpecial,
  TileKind,
} from '../types';

export const TILE_SIZE = 40;
export const UNIT_COLS = 22; // 1格标准屏宽 = 880px
export const UNIT_ROWS = 12; // 1格标准屏高 = 480px

export type GateStyle =
  | 'none'
  | 'open'
  | 'high_ledge' // 需踏云步(二段跳)
  | 'cracked_floor' // 需千斤坠震碎
  | 'iron_gate' // 需缩地化雾穿过
  | 'miasma' // 剧毒瘴气墙(需缩地化雾)
  | 'wall_chimney'; // 需壁虎游墙功蹬墙跳

export type RoomPropKind =
  | 'torii_gate' // 残破城门牌坊
  | 'bamboo_cluster' // 夜风苦竹丛
  | 'palace_pillar' // 朱红盘龙大柱
  | 'lattice_window' // 雕花透光宫窗
  | 'wall_torch' // 铜鹤壁灯火把
  | 'bookshelf' // 万卷古籍高柜
  | 'forge_furnace' // 赤铜八卦丹炉
  | 'weapon_rack' // 古兵器架
  | 'stone_statue' // 镇殿石兽/佛龛
  | 'opera_curtain' // 梨园红绸帷幕
  | 'giant_bell' // 景阳青铜巨钟
  | 'silk_banner'; // 垂挂旌旗

export interface RoomProp {
  kind: RoomPropKind;
  x: number;
  y: number; // 底部或中心像素Y
  scale?: number;
}

export interface DoorSpec {
  offsetCell: number; // 位于第几个网格单元 (0 .. gridW-1 或 0 .. gridH-1)
  style: GateStyle;
}

export interface BuiltRoom {
  id: string;
  name: string;
  region: RegionId;
  realm: CastleRealm;
  mapX: number;
  mapY: number;
  gridW: number; // 占据地图水平格数 (1..3)
  gridH: number; // 占据地图垂直格数 (1..2)
  cols: number;
  rows: number;
  pixelW: number;
  pixelH: number;
  special: RoomSpecial;
  focalX: number; // 祠堂/NPC/八卦阵所在中心X
  focalY: number; // 祠堂/NPC/八卦阵所在地面Y
  bossKind?: EnemyKind;
  storyTriggerId?: string;
  warpName?: string;
  tiles: TileKind[][];
  props: RoomProp[];
  lanterns: LanternAnchor[];
  spawns: RoomEnemySpawn[];
  pickups: RoomPickupSpawn[];
  doors: {
    left: DoorSpec[];
    right: DoorSpec[];
    up: DoorSpec[];
    down: DoorSpec[];
  };
}

interface RoomBlueprint {
  id: string;
  name: string;
  region: RegionId;
  mapX: number;
  mapY: number;
  gridW?: number;
  gridH?: number;
  special?: RoomSpecial;
  bossKind?: EnemyKind;
  storyTriggerId?: string;
  warpName?: string;
  doors: {
    left?: DoorSpec[];
    right?: DoorSpec[];
    up?: DoorSpec[];
    down?: DoorSpec[];
  };
  style:
    | 'bridge_entry'
    | 'bamboo_corridor'
    | 'sanctuary'
    | 'grand_hall'
    | 'stepped_gallery'
    | 'vertical_shaft'
    | 'lantern_chasm'
    | 'wall_chimney_tower'
    | 'boss_arena'
    | 'secret_vault';
  secretWallSide?: 'left' | 'right';
  spawns?: RoomEnemySpawn[];
  pickups?: RoomPickupSpawn[];
}

export const REGION_NAMES: Record<RegionId, string> = {
  gatehouse: '瓮城残垣',
  main_hall: '前朝奉天殿',
  library: '万卷藏书阁',
  forge: '赤火铸剑坊',
  prison: '九曲幽冥水牢',
  opera: '百戏梨园鬼市',
  clock_tower: '百丈晨钟暮鼓楼',
  altar: '凌霄祭天坛',
};

// 精心排布的恶魔城多尺寸立体城池蓝图（含 2x1 长廊、1x2 高塔竖井、2x2 恢弘正殿！）
// 网格坐标无任何重叠，所有相邻门洞偏移格严丝合缝！
const BLUEPRINTS: RoomBlueprint[] = [
  // ================= 1. 瓮城残垣 (y=5, x=0..4) =================
  {
    id: 'gate_1',
    name: '玄城护城断桥',
    region: 'gatehouse',
    mapX: 0,
    mapY: 5,
    gridW: 2, // 2屏宽恢弘断桥竹林入口！
    gridH: 1,
    storyTriggerId: 'intro_gate',
    doors: { right: [{ offsetCell: 0, style: 'open' }] },
    style: 'bridge_entry',
    spawns: [{ kind: 'paper_swordsman', gx: 26, gy: 9 }],
    pickups: [{ id: 'pk_start_herb', kind: 'consumable', itemId: 'jinchuang_yao', gx: 35, gy: 6 }],
  },
  {
    id: 'gate_2',
    name: '瓮城苦竹长廊',
    region: 'gatehouse',
    mapX: 2,
    mapY: 5,
    gridW: 2,
    gridH: 1,
    doors: {
      left: [{ offsetCell: 0, style: 'open' }],
      right: [{ offsetCell: 0, style: 'open' }],
    },
    style: 'bamboo_corridor',
    secretWallSide: 'left',
    spawns: [
      { kind: 'paper_swordsman', gx: 11, gy: 9 },
      { kind: 'lantern_ghost', gx: 22, gy: 5 },
      { kind: 'paper_swordsman', gx: 31, gy: 9 },
      { kind: 'bronze_guard', gx: 37, gy: 9 },
    ],
    pickups: [{ id: 'pk_gate_meat', kind: 'consumable', itemId: 'beggar_chicken', gx: 2, gy: 5 }],
  },
  {
    id: 'gate_3',
    name: '瓮城镇魂土地祠',
    region: 'gatehouse',
    mapX: 4,
    mapY: 5,
    gridW: 1,
    gridH: 1,
    special: 'save_shrine',
    doors: {
      left: [{ offsetCell: 0, style: 'open' }],
      right: [{ offsetCell: 0, style: 'open' }],
    },
    style: 'sanctuary',
  },

  // ================= 2. 前朝奉天殿 (核心2x2恢弘大殿枢纽! x=5..7, y=4..5) =================
  {
    id: 'hall_grand',
    name: '前朝奉天金殿',
    region: 'main_hall',
    mapX: 5,
    mapY: 4,
    gridW: 2, // 2宽 x 2高 巨型立体皇城大殿！下层直接连通左右，上层需二段跳登顶分往东西！
    gridH: 2,
    doors: {
      left: [
        { offsetCell: 1, style: 'open' }, // (5,5) 左接 gate_3 (4,5)
        { offsetCell: 0, style: 'high_ledge' }, // (5,4) 左上飞檐接赤火铸剑坊 forge_1 (4,4)
      ],
      right: [
        { offsetCell: 1, style: 'open' }, // (6,5) 右下接 hall_east (7,5)
        { offsetCell: 0, style: 'iron_gate' }, // (6,4) 右上玄铁栅栏接 hall_gate_tunnel (7,4)
      ],
      down: [
        { offsetCell: 1, style: 'cracked_floor' }, // (6,5) 底部裂纹青砖 -> 震碎坠入幽冥水牢 (6,6)
      ],
    },
    style: 'grand_hall',
    spawns: [
      { kind: 'paper_swordsman', gx: 10, gy: 21 },
      { kind: 'bronze_guard', gx: 26, gy: 21 },
      { kind: 'lantern_ghost', gx: 16, gy: 13 },
      { kind: 'scroll_demon', gx: 30, gy: 9 },
    ],
    pickups: [{ id: 'pk_hp_up_1', kind: 'max_up', itemId: 'hp_vessel', gx: 22, gy: 6 }],
  },
  {
    id: 'hall_east',
    name: '奉天殿 · 太极偏殿',
    region: 'main_hall',
    mapX: 7,
    mapY: 5,
    gridW: 1,
    gridH: 1,
    special: 'warp_bagua',
    warpName: '八卦阵 · 奉天正殿',
    doors: {
      left: [{ offsetCell: 0, style: 'open' }],
      right: [{ offsetCell: 0, style: 'open' }],
    },
    style: 'sanctuary',
    pickups: [{ id: 'pk_greatsword_1', kind: 'weapon', itemId: 'greatsword_1', gx: 16, gy: 9 }],
  },
  {
    id: 'hall_gate_tunnel',
    name: '奉天北禁门暗廊',
    region: 'main_hall',
    mapX: 7,
    mapY: 4,
    gridW: 1,
    gridH: 1,
    doors: {
      left: [{ offsetCell: 0, style: 'iron_gate' }],
      up: [{ offsetCell: 0, style: 'open' }],
    },
    style: 'vertical_shaft',
    spawns: [{ kind: 'opera_puppet', gx: 13, gy: 9 }],
  },

  // ================= 3. 万卷藏书阁 (y=5 x=8..11) =================
  {
    id: 'lib_1',
    name: '万卷藏书阁 · 司辰席',
    region: 'library',
    mapX: 8,
    mapY: 5,
    gridW: 1,
    gridH: 1,
    special: 'npc_su_qingyan',
    storyTriggerId: 'meet_library_su',
    doors: {
      left: [{ offsetCell: 0, style: 'open' }],
      right: [{ offsetCell: 0, style: 'open' }],
    },
    style: 'sanctuary',
  },
  {
    id: 'lib_2',
    name: '汗青书山回廊',
    region: 'library',
    mapX: 9,
    mapY: 5,
    gridW: 2,
    gridH: 1,
    doors: {
      left: [{ offsetCell: 0, style: 'open' }],
      right: [{ offsetCell: 0, style: 'open' }],
    },
    style: 'stepped_gallery',
    secretWallSide: 'right',
    spawns: [
      { kind: 'scroll_demon', gx: 10, gy: 5 },
      { kind: 'paper_swordsman', gx: 18, gy: 9 },
      { kind: 'scroll_demon', gx: 28, gy: 5 },
      { kind: 'bronze_guard', gx: 34, gy: 9 },
    ],
    pickups: [{ id: 'pk_spear_1', kind: 'weapon', itemId: 'spear_1', gx: 21, gy: 4 }],
  },
  {
    id: 'lib_boss',
    name: '藏书阁 · 洗墨天池斋',
    region: 'library',
    mapX: 11,
    mapY: 5,
    gridW: 1,
    gridH: 1,
    special: 'boss_room',
    bossKind: 'boss_scroll_king',
    doors: { left: [{ offsetCell: 0, style: 'open' }] },
    style: 'boss_arena',
  },

  // ================= 4. 赤火铸剑坊 (y=4 x=1..4, y=3 x=1) =================
  {
    id: 'forge_1',
    name: '赤火熔炉铁索廊',
    region: 'forge',
    mapX: 3,
    mapY: 4,
    gridW: 2,
    gridH: 1,
    doors: {
      right: [{ offsetCell: 0, style: 'high_ledge' }],
      left: [{ offsetCell: 0, style: 'open' }],
    },
    style: 'stepped_gallery',
    spawns: [
      { kind: 'bronze_guard', gx: 12, gy: 9 },
      { kind: 'lantern_ghost', gx: 22, gy: 5 },
      { kind: 'bronze_guard', gx: 32, gy: 9 },
    ],
  },
  {
    id: 'forge_smith',
    name: '欧冶神匠铸剑庐',
    region: 'forge',
    mapX: 2,
    mapY: 4,
    gridW: 1,
    gridH: 1,
    special: 'npc_smith',
    doors: {
      right: [{ offsetCell: 0, style: 'open' }],
      left: [{ offsetCell: 0, style: 'open' }],
    },
    style: 'sanctuary',
    pickups: [{ id: 'pk_sub_fire', kind: 'weapon', itemId: 'sub:holy_fire', gx: 5, gy: 9 }],
  },
  {
    id: 'forge_2',
    name: '地肺火脉镇魂祠',
    region: 'forge',
    mapX: 1,
    mapY: 4,
    gridW: 1,
    gridH: 1,
    special: 'save_shrine',
    doors: {
      right: [{ offsetCell: 0, style: 'open' }],
      up: [{ offsetCell: 0, style: 'high_ledge' }],
    },
    style: 'vertical_shaft',
  },
  {
    id: 'forge_boss',
    name: '赤铜镇火熔坛',
    region: 'forge',
    mapX: 1,
    mapY: 3,
    gridW: 1,
    gridH: 1,
    special: 'boss_room',
    bossKind: 'boss_furnace_titan',
    doors: { down: [{ offsetCell: 0, style: 'high_ledge' }] },
    style: 'boss_arena',
  },

  // ================= 5. 九曲幽冥水牢 (y=6 x=3..8) =================
  {
    id: 'prison_1',
    name: '九曲阴水道天井',
    region: 'prison',
    mapX: 6,
    mapY: 6,
    gridW: 1,
    gridH: 1,
    doors: {
      up: [{ offsetCell: 0, style: 'cracked_floor' }],
      left: [{ offsetCell: 0, style: 'open' }],
      right: [{ offsetCell: 0, style: 'open' }],
    },
    style: 'stepped_gallery',
    spawns: [
      { kind: 'plague_toad', gx: 7, gy: 9 },
      { kind: 'plague_toad', gx: 15, gy: 9 },
    ],
  },
  {
    id: 'prison_east',
    name: '沉船古渡暗河',
    region: 'prison',
    mapX: 7,
    mapY: 6,
    gridW: 2,
    gridH: 1,
    special: 'warp_bagua',
    warpName: '八卦阵 · 幽冥水牢',
    doors: { left: [{ offsetCell: 0, style: 'open' }] },
    style: 'secret_vault',
    secretWallSide: 'right',
    spawns: [
      { kind: 'plague_toad', gx: 14, gy: 9 },
      { kind: 'lantern_ghost', gx: 28, gy: 5 },
    ],
    pickups: [
      { id: 'pk_daggers_1', kind: 'weapon', itemId: 'daggers_1', gx: 32, gy: 9 },
      { id: 'pk_mp_up_1', kind: 'max_up', itemId: 'mp_vessel', gx: 41, gy: 5 },
    ],
  },
  {
    id: 'prison_save',
    name: '寒铁水牢镇魂祠',
    region: 'prison',
    mapX: 5,
    mapY: 6,
    gridW: 1,
    gridH: 1,
    special: 'save_shrine',
    doors: {
      right: [{ offsetCell: 0, style: 'open' }],
      left: [{ offsetCell: 0, style: 'open' }],
    },
    style: 'sanctuary',
  },
  {
    id: 'prison_boss',
    name: '断水问剑寒潭',
    region: 'prison',
    mapX: 4,
    mapY: 6,
    gridW: 1,
    gridH: 1,
    special: 'boss_room',
    bossKind: 'boss_xiao_duanshui',
    storyTriggerId: 'boss_xiao_pre',
    doors: {
      right: [{ offsetCell: 0, style: 'open' }],
      left: [{ offsetCell: 0, style: 'miasma' }],
    },
    style: 'boss_arena',
  },
  {
    id: 'prison_relic',
    name: '九幽玄鸟秘窟',
    region: 'prison',
    mapX: 3,
    mapY: 6,
    gridW: 1,
    gridH: 1,
    special: 'relic_pedestal',
    doors: { right: [{ offsetCell: 0, style: 'miasma' }] },
    style: 'secret_vault',
    pickups: [
      { id: 'pk_jade_full', kind: 'ability', itemId: 'jade_pendant_full', gx: 8, gy: 9 },
      { id: 'pk_sub_bagua', kind: 'weapon', itemId: 'sub:bagua_cross', gx: 15, gy: 6 },
    ],
  },

  // ================= 6. 百戏梨园鬼市 (y=3 x=6..9) =================
  {
    id: 'opera_market',
    name: '子夜百鬼灯市',
    region: 'opera',
    mapX: 7,
    mapY: 3,
    gridW: 1,
    gridH: 1,
    special: 'npc_merchant',
    doors: {
      down: [{ offsetCell: 0, style: 'open' }],
      left: [{ offsetCell: 0, style: 'open' }],
      right: [{ offsetCell: 0, style: 'open' }],
    },
    style: 'sanctuary',
    pickups: [{ id: 'pk_whip_1', kind: 'weapon', itemId: 'whip_1', gx: 17, gy: 9 }],
  },
  {
    id: 'opera_boss',
    name: '惊梦傩面戏台',
    region: 'opera',
    mapX: 6,
    mapY: 3,
    gridW: 1,
    gridH: 1,
    special: 'boss_room',
    bossKind: 'boss_opera_god',
    doors: { right: [{ offsetCell: 0, style: 'open' }] },
    style: 'boss_arena',
  },
  {
    id: 'chasm_bridge',
    name: '千灯万丈冥渊',
    region: 'opera',
    mapX: 8,
    mapY: 3,
    gridW: 2, // 2屏宽红灯笼悬索深渊！
    gridH: 1,
    doors: {
      left: [{ offsetCell: 0, style: 'open' }],
      right: [{ offsetCell: 0, style: 'open' }],
    },
    style: 'lantern_chasm',
    spawns: [
      { kind: 'bell_gargoyle', gx: 14, gy: 4 },
      { kind: 'bell_gargoyle', gx: 28, gy: 4 },
    ],
  },

  // ================= 7. 百丈晨钟暮鼓楼 (1x2 超高垂直高塔! x=10..11, y=1..3) =================
  {
    id: 'tower_base',
    name: '晨钟楼 · 八卦枢机',
    region: 'clock_tower',
    mapX: 10,
    mapY: 3,
    gridW: 1,
    gridH: 1,
    special: 'warp_bagua',
    warpName: '八卦阵 · 晨钟暮鼓楼',
    doors: {
      left: [{ offsetCell: 0, style: 'open' }],
      up: [{ offsetCell: 0, style: 'high_ledge' }],
    },
    style: 'vertical_shaft',
    pickups: [{ id: 'pk_sub_seal', kind: 'weapon', itemId: 'sub:mountain_seal', gx: 17, gy: 9 }],
  },
  {
    id: 'tower_shaft',
    name: '百丈悬钟蹬云塔',
    region: 'clock_tower',
    mapX: 10,
    mapY: 1,
    gridW: 1,
    gridH: 2, // 2屏高垂直蹬墙高塔！底层(10,2)右接金顶Boss，顶层(10,1)左接禁书室、上接祭天坛！
    doors: {
      down: [{ offsetCell: 0, style: 'high_ledge' }],
      right: [{ offsetCell: 1, style: 'open' }], // (10,2) 右接 tower_boss (11,2)
      left: [{ offsetCell: 0, style: 'wall_chimney' }], // (10,1) 左接 lib_forbidden (9,1)
      up: [{ offsetCell: 0, style: 'wall_chimney' }], // (10,1) 上接 altar_save (10,0)
    },
    style: 'wall_chimney_tower',
    spawns: [
      { kind: 'bell_gargoyle', gx: 7, gy: 17 },
      { kind: 'opera_puppet', gx: 14, gy: 15 },
      { kind: 'bell_gargoyle', gx: 11, gy: 7 },
    ],
  },
  {
    id: 'tower_boss',
    name: '暮鼓雷音金顶阁',
    region: 'clock_tower',
    mapX: 11,
    mapY: 2,
    gridW: 1,
    gridH: 1,
    special: 'boss_room',
    bossKind: 'boss_thunder_yaksha',
    doors: { left: [{ offsetCell: 0, style: 'open' }] },
    style: 'boss_arena',
  },
  {
    id: 'lib_forbidden',
    name: '藏书阁 · 绝顶禁书室',
    region: 'library',
    mapX: 9,
    mapY: 1,
    gridW: 1,
    gridH: 1,
    special: 'relic_pedestal',
    doors: { right: [{ offsetCell: 0, style: 'wall_chimney' }] },
    style: 'secret_vault',
    pickups: [
      { id: 'pk_mirror_truth', kind: 'ability', itemId: 'mirror_truth', gx: 7, gy: 9 },
      { id: 'pk_scroll_soulsteal', kind: 'skill_scroll', itemId: 'jiuyou_soulsteal', gx: 15, gy: 6 },
    ],
  },

  // ================= 8. 凌霄祭天坛 (y=0 x=8..10) =================
  {
    id: 'altar_save',
    name: '南天登仙镇魂祠',
    region: 'altar',
    mapX: 10,
    mapY: 0,
    gridW: 1,
    gridH: 1,
    special: 'save_shrine',
    doors: {
      down: [{ offsetCell: 0, style: 'wall_chimney' }],
      left: [{ offsetCell: 0, style: 'open' }],
    },
    style: 'sanctuary',
    pickups: [{ id: 'pk_wine_altar', kind: 'consumable', itemId: 'osmanthus_wine', gx: 17, gy: 9 }],
  },
  {
    id: 'altar_boss',
    name: '凌霄血月祭天坛',
    region: 'altar',
    mapX: 8,
    mapY: 0,
    gridW: 2, // 2屏宽恢弘云巅决战祭坛！
    gridH: 1,
    special: 'boss_room',
    bossKind: 'boss_pei_wuji',
    doors: { right: [{ offsetCell: 0, style: 'open' }] },
    style: 'boss_arena',
  },
];

export const MAP_GRID_TOTAL_W = 12; // mapX: 0..11
export const MAP_GRID_TOTAL_H = 7; // mapY: 0..6

function createShellGrid(cols: number, rows: number): TileKind[][] {
  const g: TileKind[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: TileKind[] = [];
    for (let c = 0; c < cols; c++) {
      // 顶部1层天花板，底部2层厚实城砖地基，左右各1层城墙
      if (r === 0 || r >= rows - 2 || c === 0 || c === cols - 1) {
        row.push(1);
      } else {
        row.push(0);
      }
    }
    g.push(row);
  }
  return g;
}

function populateInteriorAndProps(
  g: TileKind[][],
  bp: RoomBlueprint,
  cols: number,
  rows: number
): { props: RoomProp[]; lanterns: LanternAnchor[] } {
  const props: RoomProp[] = [];
  const lanterns: LanternAnchor[] = [];
  const floorR = rows - 2; // 1格高时 floorR = 10, 2格高时 floorR = 22
  const floorY = floorR * TILE_SIZE;

  if (bp.style === 'bridge_entry') {
    // 断桥石阶起伏、牌坊残垣、夜竹与飞檐灯火
    props.push(
      { kind: 'torii_gate', x: 7 * TILE_SIZE, y: floorY },
      { kind: 'bamboo_cluster', x: 3.5 * TILE_SIZE, y: floorY },
      { kind: 'bamboo_cluster', x: 14 * TILE_SIZE, y: floorY },
      { kind: 'stone_statue', x: 19 * TILE_SIZE, y: floorY },
      { kind: 'wall_torch', x: 25 * TILE_SIZE, y: floorY - 90 },
      { kind: 'bamboo_cluster', x: 31 * TILE_SIZE, y: floorY },
      { kind: 'palace_pillar', x: 39 * TILE_SIZE, y: floorY }
    );
    // 错落石台与雕花阁楼跳台
    for (let c = 15; c <= 20; c++) g[floorR - 1][c] = 1;
    for (let c = 24; c <= 29; c++) g[7][c] = 2;
    for (let c = 32; c <= 38; c++) g[7][c] = 2;
    lanterns.push({ x: 22 * TILE_SIZE, y: 4.2 * TILE_SIZE });
  } else if (bp.style === 'bamboo_corridor') {
    for (let c = 7; c <= 13; c++) g[7][c] = 2;
    for (let c = 18; c <= 25; c++) g[5][c] = 2;
    for (let c = 29; c <= 36; c++) g[7][c] = 2;
    for (let x = 5; x < cols - 3; x += 7) {
      props.push(
        { kind: x % 2 === 0 ? 'bamboo_cluster' : 'palace_pillar', x: x * TILE_SIZE, y: floorY },
        { kind: 'wall_torch', x: (x + 3) * TILE_SIZE, y: floorY - 95 }
      );
    }
  } else if (bp.style === 'grand_hall') {
    // 2x2 恢弘奉天金殿：多层朱漆雕栏阁楼、盘龙金柱、高悬旌旗！
    for (let x = 6; x < cols - 4; x += 8) {
      props.push(
        { kind: 'palace_pillar', x: x * TILE_SIZE, y: floorY },
        { kind: 'palace_pillar', x: x * TILE_SIZE, y: 10 * TILE_SIZE },
        { kind: 'silk_banner', x: (x + 4) * TILE_SIZE, y: 3 * TILE_SIZE },
        { kind: 'lattice_window', x: (x + 4) * TILE_SIZE, y: 16 * TILE_SIZE }
      );
    }
    // 下层中段阶梯跳台 (不需二段跳可探索一楼全境)
    for (let c = 8; c <= 15; c++) g[18][c] = 2;
    for (let c = 26; c <= 34; c++) g[18][c] = 2;
    for (let c = 16; c <= 26; c++) g[15][c] = 2;
    // 上层二楼东西走廊地板 (第10行，从第15行跳台必须靠【踏云步二段跳】才能跃上第10行高檐！)
    for (let c = 1; c <= 12; c++) g[10][c] = 2;
    for (let c = 30; c <= cols - 2; c++) g[10][c] = 2;
    for (let c = 18; c <= 25; c++) g[7][c] = 2;
    lanterns.push(
      { x: 14 * TILE_SIZE, y: 6.5 * TILE_SIZE },
      { x: 28 * TILE_SIZE, y: 6.5 * TILE_SIZE }
    );
  } else if (bp.style === 'stepped_gallery') {
    for (let c = 5; c < cols - 5; c += 10) {
      for (let k = 0; k < 5 && c + k < cols - 2; k++) g[7][c + k] = 2;
      if (c + 4 < cols - 4) {
        for (let k = 0; k < 4 && c + 4 + k < cols - 2; k++) g[5][c + 4 + k] = 2;
      }
    }
    for (let x = 4; x < cols - 3; x += 6) {
      const pKind: RoomPropKind =
        bp.region === 'library'
          ? 'bookshelf'
          : bp.region === 'forge'
            ? 'forge_furnace'
            : bp.region === 'opera'
              ? 'opera_curtain'
              : 'palace_pillar';
      props.push({ kind: pKind, x: x * TILE_SIZE, y: floorY });
      props.push({ kind: 'wall_torch', x: (x + 3) * TILE_SIZE, y: floorY - 96 });
    }
  } else if (bp.style === 'vertical_shaft') {
    for (let c = 7; c <= 14; c++) g[6][c] = 2;
    for (let c = 8; c <= 13; c++) g[3][c] = 2;
    props.push(
      { kind: 'palace_pillar', x: 4 * TILE_SIZE, y: floorY },
      { kind: 'palace_pillar', x: 17 * TILE_SIZE, y: floorY },
      { kind: 'wall_torch', x: 11 * TILE_SIZE, y: floorY - 110 }
    );
  } else if (bp.style === 'lantern_chasm') {
    // 2屏宽万丈冥渊 + 5盏悬空朱红钩锁宫灯！
    for (let c = 6; c <= cols - 7; c++) {
      g[floorR][c] = 0;
      g[floorR + 1][c] = 7;
    }
    for (let lx = 8.5; lx <= cols - 8; lx += 6.5) {
      lanterns.push({ x: lx * TILE_SIZE, y: 4.6 * TILE_SIZE });
    }
    props.push(
      { kind: 'torii_gate', x: 3.5 * TILE_SIZE, y: floorY },
      { kind: 'torii_gate', x: (cols - 3.5) * TILE_SIZE, y: floorY }
    );
  } else if (bp.style === 'wall_chimney_tower') {
    // 1x2 百丈钟楼蹬墙竖井 (rows = 24)
    for (let r = 4; r <= 17; r++) {
      g[r][6] = 1;
      g[r][15] = 1;
    }
    for (let c = 8; c <= 13; c++) {
      g[19][c] = 2;
      g[14][c] = 2;
    }
    for (let c = 1; c <= 5; c++) g[5][c] = 2;
    props.push(
      { kind: 'giant_bell', x: 11 * TILE_SIZE, y: 9 * TILE_SIZE },
      { kind: 'giant_bell', x: 11 * TILE_SIZE, y: 18 * TILE_SIZE },
      { kind: 'wall_torch', x: 4 * TILE_SIZE, y: 20 * TILE_SIZE },
      { kind: 'wall_torch', x: 18 * TILE_SIZE, y: 20 * TILE_SIZE }
    );
  } else if (bp.style === 'boss_arena') {
    for (let c = 4; c <= 8; c++) g[7][c] = 2;
    for (let c = cols - 9; c <= cols - 5; c++) g[7][c] = 2;
    if (cols > 30) {
      for (let c = 18; c <= 25; c++) g[6][c] = 2;
    }
    for (let x = 5; x < cols - 4; x += 8) {
      props.push(
        { kind: bp.region === 'opera' ? 'opera_curtain' : 'palace_pillar', x: x * TILE_SIZE, y: floorY },
        { kind: 'silk_banner', x: (x + 4) * TILE_SIZE, y: 2.5 * TILE_SIZE }
      );
    }
    lanterns.push({ x: (cols * 0.5) * TILE_SIZE, y: 3.8 * TILE_SIZE });
  } else if (bp.style === 'sanctuary' || bp.style === 'secret_vault') {
    for (let c = 4; c <= 8; c++) g[7][c] = 2;
    for (let c = cols - 9; c <= cols - 5; c++) g[7][c] = 2;
    props.push(
      { kind: 'palace_pillar', x: 4 * TILE_SIZE, y: floorY },
      { kind: 'palace_pillar', x: (cols - 4) * TILE_SIZE, y: floorY },
      { kind: 'lattice_window', x: 8 * TILE_SIZE, y: floorY - 70 },
      { kind: 'lattice_window', x: (cols - 8) * TILE_SIZE, y: floorY - 70 }
    );
    if (bp.special === 'npc_smith') {
      props.push(
        { kind: 'forge_furnace', x: 8.5 * TILE_SIZE, y: floorY },
        { kind: 'weapon_rack', x: 15.5 * TILE_SIZE, y: floorY }
      );
    } else if (bp.special === 'npc_su_qingyan') {
      props.push(
        { kind: 'bookshelf', x: 6 * TILE_SIZE, y: floorY },
        { kind: 'bookshelf', x: 16 * TILE_SIZE, y: floorY }
      );
    } else if (bp.special === 'npc_merchant') {
      props.push({ kind: 'opera_curtain', x: 11 * TILE_SIZE, y: floorY });
    }
  }

  // 雕开所有连接的门洞与对应能力锁机关
  const carveHorizDoor = (side: 'left' | 'right', spec: DoorSpec) => {
    const baseRow = spec.offsetCell * UNIT_ROWS;
    const edgeC = side === 'left' ? 0 : cols - 1;
    const gateC = side === 'left' ? 2 : cols - 3;
    const doorRows = [baseRow + 6, baseRow + 7, baseRow + 8, baseRow + 9];

    for (const r of doorRows) {
      if (r > 0 && r < rows - 1) {
        g[r][edgeC] = 0;
        if (spec.style === 'iron_gate') g[r][gateC] = 4;
        if (spec.style === 'miasma') g[r][gateC] = 5;
      }
    }
    // 门洞下方必铺设扎实落脚台，确保跨房顺畅！
    const stepRow = baseRow + 10;
    if (stepRow < rows) {
      for (let k = 0; k <= 4; k++) {
        const sc = side === 'left' ? k : cols - 1 - k;
        if (g[stepRow][sc] === 0) g[stepRow][sc] = stepRow >= rows - 2 ? 1 : 2;
      }
    }
  };

  for (const d of bp.doors.left || []) carveHorizDoor('left', d);
  for (const d of bp.doors.right || []) carveHorizDoor('right', d);

  for (const d of bp.doors.up || []) {
    const baseCol = d.offsetCell * UNIT_COLS;
    for (let c = baseCol + 9; c <= baseCol + 12; c++) {
      g[0][c] = 0;
      g[1][c] = 0;
      if (g[3][c] === 0) g[3][c] = 2;
    }
  }

  for (const d of bp.doors.down || []) {
    const baseCol = d.offsetCell * UNIT_COLS;
    for (let c = baseCol + 9; c <= baseCol + 12; c++) {
      g[rows - 2][c] = d.style === 'cracked_floor' ? 3 : 2;
      g[rows - 1][c] = 0;
    }
  }

  // 隐藏可击碎肉墙/暗室砖
  if (bp.secretWallSide === 'left') {
    g[4][1] = 6;
    g[5][1] = 6;
    g[6][1] = 2;
    g[6][2] = 2;
    g[6][3] = 2;
  } else if (bp.secretWallSide === 'right') {
    g[4][cols - 2] = 6;
    g[5][cols - 2] = 6;
    g[6][cols - 2] = 2;
    g[6][cols - 3] = 2;
    g[6][cols - 4] = 2;
  }

  return { props, lanterns };
}

function buildRoom(bp: RoomBlueprint, realm: CastleRealm): BuiltRoom {
  const gridW = bp.gridW || 1;
  const gridH = bp.gridH || 1;
  const cols = gridW * UNIT_COLS;
  const rows = gridH * UNIT_ROWS;
  const pixelW = cols * TILE_SIZE;
  const pixelH = rows * TILE_SIZE;

  const baseTiles = createShellGrid(cols, rows);
  const { props, lanterns } = populateInteriorAndProps(baseTiles, bp, cols, rows);

  if (realm === 'normal') {
    return {
      id: bp.id,
      name: bp.name,
      region: bp.region,
      realm: 'normal',
      mapX: bp.mapX,
      mapY: bp.mapY,
      gridW,
      gridH,
      cols,
      rows,
      pixelW,
      pixelH,
      special: bp.special || 'none',
      focalX: pixelW * 0.5,
      focalY: (rows - 2) * TILE_SIZE,
      bossKind: bp.bossKind,
      storyTriggerId: bp.storyTriggerId,
      warpName: bp.warpName,
      tiles: baseTiles,
      props,
      lanterns,
      spawns: bp.spawns ? bp.spawns.map((s) => ({ ...s })) : [],
      pickups: bp.pickups ? bp.pickups.map((p) => ({ ...p })) : [],
      doors: {
        left: bp.doors.left || [],
        right: bp.doors.right || [],
        up: bp.doors.up || [],
        down: bp.doors.down || [],
      },
    };
  }

  // ================= 180° 翻转生成【九幽倒悬里城】多格房间！ =================
  const invMapX = MAP_GRID_TOTAL_W - (bp.mapX + gridW);
  const invMapY = MAP_GRID_TOTAL_H - (bp.mapY + gridH);

  const flipDoors = (list: DoorSpec[] | undefined, span: number): DoorSpec[] =>
    (list || []).map((d) => ({
      offsetCell: span - 1 - d.offsetCell,
      style: d.style === 'cracked_floor' ? 'open' : d.style,
    }));

  const leftDoors = flipDoors(bp.doors.right, gridH);
  const rightDoors = flipDoors(bp.doors.left, gridH);
  const upDoors = flipDoors(bp.doors.down, gridW);
  const downDoors = flipDoors(bp.doors.up, gridW);

  const invTiles = createShellGrid(cols, rows);
  for (let r = 2; r < rows - 2; r++) {
    const srcR = rows - 1 - r;
    for (let c = 1; c < cols - 1; c++) {
      const srcC = cols - 1 - c;
      const st = baseTiles[srcR][srcC];
      if (st === 1 || st === 2) invTiles[r][c] = 2;
    }
  }
  // 补充倒悬城落脚木阶梯，确保高塔与大殿在180°翻转后依然畅行无阻
  for (let cellY = 0; cellY < gridH; cellY++) {
    const br = cellY * UNIT_ROWS;
    for (let c = 5; c < cols - 5; c += 8) {
      for (let k = 0; k < 5 && c + k < cols - 2; k++) {
        if (invTiles[br + 7][c + k] === 0) invTiles[br + 7][c + k] = 2;
      }
    }
  }

  // 重新精准雕开倒悬城四向门洞
  for (const d of leftDoors) {
    const br = d.offsetCell * UNIT_ROWS;
    for (const r of [br + 6, br + 7, br + 8, br + 9]) invTiles[r][0] = 0;
    for (let c = 0; c <= 4; c++) {
      if (invTiles[br + 10][c] === 0) invTiles[br + 10][c] = br + 10 >= rows - 2 ? 1 : 2;
    }
  }
  for (const d of rightDoors) {
    const br = d.offsetCell * UNIT_ROWS;
    for (const r of [br + 6, br + 7, br + 8, br + 9]) invTiles[r][cols - 1] = 0;
    for (let c = cols - 5; c < cols; c++) {
      if (invTiles[br + 10][c] === 0) invTiles[br + 10][c] = br + 10 >= rows - 2 ? 1 : 2;
    }
  }
  for (const d of upDoors) {
    const bc = d.offsetCell * UNIT_COLS;
    for (let c = bc + 9; c <= bc + 12; c++) {
      invTiles[0][c] = 0;
      invTiles[1][c] = 0;
      invTiles[3][c] = 2;
    }
  }
  for (const d of downDoors) {
    const bc = d.offsetCell * UNIT_COLS;
    for (let c = bc + 9; c <= bc + 12; c++) {
      invTiles[rows - 2][c] = 2;
      invTiles[rows - 1][c] = 0;
    }
  }

  let invSpecial: RoomSpecial = bp.special === 'boss_room' ? 'none' : bp.special || 'none';
  let invBoss: EnemyKind | undefined;
  const invPickups: RoomPickupSpawn[] = [];

  if (bp.id === 'gate_1') {
    invSpecial = 'boss_room';
    invBoss = 'boss_zhuyin';
  } else if (bp.id === 'lib_boss') {
    invPickups.push({ id: 'inv_pk_sword3', kind: 'weapon', itemId: 'sword_3', gx: 11, gy: rows - 3 });
  } else if (bp.id === 'forge_boss') {
    invPickups.push({
      id: 'inv_pk_gs3',
      kind: 'weapon',
      itemId: 'greatsword_3',
      gx: 11,
      gy: rows - 3,
    });
  } else if (bp.id === 'opera_boss') {
    invPickups.push({ id: 'inv_pk_whip3', kind: 'weapon', itemId: 'whip_3', gx: 11, gy: rows - 3 });
  } else if (bp.id === 'tower_boss') {
    invPickups.push({
      id: 'inv_pk_spear3',
      kind: 'weapon',
      itemId: 'spear_3',
      gx: 11,
      gy: rows - 3,
    });
  } else if (bp.id === 'prison_relic') {
    invPickups.push({
      id: 'inv_pk_robe',
      kind: 'armor',
      itemId: 'xuanniao_robe',
      gx: 11,
      gy: rows - 3,
    });
  }

  const invSpawns: RoomEnemySpawn[] =
    invSpecial === 'save_shrine' || invSpecial === 'boss_room'
      ? []
      : [
          { kind: 'bell_gargoyle', gx: 9, gy: rows - 6 },
          { kind: 'opera_puppet', gx: Math.min(cols - 6, 17), gy: rows - 3 },
        ];

  return {
    id: bp.id,
    name: `逆·${bp.name}`,
    region: bp.region,
    realm: 'inverted',
    mapX: invMapX,
    mapY: invMapY,
    gridW,
    gridH,
    cols,
    rows,
    pixelW,
    pixelH,
    special: invSpecial,
    focalX: pixelW * 0.5,
    focalY: (rows - 2) * TILE_SIZE,
    bossKind: invBoss,
    warpName: bp.warpName ? `逆·${bp.warpName}` : undefined,
    tiles: invTiles,
    props: props.map((pr) => ({
      kind: pr.kind,
      x: pixelW - pr.x,
      y: (rows - 2) * TILE_SIZE,
    })),
    lanterns: lanterns.map((l) => ({
      x: pixelW - l.x,
      y: Math.max(160, pixelH - l.y - 60),
    })),
    spawns: invSpawns,
    pickups: invPickups,
    doors: {
      left: leftDoors,
      right: rightDoors,
      up: upDoors,
      down: downDoors,
    },
  };
}

class CastleWorldRegistry {
  private normalRooms = new Map<string, BuiltRoom>();
  private invertedRooms = new Map<string, BuiltRoom>();
  private cellLookup = new Map<string, BuiltRoom>();
  private totalNormalCells = 0;

  constructor() {
    for (const bp of BLUEPRINTS) {
      const nr = buildRoom(bp, 'normal');
      const ir = buildRoom(bp, 'inverted');
      this.normalRooms.set(nr.id, nr);
      this.invertedRooms.set(ir.id, ir);
      this.totalNormalCells += nr.gridW * nr.gridH;

      for (let dy = 0; dy < nr.gridH; dy++) {
        for (let dx = 0; dx < nr.gridW; dx++) {
          this.cellLookup.set(`normal:${nr.mapX + dx},${nr.mapY + dy}`, nr);
          this.cellLookup.set(`inverted:${ir.mapX + dx},${ir.mapY + dy}`, ir);
        }
      }
    }
  }

  public getRoom(realm: CastleRealm, id: string): BuiltRoom {
    const m = realm === 'normal' ? this.normalRooms : this.invertedRooms;
    return m.get(id) || this.normalRooms.get('gate_1')!;
  }

  public getRoomAtCell(realm: CastleRealm, cx: number, cy: number): BuiltRoom | undefined {
    return this.cellLookup.get(`${realm}:${cx},${cy}`);
  }

  /**
   * 根据玩家跨出当前房间时的像素坐标 (px, py) 精准定位相邻房间并换算落点坐标！
   */
  public resolveTransition(
    cur: BuiltRoom,
    dir: 'left' | 'right' | 'up' | 'down',
    px: number,
    py: number
  ): { nextRoom: BuiltRoom; nextX: number; nextY: number } | null {
    const localCellX = Math.max(0, Math.min(cur.gridW - 1, Math.floor(px / (UNIT_COLS * TILE_SIZE))));
    const localCellY = Math.max(0, Math.min(cur.gridH - 1, Math.floor(py / (UNIT_ROWS * TILE_SIZE))));
    const worldCellX = cur.mapX + localCellX;
    const worldCellY = cur.mapY + localCellY;

    const targetCellX = worldCellX + (dir === 'left' ? -1 : dir === 'right' ? 1 : 0);
    const targetCellY = worldCellY + (dir === 'up' ? -1 : dir === 'down' ? 1 : 0);
    const nextRoom = this.getRoomAtCell(cur.realm, targetCellX, targetCellY);
    if (!nextRoom) return null;

    const inNextCellX = targetCellX - nextRoom.mapX;
    const inNextCellY = targetCellY - nextRoom.mapY;
    const subX = px - localCellX * UNIT_COLS * TILE_SIZE;
    const subY = py - localCellY * UNIT_ROWS * TILE_SIZE;

    let nextX = inNextCellX * UNIT_COLS * TILE_SIZE + subX;
    let nextY = inNextCellY * UNIT_ROWS * TILE_SIZE + subY;
    if (dir === 'left') nextX = nextRoom.pixelW - 30;
    else if (dir === 'right') nextX = 30;
    else if (dir === 'up') nextY = nextRoom.pixelH - 48;
    else if (dir === 'down') nextY = 74;

    return { nextRoom, nextX, nextY };
  }

  public getAllRooms(realm: CastleRealm): BuiltRoom[] {
    return Array.from((realm === 'normal' ? this.normalRooms : this.invertedRooms).values());
  }

  public calcExplorationPct(visitedRoomKeys: string[]): number {
    let exploredCells = 0;
    const unique = new Set(visitedRoomKeys);
    for (const key of unique) {
      const [realm, id] = key.split(':') as [CastleRealm, string];
      const rm = (realm === 'inverted' ? this.invertedRooms : this.normalRooms).get(id);
      if (rm) exploredCells += rm.gridW * rm.gridH;
    }
    return Math.round((exploredCells / Math.max(1, this.totalNormalCells)) * 1000) / 10;
  }

  public createBossRushRoom(): BuiltRoom {
    const cols = UNIT_COLS;
    const rows = UNIT_ROWS;
    const tiles = createShellGrid(cols, rows);
    for (let c = 4; c <= 8; c++) tiles[7][c] = 2;
    for (let c = cols - 9; c <= cols - 5; c++) tiles[7][c] = 2;
    return {
      id: 'boss_rush_arena',
      name: '百鬼试炼 · 镇妖死斗坛',
      region: 'altar',
      realm: 'normal',
      mapX: 5,
      mapY: 3,
      gridW: 1,
      gridH: 1,
      cols,
      rows,
      pixelW: cols * TILE_SIZE,
      pixelH: rows * TILE_SIZE,
      special: 'boss_room',
      focalX: 11 * TILE_SIZE,
      focalY: 10 * TILE_SIZE,
      tiles,
      props: [
        { kind: 'palace_pillar', x: 4 * TILE_SIZE, y: 10 * TILE_SIZE },
        { kind: 'palace_pillar', x: 18 * TILE_SIZE, y: 10 * TILE_SIZE },
        { kind: 'silk_banner', x: 11 * TILE_SIZE, y: 2.5 * TILE_SIZE },
      ],
      lanterns: [{ x: 11 * TILE_SIZE, y: 3.8 * TILE_SIZE }],
      spawns: [],
      pickups: [],
      doors: { left: [], right: [], up: [], down: [] },
    };
  }
}

export const WorldMap = new CastleWorldRegistry();
