/**
 * Main Layout Component
 *
 * Wraps pages with navigation header containing the app title and UserMenu.
 * The UserMenu only displays when user is authenticated.
 *
 * @example
 * ```tsx
 * <Layout>
 *   <YourPageContent />
 * </Layout>
 * ```
 */

import React from 'react'
import { UserMenu } from './auth/UserMenu'

export interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps): React.ReactElement {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          {/* App Title / Logo */}
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="font-bold text-lg hover:text-primary transition-colors"
            >
              Obsidian Note Reviewer
            </a>
          </div>

          {/* User Menu - only shows when authenticated */}
          <nav className="flex items-center gap-4">
            <UserMenu />
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main>
        {children}
      </main>
    </div>
  )
}

export default Layout
