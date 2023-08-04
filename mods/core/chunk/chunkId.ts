import { Position } from "../numbers.ts";

export interface DecodedChunkId {
  position: Position;
  spaceId: number;
}

const CHUNK_ID_BYTE_LENGTH = 10;
const binary = new Uint8Array(CHUNK_ID_BYTE_LENGTH);
const dv = new DataView(binary.buffer);

export function decodeChunkId(chunkId: string): DecodedChunkId {
  let j = 0;
  for (let i = 0; i < CHUNK_ID_BYTE_LENGTH * 2; i += 2) {
    const byteValue = parseInt(chunkId.substring(i, i + 2), 16);
    binary[j++] = byteValue;
  }
  const spaceId = dv.getUint32(0);
  const z = dv.getUint16(4);
  const y = dv.getUint16(6);
  const x = dv.getUint16(8);
  const decodeChunkId: DecodedChunkId = {
    position: { x, y, z },
    spaceId,
  };
  return decodeChunkId;
}

export function encodeChunkId(decoded: DecodedChunkId): string {
  const { position: { x, y, z }, spaceId } = decoded;
  dv.setUint32(0, spaceId);
  dv.setUint16(4, z);
  dv.setUint16(6, y);
  dv.setUint16(8, x);
  const hexChars = [];
  for (const byte of binary) {
    const hexByte = byte.toString(16).padStart(2, "0");
    hexChars.push(hexByte);
  }
  const chunkId = hexChars.join("");
  return chunkId;
}
