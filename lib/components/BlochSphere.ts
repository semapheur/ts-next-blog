import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI, GUIController } from "dat.gui";
import { gridSphere } from "lib/utils/3d";

type vec3 = [number, number, number];
export type Gate = "H" | "X" | "Y" | "Z";

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

interface Options {
  wrapper: HTMLDivElement;
  canvas: HTMLCanvasElement;
  label: HTMLDivElement;
}

export class BlochSphere {
  #wrapper: HTMLDivElement;
  #label: HTMLDivElement;

  #renderer: THREE.WebGLRenderer;
  #scene = new THREE.Scene();
  #camera: THREE.PerspectiveCamera;
  #controls: OrbitControls;
  #gui: GUI;
  #thetaCtrl!: GUIController;
  #phiCtrl!: GUIController;
  #qubitArrow: THREE.ArrowHelper | null = null;

  #frameId = 0;
  #theta = Math.PI / 2;
  #phi = 0;

  constructor({ wrapper, canvas, label }: Options) {
    this.#wrapper = wrapper;
    this.#label = label;

    const { width, height } = wrapper.getBoundingClientRect();

    this.#renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.#renderer.setPixelRatio(window.devicePixelRatio);
    this.#renderer.setSize(width, height);

    this.#camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.#camera.position.set(2, 2, 2);

    this.#controls = new OrbitControls(this.#camera, this.#renderer.domElement);
    this.#controls.enableDamping = true;
    this.#controls.dampingFactor = 0.05;
    this.#controls.rotateSpeed = 0.5;

    this.#buildScene();
    this.#gui = this.#buildGui();

    window.addEventListener("resize", this.#onResize);

    this.updateQubit();
    this.#animate();
  }

  #buildScene() {
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(5, 5, 5);
    this.#scene.add(light);

    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
    });
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });
    this.#scene.add(gridSphere(1, 12, 12, sphereMaterial, lineMaterial));

    this.#scene.add(this.#createAxis(0xff0000, [-1, 0, 0], [1, 0, 0]));
    this.#scene.add(this.#createAxis(0x00ff00, [0, -1, 0], [0, 1, 0]));
    this.#scene.add(this.#createAxis(0x0000ff, [0, 0, -1], [0, 0, 1]));

    this.#createLabel("|i⟩", [1.1, 0, 0]);
    this.#createLabel("|-i⟩", [-1.1, 0, 0]);
    this.#createLabel("|1⟩", [0, -1.1, 0]);
    this.#createLabel("|0⟩", [0, 1.1, 0]);
    this.#createLabel("|+⟩", [0, 0, 1.1]);
    this.#createLabel("|-⟩", [0, 0, -1.1]);
  }

  #createAxis(color: number, from: vec3, to: vec3) {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const dir = end.clone().sub(start).normalize();
    return new THREE.ArrowHelper(
      dir,
      start,
      end.distanceTo(start),
      color,
      0.1,
      0.05,
    );
  }

  #createLabel(text: string, position: vec3) {
    const canvas2d = document.createElement("canvas");
    const ctx = canvas2d.getContext("2d");
    if (!ctx) return;

    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas2d.width / 2, canvas2d.height / 2);

    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas2d) }),
    );
    sprite.scale.set(0.6, 0.3, 1);
    sprite.position.set(...position);
    this.#scene.add(sprite);
  }

  #buildGui() {
    // autoPlace: false so dat.gui doesn't try to remove the element from its
    // own container on destroy() (that's likely why destroy() was failing for you)
    const gui = new GUI({ autoPlace: false });
    gui.domElement.style.position = "absolute";
    gui.domElement.style.right = "1rem";
    gui.domElement.style.top = "1rem";
    this.#wrapper.appendChild(gui.domElement);

    const params = {
      theta: this.#theta * RAD2DEG,
      phi: this.#phi * RAD2DEG,
      x_gate: () => this.applyGate("X"),
      y_gate: () => this.applyGate("Y"),
      z_gate: () => this.applyGate("Z"),
      h_gate: () => this.applyGate("H"),
    };

    this.#thetaCtrl = gui
      .add(params, "theta", 0, 180)
      .name("θ (polar angle)")
      .onChange((v: number) => this.#setAngles(v * DEG2RAD, this.#phi));
    this.#phiCtrl = gui
      .add(params, "phi", 0, 360)
      .name("ϕ (azimuth angle)")
      .onChange((v: number) => this.#setAngles(this.#theta, v * DEG2RAD));

    gui.add(params, "x_gate").name("X gate");
    gui.add(params, "y_gate").name("Y gate");
    gui.add(params, "z_gate").name("Z gate");
    gui.add(params, "h_gate").name("H gate");

    return gui;
  }

  #setAngles(theta: number, phi: number) {
    this.#theta = theta;
    this.#phi = ((phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    this.updateQubit();
  }

  public applyGate(gate: Gate) {
    // Work in Bloch coordinates (bx, by, bz), then convert back to angles
    const bx = Math.sin(this.#theta) * Math.cos(this.#phi);
    const by = Math.sin(this.#theta) * Math.sin(this.#phi);
    const bz = Math.cos(this.#theta);

    let n: vec3;
    switch (gate) {
      case "X":
        n = [bx, -by, -bz];
        break;
      case "Y":
        n = [-bx, by, -bz];
        break;
      case "Z":
        n = [-bx, -by, bz];
        break;
      case "H":
        n = [bz, -by, bx];
        break;
    }

    const theta = Math.acos(Math.min(1, Math.max(-1, n[2])));
    const phi = Math.atan2(n[1], n[0]);
    this.#setAngles(theta, phi);

    // push new values back into the sliders
    this.#thetaCtrl.setValue(this.#theta * RAD2DEG);
    this.#phiCtrl.setValue(this.#phi * RAD2DEG);
  }

  private updateQubit() {
    if (this.#qubitArrow) {
      this.#scene.remove(this.#qubitArrow);
      this.#qubitArrow.dispose();
    }

    const dir = new THREE.Vector3(
      Math.sin(this.#theta) * Math.sin(this.#phi), // x
      Math.cos(this.#theta), // y
      Math.sin(this.#theta) * Math.cos(this.#phi), // z
    ).normalize();

    this.#qubitArrow = new THREE.ArrowHelper(
      dir,
      new THREE.Vector3(),
      1,
      0xffff00,
    );
    this.#scene.add(this.#qubitArrow);

    this.#updateLabel();
  }

  #updateLabel() {
    const alpha = Math.cos(this.#theta / 2);
    const mag = Math.sin(this.#theta / 2);
    const re = mag * Math.cos(this.#phi);
    const im = mag * Math.sin(this.#phi);
    const beta = `${re.toFixed(2)}${im >= 0 ? "+" : ""}${im.toFixed(2)}i`;
    this.#label.innerText = `Qubit state: ${alpha.toFixed(2)}|0⟩ + (${beta})|1⟩`;
  }

  #onResize = () => {
    const { width, height } = this.#wrapper.getBoundingClientRect();
    this.#camera.aspect = width / height;
    this.#camera.updateProjectionMatrix();
    this.#renderer.setSize(width, height);
  };

  #animate = () => {
    this.#frameId = requestAnimationFrame(this.#animate);
    this.#controls.update();
    this.#renderer.render(this.#scene, this.#camera);
  };

  public dispose() {
    cancelAnimationFrame(this.#frameId);
    window.removeEventListener("resize", this.#onResize);

    this.#controls.dispose();
    this.#gui.destroy();
    this.#gui.domElement.remove();

    this.#scene.traverse((obj) => {
      if (
        obj instanceof THREE.Mesh ||
        obj instanceof THREE.Line ||
        obj instanceof THREE.Sprite
      ) {
        (obj as THREE.Mesh).geometry?.dispose();
        const mat = (obj as THREE.Mesh).material;
        [mat].flat().forEach((m) => {
          (m as THREE.SpriteMaterial).map?.dispose();
          m.dispose();
        });
      }
    });
    this.#renderer.dispose();
  }
}
