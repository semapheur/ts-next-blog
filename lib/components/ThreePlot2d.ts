import * as THREE from "three/webgpu";
import {
  uv,
  uniform,
  abs,
  fract,
  step,
  mix,
  clamp,
  vec4,
  float,
} from "three/tsl";

export interface FunctionDef {
  fn: (x: any) => any;
  color?: [number, number, number];
}

export interface PlotterOptions {
  canvas?: HTMLCanvasElement;
  antialias?: boolean;
  functions?: FunctionDef[];
}

export class ThreePlot2d {
  #renderer: THREE.WebGPURenderer;
  #scene: THREE.Scene;
  #camera: THREE.OrthographicCamera;
  #material: THREE.MeshBasicNodeMaterial;

  readonly uZoom: THREE.UniformNode<number>;
  readonly uOffset: THREE.UniformNode<THREE.Vector2>;

  #dragging = false;
  #lastX = 0;
  #lastY = 0;
  #animationFrameId: number | null = null;

  #_onWheel: (e: WheelEvent) => void;
  #_onPointerDown: (e: PointerEvent) => void;
  #_onPointerMove: (e: PointerEvent) => void;
  #_onPointerUp: () => void;
  #resizeObserver: ResizeObserver | null = null;

  constructor(private options: PlotterOptions = {}) {
    this.uZoom = uniform(4.0);
    this.uOffset = uniform(new THREE.Vector2(0, 0));

    this.#renderer = new THREE.WebGPURenderer({
      canvas: options.canvas,
      antialias: options.antialias ?? true,
    });

    this.#scene = new THREE.Scene();
    this.#camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.#_onWheel = this.#onWheel.bind(this);
    this.#_onPointerDown = this.#onPointerDown.bind(this);
    this.#_onPointerMove = this.#onPointerMove.bind(this);
    this.#_onPointerUp = this.#onPointerUp.bind(this);
  }

  async init() {
    await this.#renderer.init();

    const canvas = this.#renderer.domElement;
    this.#renderer.setPixelRatio(window.devicePixelRatio);
    this.#renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    this.#buildScene(this.options.functions ?? []);
    this.#attachListeners();
    this.#renderer.setAnimationLoop(() =>
      this.#renderer.render(this.#scene, this.#camera),
    );

    return this;
  }

  mount(container: HTMLElement): this {
    container.appendChild(this.#renderer.domElement);
    return this;
  }

  dispose() {
    this.#renderer.setAnimationLoop(null);
    this.#detachListeners();
    this.#renderer.dispose();
  }

  #buildScene(functions: FunctionDef[]) {
    const plane = new THREE.PlaneGeometry(2, 2);

    const graphX = uv().x.sub(0.5).mul(this.uZoom).add(this.uOffset.x);
    const graphY = uv().y.sub(0.5).mul(this.uZoom).add(this.uOffset.y);

    // Grid
    const gridX = step(abs(fract(graphX).sub(0.5)), float(0.005));
    const gridY = step(abs(fract(graphY).sub(0.5)), float(0.005));
    const grid = clamp(gridX.add(gridY), 0, 1);

    // Axes
    const axisX = step(abs(graphX), float(0.012).mul(this.uZoom));
    const axisY = step(abs(graphY), float(0.012).mul(this.uZoom));
    const axes = clamp(axisX.add(axisY), 0, 1);

    const background = vec4(0.1, 0.1, 0.12, 1);
    const gridColor = vec4(0.25, 0.25, 0.3, 1);
    const axisColor = vec4(0.6, 0.6, 0.7, 1);

    let color = mix(background, gridColor, grid);
    color = mix(color, axisColor, axes);

    for (const { fn, color: rgb = [0.2, 0.9, 0.5] } of functions) {
      const funcY = fn(graphX);
      const dist = abs(graphY.sub(funcY));
      const line = step(dist, float(0.008).mul(this.uZoom));
      const fnColor = vec4(...rgb, 1);
      color = mix(color, fnColor, line);
    }

    this.#material = new THREE.MeshBasicNodeMaterial();
    this.#material.colorNode = color;

    this.#scene.add(new THREE.Mesh(plane, this.#material));
  }

  setFunctions(functions: FunctionDef[]) {
    this.#scene.clear();
    this.#buildScene(functions);
  }

  setZoom(zoom: number) {
    this.uZoom.value = zoom;
  }

  setOffset(x: number, y: number) {
    this.uOffset.value.set(x, y);
  }

  resetView() {
    this.uZoom.value = 4;
    this.uOffset.value.set(0, 0);
  }

  getCanvas(): HTMLCanvasElement {
    return this.#renderer.domElement;
  }

  #attachListeners() {
    const canvas = this.#renderer.domElement;
    canvas.addEventListener("wheel", this.#_onWheel, { passive: true });
    canvas.addEventListener("pointerdown", this.#_onPointerDown);
    window.addEventListener("pointermove", this.#_onPointerMove);
    window.addEventListener("pointerup", this.#_onPointerUp);

    this.#resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { inlineSize: width, blockSize: height } =
          entry.contentBoxSize[0];
        if (width > 0 && height > 0) {
          this.#renderer.setSize(width, height, false);
        }
      }
    });
    this.#resizeObserver.observe(canvas);
  }

  #detachListeners() {
    const canvas = this.#renderer.domElement;
    canvas.removeEventListener("wheel", this.#_onWheel);
    canvas.removeEventListener("pointerdown", this.#_onPointerDown);
    window.removeEventListener("pointermove", this.#_onPointerMove);
    window.removeEventListener("pointerup", this.#_onPointerUp);
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = null;
  }

  #onWheel(e: WheelEvent) {
    this.uZoom.value *= e.deltaY > 0 ? 1.1 : 0.9;
  }

  #onPointerDown(e: PointerEvent) {
    this.#dragging = true;
    this.#lastX = e.clientX;
    this.#lastY = e.clientY;
  }

  #onPointerMove(e: PointerEvent) {
    if (!this.#dragging) return;
    const z = this.uZoom.value;
    this.uOffset.value.x -= (e.clientX - this.#lastX) * 0.001 * z;
    this.uOffset.value.y -= (e.clientY - this.#lastY) * 0.001 * z;
    this.#lastX = e.clientX;
    this.#lastY = e.clientY;
  }

  #onPointerUp() {
    this.#dragging = false;
  }
}
