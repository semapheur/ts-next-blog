'use client'

import { ChangeEvent, useState } from 'react';
import useSWR, {Fetcher} from 'swr';

import { SearchResult } from 'pages/api/searchnotes';
import SearchBoxCompact from 'components/SearchBoxCompact';
import Link from 'next/link';
import Loader from 'components/Loader';

const searchFetcher: Fetcher<SearchResult, string> = async (query) => {
  return await fetch(`/api/searchnotes?q=${query}`).then(res => res.json());
}

export default function SearchBar() {
  const [query, setQuery] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }
  const handleClick = () => {
    setQuery('')
  }
  const {data: result} = useSWR(query, searchFetcher)

  return (
    <div className='relative'>
      <SearchBoxCompact query={query} onChange={handleChange}/>
      {(query && result) && 
        <div className='hidden peer-focus-within:block absolute top-8 left-4 px-2 bg-primary border z-[1]'>
          <h4 className='text-text'>
            {`${result.length} results`}
          </h4>
          {result.map((note) => 
            <Link className='block py-1 text-text hover:text-secondary' 
              href={`notes/${note.slug}`}
              key={note.slug} onClick={handleClick}
            >
              {note.title}
          </Link>)}
        </div>
      }
    </div>
  )
}
