import {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  type Priority,
  type SortField,
  type SortOrder,
  type Status,
} from '@/entities/ticket/model/types'
import { Button, SelectField, TextField } from '@/shared/ui'
import type { SelectOption } from '@/shared/ui'

const SORT_FIELD_OPTIONS: SelectOption[] = [
  { value: 'created_at', label: 'Дата создания' },
  { value: 'priority', label: 'Приоритет' },
]

const SORT_ORDER_OPTIONS: SelectOption[] = [
  { value: 'desc', label: 'По убыванию' },
  { value: 'asc', label: 'По возрастанию' },
]

interface TicketFiltersProps {
  search: string
  status: Status | ''
  priority: Priority | ''
  sortBy: SortField
  order: SortOrder
  onSearchChange: (value: string) => void
  onStatusChange: (value: Status | '') => void
  onPriorityChange: (value: Priority | '') => void
  onSortByChange: (value: SortField) => void
  onOrderChange: (value: SortOrder) => void
  onReset: () => void
}

export function TicketFilters({
  search,
  status,
  priority,
  sortBy,
  order,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onSortByChange,
  onOrderChange,
  onReset,
}: TicketFiltersProps) {
  return (
    <div className="filters">
      <div className="filters__search">
        <TextField
          label="Поиск"
          value={search}
          placeholder="По заголовку и описанию"
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <SelectField
        label="Статус"
        value={status}
        placeholder="Все статусы"
        options={STATUS_OPTIONS}
        onChange={(event) => onStatusChange(event.target.value as Status | '')}
      />
      <SelectField
        label="Приоритет"
        value={priority}
        placeholder="Все приоритеты"
        options={PRIORITY_OPTIONS}
        onChange={(event) => onPriorityChange(event.target.value as Priority | '')}
      />
      <SelectField
        label="Сортировка"
        value={sortBy}
        options={SORT_FIELD_OPTIONS}
        onChange={(event) => onSortByChange(event.target.value as SortField)}
      />
      <SelectField
        label="Порядок"
        value={order}
        options={SORT_ORDER_OPTIONS}
        onChange={(event) => onOrderChange(event.target.value as SortOrder)}
      />
      <div className="filters__reset">
        <Button variant="ghost" size="sm" onClick={onReset}>
          Сбросить
        </Button>
      </div>
    </div>
  )
}
