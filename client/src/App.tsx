import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useWebSocket } from './hooks/useWebSocket';
import { useChatThreads } from './hooks/useChatThreads';
import { initializeApiService } from './services/api';
import { ErrorBoundary } from './components/ErrorBoundary';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import ChatHeader from './components/ChatHeader';
import ChatThreadList from './components/ChatThreadList';
import { layoutStyles } from './styles/layout';
import { API_CONFIG, UI_CONSTANTS, TIMING, STATUS_MESSAGES } from './config/constants';
import './App.css';

function App() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [message, setMessage] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize API service when authenticated
  useEffect(() => {
    if (isAuthenticated && !isInitialized) {
      initializeApiService(API_CONFIG.BASE_URL, getAccessTokenSilently);
      setIsInitialized(true);
    }
  }, [isAuthenticated, getAccessTokenSilently, isInitialized]);
  
  const {
    streamMessages,
    currentStreamingMessage,
    isStreaming,
    isConnected,
    status,
    connectWebSocket,
    joinThread,
    sendMessage: sendWebSocketMessage,
    setMessages,
    disconnect
  } = useWebSocket(getAccessTokenSilently);

  const {
    threads,
    activeThreadId,
    isLoading: threadsLoading,
    error: threadsError,
    loadThreads,
    createNewThread,
    loadThreadMessages,
    updateThreadTitle,
    setActiveThread
  } = useChatThreads();

  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      connectWebSocket();
      loadThreads();
    }
  }, [isAuthenticated, isInitialized]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    if (!activeThreadId) {
      // Auto-create a new thread when sending without one selected
      // Set title based on the message content
      const title = message.length > 50 ? message.substring(0, 50) : message;
      const newThreadId = await createNewThread(title);
      if (newThreadId) {
        setActiveThread(newThreadId);
        joinThread(newThreadId);
        setMessages([]); // Clear messages for new thread
        // Send the message after thread is created
        setTimeout(() => {
          sendWebSocketMessage(message);
        }, TIMING.THREAD_JOIN_DELAY);
      } else {
        alert('Failed to create new chat. Please try again.');
        return;
      }
    } else {
      // Check if current thread has "New Chat" title and no messages yet
      const currentThread = threads.find(t => t.threadId === activeThreadId);
      if (currentThread && currentThread.title === 'New Chat' && currentThread.messageCount === 0) {
        // Update thread title with first message (max 50 chars)
        const newTitle = message.length > 50 ? message.substring(0, 50) : message;
        await updateThreadTitle(activeThreadId, newTitle);
      }
      
      // Send the message
      sendWebSocketMessage(message);
    }
    setMessage('');
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const handleThreadSelect = async (threadId: string) => {
    setActiveThread(threadId);
    joinThread(threadId);
    
    // Load messages for this thread
    try {
      const messages = await loadThreadMessages(threadId);
      // Convert database messages to StreamMessage format
      const streamMessages = messages.map(msg => ({
        type: msg.type as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: msg.timestamp
      }));
      setMessages(streamMessages);
    } catch (error) {
      console.error('Error loading thread messages:', error);
    }
  };

  const handleNewThread = async () => {
    // Create a new thread but don't set a title yet
    const threadId = await createNewThread('New Chat');
    if (threadId) {
      setActiveThread(threadId);
      joinThread(threadId);
      setMessages([]); // Clear messages for new thread
    }
  };

  if (isLoading) {
    return (
      <div style={layoutStyles.loadingContainer}>
        Loading...
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="App">
        <div style={layoutStyles.appContainer}>
          <div style={layoutStyles.header}>
            <h1 style={layoutStyles.headerTitle}>Message App</h1>
          </div>
          
          {!isAuthenticated ? (
            <div style={layoutStyles.authContainer}>
              <h2 style={layoutStyles.authTitle}>Please log in to continue</h2>
              <button 
                style={layoutStyles.button}
                onClick={() => loginWithRedirect()}
              >
                Log In
              </button>
            </div>
          ) : (
            <div style={layoutStyles.mainContent}>
              <ErrorBoundary>
                <ChatThreadList
                  threads={threads}
                  activeThreadId={activeThreadId}
                  onThreadSelect={handleThreadSelect}
                  onNewThread={handleNewThread}
                  isLoading={threadsLoading}
                  error={threadsError}
                />
              </ErrorBoundary>
              
              <div style={layoutStyles.chatContainer}>
                <ErrorBoundary>
                  <ChatHeader
                    userName={user?.name || 'User'}
                    isConnected={isConnected}
                    logout={handleLogout}
                  />
                </ErrorBoundary>

                <ErrorBoundary>
                  <MessageList
                    streamMessages={streamMessages}
                    currentStreamingMessage={currentStreamingMessage}
                    isStreaming={isStreaming}
                  />
                </ErrorBoundary>

                <ErrorBoundary>
                  <MessageInput
                    message={message}
                    setMessage={setMessage}
                    sendMessage={handleSendMessage}
                    isConnected={isConnected}
                    canSend={isConnected && message.trim().length > 0}
                    status={activeThreadId ? status : STATUS_MESSAGES.READY_NEW_CONVERSATION}
                  />
                </ErrorBoundary>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
