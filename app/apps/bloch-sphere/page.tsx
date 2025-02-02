"use client"

import dynamic from "next/dynamic"

const BlochSphere = dynamic(() => import("lib/components/BlochSphere"), {
  ssr: false,
})

export default function Page() {
  return <BlochSphere />
}
