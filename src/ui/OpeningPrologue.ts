import { AudioFX } from '../audio/GuofengAudio';
import { AssetKey, Assets } from '../game/AssetLoader';
import { renderModularLiYichengRig } from '../game/CharacterArt';
import { drawPaintedChainTrack, drawPaintedVfxDisc } from '../game/GuofengWorldArt';

interface PrologueAct {
  seal: string;
  title: string;
  lines: string[];
  duration: number;
}

const STORY_ACTS: PrologueAct[] = [
  {
    seal: '卷首 · 甲申异变',
    title: '血 月 倾 城',
    lines: [
      '三年前，甲申七月十五，大靖旧都玄城。',
      '内廷权贵贪图长生，私凿皇城地肺龙脉，惊醒忘川之下的太古尸仙【烛阴】——血月当空，满城宫阙一夜化作百鬼绝域。',
    ],
    duration: 5.2,
  },
  {
    seal: '卷二 · 凌霄活锁',
    title: '孤 身 镇 渊',
    lines: [
      '大厦将倾之夜，镇妖司魁首裴无极怒斩奸佞，登临凌霄祭天坛。',
      '他自引【九幽蚀心蛊】入眉心，以血肉之躯化作活锁封死玄城四门；朝野不知其义，反诬裴门师徒叛国堕魔。',
    ],
    duration: 5.2,
  },
  {
    seal: '终卷 · 夜渡苦竹',
    title: '孤 剑 问 月',
    lines: [
      '三年后，血月重临，封城铁锁渐生裂痕。',
      '镇妖司末代传人李逸承怀揣半枚玄鸟残玉，提一柄凡铁长剑踏入苦竹夜雨——纵前路十殿阎罗，亦要斩破迷障，迎师归尘！',
    ],
    duration: 5.4,
  },
];

const XIAO_ACTS: PrologueAct[] = [
  STORY_ACTS[0],
  STORY_ACTS[1],
  {
    seal: '特别篇 · 寒星银枪',
    title: '少 统 领 传',
    lines: [
      '甲申封城以来，镇妖司少统领萧断水独守玄城一千余夜。',
      '今夜九幽阴兵再起波澜，一杆龙胆亮银枪寒芒重绽，誓为师门荡平合城妖氛！',
    ],
    duration: 5.0,
  },
];

interface DriftParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  rot: number;
  vRot: number;
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  key: AssetKey,
  viewW: number,
  viewH: number,
  zoom = 1.08,
  panX = 0,
  panY = 0,
  alpha = 1
): void {
  const img = Assets.get(key);
  if (!img || img.width <= 0 || img.height <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  const scale = Math.max(viewW / img.width, viewH / img.height) * zoom;
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = (viewW - dw) * 0.5 + panX;
  const dy = (viewH - dh) * 0.5 + panY;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

/**
 * 首次踏入玄城时的 60fps 纯正国风重彩水墨动态序章画卷：
 * 支持轻触推进分镜、右上角一键跳过，并在尾声直接无缝叠化切入苦竹外哨实机漫步入场！
 */
export function playOpeningPrologue(
  uiLayer: HTMLElement,
  mode: 'story' | 'xiaoduanshui',
  onStartLiveWorldBeneath: () => void,
  onFinishedDissolve: () => void
): () => void {
  const acts = mode === 'xiaoduanshui' ? XIAO_ACTS : STORY_ACTS;
  const isXiao = mode === 'xiaoduanshui';

  const root = document.createElement('div');
  root.className = 'zx-prologue-overlay';
  root.innerHTML = `
    <canvas class="zx-prologue-canvas"></canvas>
    <div class="zx-prologue-ui">
      <div class="zx-prologue-topbar">
        <div class="zx-prologue-dots" id="prologue-dots"></div>
        <button type="button" class="zx-seal-btn zx-prologue-skip" id="btn-prologue-skip">跳过序章 ▸</button>
      </div>
      <div class="zx-prologue-caption-wrap">
        <div class="zx-prologue-seal-row">
          <span class="zx-prologue-seal" id="prologue-seal"></span>
          <span class="zx-prologue-title" id="prologue-title"></span>
        </div>
        <p class="zx-prologue-line" id="prologue-line-0"></p>
        <p class="zx-prologue-line zx-prologue-line-sub" id="prologue-line-1"></p>
        <div class="zx-prologue-hint" id="prologue-hint">轻触画面继续 ▸</div>
      </div>
    </div>
  `;
  uiLayer.appendChild(root);

  const canvas = root.querySelector('.zx-prologue-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const dotsEl = root.querySelector('#prologue-dots') as HTMLElement;
  const sealEl = root.querySelector('#prologue-seal') as HTMLElement;
  const titleEl = root.querySelector('#prologue-title') as HTMLElement;
  const line0El = root.querySelector('#prologue-line-0') as HTMLElement;
  const line1El = root.querySelector('#prologue-line-1') as HTMLElement;
  const skipBtn = root.querySelector('#btn-prologue-skip') as HTMLButtonElement;
  const uiWrap = root.querySelector('.zx-prologue-ui') as HTMLElement;

  let actIdx = 0;
  let actTimer = 0;
  let totalTime = 0;
  let crossFade = 1; // 1 -> 0 揭幕渐显
  let dissolvingOut = false;
  let dissolveTimer = 0;
  const dissolveDuration = 0.72;
  let destroyed = false;
  let rafId = 0;

  const embers: DriftParticle[] = Array.from({ length: 42 }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: -0.03 - Math.random() * 0.05,
    vy: -0.05 - Math.random() * 0.09,
    size: 1.4 + Math.random() * 2.8,
    alpha: 0.35 + Math.random() * 0.6,
    rot: Math.random() * Math.PI * 2,
    vRot: (Math.random() - 0.5) * 3,
  }));

  const syncActText = () => {
    const act = acts[actIdx];
    if (!act) return;
    sealEl.textContent = act.seal;
    titleEl.textContent = act.title;
    line0El.textContent = act.lines[0] || '';
    line1El.textContent = act.lines[1] || '';
    dotsEl.innerHTML = acts
      .map(
        (_, i) =>
          `<span class="zx-pdot ${i === actIdx ? 'active' : i < actIdx ? 'done' : ''}"></span>`
      )
      .join('');
    AudioFX.playHit(false);
  };

  const beginLiveCrossDissolve = () => {
    if (dissolvingOut || destroyed) return;
    dissolvingOut = true;
    dissolveTimer = 0;
    AudioFX.playRelicBell();
    // 提前在底层启动实机画面与主角漫步入场，让水墨序章平滑融化进真实关卡，零黑屏、零突兀切镜！
    onStartLiveWorldBeneath();
    root.style.pointerEvents = 'none';
  };

  const openedAt = performance.now();
  let actEnteredAt = openedAt;
  let lastTapAt = 0;
  let lastBlockedInputAt = 0;

  const advanceAct = () => {
    if (dissolvingOut || destroyed) return;
    if (actIdx < acts.length - 1) {
      actIdx++;
      actTimer = 0;
      actEnteredAt = performance.now();
      crossFade = 0.85;
      syncActText();
    } else {
      beginLiveCrossDissolve();
    }
  };

  const tryAdvanceAct = () => {
    const now = performance.now();
    if (now - openedAt < 500 || now - lastBlockedInputAt < 440) {
      lastBlockedInputAt = now;
      return;
    }
    if (now - actEnteredAt < 440 || now - lastTapAt < 440) return;
    lastTapAt = now;
    advanceAct();
  };

  const safeSkip = () => {
    const now = performance.now();
    if (now - openedAt < 450 || now - lastTapAt < 280) return;
    lastTapAt = now;
    beginLiveCrossDissolve();
  };

  if (typeof window.PointerEvent !== 'undefined') {
    let skipPointerId: number | null = null;
    skipBtn.addEventListener('pointerdown', (ev) => {
      ev.stopPropagation();
      if (ev.isTrusted && skipPointerId === null) skipPointerId = ev.pointerId;
    });
    skipBtn.addEventListener('pointerup', (ev) => {
      ev.stopPropagation();
      if (ev.pointerId !== skipPointerId) return;
      skipPointerId = null;
      if (ev.isTrusted) safeSkip();
    });
    skipBtn.addEventListener('pointercancel', (ev) => {
      if (ev.pointerId === skipPointerId) skipPointerId = null;
    });

    let activePointerId: number | null = null;
    let downX = 0;
    let downY = 0;
    root.addEventListener('pointerdown', (ev) => {
      if ((ev.target as HTMLElement | null)?.closest('#btn-prologue-skip')) return;
      if (!ev.isTrusted || activePointerId !== null) return;
      activePointerId = ev.pointerId;
      downX = ev.clientX;
      downY = ev.clientY;
    });
    root.addEventListener('pointerup', (ev) => {
      if (ev.pointerId !== activePointerId) return;
      activePointerId = null;
      if ((ev.target as HTMLElement | null)?.closest('#btn-prologue-skip')) return;
      if (ev.isTrusted && Math.hypot(ev.clientX - downX, ev.clientY - downY) <= 28) {
        tryAdvanceAct();
      }
    });
    root.addEventListener('pointercancel', (ev) => {
      if (ev.pointerId === activePointerId) {
        activePointerId = null;
      }
    });
  } else {
    skipBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      safeSkip();
    });
    root.addEventListener('click', (ev) => {
      if ((ev.target as HTMLElement | null)?.closest('#btn-prologue-skip')) return;
      tryAdvanceAct();
    });
  }
  root.addEventListener(
    'touchend',
    (ev) => {
      if (ev.cancelable) ev.preventDefault();
    },
    { passive: false }
  );

  const heldCodes = new Set<string>();
  const onKeyDown = (ev: KeyboardEvent) => {
    if (!ev.isTrusted || ev.repeat || heldCodes.has(ev.code)) return;
    heldCodes.add(ev.code);
    if (ev.code === 'Escape') {
      ev.preventDefault();
      if (performance.now() - openedAt >= 450) beginLiveCrossDissolve();
    } else if (
      ev.code === 'Space' ||
      ev.code === 'Enter' ||
      ev.code === 'KeyJ' ||
      ev.code === 'KeyZ' ||
      ev.code === 'KeyK'
    ) {
      ev.preventDefault();
      if (performance.now() - openedAt >= 500) tryAdvanceAct();
    }
  };
  const onKeyUp = (ev: KeyboardEvent) => {
    heldCodes.delete(ev.code);
  };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  const cleanup = () => {
    if (destroyed) return;
    destroyed = true;
    cancelAnimationFrame(rafId);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    root.remove();
  };

  syncActText();
  AudioFX.playRelicBell();

  let lastTs = performance.now();
  const renderFrame = (now: number) => {
    if (destroyed) return;
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
    lastTs = now;
    totalTime += dt;

    if (dissolvingOut) {
      dissolveTimer += dt;
      const p = Math.min(1, dissolveTimer / dissolveDuration);
      root.style.opacity = `${(1 - p * p).toFixed(3)}`;
      if (uiWrap) {
        uiWrap.style.opacity = `${Math.max(0, 1 - p * 2.4).toFixed(3)}`;
      }
      if (p >= 1) {
        cleanup();
        onFinishedDissolve();
        return;
      }
    } else {
      actTimer += dt;
      crossFade = Math.max(0, crossFade - dt * 2.6);
    }

    const viewW = Math.max(1, root.clientWidth || window.innerWidth);
    const viewH = Math.max(1, root.clientHeight || window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = Math.round(viewW * dpr);
    const ch = Math.round(viewH * dpr);
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const tProg = Math.min(1, actTimer / Math.max(1, acts[actIdx]?.duration || 5));

    // 底色深墨夜空
    ctx.fillStyle = '#05070e';
    ctx.fillRect(0, 0, viewW, viewH);

    if (actIdx === 0) {
      // 第一幕分镜：皇城重檐与赤月蚀天
      drawCoverImage(
        ctx,
        'bg_city_avenue',
        viewW,
        viewH,
        1.06 + tProg * 0.08,
        -tProg * 18,
        18 - tProg * 28,
        0.78
      );

      // 苍穹赤月日蚀光轮
      const moonX = viewW * 0.68;
      const moonY = viewH * (0.29 - tProg * 0.04);
      const moonR = Math.min(viewW, viewH) * 0.145;
      const eclipse = Math.min(1, 0.25 + tProg * 0.85);

      const corona = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, moonR * 2.8);
      corona.addColorStop(0, `rgba(220, 38, 38, ${0.42 + eclipse * 0.28})`);
      corona.addColorStop(0.45, 'rgba(153, 27, 27, 0.22)');
      corona.addColorStop(1, 'rgba(5, 7, 14, 0)');
      ctx.fillStyle = corona;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR * 2.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fecaca';
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(153, 27, 27, ${0.65 + eclipse * 0.28})`;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR * 0.98, 0, Math.PI * 2);
      ctx.fill();

      // 月蚀黑影缓缓吞没金月，只留血色日冕弦光
      ctx.fillStyle = 'rgba(12, 6, 14, 0.86)';
      ctx.beginPath();
      ctx.arc(moonX - moonR * (0.52 - eclipse * 0.36), moonY - 2, moonR * 0.93, 0, Math.PI * 2);
      ctx.fill();

      // 地肺紫赤尸气上涌
      const miasma = ctx.createLinearGradient(0, viewH * 0.45, 0, viewH);
      miasma.addColorStop(0, 'rgba(127, 29, 29, 0)');
      miasma.addColorStop(0.65, 'rgba(88, 28, 135, 0.28)');
      miasma.addColorStop(1, 'rgba(6, 8, 16, 0.92)');
      ctx.fillStyle = miasma;
      ctx.fillRect(0, viewH * 0.45, viewW, viewH * 0.55);
    } else if (actIdx === 1) {
      // 第二幕分镜：凌霄祭天坛 · 孤身锁渊（八卦金锁 + 锁龙铁链 + 魁首背影）
      drawCoverImage(
        ctx,
        'bg_sky_altar',
        viewW,
        viewH,
        1.14 - tProg * 0.06,
        0,
        -10 + tProg * 16,
        0.8
      );

      const cx = viewW * 0.52;
      const cy = viewH * 0.42;
      const sealR = Math.min(viewW, viewH) * 0.24;

      // 凌霄镇渊古八卦残阵 + 四方朱砂锁链贯入阵心
      drawPaintedVfxDisc(
        ctx,
        'vfx_bagua_formation',
        cx,
        cy,
        sealR,
        totalTime * 0.35,
        0.74,
        '#fbbf24',
        1,
        true
      );

      // 四方朱砂锁城光链贯入阵心
      for (const [sx, sy] of [
        [0, viewH * 0.12],
        [viewW, viewH * 0.14],
        [0, viewH * 0.76],
        [viewW, viewH * 0.72],
      ]) {
        drawPaintedChainTrack(
          ctx,
          sx,
          sy,
          cx,
          cy,
          12,
          0.68,
          '#f87171',
          2.6,
          4,
          totalTime * 5.2
        );
      }

      // 恩师裴无极孤身镇坛剪影
      const peiSilhouette = Assets.getTintedSilhouette('boss_pei_0', '#1e1b2e', true) || Assets.get('boss_pei_0');
      if (peiSilhouette) {
        const targetH = Math.min(viewH * 0.52, 250);
        const targetW = peiSilhouette.width * (targetH / Math.max(1, peiSilhouette.height));
        ctx.save();
        const halo = ctx.createRadialGradient(cx, cy, 8, cx, cy, targetH * 0.68);
        halo.addColorStop(0, 'rgba(239, 68, 68, 0.48)');
        halo.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(cx, cy, targetH * 0.68, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(peiSilhouette, cx - targetW * 0.5, cy - targetH * 0.46, targetW, targetH);
        ctx.restore();
      }

      // 偶发赤色惊雷映亮天坛
      const flash = Math.max(0, Math.sin(totalTime * 5.2) - 0.92) * 3.2;
      if (flash > 0.01) {
        ctx.fillStyle = `rgba(254, 226, 226, ${Math.min(0.22, flash)})`;
        ctx.fillRect(0, 0, viewW, viewH);
      }
    } else {
      // 第三幕分镜：苦竹夜雨 · 主角提剑疾行奔赴玄城！
      drawCoverImage(
        ctx,
        'bg_bamboo_cliff',
        viewW,
        viewH,
        1.12,
        -tProg * 36,
        -4,
        0.86
      );

      // 远处雾中若隐若现的正阳城楼剪影
      drawCoverImage(
        ctx,
        'bg_gatehouse',
        viewW,
        viewH,
        0.95,
        viewW * 0.24 - tProg * 22,
        -viewH * 0.06,
        0.24
      );

      // 苦竹石阶地面与青雾
      const groundY = viewH * 0.68;
      const roadGrad = ctx.createLinearGradient(0, groundY - 12, 0, viewH);
      roadGrad.addColorStop(0, 'rgba(15, 23, 42, 0.72)');
      roadGrad.addColorStop(0.25, 'rgba(9, 13, 24, 0.94)');
      roadGrad.addColorStop(1, '#04060c');
      ctx.fillStyle = roadGrad;
      ctx.fillRect(0, groundY - 12, viewW, viewH - groundY + 12);

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(viewW, groundY);
      ctx.stroke();

      // 60fps 真人骨骼主角迎风奔赴玄城（不带任何年龄字样，纯粹侠客气韵！）
      const heroX = viewW * (0.34 + tProg * 0.14);
      const heroScale = Math.max(1.15, Math.min(1.65, viewH / 290));

      // 胸前玄鸟残玉微光
      ctx.save();
      const jadeGlow = ctx.createRadialGradient(
        heroX + 8,
        groundY - 46 * heroScale,
        2,
        heroX + 8,
        groundY - 46 * heroScale,
        46
      );
      jadeGlow.addColorStop(0, isXiao ? 'rgba(192, 132, 252, 0.45)' : 'rgba(45, 212, 191, 0.46)');
      jadeGlow.addColorStop(1, 'rgba(45, 212, 191, 0)');
      ctx.fillStyle = jadeGlow;
      ctx.beginPath();
      ctx.arc(heroX + 8, groundY - 46 * heroScale, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      renderModularLiYichengRig(ctx, {
        x: heroX,
        y: groundY,
        facing: 1,
        vx: 185,
        vy: 0,
        onGround: true,
        runCycle: totalTime * 9.2,
        animTime: totalTime,
        landSquash: 0,
        doubleJumpSpin: 0,
        equippedWeaponId: isXiao ? 'spear_2' : 'sword_0',
        secondaryWeaponId: undefined,
        slash: null,
        scale: heroScale,
        isXiaoMode: isXiao,
      });

      // 斜风细雨银丝
      ctx.save();
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.22)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (let i = 0; i < 48; i++) {
        const rx = (((i * 97 + totalTime * 520) % (viewW + 160)) + (viewW + 160)) % (viewW + 160) - 80;
        const ry = (((i * 61 + totalTime * 760) % (viewH + 120)) + (viewH + 120)) % (viewH + 120) - 60;
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 14, ry + 28);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 飘散流火残烬 / 翠竹落叶粒子
    ctx.save();
    for (const p of embers) {
      p.x += p.vx * dt;
      p.y += (actIdx === 2 ? Math.abs(p.vy) * 0.8 : p.vy) * dt;
      p.rot += p.vRot * dt;
      if (p.x < -0.05) p.x = 1.05;
      if (p.x > 1.05) p.x = -0.05;
      if (p.y < -0.05) p.y = 1.05;
      if (p.y > 1.05) p.y = -0.05;

      const px = p.x * viewW;
      const py = p.y * viewH;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      if (actIdx === 2) {
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 2.1, p.size * 0.72, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = p.size > 2.8 ? '#fde047' : '#f87171';
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();

    // 电影宽银幕上下柔和暗角（衬托底部古籍唱词，中部画面通透清亮！）
    const topVig = ctx.createLinearGradient(0, 0, 0, viewH * 0.18);
    topVig.addColorStop(0, 'rgba(3, 5, 10, 0.72)');
    topVig.addColorStop(1, 'rgba(3, 5, 10, 0)');
    ctx.fillStyle = topVig;
    ctx.fillRect(0, 0, viewW, viewH * 0.18);

    const botVig = ctx.createLinearGradient(0, viewH * 0.56, 0, viewH);
    botVig.addColorStop(0, 'rgba(3, 5, 10, 0)');
    botVig.addColorStop(0.55, 'rgba(4, 7, 15, 0.82)');
    botVig.addColorStop(1, 'rgba(3, 5, 10, 0.95)');
    ctx.fillStyle = botVig;
    ctx.fillRect(0, viewH * 0.56, viewW, viewH * 0.44);

    if (crossFade > 0.01) {
      ctx.fillStyle = `rgba(4, 6, 12, ${Math.min(0.88, crossFade)})`;
      ctx.fillRect(0, 0, viewW, viewH);
    }

    rafId = requestAnimationFrame(renderFrame);
  };

  rafId = requestAnimationFrame(renderFrame);
  return cleanup;
}
