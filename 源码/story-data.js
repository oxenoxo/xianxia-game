/* ========== 放置修仙 - 剧情数据 ==========
 * 格式：每个章节包含 scenes，每个scene包含对话/选择/战斗/奖励
 * type: dialogue | choice | battle | reward | cutscene
 */

var STORY_CHAPTERS = [
  // ============================================================
  // 第一章：废柴外门
  // 解锁条件：游戏开始（炼气期自动触发）
  // 核心梗：资质测试全场最低，但古神残魂第一次说话
  // ============================================================
  {
    id: 'ch1',
    name: '废柴外门',
    realmRequired: 0,   // 0 = 游戏开始即可触发
    unlockGold: 0,
    summary: '资质测试垫底，师父深夜来访，体内残魂第一次发声。',
    scenes: [
      {
        id: 'ch1_1',
        bg: 'qingxu_temple',
        type: 'dialogue',
        title: '资质测试',
        dialogue: [
          { speaker: '师兄王大锤', portrait: 'senior_male', text: '喂，那个新来的，轮到你了，把你的手放上去。' },
          { speaker: '我', portrait: 'player', text: '（这测灵石看起来好贵的样子，别弄坏了…）' },
          { speaker: '', portrait: '', text: '你将手按在测灵石上。石头沉默了三秒。\n然后，发出了一声微弱的…屁响。' },
          { speaker: '围观弟子', portrait: '', text: '哈哈哈哈哈！这货的灵根是笑点组成的吗？！' },
          { speaker: '师父', portrait: 'master', text: '…安静。他的灵根资质确实…比较特别。下等水灵根，偏属水性。' },
          { speaker: '我', portrait: 'player', text: '（师父你介绍得这么委婉，我反而更难受了…）' },
          { speaker: '师兄王大锤', portrait: 'senior_male', text: '师父，这种废物您也收？外门都塞不下了啊。' },
          { speaker: '师父', portrait: 'master', text: '大锤，你当年入门时，灵根测试也是下等。\n（全场寂静）\n…散了吧。你，跟我来。' }
        ],
        next: 'ch1_2'
      },
      {
        id: 'ch1_2',
        bg: 'night_courtyard',
        type: 'dialogue',
        title: '深夜·师父的话',
        dialogue: [
          { speaker: '', portrait: '', text: '夜深了。师父带你来到观后悬崖，月光照着他的白发。' },
          { speaker: '师父', portrait: 'master', text: '你身上的玉佩，是你奶奶留给你的？' },
          { speaker: '我', portrait: 'player', text: '是啊…师父怎么知道？' },
          { speaker: '师父', portrait: 'master', text: '…没什么。\n修炼一途，资质不是一切。\n我像你这么大的时候，灵根也是下等。' },
          { speaker: '我', portrait: 'player', text: '真的？！那师父是怎么…' },
          { speaker: '师父', portrait: 'master', text: '死了。我是说，我差点死了。\n后来遇到了一个…东西。\n它教了我一些…不太正统的法门。' },
          { speaker: '', portrait: '', text: '师父说完，沉默了很久。\n你隐约觉得，他看着你的眼神，像在看某个故人。' },
          { speaker: '师父', portrait: 'master', text: '从明天开始，每天寅时来后山找我。\n别让其他人知道。' }
        ],
        next: 'ch1_3'
      },
      {
        id: 'ch1_3',
        bg: 'back_mountain',
        type: 'dialogue',
        title: '残魂初醒',
        dialogue: [
          { speaker: '', portrait: '', text: '寅时。后山。\n师父教你吐纳，你闭眼入定——\n忽然，丹田一阵灼热。' },
          { speaker: '？？', portrait: 'old_soul', text: '啧…终于有个能听到我说话的小子了。' },
          { speaker: '我', portrait: 'player', text: '谁？！谁在说话？！' },
          { speaker: '？？', portrait: 'old_soul', text: '别喊，你师父就在十丈外，想让他知道你丹田里关了个老妖怪？' },
          { speaker: '我', portrait: 'player', text: '你到底是谁？！' },
          { speaker: '？？', portrait: 'old_soul', text: '我是谁？\n…我也快忘了。\n你就叫我「老祖」吧。\n放心，我不害你——害了你我自己也完了。' },
          { speaker: '老祖', portrait: 'old_soul', text: '你那个师父…不简单。\n他教你的吐纳法，是改过的版本。\n他用的是…魔修的法门，改成了正道的外壳。' },
          { speaker: '我', portrait: 'player', text: '（什么？！）' },
          { speaker: '老祖', portrait: 'old_soul', text: '别慌，改过的法门反而更适合你这种「杂灵根」。\n你师父…是在保护你。\n具体的，等你境界高一点我再告诉你。' }
        ],
        next: 'ch1_4'
      },
      {
        id: 'ch1_4',
        bg: 'battlefield',
        type: 'battle',
        title: '后山试炼',
        battle: { enemyId: 'wolf', mustWin: false, retreatOK: true },
        dialogueAfter: [
          { speaker: '师父', portrait: 'master', text: '不错，第一次战斗就能打赢灰狼。\n…虽然是被狼咬了两口才赢的。' },
          { speaker: '我', portrait: 'player', text: '师父您这是在夸我还是在损我…' },
          { speaker: '师父', portrait: 'master', text: '回去休息吧。\n明天寅时，后山见。\n记住——你体内有东西的事，对任何人都不要说。' },
          { speaker: '', portrait: '', text: '你点点头。\n回房的路上，「老祖」的声音又响了——' },
          { speaker: '老祖', portrait: 'old_soul', text: '小子，你师父给你的那枚玉佩…\n那不是普通的玉佩。\n那是…算了，你现在还打不开。\n等你到筑基期再说吧。' }
        ],
        reward: { exp: 80, gold: 50, hint: '第一章已完结，筑基期将开启第二章' },
        next: null   // null = 本章结束
      }
    ]
  },

  // ============================================================
  // 第二章：筑基惊变
  // 解锁条件：筑基期
  // 核心梗：筑基时玉佩发光，老祖记忆碎片觉醒，师父的真实身份揭露一角
  // ============================================================
  {
    id: 'ch2',
    name: '筑基惊变',
    realmRequired: 10,  // 筑基期
    unlockGold: 0,
    summary: '筑基时玉佩异动，老祖恢复部分记忆，师父被神秘人寻仇。',
    scenes: [
      {
        id: 'ch2_1',
        bg: 'cultivation_room',
        type: 'dialogue',
        title: '筑基前夕',
        dialogue: [
          { speaker: '师父', portrait: 'master', text: '你准备好筑基了。\n这一次，我用清虚观的筑基阵法帮你。\n…可能会有一点…不适。' },
          { speaker: '我', portrait: 'player', text: '「一点不适」是多少？师父您能说具体点吗？' },
          { speaker: '师父', portrait: 'master', text: '就是…可能会看到一些幻觉。\n阵法会引动你体内的…那股力量。\n别怕，我在旁边。' },
          { speaker: '老祖', portrait: 'old_soul', text: '（传音）小子，筑基的时候，我把一部分力量借给你。\n别拒绝——你凭自己那点灵力，筑基成功率不到三成。' },
          { speaker: '我', portrait: 'player', text: '（传音）你图什么？' },
          { speaker: '老祖', portrait: 'old_soul', text: '（传音）图你筑基之后，能帮我找回记忆。\n我总觉得…你的师父，跟我的过去有某种联系。' }
        ],
        next: 'ch2_2'
      },
      {
        id: 'ch2_2',
        bg: 'array_platform',
        type: 'dialogue',
        title: '筑基·玉佩异动',
        dialogue: [
          { speaker: '', portrait: '', text: '阵法启动。\n灵气如潮水般涌入你的丹田——\n忽然，胸口的玉佩发出幽蓝色光芒！' },
          { speaker: '师父', portrait: 'master', text: '这是…不可能…这枚玉佩怎么会…\n（他脸色骤变，但很快恢复平静）\n专心筑基，别分心！' },
          { speaker: '', portrait: '', text: '玉佩的光芒渗入你的经脉。\n「老祖」的声音忽然变得清晰——\n不再是懒散的语气，而是…某种远古的庄严。' },
          { speaker: '老祖', portrait: 'old_soul', text: '…原来在这里…\n小子，你师父的真名，叫「玄清子」。\n三百年前，他是…\n（声音忽然中断，仿佛被什么东西屏蔽了）' },
          { speaker: '', portrait: '', text: '筑基完成。\n你睁开眼，发现师父站在阵法边缘，手中的拂尘在微微发抖。' },
          { speaker: '师父', portrait: 'master', text: '…做得好。\n从今天起，你正式成为我清虚观内门弟子。\n（他转身，你没有看到——他的眼角有一道旧伤疤在隐隐发光）' }
        ],
        reward: { exp: 300, gold: 200 },
        next: 'ch2_3'
      },
      {
        id: 'ch2_3',
        bg: 'night_courtyard',
        type: 'dialogue',
        title: '夜访·神秘人来袭',
        dialogue: [
          { speaker: '', portrait: '', text: '筑基当晚。\n你在房中打坐，「老祖」正在跟你解释玉佩的事——\n忽然，屋顶的瓦片发出一声轻响。' },
          { speaker: '黑衣人', portrait: 'assassin', text: '玄清子…终于找到你了。\n三百年前你叛出师门，以为躲在这小观里就能逍遥法外？' },
          { speaker: '师父', portrait: 'master', text: '（从阴影中走出）\n…我以为当年的事，已经没人记得了。\n你是「天煞宗」派来的？' },
          { speaker: '黑衣人', portrait: 'assassin', text: '今日，便是你的死期——\n（黑衣人出手，一道煞气直取师父咽喉！）' },
          { speaker: '', portrait: '', text: '你正要冲出去帮忙——\n「老祖」的声音忽然在你脑中炸响：' },
          { speaker: '老祖', portrait: 'old_soul', text: '别去！\n那个黑衣人是金丹期，你去了就是送菜！\n…不过，我可以借你一点力量。\n握紧你的玉佩——骂的，快握啊！！' }
        ],
        next: 'ch2_4'
      },
      {
        id: 'ch2_4',
        bg: 'battlefield',
        type: 'battle',
        title: '玉佩之力·初现',
        battle: { enemyId: 'bandit', mustWin: true, useArtPower: true },
        dialogueAfter: [
          { speaker: '', portrait: '', text: '你握紧玉佩，一股远古的力量涌入全身！\n黑衣人一掌击在师父护盾上，回头看了你一眼——\n眼中满是震惊。' },
          { speaker: '黑衣人', portrait: 'assassin', text: '这股气息…不可能…是那位大人…\n（黑衣人咬牙，化作一道黑烟遁走）' },
          { speaker: '师父', portrait: 'master', text: '你…你从哪里学会的这种力量？\n（他看着你，眼神复杂——有震惊，有恐惧，还有…愧疚？）' },
          { speaker: '我', portrait: 'player', text: '师父，那个黑衣人说您「叛出师门」…那是…' },
          { speaker: '师父', portrait: 'master', text: '…\n今晚的事，对任何人都不许提起。\n包括你体内的那个「东西」。\n等你能胜过我的时候…我再告诉你一切。' },
          { speaker: '', portrait: '', text: '师父转身离去。\n月光下，你看到他的背影在微微颤抖。\n\n「老祖」在你丹田里叹了口气——\n那是某种…你从未听过的，苍老而悲伤的叹息。' },
          { speaker: '老祖', portrait: 'old_soul', text: '小子，你师父和我…\n我们之间的账，比你想象的要深得多。\n但现在的你，还不够资格知道。\n好好修炼吧。\n下一次，天煞宗不会只派一个探子了。' }
        ],
        reward: { exp: 500, gold: 400, gem: 1, hint: '第二章已完结，金丹期将开启第三章' },
        next: null
      }
    ]
  },

  // ============================================================
  // 第三章：金丹之谜（预留框架，内容待写）
  // 解锁条件：金丹期（realmRequired: 20）
  // ============================================================
  {
    id: 'ch3',
    name: '金丹之谜',
    realmRequired: 20,
    unlockGold: 0,
    summary: '金丹大成之日，天劫中隐藏的秘密，师父的真实身份彻底揭露。',
    scenes: [
      {
        id: 'ch3_1',
        bg: 'array_platform',
        type: 'dialogue',
        title: '（待创作）',
        dialogue: [
          { speaker: '', portrait: '', text: '【第三章内容待创作，金丹期解锁】' }
        ],
        next: null
      }
    ]
  }
];

// ============================================================
// 剧情系统辅助数据：立绘/背景映射
// ============================================================
var STORY_ASSETS = {
  portraits: {
    player:        { emoji: '🧑🏻', name: '我', color: '#333' },
    master:        { emoji: '👴',  name: '师父', color: '#8B4513' },
    senior_male:   { emoji: '👨🏼', name: '师兄', color: '#2E86AB' },
    old_soul:      { emoji: '👻',  name: '老祖', color: '#9B59B6' },
    assassin:       { emoji: '🥷',  name: '黑衣人', color: '#E74C3C' },
    // 新增角色继续加在这里
  },
  backgrounds: {
    qingxu_temple:  { color: '#F5E6D3', desc: '清虚观·大殿' },
    night_courtyard: { color: '#1A1A2E', desc: '清虚观·夜' },
    back_mountain:   { color: '#2D5016', desc: '后山' },
    cultivation_room:{ color: '#3D2B1F', desc: '闭关室' },
    array_platform:  { color: '#1C1C3C', desc: '阵法平台' },
    battlefield:     { color: '#4A0E0E', desc: '战场' },
  }
};
