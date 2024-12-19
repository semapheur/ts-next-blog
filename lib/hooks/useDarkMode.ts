import useLocalStorage from "./useLocalStorage"
import useMediaQuery from "./useMediaQuery"
import useUpdateEffect from "./useUpdateEffect"

export const useDarkMode = (
  defaultTheme?: string,
): [string | undefined, (setValue: string) => void] => {
  // Check media query preference
  const mqPreference = useMediaQuery("(prefers-color-scheme: dark)")
    ? "dark"
    : "light"
  // Check local storage
  const [theme, setTheme] = useLocalStorage<string>(
    "theme",
    defaultTheme ?? mqPreference ?? "light",
  )

  useUpdateEffect(() => {
    // Only set theme if running on the client side (to avoid SSR issues)
    if (typeof window !== "undefined") {
      document.body.dataset.theme = theme
    }
  }, [theme])

  useUpdateEffect(() => {
    if (!theme) {
      setTheme(mqPreference)
    }
  }, [mqPreference, theme, setTheme])

  return [theme, setTheme]
}
