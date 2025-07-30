import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import './App.css';

function App() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const sendMessage = async () => {
    if (!message.trim()) {
      setStatus('Please enter a message');
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const response = await axios.post('http://localhost:3001/api/message', {
        message: message
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.ack) {
        setStatus('Message sent successfully!');
        setMessage('');
      }
    } catch (error) {
      setStatus('Failed to send message');
      console.error('Error sending message:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="App">
      <header className="App-header">
        <h1>Message App</h1>
        
        {!isAuthenticated ? (
          <div>
            <h2>Please log in to continue</h2>
            <button onClick={() => loginWithRedirect()}>
              Log In
            </button>
          </div>
        ) : (
          <div>
            <h2>Welcome, {user?.name}!</h2>
            <div style={{ margin: '20px 0' }}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message here..."
                style={{ width: '300px', height: '100px', padding: '10px' }}
              />
            </div>
            <div>
              <button onClick={sendMessage} style={{ marginRight: '10px' }}>
                Send Message
              </button>
              <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                Log Out
              </button>
            </div>
            {status && <p style={{ marginTop: '10px' }}>{status}</p>}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
