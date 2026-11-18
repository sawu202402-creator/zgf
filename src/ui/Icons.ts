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
  if (id === 'holy_fire') {
    return `<svg viewBox="0 0 36 36" width="26" height="26">
      <path d="M14 14 L22 14 L25 27 Q18 31 11 27 Z" fill="#7c2d12" stroke="#cfa349" stroke-width="1.4"/>
      <path d="M18 4 C23 10, 23 15, 18 18 C13 15, 13 10, 18 4 Z" fill="#f97316"/>
      <path d="M18 8 C20.5 11.5, 20.5 14.5, 18 16.5 C15.5 14.5, 15.5 11.5, 18 8 Z" fill="#fef08a"/>
    </svg>`;
  }
  if (id === 'bagua_cross') {
    return `<svg viewBox="0 0 36 36" width="26" height="26">
      <polygon points="18,3 28,8 33,18 28,28 18,33 8,28 3,18 8,8" fill="rgba(15,23,42,0.85)" stroke="#2dd4bf" stroke-width="1.8"/>
      <circle cx="18" cy="18" r="7" fill="none" stroke="#cfa349" stroke-width="1.6"/>
      <circle cx="18" cy="18" r="2.2" fill="#fef08a"/>
    </svg>`;
  }
  if (id === 'mountain_seal') {
    return `<svg viewBox="0 0 36 36" width="26" height="26">
      <rect x="7" y="15" width="22" height="14" rx="2" fill="#92400e" stroke="#fde047" stroke-width="1.8"/>
      <path d="M13 15 L15 8 L21 8 L23 15 Z" fill="#facc15" stroke="#78350f" stroke-width="1.3"/>
      <line x1="10" y1="22" x2="26" y2="22" stroke="#fef08a" stroke-width="1.4"/>
    </svg>`;
  }
  if (id === 'sword_orbit') {
    return `<svg viewBox="0 0 36 36" width="26" height="26">
      <circle cx="18" cy="18" r="12" fill="none" stroke="#38bdf8" stroke-width="1.3" stroke-dasharray="4 3"/>
      <polygon points="18,3 20.5,14 18,16 15.5,14" fill="#bae6fd" stroke="#0284c7" stroke-width="0.9"/>
      <polygon points="7,26 16,19 17,22 10,28" fill="#bae6fd" stroke="#0284c7" stroke-width="0.9"/>
      <polygon points="29,26 20,19 19,22 26,28" fill="#bae6fd" stroke="#0284c7" stroke-width="0.9"/>
    </svg>`;
  }
  return `<svg viewBox="0 0 36 36" width="26" height="26">
    <polygon points="31,7 16,19 12,16" fill="#e2e8f0" stroke="#cfa349" stroke-width="1.1"/>
    <polygon points="29,16 14,28 10,25" fill="#94a3b8" stroke="#2dd4bf" stroke-width="1.1"/>
  </svg>`;
}

export function getSlotCategorySvg(
  slot: 'armor' | 'accessory' | 'core' | 'potion',
  itemId?: string
): string {
  if (slot === 'armor') {
    return `<img src="${Assets.getUrl('item_armor_stand')}" width="28" height="28" style="object-fit:contain;display:block;" alt="衣甲" />`;
  }
  if (slot === 'accessory') {
    return `<img src="${Assets.getUrl('item_relic_pedestal')}" width="26" height="30" style="object-fit:contain;display:block;" alt="佩玉" />`;
  }
  if (slot === 'core') {
    return `<svg viewBox="0 0 36 36" width="26" height="26">
      <circle cx="18" cy="19" r="10" fill="#3b0764" stroke="#c084fc" stroke-width="1.8"/>
      <path d="M15 13 C21 12, 23 20, 17 24 C13 22, 13 16, 15 13 Z" fill="#f5d0fe"/>
    </svg>`;
  }
  if (itemId === 'beggar_chicken') {
    return `<img src="${Assets.getUrl('item_lotus_chicken')}" width="30" height="26" style="object-fit:contain;display:block;" alt="叫花鸡" />`;
  }
  return `<img src="${Assets.getUrl('item_celadon_gourd')}" width="26" height="28" style="object-fit:contain;display:block;" alt="丹药" />`;
}

export function getSpeakerPortraitSvg(speaker: string, height = 215): string {
  let key: AssetKey = 'bust_liyicheng';
  if (speaker.includes('苏清晏')) key = 'bust_su_qingyan';
  else if (speaker.includes('欧冶残')) key = 'bust_ouye_can';
  else if (speaker.includes('白掌柜')) key = 'bust_bai_zhanggui';
  else if (speaker.includes('萧断水')) key = 'bust_xiao_duanshui';
  else if (speaker.includes('裴无极') || speaker.includes('烛阴')) key = 'bust_peiwuji';
  return `<img src="${Assets.getUrl(key)}" class="zx-frameless-bust" style="height:${height}px;" alt="${speaker}" />`;
}
