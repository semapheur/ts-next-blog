'use client'

import { ChangeEvent, useEffect, useState } from 'react'

import { SearchResult } from 'pages/api/searchnotes'
import {XorFilter} from 'bloom-filters'
import Link from 'next/link'

import dynamic from 'next/dynamic'
const Modal = dynamic(() => import('components/LatexModal'), {ssr: false}) //import Modal from 'components/Modal'

import notes from 'cache/notes.json'
import { SearchIcon } from 'utils/icons'
import tokenize from 'utils/tokenize'

export default function SearchBar() {
  const [query, setQuery] = useState<string>('')
  const [searchResult, setSearchResult] = useState<SearchResult>([])
  const [showModal, setShowModal] = useState<boolean>(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }
  const handleClick = () => {
    setQuery('')
    setShowModal(false)
  }
  //const {data: result} = useSWR(query, searchFetcher)
  
  useEffect(() => {
    let result: SearchResult = []
    const tokens = tokenize(query)

    let score = 0
    for (const note of notes) {
      score = tokens.filter(q => note.title.toLowerCase().includes(q)).length

      const xor8 = XorFilter.fromJSON(JSON.parse(JSON.stringify(note.filter))) as XorFilter
      tokens.forEach(q => {
        if (xor8.has(q)) score++
      })

      if (score > 0) {
        result.push({
          score: score,
          slug: note.slug,
          title: note.title
        })
      }
    }
    setSearchResult(result)

  }, [query])

  return (
    <>
      <button className='h-8 w-8 p-1 bg-text rounded-full' onClick={() => setShowModal(true)}>
        <SearchIcon className='h-6 w-6 stroke-primary'/>
      </button>
      <Modal title='Search' isOpen={showModal} onClose={() => setShowModal(!showModal)}>
        <div className='grid grid-rows-[auto_1fr] p-1 h-auto w-auto'>
          <input className='px-2 rounded focus:outline-none focus:ring-2 focus:ring-secondary' 
            type='text' placeholder='Seek, and you shall find' value={query} onChange={handleChange}
          />
          <nav className='h-full overflow-y-auto overscroll-y-contain'>
            {searchResult.map((note) => 
              <Link className='block py-1 text-text hover:text-secondary' 
                href={`notes/${note.slug}`}
                key={note.slug} onClick={handleClick}
              >
                {note.title}
            </Link>)}
          </nav>
        </div>
      </Modal>
    </>
  )
}
