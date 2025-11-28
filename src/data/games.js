// 中文游戏数据库
const games = [
  {
    id: 101,
    title: "2048",
    description: "滑动数字方块，合并相同数字，达到2048方块的益智游戏。",
    category: "益智",
    playTime: 5,
    difficulty: "简单",
    rating: 4.5,
    popularity: 95,
    thumbnail: "/dist/games/2048/thumbnail.jpg",
    url: "/games/2048/index.html",
    tags: ["益智", "数字", "策略", "大脑"],
    releasedAt: "2024-01-15",
    features: ["保存进度", "高分榜", "流畅动画", "移动友好"],
    scenarios: ["通勤", "午餐", "办公室", "减压", "睡前", "专注"],
    languages: ["zh", "en"],
    fileSize: "45KB",
    developer: "GameGate 团队",
    version: "1.0.0"
  },
  {
    id: 102,
    title: "颜色匹配",
    description: "快速颜色匹配游戏，测试你的反应速度和模式识别能力。",
    category: "反应",
    playTime: 3,
    difficulty: "中等",
    rating: 4.2,
    popularity: 88,
    thumbnail: "/dist/games/color-match/thumbnail.jpg",
    url: "/games/color-match/index.html",
    tags: ["反应", "颜色", "速度", "反射"],
    releasedAt: "2024-01-20",
    features: ["时间挑战", "递增难度", "颜色主题"],
    scenarios: ["专注", "减压", "快速"],
    languages: ["zh", "en"],
    fileSize: "28KB",
    developer: "GameGate 团队",
    version: "1.0.0"
  },
  {
    id: 103,
    title: "记忆卡片",
    description: "经典记忆配对游戏，具有多种主题和难度等级。",
    category: "记忆",
    playTime: 4,
    difficulty: "简单",
    rating: 4.3,
    popularity: 85,
    thumbnail: "/dist/games/memory-cards/thumbnail.jpg",
    url: "/games/memory-cards/index.html",
    tags: ["记忆", "卡片", "配对", "大脑"],
    releasedAt: "2024-02-01",
    features: ["多种主题", "网格大小", "计时模式"],
    scenarios: ["通勤", "午餐", "减压", "睡前"],
    languages: ["zh", "en"],
    fileSize: "35KB",
    developer: "GameGate 团队",
    version: "1.0.0"
  },
  {
    id: 104,
    title: "快速打字",
    description: "通过各种文本和难度等级测试和提高你的打字速度。",
    category: "打字",
    playTime: 3,
    difficulty: "中等",
    rating: 4.0,
    popularity: 81,
    thumbnail: "/dist/games/color-match/thumbnail.jpg",
    url: "/games/color-match/index.html",
    tags: ["打字", "速度", "练习", "教育"],
    releasedAt: "2024-02-25",
    features: ["WPM追踪", "准确度测量", "多文本", "进度追踪"],
    scenarios: ["专注", "办公室", "快速"],
    languages: ["zh", "en"],
    fileSize: "26KB",
    developer: "GameGate 团队",
    version: "1.0.0"
  },
  {
    id: 105,
    title: "井字棋",
    description: "双人经典策略游戏。在对手之前获得三子连线！",
    category: "策略",
    playTime: 2,
    difficulty: "简单",
    rating: 4.1,
    popularity: 78,
    thumbnail: "/dist/games/color-match/thumbnail.jpg",
    url: "/games/color-match/index.html",
    tags: ["策略", "双人对战", "经典", "简单"],
    releasedAt: "2024-02-10",
    features: ["AI对手", "双人对战模式", "分数追踪"],
    scenarios: ["快速", "通勤", "办公室"],
    languages: ["zh", "en"],
    fileSize: "22KB",
    developer: "GameGate 团队",
    version: "1.0.0"
  }
];

// Helper functions for filtering and searching
function getGamesByScenario(scenario) {
  return games.filter(game => game.scenarios.includes(scenario));
}

function getGamesByTime(maxMinutes) {
  return games.filter(game => game.playTime <= maxMinutes);
}

function getGamesByCategory(category) {
  return games.filter(game => game.category === category);
}

function getGamesByDifficulty(difficulty) {
  return games.filter(game => game.difficulty === difficulty);
}

function getPopularGames(limit = 10) {
  return games
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

function getHighestRatedGames(limit = 10) {
  return games
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

function getNewestGames(limit = 10) {
  return games
    .sort((a, b) => new Date(b.releasedAt) - new Date(a.releasedAt))
    .slice(0, limit);
}

function searchGames(query) {
  const lowerQuery = query.toLowerCase();
  return games.filter(game =>
    game.title.toLowerCase().includes(lowerQuery) ||
    game.description.toLowerCase().includes(lowerQuery) ||
    game.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    game.category.toLowerCase().includes(lowerQuery)
  );
}

function getGameById(id) {
  return games.find(game => game.id === id);
}

function getGamesByTag(tag) {
  const lowerTag = tag.toLowerCase();
  return games.filter(game =>
    game.tags.some(gameTag => gameTag.toLowerCase() === lowerTag)
  );
}

function getRandomGames(limit = 10) {
  const shuffled = [...games].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
}

module.exports = {
  games,
  getGamesByScenario,
  getGamesByTime,
  getGamesByCategory,
  getGamesByDifficulty,
  getPopularGames,
  getHighestRatedGames,
  getNewestGames,
  searchGames,
  getGameById,
  getGamesByTag,
  getRandomGames
};