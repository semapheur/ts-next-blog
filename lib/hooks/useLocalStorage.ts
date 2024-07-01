import {
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useRef,
	useState
} from 'react';

import useEventListener from './useEventListener';

declare global {
	interface WindowEventMap {
		'local-storage': CustomEvent
	}
}

type SetValue<T> = Dispatch<SetStateAction<T | undefined>>

// Wrapper for JSON.parse() supporting 'undefined' value
function parseJSON<T>(value: string | null): T | undefined {
    try {
			return value === 'undefined' ? undefined : JSON.parse(value ?? '');
    } catch {
			console.log('parsing error on', {value});
			return undefined;
    }
}

export default function useLocalStorage<T>(key: string, initialValue?: T): [T | undefined, SetValue<T>] {
    // Parse stored json from local storage or return initial value
    const readValue = useCallback((): T | undefined => {
			// Prevent build error 'window is undefined'
			if (typeof window === 'undefined') {
					return initialValue;
			}

			try {
					const item = window.localStorage.getItem(key);
					return item ? (parseJSON(item) as T) : initialValue
			} catch (error) {
					console.warn(`Error reading localStorage key "${key}":`, error);
					return initialValue;
			}
    }, [initialValue, key]);

    // State to store value
    const [storedValue, setStoredValue] = useState<T | undefined>(readValue);
    const setValueRef = useRef<SetValue<T>>();

    setValueRef.current = value => {
			// Prevent build error 'window is undefined'
			if (typeof window === 'undefined') {
					console.warn(
							`Tried setting localStorage key "${key}" even though environment is not a client`,
					)
			}

			try {
					// Allow value to be a function
					const newValue = value instanceof Function ? value(storedValue) : value;

					// Save to local storage
					window.localStorage.setItem(key, JSON.stringify(newValue));

					// Save state
					setStoredValue(newValue);

					// Dispatch a custom event so every useLocalStorage hook is notified
					window.dispatchEvent(new Event('local-storage'));
			} catch (error) {
					console.warn(`Error setting localStorage key "${key}":`, error)
			}
    }

    const setValue: SetValue<T> = useCallback(
			value => setValueRef.current?.(value),
			[]
    )
    
    useEffect(() => {
			setStoredValue(readValue())
			// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    
    const handleStorageChange = useCallback(() => {
			setStoredValue(readValue())
    }, [readValue]);

    useEventListener('storage', handleStorageChange);
    useEventListener('local-storage', handleStorageChange);

    return [storedValue, setValue];
}