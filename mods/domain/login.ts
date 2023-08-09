import { assertPositiveNumber, assertRequiredString } from "../common/asserts.ts";
import { GAJsonCodec, registerGADefinition } from "../core/action/foundation.ts";

export const loginDefinition = registerGADefinition({
  code: 'login',
  index: 0x0001,
  type: 'conversation',
});

export interface LoginRequest {
  token: string;
}

export class GADescriptor<TData> {
  
}

export class GARequestDescriptor<TRequest, TResponse> {

}

export class GAResponseDescriptor<TData> {

}

export const loginRequestDef = new GARequestDescriptor<LoginRequest>({
  loginDefinition, 
  codec,
});

export 

export interface LoginResponse {
  status: number;
}

export const loginGA = registerGADefinition<LoginRequest, LoginResponse>({
  code: 'login',
  index: 0x0001,
  request: {
    codec: {
      decode(data: Record<string, unknown>): LoginRequest {
        const { token } = data;
        assertRequiredString(token, 'invalid-token-parameter');
        return { token };
      },
    },
    type: "json",
  },
  response: {
    codec: {
      decode(data: Record<string, unknown>): LoginResponse {
        const { status } = data;
        assertPositiveNumber(status, 'invalid-status-parameter');
        return { status };
      },
    },
    type: "json",
  }
}) 
