import dynamic from 'next/dynamic'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subjective opinion plot',
  description:
    'An SVG-based visualization of binomial subjective opinion in terms of belief, disbelief, uncertainty and base rate',
}

const Opinion = dynamic(() => import('lib/components/OpinionPlot'), {
  ssr: false,
})

export default function Page() {
  return <Opinion />
}
