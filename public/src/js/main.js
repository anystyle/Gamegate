// GameGate 前端主要逻辑
class GameGate {
    constructor() {
        this.api = new GameAPI();
        this.user = new UserManager();
        this.games = new GameManager();
        this.ui = new UIManager();

        this.init();
    }

    async init() {
        await this.user.init();
        await this.loadInitialData();
        this.bindEvents();
        this.ui.showLoading(false);
    }

    async loadInitialData() {
        try {
            // 并行加载初始数据
            const [games, recommendations, categories] = await Promise.all([
                this.api.getGames({ limit: 12 }),
                this.api.getRecommendations(),
                this.api.getCategories()
            ]);

            this.games.setGames(games.games);
            this.games.setCategories(categories.categories);
            this.ui.renderRecommendedGames(recommendations.games);
            this.ui.renderGamesGrid(games.games);
            this.ui.updateGameCount(games.pagination.totalItems);

            // 设置默认场景
            this.setScenario('通勤');
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.ui.showError('加载游戏失败，请刷新重试');
        }
    }

    bindEvents() {
        // 场景切换
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const scenario = e.target.dataset.scenario;
                this.setScenario(scenario);
            });
        });

        // 分类筛选
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterByCategory(category);
            });
        });

        // 搜索
        const searchInput = document.getElementById('searchInput');
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchGames(e.target.value);
            }, 300);
        });

        // 时间筛选
        document.getElementById('timeFilter').addEventListener('change', (e) => {
            this.filterByTime(e.target.value);
        });

        // 排序
        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.sortGames(e.target.value);
        });

        // 加载更多
        document.getElementById('loadMoreBtn').addEventListener('click', () => {
            this.loadMoreGames();
        });

        // 刷新推荐
        document.getElementById('refreshRecommendations').addEventListener('click', () => {
            this.refreshRecommendations();
        });

        // 游戏弹窗
        document.getElementById('closeGameModal').addEventListener('click', () => {
            this.closeGameModal();
        });

        // 点击外部关闭弹窗
        document.getElementById('gameModal').addEventListener('click', (e) => {
            if (e.target.id === 'gameModal') {
                this.closeGameModal();
            }
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeGameModal();
            }
        });
    }

    setScenario(scenario) {
        // 更新按钮状态
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            if (btn.dataset.scenario === scenario) {
                btn.className = 'scenario-btn px-3 py-1 text-sm rounded-full bg-primary text-white';
            } else {
                btn.className = 'scenario-btn px-3 py-1 text-sm rounded-full hover:bg-gray-200 transition-colors';
            }
        });

        // 加载场景推荐游戏
        this.loadScenarioGames(scenario);

        // 更新用户偏好
        this.user.updatePreference('scenario', scenario);
    }

    async loadScenarioGames(scenario) {
        try {
            const response = await this.api.getScenarioGames(scenario);
            this.ui.renderRecommendedGames(response.games);
            this.ui.updateRecommendationReason(`最适合${scenario}时间`);
        } catch (error) {
            console.error('Failed to load scenario games:', error);
        }
    }

    async filterByCategory(category) {
        // 更新按钮状态
        document.querySelectorAll('.category-btn').forEach(btn => {
            if (btn.dataset.category === category) {
                btn.className = 'category-btn px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:shadow-md transition-shadow';
            } else {
                btn.className = 'category-btn px-4 py-2 bg-white rounded-full text-sm font-medium hover:shadow-md transition-shadow';
            }
        });

        await this.loadGames({ category });
    }

    async filterByTime(maxTime) {
        await this.loadGames({ maxTime: maxTime === '30' ? null : maxTime });
    }

    async sortGames(sortBy) {
        this.games.sortGames(sortBy);
        this.ui.renderGamesGrid(this.games.getFilteredGames());
    }

    async searchGames(query) {
        if (!query.trim()) {
            this.games.setSearchQuery(null);
            this.ui.renderGamesGrid(this.games.getFilteredGames());
            return;
        }

        this.ui.showLoading(true);

        try {
            const response = await this.api.searchGames(query);
            this.games.setSearchResults(response.results);
            this.ui.renderGamesGrid(response.results);
            this.ui.updateGameCount(response.count);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            this.ui.showLoading(false);
        }
    }

    async loadMoreGames() {
        const currentPage = this.games.getCurrentPage();
        await this.loadGames({ page: currentPage + 1 }, true);
    }

    async loadGames(filters = {}, append = false) {
        this.ui.showLoading(true);

        try {
            const response = await this.api.getGames({
                ...filters,
                limit: 12
            });

            if (append) {
                this.games.appendGames(response.games);
            } else {
                this.games.setFilteredGames(response.games);
            }

            if (!append) {
                this.ui.renderGamesGrid(response.games);
            } else {
                this.ui.appendGames(response.games);
            }

            this.ui.updateGameCount(response.pagination.totalItems);

            // 更新加载更多按钮状态
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (!response.pagination.hasNext) {
                loadMoreBtn.textContent = '没有更多游戏了';
                loadMoreBtn.disabled = true;
                loadMoreBtn.className = 'px-6 py-2 bg-gray-200 text-gray-500 rounded-full cursor-not-allowed';
            }

        } catch (error) {
            console.error('Failed to load games:', error);
            this.ui.showError('加载游戏失败');
        } finally {
            this.ui.showLoading(false);
        }
    }

    async refreshRecommendations() {
        const refreshBtn = document.getElementById('refreshRecommendations');
        refreshBtn.classList.add('animate-spin');

        try {
            const recommendations = await this.api.getRecommendations();
            this.ui.renderRecommendedGames(recommendations.games);
        } catch (error) {
            console.error('Failed to refresh recommendations:', error);
        } finally {
            refreshBtn.classList.remove('animate-spin');
        }
    }

    openGameModal(gameId) {
        const game = this.games.getGameById(gameId);
        if (!game) return;

        // 更新模态框内容
        document.getElementById('gameTitle').textContent = game.title;
        document.getElementById('gameMeta').textContent = `${game.category} • ${game.playTime}分钟 • ${game.difficulty}`;
        document.getElementById('gamePlayTime').textContent = game.playTime;
        document.getElementById('gameDifficulty').textContent = game.difficulty;

        // 加载游戏
        const gameFrame = document.getElementById('gameFrame');
        const gameLoading = document.getElementById('gameLoading');

        gameLoading.style.display = 'flex';
        gameFrame.style.display = 'none';

        gameFrame.src = game.url;

        gameFrame.onload = () => {
            gameLoading.style.display = 'none';
            gameFrame.style.display = 'block';

            // 记录游戏开始
            this.user.recordGamePlay(game.id);
        };

        gameFrame.onerror = () => {
            gameLoading.innerHTML = `
                <div class="text-center">
                    <p class="text-red-500 mb-2">游戏加载失败</p>
                    <button onclick="window.location.reload()" class="px-4 py-2 bg-primary text-white rounded-full">
                        重新加载
                    </button>
                </div>
            `;
        };

        // 显示模态框
        document.getElementById('gameModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeGameModal() {
        const gameFrame = document.getElementById('gameFrame');
        const gameModal = document.getElementById('gameModal');

        // 停止游戏
        gameFrame.src = '';

        // 隐藏模态框
        gameModal.classList.add('hidden');
        document.body.style.overflow = 'auto';

        // 记录游戏时长（简化处理，实际需要更精确的计时）
        const gameLoading = document.getElementById('gameLoading');
        gameLoading.innerHTML = `
            <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p class="text-gray-600">游戏加载中...</p>
            </div>
        `;
    }

    likeGame(gameId) {
        const game = this.games.getGameById(gameId);
        if (!game) return;

        const likeBtn = document.getElementById('gameLikeBtn');
        const svg = likeBtn.querySelector('svg');

        // 切换喜欢状态
        if (svg.classList.contains('text-red-500')) {
            svg.classList.remove('text-red-500');
            svg.classList.add('text-gray-400');
        } else {
            svg.classList.remove('text-gray-400');
            svg.classList.add('text-red-500');
        }

        // 更新用户偏好
        this.user.addFavoriteGame(gameId);
    }

    shareGame(gameId) {
        const game = this.games.getGameById(gameId);
        if (!game) return;

        // 生成分享链接
        const shareUrl = `${window.location.origin}?game=${gameId}`;
        const shareText = `我在GameGate玩${game.title}，超好玩！${shareUrl}`;

        // 检查是否支持Web Share API
        if (navigator.share) {
            navigator.share({
                title: game.title,
                text: shareText,
                url: shareUrl
            });
        } else {
            // 复制到剪贴板
            navigator.clipboard.writeText(shareText).then(() => {
                this.ui.showSuccess('分享链接已复制到剪贴板');
            });
        }
    }
}

// API管理类
class GameAPI {
    constructor() {
        this.baseURL = '/api';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': this.getSessionId(),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    getSessionId() {
        return localStorage.getItem('gamegate_session') || 'anonymous';
    }

    async getGames(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/games?${query}`);
    }

    async getGame(id) {
        return this.request(`/games/${id}`);
    }

    async getScenarioGames(scenario, params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/games/scenario/${scenario}?${query}`);
    }

    async getQuickGames(minutes = 5) {
        return this.request(`/games/quick/${minutes}`);
    }

    async searchGames(query, params = {}) {
        const searchParams = new URLSearchParams({ ...params, query }).toString();
        return this.request(`/games/search/${encodeURIComponent(query)}?${searchParams}`);
    }

    async getRecommendations() {
        return this.request(`/recommendations`);
    }

    async getCategories() {
        return this.request(`/categories`);
    }

    async getUserProfile() {
        return this.request('/user/profile');
    }

    async updatePreferences(preferences) {
        return this.request('/user/preferences', {
            method: 'POST',
            body: JSON.stringify(preferences)
        });
    }

    async recordGamePlay(gameData) {
        return this.request('/user/play-game', {
            method: 'POST',
            body: JSON.stringify(gameData)
        });
    }

    async getUserStats() {
        return this.request('/user/stats');
    }
}

// 用户管理类
class UserManager {
    constructor() {
        this.sessionId = null;
        this.userData = null;
        this.preferences = {
            favoriteCategories: [],
            playTimePreference: 5,
            difficulty: '简单',
            scenario: '通勤'
        };
    }

    async init() {
        this.sessionId = this.getOrCreateSession();

        try {
            const response = await gameGate.api.getUserProfile();
            this.userData = response.user;
            this.preferences = { ...this.preferences, ...response.user.preferences };
        } catch (error) {
            console.error('Failed to load user profile:', error);
        }
    }

    getOrCreateSession() {
        let sessionId = localStorage.getItem('gamegate_session');

        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('gamegate_session', sessionId);
        }

        return sessionId;
    }

    async updatePreference(key, value) {
        this.preferences[key] = value;

        try {
            await gameGate.api.updatePreferences({ [key]: value });
        } catch (error) {
            console.error('Failed to update preference:', error);
        }
    }

    async recordGamePlay(gameId) {
        // 记录游戏开始时间，实际结束时再计算时长
        this.currentGame = {
            gameId,
            startTime: Date.now()
        };
    }

    async recordGameEnd(gameId, playTime, completed = false, rating = null) {
        try {
            await gameGate.api.recordGamePlay({
                gameId,
                playTime,
                completed,
                rating
            });
        } catch (error) {
            console.error('Failed to record game play:', error);
        }
    }

    addFavoriteGame(gameId) {
        if (!this.preferences.favoriteCategories.includes(gameId)) {
            this.preferences.favoriteCategories.push(gameId);
        }
    }
}

// 游戏管理类
class GameManager {
    constructor() {
        this.allGames = [];
        this.filteredGames = [];
        this.categories = [];
        this.currentPage = 1;
        this.filters = {};
        this.searchQuery = null;
    }

    setGames(games) {
        this.allGames = games;
        this.filteredGames = games;
    }

    setFilteredGames(games) {
        this.filteredGames = games;
        this.currentPage = 1;
    }

    appendGames(games) {
        this.filteredGames = [...this.filteredGames, ...games];
        this.currentPage++;
    }

    setSearchResults(results) {
        this.filteredGames = results;
        this.searchQuery = results;
    }

    setSearchQuery(query) {
        this.searchQuery = query;
    }

    setCategories(categories) {
        this.categories = categories;
    }

    getGameById(id) {
        return this.allGames.find(game => game.id === id);
    }

    getFilteredGames() {
        return this.filteredGames;
    }

    getCurrentPage() {
        return this.currentPage;
    }

    sortGames(sortBy) {
        switch (sortBy) {
            case 'rating':
                this.filteredGames.sort((a, b) => b.rating - a.rating);
                break;
            case 'playTime':
                this.filteredGames.sort((a, b) => a.playTime - b.playTime);
                break;
            case 'newest':
                this.filteredGames.sort((a, b) => new Date(b.releasedAt) - new Date(a.releasedAt));
                break;
            case 'popularity':
            default:
                this.filteredGames.sort((a, b) => b.popularity - a.popularity);
        }
    }
}

// UI管理类
class UIManager {
    showLoading(show) {
        // 全局加载状态
        document.querySelectorAll('.loading-indicator').forEach(el => {
            el.style.display = show ? 'block' : 'none';
        });
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-full shadow-lg z-50 text-white animate-bounce-slow ${
            type === 'error' ? 'bg-red-500' :
            type === 'success' ? 'bg-green-500' : 'bg-blue-500'
        }`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    renderGamesGrid(games) {
        const grid = document.getElementById('gamesGrid');
        grid.innerHTML = '';

        games.forEach(game => {
            const card = this.createGameCard(game);
            grid.appendChild(card);
        });
    }

    appendGames(games) {
        const grid = document.getElementById('gamesGrid');

        games.forEach(game => {
            const card = this.createGameCard(game);
            grid.appendChild(card);
        });
    }

    createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group';
        card.innerHTML = `
            <div class="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                <div class="absolute inset-0 flex items-center justify-center">
                    <div class="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center animate-pulse-slow">
                        <span class="text-2xl">${this.getGameIcon(game.category)}</span>
                    </div>
                </div>
                <div class="absolute top-2 right-2 px-2 py-1 bg-white/90 rounded-full text-xs font-medium">
                    ${game.playTime}分钟
                </div>
                <div class="absolute top-2 left-2 px-2 py-1 bg-${this.getDifficultyColor(game.difficulty)}-100 text-${this.getDifficultyColor(game.difficulty)}-700 rounded-full text-xs font-medium">
                    ${game.difficulty}
                </div>
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">${game.title}</h3>
                <p class="text-sm text-gray-600 mb-2 line-clamp-2">${game.description}</p>
                <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center space-x-2">
                        <span class="text-gray-500">${game.category}</span>
                        <span class="text-gray-400">•</span>
                        <div class="flex items-center">
                            <svg class="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                            <span class="text-gray-700">${game.rating}</span>
                        </div>
                    </div>
                    <div class="flex items-center space-x-1">
                        ${game.features.includes('无广告') ? '<span class="text-green-500">✓ 无广告</span>' : ''}
                    </div>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            gameGate.openGameModal(game.id);
        });

        return card;
    }

    renderRecommendedGames(games) {
        const container = document.getElementById('recommendedGames');
        container.innerHTML = '';

        games.forEach(game => {
            const card = this.createRecommendedCard(game);
            container.appendChild(card);
        });
    }

    createRecommendedCard(game) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-3 cursor-pointer';
        card.innerHTML = `
            <div class="aspect-square bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg mb-2 relative overflow-hidden">
                <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-3xl">${this.getGameIcon(game.category)}</span>
                </div>
                <div class="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <h4 class="font-medium text-sm text-gray-900 mb-1 truncate">${game.title}</h4>
            <p class="text-xs text-gray-500">${game.playTime}分钟 • ${game.difficulty}</p>
            ${game.recommendationReason ? `<p class="text-xs text-primary mt-1">${game.recommendationReason}</p>` : ''}
        `;

        card.addEventListener('click', () => {
            gameGate.openGameModal(game.id);
        });

        return card;
    }

    getGameIcon(category) {
        const icons = {
            '益智': '🧩',
            '消除': '🎯',
            '打字': '⌨️',
            '反应': '⚡',
            '记忆': '🧠',
            '策略': '♟️',
            '填色': '🎨',
            '模拟': '🎮'
        };
        return icons[category] || '🎮';
    }

    getDifficultyColor(difficulty) {
        const colors = {
            '简单': 'green',
            '中等': 'yellow',
            '困难': 'red'
        };
        return colors[difficulty] || 'gray';
    }

    updateGameCount(count) {
        document.getElementById('gameCount').textContent = count;
    }

    updateRecommendationReason(reason) {
        document.getElementById('recommendationReason').textContent = reason;
    }
}

// 初始化应用
let gameGate;

document.addEventListener('DOMContentLoaded', () => {
    gameGate = new GameGate();
});

// 导出供外部使用
window.gameGate = gameGate;