import { assertTrue } from "../../../common/asserts.ts";
import { deferred } from "../../../deps.ts";

export function loadImage(
  { height, source, width }: {
    height: number;
    source: string;
    width: number;
  },
): Promise<HTMLImageElement> {
  const promise = deferred<HTMLImageElement>();
  const image = new Image();
  image.src = source;
  image.onload = () => {
    try {
      assertTrue(image.width === width, "unexpected-image-width", { source, imageWidth: image.width, width });
      assertTrue(image.height === height, "unexpected-image-height", { source, imageHeight: image.height, height });
    } catch (error: unknown) {
      promise.reject(error);
      return;
    }
    promise.resolve(image);
  };
  return promise;
}
