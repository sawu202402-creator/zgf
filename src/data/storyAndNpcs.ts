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
    ageTitle: '18岁 · 镇妖司见习斩妖人',
    color: '#48c9b0',
    summary:
      '由镇妖司魁首裴无极抚养传剑，佩半枚玄鸟残玉。为查明恩师冤案夜闯九幽玄城。',
  },
  {
    id: 'su_qingyan',
    name: '苏清晏',
    ageTitle: '17岁 · 钦天监司辰女官',
    color: '#7dd3fc',
    summary:
      '精通星象与奇门灵符的少女。奉命入城勘察龙脉，指引李逸承寻齐【破妄古镜】与【玄鸟合璧佩】。',
  },
  {
    id: 'xiao_duanshui',
    name: '萧断水',
    ageTitle: '21岁 · 镇妖司少统领（大师兄）',
    color: '#c084fc',
    summary:
      '李逸承的大师兄，银枪冠绝京畿。外冷内热，试探师弟剑心后赠予化雾神符。通关真结局后可全程操控。',
  },
  {
    id: 'ouye_can',
    name: '欧冶残',
    ageTitle: '60岁 · 赤火坊独臂铸剑师',
    color: '#fb923c',
    summary:
      '前朝铸剑宗师后裔，感念少年侠骨，在瓮城古祠旁为其赤火淬炼五系神兵。',
  },
  {
    id: 'bai_zhanggui',
    name: '白掌柜',
    ageTitle: '子夜鬼市狐商',
    color: '#facc15',
    summary:
      '戴白狐面具的神秘行商，兜售疗伤丹药、宝甲利刃与奇门法器。',
  },
  {
    id: 'pei_wuji',
    name: '裴无极',
    ageTitle: '48岁 · 恩师 / 镇妖司前魁首',
    color: '#ef4444',
    summary:
      '甘背骂名坐镇凌霄祭天坛压制里城尸仙，神魂却遭九幽蚀心蛊日夜侵蚀。',
  },
];

export const STORY_SCENES: Record<string, StoryScene> = {
  intro_gate: {
    id: 'intro_gate',
    title: '血月临城',
    lines: [
      {
        speaker: '苏清晏',
        role: '司辰女官',
        portraitColor: '#7dd3fc',
        text: '李少侠留步！城中阴煞凶险，东进正殿可寻轻功秘卷，遇镇魂古祠切记调息留档。',
      },
    ],
  },

  su_gate_chat: {
    id: 'su_gate_chat',
    title: '桥头叮嘱',
    lines: [
      {
        speaker: '苏清晏',
        role: '司辰女官',
        portraitColor: '#7dd3fc',
        text: '妖邪出刀前会现猩红【危】芒，看准时机疾退或以【↓↙←+斩】震气破招！',
      },
    ],
  },

  su_shrine_guide: {
    id: 'su_shrine_guide',
    title: '古祠指引',
    lines: [
      {
        speaker: '苏清晏',
        role: '司辰女官',
        portraitColor: '#7dd3fc',
        text: '西侧欧冶前辈可淬炼神兵，东侧白掌柜售有金疮药。先往东闯奉天殿夺【踏云步】吧！',
      },
    ],
  },

  meet_library_su: {
    id: 'meet_library_su',
    title: '破妄双宝',
    lines: [
      {
        speaker: '苏清晏',
        role: '司辰女官',
        portraitColor: '#7dd3fc',
        text: '裴前辈是被【蚀心蛊】所控！唯有寻齐禁书阁【破妄古镜】与水牢西密室【玄鸟佩】，方能救他并开启倒悬里城。',
      },
    ],
  },

  boss_xiao_pre: {
    id: 'boss_xiao_pre',
    title: '寒潭问剑',
    lines: [
      {
        speaker: '萧断水',
        role: '大师兄',
        portraitColor: '#c084fc',
        text: '逸承，亮剑吧——若连我这杆龙胆枪都接不住，去了祭天坛只是白白送死！',
      },
    ],
  },

  boss_xiao_post: {
    id: 'boss_xiao_post',
    title: '化雾奇符',
    grantAbility: 'mist_dash',
    lines: [
      {
        speaker: '萧断水',
        role: '大师兄',
        portraitColor: '#c084fc',
        text: '好剑法！这枚【缩地化雾符】拿去，冲刺可穿紫瘴铁栅；水牢极西密室藏有另一半玄鸟玉佩。',
      },
    ],
  },

  altar_normal_end: {
    id: 'altar_normal_end',
    title: '折剑归尘',
    lines: [
      {
        speaker: '苏清晏',
        role: '司辰女官',
        portraitColor: '#7dd3fc',
        text: '未携双宝破除蚀心蛊，里城真凶尚未显形……快回城寻齐【破妄古镜】与【玄鸟合璧佩】！',
      },
    ],
  },

  altar_invert_awakening: {
    id: 'altar_invert_awakening',
    title: '乾坤倒悬',
    lines: [
      {
        speaker: '裴无极',
        role: '清醒的恩师',
        portraitColor: '#facc15',
        text: '蚀心蛊碎了！徒儿，踏入祭坛乾坤裂隙攻入【180° 九幽倒悬里城】，斩灭尸仙烛阴！',
      },
    ],
  },

  true_ending: {
    id: 'true_ending',
    title: '破晓斩冥',
    lines: [
      {
        speaker: '李逸承',
        role: '破城少侠',
        portraitColor: '#48c9b0',
        text: '千年邪祟伏诛，血月终散，还世间朗朗乾坤！',
      },
    ],
  },
};
