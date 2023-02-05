import dynamic from 'next/dynamic'

const Plot = dynamic(() => import('components/Plot'), {
  ssr: false}
)

export default function page() {
  return (
    <Plot/>
  )
}
