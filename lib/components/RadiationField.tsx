"use client";

import useIsMounted from "lib/hooks/useIsMounted";
import { type InstancedArrow, instancedQuiverGrid } from "lib/utils/3d";
import { useEffect, useRef } from "react";
import * as THREE from "three/webgpu";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { cleanupScene } from "lib/utils/three_utils";

// $$ \mathbb{E}_\text{rad} (\mathbb{r}, t) = \frac{-q}{4\pi\epsilon_0 c^2} \frac{1}{\lVert\mathbb{r}\rVert} \mathbb{a}_\perp (t - \frac{\lVert\mathbb{r}\rVert}{c}) $$

interface ChargeInfo {
  chargeStrength: number;
  initialPosition: THREE.Vector3;
  orbit: (out: THREE.Vector3, time: number) => THREE.Vector3;
}

export default function RadiationField() {
  const isMounted = useIsMounted();

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isMounted) return;

    let isEffectActive = true;
    let renderer: THREE.WebGPURenderer;
    let scene: THREE.Scene;
    let observer: ResizeObserver;
    let animationFrameId: number;

    const startWebGPU = async () => {
      const wrapper = wrapperRef.current;
      const canvas = canvasRef.current;
      if (!canvas || !wrapper) return;

      const { width, height } = wrapper.getBoundingClientRect();

      renderer = new THREE.WebGPURenderer({
        canvas,
        antialias: true,
      });

      try {
        await renderer.init();
        if (!isEffectActive) return;
      } catch (e) {
        console.error("WebGPU not supported", e);
        return;
      }

      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);

      // Scene
      scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(0, 0, 10);
      camera.lookAt(0, 0, 0);

      // Orbit controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.rotateSpeed = 0.5;

      // Light
      //const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
      //scene.add(ambientLight);

      // Quiver
      const gridSize = 10;
      const gridStep = 0.4;
      const quiverLength = 2;
      const vectorField = (x: number, y: number) => {
        return new THREE.Vector3(0, 0, 1);
      };
      const quivers = instancedQuiverGrid(
        scene,
        gridSize,
        gridStep,
        vectorField,
        quiverLength,
        0xaddfff,
      );
      const grid = new THREE.GridHelper(20, 10, 0x888888, 0x888888);
      grid.rotation.x = Math.PI / 2;
      scene.add(grid);

      // Charges
      const createChargedParticle = (
        chargeStrength: number,
        position: THREE.Vector3,
        orbit: (out: THREE.Vector3, time: number) => THREE.Vector3,
      ) => {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const color = chargeStrength > 0 ? 0xe74c3c : 0x2e86c1;
        const material = new THREE.MeshBasicMaterial({ color });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(position);

        sphere.userData.chargeInfo = {
          chargeStrength,
          initialPosition: position,
          orbit,
        } as ChargeInfo;

        scene.add(sphere);
        return sphere;
      };

      const chargeStrength = 2;
      const frequency = 2 * Math.PI * 0.5;
      const amplitude = 1;

      const chargedParticle = createChargedParticle(
        chargeStrength,
        new THREE.Vector3(0, 0, 0),
        (out, time) => {
          const z = amplitude * Math.cos(frequency * time);
          return out.set(0, 0, z);
        },
      );

      const chargedParticles = [chargedParticle];

      const analyticAcceleration = (out: THREE.Vector3, time: number) => {
        const z = -2 * frequency ** 2 * Math.cos(frequency * time);
        return out.set(0, 0, z);
      };

      const calculateAcceleration = (
        orbitFunction: (t: number) => THREE.Vector3,
        time: number,
        delta = 1e-5,
      ) => {
        // Numerical differentiation to find acceleration
        const posPlus = orbitFunction(time + delta);
        const pos = orbitFunction(time);
        const posMinus = orbitFunction(time - delta);

        // Second derivative approximation
        const acceleration = posPlus
          .add(posMinus)
          .sub(pos.multiplyScalar(2))
          .divideScalar(delta * delta);
        return acceleration;
      };

      const transverseAcceleration = (
        out: THREE.Vector3,
        acceleration: THREE.Vector3,
        positionUnit: THREE.Vector3,
      ) => {
        const aDotR = acceleration.dot(positionUnit);
        // a_perp = a - (a·r̂) r̂
        return out.copy(acceleration).addScaledVector(positionUnit, -aDotR);
      };

      const fieldPosition = new THREE.Vector3();
      const chargePosition = new THREE.Vector3();
      const relativePosition = new THREE.Vector3();
      const relativeDirection = new THREE.Vector3();
      const accelerationRetarded = new THREE.Vector3();
      const accelerationPerpendicular = new THREE.Vector3();
      const electricField = new THREE.Vector3();
      const totalElectricField = new THREE.Vector3();

      const c = 2;
      const epsilon0 = 0.25;
      const inv4PiEps0C2 = 1 / (4 * Math.PI * epsilon0 * c * c);

      const electricFieldAtPoint = (
        out: THREE.Vector3,
        point: THREE.Vector3,
        chargeInfo: ChargeInfo,
        time: number,
      ) => {
        chargeInfo.orbit(chargePosition, time);
        relativePosition.copy(point).sub(chargePosition);
        const rLength = relativePosition.length();

        if (rLength < 1e-5) return relativePosition.set(0, 0, 0);

        const timeRetarded = time - rLength / c;
        //const aRetarded = calculateAcceleration(chargeData.orbit, timeRetarded)
        analyticAcceleration(accelerationRetarded, timeRetarded);
        relativeDirection.copy(relativePosition).divideScalar(rLength);
        transverseAcceleration(
          accelerationPerpendicular,
          accelerationRetarded,
          relativeDirection,
        );

        const k = -chargeInfo.chargeStrength * inv4PiEps0C2;
        return out
          .copy(accelerationPerpendicular)
          .multiplyScalar(k)
          .divideScalar(rLength);
      };

      const updateElectricField = (
        quiver: InstancedArrow,
        charges: THREE.Object3D[],
        gridSize: number,
        gridStep: number,
        time: number,
      ) => {
        let index = 0;

        // Loop through the same grid points used when creating the quiver
        for (let x = -gridSize; x <= gridSize; x += gridStep) {
          for (let y = -gridSize; y <= gridSize; y += gridStep) {
            fieldPosition.set(x, y, 0);

            // Calculate total electric field at this position
            totalElectricField.set(0, 0, 0);

            charges.forEach((charge) => {
              const chargeInfo = charge.userData.chargeInfo as ChargeInfo;
              electricFieldAtPoint(
                electricField,
                fieldPosition,
                chargeInfo,
                time,
              );
              totalElectricField.add(electricField);
            });

            // Update the arrow at this index in the instanced quiver
            quiver.setArrowFromVector(index, fieldPosition, totalElectricField);

            index++;
          }
        }
        quiver.finalizeUpdate();
      };

      const updateCharges = (time: number) => {
        chargedParticles.forEach((charge) => {
          const chargeInfo = charge.userData.chargeInfo as ChargeInfo;
          chargeInfo.orbit(chargePosition, time);
          charge.position.copy(chargePosition);
        });
      };

      // Resize
      const handleResize = (entries: ResizeObserverEntry[]) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;

          camera.aspect = width / height;
          camera.updateProjectionMatrix();

          renderer.setSize(width, height, false);
          renderer.setPixelRatio(window.devicePixelRatio);
        }
      };

      observer = new ResizeObserver(handleResize);
      observer.observe(wrapper);

      // Animation
      const timer = new THREE.Timer();

      let lastUpdateTime = 0;
      const updateFrequency = 60; // updates per second
      const updateInterval = 1 / updateFrequency;

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        timer.update();
        const time = timer.getElapsed();
        if (time - lastUpdateTime >= updateInterval) {
          updateCharges(time);
          updateElectricField(
            quivers,
            chargedParticles,
            gridSize,
            gridStep,
            time,
          );
          lastUpdateTime = time;
        }

        controls.update();
        renderer.render(scene, camera);
      };

      animate();
    };

    startWebGPU();

    return () => {
      isEffectActive = false;
      cancelAnimationFrame(animationFrameId);
      if (observer) observer.disconnect();
      if (renderer) renderer.dispose();
      if (scene) cleanupScene(scene);
    };
  }, [isMounted]);

  return (
    <div className="size-full" ref={wrapperRef}>
      <canvas ref={canvasRef} />
    </div>
  );
}
