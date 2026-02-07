# Todos

- MathBox with floating header and ToC
- Math proofs with headings and option for ToC 
- ToC for theorems with hover preview
- Theorems in Lean/coq

Long-term
- Astro w/bun + elysia/encore
- Math animations with Motion Canvas/Defined Motion
- Sveltex?
- PlotNeuralNet?
- Mermaid.js?

## Structure

Quantum physics
- Quantum mechanics
  - Formulations
    - Hilbert space formulation
    - C* algebra formulation
    - Path integral formulation
    - Phase space formulation
  - Quantum dynamics
- Relativistic quantum mechanics
- Quantum field theory
  - Formulations
- Quantum statistical mechanics

# Tips

## Run Typescript with Node

- Add `"type": "module"` to `package.json`
- Run .ts files with `tsx script.ts` 

## VS Code regex replacements

\$\$((.|\n)*?)\$\$
```math\n$1\n```

</summary>\n(?!\n)

# Vim motions

- `.`: repeat last action
- `<int>` + `<cmd>`: repeat `<cmd>` command by `<int>` number of times
- `Ctrl` + `o`: enter command in insert mode

- `h`: move one character left 
- `j`: move one line down
- `k`: move one line up
- `l`: move one character right

- `w`: jump to start of next word
- `b`: jump to start of previous word
- `e`: jump to end of next word

- `0`: jump to start of current line
- `^`: jump to start of text on current line
- `$`: jump to end of current line
- `%`: jump to matching bracket

- `gg`: jump to start of document
- `G`: jump to end of document
- `M`: jump to middle line of viewport
- `zz`: center viewport at current line

- `f` + `<char>`: jump to next instance of `<char>`
- `F` + `<char>`: jump to previous instance of `<char>`
- `;`: repeat last find command
- `,`: repeat last find command backwards

- `i`: enter insert before cursor
- `a`: enter insert after cursor (append)

- `I`: enter insert before line
- `A`: enter insert after line

- `v`: enter visual mode (selection)
- `R`: enter replace mode

- `yw`: copy selected word (yank)
- `yy`: copy current line
- `yi`: yank in (excluding delimiters)
    - `w`: word
    - `p`: paragraph
    - `f`: function
- `ya`: yank around (including delimiters)
    - `w`: word
    - `p`: paragraph
    - `f`: function

- `dw`: cut selected word
- `dd`: cut current line
- `di`: delete in (excluding delimiters)
    - `w`: word
    - `p`: paragraph
    - `f`: function
- `da`: delete around (including delimiters)
    - `w`: word
    - `p`: paragraph
    - `f`: function

- `p`: paste after cursor
- `P`: paste before cursor
