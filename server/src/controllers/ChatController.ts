import { Request, Response } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { AuthenticatedRequest } from '../types';

export class ChatController {
  constructor(private databaseService: DatabaseService) {}

  async getThreads(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const threads = await this.databaseService.getUserThreads(req.user.userId);
      res.json({ threads });
    } catch (error) {
      console.error('Error fetching chat threads:', error);
      res.status(500).json({ error: 'Failed to fetch chat threads' });
    }
  }

  async createThread(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { title } = req.body;
      const thread = await this.databaseService.createThread(
        req.user.userId, 
        title || 'New Chat'
      );
      res.json({ thread });
    } catch (error) {
      console.error('Error creating chat thread:', error);
      res.status(500).json({ error: 'Failed to create chat thread' });
    }
  }

  async getThreadMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { threadId } = req.params;
      const messages = await this.databaseService.getThreadMessages(threadId);
      res.json({ messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  async updateThreadTitle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { threadId } = req.params;
      const { title } = req.body;
      
      if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
      }

      await this.databaseService.updateThreadTitle(req.user.userId, threadId, title);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating thread title:', error);
      res.status(500).json({ error: 'Failed to update thread title' });
    }
  }
}