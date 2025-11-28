const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 缓存系统 - 提升小游戏加载速度
const cache = new NodeCache({ stdTTL: 3600 }); // 1小时缓存

// 限流 - 防止滥用
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: { error: '请求过于频繁，请稍后再试' }
});

// 压缩响应 - 提升加载速度
app.use(compression());

// 安全头设置
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"]
    }
  }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-domain.com']
    : ['http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// API限流
app.use('/api/', limiter);

// 静态文件服务 - 为小游戏提供快速访问
app.use(express.static('dist', {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      // 游戏文件不缓存，确保最新版本
      res.setHeader('Cache-Control', 'no-cache');
    } else if (path.includes('/games/')) {
      // 游戏资源短时间缓存
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }
}));

// API路由
app.use('/api/games', require('./routes/games'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/user', require('./routes/user'));

// 主页 - 返回游戏平台主页
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../dist/index.html');
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cache: cache.getStats()
  });
});

// 推荐游戏 - 基于时间和用户偏好
app.get('/api/recommendations', (req, res) => {
  const { timeOfDay = 'any', category = 'all' } = req.query;

  // 从缓存获取推荐
  const cacheKey = `recommendations_${timeOfDay}_${category}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return res.json(cached);
  }

  // 根据时间段推荐不同类型的游戏
  const recommendations = getRecommendationsByTime(timeOfDay, category);

  // 缓存30分钟
  cache.set(cacheKey, recommendations, 1800);

  res.json(recommendations);
});

// 404处理 - 返回自定义404页面
app.use('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: 'API endpoint not found',
      message: '请求的API端点不存在'
    });
  }

  // SPA路由支持 - 所有其他路由返回index.html
  res.sendFile(__dirname + '/../dist/index.html');
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 根据时间推荐游戏
function getRecommendationsByTime(timeOfDay, category) {
  const allGames = [
    // 通勤时间 (早晨)
    { id: 1, title: '快速消除', category: 'puzzle', playTime: 2, difficulty: 'easy', tags: ['通勤', '早晨'] },
    { id: 2, title: '记忆翻牌', category: 'memory', playTime: 3, difficulty: 'easy', tags: ['通勤', '早晨'] },

    // 午休时间
    { id: 3, title: '数字拼图', category: 'puzzle', playTime: 5, difficulty: 'medium', tags: ['午休'] },
    { id: 4, title: '泡泡龙', category: 'casual', playTime: 8, difficulty: 'easy', tags: ['午休', '放松'] },

    // 下班/摸鱼时间
    { id: 5, title: '2048', category: 'puzzle', playTime: 5, difficulty: 'medium', tags: ['下班', '摸鱼'] },
    { id: 6, title: '打砖块', category: 'arcade', playTime: 3, difficulty: 'medium', tags: ['下班', '经典'] },

    // 深夜放松
    { id: 7, title: '填色游戏', category: 'relaxing', playTime: 10, difficulty: 'easy', tags: ['深夜', '放松'] },
    { id: 8, title: '打地鼠', category: 'casual', playTime: 4, difficulty: 'easy', tags: ['减压', '放松'] }
  ];

  let filtered = allGames;

  // 按分类筛选
  if (category !== 'all') {
    filtered = filtered.filter(game => game.category === category);
  }

  // 按时间筛选
  if (timeOfDay !== 'any') {
    const timeMap = {
      'morning': '早晨',
      'lunch': '午休',
      'evening': '下班',
      'night': '深夜'
    };

    const targetTime = timeMap[timeOfDay];
    filtered = filtered.filter(game => game.tags.includes(targetTime));
  }

  // 随机排序并返回前6个
  return filtered
    .sort(() => Math.random() - 0.5)
    .slice(0, 6)
    .map(game => ({
      ...game,
      recommended: true,
      reason: `${game.playTime}分钟 ${game.difficulty === 'easy' ? '轻松' : '适中'}`
    }));
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`🎮 GameGate - 轻量级解压小游戏聚合平台`);
  console.log(`🚀 服务器运行在: http://localhost:${PORT}`);
  console.log(`⏰ 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 缓存已启用: ${cache.keys().length} 个缓存项`);
  console.log(`📱 专为 18-35 岁用户设计的碎片时间娱乐平台`);
});

module.exports = app;