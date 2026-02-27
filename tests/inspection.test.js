/**
 * Inspection API Tests
 */

const request = require('supertest');
const app = require('../src/app');

describe('Inspection API', () => {
  it('should require auth for inspections', async () => {
    const res = await request(app).get('/api/v1/inspections');
    expect(res.status).toBe(401);
  });
});
