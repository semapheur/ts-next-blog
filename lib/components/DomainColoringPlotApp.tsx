"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { complex, parse, type Complex, type MathNode } from "mathjs";

import ComplexInput from "lib/components/ComplexInput";
import TransformDiv, { PointerContext } from "lib/components/TransformDiv";
import Tex from "lib/components/Tex";

import type { ViewRange } from "lib/utils/types";
import Vector from "lib/utils/vector";
import { DomainColoringPlot } from "lib/components/DomainColoringPlot";

const INITIAL_VIEW_RANGE: ViewRange = {
  x: new Vector(-10, 10),
  y: new Vector(-10, 10),
};

function formatNum(n: number): string {
  const s = parseFloat(n.toPrecision(3)).toString();

  if (s.includes("e")) {
    const [mantissa, exp] = s.split("e");
    return `${mantissa} \\times 10^{${parseInt(exp)}}`;
  }
  return s;
}

function formatComplex(p: DOMPoint, label: string): string {
  const re = formatNum(p.x);
  const im = formatNum(Math.abs(p.y));
  const sign = p.y <= 0 ? "+" : "-";

  const r = formatNum(Math.hypot(p.x, p.y));
  const thetaCoeff = formatNum(
    (((Math.atan2(-p.y, p.x) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) /
      Math.PI,
  );

  return `${label} = ${re} ${sign} ${im}i \\\\ ${label} = ${r} \\cdot \\exp(${thetaCoeff}\\pi i)`;
}

function evaluateAt(node: MathNode | null, p: DOMPoint): DOMPoint {
  if (!node) return new DOMPoint(NaN, NaN);
  try {
    const result = node.evaluate({ z: complex(p.x, -p.y) }) as Complex;
    return new DOMPoint(result.re, -result.im);
  } catch {
    return new DOMPoint(NaN, NaN);
  }
}

export default function DomainColoringPlotApp() {
  const plotCanvasRef = useRef<HTMLCanvasElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<DomainColoringPlot | null>(null);
  const positionRef = useRef(new DOMPoint(0, 0));
  const viewRangeRef = useRef<ViewRange>(INITIAL_VIEW_RANGE);
  const transformRef = useRef<DOMMatrix>(new DOMMatrix([1, 0, 0, 1, 0, 0]));
  const expressionNodeRef = useRef<MathNode | null>(null);

  const [pointerPosition, setPointerPosition] = useState<DOMPoint>(
    new DOMPoint(0, 0),
  );

  useEffect(() => {
    const plotCanvas = plotCanvasRef.current;
    const gridCanvas = gridCanvasRef.current;

    if (!plotCanvas || !gridCanvas) return;

    rendererRef.current = new DomainColoringPlot(
      plotCanvas,
      gridCanvas,
      transformRef.current,
      expressionNodeRef.current,
    );

    return () => {
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, []);

  const handleTransformChange = useCallback((m: DOMMatrix) => {
    rendererRef.current?.updateTransform(m);
  }, []);

  const handleExpressionChange = useCallback((expression: string) => {
    try {
      expressionNodeRef.current = parse(expression);
    } catch {
      expressionNodeRef.current = null;
    }
    rendererRef.current?.updateExpression(expressionNodeRef.current);
  }, []);

  const codomainPosition = evaluateAt(
    expressionNodeRef.current,
    pointerPosition,
  );

  return (
    <PointerContext value={{ positionRef, setPointerPosition }}>
      <div className="size-full grid grid-rows-[auto_1fr]">
        <header className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-text border-b border-b-secondary">
          <ComplexInput onExpressionChange={handleExpressionChange} />
          <div className="flex justify-around">
            <Tex errorColor="#cc0000">
              {formatComplex(pointerPosition, "z")}
            </Tex>
            <Tex errorColor="#cc0000">
              {formatComplex(codomainPosition, "f(z)")}
            </Tex>
          </div>
        </header>
        <TransformDiv
          viewRange={viewRangeRef}
          transform={transformRef}
          onTransformChange={handleTransformChange}
          className="relative size-full"
        >
          <canvas ref={plotCanvasRef} className="absolute inset-0 size-full" />
          <canvas ref={gridCanvasRef} className="absolute inset-0 size-full" />
        </TransformDiv>
      </div>
    </PointerContext>
  );
}
