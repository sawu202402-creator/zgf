import {
  BuiltRoom,
  isInsideDownShaft,
  sampleSolidGroundY,
} from '../data/worldMap';
import { WeaponArchetype } from '../types';
import { AssetKey, Assets } from './AssetLoader';

/**
 * 100% AI 手绘国风场景渲染引擎（0代码简笔画圆圈方块、0背景拼接断缝、0重影血月！）
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
 * 标题画面：全屏展示高精度 AI 手绘《血月九幽玄城》主视觉画卷 + 动态飘落火星灰烬！
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

  // 飘散的赤金余烬微粒
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 32; i++) {
    const px = ((i * 197 + t * (20 + (i % 5) * 7)) % (viewW + 40)) - 20;
    const py = viewH - (((i * 131 + t * (15 + (i % 4) * 6)) % (viewH + 30)) - 15);
    ctx.fillStyle = i % 3 === 0 ? 'rgba(253, 224, 71, 0.65)' : 'rgba(248, 113, 113, 0.5)';
    ctx.beginPath();
    ctx.arc(px, py, 1.4 + (i % 2.2), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * 局内远景：单幅超宽平滑视差横移（Single-Canvas Smooth Pan）
 * 整张 16:9 AI 手绘大画卷放大至 1.26 倍视口宽度随镜头缓慢平滑横移，
 * 100% 满屏手绘细节、绝对不循环切边、绝对零接缝、绝对不会出现两个月亮！
 */
export function drawSeamlessParallaxBackdrop(
  ctx: CanvasRenderingContext2D,
  vW: number,
  vH: number,
  camLeft: number,
  room: BuiltRoom,
  _t: number
): void {
  let bgKey: AssetKey = 'bg_gatehouse';
  if (room.region === 'main_hall') bgKey = 'bg_main_hall';
  else if (room.region === 'library' || room.region === 'clock_tower') bgKey = 'bg_library_opera';
  else if (room.region === 'prison' || room.region === 'altar') bgKey = 'bg_forge_prison';

  const bg = Assets.get(bgKey) || Assets.get('bg_gatehouse');
  if (bg) {
    const aspect = bg.width / bg.height;
    const drawW = Math.max(vW * 1.26, vH * 1.14 * aspect);
    const drawH = drawW / aspect;

    const maxScroll = Math.max(1, room.pixelW - vW);
    const u = Math.max(0, Math.min(1, camLeft / maxScroll));
    const px = -u * (drawW - vW);
    const py = -(drawH - vH) * 0.42;

    if (room.realm === 'inverted') {
      // 【九幽倒悬里城】：整幅 16:9 手绘亭台城阙上下180°倒悬于血月苍穹之上，致敬月下夜想曲逆城奇观！
      ctx.save();
      ctx.translate(0, vH);
      ctx.scale(1, -1);
      ctx.drawImage(bg, px, py, drawW, drawH);
      ctx.restore();

      const invGrad = ctx.createLinearGradient(0, 0, 0, vH);
      invGrad.addColorStop(0, 'rgba(88, 12, 36, 0.34)');
      invGrad.addColorStop(0.55, 'rgba(30, 10, 42, 0.28)');
      invGrad.addColorStop(1, 'rgba(5, 6, 14, 0.72)');
      ctx.fillStyle = invGrad;
      ctx.fillRect(0, 0, vW, vH);
    } else {
      ctx.drawImage(bg, px, py, drawW, drawH);

      // 柔和暗部景深融合层，使近景手绘青石古桥/人物与远景手绘城池层次分明！
      const depthGrad = ctx.createLinearGradient(0, 0, 0, vH);
      depthGrad.addColorStop(0, 'rgba(5, 8, 15, 0.14)');
      depthGrad.addColorStop(0.68, 'rgba(5, 8, 15, 0.24)');
      depthGrad.addColorStop(1, 'rgba(4, 6, 12, 0.68)');
      ctx.fillStyle = depthGrad;
      ctx.fillRect(0, 0, vW, vH);
    }
  } else {
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, vW, vH);
  }
}

/**
 * 使用正侧视 AI 手绘青石板古道条带 (`env_ground_slab`) 与三孔雕栏石拱桥 (`env_bridge`) 烘焙地形！
 */
export function bakeOrthographicRoomTerrain(bctx: CanvasRenderingContext2D, room: BuiltRoom): void {
  bctx.clearRect(0, 0, room.pixelW, room.pixelH);

  const usePalaceMarble = Boolean(room.indoor && room.region !== 'prison' && room.region !== 'forge');
  const floorImg =
    (usePalaceMarble ? Assets.get('env_palace_floor') : undefined) || Assets.get('env_ground_slab');
  const slabImg = Assets.get('env_ground_slab');
  const bridgeImg = Assets.get('env_bridge');

  const isArchBridgeRoom =
    room.waterZones.length > 0 && room.groundNodes.some((n) => n.style === 'arch_bridge');
  const wz = isArchBridgeRoom ? room.waterZones[0] : null;

  // 1. 绘制连续 AI 手绘殿宇墨玉地砖 (`env_palace_floor`) 或露天青石古道 (`env_ground_slab`)
  if (floorImg) {
    const sw = floorImg.width;
    const sh = floorImg.height;
    const surfaceTopOffset = usePalaceMarble ? 20 : 6;

    bctx.fillStyle = '#090e19';
    for (let x = 0; x < room.pixelW; x += 8) {
      if (isInsideDownShaft(room, x + 4)) continue;
      if (wz && x >= wz.x1 + 24 && x <= wz.x2 - 24) continue;
      const gy = sampleSolidGroundY(room, x);
      bctx.fillRect(x, gy + 16, 9, room.pixelH - gy);
    }

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

  // 2. 在护城河段完整绘制正侧视 AI 手绘三孔雕栏石拱桥 (`env_bridge.webp`)！
  if (wz && bridgeImg) {
    const bridgeSpanW = wz.x2 - wz.x1 + 36;
    const bridgeH = bridgeSpanW * (bridgeImg.height / bridgeImg.width);
    // env_bridge 两侧桥头路面精确位于贴图 61% 高度处，与两侧青石古道严丝合缝平齐！
    const endRoadY = sampleSolidGroundY(room, wz.x1);
    const drawTopY = endRoadY - bridgeH * 0.61;
    bctx.drawImage(bridgeImg, wz.x1 - 18, drawTopY, bridgeSpanW, bridgeH);
  }

  // 3. 城门石券洞、宫殿顶棚与地下暗渠顶棚（截取 `env_ground_slab` 下半部手绘青石条石砌体烘焙！）
  for (const cs of room.ceilingSpans) {
    const cw = cs.x2 - cs.x1;
    bctx.fillStyle = '#0b101b';
    bctx.fillRect(cs.x1, 0, cw, cs.bottomY);

    if (slabImg) {
      // 取手绘条石墙中下段砌体纹理平铺于顶棚与城门券洞，质感100%手绘统一！
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

    // 顶棚深邃水墨暗影过渡
    const cg = bctx.createLinearGradient(0, 0, 0, cs.bottomY);
    cg.addColorStop(0, 'rgba(4, 6, 12, 0.82)');
    cg.addColorStop(0.85, 'rgba(6, 9, 17, 0.35)');
    cg.addColorStop(1, 'rgba(4, 6, 12, 0.75)');
    bctx.fillStyle = cg;
    bctx.fillRect(cs.x1, 0, cw, cs.bottomY);
  }

  // 4. 左右连廊门楣与门洞暖光接引渐变
  const bakeSideThreshold = (side: 'left' | 'right') => {
    const hasDoor = side === 'left' ? Boolean(room.leftRoomId) : Boolean(room.rightRoomId);
    const doorFloorY =
      (side === 'left' ? room.leftDoorFloorY : room.rightDoorFloorY) ??
      sampleSolidGroundY(room, side === 'left' ? 10 : room.pixelW - 10);
    const wx = side === 'left' ? 0 : room.pixelW - 34;

    if (hasDoor) {
      const doorTopY = doorFloorY - 126;
      if (slabImg && doorTopY > 12) {
        bctx.drawImage(slabImg, 0, 34, 36, 84, wx, 0, 34, doorTopY);
      }
      const dg = bctx.createLinearGradient(
        side === 'left' ? 0 : room.pixelW,
        0,
        side === 'left' ? 64 : room.pixelW - 64,
        0
      );
      dg.addColorStop(0, 'rgba(251, 191, 36, 0.26)');
      dg.addColorStop(1, 'rgba(0, 0, 0, 0)');
      bctx.fillStyle = dg;
      bctx.fillRect(side === 'left' ? 0 : room.pixelW - 64, doorTopY, 64, 126);
    }
  };
  bakeSideThreshold('left');
  bakeSideThreshold('right');

  // 5. 蹬墙古武石壁井道（截取手绘青石砌体 `env_ground_slab` 竖筑而成，供【壁虎游墙功】连跳攀登！）
  if (room.climbWalls && slabImg) {
    const masonryY = Math.floor(slabImg.height * 0.28);
    const masonryH = slabImg.height - masonryY;
    for (const cw of room.climbWalls) {
      const wallW = 36;
      const wx = cw.x - wallW * 0.5;
      bctx.fillStyle = '#0b101c';
      bctx.fillRect(wx, cw.topY, wallW, cw.bottomY - cw.topY);
      for (let y = cw.topY; y < cw.bottomY; y += masonryH - 4) {
        const hClip = Math.min(masonryH, cw.bottomY - y);
        bctx.drawImage(slabImg, 24, masonryY, wallW, hClip, wx, y, wallW, hClip);
      }
      // 顶部石檐盖板
      bctx.drawImage(slabImg, 12, 0, wallW + 8, 22, wx - 4, cw.topY - 4, wallW + 8, 20);
    }
  }
}

/**
 * 计算钟塔旋转青铜齿轮附带的实时动态升降踏板（供渲染器与物理引擎严格同步！）
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
 * 绘制《月下夜想曲》级室内陈设：破窗斜射体积月光柱、万卷藏书巨架、青铜百烛吊灯与旋转钟塔巨齿轮！
 */
export function drawCastleInteriorPropsAndGears(
  ctx: CanvasRenderingContext2D,
  room: BuiltRoom,
  t: number
): void {
  // 1. 藏书巨架、雕花高窗（含斜射体积月光束！）与百烛吊灯
  if (room.decorProps) {
    const shelfImg = Assets.get('prop_bookshelf');
    const winImg = Assets.get('prop_lattice_window');
    const chanImg = Assets.get('prop_chandelier');

    for (const dp of room.decorProps) {
      const sc = dp.scale ?? 1;
      if (dp.kind === 'lattice_window' && winImg) {
        const h = 235 * sc;
        const w = winImg.width * (h / winImg.height);
        ctx.drawImage(winImg, dp.x - w * 0.5, dp.y - h, w, h);

        // 礼拜堂/正殿灵魂意境：透窗斜射而下的清冷月华体积光柱！
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
      } else if (dp.kind === 'chandelier' && chanImg) {
        const sway = Math.sin(t * 1.6 + dp.x * 0.02) * 0.035;
        const h = 186 * sc;
        const w = chanImg.width * (h / chanImg.height);
        ctx.save();
        ctx.translate(dp.x, dp.y);
        ctx.rotate(sway);
        ctx.drawImage(chanImg, -w * 0.5, 0, w, h);

        ctx.globalCompositeOperation = 'lighter';
        const cg = ctx.createRadialGradient(0, h * 0.72, 4, 0, h * 0.72, 115);
        cg.addColorStop(0, 'rgba(251, 191, 36, 0.28)');
        cg.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(0, h * 0.72, 115, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  // 2. 晨钟机关楼：实时咬合旋转的手绘青铜八卦巨齿轮与升降踏台！
  if (room.clockGears) {
    const gearImg = Assets.get('prop_clock_gear');
    const ledgeImg = Assets.get('env_indoor_ledge') || Assets.get('env_pavilion');
    if (gearImg) {
      for (const g of room.clockGears) {
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(t * g.speed);
        ctx.globalAlpha = g.hasOrbitPlatforms ? 0.94 : 0.72;
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
 * 绘制平台：室内大殿/藏书阁采用无屋顶的【手绘红木鎏金雕栏回廊 `env_indoor_ledge`】，露天采用【飞檐朱漆阁台 `env_pavilion`】！
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

  // 竖井井口平地单向木栈盖板
  if (!hasPillars && Math.abs(y - groundHere) < 18) {
    const src = indoorImg || pvImg;
    if (src) {
      const sy = Math.floor(src.height * 0.37);
      const sh = Math.floor(src.height * 0.16);
      ctx.drawImage(src, 16, sy, src.width - 32, sh, x - 2, y - 3, w + 4, 15);
    }
    return;
  }

  // 室内大殿/藏书阁/水牢一律采用无屋顶的【雕栏红木阁楼露台】，彻底杜绝“室内摆凉亭屋顶”违和感！
  if (room.indoor && indoorImg) {
    const drawW = w + 10;
    const drawH = Math.min(108, Math.max(66, drawW * (indoorImg.height / indoorImg.width)));
    ctx.drawImage(indoorImg, x - 5, y - drawH * 0.38, drawW, drawH);
    return;
  }

  if (!pvImg) return;

  // 若阁楼有落地立柱且高于地面，先延伸两侧手绘朱漆圆柱直达地面！
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

  // 绘制完整正侧视雕栏木阁台（青石踏面位于贴图 42% 高度处，栏杆自然立在李逸承身后！）
  const drawW = w + 16;
  const drawH = Math.min(138, Math.max(96, drawW * (pvImg.height / pvImg.width)));
  ctx.drawImage(pvImg, x - 8, y - drawH * 0.42, drawW, drawH);
}

/**
 * 绘制 AI 手绘飞檐青石牌坊 (`prop_stone_arch.webp`)
 */
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

/**
 * 绘制 AI 手绘镇魂土地古祠 (`prop_shrine.webp`) + 暖金香火神龛辉光
 */
export function drawOrthographicSaveShrine(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  _t: number
): void {
  const halo = ctx.createRadialGradient(cx, groundY - 68, 10, cx, groundY - 68, 155);
  halo.addColorStop(0, 'rgba(251, 191, 36, 0.34)');
  halo.addColorStop(0.55, 'rgba(217, 119, 6, 0.1)');
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, groundY - 68, 155, 0, Math.PI * 2);
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

/**
 * 绘制随风轻摆的 AI 手绘红绸六角宫灯 (`prop_lantern.webp`)
 */
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
  const g = ctx.createRadialGradient(x, lampY + 18, 3, x, lampY + 18, 108 + flick);
  g.addColorStop(0, 'rgba(251, 146, 60, 0.32)');
  g.addColorStop(0.55, 'rgba(220, 38, 38, 0.1)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, lampY + 18, 112, 0, Math.PI * 2);
  ctx.fill();

  drawHangingSilkLantern(ctx, x, lampY - 8, t, 0.92);
}
