// backend/src/__tests__/health.test.js
const request = require('supertest');

// Mock database before importing server
jest.mock('../config/database', () => ({
  query: jest.fn(() => Promise.resolve({ rows: [] })),
}));

// Mock TMDB service
jest.mock('../services/tmdbService', () => ({
  searchMovies: jest.fn(),
  getPopularMovies: jest.fn(),
  getTopRatedMovies: jest.fn(),
  getGenreList: jest.fn(),
  getMovieDetails: jest.fn(),
  getSimilarMovies: jest.fn(),
}));

// Mock auth middleware
jest.mock('../middleware/auth', () => ({
  authenticate: jest.fn((req, res, next) => next()),
  optionalAuthenticate: jest.fn((req, res, next) => next()),
}));

// Now import the app
const app = require('../server');

describe('Health Check Endpoints', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('service', 'CineMatch API');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /', () => {
    it('should return API info', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', '🎬 CineMatch API');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('auth');
      expect(response.body.endpoints).toHaveProperty('movies');
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/nonexistent');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
});
