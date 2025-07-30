import React from 'react';

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  sendMessage: () => void;
  isConnected: boolean;
  status: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  message,
  setMessage,
  sendMessage,
  isConnected,
  status
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ 
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '800px',
      padding: '20px',
      borderTop: '1px solid #e0e0e0',
      backgroundColor: '#fff',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      borderRadius: '10px 10px 0 0',
      zIndex: 1000
    }}>
      {status && (
        <p style={{ 
          marginBottom: '10px', 
          fontWeight: 'bold', 
          fontSize: '14px', 
          color: '#666' 
        }}>
          {status}
        </p>
      )}
      
      <div style={{ 
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-end'
      }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          style={{ 
            flex: 1,
            minHeight: '50px',
            maxHeight: '150px',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            resize: 'none',
            fontFamily: 'inherit',
            fontSize: '15px'
          }}
          disabled={!isConnected}
          onKeyPress={handleKeyPress}
        />
        <button 
          onClick={sendMessage} 
          style={{ 
            padding: '12px 24px',
            backgroundColor: isConnected && message.trim() ? '#007bff' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isConnected && message.trim() ? 'pointer' : 'not-allowed',
            fontSize: '15px',
            fontWeight: 'bold'
          }}
          disabled={!isConnected || !message.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageInput;