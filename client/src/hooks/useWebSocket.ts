import { useState, useRef, useCallback } from 'react';

interface StreamMessage {
  type: string;
  content?: string;
  timestamp?: string;
  user?: { name: string; email: string };
  message?: string;
}

interface UseWebSocketReturn {
  streamMessages: StreamMessage[];
  currentStreamingMessage: string;
  isStreaming: boolean;
  isConnected: boolean;
  status: string;
  connectWebSocket: () => void;
  sendMessage: (message: string) => void;
  clearMessages: () => void;
}

export const useWebSocket = (getAccessTokenSilently: () => Promise<string>): UseWebSocketReturn => {
  const [streamMessages, setStreamMessages] = useState<StreamMessage[]>([]);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      const ws = new WebSocket('ws://localhost:3001');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setStatus('Connecting...');
        
        ws.send(JSON.stringify({
          type: 'auth',
          token: token
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data: StreamMessage = JSON.parse(event.data);
          
          switch (data.type) {
            case 'auth_success':
              setIsConnected(true);
              setStatus('Connected! Ready to send messages.');
              setStreamMessages(prev => [...prev, {
                type: 'system',
                content: `Connected as ${data.user?.name}`,
                timestamp: new Date().toISOString()
              }]);
              break;
              
            case 'auth_error':
              setStatus('Authentication failed');
              setIsConnected(false);
              break;
              
            case 'message_received':
              setStreamMessages(prev => [...prev, {
                type: 'confirmation',
                content: data.content,
                timestamp: new Date().toISOString()
              }]);
              setCurrentStreamingMessage('');
              setIsStreaming(true);
              break;
              
            case 'stream_start':
              setCurrentStreamingMessage('');
              setIsStreaming(true);
              break;
              
            case 'stream_message':
              setCurrentStreamingMessage(prev => prev + (data.content || ''));
              break;
              
            case 'stream_end':
              setIsStreaming(false);
              setCurrentStreamingMessage(current => {
                if (current) {
                  setStreamMessages(prev => [...prev, {
                    type: 'response',
                    content: current,
                    timestamp: new Date().toISOString()
                  }]);
                }
                return '';
              });
              break;
              
            case 'error':
              setStatus(`Error: ${data.message}`);
              break;
              
            default:
              console.log('Unknown message type:', data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setStatus('Disconnected');
        wsRef.current = null;
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus('Connection error');
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setStatus('Failed to connect');
    }
  }, [getAccessTokenSilently]);

  const sendMessage = useCallback((message: string) => {
    if (!message.trim()) {
      setStatus('Please enter a message');
      return;
    }

    if (!wsRef.current || !isConnected) {
      setStatus('Not connected to server');
      return;
    }

    try {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        content: message
      }));
      
      setStatus('Message sent! Listening for stream...');
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus('Failed to send message');
    }
  }, [isConnected]);

  const clearMessages = useCallback(() => {
    setStreamMessages([]);
    setCurrentStreamingMessage('');
    setIsStreaming(false);
  }, []);

  return {
    streamMessages,
    currentStreamingMessage,
    isStreaming,
    isConnected,
    status,
    connectWebSocket,
    sendMessage,
    clearMessages
  };
};