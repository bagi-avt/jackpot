import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { CylinderGeometry, type InstancedMesh, Object3D } from 'three';
import type { Materials } from './materials';
import { LAYOUT, type FxRef } from './types';

const COUNT = 40;
const LIFE = 2.6;
const GRAVITY = -9.5;

interface CoinsProps {
  fx: FxRef;
  materials: Materials;
}

export function Coins({ fx, materials }: CoinsProps) {
  const mesh = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => new CylinderGeometry(0.13, 0.13, 0.028, 28), []);
  const dummy = useMemo(() => new Object3D(), []);
  const st = useRef({
    lastWin: -1,
    start: 0,
    p: new Float32Array(COUNT * 3),
    v: new Float32Array(COUNT * 3),
    r: new Float32Array(COUNT * 3),
    w: new Float32Array(COUNT * 3),
    delay: new Float32Array(COUNT),
  });

  useFrame((_, delta) => {
    const s = st.current;
    const inst = mesh.current;
    if (!inst) return;

    if (fx.current.winAt > 0 && fx.current.winAt !== s.lastWin) {
      s.lastWin = fx.current.winAt;
      s.start = performance.now();
      for (let i = 0; i < COUNT; i++) {
        s.p.set([(Math.random() - 0.5) * 1.0, -1.35, LAYOUT.frontZ + 0.2], i * 3);
        s.v.set(
          [(Math.random() - 0.5) * 3.2, 3.5 + Math.random() * 3.2, 1 + Math.random() * 1.6],
          i * 3,
        );
        s.r.set([Math.random() * 6, Math.random() * 6, Math.random() * 6], i * 3);
        s.w.set([(Math.random() - 0.5) * 18, (Math.random() - 0.5) * 18, (Math.random() - 0.5) * 18], i * 3);
        s.delay[i] = Math.random() * 0.6;
      }
    }

    const age = (performance.now() - s.start) / 1000;
    const alive = s.lastWin > 0 && age < LIFE + 0.6;
    const dt = Math.min(delta, 1 / 30);

    for (let i = 0; i < COUNT; i++) {
      const o = i * 3;
      const local = age - (s.delay[i] ?? 0);
      if (!alive || local < 0 || local > LIFE) {
        dummy.scale.setScalar(0);
      } else {
        s.v[o + 1]! += GRAVITY * dt;
        for (let k = 0; k < 3; k++) {
          s.p[o + k]! += s.v[o + k]! * dt;
          s.r[o + k]! += s.w[o + k]! * dt;
        }
        dummy.position.set(s.p[o]!, s.p[o + 1]!, s.p[o + 2]!);
        dummy.rotation.set(s.r[o]!, s.r[o + 1]!, s.r[o + 2]!);
        dummy.scale.setScalar(1);
      }
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[geometry, materials.gold, COUNT]} frustumCulled={false} />;
}
