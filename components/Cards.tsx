'use client'

import useEventListener from 'hooks/useEventListener'
import useForwardRef from 'hooks/useForwardRef'
import { forwardRef, ReactNode, useRef } from 'react'

type CardsProps = {
  children: ReactNode[]
}

type CardProps = {
  children: ReactNode
}

const THRESHOLD = 15;

const Card = forwardRef<HTMLDivElement, CardProps>(function Card({children}, ref) {

  const cardRef = useForwardRef<HTMLDivElement>(ref)

  const handleTilt = (e: MouseEvent) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    
    const horizontal = (e.clientX - cardRef.current.offsetLeft) / rect.width
    const vertical = (e.clientY - cardRef.current.offsetTop) / rect.height

    const rotateX = (THRESHOLD / 2 - horizontal * THRESHOLD).toFixed(2)
    const rotateY = (vertical * THRESHOLD - THRESHOLD / 2).toFixed(2)

    cardRef.current.style.transform = `perspective(${rect.width}px) rotateX(${rotateY}deg) rotateY(${rotateX}deg) scale3d(1,1,1)`
  }
  const resetTilt = () => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    cardRef.current.style.transform = `perspective(${rect.width}px) rotateX(0deg) rotateY(0deg)`
  }

  useEventListener('mousemove', handleTilt, cardRef)
  useEventListener('mouseleave', resetTilt, cardRef)

  return (
    <div ref={cardRef}
      className='relative grid place-items-center w-[20rem] h-[15rem] 
        rounded-md shadow dark:shadow-black/40 bg-primary
        group-hover:bg-[radial-gradient(100rem_circle_at_var(--xPos)_var(--yPos),rgb(var(--color-secondary)/0.4),transparent_15%)]
        before:content-[""] before:bg-inherit before:h-[calc(100%-2px)] before:w-[calc(100%-2px)]
        before:absolute before:top-[50%] before:left-[50%]
        before:translate-x-[-50%] before:translate-y-[-50%] before:rounded-md
        after:content-[""] after:h-full after:w-full
        after:absolute after:top-0 after:left-0
        after:bg-[radial-gradient(50rem_circle_at_var(--xPos)_var(--yPos),rgb(var(--color-secondary)/0.1),transparent_15%)]
        after:rounded-md after:opacity-0 after:transition-opacity
        hover:after:opacity-100'
    >
      {children}
    </div>
  )
})

export default function Cards({children}: CardsProps) {
  const deckRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<HTMLDivElement[]>([])

  const onMouseMove = (e: MouseEvent) => {
    if (!deckRef.current || !cardRefs.current) return

    for (const card of cardRefs.current) {
      if (!card) return
      
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      card.style.setProperty('--xPos', `${x}px`)
      card.style.setProperty('--yPos', `${y}px`)
    }
  }

  useEventListener('mousemove', onMouseMove, deckRef)

  return (
    <div ref={deckRef}
      className='group h-full flex flex-wrap overflow-y-scroll justify-center items-center gap-4 p-4
        bg-primary'
    >
      {children.map((node, i) => 
        <Card key={`card.${i}`} ref={(el: HTMLDivElement) => {cardRefs.current.push(el)}}>
          {node}
        </Card>
      )}
    </div>
  )
}
