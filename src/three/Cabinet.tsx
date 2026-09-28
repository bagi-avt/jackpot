import { RoundedBox } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { Color, MeshStandardMaterial } from 'three';
import { Bulbs, rectPerimeter, row } from './Bulbs3D';
import type { Materials } from './materials';
import { createSignTexture } from './textures';
import { LAYOUT, type FxRef } from './types';

interface CabinetProps {
  materials: Materials;
  fx: FxRef;
}

export function Cabinet({ materials: m, fx }: CabinetProps) {
  const { windowW, windowH, bodyW, bodyD, bodyZ, frontZ } = LAYOUT;
  const pillarW = (bodyW - windowW) / 2;
  const topH = 0.55;
  const bottomH = 1.25;
  const topY = windowH / 2 + topH / 2;
  const bottomY = -windowH / 2 - bottomH / 2;

  const signTex = useMemo(() => createSignTexture('ДЖЕКПОТ'), []);
  const signMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color('#160303'),
        emissive: new Color('#ffcf70'),
        emissiveMap: signTex,
        emissiveIntensity: 2.6,
        roughness: 0.55,
      }),
    [signTex],
  );
  useEffect(
    () => () => {
      signTex.dispose();
      signMat.dispose();
    },
    [signTex, signMat],
  );

  const signY = windowH / 2 + topH + 0.5;
  const signZ = bodyZ + 0.26;

  const signBulbs = useMemo(() => rectPerimeter(2.5, 0.84, 0.17, 0, signY, signZ + 0.03), [signY, signZ]);
  const topRow = useMemo(() => row(13, bodyW - 0.4, topY + 0.06, frontZ + 0.02), [bodyW, topY, frontZ]);
  const bottomRow = useMemo(
    () => row(13, bodyW - 0.4, bottomY + bottomH / 2 - 0.16, frontZ + 0.02),
    [bodyW, bottomY, bottomH, frontZ],
  );

  const frameT = 0.06;
  const frameZ = frontZ + 0.02;

  return (
    <group>
      <RoundedBox args={[3.15, 0.22, 1.75]} radius={0.06} smoothness={4} position={[0, bottomY - bottomH / 2 - 0.11, bodyZ]} material={m.gold} />

      <RoundedBox args={[bodyW, bottomH, bodyD]} radius={0.09} smoothness={5} position={[0, bottomY, bodyZ]} material={m.lacquer} />
      <RoundedBox args={[1.5, 0.3, 0.42]} radius={0.05} smoothness={4} position={[0, bottomY - 0.22, frontZ + 0.12]} material={m.chrome} />
      <mesh position={[0, bottomY - 0.19, frontZ + 0.2]}>
        <boxGeometry args={[1.32, 0.18, 0.3]} />
        <primitive object={m.inner} attach="material" />
      </mesh>
      <mesh position={[0, bottomY + 0.2, frontZ + 0.005]} material={m.gold}>
        <boxGeometry args={[bodyW - 0.3, 0.035, 0.02]} />
      </mesh>

      {[-1, 1].map((side) => (
        <RoundedBox
          key={side}
          args={[pillarW, windowH + 0.1, bodyD]}
          radius={0.04}
          smoothness={4}
          position={[side * (windowW / 2 + pillarW / 2), 0, bodyZ]}
          material={m.lacquer}
        />
      ))}

      <RoundedBox args={[bodyW, topH, bodyD]} radius={0.09} smoothness={5} position={[0, topY, bodyZ]} material={m.lacquer} />

      <RoundedBox args={[2.75, 1.0, 0.5]} radius={0.12} smoothness={5} position={[0, signY, bodyZ]} material={m.lacquerDark} />
      <RoundedBox args={[2.62, 0.9, 0.06]} radius={0.05} smoothness={4} position={[0, signY, signZ - 0.02]} material={m.gold} />
      <mesh position={[0, signY, signZ + 0.015]} material={signMat}>
        <planeGeometry args={[2.3, 0.64]} />
      </mesh>
      <Bulbs positions={signBulbs} fx={fx} radius={0.04} />

      <mesh position={[0, 0, -1.0]} material={m.inner}>
        <boxGeometry args={[windowW + 0.05, windowH + 0.05, 0.05]} />
      </mesh>

      <mesh position={[0, windowH / 2 + frameT / 2, frameZ]} material={m.gold}>
        <boxGeometry args={[windowW + frameT * 2, frameT, 0.08]} />
      </mesh>
      <mesh position={[0, -windowH / 2 - frameT / 2, frameZ]} material={m.gold}>
        <boxGeometry args={[windowW + frameT * 2, frameT, 0.08]} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (windowW / 2 + frameT / 2), 0, frameZ]} material={m.gold}>
          <boxGeometry args={[frameT, windowH, 0.08]} />
        </mesh>
      ))}

      <mesh position={[0, 0, frontZ - 0.015]} material={m.payline}>
        <boxGeometry args={[windowW, 0.012, 0.004]} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * (windowW / 2 + 0.12), 0, frontZ + 0.04]}
          rotation={[0, 0, side > 0 ? Math.PI / 2 : -Math.PI / 2]}
          material={m.gold}
        >
          <coneGeometry args={[0.07, 0.14, 3]} />
        </mesh>
      ))}

      <mesh position={[0, 0, frontZ - 0.01]} material={m.glass} renderOrder={2}>
        <planeGeometry args={[windowW, windowH]} />
      </mesh>

      <Bulbs positions={topRow} fx={fx} phase={1} />
      <Bulbs positions={bottomRow} fx={fx} />
    </group>
  );
}
