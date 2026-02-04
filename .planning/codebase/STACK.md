# Technology Stack

**Analysis Date:** 2024-02-04

## Languages

**Primary:**
- TypeScript 5.8.2 - All application code, frontend and backend
- JavaScript (ES2022) - Runtime and compilation target

**Secondary:**
- HTML5 - Frontend markup
- CSS/Tailwind - Styling

## Runtime

**Environment:**
- Bun 1.0.0+ - Package manager and runtime
- Node.js 22.14.0+ - TypeScript types

**Package Manager:**
- Bun - Primary package manager and runtime
- Workspaces - Monorepo management

## Frameworks

**Core:**
- React 19.2.3 - Frontend UI framework
- Vite 6.2.0 - Build tool and development server
- Tailwind CSS 4.1.18 - Styling framework

**Testing:**
- Testing Library 16.3.1 - React testing utilities
- Jest DOM 6.9.1 - DOM assertion extensions
- Happy DOM 20.0.11 - DOM implementation for testing

**Build/Dev:**
- ESLint 9.39.2 - Code linting
- TypeScript 5.8.2 - Type checking
- Vite 6.2.0 - Build tooling
- Rollup - Bundling (via Vite)

## Key Dependencies

**Critical:**
- React 19.2.3 - Core UI framework
- React DOM 19.2.3 - DOM rendering
- React Router 7.11.0 - Routing
- TypeScript 5.8.2 - Type safety

**Infrastructure:**
- Supabase 2.89.0 - Database and backend services
- Clerk - Authentication
- Sentry 10.32.1 - Error tracking

**UI Components:**
- Heroicons 2.2.0 - Icon library
- Lucide React 0.460.0 - Alternative icon library
- Tailwind CSS 4.1.18 - Styling

## Configuration

**Environment:**
- Environment variables (.env, .env.example)
- Environment-specific configurations for development/production

**Build:**
- TypeScript configuration in each package
- Vite configuration for each app
- ESLint configuration
- Tailwind CSS configuration

**Package Structure:**
- Workspaces defined in root package.json
- Path aliases for cross-package imports

## Platform Requirements

**Development:**
- Bun runtime
- Node.js 22.14.0+ (for TypeScript types)
- Git for version control

**Production:**
- Vercel deployment platform
- PostgreSQL database (via Supabase)
- Redis caching (via Upstash)
- Blob storage (Vercel Blob or Replit Storage)

---

*Stack analysis: 2024-02-04*