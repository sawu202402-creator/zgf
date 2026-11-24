declare global {
  interface Window {
    __xuanchengDeferredPrompt?: BeforeInstallPromptEvent | null;
    Capacitor?: {
      isNativePlatform?: () => boolean;
      Plugins?: {
        Haptics?: {
          impact?: (opts: { style: 'LIGHT' | 'MEDIUM' | 'HEAVY' }) => Promise<void>;
          vibrate?: (opts: { duration: number }) => Promise<void>;
        };
        StatusBar?: {
          hide?: () => Promise<void>;
        };
        ScreenOrientation?: {
          lock?: (opts: { orientation: 'landscape' }) => Promise<void>;
        };
        App?: {
          addListener?: (eventName: string, cb: () => void) => void;
        };
      };
    };
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class NativeAppAdapter {
  private backListeners: (() => void)[] = [];
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private installListeners: (() => void)[] = [];
  private appInstalledListeners: (() => void)[] = [];
  private appInstalledFired = false;
  private immersiveBound = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.deferredPrompt = window.__xuanchengDeferredPrompt || null;
      const syncEarly = () => {
        if (window.__xuanchengDeferredPrompt) {
          this.deferredPrompt = window.__xuanchengDeferredPrompt;
          for (const cb of this.installListeners) cb();
        }
      };
      window.addEventListener('xuancheng-bip-ready', syncEarly);
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e as BeforeInstallPromptEvent;
        window.__xuanchengDeferredPrompt = this.deferredPrompt;
        for (const cb of this.installListeners) cb();
      });
      window.addEventListener('appinstalled', () => {
        this.deferredPrompt = null;
        window.__xuanchengDeferredPrompt = null;
        this.appInstalledFired = true;
        for (const cb of this.installListeners) cb();
        for (const cb of this.appInstalledListeners) cb();
      });
    }
  }

  public onInstallAvailabilityChange(cb: () => void): void {
    this.installListeners.push(cb);
  }

  public onAppInstalled(cb: () => void): void {
    this.appInstalledListeners.push(cb);
  }

  public hasCompletedAppInstall(): boolean {
    return this.appInstalledFired;
  }

  public isStandaloneInstalled(): boolean {
    if (window.Capacitor?.isNativePlatform?.()) return true;
    try {
      if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
      if (!document.fullscreenElement && window.matchMedia?.('(display-mode: fullscreen)').matches) {
        return true;
      }
      if ((navigator as unknown as { standalone?: boolean }).standalone === true) return true;
    } catch {
      // ignore
    }
    return false;
  }

  public canPromptInstallNatively(): boolean {
    return Boolean(this.deferredPrompt || window.__xuanchengDeferredPrompt);
  }

  public detectInstallGuideKind(): 'ios' | 'wechat' | 'android' | 'desktop' {
    const ua = navigator.userAgent || '';
    if (/MicroMessenger/i.test(ua)) return 'wechat';
    if (/iPad|iPhone|iPod/i.test(ua)) return 'ios';
    if (/Android|Mobile/i.test(ua)) return 'android';
    return 'desktop';
  }

  public async promptInstall(): Promise<'accepted' | 'dismissed' | 'manual_guide'> {
    let p = this.deferredPrompt || window.__xuanchengDeferredPrompt || null;
    if (!p && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      await new Promise((r) => window.setTimeout(r, 350));
      p = this.deferredPrompt || window.__xuanchengDeferredPrompt || null;
    }
    if (!p) return 'manual_guide';
    try {
      this.appInstalledFired = false;
      await p.prompt();
      const choice = await p.userChoice;
      this.deferredPrompt = null;
      window.__xuanchengDeferredPrompt = null;
      return choice.outcome;
    } catch {
      return 'manual_guide';
    }
  }

  public async init(): Promise<void> {
    const plugins = window.Capacitor?.Plugins;
    try {
      await plugins?.StatusBar?.hide?.();
    } catch {
      // ignore on web
    }
    try {
      await plugins?.ScreenOrientation?.lock?.({ orientation: 'landscape' });
    } catch {
      // ignore if unsupported
    }
    try {
      plugins?.App?.addListener?.('backButton', () => {
        for (const cb of this.backListeners) cb();
      });
    } catch {
      // ignore on web
    }

    if (!this.immersiveBound && typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.immersiveBound = true;
      const enterImmersiveOnStandalone = () => {
        if (document.fullscreenElement) return;
        const inWebApp =
          window.matchMedia?.('(display-mode: standalone)').matches ||
          window.matchMedia?.('(display-mode: fullscreen)').matches ||
          window.matchMedia?.('(display-mode: minimal-ui)').matches ||
          (navigator as unknown as { standalone?: boolean }).standalone === true;
        if (!inWebApp) return;
        const el = document.documentElement as HTMLElement & {
          webkitRequestFullscreen?: () => Promise<void>;
        };
        if (el.requestFullscreen) {
          el.requestFullscreen({ navigationUI: 'hide' } as FullscreenOptions).catch(() => {});
        } else if (el.webkitRequestFullscreen) {
          el.webkitRequestFullscreen().catch(() => {});
        }
        const orient = screen.orientation as ScreenOrientation & {
          lock?: (m: string) => Promise<void>;
        };
        orient?.lock?.('landscape').catch(() => {});
      };
      window.addEventListener('pointerdown', enterImmersiveOnStandalone, { passive: true });
      window.addEventListener('touchstart', enterImmersiveOnStandalone, { passive: true });
    }
  }

  public onBackButton(cb: () => void): void {
    this.backListeners.push(cb);
  }

  public isMobileOrTablet(): boolean {
    if (window.Capacitor?.isNativePlatform?.()) return true;
    const ua = navigator.userAgent || '';
    if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return true;
    return navigator.maxTouchPoints > 1 && window.innerWidth <= 1280;
  }

  public haptic(level: 'light' | 'medium' | 'heavy'): void {
    const haptics = window.Capacitor?.Plugins?.Haptics;
    if (haptics?.impact) {
      const style = level === 'heavy' ? 'HEAVY' : level === 'medium' ? 'MEDIUM' : 'LIGHT';
      haptics.impact({ style }).catch(() => {});
      return;
    }
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      const ms = level === 'heavy' ? 35 : level === 'medium' ? 18 : 8;
      try {
        navigator.vibrate(ms);
      } catch {
        // ignore
      }
    }
  }

  public async requestFullscreenAndLandscape(): Promise<void> {
    try {
      const el = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
      };
      if (el.requestFullscreen) {
        await el.requestFullscreen({ navigationUI: 'hide' } as FullscreenOptions);
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      }
    } catch {
      // ignore
    }
    try {
      const plugins = window.Capacitor?.Plugins;
      if (plugins?.ScreenOrientation?.lock) {
        await plugins.ScreenOrientation.lock({ orientation: 'landscape' });
      } else {
        const orient = screen.orientation as ScreenOrientation & {
          lock?: (m: string) => Promise<void>;
        };
        await orient?.lock?.('landscape');
      }
    } catch {
      // ignore
    }
  }
}

export const NativeApp = new NativeAppAdapter();
