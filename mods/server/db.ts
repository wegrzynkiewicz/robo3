import { registerService } from "../core/dependency/service.ts";
import { MongoClient } from "./deps.ts";

export const dbClient = registerService({
  globalKey: 'dbClient',
  provider: async () => {
    const url = "mongodb://root:example@localhost:27017?authSource=admin";
    const client = new MongoClient(url);
    await client.connect();
    return client;
  },
  singleton: false,
});
