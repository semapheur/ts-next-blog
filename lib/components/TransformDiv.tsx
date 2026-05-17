"use client";

import {
  createContext,
  use,
  useEffect,
  useRef,
  type HTMLProps,
  type PointerEvent,
  type ReactNode,
  type RefObject,
  type WheelEvent,
} from "react";
import type { ViewRange } from "lib/utils/types";
import Vector from "lib/utils/vector";
import { screenToDrawPosition } from "lib/utils/svg";

interface Props extends HTMLProps<HTMLDivElement> {
  viewRange: RefObject<ViewRange>;
  transform: RefObject<DOMMatrix>;
  onTransformChange: (m: DOMMatrix) => void;
  children: ReactNode;
}

interface PointerContextValue {
  positionRef: RefObject<DOMPoint>;
  setPointerPosition: (p: DOMPoint) => void;
}

export const PointerContext = createContext<PointerContextValue>({
  positionRef: { current: new DOMPoint(0, 0) },
  setPointerPosition: () => {},
});

export default function TransformDiv({
  viewRange,
  transform,
  onTransformChange,
  children,
  ...props
}: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef<DOMPoint>(new DOMPoint(0, 0));
  const divSize = useRef<DOMPoint>(new DOMPoint(0, 0));
  const { positionRef, setPointerPosition } = use(PointerContext);

  function handleResize(entries: ResizeObserverEntry[]) {
    const entry = entries[0];
    if (!entry || !transform.current) return;

    const oldSize = divSize.current;

    const size = entry.contentBoxSize?.[0];
    const width = size?.inlineSize ?? entry.contentRect.width;
    const height = size?.blockSize ?? entry.contentRect.height;

    const viewport = document.querySelector("meta[name=viewport]");
    viewport?.setAttribute(
      "content",
      `height=${oldSize.y}px, width=device-width, initial-scale=1.0`,
    );

    const currentViewRange = getViewRange(
      transform.current,
      oldSize.x,
      oldSize.y,
    );
    transform.current = setTransform(currentViewRange, width, height);
    divSize.current = new DOMPoint(width, height);

    viewport?.setAttribute(
      "content",
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0",
    );

    onTransformChange(transform.current);
  }

  function handlePointerDown(event: PointerEvent) {
    if (!["pen", "touch"].includes(event.pointerType) && event.button !== 1)
      return;
    isDragging.current = true;
    startPos.current = new DOMPoint(event.clientX, event.clientY);
  }

  function handlePointerMove(event: PointerEvent) {
    const div = divRef.current;
    if (!div) return;

    const { left, top } = div.getBoundingClientRect();
    const screenPos = new DOMPoint(event.clientX - left, event.clientY - top);
    const drawPos = screenToDrawPosition(screenPos, transform.current);

    positionRef.current = drawPos;
    setPointerPosition(drawPos);

    if (isDragging.current) {
      event.preventDefault();

      transform.current.e += event.clientX - startPos.current.x;
      transform.current.f += event.clientY - startPos.current.y;

      startPos.current = new DOMPoint(event.clientX, event.clientY);

      onTransformChange(transform.current);
    }
  }

  function handlePointerUp() {
    isDragging.current = false;
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    const div = divRef.current;
    if (!div) return;

    const { left, top } = div.getBoundingClientRect();

    const zoomFactor = 1 + Math.sign(-event.deltaY) * 0.1;
    const zoomPos = new DOMPoint(event.clientX - left, event.clientY - top);

    transform.current.a *= zoomFactor;
    transform.current.d *= zoomFactor;
    transform.current.e =
      zoomPos.x + (transform.current.e - zoomPos.x) * zoomFactor;
    transform.current.f =
      zoomPos.y + (transform.current.f - zoomPos.y) * zoomFactor;

    onTransformChange(transform.current);
  }

  useEffect(() => {
    const div = divRef.current;

    if (!div) return;

    const { width, height } = div.getBoundingClientRect();
    viewRange.current = squareGrids(viewRange.current, width, height);
    transform.current = setTransform(viewRange.current, width, height);
    divSize.current = new DOMPoint(width, height);
    onTransformChange(transform.current);

    const observer = new ResizeObserver(handleResize);
    observer.observe(div);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={divRef}
      {...props}
      style={{ touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    >
      {children}
    </div>
  );
}

function squareGrids(
  view: ViewRange,
  width: number,
  height: number,
): ViewRange {
  const viewLength = new Vector(
    view.x.diff() as number,
    view.y.diff() as number,
  );

  if (width < height) {
    const aspect = width / height;
    const xLength = viewLength.y * aspect;

    view.x = new Vector(view.x.mean - xLength / 2, view.x.mean + xLength / 2);
  } else if (width > height) {
    const aspect = height / width;
    const yLength = viewLength.x * aspect;

    view.y = new Vector(view.y.mean - yLength / 2, view.y.mean + yLength / 2);
  } else {
    const deltaLength = viewLength.diff() as number;
    if (deltaLength < 0) {
      view.x = new Vector(
        view.x.mean - viewLength.y / 2,
        view.x.mean + viewLength.y / 2,
      );
    } else if (deltaLength > 0) {
      view.y = new Vector(
        view.y.mean - viewLength.x / 2,
        view.y.mean + viewLength.x / 2,
      );
    }
  }
  return view;
}

function setTransform(
  viewRange: ViewRange,
  width: number,
  height: number,
): DOMMatrix {
  const viewLength = new Vector(
    viewRange.x.diff() as number,
    viewRange.y.diff() as number,
  );

  return new DOMMatrix([
    width / viewLength.x,
    0,
    0,
    height / viewLength.y,
    width * (-viewRange.x[0] / viewLength.x),
    height * (-viewRange.y[0] / viewLength.y),
  ]);
}

function getViewRange(
  matrix: DOMMatrix,
  width: number,
  height: number,
): ViewRange {
  const x0y0 = screenToDrawPosition(new DOMPoint(0, 0), matrix);
  const x1y1 = screenToDrawPosition(new DOMPoint(width, height), matrix);

  const newViewRange = {
    x: new Vector(x0y0.x, x1y1.x),
    y: new Vector(x0y0.y, x1y1.y),
  };

  return squareGrids(newViewRange, width, height);
}
