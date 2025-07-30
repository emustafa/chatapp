import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-client';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});