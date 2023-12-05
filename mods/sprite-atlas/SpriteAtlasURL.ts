import { assertEqual, assertRequiredString } from "../common/asserts.ts";
import { Breaker } from "../common/breaker.ts";

export class SpriteAtlasURL {
  public static readonly ALLOWED_LAYOUTS = ["single", "terrain"];

  protected constructor(
    public readonly url: URL,
    public readonly vendor: string,
    public readonly spriteId: string,
    public readonly layout: string,
  ) {
  }

  public static fromURL(url: URL) {
    const pathSegments = url.pathname.split("/");
    const fileName = pathSegments[pathSegments.length - 1];
    const segments = fileName.split(".");
    if (segments.length !== 2) {
      throw new Breaker("unexpected-sprite-atlas-url-extension", { url });
    }
    const [
      vendor,
      sprite,
      layout,
      resource,
      format,
    ] = segments;
    assertRequiredString(vendor, "invalid-sprite-atlas-url-vendor", { url });
    assertRequiredString(sprite, "invalid-sprite-atlas-url-sprite", { url });
    assertRequiredString(layout, "invalid-sprite-atlas-url-layout", { url });
    assertEqual(resource, "spr", "unexpected-sprite-atlas-url-resource", { resource, url });
    assertEqual(format, "spr", "unexpected-sprite-atlas-url-format", { format, url });
    const spriteId = `${vendor}/${sprite}`;
    if (!SpriteAtlasURL.ALLOWED_LAYOUTS.includes(layout)) {
      throw new Breaker("invalid-sprite-atlas-url-layout", {
        allowed: SpriteAtlasURL.ALLOWED_LAYOUTS,
        url,
      });
    }
    const spriteAtlasURL = new SpriteAtlasURL(
      url,
      vendor,
      spriteId,
      layout,
    );
    return spriteAtlasURL;
  }

  public static fromString(probablyURL: string) {
    const url = new URL(probablyURL);
    const spriteAtlasURL = SpriteAtlasURL.fromURL(url);
    return spriteAtlasURL;
  }
}
