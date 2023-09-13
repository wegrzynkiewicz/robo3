{
  class RectangleOnePoint {
    public constructor(
      public x: number,
      public y: number,
      public w: number,
      public h: number
    ) { }

    public intersects(range: RectangleOnePoint): boolean {
      return (
        range.x + range.w >= this.x &&
        range.x <= this.x + this.w &&
        range.y + range.h >= this.y &&
        range.y <= this.y + this.h
      );
    }

    public intersectsDeconstructive(range: RectangleOnePoint): boolean {
      const { x, y, w, h } = this;
      return (
        range.x + range.w >= x &&
        range.x <= x + w &&
        range.y + range.h >= y &&
        range.y <= y + h
      );
    }
  }

  const r1 = new RectangleOnePoint(32, 32, 32, 32);
  const r2 = new RectangleOnePoint(32, 32, 32, 32);

  Deno.bench("RectangleOnePoint::new", () => {
    new RectangleOnePoint(32, 32, 32, 32);
  });
  Deno.bench("RectangleOnePoint::intersects", () => {
    r1.intersects(r2);
  });
  Deno.bench("RectangleOnePoint::intersects", () => {
    r1.intersects(r2);
  });
}

{
  class RectangleTwoPoint {
    constructor(
      public x1: number,
      public y1: number,
      public x2: number,
      public y2: number
    ) { }

    intersects(range: RectangleTwoPoint): boolean {
      return (
        range.x2 >= this.x1 &&
        range.x1 <= this.x2 &&
        range.y2 >= this.y1 &&
        range.y1 <= this.y2
      );
    }

    intersectsDeconstructive(range: RectangleTwoPoint): boolean {
      const { x1, y1, x2, y2 } = this;
      return (
        range.x2 >= x1 &&
        range.x1 <= x2 &&
        range.y2 >= y1 &&
        range.y1 <= y2
      );
    }
  }

  const r1 = new RectangleTwoPoint(32, 32, 32, 32);
  const r2 = new RectangleTwoPoint(32, 32, 32, 32);

  Deno.bench("RectangleTwoPoint::creation", () => {
    new RectangleTwoPoint(32, 32, 32, 32);
  });
  Deno.bench("RectangleTwoPoint::intersects", () => {
    r1.intersects(r2);
  });
  Deno.bench("RectangleTwoPoint::intersectsDeconstructive", () => {
    r1.intersectsDeconstructive(r2);
  });
}

{
  interface RectangleInterface {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }

  const intersects = function (r1: RectangleInterface, r2: RectangleInterface): boolean {
    return (
      r1.x2 >= r2.x1 &&
      r1.x1 <= r2.x2 &&
      r1.y2 >= r2.y1 &&
      r1.y1 <= r2.y2
    );
  }

  const rect = function (x1: number, y1: number, x2: number, y2: number): RectangleInterface {
    return { x1, y1, x2, y2 };
  };

  const r1 = rect(32, 32, 32, 32);
  const r2 = rect(32, 32, 32, 32);

  Deno.bench("RectangleInterface::creation", () => {
    ({ x1: 32, y1: 32, x2: 32, y2: 32 });
  });
  Deno.bench("RectangleInterface::rect", () => {
    const r: RectangleInterface = rect(32, 32, 32, 32);
  });
  Deno.bench("RectangleInterface::intersects", () => {
    intersects(r1, r2);
  });
}
