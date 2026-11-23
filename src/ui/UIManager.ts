import { AudioFX } from '../audio/GuofengAudio';
import { ENEMY_PROFILES } from '../data/enemies';
import {
  ABILITIES_META,
  ALL_FAMILIAR_IDS,
  ARMORS,
  CONSUMABLES,
  FAMILIARS,
  SKILLS,
  SUB_WEAPONS,
  WEAPONS,
  YAO_CORES,
} from '../data/itemsAndSkills';
import { CHARACTER_BIOS, LORE_STELES } from '../data/storyAndNpcs';
import {
  BuiltRoom,
  getRoomSideDoors,
  INVERTED_REGION_NAMES,
  MAP_GRID_TOTAL_H,
  MAP_GRID_TOTAL_W,
  REGION_NAMES,
  WorldMap,
} from '../data/worldMap';
import { AssetKey, Assets, resolveFamiliarAssetKey } from '../game/AssetLoader';
import { drawInkSlashRibbon, renderModularLiYichengRig } from '../game/CharacterArt';
import { ActiveSlash, GameEngine } from '../game/GameEngine';
import { createFreshSaveSlot, SaveManager } from '../meta/SaveManager';
import { NativeApp } from '../platform/NativeAppBridge';
import {
  CastleRealm,
  EnemyKind,
  FamiliarId,
  SkillId,
  StoryScene,
  SubWeaponId,
} from '../types';
import {
  getFamiliarArtHtml,
  getSlotCategorySvg,
  getSpeakerPortraitSvg,
  getSubWeaponSvg,
  getWeaponArtHtml,
} from './Icons';
import { playOpeningPrologue } from './OpeningPrologue';

type EquipSlotCategory =
  | 'weapon'
  | 'spirit'
  | 'sub'
  | 'armor'
  | 'accessory'
  | 'core'
  | 'potion';

export class UIManager {
  private hudEl: HTMLElement | null = null;
  private modalEl: HTMLElement | null = null;
  private dialogueEl: HTMLElement | null = null;
  private dialogueKeyHandler: ((e: KeyboardEvent) => void) | null = null;
  private bannerEl: HTMLElement | null = null;
  private stageRafId = 0;
  private stageSlash: ActiveSlash | null = null;

  private hudRefs: {
    lvSeal?: HTMLElement;
    hpTrail?: HTMLElement;
    hpFill?: HTMLElement;
    mpFill?: HTMLElement;
    resRow?: HTMLElement;
    wpnIconWrap?: HTMLElement;
    wpnName?: HTMLElement;
    swapHint?: HTMLElement;
    minimapCanvas?: HTMLCanvasElement;
    minimapLabel?: HTMLElement;
    bossWrap?: HTMLElement;
    bossName?: HTMLElement;
    bossTrail?: HTMLElement;
    bossFill?: HTMLElement;
    bossPoise?: HTMLElement;
    interactBtn?: HTMLElement;
  } = {};

  private pauseTab: 'equip' | 'skills' | 'map' | 'bestiary' | 'lore' | 'settings' = 'equip';
  private mapViewRealm: CastleRealm = 'normal';
  private mapZoom = 1;
  private mapPanX = 0;
  private mapPanY = 0;
  private inspectedMapRoomId: string | null = null;
  private selectedEquipSlot: EquipSlotCategory = 'weapon';
  private previewItemId: string | null = null;
  private lastHudWpnKey = '';
  private warpModalCleanup: (() => void) | null = null;
  private prologueCleanup: (() => void) | null = null;
  private modalClosedAt = 0;

  constructor(
    private uiLayer: HTMLElement,
    private engine: GameEngine
  ) {}

  public isAnyOverlayOpen(): boolean {
    return Boolean(this.modalEl || this.dialogueEl || !this.engine.slot);
  }

  private syncBlockState(): void {
    const blocked = this.isAnyOverlayOpen();
    this.engine.input.uiBlocked = blocked;
    this.engine.input.resetAll();
  }

  private bindFastTap(el: Element | null | undefined, fn: () => void): void {
    if (!el) return;
    let lastFire = 0;
    const fire = (ev: Event) => {
      const now = performance.now();
      if (now - lastFire < 280) return;
      lastFire = now;
      ev.stopPropagation();
      fn();
    };
    let downX = 0;
    let downY = 0;
    let active = false;
    el.addEventListener('pointerdown', (e) => {
      const pe = e as PointerEvent;
      downX = pe.clientX;
      downY = pe.clientY;
      active = true;
    });
    el.addEventListener('pointerup', (e) => {
      if (!active) return;
      active = false;
      const pe = e as PointerEvent;
      if (Math.hypot(pe.clientX - downX, pe.clientY - downY) <= 26) {
        fire(e);
      }
    });
    // 阻断移动端弹层销毁后的幽灵穿透 click 落到底层 HUD 按钮上导致关而复开！
    el.addEventListener(
      'touchend',
      (e) => {
        if (e.cancelable) e.preventDefault();
      },
      { passive: false }
    );
    el.addEventListener('click', (e) => fire(e));
  }

  private stopStageLoop(): void {
    if (this.stageRafId) {
      cancelAnimationFrame(this.stageRafId);
      this.stageRafId = 0;
    }
  }

  // ==================== 《斩妖行 / 只狼》主机级无框泼墨标题画面 ====================
  public showTitleScreen(): void {
    this.clearAllUI();
    this.engine.stopSession();

    const slot1 = SaveManager.getSlot(1);
    const meta = SaveManager.getMeta();
    const root = document.createElement('div');
    root.className = 'zx-title-screen';

    root.innerHTML = `
      <div class="zx-brand-block">
        <div class="zx-red-stamp">镇妖司密录</div>
        <div>
          <h1 class="zx-main-title">玄城夜行</h1>
          <div class="zx-subtitle">阴阳双城 · 最高探索 ${meta.bestExplorationPct}% / 200%+</div>
        </div>
      </div>

      <div class="zx-menu-list">
        ${
          slot1
            ? `<button class="zx-menu-item" id="btn-continue-slot">
                 <span>再续前尘</span>
                 <span class="zx-menu-sub">${slot1.heroName} · 境界 ${slot1.level}${slot1.currentRealm === 'inverted' ? ' · 倒悬里城' : ''}</span>
               </button>`
            : ''
        }
        <button class="zx-menu-item" id="btn-new-journey">
          <span>踏入玄城</span>
          <span class="zx-menu-sub">正篇 · 镇妖司传人李逸承</span>
        </button>
        <button class="zx-menu-item" id="btn-xiao-mode">
          <span>少统领传</span>
          <span class="zx-menu-sub">${meta.unlockedXiaoMode ? '已解锁 · 少统领萧断水' : '特别篇 · 寒星银枪萧断水'}</span>
        </button>
        <button class="zx-menu-item" id="btn-boss-rush">
          <span>百鬼试炼</span>
          <span class="zx-menu-sub">${meta.bestBossRushSec ? `镇妖塔最快 ${meta.bestBossRushSec}s` : '十大妖王神将连战'}</span>
        </button>
        <button class="zx-menu-item" id="btn-title-moves">
          <span>剑诀要术</span>
          <span class="zx-menu-sub">五系神兵与手搓绝学</span>
        </button>
        <button class="zx-menu-item" id="btn-title-fs">
          <span>全屏视界</span>
          <span class="zx-menu-sub">沉浸无框横屏</span>
        </button>
      </div>
    `;

    this.uiLayer.appendChild(root);
    this.modalEl = root;
    this.syncBlockState();

    root.querySelector('#btn-continue-slot')?.addEventListener('click', () => {
      AudioFX.resume();
      if (slot1) this.launchGame(slot1);
    });

    root.querySelector('#btn-new-journey')?.addEventListener('click', () => {
      AudioFX.resume();
      const fresh = createFreshSaveSlot(1, 'story');
      SaveManager.saveSlot(fresh);
      this.launchGameWithPrologue(fresh, 'story');
    });

    root.querySelector('#btn-xiao-mode')?.addEventListener('click', () => {
      AudioFX.resume();
      const xiaoSlot = createFreshSaveSlot(2, 'xiaoduanshui');
      SaveManager.saveSlot(xiaoSlot);
      this.launchGameWithPrologue(xiaoSlot, 'xiaoduanshui');
    });

    root.querySelector('#btn-boss-rush')?.addEventListener('click', () => {
      AudioFX.resume();
      const rushSlot = createFreshSaveSlot(3, 'boss_rush');
      rushSlot.level = 14;
      rushSlot.ownedWeapons = ['sword_2', 'greatsword_2', 'spear_2', 'daggers_2', 'whip_2'];
      rushSlot.equippedWeapon = 'sword_2';
      rushSlot.ownedArmors = ['mingguang_armor', 'tiger_tally'];
      rushSlot.equippedArmor = 'mingguang_armor';
      rushSlot.equippedAccessory = 'tiger_tally';
      rushSlot.abilities = ['double_jump', 'mist_dash', 'wall_jump'];
      rushSlot.consumables = { beggar_chicken: 3, osmanthus_wine: 2 };
      this.launchGame(rushSlot);
    });

    root.querySelector('#btn-title-moves')?.addEventListener('click', () => {
      this.showQuickGuideModal();
    });

    root.querySelector('#btn-title-fs')?.addEventListener('click', () => {
      NativeApp.requestFullscreenAndLandscape();
    });
  }

  private showQuickGuideModal(): void {
    const overlay = document.createElement('div');
    overlay.className = 'zx-arsenal-overlay';
    overlay.innerHTML = `
      <div class="zx-arsenal-topbar">
        <span class="zx-modal-heading">镇妖司剑诀秘要</span>
        <button class="zx-seal-btn" id="btn-close-guide">返回</button>
      </div>
      <div class="zx-scroll-pane" style="line-height:1.75;font-size:14px;">
        <p style="margin:0 0 8px;"><strong>键鼠操控：</strong><code>A / D</code> 疾奔，<code>J / Z</code> 挥斩与近身交谈，<code>K / 空格</code> 腾跃，<code>L / Shift</code> 闪避，<code>Q</code> 换兵，<code>U</code> 副器，<code>H</code> 服药，<code>B</code> 兵匣。</p>
        <p style="margin:0 0 12px;"><strong>触屏手柄：</strong>左摇杆/十字键移动与搓招；靠近人物或石祠时按右侧【X 谈/香】直接交互，右上角点击【兵匣】换装。</p>
        <div class="zx-card-grid">
          ${this.buildSkillCardsHtml()}
        </div>
      </div>
    `;
    this.uiLayer.appendChild(overlay);
    overlay.querySelector('#btn-close-guide')?.addEventListener('click', () => overlay.remove());
  }

  private renderCmdBadges(cmdText: string): string {
    const tokens = cmdText.replace(/\(.*\)/, '').trim().split(/\s*\+\s*|\s+/);
    return `<span class="zx-cmd-seq">${tokens
      .filter(Boolean)
      .map((tk) => {
        const isAtk = tk === '攻' || tk === '斩';
        return `<span class="zx-key-pill ${isAtk ? 'zx-key-atk' : ''}">${isAtk ? '斩' : tk}</span>`;
      })
      .join('')}</span>`;
  }

  private buildSkillCardsHtml(): string {
    return (Object.keys(SKILLS) as SkillId[])
      .map((id) => {
        const sk = SKILLS[id];
        return `
        <div class="zx-item-row" style="flex-direction:column;align-items:flex-start;gap:6px;cursor:default;">
          <div style="width:100%;display:flex;justify-content:space-between;align-items:center;">
            <strong style="font-size:16px;color:var(--bronze-light);letter-spacing:2px;">${sk.name}</strong>
            <span style="font-size:11.5px;color:var(--jade);">耗气 ${sk.mpCost}</span>
          </div>
          ${this.renderCmdBadges(sk.commandText)}
          <div style="font-size:12.5px;color:#cbd5e1;line-height:1.5;">${sk.desc}</div>
        </div>`;
      })
      .join('');
  }

  private launchGame(slot: ReturnType<typeof createFreshSaveSlot>, isPrologueWalkIn = false): void {
    this.clearAllUI();
    this.buildActionGameHud();
    this.engine.startSession(slot, isPrologueWalkIn);
    this.syncBlockState();
  }

  private launchGameWithPrologue(
    slot: ReturnType<typeof createFreshSaveSlot>,
    mode: 'story' | 'xiaoduanshui'
  ): void {
    this.clearAllUI();
    this.engine.input.uiBlocked = true;
    this.engine.input.resetAll();
    let liveStarted = false;
    this.prologueCleanup = playOpeningPrologue(
      this.uiLayer,
      mode,
      () => {
        if (liveStarted) return;
        liveStarted = true;
        this.buildActionGameHud();
        this.engine.startSession(slot, true);
        this.syncBlockState();
      },
      () => {
        this.prologueCleanup = null;
        this.modalClosedAt = performance.now();
        this.syncBlockState();
      }
    );
  }

  private clearDialogueKeyHandler(): void {
    if (this.dialogueKeyHandler) {
      window.removeEventListener('keydown', this.dialogueKeyHandler);
      this.dialogueKeyHandler = null;
    }
  }

  private clearAllUI(): void {
    this.stopStageLoop();
    if (this.prologueCleanup) {
      this.prologueCleanup();
      this.prologueCleanup = null;
    }
    if (this.warpModalCleanup) {
      this.warpModalCleanup();
      this.warpModalCleanup = null;
    }
    this.engine.storyDialogueActive = false;
    this.clearDialogueKeyHandler();
    this.uiLayer.innerHTML = '';
    this.hudEl = null;
    this.modalEl = null;
    this.dialogueEl = null;
    this.bannerEl = null;
    this.hudRefs = {};
    this.lastHudWpnKey = '';
  }

  // ==================== 《斩妖行 / 只狼》无圆框主机级国风左上角 HUD ====================
  private buildActionGameHud(): void {
    const hud = document.createElement('div');
    hud.className = 'zx-hud';
    hud.innerHTML = `
      <div class="zx-hud-left">
        <div class="zx-realm-stamp" id="hud-lv-seal">
          <span>境</span>
          <span>壹</span>
        </div>
        <div class="zx-gauges">
          <div class="zx-hp-track">
            <div class="zx-hp-trail" id="hud-hp-trail" style="width:100%"></div>
            <div class="zx-hp-fill" id="hud-hp-fill" style="width:100%"></div>
          </div>
          <div class="zx-mp-track">
            <div class="zx-mp-fill" id="hud-mp-fill" style="width:100%"></div>
          </div>
          <div class="zx-hud-res-row" id="hud-res-row"></div>
          <div class="zx-weapon-sheath" id="hud-wpn-sheath" title="点击或按 [Q] 切换主手兵刃">
            <span id="hud-wpn-icon"></span>
            <span class="zx-swap-hint" id="hud-swap-hint"></span>
          </div>
        </div>
      </div>

      <div class="zx-hud-right">
        <div class="zx-hud-btn-row">
          <button class="zx-seal-btn" id="btn-hud-arsenal">${
            this.engine.input.usingTouch || NativeApp.isMobileOrTablet() ? '兵匣' : '兵匣 [B]'
          }</button>
          <button class="zx-seal-btn" id="btn-hud-map">${
            this.engine.input.usingTouch || NativeApp.isMobileOrTablet() ? '堪舆' : '堪舆 [M]'
          }</button>
          ${
            this.engine.input.usingTouch || NativeApp.isMobileOrTablet()
              ? ''
              : '<button class="zx-seal-btn" id="btn-hud-skills">剑诀</button>'
          }
        </div>
        <div class="zx-minimap-box" id="hud-minimap-box" title="点击展开玄城全境堪舆图 [M]">
          <canvas id="hud-minimap-canvas" width="144" height="58"></canvas>
          <span class="zx-minimap-label" id="hud-minimap-label">断魂苦竹渡</span>
        </div>
      </div>
    `;

    const bossBar = document.createElement('div');
    bossBar.className = 'zx-boss-bar';
    bossBar.style.display = 'none';
    bossBar.innerHTML = `
      <div class="zx-boss-title" id="boss-hud-name">万卷妖宗 · 墨千秋</div>
      <div class="zx-boss-track">
        <div class="zx-boss-trail" id="boss-hud-trail" style="width:100%"></div>
        <div class="zx-boss-fill" id="boss-hud-fill" style="width:100%"></div>
      </div>
      <div style="width:100%;height:3px;margin-top:3px;background:rgba(15,23,42,0.85);border:1px solid rgba(198,154,69,0.35);overflow:hidden;">
        <div id="boss-hud-poise" style="width:100%;height:100%;background:linear-gradient(90deg,#f59e0b,#fef08a);transition:width 0.08s linear;"></div>
      </div>
    `;

    const interactBtn = document.createElement('button');
    interactBtn.className = 'interact-prompt';
    interactBtn.style.display = 'none';
    interactBtn.type = 'button';

    this.uiLayer.appendChild(hud);
    this.uiLayer.appendChild(bossBar);
    this.uiLayer.appendChild(interactBtn);

    this.hudEl = hud;
    this.hudRefs = {
      lvSeal: hud.querySelector('#hud-lv-seal') as HTMLElement,
      hpTrail: hud.querySelector('#hud-hp-trail') as HTMLElement,
      hpFill: hud.querySelector('#hud-hp-fill') as HTMLElement,
      mpFill: hud.querySelector('#hud-mp-fill') as HTMLElement,
      resRow: hud.querySelector('#hud-res-row') as HTMLElement,
      wpnIconWrap: hud.querySelector('#hud-wpn-icon') as HTMLElement,
      wpnName: hud.querySelector('#hud-wpn-name') as HTMLElement,
      swapHint: hud.querySelector('#hud-swap-hint') as HTMLElement,
      minimapCanvas: hud.querySelector('#hud-minimap-canvas') as HTMLCanvasElement,
      minimapLabel: hud.querySelector('#hud-minimap-label') as HTMLElement,
      bossWrap: bossBar,
      bossName: bossBar.querySelector('#boss-hud-name') as HTMLElement,
      bossTrail: bossBar.querySelector('#boss-hud-trail') as HTMLElement,
      bossFill: bossBar.querySelector('#boss-hud-fill') as HTMLElement,
      bossPoise: bossBar.querySelector('#boss-hud-poise') as HTMLElement,
      interactBtn,
    };

    const guardGhostClick = () => performance.now() - this.modalClosedAt < 180;
    hud.querySelector('#hud-wpn-sheath')?.addEventListener('click', () => {
      if (guardGhostClick()) return;
      this.engine.cycleWeapon();
    });
    hud.querySelector('#hud-res-row')?.addEventListener('click', (ev) => {
      if (guardGhostClick()) return;
      const target = (ev.target as HTMLElement | null)?.closest?.('[data-cycle-fam]');
      if (target) this.engine.cycleActiveFamiliar();
    });
    hud.querySelector('#btn-hud-arsenal')?.addEventListener('click', () => {
      if (guardGhostClick()) return;
      this.pauseTab = 'equip';
      this.togglePauseModal();
    });
    hud.querySelector('#btn-hud-map')?.addEventListener('click', () => {
      if (guardGhostClick()) return;
      this.toggleMapModal();
    });
    hud.querySelector('#hud-minimap-box')?.addEventListener('click', () => {
      if (guardGhostClick()) return;
      this.toggleMapModal();
    });
    hud.querySelector('#btn-hud-skills')?.addEventListener('click', () => {
      if (guardGhostClick()) return;
      this.pauseTab = 'skills';
      this.togglePauseModal();
    });
    interactBtn.addEventListener('click', () => {
      if (guardGhostClick()) return;
      this.engine.input.triggerInteractFromUI();
    });
  }

  public syncHud(): void {
    const s = this.engine.slot;
    const r = this.engine.room;
    if (!s || !r || !this.hudEl) return;

    const p = this.engine.player;
    const w = WEAPONS[s.equippedWeapon] || WEAPONS.sword_0;

    const isTouch = this.engine.input.usingTouch || NativeApp.isMobileOrTablet();

    if (this.hudRefs.lvSeal) {
      this.hudRefs.lvSeal.innerHTML = `<span>境</span><span>${s.level}</span>`;
    }
    if (this.hudRefs.resRow) {
      const potCnt = Object.values(s.consumables).reduce((a, b) => a + b, 0);
      const potCdTxt = p.potionCooldown > 0.05 ? `(${p.potionCooldown.toFixed(1)}s)` : '';
      const activeFam = this.engine.getActiveFamiliar();
      const ownedFams = this.engine.getOwnedFamiliars();
      const famTag = activeFam
        ? `<span data-cycle-fam="1" title="点击或按 [V] 切换护法灵" style="color:${FAMILIARS[activeFam].color};cursor:${ownedFams.length > 1 ? 'pointer' : 'default'};pointer-events:auto;">${FAMILIARS[activeFam].shortName}${this.engine.getFamiliarLevel(activeFam)}${ownedFams.length > 1 && !isTouch ? '[V]' : ''}</span>`
        : '';
      this.hudRefs.resRow.innerHTML = `<span style="color:#fde68a;">银 ${s.gold}</span><span style="color:#fb923c;">符 ${s.talismanHearts}</span><span style="color:${p.potionCooldown > 0.05 ? '#94a3b8' : '#5eead4'};">药 ${potCnt}${potCdTxt}</span>${famTag}`;
    }

    const hpPct = Math.max(0, Math.min(100, (p.hp / Math.max(1, p.maxHp)) * 100));
    const trailPct = Math.max(0, Math.min(100, (p.hpTrail / Math.max(1, p.maxHp)) * 100));
    const mpPct = Math.max(0, Math.min(100, (p.mp / Math.max(1, p.maxMp)) * 100));

    if (this.hudRefs.hpFill) this.hudRefs.hpFill.style.width = `${hpPct}%`;
    if (this.hudRefs.hpTrail) this.hudRefs.hpTrail.style.width = `${trailPct}%`;
    if (this.hudRefs.mpFill) this.hudRefs.mpFill.style.width = `${mpPct}%`;

    const wKey = `${w.id}:${s.ownedWeapons.length}:${isTouch ? 1 : 0}`;
    if (wKey !== this.lastHudWpnKey) {
      this.lastHudWpnKey = wKey;
      if (this.hudRefs.wpnIconWrap) {
        this.hudRefs.wpnIconWrap.innerHTML = getWeaponArtHtml(w.archetype, isTouch ? 44 : 56, w.id);
      }
      if (this.hudRefs.wpnName) this.hudRefs.wpnName.textContent = w.name;
      if (this.hudRefs.swapHint) {
        this.hudRefs.swapHint.textContent =
          s.ownedWeapons.length > 1 ? (isTouch ? '' : '[Q]') : '';
      }
    }

    if (this.hudRefs.minimapCanvas) {
      const mctx = this.hudRefs.minimapCanvas.getContext('2d');
      if (mctx) {
        this.drawCastlevaniaBlueprint(
          mctx,
          this.hudRefs.minimapCanvas.width,
          this.hudRefs.minimapCanvas.height,
          false
        );
      }
    }
    if (this.hudRefs.minimapLabel) {
      const pct = WorldMap.calcExplorationPct(s.visitedRooms);
      this.hudRefs.minimapLabel.textContent = `${r.name} · ${pct}%`;
    }

    const boss = this.engine.enemies.find((e) => e.profile.isBoss);
    if (this.hudRefs.bossWrap) {
      if (boss) {
        this.hudRefs.bossWrap.style.display = 'block';
        if (this.hudRefs.bossName) this.hudRefs.bossName.textContent = boss.profile.name;
        if (this.hudRefs.bossFill) {
          this.hudRefs.bossFill.style.width = `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%`;
        }
        if (this.hudRefs.bossTrail) {
          this.hudRefs.bossTrail.style.width = `${Math.max(0, (boss.hpTrail / boss.maxHp) * 100)}%`;
        }
        if (this.hudRefs.bossPoise) {
          const pRatio =
            boss.aiState === 'staggered'
              ? 0
              : Math.max(0, Math.min(100, (boss.poise / Math.max(1, boss.maxPoise)) * 100));
          this.hudRefs.bossPoise.style.width = `${pRatio}%`;
        }
      } else {
        this.hudRefs.bossWrap.style.display = 'none';
      }
    }

    if (this.hudRefs.interactBtn) {
      if (this.engine.nearbyInteract && !this.isAnyOverlayOpen()) {
        // 触屏端右侧【X 谈/香/阵】手柄键已实时鎏金变字，底部仅保留极简短语防遮挡画面
        this.hudRefs.interactBtn.style.display = 'block';
        this.hudRefs.interactBtn.textContent = this.engine.nearbyInteract.label;
      } else {
        this.hudRefs.interactBtn.style.display = 'none';
      }
    }
  }

  public toggleMapModal(): void {
    if (!this.engine.slot) return;
    if (this.modalEl && this.pauseTab === 'map') {
      this.closeModal();
      return;
    }
    this.mapViewRealm = this.engine.room?.realm || 'normal';
    this.inspectedMapRoomId = null;
    this.pauseTab = 'map';
    this.renderArsenalModal();
  }

  public togglePauseModal(): void {
    if (!this.engine.slot) return;
    if (this.modalEl) {
      this.closeModal();
      return;
    }
    this.previewItemId = null;
    this.renderArsenalModal();
  }

  // ==================== 《恶魔城 × 斩妖行》真人动态持兵舞台装备界面 ====================
  private renderArsenalModal(): void {
    if (!this.engine.slot || !this.engine.room) return;
    this.closeModal();

    const s = this.engine.slot;
    const overlay = document.createElement('div');
    overlay.className = 'zx-arsenal-overlay';

    let mainHtml = '';
    let footerLeft = '';
    let footerRight = `银两 ${s.gold} 文 · 灵符 ${s.talismanHearts} 枚`;

    if (this.pauseTab === 'equip') {
      const built = this.buildEquipColumnsHtml();
      mainHtml = built.html;
      footerLeft = built.footer;
    } else if (this.pauseTab === 'skills') {
      const relicKeys = [
        'familiar_sword',
        'familiar_phoenix',
        'familiar_tortoise',
        'familiar_kestrel',
        'familiar_fox',
        'double_jump',
        'mist_dash',
        'wall_jump',
        'grapple_hook',
        'ground_slam',
        'mirror_truth',
        'jade_pendant_full',
      ] as const;
      const abCards = relicKeys
        .map((key) => {
          const meta = ABILITIES_META[key];
          const owned = s.abilities.includes(key);
          const isFam = ALL_FAMILIAR_IDS.includes(key as FamiliarId);
          const famLvStr =
            isFam && owned
              ? ` (当前 Lv.${this.engine.getFamiliarLevel(key as FamiliarId)})`
              : '';
          return `
          <div class="zx-item-row ${owned ? 'equipped' : ''}" style="opacity:${owned ? 1 : 0.48};cursor:default;">
            <div>
              <strong style="font-size:15px;color:${owned ? meta.color : 'var(--bronze-light)'};">${owned ? '✦ 已觉醒 · ' : '未寻获 · '}${meta.name}${famLvStr}</strong>
              <div style="font-size:12px;color:#cbd5e1;margin-top:4px;">${meta.desc}</div>
            </div>
          </div>`;
        })
        .join('');

      mainHtml = `
        <div class="zx-scroll-pane">
          <div style="font-size:13px;color:var(--bronze);letter-spacing:1.5px;margin-bottom:8px;">真气武学（触屏一键 <b>RT 绝技</b> / 键盘 <b>O 键</b>：直按朔风 · 左右瞬影 · ↑升龙 · ↓太极，亦支持经典搓招）</div>
          <div class="zx-card-grid">
            ${this.buildSkillCardsHtml()}
          </div>
          <div style="font-size:13px;color:var(--bronze);letter-spacing:2px;margin:14px 0 8px;">镇司奇宝 · 古武轻功与破妄双信物</div>
          <div class="zx-card-grid">${abCards}</div>
        </div>
      `;
      footerLeft =
        '集齐【破妄古镜】与【完整玄鸟合璧佩】登临凌霄祭天坛，可开启 180° 九幽倒悬里城！';
    } else if (this.pauseTab === 'map') {
      const pct = WorldMap.calcExplorationPct(s.visitedRooms);
      const curRoomNow = this.engine.room;
      const curStageLabel = curRoomNow
        ? curRoomNow.realm === 'inverted'
          ? INVERTED_REGION_NAMES[curRoomNow.region]
          : REGION_NAMES[curRoomNow.region]
        : '';
      const realmSwitchHtml = `<div style="display:flex;gap:6px;flex-wrap:wrap;">
             <button class="zx-seal-btn" id="btn-map-zoom" style="${this.mapZoom > 1 ? 'border-color:#5eead4;color:#5eead4;' : ''}">${this.mapZoom > 1 ? '全览 1×' : '详图 2×'}</button>
             ${
               s.invertedUnlocked
                 ? `<button class="zx-seal-btn" id="btn-map-normal" style="${this.mapViewRealm === 'normal' ? 'border-color:#fde047;color:#fde047;' : ''}">阳表玄城</button>
                    <button class="zx-seal-btn" id="btn-map-inverted" style="${this.mapViewRealm === 'inverted' ? 'border-color:#f43f5e;color:#fda4af;' : ''}">倒悬里城</button>`
                 : ''
             }
           </div>`;
      const inspectedRoom = this.inspectedMapRoomId
        ? WorldMap.getAllRooms(this.mapViewRealm).find((r) => r.id === this.inspectedMapRoomId) ||
          null
        : null;
      const inspectedMeta = inspectedRoom ? this.describeInspectedRoom(inspectedRoom) : null;
      const pinTargetId =
        this.inspectedMapRoomId ||
        (this.engine.room && this.mapViewRealm === this.engine.room.realm
          ? this.engine.room.id
          : null);
      const pinKey = pinTargetId ? `${this.mapViewRealm}:${pinTargetId}` : '';
      const isPinned = Boolean(pinKey && (s.mapPins || []).includes(pinKey));
      const pinBtnHtml = pinTargetId
        ? `<button class="zx-seal-btn" id="btn-map-pin" style="padding:4px 10px;font-size:12px;${isPinned ? 'border-color:#fb7185;color:#fecdd3;background:rgba(159,18,57,0.55);' : ''}">${isPinned ? '⚑ 取消标点' : '⚑ 朱砂标点'}</button>`
        : '';
      mainHtml = `
        <div class="zx-map-pane">
          <div class="zx-map-header">
            <span class="zx-map-title">
              ${this.mapViewRealm === 'inverted' ? '九幽倒悬里城 · 逆乱堪舆图' : '九幽玄城 · 立体堪舆图'}${curStageLabel ? ` <span style="font-size:12px;color:#fde047;margin-left:6px;">【${curStageLabel}】</span>` : ''}
            </span>
            <span style="font-size:12.5px;color:var(--jade);font-weight:800;">
              探索度 ${pct}% / 200%+
            </span>
            ${realmSwitchHtml}
            ${pinBtnHtml}
          </div>
          <div class="zx-map-canvas-wrap">
            <canvas id="full-castle-map-canvas" width="920" height="406" style="touch-action:none;cursor:${this.mapZoom > 1 ? 'grab' : 'pointer'};"></canvas>
          </div>
          <div class="zx-map-legend">
            <span><b style="color:#fde047;">●</b> 当前所在</span>
            <span><b style="color:#f59e0b;">◆</b> 留档古祠</span>
            <span><b style="color:#10b981;">◯</b> 乾坤传送阵</span>
            <span><b style="color:#fde047;">✦</b> 未取秘宝</span>
            <span><b style="color:#fb7185;">⚑</b> 朱砂标点</span>
            <span style="color:#94a3b8;">轻点殿宇显机关锁需求与标点</span>
          </div>
        </div>
      `;
      footerLeft = inspectedMeta
        ? `【${inspectedMeta.stage}】${inspectedMeta.title}${inspectedMeta.badge ? ` · [${inspectedMeta.badge}]` : ''} — ${inspectedMeta.detail}`
        : '轻点地图中任意已探明方格即可浮现殿宇名称与机关秘宝详情（点击【详图 2×】可放大拖曳阅览）';
    } else if (this.pauseTab === 'bestiary') {
      mainHtml = this.buildBestiaryTabHtml();
      footerLeft = '镇妖司百鬼图鉴：记录妖邪属性、常掉补给、稀世神兵掉宝与本命妖丹';
    } else if (this.pauseTab === 'lore') {
      const compact = window.innerHeight < 540;
      const readList = s.readSteles || [];
      const steleEntries = Object.values(LORE_STELES);
      const steleCardsHtml = steleEntries
        .map((st) => {
          const unlocked = readList.includes(st.id);
          return `
            <div class="zx-item-row" style="flex-direction:column;align-items:flex-start;gap:6px;cursor:default;border-color:${unlocked ? 'rgba(56,189,248,0.45)' : 'rgba(148,163,184,0.16)'};">
              <div style="width:100%;display:flex;justify-content:space-between;align-items:center;gap:8px;">
                <span style="font-size:13.5px;font-weight:900;color:${unlocked ? '#7dd3fc' : '#64748b'};letter-spacing:1.5px;">
                  ${st.volume} ${unlocked ? st.title : '· 【尚未拓印】'}
                </span>
                <span style="font-size:11px;color:${unlocked ? 'var(--jade)' : '#94a3b8'};">
                  ${st.locationHint}
                </span>
              </div>
              ${
                unlocked
                  ? `<div style="font-size:11px;color:var(--bronze);">${st.author}</div>
                     <div style="font-size:12px;color:#e2e8f0;line-height:1.6;">${st.content}</div>`
                  : `<div style="font-size:12px;color:#64748b;line-height:1.5;">秘档残碑散落于【${st.locationHint}】，靠近残碑按【斩】即可拓印研读甲申血月之变真相。</div>`
              }
            </div>`;
        })
        .join('');

      mainHtml = `
        <div class="zx-scroll-pane" style="display:flex;flex-direction:column;gap:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(212,175,55,0.22);padding-bottom:6px;">
            <strong style="color:var(--bronze-light);letter-spacing:2px;font-size:14px;">甲申血月 · 镇妖司残碑秘档</strong>
            <span style="font-size:12px;color:#38bdf8;font-weight:800;">已拓印 ${readList.length} / ${steleEntries.length} 卷</span>
          </div>
          <div class="zx-card-grid">${steleCardsHtml}</div>
          <div style="border-bottom:1px solid rgba(212,175,55,0.22);padding-bottom:6px;margin-top:4px;">
            <strong style="color:var(--bronze-light);letter-spacing:2px;font-size:14px;">镇妖司与玄城人物列传</strong>
          </div>
          <div class="zx-card-grid">
            ${CHARACTER_BIOS.map(
              (b) => `
                <div class="zx-item-row" style="gap:12px;align-items:flex-end;cursor:default;overflow:hidden;padding-bottom:0;">
                  <div style="flex-shrink:0;line-height:0;">${getSpeakerPortraitSvg(b.name, compact ? 92 : 124)}</div>
                  <div style="padding-bottom:10px;">
                    <div style="font-size:15px;font-weight:900;color:${b.color};letter-spacing:2px;">${b.name}</div>
                    <div style="font-size:11px;color:var(--bronze);margin:2px 0 4px;">${b.ageTitle}</div>
                    <div style="font-size:12px;color:#cbd5e1;line-height:1.5;">${b.summary}</div>
                  </div>
                </div>`
            ).join('')}
          </div>
        </div>
      `;
      footerLeft = `甲申血月秘档（${readList.length}/${steleEntries.length}） · 镇妖司人物密档`;
    } else {
      const mute = AudioFX.getMuteState();
      const pScale = this.engine.input.padScale || 1.0;
      const padScaleLabel = pScale >= 1.1 ? '放大 (115%)' : pScale <= 0.9 ? '紧凑 (86%)' : '标准 (100%)';
      mainHtml = `
        <div class="zx-scroll-pane" style="display:flex;flex-direction:column;gap:10px;max-width:560px;">
          <div class="zx-item-row" style="cursor:default;flex-direction:column;align-items:flex-start;gap:8px;">
            <strong style="color:var(--bronze-light);letter-spacing:2px;">视听、手柄按键与全屏</strong>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button class="zx-seal-btn" id="set-bgm-mute">古琴配乐：${mute.bgmMuted ? '已静音' : '开启'}</button>
              <button class="zx-seal-btn" id="set-sfx-mute">金石刀音：${mute.sfxMuted ? '已静音' : '开启'}</button>
              <button class="zx-seal-btn" id="set-pad-style">左手按键：${
                this.engine.input.controlStyle === 'dpad' ? '经典十字键' : '手柄左摇杆'
              }</button>
              <button class="zx-seal-btn" id="set-pad-scale">触控键尺寸：${padScaleLabel}</button>
              <button class="zx-seal-btn" id="set-fullscreen">全屏横屏锁定</button>
            </div>
          </div>

          <div class="zx-item-row" style="cursor:default;flex-direction:column;align-items:flex-start;gap:8px;">
            <strong style="color:var(--bronze-light);letter-spacing:2px;">武库与堪舆试演</strong>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button class="zx-seal-btn" id="dev-grant-pack">配齐五系神兵 + 全奇宝</button>
              <button class="zx-seal-btn" id="dev-reveal-map">点亮双城全境堪舆图</button>
            </div>
          </div>

          <div>
            <button class="zx-seal-btn" id="btn-quit-title" style="border-color:#ef4444;color:#fca5a5;">留档并退回标题画卷</button>
          </div>
        </div>
      `;
      footerLeft = '系统卷宗设定';
    }

    const isTouch = this.engine.input.usingTouch || NativeApp.isMobileOrTablet();
    overlay.innerHTML = `
      <div class="zx-arsenal-topbar">
        <div class="zx-arsenal-tabs">
          <button class="zx-atab ${this.pauseTab === 'equip' ? 'active' : ''}" data-ptab="equip">兵匣</button>
          <button class="zx-atab ${this.pauseTab === 'skills' ? 'active' : ''}" data-ptab="skills">剑诀</button>
          <button class="zx-atab ${this.pauseTab === 'map' ? 'active' : ''}" data-ptab="map">堪舆</button>
          <button class="zx-atab ${this.pauseTab === 'bestiary' ? 'active' : ''}" data-ptab="bestiary">百鬼录</button>
          <button class="zx-atab ${this.pauseTab === 'lore' ? 'active' : ''}" data-ptab="lore">列传</button>
          <button class="zx-atab ${this.pauseTab === 'settings' ? 'active' : ''}" data-ptab="settings">系统</button>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
          <span class="zx-topbar-res">银 ${s.gold} · 符 ${s.talismanHearts}</span>
          <button class="zx-seal-btn" id="btn-close-pause">${isTouch ? '归阵' : '归阵 [ESC]'}</button>
        </div>
      </div>
      ${mainHtml}
      <div class="zx-arsenal-footer">
        <span class="zx-footer-desc">${footerLeft}</span>
        <span class="zx-footer-res">${footerRight}</span>
      </div>
    `;

    this.uiLayer.appendChild(overlay);
    this.modalEl = overlay;
    this.syncBlockState();

    this.bindFastTap(overlay.querySelector('#btn-close-pause'), () => this.closeModal());
    overlay.querySelectorAll<HTMLButtonElement>('[data-ptab]').forEach((b) => {
      b.onclick = () => {
        this.pauseTab = b.dataset.ptab as typeof this.pauseTab;
        this.previewItemId = null;
        if (this.pauseTab === 'map') {
          this.inspectedMapRoomId = null;
        }
        this.renderArsenalModal();
      };
    });

    if (this.pauseTab === 'equip') {
      this.bindEquipEventsAndLiveStage(overlay);
    } else if (this.pauseTab === 'map') {
      this.bindFastTap(overlay.querySelector('#btn-map-zoom'), () => {
        this.mapZoom = this.mapZoom > 1 ? 1 : 2;
        this.mapPanX = 0;
        this.mapPanY = 0;
        this.renderArsenalModal();
      });
      this.bindFastTap(overlay.querySelector('#btn-map-normal'), () => {
        this.mapViewRealm = 'normal';
        this.inspectedMapRoomId = null;
        this.mapPanX = 0;
        this.mapPanY = 0;
        this.renderArsenalModal();
      });
      this.bindFastTap(overlay.querySelector('#btn-map-inverted'), () => {
        this.mapViewRealm = 'inverted';
        this.inspectedMapRoomId = null;
        this.mapPanX = 0;
        this.mapPanY = 0;
        this.renderArsenalModal();
      });
      const syncPinBtnVisual = () => {
        const pinBtn = overlay.querySelector('#btn-map-pin') as HTMLButtonElement | null;
        if (!pinBtn) return;
        const targetId =
          this.inspectedMapRoomId ||
          (this.engine.room && this.mapViewRealm === this.engine.room.realm
            ? this.engine.room.id
            : null);
        if (!targetId) {
          pinBtn.style.display = 'none';
          return;
        }
        pinBtn.style.display = '';
        const pk = `${this.mapViewRealm}:${targetId}`;
        const pinned = (s.mapPins || []).includes(pk);
        pinBtn.textContent = pinned ? '⚑ 取消标点' : '⚑ 朱砂标点';
        pinBtn.style.borderColor = pinned ? '#fb7185' : '';
        pinBtn.style.color = pinned ? '#fecdd3' : '';
        pinBtn.style.background = pinned ? 'rgba(159,18,57,0.55)' : '';
      };
      this.bindFastTap(overlay.querySelector('#btn-map-pin'), () => {
        const targetId =
          this.inspectedMapRoomId ||
          (this.engine.room && this.mapViewRealm === this.engine.room.realm
            ? this.engine.room.id
            : null);
        if (!targetId) return;
        if (!s.mapPins) s.mapPins = [];
        const pk = `${this.mapViewRealm}:${targetId}`;
        const idx = s.mapPins.indexOf(pk);
        if (idx >= 0) s.mapPins.splice(idx, 1);
        else s.mapPins.push(pk);
        SaveManager.saveSlot(s);
        AudioFX.playHit(false);
        syncPinBtnVisual();
        const mc = overlay.querySelector('#full-castle-map-canvas') as HTMLCanvasElement | null;
        const mctx2 = mc?.getContext('2d');
        if (mc && mctx2) {
          this.drawCastlevaniaBlueprint(
            mctx2,
            mc.width,
            mc.height,
            true,
            this.mapViewRealm,
            this.mapZoom,
            this.mapPanX,
            this.mapPanY,
            this.inspectedMapRoomId
          );
        }
      });
      const mapCanvas = overlay.querySelector('#full-castle-map-canvas') as HTMLCanvasElement | null;
      const footerDescEl = overlay.querySelector('.zx-footer-desc') as HTMLElement | null;
      if (mapCanvas) {
        const mctx = mapCanvas.getContext('2d');
        const redraw = () => {
          if (!mctx) return;
          this.drawCastlevaniaBlueprint(
            mctx,
            mapCanvas.width,
            mapCanvas.height,
            true,
            this.mapViewRealm,
            this.mapZoom,
            this.mapPanX,
            this.mapPanY,
            this.inspectedMapRoomId
          );
        };
        redraw();

        let dragging = false;
        let downX = 0;
        let downY = 0;
        let lastX = 0;
        let lastY = 0;
        let moved = false;
        mapCanvas.addEventListener('pointerdown', (ev) => {
          dragging = true;
          moved = false;
          downX = ev.clientX;
          downY = ev.clientY;
          lastX = ev.clientX;
          lastY = ev.clientY;
          mapCanvas.setPointerCapture?.(ev.pointerId);
        });
        mapCanvas.addEventListener('pointermove', (ev) => {
          if (!dragging) return;
          const totalDist = Math.hypot(ev.clientX - downX, ev.clientY - downY);
          if (totalDist > 7) moved = true;
          if (this.mapZoom > 1 && moved) {
            const dx = ev.clientX - lastX;
            const dy = ev.clientY - lastY;
            const rect = mapCanvas.getBoundingClientRect();
            const scaleX = mapCanvas.width / Math.max(1, rect.width);
            const scaleY = mapCanvas.height / Math.max(1, rect.height);
            this.mapPanX = Math.max(-960, Math.min(960, this.mapPanX + dx * scaleX));
            this.mapPanY = Math.max(-480, Math.min(480, this.mapPanY + dy * scaleY));
            lastX = ev.clientX;
            lastY = ev.clientY;
            redraw();
          }
        });
        mapCanvas.addEventListener('pointerup', (ev) => {
          if (dragging && !moved) {
            const hitRoom = this.hitTestVisitedRoomOnCanvas(
              mapCanvas,
              ev.clientX,
              ev.clientY,
              this.mapViewRealm,
              this.mapZoom,
              this.mapPanX,
              this.mapPanY
            );
            if (hitRoom) {
              this.inspectedMapRoomId =
                this.inspectedMapRoomId === hitRoom.id ? null : hitRoom.id;
              AudioFX.playHit(false);
            } else {
              this.inspectedMapRoomId = null;
            }
            if (footerDescEl) {
              const inspected = this.inspectedMapRoomId
                ? WorldMap.getAllRooms(this.mapViewRealm).find(
                    (r) => r.id === this.inspectedMapRoomId
                  ) || null
                : null;
              if (inspected) {
                const meta = this.describeInspectedRoom(inspected);
                footerDescEl.textContent = `【${meta.stage}】${meta.title}${meta.badge ? ` · [${meta.badge}]` : ''} — ${meta.detail}`;
              } else {
                footerDescEl.textContent =
                  '轻点地图中任意已探明方格即可浮现殿宇名称与机关秘宝详情（点击【详图 2×】可放大拖曳阅览）';
              }
            }
            syncPinBtnVisual();
            redraw();
          }
          dragging = false;
        });
        mapCanvas.addEventListener('pointercancel', () => {
          dragging = false;
        });
        mapCanvas.addEventListener(
          'touchend',
          (ev) => {
            if (ev.cancelable) ev.preventDefault();
          },
          { passive: false }
        );
        mapCanvas.addEventListener(
          'wheel',
          (ev) => {
            ev.preventDefault();
            const nextZoom = ev.deltaY < 0 ? 2 : 1;
            if (nextZoom !== this.mapZoom) {
              this.mapZoom = nextZoom;
              this.mapPanX = 0;
              this.mapPanY = 0;
              this.renderArsenalModal();
            }
          },
          { passive: false }
        );
      }
    } else if (this.pauseTab === 'settings') {
      this.bindSettingsEvents(overlay);
    }
  }

  private buildBestiaryTabHtml(): string {
    const s = this.engine.slot!;
    const kills = s.bestiaryKills || {};
    const getThumbKey = (kind: EnemyKind): AssetKey => {
      if (kind === 'boss_xiao_duanshui') return 'boss_xiao_0';
      if (kind === 'boss_thunder_yaksha') return 'boss_yk_0';
      if (kind === 'boss_furnace_titan') return 'boss_ft_0';
      if (kind === 'boss_opera_god') return 'boss_op_0';
      if (kind === 'boss_colosseum_general') return 'boss_gen_0';
      if (kind === 'boss_shipyard_leviathan') return 'boss_lev_0';
      if (kind === 'boss_dragon_warden') return 'boss_wdn_0';
      if (kind === 'boss_pei_wuji' || kind === 'boss_zhuyin') {
        return 'boss_pei_0';
      }
      if (ENEMY_PROFILES[kind].isBoss) return 'boss_ik_0';
      if (kind === 'scroll_demon') return 'mob_book';
      if (kind === 'plague_toad') return 'mob_toad';
      if (kind === 'opera_puppet') return 'mob_puppet';
      if (kind === 'bell_gargoyle') return 'mob_gargoyle';
      if (kind === 'corpse_soldier') return 'mob_zombie';
      if (kind === 'demon_wolf') return 'mob_warg';
      if (kind === 'spirit_crow') return 'mob_crow';
      if (kind === 'bone_archer') return 'mob_bone_archer';
      if (kind === 'shenji_musketeer') return 'mob_musketeer';
      if (kind === 'jinwu_mace_guard') return 'mob_mace_guard';
      if (kind === 'guixu_water_fiend') return 'mob_water_fiend';
      if (kind === 'armored_tortoise') return 'mob_tortoise';
      if (kind === 'wuchang_reaper') return 'mob_wuchang';
      if (kind === 'bixie_stone_beast') return 'mob_bixie';
      if (kind === 'bronze_guard') return 'mob_gd_0';
      if (ENEMY_PROFILES[kind].flying) return 'mob_wr_0';
      return 'mob_sw_0';
    };

    const discSet = new Set(s.discoveredDrops || []);
    const resolveLootName = (kind: 'consumable' | 'weapon' | 'armor', itemId: string) => {
      if (kind === 'weapon') return WEAPONS[itemId]?.name || itemId;
      if (kind === 'armor') return ARMORS[itemId]?.name || itemId;
      return CONSUMABLES[itemId]?.name || itemId;
    };
    const isLootKnown = (
      eKind: EnemyKind,
      tier: 'common' | 'rare',
      entry: { kind: 'consumable' | 'weapon' | 'armor'; itemId: string }
    ) => {
      if (discSet.has(`${eKind}:${tier}`)) return true;
      if (entry.kind === 'weapon' && s.ownedWeapons.includes(entry.itemId)) return true;
      if (entry.kind === 'armor' && s.ownedArmors.includes(entry.itemId)) return true;
      return false;
    };

    const cards = (Object.keys(ENEMY_PROFILES) as EnemyKind[])
      .map((kind) => {
        const pr = ENEMY_PROFILES[kind];
        const cnt = kills[kind] || 0;
        const core = pr.yaoCoreId ? YAO_CORES[pr.yaoCoreId] : null;
        const hasCore = core ? s.ownedYaoCores.includes(core.id) : false;
        const seen =
          cnt > 0 ||
          s.defeatedBosses.some((k) => k.endsWith(kind)) ||
          this.engine.enemies.some((e) => e.profile.kind === kind);

        const commonKnown = pr.commonDrop ? isLootKnown(kind, 'common', pr.commonDrop) : false;
        const rareKnown = pr.rareDrop ? isLootKnown(kind, 'rare', pr.rareDrop) : false;
        const dropLineHtml =
          pr.commonDrop || pr.rareDrop
            ? `<div style="font-size:11px;margin-top:2px;color:#94a3b8;">
                 常掉：<span style="color:${commonKnown ? '#86efac' : '#64748b'};">${
                   pr.commonDrop
                     ? commonKnown
                       ? resolveLootName(pr.commonDrop.kind, pr.commonDrop.itemId)
                       : '？？？'
                     : '无'
                 }</span>
                 · 稀世：<span style="color:${rareKnown ? '#fde047' : '#64748b'};">${
                   pr.rareDrop
                     ? rareKnown
                       ? `✦ ${resolveLootName(pr.rareDrop.kind, pr.rareDrop.itemId)}`
                       : '？？？'
                     : '无'
                 }</span>
               </div>`
            : '';

        return `
          <div class="zx-item-row" style="gap:12px;cursor:default;opacity:${seen ? 1 : 0.45};">
            <img src="${Assets.getUrl(getThumbKey(kind))}" style="width:68px;height:54px;object-fit:contain;flex-shrink:0;filter:${seen ? 'drop-shadow(0 2px 5px #000)' : 'brightness(0)'};" alt="${pr.name}" />
            <div style="flex:1;min-width:0;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <strong style="font-size:14.5px;color:${pr.isBoss ? '#fca5a5' : 'var(--bronze-light)'};">${seen ? pr.name : '？？？· 未知妖邪'}</strong>
                <span style="font-size:11.5px;color:var(--ash);">斩讨 ${cnt}</span>
              </div>
              <div style="font-size:11.5px;color:#cbd5e1;margin-top:3px;">
                ${seen ? `气血 ${pr.hp} · 杀伐 ${pr.atk} · 护体 ${pr.def} · 银两 ${pr.gold}` : '行踪隐秘，尚未交锋'}
              </div>
              ${seen ? dropLineHtml : ''}
              <div style="font-size:11px;margin-top:2px;color:${hasCore ? '#d8b4fe' : 'var(--jade)'};">
                ${
                  core
                    ? hasCore
                      ? `✦ 已夺本命妖丹：【${core.name}】`
                      : `可夺妖丹：${seen ? core.name : '？？？'}`
                    : pr.rewardAbility
                      ? `镇守奇宝：【${ABILITIES_META[pr.rewardAbility].name}】`
                      : '镇守九幽要冲'
                }
              </div>
            </div>
          </div>`;
      })
      .join('');

    return `
      <div class="zx-scroll-pane zx-card-grid">
        ${cards}
      </div>
    `;
  }

  private getBlueprintMetrics(
    w: number,
    h: number,
    targetRealm: CastleRealm,
    zoom = 1,
    panX = 0,
    panY = 0
  ): { cellW: number; cellH: number; ox: number; oy: number } {
    const curRoom = this.engine.room;
    const p = this.engine.player;
    const padX = 20;
    const padY = 14;
    const baseCellW = Math.floor((w - padX * 2) / MAP_GRID_TOTAL_W);
    const baseCellH = Math.floor((h - padY * 2) / MAP_GRID_TOTAL_H);
    const cellW = Math.round(baseCellW * zoom);
    const cellH = Math.round(baseCellH * zoom);
    let ox: number;
    let oy: number;
    if (zoom > 1 && curRoom) {
      const playerGridX = curRoom.mapX + (p.x / Math.max(1, curRoom.pixelW)) * curRoom.gridW;
      const playerGridY = curRoom.mapY + (p.y / Math.max(1, curRoom.pixelH)) * curRoom.gridH;
      const focusGx = curRoom.realm === targetRealm ? playerGridX : MAP_GRID_TOTAL_W * 0.5;
      const focusGy = curRoom.realm === targetRealm ? playerGridY : MAP_GRID_TOTAL_H * 0.5;
      ox = Math.round(w * 0.5 - focusGx * cellW + panX);
      oy = Math.round(h * 0.5 - focusGy * cellH + panY);
    } else {
      ox = Math.floor((w - cellW * MAP_GRID_TOTAL_W) * 0.5);
      oy = Math.floor((h - cellH * MAP_GRID_TOTAL_H) * 0.5);
    }
    return { cellW, cellH, ox, oy };
  }

  private isRoomVisitedInSlot(rm: BuiltRoom, targetRealm: CastleRealm, visitedSet: Set<string>): boolean {
    if (visitedSet.has(`${targetRealm}:${rm.id}`)) return true;
    for (let dy = 0; dy < rm.gridH; dy++) {
      for (let dx = 0; dx < rm.gridW; dx++) {
        const key = `${rm.mapX + dx},${rm.mapY + dy}`;
        if (
          visitedSet.has(`cell:${targetRealm}:${key}`) ||
          (targetRealm === 'normal' && visitedSet.has(`cell:${key}`))
        ) {
          return true;
        }
      }
    }
    return false;
  }

  private hitTestVisitedRoomOnCanvas(
    canvas: HTMLCanvasElement,
    clientX: number,
    clientY: number,
    targetRealm: CastleRealm,
    zoom = 1,
    panX = 0,
    panY = 0
  ): BuiltRoom | null {
    const s = this.engine.slot;
    if (!s) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const mx = ((clientX - rect.left) / rect.width) * canvas.width;
    const my = ((clientY - rect.top) / rect.height) * canvas.height;
    const { cellW, cellH, ox, oy } = this.getBlueprintMetrics(
      canvas.width,
      canvas.height,
      targetRealm,
      zoom,
      panX,
      panY
    );
    const gx = (mx - ox) / Math.max(1, cellW);
    const gy = (my - oy) / Math.max(1, cellH);

    const visitedSet = new Set(s.visitedRooms);
    const rooms = WorldMap.getAllRooms(targetRealm);

    for (const rm of rooms) {
      if (!this.isRoomVisitedInSlot(rm, targetRealm, visitedSet)) continue;
      if (gx >= rm.mapX && gx <= rm.mapX + rm.gridW && gy >= rm.mapY && gy <= rm.mapY + rm.gridH) {
        return rm;
      }
    }

    // 移动端指尖宽容匹配：若轻偏离 1×1 小祠堂/传送室边缘 0.35 格以内亦精准命中
    let nearest: BuiltRoom | null = null;
    let bestDist = 0.38;
    for (const rm of rooms) {
      if (!this.isRoomVisitedInSlot(rm, targetRealm, visitedSet)) continue;
      const clampedX = Math.max(rm.mapX, Math.min(rm.mapX + rm.gridW, gx));
      const clampedY = Math.max(rm.mapY, Math.min(rm.mapY + rm.gridH, gy));
      const d = Math.hypot(gx - clampedX, gy - clampedY);
      if (d < bestDist) {
        bestDist = d;
        nearest = rm;
      }
    }
    return nearest;
  }

  private describeInspectedRoom(rm: BuiltRoom): {
    title: string;
    stage: string;
    badge: string;
    detail: string;
  } {
    const s = this.engine.slot;
    const stage =
      rm.realm === 'inverted' ? INVERTED_REGION_NAMES[rm.region] : REGION_NAMES[rm.region];
    const title = rm.warpName || rm.name;
    let badge = '';
    if (rm.special === 'save_shrine') badge = '留档古祠';
    else if (rm.special === 'warp_bagua') badge = '乾坤传送阵';
    else if (rm.special === 'boss_room') badge = '妖王镇守';
    else if (rm.id === 'forge_smithy') badge = '赤火名剑炉';
    else if (rm.id === 'library_shop') badge = '子夜鬼市';
    else if (rm.isSecretRoom) badge = '隐秘暗室';

    const notes: string[] = [];
    if (s) {
      if (rm.ironGate && !s.brokenSecretWalls.includes(rm.ironGate.id)) {
        const gk = rm.ironGate.gateKind;
        if (gk === 'mist_only' && !s.abilities.includes('mist_dash')) {
          notes.push('未解：需【缩地化雾】穿过紫瘴栅');
        } else if (gk === 'ice_phoenix') {
          notes.push('未解：需唤【朱雀丹火】融开寒冰障');
        } else if (gk === 'sluice_tortoise') {
          notes.push('未解：需唤【玄武镇岳】镇压水枢闸');
        } else if (gk === 'gear_kestrel') {
          notes.push('未解：需唤【天机木鸢】拨开齿轮锁');
        } else if (gk === 'illusion_fox') {
          notes.push('未解：需唤【青丘玉狐】勘破幻障');
        } else if (gk === 'lever_shortcut') {
          notes.push('未解：单向青铜枢机门（需从门内扳动）');
        } else if (gk !== 'mist_only') {
          notes.push('未解：需【重刃】劈开千斤铁闸');
        }
      }
      const unbrokenSeal = rm.shafts.some(
        (sh) => sh.sealId && !s.brokenSecretWalls.includes(sh.sealId)
      );
      if (unbrokenSeal) {
        notes.push('未解：需【千斤坠】震碎裂地封印');
      }
      if (!s.abilities.includes('double_jump') && rm.solidBlocks?.some((sb) => sb.blocking)) {
        notes.push('未解：需【踏云步】二段跳登高崖');
      }
      const hasTreasure = rm.pickups.some(
        (pk) => pk.kind !== 'consumable' && !s.collectedPickups.includes(pk.id)
      );
      if (hasTreasure) notes.push('尚有秘宝未取');
      if ((s.mapPins || []).includes(`${rm.realm}:${rm.id}`)) {
        notes.push('已打朱砂标点');
      }
    }
    if (notes.length === 0) {
      notes.push(rm.subtitle);
    }
    return { title, stage, badge, detail: notes.join(' · ') };
  }

  private drawFloatingRoomCallout(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    anchorX: number,
    topEdgeY: number,
    bottomEdgeY: number,
    line1: string,
    line2: string,
    accentColor = '#fde047'
  ): void {
    ctx.save();
    ctx.font = 'bold 12.5px "STKaiti", "KaiTi", "Noto Serif SC", serif';
    const w1 = ctx.measureText(line1).width;
    ctx.font = '11px "STKaiti", "KaiTi", "Noto Serif SC", serif';
    const w2 = line2 ? ctx.measureText(line2).width : 0;

    const padH = 11;
    const boxW = Math.min(w - 16, Math.max(w1, w2) + padH * 2);
    const boxH = line2 ? 38 : 22;
    const placeAbove = topEdgeY > boxH + 14;
    const bx = Math.max(8, Math.min(w - boxW - 8, anchorX - boxW * 0.5));
    const by = placeAbove
      ? Math.max(6, topEdgeY - boxH - 9)
      : Math.min(h - boxH - 6, bottomEdgeY + 9);

    ctx.fillStyle = 'rgba(6, 10, 20, 0.95)';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeRect(bx, by, boxW, boxH);

    // 指向选中房间的精致小尖角
    const tipX = Math.max(bx + 10, Math.min(bx + boxW - 10, anchorX));
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    if (placeAbove) {
      ctx.moveTo(tipX - 5, by + boxH);
      ctx.lineTo(tipX + 5, by + boxH);
      ctx.lineTo(tipX, by + boxH + 5);
    } else {
      ctx.moveTo(tipX - 5, by);
      ctx.lineTo(tipX + 5, by);
      ctx.lineTo(tipX, by - 5);
    }
    ctx.closePath();
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 12.5px "STKaiti", "KaiTi", "Noto Serif SC", serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText(line1, bx + padH, by + (line2 ? 12.5 : boxH * 0.52), boxW - padH * 2);

    if (line2) {
      ctx.font = '11px "STKaiti", "KaiTi", "Noto Serif SC", serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(line2, bx + padH, by + 28, boxW - padH * 2);
    }
    ctx.restore();
  }

  /**
   * 经典《恶魔城：月下夜想曲 / 晓月圆舞曲》2D 连通方格地图渲染器：
   * 地图方格内零文字杂讯，点击任意房间再按需浮现精致地名路牌！
   */
  private drawCastlevaniaBlueprint(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    detailed: boolean,
    realmOverride?: CastleRealm,
    zoom = 1,
    panX = 0,
    panY = 0,
    inspectedRoomId: string | null = null
  ): void {
    const s = this.engine.slot;
    const curRoom = this.engine.room;
    if (!s || !curRoom) return;

    const targetRealm = realmOverride || curRoom.realm;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    if (detailed && zoom > 1) {
      ctx.beginPath();
      ctx.rect(2, 2, w - 4, h - 4);
      ctx.clip();
    }

    // 大地图支持 36×12 全览 1× 与局部 2× 拖曳详图；右上角 HUD 小地图自动以玩家为中心平滑取景！
    let cellW: number;
    let cellH: number;
    let ox: number;
    let oy: number;
    const p = this.engine.player;
    const playerGridX = curRoom.mapX + (p.x / Math.max(1, curRoom.pixelW)) * curRoom.gridW;
    const playerGridY = curRoom.mapY + (p.y / Math.max(1, curRoom.pixelH)) * curRoom.gridH;

    if (detailed) {
      const m = this.getBlueprintMetrics(w, h, targetRealm, zoom, panX, panY);
      cellW = m.cellW;
      cellH = m.cellH;
      ox = m.ox;
      oy = m.oy;

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx <= MAP_GRID_TOTAL_W; gx++) {
        ctx.beginPath();
        ctx.moveTo(ox + gx * cellW, oy);
        ctx.lineTo(ox + gx * cellW, oy + MAP_GRID_TOTAL_H * cellH);
        ctx.stroke();
      }
      for (let gy = 0; gy <= MAP_GRID_TOTAL_H; gy++) {
        ctx.beginPath();
        ctx.moveTo(ox, oy + gy * cellH);
        ctx.lineTo(ox + MAP_GRID_TOTAL_W * cellW, oy + gy * cellH);
        ctx.stroke();
      }
    } else {
      cellW = 14;
      cellH = 11;
      const totalPxW = MAP_GRID_TOTAL_W * cellW;
      const totalPxH = MAP_GRID_TOTAL_H * cellH;
      const idealOx = Math.round(w * 0.5 - playerGridX * cellW);
      const idealOy = Math.round(h * 0.5 - playerGridY * cellH);
      ox = totalPxW <= w - 8 ? Math.floor((w - totalPxW) * 0.5) : Math.max(w - totalPxW - 4, Math.min(4, idealOx));
      oy = totalPxH <= h - 8 ? Math.floor((h - totalPxH) * 0.5) : Math.max(h - totalPxH - 4, Math.min(4, idealOy));
    }

    const rooms = WorldMap.getAllRooms(targetRealm);
    const visitedSet = new Set(s.visitedRooms);

    for (const rm of rooms) {
      const roomVisited = visitedSet.has(`${targetRealm}:${rm.id}`);
      let anyCellVisited = roomVisited;
      for (let dy = 0; dy < rm.gridH; dy++) {
        for (let dx = 0; dx < rm.gridW; dx++) {
          const key = `${rm.mapX + dx},${rm.mapY + dy}`;
          if (
            visitedSet.has(`cell:${targetRealm}:${key}`) ||
            (targetRealm === 'normal' && visitedSet.has(`cell:${key}`))
          ) {
            anyCellVisited = true;
          }
        }
      }
      if (!anyCellVisited) continue;

      let fillCol = 'rgba(37, 99, 235, 0.85)';
      if (targetRealm === 'inverted') {
        fillCol = 'rgba(136, 19, 55, 0.84)';
      } else if (rm.region === 'main_hall') {
        fillCol = 'rgba(180, 83, 9, 0.86)';
      } else if (rm.region === 'alchemy') {
        fillCol = 'rgba(124, 58, 237, 0.85)';
      } else if (rm.region === 'colosseum') {
        fillCol = 'rgba(185, 28, 28, 0.86)';
      } else if (rm.region === 'forge') {
        fillCol = 'rgba(194, 65, 12, 0.86)';
      } else if (rm.region === 'prison') {
        fillCol = 'rgba(29, 78, 216, 0.86)';
      } else if (rm.region === 'shipyard') {
        fillCol = 'rgba(13, 148, 136, 0.87)';
      } else if (rm.region === 'catacomb') {
        fillCol = 'rgba(15, 118, 110, 0.88)';
      } else if (rm.region === 'nether') {
        fillCol = 'rgba(5, 150, 105, 0.88)';
      } else if (rm.region === 'library') {
        fillCol = 'rgba(14, 116, 144, 0.86)';
      } else if (rm.region === 'opera') {
        fillCol = 'rgba(190, 24, 93, 0.86)';
      } else if (rm.region === 'clock_tower') {
        fillCol = 'rgba(71, 85, 105, 0.88)';
      } else if (rm.region === 'altar') {
        fillCol = 'rgba(225, 29, 72, 0.88)';
      }
      if (rm.isSecretRoom) fillCol = 'rgba(147, 51, 234, 0.94)';
      else if (rm.special === 'save_shrine') fillCol = 'rgba(217, 119, 6, 0.92)';
      else if (rm.special === 'warp_bagua') fillCol = 'rgba(5, 150, 105, 0.92)';
      else if (rm.special === 'boss_room') fillCol = 'rgba(185, 28, 28, 0.94)';

      for (let dy = 0; dy < rm.gridH; dy++) {
        for (let dx = 0; dx < rm.gridW; dx++) {
          const gx = rm.mapX + dx;
          const gy = rm.mapY + dy;
          const cellVis =
            visitedSet.has(`cell:${targetRealm}:${gx},${gy}`) ||
            (targetRealm === 'normal' && visitedSet.has(`cell:${gx},${gy}`)) ||
            (rm.gridH === 1 && roomVisited);
          ctx.fillStyle = cellVis ? fillCol : 'rgba(30, 41, 59, 0.42)';
          ctx.fillRect(ox + gx * cellW + 0.5, oy + gy * cellH + 0.5, cellW - 1, cellH - 1);
        }
      }

      const rx = ox + rm.mapX * cellW + 0.5;
      const ry = oy + rm.mapY * cellH + 0.5;
      const rw = rm.gridW * cellW - 1;
      const rh = rm.gridH * cellH - 1;
      const doorGap = Math.max(3, Math.floor(cellH * 0.36));
      const isHere = rm.id === curRoom.id && rm.realm === curRoom.realm;

      ctx.strokeStyle = isHere ? '#fef08a' : '#e2e8f0';
      ctx.lineWidth = detailed ? 1.8 : 1.1;

      const isRoomIdVisited = (tid: string): boolean =>
        visitedSet.has(`${targetRealm}:${tid}`) ||
        (targetRealm === 'normal' && visitedSet.has(tid));

      // 上边墙（支持多天井缺口 + 未探索天井翠青高亮引导）
      const upShafts = rm.shafts
        .filter((sh) => sh.dir === 'up')
        .sort((a, b) => a.x1 - b.x1);
      ctx.beginPath();
      let curTopX = rx;
      const halfG = Math.max(2.5, cellW * 0.18);
      for (const ush of upShafts) {
        const gapCx = rx + (((ush.x1 + ush.x2) * 0.5) / rm.pixelW) * rw;
        ctx.moveTo(curTopX, ry);
        ctx.lineTo(Math.max(curTopX, gapCx - halfG), ry);
        curTopX = Math.min(rx + rw, gapCx + halfG);
      }
      ctx.moveTo(curTopX, ry);
      ctx.lineTo(rx + rw, ry);
      ctx.stroke();

      for (const ush of upShafts) {
        if (!isRoomIdVisited(ush.targetRoomId)) {
          const gapCx = rx + (((ush.x1 + ush.x2) * 0.5) / rm.pixelW) * rw;
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(gapCx - halfG * 0.65, ry - 2, halfG * 1.3, 3);
        }
      }

      // 下边墙（支持多暗井缺口 + 未探索暗井翠青高亮引导）
      const downShafts = rm.shafts
        .filter((sh) => sh.dir === 'down')
        .sort((a, b) => a.x1 - b.x1);
      ctx.beginPath();
      let curBotX = rx;
      for (const dsh of downShafts) {
        const gapCx = rx + (((dsh.x1 + dsh.x2) * 0.5) / rm.pixelW) * rw;
        ctx.moveTo(curBotX, ry + rh);
        ctx.lineTo(Math.max(curBotX, gapCx - halfG), ry + rh);
        curBotX = Math.min(rx + rw, gapCx + halfG);
      }
      ctx.moveTo(curBotX, ry + rh);
      ctx.lineTo(rx + rw, ry + rh);
      ctx.stroke();

      for (const dsh of downShafts) {
        const gapCx = rx + (((dsh.x1 + dsh.x2) * 0.5) / rm.pixelW) * rw;
        if (dsh.sealId && !s.brokenSecretWalls.includes(dsh.sealId)) {
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(gapCx - halfG, ry + rh - 1.5, halfG * 2, detailed ? 3.5 : 2.5);
        } else if (!isRoomIdVisited(dsh.targetRoomId)) {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(gapCx - halfG * 0.65, ry + rh - 1, halfG * 1.3, 3);
        }
      }

      // 左右多层侧壁与门廊缺口（未探明出口显露翠青引路开口，已连通门廊显金门标记！）
      const drawSideWallWithDoors = (side: 'left' | 'right') => {
        const wallX = side === 'left' ? rx : rx + rw;
        const doors = getRoomSideDoors(rm, side)
          .filter((d) => !d.secretWallId || s.brokenSecretWalls.includes(d.secretWallId))
          .map((d) => {
            const rOff =
              d.rowOffset ??
              Math.min(
                rm.gridH - 1,
                Math.max(0, Math.floor((d.floorY / Math.max(1, rm.pixelH)) * rm.gridH))
              );
            return {
              dyCenter: ry + (rOff + 0.54) * cellH,
              unexplored: !isRoomIdVisited(d.targetRoomId),
            };
          })
          .sort((a, b) => a.dyCenter - b.dyCenter);

        ctx.strokeStyle = isHere ? '#fef08a' : '#e2e8f0';
        ctx.beginPath();
        let cy = ry;
        for (const dItem of doors) {
          ctx.moveTo(wallX, cy);
          ctx.lineTo(wallX, Math.max(cy, dItem.dyCenter - doorGap * 0.5));
          cy = Math.min(ry + rh, dItem.dyCenter + doorGap * 0.5);
        }
        ctx.moveTo(wallX, cy);
        ctx.lineTo(wallX, ry + rh);
        ctx.stroke();

        for (const dItem of doors) {
          ctx.fillStyle = dItem.unexplored ? '#38bdf8' : '#fde047';
          const tickW = dItem.unexplored ? (detailed ? 5.5 : 4.2) : 3.2;
          const tx =
            side === 'left'
              ? wallX - (dItem.unexplored ? tickW * 0.72 : 1.8)
              : wallX - (dItem.unexplored ? tickW * 0.28 : 1.4);
          ctx.fillRect(tx, dItem.dyCenter - doorGap * 0.36, tickW, doorGap * 0.72);
        }
      };
      drawSideWallWithDoors('left');
      drawSideWallWithDoors('right');

      // 《恶魔城：月下夜想曲》式纯几何徽记（无文字杂讯，古祠菱印、乾坤阵环、商坊圆印一目了然）
      const midRx = rx + rw * 0.5;
      const midRy = ry + rh * 0.5;
      const symR = detailed ? 4.4 : 2.6;
      if (rm.special === 'save_shrine') {
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.moveTo(midRx, midRy - symR);
        ctx.lineTo(midRx + symR, midRy);
        ctx.lineTo(midRx, midRy + symR);
        ctx.lineTo(midRx - symR, midRy);
        ctx.closePath();
        ctx.fill();
      } else if (rm.special === 'warp_bagua') {
        ctx.strokeStyle = '#5eead4';
        ctx.lineWidth = detailed ? 1.8 : 1.2;
        ctx.beginPath();
        ctx.arc(midRx, midRy, symR * 0.92, 0, Math.PI * 2);
        ctx.stroke();
      } else if (rm.id === 'library_shop' || rm.id === 'forge_smithy') {
        ctx.fillStyle = '#fdba74';
        ctx.beginPath();
        ctx.arc(midRx, midRy, symR * 0.78, 0, Math.PI * 2);
        ctx.fill();
      }

      // 《月下 / 空洞骑士》式堪舆图记忆标记：未破五灵机关锁、单向拉杆门、重刃铁闸、二段跳高崖自动色标高亮提示！
      if (rm.ironGate && !s.brokenSecretWalls.includes(rm.ironGate.id)) {
        const gk = rm.ironGate.gateKind;
        const isMist = gk === 'mist_only';
        if (!(isMist && s.abilities.includes('mist_dash'))) {
          const gx = rx + (rm.ironGate.x / Math.max(1, rm.pixelW)) * rw;
          const gyCenter =
            ry + (Math.min(rm.pixelH, rm.ironGate.bottomY - 60) / Math.max(1, rm.pixelH)) * rh;
          const gh = detailed ? 11 : 6;
          ctx.fillStyle =
            gk === 'mist_only'
              ? '#c084fc'
              : gk === 'ice_phoenix'
                ? '#fb923c'
                : gk === 'sluice_tortoise'
                  ? '#22d3ee'
                  : gk === 'gear_kestrel'
                    ? '#facc15'
                    : gk === 'illusion_fox'
                      ? '#a7f3d0'
                      : gk === 'lever_shortcut'
                        ? '#fbbf24'
                        : '#f97316';
          ctx.fillRect(gx - (detailed ? 2 : 1.2), gyCenter - gh * 0.5, detailed ? 4 : 2.4, gh);
        }
      }

      if (
        !s.abilities.includes('double_jump') &&
        rm.solidBlocks?.some((sb) => sb.blocking)
      ) {
        const blk = rm.solidBlocks.find((sb) => sb.blocking)!;
        const bx = rx + (blk.x / Math.max(1, rm.pixelW)) * rw;
        const by = ry + rh * 0.52;
        ctx.strokeStyle = '#2dd4bf';
        ctx.lineWidth = detailed ? 2 : 1.3;
        ctx.beginPath();
        ctx.moveTo(bx - 3, by + 2);
        ctx.lineTo(bx, by - 2);
        ctx.lineTo(bx + 3, by + 2);
        ctx.stroke();
      }

      if (detailed) {
        const hasUncollectedTreasure = rm.pickups.some(
          (pk) =>
            pk.kind !== 'consumable' && !s.collectedPickups.includes(pk.id)
        );
        if (hasUncollectedTreasure) {
          const tx = rx + rw - 6;
          const ty = ry + 6;
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.moveTo(tx, ty - 3.5);
          ctx.lineTo(tx + 3.2, ty);
          ctx.lineTo(tx, ty + 3.5);
          ctx.lineTo(tx - 3.2, ty);
          ctx.closePath();
          ctx.fill();
        }
      }

      // 玩家自定义朱砂小旗标点（全图与微缩地图同步清晰标识！）
      if ((s.mapPins || []).includes(`${targetRealm}:${rm.id}`)) {
        const px = rx + (detailed ? 6 : 4);
        const py = ry + (detailed ? 5 : 3.5);
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = detailed ? 1.5 : 1;
        ctx.beginPath();
        ctx.moveTo(px, py - (detailed ? 3 : 2));
        ctx.lineTo(px, py + (detailed ? 6 : 4));
        ctx.stroke();
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.moveTo(px, py - (detailed ? 3 : 2));
        ctx.lineTo(px + (detailed ? 7 : 4.5), py);
        ctx.lineTo(px, py + (detailed ? 3 : 2));
        ctx.closePath();
        ctx.fill();
      }
    }

    if (curRoom.realm === targetRealm && curRoom.id !== 'boss_rush_arena') {
      const dotX = ox + playerGridX * cellW;
      const dotY = oy + playerGridY * cellH;
      const pulse = 0.55 + 0.45 * Math.sin(performance.now() * 0.01);

      ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
      ctx.beginPath();
      ctx.arc(dotX, dotY, detailed ? 5 : 2.8, 0, Math.PI * 2);
      ctx.fill();
      if (detailed) {
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 8.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 仅在玩家点击选中某间已探明殿宇时，高亮外框并弹出单枚悬浮铭牌（平时地图 100% 纯净无文字！）
    if (detailed && inspectedRoomId) {
      const targetRm = rooms.find((r) => r.id === inspectedRoomId);
      if (targetRm && this.isRoomVisitedInSlot(targetRm, targetRealm, visitedSet)) {
        const irx = ox + targetRm.mapX * cellW + 0.5;
        const iry = oy + targetRm.mapY * cellH + 0.5;
        const irw = targetRm.gridW * cellW - 1;
        const irh = targetRm.gridH * cellH - 1;

        ctx.save();
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.6;
        ctx.strokeRect(irx - 1, iry - 1, irw + 2, irh + 2);
        ctx.fillStyle = 'rgba(254, 240, 138, 0.22)';
        ctx.fillRect(irx, iry, irw, irh);
        ctx.restore();

        const meta = this.describeInspectedRoom(targetRm);
        const l1 = `${meta.title}${meta.badge ? ` · 【${meta.badge}】` : ''}`;
        const l2 = `${meta.stage} · ${meta.detail}`;
        this.drawFloatingRoomCallout(
          ctx,
          w,
          h,
          irx + irw * 0.5,
          iry,
          iry + irh,
          l1,
          l2,
          '#fde047'
        );
      }
    }
    ctx.restore();
  }

  private buildEquipColumnsHtml(): { html: string; footer: string } {
    const s = this.engine.slot!;
    const p = this.engine.player;
    const curWpn = WEAPONS[s.equippedWeapon] || WEAPONS.sword_0;
    const curSub = SUB_WEAPONS[s.equippedSubWeapon] || SUB_WEAPONS.dagger_throw;
    const curArm = ARMORS[s.equippedArmor] || ARMORS.cloth_tunic;
    const curAcc = ARMORS[s.equippedAccessory] || ARMORS.broken_jade;
    const curCore = s.equippedYaoCore ? YAO_CORES[s.equippedYaoCore] : null;
    const activeFam = this.engine.getActiveFamiliar();
    const ownedFams = this.engine.getOwnedFamiliars();
    const potCnt = Object.values(s.consumables).reduce((a, b) => a + b, 0);

    const compact = window.innerHeight < 540 || window.innerWidth < 900;
    const wpnIconSize = compact ? 54 : 80;
    const slots: { key: EquipSlotCategory; cat: string; cur: string }[] = [
      { key: 'weapon', cat: compact ? '主兵' : '主手兵刃', cur: curWpn.name },
      {
        key: 'spirit',
        cat: compact ? '护灵' : '随身护灵',
        cur: activeFam ? FAMILIARS[activeFam].name : '未契约',
      },
      { key: 'sub', cat: compact ? '副器' : '奇门副器', cur: curSub.name },
      { key: 'armor', cat: compact ? '衣甲' : '护身衣甲', cur: curArm.name },
      { key: 'accessory', cat: compact ? '佩玉' : '随身佩玉', cur: curAcc.name },
      { key: 'core', cat: compact ? '妖丹' : '本命妖丹', cur: curCore ? curCore.name : '未融炼' },
      { key: 'potion', cat: compact ? '丹药' : '疗伤丹药', cur: potCnt > 0 ? `${potCnt} 份` : '已空' },
    ];

    const slotRailHtml = slots
      .map(
        (sl) => `
        <div class="zx-slot-pill ${this.selectedEquipSlot === sl.key ? 'selected' : ''}" data-slot-cat="${sl.key}">
          <div class="zx-slot-cat">${sl.cat}</div>
          <div class="zx-slot-cur">${sl.cur}</div>
        </div>`
      )
      .join('');

    let rowsHtml = '';
    let footerTxt = '';

    if (this.selectedEquipSlot === 'weapon') {
      const focusW = WEAPONS[this.previewItemId || s.equippedWeapon] || curWpn;
      footerTxt = `【${focusW.name}】${focusW.traitDesc}`;
      const archTag = (a: string) =>
        a === 'greatsword'
          ? '重刃破盾'
          : a === 'spear'
            ? '长枪寸劲'
            : a === 'daggers'
              ? '双刺背爆'
              : a === 'whip'
                ? '八向雷鞭'
                : '轻剑连斩';
      const totalWeapons = Object.keys(WEAPONS).length;
      const validOwned = s.ownedWeapons.filter((id) => Boolean(WEAPONS[id]));
      const tierBadge = (t: number) =>
        t >= 4
          ? '<span style="color:#fde047;font-size:11px;font-weight:800;">【传世绝品】</span>'
          : t === 3
            ? '<span style="color:#38bdf8;font-size:11px;font-weight:800;">【玄门名器】</span>'
            : t === 2
              ? '<span style="color:#a7f3d0;font-size:11px;font-weight:800;">【百炼良兵】</span>'
              : '<span style="color:#94a3b8;font-size:11px;">【军中凡铁】</span>';
      rowsHtml =
        `<div style="font-size:12px;color:#cbd5e1;padding:2px 6px 6px;display:flex;justify-content:space-between;align-items:center;">
          <span>独门兵刃收集录</span>
          <span style="color:#fde68a;font-weight:800;">已收入囊 ${validOwned.length} / ${totalWeapons}</span>
        </div>` +
        validOwned
          .map((id) => {
            const w = WEAPONS[id];
            const eq = s.equippedWeapon === id;
            return `
          <div class="zx-item-row ${eq ? 'equipped' : ''}" data-pick-id="${id}">
            <div style="display:flex;align-items:center;gap:12px;min-width:0;">
              ${getWeaponArtHtml(w.archetype, wpnIconSize, w.id)}
              <div style="min-width:0;">
                <div style="font-size:14.5px;font-weight:900;color:var(--rice);">${w.name} ${tierBadge(w.tier)}</div>
                <div style="font-size:11.5px;color:var(--ash);">杀伤 +${w.atk}${w.critBonus ? ` · 暴击 +${Math.round(w.critBonus * 100)}%` : ''} · ${archTag(w.archetype)}</div>
              </div>
            </div>
            ${eq ? `<span class="zx-eq-seal">佩挂中</span>` : `<span class="zx-eq-hint">换装</span>`}
          </div>`;
          })
          .join('');
    } else if (this.selectedEquipSlot === 'spirit') {
      const focusFamId =
        (this.previewItemId && FAMILIARS[this.previewItemId as FamiliarId]
          ? (this.previewItemId as FamiliarId)
          : activeFam) || 'familiar_sword';
      const focusFam = FAMILIARS[focusFamId];
      footerTxt = `【${focusFam.name}】${focusFam.desc}`;
      const famIconSize = compact ? 44 : 56;
      rowsHtml =
        `<div style="font-size:12px;color:#cbd5e1;padding:2px 6px 6px;display:flex;justify-content:space-between;align-items:center;">
          <span>五灵护法录（局内点左上灵号或按 [V] 键瞬息换灵）</span>
          <span style="color:#fde68a;font-weight:800;">已缔结 ${ownedFams.length} / ${ALL_FAMILIAR_IDS.length}</span>
        </div>` +
        ALL_FAMILIAR_IDS.map((fid) => {
          const fDef = FAMILIARS[fid];
          const meta = ABILITIES_META[fid];
          const owned = ownedFams.includes(fid);
          const eq = activeFam === fid;
          const lv = this.engine.getFamiliarLevel(fid);
          return `
          <div class="zx-item-row ${eq ? 'equipped' : ''}" ${owned ? `data-pick-id="${fid}"` : ''} style="opacity:${owned ? 1 : 0.45};cursor:${owned ? 'pointer' : 'default'};">
            <div style="display:flex;align-items:center;gap:12px;min-width:0;">
              <div style="filter:${owned ? 'none' : 'brightness(0) opacity(0.7)'};">${getFamiliarArtHtml(fid, famIconSize)}</div>
              <div style="min-width:0;">
                <div style="font-size:14.5px;font-weight:900;color:${owned ? fDef.color : 'var(--ash)'};">${fDef.name} ${owned ? `<span style="font-size:11px;color:#fde68a;">Lv.${lv}</span>` : '<span style="font-size:11px;color:#64748b;">【尚未寻获】</span>'}</div>
                <div style="font-size:11.5px;color:var(--ash);">${owned ? `${fDef.traitTag} · ${fDef.sealDesc}` : meta.subtitle}</div>
              </div>
            </div>
            ${eq ? `<span class="zx-eq-seal">随行中</span>` : owned ? `<span class="zx-eq-hint">唤灵</span>` : ''}
          </div>`;
        }).join('');
    } else if (this.selectedEquipSlot === 'sub') {
      const focusSub =
        SUB_WEAPONS[(this.previewItemId as SubWeaponId) || s.equippedSubWeapon] || curSub;
      footerTxt = `【${focusSub.name}】${focusSub.desc}`;
      rowsHtml = s.ownedSubWeapons
        .map((id) => {
          const sub = SUB_WEAPONS[id];
          const eq = s.equippedSubWeapon === id;
          return `
          <div class="zx-item-row ${eq ? 'equipped' : ''}" data-pick-id="${id}">
            <div style="display:flex;align-items:center;gap:12px;">
              ${getSubWeaponSvg(sub.id)}
              <div>
                <div style="font-size:15px;font-weight:900;color:var(--rice);">${sub.name}</div>
                <div style="font-size:11.5px;color:var(--ash);">耗符 ${sub.talismanCost}</div>
              </div>
            </div>
            ${eq ? `<span class="zx-eq-seal">装配中</span>` : ''}
          </div>`;
        })
        .join('');
    } else if (this.selectedEquipSlot === 'armor' || this.selectedEquipSlot === 'accessory') {
      const target = this.selectedEquipSlot;
      const curId = target === 'armor' ? s.equippedArmor : s.equippedAccessory;
      const focusA = ARMORS[this.previewItemId || curId] || curArm;
      footerTxt = `【${focusA.name}】${focusA.desc}`;
      rowsHtml = s.ownedArmors
        .filter((id) => ARMORS[id]?.slot === target)
        .map((id) => {
          const a = ARMORS[id];
          const eq = curId === id;
          const tags: string[] = [`护体 +${a.def}`];
          if (a.dropRateMult && a.dropRateMult > 1) tags.push(`掉宝 ×${a.dropRateMult.toFixed(1)}`);
          if (a.lifestealBonus) tags.push(`饮血 +${Math.round(a.lifestealBonus * 100)}%`);
          if (a.mpOnHitBonus) tags.push(`斩回真气 +${a.mpOnHitBonus}`);
          if (a.speedBonus) tags.push(`轻功 +${Math.round(a.speedBonus * 100)}%`);
          return `
          <div class="zx-item-row ${eq ? 'equipped' : ''}" data-pick-id="${id}">
            <div style="display:flex;align-items:center;gap:12px;">
              ${getSlotCategorySvg(target)}
              <div>
                <div style="font-size:15px;font-weight:900;color:var(--rice);">${a.name}</div>
                <div style="font-size:11.5px;color:var(--ash);">${tags.join(' · ')}</div>
              </div>
            </div>
            ${eq ? `<span class="zx-eq-seal">穿戴中</span>` : ''}
          </div>`;
        })
        .join('');
    } else if (this.selectedEquipSlot === 'core') {
      footerTxt = curCore ? `【${curCore.name}】${curCore.desc}` : '斩杀城中纸人、冥火鬼概率掉落本命妖丹';
      rowsHtml =
        s.ownedYaoCores.length === 0
          ? `<div style="padding:18px;color:var(--ash);font-size:13px;">尚未吸纳本命妖丹，在城中斩妖除魔即可夺取！</div>`
          : s.ownedYaoCores
              .map((id) => {
                const c = YAO_CORES[id];
                const eq = s.equippedYaoCore === id;
                return `
              <div class="zx-item-row ${eq ? 'equipped' : ''}" data-pick-id="${id}">
                <div style="display:flex;align-items:center;gap:12px;">
                  ${getSlotCategorySvg('core')}
                  <div>
                    <div style="font-size:15px;font-weight:900;color:var(--rice);">${c.name}</div>
                    <div style="font-size:11.5px;color:var(--ash);">${c.desc}</div>
                  </div>
                </div>
                ${eq ? `<span class="zx-eq-seal">运转中</span>` : ''}
              </div>`;
              })
              .join('');
    } else {
      const potCd = this.engine.player.potionCooldown;
      footerTxt =
        potCd > 0.05
          ? `丹药药力周天调息中（剩余 ${potCd.toFixed(1)}s），调息完毕方可再次服药`
          : '点击丹药即可当场服用恢复气血真气（局内亦可按 [H] 快捷服药，饮药后需 3.5s 调息）';
      const entries = Object.entries(s.consumables).filter(([, c]) => c > 0);
      rowsHtml =
        entries.length === 0
          ? `<div style="padding:18px;color:var(--ash);font-size:13px;">行囊中暂无丹药。</div>`
          : entries
              .map(([id, cnt]) => {
                const c = CONSUMABLES[id];
                return `
              <div class="zx-item-row" data-pick-id="${id}" style="opacity:${potCd > 0.05 ? 0.58 : 1};">
                <div style="display:flex;align-items:center;gap:12px;">
                  ${getSlotCategorySvg('potion', id)}
                  <div>
                    <div style="font-size:15px;font-weight:900;color:var(--rice);">${c.name} ×${cnt}</div>
                    <div style="font-size:11.5px;color:var(--jade);">${c.desc}</div>
                  </div>
                </div>
                <span class="zx-eq-seal" style="background:${potCd > 0.05 ? '#334155' : '#115e59'};border-color:${potCd > 0.05 ? '#64748b' : '#2dd4bf'};">${potCd > 0.05 ? `${potCd.toFixed(1)}s` : '服用'}</span>
              </div>`;
              })
              .join('');
    }

    const curStats = this.engine.computePreviewStats();
    const overrides: Parameters<GameEngine['computePreviewStats']>[0] = {};
    if (this.previewItemId) {
      if (this.selectedEquipSlot === 'weapon') overrides.weaponId = this.previewItemId;
      else if (this.selectedEquipSlot === 'armor') overrides.armorId = this.previewItemId;
      else if (this.selectedEquipSlot === 'accessory') overrides.accessoryId = this.previewItemId;
      else if (this.selectedEquipSlot === 'core') overrides.coreId = this.previewItemId;
    }
    const nxtStats = this.engine.computePreviewStats(overrides);

    const diff = (a: number, b: number) =>
      b > a
        ? `${a} <span class="stat-up">➔ ${b} ▲</span>`
        : b < a
          ? `${a} <span class="stat-down">➔ ${b} ▼</span>`
          : `${a}`;

    const html = `
      <div class="zx-arsenal-body">
        <div class="zx-stage-col">
          <div style="font-size:15px;font-weight:900;letter-spacing:3px;color:var(--bronze-light);">
            ${s.heroName} · 境界 ${s.level}
          </div>
          <canvas id="equip-stage-canvas" width="250" height="256"></canvas>
          <div style="font-size:11.5px;color:var(--ash);text-align:center;">
            点击兵刃即可实时观摩持兵架势与挥斩刀光
          </div>
        </div>

        <div class="zx-center-col">
          <div class="zx-slot-rail">${slotRailHtml}</div>
          <div class="zx-item-list">${rowsHtml}</div>
        </div>

        <div class="zx-stat-col">
          <div style="font-size:14px;font-weight:900;letter-spacing:3px;color:var(--bronze-light);margin-bottom:4px;">武道六维</div>
          <div class="zx-stat-line"><span>气血</span><span>${Math.ceil(p.hp)} / ${diff(curStats.maxHp, nxtStats.maxHp)}</span></div>
          <div class="zx-stat-line"><span>真气</span><span>${Math.floor(p.mp)} / ${diff(curStats.maxMp, nxtStats.maxMp)}</span></div>
          <div class="zx-stat-line"><span>杀伐攻击</span><span>${diff(curStats.atk, nxtStats.atk)}</span></div>
          <div class="zx-stat-line"><span>护体防御</span><span>${diff(curStats.def, nxtStats.def)}</span></div>
          <div class="zx-stat-line"><span>臂力</span><span>${diff(curStats.str, nxtStats.str)}</span></div>
          <div class="zx-stat-line"><span>体魄</span><span>${diff(curStats.con, nxtStats.con)}</span></div>
          <div class="zx-stat-line"><span>神识</span><span>${diff(curStats.int, nxtStats.int)}</span></div>
          <div class="zx-stat-line"><span>福缘</span><span>${diff(curStats.lck, nxtStats.lck)}</span></div>
        </div>
      </div>
    `;

    return { html, footer: footerTxt };
  }

  private bindEquipEventsAndLiveStage(overlay: HTMLElement): void {
    const s = this.engine.slot!;

    // 启动左侧 60fps 真人骨骼动态持兵试演舞台（移动端小屏隐藏时自动休眠省电！）
    const stageCanvas = overlay.querySelector('#equip-stage-canvas') as HTMLCanvasElement | null;
    if (stageCanvas && stageCanvas.offsetParent !== null) {
      const sctx = stageCanvas.getContext('2d')!;
      let last = performance.now();
      let animT = 0;

      const loop = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        animT += dt;

        sctx.clearRect(0, 0, stageCanvas.width, stageCanvas.height);

        // 脚下青石试剑台圆盘
        sctx.fillStyle = '#141c2c';
        sctx.strokeStyle = 'rgba(198, 154, 69, 0.5)';
        sctx.lineWidth = 1.5;
        sctx.beginPath();
        sctx.ellipse(116, 228, 76, 14, 0, 0, Math.PI * 2);
        sctx.fill();
        sctx.stroke();

        if (this.stageSlash) {
          this.stageSlash.progress += dt / this.stageSlash.duration;
          if (this.stageSlash.progress >= 1) this.stageSlash = null;
        }

        const shownWpn =
          this.selectedEquipSlot === 'weapon' && this.previewItemId
            ? this.previewItemId
            : s.equippedWeapon;
        const secWpn = s.ownedWeapons.find((id) => id !== shownWpn);
        const shownFam: FamiliarId | null =
          this.selectedEquipSlot === 'spirit' &&
          this.previewItemId &&
          FAMILIARS[this.previewItemId as FamiliarId] &&
          s.abilities.includes(this.previewItemId as FamiliarId)
            ? (this.previewItemId as FamiliarId)
            : this.engine.getActiveFamiliar();

        if (shownFam) {
          const fDef = FAMILIARS[shownFam];
          const fImg = Assets.get(resolveFamiliarAssetKey(shownFam));
          if (fImg) {
            const fx = 56;
            const fy = 104 + Math.sin(animT * 3.6) * 5;
            sctx.save();
            sctx.globalCompositeOperation = 'lighter';
            const fg = sctx.createRadialGradient(fx, fy, 2, fx, fy, 30);
            fg.addColorStop(0, fDef.auraRgba);
            fg.addColorStop(1, 'rgba(0,0,0,0)');
            sctx.fillStyle = fg;
            sctx.beginPath();
            sctx.arc(fx, fy, 30, 0, Math.PI * 2);
            sctx.fill();
            sctx.restore();
            const fh = 50;
            const fw = fImg.width * (fh / fImg.height);
            sctx.drawImage(fImg, fx - fw * 0.5, fy - fh * 0.5, fw, fh);
          }
        }

        renderModularLiYichengRig(sctx, {
          x: 102,
          y: 226,
          facing: 1,
          vx: 0,
          vy: 0,
          onGround: true,
          runCycle: 0,
          animTime: animT,
          landSquash: 0,
          doubleJumpSpin: 0,
          equippedWeaponId: shownWpn,
          secondaryWeaponId: secWpn,
          slash: this.stageSlash,
          scale: 1.4,
          isXiaoMode: s.mode === 'xiaoduanshui',
        });

        if (this.stageSlash) {
          const isHeavy = this.stageSlash.archetype === 'greatsword';
          if (!isHeavy || this.stageSlash.progress >= 0.3) {
            const p = isHeavy ? (this.stageSlash.progress - 0.3) / 0.7 : this.stageSlash.progress;
            drawInkSlashRibbon(
              sctx,
              108,
              164,
              1,
              false,
              isHeavy ? 96 : 82,
              isHeavy ? 28 : 20,
              -1.6,
              -1.2 + Math.min(1, p * 1.35) * 2.5,
              isHeavy ? '#f97316' : '#2dd4bf',
              1 - p * 0.5
            );
          }
        }

        this.stageRafId = requestAnimationFrame(loop);
      };
      this.stageRafId = requestAnimationFrame(loop);
    }

    overlay.querySelectorAll<HTMLElement>('[data-slot-cat]').forEach((el) => {
      el.onclick = () => {
        AudioFX.playHit(false);
        this.selectedEquipSlot = el.dataset.slotCat as EquipSlotCategory;
        this.previewItemId = null;
        this.renderArsenalModal();
      };
    });

    overlay.querySelectorAll<HTMLElement>('[data-pick-id]').forEach((row) => {
      const id = row.dataset.pickId!;
      row.onmouseenter = () => {
        if (this.previewItemId !== id) {
          this.previewItemId = id;
        }
      };
      row.onclick = () => {
        if (this.selectedEquipSlot === 'weapon') {
          s.equippedWeapon = id;
          this.engine.recalcStats(false);
          const w = WEAPONS[id];
          AudioFX.playSlash(w.archetype === 'greatsword' ? 'heavy' : 'light');
          // 换兵瞬间在左侧舞台现场挥出一式帅气试刀斩！
          this.stageSlash = {
            x: 105,
            y: 146,
            facing: 1,
            aimX: 1,
            aimY: 0,
            archetype: w.archetype,
            comboStep: 1,
            pogoDown: false,
            progress: 0,
            duration: w.archetype === 'greatsword' ? 0.45 : 0.28,
            reachX: w.reachX,
            reachY: w.reachY,
            color: w.color,
            glowColor: w.glowColor,
          };
        } else if (this.selectedEquipSlot === 'spirit') {
          this.engine.equipFamiliar(id as FamiliarId);
        } else if (this.selectedEquipSlot === 'sub') {
          s.equippedSubWeapon = id as SubWeaponId;
          AudioFX.playHit(false);
        } else if (this.selectedEquipSlot === 'armor') {
          s.equippedArmor = id;
          this.engine.recalcStats(false);
          AudioFX.playHit(false);
        } else if (this.selectedEquipSlot === 'accessory') {
          s.equippedAccessory = id;
          this.engine.recalcStats(false);
          AudioFX.playHit(false);
        } else if (this.selectedEquipSlot === 'core') {
          s.equippedYaoCore = id;
          this.engine.recalcStats(false);
          AudioFX.playRelicBell();
        } else if (this.selectedEquipSlot === 'potion') {
          this.engine.useConsumable(id);
        }
        this.previewItemId = id;
        this.renderArsenalModal();
      };
    });
  }

  private bindSettingsEvents(overlay: HTMLElement): void {
    const s = this.engine.slot!;
    overlay.querySelector('#set-bgm-mute')?.addEventListener('click', () => {
      const m = AudioFX.getMuteState();
      AudioFX.setMute(m.sfxMuted, !m.bgmMuted);
      SaveManager.saveMeta({ bgmMuted: !m.bgmMuted });
      this.renderArsenalModal();
    });
    overlay.querySelector('#set-sfx-mute')?.addEventListener('click', () => {
      const m = AudioFX.getMuteState();
      AudioFX.setMute(!m.sfxMuted, m.bgmMuted);
      SaveManager.saveMeta({ sfxMuted: !m.sfxMuted });
      this.renderArsenalModal();
    });
    overlay.querySelector('#set-fullscreen')?.addEventListener('click', () => {
      NativeApp.requestFullscreenAndLandscape();
    });
    overlay.querySelector('#set-pad-style')?.addEventListener('click', () => {
      const next = this.engine.input.controlStyle === 'joystick' ? 'dpad' : 'joystick';
      this.engine.input.controlStyle = next;
      SaveManager.saveMeta({ controlStyle: next });
      AudioFX.playHit(false);
      this.renderArsenalModal();
    });
    overlay.querySelector('#set-pad-scale')?.addEventListener('click', () => {
      const cur = this.engine.input.padScale || 1.0;
      const nextScale = cur < 0.95 ? 1.0 : cur < 1.08 ? 1.15 : 0.86;
      this.engine.input.padScale = nextScale;
      this.engine.input.layoutVirtualControls(window.innerWidth, window.innerHeight);
      SaveManager.saveMeta({ padScale: nextScale });
      AudioFX.playHit(false);
      this.renderArsenalModal();
    });
    overlay.querySelector('#dev-grant-pack')?.addEventListener('click', () => {
      for (const id of [
        'sword_1',
        'sword_frost',
        'sword_phantom',
        'greatsword_1',
        'greatsword_sunder',
        'spear_thunder',
        'daggers_poison',
        'whip_2',
      ]) {
        if (!s.ownedWeapons.includes(id)) s.ownedWeapons.push(id);
      }
      for (const aid of [
        'black_tortoise_mail',
        'martial_tiger_cuirass',
        'sunken_pearl_robe',
        'nether_dragon_armor',
        'mojin_talisman',
        'greedy_wolf_jade',
        'colosseum_war_drum',
        'abyss_soul_lantern',
        'outer_sea_compass',
      ]) {
        if (!s.ownedArmors.includes(aid)) s.ownedArmors.push(aid);
      }
      s.consumables.tiger_bone_wine = Math.max(2, s.consumables.tiger_bone_wine || 0);
      s.consumables.jiuzhuan_jin_dan = Math.max(1, s.consumables.jiuzhuan_jin_dan || 0);
      for (const ab of [
        'familiar_sword',
        'familiar_phoenix',
        'familiar_tortoise',
        'familiar_kestrel',
        'familiar_fox',
        'double_jump',
        'mist_dash',
        'wall_jump',
        'grapple_hook',
        'ground_slam',
        'mirror_truth',
        'jade_pendant_full',
      ] as const) {
        if (!s.abilities.includes(ab)) s.abilities.push(ab);
      }
      s.ownedSubWeapons = [
        'dagger_throw',
        'holy_fire',
        'bagua_cross',
        'mountain_seal',
        'sword_orbit',
      ];
      s.talismanHearts = 80;
      s.invertedUnlocked = true;
      this.engine.recalcStats(true);
      AudioFX.playRelicBell();
      this.pauseTab = 'equip';
      this.renderArsenalModal();
    });
    overlay.querySelector('#dev-reveal-map')?.addEventListener('click', () => {
      for (const realm of ['normal', 'inverted'] as const) {
        for (const rm of WorldMap.getAllRooms(realm)) {
          const rk = `${realm}:${rm.id}`;
          if (!s.visitedRooms.includes(rk)) s.visitedRooms.push(rk);
          for (let dy = 0; dy < rm.gridH; dy++) {
            for (let dx = 0; dx < rm.gridW; dx++) {
              const ck = `cell:${realm}:${rm.mapX + dx},${rm.mapY + dy}`;
              if (!s.visitedRooms.includes(ck)) s.visitedRooms.push(ck);
            }
          }
        }
      }
      s.invertedUnlocked = true;
      AudioFX.playRelicBell();
      this.pauseTab = 'map';
      this.renderArsenalModal();
    });
    overlay.querySelector('#btn-quit-title')?.addEventListener('click', () => {
      SaveManager.saveSlot(s);
      this.showTitleScreen();
    });
  }

  public openInteractModal(kind: 'smith' | 'merchant' | 'warp'): void {
    const s = this.engine.slot;
    if (!s) return;

    this.closeModal();
    const overlay = document.createElement('div');
    overlay.className = 'zx-arsenal-overlay';
    this.modalEl = overlay;
    this.uiLayer.appendChild(overlay);
    this.syncBlockState();

    const isTouch = this.engine.input.usingTouch || NativeApp.isMobileOrTablet();
    const compact = window.innerHeight < 540 || window.innerWidth < 900;

    if (kind === 'warp') {
      const allStops = this.engine.getUnlockedWarpStops();
      let viewRealm: CastleRealm = this.engine.room?.realm || 'normal';
      const curRoomId = this.engine.room?.id || '';
      const curRealm = this.engine.room?.realm || 'normal';

      const getRealmStops = () => allStops.filter((st) => st.realm === viewRealm);

      let selectedStop =
        allStops.find((st) => st.realm === viewRealm && st.roomId !== curRoomId) ||
        allStops.find((st) => !(st.realm === curRealm && st.roomId === curRoomId)) ||
        allStops[0] ||
        null;
      if (selectedStop && selectedStop.realm !== viewRealm) {
        viewRealm = selectedStop.realm;
      }
      let hoveredRoomId: string | null = null;
      // 初始画面保持地图纯净无文字，玩家点到哪座阵眼或殿宇，才弹出哪里的悬浮文字！
      let warpInspectedRoomId: string | null = null;

      const realmSwitchHtml = s.invertedUnlocked
        ? `<div style="display:flex;gap:6px;">
             <button class="zx-seal-btn" id="btn-warp-realm-normal">阳表玄城</button>
             <button class="zx-seal-btn" id="btn-warp-realm-inverted">倒悬里城</button>
           </div>`
        : '';

      overlay.innerHTML = `
        <div class="zx-arsenal-topbar">
          <span class="zx-modal-heading" style="color:var(--jade);">乾坤八卦阵 · 堪舆选点瞬移</span>
          <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
            ${realmSwitchHtml}
            <button class="zx-seal-btn" id="btn-close-npc" style="border-color:var(--bronze-light);color:var(--bronze-light);">${isTouch ? '✕ 返回' : '留在原处 [ESC]'}</button>
          </div>
        </div>
        <div class="zx-map-pane">
          <div class="zx-map-header">
            <span class="zx-map-title" id="warp-map-subtitle" style="font-size:13px;color:#e2e8f0;">
              点击地图发光【八卦阵眼】查看地名并选点，再点阵眼或右下瞬移即可跨区传送
            </span>
            <span style="font-size:12px;color:#5eead4;font-weight:800;">
              已点亮阵眼 ${allStops.length} 座
            </span>
          </div>
          <div class="zx-map-canvas-wrap">
            <canvas id="warp-castle-map-canvas" width="920" height="406" style="cursor:pointer;touch-action:none;"></canvas>
          </div>
        </div>
        <div class="zx-arsenal-footer" style="align-items:center;gap:10px;">
          <span class="zx-footer-desc" id="warp-target-desc" style="font-size:12.5px;color:#f8fafc;"></span>
          <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
            <button class="zx-seal-btn" id="btn-cancel-warp" style="padding:5px 14px;">
              返回原处
            </button>
            <button class="zx-seal-btn" id="btn-confirm-warp" style="border-color:#2dd4bf;color:#fef08a;background:rgba(15,118,110,0.55);font-weight:900;padding:5px 16px;">
              乾坤瞬移
            </button>
          </div>
        </div>
      `;

      const mapCanvas = overlay.querySelector('#warp-castle-map-canvas') as HTMLCanvasElement;
      const targetDescEl = overlay.querySelector('#warp-target-desc') as HTMLElement;
      const confirmBtn = overlay.querySelector('#btn-confirm-warp') as HTMLButtonElement;
      const cancelBtn = overlay.querySelector('#btn-cancel-warp') as HTMLButtonElement;
      const btnNorm = overlay.querySelector('#btn-warp-realm-normal') as HTMLButtonElement | null;
      const btnInv = overlay.querySelector('#btn-warp-realm-inverted') as HTMLButtonElement | null;

      const computeNodeScreenPoints = () => {
        const w = mapCanvas.width;
        const h = mapCanvas.height;
        const { cellW, cellH, ox, oy } = this.getBlueprintMetrics(w, h, viewRealm, 1, 0, 0);
        return getRealmStops().map((st) => ({
          stop: st,
          cx: ox + (st.mapX + st.gridW * 0.5) * cellW,
          cy: oy + (st.mapY + st.gridH * 0.5) * cellH,
          cellW,
          cellH,
        }));
      };

      const syncFooterAndRealmButtons = () => {
        if (btnNorm) {
          btnNorm.style.borderColor = viewRealm === 'normal' ? '#fde08a' : '';
          btnNorm.style.color = viewRealm === 'normal' ? '#fde047' : '';
        }
        if (btnInv) {
          btnInv.style.borderColor = viewRealm === 'inverted' ? '#f43f5e' : '';
          btnInv.style.color = viewRealm === 'inverted' ? '#fda4af' : '';
        }

        const otherStopCount = allStops.filter(
          (st) => !(st.realm === curRealm && st.roomId === curRoomId)
        ).length;

        if (!selectedStop || otherStopCount === 0) {
          const curName = selectedStop ? selectedStop.name : this.engine.room?.name || '当前阵眼';
          targetDescEl.innerHTML = `当前驻地：<strong style="color:#fde047;">${curName}</strong> · 探索玄城点亮更多八卦阵眼后即可跨区瞬移（轻点地图可查看地名）`;
          confirmBtn.style.display = 'none';
          return;
        }

        const isCurrent = selectedStop.realm === curRealm && selectedStop.roomId === curRoomId;
        if (isCurrent) {
          targetDescEl.innerHTML = `当前所在阵眼：<strong style="color:#fb923c;">${selectedStop.name}</strong>（${selectedStop.stageTitle}）· 请点击地图上其他青绿发光阵眼`;
          confirmBtn.style.display = 'none';
          return;
        }

        confirmBtn.style.display = '';
        confirmBtn.disabled = false;
        confirmBtn.style.opacity = '1';
        targetDescEl.innerHTML = `目标阵眼：<strong style="color:#5eead4;">【${selectedStop.stageTitle}】${selectedStop.name}</strong>`;
        confirmBtn.textContent = isTouch
          ? `瞬移至 · ${selectedStop.name}`
          : `乾坤瞬移 · ${selectedStop.name} [Enter]`;
      };

      const executeTeleportTo = (st: NonNullable<typeof selectedStop>) => {
        if (st.realm === curRealm && st.roomId === curRoomId) return;
        this.closeModal();
        this.engine.warpToRoom(st.realm, st.roomId);
      };

      let animId = 0;
      const startTs = performance.now();
      const renderWarpMapFrame = (now: number) => {
        const mctx = mapCanvas.getContext('2d');
        if (mctx) {
          const w = mapCanvas.width;
          const h = mapCanvas.height;
          const inspectedIsWarp = getRealmStops().some((st) => st.roomId === warpInspectedRoomId);
          this.drawCastlevaniaBlueprint(
            mctx,
            w,
            h,
            true,
            viewRealm,
            1,
            0,
            0,
            inspectedIsWarp ? null : warpInspectedRoomId
          );

          // 轻度压暗普通房间，凸显全城龙脉连线与发光八卦传送阵眼
          mctx.fillStyle = 'rgba(3, 6, 14, 0.28)';
          mctx.fillRect(0, 0, w, h);

          const pts = computeNodeScreenPoints();
          const t = (now - startTs) * 0.001;

          // 绘制已点亮八卦阵之间的青金龙脉星轨虚线
          if (pts.length > 1) {
            mctx.save();
            mctx.strokeStyle = 'rgba(45, 212, 191, 0.36)';
            mctx.lineWidth = 1.6;
            mctx.setLineDash([6, 5]);
            mctx.lineDashOffset = -t * 18;
            mctx.beginPath();
            pts.forEach((p, idx) => {
              if (idx === 0) mctx.moveTo(p.cx, p.cy);
              else mctx.lineTo(p.cx, p.cy);
            });
            mctx.stroke();
            mctx.restore();
          }

          // 绘制每一座可点击的八卦阵眼星标（平时无文字遮挡，仅在点击选中时浮现阵名路牌！）
          let calloutTarget: {
            cx: number;
            cy: number;
            outerR: number;
            line1: string;
            line2: string;
            accent: string;
          } | null = null;

          for (const p of pts) {
            const isCur = p.stop.realm === curRealm && p.stop.roomId === curRoomId;
            const isSel =
              selectedStop?.realm === p.stop.realm && selectedStop?.roomId === p.stop.roomId;
            const isHov = hoveredRoomId === p.stop.roomId;
            const pulse = Math.sin(t * 4.2 + p.cx * 0.03) * 2.2;
            const outerR = (isSel ? 15 : 12) + pulse;

            mctx.save();
            const glow = mctx.createRadialGradient(p.cx, p.cy, 2, p.cx, p.cy, outerR + 11);
            if (isSel) {
              glow.addColorStop(0, 'rgba(254, 240, 138, 0.92)');
              glow.addColorStop(0.5, 'rgba(45, 212, 191, 0.48)');
              glow.addColorStop(1, 'rgba(45, 212, 191, 0)');
            } else if (isCur) {
              glow.addColorStop(0, 'rgba(251, 146, 60, 0.85)');
              glow.addColorStop(1, 'rgba(251, 146, 60, 0)');
            } else {
              glow.addColorStop(0, 'rgba(52, 211, 153, 0.82)');
              glow.addColorStop(1, 'rgba(16, 185, 129, 0)');
            }
            mctx.fillStyle = glow;
            mctx.beginPath();
            mctx.arc(p.cx, p.cy, outerR + 11, 0, Math.PI * 2);
            mctx.fill();

            // 旋转八卦阵环与选中准星
            mctx.translate(p.cx, p.cy);
            mctx.save();
            mctx.rotate(t * (isSel ? 1.5 : 0.7));
            mctx.strokeStyle = isSel ? '#fef08a' : isCur ? '#fdba74' : '#5eead4';
            mctx.lineWidth = isSel || isHov ? 2.4 : 1.7;
            mctx.beginPath();
            for (let i = 0; i < 8; i++) {
              const ang = (i * Math.PI) / 4;
              const rx = Math.cos(ang) * outerR;
              const ry = Math.sin(ang) * outerR;
              if (i === 0) mctx.moveTo(rx, ry);
              else mctx.lineTo(rx, ry);
            }
            mctx.closePath();
            mctx.stroke();
            mctx.restore();

            if (isSel) {
              const br = outerR + 5;
              mctx.strokeStyle = '#fde047';
              mctx.lineWidth = 2;
              for (const [sx, sy] of [
                [-1, -1],
                [1, -1],
                [1, 1],
                [-1, 1],
              ]) {
                mctx.beginPath();
                mctx.moveTo(sx * br, sy * (br - 5));
                mctx.lineTo(sx * br, sy * br);
                mctx.lineTo(sx * (br - 5), sy * br);
                mctx.stroke();
              }
            }

            // 中心阵眼宝珠
            mctx.fillStyle = isSel ? '#fef08a' : isCur ? '#fb923c' : '#2dd4bf';
            mctx.beginPath();
            mctx.arc(0, 0, isSel ? 5 : 4, 0, Math.PI * 2);
            mctx.fill();
            mctx.restore();

            if (warpInspectedRoomId === p.stop.roomId) {
              calloutTarget = {
                cx: p.cx,
                cy: p.cy,
                outerR,
                line1: isCur ? `★ ${p.stop.name} · 【当前阵眼】` : `✦ ${p.stop.name}`,
                line2: isCur
                  ? `${p.stop.stageTitle} · 你正身处此乾坤阵中`
                  : `${p.stop.stageTitle} · 再次点击阵眼或右下按钮立即传送`,
                accent: isCur ? '#fb923c' : '#5eead4',
              };
            }
          }

          if (calloutTarget) {
            this.drawFloatingRoomCallout(
              mctx,
              w,
              h,
              calloutTarget.cx,
              calloutTarget.cy - calloutTarget.outerR,
              calloutTarget.cy + calloutTarget.outerR,
              calloutTarget.line1,
              calloutTarget.line2,
              calloutTarget.accent
            );
          } else if (warpInspectedRoomId && !inspectedIsWarp) {
            // 普通房间高亮已在 drawCastlevaniaBlueprint 中绘出，此处重绘最顶层清晰文字框以免被压暗层减弱对比度
            const { cellW, cellH, ox, oy } = this.getBlueprintMetrics(w, h, viewRealm, 1, 0, 0);
            const targetRm = WorldMap.getAllRooms(viewRealm).find(
              (r) => r.id === warpInspectedRoomId
            );
            if (targetRm) {
              const irx = ox + targetRm.mapX * cellW + 0.5;
              const iry = oy + targetRm.mapY * cellH + 0.5;
              const irw = targetRm.gridW * cellW - 1;
              const irh = targetRm.gridH * cellH - 1;
              const meta = this.describeInspectedRoom(targetRm);
              this.drawFloatingRoomCallout(
                mctx,
                w,
                h,
                irx + irw * 0.5,
                iry,
                iry + irh,
                `${meta.title}${meta.badge ? ` · 【${meta.badge}】` : ''}`,
                `${meta.stage}（非传送阵眼 · 请点击发光八卦环瞬移）`,
                '#fde047'
              );
            }
          }
        }
        animId = window.requestAnimationFrame(renderWarpMapFrame);
      };

      const pickStopAtClientPos = (clientX: number, clientY: number) => {
        const rect = mapCanvas.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return null;
        const mx = ((clientX - rect.left) / rect.width) * mapCanvas.width;
        const my = ((clientY - rect.top) / rect.height) * mapCanvas.height;
        const pts = computeNodeScreenPoints();
        let best: (typeof pts)[number] | null = null;
        let bestDist = 34;
        for (const p of pts) {
          const d = Math.hypot(mx - p.cx, my - p.cy);
          if (d < bestDist) {
            bestDist = d;
            best = p;
          }
        }
        return best?.stop || null;
      };

      mapCanvas.addEventListener('pointermove', (ev) => {
        if (ev.pointerType === 'mouse') {
          const hit = pickStopAtClientPos(ev.clientX, ev.clientY);
          hoveredRoomId = hit ? hit.roomId : null;
          mapCanvas.style.cursor = hit ? 'pointer' : 'default';
        }
      });

      let tapDownX = 0;
      let tapDownY = 0;
      let tapActive = false;
      mapCanvas.addEventListener('pointerdown', (ev) => {
        tapDownX = ev.clientX;
        tapDownY = ev.clientY;
        tapActive = true;
      });
      mapCanvas.addEventListener('pointerup', (ev) => {
        if (!tapActive) return;
        tapActive = false;
        if (Math.hypot(ev.clientX - tapDownX, ev.clientY - tapDownY) > 20) return;

        const hitStop = pickStopAtClientPos(ev.clientX, ev.clientY);
        if (hitStop) {
          const wasInspectedAndSelected =
            selectedStop?.realm === hitStop.realm &&
            selectedStop?.roomId === hitStop.roomId &&
            warpInspectedRoomId === hitStop.roomId;
          selectedStop = hitStop;
          warpInspectedRoomId = hitStop.roomId;
          syncFooterAndRealmButtons();
          AudioFX.playRelicBell();
          if (
            wasInspectedAndSelected &&
            !(hitStop.realm === curRealm && hitStop.roomId === curRoomId)
          ) {
            executeTeleportTo(hitStop);
          }
          return;
        }

        // 点击普通已探明房间：同样按需浮现该房间地名与详情，点空白处收起文字！
        const hitRoom = this.hitTestVisitedRoomOnCanvas(
          mapCanvas,
          ev.clientX,
          ev.clientY,
          viewRealm,
          1,
          0,
          0
        );
        if (hitRoom) {
          warpInspectedRoomId = warpInspectedRoomId === hitRoom.id ? null : hitRoom.id;
          AudioFX.playHit(false);
          if (warpInspectedRoomId) {
            const meta = this.describeInspectedRoom(hitRoom);
            targetDescEl.innerHTML = `【${meta.stage}】<strong style="color:#fde047;">${meta.title}</strong> — ${meta.detail}`;
          } else {
            syncFooterAndRealmButtons();
          }
        } else {
          warpInspectedRoomId = null;
          syncFooterAndRealmButtons();
        }
      });

      mapCanvas.addEventListener(
        'touchend',
        (ev) => {
          if (ev.cancelable) ev.preventDefault();
        },
        { passive: false }
      );

      this.bindFastTap(confirmBtn, () => {
        if (selectedStop) executeTeleportTo(selectedStop);
      });
      this.bindFastTap(cancelBtn, () => this.closeModal());
      this.bindFastTap(overlay.querySelector('#btn-close-npc'), () => this.closeModal());

      this.bindFastTap(btnNorm, () => {
        viewRealm = 'normal';
        warpInspectedRoomId = null;
        const rStops = getRealmStops();
        selectedStop =
          rStops.find((st) => !(st.realm === curRealm && st.roomId === curRoomId)) ||
          rStops[0] ||
          null;
        syncFooterAndRealmButtons();
      });
      this.bindFastTap(btnInv, () => {
        viewRealm = 'inverted';
        warpInspectedRoomId = null;
        const rStops = getRealmStops();
        selectedStop =
          rStops.find((st) => !(st.realm === curRealm && st.roomId === curRoomId)) ||
          rStops[0] ||
          null;
        syncFooterAndRealmButtons();
      });

      const onWarpKeyDown = (ev: KeyboardEvent) => {
        const rStops = getRealmStops();
        if (ev.code === 'Escape') {
          ev.preventDefault();
          this.closeModal();
          return;
        }
        if (rStops.length === 0) return;
        if (
          ev.code === 'ArrowLeft' ||
          ev.code === 'ArrowUp' ||
          ev.code === 'KeyA' ||
          ev.code === 'KeyW'
        ) {
          ev.preventDefault();
          const idx = Math.max(
            0,
            rStops.findIndex((st) => st.roomId === selectedStop?.roomId)
          );
          selectedStop = rStops[(idx - 1 + rStops.length) % rStops.length];
          warpInspectedRoomId = selectedStop.roomId;
          AudioFX.playRelicBell();
          syncFooterAndRealmButtons();
        } else if (
          ev.code === 'ArrowRight' ||
          ev.code === 'ArrowDown' ||
          ev.code === 'KeyD' ||
          ev.code === 'KeyS'
        ) {
          ev.preventDefault();
          const idx = Math.max(
            0,
            rStops.findIndex((st) => st.roomId === selectedStop?.roomId)
          );
          selectedStop = rStops[(idx + 1) % rStops.length];
          warpInspectedRoomId = selectedStop.roomId;
          AudioFX.playRelicBell();
          syncFooterAndRealmButtons();
        } else if (ev.code === 'Enter' || ev.code === 'Space' || ev.code === 'KeyJ') {
          ev.preventDefault();
          if (selectedStop) executeTeleportTo(selectedStop);
        }
      };
      window.addEventListener('keydown', onWarpKeyDown);

      this.warpModalCleanup = () => {
        window.cancelAnimationFrame(animId);
        window.removeEventListener('keydown', onWarpKeyDown);
      };

      syncFooterAndRealmButtons();
      animId = window.requestAnimationFrame(renderWarpMapFrame);
      return;
    }

    const renderShopOrSmith = () => {
      if (kind === 'smith') {
        const masterworks = Object.values(WEAPONS).filter((w) => w.smithExclusive);
        const rows = masterworks
          .map((w) => {
            const owned = s.ownedWeapons.includes(w.id);
            const forgeCost = w.price || 580;
            return `
              <div class="zx-item-row" style="cursor:default;flex-wrap:wrap;gap:10px;">
                <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:210px;">
                  <div class="zx-shop-icon-slot">${getWeaponArtHtml(w.archetype, 52, w.id)}</div>
                  <div>
                    <div style="font-size:15px;font-weight:900;color:var(--rice);">${w.name}</div>
                    <div style="font-size:11.5px;color:#fbbf24;">杀伤 +${w.atk}${w.critBonus ? ` · 暴击 +${Math.round(w.critBonus * 100)}%` : ''}</div>
                    <div style="font-size:11.5px;color:var(--ash);margin-top:2px;">${w.desc}</div>
                  </div>
                </div>
                <div style="display:flex;gap:8px;align-items:center;">
                  ${
                    owned
                      ? `<span class="zx-eq-seal">已铸入囊</span>`
                      : `<button class="zx-seal-btn" data-forge-id="${w.id}" style="padding:6px 12px;font-size:12.5px;border-color:#fb923c;color:#fde68a;">
                           开炉秘铸 (${forgeCost}银)
                         </button>`
                  }
                </div>
              </div>`;
          })
          .join('');

        overlay.innerHTML = `
          <div class="zx-arsenal-topbar">
            <span class="zx-modal-heading" style="color:#fb923c;">赤火名剑炉 · 欧冶残独门秘铸</span>
            <div style="display:flex;align-items:center;gap:12px;flex-shrink:0;">
              <span style="color:#fde68a;font-weight:800;font-size:13px;">纹银 ${s.gold}</span>
              <button class="zx-seal-btn" id="btn-close-npc">${isTouch ? '告辞' : '收剑告辞 [ESC]'}</button>
            </div>
          </div>
          <div class="zx-npc-modal-body">
            <div class="zx-stage-col zx-npc-side-col">
              <div style="font-size:12.5px;color:#cbd5e1;line-height:1.55;padding:4px 4px 10px;">
                “凡世神兵一器一魂，从无千篇一律的回炉加点！老夫毕生仅存四卷名器孤本，你若凑足纹银，老夫便为你开炉铸出一世孤品！”
              </div>
              ${getSpeakerPortraitSvg('欧冶残', 235)}
            </div>
            <div class="zx-item-list">${rows}</div>
          </div>
        `;

        overlay.querySelectorAll<HTMLElement>('[data-forge-id]').forEach((el) => {
          el.onclick = () => {
            const wid = el.dataset.forgeId!;
            const w = WEAPONS[wid];
            const forgeCost = w?.price || 580;
            if (!w || s.ownedWeapons.includes(wid) || s.gold < forgeCost) {
              AudioFX.playHurt();
              return;
            }
            s.gold -= forgeCost;
            s.ownedWeapons.push(wid);
            s.equippedWeapon = wid;
            this.engine.recalcStats(false);
            AudioFX.playRelicBell();
            renderShopOrSmith();
          };
        });
      } else {
        const goods: {
          id: string;
          kind: 'pot' | 'sub' | 'heart' | 'wpn' | 'arm';
          name: string;
          desc: string;
          price: number;
          icon: string;
        }[] = [
          {
            id: 'jinchuang_yao',
            kind: 'pot',
            name: '金疮止血散',
            desc: '立复 65 点气血（行囊常备救命药）',
            price: 28,
            icon: getSlotCategorySvg('potion', 'jinchuang_yao'),
          },
          {
            id: 'huiqi_dan',
            kind: 'pot',
            name: '紫阳回气丹',
            desc: '立复 55 点真气（手搓剑诀必备）',
            price: 32,
            icon: getSlotCategorySvg('potion', 'huiqi_dan'),
          },
          {
            id: 'beggar_chicken',
            kind: 'pot',
            name: '荷叶叫花鸡',
            desc: '大幅恢复 150 点气血与 25 点真气',
            price: 68,
            icon: getSlotCategorySvg('potion', 'beggar_chicken'),
          },
          {
            id: 'tiger_bone_wine',
            kind: 'pot',
            name: '秘酿 · 虎骨烧刀子烈酒',
            desc: '30 秒内杀伐攻击暴涨 +28%（决战妖王利器）',
            price: 76,
            icon: getSlotCategorySvg('potion', 'osmanthus_wine'),
          },
          {
            id: 'jingang_dan',
            kind: 'pot',
            name: '佛门 · 少林小还金刚丹',
            desc: '恢复 45 气血，且 35 秒内所受伤害降低 38%',
            price: 82,
            icon: getSlotCategorySvg('potion', 'jinchuang_yao'),
          },
          {
            id: 'shenxing_san',
            kind: 'pot',
            name: '奇药 · 凌波疾风散',
            desc: '恢复 35 真气，且 30 秒内暴击 +20%、移速 +14%',
            price: 78,
            icon: getSlotCategorySvg('potion', 'huiqi_dan'),
          },
          {
            id: 'hearts_10',
            kind: 'heart',
            name: '朱砂灵符 ×10',
            desc: '补充奇门副器催动灵符',
            price: 24,
            icon: getSubWeaponSvg('dagger_throw'),
          },
          {
            id: 'daggers_1',
            kind: 'wpn',
            name: '短兵 · 生铁双短匕',
            desc: '零前摇极速双匕连刺 · 绕背必定暴击',
            price: 185,
            icon: getWeaponArtHtml('daggers', 44, 'daggers_1'),
          },
          {
            id: 'whip_1',
            kind: 'wpn',
            name: '软鞭 · 生铁九节鞭',
            desc: '军中九节铁链鞭 · 八向远距抽击控场',
            price: 220,
            icon: getWeaponArtHtml('whip', 44, 'whip_1'),
          },
          {
            id: 'sword_1',
            kind: 'wpn',
            name: '轻剑 · 巡防百炼钢剑',
            desc: '城防百炼精钢佩剑 · 锋利轻捷',
            price: 210,
            icon: getWeaponArtHtml('sword', 44, 'sword_1'),
          },
          {
            id: 'iron_lamellar',
            kind: 'arm',
            name: '军甲 · 边军铁札甲',
            desc: '护体 +16 · 气血 +42 · 臂力 +4',
            price: 420,
            icon: getSlotCategorySvg('armor'),
          },
          {
            id: 'holy_fire',
            kind: 'sub',
            name: '奇门 · 三昧净火符',
            desc: '抛投落地燃起三道持续灼烧朱砂火柱',
            price: 75,
            icon: getSubWeaponSvg('holy_fire'),
          },
          {
            id: 'bagua_cross',
            kind: 'sub',
            name: '奇门 · 乾坤八卦盘',
            desc: '破空飞旋后折返横贯全屏斩杀群妖',
            price: 90,
            icon: getSubWeaponSvg('bagua_cross'),
          },
        ];

        const rows = goods
          .map((g) => {
            const owned =
              (g.kind === 'sub' && s.ownedSubWeapons.includes(g.id as SubWeaponId)) ||
              (g.kind === 'wpn' && s.ownedWeapons.includes(g.id)) ||
              (g.kind === 'arm' && s.ownedArmors.includes(g.id));
            return `
              <div class="zx-item-row" data-buy-id="${g.id}" data-buy-kind="${g.kind}" data-buy-price="${g.price}">
                <div style="display:flex;align-items:center;gap:12px;min-width:0;">
                  <div class="zx-shop-icon-slot">${g.icon}</div>
                  <div style="min-width:0;">
                    <div style="font-size:15px;font-weight:900;color:var(--rice);">${g.name}</div>
                    <div style="font-size:12px;color:var(--ash);">${g.desc}</div>
                  </div>
                </div>
                <span class="zx-eq-seal" style="background:${owned ? '#115e59' : s.gold >= g.price ? '#881313' : '#1e293b'};">
                  ${owned ? '已收入囊中' : `${g.price} 文银`}
                </span>
              </div>`;
          })
          .join('');

        overlay.innerHTML = `
          <div class="zx-arsenal-topbar">
            <span class="zx-modal-heading" style="color:var(--jade);">子夜鬼市 · 白掌柜</span>
            <div style="display:flex;align-items:center;gap:12px;flex-shrink:0;">
              <span style="color:#fde68a;font-weight:800;font-size:13px;">纹银 ${s.gold}</span>
              <button class="zx-seal-btn" id="btn-close-npc">${isTouch ? '离开' : '收囊离开 [ESC]'}</button>
            </div>
          </div>
          <div class="zx-npc-modal-body">
            <div class="zx-stage-col zx-npc-side-col">
              <div style="font-size:12.5px;color:#cbd5e1;line-height:1.55;padding:4px 4px 10px;">
                “青灯引路，无论是峨眉双刺、九节雷鞭还是救命灵丹，纹银管够皆可拿去。”
              </div>
              ${getSpeakerPortraitSvg('白掌柜', 235)}
            </div>
            <div class="zx-item-list">${rows}</div>
          </div>
        `;

        overlay.querySelectorAll<HTMLElement>('[data-buy-id]').forEach((el) => {
          el.onclick = () => {
            const id = el.dataset.buyId!;
            const bKind = el.dataset.buyKind as 'pot' | 'sub' | 'heart' | 'wpn' | 'arm';
            const price = Number(el.dataset.buyPrice || 30);
            if (bKind === 'sub' && s.ownedSubWeapons.includes(id as SubWeaponId)) {
              s.equippedSubWeapon = id as SubWeaponId;
              AudioFX.playHit(false);
              renderShopOrSmith();
              return;
            }
            if (bKind === 'wpn' && s.ownedWeapons.includes(id)) {
              s.equippedWeapon = id;
              this.engine.recalcStats(false);
              AudioFX.playHit(false);
              renderShopOrSmith();
              return;
            }
            if (bKind === 'arm' && s.ownedArmors.includes(id)) {
              s.equippedArmor = id;
              this.engine.recalcStats(false);
              AudioFX.playHit(false);
              renderShopOrSmith();
              return;
            }
            if (s.gold < price) {
              AudioFX.playHurt();
              return;
            }
            s.gold -= price;
            if (bKind === 'pot') {
              s.consumables[id] = (s.consumables[id] || 0) + 1;
            } else if (bKind === 'sub') {
              s.ownedSubWeapons.push(id as SubWeaponId);
              s.equippedSubWeapon = id as SubWeaponId;
            } else if (bKind === 'wpn') {
              s.ownedWeapons.push(id);
              s.equippedWeapon = id;
              this.engine.recalcStats(false);
            } else if (bKind === 'arm') {
              s.ownedArmors.push(id);
              s.equippedArmor = id;
              this.engine.recalcStats(false);
            } else {
              s.talismanHearts = Math.min(99, s.talismanHearts + 10);
            }
            AudioFX.playRelicBell();
            renderShopOrSmith();
          };
        });
      }

      this.bindFastTap(overlay.querySelector('#btn-close-npc'), () => this.closeModal());
    };

    renderShopOrSmith();
  }

  public closeModal(): void {
    this.stopStageLoop();
    if (this.warpModalCleanup) {
      this.warpModalCleanup();
      this.warpModalCleanup = null;
    }
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
      this.modalClosedAt = performance.now();
    }
    this.syncBlockState();
  }

  public startStoryDialogue(scene: StoryScene, onDone?: () => void): void {
    this.clearDialogueKeyHandler();
    if (this.dialogueEl) this.dialogueEl.remove();
    let idx = 0;

    // 实景剧情对白：绝不黑屏遮挡背景，自动隐藏顶部 HUD 让背后的宫阙火光与人物完整呈现！
    this.engine.storyDialogueActive = true;
    if (this.hudEl) this.hudEl.style.opacity = '0';

    const backdrop = document.createElement('div');
    backdrop.className = 'cv-dialogue-backdrop';
    const box = document.createElement('div');
    box.className = 'cv-dialogue';
    backdrop.appendChild(box);
    this.uiLayer.appendChild(backdrop);
    this.dialogueEl = backdrop;
    this.syncBlockState();

    const finishDialogue = () => {
      this.clearDialogueKeyHandler();
      backdrop.remove();
      this.dialogueEl = null;
      this.engine.storyDialogueActive = false;
      if (this.hudEl) this.hudEl.style.opacity = '';
      this.modalClosedAt = performance.now();
      this.syncBlockState();
      onDone?.();
    };

    const advanceLine = () => {
      AudioFX.playHit(false);
      idx++;
      if (idx < scene.lines.length) {
        renderLine();
      } else {
        finishDialogue();
      }
    };

    const renderLine = () => {
      const ln = scene.lines[idx];
      const isHero = ln.speaker.includes('李逸承');
      const portraitH = window.innerHeight < 540 ? 138 : 210;
      box.classList.toggle('npc-right', !isHero);
      box.innerHTML = `
        <div class="cv-dlg-bust-slot">${getSpeakerPortraitSvg(ln.speaker, portraitH)}</div>
        <div class="cv-dlg-content">
          <div class="dialogue-speaker-row">
            <div>
              <span class="dialogue-speaker" style="color:${ln.portraitColor}">${ln.speaker}</span>
              <span class="dialogue-role">${ln.role}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              ${
                scene.lines.length > 1
                  ? `<span style="font-size:11px;color:var(--ash);">${idx + 1}/${scene.lines.length}</span>
                     <button type="button" class="zx-dlg-skip" id="btn-dlg-skip">跳过</button>`
                  : ''
              }
            </div>
          </div>
          <div class="dialogue-text">${ln.text}</div>
          <div class="dialogue-next">轻触或按【斩】继续 ▸</div>
        </div>
      `;
      box.querySelector('#btn-dlg-skip')?.addEventListener('click', (ev) => {
        ev.stopPropagation();
        AudioFX.playHit(false);
        finishDialogue();
      });
    };

    renderLine();

    backdrop.addEventListener('click', () => advanceLine());

    this.dialogueKeyHandler = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (
        e.code === 'KeyJ' ||
        e.code === 'KeyZ' ||
        e.code === 'KeyK' ||
        e.code === 'Space' ||
        e.code === 'Enter' ||
        e.code === 'KeyE'
      ) {
        e.preventDefault();
        advanceLine();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        finishDialogue();
      }
    };
    window.addEventListener('keydown', this.dialogueKeyHandler);
  }

  public showBanner(title: string, sub: string): void {
    if (this.bannerEl) this.bannerEl.remove();
    const el = document.createElement('div');
    el.className = 'center-banner';
    el.innerHTML = sub ? `<h3>${title}</h3><p>${sub}</p>` : `<h3>${title}</h3>`;
    this.uiLayer.appendChild(el);
    this.bannerEl = el;
    window.setTimeout(() => {
      if (this.bannerEl === el) {
        el.remove();
        this.bannerEl = null;
      }
    }, 1700);
  }

  public showGameOverModal(): void {
    this.closeModal();
    const overlay = document.createElement('div');
    overlay.className = 'zx-arsenal-overlay';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.innerHTML = `
      <div style="text-align:center;max-width:440px;display:flex;flex-direction:column;gap:16px;">
        <div style="font-size:36px;font-weight:900;letter-spacing:8px;color:#ef4444;">力 竭 剑 折</div>
        <p style="color:#cbd5e1;line-height:1.7;">剑折青石，幸得胸前玄鸟残佩护住了最后一缕心脉。</p>
        <div style="display:flex;gap:12px;justify-content:center;">
          <button class="zx-seal-btn" id="btn-revive-shrine" style="border-color:var(--bronze-light);color:var(--bronze-light);">重返玄城再战</button>
          <button class="zx-seal-btn" id="btn-gameover-title">退回标题画卷</button>
        </div>
      </div>
    `;
    this.uiLayer.appendChild(overlay);
    this.modalEl = overlay;
    this.syncBlockState();

    overlay.querySelector('#btn-revive-shrine')?.addEventListener('click', () => {
      const s = this.engine.slot;
      if (!s) return;
      this.closeModal();
      const saved = SaveManager.getSlot(s.slotIndex) || s;
      this.engine.startSession(saved);
    });
    overlay.querySelector('#btn-gameover-title')?.addEventListener('click', () => {
      this.showTitleScreen();
    });
  }

  public showEndingModal(kind: 'normal' | 'true' | 'boss_rush', timeSec: number): void {
    this.closeModal();
    const s = this.engine.slot;
    const pct = s ? WorldMap.calcExplorationPct(s.visitedRooms) : 100;
    const mins = Math.floor(timeSec / 60);
    const secs = timeSec % 60;
    const timeStr = `${mins}分${secs < 10 ? '0' : ''}${secs}秒`;

    const overlay = document.createElement('div');
    overlay.className = 'zx-arsenal-overlay';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    const title =
      kind === 'true'
        ? '真 结 局 · 破 晓 斩 冥'
        : kind === 'boss_rush'
          ? '百 鬼 试 炼 · 踏 破 镇 妖 塔'
          : '结 局 一 · 折 剑 归 尘';
    const desc =
      kind === 'true'
        ? `孤剑破九幽，太古尸仙烛阴伏诛，血月终散！<br/>双城探索度：<strong style="color:#fde047;">${pct}% / 200%+</strong> · 历时：<strong>${timeStr}</strong><br/><span style="color:#2dd4bf;">已永久解锁标题画面【少统领传·萧断水】与【百鬼试炼·镇妖塔】！</span>`
        : kind === 'boss_rush'
          ? `七大妖王与宿敌尽败于枪剑之下！通关用时：<strong style="color:#fde047;">${timeStr}</strong>`
          : `未能识破恩师眉心的九幽蚀心蛊，里城真凶尚未授首……<br/>提示：自寒潭水脉深处【玄鸟秘宝冢】习得【缩地化雾】并取【玄鸟合璧佩】，再登东垣望月竖塔顶层穿紫瘴入【天机秘阁】寻得【破妄古镜】，重登凌霄祭天坛即可开启 <strong>180° 九幽倒悬里城</strong>！`;

    overlay.innerHTML = `
      <div style="text-align:center;max-width:560px;display:flex;flex-direction:column;gap:18px;padding:24px;">
        <div style="font-size:32px;font-weight:900;letter-spacing:6px;color:${kind === 'normal' ? '#fca5a5' : 'var(--bronze-light)'};">${title}</div>
        <p style="color:#e2e8f0;line-height:1.85;font-size:14.5px;">${desc}</p>
        <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;">
          ${
            kind === 'normal' && s
              ? `<button class="zx-seal-btn" id="btn-resume-altar" style="border-color:#2dd4bf;color:#5eead4;">折返观星古祠 · 寻齐双信物改写命数</button>`
              : ''
          }
          <button class="zx-seal-btn" id="btn-ending-title" style="border-color:var(--bronze-light);color:var(--bronze-light);">返回标题画卷</button>
        </div>
      </div>
    `;

    this.uiLayer.appendChild(overlay);
    this.modalEl = overlay;
    this.syncBlockState();

    overlay.querySelector('#btn-resume-altar')?.addEventListener('click', () => {
      if (!s) return;
      this.closeModal();
      this.engine.recalcStats(true);
      this.engine.warpToRoom('normal', 'altar_save');
    });
    overlay.querySelector('#btn-ending-title')?.addEventListener('click', () => {
      this.showTitleScreen();
    });
  }
}
