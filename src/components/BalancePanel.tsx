interface BalancePanelProps {
  done: boolean;
  spinning: boolean;
  formatted: string;
  masked: string;
}

export function BalancePanel({ done, spinning, formatted, masked }: BalancePanelProps) {
  const status = spinning
    ? 'Барабаны крутятся…'
    : done
      ? 'Удача на вашей стороне!'
      : 'Жми рычаг или кнопку ниже';

  return (
    <section className="panel" aria-live="polite">
      <div className="panel__label">Баланс на карте</div>
      <div key={done ? 'win' : 'hidden'} className={done ? 'amount amount--win' : 'amount'}>
        {done ? formatted : masked}
      </div>
      <div className="panel__status">{status}</div>
    </section>
  );
}
