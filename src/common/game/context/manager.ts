import { ServiceResolver, provideMainServiceResolver } from "../../dependency/service.ts";
import { provideLogger } from "../../logger/global.ts";
import { LoggerFactory, provideMainLoggerFactory } from "../../logger/logger-factory.ts";
import { SpaceManager, provideSpaceManager } from "../../space/space-manager.ts";
import { provideSpace } from "../../space/space.ts";
import { provideUnprocessedGABus } from "../action/bus.ts";
import { provideGAProcessor } from "../action/processor.ts";
import { provideGameSimulationDaemon, feedGameSimulationDaemon } from "../simulation-daemon.ts";
import { feedGASimulationProcessor } from "../simulation-processor.ts";
import { GameSimulationContext } from "./define.ts";

export interface GameSimulationContextFactoryOption {
  spaceId: number;
}

export class GameSimulationContextManager {

  public readonly bySpaceId = new Map<number, GameSimulationContext>();

  public constructor(
    public readonly loggerFactory: LoggerFactory,
    public readonly mainServiceResolver: ServiceResolver,
    public readonly spaceManager: SpaceManager,
  ) { }

  public async createGameSimulationContext(
    { spaceId }: GameSimulationContextFactoryOption
  ): Promise<GameSimulationContext> {
    const resolver = new ServiceResolver();
    resolver.inject(provideGameSimulationContextServiceResolver, resolver);
    this.mainServiceResolver.transfer(provideSpaceManager, resolver);
    this.mainServiceResolver.transfer(provideMainLoggerFactory, resolver);
    this.mainServiceResolver.transfer(provideMainServiceResolver, resolver);

    const logger = this.loggerFactory.createLogger('CAME', { spaceId });
    resolver.inject(provideLogger, logger);

    const space = this.spaceManager.obtain(spaceId);
    resolver.inject(provideSpace, space);

    const simulator = resolver.resolve(provideGameSimulationDaemon);
    feedGameSimulationDaemon(resolver, simulator);

    const unprocessedGABus = resolver.resolve(provideUnprocessedGABus);
    {
      const processor = resolver.resolve(provideGAProcessor);
      feedGASimulationProcessor(resolver, processor);
      unprocessedGABus.subscribers.add(processor);
    }

    const gameSimulatorContext: GameSimulationContext = {
      resolver,
      simulator,
      spaceId,
    };

    this.bySpaceId.set(spaceId, gameSimulatorContext);

    return gameSimulatorContext;
  }
}

export function provideGameSimulationContextServiceResolver(): ServiceResolver {
  throw new Error('scoped-game-simulator-context-service-resolver-must-be-injected');
}

export function provideGameSimulationContextManager(resolver: ServiceResolver) {
  return new GameSimulationContextManager(
    resolver.resolve(provideMainLoggerFactory),
    resolver.resolve(provideMainServiceResolver),
    resolver.resolve(provideSpaceManager),
  );
}
