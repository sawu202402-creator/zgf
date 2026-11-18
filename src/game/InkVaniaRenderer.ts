import { BuiltRoom, RoomProp, TILE_SIZE } from '../data/worldMap';
import { drawHeroCharacter, drawMonsterOrBoss, drawWorldDrop } from './CharacterArt';
import { GameEngine } from './GameEngine';
import { InputController } from './MotionInput';

function hash2D(x: number, y: number): number {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export class InkVaniaRenderer {
  private roomCanvas: HTMLCanvasElement | null = null;
  private cachedRoomKey = '';
  private cachedBrokenCount = -1;
  private ambientTime = 0;

  public render(
    ctx: CanvasRenderingContext2D,
    viewW: number,
    viewH: number,
    engine: GameEngine,
    input: InputController,
    dt: number
  ): void {
    this.ambientTime += dt;

    if (!engine.room || !engine.slot) {
      this.renderEpicTitlePanorama(ctx, viewW, viewH);
      return;
    }

    const room = engine.room;

    // 全屏无黑边自适应横版卷轴相机（锁定虚拟高度 430px，人物饱满清晰，视野开阔！）
    const vH = Math.min(room.pixelH, 430);
    const scale = viewH / vH;
    const vW = viewW / scale;

    let camLeft = engine.camX - vW * 0.5;
    let camTop = engine.camY - vH * 0.5;
    if (room.pixelW <= vW) {
      camLeft = (room.pixelW - vW) * 0.5;
    } else {
      camLeft = Math.max(0, Math.min(room.pixelW - vW, camLeft));
    }
    if (room.pixelH <= vH) {
      camTop = (room.pixelH - vH) * 0.5;
    } else {
      camTop = Math.max(0, Math.min(room.pixelH - vH, camTop));
    }

    const shakeX = engine.screenShake > 0 ? (Math.random() - 0.5) * engine.screenShake * 1.5 : 0;
    const shakeY = engine.screenShake > 0 ? (Math.random() - 0.5) * engine.screenShake * 1.5 : 0;

    ctx.save();
    ctx.scale(scale, scale);

    // 1. 远景血月/妖月苍穹与层峦飞檐视差背景（铺满全视口）
    this.renderParallaxSkyAndMountains(ctx, vW, vH, camLeft, camTop, room);

    // 2. 世界空间平移渲染
    ctx.translate(-camLeft + shakeX, -camTop + shakeY);

    this.renderRoomProps(ctx, room);
    this.ensureBakedRoomTiles(engine);
    if (this.roomCanvas) {
      ctx.drawImage(this.roomCanvas, 0, 0);
    }

    this.renderDynamicGatesAndTraps(ctx, room);
    this.renderRoomFixturesAndNPCs(ctx, engine);
    this.renderGrappleLanterns(ctx, engine);

    for (const d of engine.drops) {
      drawWorldDrop(ctx, d, this.ambientTime);
    }

    this.renderAfterImages(ctx, engine);

    for (const e of engine.enemies) {
      drawMonsterOrBoss(ctx, e, this.ambientTime);
    }

    drawHeroCharacter(ctx, engine, this.ambientTime);
    this.renderActiveSlash(ctx, engine);
    this.renderProjectiles(ctx, engine);
    this.renderParticlesAndFloats(ctx, engine);

    ctx.restore();

    // 3. 屏幕空间手搓绝技书法横幅与全屏光效
    this.renderScreenSkillOverlays(ctx, viewW, viewH, engine);

    // 4. 移动端虚拟摇杆与国风动作轮盘
    if (input.usingTouch && !input.uiBlocked && !engine.paused) {
      this.renderVirtualControls(ctx, input);
    }
  }

  // ==================== 史诗级国风恶魔城标题原画全景 ====================
  private renderEpicTitlePanorama(
    ctx: CanvasRenderingContext2D,
    viewW: number,
    viewH: number
  ): void {
    const sky = ctx.createLinearGradient(0, 0, 0, viewH);
    sky.addColorStop(0, '#05070e');
    sky.addColorStop(0.45, '#190d1a');
    sky.addColorStop(0.82, '#2a1018');
    sky.addColorStop(1, '#080a10');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, viewW, viewH);

    // 苍穹巨型甲子血月与月面暗纹
    const mx = viewW * 0.66;
    const my = viewH * 0.36;
    const mr = Math.min(viewW, viewH) * 0.25;

    const halo = ctx.createRadialGradient(mx, my, mr * 0.4, mx, my, mr * 2.4);
    halo.addColorStop(0, 'rgba(220, 38, 38, 0.52)');
    halo.addColorStop(0.45, 'rgba(153, 27, 27, 0.22)');
    halo.addColorStop(1, 'rgba(5, 7, 14, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, viewW, viewH);

    const moonGrad = ctx.createRadialGradient(mx - mr * 0.2, my - mr * 0.2, mr * 0.1, mx, my, mr);
    moonGrad.addColorStop(0, '#fca5a5');
    moonGrad.addColorStop(0.45, '#dc2626');
    moonGrad.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fill();

    // 远景连绵水墨群峰
    ctx.fillStyle = '#111320';
    ctx.beginPath();
    ctx.moveTo(0, viewH);
    ctx.lineTo(0, viewH * 0.68);
    ctx.lineTo(viewW * 0.18, viewH * 0.54);
    ctx.lineTo(viewW * 0.36, viewH * 0.66);
    ctx.lineTo(viewW * 0.54, viewH * 0.48);
    ctx.lineTo(viewW * 0.78, viewH * 0.64);
    ctx.lineTo(viewW, viewH * 0.5);
    ctx.lineTo(viewW, viewH);
    ctx.closePath();
    ctx.fill();

    // 血月前恢弘九幽玄城飞檐楼阙群剪影（致敬恶魔城德古拉古堡轮廓！）
    const drawPagodaTower = (cx: number, baseY: number, tiers: number, scaleW: number) => {
      ctx.fillStyle = '#090b12';
      ctx.strokeStyle = 'rgba(226, 182, 89, 0.22)';
      ctx.lineWidth = 1;
      for (let i = 0; i < tiers; i++) {
        const w = (tiers - i * 0.62) * scaleW;
        const y = baseY - i * (scaleW * 0.85);
        ctx.fillRect(cx - w * 0.42, y - scaleW * 0.8, w * 0.84, scaleW * 0.85);
        ctx.beginPath();
        ctx.moveTo(cx - w * 0.68, y - scaleW * 0.72);
        ctx.quadraticCurveTo(cx, y - scaleW * 1.15, cx + w * 0.68, y - scaleW * 0.72);
        ctx.lineTo(cx + w * 0.46, y - scaleW * 0.62);
        ctx.lineTo(cx - w * 0.46, y - scaleW * 0.62);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 宫灯暖窗亮点
        ctx.fillStyle = 'rgba(251, 191, 36, 0.65)';
        ctx.fillRect(cx - 3, y - scaleW * 0.5, 6, 10);
        ctx.fillStyle = '#090b12';
      }
      // 塔刹尖顶
      ctx.beginPath();
      ctx.moveTo(cx - 3, baseY - tiers * scaleW * 0.85);
      ctx.lineTo(cx, baseY - tiers * scaleW * 0.85 - 32);
      ctx.lineTo(cx + 3, baseY - tiers * scaleW * 0.85);
      ctx.fill();
    };

    drawPagodaTower(mx - mr * 0.55, viewH * 0.74, 4, 28);
    drawPagodaTower(mx + mr * 0.48, viewH * 0.76, 3, 26);
    drawPagodaTower(mx, viewH * 0.72, 6, 34);

    // 近景左下飞檐屋脊 + 18岁少年李逸承迎风执剑背影剪影！
    ctx.fillStyle = '#05070c';
    ctx.beginPath();
    ctx.moveTo(viewW * 0.48, viewH);
    ctx.quadraticCurveTo(viewW * 0.64, viewH * 0.82, viewW * 0.88, viewH * 0.76);
    ctx.lineTo(viewW * 0.92, viewH * 0.72);
    ctx.lineTo(viewW * 0.94, viewH);
    ctx.closePath();
    ctx.fill();

    // 屋脊上的李逸承剪影与猎猎红披风
    const hx = viewW * 0.79;
    const hy = viewH * 0.77;
    const wave = Math.sin(this.ambientTime * 6) * 10;
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(hx - 4, hy - 44);
    ctx.quadraticCurveTo(hx - 45, hy - 34 + wave, hx - 68, hy - 12 - wave * 0.6);
    ctx.lineTo(hx - 32, hy - 6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#090d16';
    ctx.strokeStyle = '#e2b659';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(hx - 8, hy - 46);
    ctx.lineTo(hx + 8, hy - 46);
    ctx.lineTo(hx + 11, hy);
    ctx.lineTo(hx - 11, hy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(hx, hy - 54, 7.5, 0, Math.PI * 2);
    ctx.fill();
    // 斜指苍穹寒剑
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(hx + 6, hy - 28);
    ctx.lineTo(hx + 46, hy - 58);
    ctx.stroke();

    // 漫天飞舞流萤火星与雾气带
    for (let i = 0; i < 34; i++) {
      const px = ((i * 197 + this.ambientTime * (24 + (i % 5) * 8)) % (viewW + 40)) - 20;
      const py =
        viewH -
        (((i * 131 + this.ambientTime * (18 + (i % 4) * 7)) % (viewH + 30)) - 15);
      ctx.fillStyle = i % 3 === 0 ? 'rgba(250, 204, 21, 0.62)' : 'rgba(239, 68, 68, 0.52)';
      ctx.beginPath();
      ctx.arc(px, py, 1.5 + (i % 2.5), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ==================== 局内多层国风视差城池天幕 ====================
  private renderParallaxSkyAndMountains(
    ctx: CanvasRenderingContext2D,
    vW: number,
    vH: number,
    camLeft: number,
    camTop: number,
    room: BuiltRoom
  ): void {
    const inv = room.realm === 'inverted';
    const grad = ctx.createLinearGradient(0, 0, 0, vH);
    if (inv) {
      grad.addColorStop(0, '#160824');
      grad.addColorStop(0.5, '#251038');
      grad.addColorStop(1, '#11091c');
    } else if (room.region === 'forge') {
      grad.addColorStop(0, '#140a0c');
      grad.addColorStop(0.6, '#29110d');
      grad.addColorStop(1, '#3b150c');
    } else if (room.region === 'prison') {
      grad.addColorStop(0, '#07121a');
      grad.addColorStop(1, '#0d232b');
    } else {
      grad.addColorStop(0, '#090d18');
      grad.addColorStop(0.55, '#151c2e');
      grad.addColorStop(1, '#1c1522');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, vW, vH);

    // 血月/紫蚀妖月视差
    const mx = vW * 0.72 - camLeft * 0.04;
    const my = (inv ? vH * 0.72 : vH * 0.24) - camTop * 0.03;
    const halo = ctx.createRadialGradient(mx, my, 12, mx, my, 125);
    halo.addColorStop(0, inv ? 'rgba(192, 132, 252, 0.35)' : 'rgba(220, 38, 38, 0.34)');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(mx, my, 125, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = inv ? 'rgba(216, 180, 254, 0.42)' : 'rgba(239, 68, 68, 0.44)';
    ctx.beginPath();
    ctx.arc(mx, my, 46, 0, Math.PI * 2);
    ctx.fill();

    // 远景群山与宫阙剪影带 (0.18x 视差)
    const pShift = -(camLeft * 0.18) % 320;
    ctx.fillStyle = inv ? 'rgba(18, 9, 30, 0.75)' : 'rgba(10, 14, 24, 0.78)';
    for (let x = pShift - 320; x < vW + 320; x += 320) {
      ctx.beginPath();
      ctx.moveTo(x, vH);
      ctx.lineTo(x, vH * 0.65);
      ctx.lineTo(x + 95, vH * 0.48);
      ctx.lineTo(x + 175, vH * 0.62);
      ctx.lineTo(x + 250, vH * 0.44);
      ctx.lineTo(x + 320, vH * 0.65);
      ctx.lineTo(x + 320, vH);
      ctx.closePath();
      ctx.fill();

      // 远处楼阁飞檐剪影
      ctx.fillRect(x + 232, vH * 0.36, 36, 40);
      ctx.beginPath();
      ctx.moveTo(x + 220, vH * 0.37);
      ctx.quadraticCurveTo(x + 250, vH * 0.31, x + 280, vH * 0.37);
      ctx.fill();
    }

    // 中景古殿拱廊暗影与窗格底纹 (0.42x 视差)
    const archShift = -(camLeft * 0.42) % 200;
    ctx.strokeStyle = 'rgba(226, 182, 89, 0.08)';
    ctx.lineWidth = 2;
    for (let x = archShift - 200; x < vW + 200; x += 200) {
      ctx.fillStyle = 'rgba(8, 11, 18, 0.38)';
      ctx.fillRect(x, 0, 22, vH);
      ctx.beginPath();
      ctx.arc(x + 111, vH * 0.36, 62, Math.PI, 0);
      ctx.stroke();
    }
  }

  // ==================== 房间内丰富古风建筑陈设渲染 ====================
  private renderRoomProps(ctx: CanvasRenderingContext2D, room: BuiltRoom): void {
    for (const pr of room.props) {
      this.drawSingleProp(ctx, pr);
    }
  }

  private drawSingleProp(ctx: CanvasRenderingContext2D, pr: RoomProp): void {
    ctx.save();
    ctx.translate(pr.x, pr.y);

    if (pr.kind === 'palace_pillar') {
      // 朱红金箍盘龙殿柱 + 须弥石础
      ctx.fillStyle = '#475569';
      ctx.fillRect(-20, -14, 40, 14);
      const pg = ctx.createLinearGradient(-14, 0, 14, 0);
      pg.addColorStop(0, '#450a0a');
      pg.addColorStop(0.45, '#991b1b');
      pg.addColorStop(1, '#3b0808');
      ctx.fillStyle = pg;
      ctx.fillRect(-14, -340, 28, 326);
      ctx.fillStyle = '#e2b659';
      ctx.fillRect(-15, -280, 30, 5);
      ctx.fillRect(-15, -160, 30, 5);
      ctx.fillRect(-15, -36, 30, 4);
    } else if (pr.kind === 'bamboo_cluster') {
      // 夜风摇曳青翠苦竹丛
      const sway = Math.sin(this.ambientTime * 2.2 + pr.x * 0.02) * 8;
      for (const dx of [-14, -2, 11]) {
        ctx.strokeStyle = dx === -2 ? '#1f6f5c' : '#134e4a';
        ctx.lineWidth = dx === -2 ? 4.5 : 3.2;
        ctx.beginPath();
        ctx.moveTo(dx, 0);
        ctx.quadraticCurveTo(dx + sway * 0.4, -110, dx + sway, -220);
        ctx.stroke();
        // 竹节与竹叶
        ctx.fillStyle = '#2dd4bf';
        for (let h = -55; h >= -200; h -= 48) {
          ctx.beginPath();
          ctx.ellipse(dx + sway * (-h / 220) + 10, h, 11, 3, 0.35, 0, Math.PI * 2);
          ctx.ellipse(dx + sway * (-h / 220) - 9, h - 12, 10, 2.8, -0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (pr.kind === 'torii_gate') {
      // 沧桑飞檐石牌坊
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.fillRect(-52, -175, 14, 175);
      ctx.fillRect(38, -175, 14, 175);
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(-68, -165, 136, 14);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-84, -162);
      ctx.quadraticCurveTo(0, -196, 84, -162);
      ctx.lineTo(72, -150);
      ctx.lineTo(-72, -150);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // 匾额
      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = '#e2b659';
      ctx.fillRect(-24, -164, 48, 18);
      ctx.strokeRect(-24, -164, 48, 18);
    } else if (pr.kind === 'lattice_window') {
      // 暖黄烛光雕花宫窗
      const glow = ctx.createRadialGradient(0, -60, 8, 0, -60, 85);
      glow.addColorStop(0, 'rgba(251, 191, 36, 0.24)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, -60, 85, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-28, -110, 56, 95, 6);
      ctx.fill();
      ctx.stroke();
      for (let wy = -90; wy <= -30; wy += 20) {
        ctx.beginPath();
        ctx.moveTo(-28, wy);
        ctx.lineTo(28, wy);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, -110);
      ctx.lineTo(0, -15);
      ctx.stroke();
    } else if (pr.kind === 'wall_torch') {
      // 铜壁灯动态暖火光池
      const flick = Math.sin(this.ambientTime * 16 + pr.x) * 3;
      const g = ctx.createRadialGradient(0, -12, 3, 0, -12, 95 + flick * 2);
      g.addColorStop(0, 'rgba(251, 146, 60, 0.42)');
      g.addColorStop(0.5, 'rgba(234, 88, 12, 0.14)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, -12, 96, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#b45309';
      ctx.fillRect(-3, -6, 6, 20);
      ctx.fillRect(-8, -8, 16, 4);
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(-6, -8);
      ctx.quadraticCurveTo(0, -26 - flick, 6, -8);
      ctx.fill();
    } else if (pr.kind === 'bookshelf') {
      // 藏书阁紫檀万卷高架
      ctx.fillStyle = '#29150e';
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2;
      ctx.fillRect(-38, -170, 76, 170);
      ctx.strokeRect(-38, -170, 76, 170);
      for (let sy = -135; sy <= -35; sy += 34) {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-36, sy, 72, 4);
        for (let bx = -30; bx <= 24; bx += 9) {
          ctx.fillStyle = bx % 2 === 0 ? '#1e40af' : '#991b1b';
          ctx.fillRect(bx, sy - 24, 6, 24);
        }
      }
    } else if (pr.kind === 'forge_furnace') {
      // 赤火铸剑坊八卦熔炉
      const fg = ctx.createRadialGradient(0, -50, 8, 0, -50, 110);
      fg.addColorStop(0, 'rgba(249, 115, 22, 0.46)');
      fg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(0, -50, 110, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#431407';
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-34, -110, 68, 110, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, -45, 16, 0, Math.PI * 2);
      ctx.fill();
    } else if (pr.kind === 'weapon_rack') {
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 4;
      ctx.strokeRect(-28, -56, 56, 56);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.5;
      for (const wy of [-44, -28, -14]) {
        ctx.beginPath();
        ctx.moveTo(-36, wy);
        ctx.lineTo(36, wy);
        ctx.stroke();
      }
    } else if (pr.kind === 'stone_statue') {
      ctx.fillStyle = '#334155';
      ctx.fillRect(-20, -24, 40, 24);
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(-14, -72, 28, 48, 8);
      ctx.fill();
    } else if (pr.kind === 'opera_curtain') {
      ctx.fillStyle = 'rgba(159, 18, 57, 0.65)';
      ctx.beginPath();
      ctx.moveTo(-48, -220);
      ctx.quadraticCurveTo(-24, -140, -42, 0);
      ctx.lineTo(-56, 0);
      ctx.lineTo(-56, -220);
      ctx.moveTo(48, -220);
      ctx.quadraticCurveTo(24, -140, 42, 0);
      ctx.lineTo(56, 0);
      ctx.lineTo(56, -220);
      ctx.fill();
    } else if (pr.kind === 'giant_bell') {
      ctx.fillStyle = '#854d0e';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-24, -90);
      ctx.lineTo(24, -90);
      ctx.lineTo(34, -20);
      ctx.lineTo(-34, -20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (pr.kind === 'silk_banner') {
      const wave = Math.sin(this.ambientTime * 3 + pr.x) * 5;
      ctx.fillStyle = '#991b1b';
      ctx.strokeStyle = '#e2b659';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(14, 0);
      ctx.lineTo(14 + wave, 95);
      ctx.lineTo(wave, 112);
      ctx.lineTo(-14 + wave, 95);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  // ==================== 离屏烘焙高细节立体青石城砖与朱漆雕栏跳台 ====================
  private ensureBakedRoomTiles(engine: GameEngine): void {
    const room = engine.room!;
    const brokenCnt = engine.slot?.brokenSecretWalls.length || 0;
    const key = `${room.realm}:${room.id}`;
    if (this.roomCanvas && this.cachedRoomKey === key && this.cachedBrokenCount === brokenCnt) {
      return;
    }

    this.cachedRoomKey = key;
    this.cachedBrokenCount = brokenCnt;
    if (!this.roomCanvas) {
      this.roomCanvas = document.createElement('canvas');
    }
    this.roomCanvas.width = room.pixelW;
    this.roomCanvas.height = room.pixelH;

    const bctx = this.roomCanvas.getContext('2d')!;
    bctx.clearRect(0, 0, room.pixelW, room.pixelH);

    const inv = room.realm === 'inverted';
    for (let r = 0; r < room.rows; r++) {
      for (let c = 0; c < room.cols; c++) {
        const t = room.tiles[r][c];
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        if (t === 1 || t === 6) {
          const n = hash2D(c, r);
          // 立体青灰条石底座
          bctx.fillStyle = inv
            ? n > 0.5
              ? '#261a38'
              : '#1f1530'
            : n > 0.5
              ? '#1e2736'
              : '#171f2c';
          bctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

          // 错缝砖纹刻线（奇偶行错开半砖，彻底消除呆板方格感！）
          bctx.strokeStyle = 'rgba(7, 10, 16, 0.72)';
          bctx.lineWidth = 1.5;
          bctx.beginPath();
          bctx.moveTo(x, y + 20);
          bctx.lineTo(x + TILE_SIZE, y + 20);
          const split1 = r % 2 === 0 ? 18 : 8;
          const split2 = r % 2 === 0 ? 8 : 28;
          bctx.moveTo(x + split1, y);
          bctx.lineTo(x + split1, y + 20);
          bctx.moveTo(x + split2, y + 20);
          bctx.lineTo(x + split2, y + TILE_SIZE);
          bctx.stroke();

          // 砖面上沿微高光
          bctx.fillStyle = 'rgba(148, 163, 184, 0.09)';
          bctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, 3);
          bctx.fillRect(x + 2, y + 22, TILE_SIZE - 4, 3);

          // 暴露顶面：铺设厚重青石压顶石板 + 琉璃苔金边！
          if (r > 0 && room.tiles[r - 1][c] === 0) {
            bctx.fillStyle = inv ? '#4c1d95' : '#334155';
            bctx.fillRect(x, y, TILE_SIZE, 8);
            bctx.fillStyle = inv ? '#c084fc' : '#64748b';
            bctx.fillRect(x, y, TILE_SIZE, 2.5);
          }

          // 底部阴影遮蔽 AO
          if (r < room.rows - 1 && room.tiles[r + 1][c] === 0) {
            bctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
            bctx.fillRect(x, y + TILE_SIZE - 5, TILE_SIZE, 5);
          }

          // 隐藏可破坏宝墙裂纹
          if (t === 6) {
            bctx.strokeStyle = 'rgba(250, 204, 21, 0.52)';
            bctx.lineWidth = 1.6;
            bctx.beginPath();
            bctx.moveTo(x + 6, y + 8);
            bctx.lineTo(x + 22, y + 20);
            bctx.lineTo(x + 14, y + 34);
            bctx.stroke();
          }
        } else if (t === 2) {
          // 朱漆描金雕栏木阁楼平台（含下挂雀替斗拱与上沿矮栏杆！）
          bctx.fillStyle = '#451a03';
          bctx.fillRect(x, y + 8, TILE_SIZE, 6);
          bctx.fillStyle = '#7f1d1d';
          bctx.fillRect(x, y, TILE_SIZE, 9);
          bctx.fillStyle = '#e2b659';
          bctx.fillRect(x, y, TILE_SIZE, 2.5);
          // 斗拱斜撑
          bctx.fillStyle = '#78350f';
          bctx.fillRect(x + 6, y + 14, 5, 7);
          bctx.fillRect(x + TILE_SIZE - 11, y + 14, 5, 7);
          // 装饰矮护栏纹
          bctx.strokeStyle = 'rgba(226, 182, 89, 0.32)';
          bctx.lineWidth = 1.2;
          bctx.strokeRect(x + 4, y - 9, TILE_SIZE - 8, 9);
        }
      }
    }
  }

  private renderDynamicGatesAndTraps(ctx: CanvasRenderingContext2D, room: BuiltRoom): void {
    for (let r = 0; r < room.rows; r++) {
      for (let c = 0; c < room.cols; c++) {
        const t = room.tiles[r][c];
        if (t < 3 || t === 6) continue;
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        if (t === 3) {
          ctx.fillStyle = '#292018';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = '#fb923c';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(x + 4, y + 6);
          ctx.lineTo(x + 20, y + 22);
          ctx.lineTo(x + 35, y + 12);
          ctx.moveTo(x + 20, y + 22);
          ctx.lineTo(x + 14, y + 36);
          ctx.stroke();
        } else if (t === 4) {
          ctx.fillStyle = '#475569';
          for (let bx = 6; bx < TILE_SIZE; bx += 11) {
            ctx.fillRect(x + bx, y, 4, TILE_SIZE);
          }
          ctx.fillStyle = '#e2b659';
          ctx.fillRect(x, y + 18, TILE_SIZE, 4);
        } else if (t === 5) {
          const pulse = 0.45 + Math.sin(this.ambientTime * 4 + r) * 0.2;
          ctx.fillStyle = `rgba(168, 85, 247, ${pulse})`;
          ctx.fillRect(x + 3, y, TILE_SIZE - 6, TILE_SIZE);
        } else if (t === 7) {
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          for (let sx = 0; sx < TILE_SIZE; sx += 10) {
            ctx.moveTo(x + sx, y + TILE_SIZE);
            ctx.lineTo(x + sx + 5, y + 10);
            ctx.lineTo(x + sx + 10, y + TILE_SIZE);
          }
          ctx.fill();
        }
      }
    }
  }

  private renderRoomFixturesAndNPCs(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    const room = engine.room!;
    const cx = room.focalX;
    const gy = room.focalY;

    if (room.special === 'save_shrine') {
      // 精致国风飞檐镇魂土地祠 + 青铜香炉袅袅青烟！
      const halo = ctx.createRadialGradient(cx, gy - 55, 10, cx, gy - 55, 130);
      halo.addColorStop(0, 'rgba(250, 204, 21, 0.34)');
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, gy - 55, 130, 0, Math.PI * 2);
      ctx.fill();

      // 石砌神龛基座与朱柱
      ctx.fillStyle = '#334155';
      ctx.fillRect(cx - 38, gy - 14, 76, 14);
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(cx - 28, gy - 72, 8, 58);
      ctx.fillRect(cx + 20, gy - 72, 8, 58);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx - 20, gy - 68, 40, 54);

      // 琉璃飞檐宝顶
      ctx.fillStyle = '#0f766e';
      ctx.strokeStyle = '#e2b659';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx - 50, gy - 68);
      ctx.quadraticCurveTo(cx, gy - 104, cx + 50, gy - 68);
      ctx.lineTo(cx + 38, gy - 60);
      ctx.lineTo(cx - 38, gy - 60);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 龛中长明镇魂灯
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(cx, gy - 38, 7 + Math.sin(this.ambientTime * 6) * 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (room.special === 'warp_bagua') {
      ctx.save();
      ctx.translate(cx, gy - 6);
      ctx.scale(1, 0.3);
      ctx.rotate(this.ambientTime * 1.4);
      ctx.strokeStyle = '#48c9b0';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 56, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#e2b659';
      ctx.strokeRect(-38, -38, 76, 76);
      ctx.restore();
    } else if (room.special === 'npc_smith') {
      this.drawDetailedNpc(ctx, cx, gy, '#ea580c', '#fed7aa', '欧冶残 · 独臂神匠');
    } else if (room.special === 'npc_merchant') {
      this.drawDetailedNpc(ctx, cx, gy, '#ca8a04', '#fef08a', '白掌柜 · 子夜鬼市');
    } else if (room.special === 'npc_su_qingyan') {
      this.drawDetailedNpc(ctx, cx, gy, '#0284c7', '#bae6fd', '苏清晏 · 钦天监司辰');
    }

    if (
      room.id === 'altar_save' &&
      engine.slot?.defeatedBosses.includes('normal:boss_pei_wuji')
    ) {
      const px = 5 * TILE_SIZE;
      ctx.save();
      ctx.translate(px, gy - 46);
      ctx.rotate(this.ambientTime * 2.2);
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3;
      ctx.strokeRect(-22, -22, 44, 44);
      ctx.restore();
    }
  }

  private drawDetailedNpc(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    robeColor: string,
    trimColor: string,
    label: string
  ): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 1, 16, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = robeColor;
    ctx.strokeStyle = trimColor;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-10, -44);
    ctx.lineTo(10, -44);
    ctx.lineTo(15, 0);
    ctx.lineTo(-15, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f6dac0';
    ctx.beginPath();
    ctx.arc(0, -52, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, -55, 8.8, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();

    ctx.font = 'bold 12px "STKaiti", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    ctx.fillText(label, 0, -70);
    ctx.restore();
  }

  private renderGrappleLanterns(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    const room = engine.room!;
    const unlocked = engine.hasAbility('grapple_hook');
    for (const l of room.lanterns) {
      ctx.strokeStyle = '#78716c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(l.x, Math.max(0, l.y - 180));
      ctx.lineTo(l.x, l.y);
      ctx.stroke();

      const glow = ctx.createRadialGradient(l.x, l.y, 4, l.x, l.y, 58);
      glow.addColorStop(0, 'rgba(239, 68, 68, 0.52)');
      glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(l.x, l.y, 58, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(l.x, l.y, 13, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // 灯穗
      ctx.strokeStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(l.x, l.y + 16);
      ctx.lineTo(l.x, l.y + 26);
      ctx.stroke();

      if (unlocked && Math.hypot(l.x - engine.player.x, l.y - (engine.player.y - 32)) <= 290) {
        ctx.strokeStyle = '#48c9b0';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(l.x, l.y, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  private renderAfterImages(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    for (const ai of engine.afterImages) {
      ctx.save();
      ctx.globalAlpha = ai.alpha * 0.5;
      ctx.fillStyle = ai.color;
      ctx.beginPath();
      ctx.roundRect(ai.x - 10, ai.y - 54, 20, 54, 6);
      ctx.fill();
      ctx.restore();
    }
  }

  private renderActiveSlash(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    const sl = engine.activeSlash;
    if (!sl) return;

    ctx.save();
    ctx.translate(sl.x, sl.y);

    if (sl.pogoDown) {
      ctx.strokeStyle = sl.glowColor;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(sl.facing * 24, 52);
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (sl.archetype === 'greatsword') {
      ctx.scale(sl.facing, 1);
      const startAng = -Math.PI * 0.88;
      const endAng = startAng + Math.PI * 1.3 * Math.min(1, sl.progress * 1.25);
      ctx.strokeStyle = sl.glowColor;
      ctx.lineWidth = 24 * (1 - sl.progress * 0.45);
      ctx.beginPath();
      ctx.arc(0, 4, sl.reachX * 0.88, startAng, endAng);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8 * (1 - sl.progress * 0.4);
      ctx.beginPath();
      ctx.arc(0, 4, sl.reachX * 0.92, startAng + 0.18, endAng);
      ctx.stroke();
    } else if (sl.archetype === 'spear') {
      const ang = sl.aimY < -0.5 ? -Math.PI * 0.28 * sl.facing : 0;
      ctx.rotate(ang);
      const len = sl.reachX * Math.sin(Math.min(1, sl.progress * 1.35) * Math.PI * 0.65);
      ctx.strokeStyle = sl.glowColor;
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(-sl.facing * 12, 0);
      ctx.lineTo(sl.facing * len, 0);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(sl.facing * (len + 16), 0);
      ctx.lineTo(sl.facing * (len - 10), -7);
      ctx.lineTo(sl.facing * (len - 10), 7);
      ctx.closePath();
      ctx.fill();
    } else if (sl.archetype === 'daggers') {
      ctx.scale(sl.facing, 1);
      ctx.strokeStyle = sl.glowColor;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(6, -18);
      ctx.lineTo(sl.reachX, 16);
      ctx.moveTo(6, 16);
      ctx.lineTo(sl.reachX, -18);
      ctx.stroke();
    } else if (sl.archetype === 'whip') {
      const dx = (sl.aimX !== 0 ? sl.aimX : sl.facing) * sl.reachX;
      const dy = sl.aimY * sl.reachX * 0.72;
      const extend = Math.sin(Math.min(1, sl.progress * 1.2) * Math.PI * 0.8);
      const tx = dx * extend;
      const ty = dy * extend;
      ctx.strokeStyle = sl.glowColor;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(tx * 0.5, ty * 0.5 - 22, tx, ty);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(tx, ty, 7, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.scale(sl.facing, sl.comboStep === 1 ? -1 : 1);
      ctx.strokeStyle = sl.glowColor;
      ctx.lineWidth = 15 * (1 - sl.progress * 0.45);
      ctx.beginPath();
      ctx.arc(6, 0, sl.reachX * 0.86, -Math.PI * 0.45, Math.PI * 0.42);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(8, 0, sl.reachX * 0.89, -Math.PI * 0.3, Math.PI * 0.38);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderProjectiles(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    for (const pr of engine.projectiles) {
      ctx.save();
      ctx.translate(pr.x, pr.y);
      if (pr.kind === 'qi_wave') {
        const dir = pr.vx >= 0 ? 1 : -1;
        ctx.scale(dir, 1);
        ctx.strokeStyle = pr.color;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(-10, 0, pr.r, -Math.PI * 0.42, Math.PI * 0.42);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(-8, 0, pr.r + 2, -Math.PI * 0.35, Math.PI * 0.35);
        ctx.stroke();
      } else if (pr.kind === 'fire_pillar') {
        ctx.fillStyle = 'rgba(249, 115, 22, 0.86)';
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.quadraticCurveTo(0, -52 - Math.sin(this.ambientTime * 22) * 8, 12, 0);
        ctx.fill();
      } else if (pr.kind === 'bagua') {
        ctx.rotate(this.ambientTime * 14);
        ctx.strokeStyle = pr.color;
        ctx.lineWidth = 3.5;
        ctx.strokeRect(-13, -13, 26, 26);
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = pr.color;
        ctx.beginPath();
        ctx.arc(0, 0, pr.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, pr.r * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderParticlesAndFloats(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    for (const pt of engine.particles) {
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const fl of engine.floats) {
      ctx.font = `bold ${fl.size}px "STKaiti", "KaiTi", serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000';
      ctx.fillText(fl.text, fl.x + 1.5, fl.y + 1.5);
      ctx.fillStyle = fl.color;
      ctx.fillText(fl.text, fl.x, fl.y);
    }
  }

  private renderScreenSkillOverlays(
    ctx: CanvasRenderingContext2D,
    viewW: number,
    viewH: number,
    engine: GameEngine
  ): void {
    if (engine.soulStealFlashTimer > 0) {
      ctx.fillStyle = `rgba(185, 28, 28, ${engine.soulStealFlashTimer * 0.36})`;
      ctx.fillRect(0, 0, viewW, viewH);
    }

    if (engine.skillBanner) {
      const sb = engine.skillBanner;
      ctx.save();
      ctx.globalAlpha = Math.min(1, sb.timer * 1.8);
      ctx.font = '900 28px "STKaiti", "KaiTi", serif';
      ctx.textAlign = 'center';
      const y = viewH * 0.18;
      ctx.fillStyle = 'rgba(7, 9, 15, 0.85)';
      ctx.strokeStyle = sb.color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(viewW * 0.5 - 140, y - 28, 280, 42, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = sb.color;
      ctx.fillText(sb.name, viewW * 0.5, y + 2);
      ctx.restore();
    }
  }

  private renderVirtualControls(ctx: CanvasRenderingContext2D, input: InputController): void {
    ctx.save();
    const bx = input.stickBaseX;
    const by = input.stickBaseY;
    ctx.fillStyle = 'rgba(10, 14, 22, 0.54)';
    ctx.strokeStyle = 'rgba(226, 182, 89, 0.48)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bx, by, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.fillStyle = 'rgba(226, 182, 89, 0.35)';
      ctx.beginPath();
      ctx.arc(bx + Math.cos(a) * 45, by + Math.sin(a) * 45, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    if (input.touchTrail.length > 1) {
      for (let i = 1; i < input.touchTrail.length; i++) {
        const p0 = input.touchTrail[i - 1];
        const p1 = input.touchTrail[i];
        ctx.strokeStyle = `rgba(72, 201, 176, ${p1.alpha * 0.88})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = input.stickActive ? 'rgba(72, 201, 176, 0.85)' : 'rgba(226, 182, 89, 0.7)';
    ctx.beginPath();
    ctx.arc(input.stickKnobX, input.stickKnobY, 23, 0, Math.PI * 2);
    ctx.fill();

    for (const b of input.buttons) {
      ctx.fillStyle = b.pressed ? b.color : 'rgba(12, 16, 26, 0.72)';
      ctx.strokeStyle = b.color;
      ctx.lineWidth = b.pressed ? 3.5 : 2.2;
      ctx.beginPath();
      ctx.arc(b.cx, b.cy, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff8eb';
      ctx.font = `bold ${Math.round(b.r * 0.56)}px "STKaiti", "KaiTi", serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.label, b.cx, b.cy - 2);

      ctx.fillStyle = 'rgba(243, 234, 216, 0.75)';
      ctx.font = '10px sans-serif';
      ctx.fillText(b.subLabel, b.cx, b.cy + b.r * 0.52);
    }

    ctx.restore();
  }
}
