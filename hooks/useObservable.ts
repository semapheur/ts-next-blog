import {useEffect, useState} from 'react'
import {BehaviorSubject} from 'rxjs'
import useSubscription from './useSubscription';

export default function useObservable<T>(source$: BehaviorSubject<T>, initialValue?: T) {
  const [value, setValue] = useState<T>(initialValue ?? source$.getValue())
 
  useSubscription(source$, (v: T) => setValue(v))
 
  return value
}