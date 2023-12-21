import { copyViewToArrayBuffer } from "../../common/utils/binary.ts";
import { gaBinaryHeaderCodec } from "../../common/communication/action/codec.ts";
import { registerCADefinition } from "../../common/communication/action/manager.ts";
import { ChunkId, chunkIdCodec } from "../../common/chunk/chunk-id.ts";
import { ChunkSegment } from "../../common/chunk/chunk-segment.ts";
import { BinaryBYOBCodec, BinarySequencyDecoder, BinarySequencyEncoder } from "../../core/codec.ts";
import { Identifier } from "../../common/vars.ts";

export interface ChunkSegmentUpdateCA {
  chunkId: ChunkId;
  segment: ChunkSegment;
}

const codec: BinaryBYOBCodec<ChunkSegmentUpdateCA> = {
  calcByteLength(data: ChunkSegmentUpdateCA): number {
    return gaBinaryHeaderCodec.calcByteLength() +
      chunkIdCodec.calcByteLength() +
      data.segment.byteLength;
  },
  decode(buffer: ArrayBuffer, byteOffset: number): ChunkSegmentUpdateCA {
    const decoder = new BinarySequencyDecoder(buffer, byteOffset);
    const chunkId = decoder.decode(chunkIdCodec);
    const segment = ChunkSegment.createFromBuffer(buffer, 20);
    return { chunkId, segment };
  },
  encode(buffer: ArrayBuffer, byteOffset: number, data: ChunkSegmentUpdateCA): void {
    const { chunkId, segment } = data;
    const encoder = new BinarySequencyEncoder(buffer, byteOffset);
    encoder.encode(chunkIdCodec, chunkId);
    copyViewToArrayBuffer(buffer, 20, segment);
  },
};

export const chunkSegmentUpdateCADef = registerCADefinition({
  encoding: {
    codec,
    key: Identifier.chunkSegmentUpdateCA,
    type: "binary",
  },
  kind: "chunk-segment-update",
});
