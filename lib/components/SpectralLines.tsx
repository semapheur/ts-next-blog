import type { SVGProps } from "react"

import { wavelengthToColor, rgbToHex } from "lib/utils/color"

// visible spectrum: 380-750nm

type Props = {
  wavelengths: number[]
  name: string
} & SVGProps<SVGSVGElement>

export default function SpectralLines({ wavelengths, name, ...props }: Props) {
  return (
    <svg viewBox="0 0 1 1" {...props}>
      <title>{`Emission spectrum for ${name}`}</title>
      <defs>
        <linearGradient id="spectrum">
          <stop id="380nm" offset="0" stopColor="#020005" />
          <stop id="385nm" offset="0.013514" stopColor="#020006" />
          <stop id="390nm" offset="0.027027" stopColor="#030008" />
          <stop id="395nm" offset="0.040541" stopColor="#04000A" />
          <stop id="400nm" offset="0.054054" stopColor="#06000D" />
          <stop id="405nm" offset="0.067568" stopColor="#080110" />
          <stop id="410nm" offset="0.081081" stopColor="#0C0117" />
          <stop id="415nm" offset="0.094595" stopColor="#11021F" />
          <stop id="420nm" offset="0.108108" stopColor="#17032A" />
          <stop id="425nm" offset="0.121622" stopColor="#1F053A" />
          <stop id="430nm" offset="0.135135" stopColor="#25084B" />
          <stop id="435nm" offset="0.148649" stopColor="#290A5C" />
          <stop id="440nm" offset="0.162162" stopColor="#2B0E6F" />
          <stop id="445nm" offset="0.175676" stopColor="#291380" />
          <stop id="450nm" offset="0.189189" stopColor="#1F237B" />
          <stop id="455nm" offset="0.202703" stopColor="#132E74" />
          <stop id="460nm" offset="0.216216" stopColor="#09376C" />
          <stop id="465nm" offset="0.229730" stopColor="#0A3E66" />
          <stop id="470nm" offset="0.243243" stopColor="#0C4667" />
          <stop id="475nm" offset="0.256757" stopColor="#0E4F6A" />
          <stop id="480nm" offset="0.270270" stopColor="#10596C" />
          <stop id="485nm" offset="0.283784" stopColor="#11636D" />
          <stop id="490nm" offset="0.297297" stopColor="#146E6F" />
          <stop id="495nm" offset="0.310811" stopColor="#177970" />
          <stop id="500nm" offset="0.324324" stopColor="#178672" />
          <stop id="505nm" offset="0.337838" stopColor="#1A9574" />
          <stop id="510nm" offset="0.351351" stopColor="#1DA375" />
          <stop id="515nm" offset="0.364865" stopColor="#1DB273" />
          <stop id="520nm" offset="0.378378" stopColor="#20C070" />
          <stop id="525nm" offset="0.391892" stopColor="#22CB6B" />
          <stop id="530nm" offset="0.405405" stopColor="#21D662" />
          <stop id="535nm" offset="0.418919" stopColor="#23E054" />
          <stop id="540nm" offset="0.432432" stopColor="#36E842" />
          <stop id="545nm" offset="0.445946" stopColor="#50ED28" />
          <stop id="550nm" offset="0.459459" stopColor="#73EB22" />
          <stop id="555nm" offset="0.472973" stopColor="#8FE722" />
          <stop id="560nm" offset="0.486486" stopColor="#A5E221" />
          <stop id="565nm" offset="0.500000" stopColor="#B9DC22" />
          <stop id="570nm" offset="0.513514" stopColor="#CBD621" />
          <stop id="575nm" offset="0.527027" stopColor="#DCCE20" />
          <stop id="580nm" offset="0.540541" stopColor="#ECC420" />
          <stop id="585nm" offset="0.554054" stopColor="#F2B735" />
          <stop id="590nm" offset="0.567568" stopColor="#F5AB42" />
          <stop id="595nm" offset="0.581081" stopColor="#F69F49" />
          <stop id="600nm" offset="0.594595" stopColor="#F7944B" />
          <stop id="605nm" offset="0.608108" stopColor="#F98848" />
          <stop id="610nm" offset="0.621622" stopColor="#FA7B42" />
          <stop id="615nm" offset="0.635135" stopColor="#FB6C39" />
          <stop id="620nm" offset="0.648649" stopColor="#FD5B2E" />
          <stop id="625nm" offset="0.662162" stopColor="#FC471F" />
          <stop id="630nm" offset="0.675676" stopColor="#F7300F" />
          <stop id="635nm" offset="0.689189" stopColor="#EA220D" />
          <stop id="640nm" offset="0.702703" stopColor="#D42215" />
          <stop id="645nm" offset="0.716216" stopColor="#BF2318" />
          <stop id="650nm" offset="0.729730" stopColor="#A92309" />
          <stop id="655nm" offset="0.743243" stopColor="#981F07" />
          <stop id="660nm" offset="0.756757" stopColor="#871B06" />
          <stop id="665nm" offset="0.770270" stopColor="#771805" />
          <stop id="670nm" offset="0.783784" stopColor="#671504" />
          <stop id="675nm" offset="0.797297" stopColor="#591303" />
          <stop id="680nm" offset="0.810811" stopColor="#4D1103" />
          <stop id="685nm" offset="0.824324" stopColor="#420E02" />
          <stop id="690nm" offset="0.837838" stopColor="#370C01" />
          <stop id="695nm" offset="0.851351" stopColor="#2E0A01" />
          <stop id="700nm" offset="0.864865" stopColor="#270801" />
          <stop id="705nm" offset="0.878378" stopColor="#210600" />
          <stop id="710nm" offset="0.891892" stopColor="#1E0400" />
          <stop id="715nm" offset="0.905405" stopColor="#1A0300" />
          <stop id="720nm" offset="0.918919" stopColor="#170200" />
          <stop id="725nm" offset="0.932432" stopColor="#130100" />
          <stop id="730nm" offset="0.945946" stopColor="#100100" />
          <stop id="735nm" offset="0.959459" stopColor="#0C0100" />
          <stop id="740nm" offset="0.972973" stopColor="#080100" />
          <stop id="745nm" offset="0.986486" stopColor="#060100" />
          <stop id="750nm" offset="1" stopColor="#040100" />
        </linearGradient>
      </defs>
      <g>
        <rect
          width="100%"
          height="100%"
          fillOpacity="0.5"
          fill="url(#spectrum)"
        />
        {wavelengths.map((w, index) => (
          <line
            key={`line.${index}`}
            x1={(w - 380) / 370}
            y1="0"
            x2={(w - 380) / 370}
            y2="1"
            stroke={wavelengthToColor(w, true) as string}
            strokeWidth="0.005"
          >
            <title>{`${w} nm`}</title>
          </line>
        ))}
      </g>
    </svg>
  )
}
