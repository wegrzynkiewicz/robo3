import { Deferred, deferred } from "../../deps.ts";
import { ServiceResolver } from "../dependency/service.ts";
import { CABusSubscriber } from "./bus.ts";
import { CARequestor, CASender, CADefinition, CAEnvelope } from "./define.ts";
import { provideScopedCASender } from "./online-sender.ts";

export interface CARequest<TRequest, TResponse> {
  id: number;
  promise: Deferred<TResponse>;
  requestDefinition: CADefinition<TRequest>;
  responseDefinition: CADefinition<TResponse>;
}

export type AnyCARequest = CARequest<unknown, unknown>;

export class UniversalCARequestor implements CABusSubscriber, CARequestor {
  public static readonly MAX_SAFE_ID = (2 ** 16) - 1;
  protected id = 0;
  protected readonly requests = new Map<number, AnyCARequest>();

  public constructor(
    public readonly sender: CASender,
  ) {}

  public async subscribe<TData>(_definition: CADefinition<TData>, envelope: CAEnvelope<TData>): Promise<void> {
    const id = envelope.id;
    if (id <= 0) {
      return;
    }
    const request = this.requests.get(id);
    if (request === undefined) {
      return;
    }
    const { promise } = request;
    promise.resolve(envelope);
    this.requests.delete(id);
  }

  public request<TRequest, TResponse>(
    requestDefinition: CADefinition<TRequest>,
    responseDefinition: CADefinition<TResponse>,
    params: TRequest,
  ): Promise<TResponse> {
    this.id++;
    const id = this.id % UniversalCARequestor.MAX_SAFE_ID;
    const { kind } = requestDefinition;
    const envelope: CAEnvelope<TRequest> = { id, kind, params };
    const promise = deferred<TResponse>();
    const request: CARequest<TRequest, TResponse> = {
      id,
      promise,
      requestDefinition,
      responseDefinition,
    };
    this.requests.set(id, request);
    this.sender.sendEnvelope(requestDefinition, envelope);
    return promise;
  }
}

export function provideScopedCARequestor(resolver: ServiceResolver) {
  return new UniversalCARequestor(
    resolver.resolve(provideScopedCASender),
  );
}
