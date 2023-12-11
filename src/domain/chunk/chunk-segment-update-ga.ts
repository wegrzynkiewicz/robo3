import { copyViewToArrayBuffer } from "../../common/utils/binary.ts";
import { gaBinaryHeaderCodec } from "../../common/action/codec.ts";
import { registerGADefinition } from "../../common/action/manager.ts";
import { ChunkId, chunkIdCodec } from "../../common/chunk/chunk-id.ts";
import { ChunkSegment } from "../../common/chunk/chunk-segment.ts";
import { BinaryBYOBCodec, BinarySequencyDecoder, BinarySequencyEncoder } from "../../core/codec.ts";

export interface ChunkSegmentUpdateGA {
  chunkId: ChunkId;
  segment: ChunkSegment;
}

const codec: BinaryBYOBCodec<ChunkSegmentUpdateGA> = {
  calcByteLength(data: ChunkSegmentUpdateGA): number {
    return gaBinaryHeaderCodec.calcByteLength() +
      chunkIdCodec.calcByteLength() +
      data.segment.byteLength;
  },
  decode(buffer: ArrayBuffer, byteOffset: number): ChunkSegmentUpdateGA {
    const decoder = new BinarySequencyDecoder(buffer, byteOffset);
    const chunkId = decoder.decode(chunkIdCodec);
    const segment = ChunkSegment.createFromBuffer(buffer, 20);
    return { chunkId, segment };
  },
  encode(buffer: ArrayBuffer, byteOffset: number, data: ChunkSegmentUpdateGA): void {
    const { chunkId, segment } = data;
    const encoder = new BinarySequencyEncoder(buffer, byteOffset);
    encoder.encode(chunkIdCodec, chunkId);
    copyViewToArrayBuffer(buffer, 20, segment);
  },
};

export const chunkSegmentUpdateGADef = registerGADefinition({
  encoding: {
    codec,
    type: "binary",
  },
  kind: "chunk-segment-update",
  key: 0x12,
});
