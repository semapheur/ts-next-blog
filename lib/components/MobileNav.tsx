import type { CSSProperties, ReactNode } from "react"

type Props = {
  width: string
  bar: string
  gap: string
  height?: string
  children: ReactNode
}

export default function MobileNav({
  width,
  bar,
  gap,
  height,
  children,
}: Props) {
  if (!height) height = "100%"

  const style = {
    "--width": width,
    "--height": height,
    "--bar": bar,
    "--gap": gap,
    "--shift": `calc(0.5 * ${gap} + 0.5 * ${bar})`,
  } as CSSProperties

  return (
    <div className="h-full grid grid-rows-[1fr_auto] place-items-center">
      <input
        key="input.hamburger"
        type="checkbox"
        id="hamburger"
        className="peer hidden"
      />
      <label
        key="label.hamburger"
        style={style}
        htmlFor="hamburger"
        className='peer w-[var(--width)] h-[var(--height)]
          flex md:hidden flex-col justify-center gap-[var(--gap)]
          bg-transparent cursor-pointer
          before:w-full before:h-[var(--bar)] before:content-[""] 
          before:bg-text hover:before:bg-secondary before:rounded-full
          before:transition-transform
          peer-checked:before:translate-y-[var(--shift)]
          peer-checked:before:rotate-45
          after:w-full after:h-[var(--bar)] after:content-[""] 
          after:bg-text hover:after:bg-secondary after:rounded-full
          after:transition-transform
          peer-checked:after:-translate-y-[var(--shift)]
          peer-checked:after:-rotate-45'
      />
      <nav
        key="nav.header"
        className="h-0 flex flex-col gap-2 overflow-hidden
        md:h-full md:flex md:flex-row md:gap-8
        peer-checked:h-min"
      >
        {children}
      </nav>
    </div>
  )
}
