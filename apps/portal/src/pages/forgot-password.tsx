import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@obsidian-note-reviewer/security/supabase'
import { AuthLayout } from '../components/auth/AuthLayout'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setSent(true)
    } catch (error: any) {
      setError(error.message || 'Erro ao enviar email. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout
        title="Email enviado"
        description="Enviamos instruções para redefinir sua senha."
      >
        <div className="space-y-6">
          <div className="p-4 rounded-md bg-muted">
            <p className="text-sm text-muted-foreground">
              Enviamos um email para <strong>{email}</strong> com instruções para redefinir sua senha.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              O link expira em 1 hora. Se não receber o email, verifique sua caixa de spam.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/auth/login')}
              className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Voltar ao login
            </button>
            <button
              onClick={() => {
                setSent(false)
                setEmail('')
              }}
              className="w-full px-4 py-2.5 border border-input rounded-md hover:bg-accent transition-colors font-medium"
            >
              Tentar outro email
            </button>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Esqueceu sua senha?"
      description="Digite seu email e enviaremos instruções para redefinir sua senha."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error display */}
        {error && (
          <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            placeholder="seu@email.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Enviando...' : 'Enviar email de recuperação'}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Lembrou sua senha?{' '}
          <Link to="/auth/login" className="text-primary hover:underline">
            Faça login
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
