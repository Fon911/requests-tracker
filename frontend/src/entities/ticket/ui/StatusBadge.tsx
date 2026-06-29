import { Badge } from '@/shared/ui'

import { STATUS_LABELS, type Status } from '../model/types'

export function StatusBadge({ status }: { status: Status }) {
  return <Badge tone={status}>{STATUS_LABELS[status]}</Badge>
}
