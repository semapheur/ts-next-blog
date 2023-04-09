import {useState} from 'react'
import {BehaviorSubject} from 'rxjs'

export default function useObservable<T>(initialState: T) {
  const [observable] = useState(new BehaviorSubject<T>(initialState))

  const handleNext = (value: T) => {
    observable.next(value)
  }

  return [observable, handleNext]
}