import Link from 'next/link';
import { NoteDetails } from 'utils/types';

type Props = {
  noteDetails: NoteDetails,
}

function titleCase(text: string) {
  return text
    .replace(/_/g, ' ') // Replace all underscores with spaces
    .replace(/\w\S*/g, (t) => { // Convert to title case
      return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    });
}

function Toggle() {
  return (
    <>
      <input key={'input.sidebar'} id='sidebar-toggle' type='checkbox'
        className='peer hidden'
      />
      <label key={'label.sidebar'} htmlFor='sidebar-toggle' 
        className='z-[1] w-10 h-10 absolute bottom-[10%] left-full
          flex items-center cursor-pointer md:hidden
          bg-primary/50 backdrop-blur-sm rounded-r-full shadow-trb
          dark:shadow-black/50 -ml-2 peer-checked:ml-0
          after:w-1/3 after:h-1/3 
          after:border-text after:hover:border-secondary
          after:border-b-2 after:border-r-2
          after:-rotate-45 peer-checked:after:rotate-[135deg]
          after:translate-x-[90%] after:transition-transform' 
      />
    </>
  )
}

export default function Sidebar({noteDetails}: Props) {
  return (
    <aside className='z-[1] absolute top-0 left-0 h-full flex-none
      bg-primary/50 backdrop-blur shadow-r dark:shadow-black/50 md:relative w-auto'>
      <Toggle/>
      <nav className='h-full w-0 md:min-w-max bg-primary/0
        peer-checked:w-max transition-transform overflow-y-scroll'
      >
        {Object.entries(noteDetails).map(([subject, notes]) => (
          <div key={`div.${subject}`}>
            <label htmlFor={subject} key={`label.${subject}`}
              className='block pl-3 pr-2 text-text text-xl font-bold cursor-pointer 
                border-b border-shadow hover:border-secondary
                transition-colors duration-300 ease-out'
            >
              {titleCase(subject)}
            </label>
            <input key={`input.${subject}`} id={subject} type='checkbox' className='peer hidden'/>
            <ul key={`ul.${subject}`}
              className='list-none h-0 overflow-y-clip pr-[calc(0.5rem+4px)]
              peer-checked:h-auto' 
            >
              {notes.map(note => (
                <li key={`li.${note.slug}`} className='list-none pl-2 overflow-y-clip
                  hover:border-l-4 hover:border-secondary hover:w-[calc(100%-4px)]
                  transition duration-300 ease-out'
                >
                  <Link href={`/notes/${subject}/${note.slug}`} key={`a.${note.slug}`}
                    className='text-text whitespace-nowrap'
                  >
                    {note.title}
                  </Link>
                </li>
              ))
              }
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}