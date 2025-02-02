import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Bloch Sphere",
  description: "A WebGL-based visualization of the Bloch sphere.",
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
