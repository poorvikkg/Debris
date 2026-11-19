/**
 * db.ts
 * Connects to MongoDB using Mongoose.
 * Uses connection pooling (default: 5 connections).
 * Logs connection status and crashes on failure.
 */

import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.mongoUri, {
      // Mongoose 8+ has sensible defaults, but let's be explicit
      maxPoolSize: 10, // max concurrent connections
    });
    logger.info('✅ MongoDB connected successfully');

    // Seed default admin user if not present (credentials from env or safe dev defaults)
    const { User } = await import('../models/User');
    const seedEmail = process.env.SEED_ADMIN_EMAIL || 'admin@debris.local';
    const seedPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@Debris2026!';
    const adminExists = await User.findOne({ email: seedEmail });
    if (!adminExists) {
      await User.create({
        name: 'Administrator',
        email: seedEmail,
        password: seedPassword,
        role: 'admin',
        isActive: true,
      });
      logger.info(`👤 Seeded default admin account: ${seedEmail} (set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in .env to change)`);
    }
  } catch (error) {
    logger.error({ error }, '❌ MongoDB connection failed');
    process.exit(1); // crash the app — cannot run without DB
  }
}

// Log when mongoose disconnects (e.g. during shutdown)
mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️ MongoDB disconnected');
});
