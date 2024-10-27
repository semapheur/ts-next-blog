"use client"

import { type ReactNode, useEffect, useRef } from "react"
import { createPortal } from "react-dom"

function appendWrapper(id: string): HTMLDivElement | null {
  if (!document) return null
  const wrapper = document.createElement("div")
  wrapper.setAttribute("id", id)
  document.body.appendChild(wrapper)
  return wrapper
}

type Props = {
  portalId: string
  children: ReactNode
}

export default function Portal({ portalId = "react-portal", children }: Props) {
  const wrapperRef = useRef<HTMLElement | null>(
    document.getElementById(portalId),
  )

  useEffect(() => {
    let systemCreated = false

    if (!wrapperRef.current) {
      systemCreated = true
      wrapperRef.current = appendWrapper(portalId)
    }

    return () => {
      if (systemCreated && wrapperRef.current?.parentNode) {
        wrapperRef.current.parentNode.removeChild(wrapperRef.current)
      }
    }
  }, [portalId])

  return wrapperRef.current ? createPortal(children, wrapperRef.current) : null
}
