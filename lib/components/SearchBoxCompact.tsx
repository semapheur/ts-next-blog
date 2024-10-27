import type { ChangeEventHandler } from "react"
import { SearchIcon } from "lib/utils/icons"

type Props = {
  query: string
  onChange: ChangeEventHandler<HTMLInputElement>
}

export default function SearchBoxCompact({ query, onChange }: Props) {
  return (
    <form
      className="peer relative flex items-center h-8 w-8 p-1 max-w-xs 
      bg-text rounded-full focus-within:w-full overflow-hidden"
    >
      <SearchIcon className="h-6 w-6 stroke-primary" />
      <input
        className="absolute left-0 w-full px-1 bg-transparent opacity-0
        text-primary cursor-pointer focus:outline-none focus:opacity-100
        focus:cursor-text focus:static transition-opacity"
        type="text"
        placeholder="Search..."
        value={query}
        onChange={onChange}
      />
    </form>
  )
}
