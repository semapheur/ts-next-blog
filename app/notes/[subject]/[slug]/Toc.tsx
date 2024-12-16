"use client"

import { useEffect, useMemo, useState } from "react"
//import { MDXRemote } from "next-mdx-remote"
import useScrollspy from "lib/hooks/useScrollspy"
import type { NoteHeading } from "lib/utils/types"
import { BookIcon } from "lib/utils/icons"
import MathText from "lib/components/MathText"

type TocItem = {
  heading: NoteHeading
  activeIds: string[]
}

type Props = {
  headings: NoteHeading[]
}

// million-ignore
function TocItem({ heading, activeIds }: TocItem) {
  const subItem = useMemo(() => {
    return (
      <>
        {heading.children?.map((h, index) => (
          <TocItem
            key={`tocsubitem.${index}`}
            heading={h}
            activeIds={activeIds}
          />
        ))}
      </>
    )
  }, [heading, activeIds])

  return (
    <li key={`li.${heading.slug}`} className="relative list-none">
      {heading.children && (
        <>
          <input
            key={`input.${heading.slug}`}
            id={heading.slug}
            type="checkbox"
            className="peer absolute top-1 left-0 z-[1] h-5 w-5 cursor-pointer opacity-0"
          />
          <label
            key={`label.${heading.slug}`}
            htmlFor={heading.slug}
            className='after:-rotate-45 absolute top-0 left-0 inline-block h-5 w-5 translate-y-1 after:absolute after:top-[50%] after:left-[50%] after:box-border after:block after:h-1/3 after:w-1/3 after:translate-x-[-50%] after:translate-y-[-75%] after:border-text after:border-r after:border-b after:transition-transform after:content-[""] after:peer-checked:rotate-45'
          />
        </>
      )}
      <a
        key={`a.${heading.slug}`}
        href={`#${heading.slug}`}
        className={`inline-block text-wrap pl-6 ${
          activeIds.includes(heading.slug) ? "text-secondary" : "text-text"
        }`}
      >
        <MathText mathString={heading.text} />
      </a>
      {heading.children && (
        <ul
          key={`ul.${heading.slug}`}
          className="h-0 list-none overflow-hidden pl-4 peer-checked:h-auto"
        >
          {subItem}
        </ul>
      )}
    </li>
  )
}

function Toggle() {
  return (
    <>
      <input
        key="input.toc"
        id="toc-toggle"
        type="checkbox"
        className="peer hidden"
      />
      <label
        key="label.toc"
        htmlFor="toc-toggle"
        className="-mr-2 absolute top-[10%] right-0 z-[1] grid h-10 w-10 cursor-pointer place-items-center rounded-l-full bg-primary/50 pr-1 shadow-tlb backdrop-blur-sm lg:hidden dark:shadow-black/50"
      >
        <BookIcon className="h-6 w-6 stroke-text hover:stroke-secondary" />
      </label>
    </>
  )
}

export default function Toc({ headings }: Props) {
  const [headingIds, setHeadingIds] = useState<HTMLHeadingElement[]>([])

  useEffect(() => {
    const result: string[] = []

    const callback = (h: NoteHeading) => {
      result.push(`h${h.level}[id="${h.slug}"]`)
      h.children?.forEach(callback)
    }

    headings.forEach(callback)
    const selector = result.toString()
    setHeadingIds(Array.from(document.querySelectorAll(selector)))
  }, [headings])

  const activeIds = useScrollspy(headingIds, { threshold: 0.3 })

  return (
    <>
      <Toggle />
      <aside className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 hidden h-min max-h-[80%] min-h-0 flex-col rounded-md bg-primary/50 p-2 shadow-md backdrop-blur-sm peer-checked:flex lg:static lg:m-2 lg:flex lg:max-h-[calc(100%-16px)] lg:min-w-min lg:translate-x-0 lg:translate-y-0 dark:shadow-black/50">
        <>
          <div
            key="div.toc"
            className="flex justify-start gap-x-1 border-b border-b-secondary"
          >
            <button key="button.toc" type="button" className="cursor-default">
              <BookIcon className="h-6 w-6 stroke-text" />
            </button>
            <h2 key="h2.toc" className="font-bold text-text">
              Contents
            </h2>
          </div>
          <nav key="nav.toc" className="overflow-y-scroll">
            <ul className="h-auto list-none">
              {headings?.map((h: NoteHeading, index: number) => (
                <TocItem
                  key={`tocitem.${index}`}
                  heading={h}
                  activeIds={activeIds}
                />
              ))}
            </ul>
          </nav>
        </>
      </aside>
    </>
  )
}
