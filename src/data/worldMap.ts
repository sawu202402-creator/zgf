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
export const ROOM_COLS = 24; // 960px 宽
export const ROOM_ROWS = 14; // 560px 高

export type GateStyle =
  | 'none'
  | 'open'
  | 'high_ledge' // 需踏云步(二段跳)
  | 'cracked_floor' // 需千斤坠震碎
  | 'iron_gate' // 需缩地化雾穿过
  | 'miasma' // 剧毒瘴气墙(需缩地化雾)
  | 'wall_chimney'; // 需壁虎游墙功蹬墙跳

export interface BuiltRoom {
  id: string;
  name: string;
  region: RegionId;
  realm: CastleRealm;
  mapX: number;
  mapY: number;
  special: RoomSpecial;
  bossKind?: EnemyKind;
  storyTriggerId?: string;
  warpName?: string;
  tiles: TileKind[][]; // [row][col]
  lanterns: LanternAnchor[];
  spawns: RoomEnemySpawn[];
  pickups: RoomPickupSpawn[];
  doors: {
    left: GateStyle;
    right: GateStyle;
    up: GateStyle;
    down: GateStyle;
  };
}

interface RoomBlueprint {
  id: string;
  name: string;
  region: RegionId;
  mapX: number;
  mapY: number;
  special?: RoomSpecial;
  bossKind?: EnemyKind;
  storyTriggerId?: string;
  warpName?: string;
  doors: {
    left?: GateStyle;
    right?: GateStyle;
    up?: GateStyle;
    down?: GateStyle;
  };
  template:
    | 'flat_hall'
    | 'stepped_platforms'
    | 'high_jump_shaft'
    | 'lantern_abyss'
    | 'wall_jump_tower'
    | 'arena_boss'
    | 'sanctuary'
    | 'secret_alcove';
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

const BLUEPRINTS: RoomBlueprint[] = [
  // ================= 1. 瓮城残垣 (y=4, x=0..2) =================
  {
    id: 'gate_1',
    name: '玄城断桥 · 血月城门',
    region: 'gatehouse',
    mapX: 0,
    mapY: 4,
    storyTriggerId: 'intro_gate',
    doors: { right: 'open' },
    template: 'flat_hall',
    pickups: [{ id: 'pk_start_herb', kind: 'consumable', itemId: 'jinchuang_yao', gx: 18, gy: 11 }],
  },
  {
    id: 'gate_2',
    name: '护城苦竹长廊',
    region: 'gatehouse',
    mapX: 1,
    mapY: 4,
    doors: { left: 'open', right: 'open' },
    template: 'stepped_platforms',
    secretWallSide: 'left',
    spawns: [
      { kind: 'paper_swordsman', gx: 9, gy: 11 },
      { kind: 'lantern_ghost', gx: 15, gy: 7 },
      { kind: 'paper_swordsman', gx: 19, gy: 11 },
    ],
    pickups: [{ id: 'pk_gate_meat', kind: 'consumable', itemId: 'beggar_chicken', gx: 1, gy: 6 }],
  },
  {
    id: 'gate_3',
    name: '瓮城土地祠',
    region: 'gatehouse',
    mapX: 2,
    mapY: 4,
    special: 'save_shrine',
    doors: { left: 'open', right: 'open' },
    template: 'sanctuary',
  },

  // ================= 2. 前朝奉天殿 (y=4 x=3..5, y=3 x=3..4) =================
  {
    id: 'hall_1',
    name: '奉天殿前丹陛',
    region: 'main_hall',
    mapX: 3,
    mapY: 4,
    doors: { left: 'open', right: 'open', up: 'high_ledge' },
    template: 'high_jump_shaft',
    spawns: [
      { kind: 'paper_swordsman', gx: 8, gy: 11 },
      { kind: 'bronze_guard', gx: 16, gy: 11 },
    ],
  },
  {
    id: 'hall_2',
    name: '奉天正殿 · 太极枢机',
    region: 'main_hall',
    mapX: 4,
    mapY: 4,
    special: 'warp_bagua',
    warpName: '八卦阵 · 奉天正殿',
    doors: { left: 'open', right: 'open', down: 'cracked_floor' },
    template: 'flat_hall',
    spawns: [{ kind: 'lantern_ghost', gx: 6, gy: 6 }],
  },
  {
    id: 'hall_3',
    name: '东配殿武库廊',
    region: 'main_hall',
    mapX: 5,
    mapY: 4,
    doors: { left: 'open', right: 'open' },
    template: 'stepped_platforms',
    spawns: [
      { kind: 'bronze_guard', gx: 11, gy: 11 },
      { kind: 'paper_swordsman', gx: 18, gy: 8 },
    ],
    pickups: [{ id: 'pk_greatsword_1', kind: 'weapon', itemId: 'greatsword_1', gx: 12, gy: 5 }],
  },
  {
    id: 'hall_upper_1',
    name: '奉天殿飞檐斗拱',
    region: 'main_hall',
    mapX: 3,
    mapY: 3,
    doors: { down: 'high_ledge', left: 'open', right: 'iron_gate' },
    template: 'stepped_platforms',
    spawns: [
      { kind: 'lantern_ghost', gx: 8, gy: 6 },
      { kind: 'bronze_guard', gx: 16, gy: 11 },
    ],
    pickups: [{ id: 'pk_hp_up_1', kind: 'max_up', itemId: 'hp_vessel', gx: 19, gy: 5 }],
  },
  {
    id: 'hall_upper_2',
    name: '玄铁禁门暗廊',
    region: 'main_hall',
    mapX: 4,
    mapY: 3,
    doors: { left: 'iron_gate', right: 'open' },
    template: 'flat_hall',
    spawns: [
      { kind: 'opera_puppet', gx: 10, gy: 11 },
      { kind: 'opera_puppet', gx: 17, gy: 11 },
    ],
  },

  // ================= 3. 万卷藏书阁 (y=4 x=6..8, y=1 x=6) =================
  {
    id: 'lib_1',
    name: '万卷藏书阁 · 观星席',
    region: 'library',
    mapX: 6,
    mapY: 4,
    special: 'npc_su_qingyan',
    storyTriggerId: 'meet_library_su',
    doors: { left: 'open', right: 'open' },
    template: 'sanctuary',
  },
  {
    id: 'lib_2',
    name: '汗青竹简迷廊',
    region: 'library',
    mapX: 7,
    mapY: 4,
    doors: { left: 'open', right: 'open' },
    template: 'stepped_platforms',
    secretWallSide: 'right',
    spawns: [
      { kind: 'scroll_demon', gx: 8, gy: 6 },
      { kind: 'paper_swordsman', gx: 13, gy: 11 },
      { kind: 'scroll_demon', gx: 18, gy: 5 },
    ],
    pickups: [{ id: 'pk_spear_1', kind: 'weapon', itemId: 'spear_1', gx: 11, gy: 5 }],
  },
  {
    id: 'lib_boss',
    name: '藏书墨池斋',
    region: 'library',
    mapX: 8,
    mapY: 4,
    special: 'boss_room',
    bossKind: 'boss_scroll_king',
    doors: { left: 'open' },
    template: 'arena_boss',
  },
  {
    id: 'lib_forbidden',
    name: '藏书阁 · 绝顶禁书室',
    region: 'library',
    mapX: 6,
    mapY: 1,
    special: 'relic_pedestal',
    doors: { right: 'open' },
    template: 'secret_alcove',
    pickups: [
      { id: 'pk_mirror_truth', kind: 'ability', itemId: 'mirror_truth', gx: 7, gy: 11 },
      { id: 'pk_scroll_soulsteal', kind: 'skill_scroll', itemId: 'jiuyou_soulsteal', gx: 13, gy: 8 },
    ],
  },

  // ================= 4. 赤火铸剑坊 (y=3 x=0..2, y=2 x=0) =================
  {
    id: 'forge_1',
    name: '赤火烘炉长廊',
    region: 'forge',
    mapX: 2,
    mapY: 3,
    doors: { right: 'open', left: 'open' },
    template: 'stepped_platforms',
    spawns: [
      { kind: 'bronze_guard', gx: 9, gy: 11 },
      { kind: 'lantern_ghost', gx: 15, gy: 6 },
    ],
  },
  {
    id: 'forge_smith',
    name: '欧冶神匠铸剑庐',
    region: 'forge',
    mapX: 1,
    mapY: 3,
    special: 'npc_smith',
    doors: { right: 'open', left: 'open' },
    template: 'sanctuary',
    pickups: [{ id: 'pk_sub_fire', kind: 'weapon', itemId: 'sub:holy_fire', gx: 6, gy: 11 }],
  },
  {
    id: 'forge_2',
    name: '地肺火脉祠堂',
    region: 'forge',
    mapX: 0,
    mapY: 3,
    special: 'save_shrine',
    doors: { right: 'open', up: 'high_ledge' },
    template: 'high_jump_shaft',
  },
  {
    id: 'forge_boss',
    name: '赤铜镇火熔坛',
    region: 'forge',
    mapX: 0,
    mapY: 2,
    special: 'boss_room',
    bossKind: 'boss_furnace_titan',
    doors: { down: 'high_ledge' },
    template: 'arena_boss',
  },

  // ================= 5. 九曲幽冥水牢 (y=5 x=3..5, y=6 x=1..4) =================
  {
    id: 'prison_1',
    name: '九曲阴水道天井',
    region: 'prison',
    mapX: 4,
    mapY: 5,
    doors: { up: 'cracked_floor', left: 'open', right: 'open' },
    template: 'stepped_platforms',
    spawns: [
      { kind: 'plague_toad', gx: 8, gy: 11 },
      { kind: 'plague_toad', gx: 17, gy: 11 },
    ],
  },
  {
    id: 'prison_east',
    name: '沉船古渡暗河',
    region: 'prison',
    mapX: 5,
    mapY: 5,
    doors: { left: 'open' },
    template: 'secret_alcove',
    secretWallSide: 'right',
    spawns: [
      { kind: 'plague_toad', gx: 10, gy: 11 },
      { kind: 'lantern_ghost', gx: 15, gy: 6 },
    ],
    pickups: [
      { id: 'pk_daggers_1', kind: 'weapon', itemId: 'daggers_1', gx: 18, gy: 11 },
      { id: 'pk_mp_up_1', kind: 'max_up', itemId: 'mp_vessel', gx: 22, gy: 6 },
    ],
  },
  {
    id: 'prison_save',
    name: '水牢镇魂灯祠',
    region: 'prison',
    mapX: 3,
    mapY: 5,
    special: 'save_shrine',
    doors: { right: 'open', down: 'open' },
    template: 'sanctuary',
  },
  {
    id: 'prison_2',
    name: '寒铁锁龙囚廊',
    region: 'prison',
    mapX: 3,
    mapY: 6,
    doors: { up: 'open', left: 'open', right: 'open' },
    template: 'stepped_platforms',
    spawns: [
      { kind: 'bronze_guard', gx: 8, gy: 11 },
      { kind: 'plague_toad', gx: 16, gy: 11 },
    ],
  },
  {
    id: 'prison_warp',
    name: '幽冥八卦传送阵',
    region: 'prison',
    mapX: 4,
    mapY: 6,
    special: 'warp_bagua',
    warpName: '八卦阵 · 幽冥水牢',
    doors: { left: 'open' },
    template: 'sanctuary',
  },
  {
    id: 'prison_boss',
    name: '断水问剑寒潭',
    region: 'prison',
    mapX: 2,
    mapY: 6,
    special: 'boss_room',
    bossKind: 'boss_xiao_duanshui',
    storyTriggerId: 'boss_xiao_pre',
    doors: { right: 'open', left: 'miasma' },
    template: 'arena_boss',
  },
  {
    id: 'prison_relic',
    name: '九幽玄鸟秘窟',
    region: 'prison',
    mapX: 1,
    mapY: 6,
    special: 'relic_pedestal',
    doors: { right: 'miasma' },
    template: 'secret_alcove',
    pickups: [
      { id: 'pk_jade_full', kind: 'ability', itemId: 'jade_pendant_full', gx: 7, gy: 11 },
      { id: 'pk_sub_bagua', kind: 'weapon', itemId: 'sub:bagua_cross', gx: 14, gy: 8 },
    ],
  },

  // ================= 6. 百戏梨园鬼市 (y=3 x=5, y=2 x=4..6) =================
  {
    id: 'opera_market',
    name: '子夜百鬼灯市',
    region: 'opera',
    mapX: 5,
    mapY: 3,
    special: 'npc_merchant',
    doors: { left: 'open', up: 'high_ledge' },
    template: 'high_jump_shaft',
    pickups: [{ id: 'pk_whip_1', kind: 'weapon', itemId: 'whip_1', gx: 18, gy: 11 }],
  },
  {
    id: 'opera_1',
    name: '百戏悬空梨园',
    region: 'opera',
    mapX: 5,
    mapY: 2,
    doors: { down: 'high_ledge', left: 'open', right: 'open' },
    template: 'stepped_platforms',
    spawns: [
      { kind: 'opera_puppet', gx: 8, gy: 11 },
      { kind: 'scroll_demon', gx: 13, gy: 6 },
      { kind: 'opera_puppet', gx: 18, gy: 8 },
    ],
  },
  {
    id: 'opera_boss',
    name: '惊梦傩面戏台',
    region: 'opera',
    mapX: 4,
    mapY: 2,
    special: 'boss_room',
    bossKind: 'boss_opera_god',
    doors: { right: 'open' },
    template: 'arena_boss',
  },
  {
    id: 'chasm_bridge',
    name: '千灯万丈冥渊',
    region: 'opera',
    mapX: 6,
    mapY: 2,
    doors: { left: 'open', right: 'open' },
    template: 'lantern_abyss',
    spawns: [
      { kind: 'bell_gargoyle', gx: 10, gy: 5 },
      { kind: 'bell_gargoyle', gx: 16, gy: 5 },
    ],
  },

  // ================= 7. 百丈晨钟暮鼓楼 (y=2 x=7, y=1 x=7..8) =================
  {
    id: 'tower_1',
    name: '晨钟楼 · 八卦枢机',
    region: 'clock_tower',
    mapX: 7,
    mapY: 2,
    special: 'warp_bagua',
    warpName: '八卦阵 · 晨钟暮鼓楼',
    doors: { left: 'open', up: 'high_ledge' },
    template: 'high_jump_shaft',
    pickups: [{ id: 'pk_sub_seal', kind: 'weapon', itemId: 'sub:mountain_seal', gx: 18, gy: 11 }],
  },
  {
    id: 'tower_2',
    name: '百丈悬钟蹬云井',
    region: 'clock_tower',
    mapX: 7,
    mapY: 1,
    doors: { down: 'high_ledge', right: 'open', left: 'wall_chimney', up: 'wall_chimney' },
    template: 'wall_jump_tower',
    spawns: [
      { kind: 'bell_gargoyle', gx: 7, gy: 8 },
      { kind: 'bell_gargoyle', gx: 16, gy: 5 },
    ],
  },
  {
    id: 'tower_boss',
    name: '暮鼓雷音金顶',
    region: 'clock_tower',
    mapX: 8,
    mapY: 1,
    special: 'boss_room',
    bossKind: 'boss_thunder_yaksha',
    doors: { left: 'open' },
    template: 'arena_boss',
  },

  // ================= 8. 凌霄祭天坛 (y=0 x=6..7) =================
  {
    id: 'altar_save',
    name: '南天登仙镇魂祠',
    region: 'altar',
    mapX: 7,
    mapY: 0,
    special: 'save_shrine',
    doors: { down: 'wall_chimney', left: 'open' },
    template: 'sanctuary',
    pickups: [{ id: 'pk_wine_altar', kind: 'consumable', itemId: 'osmanthus_wine', gx: 18, gy: 11 }],
  },
  {
    id: 'altar_boss',
    name: '凌霄血月祭天坛',
    region: 'altar',
    mapX: 6,
    mapY: 0,
    special: 'boss_room',
    bossKind: 'boss_pei_wuji',
    doors: { right: 'open' },
    template: 'arena_boss',
  },
];

function createEmptyGrid(): TileKind[][] {
  const g: TileKind[][] = [];
  for (let r = 0; r < ROOM_ROWS; r++) {
    const row: TileKind[] = [];
    for (let c = 0; c < ROOM_COLS; c++) {
      if (r === 0 || r >= ROOM_ROWS - 2 || c === 0 || c === ROOM_COLS - 1) {
        row.push(1);
      } else {
        row.push(0);
      }
    }
    g.push(row);
  }
  return g;
}

function applyTemplate(
  g: TileKind[][],
  bp: RoomBlueprint
): { lanterns: LanternAnchor[] } {
  const lanterns: LanternAnchor[] = [];

  if (bp.template === 'stepped_platforms') {
    for (let c = 5; c <= 9; c++) g[9][c] = 2;
    for (let c = 14; c <= 19; c++) g[9][c] = 2;
    for (let c = 9; c <= 14; c++) g[6][c] = 2;
  } else if (bp.template === 'high_jump_shaft') {
    // 普通单跳够不到的高檐（必须踏云步二段跳才能跃上第7行高台）
    for (let c = 8; c <= 15; c++) g[7][c] = 2;
    for (let c = 9; c <= 14; c++) g[3][c] = 2;
  } else if (bp.template === 'lantern_abyss') {
    // 底部大深渊地刺 + 悬空红灯笼钩锁点！
    for (let c = 5; c <= 18; c++) {
      g[12][c] = 0;
      g[13][c] = 7; // 熔岩/冥渊陷阱
    }
    lanterns.push(
      { x: 7.5 * TILE_SIZE, y: 5.2 * TILE_SIZE },
      { x: 12.0 * TILE_SIZE, y: 4.6 * TILE_SIZE },
      { x: 16.5 * TILE_SIZE, y: 5.2 * TILE_SIZE }
    );
  } else if (bp.template === 'wall_jump_tower') {
    // 两侧垂直蹬墙石壁竖井（需壁虎游墙功连跳攀登！）
    for (let r = 2; r <= 9; r++) {
      g[r][8] = 1;
      g[r][15] = 1;
    }
    for (let c = 2; c <= 7; c++) g[5][c] = 2;
    for (let c = 10; c <= 13; c++) g[10][c] = 2;
  } else if (bp.template === 'arena_boss') {
    for (let c = 4; c <= 7; c++) g[8][c] = 2;
    for (let c = 16; c <= 19; c++) g[8][c] = 2;
    lanterns.push({ x: 12 * TILE_SIZE, y: 4.2 * TILE_SIZE });
  } else if (bp.template === 'secret_alcove') {
    for (let c = 5; c <= 10; c++) g[9][c] = 2;
    for (let c = 12; c <= 17; c++) g[7][c] = 2;
  }

  // 雕开四向门洞与能力锁障碍
  const leftGate = bp.doors.left || 'none';
  const rightGate = bp.doors.right || 'none';
  const upGate = bp.doors.up || 'none';
  const downGate = bp.doors.down || 'none';

  if (leftGate !== 'none') {
    const doorRows = leftGate === 'wall_chimney' ? [2, 3, 4, 5] : [8, 9, 10, 11];
    for (const r of doorRows) {
      g[r][0] = 0;
      if (leftGate === 'iron_gate') g[r][2] = 4;
      if (leftGate === 'miasma') g[r][2] = 5;
    }
    if (leftGate === 'wall_chimney') {
      g[6][0] = 1;
      g[6][1] = 1;
    }
  }

  if (rightGate !== 'none') {
    const doorRows = rightGate === 'wall_chimney' ? [2, 3, 4, 5] : [8, 9, 10, 11];
    for (const r of doorRows) {
      g[r][ROOM_COLS - 1] = 0;
      if (rightGate === 'iron_gate') g[r][ROOM_COLS - 3] = 4;
      if (rightGate === 'miasma') g[r][ROOM_COLS - 3] = 5;
    }
  }

  if (upGate !== 'none') {
    for (let c = 10; c <= 13; c++) {
      g[0][c] = 0;
      if (upGate === 'cracked_floor') {
        // 从下层往上看顶部裂砖已打通或待上层震碎
        g[1][c] = 0;
      }
    }
    // 保证可落脚跳入上出口
    for (let c = 9; c <= 14; c++) {
      if (g[3][c] === 0) g[3][c] = 2;
    }
  }

  if (downGate !== 'none') {
    for (let c = 10; c <= 13; c++) {
      if (downGate === 'cracked_floor') {
        g[ROOM_ROWS - 2][c] = 3; // 裂纹青石地砖，需千斤坠震碎！
        g[ROOM_ROWS - 1][c] = 0;
      } else {
        g[ROOM_ROWS - 2][c] = 2; // 单向木板，按 ↓+跳 顺滑下穿进入下层房间！
        g[ROOM_ROWS - 1][c] = 0;
      }
    }
  }

  // 隐藏可击碎肉墙/宝墙
  if (bp.secretWallSide === 'left') {
    g[5][1] = 6;
    g[6][1] = 6;
    g[7][2] = 2;
    g[7][3] = 2;
  } else if (bp.secretWallSide === 'right') {
    g[5][ROOM_COLS - 2] = 6;
    g[6][ROOM_COLS - 2] = 6;
    g[7][ROOM_COLS - 3] = 2;
    g[7][ROOM_COLS - 4] = 2;
  }

  return { lanterns };
}

function invertGate(g: GateStyle | undefined): GateStyle {
  return g || 'none';
}

function buildSingleRoom(bp: RoomBlueprint, realm: CastleRealm): BuiltRoom {
  const baseTiles = createEmptyGrid();
  const { lanterns } = applyTemplate(baseTiles, bp);

  if (realm === 'normal') {
    return {
      id: bp.id,
      name: bp.name,
      region: bp.region,
      realm: 'normal',
      mapX: bp.mapX,
      mapY: bp.mapY,
      special: bp.special || 'none',
      bossKind: bp.bossKind,
      storyTriggerId: bp.storyTriggerId,
      warpName: bp.warpName,
      tiles: baseTiles,
      lanterns,
      spawns: bp.spawns ? bp.spawns.map((s) => ({ ...s })) : [],
      pickups: bp.pickups ? bp.pickups.map((p) => ({ ...p })) : [],
      doors: {
        left: invertGate(bp.doors.left),
        right: invertGate(bp.doors.right),
        up: invertGate(bp.doors.up),
        down: invertGate(bp.doors.down),
      },
    };
  }

  // ================= 180° 翻转生成【九幽倒悬里城】！ =================
  const invMapX = 8 - bp.mapX;
  const invMapY = 6 - bp.mapY;

  const invTiles: TileKind[][] = [];
  for (let r = 0; r < ROOM_ROWS; r++) {
    const srcR = ROOM_ROWS - 1 - r;
    const row: TileKind[] = [];
    for (let c = 0; c < ROOM_COLS; c++) {
      const srcC = ROOM_COLS - 1 - c;
      let t = baseTiles[srcR][srcC];
      // 倒悬城底面若原本是天花板薄墙(r=13对应srcR=0)，补齐地面厚度(r=12)保证门洞行(8..11)完美对齐！
      if (t === 3) t = 2; // 里城已破封，裂砖化为可下穿灵台
      row.push(t);
    }
    invTiles.push(row);
  }

  // 对齐倒悬城地面高度(第12行作为标准地板)与左右门洞(8..11行)
  const leftGate = invertGate(bp.doors.right);
  const rightGate = invertGate(bp.doors.left);
  const upGate = invertGate(bp.doors.down);
  const downGate = invertGate(bp.doors.up);

  for (let c = 1; c < ROOM_COLS - 1; c++) {
    const isDownHole = downGate !== 'none' && c >= 10 && c <= 13;
    if (!isDownHole && invTiles[12][c] === 0 && invTiles[13][c] !== 7) {
      invTiles[12][c] = 1;
    }
    // 确保倒悬城内中段有充足木踏板供落脚连战
    if (c >= 6 && c <= 17 && c % 4 !== 0 && invTiles[8][c] === 0) {
      invTiles[8][c] = 2;
    }
  }
  for (let r = 1; r <= 11; r++) {
    invTiles[r][0] = 1;
    invTiles[r][ROOM_COLS - 1] = 1;
  }
  if (leftGate !== 'none') {
    for (const r of [8, 9, 10, 11]) invTiles[r][0] = 0;
  }
  if (rightGate !== 'none') {
    for (const r of [8, 9, 10, 11]) invTiles[r][ROOM_COLS - 1] = 0;
  }
  if (upGate !== 'none') {
    for (let c = 10; c <= 13; c++) {
      invTiles[0][c] = 0;
      invTiles[1][c] = 0;
      invTiles[4][c] = 2;
    }
  }
  if (downGate !== 'none') {
    for (let c = 10; c <= 13; c++) {
      invTiles[12][c] = 2;
      invTiles[13][c] = 0;
    }
  }

  // 里城最终决战点设在倒悬城最深处（原瓮城起点 gate_1 翻转处！）
  let invSpecial: RoomSpecial = bp.special === 'boss_room' ? 'none' : bp.special || 'none';
  let invBoss: EnemyKind | undefined;
  const invPickups: RoomPickupSpawn[] = [];

  if (bp.id === 'gate_1') {
    invSpecial = 'boss_room';
    invBoss = 'boss_zhuyin';
  } else if (bp.id === 'lib_boss') {
    invPickups.push({ id: 'inv_pk_sword3', kind: 'weapon', itemId: 'sword_3', gx: 12, gy: 11 });
  } else if (bp.id === 'forge_boss') {
    invPickups.push({ id: 'inv_pk_gs3', kind: 'weapon', itemId: 'greatsword_3', gx: 12, gy: 11 });
  } else if (bp.id === 'opera_boss') {
    invPickups.push({ id: 'inv_pk_whip3', kind: 'weapon', itemId: 'whip_3', gx: 12, gy: 11 });
  } else if (bp.id === 'tower_boss') {
    invPickups.push({ id: 'inv_pk_spear3', kind: 'weapon', itemId: 'spear_3', gx: 12, gy: 11 });
  } else if (bp.id === 'prison_relic') {
    invPickups.push({
      id: 'inv_pk_robe',
      kind: 'armor',
      itemId: 'xuanniao_robe',
      gx: 12,
      gy: 11,
    });
  }

  // 里城精英百鬼编组
  const invSpawns: RoomEnemySpawn[] =
    invSpecial === 'save_shrine' || invSpecial === 'boss_room'
      ? []
      : [
          { kind: 'bell_gargoyle', gx: 8, gy: 6 },
          { kind: 'opera_puppet', gx: 15, gy: 11 },
        ];

  return {
    id: bp.id,
    name: `逆·${bp.name}`,
    region: bp.region,
    realm: 'inverted',
    mapX: invMapX,
    mapY: invMapY,
    special: invSpecial,
    bossKind: invBoss,
    warpName: bp.warpName ? `逆·${bp.warpName}` : undefined,
    tiles: invTiles,
    lanterns: lanterns.map((l) => ({
      x: ROOM_COLS * TILE_SIZE - l.x,
      y: Math.max(150, ROOM_ROWS * TILE_SIZE - l.y - 80),
    })),
    spawns: invSpawns,
    pickups: invPickups,
    doors: {
      left: leftGate,
      right: rightGate,
      up: upGate,
      down: downGate,
    },
  };
}

class CastleWorldRegistry {
  private normalRooms = new Map<string, BuiltRoom>();
  private invertedRooms = new Map<string, BuiltRoom>();
  private coordIndex = new Map<string, BuiltRoom>();

  constructor() {
    for (const bp of BLUEPRINTS) {
      const nr = buildSingleRoom(bp, 'normal');
      const ir = buildSingleRoom(bp, 'inverted');
      this.normalRooms.set(nr.id, nr);
      this.invertedRooms.set(ir.id, ir);
      this.coordIndex.set(`normal:${nr.mapX},${nr.mapY}`, nr);
      this.coordIndex.set(`inverted:${ir.mapX},${ir.mapY}`, ir);
    }
  }

  public getRoom(realm: CastleRealm, id: string): BuiltRoom {
    const map = realm === 'normal' ? this.normalRooms : this.invertedRooms;
    return map.get(id) || this.normalRooms.get('gate_1')!;
  }

  public getNeighbor(
    room: BuiltRoom,
    dir: 'left' | 'right' | 'up' | 'down'
  ): BuiltRoom | undefined {
    const dx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const dy = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
    return this.coordIndex.get(`${room.realm}:${room.mapX + dx},${room.mapY + dy}`);
  }

  public getAllRooms(realm: CastleRealm): BuiltRoom[] {
    return Array.from((realm === 'normal' ? this.normalRooms : this.invertedRooms).values());
  }

  public getNormalRoomCount(): number {
    return this.normalRooms.size;
  }

  public calcExplorationPct(visitedRoomKeys: string[]): number {
    // 表城32房 = 100.0%，表里双城共64房 = 200.0%！
    const base = this.normalRooms.size;
    const unique = new Set(visitedRoomKeys).size;
    return Math.round((unique / Math.max(1, base)) * 1000) / 10;
  }

  public createBossRushRoom(): BuiltRoom {
    const tiles = createEmptyGrid();
    for (let c = 4; c <= 7; c++) tiles[8][c] = 2;
    for (let c = 16; c <= 19; c++) tiles[8][c] = 2;
    return {
      id: 'boss_rush_arena',
      name: '百鬼试炼 · 镇妖死斗坛',
      region: 'altar',
      realm: 'normal',
      mapX: 4,
      mapY: 4,
      special: 'boss_room',
      tiles,
      lanterns: [{ x: 12 * TILE_SIZE, y: 4.3 * TILE_SIZE }],
      spawns: [],
      pickups: [],
      doors: { left: 'none', right: 'none', up: 'none', down: 'none' },
    };
  }
}

export const WorldMap = new CastleWorldRegistry();
