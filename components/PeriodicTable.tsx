'use client'

import { useState, MouseEvent } from 'react'
import {block, For} from 'million/react'

import data from 'content/data/elements.json'

type Element = typeof data[0]

type ElementProps = {
  element: Element|undefined
}

const ElementBlock = function Element({element}: ElementProps) {

  if (!element) return <></>

  return (<>
    <h1 className='m-auto text-[5cqw] text-text col-span-4'>
      {`${element.number} - ${element.name} `}
      <small>{`(${element.group_block})`}</small>
    </h1>
    <section className='text-text text-center'>
      <h2 className='text-[3cqw]'>Atomic mass <abbr>(u)</abbr></h2>
      <strong className='text-[5cqw]'>{element.atomic_mass?.toFixed(3)}</strong>
    </section>
    <section className='text-text text-center'>
      <h2 className='text-[3cqw]'>Density <abbr>(g/cm³)</abbr></h2>
      <strong className='text-[5cqw]'>{element.density?.toFixed(3)}</strong>
    </section>
    <section className='text-text text-center'>
      <h2 className='text-[3cqw]'>Phase</h2>
      <strong className='text-[5cqw]'>{element.phase}</strong>
    </section>
    <section className='text-text text-center'>
      <h2 className='text-[3cqw]'>Year of discovery</h2>
      <strong className='text-[5cqw]'>{element.year_discovered}</strong>
    </section>
  </>)
}

const PeriodicTableBlock = block(function PeriodicTable() {
  const [selElement, setElement] = useState<Element>()

  function handleHover(event: MouseEvent<HTMLDivElement> & {
    target: HTMLDivElement
  })
  {
    const {target} = event
    if (!target) return

    if (target.id.includes('-')) return
    const number = parseInt(target.id)
    if (typeof number !== 'number') return

    setElement(data[number-1])
  }

  return (<div className='h-full grid gap-1
    grid-cols-[repeat(18,minmax(0,1fr))] 
    grid-rows-[repeat(10,minmax(0,1fr))]'
  > 
    <div className='@container row-span-3 col-start-3 col-span-10 grid grid-rows-2 grid-cols-4'>
      <ElementBlock element={selElement}/>
    </div>
    <For each={data} as='div' memo>{element => 
      <div key={element.name}
        id={element.number.toString()}
        className='@container relative grid rounded-sm hover:border border-text'
        onMouseEnter={handleHover} onFocus={() => {}}
        style={{
          gridColumn: element.xpos,
          gridRow: element.ypos,
          backgroundColor: `rgb(var(--color-${element.group_block?.replaceAll(' ', '-')}))`
      }}>
        <span className='absolute top-0 left-1 text-text text-[15cqw] font-bold'>
          {element.number}
        </span>
        <span className='m-auto text-text text-[30cqw]'>
          {element.symbol}
        </span>
        <span className='absolute bottom-1 left-1/2 -translate-x-1/2 text-text text-[15cqw]'>
          {element.name}
        </span>
        
      </div>
    }
    </For>
  </div>)
})
export default PeriodicTableBlock
