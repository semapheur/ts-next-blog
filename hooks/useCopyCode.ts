import { useEffect } from "react";

async function copyCode(block: HTMLPreElement, button: HTMLButtonElement) {
  let code = block.querySelector('code');
  if (!code) return
  let text = code.innerText;

  await navigator.clipboard.writeText(text);

  button.innerText = 'Copied'

  setTimeout(() => {
    button.innerText = 'Copy'
  }, 1000);
}

export default function useCopyCode() {

  if (!navigator.clipboard) return null;

  useEffect(() => {
    let blocks = document.querySelectorAll('pre');

    for (let block of blocks) {
      let button = document.createElement('button');
      button.innerText = 'Copy'
      block.appendChild(button);
      button.addEventListener('click', async () => {
        await copyCode(block, button)
      })
    }
  }, [])
}