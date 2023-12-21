import { ServiceResolver, provideMainServiceResolver } from "../../../common/dependency/service.ts";
import { provideScopedLogger } from "../../../common/logger/global.ts";
import { LoggerFactory, provideMainLoggerFactory } from "../../../common/logger/logger-factory.ts";
import { SpaceManager, provideSpaceManager } from "../../../common/space/space-manager.ts";
import { provideScopedSpace } from "../../space/space.ts";
import { feedGameSimulatorDaemon, provideScopedGameSimulatorDaemon } from "../game-daemon.ts";
import { GameSimulatorContext } from "./define.ts";

export interface GameSimulatorContextFactoryOption {
  spaceId: number;
}

export class GameSimulatorContextManager {

  public readonly bySpaceId = new Map<number, GameSimulatorContext>();

  public constructor(
    public readonly loggerFactory: LoggerFactory,
    public readonly mainServiceResolver: ServiceResolver,
    public readonly spaceManager: SpaceManager,
  ) { }

  public async createGameSimulatorContext(
    { spaceId }: GameSimulatorContextFactoryOption
  ): Promise<GameSimulatorContext> {
    const resolver = new ServiceResolver();
    resolver.inject(provideScopedGameSimulatorContextServiceResolver, resolver);
    this.mainServiceResolver.transfer(provideSpaceManager, resolver);
    this.mainServiceResolver.transfer(provideMainLoggerFactory, resolver);
    this.mainServiceResolver.transfer(provideMainServiceResolver, resolver);

    const logger = this.loggerFactory.createLogger('CAME', { spaceId });
    resolver.inject(provideScopedLogger, logger);

    const space = this.spaceManager.obtain(spaceId);
    resolver.inject(provideScopedSpace, space);

    const simulator = resolver.resolve(provideScopedGameSimulatorDaemon);
    feedGameSimulatorDaemon(resolver, simulator);

    const gameSimulatorContext: GameSimulatorContext = {
      resolver,
      simulator,
      spaceId,
    };

    this.bySpaceId.set(spaceId, gameSimulatorContext);

    return gameSimulatorContext;
  }
}

export function provideScopedGameSimulatorContextServiceResolver(): ServiceResolver {
  throw new Error('scoped-game-simulator-context-service-resolver-must-be-injected');
}

export function provideGameSimulatorContextManager(resolver: ServiceResolver) {
  return new GameSimulatorContextManager(
    resolver.resolve(provideMainLoggerFactory),
    resolver.resolve(provideMainServiceResolver),
    resolver.resolve(provideSpaceManager),
  );
}
