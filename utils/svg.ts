import Vector from 'utils/vector'

export function setAttributes(element: Element, attributes: {[key: string]: string}) {
  for (let k of Object.keys(attributes)) {
    element.setAttribute(k, attributes[k])
  }    
}

export function addChildElement(
  parent: Element | string, 
  tagName: string, 
  attributes: {[key:string]: string}
) { 
    if (typeof parent === 'string') {
      const parentEl = document.getElementById(parent) ?? undefined
      if (!parentEl) return
      parent = parentEl
    }
    const element = document.createElementNS('http://www.w3.org/2000/svg', tagName)
    setAttributes(element, attributes)
    parent.appendChild(element)
  }

export function removeElementsByClass(baseElement: Element, className: string) {
  const elements = baseElement.getElementsByClassName(className)
  while (elements.length > 0) {
    elements[0].parentNode?.removeChild(elements[0])
  }
}

export function svgPath(points: Vector[], loop=false, shift?: Vector): string {
  
  let d = ''
  for (let i in points) {
    if (shift) {
      points[i] = points[i].add(shift)
    }

    d += 'L' + points[i].print()
  }
  if (loop) { d+= 'z'}
  
  return d.replace('L', 'M')
}

export function svgCatmullRom(points: Vector[], tension=1, loop=false, close=''): string 
{ 
  const copy = [...points];

  const first = copy[0];
  const last = copy[copy.length - 1];
  
  if (loop) {
    const second = copy[1];
    const secondLast = copy[copy.length - 2];

    copy.unshift(last);
    copy.unshift(secondLast);

    copy.push(first);
    copy.push(second);
  } else {
    copy.push(last)
    copy.unshift(first)
  }

  let d = 'M' + copy[0].print()

  for (let i = 0; i + 3 < copy.length; i++) {
    const p0 = copy[i];
    const p1 = copy[i+1];
    const p2 = copy[i+2];
    const p3 = copy[i+3];

    const cp1 = p1.add(p2.subtract(p0).scale(1/6).scale(tension))
    const cp2 = p2.subtract(p3.subtract(p1).scale(1/6).scale(tension))

    d += `C${cp1.print()},${cp2.print()},${p2.print()}`
  }
  if (loop) d+= 'Z'

  return d
}