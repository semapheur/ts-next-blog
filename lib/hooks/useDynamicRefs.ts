import { createRef, type RefObject } from "react"

const refs = new Map<string, RefObject<unknown>>()

function setRef<T>(key: string): RefObject<T | null> | void {
  if (!key) return console.warn("useDynamicRefs: Cannot set ref without key!")
  const ref = createRef<T>()
  refs.set(key, ref)
  return ref
}

function getRef<T>(key: string): RefObject<T> | void {
  if (!key) return console.warn("useDynamicRefs: Cannot get ref without key!")
  return refs.get(key) as RefObject<T>
}

export default function useDynamicRefs<T>(): [
  (key: string) => RefObject<T | null> | void,
  (key: string) => RefObject<T | null> | void,
] {
  return [getRef, setRef]
}
