import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import helmet from 'helmet';
import { config } from './config/config';
import { errorHandler, requestLogger } from './middleware/logging';
import authRouter from './modules/auth/routes/auth.routes';
import adminRouter from './modules/admin/routes/admin.routes';
import attachmentsRouter from './modules/attachments/routes/attachments.routes';
import conversationsRouter from './modules/conversations/routes/conversations.routes';
import friendshipsRouter from './modules/friendships/routes/friendships.routes';
import messagesRouter from './modules/messages/routes/messages.routes';
import notificationsRouter from './modules/notifications/routes/notifications.routes';
import settingsRouter from './modules/settings/routes/settings.routes';
import usersRouter from './modules/users/routes/users.routes';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/friendships', friendshipsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/attachments', attachmentsRouter);
app.use('/api/admin', adminRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use(errorHandler);

export default app;
