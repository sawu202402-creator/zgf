import { WEAPONS } from '../data/itemsAndSkills';
import { EnemyKind, WeaponArchetype } from '../types';
import { AssetKey, Assets } from './AssetLoader';
import { ActiveSlash, EnemyEntity, GameEngine, WorldDrop } from './GameEngine';

const ENEMY_SPRITE_MAP: Record<EnemyKind, AssetKey> = {
  paper_swordsman: 'mob_paper_swordsman',
  lantern_ghost: 'mob_lantern_ghost',
  bronze_guard: 'mob_bronze_guard',
  scroll_demon: 'mob_scroll_demon',
  plague_toad: 'mob_plague_toad',
  opera_puppet: 'mob_opera_puppet',
  bell_gargoyle: 'mob_bell_gargoyle',
  boss_scroll_king: 'boss_scroll_king',
  boss_furnace_titan: 'boss_furnace_titan',
  boss_xiao_duanshui: 'npc_xiao_boss',
  boss_opera_god: 'boss_opera_god',
  boss_thunder_yaksha: 'mob_bell_gargoyle',
  boss_pei_wuji: 'boss_opera_god',
  boss_zhuyin: 'boss_zhuyin',
};

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
  scale?: number;
}

export function selectHeroSpriteFrame(opts: {
  vx: number;
  vy: number;
  onGround: boolean;
  runCycle: number;
  animTime: number;
  isHeavy: boolean;
  slash: ActiveSlash | null;
}): AssetKey {
  const { vx, vy, onGround, runCycle, animTime, isHeavy, slash } = opts;

  // 1. 挥兵斩击帧（轻剑三连招 vs 重型斩马陌刀蓄力重劈）
  if (slash) {
    const pr = slash.progress;
    if (isHeavy) {
      return pr < 0.34 ? 'h18_modao_windup' : 'h18_modao_cleave';
    }
    if (slash.pogoDown) {
      return 'h18_sword_2';
    }
    if (slash.comboStep === 1) {
      return pr < 0.24 ? 'h18_sword_1' : 'h18_sword_0';
    }
    if (slash.comboStep === 2) {
      return pr < 0.24 ? 'h18_sword_0' : 'h18_sword_1';
    }
    // 第三式终结技 / 手搓剑诀突刺：蓄势收剑 -> 弓步破空直刺！
    return pr < 0.2 ? 'h18_sword_0' : 'h18_sword_2';
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

function drawBackCarriedWeapon(
  ctx: CanvasRenderingContext2D,
  archetype: WeaponArchetype
): void {
  const isHeavy = archetype === 'greatsword';
  const img = Assets.get(isHeavy ? 'part_wpn_modao' : 'part_wpn_sword');
  if (!img) return;

  ctx.save();
  // 斜挎于少年后背肩胛位置，绘制在人物主序列帧底层，绝不遮挡面部与前胸！
  ctx.translate(-6, -54);
  ctx.rotate(-2.32);
  ctx.globalAlpha = 0.92;
  const w = isHeavy ? 96 : 74;
  const h = w * (img.height / img.width);
  ctx.drawImage(img, -w * 0.25, -h * 0.5, w, h);
  ctx.restore();
}

/**
 * 18岁少年李逸承纯手绘逐帧渲染器（同时驱动局内 60fps 实机战斗与【兵匣】动态试剑台！）
 */
export function renderModularLiYichengRig(
  ctx: CanvasRenderingContext2D,
  opts: HeroRenderState
): void {
  const wDef = WEAPONS[opts.equippedWeaponId] || WEAPONS.sword_1;
  const isHeavy = wDef.archetype === 'greatsword';
  const sc = opts.scale ?? 1;

  const frameKey = selectHeroSpriteFrame({
    vx: opts.vx,
    vy: opts.vy,
    onGround: opts.onGround,
    runCycle: opts.runCycle,
    animTime: opts.animTime,
    isHeavy,
    slash: opts.slash,
  });

  ctx.save();
  ctx.translate(opts.x, opts.y);
  ctx.scale(opts.facing * sc, sc);

  // 接地浓墨阴影
  if (opts.onGround) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 24, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const speedRatio = Math.min(1, Math.abs(opts.vx) / 220);
  const isIdle = opts.onGround && speedRatio <= 0.12 && !opts.slash;
  const breathScaleY = isIdle ? 1 + Math.sin(opts.animTime * 3.2) * 0.014 : 1;
  const squashY = (1 - opts.landSquash * 0.1) * breathScaleY;
  const squashX = 1 + opts.landSquash * 0.08;

  ctx.scale(squashX, squashY);

  // 踏云步二段跳：凌空翻身旋跃特效
  if (opts.doubleJumpSpin > 0) {
    const spinProg = 1 - opts.doubleJumpSpin / 0.34;
    ctx.translate(0, -48);
    ctx.rotate(spinProg * Math.PI * 2);
    ctx.translate(0, 48);
  }

  // 背部斜挎副武器（或装备陌刀疾跑/跳跃时将巨刃背负身后，停步或出招瞬间掣刀在手！）
  const carryingHeavyWhileMoving =
    isHeavy && !opts.slash && (!opts.onGround || speedRatio > 0.12);
  if (carryingHeavyWhileMoving) {
    drawBackCarriedWeapon(ctx, 'greatsword');
  } else if (opts.secondaryWeaponId && opts.secondaryWeaponId !== opts.equippedWeaponId) {
    const secW = WEAPONS[opts.secondaryWeaponId];
    if (secW) {
      drawBackCarriedWeapon(ctx, secW.archetype);
    }
  }

  // 绘制纯手绘 18 岁少年侠客序列帧
  const spriteImg = Assets.get(frameKey) || Assets.get('h18_idle_0');
  if (spriteImg) {
    const s = HERO_SPRITE_METRICS.baseScale;
    const drawW = HERO_SPRITE_METRICS.canvasW * s;
    const drawH = HERO_SPRITE_METRICS.canvasH * s;
    const dx = -HERO_SPRITE_METRICS.anchorX * s;
    const dy = -HERO_SPRITE_METRICS.footY * s + 2;
    ctx.drawImage(spriteImg, dx, dy, drawW, drawH);
  }

  // 斩马陌刀举刀过顶蓄力阶段：刀身凝聚赤金烈焰罡气微光！
  if (isHeavy && opts.slash && opts.slash.progress < 0.34) {
    const charge = opts.slash.progress / 0.34;
    const glow = ctx.createRadialGradient(-8, -96, 3, -8, -96, 44 * charge + 12);
    glow.addColorStop(0, `rgba(253, 224, 71, ${0.45 * charge})`);
    glow.addColorStop(0.55, `rgba(249, 115, 22, ${0.28 * charge})`);
    glow.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(-8, -96, 56, 0, Math.PI * 2);
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

  if (p.invulnTimer > 0 && Math.floor(p.invulnTimer * 20) % 2 === 0 && p.mistDashTimer <= 0) {
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
  });
}

/**
 * 《斩妖行 / 胧村正》风格水墨重彩渐变收尖刀光绸带（Tapered Ink & Flame Crescent Mesh）！
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
  if (fadeAlpha <= 0.02) return;
  const steps = 20;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(facing, flipVert ? -1 : 1);
  ctx.globalAlpha = fadeAlpha;

  const buildRibbonPath = (rOuterOff: number, rInnerOff: number) => {
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const a = startAng + (endAng - startAng) * u;
      const taper = Math.sin(u * Math.PI);
      const r = radius + rOuterOff * taper;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r * 0.86;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    for (let i = steps; i >= 0; i--) {
      const u = i / steps;
      const a = startAng + (endAng - startAng) * u;
      const taper = Math.pow(Math.sin(u * Math.PI), 0.75);
      const r = radius - (thickness + rInnerOff) * taper;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r * 0.86;
      ctx.lineTo(px, py);
    }
    ctx.closePath();
  };

  // 第一层：浓墨枯笔外晕底衬（赋予纯正东方水墨厚重感！）
  buildRibbonPath(7, 10);
  ctx.fillStyle = 'rgba(7, 10, 16, 0.86)';
  ctx.fill();

  // 第二层：流火/翡翠真气主刃带
  buildRibbonPath(2, 0);
  ctx.fillStyle = coreColor;
  ctx.fill();

  // 第三层：外缘极锐炽白寒芒锋线
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  for (let i = 3; i <= steps - 1; i++) {
    const u = i / steps;
    const a = startAng + (endAng - startAng) * u;
    const r = radius + 2 * Math.sin(u * Math.PI);
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r * 0.86;
    if (i === 3) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  ctx.restore();
}

export function drawMonsterOrBoss(
  ctx: CanvasRenderingContext2D,
  e: EnemyEntity,
  t: number
): void {
  const kind = e.profile.kind;
  const w = e.profile.w;
  const h = e.profile.h;
  const flash = e.hurtFlash > 0;
  const spriteKey = ENEMY_SPRITE_MAP[kind];
  const img = Assets.get(spriteKey);

  ctx.save();
  ctx.translate(e.x, e.y);

  if (!e.profile.flying) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
    ctx.beginPath();
    ctx.ellipse(0, 2, w * 0.62, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (img) {
    const targetH = e.profile.isBoss ? 142 : h * 1.52;
    const drawW = img.width * (targetH / img.height);

    // 根据 AI 状态赋予真实的蓄势后仰、突斩前倾与迈步颠簸！
    const isMoving = Math.abs(e.vx) > 15 && e.aiState === 'stalk';
    const stepBob = e.profile.flying
      ? Math.sin(e.animPhase) * 5
      : isMoving
        ? Math.abs(Math.sin(e.animPhase)) * 4.2
        : 0;
    const stepRock = isMoving ? Math.sin(e.animPhase) * 0.055 : 0;

    let poseTilt = stepRock;
    if (e.aiState === 'windup') poseTilt = -0.18;
    else if (e.aiState === 'lunge_slash') poseTilt = 0.22;
    else if (e.aiState === 'staggered') poseTilt = -0.15;

    ctx.save();
    ctx.translate(0, -stepBob);
    ctx.scale(e.facing === -1 ? 1 : -1, 1 + Math.sin(t * 4.5 + e.id) * 0.018);
    ctx.rotate(-poseTilt);

    const source = flash ? Assets.getWhiteFlash(spriteKey) || img : img;
    ctx.drawImage(source, -drawW * 0.5, -targetH + 4, drawW, targetH);
    ctx.restore();
  }

  // 出招前摇【危 · 寒芒十字星】高辨识度预警（《只狼 / 斩妖行》式博弈提示！）
  if (e.aiState === 'windup') {
    const gx = e.facing * (w * 0.45);
    const gy = -h * 0.95;
    const pulse = 12 + Math.sin(t * 28) * 5;
    ctx.save();
    ctx.translate(gx, gy);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-pulse * 1.5, 0);
    ctx.lineTo(pulse * 1.5, 0);
    ctx.moveTo(0, -pulse * 1.5);
    ctx.lineTo(0, pulse * 1.5);
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '900 15px "STKaiti", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('危', 0, -16);
    ctx.restore();
  }

  // 怪物突斩挥刀时的真实猩红水墨刀光绸带！
  if (e.aiState === 'lunge_slash') {
    drawInkSlashRibbon(
      ctx,
      0,
      -h * 0.65,
      e.facing,
      false,
      e.profile.isBoss ? 102 : 76,
      e.profile.isBoss ? 26 : 18,
      -1.15,
      0.85,
      '#dc2626',
      0.92
    );
  }

  // 小怪极简水墨残血细条（带白色延迟扣血槽！）
  if (!e.profile.isBoss && e.hp < e.maxHp) {
    const bw = 46;
    const by = -h * 1.52 - 8;
    ctx.fillStyle = 'rgba(5, 7, 12, 0.85)';
    ctx.fillRect(-bw * 0.5 - 1, by - 1, bw + 2, 5);
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(-bw * 0.5, by, bw * Math.max(0, e.hpTrail / e.maxHp), 3);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-bw * 0.5, by, bw * Math.max(0, e.hp / e.maxHp), 3);
  }

  if (e.aiState === 'staggered') {
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 12.5px "STKaiti", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ 破招失衡 ✦', 0, -h * 1.52 - 14);
  }

  ctx.restore();
}

export function drawWorldDrop(ctx: CanvasRenderingContext2D, d: WorldDrop, t: number): void {
  const bob = Math.sin(t * 3.8 + d.x * 0.05) * 3.5;
  ctx.save();
  ctx.translate(d.x, d.y);

  if (d.isStaticPickup) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 24, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (d.kind === 'weapon' && d.itemId === 'greatsword_1') {
    const modao = Assets.get('part_wpn_modao');
    const glow = ctx.createRadialGradient(0, -34, 4, 0, -34, 48);
    glow.addColorStop(0, 'rgba(249, 115, 22, 0.48)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, -34, 48, 0, Math.PI * 2);
    ctx.fill();

    if (modao) {
      ctx.save();
      ctx.translate(0, -38 + bob * 0.6);
      ctx.rotate(-1.18);
      ctx.drawImage(modao, -48, -16, 96, 32);
      ctx.restore();
    }
  } else {
    ctx.save();
    ctx.translate(0, -18 + bob);
    const chestImg = Assets.get('prop_chest');
    const gourdImg = Assets.get('prop_gourd');

    if ((d.kind === 'weapon' || d.kind === 'armor') && chestImg) {
      const h = 38;
      const w = chestImg.width * (h / chestImg.height);
      ctx.drawImage(chestImg, -w * 0.5, -h * 0.42, w, h);
    } else if ((d.kind === 'consumable' || d.kind === 'max_up') && gourdImg) {
      const h = 36;
      const w = gourdImg.width * (h / gourdImg.height);
      ctx.drawImage(gourdImg, -w * 0.5, -h * 0.5, w, h);
    } else if (d.kind === 'gold') {
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-8, -2);
      ctx.quadraticCurveTo(0, 5, 8, -2);
      ctx.lineTo(5, 5);
      ctx.lineTo(-5, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.3;
      ctx.fillRect(-5, -8, 10, 16);
      ctx.strokeRect(-5, -8, 10, 16);
    }
    ctx.restore();
  }

  if (d.isStaticPickup || d.kind === 'yao_core') {
    ctx.font = 'bold 12px "STKaiti", "KaiTi", serif';
    ctx.textAlign = 'center';
    const tw = ctx.measureText(d.label).width + 16;
    ctx.fillStyle = 'rgba(6, 8, 14, 0.88)';
    ctx.strokeStyle = 'rgba(207, 163, 73, 0.65)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-tw * 0.5, -72 + bob, tw, 19, 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fef08a';
    ctx.fillText(d.label, 0, -58 + bob);
  }

  ctx.restore();
}
