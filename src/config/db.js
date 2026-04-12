const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  const fallbackUri = process.env.MONGODB_URI_FALLBACK;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    const isSrvDnsError =
      typeof error?.message === "string" &&
      (error.message.includes("querySrv ENOTFOUND") ||
        error.message.includes("_mongodb._tcp"));

    if (isSrvDnsError && fallbackUri) {
      console.warn("Primary MongoDB SRV lookup failed. Retrying with fallback URI...");
      await mongoose.connect(fallbackUri);
      console.log("MongoDB connected (fallback URI)");
      return;
    }

    throw error;
  }
};

module.exports = connectDB;
