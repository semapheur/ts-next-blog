"use client"

import { type ChangeEvent, useEffect, useState } from "react"

import type { SearchResult } from "pages/api/searchnotes"
import Link from "next/link"

import dynamic from "next/dynamic"
const Modal = dynamic(() => import("lib/components/LatexModal"), { ssr: false }) //import Modal from 'lib/components/Modal'

import notes from "content/cache/notes.json"
import { SearchIcon } from "lib/utils/icons"
import { searchNotes } from "lib/utils/search"

export default function SearchBar() {
  const [query, setQuery] = useState<string>("")
  const [searchResult, setSearchResult] = useState<SearchResult>([])
  const [showModal, setShowModal] = useState<boolean>(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }
  const handleClick = () => {
    setQuery("")
    setShowModal(false)
  }

  useEffect(() => {
    const result = searchNotes(query, notes)
    setSearchResult(result)
  }, [query])

  return (
    <>
      <button
        type="button"
        className="h-8 w-8 rounded-full bg-text p-1"
        onClick={() => setShowModal(true)}
      >
        <SearchIcon className="h-6 w-6 stroke-primary" />
      </button>
      <Modal
        title="Search"
        isOpen={showModal}
        onClose={() => setShowModal(!showModal)}
      >
        <div className="grid h-auto w-auto grid-rows-[auto_1fr] p-1">
          <input
            className="rounded-sm px-2 focus:outline-hidden focus:ring-2 focus:ring-secondary"
            type="text"
            placeholder="Seek, and you shall find"
            value={query}
            onChange={handleChange}
          />
          <nav className="h-full overflow-y-auto overscroll-y-contain">
            {searchResult.map((note) => (
              <Link
                className="block py-1 text-text hover:text-secondary"
                href={`/notes/${note.slug}`}
                key={note.slug}
                onClick={handleClick}
              >
                {note.title}
              </Link>
            ))}
          </nav>
        </div>
      </Modal>
    </>
  )
}
