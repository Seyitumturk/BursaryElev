import mongoose from "mongoose";

const MONGODB_URI = process.env.NODE_ENV === "production" 
  ? process.env.MONGODB_URI_PROD 
  : process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// For better debugging in production
console.log(`Using MongoDB connection for environment: ${process.env.NODE_ENV}`);
console.log(`Connection string exists: ${!!MONGODB_URI}`);

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Declare the global type
declare global {
  // eslint-disable-next-line no-var
  var mongoose: CachedConnection | undefined;
}

let cached: CachedConnection = global.mongoose ?? { conn: null, promise: null };

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    try {
      cached.promise = mongoose.connect(MONGODB_URI as string).then((mongoose) => mongoose);
      console.log("MongoDB connection established successfully");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect; 