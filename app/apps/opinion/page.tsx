import dynamic from 'next/dynamic'

const Ternary = dynamic(() => import('components/TernaryPlot'), {
  ssr: false}
)

export default function page() {
  return (
    <Ternary/>
  )
}