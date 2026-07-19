import mongoose from 'mongoose';
import { config } from './config';
import { logger } from '../middleware/logging';
import dns from 'dns';

export async function connectDatabase() {
  const uri = process.env.MONGO_URI || config.mongoUri;
  if (!uri) {
    throw new Error('MONGO_URI is not defined');
  }

  // Force IPv4 and use public DNS to resolve MongoDB Atlas SRV records
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
    });
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('Failed to connect to MongoDB', { error: err });
    throw err;
  }
}
