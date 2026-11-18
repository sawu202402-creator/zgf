import { BuiltRoom, RoomProp, TILE_SIZE } from '../data/worldMap';
import { AssetKey, Assets } from './AssetLoader';
import { drawHeroCharacter, drawMonsterOrBoss, drawWorldDrop } from './CharacterArt';
import { GameEngine } from './GameEngine';
import { InputController } from './MotionInput';

export class InkVaniaRenderer {
  private roomCanvas: HTMLCanvasElement | null = null;
  private cachedRoomKey = '';
  private cachedBrokenCount = -1;
  private cachedHasWallTex = false;
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
      this.renderAiTitlePanorama(ctx, viewW, viewH);
      return;
    }

    const room = engine.room;

    // 全屏零黑边卷轴相机（锁定虚拟高度 430px，展现高精度手绘质感！）
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

    // 1. AI手绘国风16:9城池远景视差画卷
    this.renderPaintedRegionBackdrop(ctx, vW, vH, camLeft, camTop, room);

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

    // 3. 屏幕空间手搓绝技书法残印与全屏特效
    this.renderScreenSkillOverlays(ctx, viewW, viewH, engine);

    // 4. 移动端虚拟摇杆与国风动作轮盘
    if (input.usingTouch && !input.uiBlocked && !engine.paused) {
      this.renderVirtualControls(ctx, input);
    }
  }

  // ==================== AI 原画级标题全景 ====================
  private renderAiTitlePanorama(
    ctx: CanvasRenderingContext2D,
    viewW: number,
    viewH: number
  ): void {
    const bg = Assets.get('bg_title');
    if (bg) {
      const scale = Math.max(viewW / bg.width, viewH / bg.height);
      const dw = bg.width * scale;
      const dh = bg.height * scale;
      const dx = (viewW - dw) * 0.5;
      const dy = (viewH - dh) * 0.5;
      ctx.drawImage(bg, dx, dy, dw, dh);
    } else {
      ctx.fillStyle = '#090b12';
      ctx.fillRect(0, 0, viewW, viewH);
    }

    // 动态飞舞流萤火星让原画鲜活呼吸
    for (let i = 0; i < 32; i++) {
      const px = ((i * 197 + this.ambientTime * (22 + (i % 5) * 8)) % (viewW + 40)) - 20;
      const py =
        viewH - (((i * 131 + this.ambientTime * (16 + (i % 4) * 7)) % (viewH + 30)) - 15);
      ctx.fillStyle = i % 3 === 0 ? 'rgba(250, 204, 21, 0.65)' : 'rgba(239, 68, 68, 0.55)';
      ctx.beginPath();
      ctx.arc(px, py, 1.6 + (i % 2.5), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ==================== AI 手绘区域背景视差画卷 ====================
  private renderPaintedRegionBackdrop(
    ctx: CanvasRenderingContext2D,
    vW: number,
    vH: number,
    camLeft: number,
    camTop: number,
    room: BuiltRoom
  ): void {
    let bgKey: AssetKey = 'bg_main_hall';
    if (room.region === 'gatehouse') bgKey = 'bg_gatehouse';
    else if (room.region === 'library' || room.region === 'opera' || room.region === 'clock_tower') {
      bgKey = 'bg_library_opera';
    } else if (room.region === 'forge' || room.region === 'prison') {
      bgKey = 'bg_forge_prison';
    }

    const bg = Assets.get(bgKey) || Assets.get('bg_gatehouse');
    if (bg) {
      ctx.save();
      if (room.realm === 'inverted') {
        // 倒悬里城诡异妖紫滤镜与上下镜像天地！
        ctx.translate(0, vH);
        ctx.scale(1, -1);
      }

      const drawH = vH * 1.14;
      const drawW = bg.width * (drawH / bg.height);
      const parallaxX = -((camLeft * 0.22) % drawW);
      const parallaxY = -Math.min(vH * 0.12, camTop * 0.08);

      for (let x = parallaxX - drawW; x < vW + drawW; x += drawW) {
        ctx.drawImage(bg, x, parallaxY, drawW + 1, drawH);
      }
      ctx.restore();

      // 叠加适度暗调氛围蒙版，使前景地形、人物与刀光对比度极度清晰！
      ctx.fillStyle =
        room.realm === 'inverted' ? 'rgba(28, 10, 44, 0.42)' : 'rgba(6, 9, 16, 0.34)';
      ctx.fillRect(0, 0, vW, vH);
    } else {
      ctx.fillStyle = '#090d18';
      ctx.fillRect(0, 0, vW, vH);
    }
  }

  private renderRoomProps(ctx: CanvasRenderingContext2D, room: BuiltRoom): void {
    const lanternImg = Assets.get('prop_lantern');
    for (const pr of room.props) {
      if (pr.kind === 'wall_torch') {
        const flick = Math.sin(this.ambientTime * 15 + pr.x) * 3;
        const g = ctx.createRadialGradient(pr.x, pr.y - 16, 4, pr.x, pr.y - 16, 105 + flick * 2);
        g.addColorStop(0, 'rgba(251, 146, 60, 0.38)');
        g.addColorStop(0.55, 'rgba(220, 38, 38, 0.12)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(pr.x, pr.y - 16, 105, 0, Math.PI * 2);
        ctx.fill();

        if (lanternImg) {
          const lh = 46;
          const lw = lanternImg.width * (lh / lanternImg.height);
          ctx.drawImage(lanternImg, pr.x - lw * 0.5, pr.y - 38, lw, lh);
        }
      } else if (pr.kind === 'palace_pillar') {
        ctx.save();
        ctx.globalAlpha = 0.55;
        const pg = ctx.createLinearGradient(pr.x - 14, 0, pr.x + 14, 0);
        pg.addColorStop(0, '#2a0808');
        pg.addColorStop(0.5, '#6b1414');
        pg.addColorStop(1, '#220606');
        ctx.fillStyle = pg;
        ctx.fillRect(pr.x - 14, pr.y - 340, 28, 340);
        ctx.fillStyle = '#cfa349';
        ctx.fillRect(pr.x - 15, pr.y - 260, 30, 4);
        ctx.fillRect(pr.x - 15, pr.y - 140, 30, 4);
        ctx.restore();
      }
    }
  }

  // ==================== AI 手绘青石城砖无缝纹理离屏烘焙 ====================
  private ensureBakedRoomTiles(engine: GameEngine): void {
    const room = engine.room!;
    const brokenCnt = engine.slot?.brokenSecretWalls.length || 0;
    const wallTex = Assets.get('tile_stone_wall');
    const hasTex = Boolean(wallTex);
    const key = `${room.realm}:${room.id}`;

    if (
      this.roomCanvas &&
      this.cachedRoomKey === key &&
      this.cachedBrokenCount === brokenCnt &&
      this.cachedHasWallTex === hasTex
    ) {
      return;
    }

    this.cachedRoomKey = key;
    this.cachedBrokenCount = brokenCnt;
    this.cachedHasWallTex = hasTex;

    if (!this.roomCanvas) {
      this.roomCanvas = document.createElement('canvas');
    }
    this.roomCanvas.width = room.pixelW;
    this.roomCanvas.height = room.pixelH;

    const bctx = this.roomCanvas.getContext('2d')!;
    bctx.clearRect(0, 0, room.pixelW, room.pixelH);

    const pat = Assets.getPattern(bctx, 'tile_stone_wall', 0.62);
    const inv = room.realm === 'inverted';

    for (let r = 0; r < room.rows; r++) {
      for (let c = 0; c < room.cols; c++) {
        const t = room.tiles[r][c];
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        if (t === 1 || t === 6) {
          bctx.fillStyle = pat || (inv ? '#241836' : '#1b2434');
          bctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

          if (inv) {
            bctx.fillStyle = 'rgba(88, 28, 135, 0.28)';
            bctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          }

          // 暴露顶面：雕刻青石压顶踏板与鎏金古铜描边！
          if (r > 0 && room.tiles[r - 1][c] === 0) {
            bctx.fillStyle = inv ? '#581c87' : '#2d3b4e';
            bctx.fillRect(x, y, TILE_SIZE, 7);
            bctx.fillStyle = inv ? '#d8b4fe' : '#cfa349';
            bctx.fillRect(x, y, TILE_SIZE, 2);
          }
          // 左右暴露石壁轮廓高光
          if (c > 0 && room.tiles[r][c - 1] === 0) {
            bctx.fillStyle = 'rgba(207, 163, 73, 0.35)';
            bctx.fillRect(x, y, 2, TILE_SIZE);
          }
          if (c < room.cols - 1 && room.tiles[r][c + 1] === 0) {
            bctx.fillStyle = 'rgba(207, 163, 73, 0.35)';
            bctx.fillRect(x + TILE_SIZE - 2, y, 2, TILE_SIZE);
          }
          // 底部深邃阴影遮蔽
          if (r < room.rows - 1 && room.tiles[r + 1][c] === 0) {
            bctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
            bctx.fillRect(x, y + TILE_SIZE - 5, TILE_SIZE, 5);
          }

          if (t === 6) {
            bctx.strokeStyle = 'rgba(250, 204, 21, 0.68)';
            bctx.lineWidth = 1.8;
            bctx.beginPath();
            bctx.moveTo(x + 6, y + 8);
            bctx.lineTo(x + 22, y + 20);
            bctx.lineTo(x + 14, y + 34);
            bctx.stroke();
          }
        } else if (t === 2) {
          // 朱漆鎏金雕花木阁楼跳台
          bctx.fillStyle = '#3b110b';
          bctx.fillRect(x, y + 7, TILE_SIZE, 6);
          bctx.fillStyle = '#7f1d1d';
          bctx.fillRect(x, y, TILE_SIZE, 8);
          bctx.fillStyle = '#cfa349';
          bctx.fillRect(x, y, TILE_SIZE, 2.5);
          bctx.fillStyle = '#5c1912';
          bctx.fillRect(x + 6, y + 13, 5, 6);
          bctx.fillRect(x + TILE_SIZE - 11, y + 13, 5, 6);
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
          ctx.fillStyle = '#cfa349';
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
      const halo = ctx.createRadialGradient(cx, gy - 62, 10, cx, gy - 62, 145);
      halo.addColorStop(0, 'rgba(250, 204, 21, 0.36)');
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, gy - 62, 145, 0, Math.PI * 2);
      ctx.fill();

      const shrineImg = Assets.get('prop_shrine');
      if (shrineImg) {
        const sh = 148;
        const sw = shrineImg.width * (sh / shrineImg.height);
        ctx.drawImage(shrineImg, cx - sw * 0.5, gy - sh + 4, sw, sh);
      }
    } else if (room.special === 'warp_bagua') {
      ctx.save();
      ctx.translate(cx, gy - 6);
      ctx.scale(1, 0.3);
      ctx.rotate(this.ambientTime * 1.4);
      ctx.strokeStyle = '#48c9b0';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.arc(0, 0, 58, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#cfa349';
      ctx.strokeRect(-40, -40, 80, 80);
      ctx.restore();
    } else if (room.special === 'npc_smith') {
      this.drawNpcPortraitStandee(ctx, cx, gy, 'portrait_peiwuji', '欧冶残 · 独臂铸剑宗师');
    } else if (room.special === 'npc_merchant') {
      this.drawNpcPortraitStandee(ctx, cx, gy, 'mob_lantern_ghost', '白掌柜 · 子夜百鬼市');
    } else if (room.special === 'npc_su_qingyan') {
      this.drawNpcPortraitStandee(ctx, cx, gy, 'portrait_su_qingyan', '苏清晏 · 钦天监司辰');
    }

    if (
      room.id === 'altar_save' &&
      engine.slot?.defeatedBosses.includes('normal:boss_pei_wuji')
    ) {
      const px = 5 * TILE_SIZE;
      ctx.save();
      ctx.translate(px, gy - 48);
      ctx.rotate(this.ambientTime * 2.2);
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3.5;
      ctx.strokeRect(-24, -24, 48, 48);
      ctx.restore();
    }
  }

  private drawNpcPortraitStandee(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    key: AssetKey,
    label: string
  ): void {
    ctx.save();
    ctx.translate(x, y);
    const img = Assets.get(key);
    if (img) {
      if (key.startsWith('portrait_')) {
        // 古典鎏金立牌半身像展示交互NPC
        ctx.fillStyle = '#070b14';
        ctx.strokeStyle = '#cfa349';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -42, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, -42, 28, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, -28, -70, 56, 56);
        ctx.restore();
        ctx.stroke();
      } else {
        const h = 84;
        const w = img.width * (h / img.height);
        ctx.drawImage(img, -w * 0.5, -h + 2, w, h);
      }
    }
    ctx.font = 'bold 12px "STKaiti", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    ctx.fillText(label, 0, -82);
    ctx.restore();
  }

  private renderGrappleLanterns(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    const room = engine.room!;
    const unlocked = engine.hasAbility('grapple_hook');
    const lanternImg = Assets.get('prop_lantern');

    for (const l of room.lanterns) {
      ctx.strokeStyle = '#78716c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(l.x, Math.max(0, l.y - 180));
      ctx.lineTo(l.x, l.y - 18);
      ctx.stroke();

      const glow = ctx.createRadialGradient(l.x, l.y, 4, l.x, l.y, 68);
      glow.addColorStop(0, 'rgba(239, 68, 68, 0.55)');
      glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(l.x, l.y, 68, 0, Math.PI * 2);
      ctx.fill();

      if (lanternImg) {
        const lh = 52;
        const lw = lanternImg.width * (lh / lanternImg.height);
        ctx.drawImage(lanternImg, l.x - lw * 0.5, l.y - lh * 0.5, lw, lh);
      } else {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(l.x, l.y, 14, 0, Math.PI * 2);
        ctx.fill();
      }

      if (unlocked && Math.hypot(l.x - engine.player.x, l.y - (engine.player.y - 32)) <= 290) {
        ctx.strokeStyle = '#48c9b0';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(l.x, l.y, 26, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  private renderAfterImages(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    const runImg = Assets.get('hero_run') || Assets.get('hero_idle');
    for (const ai of engine.afterImages) {
      ctx.save();
      ctx.globalAlpha = ai.alpha * 0.45;
      ctx.translate(ai.x, ai.y);
      ctx.scale(ai.facing, 1);
      if (runImg) {
        const h = 84;
        const w = runImg.width * (h / runImg.height);
        ctx.drawImage(runImg, -w * 0.48, -h + 3, w, h);
      }
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
      ctx.fillStyle = 'rgba(7, 9, 15, 0.86)';
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
    ctx.strokeStyle = 'rgba(207, 163, 73, 0.52)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bx, by, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.fillStyle = 'rgba(207, 163, 73, 0.38)';
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

    ctx.fillStyle = input.stickActive ? 'rgba(72, 201, 176, 0.85)' : 'rgba(207, 163, 73, 0.72)';
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
