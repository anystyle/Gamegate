// Vercel serverless function for GameGate API
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import game data
const { games, getGamesByScenario, getGamesByTime, getPopularGames, searchGames } = require('../src/data/games_en');

const app = express();

// Compression
app.use(compression());

// Security
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

// CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', limiter);

// Static files
app.use(express.static('dist'));

// Games API
app.get('/api/games', (req, res) => {
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

  // Filter by scenario
  if (scenario && scenario !== 'all') {
    filteredGames = getGamesByScenario(scenario);
  }

  // Filter by search
  if (search) {
    const searchResults = searchGames(search);
    filteredGames = filteredGames.filter(game =>
      searchResults.some(result => result.id === game.id)
    );
  }

  // Filter by category
  if (category && category !== 'all') {
    filteredGames = filteredGames.filter(game => game.category === category);
  }

  // Filter by difficulty
  if (difficulty && difficulty !== 'all') {
    filteredGames = filteredGames.filter(game => game.difficulty === difficulty);
  }

  // Filter by max time
  if (maxTime && maxTime !== 'all') {
    filteredGames = getGamesByTime(parseInt(maxTime));
  }

  // Sort
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

  // Pagination
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

app.get('/api/games/:id', (req, res) => {
  const { id } = req.params;
  const game = games.find(g => g.id === parseInt(id));

  if (!game) {
    return res.status(404).json({
      error: 'Game not found',
      message: 'The requested game does not exist'
    });
  }

  res.json(game);
});

app.get('/api/games/scenario/:scenario', (req, res) => {
  const { scenario } = req.params;
  const { limit = 6 } = req.query;

  const validScenarios = ['commute', 'lunch', 'office', 'stress', 'bedtime', 'focus'];
  if (!validScenarios.includes(scenario)) {
    return res.status(400).json({
      error: 'Invalid scenario',
      message: 'Supported scenarios: ' + validScenarios.join(', ')
    });
  }

  const recommendedGames = getGamesByScenario(scenario)
    .slice(0, parseInt(limit))
    .map(game => ({
      ...game,
      recommendationReason: `Perfect for ${scenario} time, only ${game.playTime} minutes`
    }));

  res.json({
    scenario,
    games: recommendedGames,
    count: recommendedGames.length
  });
});

app.get('/api/games/quick/:minutes?', (req, res) => {
  const maxMinutes = req.params.minutes ? parseInt(req.params.minutes) : 5;

  if (maxMinutes < 1 || maxMinutes > 30) {
    return res.status(400).json({
      error: 'Invalid time parameter',
      message: 'Please select a time between 1 and 30 minutes'
    });
  }

  const quickGames = getGamesByTime(maxMinutes)
    .sort((a, b) => a.playTime - b.playTime);

  res.json({
    maxTime: maxMinutes,
    games: quickGames,
    count: quickGames.length,
    message: `Games completable within ${maxMinutes} minutes`
  });
});

app.get('/api/games/search/:query', (req, res) => {
  const { query } = req.params;
  const { limit = 10 } = req.query;

  if (!query || query.length < 2) {
    return res.status(400).json({
      error: 'Search query too short',
      message: 'Please enter at least 2 characters to search'
    });
  }

  const searchResults = searchGames(query)
    .slice(0, parseInt(limit));

  res.json({
    query,
    results: searchResults,
    count: searchResults.length
  });
});

// Categories API
app.get('/api/categories', (req, res) => {
  const categories = [...new Set(games.map(game => game.category))];

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
          popularity: game.popularity
        }))
    };
  });

  // Sort by game count
  categoriesWithStats.sort((a, b) => b.count - a.count);

  res.json({
    categories: categoriesWithStats,
    totalCategories: categories.length
  });
});

// User API
app.get('/api/user/profile', (req, res) => {
  // Mock user profile
  res.json({
    success: true,
    user: {
      id: 'user_123456789',
      preferences: {
        favoriteCategories: ['Puzzle', 'Match-3'],
        playTimePreference: 5,
        difficulty: 'Easy',
        scenario: 'commute'
      },
      stats: {
        totalPlayTime: 45,
        gamesPlayed: 8,
        favoriteGames: [
          { gameId: 101, playCount: 3, totalTime: 9 },
          { gameId: 102, playCount: 2, totalTime: 10 }
        ],
        lastPlayTime: new Date().toISOString(),
        achievements: ['first_game', 'quick_gamer'],
        playStreak: 3
      }
    }
  });
});

app.post('/api/user/preferences', (req, res) => {
  const preferences = req.body;

  res.json({
    success: true,
    preferences: preferences,
    message: 'Preferences updated successfully'
  });
});

app.post('/api/user/play-game', (req, res) => {
  const gameData = req.body;

  res.json({
    success: true,
    message: `Game recorded successfully! Total play time: ${gameData.playTime} minutes`
  });
});

app.get('/api/user/recommendations', (req, res) => {
  // Mock personalized recommendations
  const recommendations = getPopularGames(6).map(game => ({
    ...game,
    isPersonalRecommendation: true,
    recommendationReason: 'Based on your gaming history'
  }));

  res.json(recommendations);
});

app.get('/api/user/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      totalPlayTime: 45,
      gamesPlayed: 8,
      favoriteCategories: ['Puzzle', 'Match-3'],
      currentStreak: 3,
      achievements: ['first_game', 'quick_gamer'],
      recentActivity: [
        { gameId: 101, playTime: 3, completed: true, timestamp: new Date().toISOString() }
      ]
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime() || 0
  });
});

// Home page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../dist/index_en.html');
});

// Catch all for SPA
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/../dist/index_en.html');
});

module.exports = app;