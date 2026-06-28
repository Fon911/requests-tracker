const STORAGE_KEY = 'requests-tracker.token'

let token: string | null = readInitialToken()
let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler
}

export function notifyUnauthorized(): void {
  unauthorizedHandler?.()
}

function readInitialToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function getToken(): string | null {
  return token
}

export function setToken(value: string): void {
  token = value
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {}
}

export function clearToken(): void {
  token = null
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
