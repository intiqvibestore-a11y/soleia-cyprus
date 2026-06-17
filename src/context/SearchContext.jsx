import { createContext, useContext, useState } from 'react'

const Ctx = createContext({ open: false, openSearch: () => {}, closeSearch: () => {} })

export function SearchProvider({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <Ctx.Provider value={{ open, openSearch: () => setOpen(true), closeSearch: () => setOpen(false) }}>
      {children}
    </Ctx.Provider>
  )
}

export function useSearchModal() { return useContext(Ctx) }
