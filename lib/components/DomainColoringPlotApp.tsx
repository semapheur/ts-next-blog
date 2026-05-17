"use client";

import { useEffect, useRef } from "react";
import { effect, signal } from "@preact/signals-react";

import ComplexInput from "lib/components/ComplexInput";
import TransformDiv, { transform } from "lib/components/TransformDiv";

import type { ViewRange } from "lib/utils/types";
import Vector from "lib/utils/vector";
import { DomainColoringPlot } from "lib/components/DomainColoringPlot";

const viewRange = signal<ViewRange>({
  x: new Vector(-10, 10),
  y: new Vector(-10, 10),
});
const expression = signal<string>("");

export default function DomainColoringPlotApp() {
  const plotCanvasRef = useRef<HTMLCanvasElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<DomainColoringPlot | null>(null);

  useEffect(() => {
    const plotCanvas = plotCanvasRef.current;
    const gridCanvas = gridCanvasRef.current;

    if (!plotCanvas || !gridCanvas) return;

    rendererRef.current = new DomainColoringPlot(
      plotCanvas,
      gridCanvas,
      transform.value,
      expression.value,
    );

    const disposeEffect = effect(() => {
      if (rendererRef.current) {
        rendererRef.current.updateExpression(expression.value);
        rendererRef.current.updateTransform(transform.value);
      }
    });

    return () => {
      disposeEffect();
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, []);

  return (
    <TransformDiv viewRange={viewRange} className="relative size-full">
      <canvas ref={plotCanvasRef} className="absolute inset-0 size-full" />
      <canvas ref={gridCanvasRef} className="absolute inset-0 size-full" />
      <ComplexInput expression={expression} className="absolute top-0 left-0" />
    </TransformDiv>
  );
}
