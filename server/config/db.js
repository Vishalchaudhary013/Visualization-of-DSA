import mongoose from "mongoose";

/**
 * Connects to MongoDB when MONGODB_URI is set. Without it the app still runs;
 * only accounts and history are unavailable (their routes answer 503).
 */
export async function connectDb(uri = process.env.MONGODB_URI) {
  if (!uri) {
    console.warn("MONGODB_URI is not set: accounts and history are disabled.");
    return false;
  }
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
    return true;
  } catch (error) {
    console.error(`Could not connect to MongoDB: ${error.message}`);
    return false;
  }
}

export const isDbConnected = () => mongoose.connection.readyState === 1;
