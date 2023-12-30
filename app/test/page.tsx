import dynamic from 'next/dynamic'

const Plot = dynamic(() => import('components/SpectralLines'), {
  ssr: false}
)

const balmer = [410, 434, 486, 656]

export default function Page() {
  return (<div className='h-full grid'>
    <Plot className='m-auto' wavelengths={balmer} width='50%' height='50px' preserveAspectRatio='none'/>
  </div>)
}