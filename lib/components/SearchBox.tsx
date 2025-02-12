"use client"

import type { ChangeEventHandler } from "react"
import { CrossIcon, SearchIcon } from "lib/utils/icons"

type Props = {
  query: string
  onChange: ChangeEventHandler<HTMLInputElement>
}

export default function SearchBox({ query, onChange }: Props) {
  return (
    <form className="flex items-center justify-center gap-2 rounded-md border bg-primary p-2 focus-within:border-none focus-within:ring-2 focus-within:ring-secondary hover:shadow-sm">
      <button className="" type="submit">
        <SearchIcon className="h-6 w-6 stroke-secondary" />
      </button>
      <input
        className="peer w-full bg-inherit text-text focus:outline-hidden"
        type="text"
        placeholder="Search..."
        value={query}
        onChange={onChange}
      />
      <button className="hidden peer-focus:block" type="button">
        <CrossIcon className="h-6 w-6 stroke-text hover:stroke-red-500" />
      </button>
    </form>
  )
}
