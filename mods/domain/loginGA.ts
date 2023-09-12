import { registerGADefinition } from "../core/action/foundation.ts";

export interface LoginGARequest {
  token: string;
}

export const loginGARequestDef = registerGADefinition<LoginGARequest>({
  encoding: {
    type: "json",
  },
  key: 0x0001,
  kind: "login-req",
});

export interface LoginGAResponse {
  status: number;
}

export const loginGAResponseDef = registerGADefinition<LoginGAResponse>({
  encoding: {
    type: "json",
  },
  key: 0x0002,
  kind: "login-res",
});
