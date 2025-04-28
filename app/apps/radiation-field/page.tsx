"use client"

import dynamic from "next/dynamic"

const RadiationField = dynamic(() => import("lib/components/RadiationField"), {
  ssr: false,
})

export default function Page() {
  return <RadiationField />
}
