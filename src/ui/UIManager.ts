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
import { WorldMap } from '../data/worldMap';
import { Assets } from '../game/AssetLoader';
import { drawInkSlashRibbon, renderModularLiYichengRig } from '../game/CharacterArt';
import { ActiveSlash, GameEngine } from '../game/GameEngine';
import { createFreshSaveSlot, SaveManager } from '../meta/SaveManager';
import { NativeApp } from '../platform/NativeAppBridge';
import { SkillId, StoryScene, SubWeaponId } from '../types';
import {
  getSlotCategorySvg,
  getSpeakerPortraitSvg,
  getSubWeaponSvg,
  getWeaponArtHtml,
} from './Icons';

type EquipSlotCategory = 'weapon' | 'sub' | 'armor' | 'accessory' | 'core' | 'potion';

export class UIManager {
  private hudEl: HTMLElement | null = null;
  private modalEl: HTMLElement | null = null;
  private dialogueEl: HTMLElement | null = null;
  private bannerEl: HTMLElement | null = null;
  private stageRafId = 0;
  private stageSlash: ActiveSlash | null = null;

  private hudRefs: {
    lvSeal?: HTMLElement;
    hpTrail?: HTMLElement;
    hpFill?: HTMLElement;
    mpFill?: HTMLElement;
    wpnIconWrap?: HTMLElement;
    wpnName?: HTMLElement;
    swapHint?: HTMLElement;
    bossWrap?: HTMLElement;
    bossName?: HTMLElement;
    bossTrail?: HTMLElement;
    bossFill?: HTMLElement;
    interactBtn?: HTMLElement;
  } = {};

  private pauseTab: 'equip' | 'skills' | 'map' | 'lore' | 'settings' = 'equip';
  private selectedEquipSlot: EquipSlotCategory = 'weapon';
  private previewItemId: string | null = null;
  private lastHudWpnKey = '';

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
    const root = document.createElement('div');
    root.className = 'zx-title-screen';

    root.innerHTML = `
      <div class="zx-brand-block">
        <div class="zx-red-stamp">镇妖司密录</div>
        <div>
          <h1 class="zx-main-title">玄城夜行</h1>
          <div class="zx-subtitle">卷 壹 · 血 月 瓮 城</div>
        </div>
      </div>

      <div class="zx-menu-list">
        ${
          slot1
            ? `<button class="zx-menu-item" id="btn-continue-slot">
                 <span>再续前尘</span>
                 <span class="zx-menu-sub">${slot1.heroName} · 境界 ${slot1.level}</span>
               </button>`
            : ''
        }
        <button class="zx-menu-item" id="btn-new-journey">
          <span>踏入玄城</span>
          <span class="zx-menu-sub">新启卷壹 · 少年李逸承</span>
        </button>
        <button class="zx-menu-item" id="btn-title-moves">
          <span>剑诀要术</span>
          <span class="zx-menu-sub">手搓真气绝学与键位</span>
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
      this.launchGame(fresh);
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
        <span style="font-size:20px;font-weight:900;letter-spacing:5px;color:var(--bronze-light);">镇妖司剑诀秘要</span>
        <button class="zx-seal-btn" id="btn-close-guide">返回</button>
      </div>
      <div style="flex:1;overflow-y:auto;padding:18px 0;line-height:1.8;font-size:14.5px;max-width:780px;">
        <p><strong>键鼠 / 手柄操控：</strong><code>A / D</code> 疾奔，<code>J / Z</code> 挥斩连段，<code>K / 空格</code> 轻功腾跃（半空 <code>↓ + K</code> 下穿阁楼），<code>L / Shift</code> 疾退残影步，<code>Q</code> 双主手神兵瞬切，<code>U</code> 奇门副器，<code>H</code> 服药，<code>B / Esc</code> 兵匣武库。</p>
        <p><strong>触屏手搓操控：</strong>左半屏滑动八向摇杆移动与划弧搓招，右侧依次为【斩】【跃】【身】【符】【药】。</p>
        <div style="margin-top:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px;">
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

  private launchGame(slot: ReturnType<typeof createFreshSaveSlot>): void {
    this.clearAllUI();
    this.buildActionGameHud();
    this.engine.startSession(slot);
    this.syncBlockState();
  }

  private clearAllUI(): void {
    this.stopStageLoop();
    this.uiLayer.innerHTML = '';
    this.hudEl = null;
    this.modalEl = null;
    this.dialogueEl = null;
    this.bannerEl = null;
    this.hudRefs = {};
    this.lastHudWpnKey = '';
  }

  // ==================== 《斩妖行 / 暖雪》主机级国风左上角 HUD ====================
  private buildActionGameHud(): void {
    const hud = document.createElement('div');
    hud.className = 'zx-hud';
    hud.innerHTML = `
      <div class="zx-hud-left">
        <div class="zx-medallion">
          <img src="${Assets.getUrl('portrait_liyicheng')}" alt="李逸承" />
          <span class="zx-lv-seal" id="hud-lv-seal">境·壹</span>
        </div>
        <div class="zx-gauges">
          <div class="zx-hp-track">
            <div class="zx-hp-trail" id="hud-hp-trail" style="width:100%"></div>
            <div class="zx-hp-fill" id="hud-hp-fill" style="width:100%"></div>
          </div>
          <div class="zx-mp-track">
            <div class="zx-mp-fill" id="hud-mp-fill" style="width:100%"></div>
          </div>
          <div class="zx-weapon-sheath" id="hud-wpn-sheath" title="点击或按 [Q] 瞬间切换主手神兵">
            <span id="hud-wpn-icon"></span>
            <span class="zx-wpn-name" id="hud-wpn-name">青竹寒铁剑</span>
            <span class="zx-swap-hint" id="hud-swap-hint"></span>
          </div>
        </div>
      </div>

      <div class="zx-hud-right">
        <button class="zx-seal-btn" id="btn-hud-arsenal">兵匣 [B]</button>
        <button class="zx-seal-btn" id="btn-hud-skills">剑诀</button>
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
      wpnIconWrap: hud.querySelector('#hud-wpn-icon') as HTMLElement,
      wpnName: hud.querySelector('#hud-wpn-name') as HTMLElement,
      swapHint: hud.querySelector('#hud-swap-hint') as HTMLElement,
      bossWrap: bossBar,
      bossName: bossBar.querySelector('#boss-hud-name') as HTMLElement,
      bossTrail: bossBar.querySelector('#boss-hud-trail') as HTMLElement,
      bossFill: bossBar.querySelector('#boss-hud-fill') as HTMLElement,
      interactBtn,
    };

    hud.querySelector('#hud-wpn-sheath')?.addEventListener('click', () => this.engine.cycleWeapon());
    hud.querySelector('#btn-hud-arsenal')?.addEventListener('click', () => {
      this.pauseTab = 'equip';
      this.togglePauseModal();
    });
    hud.querySelector('#btn-hud-skills')?.addEventListener('click', () => {
      this.pauseTab = 'skills';
      this.togglePauseModal();
    });
    interactBtn.addEventListener('click', () => this.engine.input.triggerInteractFromUI());
  }

  public syncHud(): void {
    const s = this.engine.slot;
    const r = this.engine.room;
    if (!s || !r || !this.hudEl) return;

    const p = this.engine.player;
    const w = WEAPONS[s.equippedWeapon] || WEAPONS.sword_1;

    if (this.hudRefs.lvSeal) this.hudRefs.lvSeal.textContent = `Lv.${s.level}`;

    const hpPct = Math.max(0, Math.min(100, (p.hp / Math.max(1, p.maxHp)) * 100));
    const trailPct = Math.max(0, Math.min(100, (p.hpTrail / Math.max(1, p.maxHp)) * 100));
    const mpPct = Math.max(0, Math.min(100, (p.mp / Math.max(1, p.maxMp)) * 100));

    if (this.hudRefs.hpFill) this.hudRefs.hpFill.style.width = `${hpPct}%`;
    if (this.hudRefs.hpTrail) this.hudRefs.hpTrail.style.width = `${trailPct}%`;
    if (this.hudRefs.mpFill) this.hudRefs.mpFill.style.width = `${mpPct}%`;

    const wKey = `${w.id}:${s.ownedWeapons.length}`;
    if (wKey !== this.lastHudWpnKey) {
      this.lastHudWpnKey = wKey;
      if (this.hudRefs.wpnIconWrap) {
        this.hudRefs.wpnIconWrap.innerHTML = getWeaponArtHtml(w.archetype, 56);
      }
      if (this.hudRefs.wpnName) this.hudRefs.wpnName.textContent = w.name;
      if (this.hudRefs.swapHint) {
        this.hudRefs.swapHint.textContent = s.ownedWeapons.length > 1 ? '[Q 易兵]' : '';
      }
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
  }

  public toggleMapModal(): void {
    if (!this.engine.slot) return;
    if (this.modalEl && this.pauseTab === 'map') {
      this.closeModal();
      return;
    }
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
      const abCards = (['double_jump'] as const)
        .map((key) => {
          const meta = ABILITIES_META[key];
          const owned = s.abilities.includes(key);
          return `
          <div class="zx-item-row ${owned ? 'equipped' : ''}" style="opacity:${owned ? 1 : 0.5};cursor:default;">
            <div>
              <strong style="font-size:15px;color:var(--bronze-light);">${owned ? '✦ ' : '未破封 · '}${meta.name}</strong>
              <div style="font-size:12.5px;color:#cbd5e1;margin-top:4px;">${meta.desc}</div>
            </div>
          </div>`;
        })
        .join('');

      mainHtml = `
        <div style="flex:1;overflow-y:auto;padding:16px 0;">
          <div style="font-size:14px;color:var(--bronze);letter-spacing:3px;margin-bottom:10px;">真气手搓武学（摇杆/方向键划出轨迹紧接【斩】瞬发）</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px;">
            ${this.buildSkillCardsHtml()}
          </div>
          <div style="font-size:14px;color:var(--bronze);letter-spacing:3px;margin:20px 0 10px;">卷壹 · 轻功秘传</div>
          <div style="max-width:540px;">${abCards}</div>
        </div>
      `;
      footerLeft = '老练剑客亦可在未拾得秘卷时直接凭指令盲搓释放奥义';
    } else if (this.pauseTab === 'map') {
      const rooms = WorldMap.getAllRooms('normal');
      const curId = this.engine.room.id;
      mainHtml = `
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;">
          <div style="font-size:16px;letter-spacing:4px;color:var(--bronze-light);">卷壹 · 血月瓮城堪舆长卷</div>
          <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;justify-content:center;">
            ${rooms
              .map((rm, idx) => {
                const visited = s.visitedRooms.includes(`normal:${rm.id}`);
                const active = rm.id === curId;
                return `
                <div style="padding:18px 24px;min-width:190px;text-align:center;background:${
                  active ? 'rgba(136,19,19,0.65)' : 'rgba(10,15,28,0.8)'
                };border:1.5px solid ${active ? 'var(--bronze-light)' : 'var(--bronze-line)'};opacity:${
                  visited ? 1 : 0.4
                };">
                  <div style="font-size:11px;color:var(--jade);letter-spacing:2px;">第${['一', '二', '三'][idx]}幕</div>
                  <div style="font-size:17px;font-weight:900;color:var(--rice);margin:6px 0;">${
                    visited ? rm.name : '迷雾未开'
                  }</div>
                  <div style="font-size:11.5px;color:var(--ash);">${
                    active ? '◆ 李逸承当前所在' : rm.special === 'save_shrine' ? '镇魂祠存档点' : rm.bossKind ? '守关妖宗殿' : '护城古桥'
                  }</div>
                </div>
                ${idx < rooms.length - 1 ? `<span style="color:var(--bronze);font-size:20px;">━━━</span>` : ''}
                `;
              })
              .join('')}
          </div>
        </div>
      `;
      footerLeft = '击败奉天残殿【万卷妖宗·墨千秋】习得二段跳后，可折返瓮城镇魂古祠跃上谯楼高阁取名剑';
    } else if (this.pauseTab === 'lore') {
      mainHtml = `
        <div style="flex:1;overflow-y:auto;padding:16px 0;display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:14px;">
          ${CHARACTER_BIOS.slice(0, 4)
            .map(
              (b) => `
              <div class="zx-item-row" style="gap:14px;align-items:center;cursor:default;">
                <div class="cv-dlg-portrait">${getSpeakerPortraitSvg(b.name)}</div>
                <div>
                  <div style="font-size:16px;font-weight:900;color:${b.color};letter-spacing:2px;">${b.name}</div>
                  <div style="font-size:11.5px;color:var(--bronze);margin:3px 0 6px;">${b.ageTitle}</div>
                  <div style="font-size:12.5px;color:#cbd5e1;line-height:1.55;">${b.summary}</div>
                </div>
              </div>`
            )
            .join('')}
        </div>
      `;
      footerLeft = '镇妖司人物密档';
    } else {
      const mute = AudioFX.getMuteState();
      mainHtml = `
        <div style="flex:1;padding:20px 0;display:flex;flex-direction:column;gap:14px;max-width:520px;">
          <div class="zx-item-row" style="cursor:default;flex-direction:column;align-items:flex-start;gap:10px;">
            <strong style="color:var(--bronze-light);letter-spacing:2px;">视听与全屏</strong>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <button class="zx-seal-btn" id="set-bgm-mute">古琴配乐：${mute.bgmMuted ? '已静音' : '开启'}</button>
              <button class="zx-seal-btn" id="set-sfx-mute">金石刀音：${mute.sfxMuted ? '已静音' : '开启'}</button>
              <button class="zx-seal-btn" id="set-fullscreen">全屏横屏锁定</button>
            </div>
          </div>

          <div class="zx-item-row" style="cursor:default;flex-direction:column;align-items:flex-start;gap:10px;">
            <strong style="color:var(--bronze-light);letter-spacing:2px;">快速试兵台（方便直接测试双武器与二段跳）</strong>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <button class="zx-seal-btn" id="dev-grant-pack">一键配齐双系名剑+斩马陌刀+踏云步</button>
            </div>
          </div>

          <div>
            <button class="zx-seal-btn" id="btn-quit-title" style="border-color:#ef4444;color:#fca5a5;">留档并退回标题画卷</button>
          </div>
        </div>
      `;
      footerLeft = '系统卷宗设定';
    }

    overlay.innerHTML = `
      <div class="zx-arsenal-topbar">
        <div class="zx-arsenal-tabs">
          <button class="zx-atab ${this.pauseTab === 'equip' ? 'active' : ''}" data-ptab="equip">兵匣</button>
          <button class="zx-atab ${this.pauseTab === 'skills' ? 'active' : ''}" data-ptab="skills">剑诀</button>
          <button class="zx-atab ${this.pauseTab === 'map' ? 'active' : ''}" data-ptab="map">堪舆</button>
          <button class="zx-atab ${this.pauseTab === 'lore' ? 'active' : ''}" data-ptab="lore">列传</button>
          <button class="zx-atab ${this.pauseTab === 'settings' ? 'active' : ''}" data-ptab="settings">系统</button>
        </div>
        <button class="zx-seal-btn" id="btn-close-pause">归阵 [ESC]</button>
      </div>
      ${mainHtml}
      <div class="zx-arsenal-footer">
        <span style="font-size:13.5px;color:var(--bronze-light);">${footerLeft}</span>
        <span style="font-size:12.5px;color:var(--ash);">${footerRight}</span>
      </div>
    `;

    this.uiLayer.appendChild(overlay);
    this.modalEl = overlay;
    this.syncBlockState();

    overlay.querySelector('#btn-close-pause')?.addEventListener('click', () => this.closeModal());
    overlay.querySelectorAll<HTMLButtonElement>('[data-ptab]').forEach((b) => {
      b.onclick = () => {
        this.pauseTab = b.dataset.ptab as typeof this.pauseTab;
        this.previewItemId = null;
        this.renderArsenalModal();
      };
    });

    if (this.pauseTab === 'equip') {
      this.bindEquipEventsAndLiveStage(overlay);
    } else if (this.pauseTab === 'settings') {
      this.bindSettingsEvents(overlay);
    }
  }

  private buildEquipColumnsHtml(): { html: string; footer: string } {
    const s = this.engine.slot!;
    const p = this.engine.player;
    const curWpn = WEAPONS[s.equippedWeapon] || WEAPONS.sword_1;
    const curSub = SUB_WEAPONS[s.equippedSubWeapon] || SUB_WEAPONS.dagger_throw;
    const curArm = ARMORS[s.equippedArmor] || ARMORS.cloth_tunic;
    const curAcc = ARMORS[s.equippedAccessory] || ARMORS.broken_jade;
    const curCore = s.equippedYaoCore ? YAO_CORES[s.equippedYaoCore] : null;
    const potCnt = Object.values(s.consumables).reduce((a, b) => a + b, 0);

    const slots: { key: EquipSlotCategory; cat: string; cur: string }[] = [
      { key: 'weapon', cat: '主手兵刃', cur: curWpn.name },
      { key: 'sub', cat: '奇门副器', cur: curSub.name },
      { key: 'armor', cat: '护身衣甲', cur: curArm.name },
      { key: 'accessory', cat: '随身佩玉', cur: curAcc.name },
      { key: 'core', cat: '本命妖丹', cur: curCore ? curCore.name : '未融炼' },
      { key: 'potion', cat: '疗伤丹药', cur: potCnt > 0 ? `持有 ${potCnt} 份` : '已空' },
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
      footerTxt = `【${focusW.name}】${focusW.traitDesc} —— ${focusW.desc}`;
      rowsHtml = s.ownedWeapons
        .map((id) => {
          const w = WEAPONS[id];
          const eq = s.equippedWeapon === id;
          return `
          <div class="zx-item-row ${eq ? 'equipped' : ''}" data-pick-id="${id}">
            <div style="display:flex;align-items:center;gap:14px;">
              ${getWeaponArtHtml(w.archetype, 82)}
              <div>
                <div style="font-size:15px;font-weight:900;color:var(--rice);">${w.name}</div>
                <div style="font-size:11.5px;color:var(--ash);">杀伤 +${w.atk} · ${w.archetype === 'greatsword' ? '重刃破盾' : '轻灵连斩'}</div>
              </div>
            </div>
            ${eq ? `<span class="zx-eq-seal">佩挂中</span>` : ''}
          </div>`;
        })
        .join('');
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
          return `
          <div class="zx-item-row ${eq ? 'equipped' : ''}" data-pick-id="${id}">
            <div style="display:flex;align-items:center;gap:12px;">
              ${getSlotCategorySvg(target)}
              <div>
                <div style="font-size:15px;font-weight:900;color:var(--rice);">${a.name}</div>
                <div style="font-size:11.5px;color:var(--ash);">护体 +${a.def}</div>
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
      footerTxt = '点击丹药即可当场服用恢复气血真气（局内亦可按 [H] 快捷服药）';
      const entries = Object.entries(s.consumables).filter(([, c]) => c > 0);
      rowsHtml =
        entries.length === 0
          ? `<div style="padding:18px;color:var(--ash);font-size:13px;">行囊中暂无丹药。</div>`
          : entries
              .map(([id, cnt]) => {
                const c = CONSUMABLES[id];
                return `
              <div class="zx-item-row" data-pick-id="${id}">
                <div style="display:flex;align-items:center;gap:12px;">
                  ${getSlotCategorySvg('potion')}
                  <div>
                    <div style="font-size:15px;font-weight:900;color:var(--rice);">${c.name} ×${cnt}</div>
                    <div style="font-size:11.5px;color:var(--jade);">气血 +${c.hpRestore} · 真气 +${c.mpRestore}</div>
                  </div>
                </div>
                <span class="zx-eq-seal" style="background:#115e59;border-color:#2dd4bf;">服用</span>
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
          <canvas id="equip-stage-canvas" width="230" height="240"></canvas>
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

    // 启动左侧 60fps 真人骨骼动态持兵试演舞台！
    const stageCanvas = overlay.querySelector('#equip-stage-canvas') as HTMLCanvasElement | null;
    if (stageCanvas) {
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
        sctx.ellipse(115, 204, 72, 14, 0, 0, Math.PI * 2);
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

        renderModularLiYichengRig(sctx, {
          x: 105,
          y: 202,
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
          scale: 1.45,
        });

        if (this.stageSlash) {
          const isHeavy = this.stageSlash.archetype === 'greatsword';
          if (!isHeavy || this.stageSlash.progress >= 0.3) {
            const p = isHeavy ? (this.stageSlash.progress - 0.3) / 0.7 : this.stageSlash.progress;
            drawInkSlashRibbon(
              sctx,
              108,
              146,
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
    overlay.querySelector('#dev-grant-pack')?.addEventListener('click', () => {
      for (const id of ['sword_1', 'sword_2', 'greatsword_1', 'greatsword_2']) {
        if (!s.ownedWeapons.includes(id)) s.ownedWeapons.push(id);
      }
      if (!s.abilities.includes('double_jump')) s.abilities.push('double_jump');
      s.ownedSubWeapons = ['dagger_throw', 'holy_fire', 'bagua_cross'];
      s.talismanHearts = 50;
      AudioFX.playRelicBell();
      this.pauseTab = 'equip';
      this.renderArsenalModal();
    });
    overlay.querySelector('#btn-quit-title')?.addEventListener('click', () => {
      SaveManager.saveSlot(s);
      this.showTitleScreen();
    });
  }

  public openInteractModal(_kind: 'smith' | 'merchant' | 'warp'): void {
    this.togglePauseModal();
  }

  public closeModal(): void {
    this.stopStageLoop();
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
    this.syncBlockState();
  }

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
          <div class="dialogue-speaker-row">
            <div>
              <span class="dialogue-speaker" style="color:${ln.portraitColor}">${ln.speaker}</span>
              <span class="dialogue-role">${ln.role}</span>
            </div>
            <span style="font-size:11px;color:var(--ash);">${scene.title} (${idx + 1}/${scene.lines.length})</span>
          </div>
          <div class="dialogue-text">${ln.text}</div>
          <div class="dialogue-next">点击继续 ▸</div>
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
    overlay.className = 'zx-arsenal-overlay';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.innerHTML = `
      <div style="text-align:center;max-width:440px;display:flex;flex-direction:column;gap:16px;">
        <div style="font-size:36px;font-weight:900;letter-spacing:8px;color:#ef4444;">力 竭 剑 折</div>
        <p style="color:#cbd5e1;line-height:1.7;">少年血染青石，但胸前玄鸟残佩护住了最后一缕心脉。</p>
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

  public showEndingModal(_kind: 'normal' | 'true' | 'boss_rush', _timeSec: number): void {
    this.showTitleScreen();
  }
}
