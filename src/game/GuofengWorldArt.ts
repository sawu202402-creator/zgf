import {
  BuiltRoom,
  CELL_PIXEL_W,
  isInsideDownShaft,
  sampleSolidGroundY,
} from '../data/worldMap';
import { WeaponArchetype } from '../types';

/**
 * 纯正2D正侧视国风水墨重彩场景与古建绘制引擎（0位图拉伸、0透视错位、0无缝拼接断层！）
 * 所有线条粗细（#070a12 浓墨描边）与赛璐珞重彩明暗完全对齐 18岁李逸承手绘序列帧画风！
 */

function hash1D(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

/**
 * 绘制飞檐翘角古建筑屋顶（正侧视筒瓦飞檐，完美贴合2D横版空间！）
 */
function drawUpturnedTileRoof(
  ctx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  spanW: number,
  roofH: number,
  tileColor: string,
  ridgeGold: string
): void {
  const halfW = spanW * 0.5;
  const eaveLift = Math.min(18, roofH * 0.42);

  ctx.save();
  ctx.fillStyle = tileColor;
  ctx.strokeStyle = '#060911';
  ctx.lineWidth = 2.2;

  ctx.beginPath();
  // 正脊两端 -> 垂脊弧形下掠 -> 飞檐翘角上挑！
  ctx.moveTo(cx - halfW * 0.48, topY);
  ctx.lineTo(cx + halfW * 0.48, topY);
  ctx.quadraticCurveTo(cx + halfW * 0.78, topY + roofH * 0.78, cx + halfW + 12, topY + roofH - eaveLift);
  ctx.quadraticCurveTo(cx + halfW * 0.88, topY + roofH + 3, cx + halfW * 0.72, topY + roofH + 2);
  ctx.lineTo(cx - halfW * 0.72, topY + roofH + 2);
  ctx.quadraticCurveTo(cx - halfW * 0.88, topY + roofH + 3, cx - halfW - 12, topY + roofH - eaveLift);
  ctx.quadraticCurveTo(cx - halfW * 0.78, topY + roofH * 0.78, cx - halfW * 0.48, topY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 纵向筒瓦垄刻线
  ctx.strokeStyle = 'rgba(5, 8, 15, 0.55)';
  ctx.lineWidth = 1.2;
  const ribs = Math.max(6, Math.floor(spanW / 14));
  for (let i = -ribs; i <= ribs; i++) {
    const u = i / ribs;
    const rxTop = cx + u * halfW * 0.46;
    const rxBot = cx + u * halfW * 0.82;
    ctx.beginPath();
    ctx.moveTo(rxTop, topY + 3);
    ctx.lineTo(rxBot, topY + roofH);
    ctx.stroke();
  }

  // 正脊鎏金鸱吻与压脊线
  ctx.strokeStyle = ridgeGold;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(cx - halfW * 0.5, topY);
  ctx.lineTo(cx + halfW * 0.5, topY);
  ctx.stroke();

  // 左右脊兽鸱吻
  for (const dir of [-1, 1]) {
    const ox = cx + dir * halfW * 0.5;
    ctx.fillStyle = ridgeGold;
    ctx.beginPath();
    ctx.moveTo(ox, topY + 1);
    ctx.lineTo(ox + dir * 6, topY - 7);
    ctx.lineTo(ox - dir * 3, topY - 3);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/**
 * 绘制赛璐珞黑墨描边神兵（用于李逸承背部挂剑 & 青石镇剑台，与人物画风 100% 同源，0位图贴纸感！）
 */
export function drawCelShadedWeapon(
  ctx: CanvasRenderingContext2D,
  archetype: WeaponArchetype,
  weaponId = 'sword_1',
  lengthPx = 88
): void {
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (archetype === 'greatsword') {
    const sc = lengthPx / 96;
    ctx.scale(sc, sc);
    // 长柄缠红绳双手握把 (-26 .. 0)
    ctx.fillStyle = '#7f1d1d';
    ctx.strokeStyle = '#060911';
    ctx.lineWidth = 2.2;
    ctx.fillRect(-26, -3.2, 25, 6.4);
    ctx.strokeRect(-26, -3.2, 25, 6.4);

    // 环形鎏金刀首
    ctx.fillStyle = '#d4a347';
    ctx.beginPath();
    ctx.arc(-28, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 吞口兽首金锷
    ctx.fillStyle = '#d4a347';
    ctx.beginPath();
    ctx.moveTo(-2, -10);
    ctx.lineTo(7, -7);
    ctx.lineTo(7, 7);
    ctx.lineTo(-2, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 厚重玄铁宽阔斩马巨刃 (6 .. 72)
    const bg = ctx.createLinearGradient(6, -8, 72, 8);
    bg.addColorStop(0, '#1e293b');
    bg.addColorStop(0.65, '#334155');
    bg.addColorStop(1, '#94a3b8');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.moveTo(6, -7.2);
    ctx.lineTo(64, -8.5);
    ctx.lineTo(74, -1.5);
    ctx.lineTo(61, 8.2);
    ctx.lineTo(6, 7.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 刃侧寒锋白边与赤炎金铭纹
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(8, 6.2);
    ctx.lineTo(60, 7.1);
    ctx.lineTo(72, -1.2);
    ctx.stroke();

    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(14, -1);
    ctx.lineTo(54, -1);
    ctx.stroke();
  } else {
    const sc = lengthPx / 82;
    ctx.scale(sc, sc);
    const isJadeSword = weaponId === 'sword_2';

    // 剑柄 (-20 .. 0)
    ctx.fillStyle = isJadeSword ? '#0f766e' : '#1e3a3a';
    ctx.strokeStyle = '#060911';
    ctx.lineWidth = 2;
    ctx.fillRect(-19, -2.4, 18, 4.8);
    ctx.strokeRect(-19, -2.4, 18, 4.8);

    // 剑首云纹银饰
    ctx.fillStyle = isJadeSword ? '#5eead4' : '#cbd5e1';
    ctx.beginPath();
    ctx.arc(-21, 0, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 云头剑格
    ctx.fillStyle = isJadeSword ? '#d4a347' : '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(-1, -8);
    ctx.lineTo(5, -4);
    ctx.lineTo(5, 4);
    ctx.lineTo(-1, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 修长双刃寒铁剑身 (4 .. 64)
    const sg = ctx.createLinearGradient(4, -4, 64, 4);
    sg.addColorStop(0, isJadeSword ? '#2dd4bf' : '#94a3b8');
    sg.addColorStop(0.5, '#f8fafc');
    sg.addColorStop(1, isJadeSword ? '#ccfbf1' : '#cbd5e1');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.moveTo(4, -3.6);
    ctx.lineTo(53, -2.8);
    ctx.lineTo(65, 0);
    ctx.lineTo(53, 2.8);
    ctx.lineTo(4, 3.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 剑脊血槽寒线
    ctx.strokeStyle = isJadeSword ? '#0d9488' : '#475569';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(7, 0);
    ctx.lineTo(54, 0);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * 标题画面无缝动态国风血月玄城全景（彻底告别静态位图背景！）
 */
export function drawSeamlessTitlePanorama(
  ctx: CanvasRenderingContext2D,
  viewW: number,
  viewH: number,
  t: number
): void {
  // 1. 夜幕苍穹渐变
  const sky = ctx.createLinearGradient(0, 0, 0, viewH);
  sky.addColorStop(0, '#04060d');
  sky.addColorStop(0.48, '#120a18');
  sky.addColorStop(1, '#09111e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, viewW, viewH);

  // 2. 唯一一轮恢弘赤金血月与流云
  const mx = viewW * 0.66;
  const my = viewH * 0.27;
  const mr = Math.min(viewW, viewH) * 0.14;

  const halo = ctx.createRadialGradient(mx, my, mr * 0.4, mx, my, mr * 3.2);
  halo.addColorStop(0, 'rgba(220, 38, 38, 0.45)');
  halo.addColorStop(0.5, 'rgba(153, 27, 27, 0.16)');
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(mx, my, mr * 3.2, 0, Math.PI * 2);
  ctx.fill();

  const moonG = ctx.createLinearGradient(mx, my - mr, mx, my + mr);
  moonG.addColorStop(0, '#fecaca');
  moonG.addColorStop(0.45, '#ef4444');
  moonG.addColorStop(1, '#991b1b');
  ctx.fillStyle = moonG;
  ctx.beginPath();
  ctx.arc(mx, my, mr, 0, Math.PI * 2);
  ctx.fill();

  // 3. 远景层叠水墨奇峰与九幽玄城飞檐群剪影
  drawContinuousMountainLayer(ctx, viewW, viewH, t * 8, viewH * 0.56, 110, '#0d1526', 0.0032);
  drawContinuousMountainLayer(ctx, viewW, viewH, t * 14 + 400, viewH * 0.68, 85, '#090f1c', 0.0048);

  // 远山之上的九幽玄城主殿飞檐剪影与暖黄灯窗
  const casX = viewW * 0.68;
  const casY = viewH * 0.52;
  ctx.fillStyle = '#060912';
  ctx.fillRect(casX - 110, casY, 220, 180);
  drawUpturnedTileRoof(ctx, casX, casY - 36, 280, 42, '#0b1120', '#92400e');
  drawUpturnedTileRoof(ctx, casX, casY - 82, 190, 34, '#0b1120', '#b45309');

  // 宫城暖光窗格
  ctx.fillStyle = 'rgba(251, 191, 36, 0.78)';
  for (let wx = -54; wx <= 54; wx += 27) {
    ctx.fillRect(casX + wx - 5, casY + 18, 10, 18);
    ctx.fillRect(casX + wx * 0.6 - 4, casY - 42, 8, 14);
  }

  // 右侧近景悬崖夜竹剪影
  for (let i = 0; i < 9; i++) {
    const bx = viewW * 0.78 + i * 28;
    const sway = Math.sin(t * 1.8 + i) * 9;
    ctx.strokeStyle = '#04070e';
    ctx.lineWidth = 5 + (i % 3) * 2;
    ctx.beginPath();
    ctx.moveTo(bx, viewH + 10);
    ctx.quadraticCurveTo(bx + sway * 0.5, viewH * 0.6, bx + sway, viewH * 0.14 + (i % 3) * 40);
    ctx.stroke();
  }

  // 漫天飘散的赤金火星灰烬
  for (let i = 0; i < 32; i++) {
    const px = ((i * 197 + t * (22 + (i % 5) * 8)) % (viewW + 40)) - 20;
    const py = viewH - (((i * 131 + t * (16 + (i % 4) * 7)) % (viewH + 30)) - 15);
    ctx.fillStyle = i % 3 === 0 ? 'rgba(250, 204, 21, 0.65)' : 'rgba(239, 68, 68, 0.52)';
    ctx.beginPath();
    ctx.arc(px, py, 1.5 + (i % 2.2), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawContinuousMountainLayer(
  ctx: CanvasRenderingContext2D,
  vW: number,
  vH: number,
  scrollX: number,
  baseY: number,
  amp: number,
  color: string,
  freq: number
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-10, vH);
  for (let sx = -10; sx <= vW + 16; sx += 16) {
    const wx = sx + scrollX;
    const h =
      Math.sin(wx * freq) * amp * 0.52 +
      Math.sin(wx * freq * 2.3 + 1.7) * amp * 0.28 +
      Math.cos(wx * freq * 4.1) * amp * 0.14;
    ctx.lineTo(sx, baseY - Math.abs(h));
  }
  ctx.lineTo(vW + 16, vH);
  ctx.closePath();
  ctx.fill();

  // 山脚水墨云雾过渡带（使远近山峦如中国画般气韵贯通！）
  const mist = ctx.createLinearGradient(0, baseY - 25, 0, baseY + 65);
  mist.addColorStop(0, 'rgba(15, 23, 42, 0)');
  mist.addColorStop(0.55, 'rgba(30, 41, 59, 0.24)');
  mist.addColorStop(1, 'rgba(8, 12, 22, 0)');
  ctx.fillStyle = mist;
  ctx.fillRect(0, baseY - 25, vW, 90);
}

/**
 * 局内无缝多层次国风视差远景（0接缝、唯一血月、室内宫廊立柱花窗、地底暗渠石拱！）
 */
export function drawSeamlessParallaxBackdrop(
  ctx: CanvasRenderingContext2D,
  vW: number,
  vH: number,
  camLeft: number,
  room: BuiltRoom,
  t: number
): void {
  const globalX = room.mapX * CELL_PIXEL_W + camLeft;

  if (room.mapY === 2) {
    // ==================== 地底九曲幽冥暗渠：深邃地下石拱水殿远景 ====================
    const bg = ctx.createLinearGradient(0, 0, 0, vH);
    bg.addColorStop(0, '#04070f');
    bg.addColorStop(0.6, '#081220');
    bg.addColorStop(1, '#061a24');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, vW, vH);

    // 远景 0.24x 地下巨型石拱水闸廊柱
    const span = 240;
    const startIdx = Math.floor((globalX * 0.24) / span) - 1;
    const offset = (globalX * 0.24) - startIdx * span;
    ctx.fillStyle = '#0b1424';
    ctx.strokeStyle = '#16243b';
    ctx.lineWidth = 2;
    for (let i = 0; i < Math.ceil(vW / span) + 3; i++) {
      const px = i * span - offset;
      ctx.fillRect(px - 22, 50, 44, vH - 50);
      ctx.beginPath();
      ctx.arc(px + span * 0.5, 150, span * 0.5 - 22, Math.PI, 0);
      ctx.lineTo(px + span - 22, 50);
      ctx.lineTo(px + 22, 50);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 地底幽青冷雾
    const glow = ctx.createLinearGradient(0, vH * 0.55, 0, vH);
    glow.addColorStop(0, 'rgba(13, 148, 136, 0)');
    glow.addColorStop(1, 'rgba(20, 184, 166, 0.18)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, vH * 0.55, vW, vH * 0.45);
    return;
  }

  if (room.region === 'main_hall' || room.region === 'library') {
    // ==================== 室内奉天正殿 / 万卷藏书飞阁：雕花格扇窗与书架回廊 ====================
    const bg = ctx.createLinearGradient(0, 0, 0, vH);
    bg.addColorStop(0, '#09070e');
    bg.addColorStop(0.5, '#150d16');
    bg.addColorStop(1, '#0c0f1a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, vW, vH);

    const bayW = 260;
    const sIdx = Math.floor((globalX * 0.28) / bayW) - 1;
    const off = (globalX * 0.28) - sIdx * bayW;

    for (let i = 0; i < Math.ceil(vW / bayW) + 3; i++) {
      const bx = i * bayW - off;
      // 后景朱漆廊柱
      ctx.fillStyle = '#290909';
      ctx.fillRect(bx - 14, 40, 28, vH - 40);
      ctx.strokeStyle = 'rgba(207, 163, 73, 0.22)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(bx - 14, 40, 28, vH - 40);

      if (room.region === 'library') {
        // 藏书阁后景顶天立地古籍木架与点点金签微光
        ctx.fillStyle = '#161118';
        ctx.strokeStyle = '#3f271e';
        ctx.fillRect(bx + 26, 88, bayW - 52, 270);
        ctx.strokeRect(bx + 26, 88, bayW - 52, 270);
        for (let sy = 130; sy <= 320; sy += 48) {
          ctx.fillStyle = '#3b1f16';
          ctx.fillRect(bx + 28, sy, bayW - 56, 5);
          // 卷轴书册侧影
          ctx.fillStyle = '#9ca3af';
          for (let sx = bx + 38; sx < bx + bayW - 44; sx += 16) {
            ctx.fillRect(sx, sy - 24, 9, 23);
          }
        }
      } else {
        // 奉天殿后景月光透射古风棂星花窗
        const winX = bx + 46;
        const winW = bayW - 92;
        const wg = ctx.createLinearGradient(0, 105, 0, 305);
        wg.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
        wg.addColorStop(1, 'rgba(249, 115, 22, 0.06)');
        ctx.fillStyle = wg;
        ctx.fillRect(winX, 105, winW, 200);
        ctx.strokeStyle = '#3b1512';
        ctx.lineWidth = 2;
        ctx.strokeRect(winX, 105, winW, 200);
        for (let gy = 145; gy < 305; gy += 40) {
          ctx.beginPath();
          ctx.moveTo(winX, gy);
          ctx.lineTo(winX + winW, gy);
          ctx.stroke();
        }
      }
    }
    return;
  }

  // ==================== 露天瓮城古桥 / 晨钟飞虹天桥：唯一赤金血月 + 水墨群山 + 远城雉堞 ====================
  const sky = ctx.createLinearGradient(0, 0, 0, vH);
  sky.addColorStop(0, '#050812');
  sky.addColorStop(0.52, '#111629');
  sky.addColorStop(1, '#0b1624');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, vW, vH);

  // 唯一一轮高悬血月（0.03x 极远景视差，绝不会出现两轮月亮或贴图断缝！）
  const moonX = vW * 0.68 - (globalX * 0.025) % (vW * 0.4);
  const moonY = 92;
  const halo = ctx.createRadialGradient(moonX, moonY, 18, moonX, moonY, 135);
  halo.addColorStop(0, 'rgba(239, 68, 68, 0.42)');
  halo.addColorStop(0.55, 'rgba(153, 27, 27, 0.14)');
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 135, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(moonX, moonY, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fecaca';
  ctx.beginPath();
  ctx.arc(moonX - 4, moonY - 4, 28, 0, Math.PI * 2);
  ctx.fill();

  // 远山两重（0.10x 与 0.18x 连续正弦山脊）
  drawContinuousMountainLayer(ctx, vW, vH, globalX * 0.1, 275, 92, '#0e1729', 0.0042);
  drawContinuousMountainLayer(ctx, vW, vH, globalX * 0.18 + 300, 325, 68, '#0a1120', 0.006);

  // 中远景 0.28x 苦竹林海与古长城角楼剪影
  const clusterSpan = 340;
  const cStart = Math.floor((globalX * 0.28) / clusterSpan) - 1;
  const cOff = (globalX * 0.28) - cStart * clusterSpan;
  for (let i = 0; i < Math.ceil(vW / clusterSpan) + 3; i++) {
    const idx = cStart + i;
    const cx = i * clusterSpan - cOff;

    if (Math.abs(idx) % 2 === 0) {
      // 远景飞檐角楼剪影
      ctx.fillStyle = '#080d19';
      ctx.fillRect(cx + 40, 225, 86, 160);
      drawUpturnedTileRoof(ctx, cx + 83, 200, 124, 28, '#0c1424', '#78350f');
      ctx.fillStyle = 'rgba(251, 191, 36, 0.65)';
      ctx.fillRect(cx + 76, 244, 14, 20);
    } else {
      // 随风轻摇的中景水墨竹丛
      for (let b = 0; b < 5; b++) {
        const bx = cx + 50 + b * 24;
        const sway = Math.sin(t * 1.7 + idx + b) * 6;
        ctx.strokeStyle = 'rgba(7, 13, 24, 0.85)';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(bx, 390);
        ctx.quadraticCurveTo(bx + sway * 0.5, 290, bx + sway, 195 + (b % 2) * 28);
        ctx.stroke();
      }
    }
  }
}

/**
 * 烘焙正侧视青石条石砌体、石拱桥、室内藻井与城门券洞（完全替代原本的俯视角 tile_stone_wall 贴图平铺！）
 */
export function bakeOrthographicRoomTerrain(bctx: CanvasRenderingContext2D, room: BuiltRoom): void {
  bctx.clearRect(0, 0, room.pixelW, room.pixelH);

  // 离屏生成一块正侧视交错青石条石砌体画布（横版侧面砖缝，绝非俯视人字砖！）
  const patCanvas = document.createElement('canvas');
  patCanvas.width = 128;
  patCanvas.height = 64;
  const pctx = patCanvas.getContext('2d')!;
  pctx.fillStyle = '#141c2c';
  pctx.fillRect(0, 0, 128, 64);

  const rowH = 16;
  for (let r = 0; r < 4; r++) {
    const ry = r * rowH;
    const shift = (r % 2) * 32;
    for (let c = -1; c < 3; c++) {
      const rx = c * 64 + shift;
      const shade = hash1D(r * 13 + c * 7);
      pctx.fillStyle = shade > 0.6 ? '#1e293b' : shade > 0.25 ? '#182233' : '#121a28';
      pctx.fillRect(rx + 1, ry + 1, 62, rowH - 2);
      // 砖块上沿微弱受光边
      pctx.fillStyle = 'rgba(148, 163, 184, 0.12)';
      pctx.fillRect(rx + 2, ry + 1, 60, 1.5);
    }
  }
  const ashlarPat = bctx.createPattern(patCanvas, 'repeat')!;

  // 1. 填充连续地面侧面青石基座
  bctx.save();
  bctx.beginPath();
  bctx.moveTo(0, room.pixelH);
  for (let x = 0; x <= room.pixelW; x += 4) {
    const gy = isInsideDownShaft(room, x) ? room.pixelH + 20 : sampleSolidGroundY(room, x);
    bctx.lineTo(x, gy);
  }
  bctx.lineTo(room.pixelW, room.pixelH);
  bctx.closePath();
  bctx.fillStyle = ashlarPat;
  bctx.fill();

  // 护城河三孔正侧视石拱桥镂空与拱券条石
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

    for (const a of arches) {
      bctx.strokeStyle = '#070a12';
      bctx.lineWidth = 10;
      bctx.beginPath();
      bctx.ellipse(a.cx, wz.surfaceY + 8, a.rx, a.ry, 0, Math.PI, 0);
      bctx.stroke();

      bctx.strokeStyle = '#334155';
      bctx.lineWidth = 6;
      bctx.beginPath();
      bctx.ellipse(a.cx, wz.surfaceY + 8, a.rx, a.ry, 0, Math.PI, 0);
      bctx.stroke();
    }
  }
  bctx.restore();

  // 地面底部深墨压暗渐变（增加厚重体积感）
  const botDark = bctx.createLinearGradient(0, room.pixelH - 65, 0, room.pixelH);
  botDark.addColorStop(0, 'rgba(4, 6, 12, 0)');
  botDark.addColorStop(1, 'rgba(4, 6, 12, 0.78)');
  bctx.fillStyle = botDark;
  bctx.fillRect(0, room.pixelH - 65, room.pixelW, 65);

  // 2. 地表正侧视厚重压顶青石板（浓墨描边 + 月光冷釉高光）
  for (let x = 0; x < room.pixelW; x += 32) {
    if (isInsideDownShaft(room, x + 4) || isInsideDownShaft(room, x + 28)) continue;
    const y1 = sampleSolidGroundY(room, x);
    const y2 = sampleSolidGroundY(room, x + 32);

    bctx.fillStyle = room.region === 'main_hall' || room.region === 'library' ? '#283548' : '#263346';
    bctx.strokeStyle = '#060911';
    bctx.lineWidth = 2.2;
    bctx.beginPath();
    bctx.moveTo(x, y1);
    bctx.lineTo(x + 32, y2);
    bctx.lineTo(x + 32, y2 + 13);
    bctx.lineTo(x, y1 + 13);
    bctx.closePath();
    bctx.fill();
    bctx.stroke();

    bctx.strokeStyle = 'rgba(207, 163, 73, 0.36)';
    bctx.lineWidth = 1.4;
    bctx.beginPath();
    bctx.moveTo(x + 2, y1 + 1.5);
    bctx.lineTo(x + 30, y2 + 1.5);
    bctx.stroke();
  }

  // 向下竖井井口两侧护壁石垛
  for (const sh of room.shafts) {
    if (sh.dir !== 'down') continue;
    const topY = sampleSolidGroundY(room, sh.x1 - 4);
    bctx.fillStyle = '#1e293b';
    bctx.strokeStyle = '#060911';
    bctx.lineWidth = 2.2;
    bctx.fillRect(sh.x1 - 10, topY, 14, room.pixelH - topY);
    bctx.strokeRect(sh.x1 - 10, topY, 14, room.pixelH - topY);
    bctx.fillRect(sh.x2 - 4, topY, 14, room.pixelH - topY);
    bctx.strokeRect(sh.x2 - 4, topY, 14, room.pixelH - topY);
  }

  // 3. 石拱桥汉白玉雕栏望柱
  if (isArchBridgeRoom) {
    for (const wz of room.waterZones) {
      for (let bx = wz.x1 + 32; bx <= wz.x2 - 32; bx += 64) {
        const by = sampleSolidGroundY(room, bx);
        bctx.fillStyle = '#334155';
        bctx.strokeStyle = '#060911';
        bctx.lineWidth = 2;
        bctx.fillRect(bx - 5, by - 30, 10, 30);
        bctx.strokeRect(bx - 5, by - 30, 10, 30);
        bctx.fillStyle = '#64748b';
        bctx.beginPath();
        bctx.arc(bx, by - 33, 5.5, 0, Math.PI * 2);
        bctx.fill();
        bctx.stroke();

        if (bx + 64 <= wz.x2 - 20) {
          const ny = sampleSolidGroundY(room, bx + 64);
          bctx.strokeStyle = '#475569';
          bctx.lineWidth = 3.6;
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

  // 4. 城门石券洞、宫殿雕梁藻井顶棚与地下石拱顶
  for (const cs of room.ceilingSpans) {
    const cw = cs.x2 - cs.x1;
    bctx.fillStyle = cs.style === 'palace_timber' ? '#1c090a' : ashlarPat;
    bctx.fillRect(cs.x1, 0, cw, cs.bottomY);

    const cg = bctx.createLinearGradient(0, 0, 0, cs.bottomY);
    cg.addColorStop(0, 'rgba(4, 6, 12, 0.85)');
    cg.addColorStop(1, 'rgba(8, 12, 22, 0.35)');
    bctx.fillStyle = cg;
    bctx.fillRect(cs.x1, 0, cw, cs.bottomY);

    if (cs.style === 'palace_timber') {
      // 朱漆额枋大梁与斗拱雕花垫板
      bctx.fillStyle = '#4c110e';
      bctx.strokeStyle = '#060911';
      bctx.lineWidth = 2.2;
      bctx.fillRect(cs.x1, cs.bottomY - 18, cw, 18);
      bctx.strokeRect(cs.x1, cs.bottomY - 18, cw, 18);

      for (let dx = cs.x1 + 24; dx < cs.x2 - 20; dx += 72) {
        bctx.fillStyle = '#7f1d1d';
        bctx.fillRect(dx - 12, cs.bottomY - 28, 24, 10);
        bctx.strokeRect(dx - 12, cs.bottomY - 28, 24, 10);
      }

      bctx.strokeStyle = '#cfa349';
      bctx.lineWidth = 1.4;
      bctx.beginPath();
      bctx.moveTo(cs.x1, cs.bottomY - 3.5);
      bctx.lineTo(cs.x2, cs.bottomY - 3.5);
      bctx.stroke();
    } else {
      // 厚重城门券洞/地宫条石拱压檐
      bctx.fillStyle = '#273449';
      bctx.strokeStyle = '#060911';
      bctx.lineWidth = 2.2;
      bctx.fillRect(cs.x1, cs.bottomY - 15, cw, 15);
      bctx.strokeRect(cs.x1, cs.bottomY - 15, cw, 15);
    }
  }

  // 5. 左右端墙与正侧视石门洞连廊
  const bakeSideDoor = (side: 'left' | 'right') => {
    const hasDoor = side === 'left' ? Boolean(room.leftRoomId) : Boolean(room.rightRoomId);
    const doorFloorY =
      (side === 'left' ? room.leftDoorFloorY : room.rightDoorFloorY) ??
      sampleSolidGroundY(room, side === 'left' ? 10 : room.pixelW - 10);
    const wx = side === 'left' ? 0 : room.pixelW - 32;

    if (!hasDoor) {
      if (room.ceilingSpans.length > 0 || room.mapY !== 1) {
        bctx.fillStyle = ashlarPat;
        bctx.strokeStyle = '#060911';
        bctx.lineWidth = 2.4;
        bctx.fillRect(wx, 0, 32, doorFloorY);
        bctx.strokeRect(wx, 0, 32, doorFloorY);
      }
    } else {
      const doorTopY = doorFloorY - 124;
      bctx.fillStyle = ashlarPat;
      bctx.strokeStyle = '#060911';
      bctx.lineWidth = 2.2;
      bctx.fillRect(wx, 0, 34, doorTopY);
      bctx.strokeRect(wx, 0, 34, doorTopY);

      bctx.fillStyle = '#334155';
      bctx.fillRect(wx, doorTopY - 10, 36, 12);
      bctx.strokeRect(wx, doorTopY - 10, 36, 12);

      const dg = bctx.createLinearGradient(
        side === 'left' ? 0 : room.pixelW,
        0,
        side === 'left' ? 56 : room.pixelW - 56,
        0
      );
      dg.addColorStop(0, 'rgba(251, 191, 36, 0.24)');
      dg.addColorStop(1, 'rgba(0, 0, 0, 0)');
      bctx.fillStyle = dg;
      bctx.fillRect(side === 'left' ? 0 : room.pixelW - 56, doorTopY, 56, 124);
    }
  };
  bakeSideDoor('left');
  bakeSideDoor('right');
}

/**
 * 正侧视雕栏木阁台（任意宽度 pv.w 100% 等比精准绘制，彻底淘汰拉伸变形的3D透视贴图 prop_pavilion_platform！）
 */
export function drawOrthographicPavilion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  hasPillars: boolean,
  room: BuiltRoom
): void {
  // 地井口单向透光木栈格
  if (!hasPillars && y >= 380) {
    ctx.save();
    ctx.fillStyle = '#451a12';
    ctx.strokeStyle = '#060911';
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, w, 9);
    ctx.strokeRect(x, y, w, 9);
    ctx.fillStyle = '#cfa349';
    ctx.fillRect(x + 2, y + 1, w - 4, 1.5);
    ctx.fillStyle = '#050811';
    for (let gx = x + 12; gx < x + w - 12; gx += 18) {
      ctx.fillRect(gx, y + 2.5, 8, 5);
    }
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.lineJoin = 'round';

  // 1. 承重朱漆圆木立柱与雕花柱础石（扎根实心地面）
  if (hasPillars) {
    const cols = [x + 28, x + w - 28];
    if (w > 280) cols.push(x + w * 0.5);

    for (const cx of cols) {
      const botY = sampleSolidGroundY(room, cx);
      const pg = ctx.createLinearGradient(cx - 7, 0, cx + 7, 0);
      pg.addColorStop(0, '#2b0909');
      pg.addColorStop(0.45, '#7f1d1d');
      pg.addColorStop(1, '#1f0606');
      ctx.fillStyle = pg;
      ctx.strokeStyle = '#060911';
      ctx.lineWidth = 2.2;
      ctx.fillRect(cx - 7, y + 12, 14, Math.max(10, botY - y - 12));
      ctx.strokeRect(cx - 7, y + 12, 14, Math.max(10, botY - y - 12));

      // 雀替雕花斜撑（古建梁柱交接灵魂细节！）
      ctx.fillStyle = '#5c1512';
      ctx.beginPath();
      ctx.moveTo(cx - 7, y + 14);
      ctx.lineTo(cx - 24, y + 14);
      ctx.quadraticCurveTo(cx - 14, y + 24, cx - 7, y + 30);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 7, y + 14);
      ctx.lineTo(cx + 24, y + 14);
      ctx.quadraticCurveTo(cx + 14, y + 24, cx + 7, y + 30);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 覆盆莲花青石柱础
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(cx - 13, botY);
      ctx.lineTo(cx - 9, botY - 9);
      ctx.lineTo(cx + 9, botY - 9);
      ctx.lineTo(cx + 13, botY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  // 2. 台面后方正侧视古风朱漆寻杖木栏杆（立于人物背后，无任何3D斜透视变形！）
  const railH = 26;
  const postStep = Math.max(44, Math.floor(w / Math.max(2, Math.round(w / 56))));
  // 栏杆横梁与华板
  ctx.fillStyle = 'rgba(42, 11, 11, 0.85)';
  ctx.fillRect(x + 4, y - 12, w - 8, 8);
  ctx.strokeStyle = '#060911';
  ctx.lineWidth = 2;
  // 上寻杖扶手
  ctx.fillStyle = '#6e1717';
  ctx.fillRect(x + 2, y - railH, w - 4, 5);
  ctx.strokeRect(x + 2, y - railH, w - 4, 5);
  // 中腰线金饰
  ctx.strokeStyle = '#cfa349';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(x + 4, y - 15);
  ctx.lineTo(x + w - 4, y - 15);
  ctx.stroke();

  // 望柱与莲花柱头
  ctx.strokeStyle = '#060911';
  ctx.lineWidth = 2;
  for (let px = x + 4; px <= x + w - 2; px += postStep) {
    ctx.fillStyle = '#5c1414';
    ctx.fillRect(px - 3.5, y - railH - 4, 7, railH + 4);
    ctx.strokeRect(px - 3.5, y - railH - 4, 7, railH + 4);
    ctx.fillStyle = '#d4a347';
    ctx.beginPath();
    ctx.arc(px, y - railH - 6, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // 末端最后一根望柱对齐右缘
  const rxEnd = x + w - 4;
  ctx.fillStyle = '#5c1414';
  ctx.fillRect(rxEnd - 3.5, y - railH - 4, 7, railH + 4);
  ctx.strokeRect(rxEnd - 3.5, y - railH - 4, 7, railH + 4);
  ctx.fillStyle = '#d4a347';
  ctx.beginPath();
  ctx.arc(rxEnd, y - railH - 6, 3.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 3. 正侧视青石压面 + 朱木额枋台座（顶面严丝合缝位于物理高度 y！）
  ctx.fillStyle = '#283548';
  ctx.strokeStyle = '#060911';
  ctx.lineWidth = 2.2;
  ctx.fillRect(x - 4, y, w + 8, 7);
  ctx.strokeRect(x - 4, y, w + 8, 7);

  ctx.fillStyle = '#4c110e';
  ctx.fillRect(x, y + 7, w, 8);
  ctx.strokeRect(x, y + 7, w, 8);

  // 台面月光高光线
  ctx.strokeStyle = 'rgba(207, 163, 73, 0.48)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x - 2, y + 1.5);
  ctx.lineTo(x + w + 2, y + 1.5);
  ctx.stroke();

  ctx.restore();
}

/**
 * 正侧视飞檐青石牌坊（双柱完美水平落地，彻底取代斜35度3D透视悬空的 prop_stone_arch 贴图！）
 */
export function drawOrthographicStoneArchway(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  title: string | undefined,
  t: number
): void {
  const halfSpan = 64;
  const h = 212;
  const topY = groundY - h;

  ctx.save();
  ctx.lineJoin = 'round';

  // 地面接触暗影
  ctx.fillStyle = 'rgba(0, 0, 0, 0.56)';
  ctx.beginPath();
  ctx.ellipse(cx - halfSpan, groundY + 2, 22, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + halfSpan, groundY + 2, 22, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 左右青石冲天方柱与抱鼓石夹杆座（100% 同一水平线落地！）
  for (const dir of [-1, 1]) {
    const px = cx + dir * halfSpan;
    const pg = ctx.createLinearGradient(px - 10, 0, px + 10, 0);
    pg.addColorStop(0, '#1e293b');
    pg.addColorStop(0.5, '#334155');
    pg.addColorStop(1, '#151d2c');
    ctx.fillStyle = pg;
    ctx.strokeStyle = '#060911';
    ctx.lineWidth = 2.2;
    ctx.fillRect(px - 9, topY + 26, 18, h - 26);
    ctx.strokeRect(px - 9, topY + 26, 18, h - 26);

    // 底部抱鼓石须弥座
    ctx.fillStyle = '#273449';
    ctx.beginPath();
    ctx.moveTo(px - 19, groundY);
    ctx.lineTo(px - 15, groundY - 28);
    ctx.lineTo(px + 15, groundY - 28);
    ctx.lineTo(px + 19, groundY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 牌坊雕龙额枋与字牌匾额
  const beamY = topY + 52;
  ctx.fillStyle = '#263346';
  ctx.strokeStyle = '#060911';
  ctx.lineWidth = 2.2;
  ctx.fillRect(cx - halfSpan - 6, beamY, halfSpan * 2 + 12, 28);
  ctx.strokeRect(cx - halfSpan - 6, beamY, halfSpan * 2 + 12, 28);

  // 鎏金内框与匾额题字
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#cfa349';
  ctx.lineWidth = 1.5;
  ctx.fillRect(cx - 42, beamY + 4, 84, 20);
  ctx.strokeRect(cx - 42, beamY + 4, 84, 20);

  if (title) {
    ctx.font = 'bold 11.5px "STKaiti", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f6dc8d';
    ctx.fillText(title, cx, beamY + 18);
  }

  // 主楼与左右次楼三重飞檐筒瓦顶
  drawUpturnedTileRoof(ctx, cx - halfSpan - 12, beamY - 12, 68, 22, '#1e293b', '#94a3b8');
  drawUpturnedTileRoof(ctx, cx + halfSpan + 12, beamY - 12, 68, 22, '#1e293b', '#94a3b8');
  drawUpturnedTileRoof(ctx, cx, topY, 158, 34, '#1e293b', '#cfa349');

  // 牌坊檐下随风轻摆的红绸宫灯
  drawHangingSilkLantern(ctx, cx - halfSpan + 22, beamY + 28, t, 0.82);
  drawHangingSilkLantern(ctx, cx + halfSpan - 22, beamY + 28, t + 1.5, 0.82);

  ctx.restore();
}

/**
 * 正侧视飞檐镇魂土地古祠（含袅袅上升程序化檀香青烟与暖黄神龛灯火，彻底取代斜透视 prop_shrine 贴图！）
 */
export function drawOrthographicSaveShrine(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  t: number
): void {
  ctx.save();
  ctx.lineJoin = 'round';

  // 神龛暖金庇护光晕
  const halo = ctx.createRadialGradient(cx, groundY - 68, 10, cx, groundY - 68, 150);
  halo.addColorStop(0, 'rgba(251, 191, 36, 0.34)');
  halo.addColorStop(0.55, 'rgba(217, 119, 6, 0.1)');
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, groundY - 68, 150, 0, Math.PI * 2);
  ctx.fill();

  // 接地暗影
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.beginPath();
  ctx.ellipse(cx, groundY + 2, 62, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // 1. 须弥座雕花青石台基 (高 30px)
  ctx.fillStyle = '#273449';
  ctx.strokeStyle = '#060911';
  ctx.lineWidth = 2.2;
  ctx.fillRect(cx - 54, groundY - 26, 108, 26);
  ctx.strokeRect(cx - 54, groundY - 26, 108, 26);

  ctx.fillStyle = '#334155';
  ctx.fillRect(cx - 58, groundY - 32, 116, 7);
  ctx.strokeRect(cx - 58, groundY - 32, 116, 7);

  // 2. 祠堂石室背墙与神龛暖光内膛 (groundY - 104 .. groundY - 32)
  ctx.fillStyle = '#161e2e';
  ctx.fillRect(cx - 42, groundY - 104, 84, 72);
  ctx.strokeRect(cx - 42, groundY - 104, 84, 72);

  // 神龛拱门内膛与暖金长明灯
  ctx.fillStyle = '#1c100d';
  ctx.beginPath();
  ctx.arc(cx, groundY - 72, 22, Math.PI, 0);
  ctx.lineTo(cx + 22, groundY - 32);
  ctx.lineTo(cx - 22, groundY - 32);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const lampFlick = 14 + Math.sin(t * 9) * 2.5;
  const lg = ctx.createRadialGradient(cx, groundY - 78, 2, cx, groundY - 78, lampFlick * 2);
  lg.addColorStop(0, '#fef08a');
  lg.addColorStop(0.5, 'rgba(245, 158, 11, 0.6)');
  lg.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.arc(cx, groundY - 78, lampFlick * 2, 0, Math.PI * 2);
  ctx.fill();

  // 3. 左右朱漆檐柱
  for (const dir of [-1, 1]) {
    const px = cx + dir * 38;
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(px - 4.5, groundY - 104, 9, 72);
    ctx.strokeRect(px - 4.5, groundY - 104, 9, 72);
  }

  // 4. 青铜三足香炉与袅袅升腾檀香烟丝
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.ellipse(cx, groundY - 38, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.36)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(cx, groundY - 44);
  ctx.bezierCurveTo(
    cx + Math.sin(t * 2.4) * 10,
    groundY - 62,
    cx - Math.cos(t * 2.1) * 12,
    groundY - 82,
    cx + Math.sin(t * 1.7) * 8,
    groundY - 102
  );
  ctx.stroke();
  ctx.restore();

  // 5. 琉璃金瓦重檐歇山飞檐顶
  drawUpturnedTileRoof(ctx, cx, groundY - 142, 146, 40, '#78350f', '#f6dc8d');

  ctx.restore();
}

export function drawHangingSilkLantern(
  ctx: CanvasRenderingContext2D,
  x: number,
  topAnchorY: number,
  t: number,
  scale = 1
): void {
  const sway = Math.sin(t * 2.6 + x * 0.03) * 0.07;
  ctx.save();
  ctx.translate(x, topAnchorY);
  ctx.scale(scale, scale);
  ctx.rotate(sway);

  // 吊绳与铜钩
  ctx.strokeStyle = '#cfa349';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 10);
  ctx.stroke();

  // 红绸六角宫灯主体（浓墨描边 + 内透烛火渐变）
  const lg = ctx.createRadialGradient(0, 23, 2, 0, 23, 15);
  lg.addColorStop(0, '#fef08a');
  lg.addColorStop(0.45, '#ef4444');
  lg.addColorStop(1, '#7f1d1d');
  ctx.fillStyle = lg;
  ctx.strokeStyle = '#060911';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-10, 11, 20, 24, 6);
  ctx.fill();
  ctx.stroke();

  // 上下乌木鎏金灯箍
  ctx.fillStyle = '#cfa349';
  ctx.fillRect(-7, 9, 14, 3.5);
  ctx.strokeRect(-7, 9, 14, 3.5);
  ctx.fillRect(-7, 34, 14, 3.5);
  ctx.strokeRect(-7, 34, 14, 3.5);

  // 随风轻拂的朱红流苏穗子
  const tasselSway = Math.sin(t * 4.2 + x) * 3.5;
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, 38);
  ctx.quadraticCurveTo(tasselSway * 0.5, 45, tasselSway, 52);
  ctx.stroke();

  ctx.restore();
}

/**
 * 曲柄雕花木灯柱与摇曳红绸宫灯（彻底取代原本 6px 宽长方形木棍 + prop_lantern 抠图贴纸！）
 */
export function drawOrthographicLanternPost(
  ctx: CanvasRenderingContext2D,
  x: number,
  lampY: number,
  groundY: number,
  t: number
): void {
  const flick = Math.sin(t * 10 + x) * 4;
  const g = ctx.createRadialGradient(x + 12, lampY + 12, 3, x + 12, lampY + 12, 112 + flick);
  g.addColorStop(0, 'rgba(251, 146, 60, 0.34)');
  g.addColorStop(0.55, 'rgba(220, 38, 38, 0.11)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x + 12, lampY + 12, 115, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.strokeStyle = '#060911';
  ctx.lineWidth = 2;

  if (groundY < 520) {
    // 落地雕花灯杆与青石底座
    ctx.fillStyle = '#3b120e';
    ctx.fillRect(x - 3.5, lampY - 12, 7, Math.max(18, groundY - lampY + 12));
    ctx.strokeRect(x - 3.5, lampY - 12, 7, Math.max(18, groundY - lampY + 12));

    ctx.fillStyle = '#334155';
    ctx.fillRect(x - 8, groundY - 7, 16, 7);
    ctx.strokeRect(x - 8, groundY - 7, 16, 7);
  }

  // 横挑飞云曲木灯臂
  ctx.strokeStyle = '#4c1511';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(x, lampY - 10);
  ctx.quadraticCurveTo(x + 8, lampY - 15, x + 15, lampY - 8);
  ctx.stroke();

  drawHangingSilkLantern(ctx, x + 14, lampY - 8, t, 0.88);
  ctx.restore();
}
