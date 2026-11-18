declare global {
  interface Window {
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

class NativeAppAdapter {
  private backListeners: (() => void)[] = [];

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
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
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
