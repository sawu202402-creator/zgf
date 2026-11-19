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
 * 局内远景：八大主题 16:9 手绘大画卷 + 空气透视地平线雾化（彻底消除远景3D透视地面与近景2D横版石阶的透视打架！）
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
    const drawW = Math.max(vW * 1.24, vH * 1.2 * aspect);
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
      invGrad.addColorStop(0, 'rgba(92, 14, 38, 0.34)');
      invGrad.addColorStop(0.52, 'rgba(28, 9, 36, 0.42)');
      invGrad.addColorStop(0.8, 'rgba(12, 7, 20, 0.78)');
      invGrad.addColorStop(1, 'rgba(7, 5, 14, 0.92)');
      ctx.fillStyle = invGrad;
      ctx.fillRect(0, 0, vW, vH);
    } else {
      ctx.drawImage(bg, px, py, drawW, drawH);

      // 空气透视消融层：上方保留完整血月/星阁/万灯画卷，下半部 54%~100% 柔和融入区域烟霭，彻底消除双地面透视割裂！
      const depthGrad = ctx.createLinearGradient(0, 0, 0, vH);
      if (room.region === 'forge') {
        depthGrad.addColorStop(0, 'rgba(22, 8, 5, 0.1)');
        depthGrad.addColorStop(0.54, 'rgba(28, 10, 6, 0.28)');
        depthGrad.addColorStop(0.8, 'rgba(18, 7, 6, 0.74)');
        depthGrad.addColorStop(1, 'rgba(10, 5, 5, 0.9)');
      } else if (room.region === 'opera') {
        depthGrad.addColorStop(0, 'rgba(18, 7, 10, 0.08)');
        depthGrad.addColorStop(0.56, 'rgba(22, 10, 14, 0.26)');
        depthGrad.addColorStop(0.82, 'rgba(13, 8, 14, 0.74)');
        depthGrad.addColorStop(1, 'rgba(8, 6, 12, 0.9)');
      } else if (
        room.region === 'main_hall' ||
        room.region === 'library' ||
        room.region === 'clock_tower' ||
        room.region === 'altar'
      ) {
        depthGrad.addColorStop(0, 'rgba(8, 10, 18, 0.08)');
        depthGrad.addColorStop(0.55, 'rgba(12, 13, 22, 0.28)');
        depthGrad.addColorStop(0.8, 'rgba(9, 10, 18, 0.76)');
        depthGrad.addColorStop(1, 'rgba(6, 7, 13, 0.92)');
      } else {
        depthGrad.addColorStop(0, 'rgba(5, 10, 18, 0.08)');
        depthGrad.addColorStop(0.54, 'rgba(8, 15, 26, 0.28)');
        depthGrad.addColorStop(0.8, 'rgba(6, 11, 20, 0.76)');
        depthGrad.addColorStop(1, 'rgba(5, 8, 15, 0.92)');
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
 * 0.56x 中景建筑廊柱与幽竹剪影过渡层：
 * 衔接 0.22x 远景画卷与 1.0x 可行走舞台，使远中近三层空间浑然一体、移步换景！
 */
export function drawMidgroundParallaxArchitecture(
  ctx: CanvasRenderingContext2D,
  vW: number,
  vH: number,
  camLeft: number,
  room: BuiltRoom,
  t: number
): void {
  const scrollX = camLeft * 0.52;
  ctx.save();

  if (room.indoor) {
    // 室内深宫穿斗梁柱暗廊（中景沉稳木构立柱 + 横向额枋雀替剪影，建立真实大殿进深！）
    const baySpan = 250;
    const firstIdx = Math.floor((scrollX - 120) / baySpan);
    const lastIdx = Math.ceil((scrollX + vW + 120) / baySpan);

    const beamCol =
      room.region === 'forge'
        ? 'rgba(28, 12, 10, 0.62)'
        : room.region === 'opera'
          ? 'rgba(26, 11, 18, 0.58)'
          : 'rgba(11, 15, 26, 0.62)';
    const trimCol =
      room.region === 'forge'
        ? 'rgba(234, 88, 12, 0.16)'
        : 'rgba(198, 154, 69, 0.14)';

    // 中景横贯额枋横梁
    ctx.fillStyle = beamCol;
    ctx.fillRect(0, 56, vW, 18);
    ctx.strokeStyle = trimCol;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 74);
    ctx.lineTo(vW, 74);
    ctx.stroke();

    for (let i = firstIdx; i <= lastIdx; i++) {
      const sx = i * baySpan - scrollX;
      // 中景立柱主体
      ctx.fillStyle = beamCol;
      ctx.fillRect(sx - 13, 56, 26, vH - 56);
      // 柱头雀替斜撑
      ctx.beginPath();
      ctx.moveTo(sx - 13, 74);
      ctx.lineTo(sx - 38, 74);
      ctx.lineTo(sx - 13, 98);
      ctx.closePath();
      ctx.moveTo(sx + 13, 74);
      ctx.lineTo(sx + 38, 74);
      ctx.lineTo(sx + 13, 98);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = trimCol;
      ctx.strokeRect(sx - 13, 56, 26, vH - 56);
    }
  } else if (room.region === 'gatehouse') {
    // 苦竹瓮城：随夜风微曳的中景烟雨墨竹林剪影
    const clusterSpan = 190;
    const firstIdx = Math.floor((scrollX - 100) / clusterSpan);
    const lastIdx = Math.ceil((scrollX + vW + 100) / clusterSpan);
    ctx.strokeStyle = 'rgba(10, 19, 31, 0.68)';
    for (let i = firstIdx; i <= lastIdx; i++) {
      const baseX = i * clusterSpan - scrollX;
      for (let b = 0; b < 3; b++) {
        const bx = baseX + (b - 1) * 22 + ((i * 17 + b * 11) % 13);
        const sway = Math.sin(t * 1.1 + i * 0.9 + b) * 7;
        ctx.lineWidth = 4.5 - b * 0.8;
        ctx.beginPath();
        ctx.moveTo(bx, vH);
        ctx.quadraticCurveTo(bx + sway * 0.4, vH * 0.55, bx + sway, 45 + b * 24);
        ctx.stroke();
      }
    }
  } else if (room.region === 'prison') {
    // 寒潭水牢：中景钟乳奇石溶洞拱影
    const archSpan = 280;
    const firstIdx = Math.floor((scrollX - 140) / archSpan);
    const lastIdx = Math.ceil((scrollX + vW + 140) / archSpan);
    ctx.fillStyle = 'rgba(7, 15, 25, 0.58)';
    for (let i = firstIdx; i <= lastIdx; i++) {
      const sx = i * archSpan - scrollX;
      const dropH = 95 + (Math.abs(i * 37) % 65);
      ctx.beginPath();
      ctx.moveTo(sx - 36, 0);
      ctx.lineTo(sx + 36, 0);
      ctx.lineTo(sx + 6, dropH);
      ctx.lineTo(sx - 8, dropH * 0.82);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * 烘焙无缝一体的国风古建地形层：
 * 1. 室内连续【暗金回纹护墙裙 + 朱漆壁柱】（消除家具与人物悬在背景画上的贴纸感！）
 * 2. 同源石材无缝地基（青石板配青石砌体，墨玉殿砖配须弥雕花座，零色差断层！）
 * 3. 真·踏跺青石/汉白玉台阶与垂带护石（坡道不再切成 24px 锯齿碎片！）
 * 4. 三孔石拱桥桥台望柱衔接 + 左右跨房【朱漆描金门阙抱框】！
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

  // 0. 室内大殿连续【护墙须弥墙裙】（垫在地面正后方 48px 高，让书架/火盆/兵器架/角色自然生根于宫墙之下！）
  if (room.indoor) {
    const dadoH = 48;
    for (let x = 0; x < room.pixelW; x += 32) {
      if (isInsideDownShaft(room, x + 16)) continue;
      const gy = sampleSolidGroundY(room, x + 16);
      const topY = gy - dadoH;
      const dg = bctx.createLinearGradient(0, topY, 0, gy);
      if (room.region === 'forge') {
        dg.addColorStop(0, 'rgba(38, 16, 12, 0.72)');
        dg.addColorStop(1, 'rgba(18, 8, 7, 0.92)');
      } else {
        dg.addColorStop(0, 'rgba(17, 22, 36, 0.72)');
        dg.addColorStop(1, 'rgba(9, 12, 22, 0.92)');
      }
      bctx.fillStyle = dg;
      bctx.fillRect(x, topY, 32.6, dadoH);

      // 墙裙上沿描金压条
      bctx.fillStyle = 'rgba(198, 154, 69, 0.36)';
      bctx.fillRect(x, topY, 32.6, 2);
      bctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      bctx.fillRect(x, topY + 2, 32.6, 2);

      // 每隔 160px 嵌一道宫墙暗红壁柱基座
      if (x % 160 === 0) {
        bctx.fillStyle = 'rgba(72, 18, 18, 0.55)';
        bctx.fillRect(x + 8, topY - 18, 16, dadoH + 18);
        bctx.strokeStyle = 'rgba(198, 154, 69, 0.28)';
        bctx.lineWidth = 1;
        bctx.strokeRect(x + 8, topY - 18, 16, dadoH + 18);
      }
    }
  }

  // 1. 同源石材地基 + 平整石坪与真·踏跺台阶构建！
  if (floorImg) {
    const sw = floorImg.width;
    const sh = floorImg.height;
    const surfaceTopOffset = usePalaceMarble ? 20 : 6;

    // 1A. 截取当前地面贴图自身的下半部石砌层 (`subSrcY..sh`) 向下无缝叠砌，彻底杜绝跨贴图色差！
    const subSrcY = Math.floor(sh * (usePalaceMarble ? 0.44 : 0.34));
    const subSrcH = Math.max(24, sh - subSrcY - 2);

    for (let x = 0; x < room.pixelW; x += sw) {
      const stepSub = 32;
      for (let sxOff = 0; sxOff < sw && x + sxOff < room.pixelW; sxOff += stepSub) {
        const wx = x + sxOff;
        if (isInsideDownShaft(room, wx + 6) && isInsideDownShaft(room, wx + stepSub - 6)) continue;
        if (wz && wx >= wz.x1 + 22 && wx + stepSub <= wz.x2 - 22) continue;

        const gy = sampleSolidGroundY(room, Math.min(room.pixelW, wx + stepSub * 0.5));
        const startY = gy + (sh - surfaceTopOffset) - 8;
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

        // 地基深处自然暗角压暗，突出地面主行走线！
        const depthH = Math.max(0, room.pixelH - gy - 22);
        if (depthH > 0) {
          const subG = bctx.createLinearGradient(0, gy + 22, 0, room.pixelH);
          subG.addColorStop(0, 'rgba(4, 7, 14, 0.14)');
          subG.addColorStop(1, 'rgba(3, 5, 11, 0.76)');
          bctx.fillStyle = subG;
          bctx.fillRect(wx, gy + 22, wClip + 0.6, depthH);
        }
      }
    }

    // 1B. 表层地面：平地采用连续大跨石板，斜坡自动生成【真·青石/汉白玉层叠踏跺石阶】！
    const stepW = 26;
    for (let x = 0; x < room.pixelW; x += stepW) {
      if (isInsideDownShaft(room, x + 4) || isInsideDownShaft(room, x + stepW - 4)) continue;
      if (wz && x >= wz.x1 + 12 && x <= wz.x2 - stepW - 12) continue;

      const gyLeft = sampleSolidGroundY(room, x);
      const gyRight = sampleSolidGroundY(room, Math.min(room.pixelW, x + stepW));
      const gyMid = (gyLeft + gyRight) * 0.5;
      const slopeDiff = Math.abs(gyRight - gyLeft);

      if (slopeDiff > 1.4) {
        // 斜坡段：绘制水平层叠石阶踏面 + 踢脚暗影 + 须弥垂带护边，彻底告别锯齿断纹！
        const treadY = Math.min(gyLeft, gyRight);
        const riserH = Math.max(12, slopeDiff + 14);
        const sx = ((x % sw) + sw) % sw;
        const grabW = Math.min(stepW + 4, sw - sx);

        // 台阶下方实心石座填充
        bctx.drawImage(
          floorImg,
          sx,
          subSrcY,
          Math.max(8, grabW),
          subSrcH,
          x - 2,
          treadY + 8,
          stepW + 4,
          sh - 8
        );

        // 水平石阶踏板面
        bctx.fillStyle = usePalaceMarble ? '#1e293b' : '#334e68';
        bctx.strokeStyle = '#090d16';
        bctx.lineWidth = 1.4;
        bctx.fillRect(x - 2, treadY - 2, stepW + 4, 11);
        bctx.strokeRect(x - 2, treadY - 2, stepW + 4, 11);

        // 踏面高光石棱与金线
        bctx.fillStyle = usePalaceMarble ? 'rgba(246, 220, 141, 0.55)' : 'rgba(186, 230, 253, 0.42)';
        bctx.fillRect(x - 1, treadY - 1, stepW + 2, 2.2);

        // 台阶立面咬合投影
        bctx.fillStyle = 'rgba(3, 6, 12, 0.52)';
        bctx.fillRect(x - 2, treadY + 9, stepW + 4, riserH * 0.5);
      } else {
        // 平整台地段：无损绘制完整手绘殿砖/青石板
        const sx = ((x % sw) + sw) % sw;
        const grabW = Math.min(stepW, sw - sx);
        bctx.drawImage(floorImg, sx, 0, grabW, sh, x, gyMid - surfaceTopOffset, stepW + 0.7, sh);
      }
    }
  }

  // 2. 护城河段：绘制完整三孔雕栏石拱桥 (`env_bridge.webp`) + 左右两岸【桥台石墩与望柱】无缝咬合！
  if (wz && bridgeImg) {
    const bridgeSpanW = wz.x2 - wz.x1 + 36;
    const bridgeH = bridgeSpanW * (bridgeImg.height / bridgeImg.width);
    const endRoadY = sampleSolidGroundY(room, wz.x1);
    const drawTopY = endRoadY - bridgeH * 0.61;
    bctx.drawImage(bridgeImg, wz.x1 - 18, drawTopY, bridgeSpanW, bridgeH);

    // 桥头两岸衔接石墩与抱鼓望柱（彻底遮蔽拱桥贴图左右裁切硬边！）
    for (const abutX of [wz.x1 - 16, wz.x2 + 16]) {
      const gy = sampleSolidGroundY(room, abutX);
      // 驳岸桥台青石墩
      const ag = bctx.createLinearGradient(0, gy - 6, 0, room.pixelH);
      ag.addColorStop(0, '#2c4257');
      ag.addColorStop(0.35, '#1b2b3a');
      ag.addColorStop(1, '#09101a');
      bctx.fillStyle = ag;
      bctx.strokeStyle = '#090d16';
      bctx.lineWidth = 1.6;
      bctx.fillRect(abutX - 18, gy - 4, 36, room.pixelH - gy + 6);
      bctx.strokeRect(abutX - 18, gy - 4, 36, room.pixelH - gy + 6);

      // 桥头莲花望柱
      bctx.fillStyle = '#3b556e';
      bctx.fillRect(abutX - 6, gy - 34, 12, 32);
      bctx.strokeRect(abutX - 6, gy - 34, 12, 32);
      bctx.fillStyle = '#64829e';
      bctx.beginPath();
      bctx.arc(abutX, gy - 37, 6.5, 0, Math.PI * 2);
      bctx.fill();
      bctx.stroke();
    }
  }

  // 3. 城门石券洞、宫殿藻井顶棚与雕梁额枋收边
  for (const cs of room.ceilingSpans) {
    const cw = cs.x2 - cs.x1;
    bctx.fillStyle = '#090d17';
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
    cg.addColorStop(0, 'rgba(4, 6, 12, 0.8)');
    cg.addColorStop(0.84, 'rgba(8, 11, 20, 0.34)');
    cg.addColorStop(1, 'rgba(15, 20, 32, 0.75)');
    bctx.fillStyle = cg;
    bctx.fillRect(cs.x1, 0, cw, cs.bottomY);

    // 顶棚底沿：朱漆描金宫殿额枋梁带（让天花板与室内柱网浑然一体！）
    bctx.fillStyle = room.indoor ? '#3b1214' : '#1e293b';
    bctx.fillRect(cs.x1, cs.bottomY - 12, cw, 12);
    bctx.fillStyle = '#c69a45';
    bctx.fillRect(cs.x1, cs.bottomY - 13, cw, 2);
    bctx.fillRect(cs.x1, cs.bottomY - 2, cw, 2);
  }

  // 4. 左右厚重山墙与【朱漆描金门阙抱框】（告别生硬截断砖条，跨门如穿真实古建门廊！）
  const bakeSideWallAndDoors = (side: 'left' | 'right') => {
    const doors = getRoomSideDoors(room, side).sort((a, b) => a.floorY - b.floorY);
    const wallW = 36;
    const wx = side === 'left' ? 0 : room.pixelW - wallW;
    const groundAtSide = sampleSolidGroundY(room, side === 'left' ? 12 : room.pixelW - 12);

    const drawSolidWallSegment = (y1: number, y2: number) => {
      if (y2 - y1 <= 4) return;
      bctx.fillStyle = '#090d16';
      bctx.fillRect(wx, y1, wallW, y2 - y1);
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
      // 内侧青铜包边立线
      const innerX = side === 'left' ? wallW - 2 : wx;
      bctx.fillStyle = 'rgba(198, 154, 69, 0.35)';
      bctx.fillRect(innerX, y1, 2, y2 - y1);
    };

    if (doors.length === 0) {
      if (room.indoor || room.gridH > 1) {
        drawSolidWallSegment(0, groundAtSide);
      }
      return;
    }

    let cursorY = 0;
    for (const d of doors) {
      const doorTop = d.floorY - 126;
      drawSolidWallSegment(cursorY, doorTop);

      // 门阙上方雕金门楣额枋 + 门簪 + 侧立抱框红柱 + 青石门槛
      const frameX = side === 'left' ? 0 : room.pixelW - 44;
      bctx.fillStyle = '#451215';
      bctx.strokeStyle = '#c69a45';
      bctx.lineWidth = 1.6;
      bctx.fillRect(frameX, doorTop - 14, 44, 16);
      bctx.strokeRect(frameX, doorTop - 14, 44, 16);

      // 门簪铜饰
      bctx.fillStyle = '#f6dc8d';
      bctx.fillRect(frameX + 10, doorTop - 9, 6, 6);
      bctx.fillRect(frameX + 26, doorTop - 9, 6, 6);

      // 门侧半露朱漆抱框立柱与门槛石
      const jambX = side === 'left' ? 0 : room.pixelW - 10;
      bctx.fillStyle = '#380f12';
      bctx.fillRect(jambX, doorTop + 2, 10, 124);
      bctx.fillStyle = '#334155';
      bctx.fillRect(side === 'left' ? 0 : room.pixelW - 38, d.floorY - 4, 38, 8);

      // 穿堂暖金灯火接引光晕
      const dg = bctx.createLinearGradient(
        side === 'left' ? 0 : room.pixelW,
        0,
        side === 'left' ? 88 : room.pixelW - 88,
        0
      );
      dg.addColorStop(0, 'rgba(251, 191, 36, 0.28)');
      dg.addColorStop(0.55, 'rgba(249, 115, 22, 0.09)');
      dg.addColorStop(1, 'rgba(0, 0, 0, 0)');
      bctx.fillStyle = dg;
      bctx.fillRect(side === 'left' ? 0 : room.pixelW - 88, doorTop + 2, 88, 124);

      cursorY = d.floorY + 6;
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

function resolveSupportFloorBelow(room: BuiltRoom, px: number, deckY: number): number {
  let bestY = sampleSolidGroundY(room, px);
  for (const other of room.pavilions) {
    if (other.y > deckY + 24 && other.y < bestY && px >= other.x + 8 && px <= other.x + other.w - 8) {
      bestY = other.y;
    }
  }
  return bestY;
}

function drawSupportTimberColumn(
  ctx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  botY: number,
  colW: number,
  isStone: boolean
): void {
  const h = botY - topY;
  if (h <= 16) return;

  ctx.save();
  // 立柱立体圆弧光影（暗朱大漆木柱或寒铁青石柱，自然退入中后景不抢角色视线！）
  const cg = ctx.createLinearGradient(cx - colW * 0.5, 0, cx + colW * 0.5, 0);
  if (isStone) {
    cg.addColorStop(0, '#0f172a');
    cg.addColorStop(0.36, '#334155');
    cg.addColorStop(0.75, '#1e293b');
    cg.addColorStop(1, '#090d16');
  } else {
    cg.addColorStop(0, '#1f090b');
    cg.addColorStop(0.36, '#5c191c');
    cg.addColorStop(0.75, '#3b1013');
    cg.addColorStop(1, '#160608');
  }
  ctx.fillStyle = cg;
  ctx.strokeStyle = 'rgba(9, 13, 22, 0.88)';
  ctx.lineWidth = 1.3;
  ctx.fillRect(cx - colW * 0.5, topY, colW, h);
  ctx.strokeRect(cx - colW * 0.5, topY, colW, h);

  // 柱头雀替横箍与底部须弥莲瓣柱础石
  ctx.fillStyle = '#c69a45';
  ctx.fillRect(cx - colW * 0.62, topY + 2, colW * 1.24, 3);

  const plinthW = colW * 1.55;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(cx - plinthW * 0.5, botY - 8, plinthW, 8);
  ctx.strokeRect(cx - plinthW * 0.5, botY - 8, plinthW, 8);

  // 柱础落地接触暗影
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.ellipse(cx, botY + 1, plinthW * 0.68, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * 绘制平台：室内采用雕栏红木阁楼回廊 `env_indoor_ledge`，露天/戏街采用飞檐朱漆阁台 `env_pavilion`，
 * 并自动向下生根【承重朱漆立柱 + 柱础石 / 贴墙挑梁牛腿】，彻底告别空中悬空贴纸感！
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

  // 竖井井口平齐过渡踏板
  if (!hasPillars && Math.abs(y - groundHere) < 18) {
    const src = indoorImg || pvImg;
    if (src) {
      const sy = Math.floor(src.height * 0.37);
      const sh = Math.floor(src.height * 0.16);
      ctx.drawImage(src, 16, sy, src.width - 32, sh, x - 2, y - 3, w + 4, 15);
    }
    return;
  }

  const isStoneRegion = room.region === 'prison' || room.region === 'forge';
  const nearLeftWall = x <= 54;
  const nearRightWall = x + w >= room.pixelW - 54;

  // 1. 先绘制阁台下方承重立柱或贴墙挑梁雀替（让每一座高台都稳稳生根于建筑结构之中！）
  const spanCount = w > 420 ? 3 : 2;
  for (let i = 0; i < spanCount; i++) {
    const ratio = spanCount === 2 ? (i === 0 ? 0.2 : 0.8) : 0.15 + i * 0.35;
    const px = x + w * ratio;
    if (isInsideDownShaft(room, px)) continue;
    const supY = resolveSupportFloorBelow(room, px, y);
    if (supY - y > 52 && supY - y < 460) {
      drawSupportTimberColumn(ctx, px, y + 18, supY, hasPillars ? 15 : 12, isStoneRegion);
    }
  }

  if (nearLeftWall) {
    ctx.fillStyle = '#3b1215';
    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x + 42, y + 8);
    ctx.lineTo(x, y + 46);
    ctx.closePath();
    ctx.fill();
  }
  if (nearRightWall) {
    ctx.fillStyle = '#3b1215';
    ctx.beginPath();
    ctx.moveTo(x + w, y + 8);
    ctx.lineTo(x + w - 42, y + 8);
    ctx.lineTo(x + w, y + 46);
    ctx.closePath();
    ctx.fill();
  }

  // 阁台底面柔和遮蔽暗影
  const underG = ctx.createLinearGradient(0, y + 6, 0, y + 36);
  underG.addColorStop(0, 'rgba(3, 5, 11, 0.58)');
  underG.addColorStop(1, 'rgba(3, 5, 11, 0)');
  ctx.fillStyle = underG;
  ctx.fillRect(x + 4, y + 6, Math.max(0, w - 8), 30);

  // 2. 绘制阁台雕栏本体
  if (room.indoor && !hasPillars && indoorImg) {
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
