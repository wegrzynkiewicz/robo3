import { Breaker } from "../../../common/asserts.ts";
import { PendingPromiseCollector } from "../../../common/useful.ts";
import { GameActionEnvelope, GameActionError, GameActionNotification, GameActionRequest, GameActionResponse, GameActionResult } from "../foundation.ts";
import { GameActionProcessor } from "../processor.ts";

interface GameActionCommunicator {
  receive(data: unknown): Promise<void>;
  request(request: string, params: Record<string, unknown>): Promise<GameActionResult>;
  notify(notify: string, params: Record<string, unknown>): void;
}

export abstract class AbstractGameActionCommunicator implements GameActionCommunicator {
  protected id = 1;
  protected readonly collector = new PendingPromiseCollector<number, GameActionResult>();
  protected readonly processor: GameActionProcessor;

  public constructor(
    { processor }: {
      processor: GameActionProcessor;
    },
  ) {
    this.processor = processor;
  }

  public abstract receive(message: unknown): Promise<void>;
  protected abstract sendData(action: GameActionEnvelope): void;

  public request(code: string, params: Record<string, unknown>): Promise<GameActionResult> {
    const action: GameActionRequest = {
      code,
      id: this.id++,
      kind: "req",
      params,
    };
    const promise = this.collector.create(action.id);
    this.sendData(action);
    return promise;
  }

  public notify(code: string, params: Record<string, unknown>): void {
    const action: GameActionNotification = {
      code,
      id: this.id++,
      kind: "not",
      params,
    };
    this.sendData(action);
  }

  protected async processEnvelope(envelope: GameActionEnvelope): Promise<void> {
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
    const { code, id } = action;
    try {
      const params = await this.processor.processRequest(action);
      const responseAction: GameActionResponse = {
        code,
        id,
        params,
        kind: "res",
      };
      this.sendData(responseAction);
    } catch (error) {
      const isBreaker = error instanceof Breaker;
      const errorAction: GameActionError = {
        code: isBreaker ? error.message : "unknown",
        id: id ?? 0,
        kind: "err",
        params: isBreaker ? error.options : {},
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
}

export class LoopbackGameActionCommunicator extends AbstractGameActionCommunicator {
  public async receive(message: unknown): Promise<void> {
    await this.processEnvelope(message as GameActionEnvelope);
  }

  protected sendData(action: GameActionEnvelope): void {
    this.processEnvelope(action);
  }
}
