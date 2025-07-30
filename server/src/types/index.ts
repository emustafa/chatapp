// TODO(emustafa): Can we define the tables in such a way that
// we can auto generate these types?
// That way, we can easily keep these in sync between client and server.

export interface User {
  userId: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Session {
  sessionId: string;
  userId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
}

export interface ChatThread {
  userId: string;
  threadId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage: string;
  status: 'active' | 'archived';
}

export interface Message {
  threadId: string;
  messageId: string;
  userId: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface WebSocketMessage {
  type: 'auth' | 'join_thread' | 'message' | 'stream_start' | 'stream_message' | 'stream_end' | 'error';
  token?: string;
  threadId?: string;
  content?: string;
  timestamp?: string;
  user?: { name: string; email: string };
  message?: string;
}

export interface AuthenticatedRequest extends Request {
  user: User;
}