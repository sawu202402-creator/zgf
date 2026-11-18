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
  _weaponId = 'sword_1',
  lengthPx = 88
): void {
  let key: AssetKey = 'part_wpn_sword';
  if (archetype === 'greatsword') key = 'part_wpn_modao';
  else if (archetype === 'spear') key = 'part_wpn_spear';
  else if (archetype === 'daggers') key = 'part_wpn_daggers';
  else if (archetype === 'whip') key = 'part_wpn_whip';

  const img = Assets.get(key);
  if (!img) return;
  if (archetype === 'daggers' || archetype === 'whip') {
    const dim = lengthPx * 0.56;
    const w = dim * (img.width / img.height);
    ctx.drawImage(img, -w * 0.5, -dim * 0.5, w, dim);
    return;
  }
  const w = archetype === 'spear' ? lengthPx * 1.18 : lengthPx;
  const h = w * (img.height / img.width);
  ctx.drawImage(img, -w * 0.24, -h * 0.5, w, h);
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
 * 局内远景：支持八大主题 16:9 手绘大画卷 + 横纵双向平滑视差（Single-Canvas Smooth Pan）+ 区域专属冷暖色调氛围光！
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
    const drawW = Math.max(vW * 1.28, vH * 1.24 * aspect);
    const drawH = drawW / aspect;

    const maxScrollX = Math.max(1, room.pixelW - vW);
    const maxScrollY = Math.max(1, room.pixelH - vH);
    const ux = Math.max(0, Math.min(1, camLeft / maxScrollX));
    const uy = Math.max(0, Math.min(1, camTop / maxScrollY));
    const px = -ux * (drawW - vW);
    const py = -uy * (drawH - vH);

    if (room.realm === 'inverted') {
      ctx.save();
      ctx.translate(0, vH);
      ctx.scale(1, -1);
      ctx.drawImage(bg, px, py, drawW, drawH);
      ctx.restore();

      const invGrad = ctx.createLinearGradient(0, 0, 0, vH);
      invGrad.addColorStop(0, 'rgba(110, 18, 44, 0.32)');
      invGrad.addColorStop(0.55, 'rgba(42, 12, 52, 0.24)');
      invGrad.addColorStop(1, 'rgba(8, 6, 16, 0.56)');
      ctx.fillStyle = invGrad;
      ctx.fillRect(0, 0, vW, vH);
    } else {
      ctx.drawImage(bg, px, py, drawW, drawH);

      // 按城域定制通透温润的景深色调层（彻底摒弃死黑冰冷遮罩，保留远景灯海/熔炉/彩窗温度！）
      const depthGrad = ctx.createLinearGradient(0, 0, 0, vH);
      if (room.region === 'opera' || room.region === 'forge') {
        depthGrad.addColorStop(0, 'rgba(24, 8, 6, 0.08)');
        depthGrad.addColorStop(0.65, 'rgba(28, 10, 8, 0.16)');
        depthGrad.addColorStop(1, 'rgba(16, 6, 6, 0.44)');
      } else if (room.region === 'main_hall' || room.region === 'library' || room.region === 'clock_tower') {
        depthGrad.addColorStop(0, 'rgba(10, 10, 18, 0.08)');
        depthGrad.addColorStop(0.68, 'rgba(14, 12, 20, 0.16)');
        depthGrad.addColorStop(1, 'rgba(8, 8, 15, 0.46)');
      } else {
        depthGrad.addColorStop(0, 'rgba(5, 10, 18, 0.08)');
        depthGrad.addColorStop(0.68, 'rgba(6, 12, 22, 0.18)');
        depthGrad.addColorStop(1, 'rgba(5, 8, 16, 0.48)');
      }
      ctx.fillStyle = depthGrad;
      ctx.fillRect(0, 0, vW, vH);
    }
  } else {
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, vW, vH);
  }
}

/**
 * 烘焙厚重立体城垣地基、高台须弥石座 (`prop_stone_wall_tex`)、三孔石拱桥与多层竖塔侧壁门洞！
 */
export function bakeOrthographicRoomTerrain(bctx: CanvasRenderingContext2D, room: BuiltRoom): void {
  bctx.clearRect(0, 0, room.pixelW, room.pixelH);

  const usePalaceMarble = Boolean(
    room.indoor && room.region !== 'prison' && room.region !== 'forge'
  );
  const floorImg =
    (usePalaceMarble ? Assets.get('env_palace_floor') : undefined) || Assets.get('env_ground_slab');
  const slabImg = Assets.get('env_ground_slab');
  const wallTex = Assets.get('prop_stone_wall_tex');
  const bridgeImg = Assets.get('env_bridge');

  const isArchBridgeRoom =
    room.waterZones.length > 0 &&
    room.waterZones[0].liquidKind !== 'lava' &&
    room.groundNodes.some((n) => n.style === 'arch_bridge');
  const wz = isArchBridgeRoom ? room.waterZones[0] : null;

  // 1. 地面以下厚重城砖须弥座地基（彻底告别单薄黑块！高台/长阶下方全部呈现真实手绘青砖砌体！）
  if (floorImg) {
    const sw = floorImg.width;
    const sh = floorImg.height;
    const surfaceTopOffset = usePalaceMarble ? 20 : 6;

    // 先铺设手绘须弥青砖地基 (`prop_stone_wall_tex` 中段砖墙纹理)
    if (wallTex) {
      const brickSrcX = Math.floor(wallTex.width * 0.08);
      const brickSrcY = Math.floor(wallTex.height * 0.24);
      const brickSrcW = Math.floor(wallTex.width * 0.84);
      const brickSrcH = Math.floor(wallTex.height * 0.5);

      for (let x = 0; x < room.pixelW; x += brickSrcW) {
        if (isInsideDownShaft(room, x + 20) && isInsideDownShaft(room, x + brickSrcW - 20)) continue;
        if (wz && x >= wz.x1 + 32 && x + brickSrcW <= wz.x2 - 32) continue;
        const gy = sampleSolidGroundY(room, Math.min(room.pixelW, x + brickSrcW * 0.5));
        const startY = gy + sh - surfaceTopOffset - 10;
        const wClip = Math.min(brickSrcW, room.pixelW - x);
        for (let y = startY; y < room.pixelH; y += brickSrcH - 4) {
          const hClip = Math.min(brickSrcH, room.pixelH - y);
          if (hClip <= 0) break;
          bctx.drawImage(
            wallTex,
            brickSrcX,
            brickSrcY,
            wClip,
            hClip,
            x,
            y,
            wClip + 0.5,
            hClip + 0.5
          );
        }
      }
      // 为地下深层砖基压一层柔和深色渐变，突出地表主路边缘立体感
      const subG = bctx.createLinearGradient(0, room.pixelH - 150, 0, room.pixelH);
      subG.addColorStop(0, 'rgba(5, 8, 15, 0.18)');
      subG.addColorStop(1, 'rgba(4, 6, 12, 0.65)');
      bctx.fillStyle = subG;
      for (let x = 0; x < room.pixelW; x += 24) {
        if (isInsideDownShaft(room, x + 12)) continue;
        if (wz && x >= wz.x1 + 24 && x <= wz.x2 - 24) continue;
        const gy = sampleSolidGroundY(room, x + 12);
        bctx.fillRect(x, gy + 36, 25, Math.max(0, room.pixelH - gy - 36));
      }
    } else {
      bctx.fillStyle = '#090e19';
      for (let x = 0; x < room.pixelW; x += 8) {
        if (isInsideDownShaft(room, x + 4)) continue;
        if (wz && x >= wz.x1 + 24 && x <= wz.x2 - 24) continue;
        const gy = sampleSolidGroundY(room, x);
        bctx.fillRect(x, gy + 16, 9, room.pixelH - gy);
      }
    }

    // 绘制表层殿宇金龙墨玉地砖或露天青石板
    const sliceW = 24;
    for (let x = 0; x < room.pixelW; x += sliceW) {
      if (isInsideDownShaft(room, x + 4) || isInsideDownShaft(room, x + sliceW - 4)) continue;
      if (wz && x >= wz.x1 + 12 && x <= wz.x2 - sliceW - 12) continue;

      const gy = sampleSolidGroundY(room, x + sliceW * 0.5);
      const sx = ((x % sw) + sw) % sw;
      const grabW = Math.min(sliceW, sw - sx);
      bctx.drawImage(floorImg, sx, 0, grabW, sh, x, gy - surfaceTopOffset, sliceW + 0.6, sh);
    }
  }

  // 2. 护城河段绘制完整三孔雕栏石拱桥 (`env_bridge.webp`)
  if (wz && bridgeImg) {
    const bridgeSpanW = wz.x2 - wz.x1 + 36;
    const bridgeH = bridgeSpanW * (bridgeImg.height / bridgeImg.width);
    const endRoadY = sampleSolidGroundY(room, wz.x1);
    const drawTopY = endRoadY - bridgeH * 0.61;
    bctx.drawImage(bridgeImg, wz.x1 - 18, drawTopY, bridgeSpanW, bridgeH);
  }

  // 3. 城门石券洞、宫殿藻井顶棚与地下暗渠石拱顶
  for (const cs of room.ceilingSpans) {
    const cw = cs.x2 - cs.x1;
    bctx.fillStyle = '#0b101b';
    bctx.fillRect(cs.x1, 0, cw, cs.bottomY);

    if (wallTex) {
      const bx = Math.floor(wallTex.width * 0.08);
      const by = Math.floor(wallTex.height * 0.18);
      const bw = Math.floor(wallTex.width * 0.84);
      const bh = Math.floor(wallTex.height * 0.65);
      for (let y = cs.bottomY - bh; y > -bh; y -= bh - 6) {
        for (let x = cs.x1; x < cs.x2; x += bw) {
          const wClip = Math.min(bw, cs.x2 - x);
          bctx.drawImage(wallTex, bx, by, wClip, bh, x, y, wClip, bh);
        }
      }
    } else if (slabImg) {
      const sw = slabImg.width;
      const masonryY = Math.floor(slabImg.height * 0.28);
      const masonryH = slabImg.height - masonryY;
      for (let y = cs.bottomY - masonryH; y > -masonryH; y -= masonryH - 4) {
        for (let x = cs.x1; x < cs.x2; x += sw) {
          const wClip = Math.min(sw, cs.x2 - x);
          bctx.drawImage(slabImg, 0, masonryY, wClip, masonryH, x, y, wClip, masonryH);
        }
      }
    }

    const cg = bctx.createLinearGradient(0, 0, 0, cs.bottomY);
    cg.addColorStop(0, 'rgba(4, 6, 12, 0.72)');
    cg.addColorStop(0.82, 'rgba(8, 11, 20, 0.25)');
    cg.addColorStop(1, 'rgba(180, 134, 56, 0.35)');
    bctx.fillStyle = cg;
    bctx.fillRect(cs.x1, 0, cw, cs.bottomY);
  }

  // 4. 左右厚重山墙与多层竖塔分标高门洞（非门洞区砌满手绘青砖城垣，门洞处透出暖金接引灯辉！）
  const bakeSideWallAndDoors = (side: 'left' | 'right') => {
    const doors = getRoomSideDoors(room, side).sort((a, b) => a.floorY - b.floorY);
    const wallW = 34;
    const wx = side === 'left' ? 0 : room.pixelW - wallW;
    const groundAtSide = sampleSolidGroundY(room, side === 'left' ? 12 : room.pixelW - 12);

    const drawSolidWallSegment = (y1: number, y2: number) => {
      if (y2 - y1 <= 4) return;
      if (wallTex) {
        const bx = Math.floor(wallTex.width * 0.1);
        const by = Math.floor(wallTex.height * 0.22);
        const bh = Math.floor(wallTex.height * 0.54);
        for (let y = y1; y < y2; y += bh - 4) {
          const hClip = Math.min(bh, y2 - y);
          bctx.drawImage(wallTex, bx, by, wallW, hClip, wx, y, wallW, hClip);
        }
      } else if (slabImg) {
        bctx.drawImage(slabImg, 0, 34, 36, 84, wx, y1, wallW, y2 - y1);
      }
    };

    if (doors.length === 0) {
      // 封闭端头山墙（室内或竖塔封闭侧砌筑厚实边墙）
      if (room.indoor || room.gridH > 1) {
        drawSolidWallSegment(0, groundAtSide);
      }
      return;
    }

    let cursorY = 0;
    for (const d of doors) {
      const doorTop = d.floorY - 126;
      drawSolidWallSegment(cursorY, doorTop);

      // 门洞暖金灯火导引光晕
      const dg = bctx.createLinearGradient(
        side === 'left' ? 0 : room.pixelW,
        0,
        side === 'left' ? 76 : room.pixelW - 76,
        0
      );
      dg.addColorStop(0, 'rgba(251, 191, 36, 0.34)');
      dg.addColorStop(0.55, 'rgba(249, 115, 22, 0.12)');
      dg.addColorStop(1, 'rgba(0, 0, 0, 0)');
      bctx.fillStyle = dg;
      bctx.fillRect(side === 'left' ? 0 : room.pixelW - 76, doorTop, 76, 128);

      cursorY = d.floorY + 8;
    }
    if (room.gridH > 1 && cursorY < groundAtSide) {
      drawSolidWallSegment(cursorY, groundAtSide);
    }
  };
  bakeSideWallAndDoors('left');
  bakeSideWallAndDoors('right');

  // 5. 蹬墙古武石壁井道（使用须弥青砖 `prop_stone_wall_tex` 竖筑厚重古武石柱！）
  if (room.climbWalls && (wallTex || slabImg)) {
    for (const cw of room.climbWalls) {
      const wallW = 40;
      const wx = cw.x - wallW * 0.5;
      bctx.fillStyle = '#0b101c';
      bctx.fillRect(wx, cw.topY, wallW, cw.bottomY - cw.topY);
      if (wallTex) {
        const bx = Math.floor(wallTex.width * 0.12);
        const by = Math.floor(wallTex.height * 0.22);
        const bh = Math.floor(wallTex.height * 0.54);
        for (let y = cw.topY; y < cw.bottomY; y += bh - 4) {
          const hClip = Math.min(bh, cw.bottomY - y);
          bctx.drawImage(wallTex, bx, by, wallW * 2, hClip, wx, y, wallW, hClip);
        }
        bctx.drawImage(wallTex, 8, 4, wallTex.width - 16, 46, wx - 5, cw.topY - 4, wallW + 10, 22);
      } else if (slabImg) {
        const masonryY = Math.floor(slabImg.height * 0.28);
        const masonryH = slabImg.height - masonryY;
        for (let y = cw.topY; y < cw.bottomY; y += masonryH - 4) {
          const hClip = Math.min(masonryH, cw.bottomY - y);
          bctx.drawImage(slabImg, 24, masonryY, wallW, hClip, wx, y, wallW, hClip);
        }
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
 * 绘制平台：室内采用雕栏红木阁楼回廊 `env_indoor_ledge`，露天/戏街采用飞檐朱漆阁台 `env_pavilion`
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

  if (!hasPillars && Math.abs(y - groundHere) < 18) {
    const src = indoorImg || pvImg;
    if (src) {
      const sy = Math.floor(src.height * 0.37);
      const sh = Math.floor(src.height * 0.16);
      ctx.drawImage(src, 16, sy, src.width - 32, sh, x - 2, y - 3, w + 4, 15);
    }
    return;
  }

  if (room.indoor && !hasPillars && indoorImg) {
    // 宽走廊拆分为多跨绘制，避免超宽门廊平台(如680px)纵向拉伸过度
    const maxSpan = 300;
    if (w > maxSpan) {
      const chunks = Math.ceil(w / 260);
      const cw = w / chunks;
      for (let i = 0; i < chunks; i++) {
        const cx = x + i * cw;
        const drawW = cw + 8;
        const drawH = Math.min(98, Math.max(66, drawW * (indoorImg.height / indoorImg.width)));
        ctx.drawImage(indoorImg, cx - 4, y - drawH * 0.38, drawW, drawH);
      }
      return;
    }
    const drawW = w + 10;
    const drawH = Math.min(108, Math.max(66, drawW * (indoorImg.height / indoorImg.width)));
    ctx.drawImage(indoorImg, x - 5, y - drawH * 0.38, drawW, drawH);
    return;
  }

  if (!pvImg) return;

  if (hasPillars) {
    const botLeft = sampleSolidGroundY(room, x + w * 0.25);
    const botRight = sampleSolidGroundY(room, x + w * 0.75);
    const pillarSrcX = Math.floor(pvImg.width * 0.228);
    const pillarSrcY = Math.floor(pvImg.height * 0.72);
    const pillarSrcW = Math.floor(pvImg.width * 0.068);
    const pillarSrcH = Math.floor(pvImg.height * 0.25);

    const drawScaleX = w / pvImg.width;
    const pDrawW = Math.max(12, pillarSrcW * drawScaleX);
    const leftPx = x + pvImg.width * 0.228 * drawScaleX;
    const rightPx = x + pvImg.width * 0.708 * drawScaleX;

    if (botLeft > y + 48) {
      ctx.drawImage(
        pvImg,
        pillarSrcX,
        pillarSrcY,
        pillarSrcW,
        pillarSrcH,
        leftPx,
        y + 42,
        pDrawW,
        botLeft - y - 40
      );
    }
    if (botRight > y + 48) {
      ctx.drawImage(
        pvImg,
        pillarSrcX,
        pillarSrcY,
        pillarSrcW,
        pillarSrcH,
        rightPx,
        y + 42,
        pDrawW,
        botRight - y - 40
      );
    }
  }

  const drawW = w + 16;
  const drawH = Math.min(138, Math.max(96, drawW * (pvImg.height / pvImg.width)));
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
