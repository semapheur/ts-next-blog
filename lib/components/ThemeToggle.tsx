'use client'

import { useEffect } from 'react'
import { useDarkMode } from 'lib/hooks/useDarkMode'
import useHasMounted from 'lib/hooks/useHasMounted'

const UNIT = 100
const root = Math.sqrt(2)
const VB_SIZE = 2 * (1 + root) * UNIT // Viewbox size

const sunPath = (unit: number): string => {
  const root = Math.sqrt(2)
  const rootInv = 1 / root
  const line = rootInv * unit
  const origin = unit * (1 + root)
  const radius = unit * (1 + rootInv) * 0.8

  return `
		M${line},${(2 + root + rootInv) * unit} h${unit} l${line},${line} l${line},-${line} h${unit} 
		v-${unit} l${line},-${line} l-${line},-${line} v-${unit} 
		h-${unit} l-${line},-${line} l-${line},${line} h-${unit}
		v${unit} l-${line},${line} l${line},${line}Z
		M${origin},${origin} m-${radius},0 
		a${radius},${radius} 0 1,1 ${2 * radius},0 
		a${radius},${radius} 0 1,1 -${2 * radius},0Z
	`
}

export default function ThemeToggle() {
  const [activeTheme, setActiveTheme] = useDarkMode()
  // Check if active theme is valid
  if (activeTheme && !['light', 'dark'].includes(activeTheme)) {
    console.error(`Invalid color mode: ${activeTheme}`)
  }
  const inactiveTheme = activeTheme === 'light' ? 'dark' : 'light'

  useEffect(() => {
    document.body.dataset.theme = activeTheme
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [activeTheme])

  const hasMounted = useHasMounted()
  if (!hasMounted) return null

  return (
    <button
      className='relative cursor-pointer before:absolute 
		before:text-sm before:px-1
		before:right-[110%] before:top-1/2 before:-translate-y-1/2
		before:min-w-max before:rounded
		before:bg-text/50 before:text-primary before:border-secondary
		before:shadow-md before:backdrop-blur-sm
		hover:before:content-[attr(aria-label)]'
      type='button'
      aria-label={`Switch to ${inactiveTheme} theme`}
      onClick={() => setActiveTheme(inactiveTheme)}
    >
      <svg
        className={`transition-transform duration-700 ease-out
				${activeTheme === 'light' ? 'rotate-[0.5turn]' : ''}`}
        viewBox={`0 0 ${VB_SIZE} ${VB_SIZE}`}
        width='2rem'
        height='2rem'
      >
        <title>Toggle dark/light mode</title>
        <g className='origin-center fill-text'>
          <path d={sunPath(UNIT)} fillRule='evenodd' />
          <circle
            className={`transition-transform duration-500 ease-out 
						${activeTheme === 'light' ? '-translate-x-[15%] translate-y-[15%]' : ''}`}
            cx={VB_SIZE / 2}
            cy={VB_SIZE / 2}
            r={UNIT - 3}
          />
        </g>
      </svg>
    </button>
  )
}
