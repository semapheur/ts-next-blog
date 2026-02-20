import * as THREE from "three";
import {
  Pass,
  FullScreenQuad,
} from "three/examples/jsm/postprocessing/Pass.js";

import vertexShader from "lib/shaders/standard_vs.glsl";
import blurFragmentShader from "lib/shaders/blur_fs.glsl";
//import drawFragmentShader from 'lib/shaders/plain_draw_fs.glsl'

export class PyramidBloomPass extends Pass {
  vertexShader: string;
  drawFragmentShader: string;
  multiplierColor: THREE.Vector3;
  falloffColor: THREE.Vector3;
  totalBrightnessFactor: THREE.Vector3;
  blur1Shader: THREE.ShaderMaterial;
  blur1FirstShader: THREE.ShaderMaterial;
  drawShader: THREE.ShaderMaterial;
  downsampledBuffer: THREE.WebGLRenderTarget[];
  renderer: THREE.WebGLRenderer;
  maskActive: boolean;
  quad: FullScreenQuad;

  constructor() {
    super();

    this.needsSwap = false;

    this.multiplierColor = new THREE.Vector3(1.0, 1.0, 1.0);
    this.falloffColor = new THREE.Vector3(1.0, 1.0, 1.0);

    this.totalBrightnessFactor = new THREE.Vector3(1.0, 1.0, 1.0);

    this.blur1Shader = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: blurFragmentShader,
      uniforms: {
        blur_amount: { value: 0.25 },
        d0: { value: new THREE.Vector2(0.0, 0.0) },
        d1: { value: new THREE.Vector2(0.0, 0.0) },
        d2: { value: new THREE.Vector2(0.0, 0.0) },
        d3: { value: new THREE.Vector2(0.0, 0.0) },
        color_texture: { value: new THREE.Texture() },
        uv_scale: { value: new THREE.Vector2(1.0, 1.0) },
      },
    });

    this.drawShader = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      transparent: true,
      fragmentShader: this.drawFragmentShader,
      uniforms: {
        color_texture: { value: null },
        color_multiplier: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        uv_scale: { value: new THREE.Vector2(1.0, 1.0) },
      },
    });

    this.quad = new FullScreenQuad(undefined);
    this.downsampledBuffer = [];
  }

  downsampleOne(
    renderer: THREE.WebGLRenderer,
    src: THREE.WebGLRenderTarget,
    dest: THREE.WebGLRenderTarget,
    shader: THREE.ShaderMaterial,
  ) {
    const deltaScale = 0.75;
    if (
      dest.width !== Math.floor(src.width / 2) ||
      dest.height !== Math.floor(src.height / 2)
    ) {
      dest.setSize(Math.floor(src.width / 2), Math.floor(src.height / 2));
    }

    renderer.setRenderTarget(dest);

    this.quad.material = shader;
    shader.uniforms.d0.value = new THREE.Vector2(
      -deltaScale / src.width,
      -deltaScale / src.height,
    );
    shader.uniforms.d1.value = new THREE.Vector2(
      deltaScale / src.width,
      -deltaScale / src.height,
    );
    shader.uniforms.d2.value = new THREE.Vector2(
      -deltaScale / src.width,
      deltaScale / src.height,
    );
    shader.uniforms.d3.value = new THREE.Vector2(
      deltaScale / src.width,
      deltaScale / src.height,
    );
    shader.uniforms.color_texture.value = src.texture;
    shader.uniforms.uv_scale.value.set(
      src.width % 2 === 1 ? 1.0 - 1.0 / src.width : 1.0,
      src.height % 2 === 1 ? 1.0 - 1.0 / src.height : 1.0,
    );
    this.quad.render(renderer);
  }

  downsampleAll(
    renderer: THREE.WebGLRenderer,
    baseFB: THREE.WebGLRenderTarget,
  ) {
    this.downsampledBuffer[0] = baseFB;
    let src = baseFB;
    let i: number;
    for (i = 1; src.width > 3 && src.height > 3; i++) {
      if (!this.downsampledBuffer[i]) {
        const params = {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat,
          type: baseFB.texture.type,
          depthBuffer: false,
          stencilBuffer: false,
          generateMipmaps: false,
        };
        this.downsampledBuffer[i] = new THREE.WebGLRenderTarget(
          Math.floor(src.width / 2),
          Math.floor(src.height / 2),
          params,
        );
      }
      this.downsampleOne(
        renderer,
        src,
        this.downsampledBuffer[i],
        this.blur1Shader,
      );
      src = this.downsampledBuffer[i];
    }
    const n_buffers = i;
    while (i < this.downsampledBuffer.length) {
      if (this.downsampledBuffer[i]) this.downsampledBuffer[i].dispose();
      delete this.downsampledBuffer[i];
      i++;
    }
    this.downsampledBuffer.length = n_buffers;
  }

  upsampleOne(
    renderer: THREE.WebGLRenderer,
    src: THREE.WebGLRenderTarget,
    dest: THREE.WebGLRenderTarget,
  ) {
    this.quad.material = this.drawShader;
    this.drawShader.uniforms.color_texture.value = src.texture;
    this.drawShader.uniforms.uv_scale.value.set(
      dest.width / (src.width * 2.0),
      dest.height / (src.height * 2.0),
    );

    const autoClear = renderer.autoClear;
    const autoClearColor = renderer.autoClearColor;
    renderer.autoClear = false;
    renderer.autoClearColor = false;

    renderer.setRenderTarget(dest);
    this.quad.render(renderer);
    renderer.autoClear = autoClear;
    renderer.autoClearColor = autoClearColor;
  }

  upsampleAll(renderer: THREE.WebGLRenderer) {
    this.drawShader.transparent = true;
    this.drawShader.blending = THREE.CustomBlending;
    this.drawShader.blendSrc = THREE.OneFactor;
    this.drawShader.blendDst = THREE.OneFactor;
    this.drawShader.depthTest = false;
    this.drawShader.depthWrite = false;
    this.drawShader.uniforms.color_multiplier.value = this.falloffColor;

    for (let i = this.downsampledBuffer.length - 1; i > 1; --i) {
      this.upsampleOne(
        renderer,
        this.downsampledBuffer[i],
        this.downsampledBuffer[i - 1],
      );
      this.totalBrightnessFactor.multiply(
        this.drawShader.uniforms.color_multiplier.value,
      );
      this.totalBrightnessFactor.add(new THREE.Vector3(1.0, 1.0, 1.0));
    }
    this.drawShader.uniforms.color_multiplier.value = this.multiplierColor;
    if (this.downsampledBuffer.length > 1) {
      this.upsampleOne(
        renderer,
        this.downsampledBuffer[1],
        this.downsampledBuffer[0],
      );
      this.totalBrightnessFactor.multiply(
        this.drawShader.uniforms.color_multiplier.value,
      );
      this.totalBrightnessFactor.add(new THREE.Vector3(1.0, 1.0, 1.0));
    }
  }

  render(
    renderer: THREE.WebGLRenderer,
    writeBuffer: THREE.WebGLRenderTarget,
    readBuffer: THREE.WebGLRenderTarget,
    deltaTime: number | null,
    maskActive: boolean,
  ) {
    this.totalBrightnessFactor.set(1, 1, 1);

    const oldRenderTarget = renderer.getRenderTarget();
    const context = renderer.getContext();

    this.maskActive = maskActive;

    if (maskActive) context.disable(context.STENCIL_TEST);

    this.downsampleAll(renderer, readBuffer);
    this.upsampleAll(renderer);

    if (readBuffer.texture.format === THREE.RGBAFormat) {
      context.colorMask(true, true, true, true);
    }
    renderer.setRenderTarget(oldRenderTarget);
  }
}
