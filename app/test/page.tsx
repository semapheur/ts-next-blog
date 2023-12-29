import dynamic from 'next/dynamic'

const Bohr = dynamic(() => import('components/BohrAtom'), {
  ssr: false}
)

const shells = [
  2,
  8,
  18,
  32,
  32,
  18,
  8
]

export default function Page() {
  return <Bohr symbol='H' shells={shells}/>
}
