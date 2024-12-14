import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Subjective opinion plot",
  description:
    "An SVG-based visualization of binomial subjective opinion in terms of belief, disbelief, uncertainty and base rate",
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
