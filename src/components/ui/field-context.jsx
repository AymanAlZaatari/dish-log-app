import React, { createContext, useContext } from 'react'

const FieldContext = createContext(null)

export function FieldProvider({ value, children }) {
  return <FieldContext.Provider value={value}>{children}</FieldContext.Provider>
}

export function useFieldId() {
  return useContext(FieldContext)
}
