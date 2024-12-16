import Loader from "lib/components/Loader"
import dynamic from "next/dynamic"

const Search = dynamic(() => import("./SearchNotes"), {
  loading: () => (
    <div className="flex h-full justify-center">
      <Loader width="10%" />
    </div>
  ),
})

export default function NotesPage() {
  return (
    <main className="h-full w-full grid-cols-2 divide-x bg-primary shadow-inner-l lg:grid dark:shadow-black/50">
      <Search />
    </main>
  )
}
