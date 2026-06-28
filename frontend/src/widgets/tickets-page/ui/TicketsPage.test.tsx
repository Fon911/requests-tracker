import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'

import { fetchTickets } from '@/entities/ticket/api/ticketApi'
import type { Ticket } from '@/entities/ticket/model/types'
import { ApiError } from '@/shared/api/http'
import { renderWithProviders } from '@/test/renderWithProviders'

import { TicketsPage } from './TicketsPage'

vi.mock('@/entities/ticket/api/ticketApi', () => ({
  fetchTickets: vi.fn(),
  createTicket: vi.fn(),
  updateTicket: vi.fn(),
  deleteTicket: vi.fn(),
}))

const fetchTicketsMock = vi.mocked(fetchTickets)

const sampleTicket: Ticket = {
  id: 1,
  title: 'Сломался принтер',
  description: '3 этаж',
  status: 'new',
  priority: 'high',
  created_at: '2026-06-01T10:00:00Z',
  updated_at: '2026-06-01T10:00:00Z',
}

beforeEach(() => {
  fetchTicketsMock.mockReset()
})

it('renders tickets returned by the API', async () => {
  fetchTicketsMock.mockResolvedValue({
    items: [sampleTicket],
    total: 1,
    page: 1,
    page_size: 10,
    pages: 1,
  })

  renderWithProviders(<TicketsPage />)

  expect(await screen.findByText('Сломался принтер')).toBeInTheDocument()
  expect(screen.getByText('Высокий', { selector: '.badge' })).toBeInTheDocument()
})

it('shows the empty state when there are no tickets', async () => {
  fetchTicketsMock.mockResolvedValue({
    items: [],
    total: 0,
    page: 1,
    page_size: 10,
    pages: 0,
  })

  renderWithProviders(<TicketsPage />)

  expect(await screen.findByText('Заявок пока нет')).toBeInTheDocument()
})

it('locks the status select for done tickets', async () => {
  fetchTicketsMock.mockResolvedValue({
    items: [{ ...sampleTicket, status: 'done' }],
    total: 1,
    page: 1,
    page_size: 10,
    pages: 1,
  })

  renderWithProviders(<TicketsPage />)

  await screen.findByText('Сломался принтер')
  expect(screen.getByLabelText('Изменить статус')).toBeDisabled()
})

it('requests the next page when paging forward', async () => {
  fetchTicketsMock.mockResolvedValue({
    items: [sampleTicket],
    total: 25,
    page: 1,
    page_size: 10,
    pages: 3,
  })

  renderWithProviders(<TicketsPage />)
  await screen.findByText('Сломался принтер')

  await userEvent.setup().click(screen.getByRole('button', { name: 'Вперёд' }))

  await waitFor(() => {
    expect(fetchTicketsMock.mock.calls.some(([params]) => params.page === 2)).toBe(true)
  })
})

it('resets to the first page when a filter changes', async () => {
  fetchTicketsMock.mockResolvedValue({
    items: [sampleTicket],
    total: 25,
    page: 1,
    page_size: 10,
    pages: 3,
  })
  const user = userEvent.setup()

  renderWithProviders(<TicketsPage />)
  await screen.findByText('Сломался принтер')

  await user.click(screen.getByRole('button', { name: 'Вперёд' }))
  await waitFor(() => {
    expect(fetchTicketsMock.mock.calls.some(([params]) => params.page === 2)).toBe(true)
  })

  await user.selectOptions(screen.getByLabelText('Приоритет'), 'high')
  await waitFor(() => {
    const calls = fetchTicketsMock.mock.calls
    const last = calls[calls.length - 1]?.[0]
    expect(last?.priority).toBe('high')
    expect(last?.page).toBe(1)
  })
})

it('shows the error state when the request fails', async () => {
  fetchTicketsMock.mockRejectedValue(new ApiError(500, 'server_error', 'Сбой сервера'))

  renderWithProviders(<TicketsPage />)

  expect(await screen.findByText('Не удалось загрузить заявки')).toBeInTheDocument()
})
