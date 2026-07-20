const UNIT_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/** Parses simple duration strings like "15m", "30d", "24h", "60s", or a plain number of ms. */
export default function ms(value: string): number {
  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const match = /^(\d+(?:\.\d+)?)(ms|s|m|h|d)$/.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid duration string: ${value}`);
  }

  const [, amount, unit] = match;
  return Number(amount) * UNIT_MS[unit];
}
