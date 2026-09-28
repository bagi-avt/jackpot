export const TAU = Math.PI * 2;
export const DIGITS = 10;
export const STEP = TAU / DIGITS;

export function digitAngle(d: number): number {
  return d * STEP;
}

export function targetAngle(from: number, digit: number, minTurns: number): number {
  const base = digitAngle(digit);
  const k = Math.ceil((from + minTurns * TAU - base) / TAU);
  return base + k * TAU;
}

export function spinProgress(t: number, accel = 0.12, decel = 0.35): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const cruise = 1 - accel - decel;
  const v = 1 / (accel / 2 + cruise + decel / 3);
  if (t < accel) return (v * t * t) / (2 * accel);
  if (t < 1 - decel) return v * (accel / 2 + (t - accel));
  const s = (t - (1 - decel)) / decel;
  return v * (accel / 2 + cruise + (decel * (1 - (1 - s) ** 3)) / 3);
}

export function landingBounce(tau: number, amplitude = 0.07): number {
  if (tau <= 0 || tau > 0.9) return 0;
  return amplitude * Math.exp(-7 * tau) * Math.sin(18 * tau);
}

export function turnsForDuration(ms: number): number {
  return Math.max(2, Math.round((ms / 1000) * 3));
}
