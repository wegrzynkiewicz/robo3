import { fromArrayBuffer, toArrayBuffer } from "../../common/binary.ts";
import { GameActionCodec } from "../action/codec.ts";
import { GameAction } from "../action/foundation.ts";
import { ChunkId } from "./chunkId.ts";

export interface ChunkBlockUpdateGameActionParams {
  chunkId: ChunkId;
  block: Uint8Array;
}

export interface ChunkBlockUpdateGameAction extends GameAction<ChunkBlockUpdateGameActionParams> {
  code: 'chunk-block-update';
  params: ChunkBlockUpdateGameActionParams;
}

export class ChunkBlockUpdateGameActionCodec implements GameActionCodec<ChunkBlockUpdateGameAction> {

  public readonly code = "chunk-block-update";

  public calcBufferSize({ block }: ChunkBlockUpdateGameActionParams): number {
    return ChunkId.BYTE_LENGTH + block.byteLength;
  }

  public decode(buffer: ArrayBuffer, byteOffset: number): ChunkBlockUpdateGameActionParams {
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
    { chunkId, block }: ChunkBlockUpdateGameActionParams
  ): void {
    toArrayBuffer(buffer, byteOffset, chunkId);
    const binaryDest = new Uint8Array(buffer, byteOffset + ChunkId.BYTE_LENGTH);
    binaryDest.set(block);
  }
}
