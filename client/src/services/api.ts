import { 
  ChatThread, 
  Message, 
  ThreadsResponse, 
  MessagesResponse, 
  CreateThreadRequest, 
  UpdateThreadRequest,
  AppError
} from '../types';

class ApiService {
  private baseUrl: string;
  private getAccessToken: () => Promise<string>;

  constructor(baseUrl: string, getAccessToken: () => Promise<string>) {
    this.baseUrl = baseUrl;
    this.getAccessToken = getAccessToken;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AppError(
          errorData.message || `HTTP error! status: ${response.status}`,
          errorData.code,
          response.status
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      console.error('API request failed:', error);
      throw new AppError(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    }
  }

  // Thread operations
  async getThreads(): Promise<ChatThread[]> {
    const response = await this.makeRequest<ThreadsResponse>('/api/chat-threads');
    return response.threads || [];
  }

  async createThread(request: CreateThreadRequest): Promise<ChatThread> {
    const response = await this.makeRequest<{ thread: ChatThread }>('/api/chat-threads', {
      method: 'POST',
      body: JSON.stringify(request)
    });
    return response.thread;
  }

  async updateThread(threadId: string, request: UpdateThreadRequest): Promise<void> {
    await this.makeRequest(`/api/chat-threads/${threadId}`, {
      method: 'PATCH',
      body: JSON.stringify(request)
    });
  }

  async deleteThread(threadId: string): Promise<void> {
    await this.makeRequest(`/api/chat-threads/${threadId}`, {
      method: 'DELETE'
    });
  }

  // Message operations
  async getThreadMessages(threadId: string): Promise<Message[]> {
    const response = await this.makeRequest<MessagesResponse>(
      `/api/chat-threads/${threadId}/messages`
    );
    return response.messages || [];
  }
}

export { ApiService };

// Singleton pattern for API service
let apiService: ApiService | null = null;

export const initializeApiService = (baseUrl: string, getAccessToken: () => Promise<string>) => {
  apiService = new ApiService(baseUrl, getAccessToken);
  return apiService;
};

export const getApiService = (): ApiService => {
  if (!apiService) {
    throw new Error('API service not initialized. Call initializeApiService first.');
  }
  return apiService;
};