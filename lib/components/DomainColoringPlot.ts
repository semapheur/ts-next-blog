import {
  parse,
  ConstantNode,
  FunctionNode,
  type MathNode,
  OperatorNode,
  type ParenthesisNode,
  type SymbolNode,
} from "mathjs";

import CanvasGrid from "lib/components/CanvasGrid";
import { resizeCanvas } from "lib/utils/canvas";
import { requiredFunctions } from "lib/utils/complex";
import { gridUnit } from "lib/utils/num";
import { makeProgram, makeShader, setRectangle } from "lib/utils/webgl";

export class DomainColoringPlot {
  #gl: WebGL2RenderingContext;
  #ctx: CanvasRenderingContext2D;
  #grid: CanvasGrid;

  #matrix: DOMMatrix;
  #expression: string;
  #minGrid: number = 50;

  #program: WebGLProgram | null = null;
  #scaleLoc: WebGLUniformLocation | null = null;
  #translateLoc: WebGLUniformLocation | null = null;
  #unitLoc: WebGLUniformLocation | null = null;

  #animationFrameId: number | null = null;

  constructor(
    plotCanvas: HTMLCanvasElement,
    gridCanvas: HTMLCanvasElement,
    matrix: DOMMatrix,
    expression: string,
  ) {
    const gl = plotCanvas.getContext("webgl2");
    const ctx = gridCanvas.getContext("2d");

    if (!gl || !ctx) {
      throw new Error("Unable to initialize WebGL or Canvas 2D contexts");
    }

    this.#gl = gl;
    this.#ctx = ctx;
    this.#matrix = matrix;
    this.#expression = expression;

    this.#grid = new CanvasGrid(
      this.#ctx.canvas,
      this.#matrix,
      undefined,
      false,
      true,
    );

    this.#initScene();
    this.#startLoop();
  }

  updateTransform(matrix: DOMMatrix) {
    this.#matrix = matrix;
  }

  updateExpression(expression: string) {
    if (this.#expression === expression) return;
    this.#expression = expression;
    this.#initScene();
  }

  dispose() {
    if (this.#animationFrameId !== null) {
      cancelAnimationFrame(this.#animationFrameId);
    }

    if (this.#program) {
      this.#gl.deleteProgram(this.#program);
    }
  }

  #initScene() {
    const vertexCode = `#version 300 es
      in vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0, 1);
      }
    `;

    const vertexShader = makeShader(
      this.#gl,
      this.#gl.VERTEX_SHADER,
      vertexCode,
    );
    const fragmentCode = this.#makeFragmentCode(this.#expression);
    const fragmentShader = makeShader(
      this.#gl,
      this.#gl.FRAGMENT_SHADER,
      fragmentCode,
    );

    if (!(vertexShader && fragmentShader)) {
      console.error("Failed to compile shaders:\n", fragmentCode);
      return;
    }

    const program = makeProgram(this.#gl, vertexShader, fragmentShader);
    if (!program) {
      console.error("AST could not be compiled:", this.#expression);
      return;
    }

    this.#program = program;
    this.#gl.useProgram(this.#program);

    this.#scaleLoc = this.#gl.getUniformLocation(this.#program, "u_scale");
    this.#translateLoc = this.#gl.getUniformLocation(
      this.#program,
      "u_translate",
    );
    this.#unitLoc = this.#gl.getUniformLocation(this.#program, "u_unit");

    const positionBuffer = this.#gl.createBuffer();
    const vertexArray = this.#gl.createVertexArray();

    this.#gl.bindVertexArray(vertexArray);
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, positionBuffer);

    const positionLoc = this.#gl.getAttribLocation(this.#program, "a_position");
    this.#gl.enableVertexAttribArray(positionLoc);
    setRectangle(this.#gl, -1, -1, 2, 2);
    this.#gl.vertexAttribPointer(positionLoc, 2, this.#gl.FLOAT, false, 0, 0);
  }

  #startLoop() {
    const render = () => {
      this.#renderPlot();
      this.#renderGrid();
      this.#animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  #renderPlot() {
    if (!this.#program) return;

    resizeCanvas(this.#gl.canvas as HTMLCanvasElement);
    this.#gl.viewport(0, 0, this.#gl.canvas.width, this.#gl.canvas.height);

    this.#gl.clearColor(0, 0, 0, 0);
    this.#gl.clear(this.#gl.COLOR_BUFFER_BIT | this.#gl.DEPTH_BUFFER_BIT);

    this.#gl.uniform2f(this.#scaleLoc, this.#matrix.a, this.#matrix.d);
    this.#gl.uniform2f(
      this.#translateLoc,
      this.#matrix.e,
      this.#gl.canvas.height - this.#matrix.f,
    );

    const unit = gridUnit(this.#minGrid / this.#matrix.a);
    this.#gl.uniform1f(this.#unitLoc, unit);

    this.#gl.drawArrays(this.#gl.TRIANGLES, 0, 6);
  }

  #renderGrid() {
    resizeCanvas(this.#ctx.canvas as HTMLCanvasElement);
    this.#grid.updateTransform(this.#matrix);
    this.#grid.draw();
  }

  #toGlsl(ast: MathNode): [string, Set<string>] {
    const vecOperators = new Set<string>(["+", "-"]);
    const functions = new Set<string>();

    const callback = (node: MathNode): MathNode => {
      switch (node.type) {
        case "SymbolNode": {
          if ((node as SymbolNode).name !== "i") return node;
          return new FunctionNode("vec2", [
            new ConstantNode(0),
            new ConstantNode(1),
          ]);
        }
        case "ConstantNode": {
          return new FunctionNode("vec2", [
            new ConstantNode((node as ConstantNode).value),
            new ConstantNode(0),
          ]);
        }
        case "FunctionNode": {
          const fn = `c_${(node as FunctionNode).fn.name}`;
          functions.add(fn);
          const args = (node as FunctionNode).args.map(callback);
          return new FunctionNode(fn, args);
        }
        case "OperatorNode": {
          const op = (node as OperatorNode).op;
          const fn = `c_${(node as OperatorNode).fn}`;
          const args = (node as OperatorNode).args.map(callback);

          if (vecOperators.has(op)) {
            return new OperatorNode(op, op, args);
          }
          functions.add(fn);
          return new FunctionNode(fn, args);
        }
        case "ParenthesisNode": {
          return callback((node as ParenthesisNode).content);
        }
        default: {
          return node;
        }
      }
    };

    const glsl = ast.transform(callback);
    return [glsl.toString(), functions];
  }

  #makeFragmentCode(expression: string): string {
    const [fn, required] = this.#toGlsl(parse(expression));
    const functionDeclarations = requiredFunctions(required);

    return `#version 300 es
    #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
    #else
      precision mediump float;
    #endif

    out vec4 fragColor;

    uniform vec2 u_scale;
    uniform vec2 u_translate;
    uniform float u_unit;

    const float PI = 3.14159265358979323846264;

    ${functionDeclarations.join("\n")}

    vec2 pixel_to_draw(vec2 xy) {
      return (xy - u_translate) / u_scale;
    }

    vec2 complex_function(vec2 xy) {
      vec2 z_cartesian = pixel_to_draw(xy);
      vec2 z = vec2(log(length(z_cartesian)), atan(z_cartesian.y, z_cartesian.x));
      return ${fn};
    }

    vec3 hsv2rgb(vec3 hsv) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(hsv.xxx + K.xyz) * 6.0 - K.www);
      return hsv.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), hsv.y);
    }

    float norm_phase(vec2 z) {
      return (z.y + PI) / (2.0 * PI);
    }

    float magnitude_shading(vec2 z) {
      float log2_modulus = z.x / log(2.0);
      return 0.5 + 0.5 * fract(log2_modulus);
    }

    float gridlines(vec2 z, float alpha) {
      float GRID_MAG = 1.0;
      float GRID_PHASE = PI / u_unit;

      vec2 coord = vec2(z.x * GRID_MAG, z.y * GRID_PHASE);
      vec2 fw = fwidth(coord);

      float blendX = smoothstep(2.0, 0.5, fw.x);
      float blendY = smoothstep(2.0, 0.5, fw.y);

      float gx = mix(1.0, pow(abs(sin(coord.x)), alpha), blendX);
      float gy = mix(1.0, pow(abs(sin(coord.y)), alpha), blendY);

      return gx * gy;
    }

    vec3 domain_color(vec2 z, float alpha) {
      if (isnan(z.x) || isnan(z.y) || isinf(z.x) || isinf(z.y)) {
        return vec3(0.0);
      }

      float h = norm_phase(z);
      float s = magnitude_shading(z);
      float v = gridlines(z, alpha);
      return hsv2rgb(vec3(h, s, v));
    }

    void main() {
      const vec2 A = vec2(0.125, 0.375);
      const vec2 B = vec2(0.375, -0.125);

      vec2 xy = gl_FragCoord.xy;

      vec2 z1 = complex_function(xy + A);
      vec2 z2 = complex_function(xy - A);
      vec2 z3 = complex_function(xy + B);
      vec2 z4 = complex_function(xy - B);

      vec3 color1 = domain_color(z1, 0.1);
      vec3 color2 = domain_color(z2, 0.1);
      vec3 color3 = domain_color(z3, 0.1);
      vec3 color4 = domain_color(z4, 0.1);

      vec3 color = 0.25 * (color1 + color2 + color3 + color4);
      fragColor = vec4(color, 1.0);
    }`;
  }
}

/*
`#version 300 es
  #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
  #else
    precision mediump float;
  #endif

  out vec4 fragColor;

  uniform vec2 u_scale;
  uniform vec2 u_translate;
  uniform float u_unit;

  const float PI = 3.14159265358979323846264;

  ${functionDeclarations.join("\n")}

  vec2 pixel_to_draw(vec2 xy) {
    return (xy - u_translate) / u_scale;
  }

  vec2 complex_function(vec2 xy) {
    vec2 z = pixel_to_draw(xy);
    return ${fn};
  }

  vec3 hsv2rgb(vec3 hsv) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(hsv.xxx + K.xyz) * 6.0 - K.www);
    return hsv.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), hsv.y);
  }

  float norm_phase(vec2 z) {
    return atan(z.y, z.x) / (2.0 * PI);
  }

  float safe_length(vec2 v) {
    float abs_x = abs(v.x);
    float abs_y = abs(v.y);
    float max_val = max(abs_x, abs_y);

    if (max_val == 0.0) return 0.0;

    return max_val * length(v / max_val);
  }

  float magnitude_shading(vec2 z) {
    float log_modulus = log2(safe_length(z));
    return 0.5 + 0.5 * fract(log_modulus);
  }

  float gridlines(vec2 z, float alpha) {
    float GRID = PI / u_unit;
    vec2 gz = GRID * z;
    vec2 fw = fwidth(gz);

    float blendX = smoothstep(2.0, 0.5, fw.x);
    float blendY = smoothstep(2.0, 0.5, fw.y);

    float gx = mix(1.0, pow(abs(sin(gz.x)), alpha), blendX);
    float gy = mix(1.0, pow(abs(sin(gz.y)), alpha), blendY);

    return gx * gy;
  }

  vec3 domain_color(vec2 z, float alpha) {
    if (isnan(z.x) || isnan(z.y) || isinf(z.x) || isinf(z.y)) {
      return vec3(0);
    }

    float r = safe_length(z);
    if (r > 1e10) {
      z = normalize(z) * 1e10;
    }

    float h = norm_phase(z);
    float s = magnitude_shading(z);
    float v = gridlines(z, alpha);
    return hsv2rgb(vec3(h, s, v));
  }

  void main() {
    const vec2 A = vec2(0.125, 0.375);
    const vec2 B = vec2(0.375, -0.125);

    vec2 xy = gl_FragCoord.xy;

    vec2 z1 = complex_function(xy + A);
    vec2 z2 = complex_function(xy - A);
    vec2 z3 = complex_function(xy + B);
    vec2 z4 = complex_function(xy - B);

    vec3 color1 = domain_color(z1, 0.1);
    vec3 color2 = domain_color(z2, 0.1);
    vec3 color3 = domain_color(z3, 0.1);
    vec3 color4 = domain_color(z4, 0.1);

    vec3 color = 0.25 * (color1 + color2 + color3 + color4);
    fragColor = vec4(color, 1.0);
  }`
*/
