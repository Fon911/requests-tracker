import { useState } from 'react'
import type { FormEvent } from 'react'

import { useCreateTicket } from '@/entities/ticket/api/queries'
import {
  DESCRIPTION_MAX_LENGTH,
  PRIORITY_OPTIONS,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
  type Priority,
} from '@/entities/ticket/model/types'
import { ApiError } from '@/shared/api/http'
import { Button, SelectField, TextAreaField, TextField } from '@/shared/ui'

export function CreateTicketForm({
  onCreated,
  onCancel,
}: {
  onCreated: () => void
  onCancel: () => void
}) {
  const create = useCreateTicket()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')
  const [titleError, setTitleError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  function validate(): boolean {
    const trimmed = title.trim()
    if (trimmed.length < TITLE_MIN_LENGTH || trimmed.length > TITLE_MAX_LENGTH) {
      setTitleError(
        `Заголовок должен содержать от ${TITLE_MIN_LENGTH} до ${TITLE_MAX_LENGTH} символов`,
      )
      return false
    }
    setTitleError(null)
    return true
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return
    try {
      await create.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
      })
      onCreated()
    } catch (caught) {
      setFormError(caught instanceof ApiError ? caught.message : 'Не удалось создать заявку')
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <TextField
        label="Заголовок"
        value={title}
        maxLength={TITLE_MAX_LENGTH}
        placeholder="Кратко опишите проблему"
        error={titleError ?? undefined}
        onChange={(event) => setTitle(event.target.value)}
      />
      <TextAreaField
        label="Описание"
        value={description}
        rows={4}
        maxLength={DESCRIPTION_MAX_LENGTH}
        placeholder="Детали заявки (необязательно)"
        onChange={(event) => setDescription(event.target.value)}
      />
      <SelectField
        label="Приоритет"
        value={priority}
        options={PRIORITY_OPTIONS}
        onChange={(event) => setPriority(event.target.value as Priority)}
      />
      {formError && (
        <p className="form__error" role="alert">
          {formError}
        </p>
      )}
      <div className="form__actions">
        <Button variant="ghost" onClick={onCancel} disabled={create.isPending}>
          Отмена
        </Button>
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? 'Создание…' : 'Создать заявку'}
        </Button>
      </div>
    </form>
  )
}
