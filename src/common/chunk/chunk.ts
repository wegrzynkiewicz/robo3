import { assertArray, assertObject, assertPositiveNumber, assertRequiredString } from "../utils/asserts.ts";
import { ChunkId } from "./chunk-id.ts";

export interface ChunkComplexGODTO {
  gid: string;
  lid: number;
  pos: number;
  typ: number;
}

export function parseChunkComplexGODTO(data: unknown): ChunkComplexGODTO {
  assertObject<ChunkComplexGODTO>(data, "chunk-complex-go-must-be-object");
  const { gid, lid, pos, typ } = data;
  assertRequiredString(gid);
  assertPositiveNumber(lid);
  assertPositiveNumber(pos);
  assertPositiveNumber(typ);
  return { gid, lid, pos, typ };
}

export interface ChunkDTO {
  chunkId: string;
  tiles: number;
  extended: ChunkComplexGODTO[];
}

export function parseChunkDTO(data: unknown): ChunkDTO {
  assertObject<ChunkDTO>(data, "chunk-must-be-object");
  const { chunkId, extended, tiles } = data;
  assertRequiredString(chunkId, "chunk-id-must-be-string");
  assertArray(extended, "chunk-extended-must-be-array");
  const parsedExtended: ChunkComplexGODTO[] = [];
  for (const probablyChunkComplexGODTO of extended) {
    const chunkComplexGODTO = parseChunkComplexGODTO(probablyChunkComplexGODTO);
    parsedExtended.push(chunkComplexGODTO);
  }
  assertPositiveNumber(tiles, "chunk-tiles-must-be-number");
  return { chunkId, extended: parsedExtended, tiles };
}

export interface ChunkBinding {
  chunk: ChunkDTO;
  chunkId: ChunkId;
}

export class ChunkManager {
  protected readonly chunks = new Map<string, ChunkBinding>();
  public register(chunk: ChunkDTO) {
    const { chunkId: hex } = chunk;
    const chunkId = ChunkId.fromHex(hex);
    const chunkBinding: ChunkBinding = {
      chunk,
      chunkId,
    };
    this.chunks.set(hex, chunkBinding);
  }
}
