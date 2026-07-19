# Goal Description

The goal is to fix the existing TypeScript errors in the backend that prevent it from compiling, and to fully integrate the frontend by replacing the existing mock data in `App.tsx` with real API calls using Axios and React Query, along with Socket.io for real-time messaging.

## User Review Required

Please review the plan below. I will be replacing the existing mock data in `App.tsx` and adding routing to support Login and Register pages.

## Proposed Changes

### Backend Fixes

#### [MODIFY] `apps/server/src/modules/auth/services/auth.service.ts`
- Fix the type error when calling `jwt.sign` by explicitly typing the options or casting `config.jwt.expiresIn`.

#### [MODIFY] `apps/server/src/modules/notifications/services/notifications.service.ts`
- Fix `CreateNotificationInput` to match the arguments required by the repository (`title`, `message`, etc.).

#### [MODIFY] `apps/server/src/socket/socket.ts`
- Cast `populated.senderId` as `any` (or the correct user schema type) to resolve the "Property 'name' does not exist" TypeScript error.

---

### Frontend Infrastructure

#### [NEW] `apps/frontend/src/lib/api.ts`
- Create an Axios instance configured with the `VITE_API_URL` and setup interceptors to automatically inject the `Authorization` header containing the JWT token.

#### [NEW] `apps/frontend/src/store/AuthContext.tsx`
- Create a React Context to manage authentication state, providing `user`, `login`, `register`, and `logout` functions.

#### [NEW] `apps/frontend/src/store/SocketContext.tsx`
- Create a React Context for `socket.io-client` that connects to the server when the user logs in and disconnects when they log out.

#### [MODIFY] `apps/frontend/src/main.tsx`
- Wrap the app with `QueryClientProvider`, `AuthProvider`, and `SocketProvider`.

---

### Frontend API Hooks

#### [NEW] `apps/frontend/src/features/auth/api/auth.ts`
- Implement `login`, `register`, and `getMe` API calls.

#### [NEW] `apps/frontend/src/features/chat/api/chat.ts`
- Implement functions and custom hooks (using TanStack Query) to fetch conversations, fetch messages, send messages, and mark messages as read.

---

### Frontend UI & Integration

#### [NEW] `apps/frontend/src/pages/Login.tsx` & `apps/frontend/src/pages/Register.tsx`
- Build simple and clean authentication pages using standard tailwind styling.

#### [NEW] `apps/frontend/src/router/ProtectedRoute.tsx`
- A wrapper component to redirect unauthenticated users to the Login page.

#### [MODIFY] `apps/frontend/src/App.tsx`
- Setup `react-router-dom` routing (Login, Register, and Chat).
- Extract the chat UI into a new component `ChatDashboard`.
- Refactor `ChatDashboard` to consume data from React Query and Socket.io instead of `mockConversations` and `mockMessages`.
- Implement optimistic updates or cache invalidation when sending messages.

## Verification Plan

### Automated Tests
- Run `npm run build` in both `apps/server` and `apps/frontend` to verify there are no TypeScript or ESLint errors.

### Manual Verification
- Start the application and demonstrate registering a new user, logging in, creating a conversation, and sending messages in real time.
