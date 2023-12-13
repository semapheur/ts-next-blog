import dynamic from 'next/dynamic'

const DomainColoring = dynamic(() => import('components/DomainColoring'), {
  ssr: false}
)

export default function Page() {
  return <DomainColoring/>
}