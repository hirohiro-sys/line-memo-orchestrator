import { userSchema } from "@repo/shared";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "./db";
import { users } from "./db/schema";
import type { Env } from "./env";
import {
  clearSession,
  consumeOAuthState,
  issueOAuthState,
  issueSession,
  readSessionUserId,
} from "./session";

const LINE_AUTHORIZE = "https://access.line.me/oauth2/v2.1/authorize";
const LINE_TOKEN = "https://api.line.me/oauth2/v2.1/token";
const LINE_VERIFY = "https://api.line.me/oauth2/v2.1/verify";

export const auth = new Hono<{ Bindings: Env }>();

function callbackUrl(requestUrl: string) {
  return new URL("/api/auth/line/callback", requestUrl).href;
}

function frontendUrl(appUrl: string, path: string) {
  return new URL(path, `${appUrl.replace(/\/$/, "")}/`).href;
}

auth.get("/api/auth/line", (c) => {
  const state = issueOAuthState(c);
  const url = new URL(LINE_AUTHORIZE);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", c.env.LINE_CHANNEL_ID);
  url.searchParams.set("redirect_uri", callbackUrl(c.req.url));
  url.searchParams.set("state", state);
  url.searchParams.set("scope", "openid");
  return c.redirect(url.toString());
});

auth.get("/api/auth/line/callback", async (c) => {
  const error = c.req.query("error");
  const code = c.req.query("code");
  const state = c.req.query("state");
  const appUrl = c.env.APP_URL;

  if (error === "access_denied") {
    consumeOAuthState(c, state);
    return c.redirect(frontendUrl(appUrl, "/login?error=cancelled"));
  }

  if (error || !consumeOAuthState(c, state) || !code) {
    return c.redirect(frontendUrl(appUrl, "/login?error=failed"));
  }

  try {
    const lineUserId = await exchangeCodeForLineUserId({
      code,
      redirectUri: callbackUrl(c.req.url),
      channelId: c.env.LINE_CHANNEL_ID,
      channelSecret: c.env.LINE_CHANNEL_SECRET,
    });
    const db = createDb(c.env.DB);
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.lineUserId, lineUserId))
      .limit(1);

    if (!user) {
      return c.redirect(frontendUrl(appUrl, "/login?error=denied"));
    }

    await issueSession(c, user.id);
    return c.redirect(frontendUrl(appUrl, "/"));
  } catch {
    return c.redirect(frontendUrl(appUrl, "/login?error=failed"));
  }
});

auth.post("/api/auth/logout", (c) => {
  clearSession(c);
  return c.body(null, 204);
});

auth.get("/api/me", async (c) => {
  const id = await readSessionUserId(c);
  if (!id) {
    return c.json({ message: "unauthorized" }, 401);
  }
  return c.json(userSchema.parse({ id }));
});

async function exchangeCodeForLineUserId(input: {
  code: string;
  redirectUri: string;
  channelId: string;
  channelSecret: string;
}): Promise<string> {
  const tokenRes = await fetch(LINE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: input.code,
      redirect_uri: input.redirectUri,
      client_id: input.channelId,
      client_secret: input.channelSecret,
    }),
  });
  if (!tokenRes.ok) {
    throw new Error("token exchange failed");
  }

  const tokenJson: unknown = await tokenRes.json();
  const idToken = readStringField(tokenJson, "id_token");
  if (!idToken) {
    throw new Error("missing id_token");
  }

  const verifyRes = await fetch(LINE_VERIFY, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      id_token: idToken,
      client_id: input.channelId,
    }),
  });
  if (!verifyRes.ok) {
    throw new Error("id_token verify failed");
  }

  const verifyJson: unknown = await verifyRes.json();
  const sub = readStringField(verifyJson, "sub");
  if (!sub) {
    throw new Error("missing sub");
  }
  return sub;
}

function readStringField(value: unknown, key: string): string | null {
  if (typeof value !== "object" || value === null || !(key in value)) {
    return null;
  }
  const field = Reflect.get(value, key);
  return typeof field === "string" ? field : null;
}
