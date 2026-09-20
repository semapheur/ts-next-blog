"use client";

import { useEffect, useRef } from "react";
import useIsMounted from "lib/hooks/useIsMounted";
import { BlochSphere } from "lib/components/BlochSphere";

export default function BlochSphereApp() {
  const isMounted = useIsMounted();

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMounted) return;

    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    const label = labelRef.current;
    if (!(canvas && wrapper && label)) return;

    const bloch = new BlochSphere({ wrapper, canvas, label });
    return () => bloch.dispose();
  }, [isMounted]);

  return (
    <div ref={wrapperRef} className="relative size-full">
      <div
        ref={labelRef}
        className="pointer-events-none absolute top-1 left-1 text-white"
      />
      <canvas ref={canvasRef} />
    </div>
  );
}
