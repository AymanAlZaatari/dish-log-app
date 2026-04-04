import React from 'react'

export function Checkbox({ checked = false, onCheckedChange, className = '', ...props }) {
  return (
    <input
      type="checkbox"
      className={['h-4 w-4 rounded border-slate-300', className].join(' ').trim()}
      checked={!!checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  )
}
