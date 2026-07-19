export const config = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  debugMode: process.env.DEBUG_MODE === 'true',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
  allowedOrigins: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    // Production frontend on Vercel
    'https://chat-app-frontend-psi-one.vercel.app',
    ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
  ].filter((v, i, a) => a.indexOf(v) === i), // deduplicate
  mongoUri: process.env.MONGO_URI || 'mongodb+srv://niladrip347_db_user:kL4bgMgFxzG8NZxe@cluster0.9lit3t5.mongodb.net/?appName=Cluster0',
  jwt: {
    secret: process.env.JWT_SECRET || 'replace_me_with_strong_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};
