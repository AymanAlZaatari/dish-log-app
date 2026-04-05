import React, { useId } from 'react'

export const Input = React.forwardRef(function Input({ className = '', ...props }, ref) {
  const fallbackId = useId().replace(/:/g, '')
  return (
    <input
      ref={ref}
      id={props.id || fallbackId}
      name={props.name || props.id || fallbackId}
      className={['w-full rounded-xl border border-slate-300 px-3 py-2 text-sm', className].join(' ').trim()}
      {...props}
    />
  )
})
