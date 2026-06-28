import { useId } from 'react'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

import { Field } from './Field'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function TextField({ label, error, id, ...rest }: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <Field label={label} htmlFor={inputId} error={error}>
      <input id={inputId} className="input" {...rest} />
    </Field>
  )
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function TextAreaField({ label, error, id, ...rest }: TextAreaFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <Field label={label} htmlFor={inputId} error={error}>
      <textarea id={inputId} className="textarea" {...rest} />
    </Field>
  )
}
