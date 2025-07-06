import type { ReactNode } from "react"
import Script from "next/script"

export default function NotesSlugLayout({
  children,
}: {
  children: ReactNode
}) {
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
