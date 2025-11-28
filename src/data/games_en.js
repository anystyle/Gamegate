// English Games Database for GameGate
const games = [
  {
    id: 101,
    title: "2048",
    description: "Slide numbered tiles to combine them and reach the 2048 tile in this addictive puzzle game.",
    category: "Puzzle",
    playTime: 5,
    difficulty: "Easy",
    rating: 4.5,
    popularity: 95,
    thumbnail: "/dist/games/2048/thumbnail.jpg",
    url: "/dist/games/2048/index_en.html",
    tags: ["puzzle", "numbers", "strategy", "brain"],
    releasedAt: "2024-01-15",
    features: ["Save progress", "High scores", "Smooth animations", "Mobile friendly"],
    scenarios: ["commute", "lunch", "stress", "bedtime"],
    languages: ["en"],
    fileSize: "45KB",
    developer: "GameGate Team",
    version: "1.0.0"
  },
  {
    id: 102,
    title: "Color Match",
    description: "A fast-paced color matching game that tests your reflexes and pattern recognition skills.",
    category: "Reaction",
    playTime: 3,
    difficulty: "Medium",
    rating: 4.2,
    popularity: 88,
    thumbnail: "/games/images/color-match.jpg",
    url: "#",
    tags: ["reaction", "colors", "speed", "reflexes"],
    releasedAt: "2024-01-20",
    features: ["Time challenge", "Increasing difficulty", "Color themes"],
    scenarios: ["focus", "stress", "quick"],
    languages: ["en"],
    fileSize: "28KB",
    developer: "GameGate Team",
    version: "1.0.0"
  },
  {
    id: 103,
    title: "Word Chain",
    description: "Build word chains by changing one letter at a time in this linguistic puzzle challenge.",
    category: "Typing",
    playTime: 8,
    difficulty: "Hard",
    rating: 4.7,
    popularity: 92,
    thumbnail: "/games/images/word-chain.jpg",
    url: "#",
    tags: ["typing", "words", "language", "education"],
    releasedAt: "2024-01-25",
    features: ["Multiple languages", "Dictionary lookup", "Hint system"],
    scenarios: ["focus", "lunch", "bedtime"],
    languages: ["en"],
    fileSize: "52KB",
    developer: "GameGate Team",
    version: "1.0.0"
  },
  {
    id: 104,
    title: "Memory Cards",
    description: "Classic memory matching game with various themes and difficulty levels.",
    category: "Memory",
    playTime: 4,
    difficulty: "Easy",
    rating: 4.3,
    popularity: 85,
    thumbnail: "/games/images/memory-cards.jpg",
    url: "#",
    tags: ["memory", "cards", "matching", "brain"],
    releasedAt: "2024-02-01",
    features: ["Multiple themes", "Grid sizes", "Timer mode"],
    scenarios: ["commute", "lunch", "stress", "bedtime"],
    languages: ["en"],
    fileSize: "35KB",
    developer: "GameGate Team",
    version: "1.0.0"
  },
  {
    id: 105,
    title: "Bubble Shooter",
    description: "Shoot colorful bubbles to match three or more of the same color in this classic arcade game.",
    category: "Match-3",
    playTime: 6,
    difficulty: "Medium",
    rating: 4.6,
    popularity: 94,
    thumbnail: "/games/images/bubble-shooter.jpg",
    url: "#",
    tags: ["match-3", "bubbles", "arcade", "casual"],
    releasedAt: "2024-02-05",
    features: ["Power-ups", "Levels", "High scores", "Smooth physics"],
    scenarios: ["lunch", "stress", "office"],
    languages: ["en"],
    fileSize: "67KB",
    developer: "GameGate Team",
    version: "1.0.0"
  },
  {
    id: 106,
    title: "Tic Tac Toe",
    description: "Classic strategy game for two players. Try to get three in a row before your opponent!",
    category: "Strategy",
    playTime: 2,
    difficulty: "Easy",
    rating: 4.1,
    popularity: 78,
    thumbnail: "/games/images/tic-tac-toe.jpg",
    url: "#",
    tags: ["strategy", "2-player", "classic", "simple"],
    releasedAt: "2024-02-10",
    features: ["AI opponent", "2-player mode", "Score tracking"],
    scenarios: ["quick", "commute", "office"],
    languages: ["en"],
    fileSize: "22KB",
    developer: "GameGate Team",
    version: "1.0.0"
  },
  {
    id: 107,
    title: "Pixel Art",
    description: "Create beautiful pixel art drawings with various colors and tools in this creative game.",
    category: "Coloring",
    playTime: 15,
    difficulty: "Easy",
    rating: 4.8,
    popularity: 87,
    thumbnail: "/games/images/pixel-art.jpg",
    url: "#",
    tags: ["coloring", "art", "creative", "pixels"],
    releasedAt: "2024-02-15",
    features: ["Multiple canvases", "Color palettes", "Export images", "Undo/Redo"],
    scenarios: ["stress", "bedtime", "focus"],
    languages: ["en"],
    fileSize: "58KB",
    developer: "GameGate Team",
    version: "1.0.0"
  },
  {
    id: 108,
    title: "Number Puzzle",
    description: "Arrange numbered tiles in the correct order with the fewest moves possible.",
    category: "Puzzle",
    playTime: 5,
    difficulty: "Medium",
    rating: 4.4,
    popularity: 83,
    thumbnail: "/games/images/number-puzzle.jpg",
    url: "#",
    tags: ["puzzle", "numbers", "sliding", "logic"],
    releasedAt: "2024-02-20",
    features: ["Multiple grid sizes", "Move counter", "Timer", "Best scores"],
    scenarios: ["focus", "commute", "bedtime"],
    languages: ["en"],
    fileSize: "31KB",
    developer: "GameGate Team",
    version: "1.0.0"
  },
  {
    id: 109,
    title: "Quick Typing",
    description: "Test and improve your typing speed with various texts and difficulty levels.",
    category: "Typing",
    playTime: 3,
    difficulty: "Medium",
    rating: 4.0,
    popularity: 81,
    thumbnail: "/games/images/quick-typing.jpg",
    url: "#",
    tags: ["typing", "speed", "practice", "education"],
    releasedAt: "2024-02-25",
    features: ["WPM tracking", "Accuracy measurement", "Multiple texts", "Progress tracking"],
    scenarios: ["focus", "office", "quick"],
    languages: ["en"],
    fileSize: "26KB",
    developer: "GameGate Team",
    version: "1.0.0"
  },
  {
    id: 110,
    title: "Breakout",
    description: "Break all the bricks using a ball and paddle in this classic arcade game.",
    category: "Shooting",
    playTime: 7,
    difficulty: "Medium",
    rating: 4.5,
    popularity: 89,
    thumbnail: "/games/images/breakout.jpg",
    url: "#",
    tags: ["breakout", "arcade", "paddle", "bricks"],
    releasedAt: "2024-03-01",
    features: ["Power-ups", "Multiple levels", "Sound effects", "High scores"],
    scenarios: ["lunch", "stress", "focus"],
    languages: ["en"],
    fileSize: "42KB",
    developer: "GameGate Team",
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