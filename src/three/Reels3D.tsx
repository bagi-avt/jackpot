import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { CylinderGeometry, type Mesh, MeshStandardMaterial } from 'three';
import type { SpinPlan } from '../hooks/useSlotMachine';
import {
  digitAngle,
  landingBounce,
  spinProgress,
  targetAngle,
  TAU,
  turnsForDuration,
} from '../lib/reelMath';
import type { Materials } from './materials';
import { createReelTextures } from './textures';
import { LAYOUT } from './types';

interface ReelProps {
  index: number;
  digit: number;
  plan: SpinPlan | null;
  x: number;
  geometry: CylinderGeometry;
  sideMaterial: MeshStandardMaterial;
  capMaterial: MeshStandardMaterial;
  textures: ReturnType<typeof createReelTextures>;
}

const BLUR_SPEED = 7;

function Reel({ index, digit, plan, x, geometry, sideMaterial, capMaterial, textures }: ReelProps) {
  const mesh = useRef<Mesh>(null);
  const st = useRef({
    angle: digitAngle(7),
    from: 0,
    to: 0,
    start: 0,
    dur: 0,
    active: false,
    landedAt: -1,
    planId: -1,
    prev: digitAngle(7),
  });

  useFrame((_, delta) => {
    const s = st.current;
    const now = performance.now();

    if (plan && plan.id !== s.planId) {
      s.planId = plan.id;
      s.from = s.angle % TAU;
      s.dur = plan.durations[index] ?? 1000;
      s.to = targetAngle(s.from, digit, turnsForDuration(s.dur));
      s.start = plan.startedAt;
      s.active = true;
      s.landedAt = -1;
    }

    let angle = s.angle;
    if (s.active) {
      const t = (now - s.start) / s.dur;
      if (t >= 1) {
        s.active = false;
        s.angle = s.to;
        s.landedAt = now;
        angle = s.to;
      } else {
        angle = s.from + (s.to - s.from) * spinProgress(t);
      }
    }
    if (s.landedAt > 0) angle += landingBounce((now - s.landedAt) / 1000);

    const speed = delta > 0 ? Math.abs(angle - s.prev) / delta : 0;
    s.prev = angle;

    if (mesh.current) mesh.current.rotation.x = angle;
    const map = speed > BLUR_SPEED ? textures.blur : textures.sharp;
    if (sideMaterial.map !== map) sideMaterial.map = map;
  });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      material={[sideMaterial, capMaterial, capMaterial]}
      position={[x, 0, LAYOUT.reelZ]}
    />
  );
}

interface ReelBankProps {
  digits: string;
  plan: SpinPlan | null;
  materials: Materials;
}

export function ReelBank({ digits, plan, materials }: ReelBankProps) {
  const n = Math.max(digits.length, 1);
  const { windowW, reelGap, reelRadius } = LAYOUT;
  const width = (windowW - (n - 1) * reelGap) / n;

  const textures = useMemo(() => createReelTextures(reelRadius, width), [reelRadius, width]);
  useEffect(
    () => () => {
      textures.sharp.dispose();
      textures.blur.dispose();
    },
    [textures],
  );

  const geometry = useMemo(() => {
    const g = new CylinderGeometry(reelRadius, reelRadius, width, 96, 1, false);
    g.rotateZ(-Math.PI / 2);
    return g;
  }, [reelRadius, width]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const sideMaterials = useMemo(
    () =>
      Array.from(
        { length: n },
        () => new MeshStandardMaterial({ map: textures.sharp, roughness: 0.55, metalness: 0, envMapIntensity: 0.5 }),
      ),
    [n, textures],
  );
  useEffect(() => () => sideMaterials.forEach((m) => m.dispose()), [sideMaterials]);

  return (
    <group>
      {digits.split('').map((ch, i) => (
        <Reel
          key={i}
          index={i}
          digit={Number(ch)}
          plan={plan}
          x={-windowW / 2 + width / 2 + i * (width + reelGap)}
          geometry={geometry}
          sideMaterial={sideMaterials[i] ?? sideMaterials[0]!}
          capMaterial={materials.gold}
          textures={textures}
        />
      ))}
    </group>
  );
}
