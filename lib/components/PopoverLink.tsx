"use client"

import { PopoverContext } from "lib/components/PopoverContext"
import { type HTMLProps, type ReactNode, use } from "react"

interface Props extends HTMLProps<HTMLAnchorElement> {
  children: ReactNode
}

export default function PopoverLink({ href, children }: Props) {
  const popoverContext = use(PopoverContext)

  return (
    <a
      href={href}
      onMouseEnter={(e) => {
        if (!popoverContext) return
        const contentId = e.currentTarget.getAttribute("href")?.replace("#", "")
        if (!contentId) return

        const rect = e.currentTarget.getBoundingClientRect()
        const position = { x: rect.right, y: rect.top }
        popoverContext.showPopover(contentId, position)
      }}
      onMouseLeave={popoverContext?.hidePopover}
    >
      {children}
    </a>
  )
}
