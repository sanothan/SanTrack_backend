/**
 * User API Tests
 * Run with: npm test
 */

const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const { connectTestDB, disconnectTestDB } = require('./setupTestDB');

// Only run DB-dependent tests when explicitly enabled
const runDbTests = process.env.RUN_DB_TESTS === 'true';

(runDbTests ? describe : describe.skip)('User API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await disconnectTestDB();
  });

  describe('Auth flow', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'communityLeader',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('test@example.com');
      expect(res.body.data.token).toBeDefined();
    });

    it('should login user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });
  });
});
