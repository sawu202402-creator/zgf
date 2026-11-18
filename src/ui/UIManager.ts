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
import {
  BuiltRoom,
  MAP_GRID_TOTAL_H,
  MAP_GRID_TOTAL_W,
  REGION_NAMES,
  WorldMap,
} from '../data/worldMap';
import { GameEngine } from '../game/GameEngine';
import { createFreshSaveSlot, SaveManager } from '../meta/SaveManager';
import { NativeApp } from '../platform/NativeAppBridge';
import { CastleRealm, SkillId, StoryScene, SubWeaponId } from '../types';
import {
  getSlotCategorySvg,
  getSpeakerPortraitSvg,
  getSubWeaponSvg,
  getWeaponSvg,
} from './Icons';

type EquipSlotCategory = 'weapon' | 'sub' | 'armor' | 'accessory' | 'core' | 'potion';

export class UIManager {
  private hudEl: HTMLElement | null = null;
  private modalEl: HTMLElement | null = null;
  private dialogueEl: HTMLElement | null = null;
  private bannerEl: HTMLElement | null = null;
  private minimapCanvas: HTMLCanvasElement | null = null;

  private hudRefs: {
    wpnCrest?: HTMLElement;
    subCrest?: HTMLElement;
    lvNum?: HTMLElement;
    heroName?: HTMLElement;
    goldTag?: HTMLElement;
    hpFill?: HTMLElement;
    hpNum?: HTMLElement;
    mpFill?: HTMLElement;
    mpNum?: HTMLElement;
    mapCaption?: HTMLElement;
    bossWrap?: HTMLElement;
    bossName?: HTMLElement;
    bossFill?: HTMLElement;
    interactBtn?: HTMLElement;
  } = {};

  private pauseTab: 'equip' | 'skills' | 'map' | 'lore' | 'settings' = 'equip';
  private selectedEquipSlot: EquipSlotCategory = 'weapon';
  private previewItemId: string | null = null;
  private mapViewRealm: CastleRealm = 'normal';
  private lastMinimapSig = '';
  private lastHudWpnKey = '';
  private lastHudSubKey = '';

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

  private formatPlayTime(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const h = Math.floor(m / 60);
    const mm = String(m % 60).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return `${String(h).padStart(2, '0')}:${mm}:${ss}`;
  }

  // ==================== 恶魔城月下风格史诗标题界面 ====================
  public showTitleScreen(): void {
    this.clearAllUI();
    this.engine.stopSession();

    const meta = SaveManager.getMeta();
    const root = document.createElement('div');
    root.className = 'cv-title-screen';

    let slotsHtml = '';
    for (let i = 1; i <= 3; i++) {
      const slot = SaveManager.getSlot(i);
      if (slot) {
        const pct = WorldMap.calcExplorationPct(slot.visitedRooms);
        const realmTxt = slot.currentRealm === 'inverted' ? '逆·九幽里城' : '九幽玄城';
        slotsHtml += `
          <div class="cv-slot-row">
            <div>
              <div style="font-size:14px;font-weight:800;color:var(--cv-gold-bright);">
                卷宗 0${i} · ${slot.heroName} <span style="color:var(--cv-jade);font-size:12px;">LV.${slot.level}</span>
              </div>
              <div style="font-size:11.5px;color:var(--cv-muted);margin-top:2px;">
                ${realmTxt} · 探索度 ${pct.toFixed(1)}% · ${this.formatPlayTime(slot.playTimeSec)}
              </div>
            </div>
            <div style="display:flex;gap:6px;">
              <button class="cv-btn cv-btn-crimson" data-act="load" data-slot="${i}">继续夜行</button>
              <button class="cv-btn" data-act="del" data-slot="${i}" title="抹除卷宗">抹除</button>
            </div>
          </div>
        `;
      } else {
        slotsHtml += `
          <div class="cv-slot-row">
            <div>
              <div style="font-size:14px;font-weight:800;color:#e2e8f0;">卷宗 0${i} · 空白密档</div>
              <div style="font-size:11.5px;color:var(--cv-muted);margin-top:2px;">新启传记 · 十八岁少年李逸承</div>
            </div>
            <button class="cv-btn cv-btn-gold" data-act="new" data-slot="${i}">踏入玄城</button>
          </div>
        `;
      }
    }

    root.innerHTML = `
      <div class="cv-title-crest">
        <span class="cv-seal-tag">镇妖司秘录 · 恶魔城式探索动作 ARPG</span>
        <h1 class="cv-logo-text">玄城夜行</h1>
        <div class="cv-logo-sub">九 幽 录 · SYMPHONY OF NINE NETHER</div>
      </div>

      <div class="cv-title-menu-wrap">
        <div class="cv-main-menu">
          ${slotsHtml}
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
            ${
              meta.unlockedXiaoMode
                ? `<button class="cv-btn cv-btn-gold" id="btn-mode-xiao">少统领·萧断水模式</button>`
                : `<button class="cv-btn" id="btn-unlock-extra">解锁隐藏双模式预览</button>`
            }
            ${
              meta.unlockedBossRush
                ? `<button class="cv-btn cv-btn-crimson" id="btn-mode-rush">百鬼试炼 Boss Rush</button>`
                : ''
            }
            <button class="cv-btn" id="btn-title-guide">剑诀与搓招</button>
            <button class="cv-btn" id="btn-title-fs">全屏横屏</button>
          </div>
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

    root.querySelector('#btn-unlock-extra')?.addEventListener('click', () => {
      SaveManager.saveMeta({ unlockedXiaoMode: true, unlockedBossRush: true });
      AudioFX.playRelicBell();
      this.showTitleScreen();
    });
    root.querySelector('#btn-title-fs')?.addEventListener('click', () => {
      NativeApp.requestFullscreenAndLandscape();
    });
    root.querySelector('#btn-title-guide')?.addEventListener('click', () => {
      this.showQuickGuideModal();
    });
    root.querySelector('#btn-mode-xiao')?.addEventListener('click', () => {
      this.launchGame(createFreshSaveSlot(9, 'xiaoduanshui'));
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
      <div class="cv-window" style="max-width:680px;height:auto;max-height:88dvh;">
        <div class="cv-win-header">
          <strong style="color:var(--cv-gold-bright);letter-spacing:2px;">镇妖司剑诀要术与操控指南</strong>
          <button class="cv-btn" id="btn-close-guide">返回</button>
        </div>
        <div class="cv-scroll-body" style="line-height:1.7;font-size:13.5px;">
          <p><strong>触屏操控：</strong>左半屏滑动<strong>八向摇杆</strong>移动与搓招，右侧依次为 <strong>【斩】</strong>挥兵/搓招收尾、<strong>【跃】</strong>轻功/二段跳/蹬墙、<strong>【身】</strong>化雾冲刺/疾退取消后摇、<strong>【符】</strong>奇门副器/红灯笼钩锁、<strong>【药】</strong>快捷服药。</p>
          <p><strong>键盘操控：</strong><code>WASD / 方向键</code> 移动，<code>J / Z</code> 挥斩，<code>K / X / 空格</code> 跳跃，<code>L / Shift</code> 疾退与化雾，<code>U / V</code> 副器，<code>E</code> 互动，<code>H</code> 服药，<code>M</code> 舆图，<code>B / Esc</code> 恶魔城装备菜单。</p>
          <div class="cv-divider"></div>
          <p><strong>五大真气手搓绝技（方向指令紧接【斩】键瞬发）：</strong></p>
          <div class="grid-2col">
            <div class="item-card"><span class="motion-cmd">↓ ↘ → + 斩</span><strong>朔风破空斩</strong><span class="item-desc">依主手武器激发穿透剑气/烈焰刀波/苍龙枪芒</span></div>
            <div class="item-card"><span class="motion-cmd">← → + 斩</span><strong>瞬影一闪</strong><span class="item-desc">水墨残影无敌穿身三段剑痕</span></div>
            <div class="item-card"><span class="motion-cmd">↓ ↑ + 斩</span><strong>惊鸿升龙破</strong><span class="item-desc">无敌旱地拔葱纵斩防空</span></div>
            <div class="item-card"><span class="motion-cmd">↓ ↙ ← + 斩</span><strong>太极震气诀</strong><span class="item-desc">震碎周身敌方弹幕并震晕群妖</span></div>
            <div class="item-card"><span class="motion-cmd">← ↙ ↓ ↘ → + 斩</span><strong>九幽噬魂引</strong><span class="item-desc">全屏暗墨锁魂打击群敌并汲取气血</span></div>
          </div>
        </div>
      </div>
    `;
    this.uiLayer.appendChild(overlay);
    overlay.querySelector('#btn-close-guide')?.addEventListener('click', () => overlay.remove());
  }

  private launchGame(slot: ReturnType<typeof createFreshSaveSlot>): void {
    this.clearAllUI();
    this.buildCastlevaniaHud();
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
    this.lastMinimapSig = '';
    this.lastHudWpnKey = '';
    this.lastHudSubKey = '';
  }

  // ==================== 恶魔城经典左上角金属纹章斜切 HUD ====================
  private buildCastlevaniaHud(): void {
    const hud = document.createElement('div');
    hud.className = 'cv-hud';
    hud.innerHTML = `
      <div class="cv-status-cluster">
        <div class="cv-crest-frame" id="hud-wpn-crest" title="点击快速轮换主手兵器"></div>
        <div class="cv-crest-frame" id="hud-sub-crest" title="点击轮换奇门副器"></div>
        <div class="cv-bars-col">
          <div class="cv-hero-meta">
            <span class="cv-lv-num" id="hud-lv-num">LV 01</span>
            <span class="cv-name-tag" id="hud-hero-name">李逸承</span>
            <span class="cv-gold-tag" id="hud-gold-tag">80 两</span>
          </div>
          <div class="cv-skew-track">
            <div class="cv-skew-hp" id="hud-hp-fill" style="width:100%"></div>
            <span class="cv-skew-num" id="hud-hp-num">100/100</span>
          </div>
          <div class="cv-skew-track" style="width:168px;height:8px;">
            <div class="cv-skew-mp" id="hud-mp-fill" style="width:100%"></div>
            <span class="cv-skew-num" id="hud-mp-num">60/60</span>
          </div>
        </div>
      </div>

      <div class="cv-hud-right">
        <div class="cv-hud-btns">
          <button class="cv-btn" id="btn-hud-equip" style="padding:5px 11px;font-size:12px;">装备 [B]</button>
          <button class="cv-btn" id="btn-hud-map" style="padding:5px 11px;font-size:12px;">舆图 [M]</button>
        </div>
        <div class="cv-minimap-frame" id="minimap-box" title="点击展开全城堪舆方格地图">
          <canvas id="minimap-canvas" width="126" height="76"></canvas>
          <span class="cv-minimap-caption" id="minimap-caption">瓮城残垣 3.1%</span>
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
      wpnCrest: hud.querySelector('#hud-wpn-crest') as HTMLElement,
      subCrest: hud.querySelector('#hud-sub-crest') as HTMLElement,
      lvNum: hud.querySelector('#hud-lv-num') as HTMLElement,
      heroName: hud.querySelector('#hud-hero-name') as HTMLElement,
      goldTag: hud.querySelector('#hud-gold-tag') as HTMLElement,
      hpFill: hud.querySelector('#hud-hp-fill') as HTMLElement,
      hpNum: hud.querySelector('#hud-hp-num') as HTMLElement,
      mpFill: hud.querySelector('#hud-mp-fill') as HTMLElement,
      mpNum: hud.querySelector('#hud-mp-num') as HTMLElement,
      mapCaption: hud.querySelector('#minimap-caption') as HTMLElement,
      bossWrap: bossHud,
      bossName: bossHud.querySelector('#boss-hud-name') as HTMLElement,
      bossFill: bossHud.querySelector('#boss-hud-fill') as HTMLElement,
      interactBtn,
    };

    this.hudRefs.wpnCrest?.addEventListener('click', () => this.engine.cycleWeapon());
    this.hudRefs.subCrest?.addEventListener('click', () => {
      const s = this.engine.slot;
      if (!s || s.ownedSubWeapons.length <= 1) return;
      const idx = s.ownedSubWeapons.indexOf(s.equippedSubWeapon);
      s.equippedSubWeapon = s.ownedSubWeapons[(idx + 1) % s.ownedSubWeapons.length];
      AudioFX.playHit(false);
    });
    hud.querySelector('#btn-hud-equip')?.addEventListener('click', () => {
      this.pauseTab = 'equip';
      this.togglePauseModal();
    });
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

    if (this.hudRefs.lvNum) {
      this.hudRefs.lvNum.textContent = `LV ${String(s.level).padStart(2, '0')}`;
    }
    if (this.hudRefs.heroName) this.hudRefs.heroName.textContent = s.heroName;
    if (this.hudRefs.goldTag) this.hudRefs.goldTag.textContent = `${s.gold} 两`;

    const hpPct = Math.max(0, Math.min(100, (p.hp / Math.max(1, p.maxHp)) * 100));
    const mpPct = Math.max(0, Math.min(100, (p.mp / Math.max(1, p.maxMp)) * 100));
    if (this.hudRefs.hpFill) this.hudRefs.hpFill.style.width = `${hpPct}%`;
    if (this.hudRefs.hpNum) this.hudRefs.hpNum.textContent = `${Math.ceil(p.hp)}/${p.maxHp}`;
    if (this.hudRefs.mpFill) this.hudRefs.mpFill.style.width = `${mpPct}%`;
    if (this.hudRefs.mpNum) this.hudRefs.mpNum.textContent = `${Math.floor(p.mp)}/${p.maxMp}`;

    const wKey = `${w.id}:${s.ownedWeapons.length}`;
    if (wKey !== this.lastHudWpnKey && this.hudRefs.wpnCrest) {
      this.lastHudWpnKey = wKey;
      this.hudRefs.wpnCrest.innerHTML = `
        ${getWeaponSvg(w.archetype, w.color, w.glowColor)}
        ${s.ownedWeapons.length > 1 ? `<span class="cv-crest-badge">↻</span>` : ''}
      `;
    }

    const subKey = `${sub.id}:${s.talismanHearts}`;
    if (subKey !== this.lastHudSubKey && this.hudRefs.subCrest) {
      this.lastHudSubKey = subKey;
      this.hudRefs.subCrest.innerHTML = `
        ${getSubWeaponSvg(sub.id)}
        <span class="cv-crest-badge">${s.talismanHearts}</span>
      `;
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

    const playerCellX = Math.floor(p.x / 880);
    const playerCellY = Math.floor(p.y / 480);
    const mmSig = `${r.realm}:${r.id}:${playerCellX},${playerCellY}:${s.visitedRooms.length}`;
    if (mmSig !== this.lastMinimapSig) {
      this.lastMinimapSig = mmSig;
      const pct = WorldMap.calcExplorationPct(s.visitedRooms);
      if (this.hudRefs.mapCaption) {
        this.hudRefs.mapCaption.textContent = `${REGION_NAMES[r.region]} ${pct.toFixed(1)}%`;
      }
      this.drawMultiCellCastleMap(
        this.minimapCanvas,
        r.realm,
        r,
        playerCellX,
        playerCellY,
        s.visitedRooms,
        10,
        9
      );
    }
  }

  // ==================== 纯正恶魔城蓝底白墙多格大地图绘制 ====================
  private drawMultiCellCastleMap(
    canvas: HTMLCanvasElement | null,
    realm: CastleRealm,
    curRoom: BuiltRoom,
    playerLocalCellX: number,
    playerLocalCellY: number,
    visited: string[],
    cellW: number,
    cellH: number
  ): void {
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 经典恶魔城方格底网线
    const padX = Math.floor((canvas.width - MAP_GRID_TOTAL_W * cellW) * 0.5);
    const padY = Math.floor((canvas.height - MAP_GRID_TOTAL_H * cellH) * 0.5);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx <= MAP_GRID_TOTAL_W; gx++) {
      ctx.beginPath();
      ctx.moveTo(padX + gx * cellW, padY);
      ctx.lineTo(padX + gx * cellW, padY + MAP_GRID_TOTAL_H * cellH);
      ctx.stroke();
    }
    for (let gy = 0; gy <= MAP_GRID_TOTAL_H; gy++) {
      ctx.beginPath();
      ctx.moveTo(padX, padY + gy * cellH);
      ctx.lineTo(padX + MAP_GRID_TOTAL_W * cellW, padY + gy * cellH);
      ctx.stroke();
    }

    const visitedSet = new Set(visited);
    const rooms = WorldMap.getAllRooms(realm);

    for (const rm of rooms) {
      if (!visitedSet.has(`${realm}:${rm.id}`)) continue;

      const x = padX + rm.mapX * cellW;
      const y = padY + rm.mapY * cellH;
      const w = rm.gridW * cellW;
      const h = rm.gridH * cellH;

      // 恶魔城标志性配色：存档房红/金、传送阵翠绿、Boss房绯红、常规探索房皇家宝蓝！
      if (rm.special === 'save_shrine') ctx.fillStyle = '#d97706';
      else if (rm.special === 'warp_bagua') ctx.fillStyle = '#0d9488';
      else if (rm.special === 'boss_room') ctx.fillStyle = '#b91c1c';
      else ctx.fillStyle = realm === 'inverted' ? '#581c87' : '#1d4ed8';

      ctx.fillRect(x + 0.5, y + 0.5, w - 1, h - 1);

      // 白色城墙外轮廓线
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

      // 在真实门洞位置擦开缺口并点亮金色门标（一眼看出哪个房间还有岔路没去！）
      ctx.fillStyle = '#fde047';
      for (const d of rm.doors.left) {
        const dy = y + (d.offsetCell + 0.5) * cellH;
        ctx.fillRect(x - 1.5, dy - 2, 3, 4);
      }
      for (const d of rm.doors.right) {
        const dy = y + (d.offsetCell + 0.5) * cellH;
        ctx.fillRect(x + w - 1.5, dy - 2, 3, 4);
      }
      for (const d of rm.doors.up) {
        const dx = x + (d.offsetCell + 0.5) * cellW;
        ctx.fillRect(dx - 2, y - 1.5, 4, 3);
      }
      for (const d of rm.doors.down) {
        const dx = x + (d.offsetCell + 0.5) * cellW;
        ctx.fillRect(dx - 2, y + h - 1.5, 4, 3);
      }

      // 闪烁白色当前角色光标
      if (curRoom.realm === realm && curRoom.id === rm.id) {
        const cx = x + playerLocalCellX * cellW;
        const cy = y + playerLocalCellY * cellH;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + 2.5, cy + 2.5, Math.max(3, cellW - 5), Math.max(3, cellH - 5));
      }
    }
  }

  public toggleMapModal(): void {
    if (!this.engine.slot || !this.engine.room) return;
    if (this.modalEl && this.pauseTab === 'map') {
      this.closeModal();
      return;
    }
    this.pauseTab = 'map';
    this.mapViewRealm = this.engine.room.realm;
    this.renderCastlevaniaMenuModal();
  }

  public togglePauseModal(): void {
    if (!this.engine.slot) return;
    if (this.modalEl) {
      this.closeModal();
      return;
    }
    if (this.pauseTab === 'map') this.pauseTab = 'equip';
    this.previewItemId = null;
    this.renderCastlevaniaMenuModal();
  }

  // ==================== 核心：《恶魔城：月下夜想曲 / 晓月圆舞曲》经典分栏装备与系统窗口 ====================
  private renderCastlevaniaMenuModal(): void {
    if (!this.engine.slot || !this.engine.room) return;
    this.closeModal();

    const s = this.engine.slot;
    const p = this.engine.player;
    const pct = WorldMap.calcExplorationPct(s.visitedRooms);

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    let innerContent = '';

    if (this.pauseTab === 'equip') {
      innerContent = this.buildCastlevaniaEquipPaneHtml();
    } else if (this.pauseTab === 'map') {
      const hasInv = s.visitedRooms.some((k) => k.startsWith('inverted:'));
      innerContent = `
        <div class="cv-scroll-body" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;">
          <div style="display:flex;gap:10px;align-items:center;">
            <strong style="color:var(--cv-gold-bright);letter-spacing:2px;">
              ${this.mapViewRealm === 'inverted' ? '阴里 · 九幽倒悬里城' : '阳表 · 九幽玄城'}（总探索度 ${pct.toFixed(1)}%）
            </strong>
            ${
              hasInv
                ? `<button class="cv-btn" id="btn-switch-realm">切换表/里城舆图</button>`
                : ''
            }
          </div>
          <canvas id="fullmap-canvas" width="640" height="330" style="background:#050812;border:1.5px solid var(--cv-gold);max-width:100%;"></canvas>
          <div style="display:flex;gap:18px;flex-wrap:wrap;font-size:12px;color:var(--cv-muted);">
            <span><b style="color:#3b82f6">■</b> 已探索城阁</span>
            <span><b style="color:#d97706">■</b> 镇魂祠存档点</span>
            <span><b style="color:#0d9488">■</b> 太极八卦传送阵</span>
            <span><b style="color:#b91c1c">■</b> 守关妖王殿</span>
            <span><b style="color:#fde047">▪</b> 黄色缺口：未踏足门洞岔路</span>
          </div>
        </div>
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
              <span class="item-tag">真气消耗 ${sk.mpCost}</span>
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
          <div class="item-card ${owned ? 'equipped' : ''}" style="opacity:${owned ? 1 : 0.45}">
            <div class="item-card-top">
              <span class="item-name">${owned ? '✦ ' : '🔒 '}${meta.name}</span>
            </div>
            <div class="item-desc">${meta.subtitle} — ${meta.desc}</div>
          </div>`;
        })
        .join('');

      innerContent = `
        <div class="cv-scroll-body">
          <h4 style="margin:0 0 8px;color:var(--cv-gold-bright);letter-spacing:2px;">古武手搓绝学录（方向指令紧接【斩】键瞬发）</h4>
          <div class="grid-2col">${skCards}</div>
          <h4 style="margin:16px 0 8px;color:var(--cv-gold-bright);letter-spacing:2px;">玄城破障圣器与破妄双信物</h4>
          <div class="grid-2col">${abCards}</div>
        </div>
      `;
    } else if (this.pauseTab === 'lore') {
      innerContent = `
        <div class="cv-scroll-body">
          <div class="grid-2col">
            ${CHARACTER_BIOS.map(
              (b) => `
              <div class="item-card" style="flex-direction:row;align-items:center;gap:12px;">
                <div class="cv-portrait-frame">${getSpeakerPortraitSvg(b.name)}</div>
                <div>
                  <div class="item-name" style="color:${b.color}">${b.name}</div>
                  <div style="font-size:11px;color:var(--cv-gold);margin:2px 0 4px;">${b.ageTitle}</div>
                  <div class="item-desc">${b.summary}</div>
                </div>
              </div>`
            ).join('')}
          </div>
        </div>
      `;
    } else {
      const meta = SaveManager.getMeta();
      const mute = AudioFX.getMuteState();
      innerContent = `
        <div class="cv-scroll-body">
          <div style="display:flex;flex-direction:column;gap:12px;max-width:560px;">
            <div class="item-card">
              <div class="item-name">操控与声效设置</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">
                <button class="cv-btn" id="set-ctrl-style">
                  触屏摇杆：${meta.controlStyle === 'joystick' ? '动态跟随八向摇杆' : '固定底座八向摇杆'}
                </button>
                <button class="cv-btn" id="set-bgm-mute">古风配乐：${mute.bgmMuted ? '关闭' : '开启'}</button>
                <button class="cv-btn" id="set-sfx-mute">刀剑音效：${mute.sfxMuted ? '关闭' : '开启'}</button>
                <button class="cv-btn" id="set-fullscreen">全屏横屏锁定</button>
              </div>
            </div>

            <div class="item-card">
              <div class="item-name">评测体验百宝箱（一键试用全五系武器与轻功）</div>
              <div class="item-desc">想立即对比体验轻剑、斩马陌刀、点钢长枪、峨眉双刺、乌金九节鞭的挥砍模组与装备属性涨跌预览？可在此一键领取：</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">
                <button class="cv-btn cv-btn-gold" id="dev-all-weapons">领取全5系兵器+宝甲+妖丹</button>
                <button class="cv-btn" id="dev-all-abilities">习得全部破障轻功与信物</button>
              </div>
            </div>

            <div>
              <button class="cv-btn cv-btn-crimson" id="btn-quit-title">留档并返回标题画面</button>
            </div>
          </div>
        </div>
      `;
    }

    overlay.innerHTML = `
      <div class="cv-window">
        <div class="cv-win-header">
          <div class="cv-nav-tabs">
            <button class="cv-tab ${this.pauseTab === 'equip' ? 'active' : ''}" data-ptab="equip">装备 EQUIP</button>
            <button class="cv-tab ${this.pauseTab === 'skills' ? 'active' : ''}" data-ptab="skills">武学 SKILLS</button>
            <button class="cv-tab ${this.pauseTab === 'map' ? 'active' : ''}" data-ptab="map">舆图 MAP</button>
            <button class="cv-tab ${this.pauseTab === 'lore' ? 'active' : ''}" data-ptab="lore">列传 LORE</button>
            <button class="cv-tab ${this.pauseTab === 'settings' ? 'active' : ''}" data-ptab="settings">系统 SYSTEM</button>
          </div>
          <div class="cv-header-meta">
            <span>MAP ${pct.toFixed(1)}%</span>
            <span>GOLD ${s.gold}</span>
            <span>TIME ${this.formatPlayTime(s.playTimeSec)}</span>
            <button class="cv-btn" id="btn-close-pause" style="padding:4px 10px;">返回</button>
          </div>
        </div>
        ${innerContent}
      </div>
    `;

    this.uiLayer.appendChild(overlay);
    this.modalEl = overlay;
    this.syncBlockState();

    // 绑定通用导航
    overlay.querySelector('#btn-close-pause')?.addEventListener('click', () => this.closeModal());
    overlay.querySelectorAll<HTMLButtonElement>('[data-ptab]').forEach((b) => {
      b.onclick = () => {
        this.pauseTab = b.dataset.ptab as typeof this.pauseTab;
        this.previewItemId = null;
        this.renderCastlevaniaMenuModal();
      };
    });

    if (this.pauseTab === 'equip') {
      this.bindCastlevaniaEquipEvents(overlay);
    } else if (this.pauseTab === 'map') {
      const fullCanvas = overlay.querySelector('#fullmap-canvas') as HTMLCanvasElement;
      const pCellX = Math.floor(p.x / 880);
      const pCellY = Math.floor(p.y / 480);
      this.drawMultiCellCastleMap(
        fullCanvas,
        this.mapViewRealm,
        this.engine.room,
        pCellX,
        pCellY,
        s.visitedRooms,
        48,
        42
      );
      overlay.querySelector('#btn-switch-realm')?.addEventListener('click', () => {
        this.mapViewRealm = this.mapViewRealm === 'normal' ? 'inverted' : 'normal';
        this.renderCastlevaniaMenuModal();
      });
    } else if (this.pauseTab === 'settings') {
      this.bindSettingsEvents(overlay);
    }
  }

  private buildCastlevaniaEquipPaneHtml(): string {
    const s = this.engine.slot!;
    const p = this.engine.player;
    const curWpn = WEAPONS[s.equippedWeapon] || WEAPONS.sword_1;
    const curSub = SUB_WEAPONS[s.equippedSubWeapon] || SUB_WEAPONS.dagger_throw;
    const curArm = ARMORS[s.equippedArmor] || ARMORS.cloth_tunic;
    const curAcc = ARMORS[s.equippedAccessory] || ARMORS.broken_jade;
    const curCore = s.equippedYaoCore ? YAO_CORES[s.equippedYaoCore] : null;
    const totalPotions = Object.values(s.consumables).reduce((a, b) => a + b, 0);

    // 1. 左栏：恶魔城经典人物立绘框 + 6大装备部位槽
    const slotDefs: { key: EquipSlotCategory; label: string; icon: string; name: string }[] = [
      {
        key: 'weapon',
        label: '右手',
        icon: getWeaponSvg(curWpn.archetype, curWpn.color, curWpn.glowColor),
        name: curWpn.name,
      },
      {
        key: 'sub',
        label: '副器',
        icon: getSubWeaponSvg(curSub.id),
        name: curSub.name,
      },
      {
        key: 'armor',
        label: '衣甲',
        icon: getSlotCategorySvg('armor'),
        name: curArm.name,
      },
      {
        key: 'accessory',
        label: '佩饰',
        icon: getSlotCategorySvg('accessory'),
        name: curAcc.name,
      },
      {
        key: 'core',
        label: '妖丹',
        icon: getSlotCategorySvg('core'),
        name: curCore ? curCore.name : '— 未融炼 —',
      },
      {
        key: 'potion',
        label: '丹药',
        icon: getSlotCategorySvg('potion'),
        name: totalPotions > 0 ? `随身灵药 (${totalPotions})` : '— 空 —',
      },
    ];

    const slotsHtml = slotDefs
      .map(
        (sl) => `
        <div class="cv-paperdoll-slot ${this.selectedEquipSlot === sl.key ? 'selected' : ''}" data-slot-cat="${sl.key}">
          <span class="cv-slot-label">${sl.label}</span>
          ${sl.icon}
          <span class="cv-slot-val">${sl.name}</span>
        </div>`
      )
      .join('');

    // 2. 中栏：根据当前选中的部位槽，渲染对应恶魔城清单列表
    let listHeader = '';
    let listRowsHtml = '';
    let footerMain = '';
    let footerSub = '';

    if (this.selectedEquipSlot === 'weapon') {
      listHeader = '右手五系主兵器库（悬停预览属性涨跌，点击佩挂）';
      const focusW = WEAPONS[this.previewItemId || s.equippedWeapon] || curWpn;
      footerMain = `${focusW.name}  [攻击 +${focusW.atk} · 暴击 +${Math.round(focusW.critBonus * 100)}%]`;
      footerSub = `${focusW.traitDesc} —— ${focusW.desc}`;

      listRowsHtml = s.ownedWeapons
        .map((id) => {
          const w = WEAPONS[id];
          const eq = s.equippedWeapon === id;
          return `
          <div class="cv-inv-row ${eq ? 'is-equipped' : ''}" data-pick-id="${id}">
            <div class="cv-inv-left">
              ${getWeaponSvg(w.archetype, w.color, w.glowColor)}
              <div>
                <div style="font-size:13.5px;font-weight:800;color:#f8fafc;">${w.name}</div>
                <div style="font-size:11px;color:var(--cv-muted);">ATK +${w.atk}</div>
              </div>
            </div>
            ${eq ? `<span class="cv-eq-badge">E</span>` : ''}
          </div>`;
        })
        .join('');
    } else if (this.selectedEquipSlot === 'sub') {
      listHeader = '副手奇门法器（消耗灵符释放）';
      const focusSub =
        SUB_WEAPONS[(this.previewItemId as SubWeaponId) || s.equippedSubWeapon] || curSub;
      footerMain = `${focusSub.name}  [每次消耗灵符 ${focusSub.talismanCost}]`;
      footerSub = focusSub.desc;

      listRowsHtml = s.ownedSubWeapons
        .map((id) => {
          const sub = SUB_WEAPONS[id];
          const eq = s.equippedSubWeapon === id;
          return `
          <div class="cv-inv-row ${eq ? 'is-equipped' : ''}" data-pick-id="${id}">
            <div class="cv-inv-left">
              ${getSubWeaponSvg(sub.id)}
              <div>
                <div style="font-size:13.5px;font-weight:800;color:#f8fafc;">${sub.name}</div>
                <div style="font-size:11px;color:var(--cv-muted);">耗符 ${sub.talismanCost} · 威力 ${sub.baseDmg}</div>
              </div>
            </div>
            ${eq ? `<span class="cv-eq-badge">E</span>` : ''}
          </div>`;
        })
        .join('');
    } else if (this.selectedEquipSlot === 'armor' || this.selectedEquipSlot === 'accessory') {
      const targetSlot = this.selectedEquipSlot;
      listHeader = targetSlot === 'armor' ? '护身宝甲衣袍' : '随身奇珍玉佩';
      const curId = targetSlot === 'armor' ? s.equippedArmor : s.equippedAccessory;
      const focusArm = ARMORS[this.previewItemId || curId] || curArm;
      footerMain = `${focusArm.name}  [防御 +${focusArm.def} · 气血 +${focusArm.hpBonus} · 真气 +${focusArm.mpBonus}]`;
      footerSub = focusArm.desc;

      listRowsHtml = s.ownedArmors
        .filter((id) => ARMORS[id]?.slot === targetSlot)
        .map((id) => {
          const a = ARMORS[id];
          const eq = curId === id;
          return `
          <div class="cv-inv-row ${eq ? 'is-equipped' : ''}" data-pick-id="${id}">
            <div class="cv-inv-left">
              ${getSlotCategorySvg(targetSlot)}
              <div>
                <div style="font-size:13.5px;font-weight:800;color:#f8fafc;">${a.name}</div>
                <div style="font-size:11px;color:var(--cv-muted);">DEF +${a.def}</div>
              </div>
            </div>
            ${eq ? `<span class="cv-eq-badge">E</span>` : ''}
          </div>`;
        })
        .join('');
    } else if (this.selectedEquipSlot === 'core') {
      listHeader = '本命妖丹魂魄（致敬晓月圆舞曲 · 斩妖概率吸纳）';
      const focusCore = (this.previewItemId && YAO_CORES[this.previewItemId]) || curCore;
      footerMain = focusCore ? `${focusCore.name}（源自：${focusCore.monsterName}）` : '尚未融炼妖丹';
      footerSub = focusCore
        ? focusCore.desc
        : '在玄城内讨伐各类妖鬼时，李逸承胸前的玄鸟玉佩有几率将其妖丹吸纳化为己用！';

      listRowsHtml =
        s.ownedYaoCores.length === 0
          ? `<div style="padding:18px;color:var(--cv-muted);font-size:12.5px;">暂未收集到妖丹，多多斩杀城中纸人、冥火鬼、书妖即可掉落吸纳！</div>`
          : s.ownedYaoCores
              .map((id) => {
                const c = YAO_CORES[id];
                const eq = s.equippedYaoCore === id;
                return `
              <div class="cv-inv-row ${eq ? 'is-equipped' : ''}" data-pick-id="${id}">
                <div class="cv-inv-left">
                  ${getSlotCategorySvg('core')}
                  <div>
                    <div style="font-size:13.5px;font-weight:800;color:#f8fafc;">${c.name}</div>
                    <div style="font-size:11px;color:var(--cv-muted);">${c.monsterName}</div>
                  </div>
                </div>
                ${eq ? `<span class="cv-eq-badge">E</span>` : ''}
              </div>`;
              })
              .join('');
    } else {
      listHeader = '随身疗伤灵丹与佳酿（点击立即服用恢复）';
      const entries = Object.entries(s.consumables).filter(([, cnt]) => cnt > 0);
      const firstId = this.previewItemId || entries[0]?.[0];
      const focusCons = firstId ? CONSUMABLES[firstId] : null;
      footerMain = focusCons ? focusCons.name : '行囊丹药已空';
      footerSub = focusCons
        ? focusCons.desc
        : '可在子夜百鬼夜市白掌柜处购置伤药，或敲碎城中隐藏肉墙寻获荷叶叫花鸡！';

      listRowsHtml =
        entries.length === 0
          ? `<div style="padding:18px;color:var(--cv-muted);font-size:12.5px;">当前没有可服用的丹药。</div>`
          : entries
              .map(([id, cnt]) => {
                const c = CONSUMABLES[id];
                return `
              <div class="cv-inv-row" data-pick-id="${id}">
                <div class="cv-inv-left">
                  ${getSlotCategorySvg('potion')}
                  <div>
                    <div style="font-size:13.5px;font-weight:800;color:#f8fafc;">${c.name}</div>
                    <div style="font-size:11px;color:var(--cv-jade);">HP +${c.hpRestore} · MP +${c.mpRestore}</div>
                  </div>
                </div>
                <span style="font-weight:800;color:var(--cv-gold-bright);">×${cnt} 服用</span>
              </div>`;
              })
              .join('');
    }

    // 3. 右栏：经典恶魔城实时六维对比面板（绿字 ▲ / 红字 ▼！）
    const curStats = this.engine.computePreviewStats();
    const overrides: Parameters<GameEngine['computePreviewStats']>[0] = {};
    if (this.previewItemId) {
      if (this.selectedEquipSlot === 'weapon') overrides.weaponId = this.previewItemId;
      else if (this.selectedEquipSlot === 'armor') overrides.armorId = this.previewItemId;
      else if (this.selectedEquipSlot === 'accessory') overrides.accessoryId = this.previewItemId;
      else if (this.selectedEquipSlot === 'core') overrides.coreId = this.previewItemId;
    }
    const nextStats = this.engine.computePreviewStats(overrides);

    const fmtDiff = (cur: number, nxt: number): string => {
      if (nxt > cur) return `${cur} <span class="cv-stat-up">➔ ${nxt} ▲</span>`;
      if (nxt < cur) return `${cur} <span class="cv-stat-down">➔ ${nxt} ▼</span>`;
      return `${cur}`;
    };

    const nextExp = this.engine.getExpForNextLevel(s.level);

    return `
      <div class="cv-equip-grid">
        <div class="cv-pane-left">
          <div class="cv-portrait-card">
            <div class="cv-portrait-frame">${getSpeakerPortraitSvg(s.heroName)}</div>
            <div>
              <div style="font-size:15px;font-weight:900;color:var(--cv-gold-bright);letter-spacing:1.5px;">${s.heroName}</div>
              <div style="font-size:11.5px;color:var(--cv-jade);margin:2px 0;">LV.${s.level} · STATUS GOOD</div>
              <div style="font-size:11px;color:var(--cv-muted);">EXP ${s.exp} / ${nextExp}</div>
            </div>
          </div>
          ${slotsHtml}
        </div>

        <div class="cv-pane-center">
          <div class="cv-list-title">${listHeader}</div>
          ${listRowsHtml}
        </div>

        <div class="cv-pane-right">
          <div class="cv-stat-row"><span class="cv-stat-key">HP</span><span class="cv-stat-val">${Math.ceil(p.hp)}/${fmtDiff(curStats.maxHp, nextStats.maxHp)}</span></div>
          <div class="cv-stat-row"><span class="cv-stat-key">MP</span><span class="cv-stat-val">${Math.floor(p.mp)}/${fmtDiff(curStats.maxMp, nextStats.maxMp)}</span></div>
          <div class="cv-stat-row"><span class="cv-stat-key">HEART</span><span class="cv-stat-val">${s.talismanHearts}/99</span></div>
          <div class="cv-divider"></div>
          <div class="cv-stat-row"><span class="cv-stat-key">ATK 攻击</span><span class="cv-stat-val">${fmtDiff(curStats.atk, nextStats.atk)}</span></div>
          <div class="cv-stat-row"><span class="cv-stat-key">DEF 防御</span><span class="cv-stat-val">${fmtDiff(curStats.def, nextStats.def)}</span></div>
          <div class="cv-divider"></div>
          <div class="cv-stat-row"><span class="cv-stat-key">STR 臂力</span><span class="cv-stat-val">${fmtDiff(curStats.str, nextStats.str)}</span></div>
          <div class="cv-stat-row"><span class="cv-stat-key">CON 体魄</span><span class="cv-stat-val">${fmtDiff(curStats.con, nextStats.con)}</span></div>
          <div class="cv-stat-row"><span class="cv-stat-key">INT 神识</span><span class="cv-stat-val">${fmtDiff(curStats.int, nextStats.int)}</span></div>
          <div class="cv-stat-row"><span class="cv-stat-key">LCK 福缘</span><span class="cv-stat-val">${fmtDiff(curStats.lck, nextStats.lck)}</span></div>
        </div>
      </div>
      <div class="cv-desc-footer">
        <div class="cv-desc-main">${footerMain}</div>
        <div class="cv-desc-sub">${footerSub}</div>
      </div>
    `;
  }

  private bindCastlevaniaEquipEvents(overlay: HTMLElement): void {
    const s = this.engine.slot!;

    overlay.querySelectorAll<HTMLElement>('[data-slot-cat]').forEach((el) => {
      el.onclick = () => {
        AudioFX.playHit(false);
        this.selectedEquipSlot = el.dataset.slotCat as EquipSlotCategory;
        this.previewItemId = null;
        this.renderCastlevaniaMenuModal();
      };
    });

    overlay.querySelectorAll<HTMLElement>('[data-pick-id]').forEach((row) => {
      const id = row.dataset.pickId!;
      row.onmouseenter = () => {
        if (this.previewItemId !== id) {
          this.previewItemId = id;
          this.renderCastlevaniaMenuModal();
        }
      };
      row.onclick = () => {
        if (this.selectedEquipSlot === 'weapon') {
          s.equippedWeapon = id;
          this.engine.recalcStats(false);
          AudioFX.playSlash('light');
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
        this.renderCastlevaniaMenuModal();
      };
    });
  }

  private bindSettingsEvents(overlay: HTMLElement): void {
    const s = this.engine.slot!;
    overlay.querySelector('#set-ctrl-style')?.addEventListener('click', () => {
      const next = SaveManager.getMeta().controlStyle === 'joystick' ? 'dpad' : 'joystick';
      SaveManager.saveMeta({ controlStyle: next });
      this.engine.input.controlStyle = next;
      this.renderCastlevaniaMenuModal();
    });
    overlay.querySelector('#set-bgm-mute')?.addEventListener('click', () => {
      const m = AudioFX.getMuteState();
      AudioFX.setMute(m.sfxMuted, !m.bgmMuted);
      SaveManager.saveMeta({ bgmMuted: !m.bgmMuted });
      this.renderCastlevaniaMenuModal();
    });
    overlay.querySelector('#set-sfx-mute')?.addEventListener('click', () => {
      const m = AudioFX.getMuteState();
      AudioFX.setMute(!m.sfxMuted, m.bgmMuted);
      SaveManager.saveMeta({ sfxMuted: !m.sfxMuted });
      this.renderCastlevaniaMenuModal();
    });
    overlay.querySelector('#set-fullscreen')?.addEventListener('click', () => {
      NativeApp.requestFullscreenAndLandscape();
    });

    overlay.querySelector('#dev-all-weapons')?.addEventListener('click', () => {
      for (const id of ['sword_1', 'sword_2', 'greatsword_1', 'spear_1', 'daggers_1', 'whip_1']) {
        if (!s.ownedWeapons.includes(id)) s.ownedWeapons.push(id);
      }
      for (const id of ['cloud_brocade', 'mingguang_armor', 'tiger_tally', 'qingxin_bell']) {
        if (!s.ownedArmors.includes(id)) s.ownedArmors.push(id);
      }
      for (const id of ['core_paper', 'core_yaksha']) {
        if (!s.ownedYaoCores.includes(id)) s.ownedYaoCores.push(id);
      }
      s.ownedSubWeapons = ['dagger_throw', 'holy_fire', 'bagua_cross', 'mountain_seal', 'sword_orbit'];
      s.talismanHearts = 60;
      AudioFX.playRelicBell();
      this.pauseTab = 'equip';
      this.renderCastlevaniaMenuModal();
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
      this.renderCastlevaniaMenuModal();
    });

    overlay.querySelector('#btn-quit-title')?.addEventListener('click', () => {
      if (s.slotIndex <= 3) SaveManager.saveSlot(s);
      this.showTitleScreen();
    });
  }

  // ==================== 铸剑坊 / 鬼市商店 / 太极八卦传送阵 ====================
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
              <div class="item-card-top">
                <span class="item-name">${w.name}</span>
                <span class="item-tag">神品化境</span>
              </div>
              <div class="item-desc">此兵刃已锤炼至极致品阶！</div>
            </div>`;
          }
          const nextW = WEAPONS[w.upgradeTo];
          return `
          <div class="item-card">
            <div class="item-card-top">
              <span class="item-name">${w.name} ➔ ${nextW.name}</span>
              <span class="item-tag">ATK ${w.atk} ➔ ${nextW.atk}</span>
            </div>
            <div class="item-desc">${nextW.desc}</div>
            <button class="cv-btn cv-btn-crimson" data-smith-upg="${id}">
              消耗 ${w.upgradeCost} 两银子淬火升阶
            </button>
          </div>`;
        })
        .join('');

      overlay.innerHTML = `
        <div class="cv-window">
          <div class="cv-win-header">
            <strong style="color:var(--cv-gold-bright);letter-spacing:2px;">赤火铸剑庐 · 独臂神匠欧冶残（银两 ${s.gold}）</strong>
            <button class="cv-btn" id="btn-close-submodal">辞别</button>
          </div>
          <div class="cv-scroll-body">
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
      const shopArmors = [
        'cloud_brocade',
        'mingguang_armor',
        'tiger_tally',
        'qingxin_bell',
        'fortune_gourd',
      ];
      const shopItems = ['jinchuang_yao', 'huiqi_dan', 'beggar_chicken', 'osmanthus_wine'];

      const wHtml = shopWeapons
        .map((id) => {
          const w = WEAPONS[id];
          const owned = s.ownedWeapons.includes(id);
          return `
          <div class="item-card ${owned ? 'equipped' : ''}">
            <div class="item-card-top">
              <span class="item-name">${w.name}</span>
              <span class="item-tag">${w.price} 两</span>
            </div>
            <div class="item-desc">${w.traitDesc}</div>
            <button class="cv-btn cv-btn-gold" data-buy-wpn="${id}" ${owned ? 'disabled' : ''}>
              ${owned ? '已收入囊中' : `购入 (${w.price}两)`}
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
              <span class="item-tag">DEF+${a.def} · ${a.price}两</span>
            </div>
            <div class="item-desc">${a.desc}</div>
            <button class="cv-btn cv-btn-gold" data-buy-arm="${id}" ${owned ? 'disabled' : ''}>
              ${owned ? '已收入囊中' : `购入 (${a.price}两)`}
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
              <span class="item-name">${c.name} (持有 ${cnt})</span>
              <span class="item-tag">${c.price} 两</span>
            </div>
            <div class="item-desc">${c.desc}</div>
            <button class="cv-btn" data-buy-cons="${id}">购置一份</button>
          </div>`;
        })
        .join('');

      overlay.innerHTML = `
        <div class="cv-window">
          <div class="cv-win-header">
            <strong style="color:var(--cv-gold-bright);letter-spacing:2px;">子夜百鬼夜市 · 狐商白掌柜（持有银两 ${s.gold}）</strong>
            <button class="cv-btn" id="btn-close-submodal">离开</button>
          </div>
          <div class="cv-scroll-body">
            <h4 style="margin:0 0 6px;color:var(--cv-gold-bright);">五系名兵</h4>
            <div class="grid-2col">${wHtml}</div>
            <h4 style="margin:14px 0 6px;color:var(--cv-gold-bright);">宝甲与佩饰</h4>
            <div class="grid-2col">${aHtml}</div>
            <h4 style="margin:14px 0 6px;color:var(--cv-gold-bright);">灵药与酒食</h4>
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
        <div class="cv-window" style="max-width:520px;height:auto;">
          <div class="cv-win-header">
            <strong style="color:var(--cv-gold-bright);letter-spacing:2px;">太极八卦缩地挪移阵</strong>
            <button class="cv-btn" id="btn-close-submodal">取消</button>
          </div>
          <div class="cv-scroll-body" style="display:flex;flex-direction:column;gap:8px;">
            ${warps
              .map(
                (w) => `
              <button class="cv-btn cv-btn-gold" data-warp-realm="${w.realm}" data-warp-id="${w.id}">
                挪移至：${w.label}
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

  // ==================== 带高清角色半身立绘的恶魔城古典剧情对话框 ====================
  public startStoryDialogue(scene: StoryScene, onDone?: () => void): void {
    if (this.dialogueEl) this.dialogueEl.remove();
    let idx = 0;

    const box = document.createElement('div');
    box.className = 'cv-dialogue';
    this.uiLayer.appendChild(box);
    this.dialogueEl = box;
    this.syncBlockState();

    const renderLine = () => {
      const ln = scene.lines[idx];
      box.innerHTML = `
        <div class="cv-dlg-portrait">${getSpeakerPortraitSvg(ln.speaker)}</div>
        <div class="cv-dlg-content">
          <div>
            <div class="dialogue-speaker-row">
              <div>
                <span class="dialogue-speaker" style="color:${ln.portraitColor}">${ln.speaker}</span>
                <span class="dialogue-role">${ln.role}</span>
              </div>
              <span style="font-size:11px;color:var(--cv-muted);">${scene.title} (${idx + 1}/${scene.lines.length})</span>
            </div>
            <div class="dialogue-text">${ln.text}</div>
          </div>
          <div class="dialogue-next">点击继续对话 ▸</div>
        </div>
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

  public showGameOverModal(): void {
    this.closeModal();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="cv-window" style="max-width:460px;height:auto;text-align:center;">
        <div class="cv-win-header">
          <strong style="color:#fca5a5;letter-spacing:2px;">气血耗尽 · 魂归镇魂祠</strong>
        </div>
        <div class="cv-scroll-body" style="display:flex;flex-direction:column;gap:12px;">
          <p style="color:#d6cbb8;line-height:1.65;">少年力竭，但胸前玄鸟残佩护住了李逸承最后一缕心脉。是否借镇魂灯光重返玄城？</p>
          <button class="cv-btn cv-btn-crimson" id="btn-revive-shrine">在最近存档祠堂重整再战</button>
          <button class="cv-btn" id="btn-gameover-title">返回标题卷宗</button>
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

    const title =
      kind === 'true'
        ? '真结局达成 ·《破晓斩冥》'
        : kind === 'boss_rush'
          ? '百鬼试炼 · 全妖王讨伐制霸'
          : '结局一 ·《折剑归尘》（尚有隐藏倒悬里城未开启）';

    const desc =
      kind === 'true'
        ? `十八岁少年李逸承踏破表里双城（探索度 ${pct.toFixed(1)}%），救回恩师裴无极，斩灭太古尸仙烛阴！<br/><strong style="color:var(--cv-jade)">现已解锁隐藏双模式：【少统领·萧断水模式】与【百鬼试炼 Boss Rush】！</strong>`
        : kind === 'boss_rush'
          ? `连斩七大妖王通关！总计用时：<strong>${this.formatPlayTime(timeSec)}</strong>。`
          : `你击败了被控制的恩师，但真正的幕后黑手仍盘踞在隐藏的【九幽倒悬里城】！<br/><strong style="color:var(--cv-gold-bright)">提示：返回祭坛祠堂后，前往藏书阁绝顶取【破妄古镜】、幽冥水牢秘窟取【完整玄鸟佩】，再战裴无极斩碎头顶蚀心蛊即可翻转天地开启倒悬里城！</strong>`;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="cv-window" style="max-width:560px;height:auto;text-align:center;">
        <div class="cv-win-header">
          <strong style="color:var(--cv-gold-bright);letter-spacing:2px;">${title}</strong>
        </div>
        <div class="cv-scroll-body" style="display:flex;flex-direction:column;gap:14px;">
          <p style="line-height:1.7;font-size:14px;">${desc}</p>
          <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
            ${
              kind === 'normal'
                ? `<button class="cv-btn cv-btn-gold" id="btn-continue-hunt">返回祭坛祠堂继续寻宝开里城</button>`
                : ''
            }
            <button class="cv-btn" id="btn-end-title">返回主菜单</button>
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
      this.engine.loadRoom(saveRoom, saveRoom.focalX, saveRoom.focalY, true);
    });
    overlay.querySelector('#btn-end-title')?.addEventListener('click', () => {
      this.showTitleScreen();
    });
  }
}
