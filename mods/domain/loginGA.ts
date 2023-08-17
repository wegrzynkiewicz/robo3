import { GAJsonCodec } from "../core/action/codec.ts";
import { registerGADefinition } from "../core/action/foundation.ts";

export interface LoginGARequest {
  token: string;
}

export const loginGARequestDef = registerGADefinition({
  codec: new GAJsonCodec<LoginGARequest>(),
  key: 0x0001,
  kind: 'login-req',
});

export interface LoginGAResponse {
  status: number;
}

export const loginGAResponseDef = registerGADefinition({
  codec: new GAJsonCodec<LoginGAResponse>(),
  key: 0x0002,
  kind: 'login-res',
});
