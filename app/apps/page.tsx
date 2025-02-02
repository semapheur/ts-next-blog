import dynamic from "next/dynamic"

import AppCard from "lib/components/AppCard"

const Cards = dynamic(() => import("lib/components/Cards"))

const content = [
  {
    title: "2D plotter",
    description: "An SVG-based plotting app running on math.js",
    slug: "apps/2d-plot",
  },
  {
    title: "Domain coloring",
    description:
      "A WebGL-based domain coloring visualization of complex functions",
    slug: "apps/domain-coloring",
  },
  {
    title: "Opinion plot",
    description:
      "An SVG-based visualization of binomial opinions in terms of belief, disbelief, uncertainty and base rate",
    slug: "apps/opinion-plot",
  },
  {
    title: "Bloch sphere",
    description: "Bloch sphere visualization of qubit logic",
    slug: "apps/bloch-sphere",
  },
  {
    title: "Periodic table",
    description: "Periodic table of elements",
    slug: "apps/periodic-table",
  },
]

export default function Page() {
  return (
    <Cards>
      {content.map((card, i) => (
        <AppCard key={`app.${i}`} content={card} />
      ))}
    </Cards>
  )
}
