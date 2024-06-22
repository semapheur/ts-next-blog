import dynamic from 'next/dynamic'
import {Metadata} from 'next'

export const metadata: Metadata = {
  title: 'Special relativity',
  description: 'A WebGL-based special relativity visualization.'
}

const PeriodicTable = dynamic(() => import('components/PeriodicTable'), {
  ssr: true}
)

export default function Page() {
  return <PeriodicTable/>
}