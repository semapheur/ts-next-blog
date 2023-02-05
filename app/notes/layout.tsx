import React from 'react'

import Sidebar from './Sidebar';
import matter from 'gray-matter';
import { iterNotes } from 'utils/fetching';
import { NoteDetails, NoteMatter } from 'utils/types';

function getNoteDetails(fileName: string, subject: string, note: Buffer, result: NoteDetails) {

  const {data: metaData} = matter(note);
  if (!result[subject]) {result[subject] = [] as NoteMatter[]}
  result[subject].push({
    slug: fileName.replace('.mdx', ''),
    title: metaData.title
  }) 
  return result;
}

export default async function NotesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const details = await iterNotes(getNoteDetails);

  return (
    <div className='flex h-full min-h-0'>
      <Sidebar noteDetails={details} />
      {children}
    </div>
  )
}