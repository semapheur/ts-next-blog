"use client";

import { useEffect, useRef } from "react";
import { ThreePlot2d, type FunctionDef } from "lib/components/ThreePlot2d";

interface Props {
  functions: FunctionDef[];
}

export default function InteractivePlot({ functions }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plotterRef = useRef<ThreePlot2d | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let plotterInstance: ThreePlot2d;
    let isMounted = true;

    const run = async () => {
      const plotter = new ThreePlot2d({
        canvas,
        functions: functions ?? [],
      });
      plotterInstance = plotter;

      await plotter.init();
      if (!isMounted) {
        plotter.dispose();
        return;
      }

      plotterRef.current = plotter;
    };

    run();

    return () => {
      isMounted = false;
      plotterInstance?.dispose();
      plotterRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (plotterRef.current && functions) {
      plotterRef.current?.setFunctions(functions);
    }
  }, [functions]);

  return (
    <div className="size-full">
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}
