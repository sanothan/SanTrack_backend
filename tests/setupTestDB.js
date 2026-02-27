const mongoose = require('mongoose');

// Use an in-memory MongoDB server for tests if available, otherwise fall back to local URI
const TEST_MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/santrack-test';

const connectTestDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(TEST_MONGODB_URI);
};

const disconnectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};

module.exports = { connectTestDB, disconnectTestDB };

