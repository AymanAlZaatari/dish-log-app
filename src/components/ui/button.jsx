import React from 'react'

export function Button({ className = '', variant = 'default', size = 'default', asChild = false, children, ...props }) {
  const base = 'inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    default: 'bg-slate-900 text-white border-slate-900',
    outline: 'bg-white text-slate-900 border-slate-300',
    ghost: 'bg-transparent text-slate-700 border-transparent',
    secondary: 'bg-slate-100 text-slate-900 border-slate-200',
  }
  const sizes = {
    default: '',
    icon: 'h-9 w-9 p-0',
    sm: 'px-3 py-1.5 text-xs',
  }

  const mergedClassName = [base, variants[variant] || variants.default, sizes[size] || '', className].join(' ').trim()

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      className: [children.props.className || '', mergedClassName].join(' ').trim(),
    })
  }

  return (
    <button className={mergedClassName} {...props}>
      {children}
    </button>
  )
}
