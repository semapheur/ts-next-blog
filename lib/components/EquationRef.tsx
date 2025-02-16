import { useState, useEffect, useCallback, type ReactNode } from "react"

type Props = {
  children?: ReactNode
  reference: string
}

export default function EquationRef({ children, reference }: Props) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [equation, setEquation] = useState<string | null>(null)
  const [refNumber, setRefNumber] = useState<string | null>(null)
  const [isEquationVisible, setIsEquationVisible] = useState(true)
  const [tooltipPosition, setTooltipPosition] = useState("bottom-full")

  // Find the nearest katex-display ancestor
  const findKaTeXDisplay = (element: Element | null) => {
    let current = element
    while (current && !current.classList.contains("katex-display")) {
      current = current.parentElement
    }
    return current
  }

  // Get equation content and reference number on mount
  useEffect(() => {
    const refSpan = document.getElementById(reference)
    if (refSpan) {
      // Get the reference number (text content of the enclosing span)
      const refText = refSpan.textContent!.trim()
      setRefNumber(refText)

      // Find and get the KaTeX display content
      const katexDisplay = findKaTeXDisplay(refSpan)
      if (katexDisplay) {
        setEquation(katexDisplay.outerHTML)
      }
    }
  }, [reference])

  // Check if referenced equation is in viewport
  const checkEquationVisibility = useCallback(() => {
    const refSpan = document.getElementById(reference)
    if (refSpan) {
      const katexDisplay = findKaTeXDisplay(refSpan)
      if (katexDisplay) {
        const rect = katexDisplay.getBoundingClientRect()
        const isVisible =
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth
        setIsEquationVisible(isVisible)
      }
    }
  }, [reference])

  // Add scroll listener to check equation visibility
  useEffect(() => {
    window.addEventListener("scroll", checkEquationVisibility)
    return () => window.removeEventListener("scroll", checkEquationVisibility)
  }, [checkEquationVisibility])

  const handleMouseEnter = (e) => {
    checkEquationVisibility()
    if (!isEquationVisible && equation) {
      const rect = e.currentTarget.getBoundingClientRect()
      setTooltipPosition(rect.top > 300 ? "bottom-full" : "top-full")
      setShowTooltip(true)
    }
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
  }

  return (
    <div className="relative inline-block">
      <a
        href={`#${reference}`}
        className="text-blue-600 hover:text-blue-800"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children || (refNumber && `(${refNumber})`)}
      </a>
      {showTooltip && equation && (
        <div
          className={`absolute ${tooltipPosition} -translate-x-1/2 left-1/2 z-50 mt-2 mb-2 max-w-lg transform rounded-lg border border-gray-200 bg-white p-4 shadow-lg`}
        >
          <div dangerouslySetInnerHTML={{ __html: equation }} />
        </div>
      )}
    </div>
  )
}
