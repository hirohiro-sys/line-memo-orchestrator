# line-memo-orchestrator

LINE に投げたメモを Web で見返す個人用アプリ。いまはフロントだけ。API は MSW でモックする。

## 構成

```
apps/web          Vite + React + TanStack Router/Query + Tailwind + shadcn
packages/shared   Zod スキーマ（画面と MSW で共有）
```

Hono / Cloudflare（D1・R2）は未着手。

## 前提

- Node.js 24.14.0 以上
- pnpm 10.34.5 以上（`packageManager` で固定）

## 起動

```bash
pnpm install
pnpm dev
```

`http://localhost:5173` が開く。開発時だけ MSW が `/api/*` を返す。
