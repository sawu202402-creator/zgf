import { ALL_FAMILIAR_IDS, FAMILIARS, WEAPONS } from '../data/itemsAndSkills';
import { SceneNpc } from '../data/worldMap';
import { EnemyKind, FamiliarId, WeaponArchetype, WeaponDef } from '../types';
import {
  AssetKey,
  Assets,
  resolveFamiliarAssetKey,
  resolveWeaponAssetKey,
} from './AssetLoader';
import { ActiveSkillAnim, ActiveSlash, EnemyEntity, GameEngine, WorldDrop } from './GameEngine';
import {
  drawCelShadedWeapon,
  drawPaintedChainTrack,
  drawPaintedThunderBolt,
  drawPaintedVfxDisc,
  drawPaintedVfxSprite,
  drawSoftGroundShadow,
} from './GuofengWorldArt';
import {
  buildEntitySpineJoints,
  drawSkinnedSpineSprite,
  HeroSpine,
  SpineJointRow,
  StageHeroSpine,
  transformSpinePoint,
} from './SpineRig';

const ENEMY_METRICS = {
  canvasW: 360,
  canvasH: 270,
  anchorX: 165,
  footY: 256,
} as const;

function selectEnemySpriteFrame(e: EnemyEntity, t: number): AssetKey {
  const kind = e.profile.kind;
  const isMoving = Math.abs(e.vx) > 12 && e.aiState === 'stalk';

  if (kind === 'boss_xiao_duanshui') {
    if (e.aiState === 'windup') return 'boss_xiao_1';
    if (e.aiState === 'lunge_slash') return 'boss_xiao_2';
    return 'boss_xiao_0';
  }

  if (kind === 'boss_furnace_titan') {
    if (e.aiState === 'windup' || e.aiState === 'lunge_slash') return 'boss_ft_1';
    return 'boss_ft_0';
  }

  if (kind === 'boss_opera_god') {
    if (e.aiState === 'windup' || e.aiState === 'lunge_slash') return 'boss_op_1';
    return 'boss_op_0';
  }

  if (kind === 'boss_pei_wuji') {
    if (e.aiState === 'windup') return 'boss_pei_1';
    if (e.aiState === 'lunge_slash') return 'boss_pei_2';
    return 'boss_pei_0';
  }

  if (kind === 'boss_zhuyin') {
    if (e.aiState === 'windup') return 'boss_zhuyin_1';
    if (e.aiState === 'lunge_slash') return 'boss_zhuyin_2';
    return 'boss_zhuyin_0';
  }

  if (kind === 'boss_thunder_yaksha') {
    if (e.aiState === 'windup') return 'boss_yk_1';
    if (e.aiState === 'lunge_slash') return 'boss_yk_2';
    return 'boss_yk_0';
  }

  if (kind === 'boss_colosseum_general') {
    if (e.aiState === 'windup' || e.aiState === 'lunge_slash') return 'boss_gen_1';
    return 'boss_gen_0';
  }

  if (kind === 'boss_shipyard_leviathan') {
    if (e.aiState === 'windup' || e.aiState === 'lunge_slash') return 'boss_lev_1';
    return 'boss_lev_0';
  }

  if (kind === 'boss_dragon_warden') {
    if (e.aiState === 'windup' || e.aiState === 'lunge_slash') return 'boss_wdn_1';
    return 'boss_wdn_0';
  }

  if (kind === 'boss_scroll_king' || e.profile.isBoss) {
    if (e.aiState === 'windup') return 'boss_ik_1';
    if (e.aiState === 'lunge_slash') return 'boss_ik_2';
    return 'boss_ik_0';
  }

  if (kind === 'scroll_demon') return 'mob_book';
  if (kind === 'plague_toad') return 'mob_toad';
  if (kind === 'opera_puppet') return 'mob_puppet';
  if (kind === 'bell_gargoyle') return 'mob_gargoyle';
  if (kind === 'corpse_soldier') return 'mob_zombie';
  if (kind === 'demon_wolf') return 'mob_warg';
  if (kind === 'spirit_crow') return 'mob_crow';
  if (kind === 'bone_archer') return 'mob_bone_archer';
  if (kind === 'shenji_musketeer') return 'mob_musketeer';
  if (kind === 'jinwu_mace_guard') return 'mob_mace_guard';
  if (kind === 'guixu_water_fiend') return 'mob_water_fiend';
  if (kind === 'armored_tortoise') return 'mob_tortoise';
  if (kind === 'wuchang_reaper') return 'mob_wuchang';
  if (kind === 'bixie_stone_beast') return 'mob_bixie';
  if (kind === 'alchemy_homunculus') return 'mob_homunculus';
  if (kind === 'taoist_talisman_priest') return 'mob_taoist_priest';
  if (kind === 'magma_crucible_golem') return 'mob_magma_golem';
  if (kind === 'mine_pickaxe_ghoul') return 'mob_mine_ghoul';
  if (kind === 'frost_chain_jailer') return 'mob_frost_jailer';
  if (kind === 'drowned_corpse_bride') return 'mob_corpse_bride';
  if (kind === 'opera_sleeve_siren') return 'mob_opera_siren';
  if (kind === 'ink_brush_scholar') return 'mob_ink_scholar';
  if (kind === 'clockwork_mantis') return 'mob_clock_mantis';
  if (kind === 'bronze_gear_wisp') return 'mob_gear_wisp';
  if (kind === 'terracotta_halberdier') return 'mob_terracotta_general';
  if (kind === 'celestial_sentinel') return 'mob_celestial_sentinel';

  if (kind === 'bronze_guard') {
    if (e.aiState === 'windup') return 'mob_gd_2';
    if (e.aiState === 'lunge_slash') return 'mob_gd_3';
    if (isMoving) {
      return Math.floor(Math.abs(e.animPhase) * 0.65) % 2 === 0 ? 'mob_gd_0' : 'mob_gd_1';
    }
    return 'mob_gd_0';
  }

  if (kind === 'lantern_ghost' || e.profile.flying) {
    if (e.aiState === 'windup' || e.aiState === 'lunge_slash') return 'mob_wr_2';
    return Math.floor(t * 2.6 + e.id) % 2 === 0 ? 'mob_wr_0' : 'mob_wr_1';
  }

  // 默认近战刀客 (paper_swordsman / opera_puppet / plague_toad) 4帧真实步态与双手举刀/劈斩序列！
  if (e.aiState === 'windup') return 'mob_sw_2';
  if (e.aiState === 'lunge_slash') return 'mob_sw_3';
  if (isMoving) {
    return Math.floor(Math.abs(e.animPhase) * 0.7) % 2 === 0 ? 'mob_sw_0' : 'mob_sw_1';
  }
  return 'mob_sw_0';
}

/**
 * 18岁少年李逸承 14帧纯手绘逐帧序列图基准锚点（与 slice_hero_sheets.py 严格锁定一致！）
 * 每张规范化序列帧尺寸为 340x256，躯干中轴 ANCHOR_X=132，双靴接地线 FOOT_Y=244，头顶至靴底高 180px。
 */
export const HERO_SPRITE_METRICS = {
  canvasW: 340,
  canvasH: 256,
  anchorX: 132,
  footY: 244,
  baseScale: 0.54, // 局内少年身高约 97px（修长七头身，五官衣纹清晰锐利）
} as const;

const RUN_CYCLE_FRAMES: AssetKey[] = ['h18_run_0', 'h18_run_1', 'h18_run_2', 'h18_run_3'];

export interface HeroRenderState {
  x: number;
  y: number;
  facing: 1 | -1;
  vx: number;
  vy: number;
  onGround: boolean;
  runCycle: number;
  animTime: number;
  landSquash: number;
  doubleJumpSpin: number;
  equippedWeaponId: string;
  secondaryWeaponId?: string;
  slash: ActiveSlash | null;
  skillAnim?: ActiveSkillAnim | null;
  scale?: number;
  isXiaoMode?: boolean;
  crouching?: boolean;
  sliding?: boolean;
  diveKicking?: boolean;
  hurtRecoil?: number;
}

export function selectHeroSpriteFrame(opts: {
  vx: number;
  vy: number;
  onGround: boolean;
  runCycle: number;
  animTime: number;
  isHeavy: boolean;
  weaponId?: string;
  archetype?: WeaponArchetype;
  slash: ActiveSlash | null;
  skillAnim?: ActiveSkillAnim | null;
  isXiaoMode?: boolean;
  crouching?: boolean;
  sliding?: boolean;
  diveKicking?: boolean;
  hurtRecoil?: number;
}): AssetKey {
  const {
    vx,
    vy,
    onGround,
    runCycle,
    animTime,
    isHeavy,
    weaponId,
    slash,
    skillAnim,
    isXiaoMode,
    crouching,
    sliding,
    diveKicking,
  } = opts;

  if (isXiaoMode) {
    if (skillAnim || slash || sliding || diveKicking) {
      const pr = skillAnim ? skillAnim.progress : slash ? slash.progress : 0.5;
      return pr < 0.25 ? 'boss_xiao_1' : 'boss_xiao_2';
    }
    return Math.abs(vx) > 30 && Math.floor(runCycle * 0.6) % 2 === 1
      ? 'boss_xiao_1'
      : 'boss_xiao_0';
  }

  // 0A. 五大真气绝学与奇门副器专属无兵手绘武道身姿！
  if (skillAnim) {
    const sp = skillAnim.progress;
    if (skillAnim.kind === 'shuofeng_wave') {
      if (isHeavy) return sp < 0.28 ? 'h18_heavy_windup' : 'h18_heavy_cleave';
      return sp < 0.28 ? 'h18_heavy_windup' : 'h18_atk_slash_down';
    }
    if (skillAnim.kind === 'shunying_flash') {
      if (sp < 0.2) return 'h18_dagger_cross';
      if (sp < 0.68) return isHeavy ? 'h18_heavy_cleave' : 'h18_atk_slash_down';
      return 'h18_idle_1';
    }
    if (skillAnim.kind === 'jinghong_rising') {
      if (sp < 0.16) return 'h18_crouch';
      return 'h18_atk_slash_up';
    }
    if (skillAnim.kind === 'taiji_parry') {
      return sp < 0.28 ? 'h18_heavy_guard' : 'h18_idle_1';
    }
    if (skillAnim.kind === 'jiuyou_soulsteal') {
      return sp < 0.28 ? 'h18_heavy_guard' : 'h18_atk_slash_up';
    }
    if (skillAnim.kind === 'sub_throw') {
      return sp < 0.24 ? 'h18_idle_1' : 'h18_whip_snap';
    }
  }

  // 0. 经典体术帧：贴地滑铲踢 (`↓ + 跃`) / 凌空下踢 (`二段跳后 ↓ + 跃`) / 下蹲与蹲姿低斩！
  if (sliding) return 'h18_slide';
  if (diveKicking) return 'h18_divekick';
  if ((crouching || slash?.crouching) && onGround) {
    return 'h18_crouch';
  }

  // 1. 挥兵斩击帧（22把神兵按系别与独门招式套路精准切换无兵武道身法！）
  if (slash) {
    const pr = slash.progress;
    const wId = slash.weaponId || weaponId || '';
    if (isHeavy) {
      if ((wId === 'greatsword_1' || wId === 'greatsword_2') && slash.comboStep === 1) {
        return pr < 0.26 ? 'h18_heavy_cleave' : 'h18_atk_slash_up';
      }
      return pr < 0.32 ? 'h18_heavy_windup' : 'h18_heavy_cleave';
    }
    if (slash.archetype === 'whip') {
      return pr < 0.24 ? 'h18_atk_slash_up' : 'h18_whip_snap';
    }
    if (slash.archetype === 'spear') {
      if (wId === 'spear_3') {
        if (slash.comboStep === 1) return pr < 0.22 ? 'h18_spear_thrust' : 'h18_atk_slash_up';
        if (slash.comboStep === 2) return pr < 0.26 ? 'h18_heavy_windup' : 'h18_heavy_cleave';
      }
      return pr < 0.2 ? 'h18_heavy_guard' : 'h18_spear_thrust';
    }
    if (slash.archetype === 'daggers') {
      if (slash.comboStep === 1) return pr < 0.25 ? 'h18_dagger_cross' : 'h18_atk_slash_up';
      if (slash.comboStep === 2) return pr < 0.22 ? 'h18_whip_snap' : 'h18_atk_slash_down';
      return 'h18_dagger_cross';
    }
    if (slash.pogoDown) {
      return 'h18_atk_slash_down';
    }
    if (slash.comboStep === 0) {
      return pr < 0.24 ? 'h18_heavy_windup' : 'h18_atk_slash_down';
    }
    if (slash.comboStep === 1) {
      return pr < 0.22 ? 'h18_atk_slash_down' : 'h18_atk_slash_up';
    }
    if (wId === 'sword_0' || wId === 'sword_phantom') {
      return pr < 0.2 ? 'h18_heavy_guard' : 'h18_spear_thrust';
    }
    return pr < 0.26 ? 'h18_heavy_windup' : 'h18_heavy_cleave';
  }

  // 2. 腾空跃起与凌空下坠帧
  if (!onGround) {
    return vy < -35 ? 'h18_jump_up' : 'h18_jump_fall';
  }

  // 3. 地面疾奔 4 帧循环动画
  const speedRatio = Math.min(1, Math.abs(vx) / 220);
  if (speedRatio > 0.12) {
    const idx = Math.floor(Math.abs(runCycle) * 0.78) % RUN_CYCLE_FRAMES.length;
    return RUN_CYCLE_FRAMES[idx];
  }

  // 4. 地面站立待机（重兵抱刀备战架势 / 轻剑侠客立定与剑指呼吸）
  if (isHeavy) {
    return 'h18_heavy_guard';
  }
  return animTime % 5.4 > 4.2 ? 'h18_idle_1' : 'h18_idle_0';
}

interface HandSocketDef {
  rx: number;
  ry: number;
  rAngle: number;
  lx?: number;
  ly?: number;
  lAngle?: number;
}

/**
 * 12帧无兵空拳底图的精确左右手骨骼握持锚点（基于 340×256 标准序列帧实测标定）
 */
const HERO_HAND_SOCKETS: Partial<Record<AssetKey, HandSocketDef>> = {
  h18_idle_0: { rx: 105, ry: 158, rAngle: 0.47, lx: 154, ly: 159, lAngle: 0.32 },
  h18_idle_1: { rx: 96, ry: 156, rAngle: 0.61, lx: 163, ly: 108, lAngle: -1.15 },
  h18_jump_up: { rx: 95, ry: 140, rAngle: 0.58, lx: 152, ly: 134, lAngle: -0.35 },
  h18_jump_fall: { rx: 89, ry: 143, rAngle: 0.68, lx: 160, ly: 155, lAngle: 0.42 },
  h18_run_0: { rx: 100, ry: 158, rAngle: 0.48, lx: 160, ly: 155, lAngle: 0.32 },
  h18_run_1: { rx: 99, ry: 154, rAngle: 0.62, lx: 168, ly: 146, lAngle: -0.18 },
  h18_run_2: { rx: 92, ry: 150, rAngle: 0.57, lx: 173, ly: 138, lAngle: -0.26 },
  h18_run_3: { rx: 94, ry: 146, rAngle: 0.63, lx: 175, ly: 132, lAngle: -0.34 },
  h18_sword_0: { rx: 102, ry: 131, rAngle: 0.48, lx: 138, ly: 150, lAngle: 0.48 },
  h18_sword_1: { rx: 169, ry: 75, rAngle: -2.64, lx: 117, ly: 145, lAngle: 2.35 },
  h18_sword_2: { rx: 185, ry: 125, rAngle: 0.0, lx: 122, ly: 136, lAngle: 2.55 },
  h18_crouch: { rx: 117, ry: 166, rAngle: 0.05, lx: 109, ly: 166, lAngle: 0.12 },
  h18_atk_slash_down: { rx: 177, ry: 179, rAngle: 0.72, lx: 67, ly: 146, lAngle: -2.65 },
  h18_atk_slash_up: { rx: 162, ry: 71, rAngle: -1.18, lx: 116, ly: 154, lAngle: 2.35 },
  h18_spear_thrust: { rx: 116, ry: 164, rAngle: -0.29, lx: 212, ly: 135, lAngle: -0.29 },
  h18_whip_snap: { rx: 213, ry: 123, rAngle: 0.0, lx: 105, ly: 100, lAngle: -2.1 },
  h18_dagger_cross: { rx: 163, ry: 130, rAngle: -0.22, lx: 148, ly: 136, lAngle: 0.35 },
  h18_heavy_guard: { rx: 165, ry: 114, rAngle: -1.65, lx: 160, ly: 110, lAngle: -1.65 },
  h18_heavy_windup: { rx: 160, ry: 78, rAngle: -2.42, lx: 136, ly: 66, lAngle: -2.42 },
  h18_heavy_cleave: { rx: 169, ry: 173, rAngle: 0.56, lx: 161, ly: 175, lAngle: 0.56 },
};

function drawFistKnuckleClasp(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#e8b996';
  ctx.strokeStyle = '#18202c';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.ellipse(0.5, -0.5, 3.6, 2.9, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawSingleCurvedDagger(
  ctx: CanvasRenderingContext2D,
  wDef: WeaponDef,
  reverseGrip = false
): void {
  ctx.save();
  if (reverseGrip) {
    ctx.scale(-1, -1);
  }

  ctx.strokeStyle = '#090d16';
  ctx.lineWidth = 1.25;

  if (wDef.id === 'daggers_2') {
    // 分水精钢峨眉刺：中枢指环 + 两端菱形破甲双锋
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(0, 0, 4.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(-4, -2.6);
    ctx.lineTo(4, -2.6);
    ctx.lineTo(28, 0);
    ctx.lineTo(4, 2.6);
    ctx.lineTo(-4, 2.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (wDef.id === 'daggers_3') {
    // 子母鸳鸯追魂钺：错金对称双弯月护手钺刃
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-7, -2.2, 14, 4.4);
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(4, 0, 14, -1.25, 1.25);
    ctx.arc(9, 0, 10, 1.15, -1.15, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(-3, 0, 9.5, 1.95, 4.35);
    ctx.arc(-7, 0, 6.5, 4.25, 2.05, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  const len = wDef.id === 'daggers_poison' ? 35 : 29;
  // 缠绳短柄与铜铁护手
  ctx.fillStyle = '#3f2e21';
  ctx.fillRect(-9, -2.2, 9, 4.4);
  ctx.strokeRect(-9, -2.2, 9, 4.4);

  ctx.fillStyle = wDef.id === 'daggers_poison' ? '#15803d' : '#64748b';
  ctx.beginPath();
  ctx.moveTo(-1, -5.5);
  ctx.lineTo(3, -3);
  ctx.lineTo(3, 3);
  ctx.lineTo(-1, 5.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (wDef.id === 'daggers_poison') {
    // 碧蟾曲刃毒刺：蛇形弯曲碧绿淬毒刃
    const bg = ctx.createLinearGradient(2, 0, len, -4);
    bg.addColorStop(0, '#064e3b');
    bg.addColorStop(0.55, '#10b981');
    bg.addColorStop(1, '#bbf7d0');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.moveTo(2.5, -3.2);
    ctx.quadraticCurveTo(len * 0.48, -7.2, len, -4.4);
    ctx.quadraticCurveTo(len * 0.62, 4.2, 2.5, 2.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    // 生铁双短匕：朴拙笔直灰铁短匕
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(2.5, -3.0);
    ctx.lineTo(len, -0.4);
    ctx.lineTo(2.5, 3.0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function easeOutCubic(t: number): number {
  const u = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - u, 3);
}

function drawWeaponWithMotionTrail(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  anchorX: number,
  anchorY: number,
  pivotFracX: number,
  w: number,
  h: number,
  angles: number[],
  alphas: number[],
  extraShift = 0
): void {
  for (let i = angles.length - 1; i >= 0; i--) {
    const a = angles[i];
    const al = alphas[i];
    if (al <= 0.02) continue;
    ctx.save();
    ctx.translate(anchorX + extraShift * (i === 0 ? 1 : 0.72), anchorY);
    ctx.rotate(a);
    ctx.globalAlpha = al;
    ctx.drawImage(img, -w * pivotFracX, -h * 0.5, w, h);
    ctx.restore();
  }
}

function drawEquippedWeaponInHeroHands(
  ctx: CanvasRenderingContext2D,
  frameKey: AssetKey,
  wDef: WeaponDef,
  slash: ActiveSlash | null,
  skillAnim: ActiveSkillAnim | null | undefined,
  animTime: number,
  runCycle: number,
  joints: SpineJointRow[]
): void {
  const metrics = {
    canvasW: HERO_SPRITE_METRICS.canvasW,
    canvasH: HERO_SPRITE_METRICS.canvasH,
    anchorX: HERO_SPRITE_METRICS.anchorX,
    footY: HERO_SPRITE_METRICS.footY,
    scale: HERO_SPRITE_METRICS.baseScale,
  };

  const sock = HERO_HAND_SOCKETS[frameKey];
  if (!sock) return;

  const rHand = transformSpinePoint(sock.rx, sock.ry, metrics, joints);
  const lHand =
    sock.lx !== undefined && sock.ly !== undefined
      ? transformSpinePoint(sock.lx, sock.ly, metrics, joints)
      : null;

  // 0. 重刃系：跑动/跳跃/下蹲时重兵背负于背；站立备战、蹲姿挥扫、蓄力举刀与劈斩全程手握实兵贴图随弧线挥舞！
  if (wDef.archetype === 'greatsword') {
    if (
      frameKey !== 'h18_heavy_guard' &&
      frameKey !== 'h18_heavy_windup' &&
      frameKey !== 'h18_heavy_cleave' &&
      frameKey !== 'h18_atk_slash_up' &&
      frameKey !== 'h18_atk_slash_down' &&
      !(frameKey === 'h18_crouch' && slash)
    ) {
      return;
    }
    const gsImg = Assets.get(resolveWeaponAssetKey('greatsword', wDef.id));
    if (!gsImg || !gsImg.width || !gsImg.height) return;
    const gsLen = wDef.tier >= 4 ? 98 : wDef.tier === 3 ? 92 : 84;
    const gsH = gsLen * (gsImg.height / gsImg.width);
    const gripX = lHand ? (rHand.x + lHand.x) * 0.5 : rHand.x;
    const gripY = lHand ? (rHand.y + lHand.y) * 0.5 : rHand.y;

    const evalHeavyAngle = (pr: number): number => {
      if (slash?.crouching) {
        if (pr < 0.28) return -0.58 - easeOutCubic(pr / 0.28) * 0.22;
        const k = easeOutCubic((pr - 0.28) / 0.56);
        return -0.8 + k * 1.12;
      }
      const step = slash?.comboStep ?? 0;
      if (wDef.id === 'greatsword_sunder') {
        if (pr < 0.34) return -2.42 - easeOutCubic(pr / 0.34) * 0.36;
        const k = easeOutCubic((pr - 0.34) / 0.42);
        return -2.78 + k * 3.16; // 垂直高举砸向地面 (+0.38 rad)
      }
      if ((wDef.id === 'greatsword_1' || wDef.id === 'greatsword_2') && step === 1) {
        if (pr < 0.26) return 0.92 + easeOutCubic(pr / 0.26) * 0.28;
        const k = easeOutCubic((pr - 0.26) / 0.54);
        return 1.2 - k * 3.15; // 下斜扫撩起 (-1.95 rad)
      }
      if (wDef.id === 'greatsword_2') {
        if (pr < 0.3) return -2.48 - easeOutCubic(pr / 0.3) * 0.22;
        const k = easeOutCubic((pr - 0.3) / 0.52);
        return -2.7 + k * 4.35; // 250° 赤炎九环巨轮回旋斩
      }
      if (pr < 0.32) return -2.38 - easeOutCubic(pr / 0.32) * 0.3;
      const k = easeOutCubic((pr - 0.32) / 0.5);
      return -2.68 + k * 3.45;
    };

    if (slash) {
      const pr = slash.progress;
      const curA = evalHeavyAngle(pr) + rHand.angle;
      const isSwinging = pr >= 0.28 && pr <= 0.88;
      if (isSwinging) {
        const g1 = evalHeavyAngle(Math.max(0.24, pr - 0.06)) + rHand.angle;
        drawWeaponWithMotionTrail(
          ctx,
          gsImg,
          gripX,
          gripY,
          0.22,
          gsLen,
          gsH,
          [curA, g1],
          [1, wDef.tier === 1 ? 0.16 : 0.26]
        );
      } else {
        drawWeaponWithMotionTrail(ctx, gsImg, gripX, gripY, 0.22, gsLen, gsH, [curA], [1]);
      }
    } else if (skillAnim) {
      const sp = skillAnim.progress;
      const skA =
        skillAnim.kind === 'jinghong_rising'
          ? -1.65 + sp * 0.4
          : sp < 0.28
            ? -2.55
            : -2.5 + easeOutCubic((sp - 0.28) / 0.55) * 3.2;
      drawWeaponWithMotionTrail(
        ctx,
        gsImg,
        gripX,
        gripY,
        0.22,
        gsLen,
        gsH,
        [skA + rHand.angle],
        [1]
      );
    } else {
      const idleA = -2.08 + Math.sin(animTime * 2.8) * 0.035 + rHand.angle;
      drawWeaponWithMotionTrail(ctx, gsImg, gripX, gripY, 0.22, gsLen, gsH, [idleA], [1]);
    }
    ctx.save();
    ctx.translate(rHand.x, rHand.y);
    drawFistKnuckleClasp(ctx);
    ctx.restore();
    return;
  }

  // 1. 双刺奇门系（生铁双短匕 / 碧蟾曲刃毒刺 / 分水精钢峨眉刺 / 子母鸳鸯追魂钺）
  if (wDef.archetype === 'daggers') {
    const dImg = Assets.get(resolveWeaponAssetKey('daggers', wDef.id));
    const drawHandDagger = (reverseGrip: boolean, extraRot = 0, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      if (extraRot) ctx.rotate(extraRot);
      if (!dImg || !dImg.width || !dImg.height) {
        drawSingleCurvedDagger(ctx, wDef, reverseGrip);
        ctx.restore();
        return;
      }
      const centered = wDef.id === 'daggers_2' || wDef.id === 'daggers_3';
      const dLen = wDef.id === 'daggers_2' ? 40 : wDef.id === 'daggers_3' ? 38 : 34;
      const maxH = wDef.id === 'daggers_3' ? 18 : 13;
      let w = dLen;
      let h = w * (dImg.height / dImg.width);
      if (h > maxH) {
        h = maxH;
        w = h * (dImg.width / dImg.height);
      }
      if (reverseGrip) ctx.scale(-1, -1);
      const px = centered ? -w * 0.5 : -w * 0.22;
      ctx.drawImage(dImg, px, -h * 0.5, w, h);
      ctx.restore();
    };

    const isEmeiSpin = wDef.id === 'daggers_2' && Boolean(slash) && !slash?.crouching;
    const isTwinBoomerang = wDef.id === 'daggers_3' && slash?.comboStep === 2 && !slash?.crouching;
    const pr = slash ? slash.progress : 0;
    const sweepOffset = slash?.crouching
      ? 0
      : slash
        ? pr < 0.2
          ? -(pr / 0.2) * 0.55
          : -0.55 + easeOutCubic((pr - 0.2) / 0.65) * 1.95
        : 0;
    const crouchFwd = slash?.crouching ? Math.sin(Math.min(1, pr * 1.1) * Math.PI) * 18 : 0;
    const spinA = isEmeiSpin ? pr * Math.PI * 6 : isTwinBoomerang ? pr * Math.PI * 5 : 0;
    const boomDist = isTwinBoomerang ? Math.sin(Math.min(1, pr * 1.05) * Math.PI) * 58 : 0;

    if (lHand && sock.lAngle !== undefined) {
      ctx.save();
      ctx.translate(
        lHand.x + boomDist * 0.85 + crouchFwd * 0.65,
        lHand.y - Math.sin(pr * Math.PI) * (isTwinBoomerang ? 12 : slash?.crouching ? 0 : 4)
      );
      ctx.rotate(
        slash?.crouching
          ? 0.06 + lHand.angle
          : sock.lAngle + lHand.angle - sweepOffset * 0.72
      );
      if (slash && !isEmeiSpin && !isTwinBoomerang && wDef.tier > 1) {
        drawHandDagger(true, -0.35, 0.26);
      }
      drawHandDagger(wDef.id === 'daggers_poison' || slash?.comboStep === 1, -spinA, 1);
      if (!isTwinBoomerang || boomDist < 8) drawFistKnuckleClasp(ctx);
      ctx.restore();
    }

    ctx.save();
    ctx.translate(
      rHand.x + boomDist + crouchFwd,
      rHand.y + Math.sin(pr * Math.PI) * (isTwinBoomerang ? 10 : 0)
    );
    const rAng = slash?.crouching
      ? 0.04 + rHand.angle
      : slash && slash.pogoDown
        ? 1.22 + rHand.angle
        : sock.rAngle + rHand.angle + (slash?.comboStep === 1 ? -sweepOffset : sweepOffset);
    ctx.rotate(rAng);
    if (slash && !isEmeiSpin && !isTwinBoomerang && wDef.tier > 1) {
      drawHandDagger(false, -0.38, 0.26);
    }
    drawHandDagger(wDef.id === 'daggers_poison' && slash?.comboStep === 1, spinA, 1);
    if (!isTwinBoomerang || boomDist < 8) drawFistKnuckleClasp(ctx);
    ctx.restore();
    return;
  }

  // 2. 长兵系（白蜡步卒枪 / 寒星龙胆亮银枪 / 紫电惊雷蛇矛 / 破阵紫金方天戟）
  if (wDef.archetype === 'spear') {
    const spImg = Assets.get(resolveWeaponAssetKey('spear', wDef.id));
    if (!spImg || !spImg.width || !spImg.height) return;
    const spLen = wDef.tier >= 4 ? 128 : wDef.tier === 3 ? 118 : 108;
    const spH = spLen * (spImg.height / spImg.width);
    const gripX = frameKey === 'h18_spear_thrust' ? (rHand.x + (lHand?.x ?? rHand.x)) * 0.5 : rHand.x;
    const gripY = frameKey === 'h18_spear_thrust' ? (rHand.y + (lHand?.y ?? rHand.y)) * 0.5 : rHand.y;

    ctx.save();
    if (slash) {
      const pr = slash.progress;
      const isHalberdRise = !slash.crouching && wDef.id === 'spear_3' && slash.comboStep === 1;
      const isHalberdSweep = !slash.crouching && wDef.id === 'spear_3' && slash.comboStep === 2;
      if (isHalberdRise || isHalberdSweep) {
        const startA = isHalberdRise ? 0.95 : -2.18;
        const endA = isHalberdRise ? -1.48 : 1.12;
        const curA =
          (pr < 0.24
            ? startA - (pr / 0.24) * 0.22
            : startA - 0.22 + easeOutCubic((pr - 0.24) / 0.6) * (endA - startA + 0.22)) +
          rHand.angle;
        const gA =
          (pr < 0.24
            ? startA
            : startA - 0.22 + easeOutCubic(Math.max(0, pr - 0.08 - 0.24) / 0.6) * (endA - startA + 0.22)) +
          rHand.angle;
        drawWeaponWithMotionTrail(
          ctx,
          spImg,
          rHand.x,
          rHand.y,
          0.32,
          spLen,
          spH,
          pr >= 0.24 ? [curA, gA] : [curA],
          [1, 0.34]
        );
      } else {
        const aimAng =
          (slash.crouching
            ? 0.03
            : slash.pogoDown
              ? 1.15
              : slash.aimY < -0.35
                ? -0.46
                : -0.14) + rHand.angle * (slash.crouching ? 0.25 : 0.4);
        if (pr < 0.22) {
          const cockBack = easeOutCubic(pr / 0.22) * 12;
          ctx.translate(gripX - cockBack + 4, gripY + 2);
          ctx.rotate(aimAng - 0.06);
          ctx.drawImage(spImg, -spLen * 0.36, -spH * 0.5, spLen, spH);
        } else {
          const p = Math.min(1, (pr - 0.22) / 0.72);
          const thrust = Math.sin(Math.min(1, p * 1.15) * Math.PI) * (slash.crouching ? 32 : 30);
          const snakeOsc =
            wDef.id === 'spear_thunder' ? Math.sin(p * Math.PI * 5) * 0.075 : 0;
          if (wDef.id === 'spear_2' && slash.comboStep === 2) {
            ctx.save();
            ctx.translate(gripX + thrust * 0.86, gripY - 3);
            ctx.rotate(aimAng - 0.08);
            ctx.globalAlpha = 0.26 * (1 - p * 0.45);
            ctx.drawImage(spImg, -spLen * 0.26, -spH * 0.5, spLen, spH);
            ctx.restore();
          }
          ctx.translate(gripX + thrust, gripY);
          ctx.rotate(aimAng + snakeOsc);
          ctx.drawImage(spImg, -spLen * 0.26, -spH * 0.5, spLen, spH);
        }
      }
      ctx.restore();
      ctx.save();
      ctx.translate(rHand.x, rHand.y);
      drawFistKnuckleClasp(ctx);
      ctx.restore();
      return;
    } else if (
      skillAnim &&
      (skillAnim.kind === 'jinghong_rising' ||
        skillAnim.kind === 'shuofeng_wave' ||
        skillAnim.kind === 'shunying_flash')
    ) {
      const skAng = skillAnim.kind === 'jinghong_rising' ? -1.28 + rHand.angle : rHand.angle;
      const thrust = skillAnim.progress > 0.2 ? 24 * Math.sin(skillAnim.progress * Math.PI) : -6;
      ctx.translate(gripX + thrust * Math.cos(skAng), gripY + thrust * Math.sin(skAng));
      ctx.rotate(skAng);
      ctx.drawImage(spImg, -spLen * 0.26, -spH * 0.5, spLen, spH);
      ctx.restore();
      ctx.save();
      ctx.translate(rHand.x, rHand.y);
      drawFistKnuckleClasp(ctx);
      ctx.restore();
      return;
    } else {
      const carryAng =
        frameKey === 'h18_crouch'
          ? 0.04 + rHand.angle
          : -0.36 + rHand.angle + Math.sin(runCycle * 0.8) * 0.04;
      ctx.translate(rHand.x + 4, rHand.y - 2);
      ctx.rotate(carryAng);
      ctx.drawImage(spImg, -spLen * 0.34, -spH * 0.5, spLen, spH);
      drawFistKnuckleClasp(ctx);
    }
    ctx.restore();
    return;
  }

  // 3. 软鞭奇门系（生铁九节鞭 / 赤练火龙锁链刀 / 紫电打神雷音鞭）
  if (wDef.archetype === 'whip') {
    const whipImg = Assets.get(resolveWeaponAssetKey('whip', wDef.id));
    const drawWhipGripSprite = (len = 19) => {
      if (whipImg && whipImg.width && whipImg.height) {
        const srcW = Math.floor(whipImg.width * 0.26);
        const h = Math.max(7, len * (whipImg.height / Math.max(1, srcW)));
        ctx.drawImage(whipImg, 0, 0, srcW, whipImg.height, -4, -h * 0.5, len, h);
      }
    };

    ctx.save();
    ctx.translate(rHand.x, rHand.y);

    if (slash) {
      const pr = slash.progress;
      if (pr < 0.24) {
        const u = easeOutCubic(pr / 0.24);
        ctx.rotate(-2.15 + rHand.angle + u * 0.45);
        drawWhipGripSprite(19);
        drawPaintedChainTrack(
          ctx,
          12,
          0,
          56,
          0,
          9,
          0.92,
          wDef.id === 'whip_3' ? '#fde047' : wDef.id === 'whip_2' ? '#fb923c' : undefined,
          16,
          1.35,
          u * 2.2
        );
        const endWave = Math.sin(Math.PI * 1.35 - u * 2.2) * 16;
        if (whipImg && whipImg.width && whipImg.height) {
          const sx = Math.floor(whipImg.width * 0.72);
          const sw = whipImg.width - sx;
          const tipW = 19;
          const tipH = Math.max(8, tipW * (whipImg.height / Math.max(1, sw)));
          ctx.drawImage(whipImg, sx, 0, sw, whipImg.height, 52, endWave - tipH * 0.5, tipW, tipH);
        }
      } else {
        const aimAng =
          (slash.crouching ? 0.04 : slash.aimY < -0.35 ? -0.62 : slash.aimY > 0.35 ? 0.38 : 0) +
          rHand.angle;
        ctx.rotate(aimAng);
        drawWhipGripSprite(20);
      }
      drawFistKnuckleClasp(ctx);
    } else {
      const sway = Math.sin(animTime * 3.6 + runCycle * 0.9) * 0.08;
      ctx.rotate(0.32 + rHand.angle + sway);
      if (whipImg && whipImg.width && whipImg.height) {
        const wLen = 36;
        const wH = Math.min(14, wLen * (whipImg.height / whipImg.width));
        ctx.drawImage(whipImg, -8, -wH * 0.5, wLen, wH);
      }
      drawFistKnuckleClasp(ctx);
    }
    ctx.restore();
    return;
  }

  // 4. 轻剑系（7把独有佩剑：60fps 三段顺滑摆臂轨迹 + 武器残影 + 青莲剑阵三影！）
  const swImg = Assets.get(resolveWeaponAssetKey('sword', wDef.id));
  if (!swImg || !swImg.width || !swImg.height) return;
  const swLen = wDef.tier >= 4 ? 82 : wDef.tier === 3 ? 74 : wDef.tier === 2 ? 66 : 58;
  const swH = swLen * (swImg.height / swImg.width);

  if (slash) {
    const pr = slash.progress;
    const isPhantom = wDef.id === 'sword_phantom';
    const isThrustFinisher =
      slash.comboStep === 2 && (wDef.id === 'sword_0' || isPhantom);

    if (slash.pogoDown) {
      const a = 1.05 + Math.sin(pr * Math.PI) * 0.35 + rHand.angle;
      drawWeaponWithMotionTrail(ctx, swImg, rHand.x, rHand.y, 0.18, swLen, swH, [a, a - 0.35], [1, 0.35]);
    } else if (slash.crouching) {
      const ext =
        pr < 0.18
          ? -easeOutCubic(pr / 0.18) * 6
          : Math.sin(Math.min(1, (pr - 0.18) / 0.72) * Math.PI) * 24;
      const ang = -0.02 + rHand.angle;
      if (isPhantom) {
        drawWeaponWithMotionTrail(
          ctx,
          swImg,
          rHand.x + ext * 0.78,
          rHand.y,
          0.18,
          swLen * 0.94,
          swH * 0.94,
          [ang - 0.18],
          [0.32]
        );
      }
      drawWeaponWithMotionTrail(ctx, swImg, rHand.x + ext, rHand.y, 0.18, swLen, swH, [ang], [1]);
    } else if (isThrustFinisher) {
      const ext = pr < 0.2 ? -easeOutCubic(pr / 0.2) * 8 : Math.sin(Math.min(1, (pr - 0.2) / 0.72) * Math.PI) * 26;
      const ang = -0.1 + rHand.angle;
      if (isPhantom) {
        drawWeaponWithMotionTrail(
          ctx,
          swImg,
          rHand.x + ext * 0.78,
          rHand.y,
          0.18,
          swLen * 0.94,
          swH * 0.94,
          [ang - 0.22],
          [0.32]
        );
      }
      drawWeaponWithMotionTrail(ctx, swImg, rHand.x + ext, rHand.y, 0.18, swLen, swH, [ang], [1]);
    } else {
      const evalSwordAngle = (pVal: number): number => {
        if (slash.comboStep === 1) {
          // 第二式反手自下而上撩斩
          return pVal < 0.2
            ? 1.05 + easeOutCubic(pVal / 0.2) * 0.25
            : 1.3 - easeOutCubic((pVal - 0.2) / 0.62) * 2.85;
        }
        if (slash.comboStep === 2) {
          // 第三式暴烈沉腰贯斩
          return pVal < 0.24
            ? -2.2 - easeOutCubic(pVal / 0.24) * 0.28
            : -2.48 + easeOutCubic((pVal - 0.24) / 0.56) * 3.38;
        }
        // 第一式利落斜劈
        return pVal < 0.22
          ? -2.05 - easeOutCubic(pVal / 0.22) * 0.22
          : -2.27 + easeOutCubic((pVal - 0.22) / 0.58) * 3.05;
      };
      const curA = evalSwordAngle(pr) + rHand.angle;
      const g1 = evalSwordAngle(Math.max(0.18, pr - 0.06)) + rHand.angle;
      if (isPhantom && pr >= 0.2) {
        drawWeaponWithMotionTrail(
          ctx,
          swImg,
          rHand.x,
          rHand.y,
          0.18,
          swLen * 0.92,
          swH * 0.92,
          [curA - 0.22],
          [0.32]
        );
      }
      drawWeaponWithMotionTrail(
        ctx,
        swImg,
        rHand.x,
        rHand.y,
        0.18,
        swLen,
        swH,
        pr >= 0.2 ? [curA, g1] : [curA],
        [1, wDef.tier === 1 ? 0.16 : 0.26]
      );
    }
    ctx.save();
    ctx.translate(rHand.x, rHand.y);
    drawFistKnuckleClasp(ctx);
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(rHand.x, rHand.y);
  let swAng = sock.rAngle + rHand.angle;
  if (skillAnim) {
    if (skillAnim.kind === 'jinghong_rising' && skillAnim.progress >= 0.16) {
      swAng = -1.36 + rHand.angle;
    } else if (skillAnim.kind === 'jiuyou_soulsteal' && skillAnim.progress >= 0.28) {
      swAng = -1.55 + rHand.angle;
    } else if (skillAnim.kind === 'shuofeng_wave' && skillAnim.progress >= 0.28) {
      swAng = -2.2 + easeOutCubic((skillAnim.progress - 0.28) / 0.6) * 2.95 + rHand.angle;
    }
  }
  ctx.rotate(swAng);
  ctx.drawImage(swImg, -swLen * 0.18, -swH * 0.5, swLen, swH);
  drawFistKnuckleClasp(ctx);
  ctx.restore();
}

export function pickSecondaryWeaponId(
  ownedWeapons: string[],
  equippedWeaponId: string
): string | undefined {
  const curArch = WEAPONS[equippedWeaponId]?.archetype;
  const longBlade = ownedWeapons.find((id) => {
    if (id === equippedWeaponId) return false;
    const w = WEAPONS[id];
    return (
      w &&
      w.archetype !== curArch &&
      (w.archetype === 'sword' || w.archetype === 'greatsword' || w.archetype === 'spear')
    );
  });
  if (longBlade) return longBlade;
  return ownedWeapons.find((id) => {
    if (id === equippedWeaponId) return false;
    const w = WEAPONS[id];
    return !w || w.archetype !== curArch;
  });
}

function drawBackCarriedWeapon(
  ctx: CanvasRenderingContext2D,
  archetype: WeaponArchetype,
  weaponId = 'sword_1',
  chestDx = 0,
  chestDy = 0,
  chestAngle = 0
): void {
  ctx.save();
  if (archetype === 'daggers' || archetype === 'whip') {
    // 奇门短匕与九节软鞭束挂于腰后鞘囊，紧凑利落，绝不背成巨型横条！
    ctx.translate(-12 + chestDx * 0.7, -34 + chestDy * 0.7);
    ctx.rotate(archetype === 'whip' ? 0.55 + chestAngle * 0.5 : -0.78 + chestAngle * 0.6);
    ctx.globalAlpha = 0.92;
    drawCelShadedWeapon(ctx, archetype, weaponId, archetype === 'whip' ? 42 : 34);
  } else {
    ctx.translate(-8 + chestDx, -50 + chestDy);
    ctx.rotate(-2.32 + chestAngle);
    ctx.globalAlpha = 0.94;
    const backLen = archetype === 'spear' ? 74 : archetype === 'greatsword' ? 72 : 56;
    drawCelShadedWeapon(ctx, archetype, weaponId, backLen);
  }
  ctx.restore();
}

/**
 * 18岁少年李逸承 60fps 2D Spine 骨骼网格蒙皮渲染器（同时驱动局内实机战斗与【兵匣】动态试剑台！）
 */
export function renderModularLiYichengRig(
  ctx: CanvasRenderingContext2D,
  opts: HeroRenderState
): void {
  const wDef = WEAPONS[opts.equippedWeaponId] || WEAPONS.sword_0;
  const isHeavy = wDef.archetype === 'greatsword';
  const sc = opts.scale ?? 1;
  const isStagePreview = sc > 1.05;

  const frameKey = selectHeroSpriteFrame({
    vx: opts.vx,
    vy: opts.vy,
    onGround: opts.onGround,
    runCycle: opts.runCycle,
    animTime: opts.animTime,
    isHeavy,
    weaponId: opts.equippedWeaponId,
    archetype: wDef.archetype,
    slash: opts.slash,
    skillAnim: opts.skillAnim,
    isXiaoMode: opts.isXiaoMode,
    crouching: opts.crouching,
    sliding: opts.sliding,
    diveKicking: opts.diveKicking,
  });

  // 解算当前帧 8 节点 Spine 脊柱骨骼链与物理束发飘带
  const spineCtrl = isStagePreview ? StageHeroSpine : HeroSpine;
  const { joints } = spineCtrl.solveAndBuildJoints({
    worldX: opts.x,
    worldY: opts.y,
    facing: opts.facing,
    vx: opts.vx,
    vy: opts.vy,
    onGround: opts.onGround,
    runCycle: opts.runCycle,
    animTime: opts.animTime,
    landSquash: opts.landSquash,
    crouching: opts.crouching,
    sliding: opts.sliding,
    diveKicking: opts.diveKicking,
    hurtRecoil: opts.hurtRecoil,
    slashProgress: opts.slash ? opts.slash.progress : null,
    slashArchetype: opts.slash?.archetype,
    slashComboStep: opts.slash?.comboStep,
    slashWeaponId: opts.slash?.weaponId || opts.equippedWeaponId,
    skillKind: opts.skillAnim?.kind,
    skillProgress: opts.skillAnim ? opts.skillAnim.progress : null,
    isStagePreview,
  });
  const chestJoint = joints[3];

  ctx.save();
  ctx.translate(opts.x, opts.y);

  // 1. 先在世界方向空间绘制随风猎猎飞舞的 6 节点物理侠客束发长带（位于脑后与背刀底层）
  if (!isStagePreview && opts.doubleJumpSpin <= 0) {
    spineCtrl.drawHeadbandRibbon(ctx, {
      worldX: opts.x,
      worldY: opts.y,
      facing: opts.facing,
      animTime: opts.animTime,
      isXiaoMode: opts.isXiaoMode,
      isStagePreview: false,
    });
  }

  ctx.scale(opts.facing * sc, sc);

  if (isStagePreview) {
    spineCtrl.drawHeadbandRibbon(ctx, {
      worldX: opts.x,
      worldY: opts.y,
      facing: opts.facing,
      animTime: opts.animTime,
      isXiaoMode: opts.isXiaoMode,
      isStagePreview: true,
    });
  }

  // 羽化浓墨接地软阴影
  if (opts.onGround) {
    drawSoftGroundShadow(ctx, 0, 2, 28, 6.5, 0.54);
  }

  // 踏云步二段跳：凌空翻身旋跃特效
  if (opts.doubleJumpSpin > 0) {
    const spinProg = 1 - opts.doubleJumpSpin / 0.34;
    ctx.translate(0, -48);
    ctx.rotate(spinProg * Math.PI * 2);
    ctx.translate(0, 48);
  }

  // 背部挂载副武器（实时绑定于 Spine 胸椎骨骼节点 `chestJoint`，随呼吸、前倾与挥斩同步起伏！）
  const speedRatio = Math.min(1, Math.abs(opts.vx) / 220);
  const carryingHeavyWhileMoving =
    isHeavy &&
    !opts.slash &&
    (!opts.skillAnim || opts.skillAnim.kind === 'taiji_parry') &&
    (!opts.onGround || speedRatio > 0.12 || Boolean(opts.crouching));
  if (carryingHeavyWhileMoving) {
    drawBackCarriedWeapon(
      ctx,
      'greatsword',
      opts.equippedWeaponId,
      chestJoint.dx,
      chestJoint.dy,
      chestJoint.angle
    );
  } else if (opts.secondaryWeaponId && opts.secondaryWeaponId !== opts.equippedWeaponId) {
    const secW = WEAPONS[opts.secondaryWeaponId];
    if (secW && secW.archetype !== wDef.archetype) {
      drawBackCarriedWeapon(
        ctx,
        secW.archetype,
        secW.id,
        chestJoint.dx,
        chestJoint.dy,
        chestJoint.angle
      );
    }
  }

  // 2. 通过 2D Spine 三角网格仿射蒙皮绘制主角（双足锁地、胸腔吐纳、疾奔前倾、蓄力拧腰、挥刃前突！）
  const spriteImg = Assets.get(frameKey) || Assets.get('h18_idle_0');
  if (spriteImg) {
    if (opts.isXiaoMode) {
      drawSkinnedSpineSprite(
        ctx,
        spriteImg,
        {
          canvasW: ENEMY_METRICS.canvasW,
          canvasH: ENEMY_METRICS.canvasH,
          anchorX: ENEMY_METRICS.anchorX,
          footY: ENEMY_METRICS.footY,
          scale: 0.53,
        },
        joints
      );
    } else {
      drawSkinnedSpineSprite(
        ctx,
        spriteImg,
        {
          canvasW: HERO_SPRITE_METRICS.canvasW,
          canvasH: HERO_SPRITE_METRICS.canvasH,
          anchorX: HERO_SPRITE_METRICS.anchorX,
          footY: HERO_SPRITE_METRICS.footY,
          scale: HERO_SPRITE_METRICS.baseScale,
        },
        joints
      );

      // 3. 实时手部骨骼武器挂载：15把神兵在待机、奔跑、跳跃、抬手蓄势、绝技与挥击全帧随装备实时变换！
      drawEquippedWeaponInHeroHands(
        ctx,
        frameKey,
        wDef,
        opts.slash,
        opts.skillAnim,
        opts.animTime,
        opts.runCycle,
        joints
      );
    }
  }

  // 重刃蓄力提示：仅 Tier 3+ 神兵头顶浮现极淡灵息，初始朴刀保持纯物理蓄势
  if (isHeavy && wDef.tier >= 3 && opts.slash && opts.slash.progress < 0.34) {
    const charge = opts.slash.progress / 0.34;
    const gx = -4 + joints[1].dx;
    const gy = -94 + joints[1].dy;
    drawPaintedVfxDisc(
      ctx,
      'vfx_ink_shockwave',
      gx,
      gy,
      12 * charge + 6,
      opts.animTime * 8,
      0.36 * charge,
      wDef.glowColor || '#f59e0b',
      1,
      false
    );
  }

  ctx.restore();
}

export function drawHeroCharacter(
  ctx: CanvasRenderingContext2D,
  engine: GameEngine,
  t: number
): void {
  const p = engine.player;
  const s = engine.slot;
  if (!s) return;

  // 仅在真正受击掉血后的硬直保护期闪烁，释放绝技/闪避无敌帧期间角色全程清晰稳定！
  if (p.hurtBlinkTimer > 0 && Math.floor(p.hurtBlinkTimer * 20) % 2 === 0 && p.mistDashTimer <= 0) {
    return;
  }

  if (p.mistDashTimer > 0) {
    ctx.save();
    ctx.translate(p.x, p.y);
    for (let i = 0; i < 5; i++) {
      const a = t * 8 + i * 1.25;
      const rx = Math.cos(a) * 16;
      const ry = -44 + Math.sin(a * 1.3) * 14;
      const grad = ctx.createRadialGradient(rx, ry, 2, rx, ry, 28);
      grad.addColorStop(0, 'rgba(233, 213, 255, 0.92)');
      grad.addColorStop(0.55, 'rgba(168, 85, 247, 0.58)');
      grad.addColorStop(1, 'rgba(72, 201, 176, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(rx, ry, 28, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  const secondaryId = pickSecondaryWeaponId(s.ownedWeapons, s.equippedWeapon);

  renderModularLiYichengRig(ctx, {
    x: p.x,
    y: p.y,
    facing: p.facing,
    vx: p.vx,
    vy: p.vy,
    onGround: p.onGround,
    runCycle: p.runCycle,
    animTime: p.animTime,
    landSquash: p.landSquash,
    doubleJumpSpin: p.doubleJumpSpinTimer,
    equippedWeaponId: s.equippedWeapon,
    secondaryWeaponId: secondaryId,
    slash: engine.activeSlash,
    skillAnim: engine.activeSkillAnim,
    isXiaoMode: s.mode === 'xiaoduanshui',
    crouching: p.crouching,
    sliding: p.slideTimer > 0,
    diveKicking: p.diveKicking,
    hurtRecoil: p.hurtStunTimer > 0 ? Math.min(1, p.hurtStunTimer / 0.28) : 0,
  });
}

/**
 * 渲染五大国风护法灵体系（青冥剑灵 / 朱雀丹火 / 玄武镇岳 / 天机木鸢 / 青丘玉狐）与玄武坎水护体灵环！
 */
export function drawSwordFamiliar(
  ctx: CanvasRenderingContext2D,
  engine: GameEngine,
  t: number
): void {
  const activeFam = engine.getActiveFamiliar();
  if (!activeFam) return;

  // 玄武镇岳：护脉水盾就绪时，于少侠身周环绕手绘重彩坎水涡流灵环（彻底替代虚线圆！）
  if (activeFam === 'familiar_tortoise' && engine.tortoiseShieldReady) {
    const p = engine.player;
    const pulse = 46 + Math.sin(t * 2.8) * 2.5;
    drawPaintedVfxDisc(
      ctx,
      'vfx_xuanwu_ward',
      p.x,
      p.y - 42,
      pulse,
      t * 0.52,
      0.84,
      '#22d3ee',
      1,
      false
    );
  }

  const fam = engine.familiar;
  const fDef = FAMILIARS[activeFam];
  const img = Assets.get(resolveFamiliarAssetKey(activeFam));
  if (!img) return;

  ctx.save();
  ctx.translate(fam.x, fam.y);

  // 五灵专属灵韵护主光晕
  const glowR = activeFam === 'familiar_phoenix' ? 40 : 34;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const fg = ctx.createRadialGradient(0, 0, 2, 0, 0, glowR);
  fg.addColorStop(0, fDef.auraRgba);
  fg.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.arc(0, 0, glowR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  const flapScaleY =
    activeFam === 'familiar_phoenix' || activeFam === 'familiar_kestrel'
      ? 1 + Math.sin(t * 9.2) * 0.055
      : 1;
  ctx.scale(fam.facing, flapScaleY);
  const tilt =
    fam.swoopTimer > 0
      ? activeFam === 'familiar_sword'
        ? 0.55
        : 0.24
      : Math.sin(t * 3.8) * 0.08;
  ctx.rotate(tilt);
  const h = activeFam === 'familiar_sword' ? 58 : 54;
  const w = img.width * (h / img.height);
  ctx.drawImage(img, -w * 0.5, -h * 0.5, w, h);
  ctx.restore();

  if (fam.calloutTimer > 0 && fam.calloutText) {
    ctx.font = 'bold 11.5px "STKaiti", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
    ctx.fillText(fam.calloutText, 1, -35);
    ctx.fillStyle = fDef.color;
    ctx.fillText(fam.calloutText, 0, -36);
  }

  ctx.restore();
}

/**
 * 100% 纯手绘国风水墨刀罡弧刃（零矢量多边形/几何线条：全权由手绘重彩贴图与叠光墨韵驱动！）
 */
export function drawInkSlashRibbon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  facing: 1 | -1,
  flipVert: boolean,
  radius: number,
  thickness: number,
  startAng: number,
  endAng: number,
  coreColor: string,
  fadeAlpha: number
): void {
  const span = Math.abs(endAng - startAng);
  if (fadeAlpha <= 0.02 || span < 0.05) return;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(facing, flipVert ? -1 : 1);

  if (span < 0.35) {
    const mid = (startAng + endAng) * 0.5;
    drawPaintedVfxSprite(ctx, 'vfx_iaido_flash_cut', 0, 0, radius * 1.15, Math.max(16, thickness * 1.8), {
      rotation: mid,
      alpha: fadeAlpha * 0.62,
      tintHex: coreColor,
      tintAlpha: 0.36,
      additive: false,
      anchorX: 0.2,
      anchorY: 0.5,
    });
    ctx.restore();
    return;
  }

  const midAng = (startAng + endAng) * 0.5;
  const d = Math.max(44, radius * 1.45);

  drawPaintedVfxSprite(ctx, 'vfx_slash_crescent', 0, 0, d, d, {
    rotation: midAng,
    alpha: Math.min(1, fadeAlpha * 0.62),
    tintHex: coreColor,
    tintAlpha: 0.38,
    additive: false,
  });
  ctx.restore();
}

/**
 * 22把独有神兵分阶手绘刀罡/元素异象渲染器（兼顾局内战斗与兵匣动态试剑台！）
 */
export function renderHeroWeaponSlashVfx(
  ctx: CanvasRenderingContext2D,
  sl: ActiveSlash,
  equippedWeaponId: string,
  ambientTime: number
): void {
  const wId = sl.weaponId || equippedWeaponId || 'sword_0';
  const wDef = WEAPONS[wId] || WEAPONS.sword_0;
  const glowCol = sl.glowColor || wDef.glowColor || '#2dd4bf';

  if (sl.pogoDown) {
    const fade = Math.max(0, 1 - sl.progress * 0.55);
    const d = (wDef.tier === 1 ? 82 : 102) * (0.82 + easeOutCubic(sl.progress) * 0.22);
    drawPaintedVfxSprite(ctx, 'vfx_slash_crescent', sl.x, sl.y + 8, d, d, {
      rotation: 1.28 * sl.facing,
      flipX: sl.facing === -1,
      alpha: fade * (wDef.tier === 1 ? 0.36 : 0.64),
      tintHex: glowCol,
      tintAlpha: wDef.tier === 1 ? 0.15 : 0.34,
      additive: wDef.tier >= 3,
    });
    return;
  }

  // ================= 1. 重兵系（朴刀 / 九环火刀 / 盘古碎岳乌金锏 / 饕餮开山巨陌刀） =================
  if (sl.archetype === 'greatsword') {
    if (sl.progress < 0.28) return;
    const p = Math.min(1, (sl.progress - 0.28) / 0.7);
    const k = easeOutCubic(p);
    const fade = Math.max(0, 1 - p * 0.65);

    if (sl.crouching) {
      const d = sl.reachX * 1.28 * (0.88 + k * 0.16);
      const lowTint =
        wId === 'greatsword_1'
          ? '#94a3b8'
          : wId === 'greatsword_2'
            ? '#ea580c'
            : wId === 'greatsword_sunder'
              ? '#d97706'
              : '#dc2626';
      drawPaintedVfxSprite(ctx, 'vfx_slash_heavy_cleave', sl.x + sl.facing * 12, sl.y + 4, d, d * 0.56, {
        rotation: sl.facing * (-0.18 + k * 0.44),
        flipX: sl.facing === -1,
        alpha: fade * (wId === 'greatsword_1' ? 0.48 : 0.74),
        tintHex: lowTint,
        tintAlpha: wId === 'greatsword_1' ? 0.18 : 0.42,
        additive: false,
      });
      return;
    }

    if (wId === 'greatsword_1') {
      const d = sl.reachX * 1.28 * (0.88 + k * 0.16);
      drawPaintedVfxSprite(ctx, 'vfx_slash_crescent', sl.x + sl.facing * 10, sl.y + 2, d, d, {
        rotation: sl.facing * (-0.4 + k * 0.8),
        flipX: sl.facing === -1,
        alpha: fade * 0.4,
        tintHex: '#94a3b8',
        tintAlpha: 0.14,
        additive: false,
      });
      return;
    }

    if (wId === 'greatsword_sunder') {
      const smashRot = sl.facing * (-0.52 + k * 0.88);
      const d = sl.reachX * 1.42 * (0.88 + k * 0.18);
      drawPaintedVfxSprite(ctx, 'vfx_slash_heavy_cleave', sl.x + sl.facing * 12, sl.y - 4, d, d, {
        rotation: smashRot,
        flipX: sl.facing === -1,
        alpha: fade * 0.72,
        tintHex: '#d97706',
        tintAlpha: 0.4,
        additive: false,
      });
      if (sl.comboStep === 2 && p > 0.1) {
        const ep = Math.min(1, (p - 0.1) / 0.72);
        const efade = Math.max(0, 1 - ep * 0.7);
        drawPaintedVfxSprite(
          ctx,
          'vfx_earth_sunder_burst',
          sl.x + sl.facing * 52,
          sl.y + 42,
          102 + ep * 32,
          62 + ep * 20,
          {
            alpha: efade * 0.68,
            anchorY: 0.95,
            tintHex: '#fbbf24',
            tintAlpha: 0.28,
            additive: false,
          }
        );
      }
      return;
    }

    const isRising = (wId === 'greatsword_2') && sl.comboStep === 1;
    const scaleMult = wId === 'greatsword_3' ? 1.54 : 1.46;
    const growMult = wId === 'greatsword_3' ? 0.2 : 0.18;
    const d = sl.reachX * scaleMult * (0.88 + k * growMult);
    const rot = isRising
      ? sl.facing * (0.62 - k * 1.38)
      : sl.facing * (-0.42 + k * 0.85);
    drawPaintedVfxSprite(ctx, 'vfx_slash_heavy_cleave', sl.x + sl.facing * 10, sl.y + 2, d, d, {
      rotation: rot,
      flipX: sl.facing === -1,
      flipY: isRising,
      alpha: fade * (wId === 'greatsword_3' ? 0.78 : 0.72),
      tintHex: wId === 'greatsword_2' ? '#ea580c' : wId === 'greatsword_3' ? '#dc2626' : glowCol,
      tintAlpha: wId === 'greatsword_3' ? 0.45 : 0.42,
      additive: false,
    });

    if (wId === 'greatsword_2' && sl.comboStep === 2) {
      drawPaintedVfxSprite(
        ctx,
        'vfx_samadhi_fire_pillar',
        sl.x + sl.facing * (40 + k * 42),
        sl.y + 40,
        34 + k * 10,
        58 + k * 16,
        { alpha: fade * 0.58, anchorY: 0.95, additive: true }
      );
    } else if (wId === 'greatsword_3' && sl.comboStep === 2 && p > 0.14) {
      drawPaintedVfxSprite(
        ctx,
        'vfx_qi_dragon_wave',
        sl.x + sl.facing * (44 + k * 48),
        sl.y - 2,
        98,
        80,
        {
          flipX: sl.facing === -1,
          alpha: fade * 0.68,
          tintHex: '#facc15',
          additive: true,
        }
      );
    }
    return;
  }

  // ================= 2. 长兵系（白蜡枪 / 亮银枪 / 雷鸣蛇矛 / 破阵紫金方天戟） =================
  if (sl.archetype === 'spear') {
    if (sl.progress < 0.16) return;
    const p = Math.min(1, (sl.progress - 0.16) / 0.78);
    const k = easeOutCubic(p);
    const fade = Math.max(0, 1 - p * 0.65);

    if (!sl.crouching && wId === 'spear_3' && sl.comboStep === 1) {
      const d = sl.reachX * 1.12;
      drawPaintedVfxSprite(ctx, 'vfx_slash_crescent', sl.x + sl.facing * 24, sl.y - 10, d, d, {
        rotation: sl.facing * (0.42 - k * 1.35),
        flipX: sl.facing === -1,
        flipY: true,
        alpha: fade * 0.7,
        tintHex: '#a855f7',
        tintAlpha: 0.38,
        additive: false,
      });
      return;
    }

    if (!sl.crouching && wId === 'spear_3' && sl.comboStep === 2) {
      const d = sl.reachX * 1.3;
      drawPaintedVfxSprite(ctx, 'vfx_slash_crescent', sl.x + sl.facing * 22, sl.y - 4, d, d, {
        rotation: sl.facing * (-0.32 + k * 0.88),
        flipX: sl.facing === -1,
        alpha: fade * 0.76,
        tintHex: '#c084fc',
        tintAlpha: 0.48,
        additive: false,
      });
      return;
    }

    const thrustExt = Math.sin(Math.min(1, p * 1.15) * Math.PI);
    const aimAng = sl.crouching ? 0 : sl.aimY < -0.35 ? -0.46 : 0;
    const len = sl.reachX * (0.85 + thrustExt * 0.5);

    if (wId === 'spear_1') {
      drawPaintedVfxSprite(ctx, 'vfx_iaido_flash_cut', sl.x + sl.facing * 12, sl.y - 4, len * 0.74, 18, {
        rotation: sl.facing === 1 ? aimAng : Math.PI - aimAng,
        alpha: fade * 0.38,
        tintHex: '#cbd5e1',
        tintAlpha: 0.14,
        additive: false,
        anchorX: 0.2,
      });
      return;
    }

    if (wId === 'spear_2') {
      if (sl.comboStep === 2) {
        drawPaintedVfxSprite(ctx, 'vfx_spear_dragon_thrust', sl.x + sl.facing * 10, sl.y - 4, len * 0.92, 44, {
          rotation: sl.facing === 1 ? aimAng : Math.PI - aimAng,
          alpha: fade * 0.74,
          tintHex: '#7dd3fc',
          additive: true,
          anchorX: 0.16,
        });
      } else {
        drawPaintedVfxSprite(ctx, 'vfx_iaido_flash_cut', sl.x + sl.facing * 10, sl.y - 4, len * 0.86, 24, {
          rotation: sl.facing === 1 ? aimAng : Math.PI - aimAng,
          alpha: fade * 0.68,
          tintHex: '#38bdf8',
          tintAlpha: 0.36,
          additive: true,
          anchorX: 0.2,
        });
      }
      return;
    }

    if (wId === 'spear_thunder') {
      drawPaintedVfxSprite(ctx, 'vfx_iaido_flash_cut', sl.x + sl.facing * 10, sl.y - 4, len * 0.88, 24, {
        rotation: sl.facing === 1 ? aimAng : Math.PI - aimAng,
        alpha: fade * 0.68,
        tintHex: '#a855f7',
        additive: true,
        anchorX: 0.2,
      });
      const tipX = sl.x + sl.facing * Math.cos(aimAng) * (len * 0.84);
      const tipY = sl.y - 4 + Math.sin(aimAng) * (len * 0.84);
      drawPaintedThunderBolt(
        ctx,
        sl.x + sl.facing * 18,
        sl.y - 4,
        tipX,
        tipY,
        12 * fade + 4,
        0.65 * fade,
        Math.floor(ambientTime * 28) % 2 === 1,
        '#e879f9'
      );
      return;
    }

    drawPaintedVfxSprite(ctx, 'vfx_spear_dragon_thrust', sl.x + sl.facing * 10, sl.y - 4, len * 0.9, 46, {
      rotation: sl.facing === 1 ? aimAng : Math.PI - aimAng,
      alpha: fade * 0.74,
      tintHex: '#c084fc',
      additive: true,
      anchorX: 0.16,
    });
    return;
  }

  // ================= 3. 短兵系（短匕 / 旋转峨眉刺 / 碧蟾毒刺 / 子母鸳鸯追魂钺） =================
  if (sl.archetype === 'daggers') {
    const p = sl.progress;
    const k = easeOutCubic(p);
    const fade = Math.max(0, 1 - p * 0.55);

    if (sl.crouching) {
      drawPaintedVfxSprite(ctx, 'vfx_iaido_flash_cut', sl.x + sl.facing * 18, sl.y, Math.max(60, sl.reachX * 0.88), 20, {
        flipX: sl.facing === -1,
        alpha: fade * (wDef.tier === 1 ? 0.44 : 0.7),
        tintHex: wDef.tier === 1 ? '#cbd5e1' : glowCol,
        tintAlpha: wDef.tier === 1 ? 0.16 : 0.4,
        additive: wDef.tier >= 3,
        anchorX: 0.2,
      });
      return;
    }

    if (wId === 'daggers_1') {
      drawPaintedVfxSprite(ctx, 'vfx_iaido_flash_cut', sl.x + sl.facing * 20, sl.y - 2, 56, 15, {
        rotation: sl.facing * (sl.comboStep % 2 === 0 ? 0.3 : -0.3),
        flipX: sl.facing === -1,
        alpha: fade * 0.38,
        tintHex: '#cbd5e1',
        tintAlpha: 0.14,
        additive: false,
      });
      return;
    }

    if (wId === 'daggers_2') {
      drawPaintedVfxSprite(ctx, 'vfx_slash_crescent', sl.x + sl.facing * 20, sl.y - 2, 76, 72, {
        rotation: sl.facing * (-0.3 + k * 0.9),
        flipX: sl.facing === -1,
        alpha: fade * 0.64,
        tintHex: '#38bdf8',
        tintAlpha: 0.36,
        additive: false,
      });
      return;
    }

    if (wId === 'daggers_poison') {
      drawPaintedVfxSprite(ctx, 'vfx_slash_crescent', sl.x + sl.facing * 22, sl.y, 78, 74, {
        rotation: sl.facing * (sl.comboStep % 2 === 0 ? -0.2 + k * 0.8 : 0.3 - k * 0.8),
        flipX: sl.facing === -1,
        flipY: sl.comboStep % 2 === 1,
        alpha: fade * 0.66,
        tintHex: '#84cc16',
        tintAlpha: 0.44,
        additive: false,
      });
      return;
    }

    if (wId === 'daggers_3') {
      if (sl.comboStep === 2) {
        const dist = Math.sin(Math.min(1, p * 1.05) * Math.PI) * 56;
        drawPaintedVfxSprite(ctx, 'vfx_slash_crescent', sl.x + sl.facing * (28 + dist), sl.y - 2, 76, 76, {
          rotation: -p * Math.PI * 3.2,
          alpha: fade * 0.74,
          tintHex: '#fde047',
          additive: true,
        });
      } else {
        drawPaintedVfxSprite(ctx, 'vfx_slash_crescent', sl.x + sl.facing * 24, sl.y - 2, 82, 78, {
          rotation: sl.facing * (sl.comboStep === 1 ? 0.35 - k * 0.9 : -0.25 + k * 0.9),
          flipX: sl.facing === -1,
          flipY: sl.comboStep === 1,
          alpha: fade * 0.7,
          tintHex: '#ec4899',
          tintAlpha: 0.42,
          additive: false,
        });
      }
      return;
    }

    return;
  }

  // ================= 4. 软兵系（九节鞭 / 赤练火龙锁链刀 / 紫电打神雷音鞭） =================
  if (sl.archetype === 'whip') {
    if (sl.progress < 0.24) return;
    const p = Math.min(1, (sl.progress - 0.24) / 0.74);
    const snap = Math.sin(Math.min(1, p * 1.25) * Math.PI);
    const aimAng = sl.crouching ? 0 : sl.aimY < -0.35 ? -0.62 : sl.aimY > 0.35 ? 0.38 : 0;
    const maxLen = sl.reachX * (0.38 + snap * 0.68);
    const waveAmp = (1 - snap * 0.78) * 14;
    const tipWave = Math.sin(Math.PI * 2.5 - p * 9) * waveAmp;
    const tipTangent = Math.cos(Math.PI * 2.5 - p * 9) * (waveAmp * 0.04);

    ctx.save();
    ctx.translate(sl.x + sl.facing * 28, sl.crouching ? sl.y - 2 : sl.y - 14);
    ctx.scale(sl.facing, 1);
    ctx.rotate(aimAng);

    if (wId === 'whip_1') {
      drawPaintedChainTrack(ctx, 0, 0, maxLen, 0, 9.5, 0.9, undefined, waveAmp, 2.5, p * 9);
    } else if (wId === 'whip_2') {
      drawPaintedChainTrack(ctx, 0, 0, maxLen, 0, 10, 0.92, '#fb923c', waveAmp, 2.5, p * 9);
    } else {
      drawPaintedChainTrack(ctx, 0, 0, maxLen, 0, 10, 0.92, '#fde047', waveAmp, 2.5, p * 9);
    }

    // 真实手绘鞭梢贴图（截取出 wpn_whip_1 锥镖 / wpn_whip_2 赤焰飞镰 / wpn_whip_3 雷芒金梢跟随波浪甩击！）
    const whipImg = Assets.get(resolveWeaponAssetKey('whip', wId));
    if (whipImg && whipImg.width && whipImg.height) {
      const sx = Math.floor(whipImg.width * 0.68);
      const sw = whipImg.width - sx;
      const tipW = wId === 'whip_2' ? 32 : wId === 'whip_3' ? 34 : 26;
      const tipH = Math.max(12, tipW * (whipImg.height / Math.max(1, sw)));
      ctx.save();
      ctx.translate(maxLen, tipWave);
      ctx.rotate(wId === 'whip_2' && sl.comboStep === 2 ? p * Math.PI * 6 : tipTangent);
      ctx.drawImage(whipImg, sx, 0, sw, whipImg.height, -tipW * 0.25, -tipH * 0.5, tipW, tipH);
      ctx.restore();
    }

    if (wId === 'whip_3') {
      drawPaintedThunderBolt(
        ctx,
        8,
        0,
        maxLen + 8,
        tipWave,
        12 * snap + 4,
        0.65 * (1 - p * 0.4),
        Math.floor(ambientTime * 30) % 2 === 1,
        '#a855f7'
      );
    } else if (wId === 'whip_2' && p > 0.15) {
      drawPaintedVfxSprite(ctx, 'vfx_slash_crescent', maxLen, tipWave, 56, 56, {
        rotation: p * 1.4,
        alpha: (1 - p * 0.5) * 0.62,
        tintHex: '#f97316',
        additive: true,
      });
    }
    ctx.restore();
    return;
  }

  // ================= 5. 轻剑系（7 把独有神剑按阶位递进绽放简约手绘剑气！） =================
  const p = sl.progress;
  const k = easeOutCubic(p);
  const fade = Math.max(0, 1 - p * 0.55);
  if (sl.crouching) {
    drawPaintedVfxSprite(
      ctx,
      'vfx_iaido_flash_cut',
      sl.x + sl.facing * 16,
      sl.y,
      Math.max(66, sl.reachX * 0.92),
      22,
      {
        flipX: sl.facing === -1,
        alpha: fade * (wDef.tier === 1 ? 0.46 : 0.72),
        tintHex: wDef.tier === 1 ? '#cbd5e1' : glowCol,
        tintAlpha: wDef.tier === 1 ? 0.16 : 0.38,
        additive: wDef.tier >= 3,
        anchorX: 0.18,
      }
    );
    return;
  }
  const flip = sl.comboStep === 1;
  const slashRot = sl.facing * (flip ? 0.35 - k * 1.05 : -0.35 + k * 0.95);

  if (wId === 'sword_0') {
    if (sl.comboStep === 2) {
      drawPaintedVfxSprite(ctx, 'vfx_iaido_flash_cut', sl.x + sl.facing * 18, sl.y - 2, 64, 16, {
        flipX: sl.facing === -1,
        alpha: fade * 0.38,
        tintHex: '#cbd5e1',
        tintAlpha: 0.14,
        additive: false,
        anchorX: 0.2,
      });
      return;
    }
    const d0 = sl.reachX * 1.18 * (0.9 + k * 0.12);
    drawPaintedVfxSprite(ctx, 'vfx_slash_crescent', sl.x + sl.facing * 10, sl.y, d0, d0 * 0.94, {
      rotation: slashRot,
      flipX: sl.facing === -1,
      flipY: flip,
      alpha: fade * 0.32,
      tintHex: '#cbd5e1',
      tintAlpha: 0.14,
      additive: false,
    });
    return;
  }

  if (wId === 'sword_1') {
    if (sl.comboStep === 2) {
      drawPaintedVfxSprite(ctx, 'vfx_iaido_flash_cut', sl.x + sl.facing * 16, sl.y - 2, 76, 20, {
        flipX: sl.facing === -1,
        alpha: fade * 0.54,
        tintHex: '#f1f5f9',
        tintAlpha: 0.24,
        additive: false,
        anchorX: 0.18,
      });
      return;
    }
    const d1 = sl.reachX * 1.26 * (0.9 + k * 0.14);
    drawPaintedVfxSprite(ctx, 'vfx_slash_crescent', sl.x + sl.facing * 10, sl.y, d1, d1 * 0.95, {
      rotation: slashRot,
      flipX: sl.facing === -1,
      flipY: flip,
      alpha: fade * 0.48,
      tintHex: '#e2e8f0',
      tintAlpha: 0.22,
      additive: false,
    });
    return;
  }

  if (wId === 'sword_2') {
    if (sl.comboStep === 2) {
      drawPaintedVfxSprite(ctx, 'vfx_iaido_flash_cut', sl.x + sl.facing * 14, sl.y - 2, 92, 26, {
        flipX: sl.facing === -1,
        alpha: fade * 0.7,
        tintHex: '#38bdf8',
        additive: true,
        anchorX: 0.16,
      });
      return;
    }
    const d2 = sl.reachX * 1.36 * (0.88 + k * 0.16);
    drawPaintedVfxSprite(ctx, 'vfx_slash_crescent', sl.x + sl.facing * 10, sl.y, d2, d2 * 0.96, {
      rotation: slashRot,
      flipX: sl.facing === -1,
      flipY: flip,
      alpha: fade * 0.66,
      tintHex: '#38bdf8',
      tintAlpha: 0.32,
      additive: false,
    });
    return;
  }

  if (wId === 'sword_frost') {
    const df = sl.reachX * 1.38 * (0.88 + k * 0.16);
    drawPaintedVfxSprite(ctx, 'vfx_slash_crescent', sl.x + sl.facing * 10, sl.y, df, df * 0.96, {
      rotation: slashRot,
      flipX: sl.facing === -1,
      flipY: flip,
      alpha: fade * 0.68,
      tintHex: '#7dd3fc',
      tintAlpha: 0.36,
      additive: false,
    });
    if (sl.comboStep === 2) {
      drawPaintedVfxSprite(ctx, 'vfx_frost_shatter', sl.x + sl.facing * (44 + k * 20), sl.y - 4, 56, 56, {
        rotation: p * 1.1,
        alpha: fade * 0.66,
        tintHex: '#bae6fd',
        tintAlpha: 0.3,
        additive: false,
      });
    }
    return;
  }

  if (wId === 'sword_blood') {
    const db = sl.reachX * 1.38 * (0.88 + k * 0.16);
    drawPaintedVfxSprite(ctx, 'vfx_slash_crescent', sl.x + sl.facing * 10, sl.y, db, db * 0.96, {
      rotation: slashRot,
      flipX: sl.facing === -1,
      flipY: flip,
      alpha: fade * 0.7,
      tintHex: '#e11d48',
      tintAlpha: 0.42,
      additive: false,
    });
    if (sl.comboStep === 2) {
      drawPaintedVfxSprite(ctx, 'vfx_lotus_blood_finisher', sl.x + sl.facing * (36 + k * 18), sl.y, 66, 66, {
        rotation: slashRot,
        flipX: sl.facing === -1,
        alpha: fade * 0.58,
        tintHex: '#f43f5e',
        tintAlpha: 0.42,
        additive: false,
      });
    }
    return;
  }

  if (wId === 'sword_phantom') {
    if (sl.comboStep === 2) {
      drawPaintedVfxSprite(ctx, 'vfx_iaido_flash_cut', sl.x + sl.facing * 14, sl.y - 2, 102, 26, {
        flipX: sl.facing === -1,
        alpha: fade * 0.72,
        tintHex: '#2dd4bf',
        additive: true,
        anchorX: 0.16,
      });
      return;
    }
    const dp = sl.reachX * 1.34 * (0.88 + k * 0.16);
    drawPaintedVfxSprite(ctx, 'vfx_slash_crescent', sl.x + sl.facing * 10, sl.y, dp, dp * 0.96, {
      rotation: slashRot,
      flipX: sl.facing === -1,
      flipY: flip,
      alpha: fade * 0.66,
      tintHex: '#2dd4bf',
      tintAlpha: 0.34,
      additive: false,
    });
    drawPaintedVfxSprite(ctx, 'vfx_slash_crescent', sl.x + sl.facing * 16, sl.y - 10, dp * 0.82, dp * 0.82, {
      rotation: slashRot - 0.22 * sl.facing,
      flipX: sl.facing === -1,
      flipY: !flip,
      alpha: fade * 0.32,
      tintHex: '#a7f3d0',
      tintAlpha: 0.3,
      additive: false,
    });
    return;
  }

  // sword_3（七星龙渊剑）及兜底高阶剑意
  const d3 = sl.reachX * 1.44 * (0.88 + k * 0.16);
  drawPaintedVfxSprite(ctx, 'vfx_slash_crescent', sl.x + sl.facing * 10, sl.y, d3, d3 * 0.96, {
    rotation: slashRot,
    flipX: sl.facing === -1,
    flipY: flip,
    alpha: fade * 0.74,
    tintHex: '#f59e0b',
    tintAlpha: 0.4,
    additive: false,
  });
  if (sl.comboStep === 2) {
    drawPaintedVfxSprite(ctx, 'vfx_qi_dragon_wave', sl.x + sl.facing * (36 + k * 28), sl.y - 2, 92, 76, {
      flipX: sl.facing === -1,
      alpha: fade * 0.72,
      tintHex: '#facc15',
      additive: true,
    });
  }
}

const BOSS_VISUAL_SCALES: Partial<Record<EnemyKind, number>> = {
  boss_xiao_duanshui: 0.58,
  boss_pei_wuji: 0.64,
  boss_scroll_king: 0.76,
  boss_opera_god: 0.82,
  boss_colosseum_general: 0.88,
  boss_thunder_yaksha: 0.96,
  boss_shipyard_leviathan: 1.0,
  boss_furnace_titan: 1.12,
  boss_dragon_warden: 1.14,
  boss_zhuyin: 1.18,
};

export function drawMonsterOrBoss(
  ctx: CanvasRenderingContext2D,
  e: EnemyEntity,
  t: number
): void {
  const w = e.profile.w;
  const h = e.profile.h;
  const flash = e.hurtFlash > 0;
  const spriteKey = selectEnemySpriteFrame(e, t);
  const img = Assets.get(spriteKey);

  const joltX =
    (e.hurtJoltTimer || 0) > 0
      ? Math.sin(t * 96 + e.id * 3) * 6.5 * Math.min(1, (e.hurtJoltTimer || 0) / 0.12)
      : 0;
  const emergeProg =
    (e.burrowEmergeTimer || 0) > 0 ? Math.min(1, (e.burrowEmergeTimer || 0) / 0.55) : 0;

  ctx.save();
  ctx.translate(e.x + joltX, e.y);

  if (!e.profile.flying) {
    drawSoftGroundShadow(ctx, 0, 2, w * 0.76, e.profile.isBoss ? Math.max(7.5, w * 0.11) : 6.8, 0.56);
  }

  // 破土阴兵钻出地面时的翻卷泥石土堆遮罩
  if (emergeProg > 0) {
    drawSoftGroundShadow(ctx, 0, 2, w * 0.92, 8.5, 0.78);
    ctx.beginPath();
    ctx.rect(-120, -220, 240, 223);
    ctx.clip();
  }

  if (img) {
    const knd = e.profile.kind;
    const sc =
      (e.profile.isBoss ? BOSS_VISUAL_SCALES[knd] ?? 0.86 : undefined) ??
      (knd === 'magma_crucible_golem' || knd === 'celestial_sentinel'
        ? 0.62
        : knd === 'terracotta_halberdier' || knd === 'frost_chain_jailer'
          ? 0.6
          : knd === 'demon_wolf' ||
              knd === 'taoist_talisman_priest' ||
              knd === 'ink_brush_scholar'
            ? 0.55
            : knd === 'bronze_guard' ||
                knd === 'opera_sleeve_siren' ||
                knd === 'drowned_corpse_bride'
              ? 0.54
              : knd === 'spirit_crow' ||
                  knd === 'mine_pickaxe_ghoul' ||
                  knd === 'clockwork_mantis' ||
                  knd === 'bronze_gear_wisp'
                ? 0.5
                : knd === 'alchemy_homunculus'
                  ? 0.46
                  : 0.52);

    const hoverY = e.roosting
      ? 0
      : e.profile.flying
        ? Math.sin(e.animPhase) * 4.5
        : -emergeProg * 48;
    const joints = buildEntitySpineJoints({
      key: e.id,
      t,
      vx: e.vx,
      facing: e.facing,
      flying: e.profile.flying,
      isBoss: e.profile.isBoss,
      aiState: e.aiState,
      hurtFlash: e.hurtFlash,
      castAnimTimer: e.castAnimTimer,
      animPhase: e.animPhase,
    });

    ctx.save();
    ctx.translate(0, -hoverY);
    if (e.roosting) {
      // 玄冥三足阴鸦栖梁期：正立敛翼停驻于飞檐古梁之上（绝非西式倒挂蝙蝠！）
      ctx.translate(0, -8);
      ctx.scale(e.facing * 0.94, 0.94);
    } else {
      ctx.scale(e.facing, 1);
    }

    const source = flash ? Assets.getWhiteFlash(spriteKey) || img : img;
    drawSkinnedSpineSprite(
      ctx,
      source,
      {
        canvasW: ENEMY_METRICS.canvasW,
        canvasH: ENEMY_METRICS.canvasH,
        anchorX: ENEMY_METRICS.anchorX,
        footY: ENEMY_METRICS.footY,
        scale: sc,
      },
      joints
    );
    ctx.restore();

    const kind = e.profile.kind;
    const castProg =
      e.castAnimTimer && e.castAnimTimer > 0 ? Math.min(1, e.castAnimTimer / 0.36) : 0;

    // 怪物专属极简常驻/施法微兆（克制不喧宾夺主，零空心几何环/繁琐浮游物）
    if (e.profile.shieldedFront) {
      if (castProg > 0) {
        drawPaintedVfxDisc(
          ctx,
          'vfx_ink_shockwave',
          e.facing * 20,
          -52,
          12 * (1.2 - castProg * 0.3),
          t * 5,
          castProg * 0.45,
          '#fbbf24',
          1,
          false
        );
      }
    } else if (kind === 'opera_puppet') {
      // 梨园提线木偶：极淡悬丝傀儡细丝
      const taut = e.aiState === 'windup' || e.aiState === 'lunge_slash' || castProg > 0;
      for (const ox of [-10, 0, 10]) {
        drawPaintedChainTrack(
          ctx,
          ox,
          -h * 0.76,
          ox + (taut ? 0 : Math.sin(t * 2.5 + ox) * 3),
          -h - 76,
          2.0,
          taut ? 0.36 : 0.15,
          '#fb7185'
        );
      }
    } else if (kind === 'scroll_demon') {
      if (castProg > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const sx = e.facing * 18;
        const sy = -28;
        const cg = ctx.createRadialGradient(sx, sy, 1, sx, sy, 12);
        cg.addColorStop(0, `rgba(239, 68, 68, ${castProg * 0.48})`);
        cg.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(sx, sy, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else if (kind === 'plague_toad' && (Math.abs(e.vy) > 25 || castProg > 0)) {
      // 毒沼金蟾：腾跃扑击与喷毒瞬间咽喉微弱紫绿毒雾
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const pg = ctx.createRadialGradient(e.facing * 14, -20, 2, e.facing * 14, -20, 16);
      pg.addColorStop(0, 'rgba(74, 222, 128, 0.42)');
      pg.addColorStop(0.58, 'rgba(168, 85, 247, 0.26)');
      pg.addColorStop(1, 'rgba(88, 28, 135, 0)');
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(e.facing * 14, -20, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else {
    Assets.ensurePriorityKeys([spriteKey]);
    ctx.save();
    const pulse = 0.65 + Math.sin(t * 6 + e.id) * 0.2;
    const aura = ctx.createRadialGradient(0, -h * 0.52, 4, 0, -h * 0.52, Math.max(w, h) * 0.72);
    aura.addColorStop(0, 'rgba(15, 23, 42, 0.88)');
    aura.addColorStop(0.62, 'rgba(30, 41, 59, 0.52)');
    aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.52, w * 0.56, h * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = e.profile.accentColor || '#f43f5e';
    ctx.globalAlpha = pulse;
    ctx.beginPath();
    ctx.arc(e.facing * w * 0.16, -h * 0.66, e.profile.isBoss ? 3.5 : 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 玄冥寒魄霜冻迟缓与赤练/碧蟾持续灼毒视觉反馈！
  if ((e.chillTimer || 0) > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const cg = ctx.createRadialGradient(0, -h * 0.52, 4, 0, -h * 0.52, w * 0.72);
    cg.addColorStop(0, 'rgba(186, 230, 253, 0.34)');
    cg.addColorStop(0.6, 'rgba(56, 189, 248, 0.18)');
    cg.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(0, -h * 0.52, w * 0.72, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  if ((e.dotTimer || 0) > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const isPoison = e.dotColor === '#4ade80';
    ctx.fillStyle = isPoison ? 'rgba(74, 222, 128, 0.72)' : 'rgba(251, 146, 60, 0.78)';
    for (let k = 0; k < 3; k++) {
      const ox = Math.sin(t * 6 + k * 2.1 + e.id) * (w * 0.34);
      const oy = -h * (0.25 + ((t * 1.4 + k * 0.33) % 0.75));
      ctx.beginPath();
      ctx.arc(ox, oy, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 九幽冥主·烛阴专属太古尸仙紫金血煞光环
  if (e.profile.kind === 'boss_zhuyin') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const zg = ctx.createRadialGradient(0, -68, 8, 0, -68, 92 + Math.sin(t * 7) * 10);
    zg.addColorStop(0, 'rgba(244, 63, 94, 0.36)');
    zg.addColorStop(0.55, 'rgba(168, 85, 247, 0.2)');
    zg.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = zg;
    ctx.beginPath();
    ctx.arc(0, -68, 98, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 提灯冥火鬼专属引魂灯幽青辉光（仅限提灯鬼，不再误挂到书妖/夜叉身上！）
  if (e.profile.kind === 'lantern_ghost') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const isCharging = e.aiState === 'windup' || e.aiState === 'lunge_slash';
    const lx = e.facing * 26;
    const ly = -44;
    const rad = isCharging ? 48 : 34;
    const lg = ctx.createRadialGradient(lx, ly, 2, lx, ly, rad);
    lg.addColorStop(0, isCharging ? 'rgba(167, 243, 208, 0.82)' : 'rgba(94, 234, 212, 0.46)');
    lg.addColorStop(0.55, isCharging ? 'rgba(168, 85, 247, 0.34)' : 'rgba(45, 212, 191, 0.14)');
    lg.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(lx, ly, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 贴合怪物兵刃/凶眸的自然蓄势微闪（克制提示前摇，不刺眼）
  if (e.aiState === 'windup') {
    const isBeast = e.profile.kind === 'demon_wolf' || e.profile.kind === 'spirit_crow';
    const gx = isBeast ? e.facing * (w * 0.38) : -e.facing * (w * 0.28);
    const gy = isBeast ? -h * 0.62 : -h * 0.68;
    const glintCol = isBeast ? 'rgba(251, 146, 60,' : 'rgba(254, 240, 138,';
    const glintR = e.profile.isBoss ? Math.max(14, h * 0.16) : 12;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const rg = ctx.createRadialGradient(gx, gy, 1, gx, gy, glintR);
    rg.addColorStop(0, `${glintCol} 0.52)`);
    rg.addColorStop(0.5, `${glintCol} 0.16)`);
    rg.addColorStop(1, `${glintCol} 0)`);
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(gx, gy, glintR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 怪物近战出招极简水墨劈斩/突刺：杂兵克制一笔，妖王按四阶体型自适应挥砍尺度！
  if (e.aiState === 'lunge_slash') {
    const dur = Math.max(0.12, e.stateDuration || 0.24);
    const p = Math.max(0, Math.min(1, 1 - e.stateTimer / dur));
    const fade = Math.max(0.18, 1 - Math.max(0, p - 0.55) * 1.6);
    const kind = e.profile.kind;

    if (!e.profile.isBoss) {
      if (kind === 'paper_swordsman' || kind === 'demon_wolf' || kind === 'spirit_crow') {
        const tint =
          kind === 'demon_wolf' ? '#fdba74' : kind === 'spirit_crow' ? '#6ee7b7' : '#cbd5e1';
        drawPaintedVfxSprite(ctx, 'vfx_iaido_flash_cut', e.facing * 8, -h * 0.54, 68, 18, {
          rotation: e.facing * (-0.1 + p * 0.28),
          flipX: e.facing === -1,
          alpha: fade * 0.48,
          tintHex: tint,
          tintAlpha: 0.25,
          additive: false,
        });
      } else {
        const tint =
          kind === 'bronze_guard'
            ? '#d97706'
            : kind === 'lantern_ghost'
              ? '#5eead4'
              : kind === 'opera_puppet'
                ? '#fb7185'
                : kind === 'bell_gargoyle'
                  ? '#fde047'
                  : '#94a3b8';
        drawPaintedVfxSprite(ctx, 'vfx_slash_crescent', e.facing * 6, -h * 0.54, 74, 72, {
          rotation: e.facing * (-0.32 + p * 0.82),
          flipX: e.facing === -1,
          alpha: fade * 0.44,
          tintHex: tint,
          tintAlpha: 0.26,
          additive: false,
        });
      }
    } else {
      const heavyBoss =
        kind === 'boss_furnace_titan' ||
        kind === 'boss_colosseum_general' ||
        kind === 'boss_dragon_warden' ||
        kind === 'boss_zhuyin';
      const duelistBoss = kind === 'boss_pei_wuji' || kind === 'boss_xiao_duanshui';
      const vfxKey: AssetKey = heavyBoss
        ? 'vfx_slash_heavy_cleave'
        : duelistBoss
          ? 'vfx_iaido_flash_cut'
          : 'vfx_slash_crescent';
      const sw = duelistBoss ? Math.round(h * 1.85) : Math.round(h * 1.48);
      const sh = duelistBoss ? Math.round(h * 0.45) : Math.round(h * 1.42);
      const bossCol =
        kind === 'boss_xiao_duanshui' ? '#38bdf8' : e.profile.accentColor || '#dc2626';
      drawPaintedVfxSprite(ctx, vfxKey, e.facing * w * 0.32, -h * 0.56, sw, sh, {
        rotation: e.facing * (duelistBoss ? -0.14 + p * 0.34 : -0.36 + p * 0.9),
        flipX: e.facing === -1,
        alpha: fade * 0.72,
        tintHex: bossCol,
        tintAlpha: 0.42,
        additive: false,
      });
    }
  }

  // 纸人剑客横刀架挡姿态视觉提示：极简冰青竖锋微闪
  if (
    e.profile.kind === 'paper_swordsman' &&
    (e.guardStanceTimer || 0) > 0 &&
    e.aiState !== 'staggered'
  ) {
    drawPaintedVfxSprite(ctx, 'vfx_iaido_flash_cut', e.facing * 12, -h * 0.54, 44, 14, {
      rotation: Math.PI * 0.42 * e.facing,
      alpha: 0.45,
      tintHex: '#bae6fd',
      additive: false,
    });
  }

  // 小怪极简水墨残血细条 + 下方琥珀金架势韧性细槽！
  if (!e.profile.isBoss && (e.hp < e.maxHp || e.poise < e.maxPoise)) {
    const bw = 46;
    const by = -h * 1.52 - 10;
    ctx.fillStyle = 'rgba(5, 7, 12, 0.88)';
    ctx.fillRect(-bw * 0.5 - 1, by - 1, bw + 2, 8);
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(-bw * 0.5, by, bw * Math.max(0, e.hpTrail / e.maxHp), 3);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-bw * 0.5, by, bw * Math.max(0, e.hp / e.maxHp), 3);
    const poiseRatio = e.aiState === 'staggered' ? 0 : Math.max(0, Math.min(1, e.poise / Math.max(1, e.maxPoise)));
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-bw * 0.5, by + 4, bw * poiseRatio, 2);
  }

  if (e.aiState === 'staggered') {
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 12.5px "STKaiti", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ 破招失衡 ✦', 0, e.profile.isBoss ? -h * 1.22 - 16 : -h * 1.52 - 14);
  }

  ctx.restore();
}

/**
 * 绘制驻立在玄城古道与祠堂中的全身手绘动态 NPC（苏清晏 / 欧冶残·赤火砧 / 白掌柜·鬼市灯）
 * 彻底告别“空街无人物、只有圆框头像弹窗”！
 */
export function drawSceneNpc(
  ctx: CanvasRenderingContext2D,
  npc: SceneNpc,
  groundY: number,
  playerX: number,
  t: number
): void {
  const dist = Math.abs(playerX - npc.x);
  const facing: 1 | -1 = dist < 240 ? (playerX >= npc.x ? 1 : -1) : npc.defaultFacing;

  ctx.save();
  ctx.translate(npc.x, groundY);

  // 1. 专属场景陈设与环境光影（让 NPC 与大地严丝合缝融为一体）
  if (npc.id === 'ouye_can') {
    // 独臂铸剑师身旁跃动的赤火淬兵炉光晕
    const bx = -32;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const fg = ctx.createRadialGradient(bx, -26, 2, bx, -26, 52 + Math.sin(t * 11) * 5);
    fg.addColorStop(0, 'rgba(253, 224, 71, 0.45)');
    fg.addColorStop(0.5, 'rgba(249, 115, 22, 0.22)');
    fg.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(bx, -26, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (npc.id === 'bai_zhanggui') {
    // 白掌柜身下青冥灯影光晕
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const cg = ctx.createRadialGradient(facing * 26, -54, 3, facing * 26, -54, 62);
    cg.addColorStop(0, 'rgba(45, 212, 191, 0.34)');
    cg.addColorStop(0.55, 'rgba(56, 189, 248, 0.12)');
    cg.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(facing * 26, -54, 62, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 人物脚下羽化浓墨接地软影
  drawSoftGroundShadow(ctx, 0, 2, 26, 6.2, 0.56);

  // 2. 选择手绘全身序列帧并呼吸微动
  let frameKey: AssetKey = 'npc_su_0';
  if (npc.id === 'su_qingyan') {
    frameKey = t % 4.6 > 2.6 ? 'npc_su_1' : 'npc_su_0';
  } else if (npc.id === 'ouye_can') {
    frameKey = 'npc_ouye';
  } else {
    frameKey = 'npc_bai';
  }

  const img = Assets.get(frameKey);
  if (img) {
    const joints = buildEntitySpineJoints({
      key: `npc:${npc.id}:${npc.x}`,
      t,
      vx: 0,
      facing,
      isGracefulNpc: true,
    });
    ctx.save();
    ctx.scale(facing, 1);
    drawSkinnedSpineSprite(
      ctx,
      img,
      {
        canvasW: HERO_SPRITE_METRICS.canvasW,
        canvasH: HERO_SPRITE_METRICS.canvasH,
        anchorX: HERO_SPRITE_METRICS.anchorX,
        footY: HERO_SPRITE_METRICS.footY,
        scale: HERO_SPRITE_METRICS.baseScale,
      },
      joints
    );
    ctx.restore();
  }

  // 苏清晏指尖环绕的钦天监星芒灵尘（程序化微粒，灵动无框）
  if (npc.id === 'su_qingyan') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const a = t * 2.2 + i * 2.1;
      const sx = facing * 16 + Math.cos(a) * 14;
      const sy = -62 + Math.sin(a * 1.4) * 10;
      ctx.fillStyle = 'rgba(253, 224, 71, 0.72)';
      ctx.beginPath();
      ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 3. 靠近 NPC 时仅浮现极简姓名（移除累赘双行官职文字！）
  if (dist < 160) {
    ctx.globalAlpha = dist < 85 ? 0.95 : 0.65;
    ctx.textAlign = 'center';
    ctx.font = 'bold 12.5px "STKaiti", "KaiTi", serif';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
    ctx.fillText(npc.name, 1.1, -104.9);
    ctx.fillStyle = '#f6dc8d';
    ctx.fillText(npc.name, 0, -106);
  }

  ctx.restore();
}

/**
 * 经典《恶魔城：月下夜想曲》式精致单件战利品掉落渲染：
 * 彻底淘汰硕大笨重的 88px 剑坛/衣架！每把刀枪剑戟、衣袍重铠、虎符玉佩扳指皆以紧凑精巧真身形态翻滚落地！
 */
export function drawWorldDrop(
  ctx: CanvasRenderingContext2D,
  d: WorldDrop,
  t: number,
  playerX = -9999
): void {
  ctx.save();
  ctx.translate(d.x, d.y);

  const inAir = Math.abs(d.vy) > 16;
  const spin = d.spinAngle || 0;

  // 紧凑羽化贴地软阴影
  drawSoftGroundShadow(ctx, 0, 2, d.kind === 'ability' ? 22 : 14, 4.5, 0.52);

  const wpnDef = d.kind === 'weapon' && !d.itemId.startsWith('sub:') ? WEAPONS[d.itemId] : undefined;
  const auraHex = wpnDef
    ? wpnDef.glowColor
    : d.kind === 'yao_core'
      ? '#c084fc'
      : d.kind === 'consumable'
        ? '#4ade80'
        : d.kind === 'armor'
          ? '#38bdf8'
          : '#facc15';

  // 纤细内敛的器物灵韵微光（不再喧宾夺主放大成巨柱！）
  if (d.kind !== 'gold' && d.kind !== 'heart') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const rg = ctx.createRadialGradient(0, -16, 2, 0, -16, d.kind === 'ability' ? 28 : 20);
    rg.addColorStop(0, auraHex);
    rg.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.globalAlpha = d.kind === 'ability' ? 0.34 : 0.22;
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(0, -16, d.kind === 'ability' ? 28 : 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (d.kind === 'weapon') {
    ctx.save();
    ctx.translate(0, -18);
    if (d.itemId.startsWith('sub:')) {
      const subId = d.itemId.slice(4);
      ctx.rotate(inAir ? spin : Math.sin(t * 3 + d.x) * 0.06);
      if (subId === 'holy_fire' && Assets.get('item_sub_fire_gourd')) {
        ctx.drawImage(Assets.get('item_sub_fire_gourd')!, -14, -16, 28, 32);
      } else if (subId === 'bagua_cross' && Assets.get('item_sub_bagua')) {
        ctx.drawImage(Assets.get('item_sub_bagua')!, -16, -16, 32, 32);
      } else if (subId === 'mountain_seal' && Assets.get('item_sub_seal')) {
        ctx.drawImage(Assets.get('item_sub_seal')!, -15, -15, 30, 30);
      } else if (subId === 'sword_orbit' && Assets.get('fam_sword')) {
        const fs = Assets.get('fam_sword')!;
        for (let k = 0; k < 3; k++) {
          ctx.save();
          ctx.rotate((k * Math.PI * 2) / 3 + t * 2.2);
          ctx.drawImage(fs, -6, -18, 12, 24);
          ctx.restore();
        }
      } else if (Assets.get('part_wpn_daggers')) {
        ctx.rotate(-0.55);
        ctx.drawImage(Assets.get('part_wpn_daggers')!, -17, -6, 34, 12);
      }
    } else {
      const w = wpnDef || WEAPONS.sword_0;
      // 每把武器按自身独立手绘真容（22把独门兵刃1对1独立贴图）呈现，空中翻旋、落地斜倚！
      const restTilt = w.archetype === 'whip' || w.archetype === 'daggers' ? 0 : -0.62;
      ctx.rotate(inAir ? spin : restTilt);
      const len =
        w.archetype === 'spear'
          ? 56
          : w.archetype === 'greatsword'
            ? 52
            : w.archetype === 'whip'
              ? 64
              : w.archetype === 'daggers'
                ? 58
                : 48;
      if (w.archetype !== 'whip' && w.archetype !== 'daggers') {
        ctx.translate(-len * 0.26, 0);
      }
      drawCelShadedWeapon(ctx, w.archetype, w.id, len);
      // 寒锋流光星点
      const glint = 0.5 + 0.5 * Math.sin(t * 5.2 + d.x * 0.1);
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = w.glowColor;
      ctx.globalAlpha = 0.45 * glint;
      ctx.beginPath();
      ctx.arc(6, -2, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } else if (d.kind === 'armor') {
    // 每件防具与饰品拥有各自独立的小巧造型：叠放锦袍、明光护心胸甲、蟠龙古玉、错金虎符、血玉扳指、天师符、纳福金葫！
    let iconKey: AssetKey = 'item_drop_robe';
    let dim = 34;
    let rimColor = '';
    const id = d.itemId;
    if (id === 'mingguang_armor' || id === 'black_tortoise_mail') {
      iconKey = 'item_drop_cuirass';
      dim = 36;
      rimColor = id === 'mingguang_armor' ? '#fde047' : '#2dd4bf';
    } else if (id === 'tiger_tally') {
      iconKey = 'item_drop_tally';
      dim = 34;
    } else if (id === 'celestial_qi_ring') {
      iconKey = 'item_drop_ring';
      dim = 30;
    } else if (id === 'broken_jade' || id === 'greedy_wolf_jade' || id === 'wind_step_pendant') {
      iconKey = 'item_drop_jade';
      dim = 33;
      rimColor = id === 'greedy_wolf_jade' ? '#f43f5e' : id === 'wind_step_pendant' ? '#38bdf8' : '';
    } else if (id === 'mojin_talisman') {
      iconKey = 'item_talisman_scroll';
      dim = 32;
      rimColor = '#fde047';
    } else if (id === 'fortune_gourd' || id === 'qingxin_bell') {
      iconKey = 'item_celadon_gourd';
      dim = 32;
      rimColor = id === 'fortune_gourd' ? '#c084fc' : '#7dd3fc';
    } else {
      iconKey = 'item_drop_robe';
      dim = 35;
      rimColor =
        id === 'xuanniao_robe'
          ? '#fde047'
          : id === 'ink_scholar_robe'
            ? '#e2e8f0'
            : id === 'cloud_brocade'
              ? '#38bdf8'
              : '';
    }
    const armImg = Assets.get(iconKey);
    ctx.save();
    ctx.translate(0, -dim * 0.5 + 1);
    if (inAir) ctx.rotate(spin * 0.65);
    if (armImg) {
      const w = dim * (armImg.width / armImg.height);
      ctx.drawImage(armImg, -w * 0.5, -dim * 0.5, w, dim);
    }
    if (rimColor) {
      ctx.globalCompositeOperation = 'lighter';
      const ag = ctx.createRadialGradient(0, 0, 2, 0, 0, dim * 0.52);
      ag.addColorStop(0, rimColor);
      ag.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ag;
      ctx.globalAlpha = 0.28 + Math.sin(t * 4 + d.x) * 0.08;
      ctx.beginPath();
      ctx.arc(0, 0, dim * 0.52, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } else if (d.kind === 'skill_scroll') {
    const scrImg = Assets.get('item_drop_scroll');
    const floatY = -19 + Math.sin(t * 3.8 + d.x) * 2.5;
    if (scrImg) {
      ctx.drawImage(scrImg, -17, floatY - 17, 34, 34);
    }
  } else if (d.kind === 'ability') {
    // 镇司奇宝传承台：手绘古石传功莲座 + 悬浮秘宝真身！
    const pedImg = Assets.get('item_relic_pedestal');
    if (pedImg && pedImg.width && pedImg.height) {
      const pw = 36;
      const ph = Math.min(18, pw * (pedImg.height / pedImg.width));
      ctx.drawImage(pedImg, -pw * 0.5, -ph + 2, pw, ph);
    }

    const bobY = -26 + Math.sin(t * 3.6) * 3.2;
    const isFamiliarRelic = ALL_FAMILIAR_IDS.includes(d.itemId as FamiliarId);
    let abKey: AssetKey = 'item_drop_scroll';
    if (isFamiliarRelic) abKey = resolveFamiliarAssetKey(d.itemId as FamiliarId);
    else if (d.itemId === 'jade_pendant_full') abKey = 'item_drop_jade';
    else if (d.itemId === 'mirror_truth') abKey = 'item_sub_bagua';
    else if (d.itemId === 'mist_dash') abKey = 'item_talisman_scroll';
    else if (d.itemId === 'ground_slam') abKey = 'item_sub_seal';
    if (isFamiliarRelic) {
      const fDef = FAMILIARS[d.itemId as FamiliarId];
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const fg = ctx.createRadialGradient(0, bobY, 2, 0, bobY, 30);
      fg.addColorStop(0, fDef.auraRgba);
      fg.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(0, bobY, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    const abImg = Assets.get(abKey);
    if (abImg) {
      const h = isFamiliarRelic ? 44 : 36;
      const w = h * (abImg.width / abImg.height);
      ctx.drawImage(abImg, -w * 0.5, bobY - h * 0.5, w, h);
    }
  } else if (d.kind === 'consumable' || d.kind === 'max_up') {
    ctx.save();
    ctx.translate(0, -16);
    if (inAir) ctx.rotate(spin * 0.5);
    if (d.itemId === 'beggar_chicken') {
      const chkImg = Assets.get('item_lotus_chicken');
      if (chkImg) {
        const h = 30;
        const w = chkImg.width * (h / chkImg.height);
        ctx.drawImage(chkImg, -w * 0.5, -h * 0.5, w, h);
      }
    } else if (d.kind === 'max_up') {
      const coreImg = Assets.get('item_yao_core') || Assets.get('item_celadon_gourd');
      if (coreImg) {
        const h = 32;
        const w = coreImg.width * (h / coreImg.height);
        ctx.drawImage(coreImg, -w * 0.5, -h * 0.5, w, h);
      }
    } else {
      const gourdImg = Assets.get('item_celadon_gourd');
      if (gourdImg) {
        const h = 32;
        const w = gourdImg.width * (h / gourdImg.height);
        ctx.drawImage(gourdImg, -w * 0.5, -h * 0.5, w, h);
      }
    }
    ctx.restore();
  } else if (d.kind === 'yao_core') {
    const floatY = -18 + Math.sin(t * 4.5) * 3;
    const coreImg = Assets.get('item_yao_core');
    if (coreImg) {
      const h = 30;
      const w = coreImg.width * (h / coreImg.height);
      ctx.drawImage(coreImg, -w * 0.5, floatY - h * 0.5, w, h);
    }
  } else if (d.kind === 'gold') {
    // 纯手绘纹银元宝锭 (`item_silver_sycee.webp`)
    const syceeImg = Assets.get('item_silver_sycee');
    if (syceeImg) {
      const h = 22;
      const w = syceeImg.width * (h / syceeImg.height);
      ctx.drawImage(syceeImg, -w * 0.5, -h + 3, w, h);
    }
  } else {
    // 随风微颤的纯手绘朱砂灵符 (`item_talisman_scroll.webp`)
    const tilt = Math.sin(t * 5 + d.x) * 0.11;
    const talImg = Assets.get('item_talisman_scroll');
    if (talImg) {
      const h = 26;
      const w = talImg.width * (h / talImg.height);
      ctx.save();
      ctx.translate(0, -13);
      ctx.rotate(tilt);
      ctx.drawImage(talImg, -w * 0.5, -h * 0.5, w, h);
      ctx.restore();
    }
  }

  ctx.restore();
}
