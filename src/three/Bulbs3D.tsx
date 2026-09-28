import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Color, type Mesh, MeshStandardMaterial, SphereGeometry } from 'three';
import type { FxRef } from './types';

interface BulbsProps {
  positions: [number, number, number][];
  fx: FxRef;
  radius?: number;
  phase?: number;
}

const ON = 3.2;
const OFF = 0.15;
const WIN_FLASH_MS = 3500;

export function Bulbs({ positions, fx, radius = 0.045, phase = 0 }: BulbsProps) {
  const geometry = useMemo(() => new SphereGeometry(radius, 16, 12), [radius]);
  const materials = useMemo(
    () =>
      positions.map(
        () =>
          new MeshStandardMaterial({
            color: new Color('#ffe7b0'),
            emissive: new Color('#ffc766'),
            emissiveIntensity: ON,
            roughness: 0.3,
          }),
      ),
    [positions],
  );
  const refs = useRef<(Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const now = performance.now();
    const winning = fx.current.winAt > 0 && now - fx.current.winAt < WIN_FLASH_MS;
    const spinning = fx.current.spinning;

    materials.forEach((m, i) => {
      let on: boolean;
      if (winning) on = Math.floor(t * 8) % 2 === 0;
      else if (spinning) on = (i + Math.floor(t * 16) + phase) % 4 === 0;
      else on = (i + Math.floor(t * 1.6) + phase) % 2 === 0;
      const target = on ? ON : OFF;
      m.emissiveIntensity += (target - m.emissiveIntensity) * 0.35;
    });
  });

  return (
    <group>
      {positions.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={p}
          geometry={geometry}
          material={materials[i]}
        />
      ))}
    </group>
  );
}

export function rectPerimeter(
  w: number,
  h: number,
  step: number,
  cx: number,
  cy: number,
  z: number,
): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const nx = Math.max(2, Math.round(w / step));
  const ny = Math.max(2, Math.round(h / step));
  for (let i = 0; i < nx; i++) pts.push([cx - w / 2 + (i * w) / nx, cy + h / 2, z]);
  for (let i = 0; i < ny; i++) pts.push([cx + w / 2, cy + h / 2 - (i * h) / ny, z]);
  for (let i = 0; i < nx; i++) pts.push([cx + w / 2 - (i * w) / nx, cy - h / 2, z]);
  for (let i = 0; i < ny; i++) pts.push([cx - w / 2, cy - h / 2 + (i * h) / ny, z]);
  return pts;
}

export function row(count: number, width: number, y: number, z: number): [number, number, number][] {
  return Array.from({ length: count }, (_, i) => [-width / 2 + (i * width) / (count - 1), y, z]);
}
