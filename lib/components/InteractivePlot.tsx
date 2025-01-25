"use client"

import {
  type ChangeEvent,
  createContext,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { parse as mathParse } from "mathjs"

import useResizeObserver from "lib/hooks/useResizeObserver"
import { InteractiveSVGPlot } from "lib/components/InteractiveSvgPlot"
import Split from "./Split"
import { CrossIcon } from "lib/utils/icons"
import Tex from "./Tex"

type PlotState = {
  plots: Map<number, Partial<PlotFields>>
  setPlots: Dispatch<SetStateAction<Map<number, Partial<PlotFields>>>>
}

const PlotContext = createContext<PlotState | undefined>(undefined)

function usePlotContext() {
  const context = useContext(PlotContext)
  if (!context) {
    throw new Error("usePlotContext must be used within a Plot Component")
  }
  return context
}

const formValues: PlotFields = {
  fn: "",
  tex: {
    value: "\\textrm{Input...}",
    style: `text-text/50 peer-focus:text-text peer-focus:before:content-["|"] before:inline-block 
    before:text-text before:animate-blink`,
  },
  color: "",
}

type PlotFields = {
  fn: string
  tex: {
    value: string
    style: string
  }
  color: string
}

type PlotInputProps = {
  index: number
  values: PlotFields
  handleAddPlot: (i: number, e: FormEvent<HTMLFormElement>) => void
  handleChangeFn: (i: number, e: ChangeEvent<HTMLInputElement>) => void
  handleChangeColor: (i: number, e: ChangeEvent<HTMLInputElement>) => void
  handleDelPlot: (i: number, e: React.MouseEvent<HTMLButtonElement>) => void
}

function PlotInput({
  index,
  values,
  handleAddPlot,
  handleChangeFn,
  handleChangeColor,
  handleDelPlot,
}: PlotInputProps) {
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!formRef.current) return

    if (!validateFunction(values.fn)) {
      formRef.current.classList.add("bg-red-100.dark:bg-red-400")
    } else {
      formRef.current.classList.remove("bg-red-100.dark:bg-red-400")
    }
  }, [values])

  return (
    <form
      ref={formRef}
      action=""
      onSubmit={(e) => handleAddPlot(index, e)}
      className="relative h-12 flex border-b border-text/30 focus-within:border-secondary overflow-y-scroll"
    >
      <label className="w-10 relative border-r border-text/50 overflow-hidden">
        <svg className="h-full w-full">
          <title>Change color</title>
          <circle cx="50%" cy="50%" r="20%" fill={values.color} />
        </svg>
        <input
          type="color"
          name="color"
          value={values.color}
          onChange={(e) => handleChangeColor(index, e)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </label>
      <input
        type="text"
        name="fn"
        value={values.fn}
        onChange={(e) => handleChangeFn(index, e)}
        className="peer w-[calc(100%-5rem)] pl-2 focus:outline-hidden
          bg-transparent text-transparent z-1"
      />
      <Tex
        math={values.tex.value}
        errorColor={"red"}
        className={`${values.tex.style} w-[calc(100%-5rem)] absolute left-10 top-2 px-2`}
      />
      <button
        type="button"
        onClick={(e) => handleDelPlot(index, e)}
        className="w-10"
      >
        <CrossIcon className="w-[80%] stroke-text/50 hover:stroke-red-500" />
      </button>
    </form>
  )
}

function Panel() {
  const [plotForms, setPlotForms] = useState<PlotFields[]>([
    { ...formValues, color: randomColor() },
  ])
  const { plots, setPlots } = usePlotContext()

  const addPlot = (i: number, e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newPlot = plotForms[i]
    const newPlots = new Map(plots)
    if (validateFunction(newPlot.fn)) {
      newPlots.set(i, newPlot)
      setPlots(newPlots)
    }

    if (i === plotForms.length - 1) {
      const plotForm = { ...formValues, color: randomColor() }
      setPlotForms([...plotForms, plotForm])
    }
  }

  const delPlot = (i: number, e: React.MouseEvent) => {
    e.preventDefault()

    if (plots.has(i)) {
      const newPlots = new Map(plots)
      newPlots.delete(i)
      reorderMap(i, newPlots)
      setPlots(newPlots)
    }

    if (plotForms.length > 1) {
      const newPlotForms = [...plotForms]
      newPlotForms.splice(i, 1)
      setPlotForms(newPlotForms)
    } else {
      setPlotForms((old) =>
        old.map((f) => {
          return { fn: "", tex: f.tex, color: f.color }
        }),
      )
    }
  }

  const changeFn = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    const fn = e.target.value.replace(/\s+/g, "")
    const newPlotForms = [...plotForms]
    newPlotForms[i].fn = fn

    if (!fn) {
      newPlotForms[i].tex = {
        value: "\\textrm{Input...}",
        style: `peer-focus:before:content-["|"] before:inline-block 
        before:text-text before:animate-blink text-text/50 peer-focus:text-text`,
      }
    } else {
      try {
        newPlotForms[i].tex = {
          value: mathParse(fn).toTex(),
          style: `peer-focus:after:content-["|"] after:inline-block 
          after:text-text after:animate-blink text-text`,
        }
      } catch (error) {
        newPlotForms[i].tex = {
          value: fn,
          style: `peer-focus:after:content-["|"] after:inline-block 
          after:text-text after:animate-blink text-red-500`,
        }
        console.error(`Invalid expression: ${fn}\n`, error)
      }
    }
    setPlotForms(newPlotForms)
  }

  const changeColor = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    const color = e.target.value

    if (plots.has(i)) {
      const newPlots = new Map(plots)
      newPlots.set(i, { fn: plotForms[i].fn, color: color })
      setPlots(newPlots)
    }

    const newPlots = [...plotForms]
    newPlots[i].color = color
    setPlotForms(newPlots)
  }

  return (
    <div className="h-full pr-4 bg-primary">
      {plotForms.map((field, i) => (
        <PlotInput
          key={`form.${i}`}
          index={i}
          values={field}
          handleAddPlot={addPlot}
          handleChangeFn={changeFn}
          handleChangeColor={changeColor}
          handleDelPlot={delPlot}
        />
      ))}
    </div>
  )
}

export default function InteractivePlot() {
  const [plots, setPlots] = useState(new Map<number, PlotFields>())
  const contextValue: PlotState = { plots, setPlots }
  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<InteractiveSVGPlot | null>(null)
  const size = useResizeObserver(wrapRef)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!svgRef.current && wrap) {
      svgRef.current = new InteractiveSVGPlot(wrap)
      svgRef.current.axes()
      svgRef.current.grid()

      //return () => {
      //  svgRef.current?.cleanup()
      //}
    }
  }, [])

  useEffect(() => {
    if (!svgRef.current || !size) return

    svgRef.current.resize(size.width, size.height)
    svgRef.current.fitViewToPlots()
  }, [size])

  useEffect(() => {
    if (svgRef.current) {
      svgRef.current.updatePlots(convertPlots(plots))
    }
  }, [plots])

  return (
    <Split
      className=""
      split="row"
      defaultSizes={[0.2, 0.8]}
      minSizes={[100, 500]}
    >
      <PlotContext.Provider value={contextValue}>
        <Panel />
      </PlotContext.Provider>
      <div
        ref={wrapRef}
        className="h-full bg-primary shadow-inner-l dark:shadow-black/50"
      />
    </Split>
  )
}

function convertPlots(plots: Map<number, PlotFields>) {
  const result = {}

  for (const v of plots.values()) {
    result[v.fn] = { color: v.color }
  }
  return result
}

function reorderMap(i: number, plots: Map<number, Partial<PlotFields>>) {
  for (const k of plots.keys()) {
    if (k > i) {
      const value = plots.get(k)!
      plots.delete(k)
      plots.set(k - 1, value)
    }
  }
  return plots
}

function validateFunction(fn: string) {
  try {
    const node = mathParse(fn)
    const test = node.compile().evaluate({ x: 0 })

    if (typeof test !== "number") return false

    return true
  } catch (e) {
    console.error(`Invalid function of x: ${fn}\n`, e)
    return false
  }
}

function randomColor() {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")}`
}
