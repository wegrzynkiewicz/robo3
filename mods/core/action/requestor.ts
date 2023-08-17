import { isObject, isGreaterThenZero } from "../../common/asserts.ts";
import { Deferred, deferred } from "../../deps.ts";
import { GAEnvelope } from "./codec.ts";
import { GADefinition } from "./foundation.ts";
import { GAProcessor } from "./processor.ts";
import { GASender } from "./sender.ts";

export type WithId<TData> = { id: number } & TData;
export type WithoutId<TData> = Omit<TData, 'id'>;

export interface GARequest<TRequest, TResponse> {
  id: number,
  promise: Deferred<TResponse>,
  requestDefinition: GADefinition<TRequest>,
  responseDefinition: GADefinition<TResponse>,
}

export type AnyGARequest = GARequest<unknown, unknown>;

export interface GARequestor {
  request<TRequest, TResponse>(
    requestDefinition: GADefinition<TRequest>,
    responseDefinition: GADefinition<TResponse>,
    data: TRequest,
  ): Promise<TResponse>;
}

export class UniversalGARequestor implements GAProcessor, GARequestor {
  protected id = 1;
  protected readonly requests = new Map<number, AnyGARequest>();

  public constructor(
    public readonly sender: GASender,
  ) {

  }

  public canProcess<TData>(definition: GADefinition<TData>, envelope: GAEnvelope<TData>): boolean {
    if (!isObject<WithId<TData>>(envelope)) {
      return false;
    }
    const id = envelope.id as unknown;
    if (!isGreaterThenZero(id)) {
      return false;
    }
    const request = this.requests.get(id);
    if (request === undefined) {
      return false;
    }
    if (request.responseDefinition !== definition) {
      return false;
    }
    return true;
  }

  public async process<TData>(_definition: GADefinition<TData>, envelope: GAEnvelope<TData>): Promise<void> {
    const id = envelope.id;
    const request = this.requests.get(id);
    const { promise } = request!;
    promise.resolve(envelope);
    this.requests.delete(id);
  }

  public request<TRequest, TResponse>(
    requestDefinition: GADefinition<TRequest>,
    responseDefinition: GADefinition<TResponse>,
    params: TRequest,
  ): Promise<TResponse> {
    const id = this.id++;
    const { kind, codec } = requestDefinition;
    const envelope = { id, kind, params };
    const promise = deferred<TResponse>();
    const request: GARequest<TRequest, TResponse> = {
      id,
      promise,
      requestDefinition,
      responseDefinition,
    }
    const data = codec.encode(envelope);
    this.requests.set(id, request);
    this.sender.sendRaw(data);
    return promise;
  }
}
