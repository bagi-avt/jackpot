import type { MutableRefObject } from 'react';

export interface FxState {
  spinning: boolean;
  winAt: number;
}

export type FxRef = MutableRefObject<FxState>;

export const LAYOUT = {
  windowW: 2.3,
  windowH: 1.0,
  reelRadius: 0.62,
  reelGap: 0.05,
  reelZ: -0.2,
  frontZ: 0.45,
  bodyW: 2.9,
  bodyD: 1.5,
  bodyZ: -0.3,
} as const;
