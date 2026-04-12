require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is required");
    }

    await connectDB();
    app.listen(port, () => {
      const publicUrl = process.env.PUBLIC_BASE_URL;
      if (publicUrl) {
        console.log(`SanTrack server listening on port ${port} (public: ${publicUrl})`);
      } else {
        console.log(`SanTrack server running locally on http://localhost:${port}`);
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
