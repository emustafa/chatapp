import React from 'react';

interface StreamMessage {
  type: string;
  content?: string;
  timestamp?: string;
  user?: { name: string; email: string };
  message?: string;
}

interface ChatHeaderProps {
  userName: string;
  isConnected: boolean;
  streamMessages: StreamMessage[];
  clearMessages: () => void;
  logout: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  userName,
  isConnected,
  streamMessages,
  clearMessages,
  logout
}) => {
  return (
    <div style={{ 
      padding: '20px',
      borderBottom: '1px solid #e0e0e0',
      backgroundColor: '#fff'
    }}>
      <h2 style={{ color: '#333', margin: 0 }}>Welcome, {userName}!</h2>
      <div style={{ marginTop: '10px' }}>
        <span style={{ 
          color: isConnected ? 'green' : 'red',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </span>
        <button 
          onClick={clearMessages} 
          style={{ 
            marginLeft: '20px',
            padding: '5px 10px',
            fontSize: '12px'
          }}
          disabled={streamMessages.length === 0}
        >
          Clear Messages
        </button>
        <button 
          onClick={logout}
          style={{ 
            marginLeft: '10px',
            padding: '5px 10px',
            fontSize: '12px'
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;