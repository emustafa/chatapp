import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useWebSocket } from './hooks/useWebSocket';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import ChatHeader from './components/ChatHeader';
import './App.css';

function App() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [message, setMessage] = useState('');
  
  const {
    streamMessages,
    currentStreamingMessage,
    isStreaming,
    isConnected,
    status,
    connectWebSocket,
    sendMessage: sendWebSocketMessage,
    clearMessages
  } = useWebSocket(getAccessTokenSilently);

  useEffect(() => {
    if (isAuthenticated) {
      connectWebSocket();
    }
  }, [isAuthenticated, connectWebSocket]);

  const handleSendMessage = () => {
    sendWebSocketMessage(message);
    setMessage('');
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="App">
      <div style={{ 
        backgroundColor: '#fff', 
        minHeight: '100vh', 
        color: '#333',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '20px 0', 
          backgroundColor: '#f8f9fa', 
          borderBottom: '1px solid #e0e0e0',
          width: '100%'
        }}>
          <h1 style={{ color: '#333', margin: 0 }}>Message App</h1>
        </div>
        
        {!isAuthenticated ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#333' }}>
            <h2 style={{ color: '#333' }}>Please log in to continue</h2>
            <button onClick={() => loginWithRedirect()}>
              Log In
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: 'calc(100vh - 80px)',
            width: '100%',
            maxWidth: '800px',
            position: 'relative'
          }}>
            <ChatHeader
              userName={user?.name || 'User'}
              isConnected={isConnected}
              streamMessages={streamMessages}
              clearMessages={clearMessages}
              logout={handleLogout}
            />

            <MessageList
              streamMessages={streamMessages}
              currentStreamingMessage={currentStreamingMessage}
              isStreaming={isStreaming}
            />

            <MessageInput
              message={message}
              setMessage={setMessage}
              sendMessage={handleSendMessage}
              isConnected={isConnected}
              status={status}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
