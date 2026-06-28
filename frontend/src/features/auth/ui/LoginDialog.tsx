import { useState } from 'react'
import type { FormEvent } from 'react'

import { ApiError } from '@/shared/api/http'
import { Button, Modal, TextField } from '@/shared/ui'

import { useAuth } from '../model/authContext'

export function LoginDialog({ onClose }: { onClose: () => void }) {
  const { login } = useAuth()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(username, password)
      onClose()
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Не удалось войти')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Вход администратора" onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        <TextField
          label="Логин"
          value={username}
          autoComplete="username"
          onChange={(event) => setUsername(event.target.value)}
        />
        <TextField
          label="Пароль"
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
        />
        {error && <p className="form__error" role="alert">{error}</p>}
        <div className="form__actions">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Отмена
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Вход…' : 'Войти'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
