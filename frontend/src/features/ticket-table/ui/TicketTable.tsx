import { PriorityBadge } from '@/entities/ticket/ui/PriorityBadge'
import { StatusBadge } from '@/entities/ticket/ui/StatusBadge'
import {
  STATUS_OPTIONS,
  isTerminal,
  type Status,
  type Ticket,
} from '@/entities/ticket/model/types'
import { formatDateTime } from '@/shared/lib/formatDate'
import { Button } from '@/shared/ui'

interface TicketTableProps {
  tickets: Ticket[]
  isAdmin: boolean
  pendingId: number | null
  onChangeStatus: (id: number, status: Status) => void
  onDelete: (ticket: Ticket) => void
}

export function TicketTable({
  tickets,
  isAdmin,
  pendingId,
  onChangeStatus,
  onDelete,
}: TicketTableProps) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Заявка</th>
            <th>Статус</th>
            <th>Приоритет</th>
            <th>Создана</th>
            <th className="table__actions-head">Действия</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => {
            const locked = isTerminal(ticket.status)
            const busy = pendingId === ticket.id
            return (
              <tr key={ticket.id} className={busy ? 'is-busy' : undefined}>
                <td>
                  <div className="ticket-title">{ticket.title}</div>
                  {ticket.description && (
                    <div className="ticket-description">{ticket.description}</div>
                  )}
                </td>
                <td>
                  <StatusBadge status={ticket.status} />
                </td>
                <td>
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td className="table__date">{formatDateTime(ticket.created_at)}</td>
                <td>
                  <div className="row-actions">
                    <select
                      className="status-select"
                      aria-label="Изменить статус"
                      value={ticket.status}
                      disabled={locked || busy}
                      onChange={(event) =>
                        onChangeStatus(ticket.id, event.target.value as Status)
                      }
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {isAdmin && (
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={locked || busy}
                        title={locked ? 'Выполненную заявку удалить нельзя' : undefined}
                        onClick={() => onDelete(ticket)}
                      >
                        Удалить
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
