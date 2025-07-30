# Message App

A React TypeScript client with OAuth authentication and Node.js TypeScript server using DynamoDB.

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
REACT_APP_AUTH0_AUDIENCE=your-auth0-api-identifier
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
OPENAI_API_KEY=your-openapi-key
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
