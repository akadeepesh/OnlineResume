import { describe, expect, it } from "vitest";
import { createZip, crc32, looksLikeZip, openZip, ZipError } from "./zip";

describe("zip", () => {
  it("computes CRC-32 like everyone else", () => {
    expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
  });

  it.each([true, false])("round-trips files (store: %s)", async (store) => {
    const bytes = await createZip(
      [
        { name: "a.txt", data: "hello" },
        { name: "folder/b.csv", data: "x,y\n1,2\n".repeat(100) },
        { name: "ünïcode.txt", data: "✓" },
      ],
      { store },
    );
    expect(looksLikeZip(bytes)).toBe(true);
    const zip = await openZip(bytes);
    expect(zip.names).toEqual(["a.txt", "folder/b.csv", "ünïcode.txt"]);
    expect(await zip.text("a.txt")).toBe("hello");
    expect(await zip.text("folder/b.csv")).toBe("x,y\n1,2\n".repeat(100));
    expect(await zip.text("ünïcode.txt")).toBe("✓");
    expect(await zip.read("missing.txt")).toBeNull();
  });

  it("strips a UTF-8 byte order mark from text", async () => {
    const zip = await openZip(await createZip([{ name: "bom.csv", data: "﻿Name\nGo" }]));
    expect(await zip.text("bom.csv")).toBe("Name\nGo");
  });

  it("stops at the size limits, even when the archive understates sizes", async () => {
    const bytes = await createZip([{ name: "big.txt", data: "a".repeat(100_000) }]);
    const zip = await openZip(bytes, { maxEntries: 10, maxFileBytes: 1000, maxTotalBytes: 1000 });
    await expect(zip.read("big.txt")).rejects.toBeInstanceOf(ZipError);

    // Claim a tiny uncompressed size in the central directory: the real output still counts.
    const lying = bytes.slice();
    const view = new DataView(lying.buffer);
    for (let i = lying.length - 22; i >= 0; i--) {
      if (view.getUint32(i, true) === 0x02014b50) {
        view.setUint32(i + 24, 10, true);
        break;
      }
    }
    const zip2 = await openZip(lying, { maxEntries: 10, maxFileBytes: 1000, maxTotalBytes: 1000 });
    await expect(zip2.read("big.txt")).rejects.toThrow(/too large/);
  });

  it("refuses files that aren't ZIPs or have too many entries", async () => {
    await expect(openZip(new TextEncoder().encode("not a zip at all, sorry"))).rejects.toThrow(/isn't a ZIP/);
    const many = await createZip(Array.from({ length: 5 }, (_, i) => ({ name: `${i}.txt`, data: "x" })));
    await expect(openZip(many, { maxEntries: 3, maxFileBytes: 100, maxTotalBytes: 100 })).rejects.toThrow(/too many/);
  });
});
