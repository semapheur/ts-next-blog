import {
  //ConstantNode,
  //FunctionNode,
  //OperatorNode,
  type MathNode,
  //type ParenthesisNode,
  //type SymbolNode,
} from "mathjs";

//import CanvasGrid from "lib/components/CanvasGrid";
import { resizeCanvas } from "lib/utils/canvas";
//import { requiredFunctions } from "lib/utils/complex";
import { gridUnit } from "lib/utils/num";
import { makeProgram, makeShader, setRectangle } from "lib/utils/webgl";

export class ShaderPlot2d {
  #gl: WebGL2RenderingContext;

  #matrix: DOMMatrix;
  #expression: MathNode | null = null;
  #minGrid: number = 50;

  #program: WebGLProgram | null = null;
  #scaleLoc: WebGLUniformLocation | null = null;
  #translateLoc: WebGLUniformLocation | null = null;
  #unitLoc: WebGLUniformLocation | null = null;

  #animationFrameId: number | null = null;

  constructor(
    plotCanvas: HTMLCanvasElement,
    matrix: DOMMatrix,
    expression: MathNode | null,
  ) {
    const gl = plotCanvas.getContext("webgl2");

    if (!gl) {
      throw new Error("Unable to initialize WebGL or Canvas 2D contexts");
    }

    this.#gl = gl;
    this.#matrix = matrix;
    this.#expression = expression;

    if (this.#expression) this.#initScene();
    this.#startLoop();
  }

  updateTransform(matrix: DOMMatrix) {
    this.#matrix = matrix;
  }

  updateExpression(expression: MathNode | null) {
    if (this.#expression === expression) return;
    this.#expression = expression;

    if (this.#expression) {
      this.#initScene();
      return;
    }

    this.#gl.deleteProgram(this.#program);
    this.#program = null;
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
    const fragmentCode = this.#makeFragmentCode();
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

  #makeFragmentCode() {
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

      float gridLine(float coord, float spacing, float thickness) {
        float v = coord / spacing;
        float d = abs(fract(v - 0.5) - 0.5) * spacing;
        float fw = fwidth(coord);
        return 1.0 - smoothstep(thickness - fw, thickness + fw, d);
      }

      float axisLine(float coord, float thickness) {
        float fw = fwdidth(coord);
        return 1.0 - smoothstep(thickness - fw, thickness + fw, abs(coord));
      }

      void main() {
        vec2 xy = gl_FragCoord.xy;
        vec2 world = (xy - u_translate) / u_scale;

        float major = u_unit;
        float minor = u_unit / 5.0;
        float pxWidth = 1.0 / u_scale.x;

        float minorAlpha = max(gridLine(world.x, minor, 0.5 * pxWidth), gridLine(world.y, minor, 0.5 * pxWidth));
        float majorAlpha = max(gridLine(world.x, major, 0.75 * pxWidth), gridLine(world.y, major, 0.75 * pxWidth));
        float axisAlpha = max(axisLine(world.x, major, 1.5 * pxWidth), gridLine(world.y, major, 1.5 * pxWidth));

        outColor = vec4(0.0, 0.0, 0.0, 0.0);
        outColor = mix(color, vec4(0.5, 0.5, 0.5, 1.0), minorAlpha * 0.25);
        outColor = mix(color, vec4(0.65, 0.65, 0.65, 1.0), majorAlpha * 0.55);
        outColor = mix(color, vec4(0.9, 0.9, 0.9, 1.0), axisAlpha);

        fragColor = outColor;
      }
    `;
  }
}
