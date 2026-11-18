import { NativeApp } from '../platform/NativeAppBridge';
import { SkillId } from '../types';

export type DirToken = 'N' | 'U' | 'D' | 'F' | 'B' | 'DF' | 'DB' | 'UF' | 'UB';

interface RawDirSample {
  gx: -1 | 0 | 1; // 屏幕绝对左右
  gy: -1 | 0 | 1; // 屏幕绝对上下
  at: number;
}

export interface VirtualButtonRect {
  id: 'attack' | 'jump' | 'dash' | 'sub' | 'potion';
  label: string;
  subLabel: string;
  cx: number;
  cy: number;
  r: number;
  color: string;
  pressed: boolean;
}

export class InputController {
  public moveX = 0; // -1..1
  public moveY = 0; // -1..1
  public usingTouch = false;
  public controlStyle: 'joystick' | 'dpad' = 'joystick';
  public uiBlocked = false;

  // 边沿触发按键状态
  private attackJustPressed = false;
  public attackHeld = false;
  private jumpJustPressed = false;
  public jumpHeld = false;
  private dashJustPressed = false;
  private subJustPressed = false;
  private interactJustPressed = false;
  private potionJustPressed = false;
  private weaponSwapJustPressed = false;
  private mapJustPressed = false;
  private pauseJustPressed = false;

  private keys = new Set<string>();
  private dirHistory: RawDirSample[] = [];
  private lastQuantX: -1 | 0 | 1 = 0;
  private lastQuantY: -1 | 0 | 1 = 0;

  // 触控摇杆状态与水墨轨迹
  private stickTouchId: number | null = null;
  public stickBaseX = 118;
  public stickBaseY = 0;
  public stickKnobX = 118;
  public stickKnobY = 0;
  public stickActive = false;
  public touchTrail: { x: number; y: number; alpha: number }[] = [];

  private activeBtnTouches = new Map<number, VirtualButtonRect['id']>();
  public buttons: VirtualButtonRect[] = [];

  constructor(private canvas: HTMLCanvasElement) {
    this.usingTouch = NativeApp.isMobileOrTablet();
    this.installKeyboard();
    this.installTouch();
  }

  public layoutVirtualControls(viewW: number, viewH: number): void {
    const baseR = Math.max(27, Math.min(36, Math.round(Math.min(viewW, viewH) * 0.075)));
    const rightX = viewW - 86;
    const bottomY = viewH - 78;

    if (!this.stickActive) {
      this.stickBaseX = 112;
      this.stickBaseY = viewH - 102;
      this.stickKnobX = this.stickBaseX;
      this.stickKnobY = this.stickBaseY;
    }

    this.buttons = [
      {
        id: 'attack',
        label: '斩',
        subLabel: '普攻/搓招',
        cx: rightX - 10,
        cy: bottomY - 6,
        r: Math.round(baseR * 1.24),
        color: '#c8372d',
        pressed: false,
      },
      {
        id: 'jump',
        label: '跃',
        subLabel: '轻功/蹬墙',
        cx: rightX - baseR * 2.45,
        cy: bottomY + 12,
        r: baseR,
        color: '#2b7a78',
        pressed: false,
      },
      {
        id: 'dash',
        label: '身',
        subLabel: '化雾/疾退',
        cx: rightX - baseR * 2.05,
        cy: bottomY - baseR * 2.0,
        r: Math.round(baseR * 0.92),
        color: '#7e3af2',
        pressed: false,
      },
      {
        id: 'sub',
        label: '符',
        subLabel: '法器/钩锁',
        cx: rightX + 8,
        cy: bottomY - baseR * 2.45,
        r: Math.round(baseR * 0.9),
        color: '#d97706',
        pressed: false,
      },
      {
        id: 'potion',
        label: '药',
        subLabel: '止血散',
        cx: rightX - baseR * 3.85,
        cy: bottomY + 14,
        r: Math.round(baseR * 0.74),
        color: '#15803d',
        pressed: false,
      },
    ];
  }

  public resetAll(): void {
    this.keys.clear();
    this.moveX = 0;
    this.moveY = 0;
    this.attackHeld = false;
    this.jumpHeld = false;
    this.attackJustPressed = false;
    this.jumpJustPressed = false;
    this.dashJustPressed = false;
    this.subJustPressed = false;
    this.interactJustPressed = false;
    this.potionJustPressed = false;
    this.stickTouchId = null;
    this.stickActive = false;
    this.activeBtnTouches.clear();
    for (const b of this.buttons) b.pressed = false;
  }

  private installKeyboard(): void {
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const code = e.code;
      this.keys.add(code);

      if (code === 'KeyM' || code === 'Tab') {
        e.preventDefault();
        this.mapJustPressed = true;
      } else if (code === 'Escape' || code === 'KeyB' || code === 'KeyI') {
        this.pauseJustPressed = true;
      }

      if (this.uiBlocked) return;

      if (code === 'KeyJ' || code === 'KeyZ') {
        this.attackJustPressed = true;
        this.attackHeld = true;
      } else if (code === 'KeyK' || code === 'KeyX' || code === 'Space') {
        e.preventDefault();
        this.jumpJustPressed = true;
        this.jumpHeld = true;
      } else if (code === 'KeyL' || code === 'KeyC' || code === 'ShiftLeft' || code === 'ShiftRight') {
        this.dashJustPressed = true;
      } else if (code === 'KeyU' || code === 'KeyV') {
        this.subJustPressed = true;
      } else if (code === 'KeyE' || code === 'KeyF') {
        this.interactJustPressed = true;
      } else if (code === 'KeyH') {
        this.potionJustPressed = true;
      } else if (code === 'KeyQ') {
        this.weaponSwapJustPressed = true;
      }
      this.syncAxesFromKeyboard();
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      this.keys.delete(code);
      if (code === 'KeyJ' || code === 'KeyZ') this.attackHeld = false;
      if (code === 'KeyK' || code === 'KeyX' || code === 'Space') this.jumpHeld = false;
      this.syncAxesFromKeyboard();
    });

    window.addEventListener('blur', () => this.resetAll());
  }

  private syncAxesFromKeyboard(): void {
    if (this.stickActive) return;
    const left = this.keys.has('KeyA') || this.keys.has('ArrowLeft');
    const right = this.keys.has('KeyD') || this.keys.has('ArrowRight');
    const up = this.keys.has('KeyW') || this.keys.has('ArrowUp');
    const down = this.keys.has('KeyS') || this.keys.has('ArrowDown');

    this.moveX = (right ? 1 : 0) - (left ? 1 : 0);
    this.moveY = (down ? 1 : 0) - (up ? 1 : 0);
    this.recordQuantizedDir(this.moveX as -1 | 0 | 1, this.moveY as -1 | 0 | 1);
  }

  private installTouch(): void {
    const getPos = (t: Touch) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: t.clientX - rect.left,
        y: t.clientY - rect.top,
      };
    };

    this.canvas.addEventListener(
      'touchstart',
      (e) => {
        this.usingTouch = true;
        if (this.uiBlocked) return;
        e.preventDefault();

        const viewW = this.canvas.clientWidth || window.innerWidth;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          const p = getPos(t);

          // 检查右侧虚拟技能动作按键
          let hitBtn: VirtualButtonRect | null = null;
          for (const b of this.buttons) {
            const dx = p.x - b.cx;
            const dy = p.y - b.cy;
            if (dx * dx + dy * dy <= (b.r + 14) * (b.r + 14)) {
              hitBtn = b;
              break;
            }
          }

          if (hitBtn) {
            hitBtn.pressed = true;
            this.activeBtnTouches.set(t.identifier, hitBtn.id);
            this.triggerVirtualButton(hitBtn.id, true);
            continue;
          }

          // 左半屏唤醒八向手搓摇杆/十字键
          if (p.x < viewW * 0.5 && this.stickTouchId === null) {
            this.stickTouchId = t.identifier;
            this.stickActive = true;
            if (this.controlStyle === 'joystick') {
              this.stickBaseX = Math.max(75, Math.min(viewW * 0.36, p.x));
              this.stickBaseY = Math.max(160, p.y);
              this.stickKnobX = this.stickBaseX;
              this.stickKnobY = this.stickBaseY;
            } else {
              this.updateStickVector(p.x, p.y);
            }
          }
        }
      },
      { passive: false }
    );

    this.canvas.addEventListener(
      'touchmove',
      (e) => {
        if (this.uiBlocked) return;
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === this.stickTouchId) {
            const p = getPos(t);
            this.updateStickVector(p.x, p.y);
          }
        }
      },
      { passive: false }
    );

    const handleEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === this.stickTouchId) {
          this.stickTouchId = null;
          this.stickActive = false;
          this.moveX = 0;
          this.moveY = 0;
          this.stickKnobX = this.stickBaseX;
          this.stickKnobY = this.stickBaseY;
          this.recordQuantizedDir(0, 0);
        }
        const btnId = this.activeBtnTouches.get(t.identifier);
        if (btnId) {
          this.activeBtnTouches.delete(t.identifier);
          const b = this.buttons.find((item) => item.id === btnId);
          if (b) b.pressed = false;
          this.triggerVirtualButton(btnId, false);
        }
      }
    };

    this.canvas.addEventListener('touchend', handleEnd, { passive: false });
    this.canvas.addEventListener('touchcancel', handleEnd, { passive: false });
  }

  private updateStickVector(px: number, py: number): void {
    const maxR = 54;
    const dx = px - this.stickBaseX;
    const dy = py - this.stickBaseY;
    const dist = Math.hypot(dx, dy);

    if (dist > 6) {
      const clamped = Math.min(maxR, dist);
      this.stickKnobX = this.stickBaseX + (dx / dist) * clamped;
      this.stickKnobY = this.stickBaseY + (dy / dist) * clamped;
      this.touchTrail.push({ x: this.stickKnobX, y: this.stickKnobY, alpha: 1 });
      if (this.touchTrail.length > 18) this.touchTrail.shift();
    } else {
      this.stickKnobX = px;
      this.stickKnobY = py;
    }

    if (dist < 13) {
      this.moveX = 0;
      this.moveY = 0;
      this.recordQuantizedDir(0, 0);
      return;
    }

    // 精准八向扇区量化（移动端斜角容错加宽至 ±32°，使 ↓↘→ 滑搓丝滑无比！）
    const angle = Math.atan2(dy, dx); // -PI..PI, 0 = 右, PI/2 = 下
    const deg = (angle * 180) / Math.PI;

    let qx: -1 | 0 | 1 = 0;
    let qy: -1 | 0 | 1 = 0;
    if (deg > -62 && deg < 62) qx = 1;
    else if (deg > 118 || deg < -118) qx = -1;

    if (deg > 28 && deg < 152) qy = 1;
    else if (deg < -28 && deg > -152) qy = -1;

    this.moveX = qx;
    this.moveY = qy;
    this.recordQuantizedDir(qx, qy);
  }

  private triggerVirtualButton(id: VirtualButtonRect['id'], down: boolean): void {
    if (id === 'attack') {
      if (down) this.attackJustPressed = true;
      this.attackHeld = down;
    } else if (id === 'jump') {
      if (down) this.jumpJustPressed = true;
      this.jumpHeld = down;
    } else if (id === 'dash' && down) {
      this.dashJustPressed = true;
    } else if (id === 'sub' && down) {
      this.subJustPressed = true;
    } else if (id === 'potion' && down) {
      this.potionJustPressed = true;
    }
  }

  private recordQuantizedDir(gx: -1 | 0 | 1, gy: -1 | 0 | 1): void {
    if (gx === this.lastQuantX && gy === this.lastQuantY) return;
    this.lastQuantX = gx;
    this.lastQuantY = gy;
    const now = performance.now();
    this.dirHistory.push({ gx, gy, at: now });
    if (this.dirHistory.length > 20) {
      this.dirHistory.shift();
    }
  }

  public fadeTrails(dt: number): void {
    for (let i = this.touchTrail.length - 1; i >= 0; i--) {
      this.touchTrail[i].alpha -= dt * 3.8;
      if (this.touchTrail[i].alpha <= 0) {
        this.touchTrail.splice(i, 1);
      }
    }
  }

  public pollGamepad(): void {
    if (this.uiBlocked || typeof navigator.getGamepads !== 'function') return;
    const pads = navigator.getGamepads();
    const gp = pads?.[0];
    if (!gp) return;

    const ax = gp.axes[0] || 0;
    const ay = gp.axes[1] || 0;
    const dpadX = (gp.buttons[15]?.pressed ? 1 : 0) - (gp.buttons[14]?.pressed ? 1 : 0);
    const dpadY = (gp.buttons[13]?.pressed ? 1 : 0) - (gp.buttons[12]?.pressed ? 1 : 0);

    const gx: -1 | 0 | 1 = dpadX !== 0 ? (dpadX as -1 | 1) : ax > 0.35 ? 1 : ax < -0.35 ? -1 : 0;
    const gy: -1 | 0 | 1 = dpadY !== 0 ? (dpadY as -1 | 1) : ay > 0.35 ? 1 : ay < -0.35 ? -1 : 0;

    if (!this.stickActive && this.keys.size === 0) {
      this.moveX = gx;
      this.moveY = gy;
      this.recordQuantizedDir(gx, gy);
    }
  }

  /**
   * 核心格斗手搓招式解析器（根据角色当前朝向 facing: 1 | -1 匹配指令序列）
   */
  public consumeMotionSkill(facing: 1 | -1): SkillId | null {
    const now = performance.now();
    const recent = this.dirHistory.filter((s) => now - s.at <= 450);
    if (recent.length < 2) return null;

    const toRel = (s: RawDirSample): DirToken => {
      const fx = s.gx * facing;
      if (fx === 0 && s.gy === 0) return 'N';
      if (fx === 0 && s.gy === 1) return 'D';
      if (fx === 0 && s.gy === -1) return 'U';
      if (fx === 1 && s.gy === 0) return 'F';
      if (fx === -1 && s.gy === 0) return 'B';
      if (fx === 1 && s.gy === 1) return 'DF';
      if (fx === -1 && s.gy === 1) return 'DB';
      if (fx === 1 && s.gy === -1) return 'UF';
      return 'UB';
    };

    // 过滤回中位 N 后提取非重复方向流，容许中间穿插过渡斜角
    const tokens: DirToken[] = [];
    for (const s of recent) {
      const tk = toRel(s);
      if (tk !== 'N' && tokens[tokens.length - 1] !== tk) {
        tokens.push(tk);
      }
    }

    const matchSeq = (seq: DirToken[]): boolean => {
      let idx = 0;
      for (const tk of tokens) {
        if (tk === seq[idx]) {
          idx++;
          if (idx === seq.length) return true;
        }
      }
      return false;
    };

    const lastTk = tokens[tokens.length - 1];

    // 1. 终极半圆搓招：← ↙ ↓ ↘ → + 攻 【九幽噬魂引】
    if (
      (lastTk === 'F' || lastTk === 'DF') &&
      (matchSeq(['B', 'DB', 'D', 'DF', 'F']) || matchSeq(['B', 'D', 'F']))
    ) {
      this.dirHistory = [];
      return 'jiuyou_soulsteal';
    }

    // 2. 升龙/拔葱：↓ ↑ + 攻 或 → ↓ ↘ + 攻 【惊鸿升龙破】
    if (
      ((lastTk === 'U' || lastTk === 'UF') && matchSeq(['D', 'U'])) ||
      (lastTk === 'DF' && matchSeq(['F', 'D', 'DF']))
    ) {
      this.dirHistory = [];
      return 'jinghong_rising';
    }

    // 3. 后前突进：← → + 攻 【瞬影一闪】
    if (lastTk === 'F' && matchSeq(['B', 'F']) && !matchSeq(['B', 'D', 'F'])) {
      this.dirHistory = [];
      return 'shunying_flash';
    }

    // 4. 下前波动：↓ ↘ → + 攻 【朔风破空斩】
    if (
      (lastTk === 'F' || lastTk === 'DF') &&
      (matchSeq(['D', 'DF', 'F']) || matchSeq(['D', 'F']))
    ) {
      this.dirHistory = [];
      return 'shuofeng_wave';
    }

    // 5. 下后震气：↓ ↙ ← + 攻 【太极震气诀】
    if (
      (lastTk === 'B' || lastTk === 'DB') &&
      (matchSeq(['D', 'DB', 'B']) || matchSeq(['D', 'B']))
    ) {
      this.dirHistory = [];
      return 'taiji_parry';
    }

    return null;
  }

  public consumeAttack(): boolean {
    const v = this.attackJustPressed;
    this.attackJustPressed = false;
    return v;
  }

  public consumeJump(): boolean {
    const v = this.jumpJustPressed;
    this.jumpJustPressed = false;
    return v;
  }

  public consumeDash(): boolean {
    const v = this.dashJustPressed;
    this.dashJustPressed = false;
    return v;
  }

  public consumeSubWeapon(): boolean {
    const v = this.subJustPressed;
    this.subJustPressed = false;
    return v;
  }

  public consumeInteract(): boolean {
    const v = this.interactJustPressed;
    this.interactJustPressed = false;
    return v;
  }

  public triggerInteractFromUI(): void {
    this.interactJustPressed = true;
  }

  public consumePotion(): boolean {
    const v = this.potionJustPressed;
    this.potionJustPressed = false;
    return v;
  }

  public consumeWeaponSwap(): boolean {
    const v = this.weaponSwapJustPressed;
    this.weaponSwapJustPressed = false;
    return v;
  }

  public consumeMapToggle(): boolean {
    const v = this.mapJustPressed;
    this.mapJustPressed = false;
    return v;
  }

  public consumePauseToggle(): boolean {
    const v = this.pauseJustPressed;
    this.pauseJustPressed = false;
    return v;
  }
}
