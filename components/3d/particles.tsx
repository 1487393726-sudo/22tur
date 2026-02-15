"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function ParticleField(props: any) {
  const ref = useRef<THREE.Points>(null!);

  // Generate random points on a sphere surface
  const [positions, colors] = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      // Random point in a box
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color gradient from purple to pink
      // Mix purple (0.6, 0.2, 0.8) and pink (0.9, 0.2, 0.6)
      if (i % 2 === 0) {
        color.setHSL(0.8, 1, 0.6); // Purple-ish
      } else {
        color.setHSL(0.9, 1, 0.6); // Pink-ish
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return [positions, colors];
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]} data-oid="7qk.9ag">
      <Points
        ref={ref}
        positions={positions}
        colors={colors}
        stride={3}
        frustumCulled={false}
        {...props}
        data-oid="27b-6x0"
      >
        <PointMaterial
          transparent
          vertexColors
          size={0.02}
          sizeAttenuation={true}
          depthWrite={false}
          data-oid="7f_..pk"
        />
      </Points>
    </group>
  );
}

export function ParticleBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none opacity-40"
      data-oid="1jjh6ly"
    >
      <Suspense fallback={null} data-oid="dmqkvbk">
        <Canvas camera={{ position: [0, 0, 3] }} data-oid="1bkdz4i">
          <ParticleField data-oid="it9:7-t" />
        </Canvas>
      </Suspense>
    </div>
  );
}
