import dynamic from 'next/dynamic'

const Plot = dynamic(() => import('components/InteractivePlot'), {
  ssr: false}
)

export default function Page() {
  return <Plot/>
}
