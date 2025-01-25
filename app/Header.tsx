import Link from "next/link"

import SearchHeader from "./SearchHeader"
import ThemeToggle from "lib/components/ThemeToggle"
import MobileNav from "lib/components/MobileNav"

export default function Header() {
  const nav = [
    { title: "Notes", url: "/notes" },
    { title: "Apps", url: "/apps" },
  ]

  return (
    <header className="z-1 grid grid-cols-[auto_1fr_auto] content-start justify-items-center gap-4 border-b border-b-secondary bg-primary/50 p-2 backdrop-blur-xs transition-[height]">
      <>
        <Link
          key="logo"
          href="/"
          className="text-4xl text-text leading-none hover:text-secondary"
        >
          Γ
        </Link>
        <MobileNav width="1.75rem" bar="0.25rem" gap="0.5rem">
          {nav.map((n) => (
            <Link
              key={n.url}
              href={n.url}
              className="text-2xl text-text hover:text-secondary"
            >
              {n.title}
            </Link>
          ))}
        </MobileNav>
        <div className="flex items-start gap-2">
          <ThemeToggle key="theme" />
          <SearchHeader key="search" />
        </div>
      </>
    </header>
  )
}
