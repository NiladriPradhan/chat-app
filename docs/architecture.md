# Chat App Architecture

## Overview

This is a monorepo-based MERN (MongoDB/PostgreSQL, Express, React, Node.js) chat application built with Turbo.js for optimized build management.

## Project Structure

```
chat-app/
├── apps/
│   ├── client/          # React frontend
│   └── server/          # Express backend
├── packages/
│   ├── shared-types/    # Shared TypeScript types
│   ├── tsconfig/        # Shared tsconfig
│   └── eslint-config/   # Shared ESLint config
├── docs/                # Documentation
├── turbo.json           # Turbo configuration
└── package.json         # Root workspace config
```

## Backend Architecture

### Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Real-time**: Socket.IO
- **Validation**: Zod
- **Security**: Helmet, CORS
- **Data Storage**: In-memory (seed data for demo)
- **Build Tool**: TypeScript Compiler (tsc)

### Directory Structure

```
apps/server/src/
├── app.ts                      # Express app setup
├── server.ts                   # Server entry point
├── config/
│   └── config.ts              # Configuration management
├── middleware/
│   └── logging.ts             # Request logging & error handling
├── modules/
│   ├── auth/
│   │   ├── routes/
│   │   ├── controllers/       # (skeleton)
│   │   ├── services/          # (skeleton)
│   │   ├── validators/        # (skeleton)
│   │   └── dtos/              # (skeleton)
│   ├── users/
│   ├── conversations/
│   ├── messages/
│   ├── friendships/
│   ├── notifications/
│   ├── settings/
│   ├── attachments/
│   └── admin/
├── socket/
│   └── socket.ts              # Socket.IO configuration
├── utils/
│   └── inMemoryStore.ts       # In-memory data storage
├── types/                      # (for custom types)
└── validators/                 # (for shared validators)
```

### Module Structure

Each module follows a consistent structure:

```
module/
├── routes/          # Express Router definitions
├── controllers/     # Request handlers (business logic)
├── services/        # Business logic layer
├── repositories/    # Data access layer
├── dtos/           # Request/Response schema validation
├── types/          # TypeScript interfaces
└── validators/     # Input validation schemas
```

**Note**: Currently routes are implemented. Controllers, services, and repositories are scaffolded for future Prisma/database integration.

## Frontend Architecture

### Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux/Zustand (to be implemented)
- **WebSocket**: Socket.IO Client
- **Styling**: TailwindCSS (recommended)

### Directory Structure

```
apps/client/src/
├── App.tsx                 # Root component
├── main.tsx               # Entry point
├── components/            # Reusable components
├── config/               # Configuration
├── features/
│   ├── auth/            # Authentication feature
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── store/
│   └── chat/            # Chat feature
│       ├── api/
│       ├── components/
│       ├── hooks/
│       └── store/
├── hooks/               # Custom React hooks
├── router/              # Routing configuration
├── store/               # Global state management
├── styles/              # Global styles
└── utils/               # Utility functions
```

## Data Flow

### Authentication Flow

```
Client (React)
    ↓
POST /api/auth/register or /api/auth/login
    ↓
Server (Express)
    ↓
authRouter handles validation with Zod
    ↓
Returns user data + token
    ↓
Client stores token in localStorage/cookie
    ↓
Includes token in subsequent requests
```

### Real-time Messaging Flow

```
Client A (React)
    ↓
socket.emit('message:send', messageData)
    ↓
Socket.IO Server
    ↓
Broadcasts to conversation room
    ↓
socket.on('message:received')
    ↓
Client A & other clients in conversation receive message
    ↓
Update chat UI
```

### HTTP Request Flow

```
Client Request
    ↓
CORS & Helmet middleware
    ↓
Express parser (JSON/URL-encoded)
    ↓
Request logger middleware
    ↓
Route handler (e.g., /api/users/:id)
    ↓
Zod validation
    ↓
In-memory store operations
    ↓
JSON response
    ↓
Error handler (if needed)
    ↓
Client receives response
```

## API Endpoints

### Core Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Server health check |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/users` | List all users |
| POST | `/api/conversations` | Create conversation |
| POST | `/api/messages/conversation/:id` | Send message |
| GET | `/api/friendships/:userId` | Get friendships |
| POST | `/api/friendships/request` | Send friend request |

See [API Documentation](./api.md) for complete endpoint details.

## WebSocket Events

### Namespace: Global

- `user:join` - User connects with userId
- `conversation:join` - Join conversation room
- `conversation:leave` - Leave conversation room
- `message:send` - Send message to conversation
- `user:typing` - Broadcast typing status
- `user:stopped-typing` - Broadcast stopped typing

### Broadcast Events

- `message:received` - New message in conversation
- `user:online` - User came online
- `user:offline` - User went offline

## State Management (Planned)

### Frontend State Layers

```
Global State (Redux/Zustand)
├── Auth
│   ├── user
│   ├── token
│   └── isAuthenticated
├── Chat
│   ├── conversations
│   ├── messages
│   └── currentConversation
└── UI
    ├── theme
    └── notifications
```

## Middleware & Security

### Implemented

- **Helmet**: Secure HTTP headers
- **CORS**: Cross-Origin Resource Sharing with whitelist
- **Body Parser**: JSON/URL-encoded request parsing
- **Request Logger**: HTTP request logging

### To Implement (Production)

- Authentication middleware (JWT)
- Authorization checks (Role-based)
- Rate limiting
- Input sanitization
- Request validation

## Development Workflow

### Setup

```bash
# Install dependencies
npm install

# Copy env files
cp apps/server/.env.example apps/server/.env

# Build everything
npm run build
```

### Development

```bash
# Development mode with hot reload (from root or each app)
npm run dev

# From specific app
cd apps/server && npm run dev
cd apps/client && npm run dev
```

### Production

```bash
# Build all apps
npm run build

# Start server
cd apps/server && NODE_ENV=production npm start

# Serve static client build or deploy separately
```

## Database Integration (Future)

Currently uses in-memory storage. To add database support:

1. **Install Prisma**:
   ```bash
   npm install -D prisma @prisma/client
   npx prisma init
   ```

2. **Define Schema**: Create `schema.prisma`

3. **Replace Data Layer**:
   - Replace `inMemoryStore.ts` with Prisma queries
   - Implement repositories for each module
   - Keep route handlers mostly unchanged (drop-in replacement)

4. **Migration**:
   ```bash
   npx prisma migrate dev --name init
   ```

## Performance Considerations

- In-memory storage resets on server restart
- No pagination implemented (add for production)
- No caching layer (add Redis for scale)
- Socket.IO rooms for efficient broadcasting
- No database indexes (define after adding Prisma)

## Scaling Strategy

### Phase 1: Current
- Single server instance
- In-memory data
- Direct Socket.IO connections

### Phase 2: Database
- PostgreSQL with Prisma
- Persistent data
- Connection pooling

### Phase 3: Distributed
- Redis for caching & sessions
- Socket.IO adapter for cluster support
- Load balancer
- Separate frontend CDN

### Phase 4: Enterprise
- Message queue (RabbitMQ/Kafka)
- Microservices architecture
- GraphQL (if needed)
- Full observability stack

## Monitoring & Logging

### Current

- Console logging with timestamps
- Request logging middleware
- Error handler with logging

### Production Ready

- Structured logging (Winston, Bunyan)
- Centralized logging (ELK, Datadog)
- Error tracking (Sentry)
- APM (Application Performance Monitoring)
- Health check endpoints

## Security Checklist

- [ ] Implement JWT authentication
- [ ] Add role-based authorization
- [ ] Rate limiting
- [ ] Input validation & sanitization
- [ ] SQL injection prevention (once DB integrated)
- [ ] HTTPS only
- [ ] Secure session handling
- [ ] Password hashing (bcrypt)
- [ ] CSRF protection
- [ ] XSS prevention

## Contributors

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.
