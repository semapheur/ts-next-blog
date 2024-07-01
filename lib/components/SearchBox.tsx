'use client'

import { ChangeEventHandler } from 'react'
import { CrossIcon, SearchIcon } from 'lib/utils/icons'

type Props = {
  query: string
  onChange: ChangeEventHandler<HTMLInputElement>
}

export default function SearchBox({ query, onChange }: Props) {
  return (
    <form
      className='p-2 flex justify-center items-center gap-2 
      bg-primary border rounded-md focus-within:border-none hover:shadow
      focus-within:ring-2 focus-within:ring-secondary'
    >
      <button className='' type='submit'>
        <SearchIcon className='h-6 w-6 stroke-secondary' />
      </button>
      <input
        className='peer w-full bg-inherit text-text focus:outline-none'
        type='text'
        placeholder='Search...'
        value={query}
        onChange={onChange}
      />
      <button className='hidden peer-focus:block'>
        <CrossIcon className='h-6 w-6 stroke-text hover:stroke-red-500' />
      </button>
    </form>
  )
}
