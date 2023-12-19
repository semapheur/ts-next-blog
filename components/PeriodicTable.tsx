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
    {data.map(element => <div key={element.name} style={{
      gridColumn: element.xpos,
      gridRow: element.ypos
    }}>
        {element.symbol}
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