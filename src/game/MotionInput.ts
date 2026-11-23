import { NativeApp } from '../platform/NativeAppBridge';
import { SkillId } from '../types';

export type DirToken = 'N' | 'U' | 'D' | 'F' | 'B' | 'DF' | 'DB' | 'UF' | 'UB';

interface RawDirSample {
  gx: -1 | 0 | 1;
  gy: -1 | 0 | 1;
  at: number;
}

export interface VirtualButtonRect {
  id: 'attack' | 'jump' | 'dash' | 'sub' | 'potion' | 'swap' | 'familiar' | 'skill';
  shape: 'circle' | 'pill';
  /** 主键单字（斩 / 跃 / 闪 / 符）或肩键名（L1 换兵 / L2 唤灵 / RT 绝技 / R1 灵药） */
  label: string;
  /** 手柄键位微标（X / A / B / Y / L1 / L2 / RT / R1） */
  padBadge: string;
  cx: number;
  cy: number;
  r: number;
  w?: number;
  h?: number;
  accentColor: string;
  pressed: boolean;
}

export class InputController {
  public moveX = 0; // -1..1
  public moveY = 0; // -1..1
  public usingTouch = false;
  public controlStyle: 'joystick' | 'dpad' = 'joystick';
  public padScale = 1.0;
  public uiBlocked = false;

  // 边沿触发按键状态
  private attackJustPressed = false;
  public attackHeld = false;
  private jumpJustPressed = false;
  public jumpHeld = false;
  private dashJustPressed = false;
  private subJustPressed = false;
  private skillJustPressed = false;
  private interactJustPressed = false;
  private potionJustPressed = false;
  private weaponSwapJustPressed = false;
  private familiarSwapJustPressed = false;
  private mapJustPressed = false;
  private pauseJustPressed = false;

  private keys = new Set<string>();
  private dirHistory: RawDirSample[] = [];
  private lastQuantX: -1 | 0 | 1 = 0;
  private lastQuantY: -1 | 0 | 1 = 0;

  // 左手手柄摇杆 / 十字键对称锚点与实时坐标
  private stickTouchId: number | null = null;
  public padLeftHomeX = 108;
  public padLeftHomeY = 290;
  public padRightCenterX = 720;
  public padRightCenterY = 290;
  public padDiamondArm = 48;
  public padFaceRadius = 26;

  public stickBaseX = 108;
  public stickBaseY = 290;
  public stickKnobX = 108;
  public stickKnobY = 290;
  public stickActive = false;
  public touchTrail: { x: number; y: number; alpha: number }[] = [];

  private activeBtnTouches = new Map<number, VirtualButtonRect['id']>();
  public buttons: VirtualButtonRect[] = [];

  constructor(private canvas: HTMLCanvasElement) {
    this.usingTouch = NativeApp.isMobileOrTablet();
    this.installKeyboard();
    this.installTouch();
  }

  /**
   * 标准主机手柄对称式布局（Left Stick/D-Pad + L1肩键 ⟷ Right ABXY菱形四键 + R1肩键）：
   * 四颗右侧动作键严格等大、90°正菱形排布，左右高度完全对称，彻底告别杂乱大小圆圈！
   */
  public layoutVirtualControls(viewW: number, viewH: number): void {
    const minDim = Math.min(viewW, viewH);
    const scaleClamp = Math.max(0.82, Math.min(1.18, this.padScale || 1.0));
    const baseFaceR = Math.max(22, Math.min(29, Math.round(minDim * 0.066)));
    const faceR = Math.max(20, Math.min(33, Math.round(baseFaceR * scaleClamp)));
    const arm = Math.round(faceR * 1.82);

    const sideMargin = Math.max(98, Math.min(134, Math.round(viewW * 0.13)));
    const bottomMargin = Math.max(82, Math.min(112, Math.round(viewH * 0.24)));

    const leftX = sideMargin;
    const rightX = viewW - sideMargin;
    const centerY = viewH - bottomMargin;
    const shoulderY = Math.max(108, centerY - arm - faceR - 22);

    this.padLeftHomeX = leftX;
    this.padLeftHomeY = centerY;
    this.padRightCenterX = rightX;
    this.padRightCenterY = centerY;
    this.padDiamondArm = arm;
    this.padFaceRadius = faceR;

    if (!this.stickActive) {
      this.stickBaseX = leftX;
      this.stickBaseY = centerY;
      this.stickKnobX = leftX;
      this.stickKnobY = centerY;
    }

    const shoulderW = Math.round(faceR * 2.68);
    const shoulderH = Math.round(faceR * 1.02);

    this.buttons = [
      // 右手正菱形四键 (ABXY 标准动作手柄排布)
      {
        id: 'attack', // West (X / □)：主武挥斩 / 搓招触发
        shape: 'circle',
        label: '斩',
        padBadge: 'X',
        cx: rightX - arm,
        cy: centerY,
        r: faceR,
        accentColor: '#ef4444',
        pressed: false,
      },
      {
        id: 'jump', // South (A / ×)：跳跃 / 二段跳 / 滑铲 / 飞踢
        shape: 'circle',
        label: '跃',
        padBadge: 'A',
        cx: rightX,
        cy: centerY + arm,
        r: faceR,
        accentColor: '#2dd4bf',
        pressed: false,
      },
      {
        id: 'dash', // East (B / ○)：疾退 / 缩地化雾
        shape: 'circle',
        label: '闪',
        padBadge: 'B',
        cx: rightX + arm,
        cy: centerY,
        r: faceR,
        accentColor: '#c084fc',
        pressed: false,
      },
      {
        id: 'sub', // North (Y / △)：奇门副器
        shape: 'circle',
        label: '符',
        padBadge: 'Y',
        cx: rightX,
        cy: centerY - arm,
        r: faceR,
        accentColor: '#f59e0b',
        pressed: false,
      },

      // 左右对称手柄双肩键 (L1 换兵 + L2 唤灵 ⟷ RT 绝技 + R1 灵药)
      {
        id: 'swap',
        shape: 'pill',
        label: '换兵',
        padBadge: 'L1',
        cx: leftX - Math.round(shoulderW * 0.46) - 3,
        cy: shoulderY,
        r: Math.round(shoulderH * 0.5),
        w: Math.round(shoulderW * 0.96),
        h: shoulderH,
        accentColor: '#eab308',
        pressed: false,
      },
      {
        id: 'familiar',
        shape: 'pill',
        label: '唤灵',
        padBadge: 'L2',
        cx: leftX + Math.round(shoulderW * 0.54) + 3,
        cy: shoulderY,
        r: Math.round(shoulderH * 0.5),
        w: Math.round(shoulderW * 0.96),
        h: shoulderH,
        accentColor: '#2dd4bf',
        pressed: false,
      },
      {
        id: 'skill',
        shape: 'pill',
        label: '绝技',
        padBadge: 'RT',
        cx: rightX - Math.round(shoulderW * 0.58) - 4,
        cy: shoulderY,
        r: Math.round(shoulderH * 0.5),
        w: Math.round(shoulderW * 0.96),
        h: shoulderH,
        accentColor: '#38bdf8',
        pressed: false,
      },
      {
        id: 'potion',
        shape: 'pill',
        label: '灵药',
        padBadge: 'R1',
        cx: rightX + Math.round(shoulderW * 0.44) + 4,
        cy: shoulderY,
        r: Math.round(shoulderH * 0.5),
        w: Math.round(shoulderW * 0.96),
        h: shoulderH,
        accentColor: '#34d399',
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
    this.skillJustPressed = false;
    this.interactJustPressed = false;
    this.potionJustPressed = false;
    this.weaponSwapJustPressed = false;
    this.familiarSwapJustPressed = false;
    this.stickTouchId = null;
    this.stickActive = false;
    this.stickBaseX = this.padLeftHomeX;
    this.stickBaseY = this.padLeftHomeY;
    this.stickKnobX = this.padLeftHomeX;
    this.stickKnobY = this.padLeftHomeY;
    this.activeBtnTouches.clear();
    for (const b of this.buttons) b.pressed = false;
  }

  private hitTestButton(px: number, py: number): VirtualButtonRect | null {
    let best: VirtualButtonRect | null = null;
    let bestDist = Infinity;
    for (const b of this.buttons) {
      if (b.shape === 'pill' && b.w && b.h) {
        const hw = b.w * 0.5 + 8;
        const hh = b.h * 0.5 + 8;
        if (Math.abs(px - b.cx) <= hw && Math.abs(py - b.cy) <= hh) {
          const d = Math.hypot(px - b.cx, py - b.cy);
          if (d < bestDist) {
            bestDist = d;
            best = b;
          }
        }
      } else {
        const d = Math.hypot(px - b.cx, py - b.cy);
        if (d <= b.r + 11 && d < bestDist) {
          bestDist = d;
          best = b;
        }
      }
    }
    return best;
  }

  private syncPressedStates(): void {
    const heldSet = new Set(this.activeBtnTouches.values());
    for (const b of this.buttons) {
      b.pressed = heldSet.has(b.id);
    }
    this.attackHeld = heldSet.has('attack');
    this.jumpHeld = heldSet.has('jump');
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
      } else if (code === 'KeyU') {
        this.subJustPressed = true;
      } else if (code === 'KeyV' || code === 'KeyG') {
        this.familiarSwapJustPressed = true;
      } else if (code === 'KeyO' || code === 'KeyR') {
        this.skillJustPressed = true;
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
        const viewH = this.canvas.clientHeight || window.innerHeight;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          const p = getPos(t);

          // 1. 优先命中手柄按键（ABXY 菱形四键 + L1/R1 对称肩键）
          const hitBtn = this.hitTestButton(p.x, p.y);
          if (hitBtn) {
            this.activeBtnTouches.set(t.identifier, hitBtn.id);
            this.syncPressedStates();
            this.triggerVirtualButton(hitBtn.id, true);
            continue;
          }

          // 2. 左下半屏手柄方向区：稳固锚定在左手柄底座（近底座直接响应，避免摇杆满屏乱跳！）
          if (p.x < viewW * 0.45 && p.y > viewH * 0.28 && this.stickTouchId === null) {
            this.stickTouchId = t.identifier;
            this.stickActive = true;
            const distFromHome = Math.hypot(p.x - this.padLeftHomeX, p.y - this.padLeftHomeY);
            if (this.controlStyle === 'dpad' || distFromHome <= 68) {
              this.stickBaseX = this.padLeftHomeX;
              this.stickBaseY = this.padLeftHomeY;
              this.updateStickVector(p.x, p.y);
            } else {
              // 轻微偏离底座按压时在安全手托区内柔和跟手，松手自动归位
              this.stickBaseX = Math.max(78, Math.min(viewW * 0.26, p.x));
              this.stickBaseY = Math.max(viewH * 0.52, Math.min(viewH - 72, p.y));
              this.stickKnobX = this.stickBaseX;
              this.stickKnobY = this.stickBaseY;
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
          const p = getPos(t);
          if (t.identifier === this.stickTouchId) {
            this.updateStickVector(p.x, p.y);
            continue;
          }
          // 支持右手拇指在 X(斩) ⟷ A(跃) 之间丝滑搓滚滑按！
          const prevBtn = this.activeBtnTouches.get(t.identifier);
          if (prevBtn !== undefined) {
            const nowBtn = this.hitTestButton(p.x, p.y);
            if (nowBtn && nowBtn.id !== prevBtn) {
              this.activeBtnTouches.set(t.identifier, nowBtn.id);
              this.syncPressedStates();
              this.triggerVirtualButton(nowBtn.id, true);
            }
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
          this.stickBaseX = this.padLeftHomeX;
          this.stickBaseY = this.padLeftHomeY;
          this.stickKnobX = this.padLeftHomeX;
          this.stickKnobY = this.padLeftHomeY;
          this.recordQuantizedDir(0, 0);
        }
        const btnId = this.activeBtnTouches.get(t.identifier);
        if (btnId) {
          this.activeBtnTouches.delete(t.identifier);
          this.syncPressedStates();
          this.triggerVirtualButton(btnId, false);
        }
      }
    };

    this.canvas.addEventListener('touchend', handleEnd, { passive: false });
    this.canvas.addEventListener('touchcancel', handleEnd, { passive: false });
  }

  private updateStickVector(px: number, py: number): void {
    const maxR = 46;
    const dx = px - this.stickBaseX;
    const dy = py - this.stickBaseY;
    const dist = Math.hypot(dx, dy);

    if (dist > 5) {
      const clamped = Math.min(maxR, dist);
      this.stickKnobX = this.stickBaseX + (dx / dist) * clamped;
      this.stickKnobY = this.stickBaseY + (dy / dist) * clamped;
      this.touchTrail.push({ x: this.stickKnobX, y: this.stickKnobY, alpha: 1 });
      if (this.touchTrail.length > 14) this.touchTrail.shift();
    } else {
      this.stickKnobX = px;
      this.stickKnobY = py;
    }

    if (dist < 11) {
      this.moveX = 0;
      this.moveY = 0;
      this.recordQuantizedDir(0, 0);
      return;
    }

    const angle = Math.atan2(dy, dx);
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
    } else if (id === 'skill' && down) {
      this.skillJustPressed = true;
    } else if (id === 'potion' && down) {
      this.potionJustPressed = true;
    } else if (id === 'swap' && down) {
      this.weaponSwapJustPressed = true;
    } else if (id === 'familiar' && down) {
      this.familiarSwapJustPressed = true;
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

  public consumeMotionSkill(facing: 1 | -1): SkillId | null {
    const now = performance.now();
    const recent = this.dirHistory.filter((s) => now - s.at <= (this.usingTouch ? 620 : 450));
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

    if (
      (lastTk === 'F' || lastTk === 'DF') &&
      (matchSeq(['B', 'DB', 'D', 'DF', 'F']) || matchSeq(['B', 'D', 'F']))
    ) {
      this.dirHistory = [];
      return 'jiuyou_soulsteal';
    }

    if (
      ((lastTk === 'U' || lastTk === 'UF') && matchSeq(['D', 'U'])) ||
      (lastTk === 'DF' && matchSeq(['F', 'D', 'DF']))
    ) {
      this.dirHistory = [];
      return 'jinghong_rising';
    }

    if (lastTk === 'F' && matchSeq(['B', 'F']) && !matchSeq(['B', 'D', 'F'])) {
      this.dirHistory = [];
      return 'shunying_flash';
    }

    if (
      (lastTk === 'F' || lastTk === 'DF') &&
      (matchSeq(['D', 'DF', 'F']) || matchSeq(['D', 'F']))
    ) {
      this.dirHistory = [];
      return 'shuofeng_wave';
    }

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

  public consumeQuickSkill(): boolean {
    const v = this.skillJustPressed;
    this.skillJustPressed = false;
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

  public consumeFamiliarSwap(): boolean {
    const v = this.familiarSwapJustPressed;
    this.familiarSwapJustPressed = false;
    return v;
  }

  public triggerFamiliarSwapFromUI(): void {
    this.familiarSwapJustPressed = true;
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
