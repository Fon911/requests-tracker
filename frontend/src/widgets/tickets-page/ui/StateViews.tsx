import { Button } from '@/shared/ui'

export function EmptyState() {
  return (
    <div className="state state--empty">
      <h3 className="state__title">Заявок пока нет</h3>
      <p className="state__text">
        Измените условия поиска и фильтры или создайте первую заявку.
      </p>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="state state--error" role="alert">
      <h3 className="state__title">Не удалось загрузить заявки</h3>
      <p className="state__text">{message}</p>
      <Button variant="ghost" size="sm" onClick={onRetry}>
        Повторить
      </Button>
    </div>
  )
}
