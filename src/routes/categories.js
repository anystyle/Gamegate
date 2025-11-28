const express = require('express');
const router = express.Router();
const { games } = require('../data/games');

// 获取所有游戏分类
router.get('/', (req, res) => {
  // 获取所有不重复的分类
  const categories = [...new Set(games.map(game => game.category))];

  // 为每个分类添加统计信息
  const categoriesWithStats = categories.map(category => {
    const categoryGames = games.filter(game => game.category === category);
    const totalPlayTime = categoryGames.reduce((sum, game) => sum + game.playTime, 0);
    const avgRating = categoryGames.reduce((sum, game) => sum + game.rating, 0) / categoryGames.length;

    return {
      name: category,
      count: categoryGames.length,
      avgRating: Math.round(avgRating * 10) / 10,
      totalPlayTime,
      avgPlayTime: Math.round((totalPlayTime / categoryGames.length) * 10) / 10,
      popularGames: categoryGames
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 3)
        .map(game => ({
          id: game.id,
          title: game.title,
          thumbnail: game.thumbnail,
          playTime: game.playTime,
          difficulty: game.difficulty
        }))
    };
  });

  // 按游戏数量排序
  categoriesWithStats.sort((a, b) => b.count - a.count);

  res.json({
    categories: categoriesWithStats,
    totalCategories: categories.length
  });
});

// 获取特定分类的游戏
router.get('/:categoryName', (req, res) => {
  const { categoryName } = req.params;
  const { page = 1, limit = 12, sortBy = 'popularity' } = req.query;

  const categoryGames = games.filter(game => game.category === categoryName);

  if (categoryGames.length === 0) {
    return res.status(404).json({
      error: '分类不存在',
      message: `分类"${categoryName}"下暂无游戏`,
      availableCategories: [...new Set(games.map(game => game.category))]
    });
  }

  // 排序
  switch (sortBy) {
    case 'rating':
      categoryGames.sort((a, b) => b.rating - a.rating);
      break;
    case 'playTime':
      categoryGames.sort((a, b) => a.playTime - b.playTime);
      break;
    case 'newest':
      categoryGames.sort((a, b) => new Date(b.releasedAt) - new Date(a.releasedAt));
      break;
    case 'popularity':
    default:
      categoryGames.sort((a, b) => b.popularity - a.popularity);
  }

  // 分页
  const total = categoryGames.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedGames = categoryGames.slice(startIndex, endIndex);

  res.json({
    category: categoryName,
    games: paginatedGames,
    pagination: {
      current: parseInt(page),
      total: totalPages,
      limit: parseInt(limit),
      totalItems: total,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    stats: {
      totalGames: total,
      avgRating: Math.round((categoryGames.reduce((sum, game) => sum + game.rating, 0) / total) * 10) / 10,
      avgPlayTime: Math.round((categoryGames.reduce((sum, game) => sum + game.playTime, 0) / total) * 10) / 10
    }
  });
});

// 获取推荐分类
router.get('/recommended/:scenario', (req, res) => {
  const { scenario } = req.params;

  // 根据不同场景推荐不同分类
  const scenarioRecommendations = {
    '通勤': ['益智', '打字', '反应'],
    '午休': ['策略', '记忆', '益智'],
    '摸鱼': ['消除', '休闲', '策略'],
    '减压': ['填色', '模拟', '消除'],
    '睡前': ['填色', '模拟', '记忆'],
    '提神': ['反应', '打字', '益智']
  };

  const recommendedCategories = scenarioRecommendations[scenario] || [];
  const categories = [...new Set(games.map(game => game.category))];

  const recommended = categories
    .filter(category => recommendedCategories.includes(category))
    .map(category => {
      const categoryGames = games.filter(game => game.category === category);
      return {
        name: category,
        gameCount: categoryGames.length,
        avgPlayTime: Math.round((categoryGames.reduce((sum, game) => sum + game.playTime, 0) / categoryGames.length) * 10) / 10,
        sampleGames: categoryGames
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 3)
          .map(game => ({
            id: game.id,
            title: game.title,
            playTime: game.playTime,
            difficulty: game.difficulty
          }))
      };
    });

  res.json({
    scenario,
    recommendedCategories: recommended,
    allCategories: categories.map(cat => ({ name: cat, recommended: recommendedCategories.includes(cat) }))
  });
});

module.exports = router;