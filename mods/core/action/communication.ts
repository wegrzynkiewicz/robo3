import { assertEqual, assertObject, Breaker, isRequiredString } from "../../common/asserts.ts";
import { fromArrayBuffer } from "../../common/binary.ts";
import { Logger, logger } from "../../common/logger.ts";
import { PendingPromiseCollector } from "../../common/useful.ts";
import { registerService } from "../dependency/service.ts";
import { decodeGAJsonEnvelope, GABinaryHeader } from "./codec.ts";
import { GAConversation, GADefinition, GAEnvelope, GAHeader, GAKind, GAManager, gaManager, GANotification } from "./foundation.ts";
import { GAProcessor } from "./processor.ts";

export interface GACommunicator {
  request<TRequest, TResponse>(
    definition: GAConversation<TRequest, TResponse>,
    params: TRequest,
  ): Promise<TResponse>;
  notify<TNotification>(
    definition: GANotification<TNotification>,
    params: TNotification,
  ): void;
  receive(data: unknown): Promise<void>;
}

export class OnlineGACommunicator implements GACommunicator {
  protected id = 1;
  protected readonly collector = new PendingPromiseCollector<number, GAEnvelope<unknown>>();

  public constructor(
    public readonly gaManager: GAManager,
    public readonly logger: Logger,
    public readonly processor: GAProcessor,
    public readonly ws: WebSocket,
  ) {
  }

  public async receive(message: unknown): Promise<void> {
    const [definition, envelope] = this.decode(message);
    await this.processEnvelope(definition, envelope);
  }

  public async request<TRequest, TResponse>(
    definition: GAConversation<TRequest, TResponse>,
    params: TRequest,
  ): Promise<TResponse> {
    const { code, request } = definition;
    const id = this.id++;
    const header: GAHeader = { code, id, kind: "req" };
    const data = request.encode(definition, header, params);
    const promise = this.collector.create(id);
    this.sendData(data);
    const response = await promise;
    return response.params as TResponse;
  }

  public notify<TNotification>(
    definition: GANotification<TNotification>,
    params: TNotification,
  ): void {
    const { code, notify } = definition;
    const id = this.id++;
    const header: GAHeader = { code, id, kind: "not" };
    const data = notify.encode(definition, header, params);
    this.sendData(data);
  }

  protected decode(data: unknown): [GADefinition, GAEnvelope<unknown>] {
    const [definition, id, kind, body] = this.decodeEnvelope(data);
    const header = { code: definition.code, id, kind };
    const params = this.decodeEnvelopeParams(definition, header, body);
    const envelope = { ...header, params };
    return [definition, envelope];
  }

  protected decodeEnvelope(data: unknown): [GADefinition, number, GAKind, unknown] {
    if (isRequiredString(data)) {
      const decodedHeader = decodeGAJsonEnvelope(data);
      const { code, id, kind, params } = decodedHeader;
      const definition = this.gaManager.byCode.get(code);
      assertObject(definition, "cannot-decode-envelope-with-unknown-code", { definition, code });
      return [definition, id, kind, params];
    } else if (data instanceof ArrayBuffer) {
      const decodedHeader = fromArrayBuffer(data, 0, GABinaryHeader);
      const { id, index, kind } = decodedHeader;
      const definition = this.gaManager.byIndex.get(index);
      assertObject(definition, "cannot-decode-envelope-with-unknown-index", { definition, index });
      return [definition, id, kind, data];
    } else {
      throw new Breaker("unexpected-game-action-communication-message");
    }
  }

  protected decodeEnvelopeParams(definition: GADefinition, header: GAHeader, data: unknown): unknown {
    const type = definition.type;
    switch (header.kind) {
      case "err": {
        return data;
      }
      case "not": {
        assertEqual(type, "notification", "cannot-match-ga-kind-with-def", { definition, header });
        return definition.notify.decode(definition, header, data);
      }
      case "req": {
        assertEqual(type, "conversation", "cannot-match-ga-kind-with-def", { definition, header });
        return definition.request.decode(definition, header, data);
      }
      case "res": {
        assertEqual(type, "conversation", "cannot-match-ga-kind-with-def", { definition, header });
        return definition.response.decode(definition, header, data);
      }
    }
  }

  protected sendData(data: string | ArrayBuffer): void {
    const { ws } = this;
    const { readyState } = ws;
    if (readyState !== ws.OPEN) {
      throw new Breaker("ws-not-open", { readyState });
    }
    ws.send(data);
    // TODO: process WS
  }

  protected async processEnvelope(definition: GADefinition, envelope: GAEnvelope<unknown>): Promise<void> {
    switch (envelope.kind) {
      case "err": {
        return this.processError(definition, envelope);
      }
      case "not": {
        assertEqual(definition.type, "notification", "cannot-match-ga-kind-with-def", { definition });
        return this.processNotification(definition, envelope);
      }
      case "req": {
        assertEqual(definition.type, "conversation", "cannot-match-ga-kind-with-def", { definition });
        return this.processRequest(definition, envelope);
      }
      case "res": {
        assertEqual(definition.type, "conversation", "cannot-match-ga-kind-with-def", { definition });
        return this.processResponse(definition, envelope);
      }
    }
  }

  protected async processError(definition: GADefinition, envelope: GAEnvelope<unknown>): Promise<void> {
    const { id } = envelope;
    const breaker = new Breaker("receive-error-envelope", { definition, envelope });
    if (id > 0 && this.collector.has(id)) {
      this.collector.reject(id, breaker);
    }
    this.logger.error("receive-error-envelope", { definition, envelope });
  }

  protected async processNotification(
    definition: GANotification<unknown>,
    envelope: GAEnvelope<unknown>,
  ): Promise<void> {
    try {
      await this.processor.notification.process(definition, envelope);
    } catch (error) {
      const { code, id } = envelope;
      const isBreaker = error instanceof Breaker;
      const result: GAEnvelope<unknown> = {
        code,
        id,
        kind: "err",
        params: {
          message: isBreaker ? error.message : "unknown-error",
          options: isBreaker ? error.options : {},
          error: error instanceof Error ? error.stack : error,
        },
      };
      this.logger.error("error-then-processing-game-notification", { definition, envelope, error });
      const json = JSON.stringify(result);
      this.sendData(json);
      if (!isBreaker) {
        throw new Breaker("unknown-error-then-processing-game-notification", { definition, envelope });
      }
    }
  }

  protected async processRequest(
    definition: GAConversation<unknown, unknown>,
    envelope: GAEnvelope<unknown>,
  ): Promise<void> {
    const { code, id } = envelope;
    try {
      const params = await this.processor.request.process(definition, envelope);
      const header: GAHeader = { code, id, kind: "res" };
      const response = definition.response.encode(definition, header, params);
      this.sendData(response);
    } catch (error) {
      const isBreaker = error instanceof Breaker;
      const result: GAEnvelope<unknown> = {
        code,
        id,
        kind: "err",
        params: {
          message: isBreaker ? error.message : "unknown-error",
          options: isBreaker ? error.options : {},
        },
      };
      this.logger.error("error-then-processing-game-request", { definition, envelope });
      const json = JSON.stringify(result);
      this.sendData(json);
      if (!isBreaker) {
        throw new Breaker("unknown-error-then-processing-game-request", { definition, envelope });
      }
    }
  }

  protected async processResponse(
    definition: GAConversation<unknown, unknown>,
    envelope: GAEnvelope<unknown>,
  ): Promise<void> {
    const { id } = envelope;
    if (id > 0) {
      this.collector.resolve(id, envelope);
    }
  }
}

export const onlineGACommunicator = registerService({
  dependencies: {
    gaManager,
  },
  provider: async (
    { gaManager }: {
      gaManager: GAManager;
    },
    { processor, ws }: {
      processor: GAProcessor;
      ws: WebSocket;
    },
  ) => {
    return new OnlineGACommunicator(
      gaManager,
      logger,
      processor,
      ws,
    );
  },
});
