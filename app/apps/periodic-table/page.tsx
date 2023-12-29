import dynamic from 'next/dynamic'
import {Metadata} from 'next'

export const metadata: Metadata = {
  title: 'Periodic table',
  description: 'A periodic table app built on React.'
}

const PeriodicTable = dynamic(() => import('components/PeriodicTable'), {
  ssr: true}
)

export default function Page() {
  return <PeriodicTable/>
}