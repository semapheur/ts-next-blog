import {promises as fs} from 'fs'
import path from 'path'

export default async function PeriodicTable() {
  const filePath = path.join(process.cwd(), 'content', 'data', 'elements.json')
  const file = await fs.readFile(filePath, 'utf8')
  const data = JSON.parse(file)
  
  return (<div className='h-full grid 
    grid-cols-[repeat(18,minmax(0,1fr))] 
    grid-rows-[repeat(10,minmax(0,1fr))]'
  >
    {data.map(element => <div key={element.name} 
      className='relative grid' 
      style={{
        gridColumn: element.xpos,
        gridRow: element.ypos,
        backgroundColor: `rgb(var(--color-${element.group_block?.replaceAll(' ', '-')}))`
    }}>
        <span className='absolute top-0 left-1 text-text text-sm'>
          {element.number}
        </span>
        <span className='m-auto text-text text-2xl'>
          {element.symbol}
        </span>
        <span className='absolute bottom-1 left-1/2 -translate-x-1/2 text-text text-xs'>
          {element.name}
        </span>
        
      </div>)}
  </div>)
}

/*

<div key={element.name} className='h-full' style={{
        gridColumn: element.xpos,
        gridRow: element.ypos
      }}>
        <p>{element.symbol}</p>
      </div>
    })}
*/