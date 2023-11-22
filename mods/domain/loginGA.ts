import { registerGADefinition } from "../core/action/foundation.ts";

export interface LoginGARequest {
  token: string;
}

export const loginGARequestDef = registerGADefinition<LoginGARequest>({
  encoding: {
    type: "json",
  },
  key: 0x0004,
  kind: "login-req",
});

export interface LoginGAResponse {
  status: number;
}

export const loginGAResponseDef = registerGADefinition<LoginGAResponse>({
  encoding: {
    type: "json",
  },
  key: 0x0005,
  kind: "login-res",
});
