import React, { useId } from 'react'
import { useFieldId } from './field-context'

export const Textarea = React.forwardRef(function Textarea({ className = '', ...props }, ref) {
  const fallbackId = useId().replace(/:/g, '')
  const fieldId = useFieldId()
  const resolvedId = props.id || fieldId || fallbackId
  return (
    <textarea
      ref={ref}
      id={resolvedId}
      name={props.name || resolvedId}
      className={['w-full rounded-xl border border-slate-300 px-3 py-2 text-sm', className].join(' ').trim()}
      {...props}
    />
  )
})
