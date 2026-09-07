import { healthResponseSchema } from "@repo/shared";
import { Hono } from "hono";

type Env = {
  DB: D1Database;
  MEDIA: R2Bucket;
};

const app = new Hono<{ Bindings: Env }>();

app.get("/api/health", async (c) => {
  await c.env.DB.prepare("SELECT 1").first();
  return c.json(healthResponseSchema.parse({ status: "ok" }));
});

export default app;
