import OpenAI from 'openai';
import { DatabaseService } from './DatabaseService';
import { Message } from '../types';

export class ChatService {
  private openai: OpenAI;
  private databaseService: DatabaseService;

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  private async getConversationHistory(threadId: string): Promise<OpenAI.Chat.Completions.ChatCompletionMessageParam[]> {
    try {
      const messages = await this.databaseService.getThreadMessages(threadId, 20);
      
      return messages.map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  }

  async *streamChatCompletion(
    threadId: string, 
    userMessage: string
  ): AsyncGenerator<string, void, unknown> {
    try {
      // Get conversation history
      const conversationHistory = await this.getConversationHistory(threadId);
      
      // Add current user message
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];

      // Create streaming completion
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        stream: true,
        max_tokens: 1000,
        temperature: 0.7
      });

      // Stream the response
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (delta?.content) {
          yield delta.content;
        }

        if (chunk.choices[0]?.finish_reason) {
          break;
        }
      }
    } catch (error) {
      console.error('OpenAI streaming error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async saveUserMessage(threadId: string, userId: string, content: string): Promise<Message> {
    return this.databaseService.saveMessage(threadId, userId, 'user', content);
  }

  async saveAssistantMessage(threadId: string, userId: string, content: string): Promise<Message> {
    return this.databaseService.saveMessage(threadId, userId, 'assistant', content);
  }
}