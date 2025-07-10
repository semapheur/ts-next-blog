"use client"

import { PopoverContext } from "lib/components/PopoverContext"
import { use, useEffect, useRef } from "react"

export default function MathPopover() {
  const popoverContext = use(PopoverContext)
  const content = useRef<string | null>(null)

  useEffect(() => {
    const contentId = popoverContext?.state.contentId
    if (!contentId) return

    const contentTarget = document.getElementById(contentId)
    if (!contentTarget) return

    let contentElement: HTMLElement | null = null
    if (contentId.startsWith("equation")) {
      contentElement = contentTarget.closest("span.katex-display")
    } else {
      contentElement = contentTarget.closest("aside")
    }

    if (!contentElement) return

    content.current = contentElement.outerHTML
  }, [popoverContext?.state.contentId])

  return (
    <div
      className="absolute z-50 min-w-max rounded border bg-white p-4 shadow-lg"
      style={{
        top: popoverContext?.state.position.y,
        left: popoverContext?.state.position.x,
        display: popoverContext?.state.open ? "block" : "none",
      }}
      dangerouslySetInnerHTML={{ __html: content.current || "" }}
    />
  )
}
