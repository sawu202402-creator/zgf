import { Assets } from '../game/AssetLoader';
import { WeaponArchetype } from '../types';

export function getWeaponSvg(archetype: WeaponArchetype, color: string, glow: string): string {
  const uid = `${archetype}_${color.replace('#', '')}`;
  if (archetype === 'sword') {
    return `<svg viewBox="0 0 36 36" width="24" height="24">
      <defs><linearGradient id="${uid}" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stop-color="${glow}"/><stop offset="100%" stop-color="#ffffff"/>
      </linearGradient></defs>
      <path d="M29 5 L31 7 L14 24 L11 21 Z" fill="url(#${uid})" stroke="${color}" stroke-width="0.8"/>
      <path d="M8 18 L18 28" stroke="#e2b659" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M11 25 L6 30" stroke="#92400e" stroke-width="3" stroke-linecap="round"/>
      <circle cx="5.5" cy="30.5" r="2" fill="#e2b659"/>
    </svg>`;
  }
  if (archetype === 'greatsword') {
    return `<svg viewBox="0 0 36 36" width="24" height="24">
      <path d="M28 4 L33 6 L16 25 L10 20 Z" fill="${color}" stroke="${glow}" stroke-width="1.3"/>
      <path d="M27 7 L14 21" stroke="#fff" stroke-width="1.2" opacity="0.7"/>
      <path d="M7 17 L19 29" stroke="#f59e0b" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M12 24 L5 31" stroke="#78350f" stroke-width="3.6" stroke-linecap="round"/>
    </svg>`;
  }
  if (archetype === 'spear') {
    return `<svg viewBox="0 0 36 36" width="24" height="24">
      <line x1="5" y1="31" x2="25" y2="11" stroke="#b45309" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M22 14 Q20 18 16 17" stroke="#ef4444" stroke-width="2.2" fill="none"/>
      <polygon points="32,4 26,14 22,10" fill="#ffffff" stroke="${glow}" stroke-width="1.1"/>
    </svg>`;
  }
  if (archetype === 'daggers') {
    return `<svg viewBox="0 0 36 36" width="24" height="24">
      <path d="M8 26 Q14 14 27 7 Q21 18 12 28 Z" fill="${color}" stroke="${glow}" stroke-width="1.1"/>
      <path d="M10 10 Q21 15 29 27 Q17 21 8 14 Z" fill="${color}" stroke="${glow}" stroke-width="1.1" opacity="0.88"/>
      <circle cx="18" cy="18" r="2.8" fill="#e2b659"/>
    </svg>`;
  }
  return `<svg viewBox="0 0 36 36" width="24" height="24">
    <path d="M7 29 C4 18, 20 22, 18 12 C17 6, 27 6, 30 11" fill="none" stroke="${glow}" stroke-width="2.5" stroke-dasharray="4 1.5"/>
    <polygon points="32,13 27,10 29,16" fill="#fff" stroke="${color}" stroke-width="1"/>
    <line x1="6" y1="31" x2="10" y2="26" stroke="#d97706" stroke-width="3.2" stroke-linecap="round"/>
  </svg>`;
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
      <polygon points="18,4 28,9 32,18 28,27 18,32 8,27 4,18 8,9" fill="none" stroke="#48c9b0" stroke-width="2"/>
      <circle cx="18" cy="18" r="6" fill="none" stroke="#fde047" stroke-width="1.8"/>
    </svg>`;
  }
  if (id === 'mountain_seal') {
    return `<svg viewBox="0 0 36 36" width="22" height="22">
      <rect x="8" y="14" width="20" height="15" rx="2" fill="#ca8a04" stroke="#fef08a" stroke-width="1.5"/>
      <path d="M13 14 L15 8 L21 8 L23 14" fill="#eab308" stroke="#fef08a" stroke-width="1.3"/>
    </svg>`;
  }
  if (id === 'sword_orbit') {
    return `<svg viewBox="0 0 36 36" width="22" height="22">
      <circle cx="18" cy="18" r="11" fill="none" stroke="#60a5fa" stroke-width="1.5" stroke-dasharray="4 3"/>
      <polygon points="18,4 21,13 18,11 15,13" fill="#bae6fd"/>
      <polygon points="30,25 21,22 24,20 23,17" fill="#bae6fd"/>
      <polygon points="6,25 13,17 12,20 15,22" fill="#bae6fd"/>
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
      <path d="M11 7 L18 10 L25 7 L30 13 L26 17 L25 29 L11 29 L10 17 L6 13 Z" fill="#1e293b" stroke="#e2b659" stroke-width="1.6"/>
      <line x1="18" y1="10" x2="18" y2="29" stroke="#e2b659" stroke-width="1.2"/>
    </svg>`;
  }
  if (slot === 'accessory') {
    return `<svg viewBox="0 0 36 36" width="22" height="22">
      <circle cx="18" cy="19" r="10" fill="none" stroke="#48c9b0" stroke-width="3.5"/>
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
  return `<img src="${Assets.getUrl('prop_gourd')}" width="22" height="22" style="object-fit:contain;" alt="灵药" />`;
}

export function getSpeakerPortraitSvg(speaker: string): string {
  let key: 'portrait_liyicheng' | 'portrait_su_qingyan' | 'portrait_xiao_duanshui' | 'portrait_peiwuji' =
    'portrait_liyicheng';
  if (speaker.includes('苏清晏')) key = 'portrait_su_qingyan';
  else if (speaker.includes('萧断水')) key = 'portrait_xiao_duanshui';
  else if (speaker.includes('裴无极') || speaker.includes('烛阴') || speaker.includes('欧冶')) {
    key = 'portrait_peiwuji';
  }
  return `<img src="${Assets.getUrl(key)}" width="88" height="88" style="display:block;object-fit:cover;" alt="${speaker}" />`;
}
