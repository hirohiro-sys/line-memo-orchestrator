import { healthResponseSchema } from "@repo/shared";
import { Hono } from "hono";
import { auth } from "./auth";
import type { Env } from "./env";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/health", async (c) => {
  await c.env.DB.prepare("SELECT 1").first();
  return c.json(healthResponseSchema.parse({ status: "ok" }));
});

app.route("/", auth);

export default app;
