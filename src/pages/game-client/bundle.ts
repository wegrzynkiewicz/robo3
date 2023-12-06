import { bundle } from "https://deno.land/x/emit@0.24.0/mod.ts";
const { code } = await bundle(new URL("./main.ts", import.meta.url));
const src = new TextEncoder().encode(code);
Deno.writeFile("./mods/client/dist/main.js", src);
