import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const client = new Client({
  user: 'root',
  password: 'root',
  port: 5433,
  hostname: 'localhost',
  database: 'app',
});

await client.connect();

const result = await client.queryObject('SELECT * FROM chunks');
console.log(result);
