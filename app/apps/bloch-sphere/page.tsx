import dynamic from "next/dynamic"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Bloch Sphere",
  description: "A WebGL-based visualization of the Bloch sphere.",
}

const BlochSphere = dynamic(() => import("lib/components/BlochSphere"))

export default function Page() {
  return <BlochSphere />
}
