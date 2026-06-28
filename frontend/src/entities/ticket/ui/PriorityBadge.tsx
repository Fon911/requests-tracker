import { Badge } from '@/shared/ui'

import { PRIORITY_LABELS, PRIORITY_TONES, type Priority } from '../model/types'

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge tone={PRIORITY_TONES[priority]}>{PRIORITY_LABELS[priority]}</Badge>
}
