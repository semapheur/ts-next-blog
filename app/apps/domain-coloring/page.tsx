"use client"

import dynamic from "next/dynamic"

const DomainColoring = dynamic(() => import("lib/components/DomainColoring"), {
  ssr: false,
})

export default function Page() {
  return <DomainColoring />
}
