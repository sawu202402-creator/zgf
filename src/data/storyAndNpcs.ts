import { StoryScene } from '../types';

export interface CharacterBio {
  id: string;
  name: string;
  ageTitle: string;
  color: string;
  summary: string;
}

export const CHARACTER_BIOS: CharacterBio[] = [
  {
    id: 'li_yicheng',
    name: '李逸承',
    ageTitle: '18岁 · 镇妖司见习斩妖人（男主角）',
    color: '#48c9b0',
    summary:
      '孤儿出身，由镇妖司魁首裴无极抚养传剑。十八岁少年意气，剑骨清奇，胸前常佩半枚玄鸟残玉。为查明恩师“叛逃”冤案夜闯九幽玄城，意外觉醒吞噬炼化百鬼妖丹的玄冥血脉。',
  },
  {
    id: 'su_qingyan',
    name: '苏清晏',
    ageTitle: '17岁 · 钦天监司辰女官',
    color: '#7dd3fc',
    summary:
      '精通星象推演与三昧灵符的世家少女。奉命入城封印龙脉裂隙，多次在危局中点醒李逸承：城颠之上的裴无极并非自愿堕魔，唯有寻齐【破妄古镜】与【完整玄鸟佩】方能破局。',
  },
  {
    id: 'xiao_duanshui',
    name: '萧断水',
    ageTitle: '21岁 · 镇妖司少统领（大师兄）',
    color: '#c084fc',
    summary:
      '李逸承的大师兄，一杆寒星银枪冠绝京畿。外冷内热，背负朝廷严令入城“清理门户”。在水牢与逸承死战试探其剑心后暗中相助。通关真结局后可作为隐藏第二主角全程操控！',
  },
  {
    id: 'ouye_can',
    name: '欧冶残',
    ageTitle: '60岁 · 赤火坊独臂铸剑师',
    color: '#fb923c',
    summary:
      '前朝铸剑大宗师后裔，三十年前被困玄城不肯为妖邪铸兵而自断一臂。感念李逸承少年侠骨，在赤火铸剑坊为其锤炼升阶五系神兵。',
  },
  {
    id: 'bai_zhanggui',
    name: '白掌柜',
    ageTitle: '年岁不详 · 子夜鬼市狐商',
    color: '#facc15',
    summary:
      '戴着笑面白狐面具、提青皮灯笼的神秘行商。只要有真金白银，无论是救命灵丹、名甲利刃还是失传秘籍皆可交易。',
  },
  {
    id: 'pei_wuji',
    name: '裴无极',
    ageTitle: '48岁 · 恩师 / 镇妖司前任魁首',
    color: '#ef4444',
    summary:
      '曾名震天下的剑道巨擘。三年前深入地脉发现上古尸仙“烛阴”即将复苏，遂甘背叛国骂名，以自身血肉为锁坐镇凌霄祭天坛压制里城，却被九幽蚀心蛊日夜侵蚀神智。',
  },
];

export const STORY_SCENES: Record<string, StoryScene> = {
  intro_gate: {
    id: 'intro_gate',
    title: '楔子 · 血月临城',
    lines: [
      {
        speaker: '李逸承',
        role: '18岁 · 镇妖司少年',
        portraitColor: '#48c9b0',
        text: '三年了……甲子血月再现，这座沉入地底的九幽玄城，果然破土重临人间。',
      },
      {
        speaker: '李逸承',
        role: '18岁 · 镇妖司少年',
        portraitColor: '#48c9b0',
        text: '世人皆骂师父裴无极勾结妖魔、叛出镇妖司，可他亲手教我“剑指不平、宁折不弯”——我绝不信他会背弃苍生！',
      },
      {
        speaker: '苏清晏',
        role: '钦天监司辰女官',
        portraitColor: '#7dd3fc',
        text: '留步！城门阴煞倒灌，寻常武人入内必被妖气侵体……咦？你胸前的半枚玄鸟玉佩，竟在吸收周围逸散的鬼气？',
      },
      {
        speaker: '李逸承',
        role: '18岁 · 镇妖司少年',
        portraitColor: '#48c9b0',
        text: '在下镇妖司李逸承。姑娘是钦天监的人？我入城只为寻我师父裴无极，讨一个真相。',
      },
      {
        speaker: '苏清晏',
        role: '钦天监司辰女官',
        portraitColor: '#7dd3fc',
        text: '我叫苏清晏。听好，整座玄城机关重重，东侧【万卷藏书阁】藏有轻功身法秘卷；若你在城中见到土地祠镇魂灯，记得驻足调息留档！',
      },
    ],
  },

  meet_library_su: {
    id: 'meet_library_su',
    title: '藏书古卷 · 破妄之秘',
    lines: [
      {
        speaker: '苏清晏',
        role: '钦天监司辰女官',
        portraitColor: '#7dd3fc',
        text: '李逸承，你来得正好！我刚翻阅前朝密档——这座玄城分作“阳表”与“阴里”两重天地！',
      },
      {
        speaker: '苏清晏',
        role: '钦天监司辰女官',
        portraitColor: '#7dd3fc',
        text: '裴前辈当年并非叛逃，而是用自己的神魂充当阵眼压制里城尸仙！如今他被【九幽蚀心蛊】操控，若你贸然登上祭天坛杀了他，大阵反而会彻底崩毁！',
      },
      {
        speaker: '李逸承',
        role: '18岁 · 镇妖司少年',
        portraitColor: '#48c9b0',
        text: '果然如此！清晏姑娘，我该如何救出师父、揪出真正的幕后黑手？',
      },
      {
        speaker: '苏清晏',
        role: '钦天监司辰女官',
        portraitColor: '#7dd3fc',
        text: '需集齐两件信物：一是藏书阁绝顶禁书室的【破妄古镜】（需练成蹬墙绝学方能攀上），二是散落在幽冥水牢深处的另一半【玄鸟玉佩】。切记！',
      },
    ],
  },

  boss_xiao_pre: {
    id: 'boss_xiao_pre',
    title: '水牢寒枪 · 师兄问剑',
    lines: [
      {
        speaker: '萧断水',
        role: '镇妖司少统领 · 大师兄',
        portraitColor: '#c084fc',
        text: '逸承，我守在幽冥水牢多时了。朝廷铁令：凡踏入玄城半步者，格杀勿论。你今年才十八岁，退回去，师兄替你担罪！',
      },
      {
        speaker: '李逸承',
        role: '18岁 · 镇妖司少年',
        portraitColor: '#48c9b0',
        text: '大师兄！师父正在祭天坛以残躯镇压九幽邪祟，我今日若退半步，此生还配握他传我的剑吗？！',
      },
      {
        speaker: '萧断水',
        role: '镇妖司少统领 · 大师兄',
        portraitColor: '#c084fc',
        text: '好一句不退半步！那就亮兵器吧——若你连我这杆寒星龙胆枪都接不住，去了祭天坛也是白白送死！',
      },
    ],
  },

  boss_xiao_post: {
    id: 'boss_xiao_post',
    title: '师门薪火 · 化雾奇符',
    grantAbility: 'mist_dash',
    lines: [
      {
        speaker: '萧断水',
        role: '镇妖司少统领 · 大师兄',
        portraitColor: '#c084fc',
        text: '咳……好小子，短短三年，你的手搓剑诀竟已青出于蓝！',
      },
      {
        speaker: '萧断水',
        role: '镇妖司少统领 · 大师兄',
        portraitColor: '#c084fc',
        text: '拿去吧，这是师父失踪前留给我的【缩地化雾符】。催动身法时可化雾穿过玄铁栅栏与剧毒瘴气。另外，水牢最西侧密室里，有你一直在找的另一半玉佩。',
      },
      {
        speaker: '李逸承',
        role: '18岁 · 镇妖司少年',
        portraitColor: '#48c9b0',
        text: '多谢大师兄成全！待我救回师父，再与师兄痛饮桂花酿！',
      },
    ],
  },

  altar_normal_end: {
    id: 'altar_normal_end',
    title: '结局一 · 折剑归尘（未集齐双信物）',
    lines: [
      {
        speaker: '裴无极',
        role: '弥留之际的恩师',
        portraitColor: '#ef4444',
        text: '逸承……你长大了，剑也很快……可惜，没能照出我神魂深处的蚀心蛊……',
      },
      {
        speaker: '李逸承',
        role: '18岁 · 镇妖司少年',
        portraitColor: '#48c9b0',
        text: '师父！！不——！！',
      },
      {
        speaker: '苏清晏',
        role: '钦天监司辰女官',
        portraitColor: '#7dd3fc',
        text: '大阵失去阵眼暂时沉入地脉，但里城中的尸仙烛阴并未授首……逸承，回城中寻齐【破妄古镜】（藏书阁顶层）与【完整玄鸟佩】（水牢西密室），我们一定能改写命数！',
      },
    ],
  },

  altar_invert_awakening: {
    id: 'altar_invert_awakening',
    title: '破妄见真 · 阴阳倒悬里城开启！',
    lines: [
      {
        speaker: '李逸承',
        role: '18岁 · 镇妖司少年',
        portraitColor: '#48c9b0',
        text: '破妄古镜，玄鸟合璧——起！！我看清了，盘踞在师父眉心的九幽蚀心蛊，给我碎！！',
      },
      {
        speaker: '裴无极',
        role: '清醒的恩师',
        portraitColor: '#facc15',
        text: '唔……蚀心蛊碎了！好徒儿，十八岁便有如此修为，为师没有看错你！',
      },
      {
        speaker: '九幽冥主·烛阴',
        role: '苍穹之上传来的古魔低语',
        portraitColor: '#ef4444',
        text: '区区凡人蝼蚁，竟敢坏本座血月祭典？！既如此，便叫尔等见识真正的【九幽倒悬里城】——天地翻转，万鬼噬天！！',
      },
      {
        speaker: '裴无极',
        role: '恩师嘱托',
        portraitColor: '#facc15',
        text: '逸承，抬头看！整座玄城已在血月之上180度倒悬显形！踏入祭坛中央的乾坤裂隙便可攻入里城，去最深处斩灭烛阴，彻底终结这场千年浩劫吧！',
      },
    ],
  },

  true_ending: {
    id: 'true_ending',
    title: '真结局 · 破晓斩冥',
    lines: [
      {
        speaker: '九幽冥主·烛阴',
        role: '灰飞烟灭的古仙残魂',
        portraitColor: '#ef4444',
        text: '不可能……本座筹谋千载的九幽血阵，竟败于一介十八岁少年剑下……！',
      },
      {
        speaker: '李逸承',
        role: '18岁 · 破城剑侠',
        portraitColor: '#48c9b0',
        text: '千年邪祟，不过冢中枯骨。今日剑破九幽，还世间朗朗乾坤！',
      },
      {
        speaker: '苏清晏',
        role: '钦天监司辰女官',
        portraitColor: '#7dd3fc',
        text: '天亮了！血月散去，整座倒悬玄城正在化作漫天金莲消散……裴前辈和萧统领都在城门外等我们呢！',
      },
      {
        speaker: '萧断水',
        role: '镇妖司少统领',
        portraitColor: '#c084fc',
        text: '干得漂亮，小师弟！师父的冤屈我已飞鸽传书禀明圣上。（恭喜通关真结局！主界面现已解锁隐藏模式：【少统领·萧断水模式】与【百鬼试炼·镇妖塔】！）',
      },
    ],
  },
};
