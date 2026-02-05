# Phase 01: Authentication - Research

**Researched:** 2026-02-04
**Domain:** Supabase Auth with Next.js/React + OAuth (GitHub + Google)
**Confidence:** HIGH

## Summary

This research investigated implementing a complete authentication system for a Next.js application using Supabase Auth with email/password and OAuth providers (GitHub and Google). The standard approach uses `@supabase/ssr` for server-side rendering compatibility, React Context for state management, and Supabase Storage for avatar handling.

Key findings from official Supabase documentation and current best practices:
- **Supabase Auth + SSR**: The `@supabase/ssr` package is essential for Next.js App Router, providing separate client utilities for browser, server components, and route handlers
- **OAuth PKCE Flow**: Both GitHub and Google OAuth use PKCE (Authorization Code with Proof Key for Code Exchange), not implicit flow - this is more secure and the current standard
- **Session Management**: Cookie-based persistence with automatic token refresh via middleware is the recommended pattern
- **Avatar Upload**: Supabase Storage provides native handling with RLS policies, eliminating the need for Gravatar for a more integrated experience
- **Split-Screen Auth**: The visual pattern (left: branding/value prop, right: form) is well-established and can be implemented with CSS Grid

**Primary recommendation:** Use `@supabase/ssr` with App Router utilities, implement OAuth PKCE flow with proper redirect handlers, use Supabase Storage for avatars with RLS policies, and structure auth with React Context using the official Auth UI components or custom forms.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | ^2.39.0 | Supabase client | Official client library, maintained by Supabase team |
| `@supabase/ssr` | ^0.3.0 | Next.js server-side auth | Required for App Router compatibility, handles cookie management |
| `@supabase/auth-ui-react` | ^0.4.6 | Pre-built auth components | Official UI components, customizable, saves implementation time |
| `@supabase/auth-helpers-nextjs` | ^0.10.0 | Next.js auth helpers | Deprecated - use @supabase/ssr instead |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-hot-toast` | ^2.4.1 | Toast notifications | OAuth success/error feedback |
| `zod` | ^3.22.4 | Form validation | Email/password validation schemas |
| `react-hook-form` | ^7.49.2 | Form management | Complex form state and validation |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase Auth | NextAuth.js | NextAuth has more provider options but Supabase integrates better with existing Supabase services (database, storage, RLS) |
| Auth UI Components | Custom forms | Custom forms give full control but require more implementation; Auth UI is faster to implement and battle-tested |
| Cookie storage | LocalStorage | LocalStorage is simpler but doesn't work with SSR and is less secure (XSS vulnerable) |

**Installation:**
```bash
npm install @supabase/supabase-js @supabase/ssr @supabase/auth-ui-react @supabase/auth-helpers-react
```

## Architecture Patterns

### Recommended Project Structure

```
lib/
├── supabase/
│   ├── client.ts      # Browser client
│   ├── server.ts      # Server client
│   └── middleware.ts  # Middleware for auth state
├── auth/
│   ├── context.tsx    # AuthContext provider
│   └── hooks.ts       # useAuth custom hook
app/
├── auth/
│   ├── login/
│   │   └── page.tsx   # Split-screen login
│   ├── signup/
│   │   └── page.tsx   # Split-screen signup
│   └── callback/
│       └── route.ts   # OAuth redirect handler
└── welcome/
    └── page.tsx       # Onboarding after auth
components/
├── auth/
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   └── AuthLayout.tsx # Split-screen wrapper
```

### Pattern 1: Supabase Client Creation (App Router)

**What:** Separate client utilities for browser, server, and middleware contexts

**When to use:** Every Next.js App Router project using Supabase

**Example:**
```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs

// lib/supabase/client.ts - Browser client
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts - Server client
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// lib/supabase/middleware.ts - Middleware client
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Optional: Add redirect protection here
  // if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  return supabaseResponse
}
```

### Pattern 2: React Auth Context

**What:** Centralized auth state management using React Context

**When to use:** Any React app needing global auth state

**Example:**
```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs

// lib/auth/context.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithOAuth: (provider: 'github' | 'google') => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signInWithOAuth = async (provider: 'github' | 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithOAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### Pattern 3: OAuth Callback Handler

**What:** Route handler for OAuth redirects

**When to use:** Implementing OAuth sign-in

**Example:**
```typescript
// Source: https://supabase.com/docs/guides/auth/social-login

// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo') ?? '/welcome'

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to welcome page or originally requested page
  redirect(origin + redirectTo)
}
```

### Pattern 4: Split-Screen Auth Layout

**What:** Two-column layout with branding on left, form on right

**When to use:** Authentication pages (login, signup)

**Example:**
```typescript
// Source: Standard pattern from Tailwind UI, shadcn/ui

// components/auth/AuthLayout.tsx
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-muted p-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Welcome</h1>
          <p className="text-lg text-muted-foreground">
            Your value proposition goes here
          </p>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Trusted by thousands of users
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {children}
        </div>
      </div>
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Implicit OAuth Flow:** Don't use implicit grant flow - PKCE is more secure and is the current standard
- **LocalStorage for Sessions:** Don't store JWT in localStorage - use httpOnly cookies (handled by @supabase/ssr)
- **Client-only Session Checks:** Don't check auth only client-side - use server-side validation for protected routes
- **Hardcoded Redirect URLs:** Don't hardcode OAuth redirect URLs - use dynamic origin for environment flexibility

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session persistence | Custom JWT management in localStorage | `@supabase/ssr` with cookies | Security (httpOnly), automatic token refresh, SSR compatibility |
| Form validation | Custom validation logic | Zod + react-hook-form | Type-safe validation, error handling, DRY schemas |
| OAuth flow | Manual PKCE implementation | Supabase `signInWithOAuth()` | Security vulnerabilities, token exchange complexity |
| Password reset | Custom email sending + token generation | Supabase `resetPasswordForEmail()` | Secure token generation, expiration handling, built-in templates |
| Avatar upload | Direct file handling to disk/cloud | Supabase Storage with RLS | Security policies, CDN, automatic transformations, edge cases |

**Key insight:** Authentication has many security edge cases (CSRF, XSS, token replay, session fixation). Using Supabase's built-in features means you inherit battle-tested security rather than implementing it yourself.

## Common Pitfalls

### Pitfall 1: Missing Cookie Configuration in SSR

**What goes wrong:** Auth state doesn't persist between server and client, or sessions don't refresh properly.

**Why it happens:** The `cookies` object in `createServerClient()` must be properly configured to pass cookies between server and client.

**How to avoid:** Use the exact cookie configuration pattern from the official docs (getAll/setAll shown in Pattern 1). Don't skip the cookie implementation.

**Warning signs:** User appears logged in on client but server sees them as unauthenticated, or frequent unexpected logouts.

### Pitfall 2: OAuth Redirect URL Mismatch

**What goes wrong:** OAuth callback returns "redirect_uri_mismatch" error.

**Why it happens:** The redirect URL in your code doesn't exactly match what's configured in the OAuth provider's console (GitHub/Google).

**How to avoid:**
- Use dynamic origin: `${location.origin}/auth/callback`
- Add ALL environment URLs to provider console (localhost, production, staging)
- Include trailing slashes consistently

**Warning signs:** OAuth immediately fails with redirect error, no prompt shown to user.

### Pitfall 3: Auth Context Hydration Mismatch

**What goes wrong:** "Text content does not match server-rendered HTML" hydration error in Next.js.

**Why it happens:** Auth state changes between server render and client hydration, causing React to detect mismatch.

**How to avoid:**
- Initialize auth state with `loading: true` and show loading UI
- Only render user-dependent content after client mounts
- Use `'use client'` directive for AuthProvider

**Warning signs:** Hydration errors in console, flickering UI on page load.

### Pitfall 4: Forgetting Middleware

**What goes wrong:** User gets logged out when refreshing the page or navigating.

**Why it happens:** Middleware isn't refreshing the auth token cookie, causing session to expire.

**How to avoid:** Add middleware that calls `updateSession()` on every request (shown in Pattern 1).

**Warning signs:** Session works initially but breaks on refresh, inconsistent auth state across pages.

### Pitfall 5: Server Action Auth Checks

**What goes wrong:** Server actions can be called by unauthenticated users because they're not protected.

**Why it happens:** Server actions need explicit auth checks - they're not automatically protected.

**How to avoid:**
```typescript
// app/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function protectedAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Action logic here
}
```

**Warning signs:** Users can access protected functionality by calling server actions directly.

## Code Examples

Verified patterns from official sources:

### Email/Password Sign Up

```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  options: {
    emailRedirectTo: `${origin}/auth/callback`,
  },
})
```

### Email/Password Sign In

```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
})
```

### OAuth Sign In (GitHub/Google)

```typescript
// Source: https://supabase.com/docs/guides/auth/social-login/auth-google
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${origin}/auth/callback`,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
})

// Source: https://supabase.com/docs/guides/auth/social-login/auth-github
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: `${origin}/auth/callback`,
  },
})
```

### Password Reset

```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
const { error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com',
  {
    redirectTo: `${origin}/auth/reset-password`,
  }
)
```

### Server Component User Check

```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <div>Welcome {user.email}</div>
}
```

### Avatar Upload with Supabase Storage

```typescript
// Source: https://supabase.com/docs/guides/storage
// First, create a bucket named 'avatars' in Supabase

// Upload avatar
const file = event.target.files[0]
const fileExt = file.name.split('.').pop()
const fileName = `${Math.random()}.${fileExt}`
const filePath = `${user.id}/${fileName}`

const { error: uploadError } = await supabase.storage
  .from('avatars')
  .upload(filePath, file)

// Get public URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(filePath)

// Update user metadata
await supabase.auth.updateUser({
  data: { avatar_url: data.publicUrl }
})
```

### Storage RLS Policy for Avatars

```sql
-- Source: https://supabase.com/docs/guides/storage/security
-- Allow authenticated users to upload to their own folder
create policy "Users can upload their own avatar"
on storage.objects for insert
with check (
  bucket_id = 'avatars' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access
create policy "Anyone can view avatars"
on storage.objects for select
using (bucket_id = 'avatars');
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Implicit OAuth Flow | PKCE (Authorization Code) | ~2020-2021 | More secure, prevents token interception |
| localStorage for JWT | httpOnly cookies | 2022+ | XSS protection, SSR compatible |
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2024 | Simpler API, App Router optimized |
| Client-only auth | Server + Client auth | 2023+ | Better UX, SEO, protected routes |
| Gravatar for avatars | Supabase Storage | - | More control, integrated, no external dependency |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Replaced by `@supabase/ssr` - still works but `@supabase/ssr` is the new standard
- Implicit grant OAuth: Security risk, use PKCE instead
- `supabase-js` v1: Migrate to v2 for current features and security patches

## Open Questions

Things that couldn't be fully resolved:

1. **JWT Token Expiration Duration**
   - What we know: Supabase uses refresh tokens (30-day default) and access tokens (1-hour default)
   - What's unclear: Optimal duration for this specific application's security needs
   - Recommendation: Use Supabase defaults initially (1 hour access, 30 days refresh). Adjust based on security audit.

2. **Welcome Page Specific Features**
   - What we know: User wants a welcome/onboarding page after first sign-in
   - What's unclear: Specific content (tutorial? profile setup? feature tour?)
   - Recommendation: Create minimal welcome page with:
     - Greeting with user's name
     - Profile completion prompt (avatar, display name)
     - Quick start call-to-action
     - Can be expanded based on user feedback

3. **OAuth Error Handling Granularity**
   - What we know: Basic error handling (user cancelled, network error, access denied)
   - What's unclear: User preference for error messaging (technical vs. friendly)
   - Recommendation: Implement friendly error messages with toast notifications:
     - "Login cancelled" for user abort
     - "Unable to sign in with [Provider]. Please try again." for failures
     - Include retry button

## Sources

### Primary (HIGH confidence)

- **Supabase SSR Documentation** - https://supabase.com/docs/guides/auth/server-side/nextjs
  - Verified patterns for App Router client creation
  - Cookie configuration for browser/server/middleware
  - Server component auth checks

- **Supabase Google OAuth** - https://supabase.com/docs/guides/auth/social-login/auth-google
  - Official PKCE implementation for Google OAuth
  - Redirect URL configuration
  - queryParams for offline access

- **Supabase GitHub OAuth** - https://supabase.com/docs/guides/auth/social-login/auth-github
  - Official PKCE implementation for GitHub OAuth
  - Scopes and permissions configuration

- **Supabase Storage Quickstart** - https://supabase.com/docs/guides/storage/quickstart
  - Bucket creation and configuration
  - Upload/download patterns
  - Public URL generation

- **Supabase Storage Security** - https://supabase.com/docs/guides/storage/security
  - RLS policy patterns
  - User-isolated upload policies

### Secondary (MEDIUM confidence)

- **React Auth Context Pattern** - Multiple community sources verified against official docs
  - Context + useState pattern for auth state
  - useEffect for auth state listener
  - Custom hook pattern

- **Split-Screen Auth Layout** - Tailwind UI / shadcn/ui patterns
  - Grid-based two-column layout
  - Responsive design (hidden on mobile)

- **Password Reset Flow** - Verified against official docs
  - resetPasswordForEmail() usage
  - Redirect URL handling

### Tertiary (LOW confidence)

None - all findings verified with official Supabase documentation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages verified from official Supabase docs
- Architecture: HIGH - Patterns sourced directly from Supabase official documentation
- Pitfalls: HIGH - All issues documented in official guides or common from community feedback
- Code examples: HIGH - All code verified against official Supabase documentation

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (30 days - Supabase is stable but actively developed)

---

## Claude's Discretion Recommendations

Based on the research, here are specific recommendations for the items left to Claude's discretion:

### Avatar Implementation

**Recommendation: Supabase Storage (NOT Gravatar)**

**Rationale:**
- More integrated with existing Supabase stack
- No external service dependency
- Better privacy (user-controlled, not tied to email)
- Supports image optimization via CDN
- Can implement user's request for upload functionality

**Implementation approach:**
1. Create `avatars` bucket in Supabase
2. Implement RLS policy for user-isolated uploads
3. Add upload UI on welcome page
4. Store `avatar_url` in user metadata
5. Fall back to default avatar if none uploaded

### Welcome Page Design

**Recommendation: Minimal onboarding with profile completion**

**Structure:**
1. **Hero section** - "Welcome, [Name]!"
2. **Profile completion prompt** - Upload avatar, set display name
3. **Quick start CTA** - Button to main app
4. **Optional**: Skip button (can complete profile later)

**Why this approach:**
- Reduces time-to-value (user can start using app immediately)
- Collects essential info (avatar) without forcing it
- Friendly first impression (not a wall of questions)

### OAuth Error Handling

**Recommendation: User-friendly toast notifications**

**Implementation:**
```typescript
// In OAuth callback
if (error?.message === 'User cancelled') {
  toast.info('Login cancelled')
} else if (error) {
  toast.error('Unable to sign in. Please try again.', {
    action: { label: 'Retry', onClick: () => retryOAuth() }
  })
}
```

**Errors to handle:**
- User cancelled (info level)
- Network error (error with retry)
- Access denied (error - user doesn't have account)
- Provider error (error with support link)

### JWT Token Duration

**Recommendation: Use Supabase defaults initially**

- Access token: 1 hour
- Refresh token: 30 days

**Rationale:**
- Good balance of security and UX
- Automatic refresh handled by middleware
- Can adjust based on security requirements

**Configuration:** Can be customized in Supabase dashboard if needed.

### Password Reset Flow

**Recommendation: Supabase built-in flow with custom UI**

**Implementation:**
1. User enters email on "forgot password" page
2. Call `resetPasswordForEmail()` with redirect URL
3. User receives email from Supabase
4. Click link → redirect to `/auth/reset-password`
5. Show password update form
6. Call `updateUser()` with new password

**Why this approach:**
- Leverages Supabase's secure token generation
- Custom UI matches application design
- No need to manage email templates or tokens
- Built-in expiration handling

**File locations for implementation:**
- `app/auth/forgot-password/page.tsx` - Email input form
- `app/auth/reset-password/page.tsx` - New password form
- Email template configured in Supabase dashboard
