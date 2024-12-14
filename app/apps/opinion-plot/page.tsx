"use client"

import dynamic from "next/dynamic"

const Opinion = dynamic(() => import("lib/components/OpinionPlot"), {
  ssr: false,
})

export default function Page() {
  return <Opinion />
}
