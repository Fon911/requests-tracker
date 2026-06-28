import { afterEach, expect, it, vi } from 'vitest'

import { clearToken, setToken } from '@/shared/session/session'

import { ApiError, request } from './http'

afterEach(() => {
  vi.restoreAllMocks()
  clearToken()
})

function stubFetch(value: { ok: boolean; status: number; body: unknown }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: value.ok,
    status: value.status,
    json: async () => value.body,
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

it('serializes query params and omits empty values', async () => {
  const fetchMock = stubFetch({ ok: true, status: 200, body: { items: [] } })

  await request('/tickets', {
    query: { status: 'new', q: undefined, page: 2, empty: '' },
  })

  const calledUrl = fetchMock.mock.calls[0][0] as string
  expect(calledUrl).toContain('/api/tickets')
  expect(calledUrl).toContain('status=new')
  expect(calledUrl).toContain('page=2')
  expect(calledUrl).not.toContain('empty=')
  expect(calledUrl).not.toContain('q=')
})

it('attaches the bearer token only when auth is requested', async () => {
  setToken('token-123')
  const fetchMock = stubFetch({ ok: true, status: 204, body: null })

  await request('/tickets/1', { method: 'DELETE', auth: true })

  const init = fetchMock.mock.calls[0][1] as RequestInit
  expect((init.headers as Record<string, string>).Authorization).toBe('Bearer token-123')
})

it('returns undefined for 204 responses', async () => {
  stubFetch({ ok: true, status: 204, body: null })
  const result = await request('/tickets/1', { method: 'DELETE', auth: true })
  expect(result).toBeUndefined()
})

it('throws ApiError with the server code and message', async () => {
  stubFetch({
    ok: false,
    status: 409,
    body: { error: { code: 'ticket_done_immutable', message: 'нельзя' } },
  })

  await expect(request('/tickets/1', { method: 'PATCH', body: {} })).rejects.toMatchObject({
    status: 409,
    code: 'ticket_done_immutable',
    message: 'нельзя',
  })
})

it('falls back to a generic ApiError when the body is not parseable', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: false,
    status: 500,
    json: async () => {
      throw new Error('not json')
    },
  })
  vi.stubGlobal('fetch', fetchMock)

  const error = await request('/tickets').catch((caught: unknown) => caught)
  expect(error).toBeInstanceOf(ApiError)
  expect((error as ApiError).status).toBe(500)
})
