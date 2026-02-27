/**
 * Village API Tests
 */

const request = require('supertest');
const app = require('../src/app');
const Village = require('../src/models/Village');
const { connectTestDB, disconnectTestDB } = require('./setupTestDB');

// Only run DB-dependent tests when explicitly enabled
const runDbTests = process.env.RUN_DB_TESTS === 'true';

(runDbTests ? describe : describe.skip)('Village API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await Village.deleteMany({});
    await disconnectTestDB();
  });

  it('should return 404 for unauthenticated village list', async () => {
    // Without token, protect middleware returns 401
    const res = await request(app).get('/api/v1/villages');
    expect(res.status).toBe(401);
  });
});
