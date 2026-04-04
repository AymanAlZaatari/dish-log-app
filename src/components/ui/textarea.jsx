import React from 'react'

export const Textarea = React.forwardRef(function Textarea({ className = '', ...props }, ref) {
  return <textarea ref={ref} className={['w-full rounded-xl border border-slate-300 px-3 py-2 text-sm', className].join(' ').trim()} {...props} />
})
