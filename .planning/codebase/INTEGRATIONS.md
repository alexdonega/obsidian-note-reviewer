# External Integrations

**Analysis Date:** 2024-02-04

## APIs & External Services

**Authentication:**
- Clerk - Primary authentication provider
  - SDK: Built-in Next.js/Clerk integration
  - Auth: Environment variables (CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

**AI/ML:**
- OpenRouter - AI chat and content generation
  - API Key: OPENROUTER_API_KEY
  - Used for: AI-powered note reviews and content generation

**Database & Backend:**
- Supabase - Backend-as-a-Service
  - Connection: DATABASE_URL
  - Client: @supabase/supabase-js
  - Used for: Database, auth, storage, edge functions

**Rate Limiting:**
- Upstash Rate Limit - API rate limiting
  - SDK: @upstash/ratelimit
  - Config: Environment-based configuration

**Redis:**
- Upstash Redis - Caching and rate limiting
  - Client: @upstash/redis
  - Used for: Session caching and rate limiting

## Data Storage

**Databases:**
- PostgreSQL - Primary database
  - Connection: DATABASE_URL
  - Client: Supabase JS client
  - ORM: Direct Supabase queries

**File Storage:**
- Vercel Blob - File uploads and storage
  - Token: BLOB_READ_WRITE_TOKEN
  - Alternative: Replit Storage
  - Used for: User uploads, note attachments

**Caching:**
- Upstash Redis - Distributed caching
  - Client: @upstash/redis
  - Used for: Rate limiting and session data

## Authentication & Identity

**Auth Provider:**
- Clerk - Primary authentication
  - Implementation: Next.js Clerk provider
  - Features: User management, session handling, webhooks

**Access Control:**
- Role-based access via Clerk user IDs
- Admin access configuration through environment variables
- Clerk Webhooks for real-time sync

## Monitoring & Observability

**Error Tracking:**
- Sentry - Error monitoring and performance tracking
  - SDK: @sentry/react, @sentry/vite-plugin
  - Integration: React components and Vite build

**Analytics (Optional):**
- Google Analytics 4 - Usage analytics
  - ID: NEXT_PUBLIC_GA_ID
- Google Tag Manager - Tag management
  - ID: NEXT_PUBLIC_GTM_ID
- Meta/Facebook Pixel - Social analytics
  - ID: NEXT_PUBLIC_FACEBOOK_PIXEL_ID

## CI/CD & Deployment

**Hosting:**
- Vercel - Primary deployment platform
  - Configuration: vercel.json
  - Features: Serverless functions, edge networks

**CI Pipeline:**
- GitHub Actions - Automated testing and deployment
  - Location: .github/workflows/
  - Triggers: Push to main, pull requests

## Environment Configuration

**Required env vars:**
- Clerk authentication keys
- Supabase connection details
- Database URL
- App URL
- OpenRouter API key
- Vercel Blob token (optional)

**Secrets location:**
- Environment files (.env)
- Vercel environment variables
- Clerk dashboard configuration

## Webhooks & Callbacks

**Incoming:**
- Clerk Webhooks - User authentication events
  - Endpoint: /api/webhooks/clerk
  - Events: User created, signed in, signed out
  - Verification: WEBHOOK_SECRET

**Outgoing:**
- Vercel Blob - File upload callbacks
- Obsidian integration - Local /api/save endpoint

## Special Integrations

**Obsidian Integration:**
- Local API endpoint at /api/save
- Direct file system access to Obsidian vault
- UTF-8 encoding support
- Path validation and directory creation

**Model Context Protocol (MCP):**
- Planned integration with Claude Code
- Server: @anthropic/obsidian-mcp-server
- Tools: read_note, write_note, list_notes, search

---

*Integration audit: 2024-02-04*