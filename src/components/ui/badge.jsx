import React from 'react'

export function Badge({ className = '', variant = 'default', ...props }) {
  const variants = {
    default: 'bg-slate-900 text-white border-slate-900',
    outline: 'bg-white text-slate-700 border-slate-300',
    secondary: 'bg-slate-100 text-slate-700 border-slate-200',
  }
  return <span className={['inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium', variants[variant] || variants.default, className].join(' ').trim()} {...props} />
}
