/**
 * Profile Form Component
 *
 * Profile completion form for onboarding with avatar upload
 * and display name input. Display name is required per locked decision.
 * Skip button is available per locked decision.
 */

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@obsidian-note-reviewer/security/auth'
import { uploadAvatar, getAvatarUrl } from '@obsidian-note-reviewer/security/supabase/storage'

export interface ProfileFormProps {
  /** Optional callback when profile is completed or skipped */
  onComplete?: () => void
}

export function ProfileForm({ onComplete }: ProfileFormProps) {
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load existing user data on mount
  useEffect(() => {
    if (user) {
      const existingName = user.user_metadata?.full_name || user.user_metadata?.name || ''
      setDisplayName(existingName)
      const existingAvatar = getAvatarUrl(user)
      setAvatarUrl(existingAvatar)
    }
  }, [user])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido.')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 2MB.')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload avatar
    setUploading(true)
    try {
      const publicUrl = await uploadAvatar(user!.id, file)
      setAvatarUrl(publicUrl)
    } catch (error: any) {
      setError(error.message || 'Erro ao enviar avatar.')
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!displayName.trim()) {
      setError('Por favor, insira seu nome de exibição.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Update user metadata with display name and avatar URL
      await updateProfile({
        full_name: displayName.trim(),
        avatar_url: avatarUrl,
      })

      if (onComplete) {
        onComplete()
      } else {
        navigate('/dashboard')
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao atualizar perfil.')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    if (onComplete) {
      onComplete()
    } else {
      navigate('/dashboard')
    }
  }

  const displayAvatar = previewUrl || avatarUrl

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error display */}
      {error && (
        <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Avatar Upload Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-border">
              <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 rounded-full bg-background/80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-sm text-primary hover:underline disabled:opacity-50"
        >
          {displayAvatar ? 'Alterar foto' : 'Adicionar foto'}
        </button>
        <p className="text-xs text-muted-foreground">JPG, PNG ou GIF. Máximo 2MB.</p>
      </div>

      {/* Display Name Input */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium mb-1">
          Nome de exibição <span className="text-destructive">*</span>
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          placeholder="Como você gostaria de ser chamado?"
        />
      </div>

      {/* Submit and Skip Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={loading || uploading}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Salvando...' : 'Continuar'}
        </button>

        <button
          type="button"
          onClick={handleSkip}
          className="flex-1 px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors"
        >
          Pular
        </button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Você pode completar seu perfil a qualquer momento nas configurações.
      </p>
    </form>
  )
}
