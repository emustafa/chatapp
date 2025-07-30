import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { createAuthMiddleware } from '../middleware/auth';
import { AuthService } from '../services/AuthService';

export const createChatRoutes = (
  chatController: ChatController,
  authService: AuthService
): Router => {
  const router = Router();
  const authenticateToken = createAuthMiddleware(authService);

  router.get('/chat-threads', authenticateToken, (req, res) => 
    chatController.getThreads(req as any, res)
  );

  router.post('/chat-threads', authenticateToken, (req, res) => 
    chatController.createThread(req as any, res)
  );

  router.get('/chat-threads/:threadId/messages', authenticateToken, (req, res) => 
    chatController.getThreadMessages(req as any, res)
  );

  router.patch('/chat-threads/:threadId', authenticateToken, (req, res) => 
    chatController.updateThreadTitle(req as any, res)
  );

  return router;
};