## Run Typescript with Node

- Add `"type": "module"` to `package.json`
- Run .ts files with `tsx script.ts` 

## VS Code regex replacements

\$\$((.|\n)*?)\$\$
```math\n$1\n```

</summary>\n(?!\n)

## Ganja.js

```javascript
(()=>{
  // Vertices
  const p = [
      ...Array(Element.Pow(2,dim))
  ].map({
      "Hypercube.useEffect.p": (_, i)=>i.toString(2).padStart(dim, "0")
  }["Hypercube.useEffect.p"]).map({
      "Hypercube.useEffect.p": (x)=>x.split("").map({
              "Hypercube.useEffect.p": (x)=>Element.Sub(Number.parseFloat(x),0.5)
          }["Hypercube.useEffect.p"])
  }["Hypercube.useEffect.p"]).map({
      "Hypercube.useEffect.p": (x)=>Element.Dual((Element.Add(Element.Coeff(1,1),Element.Mul(x,[
              Element.Coeff(2,1),
              Element.Coeff(3,1),
              Element.Coeff(4,1),
              Element.Coeff(5,1)
          ]))))
  }["Hypercube.useEffect.p"]); // Disable biome.js to preserve 1e0
  //this.Dual(this.Mul(this.Add(1e0, x), [1e1, 1e2, 1e3, 1e4]))
  // Edges
  const e = p.flatMap({
      "Hypercube.useEffect.e": (a, i)=>p.map({
              "Hypercube.useEffect.e": (b, j)=>Element.lte(i,j) || Element.Vee((Element.Wedge(i,j)),(Element.Sub(Element.Wedge(i,j),1))) ? 0 : [
                      a,
                      b
                  ]
          }["Hypercube.useEffect.e"])
  }["Hypercube.useEffect.e"]);
  // State
  let state = [
      Element.Pow(Math.E,Element.Coeff(10,0.1)),
      Element.Add(Element.Add(Element.Coeff(10,1),Element.Coeff(11,1.3)),Element.Coeff(14,0.5))
  ];
  // Derivative
  const dS = {
      "Hypercube.useEffect.dS": (param)=>{
          let [M, B] = param;
          return [
              Element.Mul(Element.Mul(Element.Sub(0.5),M),B),
              Element.Mul(Element.Sub(0.5),(Element.Sub(Element.Mul(B.Dual,B),Element.Mul(B,B.Dual))).UnDual)
          ];
      }
  }["Hypercube.useEffect.dS"];
  // Render
  const svg = this.graph({
      "Hypercube.useEffect.svg": ()=>{
          for(let i = 0; Element.lt(i,10); ++i){
              // @ts-ignore
              state = Element.Add(state,Element.Mul(animationSpeed,dS(state)));
          }
          // @ts-ignore
          return [
              0xffffff,
              ...Element.sw(state[0],e)
          ];
      }
  }["Hypercube.useEffect.svg"], {
      lineWidth: 10,
      animate: 1,
      scale: 2
  });
  Object.assign(svg.style, {
      background: "none",
      width: "100%",
      height: "100%"
  });
  wrapper.appendChild(svg);
})
```