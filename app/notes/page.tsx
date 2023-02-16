import Loader from 'components/Loader';
import dynamic from 'next/dynamic'

const Search = dynamic(() => import('./SearchNotes'), {
  ssr: false,
  loading: () => <div className='h-full flex justify-center'><Loader width='10%' /></div>
})

export default function NotesPage() {
  return (
    <main className='lg:grid grid-cols-2 h-full w-full bg-primary divide-x shadow-inner-l dark:shadow-black/50'>
      <Search/>
    </main>
  )
}