import { assertObject, assertPositiveNumber, assertRequiredString } from "../common/asserts.ts";
import { GAJsonCodec } from "../core/action/codec.ts";
import { registerGADefinition } from "../core/action/foundation.ts";

export interface LoginGARequest {
  token: string;
}

export interface LoginGAResponse {
  status: number;
}

export const loginGADef = registerGADefinition({
  code: "login",
  index: 0x0001,
  request: new GAJsonCodec({
    parse(data: unknown): LoginGARequest {
      assertObject<LoginGARequest>(data, "invalid-data");
      const { token } = data;
      assertRequiredString(token, "invalid-token-parameter");
      return { token };
    },
  }),
  response: new GAJsonCodec({
    parse(data: unknown): LoginGAResponse {
      assertObject<LoginGAResponse>(data, "invalid-data");
      const { status } = data;
      assertPositiveNumber(status, "invalid-status-parameter");
      return { status };
    },
  }),
  type: "conversation",
});
