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
  return `<svg viewBox="0 0 36 36" width="22" height="22">
    <path d="M15 7 L21 7 L20 12 C25 14 26 22 24 27 C22 30 14 30 12 27 C10 22 11 14 16 12 Z" fill="#14532d" stroke="#4ade80" stroke-width="1.6"/>
    <rect x="14" y="5" width="8" height="3" rx="1" fill="#e2b659"/>
  </svg>`;
}

export function getSpeakerPortraitSvg(speaker: string): string {
  if (speaker.includes('苏清晏')) {
    return `<svg viewBox="0 0 110 124" width="84" height="96">
      <rect width="110" height="124" rx="3" fill="#08111e"/>
      <circle cx="55" cy="48" r="42" fill="#0ea5e9" opacity="0.16"/>
      <path d="M20 124 L30 74 L55 86 L80 74 L90 124 Z" fill="#0c4a6e" stroke="#7dd3fc" stroke-width="1.6"/>
      <path d="M36 42 C34 22, 46 14, 55 14 C64 14, 76 22, 74 42 L78 82 L32 82 Z" fill="#0f172a"/>
      <rect x="49" y="56" width="12" height="12" fill="#f6dec8"/>
      <path d="M40 38 C40 54, 47 61, 55 61 C63 61, 70 54, 70 38 Z" fill="#fae3cf"/>
      <path d="M39 38 C42 26, 68 26, 71 38 C64 32, 46 32, 39 38 Z" fill="#0f172a"/>
      <!-- 步摇金簪 -->
      <line x1="28" y1="26" x2="46" y2="30" stroke="#fde047" stroke-width="2.2"/>
      <circle cx="28" cy="26" r="3" fill="#48c9b0"/>
      <circle cx="49" cy="45" r="2" fill="#0f172a"/>
      <circle cx="61" cy="45" r="2" fill="#0f172a"/>
      <path d="M52 53 Q55 55 58 53" fill="none" stroke="#e11d48" stroke-width="1.5"/>
    </svg>`;
  }
  if (speaker.includes('萧断水')) {
    return `<svg viewBox="0 0 110 124" width="84" height="96">
      <rect width="110" height="124" rx="3" fill="#100a20"/>
      <circle cx="55" cy="48" r="42" fill="#a855f7" opacity="0.18"/>
      <path d="M18 124 L26 72 L55 84 L84 72 L92 124 Z" fill="#2e1065" stroke="#c084fc" stroke-width="1.8"/>
      <path d="M36 74 L55 96 L74 74" fill="none" stroke="#e2b659" stroke-width="2.5"/>
      <rect x="49" y="56" width="12" height="12" fill="#edd0b4"/>
      <path d="M39 38 C39 55, 46 62, 55 62 C64 62, 71 55, 71 38 Z" fill="#f3d5b8"/>
      <path d="M37 40 C37 20, 50 15, 58 16 C69 17, 74 26, 73 40 C66 32, 45 32, 37 40 Z" fill="#1e1b4b"/>
      <rect x="49" y="13" width="12" height="6" fill="#e2e8f0"/>
      <path d="M44 42 L52 45" stroke="#0f172a" stroke-width="2.2"/>
      <path d="M66 42 L58 45" stroke="#0f172a" stroke-width="2.2"/>
      <circle cx="49" cy="47" r="1.8" fill="#0f172a"/>
      <circle cx="61" cy="47" r="1.8" fill="#0f172a"/>
    </svg>`;
  }
  if (speaker.includes('裴无极') || speaker.includes('烛阴')) {
    return `<svg viewBox="0 0 110 124" width="84" height="96">
      <rect width="110" height="124" rx="3" fill="#18070b"/>
      <circle cx="55" cy="48" r="44" fill="#ef4444" opacity="0.22"/>
      <path d="M16 124 L26 72 L55 86 L84 72 L94 124 Z" fill="#450a0a" stroke="#ef4444" stroke-width="1.8"/>
      <path d="M32 36 C32 16, 78 16, 78 36 L84 86 L26 86 Z" fill="#cbd5e1"/>
      <path d="M40 38 C40 55, 46 63, 55 63 C64 63, 70 55, 70 38 Z" fill="#e2c6b0"/>
      <circle cx="49" cy="46" r="2.5" fill="#dc2626"/>
      <circle cx="61" cy="46" r="2.5" fill="#dc2626"/>
    </svg>`;
  }
  // 默认：18岁男主角 李逸承 高清立绘
  return `<svg viewBox="0 0 110 124" width="84" height="96">
    <rect width="110" height="124" rx="3" fill="#080c14"/>
    <circle cx="55" cy="48" r="42" fill="#48c9b0" opacity="0.18"/>
    <path d="M62 34 C82 28, 94 38, 106 32 C94 44, 82 42, 64 41 Z" fill="#dc2626"/>
    <line x1="25" y1="16" x2="42" y2="52" stroke="#e2b659" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M20 124 L28 72 L45 64 L55 78 L65 64 L82 72 L90 124 Z" fill="#123042" stroke="#48c9b0" stroke-width="1.6"/>
    <path d="M43 65 L55 90 L67 65" fill="none" stroke="#e2b659" stroke-width="2"/>
    <rect x="49" y="54" width="12" height="12" fill="#f1d2b6"/>
    <path d="M40 37 C40 53, 46 60, 55 60 C64 60, 70 53, 70 37 Z" fill="#f6dac0"/>
    <path d="M37 40 C36 22, 48 16, 57 17 C68 18, 74 26, 73 41 C68 32, 60 30, 51 31 C44 32, 40 35, 37 40 Z" fill="#0f172a"/>
    <path d="M52 17 C60 7, 73 9, 78 20 C70 18, 63 19, 57 22 Z" fill="#0f172a"/>
    <path d="M39 33 Q55 30 71 33 L71 37 Q55 34 39 37 Z" fill="#dc2626"/>
    <path d="M45 42 L52 43" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
    <path d="M58 43 L65 42" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
    <circle cx="49" cy="45.5" r="1.8" fill="#0f172a"/>
    <circle cx="61" cy="45.5" r="1.8" fill="#0f172a"/>
    <path d="M52 53 Q55 55 58 53" fill="none" stroke="#b45309" stroke-width="1.3" stroke-linecap="round"/>
  </svg>`;
}
