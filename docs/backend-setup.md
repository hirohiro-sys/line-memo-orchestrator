# バックエンド環境

`apps/api` は Cloudflare Workers（Hono + Drizzle + D1 + R2）です。公開 API は現状 `GET /api/health` のみです。フロントは開発時 MSW が `/api/*` を傍受します。

## 前提

- Node.js 24 以上
- pnpm 10 以上
- Cloudflare アカウント
- リポジトリルートで作業する

```bash
cd /path/to/line-memo-orchestrator
pnpm install
```

## リソース名

| 種類 | 名前 |
|------|------|
| Worker | `line-memo-orchestrator` |
| D1 | `line-memo-orchestrator` |
| R2 | `line-memo-orchestrator-media` |

設定の正は [`apps/api/wrangler.toml`](../apps/api/wrangler.toml) です。`database_id` は秘密情報ではないので git に含めてよいです。`.dev.vars` と `.wrangler/` はコミットしないでください。

## 環境変数

ローカルは [`apps/api/.dev.vars.example`](../apps/api/.dev.vars.example) をコピーして [`apps/api/.dev.vars`](../apps/api/.dev.vars) を作り、値を入れる。

```bash
cp apps/api/.dev.vars.example apps/api/.dev.vars
```

| 変数 | 用途 |
|------|------|
| `LINE_CHANNEL_ID` | 認可 URL と IDトークン検証の audience |
| `LINE_CHANNEL_SECRET` | 認可コードの交換。ブラウザに出さない |
| `SESSION_SECRET` | JWT 署名。十分長いランダム値 |
| `APP_URL` | ログイン後の戻り先。ローカルは `http://127.0.0.1:5173` |

本番は同じ名前を `wrangler secret` で入れる。開発用バイパス用の変数は作らない。

```bash
pnpm --filter @repo/api exec wrangler secret put LINE_CHANNEL_ID
pnpm --filter @repo/api exec wrangler secret put LINE_CHANNEL_SECRET
pnpm --filter @repo/api exec wrangler secret put SESSION_SECRET
pnpm --filter @repo/api exec wrangler secret put APP_URL
```

## 日常の開発

```bash
pnpm install
pnpm --filter @repo/api db:migrate:local
pnpm dev
```

- Web: `http://127.0.0.1:5173`（MSW あり）
- API: `http://127.0.0.1:8787`

API だけ起動する場合:

```bash
pnpm --filter @repo/api run dev
```

ローカル health:

```bash
curl http://127.0.0.1:8787/api/health
# {"status":"ok"}
```

`vite.config.ts` は `/api` を `:8787` にプロキシします。MSW を切るまでは Worker には届きません。

## DB コマンド

| コマンド | 用途 |
|----------|------|
| `pnpm --filter @repo/api db:generate` | Drizzle スキーマからマイグレーション SQL を生成 |
| `pnpm --filter @repo/api db:migrate:local` | ローカル D1 に適用 |
| `pnpm --filter @repo/api db:migrate:remote` | リモート D1 に適用 |

スキーマの正は [Issue #3](https://github.com/hirohiro-sys/line-memo-orchestrator/issues/3) と [`apps/api/src/db/schema.ts`](../apps/api/src/db/schema.ts) です。初回マイグレーションで `tags` に `tweet` / `tech` / `other` を入れています。

ローカルの tags 確認:

```bash
pnpm --filter @repo/api exec wrangler d1 execute line-memo-orchestrator --local --command "SELECT slug FROM tags"
```

スキーマを変えたら `db:generate` → 生成 SQL を確認 → `db:migrate:local`。問題なければ `db:migrate:remote`。

## リモート（初回のみ）

リソースは作成済みです。別アカウントでやり直すとき用です。

```bash
pnpm --filter @repo/api exec wrangler login
pnpm --filter @repo/api exec wrangler whoami
```

```bash
pnpm --filter @repo/api exec wrangler d1 create line-memo-orchestrator
```

出力の `database_id` を `apps/api/wrangler.toml` に書く。

```bash
pnpm --filter @repo/api exec wrangler r2 bucket create line-memo-orchestrator-media
```

`Please enable R2`（code 10042）なら、ダッシュボードの Storage & databases → R2 で初回有効化して再実行する。

```bash
pnpm --filter @repo/api db:migrate:remote
pnpm --filter @repo/api run deploy
```

`pnpm --filter @repo/api deploy` は使わないでください。pnpm 本体の `deploy` が走ります。必ず `run deploy` です。

初回デプロイでは `workers.dev` サブドメイン登録を聞かれます。`Y` で、アカウント用の短い名前（例: `hirohiro-sys`）を付けます。Worker 名とは別です。

本番 health:

```
https://line-memo-orchestrator.hirohiro-sys.workers.dev/api/health
```

macOS 付属の `curl` で SSL handshake failure になることがあります。ブラウザで確認してください。

```bash
pnpm --filter @repo/api exec wrangler d1 execute line-memo-orchestrator --remote --command "SELECT id, slug, name FROM tags ORDER BY slug"
```

## 再デプロイ

```bash
pnpm --filter @repo/api run deploy
```
