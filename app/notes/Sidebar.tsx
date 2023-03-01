import Link from 'next/link';
import { NoteDetails } from 'utils/types';

type Props = {
  noteDetails: NoteDetails,
}

function Toggle() {
  return (
    <>
      <input key={'input.sidebar'} id='sidebar-toggle' type='checkbox'
        className='peer/toggle hidden'
      />
      <label key={'label.sidebar'} htmlFor='sidebar-toggle' 
        className='w-10 h-10 absolute bottom-[10%] left-full
          flex items-center cursor-pointer md:hidden z-[1]
          bg-primary/50 backdrop-blur-sm rounded-r-full shadow-trb
          dark:shadow-black/50 -ml-2 peer-checked/toggle:ml-0
          after:w-1/3 after:h-1/3 
          after:border-text after:hover:border-secondary
          after:border-b-2 after:border-r-2
          after:-rotate-45 peer-checked/toggle:after:rotate-[135deg]
          after:translate-x-[90%] after:transition-transform' 
      />
    </>
  )
}

export default function Sidebar({noteDetails}: Props) {
  return (
    <div className='absolute top-0 left-0 h-full z-[1]
      bg-primary/50 backdrop-blur shadow-lg md:relative w-auto'
    >
      <Toggle/>
      <nav key={'nav.sidebar'} className='w-0 md:min-w-max bg-primary/50
        peer-checked/toggle:w-max transition-transform overflow-x-hidden'
      >
        {Object.entries(noteDetails).map(([subject, notes]) => (
          <>
            <label htmlFor={subject} key={'label.' + subject}
              className='block pl-3 text-text text-xl font-bold cursor-pointer 
                border-b border-shadow hover:border-secondary
                transition-colors duration-300 ease-out'
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
                  <Link href={`/notes/${subject}/${note.slug}`} key={'a.' + note.slug}
                    className='text-text'
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
    </div>
  )
}