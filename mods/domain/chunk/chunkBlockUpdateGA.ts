import { fromArrayBuffer, toArrayBuffer } from "../../common/binary.ts";
import { GABinarySubCodec, GACompressorCodec } from "../../core/action/codec.ts";
import { registerGADefinition } from "../../core/action/foundation.ts";
import { ChunkId } from "../../core/chunk/chunkId.ts";
import { ChunkSegment } from "../../core/chunk/chunkSegment.ts";

export interface ChunksSegmentUpdateGA {
  chunkId: ChunkId,
  segment: ChunkSegment,
}

const subCodec = new class implements GABinarySubCodec<ChunksSegmentUpdateGA> {
  calcBufferSize({ segment }: ChunksSegmentUpdateGA): number {
    const byteLength =
      + ChunkId.BYTE_LENGTH
      + segment.byteLength;
    return byteLength;
  }
  decode(buffer: ArrayBuffer, byteOffset: number): ChunksSegmentUpdateGA {
    let offset = byteOffset;
    const chunkId = fromArrayBuffer(buffer, offset, ChunkId);
    offset += ChunkId.BYTE_LENGTH;
    const segment = ChunkSegment.createFromBuffer(buffer, offset);
    return { chunkId, segment };
  }
  encode(buffer: ArrayBuffer, byteOffset: number, { chunkId, segment }: ChunksSegmentUpdateGA): void {
    let offset = byteOffset;
    toArrayBuffer(buffer, offset, chunkId);
    offset += ChunkId.BYTE_LENGTH;
    (new Uint8Array(buffer, offset, segment.byteLength)).set(segment.view);
  }
}

export const chunksSegmentUpdateGADef = registerGADefinition({
  code: "chunk-segment-update",
  index: 0x0011,
  notify: new GACompressorCodec<ChunksSegmentUpdateGA>(subCodec),
  type: "notification",
});
