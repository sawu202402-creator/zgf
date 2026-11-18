import { AssetKey, Assets } from '../game/AssetLoader';
import { WeaponArchetype } from '../types';

/**
 * 统一国风鎏金乌木水墨器物徽章（彻底告别将抠图位图贴纸硬塞进UI列表的违和感！）
 */
export function getWeaponArtHtml(archetype: WeaponArchetype, width = 68): string {
  if (archetype === 'greatsword') {
    return `<svg viewBox="0 0 96 28" width="${width}" height="24" style="display:block;overflow:visible;">
      <defs>
        <linearGradient id="mdBlade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="65%" stop-color="#334155"/>
          <stop offset="100%" stop-color="#94a3b8"/>
        </linearGradient>
      </defs>
      <line x1="6" y1="14" x2="28" y2="14" stroke="#7c2d12" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="5" cy="14" r="3.5" fill="#cfa349"/>
      <path d="M27 6 L34 10 L34 18 L27 22 Z" fill="#cfa349" stroke="#451a03" stroke-width="1"/>
      <path d="M33 8 L86 6 L93 14 L82 21 L33 20 Z" fill="url(#mdBlade)" stroke="#cfa349" stroke-width="1.3"/>
      <line x1="40" y1="13.5" x2="78" y2="13" stroke="#f97316" stroke-width="1.4" stroke-dasharray="5 3"/>
    </svg>`;
  }
  return `<svg viewBox="0 0 96 26" width="${width}" height="22" style="display:block;overflow:visible;">
    <defs>
      <linearGradient id="swBlade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#64748b"/>
        <stop offset="55%" stop-color="#e2e8f0"/>
        <stop offset="100%" stop-color="#ffffff"/>
      </linearGradient>
    </defs>
    <line x1="7" y1="13" x2="24" y2="13" stroke="#134e4a" stroke-width="3.6" stroke-linecap="round"/>
    <circle cx="6" cy="13" r="3" fill="#cfa349"/>
    <path d="M23 6 Q29 13 23 20 L27 17 L27 9 Z" fill="#cfa349"/>
    <polygon points="27,10 82,11.2 93,13 82,14.8 27,16" fill="url(#swBlade)" stroke="#0f172a" stroke-width="0.9"/>
    <line x1="30" y1="13" x2="84" y2="13" stroke="#2dd4bf" stroke-width="1"/>
  </svg>`;
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
    return `<svg viewBox="0 0 36 36" width="26" height="26">
      <path d="M11 7 L18 11 L25 7 L31 13 L26 18 L25 30 L11 30 L10 18 L5 13 Z" fill="#17253b" stroke="#cfa349" stroke-width="1.6"/>
      <path d="M14 10 L18 17 L22 10" fill="none" stroke="#f6dc8d" stroke-width="1.3"/>
      <line x1="12" y1="21" x2="24" y2="21" stroke="#b91c1c" stroke-width="2.2"/>
    </svg>`;
  }
  if (slot === 'accessory') {
    return `<svg viewBox="0 0 36 36" width="26" height="26">
      <path d="M18 4 L18 10" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
      <circle cx="18" cy="20" r="9.5" fill="none" stroke="#2dd4bf" stroke-width="3.4"/>
      <circle cx="18" cy="20" r="4.2" fill="none" stroke="#ccfbf1" stroke-width="1.1"/>
    </svg>`;
  }
  if (slot === 'core') {
    return `<svg viewBox="0 0 36 36" width="26" height="26">
      <circle cx="18" cy="19" r="10" fill="#3b0764" stroke="#c084fc" stroke-width="1.8"/>
      <path d="M15 13 C21 12, 23 20, 17 24 C13 22, 13 16, 15 13 Z" fill="#f5d0fe"/>
    </svg>`;
  }
  if (itemId === 'beggar_chicken') {
    return `<svg viewBox="0 0 36 36" width="26" height="26">
      <ellipse cx="18" cy="20" rx="11" ry="8" fill="#365314" stroke="#cfa349" stroke-width="1.5"/>
      <line x1="9" y1="20" x2="27" y2="20" stroke="#facc15" stroke-width="1.3"/>
      <line x1="18" y1="13" x2="18" y2="27" stroke="#facc15" stroke-width="1.3"/>
    </svg>`;
  }
  return `<svg viewBox="0 0 36 36" width="26" height="26">
    <rect x="15" y="6" width="6" height="4" rx="1" fill="#dc2626"/>
    <path d="M15 10 L21 10 L22 15 C26 17, 26 27, 18 29 C10 27, 10 17, 14 15 Z" fill="#0f766e" stroke="#5eead4" stroke-width="1.5"/>
    <circle cx="16" cy="20" r="2" fill="#ccfbf1" opacity="0.7"/>
  </svg>`;
}

/**
 * 返回 100% 无框透明抠图半身大立绘（彻底摒弃圆框/方框大头贴！）
 */
export function getSpeakerPortraitSvg(speaker: string, height = 215): string {
  let key: AssetKey = 'bust_liyicheng';
  if (speaker.includes('苏清晏')) key = 'bust_su_qingyan';
  else if (speaker.includes('欧冶残')) key = 'bust_ouye_can';
  else if (speaker.includes('白掌柜')) key = 'bust_bai_zhanggui';
  else if (speaker.includes('萧断水')) key = 'bust_xiao_duanshui';
  else if (speaker.includes('裴无极') || speaker.includes('烛阴')) key = 'bust_peiwuji';
  return `<img src="${Assets.getUrl(key)}" class="zx-frameless-bust" style="height:${height}px;" alt="${speaker}" />`;
}
