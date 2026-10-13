"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useTexture } from "@react-three/drei";
import { Box3, ShaderMaterial, SRGBColorSpace, Vector3, type Group, type Material, type Mesh, type Object3D } from "three";
import { buildLaptop } from "./model";
import { getLaptopNodes } from "./nodes";
import { screenBlend } from "./screen";
import { SCREENS } from "./screens";
import { LID_OPEN, type LivePose } from "./stations";

type RigProps = { pose: LivePose; onReady?: () => void };

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Crossfades two screen textures; unlit so the display reads as emissive.
const fragmentShader = /* glsl */ `
  uniform sampler2D mapA;
  uniform sampler2D mapB;
  uniform float mixAmt;
  varying vec2 vUv;
  void main() {
    gl_FragColor = mix(texture2D(mapA, vUv), texture2D(mapB, vUv), mixAmt);
    #include <colorspace_fragment>
  }
`;

function Rig({ root, pose, onReady }: RigProps & { root: Object3D }) {
  const groupRef = useRef<Group>(null);
  const viewport = useThree((s) => s.viewport);
  const textures = useTexture(SCREENS);
  const { lid, screen } = useMemo(() => getLaptopNodes(root), [root]);

  // Normalise to 1 world unit wide so Pose.scale maps straight to viewport
  // width. Measured detached and closed: a remount may find the model still
  // parented or with the lid open.
  const unit = useMemo(() => {
    root.removeFromParent();
    lid.rotation.x = 0;
    root.updateMatrixWorld(true);
    return 1 / new Box3().setFromObject(root).getSize(new Vector3()).x;
  }, [root, lid]);

  const material = useMemo(() => {
    for (const t of textures) {
      t.colorSpace = SRGBColorSpace;
      t.flipY = false; // the Screen UVs put v = 0 at the image top (model.ts)
      t.needsUpdate = true;
    }
    return new ShaderMaterial({
      uniforms: {
        mapA: { value: textures[0] },
        mapB: { value: textures[0] },
        mixAmt: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      toneMapped: false,
    });
  }, [textures]);

  useEffect(() => {
    screen.material = material;
    return () => material.dispose();
  }, [screen, material]);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    g.position.set(pose.x * viewport.width, (pose.y - pose.rise) * viewport.height, 0);
    g.rotation.set(pose.rotX, pose.rotY, 0);
    g.scale.setScalar(pose.scale * viewport.width);
    lid.rotation.x = pose.lid * LID_OPEN;
    const { a, b, mix } = screenBlend(pose.screen, textures.length);
    material.uniforms.mapA.value = textures[a];
    material.uniforms.mapB.value = textures[b];
    material.uniforms.mixAmt.value = mix;
  });

  return (
    <group ref={groupRef}>
      <group scale={unit}>
        <primitive object={root} />
      </group>
    </group>
  );
}

/** Frees the model's GPU buffers; three re-uploads them if the model is shown again. */
function disposeTree(root: Object3D) {
  root.traverse((o) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m: Material) => m.dispose());
  });
}

/** The guide laptop. Suspends while the screens load. */
export default function Laptop(props: RigProps) {
  const root = useMemo(buildLaptop, []);
  useEffect(() => () => disposeTree(root), [root]);
  return <Rig root={root} {...props} />;
}

/** Key light plus a procedural studio environment - no HDR download. */
export function Studio() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2} position={[0, 3, 4]} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={1} position={[-4, 1, 2]} rotation-y={Math.PI / 2} scale={[4, 2, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#7fd4ff" position={[4, 2, -2]} scale={2} />
      </Environment>
    </>
  );
}
