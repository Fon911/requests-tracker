import '@testing-library/jest-dom/vitest'

import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

import { clearToken } from '@/shared/session/session'

afterEach(() => {
  cleanup()
  clearToken()
})
