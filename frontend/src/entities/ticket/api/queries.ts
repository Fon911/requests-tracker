import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { TicketCreateInput, TicketListParams, TicketUpdateInput } from '../model/types'
import { createTicket, deleteTicket, fetchTickets, updateTicket } from './ticketApi'

export const ticketKeys = {
  all: ['tickets'] as const,
  list: (params: TicketListParams) => ['tickets', 'list', params] as const,
}

export function useTicketsQuery(params: TicketListParams) {
  return useQuery({
    queryKey: ticketKeys.list(params),
    queryFn: () => fetchTickets(params),
    placeholderData: keepPreviousData,
  })
}

export function useCreateTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TicketCreateInput) => createTicket(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ticketKeys.all }),
  })
}

export function useUpdateTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: TicketUpdateInput }) => updateTicket(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ticketKeys.all }),
  })
}

export function useDeleteTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteTicket(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ticketKeys.all }),
  })
}
