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
      <div className={['w-full rounded-2xl bg-white p-6 shadow-xl', className].join(' ').trim()} onClick={(e) => e.stopPropagation()} {...props}>
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
