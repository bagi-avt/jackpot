interface BulbsProps {
  count?: number;
  offset?: 0 | 1;
}

export function Bulbs({ count = 11, offset = 0 }: BulbsProps) {
  return (
    <div className="bulbs" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={(i + offset) % 2 ? 'bulb bulb--alt' : 'bulb'} />
      ))}
    </div>
  );
}
