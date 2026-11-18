export type AssetKey =
  | 'bg_title'
  | 'bg_gatehouse'
  | 'bg_main_hall'
  | 'bg_library_opera'
  | 'bg_forge_prison'
  | 'portrait_liyicheng'
  | 'portrait_su_qingyan'
  | 'portrait_xiao_duanshui'
  | 'portrait_peiwuji'
  | 'bust_liyicheng'
  | 'bust_su_qingyan'
  | 'bust_ouye_can'
  | 'bust_bai_zhanggui'
  | 'bust_xiao_duanshui'
  | 'bust_peiwuji'
  | 'npc_su_0'
  | 'npc_su_1'
  | 'npc_ouye'
  | 'npc_bai'
  | 'tile_stone_wall'
  | 'h18_idle_0'
  | 'h18_idle_1'
  | 'h18_jump_up'
  | 'h18_jump_fall'
  | 'h18_run_0'
  | 'h18_run_1'
  | 'h18_run_2'
  | 'h18_run_3'
  | 'h18_sword_0'
  | 'h18_sword_1'
  | 'h18_sword_2'
  | 'h18_modao_idle'
  | 'h18_modao_windup'
  | 'h18_modao_cleave'
  | 'part_wpn_sword'
  | 'part_wpn_modao'
  | 'prop_pavilion_platform'
  | 'prop_stone_arch'
  | 'npc_xiao_boss'
  | 'mob_paper_swordsman'
  | 'mob_lantern_ghost'
  | 'mob_bronze_guard'
  | 'mob_scroll_demon'
  | 'mob_plague_toad'
  | 'mob_opera_puppet'
  | 'mob_bell_gargoyle'
  | 'boss_scroll_king'
  | 'boss_furnace_titan'
  | 'boss_opera_god'
  | 'boss_zhuyin'
  | 'prop_shrine'
  | 'prop_chest'
  | 'prop_lantern'
  | 'prop_gourd';

const ASSET_VERSION = 'vfx_npc_2';

const ASSET_FILES: Record<AssetKey, string> = {
  bg_title: './assets/bg_title.webp',
  bg_gatehouse: './assets/bg_gatehouse.webp',
  bg_main_hall: './assets/bg_main_hall.webp',
  bg_library_opera: './assets/bg_library_opera.webp',
  bg_forge_prison: './assets/bg_forge_prison.webp',
  portrait_liyicheng: './assets/portrait_liyicheng.webp',
  portrait_su_qingyan: './assets/portrait_su_qingyan.webp',
  portrait_xiao_duanshui: './assets/portrait_xiao_duanshui.webp',
  portrait_peiwuji: './assets/portrait_peiwuji.webp',
  bust_liyicheng: './assets/bust_liyicheng.webp',
  bust_su_qingyan: './assets/bust_su_qingyan.webp',
  bust_ouye_can: './assets/bust_ouye_can.webp',
  bust_bai_zhanggui: './assets/bust_bai_zhanggui.webp',
  bust_xiao_duanshui: './assets/bust_xiao_duanshui.webp',
  bust_peiwuji: './assets/bust_peiwuji.webp',
  npc_su_0: './assets/npc_su_0.webp',
  npc_su_1: './assets/npc_su_1.webp',
  npc_ouye: './assets/npc_ouye.webp',
  npc_bai: './assets/npc_bai.webp',
  tile_stone_wall: './assets/tile_stone_wall.webp',
  h18_idle_0: './assets/h18_idle_0.webp',
  h18_idle_1: './assets/h18_idle_1.webp',
  h18_jump_up: './assets/h18_jump_up.webp',
  h18_jump_fall: './assets/h18_jump_fall.webp',
  h18_run_0: './assets/h18_run_0.webp',
  h18_run_1: './assets/h18_run_1.webp',
  h18_run_2: './assets/h18_run_2.webp',
  h18_run_3: './assets/h18_run_3.webp',
  h18_sword_0: './assets/h18_sword_0.webp',
  h18_sword_1: './assets/h18_sword_1.webp',
  h18_sword_2: './assets/h18_sword_2.webp',
  h18_modao_idle: './assets/h18_modao_idle.webp',
  h18_modao_windup: './assets/h18_modao_windup.webp',
  h18_modao_cleave: './assets/h18_modao_cleave.webp',
  part_wpn_sword: './assets/part_wpn_sword.webp',
  part_wpn_modao: './assets/part_wpn_modao.webp',
  prop_pavilion_platform: './assets/prop_pavilion_platform.webp',
  prop_stone_arch: './assets/prop_stone_arch.webp',
  npc_xiao_boss: './assets/npc_xiao_boss.webp',
  mob_paper_swordsman: './assets/mob_paper_swordsman.webp',
  mob_lantern_ghost: './assets/mob_lantern_ghost.webp',
  mob_bronze_guard: './assets/mob_bronze_guard.webp',
  mob_scroll_demon: './assets/mob_scroll_demon.webp',
  mob_plague_toad: './assets/mob_plague_toad.webp',
  mob_opera_puppet: './assets/mob_opera_puppet.webp',
  mob_bell_gargoyle: './assets/mob_bell_gargoyle.webp',
  boss_scroll_king: './assets/boss_scroll_king.webp',
  boss_furnace_titan: './assets/boss_furnace_titan.webp',
  boss_opera_god: './assets/boss_opera_god.webp',
  boss_zhuyin: './assets/boss_zhuyin.webp',
  prop_shrine: './assets/prop_shrine.webp',
  prop_chest: './assets/prop_chest.webp',
  prop_lantern: './assets/prop_lantern.webp',
  prop_gourd: './assets/prop_gourd.webp',
};

const CRITICAL_ASSETS: AssetKey[] = [
  'bg_title',
  'bg_gatehouse',
  'bg_main_hall',
  'bust_liyicheng',
  'bust_su_qingyan',
  'bust_ouye_can',
  'bust_bai_zhanggui',
  'npc_su_0',
  'npc_su_1',
  'npc_ouye',
  'npc_bai',
  'tile_stone_wall',
  'h18_idle_0',
  'h18_idle_1',
  'h18_jump_up',
  'h18_jump_fall',
  'h18_run_0',
  'h18_run_1',
  'h18_run_2',
  'h18_run_3',
  'h18_sword_0',
  'h18_sword_1',
  'h18_sword_2',
  'h18_modao_idle',
  'h18_modao_windup',
  'h18_modao_cleave',
  'part_wpn_sword',
  'part_wpn_modao',
  'prop_pavilion_platform',
  'prop_stone_arch',
  'prop_shrine',
  'prop_chest',
  'prop_lantern',
  'prop_gourd',
  'mob_paper_swordsman',
  'mob_lantern_ghost',
  'mob_bronze_guard',
  'boss_scroll_king',
];

class GameAssetRegistry {
  private images = new Map<AssetKey, HTMLImageElement>();
  private whiteFlashes = new Map<AssetKey, HTMLCanvasElement>();
  private tintedSilhouettes = new Map<string, HTMLCanvasElement>();
  private patterns = new Map<string, CanvasPattern>();
  private inflight = new Map<AssetKey, Promise<void>>();

  private loadOne(key: AssetKey): Promise<void> {
    if (this.images.has(key)) return Promise.resolve();
    const ex = this.inflight.get(key);
    if (ex) return ex;

    const p = new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(key, img);
        this.inflight.delete(key);
        resolve();
      };
      img.onerror = () => {
        this.inflight.delete(key);
        resolve();
      };
      img.src = `${ASSET_FILES[key]}?v=${ASSET_VERSION}`;
    });
    this.inflight.set(key, p);
    return p;
  }

  public async preloadCritical(onProgress?: (loaded: number, total: number) => void): Promise<void> {
    let loaded = 0;
    const total = CRITICAL_ASSETS.length;
    await Promise.all(
      CRITICAL_ASSETS.map((k) =>
        this.loadOne(k).then(() => {
          loaded++;
          onProgress?.(loaded, total);
        })
      )
    );
  }

  public async preloadRemainingInBackground(): Promise<void> {
    const rest = (Object.keys(ASSET_FILES) as AssetKey[]).filter((k) => !this.images.has(k));
    const BATCH = 5;
    for (let i = 0; i < rest.length; i += BATCH) {
      await Promise.all(rest.slice(i, i + BATCH).map((k) => this.loadOne(k)));
    }
  }

  public get(key: AssetKey): HTMLImageElement | undefined {
    return this.images.get(key);
  }

  public getUrl(key: AssetKey): string {
    return `${ASSET_FILES[key]}?v=${ASSET_VERSION}`;
  }

  public getWhiteFlash(key: AssetKey): HTMLCanvasElement | undefined {
    return this.getTintedSilhouette(key, '#ffffff');
  }

  public getTintedSilhouette(key: AssetKey, hexColor: string): HTMLCanvasElement | undefined {
    const cacheKey = `${key}@${hexColor}`;
    const cached = this.tintedSilhouettes.get(cacheKey);
    if (cached) return cached;
    const img = this.images.get(key);
    if (!img) return undefined;
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const cctx = c.getContext('2d')!;
    cctx.drawImage(img, 0, 0);
    cctx.globalCompositeOperation = 'source-in';
    cctx.fillStyle = hexColor;
    cctx.fillRect(0, 0, c.width, c.height);
    // Vertical alpha fade at feet & edges so afterimages look like misty qi, never paper cutouts!
    cctx.globalCompositeOperation = 'destination-in';
    const grad = cctx.createLinearGradient(0, 40, 0, c.height);
    grad.addColorStop(0, 'rgba(255,255,255,0.95)');
    grad.addColorStop(0.75, 'rgba(255,255,255,0.65)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    cctx.fillStyle = grad;
    cctx.fillRect(0, 0, c.width, c.height);
    this.tintedSilhouettes.set(cacheKey, c);
    return c;
  }

  public getPattern(
    ctx: CanvasRenderingContext2D,
    key: AssetKey,
    scale = 0.5
  ): CanvasPattern | null {
    const ck = `${key}@${scale}`;
    if (this.patterns.has(ck)) return this.patterns.get(ck)!;
    const img = this.images.get(key);
    if (!img) return null;
    const pat = ctx.createPattern(img, 'repeat');
    if (pat) {
      if (scale !== 1 && typeof pat.setTransform === 'function' && typeof DOMMatrix !== 'undefined') {
        pat.setTransform(new DOMMatrix().scale(scale, scale));
      }
      this.patterns.set(ck, pat);
    }
    return pat;
  }
}

export const Assets = new GameAssetRegistry();
