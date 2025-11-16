import Script from "next/script"
import type { ReactNode } from "react"

export default function NotesSlugLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Script
        src="https://tikzjax.com/v1/tikzjax.js"
        strategy="beforeInteractive"
      />
      {children}
    </>
  )
}
