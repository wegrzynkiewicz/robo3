import { ServiceResolver, provideMainServiceResolver } from "../../dependency/service.ts";
import { provideScopedLogger } from "../../logger/global.ts";
import { LoggerFactory, provideMainLoggerFactory } from "../../logger/logger-factory.ts";
import { SpaceManager, provideSpaceManager } from "../../space/space-manager.ts";
import { provideScopedSpace } from "../../space/space.ts";
import { provideScopedGameSimulationDaemon, feedGameSimulationDaemon } from "../game-simulation-daemon.ts";
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
    resolver.inject(provideScopedGameSimulationContextServiceResolver, resolver);
    this.mainServiceResolver.transfer(provideSpaceManager, resolver);
    this.mainServiceResolver.transfer(provideMainLoggerFactory, resolver);
    this.mainServiceResolver.transfer(provideMainServiceResolver, resolver);

    const logger = this.loggerFactory.createLogger('CAME', { spaceId });
    resolver.inject(provideScopedLogger, logger);

    const space = this.spaceManager.obtain(spaceId);
    resolver.inject(provideScopedSpace, space);

    const simulator = resolver.resolve(provideScopedGameSimulationDaemon);
    feedGameSimulationDaemon(resolver, simulator);

    const gameSimulatorContext: GameSimulationContext = {
      resolver,
      simulator,
      spaceId,
    };

    this.bySpaceId.set(spaceId, gameSimulatorContext);

    return gameSimulatorContext;
  }
}

export function provideScopedGameSimulationContextServiceResolver(): ServiceResolver {
  throw new Error('scoped-game-simulator-context-service-resolver-must-be-injected');
}

export function provideGameSimulationContextManager(resolver: ServiceResolver) {
  return new GameSimulationContextManager(
    resolver.resolve(provideMainLoggerFactory),
    resolver.resolve(provideMainServiceResolver),
    resolver.resolve(provideSpaceManager),
  );
}
