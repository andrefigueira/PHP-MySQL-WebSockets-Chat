# WebSocket Chat

A modern, real-time chat application built with PHP WebSockets and React. Originally created 12 years ago, now completely rewritten with cutting-edge technologies and best practices.

[![PHP Version](https://img.shields.io/badge/PHP-8.2%2B-777BB4?style=flat-square&logo=php)](https://php.net)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## Features

- **Real-time messaging** with WebSocket connections
- **Typing indicators** so you know when someone is writing
- **Message history** persisted to MySQL database
- **Beautiful UI** with shadcn/ui components and dark mode
- **Fully typed** with TypeScript and PHP strict types
- **Comprehensive tests** for both frontend and backend
- **React Context** for elegant state management
- **Auto-reconnection** with exponential backoff

## Tech Stack

### Backend
- PHP 8.2+ with strict types
- Ratchet WebSocket library
- PDO with prepared statements
- Monolog for logging
- PHPUnit for testing
- PSR-4 autoloading

### Frontend
- React 18 with hooks
- TypeScript for type safety
- Vite for blazing fast builds
- Tailwind CSS for styling
- shadcn/ui components
- Vitest for testing

## Quick Start

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/websocket-chat.git
   cd websocket-chat
   ```

2. **Set up the backend**
   ```bash
   # Install PHP dependencies
   composer install

   # Copy environment file
   cp .env.example .env

   # Edit .env with your database credentials
   nano .env

   # Create the database
   mysql -u root -p < database/schema.sql
   ```

3. **Set up the frontend**
   ```bash
   cd client

   # Install dependencies
   npm install

   # Create environment file (optional)
   echo "VITE_WS_URL=ws://localhost:8080" > .env.local
   ```

4. **Start the servers**

   Terminal 1 - WebSocket Server:
   ```bash
   composer serve
   # or
   php bin/server.php
   ```

   Terminal 2 - Frontend Dev Server:
   ```bash
   cd client
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:3000` and start chatting!

## Project Structure

```
.
├── bin/
│   └── server.php          # WebSocket server entry point
├── src/
│   ├── Chat/
│   │   ├── ChatServer.php  # Main WebSocket handler
│   │   ├── Client.php      # Connected client representation
│   │   ├── Message.php     # Message value object
│   │   └── MessageRepository.php
│   ├── Database/
│   │   └── Connection.php  # PDO singleton
│   └── bootstrap.php       # Application bootstrap
├── tests/
│   └── Unit/
│       └── Chat/           # PHPUnit tests
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/       # Chat components
│   │   │   └── ui/         # shadcn/ui components
│   │   ├── context/
│   │   │   └── ChatContext.tsx  # React Context
│   │   ├── hooks/
│   │   │   └── useWebSocket.ts  # WebSocket hook
│   │   ├── lib/
│   │   │   └── utils.ts    # Utility functions
│   │   └── types/
│   │       └── chat.ts     # TypeScript types
│   └── ...config files
├── database/
│   └── schema.sql          # Database schema
├── composer.json
└── README.md
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
APP_ENV=development
APP_DEBUG=true

# WebSocket Server
WS_HOST=0.0.0.0
WS_PORT=8080

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=websocket_chat
DB_USER=root
DB_PASS=your_password

# Timezone
APP_TIMEZONE=UTC
```

### Frontend Configuration

Create `client/.env.local`:

```env
VITE_WS_URL=ws://localhost:8080
```

## WebSocket Protocol

### Client Actions

```json
// Identify yourself
{ "action": "identify", "username": "John" }

// Join a conversation
{ "action": "join", "conversationId": "general" }

// Send a message
{ "action": "message", "content": "Hello, World!" }

// Typing indicator
{ "action": "typing", "isTyping": true }

// Request message history
{ "action": "history", "conversationId": "general", "limit": 50 }
```

### Server Events

```json
// Connection established
{ "type": "connected", "clientId": "uuid", "message": "..." }

// Identity confirmed
{ "type": "identified", "userId": "...", "username": "..." }

// Joined conversation
{ "type": "joined", "conversationId": "general" }

// New message
{ "type": "message", "id": "...", "content": "...", ... }

// System message
{ "type": "system", "content": "User joined the chat", ... }

// Typing indicator
{ "type": "typing", "userId": "...", "username": "...", "isTyping": true }

// Message history
{ "type": "history", "messages": [...] }
```

## Testing

### Backend Tests
```bash
# Run all tests
./vendor/bin/phpunit

# Run with coverage
./vendor/bin/phpunit --coverage-html coverage
```

### Frontend Tests
```bash
cd client

# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage
```

## Static Analysis

```bash
# PHP static analysis
composer analyse
# or
./vendor/bin/phpstan analyse src --level=6
```

## Architecture Decisions

### Why Ratchet?
Ratchet remains the most mature and battle-tested WebSocket library for PHP. It's built on ReactPHP and provides excellent performance for real-time applications.

### Why React Context?
For a chat application of this scope, React Context provides the perfect balance of simplicity and power. It allows us to share WebSocket state across components without the overhead of a full state management library.

### Why shadcn/ui?
shadcn/ui provides beautifully designed, accessible components that are copy-pasteable into your project. Unlike traditional component libraries, you own the code and can customize it however you want.

## Production Deployment

1. Build the frontend:
   ```bash
   cd client && npm run build
   ```

2. Configure your web server to serve the `client/dist` directory

3. Run the WebSocket server with a process manager:
   ```bash
   # Using supervisord
   [program:websocket-chat]
   command=php /path/to/bin/server.php
   autostart=true
   autorestart=true
   ```

4. Use a reverse proxy (nginx) for WebSocket connections:
   ```nginx
   location /ws {
       proxy_pass http://localhost:8080;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
   }
   ```

---

## Connect With Me

**Follow me on X:** [@voidmode_](https://x.com/voidmode_)

**Check out my company:** [Polyx Media](https://polyxmedia.com) - We build amazing digital experiences.

---

## License

MIT License - feel free to use this project however you'd like.

---

Built with love, rebuilt with modern tools.
