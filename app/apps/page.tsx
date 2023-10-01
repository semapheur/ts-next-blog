import AppCard from 'components/AppCard'
import dynamic from 'next/dynamic'

const Cards = dynamic(() => import('components/Cards'), {
  ssr: false}
)

const content = [
  {
    title: '2D plotter',
    description: 'An SVG-based plotting app running on math.js',
    slug: 'apps/plot'
  },
  {
    title: 'Opinion plot',
    description: 'An SVG-based visualization of binomial opinions in terms of belief, disbelief, uncertainty and base rate',
    slug: 'apps/opinion'
  }
]

export default function page() {
  return (
    <Cards>
      {content.map((card, i) => 
        <AppCard key={'app.' + i} content={card} />
      )}
    </Cards>
  )
}
