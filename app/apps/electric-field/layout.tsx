import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Electric Field",
  description: "A WebGL-based visualization of electric.",
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
