import { Being } from "./manager.ts";

export function provideScopedUpdatedBeingList() {
  return new Set<Being>();
}
