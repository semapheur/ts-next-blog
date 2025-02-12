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
    <div className="grid h-full grid-rows-[1fr_auto] place-items-center">
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
        className="peer peer-checked:after:-translate-y-[var(--shift)] peer-checked:after:-rotate-45 flex h-[var(--height)] w-[var(--width)] cursor-pointer flex-col justify-center gap-[var(--gap)] bg-transparent before:h-[var(--bar)] before:w-full before:rounded-full before:bg-text before:transition-transform before:content-[''] after:h-[var(--bar)] after:w-full after:rounded-full after:bg-text after:transition-transform after:content-[''] hover:after:bg-secondary hover:before:bg-secondary peer-checked:before:translate-y-[var(--shift)] peer-checked:before:rotate-45 md:hidden"
      />
      <nav
        key="nav.header"
        className="flex h-0 flex-col gap-2 overflow-hidden peer-checked:h-min md:flex md:h-full md:flex-row md:gap-8"
      >
        {children}
      </nav>
    </div>
  )
}
