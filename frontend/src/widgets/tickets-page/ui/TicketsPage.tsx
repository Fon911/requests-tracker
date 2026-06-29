import { useEffect, useState } from 'react'

import { useDeleteTicket, useTicketsQuery, useUpdateTicket } from '@/entities/ticket/api/queries'
import type {
  Priority,
  SortField,
  SortOrder,
  Status,
  Ticket,
  TicketListParams,
} from '@/entities/ticket/model/types'
import { AuthControls } from '@/features/auth/ui/AuthControls'
import { useAuth } from '@/features/auth/model/authContext'
import { CreateTicketForm } from '@/features/ticket-create/ui/CreateTicketForm'
import { TicketFilters } from '@/features/ticket-filters/ui/TicketFilters'
import { TicketTable } from '@/features/ticket-table/ui/TicketTable'
import { ApiError } from '@/shared/api/http'
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue'
import { Button, ConfirmDialog, Modal, Spinner } from '@/shared/ui'

import { Pagination } from './Pagination'
import { EmptyState, ErrorState } from './StateViews'

const PAGE_SIZE = 10

export function TicketsPage() {
  const { isAuthenticated } = useAuth()

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [status, setStatus] = useState<Status | ''>('')
  const [priority, setPriority] = useState<Priority | ''>('')
  const [sortBy, setSortBy] = useState<SortField>('created_at')
  const [order, setOrder] = useState<SortOrder>('desc')
  const [page, setPage] = useState(1)
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null)

  const hasActiveFilters = Boolean(debouncedSearch.trim() || status || priority)

  function changeFilter<T>(setter: (value: T) => void, value: T) {
    setter(value)
    setPage(1)
  }

  const params: TicketListParams = {
    status: status || undefined,
    priority: priority || undefined,
    q: debouncedSearch.trim() || undefined,
    sort_by: sortBy,
    order,
    page,
    page_size: PAGE_SIZE,
  }

  const ticketsQuery = useTicketsQuery(params)
  const updateTicket = useUpdateTicket()
  const deleteTicket = useDeleteTicket()

  const data = ticketsQuery.data

  useEffect(() => {
    if (data && data.pages > 0 && page > data.pages) {
      setPage(data.pages)
    }
  }, [data, page])

  function reportMutationError(error: unknown, fallback: string) {
    if (error instanceof ApiError && error.status === 401) {
      setActionError('Сессия истекла, войдите заново')
      return
    }
    setActionError(error instanceof ApiError ? error.message : fallback)
  }

  const pendingId = updateTicket.isPending
    ? (updateTicket.variables?.id ?? null)
    : deleteTicket.isPending
      ? (deleteTicket.variables ?? null)
      : null

  function handleChangeStatus(id: number, nextStatus: Status) {
    setActionError(null)
    updateTicket.mutate(
      { id, input: { status: nextStatus } },
      {
        onError: (error) => reportMutationError(error, 'Не удалось изменить статус'),
      },
    )
  }

  function handleDelete(ticket: Ticket) {
    setActionError(null)
    setTicketToDelete(ticket)
  }

  function confirmDelete() {
    if (!ticketToDelete) return
    deleteTicket.mutate(ticketToDelete.id, {
      onSuccess: () => setTicketToDelete(null),
      onError: (error) => {
        setTicketToDelete(null)
        reportMutationError(error, 'Не удалось удалить заявку')
      },
    })
  }

  function handleReset() {
    setSearch('')
    setStatus('')
    setPriority('')
    setSortBy('created_at')
    setOrder('desc')
    setPage(1)
  }

  function renderContent() {
    if (ticketsQuery.isLoading) {
      return (
        <div className="state">
          <Spinner />
        </div>
      )
    }
    if (ticketsQuery.isError && !data) {
      return (
        <ErrorState
          message={
            ticketsQuery.error instanceof ApiError
              ? ticketsQuery.error.message
              : 'Проверьте соединение с сервером'
          }
          onRetry={() => ticketsQuery.refetch()}
        />
      )
    }
    if (!data || data.items.length === 0) {
      return <EmptyState filtered={hasActiveFilters} onReset={handleReset} />
    }
    return (
      <>
        {ticketsQuery.isError && (
          <p className="banner banner--error" role="alert">
            Не удалось обновить список, показаны прошлые данные
          </p>
        )}
        <TicketTable
          tickets={data.items}
          isAdmin={isAuthenticated}
          pendingId={pendingId}
          onChangeStatus={handleChangeStatus}
          onDelete={handleDelete}
        />
        {data.pages > 1 && (
          <Pagination
            page={data.page}
            pages={data.pages}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </>
    )
  }

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1 className="page__title">Учёт внутренних заявок</h1>
          <p className="page__subtitle">Создание, поиск и обработка заявок сотрудников</p>
        </div>
        <AuthControls />
      </header>

      <section className="toolbar">
        <TicketFilters
          search={search}
          status={status}
          priority={priority}
          sortBy={sortBy}
          order={order}
          onSearchChange={(value) => changeFilter(setSearch, value)}
          onStatusChange={(value) => changeFilter(setStatus, value)}
          onPriorityChange={(value) => changeFilter(setPriority, value)}
          onSortByChange={(value) => changeFilter(setSortBy, value)}
          onOrderChange={(value) => changeFilter(setOrder, value)}
          onReset={handleReset}
        />
        <div className="toolbar__actions">
          <Button onClick={() => setCreateOpen(true)}>Создать заявку</Button>
        </div>
      </section>

      {actionError && (
        <p className="banner banner--error" role="alert">
          {actionError}
        </p>
      )}

      <section className="content">{renderContent()}</section>

      {isCreateOpen && (
        <Modal title="Новая заявка" onClose={() => setCreateOpen(false)}>
          <CreateTicketForm
            onCreated={() => setCreateOpen(false)}
            onCancel={() => setCreateOpen(false)}
          />
        </Modal>
      )}

      {ticketToDelete && (
        <ConfirmDialog
          title="Удаление заявки"
          message={`Удалить заявку «${ticketToDelete.title}»? Отменить будет нельзя`}
          busy={deleteTicket.isPending}
          onConfirm={confirmDelete}
          onCancel={() => setTicketToDelete(null)}
        />
      )}
    </div>
  )
}
