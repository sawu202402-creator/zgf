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
  if (itemId === 'suodi_talisman') {
    return `<img src="${Assets.getUrl('item_talisman_scroll')}" width="28" height="28" style="width:28px;height:28px;max-width:28px;max-height:28px;flex-shrink:0;object-fit:contain;display:block;filter:drop-shadow(0 2px 5px rgba(45,212,191,0.55));" alt="缩地符" />`;
  }
  if (itemId === 'beggar_chicken') {
    return `<img src="${Assets.getUrl('item_lotus_chicken')}" width="30" height="26" style="width:30px;height:26px;max-width:30px;max-height:26px;flex-shrink:0;object-fit:contain;display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.85));" alt="叫花鸡" />`;
  }
  return `<img src="${Assets.getUrl('item_celadon_gourd')}" width="26" height="28" style="width:26px;height:28px;max-width:26px;max-height:28px;flex-shrink:0;object-fit:contain;display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.85));" alt="丹药" />`;
}

export function resolveSpeakerPortraitKey(speaker: string): AssetKey {
  if (speaker.includes('苏清晏')) return 'bust_su_qingyan';
  if (speaker.includes('欧冶残')) return 'bust_ouye_can';
  if (speaker.includes('白掌柜')) return 'bust_bai_zhanggui';
  if (speaker.includes('萧断水')) return 'bust_xiao_duanshui';
  if (speaker.includes('裴无极')) return 'bust_peiwuji';
  if (speaker.includes('墨千秋')) return 'boss_ik_0';
  if (speaker.includes('拓跋烈') || speaker.includes('大将军')) return 'boss_gen_0';
  if (speaker.includes('敖溟') || speaker.includes('蛟王')) return 'boss_lev_0';
  if (speaker.includes('刑天') || speaker.includes('战魄')) return 'boss_wdn_0';
  if (speaker.includes('炉君') || speaker.includes('巨灵')) return 'boss_ft_0';
  if (speaker.includes('傩')) return 'boss_op_0';
  if (speaker.includes('大鹏') || speaker.includes('夜叉')) return 'boss_yk_0';
  if (speaker.includes('烛阴')) return 'boss_pei_2';
  if (speaker.includes('《') || speaker.includes('碑') || speaker.includes('秘档')) {
    return 'item_relic_pedestal';
  }
  return 'bust_liyicheng';
}

export function getSpeakerPortraitSvg(speaker: string, height = 215): string {
  const key = resolveSpeakerPortraitKey(speaker);
  return `<img src="${Assets.getUrl(key)}" decoding="sync" class="zx-frameless-bust" style="height:${height}px;max-height:${height}px;width:auto;max-width:100%;object-fit:contain;" alt="${speaker}" />`;
}

/**
 * Draw speaker portrait synchronously from pre-decoded Assets onto a persistent canvas so switching dialogue lines never stalls or reflows.
 */
export function renderSpeakerPortraitCanvas(
  canvas: HTMLCanvasElement,
  speaker: string,
  portraitH: number,
  alignInnerEdge: 'left' | 'right'
): AssetKey {
  const key = resolveSpeakerPortraitKey(speaker);
  canvas.dataset.speakerKey = key;
  const drawImg = (img: HTMLImageElement) => {
    const iw = Math.max(1, img.naturalWidth || img.width);
    const ih = Math.max(1, img.naturalHeight || img.height);
    const ratio = iw / ih;
    const maxW = Math.round(portraitH * 1.65);
    const dh = Math.min(portraitH, Math.round(maxW / Math.max(0.35, ratio)));
    const dw = Math.max(1, Math.round(dh * ratio));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.round(dw * dpr);
    const targetH = Math.round(dh * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    canvas.style.width = `${dw}px`;
    canvas.style.height = `${dh}px`;
    if (alignInnerEdge === 'right') {
      // 主角在左侧槽位：锚定外左边缘，保证绝不超出屏幕左界且宽幅衣袂不遮挡正文
      canvas.style.left = '-8px';
      canvas.style.right = 'auto';
    } else {
      // 角色在右侧槽位：锚定外右边缘，保证宽兵器/披风（如萧断水）100% 留在屏内不被裁切
      canvas.style.right = '-10px';
      canvas.style.left = 'auto';
    }
    const cctx = canvas.getContext('2d');
    if (cctx) {
      cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cctx.clearRect(0, 0, dw, dh);
      cctx.drawImage(img, 0, 0, dw, dh);
    }
  };
  const ready = Assets.get(key);
  if (ready) {
    drawImg(ready);
  } else {
    const cctx = canvas.getContext('2d');
    if (cctx) cctx.clearRect(0, 0, canvas.width, canvas.height);
    void Assets.waitFor(key).then((loaded) => {
      if (loaded && canvas.dataset.speakerKey === key) {
        drawImg(loaded);
      }
    });
  }
  return key;
}
