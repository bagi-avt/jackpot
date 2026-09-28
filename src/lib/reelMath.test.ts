import { describe, expect, it } from 'vitest';
import { TAU, digitAngle, landingBounce, spinProgress, targetAngle } from './reelMath';

const mod = (a: number, m: number) => ((a % m) + m) % m;
const offTurn = (a: number) => Math.min(mod(a, TAU), TAU - mod(a, TAU));

describe('targetAngle', () => {
  it.each([0, 1, 5, 7, 9])('останавливается на цифре %i', (d) => {
    const to = targetAngle(1.234, d, 4);
    expect(offTurn(to - digitAngle(d))).toBeCloseTo(0, 9);
  });
  it('делает минимум нужное число оборотов', () => {
    for (const from of [0, 0.5, 3, 10, 100]) {
      expect(targetAngle(from, 3, 4) - from).toBeGreaterThanOrEqual(4 * TAU - 1e-9);
      expect(targetAngle(from, 3, 4) - from).toBeLessThan(5 * TAU);
    }
  });
});

describe('spinProgress', () => {
  it('начинается в 0 и заканчивается в 1', () => {
    expect(spinProgress(0)).toBe(0);
    expect(spinProgress(1)).toBe(1);
  });
  it('монотонно растёт и непрерывен', () => {
    let prev = 0;
    for (let i = 1; i <= 1000; i++) {
      const p = spinProgress(i / 1000);
      expect(p).toBeGreaterThanOrEqual(prev);
      expect(p - prev).toBeLessThan(0.01);
      prev = p;
    }
    expect(prev).toBeCloseTo(1, 6);
  });
});

describe('landingBounce', () => {
  it('гаснет', () => {
    expect(landingBounce(0)).toBe(0);
    expect(Math.abs(landingBounce(0.8))).toBeLessThan(0.005);
    expect(landingBounce(2)).toBe(0);
  });
});
