interface CornerRectangle {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function cornerRect(x1: number, y1: number, x2: number, y2: number): CornerRectangle {
  return { x1, y1, x2, y2 };
}

function intersectsNonStrict(r1: CornerRectangle, r2: CornerRectangle): boolean {
  return (
    r1.x2 > r2.x1 &&
    r1.x1 < r2.x2 &&
    r1.y2 > r2.y1 &&
    r1.y1 < r2.y2
  );
}

interface QuadTree<TInstance> {
  readonly depth: number;
  insert(rect: CornerRectangle, instance: TInstance): boolean;
  query(rect: CornerRectangle, outputs: TInstance[]): void;
}

class ParentQuadTree<TInstance> implements QuadTree<TInstance> {
  public readonly northwest: QuadTree<TInstance>;
  public readonly northeast: QuadTree<TInstance>;
  public readonly southwest: QuadTree<TInstance>;
  public readonly southeast: QuadTree<TInstance>;

  public constructor(
    public readonly rect: CornerRectangle,
    public readonly depth: number,
    maxDepth: number,
  ) {
    const { x1, y1, x2, y2 } = rect;
    const mx = x1 + (x2 - x1) / 2;
    const my = y1 + (y2 - y1) / 2;
    const ne = cornerRect(mx, y1, x2, my);
    const nw = cornerRect(x1, y1, mx, my);
    const se = cornerRect(mx, my, x2, y2);
    const sw = cornerRect(x1, my, mx, y2);
    const nextDepth = depth + 1;
    const tree = nextDepth === maxDepth - 1 ? LeafQuadTree : ParentQuadTree;
    this.northeast = new tree(ne, nextDepth, maxDepth);
    this.northwest = new tree(nw, nextDepth, maxDepth);
    this.southeast = new tree(se, nextDepth, maxDepth);
    this.southwest = new tree(sw, nextDepth, maxDepth);
  }

  public insert(rect: CornerRectangle, instance: TInstance): boolean {
    if (intersectsNonStrict(this.rect, rect)) {
      if (this.northeast.insert(rect, instance)) return true;
      if (this.northwest.insert(rect, instance)) return true;
      if (this.southeast.insert(rect, instance)) return true;
      if (this.southwest.insert(rect, instance)) return true;
    }
    return false;
  }

  public query(rect: CornerRectangle, outputs: TInstance[]): void {
    if (intersectsNonStrict(this.rect, rect)) {
      this.northeast.query(rect, outputs);
      this.northwest.query(rect, outputs);
      this.southeast.query(rect, outputs);
      this.southwest.query(rect, outputs);
    }
  }
}

class LeafQuadTree<TInstance> implements QuadTree<TInstance> {
  public readonly instances = new Set<TInstance>();
  public constructor(
    public readonly rect: CornerRectangle,
    public readonly depth: number,
  ) {}

  public insert(rect: CornerRectangle, instance: TInstance): boolean {
    if (intersectsNonStrict(this.rect, rect)) {
      this.instances.add(instance);
      return true;
    }
    return false;
  }

  public query(rect: CornerRectangle, outputs: TInstance[]): void {
    if (intersectsNonStrict(this.rect, rect)) {
      outputs.push(...this.instances);
    }
  }
}

interface Item {
  rect: CornerRectangle;
}

const TILE_SIZE = 32;
const CHUNK_SIZE = 1024;

function* genItems(sx: number, sy: number): Generator<Item, void, unknown> {
  for (let y = 0; y < TILE_SIZE; y++) {
    for (let x = 0; x < TILE_SIZE; x++) {
      const x1 = x * 32 + sx;
      const y1 = y * 32 + sy;
      const x2 = x1 + 32;
      const y2 = y1 + 32;
      yield { rect: { x1, y1, x2, y2 } };
    }
  }
}

function* genChunks() {
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      const x1 = x * CHUNK_SIZE;
      const y1 = y * CHUNK_SIZE;
      const x2 = x1 + CHUNK_SIZE;
      const y2 = y1 + CHUNK_SIZE;
      const rect = { x1, y1, x2, y2 };
      const data = [...genItems(x1, y1)];
      const tree = new ParentQuadTree<Item>(rect, 0, 4);
      for (const element of data) {
        tree.insert(element.rect, element);
      }
      yield {
        rect,
        data,
        tree,
      };
    }
  }
}

const pad = 20;
const chunks = [...genChunks()];
const view = { x1: 1024 - pad, y1: 1024 - pad, x2: 1024 + 480 + pad, y2: 1024 + 352 + pad };

Deno.bench("search with naive way", () => {
  const output = [];
  for (const chunk of chunks) {
    if (intersectsNonStrict(view, chunk.rect)) {
      for (const element of chunk.data) {
        if (intersectsNonStrict(view, element.rect)) {
          output.push(element);
        }
      }
    }
  }
});

Deno.bench("search with naive way and better loop", () => {
  const output = [];
  for (const chunk of chunks) {
    if (intersectsNonStrict(view, chunk.rect)) {
      const length = chunk.data.length;
      const data = chunk.data;
      for (let i = 0; i < length; i++) {
        const element = data[i];
        if (intersectsNonStrict(view, element.rect)) {
          output.push(element);
        }
      }
    }
  }
});

Deno.bench("search with quad tree", () => {
  const output: Item[] = [];
  for (const chunk of chunks) {
    chunk.tree.query(view, output);
  }
});
