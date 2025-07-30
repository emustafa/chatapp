import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-client';
import { User } from '../types';
import { DatabaseService } from './DatabaseService';

export class AuthService {
  private authClient: jwksClient.JwksClient;
  private databaseService: DatabaseService;

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
    this.authClient = jwksClient({
      jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
    });
  }

  private getKey = (header: any, callback: any) => {
    this.authClient.getSigningKey(header.kid, (err, key) => {
      if (err) {
        return callback(err);
      }
      if (!key) {
        return callback(new Error('Unable to find a signing key that matches'));
      }
      const signingKey = key.publicKey;
      callback(null, signingKey);
    });
  };

  async authenticateToken(token: string): Promise<User> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.getKey, {
        audience: process.env.AUTH0_AUDIENCE,
        issuer: `https://${process.env.AUTH0_DOMAIN}/`,
        algorithms: ['RS256']
      }, async (err: any, decoded: any) => {
        if (err) {
          console.error('JWT verification error:', err);
          return reject(new Error('Authentication failed'));
        }

        try {
          const userId = decoded.sub;
          
          // Try to get existing user
          let user = await this.databaseService.getUser(userId);

          // Create user if doesn't exist
          if (!user) {
            user = await this.databaseService.createUser({
              userId,
              email: decoded.email,
              name: decoded.name
            });
          }

          // Create session
          await this.databaseService.createSession(userId, token);

          resolve(user);
        } catch (error) {
          console.error('Database error during authentication:', error);
          reject(new Error('Internal server error'));
        }
      });
    });
  }

  async authenticateWebSocket(token: string): Promise<User> {
    return this.authenticateToken(token);
  }
}