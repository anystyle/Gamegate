// Lite Stress-Relief Mini Games Database
// Designed for fragmented time, supports instant play
const games = [
  // 2-5 minute quick games - suitable for commute, office
  {
    id: 101,
    title: "2048 Number Puzzle",
    category: "Puzzle",
    tags: ["numbers", "strategy", "classic"],
    playTime: 3, // Estimated game time in minutes
    difficulty: "Easy",
    description: "Number merging game that exercises logical thinking",
    features: ["Touch-friendly", "Auto-save", "No ads"],
    thumbnail: "/games/2048/thumb.jpg",
    url: "/games/2048/index_en.html",
    popularity: 9.2,
    rating: 4.5,
    size: "256KB", // Lightweight design
    loadTime: "1.2s",
    bestFor: ["Commute", "Lunch", "Office"],
    releasedAt: "2024-01-15"
  },
  {
    id: 102,
    title: "Bubble Crush",
    category: "Match-3",
    tags: ["casual", "visual", "relaxing"],
    playTime: 5,
    difficulty: "Easy",
    description: "Click to eliminate same-colored bubbles",
    features: ["Colorful animations", "Chain reactions", "Optional sound"],
    thumbnail: "/games/bubble-crush/thumb.jpg",
    url: "/games/bubble-crush/index.html",
    popularity: 8.8,
    rating: 4.3,
    size: "180KB",
    loadTime: "0.8s",
    bestFor: ["Stress Relief", "Relax", "Bedtime"],
    releasedAt: "2024-01-10"
  },
  {
    id: 103,
    title: "Speed Typing",
    category: "Typing",
    tags: ["speed", "challenge", "skill"],
    playTime: 2,
    difficulty: "Medium",
    description: "Test your typing speed and accuracy",
    features: ["Real-time statistics", "Progressive difficulty", "Rich vocabulary"],
    thumbnail: "/games/typing-speed/thumb.jpg",
    url: "/games/typing-speed/index.html",
    popularity: 7.5,
    rating: 4.2,
    size: "95KB",
    loadTime: "0.5s",
    bestFor: ["Skill Improvement", "Fragmented Time", "Focus Training"],
    releasedAt: "2024-01-08"
  },

  // 5-10 minute strategy games - suitable for lunch break
  {
    id: 201,
    title: "Mini Minesweeper",
    category: "Strategy",
    tags: ["classic", "logic", "deduction"],
    playTime: 6,
    difficulty: "Medium",
    description: "Simplified version of classic minesweeper",
    features: ["Multiple difficulty levels", "Timer mode", "Flag system"],
    thumbnail: "/games/minesweeper/thumb.jpg",
    url: "/games/minesweeper/index.html",
    popularity: 8.9,
    rating: 4.6,
    size: "120KB",
    loadTime: "0.7s",
    bestFor: ["Logic Training", "Lunch Break", "Focus"],
    releasedAt: "2024-01-05"
  },
  {
    id: 202,
    title: "Memory Match",
    category: "Memory",
    tags: ["memory", "matching", "brain"],
    playTime: 4,
    difficulty: "Easy",
    description: "Flip and match identical cards",
    features: ["Multiple themes", "Difficulty options", "Best scores"],
    thumbnail: "/games/memory-game/thumb.jpg",
    url: "/games/memory-game/index.html",
    popularity: 8.2,
    rating: 4.4,
    size: "200KB",
    loadTime: "1.0s",
    bestFor: ["Memory Training", "Casual Fun", "All Ages"],
    releasedAt: "2024-01-03"
  },

  // Relaxing and healing games - suitable for stress relief
  {
    id: 301,
    title: "Color by Numbers",
    category: "Coloring",
    tags: ["creative", "healing", "relaxing"],
    playTime: 8,
    difficulty: "Easy",
    description: "Fill colors by numbers to create beautiful patterns",
    features: ["Huge pattern library", "Rich colors", "Save artwork"],
    thumbnail: "/games/color-by-number/thumb.jpg",
    url: "/games/color-by-number/index.html",
    popularity: 9.5,
    rating: 4.8,
    size: "350KB",
    loadTime: "1.5s",
    bestFor: ["Stress Relief", "Creative Expression", "Bedtime Relaxation"],
    releasedAt: "2024-01-12"
  },
  {
    id: 302,
    title: "Fishing Simulator",
    category: "Simulation",
    tags: ["casual", "healing", "collection"],
    playTime: 10,
    difficulty: "Easy",
    description: "Relaxed fishing experience, collect various fish",
    features: ["Multiple fish species", "Different fishing spots", "Achievement system"],
    thumbnail: "/games/fishing-sim/thumb.jpg",
    url: "/games/fishing-sim/index.html",
    popularity: 8.0,
    rating: 4.3,
    size: "420KB",
    loadTime: "2.0s",
    bestFor: ["Relaxation", "Collection Hobby", "Long Waits"],
    releasedAt: "2024-01-07"
  },

  // Reaction games - short duration, high intensity
  {
    id: 401,
    title: "Whack-a-Mole",
    category: "Reaction",
    tags: ["speed", "reaction", "challenge"],
    playTime: 3,
    difficulty: "Easy",
    description: "Quickly click on appearing moles",
    features: ["Speed progression", "High score records", "Sound feedback"],
    thumbnail: "/games/whack-a-mole/thumb.jpg",
    url: "/games/whack-a-mole/index.html",
    popularity: 8.6,
    rating: 4.4,
    size: "150KB",
    loadTime: "0.6s",
    bestFor: ["Reaction Training", "Quick Break", "Mental Refresh"],
    releasedAt: "2024-01-09"
  },
  {
    id: 402,
    title: "Bubble Shooter",
    category: "Shooting",
    tags: ["aiming", "strategy", "classic"],
    playTime: 5,
    difficulty: "Medium",
    description: "Shoot bubbles to eliminate same-colored bubble groups",
    features: ["Physics engine", "Level mode", "Combo rewards"],
    thumbnail: "/games/bubble-shooter/thumb.jpg",
    url: "/games/bubble-shooter/index.html",
    popularity: 9.0,
    rating: 4.5,
    size: "280KB",
    loadTime: "1.3s",
    bestFor: ["Strategic Thinking", "Visual Satisfaction", "Achievement Collection"],
    releasedAt: "2024-01-11"
  }
];

// Recommend games based on different scenarios
function getGamesByScenario(scenario = 'all') {
  const scenarios = {
    'commute': [101, 103, 401], // 2-5 minute quick games
    'lunch': [201, 202, 402], // 5-10 minute strategy games
    'office': [101, 102, 202], // Games that can be paused anytime
    'stress': [102, 301, 302], // Relaxing healing games
    'bedtime': [301, 302], // Easy, non-stimulating games
    'focus': [103, 401, 402] // Games requiring focus and reaction
  };

  if (scenario === 'all') return games;

  const recommendedIds = scenarios[scenario] || [];
  return games.filter(game => recommendedIds.includes(game.id));
}

// Filter games by game time
function getGamesByTime(maxMinutes = 10) {
  return games.filter(game => game.playTime <= maxMinutes);
}

// Get popular games
function getPopularGames(limit = 6) {
  return [...games]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

// Search games
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