export type AssetKey =
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
  | 'mob_sw_0'
  | 'mob_sw_1'
  | 'mob_sw_2'
  | 'mob_sw_3'
  | 'mob_gd_0'
  | 'mob_gd_1'
  | 'mob_gd_2'
  | 'mob_gd_3'
  | 'mob_wr_0'
  | 'mob_wr_1'
  | 'mob_wr_2'
  | 'boss_ik_0'
  | 'boss_ik_1'
  | 'boss_ik_2';

const ASSET_VERSION = 'pure2d_3';

const ASSET_FILES: Record<AssetKey, string> = {
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
  mob_sw_0: './assets/mob_sw_0.webp',
  mob_sw_1: './assets/mob_sw_1.webp',
  mob_sw_2: './assets/mob_sw_2.webp',
  mob_sw_3: './assets/mob_sw_3.webp',
  mob_gd_0: './assets/mob_gd_0.webp',
  mob_gd_1: './assets/mob_gd_1.webp',
  mob_gd_2: './assets/mob_gd_2.webp',
  mob_gd_3: './assets/mob_gd_3.webp',
  mob_wr_0: './assets/mob_wr_0.webp',
  mob_wr_1: './assets/mob_wr_1.webp',
  mob_wr_2: './assets/mob_wr_2.webp',
  boss_ik_0: './assets/boss_ik_0.webp',
  boss_ik_1: './assets/boss_ik_1.webp',
  boss_ik_2: './assets/boss_ik_2.webp',
};

const CRITICAL_ASSETS: AssetKey[] = Object.keys(ASSET_FILES) as AssetKey[];

class GameAssetRegistry {
  private images = new Map<AssetKey, HTMLImageElement>();
  private tintedSilhouettes = new Map<string, HTMLCanvasElement>();
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
    // All active character & enemy frames are lightweight (~8 KB each) and preloaded upfront
  }

  public get(key: AssetKey): HTMLImageElement | undefined {
    return this.images.get(key);
  }

  public getUrl(key: AssetKey): string {
    return `${ASSET_FILES[key]}?v=${ASSET_VERSION}`;
  }

  public getWhiteFlash(key: AssetKey): HTMLCanvasElement | undefined {
    return this.getTintedSilhouette(key, '#ffffff', false);
  }

  public getTintedSilhouette(
    key: AssetKey,
    hexColor: string,
    fadeBottom = true
  ): HTMLCanvasElement | undefined {
    const cacheKey = `${key}@${hexColor}@${fadeBottom}`;
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
    if (fadeBottom) {
      cctx.globalCompositeOperation = 'destination-in';
      const grad = cctx.createLinearGradient(0, 40, 0, c.height);
      grad.addColorStop(0, 'rgba(255,255,255,0.95)');
      grad.addColorStop(0.75, 'rgba(255,255,255,0.65)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      cctx.fillStyle = grad;
      cctx.fillRect(0, 0, c.width, c.height);
    }
    this.tintedSilhouettes.set(cacheKey, c);
    return c;
  }
}

export const Assets = new GameAssetRegistry();
