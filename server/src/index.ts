import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-client';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const app = express();
const PORT = process.env.PORT || 3001;

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const dynamodb = DynamoDBDocumentClient.from(dynamoClient);

const authClient = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

function getKey(header: any, callback: any) {
  authClient.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    if (!key) {
      return callback(new Error('Unable to find a signing key that matches'));
    }
    const signingKey = key.publicKey;
    callback(null, signingKey);
  });
}

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, getKey, {
    audience: process.env.AUTH0_AUDIENCE,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    algorithms: ['RS256']
  }, async (err: any, decoded: any) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.sendStatus(403);
    }

    try {
      const userId = decoded.sub;
      
      const userParams = {
        TableName: 'Users',
        Key: { userId }
      };

      let user = await dynamodb.send(new GetCommand(userParams));

      if (!user.Item) {
        const newUser = {
          userId,
          email: decoded.email,
          name: decoded.name,
          createdAt: new Date().toISOString()
        };

        await dynamodb.send(new PutCommand({
          TableName: 'Users',
          Item: newUser
        }));

        user.Item = newUser;
      }

      const sessionParams = {
        TableName: 'Sessions',
        Item: {
          sessionId: `${userId}_${Date.now()}`,
          userId,
          token,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      };

      await dynamodb.send(new PutCommand(sessionParams));

      req.user = user.Item;
      next();
    } catch (error) {
      console.error('Database error:', error);
      return res.sendStatus(500);
    }
  });
};

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());

app.post('/api/message', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const user = req.user;

    console.log(`Message received from ${user.email}: ${message}`);

    res.json({ ack: true, message: 'Message received successfully' });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ ack: false, error: 'Internal server error' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const server = createServer(app);
const wss = new WebSocketServer({ server });

// WebSocket authentication helper
const authenticateWebSocket = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256']
    }, async (err: any, decoded: any) => {
      if (err) {
        return reject(err);
      }

      try {
        const userId = decoded.sub;
        
        const userParams = {
          TableName: 'Users',
          Key: { userId }
        };

        let user = await dynamodb.send(new GetCommand(userParams));

        if (!user.Item) {
          const newUser = {
            userId,
            email: decoded.email,
            name: decoded.name,
            createdAt: new Date().toISOString()
          };

          await dynamodb.send(new PutCommand({
            TableName: 'Users',
            Item: newUser
          }));

          user.Item = newUser;
        }

        const sessionParams = {
          TableName: 'Sessions',
          Item: {
            sessionId: `${userId}_${Date.now()}`,
            userId,
            token,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        };

        await dynamodb.send(new PutCommand(sessionParams));

        resolve(user.Item);
      } catch (error) {
        reject(error);
      }
    });
  });
};

// AI-like response generator
const generateAIResponse = (userMessage: string): string[] => {
  const responses = [
    "I understand your question about",
    "That's an interesting point you've raised regarding",
    "Let me think about this carefully. When it comes to",
    "Based on what you've mentioned about",
    "I appreciate you sharing your thoughts on",
    "This is a fascinating topic that relates to",
    "From my perspective on",
    "I'd like to explore the concept of",
    "Your message about",
    "This reminds me of important considerations around"
  ];

  const middleParts = [
    "the complexity of modern systems and how they interact with",
    "various approaches that could be implemented to address",
    "the underlying principles that govern how we understand",
    "different methodologies that researchers have developed for",
    "emerging trends in technology that are reshaping",
    "fundamental concepts that help us better comprehend",
    "innovative solutions that have been proposed to tackle",
    "the relationship between theory and practice when dealing with",
    "various factors that contribute to our understanding of",
    "the evolution of ideas surrounding"
  ];

  const endings = [
    "human-computer interaction in digital environments.",
    "sustainable development and environmental consciousness.",
    "artificial intelligence and machine learning applications.",
    "collaborative problem-solving in distributed teams.",
    "data privacy and security in connected systems.",
    "user experience design and accessibility standards.",
    "cognitive science and behavioral psychology research.",
    "economic models and market dynamics analysis.",
    "educational technology and learning methodologies.",
    "social media influence and digital communication patterns."
  ];

  const start = responses[Math.floor(Math.random() * responses.length)];
  const middle = middleParts[Math.floor(Math.random() * middleParts.length)];
  const end = endings[Math.floor(Math.random() * endings.length)];

  const fullResponse = `${start} ${userMessage.toLowerCase()}. ${middle} ${end}`;
  const words = fullResponse.split(' ');
  
  // Limit to maximum 50 words
  const maxWords = Math.min(50, Math.floor(Math.random() * 45) + 10); // Random between 10-50 words
  return words.slice(0, maxWords);
};

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection attempt');
  
  let user: any = null;
  let isAuthenticated = false;
  let messageInterval: NodeJS.Timeout | null = null;

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      if (message.type === 'auth') {
        try {
          user = await authenticateWebSocket(message.token);
          isAuthenticated = true;
          console.log(`WebSocket authenticated for user: ${user.email}`);
          
          ws.send(JSON.stringify({
            type: 'auth_success',
            user: { name: user.name, email: user.email }
          }));
        } catch (error) {
          console.error('WebSocket authentication failed:', error);
          ws.send(JSON.stringify({
            type: 'auth_error',
            message: 'Authentication failed'
          }));
          ws.close();
        }
      } else if (message.type === 'message' && isAuthenticated) {
        console.log(`Message received from ${user.email}: ${message.content}`);
        
        ws.send(JSON.stringify({
          type: 'message_received',
          content: message.content
        }));

        // Generate AI response and stream word by word
        if (messageInterval) {
          clearInterval(messageInterval);
        }

        const responseWords = generateAIResponse(message.content);
        let wordIndex = 0;
        let currentResponse = '';
        
        // Decide randomly if we'll stop early (30% chance)
        const willStopEarly = Math.random() < 0.3;
        const stopAtWord = willStopEarly ? Math.floor(Math.random() * (responseWords.length - 5)) + 5 : responseWords.length;
        
        // Send stream start signal
        ws.send(JSON.stringify({
          type: 'stream_start'
        }));

        messageInterval = setInterval(() => {
          if (ws.readyState === ws.OPEN && wordIndex < stopAtWord) {
            const word = responseWords[wordIndex];
            currentResponse += (wordIndex === 0 ? '' : ' ') + word;
            
            ws.send(JSON.stringify({
              type: 'stream_message',
              content: (wordIndex === 0 ? '' : ' ') + word,
              timestamp: new Date().toISOString()
            }));
            
            wordIndex++;
            
            // If we've sent all words or reached the stop point, end the stream
            if (wordIndex >= stopAtWord || wordIndex >= responseWords.length) {
              clearInterval(messageInterval!);
              
              ws.send(JSON.stringify({
                type: 'stream_end',
                timestamp: new Date().toISOString()
              }));
            }
          } else {
            clearInterval(messageInterval!);
            
            ws.send(JSON.stringify({
              type: 'stream_end',
              timestamp: new Date().toISOString()
            }));
          }
        }, Math.random() * 200 + 100); // Random interval between 100-300ms per word
      } else if (!isAuthenticated) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Please authenticate first'
        }));
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    if (messageInterval) {
      clearInterval(messageInterval);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    if (messageInterval) {
      clearInterval(messageInterval);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server is ready`);
});