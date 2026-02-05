/**
 * Session debug hook for verifying session persistence
 *
 * Provides utilities to debug and verify session state across
 * page refreshes in Vite SPA development
 */

import { useEffect, useState } from 'react'
import { useAuth } from './context'
import {
  getSessionInfo,
  getTimeUntilSessionExpiry,
  isSessionValid,
} from '../supabase/session'
import type { SessionInfo } from '../supabase/session'

/**
 * Session debug information
 */
export interface SessionDebugInfo {
  /** Session info object */
  sessionInfo: SessionInfo | null
  /** Current timestamp */
  timestamp: string
  /** Session storage key used by Supabase */
  storageKey: string
  /** Raw session data from localStorage */
  rawSession: string | null
  /** Has session been restored from storage */
  restoredFromStorage: boolean
  /** Page load timestamp */
  pageLoadTime: string
}

/**
 * Hook to debug session persistence
 *
 * Use this hook during development to verify that sessions
 * persist correctly across page refreshes
 *
 * @example
 * ```tsx
 * function SessionDebugger() {
 *   const debug = useSessionDebug()
 *
 *   return (
 *     <div>
 *       <h3>Session Debug</h3>
 *       <pre>{JSON.stringify(debug, null, 2)}</pre>
 *     </div>
 *   )
 * }
 * ```
 */
export function useSessionDebug(): SessionDebugInfo | null {
  const { session, loading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<SessionDebugInfo | null>(null)

  useEffect(() => {
    if (loading) {
      return
    }

    // Supabase storage key format: sb-{project-id}-auth-token
    const storageKeys = Object.keys(localStorage).filter(
      (key) => key.startsWith('sb-') && key.endsWith('-auth-token')
    )
    const storageKey = storageKeys[0] || 'unknown'
    const rawSession = localStorage.getItem(storageKey)

    setDebugInfo({
      sessionInfo: session ? getSessionInfo(session) : null,
      timestamp: new Date().toISOString(),
      storageKey,
      rawSession,
      restoredFromStorage: !!rawSession && !!session,
      pageLoadTime: performance.getEntriesByType('navigation')[0]?.startTime
        ? new Date(performance.timeOrigin + performance.getEntriesByType('navigation')[0].startTime).toISOString()
        : new Date().toISOString(),
    })
  }, [session, loading])

  return debugInfo
}

/**
 * Hook to monitor session refresh events
 *
 * Use this hook to track when sessions are automatically
 * refreshed by Supabase
 *
 * @param callback - Function to call when session refreshes
 *
 * @example
 * ```tsx
 * function SessionMonitor() {
 *   const { session } = useAuth()
 *   const lastRefresh = useSessionRefreshMonitor()
 *
 *   return (
 *     <div>
 *       Last refresh: {lastRefresh || 'Never'}
 *       <p>Session expires: {formatSessionExpiry(session)}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useSessionRefreshMonitor(): string | null {
  const { session } = useAuth()
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      const refreshTime = session.user?.updated_at || session.user?.created_at
      if (refreshTime) {
        setLastRefresh(new Date(refreshTime).toISOString())
      }
    }
  }, [session])

  return lastRefresh
}

/**
 * Hook to check if session will expire soon
 *
 * Returns true when session is within warning minutes of expiry
 *
 * @param warningMinutes - Minutes before expiry to trigger warning (default: 5)
 *
 * @example
 * ```tsx
 * function SessionWarning() {
 *   const isNearingExpiry = useSessionExpiryWarning(5)
 *
 *   if (isNearingExpiry) {
 *     return <div>Session expiring soon...</div>
 *   }
 *   return null
 * }
 * ```
 */
export function useSessionExpiryWarning(warningMinutes: number = 5): boolean {
  const { session } = useAuth()
  const [isNearing, setIsNearing] = useState(false)

  useEffect(() => {
    if (!session) {
      setIsNearing(false)
      return
    }

    const msUntilExpiry = getTimeUntilSessionExpiry(session)
    const warningMs = warningMinutes * 60 * 1000
    setIsNearing(msUntilExpiry <= warningMs && msUntilExpiry > 0)

    // Check every minute
    const interval = setInterval(() => {
      const ms = getTimeUntilSessionExpiry(session)
      setIsNearing(ms <= warningMs && ms > 0)
    }, 60 * 1000)

    return () => clearInterval(interval)
  }, [session, warningMinutes])

  return isNearing
}

/**
 * Hook to get session persistence status
 *
 * Returns information about whether session persistence
 * is working correctly
 *
 * @example
 * ```tsx
 * function PersistenceStatus() {
 *   const status = useSessionPersistenceStatus()
 *
 *   return (
 *     <div>
 *       <p>Persistence: {status.isWorking ? '✓' : '✗'}</p>
 *       <p>Storage: {status.storageType}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useSessionPersistenceStatus() {
  const { session, loading } = useAuth()
  const [status, setStatus] = useState({
    isWorking: false,
    storageType: 'localStorage',
    hasSessionOnLoad: false,
  })

  useEffect(() => {
    if (loading) {
      return
    }

    // Check if Supabase storage key exists
    const storageKeys = Object.keys(localStorage).filter(
      (key) => key.startsWith('sb-') && key.endsWith('-auth-token')
    )

    setStatus({
      isWorking: storageKeys.length > 0,
      storageType: 'localStorage',
      hasSessionOnLoad: !!session,
    })
  }, [session, loading])

  return status
}
