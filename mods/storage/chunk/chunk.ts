import { Binary, ObjectId } from "../deps.ts";

export interface ChunkComplexGameObjectDoc {
  gid: ObjectId;
  lid: number;
  pos: number;
  typ: number;
}

export interface ChunkDoc {
  _id: Binary;
  data: Binary;
  extended: ChunkComplexGameObjectDoc;
  tiles: number;
}
