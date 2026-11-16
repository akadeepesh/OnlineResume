// ============================================================================
// Minimal ZIP reading and writing, built on the platform's own DEFLATE
// (CompressionStream / DecompressionStream, in every modern browser and in
// Node 18+). Enough for what we need: LinkedIn data exports (a ZIP of CSV
// files) and Word documents (a ZIP of XML files).
//
// Not supported: ZIP64, encryption, spanned archives. Uploads are limited to
// a few MB, so none of these come up in practice; such files are refused.
//
// Zip bombs: entry count, per-file size and total size are capped, and the
// caps are enforced on the bytes actually produced, not just on what the
// archive claims.
// ============================================================================

export class ZipError extends Error {}

export interface ZipLimits {
  maxEntries: number;
  /** Largest single file after decompression. */
  maxFileBytes: number;
  /** All files together after decompression. */
  maxTotalBytes: number;
}

export const DEFAULT_ZIP_LIMITS: ZipLimits = {
  maxEntries: 2000,
  maxFileBytes: 20 * 1024 * 1024,
  maxTotalBytes: 60 * 1024 * 1024,
};

interface Entry {
  name: string;
  method: number;
  compressedSize: number;
  size: number;
  localOffset: number;
}

export interface ZipArchive {
  /** File names in the archive (folders left out). */
  names: string[];
  /** A file's bytes, or null if it isn't in the archive. */
  read(name: string): Promise<Uint8Array | null>;
  /** A file as UTF-8 text (BOM removed), or null. */
  text(name: string): Promise<string | null>;
}

const EOCD = 0x06054b50;
const CENTRAL = 0x02014b50;
const LOCAL = 0x04034b50;

/** True if the bytes start like a ZIP file ("PK\x03\x04", or an empty archive). */
export const looksLikeZip = (bytes: Uint8Array) =>
  bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && (bytes[2] === 3 || bytes[2] === 5);

async function pipeThrough(bytes: Uint8Array, stream: CompressionStream | DecompressionStream, limit: number) {
  const reader = new Blob([bytes as BlobPart]).stream().pipeThrough(stream).getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > limit) {
      await reader.cancel();
      throw new ZipError("A file in the archive is too large.");
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

export async function openZip(bytes: Uint8Array, limits: ZipLimits = DEFAULT_ZIP_LIMITS): Promise<ZipArchive> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const u16 = (at: number) => view.getUint16(at, true);
  const u32 = (at: number) => view.getUint32(at, true);

  // The end-of-central-directory record is in the last 22 + 65535 bytes.
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 0xffff); i--) {
    if (u32(i) === EOCD) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new ZipError("This isn't a ZIP file.");

  const count = u16(eocd + 10);
  const centralOffset = u32(eocd + 16);
  if (count === 0xffff || centralOffset === 0xffffffff) throw new ZipError("This ZIP format isn't supported.");
  if (count > limits.maxEntries) throw new ZipError("This archive has too many files.");

  const decoder = new TextDecoder();
  const entries = new Map<string, Entry>();
  let at = centralOffset;
  for (let i = 0; i < count; i++) {
    if (at + 46 > bytes.length || u32(at) !== CENTRAL) throw new ZipError("This ZIP file is damaged.");
    const flags = u16(at + 8);
    if (flags & 1) throw new ZipError("Encrypted ZIP files aren't supported.");
    const nameLength = u16(at + 28);
    const name = decoder.decode(bytes.subarray(at + 46, at + 46 + nameLength));
    const entry: Entry = {
      name,
      method: u16(at + 10),
      compressedSize: u32(at + 20),
      size: u32(at + 24),
      localOffset: u32(at + 42),
    };
    if (!name.endsWith("/")) entries.set(name, entry);
    at += 46 + nameLength + u16(at + 30) + u16(at + 32);
  }

  let produced = 0;
  const read = async (name: string): Promise<Uint8Array | null> => {
    const entry = entries.get(name);
    if (!entry) return null;
    if (entry.size > limits.maxFileBytes) throw new ZipError("A file in the archive is too large.");
    const local = entry.localOffset;
    if (local + 30 > bytes.length || u32(local) !== LOCAL) throw new ZipError("This ZIP file is damaged.");
    const start = local + 30 + u16(local + 26) + u16(local + 28);
    const data = bytes.subarray(start, start + entry.compressedSize);
    if (data.length !== entry.compressedSize) throw new ZipError("This ZIP file is damaged.");

    const budget = Math.min(limits.maxFileBytes, limits.maxTotalBytes - produced);
    let out: Uint8Array;
    if (entry.method === 0) {
      if (data.length > budget) throw new ZipError("The archive is too large once unpacked.");
      out = data.slice();
    } else if (entry.method === 8) {
      out = await pipeThrough(data, new DecompressionStream("deflate-raw"), budget);
    } else {
      throw new ZipError("This ZIP compression method isn't supported.");
    }
    produced += out.length;
    return out;
  };

  return {
    names: [...entries.keys()],
    read,
    async text(name) {
      const data = await read(name);
      if (!data) return null;
      const text = new TextDecoder().decode(data);
      return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
    },
  };
}

// ----------------------------------------------------------------------------
// Writing
// ----------------------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) crc = CRC_TABLE[(crc ^ data[i]!) & 0xff]! ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export interface ZipInput {
  name: string;
  data: Uint8Array | string;
}

/** Build a ZIP file. Files are deflated unless `store` is set. */
export async function createZip(files: ZipInput[], { store = false } = {}): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const name = encoder.encode(file.name);
    const raw = typeof file.data === "string" ? encoder.encode(file.data) : file.data;
    const body = store ? raw : await pipeThrough(raw, new CompressionStream("deflate-raw"), Number.MAX_SAFE_INTEGER);
    const crc = crc32(raw);
    const method = store ? 0 : 8;

    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, LOCAL, true);
    lv.setUint16(4, 20, true); // version needed
    lv.setUint16(6, 0x0800, true); // UTF-8 names
    lv.setUint16(8, method, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, body.length, true);
    lv.setUint32(22, raw.length, true);
    lv.setUint16(26, name.length, true);
    local.set(name, 30);

    const central = new Uint8Array(46 + name.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, CENTRAL, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, method, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, body.length, true);
    cv.setUint32(24, raw.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true);
    central.set(name, 46);

    locals.push(local, body);
    centrals.push(central);
    offset += local.length + body.length;
  }

  const centralSize = centrals.reduce((n, c) => n + c.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, EOCD, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);

  const parts = [...locals, ...centrals, end];
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}
