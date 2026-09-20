"use client";

import dynamic from "next/dynamic";

const BlochSphereApp = dynamic(() => import("lib/components/BlochSphereApp"), {
  ssr: false,
});

export default function Page() {
  return <BlochSphereApp />;
}
