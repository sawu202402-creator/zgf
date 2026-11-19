import { WEAPONS } from '../data/itemsAndSkills';
import { BuiltRoom, sampleGroundY, sampleSolidGroundY } from '../data/worldMap';
import { Assets } from './AssetLoader';
import {
  drawHeroCharacter,
  drawInkSlashRibbon,
  drawMonsterOrBoss,
  drawSceneNpc,
  drawSwordFamiliar,
  drawWorldDrop,
  HERO_SPRITE_METRICS,
  selectHeroSpriteFrame,
} from './CharacterArt';
import { GameEngine } from './GameEngine';
import {
  bakeOrthographicRoomTerrain,
  drawCastleInteriorPropsAndGears,
  drawHangingSilkLantern,
  drawOrthographicLanternPost,
  drawOrthographicPavilion,
  drawOrthographicSaveShrine,
  drawOrthographicStoneArchway,
  drawSeamlessParallaxBackdrop,
  drawSeamlessTitlePanorama,
} from './GuofengWorldArt';
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
    drawCastleInteriorPropsAndGears(ctx, room, engine.player.animTime);
    this.renderMidgroundArchwaysAndTorches(ctx, room, engine);
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
    this.renderDyingSoulPillars(ctx, engine);

    for (const e of engine.enemies) {
      drawMonsterOrBoss(ctx, e, this.ambientTime);
    }

    drawSwordFamiliar(ctx, engine, this.ambientTime);
    drawHeroCharacter(ctx, engine, this.ambientTime);
    this.renderOrbitingSwordsAndLevelUp(ctx, engine);
    this.renderActiveSlashRibbon(ctx, engine);
    this.renderProjectiles(ctx, engine);
    this.renderSlashImpacts(ctx, engine);
    this.renderParticlesAndFloats(ctx, engine);

    ctx.restore();

    // 3. 前景遮挡视差层 (1.25x)：手绘盘龙暗影巨柱与近景红绸大宫灯掠过镜头（《胧村正/斩妖行》纵深层次！）
    this.renderForegroundParallax(ctx, vW, vH, camLeft, room);

    // 4. 柔和电影晕影 Vignette（保留边缘灯火与熔炉色彩温度）
    const vig = ctx.createRadialGradient(vW * 0.5, vH * 0.48, vH * 0.42, vW * 0.5, vH * 0.5, vW * 0.78);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(4, 6, 12, 0.34)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, vW, vH);

    ctx.restore();

    // 5. 屏幕级手搓绝技水墨印章横幅与跨门丝滑水墨渐隐过渡
    this.renderScreenSkillOverlays(ctx, viewW, viewH, engine);
    if (engine.roomFadeTimer > 0) {
      ctx.fillStyle = `rgba(4, 6, 12, ${Math.min(0.88, (engine.roomFadeTimer / 0.22) * 0.85)})`;
      ctx.fillRect(0, 0, viewW, viewH);
    }

    // 6. 移动端触屏主机手柄式按键（靠近人物/古祠时 X 键智能切换为金色交互提示！）
    if (input.usingTouch && !input.uiBlocked && !engine.paused) {
      this.renderVirtualControls(ctx, input, engine);
    }
  }

  private renderAiTitlePanorama(
    ctx: CanvasRenderingContext2D,
    viewW: number,
    viewH: number
  ): void {
    drawSeamlessTitlePanorama(ctx, viewW, viewH, this.ambientTime);
  }

  private renderPaintedBackdrop(
    ctx: CanvasRenderingContext2D,
    vW: number,
    vH: number,
    camLeft: number,
    camTop: number,
    room: BuiltRoom
  ): void {
    drawSeamlessParallaxBackdrop(ctx, vW, vH, camLeft, room, this.ambientTime, camTop);
  }

  private renderMoonlitWater(ctx: CanvasRenderingContext2D, room: BuiltRoom): void {
    for (const wz of room.waterZones) {
      const w = wz.x2 - wz.x1;
      const h = room.pixelH - wz.surfaceY;

      if (wz.liquidKind === 'lava') {
        // 赤火古窖熔金铁渠：炽烈橙金岩浆河流 + 热浪辉光！
        const lg = ctx.createLinearGradient(0, wz.surfaceY, 0, room.pixelH);
        lg.addColorStop(0, '#fef08a');
        lg.addColorStop(0.22, '#f97316');
        lg.addColorStop(0.65, '#991b1b');
        lg.addColorStop(1, '#450a0a');
        ctx.fillStyle = lg;
        ctx.fillRect(wz.x1, wz.surfaceY, w, h);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const glow = ctx.createLinearGradient(0, wz.surfaceY - 88, 0, wz.surfaceY + 24);
        glow.addColorStop(0, 'rgba(249, 115, 22, 0)');
        glow.addColorStop(1, 'rgba(251, 146, 60, 0.35)');
        ctx.fillStyle = glow;
        ctx.fillRect(wz.x1, wz.surfaceY - 88, w, 112);

        for (let i = 0; i < 12; i++) {
          const rx = wz.x1 + ((i * 97 + this.ambientTime * 28) % Math.max(40, w - 20)) + 10;
          const ry = wz.surfaceY + 4 + (i % 3) * 6;
          ctx.fillStyle = 'rgba(254, 249, 195, 0.72)';
          ctx.fillRect(rx - 14, ry, 28, 2.5);
        }
        ctx.restore();
        continue;
      }

      const wg = ctx.createLinearGradient(0, wz.surfaceY, 0, room.pixelH);
      wg.addColorStop(0, '#0e293c');
      wg.addColorStop(0.4, '#112a40');
      wg.addColorStop(1, '#050914');
      ctx.fillStyle = wg;
      ctx.fillRect(wz.x1, wz.surfaceY, w, h);

      const isCavern = room.region === 'prison';
      for (let i = 0; i < 16; i++) {
        const ry = wz.surfaceY + 6 + i * 5;
        const rx = wz.x1 + w * 0.52 + Math.sin(this.ambientTime * 3.5 + i * 0.8) * (18 + i * 2);
        const rw = Math.max(12, 82 - i * 3.5);
        ctx.fillStyle = isCavern
          ? `rgba(45, 212, 191, ${0.28 - i * 0.015})`
          : `rgba(248, 113, 113, ${0.28 - i * 0.015})`;
        ctx.fillRect(rx - rw * 0.5, ry, rw, 2.2);
      }

      ctx.strokeStyle = isCavern ? 'rgba(94, 234, 212, 0.42)' : 'rgba(148, 163, 184, 0.36)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(wz.x1, wz.surfaceY);
      ctx.lineTo(wz.x2, wz.surfaceY);
      ctx.stroke();
    }
  }

  private renderMidgroundArchwaysAndTorches(
    ctx: CanvasRenderingContext2D,
    room: BuiltRoom,
    engine: GameEngine
  ): void {
    for (const ar of room.archways) {
      const gy = sampleSolidGroundY(room, ar.x);
      drawOrthographicStoneArchway(ctx, ar.x, gy, ar.title, this.ambientTime);
    }

    for (const tc of engine.liveLanterns) {
      if (tc.broken) continue;
      const gy = sampleSolidGroundY(room, tc.x);
      drawOrthographicLanternPost(ctx, tc.x, tc.y, gy, this.ambientTime);
    }

    const canGrapple = engine.hasAbility('grapple_hook');
    for (const ln of room.lanterns) {
      // 高空飞燕钩锁红灯笼：散发暖橙辉光，习得【飞燕钩锁】靠近时浮现金色锁环引导！
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const lg = ctx.createRadialGradient(ln.x, ln.y, 4, ln.x, ln.y, 92);
      lg.addColorStop(0, 'rgba(251, 146, 60, 0.38)');
      lg.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.arc(ln.x, ln.y, 92, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      drawHangingSilkLantern(ctx, ln.x, ln.y - 26, this.ambientTime, 1.12);

      if (canGrapple && Math.hypot(engine.player.x - ln.x, engine.player.y - 40 - ln.y) < 235) {
        ctx.save();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(ln.x, ln.y, 20 + Math.sin(this.ambientTime * 7) * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 飞燕钩锁飞掠瞬间的赤金丝索连线！
    if (engine.grappleLineTimer > 0 && engine.grappleTarget) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(engine.player.x, engine.player.y - 44);
      ctx.lineTo(engine.grappleTarget.x, engine.grappleTarget.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  private renderPavilionStructures(ctx: CanvasRenderingContext2D, room: BuiltRoom): void {
    for (const pv of room.pavilions) {
      drawOrthographicPavilion(ctx, pv.x, pv.y, pv.w, pv.hasPillars, room);
    }
  }

  private ensureBakedStoneContour(room: BuiltRoom): void {
    const readyKey = `${room.realm}:${room.id}:${Boolean(Assets.get('env_ground_slab'))}:${Boolean(Assets.get('env_palace_floor'))}:${Boolean(Assets.get('prop_stone_wall_tex'))}:${Boolean(Assets.get('env_bridge'))}`;
    if (this.terrainCanvas && this.cachedTerrainKey === readyKey) return;

    this.cachedTerrainKey = readyKey;
    if (!this.terrainCanvas) {
      this.terrainCanvas = document.createElement('canvas');
    }
    this.terrainCanvas.width = room.pixelW;
    this.terrainCanvas.height = room.pixelH;

    const bctx = this.terrainCanvas.getContext('2d')!;
    bakeOrthographicRoomTerrain(bctx, room);
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
      }
    }

    // 2. 可破坏【玄铁千斤闸门】或需缩地化雾穿过的【九幽紫瘴封魔栅】！
    if (room.ironGate && engine.slot && !engine.slot.brokenSecretWalls.includes(room.ironGate.id)) {
      const g = room.ironGate;
      const isMistGate = g.gateKind === 'mist_only';
      ctx.save();
      ctx.fillStyle = isMistGate ? '#1e1b4b' : '#1e293b';
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 2;
      for (let bar = -9; bar <= 9; bar += 6) {
        ctx.fillRect(g.x + bar - 2, g.topY, 4, g.bottomY - g.topY);
        ctx.strokeRect(g.x + bar - 2, g.topY, 4, g.bottomY - g.topY);
      }
      const midY = (g.topY + g.bottomY) * 0.56;
      if (isMistGate) {
        ctx.globalCompositeOperation = 'lighter';
        const mg = ctx.createRadialGradient(g.x, midY, 4, g.x, midY, 64);
        mg.addColorStop(0, 'rgba(192, 132, 252, 0.45)');
        mg.addColorStop(1, 'rgba(192, 132, 252, 0)');
        ctx.fillStyle = mg;
        ctx.fillRect(g.x - 36, g.topY, 72, g.bottomY - g.topY);
        ctx.globalCompositeOperation = 'source-over';
      } else {
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
      }
      ctx.restore();
    }

    // 2B. 恶魔城经典【可击碎隐藏砖墙 / 墙中烤鸡夹层】（截取手绘青石砖并绘出隐秘微光暗裂纹！）
    if (room.secretWalls && engine.slot) {
      const slabImg = Assets.get('env_ground_slab');
      for (const sw of room.secretWalls) {
        if (engine.slot.brokenSecretWalls.includes(sw.id)) continue;
        ctx.save();
        if (slabImg) {
          ctx.drawImage(slabImg, 18, 28, sw.w, 84, sw.x, sw.y, sw.w, sw.h);
        }
        // 金色微光暗裂纹提示细心探索的恶魔城玩家挥剑试探！
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sw.x + sw.w * 0.28, sw.y + sw.h * 0.22);
        ctx.lineTo(sw.x + sw.w * 0.55, sw.y + sw.h * 0.48);
        ctx.lineTo(sw.x + sw.w * 0.36, sw.y + sw.h * 0.76);
        ctx.moveTo(sw.x + sw.w * 0.55, sw.y + sw.h * 0.48);
        ctx.lineTo(sw.x + sw.w * 0.78, sw.y + sw.h * 0.64);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 2C. 凌霄祭天坛【乾坤倒悬裂隙】（通往 180° 九幽倒悬里城！）
    if (
      room.id === 'sky_altar' &&
      engine.slot?.invertedUnlocked &&
      !engine.enemies.some((e) => e.profile.isBoss)
    ) {
      const cx = room.focalX;
      const cy = sampleSolidGroundY(room, cx) - 58;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const pg = ctx.createRadialGradient(cx, cy, 6, cx, cy, 78 + Math.sin(this.ambientTime * 5) * 6);
      pg.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
      pg.addColorStop(0.4, 'rgba(244, 63, 94, 0.55)');
      pg.addColorStop(0.75, 'rgba(168, 85, 247, 0.32)');
      pg.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 46, 72, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(cx, cy);
      ctx.rotate(-this.ambientTime * 2.2);
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.strokeRect(-26, -26, 52, 52);
      ctx.restore();
    }

    // 2D. 若集齐【破妄古镜 + 完整玄鸟佩】决战裴无极，镜光照出其头顶盘踞的【九幽蚀心蛊】真身！
    const peiBoss = engine.enemies.find((e) => e.profile.kind === 'boss_pei_wuji');
    if (
      peiBoss &&
      engine.hasAbility('mirror_truth') &&
      engine.hasAbility('jade_pendant_full')
    ) {
      const gx = peiBoss.x + Math.sin(this.ambientTime * 5) * 18;
      const gy = peiBoss.y - 118 + Math.cos(this.ambientTime * 6.5) * 8;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const gg = ctx.createRadialGradient(gx, gy, 2, gx, gy, 24);
      gg.addColorStop(0, '#ffffff');
      gg.addColorStop(0.45, '#c084fc');
      gg.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.arc(gx, gy, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 11px "STKaiti", "KaiTi", serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f5d0fe';
      ctx.fillText('✦ 破妄显影 · 九幽蚀心蛊 ✦', peiBoss.x, gy - 20);
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
    drawOrthographicSaveShrine(ctx, room.focalX, room.focalY, this.ambientTime);
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
      isXiaoMode: slot?.mode === 'xiaoduanshui',
      crouching: p.crouching,
      sliding: p.slideTimer > 0,
      diveKicking: p.diveKicking,
    });

    const s = HERO_SPRITE_METRICS.baseScale;
    const drawW = HERO_SPRITE_METRICS.canvasW * s;
    const drawH = HERO_SPRITE_METRICS.canvasH * s;
    const dx = -HERO_SPRITE_METRICS.anchorX * s;
    const dy = -HERO_SPRITE_METRICS.footY * s + 2;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const ai of engine.afterImages) {
      const ghostImg = Assets.getTintedSilhouette(frameKey, ai.color || '#38bdf8');
      if (!ghostImg) continue;
      ctx.save();
      ctx.globalAlpha = ai.alpha * 0.42;
      ctx.translate(ai.x, ai.y);
      ctx.scale(ai.facing, 1);
      ctx.drawImage(ghostImg, dx, dy, drawW, drawH);
      ctx.restore();
    }
    ctx.restore();
  }

  /**
   * 致敬《恶魔城：月下夜想曲》经典怪物/Boss 死亡三连炎柱爆散演出！
   */
  private renderDyingSoulPillars(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    if (engine.dyingSouls.length === 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const ds of engine.dyingSouls) {
      const prog = 1 - ds.timer / ds.maxTimer;
      const alpha = Math.max(0, 1 - prog);
      const count = ds.isBoss ? 5 : 3;
      for (let i = 0; i < count; i++) {
        const offX = (i - (count - 1) * 0.5) * (ds.isBoss ? 26 : 15);
        const pillarH = (ds.h * 1.45 + i * 16) * (0.4 + prog * 1.1);
        const pw = (ds.isBoss ? 24 : 13) * (1 - prog * 0.55);
        const px = ds.x + offX;
        const py = ds.y - prog * 28;
        const fg = ctx.createLinearGradient(px, py, px, py - pillarH);
        fg.addColorStop(0, `rgba(254, 240, 138, ${alpha * 0.9})`);
        fg.addColorStop(0.45, `rgba(239, 68, 68, ${alpha * 0.72})`);
        fg.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.moveTo(px - pw, py);
        ctx.quadraticCurveTo(px, py - pillarH * 1.15, px + pw, py);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }

  private renderOrbitingSwordsAndLevelUp(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    const p = engine.player;

    // 1. 奇门副器【子母护体灵剑】：三柄青冥飞剑环绕周身旋转斩邪！
    if (p.orbitSwordTimer > 0) {
      const swordImg = Assets.get('part_wpn_sword');
      ctx.save();
      ctx.translate(p.x, p.y - 42);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) {
        const ang = p.orbitAngle + (i * Math.PI * 2) / 3;
        const ox = Math.cos(ang) * 66;
        const oy = Math.sin(ang) * 52;
        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(ang + Math.PI * 0.5);
        if (swordImg) {
          ctx.drawImage(swordImg, -26, -6, 52, 12);
        }
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.72)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-34, 0);
        ctx.lineTo(28, 0);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }

    // 2. 致敬《恶魔城：月下夜想曲》经典升级演出：真阳通天金光柱 + LEVEL UP！
    if (engine.levelUpPillarTimer > 0) {
      const a = Math.min(1, engine.levelUpPillarTimer * 1.1);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const lg = ctx.createLinearGradient(p.x - 42, 0, p.x + 42, 0);
      lg.addColorStop(0, 'rgba(253, 224, 71, 0)');
      lg.addColorStop(0.5, `rgba(253, 224, 71, ${0.55 * a})`);
      lg.addColorStop(1, 'rgba(253, 224, 71, 0)');
      ctx.fillStyle = lg;
      ctx.fillRect(p.x - 42, p.y - 340, 84, 345);

      ctx.font = '900 18px "STKaiti", "KaiTi", serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(254, 249, 195, ${a})`;
      ctx.fillText('✦ 真阳贯顶 · 武道破境 ✦', p.x, p.y - 102 - (1.45 - engine.levelUpPillarTimer) * 28);
      ctx.restore();
    }
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
        sl.glowColor || '#f97316',
        1 - p * 0.55
      );
    } else if (sl.archetype === 'spear') {
      // 长枪：凌厉银龙突刺寒芒束 + 破风气环！
      if (sl.progress < 0.14) return;
      const p = Math.min(1, (sl.progress - 0.14) / 0.78);
      const thrustExt = Math.sin(p * Math.PI);
      const len = sl.reachX * (0.45 + thrustExt * 0.62);
      const aimAng = sl.aimY < -0.35 ? -0.46 : 0;
      ctx.save();
      ctx.translate(sl.x, sl.y - 4);
      ctx.scale(sl.facing, 1);
      ctx.rotate(aimAng);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = (1 - p * 0.55) * 0.92;

      const sg = ctx.createLinearGradient(10, 0, len, 0);
      sg.addColorStop(0, 'rgba(56, 189, 248, 0)');
      sg.addColorStop(0.55, sl.glowColor || '#38bdf8');
      sg.addColorStop(1, '#ffffff');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(12, -8);
      ctx.lineTo(len, 0);
      ctx.lineTo(12, 8);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(len * 0.58, 0, 6, 18 * thrustExt, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (sl.archetype === 'daggers') {
      // 分水双刺：零前摇极速交叉双月刃光！
      const p = sl.progress;
      drawInkSlashRibbon(
        ctx,
        sl.x + sl.facing * 12,
        sl.y - 2,
        sl.facing,
        false,
        sl.reachX * 0.92,
        15,
        -1.25 + p * 0.3,
        0.95,
        sl.glowColor || '#10b981',
        1 - p * 0.45
      );
      drawInkSlashRibbon(
        ctx,
        sl.x + sl.facing * 14,
        sl.y + 4,
        sl.facing,
        true,
        sl.reachX * 0.85,
        13,
        -1.15 + p * 0.3,
        0.85,
        '#ffffff',
        (1 - p * 0.5) * 0.78
      );
    } else if (sl.archetype === 'whip') {
      // 致敬恶魔城本命兵刃【乌金九节鞭】：九节乌金链环破空抖直 + 八向雷火鞭梢炸裂！
      if (sl.progress < 0.14) return;
      const p = Math.min(1, (sl.progress - 0.14) / 0.82);
      const snap = Math.sin(Math.min(1, p * 1.25) * Math.PI);
      const aimAng = sl.aimY < -0.35 ? -0.62 : sl.aimY > 0.35 ? 0.38 : 0;
      const maxLen = sl.reachX * (0.35 + snap * 0.72);

      ctx.save();
      ctx.translate(sl.x + sl.facing * 14, sl.y - 4);
      ctx.scale(sl.facing, 1);
      ctx.rotate(aimAng);

      // 乌金九节铁链主体
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      const links = 9;
      for (let i = 0; i <= links; i++) {
        const u = i / links;
        const lx = u * maxLen;
        const wave = Math.sin(u * Math.PI * 2.5 - p * 9) * (1 - snap * 0.78) * 14;
        if (i === 0) ctx.moveTo(0, 0);
        else ctx.lineTo(lx, wave);
      }
      ctx.stroke();

      // 叠加态赤金雷音链芒与鞭梢爆闪
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = sl.glowColor || '#eab308';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      const tipWave = Math.sin(Math.PI * 2.5 - p * 9) * (1 - snap * 0.78) * 14;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(maxLen, tipWave, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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
        sl.glowColor || '#2dd4bf',
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
      } else if (pr.kind === 'seal') {
        // 镇岳金印（高抛翻转重印 + 金色流光残影）
        ctx.save();
        ctx.rotate(this.ambientTime * 11);
        ctx.fillStyle = '#92400e';
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2;
        ctx.fillRect(-13, -11, 26, 22);
        ctx.strokeRect(-13, -11, 26, 22);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-5, -16, 10, 5);
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
   * 1.25x 前景视差遮挡层：手绘盘龙暗影巨柱、近景暖红宫灯与区域专属飘散火星/流萤！
   */
  private renderForegroundParallax(
    ctx: CanvasRenderingContext2D,
    vW: number,
    vH: number,
    camLeft: number,
    room: BuiltRoom
  ): void {
    const pillarImg = Assets.get('prop_coiled_pillar');
    const lanternImg = Assets.get('prop_lantern');

    for (const fg of room.foregrounds) {
      const sx = (fg.x - camLeft) * fg.parallax;
      if (sx < -160 || sx > vW + 160) continue;

      if (fg.kind === 'dragon_pillar' && pillarImg) {
        const ph = vH * 1.12;
        const pw = pillarImg.width * (ph / pillarImg.height);
        ctx.save();
        ctx.globalAlpha = 0.42;
        ctx.filter = 'brightness(0.42) contrast(1.15)';
        ctx.drawImage(pillarImg, sx - pw * 0.5, -vH * 0.06, pw, ph);
        ctx.restore();
      } else if (fg.kind === 'hanging_lantern' && lanternImg) {
        const sway = Math.sin(this.ambientTime * 2.1 + fg.x * 0.02) * 0.05;
        const lh = 94;
        const lw = lanternImg.width * (lh / lanternImg.height);
        ctx.save();
        ctx.translate(sx, -6);
        ctx.rotate(sway);
        ctx.globalAlpha = 0.78;
        ctx.drawImage(lanternImg, -lw * 0.5, 0, lw, lh);

        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(0, lh * 0.58, 4, 0, lh * 0.58, 118);
        g.addColorStop(0, 'rgba(251, 146, 60, 0.28)');
        g.addColorStop(1, 'rgba(220, 38, 38, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, lh * 0.58, 118, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const warmRegion =
      room.region === 'opera' || room.region === 'forge' || room.region === 'main_hall';
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 20; i++) {
      const wx =
        (((i * 277 - camLeft * 1.24 + this.ambientTime * (14 + (i % 4) * 5)) % (vW + 120)) +
          (vW + 120)) %
          (vW + 120) -
        60;
      const wy =
        (((i * 173 - this.ambientTime * (11 + (i % 3) * 4)) % (vH + 80)) + (vH + 80)) %
          (vH + 80) -
        40;
      ctx.fillStyle = warmRegion
        ? i % 2 === 0
          ? 'rgba(253, 224, 71, 0.55)'
          : 'rgba(251, 113, 133, 0.45)'
        : i % 2 === 0
          ? 'rgba(253, 224, 71, 0.48)'
          : 'rgba(45, 212, 191, 0.42)';
      ctx.beginPath();
      ctx.arc(wx, wy, 1.7 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
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

  /**
   * 标准主机手柄式移动端虚拟按键渲染器：
   * 左手：黑曜鎏金凹槽摇杆 / 一体式十字方向键 + L1 肩键；
   * 右手：手柄菱形底座托盘 + 等大对称 ABXY 四键（X斩 / A跃 / B闪 / Y符） + R1 肩键！
   */
  private renderVirtualControls(
    ctx: CanvasRenderingContext2D,
    input: InputController,
    engine?: GameEngine
  ): void {
    ctx.save();

    const bx = input.stickBaseX;
    const by = input.stickBaseY;
    const wellR = 52;

    // ==================== 1. 左手：主机手柄方向总成（左摇杆 / 经典十字键） ====================
    ctx.fillStyle = 'rgba(7, 10, 18, 0.56)';
    ctx.strokeStyle = 'rgba(198, 154, 69, 0.42)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(bx, by, wellR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 内圈暗金刻度环
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(bx, by, wellR - 7, 0, Math.PI * 2);
    ctx.stroke();

    if (input.controlStyle === 'dpad') {
      // 经典一体式主机十字方向键 (Cross D-Pad)
      const armLen = 40;
      const armHalf = 14;
      ctx.fillStyle = 'rgba(15, 21, 34, 0.88)';
      ctx.strokeStyle = 'rgba(207, 163, 73, 0.62)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(bx - armHalf, by - armLen);
      ctx.lineTo(bx + armHalf, by - armLen);
      ctx.lineTo(bx + armHalf, by - armHalf);
      ctx.lineTo(bx + armLen, by - armHalf);
      ctx.lineTo(bx + armLen, by + armHalf);
      ctx.lineTo(bx + armHalf, by + armHalf);
      ctx.lineTo(bx + armHalf, by + armLen);
      ctx.lineTo(bx - armHalf, by + armLen);
      ctx.lineTo(bx - armHalf, by + armHalf);
      ctx.lineTo(bx - armLen, by + armHalf);
      ctx.lineTo(bx - armLen, by - armHalf);
      ctx.lineTo(bx - armHalf, by - armHalf);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 中央十字转轴圆凹槽
      ctx.fillStyle = 'rgba(7, 10, 18, 0.75)';
      ctx.beginPath();
      ctx.arc(bx, by, 7, 0, Math.PI * 2);
      ctx.fill();

      // 四向三角指示标（按下对应方向高亮翠玉金芒）
      const dirs: { dx: number; dy: number; active: boolean }[] = [
        { dx: 0, dy: -1, active: input.moveY < 0 },
        { dx: 0, dy: 1, active: input.moveY > 0 },
        { dx: -1, dy: 0, active: input.moveX < 0 },
        { dx: 1, dy: 0, active: input.moveX > 0 },
      ];
      for (const d of dirs) {
        const tx = bx + d.dx * 27;
        const ty = by + d.dy * 27;
        ctx.fillStyle = d.active ? '#2dd4bf' : 'rgba(226, 232, 240, 0.55)';
        ctx.beginPath();
        if (d.dy !== 0) {
          ctx.moveTo(tx, ty + d.dy * 6);
          ctx.lineTo(tx - 6, ty - d.dy * 4);
          ctx.lineTo(tx + 6, ty - d.dy * 4);
        } else {
          ctx.moveTo(tx + d.dx * 6, ty);
          ctx.lineTo(tx - d.dx * 4, ty - 6);
          ctx.lineTo(tx - d.dx * 4, ty + 6);
        }
        ctx.closePath();
        ctx.fill();
      }
    } else {
      // 主机左摇杆模式：底座四向微刻箭头 + 手搓残影轨迹 + 立体防滑摇杆帽
      const chevrons: [number, number][] = [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
      ];
      for (const [dx, dy] of chevrons) {
        const active = (dx !== 0 && input.moveX === dx) || (dy !== 0 && input.moveY === dy);
        const cx = bx + dx * 39;
        const cy = by + dy * 39;
        ctx.fillStyle = active ? 'rgba(45, 212, 191, 0.85)' : 'rgba(207, 163, 73, 0.38)';
        ctx.beginPath();
        if (dy !== 0) {
          ctx.moveTo(cx, cy + dy * 4.5);
          ctx.lineTo(cx - 4.5, cy - dy * 3);
          ctx.lineTo(cx + 4.5, cy - dy * 3);
        } else {
          ctx.moveTo(cx + dx * 4.5, cy);
          ctx.lineTo(cx - dx * 3, cy - 4.5);
          ctx.lineTo(cx - dx * 3, cy + 4.5);
        }
        ctx.closePath();
        ctx.fill();
      }

      if (input.touchTrail.length > 1) {
        for (let i = 1; i < input.touchTrail.length; i++) {
          const p0 = input.touchTrail[i - 1];
          const p1 = input.touchTrail[i];
          ctx.strokeStyle = `rgba(45, 212, 191, ${p1.alpha * 0.78})`;
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
        }
      }

      // 立体同心防滑摇杆帽
      const kx = input.stickKnobX;
      const ky = input.stickKnobY;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = input.stickActive ? '#2dd4bf' : 'rgba(207, 163, 73, 0.82)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(kx, ky, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = input.stickActive
        ? 'rgba(45, 212, 191, 0.45)'
        : 'rgba(226, 232, 240, 0.22)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(kx, ky, 13, 0, Math.PI * 2);
      ctx.stroke();
    }

    // ==================== 2. 右手：手柄 ABXY 菱形底座暗盘 ====================
    const rcx = input.padRightCenterX;
    const rcy = input.padRightCenterY;
    const dSpan = input.padDiamondArm + input.padFaceRadius + 8;

    ctx.save();
    ctx.translate(rcx, rcy);
    ctx.rotate(Math.PI / 4);
    const plateSide = dSpan * 1.18;
    const halfP = plateSide * 0.5;
    ctx.fillStyle = 'rgba(7, 10, 18, 0.36)';
    ctx.strokeStyle = 'rgba(198, 154, 69, 0.22)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(-halfP, -halfP, plateSide, plateSide, 18);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 菱形中心十字暗标
    ctx.strokeStyle = 'rgba(198, 154, 69, 0.24)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(rcx - 7, rcy);
    ctx.lineTo(rcx + 7, rcy);
    ctx.moveTo(rcx, rcy - 7);
    ctx.lineTo(rcx, rcy + 7);
    ctx.stroke();

    // ==================== 3. 渲染 ABXY 菱形四键与 L1/R1 对称胶囊肩键 ====================
    for (const b of input.buttons) {
      const pressOffsetY = b.pressed ? 1.5 : 0;

      if (b.shape === 'pill' && b.w && b.h) {
        // L1 / R1 主机手柄肩键胶囊按钮
        const x0 = b.cx - b.w * 0.5;
        const y0 = b.cy - b.h * 0.5 + pressOffsetY;
        const rad = b.h * 0.5;

        ctx.fillStyle = b.pressed ? 'rgba(30, 41, 59, 0.92)' : 'rgba(10, 14, 24, 0.68)';
        ctx.strokeStyle = b.pressed ? b.accentColor : 'rgba(198, 154, 69, 0.52)';
        ctx.lineWidth = b.pressed ? 2.2 : 1.4;
        ctx.beginPath();
        ctx.roundRect(x0, y0, b.w, b.h, rad);
        ctx.fill();
        ctx.stroke();

        ctx.textBaseline = 'middle';
        ctx.font = '800 10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = b.accentColor;
        ctx.fillText(b.padBadge, x0 + 10, y0 + b.h * 0.52);

        ctx.font = 'bold 12px "STKaiti", "KaiTi", serif';
        ctx.textAlign = 'right';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(b.label, x0 + b.w - 10, y0 + b.h * 0.52);
        continue;
      }

      // ABXY 圆形手柄标准动作键（靠近人物/古祠时 X 键智能切换为暖金【谈/香/阵】！）
      const interactActive =
        b.id === 'attack' && Boolean(engine?.canAttackTriggerInteract() && engine.nearbyInteract);
      const actKind = engine?.nearbyInteract?.kind;
      const displayLabel = interactActive
        ? actKind === 'save'
          ? '香'
          : actKind === 'warp' || actKind === 'invert_portal'
            ? '阵'
            : '谈'
        : b.label;
      const ringCol = interactActive ? '#fde047' : b.accentColor;

      const cy = b.cy + pressOffsetY;
      ctx.fillStyle = interactActive
        ? 'rgba(69, 44, 12, 0.88)'
        : b.pressed
          ? 'rgba(24, 33, 52, 0.94)'
          : 'rgba(10, 14, 24, 0.72)';
      ctx.strokeStyle = interactActive
        ? '#fde047'
        : b.pressed
          ? b.accentColor
          : 'rgba(203, 213, 225, 0.36)';
      ctx.lineWidth = interactActive || b.pressed ? 2.6 : 1.5;
      ctx.beginPath();
      ctx.arc(b.cx, cy, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = ringCol;
      ctx.globalAlpha = interactActive || b.pressed ? 0.95 : 0.55;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(b.cx, cy, b.r - 3.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.fillStyle = '#fffbeb';
      ctx.font = `900 ${Math.round(b.r * 0.68)}px "STKaiti", "KaiTi", serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayLabel, b.cx, cy - 1);

      ctx.fillStyle = ringCol;
      ctx.font = '800 8.5px sans-serif';
      ctx.fillText(b.padBadge, b.cx, cy + b.r * 0.62);
    }

    ctx.restore();
  }
}
