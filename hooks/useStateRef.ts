import {MutableRefObject, Dispatch, SetStateAction, useEffect, useRef, useState} from 'react'

export default function useStateRef<T>(
  initialValue?: T
): [MutableRefObject<T|undefined>, (value: T) => void] 
{
  const [, _setState] = useState<T|undefined>(initialValue)
  const reference = useRef<T|undefined>(initialValue)

  const setState = (value: T) => {
    reference.current = value
    _setState(value)
  }
  
  return [reference, setState]
}