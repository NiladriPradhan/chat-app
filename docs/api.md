# Chat App API Documentation

## Base URL

```
http://localhost:4000
```

## Response Format

All responses are JSON with the following structure:

### Success Response
```json
{
  "data": {},
  "message": "Success"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": {}
}
```

## Authentication Endpoints

### Register User
`POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-abc123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "user-abc123.token"
}
```

### Login
`POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-abc123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "user-abc123.token"
}
```

### Get Current User
`GET /api/auth/me?userId=user-abc123`

**Response:**
```json
{
  "user": {
    "id": "user-abc123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## User Endpoints

### List All Users
`GET /api/users`

**Response:**
```json
{
  "users": [
    {
      "id": "user-abc123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
```

### Get User by ID
`GET /api/users/:id`

**Response:**
```json
{
  "user": {
    "id": "user-abc123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Update User
`PATCH /api/users/:id`

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-abc123",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

## Conversation Endpoints

### List All Conversations
`GET /api/conversations`

**Response:**
```json
{
  "conversations": [
    {
      "id": "conversation-xyz789",
      "title": "General Chat",
      "participantIds": ["user-abc123", "user-def456"],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Create Conversation
`POST /api/conversations`

**Request Body:**
```json
{
  "title": "Team Discussion",
  "participantIds": ["user-abc123", "user-def456"]
}
```

**Response:**
```json
{
  "conversation": {
    "id": "conversation-xyz789",
    "title": "Team Discussion",
    "participantIds": ["user-abc123", "user-def456"],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Conversation by ID
`GET /api/conversations/:id`

**Response:**
```json
{
  "conversation": {
    "id": "conversation-xyz789",
    "title": "Team Discussion",
    "participantIds": ["user-abc123", "user-def456"],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

## Message Endpoints

### Get Messages by Conversation
`GET /api/messages/conversation/:conversationId`

**Response:**
```json
{
  "messages": [
    {
      "id": "message-123",
      "conversationId": "conversation-xyz789",
      "authorId": "user-abc123",
      "content": "Hello everyone!",
      "createdAt": "2024-01-15T10:31:00Z"
    }
  ]
}
```

### Send Message
`POST /api/messages/conversation/:conversationId`

**Request Body:**
```json
{
  "authorId": "user-abc123",
  "content": "Hello everyone!"
}
```

**Response:**
```json
{
  "message": {
    "id": "message-123",
    "conversationId": "conversation-xyz789",
    "authorId": "user-abc123",
    "content": "Hello everyone!",
    "createdAt": "2024-01-15T10:31:00Z"
  }
}
```

## Friendship Endpoints

### Get User Friendships
`GET /api/friendships/:userId`

**Response:**
```json
{
  "friendships": [
    {
      "id": "friendship-456",
      "userId": "user-abc123",
      "friendId": "user-def456",
      "status": "accepted",
      "createdAt": "2024-01-15T10:32:00Z"
    }
  ]
}
```

### Send Friend Request
`POST /api/friendships/request`

**Request Body:**
```json
{
  "userId": "user-abc123",
  "friendId": "user-def456"
}
```

**Response:**
```json
{
  "friendship": {
    "id": "friendship-456",
    "userId": "user-abc123",
    "friendId": "user-def456",
    "status": "pending",
    "createdAt": "2024-01-15T10:33:00Z"
  }
}
```

## Notification Endpoints

### Get User Notifications
`GET /api/notifications/:userId`

**Response:**
```json
{
  "notifications": [
    {
      "id": "notification-789",
      "userId": "user-abc123",
      "type": "message",
      "content": "New message from John",
      "read": false,
      "createdAt": "2024-01-15T10:34:00Z"
    }
  ]
}
```

### Create Notification
`POST /api/notifications/:userId`

**Request Body:**
```json
{
  "type": "friend_request",
  "content": "John sent you a friend request"
}
```

**Response:**
```json
{
  "notification": {
    "id": "notification-789",
    "userId": "user-abc123",
    "type": "friend_request",
    "content": "John sent you a friend request",
    "read": false,
    "createdAt": "2024-01-15T10:35:00Z"
  }
}
```

### Mark Notification as Read
`PATCH /api/notifications/:notificationId/read`

**Response:**
```json
{
  "notification": {
    "id": "notification-789",
    "userId": "user-abc123",
    "type": "friend_request",
    "content": "John sent you a friend request",
    "read": true,
    "createdAt": "2024-01-15T10:35:00Z"
  }
}
```

## Settings Endpoints

### Get User Settings
`GET /api/settings/:userId`

**Response:**
```json
{
  "settings": {
    "id": "setting-123",
    "userId": "user-abc123",
    "preferences": {
      "theme": "light",
      "notifications": true
    },
    "createdAt": "2024-01-15T10:36:00Z"
  }
}
```

### Update User Settings
`PATCH /api/settings/:userId`

**Request Body:**
```json
{
  "preferences": {
    "theme": "dark",
    "notifications": false
  }
}
```

**Response:**
```json
{
  "settings": {
    "id": "setting-123",
    "userId": "user-abc123",
    "preferences": {
      "theme": "dark",
      "notifications": false
    },
    "createdAt": "2024-01-15T10:36:00Z"
  }
}
```

## Attachment Endpoints

### Get User Attachments
`GET /api/attachments/user/:userId`

**Response:**
```json
{
  "attachments": [
    {
      "id": "attachment-001",
      "userId": "user-abc123",
      "filename": "document.pdf",
      "url": "https://storage.example.com/document.pdf",
      "createdAt": "2024-01-15T10:37:00Z"
    }
  ]
}
```

### Create Attachment
`POST /api/attachments`

**Request Body:**
```json
{
  "userId": "user-abc123",
  "filename": "image.jpg",
  "url": "https://storage.example.com/image.jpg"
}
```

**Response:**
```json
{
  "attachment": {
    "id": "attachment-001",
    "userId": "user-abc123",
    "filename": "image.jpg",
    "url": "https://storage.example.com/image.jpg",
    "createdAt": "2024-01-15T10:38:00Z"
  }
}
```

## Admin Endpoints

### Get System Statistics
`GET /api/admin/stats`

**Response:**
```json
{
  "totalUsers": 42,
  "totalConversations": 15,
  "totalMessages": 1234,
  "totalFriendships": 89,
  "totalNotifications": 456,
  "totalAttachments": 78,
  "totalSettings": 42
}
```

### List All Users (Admin)
`GET /api/admin/users`

**Response:**
```json
{
  "users": [
    {
      "id": "user-abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Delete User (Admin)
`DELETE /api/admin/users/:id`

**Response:**
```json
{
  "message": "User deleted",
  "user": {
    "id": "user-abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

## Health Check

### Server Health
`GET /health`

**Response:**
```json
{
  "status": "ok",
  "uptime": 3600.5
}
```

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

## Rate Limiting

Currently no rate limiting is implemented. This should be added in production.

## Security Notes

- Passwords are currently stored in plain text (for demo purposes only)
- Use proper authentication tokens in production
- Implement proper authorization checks
- Add rate limiting and DDOS protection
- Use HTTPS in production
