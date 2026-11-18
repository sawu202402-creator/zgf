import { Assets } from '../game/AssetLoader';
import { WeaponArchetype } from '../types';

export function getWeaponArtHtml(archetype: WeaponArchetype, width = 68): string {
  const key = archetype === 'greatsword' ? 'part_wpn_modao' : 'part_wpn_sword';
  return `<img src="${Assets.getUrl(key)}" style="width:${width}px;height:22px;object-fit:contain;display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.85));" alt="兵刃" />`;
}

export function getSubWeaponSvg(id: string): string {
  if (id === 'holy_fire') {
    return `<svg viewBox="0 0 36 36" width="22" height="22">
      <rect x="11" y="7" width="14" height="22" rx="2" fill="#7c2d12" stroke="#f97316" stroke-width="1.5"/>
      <path d="M18 11 C22 16, 22 22, 18 25 C14 22, 14 16, 18 11 Z" fill="#fde047"/>
    </svg>`;
  }
  if (id === 'bagua_cross') {
    return `<svg viewBox="0 0 36 36" width="22" height="22">
      <polygon points="18,4 28,9 32,18 28,27 18,32 8,27 4,18 8,9" fill="none" stroke="#2dd4bf" stroke-width="2"/>
      <circle cx="18" cy="18" r="6" fill="none" stroke="#fde047" stroke-width="1.8"/>
    </svg>`;
  }
  return `<svg viewBox="0 0 36 36" width="22" height="22">
    <polygon points="30,8 16,18 13,15" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"/>
    <polygon points="28,17 14,27 11,24" fill="#cbd5e1" stroke="#64748b" stroke-width="1"/>
  </svg>`;
}

export function getSlotCategorySvg(slot: 'armor' | 'accessory' | 'core' | 'potion'): string {
  if (slot === 'armor') {
    return `<svg viewBox="0 0 36 36" width="22" height="22">
      <path d="M11 7 L18 10 L25 7 L30 13 L26 17 L25 29 L11 29 L10 17 L6 13 Z" fill="#1e293b" stroke="#cfa349" stroke-width="1.6"/>
      <line x1="18" y1="10" x2="18" y2="29" stroke="#cfa349" stroke-width="1.2"/>
    </svg>`;
  }
  if (slot === 'accessory') {
    return `<svg viewBox="0 0 36 36" width="22" height="22">
      <circle cx="18" cy="19" r="10" fill="none" stroke="#2dd4bf" stroke-width="3.5"/>
      <circle cx="18" cy="19" r="4" fill="none" stroke="#a7f3d0" stroke-width="1.2"/>
      <path d="M18 5 L18 9" stroke="#ef4444" stroke-width="2"/>
    </svg>`;
  }
  if (slot === 'core') {
    return `<svg viewBox="0 0 36 36" width="22" height="22">
      <circle cx="18" cy="19" r="9" fill="#581c87" stroke="#e879f9" stroke-width="1.8"/>
      <path d="M15 15 Q18 11 21 16 Q19 22 15 20 Z" fill="#f5d0fe"/>
    </svg>`;
  }
  return `<img src="${Assets.getUrl('prop_gourd')}" width="22" height="22" style="object-fit:contain;display:block;" alt="灵药" />`;
}

export function getSpeakerPortraitSvg(speaker: string): string {
  let key: 'portrait_liyicheng' | 'portrait_su_qingyan' | 'portrait_xiao_duanshui' | 'portrait_peiwuji' =
    'portrait_liyicheng';
  if (speaker.includes('苏清晏')) key = 'portrait_su_qingyan';
  else if (speaker.includes('萧断水')) key = 'portrait_xiao_duanshui';
  else if (speaker.includes('裴无极') || speaker.includes('烛阴')) key = 'portrait_peiwuji';
  return `<img src="${Assets.getUrl(key)}" width="92" height="92" style="display:block;object-fit:cover;" alt="${speaker}" />`;
}
