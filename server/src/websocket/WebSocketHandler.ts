import { WebSocket } from 'ws';
import { AuthService } from '../services/AuthService';
import { ChatService } from '../services/ChatService';
import { User, WebSocketMessage } from '../types';

interface WebSocketConnection {
  ws: WebSocket;
  user: User | null;
  isAuthenticated: boolean;
  currentThreadId: string | null;
}

export class WebSocketHandler {
  private connections = new Map<WebSocket, WebSocketConnection>();

  constructor(
    private authService: AuthService,
    private chatService: ChatService
  ) {}

  handleConnection(ws: WebSocket): void {
    console.log('New WebSocket connection attempt');
    
    const connection: WebSocketConnection = {
      ws,
      user: null,
      isAuthenticated: false,
      currentThreadId: null
    };
    
    this.connections.set(ws, connection);

    ws.on('message', (data) => this.handleMessage(ws, data));
    ws.on('close', () => this.handleDisconnection(ws));
    ws.on('error', (error) => this.handleError(ws, error));
  }

  private async handleMessage(ws: WebSocket, data: Buffer): Promise<void> {
    const connection = this.connections.get(ws);
    if (!connection) return;

    try {
      const message: WebSocketMessage = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'auth':
          await this.handleAuth(connection, message);
          break;
        case 'join_thread':
          this.handleJoinThread(connection, message);
          break;
        case 'message':
          await this.handleChatMessage(connection, message);
          break;
        default:
          this.sendError(ws, 'Unknown message type');
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      this.sendError(ws, 'Invalid message format');
    }
  }

  private async handleAuth(connection: WebSocketConnection, message: WebSocketMessage): Promise<void> {
    if (!message.token) {
      this.sendError(connection.ws, 'Token required');
      return;
    }

    try {
      const user = await this.authService.authenticateWebSocket(message.token);
      connection.user = user;
      connection.isAuthenticated = true;
      
      console.log(`WebSocket authenticated for user: ${user.email}`);
      
      this.sendMessage(connection.ws, {
        type: 'auth_success',
        user: { name: user.name, email: user.email }
      });
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      this.sendError(connection.ws, 'Authentication failed');
      connection.ws.close();
    }
  }

  private handleJoinThread(connection: WebSocketConnection, message: WebSocketMessage): void {
    if (!connection.isAuthenticated) {
      this.sendError(connection.ws, 'Please authenticate first');
      return;
    }

    if (!message.threadId) {
      this.sendError(connection.ws, 'Thread ID required');
      return;
    }

    connection.currentThreadId = message.threadId;
    console.log(`User ${connection.user?.email} joined thread: ${message.threadId}`);
    
    this.sendMessage(connection.ws, {
      type: 'thread_joined',
      threadId: message.threadId
    });
  }

  private async handleChatMessage(connection: WebSocketConnection, message: WebSocketMessage): Promise<void> {
    if (!connection.isAuthenticated || !connection.user || !connection.currentThreadId) {
      this.sendError(connection.ws, 'Please authenticate and join a thread first');
      return;
    }

    if (!message.content) {
      this.sendError(connection.ws, 'Message content required');
      return;
    }

    try {
      const { user, currentThreadId } = connection;
      
      // Save user message
      await this.chatService.saveUserMessage(currentThreadId, user.userId, message.content);
      
      // Confirm message received
      this.sendMessage(connection.ws, {
        type: 'message_received',
        content: message.content
      });

      // Start streaming response
      this.sendMessage(connection.ws, { type: 'stream_start' });

      let fullResponse = '';
      
      try {
        // Stream ChatGPT response
        const responseStream = this.chatService.streamChatCompletion(currentThreadId, message.content);
        
        for await (const chunk of responseStream) {
          if (connection.ws.readyState !== WebSocket.OPEN) {
            break;
          }

          fullResponse += chunk;
          this.sendMessage(connection.ws, {
            type: 'stream_message',
            content: chunk,
            timestamp: new Date().toISOString()
          });
        }

        // Save complete response
        if (fullResponse) {
          await this.chatService.saveAssistantMessage(currentThreadId, user.userId, fullResponse);
        }

        // End stream
        this.sendMessage(connection.ws, {
          type: 'stream_end',
          timestamp: new Date().toISOString()
        });

      } catch (streamError) {
        console.error('Streaming error:', streamError);
        
        // Save partial response if any
        if (fullResponse) {
          await this.chatService.saveAssistantMessage(currentThreadId, user.userId, fullResponse);
        }
        
        this.sendError(connection.ws, 'Failed to get AI response');
      }

    } catch (error) {
      console.error('Error processing chat message:', error);
      this.sendError(connection.ws, 'Failed to process message');
    }
  }

  private handleDisconnection(ws: WebSocket): void {
    console.log('WebSocket connection closed');
    this.connections.delete(ws);
  }

  private handleError(ws: WebSocket, error: Error): void {
    console.error('WebSocket error:', error);
    this.connections.delete(ws);
  }

  private sendMessage(ws: WebSocket, message: Partial<WebSocketMessage>): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket, message: string): void {
    this.sendMessage(ws, {
      type: 'error',
      message
    });
  }
}