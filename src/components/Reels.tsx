import type { Reel } from '../hooks/useSlotMachine';

interface ReelsProps {
  reels: Reel[];
}

const WINDOW_WIDTH = 270;
const GAP = 4;

export function Reels({ reels }: ReelsProps) {
  const n = Math.max(reels.length, 1);
  const reelWidth = Math.min(40, (WINDOW_WIDTH - (n - 1) * GAP) / n);
  const fontSize = Math.max(16, Math.round(reelWidth * 0.9));

  return (
    <div className="reels" aria-hidden="true">
      {reels.map((reel, i) => (
        <div key={i} className="reel">
          <span className={`digit digit--${reel.state}`} style={{ fontSize }}>
            {reel.digit}
          </span>
        </div>
      ))}
    </div>
  );
}
