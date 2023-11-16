import { useRef } from 'react'
import useMousePosition from 'hooks/useMousePosition'

type AxisProps = {
  center: number[],

}

type State = {
  position: number[]
  mouseDown: boolean
}

type DomainColoringProps = {
  state: State
}

export default function DomainColoring(props: DomainColoringProps) {
  const glRef = useRef<HTMLCanvasElement>(null)

  const mousePosition = useMousePosition(glRef)

  function handleZoom(wheelEvent: WheelEvent) {
    const {position} = props.state
    
    if (!position.every(isFinite)) {return}

    const [x, y, ]

    const [mousePlotX, mouse]
  }

  return (
    <div className='relative w-full h-full'>
      <canvas ref={axisRef} className='absolute inset-0 w-full h-full'/>
      <canvas ref={glRef} className='absolute inset-0 w-full h-full'/>
    </div>
  )
}