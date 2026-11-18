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

function drawArticulatedLeg(
  ctx: CanvasRenderingContext2D,
  hipX: number,
  hipY: number,
  hipAngle: number,
  kneeBend: number,
  isFront: boolean
): void {
  ctx.save();
  ctx.translate(hipX, hipY);
  ctx.rotate(hipAngle);

  const thighCol = isFront ? '#172033' : '#0e1422';
  const bootCol = isFront ? '#1e2b40' : '#121a29';
  const trimCol = isFront ? '#cfa349' : '#8c6b2b';

  // 大腿玄铁劲装裤（带浓墨描边，完美契合 AI 手绘上身！）
  ctx.fillStyle = thighCol;
  ctx.strokeStyle = '#05070c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-6.5, -2);
  ctx.lineTo(6.5, -2);
  ctx.lineTo(5.2, 19);
  ctx.lineTo(-5.2, 19);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 膝关节旋转（人类膝盖向后自然弯折：正角度向后收小腿！）
  ctx.translate(0, 18);
  ctx.rotate(kneeBend);

  // 小腿护胫甲与暗红绑腿
  ctx.fillStyle = bootCol;
  ctx.beginPath();
  ctx.moveTo(-5, 0);
  ctx.lineTo(5, 0);
  ctx.lineTo(4.2, 17);
  ctx.lineTo(-4.2, 17);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 护膝金边
  ctx.strokeStyle = trimCol;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-5, 2);
  ctx.lineTo(0, -1.5);
  ctx.lineTo(5, 2);
  ctx.stroke();

  // 皂底武靴
  ctx.fillStyle = '#0b0f19';
  ctx.strokeStyle = '#05070c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-5, 15);
  ctx.lineTo(5, 15);
  ctx.lineTo(12, 19.5);
  ctx.lineTo(11, 21.5);
  ctx.lineTo(-5.5, 21.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawPaintedWeapon(
  ctx: CanvasRenderingContext2D,
  archetype: WeaponArchetype,
  tintGlow: string,
  scaleLen = 1
): void {
  const isHeavy = archetype === 'greatsword';
  const img = Assets.get(isHeavy ? 'part_wpn_modao' : 'part_wpn_sword');
  if (img) {
    const w = (isHeavy ? 104 : 80) * scaleLen;
    const h = w * (img.height / img.width);
    // 握柄枢轴位于图片左侧约 18% 处
    ctx.drawImage(img, -w * 0.18, -h * 0.5, w, h);
  } else {
    ctx.fillStyle = tintGlow;
    ctx.fillRect(0, -3, 68 * scaleLen, 6);
  }
}

/**
 * 既用于局内60fps实时战斗渲染，也用于【恶魔城装备栏左侧真人动态试衣镜预览】！
 */
export function renderModularLiYichengRig(
  ctx: CanvasRenderingContext2D,
  opts: {
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
): void {
  const wDef = WEAPONS[opts.equippedWeaponId] || WEAPONS.sword_1;
  const isHeavy = wDef.archetype === 'greatsword';
  const sc = opts.scale ?? 1;

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
  const breath = Math.sin(opts.animTime * 3.6);
  const runBob = opts.onGround ? Math.abs(Math.cos(opts.runCycle)) * 4.5 * speedRatio : 0;
  const squashY = 1 - opts.landSquash * 0.12;
  const squashX = 1 + opts.landSquash * 0.1;

  ctx.scale(squashX, squashY);
  ctx.translate(0, -runBob);

  // 踏云步二段跳：360° 帅气凌空翻身旋跃！
  if (opts.doubleJumpSpin > 0) {
    const spinProg = 1 - opts.doubleJumpSpin / 0.34;
    ctx.translate(0, -44);
    ctx.rotate(spinProg * Math.PI * 2);
    ctx.translate(0, 44);
  }

  // 计算双腿真实两段关节角 (hipAngle 负值向前迈，kneeBend 正值向后自然折膝！)
  let backHip = 0.22;
  let backKnee = 0.14;
  let frontHip = -0.24;
  let frontKnee = 0.12;

  if (!opts.onGround) {
    if (opts.vy < 0) {
      // 腾空提膝势
      frontHip = -0.78;
      frontKnee = 1.15;
      backHip = 0.36;
      backKnee = 0.42;
    } else {
      // 凌空落势
      frontHip = -0.35;
      frontKnee = 0.55;
      backHip = 0.25;
      backKnee = 0.65;
    }
  } else if (opts.slash && opts.slash.progress < 0.85) {
    // 挥刀弓步沉马！
    frontHip = -0.58;
    frontKnee = 0.58;
    backHip = 0.52;
    backKnee = 0.18;
  } else if (speedRatio > 0.08) {
    const ph = opts.runCycle;
    frontHip = Math.sin(ph) * 0.66 * speedRatio;
    frontKnee = 0.16 + Math.max(0, -Math.cos(ph)) * 0.95 * speedRatio;
    backHip = Math.sin(ph + Math.PI) * 0.66 * speedRatio;
    backKnee = 0.16 + Math.max(0, -Math.cos(ph + Math.PI)) * 0.95 * speedRatio;
  }

  // 1. 背部斜挎副主手兵器（双武器系统视觉灵魂：没拿在手里的另一把神兵直接背在背上！）
  if (opts.secondaryWeaponId && opts.secondaryWeaponId !== opts.equippedWeaponId) {
    const secW = WEAPONS[opts.secondaryWeaponId];
    if (secW) {
      ctx.save();
      ctx.translate(-8, -58);
      ctx.rotate(-2.35);
      ctx.globalAlpha = 0.92;
      drawPaintedWeapon(ctx, secW.archetype, secW.glowColor, 0.86);
      ctx.restore();
    }
  }

  // 2. 后腿骨骼 + 飘动镇妖司下摆战裙后片
  drawArticulatedLeg(ctx, -3, -38, backHip, backKnee, false);

  const skirtWave = Math.sin(opts.animTime * 8) * 3 + speedRatio * 12;
  ctx.fillStyle = '#111827';
  ctx.strokeStyle = '#991b1b';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-9, -39);
  ctx.lineTo(4, -39);
  ctx.lineTo(-8 - skirtWave, -11);
  ctx.lineTo(-19 - skirtWave, -15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. 前腿骨骼 + 前片镶金战裙
  drawArticulatedLeg(ctx, 3, -38, frontHip, frontKnee, true);

  ctx.fillStyle = '#172236';
  ctx.strokeStyle = '#cfa349';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-4, -39);
  ctx.lineTo(9, -39);
  ctx.lineTo(13 - skirtWave * 0.3, -15);
  ctx.lineTo(2 - skirtWave * 0.4, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. 上半身俯仰扭腰角 + AI 手绘无臂躯干头冠贴图 (`part_hero_torso`)
  let torsoLean = speedRatio * 0.15;
  if (opts.slash) {
    const p = opts.slash.progress;
    if (isHeavy && p < 0.32) torsoLean = -0.18 * (p / 0.32); // 陌刀后仰蓄势！
    else torsoLean = 0.24 * Math.sin(Math.min(1, p * 1.3) * Math.PI);
  }

  ctx.save();
  ctx.translate(0, -37 + breath * 0.9);
  ctx.rotate(torsoLean);

  // 动态延伸随风猎猎狂舞的朱砂抹额双飘带（接在脑后，跑跳时拉出惊艳水墨流线！）
  const ribWave1 = Math.sin(opts.animTime * 11) * 6;
  const ribWave2 = Math.cos(opts.animTime * 9) * 7;
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-10, -36);
  ctx.quadraticCurveTo(
    -28 - speedRatio * 12,
    -38 + ribWave1 + opts.vy * 0.02,
    -46 - speedRatio * 18,
    -30 + ribWave2 + opts.vy * 0.04
  );
  ctx.stroke();

  const torsoImg = Assets.get('part_hero_torso');
  if (torsoImg) {
    const th = 58;
    const tw = torsoImg.width * (th / torsoImg.height);
    ctx.drawImage(torsoImg, -tw * 0.52, -th + 3, tw, th);
  }

  // 5. 右肩关节嵌入袖口暗槽 (`x = -1, y = -22` 相对于腰部原点) + 持兵护腕手臂 + 真实神兵贴图！
  let shoulderAng = 0.38;
  let elbowAng = -0.25;
  let wristAng = 0.15;

  if (opts.slash) {
    const pr = opts.slash.progress;
    if (opts.slash.pogoDown) {
      shoulderAng = 1.25;
      elbowAng = 0.1;
      wristAng = 0.2;
    } else if (isHeavy) {
      if (opts.slash.comboStep === 1) {
        // 陌刀第1式：0..0.32 举刀过背蓄力 -> 0.32..0.75 雷霆240°劈地 -> 收势
        if (pr < 0.32) {
          const w = pr / 0.32;
          shoulderAng = -1.1 - w * 1.15;
          elbowAng = -0.5;
          wristAng = -0.4;
        } else {
          const k = Math.min(1, (pr - 0.32) / 0.45);
          const ease = 1 - Math.pow(1 - k, 3);
          shoulderAng = -2.25 + ease * 3.05;
          elbowAng = -0.2 + ease * 0.25;
          wristAng = -0.2 + ease * 0.45;
        }
      } else {
        // 陌刀第2式：逆风大横扫
        const ease = 1 - Math.pow(1 - Math.min(1, pr * 1.25), 3);
        shoulderAng = 1.15 - ease * 2.45;
        elbowAng = -0.15;
        wristAng = 0.1;
      }
    } else {
      // 轻剑三连斩：1平斩 -> 2逆鳞上挑 -> 3突刺破空
      const ease = 1 - Math.pow(1 - Math.min(1, pr * 1.3), 3);
      if (opts.slash.comboStep === 1) {
        shoulderAng = -1.35 + ease * 2.35;
        elbowAng = -0.15;
      } else if (opts.slash.comboStep === 2) {
        shoulderAng = 1.15 - ease * 2.45;
        elbowAng = -0.2;
      } else {
        shoulderAng = -0.25 + ease * 0.35;
        elbowAng = 0.05;
        wristAng = -0.05;
      }
    }
  } else if (isHeavy) {
    // 平时持握重刃斩马陌刀：豪迈扛在肩头！（《斩妖行》经典扛刀站姿/跑姿！）
    shoulderAng = -0.85 + Math.sin(opts.animTime * 3.6) * 0.03;
    elbowAng = -1.25;
    wristAng = -0.35;
  } else if (speedRatio > 0.15 && opts.onGround) {
    // 轻剑疾奔：古风侠客反手垂剑疾行势！
    shoulderAng = 2.15 + Math.sin(opts.runCycle) * 0.18;
    elbowAng = -0.25;
    wristAng = 0.25;
  } else {
    // 轻剑待机：剑指斜前戒备势
    shoulderAng = 0.48 + breath * 0.04;
    elbowAng = -0.38;
    wristAng = 0.22;
  }

  ctx.save();
  ctx.translate(-2, -21);
  ctx.rotate(shoulderAng);

  // 上臂肌肉与玄色袖口
  ctx.fillStyle = '#e5be9e';
  ctx.strokeStyle = '#05070c';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(-4, -3, 14, 7.5, 3.5);
  ctx.fill();
  ctx.stroke();

  // 肘部 -> 玄铁镶金护腕前臂
  ctx.translate(11, 0);
  ctx.rotate(elbowAng);
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#cfa349';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-2, -3.5, 14, 7, 3);
  ctx.fill();
  ctx.stroke();

  // 手掌与掌中真实神兵贴图
  ctx.translate(12, 0);
  ctx.rotate(wristAng);
  drawPaintedWeapon(ctx, wDef.archetype, wDef.glowColor, 1);

  ctx.fillStyle = '#ecc8a9';
  ctx.strokeStyle = '#05070c';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 3.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore(); // end arm
  ctx.restore(); // end torso
  ctx.restore(); // end root
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
      const ry = -38 + Math.sin(a * 1.3) * 14;
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
    if (e.aiState === 'windup') poseTilt = -0.18; // 出刀前沉肩后仰蓄力！
    else if (e.aiState === 'lunge_slash') poseTilt = 0.22; // 挥刀猛劈前倾！
    else if (e.aiState === 'staggered') poseTilt = -0.15;

    ctx.save();
    ctx.translate(0, -stepBob);
    ctx.scale(e.facing === -1 ? 1 : -1, 1 + Math.sin(t * 4.5 + e.id) * 0.018);
    // 怪物原图朝左(-1)，在镜像空间中正角度逆时针即向后仰！
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

  // 神兵架或石座衬底
  if (d.isStaticPickup) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 24, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (d.kind === 'weapon' && d.itemId === 'greatsword_1') {
    // 镇军兵器架：赤炎斩马陌刀斜插石台之上，气势凛然！
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
