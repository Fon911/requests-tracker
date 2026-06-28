import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'

import { createTicket } from '@/entities/ticket/api/ticketApi'
import { renderWithProviders } from '@/test/renderWithProviders'

import { CreateTicketForm } from './CreateTicketForm'

vi.mock('@/entities/ticket/api/ticketApi', () => ({
  createTicket: vi.fn(),
  fetchTickets: vi.fn(),
  updateTicket: vi.fn(),
  deleteTicket: vi.fn(),
}))

const createTicketMock = vi.mocked(createTicket)

beforeEach(() => {
  createTicketMock.mockReset()
})

it('rejects a title shorter than three characters without calling the API', async () => {
  const user = userEvent.setup()
  renderWithProviders(<CreateTicketForm onCreated={vi.fn()} onCancel={vi.fn()} />)

  await user.type(screen.getByLabelText('Заголовок'), 'ab')
  await user.click(screen.getByRole('button', { name: 'Создать заявку' }))

  expect(await screen.findByText(/от 3 до 120/i)).toBeInTheDocument()
  expect(createTicketMock).not.toHaveBeenCalled()
})

it('submits a trimmed payload and notifies the parent on success', async () => {
  createTicketMock.mockResolvedValue({
    id: 1,
    title: 'Broken printer',
    description: null,
    status: 'new',
    priority: 'high',
    created_at: '2026-06-01T10:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
  })
  const onCreated = vi.fn()
  const user = userEvent.setup()
  renderWithProviders(<CreateTicketForm onCreated={onCreated} onCancel={vi.fn()} />)

  await user.type(screen.getByLabelText('Заголовок'), '  Broken printer  ')
  await user.selectOptions(screen.getByLabelText('Приоритет'), 'high')
  await user.click(screen.getByRole('button', { name: 'Создать заявку' }))

  await waitFor(() => expect(onCreated).toHaveBeenCalled())
  expect(createTicketMock).toHaveBeenCalledWith({
    title: 'Broken printer',
    description: undefined,
    priority: 'high',
  })
})
