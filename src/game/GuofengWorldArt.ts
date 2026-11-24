import {
  BuiltRoom,
  getArchBridgeGeometry,
  getRoomSideDoors,
  isInsideDownShaft,
  sampleCeilingY,
  sampleSolidGroundY,
} from '../data/worldMap';
import { WeaponArchetype } from '../types';
import { AssetKey, Assets, resolveWeaponAssetKey } from './AssetLoader';

/**
 * 100% AI 手绘国风重彩立体场景渲染引擎（八大主题画卷 + 厚重须弥城砖地基 + 暖色盘龙火盆光影 + 多层门廊竖塔！）
 */

export function drawCelShadedWeapon(
  ctx: CanvasRenderingContext2D,
  archetype: WeaponArchetype,
  weaponId = 'sword_0',
  lengthPx = 88
): void {
  const key = resolveWeaponAssetKey(archetype, weaponId);
  const img = Assets.get(key);
  if (!img || !img.width || !img.height) return;

  if (archetype === 'whip') {
    const maxW = lengthPx * 0.94;
    const maxH = lengthPx * 0.4;
    let w = maxW;
    let h = w * (img.height / img.width);
    if (h > maxH) {
      h = maxH;
      w = h * (img.width / img.height);
    }
    ctx.drawImage(img, -w * 0.5, -h * 0.5, w, h);
    return;
  }

  if (archetype === 'daggers') {
    const maxW = lengthPx * 0.88;
    const maxH = lengthPx * 0.44;
    let w = maxW;
    let h = w * (img.height / img.width);
    if (h > maxH) {
      h = maxH;
      w = h * (img.width / img.height);
    }
    ctx.drawImage(img, -w * 0.5, -h * 0.5, w, h);
    return;
  }

  const maxW = archetype === 'spear' ? lengthPx * 1.18 : lengthPx;
  const maxH = lengthPx * 0.44;
  let w = maxW;
  let h = w * (img.height / img.width);
  if (h > maxH) {
    h = maxH;
    w = h * (img.width / img.height);
  }
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

const tonedBackdropCache = new Map<string, HTMLCanvasElement>();

function getTonedBackdropCanvas(
  bgKey: AssetKey,
  bg: HTMLImageElement,
  indoor: boolean
): HTMLImageElement | HTMLCanvasElement {
  if (typeof document === 'undefined' || bg.width < 4 || bg.height < 4) return bg;
  const key = `${bgKey}:${indoor ? 1 : 0}:${bg.width}x${bg.height}`;
  const hit = tonedBackdropCache.get(key);
  if (hit) {
    tonedBackdropCache.delete(key);
    tonedBackdropCache.set(key, hit);
    return hit;
  }

  const c = document.createElement('canvas');
  c.width = bg.width;
  c.height = bg.height;
  const bctx = c.getContext('2d');
  if (!bctx) return bg;
  try {
    bctx.filter = indoor
      ? 'saturate(0.68) contrast(0.9) brightness(0.74)'
      : 'saturate(0.76) contrast(0.92) brightness(0.82)';
  } catch {
    // Ignore if canvas filter is unsupported
  }
  bctx.drawImage(bg, 0, 0);
  bctx.filter = 'none';

  if (tonedBackdropCache.size >= 6) {
    const oldest = tonedBackdropCache.keys().next().value;
    if (oldest !== undefined) tonedBackdropCache.delete(oldest);
  }
  tonedBackdropCache.set(key, c);
  return c;
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
    else if (room.region === 'alchemy') bgKey = 'bg_alchemy_palace';
    else if (room.region === 'forge') bgKey = 'bg_molten_forge';
    else if (room.region === 'main_hall') bgKey = 'bg_main_hall';
    else if (room.region === 'library') bgKey = 'bg_library_opera';
    else if (room.region === 'clock_tower') bgKey = room.indoor ? 'bg_tower_interior' : 'bg_chapel_spire';
    else if (room.region === 'prison') bgKey = 'bg_cavern_waterfall';
    else if (room.region === 'shipyard') bgKey = 'bg_sunken_shipyard';
    else if (room.region === 'catacomb') bgKey = 'bg_catacomb_tomb';
    else if (room.region === 'nether') bgKey = 'bg_nether_abyss';
    else if (room.region === 'colosseum') bgKey = 'bg_martial_colosseum';
    else if (room.region === 'altar') bgKey = 'bg_sky_altar';
  }

  const bg = Assets.get(bgKey) || Assets.get('bg_gatehouse');
  // 严格裁剪在房间物理内壁范围之内，绝不允许远景画布泄漏到房间左右外墙之外！
  const clipX0 = Math.max(0, -camLeft);
  const clipX1 = Math.min(vW, room.pixelW - camLeft);
  ctx.fillStyle = '#04060d';
  ctx.fillRect(0, 0, vW, vH);
  if (clipX1 <= clipX0) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(clipX0, 0, clipX1 - clipX0, vH);
  ctx.clip();

  if (bg) {
    const tonedBg = getTonedBackdropCanvas(bgKey, bg, Boolean(room.indoor));
    const aspect = tonedBg.width / tonedBg.height;
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

    // 使用离屏预烘焙调色远景，消除移动端每帧全屏 ctx.filter 着色器开销
    if (room.realm === 'inverted') {
      ctx.save();
      ctx.translate(0, vH);
      ctx.scale(1, -1);
      ctx.drawImage(tonedBg, px, py, drawW, drawH);
      ctx.restore();
    } else {
      ctx.drawImage(tonedBg, px, py, drawW, drawH);
    }

    if (room.realm === 'inverted') {
      const invGrad = ctx.createLinearGradient(0, 0, 0, vH);
      invGrad.addColorStop(0, 'rgba(84, 14, 36, 0.46)');
      invGrad.addColorStop(0.55, 'rgba(22, 9, 34, 0.48)');
      invGrad.addColorStop(1, 'rgba(6, 5, 13, 0.78)');
      ctx.fillStyle = invGrad;
      ctx.fillRect(0, 0, vW, vH);
    } else {
      // 全平台通用空气透视色雾层（不依赖移动端兼容性受限的 ctx.filter，让远景自然退后、凸显实体砖石台阶！）
      const depthGrad = ctx.createLinearGradient(0, 0, 0, vH);
      if (
        room.region === 'catacomb' ||
        room.region === 'nether' ||
        room.bgKey === 'bg_catacomb_tomb' ||
        room.bgKey === 'bg_nether_abyss'
      ) {
        depthGrad.addColorStop(0, 'rgba(6, 16, 20, 0.36)');
        depthGrad.addColorStop(0.62, 'rgba(7, 18, 22, 0.48)');
        depthGrad.addColorStop(1, 'rgba(4, 9, 13, 0.76)');
      } else if (room.region === 'shipyard' || room.bgKey === 'bg_sunken_shipyard' || room.bgKey === 'bg_moat_sluice') {
        depthGrad.addColorStop(0, 'rgba(7, 16, 22, 0.32)');
        depthGrad.addColorStop(0.62, 'rgba(8, 19, 25, 0.44)');
        depthGrad.addColorStop(1, 'rgba(4, 9, 14, 0.74)');
      } else if (room.bgKey === 'bg_gatehouse_interior' || room.bgKey === 'bg_city_avenue') {
        depthGrad.addColorStop(0, 'rgba(14, 9, 14, 0.22)');
        depthGrad.addColorStop(0.62, 'rgba(15, 11, 18, 0.34)');
        depthGrad.addColorStop(1, 'rgba(6, 6, 12, 0.68)');
      } else if (room.region === 'alchemy') {
        depthGrad.addColorStop(0, 'rgba(14, 10, 26, 0.28)');
        depthGrad.addColorStop(0.62, 'rgba(16, 11, 28, 0.4)');
        depthGrad.addColorStop(1, 'rgba(7, 5, 14, 0.72)');
      } else if (room.region === 'altar') {
        depthGrad.addColorStop(0, 'rgba(26, 8, 12, 0.16)');
        depthGrad.addColorStop(0.62, 'rgba(18, 8, 14, 0.32)');
        depthGrad.addColorStop(1, 'rgba(6, 5, 12, 0.68)');
      } else if (room.region === 'prison') {
        depthGrad.addColorStop(0, 'rgba(6, 18, 26, 0.34)');
        depthGrad.addColorStop(0.62, 'rgba(7, 20, 30, 0.44)');
        depthGrad.addColorStop(1, 'rgba(4, 9, 16, 0.74)');
      } else if (room.region === 'forge') {
        depthGrad.addColorStop(0, 'rgba(24, 10, 6, 0.34)');
        depthGrad.addColorStop(0.62, 'rgba(20, 9, 7, 0.46)');
        depthGrad.addColorStop(1, 'rgba(9, 5, 6, 0.76)');
      } else {
        depthGrad.addColorStop(0, 'rgba(6, 9, 17, 0.3)');
        depthGrad.addColorStop(0.62, 'rgba(7, 11, 20, 0.42)');
        depthGrad.addColorStop(1, 'rgba(4, 7, 13, 0.72)');
      }
      ctx.fillStyle = depthGrad;
      ctx.fillRect(0, 0, vW, vH);
    }
  } else {
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, vW, vH);
  }
  ctx.restore();
}

function sampleSupportBaseY(room: BuiltRoom, x: number, belowY: number): number {
  let bestY = sampleSolidGroundY(room, x);
  if (room.solidBlocks) {
    for (const sb of room.solidBlocks) {
      if (x >= sb.x + 8 && x <= sb.x + sb.w - 8 && sb.y > belowY + 24 && sb.y < bestY) {
        bestY = sb.y;
      }
    }
  }
  return bestY;
}

function isArchBridgeSpanAt(room: BuiltRoom, x: number): boolean {
  for (let i = 0; i < room.groundNodes.length - 1; i++) {
    const a = room.groundNodes[i];
    const b = room.groundNodes[i + 1];
    if (x >= a.x - 16 && x <= b.x + 16 && a.style === 'arch_bridge') {
      return true;
    }
  }
  return false;
}

function isOverLiquidOrShaft(room: BuiltRoom, x: number): boolean {
  if (isInsideDownShaft(room, x)) return true;
  if (isArchBridgeSpanAt(room, x)) return false;
  return room.waterZones.some((wz) => x >= wz.x1 + 10 && x <= wz.x2 - 10);
}

/**
 * 羽化浓墨接地软阴影：使用单位圆径向渐变配合椭圆缩放，使边缘 Alpha 100% 自然归零，彻底消灭硬边黑椭圆贴纸！
 */
export function drawSoftGroundShadow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  alpha = 0.56
): void {
  if (rx <= 0.5 || ry <= 0.5 || alpha <= 0.01) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(rx, ry);
  const g = ctx.createRadialGradient(0, 0, 0.08, 0, 0, 1);
  g.addColorStop(0, `rgba(2, 4, 10, ${alpha})`);
  g.addColorStop(0.52, `rgba(3, 6, 13, ${alpha * 0.46})`);
  g.addColorStop(1, 'rgba(3, 6, 13, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

type PropHarmonizeTone =
  | 'inverted'
  | 'bamboo_night'
  | 'imperial_warm'
  | 'catacomb_moss'
  | 'cavern_cool'
  | 'forge_ember'
  | 'alchemy_violet'
  | 'altar_crimson';

function resolveRoomHarmonizeTone(room?: BuiltRoom): PropHarmonizeTone {
  if (!room) return 'imperial_warm';
  if (room.realm === 'inverted') return 'inverted';
  if (
    room.region === 'catacomb' ||
    room.region === 'nether' ||
    room.bgKey === 'bg_catacomb_tomb' ||
    room.bgKey === 'bg_nether_abyss' ||
    room.bgKey === 'bg_moat_sluice'
  ) {
    return 'catacomb_moss';
  }
  if (room.region === 'prison' || room.region === 'shipyard' || room.bgKey === 'bg_sunken_shipyard') {
    return 'cavern_cool';
  }
  if (room.region === 'forge') return 'forge_ember';
  if (room.region === 'alchemy') return 'alchemy_violet';
  if (room.region === 'altar' || room.region === 'colosseum') return 'altar_crimson';
  if (room.bgKey === 'bg_bamboo_cliff' || (room.bgKey === 'bg_gatehouse' && !room.indoor)) {
    return 'bamboo_night';
  }
  return 'imperial_warm';
}

const HARMONIZE_TINT_RGBA: Record<PropHarmonizeTone, string> = {
  inverted: 'rgba(72, 14, 36, 0.24)',
  bamboo_night: 'rgba(14, 28, 42, 0.22)',
  imperial_warm: 'rgba(68, 38, 20, 0.17)',
  catacomb_moss: 'rgba(18, 48, 46, 0.26)',
  cavern_cool: 'rgba(14, 52, 64, 0.22)',
  forge_ember: 'rgba(84, 30, 12, 0.22)',
  alchemy_violet: 'rgba(52, 30, 68, 0.18)',
  altar_crimson: 'rgba(74, 20, 30, 0.16)',
};

const harmonizedPropCache = new Map<string, HTMLCanvasElement>();

/**
 * 为手绘摆件/亭台预烘焙【同源环境光色温 + 底部 24% 接地环境遮蔽暗部 (`source-atop`)】：
 * 严格遵循原画 Alpha 轮廓，绝不污染透明区域，让石狮、牌坊、香炉、灯柱像直接画在当前夜景石板上一样浑然天成！
 */
export function getHarmonizedSprite(
  assetKey: string,
  img: HTMLImageElement,
  room?: BuiltRoom,
  groundContactStrength = 0.46
): HTMLImageElement | HTMLCanvasElement {
  if (typeof document === 'undefined' || img.width < 4 || img.height < 4) return img;
  const tone = resolveRoomHarmonizeTone(room);
  const aoBucket = Math.round(groundContactStrength * 20);
  const cacheKey = `${assetKey}:${tone}:${aoBucket}:${img.width}x${img.height}`;
  const hit = harmonizedPropCache.get(cacheKey);
  if (hit) return hit;

  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const cctx = c.getContext('2d');
  if (!cctx) return img;

  cctx.drawImage(img, 0, 0);
  cctx.globalCompositeOperation = 'source-atop';

  // 1) 同源环境光色温包裹（压住切图生硬高光，融入关卡主色调）
  cctx.fillStyle = HARMONIZE_TINT_RGBA[tone];
  cctx.fillRect(0, 0, c.width, c.height);

  // 2) 底部接地环境光遮蔽（AO）：越靠近地面石缝越沉入浓墨暗部，消除“浮在地板表面”的剪纸感
  if (groundContactStrength > 0.02) {
    const aoTop = Math.floor(c.height * 0.72);
    const aoG = cctx.createLinearGradient(0, aoTop, 0, c.height);
    aoG.addColorStop(0, 'rgba(3, 5, 11, 0)');
    aoG.addColorStop(0.65, `rgba(3, 5, 11, ${(groundContactStrength * 0.48).toFixed(3)})`);
    aoG.addColorStop(1, `rgba(2, 4, 9, ${groundContactStrength.toFixed(3)})`);
    cctx.fillStyle = aoG;
    cctx.fillRect(0, aoTop, c.width, c.height - aoTop);
  }

  if (harmonizedPropCache.size >= 72) {
    const oldest = harmonizedPropCache.keys().next().value;
    if (oldest !== undefined) harmonizedPropCache.delete(oldest);
  }
  harmonizedPropCache.set(cacheKey, c);
  return c;
}

export function drawSlicedColumn(
  ctx: CanvasRenderingContext2D,
  pillarImg: HTMLImageElement | HTMLCanvasElement,
  cx: number,
  topY: number,
  bottomY: number,
  colW: number,
  shadeDarkness = 0,
  castBaseShadow = true
): void {
  const totalH = bottomY - topY;
  if (totalH < 34) return;

  const iw = pillarImg.width;
  const ih = pillarImg.height;
  const capSrcH = Math.floor(ih * 0.21);
  const baseSrcY = Math.floor(ih * 0.81);
  const baseSrcH = ih - baseSrcY;
  const shaftSrcY = capSrcH;
  const shaftSrcH = Math.max(24, baseSrcY - capSrcH);

  const scale = colW / iw;
  const capDrawH = Math.min(totalH * 0.36, capSrcH * scale);
  const baseDrawH = Math.min(totalH * 0.36, baseSrcH * scale);
  const shaftTop = topY + capDrawH - 2;
  const shaftBot = bottomY - baseDrawH + 3;

  ctx.save();
  if (castBaseShadow) {
    drawSoftGroundShadow(ctx, cx, bottomY + 2, colW * 0.85, 6.5, 0.58);
  }

  // 100% 实体不透明绘制（彻底根除半透明柱身透出远景石桥/山峰的穿模感！）
  ctx.globalAlpha = 1;
  const stepH = Math.max(28, shaftSrcH * scale);
  for (let y = shaftTop; y < shaftBot; y += stepH - 2) {
    const hClip = Math.min(stepH, shaftBot - y);
    if (hClip <= 1) break;
    const srcClipH = Math.max(4, Math.floor((hClip / stepH) * shaftSrcH));
    ctx.drawImage(pillarImg, 0, shaftSrcY, iw, srcClipH, cx - colW * 0.5, y, colW, hClip + 1);
  }
  ctx.drawImage(pillarImg, 0, 0, iw, capSrcH, cx - colW * 0.5, topY, colW, capDrawH);
  ctx.drawImage(
    pillarImg,
    0,
    baseSrcY,
    iw,
    baseSrcH,
    cx - colW * 0.52,
    bottomY - baseDrawH + 3,
    colW * 1.04,
    baseDrawH
  );

  // 若为退居后墙的建筑背柱，叠压一层不透景暗影罩（退后纵深但不透背景！）
  if (shadeDarkness > 0.02) {
    ctx.fillStyle = `rgba(5, 8, 15, ${Math.min(0.68, shadeDarkness)})`;
    ctx.fillRect(cx - colW * 0.48, topY, colW * 0.96, totalH);
  }
  ctx.restore();
}

/**
 * 标准九宫格三段式（Left Cap + Seamless Tiled Middle + Right Cap）等比例手绘平台渲染器：
 * 彻底根除将整张亭台/石台原画按 `drawW` 强行水平拉伸导致的栏杆挤扁或拉宽变形！
 */
export function drawThreeSlicePlatform(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  srcY: number,
  srcH: number,
  x: number,
  y: number,
  w: number,
  drawH: number,
  topAlignRatio: number
): void {
  const iw = img.width;
  if (iw < 16 || srcH < 8 || w < 24) return;

  const capFrac = 0.21;
  const srcCapW = Math.floor(iw * capFrac);
  const srcMidX = srcCapW;
  const srcMidW = Math.max(16, iw - srcCapW * 2);

  const scale = drawH / srcH;
  const drawY = y - drawH * topAlignRatio;
  const rawCapW = srcCapW * scale;
  const capW = Math.min(w * 0.44, rawCapW);
  const midTotalW = Math.max(0, w - capW * 2);

  ctx.save();
  ctx.globalAlpha = 1;
  // 左端原比例雕花封头
  ctx.drawImage(img, 0, srcY, srcCapW, srcH, x, drawY, capW + 0.8, drawH);

  // 中段按 1:1 纹理密度无缝循环平铺（零水平拉伸变形！）
  if (midTotalW > 0.5) {
    const stepW = Math.max(24, srcMidW * scale);
    let curX = x + capW;
    const endX = x + capW + midTotalW;
    while (curX < endX - 0.2) {
      const segW = Math.min(stepW, endX - curX);
      const segSrcW = Math.max(4, Math.floor((segW / stepW) * srcMidW));
      ctx.drawImage(img, srcMidX, srcY, segSrcW, srcH, curX, drawY, segW + 0.8, drawH);
      curX += segW;
    }
  }

  // 右端原比例雕花封头
  ctx.drawImage(img, iw - srcCapW, srcY, srcCapW, srcH, x + w - capW, drawY, capW, drawH);
  ctx.restore();
}

export function drawSuspensionChain(
  ctx: CanvasRenderingContext2D,
  chainImg: HTMLImageElement,
  cx: number,
  topY: number,
  bottomY: number,
  chainW = 18,
  alpha = 0.88
): void {
  const totalH = bottomY - topY;
  if (totalH < 18) return;

  const iw = chainImg.width;
  const ih = chainImg.height;
  const headSrcH = Math.floor(ih * 0.28);
  const linkSrcY = headSrcH;
  const linkSrcH = ih - linkSrcY - 4;
  const scale = chainW / iw;
  const headDrawH = Math.min(totalH * 0.65, headSrcH * scale * 1.15);

  ctx.save();
  ctx.globalAlpha = alpha;
  // 兽首衔环顶扣
  ctx.drawImage(
    chainImg,
    0,
    0,
    iw,
    headSrcH,
    cx - chainW * 0.58,
    topY - 3,
    chainW * 1.16,
    headDrawH
  );
  // 竖向玄铁链环无缝循环至底端
  const stepH = Math.max(22, linkSrcH * scale);
  for (let y = topY + headDrawH - 5; y < bottomY; y += stepH - 4) {
    const hClip = Math.min(stepH, bottomY - y);
    if (hClip <= 2) break;
    const srcClipH = Math.max(6, Math.floor((hClip / stepH) * linkSrcH));
    ctx.drawImage(chainImg, 0, linkSrcY, iw, srcClipH, cx - chainW * 0.5, y, chainW, hClip + 1);
  }
  ctx.restore();
}

/**
 * 沿任意起点至终点（支持弧垂/蛇形鞭波）平铺手绘玄铁锁链节（替代一切 setLineDash 虚线与多段矢量折线！）
 */
export function drawPaintedChainTrack(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  widthPx = 11,
  alpha = 0.86,
  tintHex?: string,
  waveAmp = 0,
  waveFreq = 2.2,
  wavePhase = 0,
  sagY = 0
): void {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.hypot(dx, dy);
  if (dist < 4) return;

  const baseImg = Assets.get('arch_iron_chain');
  const tinted = tintHex ? Assets.getTintedSilhouette('arch_iron_chain', tintHex) : undefined;
  const src: HTMLImageElement | HTMLCanvasElement | undefined = tinted || baseImg;
  if (!src || !src.width || !src.height) return;

  const iw = src.width;
  const ih = src.height;
  const linkSrcY = Math.floor(ih * 0.3);
  const linkSrcH = Math.max(12, Math.floor(ih * 0.66));
  const segLen = Math.max(12, widthPx * (linkSrcH / iw) * 0.92);
  const steps = Math.max(2, Math.min(44, Math.ceil(dist / segLen)));
  const nx = -dy / dist;
  const ny = dx / dist;

  ctx.save();
  ctx.globalAlpha = alpha;
  if (tintHex) ctx.globalCompositeOperation = 'lighter';

  let prevX = x0;
  let prevY = y0;
  for (let i = 1; i <= steps; i++) {
    const u = i / steps;
    const offset =
      Math.sin(u * Math.PI * waveFreq - wavePhase) * waveAmp +
      Math.sin(u * Math.PI) * sagY;
    const curX = x0 + dx * u + nx * offset;
    const curY = y0 + dy * u + ny * offset;
    const sdx = curX - prevX;
    const sdy = curY - prevY;
    const slen = Math.max(2, Math.hypot(sdx, sdy));
    const midX = (prevX + curX) * 0.5;
    const midY = (prevY + curY) * 0.5;
    const ang = Math.atan2(sdy, sdx);

    ctx.save();
    ctx.translate(midX, midY);
    ctx.rotate(ang - Math.PI * 0.5);
    ctx.drawImage(src, 0, linkSrcY, iw, linkSrcH, -widthPx * 0.5, -slen * 0.56, widthPx, slen * 1.12);
    ctx.restore();

    prevX = curX;
    prevY = curY;
  }
  ctx.restore();
}

/**
 * 统一绘制手绘重彩水墨光环/阵法/震波贴图（支持透视压扁与灵气染墨叠光，彻底告别空心矢量圆环！）
 */
export function drawPaintedVfxDisc(
  ctx: CanvasRenderingContext2D,
  assetKey: AssetKey,
  x: number,
  y: number,
  radiusPx: number,
  rotation = 0,
  alpha = 0.85,
  tintHex?: string,
  squashY = 1,
  additive = false
): void {
  const img = Assets.get(assetKey);
  if (!img || !img.width || !img.height || radiusPx <= 0.5 || alpha <= 0.01) return;
  const d = radiusPx * 2;
  const w = d;
  const h = d * (img.height / img.width);

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, squashY);
  ctx.rotate(rotation);
  if (additive) ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.drawImage(img, -w * 0.5, -h * 0.5, w, h);

  if (tintHex) {
    const tinted = Assets.getTintedSilhouette(assetKey, tintHex, false);
    if (tinted) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha * 0.72));
      ctx.drawImage(tinted, -w * 0.5, -h * 0.5, w, h);
    }
  }
  ctx.restore();
}

export interface PaintedVfxSpriteOpts {
  rotation?: number;
  alpha?: number;
  tintHex?: string;
  tintAlpha?: number;
  flipX?: boolean;
  flipY?: boolean;
  additive?: boolean;
  anchorX?: number;
  anchorY?: number;
}

/**
 * 任意尺寸比例与锚点的纯手绘国风水墨特效贴图渲染器（零矢量锯齿、支持镜像、锚点与叠加态染墨光晕）
 */
export function drawPaintedVfxSprite(
  ctx: CanvasRenderingContext2D,
  assetKey: AssetKey,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: PaintedVfxSpriteOpts = {}
): void {
  const img = Assets.get(assetKey);
  const alpha = opts.alpha ?? 0.92;
  if (!img || !img.width || !img.height || w <= 0.5 || h <= 0.5 || alpha <= 0.01) return;

  const ax = opts.anchorX ?? 0.5;
  const ay = opts.anchorY ?? 0.5;
  const dx = -w * ax;
  const dy = -h * ay;

  ctx.save();
  ctx.translate(x, y);
  if (opts.rotation) ctx.rotate(opts.rotation);
  if (opts.flipX || opts.flipY) ctx.scale(opts.flipX ? -1 : 1, opts.flipY ? -1 : 1);
  if (opts.additive) ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.drawImage(img, dx, dy, w, h);

  if (opts.tintHex) {
    const tinted = Assets.getTintedSilhouette(assetKey, opts.tintHex, false);
    if (tinted) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha * (opts.tintAlpha ?? 0.65)));
      ctx.drawImage(tinted, dx, dy, w, h);
    }
  }
  ctx.restore();
}

let softLightCutoutStamp: HTMLCanvasElement | null = null;
let softDotStamp: HTMLCanvasElement | null = null;

/** 复用 128×128 柔边径向光孔印章，避免每帧每个火把重建 RadialGradient */
export function getSoftLightCutoutStamp(): HTMLCanvasElement {
  if (softLightCutoutStamp) return softLightCutoutStamp;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const sctx = c.getContext('2d');
  if (sctx) {
    const g = sctx.createRadialGradient(64, 64, 5, 64, 64, 64);
    g.addColorStop(0, 'rgba(0, 0, 0, 1)');
    g.addColorStop(0.55, 'rgba(0, 0, 0, 0.58)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 128, 128);
  }
  softLightCutoutStamp = c;
  return c;
}

/** 复用 32×32 柔边白光微粒印章 */
export function getSoftDotStamp(): HTMLCanvasElement {
  if (softDotStamp) return softDotStamp;
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 32;
  const sctx = c.getContext('2d');
  if (sctx) {
    const g = sctx.createRadialGradient(16, 16, 1, 16, 16, 16);
    g.addColorStop(0, 'rgba(255, 255, 255, 1)');
    g.addColorStop(0.55, 'rgba(255, 255, 255, 0.72)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 32, 32);
  }
  softDotStamp = c;
  return c;
}

/**
 * 沿任意两点铺展手绘水墨神雷电弧（替代锯齿状折线 stroke）
 */
export function drawPaintedThunderBolt(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  thicknessPx = 30,
  alpha = 0.9,
  flipY = false,
  tintHex?: string
): void {
  const img = Assets.get('vfx_thunder_bolt');
  if (!img || !img.width || !img.height || alpha <= 0.01) return;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if (dist < 4) return;
  const w = dist * 1.12;
  const h = Math.max(10, thicknessPx);

  ctx.save();
  ctx.translate((x1 + x2) * 0.5, (y1 + y2) * 0.5);
  ctx.rotate(Math.atan2(dy, dx));
  if (flipY) ctx.scale(1, -1);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.drawImage(img, -w * 0.5, -h * 0.5, w, h);
  if (tintHex) {
    const tinted = Assets.getTintedSilhouette('vfx_thunder_bolt', tintHex);
    if (tinted) {
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha * 0.55));
      ctx.drawImage(tinted, -w * 0.5, -h * 0.5, w, h);
    }
  }
  ctx.restore();
}

function drawWallCorbel(
  ctx: CanvasRenderingContext2D,
  corbelImg: HTMLImageElement,
  side: 'left' | 'right',
  wallEdgeX: number,
  underPlatY: number,
  bw: number,
  bh: number,
  alpha = 0.92
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  if (side === 'left') {
    ctx.drawImage(corbelImg, wallEdgeX - 4, underPlatY, bw, bh);
  } else {
    ctx.translate(wallEdgeX + 4, underPlatY);
    ctx.scale(-1, 1);
    ctx.drawImage(corbelImg, 0, 0, bw, bh);
  }
  ctx.restore();
}

/**
 * 烘焙 100% 纯手绘《恶魔城：月下》式一体化房间建筑结构层与地形层：
 * 1. `1.0x` 同速建筑背柱、石砌踢脚墙裙与竖塔贯通大柱，彻底消除远景视差与平台的“两张皮”割裂感；
 * 2. 所有空中平台自动生成物理承重锚定（落地雕花殿柱/青石方柱、贴墙斗拱牛腿斜撑、或藻井玄铁吊链）；
 * 3. 分区域专属平台材质（地宫水牢采用青苔雕纹石台，宫阙梨园采用朱漆雕栏木阁）+ 真实丹陛踏跺石阶 + 穿堂石券门楼框！
 */
function isStoneFortressOrDungeon(room: BuiltRoom): boolean {
  return (
    room.region === 'prison' ||
    room.region === 'shipyard' ||
    room.region === 'catacomb' ||
    room.region === 'nether' ||
    room.region === 'forge' ||
    room.bgKey === 'bg_moat_sluice'
  );
}

export function bakeOrthographicRoomTerrain(
  bctx: CanvasRenderingContext2D,
  room: BuiltRoom,
  brokenSecretWalls: string[] = []
): void {
  bctx.clearRect(0, 0, room.pixelW, room.pixelH);

  const isStoneDungeon = isStoneFortressOrDungeon(room);
  const usePalaceMarble = Boolean(
    (room.indoor ||
      room.region === 'altar' ||
      room.bgKey === 'bg_city_avenue' ||
      room.id === 'observatory_bridge') &&
      !isStoneDungeon
  );
  const floorImg =
    (usePalaceMarble ? Assets.get('env_palace_floor') : undefined) || Assets.get('env_ground_slab');
  const slabImg = Assets.get('env_ground_slab');
  const bridgeImg = Assets.get('env_bridge');
  const stoneLedgeImg = Assets.get('env_stone_ledge');
  const timberPillarImg = Assets.get('arch_timber_pillar') || Assets.get('prop_coiled_pillar');
  const stonePillarImg = Assets.get('arch_stone_pillar') || timberPillarImg;
  const activePillarImg = isStoneDungeon ? stonePillarImg : timberPillarImg;
  const corbelImg = Assets.get('arch_corbel_bracket');
  const chainImg = Assets.get('arch_iron_chain');
  const doorFrameImg = Assets.get('arch_side_doorframe');

  const isArchBridgeRoom =
    room.waterZones.length > 0 &&
    room.waterZones[0].liquidKind !== 'lava' &&
    room.groundNodes.some((n) => n.style === 'arch_bridge');
  const wz = isArchBridgeRoom ? room.waterZones[0] : null;

  // 0A. `1.0x` 室内建筑骨架层：背景壁柱、踢脚石墙裙与竖塔四层贯通承重柱（与地面 1:1 锁定同步滚动，将房间凝成真实建筑整体！）
  if (room.indoor) {
    // 室内墙根石砌暗部踢脚墙裙（消除地面与远景插画之间的硬切缝）
    for (let wx = 32; wx < room.pixelW - 32; wx += 24) {
      if (isInsideDownShaft(room, wx + 12)) continue;
      const gy = sampleSolidGroundY(room, wx + 12);
      const dadoG = bctx.createLinearGradient(0, gy - 46, 0, gy);
      dadoG.addColorStop(0, 'rgba(5, 8, 15, 0)');
      dadoG.addColorStop(0.65, 'rgba(6, 10, 18, 0.34)');
      dadoG.addColorStop(1, 'rgba(4, 7, 13, 0.68)');
      bctx.fillStyle = dadoG;
      bctx.fillRect(wx, gy - 46, 24.6, 46);
    }

    if (activePillarImg) {
      if (room.gridH > 1 && room.gridW === 1) {
        // 窄体多层竖塔（如 1×4 东垣望月竖塔）：两侧贯通天地的实心暗部承重巨柱（100% 不透远景！）
        const leftColX = 112;
        const rightColX = room.pixelW - 112;
        drawSlicedColumn(bctx, activePillarImg, leftColX, 30, sampleSolidGroundY(room, leftColX), 42, 0.42, true);
        drawSlicedColumn(bctx, activePillarImg, rightColX, 30, sampleSolidGroundY(room, rightColX), 42, 0.42, true);
      } else {
        // 单层及宽幅双层室内巨殿（如 3×2 皇城端门大殿）：每隔约 380~440px 竖立一根贯通殿顶与地面的实体承重朱柱
        const stepSpan = room.gridH > 1 ? 430 : 380;
        const colWidth = room.gridH > 1 ? 38 : isStoneDungeon ? 36 : 30;
        const span = room.pixelW - 240;
        const count = Math.max(2, Math.round(span / stepSpan));
        for (let i = 0; i <= count; i++) {
          const px = Math.round(120 + (span * i) / Math.max(1, count));
          if (isInsideDownShaft(room, px)) continue;
          const inUpShaft = room.shafts.some((s) => s.dir === 'up' && px >= s.x1 - 28 && px <= s.x2 + 28);
          if (inUpShaft) continue;
          if (
            (room.special === 'save_shrine' || room.special === 'warp_bagua') &&
            Math.abs(px - room.focalX) < 130
          ) {
            continue;
          }
          const ceilY = Math.max(28, sampleCeilingY(room, px, false));
          const gy = sampleSolidGroundY(room, px);
          drawSlicedColumn(bctx, activePillarImg, px, ceilY - 4, gy, colWidth, 0.46, false);
        }
      }
    }
  }

  // 0B. 全自动【平台建筑力学承重锚定层】：落地立柱、贴墙斗拱牛腿斜撑、藻井玄铁吊链 + 下方地面环境遮蔽投影
  const sideDoorsAll = getRoomSideDoors(room);
  const isNearDoorOpening = (x: number, yTop: number, yBot: number) =>
    sideDoorsAll.some((d) => {
      const dx = d.side === 'left' ? x : room.pixelW - x;
      return dx < 72 && yBot > d.floorY - 124 && yTop < d.floorY + 8;
    });

  const anchorFloatingPlatform = (px: number, py: number, pw: number, forcePillars: boolean) => {
    const midX = px + pw * 0.5;
    const groundMid = sampleSolidGroundY(room, midX);
    // 竖井井口平齐盖板不绘制立柱或吊链
    if (!forcePillars && Math.abs(py - groundMid) < 22) return;

    // 投射在下层台面/地面上的柔和建筑遮蔽暗影（让下方地面感知上方平台的存在！）
    const shadowY = sampleSupportBaseY(room, midX, py + 10);
    if (!isOverLiquidOrShaft(room, midX) && shadowY - py < 340) {
      drawSoftGroundShadow(bctx, midX, shadowY + 2, pw * 0.48, 8.5, 0.44);
    }

    const touchLeftWall = px <= 46;
    const touchRightWall = px + pw >= room.pixelW - 46;

    // 1) 靠墙挑台：在贴墙侧嵌入古建斗拱雀替/石牛腿斜撑，外悬端立柱落地或顶链悬拉
    if (touchLeftWall || touchRightWall) {
      if (corbelImg) {
        const bw = Math.min(86, pw * 0.46);
        const bh = bw * (corbelImg.height / corbelImg.width);
        if (touchLeftWall && !isNearDoorOpening(32, py, py + bh)) {
          drawWallCorbel(bctx, corbelImg, 'left', 28, py + 12, bw, bh, 1);
        }
        if (touchRightWall && !isNearDoorOpening(room.pixelW - 32, py, py + bh)) {
          drawWallCorbel(bctx, corbelImg, 'right', room.pixelW - 28, py + 12, bw, bh, 1);
        }
      }
      const outerX = touchLeftWall ? px + pw - 26 : px + 26;
      const baseOuter = sampleSupportBaseY(room, outerX, py + 16);
      const spanH = baseOuter - py;
      if (
        activePillarImg &&
        spanH >= 48 &&
        spanH <= 465 &&
        !isOverLiquidOrShaft(room, outerX) &&
        !isNearDoorOpening(outerX, py, baseOuter)
      ) {
        drawSlicedColumn(bctx, activePillarImg, outerX, py + 8, baseOuter, isStoneDungeon ? 32 : 28, 0.16, true);
      } else if (chainImg && room.indoor) {
        const ceilY = sampleCeilingY(room, outerX, false);
        if (ceilY > -20 && py - ceilY >= 28 && py - ceilY <= 360) {
          drawSuspensionChain(bctx, chainImg, outerX, ceilY - 2, py + 8, 16, 0.96);
        }
      }
      return;
    }

    // 2) 殿中独立飞阁 / 天街廊桥 / 石台：优先双立柱生根落地（含跨拱桥桥墩立柱）；若跨无桥深水/竖井或超高悬台，则由藻井玄铁双链悬吊！
    const useStoneColForWildLedge =
      !forcePillars && !room.indoor && room.bgKey === 'bg_bamboo_cliff' && Boolean(stonePillarImg);
    const colSprite = useStoneColForWildLedge ? stonePillarImg : activePillarImg;

    const leftX = px + Math.min(30, pw * 0.2);
    const rightX = px + pw - Math.min(30, pw * 0.2);
    const baseL = sampleSupportBaseY(room, leftX, py + 16);
    const baseR = sampleSupportBaseY(room, rightX, py + 16);
    const maxSpan = Math.max(baseL - py, baseR - py);
    const blockedUnder = isOverLiquidOrShaft(room, leftX) || isOverLiquidOrShaft(room, rightX);

    const canStandPillars =
      colSprite &&
      !blockedUnder &&
      baseL - py >= 46 &&
      baseR - py >= 46 &&
      (forcePillars || maxSpan <= 240 || (!room.indoor && maxSpan <= 440));

    if (canStandPillars && colSprite) {
      const colW = isStoneDungeon || useStoneColForWildLedge ? 32 : 28;
      drawSlicedColumn(bctx, colSprite, leftX, py + 8, baseL, colW, 0.14, true);
      if (pw >= 110) {
        drawSlicedColumn(bctx, colSprite, rightX, py + 8, baseR, colW, 0.14, true);
      }
      return;
    }

    // 超高悬空夹层或水渠/火池上方踏台：由顶棚大梁垂下双股玄铁吊链拉拽（竖塔高阶则由两侧斗拱斜挑承托）
    if (chainImg && room.indoor) {
      const ceilL = sampleCeilingY(room, leftX, false);
      const ceilR = sampleCeilingY(room, rightX, false);
      if (ceilL > -20 && py - ceilL <= 420) {
        drawSuspensionChain(bctx, chainImg, leftX, ceilL - 2, py + 8, 16, 0.96);
      }
      if (pw >= 110 && ceilR > -20 && py - ceilR <= 420) {
        drawSuspensionChain(bctx, chainImg, rightX, ceilR - 2, py + 8, 16, 0.96);
      }
      // 多层竖塔内部中间踏台：向最近一侧塔柱伸出斗拱挑梁相接
      if (room.gridH > 1 && corbelImg && py > 420) {
        const bw = 64;
        const bh = bw * (corbelImg.height / corbelImg.width);
        if (midX <= room.pixelW * 0.5) {
          drawWallCorbel(bctx, corbelImg, 'left', Math.max(28, px - 24), py + 12, bw, bh, 0.95);
        } else {
          drawWallCorbel(bctx, corbelImg, 'right', Math.min(room.pixelW - 28, px + pw + 24), py + 12, bw, bh, 0.95);
        }
      }
    }
  };

  if (room.solidBlocks) {
    for (const sb of room.solidBlocks) {
      const groundAtMid = sampleSolidGroundY(room, sb.x + sb.w * 0.5);
      const isFloating = sb.y + sb.h < groundAtMid - 14 && sb.h <= 46 && !sb.blocking;
      if (isFloating) {
        anchorFloatingPlatform(sb.x, sb.y, sb.w, false);
      }
    }
  }
  for (const pv of room.pavilions) {
    anchorFloatingPlatform(pv.x, pv.y, pv.w, pv.hasPillars);
  }

  // 0C. 下潜竖井 (`dir === 'down'`) 铺设深邃幽暗井道与两侧收口青石井壁
  for (const sh of room.shafts) {
    if (sh.dir !== 'down') continue;
    const gyL = sampleSolidGroundY(room, Math.max(0, sh.x1 - 8));
    const sw = sh.x2 - sh.x1;
    const wg = bctx.createLinearGradient(0, gyL, 0, room.pixelH);
    wg.addColorStop(0, '#04070e');
    wg.addColorStop(0.5, '#020409');
    wg.addColorStop(1, '#010205');
    bctx.fillStyle = wg;
    bctx.fillRect(sh.x1 - 4, gyL, sw + 8, Math.max(0, room.pixelH - gyL));

    if (slabImg) {
      const mY = Math.floor(slabImg.height * 0.42);
      const mH = Math.max(24, slabImg.height - mY - 2);
      const jambW = 18;
      for (let y = gyL; y < room.pixelH; y += mH - 2) {
        bctx.save();
        bctx.globalAlpha = 0.78;
        bctx.drawImage(slabImg, 8, mY, jambW, mH, sh.x1 - 2, y, jambW, mH);
        bctx.drawImage(slabImg, 40, mY, jambW, mH, sh.x2 - jambW + 2, y, jambW, mH);
        bctx.restore();
      }
    }
  }

  // 1. 纯手绘同源石材地基 + 真实分阶踏跺石阶 + 地面石板/墨玉台面铺装
  if (floorImg) {
    const sw = floorImg.width;
    const sh = floorImg.height;
    const srcTopY = usePalaceMarble ? Math.floor(sh * 0.16) : 0;
    const srcCapH = sh - srcTopY;
    // 像素级表面标定：让角色双靴精准踩在青石板 (`y=12px`) 与墨玉地砖 (`y=28px`) 水平顶面中央，绝不悬空或陷砖！
    const surfaceTopOffset = usePalaceMarble ? 8 : 12;

    const subSrcY = Math.floor(sh * (usePalaceMarble ? 0.46 : 0.36));
    const subSrcH = Math.max(24, sh - subSrcY - 2);

    const isStairSlopeAt = (wx: number): boolean => {
      for (let i = 0; i < room.groundNodes.length - 1; i++) {
        const a = room.groundNodes[i];
        const b = room.groundNodes[i + 1];
        if (wx >= a.x && wx < b.x) {
          return a.style === 'stairs' && Math.abs(b.y - a.y) >= 12;
        }
      }
      return false;
    };

    // 1A. 下层同源石砌地基（直接调用物理引擎同一 `sampleSolidGroundY` 高度，两侧桥台深入桥拱内侧 48px！）
    const stepSub = 24;
    for (let x = 0; x < room.pixelW; x += sw) {
      for (let sxOff = 0; sxOff < sw && x + sxOff < room.pixelW; sxOff += stepSub) {
        const wx = x + sxOff;
        if (isInsideDownShaft(room, wx + 4) || isInsideDownShaft(room, wx + stepSub - 4)) continue;
        if (wz && wx >= wz.x1 + 48 && wx + stepSub <= wz.x2 - 48) continue;

        const gy = sampleSolidGroundY(room, Math.min(room.pixelW, wx + stepSub * 0.5));
        const startY = gy + Math.min(34, srcCapH - surfaceTopOffset - 10);
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
            wClip + 0.8,
            hClip + 0.8
          );
        }

        const depthH = Math.max(0, room.pixelH - gy - 18);
        if (depthH > 0) {
          const subG = bctx.createLinearGradient(0, gy + 18, 0, room.pixelH);
          subG.addColorStop(0, 'rgba(4, 7, 14, 0.14)');
          subG.addColorStop(0.58, 'rgba(3, 6, 12, 0.56)');
          subG.addColorStop(1, 'rgba(2, 4, 9, 0.92)');
          bctx.fillStyle = subG;
          bctx.fillRect(wx, gy + 18, wClip + 0.8, depthH);
        }
      }
    }

    // 1B. 表层地面与精确物理级分阶踏跺石阶：
    // 平直路段按 24px 切片无缝铺设；石阶路段严格按 `sampleStairSegmentY` 每一级真实踏步边界绘制，与角色物理落脚点 0.0px 完全重合！
    const stepW = 24;
    for (let x = 0; x < room.pixelW; x += stepW) {
      if (isInsideDownShaft(room, x + 2) || isInsideDownShaft(room, x + stepW - 2)) continue;
      if (wz && x >= wz.x1 + 44 && x <= wz.x2 - stepW - 44) continue;

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
        stepW + 0.9,
        srcCapH
      );
    }

    for (let i = 0; i < room.groundNodes.length - 1; i++) {
      const a = room.groundNodes[i];
      const b = room.groundNodes[i + 1];
      const dy = b.y - a.y;
      if (a.style !== 'stairs' || Math.abs(dy) < 12) continue;
      const span = Math.max(1, b.x - a.x);
      const steps = Math.max(2, Math.round(Math.abs(dy) / 11));
      const goingDown = dy > 0;
      const order = goingDown
        ? Array.from({ length: steps }, (_, k) => steps - 1 - k)
        : Array.from({ length: steps }, (_, k) => k);

      for (const k of order) {
        const tx0 = a.x + (span * k) / steps;
        const tx1 = a.x + (span * (k + 1)) / steps;
        const tw = tx1 - tx0;
        const ty = a.y + (dy * (k + 0.5)) / steps;
        const sx = ((Math.floor(tx0) % sw) + sw) % sw;
        const grabW = Math.min(Math.max(8, Math.ceil(tw)), sw - sx);

        // 踢脚立面浓墨暗影（紧贴高阶侧边）
        const shadowX = goingDown ? tx0 - 3 : tx1 - 4;
        bctx.fillStyle = 'rgba(2, 4, 10, 0.72)';
        bctx.fillRect(shadowX, ty - 2, 7, Math.abs(dy) / steps + 18);

        bctx.drawImage(
          floorImg,
          sx,
          srcTopY,
          Math.max(6, grabW),
          srcCapH,
          tx0 - 2,
          ty - surfaceTopOffset,
          tw + 4,
          srcCapH
        );
      }
    }

    // 1B-1. 城郊竹林与护城古道自然墨韵苍苔野草收边（打破石砖顶沿直线机械切边！）
    if (!room.indoor && (room.bgKey === 'bg_bamboo_cliff' || room.bgKey === 'bg_gatehouse')) {
      bctx.save();
      for (let mx = 28; mx < room.pixelW - 28; mx += 34) {
        if (isInsideDownShaft(room, mx)) continue;
        if (wz && mx >= wz.x1 - 12 && mx <= wz.x2 + 12) continue;
        if (isStairSlopeAt(mx)) continue;
        const hSeed = Math.abs(Math.sin(mx * 0.137 + room.mapX * 1.7));
        if (hSeed < 0.34) continue;
        const gy = sampleSolidGroundY(room, mx);
        bctx.fillStyle = 'rgba(8, 22, 20, 0.72)';
        const blades = 2 + Math.floor(hSeed * 3);
        for (let b = 0; b < blades; b++) {
          const bx = mx + (b - 1) * 4.5;
          const bh = 6 + ((b + Math.floor(hSeed * 10)) % 3) * 3.2;
          const lean = (b - 1) * 3.2 + (hSeed - 0.5) * 4;
          bctx.beginPath();
          bctx.moveTo(bx - 1.8, gy + 2);
          bctx.quadraticCurveTo(bx + lean * 0.5, gy - bh * 0.6, bx + lean, gy - bh);
          bctx.quadraticCurveTo(bx + lean * 0.35 + 1.4, gy - bh * 0.45, bx + 1.8, gy + 2);
          bctx.closePath();
          bctx.fill();
        }
      }
      bctx.restore();
    }

    // 1B-2. 梨园戏台 / 书阁茶席专属朱漆雕木台面 (`style === 'palace_wood'`)
    const woodStageImg = Assets.get('env_indoor_ledge');
    if (woodStageImg) {
      const wsY = Math.floor(woodStageImg.height * 0.36);
      const wsH = Math.floor(woodStageImg.height * 0.36);
      const tileW = Math.min(240, Math.floor(woodStageImg.width * 0.76));
      const tileSrcX = Math.floor(woodStageImg.width * 0.12);
      for (let i = 0; i < room.groundNodes.length - 1; i++) {
        const a = room.groundNodes[i];
        const b = room.groundNodes[i + 1];
        if (a.style !== 'palace_wood' || Math.abs(a.y - b.y) > 4) continue;
        for (let wx = a.x; wx < b.x; wx += tileW) {
          const wClip = Math.min(tileW, b.x - wx);
          if (wClip <= 4) continue;
          const srcW = Math.max(8, Math.floor((wClip / tileW) * (woodStageImg.width * 0.76)));
          bctx.drawImage(woodStageImg, tileSrcX, wsY, srcW, wsH, wx, a.y - 5, wClip + 0.6, 30);
        }
      }
    }

    // 1C. 分区域专属手绘高低悬台与须弥石座 (`room.solidBlocks`)：
    // 城郊苍竹野径/地宫水牢采用青苔雕纹青石台 `env_stone_ledge`；皇城大殿采用雕栏红木阁 `env_indoor_ledge`；朱雀天街采用飞檐游廊 `env_pavilion`！
    if (room.solidBlocks && room.solidBlocks.length > 0) {
      const indoorLedgeImg = Assets.get('env_indoor_ledge');
      const pavilionImg = Assets.get('env_pavilion');
      const isWildBambooCliff = !room.indoor && room.bgKey === 'bg_bamboo_cliff';

      for (const sb of room.solidBlocks) {
        const groundAtMid = sampleSolidGroundY(room, sb.x + sb.w * 0.5);
        const isFloatingLedge = sb.y + sb.h < groundAtMid - 14 && sb.h <= 46 && !sb.blocking;

        if (isFloatingLedge) {
          if ((isStoneDungeon || isWildBambooCliff) && stoneLedgeImg) {
            drawThreeSlicePlatform(
              bctx,
              stoneLedgeImg,
              0,
              stoneLedgeImg.height,
              sb.x - 6,
              sb.y,
              sb.w + 12,
              68,
              0.34
            );
            continue;
          }

          if (usePalaceMarble || room.region === 'gatehouse') {
            const deckImg = (room.indoor ? indoorLedgeImg : pavilionImg) || indoorLedgeImg || pavilionImg;
            if (deckImg) {
              const srcH = deckImg === pavilionImg ? Math.floor(deckImg.height * 0.72) : deckImg.height;
              const topAlignRatio = deckImg === indoorLedgeImg ? 0.415 : 0.53;
              drawThreeSlicePlatform(
                bctx,
                deckImg,
                0,
                srcH,
                sb.x - 6,
                sb.y,
                sb.w + 12,
                deckImg === indoorLedgeImg ? 70 : 76,
                topAlignRatio
              );
              continue;
            }
          }
        }

        // 落地须弥石坛 / 能力锁高崖：挑檐压顶青石板 + 层叠凿石基座 + 左右半阶踏步
        const topDrawY = sb.y - surfaceTopOffset;
        const totalDrawH = sb.h + surfaceTopOffset;

        drawSoftGroundShadow(bctx, sb.x + sb.w * 0.5, sb.y + sb.h + 2, sb.w * 0.56, 8, 0.6);

        const bodyX = sb.x + 3;
        const bodyW = Math.max(16, sb.w - 6);
        const bodyTopY = topDrawY + Math.min(20, Math.floor(totalDrawH * 0.42));
        const bodyH = Math.max(0, topDrawY + totalDrawH - bodyTopY);
        if (bodyH > 2) {
          bctx.save();
          bctx.beginPath();
          bctx.rect(bodyX, bodyTopY, bodyW, bodyH);
          bctx.clip();
          for (let y = bodyTopY; y < bodyTopY + bodyH; y += subSrcH - 3) {
            for (let x = bodyX; x < bodyX + bodyW; x += sw) {
              const wClip = Math.min(sw, bodyX + bodyW - x);
              bctx.drawImage(floorImg, 0, subSrcY, wClip, subSrcH, x, y, wClip + 0.6, subSrcH);
            }
          }
          const shadeG = bctx.createLinearGradient(0, bodyTopY, 0, bodyTopY + bodyH);
          shadeG.addColorStop(0, 'rgba(4, 7, 14, 0.36)');
          shadeG.addColorStop(1, 'rgba(3, 5, 11, 0.65)');
          bctx.fillStyle = shadeG;
          bctx.fillRect(bodyX, bodyTopY, bodyW, bodyH);
          bctx.restore();
        }

        const capX = sb.x - 4;
        const capW = sb.w + 8;
        const capH = srcCapH;
        bctx.save();
        bctx.beginPath();
        bctx.rect(capX, topDrawY, capW, capH);
        bctx.clip();
        for (let x = capX; x < capX + capW; x += sw) {
          const wClip = Math.min(sw, capX + capW - x);
          bctx.drawImage(floorImg, 0, srcTopY, wClip, capH, x, topDrawY, wClip + 0.6, capH);
        }
        bctx.restore();

        const stepRise = groundAtMid - sb.y;
        if (!isFloatingLedge && !sb.blocking && stepRise >= 20 && stepRise <= 54) {
          const treadH = Math.min(22, Math.max(14, Math.floor(stepRise * 0.52)));
          const treadY = groundAtMid - treadH - surfaceTopOffset + 2;
          const treadW = 18;
          if (sb.x > 44) {
            bctx.drawImage(floorImg, 12, srcTopY, treadW, treadH, sb.x - treadW + 2, treadY, treadW, treadH);
          }
          if (sb.x + sb.w < room.pixelW - 44) {
            bctx.drawImage(floorImg, 36, srcTopY, treadW, treadH, sb.x + sb.w - 2, treadY, treadW, treadH);
          }
        }
      }
    }
  }

  // 2. 护城河 / 御河天街 / 飞虹桥段：严格共用 `getArchBridgeGeometry(room)` 物理几何单一事实源，桥面与角色脚底 0.0px 严丝合缝！
  const bridgeGeo = getArchBridgeGeometry(room);
  if (bridgeGeo && bridgeImg) {
    const harmonizedBridge = getHarmonizedSprite('env_bridge', bridgeImg, room, 0.42);
    bctx.drawImage(
      harmonizedBridge,
      bridgeGeo.drawX,
      bridgeGeo.drawTopY,
      bridgeGeo.drawW,
      bridgeGeo.drawH
    );
  }

  // 3. 顶棚藻井石拱与宫殿暗梁
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

    // 顶棚与两侧山墙转角处嵌装斗拱雀替挑梁，形成严丝合缝的殿顶梁架结构
    if (corbelImg && room.indoor && cw >= 240) {
      const cbW = 68;
      const cbH = cbW * (corbelImg.height / corbelImg.width);
      if (cs.x1 <= 8) {
        drawWallCorbel(bctx, corbelImg, 'left', 34, cs.bottomY - 2, cbW, cbH, 0.72);
      }
      if (cs.x2 >= room.pixelW - 8) {
        drawWallCorbel(bctx, corbelImg, 'right', room.pixelW - 34, cs.bottomY - 2, cbW, cbH, 0.72);
      }
    }
  }

  // 4. 厚重城墙剖面边界 + 手绘穿堂石券飞檐门楼框 (`arch_side_doorframe`)
  const bakeSideWallAndDoors = (side: 'left' | 'right') => {
    const doors = getRoomSideDoors(room, side).sort((a, b) => a.floorY - b.floorY);
    const wallW = 40;
    const wx = side === 'left' ? 0 : room.pixelW - wallW;
    const groundAtSide = sampleSolidGroundY(room, side === 'left' ? 14 : room.pixelW - 14);

    const drawSolidWallSegment = (y1: number, y2: number) => {
      if (y2 - y1 <= 6) return;
      bctx.fillStyle = '#060912';
      bctx.fillRect(wx, y1, wallW, y2 - y1);
      if (slabImg) {
        const mY = Math.floor(slabImg.height * 0.42);
        const mH = Math.max(24, slabImg.height - mY - 2);
        for (let y = y1; y < y2; y += mH - 3) {
          const hClip = Math.min(mH, y2 - y);
          bctx.drawImage(slabImg, 12, mY, wallW, hClip, wx, y, wallW, hClip);
        }
      }
      const wg = bctx.createLinearGradient(
        side === 'left' ? 0 : room.pixelW,
        0,
        side === 'left' ? wallW + 18 : room.pixelW - wallW - 18,
        0
      );
      wg.addColorStop(0, 'rgba(3, 5, 11, 0.76)');
      wg.addColorStop(0.7, 'rgba(5, 8, 16, 0.42)');
      wg.addColorStop(1, 'rgba(5, 8, 16, 0)');
      bctx.fillStyle = wg;
      bctx.fillRect(side === 'left' ? 0 : room.pixelW - wallW - 18, y1, wallW + 18, y2 - y1);
    };

    if (doors.length === 0) {
      if (room.indoor) {
        drawSolidWallSegment(0, room.pixelH);
      } else if (room.gridH > 1) {
        drawSolidWallSegment(220, room.pixelH);
      }
      return;
    }

    let cursorY = room.indoor ? 0 : Math.max(0, doors[0].floorY - 172);
    for (const d of doors) {
      const isSecretLocked = Boolean(
        d.secretWallId && !brokenSecretWalls.includes(d.secretWallId)
      );
      if (isSecretLocked) {
        // 未破开的隐藏密室暗门保持完整厚重石墙外观，不提前泄露门楼框
        if (room.indoor || room.gridH > 1) {
          drawSolidWallSegment(cursorY, d.floorY + 8);
        }
        cursorY = d.floorY + 8;
        continue;
      }

      const doorTop = d.floorY - 132;
      if (room.indoor || room.gridH > 1) {
        drawSolidWallSegment(cursorY, doorTop + 12);
      }

      // 穿堂门洞暖色引路灯晕
      const dg = bctx.createLinearGradient(
        side === 'left' ? 0 : room.pixelW,
        0,
        side === 'left' ? 76 : room.pixelW - 76,
        0
      );
      dg.addColorStop(0, 'rgba(251, 191, 36, 0.24)');
      dg.addColorStop(1, 'rgba(0, 0, 0, 0)');
      bctx.fillStyle = dg;
      bctx.fillRect(side === 'left' ? 0 : room.pixelW - 76, doorTop, 76, 132);

      // 嵌装手绘穿堂石券门楼框：
      // 1) 破壁密室暗门 (`d.secretWallId`) 交由 `prop_secret_arch` 独立绘制，绝不叠画两层门贴图；
      // 2) 露天双层广场 (`!room.indoor && room.gridH > 1`) 底层街道豁口敞开通透，仅在室内或二层城垣门洞嵌装门框！
      const shouldDrawDoorFrame =
        Boolean(doorFrameImg) &&
        !d.secretWallId &&
        (room.indoor || (room.gridH > 1 && d.floorY < groundAtSide - 80));
      if (shouldDrawDoorFrame && doorFrameImg) {
        const dfH = 162;
        const dfW = doorFrameImg.width * (dfH / doorFrameImg.height);
        bctx.save();
        if (side === 'right') {
          bctx.drawImage(doorFrameImg, room.pixelW - dfW + 4, d.floorY - dfH + 6, dfW, dfH);
        } else {
          bctx.translate(dfW - 4, d.floorY - dfH + 6);
          bctx.scale(-1, 1);
          bctx.drawImage(doorFrameImg, 0, 0, dfW, dfH);
        }
        bctx.restore();
      }

      cursorY = d.floorY + 6;
    }
    if ((room.indoor || room.gridH > 1) && cursorY < groundAtSide) {
      drawSolidWallSegment(cursorY, room.pixelH);
    }
  };
  bakeSideWallAndDoors('left');
  bakeSideWallAndDoors('right');

  // 5. 蹬墙古武石壁井道（上下与顶棚、地面无缝衔接收口！）
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
      if (stonePillarImg) {
        drawSlicedColumn(bctx, stonePillarImg, cw.x, cw.topY - 4, cw.bottomY, 42, 0.08, true);
      }
      if (cw.bottomY < sampleSolidGroundY(room, cw.x) - 24) {
        if (stoneLedgeImg) {
          bctx.drawImage(
            stoneLedgeImg,
            0,
            0,
            Math.min(180, stoneLedgeImg.width),
            stoneLedgeImg.height,
            cw.x - 26,
            cw.bottomY - 12,
            52,
            14
          );
        }
        if (corbelImg) {
          const cbW = 30;
          const cbH = cbW * (corbelImg.height / corbelImg.width);
          drawWallCorbel(bctx, corbelImg, 'left', cw.x + 17, cw.topY + 4, cbW, cbH, 0.78);
          drawWallCorbel(bctx, corbelImg, 'right', cw.x - 17, cw.topY + 4, cbW, cbH, 0.78);
        }
      }
    }
  }

  // 5B. 寒潭水渠 / 熔金火池自然凿石驳岸收边（同源染色融入暗部，消除生硬几何水池切口！）
  if (stoneLedgeImg && room.waterZones.length > 0 && !isArchBridgeRoom) {
    const hmCurb = getHarmonizedSprite('env_stone_ledge', stoneLedgeImg, room, 0.48);
    const capW = Math.floor(stoneLedgeImg.width * 0.22);
    const capH = stoneLedgeImg.height;
    for (const z of room.waterZones) {
      if (z.x1 > 20) {
        bctx.drawImage(hmCurb, 0, 0, capW, capH, z.x1 - 20, z.surfaceY - 8, 32, 48);
      }
      if (z.x2 < room.pixelW - 20) {
        bctx.drawImage(
          hmCurb,
          stoneLedgeImg.width - capW,
          0,
          capW,
          capH,
          z.x2 - 12,
          z.surfaceY - 8,
          32,
          48
        );
      }
    }
  }

  // 6. 区域同源环境光材质调色烘焙 (`source-atop`)：让砖石、木柱、悬台色温与所属区域画卷浑然一体！
  bctx.save();
  bctx.globalCompositeOperation = 'source-atop';
  if (room.realm === 'inverted') {
    bctx.fillStyle = 'rgba(76, 15, 38, 0.22)';
    bctx.fillRect(0, 0, room.pixelW, room.pixelH);
  } else if (
    room.region === 'catacomb' ||
    room.region === 'nether' ||
    room.bgKey === 'bg_catacomb_tomb' ||
    room.bgKey === 'bg_nether_abyss'
  ) {
    bctx.fillStyle = 'rgba(20, 56, 52, 0.28)';
    bctx.fillRect(0, 0, room.pixelW, room.pixelH);
  } else if (room.region === 'shipyard' || room.bgKey === 'bg_sunken_shipyard' || room.bgKey === 'bg_moat_sluice') {
    bctx.fillStyle = 'rgba(18, 46, 52, 0.26)';
    bctx.fillRect(0, 0, room.pixelW, room.pixelH);
  } else if (room.bgKey === 'bg_gatehouse_interior' || room.bgKey === 'bg_city_avenue') {
    // 皇城端门大殿 & 正阳朱雀天街：暖朱檀金皇家门阙色温，彻底告别阴冷地牢石色！
    bctx.fillStyle = 'rgba(78, 44, 24, 0.17)';
    bctx.fillRect(0, 0, room.pixelW, room.pixelH);
  } else if (room.bgKey === 'bg_bamboo_cliff' || (room.bgKey === 'bg_gatehouse' && !room.indoor)) {
    // 城郊苍竹寒崖 & 护城古桥：夜雨寒青墨韵色温
    bctx.fillStyle = 'rgba(14, 30, 42, 0.18)';
    bctx.fillRect(0, 0, room.pixelW, room.pixelH);
  } else if (room.region === 'alchemy') {
    bctx.fillStyle = 'rgba(58, 34, 72, 0.18)';
    bctx.fillRect(0, 0, room.pixelW, room.pixelH);
  } else if (room.region === 'altar') {
    bctx.fillStyle = 'rgba(82, 24, 34, 0.16)';
    bctx.fillRect(0, 0, room.pixelW, room.pixelH);
  } else if (room.region === 'prison') {
    bctx.fillStyle = 'rgba(14, 58, 68, 0.22)';
    bctx.fillRect(0, 0, room.pixelW, room.pixelH);
  } else if (room.region === 'forge') {
    bctx.fillStyle = 'rgba(92, 34, 12, 0.24)';
    bctx.fillRect(0, 0, room.pixelW, room.pixelH);
  } else if (room.region === 'opera' || room.region === 'library' || room.region === 'main_hall') {
    bctx.fillStyle = 'rgba(78, 48, 22, 0.16)';
    bctx.fillRect(0, 0, room.pixelW, room.pixelH);
  }

  // 底部地脉浓墨收口晕染：让画面最下沿石砖自然沉入水墨深渊，告别贴边瓷砖切割感
  const botInkTop = Math.max(0, room.pixelH - 58);
  const botInkG = bctx.createLinearGradient(0, botInkTop, 0, room.pixelH);
  botInkG.addColorStop(0, 'rgba(2, 4, 9, 0)');
  botInkG.addColorStop(1, 'rgba(2, 4, 9, 0.86)');
  bctx.fillStyle = botInkG;
  bctx.fillRect(0, botInkTop, room.pixelW, room.pixelH - botInkTop);
  bctx.restore();
}

/**
 * 计算钟塔旋转青铜齿轮踏板与各区域悬索摆渡飞阁 / 配重升降机 (`movingPlatforms`) 的实时坐标与速度
 */
export function getClockGearOrbitPlatforms(
  room: BuiltRoom,
  t: number
): { x: number; y: number; w: number; vx: number; vy: number; style?: string }[] {
  const list: { x: number; y: number; w: number; vx: number; vy: number; style?: string }[] = [];
  if (room.clockGears) {
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
        list.push({ x: cx - pw * 0.5, y: cy, w: pw, vx, vy, style: 'gear' });
      }
    }
  }
  if (room.movingPlatforms) {
    for (const mp of room.movingPlatforms) {
      const ph = mp.phase || 0;
      const ang = t * mp.speed + ph;
      const u = 0.5 - 0.5 * Math.cos(ang);
      const du = 0.5 * mp.speed * Math.sin(ang);
      const x = mp.x1 + (mp.x2 - mp.x1) * u;
      const y = mp.y1 + (mp.y2 - mp.y1) * u;
      const vx = (mp.x2 - mp.x1) * du;
      const vy = (mp.y2 - mp.y1) * du;
      list.push({ x, y, w: mp.w, vx, vy, style: mp.style || 'wood_ferry' });
    }
  }
  return list;
}

/**
 * 绘制全十类手绘中景陈设（全部经由 `getHarmonizedSprite` 注入同源环境光色温与底部接地 AO，搭配羽化软阴影，彻底消灭剪纸贴图感！）
 */
export function drawCastleInteriorPropsAndGears(
  ctx: CanvasRenderingContext2D,
  room: BuiltRoom,
  t: number
): void {
  if (room.decorProps) {
    const shelfImg = Assets.get('prop_bookshelf');
    const chanImg = Assets.get('prop_chandelier');
    const brazierImg = Assets.get('prop_dragon_brazier');
    const bannerImg = Assets.get('prop_silk_banner');
    const rackImg = Assets.get('prop_weapon_rack');
    const statueImg = Assets.get('prop_guardian_statue');
    const pillarImg = Assets.get('prop_coiled_pillar');
    const burnerImg = Assets.get('prop_incense_burner');
    const bellImg = Assets.get('prop_giant_bell');
    const chainImg = Assets.get('arch_iron_chain');

    for (const dp of room.decorProps) {
      const sc = dp.scale ?? 1;

      if (dp.kind === 'coiled_pillar' && pillarImg) {
        const h = 340 * sc;
        const w = pillarImg.width * (h / pillarImg.height);
        drawSoftGroundShadow(ctx, dp.x, dp.y + 3, w * 0.52, 8.5, 0.58);
        const hm = getHarmonizedSprite('prop_coiled_pillar', pillarImg, room, 0.48);
        ctx.drawImage(hm, dp.x - w * 0.5, dp.y - h + 6, w, h);
      } else if (dp.kind === 'silk_banner' && bannerImg) {
        const sway = Math.sin(t * 1.9 + dp.x * 0.015) * 0.025;
        const h = 215 * sc;
        const w = bannerImg.width * (h / bannerImg.height);
        const rawTopY = dp.y - h;
        const ceilY = sampleCeilingY(room, dp.x, false);
        const topY =
          room.indoor && ceilY > 0 && rawTopY - ceilY < 75 ? ceilY - 2 : rawTopY;
        if (room.indoor && chainImg && ceilY > 0 && topY > ceilY + 6 && topY - ceilY < 260) {
          drawSuspensionChain(ctx, chainImg, dp.x, ceilY - 2, topY + 6, 12, 0.78);
        }
        const hm = getHarmonizedSprite('prop_silk_banner', bannerImg, room, 0.22);
        ctx.save();
        ctx.translate(dp.x, topY);
        ctx.rotate(sway);
        ctx.drawImage(hm, -w * 0.5, 0, w, h);
        ctx.restore();
      } else if (dp.kind === 'bookshelf' && shelfImg) {
        const h = 248 * sc;
        const w = shelfImg.width * (h / shelfImg.height);
        drawSoftGroundShadow(ctx, dp.x, dp.y + 2, w * 0.56, 8, 0.58);
        const hm = getHarmonizedSprite('prop_bookshelf', shelfImg, room, 0.46);
        ctx.drawImage(hm, dp.x - w * 0.5, dp.y - h + 4, w, h);
      } else if (dp.kind === 'giant_bell' && bellImg) {
        const sway = Math.sin(t * 1.1 + dp.x * 0.01) * 0.022;
        const h = 210 * sc;
        const w = bellImg.width * (h / bellImg.height);
        const ceilY = Math.max(24, sampleCeilingY(room, dp.x, false));
        if (chainImg && dp.y - h > ceilY) {
          drawSuspensionChain(ctx, chainImg, dp.x, ceilY - 2, dp.y - h + 18, 22, 0.9);
        }
        const hm = getHarmonizedSprite('prop_giant_bell', bellImg, room, 0.25);
        ctx.save();
        ctx.translate(dp.x, dp.y - h);
        ctx.rotate(sway);
        ctx.drawImage(hm, -w * 0.5, 0, w, h);
        ctx.restore();
      } else if (dp.kind === 'guardian_statue' && statueImg) {
        const h = 152 * sc;
        const w = statueImg.width * (h / statueImg.height);
        drawSoftGroundShadow(ctx, dp.x, dp.y + 2, w * 0.54, 7.5, 0.58);
        const hm = getHarmonizedSprite('prop_guardian_statue', statueImg, room, 0.52);
        ctx.drawImage(hm, dp.x - w * 0.5, dp.y - h + 4, w, h);
      } else if (dp.kind === 'weapon_rack' && rackImg) {
        const h = 144 * sc;
        const w = rackImg.width * (h / rackImg.height);
        drawSoftGroundShadow(ctx, dp.x, dp.y + 2, w * 0.54, 7, 0.54);
        const hm = getHarmonizedSprite('prop_weapon_rack', rackImg, room, 0.48);
        ctx.drawImage(hm, dp.x - w * 0.5, dp.y - h + 4, w, h);
      } else if (dp.kind === 'incense_burner' && burnerImg) {
        const h = 148 * sc;
        const w = burnerImg.width * (h / burnerImg.height);
        drawSoftGroundShadow(ctx, dp.x, dp.y + 2, w * 0.54, 7.5, 0.58);
        const hm = getHarmonizedSprite('prop_incense_burner', burnerImg, room, 0.48);
        ctx.drawImage(hm, dp.x - w * 0.5, dp.y - h + 4, w, h);

        // 仙鹤炉膛暖金火光 + 袅袅升腾的瑞脑金烟
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const ig = ctx.createRadialGradient(dp.x, dp.y - h * 0.52, 4, dp.x, dp.y - h * 0.52, 105);
        ig.addColorStop(0, 'rgba(251, 191, 36, 0.24)');
        ig.addColorStop(0.55, 'rgba(245, 158, 11, 0.08)');
        ig.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = ig;
        ctx.beginPath();
        ctx.arc(dp.x, dp.y - h * 0.52, 105, 0, Math.PI * 2);
        ctx.fill();

        for (let k = 0; k < 3; k++) {
          const rise = ((t * 22 + k * 28) % 84);
          const sx = dp.x + Math.sin(t * 2.2 + k * 1.7 + rise * 0.05) * (6 + rise * 0.12);
          const sy = dp.y - h * 0.72 - rise;
          const a = (1 - rise / 84) * 0.18;
          ctx.fillStyle = `rgba(253, 230, 138, ${a})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 4 + rise * 0.08, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (dp.kind === 'dragon_brazier' && brazierImg) {
        const h = 124 * sc;
        const w = brazierImg.width * (h / brazierImg.height);
        drawSoftGroundShadow(ctx, dp.x, dp.y + 2, w * 0.56, 7.5, 0.6);
        const hm = getHarmonizedSprite('prop_dragon_brazier', brazierImg, room, 0.44);
        ctx.drawImage(hm, dp.x - w * 0.5, dp.y - h + 4, w, h);

        // 熊熊跃动的赤金炭火暖光池
        const flick = Math.sin(t * 11 + dp.x * 0.1) * 7;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const fg = ctx.createRadialGradient(
          dp.x,
          dp.y - h * 0.64,
          6,
          dp.x,
          dp.y - h * 0.54,
          152 + flick
        );
        fg.addColorStop(0, 'rgba(254, 215, 130, 0.32)');
        fg.addColorStop(0.42, 'rgba(249, 115, 22, 0.16)');
        fg.addColorStop(0.75, 'rgba(220, 38, 38, 0.06)');
        fg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.arc(dp.x, dp.y - h * 0.54, 160, 0, Math.PI * 2);
        ctx.fill();

        // 升腾的赤金火星微粒
        for (let sp = 0; sp < 3; sp++) {
          const prog = ((t * 36 + sp * 24 + dp.x) % 72) / 72;
          const sx = dp.x + Math.sin(t * 4 + sp * 2.1) * 14 * prog;
          const sy = dp.y - h * 0.76 - prog * 64;
          ctx.fillStyle = `rgba(253, 224, 71, ${(1 - prog) * 0.7})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.7 * (1 - prog * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (dp.kind === 'chandelier' && chanImg) {
        const sway = Math.sin(t * 1.6 + dp.x * 0.02) * 0.035;
        const h = 186 * sc;
        const w = chanImg.width * (h / chanImg.height);
        const ceilY = sampleCeilingY(room, dp.x, false);
        const hangY = room.indoor && ceilY > 0 ? ceilY - 4 : dp.y;
        const hm = getHarmonizedSprite('prop_chandelier', chanImg, room, 0.18);
        ctx.save();
        ctx.translate(dp.x, hangY);
        ctx.rotate(sway);
        ctx.drawImage(hm, -w * 0.5, 0, w, h);

        ctx.globalCompositeOperation = 'lighter';
        const cg = ctx.createRadialGradient(0, h * 0.72, 4, 0, h * 0.72, 135);
        cg.addColorStop(0, 'rgba(251, 191, 36, 0.28)');
        cg.addColorStop(0.55, 'rgba(245, 158, 11, 0.1)');
        cg.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(0, h * 0.72, 135, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  // 旋转青铜八卦巨齿轮与摆渡飞阁 / 配重升降机踏台（全部配备藻井玄铁吊链与轴座锚定，零悬空感！）
  if (room.clockGears || room.movingPlatforms) {
    const isStoneDungeon = isStoneFortressOrDungeon(room);
    const gearImg = Assets.get('prop_clock_gear');
    const stoneLedgeImg = Assets.get('env_stone_ledge');
    const ledgeImg = Assets.get('env_indoor_ledge') || Assets.get('env_pavilion');
    const pavImg = Assets.get('env_pavilion') || ledgeImg;
    const chainImg = Assets.get('arch_iron_chain');

    if (room.movingPlatforms) {
      ctx.save();
      for (const mp of room.movingPlatforms) {
        const ax = mp.x1 + mp.w * 0.5;
        const ay = mp.y1 + 6;
        const bx = mp.x2 + mp.w * 0.5;
        const by = mp.y2 + 6;

        if (chainImg && room.indoor) {
          const ceilA = Math.max(28, sampleCeilingY(room, ax, false));
          const ceilB = Math.max(28, sampleCeilingY(room, bx, false));
          if (Math.abs(ax - bx) > 24) {
            if (ay - ceilA <= 380) drawSuspensionChain(ctx, chainImg, ax, ceilA - 2, ay, 14, 0.72);
            if (by - ceilB <= 380) drawSuspensionChain(ctx, chainImg, bx, ceilB - 2, by, 14, 0.72);
          } else {
            const topPulleyY = Math.min(ay, by);
            if (topPulleyY - ceilA <= 420) {
              drawSuspensionChain(ctx, chainImg, ax, ceilA - 2, topPulleyY, 16, 0.8);
            }
          }
        }

        drawPaintedChainTrack(ctx, ax, ay, bx, by, 9, 0.54, '#c69a45');

        if (gearImg) {
          for (const [px, py, dir] of [
            [ax, ay, 1],
            [bx, by, -1],
          ] as const) {
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(t * 0.9 * dir);
            ctx.globalAlpha = 0.86;
            ctx.drawImage(gearImg, -9, -9, 18, 18);
            ctx.restore();
          }
        }
      }
      ctx.restore();
    }

    if (gearImg && room.clockGears) {
      for (const g of room.clockGears) {
        if (chainImg && room.indoor) {
          const ceilG = Math.max(28, sampleCeilingY(room, g.x, false));
          if (g.y - ceilG > 24 && g.y - ceilG <= 440) {
            drawSuspensionChain(ctx, chainImg, g.x, ceilG - 2, g.y, 18, 0.76);
          }
        }
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(t * g.speed);
        ctx.globalAlpha = g.hasOrbitPlatforms ? 0.94 : 0.76;
        ctx.drawImage(gearImg, -g.radius, -g.radius, g.radius * 2, g.radius * 2);
        ctx.restore();
      }
    }

    const orbitPlats = getClockGearOrbitPlatforms(room, t);
    for (const op of orbitPlats) {
      if (op.style === 'gear') {
        const src = isStoneDungeon && stoneLedgeImg ? stoneLedgeImg : ledgeImg;
        if (src) {
          const sy = Math.floor(src.height * (src === stoneLedgeImg ? 0.26 : 0.36));
          const sh = Math.floor(src.height * 0.32);
          ctx.drawImage(src, 12, sy, src.width - 24, sh, op.x, op.y - 4, op.w, 22);
        }
      } else {
        if (op.style === 'bronze_lift' && chainImg && room.indoor) {
          const cx = op.x + op.w * 0.5;
          const ceilY = Math.max(28, sampleCeilingY(room, cx, false));
          if (op.y - ceilY <= 440) {
            drawSuspensionChain(ctx, chainImg, cx, ceilY - 2, op.y + 4, 15, 0.85);
          }
        }

        if (isStoneDungeon && stoneLedgeImg) {
          const hm = getHarmonizedSprite('env_stone_ledge', stoneLedgeImg, room, 0.28);
          drawThreeSlicePlatform(
            ctx,
            hm,
            0,
            stoneLedgeImg.height,
            op.x - 6,
            op.y,
            op.w + 12,
            62,
            0.34
          );
        } else {
          const deckImg = op.style === 'wood_ferry' ? pavImg : ledgeImg;
          if (deckImg) {
            const hm = getHarmonizedSprite(
              deckImg === pavImg ? 'env_pavilion' : 'env_indoor_ledge',
              deckImg,
              room,
              0.26
            );
            const srcH = deckImg === pavImg ? Math.floor(deckImg.height * 0.72) : deckImg.height;
            const topAlign = deckImg === ledgeImg ? 0.415 : 0.53;
            drawThreeSlicePlatform(
              ctx,
              hm,
              0,
              srcH,
              op.x - 6,
              op.y,
              op.w + 12,
              deckImg === ledgeImg ? 64 : 68,
              topAlign
            );
          }
        }
      }
    }
  }
}

/**
 * 绘制平台：分区域匹配青苔雕石悬台 `env_stone_ledge`、室内雕栏红木飞阁 `env_indoor_ledge` 或室外飞檐游廊 `env_pavilion`
 * （统一注入同源环境光染色，室内大殿 100% 采用檀木飞阁，彻底消除异质贴图感！）
 */
export function drawOrthographicPavilion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  hasPillars: boolean,
  room: BuiltRoom
): void {
  const isStoneDungeon = isStoneFortressOrDungeon(room);
  const stoneLedgeImg = Assets.get('env_stone_ledge');
  const pvImg = Assets.get('env_pavilion');
  const indoorImg = Assets.get('env_indoor_ledge');
  const groundHere = sampleSolidGroundY(room, x + w * 0.5);

  // 竖井井口平齐踏板（严丝合缝嵌平井沿）
  if (!hasPillars && Math.abs(y - groundHere) < 18) {
    const rawSrc = (isStoneDungeon ? stoneLedgeImg : indoorImg) || indoorImg || pvImg;
    if (rawSrc) {
      const hm = getHarmonizedSprite(
        rawSrc === stoneLedgeImg ? 'env_stone_ledge' : 'env_indoor_ledge',
        rawSrc,
        room,
        0.22
      );
      const sy = Math.floor(rawSrc.height * (rawSrc === stoneLedgeImg ? 0.28 : 0.38));
      const sh = Math.floor(rawSrc.height * 0.16);
      drawThreeSlicePlatform(ctx, hm, sy, sh, x, y, w, 14, 0.12);
    }
    return;
  }

  // 地宫 / 水牢 / 熔炉：统一使用三段式等比例青苔雕纹石台！
  if (isStoneDungeon && stoneLedgeImg) {
    const hm = getHarmonizedSprite('env_stone_ledge', stoneLedgeImg, room, 0.28);
    drawThreeSlicePlatform(ctx, hm, 0, stoneLedgeImg.height, x - 6, y, w + 12, 70, 0.34);
    return;
  }

  // 所有非地宫室内大殿（无论是否带立柱）：统一使用朱檀雕栏阁台 `env_indoor_ledge`，绝不混入室外青石绿亭！
  if (room.indoor && indoorImg) {
    const hm = getHarmonizedSprite('env_indoor_ledge', indoorImg, room, 0.28);
    drawThreeSlicePlatform(ctx, hm, 0, indoorImg.height, x - 5, y, w + 10, 72, 0.415);
    return;
  }

  if (!pvImg) return;
  const hm = getHarmonizedSprite('env_pavilion', pvImg, room, 0.28);
  const srcH = Math.floor(pvImg.height * 0.72);
  drawThreeSlicePlatform(ctx, hm, 0, srcH, x - 8, y, w + 16, 78, 0.53);
}

export function drawOrthographicStoneArchway(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  _title: string | undefined,
  _t: number,
  room?: BuiltRoom
): void {
  const archImg = Assets.get('prop_stone_arch');
  if (!archImg) return;
  const h = 248;
  const w = archImg.width * (h / archImg.height);

  drawSoftGroundShadow(ctx, cx, groundY + 3, w * 0.52, 8.5, 0.6);
  const hm = getHarmonizedSprite('prop_stone_arch', archImg, room, 0.52);
  ctx.drawImage(hm, cx - w * 0.5, groundY - h + 6, w, h);
}

export function drawOrthographicSaveShrine(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  _t: number,
  room?: BuiltRoom
): void {
  const halo = ctx.createRadialGradient(cx, groundY - 68, 10, cx, groundY - 68, 175);
  halo.addColorStop(0, 'rgba(251, 191, 36, 0.34)');
  halo.addColorStop(0.55, 'rgba(217, 119, 6, 0.12)');
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, groundY - 68, 175, 0, Math.PI * 2);
  ctx.fill();

  const shrineImg = Assets.get('prop_shrine');
  if (!shrineImg) return;
  const sh = 168;
  const sw = shrineImg.width * (sh / shrineImg.height);

  drawSoftGroundShadow(ctx, cx, groundY + 3, sw * 0.56, 9, 0.64);
  const hm = getHarmonizedSprite('prop_shrine', shrineImg, room, 0.48);
  ctx.drawImage(hm, cx - sw * 0.5, groundY - sh + 5, sw, sh);
}

export function drawHangingSilkLantern(
  ctx: CanvasRenderingContext2D,
  x: number,
  topAnchorY: number,
  t: number,
  scale = 1,
  room?: BuiltRoom
): void {
  const lanternImg = Assets.get('prop_lantern');
  if (!lanternImg) return;

  // 1) 室内藻井吊链 或 室外古法挑臂木灯杆 / 飞檐夜雾悬索（彻底杜绝将宫殿红柱压扁成 15px 牙签串灯笼！）
  if (room) {
    const chainImg = Assets.get('arch_iron_chain');
    const ceilY = sampleCeilingY(room, x, false);
    if (chainImg && ceilY > -20 && topAnchorY - ceilY <= 380) {
      drawSuspensionChain(ctx, chainImg, x, ceilY - 2, topAnchorY + 6, 12, 0.78);
    } else if (!room.indoor) {
      const woodPoleImg = Assets.get('prop_wooden_lamp_pole');
      const lampCenterY = topAnchorY + 26 * scale;
      const baseY = sampleSupportBaseY(room, x, lampCenterY + 12);
      const mainGroundY = sampleSolidGroundY(room, x);
      const onMainGround = Math.abs(baseY - mainGroundY) < 6;
      const distToBase = baseY - lampCenterY;
      const onBridgeOrWater =
        isArchBridgeSpanAt(room, x) ||
        room.waterZones.some((wz) => x >= wz.x1 - 24 && x <= wz.x2 + 24);
      const onElevatedBlockOrPavilion =
        room.pavilions.some((pv) => x >= pv.x - 28 && x <= pv.x + pv.w + 28) ||
        Boolean(room.solidBlocks?.some((sb) => x >= sb.x - 28 && x <= sb.x + sb.w + 28));
      const groundFlat =
        Math.abs(sampleSolidGroundY(room, x - 38) - sampleSolidGroundY(room, x + 38)) < 8;

      if (
        woodPoleImg &&
        onMainGround &&
        !isInsideDownShaft(room, x) &&
        !onBridgeOrWater &&
        !onElevatedBlockOrPavilion &&
        groundFlat &&
        distToBase >= 105 &&
        distToBase <= 245
      ) {
        // 使用纯手绘挑臂木灯杆（夹杆石底座生根落地，龙头横挑红绸灯笼正对钩锁锚点！）
        const postH = distToBase / 0.755;
        const postW = postH * (woodPoleImg.width / woodPoleImg.height);
        const faceLeft = x > room.pixelW * 0.55;
        const poleShaftOffset = postW * (0.765 - 0.305);
        const shaftGroundX = faceLeft ? x + poleShaftOffset : x - poleShaftOffset;

        drawSoftGroundShadow(ctx, shaftGroundX, baseY + 2, postW * 0.38, 6.5, 0.58);
        const hmPole = getHarmonizedSprite('prop_wooden_lamp_pole', woodPoleImg, room, 0.46);
        ctx.save();
        if (faceLeft) {
          ctx.translate(x + postW * 0.765, baseY - postH + 4);
          ctx.scale(-1, 1);
          ctx.drawImage(hmPole, 0, 0, postW, postH);
        } else {
          ctx.drawImage(hmPole, x - postW * 0.765, baseY - postH + 4, postW, postH);
        }
        ctx.restore();
        return;
      }

      // 超高飞燕钩锁宫灯或拱桥/深涧上空悬灯：以水墨细索向上隐入夜幕竹梢/飞檐，绝不在桥栏上插石柱！
      const cordTop = Math.max(0, topAnchorY - 125);
      if (topAnchorY - cordTop > 14) {
        ctx.save();
        const cg = ctx.createLinearGradient(x, cordTop, x, topAnchorY + 4);
        cg.addColorStop(0, 'rgba(10, 15, 24, 0)');
        cg.addColorStop(0.45, 'rgba(15, 21, 32, 0.55)');
        cg.addColorStop(1, 'rgba(24, 30, 42, 0.88)');
        ctx.strokeStyle = cg;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(x, cordTop);
        ctx.lineTo(x, topAnchorY + 4);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

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
  groundY: number,
  t: number,
  idx = 0,
  room?: BuiltRoom
): void {
  const distToGround = groundY - lampY;
  const stonePostImg = Assets.get('prop_stone_lantern_post');
  const urnImg = Assets.get('prop_breakable_urn');

  // 走廊/石阶/古祠贴地可破坏陈设物（青石宫灯立柱 与 青瓷封酒瓮+铜烛台 交替坐落于地面！）
  if (distToGround <= 135 && !isNaN(groundY) && groundY < 2000) {
    const useUrn = idx % 2 === 1 && Boolean(urnImg);
    if (useUrn && urnImg) {
      const h = 56;
      const w = urnImg.width * (h / urnImg.height);
      drawSoftGroundShadow(ctx, x, groundY + 2, w * 0.52, 5.8, 0.56);

      const hmUrn = getHarmonizedSprite('prop_breakable_urn', urnImg, room, 0.46);
      ctx.drawImage(hmUrn, x - w * 0.5, groundY - h + 3, w, h);

      const flick = Math.sin(t * 11 + x) * 3;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const cg = ctx.createRadialGradient(x + w * 0.28, groundY - h * 0.65, 2, x + w * 0.28, groundY - h * 0.65, 66 + flick);
      cg.addColorStop(0, 'rgba(254, 240, 138, 0.32)');
      cg.addColorStop(0.55, 'rgba(251, 146, 60, 0.12)');
      cg.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(x + w * 0.28, groundY - h * 0.65, 68, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    if (stonePostImg) {
      const h = 112;
      const w = stonePostImg.width * (h / stonePostImg.height);
      drawSoftGroundShadow(ctx, x, groundY + 2, w * 0.5, 6.2, 0.58);

      const hmPost = getHarmonizedSprite('prop_stone_lantern_post', stonePostImg, room, 0.48);
      ctx.drawImage(hmPost, x - w * 0.5, groundY - h + 3, w, h);

      const flick = Math.sin(t * 9 + x) * 4;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const lg = ctx.createRadialGradient(x, groundY - h * 0.68, 3, x, groundY - h * 0.68, 102 + flick);
      lg.addColorStop(0, 'rgba(254, 215, 170, 0.3)');
      lg.addColorStop(0.55, 'rgba(234, 88, 12, 0.11)');
      lg.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.arc(x, groundY - h * 0.68, 106, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
  }

  // 高处悬吊宫灯：补齐顶棚吊索连接
  const flick = Math.sin(t * 9 + x) * 4;
  const g = ctx.createRadialGradient(x, lampY + 18, 3, x, lampY + 18, 118 + flick);
  g.addColorStop(0, 'rgba(251, 146, 60, 0.3)');
  g.addColorStop(0.55, 'rgba(220, 38, 38, 0.1)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, lampY + 18, 122, 0, Math.PI * 2);
  ctx.fill();

  drawHangingSilkLantern(ctx, x, lampY - 8, t, 0.94, room);
}
