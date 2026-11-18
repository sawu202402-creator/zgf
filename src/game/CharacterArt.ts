import { WEAPONS } from '../data/itemsAndSkills';
import { SceneNpc } from '../data/worldMap';
import { WeaponArchetype } from '../types';
import { AssetKey, Assets } from './AssetLoader';
import { ActiveSlash, EnemyEntity, GameEngine, WorldDrop } from './GameEngine';
import { drawCelShadedWeapon } from './GuofengWorldArt';

const ENEMY_METRICS = {
  canvasW: 360,
  canvasH: 270,
  anchorX: 165,
  footY: 256,
} as const;

function selectEnemySpriteFrame(e: EnemyEntity, t: number): AssetKey {
  const kind = e.profile.kind;
  const isMoving = Math.abs(e.vx) > 12 && e.aiState === 'stalk';

  if (kind === 'boss_scroll_king' || e.profile.isBoss) {
    if (e.aiState === 'windup') return 'boss_ik_1';
    if (e.aiState === 'lunge_slash') return 'boss_ik_2';
    return 'boss_ik_0';
  }

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

  // 默认近战刀客 (paper_swordsman 等) 4帧真实步态与双手举刀/劈斩序列！
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
  archetype: WeaponArchetype,
  weaponId = 'sword_1'
): void {
  ctx.save();
  // 采用与主角完全一致的浓墨描边赛璐珞神兵矢量绘制，0位图贴纸违和感！
  ctx.translate(-8, -50);
  ctx.rotate(-2.32);
  ctx.globalAlpha = 0.94;
  drawCelShadedWeapon(ctx, archetype, weaponId, archetype === 'greatsword' ? 86 : 72);
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
    drawBackCarriedWeapon(ctx, 'greatsword', opts.equippedWeaponId);
  } else if (opts.secondaryWeaponId && opts.secondaryWeaponId !== opts.equippedWeaponId) {
    const secW = WEAPONS[opts.secondaryWeaponId];
    if (secW) {
      drawBackCarriedWeapon(ctx, secW.archetype, secW.id);
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

  ctx.save();
  ctx.translate(e.x, e.y);

  if (!e.profile.flying) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.54)';
    ctx.beginPath();
    ctx.ellipse(0, 2, w * 0.65, 5.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (img) {
    // 全部怪物与妖王现已升级为统一国风赛璐珞逐帧动作序列（迈步/蓄力举刀/挥劈各帧独立，彻底告别单帧纸片平移！）
    const sc = e.profile.isBoss ? 0.62 : e.profile.kind === 'bronze_guard' ? 0.54 : 0.52;
    const drawW = ENEMY_METRICS.canvasW * sc;
    const drawH = ENEMY_METRICS.canvasH * sc;
    const dx = -ENEMY_METRICS.anchorX * sc;
    const dy = -ENEMY_METRICS.footY * sc + 2;

    const hoverY = e.profile.flying ? Math.sin(e.animPhase) * 4 : 0;

    ctx.save();
    ctx.translate(0, -hoverY);
    ctx.scale(e.facing, 1 + Math.sin(t * 3.6 + e.id) * 0.012);

    const source = flash ? Assets.getWhiteFlash(spriteKey) || img : img;
    ctx.drawImage(source, dx, dy, drawW, drawH);
    ctx.restore();
  }

  // 提灯冥火鬼灯笼幽青叠加辉光
  if (e.profile.flying) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const lx = e.facing * 28;
    const ly = -44;
    const lg = ctx.createRadialGradient(lx, ly, 2, lx, ly, 36);
    lg.addColorStop(0, 'rgba(94, 234, 212, 0.45)');
    lg.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(lx, ly, 36, 0, Math.PI * 2);
    ctx.fill();
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
    const breath = 1 + Math.sin(t * 2.8 + npc.x * 0.02) * 0.013;
    ctx.save();
    ctx.scale(facing, breath);
    const s = HERO_SPRITE_METRICS.baseScale;
    const dw = HERO_SPRITE_METRICS.canvasW * s;
    const dh = HERO_SPRITE_METRICS.canvasH * s;
    const dx = -HERO_SPRITE_METRICS.anchorX * s;
    const dy = -HERO_SPRITE_METRICS.footY * s + 2;
    ctx.drawImage(img, dx, dy, dw, dh);
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

  // 3. 头顶无框书法轻题名（绝不画方框/圆框背景贴条！）
  const nearAlpha = dist < 150 ? 0.96 : 0.62;
  ctx.globalAlpha = nearAlpha;
  ctx.textAlign = 'center';
  ctx.font = 'bold 13px "STKaiti", "KaiTi", serif';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.fillText(npc.name, 1.2, -105.8);
  ctx.fillStyle = '#f6dc8d';
  ctx.fillText(npc.name, 0, -107);

  if (dist < 135) {
    ctx.font = '10.5px "STKaiti", "KaiTi", serif';
    ctx.fillStyle = '#7dd3fc';
    ctx.fillText(npc.title, 0, -121);
  }

  ctx.restore();
}

/**
 * 接地祭剑石座与手绘灵韵器物渲染（彻底淘汰漂浮宝箱/葫芦抠图贴纸与方框文字签！）
 */
export function drawWorldDrop(
  ctx: CanvasRenderingContext2D,
  d: WorldDrop,
  t: number,
  playerX = -9999
): void {
  ctx.save();
  ctx.translate(d.x, d.y);

  // 地面接触暗影（所有器物稳稳立于地面石台或散落地面，绝不悬空贴图式乱飘！）
  ctx.fillStyle = 'rgba(0, 0, 0, 0.56)';
  ctx.beginPath();
  ctx.ellipse(0, 2, d.isStaticPickup ? 24 : 13, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  const auraCol =
    d.kind === 'weapon'
      ? d.itemId.startsWith('greatsword')
        ? 'rgba(249, 115, 22,'
        : 'rgba(45, 212, 191,'
      : d.kind === 'yao_core'
        ? 'rgba(192, 132, 252,'
        : d.kind === 'consumable'
          ? 'rgba(74, 222, 128,'
          : 'rgba(250, 204, 21,';

  // 柔和向天空消散的垂直灵韵微光丝（lighter 叠加，0硬边）
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const beamH = d.isStaticPickup ? 68 : 38;
  const bg = ctx.createLinearGradient(0, 0, 0, -beamH);
  bg.addColorStop(0, `${auraCol} 0.36)`);
  bg.addColorStop(0.55, `${auraCol} 0.12)`);
  bg.addColorStop(1, `${auraCol} 0)`);
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(-12, 0);
  ctx.lineTo(12, 0);
  ctx.lineTo(5, -beamH);
  ctx.lineTo(-5, -beamH);
  ctx.closePath();
  ctx.fill();

  // 升腾灵尘微粒
  for (let i = 0; i < 3; i++) {
    const prog = (t * 0.75 + i * 0.33 + d.x * 0.01) % 1;
    const mx = Math.sin(t * 3 + i * 2) * 8;
    const my = -4 - prog * (beamH - 8);
    ctx.fillStyle = `${auraCol} ${(1 - prog) * 0.8})`;
    ctx.beginPath();
    ctx.arc(mx, my, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  if (d.kind === 'weapon') {
    const altarImg = Assets.get('item_sword_altar');
    if (altarImg) {
      const h = 86;
      const w = altarImg.width * (h / altarImg.height);
      ctx.drawImage(altarImg, -w * 0.5, -h + 3, w, h);
    }
  } else if (d.kind === 'armor') {
    const armorImg = Assets.get('item_armor_stand');
    if (armorImg) {
      const h = 88;
      const w = armorImg.width * (h / armorImg.height);
      ctx.drawImage(armorImg, -w * 0.5, -h + 3, w, h);
    }
  } else if (d.kind === 'consumable' || d.kind === 'max_up') {
    if (d.itemId === 'beggar_chicken') {
      const chkImg = Assets.get('item_lotus_chicken');
      if (chkImg) {
        const h = 38;
        const w = chkImg.width * (h / chkImg.height);
        ctx.drawImage(chkImg, -w * 0.5, -h + 2, w, h);
      }
    } else {
      const gourdImg = Assets.get('item_celadon_gourd');
      if (gourdImg) {
        const h = 42;
        const w = gourdImg.width * (h / gourdImg.height);
        ctx.drawImage(gourdImg, -w * 0.5, -h + 2, w, h);
      }
    }
  } else if (d.kind === 'yao_core') {
    const floatY = -18 + Math.sin(t * 4.5) * 3;
    const cg = ctx.createRadialGradient(0, floatY, 2, 0, floatY, 14);
    cg.addColorStop(0, '#ffffff');
    cg.addColorStop(0.4, '#d8b4fe');
    cg.addColorStop(1, 'rgba(147, 51, 234, 0)');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(0, floatY, 14, 0, Math.PI * 2);
    ctx.fill();
  } else if (d.kind === 'gold') {
    // 纹银元宝锭
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-9, -6);
    ctx.quadraticCurveTo(0, 0, 9, -6);
    ctx.lineTo(6, -1);
    ctx.lineTo(-6, -1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    // 随风微颤的朱砂黄纸灵符
    const tilt = Math.sin(t * 5 + d.x) * 0.12;
    ctx.save();
    ctx.translate(0, -11);
    ctx.rotate(tilt);
    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.3;
    ctx.fillRect(-4.5, -8, 9, 16);
    ctx.strokeRect(-4.5, -8, 9, 16);
    ctx.strokeStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(0, 5);
    ctx.moveTo(-2.5, -1);
    ctx.lineTo(2.5, 1);
    ctx.stroke();
    ctx.restore();
  }

  // 仅当少年靠近时浮现无框水墨金字题名（彻底取消丑陋的半透明黑方框标签！）
  if ((d.isStaticPickup || d.kind === 'yao_core') && Math.abs(playerX - d.x) < 175) {
    ctx.font = 'bold 12.5px "STKaiti", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
    ctx.fillText(d.label, 1.2, -56.8);
    ctx.fillStyle = '#fef08a';
    ctx.fillText(d.label, 0, -58);
  }

  ctx.restore();
}
