import { describe, expect, it } from 'vitest';
import { formatMoney, maskMoney, resolveMoney } from './money';
import { readUrlConfig } from '../hooks/useUrlConfig';

const norm = (s: string) => s.replace(/[  ]/g, ' ');

describe('resolveMoney', () => {
  it.each([
    [null, null, 'RUB', 'ru-RU'],
    ['ru-RU', null, 'RUB', 'ru-RU'],
    ['kz', null, 'KZT', 'kk-KZ'],
    ['KZT', null, 'KZT', 'kk-KZ'],
    ['kk-KZ', null, 'KZT', 'kk-KZ'],
    ['usd', null, 'USD', 'en-US'],
    ['EUR', null, 'EUR', 'de-DE'],
    ['by', null, 'BYN', 'be-BY'],
    [null, 'en-US', 'USD', 'en-US'],
    ['USD', 'ru-RU', 'USD', 'ru-RU'],
    ['xx-QQ', null, 'RUB', 'ru-RU'],
    ['garbage', null, 'RUB', 'ru-RU'],
  ])('currency=%s locale=%s → %s / %s', (cur, loc, currency, locale) => {
    expect(resolveMoney(cur, loc)).toEqual({ currency, locale });
  });
});

describe('formatMoney', () => {
  it('рубли', () => {
    expect(norm(formatMoney(1548000, { currency: 'RUB', locale: 'ru-RU' }))).toBe('1 548 000 ₽');
  });
  it('тенге', () => {
    expect(norm(formatMoney(1548000, { currency: 'KZT', locale: 'kk-KZ' }))).toBe('1 548 000 ₸');
  });
  it('доллары', () => {
    expect(formatMoney(1548000, { currency: 'USD', locale: 'en-US' })).toBe('$1,548,000');
  });
  it('маска прячет цифры', () => {
    expect(maskMoney('$1,548,000')).toBe('$?,???,???');
  });
});

describe('readUrlConfig', () => {
  it('значения по умолчанию', () => {
    expect(readUrlConfig('', '')).toEqual({
      balance: 1548000,
      money: { currency: 'RUB', locale: 'ru-RU' },
    });
  });
  it('query', () => {
    expect(readUrlConfig('?balance=250_000&currency=kz', '')).toEqual({
      balance: 250000,
      money: { currency: 'KZT', locale: 'kk-KZ' },
    });
  });
  it('hash', () => {
    expect(readUrlConfig('', '#b=42&cur=USD').balance).toBe(42);
  });
  it('невалидный баланс → по умолчанию', () => {
    expect(readUrlConfig('?balance=-5', '').balance).toBe(1548000);
  });
});
