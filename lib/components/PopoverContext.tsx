"use client"

import { createContext, type ReactNode, useState } from "react"

type PopoverState = {
  contentId: string | null
  position: { x: number; y: number }
  open: boolean
}

export const PopoverContext = createContext<{
  showPopover: (contentId: string, position: { x: number; y: number }) => void
  hidePopover: () => void
  state: PopoverState
} | null>(null)

export function PopoverContextProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PopoverState>({
    contentId: null,
    position: { x: 0, y: 0 },
    open: false,
  })

  const showPopover = (
    contentId: string | null,
    position: { x: number; y: number },
  ) => {
    setState({ contentId, position, open: true })
  }

  const hidePopover = () => {
    setState((prev) => ({ ...prev, open: false }))
  }

  return (
    <PopoverContext value={{ showPopover, hidePopover, state }}>
      {children}
    </PopoverContext>
  )
}
