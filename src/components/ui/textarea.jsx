import React, { useId } from 'react'

export const Textarea = React.forwardRef(function Textarea({ className = '', ...props }, ref) {
  const fallbackId = useId().replace(/:/g, '')
  return (
    <textarea
      ref={ref}
      id={props.id || fallbackId}
      name={props.name || props.id || fallbackId}
      className={['w-full rounded-xl border border-slate-300 px-3 py-2 text-sm', className].join(' ').trim()}
      {...props}
    />
  )
})
