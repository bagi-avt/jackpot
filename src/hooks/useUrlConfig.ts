import { useMemo } from 'react';
import { DEFAULT_BALANCE, getParam, parseBalance } from '../lib/params';
import { resolveMoney, type Money } from '../lib/money';

export interface UrlConfig {
  balance: number;
  money: Money;
}

export function readUrlConfig(search: string, hash: string): UrlConfig {
  const balance = parseBalance(getParam(['balance', 'b', 'amount'], search, hash)) ?? DEFAULT_BALANCE;
  const money = resolveMoney(
    getParam(['currency', 'cur'], search, hash),
    getParam(['locale', 'lang', 'l'], search, hash),
  );
  return { balance, money };
}

export function useUrlConfig(): UrlConfig {
  return useMemo(() => readUrlConfig(window.location.search, window.location.hash), []);
}
