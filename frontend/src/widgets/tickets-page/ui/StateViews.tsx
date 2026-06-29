import { Button } from '@/shared/ui'

export function EmptyState({ filtered, onReset }: { filtered: boolean; onReset: () => void }) {
  if (filtered) {
    return (
      <div className="state state--empty">
        <h3 className="state__title">Ничего не найдено</h3>
        <p className="state__text">
          Под текущие поиск и фильтры заявок нет. Попробуйте изменить условия.
        </p>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Сбросить фильтры
        </Button>
      </div>
    )
  }
  return (
    <div className="state state--empty">
      <h3 className="state__title">Заявок пока нет</h3>
      <p className="state__text">Создайте первую заявку — она появится в списке.</p>
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
