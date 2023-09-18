import { registerService } from "../core/dependency/service.ts";
import { MongoClient } from "./deps.ts";

export const dbClient = registerService({
  provider: async () => {
    const url = "mongodb://root:root@localhost:27017?authSource=admin";
    const client = new MongoClient(url);
    await client.connect();
    return client;
  },
  singleton: true,
});
