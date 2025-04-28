import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Radiation Field",
  description: "A WebGL-based visualization of radiating electric field.",
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
