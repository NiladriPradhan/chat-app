import 'dotenv/config';
import http from 'http';
import app from './app';
import { config } from './config/config';
import { initializeSocketIO } from './socket/socket';
import { logger } from './middleware/logging';
import { connectDatabase } from './config/db';

async function start() {
  try {
    await connectDatabase();

    const server = http.createServer(app);

    // Initialize Socket.IO
    initializeSocketIO(server);

    server.listen(config.port, () => {
      logger.info(`Server started in ${config.nodeEnv} mode`);
      logger.info(`Server listening on http://localhost:${config.port}`);
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection:', { reason });
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', { error: error instanceof Error ? error.message : String(error) });
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err });
    process.exit(1);
  }
}

start();
