import { randomBytes } from "node:crypto";

const SLUG_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
const SLUG_PATTERN = /^[a-z0-9-]{3,32}$/;

export function generateSlug(length = 7): string {
  const bytes = randomBytes(length);
  let slug = "";
  for (let i = 0; i < length; i++) {
    slug += SLUG_ALPHABET[bytes[i]! % SLUG_ALPHABET.length];
  }
  return slug;
}

export function normalizeSlug(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidSlug(raw: string): boolean {
  return SLUG_PATTERN.test(raw);
}
