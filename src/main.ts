import './style.css';
import { AudioFX } from './audio/GuofengAudio';
import { GameEngine } from './game/GameEngine';
import { InkVaniaRenderer } from './game/InkVaniaRenderer';
import { InputController } from './game/MotionInput';
import { SaveManager } from './meta/SaveManager';
import { NativeApp } from './platform/NativeAppBridge';
import { UIManager } from './ui/UIManager';

async function bootstrap() {
  const bootFill = document.getElementById('boot-bar-fill');
  const bootPct = document.getElementById('boot-pct');
  const bootLoader = document.getElementById('boot-loader');

  const setProgress = (pct: number) => {
    if (bootFill) bootFill.style.width = `${pct}%`;
    if (bootPct) bootPct.textContent = `${pct}%`;
  };

  setProgress(45);
  await NativeApp.init();
  const meta = SaveManager.loadMeta();
  AudioFX.init(meta.sfxMuted, meta.bgmMuted);
  setProgress(85);

  const gameRoot = document.getElementById('game-root') as HTMLElement;
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const uiLayer = document.getElementById('ui-layer') as HTMLElement;
  const landscapeGuard = document.getElementById('landscape-guard') as HTMLElement;
  const guardBtn = document.getElementById('btn-guard-landscape') as HTMLButtonElement;
  const ctx = canvas.getContext('2d', { alpha: false })!;

  const input = new InputController(canvas);
  input.controlStyle = meta.controlStyle;

  let ui!: UIManager;
  const engine = new GameEngine(input, {
    onShowBanner: (title, sub) => ui.showBanner(title, sub),
    onStartStory: (scene, onDone) => ui.startStoryDialogue(scene, onDone),
    onOpenInteractModal: (kind) => ui.openInteractModal(kind),
    onToggleMap: () => ui.toggleMapModal(),
    onTogglePause: () => ui.togglePauseModal(),
    onGameOver: () => ui.showGameOverModal(),
    onEndingReached: (kind, sec) => ui.showEndingModal(kind, sec),
  });

  ui = new UIManager(uiLayer, engine);
  const renderer = new InkVaniaRenderer();

  // 原生 Android 返回键联动游戏行囊菜单
  NativeApp.onBackButton(() => {
    if (engine.slot) {
      ui.togglePauseModal();
    }
  });

  guardBtn.onclick = () => {
    NativeApp.requestFullscreenAndLandscape();
  };

  let viewW = window.innerWidth;
  let viewH = window.innerHeight;

  const syncViewport = () => {
    viewW = Math.max(1, Math.round(gameRoot.clientWidth || window.innerWidth));
    viewH = Math.max(1, Math.round(gameRoot.clientHeight || window.innerHeight));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.max(1, Math.floor(viewW * dpr));
    const targetH = Math.max(1, Math.floor(viewH * dpr));

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    input.layoutVirtualControls(viewW, viewH);

    const portraitOnMobile = (NativeApp.isMobileOrTablet() || input.usingTouch) && viewH > viewW;
    landscapeGuard.classList.toggle('visible', portraitOnMobile);
    engine.landscapePaused = portraitOnMobile;
  };

  window.addEventListener('resize', syncViewport);
  window.visualViewport?.addEventListener('resize', syncViewport);
  document.addEventListener('fullscreenchange', syncViewport);
  window.addEventListener('orientationchange', () => {
    syncViewport();
    window.setTimeout(syncViewport, 180);
  });
  syncViewport();

  ui.showTitleScreen();
  setProgress(100);

  if (bootLoader) {
    bootLoader.classList.add('fade-out');
    window.setTimeout(() => bootLoader.remove(), 360);
  }

  let lastTs = performance.now();
  const frame = (now: number) => {
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
    lastTs = now;

    engine.update(dt);
    renderer.render(ctx, viewW, viewH, engine, input, dt);
    ui.syncHud();

    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

bootstrap();
