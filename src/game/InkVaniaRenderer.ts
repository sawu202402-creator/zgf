import { WEAPONS } from '../data/itemsAndSkills';
import {
  BuiltRoom,
  CELL_PIXEL_W,
  isInsideDownShaft,
  sampleGroundY,
  sampleSolidGroundY,
} from '../data/worldMap';
import { AssetKey, Assets } from './AssetLoader';
import {
  drawHeroCharacter,
  drawInkSlashRibbon,
  drawMonsterOrBoss,
  drawSceneNpc,
  drawWorldDrop,
  HERO_SPRITE_METRICS,
  selectHeroSpriteFrame,
} from './CharacterArt';
import { GameEngine } from './GameEngine';
import { InputController } from './MotionInput';

export class InkVaniaRenderer {
  private terrainCanvas: HTMLCanvasElement | null = null;
  private cachedTerrainKey = '';
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

    // 锁定 440px 黄金横版动作镜头高度（对标《斩妖行/胧村正》大比例人物写实视角，全屏0黑边！）
    const vH = 440;
    const scale = viewH / vH;
    const vW = viewW / scale;

    let camLeft = engine.camX - vW * 0.5;
    let camTop = engine.camY - vH * 0.52;
    camLeft = Math.max(0, Math.min(Math.max(0, room.pixelW - vW), camLeft));
    camTop = Math.max(0, Math.min(Math.max(0, room.pixelH - vH), camTop));

    const shakeX = engine.screenShake > 0 ? (Math.random() - 0.5) * engine.screenShake * 1.6 : 0;
    const shakeY = engine.screenShake > 0 ? (Math.random() - 0.5) * engine.screenShake * 1.6 : 0;

    ctx.save();
    ctx.scale(scale, scale);

    // 1. 远景国风手绘 16:9 画卷视差层 (0.22x)
    this.renderPaintedBackdrop(ctx, vW, vH, camLeft, camTop, room);

    // 2. 世界主空间层 (1.0x)
    ctx.save();
    ctx.translate(-camLeft + shakeX, -camTop + shakeY);

    this.renderMoonlitWater(ctx, room);
    this.renderMidgroundArchwaysAndTorches(ctx, room);
    this.renderPavilionStructures(ctx, room);

    this.ensureBakedStoneContour(room);
    if (this.terrainCanvas) {
      ctx.drawImage(this.terrainCanvas, 0, 0);
    }

    this.renderShaftLightAndIronGates(ctx, room, engine);
    this.renderSaveShrine(ctx, room);

    for (const npc of room.npcs) {
      drawSceneNpc(ctx, npc, sampleGroundY(room, npc.x), engine.player.x, this.ambientTime);
    }

    this.renderGroundMist(ctx, room, camLeft, vW);

    for (const d of engine.drops) {
      drawWorldDrop(ctx, d, this.ambientTime, engine.player.x);
    }

    this.renderSkyStrikeTelegraphs(ctx, engine);
    this.renderAfterImages(ctx, engine);

    for (const e of engine.enemies) {
      drawMonsterOrBoss(ctx, e, this.ambientTime);
    }

    drawHeroCharacter(ctx, engine, this.ambientTime);
    this.renderActiveSlashRibbon(ctx, engine);
    this.renderProjectiles(ctx, engine);
    this.renderSlashImpacts(ctx, engine);
    this.renderParticlesAndFloats(ctx, engine);

    ctx.restore();

    // 3. 前景遮挡视差层 (1.24x)：暗影苦竹与盘龙巨柱掠过镜头（《胧村正/斩妖行》灵魂景深层次！）
    this.renderForegroundParallax(ctx, vW, vH, camLeft, room);

    // 4. 四周暗角电影级水墨晕影 Vignette
    const vig = ctx.createRadialGradient(vW * 0.5, vH * 0.48, vH * 0.35, vW * 0.5, vH * 0.5, vW * 0.72);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(3, 5, 10, 0.52)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, vW, vH);

    ctx.restore();

    // 5. 屏幕级手搓绝技水墨印章横幅与跨门丝滑水墨渐隐过渡
    this.renderScreenSkillOverlays(ctx, viewW, viewH, engine);
    if (engine.roomFadeTimer > 0) {
      ctx.fillStyle = `rgba(4, 6, 12, ${Math.min(0.88, (engine.roomFadeTimer / 0.22) * 0.85)})`;
      ctx.fillRect(0, 0, viewW, viewH);
    }

    // 6. 移动端触屏八向手搓摇杆与动作键
    if (input.usingTouch && !input.uiBlocked && !engine.paused) {
      this.renderVirtualControls(ctx, input);
    }
  }

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
      ctx.drawImage(bg, (viewW - dw) * 0.5, (viewH - dh) * 0.5, dw, dh);
    } else {
      ctx.fillStyle = '#070910';
      ctx.fillRect(0, 0, viewW, viewH);
    }

    for (let i = 0; i < 34; i++) {
      const px = ((i * 197 + this.ambientTime * (22 + (i % 5) * 8)) % (viewW + 40)) - 20;
      const py =
        viewH - (((i * 131 + this.ambientTime * (16 + (i % 4) * 7)) % (viewH + 30)) - 15);
      ctx.fillStyle = i % 3 === 0 ? 'rgba(250, 204, 21, 0.65)' : 'rgba(239, 68, 68, 0.52)';
      ctx.beginPath();
      ctx.arc(px, py, 1.5 + (i % 2.4), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderPaintedBackdrop(
    ctx: CanvasRenderingContext2D,
    vW: number,
    vH: number,
    camLeft: number,
    camTop: number,
    room: BuiltRoom
  ): void {
    let bgKey: AssetKey = 'bg_gatehouse';
    if (room.region === 'main_hall') bgKey = 'bg_main_hall';
    else if (room.region === 'library' || room.region === 'clock_tower') bgKey = 'bg_library_opera';
    else if (room.region === 'prison' || room.region === 'altar') bgKey = 'bg_forge_prison';

    const bg = Assets.get(bgKey) || Assets.get('bg_gatehouse');
    if (bg) {
      const drawH = vH * 1.15;
      const drawW = bg.width * (drawH / bg.height);
      // 使用恶魔城全局世界坐标 (room.mapX * CELL_PIXEL_W + camLeft) 计算远景视差，跨房间时血月群山连续平移绝不跳变！
      const globalCamX = room.mapX * CELL_PIXEL_W + camLeft;
      const px = -(((globalCamX * 0.22) % drawW + drawW) % drawW);
      const py = -Math.min(vH * 0.12, camTop * 0.12);

      for (let x = px - drawW; x < vW + drawW; x += drawW) {
        ctx.drawImage(bg, x, py, drawW + 1, drawH);
      }
      const tint =
        room.mapY === 2
          ? 'rgba(3, 7, 15, 0.56)'
          : room.region === 'main_hall'
            ? 'rgba(8, 6, 14, 0.36)'
            : 'rgba(5, 8, 15, 0.28)';
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, vW, vH);
    } else {
      ctx.fillStyle = '#080c16';
      ctx.fillRect(0, 0, vW, vH);
    }
  }

  private renderMoonlitWater(ctx: CanvasRenderingContext2D, room: BuiltRoom): void {
    for (const wz of room.waterZones) {
      const w = wz.x2 - wz.x1;
      const h = room.pixelH - wz.surfaceY;
      const wg = ctx.createLinearGradient(0, wz.surfaceY, 0, room.pixelH);
      wg.addColorStop(0, '#0d1b2a');
      wg.addColorStop(0.4, '#132438');
      wg.addColorStop(1, '#050811');
      ctx.fillStyle = wg;
      ctx.fillRect(wz.x1, wz.surfaceY, w, h);

      // 血月与灯火在水面的动态波光倒影
      for (let i = 0; i < 16; i++) {
        const ry = wz.surfaceY + 6 + i * 5;
        const rx = wz.x1 + w * 0.52 + Math.sin(this.ambientTime * 3.5 + i * 0.8) * (18 + i * 2);
        const rw = Math.max(12, 74 - i * 3.5);
        ctx.fillStyle = `rgba(220, 55, 45, ${0.26 - i * 0.014})`;
        ctx.fillRect(rx - rw * 0.5, ry, rw, 2.2);
      }

      // 水面银色涟漪微光
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.32)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(wz.x1, wz.surfaceY);
      ctx.lineTo(wz.x2, wz.surfaceY);
      ctx.stroke();
    }
  }

  private renderMidgroundArchwaysAndTorches(
    ctx: CanvasRenderingContext2D,
    room: BuiltRoom
  ): void {
    const archImg = Assets.get('prop_stone_arch');
    if (archImg) {
      for (const ar of room.archways) {
        const gy = sampleGroundY(room, ar.x);
        const h = 255;
        const w = archImg.width * (h / archImg.height);
        ctx.drawImage(archImg, ar.x - w * 0.5, gy - h + 8, w, h);
      }
    }

    const lanternImg = Assets.get('prop_lantern');
    for (const tc of room.torches) {
      const flick = Math.sin(this.ambientTime * 12 + tc.x) * 4;
      const g = ctx.createRadialGradient(tc.x, tc.y, 4, tc.x, tc.y, 118 + flick);
      g.addColorStop(0, 'rgba(251, 146, 60, 0.36)');
      g.addColorStop(0.55, 'rgba(220, 38, 38, 0.12)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(tc.x, tc.y, 120, 0, Math.PI * 2);
      ctx.fill();

      // 朱漆灯柱与手绘红绸宫灯
      const gy = sampleGroundY(room, tc.x);
      ctx.fillStyle = '#3b100c';
      ctx.fillRect(tc.x - 3, tc.y - 16, 6, gy - tc.y + 18);
      if (lanternImg) {
        const lh = 46;
        const lw = lanternImg.width * (lh / lanternImg.height);
        ctx.drawImage(lanternImg, tc.x - lw * 0.5, tc.y - 18, lw, lh);
      }
    }
  }

  /**
   * 渲染真实雕栏木阁楼台面 (`prop_pavilion_platform`) + 直达地面的朱漆承重梁柱（彻底告别悬空方块跳台！）
   */
  private renderPavilionStructures(ctx: CanvasRenderingContext2D, room: BuiltRoom): void {
    const platImg = Assets.get('prop_pavilion_platform');

    for (const pv of room.pavilions) {
      const leftGround = sampleGroundY(room, pv.x + 28);
      const rightGround = sampleGroundY(room, pv.x + pv.w - 28);

      // 1. 先绘制下方扎入地面的厚重朱红立柱与穿斗横梁！
      if (pv.hasPillars) {
        const cols = [pv.x + 32, pv.x + pv.w - 32];
        if (pv.w > 300) cols.push(pv.x + pv.w * 0.5);

        for (const cx of cols) {
          const botY = sampleGroundY(room, cx);
          const pg = ctx.createLinearGradient(cx - 8, 0, cx + 8, 0);
          pg.addColorStop(0, '#2a0808');
          pg.addColorStop(0.5, '#6e1717');
          pg.addColorStop(1, '#1f0505');
          ctx.fillStyle = pg;
          ctx.fillRect(cx - 8, pv.y + 8, 16, botY - pv.y - 6);
          // 柱础青石座
          ctx.fillStyle = '#334155';
          ctx.fillRect(cx - 13, botY - 8, 26, 9);
        }

        // 柱间雕花穿枋横梁
        const midY = pv.y + Math.min(leftGround, rightGround) * 0.22;
        if (midY < leftGround - 35) {
          ctx.fillStyle = '#3f100c';
          ctx.fillRect(pv.x + 32, pv.y + 42, pv.w - 64, 7);
        }
      }

      // 2. 区分地井口单向透光木栈格 vs 空中雕栏木阁楼台面！
      if (!pv.hasPillars && pv.y >= 380) {
        // 地宫竖井口可下穿木铁栈板（提示玩家可按 ↓+跃 下潜）
        ctx.fillStyle = '#3b1911';
        ctx.strokeStyle = '#cfa349';
        ctx.lineWidth = 1.6;
        ctx.fillRect(pv.x, pv.y, pv.w, 8);
        ctx.strokeRect(pv.x, pv.y, pv.w, 8);
        ctx.fillStyle = '#090d16';
        for (let gx = pv.x + 12; gx < pv.x + pv.w - 10; gx += 18) {
          ctx.fillRect(gx, pv.y + 1.5, 8, 5);
        }
      } else if (platImg) {
        const drawH = 82;
        ctx.drawImage(platImg, pv.x - 8, pv.y - drawH * 0.48, pv.w + 16, drawH);
      } else {
        ctx.fillStyle = '#5c1912';
        ctx.fillRect(pv.x, pv.y, pv.w, 14);
      }
    }
  }

  /**
   * 离屏烘焙连续起伏青石古道、石拱桥券洞与丹陛雕花石阶（0方格感！）
   */
  private ensureBakedStoneContour(room: BuiltRoom): void {
    const wallTex = Assets.get('tile_stone_wall');
    const key = `${room.id}:${Boolean(wallTex)}`;
    if (this.terrainCanvas && this.cachedTerrainKey === key) return;

    this.cachedTerrainKey = key;
    if (!this.terrainCanvas) {
      this.terrainCanvas = document.createElement('canvas');
    }
    this.terrainCanvas.width = room.pixelW;
    this.terrainCanvas.height = room.pixelH;

    const bctx = this.terrainCanvas.getContext('2d')!;
    bctx.clearRect(0, 0, room.pixelW, room.pixelH);

    const stonePat = Assets.getPattern(bctx, 'tile_stone_wall', 0.65);

    // 1. 填充连续地面多边形（向下竖井处自动断开垂直石井壁！）
    bctx.save();
    bctx.beginPath();
    bctx.moveTo(0, room.pixelH);
    for (let x = 0; x <= room.pixelW; x += 4) {
      const gy = isInsideDownShaft(room, x) ? room.pixelH + 20 : sampleSolidGroundY(room, x);
      bctx.lineTo(x, gy);
    }
    bctx.lineTo(room.pixelW, room.pixelH);
    bctx.closePath();

    bctx.fillStyle = stonePat || '#1b2434';
    bctx.fill();

    // 若该场景为护城石拱桥（含 arch_bridge 节点），镂空桥腹三大石拱券洞，透出河水倒影！
    const isArchBridgeRoom =
      room.waterZones.length > 0 && room.groundNodes.some((n) => n.style === 'arch_bridge');
    if (isArchBridgeRoom) {
      const wz = room.waterZones[0];
      bctx.globalCompositeOperation = 'destination-out';
      const span = wz.x2 - wz.x1;
      const arches = [
        { cx: wz.x1 + span * 0.24, rx: 72, ry: 40 },
        { cx: wz.x1 + span * 0.5, rx: 104, ry: 56 },
        { cx: wz.x1 + span * 0.76, rx: 72, ry: 40 },
      ];
      for (const a of arches) {
        bctx.beginPath();
        bctx.ellipse(a.cx, wz.surfaceY + 8, a.rx, a.ry, 0, Math.PI, 0);
        bctx.lineTo(a.cx + a.rx, room.pixelH);
        bctx.lineTo(a.cx - a.rx, room.pixelH);
        bctx.closePath();
        bctx.fill();
      }
      bctx.globalCompositeOperation = 'source-over';

      bctx.strokeStyle = '#334155';
      bctx.lineWidth = 7;
      for (const a of arches) {
        bctx.beginPath();
        bctx.ellipse(a.cx, wz.surfaceY + 8, a.rx, a.ry, 0, Math.PI, 0);
        bctx.stroke();
      }
    }
    bctx.restore();

    // 2. 沿地表轮廓铺设立体压顶青石板（跳过向下敞开的竖井洞口，并在井口两侧砌筑垂直青石井壁！）
    for (let x = 0; x < room.pixelW; x += 28) {
      if (isInsideDownShaft(room, x + 4) || isInsideDownShaft(room, x + 24)) continue;
      const y1 = sampleSolidGroundY(room, x);
      const y2 = sampleSolidGroundY(room, x + 28);

      bctx.fillStyle = '#2d3b4e';
      bctx.strokeStyle = '#070a12';
      bctx.lineWidth = 2;
      bctx.beginPath();
      bctx.moveTo(x, y1);
      bctx.lineTo(x + 28, y2);
      bctx.lineTo(x + 28, y2 + 12);
      bctx.lineTo(x, y1 + 12);
      bctx.closePath();
      bctx.fill();
      bctx.stroke();

      bctx.strokeStyle = 'rgba(207, 163, 73, 0.42)';
      bctx.lineWidth = 1.5;
      bctx.beginPath();
      bctx.moveTo(x + 1, y1 + 1);
      bctx.lineTo(x + 27, y2 + 1);
      bctx.stroke();
    }

    // 向下竖井两侧垂直护壁条石
    for (const sh of room.shafts) {
      if (sh.dir !== 'down') continue;
      const topY = sampleSolidGroundY(room, sh.x1 - 4);
      bctx.fillStyle = '#1e293b';
      bctx.strokeStyle = '#070a12';
      bctx.lineWidth = 2;
      bctx.fillRect(sh.x1 - 10, topY, 14, room.pixelH - topY);
      bctx.strokeRect(sh.x1 - 10, topY, 14, room.pixelH - topY);
      bctx.fillRect(sh.x2 - 4, topY, 14, room.pixelH - topY);
      bctx.strokeRect(sh.x2 - 4, topY, 14, room.pixelH - topY);
    }

    // 3. 在石拱桥两侧护栏处绘制古风汉白玉/青石桥栏望柱
    if (isArchBridgeRoom) {
      for (const wz of room.waterZones) {
        for (let bx = wz.x1 + 30; bx <= wz.x2 - 30; bx += 64) {
          const by = sampleSolidGroundY(room, bx);
          bctx.fillStyle = '#334155';
          bctx.strokeStyle = '#090d16';
          bctx.lineWidth = 1.8;
          bctx.fillRect(bx - 5, by - 30, 10, 30);
          bctx.strokeRect(bx - 5, by - 30, 10, 30);
          bctx.fillStyle = '#64748b';
          bctx.beginPath();
          bctx.arc(bx, by - 33, 6, 0, Math.PI * 2);
          bctx.fill();
          bctx.stroke();

          if (bx + 64 <= wz.x2 - 20) {
            const ny = sampleSolidGroundY(room, bx + 64);
            bctx.strokeStyle = '#475569';
            bctx.lineWidth = 4;
            bctx.beginPath();
            bctx.moveTo(bx + 5, by - 20);
            bctx.lineTo(bx + 59, ny - 20);
            bctx.moveTo(bx + 5, by - 10);
            bctx.lineTo(bx + 59, ny - 10);
            bctx.stroke();
          }
        }
      }
    }

    // 4. 恶魔城核心空间连续性架构：烘焙厚重城门券洞顶、室内宫殿藻井横梁、地下石拱顶与左右门廊墙体！
    for (const cs of room.ceilingSpans) {
      const cw = cs.x2 - cs.x1;
      bctx.fillStyle = stonePat || '#141c2b';
      bctx.fillRect(cs.x1, 0, cw, cs.bottomY);

      // 底部深邃遮蔽渐变
      const cg = bctx.createLinearGradient(0, Math.max(0, cs.bottomY - 46), 0, cs.bottomY);
      cg.addColorStop(0, 'rgba(5, 7, 13, 0.25)');
      cg.addColorStop(1, 'rgba(5, 7, 13, 0.88)');
      bctx.fillStyle = cg;
      bctx.fillRect(cs.x1, 0, cw, cs.bottomY);

      if (cs.style === 'palace_timber') {
        // 宫殿雕梁画栋朱漆大梁与鎏金斗拱下沿
        bctx.fillStyle = '#450f0c';
        bctx.strokeStyle = '#090d16';
        bctx.lineWidth = 2;
        bctx.fillRect(cs.x1, cs.bottomY - 16, cw, 16);
        bctx.strokeRect(cs.x1, cs.bottomY - 16, cw, 16);
        bctx.strokeStyle = '#cfa349';
        bctx.lineWidth = 1.5;
        bctx.beginPath();
        bctx.moveTo(cs.x1, cs.bottomY - 3);
        bctx.lineTo(cs.x2, cs.bottomY - 3);
        bctx.stroke();
      } else {
        // 瓮城城门石券洞 / 地下暗渠厚重青石拱肋压条
        bctx.fillStyle = '#273449';
        bctx.strokeStyle = '#060911';
        bctx.lineWidth = 2;
        bctx.fillRect(cs.x1, cs.bottomY - 14, cw, 14);
        bctx.strokeRect(cs.x1, cs.bottomY - 14, cw, 14);
      }
    }

    // 5. 左右房间边界：无门侧砌筑实心封死城墙，有门侧砌筑【带124px高过道门洞的连廊石门框】！
    const bakeSideWallAndDoor = (side: 'left' | 'right') => {
      const hasDoor = side === 'left' ? Boolean(room.leftRoomId) : Boolean(room.rightRoomId);
      const doorFloorY =
        (side === 'left' ? room.leftDoorFloorY : room.rightDoorFloorY) ??
        sampleSolidGroundY(room, side === 'left' ? 10 : room.pixelW - 10);
      const wx = side === 'left' ? 0 : room.pixelW - 32;

      if (!hasDoor) {
        // 封死端墙（如苦竹渡最西侧、洗墨堂最东侧、藏甲密室西尽头）
        if (room.ceilingSpans.length > 0 || room.mapY !== 1) {
          bctx.fillStyle = stonePat || '#161f30';
          bctx.fillRect(wx, 0, 32, doorFloorY);
          bctx.strokeStyle = '#334155';
          bctx.lineWidth = 3;
          bctx.strokeRect(wx, 0, 32, doorFloorY);
        }
      } else {
        // 贯通门廊：上方门楣厚墙 (y=0 .. doorTopY) + 下方幽深拱门通道暗影与接引微光！
        const doorTopY = doorFloorY - 124;
        bctx.fillStyle = stonePat || '#182234';
        bctx.fillRect(wx, 0, 34, doorTopY);
        bctx.fillStyle = '#2d3b4e';
        bctx.strokeStyle = '#cfa349';
        bctx.lineWidth = 1.6;
        bctx.fillRect(wx, doorTopY - 10, 36, 12);
        bctx.strokeRect(wx, doorTopY - 10, 36, 12);

        // 门洞纵深微光渐变（一眼看出前方连通下一座厅堂！）
        const dg = bctx.createLinearGradient(
          side === 'left' ? 0 : room.pixelW,
          0,
          side === 'left' ? 54 : room.pixelW - 54,
          0
        );
        dg.addColorStop(0, 'rgba(251, 191, 36, 0.24)');
        dg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        bctx.fillStyle = dg;
        bctx.fillRect(side === 'left' ? 0 : room.pixelW - 54, doorTopY, 54, 124);
      }
    };
    bakeSideWallAndDoor('left');
    bakeSideWallAndDoor('right');
  }

  /**
   * 渲染贯通上下层房间的【天井天光柱 / 地井冷雾】、可劈碎的【玄铁千斤闸门】以及【太极八卦传送阵】！
   */
  private renderShaftLightAndIronGates(
    ctx: CanvasRenderingContext2D,
    room: BuiltRoom,
    engine: GameEngine
  ): void {
    const bossCleared = engine.isBossClearedInRoom(room);

    // 1. 上下层竖井天光引路光束与井口提示
    for (const sh of room.shafts) {
      const cx = (sh.x1 + sh.x2) * 0.5;
      const w = sh.x2 - sh.x1;
      if (sh.dir === 'up') {
        if (sh.requireBossClear && !bossCleared) {
          // 击败妖王前，顶棚天井由重型青铜封魔栅栏锁闭
          ctx.fillStyle = '#292524';
          ctx.strokeStyle = '#cfa349';
          ctx.lineWidth = 2;
          ctx.fillRect(sh.x1, 68, w, 10);
          ctx.strokeRect(sh.x1, 68, w, 10);
        } else {
          // 敞开的天井倾泻而下的皎洁月华/藏书阁金光，视觉引导玩家向上二段跳探索！
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          const lg = ctx.createLinearGradient(0, 0, 0, 290);
          lg.addColorStop(0, 'rgba(125, 211, 252, 0.24)');
          lg.addColorStop(0.55, 'rgba(250, 204, 21, 0.08)');
          lg.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = lg;
          ctx.beginPath();
          ctx.moveTo(sh.x1, 0);
          ctx.lineTo(sh.x2, 0);
          ctx.lineTo(sh.x2 + 28, 290);
          ctx.lineTo(sh.x1 - 28, 290);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      } else {
        // 向下竖井升腾的地底幽青寒雾 + 近距离提示
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const dg = ctx.createLinearGradient(0, room.pixelH, 0, room.pixelH - 130);
        dg.addColorStop(0, 'rgba(45, 212, 191, 0.22)');
        dg.addColorStop(1, 'rgba(45, 212, 191, 0)');
        ctx.fillStyle = dg;
        ctx.fillRect(sh.x1 + 4, room.pixelH - 130, w - 8, 130);
        ctx.restore();

        if (Math.abs(engine.player.x - cx) < 120) {
          ctx.font = 'bold 11.5px "STKaiti", "KaiTi", serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#5eead4';
          ctx.fillText('▾ 按 [↓ + 跃] 下潜连通下层', cx, room.pixelH - 96);
        }
      }
    }

    // 2. 可被重刃【赤炎斩马陌刀】劈碎的玄铁千斤锁链闸门！
    if (room.ironGate && engine.slot && !engine.slot.brokenSecretWalls.includes(room.ironGate.id)) {
      const g = room.ironGate;
      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 2;
      for (let bar = -9; bar <= 9; bar += 6) {
        ctx.fillRect(g.x + bar - 2, g.topY, 4, g.bottomY - g.topY);
        ctx.strokeRect(g.x + bar - 2, g.topY, 4, g.bottomY - g.topY);
      }
      // 横向赤铜锁链与中央兽首铁锁
      const midY = (g.topY + g.bottomY) * 0.56;
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(g.x - 14, midY - 12);
      ctx.lineTo(g.x + 14, midY + 12);
      ctx.moveTo(g.x - 14, midY + 12);
      ctx.lineTo(g.x + 14, midY - 12);
      ctx.stroke();

      ctx.fillStyle = '#7c2d12';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(g.x, midY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (Math.abs(engine.player.x - g.x) < 150) {
        ctx.font = 'bold 12px "STKaiti", "KaiTi", serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fdba74';
        ctx.fillText('玄铁千斤闸（需重刃劈锁）', g.x, g.topY + 46);
      }
      ctx.restore();
    }

    // 3. 地脉太极八卦传送阵法坛
    if (room.special === 'warp_bagua') {
      const cx = room.focalX;
      const gy = room.focalY;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const wg = ctx.createRadialGradient(cx, gy - 26, 4, cx, gy - 26, 95);
      wg.addColorStop(0, 'rgba(45, 212, 191, 0.42)');
      wg.addColorStop(0.6, 'rgba(56, 189, 248, 0.14)');
      wg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = wg;
      ctx.beginPath();
      ctx.arc(cx, gy - 26, 95, 0, Math.PI * 2);
      ctx.fill();

      // 地面旋转乾坤八卦光阵
      ctx.translate(cx, gy - 2);
      ctx.scale(1, 0.28);
      ctx.rotate(this.ambientTime * 1.4);
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 56, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.strokeRect(-38, -38, 76, 76);
      ctx.restore();
    }
  }

  private renderSaveShrine(ctx: CanvasRenderingContext2D, room: BuiltRoom): void {
    if (room.special !== 'save_shrine') return;
    const cx = room.focalX;
    const gy = room.focalY;

    const halo = ctx.createRadialGradient(cx, gy - 68, 12, cx, gy - 68, 160);
    halo.addColorStop(0, 'rgba(250, 204, 21, 0.36)');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, gy - 68, 160, 0, Math.PI * 2);
    ctx.fill();

    const shrineImg = Assets.get('prop_shrine');
    if (shrineImg) {
      const sh = 165;
      const sw = shrineImg.width * (sh / shrineImg.height);
      // 接地环境遮蔽暗影（消除建筑底座生硬感）
      ctx.fillStyle = 'rgba(0, 0, 0, 0.62)';
      ctx.beginPath();
      ctx.ellipse(cx, gy + 3, sw * 0.52, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(shrineImg, cx - sw * 0.5, gy - sh + 5, sw, sh);
    }
  }

  private renderGroundMist(
    ctx: CanvasRenderingContext2D,
    room: BuiltRoom,
    camLeft: number,
    vW: number
  ): void {
    ctx.save();
    for (let i = 0; i < 9; i++) {
      const mx =
        ((i * 310 + this.ambientTime * (18 + (i % 3) * 7)) % (room.pixelW + 300)) - 150;
      if (mx < camLeft - 220 || mx > camLeft + vW + 220) continue;
      const my = sampleGroundY(room, Math.max(0, Math.min(room.pixelW, mx))) - 8;
      const mg = ctx.createRadialGradient(mx, my, 8, mx, my, 125);
      mg.addColorStop(0, 'rgba(148, 163, 184, 0.13)');
      mg.addColorStop(1, 'rgba(148, 163, 184, 0)');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.ellipse(mx, my, 130, 26, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderSkyStrikeTelegraphs(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    for (const sk of engine.skyStrikes) {
      const prog = 1 - sk.timer / sk.maxTimer;
      ctx.save();
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.35 + prog * 0.6})`;
      ctx.lineWidth = 3 + prog * 6;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.moveTo(sk.x, 0);
      ctx.lineTo(sk.x, sk.groundY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(239, 68, 68, 0.55)';
      ctx.beginPath();
      ctx.ellipse(sk.x, sk.groundY, 28 * prog + 6, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private renderAfterImages(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    const slot = engine.slot;
    const p = engine.player;
    const wDef = slot ? WEAPONS[slot.equippedWeapon] || WEAPONS.sword_1 : WEAPONS.sword_1;
    const frameKey = selectHeroSpriteFrame({
      vx: p.vx,
      vy: p.vy,
      onGround: p.onGround,
      runCycle: p.runCycle,
      animTime: p.animTime,
      isHeavy: wDef.archetype === 'greatsword',
      slash: engine.activeSlash,
    });

    const s = HERO_SPRITE_METRICS.baseScale;
    const drawW = HERO_SPRITE_METRICS.canvasW * s;
    const drawH = HERO_SPRITE_METRICS.canvasH * s;
    const dx = -HERO_SPRITE_METRICS.anchorX * s;
    const dy = -HERO_SPRITE_METRICS.footY * s + 2;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const ai of engine.afterImages) {
      const ghostImg = Assets.getTintedSilhouette(frameKey, ai.color || '#2dd4bf');
      if (!ghostImg) continue;
      ctx.save();
      ctx.globalAlpha = ai.alpha * 0.34;
      ctx.translate(ai.x, ai.y);
      ctx.scale(ai.facing, 1);
      ctx.drawImage(ghostImg, dx, dy, drawW, drawH);
      ctx.restore();
    }
    ctx.restore();
  }

  private renderActiveSlashRibbon(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    const sl = engine.activeSlash;
    if (!sl) return;

    if (sl.pogoDown) {
      drawInkSlashRibbon(
        ctx,
        sl.x,
        sl.y,
        sl.facing,
        false,
        66,
        20,
        0.55,
        1.75,
        sl.glowColor,
        1 - sl.progress * 0.5
      );
      return;
    }

    if (sl.archetype === 'greatsword') {
      // 斩马陌刀：蓄力阶段(0..0.32)凝聚赤金火星，挥劈阶段(0.32..1)爆发230°巨幅浓墨赤金月牙罡气！
      if (sl.progress < 0.3) return;
      const p = Math.min(1, (sl.progress - 0.3) / 0.68);
      const flip = sl.comboStep === 0;
      const sAng = -2.45 + p * 0.55;
      const eAng = -2.1 + Math.min(1, p * 1.35) * 3.15;
      drawInkSlashRibbon(
        ctx,
        sl.x,
        sl.y + 4,
        sl.facing,
        flip,
        sl.reachX * 0.9,
        36 * (1 - p * 0.35),
        sAng,
        eAng,
        '#f97316',
        1 - p * 0.55
      );
    } else {
      // 轻剑：三式水墨翡翠弯月剑气绸带！
      const p = sl.progress;
      const flip = sl.comboStep === 2;
      const radius = sl.comboStep === 0 ? sl.reachX * 1.02 : sl.reachX * 0.88;
      const sAng = -1.45 + p * 0.45;
      const eAng = -1.1 + Math.min(1, p * 1.35) * 2.4;
      drawInkSlashRibbon(
        ctx,
        sl.x + sl.facing * (sl.comboStep === 0 ? 14 : 4),
        sl.y,
        sl.facing,
        flip,
        radius,
        24 * (1 - p * 0.4),
        sAng,
        eAng,
        '#2dd4bf',
        1 - p * 0.5
      );
    }
  }

  private renderProjectiles(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    for (const pr of engine.projectiles) {
      ctx.save();
      ctx.translate(pr.x, pr.y);
      if (pr.kind === 'qi_wave') {
        const dir = pr.vx >= 0 ? 1 : -1;
        // 朔风破空斩：叠加态双层流光风刃 + 3道蜿蜒拖尾气丝（0贴图感！）
        drawInkSlashRibbon(ctx, 0, 0, dir, false, pr.r * 1.18, 22, -1.08, 1.08, pr.color, 0.95);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = pr.color;
        for (let k = -1; k <= 1; k++) {
          ctx.globalAlpha = 0.55 - Math.abs(k) * 0.15;
          ctx.lineWidth = 2.2 - Math.abs(k) * 0.5;
          ctx.beginPath();
          ctx.moveTo(dir * 8, k * 14);
          ctx.quadraticCurveTo(
            -dir * 32,
            k * 16 + Math.sin(this.ambientTime * 24 + k) * 8,
            -dir * 68,
            k * 10
          );
          ctx.stroke();
        }
        ctx.restore();
      } else if (pr.kind === 'fire_pillar' || pr.kind === 'holy_fire') {
        // 多层跃动三昧真火（浓烟暗红底 -> 烈焰赤橙 -> 炽白火芯）
        const hMul = pr.kind === 'fire_pillar' ? 1 : 0.42;
        const sway1 = Math.sin(this.ambientTime * 24 + pr.x * 0.1) * 8 * hMul;
        const sway2 = Math.cos(this.ambientTime * 31 + pr.x * 0.2) * 5 * hMul;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        // 外焰
        ctx.fillStyle = 'rgba(234, 88, 12, 0.65)';
        ctx.beginPath();
        ctx.moveTo(-16 * hMul, 2);
        ctx.quadraticCurveTo(-8 * hMul, -36 * hMul, sway1, -68 * hMul);
        ctx.quadraticCurveTo(10 * hMul, -34 * hMul, 16 * hMul, 2);
        ctx.closePath();
        ctx.fill();
        // 内焰白金火芯
        ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
        ctx.beginPath();
        ctx.moveTo(-8 * hMul, 2);
        ctx.quadraticCurveTo(-3 * hMul, -22 * hMul, sway2, -44 * hMul);
        ctx.quadraticCurveTo(4 * hMul, -22 * hMul, 8 * hMul, 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (pr.kind === 'bagua') {
        // 乾坤流光八卦盘（正八边形金青法阵 + 破风流光环）
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.rotate(this.ambientTime * 15);
        ctx.strokeStyle = pr.color;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let s = 0; s < 8; s++) {
          const a = (s * Math.PI) / 4;
          const px = Math.cos(a) * 16;
          const py = Math.sin(a) * 16;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else {
        // 柳叶寒铁飞刀 + 破空银芒尾线
        const ang = Math.atan2(pr.vy, pr.vx);
        ctx.rotate(ang);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const tailG = ctx.createLinearGradient(-38, 0, 10, 0);
        tailG.addColorStop(0, 'rgba(45, 212, 191, 0)');
        tailG.addColorStop(1, 'rgba(226, 232, 240, 0.85)');
        ctx.strokeStyle = tailG;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(-38, 0);
        ctx.lineTo(6, 0);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(-4, -3.2);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-4, 3.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  /**
   * 命中瞬间【破空寒芒裂痕 + 扩散气浪环】（《斩妖行/只狼》灵魂刀刀入肉反馈！）
   */
  private renderSlashImpacts(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    if (engine.slashImpacts.length === 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (const si of engine.slashImpacts) {
      const prog = 1 - si.life / si.maxLife;
      const alpha = Math.max(0, 1 - prog);

      ctx.save();
      ctx.translate(si.x, si.y);

      // 瞬时扩散真气波纹环
      ctx.globalAlpha = alpha * 0.55;
      ctx.strokeStyle = si.color;
      ctx.lineWidth = Math.max(0.8, 2.8 * (1 - prog));
      ctx.beginPath();
      ctx.arc(0, 0, si.ringRadius * (0.35 + prog * 0.85), 0, Math.PI * 2);
      ctx.stroke();

      // 锐利菱形斩裂寒芒主线
      ctx.rotate(si.angle);
      const len = si.length * (0.7 + prog * 0.45);
      const th = si.thickness * (1 - prog * 0.72);

      ctx.globalAlpha = alpha * 0.88;
      ctx.fillStyle = si.color;
      ctx.beginPath();
      ctx.moveTo(-len, 0);
      ctx.quadraticCurveTo(0, -th * 1.6, len, 0);
      ctx.quadraticCurveTo(0, th * 1.6, -len, 0);
      ctx.fill();

      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-len * 0.82, 0);
      ctx.quadraticCurveTo(0, -th * 0.65, len * 0.82, 0);
      ctx.quadraticCurveTo(0, th * 0.65, -len * 0.82, 0);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  private renderParticlesAndFloats(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    for (const pt of engine.particles) {
      const alpha = Math.max(0, pt.life / pt.maxLife);
      const spd = Math.hypot(pt.vx, pt.vy);
      const ang = Math.atan2(pt.vy, pt.vx);

      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate(ang);
      ctx.globalAlpha = alpha;

      if (pt.kind === 'spark') {
        // 刀锋金铁火星：沿速度方向拉长的发光流火细针！
        ctx.globalCompositeOperation = 'lighter';
        const slen = Math.min(18, Math.max(4, spd * 0.055));
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = pt.size * 0.9;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-slen, 0);
        ctx.lineTo(slen * 0.45, 0);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(slen * 0.3, 0, pt.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // 浓墨飞白水滴：沿飞溅方向拉伸的水墨笔触，绝非死板正圆点！
        const stretch = 1 + Math.min(2.2, spd * 0.008);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, pt.size * stretch, pt.size * 0.62, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    for (const fl of engine.floats) {
      ctx.font = `900 ${fl.size}px "STKaiti", "KaiTi", serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
      ctx.fillText(fl.text, fl.x + 1.6, fl.y + 1.6);
      ctx.fillStyle = fl.color;
      ctx.fillText(fl.text, fl.x, fl.y);
    }
  }

  /**
   * 1.24x 前景暗影遮挡层：模拟电影镜头前掠过的墨竹与大殿廊柱，彻底激活横版2.5D纵深感！
   */
  private renderForegroundParallax(
    ctx: CanvasRenderingContext2D,
    vW: number,
    vH: number,
    camLeft: number,
    room: BuiltRoom
  ): void {
    for (const fg of room.foregrounds) {
      const screenX = fg.x - camLeft * fg.parallax;
      if (screenX < -120 || screenX > vW + 120) continue;

      ctx.save();
      if (fg.kind === 'bamboo') {
        const sway = Math.sin(this.ambientTime * 2 + fg.x * 0.01) * 10;
        ctx.strokeStyle = 'rgba(4, 7, 13, 0.86)';
        ctx.lineWidth = 11;
        ctx.beginPath();
        ctx.moveTo(screenX, vH + 10);
        ctx.quadraticCurveTo(screenX + sway * 0.5, vH * 0.5, screenX + sway, -15);
        ctx.stroke();

        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(screenX + 22, vH + 10);
        ctx.quadraticCurveTo(screenX + 28 + sway * 0.6, vH * 0.55, screenX + 34 + sway, 30);
        ctx.stroke();

        ctx.fillStyle = 'rgba(5, 9, 16, 0.88)';
        for (let ly = 70; ly < vH - 40; ly += 85) {
          ctx.beginPath();
          ctx.ellipse(screenX + sway * 0.5 + 18, ly, 24, 5, 0.35, 0, Math.PI * 2);
          ctx.ellipse(screenX + sway * 0.5 - 16, ly + 22, 22, 4.5, -0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (fg.kind === 'dragon_pillar') {
        ctx.fillStyle = 'rgba(6, 8, 14, 0.82)';
        ctx.fillRect(screenX - 28, 0, 56, vH);
        ctx.fillStyle = 'rgba(207, 163, 73, 0.12)';
        ctx.fillRect(screenX - 28, 0, 2, vH);
        ctx.fillRect(screenX + 26, 0, 2, vH);
      }
      ctx.restore();
    }
  }

  private renderScreenSkillOverlays(
    ctx: CanvasRenderingContext2D,
    viewW: number,
    viewH: number,
    engine: GameEngine
  ): void {
    if (engine.taijiFlashTimer > 0) {
      ctx.save();
      ctx.globalAlpha = engine.taijiFlashTimer * 1.6;
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(viewW * 0.5, viewH * 0.55, (0.45 - engine.taijiFlashTimer) * 420, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (engine.soulStealFlashTimer > 0) {
      ctx.fillStyle = `rgba(153, 27, 27, ${engine.soulStealFlashTimer * 0.38})`;
      ctx.fillRect(0, 0, viewW, viewH);
    }

    if (engine.skillBanner) {
      const sb = engine.skillBanner;
      ctx.save();
      ctx.globalAlpha = Math.min(1, sb.timer * 1.8);
      const y = viewH * 0.17;
      // 泼墨飞白卷轴底衬 + 书法招式大字
      const g = ctx.createLinearGradient(viewW * 0.5 - 170, 0, viewW * 0.5 + 170, 0);
      g.addColorStop(0, 'rgba(5, 7, 12, 0)');
      g.addColorStop(0.2, 'rgba(5, 7, 12, 0.9)');
      g.addColorStop(0.8, 'rgba(5, 7, 12, 0.9)');
      g.addColorStop(1, 'rgba(5, 7, 12, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(viewW * 0.5 - 170, y - 26, 340, 42);

      ctx.font = '900 30px "STKaiti", "KaiTi", serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = sb.color;
      ctx.fillText(sb.name, viewW * 0.5, y + 5);
      ctx.restore();
    }
  }

  private renderVirtualControls(ctx: CanvasRenderingContext2D, input: InputController): void {
    ctx.save();
    const bx = input.stickBaseX;
    const by = input.stickBaseY;
    ctx.fillStyle = 'rgba(8, 11, 18, 0.52)';
    ctx.strokeStyle = 'rgba(207, 163, 73, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bx, by, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.fillStyle = 'rgba(207, 163, 73, 0.36)';
      ctx.beginPath();
      ctx.arc(bx + Math.cos(a) * 45, by + Math.sin(a) * 45, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    if (input.touchTrail.length > 1) {
      for (let i = 1; i < input.touchTrail.length; i++) {
        const p0 = input.touchTrail[i - 1];
        const p1 = input.touchTrail[i];
        ctx.strokeStyle = `rgba(45, 212, 191, ${p1.alpha * 0.9})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = input.stickActive ? 'rgba(45, 212, 191, 0.85)' : 'rgba(207, 163, 73, 0.72)';
    ctx.beginPath();
    ctx.arc(input.stickKnobX, input.stickKnobY, 23, 0, Math.PI * 2);
    ctx.fill();

    for (const b of input.buttons) {
      ctx.fillStyle = b.pressed ? b.color : 'rgba(10, 14, 22, 0.72)';
      ctx.strokeStyle = b.color;
      ctx.lineWidth = b.pressed ? 3.5 : 2;
      ctx.beginPath();
      ctx.arc(b.cx, b.cy, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff8eb';
      ctx.font = `bold ${Math.round(b.r * 0.56)}px "STKaiti", "KaiTi", serif`;
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
