const express = require('express');
const router = express.Router();
const {
  games,
  getGamesByScenario,
  getGamesByTime,
  getPopularGames,
  searchGames
} = require('../data/games');

// 获取所有游戏列表（支持筛选和分页）
router.get('/', (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    difficulty,
    maxTime,
    scenario,
    sortBy = 'popularity',
    search
  } = req.query;

  let filteredGames = [...games];

  // 按场景筛选（核心功能）
  if (scenario && scenario !== 'all') {
    filteredGames = getGamesByScenario(scenario);
  }

  // 按搜索关键词筛选
  if (search) {
    const searchResults = searchGames(search);
    filteredGames = filteredGames.filter(game =>
      searchResults.some(result => result.id === game.id)
    );
  }

  // 按分类筛选
  if (category && category !== 'all') {
    filteredGames = filteredGames.filter(game => game.category === category);
  }

  // 按难度筛选
  if (difficulty && difficulty !== 'all') {
    filteredGames = filteredGames.filter(game => game.difficulty === difficulty);
  }

  // 按最大游戏时间筛选
  if (maxTime && maxTime !== 'all') {
    filteredGames = getGamesByTime(parseInt(maxTime));
  }

  // 排序
  switch (sortBy) {
    case 'rating':
      filteredGames.sort((a, b) => b.rating - a.rating);
      break;
    case 'playTime':
      filteredGames.sort((a, b) => a.playTime - b.playTime);
      break;
    case 'newest':
      filteredGames.sort((a, b) => new Date(b.releasedAt) - new Date(a.releasedAt));
      break;
    case 'popularity':
    default:
      filteredGames.sort((a, b) => b.popularity - a.popularity);
  }

  // 分页
  const total = filteredGames.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedGames = filteredGames.slice(startIndex, endIndex);

  res.json({
    games: paginatedGames,
    pagination: {
      current: parseInt(page),
      total: totalPages,
      limit: parseInt(limit),
      totalItems: total,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    filters: {
      category,
      difficulty,
      maxTime,
      scenario,
      sortBy,
      search
    }
  });
});

// 获取游戏详情
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const game = games.find(g => g.id === parseInt(id));

  if (!game) {
    return res.status(404).json({
      error: '游戏未找到',
      message: '请求的游戏不存在'
    });
  }

  // 增加点击统计（实际项目中需要数据库）
  game.playCount = (game.playCount || 0) + 1;

  res.json(game);
});

// 根据场景推荐游戏 - 核心功能
router.get('/scenario/:scenario', (req, res) => {
  const { scenario } = req.params;
  const { limit = 6 } = req.query;

  // 验证场景参数
  const validScenarios = ['通勤', '午休', '摸鱼', '减压', '睡前', '提神'];
  if (!validScenarios.includes(scenario)) {
    return res.status(400).json({
      error: '无效场景',
      message: '支持的场景：' + validScenarios.join('、')
    });
  }

  const recommendedGames = getGamesByScenario(scenario)
    .slice(0, parseInt(limit))
    .map(game => ({
      ...game,
      recommendationReason: `最适合${scenario}时间的小游戏，只需${game.playTime}分钟`
    }));

  res.json({
    scenario,
    games: recommendedGames,
    count: recommendedGames.length
  });
});

// 获取快速游戏（5分钟以内）- 核心功能
router.get('/quick/:minutes?', (req, res) => {
  const maxMinutes = req.params.minutes ? parseInt(req.params.minutes) : 5;

  if (maxMinutes < 1 || maxMinutes > 30) {
    return res.status(400).json({
      error: '时间参数错误',
      message: '请选择1-30分钟之间的游戏时间'
    });
  }

  const quickGames = getGamesByTime(maxMinutes)
    .sort((a, b) => a.playTime - b.playTime);

  res.json({
    maxTime: maxMinutes,
    games: quickGames,
    count: quickGames.length,
    message: `${maxMinutes}分钟内可完成的游戏`
  });
});

// 热门游戏排行
router.get('/popular/top', (req, res) => {
  const { limit = 10, period = 'all' } = req.query;

  let popularGames = getPopularGames(parseInt(limit));

  // 根据时间段筛选（模拟不同时期的热门）
  if (period === 'today') {
    // 模拟今日热门，实际需要数据库
    popularGames = popularGames.slice(0, 5).map(game => ({
      ...game,
      trend: 'up',
      trendValue: Math.floor(Math.random() * 50) + 10
    }));
  } else if (period === 'week') {
    popularGames = popularGames.slice(0, 8);
  }

  res.json({
    period,
    games: popularGames,
    updateTime: new Date().toISOString()
  });
});

// 游戏分类统计
router.get('/stats/categories', (req, res) => {
  const categoryStats = {};

  games.forEach(game => {
    if (!categoryStats[game.category]) {
      categoryStats[game.category] = {
        name: game.category,
        count: 0,
        avgRating: 0,
        totalTime: 0,
        avgPlayTime: 0,
        popularGames: []
      };
    }

    const stats = categoryStats[game.category];
    stats.count++;
    stats.avgRating = (stats.avgRating * (stats.count - 1) + game.rating) / stats.count;
    stats.totalTime += game.playTime;
    stats.avgPlayTime = stats.totalTime / stats.count;

    if (game.popularity > 8.5) {
      stats.popularGames.push({
        id: game.id,
        title: game.title,
        popularity: game.popularity
      });
    }
  });

  // 转换为数组并排序
  const categories = Object.values(categoryStats)
    .sort((a, b) => b.count - a.count)
    .map(cat => ({
      ...cat,
      avgRating: Math.round(cat.avgRating * 10) / 10,
      avgPlayTime: Math.round(cat.avgPlayTime * 10) / 10
    }));

  res.json({
    categories,
    totalGames: games.length,
    totalCategories: categories.length
  });
});

// 获取游戏标签云
router.get('/tags/cloud', (req, res) => {
  const tagCounts = {};

  games.forEach(game => {
    game.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // 生成标签云数据
  const tagCloud = Object.entries(tagCounts)
    .map(([tag, count]) => ({
      tag,
      count,
      weight: count / games.length, // 权重
      size: Math.max(12, Math.min(24, 12 + count * 2)) // 字体大小
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20); // 只取前20个标签

  res.json({
    tags: tagCloud,
    totalTags: Object.keys(tagCounts).length
  });
});

// 游戏搜索API
router.get('/search/:query', (req, res) => {
  const { query } = req.params;
  const { limit = 10 } = req.query;

  if (!query || query.length < 2) {
    return res.status(400).json({
      error: '搜索关键词太短',
      message: '请输入至少2个字符进行搜索'
    });
  }

  const searchResults = searchGames(query)
    .slice(0, parseInt(limit));

  res.json({
    query,
    results: searchResults,
    count: searchResults.length,
    suggestions: getSearchSuggestions(query)
  });
});

// 搜索建议
function getSearchSuggestions(query) {
  const allTags = [...new Set(games.flatMap(game => game.tags))];
  const allCategories = [...new Set(games.map(game => game.category))];

  const suggestions = [...allTags, ...allCategories]
    .filter(item => item.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  return suggestions;
}

module.exports = router;