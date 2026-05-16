"use client";

import dynamic from "next/dynamic";
import { sin, cos, mul } from "three/tsl";

import { type FunctionDef } from "lib/components/ThreePlot2d";

const Plot = dynamic(() => import("lib/components/InteractivePlot"), {
  ssr: false,
});

export default function Page() {
  const fns: FunctionDef[] = [
    { fn: (x) => sin(x), color: [0.2, 0.9, 0.5] },
    { fn: (x) => cos(x), color: [0.9, 0.4, 0.2] },
    { fn: (x) => x.mul(x), color: [0.3, 0.6, 1.0] },
  ];

  return <Plot functions={fns} />;
}
