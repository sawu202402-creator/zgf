import { StoryScene } from '../types';

export interface CharacterBio {
  id: string;
  name: string;
  ageTitle: string;
  color: string;
  summary: string;
}

export interface LoreSteleEntry {
  id: string;
  volume: string;
  title: string;
  locationHint: string;
  author: string;
  content: string;
}

export const CHARACTER_BIOS: CharacterBio[] = [
  {
    id: 'li_yicheng',
    name: '李逸承',
    ageTitle: '镇妖司末代传剑弟子',
    color: '#48c9b0',
    summary:
      '三年前“甲申血月之变”幸存的传剑弟子，颈悬半枚玄鸟残玉。世人皆骂恩师裴无极弑杀同僚、化城为狱，他仅携一柄粗铸铁剑，孤身夜渡苦竹桥，誓向血月讨一个真相。',
  },
  {
    id: 'su_qingyan',
    name: '苏清晏',
    ageTitle: '钦天监司辰女官',
    color: '#7dd3fc',
    summary:
      '故钦天监监正苏怀星之女。血月当夜其父死于凌霄坛上，她奉密诏入城查验龙脉封阵，原本视裴门师徒为仇寇，却在与李逸承并肩勘破残碑与禁书后，窥见了令朝野噤声的惊天献祭。',
  },
  {
    id: 'xiao_duanshui',
    name: '萧断水',
    ageTitle: '镇妖司少统领 · 大师兄',
    color: '#c084fc',
    summary:
      '裴无极座下首徒，一杆龙胆亮银枪曾挑翻漠北十三妖寨。三年来独守钦天试剑堂，宁受朝廷通缉亦不肯离城半步，只为拦住不够资格踏上祭天坛送死的师弟。真结局后可全程操控。',
  },
  {
    id: 'ouye_can',
    name: '欧冶残',
    ageTitle: '赤火坊独臂铸剑宗师',
    color: '#fb923c',
    summary:
      '前朝铸剑世家传人。甲申之夜为铸七星龙渊钉死地肺龙脉，自断右臂以骨血祭炉。受裴无极临封城前死托，在赤火铸剑坊静候佩玄鸟残玉的传人下井取刃。',
  },
  {
    id: 'bai_zhanggui',
    name: '白掌柜',
    ageTitle: '万宝斋白狐行商',
    color: '#facc15',
    summary:
      '常戴青玉白狐面具、提青冥琉璃灯游走于藏书阁与子夜鬼市。嘴上只认纹银不认人，实则曾受李逸承生母“守陵玄女”一炷活命香火，暗中为故人之后留存救命丹酿与奇门兵甲。',
  },
  {
    id: 'pei_wuji',
    name: '裴无极',
    ageTitle: '镇妖司前任魁首 · 恩师',
    color: '#ef4444',
    summary:
      '大靖第一剑客。三年前太古尸仙【烛阴】借皇城龙脉破封在即，内廷却妄图炼尸仙求长生；裴无极怒斩奸佞，自愿将【九幽蚀心蛊】种入眉心，化作半人半魔的活锁，孤身镇压倒悬里城一千余夜。',
  },
  {
    id: 'mo_qianqiu',
    name: '墨千秋',
    ageTitle: '故钦天监掌卷博士 · 万卷妖宗',
    color: '#38bdf8',
    summary:
      '苏怀星挚友、万卷藏书阁守阁人。封城前夜吞下记载龙脉逆阵的七十二卷竹简投身寒潭，宁化书妖镇守水牢，亦不让半页阵图落入内廷与尸仙爪牙之手。',
  },
  {
    id: 'zhuyin',
    name: '太古尸仙 · 烛阴',
    ageTitle: '九幽倒悬里城真主 · 血月祸源',
    color: '#f43f5e',
    summary:
      '沉眠于玄城地脉之下的太古凶神，能以人心执念倒映出 180° 逆乱里城。唯有在阳表祭天坛以破妄古镜与完整玄鸟佩斩断蚀心蛊，方可撕开乾坤裂隙将其彻底诛灭。',
  },
];

/**
 * 散落于全城八处的【镇妖司残碑 · 血月秘档】（靠近按【斩】研读，自动收录入列传卷宗！）
 */
export const LORE_STELES: Record<string, LoreSteleEntry> = {
  stele_outpost_oath: {
    id: 'stele_outpost_oath',
    volume: '秘档卷一 · 苦竹断桥碑',
    title: '《镇妖司封城禁令残碑》',
    locationHint: '苍竹断崖古亭',
    author: '大靖兵部左侍郎 · 甲申年七月十六立',
    content:
      '“甲申七月十五子夜，镇妖司魁首裴无极勾结妖邪，焚钦天监、断护城桥，引血月阴煞笼罩旧都三十六坊。凡擅渡苦竹桥入玄城者，无论官民，皆视叛党论处，格杀勿论！”——碑阴却有一行极浅的剑刻小字：“逸承吾徒，若见此碑，切莫回头，亦莫上凌霄坛寻为师。”',
  },
  stele_alchemy_edict: {
    id: 'stele_alchemy_edict',
    volume: '秘档卷二 · 丹房焚简录',
    title: '《司礼监采炼长生丹密札》',
    locationHint: '钦天炼丹阶梯廊',
    author: '残存的宫中朱批密折',
    content:
      '“地肺之下果有太古遗蜕，每逢月食吐纳紫瘴，饮其髓血可添寿元一甲子！着钦天监监正苏怀星即刻起阵开脉，若裴无极敢以镇妖司兵符阻拦，便以谋逆大罪拿问九族！”',
  },
  stele_forge_arm: {
    id: 'stele_forge_arm',
    volume: '秘档卷三 · 赤火断臂铭',
    title: '《欧冶氏封炉血书》',
    locationHint: '赤火熔金暗渠',
    author: '独臂铸剑师 · 欧冶残',
    content:
      '“寒铁不融，龙脉将崩。老夫今日斩右臂投炉，铸就镇脉重器，却救不得满城黎庶。裴兄临上凌霄坛前，将西武库斩马重刃之钥留于老夫——他说那孩子自幼倔强，总有一日会提剑杀回来。”',
  },
  stele_catacomb_origin: {
    id: 'stele_catacomb_origin',
    volume: '秘档卷四 · 守陵玄鸟志',
    title: '《前朝守陵玄女墓志铭》',
    locationHint: '九幽白骨冥廊',
    author: '无名守墓人刻于冥廊寒石',
    content:
      '“吾族世代佩双生【玄鸟古玉】，镇守九幽地脉尸仙。十八年前地脉异动，族长苏氏以半枚玉佩封住裂隙力竭而亡，临终将襁褓幼子与另半枚残佩托付青年剑客裴氏抚养。双玉若合，血脉自鸣，可破世间一切幻妄蛊毒。”',
  },
  stele_library_star: {
    id: 'stele_library_star',
    volume: '秘档卷五 · 司天绝笔疏',
    title: '《钦天监正苏怀星遗疏》',
    locationHint: '翰林藏珍暗阁（破壁密室）',
    author: '钦天监监正 · 苏怀星绝笔',
    content:
      '“清晏吾女：若你入城见此遗疏，切勿恨裴兄！今夜内廷强开九幽封印，尸仙烛阴神魂已溢。为父自请以身化阵锁住阳城四门，裴兄则甘受【九幽蚀心蛊】噬脑之痛，以一己肉身作锁眼压住里城！唯望后人集齐【破妄古镜】与【玄鸟合璧佩】，救裴兄脱离苦海……”',
  },
  stele_opera_nuo: {
    id: 'stele_opera_nuo',
    volume: '秘档卷六 · 梨园惊梦谱',
    title: '《百戏班主绝命戏单》',
    locationHint: '子夜百戏勾栏',
    author: '升平班老班主 · 柳十三',
    content:
      '“城门将封，萧少统领护送三千妇孺自暗渠撤离，奈何阴兵追袭甚急。我升平班上下二十八口，今夜不逃了——擂响镇魂傩鼓，唱一出《钟馗嫁妹》，纵化作提线木偶，也要替百姓多拦阴兵一个时辰！”',
  },
  stele_observatory_mirror: {
    id: 'stele_observatory_mirror',
    volume: '秘档卷七 · 倒悬乾坤考',
    title: '《阴阳双城堪舆图说》',
    locationHint: '东垣观星飞虹桥',
    author: '钦天监司辰秘录',
    content:
      '“血月悬顶，玄城实分阴阳二界：目之所见乃【阳表玄城】，天穹之上更有尸仙执念所凝之【180° 九幽倒悬里城】。若不破眉心蚀心蛊而强斩宿主，锁毁城倾，尸仙必破笼而出；唯双宝齐聚，方见真魔！”',
  },
  stele_sword_tomb: {
    id: 'stele_sword_tomb',
    volume: '秘档卷八 · 青莲剑冢辞',
    title: '《太白遗剑石刻》',
    locationHint: '青莲太白剑冢（破壁密室）',
    author: '前朝剑仙遗刻',
    content:
      '“十步杀一人，千里不留行；事了拂衣去，深藏身与名。吾观后世习剑者，多困于招式轻重，殊不知剑心通明之时，一剑既出，万影随行。留千影剑魄于倒悬秘冢，待心怀苍生之少年取之斩魔！”',
  },
  stele_colosseum_valor: {
    id: 'stele_colosseum_valor',
    volume: '秘档卷九 · 神武夺魁碑',
    title: '《镇妖司大比演武纪事碑》',
    locationHint: '神武百战演武场',
    author: '镇妖司右佥事 · 壬午年秋立',
    content:
      '“壬午秋狩，镇妖司与神机营会猎于神武校场。少统领萧断水单骑持枪，连破十八座铁甲刀阵；初入师门的小师弟李逸承竟亦凭一柄木剑撑过大师兄三十合而不败。彼时满场喝彩，裴魁首抚须而笑——谁料仅隔数载，师门喋血，演武鼓声竟成绝响。”',
  },
  stele_mine_dragon_iron: {
    id: 'stele_mine_dragon_iron',
    volume: '秘档卷十 · 地肺采矿禁碑',
    title: '《工部严封太古朱砂矿脉碑》',
    locationHint: '荒废坑木矿道',
    author: '工部虞衡清吏司 · 甲申年五月',
    content:
      '“自矿井凿入地肺八百丈，矿工屡闻岩壁下有巨物心跳如闷雷，掘出之赤晶尽带紫黑尸气，触之者双目赤红、力大无穷而神智尽丧。欧冶宗师亲下深井勘验后惊呼：‘此非铁矿，乃镇封太古凶神之龙骨锁钉，再掘一寸则皇城倾覆！’然内廷监军竟杖责矿工，逼其昼夜开凿不休。”',
  },
  stele_shipyard_fleet: {
    id: 'stele_shipyard_fleet',
    volume: '秘档卷十一 · 归墟沉舰志',
    title: '《东水寨镇海楼船封存手札》',
    locationHint: '皇家艨艟废船坞',
    author: '水师提督遗墨',
    content:
      '“甲申七月十四夜，裴魁首密令水师将三艘龙首艨艟巨舰驶入城东地下船坞，表面言备海防，实则满舱皆载旧都孤幼妇孺三千余口，赶在子夜血月封城大阵合拢前顺暗河潜流入海！世人骂裴公闭城坑民，殊不知东水关铁闸落下那一刻，他把生路留给了百姓，把死路留给了自己。”',
  },
  stele_nether_zhuyin: {
    id: 'stele_nether_zhuyin',
    volume: '秘档卷十二 · 九幽镇龙古铭',
    title: '《太古玄鸟封魔总纲石刻》',
    locationHint: '太古镇魔碑窟',
    author: '先秦方士 · 鬼谷遗脉篆刻',
    content:
      '“夫烛阴者，视昼为瞑，视瞑为昼，嘘气成九幽逆城。上古大禹铸九鼎余铁锁其脊于忘川之下，以玄鸟双佩为钥、破妄昆仑镜为眼。千载之后若血月重临、人心贪长生而自毁龙钉，唯持双信物者可自阳表天坛劈开阴阳倒悬之门，入逆城绝其真灵！”',
  },
};

export const STORY_SCENES: Record<string, StoryScene> = {
  intro_gate: {
    id: 'intro_gate',
    title: '第一章 · 血月夜渡',
    lines: [
      {
        speaker: '李逸承',
        role: '镇妖司传剑弟子',
        portraitColor: '#48c9b0',
        text: '三年了……苦竹渡口的血月还是甲申年那一夜的颜色。师父，满朝文武都说你叛国堕魔，可徒儿不信。',
      },
      {
        speaker: '苏清晏',
        role: '钦天监司辰女官',
        portraitColor: '#7dd3fc',
        text: '站住！你颈间悬着半枚玄鸟旧玉，手里却只提着一柄寻常铁剑……你是裴无极的关门弟子李逸承？！',
      },
      {
        speaker: '李逸承',
        role: '镇妖司传剑弟子',
        portraitColor: '#48c9b0',
        text: '不错。这位姑娘既是钦天监女官，想必也是来查明三年前封城真相的。刀剑无眼，若不想拦路，便请让开。',
      },
      {
        speaker: '苏清晏',
        role: '钦天监司辰女官',
        portraitColor: '#7dd3fc',
        text: '……家父苏怀星当年便死在凌霄祭天坛上！我奉密旨入城勘验龙脉，正好要亲眼看看你们裴门师徒究竟是忠是奸。',
      },
      {
        speaker: '苏清晏',
        role: '钦天监司辰女官',
        portraitColor: '#7dd3fc',
        text: '听好了，城中妖卒出招前必沉身蓄势、兵刃暗敛寒光，看准起手刹那可疾退闪避或以【太极震气诀】卸力破招；入正阳门后穿过【朱雀天街】便有镇魂古祠可焚香留档，我们在藏书阁再会！',
      },
    ],
  },

  su_gate_chat: {
    id: 'su_gate_chat',
    title: '渡口星语',
    lines: [
      {
        speaker: '苏清晏',
        role: '钦天监司辰女官',
        portraitColor: '#7dd3fc',
        text: '穿过外城朱雀天街便是【皇城端门大殿】，分上下两路：登二层云阶而上通往【钦天炼丹司】，据说你大师兄萧断水至今仍守在试剑堂；下潜暗井则通往欧冶前辈的【赤火铸剑坊】。',
      },
      {
        speaker: '李逸承',
        role: '镇妖司传剑弟子',
        portraitColor: '#48c9b0',
        text: '大师兄还在城里？！好，我这便先登钦天炼丹司，当面问个水落石出！',
      },
    ],
  },

  enter_main_hall: {
    id: 'enter_main_hall',
    title: '第二章 · 盘龙旧殿',
    lines: [
      {
        speaker: '李逸承',
        role: '镇妖司传剑弟子',
        portraitColor: '#48c9b0',
        text: '奉天盘龙长廊……当年师父常在御阶之上指点我和大师兄拆招。如今金柱犹在，满殿将士却皆成了受阴煞驱使的铜甲傀儡。',
      },
      {
        speaker: '李逸承',
        role: '镇妖司传剑弟子',
        portraitColor: '#48c9b0',
        text: '嗯？高台剑座之上似乎悬着一缕熟悉的青冥剑魄，东端须弥断崖却高达丈余——看来须先去钦天炼丹司寻回轻功【踏云步】，方能翻越断崖东进望月塔！',
      },
    ],
  },

  meet_smith_ouye: {
    id: 'meet_smith_ouye',
    title: '赤火故人',
    lines: [
      {
        speaker: '欧冶残',
        role: '独臂铸剑宗师',
        portraitColor: '#fb923c',
        text: '哐！哐！……嗯？这脚步声轻而不浮，是老裴教出来的《踏雪寻梅》底子！小子，抬起头来让老夫瞧瞧！',
      },
      {
        speaker: '李逸承',
        role: '镇妖司传剑弟子',
        portraitColor: '#48c9b0',
        text: '欧冶世伯！您的右臂……怎会变成这样？！当年血月之夜，城里到底发生了什么？',
      },
      {
        speaker: '欧冶残',
        role: '独臂铸剑宗师',
        portraitColor: '#fb923c',
        text: '一条胳膊换地肺火脉三年不崩，值当！老裴临上凌霄坛前把你托付给城外故人，却算准你剑成之日必会提剑闯回来，特意让老夫在此替你守炉铸兵！',
      },
      {
        speaker: '欧冶残',
        role: '独臂铸剑宗师',
        portraitColor: '#fb923c',
        text: '瞧见东侧那道饕餮千斤重闸了吗？寻常轻剑劈不开，去上层【镇军西武库】取回前朝重刃再来一刀破闸！往后若凑足纹银，随时来找老夫开炉秘铸传世孤品！',
      },
    ],
  },

  meet_merchant_bai: {
    id: 'meet_merchant_bai',
    title: '子夜狐灯',
    lines: [
      {
        speaker: '白掌柜',
        role: '万宝斋狐商',
        portraitColor: '#facc15',
        text: '呵呵呵，青灯照故人，多年不见，当年尚在襁褓中的故人骨血，如今也提剑孤身闯入这座鬼城了。',
      },
      {
        speaker: '李逸承',
        role: '镇妖司传剑弟子',
        portraitColor: '#48c9b0',
        text: '阁下认得在下？还知晓我的身世？',
      },
      {
        speaker: '白掌柜',
        role: '万宝斋狐商',
        portraitColor: '#facc15',
        text: '天机不可尽泄，老婆子我当年欠令堂一炷活命香火罢了。对了，小斋西侧书墙近来总透出古怪寒风，少侠手痒不妨挥剑敲敲看——至于救命仙丹与烈酒，纹银管够尽管挑！',
      },
    ],
  },

  boss_xiao_pre: {
    id: 'boss_xiao_pre',
    title: '第三章 · 同门问剑',
    lines: [
      {
        speaker: '萧断水',
        role: '镇妖司少统领',
        portraitColor: '#c084fc',
        text: '……我早说过，不许你踏进玄城半步。逸承，是谁准你私自渡过苦竹桥的？！',
      },
      {
        speaker: '李逸承',
        role: '镇妖司传剑弟子',
        portraitColor: '#48c9b0',
        text: '大师兄！我找了你整整三年！师父他究竟为何被困在凌霄祭天坛？你既知内情，为何宁背叛名也不向世人辩白一句！',
      },
      {
        speaker: '萧断水',
        role: '镇妖司少统领',
        portraitColor: '#c084fc',
        text: '辩白？向那些妄图剖开地脉、汲取太古尸仙精血求长生的紫袍权贵辩白吗？！师父以一身血肉锁住九幽大渊，一旦真相外泄，不知多少贪婪之徒会再来破印！',
      },
      {
        speaker: '李逸承',
        role: '镇妖司传剑弟子',
        portraitColor: '#48c9b0',
        text: '果真是内廷奸佞栽赃师父！大师兄，让我与你同上凌霄坛救回师父！',
      },
      {
        speaker: '萧断水',
        role: '镇妖司少统领',
        portraitColor: '#c084fc',
        text: '救他？如今师父神魂已被蚀心蛊吞噬大半，六亲不认！拔剑吧逸承——若连我这杆龙胆亮银枪都接不住，今日我宁可挑断你的手筋将你扔出城外，也绝不让你去祭天坛白白送命！',
      },
    ],
  },

  boss_xiao_post: {
    id: 'boss_xiao_post',
    title: '白虎托孤',
    lines: [
      {
        speaker: '萧断水',
        role: '镇妖司少统领',
        portraitColor: '#c084fc',
        text: '咳……好一式青竹剑意！三年不见，你的剑心比我想象中更稳、更烈。',
      },
      {
        speaker: '李逸承',
        role: '镇妖司传剑弟子',
        portraitColor: '#48c9b0',
        text: '大师兄承让了！快告诉我，究竟如何才能在不伤师父性命的前提下破除他身上的邪祟？',
      },
      {
        speaker: '萧断水',
        role: '镇妖司少统领',
        portraitColor: '#c084fc',
        text: '听仔细了：切不可贸然直闯凌霄坛！西室供奉着镇司轻功【踏云步】；习得二段跳后，先取重刃劈开铸剑坊铁闸，潜入地底【九曲寒潭水牢】。',
      },
      {
        speaker: '萧断水',
        role: '镇妖司少统领',
        portraitColor: '#c084fc',
        text: '水牢尽头的玄鸟秘冢里，藏着令堂当年遗落的另一半【玄鸟玉佩】与【缩地化雾】秘术！这枚镇军【白虎啸风兵符】你且收好，我留在下层替你镇住阴兵潮——去吧，师弟！',
      },
    ],
  },

  boss_titan_post: {
    id: 'boss_titan_post',
    title: '地肺炉心',
    lines: [
      {
        speaker: '李逸承',
        role: '镇妖司传剑弟子',
        portraitColor: '#48c9b0',
        text: '赤铜巨灵体内的邪火终于散去了……原来欧冶世伯断臂铸入地肺的镇脉铜偶，竟也被尸仙逸散的阴煞侵染狂化。',
      },
      {
        speaker: '李逸承',
        role: '镇妖司传剑弟子',
        portraitColor: '#48c9b0',
        text: '脚下暗井封印已解，下方便是前朝封存霸体秘印【千斤坠】的玄钧秘坛——顺道看看秘坛东壁是否有欧冶世伯暗藏的剑冢！',
      },
    ],
  },

  boss_scroll_pre: {
    id: 'boss_scroll_pre',
    title: '第四章 · 寒潭镇卷',
    lines: [
      {
        speaker: '墨千秋',
        role: '万卷妖宗 · 故掌卷博士',
        portraitColor: '#38bdf8',
        text: '退下……擅闯镇水古殿者死！七十二卷龙脉阵图已入老夫腹中，便是司礼监番子挫骨扬灰，也休想从老夫口中抠出半个字！',
      },
      {
        speaker: '李逸承',
        role: '镇妖司传剑弟子',
        portraitColor: '#48c9b0',
        text: '墨博士醒醒！晚辈并非内廷鹰犬，乃是裴无极门下弟子李逸承，特来水牢求取玄鸟合璧佩救治家师！',
      },
      {
        speaker: '墨千秋',
        role: '万卷妖宗 · 故掌卷博士',
        portraitColor: '#38bdf8',
        text: '裴……无极……吼！！水脉怨气太盛，老夫压不住这万卷妖魂了——少年郎，用你的剑斩醒老夫！！',
      },
    ],
  },

  boss_scroll_post: {
    id: 'boss_scroll_post',
    title: '遗卷托付',
    lines: [
      {
        speaker: '墨千秋',
        role: '恢复清明的掌卷博士残魂',
        portraitColor: '#7dd3fc',
        text: '多谢少侠赐剑……三年阴寒噬骨，老夫总算能做回堂堂正正的大靖读书人了。',
      },
      {
        speaker: '墨千秋',
        role: '恢复清明的掌卷博士残魂',
        portraitColor: '#7dd3fc',
        text: '东门之后便是【玄鸟秘宝冢】，去将你母亲留下的玄鸟玉佩合二为一吧……还有一事，若见到怀星兄的女儿清晏，告诉她——她爹苏怀星顶天立地，从未负过苍生！',
      },
    ],
  },

  meet_library_su: {
    id: 'meet_library_su',
    title: '第五章 · 双宝破妄',
    lines: [
      {
        speaker: '苏清晏',
        role: '钦天监司辰女官',
        portraitColor: '#7dd3fc',
        text: '李少侠，你来了……对不起，先前在苦竹桥头，是我错怪了令师与镇妖司诸位英雄。',
      },
      {
        speaker: '李逸承',
        role: '镇妖司传剑弟子',
        portraitColor: '#48c9b0',
        text: '苏姑娘查到了令尊留下的星象秘录？我在地底也见到了墨千秋博士，他临终托我转告姑娘——苏监正以身化阵锁住四门，乃是顶天立地的忠臣义士。',
      },
      {
        speaker: '苏清晏',
        role: '钦天监司辰女官',
        portraitColor: '#7dd3fc',
        text: '爹爹……（拭泪）我在藏书阁暗卷中拼齐了当夜真相：内廷强开地脉唤醒了太古尸仙【烛阴】，裴前辈为救满城百姓，主动将烛阴分裂的【九幽蚀心蛊】引入自己眉心，独坐凌霄祭天坛充当阵眼活锁！',
      },
      {
        speaker: '苏清晏',
        role: '钦天监司辰女官',
        portraitColor: '#7dd3fc',
        text: '切记！若未凑齐两件镇物便在祭天坛击败裴前辈，蚀心蛊只会随宿主俱焚而无法逼出里城真凶！其一在水牢深处【玄鸟秘宝冢】的【完整玄鸟合璧佩】；其二则在东垣望月竖塔顶层紫瘴栅后的【破妄古镜】！',
      },
      {
        speaker: '李逸承',
        role: '镇妖司传剑弟子',
        portraitColor: '#48c9b0',
        text: '水牢玄鸟佩，东塔破妄镜——苏姑娘放心，哪怕踏遍玄城每一寸暗室，我也定将双宝集齐，救醒师父、斩灭尸仙！',
      },
    ],
  },

  boss_opera_pre: {
    id: 'boss_opera_pre',
    title: '第六章 · 惊梦梨园',
    lines: [
      {
        speaker: '惊梦百戏傩神',
        role: '升平班二十八忠魂所聚',
        portraitColor: '#f472b6',
        text: '咚咚锵——！夜深城门闭，莫放阴兵过长街！来者何人，敢断我升平班镇魂大戏？！',
      },
      {
        speaker: '李逸承',
        role: '镇妖司传剑弟子',
        portraitColor: '#48c9b0',
        text: '升平班诸位义士，三千百姓早已平安出城，三年过去了，这场戏该落幕安息了！得罪！',
      },
    ],
  },

  boss_opera_post: {
    id: 'boss_opera_post',
    title: '曲终人散',
    lines: [
      {
        speaker: '李逸承',
        role: '镇妖司传剑弟子',
        portraitColor: '#48c9b0',
        text: '红绸落尽，忠魂归土……愿诸位来世再登太平戏台，不必再以血肉擂鼓。西侧飞燕秘阁已开，前朝墨家【飞燕钩锁】便在其中！',
      },
    ],
  },

  boss_yaksha_pre: {
    id: 'boss_yaksha_pre',
    title: '第七章 · 雷音震阙',
    lines: [
      {
        speaker: '雷音金翅大鹏王',
        role: '洪武巨钟镇塔护法灵兽',
        portraitColor: '#facc15',
        text: '凡躯蝼蚁，竟敢攀上天机钟楼！血月未散，无我翼下金钟镇压，九霄阴雷早已劈碎皇城——接我万钧雷戟！',
      },
    ],
  },

  boss_yaksha_post: {
    id: 'boss_yaksha_post',
    title: '钟鸣破障',
    lines: [
      {
        speaker: '雷音金翅大鹏王',
        role: '恢复灵性的镇塔金鹏',
        portraitColor: '#fde047',
        text: '好凌厉的少年剑锋……竟震散了缠绕本座双翼三年的紫瘴魔气！顶阁藏有【壁虎游墙功】与禁术【九幽噬魂引】，东侧古壁之后更封存着本座昔日伴生雷枪，皆赠予你登坛斩魔！',
      },
    ],
  },

  boss_general_pre: {
    id: 'boss_general_pre',
    title: '校场问戟 · 武魂不灭',
    lines: [
      {
        speaker: '镇武大将军 · 拓跋烈',
        role: '前神武营主帅英魂',
        portraitColor: '#f59e0b',
        text: '擂鼓——列阵！甲申之夜本帅率神武营死守校场，纵尸身成灰，这杆方天画戟也绝不放半个怯战之辈过关！来者报上名号！',
      },
      {
        speaker: '李逸承',
        role: '镇妖司传剑弟子',
        portraitColor: '#48c9b0',
        text: '晚辈镇妖司李逸承，特来神武校场求取破魔重甲，请拓跋老将军赐教！',
      },
    ],
  },

  boss_general_post: {
    id: 'boss_general_post',
    title: '帅旗归位',
    lines: [
      {
        speaker: '镇武大将军 · 拓跋烈',
        role: '欣慰消散的武神残魂',
        portraitColor: '#fde047',
        text: '痛快！好俊的镇妖剑法，颇有裴魁首当年的风骨！坛上这领【神武吞猊山文甲】便赐予少侠，替老夫杀上祭天坛，斩尽国贼妖氛！',
      },
    ],
  },

  boss_leviathan_pre: {
    id: 'boss_leviathan_pre',
    title: '归墟惊涛 · 镇海龙吟',
    lines: [
      {
        speaker: '归墟镇海蛟王 · 敖溟',
        role: '遭血月戾气狂化的护海蛟神',
        portraitColor: '#22d3ee',
        text: '昂——！！东水关铁闸既落，擅入沉船古渡者皆葬鱼腹！谁敢惊扰本王守护的三千渡海遗迹？！',
      },
      {
        speaker: '李逸承',
        role: '镇妖司传剑弟子',
        portraitColor: '#48c9b0',
        text: '水师楼船早已载百姓平安远渡重洋，蛟王何苦仍困于九幽浊浪？且看我一剑斩散你周身尸瘴！',
      },
    ],
  },

  boss_leviathan_post: {
    id: 'boss_leviathan_post',
    title: '沧溟澄澈',
    lines: [
      {
        speaker: '归墟镇海蛟王 · 敖溟',
        role: '重归清明的镇海灵蛟',
        portraitColor: '#67e8f9',
        text: '浊浪退散……原来当年那三艘楼船真的逃出生天了……多谢少侠点醒，船坞祭坛上的【鲛绡避水云霓裳】便助你横渡东海绝壁！',
      },
    ],
  },

  boss_warden_pre: {
    id: 'boss_warden_pre',
    title: '地心龙渊 · 刑天舞干戚',
    lines: [
      {
        speaker: '守陵太古战魄 · 刑天',
        role: '大禹留镇龙脉的太古无首战神',
        portraitColor: '#f43f5e',
        text: '刑天舞干戚，猛志固常在！！凡欲踏足祖龙极渊者，先接吾千钧铜钺而不跪，方配披挂祖龙逆鳞！',
      },
    ],
  },

  boss_warden_post: {
    id: 'boss_warden_post',
    title: '猛志传薪',
    lines: [
      {
        speaker: '李逸承',
        role: '镇妖司传剑弟子',
        portraitColor: '#48c9b0',
        text: '好霸道的太古战意……纵断首千载仍死守龙脉不退半步！前辈放心，这袭【九幽祖龙逆鳞铠】既入我手，烛阴必伏诛于此剑之下！',
      },
    ],
  },

  boss_pei_pre: {
    id: 'boss_pei_pre',
    title: '第八章 · 凌霄问心',
    lines: [
      {
        speaker: '裴无极',
        role: '遭蚀心蛊侵蚀的恩师',
        portraitColor: '#ef4444',
        text: '滚出去……逸承……快滚出凌霄坛！咳啊——为师眉心的蛊毒就要压不住了，再上前一步，为师定会失手斩了你！！',
      },
      {
        speaker: '李逸承',
        role: '镇妖司传剑弟子',
        portraitColor: '#48c9b0',
        text: '师父！当年您在雪地里捡回徒儿，教我握剑第一课便说：“镇妖司的剑，宁折不弯，绝不弃同袍于暗夜！”您独自在血月下熬了一千个日夜，今日换徒儿来护您！！',
      },
      {
        speaker: '裴无极',
        role: '九幽蚀心蛊失控暴走',
        portraitColor: '#f43f5e',
        text: '痴儿……既不肯退，那便亮出你毕生所学，替为师斩断这副魔躯吧——出剑！！',
      },
    ],
  },

  altar_normal_end: {
    id: 'altar_normal_end',
    title: '折剑归尘 · 未尽之局',
    lines: [
      {
        speaker: '裴无极',
        role: '力竭倒下的恩师',
        portraitColor: '#fca5a5',
        text: '逸承……你的剑……终于胜过为师了……只恨为师眉心的蚀心蛊与烛阴本源相连，无破妄双宝照印，终究无法撕开里城裂隙……',
      },
      {
        speaker: '苏清晏',
        role: '钦天监司辰女官',
        portraitColor: '#7dd3fc',
        text: '李少侠停手！苍穹血月未散，倒悬里城里的太古尸仙仍在冷笑！快趁一息尚存退回古祠——去水牢秘冢取【完整玄鸟合璧佩】、登东塔紫瘴阁取【破妄古镜】，定能改写师徒命数！',
      },
    ],
  },

  altar_invert_awakening: {
    id: 'altar_invert_awakening',
    title: '第九章 · 乾坤倒悬',
    lines: [
      {
        speaker: '李逸承',
        role: '双宝齐聚 · 破妄一剑',
        portraitColor: '#fde047',
        text: '破妄古镜照彻虚妄，玄鸟合璧共鸣血脉——九幽蚀心蛊，给我从师父眉心滚出来！！',
      },
      {
        speaker: '裴无极',
        role: '摆脱魔蛊清醒的恩师',
        portraitColor: '#facc15',
        text: '咳……盘踞神魂三载的蚀心毒蛊，竟真的被你一剑挑碎了！好小子……不愧是我裴无极带大的徒儿！',
      },
      {
        speaker: '苏清晏',
        role: '钦天监司辰女官',
        portraitColor: '#7dd3fc',
        text: '快看苍穹之上！！蚀心蛊碎裂，血月背后的幻阵崩塌了——整座玄城正在九天之上倒悬显形！',
      },
      {
        speaker: '裴无极',
        role: '镇妖司前魁首',
        portraitColor: '#facc15',
        text: '那便是太古尸仙【烛阴】真身盘踞的【180° 九幽倒悬里城】！它的王座，正对应着阳城起点的倒悬苦竹渡口！',
      },
      {
        speaker: '裴无极',
        role: '镇妖司前魁首',
        portraitColor: '#facc15',
        text: '为师与断水、清晏在此替你稳住乾坤阵脚！去吧逸承——踏入祭坛中央裂隙，杀穿倒悬里城，替这三年枉死的忠魂讨还血债！',
      },
    ],
  },

  boss_zhuyin_pre: {
    id: 'boss_zhuyin_pre',
    title: '终章 · 太古尸仙',
    lines: [
      {
        speaker: '太古尸仙 · 烛阴',
        role: '九幽倒悬里城真主',
        portraitColor: '#f43f5e',
        text: '渺小的守陵族遗孤……竟能杀穿本座倒悬乾坤的万里冥城！帝王求本座赐寿，权臣跪本座求荣，人心贪欲不灭，本座便万劫不死！',
      },
      {
        speaker: '李逸承',
        role: '破城少侠',
        portraitColor: '#48c9b0',
        text: '帝王权臣贪生怕死，但大靖还有断臂铸剑的铁匠、擂鼓赴死的伶人、吞简投潭的书生，还有独坐血月千夜的镇妖人！',
      },
      {
        speaker: '李逸承',
        role: '破城少侠',
        portraitColor: '#fde047',
        text: '烛阴，你的千年长夜到头了——接我镇妖司最后一剑！！',
      },
    ],
  },

  true_ending: {
    id: 'true_ending',
    title: '终幕 · 破晓斩冥',
    lines: [
      {
        speaker: '太古尸仙 · 烛阴',
        role: '崩散的太古凶魂',
        portraitColor: '#fca5a5',
        text: '不可能……凡人三尺青锋……竟能斩断万古冥月……！！',
      },
      {
        speaker: '苏清晏',
        role: '司辰女官',
        portraitColor: '#7dd3fc',
        text: '天亮了……你们快看天边！笼罩旧都整整三年的血月散去了，倒悬在云端上的里城正在化作漫天金雨消散！',
      },
      {
        speaker: '萧断水',
        role: '大师兄',
        portraitColor: '#c084fc',
        text: '哼，这臭小子……如今论剑法，怕是连我这个当大师兄的都压不住他了。师父，咱们镇妖司的招牌，总算没砸。',
      },
      {
        speaker: '裴无极',
        role: '重沐晨光的恩师',
        portraitColor: '#facc15',
        text: '朝堂欠镇妖司的清白，今日山河日月自会见证。逸承，往后这柄守护人间的剑，为师便正式传给你了。',
      },
      {
        speaker: '李逸承',
        role: '破晓剑侠',
        portraitColor: '#48c9b0',
        text: '晨风吹过苦竹渡，青石板上的露水真干净啊……走吧，师父、大师兄、苏姑娘，我们回家！',
      },
    ],
  },
};
