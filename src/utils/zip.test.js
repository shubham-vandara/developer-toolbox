import { describe, expect, it } from "vitest";
import { crc32, createZip } from "./zip.js";

describe("crc32", () => {
  it("matches the standard check value", () => {
    expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
  });
});

describe("createZip", () => {
  it("writes local headers, central directory and end record", () => {
    const zip = createZip([
      { name: "a.txt", data: "hello" },
      { name: "b.bin", data: new Uint8Array([1, 2, 3]) },
    ]);
    const view = new DataView(zip.buffer);
    expect(view.getUint32(0, true)).toBe(0x04034b50);
    const end = zip.length - 22;
    expect(view.getUint32(end, true)).toBe(0x06054b50);
    expect(view.getUint16(end + 10, true)).toBe(2);
    const centralOffset = view.getUint32(end + 16, true);
    expect(centralOffset).toBe(30 + 5 + 5 + 30 + 5 + 3);
    expect(view.getUint32(centralOffset, true)).toBe(0x02014b50);
    expect(new TextDecoder().decode(zip.subarray(30, 35))).toBe("a.txt");
    expect(new TextDecoder().decode(zip.subarray(35, 40))).toBe("hello");
  });
});
