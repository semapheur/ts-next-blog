import dynamic from 'next/dynamic'
import {Metadata} from 'next'

export const metadata: Metadata = {
  title: '2D plot',
  description: 'An SVG-based plotting app for real-valued functions'
}

const Plot = dynamic(() => import('components/InteractivePlot'), {
  ssr: false}
)

export default function Page() {
  return <Plot/>
}
