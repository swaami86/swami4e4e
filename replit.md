# Overview

This is a full-stack web application built with React and Express that provides an AI-powered image generation service. The application acts as a proxy/wrapper around the Pollinations.ai API, offering a user-friendly interface for generating images with various AI models like Flux. It features a modern web interface, gallery system for sharing generated images, comprehensive API documentation, and rate limiting for fair usage.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with React 18 using Vite as the build tool. It implements a component-based architecture with:
- **Routing**: Uses Wouter for client-side routing with pages for home, gallery, API docs, and 404
- **State Management**: TanStack Query for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui styling system for consistent design
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Theme System**: Light/dark mode support with persistent theme storage

## Backend Architecture
The backend uses Express.js with TypeScript in ESM format:
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Services Layer**: Modular services for Pollinations API integration and rate limiting
- **Storage Layer**: Abstracted storage interface with database implementation
- **API Routes**: RESTful endpoints for image generation, gallery, and rating system

## Database Design
PostgreSQL database with four main tables:
- **users**: Basic user authentication (currently unused but structured for future auth)
- **generated_images**: Stores image metadata, URLs, parameters, and engagement metrics
- **image_ratings**: Tracks user ratings (likes/dislikes) with IP-based identification
- **api_usage**: Rate limiting data tracking API usage per IP and endpoint

## External Service Integration
- **Pollinations.ai**: Primary AI image generation service with support for multiple models
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Rate Limiting**: Custom implementation to prevent API abuse with configurable limits per endpoint type

## Development & Deployment Architecture
- **Build System**: Vite for frontend bundling, esbuild for backend compilation
- **Development**: Hot module replacement for frontend, tsx for backend development server
- **Production**: Static frontend serving with Express backend, designed for Node.js deployment
- **Database Migrations**: Drizzle Kit for schema management and migrations

## Key Design Decisions
- **Monorepo Structure**: Shared schema and types between frontend/backend in `/shared` directory
- **Type Safety**: Full TypeScript coverage with Zod validation for API contracts
- **Serverless Ready**: Connection pooling and stateless design for serverless deployment
- **API-First**: Well-documented REST API that can be used independently of the web interface
- **Rate Limiting**: IP-based rate limiting to ensure fair usage without requiring authentication

# External Dependencies

- **@neondatabase/serverless**: Serverless PostgreSQL client with WebSocket support
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching for React
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **axios**: HTTP client for external API requests
- **wouter**: Minimal client-side routing
- **zod**: Runtime type validation and schema definition
- **multer**: File upload handling middleware
- **connect-pg-simple**: PostgreSQL session store (prepared for future auth)