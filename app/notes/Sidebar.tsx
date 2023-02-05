import Link from 'next/link';
import { NoteDetails } from 'utils/types';

type Props = {
  noteDetails: NoteDetails,
}

export default function Sidebar({noteDetails}: Props) {
  return (
    <nav className='max-w-20 min-w-max bg-primary'>
      {Object.entries(noteDetails).map(([subject, notes]) => (
        <>
          <label className='block pl-3 text-text text-xl font-bold cursor-pointer 
            border-b border-shadow hover:border-secondary 
            transition-colors duration-300 ease-out'
            htmlFor={subject}
            key={'label.' + subject}
          >
            {subject.charAt(0).toUpperCase() + subject.slice(1)}
          </label>
          <input key={'input.' + subject} id={subject} type='checkbox' className='peer hidden'/>
          <ul key={'ul.' + subject}
            className='list-none pr-[calc(0.5rem+4px)] h-0 overflow-hidden
            peer-checked:h-auto transition-[height] duration-300 ease-in-out' 
          >
            {notes.map(note => (
              <li key={'li.' + note.slug} className='list-none pl-2 overflow-hidden
                hover:border-l-4 hover:border-secondary
                transition duration-300 ease-out'
              >
                <Link className='text-text' href={`/notes/${subject}/${note.slug}`} key={'a.' + note.slug}
                >
                  {note.title}
                </Link>
              </li>
            ))
            }
          </ul>
        </>
      ))}
    </nav>
  )
}