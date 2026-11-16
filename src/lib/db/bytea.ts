import { customType } from "drizzle-orm/pg-core";

// ============================================================================
// Postgres `bytea` for uploaded original files.
//
// Neon's HTTP driver sends values as text, so bytes come back in Postgres's
// hex format ("\x48656c6c6f"). Going in, a hex literal is the safest text form
// too. These two functions are the whole conversion, kept pure for tests.
// ============================================================================

/** Bytes → Postgres hex literal, e.g. [72, 105] → "\x4869". */
export function toPgHex(bytes: Uint8Array): string {
  let hex = "";
  for (const byte of bytes) hex += byte.toString(16).padStart(2, "0");
  return `\\x${hex}`;
}

/** Postgres hex literal (or raw bytes from another driver) → bytes. */
export function fromPgHex(value: string | Uint8Array): Uint8Array {
  if (value instanceof Uint8Array) return value;
  if (!value.startsWith("\\x")) throw new Error("Expected a bytea value in hex format (\\x...).");
  const hex = value.slice(2);
  if (hex.length % 2 !== 0 || /[^0-9a-f]/i.test(hex)) throw new Error("Malformed bytea hex value.");
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

export const bytea = customType<{ data: Uint8Array; driverData: string }>({
  dataType: () => "bytea",
  toDriver: toPgHex,
  fromDriver: (value) => fromPgHex(value as string | Uint8Array),
});
