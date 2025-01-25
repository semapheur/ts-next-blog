import Link from "next/link"
import type { NoteDetails } from "lib/utils/types"

type Props = {
  noteDetails: NoteDetails
}

function titleCase(text: string) {
  return text
    .replace(/_/g, " ") // Replace all underscores with spaces
    .replace(/\w\S*/g, (t) => {
      // Convert to title case
      return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
    })
}

function Toggle() {
  return (
    <>
      <input
        key={"input.sidebar"}
        id="sidebar-toggle"
        type="checkbox"
        className="peer hidden"
      />
      <label
        key={"label.sidebar"}
        htmlFor="sidebar-toggle"
        className="-ml-2 after:-rotate-45 absolute bottom-[10%] left-full z-1 flex h-10 w-10 cursor-pointer items-center rounded-r-full bg-primary/50 shadow-trb backdrop-blur-xs after:h-1/3 after:w-1/3 after:translate-x-[90%] after:border-text after:border-r-2 after:border-b-2 after:transition-transform hover:after:border-secondary peer-checked:ml-0 peer-checked:after:rotate-[135deg] md:hidden dark:shadow-black/50"
      />
    </>
  )
}

export default function Sidebar({ noteDetails }: Props) {
  return (
    <aside className="absolute top-0 left-0 z-1 h-full w-auto flex-none bg-primary/50 shadow-r backdrop-blur-sm md:relative dark:shadow-black/50">
      <Toggle />
      <nav className="h-full w-0 overflow-y-scroll bg-primary/0 transition-transform peer-checked:w-max md:min-w-max">
        {Object.entries(noteDetails).map(([subject, notes]) => (
          <div key={`div.${subject}`}>
            <label
              htmlFor={subject}
              key={`label.${subject}`}
              className="block cursor-pointer border-shadow border-b pr-2 pl-3 font-bold text-text text-xl transition-colors duration-300 ease-out hover:border-secondary"
            >
              {titleCase(subject)}
            </label>
            <input
              key={`input.${subject}`}
              id={subject}
              type="checkbox"
              className="peer hidden"
            />
            <ul
              key={`ul.${subject}`}
              className="h-0 list-none overflow-y-clip pr-[calc(0.5rem+4px)] peer-checked:h-auto"
            >
              {notes.map((note) => (
                <li
                  key={`li.${note.slug}`}
                  className="list-none overflow-y-clip pl-2 transition duration-300 ease-out hover:w-[calc(100%-4px)] hover:border-secondary hover:border-l-4"
                >
                  <Link
                    href={`/notes/${subject}/${note.slug}`}
                    key={`a.${note.slug}`}
                    className="whitespace-nowrap text-text"
                  >
                    {note.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
