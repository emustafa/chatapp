import { useState, useCallback } from 'react';
import { ChatThread, Message, AppError } from '../types';
import { getApiService } from '../services/api';
import { useErrorHandler } from '../components/ErrorBoundary';
import { ERROR_MESSAGES } from '../config/constants';

interface UseChatThreadsReturn {
  threads: ChatThread[];
  activeThreadId: string | null;
  isLoading: boolean;
  error: string | null;
  loadThreads: () => Promise<void>;
  createNewThread: (title?: string) => Promise<string | null>;
  loadThreadMessages: (threadId: string) => Promise<Message[]>;
  updateThreadTitle: (threadId: string, title: string) => Promise<boolean>;
  setActiveThread: (threadId: string | null) => void;
  clearError: () => void;
}

export const useChatThreads = (): UseChatThreadsReturn => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();


  const loadThreads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const apiService = getApiService();
      const threads = await apiService.getThreads();
      setThreads(threads);
    } catch (error) {
      const errorMessage = error instanceof AppError ? error.message : ERROR_MESSAGES.THREAD_LOAD_FAILED;
      setError(errorMessage);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const createNewThread = useCallback(async (title?: string): Promise<string | null> => {
    setError(null);
    
    try {
      const apiService = getApiService();
      const newThread = await apiService.createThread({ title });
      setThreads(prev => [newThread, ...prev]);
      return newThread.threadId;
    } catch (error) {
      const errorMessage = error instanceof AppError ? error.message : ERROR_MESSAGES.THREAD_CREATE_FAILED;
      setError(errorMessage);
      handleError(error);
      return null;
    }
  }, [handleError]);

  const loadThreadMessages = useCallback(async (threadId: string): Promise<Message[]> => {
    setError(null);
    
    try {
      const apiService = getApiService();
      return await apiService.getThreadMessages(threadId);
    } catch (error) {
      const errorMessage = error instanceof AppError ? error.message : ERROR_MESSAGES.MESSAGES_LOAD_FAILED;
      setError(errorMessage);
      handleError(error);
      return [];
    }
  }, [handleError]);

  const updateThreadTitle = useCallback(async (threadId: string, title: string): Promise<boolean> => {
    setError(null);
    
    try {
      const apiService = getApiService();
      await apiService.updateThread(threadId, { title });
      
      // Update local state
      setThreads(prev => prev.map(thread => 
        thread.threadId === threadId 
          ? { ...thread, title, updatedAt: new Date().toISOString() }
          : thread
      ));
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof AppError ? error.message : ERROR_MESSAGES.THREAD_UPDATE_FAILED;
      setError(errorMessage);
      handleError(error);
      return false;
    }
  }, [handleError]);

  const setActiveThread = useCallback((threadId: string | null) => {
    setActiveThreadId(threadId);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    threads,
    activeThreadId,
    isLoading,
    error,
    loadThreads,
    createNewThread,
    loadThreadMessages,
    updateThreadTitle,
    setActiveThread,
    clearError
  };
};