export interface BinarySerializable {
  toDataView(dv: DataView): void;
}

export interface BinaryDeserializable<TObject> {
  BYTE_LENGTH: number;
  fromDataView(dv: DataView): TObject;
}

export interface BinaryCopyable {
  byteLength: number;
  view: Uint8Array;
}

export function toArrayBuffer(
  outputBuffer: ArrayBuffer,
  byteOffset: number,
  object: BinarySerializable,
) {
  const dv = new DataView(outputBuffer, byteOffset);
  object.toDataView(dv);
}

export function fromArrayBuffer<TObject>(
  sourceBuffer: ArrayBuffer,
  byteOffset: number,
  constructor: BinaryDeserializable<TObject>,
): TObject {
  const dv = new DataView(sourceBuffer, byteOffset, constructor.BYTE_LENGTH);
  const object = constructor.fromDataView(dv);
  return object;
}

export function copyViewToArrayBuffer(outputBuffer: ArrayBuffer, byteOffset: number, object: BinaryCopyable) {
  const destView = new Uint8Array(outputBuffer, byteOffset, object.byteLength);
  destView.set(object.view);
}

export function hex2Buffer(outputBuffer: Uint8Array, hex: string) {
  const length = hex.length;
  for (let i = 0, j = 0; i < length; i += 2, j++) {
    outputBuffer[j] = parseInt(hex.substring(i, i + 2), 16);
  }
}

export function buffer2hex(buffer: Uint8Array): string {
  const hexChars = [];
  for (const byte of buffer) {
    const hexByte = byte.toString(16).padStart(2, "0");
    hexChars.push(hexByte);
  }
  return hexChars.join("");
}

export function decompress(input: Uint8Array): Promise<ArrayBuffer> {
  const ds = new DecompressionStream("deflate");
  const writer = ds.writable.getWriter();
  writer.write(input);
  writer.close();
  return new Response(ds.readable).arrayBuffer();
}

export function compress(input: Uint8Array): Promise<ArrayBuffer> {
  const cs = new CompressionStream("deflate");
  const writer = cs.writable.getWriter();
  writer.write(input);
  writer.close();
  return new Response(cs.readable).arrayBuffer();
}
