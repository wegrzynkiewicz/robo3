import { registerService } from "../../../core/dependency/service.ts";

export class PrimaryUBO {
  public readonly projectionMatrix = new Float32Array(16);
  public readonly viewMatrix = new Float32Array(16);
}

export const primaryUBOService = registerService({
  async provider() {
    return new PrimaryUBO();
  },
});
