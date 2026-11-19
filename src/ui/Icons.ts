import { AssetKey, Assets } from '../game/AssetLoader';
import { WeaponArchetype } from '../types';

export function getWeaponArtHtml(archetype: WeaponArchetype, width = 68): string {
  let key: AssetKey = 'part_wpn_sword';
  if (archetype === 'greatsword') key = 'part_wpn_modao';
  else if (archetype === 'spear') key = 'part_wpn_spear';
  else if (archetype === 'daggers') key = 'part_wpn_daggers';
  else if (archetype === 'whip') key = 'part_wpn_whip';

  const h = archetype === 'daggers' || archetype === 'whip' ? 30 : 22;
  return `<img src="${Assets.getUrl(key)}" style="width:${width}px;height:${h}px;object-fit:contain;display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.9));" alt="兵刃" />`;
}

export function getSubWeaponSvg(id: string): string {
  let key: AssetKey = 'item_talisman_scroll';
  if (id === 'holy_fire') key = 'item_sub_fire_gourd';
  else if (id === 'bagua_cross') key = 'item_sub_bagua';
  else if (id === 'mountain_seal') key = 'item_sub_seal';
  else if (id === 'sword_orbit') key = 'fam_sword';
  else if (id === 'dagger_throw') key = 'part_wpn_daggers';

  return `<img src="${Assets.getUrl(key)}" width="30" height="30" style="object-fit:contain;display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.85));" alt="奇门副器" />`;
}

export function getSlotCategorySvg(
  slot: 'armor' | 'accessory' | 'core' | 'potion',
  itemId?: string
): string {
  if (slot === 'armor') {
    return `<img src="${Assets.getUrl('item_armor_stand')}" width="28" height="28" style="object-fit:contain;display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.85));" alt="衣甲" />`;
  }
  if (slot === 'accessory') {
    return `<img src="${Assets.getUrl('item_relic_pedestal')}" width="26" height="30" style="object-fit:contain;display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.85));" alt="佩玉" />`;
  }
  if (slot === 'core') {
    return `<img src="${Assets.getUrl('item_yao_core')}" width="28" height="28" style="object-fit:contain;display:block;filter:drop-shadow(0 2px 5px rgba(168,85,247,0.5));" alt="妖丹" />`;
  }
  if (itemId === 'beggar_chicken') {
    return `<img src="${Assets.getUrl('item_lotus_chicken')}" width="30" height="26" style="object-fit:contain;display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.85));" alt="叫花鸡" />`;
  }
  return `<img src="${Assets.getUrl('item_celadon_gourd')}" width="26" height="28" style="object-fit:contain;display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.85));" alt="丹药" />`;
}

export function getSpeakerPortraitSvg(speaker: string, height = 215): string {
  let key: AssetKey = 'bust_liyicheng';
  if (speaker.includes('苏清晏')) key = 'bust_su_qingyan';
  else if (speaker.includes('欧冶残')) key = 'bust_ouye_can';
  else if (speaker.includes('白掌柜')) key = 'bust_bai_zhanggui';
  else if (speaker.includes('萧断水')) key = 'bust_xiao_duanshui';
  else if (speaker.includes('裴无极')) key = 'bust_peiwuji';
  else if (speaker.includes('墨千秋')) key = 'boss_ik_0';
  else if (speaker.includes('炉君')) key = 'boss_ft_0';
  else if (speaker.includes('傩王')) key = 'boss_op_0';
  else if (speaker.includes('夜叉')) key = 'boss_yk_0';
  else if (speaker.includes('烛阴')) key = 'boss_pei_2';
  else if (speaker.includes('《') || speaker.includes('碑') || speaker.includes('秘档')) {
    key = 'item_relic_pedestal';
  }
  return `<img src="${Assets.getUrl(key)}" class="zx-frameless-bust" style="height:${height}px;object-fit:contain;" alt="${speaker}" />`;
}
