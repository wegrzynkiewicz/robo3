export interface BinaryBlock {
  blockId: number;
  type: number;
  buffer: Uint8Array;
}

export class BinaryBlockManager {
  protected readonly blocks = new Map<number, BinaryBlock>();
  public register(block: BinaryBlock) {
    const { blockId } = block;
    this.blocks.set(blockId, block);
  }
}
