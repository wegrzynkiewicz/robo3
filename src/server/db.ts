import { MongoClient } from "./deps.ts";

export function provideDBClient() {
  const url = "mongodb://root:root@localhost:27017?authSource=admin";
  const client = new MongoClient(url);
  return client;
}
