import { useEffect } from "react"

async function copyCode(block: HTMLPreElement, button: HTMLButtonElement) {
  const code = block.querySelector("code")
  if (!code) return
  const text = code.innerText

  await navigator.clipboard.writeText(text)

  button.innerText = "Copied"

  setTimeout(() => {
    button.innerText = "Copy"
  }, 1000)
}

export default function useCopyCode() {
  useEffect(() => {
    if (!navigator.clipboard) return

    const blocks = document.querySelectorAll("pre")

    for (const block of blocks) {
      const button = document.createElement("button")
      button.innerText = "Copy"
      block.appendChild(button)
      button.addEventListener("click", async () => {
        await copyCode(block, button)
      })
    }
  }, [])
}
