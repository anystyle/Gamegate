# GameGate - Lite Stress-Relief Mini Games Platform

> Play instantly, no-burden casual fun - Lite mini games designed for fragmented time

![GameGate](https://img.shields.io/badge/GameGate-Lite%20Games%20Platform-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)

## 🎮 Product Positioning

**Target Users**: Students and professionals aged 18-35
**Usage Scenarios**: Commute, lunch break, office, stress relief, bedtime, focus
**Core Philosophy**: Instant play, ad-free, no-burden casual fun
**Game Features**: 3-10 minute quick games, lightweight design, touch-optimized

## ✨ Core Features

### 🎯 Scenario-Based Recommendations
- **Commute Games** (2-5 min): Quick games suitable for public transport
- **Lunch Break Games** (5-10 min): Strategic games for lunch breaks
- **Office Games** (Pausable anytime): Discreet office-friendly games
- **Stress Relief Games** (Healing): Relaxing therapeutic games
- **Bedtime Games** (Relaxing): Calm games before sleep
- **Focus Games** (Reaction): Quick reaction games for mental refresh

### 📱 Game Categories
- **Puzzle**: 2048, Sudoku, Jigsaw, etc.
- **Match-3**: Bubble Crush, Bubble Shooter, etc.
- **Memory**: Memory Match, Pairing Games
- **Strategy**: Minesweeper, Board Games
- **Reaction**: Whack-a-Mole, Reaction Tests
- **Coloring**: Number Coloring, Creative Drawing
- **Simulation**: Fishing Simulator, Collection Games
- **Typing**: Speed Typing, Word Games

### 🚀 Technical Features
- **Lightweight**: Games < 500KB, loading time < 2 seconds
- **Responsive**: Perfect adaptation for phones, tablets, desktop
- **Touch-Optimized**: Touch device-optimized controls
- **Ad-Free**: Pure gaming experience without intrusive ads
- **Local Storage**: Auto-save progress, resume anytime
- **Offline Support**: Play offline, no internet required

### 👤 Personalized Experience
- **Smart Recommendations**: Personalized recommendations based on time, difficulty, scenario
- **Game Statistics**: Record play time, completion, preference analysis
- **Achievement System**: Game achievements collection, continuous motivation
- **Favorites Management**: One-click favorite games collection

## 🛠️ Technical Architecture

### Backend (Node.js + Express)
```
src/
├── server.js           # Main server
├── routes/             # API routes
│   ├── games.js        # Game management API
│   ├── categories.js   # Category management API
│   └── user.js         # User management API
├── data/               # Data layer
│   └── games.js        # Game database
└── middleware/         # Middleware
    ├── auth.js         # Authentication middleware
    └── cache.js        # Cache middleware
```

### Frontend (Vanilla JS + Vite)
```
public/
├── index.html          # Main page
├── src/
│   ├── js/
│   │   ├── main.js     # Main application logic
│   │   ├── api.js      # API wrapper
│   │   ├── game.js     # Game management
│   │   └── ui.js       # UI management
│   └── styles/
│       └── main.css    # Style sheets
├── games/              # Game resources
│   ├── 2048/
│   ├── bubble-crush/
│   ├── memory-game/
│   └── ...
└── manifest.json       # PWA configuration
```

### Game Engine
- **Pure HTML5**: Canvas, CSS3 animations
- **Lightweight**: No third-party dependencies, single-file games
- **Standardized**: Unified game API and communication protocol
- **Cache Optimized**: Smart preloading and local caching

## 🚀 Quick Start

### Requirements
- Node.js >= 16.0.0
- npm >= 7.0.0

### Install Dependencies
```bash
git clone https://github.com/your-username/gamegate.git
cd gamegate
npm install
```

### Configure Environment Variables
```bash
cp .env.example .env
# Edit .env file, configure server port and other settings
```

### Start Development Server
```bash
# Start both frontend and backend development servers
npm run dev

# Or start separately
npm run dev:server  # Backend server (http://localhost:3000)
npm run dev:client  # Frontend dev server (http://localhost:5173)
```

### Build Production Version
```bash
npm run build
npm start
```

## 📚 API Documentation

### Games API
```http
GET /api/games               # Get game list
GET /api/games/:id           # Get game details
GET /api/games/scenario/:scenario  # Scenario-based game recommendations
GET /api/games/quick/:minutes     # Quick game recommendations
GET /api/games/search/:query      # Search games
```

### Categories API
```http
GET /api/categories          # Get game categories
GET /api/categories/:name    # Get category games
GET /api/categories/recommended/:scenario  # Recommended categories
```

### User API
```http
GET /api/user/profile        # Get user profile
POST /api/user/preferences   # Update user preferences
POST /api/user/play-game     # Record game play
GET /api/user/recommendations # Get recommendations
GET /api/user/stats          # Get user statistics
```

## 🎯 Game Development Guide

### Add New Game
1. Create game directory: `public/games/your-game/`
2. Create `index.html` game file
3. Update `src/data/games.js` add game information
4. Test game compatibility

### Game Template Structure
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game Name - GameGate</title>
    <!-- Game styles -->
</head>
<body>
    <!-- Game content -->
    <script>
        // Game logic
        // Notify parent application that game has loaded
        window.parent.postMessage({ type: 'gameLoaded', game: 'your-game' }, '*');
    </script>
</body>
</html>
```

### Game Communication Protocol
```javascript
// Game loaded
window.parent.postMessage({
    type: 'gameLoaded',
    game: 'game-name',
    playTime: 5  // Estimated play time in minutes
}, '*');

// Game ended
window.parent.postMessage({
    type: 'gameEnded',
    game: 'game-name',
    score: 1000,
    completed: true,
    timeSpent: 180  // Actual play time in seconds
}, '*');
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run test coverage
npm run test:coverage

# Run ESLint checks
npm run lint
```

## 📦 Deployment

### Docker Deployment
```bash
# Build image
docker build -t gamegate .

# Run container
docker run -p 3000:3000 gamegate
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Traditional Server Deployment
```bash
# Build production version
npm run build

# Start server
NODE_ENV=production npm start
```

## 🤝 Contributing Guidelines

1. Fork this repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Create Pull Request

### Code Standards
- Use ESLint for code checking
- Follow JavaScript Standard Style
- Keep game files under 500KB
- Ensure mobile compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Thanks to all developers who contributed game code
- Thanks to Tailwind CSS for the styling framework
- Thanks to Vite for the build tools

## 📞 Contact Us

- Project Homepage: [https://github.com/your-username/gamegate](https://github.com/your-username/gamegate)
- Issue Feedback: [Issues](https://github.com/your-username/gamegate/issues)
- Email: your-email@example.com

---

**GameGate** - Making fragmented time more interesting! 🎮✨