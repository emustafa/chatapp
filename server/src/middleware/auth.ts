import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { AuthenticatedRequest } from '../types';

export const createAuthMiddleware = (authService: AuthService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const user = await authService.authenticateToken(token);
      (req as AuthenticatedRequest).user = user;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(403).json({ error: 'Invalid token' });
    }
  };
};