const request = require('supertest');
const app = require('../src/index');

describe('Games API', () => {
  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.message).toBe('Welcome to GameGate!');
      expect(response.body.version).toBe('1.0.0');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /games', () => {
    it('should return list of games', async () => {
      const response = await request(app)
        .get('/games')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /games/:id', () => {
    it('should return a specific game', async () => {
      const response = await request(app)
        .get('/games/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('genre');
    });
  });

  describe('POST /games', () => {
    it('should create a new game', async () => {
      const newGame = {
        title: 'Test Game',
        genre: 'Action',
        platform: 'PC'
      };

      const response = await request(app)
        .post('/games')
        .send(newGame)
        .expect(201);

      expect(response.body.title).toBe(newGame.title);
      expect(response.body.genre).toBe(newGame.genre);
      expect(response.body.platform).toBe(newGame.platform);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should return 400 for missing fields', async () => {
      const incompleteGame = {
        title: 'Test Game'
        // missing genre and platform
      };

      const response = await request(app)
        .post('/games')
        .send(incompleteGame)
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
    });
  });
});