class ChunkId {
  public constructor(
    public readonly spaceId: number,
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
  ) {
  }

  public toDataView(dv: DataView): void {
    const { spaceId, x, y, z } = this;
    dv.setUint32(0, spaceId);
    dv.setUint16(4, z);
    dv.setUint16(6, y);
    dv.setUint16(8, x);
  }

  public toHex(): string {
    const { spaceId, x, y, z } = this;
    const parts = [
      spaceId.toString(16).padStart(8, "0"),
      z.toString(16).padStart(4, "0"),
      y.toString(16).padStart(4, "0"),
      x.toString(16).padStart(4, "0"),
    ];
    return parts.join("");
  }
}

function buffer2hex(buffer: Uint8Array): string {
  const hexChars = [];
  for (const byte of buffer) {
    const hexByte = byte.toString(16).padStart(2, "0");
    hexChars.push(hexByte);
  }
  return hexChars.join("");
}

const chunkId = new ChunkId(1, 2, 3, 4);

Deno.bench("chunkId.toHex()", () => {
  chunkId.toHex();
});

const buffer = new Uint8Array(10);
const dv = new DataView(buffer.buffer);
chunkId.toDataView(dv);

Deno.bench("buffer2hex()", () => {
  buffer2hex(buffer);
});
