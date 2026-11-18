import { WEAPONS } from '../data/itemsAndSkills';
import { EnemyEntity, GameEngine, WorldDrop } from './GameEngine';

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

  const isXiao = s.mode === 'xiaoduanshui';
  const wDef = WEAPONS[s.equippedWeapon] || WEAPONS.sword_1;

  ctx.save();
  ctx.translate(p.x, p.y);

  // 缩地化雾形态：多层次旋转灵雾与符文光核
  if (p.mistDashTimer > 0) {
    for (let i = 0; i < 5; i++) {
      const a = t * 8 + i * 1.25;
      const rx = Math.cos(a) * 14;
      const ry = -30 + Math.sin(a * 1.3) * 12;
      const grad = ctx.createRadialGradient(rx, ry, 2, rx, ry, 24);
      grad.addColorStop(0, 'rgba(233, 213, 255, 0.9)');
      grad.addColorStop(0.55, 'rgba(168, 85, 247, 0.55)');
      grad.addColorStop(1, 'rgba(72, 201, 176, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(rx, ry, 24, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  // 脚底接地阴影
  if (p.onGround) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 1, 16, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.scale(p.facing, 1);

  const speedRatio = Math.min(1, Math.abs(p.vx) / 240);
  const runPhase = p.animTime * 15;
  const bob = p.onGround ? Math.abs(Math.sin(runPhase)) * 3.2 * speedRatio : 0;
  const lean = p.onGround ? speedRatio * 0.11 : p.vy < 0 ? -0.06 : 0.08;

  ctx.translate(0, -bob);
  ctx.rotate(lean);

  // 1. 身后飘逸侠客披风 / 镇妖司长摆燕尾
  const capeWave1 = Math.sin(t * 9) * 6 + speedRatio * 14;
  const capeWave2 = Math.cos(t * 11) * 5 + speedRatio * 20;
  ctx.fillStyle = isXiao ? '#3b0764' : '#7f1d1d';
  ctx.strokeStyle = isXiao ? '#c084fc' : '#e2b659';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-5, -44);
  ctx.quadraticCurveTo(-18 - capeWave1 * 0.5, -28, -24 - capeWave2, -6 + bob * 0.5);
  ctx.lineTo(-11 - capeWave1 * 0.4, -4);
  ctx.quadraticCurveTo(-8, -24, -2, -40);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 2. 双腿双关节骨骼动画（大腿 -> 膝盖 -> 绑腿战靴）
  const legSwing = p.onGround
    ? Math.sin(runPhase) * 0.62 * speedRatio
    : p.vy < 0
      ? 0.42
      : -0.28;

  const drawLeg = (angle: number, isFront: boolean) => {
    ctx.save();
    ctx.translate(isFront ? 2 : -3, -22);
    ctx.rotate(angle);
    // 大腿玄色劲裤
    ctx.fillStyle = isFront ? '#1e293b' : '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-4, 0, 8, 12, 3);
    ctx.fill();
    // 小腿与护胫战靴
    ctx.translate(0, 11);
    ctx.rotate(p.onGround ? Math.max(0, -angle * 0.65) : 0.35);
    ctx.fillStyle = isFront ? '#132a3a' : '#0b1924';
    ctx.beginPath();
    ctx.roundRect(-3.5, 0, 7, 11, 2);
    ctx.fill();
    // 金边皂靴
    ctx.fillStyle = '#090d14';
    ctx.strokeStyle = '#e2b659';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-4, 9);
    ctx.lineTo(7, 9);
    ctx.lineTo(9, 12);
    ctx.lineTo(-4, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  drawLeg(-legSwing, false);
  drawLeg(legSwing, true);

  // 3. 后手手臂
  ctx.save();
  ctx.translate(-4, -41);
  ctx.rotate(-legSwing * 0.7 - 0.2);
  ctx.fillStyle = '#0f2330';
  ctx.beginPath();
  ctx.roundRect(-3, 0, 6, 15, 2.5);
  ctx.fill();
  ctx.fillStyle = '#f3d5b8';
  ctx.beginPath();
  ctx.arc(0, 16, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. 躯干：镇妖司暗青交领云肩劲装 + 护腰玄鸟佩
  const robeGrad = ctx.createLinearGradient(0, -45, 0, -18);
  robeGrad.addColorStop(0, isXiao ? '#312e81' : '#16384c');
  robeGrad.addColorStop(1, isXiao ? '#1e1b4b' : '#0b1d29');
  ctx.fillStyle = robeGrad;
  ctx.strokeStyle = isXiao ? '#c084fc' : '#48c9b0';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-8, -44);
  ctx.lineTo(9, -44);
  ctx.lineTo(11, -18);
  ctx.lineTo(-10, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 交领金边与腰封玄鸟玉佩
  ctx.strokeStyle = '#e2b659';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-4, -44);
  ctx.lineTo(4, -31);
  ctx.lineTo(8, -44);
  ctx.stroke();

  ctx.fillStyle = '#991b1b';
  ctx.fillRect(-9.5, -26, 19.5, 4.5);
  ctx.fillStyle = '#e2b659';
  ctx.fillRect(-2, -26.5, 6, 5.5);
  // 随身青玉佩
  ctx.fillStyle = '#48c9b0';
  ctx.beginPath();
  ctx.arc(4, -19, 3, 0, Math.PI * 2);
  ctx.fill();

  // 5. 头部：18岁少年俊朗侧颜、剑眉星目、银冠高马尾与双飘带
  // 飘动朱砂抹额长带
  ctx.strokeStyle = isXiao ? '#a855f7' : '#dc2626';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, -53);
  ctx.quadraticCurveTo(-18, -55 + Math.sin(t * 12) * 5, -30 - speedRatio * 8, -48 + Math.cos(t * 10) * 6);
  ctx.stroke();

  // 墨发后摆高马尾
  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.moveTo(-5, -58);
  ctx.quadraticCurveTo(-17, -64, -22 - speedRatio * 5, -50 + Math.sin(t * 10) * 3);
  ctx.quadraticCurveTo(-14, -48, -6, -53);
  ctx.fill();

  // 少年面庞
  ctx.fillStyle = '#f6dac0';
  ctx.beginPath();
  ctx.roundRect(-6.5, -59, 14, 15, 5.5);
  ctx.fill();

  // 额发与鬓角
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(-7, -53);
  ctx.quadraticCurveTo(-6, -63, 4, -61);
  ctx.quadraticCurveTo(9, -59, 8, -53);
  ctx.quadraticCurveTo(3, -56, -2, -55);
  ctx.closePath();
  ctx.fill();

  // 束发银冠
  ctx.fillStyle = '#e2b659';
  ctx.fillRect(-3, -64, 6, 4);

  // 抹额红带
  ctx.fillStyle = isXiao ? '#c084fc' : '#dc2626';
  ctx.fillRect(-6.5, -55.5, 14, 2.5);

  // 锐利双眸高光
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(2, -51.5, 3.5, 2.5);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(3.5, -51.5, 1.2, 1.2);

  // 6. 前手护腕与实时持握的五系专属兵器模型！
  const slashProg = engine.activeSlash ? engine.activeSlash.progress : -1;
  let armAngle = slashProg >= 0 ? -1.1 + slashProg * 2.3 : 0.35 + legSwing * 0.45;
  if (wDef.archetype === 'greatsword' && slashProg < 0) armAngle = -0.55; // 重刃平时霸气扛肩！

  ctx.save();
  ctx.translate(1, -39);
  ctx.rotate(armAngle);

  // 吞兽金护肩 + 护腕
  ctx.fillStyle = '#e2b659';
  ctx.beginPath();
  ctx.arc(0, 0, 4.5, Math.PI * 0.8, Math.PI * 2.2);
  ctx.fill();

  ctx.fillStyle = '#16384c';
  ctx.beginPath();
  ctx.roundRect(-3, 0, 6, 14, 2.5);
  ctx.fill();
  ctx.fillStyle = '#b45309';
  ctx.fillRect(-3, 9, 6, 4);

  // 掌中真实比例冷兵器绘制
  ctx.translate(1, 14);
  if (wDef.archetype === 'sword') {
    // 长剑：剑柄剑穗 + 鎏金剑格 + 寒芒剑身
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-6, -1.5, 7, 3);
    ctx.fillStyle = '#e2b659';
    ctx.fillRect(0, -5, 2.5, 10);
    ctx.fillStyle = wDef.color;
    ctx.beginPath();
    ctx.moveTo(2.5, -2.5);
    ctx.lineTo(34, -1);
    ctx.lineTo(39, 0);
    ctx.lineTo(34, 1);
    ctx.lineTo(2.5, 2.5);
    ctx.closePath();
    ctx.fill();
  } else if (wDef.archetype === 'greatsword') {
    // 重刃陌刀：宽厚霸道巨剑
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-10, -2, 11, 4);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, -7, 4, 14);
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = wDef.glowColor;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(4, -5.5);
    ctx.lineTo(44, -4);
    ctx.lineTo(52, 1);
    ctx.lineTo(42, 5.5);
    ctx.lineTo(4, 5.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (wDef.archetype === 'spear') {
    // 红缨点钢长枪
    ctx.fillStyle = '#92400e';
    ctx.fillRect(-18, -1.6, 56, 3.2);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(38, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(39, -3.5);
    ctx.lineTo(54, 0);
    ctx.lineTo(39, 3.5);
    ctx.closePath();
    ctx.fill();
  } else if (wDef.archetype === 'daggers') {
    // 峨眉残月双刺
    ctx.strokeStyle = wDef.glowColor;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(6, 0, 14, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();
  } else {
    // 乌金九节软鞭
    ctx.strokeStyle = wDef.glowColor;
    ctx.lineWidth = 2.6;
    ctx.setLineDash([5, 2]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(14, 10, 24, 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();

  // 子母护体灵剑环绕
  if (p.orbitSwordTimer > 0) {
    ctx.scale(p.facing, 1); // 还原水平朝向使飞剑正圆环绕
    for (let i = 0; i < 3; i++) {
      const ang = p.orbitAngle + (i * Math.PI * 2) / 3;
      const sx = Math.cos(ang) * 60;
      const sy = -30 + Math.sin(ang) * 60;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(ang + Math.PI * 0.5);
      ctx.fillStyle = '#bae6fd';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(3.5, 8);
      ctx.lineTo(0, 13);
      ctx.lineTo(-3.5, 8);
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

  ctx.save();
  ctx.translate(e.x, e.y);

  // 地面投影
  if (!e.profile.flying) {
    ctx.fillStyle = 'rgba(0,0,0,0.42)';
    ctx.beginPath();
    ctx.ellipse(0, 1, w * 0.48, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.scale(e.facing, 1);
  if (flash) {
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 14;
  }

  const walk = Math.sin(t * 9 + e.id) * 5;

  if (kind === 'paper_swordsman') {
    // 剪纸刀客：锯齿折纸白衣、朱砂腮红纸人面、黄符封额、手持弧月纸刀
    ctx.fillStyle = flash ? '#fff' : '#f1ede4';
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-12, -38);
    ctx.lineTo(12, -38);
    ctx.lineTo(16, -6);
    ctx.lineTo(8, -11);
    ctx.lineTo(0, -4);
    ctx.lineTo(-8, -11);
    ctx.lineTo(-16, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 纸人头与朱砂点腮
    ctx.beginPath();
    ctx.arc(0, -46, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(4, -44, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // 额前镇魂黄符
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-2, -55, 5, 9);
    // 手中纸弯刀
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(8, -28);
    ctx.quadraticCurveTo(24, -32 + walk, 28, -46 + walk);
    ctx.stroke();
  } else if (kind === 'lantern_ghost') {
    // 提灯冥火鬼：破旧斗笠、飘荡幽魂下摆、手提碧绿鬼火灯笼
    const sway = Math.sin(t * 5 + e.id) * 4;
    ctx.fillStyle = flash ? '#fff' : '#163038';
    ctx.beginPath();
    ctx.moveTo(-12, -30);
    ctx.quadraticCurveTo(0, -44, 12, -30);
    ctx.quadraticCurveTo(10, -8, -8 + sway, 2);
    ctx.quadraticCurveTo(-14, -14, -12, -30);
    ctx.fill();

    // 斗笠
    ctx.fillStyle = '#451a03';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-18, -32);
    ctx.lineTo(0, -44);
    ctx.lineTo(18, -32);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 前伸手骨与碧火灯笼
    ctx.strokeStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(8, -24);
    ctx.lineTo(20, -22);
    ctx.lineTo(20, -14);
    ctx.stroke();
    ctx.fillStyle = '#48c9b0';
    ctx.beginPath();
    ctx.arc(20, -10, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'bronze_guard') {
    // 玄甲重盾傀儡：红缨铁兜鍪、重装山文甲、饕餮纹巨型青铜盾！
    ctx.fillStyle = flash ? '#fff' : '#334155';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-14, -46, 28, 38, 4);
    ctx.fill();
    ctx.stroke();
    // 战靴迈步
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-10 + walk * 0.4, -8, 8, 8);
    ctx.fillRect(3 - walk * 0.4, -8, 8, 8);
    // 红缨头盔与金目
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(0, -58);
    ctx.quadraticCurveTo(-12, -66, -16, -52);
    ctx.lineTo(0, -52);
    ctx.fill();
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(0, -50, 10, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.fillRect(3, -51, 5, 2.5);
    // 正面饕餮青铜重盾
    ctx.fillStyle = '#b45309';
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(11, -48, 10, 42, 3);
    ctx.fill();
    ctx.stroke();
  } else if (kind === 'scroll_demon') {
    // 飞天书妖：展开拍打的古画卷双翼 + 水墨符箓灵核
    const flap = Math.sin(t * 10 + e.id) * 10;
    ctx.fillStyle = flash ? '#fff' : '#fef3c7';
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-24, -28 + flap);
    ctx.quadraticCurveTo(-10, -38, 0, -24);
    ctx.quadraticCurveTo(10, -38, 24, -28 + flap);
    ctx.lineTo(22, -12 + flap);
    ctx.quadraticCurveTo(0, -18, -22, -12 + flap);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(0, -22, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'plague_toad') {
    // 毒沼三足蟾：圆鼓墨绿身躯、紫晶毒背瘤、金瞳巨口
    ctx.fillStyle = flash ? '#fff' : '#365314';
    ctx.strokeStyle = '#a3e635';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(0, -15, 21, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // 紫毒腺瘤
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(-8, -26, 4, 0, Math.PI * 2);
    ctx.arc(2, -28, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(12, -22, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'opera_puppet') {
    // 梨园提线木偶：顶部傀儡悬丝、双翎子凤冠、红绸水袖戏袍
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-8, -54);
    ctx.lineTo(-10, -110);
    ctx.moveTo(8, -54);
    ctx.lineTo(10, -110);
    ctx.stroke();

    ctx.fillStyle = flash ? '#fff' : '#9d174d';
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-8, -42);
    ctx.lineTo(8, -42);
    ctx.lineTo(16, -2);
    ctx.lineTo(-16, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // 惨白脸谱与长翎子
    ctx.fillStyle = '#fff1f2';
    ctx.beginPath();
    ctx.arc(0, -48, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-2, -55);
    ctx.quadraticCurveTo(-18, -72, -28, -56);
    ctx.moveTo(2, -55);
    ctx.quadraticCurveTo(-12, -74, -22, -62);
    ctx.stroke();
  } else if (kind === 'bell_gargoyle') {
    // 飞天金翅夜叉：拍打金色双翼 + 赤鬼战躯
    const wingY = Math.sin(t * 12 + e.id) * 14;
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(-4, -32);
    ctx.lineTo(-28, -48 + wingY);
    ctx.lineTo(-18, -18);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = flash ? '#fff' : '#9a3412';
    ctx.beginPath();
    ctx.roundRect(-11, -40, 22, 30, 5);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(5, -34, 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // ==================== 七大守关妖王 / 宿敌 Boss 专属霸气法相！ ====================
    // 背后旋转太极/妖气神环
    ctx.save();
    ctx.translate(0, -h * 0.55);
    ctx.rotate(t * 1.8);
    ctx.strokeStyle = e.profile.accentColor;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([10, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(w, h) * 0.62, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    if (kind === 'boss_xiao_duanshui' || kind === 'boss_pei_wuji') {
      // 人形剑道/枪道宗师 Boss（萧断水银甲紫披风 / 裴无极黑炎重剑宗师）
      const isPei = kind === 'boss_pei_wuji';
      // 猎猎狂舞宗师大披风
      ctx.fillStyle = isPei ? '#7f1d1d' : '#4c1d95';
      ctx.beginPath();
      ctx.moveTo(-8, -50);
      ctx.quadraticCurveTo(-34, -36 + Math.sin(t * 9) * 8, -38, -2);
      ctx.lineTo(-8, -6);
      ctx.closePath();
      ctx.fill();

      // 宗师战甲躯干
      ctx.fillStyle = flash ? '#fff' : isPei ? '#1c1917' : '#1e1b4b';
      ctx.strokeStyle = e.profile.accentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-13, -50);
      ctx.lineTo(13, -50);
      ctx.lineTo(16, -8);
      ctx.lineTo(-15, -8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 头部冠冕与披散白发/银冠
      ctx.fillStyle = '#f5d5b8';
      ctx.beginPath();
      ctx.arc(0, -57, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isPei ? '#e2e8f0' : '#0f172a';
      ctx.beginPath();
      ctx.arc(-2, -60, 9.5, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();

      // 掌中神兵（裴无极黑炎魔剑 / 萧断水寒星银龙枪）
      ctx.strokeStyle = isPei ? '#ef4444' : '#e9d5ff';
      ctx.lineWidth = isPei ? 5 : 3.5;
      ctx.beginPath();
      ctx.moveTo(-6, -30);
      ctx.lineTo(44, -40 + walk);
      ctx.stroke();
    } else {
      // 巨型妖魔宗主法相（墨千秋 / 赤铜熔炉巨灵 / 傩面戏神 / 金翅大鹏王 / 尸仙烛阴）
      const bodyGrad = ctx.createLinearGradient(0, -h, 0, 0);
      bodyGrad.addColorStop(0, flash ? '#ffffff' : e.profile.accentColor);
      bodyGrad.addColorStop(0.35, flash ? '#ffffff' : e.profile.primaryColor);
      bodyGrad.addColorStop(1, '#090b10');

      ctx.fillStyle = bodyGrad;
      ctx.strokeStyle = e.profile.accentColor;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-w * 0.35, -h * 0.88);
      ctx.lineTo(0, -h);
      ctx.lineTo(w * 0.35, -h * 0.88);
      ctx.lineTo(w * 0.52, -h * 0.45);
      ctx.lineTo(w * 0.38, -4);
      ctx.lineTo(-w * 0.38, -4);
      ctx.lineTo(-w * 0.52, -h * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 巨角与威严三目妖瞳
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-12, -h * 0.9);
      ctx.lineTo(-24, -h - 14);
      ctx.moveTo(12, -h * 0.9);
      ctx.lineTo(24, -h - 14);
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(8, -h * 0.72, 5, 0, Math.PI * 2);
      ctx.arc(-4, -h * 0.72, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();

  // 小怪受伤血条与眩晕标记
  if (!e.profile.isBoss && e.hp < e.maxHp) {
    ctx.fillStyle = 'rgba(7, 10, 16, 0.85)';
    ctx.fillRect(-20, -h - 13, 40, 5);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-19, -h - 12, 38 * Math.max(0, e.hp / e.maxHp), 3);
  }
  if (e.stunTimer > 0) {
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 12px serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ 震晕 ✦', 0, -h - 18);
  }

  ctx.restore();

  // 裴无极头顶显形的【九幽蚀心蛊】多触须妖蛊体！
  if (e.hasGuParasite && e.guHp && e.guHp > 0 && e.guX !== undefined && e.guY !== undefined) {
    ctx.save();
    ctx.translate(e.guX, e.guY);
    for (let i = 0; i < 6; i++) {
      const a = t * 5 + (i * Math.PI) / 3;
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(Math.cos(a) * 14, 10, Math.cos(a) * 22, 18 + Math.sin(t * 9 + i) * 4);
      ctx.stroke();
    }
    ctx.fillStyle = '#7e22ce';
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 11px serif';
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

  // 如果是常驻宝物或秘卷，底部绘制青石莲花宝座底座！
  if (d.isStaticPickup) {
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.fillRect(-16, -8, 32, 8);
    ctx.strokeRect(-16, -8, 32, 8);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-12, -12, 24, 4);
  }

  ctx.translate(0, -20 + bob);

  // 柔和灵光晕染
  const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
  glow.addColorStop(0, `${d.color}66`);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();

  if (d.kind === 'gold') {
    // 银锭元宝造型
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
    ctx.beginPath();
    ctx.arc(0, -2, 4, Math.PI, 0);
    ctx.fill();
  } else if (d.kind === 'heart') {
    // 朱砂灵符
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1.3;
    ctx.fillRect(-6, -9, 12, 18);
    ctx.strokeRect(-6, -9, 12, 18);
  } else if (d.kind === 'consumable') {
    // 青瓷丹药玉葫芦（彻底告别圆圈！）
    ctx.fillStyle = '#0d9488';
    ctx.strokeStyle = '#99f6e4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 4, 7.5, 0, Math.PI * 2);
    ctx.arc(0, -5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-4, -1.5, 8, 2.5);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-2, -12, 4, 3);
  } else if (d.kind === 'weapon' || d.kind === 'armor') {
    // 鎏金朱漆藏兵宝箱
    ctx.fillStyle = '#7f1d1d';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-13, -6, 26, 16, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-13, 0, 26, 2.5);
    ctx.fillRect(-3, -2, 6, 6);
  } else {
    // 神通秘卷 / 破妄古镜 / 本命妖丹：璀璨八芒法宝菱晶
    ctx.rotate(t * 1.8);
    ctx.fillStyle = d.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(9, 0);
    ctx.lineTo(0, 12);
    ctx.lineTo(-9, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();

  if (d.isStaticPickup || d.kind === 'yao_core') {
    ctx.save();
    ctx.font = 'bold 11.5px "STKaiti", "KaiTi", serif';
    ctx.textAlign = 'center';
    const tw = ctx.measureText(d.label).width + 12;
    ctx.fillStyle = 'rgba(8, 11, 18, 0.82)';
    ctx.strokeStyle = 'rgba(226, 182, 89, 0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(d.x - tw * 0.5, d.y - 52 + bob, tw, 18, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fef08a';
    ctx.fillText(d.label, d.x, d.y - 39 + bob);
    ctx.restore();
  }
}
