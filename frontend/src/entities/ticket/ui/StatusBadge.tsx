import { Badge } from '@/shared/ui'

import { STATUS_LABELS, STATUS_TONES, type Status } from '../model/types'

export function StatusBadge({ status }: { status: Status }) {
  return <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>
}
