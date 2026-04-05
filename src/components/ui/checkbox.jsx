import React, { useId } from 'react'

export function Checkbox({ checked = false, onCheckedChange, className = '', ...props }) {
  const fallbackId = useId().replace(/:/g, '')
  return (
    <input
      id={props.id || fallbackId}
      name={props.name || props.id || fallbackId}
      type="checkbox"
      className={['h-4 w-4 rounded border-slate-300', className].join(' ').trim()}
      checked={!!checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  )
}
