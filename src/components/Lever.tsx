import { useEffect, useState } from 'react';

interface LeverProps {
  onPull: () => void;
  disabled?: boolean;
}

export function Lever({ onPull, disabled }: LeverProps) {
  const [pulled, setPulled] = useState(false);

  useEffect(() => {
    if (!pulled) return;
    const id = window.setTimeout(() => setPulled(false), 420);
    return () => window.clearTimeout(id);
  }, [pulled]);

  const handleClick = () => {
    if (disabled) return;
    setPulled(true);
    onPull();
  };

  return (
    <button
      type="button"
      className={pulled ? 'lever lever--pulled' : 'lever'}
      aria-label="Потянуть рычаг"
      aria-disabled={disabled}
      onClick={handleClick}
    >
      <span className="lever__ball" />
      <span className="lever__rod" />
      <span className="lever__base" />
    </button>
  );
}
