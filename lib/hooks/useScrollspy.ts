import { compareArrays } from "lib/utils/num"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

interface Options {
  root?: HTMLElement
  rootMargin?: string
  threshold?: number
}

export default function useScrollspy(
  elements: HTMLElement[],
  options?: Options,
): string[] {
  const [activeIds, setActiveIds] = useState<string[]>([])

  const observerRef = useRef<IntersectionObserver | null>(null)

  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      const active: string[] = []

      for (const e of entries) {
        const id = e.target.getAttribute("id")
        if (e.intersectionRatio > 0 && id) {
          active.push(id)
          observer.unobserve(e.target)
        }
      }
      if (!compareArrays(activeIds, active)) {
        setActiveIds(active)
      }
    },
    [activeIds],
  )

  // Memoize options for IntersectionObserver
  const optionsMemo = useMemo(() => {
    return {
      root: options?.root ?? null,
      rootMargin: options?.rootMargin ?? "0px 0px 0px 0px",
      threshold: options?.threshold ?? 0,
    }
  }, [options])

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }
    observerRef.current = new IntersectionObserver(
      observerCallback,
      optionsMemo,
    )
    const { current: observer } = observerRef

    for (const e of elements) {
      e ? observer.observe(e) : null
    }

    return () => observer.disconnect()
  }, [elements, observerCallback, optionsMemo])

  return activeIds
}
