import dynamic from 'next/dynamic'

const Ternary = dynamic(() => import('components/Ternary'), {
  ssr: false}
)

export default function page() {
  return (
    <Ternary/>
  )
}