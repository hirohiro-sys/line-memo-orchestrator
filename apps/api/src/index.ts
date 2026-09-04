import { serve } from "@hono/node-server";
import { healthResponseSchema } from "@repo/shared";
import { Hono } from "hono";

const app = new Hono();

app.get("/api/health", (c) => {
  return c.json(healthResponseSchema.parse({ status: "ok" }));
});

serve({
  fetch: app.fetch,
  port: 8787,
});

console.log("api listening on http://127.0.0.1:8787");
