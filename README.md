# Message App

A React TypeScript client with OAuth authentication and Node.js TypeScript server using DynamoDB.

## Features

- React TypeScript client with Auth0 OAuth integration
- Single message sending endpoint with acknowledgment
- Node.js TypeScript server with Express
- OAuth authentication handling (Auth0)
- User profiles and sessions stored in DynamoDB
- Support for Google, Apple, and Microsoft OAuth providers

## Setup

### Prerequisites

- Node.js 16+
- AWS account with DynamoDB access (brew install awscli)
- Auth0 account
- Terraform (install with `brew install terraform` on macOS)

### Auth0 Configuration

1. Create an Auth0 application
2. Configure OAuth providers (Google, Apple, Microsoft)
3. Set allowed callback URLs to `http://localhost:3000`
4. Note your domain and client ID

### Environment Setup

#### Client (.env)
```
REACT_APP_AUTH0_DOMAIN=your-auth0-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-auth0-client-id
```

#### Server (.env)
```
PORT=3001
CLIENT_URL=http://localhost:3000
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_AUDIENCE=your-auth0-api-identifier
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
```

### Installation

1. Install client dependencies:
```bash
cd client
npm install
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Configure AWS credentials:
```bash
# Option 1: Environment variables
export AWS_ACCESS_KEY_ID=your_access_key_here
export AWS_SECRET_ACCESS_KEY=your_secret_key_here
export AWS_DEFAULT_REGION=us-east-1

# Option 2: AWS CLI
aws configure
```

4. Create DynamoDB tables:
```bash
cd terraform/dynamo
terraform init
terraform plan
terraform apply
```

### Running the Application

1. Start the server:
```bash
cd server
npm run dev
```

2. Start the client:
```bash
cd client
npm start
```

The client will be available at `http://localhost:3000` and the server at `http://localhost:3001`.

## API Endpoints

- `POST /api/message` - Send a message (requires authentication)
- `GET /health` - Health check endpoint

## Authentication Flow

1. User clicks "Log In" button
2. Redirected to Auth0 for OAuth authentication
3. Upon successful login, user profile is created/updated in DynamoDB
4. Session is stored in DynamoDB
5. User can send messages through the authenticated endpoint