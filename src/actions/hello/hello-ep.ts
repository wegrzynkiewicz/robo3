import { assertObject, assertRequiredString } from "../../common/utils/asserts.ts";
import { EPHandler, EPContext, EPRoute } from "../../common/web/endpoint.ts";

export interface HelloEPParams {
  name: string;
}

export interface HelloEPResponse {
  message: string;
}

export function parseHelloEPParams(value: unknown): HelloEPParams {
  assertObject<HelloEPParams>(value, "hello-params-must-be-object");
  const { name } = value;
  assertRequiredString(name, "hello-params-name-must-be-string");
  return { name };
}

export class HelloEPHandler implements EPHandler {
  public readonly route = new EPRoute("GET", "/hello/:name");
  public async handle({ params }: EPContext): Promise<Response> {
    const { name } = parseHelloEPParams(params);
    const payload: HelloEPResponse = { message: `Hello, ${name}!` };
    return Response.json(payload);;
  }
}

export function provideHelloEPHandler() {
  return new HelloEPHandler();
}
