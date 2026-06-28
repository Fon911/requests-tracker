import { expect, it } from 'vitest'

import { PRIORITY_OPTIONS, STATUS_OPTIONS, isTerminal } from './types'

it('builds status options with russian labels in domain order', () => {
  expect(STATUS_OPTIONS).toEqual([
    { value: 'new', label: 'Новая' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'done', label: 'Выполнена' },
  ])
})

it('builds priority options in low-to-high order', () => {
  expect(PRIORITY_OPTIONS.map((option) => option.value)).toEqual(['low', 'normal', 'high'])
})

it('treats only the done status as terminal', () => {
  expect(isTerminal('done')).toBe(true)
  expect(isTerminal('new')).toBe(false)
  expect(isTerminal('in_progress')).toBe(false)
})
