import { useState } from 'react'

import { Button } from '@/shared/ui'

import { useAuth } from '../model/authContext'
import { LoginDialog } from './LoginDialog'

export function AuthControls() {
  const { isAuthenticated, logout } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)

  if (isAuthenticated) {
    return (
      <div className="auth-controls">
        <span className="auth-controls__badge">Администратор</span>
        <Button variant="ghost" size="sm" onClick={logout}>
          Выйти
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setDialogOpen(true)}>
        Вход для администратора
      </Button>
      {dialogOpen && <LoginDialog onClose={() => setDialogOpen(false)} />}
    </>
  )
}
