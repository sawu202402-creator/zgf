import { WEAPONS } from '../data/itemsAndSkills';
import { SceneNpc } from '../data/worldMap';
import { WeaponArchetype, WeaponDef } from '../types';
import { AssetKey, Assets } from './AssetLoader';
import { ActiveSkillAnim, ActiveSlash, EnemyEntity, GameEngine, WorldDrop } from './GameEngine';
import { drawCelShadedWeapon } from './GuofengWorldArt';
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

  if (kind === 'boss_pei_wuji' || kind === 'boss_zhuyin') {
    if (e.aiState === 'windup') return 'boss_pei_1';
    if (e.aiState === 'lunge_slash') return 'boss_pei_2';
    return 'boss_pei_0';
  }

  if (kind === 'boss_thunder_yaksha') {
    if (e.aiState === 'windup') return 'boss_yk_1';
    if (e.aiState === 'lunge_slash') return 'boss_yk_2';
    return 'boss_yk_0';
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
  if (kind === 'blood_bat') return 'mob_bat';
  if (kind === 'bone_archer') return 'mob_bone_archer';

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

  // 0A. 五大真气绝学与奇门副器专属武道身姿序列帧！
  if (skillAnim) {
    const sp = skillAnim.progress;
    if (skillAnim.kind === 'shuofeng_wave') {
      if (isHeavy) return sp < 0.28 ? 'h18_modao_windup' : 'h18_modao_cleave';
      return sp < 0.28 ? 'h18_sword_0' : 'h18_sword_2';
    }
    if (skillAnim.kind === 'shunying_flash') {
      if (sp < 0.2) return 'h18_crouch';
      if (sp < 0.68) return isHeavy ? 'h18_modao_cleave' : 'h18_sword_2';
      return 'h18_idle_1';
    }
    if (skillAnim.kind === 'jinghong_rising') {
      if (sp < 0.16) return 'h18_crouch';
      return isHeavy ? 'h18_modao_windup' : 'h18_sword_1';
    }
    if (skillAnim.kind === 'taiji_parry') {
      return sp < 0.28 ? 'h18_sword_0' : 'h18_idle_1';
    }
    if (skillAnim.kind === 'jiuyou_soulsteal') {
      return sp < 0.28 ? 'h18_idle_1' : 'h18_sword_1';
    }
    if (skillAnim.kind === 'sub_throw') {
      return sp < 0.24 ? 'h18_sword_0' : 'h18_sword_2';
    }
  }

  // 0. 经典体术帧：贴地滑铲踢 (`↓ + 跃`) / 凌空下踢 (`二段跳后 ↓ + 跃`) / 下蹲低斩！
  if (sliding) return 'h18_slide';
  if (diveKicking) return 'h18_divekick';
  if (crouching && onGround) {
    if (slash && !isHeavy) return slash.progress > 0.35 ? 'h18_sword_2' : 'h18_crouch';
    return 'h18_crouch';
  }

  // 1. 挥兵斩击帧（五系神兵各自匹配抬手蓄势与破空出招身姿！）
  if (slash) {
    const pr = slash.progress;
    if (isHeavy) {
      return pr < 0.34 ? 'h18_modao_windup' : 'h18_modao_cleave';
    }
    if (slash.archetype === 'whip') {
      // 九节鞭：先高举右臂抖鞭蓄势 (`h18_sword_1`)，再振臂向前破空抽击 (`h18_sword_2`)！
      return pr < 0.24 ? 'h18_sword_1' : 'h18_sword_2';
    }
    if (slash.archetype === 'spear') {
      // 长枪：沉腰收枪蓄寸劲 (`h18_sword_0`)，再弓步挺枪怒刺 (`h18_sword_2`)！
      return pr < 0.24 ? 'h18_sword_0' : 'h18_sword_2';
    }
    if (slash.archetype === 'daggers') {
      // 双刺：左右手交替反握高举 (`h18_sword_1`) 与贴身双月疾刺 (`h18_sword_2` / `h18_sword_0`)！
      if (slash.comboStep % 2 === 1) {
        return pr < 0.32 ? 'h18_sword_1' : 'h18_sword_2';
      }
      return pr < 0.32 ? 'h18_sword_0' : 'h18_sword_2';
    }
    if (slash.pogoDown) {
      return 'h18_sword_2';
    }
    if (slash.comboStep === 1) {
      return pr < 0.28 ? 'h18_sword_1' : 'h18_sword_0';
    }
    if (slash.comboStep === 2) {
      return pr < 0.28 ? 'h18_sword_0' : 'h18_sword_1';
    }
    return pr < 0.24 ? 'h18_sword_0' : 'h18_sword_2';
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

  // 4. 地面站立待机（重剑扛肩豪迈站姿 / 轻剑少年侠客抱剑与剑指呼吸待机）
  if (isHeavy) {
    return 'h18_modao_idle';
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
  const len = wDef.tier === 3 ? 38 : wDef.tier === 2 ? 34 : 30;
  ctx.save();
  if (reverseGrip) {
    ctx.scale(-1, -1);
  }

  // 缠绳短柄与铜铸护手
  ctx.fillStyle = '#3f2e21';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.2;
  ctx.fillRect(-9, -2.2, 9, 4.4);
  ctx.strokeRect(-9, -2.2, 9, 4.4);

  ctx.fillStyle = wDef.tier === 3 ? '#f59e0b' : '#ca8a04';
  ctx.beginPath();
  ctx.moveTo(-1, -6.2);
  ctx.lineTo(3.5, -3.2);
  ctx.lineTo(3.5, 3.2);
  ctx.lineTo(-1, 6.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 弯月分水刃身（一阶寒铁翠芒 / 二阶幽冥紫刃或碧蟾毒芒 / 三阶残月赤金刃或鸳鸯追魂紫金刃）
  const bg = ctx.createLinearGradient(2, 0, len, -4);
  if (wDef.id === 'daggers_poison') {
    bg.addColorStop(0, '#064e3b');
    bg.addColorStop(0.55, '#10b981');
    bg.addColorStop(1, '#bbf7d0');
  } else if (wDef.id === 'daggers_phantom') {
    bg.addColorStop(0, '#3b0764');
    bg.addColorStop(0.55, '#c084fc');
    bg.addColorStop(1, '#fef08a');
  } else if (wDef.tier === 3) {
    bg.addColorStop(0, '#4c0519');
    bg.addColorStop(0.55, '#f43f5e');
    bg.addColorStop(1, '#fef08a');
  } else if (wDef.tier === 2) {
    bg.addColorStop(0, '#1e1b4b');
    bg.addColorStop(0.55, '#8b5cf6');
    bg.addColorStop(1, '#e9d5ff');
  } else {
    bg.addColorStop(0, '#334155');
    bg.addColorStop(0.55, '#94a3b8');
    bg.addColorStop(1, '#ecfdf5');
  }
  ctx.fillStyle = bg;
  ctx.strokeStyle = '#090d16';
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(2.5, -3.2);
  ctx.quadraticCurveTo(len * 0.56, -5.8, len, -4.6);
  ctx.quadraticCurveTo(len * 0.68, 3.8, 2.5, 2.8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 刃口寒芒血槽
  ctx.strokeStyle = wDef.glowColor;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(6, -1.2);
  ctx.quadraticCurveTo(len * 0.58, -2.6, len - 3, -3.6);
  ctx.stroke();

  ctx.restore();
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

  // 重刃系：跑动/跳跃/下蹲时双手空拳、重刃背负于背；站立/蓄力/劈斩时按品阶点亮巨刃神纹！
  if (wDef.archetype === 'greatsword') {
    if (
      wDef.tier >= 2 &&
      (frameKey === 'h18_modao_idle' ||
        frameKey === 'h18_modao_windup' ||
        frameKey === 'h18_modao_cleave')
    ) {
      const bladeSeg =
        frameKey === 'h18_modao_idle'
          ? { p0: [152, 86], p1: [84, 52] }
          : frameKey === 'h18_modao_windup'
            ? { p0: [154, 62], p1: [82, 26] }
            : { p0: [176, 158], p1: [246, 206] };
      const a = transformSpinePoint(bladeSeg.p0[0], bladeSeg.p0[1], metrics, joints);
      const b = transformSpinePoint(bladeSeg.p1[0], bladeSeg.p1[1], metrics, joints);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = wDef.glowColor || (wDef.tier === 3 ? 'rgba(253, 224, 71, 0.82)' : 'rgba(251, 146, 60, 0.78)');
      ctx.lineWidth = wDef.tier === 3 ? 4.4 : 3.2;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.restore();
    }
    return;
  }

  const sock = HERO_HAND_SOCKETS[frameKey];
  if (!sock) return;

  const rHand = transformSpinePoint(sock.rx, sock.ry, metrics, joints);
  const lHand =
    sock.lx !== undefined && sock.ly !== undefined
      ? transformSpinePoint(sock.lx, sock.ly, metrics, joints)
      : null;

  // 1. 分水峨眉双刺 / 幽冥鬼爪 / 阴阳残月刃：真正的左右双手持双刺，抬手即反握弯刃！
  if (wDef.archetype === 'daggers') {
    if (lHand && sock.lAngle !== undefined) {
      ctx.save();
      ctx.translate(lHand.x, lHand.y);
      ctx.rotate(sock.lAngle + lHand.angle);
      drawSingleCurvedDagger(ctx, wDef, frameKey === 'h18_idle_1');
      drawFistKnuckleClasp(ctx);
      ctx.restore();
    }
    ctx.save();
    ctx.translate(rHand.x, rHand.y);
    const rAng =
      slash && slash.pogoDown
        ? 1.22 + rHand.angle
        : sock.rAngle + rHand.angle + (frameKey === 'h18_sword_1' ? 0.35 : 0);
    ctx.rotate(rAng);
    drawSingleCurvedDagger(ctx, wDef, frameKey === 'h18_sword_1');
    drawFistKnuckleClasp(ctx);
    ctx.restore();
    return;
  }

  // 2. 白蜡点钢枪 / 寒星龙胆枪 / 破阵紫金霸王枪：全程持握红缨长枪，抬手蓄枪、弓步挺刺！
  if (wDef.archetype === 'spear') {
    const spImg = Assets.get('part_wpn_spear');
    if (!spImg) return;
    const spLen = wDef.tier === 3 ? 128 : wDef.tier === 2 ? 118 : 108;
    const spH = spLen * (spImg.height / spImg.width);

    ctx.save();
    if (slash) {
      const pr = slash.progress;
      const aimAng =
        (slash.pogoDown ? 1.15 : slash.aimY < -0.35 ? -0.46 : 0) + rHand.angle;
      if (pr < 0.24) {
        // 沉腰引枪蓄势阶段：枪身随双臂后撤蓄满寸劲！
        const cockBack = (pr / 0.24) * 10;
        ctx.translate(rHand.x - cockBack + 8, rHand.y + 3);
        ctx.rotate(aimAng - 0.05);
        ctx.drawImage(spImg, -spLen * 0.32, -spH * 0.5, spLen, spH);
      } else {
        // 挺枪破空怒刺阶段：长枪自前手拳心笔直刺出！
        const p = Math.min(1, (pr - 0.24) / 0.72);
        const thrust = Math.sin(p * Math.PI) * 26;
        ctx.translate(rHand.x + thrust, rHand.y);
        ctx.rotate(aimAng);
        ctx.drawImage(spImg, -spLen * 0.24, -spH * 0.5, spLen, spH);
      }
      if (wDef.tier >= 2) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = wDef.glowColor;
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.moveTo(spLen * 0.34, 0);
        ctx.lineTo(spLen * 0.74, 0);
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
      drawFistKnuckleClasp(ctx);
    } else if (
      skillAnim &&
      (skillAnim.kind === 'jinghong_rising' ||
        skillAnim.kind === 'shuofeng_wave' ||
        skillAnim.kind === 'shunying_flash')
    ) {
      // 长枪施展绝学：惊鸿升龙直刺苍穹，朔风/瞬影破空平刺！
      const skAng =
        skillAnim.kind === 'jinghong_rising'
          ? -1.28 + rHand.angle
          : rHand.angle;
      const thrust = skillAnim.progress > 0.2 ? 22 * Math.sin(skillAnim.progress * Math.PI) : -6;
      ctx.translate(rHand.x + thrust * Math.cos(skAng), rHand.y + thrust * Math.sin(skAng));
      ctx.rotate(skAng);
      ctx.drawImage(spImg, -spLen * 0.26, -spH * 0.5, spLen, spH);
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = skillAnim.color;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(spLen * 0.18, 0);
      ctx.lineTo(spLen * 0.78, 0);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
      drawFistKnuckleClasp(ctx);
    } else {
      // 待机 / 疾奔 / 腾跃 / 下蹲：斜提红缨长枪（枪锋斜扬不戳地，步态自然起伏）
      const carryAng =
        frameKey === 'h18_crouch'
          ? 0.04 + rHand.angle
          : -0.36 + rHand.angle + Math.sin(runCycle * 0.8) * 0.04;
      ctx.translate(rHand.x + 4, rHand.y - 2);
      ctx.rotate(carryAng);
      ctx.drawImage(spImg, -spLen * 0.34, -spH * 0.5, spLen, spH);
      if (wDef.tier >= 2) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = wDef.glowColor;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(spLen * 0.28, 0);
        ctx.lineTo(spLen * 0.64, 0);
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
      drawFistKnuckleClasp(ctx);
    }
    ctx.restore();
    return;
  }

  // 3. 乌金九节鞭 / 缚魂赤铜锁链刀 / 赤练火龙软鞭 / 紫电雷音打神鞭：高举抖鞭蓄势 ➔ 振臂甩链！
  if (wDef.archetype === 'whip') {
    const rodCol =
      wDef.id === 'whip_fire'
        ? '#991b1b'
        : wDef.tier === 3
          ? '#581c87'
          : wDef.tier === 2
            ? '#7c2d12'
            : '#1e293b';
    const ringCol =
      wDef.id === 'whip_fire'
        ? '#fb923c'
        : wDef.tier === 3
          ? '#fde047'
          : wDef.tier === 2
            ? '#fb923c'
            : '#eab308';

    ctx.save();
    ctx.translate(rHand.x, rHand.y);

    if (slash) {
      const pr = slash.progress;
      if (pr < 0.24) {
        // 抬手高举抖鞭 (`h18_sword_1`)：右拳高举鞭柄，九节铁链在头顶身后挽出蓄力S形鞭弧！
        const u = pr / 0.24;
        ctx.rotate(-2.15 + rHand.angle + u * 0.45);
        // 鞭柄与红缨尾穗
        ctx.fillStyle = '#3f2e21';
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 1.2;
        ctx.fillRect(-6, -2.4, 17, 4.8);
        ctx.strokeRect(-6, -2.4, 17, 4.8);

        // 头顶蓄势抖动的九节铁链弧与弯月镰首
        ctx.strokeStyle = rodCol;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(11, 0);
        let lx = 11;
        let ly = 0;
        for (let seg = 1; seg <= 7; seg++) {
          const s = seg / 7;
          lx = 11 + s * 46;
          ly = Math.sin(s * Math.PI * 1.35 - u * 2.2) * 18;
          ctx.lineTo(lx, ly);
        }
        ctx.stroke();

        ctx.strokeStyle = ringCol;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // 鞭梢弯钩血刃
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(lx + 4, ly, 4.2, -0.8, 1.9);
        ctx.lineTo(lx, ly);
        ctx.closePath();
        ctx.fill();
      } else {
        // 振臂向前抽鞭 (`h18_sword_2`)：掌中紧握鞭柄与红缨，无缝衔接破空九节长链！
        const aimAng =
          (slash.aimY < -0.35 ? -0.62 : slash.aimY > 0.35 ? 0.38 : 0) + rHand.angle;
        ctx.rotate(aimAng);
        ctx.fillStyle = '#3f2e21';
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 1.2;
        ctx.fillRect(-7, -2.5, 19, 5);
        ctx.strokeRect(-7, -2.5, 19, 5);
        ctx.fillStyle = ringCol;
        ctx.fillRect(9, -3, 3.5, 6);
      }
      drawFistKnuckleClasp(ctx);
    } else {
      // 平时收鞭持握：右手握乌金鞭柄，两圈九节铁链自然垂挂于手侧随步伐轻晃！
      const sway = Math.sin(animTime * 3.6 + runCycle * 0.9) * 0.08;
      ctx.rotate(0.32 + rHand.angle + sway);
      ctx.fillStyle = '#3f2e21';
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 1.2;
      ctx.fillRect(-6, -2.3, 18, 4.6);
      ctx.strokeRect(-6, -2.3, 18, 4.6);

      // 盘挂手侧的九节铁链线圈
      ctx.strokeStyle = rodCol;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.ellipse(9, 9, 8.5, 11, 0.25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = ringCol;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 朱红鞭穗
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.quadraticCurveTo(-12, 5, -14, 11);
      ctx.stroke();
      drawFistKnuckleClasp(ctx);
    }
    ctx.restore();
    return;
  }

  // 4. 轻剑系（青竹寒铁剑 / 墨渊秋水剑 / 七星龙渊剑）：按品阶实时切换剑长、护手与剑脊星芒！
  const swImg = Assets.get('part_wpn_sword');
  if (!swImg) return;
  const swLen = wDef.tier === 3 ? 80 : wDef.tier === 2 ? 72 : 64;
  const swH = swLen * (swImg.height / swImg.width);

  ctx.save();
  ctx.translate(rHand.x, rHand.y);
  let swAng =
    slash && slash.pogoDown ? 1.18 + rHand.angle : sock.rAngle + rHand.angle;
  if (skillAnim) {
    if (skillAnim.kind === 'jinghong_rising' && skillAnim.progress >= 0.16) {
      // 惊鸿升龙破：右手擎剑直指九霄！
      swAng = -1.36 + rHand.angle;
    } else if (skillAnim.kind === 'jiuyou_soulsteal' && skillAnim.progress >= 0.28) {
      // 九幽噬魂引：立剑祭印！
      swAng = -1.55 + rHand.angle;
    }
  }
  ctx.rotate(swAng);

  // 剑柄红绸/翠绸剑穗
  ctx.strokeStyle = wDef.tier === 3 ? '#f59e0b' : wDef.tier === 2 ? '#0284c7' : '#b91c1c';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-swLen * 0.14, 0);
  ctx.quadraticCurveTo(-swLen * 0.22, 5, -swLen * 0.26, 10);
  ctx.stroke();

  ctx.drawImage(swImg, -swLen * 0.14, -swH * 0.5, swLen, swH);

  // 二阶/三阶与秘藏神剑异象（寒魄冰芒 / 泣血赤霄 / 七星北斗 / 青莲千影翠星！）
  if (wDef.tier === 2) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = wDef.glowColor || 'rgba(56, 189, 248, 0.85)';
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(swLen * 0.14, 0);
    ctx.lineTo(swLen * 0.82, 0);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  } else if (wDef.tier === 3) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = wDef.glowColor || 'rgba(253, 224, 71, 0.9)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(swLen * 0.12, 0);
    ctx.lineTo(swLen * 0.86, 0);
    ctx.stroke();
    ctx.fillStyle = wDef.id === 'sword_phantom' ? '#d1fae5' : wDef.id === 'sword_blood' ? '#fecaca' : '#fef9c3';
    for (let st = 0; st < 5; st++) {
      ctx.beginPath();
      ctx.arc(swLen * (0.22 + st * 0.13), st % 2 === 0 ? -0.9 : 0.9, 1.35, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  drawFistKnuckleClasp(ctx);
  ctx.restore();
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
  ctx.translate(-8 + chestDx, -50 + chestDy);
  ctx.rotate(-2.32 + chestAngle);
  ctx.globalAlpha = 0.94;
  drawCelShadedWeapon(ctx, archetype, weaponId, archetype === 'greatsword' ? 86 : 72);
  ctx.restore();
}

/**
 * 18岁少年李逸承 60fps 2D Spine 骨骼网格蒙皮渲染器（同时驱动局内实机战斗与【兵匣】动态试剑台！）
 */
export function renderModularLiYichengRig(
  ctx: CanvasRenderingContext2D,
  opts: HeroRenderState
): void {
  const wDef = WEAPONS[opts.equippedWeaponId] || WEAPONS.sword_1;
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

  // 接地浓墨阴影
  if (opts.onGround) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 24, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
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
    (!opts.onGround || speedRatio > 0.12);
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
    if (secW) {
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

  // 斩马陌刀举刀过顶蓄力阶段：随上身拧腰后仰同步偏移赤金烈焰罡气！
  if (isHeavy && opts.slash && opts.slash.progress < 0.34) {
    const charge = opts.slash.progress / 0.34;
    const gx = -8 + joints[1].dx;
    const gy = -96 + joints[1].dy;
    const glow = ctx.createRadialGradient(gx, gy, 3, gx, gy, 44 * charge + 12);
    glow.addColorStop(0, `rgba(253, 224, 71, ${0.45 * charge})`);
    glow.addColorStop(0.55, `rgba(249, 115, 22, ${0.28 * charge})`);
    glow.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(gx, gy, 56, 0, Math.PI * 2);
    ctx.fill();
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

  const secondaryId = s.ownedWeapons.find((id) => id !== s.equippedWeapon);

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
 * 渲染致敬《恶魔城：月下夜想曲》剑魔系统的随身使魔 —— 【青冥剑灵 (`fam_sword.webp`)】！
 */
export function drawSwordFamiliar(
  ctx: CanvasRenderingContext2D,
  engine: GameEngine,
  t: number
): void {
  if (!engine.hasAbility('familiar_sword')) return;
  const fam = engine.familiar;
  const img = Assets.get('fam_sword');
  if (!img) return;

  ctx.save();
  ctx.translate(fam.x, fam.y);

  // 剑灵青冥护主光晕
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const fg = ctx.createRadialGradient(0, 0, 2, 0, 0, 34);
  fg.addColorStop(0, 'rgba(125, 211, 252, 0.45)');
  fg.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.arc(0, 0, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.scale(fam.facing, 1);
  const tilt = fam.swoopTimer > 0 ? 0.55 : Math.sin(t * 3.8) * 0.1;
  ctx.rotate(tilt);
  const h = 58;
  const w = img.width * (h / img.height);
  ctx.drawImage(img, -w * 0.5, -h * 0.5, w, h);
  ctx.restore();

  if (fam.calloutTimer > 0 && fam.calloutText) {
    ctx.font = 'bold 11.5px "STKaiti", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
    ctx.fillText(fam.calloutText, 1, -35);
    ctx.fillStyle = '#7dd3fc';
    ctx.fillText(fam.calloutText, 0, -36);
  }

  ctx.restore();
}

/**
 * 流体分段水墨飞白 + 叠加态流光剑气刀罡（0贴图感：尾部渐隐消散、中段发光透景、多缕飞白丝线、刀尖破空星芒！）
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
  if (fadeAlpha <= 0.02 || Math.abs(endAng - startAng) < 0.05) return;
  const segs = 18;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(facing, flipVert ? -1 : 1);

  // 1. 分段渐隐水墨气痕底衬（从尾端0透明度平滑过渡到锋端浓墨，彻底消除死板纯色块！）
  for (let i = 0; i < segs; i++) {
    const u0 = i / segs;
    const u1 = (i + 1) / segs;
    const a0 = startAng + (endAng - startAng) * u0;
    const a1 = startAng + (endAng - startAng) * u1;
    const w0 = Math.sin(u0 * Math.PI);
    const w1 = Math.sin(u1 * Math.PI);
    // 沿挥砍方向尾部迅速消散，头部凝聚
    const segAlpha = fadeAlpha * Math.pow(u1, 1.45) * 0.58;
    if (segAlpha < 0.015) continue;

    const rOut0 = radius + 5 * w0;
    const rOut1 = radius + 5 * w1;
    const rIn0 = radius - (thickness + 8) * Math.pow(w0, 0.72);
    const rIn1 = radius - (thickness + 8) * Math.pow(w1, 0.72);

    ctx.globalAlpha = segAlpha;
    ctx.fillStyle = '#050811';
    ctx.beginPath();
    ctx.moveTo(Math.cos(a0) * rOut0, Math.sin(a0) * rOut0 * 0.86);
    ctx.lineTo(Math.cos(a1) * rOut1, Math.sin(a1) * rOut1 * 0.86);
    ctx.lineTo(Math.cos(a1) * rIn1, Math.sin(a1) * rIn1 * 0.86);
    ctx.lineTo(Math.cos(a0) * rIn0, Math.sin(a0) * rIn0 * 0.86);
    ctx.closePath();
    ctx.fill();
  }

  // 2. 叠加态（lighter）真气发光刃流：透出背景光影，绝不遮盖成贴纸！
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 1; i < segs; i++) {
    const u0 = i / segs;
    const u1 = (i + 1) / segs;
    const a0 = startAng + (endAng - startAng) * u0;
    const a1 = startAng + (endAng - startAng) * u1;
    const w0 = Math.sin(u0 * Math.PI);
    const w1 = Math.sin(u1 * Math.PI);
    const glowAlpha = fadeAlpha * Math.pow(u1, 1.75) * 0.68;
    if (glowAlpha < 0.015) continue;

    const rOut0 = radius + 1.5 * w0;
    const rOut1 = radius + 1.5 * w1;
    const rIn0 = radius - thickness * 0.82 * w0;
    const rIn1 = radius - thickness * 0.82 * w1;

    ctx.globalAlpha = glowAlpha;
    ctx.fillStyle = coreColor;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a0) * rOut0, Math.sin(a0) * rOut0 * 0.86);
    ctx.lineTo(Math.cos(a1) * rOut1, Math.sin(a1) * rOut1 * 0.86);
    ctx.lineTo(Math.cos(a1) * rIn1, Math.sin(a1) * rIn1 * 0.86);
    ctx.lineTo(Math.cos(a0) * rIn0, Math.sin(a0) * rIn0 * 0.86);
    ctx.closePath();
    ctx.fill();
  }

  // 3. 多缕书法枯笔飞白剑丝（4道错落弧线营造高速撕裂空气感！）
  const filaments = [
    { rMul: 1.03, uStart: 0.28, uEnd: 1.0, width: 2.2, col: '#ffffff', al: 0.92 },
    { rMul: 0.95, uStart: 0.14, uEnd: 0.96, width: 1.5, col: coreColor, al: 0.78 },
    { rMul: 0.85, uStart: 0.35, uEnd: 0.92, width: 1.1, col: '#f8fafc', al: 0.55 },
    { rMul: 0.74, uStart: 0.22, uEnd: 0.82, width: 0.9, col: coreColor, al: 0.42 },
  ];
  ctx.lineCap = 'round';
  for (const fl of filaments) {
    ctx.globalAlpha = fadeAlpha * fl.al;
    ctx.strokeStyle = fl.col;
    ctx.lineWidth = fl.width;
    ctx.beginPath();
    const fSteps = 12;
    for (let j = 0; j <= fSteps; j++) {
      const u = fl.uStart + (fl.uEnd - fl.uStart) * (j / fSteps);
      const a = startAng + (endAng - startAng) * u;
      const r = radius * fl.rMul;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r * 0.86;
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // 4. 刀尖破空十字寒芒与尾迹碎星
  const tipX = Math.cos(endAng) * (radius + 1);
  const tipY = Math.sin(endAng) * (radius + 1) * 0.86;
  ctx.globalAlpha = fadeAlpha * 0.9;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(tipX - 9, tipY);
  ctx.lineTo(tipX + 9, tipY);
  ctx.moveTo(tipX, tipY - 9);
  ctx.lineTo(tipX, tipY + 9);
  ctx.stroke();

  ctx.restore();
}

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
    ctx.fillStyle = 'rgba(0, 0, 0, 0.54)';
    ctx.beginPath();
    ctx.ellipse(0, 2, w * 0.65, 5.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 破土阴兵钻出地面时的翻卷泥石土堆遮罩
  if (emergeProg > 0) {
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.ellipse(0, 2, w * 0.78, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.rect(-120, -220, 240, 223);
    ctx.clip();
  }

  if (img) {
    const sc =
      e.profile.kind === 'boss_zhuyin'
        ? 0.72
        : e.profile.kind === 'boss_xiao_duanshui'
          ? 0.56
          : e.profile.isBoss
            ? 0.62
            : e.profile.kind === 'demon_wolf'
              ? 0.55
              : e.profile.kind === 'bronze_guard'
                ? 0.54
                : e.profile.kind === 'blood_bat'
                  ? 0.46
                  : 0.52;

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
      // 血翼夜蝠潜伏期：倒挂于古梁屋檐之下蓄势待发！
      ctx.translate(0, -28);
      ctx.scale(e.facing * 0.88, -0.88);
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

    // 怪物专属器物常驻与施法/蓄势特效：各司其职，绝不混用！
    if (e.profile.shieldedFront) {
      if (e.aiState === 'stalk' && castProg <= 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(251, 191, 36, ${0.38 + Math.sin(t * 5 + e.id) * 0.1})`;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        const sAng = e.facing === 1 ? -0.68 : Math.PI - 0.68;
        ctx.arc(0, -h * 0.52, w * 0.56, sAng, sAng + 1.36);
        ctx.stroke();
        ctx.restore();
      } else if (e.aiState === 'windup') {
        // 玄甲重盾傀儡高举重铜战戟过顶蓄势琥珀罡气
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const gx = -e.facing * 12;
        const gy = -h * 0.96;
        const rg = ctx.createRadialGradient(gx, gy, 2, gx, gy, 34);
        rg.addColorStop(0, 'rgba(254, 240, 138, 0.72)');
        rg.addColorStop(0.55, 'rgba(245, 158, 11, 0.35)');
        rg.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(gx, gy, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (castProg > 0) {
        // 掷出回旋重铜战斧脱手金环
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(251, 191, 36, ${castProg * 0.85})`;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(e.facing * 22, -54, 18 * (1.25 - castProg * 0.4), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    } else if (kind === 'paper_swordsman' && e.aiState === 'windup') {
      // 剪纸刀客：按柄压身居合蓄势冰青寒星 + 飞旋白纸符屑
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const gx = -e.facing * 14;
      const gy = -h * 0.46;
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(gx - 16, gy);
      ctx.lineTo(gx + 16, gy);
      ctx.moveTo(gx, gy - 10);
      ctx.lineTo(gx, gy + 10);
      ctx.stroke();
      for (let pIdx = 0; pIdx < 2; pIdx++) {
        const pa = t * 8 + pIdx * Math.PI + e.id;
        ctx.fillStyle = 'rgba(224, 242, 254, 0.8)';
        ctx.fillRect(
          gx + Math.cos(pa) * 16 - 2.5,
          gy + Math.sin(pa) * 9 - 4,
          5,
          8
        );
      }
      ctx.restore();
    } else if (kind === 'opera_puppet') {
      // 梨园提线木偶：悬丝傀儡红线（出招/掷针瞬间傀儡丝猛然绷紧泛起赤金流光！）
      const taut = e.aiState === 'windup' || e.aiState === 'lunge_slash' || castProg > 0;
      ctx.save();
      ctx.strokeStyle = taut ? 'rgba(251, 113, 133, 0.72)' : 'rgba(244, 63, 94, 0.3)';
      ctx.lineWidth = taut ? 1.5 : 1.0;
      for (const ox of [-12, 0, 12]) {
        ctx.beginPath();
        ctx.moveTo(ox, -h * 0.76);
        ctx.lineTo(ox + (taut ? 0 : Math.sin(t * 2.5 + ox) * 4), -h - 82);
        ctx.stroke();
      }
      if (castProg > 0) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(244, 114, 182, ${castProg * 0.9})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(e.facing * 18, -38, 16 * (1.2 - castProg * 0.35), -0.9, 0.9);
        ctx.stroke();
      }
      ctx.restore();
    } else if (kind === 'scroll_demon') {
      // 飞天书妖：环绕书页的朱砂灵符微页 + 吐符瞬间朱砂敕令法阵
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let sIdx = 0; sIdx < 2; sIdx++) {
        const sa = t * 3.6 + sIdx * Math.PI + e.id;
        const sx = Math.cos(sa) * 24;
        const sy = -30 + Math.sin(sa * 1.4) * 9;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(sa * 0.6);
        ctx.fillStyle = 'rgba(254, 240, 138, 0.72)';
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.lineWidth = 1;
        ctx.fillRect(-3, -5.5, 6, 11);
        ctx.strokeRect(-3, -5.5, 6, 11);
        ctx.restore();
      }
      if (castProg > 0) {
        const cx = e.facing * 20;
        const cy = -26;
        ctx.strokeStyle = `rgba(239, 68, 68, ${castProg * 0.92})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(cx, cy, 18 * (1.3 - castProg * 0.4), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    } else if (kind === 'bell_gargoyle') {
      // 飞天夜叉：双翼与钢叉跃动金雷电弧 + 掷叉雷音震环
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      if (castProg > 0 || e.aiState === 'windup') {
        const cx = e.facing * 20;
        const cy = -30;
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(cx, cy, 20 * (1.2 - castProg * 0.3), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.68)';
      ctx.lineWidth = 1.5;
      const la = t * 18 + e.id;
      ctx.beginPath();
      ctx.moveTo(e.facing * 8, -36);
      ctx.lineTo(e.facing * 16 + Math.sin(la) * 5, -28);
      ctx.lineTo(e.facing * 24, -34 + Math.cos(la) * 4);
      ctx.stroke();
      ctx.restore();
    } else if (kind === 'plague_toad' && (Math.abs(e.vy) > 25 || castProg > 0)) {
      // 毒沼金蟾：腾跃扑击与喷毒瞬间咽喉鼓荡碧紫毒雾泡
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const pg = ctx.createRadialGradient(e.facing * 14, -20, 2, e.facing * 14, -20, 26);
      pg.addColorStop(0, 'rgba(74, 222, 128, 0.72)');
      pg.addColorStop(0.58, 'rgba(168, 85, 247, 0.45)');
      pg.addColorStop(1, 'rgba(88, 28, 135, 0)');
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(e.facing * 14, -20, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
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

  // 摒弃容易出戏的UI矢量【危】字弹窗：改为贴合怪物兵刃/凶眸的自然蓄势寒光微闪（配合 Spine 后仰蓄力姿态传达前摇！）
  if (e.aiState === 'windup') {
    const isBeast = e.profile.kind === 'demon_wolf' || e.profile.kind === 'blood_bat';
    const gx = isBeast ? e.facing * (w * 0.38) : -e.facing * (w * 0.28);
    const gy = isBeast ? -h * 0.62 : -h * 0.68;
    const glintCol = isBeast ? 'rgba(251, 146, 60,' : 'rgba(254, 240, 138,';
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const rg = ctx.createRadialGradient(gx, gy, 1, gx, gy, 18);
    rg.addColorStop(0, `${glintCol} 0.78)`);
    rg.addColorStop(0.5, `${glintCol} 0.25)`);
    rg.addColorStop(1, `${glintCol} 0)`);
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(gx, gy, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 怪物近战出招差异化动态武器/元素特效（按挥击进度实时推进，彻底淘汰千篇一律静态红弧！）
  if (e.aiState === 'lunge_slash') {
    const dur = Math.max(0.12, e.stateDuration || 0.24);
    const p = Math.max(0, Math.min(1, 1 - e.stateTimer / dur));
    const fade = Math.max(0.18, 1 - Math.max(0, p - 0.55) * 1.6);
    const kind = e.profile.kind;

    if (kind === 'demon_wolf') {
      // 玄甲镇狱苍狼：飞扑撕裂三道赤金狼爪血痕！
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let c = -1; c <= 1; c++) {
        const yOff = -h * 0.52 + c * 9;
        ctx.strokeStyle = c === 0 ? `rgba(254, 240, 138, ${fade * 0.95})` : `rgba(249, 115, 22, ${fade * 0.85})`;
        ctx.lineWidth = c === 0 ? 3.4 : 2.4;
        ctx.beginPath();
        ctx.moveTo(e.facing * 4, yOff - 10);
        ctx.quadraticCurveTo(e.facing * 36, yOff - 2, e.facing * (66 * Math.min(1, p * 1.5)), yOff + 12);
        ctx.stroke();
      }
      ctx.restore();
    } else if (kind === 'corpse_soldier') {
      // 破土荒冢阴兵：锈蚀残戟沉重暗红劈斩！
      const sAng = -1.55 + p * 0.35;
      const eAng = -1.15 + Math.min(1, p * 1.4) * 2.25;
      drawInkSlashRibbon(ctx, e.facing * 6, -h * 0.54, e.facing, false, 74, 18, sAng, eAng, '#b91c1c', fade);
    } else if (kind === 'blood_bat') {
      // 血翼夜蝠妖：俯冲掠袭猩红血牙残弧
      const sAng = -0.95 + p * 0.28;
      const eAng = -0.62 + Math.min(1, p * 1.45) * 1.65;
      drawInkSlashRibbon(ctx, e.facing * 6, -h * 0.5, e.facing, false, 58, 13, sAng, eAng, '#e11d48', fade);
    } else if (kind === 'paper_swordsman') {
      // 剪纸刀客：极速冰青居合一字拔刀闪 + 飞舞白纸符片
      const sAng = -0.52 + p * 0.18;
      const eAng = -0.36 + Math.min(1, p * 1.45) * 1.12;
      drawInkSlashRibbon(ctx, e.facing * 8, -h * 0.54, e.facing, false, 84, 15, sAng, eAng, '#38bdf8', fade);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const beamLen = 92 * Math.min(1, p * 1.6);
      const bg = ctx.createLinearGradient(-16 * e.facing, -h * 0.52, e.facing * beamLen, -h * 0.52);
      bg.addColorStop(0, 'rgba(56, 189, 248, 0)');
      bg.addColorStop(0.55, `rgba(186, 230, 253, ${fade * 0.85})`);
      bg.addColorStop(1, `rgba(255, 255, 255, ${fade * 0.98})`);
      ctx.strokeStyle = bg;
      ctx.lineWidth = 4.2 * (1 - p * 0.45);
      ctx.beginPath();
      ctx.moveTo(-14 * e.facing, -h * 0.52);
      ctx.lineTo(e.facing * beamLen, -h * 0.52);
      ctx.stroke();
      // 拔刀切碎飘散的剪纸残片
      for (let k = 0; k < 3; k++) {
        const px = e.facing * (18 + k * 22 + p * 18);
        const py = -h * 0.52 + Math.sin(t * 20 + k * 2.1) * 10;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(p * 3 + k);
        ctx.fillStyle = `rgba(241, 245, 249, ${fade * 0.82})`;
        ctx.fillRect(-3.5, -2, 7, 4);
        ctx.restore();
      }
      ctx.restore();
    } else if (kind === 'bronze_guard') {
      // 玄甲重盾傀儡：千钧重铜战戟自头顶轰然砸地（动态琥珀金铁巨弧 + 裂地冲击金环）
      const sAng = -1.78 + p * 0.35;
      const eAng = -1.42 + Math.min(1, p * 1.38) * 2.48;
      drawInkSlashRibbon(ctx, 0, -h * 0.58, e.facing, false, 84, 24, sAng, eAng, '#f59e0b', fade);
      if (p > 0.4) {
        const slamP = (p - 0.4) / 0.6;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(251, 191, 36, ${(1 - slamP) * 0.88})`;
        ctx.lineWidth = 3.2 * (1 - slamP * 0.6);
        ctx.beginPath();
        ctx.ellipse(e.facing * 52, -2, 14 + slamP * 34, 4 + slamP * 7, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    } else if (kind === 'lantern_ghost') {
      // 提灯冥火鬼：引魂灯迸发幽青冥火旋涡 + 4团游魂鬼火球（彻底告别违和红刀光！）
      const sAng = -1.65 + p * 0.55;
      const eAng = -1.2 + Math.min(1, p * 1.4) * 2.75;
      drawInkSlashRibbon(ctx, e.facing * 10, -h * 0.58, e.facing, false, 72, 20, sAng, eAng, '#2dd4bf', fade);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let wIdx = 0; wIdx < 4; wIdx++) {
        const wa = t * 14 + wIdx * (Math.PI * 0.5) + p * 2.4;
        const wr = 28 + p * 38;
        const wx = e.facing * 12 + Math.cos(wa) * wr;
        const wy = -h * 0.58 + Math.sin(wa) * (wr * 0.62);
        const wg = ctx.createRadialGradient(wx, wy, 1, wx, wy, 11);
        wg.addColorStop(0, `rgba(204, 251, 241, ${fade * 0.95})`);
        wg.addColorStop(0.55, wIdx % 2 === 0 ? `rgba(45, 212, 191, ${fade * 0.72})` : `rgba(168, 85, 247, ${fade * 0.68})`);
        wg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = wg;
        ctx.beginPath();
        ctx.arc(wx, wy, 11, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (kind === 'opera_puppet') {
      // 梨园提线木偶：双袖红绸金芒十字交叉刃舞！
      const sAng = -1.35 + p * 0.35;
      const eAng = -0.95 + Math.min(1, p * 1.42) * 2.15;
      drawInkSlashRibbon(ctx, e.facing * 6, -h * 0.6, e.facing, false, 74, 16, sAng, eAng, '#f43f5e', fade);
      drawInkSlashRibbon(ctx, e.facing * 10, -h * 0.56, e.facing, true, 68, 13, sAng - 0.15, eAng - 0.1, '#fbbf24', fade * 0.86);
    } else if (kind === 'bell_gargoyle') {
      // 飞天夜叉：雷音钢叉电芒俯冲刺击
      const sAng = -1.25 + p * 0.32;
      const eAng = -0.88 + Math.min(1, p * 1.4) * 1.95;
      drawInkSlashRibbon(ctx, e.facing * 8, -h * 0.58, e.facing, false, 78, 18, sAng, eAng, '#facc15', fade);
    } else if (kind === 'boss_xiao_duanshui') {
      // 镇妖少统领·萧断水：破军龙胆银紫枪芒贯空突刺 + 护身枪花
      const sAng = -0.85 + p * 0.25;
      const eAng = -0.55 + Math.min(1, p * 1.4) * 1.45;
      drawInkSlashRibbon(ctx, e.facing * 10, -h * 0.58, e.facing, false, 106, 22, sAng, eAng, '#38bdf8', fade);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(224, 242, 254, ${fade * 0.92})`;
      ctx.lineWidth = 4.5 * (1 - p * 0.4);
      ctx.beginPath();
      ctx.moveTo(-10 * e.facing, -h * 0.56);
      ctx.lineTo(e.facing * (118 * Math.min(1, p * 1.5)), -h * 0.56);
      ctx.stroke();
      ctx.restore();
    } else {
      // 各区域守关妖王：按自身本命妖气色彩实时挥展霸道水墨刀罡！
      const sAng = -1.45 + p * 0.38;
      const eAng = -1.05 + Math.min(1, p * 1.38) * 2.28;
      const bossCol = e.profile.accentColor || '#dc2626';
      drawInkSlashRibbon(
        ctx,
        0,
        -h * 0.62,
        e.facing,
        false,
        e.profile.isBoss ? 106 : 76,
        e.profile.isBoss ? 27 : 18,
        sAng,
        eAng,
        bossCol,
        fade
      );
    }
  }

  // 纸人剑客横刀架挡姿态视觉提示：身前泛起凛冽银青护身刀芒弧（提醒少侠绕背、跳劈或重斩破架！）
  if (
    e.profile.kind === 'paper_swordsman' &&
    (e.guardStanceTimer || 0) > 0 &&
    e.aiState !== 'staggered'
  ) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.92)';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(
      e.facing * 12,
      -h * 0.56,
      26,
      e.facing === 1 ? -0.95 : Math.PI - 0.95,
      e.facing === 1 ? 0.95 : Math.PI + 0.95
    );
    ctx.stroke();
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(e.facing * 18, -h * 0.82);
    ctx.lineTo(e.facing * 24, -h * 0.28);
    ctx.stroke();
    ctx.restore();
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
    ctx.fillText('✦ 破招失衡 ✦', 0, -h * 1.52 - 14);
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

  // 人物脚下接触浓墨接地影
  ctx.fillStyle = 'rgba(0, 0, 0, 0.54)';
  ctx.beginPath();
  ctx.ellipse(0, 2, 22, 5.2, 0, 0, Math.PI * 2);
  ctx.fill();

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

  // 紧凑贴地阴影
  ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
  ctx.beginPath();
  ctx.ellipse(0, 2, d.kind === 'ability' ? 18 : 12, 3.8, 0, 0, Math.PI * 2);
  ctx.fill();

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
      const w = wpnDef || WEAPONS.sword_1;
      // 每把武器按自身真实兵刃外形（轻剑/陌刀/长枪/双刺/九节鞭）与专属品阶光晕独立呈现，空中翻旋、落地斜倚！
      const restTilt = w.archetype === 'whip' ? 0 : -0.66;
      ctx.rotate(inAir ? spin : restTilt);
      if (w.archetype === 'daggers' && Assets.get('part_wpn_daggers')) {
        const dg = Assets.get('part_wpn_daggers')!;
        ctx.save();
        ctx.rotate(-0.32);
        ctx.drawImage(dg, -17, -5.5, 34, 11);
        ctx.rotate(0.68);
        ctx.drawImage(dg, -17, -5.5, 34, 11);
        ctx.restore();
      } else {
        const len =
          w.archetype === 'spear'
            ? 52
            : w.archetype === 'greatsword'
              ? 48
              : w.archetype === 'whip'
                ? 68
                : 44;
        if (w.archetype !== 'whip') {
          ctx.translate(-len * 0.26, 0);
        }
        drawCelShadedWeapon(ctx, w.archetype, w.id, len);
      }
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
      ctx.strokeStyle = rimColor;
      ctx.globalAlpha = 0.35 + Math.sin(t * 4 + d.x) * 0.12;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, dim * 0.44, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  } else if (d.kind === 'skill_scroll') {
    const scrImg = Assets.get('item_drop_scroll');
    const floatY = -19 + Math.sin(t * 3.8 + d.x) * 2.5;
    if (scrImg) {
      ctx.drawImage(scrImg, -17, floatY - 17, 34, 34);
    }
  } else if (d.kind === 'ability') {
    // 镇司奇宝传承台：低矮精致青石莲座 + 悬浮秘宝真身（告别原先 94px 遮挡画面的巨型石碑！）
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.2;
    ctx.fillRect(-18, -7, 36, 7);
    ctx.strokeRect(-18, -7, 36, 7);

    const bobY = -26 + Math.sin(t * 3.6) * 3.2;
    let abKey: AssetKey = 'item_drop_scroll';
    if (d.itemId === 'familiar_sword') abKey = 'fam_sword';
    else if (d.itemId === 'jade_pendant_full') abKey = 'item_drop_jade';
    else if (d.itemId === 'mirror_truth') abKey = 'item_sub_bagua';
    else if (d.itemId === 'mist_dash') abKey = 'item_talisman_scroll';
    else if (d.itemId === 'ground_slam') abKey = 'item_sub_seal';
    const abImg = Assets.get(abKey);
    if (abImg) {
      const h = d.itemId === 'familiar_sword' ? 40 : 36;
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

  // 仅当少年靠近重要器物时浮现清秀题名
  if ((d.isStaticPickup || d.kind === 'yao_core' || d.kind === 'weapon' || d.kind === 'armor') && Math.abs(playerX - d.x) < 155) {
    ctx.font = 'bold 12px "STKaiti", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
    ctx.fillText(d.label, 1.1, -43.8);
    ctx.fillStyle = '#fef08a';
    ctx.fillText(d.label, 0, -45);
  }

  ctx.restore();
}
