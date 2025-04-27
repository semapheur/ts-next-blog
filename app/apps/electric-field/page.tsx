"use client"

import dynamic from "next/dynamic"

const ElectricField = dynamic(() => import("lib/components/ElectricField"), {
  ssr: false,
})

export default function Page() {
  return <ElectricField />
}
