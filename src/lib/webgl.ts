export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export async function waitForFont(family: string, timeoutMs = 2500): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  await Promise.race([
    document.fonts.load(`100px "${family}"`).catch(() => undefined),
    new Promise((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}
