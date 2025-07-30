import React from 'react';

interface StreamMessage {
  type: string;
  content?: string;
  timestamp?: string;
  user?: { name: string; email: string };
  message?: string;
}

interface MessageListProps {
  streamMessages: StreamMessage[];
  currentStreamingMessage: string;
  isStreaming: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  streamMessages,
  currentStreamingMessage,
  isStreaming
}) => {
  return (
    <div style={{ 
      flex: 1,
      overflowY: 'auto',
      padding: '20px',
      paddingBottom: '140px',
      backgroundColor: '#fafafa'
    }}>
      {(streamMessages.length > 0 || isStreaming) ? (
        <div>
          {streamMessages.map((msg, index) => (
            <div 
              key={index} 
              style={{ 
                margin: '20px 0',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: msg.type === 'system' ? '#e3f2fd' : 
                               msg.type === 'confirmation' ? '#f0f8ff' : '#ffffff',
                border: `1px solid ${msg.type === 'system' ? '#2196f3' : 
                                     msg.type === 'confirmation' ? '#4a90e2' : '#e0e0e0'}`,
                maxWidth: '700px',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}
            >
              <div style={{ 
                fontSize: '13px', 
                color: '#666',
                marginBottom: '8px',
                fontWeight: 'bold'
              }}>
                {msg.type === 'confirmation' ? 'You' : 
                 msg.type === 'response' ? 'Assistant' : 
                 msg.type.toUpperCase()} 
                <span style={{ fontWeight: 'normal', marginLeft: '8px' }}>
                  {new Date(msg.timestamp || '').toLocaleTimeString()}
                </span>
              </div>
              <div style={{ 
                whiteSpace: 'pre-wrap',
                lineHeight: '1.5',
                fontSize: '15px',
                color: '#333'
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {/* Current streaming message */}
          {isStreaming && (
            <div 
              style={{ 
                margin: '20px 0',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                border: '1px solid #e0e0e0',
                maxWidth: '700px',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}
            >
              <div style={{ 
                fontSize: '13px', 
                color: '#666',
                marginBottom: '8px',
                fontWeight: 'bold'
              }}>
                Assistant <span style={{ color: '#4caf50' }}>• typing...</span>
              </div>
              <div style={{ 
                whiteSpace: 'pre-wrap',
                lineHeight: '1.5',
                fontSize: '15px',
                color: '#333'
              }}>
                {currentStreamingMessage}
                <span style={{ 
                  animation: 'blink 1s infinite',
                  color: '#4caf50',
                  fontWeight: 'bold'
                }}>
                  |
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center',
          color: '#666',
          marginTop: '100px'
        }}>
          <h3 style={{ color: '#666' }}>Start a conversation</h3>
          <p style={{ color: '#666' }}>Send a message to begin chatting with the AI assistant.</p>
        </div>
      )}
    </div>
  );
};

export default MessageList;