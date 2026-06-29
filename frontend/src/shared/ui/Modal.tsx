import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface ModalProps {
  title: string
  onClose: () => void
  closable?: boolean
  children: ReactNode
}

export function Modal({ title, onClose, closable = true, children }: ModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  const closableRef = useRef(closable)
  const pressStartedOnOverlay = useRef(false)

  onCloseRef.current = onClose
  closableRef.current = closable

  function requestClose() {
    if (closableRef.current) onCloseRef.current()
  }

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const focusable = () =>
      Array.from(cardRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
    const body = cardRef.current?.querySelector<HTMLElement>('.modal__body')
    const firstField = body?.querySelector<HTMLElement>(FOCUSABLE)
    ;(firstField ?? focusable()[0])?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (closableRef.current) onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusable()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [])

  return (
    <div
      className="modal__overlay"
      onMouseDown={(event) => {
        pressStartedOnOverlay.current = event.target === event.currentTarget
      }}
      onMouseUp={(event) => {
        if (pressStartedOnOverlay.current && event.target === event.currentTarget) {
          requestClose()
        }
        pressStartedOnOverlay.current = false
      }}
    >
      <div
        ref={cardRef}
        className="modal__card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button
            className="modal__close"
            type="button"
            aria-label="Закрыть"
            disabled={!closable}
            onClick={requestClose}
          >
            ×
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  )
}
