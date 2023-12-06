import { Breaker } from "../../common/breaker.ts";
import { registerService, ServiceResolver } from "../../dependency/service.ts";
import { SpaceManager, spaceManagerService } from "../../core/space/SpaceManager.ts";
import { Chunk } from "./chunkManager.ts";

const ter = { // TODO: hardcode
  "LQ": 65,
  "UW": 66,
  "LE": 67,
  "CQ": 68,
  "EW": 69,
  "CE": 70,
  "UA": 71,
  "HS": 72,
  "UD": 73,
  "EA": 74,
  "FS": 75,
  "ED": 76,
  "LZ": 77,
  "UX": 78,
  "LC": 79,
  "CZ": 80,
  "ES": 81,
  "CC": 82,
};

const CHUNK_SIZE = 32;
const PROCESSOR_SIZE = 34;
const C = CHUNK_SIZE - 1;
const P = PROCESSOR_SIZE - 1;

function tile(x: number, y: number): number {
  return y * CHUNK_SIZE + x;
}

function proc(x: number, y: number): number {
  return y * PROCESSOR_SIZE + x;
}

export class ChunkTerrainProcessor {
  protected currentIndex = 0;
  protected tileX = 0;
  protected tileY = 0;
  protected readonly tileWorkingBuffer = new Uint16Array(2 ** 16);
  protected readonly view = new Uint16Array(PROCESSOR_SIZE ** 2);

  public constructor(
    protected spaceManager: SpaceManager,
  ) {}

  protected prepareView(chunk: Chunk): void {
    const { chunkId: { spaceId, x, y, z } } = chunk;
    const space = this.spaceManager.byId.get(spaceId);
    if (space === undefined) {
      throw new Breaker("not-found-space-by-id", { spaceId });
    }
    const cm = space.chunkManager;

    const chunkQ = cm.getByCoords(x - 1, y - 1, z);
    const chunkW = cm.getByCoords(x + 0, y - 1, z);
    const chunkE = cm.getByCoords(x + 1, y - 1, z);
    const chunkA = cm.getByCoords(x - 1, y + 0, z);
    const chunkS = chunk;
    const chunkD = cm.getByCoords(x + 1, y + 0, z);
    const chunkZ = cm.getByCoords(x - 1, y + 1, z);
    const chunkX = cm.getByCoords(x + 0, y + 1, z);
    const chunkC = cm.getByCoords(x + 1, y + 1, z);

    this.view[proc(0, 0)] = chunkQ?.segment?.grid.view[tile(C, C)] ?? 0;
    this.view[proc(P, 0)] = chunkE?.segment?.grid.view[tile(0, C)] ?? 0;
    this.view[proc(0, P)] = chunkZ?.segment?.grid.view[tile(C, 0)] ?? 0;
    this.view[proc(P, P)] = chunkC?.segment?.grid.view[tile(0, 0)] ?? 0;
    for (let i = 0; i < CHUNK_SIZE; i++) {
      this.view[proc(i + 1, 0)] = chunkW?.segment?.grid.view[tile(i, C)] ?? 0;
      this.view[proc(i + 1, P)] = chunkX?.segment?.grid.view[tile(i, 0)] ?? 0;
      this.view[proc(0, i + 1)] = chunkA?.segment?.grid.view[tile(C, i)] ?? 0;
      this.view[proc(P, i + 1)] = chunkD?.segment?.grid.view[tile(0, i)] ?? 0;
      for (let j = 0; j < CHUNK_SIZE; j++) {
        this.view[proc(j + 1, i + 1)] = chunkS?.segment?.grid.view[tile(j, i)] ?? 0;
      }
    }
  }

  protected put(tileIndex: number): void {
    const index = this.currentIndex * 3;
    this.tileWorkingBuffer[index + 0] = this.tileX; // * SPRITE_SIZE;
    this.tileWorkingBuffer[index + 1] = this.tileY; // * SPRITE_SIZE;
    this.tileWorkingBuffer[index + 2] = tileIndex;
    this.currentIndex++;
  }

  protected processShadow(
    vq: number,
    vw: number,
    ve: number,
    va: number,
    _s: number,
    vd: number,
    vz: number,
    vx: number,
    vc: number,
  ): void {
    const pw = vw === 0 ? 0 : 0b1000;
    const px = vx === 0 ? 0 : 0b0100;
    const pa = va === 0 ? 0 : 0b0010;
    const pd = vd === 0 ? 0 : 0b0001;
    const pq = vq === 0 ? 0 : 1;
    const pe = ve === 0 ? 0 : 1;
    const pz = vz === 0 ? 0 : 1;
    const pc = vc === 0 ? 0 : 1;

    if (pw === 0 && pa === 0 && pq) {
      this.put(ter["CC"]);
    }
    if (pw === 0 && pd === 0 && pe) {
      this.put(ter["CZ"]);
    }
    if (px === 0 && pa === 0 && pz) {
      this.put(ter["CE"]);
    }
    if (px === 0 && pd === 0 && pc) {
      this.put(ter["CQ"]);
    }

    const p = pw | px | pa | pd;

    // deno-fmt-ignore
    switch (p) {
      case 0b0001: { this.put(ter["EA"]); break; }
      case 0b0010: { this.put(ter["ED"]); break; }
      case 0b0011: { this.put(ter['EA']); this.put(ter['ED']); break; }
      case 0b0100: { this.put(ter["EW"]); break; }
      case 0b0101: { this.put(ter["LQ"]); break; }
      case 0b0110: { this.put(ter["LE"]); break; }
      case 0b0111: { this.put(ter["UW"]); break; }
      case 0b1000: { this.put(ter["ES"]); break; }
      case 0b1001: { this.put(ter["LZ"]); break; }
      case 0b1010: { this.put(ter["LC"]); break; }
      case 0b1011: { this.put(ter["UX"]); break; }
      case 0b1100: { this.put(ter['ES']); this.put(ter['EW']); break; }
      case 0b1101: { this.put(ter["UA"]); break; }
      case 0b1110: { this.put(ter["UD"]); break; }
      case 0b1111: { this.put(ter["HS"]); break; }
    }
  }

  protected processTerrain(
    _vq: number,
    _vw: number,
    _ve: number,
    _va: number,
    vs: number,
    _vd: number,
    _vz: number,
    _vx: number,
    _vc: number,
  ): void {
    this.put(vs);
  }

  protected processGrid(): void {
    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        this.processTile(x, y);
      }
    }
  }

  protected processTile(x: number, y: number): void {
    this.tileY = y++;
    this.tileX = x++;
    const vq = this.view[(y - 1) * PROCESSOR_SIZE + (x - 1)];
    const vw = this.view[(y - 1) * PROCESSOR_SIZE + (x + 0)];
    const ve = this.view[(y - 1) * PROCESSOR_SIZE + (x + 1)];
    const va = this.view[(y + 0) * PROCESSOR_SIZE + (x - 1)];
    const vs = this.view[(y + 0) * PROCESSOR_SIZE + (x + 0)];
    const vd = this.view[(y + 0) * PROCESSOR_SIZE + (x + 1)];
    const vz = this.view[(y + 1) * PROCESSOR_SIZE + (x - 1)];
    const vx = this.view[(y + 1) * PROCESSOR_SIZE + (x + 0)];
    const vc = this.view[(y + 1) * PROCESSOR_SIZE + (x + 1)];
    if (vs === 0) {
      this.processShadow(vq, vw, ve, va, vs, vd, vz, vx, vc);
    } else {
      this.processTerrain(vq, vw, ve, va, vs, vd, vz, vx, vc);
    }
  }

  public process(chunk: Chunk): Uint16Array {
    this.reset();
    this.prepareView(chunk);
    this.processGrid();
    const workingBufferCopy = this.tileWorkingBuffer.slice(0, this.currentIndex * 3);
    return workingBufferCopy;
  }

  protected reset(): void {
    this.currentIndex = 0;
  }
}

export function provideChunkTerrainProcessor(resolver: ServiceResolver) {
  return new ChunkTerrainProcessor(
    resolver.resolve(provideSpaceManager),
  );
}
