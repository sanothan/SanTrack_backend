/**
 * Village API Tests
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Village = require('../src/models/Village');

const TEST_MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/santrack-test';

describe('Village API', () => {
  beforeAll(async () => {
    await mongoose.connect(TEST_MONGODB_URI);
  });

  afterAll(async () => {
    await Village.deleteMany({});
    await mongoose.connection.close();
  });

  it('should return 404 for unauthenticated village list', async () => {
    // Without token, protect middleware returns 401
    const res = await request(app).get('/api/villages');
    expect(res.status).toBe(401);
  });
});
