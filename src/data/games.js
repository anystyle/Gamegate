// 轻量级解压小游戏数据库
// 专为碎片时间设计，支持即开即玩
const games = [
  // 2-5分钟快速游戏 - 适合通勤、摸鱼
  {
    id: 101,
    title: "2048数字方块",
    category: "益智",
    tags: ["数字", "策略", "经典"],
    playTime: 3, // 预计游戏时间（分钟）
    difficulty: "简单",
    description: "数字合成游戏，锻炼逻辑思维",
    features: ["触屏友好", "自动保存", "无广告"],
    thumbnail: "/games/2048/thumb.jpg",
    url: "/games/2048/index.html",
    popularity: 9.2,
    rating: 4.5,
    size: "256KB", // 轻量级设计
    loadTime: "1.2秒",
    bestFor: ["通勤", "午休", "摸鱼"],
    releasedAt: "2024-01-15"
  },
  {
    id: 102,
    title: "彩球消除",
    category: "消除",
    tags: ["休闲", "视觉", "放松"],
    playTime: 5,
    difficulty: "简单",
    description: "点击消除相同颜色的彩球",
    features: ["炫彩动画", "连锁反应", "音效可选"],
    thumbnail: "/games/bubble-crush/thumb.jpg",
    url: "/games/bubble-crush/index.html",
    popularity: 8.8,
    rating: 4.3,
    size: "180KB",
    loadTime: "0.8秒",
    bestFor: ["减压", "放松", "睡前"],
    releasedAt: "2024-01-10"
  },
  {
    id: 103,
    title: "极速打字",
    category: "打字",
    tags: ["速度", "挑战", "技能"],
    playTime: 2,
    difficulty: "中等",
    description: "测试你的打字速度和准确度",
    features: ["实时统计", "难度递增", "词汇丰富"],
    thumbnail: "/games/typing-speed/thumb.jpg",
    url: "/games/typing-speed/index.html",
    popularity: 7.5,
    rating: 4.2,
    size: "95KB",
    loadTime: "0.5秒",
    bestFor: ["技能提升", "碎片时间", "专注训练"],
    releasedAt: "2024-01-08"
  },

  // 5-10分钟策略游戏 - 适合午休
  {
    id: 201,
    title: "迷你扫雷",
    category: "策略",
    tags: ["经典", "逻辑", "推理"],
    playTime: 6,
    difficulty: "中等",
    description: "经典扫雷游戏的简化版",
    features: ["多难度选择", "计时模式", "标记系统"],
    thumbnail: "/games/minesweeper/thumb.jpg",
    url: "/games/minesweeper/index.html",
    popularity: 8.9,
    rating: 4.6,
    size: "120KB",
    loadTime: "0.7秒",
    bestFor: ["逻辑训练", "午休", "集中注意力"],
    releasedAt: "2024-01-05"
  },
  {
    id: 202,
    title: "记忆翻牌",
    category: "记忆",
    tags: ["记忆", "配对", "脑力"],
    playTime: 4,
    difficulty: "简单",
    description: "翻开相同的卡片进行配对",
    features: ["多种主题", "难度可选", "最佳成绩"],
    thumbnail: "/games/memory-game/thumb.jpg",
    url: "/games/memory-game/index.html",
    popularity: 8.2,
    rating: 4.4,
    size: "200KB",
    loadTime: "1.0秒",
    bestFor: ["记忆力训练", "轻松娱乐", "全年龄段"],
    releasedAt: "2024-01-03"
  },

  // 放松治愈游戏 - 适合减压
  {
    id: 301,
    title: "数字填色",
    category: "填色",
    tags: ["创意", "治愈", "放松"],
    playTime: 8,
    difficulty: "简单",
    description: "按数字填充颜色，创作美丽图案",
    features: ["海量图案", "色彩丰富", "作品保存"],
    thumbnail: "/games/color-by-number/thumb.jpg",
    url: "/games/color-by-number/index.html",
    popularity: 9.5,
    rating: 4.8,
    size: "350KB",
    loadTime: "1.5秒",
    bestFor: ["减压", "治愈", "创意表达", "睡前放松"],
    releasedAt: "2024-01-12"
  },
  {
    id: 302,
    title: "模拟钓鱼",
    category: "模拟",
    tags: ["休闲", "治愈", "收集"],
    playTime: 10,
    difficulty: "简单",
    description: "轻松的钓鱼体验，收集各种鱼类",
    features: ["多种鱼类", "不同钓点", "成就系统"],
    thumbnail: "/games/fishing-sim/thumb.jpg",
    url: "/games/fishing-sim/index.html",
    popularity: 8.0,
    rating: 4.3,
    size: "420KB",
    loadTime: "2.0秒",
    bestFor: ["放松心情", "收集爱好", "漫长等待"],
    releasedAt: "2024-01-07"
  },

  // 反应力游戏 - 短时间高强度
  {
    id: 401,
    title: "打地鼠",
    category: "反应",
    tags: ["速度", "反应", "挑战"],
    playTime: 3,
    difficulty: "简单",
    description: "快速点击出现的地鼠",
    features: ["速度递增", "最高分记录", "音效反馈"],
    thumbnail: "/games/whack-a-mole/thumb.jpg",
    url: "/games/whack-a-mole/index.html",
    popularity: 8.6,
    rating: 4.4,
    size: "150KB",
    loadTime: "0.6秒",
    bestFor: ["反应训练", "短暂发泄", "提神醒脑"],
    releasedAt: "2024-01-09"
  },
  {
    id: 402,
    title: "泡泡龙",
    category: "射击",
    tags: ["瞄准", "策略", "经典"],
    playTime: 5,
    difficulty: "中等",
    description: "发射泡泡消除相同颜色的泡泡群",
    features: ["物理引擎", "关卡模式", "连击奖励"],
    thumbnail: "/games/bubble-shooter/thumb.jpg",
    url: "/games/bubble-shooter/index.html",
    popularity: 9.0,
    rating: 4.5,
    size: "280KB",
    loadTime: "1.3秒",
    bestFor: ["策略思考", "视觉满足", "成就收集"],
    releasedAt: "2024-01-11"
  }
];

// 根据不同场景推荐游戏
function getGamesByScenario(scenario = 'all') {
  const scenarios = {
    '通勤': [101, 103, 401], // 2-5分钟快速游戏
    '午休': [201, 202, 402], // 5-10分钟策略游戏
    '摸鱼': [101, 102, 202], // 可随时暂停的游戏
    '减压': [102, 301, 302], // 放松治愈类游戏
    '睡前': [301, 302], // 轻松不刺激的游戏
    '提神': [103, 401, 402] // 需要专注和反应的游戏
  };

  if (scenario === 'all') return games;

  const recommendedIds = scenarios[scenario] || [];
  return games.filter(game => recommendedIds.includes(game.id));
}

// 根据游戏时间筛选
function getGamesByTime(maxMinutes = 10) {
  return games.filter(game => game.playTime <= maxMinutes);
}

// 获取热门游戏
function getPopularGames(limit = 6) {
  return [...games]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

// 搜索游戏
function searchGames(query) {
  const lowercaseQuery = query.toLowerCase();
  return games.filter(game =>
    game.title.toLowerCase().includes(lowercaseQuery) ||
    game.description.toLowerCase().includes(lowercaseQuery) ||
    game.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

module.exports = {
  games,
  getGamesByScenario,
  getGamesByTime,
  getPopularGames,
  searchGames
};