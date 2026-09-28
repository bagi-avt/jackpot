import { lazy, Suspense, useMemo } from 'react';
import { BalancePanel } from './components/BalancePanel';
import { Bulbs } from './components/Bulbs';
import { Lever } from './components/Lever';
import { Reels } from './components/Reels';
import { useSlotMachine } from './hooks/useSlotMachine';
import { useUrlConfig } from './hooks/useUrlConfig';
import { formatMoney, maskMoney } from './lib/money';
import { hasWebGL, waitForFont } from './lib/webgl';

const Machine3D = lazy(async () => {
  await waitForFont('Russo One');
  return import('./three/Machine3D');
});

export function App() {
  const { balance, money } = useUrlConfig();
  const target = String(balance);
  const webgl = useMemo(hasWebGL, []);

  const { reels, spinning, done, plan, spin } = useSlotMachine(
    target,
    webgl
      ? { randomize: false, firstStopMs: 1500, stopStepMs: 330, settleMs: 250 }
      : { randomize: true },
  );

  const formatted = useMemo(() => formatMoney(balance, money), [balance, money]);
  const masked = useMemo(() => maskMoney(formatted), [formatted]);
  const buttonLabel = spinning ? 'КРУТИМ…' : done ? 'ЕЩЁ РАЗ' : 'КРУТИТЬ';

  const machine2D = (
    <div className="machine-row">
      <div className="machine">
        <Bulbs />
        <Reels reels={reels} />
        <Bulbs offset={1} />
      </div>
      <Lever onPull={spin} disabled={spinning} />
    </div>
  );

  return (
    <main className={webgl ? 'page page--3d' : 'page'}>
      <header className="head">
        <div className="head__kicker">★ ★ ★ ИГРА УДАЧИ ★ ★ ★</div>
        <h1 className={webgl ? 'visually-hidden' : 'head__title'}>ДЖЕКПОТ</h1>
        <p className="head__sub">Потяни рычаг — узнай баланс на карте</p>
      </header>

      {webgl ? (
        <div className="stage">
          <Suspense fallback={<div className="stage__loading">Заряжаем автомат…</div>}>
            <Machine3D digits={target} plan={plan} spinning={spinning} done={done} onPull={spin} />
          </Suspense>
        </div>
      ) : (
        machine2D
      )}

      <BalancePanel done={done} spinning={spinning} formatted={formatted} masked={masked} />

      <button type="button" className="spin-btn" onClick={spin} disabled={spinning}>
        {buttonLabel}
      </button>

      <footer className="foot">Только развлечение: барабаны показывают ваш баланс</footer>
    </main>
  );
}
