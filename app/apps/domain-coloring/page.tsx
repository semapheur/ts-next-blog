import dynamic from 'next/dynamic'
import type {Metadata} from 'next'

export const metadata: Metadata = {
  title: 'Domain coloring',
  description: 'A WebGL-based domain coloring visualization of complex functions.'
}

const DomainColoring = dynamic(() => import('lib/components/DomainColoring'), {
  ssr: false}
)

export default function Page() {
  return <DomainColoring/>
}