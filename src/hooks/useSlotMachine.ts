import { useCallback, useEffect, useRef, useState } from 'react';

export type ReelState = 'idle' | 'spinning' | 'landed';

export interface Reel {
  digit: string;
  state: ReelState;
}

export interface SlotMachineOptions {
  tickMs?: number;
  firstStopMs?: number;
  stopStepMs?: number;
}

const randomDigit = () => String(Math.floor(Math.random() * 10));
const vibrate = (ms: number) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(ms);
};

export function useSlotMachine(target: string, opts: SlotMachineOptions = {}) {
  const { tickMs = 70, firstStopMs = 1100, stopStepMs = 280 } = opts;

  const [reels, setReels] = useState<Reel[]>(() =>
    target.split('').map(() => ({ digit: '7', state: 'idle' })),
  );
  const [spinning, setSpinning] = useState(false);
  const [done, setDone] = useState(false);

  const timers = useRef<number[]>([]);
  const interval = useRef<number | null>(null);

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
    if (spinning) return;
    clearAll();
    setSpinning(true);
    setDone(false);
    vibrate(30);

    const digits = target.split('');
    setReels(digits.map(() => ({ digit: randomDigit(), state: 'spinning' })));

    interval.current = window.setInterval(() => {
      setReels((prev) =>
        prev.map((r) => (r.state === 'spinning' ? { ...r, digit: randomDigit() } : r)),
      );
    }, tickMs);

    digits.forEach((digit, idx) => {
      const id = window.setTimeout(() => {
        setReels((prev) => prev.map((r, i) => (i === idx ? { digit, state: 'landed' } : r)));
        vibrate(12);
        if (idx === digits.length - 1) {
          clearAll();
          setSpinning(false);
          setDone(true);
        }
      }, firstStopMs + idx * stopStepMs);
      timers.current.push(id);
    });
  }, [spinning, target, tickMs, firstStopMs, stopStepMs, clearAll]);

  return { reels, spinning, done, spin };
}
