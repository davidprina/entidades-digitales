const SAFE_SCHEMES = ["http:", "https:", "mailto:", "tel:"];

/** Guards against javascript:/data: URIs in user-supplied payload fields rendered as links. */
export function safeHref(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  try {
    const url = new URL(trimmed, window.location.origin);
    return SAFE_SCHEMES.includes(url.protocol) ? trimmed : undefined;
  } catch {
    return undefined;
  }
}
