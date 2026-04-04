import React from 'react'

export const Input = React.forwardRef(function Input({ className = '', ...props }, ref) {
  return <input ref={ref} className={['w-full rounded-xl border border-slate-300 px-3 py-2 text-sm', className].join(' ').trim()} {...props} />
})
