import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const SelectContext = createContext(null)

export function Select({ value, onValueChange, children }) {
  const [items, setItems] = useState([])
  const contextValue = useMemo(() => ({ value, onValueChange, items, setItems }), [value, onValueChange, items])
  return <SelectContext.Provider value={contextValue}>{children}</SelectContext.Provider>
}

export function SelectTrigger({ className = '', children }) {
  const ctx = useContext(SelectContext)
  return (
    <select
      className={['w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm', className].join(' ').trim()}
      value={ctx?.value ?? ''}
      onChange={(e) => ctx?.onValueChange?.(e.target.value)}
    >
      {ctx?.items.map((item) => (
        <option key={item.value} value={item.value} disabled={item.disabled}>
          {item.label}
        </option>
      ))}
    </select>
  )
}

export function SelectValue() {
  return null
}

export function SelectContent({ children }) {
  const ctx = useContext(SelectContext)
  useEffect(() => {
    const items = React.Children.toArray(children)
      .filter(Boolean)
      .map((child) => ({
        value: child.props.value,
        label: typeof child.props.children === 'string' ? child.props.children : child.props.value,
        disabled: child.props.disabled || false,
      }))
    ctx?.setItems(items)
    return () => ctx?.setItems([])
  }, [children])
  return null
}

export function SelectItem() {
  return null
}
