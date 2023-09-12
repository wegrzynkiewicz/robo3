import { copyViewToArrayBuffer } from "../../common/binary.ts";
import { gaBinaryHeaderCodec } from "../../core/action/codec.ts";
import { registerGADefinition } from "../../core/action/foundation.ts";
import { ChunkId, chunkIdCodec } from "../../core/chunk/chunkId.ts";
import { ChunkSegment } from "../../core/chunk/chunkSegment.ts";
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
    // TODO: align
  },
  decode(buffer: ArrayBuffer, byteOffset: number): ChunkSegmentUpdateGA {
    const decoder = new BinarySequencyDecoder(buffer, byteOffset);
    console.log(decoder);
    const chunkId = decoder.decode(chunkIdCodec);
    const segment = ChunkSegment.createFromBuffer(buffer, 20);
    return { chunkId, segment };
  },
  encode(buffer: ArrayBuffer, byteOffset: number, data: ChunkSegmentUpdateGA): void {
    const { chunkId, segment } = data;
    const encoder = new BinarySequencyEncoder(buffer, byteOffset);
    encoder.encode(chunkIdCodec, chunkId);
    copyViewToArrayBuffer(buffer, 20, segment);

    // const { id, params: { chunkId, segment } } = envelope;
    // const byteLength = +align(GABinaryHeader.BYTE_LENGTH) +
    //   align(ChunkId.BYTE_LENGTH) +
    //   align(segment.byteLength);
    // const buffer = new ArrayBuffer(byteLength);
    // const header = new GABinaryHeader(chunkSegmentUpdateGADef.key, id);
    // let offset = 0;
    // toArrayBuffer(buffer, offset, header);
    // toArrayBuffer(buffer, offset += align(GABinaryHeader.BYTE_LENGTH), chunkId);
    // copyViewToArrayBuffer(buffer, offset += align(ChunkId.BYTE_LENGTH), segment);
    // return buffer;
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
