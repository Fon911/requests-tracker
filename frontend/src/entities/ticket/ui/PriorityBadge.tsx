import { Badge } from '@/shared/ui'

import { PRIORITY_LABELS, type Priority } from '../model/types'

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge tone={priority}>{PRIORITY_LABELS[priority]}</Badge>
}
