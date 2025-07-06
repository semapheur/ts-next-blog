import type { HTMLProps } from "react"

type Marker = {
  value: number
  positon: "over" | "under"
  color: string
}

interface Props extends HTMLProps<HTMLDivElement> {
  min: number
  max: number
  markers: Marker[]
  width: number
  height: number
}

type MarkerProps = {
  value: number
  left: number
  color: string
}

function UnderMarker({ value, left, color }: MarkerProps) {
  return (
    <div
      className="-translate-x-1/2 absolute top-1/2 flex flex-col place-items-center"
      style={{ left: `${left}%` }}
    >
      <div
        className="size-1 rounded-full border bg-secondary"
        style={{ borderColor: color }}
      />
      <div
        className="-translate-x-1/4 h-2 w-0.5 border-r"
        style={{ borderColor: color }}
      />
      <div className="text-center">
        <span>{value}</span>
      </div>
    </div>
  )
}

function OverMarker({ value, left, color }: MarkerProps) {
  return (
    <div
      className="-translate-x-1/2 absolute bottom-1/2 flex translate-y-[0.125rem] flex-col place-items-center"
      style={{ left: `${left}%` }}
    >
      <div className="text-center">
        <span>{value}</span>
      </div>
      <div
        className="-translate-x-1/4 h-2 w-0.5 border-r"
        style={{ borderColor: color }}
      />
      <div
        className="size-1 rounded-full border bg-secondary"
        style={{ borderColor: color }}
      />
    </div>
  )
}

export default function RangeBar({ markers, min, max, width, height }: Props) {
  return (
    <div className="grid h-20 w-40 grid-rows-[1fr_auto] px-2 text-text text-xs">
      <div className="grid grid-cols-[auto_1fr_auto] content-center gap-1">
        <span>{min}</span>
        <div className="relative size-full">
          <div className="absolute top-1/2 h-0.5 w-full rounded-sm bg-text/50" />
          {markers.map((marker) => {
            const left = ((marker.value - min) / (max - min)) * 100
            return marker.positon === "over" ? (
              <OverMarker
                key={marker.value}
                value={marker.value}
                left={left}
                color={marker.color}
              />
            ) : (
              <UnderMarker
                key={marker.value}
                value={marker.value}
                left={left}
                color={marker.color}
              />
            )
          })}
        </div>
        <span>{max}</span>
      </div>
      <ul className="m-0 flex list-none justify-between gap-2 p-0">
        {markers.map((marker) => (
          <li
            key={marker.value}
            className="flex items-center before:text-secondary before:content-['\2022']"
            style={{ color: marker.color }}
          >
            {marker.value}
          </li>
        ))}
      </ul>
    </div>
  )
}
