import useLocalStorage from './useLocalStorage';
import useMediaQuery from './useMediaQuery';
import useUpdateEffect from './useUpdateEffect';

export const useDarkMode = (defaultTheme?: string)
	: [string|undefined, (setValue: string) => void] =>
{
	// Check media query preference
	const mqPreference = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';
	// Check local storage
	const [theme, setTheme] = useLocalStorage<string>('theme', defaultTheme ?? mqPreference ?? 'light');

	useUpdateEffect(() => {
		setTheme(mqPreference);
		document.body.dataset.theme = mqPreference;
	}, [mqPreference])

	return [theme, setTheme];
}