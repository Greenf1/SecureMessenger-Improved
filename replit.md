# WhatsApp-like Chat Platform with Calculator Login

## Overview

This is a full-stack web application that mimics WhatsApp functionality with a unique twist - users authenticate through a calculator-style login interface. The application is built with React frontend, Express backend, and uses PostgreSQL with Drizzle ORM for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Animations**: Framer Motion for smooth UI transitions
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Session Management**: Built-in memory storage (development)
- **API Design**: RESTful endpoints with JSON responses

## Key Components

### Authentication System
- **Login Method**: Calculator-style interface where users enter access codes
- **Access Codes**: Simple numeric codes stored in database (1234, 5678, 9999, 0000)
- **Session Management**: Server-side sessions with user ID storage
- **Error Handling**: Generic error messages maintaining calculator appearance

### Chat System
- **Real-time Updates**: Polling-based message refresh (3-second intervals)
- **Message Storage**: PostgreSQL with user association
- **Message Display**: WhatsApp-style UI with timestamps
- **User Interface**: Clean, modern design with green accent colors

### Database Schema
- **Users Table**: id, username, access_code, is_active
- **Messages Table**: id, user_id, content, timestamp
- **Relationships**: Foreign key relationship between messages and users

## Data Flow

1. **Authentication Flow**:
   - User enters code on calculator interface
   - Frontend sends POST request to `/api/login`
   - Backend validates code against database
   - Session created on successful authentication
   - User redirected to chat dashboard

2. **Chat Flow**:
   - Messages fetched via GET `/api/messages`
   - New messages sent via POST `/api/messages`
   - Automatic refresh every 3 seconds
   - Real-time-like experience through polling

3. **Data Persistence**:
   - All data stored in PostgreSQL
   - Drizzle ORM handles database operations
   - Schema migrations managed through Drizzle Kit

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives with shadcn/ui
- **Styling**: Tailwind CSS with custom CSS variables
- **Icons**: Lucide React icons
- **Animations**: Framer Motion
- **HTTP Client**: Native fetch API with TanStack Query

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Validation**: Zod for schema validation
- **Session**: Memory storage (development mode)

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution
- **Database**: Neon PostgreSQL with connection pooling
- **Environment**: NODE_ENV=development

### Production Build
- **Frontend**: Vite build to `dist/public`
- **Backend**: esbuild compilation to `dist/index.js`
- **Database**: Production PostgreSQL via DATABASE_URL
- **Deployment**: Single server deployment with static file serving

### Database Management
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Environment-based DATABASE_URL configuration
- **Dialect**: PostgreSQL with serverless connection pooling

## Notable Design Decisions

### Calculator Login Interface
- **Rationale**: Provides unique, disguised access to the platform
- **Implementation**: Custom calculator UI with code validation
- **Security**: Generic error messages prevent information leakage
- **UX**: Smooth animations and visual feedback

### Memory Storage for Development
- **Current**: In-memory user and message storage
- **Future**: Will be replaced with PostgreSQL in production
- **Benefit**: Rapid development without database complexity
- **Limitation**: Data persistence only during server runtime

### Polling vs WebSockets
- **Choice**: 3-second polling for message updates
- **Rationale**: Simpler implementation, adequate for demo purposes
- **Alternative**: WebSockets for true real-time messaging
- **Trade-off**: Slight delay vs implementation complexity

### Monorepo Structure
- **Organization**: Shared schema between frontend and backend
- **Benefits**: Type safety across full stack
- **Structure**: `client/`, `server/`, `shared/` directories
- **Build**: Separate build processes for each component