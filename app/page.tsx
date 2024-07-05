import dynamic from 'next/dynamic'
import Loader from 'lib/components/Loader'

const Landscape = dynamic(() => import('lib/components/Landscape'), {
  ssr: false,
  loading: () => (
    <div className='h-full flex justify-center'>
      <Loader width='10%' />
    </div>
  ),
})
const Greet = dynamic(() => import('lib/components/Greeting'), {
  ssr: false,
})
const Wave = dynamic(() => import('lib/components/WaveFooter'), {
  ssr: false,
})

export default function Home() {
  return (
    <main
      className='absolute top-0 h-screen w-screen perspective-[1px] perspective-origin-[bottom_left]
      overflow-y-auto overflow-x-hidden scroll-smooth'
    >
      <Landscape />
      <Greet />
      <Wave />
    </main>
  )
}
