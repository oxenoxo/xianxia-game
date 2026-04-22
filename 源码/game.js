// 宠物养成 - 游戏核心逻辑

// ==================== 游戏配置 ====================
const CONFIG = {
    SAVE_KEY: 'pet_save',
    SAVE_INTERVAL: 30000, // 30秒自动保存
    AUTO_CULTIVATE_INTERVAL: 1000, // 自动训练间隔1秒
    OFFLINE_MAX_HOURS: 8, // 最大离线收益8小时
    ENERGY_REGEN_RATE: 5, // 能量恢复速率（秒/点）
    BATTLE_TICK: 1000, // 战斗回合间隔
};

// ==================== 宠物数据定义 ====================
const PETS = [
    {
        id: 'cat',
        name: '小猫咪',
        description: '可爱的小猫咪，成长潜力巨大',
        unlocked: true, // 初始解锁
        forms: [
            { level: 1, image: 'pets/猫咪形态1.png', name: '幼猫期', statsBonus: { hp: 0, atk: 0, def: 0, spd: 2 } },
            { level: 5, image: 'pets/猫咪形态2.png', name: '成猫期', statsBonus: { hp: 10, atk: 3, def: 2, spd: 3 } },
            { level: 10, image: 'pets/猫咪最终形态.png', name: '猫王', statsBonus: { hp: 30, atk: 8, def: 5, spd: 5 } }
        ]
    },
    {
        id: 'fire_dragon',
        name: '火龙',
        description: '火焰属性的龙族宠物，攻击力突出',
        unlocked: false,
        forms: [
            { level: 1, image: 'pets/火龙形态1.png', name: '火龙幼崽', statsBonus: { hp: 5, atk: 5, def: 1, spd: 1 } },
            { level: 10, image: 'pets/火龙形态3.png', name: '火龙青年', statsBonus: { hp: 20, atk: 10, def: 4, spd: 2 } },
            { level: 20, image: 'pets/火龙最终形态.png', name: '烈焰龙王', statsBonus: { hp: 50, atk: 20, def: 8, spd: 3 } }
        ]
    },
    {
        id: 'mushroom',
        name: '蘑菇精',
        description: '森林中的蘑菇精灵，防御和恢复能力强',
        unlocked: false,
        forms: [
            { level: 1, image: 'pets/蘑菇形态1.png', name: '小蘑菇', statsBonus: { hp: 10, atk: 1, def: 3, spd: 1 } },
            { level: 8, image: 'pets/蘑菇形态2.png', name: '蘑菇人', statsBonus: { hp: 25, atk: 3, def: 6, spd: 2 } },
            { level: 15, image: 'pets/蘑菇形态3.png', name: '蘑菇王', statsBonus: { hp: 40, atk: 6, def: 10, spd: 3 } }
        ]
    },
    {
        id: 'water_spirit',
        name: '小水灵',
        description: '水元素的精灵，敏捷和幸运值高',
        unlocked: false,
        forms: [
            { level: 1, image: 'pets/小水形态1.png', name: '小水滴', statsBonus: { hp: 3, atk: 2, def: 1, spd: 4 } },
            { level: 6, image: 'pets/小水2.png', name: '水精灵', statsBonus: { hp: 15, atk: 4, def: 3, spd: 6 } },
            { level: 12, image: 'pets/小水3.png', name: '水之领主', statsBonus: { hp: 30, atk: 7, def: 5, spd: 8 } }
        ]
    }
];

// ==================== 游戏数据定义 ====================
const REALMS = [
    { name: '幼年期', level: 1, color: '#8b7a70' },
    { name: '成长期', level: 5, color: '#ff9a8b' },
    { name: '成熟期', level: 10, color: '#77b5fe' },
    { name: '壮年期', level: 20, color: '#c77dff' },
    { name: '巅峰期', level: 35, color: '#ff6b6b' },
    { name: '传说期', level: 50, color: '#ffd700' },
    { name: '神话期', level: 70, color: '#ff9a8b' },
    { name: '不朽期', level: 90, color: '#6bcb77' },
    { name: '永恒期', level: 120, color: '#c77dff' },
    { name: '超神期', level: 150, color: '#ffb347' },
    { name: '创世期', level: 200, color: '#ffffff' },
];

const SKILLS = [
    {
        id: 'scratch',
        name: '抓击',
        icon: '🐾',
        desc: '用爪子攻击敌人',
        maxLevel: 10,
        cost: (level) => level * 100,
        effect: (level) => level * 5,
        type: 'attack',
    },
    {
        id: 'heal',
        name: '治愈',
        icon: '💚',
        desc: '恢复体力',
        maxLevel: 10,
        cost: (level) => level * 80,
        effect: (level) => level * 10,
        type: 'heal',
    },
    {
        id: 'play',
        name: '玩耍',
        icon: '🏃',
        desc: '提升训练速度',
        maxLevel: 10,
        cost: (level) => level * 120,
        effect: (level) => 1 + level * 0.1,
        type: 'cultivation',
    },
    {
        id: 'strength',
        name: '力量训练',
        icon: '💪',
        desc: '永久提升攻击力',
        maxLevel: 10,
        cost: (level) => level * 150,
        effect: (level) => level * 3,
        type: 'passive',
    },
    {
        id: 'shield',
        name: '防御训练',
        icon: '🛡️',
        desc: '提升防御力',
        maxLevel: 10,
        cost: (level) => level * 130,
        effect: (level) => level * 2,
        type: 'passive',
    },
    {
        id: 'double_exp',
        name: '双倍经验',
        icon: '✨',
        desc: '训练获得双倍经验',
        maxLevel: 5,
        cost: (level) => level * 500,
        effect: (level) => 1 + level * 0.5,
        type: 'cultivation',
    },
];

const ENEMIES = [
    { id: 'dog', name: '小狗', emoji: '🐶', hp: 50, atk: 8, def: 2, exp: 20, gold: 10 },
    { id: 'rabbit', name: '兔子', emoji: '🐰', hp: 80, atk: 12, def: 5, exp: 35, gold: 20 },
    { id: 'bird', name: '小鸟', emoji: '🐦', hp: 40, atk: 15, def: 1, exp: 25, gold: 15 },
    { id: 'squirrel', name: '松鼠', emoji: '🐿️', hp: 150, atk: 20, def: 10, exp: 60, gold: 40 },
    { id: 'raccoon', name: '浣熊', emoji: '🦝', hp: 200, atk: 30, def: 15, exp: 100, gold: 70 },
    { id: 'fox', name: '狐狸', emoji: '🦊', hp: 500, atk: 50, def: 30, exp: 300, gold: 200 },
];

const ITEMS = [
    { id: 'potion_hp', name: '体力饼干', icon: '🍪', desc: '恢复50点体力', type: 'consumable', effect: 'heal_50' },
    { id: 'potion_energy', name: '能量饮料', icon: '🧃', desc: '恢复50点能量', type: 'consumable', effect: 'energy_50' },
    { id: 'scroll_exp', name: '经验书', icon: '📚', desc: '获得100点经验', type: 'consumable', effect: 'exp_100' },
    { id: 'gem_box', name: '宝石盒', icon: '💎', desc: '获得10颗宝石', type: 'consumable', effect: 'gem_10' },
    { id: 'sword', name: '铃铛项圈', icon: '🔔', desc: '攻击力+5', type: 'equipment', effect: 'atk_5', slot: 'weapon' },
    { id: 'armor', name: '可爱围巾', icon: '🧣', desc: '防御力+3', type: 'equipment', effect: 'def_3', slot: 'armor' },
    // 精灵球系列
    { id: 'ball_normal', name: '精灵球', icon: '⚪', desc: '捕捉宠物的精灵球，成功率+20%', type: 'consumable', effect: 'catch_20', catchBonus: 0.2 },
    { id: 'ball_great', name: '高级球', icon: '🔵', desc: '高级精灵球，成功率+40%', type: 'consumable', effect: 'catch_40', catchBonus: 0.4 },
    { id: 'ball_ultra', name: '大师球', icon: '🟡', desc: '大师级精灵球，成功率+70%', type: 'consumable', effect: 'catch_70', catchBonus: 0.7 },
];

const SHOP_ITEMS = [
    { id: 'potion_hp', name: '体力饼干', icon: '🍪', price: 50, currency: 'gold' },
    { id: 'potion_energy', name: '能量饮料', icon: '🧃', price: 100, currency: 'gold' },
    { id: 'scroll_exp', name: '经验书', icon: '📚', price: 200, currency: 'gold' },
    { id: 'gem_box', name: '宝石盒', icon: '💎', price: 10, currency: 'gem' },
    { id: 'sword', name: '铃铛项圈', icon: '🔔', price: 500, currency: 'gold' },
    { id: 'armor', name: '可爱围巾', icon: '🧣', price: 400, currency: 'gold' },
    // 精灵球系列
    { id: 'ball_normal', name: '精灵球', icon: '⚪', price: 100, currency: 'gold' },
    { id: 'ball_great', name: '高级球', icon: '🔵', price: 300, currency: 'gold' },
    { id: 'ball_ultra', name: '大师球', icon: '🟡', price: 50, currency: 'gem' },
];

const ACHIEVEMENTS = [
    { id: 'first_cultivate', name: '初遇宠物', desc: '首次训练', icon: '🌱', condition: (s) => s.stats.totalCultivations >= 1, reward: { gold: 50 } },
    { id: 'level_10', name: '小有成就', desc: '达到10级', icon: '⭐', condition: (s) => s.level >= 10, reward: { gold: 500, gem: 5 } },
    { id: 'level_50', name: '一方强者', desc: '达到50级', icon: '🌟', condition: (s) => s.level >= 50, reward: { gold: 5000, gem: 50 } },
    { id: 'first_battle', name: '初试锋芒', desc: '首次战斗', icon: '⚔️', condition: (s) => s.stats.totalBattles >= 1, reward: { gold: 30 } },
    { id: 'win_10', name: '战斗新手', desc: '胜利10场', icon: '🏅', condition: (s) => s.stats.totalWins >= 10, reward: { gold: 200 } },
    { id: 'win_100', name: '战斗大师', desc: '胜利100场', icon: '🏆', condition: (s) => s.stats.totalWins >= 100, reward: { gold: 2000, gem: 20 } },
    { id: 'gold_1000', name: '小富即安', desc: '累计获得1000金币', icon: '💰', condition: (s) => s.stats.totalGold >= 1000, reward: { gem: 10 } },
    { id: 'learn_skill', name: '技能初悟', desc: '学会第一个技能', icon: '📖', condition: (s) => Object.values(s.skills).some(v => v > 0), reward: { gold: 100 } },
    { id: 'all_skills_5', name: '技能精通', desc: '所有技能达到5级', icon: '🌠', condition: (s) => SKILLS.every(sk => (s.skills[sk.id] || 0) >= 5), reward: { gold: 5000, gem: 30 } },
];

// ==================== 游戏状态 ====================
let gameState = {
    // 基础属性
    level: 1,
    exp: 0,
    expToNext: 100,
    realm: '凡人',
    
    // 资源
    gold: 0,
    gem: 0,
    energy: 100,
    maxEnergy: 100,
    
    // 战斗属性
    hp: 100,
    maxHp: 100,
    atk: 10,
    def: 5,
    spd: 10,
    luck: 1,
    comprehension: 1,
    
    // 自由属性点
    freePoints: 0,
    
    // 技能等级
    skills: {},
    
    // 装备
    equipment: {
        weapon: null,
        armor: null,
    },
    
    // 背包
    inventory: {},
    
    // 成就
    achievements: [],
    
    // 当前敌人
    currentEnemy: null,
    enemyHp: 0,
    
    // 自动修炼
    autoCultivate: false,
    
    // 统计
    stats: {
        totalCultivations: 0,
        totalBattles: 0,
        totalWins: 0,
        totalGold: 0,
        totalExp: 0,
        totalDeaths: 0,
        startTime: Date.now(),
        lastSaveTime: Date.now(),
        lastOnlineTime: Date.now(),
    },
    
    // 宠物系统
    currentPetId: 'cat', // 当前使用的宠物ID
    pets: { // 已解锁的宠物及其等级
        cat: { level: 1, exp: 0, favorite: true }
    },
    petInventory: [], // 已捕捉但未解锁的宠物ID列表（用于捕捉系统）
    
    // 捕捉系统
    catchChance: 0.1, // 基础捕捉概率
    catchAttempts: 0,
    
    // 设置
    settings: {
        sound: true,
        autoSave: true,
        animations: true,
        autoCatch: false,
    },
};

// ==================== 游戏核心类 ====================
class Game {
    constructor() {
        this.init();
    }
    
    init() {
        this.loadGame();
        this.setupUI();
        this.setupEventListeners();
        this.startGameLoop();
        this.checkOfflineEarnings();
        this.updateUI();
    }
    
    // 加载游戏
    loadGame() {
        const saved = localStorage.getItem(CONFIG.SAVE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                gameState = this.mergeDeep(gameState, parsed);
            } catch (e) {
                console.error('加载存档失败:', e);
            }
        }
    }
    
    // 保存游戏
    saveGame() {
        try {
            gameState.stats.lastSaveTime = Date.now();
            localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(gameState));
            this.showToast('游戏已保存', 'success');
            document.getElementById('save-status').textContent = '已保存 ' + new Date().toLocaleTimeString();
        } catch (e) {
            console.error('保存失败:', e);
            this.showToast('保存失败', 'error');
        }
    }
    
    // 深合并对象
    mergeDeep(target, source) {
        const output = { ...target };
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key]) && key in target) {
                    output[key] = this.mergeDeep(target[key], source[key]);
                } else {
                    output[key] = source[key];
                }
            });
        }
        return output;
    }
    
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }
    
    // 检查离线收益
    checkOfflineEarnings() {
        const lastTime = gameState.stats.lastOnlineTime;
        const now = Date.now();
        const offlineSeconds = (now - lastTime) / 1000;
        
        if (offlineSeconds > 60 && gameState.autoCultivate) { // 至少离线1分钟
            const maxSeconds = CONFIG.OFFLINE_MAX_HOURS * 3600;
            const effectiveSeconds = Math.min(offlineSeconds, maxSeconds);
            const offlineMinutes = Math.floor(effectiveSeconds / 60);
            
            // 计算离线收益
            const baseExpPerMinute = 10 * this.getCultivationMultiplier();
            const offlineExp = Math.floor(baseExpPerMinute * offlineMinutes * 0.5); // 离线收益50%
            const offlineGold = Math.floor(offlineExp * 0.3);
            
            if (offlineExp > 0) {
                this.gainExp(offlineExp);
                this.gainGold(offlineGold);
                
                // 显示离线收益
                const popup = document.getElementById('offline-earnings');
                popup.textContent = `离线收益: ${this.formatTime(offlineSeconds)} 获得 ${offlineExp} 经验, ${offlineGold} 金币`;
                popup.style.display = 'block';
                setTimeout(() => {
                    popup.style.display = 'none';
                }, 5000);
            }
        }
        
        gameState.stats.lastOnlineTime = now;
    }
    
    // 获取训练倍率
    getCultivationMultiplier() {
        let multiplier = 1;
        
        // 玩耍技能
        const playLevel = gameState.skills['play'] || 0;
        if (playLevel > 0) {
            const skill = SKILLS.find(s => s.id === 'play');
            multiplier *= skill.effect(playLevel);
        }
        
        // 双倍经验技能
        const doubleExpLevel = gameState.skills['double_exp'] || 0;
        if (doubleExpLevel > 0) {
            const skill = SKILLS.find(s => s.id === 'double_exp');
            multiplier *= skill.effect(doubleExpLevel);
        }
        
        return multiplier;
    }
    
    // 训练
    cultivate() {
        if (gameState.energy <= 0) {
            this.showToast('能量不足!', 'warning');
            return;
        }
        
        gameState.energy = Math.max(0, gameState.energy - 1);
        gameState.stats.totalCultivations++;
        
        const baseExp = 10;
        const expGain = Math.floor(baseExp * this.getCultivationMultiplier());
        this.gainExp(expGain);
        
        // 随机获得金币
        if (Math.random() < 0.3) {
            const goldGain = Math.floor(Math.random() * 5) + 1;
            this.gainGold(goldGain);
        }
        
        // 显示浮动文字
        this.showFloatingText(`+${expGain} EXP`, '#ff9a8b');
        
        this.updateUI();
    }
    
    // 获得经验
    gainExp(amount) {
        gameState.exp += amount;
        gameState.stats.totalExp += amount;
        
        // 宠物获得经验
        const currentPetData = gameState.pets[gameState.currentPetId];
        if (currentPetData) {
            currentPetData.exp += Math.floor(amount * 0.5); // 宠物获得50%经验
            this.checkPetLevelUp(gameState.currentPetId);
        }
        
        // 检查升级
        while (gameState.exp >= gameState.expToNext) {
            gameState.exp -= gameState.expToNext;
            this.levelUp();
        }
        
        this.updateUI();
    }
    
    // 宠物升级检查
    checkPetLevelUp(petId) {
        const petData = gameState.pets[petId];
        if (!petData) return;
        
        const pet = PETS.find(p => p.id === petId);
        if (!pet) return;
        
        // 简化的宠物升级逻辑：每100经验升1级
        const neededExp = (petData.level + 1) * 100;
        if (petData.exp >= neededExp) {
            petData.exp -= neededExp;
            petData.level++;
            this.showToast(`${pet.name} 升级到 Lv.${petData.level}!`, 'success');
            this.updatePetStats();
        }
    }
    
    // 更新宠物属性加成
    updatePetStats() {
        // 宠物属性加成会通过getPetStatsBonus()实时计算，这里只需要触发UI更新
        this.updateUI();
    }
    
    // 获取当前宠物属性加成
    getPetStatsBonus() {
        const pet = PETS.find(p => p.id === gameState.currentPetId);
        if (!pet) return { hp: 0, atk: 0, def: 0, spd: 0 };
        
        const petData = gameState.pets[gameState.currentPetId];
        if (!petData) return { hp: 0, atk: 0, def: 0, spd: 0 };
        
        // 根据宠物等级找到对应的形态
        let currentForm = pet.forms[0];
        for (let i = pet.forms.length - 1; i >= 0; i--) {
            if (petData.level >= pet.forms[i].level) {
                currentForm = pet.forms[i];
                break;
            }
        }
        
        return currentForm.statsBonus;
    }
    
    // 升级
    levelUp() {
        gameState.level++;
        gameState.freePoints += 2; // 每级获得2个属性点
        gameState.expToNext = Math.floor(gameState.expToNext * 1.5);
        
        // 更新成长阶段
        this.updateRealm();
        
        // 提升基础属性
        gameState.maxHp += 10;
        gameState.hp = gameState.maxHp;
        gameState.atk += 2;
        gameState.def += 1;
        gameState.spd += 1;
        
        // 提升能量上限
        if (gameState.level % 5 === 0) {
            gameState.maxEnergy += 20;
            gameState.energy = gameState.maxEnergy;
        }
        
        // 显示升级动画
        this.showLevelUpAnimation();
        this.showToast(`升级! 等级 ${gameState.level}`, 'success');
        
        // 检查成就
        this.checkAchievements();
    }
    
    // 更新成长阶段
    updateRealm() {
        let newRealm = REALMS[0].name;
        for (let i = REALMS.length - 1; i >= 0; i--) {
            if (gameState.level >= REALMS[i].level) {
                newRealm = REALMS[i].name;
                break;
            }
        }
        
        if (newRealm !== gameState.realm) {
            gameState.realm = newRealm;
            this.showToast(`成长至 ${newRealm}!`, 'success');
        }
    }
    
    // 获得金币
    gainGold(amount) {
        gameState.gold += amount;
        gameState.stats.totalGold += amount;
        this.updateUI();
    }
    
    // 战斗系统
    startBattle() {
        const enemyTemplate = ENEMIES[Math.floor(Math.random() * Math.min(gameState.level, ENEMIES.length))];
        gameState.currentEnemy = { ...enemyTemplate, maxHp: enemyTemplate.hp };
        gameState.enemyHp = enemyTemplate.hp;
        
        this.updateEnemyDisplay();
        this.showToast(`遭遇 ${enemyTemplate.name}!`, 'warning');
        
        // 自动战斗
        this.autoBattle();
    }
    
    autoBattle() {
        if (!gameState.currentEnemy || gameState.currentEnemy.hp <= 0) return;
        
        const battleInterval = setInterval(() => {
            if (!gameState.currentEnemy) {
                clearInterval(battleInterval);
                return;
            }
            
            // 玩家攻击
            const playerDmg = Math.max(1, gameState.atk - gameState.currentEnemy.def + Math.floor(Math.random() * 5));
            gameState.currentEnemy.hp -= playerDmg;
            
            this.addBattleLog(`你对 ${gameState.currentEnemy.name} 造成 ${playerDmg} 点伤害`);
            
            if (gameState.currentEnemy.hp <= 0) {
                this.winBattle();
                clearInterval(battleInterval);
                return;
            }
            
            // 敌人攻击
            const enemyDmg = Math.max(1, gameState.currentEnemy.atk - gameState.def + Math.floor(Math.random() * 3));
            gameState.hp -= enemyDmg;
            
            this.addBattleLog(`${gameState.currentEnemy.name} 对你造成 ${enemyDmg} 点伤害`);
            
            if (gameState.hp <= 0) {
                this.loseBattle();
                clearInterval(battleInterval);
                return;
            }
            
            this.updateEnemyDisplay();
            this.updateUI();
        }, CONFIG.BATTLE_TICK);
    }
    
    winBattle() {
        gameState.stats.totalBattles++;
        gameState.stats.totalWins++;
        
        const expGain = gameState.currentEnemy.exp;
        const goldGain = gameState.currentEnemy.gold;
        
        this.gainExp(expGain);
        this.gainGold(goldGain);
        
        this.addBattleLog(`胜利! 获得 ${expGain} 经验, ${goldGain} 金币`);
        this.showToast(`战斗胜利!`, 'success');
        
        // 战斗后有概率自动尝试捕捉（如果开启自动捕捉）
        if (gameState.settings.autoCatch && Math.random() < 0.3) {
            setTimeout(() => {
                this.attemptCatch();
            }, 500);
        }
        
        gameState.currentEnemy = null;
        this.updateEnemyDisplay();
        this.checkAchievements();
    }
    
    loseBattle() {
        gameState.stats.totalBattles++;
        gameState.stats.totalDeaths++;
        
        gameState.hp = Math.floor(gameState.maxHp * 0.1); // 保留10%生命
        
        this.addBattleLog('战斗失败...');
        this.showToast('战斗失败, 生命值恢复10%', 'error');
        
        gameState.currentEnemy = null;
        this.updateEnemyDisplay();
    }
    
    // UI更新
    updateUI() {
        // 资源
        document.getElementById('gold').textContent = this.formatNumber(gameState.gold);
        document.getElementById('gem').textContent = this.formatNumber(gameState.gem);
        document.getElementById('energy').textContent = `${gameState.energy}/${gameState.maxEnergy}`;
        
        // 等级和境界
        document.getElementById('level').textContent = gameState.level;
        document.getElementById('realm').textContent = gameState.realm;
        
        // 经验条
        const expPercent = (gameState.exp / gameState.expToNext) * 100;
        document.getElementById('exp-bar').style.width = `${expPercent}%`;
        document.getElementById('exp-text').textContent = `${this.formatNumber(gameState.exp)}/${this.formatNumber(gameState.expToNext)}`;
        
        // 属性
        document.getElementById('stat-hp').textContent = gameState.maxHp;
        document.getElementById('stat-atk').textContent = gameState.atk;
        document.getElementById('stat-def').textContent = gameState.def;
        document.getElementById('stat-spd').textContent = gameState.spd;
        document.getElementById('stat-luck').textContent = gameState.luck;
        document.getElementById('stat-comp').textContent = gameState.comprehension;
        
        // 自由属性点
        if (gameState.freePoints > 0) {
            document.getElementById('free-points').style.display = 'block';
            document.getElementById('free-points-num').textContent = gameState.freePoints;
        } else {
            document.getElementById('free-points').style.display = 'none';
        }
        
        // 自动修炼按钮状态
        const autoBtn = document.getElementById('auto-cultivate-btn');
        if (gameState.autoCultivate) {
            autoBtn.classList.add('active');
            document.getElementById('auto-status').textContent = '已开启';
            document.getElementById('cultivation-aura').classList.add('active');
        } else {
            autoBtn.classList.remove('active');
            document.getElementById('auto-status').textContent = '未开启';
            document.getElementById('cultivation-aura').classList.remove('active');
        }
        
        // 更新技能列表
        this.updateSkillsList();
        
        // 更新成就列表
        this.updateAchievementsList();
        
        // 更新宠物信息
        this.updatePetInfo();
    }
    
    // 更新宠物信息
    updatePetInfo() {
        const currentPetData = gameState.pets[gameState.currentPetId];
        if (!currentPetData) return;
        
        // 更新宠物等级显示
        const petLevelElement = document.getElementById('pet-level');
        if (petLevelElement) {
            petLevelElement.textContent = currentPetData.level;
        }
        
        // 更新宠物加成显示
        const petBonus = this.getPetStatsBonus();
        if (petBonus.hp > 0 || petBonus.atk > 0 || petBonus.def > 0 || petBonus.spd > 0) {
            const bonusInfo = document.getElementById('pet-bonus-info');
            const bonusStats = document.getElementById('pet-bonus-stats');
            
            if (bonusInfo && bonusStats) {
                const bonusTexts = [];
                if (petBonus.hp > 0) bonusTexts.push(`❤️+${petBonus.hp}`);
                if (petBonus.atk > 0) bonusTexts.push(`⚔️+${petBonus.atk}`);
                if (petBonus.def > 0) bonusTexts.push(`🛡️+${petBonus.def}`);
                if (petBonus.spd > 0) bonusTexts.push(`⚡+${petBonus.spd}`);
                
                bonusStats.textContent = bonusTexts.join(' ');
                bonusInfo.style.display = 'block';
            }
        } else {
            const bonusInfo = document.getElementById('pet-bonus-info');
            if (bonusInfo) {
                bonusInfo.style.display = 'none';
            }
        }
        
        // 更新宠物头像显示（如果有图片的话）
        this.updatePetAvatar();
    }
    
    // 更新宠物头像
    updatePetAvatar() {
        const currentForm = this.getCurrentPetForm(gameState.currentPetId);
        if (!currentForm) return;
        
        const avatarCircle = document.querySelector('.avatar-circle');
        if (!avatarCircle) return;
        
        // 检查是否已有图片元素，没有则创建
        let avatarImg = avatarCircle.querySelector('img');
        if (!avatarImg) {
            // 移除emoji元素
            const avatarEmoji = avatarCircle.querySelector('.avatar-emoji');
            if (avatarEmoji) {
                avatarEmoji.style.display = 'none';
            }
            
            // 创建图片元素
            avatarImg = document.createElement('img');
            avatarImg.className = 'pet-avatar-img';
            avatarImg.alt = '宠物头像';
            avatarCircle.appendChild(avatarImg);
        }
        
        // 设置图片源
        avatarImg.src = currentForm.image;
        
        // 添加加载错误处理
        avatarImg.onerror = () => {
            console.warn(`宠物图片加载失败: ${currentForm.image}`);
            // 回退到emoji
            avatarImg.style.display = 'none';
            const avatarEmoji = avatarCircle.querySelector('.avatar-emoji');
            if (avatarEmoji) {
                avatarEmoji.style.display = 'block';
                const pet = PETS.find(p => p.id === gameState.currentPetId);
                if (pet) {
                    if (pet.id === 'cat') avatarEmoji.textContent = '🐱';
                    else if (pet.id === 'fire_dragon') avatarEmoji.textContent = '🐉';
                    else if (pet.id === 'mushroom') avatarEmoji.textContent = '🍄';
                    else if (pet.id === 'water_spirit') avatarEmoji.textContent = '💧';
                }
            }
        };
    }
    
    updateEnemyDisplay() {
        if (!gameState.currentEnemy) {
            // 显示随机敌人
            const enemy = ENEMIES[Math.floor(Math.random() * Math.min(gameState.level, ENEMIES.length))];
            document.getElementById('enemy-emoji').textContent = enemy.emoji;
            document.getElementById('enemy-name').textContent = enemy.name;
            document.getElementById('enemy-hp').style.width = '100%';
            document.getElementById('enemy-hp-text').textContent = `${enemy.hp}/${enemy.hp}`;
        } else {
            const hpPercent = (gameState.currentEnemy.hp / gameState.currentEnemy.maxHp) * 100;
            document.getElementById('enemy-emoji').textContent = gameState.currentEnemy.emoji;
            document.getElementById('enemy-name').textContent = gameState.currentEnemy.name;
            document.getElementById('enemy-hp').style.width = `${hpPercent}%`;
            document.getElementById('enemy-hp-text').textContent = `${Math.max(0, gameState.currentEnemy.hp)}/${gameState.currentEnemy.maxHp}`;
        }
    }
    
    updateSkillsList() {
        const container = document.getElementById('skills-list');
        container.innerHTML = '';
        
        SKILLS.forEach(skill => {
            const level = gameState.skills[skill.id] || 0;
            const item = document.createElement('div');
            item.className = 'skill-item';
            item.onclick = () => this.upgradeSkill(skill.id);
            
            item.innerHTML = `
                <div class="skill-icon">${skill.icon}</div>
                <div class="skill-info">
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-desc">${skill.desc}</div>
                </div>
                <div class="skill-level">Lv.${level}/${skill.maxLevel}</div>
            `;
            
            container.appendChild(item);
        });
    }
    
    updateAchievementsList() {
        const container = document.getElementById('achievements-list');
        container.innerHTML = '';
        
        ACHIEVEMENTS.forEach(achievement => {
            const unlocked = gameState.achievements.includes(achievement.id);
            const item = document.createElement('div');
            item.className = `achievement-item ${unlocked ? 'unlocked' : ''}`;
            
            item.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.desc}</div>
                </div>
            `;
            
            container.appendChild(item);
        });
    }
    
    // 技能升级
    upgradeSkill(skillId) {
        const skill = SKILLS.find(s => s.id === skillId);
        const currentLevel = gameState.skills[skillId] || 0;
        
        if (currentLevel >= skill.maxLevel) {
            this.showToast('技能已满级', 'warning');
            return;
        }
        
        const cost = skill.cost(currentLevel + 1);
        if (gameState.gold < cost) {
            this.showToast('金币不足!', 'warning');
            return;
        }
        
        gameState.gold -= cost;
        gameState.skills[skillId] = currentLevel + 1;
        
        // 应用技能效果
        if (skill.type === 'passive') {
            if (skillId === 'strength') {
                gameState.atk += skill.effect(1);
            } else if (skillId === 'shield') {
                gameState.def += skill.effect(1);
            }
        }
        
        this.showToast(`${skill.name} 升级到 Lv.${currentLevel + 1}`, 'success');
        this.updateUI();
        this.checkAchievements();
    }
    
    // 检查成就
    checkAchievements() {
        ACHIEVEMENTS.forEach(achievement => {
            if (!gameState.achievements.includes(achievement.id) && achievement.condition(gameState)) {
                gameState.achievements.push(achievement.id);
                
                // 发放奖励
                if (achievement.reward.gold) {
                    this.gainGold(achievement.reward.gold);
                }
                if (achievement.reward.gem) {
                    gameState.gem += achievement.reward.gem;
                }
                
                this.showToast(`成就解锁: ${achievement.name}`, 'success');
            }
        });
    }
    
    // 商店
    buyItem(itemId) {
        const shopItem = SHOP_ITEMS.find(i => i.id === itemId);
        if (!shopItem) return;
        
        const item = ITEMS.find(i => i.id === itemId);
        
        // 检查货币
        if (shopItem.currency === 'gold' && gameState.gold < shopItem.price) {
            this.showToast('金币不足!', 'warning');
            return;
        }
        if (shopItem.currency === 'gem' && gameState.gem < shopItem.price) {
            this.showToast('宝石不足!', 'warning');
            return;
        }
        
        // 扣除货币
        if (shopItem.currency === 'gold') {
            gameState.gold -= shopItem.price;
        } else {
            gameState.gem -= shopItem.price;
        }
        
        // 添加到背包
        if (!gameState.inventory[itemId]) {
            gameState.inventory[itemId] = 0;
        }
        gameState.inventory[itemId]++;
        
        this.showToast(`购买成功: ${item.name}`, 'success');
        this.updateUI();
    }
    
    // 使用物品
    useItem(itemId) {
        if (!gameState.inventory[itemId] || gameState.inventory[itemId] <= 0) {
            this.showToast('物品不足', 'warning');
            return;
        }
        
        const item = ITEMS.find(i => i.id === itemId);
        if (!item) return;
        
        // 精灵球类物品 - 直接使用进行捕捉
        if (item.id.startsWith('ball_')) {
            this.attemptCatchWithBall(itemId);
            return;
        }
        
        // 应用效果
        if (item.effect === 'heal_50') {
            gameState.hp = Math.min(gameState.maxHp, gameState.hp + 50);
            this.showToast('生命值恢复50点', 'success');
        } else if (item.effect === 'energy_50') {
            gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + 50);
            this.showToast('能量恢复50点', 'success');
        } else if (item.effect === 'exp_100') {
            this.gainExp(100);
            this.showToast('获得100点经验', 'success');
        } else if (item.effect === 'gem_10') {
            gameState.gem += 10;
            this.showToast('获得10颗宝石', 'success');
        }
        
        gameState.inventory[itemId]--;
        if (gameState.inventory[itemId] <= 0) {
            delete gameState.inventory[itemId];
        }
        
        this.updateUI();
    }
    
    // ==================== 宠物捕捉系统 ====================
    
    // 显示精灵球选择界面
    showCatchBallSelection() {
        const modal = document.getElementById('modal-overlay');
        const body = document.getElementById('modal-body');
        
        // 获取背包中的精灵球
        const balls = [
            { id: 'ball_normal', name: '精灵球', icon: '⚪', bonus: 0.2 },
            { id: 'ball_great', name: '高级球', icon: '🔵', bonus: 0.4 },
            { id: 'ball_ultra', name: '大师球', icon: '🟡', bonus: 0.7 }
        ];
        
        let hasAnyBall = false;
        const ballsInInventory = balls.filter(ball => gameState.inventory[ball.id] > 0);
        
        if (ballsInInventory.length === 0) {
            body.innerHTML = `
                <h2>🎣 选择精灵球</h2>
                <div style="text-align:center;padding:30px 0;color:var(--text-secondary);">
                    <div style="font-size:3em;margin-bottom:15px;">🎒</div>
                    <div>背包中没有精灵球!</div>
                    <div style="font-size:0.9em;margin-top:10px;">请先到商店购买精灵球</div>
                </div>
                <button class="btn" onclick="game.switchTab('shop');" style="width:100%;margin-top:15px;">
                    🛒 前往商店
                </button>
            `;
            modal.style.display = 'flex';
            return;
        }
        
        body.innerHTML = `
            <h2>🎣 选择精灵球</h2>
            <div style="color:var(--text-secondary);margin-bottom:15px;font-size:0.9em;">
                选择一个精灵球来捕捉宠物，越高级的球成功率越高
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;">
                ${ballsInInventory.map(ball => {
                    const count = gameState.inventory[ball.id];
                    const catchRate = Math.round((gameState.catchChance + ball.bonus + gameState.luck * 0.01) * 100);
                    return `
                        <div class="catch-ball-option" onclick="game.attemptCatchWithBall('${ball.id}')" style="
                            display:flex;align-items:center;gap:15px;
                            padding:15px;background:var(--bg-secondary);
                            border-radius:10px;cursor:pointer;
                            transition:all 0.3s ease;border:2px solid transparent;
                        " onmouseover="this.style.borderColor='var(--accent)';this.style.transform='translateY(-2px)';" 
                           onmouseout="this.style.borderColor='transparent';this.style.transform='translateY(0)';">
                            <div style="font-size:2em;">${ball.icon}</div>
                            <div style="flex:1;">
                                <div style="font-weight:bold;font-size:1.1em;">${ball.name}</div>
                                <div style="font-size:0.85em;color:var(--text-secondary);">
                                    捕捉成功率: ${catchRate}%
                                </div>
                            </div>
                            <div style="
                                background:var(--accent);color:white;
                                padding:5px 12px;border-radius:20px;
                                font-weight:bold;font-size:0.9em;
                            ">
                                拥有 x${count}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div style="margin-top:15px;text-align:center;color:var(--text-secondary);font-size:0.85em;">
                基础捕捉概率: ${Math.round(gameState.catchChance * 100)}% | 魅力加成: +${Math.round(gameState.luck * 1)}%
            </div>
        `;
        
        modal.style.display = 'flex';
    }
    
    // 使用指定精灵球尝试捕捉
    attemptCatchWithBall(ballId) {
        // 检查是否有该球
        if (!gameState.inventory[ballId] || gameState.inventory[ballId] <= 0) {
            this.showToast('该精灵球数量不足!', 'warning');
            return;
        }
        
        // 获取球的加成
        const ballItem = ITEMS.find(item => item.id === ballId);
        const catchBonus = ballItem ? (ballItem.catchBonus || 0) : 0;
        
        // 计算捕捉概率：基础概率 + 球加成 + 魅力加成
        const catchRate = gameState.catchChance + catchBonus + (gameState.luck * 0.01);
        
        gameState.catchAttempts++;
        
        // 消耗精灵球
        gameState.inventory[ballId]--;
        if (gameState.inventory[ballId] <= 0) {
            delete gameState.inventory[ballId];
        }
        
        // 关闭模态框
        document.getElementById('modal-overlay').style.display = 'none';
        
        // 显示捕捉动画
        this.showCatchAnimation(catchRate);
    }
    
    // 显示捕捉动画
    showCatchAnimation(catchRate) {
        const modal = document.getElementById('modal-overlay');
        const body = document.getElementById('modal-body');
        
        body.innerHTML = `
            <div style="text-align:center;padding:40px 20px;">
                <div id="catch-animation-icon" style="font-size:5em;margin-bottom:20px;">
                    ⚪
                </div>
                <div id="catch-status-text" style="font-size:1.2em;font-weight:bold;margin-bottom:15px;">
                    投掷精灵球中...
                </div>
                <div style="width:80%;height:20px;background:var(--bg-secondary);border-radius:10px;margin:0 auto;overflow:hidden;">
                    <div id="catch-progress-bar" style="width:0%;height:100%;background:linear-gradient(90deg,var(--accent),var(--success));transition:width 0.3s ease;"></div>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
        
        // 动画序列
        setTimeout(() => {
            document.getElementById('catch-progress-bar').style.width = '30%';
            document.getElementById('catch-status-text').textContent = '精灵球命中!';
        }, 500);
        
        setTimeout(() => {
            document.getElementById('catch-progress-bar').style.width = '60%';
            document.getElementById('catch-status-text').textContent = '正在捕捉...';
            document.getElementById('catch-animation-icon').textContent = '🔄';
        }, 1000);
        
        setTimeout(() => {
            document.getElementById('catch-progress-bar').style.width = '90%';
            document.getElementById('catch-status-text').textContent = '努力中...';
        }, 1500);
        
        setTimeout(() => {
            // 判断成功与否
            if (Math.random() < catchRate) {
                // 成功
                document.getElementById('catch-progress-bar').style.width = '100%';
                document.getElementById('catch-progress-bar').style.background = 'var(--success)';
                document.getElementById('catch-status-text').textContent = '捕捉成功!';
                document.getElementById('catch-animation-icon').textContent = '✅';
                document.getElementById('catch-animation-icon').style.fontSize = '4em';
                
                setTimeout(() => {
                    modal.style.display = 'none';
                    this.catchSuccess();
                }, 1000);
            } else {
                // 失败
                document.getElementById('catch-progress-bar').style.width = '100%';
                document.getElementById('catch-progress-bar').style.background = 'var(--danger)';
                document.getElementById('catch-status-text').textContent = '捕捉失败，宠物逃跑了!';
                document.getElementById('catch-animation-icon').textContent = '💨';
                
                setTimeout(() => {
                    modal.style.display = 'none';
                    this.showToast('捕捉失败，宠物逃跑了!', 'warning');
                    this.updateUI();
                }, 1000);
            }
        }, 2000);
    }
    
    // 尝试捕捉宠物（旧版本，保留用于自动捕捉）
    attemptCatch() {
        // 如果有精灵球，使用最好的球
        const balls = ['ball_ultra', 'ball_great', 'ball_normal'];
        let ballToUse = null;
        
        for (let ballId of balls) {
            if (gameState.inventory[ballId] && gameState.inventory[ballId] > 0) {
                ballToUse = ballId;
                break;
            }
        }
        
        if (ballToUse) {
            this.attemptCatchWithBall(ballToUse);
        } else {
            this.showToast('没有精灵球! 请先购买', 'warning');
        }
    }
    
    // 捕捉成功
    catchSuccess() {
        // 随机选择一个未解锁的宠物
        const availablePets = PETS.filter(pet => !pet.unlocked && !gameState.pets[pet.id]);
        if (availablePets.length === 0) {
            this.showToast('所有宠物都已解锁!', 'success');
            return;
        }
        
        const randomPet = availablePets[Math.floor(Math.random() * availablePets.length)];
        
        // 添加到宠物背包
        if (!gameState.pets[randomPet.id]) {
            gameState.pets[randomPet.id] = { level: 1, exp: 0, favorite: false };
        }
        
        // 标记为已解锁
        const petIndex = PETS.findIndex(p => p.id === randomPet.id);
        if (petIndex !== -1) {
            PETS[petIndex].unlocked = true;
        }
        
        this.showToast(`成功捕捉到 ${randomPet.name}!`, 'success');
        
        // 显示宠物详情
        setTimeout(() => {
            this.showPetDetailModal(randomPet.id);
        }, 500);
    }
    
    // 切换当前宠物
    switchPet(petId) {
        if (!gameState.pets[petId]) {
            this.showToast('尚未解锁该宠物', 'warning');
            return;
        }
        
        gameState.currentPetId = petId;
        this.showToast(`切换到 ${PETS.find(p => p.id === petId).name}`, 'success');
        this.updatePetDisplay();
        this.updateUI();
    }
    
    // 设置宠物为最爱
    toggleFavorite(petId) {
        if (!gameState.pets[petId]) return;
        
        gameState.pets[petId].favorite = !gameState.pets[petId].favorite;
        this.showToast(gameState.pets[petId].favorite ? '设为最爱' : '取消最爱', 'success');
        this.updateUI();
    }
    
    // 更新宠物显示
    updatePetDisplay() {
        const pet = PETS.find(p => p.id === gameState.currentPetId);
        if (!pet) return;
        
        const petData = gameState.pets[gameState.currentPetId];
        const currentForm = this.getCurrentPetForm(pet.id);
        
        // 更新头像区域（后续会改成图片显示）
        const avatarEmoji = document.querySelector('.avatar-emoji');
        const characterName = document.getElementById('character-name');
        
        // 暂时用名字和emoji表示，后面会用图片替换
        characterName.textContent = pet.name;
        
        // 更新宠物等级显示
        const levelDisplay = document.querySelector('.level-display');
        if (levelDisplay) {
            const petLevelSpan = document.getElementById('pet-level');
            if (petLevelSpan) {
                petLevelSpan.textContent = petData.level;
            }
        }
    }
    
    // 获取当前宠物形态
    getCurrentPetForm(petId) {
        const pet = PETS.find(p => p.id === petId);
        if (!pet) return null;
        
        const petData = gameState.pets[petId];
        if (!petData) return null;
        
        // 根据宠物等级找到对应的形态
        let currentForm = pet.forms[0];
        for (let i = pet.forms.length - 1; i >= 0; i--) {
            if (petData.level >= pet.forms[i].level) {
                currentForm = pet.forms[i];
                break;
            }
        }
        
        return currentForm;
    }
    
    // 事件监听
    setupEventListeners() {
        // 修炼按钮
        document.getElementById('cultivate-btn').addEventListener('click', () => {
            this.cultivate();
        });
        
        // 自动修炼按钮
        document.getElementById('auto-cultivate-btn').addEventListener('click', () => {
            gameState.autoCultivate = !gameState.autoCultivate;
            this.updateUI();
            this.showToast(gameState.autoCultivate ? '自动训练已开启' : '自动训练已关闭', 'success');
        });
        
        // 战斗按钮
        document.getElementById('battle-btn').addEventListener('click', () => {
            if (gameState.currentEnemy) {
                this.showToast('当前有战斗进行中', 'warning');
                return;
            }
            this.startBattle();
        });
        
        // 分配属性点按钮
        document.getElementById('assign-stats-btn').addEventListener('click', () => {
            this.showAssignStatsModal();
        });
        
        // 技能树按钮
        document.getElementById('skill-tree-btn').addEventListener('click', () => {
            this.showSkillTreeModal();
        });
        
        // 使用物品按钮
        document.getElementById('use-item-btn').addEventListener('click', () => {
            this.showInventoryModal();
        });
        
        // 底部导航
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // 模态框关闭
        document.getElementById('modal-close').addEventListener('click', () => {
            document.getElementById('modal-overlay').style.display = 'none';
        });
        
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modal-overlay')) {
                document.getElementById('modal-overlay').style.display = 'none';
            }
        });
    }
    
    // 切换标签
    switchTab(tab) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
            }
        });
        
        // 显示对应内容
        this.showModal(tab);
    }
    
    // 显示宠物详情模态框
    showPetDetailModal(petId) {
        const modal = document.getElementById('modal-overlay');
        const body = document.getElementById('modal-body');
        
        const pet = PETS.find(p => p.id === petId);
        if (!pet) return;
        
        const petData = gameState.pets[petId];
        const currentForm = this.getCurrentPetForm(petId);
        
        body.innerHTML = `
            <h2>🐾 ${pet.name} ${petData.favorite ? '<span class="favorite-star">★</span>' : ''}</h2>
            <div style="text-align:center;margin:20px 0;">
                <img src="${currentForm.image}" alt="${pet.name}" style="width:120px;height:120px;object-fit:contain;background:var(--bg-secondary);border-radius:20px;border:3px solid var(--accent);padding:10px;" 
                     onerror="this.onerror=null;this.style.display='none';">
                <div style="font-size:1.5em;margin-top:10px;color:var(--accent);">${currentForm ? currentForm.name : '未知形态'}</div>
                ${currentForm ? `<div style="color:var(--text-secondary);margin-top:5px;">等级 ${petData.level}</div>` : ''}
            </div>
            
            <div class="pet-stats-grid">
                <div class="pet-stat-item">
                    <span class="pet-stat-label">❤️ 体力</span>
                    <span class="pet-stat-value">+${currentForm.statsBonus.hp}</span>
                </div>
                <div class="pet-stat-item">
                    <span class="pet-stat-label">⚔️ 攻击</span>
                    <span class="pet-stat-value">+${currentForm.statsBonus.atk}</span>
                </div>
                <div class="pet-stat-item">
                    <span class="pet-stat-label">🛡️ 防御</span>
                    <span class="pet-stat-value">+${currentForm.statsBonus.def}</span>
                </div>
                <div class="pet-stat-item">
                    <span class="pet-stat-label">⚡ 敏捷</span>
                    <span class="pet-stat-value">+${currentForm.statsBonus.spd}</span>
                </div>
            </div>
            
            <div style="margin:20px 0;">
                <div style="font-weight:bold;margin-bottom:10px;">📝 描述</div>
                <div style="color:var(--text-secondary);">${pet.description}</div>
            </div>
            
            <div style="margin:20px 0;">
                <div style="font-weight:bold;margin-bottom:10px;">📈 形态进化</div>
                ${pet.forms.map(form => `
                    <div style="display:flex;align-items:center;margin:5px 0;padding:8px;background:${petData.level >= form.level ? 'var(--bg-secondary)' : 'transparent'};border-radius:5px;border-left:3px solid ${petData.level >= form.level ? 'var(--success)' : 'var(--text-secondary)'};">
                        <div class="pet-form-indicator ${petData.level >= form.level ? 'pet-form-unlocked' : 'pet-form-locked'}">
                            ${petData.level >= form.level ? '✓' : form.level}
                        </div>
                        <div style="flex:1;">${form.name}</div>
                        <div style="font-size:0.8em;color:var(--text-secondary);">Lv.${form.level}+</div>
                    </div>
                `).join('')}
            </div>
            
            <div style="display:flex;gap:10px;margin-top:20px;">
                ${gameState.currentPetId !== petId ? `
                    <button class="pet-switch-btn" onclick="game.switchPet('${petId}')" style="flex:1;">
                        🐾 切换为当前宠物
                    </button>
                ` : `
                    <div style="flex:1;text-align:center;padding:12px;background:var(--success);color:white;border-radius:8px;font-weight:bold;">
                        ✅ 当前使用中
                    </div>
                `}
                <button class="btn" onclick="game.toggleFavorite('${petId}')" style="flex:1;">
                    ${petData.favorite ? '❤️ 取消最爱' : '🤍 设为最爱'}
                </button>
            </div>
        `;
        
        modal.style.display = 'flex';
    }
    
    // 显示宠物管理界面
    showPetsContent(body) {
        body.innerHTML = '<h2>🐾 宠物管理</h2>';
        
        // 当前宠物信息和精灵球数量
        const currentPet = PETS.find(p => p.id === gameState.currentPetId);
        const currentPetData = gameState.pets[gameState.currentPetId];
        const currentForm = this.getCurrentPetForm(gameState.currentPetId);
        
        // 获取精灵球数量
        const ballNormal = gameState.inventory['ball_normal'] || 0;
        const ballGreat = gameState.inventory['ball_great'] || 0;
        const ballUltra = gameState.inventory['ball_ultra'] || 0;
        const totalBalls = ballNormal + ballGreat + ballUltra;
        
        body.innerHTML += `
            <div style="background:var(--bg-secondary);padding:15px;border-radius:10px;margin-bottom:20px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <div style="font-weight:bold;">🎯 当前宠物</div>
                    <div style="font-size:0.85em;color:var(--text-secondary);">
                        精灵球: <span style="color:var(--accent);font-weight:bold;">${totalBalls}</span>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:15px;">
                    <div style="font-size:2em;">${currentPet ? currentPet.name : '未知'}</div>
                    <div style="color:var(--accent);">Lv.${currentPetData ? currentPetData.level : 1}</div>
                </div>
                ${currentForm ? `<div style="color:var(--text-secondary);margin-top:5px;">形态: ${currentForm.name}</div>` : ''}
            </div>
            
            <!-- 精灵球数量快速查看 -->
            ${totalBalls > 0 ? `
                <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
                    ${ballNormal > 0 ? `
                        <div style="flex:1;min-width:80px;background:var(--bg-secondary);padding:8px 12px;border-radius:8px;text-align:center;font-size:0.9em;">
                            <div style="font-size:1.5em;margin-bottom:3px;">⚪</div>
                            <div>精灵球</div>
                            <div style="font-weight:bold;color:var(--accent);">x${ballNormal}</div>
                        </div>
                    ` : ''}
                    ${ballGreat > 0 ? `
                        <div style="flex:1;min-width:80px;background:var(--bg-secondary);padding:8px 12px;border-radius:8px;text-align:center;font-size:0.9em;">
                            <div style="font-size:1.5em;margin-bottom:3px;">🔵</div>
                            <div>高级球</div>
                            <div style="font-weight:bold;color:var(--accent);">x${ballGreat}</div>
                        </div>
                    ` : ''}
                    ${ballUltra > 0 ? `
                        <div style="flex:1;min-width:80px;background:var(--bg-secondary);padding:8px 12px;border-radius:8px;text-align:center;font-size:0.9em;">
                            <div style="font-size:1.5em;margin-bottom:3px;">🟡</div>
                            <div>大师球</div>
                            <div style="font-weight:bold;color:var(--gold);">x${ballUltra}</div>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
        `;
        
        // 捕捉按钮
        body.innerHTML += `
            <div style="margin-bottom:20px;">
                <button class="btn" onclick="game.showCatchBallSelection()" style="width:100%;background:linear-gradient(135deg,var(--accent),var(--warning));color:white;border:none;font-size:1.1em;padding:12px;">
                    🎣 捕捉新宠物
                </button>
                <div style="font-size:0.8em;color:var(--text-secondary);margin-top:8px;text-align:center;">
                    💰 精灵球越贵，成功率越高
                </div>
            </div>
        `;
        
        // 宠物列表
        body.innerHTML += '<div style="font-weight:bold;margin-bottom:10px;">📦 宠物图鉴</div>';
        
        const ownedPets = PETS.filter(pet => gameState.pets[pet.id]);
        const unownedPets = PETS.filter(pet => !gameState.pets[pet.id]);
        
        // 已拥有的宠物
        ownedPets.forEach(pet => {
            const petData = gameState.pets[pet.id];
            const petForm = this.getCurrentPetForm(pet.id);
            const isCurrent = pet.id === gameState.currentPetId;
            
            body.innerHTML += `
                <div class="pet-list-item ${isCurrent ? 'active' : ''}" onclick="game.showPetDetailModal('${pet.id}')">
                    <img class="pet-list-avatar" src="${petForm ? petForm.image : ''}" alt="${pet.name}" 
                         onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
                         style="width:50px;height:50px;object-fit:contain;border-radius:50%;background:var(--bg-primary);border:2px solid var(--accent);padding:3px;">
                    <div style="display:none;align-items:center;justify-content:center;width:50px;height:50px;font-size:1.5em;">${pet.name.charAt(0)}</div>
                    <div class="pet-list-info">
                        <div class="pet-list-name">
                            ${pet.name}
                            ${petData.favorite ? '<span class="favorite-star">★</span>' : ''}
                        </div>
                        <div class="pet-list-form">Lv.${petData.level} ${petForm ? `· ${petForm.name}` : ''}</div>
                    </div>
                    <div class="pet-list-actions">
                        ${!isCurrent ? 
                            `<button class="btn-small" onclick="event.stopPropagation();game.switchPet('${pet.id}')">切换</button>` : 
                            `<span class="current-pet-badge">使用中</span>`
                        }
                    </div>
                </div>
            `;
        });
        
        // 未拥有的宠物
        if (unownedPets.length > 0) {
            body.innerHTML += '<div style="font-weight:bold;margin:20px 0 10px 0;">🔒 尚未解锁</div>';
            
            unownedPets.forEach(pet => {
                body.innerHTML += `
                    <div style="
                        display:flex;align-items:center;justify-content:space-between;
                        padding:10px;margin:5px 0;background:var(--bg-tertiary);
                        border-radius:5px;opacity:0.6;
                    ">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <div style="font-size:1.2em;">${pet.name}</div>
                        </div>
                        <div style="font-size:0.8em;color:var(--text-secondary);">未解锁</div>
                    </div>
                `;
            });
        }
    }
    
    // 显示模态框
    showModal(content) {
        const modal = document.getElementById('modal-overlay');
        const body = document.getElementById('modal-body');
        
        switch (content) {
            case 'cultivation':
                this.showMainContent();
                return;
            case 'pets':
                this.showPetsContent(body);
                break;
            case 'skills':
                this.showSkillsContent(body);
                break;
            case 'inventory':
                this.showInventoryContent(body);
                break;
            case 'achievements':
                this.showAchievementsContent(body);
                break;
            case 'shop':
                this.showShopContent(body);
                break;
            case 'settings':
                this.showSettingsContent(body);
                break;
        }
        
        modal.style.display = 'flex';
    }
    
    showMainContent() {
        document.getElementById('modal-overlay').style.display = 'none';
    }
    
    showSkillsContent(body) {
        body.innerHTML = '<h2>🌟 学习技能</h2>';
        
        SKILLS.forEach(skill => {
            const level = gameState.skills[skill.id] || 0;
            const cost = skill.cost(level + 1);
            const canUpgrade = level < skill.maxLevel && gameState.gold >= cost;
            
            const skillDiv = document.createElement('div');
            skillDiv.className = 'skill-item';
            skillDiv.style.marginBottom = '10px';
            skillDiv.onclick = () => this.upgradeSkill(skill.id);
            
            skillDiv.innerHTML = `
                <div class="skill-icon">${skill.icon}</div>
                <div class="skill-info">
                    <div class="skill-name">${skill.name} (Lv.${level}/${skill.maxLevel})</div>
                    <div class="skill-desc">${skill.desc}</div>
                    <div style="font-size:0.8em;color:var(--gold);">升级费用: ${this.formatNumber(cost)} 金币</div>
                </div>
                <button class="btn-small" style="${canUpgrade ? '' : 'opacity:0.5;'}" ${canUpgrade ? '' : 'disabled'}>
                    ${level >= skill.maxLevel ? '已满级' : '升级'}
                </button>
            `;
            
            body.appendChild(skillDiv);
        });
    }
    
    showInventoryContent(body) {
        body.innerHTML = '<h2>🎒 背包</h2>';
        
        const items = Object.entries(gameState.inventory);
        if (items.length === 0) {
            body.innerHTML += '<p style="color:var(--text-secondary);">背包为空</p>';
            return;
        }
        
        items.forEach(([itemId, quantity]) => {
            const item = ITEMS.find(i => i.id === itemId);
            if (!item) return;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-item';
            itemDiv.onclick = () => this.useItem(itemId);
            
            itemDiv.innerHTML = `
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-quantity">x${quantity}</div>
            `;
            
            body.appendChild(itemDiv);
        });
    }
    
    showAchievementsContent(body) {
        body.innerHTML = '<h2>🏆 成就</h2>';
        
        ACHIEVEMENTS.forEach(achievement => {
            const unlocked = gameState.achievements.includes(achievement.id);
            
            const achDiv = document.createElement('div');
            achDiv.className = `achievement-item ${unlocked ? 'unlocked' : ''}`;
            achDiv.style.marginBottom = '10px';
            
            achDiv.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.desc}</div>
                    ${unlocked ? '<div style="font-size:0.8em;color:var(--gold);">已解锁</div>' : ''}
                </div>
            `;
            
            body.appendChild(achDiv);
        });
    }
    
    showShopContent(body) {
        body.innerHTML = '<h2>🛒 商店</h2>';
        
        // 分离精灵球和其他物品
        const ballItems = SHOP_ITEMS.filter(item => item.id.startsWith('ball_'));
        const otherItems = SHOP_ITEMS.filter(item => !item.id.startsWith('ball_'));
        
        // 先显示精灵球
        if (ballItems.length > 0) {
            body.innerHTML += '<div style="font-weight:bold;margin:15px 0 10px 0;color:var(--accent);">🎣 精灵球系列</div>';
            
            ballItems.forEach(item => {
                const itemData = ITEMS.find(i => i.id === item.id);
                const canBuy = item.currency === 'gold' ? gameState.gold >= item.price : gameState.gem >= item.price;
                const catchBonus = itemData.catchBonus || 0;
                const totalRate = Math.round((gameState.catchChance + catchBonus + gameState.luck * 0.01) * 100);
                
                const itemDiv = document.createElement('div');
                itemDiv.className = 'shop-ball-item';
                itemDiv.onclick = () => this.buyItem(item.id);
                itemDiv.style.opacity = canBuy ? '1' : '0.6';
                
                itemDiv.innerHTML = `
                    <div class="shop-ball-icon">${itemData.icon}</div>
                    <div class="shop-ball-info">
                        <div class="shop-ball-name">${itemData.name}</div>
                        <div class="shop-ball-desc">${itemData.desc} | 成功率: +${catchBonus * 100}%</div>
                        <div style="font-size:0.85em;color:var(--success);margin-top:3px;">实际捕捉率: ~${totalRate}%</div>
                    </div>
                    <div class="shop-ball-price">
                        ${item.currency === 'gold' ? '💰' : '💎'} ${this.formatNumber(item.price)}
                    </div>
                `;
                
                body.appendChild(itemDiv);
            });
        }
        
        // 显示其他物品
        if (otherItems.length > 0) {
            body.innerHTML += '<div style="font-weight:bold;margin:20px 0 10px 0;color:var(--text-secondary);">📦 其他物品</div>';
            
            otherItems.forEach(item => {
                const itemData = ITEMS.find(i => i.id === item.id);
                const canBuy = item.currency === 'gold' ? gameState.gold >= item.price : gameState.gem >= item.price;
                
                const itemDiv = document.createElement('div');
                itemDiv.className = 'shop-item';
                itemDiv.onclick = () => this.buyItem(item.id);
                itemDiv.style.opacity = canBuy ? '1' : '0.6';
                
                itemDiv.innerHTML = `
                    <div class="shop-item-icon">${itemData.icon}</div>
                    <div class="shop-item-name">${itemData.name}</div>
                    <div class="shop-item-price">${item.currency === 'gold' ? '💰' : '💎'} ${this.formatNumber(item.price)}</div>
                `;
                
                body.appendChild(itemDiv);
            });
        }
    }
    
    showSettingsContent(body) {
        body.innerHTML = '<h2>⚙️ 设置</h2>';
        
        const settings = [
            { id: 'sound', name: '音效', desc: '开启游戏音效' },
            { id: 'autoSave', name: '自动保存', desc: '每30秒自动保存游戏' },
            { id: 'animations', name: '动画效果', desc: '开启UI动画效果' },
        ];
        
        // 添加自动捕捉设置
        settings.push(
            { id: 'autoCatch', name: '自动捕捉', desc: '战斗中自动尝试捕捉宠物' }
        );
        
        settings.forEach(setting => {
            const div = document.createElement('div');
            div.className = 'setting-item';
            
            div.innerHTML = `
                <div>
                    <div class="setting-label">${setting.name}</div>
                    <div style="font-size:0.85em;color:var(--text-secondary);">${setting.desc}</div>
                </div>
                <label class="switch">
                    <input type="checkbox" ${gameState.settings[setting.id] ? 'checked' : ''} onchange="game.toggleSetting('${setting.id}')">
                    <span class="slider"></span>
                </label>
            `;
            
            body.appendChild(div);
        });
        
        // 保存/加载按钮
        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-small';
        saveBtn.style.marginTop = '20px';
        saveBtn.textContent = '💾 手动保存';
        saveBtn.onclick = () => this.saveGame();
        body.appendChild(saveBtn);
        
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn btn-small';
        resetBtn.style.marginTop = '10px';
        resetBtn.style.borderColor = 'var(--danger)';
        resetBtn.style.color = 'var(--danger)';
        resetBtn.textContent = '🗑️ 重置游戏';
        resetBtn.onclick = () => {
            if (confirm('确定要重置游戏吗? 此操作不可撤销!')) {
                localStorage.removeItem(CONFIG.SAVE_KEY);
                location.reload();
            }
        };
        body.appendChild(resetBtn);
    }
    
    toggleSetting(settingId) {
        gameState.settings[settingId] = !gameState.settings[settingId];
        this.showToast(`${settingId} ${gameState.settings[settingId] ? '已开启' : '已关闭'}`, 'success');
    }
    
    showAssignStatsModal() {
        const modal = document.getElementById('modal-overlay');
        const body = document.getElementById('modal-body');
        
        body.innerHTML = '<h2>📊 训练加点</h2>';
        body.innerHTML += `<p>训练点数: <strong style="color:var(--accent);">${gameState.freePoints}</strong></p>`;
        
        const stats = [
            { id: 'hp', name: '❤️ 体力', desc: '每点+20体力', cost: 1 },
            { id: 'atk', name: '⚔️ 攻击', desc: '每点+2攻击', cost: 1 },
            { id: 'def', name: '🛡️ 防御', desc: '每点+1防御', cost: 1 },
            { id: 'spd', name: '⚡ 敏捷', desc: '每点+1敏捷', cost: 1 },
            { id: 'luck', name: '🍀 魅力', desc: '每点+1魅力', cost: 2 },
            { id: 'comp', name: '✨ 智力', desc: '每点+1智力', cost: 2 },
        ];
        
        stats.forEach(stat => {
            const div = document.createElement('div');
            div.className = 'setting-item';
            div.onclick = () => this.assignStat(stat.id, stat.cost);
            
            div.innerHTML = `
                <div>
                    <div class="setting-label">${stat.name}</div>
                    <div style="font-size:0.85em;color:var(--text-secondary);">${stat.desc}</div>
                </div>
                <button class="btn-small" ${gameState.freePoints >= stat.cost ? '' : 'disabled'}>
                    升级 (${stat.cost}点)
                </button>
            `;
            
            body.appendChild(div);
        });
        
        modal.style.display = 'flex';
    }
    
    assignStat(statId, cost) {
        if (gameState.freePoints < cost) {
            this.showToast('属性点不足!', 'warning');
            return;
        }
        
        gameState.freePoints -= cost;
        
        switch (statId) {
            case 'hp':
                gameState.maxHp += 20;
                gameState.hp += 20;
                break;
            case 'atk':
                gameState.atk += 2;
                break;
            case 'def':
                gameState.def += 1;
                break;
            case 'spd':
                gameState.spd += 1;
                break;
            case 'luck':
                gameState.luck += 1;
                break;
            case 'comp':
                gameState.comprehension += 1;
                break;
        }
        
        this.showToast(`属性提升!`, 'success');
        this.updateUI();
        
        // 刷新模态框
        this.showAssignStatsModal();
    }
    
    // 游戏循环
    startGameLoop() {
        // 自动修炼
        setInterval(() => {
            if (gameState.autoCultivate && gameState.energy > 0) {
                this.cultivate();
            }
        }, CONFIG.AUTO_CULTIVATE_INTERVAL);
        
        // 能量恢复
        setInterval(() => {
            if (gameState.energy < gameState.maxEnergy) {
                gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + 1);
                this.updateUI();
            }
        }, CONFIG.ENERGY_REGEN_RATE * 1000);
        
        // 自动保存
        setInterval(() => {
            if (gameState.settings.autoSave) {
                this.saveGame();
            }
        }, CONFIG.SAVE_INTERVAL);
        
        // 更新最后在线时间
        setInterval(() => {
            gameState.stats.lastOnlineTime = Date.now();
        }, 10000);
    }
    
    // UI设置
    setupUI() {
        this.updateUI();
        this.updateEnemyDisplay();
    }
    
    // 工具函数
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    formatTime(seconds) {
        if (seconds < 60) return `${Math.floor(seconds)}秒`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}小时${minutes}分钟`;
    }
    
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    showFloatingText(text, color) {
        if (!gameState.settings.animations) return;
        
        const float = document.createElement('div');
        float.className = 'floating-text';
        float.textContent = text;
        float.style.color = color;
        float.style.left = '50%';
        float.style.top = '50%';
        
        document.getElementById('character-section').appendChild(float);
        
        setTimeout(() => {
            float.remove();
        }, 1000);
    }
    
    showLevelUpAnimation() {
        if (!gameState.settings.animations) return;
        
        const avatar = document.querySelector('.avatar-circle');
        avatar.classList.add('level-up');
        
        setTimeout(() => {
            avatar.classList.remove('level-up');
        }, 500);
    }
    
    addBattleLog(message) {
        const log = document.getElementById('battle-log');
        const msg = document.createElement('div');
        msg.className = 'battle-message';
        msg.textContent = message;
        
        log.appendChild(msg);
        log.scrollTop = log.scrollHeight;
        
        // 限制日志数量
        while (log.children.length > 10) {
            log.removeChild(log.firstChild);
        }
    }
}

// ==================== 启动游戏 ====================
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
});

// 导出到全局
window.game = game;
