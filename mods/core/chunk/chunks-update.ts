import { Data } from "https://deno.land/std@0.188.0/crypto/keystack.ts";
import { fromArrayBuffer, toArrayBuffer } from "../../common/binary.ts";
import { GACodec } from "../action/codec.ts";
import { GA } from "../action/foundation.ts";
import { ChunkId } from "./chunkId.ts";

export interface ChunkBlockUpdateGAParams {
  chunkId: ChunkId;
  block: Uint8Array;
}

export interface ChunkBlockUpdateGA extends GA<ChunkBlockUpdateGAParams> {
  code: 'chunk-block-update';
  params: ChunkBlockUpdateGAParams;
}

export class ChunkBlockUpdateGACodec implements GABinaryCodec<ChunkBlockUpdateGA> {

  public calcBufferSize({ block }: ChunkBlockUpdateGAParams): number {
    return ChunkId.BYTE_LENGTH + block.byteLength;
  }

  public decode(buffer: ArrayBuffer, byteOffset: number): ChunkBlockUpdateGAParams {
    const chunkId = fromArrayBuffer(buffer, byteOffset, ChunkId);
    const block = new Uint8Array(buffer, byteOffset + ChunkId.BYTE_LENGTH);
    return {
      block,
      chunkId,
    };
  }

  public encode(
    buffer: ArrayBuffer,
    byteOffset: number,
    { chunkId, block }: ChunkBlockUpdateGAParams
  ): void {
    toArrayBuffer(buffer, byteOffset, chunkId);
    const binaryDest = new Uint8Array(buffer, byteOffset + ChunkId.BYTE_LENGTH);
    binaryDest.set(block);
  }
}
