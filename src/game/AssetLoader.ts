export type AssetKey =
  | 'bg_title'
  | 'bg_gatehouse'
  | 'bg_main_hall'
  | 'bg_library_opera'
  | 'bg_forge_prison'
  | 'bg_opera_market'
  | 'bg_molten_forge'
  | 'bg_chapel_spire'
  | 'bg_cavern_waterfall'
  | 'bg_catacomb_tomb'
  | 'bg_bamboo_cliff'
  | 'bg_tower_interior'
  | 'bg_gatehouse_interior'
  | 'env_ground_slab'
  | 'env_palace_floor'
  | 'env_bridge'
  | 'env_pavilion'
  | 'env_indoor_ledge'
  | 'env_stone_ledge'
  | 'arch_timber_pillar'
  | 'arch_stone_pillar'
  | 'arch_corbel_bracket'
  | 'arch_iron_chain'
  | 'arch_side_doorframe'
  | 'prop_stone_lantern_post'
  | 'prop_breakable_urn'
  | 'hazard_spikes'
  | 'hazard_pendulum'
  | 'hazard_crumble_slab'
  | 'hazard_fire_vent'
  | 'prop_bookshelf'
  | 'prop_chandelier'
  | 'prop_clock_gear'
  | 'prop_dragon_brazier'
  | 'prop_silk_banner'
  | 'prop_weapon_rack'
  | 'prop_guardian_statue'
  | 'prop_coiled_pillar'
  | 'prop_incense_burner'
  | 'prop_giant_bell'
  | 'prop_stone_wall_tex'
  | 'prop_iron_gate'
  | 'prop_mist_barrier'
  | 'prop_bagua_altar'
  | 'prop_secret_arch'
  | 'item_sword_altar'
  | 'item_armor_stand'
  | 'item_celadon_gourd'
  | 'item_lotus_chicken'
  | 'item_silver_sycee'
  | 'item_talisman_scroll'
  | 'item_yao_core'
  | 'item_sub_seal'
  | 'item_sub_bagua'
  | 'item_sub_fire_gourd'
  | 'item_drop_robe'
  | 'item_drop_cuirass'
  | 'item_drop_jade'
  | 'item_drop_tally'
  | 'item_drop_ring'
  | 'item_drop_scroll'
  | 'prop_shrine'
  | 'prop_lantern'
  | 'prop_stone_arch'
  | 'part_wpn_sword'
  | 'part_wpn_modao'
  | 'part_wpn_spear'
  | 'part_wpn_daggers'
  | 'part_wpn_whip'
  | 'item_relic_pedestal'
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
  | 'h18_crouch'
  | 'h18_slide'
  | 'h18_divekick'
  | 'fam_sword'
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
  | 'mob_book'
  | 'mob_toad'
  | 'mob_puppet'
  | 'mob_gargoyle'
  | 'mob_zombie'
  | 'mob_warg'
  | 'mob_bat'
  | 'mob_bone_archer'
  | 'boss_ik_0'
  | 'boss_ik_1'
  | 'boss_ik_2'
  | 'boss_yk_0'
  | 'boss_yk_1'
  | 'boss_yk_2'
  | 'boss_xiao_0'
  | 'boss_xiao_1'
  | 'boss_xiao_2'
  | 'boss_pei_0'
  | 'boss_pei_1'
  | 'boss_pei_2'
  | 'boss_ft_0'
  | 'boss_ft_1'
  | 'boss_op_0'
  | 'boss_op_1';

const ASSET_VERSION = 'painted_v14';

const ASSET_FILES: Record<AssetKey, string> = {
  bg_title: './assets/bg_title.webp',
  bg_gatehouse: './assets/bg_gatehouse.webp',
  bg_main_hall: './assets/bg_main_hall.webp',
  bg_library_opera: './assets/bg_library_opera.webp',
  bg_forge_prison: './assets/bg_forge_prison.webp',
  bg_opera_market: './assets/bg_opera_market.webp',
  bg_molten_forge: './assets/bg_molten_forge.webp',
  bg_chapel_spire: './assets/bg_chapel_spire.webp',
  bg_cavern_waterfall: './assets/bg_cavern_waterfall.webp',
  bg_catacomb_tomb: './assets/bg_catacomb_tomb.webp',
  bg_bamboo_cliff: './assets/bg_bamboo_cliff.webp',
  bg_tower_interior: './assets/bg_tower_interior.webp',
  bg_gatehouse_interior: './assets/bg_gatehouse_interior.webp',
  env_ground_slab: './assets/env_ground_slab.webp',
  env_palace_floor: './assets/env_palace_floor.webp',
  env_bridge: './assets/env_bridge.webp',
  env_pavilion: './assets/env_pavilion.webp',
  env_indoor_ledge: './assets/env_indoor_ledge.webp',
  env_stone_ledge: './assets/env_stone_ledge.webp',
  arch_timber_pillar: './assets/arch_timber_pillar.webp',
  arch_stone_pillar: './assets/arch_stone_pillar.webp',
  arch_corbel_bracket: './assets/arch_corbel_bracket.webp',
  arch_iron_chain: './assets/arch_iron_chain.webp',
  arch_side_doorframe: './assets/arch_side_doorframe.webp',
  prop_stone_lantern_post: './assets/prop_stone_lantern_post.webp',
  prop_breakable_urn: './assets/prop_breakable_urn.webp',
  hazard_spikes: './assets/hazard_spikes.webp',
  hazard_pendulum: './assets/hazard_pendulum.webp',
  hazard_crumble_slab: './assets/hazard_crumble_slab.webp',
  hazard_fire_vent: './assets/hazard_fire_vent.webp',
  prop_bookshelf: './assets/prop_bookshelf.webp',
  prop_chandelier: './assets/prop_chandelier.webp',
  prop_clock_gear: './assets/prop_clock_gear.webp',
  prop_dragon_brazier: './assets/prop_dragon_brazier.webp',
  prop_silk_banner: './assets/prop_silk_banner.webp',
  prop_weapon_rack: './assets/prop_weapon_rack.webp',
  prop_guardian_statue: './assets/prop_guardian_statue.webp',
  prop_coiled_pillar: './assets/prop_coiled_pillar.webp',
  prop_incense_burner: './assets/prop_incense_burner.webp',
  prop_giant_bell: './assets/prop_giant_bell.webp',
  prop_stone_wall_tex: './assets/prop_stone_wall_tex.webp',
  prop_iron_gate: './assets/prop_iron_gate.webp',
  prop_mist_barrier: './assets/prop_mist_barrier.webp',
  prop_bagua_altar: './assets/prop_bagua_altar.webp',
  prop_secret_arch: './assets/prop_secret_arch.webp',
  item_sword_altar: './assets/item_sword_altar.webp',
  item_armor_stand: './assets/item_armor_stand.webp',
  item_celadon_gourd: './assets/item_celadon_gourd.webp',
  item_lotus_chicken: './assets/item_lotus_chicken.webp',
  item_silver_sycee: './assets/item_silver_sycee.webp',
  item_talisman_scroll: './assets/item_talisman_scroll.webp',
  item_yao_core: './assets/item_yao_core.webp',
  item_sub_seal: './assets/item_sub_seal.webp',
  item_sub_bagua: './assets/item_sub_bagua.webp',
  item_sub_fire_gourd: './assets/item_sub_fire_gourd.webp',
  item_drop_robe: './assets/item_drop_robe.webp',
  item_drop_cuirass: './assets/item_drop_cuirass.webp',
  item_drop_jade: './assets/item_drop_jade.webp',
  item_drop_tally: './assets/item_drop_tally.webp',
  item_drop_ring: './assets/item_drop_ring.webp',
  item_drop_scroll: './assets/item_drop_scroll.webp',
  prop_shrine: './assets/prop_shrine.webp',
  prop_lantern: './assets/prop_lantern.webp',
  prop_stone_arch: './assets/prop_stone_arch.webp',
  part_wpn_sword: './assets/part_wpn_sword.webp',
  part_wpn_modao: './assets/part_wpn_modao.webp',
  part_wpn_spear: './assets/part_wpn_spear.webp',
  part_wpn_daggers: './assets/part_wpn_daggers.webp',
  part_wpn_whip: './assets/part_wpn_whip.webp',
  item_relic_pedestal: './assets/item_relic_pedestal.webp',
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
  h18_crouch: './assets/h18_crouch.webp',
  h18_slide: './assets/h18_slide.webp',
  h18_divekick: './assets/h18_divekick.webp',
  fam_sword: './assets/fam_sword.webp',
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
  mob_book: './assets/mob_book.webp',
  mob_toad: './assets/mob_toad.webp',
  mob_puppet: './assets/mob_puppet.webp',
  mob_gargoyle: './assets/mob_gargoyle.webp',
  mob_zombie: './assets/mob_zombie.webp',
  mob_warg: './assets/mob_warg.webp',
  mob_bat: './assets/mob_bat.webp',
  mob_bone_archer: './assets/mob_bone_archer.webp',
  boss_ik_0: './assets/boss_ik_0.webp',
  boss_ik_1: './assets/boss_ik_1.webp',
  boss_ik_2: './assets/boss_ik_2.webp',
  boss_yk_0: './assets/boss_yk_0.webp',
  boss_yk_1: './assets/boss_yk_1.webp',
  boss_yk_2: './assets/boss_yk_2.webp',
  boss_xiao_0: './assets/boss_xiao_0.webp',
  boss_xiao_1: './assets/boss_xiao_1.webp',
  boss_xiao_2: './assets/boss_xiao_2.webp',
  boss_pei_0: './assets/boss_pei_0.webp',
  boss_pei_1: './assets/boss_pei_1.webp',
  boss_pei_2: './assets/boss_pei_2.webp',
  boss_ft_0: './assets/boss_ft_0.webp',
  boss_ft_1: './assets/boss_ft_1.webp',
  boss_op_0: './assets/boss_op_0.webp',
  boss_op_1: './assets/boss_op_1.webp',
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

  public async preloadRemainingInBackground(): Promise<void> {}

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
