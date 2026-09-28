import { useMemo } from 'react';
import { BalancePanel } from './components/BalancePanel';
import { Bulbs } from './components/Bulbs';
import { Lever } from './components/Lever';
import { Reels } from './components/Reels';
import { useSlotMachine } from './hooks/useSlotMachine';
import { useUrlConfig } from './hooks/useUrlConfig';
import { formatMoney, maskMoney } from './lib/money';

export function App() {
  const { balance, money } = useUrlConfig();
  const target = String(balance);
  const { reels, spinning, done, spin } = useSlotMachine(target);

  const formatted = useMemo(() => formatMoney(balance, money), [balance, money]);
  const masked = useMemo(() => maskMoney(formatted), [formatted]);

  const buttonLabel = spinning ? 'КРУТИМ…' : done ? 'ЕЩЁ РАЗ' : 'КРУТИТЬ';

  return (
    <main className="page">
      <header className="head">
        <div className="head__kicker">★ ★ ★ ИГРА УДАЧИ ★ ★ ★</div>
        <h1 className="head__title">ДЖЕКПОТ</h1>
        <p className="head__sub">Потяни рычаг — узнай баланс на карте</p>
      </header>

      <div className="machine-row">
        <div className="machine">
          <Bulbs />
          <Reels reels={reels} />
          <Bulbs offset={1} />
        </div>
        <Lever onPull={spin} disabled={spinning} />
      </div>

      <BalancePanel done={done} spinning={spinning} formatted={formatted} masked={masked} />

      <button type="button" className="spin-btn" onClick={spin} disabled={spinning}>
        {buttonLabel}
      </button>

      <footer className="foot">Только развлечение: барабаны показывают ваш баланс</footer>
    </main>
  );
}
