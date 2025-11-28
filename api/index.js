// Vercel Serverless Function for GameGate
const { games, getGamesByScenario, getGamesByTime, getPopularGames, searchGames } = require('../src/data/games_en');

// Mock user data for demo
const mockUser = {
  id: 'demo_user',
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
};

// Main handler
module.exports = async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Session-ID');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    // Games API
    if (pathname.startsWith('/api/games')) {
      const urlParts = pathname.split('/');

      if (urlParts[3] === 'scenario' && urlParts[4]) {
        const scenario = urlParts[4];
        const validScenarios = ['commute', 'lunch', 'office', 'stress', 'bedtime', 'focus'];

        if (!validScenarios.includes(scenario)) {
          return res.status(400).json({
            error: 'Invalid scenario',
            message: 'Supported scenarios: ' + validScenarios.join(', ')
          });
        }

        const scenarioGames = getGamesByScenario(scenario);
        const recommendedGames = scenarioGames
          .slice(0, 6)
          .map(game => ({
            ...game,
            recommendationReason: `Perfect for ${scenario} time`
          }));

        return res.json({
          scenario,
          games: recommendedGames,
          count: recommendedGames.length
        });
      }

      if (urlParts[3] === 'quick' && urlParts[4]) {
        const minutes = parseInt(urlParts[4]);

        if (minutes < 1 || minutes > 30) {
          return res.status(400).json({
            error: 'Invalid time parameter',
            message: 'Please select between 1 and 30 minutes'
          });
        }

        const quickGames = getGamesByTime(minutes);
        return res.json({
          maxTime: minutes,
          games: quickGames,
          count: quickGames.length,
          message: `Games completable within ${minutes} minutes`
        });
      }

      if (urlParts[3] === 'search' && urlParts[4]) {
        const query = decodeURIComponent(urlParts[4]);

        if (query.length < 2) {
          return res.status(400).json({
            error: 'Search query too short',
            message: 'Please enter at least 2 characters to search'
          });
        }

        const searchResults = searchGames(query);
        return res.json({
          query,
          results: searchResults,
          count: searchResults.length
        });
      }

      // Get all games with filtering
      const searchParams = url.searchParams;
      const page = parseInt(searchParams.get('page') || 1);
      const limit = parseInt(searchParams.get('limit') || 12);
      const category = searchParams.get('category');
      const difficulty = searchParams.get('difficulty');
      const maxTime = searchParams.get('maxTime');
      const scenario = searchParams.get('scenario');
      const sortBy = searchParams.get('sortBy') || 'popularity';
      const search = searchParams.get('search');

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
        filteredGames = filteredGames.filter(game =>
          filteredGames.some(fg => fg.id === game.id)
        );
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

      return res.json({
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
    }

    // Categories API
    if (pathname === '/api/categories') {
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

      return res.json({
        categories: categoriesWithStats,
        totalCategories: categories.length
      });
    }

    // User API
    if (pathname === '/api/user/profile') {
      return res.json({
        success: true,
        user: mockUser
      });
    }

    if (pathname === '/api/user/preferences') {
      const preferences = mockUser.preferences;
      return res.json({
        success: true,
        preferences: preferences,
        message: 'Preferences updated successfully'
      });
    }

    if (pathname === '/api/user/play-game') {
      return res.json({
        success: true,
        message: 'Game recorded successfully!'
      });
    }

    if (pathname === '/api/user/recommendations') {
      const recommendations = getPopularGames(6).map(game => ({
        ...game,
        isPersonalRecommendation: true,
        recommendationReason: 'Based on your gaming history'
      }));

      return res.json(recommendations);
    }

    if (pathname === '/api/user/stats') {
      return res.json({
        success: true,
        stats: mockUser.stats
      });
    }

    // Recommendations API
    if (pathname === '/api/recommendations') {
      const recommendations = getPopularGames(6).map(game => ({
        ...game,
        recommendationReason: 'Popular this week'
      }));

      return res.json(recommendations);
    }

    // Health check
    if (pathname === '/api/health') {
      return res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime() || 0,
        environment: 'production'
      });
    }

    // Serve games directly
    if (pathname.startsWith('/games/')) {
      const gameId = parseInt(pathname.split('/')[2]);
      const game = games.find(g => g.id === gameId);

      if (game && game.url) {
        // For now, return game info since we can't serve files directly
        return res.json({
          id: game.id,
          title: game.title,
          url: game.url,
          message: 'Game URL would be served here'
        });
      }
    }

    // Default - serve as SPA
    res.setHeader('Content-Type', 'text/html');
    return res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GameGate - Lite Stress-Relief Mini Games Platform</title>
    <meta name="description" content="Play instantly, no-burden casual fun - Lite mini games designed for fragmented time">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#6366f1',
                        secondary: '#8b5cf6',
                        accent: '#ec4899',
                        'gaming': '#10b981',
                        'relax': '#3b82f6',
                        'focus': '#f59e0b',
                        'quick': '#ef4444'
                    },
                    fontFamily: {
                        'sans': ['Inter', 'ui-sans-serif', 'system-ui']
                    },
                    animation: {
                        'float': 'float 3s ease-in-out infinite',
                        'gradient': 'gradient 8s linear infinite'
                    },
                    keyframes: {
                        float: {
                            '0%, 100%': { transform: 'translateY(0px)' },
                            '50%': { transform: 'translateY(-10px)' }
                        },
                        gradient: {
                            '0%, 100%': { backgroundPosition: '0% 50%' },
                            '50%': { backgroundPosition: '100% 50%' }
                        }
                    }
                }
            }
        }
    </script>
    <style>
        .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 8s linear infinite;
        }
        @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
    </style>
</head>
<body class="bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen font-sans">
    <nav class="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center animate-gradient bg-size-200">
                        <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21.6 8.2l-9.6-6c-.6-.4-1.4-.4-2 0l-9.6 6c-.6.4-1 1-1 1.7v8.2c0 .7.4 1.3 1 1.7l9.6 6c.6.4 1.4.4 2 0l9.6-6c.6-.4 1-1 1-1.7V9.9c0-.7-.4-1.3-1-1.7zM12 17.2l-6.8-4.2 6.8-4.2 6.8 4.2z"/>
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-xl font-bold text-gray-900">GameGate</h1>
                        <p class="text-xs text-gray-500">Lite Stress-Relief Games</p>
                    </div>
                </div>
                <div class="hidden md:flex items-center space-x-2 bg-gray-50 rounded-full px-4 py-2">
                    <button class="px-3 py-1 text-sm rounded-full bg-primary text-white" onclick="setScenario('commute')">
                        🚇 Commute
                    </button>
                    <button class="px-3 py-1 text-sm rounded-full hover:bg-gray-200" onclick="setScenario('lunch')">
                        ☕ Lunch
                    </button>
                    <button class="px-3 py-1 text-sm rounded-full hover:bg-gray-200" onclick="setScenario('office')">
                        🐟 Office
                    </button>
                    <button class="px-3 py-1 text-sm rounded-full hover:bg-gray-200" onclick="setScenario('stress')">
                        🧘 Stress Relief
                    </button>
                    <button class="px-3 py-1 text-sm rounded-full hover:bg-gray-200" onclick="setScenario('bedtime')">
                        🌙 Bedtime
                    </button>
                    <button class="px-3 py-1 text-sm rounded-full hover:bg-gray-200" onclick="setScenario('focus')">
                        ⚡ Focus
                    </button>
                </div>
            </div>
        </div>
    </nav>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <section class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">
                <span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Play Instantly, No-Burden Casual Fun
                </span>
            </h2>
            <p class="text-gray-600 mb-6 max-w-2xl mx-auto">
                Lite stress-relief mini games designed for fragmented time
            </p>
        </section>
        <section class="mb-8">
            <div id="games-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <!-- Games will be loaded by JavaScript -->
            </div>
        </section>
    </main>
    <script>
        const games = ${JSON.stringify(games)};

        function renderGames() {
            const grid = document.getElementById('games-grid');
            grid.innerHTML = '';

            games.forEach(game => {
                const card = document.createElement('div');
                card.className = 'bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer';
                card.innerHTML = \`
                    <div class="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center">
                                <span class="text-2xl">\${getGameIcon(game.category)}</span>
                            </div>
                        </div>
                        <div class="absolute top-2 right-2 px-2 py-1 bg-white/90 rounded-full text-xs font-medium">
                            \${game.playTime} min
                        </div>
                    </div>
                    <div class="p-4">
                        <h3 class="font-semibold text-gray-900 mb-1">\${game.title}</h3>
                        <p class="text-sm text-gray-600 mb-2 line-clamp-2">\${game.description}</p>
                        <div class="flex items-center justify-between text-xs">
                            <div class="flex items-center space-x-2">
                                <span class="text-gray-500">\${game.category}</span>
                                <span class="text-gray-400">•</span>
                                <div class="flex items-center">
                                    <svg class="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                    </svg>
                                    <span class="text-gray-700">\${game.rating}</span>
                                </div>
                            </div>
                            <span class="text-green-500">✓ Ad-Free</span>
                        </div>
                    </div>
                \`;

                card.addEventListener('click', () => {
                    alert(\`Game: \${game.title} (ID: \${game.id})\`);
                });

                grid.appendChild(card);
            });
        }

        function getGameIcon(category) {
            const icons = {
                'Puzzle': '🧩',
                'Match-3': '🎯',
                'Typing': '⌨️',
                'Reaction': '⚡',
                'Memory': '🧠',
                'Strategy': '♟️',
                'Coloring': '🎨',
                'Simulation': '🎮',
                'Shooting': '🫧'
            };
            return icons[category] || '🎮';
        }

        function setScenario(scenario) {
            console.log('Scenario selected:', scenario);
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            renderGames();
        });
    </script>
</body>
</html>
    `);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong'
    });
  }
};