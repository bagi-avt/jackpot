export const DEFAULT_BALANCE = 1_548_000;

export function getParam(names: readonly string[], search: string, hash: string): string | null {
  const sources = [search, hash.replace(/^#/, '?')];
  for (const source of sources) {
    const params = new URLSearchParams(source);
    for (const name of names) {
      const value = params.get(name)?.trim();
      if (value) return value;
    }
  }
  return null;
}

export function parseBalance(raw: string | null): number | null {
  if (!raw) return null;
  const num = Number(raw.replace(/[\s_,]/g, ''));
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.round(num);
}
