import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';
import type { Materials } from './materials';
import { LAYOUT } from './types';

interface LeverProps {
  pullId: number;
  onPull: () => void;
  materials: Materials;
}

const REST = -0.12;
const PULLED = 1.2;
const HOLD_MS = 260;

export function Lever3D({ pullId, onPull, materials: m }: LeverProps) {
  const arm = useRef<Group>(null);
  const st = useRef({ angle: REST, vel: 0, pulledAt: -1, lastId: pullId });

  useFrame((_, delta) => {
    const s = st.current;
    const now = performance.now();
    if (pullId !== s.lastId) {
      s.lastId = pullId;
      s.pulledAt = now;
    }
    const pulling = s.pulledAt > 0 && now - s.pulledAt < HOLD_MS;
    const target = pulling ? PULLED : REST;
    const k = pulling ? 260 : 70;
    const c = pulling ? 22 : 7;
    const dt = Math.min(delta, 1 / 30);
    s.vel += ((target - s.angle) * k - s.vel * c) * dt;
    s.angle += s.vel * dt;
    if (arm.current) arm.current.rotation.x = s.angle;
  });

  const handleDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onPull();
  };
  const setCursor = (c: string) => () => {
    document.body.style.cursor = c;
  };

  const x = LAYOUT.bodyW / 2 + 0.14;

  return (
    <group position={[x, -0.35, LAYOUT.bodyZ]}>
      <mesh rotation={[0, 0, Math.PI / 2]} material={m.chrome}>
        <cylinderGeometry args={[0.16, 0.16, 0.26, 32]} />
      </mesh>
      <mesh position={[0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={m.gold}>
        <cylinderGeometry args={[0.11, 0.11, 0.06, 32]} />
      </mesh>

      <group ref={arm} onPointerDown={handleDown} onPointerOver={setCursor('pointer')} onPointerOut={setCursor('')}>
        <mesh position={[0, 0.7, 0]} material={m.chrome}>
          <cylinderGeometry args={[0.035, 0.045, 1.4, 20]} />
        </mesh>
        <mesh position={[0, 1.45, 0]} material={m.ball}>
          <sphereGeometry args={[0.18, 48, 32]} />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <sphereGeometry args={[0.5, 12, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}
