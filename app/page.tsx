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
    <main className='absolute top-0 h-screen w-screen perspective-[1px] perspective-origin-[bottom_left]
      overflow-y-auto overflow-x-hidden scroll-smooth'
    >
      <Landscape/>
      <Morph/>
      <Wave/>
    </main>
  )
}
