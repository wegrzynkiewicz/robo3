import { assertArrayBuffer } from "../../common/asserts.ts";
import { copyViewToArrayBuffer, fromArrayBuffer, toArrayBuffer } from "../../common/binary.ts";
import { GABinaryHeader, GACodec, GAEnvelope, align } from "../../core/action/codec.ts";
import { registerGADefinition } from "../../core/action/foundation.ts";
import { ChunkId } from "../../core/chunk/chunkId.ts";
import { ChunkSegment } from "../../core/chunk/chunkSegment.ts";

export interface ChunkSegmentUpdateGA {
  chunkId: ChunkId,
  segment: ChunkSegment,
}

const codec: GACodec<ChunkSegmentUpdateGA> = {
  decode(buffer: unknown): GAEnvelope<ChunkSegmentUpdateGA> {
    assertArrayBuffer(buffer, 'expected-array-buffer');
    let offset = 0;
    const header = fromArrayBuffer(buffer, offset, GABinaryHeader);
    const chunkId = fromArrayBuffer(buffer, offset += align(GABinaryHeader.BYTE_LENGTH), ChunkId);
    const segment = ChunkSegment.createFromBuffer(buffer, offset  += align(ChunkId.BYTE_LENGTH));
    const envelope: GAEnvelope<ChunkSegmentUpdateGA> = {
      id: header.id,
      kind: chunkSegmentUpdateGADef.kind,
      params: { chunkId, segment },
    }
    return envelope;
  },
  encode(envelope: GAEnvelope<ChunkSegmentUpdateGA>): ArrayBuffer {
    const { id, params: { chunkId, segment } } = envelope;
    const byteLength =
      + align(GABinaryHeader.BYTE_LENGTH)
      + align(ChunkId.BYTE_LENGTH)
      + align(segment.byteLength);
    const buffer = new ArrayBuffer(byteLength);
    const header = new GABinaryHeader(chunkSegmentUpdateGADef.key, id);
    let offset = 0;
    toArrayBuffer(buffer, offset, header);
    toArrayBuffer(buffer, offset += align(GABinaryHeader.BYTE_LENGTH), chunkId);
    copyViewToArrayBuffer(buffer, offset += align(ChunkId.BYTE_LENGTH), segment);
    return buffer;
  }
}

export const chunkSegmentUpdateGADef = registerGADefinition({
  codec,
  kind: "chunk-segment-update",
  key: 0x12,
});
