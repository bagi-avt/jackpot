import { useCallback, useEffect, useRef, useState } from 'react';

export type ReelState = 'idle' | 'spinning' | 'landed';

export interface Reel {
  digit: string;
  state: ReelState;
}

export interface SpinPlan {
  id: number;
  startedAt: number;
  durations: number[];
}

export interface SlotMachineOptions {
  tickMs?: number;
  firstStopMs?: number;
  stopStepMs?: number;
  settleMs?: number;
  randomize?: boolean;
}

const randomDigit = () => String(Math.floor(Math.random() * 10));
const vibrate = (ms: number) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(ms);
};

export function useSlotMachine(target: string, opts: SlotMachineOptions = {}) {
  const { tickMs = 70, firstStopMs = 1100, stopStepMs = 280, settleMs = 0, randomize = true } = opts;

  const [reels, setReels] = useState<Reel[]>(() =>
    target.split('').map(() => ({ digit: '7', state: 'idle' })),
  );
  const [spinning, setSpinning] = useState(false);
  const [done, setDone] = useState(false);
  const [plan, setPlan] = useState<SpinPlan | null>(null);

  const timers = useRef<number[]>([]);
  const interval = useRef<number | null>(null);
  const spinningRef = useRef(false);

  const clearAll = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    if (interval.current !== null) {
      window.clearInterval(interval.current);
      interval.current = null;
    }
  }, []);

  useEffect(() => clearAll, [clearAll]);

  const spin = useCallback(() => {
    if (spinningRef.current) return;
    spinningRef.current = true;
    clearAll();
    setSpinning(true);
    setDone(false);
    vibrate(30);

    const digits = target.split('');
    const durations = digits.map((_, i) => firstStopMs + i * stopStepMs);
    setPlan((prev) => ({ id: (prev?.id ?? 0) + 1, startedAt: performance.now(), durations }));

    if (randomize) {
      setReels(digits.map(() => ({ digit: randomDigit(), state: 'spinning' })));
      interval.current = window.setInterval(() => {
        setReels((prev) =>
          prev.map((r) => (r.state === 'spinning' ? { ...r, digit: randomDigit() } : r)),
        );
      }, tickMs);
    }

    digits.forEach((digit, idx) => {
      const stopMs = durations[idx] ?? firstStopMs;
      timers.current.push(
        window.setTimeout(() => {
          vibrate(12);
          if (randomize) {
            setReels((prev) => prev.map((r, i) => (i === idx ? { digit, state: 'landed' } : r)));
          }
        }, stopMs),
      );
    });

    const last = durations[durations.length - 1] ?? firstStopMs;
    timers.current.push(
      window.setTimeout(() => {
        clearAll();
        spinningRef.current = false;
        setSpinning(false);
        setDone(true);
      }, last + settleMs),
    );
  }, [target, tickMs, firstStopMs, stopStepMs, settleMs, randomize, clearAll]);

  return { reels, spinning, done, plan, spin };
}
