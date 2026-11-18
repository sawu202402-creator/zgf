import { AudioFX } from '../audio/GuofengAudio';
import {
  ABILITIES_META,
  ARMORS,
  CONSUMABLES,
  SKILLS,
  SUB_WEAPONS,
  WEAPONS,
  YAO_CORES,
} from '../data/itemsAndSkills';
import { CHARACTER_BIOS } from '../data/storyAndNpcs';
import { BuiltRoom, REGION_NAMES, TILE_SIZE, WorldMap } from '../data/worldMap';
import { GameEngine } from '../game/GameEngine';
import { createFreshSaveSlot, SaveManager } from '../meta/SaveManager';
import { NativeApp } from '../platform/NativeAppBridge';
import { CastleRealm, GameMode, SkillId, StoryScene, SubWeaponId } from '../types';

export class UIManager {
  private hudEl: HTMLElement | null = null;
  private modalEl: HTMLElement | null = null;
  private dialogueEl: HTMLElement | null = null;
  private bannerEl: HTMLElement | null = null;
  private minimapCanvas: HTMLCanvasElement | null = null;
  private hudRefs: {
    heroName?: HTMLElement;
    lvBadge?: HTMLElement;
    hpFill?: HTMLElement;
    hpText?: HTMLElement;
    mpFill?: HTMLElement;
    mpText?: HTMLElement;
    weaponChip?: HTMLElement;
    subChip?: HTMLElement;
    goldChip?: HTMLElement;
    mapTitle?: HTMLElement;
    bossWrap?: HTMLElement;
    bossName?: HTMLElement;
    bossFill?: HTMLElement;
    interactBtn?: HTMLElement;
  } = {};

  private pauseTab: 'equip' | 'skills' | 'lore' | 'settings' = 'equip';
  private mapViewRealm: CastleRealm = 'normal';
  private lastMinimapRoom = '';

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
    if (blocked) {
      this.engine.input.resetAll();
    }
  }

  // ==================== 标题主界面（存档槽 + 隐藏模式入口） ====================
  public showTitleScreen(): void {
    this.clearAllUI();
    this.engine.stopSession();

    const meta = SaveManager.getMeta();
    const root = document.createElement('div');
    root.className = 'title-screen';

    let slotsHtml = '';
    for (let i = 1; i <= 3; i++) {
      const slot = SaveManager.getSlot(i);
      if (slot) {
        const pct = WorldMap.calcExplorationPct(slot.visitedRooms);
        const realmLabel = slot.currentRealm === 'inverted' ? '倒悬里城' : '九幽表城';
        const modeTag = slot.mode === 'xiaoduanshui' ? '【萧断水】' : '';
        slotsHtml += `
          <div class="slot-card">
            <div class="slot-info">
              <h4>卷宗 ${i} · ${slot.heroName}${modeTag} (Lv.${slot.level})</h4>
              <p>${realmLabel} · 探索率 ${pct.toFixed(1)}% · 银两 ${slot.gold}</p>
            </div>
            <div style="display:flex;gap:6px;">
              <button class="btn-guofeng btn-crimson" data-act="load" data-slot="${i}">入城</button>
              <button class="btn-guofeng" data-act="del" data-slot="${i}" title="删除存档">✕</button>
            </div>
          </div>
        `;
      } else {
        slotsHtml += `
          <div class="slot-card">
            <div class="slot-info">
              <h4>卷宗 ${i} · 空白密档</h4>
              <p>主线故事：18岁少年李逸承寻师破城</p>
            </div>
            <button class="btn-guofeng btn-gold" data-act="new" data-slot="${i}">新启</button>
          </div>
        `;
      }
    }

    const xiaoBtn = meta.unlockedXiaoMode
      ? `<button class="btn-guofeng btn-jade" id="btn-mode-xiao">⚡ 隐藏模式：萧断水速通</button>`
      : `<button class="btn-guofeng" id="btn-mode-xiao-lock" style="opacity:0.68;">🔒 萧断水模式 (真结局或设置解锁)</button>`;

    const rushBtn = meta.unlockedBossRush
      ? `<button class="btn-guofeng btn-crimson" id="btn-mode-rush">🔥 隐藏模式：百鬼试炼塔</button>`
      : `<button class="btn-guofeng" id="btn-mode-rush-lock" style="opacity:0.68;">🔒 百鬼试炼塔 (真结局或设置解锁)</button>`;

    root.innerHTML = `
      <div class="title-left">
        <span class="title-badge">国风水墨 · 类恶魔城探索动作 ARPG</span>
        <h1 class="title-main">玄城夜行：九幽录</h1>
        <p class="title-desc">
          甲子血月当空，沉入地脉千年的九幽王城重现人间。<br/>
          十八岁镇妖司少年<strong>李逸承</strong>孤身提剑入城，执五系神兵、搓古武绝学、集破障秘宝、探表里双城（最高 <strong>200.0%</strong> 探索度），揭开恩师堕魔背后的惊天迷局。
        </p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
          <button class="btn-guofeng" id="btn-title-fs">⛶ 全屏横屏</button>
          <button class="btn-guofeng" id="btn-title-unlock">🔓 一键体验隐藏模式</button>
          <button class="btn-guofeng" id="btn-title-guide">📖 出招与操作指南</button>
        </div>
      </div>

      <div class="title-right">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <strong style="color:var(--gold-bright);letter-spacing:1px;">选择镇妖司卷宗</strong>
          <span style="font-size:11.5px;color:var(--jade);">最高探索 ${meta.bestExplorationPct.toFixed(1)}%</span>
        </div>
        ${slotsHtml}
        <div style="border-top:1px solid var(--gold-dim);padding-top:8px;display:flex;flex-direction:column;gap:6px;">
          ${xiaoBtn}
          ${rushBtn}
        </div>
      </div>
    `;

    this.uiLayer.appendChild(root);
    this.modalEl = root;
    this.syncBlockState();

    root.querySelectorAll<HTMLButtonElement>('[data-act]').forEach((btn) => {
      btn.onclick = () => {
        AudioFX.resume();
        const act = btn.dataset.act;
        const idx = Number(btn.dataset.slot);
        if (act === 'new') {
          const fresh = createFreshSaveSlot(idx, 'story');
          SaveManager.saveSlot(fresh);
          this.launchGame(fresh);
        } else if (act === 'load') {
          const existing = SaveManager.getSlot(idx);
          if (existing) this.launchGame(existing);
        } else if (act === 'del') {
          SaveManager.deleteSlot(idx);
          this.showTitleScreen();
        }
      };
    });

    root.querySelector('#btn-title-fs')?.addEventListener('click', () => {
      NativeApp.requestFullscreenAndLandscape();
    });

    root.querySelector('#btn-title-unlock')?.addEventListener('click', () => {
      SaveManager.saveMeta({ unlockedXiaoMode: true, unlockedBossRush: true });
      AudioFX.playRelicBell();
      this.showTitleScreen();
    });

    root.querySelector('#btn-title-guide')?.addEventListener('click', () => {
      this.showQuickGuideModal();
    });

    root.querySelector('#btn-mode-xiao')?.addEventListener('click', () => {
      const s = createFreshSaveSlot(9, 'xiaoduanshui');
      this.launchGame(s);
    });

    root.querySelector('#btn-mode-rush')?.addEventListener('click', () => {
      const s = createFreshSaveSlot(8, 'boss_rush');
      s.level = 14;
      s.ownedWeapons = ['sword_2', 'greatsword_2', 'spear_2', 'daggers_2', 'whip_2'];
      s.equippedWeapon = 'sword_2';
      this.launchGame(s);
    });
  }

  private showQuickGuideModal(): void {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="guofeng-modal" style="max-width:660px;">
        <div class="modal-header">
          <h2>📖 镇妖司剑诀与机关要术</h2>
          <button class="btn-guofeng" id="btn-close-guide">返回</button>
        </div>
        <div class="modal-body" style="line-height:1.7;font-size:13.5px;">
          <p><strong>📱 触屏操作：</strong>左半屏滑动<strong>八向摇杆</strong>移动与搓招，右侧圆键分别为 <strong>【斩】</strong>普攻/搓招收尾、<strong>【跃】</strong>轻功跳跃、<strong>【身】</strong>化雾冲刺/后撤步、<strong>【符】</strong>奇门法器/飞燕钩锁、<strong>【药】</strong>快捷服药。</p>
          <p><strong>⌨️ 键盘操作：</strong><code>WASD / 方向键</code> 移动，<code>J / Z</code> 挥斩，<code>K / X / 空格</code> 跳跃，<code>L / Shift</code> 身法冲刺，<code>U / V</code> 副法器，<code>E</code> 场景互动，<code>H</code> 服药，<code>M</code> 全城舆图，<code>B / Esc</code> 行囊菜单。</p>
          <p><strong>🔥 五大真气手搓绝技（摇杆/方向键滑搓指令紧接【斩】）：</strong></p>
          <ul>
            <li><span class="motion-cmd">↓ ↘ → + 斩</span> <strong>朔风破空斩</strong>：依当前武器激发远程剑气/火浪/苍龙枪芒</li>
            <li><span class="motion-cmd">← → + 斩</span> <strong>瞬影一闪</strong>：无敌水墨残影穿身三连爆斩</li>
            <li><span class="motion-cmd">↓ ↑ + 斩</span> <strong>惊鸿升龙破</strong>：无敌腾空纵斩防空</li>
            <li><span class="motion-cmd">↓ ↙ ← + 斩</span> <strong>太极震气诀</strong>：震碎敌方弹幕并震晕群妖</li>
            <li><span class="motion-cmd">← ↙ ↓ ↘ → + 斩</span> <strong>九幽噬魂引</strong>：全屏暗墨锁魂打击并吸血！</li>
          </ul>
        </div>
      </div>
    `;
    this.uiLayer.appendChild(overlay);
    overlay.querySelector('#btn-close-guide')?.addEventListener('click', () => overlay.remove());
  }

  private launchGame(slot: ReturnType<typeof createFreshSaveSlot>): void {
    this.clearAllUI();
    this.buildInGameHud();
    this.engine.startSession(slot);
    this.syncBlockState();
  }

  private clearAllUI(): void {
    this.uiLayer.innerHTML = '';
    this.hudEl = null;
    this.modalEl = null;
    this.dialogueEl = null;
    this.bannerEl = null;
    this.minimapCanvas = null;
    this.hudRefs = {};
  }

  // ==================== 局内常驻 HUD 与恶魔城微缩方格地图 ====================
  private buildInGameHud(): void {
    const hud = document.createElement('div');
    hud.className = 'hud-bar';
    hud.innerHTML = `
      <div class="hud-left">
        <div class="hud-hero-row">
          <span class="hud-hero-name" id="hud-hero-name">李逸承</span>
          <span class="hud-lv-badge" id="hud-lv-badge">Lv.1</span>
        </div>
        <div class="bar-wrap">
          <div class="bar-fill-hp" id="hud-hp-fill" style="width:100%"></div>
          <div class="bar-label"><span>气血</span><span id="hud-hp-txt">100/100</span></div>
        </div>
        <div class="bar-wrap">
          <div class="bar-fill-mp" id="hud-mp-fill" style="width:100%"></div>
          <div class="bar-label"><span>真气</span><span id="hud-mp-txt">60/60</span></div>
        </div>
        <div class="hud-equip-row">
          <span class="hud-chip" id="hud-wpn-chip" title="点击快速切换已拥有的主武器">⚔ 青竹剑 ↻</span>
          <span class="hud-chip" id="hud-sub-chip" title="点击切换副法器">☯ 飞刀(15)</span>
          <span class="hud-chip" id="hud-gold-chip" style="pointer-events:none;">🪙 80</span>
        </div>
      </div>

      <div class="hud-right">
        <div class="hud-top-actions">
          <button class="btn-guofeng" id="btn-hud-menu" style="padding:5px 10px;font-size:12px;">🎒 行囊/秘卷</button>
          <button class="btn-guofeng" id="btn-hud-map" style="padding:5px 10px;font-size:12px;">🗺 玄城舆图</button>
        </div>
        <div class="minimap-box" id="minimap-box" title="点击展开全城探索方格地图">
          <canvas id="minimap-canvas" width="116" height="76"></canvas>
          <span class="minimap-title" id="minimap-title">瓮城残垣 3.1%</span>
        </div>
      </div>
    `;

    const bossHud = document.createElement('div');
    bossHud.className = 'boss-hud';
    bossHud.style.display = 'none';
    bossHud.innerHTML = `
      <div class="boss-hud-name" id="boss-hud-name">守关妖王</div>
      <div class="boss-bar-track">
        <div class="boss-bar-fill" id="boss-hud-fill" style="width:100%"></div>
      </div>
    `;

    const interactBtn = document.createElement('button');
    interactBtn.className = 'interact-prompt';
    interactBtn.style.display = 'none';
    interactBtn.type = 'button';

    this.uiLayer.appendChild(hud);
    this.uiLayer.appendChild(bossHud);
    this.uiLayer.appendChild(interactBtn);

    this.hudEl = hud;
    this.minimapCanvas = hud.querySelector('#minimap-canvas') as HTMLCanvasElement;
    this.hudRefs = {
      heroName: hud.querySelector('#hud-hero-name') as HTMLElement,
      lvBadge: hud.querySelector('#hud-lv-badge') as HTMLElement,
      hpFill: hud.querySelector('#hud-hp-fill') as HTMLElement,
      hpText: hud.querySelector('#hud-hp-txt') as HTMLElement,
      mpFill: hud.querySelector('#hud-mp-fill') as HTMLElement,
      mpText: hud.querySelector('#hud-mp-txt') as HTMLElement,
      weaponChip: hud.querySelector('#hud-wpn-chip') as HTMLElement,
      subChip: hud.querySelector('#hud-sub-chip') as HTMLElement,
      goldChip: hud.querySelector('#hud-gold-chip') as HTMLElement,
      mapTitle: hud.querySelector('#minimap-title') as HTMLElement,
      bossWrap: bossHud,
      bossName: bossHud.querySelector('#boss-hud-name') as HTMLElement,
      bossFill: bossHud.querySelector('#boss-hud-fill') as HTMLElement,
      interactBtn,
    };

    this.hudRefs.weaponChip?.addEventListener('click', () => this.engine.cycleWeapon());
    this.hudRefs.subChip?.addEventListener('click', () => {
      const s = this.engine.slot;
      if (!s || s.ownedSubWeapons.length <= 1) return;
      const idx = s.ownedSubWeapons.indexOf(s.equippedSubWeapon);
      s.equippedSubWeapon = s.ownedSubWeapons[(idx + 1) % s.ownedSubWeapons.length];
    });
    hud.querySelector('#btn-hud-menu')?.addEventListener('click', () => this.togglePauseModal());
    hud.querySelector('#btn-hud-map')?.addEventListener('click', () => this.toggleMapModal());
    hud.querySelector('#minimap-box')?.addEventListener('click', () => this.toggleMapModal());
    interactBtn.addEventListener('click', () => this.engine.input.triggerInteractFromUI());
  }

  public syncHud(): void {
    const s = this.engine.slot;
    const r = this.engine.room;
    if (!s || !r || !this.hudEl) return;

    const p = this.engine.player;
    const w = WEAPONS[s.equippedWeapon] || WEAPONS.sword_1;
    const sub = SUB_WEAPONS[s.equippedSubWeapon] || SUB_WEAPONS.dagger_throw;

    if (this.hudRefs.heroName) this.hudRefs.heroName.textContent = s.heroName;
    if (this.hudRefs.lvBadge) this.hudRefs.lvBadge.textContent = `Lv.${s.level}`;

    const hpPct = Math.max(0, Math.min(100, (p.hp / Math.max(1, p.maxHp)) * 100));
    const mpPct = Math.max(0, Math.min(100, (p.mp / Math.max(1, p.maxMp)) * 100));
    if (this.hudRefs.hpFill) this.hudRefs.hpFill.style.width = `${hpPct}%`;
    if (this.hudRefs.hpText) {
      this.hudRefs.hpText.textContent = `${Math.ceil(p.hp)}/${p.maxHp}`;
    }
    if (this.hudRefs.mpFill) this.hudRefs.mpFill.style.width = `${mpPct}%`;
    if (this.hudRefs.mpText) {
      this.hudRefs.mpText.textContent = `${Math.floor(p.mp)}/${p.maxMp}`;
    }

    if (this.hudRefs.weaponChip) {
      this.hudRefs.weaponChip.textContent = `⚔ ${w.name}${s.ownedWeapons.length > 1 ? ' ↻' : ''}`;
    }
    if (this.hudRefs.subChip) {
      this.hudRefs.subChip.textContent = `☯ ${sub.name}(${s.talismanHearts})`;
    }
    if (this.hudRefs.goldChip) {
      this.hudRefs.goldChip.textContent = `🪙 ${s.gold}`;
    }

    const boss = this.engine.enemies.find((e) => e.profile.isBoss);
    if (this.hudRefs.bossWrap) {
      if (boss) {
        this.hudRefs.bossWrap.style.display = 'block';
        if (this.hudRefs.bossName) this.hudRefs.bossName.textContent = boss.profile.name;
        if (this.hudRefs.bossFill) {
          this.hudRefs.bossFill.style.width = `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%`;
        }
      } else {
        this.hudRefs.bossWrap.style.display = 'none';
      }
    }

    if (this.hudRefs.interactBtn) {
      if (this.engine.nearbyInteract && !this.isAnyOverlayOpen()) {
        this.hudRefs.interactBtn.style.display = 'block';
        this.hudRefs.interactBtn.textContent = this.engine.nearbyInteract.label;
      } else {
        this.hudRefs.interactBtn.style.display = 'none';
      }
    }

    const mmKey = `${r.realm}:${r.id}:${s.visitedRooms.length}`;
    if (mmKey !== this.lastMinimapRoom) {
      this.lastMinimapRoom = mmKey;
      const pct = WorldMap.calcExplorationPct(s.visitedRooms);
      if (this.hudRefs.mapTitle) {
        this.hudRefs.mapTitle.textContent = `${REGION_NAMES[r.region]} ${pct.toFixed(1)}%`;
      }
      this.drawCastleGridMap(this.minimapCanvas, r.realm, r, s.visitedRooms, 11, 9);
    }
  }

  private drawCastleGridMap(
    canvas: HTMLCanvasElement | null,
    realm: CastleRealm,
    curRoom: BuiltRoom,
    visited: string[],
    cellW: number,
    cellH: number
  ): void {
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const visitedSet = new Set(visited);
    const rooms = WorldMap.getAllRooms(realm);
    const padX = Math.floor((canvas.width - 9 * cellW) * 0.5);
    const padY = Math.floor((canvas.height - 7 * cellH) * 0.5);

    for (const rm of rooms) {
      const vk = `${realm}:${rm.id}`;
      if (!visitedSet.has(vk)) continue;

      const x = padX + rm.mapX * cellW;
      const y = padY + rm.mapY * cellH;

      if (rm.special === 'save_shrine') ctx.fillStyle = '#d97706';
      else if (rm.special === 'warp_bagua') ctx.fillStyle = '#0d9488';
      else if (rm.special === 'boss_room') ctx.fillStyle = '#b91c1c';
      else ctx.fillStyle = realm === 'inverted' ? '#581c87' : '#1d4ed8';

      ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);

      // 经典恶魔城门洞引线（提示未探索的相连岔路！）
      ctx.fillStyle = '#facc15';
      if (rm.doors.left !== 'none') ctx.fillRect(x - 1, y + cellH * 0.4, 3, 2);
      if (rm.doors.right !== 'none') ctx.fillRect(x + cellW - 2, y + cellH * 0.4, 3, 2);
      if (rm.doors.up !== 'none') ctx.fillRect(x + cellW * 0.4, y - 1, 2, 3);
      if (rm.doors.down !== 'none') ctx.fillRect(x + cellW * 0.4, y + cellH - 2, 2, 3);

      if (curRoom.realm === realm && curRoom.id === rm.id) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 3, y + 2, cellW - 6, cellH - 4);
      }
    }
  }

  // ==================== 全屏恶魔城方格探索大地图 ====================
  public toggleMapModal(): void {
    if (!this.engine.slot || !this.engine.room) return;
    if (this.modalEl) {
      this.closeModal();
      return;
    }
    this.mapViewRealm = this.engine.room.realm;
    this.renderMapModal();
  }

  private renderMapModal(): void {
    if (!this.engine.slot || !this.engine.room) return;
    this.closeModal();

    const s = this.engine.slot;
    const pct = WorldMap.calcExplorationPct(s.visitedRooms);
    const hasInvertedVisited = s.visitedRooms.some((k) => k.startsWith('inverted:'));

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="guofeng-modal">
        <div class="modal-header">
          <h2>🗺 玄城堪舆全图 · 总探索率 ${pct.toFixed(1)}%</h2>
          <div style="display:flex;gap:8px;">
            ${
              hasInvertedVisited
                ? `<button class="tab-btn ${this.mapViewRealm === 'normal' ? 'active' : ''}" id="map-tab-norm">阳表·九幽玄城</button>
                   <button class="tab-btn ${this.mapViewRealm === 'inverted' ? 'active' : ''}" id="map-tab-inv">阴里·倒悬里城</button>`
                : ''
            }
            <button class="btn-guofeng" id="btn-close-map">关闭 [M]</button>
          </div>
        </div>
        <div class="modal-body" style="display:flex;flex-direction:column;align-items:center;gap:10px;">
          <canvas id="fullmap-canvas" width="540" height="320" style="background:#070a11;border:1px solid var(--gold-dim);border-radius:8px;max-width:100%;"></canvas>
          <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:12px;color:var(--paper-muted);">
            <span>🟦 已探索区域</span>
            <span>🟧 镇魂祠存档点</span>
            <span>🟩 太极八卦传送阵</span>
            <span>🟥 守关妖王殿</span>
            <span>⬜ 当前所在位置</span>
            <span>🟨 边缘黄点：未踏足岔路门洞</span>
          </div>
        </div>
      </div>
    `;

    this.uiLayer.appendChild(overlay);
    this.modalEl = overlay;
    this.syncBlockState();

    const fullCanvas = overlay.querySelector('#fullmap-canvas') as HTMLCanvasElement;
    this.drawCastleGridMap(fullCanvas, this.mapViewRealm, this.engine.room, s.visitedRooms, 52, 40);

    overlay.querySelector('#btn-close-map')?.addEventListener('click', () => this.closeModal());
    overlay.querySelector('#map-tab-norm')?.addEventListener('click', () => {
      this.mapViewRealm = 'normal';
      this.renderMapModal();
    });
    overlay.querySelector('#map-tab-inv')?.addEventListener('click', () => {
      this.mapViewRealm = 'inverted';
      this.renderMapModal();
    });
  }

  // ==================== 行囊装备 / 手搓秘卷 / 人物列传 / 系统菜单 ====================
  public togglePauseModal(): void {
    if (!this.engine.slot) return;
    if (this.modalEl) {
      this.closeModal();
      return;
    }
    this.renderPauseModal();
  }

  private renderPauseModal(): void {
    if (!this.engine.slot) return;
    this.closeModal();

    const s = this.engine.slot;
    const p = this.engine.player;

    let bodyHtml = '';
    if (this.pauseTab === 'equip') {
      const wCards = s.ownedWeapons
        .map((id) => {
          const w = WEAPONS[id];
          const eq = s.equippedWeapon === id;
          return `
          <div class="item-card ${eq ? 'equipped' : ''}">
            <div class="item-card-top">
              <span class="item-name">${w.name}</span>
              <span class="item-tag">攻击 +${w.atk}</span>
            </div>
            <div class="item-desc">${w.traitDesc}</div>
            <button class="btn-guofeng ${eq ? 'btn-jade' : ''}" data-eq-wpn="${id}">
              ${eq ? '✓ 当前佩兵' : '装备此兵'}
            </button>
          </div>`;
        })
        .join('');

      const subCards = s.ownedSubWeapons
        .map((id) => {
          const sub = SUB_WEAPONS[id];
          const eq = s.equippedSubWeapon === id;
          return `
          <div class="item-card ${eq ? 'equipped' : ''}">
            <div class="item-card-top">
              <span class="item-name">${sub.name}</span>
              <span class="item-tag">耗符 ${sub.talismanCost}</span>
            </div>
            <div class="item-desc">${sub.desc}</div>
            <button class="btn-guofeng ${eq ? 'btn-jade' : ''}" data-eq-sub="${id}">
              ${eq ? '✓ 已装配' : '装配法器'}
            </button>
          </div>`;
        })
        .join('');

      const armorCards = s.ownedArmors
        .map((id) => {
          const a = ARMORS[id];
          const eq = s.equippedArmor === id || s.equippedAccessory === id;
          return `
          <div class="item-card ${eq ? 'equipped' : ''}">
            <div class="item-card-top">
              <span class="item-name">${a.name}</span>
              <span class="item-tag">${a.slot === 'armor' ? '衣甲' : '佩饰'} · 防+${a.def}</span>
            </div>
            <div class="item-desc">${a.desc}</div>
            <button class="btn-guofeng ${eq ? 'btn-jade' : ''}" data-eq-arm="${id}">
              ${eq ? '✓ 已穿戴' : '穿戴'}
            </button>
          </div>`;
        })
        .join('');

      const coreCards =
        s.ownedYaoCores.length === 0
          ? `<p style="color:var(--paper-muted);font-size:12.5px;">击败城中百鬼有几率吸纳其【本命妖丹】获得特殊被动加持。</p>`
          : s.ownedYaoCores
              .map((id) => {
                const c = YAO_CORES[id];
                const eq = s.equippedYaoCore === id;
                return `
              <div class="item-card ${eq ? 'equipped' : ''}">
                <div class="item-card-top">
                  <span class="item-name">${c.name}</span>
                  <span class="item-tag">${c.monsterName}</span>
                </div>
                <div class="item-desc">${c.desc}</div>
                <button class="btn-guofeng ${eq ? 'btn-jade' : ''}" data-eq-core="${id}">
                  ${eq ? '✓ 运转中' : '融炼运转'}
                </button>
              </div>`;
              })
              .join('');

      const itemCards = Object.entries(s.consumables)
        .filter(([, cnt]) => cnt > 0)
        .map(([id, cnt]) => {
          const c = CONSUMABLES[id];
          return `
          <div class="item-card">
            <div class="item-card-top">
              <span class="item-name">${c.name} ×${cnt}</span>
              <button class="btn-guofeng btn-gold" data-use-item="${id}">服用</button>
            </div>
            <div class="item-desc">${c.desc}</div>
          </div>`;
        })
        .join('');

      bodyHtml = `
        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px;padding:8px 12px;background:rgba(0,0,0,0.35);border-radius:6px;font-size:12.5px;">
          <span><strong>${s.heroName}</strong> Lv.${s.level} (经验 ${s.exp}/${this.engine.getExpForNextLevel(s.level)})</span>
          <span>攻击 <strong>${p.atk}</strong></span>
          <span>防御 <strong>${p.def}</strong></span>
          <span>臂力 ${p.str} · 神识 ${p.int} · 福缘 ${p.lck}</span>
          <span>暴击率 ${Math.round(p.critChance * 100)}%</span>
        </div>
        <h4 style="margin:6px 0;color:var(--gold-bright);">⚔ 主手五系兵器</h4>
        <div class="grid-2col">${wCards}</div>
        <h4 style="margin:12px 0 6px;color:var(--gold-bright);">☯ 副手奇门法器</h4>
        <div class="grid-2col">${subCards}</div>
        <h4 style="margin:12px 0 6px;color:var(--gold-bright);">🛡 护身宝甲与佩玉</h4>
        <div class="grid-2col">${armorCards}</div>
        <h4 style="margin:12px 0 6px;color:var(--gold-bright);">🔮 炼化妖丹</h4>
        <div class="grid-2col">${coreCards}</div>
        <h4 style="margin:12px 0 6px;color:var(--gold-bright);">🍶 灵丹妙药</h4>
        <div class="grid-2col">${itemCards || '<span style="color:var(--paper-muted);font-size:12px;">暂无丹药</span>'}</div>
      `;
    } else if (this.pauseTab === 'skills') {
      const skCards = (Object.keys(SKILLS) as SkillId[])
        .map((id) => {
          const sk = SKILLS[id];
          const learned = s.learnedSkills.includes(id);
          return `
          <div class="item-card ${learned ? 'equipped' : ''}">
            <div class="item-card-top">
              <span class="item-name">${sk.name}</span>
              <span class="item-tag">耗气 ${sk.mpCost}</span>
            </div>
            <div><span class="motion-cmd">${sk.commandText}</span></div>
            <div class="item-desc">${sk.desc}</div>
          </div>`;
        })
        .join('');

      const abCards = Object.entries(ABILITIES_META)
        .map(([key, meta]) => {
          const owned = s.abilities.includes(key as never);
          return `
          <div class="item-card ${owned ? 'equipped' : ''}" style="opacity:${owned ? 1 : 0.48}">
            <div class="item-card-top">
              <span class="item-name">${owned ? '✓ ' : '🔒 '}${meta.name}</span>
            </div>
            <div class="item-desc">${meta.subtitle} — ${meta.desc}</div>
          </div>`;
        })
        .join('');

      bodyHtml = `
        <h4 style="margin:0 0 8px;color:var(--gold-bright);">🔥 手搓古武绝学（方向轨迹紧接【斩】键立即释放）</h4>
        <div class="grid-2col">${skCards}</div>
        <h4 style="margin:14px 0 8px;color:var(--gold-bright);">🗝 玄城破障秘宝与真相双信物</h4>
        <div class="grid-2col">${abCards}</div>
      `;
    } else if (this.pauseTab === 'lore') {
      bodyHtml = `
        <div class="grid-2col">
          ${CHARACTER_BIOS.map(
            (b) => `
            <div class="item-card">
              <div class="item-card-top">
                <span class="item-name" style="color:${b.color}">${b.name}</span>
              </div>
              <div style="font-size:11.5px;color:var(--gold);">${b.ageTitle}</div>
              <div class="item-desc">${b.summary}</div>
            </div>`
          ).join('')}
        </div>
      `;
    } else {
      const meta = SaveManager.getMeta();
      const mute = AudioFX.getMuteState();
      bodyHtml = `
        <div style="display:flex;flex-direction:column;gap:12px;max-width:520px;">
          <div class="item-card">
            <div class="item-name">触屏操控与视听设置</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">
              <button class="btn-guofeng" id="set-ctrl-style">
                摇杆模式：${meta.controlStyle === 'joystick' ? '动态跟随八向摇杆' : '固定位置摇杆'}
              </button>
              <button class="btn-guofeng" id="set-bgm-mute">
                古风配乐：${mute.bgmMuted ? '已静音' : '开启'}
              </button>
              <button class="btn-guofeng" id="set-sfx-mute">
                刀剑音效：${mute.sfxMuted ? '已静音' : '开启'}
              </button>
              <button class="btn-guofeng" id="set-fullscreen">⛶ 全屏锁定横屏</button>
            </div>
          </div>

          <div class="item-card">
            <div class="item-name">开发者体验百宝箱（方便快速评测全部武器与能力）</div>
            <div class="item-desc">可随时一键领取全部5大类代表兵器（剑/陌刀/枪/双刺/九节鞭）或全破障轻功进行手感测试：</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">
              <button class="btn-guofeng btn-gold" id="dev-all-weapons">🎁 试用全5系武器+法器</button>
              <button class="btn-guofeng btn-jade" id="dev-all-abilities">⚡ 解锁全轻功与双信物</button>
            </div>
          </div>

          <div style="display:flex;gap:10px;">
            <button class="btn-guofeng btn-crimson" id="btn-quit-title">保存进度并返回主界面</button>
          </div>
        </div>
      `;
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="guofeng-modal">
        <div class="modal-header">
          <div class="modal-tabs">
            <button class="tab-btn ${this.pauseTab === 'equip' ? 'active' : ''}" data-ptab="equip">🎒 神兵行囊</button>
            <button class="tab-btn ${this.pauseTab === 'skills' ? 'active' : ''}" data-ptab="skills">📜 手搓武学/神通</button>
            <button class="tab-btn ${this.pauseTab === 'lore' ? 'active' : ''}" data-ptab="lore">👥 人物列传</button>
            <button class="tab-btn ${this.pauseTab === 'settings' ? 'active' : ''}" data-ptab="settings">⚙ 系统设置</button>
          </div>
          <button class="btn-guofeng" id="btn-close-pause">继续夜行</button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
      </div>
    `;

    this.uiLayer.appendChild(overlay);
    this.modalEl = overlay;
    this.syncBlockState();

    overlay.querySelector('#btn-close-pause')?.addEventListener('click', () => this.closeModal());
    overlay.querySelectorAll<HTMLButtonElement>('[data-ptab]').forEach((b) => {
      b.onclick = () => {
        this.pauseTab = b.dataset.ptab as typeof this.pauseTab;
        this.renderPauseModal();
      };
    });

    overlay.querySelectorAll<HTMLButtonElement>('[data-eq-wpn]').forEach((b) => {
      b.onclick = () => {
        s.equippedWeapon = b.dataset.eqWpn!;
        this.engine.recalcStats(false);
        this.renderPauseModal();
      };
    });
    overlay.querySelectorAll<HTMLButtonElement>('[data-eq-sub]').forEach((b) => {
      b.onclick = () => {
        s.equippedSubWeapon = b.dataset.eqSub as SubWeaponId;
        this.renderPauseModal();
      };
    });
    overlay.querySelectorAll<HTMLButtonElement>('[data-eq-arm]').forEach((b) => {
      b.onclick = () => {
        const id = b.dataset.eqArm!;
        if (ARMORS[id].slot === 'armor') s.equippedArmor = id;
        else s.equippedAccessory = id;
        this.engine.recalcStats(false);
        this.renderPauseModal();
      };
    });
    overlay.querySelectorAll<HTMLButtonElement>('[data-eq-core]').forEach((b) => {
      b.onclick = () => {
        s.equippedYaoCore = b.dataset.eqCore!;
        this.engine.recalcStats(false);
        this.renderPauseModal();
      };
    });
    overlay.querySelectorAll<HTMLButtonElement>('[data-use-item]').forEach((b) => {
      b.onclick = () => {
        this.engine.useConsumable(b.dataset.useItem!);
        this.renderPauseModal();
      };
    });

    overlay.querySelector('#set-ctrl-style')?.addEventListener('click', () => {
      const next = SaveManager.getMeta().controlStyle === 'joystick' ? 'dpad' : 'joystick';
      SaveManager.saveMeta({ controlStyle: next });
      this.engine.input.controlStyle = next;
      this.renderPauseModal();
    });
    overlay.querySelector('#set-bgm-mute')?.addEventListener('click', () => {
      const m = AudioFX.getMuteState();
      AudioFX.setMute(m.sfxMuted, !m.bgmMuted);
      SaveManager.saveMeta({ bgmMuted: !m.bgmMuted });
      this.renderPauseModal();
    });
    overlay.querySelector('#set-sfx-mute')?.addEventListener('click', () => {
      const m = AudioFX.getMuteState();
      AudioFX.setMute(!m.sfxMuted, m.bgmMuted);
      SaveManager.saveMeta({ sfxMuted: !m.sfxMuted });
      this.renderPauseModal();
    });
    overlay.querySelector('#set-fullscreen')?.addEventListener('click', () => {
      NativeApp.requestFullscreenAndLandscape();
    });

    overlay.querySelector('#dev-all-weapons')?.addEventListener('click', () => {
      for (const id of ['sword_1', 'greatsword_1', 'spear_1', 'daggers_1', 'whip_1']) {
        if (!s.ownedWeapons.includes(id)) s.ownedWeapons.push(id);
      }
      s.ownedSubWeapons = ['dagger_throw', 'holy_fire', 'bagua_cross', 'mountain_seal', 'sword_orbit'];
      s.talismanHearts = 60;
      AudioFX.playRelicBell();
      this.pauseTab = 'equip';
      this.renderPauseModal();
    });

    overlay.querySelector('#dev-all-abilities')?.addEventListener('click', () => {
      s.abilities = [
        'double_jump',
        'ground_slam',
        'mist_dash',
        'grapple_hook',
        'wall_jump',
        'mirror_truth',
        'jade_pendant_full',
      ];
      s.learnedSkills = [
        'shuofeng_wave',
        'shunying_flash',
        'jinghong_rising',
        'taiji_parry',
        'jiuyou_soulsteal',
      ];
      AudioFX.playRelicBell();
      this.pauseTab = 'skills';
      this.renderPauseModal();
    });

    overlay.querySelector('#btn-quit-title')?.addEventListener('click', () => {
      if (s.slotIndex <= 3) SaveManager.saveSlot(s);
      this.showTitleScreen();
    });
  }

  // ==================== 铸剑坊 / 子夜鬼市 / 八卦传送阵 ====================
  public openInteractModal(kind: 'smith' | 'merchant' | 'warp'): void {
    const s = this.engine.slot;
    if (!s) return;
    this.closeModal();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    if (kind === 'smith') {
      const rows = s.ownedWeapons
        .map((id) => {
          const w = WEAPONS[id];
          if (!w.upgradeTo || !w.upgradeCost) {
            return `
            <div class="item-card equipped">
              <div class="item-name">${w.name} (已臻化境)</div>
              <div class="item-desc">此神兵已锤炼至最高品阶！</div>
            </div>`;
          }
          const nextW = WEAPONS[w.upgradeTo];
          return `
          <div class="item-card">
            <div class="item-card-top">
              <span class="item-name">${w.name} ➔ ${nextW.name}</span>
              <span class="item-tag">攻击 ${w.atk} ➔ ${nextW.atk}</span>
            </div>
            <div class="item-desc">${nextW.desc}</div>
            <button class="btn-guofeng btn-crimson" data-smith-upg="${id}">
              🔨 消耗 ${w.upgradeCost} 银两淬火升阶
            </button>
          </div>`;
        })
        .join('');

      overlay.innerHTML = `
        <div class="guofeng-modal">
          <div class="modal-header">
            <h2>🔨 赤火铸剑庐 · 独臂神匠欧冶残 (持有银两: ${s.gold})</h2>
            <button class="btn-guofeng" id="btn-close-submodal">辞别</button>
          </div>
          <div class="modal-body">
            <p style="margin-top:0;color:var(--paper-muted);font-size:13px;">“好剑配少年！把你手头的兵刃交予老夫，赤火百炼即可蜕胎换骨！”</p>
            <div class="grid-2col">${rows}</div>
          </div>
        </div>
      `;

      overlay.querySelectorAll<HTMLButtonElement>('[data-smith-upg]').forEach((b) => {
        b.onclick = () => {
          const id = b.dataset.smithUpg!;
          const w = WEAPONS[id];
          if (!w.upgradeTo || !w.upgradeCost || s.gold < w.upgradeCost) return;
          s.gold -= w.upgradeCost;
          const idx = s.ownedWeapons.indexOf(id);
          if (idx >= 0) s.ownedWeapons[idx] = w.upgradeTo;
          if (s.equippedWeapon === id) s.equippedWeapon = w.upgradeTo;
          this.engine.recalcStats(false);
          AudioFX.playParryClang();
          this.openInteractModal('smith');
        };
      });
    } else if (kind === 'merchant') {
      const shopWeapons = ['greatsword_1', 'spear_1', 'daggers_1', 'whip_1', 'sword_2'];
      const shopArmors = ['cloud_brocade', 'mingguang_armor', 'tiger_tally', 'qingxin_bell', 'fortune_gourd'];
      const shopItems = ['jinchuang_yao', 'huiqi_dan', 'beggar_chicken', 'osmanthus_wine'];

      const wHtml = shopWeapons
        .map((id) => {
          const w = WEAPONS[id];
          const owned = s.ownedWeapons.includes(id);
          return `
          <div class="item-card ${owned ? 'equipped' : ''}">
            <div class="item-card-top">
              <span class="item-name">${w.name}</span>
              <span class="item-tag">${w.price} 银两</span>
            </div>
            <div class="item-desc">${w.traitDesc}</div>
            <button class="btn-guofeng btn-gold" data-buy-wpn="${id}" ${owned ? 'disabled' : ''}>
              ${owned ? '已拥有' : `购入 (${w.price}银)`}
            </button>
          </div>`;
        })
        .join('');

      const aHtml = shopArmors
        .map((id) => {
          const a = ARMORS[id];
          const owned = s.ownedArmors.includes(id);
          return `
          <div class="item-card ${owned ? 'equipped' : ''}">
            <div class="item-card-top">
              <span class="item-name">${a.name}</span>
              <span class="item-tag">防+${a.def} · ${a.price}银</span>
            </div>
            <div class="item-desc">${a.desc}</div>
            <button class="btn-guofeng btn-gold" data-buy-arm="${id}" ${owned ? 'disabled' : ''}>
              ${owned ? '已拥有' : `购入 (${a.price}银)`}
            </button>
          </div>`;
        })
        .join('');

      const cHtml = shopItems
        .map((id) => {
          const c = CONSUMABLES[id];
          const cnt = s.consumables[id] || 0;
          return `
          <div class="item-card">
            <div class="item-card-top">
              <span class="item-name">${c.name} (持有:${cnt})</span>
              <span class="item-tag">${c.price} 银两</span>
            </div>
            <div class="item-desc">${c.desc}</div>
            <button class="btn-guofeng btn-jade" data-buy-cons="${id}">购入一份</button>
          </div>`;
        })
        .join('');

      overlay.innerHTML = `
        <div class="guofeng-modal">
          <div class="modal-header">
            <h2>🦊 子夜百鬼夜市 · 白掌柜 (持有银两: ${s.gold})</h2>
            <button class="btn-guofeng" id="btn-close-submodal">离开鬼市</button>
          </div>
          <div class="modal-body">
            <h4 style="margin:0 0 6px;color:var(--gold-bright);">五系奇门兵刃</h4>
            <div class="grid-2col">${wHtml}</div>
            <h4 style="margin:12px 0 6px;color:var(--gold-bright);">宝甲与奇珍玉佩</h4>
            <div class="grid-2col">${aHtml}</div>
            <h4 style="margin:12px 0 6px;color:var(--gold-bright);">救命丹药酒食</h4>
            <div class="grid-2col">${cHtml}</div>
          </div>
        </div>
      `;

      overlay.querySelectorAll<HTMLButtonElement>('[data-buy-wpn]').forEach((b) => {
        b.onclick = () => {
          const id = b.dataset.buyWpn!;
          const w = WEAPONS[id];
          if (s.gold < w.price || s.ownedWeapons.includes(id)) return;
          s.gold -= w.price;
          s.ownedWeapons.push(id);
          s.equippedWeapon = id;
          this.engine.recalcStats(false);
          AudioFX.playRelicBell();
          this.openInteractModal('merchant');
        };
      });
      overlay.querySelectorAll<HTMLButtonElement>('[data-buy-arm]').forEach((b) => {
        b.onclick = () => {
          const id = b.dataset.buyArm!;
          const a = ARMORS[id];
          if (s.gold < a.price || s.ownedArmors.includes(id)) return;
          s.gold -= a.price;
          s.ownedArmors.push(id);
          if (a.slot === 'armor') s.equippedArmor = id;
          else s.equippedAccessory = id;
          this.engine.recalcStats(false);
          AudioFX.playRelicBell();
          this.openInteractModal('merchant');
        };
      });
      overlay.querySelectorAll<HTMLButtonElement>('[data-buy-cons]').forEach((b) => {
        b.onclick = () => {
          const id = b.dataset.buyCons!;
          const c = CONSUMABLES[id];
          if (s.gold < c.price) return;
          s.gold -= c.price;
          s.consumables[id] = (s.consumables[id] || 0) + 1;
          AudioFX.playHit(false);
          this.openInteractModal('merchant');
        };
      });
    } else if (kind === 'warp') {
      const warps: { realm: CastleRealm; id: string; label: string }[] = [];
      for (const realm of ['normal', 'inverted'] as CastleRealm[]) {
        for (const rm of WorldMap.getAllRooms(realm)) {
          if (rm.special === 'warp_bagua' && s.visitedRooms.includes(`${realm}:${rm.id}`)) {
            warps.push({ realm, id: rm.id, label: rm.warpName || rm.name });
          }
        }
      }

      overlay.innerHTML = `
        <div class="guofeng-modal" style="max-width:540px;">
          <div class="modal-header">
            <h2>☯ 太极八卦缩地挪移阵</h2>
            <button class="btn-guofeng" id="btn-close-submodal">取消</button>
          </div>
          <div class="modal-body" style="display:flex;flex-direction:column;gap:8px;">
            ${warps
              .map(
                (w) => `
              <button class="btn-guofeng btn-jade" data-warp-realm="${w.realm}" data-warp-id="${w.id}">
                ☯ 传送至：${w.label}
              </button>`
              )
              .join('')}
          </div>
        </div>
      `;

      overlay.querySelectorAll<HTMLButtonElement>('[data-warp-id]').forEach((b) => {
        b.onclick = () => {
          const realm = b.dataset.warpRealm as CastleRealm;
          const id = b.dataset.warpId!;
          this.closeModal();
          this.engine.warpToRoom(realm, id);
        };
      });
    }

    this.uiLayer.appendChild(overlay);
    this.modalEl = overlay;
    this.syncBlockState();
    overlay.querySelector('#btn-close-submodal')?.addEventListener('click', () => this.closeModal());
  }

  public closeModal(): void {
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
    this.syncBlockState();
  }

  // ==================== 人物剧情对话系统 ====================
  public startStoryDialogue(scene: StoryScene, onDone?: () => void): void {
    if (this.dialogueEl) this.dialogueEl.remove();
    let idx = 0;

    const box = document.createElement('div');
    box.className = 'dialogue-box';
    this.uiLayer.appendChild(box);
    this.dialogueEl = box;
    this.syncBlockState();

    const renderLine = () => {
      const ln = scene.lines[idx];
      box.innerHTML = `
        <div class="dialogue-speaker-row">
          <div>
            <span class="dialogue-speaker" style="color:${ln.portraitColor}">${ln.speaker}</span>
            <span class="dialogue-role">${ln.role}</span>
          </div>
          <span style="font-size:11px;color:var(--paper-muted);">${scene.title} (${idx + 1}/${scene.lines.length})</span>
        </div>
        <div class="dialogue-text">${ln.text}</div>
        <div class="dialogue-next">点击任意处继续 ▸</div>
      `;
    };

    renderLine();

    box.onclick = () => {
      AudioFX.playHit(false);
      idx++;
      if (idx < scene.lines.length) {
        renderLine();
      } else {
        box.remove();
        this.dialogueEl = null;
        this.syncBlockState();
        onDone?.();
      }
    };
  }

  // ==================== 顶部水墨卷轴提示横幅 ====================
  public showBanner(title: string, sub: string): void {
    if (this.bannerEl) this.bannerEl.remove();
    const el = document.createElement('div');
    el.className = 'center-banner';
    el.innerHTML = `<h3>${title}</h3><p>${sub}</p>`;
    this.uiLayer.appendChild(el);
    this.bannerEl = el;
    window.setTimeout(() => {
      if (this.bannerEl === el) {
        el.remove();
        this.bannerEl = null;
      }
    }, 3100);
  }

  // ==================== 阵亡重整与通关结算界面 ====================
  public showGameOverModal(): void {
    this.closeModal();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="guofeng-modal" style="max-width:460px;text-align:center;">
        <div class="modal-header"><h2>🕯 气血耗尽 · 魂归镇魂祠</h2></div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:12px;">
          <p style="color:#d6cbb8;line-height:1.6;">少年剑折，但玄鸟玉佩护住了李逸承最后一缕心脉。是否借镇魂灯光重返玄城再战？</p>
          <button class="btn-guofeng btn-crimson" id="btn-revive-shrine">🏮 在最近状态重整再战</button>
          <button class="btn-guofeng" id="btn-gameover-title">返回标题卷宗</button>
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
      if (s.mode === 'boss_rush') {
        this.engine.startSession(s);
      } else {
        const saved = SaveManager.getSlot(s.slotIndex) || s;
        this.engine.startSession(saved);
      }
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
    const secs = Math.floor(timeSec % 60);

    const title =
      kind === 'true'
        ? '🏆 真结局达成 ·《破晓斩冥》'
        : kind === 'boss_rush'
          ? '🔥 百鬼试炼 · 全妖王讨伐制霸！'
          : '📜 结局一 ·《折剑归尘》（尚有隐藏里城未开启）';

    const desc =
      kind === 'true'
        ? `十八岁少年李逸承踏破表里双城（探索度 ${pct.toFixed(1)}%），救回恩师裴无极，斩灭太古尸仙烛阴！<br/><strong style="color:var(--jade)">现已永久解锁隐藏模式：【少统领·萧断水模式】与【百鬼试炼塔】！</strong>`
        : kind === 'boss_rush'
          ? `一骑当千连斩七大妖王！通关耗时：<strong>${mins}分${secs}秒</strong>。`
          : `你击败了被控制的恩师，但真正的幕后黑手仍盘踞在隐藏的【九幽倒悬里城】！<br/><strong style="color:var(--gold-bright)">提示：点击下方“回退至祭坛前继续探索”，去藏书阁顶层拿【破妄古镜】、水牢西密室拿【完整玄鸟佩】，再战裴无极斩碎头顶蚀心蛊即可开启倒悬里城！</strong>`;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="guofeng-modal" style="max-width:560px;text-align:center;">
        <div class="modal-header"><h2>${title}</h2></div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:14px;">
          <p style="line-height:1.7;font-size:14px;">${desc}</p>
          <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
            ${
              kind === 'normal'
                ? `<button class="btn-guofeng btn-jade" id="btn-continue-hunt">🔎 返回祭坛祠堂继续寻宝开里城</button>`
                : ''
            }
            <button class="btn-guofeng btn-gold" id="btn-end-title">返回主菜单</button>
          </div>
        </div>
      </div>
    `;

    this.uiLayer.appendChild(overlay);
    this.modalEl = overlay;
    this.syncBlockState();

    overlay.querySelector('#btn-continue-hunt')?.addEventListener('click', () => {
      if (!s) return;
      s.defeatedBosses = s.defeatedBosses.filter((k) => k !== 'normal:boss_pei_wuji');
      this.closeModal();
      const saveRoom = WorldMap.getRoom('normal', 'altar_save');
      this.engine.loadRoom(saveRoom, 12 * TILE_SIZE, 12 * TILE_SIZE, true);
    });
    overlay.querySelector('#btn-end-title')?.addEventListener('click', () => {
      this.showTitleScreen();
    });
  }
}
