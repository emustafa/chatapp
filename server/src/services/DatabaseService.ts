import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { User, ChatThread, Message, Session } from '../types';

export class DatabaseService {
  private dynamodb: DynamoDBDocumentClient;

  constructor() {
    const dynamoClient = new DynamoDBClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
    this.dynamodb = DynamoDBDocumentClient.from(dynamoClient);
  }

  // User operations
  async getUser(userId: string): Promise<User | null> {
    try {
      const result = await this.dynamodb.send(new GetCommand({
        TableName: 'Users',
        Key: { userId }
      }));
      return result.Item as User || null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async createUser(userData: Omit<User, 'createdAt'>): Promise<User> {
    try {
      const user: User = {
        ...userData,
        createdAt: new Date().toISOString()
      };

      await this.dynamodb.send(new PutCommand({
        TableName: 'Users',
        Item: user
      }));

      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Session operations
  async createSession(userId: string, token: string): Promise<Session> {
    try {
      const session: Session = {
        sessionId: `${userId}_${Date.now()}`,
        userId,
        token,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      await this.dynamodb.send(new PutCommand({
        TableName: 'Sessions',
        Item: session
      }));

      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  // ChatThread operations
  async getUserThreads(userId: string): Promise<ChatThread[]> {
    try {
      const result = await this.dynamodb.send(new QueryCommand({
        TableName: 'ChatThreads',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false // Newest first
      }));

      return (result.Items as ChatThread[]) || [];
    } catch (error) {
      console.error('Error getting user threads:', error);
      throw error;
    }
  }

  async createThread(userId: string, title: string): Promise<ChatThread> {
    try {
      const thread: ChatThread = {
        userId,
        threadId: uuidv4(),
        title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
        lastMessage: '',
        status: 'active'
      };

      await this.dynamodb.send(new PutCommand({
        TableName: 'ChatThreads',
        Item: thread
      }));

      return thread;
    } catch (error) {
      console.error('Error creating thread:', error);
      throw error;
    }
  }

  async updateThreadTitle(userId: string, threadId: string, title: string): Promise<void> {
    try {
      await this.dynamodb.send(new UpdateCommand({
        TableName: 'ChatThreads',
        Key: { userId, threadId },
        UpdateExpression: 'SET title = :title, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':title': title,
          ':updatedAt': new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error('Error updating thread title:', error);
      throw error;
    }
  }

  // Message operations
  async getThreadMessages(threadId: string, limit: number = 50): Promise<Message[]> {
    try {
      const result = await this.dynamodb.send(new QueryCommand({
        TableName: 'Messages',
        KeyConditionExpression: 'threadId = :threadId',
        ExpressionAttributeValues: {
          ':threadId': threadId
        },
        ScanIndexForward: true, // Chronological order
        Limit: limit
      }));

      return (result.Items as Message[]) || [];
    } catch (error) {
      console.error('Error getting thread messages:', error);
      throw error;
    }
  }

  async saveMessage(threadId: string, userId: string, type: 'user' | 'assistant', content: string): Promise<Message> {
    try {
      const now = new Date().toISOString();
      const message: Message = {
        threadId,
        messageId: `${now}#${uuidv4()}`,
        userId,
        type,
        content,
        timestamp: now
      };

      // Save message
      await this.dynamodb.send(new PutCommand({
        TableName: 'Messages',
        Item: message
      }));

      // Update thread metadata
      await this.dynamodb.send(new UpdateCommand({
        TableName: 'ChatThreads',
        Key: { userId, threadId },
        UpdateExpression: 'SET updatedAt = :now, lastMessage = :lastMessage, messageCount = messageCount + :inc',
        ExpressionAttributeValues: {
          ':now': now,
          ':lastMessage': content.substring(0, 100),
          ':inc': 1
        }
      }));

      return message;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }
}