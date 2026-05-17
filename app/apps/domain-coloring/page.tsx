"use client";

import dynamic from "next/dynamic";

const DomainColoring = dynamic(
  () => import("lib/components/DomainColoringPlotApp"),
  {
    ssr: false,
  },
);

export default function Page() {
  return <DomainColoring />;
}
