import { WEAPONS } from '../data/itemsAndSkills';
import { LORE_STELES } from '../data/storyAndNpcs';
import {
  BuiltRoom,
  getRoomSideDoors,
  sampleGroundY,
  sampleSolidGroundY,
} from '../data/worldMap';
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
  drawSuspensionChain,
} from './GuofengWorldArt';
import { InputController } from './MotionInput';

export class InkVaniaRenderer {
  private terrainCanvas: HTMLCanvasElement | null = null;
  private lightCanvas: HTMLCanvasElement | null = null;
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

    // 锁定 440px 黄金横版动作镜头视高（单格厅堂已对称拓宽至 980px 原生覆盖 19.5:9 / 20:9 全面屏，零右侧空白且跳跃零晃动；
    // 超宽带鱼屏 >2.23:1 时轻柔贴合至 minVH=408 并居中延伸两侧古堡山墙！）
    const baseScale = viewH / 440;
    const fitWidthScale = Math.min(viewH / 408, viewW / room.pixelW);
    const scale = Math.max(baseScale, fitWidthScale);
    const vW = viewW / scale;
    const vH = viewH / scale;

    let camLeft = engine.camX - vW * 0.5;
    let camTop = engine.camY - vH * 0.52;
    if (room.pixelW >= vW) {
      camLeft = Math.max(0, Math.min(room.pixelW - vW, camLeft));
    } else {
      camLeft = (room.pixelW - vW) * 0.5;
    }
    if (room.pixelH >= vH) {
      camTop = Math.max(0, Math.min(room.pixelH - vH, camTop));
    } else {
      camTop = (room.pixelH - vH) * 0.5;
    }

    const shakeAmp = Math.min(4.5, engine.screenShake * 0.75);
    const shakeX = shakeAmp > 0.2 ? (Math.random() - 0.5) * shakeAmp : 0;
    const shakeY = shakeAmp > 0.2 ? (Math.random() - 0.5) * shakeAmp : 0;

    ctx.save();
    ctx.scale(scale, scale);

    // 1. 远景国风手绘 16:9 画卷视差层 (0.22x)
    this.renderPaintedBackdrop(ctx, vW, vH, camLeft, camTop, room);

    // 2. 世界主空间层 (1.0x)：先铺设石板/墨玉地面，再摆放陈设、灯火与人物
    ctx.save();
    ctx.translate(-camLeft + shakeX, -camTop + shakeY);

    this.renderMoonlitWater(ctx, room, engine);

    this.ensureBakedStoneContour(room, engine.slot?.brokenSecretWalls ?? []);
    if (this.terrainCanvas) {
      ctx.drawImage(this.terrainCanvas, 0, 0);
    }
    if (camLeft < 0 || camLeft + vW > room.pixelW) {
      this.renderOuterWingMasonry(ctx, room, camLeft, camTop, vW, vH);
    }

    drawCastleInteriorPropsAndGears(ctx, room, engine.player.animTime);
    this.renderPavilionStructures(ctx, room);
    this.renderRoomHazardsAndCrumbleSlabs(ctx, room, engine);
    this.renderMidgroundArchwaysAndTorches(ctx, room, engine);
    this.renderFloorLightReflections(ctx, room, engine);

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
      if (e.enragedTriggered) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const pulse = Math.sin(this.ambientTime * 11) * 7;
        const ag = ctx.createRadialGradient(
          e.x,
          e.y - e.profile.h * 0.5,
          6,
          e.x,
          e.y - e.profile.h * 0.5,
          64 + pulse
        );
        ag.addColorStop(0, 'rgba(254, 240, 138, 0.42)');
        ag.addColorStop(0.45, 'rgba(239, 68, 68, 0.24)');
        ag.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = ag;
        ctx.beginPath();
        ctx.arc(e.x, e.y - e.profile.h * 0.5, 64 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      drawMonsterOrBoss(ctx, e, this.ambientTime);
    }

    drawSwordFamiliar(ctx, engine, this.ambientTime);
    this.renderSkillGroundFormation(ctx, engine);
    drawHeroCharacter(ctx, engine, this.ambientTime);
    this.renderActiveSkillWorldVfx(ctx, engine);
    this.renderOrbitingSwordsAndLevelUp(ctx, engine);
    this.renderActiveSlashRibbon(ctx, engine);
    this.renderProjectiles(ctx, engine);
    this.renderSlashImpacts(ctx, engine);
    this.renderParticlesAndFloats(ctx, engine);
    this.renderBiomeWeatherAndDrips(ctx, room, camLeft, camTop, vW, vH);

    ctx.restore();

    // 3. 前景遮挡视差层 (1.25x)：手绘盘龙暗影巨柱与近景红绸大宫灯掠过镜头
    this.renderForegroundParallax(ctx, vW, vH, camLeft, room);

    // 3B. 幽暗地宫/古墓/熔窟动态火光包裹照明遮罩（以少侠、火盆、烛台、石灯柱与岩浆为真实光源点亮暗室！）
    this.renderSubterraneanTorchlightEnvelope(ctx, vW, vH, camLeft, camTop, room, engine);

    // 4. 全域环境色调统一滤镜层（将远景、地面、家具与角色统一在同一个国风冷暖光场内，彻底消除拼贴割裂感！）
    this.renderUnifiedBiomeColorGrade(ctx, vW, vH, room);

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

  private renderOuterWingMasonry(
    ctx: CanvasRenderingContext2D,
    room: BuiltRoom,
    camLeft: number,
    camTop: number,
    vW: number,
    vH: number
  ): void {
    const slabImg = Assets.get('env_ground_slab');
    const fillWing = (xStart: number, width: number, borderAtRightEdge: boolean) => {
      if (width <= 0) return;
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#050811';
      ctx.fillRect(xStart, camTop - 16, width, vH + 32);
      if (slabImg) {
        const mY = Math.floor(slabImg.height * 0.42);
        const mH = Math.max(24, slabImg.height - mY - 2);
        for (let y = Math.floor(camTop - 16); y < camTop + vH + 16; y += mH - 2) {
          for (let x = xStart; x < xStart + width; x += slabImg.width) {
            const wClip = Math.min(slabImg.width, xStart + width - x);
            ctx.drawImage(slabImg, 0, mY, wClip, mH, x, y, wClip, mH);
          }
        }
      }
      // 100% 实心玄墨剖面压暗与内侧收口边框（绝不透出半丝背景天空！）
      ctx.fillStyle = 'rgba(4, 6, 13, 0.76)';
      ctx.fillRect(xStart, camTop - 16, width, vH + 32);
      const seamX = borderAtRightEdge ? xStart + width - 3 : xStart;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.65)';
      ctx.fillRect(seamX, camTop - 16, 3, vH + 32);
      ctx.restore();
    };

    if (camLeft < 0) {
      fillWing(camLeft - 16, -camLeft + 16, true);
    }
    if (camLeft + vW > room.pixelW) {
      fillWing(room.pixelW, camLeft + vW - room.pixelW + 16, false);
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
    drawSeamlessParallaxBackdrop(ctx, vW, vH, camLeft, room, this.ambientTime, camTop);
  }

  private renderMoonlitWater(
    ctx: CanvasRenderingContext2D,
    room: BuiltRoom,
    engine: GameEngine
  ): void {
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

        for (let i = 0; i < 10; i++) {
          const rx = wz.x1 + ((i * 97 + this.ambientTime * 28) % Math.max(40, w - 20)) + 10;
          const ry = wz.surfaceY + 4 + (i % 3) * 6;
          ctx.fillStyle = 'rgba(254, 249, 195, 0.58)';
          ctx.beginPath();
          ctx.ellipse(rx, ry, 15, 1.8, 0, 0, Math.PI * 2);
          ctx.fill();
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
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 14; i++) {
        const ry = wz.surfaceY + 6 + i * 5;
        const rx = wz.x1 + w * 0.5 + Math.sin(this.ambientTime * 2.4 + i * 0.85) * (20 + i * 2.2);
        const rw = Math.max(10, 44 - i * 2.1);
        ctx.fillStyle = isCavern
          ? `rgba(45, 212, 191, ${0.22 - i * 0.012})`
          : `rgba(186, 230, 253, ${0.2 - i * 0.011})`;
        ctx.beginPath();
        ctx.ellipse(rx, ry, rw, 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.strokeStyle = isCavern ? 'rgba(94, 234, 212, 0.42)' : 'rgba(148, 163, 184, 0.36)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(wz.x1, wz.surfaceY);
      ctx.lineTo(wz.x2, wz.surfaceY);
      ctx.stroke();
    }

    // 实时绘制少侠趟水奔跑与跃入浅滩激起的水面扩散波纹！
    if (engine.waterRipples.length > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const rp of engine.waterRipples) {
        ctx.strokeStyle = `rgba(186, 230, 253, ${Math.max(0, rp.alpha)})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(rp.x, rp.y, rp.r, Math.max(2, rp.r * 0.19), 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  /**
   * 渲染《恶魔城》式纯手绘区域机关与陷阱：寒铁地刺、龟裂踏陷石板、地肺兽首喷火柱、钟楼青铜月牙斩仙摆斧！
   */
  private renderRoomHazardsAndCrumbleSlabs(
    ctx: CanvasRenderingContext2D,
    room: BuiltRoom,
    engine: GameEngine
  ): void {
    const t = engine.player.animTime;
    const crumbleImg = Assets.get('hazard_crumble_slab');
    const spikesImg = Assets.get('hazard_spikes');
    const ventImg = Assets.get('hazard_fire_vent');
    const pendImg = Assets.get('hazard_pendulum');
    const chainImg = Assets.get('arch_iron_chain');

    // 1. 龟裂踏陷古石板 (`liveCrumbleSlabs`)
    if (crumbleImg && engine.liveCrumbleSlabs.length > 0) {
      for (const cs of engine.liveCrumbleSlabs) {
        if (cs.state === 'broken') {
          if (cs.timer < 0.45) {
            ctx.save();
            ctx.globalAlpha = ((0.45 - cs.timer) / 0.45) * 0.45;
            const drawH = Math.max(36, (cs.w + 8) * (crumbleImg.height / crumbleImg.width));
            ctx.drawImage(crumbleImg, cs.x - 4, cs.y - 3, cs.w + 8, drawH);
            ctx.restore();
          }
          continue;
        }
        const jitterX = cs.state === 'shaking' ? Math.sin(t * 58) * 2.6 : 0;
        const jitterY = cs.state === 'shaking' ? Math.cos(t * 46) * 1.2 : 0;
        const drawW = cs.w + 8;
        const drawH = Math.min(54, Math.max(36, drawW * (crumbleImg.height / crumbleImg.width)));
        ctx.drawImage(crumbleImg, cs.x - 4 + jitterX, cs.y - 3 + jitterY, drawW, drawH);
      }
    }

    if (!room.hazards || room.hazards.length === 0) return;

    for (const hz of room.hazards) {
      if (hz.kind === 'spikes' && spikesImg) {
        const drawW = hz.span;
        const drawH = Math.min(44, Math.max(28, drawW * (spikesImg.height / spikesImg.width) * 0.78));
        ctx.drawImage(spikesImg, hz.x, hz.y - drawH + 5, drawW, drawH);
      } else if (hz.kind === 'fire_vent') {
        const period = hz.speed ?? 3.4;
        const cyc = (((t + (hz.phase ?? 0)) % period) + period) % period;
        const norm = cyc / period;
        const isTelegraph = norm >= 0.48 && norm < 0.68;
        const isErupting = norm >= 0.68 && norm <= 0.92;

        // 喷发烈焰柱与蓄势红金熔光
        if (isTelegraph || isErupting) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          if (isTelegraph) {
            const pProg = (norm - 0.48) / 0.2;
            const tg = ctx.createRadialGradient(hz.x, hz.y - 6, 4, hz.x, hz.y - 12, 34 + pProg * 22);
            tg.addColorStop(0, `rgba(254, 240, 138, ${0.42 + pProg * 0.4})`);
            tg.addColorStop(0.55, 'rgba(249, 115, 22, 0.32)');
            tg.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = tg;
            ctx.beginPath();
            ctx.arc(hz.x, hz.y - 8, 56, 0, Math.PI * 2);
            ctx.fill();
          } else {
            const eProg = Math.sin(((norm - 0.68) / 0.24) * Math.PI);
            const curH = hz.span * (0.45 + 0.55 * eProg);
            const sway = Math.sin(t * 28 + hz.x) * 4;
            const fg = ctx.createLinearGradient(0, hz.y, 0, hz.y - curH);
            fg.addColorStop(0, 'rgba(254, 249, 195, 0.95)');
            fg.addColorStop(0.35, 'rgba(251, 146, 60, 0.85)');
            fg.addColorStop(0.78, 'rgba(220, 38, 38, 0.46)');
            fg.addColorStop(1, 'rgba(127, 29, 29, 0)');
            ctx.fillStyle = fg;
            ctx.beginPath();
            ctx.moveTo(hz.x - 20, hz.y);
            ctx.quadraticCurveTo(hz.x - 16 + sway, hz.y - curH * 0.55, hz.x + sway * 0.6, hz.y - curH);
            ctx.quadraticCurveTo(hz.x + 16 + sway, hz.y - curH * 0.55, hz.x + 20, hz.y);
            ctx.closePath();
            ctx.fill();

            // 内芯炽白火舌
            ctx.fillStyle = 'rgba(254, 252, 232, 0.85)';
            ctx.beginPath();
            ctx.moveTo(hz.x - 9, hz.y);
            ctx.quadraticCurveTo(hz.x + sway * 0.5, hz.y - curH * 0.6, hz.x + sway * 0.3, hz.y - curH * 0.82);
            ctx.quadraticCurveTo(hz.x + 9, hz.y - curH * 0.4, hz.x + 9, hz.y);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }

        if (ventImg) {
          const vw = 74;
          const vh = vw * (ventImg.height / ventImg.width);
          ctx.drawImage(ventImg, hz.x - vw * 0.5, hz.y - vh + 5, vw, vh);
        }
      } else if (hz.kind === 'pendulum' && pendImg) {
        const ang = Math.sin(t * (hz.speed ?? 1.9) + (hz.phase ?? 0)) * 0.68;
        const velSign = Math.cos(t * (hz.speed ?? 1.9) + (hz.phase ?? 0));
        if (chainImg) {
          drawSuspensionChain(ctx, chainImg, hz.x, Math.max(4, hz.y - 18), hz.y + 10, 16, 0.88);
        }

        // 刀锋掠过空气的寒铁残影弧线
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.22)';
        ctx.lineWidth = 5;
        const a0 = Math.PI * 0.5 + ang;
        const a1 = a0 - velSign * 0.26;
        ctx.beginPath();
        ctx.arc(hz.x, hz.y, hz.span, Math.min(a0, a1), Math.max(a0, a1));
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.translate(hz.x, hz.y);
        ctx.rotate(-ang);
        const ph = hz.span + 24;
        const pw = ph * (pendImg.width / pendImg.height);
        ctx.drawImage(pendImg, -pw * 0.5, -6, pw, ph);
        ctx.restore();
      }
    }
  }

  /**
   * 区域专属微生态气候粒子与溶洞滴水涟漪（竹叶萧萧、炉火飞烬、溶洞滴水、冥廊磷火、梨园落红、星汉微尘）
   */
  private renderBiomeWeatherAndDrips(
    ctx: CanvasRenderingContext2D,
    room: BuiltRoom,
    camLeft: number,
    camTop: number,
    vW: number,
    vH: number
  ): void {
    const t = this.ambientTime;
    const isCatacomb = room.bgKey === 'bg_catacomb_tomb';

    ctx.save();
    if (room.region === 'gatehouse') {
      // 外城苍竹瓮城：夜风吹拂墨绿竹叶斜掠而过
      for (let i = 0; i < 14; i++) {
        const lx =
          camLeft +
          ((((i * 173 + t * (48 + (i % 4) * 14)) % (vW + 120)) + (vW + 120)) % (vW + 120)) -
          60;
        const ly =
          camTop +
          ((((i * 97 + t * (22 + (i % 3) * 8) + Math.sin(t * 2 + i) * 14) % (vH + 60)) +
            (vH + 60)) %
            (vH + 60)) -
          30;
        const rot = t * 2.2 + i * 1.3;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(rot);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(52, 211, 153, 0.36)' : 'rgba(20, 83, 45, 0.52)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 5.5, 1.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else if (room.region === 'forge') {
      // 地肺铸剑坊：热浪裹挟赤金炉火余烬袅袅升腾
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 18; i++) {
        const ex =
          camLeft +
          ((((i * 149 + Math.sin(t * 1.6 + i) * 22) % (vW + 80)) + (vW + 80)) % (vW + 80)) -
          40;
        const ey =
          camTop +
          vH -
          ((((i * 83 + t * (32 + (i % 4) * 11)) % (vH + 60)) + (vH + 60)) % (vH + 60));
        ctx.fillStyle = i % 3 === 0 ? 'rgba(254, 240, 138, 0.62)' : 'rgba(249, 115, 22, 0.48)';
        ctx.beginPath();
        ctx.arc(ex, ey, 1.3 + (i % 2) * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (room.region === 'prison') {
      // 寒潭水牢 & 九幽冥廊：洞顶钟乳石滴落水珠 + 落地水圈 + 幽冥碧磷鬼火
      for (let i = 0; i < 7; i++) {
        const dx = ((i * 277 + 130) % Math.max(200, room.pixelW - 160)) + 80;
        if (dx < camLeft - 40 || dx > camLeft + vW + 40) continue;
        const surfY =
          room.waterZones.find((wz) => dx >= wz.x1 && dx <= wz.x2)?.surfaceY ??
          sampleSolidGroundY(room, dx);
        const startY = 38;
        const fallSpan = Math.max(80, surfY - startY);
        const period = 2.1 + (i % 3) * 0.45;
        const cyc = ((t + i * 0.67) % period) / period;
        if (cyc < 0.78) {
          const prog = cyc / 0.78;
          const dy = startY + prog * prog * fallSpan;
          ctx.fillStyle = 'rgba(186, 230, 253, 0.68)';
          ctx.beginPath();
          ctx.ellipse(dx, dy, 1.3, 3.8, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const rProg = (cyc - 0.78) / 0.22;
          ctx.strokeStyle = `rgba(125, 211, 252, ${(1 - rProg) * 0.52})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.ellipse(dx, surfY + 1, 4 + rProg * 18, 1.2 + rProg * 3.5, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      if (isCatacomb) {
        ctx.globalCompositeOperation = 'lighter';
        for (let w = 0; w < 9; w++) {
          const wx =
            camLeft +
            ((((w * 193 + Math.sin(t * 0.9 + w * 1.7) * 34) % (vW + 80)) + (vW + 80)) %
              (vW + 80)) -
            40;
          const wy = camTop + 90 + ((w * 67) % Math.max(120, vH - 180)) + Math.cos(t * 1.8 + w) * 14;
          const wg = ctx.createRadialGradient(wx, wy, 1, wx, wy, 14);
          wg.addColorStop(0, 'rgba(110, 231, 183, 0.56)');
          wg.addColorStop(1, 'rgba(16, 185, 129, 0)');
          ctx.fillStyle = wg;
          ctx.beginPath();
          ctx.arc(wx, wy, 14, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (room.region === 'opera' || room.region === 'library') {
      // 百戏梨园与藏书阁：飘舞的胭脂花瓣与古卷金尘
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 12; i++) {
        const px =
          camLeft +
          ((((i * 163 + t * 18 + Math.sin(t * 1.4 + i) * 20) % (vW + 80)) + (vW + 80)) %
            (vW + 80)) -
          40;
        const py =
          camTop + ((((i * 91 + t * 15) % (vH + 60)) + (vH + 60)) % (vH + 60)) - 30;
        ctx.fillStyle =
          room.region === 'opera'
            ? 'rgba(251, 113, 133, 0.42)'
            : 'rgba(253, 224, 71, 0.36)';
        ctx.beginPath();
        ctx.ellipse(px, py, 2.8, 1.5, t + i, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // 皇城大殿 / 望月钟塔 / 凌霄祭天坛：流萤星尘微光
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 11; i++) {
        const sx = camLeft + ((i * 181 + Math.sin(t * 0.8 + i) * 26) % Math.max(120, vW));
        const sy = camTop + ((i * 79 + Math.cos(t * 1.1 + i) * 18) % Math.max(120, vH));
        const twinkle = 0.2 + 0.25 * Math.sin(t * 3.2 + i * 1.9);
        ctx.fillStyle = `rgba(224, 242, 254, ${Math.max(0.05, twinkle)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /**
   * 幽暗地宫 / 古墓 / 熔窟 / 独立秘室动态多光源火光包裹层（1/4 分辨率离屏烘焙，零帧率损耗，极致氛围沉浸感！）
   */
  private renderSubterraneanTorchlightEnvelope(
    ctx: CanvasRenderingContext2D,
    vW: number,
    vH: number,
    camLeft: number,
    camTop: number,
    room: BuiltRoom,
    engine: GameEngine
  ): void {
    const isDarkDungeon =
      room.region === 'prison' ||
      room.region === 'forge' ||
      Boolean(room.isSecretRoom) ||
      room.realm === 'inverted';
    if (!isDarkDungeon) return;

    const scaleDown = 0.25;
    const lw = Math.max(64, Math.ceil(vW * scaleDown));
    const lh = Math.max(48, Math.ceil(vH * scaleDown));
    if (!this.lightCanvas) {
      this.lightCanvas = document.createElement('canvas');
    }
    if (this.lightCanvas.width !== lw || this.lightCanvas.height !== lh) {
      this.lightCanvas.width = lw;
      this.lightCanvas.height = lh;
    }

    const lctx = this.lightCanvas.getContext('2d')!;
    lctx.clearRect(0, 0, lw, lh);

    const darknessAlpha =
      room.bgKey === 'bg_catacomb_tomb'
        ? 0.52
        : room.region === 'prison'
          ? 0.44
          : room.region === 'forge'
            ? 0.36
            : 0.34;
    lctx.globalCompositeOperation = 'source-over';
    lctx.fillStyle = `rgba(3, 6, 13, ${darknessAlpha})`;
    lctx.fillRect(0, 0, lw, lh);

    lctx.globalCompositeOperation = 'destination-out';
    const punchLight = (wx: number, wy: number, radius: number, strength = 1) => {
      const sx = (wx - camLeft) * scaleDown;
      const sy = (wy - camTop) * scaleDown;
      const sr = radius * scaleDown;
      if (sx + sr < 0 || sx - sr > lw || sy + sr < 0 || sy - sr > lh) return;
      const g = lctx.createRadialGradient(sx, sy, sr * 0.08, sx, sy, sr);
      g.addColorStop(0, `rgba(0, 0, 0, ${Math.min(1, strength)})`);
      g.addColorStop(0.55, `rgba(0, 0, 0, ${0.58 * strength})`);
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      lctx.fillStyle = g;
      lctx.beginPath();
      lctx.arc(sx, sy, sr, 0, Math.PI * 2);
      lctx.fill();
    };

    const p = engine.player;
    const flick = Math.sin(this.ambientTime * 9.5) * 8;
    // 1. 少侠自身护体剑意明光与御剑剑灵微光（保证核心战斗视野始终通透清晰！）
    punchLight(p.x, p.y - 38, 210 + flick * 0.5, 0.96);
    if (engine.hasAbility('familiar_sword')) {
      punchLight(engine.familiar.x, engine.familiar.y, 95, 0.65);
    }

    // 2. 房间固定火盆、仙鹤香炉、吊灯光源
    if (room.decorProps) {
      for (const dp of room.decorProps) {
        if (dp.kind === 'dragon_brazier') {
          punchLight(dp.x, dp.y - 68, 195 + flick, 0.95);
        } else if (dp.kind === 'incense_burner') {
          punchLight(dp.x, dp.y - 64, 140 + flick * 0.5, 0.78);
        } else if (dp.kind === 'chandelier') {
          punchLight(dp.x, dp.y + 95, 175 + flick * 0.6, 0.85);
        }
      }
    }

    // 3. 未被劈碎的青石宫灯柱、铜烛台与高空红绸灯笼（劈碎烛台后对应区域真实变暗！）
    for (const tc of engine.liveLanterns) {
      if (tc.broken) continue;
      const gy = sampleSolidGroundY(room, tc.x);
      const ly = gy - tc.y <= 135 ? gy - 44 : tc.y + 16;
      punchLight(tc.x, ly, 138 + flick * 0.6, 0.82);
    }
    for (const ln of room.lanterns) {
      punchLight(ln.x, ln.y, 130 + flick * 0.5, 0.78);
    }

    // 4. 熔金岩浆河、古祠与八卦传送阵自发光
    for (const wz of room.waterZones) {
      if (wz.liquidKind !== 'lava') continue;
      for (let lx = wz.x1 + 60; lx < wz.x2; lx += 140) {
        punchLight(lx, wz.surfaceY - 12, 165 + flick, 0.88);
      }
    }
    if (room.special === 'save_shrine' || room.special === 'warp_bagua') {
      punchLight(room.focalX, room.focalY - 54, 215, 0.96);
    }

    ctx.drawImage(this.lightCanvas, 0, 0, lw, lh, 0, 0, vW, vH);
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

    for (let idx = 0; idx < engine.liveLanterns.length; idx++) {
      const tc = engine.liveLanterns[idx];
      if (tc.broken) continue;
      const gy = sampleSolidGroundY(room, tc.x);
      drawOrthographicLanternPost(ctx, tc.x, tc.y, gy, this.ambientTime, idx, room);
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

      drawHangingSilkLantern(ctx, ln.x, ln.y - 26, this.ambientTime, 1.12, room);

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

  private ensureBakedStoneContour(room: BuiltRoom, brokenSecretWalls: string[]): void {
    const readyKey = `${room.realm}:${room.id}:${brokenSecretWalls.length}:${Boolean(Assets.get('env_ground_slab'))}:${Boolean(Assets.get('env_palace_floor'))}:${Boolean(Assets.get('env_indoor_ledge'))}:${Boolean(Assets.get('env_pavilion'))}:${Boolean(Assets.get('env_stone_ledge'))}:${Boolean(Assets.get('env_bridge'))}:${Boolean(Assets.get('arch_timber_pillar'))}:${Boolean(Assets.get('arch_stone_pillar'))}:${Boolean(Assets.get('arch_corbel_bracket'))}:${Boolean(Assets.get('arch_iron_chain'))}:${Boolean(Assets.get('arch_side_doorframe'))}`;
    if (this.terrainCanvas && this.cachedTerrainKey === readyKey) return;

    this.cachedTerrainKey = readyKey;
    if (!this.terrainCanvas) {
      this.terrainCanvas = document.createElement('canvas');
    }
    this.terrainCanvas.width = room.pixelW;
    this.terrainCanvas.height = room.pixelH;

    const bctx = this.terrainCanvas.getContext('2d')!;
    bakeOrthographicRoomTerrain(bctx, room, brokenSecretWalls);
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
    const ironGateImg = Assets.get('prop_iron_gate');
    for (const sh of room.shafts) {
      const cx = (sh.x1 + sh.x2) * 0.5;
      const w = sh.x2 - sh.x1;
      if (sh.dir === 'up') {
        if (sh.requireBossClear && !bossCleared) {
          // 击败妖王前，顶棚天井由纯手绘青铜重梁横锁
          if (ironGateImg) {
            ctx.drawImage(ironGateImg, 0, 12, ironGateImg.width, 46, sh.x1, 48, w, 24);
          }
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
        if (sh.requireBossClear && !bossCleared) {
          const floorAtSh = sampleSolidGroundY(room, cx);
          if (ironGateImg) {
            ctx.drawImage(ironGateImg, 0, 12, ironGateImg.width, 46, sh.x1, floorAtSh - 14, w, 22);
          }
        } else {
          // 向下竖井袅袅升腾的柔和椭圆幽冥雾缕（彻底淘汰生硬长方体青色色块！）
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          for (let m = 0; m < 3; m++) {
            const prog = (this.ambientTime * 0.42 + m * 0.33) % 1;
            const mx = cx + Math.sin(this.ambientTime * 1.8 + m * 2.1) * (w * 0.22);
            const my = room.pixelH - 12 - prog * 92;
            const mr = Math.min(54, w * 0.44) * (1 - prog * 0.25);
            const mg = ctx.createRadialGradient(mx, my, 2, mx, my, mr);
            mg.addColorStop(0, `rgba(94, 234, 212, ${(1 - prog) * 0.16})`);
            mg.addColorStop(0.55, `rgba(45, 212, 191, ${(1 - prog) * 0.07})`);
            mg.addColorStop(1, 'rgba(45, 212, 191, 0)');
            ctx.fillStyle = mg;
            ctx.beginPath();
            ctx.ellipse(mx, my, mr, mr * 0.52, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }
    }

    // 1B. 困兽血战厅【赤金镇妖封门结界】（清空厅内伏兵前封锁两侧出入口！）
    if (engine.ambushSealed) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const bx of [18, room.pixelW - 18]) {
        const bg = ctx.createLinearGradient(bx - 14, 0, bx + 14, 0);
        bg.addColorStop(0, 'rgba(239, 68, 68, 0)');
        bg.addColorStop(0.5, `rgba(248, 113, 113, ${0.42 + Math.sin(this.ambientTime * 7) * 0.1})`);
        bg.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = bg;
        ctx.fillRect(bx - 14, 0, 28, room.pixelH);
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.72)';
        ctx.lineWidth = 2;
        ctx.setLineDash([14, 10]);
        ctx.lineDashOffset = -this.ambientTime * 40;
        ctx.beginPath();
        ctx.moveTo(bx, 0);
        ctx.lineTo(bx, room.pixelH);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 2. 100% 纯手绘【饕餮青铜千斤闸 (`prop_iron_gate`)】与【九幽紫瘴封魔栅 (`prop_mist_barrier`)】！
    if (room.ironGate && engine.slot && !engine.slot.brokenSecretWalls.includes(room.ironGate.id)) {
      const g = room.ironGate;
      const drawTop = Math.max(28, g.topY);
      const drawH = Math.max(88, g.bottomY - drawTop);
      const midY = drawTop + drawH * 0.52;
      const isMistGate = g.gateKind === 'mist_only';

      ctx.save();
      if (isMistGate) {
        const mistImg = Assets.get('prop_mist_barrier');
        ctx.globalCompositeOperation = 'lighter';
        const mg = ctx.createRadialGradient(g.x, midY, 8, g.x, midY, 84);
        mg.addColorStop(0, 'rgba(216, 180, 254, 0.42)');
        mg.addColorStop(0.6, 'rgba(147, 51, 234, 0.16)');
        mg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = mg;
        ctx.beginPath();
        ctx.arc(g.x, midY, 84, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        if (mistImg) {
          const mw = Math.min(108, Math.max(72, drawH * 0.36));
          ctx.drawImage(mistImg, g.x - mw * 0.5, drawTop, mw, drawH + 4);
        }
      } else if (ironGateImg) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.62)';
        ctx.beginPath();
        ctx.ellipse(g.x, g.bottomY + 2, 34, 6.5, 0, 0, Math.PI * 2);
        ctx.fill();

        const gw = 72;
        ctx.drawImage(ironGateImg, g.x - gw * 0.5, drawTop, gw, drawH + 4);
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
        const shimmer = 0.38 + 0.2 * Math.sin(this.ambientTime * 3.4 + sw.x);
        ctx.strokeStyle = `rgba(253, 224, 71, ${shimmer})`;
        ctx.lineWidth = 1.4;
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

    // 2B-2. 独立隐藏密室封门古壁（未击碎时呈手绘青石封门与暗金裂隙；击碎后显现纯手绘幽邃古墓暗门 `prop_secret_arch`！）
    if (engine.slot) {
      const slabImg = Assets.get('env_ground_slab');
      const secArchImg = Assets.get('prop_secret_arch');
      for (const sd of getRoomSideDoors(room)) {
        if (!sd.secretWallId) continue;
        const isBroken = engine.slot.brokenSecretWalls.includes(sd.secretWallId);
        const wx = sd.side === 'left' ? 0 : room.pixelW - 42;
        const wy = sd.floorY - 122;
        const ww = 42;
        const wh = 124;

        ctx.save();
        if (!isBroken) {
          if (slabImg) {
            ctx.drawImage(slabImg, 8, 22, 56, 92, wx, wy, ww, wh);
          }
          const shimmer = 0.4 + 0.22 * Math.sin(this.ambientTime * 3.2 + sd.floorY);
          ctx.strokeStyle = `rgba(253, 224, 71, ${shimmer})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          const cx = wx + ww * 0.5;
          ctx.moveTo(cx - 5, wy + 22);
          ctx.lineTo(cx + 4, wy + 52);
          ctx.lineTo(cx - 4, wy + 84);
          ctx.lineTo(cx + 3, wy + 108);
          ctx.moveTo(cx + 4, wy + 52);
          ctx.lineTo(cx + (sd.side === 'left' ? 11 : -11), wy + 68);
          ctx.stroke();
        } else if (secArchImg) {
          const ah = 148;
          const aw = secArchImg.width * (ah / secArchImg.height);
          const ax = sd.side === 'left' ? -14 : room.pixelW - aw + 14;
          ctx.drawImage(secArchImg, ax, sd.floorY - ah + 6, aw, ah);
        }
        ctx.restore();
      }
    }

    // 2C. 凌霄祭天坛【乾坤倒悬裂隙】（纯手绘暗门石券 + 旋转本命紫金星璇，零几何方框！）
    if (
      room.id === 'sky_altar' &&
      engine.slot?.invertedUnlocked &&
      !engine.enemies.some((e) => e.profile.isBoss)
    ) {
      const cx = room.focalX;
      const gy = sampleSolidGroundY(room, cx);
      const secArchImg = Assets.get('prop_secret_arch');
      const coreImg = Assets.get('item_yao_core');
      if (secArchImg) {
        const ah = 168;
        const aw = secArchImg.width * (ah / secArchImg.height);
        ctx.drawImage(secArchImg, cx - aw * 0.5, gy - ah + 5, aw, ah);
      }
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const cy = gy - 72;
      const pg = ctx.createRadialGradient(cx, cy, 6, cx, cy, 84 + Math.sin(this.ambientTime * 4.5) * 6);
      pg.addColorStop(0, 'rgba(254, 240, 138, 0.78)');
      pg.addColorStop(0.45, 'rgba(244, 63, 94, 0.46)');
      pg.addColorStop(0.8, 'rgba(168, 85, 247, 0.24)');
      pg.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 42, 66, 0, 0, Math.PI * 2);
      ctx.fill();
      if (coreImg) {
        ctx.translate(cx, cy);
        ctx.rotate(-this.ambientTime * 1.4);
        ctx.drawImage(coreImg, -28, -28, 56, 56);
      }
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
      const coreImg = Assets.get('item_yao_core');
      ctx.save();
      if (coreImg) {
        ctx.drawImage(coreImg, gx - 16, gy - 16, 32, 32);
      }
      ctx.globalCompositeOperation = 'lighter';
      ctx.font = 'bold 11px "STKaiti", "KaiTi", serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f5d0fe';
      ctx.fillText('✦ 破妄显影 · 九幽蚀心蛊 ✦', peiBoss.x, gy - 20);
      ctx.restore();
    }

    // 3. 纯手绘【乾坤太极八卦传送石坛 (`prop_bagua_altar`)】
    if (room.special === 'warp_bagua') {
      const cx = room.focalX;
      const gy = room.focalY;
      const altarImg = Assets.get('prop_bagua_altar');
      ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
      ctx.beginPath();
      ctx.ellipse(cx, gy + 3, 94, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      if (altarImg) {
        const aw = 196;
        const ah = aw * (altarImg.height / altarImg.width);
        ctx.drawImage(altarImg, cx - aw * 0.5, gy - ah + 8, aw, ah);
      }

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const wg = ctx.createRadialGradient(cx, gy - 34, 6, cx, gy - 34, 108);
      wg.addColorStop(0, 'rgba(45, 212, 191, 0.36)');
      wg.addColorStop(0.6, 'rgba(56, 189, 248, 0.12)');
      wg.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = wg;
      ctx.beginPath();
      ctx.arc(cx, gy - 34, 108, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. 镇妖司血月残碑秘档 (`room.steles`)：纯手绘古石碑 + 灵萤微光指引
    if (room.steles && engine.slot) {
      const steleImg = Assets.get('item_relic_pedestal');
      for (const st of room.steles) {
        const gy = sampleSolidGroundY(room, st.x);
        const isRead = Boolean(engine.slot.readSteles?.includes(st.id));
        ctx.save();
        ctx.translate(st.x, gy);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.56)';
        ctx.beginPath();
        ctx.ellipse(0, 2, 26, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();

        if (steleImg) {
          const sh = 108;
          const sw = steleImg.width * (sh / steleImg.height);
          ctx.drawImage(steleImg, -sw * 0.5, -sh + 4, sw, sh);
        }

        if (!isRead) {
          ctx.globalCompositeOperation = 'lighter';
          const sg = ctx.createRadialGradient(0, -52, 3, 0, -52, 46);
          sg.addColorStop(0, 'rgba(125, 211, 252, 0.36)');
          sg.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(0, -52, 46, 0, Math.PI * 2);
          ctx.fill();
        }

        if (Math.abs(engine.player.x - st.x) < 165) {
          const def = LORE_STELES[st.id];
          if (def) {
            ctx.globalCompositeOperation = 'source-over';
            ctx.font = 'bold 12px "STKaiti", "KaiTi", serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.fillText(def.title, 1.1, -112.8);
            ctx.fillStyle = isRead ? '#cbd5e1' : '#7dd3fc';
            ctx.fillText(def.title, 0, -114);
          }
        }
        ctx.restore();
      }
    }
  }

  private renderFloorLightReflections(
    ctx: CanvasRenderingContext2D,
    room: BuiltRoom,
    engine: GameEngine
  ): void {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const castFloorGlow = (lx: number, gy: number, rx: number, alpha: number, rgb: string) => {
      const g = ctx.createRadialGradient(lx, gy + 2, 4, lx, gy + 2, rx);
      g.addColorStop(0, `rgba(${rgb}, ${alpha})`);
      g.addColorStop(1, `rgba(${rgb}, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(lx, gy + 2, rx, 11, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    for (const tc of engine.liveLanterns) {
      if (tc.broken) continue;
      const gy = sampleSolidGroundY(room, tc.x);
      if (Math.abs(gy - tc.y) < 150) {
        castFloorGlow(tc.x, gy, 72, 0.2, '251, 146, 60');
      }
    }

    if (room.decorProps) {
      for (const dp of room.decorProps) {
        if (dp.kind === 'dragon_brazier') {
          castFloorGlow(dp.x, dp.y, 105, 0.26, '249, 115, 22');
        } else if (dp.kind === 'incense_burner') {
          castFloorGlow(dp.x, dp.y, 76, 0.18, '251, 191, 36');
        }
      }
    }

    if (room.special === 'save_shrine') {
      castFloorGlow(room.focalX, room.focalY, 118, 0.26, '251, 191, 36');
    }

    ctx.restore();
  }

  private renderUnifiedBiomeColorGrade(
    ctx: CanvasRenderingContext2D,
    vW: number,
    vH: number,
    room: BuiltRoom
  ): void {
    ctx.save();

    // 1. 区域统一环境光漫射染调（让背景、地砖、家具、主角与怪物同处一个真实物理色温场！）
    ctx.globalCompositeOperation = 'screen';
    const wash = ctx.createLinearGradient(0, 0, 0, vH);
    if (room.realm === 'inverted') {
      wash.addColorStop(0, 'rgba(136, 19, 55, 0.14)');
      wash.addColorStop(1, 'rgba(76, 29, 149, 0.1)');
    } else if (room.region === 'forge') {
      wash.addColorStop(0, 'rgba(180, 52, 12, 0.1)');
      wash.addColorStop(1, 'rgba(234, 88, 12, 0.14)');
    } else if (room.region === 'opera') {
      wash.addColorStop(0, 'rgba(157, 23, 77, 0.08)');
      wash.addColorStop(1, 'rgba(217, 119, 6, 0.1)');
    } else if (room.region === 'main_hall' || room.region === 'library') {
      wash.addColorStop(0, 'rgba(180, 130, 50, 0.07)');
      wash.addColorStop(1, 'rgba(120, 80, 30, 0.08)');
    } else if (room.region === 'prison') {
      wash.addColorStop(0, 'rgba(13, 148, 136, 0.08)');
      wash.addColorStop(1, 'rgba(15, 118, 110, 0.1)');
    } else {
      wash.addColorStop(0, 'rgba(30, 64, 115, 0.09)');
      wash.addColorStop(1, 'rgba(15, 35, 65, 0.08)');
    }
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, vW, vH);

    // 2. 柔和电影暗角收束视线
    ctx.globalCompositeOperation = 'source-over';
    const vig = ctx.createRadialGradient(
      vW * 0.5,
      vH * 0.48,
      vH * 0.44,
      vW * 0.5,
      vH * 0.5,
      vW * 0.8
    );
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1, 'rgba(4, 6, 12, 0.36)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, vW, vH);

    ctx.restore();
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
      skillAnim: engine.activeSkillAnim,
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

    // 3. 战术灵酒丹药护体真炁光晕（烧刀子赤焰 / 少林金钟虚影 / 凌波青风环）
    const bf = engine.activeBuffs;
    if (bf.berserk_wine > 0 || bf.iron_skin > 0 || bf.wind_crit > 0) {
      ctx.save();
      ctx.translate(p.x, p.y - 38);
      ctx.globalCompositeOperation = 'lighter';
      if (bf.iron_skin > 0) {
        ctx.strokeStyle = `rgba(253, 224, 71, ${0.28 + Math.sin(this.ambientTime * 6) * 0.08})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 2, 26, 42, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (bf.berserk_wine > 0) {
        ctx.fillStyle = 'rgba(251, 146, 60, 0.55)';
        for (let i = 0; i < 3; i++) {
          const a = this.ambientTime * 4.5 + i * 2.1;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * 20, 12 - ((this.ambientTime * 28 + i * 16) % 48), 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (bf.wind_crit > 0) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.42)';
        ctx.lineWidth = 1.6;
        const rot = this.ambientTime * 7;
        ctx.beginPath();
        ctx.arc(0, 34, 24, rot, rot + 1.8);
        ctx.stroke();
      }
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
      // 【乌金九节鞭 / 缚魂赤铜锁链刀】：0..0.24 由手部骨骼完成头顶高举挽鞭蓄势，0.24..1 自前伸掌中鞭柄破空甩直！
      if (sl.progress < 0.24) return;
      const p = Math.min(1, (sl.progress - 0.24) / 0.74);
      const snap = Math.sin(Math.min(1, p * 1.25) * Math.PI);
      const aimAng = sl.aimY < -0.35 ? -0.62 : sl.aimY > 0.35 ? 0.38 : 0;
      const maxLen = sl.reachX * (0.36 + snap * 0.7);

      ctx.save();
      ctx.translate(sl.x + sl.facing * 26, sl.y - 16);
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
      // 轻剑：三式水墨翡翠弯月剑气绸带（若佩青莲千影剑则绽放三道真空残影剑网！）
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
      const eqW = engine.slot ? WEAPONS[engine.slot.equippedWeapon] : undefined;
      if (eqW?.specialEffect === 'multi_phantom') {
        drawInkSlashRibbon(
          ctx,
          sl.x + sl.facing * 24,
          sl.y - 10,
          sl.facing,
          !flip,
          radius * 0.94,
          16,
          sAng - 0.25,
          eAng - 0.15,
          '#fef08a',
          (1 - p * 0.45) * 0.82
        );
        drawInkSlashRibbon(
          ctx,
          sl.x + sl.facing * 18,
          sl.y + 10,
          sl.facing,
          flip,
          radius * 0.88,
          15,
          sAng + 0.22,
          eAng + 0.2,
          '#a7f3d0',
          (1 - p * 0.45) * 0.78
        );
      }
    }
  }

  private renderProjectiles(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    for (const pr of engine.projectiles) {
      ctx.save();
      ctx.translate(pr.x, pr.y);
      if (pr.kind === 'qi_wave') {
        const dir = pr.vx >= 0 ? 1 : -1;
        // 朔风破空斩 / 妖王裂空波：叠加态双层流光风刃 + 3道蜿蜒拖尾气丝（0贴图感！）
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
      } else if (pr.enemyFx === 'venom_glob') {
        // 毒沼金蟾：鼓动冒泡的碧紫腐蚀毒囊珠 + 飞溅毒液尾珠（彻底告别错画主角酒葫芦！）
        const ang = Math.atan2(pr.vy, pr.vx);
        const pulse = 1 + Math.sin(this.ambientTime * 22 + pr.x * 0.08) * 0.14;
        ctx.save();
        ctx.rotate(ang);
        // 浓墨毒雾外衬
        ctx.fillStyle = 'rgba(20, 10, 36, 0.78)';
        ctx.beginPath();
        ctx.ellipse(-2, 0, 13.5 * pulse, 9.8 * pulse, 0, 0, Math.PI * 2);
        ctx.fill();
        // 拖尾毒滴
        for (let d = 1; d <= 3; d++) {
          const dx = -10 - d * 8.5;
          const dy = Math.sin(this.ambientTime * 18 + d * 2.1) * 3.2;
          ctx.fillStyle = d % 2 === 0 ? 'rgba(168, 85, 247, 0.72)' : 'rgba(74, 222, 128, 0.78)';
          ctx.beginPath();
          ctx.arc(dx, dy, Math.max(1.8, 4.6 - d * 0.9), 0, Math.PI * 2);
          ctx.fill();
        }
        // 荧光紫绿毒液球核
        ctx.globalCompositeOperation = 'lighter';
        const vg = ctx.createRadialGradient(2, -1.5, 1.5, 0, 0, 12 * pulse);
        vg.addColorStop(0, 'rgba(187, 247, 208, 0.95)');
        vg.addColorStop(0.45, 'rgba(74, 222, 128, 0.85)');
        vg.addColorStop(0.82, 'rgba(168, 85, 247, 0.65)');
        vg.addColorStop(1, 'rgba(88, 28, 135, 0)');
        ctx.fillStyle = vg;
        ctx.beginPath();
        ctx.ellipse(0, 0, 12 * pulse, 8.8 * pulse, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (pr.enemyFx === 'venom_pool') {
        // 毒沼金蟾落地腐蚀毒潭：紫绿毒泥翻泡 + 袅袅升腾瘴雾
        const fade = Math.min(1, pr.life / 0.35);
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.fillStyle = 'rgba(24, 12, 42, 0.78)';
        ctx.beginPath();
        ctx.ellipse(0, -1, 26, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalCompositeOperation = 'lighter';
        const pg = ctx.createRadialGradient(0, -2, 2, 0, -2, 24);
        pg.addColorStop(0, 'rgba(74, 222, 128, 0.75)');
        pg.addColorStop(0.58, 'rgba(168, 85, 247, 0.52)');
        pg.addColorStop(1, 'rgba(88, 28, 135, 0)');
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.ellipse(0, -2, 24, 6.2, 0, 0, Math.PI * 2);
        ctx.fill();

        for (let b = 0; b < 4; b++) {
          const cyc = (this.ambientTime * 2.4 + b * 0.27 + pr.x * 0.01) % 1;
          const bx = Math.sin(b * 2.3 + pr.x) * 15;
          const by = -3 - cyc * 24;
          const br = (1 - cyc * 0.55) * 3.6;
          ctx.strokeStyle = b % 2 === 0 ? 'rgba(134, 239, 172, 0.82)' : 'rgba(216, 180, 254, 0.76)';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.arc(bx, by, br, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      } else if (pr.enemyFx === 'magma_bomb') {
        // 赤铜镇火巨灵：龟裂炽白熔核火陨石 + 黑烟火星尾迹
        ctx.save();
        const rot = this.ambientTime * 7 + pr.x * 0.02;
        ctx.rotate(rot);
        ctx.fillStyle = '#1c1917';
        ctx.strokeStyle = '#fb923c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let v = 0; v < 7; v++) {
          const a = (v / 7) * Math.PI * 2;
          const rr = 12 + (v % 2 === 0 ? 2.8 : -1.8);
          if (v === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
          else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.globalCompositeOperation = 'lighter';
        const mg = ctx.createRadialGradient(0, 0, 1.5, 0, 0, 17);
        mg.addColorStop(0, 'rgba(254, 249, 195, 0.95)');
        mg.addColorStop(0.5, 'rgba(249, 115, 22, 0.78)');
        mg.addColorStop(1, 'rgba(234, 88, 12, 0)');
        ctx.fillStyle = mg;
        ctx.beginPath();
        ctx.arc(0, 0, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (pr.enemyFx === 'lava_wave') {
        // 赤铜镇火巨灵 / 烛阴：贴地狂飙的【赤金裂地熔浪】（少侠需起跳或化雾跃过！）
        const dir = pr.vx >= 0 ? 1 : -1;
        ctx.save();
        ctx.scale(dir, 1);
        ctx.fillStyle = 'rgba(28, 12, 6, 0.85)';
        ctx.beginPath();
        ctx.ellipse(-4, 15, 24, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalCompositeOperation = 'lighter';
        const wg = ctx.createLinearGradient(-22, 16, 18, -22);
        wg.addColorStop(0, 'rgba(185, 28, 28, 0.25)');
        wg.addColorStop(0.55, 'rgba(249, 115, 22, 0.92)');
        wg.addColorStop(1, 'rgba(254, 249, 195, 0.98)');
        ctx.fillStyle = wg;
        const flicker = Math.sin(this.ambientTime * 34 + pr.x * 0.08) * 4;
        ctx.beginPath();
        ctx.moveTo(-24, 16);
        ctx.quadraticCurveTo(-10, -4, -2, -16 + flicker);
        ctx.lineTo(4, -6);
        ctx.quadraticCurveTo(14, -22 - flicker * 0.6, 18, -24 + flicker * 0.5);
        ctx.quadraticCurveTo(22, 2, 16, 16);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (pr.enemyFx === 'bronze_axe') {
        // 玄甲重盾傀儡：高速疾旋【双刃重铸青铜战斧】+ 琥珀金旋风刃环（彻底告别错画主角八卦镜！）
        const dir = pr.vx >= 0 ? 1 : -1;
        const spin = this.ambientTime * 19 * dir;
        ctx.save();
        // 外圈破风金铁残影光环
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.62)';
        ctx.lineWidth = 3.6;
        ctx.beginPath();
        ctx.arc(0, 0, 20, spin, spin + 2.35);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(254, 243, 199, 0.52)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, 0, 19.5, spin + Math.PI, spin + Math.PI + 2.15);
        ctx.stroke();
        ctx.restore();

        ctx.rotate(spin);
        // 乌木包铜短斧柄
        ctx.fillStyle = '#451a03';
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 1.4;
        ctx.fillRect(-3, -15, 6, 30);
        ctx.strokeRect(-3, -15, 6, 30);

        // 左右对称双月重铜斧刃
        for (const side of [-1, 1] as const) {
          ctx.save();
          ctx.scale(side, 1);
          const ag = ctx.createLinearGradient(3, 0, 19, 0);
          ag.addColorStop(0, '#78350f');
          ag.addColorStop(0.62, '#d97706');
          ag.addColorStop(1, '#fef08a');
          ctx.fillStyle = ag;
          ctx.strokeStyle = '#090d16';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(2.5, -5.5);
          ctx.quadraticCurveTo(13, -13, 18.5, -11.5);
          ctx.quadraticCurveTo(21.5, 0, 18.5, 11.5);
          ctx.quadraticCurveTo(13, 13, 2.5, 5.5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
        // 斧心朱砂兽首铜铆钉
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(0, 0, 3.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (pr.enemyFx === 'cursed_talisman') {
        // 飞天书妖：翻飞燃烧的【朱砂敕令咒符 (`item_talisman_scroll`)】+ 浓墨赤焰尾迹！
        const ang = Math.atan2(pr.vy, pr.vx);
        const flutter = Math.sin(this.ambientTime * 24 + pr.x * 0.05) * 0.22;
        ctx.save();
        ctx.rotate(ang);
        // 浓墨咒怨底气
        ctx.fillStyle = 'rgba(9, 13, 22, 0.68)';
        ctx.beginPath();
        ctx.ellipse(-12, 0, 20, 6.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // 赤红灵符火尾与墨点
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const tg = ctx.createLinearGradient(-38, 0, 8, 0);
        tg.addColorStop(0, 'rgba(239, 68, 68, 0)');
        tg.addColorStop(0.6, 'rgba(239, 68, 68, 0.58)');
        tg.addColorStop(1, 'rgba(253, 224, 71, 0.88)');
        ctx.strokeStyle = tg;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(-38, Math.sin(this.ambientTime * 20) * 3.5);
        ctx.quadraticCurveTo(-18, -flutter * 14, 6, 0);
        ctx.stroke();
        ctx.restore();

        const talImg = Assets.get('item_talisman_scroll');
        ctx.rotate(Math.PI * 0.5 + flutter);
        if (talImg) {
          ctx.drawImage(talImg, -10, -14, 20, 28);
        } else {
          ctx.fillStyle = '#fef08a';
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 1.5;
          ctx.fillRect(-6, -11, 12, 22);
          ctx.strokeRect(-6, -11, 12, 22);
        }
        ctx.restore();
      } else if (pr.enemyFx === 'thunder_lance') {
        // 飞天夜叉：缠绕锯齿金雷电弧的【雷音黄金钢叉 (`part_wpn_spear`)】！
        const ang = Math.atan2(pr.vy, pr.vx);
        ctx.save();
        ctx.rotate(ang);
        const spImg = Assets.get('part_wpn_spear');
        if (spImg) {
          ctx.drawImage(spImg, -24, -6, 48, 12);
        }
        ctx.globalCompositeOperation = 'lighter';
        // 锯齿状狂暴金青雷弧缠绕枪身
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.moveTo(-28, 0);
        for (let s = -22; s <= 18; s += 8) {
          const jag = Math.sin(this.ambientTime * 42 + s * 0.7 + pr.y * 0.1) * 6.5;
          ctx.lineTo(s, jag);
        }
        ctx.lineTo(24, 0);
        ctx.stroke();

        // 枪尖炽白雷芒星核
        const lg = ctx.createRadialGradient(18, 0, 1, 18, 0, 14);
        lg.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
        lg.addColorStop(0.45, 'rgba(250, 204, 21, 0.78)');
        lg.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.arc(18, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (pr.enemyFx === 'opera_needle') {
        // 梨园提线木偶 / 惊梦百戏傩神：拖曳柔美红绸丝线的【梨园鎏金绣花飞针】！
        const ang = Math.atan2(pr.vy, pr.vx);
        ctx.save();
        ctx.rotate(ang);
        // 随风飘舞的胭脂红绸尾线
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const rg = ctx.createLinearGradient(-44, 0, -2, 0);
        rg.addColorStop(0, 'rgba(244, 63, 94, 0)');
        rg.addColorStop(0.55, 'rgba(244, 114, 182, 0.72)');
        rg.addColorStop(1, 'rgba(253, 224, 71, 0.92)');
        ctx.strokeStyle = rg;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        const w1 = Math.sin(this.ambientTime * 28 + pr.x * 0.06) * 5.5;
        const w2 = Math.cos(this.ambientTime * 24 + pr.y * 0.06) * 6.5;
        ctx.bezierCurveTo(-16, w1, -30, w2, -44, w1 * 0.6);
        ctx.stroke();

        // 纤细锐利的赤金长针主体
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.moveTo(-8, -1.8);
        ctx.lineTo(15, 0);
        ctx.lineTo(-8, 1.8);
        ctx.closePath();
        ctx.fill();

        // 针尾红绒线球
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(-7, 0, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.restore();
      } else if (pr.fromPlayer && pr.kind === 'holy_fire' && Assets.get('item_sub_fire_gourd')) {
        const fgImg = Assets.get('item_sub_fire_gourd')!;
        ctx.save();
        ctx.rotate(this.ambientTime * 8);
        ctx.drawImage(fgImg, -15, -18, 30, 36);
        ctx.restore();
      } else if (pr.kind === 'fire_pillar' || pr.kind === 'holy_fire') {
        const hMul = pr.kind === 'fire_pillar' ? 1 : 0.42;
        const sway1 = Math.sin(this.ambientTime * 24 + pr.x * 0.1) * 8 * hMul;
        const sway2 = Math.cos(this.ambientTime * 31 + pr.x * 0.2) * 5 * hMul;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(234, 88, 12, 0.65)';
        ctx.beginPath();
        ctx.moveTo(-16 * hMul, 2);
        ctx.quadraticCurveTo(-8 * hMul, -36 * hMul, sway1, -68 * hMul);
        ctx.quadraticCurveTo(10 * hMul, -34 * hMul, 16 * hMul, 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
        ctx.beginPath();
        ctx.moveTo(-8 * hMul, 2);
        ctx.quadraticCurveTo(-3 * hMul, -22 * hMul, sway2, -44 * hMul);
        ctx.quadraticCurveTo(4 * hMul, -22 * hMul, 8 * hMul, 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (pr.kind === 'seal') {
        // 镇岳盘龙金印（纯手绘 `item_sub_seal.webp` 高抛翻转重印 + 金色流光残影）
        const sealImg = Assets.get('item_sub_seal');
        ctx.save();
        ctx.rotate(this.ambientTime * 9.5);
        if (sealImg) {
          ctx.drawImage(sealImg, -20, -20, 40, 40);
        }
        ctx.restore();
      } else if (pr.kind === 'bagua') {
        // 乾坤流光八卦轮（纯手绘 `item_sub_bagua.webp` 疾旋刃轮）
        const baguaImg = Assets.get('item_sub_bagua');
        ctx.save();
        ctx.rotate(this.ambientTime * 15);
        if (baguaImg) {
          ctx.drawImage(baguaImg, -22, -22, 44, 44);
        }
        ctx.restore();
      } else {
        // 少侠柳叶寒铁飞刀（手绘短刃贴图 + 破空银芒尾线）
        const ang = Math.atan2(pr.vy, pr.vx);
        ctx.rotate(ang);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const tailG = ctx.createLinearGradient(-38, 0, 10, 0);
        tailG.addColorStop(0, 'rgba(45, 212, 191, 0)');
        tailG.addColorStop(
          1,
          pr.fromPlayer ? 'rgba(226, 232, 240, 0.85)' : 'rgba(244, 114, 182, 0.85)'
        );
        ctx.strokeStyle = tailG;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(-38, 0);
        ctx.lineTo(6, 0);
        ctx.stroke();
        ctx.restore();

        const bladeImg = Assets.get('part_wpn_daggers') || Assets.get('part_wpn_sword');
        if (bladeImg) {
          ctx.drawImage(bladeImg, -15, -5, 30, 10);
        }
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
    const lanternImg = Assets.get('prop_lantern');

    for (const fg of room.foregrounds) {
      const sx = fg.x - camLeft * 1.04;
      if (sx < -160 || sx > vW + 160) continue;

      if (fg.kind === 'hanging_lantern' && lanternImg) {
        const sway = Math.sin(this.ambientTime * 2.1 + fg.x * 0.02) * 0.05;
        const lh = 76;
        const lw = lanternImg.width * (lh / lanternImg.height);
        ctx.save();
        ctx.translate(sx, -4);
        ctx.rotate(sway);
        ctx.globalAlpha = 0.88;
        ctx.drawImage(lanternImg, -lw * 0.5, 0, lw, lh);

        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(0, lh * 0.58, 4, 0, lh * 0.58, 96);
        g.addColorStop(0, 'rgba(251, 146, 60, 0.24)');
        g.addColorStop(1, 'rgba(220, 38, 38, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, lh * 0.58, 96, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const warmRegion =
      room.region === 'opera' || room.region === 'forge' || room.region === 'main_hall';
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 8; i++) {
      const wx =
        (((i * 317 - camLeft * 0.28 + this.ambientTime * (7 + (i % 3) * 3)) % (vW + 120)) +
          (vW + 120)) %
          (vW + 120) -
        60;
      const wy =
        (((i * 193 - this.ambientTime * (6 + (i % 3) * 2.5)) % (vH + 80)) + (vH + 80)) %
          (vH + 80) -
        40;
      ctx.fillStyle = warmRegion
        ? i % 2 === 0
          ? 'rgba(253, 224, 71, 0.28)'
          : 'rgba(251, 146, 60, 0.22)'
        : i % 2 === 0
          ? 'rgba(253, 224, 71, 0.24)'
          : 'rgba(45, 212, 191, 0.22)';
      ctx.beginPath();
      ctx.arc(wx, wy, 1.5 + (i % 2) * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * 绝学地面法阵与足底气劲层（位于主角双靴之下：阴阳双鱼太极八卦阵、九幽玄阴噬魂血阵、升龙拔地气环）
   */
  private renderSkillGroundFormation(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    const sk = engine.activeSkillAnim;
    if (!sk) return;
    const p = engine.player;
    const pr = sk.progress;
    const fade = Math.sin(Math.min(1, pr) * Math.PI);

    if (sk.kind === 'taiji_parry') {
      const r = sk.parrySuccess ? 98 : 74;
      ctx.save();
      ctx.translate(p.x, p.y - 2);
      ctx.scale(1, 0.32);
      ctx.rotate(pr * Math.PI * 1.6);

      // 外八卦金环与浓墨衬底
      ctx.fillStyle = `rgba(6, 10, 18, ${0.55 * fade})`;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = sk.parrySuccess
        ? `rgba(253, 224, 71, ${0.92 * fade})`
        : `rgba(45, 212, 191, ${0.75 * fade})`;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      // 八卦方位短爻刻度
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (r * 0.78), Math.sin(a) * (r * 0.78));
        ctx.lineTo(Math.cos(a) * (r * 0.94), Math.sin(a) * (r * 0.94));
        ctx.stroke();
      }

      // 阴阳双鱼太极内旋弧
      ctx.strokeStyle = `rgba(254, 240, 138, ${0.85 * fade})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, -r * 0.32, r * 0.32, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.arc(0, r * 0.32, r * 0.32, Math.PI * 1.5, Math.PI * 0.5, true);
      ctx.stroke();
      ctx.restore();
    } else if (sk.kind === 'jiuyou_soulsteal') {
      ctx.save();
      ctx.translate(p.x, p.y - 2);
      ctx.scale(1, 0.3);
      ctx.rotate(-pr * Math.PI * 2.1);
      ctx.fillStyle = `rgba(24, 4, 12, ${0.65 * fade})`;
      ctx.beginPath();
      ctx.arc(0, 0, 118, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(244, 63, 94, ${0.82 * fade})`;
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.arc(0, 0, 112 * (0.4 + pr * 0.65), 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(192, 132, 252, ${0.65 * fade})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(-64, -64, 128, 128);
      ctx.restore();
    } else if (sk.kind === 'jinghong_rising' && pr < 0.65) {
      const k = pr / 0.65;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - k) * 0.85})`;
      ctx.lineWidth = 3.2 * (1 - k);
      ctx.beginPath();
      ctx.ellipse(sk.startX, sk.startY - 2, 24 + k * 64, 7 + k * 14, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  /**
   * 五大真气绝学与奇门副器世界空间水墨光影演出（与主角 Spine 身姿严丝合缝联动！）
   */
  private renderActiveSkillWorldVfx(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    const sk = engine.activeSkillAnim;
    if (!sk) return;
    const p = engine.player;
    const pr = sk.progress;

    if (sk.kind === 'shuofeng_wave') {
      if (pr < 0.28) {
        // 拧腰聚气：3道旋风气丝向掌中兵刃急速收束！
        const u = pr / 0.28;
        const cx = p.x - sk.facing * 12;
        const cy = p.y - 44;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = sk.color;
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const a = this.ambientTime * 14 + (i * Math.PI * 2) / 3;
          const r = (1 - u) * 44 + 8;
          ctx.globalAlpha = 0.75 * u;
          ctx.beginPath();
          ctx.arc(cx, cy, r, a, a + 1.35);
          ctx.stroke();
        }
        ctx.restore();
      } else {
        // 振臂劈风：身前绽放 155° 水墨破空半月大刀弧！
        const u = (pr - 0.28) / 0.72;
        drawInkSlashRibbon(
          ctx,
          p.x + sk.facing * 14,
          p.y - 42,
          sk.facing,
          false,
          78 + u * 18,
          28 * (1 - u * 0.6),
          -1.28,
          1.18,
          sk.color,
          Math.max(0, 1 - u * 0.9)
        );
      }
    } else if (sk.kind === 'shunying_flash') {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      if (pr < 0.22) {
        // 居合按柄十字寒星！
        const s = Math.sin((pr / 0.22) * Math.PI);
        const gx = sk.startX + sk.facing * 10;
        const gy = sk.startY - 34;
        ctx.strokeStyle = '#fef9c3';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(gx - 18 * s, gy);
        ctx.lineTo(gx + 18 * s, gy);
        ctx.moveTo(gx, gy - 18 * s);
        ctx.lineTo(gx, gy + 18 * s);
        ctx.stroke();
      } else {
        // 瞬影路径电光主线 + 三段错落残影十字剑痕依次炸裂！
        const fade = Math.max(0, 1 - (pr - 0.2) / 0.8);
        ctx.strokeStyle = `rgba(253, 230, 138, ${0.85 * fade})`;
        ctx.lineWidth = 3.5 * fade;
        ctx.beginPath();
        ctx.moveTo(sk.startX, sk.startY - 38);
        ctx.lineTo(sk.endX, sk.endY - 38);
        ctx.stroke();

        for (let k = 0; k < 3; k++) {
          const trig = 0.22 + k * 0.14;
          if (pr < trig) continue;
          const localP = Math.min(1, (pr - trig) / 0.36);
          const alpha = (1 - localP) * 0.92;
          const sx = sk.startX + ((sk.endX - sk.startX) * (k + 0.8)) / 3.4;
          const sy = sk.endY - 42 + (k % 2 === 0 ? -6 : 6);
          const ang = (k % 2 === 0 ? -0.58 : 0.54) * sk.facing;
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(ang);
          ctx.strokeStyle = `rgba(254, 240, 138, ${alpha})`;
          ctx.lineWidth = 3.2 * (1 - localP * 0.6);
          const L = 34 + localP * 16;
          ctx.beginPath();
          ctx.moveTo(-L, 0);
          ctx.lineTo(L, 0);
          ctx.stroke();
          ctx.restore();
        }

        // 收刀归鞘寒星闪烁
        if (pr > 0.68) {
          const sh = Math.sin(((pr - 0.68) / 0.32) * Math.PI);
          const kx = p.x - sk.facing * 8;
          const ky = p.y - 38;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(kx - 13 * sh, ky);
          ctx.lineTo(kx + 13 * sh, ky);
          ctx.moveTo(kx, ky - 13 * sh);
          ctx.lineTo(kx, ky + 13 * sh);
          ctx.stroke();
        }
      }
      ctx.restore();
    } else if (sk.kind === 'jinghong_rising') {
      // 双盘升龙水墨苍龙气柱 + 冲天剑弧！
      const fade = Math.max(0, 1 - pr * 0.85);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let strand = 0; strand < 2; strand++) {
        ctx.strokeStyle =
          strand === 0
            ? `rgba(56, 189, 248, ${0.88 * fade})`
            : `rgba(224, 242, 254, ${0.75 * fade})`;
        ctx.lineWidth = strand === 0 ? 4.2 * fade : 2.4 * fade;
        ctx.beginPath();
        const botY = sk.startY - 6;
        const topY = p.y - 88;
        const steps = 14;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const yy = botY + (topY - botY) * t;
          const phase = t * Math.PI * 3.2 - pr * 11 + strand * Math.PI;
          const xx = p.x + Math.sin(phase) * (24 * (1 - t * 0.35));
          if (i === 0) ctx.moveTo(xx, yy);
          else ctx.lineTo(xx, yy);
        }
        ctx.stroke();
      }
      drawInkSlashRibbon(
        ctx,
        p.x + sk.facing * 8,
        p.y - 52,
        sk.facing,
        false,
        66,
        22 * fade,
        -2.25,
        -0.45,
        '#38bdf8',
        fade
      );
      ctx.restore();
    } else if (sk.kind === 'taiji_parry') {
      // 周身阴阳回旋护体气罩（成功弹反时绽放耀金破招穹顶！）
      const fade = Math.sin(pr * Math.PI);
      const rad = (sk.parrySuccess ? 86 : 62) * (0.55 + pr * 0.55);
      ctx.save();
      ctx.translate(p.x, p.y - 42);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 2; i++) {
        const baseA = pr * Math.PI * 3.4 + i * Math.PI;
        ctx.strokeStyle =
          i === 0
            ? `rgba(253, 224, 71, ${0.9 * fade})`
            : `rgba(45, 212, 191, ${0.85 * fade})`;
        ctx.lineWidth = sk.parrySuccess ? 4.4 : 3;
        ctx.beginPath();
        ctx.arc(0, 0, rad, baseA, baseA + Math.PI * 0.72);
        ctx.stroke();
      }
      ctx.restore();
    } else if (sk.kind === 'jiuyou_soulsteal') {
      // 九幽噬魂血链：自悬空立剑的主角胸前射出弧形墨红锁链直贯群妖并牵引魂珠归体！
      const fade = Math.sin(pr * Math.PI);
      const hx = p.x;
      const hy = p.y - 52;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      if (sk.soulTargets && sk.soulTargets.length > 0) {
        for (let i = 0; i < sk.soulTargets.length; i++) {
          const tg = sk.soulTargets[i];
          const midX = (hx + tg.x) * 0.5;
          const midY = Math.min(hy, tg.y) - 36 - (i % 2) * 18;
          ctx.strokeStyle = `rgba(244, 63, 94, ${0.82 * fade})`;
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.quadraticCurveTo(midX, midY, tg.x, tg.y);
          ctx.stroke();

          // 沿锁链飞向主角胸口的赤红魂魄光球
          const u = 1 - pr;
          const ox = (1 - u) * (1 - u) * hx + 2 * (1 - u) * u * midX + u * u * tg.x;
          const oy = (1 - u) * (1 - u) * hy + 2 * (1 - u) * u * midY + u * u * tg.y;
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(ox, oy, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // 周身盘旋玄阴赤雾弧
      for (let i = 0; i < 3; i++) {
        const a = -pr * 8 + (i * Math.PI * 2) / 3;
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.72 * fade})`;
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(hx, hy, 42 + pr * 48, a, a + 1.2);
        ctx.stroke();
      }
      ctx.restore();
    } else if (sk.kind === 'sub_throw') {
      // 奇门副器脱手瞬间：掌心符印金芒绽放！
      const s = Math.sin(pr * Math.PI);
      const tx = p.x + sk.facing * 24;
      const ty = p.y - 42;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = sk.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(tx, ty, 8 + pr * 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(254, 249, 195, ${0.85 * s})`;
      ctx.beginPath();
      ctx.arc(tx, ty, 4.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private renderScreenSkillOverlays(
    ctx: CanvasRenderingContext2D,
    viewW: number,
    viewH: number,
    engine: GameEngine
  ): void {
    if (engine.soulStealFlashTimer > 0) {
      ctx.fillStyle = `rgba(127, 29, 29, ${engine.soulStealFlashTimer * 0.24})`;
      ctx.fillRect(0, 0, viewW, viewH);
    }

    if (engine.skillBanner) {
      const sb = engine.skillBanner;
      ctx.save();
      ctx.globalAlpha = Math.min(0.92, sb.timer * 1.8);
      const y = viewH * 0.14;
      const g = ctx.createLinearGradient(viewW * 0.5 - 125, 0, viewW * 0.5 + 125, 0);
      g.addColorStop(0, 'rgba(5, 7, 12, 0)');
      g.addColorStop(0.25, 'rgba(5, 7, 12, 0.78)');
      g.addColorStop(0.75, 'rgba(5, 7, 12, 0.78)');
      g.addColorStop(1, 'rgba(5, 7, 12, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(viewW * 0.5 - 125, y - 18, 250, 30);

      ctx.font = '900 20px "STKaiti", "KaiTi", serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = sb.color;
      ctx.fillText(sb.name, viewW * 0.5, y + 3);
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
        // L1 / RT / R1 主机手柄肩键与扳机胶囊按钮（真气充沛时 RT 绝技泛起清冽青芒提示！）
        const x0 = b.cx - b.w * 0.5;
        const y0 = b.cy - b.h * 0.5 + pressOffsetY;
        const rad = b.h * 0.5;
        const cdLeft =
          b.id === 'skill' && engine
            ? engine.player.skillCooldown
            : b.id === 'potion' && engine
              ? engine.player.potionCooldown
              : 0;
        const skillReady =
          b.id === 'skill' && Boolean(engine && engine.player.mp >= 20 && cdLeft <= 0);
        const onCooldown = cdLeft > 0.05;

        ctx.fillStyle = b.pressed
          ? 'rgba(30, 41, 59, 0.94)'
          : skillReady
            ? 'rgba(12, 32, 48, 0.78)'
            : 'rgba(10, 14, 24, 0.68)';
        ctx.strokeStyle = b.pressed
          ? b.accentColor
          : skillReady
            ? 'rgba(56, 189, 248, 0.78)'
            : 'rgba(198, 154, 69, 0.45)';
        ctx.lineWidth = b.pressed ? 2.2 : skillReady ? 1.8 : 1.4;
        ctx.beginPath();
        ctx.roundRect(x0, y0, b.w, b.h, rad);
        ctx.fill();
        ctx.stroke();

        ctx.textBaseline = 'middle';
        ctx.font = '800 9.5px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = b.accentColor;
        ctx.fillText(b.padBadge, x0 + 8, y0 + b.h * 0.52);

        ctx.font = 'bold 11.5px "STKaiti", "KaiTi", serif';
        ctx.textAlign = 'right';
        ctx.fillStyle =
          onCooldown || (b.id === 'skill' && !skillReady) ? '#94a3b8' : '#f8fafc';
        const btnText = onCooldown ? `${cdLeft.toFixed(1)}s` : b.label;
        ctx.fillText(btnText, x0 + b.w - 8, y0 + b.h * 0.52);
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
