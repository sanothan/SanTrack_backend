/**
 * MongoDB Database Connection
 * Handles connection to MongoDB with retry logic
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/santrack', {
      // Mongoose 6+ no longer needs these options
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

module.exports = connectDB;
