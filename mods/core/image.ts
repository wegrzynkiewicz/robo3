import { assertTrue } from "../common/asserts.ts";
import { deferred } from "../deps.ts";

interface ImageResource {
  imageId: string;
  image: HTMLImageElement;
  src: string;
}

interface ImageManager {
  resources: Map<string, ImageResource>;
}

export class BrowserImageManager implements ImageManager {
  public readonly resources = new Map<string, ImageResource>();
  public loadImage(
    { height, imageId, src, width }: {
      height: number;
      imageId: string;
      src: string;
      width: number;
    },
  ): Promise<ImageResource> {
    const promise = deferred<ImageResource>();
    const image = new Image();
    image.src = src;
    image.onload = () => {
      try {
        assertTrue(image.width === width, "unexpected-image-width", { src, imageWidth: image.width, width });
        assertTrue(image.height === height, "unexpected-image-height", { src, imageHeight: image.height, height });
      } catch (error: unknown) {
        promise.reject(error);
        return;
      }
      const resource = {
        imageId,
        image,
        src,
      };
      this.resources.set(imageId, resource);
      promise.resolve(resource);
    };
    return promise;
  }
}
