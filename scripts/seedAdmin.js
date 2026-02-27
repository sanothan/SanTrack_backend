require('dotenv').config();

const connectDB = require('../src/config/db');
const User = require('../src/models/User');

const run = async () => {
  try {
    await connectDB();

    const email = 'admin@santrack.local';
    const existing = await User.findOne({ email });

    if (existing) {
      console.log(`Admin user already exists: ${email}`);
    } else {
      const user = await User.create({
        name: 'System Administrator',
        email,
        password: 'Admin@123', // will be hashed by the model hook
        role: 'admin',
        isActive: true,
      });

      console.log('Admin user created successfully:');
      console.log(`Email: ${user.email}`);
      console.log('Password: Admin@123');
    }
  } catch (err) {
    console.error('Failed to seed admin user:', err);
  } finally {
    process.exit(0);
  }
};

run();

