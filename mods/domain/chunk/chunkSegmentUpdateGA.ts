import { assertArrayBuffer } from "../../common/asserts.ts";
import { copyViewToArrayBuffer, fromArrayBuffer, toArrayBuffer } from "../../common/binary.ts";
import { GACodec, GAEnvelope } from "../../core/action/codec.ts";
import { registerGADefinition } from "../../core/action/foundation.ts";
import { ChunkId } from "../../core/chunk/chunkId.ts";
import { ChunkSegment } from "../../core/chunk/chunkSegment.ts";

export interface ChunksSegmentUpdateGA {
  chunkId: ChunkId,
  segment: ChunkSegment,
}

const codec: GACodec<ChunksSegmentUpdateGA> = {
  decode(data: unknown): GAEnvelope<ChunksSegmentUpdateGA> {
    assertArrayBuffer(data, 'expected-array-buffer');
    let offset = 0;
    const chunkId = fromArrayBuffer(data, offset, ChunkId);
    const segment = ChunkSegment.createFromBuffer(data,  offset += ChunkId.BYTE_LENGTH);
    const envelope: GAEnvelope<ChunksSegmentUpdateGA> = {
      id: 0,
      kind: chunksSegmentUpdateGADef.kind,
      params: { chunkId, segment }
    }
    return envelope;
  },
  encode(envelope: GAEnvelope<ChunksSegmentUpdateGA>): ArrayBuffer {
    const { chunkId, segment } = envelope.params;
    const byteLength =
      + ChunkId.BYTE_LENGTH
      + segment.byteLength;
    const buffer = new ArrayBuffer(byteLength);
    let offset = 0;
    toArrayBuffer(buffer, offset, chunkId);
    copyViewToArrayBuffer(buffer, offset += ChunkId.BYTE_LENGTH, segment);
    return buffer;
  }
}

export const chunksSegmentUpdateGADef = registerGADefinition({
  codec,
  kind: "chunk-segment-update",
  key: 0x0011,
});
