const express = require('express');
const mongoose = require('mongoose');
const httpStatus = require('http-status');

const router = express.Router();

/**
 * Health check - returns 200 if server is running
 * GET /health
 */
router.get('/', (req, res) => {
  res.status(httpStatus.OK).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Readiness check - returns 200 if app is ready to accept traffic (DB connected)
 * GET /health/ready
 */
router.get('/ready', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(httpStatus.SERVICE_UNAVAILABLE).json({
        status: 'unavailable',
        reason: 'Database not connected',
      });
    }
    res.status(httpStatus.OK).json({
      status: 'ready',
      database: 'connected',
    });
  } catch (err) {
    res.status(httpStatus.SERVICE_UNAVAILABLE).json({
      status: 'unavailable',
      reason: err.message,
    });
  }
});

module.exports = router;
