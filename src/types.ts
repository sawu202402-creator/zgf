export type GameMode = 'story' | 'xiaoduanshui' | 'boss_rush';
export type CastleRealm = 'normal' | 'inverted';

export type WeaponArchetype = 'sword' | 'greatsword' | 'spear' | 'daggers' | 'whip';

export type SubWeaponId =
  | 'dagger_throw'
  | 'holy_fire'
  | 'bagua_cross'
  | 'mountain_seal'
  | 'sword_orbit';

export type SkillId =
  | 'shuofeng_wave' // ↓↘→ + 攻: 朔风破空斩
  | 'shunying_flash' // ←→ + 攻: 瞬影一闪
  | 'jinghong_rising' // ↓↑ + 攻 / →↓↘ + 攻: 惊鸿升龙破
  | 'taiji_parry' // ↓↙← + 攻: 太极震气诀
  | 'jiuyou_soulsteal'; // ←↙↓↘→ + 攻: 九幽噬魂引

export type AbilityKey =
  | 'double_jump' // 踏云步：二段跳 + 凌空下踢(Dive Kick)
  | 'ground_slam' // 千斤坠：空中下砸震碎脆弱青石地砖
  | 'mist_dash' // 缩地化雾符：无敌雾化冲刺穿过铁栅栏与毒障
  | 'grapple_hook' // 飞燕钩锁：勾住高空红灯笼铜环摆荡飞跃
  | 'wall_jump' // 壁虎游墙功：垂直墙面蹬墙连跳
  | 'familiar_sword' // 青冥剑灵使魔：致敬月下夜想曲剑魔，随主升级自动御剑护主并勘破暗墙！
  | 'mirror_truth' // 破妄古镜：识破蚀心蛊幻象信物之一
  | 'jade_pendant_full'; // 完整玄鸟玉佩：识破幻象开启倒悬里城信物之二

export type RegionId =
  | 'gatehouse' // 1. 瓮城残垣
  | 'main_hall' // 2. 前朝奉天殿
  | 'library' // 3. 万卷藏书阁
  | 'forge' // 4. 赤火铸剑坊
  | 'prison' // 5. 九曲幽冥水牢
  | 'opera' // 6. 百戏梨园鬼市
  | 'clock_tower' // 7. 百丈晨钟暮鼓楼
  | 'altar'; // 8. 凌霄祭天坛

export type WeaponSpecialEffect =
  | 'frost_slow'
  | 'burn_dot'
  | 'blood_leech'
  | 'chain_lightning'
  | 'multi_phantom'
  | 'armor_sunder';

export interface WeaponDef {
  id: string;
  name: string;
  archetype: WeaponArchetype;
  tier: 1 | 2 | 3;
  atk: number;
  critBonus: number;
  windupMs: number;
  activeMs: number;
  recoveryMs: number;
  reachX: number;
  reachY: number;
  poiseDmg: number;
  color: string;
  glowColor: string;
  price: number;
  upgradeCost?: number;
  upgradeTo?: string;
  specialEffect?: WeaponSpecialEffect;
  lifestealBonus?: number;
  desc: string;
  traitDesc: string;
}

export interface SubWeaponDef {
  id: SubWeaponId;
  name: string;
  talismanCost: number;
  baseDmg: number;
  color: string;
  desc: string;
}

export interface ArmorDef {
  id: string;
  name: string;
  slot: 'armor' | 'accessory';
  def: number;
  hpBonus: number;
  mpBonus: number;
  strBonus: number;
  intBonus: number;
  lckBonus: number;
  price: number;
  lifestealBonus?: number;
  speedBonus?: number;
  mpOnHitBonus?: number;
  dropRateMult?: number;
  desc: string;
}

export interface YaoCoreDef {
  id: string;
  name: string;
  monsterName: string;
  color: string;
  desc: string;
  atkPct?: number;
  defPct?: number;
  mpRegenBonus?: number;
  lifestealRatio?: number;
  critPct?: number;
  speedPct?: number;
  subWeaponMult?: number;
  poisonOnHit?: boolean;
}

export type CombatBuffKind = 'berserk_wine' | 'iron_skin' | 'wind_crit';

export interface ConsumableDef {
  id: string;
  name: string;
  hpRestore: number;
  mpRestore: number;
  fullRestore?: boolean;
  buffKind?: CombatBuffKind;
  buffSec?: number;
  price: number;
  desc: string;
}

export interface SkillDef {
  id: SkillId;
  name: string;
  commandText: string;
  mpCost: number;
  dmgMult: number;
  color: string;
  desc: string;
}

export interface DialogueLine {
  speaker: string;
  role: string;
  portraitColor: string;
  text: string;
}

export interface StoryScene {
  id: string;
  title: string;
  lines: DialogueLine[];
  grantItem?: string;
  grantAbility?: AbilityKey;
}

export type TileKind =
  | 0 // 空
  | 1 // 实心古砖墙
  | 2 // 单向木阁楼平台 (可从下方跳上, ↓+跳 下落)
  | 3 // 脆弱裂纹青砖地 (需【千斤坠】震碎)
  | 4 // 玄铁栅栏门 (需【缩地化雾符】雾化穿过)
  | 5 // 剧毒九幽瘴气墙 (需【缩地化雾符】无伤穿过, 否则高额伤血击退)
  | 6 // 隐藏可击碎肉墙/密室砖 (武器攻击3次碎裂掉宝)
  | 7; // 地刺/熔岩陷阱

export interface LanternAnchor {
  x: number;
  y: number;
}

export type RoomSpecial =
  | 'none'
  | 'save_shrine' // 土地祠镇魂灯 (存档 + 回满状态)
  | 'warp_bagua' // 太极八卦传送阵
  | 'npc_smith' // 欧冶残铸剑坊
  | 'npc_merchant' // 白掌柜子夜鬼市
  | 'npc_su_qingyan' // 苏清晏剧情点
  | 'boss_room' // 区域守关妖王房
  | 'relic_pedestal'; // 秘宝祭坛

export type EnemyKind =
  | 'corpse_soldier' // 破土荒冢阴兵 (破土钻出、执残戟扑砍)
  | 'demon_wolf' // 玄甲镇狱苍狼 (瓮城凶兽、伏低蓄势极速飞扑撕咬)
  | 'blood_bat' // 血翼夜蝠妖 (梁下倒悬潜伏、俯冲掠袭)
  | 'bone_archer' // 白骨神臂弩卒 (前朝阴兵弩手、高低平射骨矢与后撤步)
  | 'paper_swordsman' // 剪纸刀客
  | 'lantern_ghost' // 提灯冥火鬼 (飞行)
  | 'bronze_guard' // 玄甲重盾傀儡 (正面举盾需重武器破盾或绕背)
  | 'scroll_demon' // 飞天书妖 (远程墨弹)
  | 'plague_toad' // 毒沼金蟾
  | 'opera_puppet' // 梨园提线木偶
  | 'bell_gargoyle' // 飞天夜叉
  | 'boss_scroll_king' // 藏书阁Boss: 画皮书妖·墨千秋 -> 踏云步(二段跳)
  | 'boss_furnace_titan' // 铸剑坊Boss: 赤铜熔炉巨灵 -> 千斤坠
  | 'boss_xiao_duanshui' // 水牢宿敌Boss: 镇妖少统领·萧断水 -> 缩地化雾符
  | 'boss_opera_god' // 梨园Boss: 提线傩面戏神 -> 飞燕钩锁
  | 'boss_thunder_yaksha' // 钟鼓楼Boss: 雷音金翅夜叉 -> 壁虎游墙功
  | 'boss_pei_wuji' // 祭天坛表城Boss: 堕魔魁首·裴无极 (+ 蚀心蛊)
  | 'boss_zhuyin'; // 倒悬里城真最终Boss: 九幽冥主·烛阴

export interface RoomEnemySpawn {
  kind: EnemyKind;
  gx: number;
  gy: number;
}

export interface RoomPickupSpawn {
  id: string; // 唯一拾取ID
  kind: 'weapon' | 'armor' | 'consumable' | 'ability' | 'skill_scroll' | 'max_up';
  itemId: string;
  gx: number;
  gy: number;
}

export interface RoomDef {
  id: string;
  name: string;
  region: RegionId;
  mapX: number; // 在恶魔城全局方格大地图上的网格X
  mapY: number; // 在恶魔城全局方格大地图上的网格Y
  gridW: number; // 房间宽度（几个标准屏宽，1=24格，2=48格）
  gridH: number; // 房间高度（几个标准屏高，1=14格，2=28格）
  special: RoomSpecial;
  bossKind?: EnemyKind;
  storyTriggerId?: string;
  warpName?: string;
  asciiLayout: string[]; // 字符画地形定义，支持自动翻转生成倒悬里城！
  spawns: RoomEnemySpawn[];
  pickups: RoomPickupSpawn[];
}

export interface SaveSlotData {
  slotIndex: number;
  updatedAt: number;
  mode: GameMode;
  heroName: string;
  level: number;
  exp: number;
  gold: number;
  talismanHearts: number;
  maxHpBonus: number;
  maxMpBonus: number;
  currentRoomId: string;
  currentRealm: CastleRealm;
  equippedWeapon: string;
  equippedSubWeapon: SubWeaponId;
  equippedArmor: string;
  equippedAccessory: string;
  equippedYaoCore: string;
  ownedWeapons: string[];
  ownedSubWeapons: SubWeaponId[];
  ownedArmors: string[];
  ownedYaoCores: string[];
  learnedSkills: SkillId[];
  abilities: AbilityKey[];
  consumables: Record<string, number>;
  weaponTemperLv?: Record<string, number>;
  bestiaryKills?: Record<string, number>;
  discoveredDrops?: string[];
  familiarExp?: number;
  invertedUnlocked?: boolean;
  visitedRooms: string[]; // 'normal:room_id' | 'inverted:room_id' | 'cell:normal:x,y' | 'cell:inverted:x,y'
  collectedPickups: string[];
  defeatedBosses: string[];
  triggeredStories: string[];
  readSteles?: string[];
  brokenSecretWalls: string[];
  playTimeSec: number;
}

export interface GlobalMetaUnlock {
  unlockedXiaoMode: boolean;
  unlockedBossRush: boolean;
  bestExplorationPct: number;
  bestBossRushSec: number | null;
  controlStyle: 'joystick' | 'dpad';
  sfxMuted: boolean;
  bgmMuted: boolean;
}
