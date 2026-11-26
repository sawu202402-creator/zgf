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

export type FamiliarId =
  | 'familiar_sword' // 青冥剑灵：御剑飞刺 + 勘破古墙暗格
  | 'familiar_phoenix' // 朱雀丹火灵：三昧真火追踪灼烧 + 融解寒髓冰障
  | 'familiar_tortoise' // 玄武镇岳灵：玄冥水幕减伤反震 + 镇压千斤水枢闸
  | 'familiar_kestrel' // 天机机关鸢：墨家破甲连珠雷矢 & 隔空摄物 + 拨动高墙天机铜锁
  | 'familiar_fox'; // 青丘玉灵狐：青丘甘霖回春聚气 + 勘破九幽幻障门

export type AbilityKey =
  | 'double_jump' // 踏云步：二段跳 + 凌空下踢(Dive Kick)
  | 'ground_slam' // 千斤坠：空中下砸震碎脆弱青石地砖
  | 'mist_dash' // 缩地化雾符：无敌雾化冲刺穿过铁栅栏与毒障
  | 'grapple_hook' // 飞燕钩锁：勾住高空红灯笼铜环摆荡飞跃
  | 'wall_jump' // 壁虎游墙功：垂直墙面蹬墙连跳
  | FamiliarId
  | 'mirror_truth' // 破妄古镜：识破蚀心蛊幻象信物之一
  | 'jade_pendant_full'; // 完整玄鸟玉佩：识破幻象开启倒悬里城信物之二

export type RegionId =
  | 'gatehouse' // 第一幕：苦竹瓮城 · 护城防线
  | 'main_hall' // 第二幕：奉天盘龙殿 · 皇城中枢
  | 'alchemy' // 第三幕：钦天炼丹司 · 试剑堂
  | 'colosseum' // 第四幕：神武演武校场 · 钦天百步梯
  | 'forge' // 第五幕：赤火铸剑坊 · 地肺古矿脉
  | 'prison' // 第六幕：九曲寒潭 · 镇水地宫
  | 'shipyard' // 第七幕：归墟艨艟船坞 · 沉船古渡
  | 'catacomb' // 第八幕：九幽荒冢 · 守陵帝陵
  | 'nether' // 第九幕：九幽忘川极渊 · 太古祖龙陵
  | 'library' // 第十幕：万卷藏书阁 · 翰林书院
  | 'opera' // 第十一幕：百戏梨园 · 镇魂戏楼
  | 'clock_tower' // 第十二幕：东垣望月塔 · 镇海外壁
  | 'altar'; // 终幕：凌霄祭天坛 · 九幽天顶

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
  tier: 1 | 2 | 3 | 4;
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
  smithExclusive?: boolean;
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
  warpTalisman?: boolean;
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
  | 'corpse_soldier' // 破土荒冢阴兵
  | 'demon_wolf' // 玄甲镇狱苍狼
  | 'spirit_crow' // 玄冥三足阴鸦
  | 'bone_archer' // 白骨神臂弩卒
  | 'paper_swordsman' // 剪纸刀客
  | 'lantern_ghost' // 提灯冥火鬼 (飞行)
  | 'bronze_guard' // 玄甲重盾傀儡 (正面举盾需重武器破盾或绕背)
  | 'scroll_demon' // 飞天书妖 (远程墨弹)
  | 'plague_toad' // 毒沼金蟾
  | 'opera_puppet' // 梨园提线木偶
  | 'bell_gargoyle' // 飞天夜叉
  | 'shenji_musketeer' // 神机营三眼火铳兵（演武校场/外壁远程火器）
  | 'jinwu_mace_guard' // 金吾铁锤力士（演武校场/铸剑坊重锤精兵）
  | 'guixu_water_fiend' // 归墟巡海夜叉（沉船坞/寒潭水妖）
  | 'armored_tortoise' // 玄甲覆海妖龟（沉船坞/极渊正甲霸体妖兽）
  | 'wuchang_reaper' // 勾魂白无常（荒冢/九幽忘川索魂阴差）
  | 'bixie_stone_beast' // 镇陵辟邪石兽（帝陵/太古龙陵活化石兽）
  | 'alchemy_homunculus' // 丹鼎朱砂药傀（钦天炼丹司/铸剑坊药罐妖傀）
  | 'taoist_talisman_priest' // 镇魔符箓妖道（炼丹司/盘龙殿/祭天坛腐化符道）
  | 'magma_crucible_golem' // 地肺熔金巨傀（赤火铸剑坊/极渊熔岩铸鼎重甲）
  | 'mine_pickaxe_ghoul' // 古矿赤铜矿奴（古矿脉/荒冢/寒潭阴魂矿鬼）
  | 'frost_chain_jailer' // 寒潭玄铁狱卒（九曲寒潭/归墟船坞链槌狱卒）
  | 'drowned_corpse_bride' // 寒渊沉尸怨灵（九曲寒潭/归墟/忘川浮空怨灵）
  | 'opera_sleeve_siren' // 百戏水袖花旦（百戏梨园/藏书阁魅音水袖花旦）
  | 'ink_brush_scholar' // 翰林执笔书魔（万卷藏书阁/百戏梨园巨笔书魔）
  | 'clockwork_mantis' // 墨家青铜螳螂（望月塔/神武校场机括螳螂）
  | 'bronze_gear_wisp' // 浑天铜轮机灵（望月塔/祭天坛悬浮浑天仪灵）
  | 'terracotta_halberdier' // 皇陵秦俑戟将（九幽荒冢/太古龙陵/神武重戟秦俑）
  | 'celestial_sentinel' // 凌霄金甲天将（凌霄祭天坛/忘川堕落金甲天兵）
  | 'boss_colosseum_general' // 演武校场Boss: 镇武大将军·拓跋烈
  | 'boss_shipyard_leviathan' // 沉船古渡Boss: 归墟镇海蛟王·敖溟
  | 'boss_dragon_warden' // 太古龙陵Boss: 守陵太古战魄·刑天
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
  weaponUpgrades?: Record<string, number>;
  ownedSubWeapons: SubWeaponId[];
  ownedArmors: string[];
  ownedYaoCores: string[];
  learnedSkills: SkillId[];
  abilities: AbilityKey[];
  consumables: Record<string, number>;
  bestiaryKills?: Record<string, number>;
  discoveredDrops?: string[];
  familiarExp?: number;
  equippedFamiliar?: FamiliarId;
  familiarExps?: Partial<Record<FamiliarId, number>>;
  invertedUnlocked?: boolean;
  mapLayoutVersion?: number;
  visitedRooms: string[]; // 'normal:room_id' | 'inverted:room_id' | 'cell:normal:x,y' | 'cell:inverted:x,y'
  collectedPickups: string[];
  defeatedBosses: string[];
  triggeredStories: string[];
  readSteles?: string[];
  mapPins?: string[];
  brokenSecretWalls: string[];
  noHitBosses?: string[];
  claimedBounties?: string[];
  playTimeSec: number;
}

export interface GlobalMetaUnlock {
  unlockedXiaoMode: boolean;
  unlockedBossRush: boolean;
  bestExplorationPct: number;
  bestBossRushSec: number | null;
  controlStyle: 'joystick' | 'dpad';
  padScale?: number;
  lastActiveSlot?: number;
  mapColorMode?: 'classic' | 'region';
  sfxMuted: boolean;
  bgmMuted: boolean;
}
