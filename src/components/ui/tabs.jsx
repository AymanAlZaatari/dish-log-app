import React, { createContext, useContext } from 'react'

const TabsContext = createContext(null)

export function Tabs({ value, onValueChange, className = '', children, ...props }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className} {...props}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className = '', ...props }) {
  return <div className={className} {...props} />
}

export function TabsTrigger({ value, className = '', children, ...props }) {
  const ctx = useContext(TabsContext)
  const active = ctx?.value === value
  return (
    <button
      type="button"
      className={['px-3 py-2 text-sm', active ? 'ring-2 ring-slate-300' : '', className].join(' ').trim()}
      onClick={() => ctx?.onValueChange?.(value)}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, ...props }) {
  const ctx = useContext(TabsContext)
  if (ctx?.value !== value) return null
  return <div {...props}>{children}</div>
}
