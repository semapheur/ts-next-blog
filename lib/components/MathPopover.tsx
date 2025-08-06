"use client"

import { PopoverContext } from "lib/components/PopoverContext"
import { use, useEffect, useRef, useState } from "react"

type Position = {
  left: number | string
  top: number | string
}

export default function MathPopover() {
  const popoverContext = use(PopoverContext)
  const [clonedHtml, setClonedHtml] = useState<string | null>(null) // Store HTML string
  const [position, setPosition] = useState<Position | null>(null)
  const divRef = useRef<HTMLDivElement | null>(null)

  const contentId = popoverContext?.state.contentId
  const triggerAnchor = popoverContext?.state.triggerAnchor
  const visible = popoverContext?.state.open

  useEffect(() => {
    if (!contentId || !triggerAnchor) {
      setClonedHtml(null)
      setPosition(null)
      return
    }

    if (!contentId) {
      setClonedHtml(null)
      return
    }

    const contentTarget = document.getElementById(contentId)
    if (!contentTarget) {
      setClonedHtml(null)
      return
    }

    let source: HTMLElement | null = null
    if (contentId.startsWith("equation")) {
      source = contentTarget.closest("span.katex-display")
    } else if (
      contentId.startsWith("figure") ||
      contentId.startsWith("table")
    ) {
      source = contentTarget.closest("figure")
    } else {
      source = contentTarget.closest("aside")
    }
    if (!source) {
      setClonedHtml(null)
      return
    }

    const anchorRect = triggerAnchor?.getBoundingClientRect()
    if (!anchorRect) {
      setClonedHtml(null)
      return
    }

    const positionStyle = {
      left: "2rem",
      top: anchorRect.top < window.innerHeight / 2 ? anchorRect.bottom : "2rem",
    }

    setPosition(positionStyle)

    setClonedHtml(source.outerHTML)
  }, [contentId, triggerAnchor])

  return (
    <div
      ref={divRef}
      className="absolute z-[999] min-w-min max-w-[90%] overflow-scroll rounded border border-secondary bg-primary p-2 text-text shadow-lg"
      style={{
        ...position,
        display: visible && position && clonedHtml ? "block" : "none",
      }}
      dangerouslySetInnerHTML={{ __html: clonedHtml || "" }}
    />
  )
}
