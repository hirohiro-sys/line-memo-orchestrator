import type { Memo, NotificationSettings, User } from "@repo/shared";

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();

export const DEMO_LOGIN = {
  email: "me@memohub.app",
  password: "password",
} as const;

export const MOCK_USER: User = {
  id: "u1",
  email: DEMO_LOGIN.email,
  name: "Me",
  lineConnected: true,
};

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  techWeeklyEnabled: true,
  techWeeklyDay: 0,
  techWeeklyTime: "20:00",
};

export const INITIAL_MEMOS: Memo[] = [
  {
    id: "m1",
    tag: "tweet",
    content:
      "TypeScriptの型推論って、コンパイラが頑張りすぎて逆に読みにくくなることあるよね。たまには明示的な型アノテーションも悪くない",
    mediaType: "text",
    createdAt: minutesAgo(30),
    source: "line",
  },
  {
    id: "m2",
    tag: "tech",
    content: "PostgRESTのパフォーマンス最適化 — ビュー vs RPCの使い分け",
    url: "https://supabase.com/docs/guides/database/postgrest",
    mediaType: "url",
    createdAt: minutesAgo(180),
    source: "line",
  },
  {
    id: "m3",
    tag: "tweet",
    content:
      "最近作っているメモアプリ、自分の課題解決のために作ってるだけあってモチベーションが違う。自分が一番のユーザーって大事だな",
    mediaType: "text",
    createdAt: minutesAgo(360),
    source: "line",
  },
  {
    id: "m4",
    tag: "tech",
    content:
      "Vite 6の新機能 Environment API が凄い。SSRの環境を完全にカスタマイズ可能に",
    url: "https://vite.dev/guide/environments",
    mediaType: "url",
    createdAt: minutesAgo(1560),
    source: "line",
  },
  {
    id: "m5",
    tag: "other",
    content: "ホワイトボードに書いたアーキテクチャ図",
    mediaType: "image",
    createdAt: minutesAgo(1680),
    source: "line",
  },
  {
    id: "m6",
    tag: "tweet",
    content:
      "夜中にコード書いてると、1時間が5分くらいに感じる。フロー状態って本当に時間感覚狂う",
    mediaType: "text",
    createdAt: minutesAgo(2880),
    source: "line",
  },
  {
    id: "m7",
    tag: "tech",
    content:
      "LINE Messaging APIのWebhookイベントの仕様まとめ — テキスト・画像・スタンプの取り扱い",
    url: "https://developers.line.biz/ja/docs/messaging-api/receiving-messages/",
    mediaType: "url",
    createdAt: minutesAgo(3000),
    source: "line",
  },
  {
    id: "m8",
    tag: "tweet",
    content:
      "APIの設計で、エラーレスポンスに「何を試すべきか」を含めるとクライアント側の実装が圧倒的に楽になる。単に400 Bad Requestだけだと何も伝わらない",
    mediaType: "text",
    createdAt: minutesAgo(4320),
    source: "web",
  },
  {
    id: "m9",
    tag: "tech",
    content:
      "ReactのuseEffectのクリーンアップ関数は、イベントリスナーの解除だけでなく非同期処理のキャンセルにも使える",
    url: "https://react.dev/reference/react/useEffect",
    mediaType: "url",
    createdAt: minutesAgo(5760),
    source: "line",
  },
  {
    id: "m10",
    tag: "other",
    content: "スクリーンショット — エラー画面のキャプチャ",
    mediaType: "image",
    createdAt: minutesAgo(7200),
    source: "line",
  },
];
