import type { HTMLProps } from "react"

type Marker = {
  value: number
  positon: "over" | "under"
  color: string
}

type Props = {
  min: number
  max: number
  markers: Marker[]
  width: number
  height: number
} & HTMLProps<HTMLDivElement>

type MarkerProps = {
  value: number
  left: number
  color: string
}

function UnderMarker({ value, left, color }: MarkerProps) {
  return (
    <div
      className="absolute top-1/2 -translate-x-1/2 flex flex-col place-items-center"
      style={{ left: `${left}%` }}
    >
      <div
        className="size-1 border rounded-full bg-secondary"
        style={{ borderColor: color }}
      />
      <div
        className="w-0.5 h-2 -translate-x-1/4 border-r"
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
      className="absolute bottom-1/2 -translate-x-1/2 translate-y-[0.125rem] flex flex-col place-items-center"
      style={{ left: `${left}%` }}
    >
      <div className="text-center">
        <span>{value}</span>
      </div>
      <div
        className="w-0.5 h-2 -translate-x-1/4 border-r"
        style={{ borderColor: color }}
      />
      <div
        className="size-1 border rounded-full bg-secondary"
        style={{ borderColor: color }}
      />
    </div>
  )
}

export default function RangeBar({ markers, min, max, width, height }: Props) {
  return (
    <div className="w-40 h-20 px-2 grid grid-rows-[1fr_auto] text-text text-xs">
      <div className="grid grid-cols-[auto_1fr_auto] gap-1 content-center">
        <span>{min}</span>
        <div className="relative size-full">
          <div className="absolute top-1/2 w-full h-0.5 bg-text/50 rounded" />
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
      <ul className="flex gap-2 justify-between list-none p-0 m-0">
        {markers.map((marker) => (
          <li
            key={marker.value}
            className="flex items-center before:content-['\2022'] before:text-secondary"
            style={{ color: marker.color }}
          >
            {marker.value}
          </li>
        ))}
      </ul>
    </div>
  )
}
