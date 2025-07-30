// TODO(emustafa): Can we define the tables in such a way that
// we can auto generate these types?
// That way, we can easily keep these in sync between client and server.

export interface User {
  userId: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface ChatThread {
  threadId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage: string;
  status: 'active' | 'archived';
}

export interface Message {
  messageId: string;
  threadId: string;
  userId: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface StreamMessage {
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface WebSocketMessage {
  type: 'auth' | 'join_thread' | 'message' | 'stream_start' | 'stream_message' | 'stream_end' | 'error' | 'auth_success' | 'auth_error' | 'thread_joined' | 'message_received';
  token?: string;
  threadId?: string;
  content?: string;
  timestamp?: string;
  user?: { name: string; email: string };
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ThreadsResponse {
  threads: ChatThread[];
}

export interface MessagesResponse {
  messages: Message[];
}

export interface CreateThreadRequest {
  title?: string;
}

export interface UpdateThreadRequest {
  title: string;
}

export class AppError extends Error {
  public code?: string;
  public statusCode?: number;

  constructor(message: string, code?: string, statusCode?: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}