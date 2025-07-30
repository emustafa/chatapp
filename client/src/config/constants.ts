// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  WS_URL: process.env.REACT_APP_WS_URL || 'ws://localhost:3001',
  TIMEOUT: 10000,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  MAX_MESSAGE_LENGTH: 4000,
  THREAD_TITLE_MAX_LENGTH: 100,
  MESSAGE_PREVIEW_LENGTH: 100,
  SIDEBAR_WIDTH: 300,
  HEADER_HEIGHT: 80,
} as const;

// WebSocket Events
export const WS_EVENTS = {
  // Outgoing
  AUTH: 'auth',
  JOIN_THREAD: 'join_thread',
  MESSAGE: 'message',
  
  // Incoming
  AUTH_SUCCESS: 'auth_success',
  AUTH_ERROR: 'auth_error',
  THREAD_JOINED: 'thread_joined',
  MESSAGE_RECEIVED: 'message_received',
  STREAM_START: 'stream_start',
  STREAM_MESSAGE: 'stream_message',
  STREAM_END: 'stream_end',
  ERROR: 'error',
} as const;

// Status Messages
export const STATUS_MESSAGES = {
  CONNECTING: 'Connecting...',
  CONNECTED: 'Connected! Select or create a chat to start messaging.',
  READY: 'Ready to send messages in this chat.',
  DISCONNECTED: 'Disconnected',
  AUTH_FAILED: 'Authentication failed',
  CONNECTION_ERROR: 'Connection error',
  FAILED_TO_CONNECT: 'Failed to connect',
  NOT_CONNECTED: 'Not connected to server',
  MESSAGE_SENT: 'Message sent! Listening for stream...',
  ENTER_MESSAGE: 'Please enter a message',
  READY_NEW_CONVERSATION: 'Ready to start a new conversation',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  THREAD_LOAD_FAILED: 'Failed to load chat threads',
  THREAD_CREATE_FAILED: 'Failed to create new chat thread',
  MESSAGES_LOAD_FAILED: 'Failed to load messages',
  THREAD_UPDATE_FAILED: 'Failed to update thread title',
  MESSAGE_SEND_FAILED: 'Failed to send message',
  WS_PARSE_ERROR: 'Error parsing WebSocket message',
  WS_JOIN_ERROR: 'Failed to join thread',
  GENERIC_ERROR: 'An unexpected error occurred',
} as const;

// Timing Constants
export const TIMING = {
  THREAD_JOIN_DELAY: 100,
  RECONNECT_DELAY: 3000,
  MESSAGE_DEBOUNCE: 300,
} as const;