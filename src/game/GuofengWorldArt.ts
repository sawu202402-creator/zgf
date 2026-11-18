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
  const isHeavy = archetype === 'greatsword';
  const img = Assets.get(isHeavy ? 'part_wpn_modao' : 'part_wpn_sword');
  if (!img) return;
  const w = lengthPx;
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

    ctx.drawImage(bg, px, py, drawW, drawH);

    // 柔和暗部景深融合层，使近景手绘青石古桥/人物与远景手绘城池层次分明！
    const depthGrad = ctx.createLinearGradient(0, 0, 0, vH);
    depthGrad.addColorStop(0, 'rgba(5, 8, 15, 0.14)');
    depthGrad.addColorStop(0.68, 'rgba(5, 8, 15, 0.24)');
    depthGrad.addColorStop(1, 'rgba(4, 6, 12, 0.68)');
    ctx.fillStyle = depthGrad;
    ctx.fillRect(0, 0, vW, vH);
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

  const slabImg = Assets.get('env_ground_slab');
  const bridgeImg = Assets.get('env_bridge');

  const isArchBridgeRoom =
    room.waterZones.length > 0 && room.groundNodes.some((n) => n.style === 'arch_bridge');
  const wz = isArchBridgeRoom ? room.waterZones[0] : null;

  // 1. 绘制连续 AI 手绘青石古道横截面 (`env_ground_slab.webp`)
  if (slabImg) {
    const sw = slabImg.width;
    const sh = slabImg.height;

    // 先在底层填深色石基防露底（跳过石拱桥镂空水面段与向下敞开的暗井口）
    bctx.fillStyle = '#0d1320';
    for (let x = 0; x < room.pixelW; x += 8) {
      if (isInsideDownShaft(room, x + 4)) continue;
      if (wz && x >= wz.x1 + 24 && x <= wz.x2 - 24) continue;
      const gy = sampleSolidGroundY(room, x);
      bctx.fillRect(x, gy + 16, 9, room.pixelH - gy);
    }

    // 沿地面高度逐段贴合手绘青石板条带（斜坡/台阶处按 24px 切片细腻顺应坡度！）
    const sliceW = 24;
    for (let x = 0; x < room.pixelW; x += sliceW) {
      if (isInsideDownShaft(room, x + 4) || isInsideDownShaft(room, x + sliceW - 4)) continue;
      // 石拱桥主体段交由完整手绘三孔石拱桥 `env_bridge.webp` 呈现！
      if (wz && x >= wz.x1 + 12 && x <= wz.x2 - sliceW - 12) continue;

      const gy = sampleSolidGroundY(room, x + sliceW * 0.5);
      const sx = ((x % sw) + sw) % sw;
      const grabW = Math.min(sliceW, sw - sx);
      bctx.drawImage(slabImg, sx, 0, grabW, sh, x, gy - 6, sliceW + 0.6, sh);
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
}

/**
 * 绘制正侧视 AI 手绘雕栏朱漆木阁台 (`env_pavilion.webp`)
 */
export function drawOrthographicPavilion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  hasPillars: boolean,
  room: BuiltRoom
): void {
  // 地井口单向木栈板：截取手绘青石/木台台面条绘制
  const pvImg = Assets.get('env_pavilion');
  if (!hasPillars && y >= 380) {
    if (pvImg) {
      // 仅截取 env_pavilion 中段木石台面条 (38% .. 54%)
      const sy = Math.floor(pvImg.height * 0.38);
      const sh = Math.floor(pvImg.height * 0.16);
      ctx.drawImage(pvImg, 16, sy, pvImg.width - 32, sh, x - 2, y - 3, w + 4, 14);
    }
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
