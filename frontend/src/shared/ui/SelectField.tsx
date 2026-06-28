import { useId } from 'react'
import type { SelectHTMLAttributes } from 'react'

import { Field } from './Field'

export interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export function SelectField({
  label,
  error,
  id,
  options,
  placeholder,
  ...rest
}: SelectFieldProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  return (
    <Field label={label} htmlFor={selectId} error={error}>
      <select id={selectId} className="select" {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
