import { AssetKey, Assets, resolveFamiliarAssetKey, resolveWeaponAssetKey } from '../game/AssetLoader';
import { FamiliarId, WeaponArchetype } from '../types';

export { resolveFamiliarAssetKey, resolveWeaponAssetKey };

export function getFamiliarArtHtml(famId: FamiliarId, size = 34): string {
  const key = resolveFamiliarAssetKey(famId);
  return `<img src="${Assets.getUrl(key)}" width="${size}" height="${size}" style="width:${size}px;height:${size}px;max-width:${size}px;max-height:${size}px;flex-shrink:0;object-fit:contain;display:block;filter:drop-shadow(0 2px 5px rgba(0,0,0,0.9));" alt="护法灵" />`;
}

export function getWeaponArtHtml(archetype: WeaponArchetype, width = 68, weaponId?: string): string {
  const key = resolveWeaponAssetKey(archetype, weaponId);
  const h = archetype === 'daggers' || archetype === 'whip' ? 28 : 22;
  return `<img src="${Assets.getUrl(key)}" width="${width}" height="${h}" style="width:${width}px;height:${h}px;max-width:${width}px;max-height:${h}px;flex-shrink:0;object-fit:contain;display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.9));" alt="兵刃" />`;
}

export function getSubWeaponSvg(id: string): string {
  let key: AssetKey = 'item_talisman_scroll';
  if (id === 'holy_fire') key = 'item_sub_fire_gourd';
  else if (id === 'bagua_cross') key = 'item_sub_bagua';
  else if (id === 'mountain_seal') key = 'item_sub_seal';
  else if (id === 'sword_orbit') key = 'fam_sword';
  else if (id === 'dagger_throw') key = 'part_wpn_daggers';

  return `<img src="${Assets.getUrl(key)}" width="30" height="30" style="width:30px;height:30px;max-width:30px;max-height:30px;flex-shrink:0;object-fit:contain;display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.85));" alt="奇门副器" />`;
}

export function getSlotCategorySvg(
  slot: 'armor' | 'accessory' | 'core' | 'potion',
  itemId?: string
): string {
  if (slot === 'armor') {
    return `<img src="${Assets.getUrl('item_armor_stand')}" width="28" height="28" style="width:28px;height:28px;max-width:28px;max-height:28px;flex-shrink:0;object-fit:contain;display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.85));" alt="衣甲" />`;
  }
  if (slot === 'accessory') {
    return `<img src="${Assets.getUrl('item_relic_pedestal')}" width="26" height="30" style="width:26px;height:30px;max-width:26px;max-height:30px;flex-shrink:0;object-fit:contain;display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.85));" alt="佩玉" />`;
  }
  if (slot === 'core') {
    return `<img src="${Assets.getUrl('item_yao_core')}" width="28" height="28" style="width:28px;height:28px;max-width:28px;max-height:28px;flex-shrink:0;object-fit:contain;display:block;filter:drop-shadow(0 2px 5px rgba(168,85,247,0.5));" alt="妖丹" />`;
  }
  if (itemId === 'beggar_chicken') {
    return `<img src="${Assets.getUrl('item_lotus_chicken')}" width="30" height="26" style="width:30px;height:26px;max-width:30px;max-height:26px;flex-shrink:0;object-fit:contain;display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.85));" alt="叫花鸡" />`;
  }
  return `<img src="${Assets.getUrl('item_celadon_gourd')}" width="26" height="28" style="width:26px;height:28px;max-width:26px;max-height:28px;flex-shrink:0;object-fit:contain;display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.85));" alt="丹药" />`;
}

export function getSpeakerPortraitSvg(speaker: string, height = 215): string {
  let key: AssetKey = 'bust_liyicheng';
  if (speaker.includes('苏清晏')) key = 'bust_su_qingyan';
  else if (speaker.includes('欧冶残')) key = 'bust_ouye_can';
  else if (speaker.includes('白掌柜')) key = 'bust_bai_zhanggui';
  else if (speaker.includes('萧断水')) key = 'bust_xiao_duanshui';
  else if (speaker.includes('裴无极')) key = 'bust_peiwuji';
  else if (speaker.includes('墨千秋')) key = 'boss_ik_0';
  else if (speaker.includes('拓跋烈') || speaker.includes('大将军')) key = 'boss_gen_0';
  else if (speaker.includes('敖溟') || speaker.includes('蛟王')) key = 'boss_lev_0';
  else if (speaker.includes('刑天') || speaker.includes('战魄')) key = 'boss_wdn_0';
  else if (speaker.includes('炉君') || speaker.includes('巨灵')) key = 'boss_ft_0';
  else if (speaker.includes('傩')) key = 'boss_op_0';
  else if (speaker.includes('大鹏') || speaker.includes('夜叉')) key = 'boss_yk_0';
  else if (speaker.includes('烛阴')) key = 'boss_pei_2';
  else if (speaker.includes('《') || speaker.includes('碑') || speaker.includes('秘档')) {
    key = 'item_relic_pedestal';
  }
  return `<img src="${Assets.getUrl(key)}" class="zx-frameless-bust" style="height:${height}px;max-height:${height}px;width:auto;max-width:100%;object-fit:contain;" alt="${speaker}" />`;
}
