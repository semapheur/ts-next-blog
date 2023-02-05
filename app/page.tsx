import dynamic from 'next/dynamic'
import Loader from 'components/Loader'

const Landscape = dynamic(() => import('components/Landscape'), {
  ssr: false,
  loading: () => <div className='h-full flex justify-center'><Loader width='10%'/></div>
})
const Morph = dynamic(() => import('components/MorphTitle'), {
  ssr: false,
})
const Wave = dynamic(() => import('components/WaveFooter'), {
  ssr: false,
})

export default function Home() {
  return (
    <main className='absolute top-0 h-screen w-full perspective-[1px] overflow-y-scroll'>
      <Landscape/>
      <Morph/>
      <Wave/>
    </main>
  )
}
