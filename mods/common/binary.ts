export interface BinarySerializable {
  toDataView(dv: DataView): void;
}

export interface BinaryDeserializable<TObject> {
  BYTE_LENGTH: number;
  fromDataView(dv: DataView): TObject;
}

export function toArrayBuffer(
  outputBuffer: ArrayBuffer,
  byteOffset: number,
  object: BinarySerializable
) {
  const dv = new DataView(outputBuffer, byteOffset);
  object.toDataView(dv);
}

export function fromArrayBuffer<TObject>(
  sourceBuffer: ArrayBuffer,
  byteOffset: number,
  constructor: BinaryDeserializable<TObject>
): TObject {
  const dv = new DataView(sourceBuffer, byteOffset, constructor.BYTE_LENGTH);
  const object = constructor.fromDataView(dv);
  return object;
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
