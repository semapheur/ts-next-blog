import dynamic from "next/dynamic"
import Loader from "lib/components/Loader"

const Landscape = dynamic(() => import("lib/components/Landscape"), {
  loading: () => (
    <div className="flex h-full justify-center">
      <Loader width="10%" />
    </div>
  ),
})
const Greet = dynamic(() => import("lib/components/Greeting"))
const Wave = dynamic(() => import("lib/components/WaveFooter"))

export default function Home() {
  return (
    <main className="perspective-[1px] perspective-origin-[bottom_left] absolute top-0 h-screen w-screen overflow-y-auto overflow-x-hidden scroll-smooth">
      <Landscape />
      <Greet />
      <Wave />
    </main>
  )
}
