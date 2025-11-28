const express = require('express');
const router = express.Router();

// 模拟用户数据存储
const userSessions = new Map();

// 检查用户会话
function checkUserSession(req, res, next) {
  const sessionId = req.headers['x-session-id'] || req.query.sessionId;

  if (!sessionId) {
    // 创建新的会话ID
    const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    req.sessionId = newSessionId;

    // 初始化用户数据
    userSessions.set(newSessionId, {
      id: newSessionId,
      createdAt: new Date().toISOString(),
      preferences: {
        favoriteCategories: [],
        playTimePreference: 5, // 默认5分钟
        difficulty: '简单',
        scenario: '摸鱼' // 默认场景
      },
      stats: {
        totalPlayTime: 0,
        gamesPlayed: 0,
        favoriteGames: [],
        lastPlayTime: null,
        achievements: [],
        playStreak: 0
      },
      recentGames: [],
      recommendations: []
    });
  } else {
    req.sessionId = sessionId;
    const userData = userSessions.get(sessionId);

    if (!userData) {
      return res.status(401).json({
        error: '会话已过期',
        message: '请重新开始使用'
      });
    }
  }

  next();
}

// 获取用户信息
router.get('/profile', checkUserSession, (req, res) => {
  const userData = userSessions.get(req.sessionId);

  res.json({
    success: true,
    user: userData,
    sessionId: req.sessionId
  });
});

// 更新用户偏好设置
router.post('/preferences', checkUserSession, (req, res) => {
  const { category, playTime, difficulty, scenario } = req.body;
  const userData = userSessions.get(req.sessionId);

  // 更新偏好设置
  if (category) {
    if (!userData.preferences.favoriteCategories.includes(category)) {
      userData.preferences.favoriteCategories.push(category);
      // 最多保留5个偏好分类
      if (userData.preferences.favoriteCategories.length > 5) {
        userData.preferences.favoriteCategories.shift();
      }
    }
  }

  if (playTime && playTime >= 1 && playTime <= 30) {
    userData.preferences.playTimePreference = parseInt(playTime);
  }

  if (difficulty && ['简单', '中等', '困难'].includes(difficulty)) {
    userData.preferences.difficulty = difficulty;
  }

  if (scenario && ['通勤', '午休', '摸鱼', '减压', '睡前', '提神'].includes(scenario)) {
    userData.preferences.scenario = scenario;
  }

  userSessions.set(req.sessionId, userData);

  res.json({
    success: true,
    preferences: userData.preferences,
    message: '偏好设置已更新'
  });
});

// 记录游戏播放
router.post('/play-game', checkUserSession, (req, res) => {
  const { gameId, playTime, completed, rating } = req.body;
  const userData = userSessions.get(req.sessionId);

  if (!gameId || !playTime) {
    return res.status(400).json({
      error: '缺少必要参数',
      message: '需要gameId和playTime'
    });
  }

  // 更新用户统计
  userData.stats.totalPlayTime += parseInt(playTime);
  userData.stats.gamesPlayed += 1;
  userData.stats.lastPlayTime = new Date().toISOString();

  // 添加到最近游戏记录（去重）
  userData.recentGames = userData.recentGames.filter(game => game.gameId !== gameId);
  userData.recentGames.unshift({
    gameId,
    playTime: parseInt(playTime),
    completed: completed || false,
    rating: rating || null,
    timestamp: new Date().toISOString()
  });

  // 只保留最近20个游戏记录
  userData.recentGames = userData.recentGames.slice(0, 20);

  // 更新最喜欢的游戏
  const gameIndex = userData.stats.favoriteGames.findIndex(game => game.gameId === gameId);
  if (gameIndex >= 0) {
    userData.stats.favoriteGames[gameIndex].playCount += 1;
    userData.stats.favoriteGames[gameIndex].totalTime += parseInt(playTime);
  } else {
    userData.stats.favoriteGames.push({
      gameId,
      playCount: 1,
      totalTime: parseInt(playTime),
      lastPlayed: new Date().toISOString()
    });
  }

  // 排序并只保留前10个最喜欢的游戏
  userData.stats.favoriteGames.sort((a, b) => b.playCount - a.playCount);
  userData.stats.favoriteGames = userData.stats.favoriteGames.slice(0, 10);

  // 检查成就
  checkAchievements(userData);

  userSessions.set(req.sessionId, userData);

  res.json({
    success: true,
    stats: userData.stats,
    message: `游戏记录已保存，总游戏时间: ${userData.stats.totalPlayTime}分钟`
  });
});

// 检查成就
function checkAchievements(userData) {
  const achievements = userData.stats.achievements;

  // 首次游戏
  if (userData.stats.gamesPlayed === 1 && !achievements.includes('first_game')) {
    achievements.push('first_game');
  }

  // 累计游戏时间
  if (userData.stats.totalPlayTime >= 60 && !achievements.includes('hour_played')) {
    achievements.push('hour_played');
  }

  if (userData.stats.totalPlayTime >= 300 && !achievements.includes('five_hours')) {
    achievements.push('five_hours');
  }

  // 游戏数量
  if (userData.stats.gamesPlayed >= 10 && !achievements.includes('ten_games')) {
    achievements.push('ten_games');
  }

  if (userData.stats.gamesPlayed >= 50 && !achievements.includes('fifty_games')) {
    achievements.push('fifty_games');
  }

  // 连续游戏天数（简化版，实际需要按天计算）
  const today = new Date().toDateString();
  const lastPlay = userData.stats.lastPlayTime ? new Date(userData.stats.lastPlayTime).toDateString() : null;

  if (lastPlay !== today) {
    userData.stats.playStreak = userData.stats.lastPlayTime ? userData.stats.playStreak + 1 : 1;

    if (userData.stats.playStreak >= 7 && !achievements.includes('week_streak')) {
      achievements.push('week_streak');
    }
  }
}

// 获取个性化推荐
router.get('/recommendations', checkUserSession, (req, res) => {
  const userData = userSessions.get(req.sessionId);
  const { games } = require('../data/games');

  // 基于用户偏好的推荐算法
  let recommendedGames = [...games];

  // 1. 基于喜欢的分类
  if (userData.preferences.favoriteCategories.length > 0) {
    recommendedGames.sort((a, b) => {
      const aFavorite = userData.preferences.favoriteCategories.includes(a.category);
      const bFavorite = userData.preferences.favoriteCategories.includes(b.category);

      if (aFavorite && !bFavorite) return -1;
      if (!aFavorite && bFavorite) return 1;
      return 0;
    });
  }

  // 2. 基于游戏时间偏好
  const preferredTime = userData.preferences.playTimePreference;
  recommendedGames.sort((a, b) => {
    const aDiff = Math.abs(a.playTime - preferredTime);
    const bDiff = Math.abs(b.playTime - preferredTime);
    return aDiff - bDiff;
  });

  // 3. 基于难度偏好
  if (userData.preferences.difficulty) {
    const preferredDifficulty = userData.preferences.difficulty;
    recommendedGames.sort((a, b) => {
      const aMatch = a.difficulty === preferredDifficulty ? 1 : 0;
      const bMatch = b.difficulty === preferredDifficulty ? 1 : 0;
      return bMatch - aMatch;
    });
  }

  // 4. 排除已经玩过的游戏（或者降低权重）
  const playedGameIds = userData.recentGames.map(game => game.gameId);
  recommendedGames.sort((a, b) => {
    const aPlayed = playedGameIds.includes(a.id);
    const bPlayed = playedGameIds.includes(b.id);

    if (aPlayed && !bPlayed) return 1;
    if (!aPlayed && bPlayed) return -1;
    return 0;
  });

  // 取前12个推荐游戏
  const finalRecommendations = recommendedGames.slice(0, 12).map(game => {
    let reason = '热门推荐';

    if (userData.preferences.favoriteCategories.includes(game.category)) {
      reason = '基于你的喜好';
    } else if (Math.abs(game.playTime - preferredTime) <= 2) {
      reason = `${game.playTime}分钟，正好适合你`;
    } else if (game.difficulty === userData.preferences.difficulty) {
      reason = '难度正好适合你';
    }

    return {
      ...game,
      recommendationReason: reason,
      isPersonalRecommendation: true
    };
  });

  // 保存推荐结果
  userData.recommendations = finalRecommendations.slice(0, 6);
  userSessions.set(req.sessionId, userData);

  res.json({
    recommendations: finalRecommendations,
    basedOn: {
      favoriteCategories: userData.preferences.favoriteCategories,
      playTimePreference: userData.preferences.playTimePreference,
      difficulty: userData.preferences.difficulty,
      scenario: userData.preferences.scenario
    },
    totalGamesPlayed: userData.stats.gamesPlayed
  });
});

// 获取用户统计
router.get('/stats', checkUserSession, (req, res) => {
  const userData = userSessions.get(req.sessionId);

  // 计算详细统计
  const stats = {
    ...userData.stats,
    avgGameTime: userData.stats.gamesPlayed > 0
      ? Math.round(userData.stats.totalPlayTime / userData.stats.gamesPlayed * 10) / 10
      : 0,
    mostPlayedCategory: getMostPlayedCategory(userData),
    currentStreak: userData.stats.playStreak,
    achievements: userData.stats.achievements.map(achievementId => ({
      id: achievementId,
      name: getAchievementName(achievementId),
      description: getAchievementDescription(achievementId),
      unlockedAt: userData.stats.lastPlayTime
    }))
  };

  res.json({
    success: true,
    stats,
    preferences: userData.preferences,
    recentActivity: userData.recentGames.slice(0, 5)
  });
});

// 获取最常玩的分类
function getMostPlayedCategory(userData) {
  const categoryPlayTime = {};

  userData.recentGames.forEach(record => {
    // 这里需要根据gameId查找游戏分类
    // 简化处理，返回偏好分类
  });

  return userData.preferences.favoriteCategories[0] || '益智';
}

// 获取成就名称
function getAchievementName(achievementId) {
  const names = {
    'first_game': '初次体验',
    'hour_played': '游戏达人',
    'five_hours': '游戏高手',
    'ten_games': '游戏探索者',
    'fifty_games': '游戏专家',
    'week_streak': '坚持不懈'
  };

  return names[achievementId] || achievementId;
}

// 获取成就描述
function getAchievementDescription(achievementId) {
  const descriptions = {
    'first_game': '完成你的第一个游戏',
    'hour_played': '累计游戏时间达到1小时',
    'five_hours': '累计游戏时间达到5小时',
    'ten_games': '完成10个游戏',
    'fifty_games': '完成50个游戏',
    'week_streak': '连续7天玩游戏'
  };

  return descriptions[achievementId] || '未知成就';
}

// 清除用户数据
router.delete('/clear', checkUserSession, (req, res) => {
  userSessions.delete(req.sessionId);

  res.json({
    success: true,
    message: '用户数据已清除'
  });
});

module.exports = router;