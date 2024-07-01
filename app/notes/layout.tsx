import { ReactNode } from 'react'

import Sidebar from './Sidebar'
import matter from 'gray-matter'
import { iterNotes } from 'lib/utils/fetching'
import { NoteDetails, NoteMatter } from 'lib/utils/types'

function getNoteDetails(
  fileName: string,
  subject: string,
  note: Buffer,
  result: NoteDetails,
) {
  const { data: metaData } = matter(note)
  if (!result[subject]) {
    result[subject] = [] as NoteMatter[]
  }
  result[subject].push({
    slug: fileName.replace('.mdx', ''),
    title: metaData.title,
  })
  return result
}

export default async function NotesLayout({
  children,
}: {
  children: ReactNode
}) {
  const details = await iterNotes(getNoteDetails)

  return (
    <div className='relative flex h-full min-h-0'>
      <Sidebar noteDetails={details} />
      {children}
    </div>
  )
}
