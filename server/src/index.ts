import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import { DatabaseService } from './services/DatabaseService';
import { AuthService } from './services/AuthService';
import { ChatService } from './services/ChatService';
import { ChatController } from './controllers/ChatController';
import { createChatRoutes } from './routes/chatRoutes';
import { WebSocketHandler } from './websocket/WebSocketHandler';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

class Server {
  private app = express();
  private server = createServer(this.app);
  private wss = new WebSocketServer({ server: this.server });
  private port = process.env.PORT;

  private databaseService = new DatabaseService();
  private authService = new AuthService(this.databaseService);
  private chatService = new ChatService(this.databaseService);

  private webSocketHandler = new WebSocketHandler(this.authService, this.chatService);

  constructor() {
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.CLIENT_URL,
      credentials: true
    }));
    this.app.use(morgan('combined'));
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'OK' });
    });

    this.app.use('/api', createChatRoutes(
      new ChatController(this.databaseService),
      this.authService
    ));
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws) => {
      this.webSocketHandler.handleConnection(ws);
    });
  }

  private setupErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  public start(): void {
    this.server.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
      console.log(`WebSocket server is ready`);
    });
  }
}

// Start the server
const server = new Server();
server.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});