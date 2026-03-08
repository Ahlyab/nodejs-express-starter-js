const request = require('supertest');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');

setupTestDB();

describe('Health routes', () => {
  describe('GET /health', () => {
    test('should return 200 and health status', async () => {
      const res = await request(app).get('/health').send().expect(httpStatus.OK);

      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
      expect(res.headers['x-request-id']).toBeDefined();
    });
  });

  describe('GET /health/ready', () => {
    test('should return 200 when database is connected', async () => {
      // setupTestDB connects in beforeAll, so mongoose should already be connected
      expect(mongoose.connection.readyState).toBe(1);

      const res = await request(app).get('/health/ready').send().expect(httpStatus.OK);

      expect(res.body).toHaveProperty('status', 'ready');
      expect(res.body).toHaveProperty('database', 'connected');
    });
  });
});
