import dynamic from 'next/dynamic'

const Opinion = dynamic(() => import('components/OpinionPlot'), {
  ssr: false}
)

export default function page() {
  return (
    <Opinion/>
  )
}