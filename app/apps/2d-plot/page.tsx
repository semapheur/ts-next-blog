import dynamic from 'next/dynamic'

const Plot = dynamic(() => import('components/InteractivePlot'), {
  ssr: false}
)

export default function page() {
  return (
    <Plot/>
  )
}