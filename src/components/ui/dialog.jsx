import React, { createContext, useContext } from 'react'

const DialogContext = createContext(null)

export function Dialog({ open, onOpenChange, children }) {
  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>
}

export function DialogTrigger({ asChild = false, children }) {
  const ctx = useContext(DialogContext)
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        children.props.onClick?.(e)
        ctx?.onOpenChange?.(true)
      },
    })
  }
  return <button type="button" onClick={() => ctx?.onOpenChange?.(true)}>{children}</button>
}

export function DialogContent({ className = '', children, ...props }) {
  const ctx = useContext(DialogContext)
  if (!ctx?.open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => ctx.onOpenChange?.(false)}>
      <div className={['relative w-full rounded-2xl bg-white p-6 shadow-xl', className].join(' ').trim()} onClick={(e) => e.stopPropagation()} {...props}>
        <button
          type="button"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          onClick={() => ctx.onOpenChange?.(false)}
        >
          X
        </button>
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ className = '', ...props }) {
  return <div className={['mb-4', className].join(' ').trim()} {...props} />
}

export function DialogTitle({ className = '', ...props }) {
  return <h2 className={['text-lg font-semibold', className].join(' ').trim()} {...props} />
}
