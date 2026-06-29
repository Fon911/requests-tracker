import { fireEvent, render } from '@testing-library/react'
import { expect, it, vi } from 'vitest'

import { Modal } from './Modal'

it('closes when the press starts and ends on the overlay', () => {
  const onClose = vi.fn()
  const { container } = render(
    <Modal title="t" onClose={onClose}>
      <p>body</p>
    </Modal>,
  )
  const overlay = container.querySelector('.modal__overlay') as HTMLElement

  fireEvent.mouseDown(overlay)
  fireEvent.mouseUp(overlay)

  expect(onClose).toHaveBeenCalledTimes(1)
})

it('does not close when the press starts inside the card (text-selection drag)', () => {
  const onClose = vi.fn()
  const { container } = render(
    <Modal title="t" onClose={onClose}>
      <input aria-label="field" />
    </Modal>,
  )
  const overlay = container.querySelector('.modal__overlay') as HTMLElement
  const card = container.querySelector('.modal__card') as HTMLElement

  fireEvent.mouseDown(card)
  fireEvent.mouseUp(overlay)

  expect(onClose).not.toHaveBeenCalled()
})

it('does not close on overlay click while not closable (busy)', () => {
  const onClose = vi.fn()
  const { container } = render(
    <Modal title="t" onClose={onClose} closable={false}>
      <p>body</p>
    </Modal>,
  )
  const overlay = container.querySelector('.modal__overlay') as HTMLElement

  fireEvent.mouseDown(overlay)
  fireEvent.mouseUp(overlay)

  expect(onClose).not.toHaveBeenCalled()
})
