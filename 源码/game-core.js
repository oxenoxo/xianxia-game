/* ========== 放置修仙 - 游戏核心逻辑 ==========
 * 纯数据层：所有游戏规则、状态管理、数值计算
 * 不依赖 DOM，可直接迁移到微信小游戏 Canvas 环境
 */

/* ========== 配置 ========== */
var CONFIG = {
    SAVE_KEY:'cultivation_save', SAVE_INTERVAL:10000, AUTO_CULTIVATE_INTERVAL:1000,
    OFFLINE_MAX_HOURS:8, ENERGY_REGEN_RATE:5, BATTLE_TICK:800,
    EXP_GROWTH_RATE:1.3, ENEMY_UNLOCK_STEP:5,
    ENHANCE_BASE_RATE:0.7, ENHANCE_GEM_GUARANTEE:3,
};

/* ========== 境界 ========== */
var REALMS = [
    {name:'凡人',level:1,color:'#888'},{name:'练气期',level:5,color:'#64ffda'},
    {name:'筑基期',level:10,color:'#3498db'},{name:'金丹期',level:20,color:'#9b59b6'},
    {name:'元婴期',level:35,color:'#e74c3c'},{name:'化神期',level:50,color:'#ffd700'},
    {name:'炼虚期',level:70,color:'#ff6b6b'},{name:'合体期',level:90,color:'#1abc9c'},
    {name:'大乘期',level:120,color:'#a8e6cf'},{name:'渡劫期',level:150,color:'#f1c40f'},
    {name:'仙人',level:200,color:'#ffffff'},
];

/* ========== 技能 ========== */
var SKILLS = [
    {id:'fireball',name:'火球术',desc:'对敌人造成1.8倍攻击伤害',maxLevel:10,cost:function(l){return l*100;},effect:function(l){return 1.8+l*0.2;},type:'attack',energyCost:10},
    {id:'heal',name:'治愈术',desc:'恢复10%+30点生命值',maxLevel:10,cost:function(l){return l*80;},effect:function(l){return 0.1+l*0.02;},type:'heal',energyCost:8},
    {id:'meditation',name:'冥想',desc:'提升修炼速度',maxLevel:10,cost:function(l){return l*120;},effect:function(l){return 1+l*0.1;},type:'cultivation',energyCost:0},
    {id:'strength',name:'力量强化',desc:'永久提升攻击力',maxLevel:10,cost:function(l){return l*150;},effect:function(l){return l*3;},type:'passive',energyCost:0},
    {id:'shield',name:'护盾术',desc:'永久提升防御力',maxLevel:10,cost:function(l){return l*130;},effect:function(l){return l*2;},type:'passive',energyCost:0},
    {id:'double_exp',name:'双倍经验',desc:'修炼获得额外经验',maxLevel:5,cost:function(l){return l*500;},effect:function(l){return 1+l*0.5;},type:'cultivation',energyCost:0},
];

/* ========== 神功/功法 ========== */
var ART_SCHOOLS = [
    {id:'body',name:'体修',desc:'以身为炉，锤炼肉身',icon:'🏋',unlockLevel:5,color:'#e74c3c'},
    {id:'sword',name:'剑修',desc:'以剑入道，一剑破万法',icon:'⚔️',unlockLevel:10,color:'#3498db'},
    {id:'dao',name:'道修',desc:'道法自然，天地为用',icon:'📖',unlockLevel:15,color:'#2ecc71'},
    {id:'pill',name:'丹修',desc:'炼丹悟道，药石通神',icon:'🧪',unlockLevel:20,color:'#9b59b6'},
];

var ARTS = [
    // 体修
    {id:'bloodthirst',school:'body',name:'嗜血诀',desc:'击杀敌人恢复5%×等级最大生命值',maxLevel:5,
     effect:function(l){return 0.05*l;},type:'on_kill'},
    {id:'vajra',school:'body',name:'金刚体',desc:'受到伤害减少3%×等级',maxLevel:5,
     effect:function(l){return 0.03*l;},type:'defensive'},
    {id:'immortal',school:'body',name:'不灭身',desc:'致命伤时保留1HP（冷却: 6-等级场战斗）',maxLevel:5,
     effect:function(l){return 6-l;},type:'on_fatal'},
    // 剑修
    {id:'breaker',school:'sword',name:'破军剑意',desc:'暴击伤害提升15%×等级',maxLevel:5,
     effect:function(l){return 0.15*l;},type:'crit_boost'},
    {id:'myriad',school:'sword',name:'万剑归宗',desc:'攻击有8%×等级概率触发二次攻击',maxLevel:5,
     effect:function(l){return 0.08*l;},type:'extra_attack'},
    {id:'heavenly',school:'sword',name:'天剑诀',desc:'对Boss伤害提升8%×等级',maxLevel:5,
     effect:function(l){return 0.08*l;},type:'boss_dmg'},
    // 道修
    {id:'taoist_forget',school:'dao',name:'太上忘情',desc:'修炼经验提升5%×等级',maxLevel:5,
     effect:function(l){return 0.05*l;},type:'exp_boost'},
    {id:'goldtouch',school:'dao',name:'点石成金',desc:'金币获取提升5%×等级',maxLevel:5,
     effect:function(l){return 0.05*l;},type:'gold_boost'},
    {id:'fortune',school:'dao',name:'造化钟神',desc:'幸运值+1×等级',maxLevel:5,
     effect:function(l){return l;},type:'luck_boost'},
    // 丹修
    {id:'alchemy_master',school:'pill',name:'丹成九转',desc:'药品效果提升10%×等级',maxLevel:5,
     effect:function(l){return 0.1*l;},type:'potion_boost'},
    {id:'aura_shield',school:'pill',name:'灵气护体',desc:'每场战斗开始获得5%×等级最大HP的护盾',maxLevel:5,
     effect:function(l){return 0.05*l;},type:'battle_shield'},
    {id:'rebirth',school:'pill',name:'脱胎换骨',desc:'战败后额外恢复5%×等级最大HP',maxLevel:5,
     effect:function(l){return 0.05*l;},type:'death_recovery'},
];

/* 神功升级消耗 */
var ART_UPGRADE_COST = {
    gold: function(l){ return [500,1000,2000,4000,8000][l-1] || 99999; },
    enlightenment: function(l){ return l; }, // 1,2,3,4,5
};

/* ========== 敌人 ========== */
var ENEMIES = [
    {id:'wolf',name:'灰狼',hp:50,atk:8,def:2,exp:20,gold:10,isBoss:false},
    {id:'boar',name:'野猪',hp:80,atk:12,def:5,exp:35,gold:20,isBoss:false},
    {id:'snake',name:'毒蛇',hp:40,atk:15,def:1,exp:25,gold:15,isBoss:false},
    {id:'bear',name:'棕熊',hp:150,atk:20,def:10,exp:60,gold:40,isBoss:false},
    {id:'tiger',name:'猛虎',hp:200,atk:30,def:15,exp:100,gold:70,isBoss:false},
    {id:'dragon',name:'幼龙',hp:500,atk:50,def:30,exp:300,gold:200,isBoss:true,skills:['breath','tail']},
    {id:'demon',name:'魔将',hp:800,atk:70,def:40,exp:500,gold:400,isBoss:true,skills:['dark','summon']},
    {id:'ancient',name:'上古妖王',hp:1500,atk:100,def:60,exp:1000,gold:800,isBoss:true,skills:['web','devour']},
];

/* ========== Boss 技能表 ========== */
var BOSS_SKILLS = {
    breath:{name:'龙息',desc:'吐出烈焰',mult:1.8,chance:0.25},
    tail:{name:'尾击',desc:'横扫尾巴',mult:1.4,chance:0.2},
    dark:{name:'暗影斩',desc:'释放暗影',mult:2.0,chance:0.2},
    summon:{name:'召唤爪牙',desc:'召唤小兵',mult:1.0,chance:0.15,healPct:0.1},
    web:{name:'蛛网束缚',desc:'缠绕敌人',mult:1.3,chance:0.2,stun:true},
    devour:{name:'吞噬',desc:'吸取生命',mult:1.6,chance:0.2,healPct:0.3},
};

/* ========== 装备模板 ========== */
var EQUIP_BASES = [
    {id:'sword_iron',name:'铁剑',slot:'weapon',baseAtk:5,baseDef:0,baseHp:0,baseSpd:0,baseLuck:0,quality:'common',price:200},
    {id:'sword_steel',name:'精钢剑',slot:'weapon',baseAtk:12,baseDef:0,baseHp:0,baseSpd:0,baseLuck:0,quality:'uncommon',price:600},
    {id:'sword_jade',name:'寒玉剑',slot:'weapon',baseAtk:22,baseDef:2,baseHp:0,baseSpd:2,baseLuck:0,quality:'rare',price:2000},
    {id:'sword_fire',name:'焚天剑',slot:'weapon',baseAtk:35,baseDef:0,baseHp:0,baseSpd:5,baseLuck:3,quality:'epic',price:5000},
    {id:'sword_immortal',name:'仙人遗剑',slot:'weapon',baseAtk:55,baseDef:5,baseHp:100,baseSpd:8,baseLuck:5,quality:'legendary',price:15000},
    {id:'armor_cloth',name:'布甲',slot:'armor',baseAtk:0,baseDef:3,baseHp:20,baseSpd:0,baseLuck:0,quality:'common',price:200},
    {id:'armor_leather',name:'皮甲',slot:'armor',baseAtk:0,baseDef:8,baseHp:50,baseSpd:0,baseLuck:0,quality:'uncommon',price:600},
    {id:'armor_iron',name:'玄铁甲',slot:'armor',baseAtk:2,baseDef:18,baseHp:100,baseSpd:-2,baseLuck:0,quality:'rare',price:2000},
    {id:'armor_dragon',name:'龙鳞甲',slot:'armor',baseAtk:5,baseDef:30,baseHp:200,baseSpd:0,baseLuck:3,quality:'epic',price:5000},
    {id:'armor_immortal',name:'仙灵袍',slot:'armor',baseAtk:10,baseDef:45,baseHp:400,baseSpd:5,baseLuck:5,quality:'legendary',price:15000},
    {id:'acc_ring',name:'铜戒指',slot:'acc1',baseAtk:2,baseDef:1,baseHp:10,baseSpd:1,baseLuck:1,quality:'common',price:150},
    {id:'acc_jade',name:'玉佩',slot:'acc1',baseAtk:5,baseDef:3,baseHp:30,baseSpd:3,baseLuck:2,quality:'uncommon',price:500},
    {id:'acc_dragon',name:'龙珠',slot:'acc1',baseAtk:10,baseDef:5,baseHp:80,baseSpd:5,baseLuck:5,quality:'rare',price:2500},
    {id:'acc_phoenix',name:'凤羽簪',slot:'acc1',baseAtk:18,baseDef:8,baseHp:150,baseSpd:8,baseLuck:8,quality:'epic',price:6000},
    {id:'acc_immortal',name:'道祖遗珠',slot:'acc1',baseAtk:30,baseDef:15,baseHp:300,baseSpd:12,baseLuck:12,quality:'legendary',price:18000},
];

/* ========== 消耗品 ========== */
var CONSUMABLES = [
    {id:'potion_hp',name:'生命药水',desc:'恢复15%最大生命值',type:'consumable',effect:'heal_15pct',price:30,currency:'gold'},
    {id:'potion_hp_lg',name:'大还丹',desc:'恢复40%最大生命值',type:'consumable',effect:'heal_40pct',price:150,currency:'gold'},
    {id:'potion_energy',name:'能量药水',desc:'恢复50点能量',type:'consumable',effect:'energy_50',price:60,currency:'gold'},
    {id:'scroll_exp',name:'经验卷轴',desc:'获得200点经验',type:'consumable',effect:'exp_200',price:150,currency:'gold'},
    {id:'pill_rage',name:'狂暴丹',desc:'3场战斗内攻击+50%',type:'consumable',effect:'rage',price:120,currency:'gold'},
    {id:'pill_focus',name:'聚灵符',desc:'5次修炼经验+100%',type:'consumable',effect:'focus',price:150,currency:'gold'},
    {id:'gem_box',name:'宝石盒',desc:'获得10颗宝石',type:'consumable',effect:'gem_10',price:8,currency:'gem'},
];

/* ========== 成就 ========== */
var ACHIEVEMENTS = [
    {id:'first_cultivate',name:'初入仙途',desc:'首次修炼',condition:function(s){return s.stats.totalCultivations>=1;},reward:{gold:50}},
    {id:'level_10',name:'小有成就',desc:'达到10级',condition:function(s){return s.level>=10;},reward:{gold:500,gem:5}},
    {id:'level_50',name:'一方强者',desc:'达到50级',condition:function(s){return s.level>=50;},reward:{gold:5000,gem:50}},
    {id:'first_battle',name:'初试锋芒',desc:'首次战斗',condition:function(s){return s.stats.totalBattles>=1;},reward:{gold:30}},
    {id:'win_10',name:'战斗新手',desc:'胜利10场',condition:function(s){return s.stats.totalWins>=10;},reward:{gold:200}},
    {id:'win_100',name:'战斗大师',desc:'胜利100场',condition:function(s){return s.stats.totalWins>=100;},reward:{gold:2000,gem:20}},
    {id:'boss_1',name:'降龙伏虎',desc:'首次击败Boss',condition:function(s){return s.stats.bossKills>=1;},reward:{gold:500,gem:10}},
    {id:'boss_5',name:'诛魔卫道',desc:'击败5个Boss',condition:function(s){return s.stats.bossKills>=5;},reward:{gold:2000,gem:30}},
    {id:'gold_1000',name:'小富即安',desc:'累计获得1000金币',condition:function(s){return s.stats.totalGold>=1000;},reward:{gem:10}},
    {id:'equip_rare',name:'初得灵器',desc:'获得第一件蓝色品质装备',condition:function(s){return s.stats.equipRareFound>=1;},reward:{gold:300}},
    {id:'equip_legend',name:'仙器现世',desc:'获得第一件橙色品质装备',condition:function(s){return s.stats.equipLegendFound>=1;},reward:{gem:20}},
    {id:'enhance_5',name:'器灵觉醒',desc:'装备强化至+5',condition:function(s){return s.stats.maxEnhanceLevel>=5;},reward:{gold:1000}},
    {id:'learn_skill',name:'技能初悟',desc:'学会第一个技能',condition:function(s){return Object.values(s.skills).some(function(v){return v>0;});},reward:{gold:100}},
    {id:'first_art',name:'初悟神功',desc:'领悟第一个神功',condition:function(s){return (s.stats.artsLearned||0)>=1;},reward:{gem:5}},
    {id:'four_arts',name:'四法归一',desc:'领悟四个流派各一个神功',condition:function(s){return Object.keys(s.arts).length>=4;},reward:{gem:20}},
    {id:'art_max',name:'功法大成',desc:'神功升至满级',condition:function(s){return (s.stats.artsMaxed||0)>=1;},reward:{gem:10}},
];

/* ========== 每日任务（挂载到 GameCore 上，供 index.html 访问） ========== */
GameCore.DAILY_TASKS = [
    {id:'daily_cultivate', name:'每日修炼', desc:'今日修炼10次', statKey:'totalCultivations', target:10, reward:{gold:50}},
    {id:'daily_battle', name:'战斗历练', desc:'今日战斗5场', statKey:'totalBattles', target:5, reward:{gold:30, gem:1}},
    {id:'daily_win', name:'胜利进取', desc:'今日胜利3场', statKey:'totalWins', target:3, reward:{gold:40, gem:1}},
    {id:'daily_enhance', name:'锻造精进', desc:'今日强化装备1次', checkKey:'enhanceCount', target:1, reward:{gold:50}},
    {id:'daily_skill', name:'技能提升', desc:'今日升级技能1次', checkKey:'skillUpCount', target:1, reward:{gold:50}},
];
GameCore.CHECK_IN_REWARDS = [
    {day:1, reward:{gold:10, gem:1}},
    {day:2, reward:{gold:10, gem:1}},
    {day:3, reward:{gold:20, gem:1}},
    {day:4, reward:{gold:20, gem:2}},
    {day:5, reward:{gold:30, gem:2}},
    {day:6, reward:{gold:30, gem:3}},
    {day:7, reward:{gold:100, gem:10}},
];
/* 获取签到奖励 */
GameCore.prototype.getCheckInReward = function(streak) {
    var d = GameCore.CHECK_IN_REWARDS[(streak - 1) % 7];
    return d ? d.reward : GameCore.CHECK_IN_REWARDS[GameCore.CHECK_IN_REWARDS.length - 1].reward;
};
/* 初始化/重置每日任务 */
GameCore.prototype.initDailyTasks = function() {
    var today = new Date().toISOString().slice(0,10);
    if (!gameState.dailyData) gameState.dailyData = {};
    if (gameState.dailyData.date !== today) {
        gameState.dailyData = {
            date: today,
            tasks: {},
            checkInDone: false,
            enhanceCount: 0,
            skillUpCount: 0,
        };
        gameState.stats.totalCultivationsDay = 0;
        gameState.stats.totalBattlesDay = 0;
        gameState.stats.totalWinsDay = 0;
    }
};
/* 检查每日任务完成状态，返回可领取的任务id数组 */
GameCore.prototype.checkDailyTasks = function() {
    this.initDailyTasks();
    var today = gameState.dailyData;
    var claimable = [];
    GameCore.DAILY_TASKS.forEach(function(dt){
        if (today.tasks[dt.id] && today.tasks[dt.id].claimed) return;
        var current = 0;
        if (dt.statKey) {
            var base = {totalCultivations:'totalCultivationsDay',totalBattles:'totalBattlesDay',totalWins:'totalWinsDay'}[dt.statKey];
            current = gameState.stats[base] || 0;
        } else if (dt.checkKey) {
            current = today[dt.checkKey] || 0;
        }
        if (current >= dt.target) claimable.push(dt.id);
    });
    return claimable;
};
/* 领取每日任务奖励 */
GameCore.prototype.claimDailyTask = function(taskId) {
    this.initDailyTasks();
    var dt = GameCore.DAILY_TASKS.filter(function(t){return t.id===taskId;})[0];
    if (!dt) return {ok:false, msg:'任务不存在'};
    if (gameState.dailyData.tasks[taskId] && gameState.dailyData.tasks[taskId].claimed) return {ok:false, msg:'已领取'};
    var current = 0;
    if (dt.statKey) {
        var base = {totalCultivations:'totalCultivationsDay',totalBattles:'totalBattlesDay',totalWins:'totalWinsDay'}[dt.statKey];
        current = gameState.stats[base] || 0;
    } else if (dt.checkKey) {
        current = gameState.dailyData[dt.checkKey] || 0;
    }
    if (current < dt.target) return {ok:false, msg:'任务未完成'};
    if (dt.reward.gold) this.gainGold(dt.reward.gold);
    if (dt.reward.gem) gameState.gem += dt.reward.gem;
    if (!gameState.dailyData.tasks[taskId]) gameState.dailyData.tasks[taskId] = {};
    gameState.dailyData.tasks[taskId].claimed = true;
    gameState.dailyData.tasks[taskId].progress = current;
    this.emit('dailyTaskClaim', {taskId:taskId, reward:dt.reward});
    this.emit('info', {msg:'领取奖励成功！'});
    return {ok:true};
};
/* 每日签到 */
GameCore.prototype.doCheckIn = function() {
    this.initDailyTasks();
    if (gameState.dailyData.checkInDone) return {ok:false, msg:'今日已签到'};
    gameState.dailyData.checkInDone = true;
    // 计算连续签到天数
    var yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
    var streak = 1;
    if (gameState.dailyData.lastCheckInDate === yesterday) {
        streak = (gameState.dailyData.streak || 0) + 1;
    }
    gameState.dailyData.streak = streak;
    gameState.dailyData.lastCheckInDate = new Date().toISOString().slice(0,10);
    var reward = this.getCheckInReward(streak);
    if (reward.gold) this.gainGold(reward.gold);
    if (reward.gem) gameState.gem += reward.gem;
    this.emit('checkIn', {streak:streak, reward:reward});
    this.emit('info', {msg:'签到成功！连续' + streak + '天'});
    return {ok:true, streak:streak, reward:reward};
};

/* ========== 游戏状态 ========== */
var gameState = {
    level:1, exp:0, expToNext:100, realm:'凡人',
    gold:0, gem:0, energy:100, maxEnergy:100,
    hp:100, maxHp:100, hpAllocated:0, atk:10, def:5, spd:10, luck:1, comprehension:1,
    equipBonus:{atk:0,def:0,hp:0,spd:0,luck:0},
    freePoints:0, skills:{},
    equipment:{weapon:null,armor:null,acc1:null,acc2:null},
    inventory:{},
    equipBag:[],
    achievements:[],
    arts:{}, artLevels:{}, enlightenment:0, immortalCooldown:0, battleShield:0,
    currentEnemy:null, autoCultivate:false,
    battleMode:null, battleTurn:'player', playerActionLock:false,
    buffRage:0, buffFocus:0,
    stats:{
        totalCultivations:0,totalBattles:0,totalWins:0,
        totalGold:0,totalExp:0,totalDeaths:0,bossKills:0,totalCrits:0,
        equipRareFound:0,equipLegendFound:0,maxEnhanceLevel:0,
        startTime:Date.now(),lastSaveTime:Date.now(),lastOnlineTime:Date.now(),
        artsLearned:0,artsMaxed:0,
        totalCultivationsDay:0,totalBattlesDay:0,totalWinsDay:0,
    },
    dailyData:{date:'',tasks:{},checkInDone:false,streak:0,lastCheckInDate:'',enhanceCount:0,skillUpCount:0},
    settings:{sound:true,autoSave:true,animations:true,bgmVolume:0.5,longaotian:false},
    _equipUid:1,
};

/* ========== 游戏核心类 ========== */
function GameCore(){
    this._eventListeners = {};
}

/* ---- 事件系统：逻辑层通知渲染层 ---- */
GameCore.prototype.on = function(event, fn) {
    if (!this._eventListeners[event]) this._eventListeners[event] = [];
    this._eventListeners[event].push(fn);
};
GameCore.prototype.emit = function(event, data) {
    var fns = this._eventListeners[event];
    if (fns) fns.forEach(function(fn){ fn(data); });
};

/* ---- 初始化 ---- */
GameCore.prototype.init = function() {
    this.loadGame();
    this.recalcEquipBonus();
    this.fixMaxHp();
    this.clearBattleState();
    this.emit('init');
};

GameCore.prototype.clearBattleState = function() {
    if (gameState.currentEnemy) {
        gameState.currentEnemy = null;
        gameState.battleMode = null;
        gameState.battleTurn = 'player';
        gameState.playerActionLock = false;
    }
};

GameCore.prototype.fixMaxHp = function() {
    var baseHpFromLevel = 100 + (gameState.level - 1) * 10;
    var allocatedHp = gameState.hpAllocated || 0;
    var equipHp = gameState.equipBonus.hp || 0;
    var correctMaxHp = baseHpFromLevel + allocatedHp + equipHp;
    if (!gameState.hpAllocated && gameState.maxHp > 0) {
        var oldAllocated = gameState.maxHp - baseHpFromLevel - equipHp;
        if (oldAllocated > 0) { gameState.hpAllocated = oldAllocated; correctMaxHp = gameState.maxHp; }
    }
    gameState.hpAllocated = gameState.hpAllocated || 0;
    gameState.maxHp = correctMaxHp;
    if (gameState.hp > gameState.maxHp) gameState.hp = gameState.maxHp;
};

/* ---- 存档 ---- */
GameCore.prototype.loadGame = function() {
    var saved = localStorage.getItem(CONFIG.SAVE_KEY);
    if (saved) {
        try { gameState = this.mergeDeep(gameState, JSON.parse(saved)); } catch (e) { console.error('加载失败', e); }
    }
};
GameCore.prototype.saveGame = function() {
    try {
        gameState.stats.lastSaveTime = Date.now();
        var saveData = this.cloneForSave(gameState);
        localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(saveData));
        this.emit('save', {time: new Date().toLocaleTimeString()});
    } catch (e) {
        this.emit('error', {msg: '保存失败'});
    }
};
GameCore.prototype.cloneForSave = function(state) {
    var clone = JSON.parse(JSON.stringify(state));
    clone.currentEnemy = null; clone.battleMode = null;
    clone.battleTurn = 'player'; clone.playerActionLock = false;
    return clone;
};
GameCore.prototype.mergeDeep = function(t, s) {
    var o = {};
    for (var k in t) o[k] = t[k];
    if (this.isObj(t) && this.isObj(s)) {
        var self = this;
        Object.keys(s).forEach(function(k) {
            if (self.isObj(s[k]) && k in t) o[k] = self.mergeDeep(t[k], s[k]);
            else o[k] = s[k];
        });
    }
    return o;
};
GameCore.prototype.isObj = function(i) { return i && typeof i === 'object' && !Array.isArray(i); };

/* ---- 离线收益 ---- */
GameCore.prototype.checkOfflineEarnings = function() {
    var last = gameState.stats.lastOnlineTime; var now = Date.now(); var offSec = (now - last) / 1000;
    if (offSec > 60) {
        var maxSec = CONFIG.OFFLINE_MAX_HOURS * 3600; var effSec = Math.min(offSec, maxSec); var mins = Math.floor(effSec / 60);
        var base = 10 * this.getCultivationMultiplier(); var rate = gameState.autoCultivate ? 1.0 : 0.25;
        var expGain = Math.floor(base * mins * rate); var goldGain = Math.floor(expGain * 0.3);
        if (expGain > 0) {
            this.gainExp(expGain); this.gainGold(goldGain);
            this.emit('offlineEarnings', {exp: expGain, gold: goldGain, auto: gameState.autoCultivate});
        }
    }
    gameState.stats.lastOnlineTime = now;
};

/* ---- 修炼 ---- */
GameCore.prototype.getCultivationMultiplier = function() {
    var m = 1; m *= (1 + gameState.comprehension * 0.05);
    var ml = gameState.skills['meditation'] || 0;
    var dl = gameState.skills['double_exp'] || 0;
    var medEffect = 1, dblEffect = 1;
    if (ml > 0) medEffect = SKILLS.filter(function(s){return s.id==='meditation';})[0].effect(ml);
    if (dl > 0) dblEffect = SKILLS.filter(function(s){return s.id==='double_exp';})[0].effect(dl);
    m *= Math.max(medEffect, dblEffect);
    // 太上忘情：修炼经验加成
    if (this.hasArt('taoist_forget')) m *= (1 + this.getArtEffect('taoist_forget'));
    if (gameState.buffFocus > 0) m *= 2;
    return m;
};

GameCore.prototype.cultivate = function() {
    if (gameState.energy <= 0) { this.emit('warning', {msg: '体力耗尽'}); return; }
    gameState.energy = Math.max(0, gameState.energy - 1); gameState.stats.totalCultivations++; gameState.stats.totalCultivationsDay++;
    var gain = Math.floor(10 * this.getCultivationMultiplier());
    var luckBonus = gameState.luck * 0.05;
    var goldAmt = 0;
    if (Math.random() < (0.3 + luckBonus)) { goldAmt = Math.floor(Math.random() * 5) + 1 + Math.floor(gameState.luck * 0.5); this.gainGold(goldAmt); }
    this.gainExp(gain);
    if (gameState.buffFocus > 0) { gameState.buffFocus--; if (gameState.buffFocus <= 0) this.emit('info', {msg: '聚灵符效果结束'}); }
    this.emit('cultivate', {exp: gain, gold: goldAmt});
};

/* ---- 经验/升级 ---- */
GameCore.prototype.gainExp = function(amt) {
    gameState.exp += amt; gameState.stats.totalExp += amt;
    while (gameState.exp >= gameState.expToNext) { gameState.exp -= gameState.expToNext; this.levelUp(); }
};
GameCore.prototype.levelUp = function() {
    gameState.level++; gameState.freePoints += 2; gameState.expToNext = Math.floor(gameState.expToNext * CONFIG.EXP_GROWTH_RATE);
    gameState.maxHp += 10; gameState.hp = gameState.maxHp; gameState.atk += 2; gameState.def += 1; gameState.spd += 1;
    if (gameState.level % 5 === 0) { gameState.maxEnergy += 20; gameState.energy = gameState.maxEnergy; }
    this.updateRealm();
    this.emit('levelUp', {level: gameState.level});
    this.checkAchievements();
};
GameCore.prototype.updateRealm = function() {
    var old = gameState.realm; var nr = REALMS[0].name;
    for (var i = REALMS.length - 1; i >= 0; i--) { if (gameState.level >= REALMS[i].level) { nr = REALMS[i].name; break; } }
    if (nr !== gameState.realm) { gameState.realm = nr; this.emit('realmBreak', {name: nr}); }
};
GameCore.prototype.gainGold = function(amt) {
    // 点石成金：金币获取加成
    if (this.hasArt('goldtouch')) amt = Math.floor(amt * (1 + this.getArtEffect('goldtouch')));
    gameState.gold += amt; gameState.stats.totalGold += amt;
};

/* ========== 装备系统 ========== */
GameCore.prototype.recalcEquipBonus = function() {
    var b = {atk:0, def:0, hp:0, spd:0, luck:0};
    var slots = ['weapon', 'armor', 'acc1', 'acc2'];
    var self = this;
    slots.forEach(function(slot) {
        var eq = gameState.equipment[slot]; if (!eq) return;
        var inst = self.findEquipInBag(eq); if (!inst) return;
        var mult = 1 + inst.enhanceLevel * 0.1;
        b.atk += Math.floor(inst.atk * mult); b.def += Math.floor(inst.def * mult);
        b.hp += Math.floor(inst.hp * mult); b.spd += Math.floor(inst.spd * mult); b.luck += Math.floor(inst.luck * mult);
    });
    gameState.equipBonus = b;
};
GameCore.prototype.findEquipInBag = function(uid) { for (var i = 0; i < gameState.equipBag.length; i++) { if (gameState.equipBag[i].uid === uid) return gameState.equipBag[i]; } return null; };
GameCore.prototype.getTotalStat = function(base) {
    var val = gameState[base] + (gameState.equipBonus[base] || 0);
    // 造化钟神：幸运加成
    if (base === 'luck' && this.hasArt('fortune')) val += this.getArtEffect('fortune');
    return val;
};

GameCore.prototype.equipItem = function(uid) {
    var inst = this.findEquipInBag(uid); if (!inst) return;
    var slot = inst.slot;
    if (gameState.equipment[slot]) { /* 已装备的留在bag里 */ }
    var oldEquipHp = gameState.equipBonus.hp || 0;
    gameState.equipment[slot] = uid;
    this.recalcEquipBonus();
    var newEquipHp = gameState.equipBonus.hp || 0;
    var hpDiff = newEquipHp - oldEquipHp;
    if (hpDiff !== 0) { gameState.maxHp += hpDiff; if (gameState.hp > gameState.maxHp) gameState.hp = gameState.maxHp; }
    this.emit('equip', {name: inst.name, uid: uid});
};
GameCore.prototype.unequipSlot = function(slot) {
    if (!gameState.equipment[slot]) return;
    var oldEquipHp = gameState.equipBonus.hp || 0;
    gameState.equipment[slot] = null; this.recalcEquipBonus();
    var newEquipHp = gameState.equipBonus.hp || 0;
    var hpDiff = newEquipHp - oldEquipHp;
    if (hpDiff !== 0) { gameState.maxHp += hpDiff; if (gameState.hp > gameState.maxHp) gameState.hp = gameState.maxHp; }
    this.emit('unequip', {slot: slot});
};

GameCore.prototype.rollEquipDrop = function() {
    var dropRate = 0.1 + gameState.luck * 0.02;
    if (gameState.currentEnemy && gameState.currentEnemy.isBoss) dropRate += 0.2;
    if (Math.random() > dropRate) return null;
    var qRoll = Math.random(); var quality;
    if (qRoll < 0.02 + gameState.luck * 0.005) quality = 'legendary';
    else if (qRoll < 0.08 + gameState.luck * 0.01) quality = 'epic';
    else if (qRoll < 0.25 + gameState.luck * 0.02) quality = 'rare';
    else if (qRoll < 0.55) quality = 'uncommon';
    else quality = 'common';
    var pool = EQUIP_BASES.filter(function(e){return e.quality === quality;});
    if (pool.length === 0) pool = EQUIP_BASES.filter(function(e){return e.quality === 'common';});
    var base = pool[Math.floor(Math.random() * pool.length)];
    var inst = {
        uid:'eq_'+(gameState._equipUid++), baseId:base.id, name:base.name, slot:base.slot, quality:base.quality,
        atk:Math.floor(base.baseAtk*(0.8+Math.random()*0.4)), def:Math.floor(base.baseDef*(0.8+Math.random()*0.4)),
        hp:Math.floor(base.baseHp*(0.8+Math.random()*0.4)), spd:Math.floor(base.baseSpd*(0.8+Math.random()*0.4)),
        luck:Math.floor(base.baseLuck*(0.8+Math.random()*0.4)), enhanceLevel:0,
    };
    if (inst.atk + inst.def + inst.hp + inst.spd + inst.luck === 0) inst.atk = 1;
    gameState.equipBag.push(inst);
    if (quality === 'rare' || quality === 'epic' || quality === 'legendary') gameState.stats.equipRareFound++;
    if (quality === 'legendary') gameState.stats.equipLegendFound++;
    return inst;
};

GameCore.prototype.enhanceEquip = function(uid) {
    var inst = this.findEquipInBag(uid); if (!inst) return;
    var lv = inst.enhanceLevel; if (lv >= 10) { this.emit('warning', {msg: '已满强化'}); return; }
    var cost = Math.floor((lv + 1) * 200 * Math.pow(1.5, lv));
    if (gameState.gold < cost) { this.emit('warning', {msg: '金币不足（需' + cost + '）'}); return; }
    var rate = Math.max(0.2, CONFIG.ENHANCE_BASE_RATE - lv * 0.05);
    gameState.gold -= cost;
    if (Math.random() < rate) {
        inst.enhanceLevel++;
        if (inst.enhanceLevel > gameState.stats.maxEnhanceLevel) gameState.stats.maxEnhanceLevel = inst.enhanceLevel;
        gameState.dailyData.enhanceCount++;
        this.recalcEquipBonus();
        this.emit('enhanceSuccess', {name: inst.name, level: inst.enhanceLevel});
    } else {
        this.emit('enhanceFail', {name: inst.name});
    }
    this.checkAchievements();
};
GameCore.prototype.enhanceEquipGem = function(uid) {
    var inst = this.findEquipInBag(uid); if (!inst) return;
    var lv = inst.enhanceLevel; if (lv >= 10) { this.emit('warning', {msg: '已满强化'}); return; }
    var cost = Math.floor((lv + 1) * 200 * Math.pow(1.5, lv));
    var gemCost = CONFIG.ENHANCE_GEM_GUARANTEE;
    if (gameState.gold < cost) { this.emit('warning', {msg: '金币不足'}); return; }
    if (gameState.gem < gemCost) { this.emit('warning', {msg: '宝石不足（需' + gemCost + '颗）'}); return; }
    gameState.gold -= cost; gameState.gem -= gemCost;
    inst.enhanceLevel++;
    if (inst.enhanceLevel > gameState.stats.maxEnhanceLevel) gameState.stats.maxEnhanceLevel = inst.enhanceLevel;
    this.recalcEquipBonus();
    this.emit('enhanceSuccess', {name: inst.name, level: inst.enhanceLevel, gem: true});
    this.checkAchievements();
};
GameCore.prototype.sellEquip = function(uid) {
    var idx = -1; for (var i = 0; i < gameState.equipBag.length; i++) { if (gameState.equipBag[i].uid === uid) { idx = i; break; } }
    if (idx < 0) return;
    var inst = gameState.equipBag[idx];
    var qMult = {common:1, uncommon:2, rare:5, epic:12, legendary:30};
    var price = Math.max(10, Math.floor((inst.atk + inst.def + inst.hp * 0.1 + inst.spd + inst.luck) * (qMult[inst.quality] || 1) * (1 + inst.enhanceLevel * 0.2)));
    gameState.equipBag.splice(idx, 1);
    var slots = ['weapon', 'armor', 'acc1', 'acc2'];
    for (var s = 0; s < slots.length; s++) { if (gameState.equipment[slots[s]] === uid) { gameState.equipment[slots[s]] = null; this.recalcEquipBonus(); } }
    this.gainGold(price);
    this.emit('sellEquip', {name: inst.name, price: price});
};

/* ========== 伤害公式 ========== */
GameCore.prototype.calcDamage = function(atk, def, luck, isPlayer) {
    var totalAtk = this.getTotalStat('atk') + atk;
    var totalDef = this.getTotalStat('def') + def;
    var base = totalAtk * 1.2 / (1 + totalDef * 0.08);
    var dmg = Math.max(1, Math.floor(base + Math.random() * 5 - 2));
    if (gameState.buffRage > 0 && isPlayer) dmg = Math.floor(dmg * 1.5);
    var crit = Math.random() < (luck || 0) * 0.02;
    if (crit) {
        var critMult = 1.5;
        // 破军剑意：暴击伤害加成
        if (isPlayer && this.hasArt('breaker')) { critMult += this.getArtEffect('breaker'); }
        dmg = Math.floor(dmg * critMult); gameState.stats.totalCrits++;
    }
    return {dmg: dmg, crit: crit};
};

/* ========== 敌人选择 ========== */
GameCore.prototype.getAvailableEnemies = function() {
    var normals = ENEMIES.filter(function(e){return !e.isBoss;});
    var maxIdx = Math.min(Math.floor(gameState.level / CONFIG.ENEMY_UNLOCK_STEP), normals.length - 1);
    var pool = normals.slice(0, maxIdx + 1); var weights = pool.map(function(_, i){return 1 + i;});
    var total = weights.reduce(function(a, b){return a + b;}, 0); var r = Math.random() * total; var acc = 0;
    for (var i = 0; i < pool.length; i++) { acc += weights[i]; if (r <= acc) return pool[i]; } return pool[pool.length - 1];
};
GameCore.prototype.getAvailableBoss = function() {
    var bosses = ENEMIES.filter(function(e){return e.isBoss;}); var unlockLevels = [25, 45, 70]; var available = [];
    for (var i = 0; i < bosses.length && i < unlockLevels.length; i++) { if (gameState.level >= unlockLevels[i]) available.push(bosses[i]); }
    return available.length > 0 ? available[available.length - 1] : null;
};
GameCore.prototype.scaleEnemy = function(tpl) {
    var lv = gameState.level;
    var sH = tpl.isBoss ? (1 + lv * 0.08) : (1 + lv * 0.05);
    var sA = tpl.isBoss ? (1 + lv * 0.06) : (1 + lv * 0.04);
    return {
        id:tpl.id, name:tpl.name, isBoss:tpl.isBoss, skills:tpl.skills||[],
        hp:Math.floor(tpl.hp*sH), maxHp:Math.floor(tpl.hp*sH),
        atk:Math.floor(tpl.atk*sA), def:tpl.def,
        exp:Math.floor(tpl.exp*(1+lv*0.06)), gold:Math.floor(tpl.gold*(1+lv*0.08))
    };
};

/* ========== 战斗系统 ========== */
GameCore.prototype.startBossBattle = function() {
    if (gameState.currentEnemy) { this.emit('warning', {msg: '当前有战斗进行中'}); return; }
    if (gameState.hp <= 0) { gameState.hp = gameState.maxHp; }
    this.initDailyTasks(); gameState.stats.totalBattlesDay++;
    var boss = this.getAvailableBoss();
    if (!boss) { this.emit('warning', {msg: '尚未解锁Boss'}); return; }
    gameState.currentEnemy = this.scaleEnemy(boss); gameState.battleMode = 'manual';
    gameState.battleShield = 0;
    if (this.hasArt('aura_shield')) { gameState.battleShield = Math.floor(gameState.maxHp * this.getArtEffect('aura_shield')); }
    this.emit('battleStart', {enemy: gameState.currentEnemy, isBoss: true, shield: gameState.battleShield});
};

GameCore.prototype.startBattle = function() {
    if (gameState.currentEnemy) { this.emit('warning', {msg: '当前有战斗进行中'}); return; }
    if (gameState.hp <= 0) { gameState.hp = gameState.maxHp; }
    this.initDailyTasks(); gameState.stats.totalBattlesDay++;
    var boss = this.getAvailableBoss(); var tpl;
    if (boss && Math.random() < 0.35) tpl = boss; else tpl = this.getAvailableEnemies();
    gameState.currentEnemy = this.scaleEnemy(tpl); gameState.battleMode = tpl.isBoss ? 'manual' : 'auto';
    gameState.battleShield = 0;
    if (this.hasArt('aura_shield')) { gameState.battleShield = Math.floor(gameState.maxHp * this.getArtEffect('aura_shield')); }
    this.emit('battleStart', {enemy: gameState.currentEnemy, isBoss: tpl.isBoss, shield: gameState.battleShield});
};

/* 自动战斗 - 由渲染层驱动 setInterval，每 tick 调此方法 */
GameCore.prototype.autoBattleTick = function() {
    if (!gameState.currentEnemy || gameState.battleMode !== 'auto') return false;
    // 自动嗑药
    if (gameState.hp < gameState.maxHp * 0.3 && gameState.inventory['potion_hp'] && gameState.inventory['potion_hp'] > 0) {
        gameState.inventory['potion_hp']--; if (gameState.inventory['potion_hp'] <= 0) delete gameState.inventory['potion_hp'];
        var potionAmt = Math.min(Math.floor(gameState.maxHp * 0.15), gameState.maxHp - gameState.hp);
        gameState.hp = Math.min(gameState.maxHp, gameState.hp + Math.floor(gameState.maxHp * 0.15));
        this.emit('battleLog', {msg: '自动使用生命药水，恢复 ' + potionAmt + ' 点生命', cls: 'system'});
    }
    if (gameState.hp < gameState.maxHp * 0.15 && gameState.inventory['potion_hp_lg'] && gameState.inventory['potion_hp_lg'] > 0) {
        gameState.inventory['potion_hp_lg']--; if (gameState.inventory['potion_hp_lg'] <= 0) delete gameState.inventory['potion_hp_lg'];
        var lgAmt = Math.min(Math.floor(gameState.maxHp * 0.4), gameState.maxHp - gameState.hp);
        gameState.hp = Math.min(gameState.maxHp, gameState.hp + Math.floor(gameState.maxHp * 0.4));
        this.emit('battleLog', {msg: '自动使用大还丹，恢复 ' + lgAmt + ' 点生命', cls: 'system'});
    }
    // 玩家攻击
    var pR = this.calcDamage(gameState.atk, gameState.currentEnemy.def, gameState.luck, true);
    var pDmg = pR.dmg;
    // 天剑诀：对Boss伤害加成
    if (gameState.currentEnemy.isBoss && this.hasArt('heavenly')) {
        pDmg = Math.floor(pDmg * (1 + this.getArtEffect('heavenly')));
    }
    gameState.currentEnemy.hp -= pDmg;
    this.emit('playerAttack', {dmg: pDmg, crit: pR.crit});
    if (gameState.currentEnemy.hp <= 0) { this.winBattle(); return false; }
    // 万剑归宗：概率二次攻击
    if (this.hasArt('myriad') && Math.random() < this.getArtEffect('myriad')) {
        var pR2 = this.calcDamage(gameState.atk, gameState.currentEnemy.def, gameState.luck, true);
        var pDmg2 = pR2.dmg;
        if (gameState.currentEnemy.isBoss && this.hasArt('heavenly')) {
            pDmg2 = Math.floor(pDmg2 * (1 + this.getArtEffect('heavenly')));
        }
        gameState.currentEnemy.hp -= pDmg2;
        this.emit('playerAttack', {dmg: pDmg2, crit: pR2.crit, extraAttack: true});
        if (gameState.currentEnemy.hp <= 0) { this.winBattle(); return false; }
    }
    // 敌人攻击
    var eR = this.calcDamage(gameState.currentEnemy.atk, gameState.def, 0);
    var eDmg = eR.dmg;
    // 金刚体：受伤减免
    if (this.hasArt('vajra')) { var redux = this.getArtEffect('vajra'); eDmg = Math.floor(eDmg * (1 - redux)); }
    // 灵气护体：护盾先吸收伤害
    if (gameState.battleShield > 0) { var absorbed = Math.min(gameState.battleShield, eDmg); gameState.battleShield -= absorbed; eDmg -= absorbed; }
    gameState.hp -= eDmg;
    // 不灭身：致命伤保留1HP
    if (gameState.hp <= 0 && this.hasArt('immortal') && gameState.immortalCooldown <= 0) {
        gameState.hp = 1; gameState.immortalCooldown = this.getArtEffect('immortal');
        eR.artImmortal = true;
    }
    this.emit('enemyAttack', {dmg: eDmg, crit: eR.crit, artImmortal: eR.artImmortal});
    if (gameState.hp <= 0) { this.loseBattle(); return false; }
    return true;
};

/* 手动战斗 */
GameCore.prototype.playerAttack = function() {
    if (gameState.playerActionLock || gameState.battleTurn !== 'player') return;
    gameState.playerActionLock = true;
    var pR = this.calcDamage(gameState.atk, gameState.currentEnemy.def, gameState.luck, true);
    var pDmg = pR.dmg;
    // 天剑诀：对Boss伤害加成
    if (gameState.currentEnemy.isBoss && this.hasArt('heavenly')) {
        pDmg = Math.floor(pDmg * (1 + this.getArtEffect('heavenly')));
    }
    gameState.currentEnemy.hp -= pDmg;
    this.emit('playerAttack', {dmg: pDmg, crit: pR.crit});
    if (gameState.currentEnemy.hp <= 0) { this.winBattle(); return; }
    // 万剑归宗：概率二次攻击
    if (this.hasArt('myriad') && Math.random() < this.getArtEffect('myriad')) {
        var pR2 = this.calcDamage(gameState.atk, gameState.currentEnemy.def, gameState.luck, true);
        var pDmg2 = pR2.dmg;
        if (gameState.currentEnemy.isBoss && this.hasArt('heavenly')) {
            pDmg2 = Math.floor(pDmg2 * (1 + this.getArtEffect('heavenly')));
        }
        gameState.currentEnemy.hp -= pDmg2;
        this.emit('playerAttack', {dmg: pDmg2, crit: pR2.crit, extraAttack: true});
        if (gameState.currentEnemy.hp <= 0) { this.winBattle(); return; }
    }
    this.afterPlayerAction();
};
GameCore.prototype.playerSkill = function() {
    if (gameState.playerActionLock || gameState.battleTurn !== 'player') return;
    var fbLvl = gameState.skills['fireball'] || 0; if (fbLvl <= 0) { this.emit('warning', {msg: '尚未学会火球术'}); return; }
    if (gameState.energy < 10) { this.emit('warning', {msg: '能量不足'}); return; }
    gameState.playerActionLock = true; gameState.energy -= 10;
    var sk = SKILLS.filter(function(s){return s.id==='fireball';})[0]; var mult = sk.effect(fbLvl);
    var totalAtk = this.getTotalStat('atk');
    var dmg = Math.max(1, Math.floor(totalAtk * mult / (1 + gameState.currentEnemy.def * 0.08) + Math.random() * 5));
    if (gameState.buffRage > 0) dmg = Math.floor(dmg * 1.5);
    var crit = Math.random() < gameState.luck * 0.02; if (crit) { dmg = Math.floor(dmg * 1.5); gameState.stats.totalCrits++; }
    gameState.currentEnemy.hp -= dmg;
    this.emit('playerSkill', {dmg: dmg, crit: crit, name: '火球术'});
    this.afterPlayerAction();
};
GameCore.prototype.playerHeal = function() {
    if (gameState.playerActionLock || gameState.battleTurn !== 'player') return;
    var healLvl = gameState.skills['heal'] || 0; if (healLvl <= 0) { this.emit('warning', {msg: '尚未学会治愈术'}); return; }
    if (gameState.energy < 8) { this.emit('warning', {msg: '能量不足'}); return; }
    gameState.playerActionLock = true; gameState.energy -= 8;
    var sk = SKILLS.filter(function(s){return s.id==='heal';})[0]; var pct = sk.effect(healLvl);
    var amt = Math.floor(gameState.maxHp * pct) + 30;
    gameState.hp = Math.min(gameState.maxHp, gameState.hp + amt);
    this.emit('playerHeal', {amt: amt});
    this.afterPlayerAction();
};
GameCore.prototype.playerUseItem = function() {
    if (!gameState.inventory['potion_hp'] || gameState.inventory['potion_hp'] <= 0) { this.emit('warning', {msg: '没有生命药水'}); return; }
    gameState.inventory['potion_hp']--; if (gameState.inventory['potion_hp'] <= 0) delete gameState.inventory['potion_hp'];
    var amt = Math.min(Math.floor(gameState.maxHp * 0.15), gameState.maxHp - gameState.hp);
    gameState.hp = Math.min(gameState.maxHp, gameState.hp + Math.floor(gameState.maxHp * 0.15));
    this.emit('playerUseItem', {amt: amt});
};
GameCore.prototype.playerFlee = function() {
    if (gameState.playerActionLock || gameState.battleTurn !== 'player') return;
    gameState.playerActionLock = true;
    var fleeRate = 0.5 + gameState.spd * 0.01;
    if (Math.random() < fleeRate) {
        this.emit('fleeSuccess', {});
        gameState.currentEnemy = null;
    } else {
        this.emit('fleeFail', {});
        this.enemyTurn();
    }
};
GameCore.prototype.afterPlayerAction = function() {
    if (gameState.currentEnemy.hp <= 0) { this.winBattle(); return; }
    this.emit('afterPlayerAction', {});
    var self = this;
    setTimeout(function(){ self.enemyTurn(); }, 500);
};

/* 敌人AI回合 */
GameCore.prototype.enemyTurn = function() {
    if (!gameState.currentEnemy) return;
    var e = gameState.currentEnemy; var self = this;
    if (e.isBoss && e.skills && e.skills.length > 0) {
        var chosenSkill = null;
        for (var i = 0; i < e.skills.length; i++) {
            var sk = BOSS_SKILLS[e.skills[i]]; if (!sk) continue;
            if (Math.random() < sk.chance) { chosenSkill = sk; break; }
        }
        if (chosenSkill) {
            var sDmg = Math.max(1, Math.floor(e.atk * chosenSkill.mult / (1 + this.getTotalStat('def') * 0.08) + Math.random() * 5));
            gameState.hp -= sDmg;
            this.emit('bossSkill', {name: e.name, skill: chosenSkill.name, dmg: sDmg});
            if (chosenSkill.healPct) {
                var healAmt = Math.floor(e.maxHp * chosenSkill.healPct);
                e.hp = Math.min(e.maxHp, e.hp + healAmt);
                this.emit('battleLog', {msg: e.name + ' 恢复了 ' + healAmt + ' 点生命', cls: 'system'});
            }
            if (chosenSkill.stun) {
                this.emit('stun', {});
                return; // stun 由渲染层处理定时器后再调用 enemyTurn
            }
            if (gameState.hp <= 0) { this.loseBattle(); return; }
            gameState.battleTurn = 'player'; gameState.playerActionLock = false;
            return;
        }
    }
    var eR = this.calcDamage(e.atk, 0, 0); var eDmg2 = eR.dmg;
    // 金刚体：受伤减免
    if (this.hasArt('vajra')) { var redux2 = this.getArtEffect('vajra'); eDmg2 = Math.floor(eDmg2 * (1 - redux2)); }
    // 灵气护体：护盾先吸收伤害
    if (gameState.battleShield > 0) { var absorbed2 = Math.min(gameState.battleShield, eDmg2); gameState.battleShield -= absorbed2; eDmg2 -= absorbed2; }
    gameState.hp -= eDmg2;
    // 不灭身：致命伤保留1HP
    var artImmortal2 = false;
    if (gameState.hp <= 0 && this.hasArt('immortal') && gameState.immortalCooldown <= 0) {
        gameState.hp = 1; gameState.immortalCooldown = this.getArtEffect('immortal'); artImmortal2 = true;
    }
    this.emit('enemyAttack', {dmg: eDmg2, crit: eR.crit, artImmortal: artImmortal2});
    if (gameState.hp <= 0) { this.loseBattle(); return; }
    gameState.battleTurn = 'player'; gameState.playerActionLock = false;
};

GameCore.prototype.winBattle = function() {
    this.initDailyTasks();
    gameState.stats.totalBattles++; gameState.stats.totalWins++;
    gameState.stats.totalWinsDay++;
    var e = gameState.currentEnemy;
    if (e.isBoss) { gameState.stats.bossKills++; gameState.buffRage = 0; }
    this.gainExp(e.exp); this.gainGold(e.gold);
    // 嗜血诀：击杀回血
    var artHealAmt = 0;
    if (this.hasArt('bloodthirst')) {
        var pct = this.getArtEffect('bloodthirst');
        artHealAmt = Math.floor(gameState.maxHp * pct);
        gameState.hp = Math.min(gameState.maxHp, gameState.hp + artHealAmt);
    }
    // 不灭身冷却递减
    if (gameState.immortalCooldown > 0) gameState.immortalCooldown--;
    // 幸运掉落
    var luckDrop = null;
    if (Math.random() < gameState.luck * 0.03) {
        var bg = Math.floor(e.gold * 0.5); gameState.gem += 1; this.gainGold(bg);
        luckDrop = {gold: bg, gem: 1};
    }
    // Boss必掉1宝石+1悟性点
    if (e.isBoss) { gameState.gem += 1; gameState.enlightenment += 1; }
    // 装备掉落
    var drop = this.rollEquipDrop();
    if (gameState.buffRage > 0) gameState.buffRage--;
    var result = {exp: e.exp, gold: e.gold, luckDrop: luckDrop, equipDrop: drop, isBoss: e.isBoss, artHealAmt: artHealAmt};
    gameState.currentEnemy = null; gameState.battleMode = null;
    this.emit('winBattle', result);
    this.checkAchievements();
};
GameCore.prototype.loseBattle = function() {
    gameState.stats.totalBattles++; gameState.stats.totalDeaths++;
    var recoverPct = 0.1;
    // 脱胎换骨：战败额外恢复
    if (this.hasArt('rebirth')) recoverPct += this.getArtEffect('rebirth');
    gameState.hp = Math.floor(gameState.maxHp * recoverPct);
    gameState.buffRage = 0; gameState.currentEnemy = null; gameState.battleMode = null;
    gameState.battleShield = 0;
    this.emit('loseBattle', {rebirthBonus: this.hasArt('rebirth') ? this.getArtEffect('rebirth') : 0});
};

/* ========== 技能/物品 ========== */
GameCore.prototype.upgradeSkill = function(skillId) {
    var sk = SKILLS.filter(function(s){return s.id === skillId;})[0]; var lvl = gameState.skills[skillId] || 0;
    if (lvl >= sk.maxLevel) { this.emit('warning', {msg: '已满级'}); return; }
    var discount = Math.max(0.7, 1 - gameState.comprehension * 0.03); var cost = Math.floor(sk.cost(lvl + 1) * discount);
    if (gameState.gold < cost) { this.emit('warning', {msg: '金币不足（需' + cost + '）'}); return; }
    gameState.gold -= cost; gameState.skills[skillId] = lvl + 1;
    this.initDailyTasks(); gameState.dailyData.skillUpCount++;
    if (sk.type === 'passive') { if (skillId === 'strength') gameState.atk += sk.effect(1); if (skillId === 'shield') gameState.def += sk.effect(1); }
    this.emit('upgradeSkill', {name: sk.name, level: lvl + 1});
    this.checkAchievements();
};
GameCore.prototype.buyItem = function(itemId) {
    var si = CONSUMABLES.filter(function(c){return c.id === itemId;})[0]; if (!si) return;
    if (si.currency === 'gold' && gameState.gold < si.price) { this.emit('warning', {msg: '金币不足'}); return; }
    if (si.currency === 'gem' && gameState.gem < si.price) { this.emit('warning', {msg: '宝石不足'}); return; }
    if (si.currency === 'gold') gameState.gold -= si.price; else gameState.gem -= si.price;
    gameState.inventory[itemId] = (gameState.inventory[itemId] || 0) + 1;
    this.emit('buyItem', {name: si.name});
};
GameCore.prototype.useItem = function(itemId) {
    if (!gameState.inventory[itemId] || gameState.inventory[itemId] <= 0) return;
    var it = CONSUMABLES.filter(function(c){return c.id === itemId;})[0]; if (!it) return;
    var maxHp = gameState.maxHp; var result = {};
    // 丹成九转：药品效果加成
    var potionMult = 1; if (this.hasArt('alchemy_master')) potionMult += this.getArtEffect('alchemy_master');
    if (it.effect === 'heal_15pct') { var raw = Math.floor(maxHp * 0.15 * potionMult); var h = Math.min(raw, maxHp - gameState.hp); gameState.hp = Math.min(maxHp, gameState.hp + raw); result.healAmt = h; }
    if (it.effect === 'heal_40pct') { var raw2 = Math.floor(maxHp * 0.4 * potionMult); var h2 = Math.min(raw2, maxHp - gameState.hp); gameState.hp = Math.min(maxHp, gameState.hp + raw2); result.healAmt = h2; }
    if (it.effect === 'energy_50') { gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + Math.floor(50 * potionMult)); result.energyAmt = Math.floor(50 * potionMult); }
    if (it.effect === 'exp_200') { this.gainExp(Math.floor(200 * potionMult)); result.expAmt = Math.floor(200 * potionMult); }
    if (it.effect === 'rage') { gameState.buffRage = 3; result.buff = 'rage'; }
    if (it.effect === 'focus') { gameState.buffFocus = 5; result.buff = 'focus'; }
    if (it.effect === 'gem_10') { gameState.gem += 10; result.gemAmt = 10; }
    gameState.inventory[itemId]--; if (gameState.inventory[itemId] <= 0) delete gameState.inventory[itemId];
    this.emit('useItem', result);
};

/* ========== 神功/功法 ========== */

/* 获取流派解锁状态 */
GameCore.prototype.getUnlockedSchools = function() {
    return ART_SCHOOLS.filter(function(s){ return gameState.level >= s.unlockLevel; });
};

/* 获取已选神功（按流派） */
GameCore.prototype.getSelectedArts = function() {
    var result = {};
    ART_SCHOOLS.forEach(function(s){ result[s.id] = gameState.arts[s.id] || null; });
    return result;
};

/* 领悟神功：选择某个流派中的一个神功 */
GameCore.prototype.learnArt = function(artId) {
    var art = ARTS.filter(function(a){return a.id === artId;})[0];
    if (!art) { this.emit('warning', {msg: '无效的神功'}); return; }
    var school = ART_SCHOOLS.filter(function(s){return s.id === art.school;})[0];
    if (gameState.level < school.unlockLevel) { this.emit('warning', {msg: '需要达到Lv.' + school.unlockLevel + '解锁' + school.name}); return; }
    // 互斥：同流派只能选一个
    if (gameState.arts[art.school]) { this.emit('warning', {msg: '已领悟该流派神功，需先遗忘（消耗5宝石）'}); return; }
    // 花费：100金币 + 1悟性点
    if (gameState.gold < 100) { this.emit('warning', {msg: '金币不足（需100）'}); return; }
    if (gameState.enlightenment < 1) { this.emit('warning', {msg: '悟性点不足（需1点）'}); return; }
    gameState.gold -= 100;
    gameState.enlightenment -= 1;
    gameState.arts[art.school] = artId;
    gameState.artLevels[artId] = 1;
    gameState.stats.artsLearned = (gameState.stats.artsLearned || 0) + 1;
    this.emit('learnArt', {art: art, school: school});
    this.checkAchievements();
};

/* 遗忘神功：花费5宝石重置某流派 */
GameCore.prototype.forgetArt = function(schoolId) {
    if (!gameState.arts[schoolId]) { this.emit('warning', {msg: '该流派未领悟神功'}); return; }
    if (gameState.gem < 5) { this.emit('warning', {msg: '宝石不足（需5）'}); return; }
    var oldArtId = gameState.arts[schoolId];
    var oldArt = ARTS.filter(function(a){return a.id === oldArtId;})[0];
    gameState.gem -= 5;
    delete gameState.arts[schoolId];
    delete gameState.artLevels[oldArtId];
    this.emit('forgetArt', {schoolId: schoolId, oldArt: oldArt});
};

/* 升级神功 */
GameCore.prototype.upgradeArt = function(artId) {
    var art = ARTS.filter(function(a){return a.id === artId;})[0];
    if (!art) return;
    var lvl = gameState.artLevels[artId] || 0;
    if (lvl <= 0) { this.emit('warning', {msg: '尚未领悟该神功'}); return; }
    if (lvl >= art.maxLevel) { this.emit('warning', {msg: '已满级'}); return; }
    var goldCost = ART_UPGRADE_COST.gold(lvl);
    var enCost = ART_UPGRADE_COST.enlightenment(lvl);
    if (gameState.gold < goldCost) { this.emit('warning', {msg: '金币不足（需' + goldCost + '）'}); return; }
    if (gameState.enlightenment < enCost) { this.emit('warning', {msg: '悟性点不足（需' + enCost + '点）'}); return; }
    gameState.gold -= goldCost;
    gameState.enlightenment -= enCost;
    gameState.artLevels[artId] = lvl + 1;
    if (lvl + 1 >= art.maxLevel) {
        gameState.stats.artsMaxed = (gameState.stats.artsMaxed || 0) + 1;
    }
    this.emit('upgradeArt', {art: art, level: lvl + 1});
    this.checkAchievements();
};

/* 获取神功效果值 */
GameCore.prototype.getArtEffect = function(artId) {
    var art = ARTS.filter(function(a){return a.id === artId;})[0];
    if (!art) return 0;
    var lvl = gameState.artLevels[artId] || 0;
    if (lvl <= 0) return 0;
    return art.effect(lvl);
};

/* 检查是否有某神功 */
GameCore.prototype.hasArt = function(artId) {
    return (gameState.artLevels[artId] || 0) > 0;
};

/* ========== 成就 ========== */
GameCore.prototype.checkAchievements = function() {
    var self = this;
    ACHIEVEMENTS.forEach(function(a) {
        if (!gameState.achievements.includes(a.id) && a.condition(gameState)) {
            gameState.achievements.push(a.id);
            if (a.reward.gold) self.gainGold(a.reward.gold); if (a.reward.gem) gameState.gem += a.reward.gem;
            self.emit('achievement', {name: a.name, reward: a.reward});
        }
    });
};

/* ========== 属性分配 ========== */
GameCore.prototype.assignStat = function(statId) {
    if (gameState.freePoints < 1) return; gameState.freePoints--;
    if (statId === 'hp') { gameState.maxHp += 20; gameState.hp += 20; gameState.hpAllocated = (gameState.hpAllocated || 0) + 20; }
    if (statId === 'atk') gameState.atk += 2; if (statId === 'def') gameState.def += 1; if (statId === 'spd') gameState.spd += 1;
    if (statId === 'luck') gameState.luck += 1; if (statId === 'comp') gameState.comprehension += 1;
    this.emit('assignStat', {stat: statId});
};

/* ========== 设置 ========== */
GameCore.prototype.toggleSetting = function(id) {
    gameState.settings[id] = !gameState.settings[id];
    this.emit('toggleSetting', {id: id, value: gameState.settings[id]});
};
