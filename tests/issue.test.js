/**
 * Issue API Tests
 */

const request = require('supertest');
const app = require('../src/app');

describe('Issue API', () => {
  it('should require auth for issues', async () => {
    const res = await request(app).get('/api/issues');
    expect(res.status).toBe(401);
  });
});
