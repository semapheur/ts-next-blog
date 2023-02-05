'use client'

import p5Type from 'p5'
import p5 from 'p5'
import { useEffect, useRef } from 'react';

let cols = 600, rows = 30;

let t_D = 180*15 / cols;
let r_D = 1 / rows;

function roseGeometry(p5: p5Type) {
  p5.setup = () => {
    p5.createCanvas(800, 800, p5.WEBGL)
    p5.colorMode(p5.HSB)
    p5.angleMode(p5.DEGREES)
    //p5.stroke(205, 50, 100)
    //p5.strokeWeight(4)
    p5.noStroke()
  }

  //p5.windowResized = () => {
  //  p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  //  p5.drawBackground();
  //  p5.setupPosition();
  //};

  p5.draw = () => {
    p5.background(230, 50, 15)
    p5.orbitControl(4, 4)

    const v = [];
    //const v = Array<Array<p5Type.Vector>>(rows).fill(
    //  Array<p5Type.Vector>(cols).fill(p5.createVector(0,0,0)));

    for (let r = 0; r < rows; r++) {
      v.push([])
      for (let theta = 0; theta < cols; theta += 3) {
        
        let phi = (180 / 2) * p5.exp(-theta * t_D/(8 * 180))
        let petalCut = 1 - (1/2) * p5.pow((5/4) * p5.pow(1 - ((3.6 * theta * t_D % 360) / 180), 2) - 1/4, 2);
        let hangDown = 2 * p5.pow(r * r_D, 2) * p5.pow(1.3 * r * r_D - 1, 2) * p5.sin(phi)
        
        let pX = 250 * petalCut * (r * r_D * p5.sin(phi) + hangDown * p5.cos(phi)) * p5.sin(theta * t_D)
        let pY = -250 * petalCut * (r * r_D * p5.cos(phi) - hangDown * p5.sin(phi))
        let pZ = 250 * petalCut * (r * r_D * p5.sin(phi) + hangDown * p5.cos(phi)) * p5.cos(theta * t_D)
        let pos = p5.createVector(pX, pY, pZ) //p5.vertex(pX, pY, pZ)
        v[r].push(pos)
        //v[r][theta] = pos
      }

      for (let r = 0; r < v.length; r++) {
        p5.fill(340, 100, -20 + r * r_D * 120)
        for (let theta = 0; theta < v[r].length; theta++) {
          if (r < v.length - 1 && theta < v[r].length - 1) {
            p5.beginShape(p5.QUADS)
            p5.vertex(v[r][theta].x, v[r][theta].y, v[r][theta].z)
            p5.vertex(v[r+1][theta].x, v[r+1][theta].y, v[r+1][theta].z)
            p5.vertex(v[r+1][theta+1].x, v[r+1][theta+1].y, v[r+1][theta+1].z)
            p5.vertex(v[r][theta+1].x, v[r][theta+1].y, v[r][theta+1].z)
            p5.endShape(p5.CLOSE)
          }
        }
      }
    }
  }
}

export default function Rose() {
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (divRef.current && typeof window !== 'undefined') {
      const p = new p5(roseGeometry, divRef.current)

      return () => {
        p.remove();
      }
    }    
  }, [])

  return (
    <div ref={divRef}/>
  )

}