import { EPHandler, EPRoute } from "../../common/web/endpoint.ts";

export const methodOptionsEPRoute = new EPRoute("OPTIONS", "/*");

export class MethodOptionsEP implements EPHandler {
  public async handle(): Promise<Response> {
    const response = new Response(null, {status: 200});
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
    return response;
  }
}

