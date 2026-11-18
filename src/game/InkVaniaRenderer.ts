import { ROOM_COLS, ROOM_ROWS, TILE_SIZE } from '../data/worldMap';
import { EnemyEntity, GameEngine } from './GameEngine';
import { InputController } from './MotionInput';

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
      this.renderTitleBackdrop(ctx, viewW, viewH);
      return;
    }

    const room = engine.room;
    const worldW = ROOM_COLS * TILE_SIZE; // 960
    const worldH = ROOM_ROWS * TILE_SIZE; // 560

    // 自适应等比缩放使 960x560 房间完整清晰呈现在任意手机横屏与电脑视口中
    const scale = Math.min(viewW / worldW, viewH / worldH);
    const offsetX = (viewW - worldW * scale) * 0.5;
    const offsetY = (viewH - worldH * scale) * 0.5;

    ctx.fillStyle = '#06080d';
    ctx.fillRect(0, 0, viewW, viewH);

    ctx.save();
    const shakeX = engine.screenShake > 0 ? (Math.random() - 0.5) * engine.screenShake * 1.6 : 0;
    const shakeY = engine.screenShake > 0 ? (Math.random() - 0.5) * engine.screenShake * 1.6 : 0;
    ctx.translate(offsetX + shakeX, offsetY + shakeY);
    ctx.scale(scale, scale);

    ctx.beginPath();
    ctx.rect(0, 0, worldW, worldH);
    ctx.clip();

    this.renderParallaxCastleBg(ctx, worldW, worldH, room.realm === 'inverted', room.region);
    this.ensureBakedRoomLayer(engine);
    if (this.roomCanvas) {
      ctx.drawImage(this.roomCanvas, 0, 0);
    }

    this.renderDynamicGatesAndTraps(ctx, engine);
    this.renderRoomFixturesAndNPCs(ctx, engine);
    this.renderGrappleLanterns(ctx, engine);
    this.renderDrops(ctx, engine);
    this.renderAfterImages(ctx, engine);
    this.renderEnemies(ctx, engine);
    this.renderHero(ctx, engine);
    this.renderActiveSlash(ctx, engine);
    this.renderProjectiles(ctx, engine);
    this.renderParticlesAndFloats(ctx, engine);
    this.renderSkillOverlays(ctx, worldW, worldH, engine);

    ctx.restore();

    // 移动端/触屏手搓摇杆与动作键叠层（带水墨搓招流光轨迹！）
    if (input.usingTouch && !input.uiBlocked && !engine.paused) {
      this.renderVirtualControls(ctx, input);
    }
  }

  private renderTitleBackdrop(ctx: CanvasRenderingContext2D, viewW: number, viewH: number): void {
    const grad = ctx.createLinearGradient(0, 0, 0, viewH);
    grad.addColorStop(0, '#090b12');
    grad.addColorStop(0.55, '#17121c');
    grad.addColorStop(1, '#080a0f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, viewW, viewH);

    // 巨大甲子血月
    const moonX = viewW * 0.72;
    const moonY = viewH * 0.34;
    const moonR = Math.min(viewW, viewH) * 0.22;
    const glow = ctx.createRadialGradient(moonX, moonY, moonR * 0.2, moonX, moonY, moonR * 2.1);
    glow.addColorStop(0, 'rgba(220, 52, 42, 0.55)');
    glow.addColorStop(0.5, 'rgba(180, 35, 30, 0.18)');
    glow.addColorStop(1, 'rgba(9, 11, 18, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, viewW, viewH);

    ctx.fillStyle = '#c8372d';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();

    // 远景水墨群山与玄城飞檐剪影
    ctx.fillStyle = '#0c1018';
    ctx.beginPath();
    ctx.moveTo(0, viewH);
    ctx.lineTo(0, viewH * 0.72);
    ctx.lineTo(viewW * 0.28, viewH * 0.56);
    ctx.lineTo(viewW * 0.52, viewH * 0.68);
    ctx.lineTo(viewW * 0.72, viewH * 0.42);
    ctx.lineTo(viewW * 0.9, viewH * 0.62);
    ctx.lineTo(viewW, viewH * 0.54);
    ctx.lineTo(viewW, viewH);
    ctx.closePath();
    ctx.fill();

    // 玄城主塔剪影
    const tx = viewW * 0.72;
    const ty = viewH * 0.42;
    ctx.fillStyle = '#07090e';
    for (let tier = 0; tier < 4; tier++) {
      const w = (4 - tier) * 44;
      const y = ty - tier * 30;
      ctx.fillRect(tx - w * 0.4, y, w * 0.8, 32);
      ctx.beginPath();
      ctx.moveTo(tx - w * 0.62, y + 6);
      ctx.quadraticCurveTo(tx, y - 12, tx + w * 0.62, y + 6);
      ctx.lineTo(tx + w * 0.45, y + 12);
      ctx.lineTo(tx - w * 0.45, y + 12);
      ctx.closePath();
      ctx.fill();
    }

    // 飘散火星与竹叶微粒
    for (let i = 0; i < 26; i++) {
      const px = ((i * 197 + this.ambientTime * (28 + (i % 5) * 9)) % (viewW + 40)) - 20;
      const py =
        ((i * 131 + Math.sin(this.ambientTime * 1.4 + i) * 28 + this.ambientTime * 14) %
          (viewH + 20)) -
        10;
      ctx.fillStyle = i % 3 === 0 ? 'rgba(226, 182, 89, 0.55)' : 'rgba(239, 75, 63, 0.45)';
      ctx.beginPath();
      ctx.arc(px, py, 2 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderParallaxCastleBg(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    inverted: boolean,
    region: string
  ): void {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    if (inverted) {
      grad.addColorStop(0, '#1c0b2b');
      grad.addColorStop(0.5, '#120c1f');
      grad.addColorStop(1, '#260d1a');
    } else if (region === 'forge') {
      grad.addColorStop(0, '#140d10');
      grad.addColorStop(1, '#2b120c');
    } else if (region === 'prison') {
      grad.addColorStop(0, '#09141a');
      grad.addColorStop(1, '#0c1f24');
    } else {
      grad.addColorStop(0, '#0b0f19');
      grad.addColorStop(0.6, '#131926');
      grad.addColorStop(1, '#0d111a');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 血月/倒悬妖月
    const mx = inverted ? 220 : 740;
    const my = inverted ? 410 : 135;
    ctx.fillStyle = inverted ? 'rgba(168, 85, 247, 0.22)' : 'rgba(200, 55, 45, 0.22)';
    ctx.beginPath();
    ctx.arc(mx, my, 92, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = inverted ? 'rgba(216, 180, 254, 0.32)' : 'rgba(239, 68, 68, 0.35)';
    ctx.beginPath();
    ctx.arc(mx, my, 52, 0, Math.PI * 2);
    ctx.fill();

    // 古殿朱漆立柱与雕花窗棂剪影
    ctx.fillStyle = 'rgba(18, 23, 34, 0.65)';
    for (let x = 120; x < w; x += 240) {
      ctx.fillRect(x - 16, 40, 32, h - 80);
      ctx.strokeStyle = 'rgba(226, 182, 89, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 48, 95, 110, 170);
    }
  }

  private ensureBakedRoomLayer(engine: GameEngine): void {
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
      this.roomCanvas.width = ROOM_COLS * TILE_SIZE;
      this.roomCanvas.height = ROOM_ROWS * TILE_SIZE;
    }

    const bctx = this.roomCanvas.getContext('2d')!;
    bctx.clearRect(0, 0, this.roomCanvas.width, this.roomCanvas.height);

    const isInv = room.realm === 'inverted';
    for (let r = 0; r < ROOM_ROWS; r++) {
      for (let c = 0; c < ROOM_COLS; c++) {
        const t = room.tiles[r][c];
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        if (t === 1 || t === 6) {
          // 青灰城砖墙（隐藏暗墙6带极细微暗金裂痕提示细心玩家！）
          bctx.fillStyle = isInv ? '#241b35' : '#1b2230';
          bctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          bctx.strokeStyle = isInv ? '#3b2d54' : '#2c374b';
          bctx.lineWidth = 1.5;
          bctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);

          // 顶面青金釉边条
          if (r > 0 && room.tiles[r - 1][c] === 0) {
            bctx.fillStyle = isInv ? '#a855f7' : '#3c5a6b';
            bctx.fillRect(x, y, TILE_SIZE, 4);
          }

          if (t === 6) {
            bctx.strokeStyle = 'rgba(226, 182, 89, 0.42)';
            bctx.beginPath();
            bctx.moveTo(x + 8, y + 10);
            bctx.lineTo(x + 22, y + 20);
            bctx.lineTo(x + 15, y + 32);
            bctx.stroke();
          }
        } else if (t === 2) {
          // 单向朱漆描金阁楼木跳台
          bctx.fillStyle = '#5c241d';
          bctx.fillRect(x, y, TILE_SIZE, 10);
          bctx.fillStyle = '#e2b659';
          bctx.fillRect(x, y, TILE_SIZE, 3);
        }
      }
    }
  }

  private renderDynamicGatesAndTraps(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    const room = engine.room!;
    for (let r = 0; r < ROOM_ROWS; r++) {
      for (let c = 0; c < ROOM_COLS; c++) {
        const t = room.tiles[r][c];
        if (t < 3 || t === 6) continue;
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        if (t === 3) {
          // 裂纹青石地砖（需千斤坠！）
          ctx.fillStyle = '#2d241e';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = '#fb923c';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x + 4, y + 6);
          ctx.lineTo(x + 20, y + 22);
          ctx.lineTo(x + 35, y + 12);
          ctx.moveTo(x + 20, y + 22);
          ctx.lineTo(x + 14, y + 36);
          ctx.stroke();
        } else if (t === 4) {
          // 玄铁栅栏门（需缩地化雾穿过！）
          ctx.fillStyle = '#64748b';
          for (let bx = 6; bx < TILE_SIZE; bx += 12) {
            ctx.fillRect(x + bx, y, 4, TILE_SIZE);
          }
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(x, y + 18, TILE_SIZE, 4);
        } else if (t === 5) {
          // 九幽剧毒瘴气墙
          const pulse = 0.45 + Math.sin(this.ambientTime * 4 + r) * 0.2;
          ctx.fillStyle = `rgba(168, 85, 247, ${pulse})`;
          ctx.fillRect(x + 4, y, TILE_SIZE - 8, TILE_SIZE);
        } else if (t === 7) {
          // 冥渊赤火尖刺
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          for (let sx = 0; sx < TILE_SIZE; sx += 10) {
            ctx.moveTo(x + sx, y + TILE_SIZE);
            ctx.lineTo(x + sx + 5, y + 12);
            ctx.lineTo(x + sx + 10, y + TILE_SIZE);
          }
          ctx.fill();
        }
      }
    }
  }

  private renderRoomFixturesAndNPCs(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    const room = engine.room!;
    const cx = 12 * TILE_SIZE;
    const gy = 12 * TILE_SIZE;

    if (room.special === 'save_shrine') {
      // 镇魂土地祠与朱红长明灯
      const halo = ctx.createRadialGradient(cx, gy - 44, 6, cx, gy - 44, 95);
      halo.addColorStop(0, 'rgba(250, 204, 21, 0.36)');
      halo.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = halo;
      ctx.fillRect(cx - 100, gy - 140, 200, 150);

      ctx.fillStyle = '#334155';
      ctx.fillRect(cx - 26, gy - 54, 52, 54);
      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      ctx.moveTo(cx - 38, gy - 52);
      ctx.lineTo(cx, gy - 76);
      ctx.lineTo(cx + 38, gy - 52);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(cx, gy - 32, 7 + Math.sin(this.ambientTime * 6) * 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (room.special === 'warp_bagua') {
      // 太极八卦传送阵
      ctx.save();
      ctx.translate(cx, gy - 8);
      ctx.scale(1, 0.32);
      ctx.rotate(this.ambientTime * 1.4);
      ctx.strokeStyle = '#48c9b0';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#e2b659';
      ctx.strokeRect(-32, -32, 64, 64);
      ctx.restore();
    } else if (room.special === 'npc_smith') {
      this.drawNpcFigure(ctx, cx, gy, '#fb923c', '欧冶残 · 铸剑宗师');
    } else if (room.special === 'npc_merchant') {
      this.drawNpcFigure(ctx, cx, gy, '#facc15', '白掌柜 · 鬼市狐商');
    } else if (room.special === 'npc_su_qingyan') {
      this.drawNpcFigure(ctx, cx, gy, '#7dd3fc', '苏清晏 · 钦天监司辰');
    }

    // 祭天坛往返表里双城乾坤裂隙
    if (
      room.id === 'altar_save' &&
      engine.slot?.defeatedBosses.includes('normal:boss_pei_wuji')
    ) {
      const px = 6 * TILE_SIZE;
      ctx.save();
      ctx.translate(px, gy - 44);
      ctx.rotate(this.ambientTime * 2.2);
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3;
      ctx.strokeRect(-22, -22, 44, 44);
      ctx.restore();
    }
  }

  private drawNpcFigure(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    label: string
  ): void {
    ctx.fillStyle = color;
    ctx.fillRect(x - 11, y - 44, 22, 44);
    ctx.fillStyle = '#fde8d0';
    ctx.beginPath();
    ctx.arc(x, y - 52, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 12px serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f7d788';
    ctx.fillText(label, x, y - 70);
  }

  private renderGrappleLanterns(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    const room = engine.room!;
    const unlocked = engine.hasAbility('grapple_hook');
    for (const l of room.lanterns) {
      ctx.strokeStyle = '#78716c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(l.x, 0);
      ctx.lineTo(l.x, l.y);
      ctx.stroke();

      const glow = ctx.createRadialGradient(l.x, l.y, 4, l.x, l.y, 46);
      glow.addColorStop(0, 'rgba(239, 68, 68, 0.55)');
      glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(l.x, l.y, 46, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.ellipse(l.x, l.y, 13, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (unlocked && Math.hypot(l.x - engine.player.x, l.y - (engine.player.y - 28)) <= 245) {
        ctx.strokeStyle = '#48c9b0';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(l.x, l.y, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  private renderDrops(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    for (const d of engine.drops) {
      const bob = Math.sin(this.ambientTime * 4.5 + d.x) * 4;
      const dy = d.y - 14 + bob;

      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(d.x, dy, d.isStaticPickup ? 11 : 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (d.isStaticPickup || d.kind === 'yao_core') {
        ctx.font = 'bold 11px serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fef08a';
        ctx.fillText(d.label, d.x, dy - 16);
      }
    }
  }

  private renderAfterImages(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    for (const ai of engine.afterImages) {
      ctx.save();
      ctx.globalAlpha = ai.alpha * 0.6;
      ctx.fillStyle = ai.color;
      ctx.fillRect(ai.x - 11, ai.y - 50, 22, 50);
      ctx.restore();
    }
  }

  private renderEnemies(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    for (const e of engine.enemies) {
      this.drawSingleEnemy(ctx, e);
    }
  }

  private drawSingleEnemy(ctx: CanvasRenderingContext2D, e: EnemyEntity): void {
    const w = e.profile.w;
    const h = e.profile.h;
    const flash = e.hurtFlash > 0;

    ctx.save();
    ctx.translate(e.x, e.y);

    // 躯干与国风怪物特征剪影
    ctx.fillStyle = flash ? '#ffffff' : e.profile.primaryColor;
    ctx.strokeStyle = e.profile.accentColor;
    ctx.lineWidth = 2;
    ctx.fillRect(-w * 0.5, -h, w, h);
    ctx.strokeRect(-w * 0.5, -h, w, h);

    // 妖目高光
    ctx.fillStyle = flash ? '#ef4444' : e.profile.accentColor;
    ctx.beginPath();
    ctx.arc(e.facing * (w * 0.22), -h * 0.74, e.profile.isBoss ? 5 : 3.2, 0, Math.PI * 2);
    ctx.fill();

    // 玄甲重盾傀儡正面大盾视觉提示
    if (e.profile.shieldedFront) {
      ctx.fillStyle = '#f59e0b';
      const sx = e.facing === 1 ? w * 0.5 - 3 : -w * 0.5 - 5;
      ctx.fillRect(sx, -h * 0.85, 8, h * 0.78);
    }

    // 头顶小怪血条
    if (!e.profile.isBoss && e.hp < e.maxHp) {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(-20, -h - 11, 40, 5);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-20, -h - 11, 40 * Math.max(0, e.hp / e.maxHp), 5);
    }

    if (e.stunTimer > 0) {
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 12px serif';
      ctx.textAlign = 'center';
      ctx.fillText('眩晕', 0, -h - 16);
    }

    ctx.restore();

    // 裴无极头顶显形的【九幽蚀心蛊】！
    if (e.hasGuParasite && e.guHp && e.guHp > 0 && e.guX !== undefined && e.guY !== undefined) {
      ctx.save();
      ctx.translate(e.guX, e.guY);
      ctx.fillStyle = 'rgba(192, 132, 252, 0.32)';
      ctx.beginPath();
      ctx.arc(0, 0, 24 + Math.sin(this.ambientTime * 8) * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = 'bold 11px serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f5d0fe';
      ctx.fillText(`九幽蚀心蛊 (${e.guHp})`, 0, -20);
      ctx.restore();
    }
  }

  private renderHero(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    const p = engine.player;
    const isXiao = engine.slot?.mode === 'xiaoduanshui';

    if (p.invulnTimer > 0 && Math.floor(p.invulnTimer * 18) % 2 === 0 && p.mistDashTimer <= 0) {
      return;
    }

    ctx.save();
    ctx.translate(p.x, p.y);

    // 缩地化雾形态：青紫烟云灵体
    if (p.mistDashTimer > 0) {
      const g = ctx.createRadialGradient(0, -26, 4, 0, -26, 32);
      g.addColorStop(0, '#e9d5ff');
      g.addColorStop(0.5, 'rgba(168, 85, 247, 0.75)');
      g.addColorStop(1, 'rgba(72, 201, 176, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, -26, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // 飘逸侠客披风/发带飘带（随移动与风向摆动！）
    const ribbonWave = Math.sin(p.animTime * 10) * 5;
    ctx.strokeStyle = isXiao ? '#c084fc' : '#c8372d';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-p.facing * 4, -44);
    ctx.quadraticCurveTo(-p.facing * 18, -42 + ribbonWave, -p.facing * 28, -35 - ribbonWave);
    ctx.stroke();

    // 腿部动作摆幅
    const stride = Math.abs(p.vx) > 20 && p.onGround ? Math.sin(p.animTime * 16) * 7 : 0;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-4, -18);
    ctx.lineTo(-5 + stride, 0);
    ctx.moveTo(4, -18);
    ctx.lineTo(5 - stride, 0);
    ctx.stroke();

    // 18岁少年李逸承 / 大师兄萧断水劲装衣袍
    ctx.fillStyle = isXiao ? '#312e81' : '#132a38';
    ctx.strokeStyle = isXiao ? '#c084fc' : '#48c9b0';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-11, -40, 22, 25, 4);
    ctx.fill();
    ctx.stroke();

    // 腰封金扣
    ctx.fillStyle = '#e2b659';
    ctx.fillRect(-11, -24, 22, 4);

    // 少年头部与高马尾发髻
    ctx.fillStyle = '#f6dec5';
    ctx.beginPath();
    ctx.arc(0, -46, 8.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-p.facing * 2, -49, 8.5, Math.PI * 0.85, Math.PI * 2.15);
    ctx.fill();
    // 高马尾
    ctx.beginPath();
    ctx.arc(-p.facing * 9, -53, 5, 0, Math.PI * 2);
    ctx.fill();

    // 子母护体灵剑环绕特效
    if (p.orbitSwordTimer > 0) {
      for (let i = 0; i < 3; i++) {
        const ang = p.orbitAngle + (i * Math.PI * 2) / 3;
        const sx = Math.cos(ang) * 58;
        const sy = -28 + Math.sin(ang) * 58;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(ang + Math.PI * 0.5);
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(-3, -14, 6, 28);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  private renderActiveSlash(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    const sl = engine.activeSlash;
    if (!sl) return;

    ctx.save();
    ctx.translate(sl.x, sl.y);

    if (sl.pogoDown) {
      // 空中斜下劈剑芒
      ctx.strokeStyle = sl.glowColor;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(sl.facing * 22, 48);
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (sl.archetype === 'greatsword') {
      // 240°过肩巨弧水墨烈焰刀光！
      ctx.scale(sl.facing, 1);
      const startAng = -Math.PI * 0.88;
      const endAng = startAng + Math.PI * 1.28 * Math.min(1, sl.progress * 1.25);
      ctx.strokeStyle = sl.glowColor;
      ctx.lineWidth = 22 * (1 - sl.progress * 0.45);
      ctx.beginPath();
      ctx.arc(0, 4, sl.reachX * 0.88, startAng, endAng);
      ctx.stroke();

      ctx.strokeStyle = sl.color;
      ctx.lineWidth = 9 * (1 - sl.progress * 0.4);
      ctx.beginPath();
      ctx.arc(0, 4, sl.reachX * 0.92, startAng + 0.15, endAng);
      ctx.stroke();
    } else if (sl.archetype === 'spear') {
      // 银龙穿云直线/斜上突刺枪芒！
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
      ctx.moveTo(sl.facing * (len + 14), 0);
      ctx.lineTo(sl.facing * (len - 10), -7);
      ctx.lineTo(sl.facing * (len - 10), 7);
      ctx.closePath();
      ctx.fill();
    } else if (sl.archetype === 'daggers') {
      // 双刺疾风交叉残影斩
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
      // 八向乌金雷音软鞭波形！
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

      ctx.fillStyle = sl.color;
      ctx.beginPath();
      ctx.arc(tx, ty, 7, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 轻剑灵动新月剑弧
      ctx.scale(sl.facing, sl.comboStep === 1 ? -1 : 1);
      ctx.strokeStyle = sl.glowColor;
      ctx.lineWidth = 14 * (1 - sl.progress * 0.45);
      ctx.beginPath();
      ctx.arc(6, 0, sl.reachX * 0.85, -Math.PI * 0.45, Math.PI * 0.42);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(8, 0, sl.reachX * 0.88, -Math.PI * 0.3, Math.PI * 0.38);
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
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.arc(-10, 0, pr.r, -Math.PI * 0.42, Math.PI * 0.42);
        ctx.stroke();
      } else if (pr.kind === 'fire_pillar') {
        ctx.fillStyle = 'rgba(249, 115, 22, 0.82)';
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.quadraticCurveTo(0, -48 - Math.sin(this.ambientTime * 22) * 8, 12, 0);
        ctx.fill();
      } else if (pr.kind === 'bagua') {
        ctx.rotate(this.ambientTime * 14);
        ctx.strokeStyle = pr.color;
        ctx.lineWidth = 4;
        ctx.strokeRect(-13, -13, 26, 26);
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = pr.color;
        ctx.beginPath();
        ctx.arc(0, 0, pr.r, 0, Math.PI * 2);
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
      ctx.font = `bold ${fl.size}px serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000';
      ctx.fillText(fl.text, fl.x + 1, fl.y + 1);
      ctx.fillStyle = fl.color;
      ctx.fillText(fl.text, fl.x, fl.y);
    }
  }

  private renderSkillOverlays(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    engine: GameEngine
  ): void {
    if (engine.taijiFlashTimer > 0) {
      ctx.save();
      ctx.translate(engine.player.x, engine.player.y - 28);
      ctx.globalAlpha = engine.taijiFlashTimer * 2;
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, (0.45 - engine.taijiFlashTimer) * 380, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (engine.soulStealFlashTimer > 0) {
      ctx.fillStyle = `rgba(185, 28, 28, ${engine.soulStealFlashTimer * 0.42})`;
      ctx.fillRect(0, 0, w, h);
    }

    // 手搓绝技书法残印横幅
    if (engine.skillBanner) {
      const sb = engine.skillBanner;
      ctx.save();
      ctx.globalAlpha = Math.min(1, sb.timer * 1.8);
      ctx.font = '900 28px "STKaiti", "KaiTi", serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(8, 10, 16, 0.72)';
      ctx.fillRect(w * 0.5 - 135, 68, 270, 42);
      ctx.strokeStyle = sb.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w * 0.5 - 135, 68, 270, 42);
      ctx.fillStyle = sb.color;
      ctx.fillText(sb.name, w * 0.5, 98);
      ctx.restore();
    }
  }

  private renderVirtualControls(ctx: CanvasRenderingContext2D, input: InputController): void {
    ctx.save();

    // 左侧八向手搓摇杆底盘
    const bx = input.stickBaseX;
    const by = input.stickBaseY;
    ctx.fillStyle = 'rgba(12, 16, 24, 0.52)';
    ctx.strokeStyle = 'rgba(226, 182, 89, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bx, by, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 八向刻度暗纹提示搓招方位
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.fillStyle = 'rgba(226, 182, 89, 0.35)';
      ctx.beginPath();
      ctx.arc(bx + Math.cos(a) * 45, by + Math.sin(a) * 45, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 手搓青金真气滑动轨迹
    if (input.touchTrail.length > 1) {
      for (let i = 1; i < input.touchTrail.length; i++) {
        const p0 = input.touchTrail[i - 1];
        const p1 = input.touchTrail[i];
        ctx.strokeStyle = `rgba(72, 201, 176, ${p1.alpha * 0.85})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
    }

    // 摇杆推球
    ctx.fillStyle = input.stickActive ? 'rgba(72, 201, 176, 0.82)' : 'rgba(226, 182, 89, 0.65)';
    ctx.beginPath();
    ctx.arc(input.stickKnobX, input.stickKnobY, 23, 0, Math.PI * 2);
    ctx.fill();

    // 右侧国风动作圆键群
    for (const b of input.buttons) {
      ctx.fillStyle = b.pressed ? b.color : 'rgba(16, 21, 32, 0.68)';
      ctx.strokeStyle = b.color;
      ctx.lineWidth = b.pressed ? 3.5 : 2.2;
      ctx.beginPath();
      ctx.arc(b.cx, b.cy, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff8eb';
      ctx.font = `bold ${Math.round(b.r * 0.56)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.label, b.cx, b.cy - 2);

      ctx.fillStyle = 'rgba(243, 234, 216, 0.72)';
      ctx.font = '10px sans-serif';
      ctx.fillText(b.subLabel, b.cx, b.cy + b.r * 0.52);
    }

    ctx.restore();
  }
}
