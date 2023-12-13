import dynamic from 'next/dynamic'

const PeriodicTable = dynamic(() => import('components/PeriodicTable'), {
  ssr: true}
)

export default function Page() {
  return <PeriodicTable/>
}