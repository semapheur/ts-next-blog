import { type RefObject, useEffect, useRef, useState } from "react"

export type Size = {
  height: number
  width: number
}

export default function useResizeObserver<T extends Element>(
  target: RefObject<T | null> | T | null,
): Size | null {
  const [size, setSize] = useState<Size | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)

  const observerCallback = (entries: ResizeObserverEntry[]) => {
    const entry = entries[0]

    const { blockSize: height, inlineSize: width } = entry.contentBoxSize[0]
    setSize({ height: height, width: width })
  }

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }
    const element = target && "current" in target ? target.current : target

    if (!element) return

    observerRef.current = new ResizeObserver(observerCallback)
    const { current: observer } = observerRef
    observer.observe(element as Element)

    return () => observer.disconnect()
  }, [target])

  return size
}
