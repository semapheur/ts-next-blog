import { type DependencyList, type EffectCallback, useEffect } from "react"

import useIsFirstRender from "./useIsFirstRender"

export default function useUpdateEffect(
  effect: EffectCallback,
  deps?: DependencyList,
) {
  const isFirst = useIsFirstRender()

  useEffect(() => {
    if (!isFirst) {
      return effect()
    }
  }, [isFirst, ...(deps ?? [])])
}
