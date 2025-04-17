"use client"

import { type ChangeEvent, type MouseEvent, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
//import useSWR, {Fetcher} from 'swr'

import SearchBox from "lib/components/SearchBox"
import type { SearchResult } from "pages/api/searchnotes"
import { searchNotes } from "lib/utils/search"
import notes from "content/cache/notes.json"

const Preview = dynamic(() => import("./PreviewNotes"), { ssr: false })

//const searchFetcher: Fetcher<SearchResult, string> = async (query) => {
//  return await fetch(`/api/searchnotes?q=${query}`).then(res => res.json())
//}

export default function SearchNotes() {
  const [query, setQuery] = useState<string>("")
  const [searchResult, setSearchResult] = useState<SearchResult>([])
  const [preview, setPreview] = useState<string>("")

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleMouseOver = (e: MouseEvent<HTMLAnchorElement>) => {
    const slug = e.currentTarget.getAttribute("data-tag")
    if (slug) setPreview(slug)
  }
  //const {data: result, error} = useSWR(query, searchFetcher)

  useEffect(() => {
    const result = searchNotes(query, notes)
    setSearchResult(result)
  }, [query])

  return (
    <>
      <div className="flex flex-col gap-8 divide-y p-8" key="search">
        <div className="">
          <SearchBox query={query} onChange={handleChange} />
        </div>
        <div className="overflow-y-scroll">
          {query && (
            <h4 className="text-text">
              {!searchResult
                ? ""
                : searchResult.length > 0
                  ? `Found ${searchResult.length} results (hover for preview):`
                  : "No results found! Refine your query..."}
            </h4>
          )}
          {Array.isArray(searchResult) &&
            searchResult.map((note) => (
              <Link
                className="block py-1 text-text hover:text-secondary"
                href={`/notes/${note.slug}`}
                data-tag={note.slug}
                onMouseOver={handleMouseOver}
                key={note.slug}
              >
                {note.title}
              </Link>
            ))}
        </div>
      </div>
      <div className="hidden h-full justify-center overflow-y-scroll lg:flex">
        <Preview slug={preview} key="preview" />
      </div>
    </>
  )
}
