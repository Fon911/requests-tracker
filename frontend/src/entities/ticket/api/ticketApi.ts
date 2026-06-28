import { request } from '@/shared/api/http'
import type { Page } from '@/shared/api/types'

import type { Ticket, TicketCreateInput, TicketListParams, TicketUpdateInput } from '../model/types'

export function fetchTickets(params: TicketListParams): Promise<Page<Ticket>> {
  return request<Page<Ticket>>('/tickets', { query: { ...params } })
}

export function createTicket(input: TicketCreateInput): Promise<Ticket> {
  return request<Ticket>('/tickets', { method: 'POST', body: input })
}

export function updateTicket(id: number, input: TicketUpdateInput): Promise<Ticket> {
  return request<Ticket>(`/tickets/${id}`, { method: 'PATCH', body: input })
}

export function deleteTicket(id: number): Promise<void> {
  return request<void>(`/tickets/${id}`, { method: 'DELETE', auth: true })
}
