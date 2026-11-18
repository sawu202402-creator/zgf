import { EnemyKind } from '../types';
import { AssetKey, Assets } from './AssetLoader';
import { EnemyEntity, GameEngine, WorldDrop } from './GameEngine';

const ENEMY_SPRITE_MAP: Record<EnemyKind, AssetKey> = {
  paper_swordsman: 'mob_paper_swordsman',
  lantern_ghost: 'mob_lantern_ghost',
  bronze_guard: 'mob_bronze_guard',
  scroll_demon: 'mob_scroll_demon',
  plague_toad: 'mob_plague_toad',
  opera_puppet: 'mob_opera_puppet',
  bell_gargoyle: 'mob_bell_gargoyle',
  boss_scroll_king: 'boss_scroll_king',
  boss_furnace_titan: 'boss_furnace_titan',
  boss_xiao_duanshui: 'npc_xiao_boss',
  boss_opera_god: 'boss_opera_god',
  boss_thunder_yaksha: 'mob_bell_gargoyle',
  boss_pei_wuji: 'boss_opera_god',
  boss_zhuyin: 'boss_zhuyin',
};

export function drawHeroCharacter(
  ctx: CanvasRenderingContext2D,
  engine: GameEngine,
  t: number
): void {
  const p = engine.player;
  const s = engine.slot;
  if (!s) return;

  if (p.invulnTimer > 0 && Math.floor(p.invulnTimer * 20) % 2 === 0 && p.mistDashTimer <= 0) {
    return;
  }

  ctx.save();
  ctx.translate(p.x, p.y);

  // 缩地化雾状态：幻化紫青云雾灵体
  if (p.mistDashTimer > 0) {
    for (let i = 0; i < 5; i++) {
      const a = t * 8 + i * 1.25;
      const rx = Math.cos(a) * 16;
      const ry = -34 + Math.sin(a * 1.3) * 14;
      const grad = ctx.createRadialGradient(rx, ry, 2, rx, ry, 26);
      grad.addColorStop(0, 'rgba(233, 213, 255, 0.92)');
      grad.addColorStop(0.55, 'rgba(168, 85, 247, 0.58)');
      grad.addColorStop(1, 'rgba(72, 201, 176, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(rx, ry, 26, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  // 脚下柔和接地阴影
  if (p.onGround) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 22, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const isXiao = s.mode === 'xiaoduanshui';
  let spriteKey: AssetKey = 'hero_idle';
  if (isXiao) {
    spriteKey = 'npc_xiao_boss';
  } else if (engine.activeSlash) {
    spriteKey = 'hero_attack';
  } else if (!p.onGround) {
    spriteKey = 'hero_jump';
  } else if (Math.abs(p.vx) > 25) {
    spriteKey = 'hero_run';
  }

  const img = Assets.get(spriteKey) || Assets.get('hero_idle');
  if (img) {
    const targetH = isXiao ? 92 : spriteKey === 'hero_attack' ? 88 : 84;
    const drawW = img.width * (targetH / img.height);

    const speedRatio = Math.min(1, Math.abs(p.vx) / 240);
    const runBob = p.onGround ? Math.abs(Math.sin(p.animTime * 15)) * 4.5 * speedRatio : 0;
    const breatheY = p.onGround && speedRatio < 0.1 ? 1 + Math.sin(t * 4.2) * 0.022 : 1;
    const runSquashX = p.onGround && speedRatio > 0.2 ? 1 + Math.sin(p.animTime * 30) * 0.035 : 1;

    ctx.save();
    ctx.translate(0, -runBob);
    // hero_* 原图朝右(+1)，npc_xiao_boss 原图朝左(-1)
    const flipX = isXiao ? -p.facing : p.facing;
    ctx.scale(flipX * runSquashX, breatheY);
    ctx.drawImage(img, -drawW * 0.48, -targetH + 3, drawW, targetH);
    ctx.restore();
  } else {
    // 极速加载前1帧微兜底
    ctx.fillStyle = '#16384c';
    ctx.fillRect(-12, -62, 24, 62);
  }

  // 子母护体灵剑环绕特效
  if (p.orbitSwordTimer > 0) {
    for (let i = 0; i < 3; i++) {
      const ang = p.orbitAngle + (i * Math.PI * 2) / 3;
      const sx = Math.cos(ang) * 62;
      const sy = -36 + Math.sin(ang) * 62;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(ang + Math.PI * 0.5);
      ctx.fillStyle = '#bae6fd';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(4, 8);
      ctx.lineTo(0, 14);
      ctx.lineTo(-4, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  ctx.restore();
}

export function drawMonsterOrBoss(
  ctx: CanvasRenderingContext2D,
  e: EnemyEntity,
  t: number
): void {
  const kind = e.profile.kind;
  const w = e.profile.w;
  const h = e.profile.h;
  const flash = e.hurtFlash > 0;
  const spriteKey = ENEMY_SPRITE_MAP[kind];
  const img = Assets.get(spriteKey);

  ctx.save();
  ctx.translate(e.x, e.y);

  if (!e.profile.flying) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 2, w * 0.58, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Boss 专属背光法阵光环
  if (e.profile.isBoss) {
    ctx.save();
    ctx.translate(0, -h * 0.65);
    ctx.rotate(t * 1.4);
    ctx.strokeStyle = e.profile.accentColor;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 2.2;
    ctx.setLineDash([12, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(w, h) * 0.72, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  if (img) {
    // 所有怪物与Boss原图统一朝左(-1)，因此 e.facing === -1 时正绘，e.facing === 1 时水平镜像！
    const targetH = e.profile.isBoss ? h * 1.55 : h * 1.45;
    const drawW = img.width * (targetH / img.height);
    const bob = e.profile.flying
      ? Math.sin(t * 5 + e.id) * 4
      : Math.abs(Math.sin(t * 9 + e.id)) * 2.8;
    const squash = 1 + Math.sin(t * 6 + e.id) * 0.025;

    ctx.save();
    ctx.translate(0, -bob);
    ctx.scale(e.facing === -1 ? 1 : -1, squash);

    // 雷音大鹏王或裴无极共享高精度贴图时叠加专属魔焰光晕区分气场
    if (kind === 'boss_pei_wuji' || kind === 'boss_thunder_yaksha') {
      ctx.shadowColor = e.profile.accentColor;
      ctx.shadowBlur = 16;
    }

    const source = flash ? Assets.getWhiteFlash(spriteKey) || img : img;
    ctx.drawImage(source, -drawW * 0.5, -targetH + 4, drawW, targetH);
    ctx.restore();
  } else {
    ctx.fillStyle = flash ? '#ffffff' : e.profile.primaryColor;
    ctx.fillRect(-w * 0.5, -h, w, h);
  }

  if (!e.profile.isBoss && e.hp < e.maxHp) {
    ctx.fillStyle = 'rgba(6, 9, 15, 0.88)';
    ctx.fillRect(-22, -h * 1.42 - 10, 44, 5);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-21, -h * 1.42 - 9, 42 * Math.max(0, e.hp / e.maxHp), 3);
  }

  if (e.stunTimer > 0) {
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 12px "STKaiti", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ 震晕 ✦', 0, -h * 1.45 - 14);
  }

  ctx.restore();

  // 裴无极头顶显形的【九幽蚀心蛊】妖核！
  if (e.hasGuParasite && e.guHp && e.guHp > 0 && e.guX !== undefined && e.guY !== undefined) {
    ctx.save();
    ctx.translate(e.guX, e.guY - 22);
    for (let i = 0; i < 6; i++) {
      const a = t * 5 + (i * Math.PI) / 3;
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(Math.cos(a) * 14, 10, Math.cos(a) * 24, 20 + Math.sin(t * 9 + i) * 4);
      ctx.stroke();
    }
    ctx.fillStyle = '#7e22ce';
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 11.5px "STKaiti", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f5d0fe';
    ctx.fillText(`九幽蚀心蛊 (${e.guHp})`, 0, -20);
    ctx.restore();
  }
}

export function drawWorldDrop(ctx: CanvasRenderingContext2D, d: WorldDrop, t: number): void {
  const bob = Math.sin(t * 4.2 + d.x * 0.05) * 4;
  ctx.save();
  ctx.translate(d.x, d.y);

  if (d.isStaticPickup) {
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#cfa349';
    ctx.lineWidth = 1.3;
    ctx.fillRect(-18, -7, 36, 7);
    ctx.strokeRect(-18, -7, 36, 7);
  }

  ctx.translate(0, -20 + bob);

  const glow = ctx.createRadialGradient(0, 0, 3, 0, 0, 26);
  glow.addColorStop(0, `${d.color}66`);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 26, 0, Math.PI * 2);
  ctx.fill();

  const chestImg = Assets.get('prop_chest');
  const gourdImg = Assets.get('prop_gourd');

  if ((d.kind === 'weapon' || d.kind === 'armor') && chestImg) {
    const h = 36;
    const w = chestImg.width * (h / chestImg.height);
    ctx.drawImage(chestImg, -w * 0.5, -h * 0.45, w, h);
  } else if ((d.kind === 'consumable' || d.kind === 'max_up') && gourdImg) {
    const h = 34;
    const w = gourdImg.width * (h / gourdImg.height);
    ctx.drawImage(gourdImg, -w * 0.5, -h * 0.5, w, h);
  } else if (d.kind === 'gold') {
    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-9, -2);
    ctx.quadraticCurveTo(0, 6, 9, -2);
    ctx.lineTo(6, 5);
    ctx.lineTo(-6, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (d.kind === 'heart') {
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1.3;
    ctx.fillRect(-6, -9, 12, 18);
    ctx.strokeRect(-6, -9, 12, 18);
  } else {
    ctx.rotate(t * 1.8);
    ctx.fillStyle = d.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, -13);
    ctx.lineTo(10, 0);
    ctx.lineTo(0, 13);
    ctx.lineTo(-10, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();

  if (d.isStaticPickup || d.kind === 'yao_core') {
    ctx.save();
    ctx.font = 'bold 11.5px "STKaiti", "KaiTi", serif';
    ctx.textAlign = 'center';
    const tw = ctx.measureText(d.label).width + 14;
    ctx.fillStyle = 'rgba(7, 10, 18, 0.86)';
    ctx.strokeStyle = 'rgba(207, 163, 73, 0.65)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(d.x - tw * 0.5, d.y - 54 + bob, tw, 18, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fef08a';
    ctx.fillText(d.label, d.x, d.y - 41 + bob);
    ctx.restore();
  }
}
