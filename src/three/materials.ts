import { useMemo } from 'react';
import { Color, MeshPhysicalMaterial, MeshStandardMaterial } from 'three';

export function useMaterials() {
  return useMemo(
    () => ({
      lacquer: new MeshPhysicalMaterial({
        color: new Color('#7a0f16'),
        roughness: 0.32,
        metalness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
      }),
      lacquerDark: new MeshPhysicalMaterial({
        color: new Color('#3a070b'),
        roughness: 0.4,
        clearcoat: 0.6,
        clearcoatRoughness: 0.15,
      }),
      gold: new MeshStandardMaterial({ color: new Color('#d9a441'), metalness: 1, roughness: 0.22 }),
      chrome: new MeshStandardMaterial({ color: new Color('#e8e8ec'), metalness: 1, roughness: 0.08 }),
      inner: new MeshStandardMaterial({ color: new Color('#0a0404'), roughness: 0.9 }),
      glass: new MeshPhysicalMaterial({
        color: new Color('#ffffff'),
        transparent: true,
        opacity: 0.06,
        roughness: 0.02,
        metalness: 0,
        clearcoat: 1,
        envMapIntensity: 2,
        depthWrite: false,
      }),
      payline: new MeshStandardMaterial({
        color: new Color('#ff2a3a'),
        emissive: new Color('#ff2a3a'),
        emissiveIntensity: 2.2,
        transparent: true,
        opacity: 0.85,
      }),
      ball: new MeshPhysicalMaterial({
        color: new Color('#c8102e'),
        roughness: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
      }),
    }),
    [],
  );
}

export type Materials = ReturnType<typeof useMaterials>;
