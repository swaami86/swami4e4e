# AI Image Generator API

## Overview

This is a Cloudflare Workers-based AI image generation API that provides tiered subscription access to AI-powered image creation capabilities. The system implements a comprehensive rate limiting and subscription management system with multiple tiers ranging from free to enterprise plans. It features gift code functionality, usage tracking, and integrates with RapidAPI for monetization. The API is designed as a standalone service without frontend dependencies, focusing purely on API endpoints for image generation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### API-First Architecture
The system follows an API-only approach, designed specifically for Cloudflare Workers environment. This serverless architecture provides global edge deployment, automatic scaling, and low-latency responses. The choice eliminates server maintenance overhead while ensuring high availability and performance.

### Subscription Tier System
Implements a multi-tier subscription model with five distinct plans:
- **Free Tier**: 25 daily requests for basic usage
- **Gift Tiers**: Time-limited promotional access (999 and 1499 images)
- **Paid Tiers**: Starter (500/day) and Enterprise (5000/day) with recurring billing

This tiered approach allows for flexible monetization while providing clear upgrade paths for users. The system tracks both daily limits and total image quotas where applicable.

### Rate Limiting & Usage Tracking
Built-in rate limiting system operates on 24-hour windows with per-tier request limits. The architecture supports both daily recurring limits and total lifetime quotas for gift tiers. This dual-limit system provides flexibility for promotional campaigns while maintaining service sustainability.

### Gift Code Management
Implements a code-based promotional system with tracking for usage status and creation timestamps. This allows for marketing campaigns, user acquisition, and customer retention strategies without compromising the core subscription model.

### Database Layer
Utilizes Neon Database (PostgreSQL) with Drizzle ORM for data persistence. This choice provides ACID compliance for subscription tracking, usage analytics, and user management. Drizzle offers type-safe database operations while maintaining compatibility with edge computing environments.

### Authentication & Session Management
Implements bcrypt-based password hashing for secure user authentication. Uses session-based authentication with PostgreSQL session storage via connect-pg-simple, ensuring secure and scalable user management across the distributed Cloudflare Workers network.

## External Dependencies

### Core Infrastructure
- **Cloudflare Workers**: Serverless compute platform for API hosting
- **Neon Database**: PostgreSQL-compatible database for data persistence
- **RapidAPI**: API marketplace integration for monetization and distribution

### Development & Build Tools
- **Vite**: Modern build tool for asset bundling and optimization
- **esbuild**: Fast JavaScript bundler for server-side code compilation
- **TypeScript**: Type-safe development with tsx for development server
- **Drizzle Kit**: Database migration and schema management tool

### UI Component Libraries
- **Radix UI**: Comprehensive React component library for accessible UI components
- **React Query**: Data fetching and state management for API interactions
- **React Hook Form**: Form management with validation resolvers

### Utility Libraries
- **axios**: HTTP client for external API communications
- **bcryptjs**: Password hashing and security utilities
- **class-variance-authority**: Utility for conditional CSS class management
- **date-fns**: Date manipulation and formatting utilities
- **clsx**: Conditional className utility for dynamic styling