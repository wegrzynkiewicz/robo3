import { registerGameActionCodec } from "../action/foundation.ts";
import { Chunk } from "./chunk.ts";
import { ChunkId } from "./chunkId.ts";

export interface ChunksUpdateGameActionParams {
  chunks: Chunk[];
}

export interface ChunkDataUpdateGameActionParams {
  chunkId: ChunkId;
  binary: Uint8Array;
}

const size = ChunkId.BYTE_LENGTH;

export const chunkDataUpdateGameActionCodec = registerGameActionCodec<ChunkDataUpdateGameActionParams>({
  calcBufferSize(params: ChunkDataUpdateGameActionParams) {
    return size + params.binary.byteLength;
  },
  decode(buffer: ArrayBuffer, byteOffset: number): ChunkDataUpdateGameActionParams {
    const chunkView = new DataView(buffer, byteOffset, size);
    const binary = new Uint8Array(buffer, byteOffset + size, buffer.byteLength - size);
    const chunkId = ChunkId.fromDataView(chunkView);
    return {
      binary,
      chunkId,
    };
  },
  encode(buffer: ArrayBuffer, byteOffset: number, params: ChunkDataUpdateGameActionParams) {
    const { binary, chunkId } = params;
    const chunkView = new DataView(buffer, byteOffset, size);
    const binaryDest = new Uint8Array(buffer, byteOffset + size);
    chunkId.toDataView(chunkView);
    binaryDest.set(binary);
  },
  key: 'chunk-data-update',
});
