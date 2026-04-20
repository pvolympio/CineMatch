// backend/src/__tests__/auth.test.js
const request = require('supertest');

// Mock database
jest.mock('../config/database', () => ({
  query: jest.fn(),
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashed_password')),
  compare: jest.fn(() => Promise.resolve(true)),
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock_jwt_token'),
  verify: jest.fn(() => ({ userId: 1, email: 'test@example.com' })),
}));

jest.mock('../services/tmdbService', () => ({}));
jest.mock('../middleware/auth', () => ({
  authenticate: jest.fn((req, res, next) => next()),
  optionalAuthenticate: jest.fn((req, res, next) => next()),
}));

const app = require('../server');
const { query } = require('../config/database');

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid', username: 'testuser', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', username: 'testuser', password: '123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid username', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', username: 'invalid@user', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid', password: 'password' });

      expect(response.status).toBe(400);
    });

    it('should reject missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
    });
  });
});
