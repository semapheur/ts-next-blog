import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Domain coloring",
  description:
    "A WebGL-based domain coloring visualization of complex functions.",
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
