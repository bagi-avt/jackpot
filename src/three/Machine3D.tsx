import { ContactShadows } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useEffect, useRef } from 'react';
import { PMREMGenerator, type PerspectiveCamera, Vector3 } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { SpinPlan } from '../hooks/useSlotMachine';
import { Cabinet } from './Cabinet';
import { Coins } from './Coins';
import { Lever3D } from './Lever3D';
import { useMaterials } from './materials';
import { ReelBank } from './Reels3D';
import type { FxState } from './types';

function StudioEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.6;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function CameraRig() {
  const { camera, size, pointer } = useThree();
  const target = useRef(new Vector3());

  useFrame(({ clock }) => {
    const cam = camera as PerspectiveCamera;
    const aspect = size.width / Math.max(size.height, 1);
    const tanV = Math.tan((cam.fov * Math.PI) / 360);
    const dist = Math.max(2.25 / tanV, 2.0 / (tanV * aspect));
    const t = clock.elapsedTime;
    target.current.set(
      pointer.x * 0.45 + Math.sin(t * 0.35) * 0.12,
      0.15 + pointer.y * 0.25 + Math.sin(t * 0.5) * 0.04,
      dist,
    );
    cam.position.lerp(target.current, 0.05);
    cam.lookAt(0, 0.05, 0);
  });
  return null;
}

function Scene({ digits, plan, onPull, fx }: Machine3DProps & { fx: React.MutableRefObject<FxState> }) {
  const materials = useMaterials();
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials]);

  return (
    <>
      <color attach="background" args={['#0c0504']} />
      <fog attach="fog" args={['#0c0504', 10, 22]} />
      <StudioEnvironment />
      <CameraRig />

      <ambientLight intensity={0.12} />
      <directionalLight position={[3, 5, 6]} intensity={1.1} color="#fff1dc" />
      <spotLight position={[0, 2.6, 4.5]} angle={0.42} penumbra={0.9} intensity={16} color="#fff4e0" />
      <pointLight position={[-3.5, 1.5, -1.5]} intensity={18} distance={10} color="#ff3040" />
      <pointLight position={[3.5, 2.5, -1.5]} intensity={14} distance={10} color="#ffb040" />

      <group position={[-0.12, -0.15, 0]}>
        <Cabinet materials={materials} fx={fx} />
        <ReelBank digits={digits} plan={plan} materials={materials} />
        <Lever3D pullId={plan?.id ?? 0} onPull={onPull} materials={materials} />
        <Coins fx={fx} materials={materials} />
      </group>

      <ContactShadows position={[0, -2.3, 0]} opacity={0.75} scale={8} blur={2.6} far={3} resolution={512} color="#000000" />

      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.85} radius={0.7} />
        <Vignette offset={0.25} darkness={0.75} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </>
  );
}

export interface Machine3DProps {
  digits: string;
  plan: SpinPlan | null;
  spinning: boolean;
  done: boolean;
  onPull: () => void;
}

export default function Machine3D(props: Machine3DProps) {
  const fx = useRef<FxState>({ spinning: false, winAt: -1 });

  useEffect(() => {
    fx.current.spinning = props.spinning;
  }, [props.spinning]);
  useEffect(() => {
    if (props.done) fx.current.winAt = performance.now();
  }, [props.done]);

  return (
    <Canvas
      className="stage__canvas"
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: 30, position: [0, 0.2, 10], near: 0.1, far: 50 }}
      aria-label="Слот-машина. Потяните рычаг, чтобы запустить барабаны"
    >
      <Scene {...props} fx={fx} />
    </Canvas>
  );
}
