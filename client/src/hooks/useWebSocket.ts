import { useState, useRef, useCallback } from 'react';
import { StreamMessage, WebSocketMessage } from '../types';
import { API_CONFIG, WS_EVENTS, STATUS_MESSAGES, ERROR_MESSAGES } from '../config/constants';

interface UseWebSocketReturn {
  streamMessages: StreamMessage[];
  currentStreamingMessage: string;
  isStreaming: boolean;
  isConnected: boolean;
  status: string;
  connectWebSocket: () => void;
  joinThread: (threadId: string) => void;
  sendMessage: (message: string) => void;
  setMessages: (messages: StreamMessage[]) => void;
  disconnect: () => void;
}

export const useWebSocket = (getAccessTokenSilently: () => Promise<string>): UseWebSocketReturn => {
  const [streamMessages, setStreamMessages] = useState<StreamMessage[]>([]);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const streamingMessageRef = useRef<string>('');

  const connectWebSocket = useCallback(async () => {
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      const token = await getAccessTokenSilently();
      const ws = new WebSocket(API_CONFIG.WS_URL);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setStatus(STATUS_MESSAGES.CONNECTING);
        
        ws.send(JSON.stringify({
          type: WS_EVENTS.AUTH,
          token: token
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          
          switch (data.type) {
            case WS_EVENTS.AUTH_SUCCESS:
              setIsConnected(true);
              setStatus(STATUS_MESSAGES.CONNECTED);
              break;
              
            case WS_EVENTS.THREAD_JOINED:
              setStatus(STATUS_MESSAGES.READY);
              break;
              
            case WS_EVENTS.AUTH_ERROR:
              setStatus(STATUS_MESSAGES.AUTH_FAILED);
              setIsConnected(false);
              console.error('WebSocket authentication failed');
              break;
              
            case WS_EVENTS.MESSAGE_RECEIVED:
              setStreamMessages(prev => [...prev, {
                type: 'user',
                content: data.content || '',
                timestamp: new Date().toISOString()
              }]);
              setCurrentStreamingMessage('');
              setIsStreaming(true);
              break;
              
            case WS_EVENTS.STREAM_START:
              streamingMessageRef.current = '';
              setCurrentStreamingMessage('');
              setIsStreaming(true);
              break;
              
            case WS_EVENTS.STREAM_MESSAGE:
              streamingMessageRef.current += (data.content || '');
              setCurrentStreamingMessage(streamingMessageRef.current);
              break;
              
            case WS_EVENTS.STREAM_END:
              // Add the complete message and clear streaming
              if (streamingMessageRef.current.trim()) {
                const completedMessage = {
                  type: 'assistant' as const,
                  content: streamingMessageRef.current,
                  timestamp: new Date().toISOString()
                };
                
                // Add to messages immediately
                setStreamMessages(prev => [...prev, completedMessage]);
                
                // Clear streaming state immediately
                setIsStreaming(false);
                
                // Clear the streaming message after a small delay to ensure smooth transition
                setTimeout(() => {
                  setCurrentStreamingMessage('');
                }, 100);
                
                streamingMessageRef.current = '';
              } else {
                // Clear streaming state even if no message
                streamingMessageRef.current = '';
                setCurrentStreamingMessage('');
                setIsStreaming(false);
              }
              break;
              
            case WS_EVENTS.ERROR:
              setStatus(`Error: ${data.message}`);
              console.error('WebSocket error:', data.message);
              break;
              
            default:
              console.log('Unknown message type:', data);
          }
        } catch (error) {
          console.error(ERROR_MESSAGES.WS_PARSE_ERROR, error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setStatus(STATUS_MESSAGES.DISCONNECTED);
        wsRef.current = null;
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus(STATUS_MESSAGES.CONNECTION_ERROR);
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setStatus(STATUS_MESSAGES.FAILED_TO_CONNECT);
    }
  }, [getAccessTokenSilently]);

  const joinThread = useCallback((threadId: string) => {
    if (!wsRef.current || !isConnected) {
      setStatus(STATUS_MESSAGES.NOT_CONNECTED);
      return;
    }

    try {
      wsRef.current.send(JSON.stringify({
        type: WS_EVENTS.JOIN_THREAD,
        threadId: threadId
      }));
    } catch (error) {
      console.error('Error joining thread:', error);
      setStatus(ERROR_MESSAGES.WS_JOIN_ERROR);
    }
  }, [isConnected]);

  const sendMessage = useCallback((message: string) => {
    if (!message.trim()) {
      setStatus(STATUS_MESSAGES.ENTER_MESSAGE);
      return;
    }

    if (!wsRef.current || !isConnected) {
      setStatus(STATUS_MESSAGES.NOT_CONNECTED);
      return;
    }

    try {
      wsRef.current.send(JSON.stringify({
        type: WS_EVENTS.MESSAGE,
        content: message
      }));
      
      setStatus(STATUS_MESSAGES.MESSAGE_SENT);
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus(ERROR_MESSAGES.MESSAGE_SEND_FAILED);
    }
  }, [isConnected]);

  const setMessages = useCallback((messages: StreamMessage[]) => {
    setStreamMessages(messages);
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setStatus(STATUS_MESSAGES.DISCONNECTED);
  }, []);

  return {
    streamMessages,
    currentStreamingMessage,
    isStreaming,
    isConnected,
    status,
    connectWebSocket,
    joinThread,
    sendMessage,
    setMessages,
    disconnect
  };
};