import type { SelectOption } from '@/shared/ui'

export const TITLE_MIN_LENGTH = 3
export const TITLE_MAX_LENGTH = 120
export const DESCRIPTION_MAX_LENGTH = 1000

export const STATUS_VALUES = ['new', 'in_progress', 'done'] as const
export type Status = (typeof STATUS_VALUES)[number]

export const PRIORITY_VALUES = ['low', 'normal', 'high'] as const
export type Priority = (typeof PRIORITY_VALUES)[number]

export type SortField = 'created_at' | 'priority'
export type SortOrder = 'asc' | 'desc'

export interface Ticket {
  id: number
  title: string
  description: string | null
  status: Status
  priority: Priority
  created_at: string
  updated_at: string
}

export interface TicketListParams {
  status?: Status
  priority?: Priority
  q?: string
  sort_by: SortField
  order: SortOrder
  page: number
  page_size: number
}

export interface TicketCreateInput {
  title: string
  description?: string
  priority: Priority
}

export interface TicketUpdateInput {
  title?: string
  description?: string | null
  status?: Status
  priority?: Priority
}

export const STATUS_LABELS: Record<Status, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  done: 'Выполнена',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Низкий',
  normal: 'Обычный',
  high: 'Высокий',
}

export const STATUS_TONES: Record<Status, string> = {
  new: 'new',
  in_progress: 'progress',
  done: 'done',
}

export const PRIORITY_TONES: Record<Priority, string> = {
  low: 'low',
  normal: 'normal',
  high: 'high',
}

export const STATUS_OPTIONS: SelectOption[] = STATUS_VALUES.map((value) => ({
  value,
  label: STATUS_LABELS[value],
}))

export const PRIORITY_OPTIONS: SelectOption[] = PRIORITY_VALUES.map((value) => ({
  value,
  label: PRIORITY_LABELS[value],
}))

export function isTerminal(status: Status): boolean {
  return status === 'done'
}
