import dynamic from 'next/dynamic'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Periodic table',
  description: 'A periodic table app built with React.',
}

const PeriodicTable = dynamic(() => import('lib/components/PeriodicTable'))

export default function Page() {
  return <PeriodicTable />
}
