import { type RefObject, useEffect, useRef, useState } from "react";

export interface Size {
  height: number;
  width: number;
}

export default function useResizeObserver<T extends Element>(
  target: RefObject<T | null> | T | null,
): Size | null {
  const [size, setSize] = useState<Size | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const observerCallback = (entries: ResizeObserverEntry[]) => {
      const entry = entries[0];

      const width =
        entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
      const height =
        entry.contentBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
      setSize({ height: height, width: width });
    };

    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    const element = target && "current" in target ? target.current : target;

    if (!element) return;

    observerRef.current = new ResizeObserver(observerCallback);
    const { current: observer } = observerRef;
    observer.observe(element as Element);

    return () => observer.disconnect();
  }, [target]);

  return size;
}
