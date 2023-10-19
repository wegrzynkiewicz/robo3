function hex(x: number, number: number): string {
  return x.toString(16).padStart(number, "0");
}

class ChunkId {
  public constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
  ) {}

  public toBigInt(): bigint {
    const { x, y, z } = this;
    return BigInt(z * 4294967296 + y * 65536 + x);
  }

  public toNumber(): number {
    const { x, y, z } = this;
    return z * 4294967296 + y * 65536 + x
  }

  public toHex(): string {
    const { x, y, z } = this;
    return `${hex(x, 4)}${hex(y, 4)}${hex(z, 4)}`;
  }
}
const chunkId = new ChunkId(0x0fff, 0x0fff, 0x0fff);

const mapString = new Map<string, unknown>();
Deno.bench("String: fill map with .toHex()", () => {
  mapString.clear();
  for (let i = 0; i < 65536; i++) {
    const chunkId = new ChunkId(i, i, i);
    mapString.set(chunkId.toHex(), chunkId);
  }
});

const mapBigInt = new Map<bigint, unknown>();
Deno.bench("BigInt: fill map with .toBigInt()", () => {
  mapBigInt.clear();
  for (let i = 0; i < 65536; i++) {
    const chunkId = new ChunkId(i, i, i);
    mapBigInt.set(chunkId.toBigInt(), chunkId);
  }
});

const mapNumber = new Map<number, unknown>();
Deno.bench("Number: fill map with .toNumber()", () => {
  mapNumber.clear();
  for (let i = 0; i < 65536; i++) {
    const chunkId = new ChunkId(i, i, i);
    mapNumber.set(chunkId.toNumber(), chunkId);
  }
});

Deno.bench("String: .toHex()", () => {
  chunkId.toHex();
});
Deno.bench("BigInt: .toBigInt()", () => {
  chunkId.toBigInt();
});
Deno.bench("Number: .toNumber()", () => {
  chunkId.toNumber();
});


Deno.bench("String: basic set", () => {
  mapString.set("1", {});
});
Deno.bench("BigInt: basic set", () => {
  mapBigInt.set(1n, {});
});
Deno.bench("Number: basic set", () => {
  mapNumber.set(1, {});
});

Deno.bench("String: basic get", () => {
  mapString.get("1");
});
Deno.bench("BigInt: basic get", () => {
  mapBigInt.get(1n);
});
Deno.bench("Number: basic get", () => {
  mapNumber.get(1);
});

Deno.bench("String: get with .toHex()", () => {
  mapString.get(chunkId.toHex());
});
Deno.bench("BigInt: get with .toBigInt()", () => {
  mapBigInt.get(chunkId.toBigInt());
});
Deno.bench("Number: get with .toNumber()", () => {
  mapNumber.get(chunkId.toNumber());
});
