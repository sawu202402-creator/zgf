/**
 * 2D Spine 骨骼网格蒙皮变形与二阶物理飘带引擎 (`SpineRig.ts`)
 * -------------------------------------------------------------------------
 * 针对纯手绘水墨重彩角色立绘，在 Canvas 2D 上实时运行 60fps 骨骼链解算与三角网格仿射蒙皮：
 * 1. 双足根节点锁地 (`Root Pinning`)：待机呼吸、蓄力拧腰、出剑突刺、受击仰身时双靴稳扎青石地面不打滑；
 * 2. 七节人体脊柱骨骼链 (`Boots -> Shins -> Knees/Hem -> Pelvis -> Waist -> Chest -> Neck -> Crown/Hair`)：
 *    支持胸腔呼吸起伏、疾奔前倾与步态颠簸、急停惯性回弹、挥斩蓄力扭腰与破风探身、受击脊柱后仰震颤；
 * 3. 非对称衣摆与发冠二阶弹簧滞后 (`Verlet / Spring-Damper Cloth & Hair`) + 少侠束发长带实时物理模拟！
 */

export interface SpineJointRow {
  /** 贴图纵向归一化坐标 0.0(顶) .. 1.0(底) */
  v: number;
  /** 关节中心相对角色脚底原点 (0,0) 的偏移 */
  dx: number;
  dy: number;
  /** 关节横截面倾斜角 (rad) */
  angle: number;
  /** 后侧(左)与前侧(右)横向缩放倍率（支持衣摆/披风单侧随风曳尾！） */
  leftScale: number;
  rightScale: number;
}

export interface SpineSpriteMetrics {
  canvasW: number;
  canvasH: number;
  anchorX: number;
  footY: number;
  scale: number;
}

const V_BANDS = [0.0, 0.16, 0.3, 0.46, 0.62, 0.78, 0.9, 1.0] as const;

/**
 * 绘制单个仿射蒙皮三角形（对裁剪多边形向重心外扩 0.75px，彻底消除 Canvas 抗锯齿内接缝！）
 */
function drawSkinnedTriangle(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  u0: number,
  v0: number,
  u1: number,
  v1: number,
  u2: number,
  v2: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): void {
  const du1 = u1 - u0;
  const dv1 = v1 - v0;
  const du2 = u2 - u0;
  const dv2 = v2 - v0;
  const det = du1 * dv2 - du2 * dv1;
  if (Math.abs(det) < 1e-4) return;

  const invDet = 1 / det;
  const dx1 = x1 - x0;
  const dy1 = y1 - y0;
  const dx2 = x2 - x0;
  const dy2 = y2 - y0;

  const a = (dx1 * dv2 - dx2 * dv1) * invDet;
  const c = (du1 * dx2 - du2 * dx1) * invDet;
  const b = (dy1 * dv2 - dy2 * dv1) * invDet;
  const d = (du1 * dy2 - du2 * dy1) * invDet;
  const e = x0 - a * u0 - c * v0;
  const f = y0 - b * u0 - d * v0;

  // 裁剪区沿三角形重心向外微扩 0.78px，使相邻三角片共享完全连续的源像素而零缝隙
  const cx = (x0 + x1 + x2) / 3;
  const cy = (y0 + y1 + y2) / 3;
  const expand = (px: number, py: number): [number, number] => {
    const vx = px - cx;
    const vy = py - cy;
    const len = Math.hypot(vx, vy) || 1;
    return [px + (vx / len) * 0.78, py + (vy / len) * 0.78];
  };
  const [ex0, ey0] = expand(x0, y0);
  const [ex1, ey1] = expand(x1, y1);
  const [ex2, ey2] = expand(x2, y2);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(ex0, ey0);
  ctx.lineTo(ex1, ey1);
  ctx.lineTo(ex2, ey2);
  ctx.closePath();
  ctx.clip();
  ctx.transform(a, b, c, d, e, f);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

/**
 * 将任意手绘角色贴图绑定至 8 节点脊柱骨骼链进行实时 60fps 网格蒙皮绘制
 */
export function drawSkinnedSpineSprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  metrics: SpineSpriteMetrics,
  joints: SpineJointRow[]
): void {
  const srcW = img.width;
  const srcH = img.height;
  const sc = metrics.scale;
  const ratioX = metrics.canvasW / Math.max(1, srcW);
  const ratioY = metrics.canvasH / Math.max(1, srcH);

  const baseLeftSpan = metrics.anchorX * sc;
  const baseRightSpan = (metrics.canvasW - metrics.anchorX) * sc;

  const n = joints.length;
  const lx = new Float32Array(n);
  const ly = new Float32Array(n);
  const rx = new Float32Array(n);
  const ry = new Float32Array(n);
  const sv = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    const j = joints[i];
    const baseY = (j.v * metrics.canvasH - metrics.footY) * sc + 2;
    const jx = j.dx;
    const jy = baseY + j.dy;
    const cosA = Math.cos(j.angle);
    const sinA = Math.sin(j.angle);
    const lSpan = baseLeftSpan * j.leftScale;
    const rSpan = baseRightSpan * j.rightScale;

    lx[i] = jx - cosA * lSpan;
    ly[i] = jy - sinA * lSpan;
    rx[i] = jx + cosA * rSpan;
    ry[i] = jy + sinA * rSpan;
    sv[i] = (j.v * metrics.canvasH) / ratioY;
  }

  const suMax = metrics.canvasW / ratioX;

  for (let i = 0; i < n - 1; i++) {
    const v0 = sv[i];
    const v1 = sv[i + 1];
    drawSkinnedTriangle(
      ctx,
      img,
      0,
      v0,
      suMax,
      v0,
      0,
      v1,
      lx[i],
      ly[i],
      rx[i],
      ry[i],
      lx[i + 1],
      ly[i + 1]
    );
    drawSkinnedTriangle(
      ctx,
      img,
      suMax,
      v0,
      suMax,
      v1,
      0,
      v1,
      rx[i],
      ry[i],
      rx[i + 1],
      ry[i + 1],
      lx[i + 1],
      ly[i + 1]
    );
  }
}

/**
 * 将源贴图画布坐标 `(px, py)` 精确映射为当前 Spine 骨骼网格蒙皮后的角色局部坐标 `(x, y)` 与切向角 `angle`，
 * 用于将 15 把神兵严丝合缝锁定在少侠手掌骨骼插槽上，待机呼吸、疾奔前倾、抬手蓄力与突刺挥砍全程零漂移！
 */
export function transformSpinePoint(
  px: number,
  py: number,
  metrics: SpineSpriteMetrics,
  joints: SpineJointRow[]
): { x: number; y: number; angle: number } {
  const v = Math.max(0, Math.min(1, py / Math.max(1, metrics.canvasH)));
  const u = Math.max(0, Math.min(1, px / Math.max(1, metrics.canvasW)));
  const sc = metrics.scale;
  const baseLeftSpan = metrics.anchorX * sc;
  const baseRightSpan = (metrics.canvasW - metrics.anchorX) * sc;

  let idx = 0;
  while (idx < joints.length - 2 && joints[idx + 1].v < v) {
    idx++;
  }
  const j0 = joints[idx];
  const j1 = joints[idx + 1];
  const spanV = Math.max(1e-4, j1.v - j0.v);
  const t = Math.max(0, Math.min(1, (v - j0.v) / spanV));

  const evalRow = (j: SpineJointRow) => {
    const baseY = (j.v * metrics.canvasH - metrics.footY) * sc + 2;
    const jx = j.dx;
    const jy = baseY + j.dy;
    const cosA = Math.cos(j.angle);
    const sinA = Math.sin(j.angle);
    const lSpan = baseLeftSpan * j.leftScale;
    const rSpan = baseRightSpan * j.rightScale;
    const lx = jx - cosA * lSpan;
    const ly = jy - sinA * lSpan;
    const rx = jx + cosA * rSpan;
    const ry = jy + sinA * rSpan;
    return {
      x: lx + (rx - lx) * u,
      y: ly + (ry - ly) * u,
      angle: j.angle,
    };
  };

  const p0 = evalRow(j0);
  const p1 = evalRow(j1);
  return {
    x: p0.x + (p1.x - p0.x) * t,
    y: p0.y + (p1.y - p0.y) * t,
    angle: p0.angle + (p1.angle - p0.angle) * t,
  };
}

// ============================================================================
// 主角李逸承专属 Spine 二阶弹簧骨骼实例 + 6节点物理束发侠客飘带
// ============================================================================

interface RibbonNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

class HeroSpineController {
  private lastTime = -1;
  private smoothLean = 0; // 平滑躯干前倾/后仰像素量 (朝向局部坐标系)
  private leanVel = 0;
  private kneeBounce = 0;
  private kneeVel = 0;
  private hairTrail = 0;
  private hemTrail = 0;
  private ribbon: RibbonNode[] = [];
  private lastWorldX = 0;
  private lastWorldY = 0;

  public solveAndBuildJoints(opts: {
    worldX: number;
    worldY: number;
    facing: 1 | -1;
    vx: number;
    vy: number;
    onGround: boolean;
    runCycle: number;
    animTime: number;
    landSquash: number;
    crouching?: boolean;
    sliding?: boolean;
    diveKicking?: boolean;
    slashProgress: number | null; // 0..1 or null
    slashArchetype?: string;
    skillKind?: string;
    skillProgress?: number | null;
    isStagePreview?: boolean;
  }): { joints: SpineJointRow[]; headWorldOffset: { dx: number; dy: number } } {
    const dt =
      this.lastTime < 0
        ? 0.016
        : Math.min(0.05, Math.max(0.004, Math.abs(opts.animTime - this.lastTime) || 0.016));
    this.lastTime = opts.animTime;

    // 局部朝向速度（正 = 朝面朝方向前进，负 = 疾退/急停）
    const forwardSpeed = opts.vx * opts.facing;
    const absSpd = Math.abs(opts.vx);
    const speedRatio = Math.min(1.25, absSpd / 250);

    // 1. 目标脊柱倾斜量解算（武学绝技多段身姿 / 蓄力拧腰 -> 破空前突！）
    let targetLean = 0;
    let chestLift = 0;
    let ribExpand = 1.0;
    let shoulderTwist = 0;
    let rootFloatY = 0;

    if (opts.skillKind && opts.skillProgress !== undefined && opts.skillProgress !== null) {
      const sp = opts.skillProgress;
      if (opts.skillKind === 'shuofeng_wave') {
        if (sp < 0.28) {
          const w = sp / 0.28;
          targetLean = -14.5 * Math.sin(w * Math.PI * 0.5);
          chestLift = -2.8 * w;
          shoulderTwist = -0.13 * w;
        } else {
          const s = (sp - 0.28) / 0.72;
          const burst = Math.sin(Math.min(1, s * 1.45) * Math.PI * 0.5) * (1 - s * 0.45);
          targetLean = 18.5 * burst;
          chestLift = 2.6 * burst;
          ribExpand = 1.07;
          shoulderTwist = 0.14 * burst;
        }
      } else if (opts.skillKind === 'shunying_flash') {
        if (sp < 0.2) {
          targetLean = -6;
          chestLift = 5.5;
        } else if (sp < 0.68) {
          const u = 1 - (sp - 0.2) / 0.48;
          targetLean = 19.5 * (0.45 + 0.55 * u);
          chestLift = 4.5 * u;
          shoulderTwist = 0.14 * u;
        } else {
          const r = 1 - (sp - 0.68) / 0.32;
          targetLean = 4.5 * r;
          chestLift = -2.2 * (1 - r);
          ribExpand = 1.04;
        }
      } else if (opts.skillKind === 'jinghong_rising') {
        const arc = Math.sin(sp * Math.PI * 0.85);
        targetLean = -7.5 * arc;
        chestLift = -6.8 * arc;
        ribExpand = 1.06;
        shoulderTwist = -0.1 * arc;
      } else if (opts.skillKind === 'taiji_parry') {
        const wave = Math.sin(sp * Math.PI);
        targetLean = -4.8 * wave;
        chestLift = 3.2 * wave;
        ribExpand = 1 + 0.08 * wave;
        shoulderTwist = -0.07 * wave;
      } else if (opts.skillKind === 'jiuyou_soulsteal') {
        const lev = Math.sin(sp * Math.PI);
        targetLean = -5.5 * lev;
        chestLift = -5.5 * lev;
        rootFloatY = -10 * lev;
        ribExpand = 1 + 0.09 * lev;
      } else if (opts.skillKind === 'sub_throw') {
        const flick = Math.sin(sp * Math.PI);
        targetLean = 12 * flick;
        shoulderTwist = 0.1 * flick;
      }
    } else if (opts.slashProgress !== null) {
      const p = opts.slashProgress;
      const isHeavy = opts.slashArchetype === 'greatsword';
      if (p < 0.24) {
        // 出招前摇：拧腰蓄势后拉，如满弓待发！
        const w = p / 0.24;
        targetLean = (isHeavy ? -13 : -8.5) * Math.sin(w * Math.PI * 0.5);
        chestLift = -2.5 * w;
        shoulderTwist = -0.09 * w;
      } else if (p < 0.58) {
        // 挥刃斩出：全身寸劲向前爆发突刺！
        const s = (p - 0.24) / 0.34;
        const punch = Math.sin(s * Math.PI * 0.65);
        targetLean = (isHeavy ? 17 : 13.5) * punch;
        chestLift = 2.2 * punch;
        ribExpand = 1.05;
        shoulderTwist = 0.11 * punch;
      } else {
        // 收刀回气弹性缓冲
        const r = 1 - (p - 0.58) / 0.42;
        targetLean = 11 * r * r;
        shoulderTwist = 0.06 * r;
      }
    } else if (opts.sliding) {
      targetLean = 14;
      chestLift = 4;
    } else if (opts.diveKicking) {
      targetLean = 12;
    } else if (!opts.onGround) {
      // 腾空提纵伸展 / 下坠衣袂鼓风上扬
      targetLean = Math.max(-7, Math.min(11, forwardSpeed * 0.032));
      chestLift = opts.vy < 0 ? -4.2 : 2.5;
      ribExpand = opts.vy < 0 ? 0.97 : 1.03;
    } else if (speedRatio > 0.1) {
      // 地面疾跑/冲刺：随速度自然前倾 + 60fps 步态上下起伏与肩胯反扭！
      const stridePhase = opts.runCycle * 1.57;
      const bob = -Math.abs(Math.sin(stridePhase)) * (4.6 * Math.min(1, speedRatio));
      targetLean = Math.max(-9, Math.min(13.5, forwardSpeed * 0.042));
      chestLift = bob;
      shoulderTwist = Math.sin(stridePhase) * 0.045 * Math.min(1, speedRatio);
      ribExpand = 1 + Math.cos(stridePhase * 2) * 0.022;
    } else {
      // 站立武道呼吸待机：双靴钉地不动，丹田与胸廓深沉吐纳、肩臂微摆！
      const breath = Math.sin(opts.animTime * 2.85);
      const sway = Math.sin(opts.animTime * 1.65);
      targetLean = sway * 1.8;
      chestLift = -breath * 2.4;
      ribExpand = 1 + Math.max(0, breath) * 0.032;
      shoulderTwist = breath * 0.022;
    }

    // 二阶弹簧阻尼积分：产生真实的急停前冲回弹与发梢滞后！
    const stiff = 210;
    const damp = 19;
    const acc = (targetLean - this.smoothLean) * stiff - this.leanVel * damp;
    this.leanVel += acc * dt;
    this.smoothLean += this.leanVel * dt;

    // 着陆屈膝缓冲弹簧
    const targetKnee = opts.landSquash * 9.5 + (opts.crouching ? 5.5 : 0);
    const kAcc = (targetKnee - this.kneeBounce) * 240 - this.kneeVel * 20;
    this.kneeVel += kAcc * dt;
    this.kneeBounce += this.kneeVel * dt;

    // 发冠与下摆衣袂滞后风摆
    const windWave = Math.sin(opts.animTime * 4.4) * 2.2 + Math.sin(opts.animTime * 7.1) * 0.9;
    const targetHair = -forwardSpeed * 0.035 - this.leanVel * 0.04 + windWave;
    const targetHem = Math.max(0, forwardSpeed * 0.045) + Math.abs(windWave) * 0.8;
    this.hairTrail += (targetHair - this.hairTrail) * Math.min(1, dt * 11);
    this.hemTrail += (targetHem - this.hemTrail) * Math.min(1, dt * 9);

    // 构建从发冠 (v=0) 到双靴根部 (v=1) 的 8 行脊柱骨骼节点
    const joints: SpineJointRow[] = V_BANDS.map((v, idx) => {
      // 底部双靴 (v=1.0) 在地面时 100% 钉死在 (0,0)，绝不漂移滑步！
      const heightFactor = 1 - v; // 0(脚底) -> 1(头顶)
      const spineCurve = Math.pow(heightFactor, 1.35);

      let dx = this.smoothLean * spineCurve;
      let dy =
        rootFloatY +
        chestLift * Math.sin(heightFactor * Math.PI * 0.82) +
        this.kneeBounce * Math.sin(v * Math.PI);
      let angle = (this.smoothLean * 0.011 + shoulderTwist) * spineCurve;
      let leftScale = 1.0;
      let rightScale = 1.0;

      if (idx === 0) {
        // 发冠/马尾尖：叠加物理滞后摆动
        dx += this.hairTrail * 0.85;
        angle += this.hairTrail * 0.012;
        leftScale = 1 + Math.max(0, -this.hairTrail) * 0.025;
      } else if (idx === 2 || idx === 3) {
        // 胸腔与双肩：呼吸扩张
        leftScale = ribExpand;
        rightScale = ribExpand;
      } else if (idx === 5 || idx === 6) {
        // 袍摆与膝部：奔跑/下落时后侧下摆迎风向后扬起，而前腿保持凌厉稳定！
        const airBillow = !opts.onGround && opts.vy > 40 ? 0.14 : 0;
        leftScale = 1 + this.hemTrail * 0.018 + airBillow + Math.sin(opts.animTime * 5.2 + idx) * 0.022;
        rightScale = 1 + airBillow * 0.5;
      }

      if (idx === 7 && opts.onGround && !opts.sliding) {
        dx = 0;
        dy = 0;
        angle = 0;
        leftScale = 1;
        rightScale = 1;
      }

      return { v, dx, dy, angle, leftScale, rightScale };
    });

    // 更新世界空间 6 节点 Verlet 侠客束发飘带物理（挂载于头部后脑位置）
    const headLocalX = joints[1].dx - 7;
    const headLocalY = -82 + joints[1].dy;
    const anchorWX = opts.worldX + headLocalX * opts.facing;
    const anchorWY = opts.worldY + headLocalY;

    if (
      !opts.isStagePreview &&
      (this.ribbon.length === 0 ||
        Math.hypot(opts.worldX - this.lastWorldX, opts.worldY - this.lastWorldY) > 140)
    ) {
      this.ribbon = Array.from({ length: 6 }, (_, i) => ({
        x: anchorWX - opts.facing * i * 7,
        y: anchorWY + i * 2,
        vx: 0,
        vy: 0,
      }));
    }
    this.lastWorldX = opts.worldX;
    this.lastWorldY = opts.worldY;

    if (!opts.isStagePreview && this.ribbon.length > 0) {
      this.ribbon[0].x = anchorWX;
      this.ribbon[0].y = anchorWY;
      const segLen = 6.8;
      const windX = -opts.facing * (28 + Math.abs(opts.vx) * 0.18) + Math.sin(opts.animTime * 5.5) * 18;

      for (let i = 1; i < this.ribbon.length; i++) {
        const cur = this.ribbon[i];
        const prev = this.ribbon[i - 1];
        const waveY = Math.cos(opts.animTime * 6.8 - i * 0.85) * 24;
        cur.vx = (cur.vx + windX * dt * 5.5) * Math.pow(0.08, dt);
        cur.vy = (cur.vy + (35 + waveY) * dt * 4.5) * Math.pow(0.08, dt);
        cur.x += cur.vx * dt;
        cur.y += cur.vy * dt;

        const ddx = cur.x - prev.x;
        const ddy = cur.y - prev.y;
        const dist = Math.hypot(ddx, ddy) || 1;
        if (dist > segLen) {
          cur.x = prev.x + (ddx / dist) * segLen;
          cur.y = prev.y + (ddy / dist) * segLen;
        }
      }
    }

    return {
      joints,
      headWorldOffset: { dx: headLocalX, dy: headLocalY },
    };
  }

  /**
   * 在世界空间或试剑台局部空间绘制浓墨勾线侠客束发长带（随风与轻功实时猎猎飞舞！）
   */
  public drawHeadbandRibbon(
    ctx: CanvasRenderingContext2D,
    opts: {
      worldX: number;
      worldY: number;
      facing: 1 | -1;
      animTime: number;
      isXiaoMode?: boolean;
      isStagePreview?: boolean;
    }
  ): void {
    if (opts.isStagePreview) {
      // 兵匣试剑台局部风动飘带
      ctx.save();
      const ax = -8;
      const ay = -81;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 5.2;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      for (let i = 1; i <= 5; i++) {
        const px = ax - i * 6.5;
        const py = ay + i * 1.8 + Math.sin(opts.animTime * 5.4 - i * 0.75) * (2.2 + i * 0.65);
        ctx.lineTo(px, py);
      }
      ctx.stroke();

      ctx.strokeStyle = opts.isXiaoMode ? '#7c3aed' : '#b91c1c';
      ctx.lineWidth = 2.8;
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (this.ribbon.length < 3) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 外层浓墨勾线（与手绘角色黑线笔触 100% 融为一体！）
    for (let i = 0; i < this.ribbon.length - 1; i++) {
      const p0 = this.ribbon[i];
      const p1 = this.ribbon[i + 1];
      const taper = 1 - i / this.ribbon.length;
      ctx.strokeStyle = '#070a12';
      ctx.lineWidth = 2.2 + taper * 3.4;
      ctx.beginPath();
      ctx.moveTo(p0.x - opts.worldX, p0.y - opts.worldY);
      ctx.lineTo(p1.x - opts.worldX, p1.y - opts.worldY);
      ctx.stroke();
    }

    // 内层朱砂赤绸 / 紫电发带色芯
    for (let i = 0; i < this.ribbon.length - 1; i++) {
      const p0 = this.ribbon[i];
      const p1 = this.ribbon[i + 1];
      const taper = 1 - i / this.ribbon.length;
      ctx.strokeStyle = opts.isXiaoMode ? '#a855f7' : '#dc2626';
      ctx.lineWidth = 1.0 + taper * 2.1;
      ctx.beginPath();
      ctx.moveTo(p0.x - opts.worldX, p0.y - opts.worldY);
      ctx.lineTo(p1.x - opts.worldX, p1.y - opts.worldY);
      ctx.stroke();
    }
    ctx.restore();
  }
}

export const HeroSpine = new HeroSpineController();
export const StageHeroSpine = new HeroSpineController();

// ============================================================================
// 全城百鬼妖魔、七大首领与驻场 NPC 实时 60fps Spine 骨骼解算器
// ============================================================================

interface EntitySpineState {
  lean: number;
  leanVel: number;
  lastTime: number;
}

const entityStates = new Map<string | number, EntitySpineState>();

export function buildEntitySpineJoints(opts: {
  key: string | number;
  t: number;
  vx: number;
  facing: 1 | -1;
  flying?: boolean;
  isBoss?: boolean;
  aiState?: 'stalk' | 'windup' | 'lunge_slash' | 'recover' | 'staggered';
  hurtFlash?: number;
  castAnimTimer?: number;
  animPhase?: number;
  isGracefulNpc?: boolean;
}): SpineJointRow[] {
  let st = entityStates.get(opts.key);
  if (!st) {
    st = { lean: 0, leanVel: 0, lastTime: opts.t };
    entityStates.set(opts.key, st);
    if (entityStates.size > 120) {
      const firstKey = entityStates.keys().next().value;
      if (firstKey !== undefined) entityStates.delete(firstKey);
    }
  }

  const dt = Math.min(0.05, Math.max(0.004, opts.t - st.lastTime || 0.016));
  st.lastTime = opts.t;

  const phase = opts.animPhase ?? opts.t * 3.2;
  const speedRatio = Math.min(1.2, Math.abs(opts.vx) / 140);

  let targetLean = 0;
  let chestLift = 0;
  let ribExpand = 1.0;
  let twist = 0;

  // 1. 受击瞬间脊柱猛烈向后震仰（刀刀入肉骨骼受击反馈！）
  if (opts.hurtFlash && opts.hurtFlash > 0) {
    targetLean = -14.5;
    chestLift = -2.5;
    twist = -0.12;
  } else if (opts.aiState === 'staggered') {
    // 破招失衡摇晃
    targetLean = Math.sin(opts.t * 14) * 7.5;
    chestLift = 3.5;
    twist = Math.sin(opts.t * 14) * 0.08;
  } else if (opts.aiState === 'windup') {
    // 妖魔/首领蓄力前摇：仰身蓄势拉弓，肢体语言极具压迫感！
    targetLean = opts.isBoss ? -13.5 : -10.5;
    chestLift = -3.8;
    ribExpand = 1.06;
    twist = -0.1;
  } else if (opts.aiState === 'lunge_slash') {
    // 扑杀突斩：脊柱猛然前压探出！
    targetLean = opts.isBoss ? 18 : 14;
    chestLift = 2.5;
    ribExpand = 1.05;
    twist = 0.13;
  } else if (opts.castAnimTimer && opts.castAnimTimer > 0) {
    // 远程施法 / 掷斧 / 吐毒 / 甩针瞬间：前半段收胸蓄劲、后半段猛然振臂前探！
    const cp = 1 - Math.min(1, opts.castAnimTimer / 0.36);
    targetLean = cp < 0.3 ? -7.5 : 11.5 * Math.sin(((cp - 0.3) / 0.7) * Math.PI);
    chestLift = cp < 0.3 ? -2.8 : 2.2;
    ribExpand = 1.055;
    twist = cp < 0.3 ? -0.07 : 0.09;
  } else if (opts.flying) {
    // 飞天妖邪/大鹏/傩神：双翼与飘带随气流波浪舒展起伏！
    const wave = Math.sin(opts.t * 4.2 + Number(opts.key || 0));
    targetLean = speedRatio * 7 + wave * 3.5;
    chestLift = wave * 3.6;
    ribExpand = 1 + Math.sin(opts.t * 5.6) * 0.055;
    twist = wave * 0.045;
  } else if (speedRatio > 0.12) {
    // 地面妖邪迈步追猎：压低身形前倾 + 步伐颠簸！
    const bob = -Math.abs(Math.sin(phase * 1.2)) * 3.8;
    targetLean = 7.5 * speedRatio;
    chestLift = bob;
    twist = Math.sin(phase * 1.2) * 0.04;
  } else {
    // 驻场真人 NPC（苏清晏/欧冶残/白掌柜）与待机妖魔：自然胸腔吐纳与衣袖轻拂！
    const rate = opts.isGracefulNpc ? 2.4 : 3.1;
    const breath = Math.sin(opts.t * rate + (typeof opts.key === 'number' ? opts.key : 1.7));
    const sway = Math.sin(opts.t * (rate * 0.58));
    targetLean = sway * (opts.isGracefulNpc ? 2.0 : 2.8);
    chestLift = -breath * (opts.isGracefulNpc ? 2.2 : 2.8);
    ribExpand = 1 + Math.max(0, breath) * 0.034;
    twist = sway * 0.025;
  }

  const acc = (targetLean - st.lean) * 190 - st.leanVel * 17;
  st.leanVel += acc * dt;
  st.lean += st.leanVel * dt;

  return V_BANDS.map((v, idx) => {
    const hf = 1 - v;
    const curve = Math.pow(hf, 1.3);
    let dx = st.lean * curve;
    let dy = chestLift * Math.sin(hf * Math.PI * 0.85);
    let angle = (st.lean * 0.01 + twist) * curve;
    let leftScale = 1.0;
    let rightScale = 1.0;

    if (idx === 1 || idx === 2 || idx === 3) {
      leftScale = ribExpand;
      rightScale = ribExpand;
    } else if (idx === 5 || idx === 6) {
      // 衣袍与披风下摆随风柔美曳动
      const clothWave = Math.sin(opts.t * 3.8 - idx * 0.9) * 0.032;
      leftScale = 1 + clothWave + Math.max(0, speedRatio * 0.04);
      rightScale = 1 - clothWave * 0.5;
    }

    if (idx === 7 && !opts.flying) {
      dx = 0;
      dy = 0;
      angle = 0;
      leftScale = 1;
      rightScale = 1;
    }

    return { v, dx, dy, angle, leftScale, rightScale };
  });
}
