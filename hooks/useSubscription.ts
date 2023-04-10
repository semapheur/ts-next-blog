import {useEffect} from 'react'
import {BehaviorSubject} from 'rxjs'

export default function useSubscription<T>(
  source$: BehaviorSubject<T>, 
  nextHandler: (value: T) => void,
  errorHandler?: (error: any) => void
) {
  useEffect(() => {
    if (source$) {
      const sub = source$.subscribe({
        next: nextHandler,
        error: errorHandler
      })
      return () => {
        sub.unsubscribe()
      }
    }
  }, [source$])
}