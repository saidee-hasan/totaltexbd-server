import mongoose from 'mongoose';
import { ENV } from './env.js';

let connectionPromise: Promise<typeof mongoose> | null = null;

/**
 * Connects to MongoDB and caches the connection.
 * Safe to call on every request — required for serverless environments
 * (e.g. Vercel) where the module may be re-imported per invocation.
 */
export const connectDB = async (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(ENV.MONGODB_URI)
      .then((conn) => {
        console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
      })
      .catch((error) => {
        console.error('[Database] MongoDB connection error:', error);
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
};

