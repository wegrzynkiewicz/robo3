function h(x: number, number = 4): string {
  return x.toString(16).padStart(number, "0");
}

function hex(x: number, number: number): string {
  return x.toString(16).padStart(number, "0");
}

class ChunkId {
  public constructor(
    public readonly spaceId: number,
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
  ) {}

  public toDataView(dv: DataView): void {
    const { spaceId, x, y, z } = this;
    dv.setUint32(0, spaceId, true);
    dv.setUint16(4, z, true);
    dv.setUint16(6, y, true);
    dv.setUint16(8, x, true);
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

  public toHexConcat(): string {
    const { spaceId, x, y, z } = this;
    return `${spaceId.toString(16).padStart(8, "0")}${z.toString(16).padStart(4, "0")}${y.toString(16).padStart(4, "0")}${x.toString(16).padStart(4, "0")}`;
  }

  public toSubHexConcat(): string {
    const { spaceId, x, y, z } = this;
    return `${hex(spaceId, 8)}${hex(x, 4)}${hex(y, 4)}${hex(z, 4)}`;
  }

  public toSubHexConcat2(): string {
    const { spaceId, x, y, z } = this;
    return `${hex(spaceId, 8)}${h(x)}${h(y)}${h(z)}`;
  }

  public toHexParts(): string {
    const { spaceId, x, y, z } = this;
    const parts = [spaceId, z, y, x];
    return parts.map((a) => a.toString(16).padStart(4, "0")).join("");
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
Deno.bench("chunkId.toHexParts()", () => {
  chunkId.toHexParts();
});
Deno.bench("chunkId.toHexConcat()", () => {
  chunkId.toHexConcat();
});
Deno.bench("chunkId.toSubHexConcat()", () => {
  chunkId.toSubHexConcat();
});
Deno.bench("chunkId.toSubHexConcat2()", () => {
  chunkId.toSubHexConcat2();
});

const buffer = new Uint8Array(10);
const dv = new DataView(buffer.buffer);
chunkId.toDataView(dv);

Deno.bench("buffer2hex()", () => {
  buffer2hex(buffer);
});
