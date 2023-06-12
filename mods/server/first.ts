import { Application, Router, Request, } from "https://deno.land/x/oak@v12.5.0/mod.ts";
const app = new Application({ logErrors: false });
const router = new Router();
router.get("/hello", (ctx) => {
  ctx.response.type = 'json';
  ctx.response.body = JSON.stringify({ hello: 'world!' });
});

router.post("/login", (ctx) => {
  ctx.response.type = 'json'
  ctx.response.body = JSON.stringify({
    token: '123',
  })
});

class WSManager {

}

Deno.addSignalListener(
  "SIGTERM",
  () => {
    console.log("SIGTERM!")
  }
);

router.get("/wss", (ctx) => {
  if (!ctx.isUpgradable) {
    ctx.throw(501, 'lol');
  }

  console.log(ctx);
  ctx.request.headers;
  console.log(ctx);
  const ws = ctx.upgrade();

  ws.onopen = (event) => {
    console.log(event);
    console.log("Connected to client");
    ws.send("Hello from server!");
  };

  ws.onmessage = (m) => {
    console.log("Got message from client: ", m.data);
    ws.send(m.data as string);
  };
  Deno.addSignalListener(
    "SIGINT",
    () => {
      ws.close();
      console.log("SIGINT!")
    }
  );

  const internal = setInterval(() => {
    ws.send("Hi!");
  }, 2000);

  ws.onclose = () => {
    console.log("Disconncted from client")
    clearInterval(internal);
  };
});

app.use(router.routes());
app.use(router.allowedMethods());
app.listen({ port: 8000 });
