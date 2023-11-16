import { useRef } from 'react'
import useMousePosition from 'hooks/useMousePosition'

type AxisProps = {
  center: number[],

}

type State = {
  position: number[]
  mouseDown: boolean
}

type DomainColoringProps = {
  state: State
}

function fragmentShader(
  expression, 
  customShader: boolean, 
  width: number, height: number,
  variableNames: string[],
  logMode: boolean
): string
{
  const xOffset = (width/2).toFixed(2)
  const yOffset = (height/2).toFixed(2)

  const dpr = window.devicePixelRatio.toFixed()

  const vecType = logMode ? 'vec3' : 'vec2'

  const variableDeclarations = variableNames.map(
    (name: string) => `uniform ${vecType} ${name}`
  ).join('\n')

  let customCode = ''
  let glslExpression = ''

  if (customShader) {
    customCode = expression
    glslExpression = 'mapping(z)'
  } else {
    glslExpression = toGlsl(expression, logMode)[0]
    if (logMode) {
      glslExpression = `upconvert(${glslExpression})`
    }
  }
  if (!glslExpression) return null

  return `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
  #else
    precision mediump float;
  #endif

  const float PI = 3.14159265358979323846264;
  const float TAU = 2.*PI;
  const float E = 2.718281845904523;
  const float LN2 = 0.69314718055994531;
  const float LN2_INV = 1.442695040889634;
  const float LNPI = 1.1447298858494001741434;
  const float PHI = 1.61803398874989484820459;
  const float SQ2 = 1.41421356237309504880169;

  const float checkerboard_scale = 0.25;

  const ${vecType} ZERO = ${vecType}(0);
  const ${vecType} ONE = ${logMode ? 'vec3(1.0, 0, 0)' : '(1.0, 0)'};
  const ${vecType} I = ${logMode ? 'vec3(0, 1.0, 0)' : 'vec2(0, 1.0)'};
  const ${vecType} C_PI = PI * ONE;
  const ${vecType} C_TAU = TAU * ONE;
  const ${vecType} C_E = E * ONE;
  const ${vecType} C_PHI = PHI * ONE

  ${variableDeclarations}

  vec2 clogcart(${vecType} z) {
    return vec2(${
      logMode ? 'log(length(z.xy)) + z.z' : 'log(length(z))'}, 
      atan(z.y, z.x+1e-20)
    );
  }
  vec2 encodereal(float a) {return vec2(log(abs(a)), 0.5*PI*(1. - sign(a)));}
  ${vecType} downconvert(${vecType} z) {
    return ${vecType}(${logMode ? 'vec3(vec2(z.xy) * exp(z.z))' : 'z'};}
  vec3 upconvert(vec3 z) {float l = length(z.xy); return vec3(z.xy/l, z.z + log(l));}
  float ordinate(${vecType} z) {return ${logMode ? 'z.z' : '0.0'};}

  ${functionDefinitions(expression, logMode)}

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyc) * 6.0 - K.wwww);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y)
  }

  vec3 get_color(${vecType} z_int, float derivative, float phase_derivative) {
    vec2 magphase = clogcart(z_int);
    magphase.x *= LN2_INV;
    magphase.y = mod(magphase.y, TAU);
    vec2 z = ${logMode ? 'downconvert(z_int).xy' : 'z_int'};

    float color_value;
    float color_saturation = 1.0;

    ${logMode ? `float phase_decay_factor = 1.0/clamp(8.0 * phase_derivative, 1.0, 10000.);
    color_saturation *= phase_decay_factor;` : ''}

    if (continuous_gradient.x > 0.5) {
      float color_lightness = 0.5 + atan(0.35 * magphase.x)/PI;
      color_saturation = 1.0;
      
      if (invert_gradient.x > 0.5) {
        color_lightness = 1.0 - color_lightness;
      }

      // HSL to HSV
      color_lightness *= 2.0;
      color_saturation *= 1.0 - abs(color_lightness - 1.0);
      color_value = (color_lightness + color_saturation) / 2.0;
      color_saturation /= color_value;
    } else {
      color_value = 0.5 * exp2(fract(magphase.x));

      if (invert_gradient.x > 0.5) {
        color_value = 1.5 - color_value;
      }
      ${logMode ? 'color_value += (0.75 - color_value) * (1.0 - phase_decay_factor);' : ''}
    }

    if (enable_checkerboard.x > 0.5) {
      vec2 checkerboard_components = floor(2.0 * fract(z/checkeboard_scale));
      float checkerboard = floor(2.0 * fract((checkerboard_components.x + checkerboard_components.y)/2.0));

      // Anti-Moire
      float decay_factor = clamp(40. * derivative, 1.0, 10000.0) - 1;
      checkerboard = 0.5 + (checkerboard - 0.5) / (1.0 + 3.0 * decay_factor);

      if (magphase.x > 15.0) {checkerboard = 0.5;}

      color_value *= 0.8 + 0.2 * checkerboard;
    }

    vec3 hsv_color = vec3(magphase.y/TAU, color_saturation, color_value);
    return hsv2rgb(hsv_color);
  }

  ${customCode}

  const vec2 screen_offset = vec2(${xOffset}, ${yOffset});
  vec2 from_pixel(vec2 xy) {
    vec2 plot_center = vec2(center_x.x, center_y.x);
    float scale = exp(-log_scale.x) / ${dpr};
    return scale * (xy - screen_offset) + plot_center;
  }

  ${vecType} internal_mapping(vec2 xy) {
    vec2 z_int = from_pixel(xy);
    ${logMode ? 'vec3 z = vec3(z_int, 0);': 'vec2 z = z_int;'}
    return ${glslExpression}
  }

  void main() {
    // Setup for supersampling
    const vec2 A = vec2(0.125, 0.375);
    const vec2 B = vec2(0.375, -0.125);
    vec2 xy = gl_FragCoord.xy;

    // 4-Rook supersampling
    ${vecType} w1 = internal_mapping(xy + A);
    ${vecType} w2 = internal_mapping(xy - A);
    ${vecType} w3 = internal_mapping(xy + B);
    ${vecType} w4 = internal_mapping(xy - B);

    // Anti-Moire
    float phase_derivative = ${logMode ? '0.5 * (length(w1 - w2) + length(w3 - w4))' : '0.'};
    float derivative = ${
      logMode ? 'phase_derivative * exp(min(w1.z, 20.))' 
      : '0.5 * (length(w1 - w2) + length(w3 - w4))'};

    vec3 color1 = get_color(w1, derivative, phase_derivative);
    vec3 color2 = get_color(w2, derivative, phase_derivative);
    vec3 color3 = get_color(w3, derivative, phase_derivative);
    vec3 color4 = get_color(w4, derivative, phase_derivative);

    vec3 color = 0.25 * (color1 + color2 + color3 + color4);
    gl_FragColor = vec4(color, 1.)
  }
  `
}

export default function DomainColoring(props: DomainColoringProps) {
  const glRef = useRef<HTMLCanvasElement>(null)

  const mousePosition = useMousePosition(glRef)

  function handleZoom(wheelEvent: WheelEvent) {
    const {position} = props.state
    
    if (!position.every(isFinite)) {return}

    const [x, y, ]

    const [mousePlotX, mouse]
  }

  return (
    <div className='relative w-full h-full'>
      <canvas ref={axisRef} className='absolute inset-0 w-full h-full'/>
      <canvas ref={glRef} className='absolute inset-0 w-full h-full'/>
    </div>
  )
}