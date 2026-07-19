# Chat App Backend

A real-time chat application backend built with Express, TypeScript, Socket.IO, and in-memory data storage.

## Features

- **User Management**: Register, login, and manage user profiles
- **Conversations**: Create and manage group conversations
- **Messaging**: Send and receive messages in real-time
- **Friendships**: Send and manage friend requests
- **Notifications**: Real-time notifications for events
- **Attachments**: Upload and manage file attachments
- **Settings**: User preferences and configuration
- **WebSocket**: Real-time communication with Socket.IO
- **Admin Dashboard**: Admin stats and user management

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- TypeScript

### Installation

```bash
npm install
# or
yarn install
```

### Environment Setup

Copy `.env.example` to `.env` and adjust values:

```bash
cp .env.example .env
```

### Running the Server

Development mode with hot reload:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user profile

### Conversations
- `GET /api/conversations` - List all conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id` - Get conversation by ID

### Messages
- `GET /api/messages/conversation/:conversationId` - Get messages for conversation
- `POST /api/messages/conversation/:conversationId` - Send message

### Friendships
- `GET /api/friendships/:userId` - Get user friendships
- `POST /api/friendships/request` - Send friend request

### Notifications
- `GET /api/notifications/:userId` - Get user notifications
- `POST /api/notifications/:userId` - Create notification
- `PATCH /api/notifications/:notificationId/read` - Mark as read

### Settings
- `GET /api/settings/:userId` - Get user settings
- `PATCH /api/settings/:userId` - Update user settings

### Attachments
- `GET /api/attachments/user/:userId` - Get user attachments
- `POST /api/attachments` - Upload attachment
- `GET /api/attachments/:id` - Get attachment by ID

### Admin
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/users` - List all users (admin)
- `DELETE /api/admin/users/:id` - Delete user (admin)
- `GET /api/admin/conversations` - List all conversations (admin)
- `DELETE /api/admin/conversations/:id` - Delete conversation (admin)

## WebSocket Events

### Client → Server

- `user:join` - User joins (sends userId)
- `conversation:join` - Join conversation (sends conversationId)
- `conversation:leave` - Leave conversation (sends conversationId)
- `message:send` - Send message (sends message data)
- `user:typing` - User is typing (sends conversationId, userId)
- `user:stopped-typing` - User stopped typing (sends conversationId, userId)

### Server → Client

- `message:received` - New message received
- `user:typing` - User is typing
- `user:stopped-typing` - User stopped typing
- `user:online` - User came online
- `user:offline` - User went offline

## Health Check

```bash
GET http://localhost:4000/health
```

## Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts              # Server entry point
├── config/                # Configuration files
├── middleware/            # Express middleware
├── modules/               # Feature modules
│   ├── auth/              # Authentication
│   ├── users/             # User management
│   ├── conversations/     # Conversation management
│   ├── messages/          # Messaging
│   ├── friendships/       # Friend requests
│   ├── notifications/     # Notifications
│   ├── settings/          # User settings
│   ├── attachments/       # File attachments
│   └── admin/             # Admin features
├── socket/                # WebSocket setup
├── utils/                 # Utility functions
└── types/                 # TypeScript type definitions
```

## Development Notes

- Data is stored in-memory, so it resets on server restart
- To persist data, integrate with a database like PostgreSQL + Prisma
- Socket.IO is configured for development CORS settings
- All endpoints use Zod for input validation

## Building for Production

```bash
npm run build
NODE_ENV=production npm start
```

Ensure `.env` file has appropriate production values before deploying.
