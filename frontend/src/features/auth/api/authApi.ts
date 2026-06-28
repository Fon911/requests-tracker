import { request } from '@/shared/api/http'

interface TokenResponse {
  access_token: string
  token_type: string
}

export function login(username: string, password: string): Promise<TokenResponse> {
  return request<TokenResponse>('/auth/login', {
    method: 'POST',
    body: { username, password },
  })
}
