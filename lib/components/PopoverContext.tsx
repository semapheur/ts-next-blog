"use client"

import { createContext, type ReactNode, useState } from "react"

interface PopoverState {
  contentId: string | null
  triggerAnchor: HTMLAnchorElement | null
  open: boolean
}

export const PopoverContext = createContext<{
  showPopover: (contentId: string, targetAnchor: HTMLAnchorElement) => void
  hidePopover: () => void
  state: PopoverState
} | null>(null)

export function PopoverContextProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PopoverState>({
    contentId: null,
    triggerAnchor: null,
    open: false,
  })

  const showPopover = (
    contentId: string | null,
    triggerAnchor: HTMLAnchorElement | null,
  ) => {
    setState({ contentId, triggerAnchor, open: true })
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
