import { Deferred, deferred } from "../../deps.ts";
import { ServiceResolver } from "../dependency/service.ts";
import { GABusSubscriber } from "./bus.ts";
import { GARequestor, GASender, GADefinition, GAEnvelope } from "./define.ts";
import { provideScopedGASender } from "./online-sender.ts";

export interface GARequest<TRequest, TResponse> {
  id: number;
  promise: Deferred<TResponse>;
  requestDefinition: GADefinition<TRequest>;
  responseDefinition: GADefinition<TResponse>;
}

export type AnyGARequest = GARequest<unknown, unknown>;

export class UniversalGARequestor implements GABusSubscriber, GARequestor {
  public static readonly MAX_SAFE_ID = (2 ** 16) - 1;
  protected id = 0;
  protected readonly requests = new Map<number, AnyGARequest>();

  public constructor(
    public readonly sender: GASender,
  ) {}

  public async subscribe<TData>(_definition: GADefinition<TData>, envelope: GAEnvelope<TData>): Promise<void> {
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
    requestDefinition: GADefinition<TRequest>,
    responseDefinition: GADefinition<TResponse>,
    params: TRequest,
  ): Promise<TResponse> {
    this.id++;
    const id = this.id % UniversalGARequestor.MAX_SAFE_ID;
    const { kind } = requestDefinition;
    const envelope: GAEnvelope<TRequest> = { id, kind, params };
    const promise = deferred<TResponse>();
    const request: GARequest<TRequest, TResponse> = {
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

export function provideScopedGARequestor(resolver: ServiceResolver) {
  return new UniversalGARequestor(
    resolver.resolve(provideScopedGASender),
  );
}
