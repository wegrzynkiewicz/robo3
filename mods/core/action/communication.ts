import { Breaker, isRequiredString } from "../../common/asserts.ts";
import { fromArrayBuffer, toArrayBuffer } from "../../common/binary.ts";
import { UnknownData, PendingPromiseCollector } from "../../common/useful.ts";
import { registerService } from "../dependency/service.ts";
import { GAConversation, GADefinition, GAEnvelope, GAError, GAKind, GAManager, GAMessageConfig, GANotification, GANotify, GARequest, GAResponse, GAResult } from "./foundation.ts";
import { GAProcessor } from "./processor.ts";
import { GAEnvelopeBinaryHeader, GAEnvelopeCodec, decodeGAEnvelope, gameActionEnvelopeCodec } from "./rpc.ts";

export interface GACommunicator {
  request<TRequest extends UnknownData, TResponse extends UnknownData>(
    definition: GAConversation<TRequest, TResponse>,
    params: TRequest
  ): Promise<TResponse>;
  notify<TNotification extends UnknownData>(
    definition: GANotification<TNotification>,
    params: TNotification
  ): void;
  receive(data: unknown): Promise<void>;
}

export class OnlineGACommunicator implements GACommunicator {
  protected id = 1;
  protected readonly collector = new PendingPromiseCollector<number, GAResult>();
  protected readonly processor: GAProcessor;
  protected readonly gaManager: GAManager;
  protected readonly ws: WebSocket;

  public constructor(
    { gaManager, processor, ws }: {
      gaManager: GAManager;
      processor: GAProcessor;
      ws: WebSocket;
    },
  ) {
    this.gaManager = gaManager;
    this.processor = processor;
    this.ws = ws;
  }

  public async receive(message: unknown): Promise<void> {
    const envelope = this.decode(message);
    await this.processEnvelope(envelope);
  }

  public request<TRequest, TResponse>(
    definition: GAConversation<TRequest, TResponse>,
    params: TRequest
  ): Promise<TResponse> {
    const data = this.encode({
      config: definition.request,
      definition,
      kind: 'req',
      params,
    });
    const promise = this.collector.create(this.id);
    this.sendData(data);
    return promise;
  }

  public notify<TNotification extends UnknownData>(
    definition: GANotification<TNotification>,
    params: TNotification
  ): void {
    const data = this.encode({
      config: definition.notify,
      definition,
      kind: 'not',
      params,
    });
    this.sendData(data);
  }

  protected encode<TData>(
    { config, definition, kind, params }: {
      config: GAMessageConfig<TData>;
      definition: GADefinition,
      kind: GAKind,
      params: TData;
    }
  ): string | ArrayBuffer {
    const id = this.id++;
    const { type, codec } = config;
    const { code, index } = definition;
    switch (type) {
      case "binary": {
        const byteOffset = GAEnvelopeBinaryHeader.BYTE_LENGTH;
        const totalLength = byteOffset + codec.calcBufferSize(params);
        const buffer = new ArrayBuffer(totalLength);
        const header = new GAEnvelopeBinaryHeader(kind, index, id);
        toArrayBuffer(buffer, 0, header);
        codec.encode(buffer, byteOffset, params);
        return buffer;
      }
      case "json": {
        const envelope: GAEnvelope = {
          code,
          id,
          kind,
          params: {
            ...(codec.encode?.(params) ?? params as Record<string, unknown>)
          },
        };
        const json = JSON.stringify(envelope);
        return json;
      }
    }
  }

  protected decode(data: unknown): GAEnvelope {
    if (isRequiredString(data)) {
      const envelope = decodeGAEnvelope(data);
    }
    if (data instanceof ArrayBuffer) {
      const buffer = data;
      const header = fromArrayBuffer(buffer, 0, GAEnvelopeBinaryHeader);
      const { index, id, kind } = header;
      const definition = this.gaManager.byIndex.get(index);
      if (definition === undefined) {
        throw new Breaker('cannot-decode-envelope-with-unknown-index', { header });
      }
      const { code, type } = definition;

      const envelope: GAEnvelope = {
        code,
        id,
        kind,
        params,
      }


      switch (type) {
        case "notification": {
          if (kind !== 'not') {
            throw new Breaker('not-match-envelope-kind-and-game-action-definition', { definition, header });
          }

          break;
        }
        default: {
          throw new Breaker('cannot-decode-envelope-with-unexpected-kind', { header });
        }
      }
      const params = definition.codec.decode(buffer, byteOffset);
      const envelope = {
        code: codec.code,
        id,
        kind,
        params,
      };
      return envelope;
    }
    throw new Breaker("TODO");
  }

  protected sendData(data: string | ArrayBuffer): void {
    const { ws } = this;
    const { readyState } = ws;
    if (readyState !== ws.OPEN) {
      throw new Breaker('ws-not-open', { readyState });
    }
    ws.send(data);
    // TODO: process WS
  }

  protected async processEnvelope(envelope: GAEnvelope): Promise<void> {
    switch (envelope.kind) {
      case "err": {
        await this.processError(envelope);
        break;
      }
      case "not": {
        await this.processNotification(envelope);
        break;
      }
      case "req": {
        await this.processRequest(envelope);
        break;
      }
      case "res": {
        await this.processResponse(envelope);
        break;
      }
    }
  }

  protected async processError(error: GAError): Promise<void> {
    const { id } = error;
    if (id > 0) {
      this.collector.resolve(id, error);
    }
  }

  protected async processNotification(notification: GANotify): Promise<void> {
    try {
      await this.processor.processNotification(notification);
    } catch (error) {
      throw error;
      // TODO: log
    }
  }

  protected async processRequest(action: GARequest): Promise<void> {
    const { code, id } = action;
    try {
      const params = await this.processor.processRequest(action);
      const responseAction: GAResponse = {
        code,
        id,
        params,
        kind: "res",
      };
      this.sendData(responseAction);
    } catch (error) {
      const isBreaker = error instanceof Breaker;
      const errorAction: GAError = {
        code: isBreaker ? error.message : "unknown",
        id: id ?? 0,
        kind: "err",
        params: isBreaker ? error.options : {},
      };
      this.sendData(errorAction);
      // TODO: log
    }
  }

  protected async processResponse(response: GAResponse): Promise<void> {
    const { id } = response;
    if (id > 0) {
      this.collector.resolve(id, response);
    }
  }
}

export const onlineGACommunicator = registerService({
  dependencies: {
    codec: gameActionEnvelopeCodec,
  },
  provider: async (
    { codec }: {
      codec: GAEnvelopeCodec;
    },
    { processor, ws }: {
      processor: GAProcessor;
      ws: WebSocket;
    },
  ) => {
    return new OnlineGACommunicator({ codec, processor, ws });
  },
});
