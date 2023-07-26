import { Breaker } from "../../common/asserts.ts";
import { PendingPromiseCollector } from "../../common/useful.ts";
import { RPCCodec } from "./rpc.ts";

export interface GameActionRequest {
  id: number;
  params: Record<string, unknown>;
  request: string;
  type: "req";
}

export interface GameActionNotification {
  id: number;
  notify: string;
  params: Record<string, unknown>;
  type: "not";
}

export interface GameActionError {
  id: number;
  error: string;
  params: Record<string, unknown>;
  type: "err";
}

export interface GameActionResponse {
  id: number;
  params: Record<string, unknown>;
  response: string;
  type: "res";
}

export type GameActionEnvelope = GameActionError | GameActionNotification | GameActionRequest | GameActionResponse;
export type GameActionResult = GameActionResponse | GameActionError;

interface GameActionCommunicator {
  receive(data: unknown): Promise<void>;
  request(request: string, params: Record<string, unknown>): Promise<GameActionResult>;
  notify(notify: string, params: Record<string, unknown>): void;
}

export interface GameActionProcessor {
  processRequest(request: GameActionRequest): Promise<Record<string, unknown>>;
  processNotification(notification: GameActionNotification): Promise<void>;
}

export class OnlineRPCGameActionCommunicator implements GameActionCommunicator {

  protected id = 1;
  protected readonly codec: RPCCodec;
  protected readonly collector = new PendingPromiseCollector<number, GameActionResult>();
  protected readonly processor: GameActionProcessor;
  protected readonly ws: WebSocket;

  public constructor(
    { codec, processor, ws }: {
      codec: RPCCodec,
      processor: GameActionProcessor;
      ws: WebSocket;
    },
  ) {
    this.codec = codec;
    this.processor = processor;
    this.ws = ws;
  }

  public request(request: string, params: Record<string, unknown>): Promise<GameActionResult> {
    const action: GameActionRequest = {
      id: this.id++,
      params,
      request,
      type: "req",
    };
    const promise = this.collector.create(action.id);
    this.sendData(action);
    return promise;
  }

  public notify(notify: string, params: Record<string, unknown>): void {
    const action: GameActionNotification = {
      id: this.id++,
      params,
      notify,
      type: "not",
    };
    this.sendData(action);
  }

  public async receive(message: unknown): Promise<void> {
    const envelope = this.codec.decode(message);
    await this.processEnvelope(envelope);
  }

  protected async processEnvelope(envelope: GameActionEnvelope): Promise<void> {
    switch (envelope.type) {
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

  protected async processError(error: GameActionError): Promise<void> {
    const { id } = error;
    if (id > 0) {
      this.collector.resolve(id, error);
    }
  }

  protected async processNotification(notification: GameActionNotification): Promise<void> {
    try {
      await this.processor.processNotification(notification);
    } catch (error) {
      throw error;
      // TODO: log
    }
  }

  protected async processRequest(action: GameActionRequest): Promise<void> {
    const { id, request } = action;
    try {
      const params = await this.processor.processRequest(action)
      const responseAction: GameActionResponse = {
        id,
        params,
        response: request,
        type: "res",
      };
      this.sendData(responseAction);
    } catch (error) {
      const isBreaker = error instanceof Breaker;
      const errorAction: GameActionError = {
        id: id ?? 0,
        error: isBreaker ? error.message : 'unknown',
        params: isBreaker ? error.options : {},
        type: "err",
      };
      this.sendData(errorAction);
      // TODO: log
    }
  }

  protected async processResponse(response: GameActionResponse): Promise<void> {
    const { id } = response;
    if (id > 0) {
      this.collector.resolve(id, response);
    }
  }

  protected sendData(action: GameActionEnvelope): void {
    const data = this.codec.encode(action);
    this.ws.send(data);
    // TODO: process WS
  }
}
