import { Material, Mesh, Scene, Texture } from "three";

export function cleanupScene(scene: Scene) {
  scene.traverse((object) => {
    const geometry = (object as Mesh).geometry;
    if (geometry) {
      geometry.dispose();
    }

    const material = (object as Mesh).material;
    if (!material) return;

    if (Array.isArray(material)) {
      material.forEach(cleanupMaterial);
    } else {
      cleanupMaterial(material);
    }
  });

  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }

  scene.clear();
}

function cleanupMaterial(material: unknown) {
  if (!material || !(material as Material).isMaterial) return;

  const material_ = material as Material;
  Object.values(material_).forEach((value) => {
    if (isTexture(value)) {
      value.dispose();
    }
  });

  try {
    material_.dispose();
  } catch (e) {
    console.warn("Failed to dispose material:", material_, e);
  }
}

function isTexture(value: any) {
  return (
    value && typeof value === "object" && (value as Texture).isTexture === true
  );
}
