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
