/**
 * Logout Button Component
 *
 * Button that signs out the user with confirmation dialog.
 * Per locked decision: REQUIRES confirmation before signing out.
 *
 * @example
 * ```tsx
 * <LogoutButton variant="default" />
 * ```
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@obsidian-note-reviewer/security/auth'

export interface LogoutButtonProps {
  /**
   * Visual variant for the button
   * - default: outlined button with border
   * - destructive: red background for emphasis
   */
  variant?: 'default' | 'destructive'

  /**
   * Additional CSS classes to apply
   */
  className?: string

  /**
   * Button text (default: "Sair")
   */
  children?: React.ReactNode
}

export function LogoutButton({
  variant = 'default',
  className = '',
  children = 'Sair'
}: LogoutButtonProps): React.ReactElement {
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    setLoading(true)

    try {
      await signOut()
      // Redirect to login after successful logout
      navigate('/auth/login', { replace: true })
    } catch (error: any) {
      console.error('Logout error:', error)
      // Show inline error (toast not used per SPA pattern from 01-03)
      setLoading(false)
      setShowConfirm(false)
    }
  }

  // Confirmation state - show dialog
  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Tem certeza?</span>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Confirmar logout"
        >
          {loading ? 'Saindo...' : 'Sim, sair'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="px-3 py-1 text-sm border border-input rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Cancelar logout"
        >
          Cancelar
        </button>
      </div>
    )
  }

  // Default state - show logout button
  const variantClasses = variant === 'destructive'
    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
    : 'border border-input hover:bg-accent'

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className={`px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses} ${className}`}
      aria-label="Sair da conta"
    >
      {children}
    </button>
  )
}
