import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

import { ConfirmDialog } from './ConfirmDialog'

it('disables every dismiss affordance while the action is in flight', () => {
  render(
    <ConfirmDialog
      title="Удаление заявки"
      message="Удалить?"
      busy
      onConfirm={vi.fn()}
      onCancel={vi.fn()}
    />,
  )

  expect(screen.getByRole('button', { name: 'Закрыть' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Отмена' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Удаление…' })).toBeDisabled()
})

it('keeps the dialog actionable when not busy', () => {
  render(
    <ConfirmDialog title="Удаление заявки" message="Удалить?" onConfirm={vi.fn()} onCancel={vi.fn()} />,
  )

  expect(screen.getByRole('button', { name: 'Удалить' })).toBeEnabled()
  expect(screen.getByRole('button', { name: 'Закрыть' })).toBeEnabled()
})
