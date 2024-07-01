import dynamic from 'next/dynamic'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Special relativity',
  description: 'A WebGL-based special relativity visualization.',
}

const SpecialRelativity = dynamic(
  () => import('lib/components/SpecialRelativity'),
  {
    ssr: true,
  },
)

export default function Page() {
  return <SpecialRelativity />
}
