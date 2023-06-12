import { Registry } from "../../common/registry.ts";

export interface EGO {
  i: string;
  t: number;
  p: number;
}

export interface GOMeta {
  goId: string;
}

export type GOTypeComplete = {
  extends: string;
  globalId: string;
  special: boolean;
  walkable: boolean;
  walkSpeed: number;
}

export type GOType = { globalId: string } & Partial<GOTypeComplete>

export const defaultGOBase: GOTypeComplete = {
  extends: '',
  globalId: '',
  special: false,
  walkable: true,
  walkSpeed: 1.0,
};

export const goTypeRegistry = new Registry<GOType>(e => e.globalId);
export const registerGameObjectType = goTypeRegistry.register.bind(goTypeRegistry);
