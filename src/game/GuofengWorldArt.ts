import {
  BuiltRoom,
  getRoomSideDoors,
  isInsideDownShaft,
  sampleSolidGroundY,
} from '../data/worldMap';
import { WeaponArchetype } from '../types';
import { AssetKey, Assets } from './AssetLoader';

/**
 * 100% AI 手绘国风重彩立体场景渲染引擎（八大主题画卷 + 厚重须弥城砖地基 + 暖色盘龙火盆光影 + 多层门廊竖塔！）
 */

export function drawCelShadedWeapon(
  ctx: CanvasRenderingContext2D,
  archetype: WeaponArchetype,
  weaponId = 'sword_1',
  lengthPx = 88
): void {
  const isTier3 = weaponId.endsWith('_3');
  const isTier2 = weaponId.endsWith('_2');

  if (archetype === 'daggers') {
    // 背负双刺采用写实单柄弯月刃交叠，摒弃物品栏大图标贴纸感
    const len = lengthPx * 0.48;
    ctx.save();
    ctx.fillStyle = '#3f2e21';
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 1.3;
    ctx.fillRect(-10, -2.5, 10, 5);
    ctx.strokeRect(-10, -2.5, 10, 5);
    ctx.fillStyle = isTier3 ? '#f43f5e' : isTier2 ? '#8b5cf6' : '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(0, -3.5);
    ctx.quadraticCurveTo(len * 0.55, -6.5, len, -4.5);
    ctx.quadraticCurveTo(len * 0.65, 4.2, 0, 3.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  let key: AssetKey = 'part_wpn_sword';
  if (archetype === 'greatsword') key = 'part_wpn_modao';
  else if (archetype === 'spear') key = 'part_wpn_spear';
  else if (archetype === 'whip') key = 'part_wpn_whip';

  const img = Assets.get(key);
  if (!img) return;
  if (archetype === 'whip') {
    const dim = lengthPx * 0.5;
    const w = dim * (img.width / img.height);
    ctx.drawImage(img, -w * 0.5, -dim * 0.5, w, dim);
    return;
  }
  const w = archetype === 'spear' ? lengthPx * 1.18 : lengthPx;
  const h = w * (img.height / img.width);
  ctx.drawImage(img, -w * 0.24, -h * 0.5, w, h);

  if (isTier2 || isTier3) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = isTier3 ? 'rgba(253, 224, 71, 0.72)' : 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = archetype === 'greatsword' ? 3 : 1.8;
    ctx.beginPath();
    ctx.moveTo(w * 0.08, 0);
    ctx.lineTo(w * 0.68, 0);
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * 标题画面：全屏展示高精度 AI 手绘《血月九幽玄城》主视觉画卷 + 动态飘落暖金余烬！
 */
export function drawSeamlessTitlePanorama(
  ctx: CanvasRenderingContext2D,
  viewW: number,
  viewH: number,
  t: number
): void {
  const bg = Assets.get('bg_title');
  if (bg) {
    const scale = Math.max(viewW / bg.width, viewH / bg.height);
    const dw = bg.width * scale;
    const dh = bg.height * scale;
    ctx.drawImage(bg, (viewW - dw) * 0.5, (viewH - dh) * 0.5, dw, dh);
  } else {
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, viewW, viewH);
  }

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 36; i++) {
    const px = ((i * 197 + t * (20 + (i % 5) * 7)) % (viewW + 40)) - 20;
    const py = viewH - (((i * 131 + t * (15 + (i % 4) * 6)) % (viewH + 30)) - 15);
    ctx.fillStyle = i % 3 === 0 ? 'rgba(253, 224, 71, 0.7)' : 'rgba(251, 146, 60, 0.55)';
    ctx.beginPath();
    ctx.arc(px, py, 1.4 + (i % 2.2), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * 局内远景：八大主题 16:9 手绘大画卷 + 自然通透景深暗角（零程序化黑线/色块干扰！）
 */
export function drawSeamlessParallaxBackdrop(
  ctx: CanvasRenderingContext2D,
  vW: number,
  vH: number,
  camLeft: number,
  room: BuiltRoom,
  _t: number,
  camTop = 0
): void {
  let bgKey: AssetKey = room.bgKey || 'bg_gatehouse';
  if (!room.bgKey) {
    if (room.region === 'opera') bgKey = 'bg_opera_market';
    else if (room.region === 'forge') bgKey = 'bg_molten_forge';
    else if (room.region === 'main_hall') bgKey = 'bg_main_hall';
    else if (room.region === 'library') bgKey = 'bg_library_opera';
    else if (room.region === 'clock_tower') bgKey = 'bg_chapel_spire';
    else if (room.region === 'prison') bgKey = 'bg_cavern_waterfall';
    else if (room.region === 'altar') bgKey = 'bg_main_hall';
  }

  const bg = Assets.get(bgKey) || Assets.get('bg_gatehouse');
  if (bg) {
    const aspect = bg.width / bg.height;
    // 采用恒定物理远景视差系数（横向仅 0.11x、纵向仅 0.03x~0.06x），彻底根除按房间余量归一化导致的跳跃/窄厅远景暴冲晃眼问题！
    const parallaxX = 0.11;
    const parallaxY = room.gridH > 1 ? 0.06 : 0.025;
    const maxCamX = Math.max(0, room.pixelW - vW);
    const maxCamY = Math.max(0, room.pixelH - vH);

    const reqW = vW + maxCamX * parallaxX + 12;
    const reqH = vH + maxCamY * parallaxY + 12;
    const drawW = Math.max(reqW, reqH * aspect);
    const drawH = drawW / aspect;

    const extraW = Math.max(0, drawW - reqW);
    const extraH = Math.max(0, drawH - reqH);
    const px = Math.max(vW - drawW, Math.min(0, -extraW * 0.5 - camLeft * parallaxX));
    const py = Math.max(vH - drawH, Math.min(0, -extraH * 0.45 - camTop * parallaxY));

    if (room.realm === 'inverted') {
      ctx.save();
      ctx.translate(0, vH);
      ctx.scale(1, -1);
      ctx.drawImage(bg, px, py, drawW, drawH);
      ctx.restore();

      const invGrad = ctx.createLinearGradient(0, 0, 0, vH);
      invGrad.addColorStop(0, 'rgba(92, 14, 38, 0.34)');
      invGrad.addColorStop(0.55, 'rgba(24, 9, 34, 0.32)');
      invGrad.addColorStop(1, 'rgba(7, 5, 14, 0.66)');
      ctx.fillStyle = invGrad;
      ctx.fillRect(0, 0, vW, vH);
    } else {
      ctx.drawImage(bg, px, py, drawW, drawH);

      // 柔和空气透视薄暮层：适度压稳远景高频细节对比度，突出中景角色与刀光，久看不累眼
      const depthGrad = ctx.createLinearGradient(0, 0, 0, vH);
      depthGrad.addColorStop(0, 'rgba(5, 8, 15, 0.18)');
      depthGrad.addColorStop(0.62, 'rgba(6, 10, 18, 0.28)');
      depthGrad.addColorStop(1, 'rgba(4, 7, 13, 0.6)');
      ctx.fillStyle = depthGrad;
      ctx.fillRect(0, 0, vW, vH);
    }
  } else {
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, vW, vH);
  }
}

/**
 * 烘焙 100% 纯手绘贴图地形层（彻底剔除所有程序化几何方框、半透明墙裙与金条纹贴图污染！）：
 * 1. 宫殿墨玉砖自动裁去顶部画框金条 (`srcTopY = 16%`)，角色与火盆严丝合缝立于玉砖表面；
 * 2. 地基统一采用当前地面贴图自身下半部石砌纹理无缝延伸，零色差断层；
 * 3. 下潜竖井绘制深邃地下石井内壁与收口石沿，告别漏底大黑洞！
 */
export function bakeOrthographicRoomTerrain(bctx: CanvasRenderingContext2D, room: BuiltRoom): void {
  bctx.clearRect(0, 0, room.pixelW, room.pixelH);

  const usePalaceMarble = Boolean(
    room.indoor && room.region !== 'prison' && room.region !== 'forge'
  );
  const floorImg =
    (usePalaceMarble ? Assets.get('env_palace_floor') : undefined) || Assets.get('env_ground_slab');
  const slabImg = Assets.get('env_ground_slab');
  const bridgeImg = Assets.get('env_bridge');

  const isArchBridgeRoom =
    room.waterZones.length > 0 &&
    room.waterZones[0].liquidKind !== 'lava' &&
    room.groundNodes.some((n) => n.style === 'arch_bridge');
  const wz = isArchBridgeRoom ? room.waterZones[0] : null;

  // 0. 下潜竖井 (`dir === 'down'`) 先铺设深邃石井暗壁，彻底消除漏出远景山路的穿帮黑洞！
  for (const sh of room.shafts) {
    if (sh.dir !== 'down') continue;
    const gyL = sampleSolidGroundY(room, Math.max(0, sh.x1 - 8));
    const sw = sh.x2 - sh.x1;
    const wg = bctx.createLinearGradient(0, gyL, 0, room.pixelH);
    wg.addColorStop(0, '#0b1220');
    wg.addColorStop(0.45, '#060a13');
    wg.addColorStop(1, '#03050a');
    bctx.fillStyle = wg;
    bctx.fillRect(sh.x1 - 4, gyL, sw + 8, Math.max(0, room.pixelH - gyL));

    if (slabImg) {
      const mY = Math.floor(slabImg.height * 0.42);
      const mH = Math.max(24, slabImg.height - mY - 2);
      for (let y = gyL + 4; y < room.pixelH; y += mH - 2) {
        bctx.save();
        bctx.globalAlpha = 0.35;
        bctx.drawImage(slabImg, 0, mY, Math.min(sw, slabImg.width), mH, sh.x1, y, sw, mH);
        bctx.restore();
      }
    }
  }

  // 1. 纯手绘同源石材地基 + 地面石板/墨玉台面铺装
  if (floorImg) {
    const sw = floorImg.width;
    const sh = floorImg.height;
    // 裁掉 env_palace_floor 顶部 16% 的外框金线，使脚底碰撞线 gy 直接落在墨玉砖正表面！
    const srcTopY = usePalaceMarble ? Math.floor(sh * 0.16) : 0;
    const srcCapH = sh - srcTopY;
    const surfaceTopOffset = usePalaceMarble ? 3 : 6;

    const subSrcY = Math.floor(sh * (usePalaceMarble ? 0.46 : 0.36));
    const subSrcH = Math.max(24, sh - subSrcY - 2);

    // 1A. 下层同源石砌地基
    for (let x = 0; x < room.pixelW; x += sw) {
      const stepSub = 24;
      for (let sxOff = 0; sxOff < sw && x + sxOff < room.pixelW; sxOff += stepSub) {
        const wx = x + sxOff;
        if (isInsideDownShaft(room, wx + 4) || isInsideDownShaft(room, wx + stepSub - 4)) continue;
        if (wz && wx >= wz.x1 + 18 && wx + stepSub <= wz.x2 - 18) continue;

        const gy = sampleSolidGroundY(room, Math.min(room.pixelW, wx + stepSub * 0.5));
        const startY = gy + srcCapH - surfaceTopOffset - 8;
        const wClip = Math.min(stepSub, sw - sxOff, room.pixelW - wx);

        for (let y = startY; y < room.pixelH; y += subSrcH - 3) {
          const hClip = Math.min(subSrcH, room.pixelH - y);
          if (hClip <= 0) break;
          bctx.drawImage(
            floorImg,
            sxOff,
            subSrcY,
            wClip,
            hClip,
            wx,
            y,
            wClip + 0.6,
            hClip + 0.6
          );
        }

        const depthH = Math.max(0, room.pixelH - gy - 26);
        if (depthH > 0) {
          const subG = bctx.createLinearGradient(0, gy + 26, 0, room.pixelH);
          subG.addColorStop(0, 'rgba(4, 7, 14, 0.1)');
          subG.addColorStop(1, 'rgba(3, 5, 11, 0.72)');
          bctx.fillStyle = subG;
          bctx.fillRect(wx, gy + 26, wClip + 0.6, depthH);
        }
      }
    }

    // 1B. 表层地面（纯手绘贴图连续切片，斜坡长阶自动加密为 16px 手绘石阶叠砌，零几何色块！）
    const stepW = 16;
    for (let x = 0; x < room.pixelW; x += stepW) {
      if (isInsideDownShaft(room, x + 2) || isInsideDownShaft(room, x + stepW - 2)) continue;
      if (wz && x >= wz.x1 + 14 && x <= wz.x2 - stepW - 14) continue;

      const gy = sampleSolidGroundY(room, x + stepW * 0.5);
      const sx = ((x % sw) + sw) % sw;
      const grabW = Math.min(stepW, sw - sx);
      bctx.drawImage(
        floorImg,
        sx,
        srcTopY,
        Math.max(4, grabW),
        srcCapH,
        x,
        gy - surfaceTopOffset,
        stepW + 0.7,
        srcCapH
      );
    }

    // 1C. 渲染《恶魔城：月下夜想曲》式实心石砌高低台与壁挂石阶 (`room.solidBlocks`)
    if (room.solidBlocks && room.solidBlocks.length > 0) {
      for (const sb of room.solidBlocks) {
        const topDrawY = sb.y - surfaceTopOffset;
        const totalDrawH = sb.h + surfaceTopOffset;

        // 石台底面柔和遮蔽投影
        const dropG = bctx.createLinearGradient(0, sb.y + sb.h, 0, sb.y + sb.h + 18);
        dropG.addColorStop(0, 'rgba(3, 5, 11, 0.52)');
        dropG.addColorStop(1, 'rgba(3, 5, 11, 0)');
        bctx.fillStyle = dropG;
        bctx.fillRect(sb.x + 2, sb.y + sb.h, Math.max(0, sb.w - 4), 18);

        bctx.save();
        bctx.beginPath();
        bctx.rect(sb.x, topDrawY, sb.w, totalDrawH);
        bctx.clip();

        bctx.fillStyle = '#090e1a';
        bctx.fillRect(sb.x, topDrawY, sb.w, totalDrawH);

        // 下部砌体纹理（用于厚实高台 h > 44）
        if (totalDrawH > srcCapH - 4) {
          for (let y = topDrawY + srcCapH - 8; y < topDrawY + totalDrawH; y += subSrcH - 3) {
            for (let x = sb.x; x < sb.x + sb.w; x += sw) {
              const wClip = Math.min(sw, sb.x + sb.w - x);
              bctx.drawImage(floorImg, 0, subSrcY, wClip, subSrcH, x, y, wClip + 0.5, subSrcH);
            }
          }
        }

        // 顶面完整原画青石板 / 墨玉压顶石
        for (let x = sb.x; x < sb.x + sb.w; x += sw) {
          const wClip = Math.min(sw, sb.x + sb.w - x);
          bctx.drawImage(floorImg, 0, srcTopY, wClip, srcCapH, x, topDrawY, wClip + 0.5, srcCapH);
        }
        bctx.restore();

        // 侧立面与底沿深色石缝收边
        bctx.strokeStyle = '#070b14';
        bctx.lineWidth = 1.6;
        bctx.strokeRect(sb.x + 0.5, sb.y, sb.w - 1, sb.h);
      }
    }
  }

  // 2. 护城河段：绘制完整三孔雕栏石拱桥 (`env_bridge.webp`)
  if (wz && bridgeImg) {
    const bridgeSpanW = wz.x2 - wz.x1 + 36;
    const bridgeH = bridgeSpanW * (bridgeImg.height / bridgeImg.width);
    const endRoadY = sampleSolidGroundY(room, wz.x1);
    const drawTopY = endRoadY - bridgeH * 0.61;
    bctx.drawImage(bridgeImg, wz.x1 - 18, drawTopY, bridgeSpanW, bridgeH);
  }

  // 3. 顶棚石拱与宫殿暗顶（仅使用纯净暗色青石砖，彻底摒弃带亮金条纹的 prop_stone_wall_tex！）
  for (const cs of room.ceilingSpans) {
    const cw = cs.x2 - cs.x1;
    bctx.fillStyle = '#070b14';
    bctx.fillRect(cs.x1, 0, cw, cs.bottomY);

    if (slabImg) {
      const sw = slabImg.width;
      const masonryY = Math.floor(slabImg.height * 0.42);
      const masonryH = Math.max(24, slabImg.height - masonryY - 2);
      for (let y = cs.bottomY - masonryH; y > -masonryH; y -= masonryH - 3) {
        for (let x = cs.x1; x < cs.x2; x += sw) {
          const wClip = Math.min(sw, cs.x2 - x);
          bctx.drawImage(slabImg, 0, masonryY, wClip, masonryH, x, y, wClip, masonryH);
        }
      }
    }

    const cg = bctx.createLinearGradient(0, 0, 0, cs.bottomY);
    cg.addColorStop(0, 'rgba(4, 6, 12, 0.88)');
    cg.addColorStop(0.75, 'rgba(6, 9, 17, 0.62)');
    cg.addColorStop(1, 'rgba(12, 17, 28, 0.85)');
    bctx.fillStyle = cg;
    bctx.fillRect(cs.x1, 0, cw, cs.bottomY);
  }

  // 4. 左右边界厚石山墙与柔和穿堂灯晕（零程序化红黄方框！）
  const bakeSideWallAndDoors = (side: 'left' | 'right') => {
    const doors = getRoomSideDoors(room, side).sort((a, b) => a.floorY - b.floorY);
    const wallW = 28;
    const wx = side === 'left' ? 0 : room.pixelW - wallW;
    const groundAtSide = sampleSolidGroundY(room, side === 'left' ? 12 : room.pixelW - 12);

    const drawSolidWallSegment = (y1: number, y2: number) => {
      if (y2 - y1 <= 6) return;
      bctx.fillStyle = '#070b14';
      bctx.fillRect(wx, y1, wallW, y2 - y1);
      if (slabImg) {
        const mY = Math.floor(slabImg.height * 0.42);
        const mH = Math.max(24, slabImg.height - mY - 2);
        for (let y = y1; y < y2; y += mH - 3) {
          const hClip = Math.min(mH, y2 - y);
          bctx.drawImage(slabImg, 12, mY, wallW, hClip, wx, y, wallW, hClip);
        }
      }
      bctx.fillStyle = 'rgba(4, 7, 14, 0.48)';
      bctx.fillRect(wx, y1, wallW, y2 - y1);
    };

    if (doors.length === 0) {
      if (room.indoor || room.gridH > 1) {
        drawSolidWallSegment(0, groundAtSide);
      }
      return;
    }

    let cursorY = 0;
    for (const d of doors) {
      const doorTop = d.floorY - 128;
      if (room.indoor || room.gridH > 1) {
        drawSolidWallSegment(cursorY, doorTop);
      }

      const dg = bctx.createLinearGradient(
        side === 'left' ? 0 : room.pixelW,
        0,
        side === 'left' ? 68 : room.pixelW - 68,
        0
      );
      dg.addColorStop(0, 'rgba(251, 191, 36, 0.22)');
      dg.addColorStop(1, 'rgba(0, 0, 0, 0)');
      bctx.fillStyle = dg;
      bctx.fillRect(side === 'left' ? 0 : room.pixelW - 68, doorTop, 68, 128);

      cursorY = d.floorY + 6;
    }
    if (room.gridH > 1 && cursorY < groundAtSide) {
      drawSolidWallSegment(cursorY, groundAtSide);
    }
  };
  bakeSideWallAndDoors('left');
  bakeSideWallAndDoors('right');

  // 5. 蹬墙古武石壁井道（使用纯净青石砖竖筑！）
  if (room.climbWalls && slabImg) {
    const mY = Math.floor(slabImg.height * 0.42);
    const mH = Math.max(24, slabImg.height - mY - 2);
    for (const cw of room.climbWalls) {
      const wallW = 38;
      const wx = cw.x - wallW * 0.5;
      bctx.fillStyle = '#090e1a';
      bctx.fillRect(wx, cw.topY, wallW, cw.bottomY - cw.topY);
      for (let y = cw.topY; y < cw.bottomY; y += mH - 3) {
        const hClip = Math.min(mH, cw.bottomY - y);
        bctx.drawImage(slabImg, 24, mY, wallW, hClip, wx, y, wallW, hClip);
      }
    }
  }
}

/**
 * 计算钟塔旋转青铜齿轮附带的实时动态升降踏板
 */
export function getClockGearOrbitPlatforms(
  room: BuiltRoom,
  t: number
): { x: number; y: number; w: number; vx: number; vy: number }[] {
  if (!room.clockGears) return [];
  const list: { x: number; y: number; w: number; vx: number; vy: number }[] = [];
  for (const g of room.clockGears) {
    if (!g.hasOrbitPlatforms) continue;
    const orbitR = g.radius * 0.86;
    const pw = 88;
    for (let i = 0; i < 3; i++) {
      const ang = t * g.speed + (i * Math.PI * 2) / 3;
      const cx = g.x + Math.cos(ang) * orbitR;
      const cy = g.y + Math.sin(ang) * orbitR;
      const vx = -Math.sin(ang) * orbitR * g.speed;
      const vy = Math.cos(ang) * orbitR * g.speed;
      list.push({ x: cx - pw * 0.5, y: cy, w: pw, vx, vy });
    }
  }
  return list;
}

/**
 * 绘制全十类手绘中景陈设（盘龙烈焰火盆、朱雀锦绣垂帷、擎天盘龙柱、仙鹤香炉、洪武巨钟、镇殿石猊、兵戈武架、藏书巨架、透月高窗、百烛吊灯）与旋转机关齿轮！
 */
export function drawCastleInteriorPropsAndGears(
  ctx: CanvasRenderingContext2D,
  room: BuiltRoom,
  t: number
): void {
  if (room.decorProps) {
    const shelfImg = Assets.get('prop_bookshelf');
    const winImg = Assets.get('prop_lattice_window');
    const chanImg = Assets.get('prop_chandelier');
    const brazierImg = Assets.get('prop_dragon_brazier');
    const bannerImg = Assets.get('prop_silk_banner');
    const rackImg = Assets.get('prop_weapon_rack');
    const statueImg = Assets.get('prop_guardian_statue');
    const pillarImg = Assets.get('prop_coiled_pillar');
    const burnerImg = Assets.get('prop_incense_burner');
    const bellImg = Assets.get('prop_giant_bell');

    for (const dp of room.decorProps) {
      const sc = dp.scale ?? 1;

      if (dp.kind === 'coiled_pillar' && pillarImg) {
        const h = 340 * sc;
        const w = pillarImg.width * (h / pillarImg.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
        ctx.beginPath();
        ctx.ellipse(dp.x, dp.y + 3, w * 0.44, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(pillarImg, dp.x - w * 0.5, dp.y - h + 6, w, h);
      } else if (dp.kind === 'silk_banner' && bannerImg) {
        const sway = Math.sin(t * 1.9 + dp.x * 0.015) * 0.025;
        const h = 215 * sc;
        const w = bannerImg.width * (h / bannerImg.height);
        ctx.save();
        ctx.translate(dp.x, dp.y - h);
        ctx.rotate(sway);
        ctx.drawImage(bannerImg, -w * 0.5, 0, w, h);
        ctx.restore();
      } else if (dp.kind === 'lattice_window' && winImg) {
        const h = 235 * sc;
        const w = winImg.width * (h / winImg.height);
        ctx.drawImage(winImg, dp.x - w * 0.5, dp.y - h, w, h);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const beamG = ctx.createLinearGradient(dp.x, dp.y - h * 0.8, dp.x + 135, dp.y + 120);
        beamG.addColorStop(0, 'rgba(125, 211, 252, 0.22)');
        beamG.addColorStop(0.55, 'rgba(186, 230, 253, 0.09)');
        beamG.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = beamG;
        ctx.beginPath();
        ctx.moveTo(dp.x - w * 0.36, dp.y - h * 0.72);
        ctx.lineTo(dp.x + w * 0.36, dp.y - h * 0.72);
        ctx.lineTo(dp.x + w * 0.36 + 150, dp.y + 115);
        ctx.lineTo(dp.x - w * 0.36 + 95, dp.y + 115);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (dp.kind === 'bookshelf' && shelfImg) {
        const h = 248 * sc;
        const w = shelfImg.width * (h / shelfImg.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.56)';
        ctx.beginPath();
        ctx.ellipse(dp.x, dp.y + 2, w * 0.5, 6.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(shelfImg, dp.x - w * 0.5, dp.y - h + 4, w, h);
      } else if (dp.kind === 'giant_bell' && bellImg) {
        const sway = Math.sin(t * 1.1 + dp.x * 0.01) * 0.022;
        const h = 210 * sc;
        const w = bellImg.width * (h / bellImg.height);
        ctx.save();
        ctx.translate(dp.x, dp.y - h);
        ctx.rotate(sway);
        ctx.drawImage(bellImg, -w * 0.5, 0, w, h);
        ctx.restore();
      } else if (dp.kind === 'guardian_statue' && statueImg) {
        const h = 152 * sc;
        const w = statueImg.width * (h / statueImg.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.ellipse(dp.x, dp.y + 2, w * 0.44, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(statueImg, dp.x - w * 0.5, dp.y - h + 4, w, h);
      } else if (dp.kind === 'weapon_rack' && rackImg) {
        const h = 144 * sc;
        const w = rackImg.width * (h / rackImg.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
        ctx.beginPath();
        ctx.ellipse(dp.x, dp.y + 2, w * 0.46, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(rackImg, dp.x - w * 0.5, dp.y - h + 4, w, h);
      } else if (dp.kind === 'incense_burner' && burnerImg) {
        const h = 148 * sc;
        const w = burnerImg.width * (h / burnerImg.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.54)';
        ctx.beginPath();
        ctx.ellipse(dp.x, dp.y + 2, w * 0.44, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(burnerImg, dp.x - w * 0.5, dp.y - h + 4, w, h);

        // 仙鹤炉膛暖金火光 + 袅袅升腾的瑞脑金烟
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const ig = ctx.createRadialGradient(dp.x, dp.y - h * 0.52, 4, dp.x, dp.y - h * 0.52, 105);
        ig.addColorStop(0, 'rgba(251, 191, 36, 0.28)');
        ig.addColorStop(0.55, 'rgba(245, 158, 11, 0.09)');
        ig.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = ig;
        ctx.beginPath();
        ctx.arc(dp.x, dp.y - h * 0.52, 105, 0, Math.PI * 2);
        ctx.fill();

        for (let k = 0; k < 3; k++) {
          const rise = ((t * 22 + k * 28) % 84);
          const sx = dp.x + Math.sin(t * 2.2 + k * 1.7 + rise * 0.05) * (6 + rise * 0.12);
          const sy = dp.y - h * 0.72 - rise;
          const a = (1 - rise / 84) * 0.22;
          ctx.fillStyle = `rgba(253, 230, 138, ${a})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 4 + rise * 0.08, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (dp.kind === 'dragon_brazier' && brazierImg) {
        const h = 128 * sc;
        const w = brazierImg.width * (h / brazierImg.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.beginPath();
        ctx.ellipse(dp.x, dp.y + 2, w * 0.45, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(brazierImg, dp.x - w * 0.5, dp.y - h + 4, w, h);

        // 熊熊跃动的赤金火盆暖光池（彻底驱散冰冷感！）
        const flick = Math.sin(t * 11 + dp.x * 0.1) * 8;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const fg = ctx.createRadialGradient(
          dp.x,
          dp.y - h * 0.68,
          6,
          dp.x,
          dp.y - h * 0.55,
          158 + flick
        );
        fg.addColorStop(0, 'rgba(254, 240, 138, 0.38)');
        fg.addColorStop(0.42, 'rgba(249, 115, 22, 0.19)');
        fg.addColorStop(0.75, 'rgba(220, 38, 38, 0.07)');
        fg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.arc(dp.x, dp.y - h * 0.55, 164, 0, Math.PI * 2);
        ctx.fill();

        // 升腾的赤金火星微粒
        for (let sp = 0; sp < 3; sp++) {
          const prog = ((t * 36 + sp * 24 + dp.x) % 72) / 72;
          const sx = dp.x + Math.sin(t * 4 + sp * 2.1) * 14 * prog;
          const sy = dp.y - h * 0.78 - prog * 68;
          ctx.fillStyle = `rgba(253, 224, 71, ${(1 - prog) * 0.75})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.8 * (1 - prog * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (dp.kind === 'chandelier' && chanImg) {
        const sway = Math.sin(t * 1.6 + dp.x * 0.02) * 0.035;
        const h = 186 * sc;
        const w = chanImg.width * (h / chanImg.height);
        ctx.save();
        ctx.translate(dp.x, dp.y);
        ctx.rotate(sway);
        ctx.drawImage(chanImg, -w * 0.5, 0, w, h);

        ctx.globalCompositeOperation = 'lighter';
        const cg = ctx.createRadialGradient(0, h * 0.72, 4, 0, h * 0.72, 135);
        cg.addColorStop(0, 'rgba(251, 191, 36, 0.32)');
        cg.addColorStop(0.55, 'rgba(245, 158, 11, 0.11)');
        cg.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(0, h * 0.72, 135, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  // 旋转青铜八卦巨齿轮与升降踏台
  if (room.clockGears) {
    const gearImg = Assets.get('prop_clock_gear');
    const ledgeImg = Assets.get('env_indoor_ledge') || Assets.get('env_pavilion');
    if (gearImg) {
      for (const g of room.clockGears) {
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(t * g.speed);
        ctx.globalAlpha = g.hasOrbitPlatforms ? 0.94 : 0.74;
        ctx.drawImage(gearImg, -g.radius, -g.radius, g.radius * 2, g.radius * 2);
        ctx.restore();
      }
    }
    if (ledgeImg) {
      const orbitPlats = getClockGearOrbitPlatforms(room, t);
      const sy = Math.floor(ledgeImg.height * 0.36);
      const sh = Math.floor(ledgeImg.height * 0.28);
      for (const op of orbitPlats) {
        ctx.drawImage(ledgeImg, 12, sy, ledgeImg.width - 24, sh, op.x, op.y - 3, op.w, 20);
      }
    }
  }
}

/**
 * 绘制平台：100% 纯手绘雕栏红木阁楼 `env_indoor_ledge` / 飞檐朱漆阁台 `env_pavilion`（零程序化红柱穿模！）
 */
export function drawOrthographicPavilion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  hasPillars: boolean,
  room: BuiltRoom
): void {
  const pvImg = Assets.get('env_pavilion');
  const indoorImg = Assets.get('env_indoor_ledge');
  const groundHere = sampleSolidGroundY(room, x + w * 0.5);

  // 竖井井口平齐木栈踏板（严丝合缝嵌平井沿）
  if (!hasPillars && Math.abs(y - groundHere) < 18) {
    const src = indoorImg || pvImg;
    if (src) {
      const sy = Math.floor(src.height * 0.38);
      const sh = Math.floor(src.height * 0.14);
      ctx.drawImage(src, 18, sy, src.width - 36, sh, x, y - 1, w, 12);
    }
    return;
  }

  if (room.indoor && !hasPillars && indoorImg) {
    const maxSpan = 300;
    if (w > maxSpan) {
      const chunks = Math.ceil(w / 260);
      const cw = w / chunks;
      for (let i = 0; i < chunks; i++) {
        const cx = x + i * cw;
        const drawW = cw + 8;
        const drawH = Math.min(96, Math.max(64, drawW * (indoorImg.height / indoorImg.width)));
        ctx.drawImage(indoorImg, cx - 4, y - drawH * 0.38, drawW, drawH);
      }
      return;
    }
    const drawW = w + 10;
    const drawH = Math.min(104, Math.max(64, drawW * (indoorImg.height / indoorImg.width)));
    ctx.drawImage(indoorImg, x - 5, y - drawH * 0.38, drawW, drawH);
    return;
  }

  if (!pvImg) return;
  const drawW = w + 16;
  const drawH = Math.min(134, Math.max(92, drawW * (pvImg.height / pvImg.width)));
  ctx.drawImage(pvImg, x - 8, y - drawH * 0.42, drawW, drawH);
}

export function drawOrthographicStoneArchway(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  _title: string | undefined,
  _t: number
): void {
  const archImg = Assets.get('prop_stone_arch');
  if (!archImg) return;
  const h = 248;
  const w = archImg.width * (h / archImg.height);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.56)';
  ctx.beginPath();
  ctx.ellipse(cx, groundY + 2, w * 0.46, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.drawImage(archImg, cx - w * 0.5, groundY - h + 6, w, h);
}

export function drawOrthographicSaveShrine(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  _t: number
): void {
  const halo = ctx.createRadialGradient(cx, groundY - 68, 10, cx, groundY - 68, 175);
  halo.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
  halo.addColorStop(0.55, 'rgba(217, 119, 6, 0.14)');
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, groundY - 68, 175, 0, Math.PI * 2);
  ctx.fill();

  const shrineImg = Assets.get('prop_shrine');
  if (!shrineImg) return;
  const sh = 168;
  const sw = shrineImg.width * (sh / shrineImg.height);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.62)';
  ctx.beginPath();
  ctx.ellipse(cx, groundY + 3, sw * 0.5, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.drawImage(shrineImg, cx - sw * 0.5, groundY - sh + 5, sw, sh);
}

export function drawHangingSilkLantern(
  ctx: CanvasRenderingContext2D,
  x: number,
  topAnchorY: number,
  t: number,
  scale = 1
): void {
  const lanternImg = Assets.get('prop_lantern');
  if (!lanternImg) return;

  const sway = Math.sin(t * 2.4 + x * 0.03) * 0.06;
  ctx.save();
  ctx.translate(x, topAnchorY);
  ctx.rotate(sway);

  const lh = 52 * scale;
  const lw = lanternImg.width * (lh / lanternImg.height);
  ctx.drawImage(lanternImg, -lw * 0.5, 0, lw, lh);
  ctx.restore();
}

export function drawOrthographicLanternPost(
  ctx: CanvasRenderingContext2D,
  x: number,
  lampY: number,
  _groundY: number,
  t: number
): void {
  const flick = Math.sin(t * 9 + x) * 4;
  const g = ctx.createRadialGradient(x, lampY + 18, 3, x, lampY + 18, 122 + flick);
  g.addColorStop(0, 'rgba(251, 146, 60, 0.36)');
  g.addColorStop(0.55, 'rgba(220, 38, 38, 0.12)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, lampY + 18, 126, 0, Math.PI * 2);
  ctx.fill();

  drawHangingSilkLantern(ctx, x, lampY - 8, t, 0.94);
}
