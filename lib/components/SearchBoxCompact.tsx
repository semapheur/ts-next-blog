import type { ChangeEventHandler } from "react"
import { SearchIcon } from "lib/utils/icons"

type Props = {
  query: string
  onChange: ChangeEventHandler<HTMLInputElement>
}

export default function SearchBoxCompact({ query, onChange }: Props) {
  return (
    <form className="peer relative flex h-8 w-8 max-w-xs items-center overflow-hidden rounded-full bg-text p-1 focus-within:w-full">
      <SearchIcon className="h-6 w-6 stroke-primary" />
      <input
        className="absolute left-0 w-full cursor-pointer bg-transparent px-1 text-primary opacity-0 transition-opacity focus:static focus:cursor-text focus:opacity-100 focus:outline-hidden"
        type="text"
        placeholder="Search..."
        value={query}
        onChange={onChange}
      />
    </form>
  )
}
