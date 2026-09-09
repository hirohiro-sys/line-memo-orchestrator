import { createFileRoute, redirect } from "@tanstack/react-router";
import { fetchMe } from "@/lib/api";

const LOGIN_ERRORS: Record<string, string> = {
  denied: "このアカウントではログインできません",
  cancelled: "ログインがキャンセルされました",
  failed: "ログインに失敗しました",
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { error?: string } =>
    typeof search.error === "string" ? { error: search.error } : {},
  beforeLoad: async () => {
    const user = await fetchMe();
    if (user) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const { error } = Route.useSearch();
  const message = error ? (LOGIN_ERRORS[error] ?? LOGIN_ERRORS.failed) : "";

  function handleLineLogin() {
    window.location.href = "/api/auth/line";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-[360px]">
        <div className="mb-8">
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
            MemoHub
          </h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            LINE連動メモ
          </p>
        </div>

        <div className="space-y-4">
          {message && (
            <p className="text-caption text-destructive">{message}</p>
          )}

          <button
            type="button"
            onClick={handleLineLogin}
            className="w-full rounded-md bg-primary px-3 py-2 text-body-sm font-medium text-primary-foreground transition-opacity duration-150 hover:opacity-90"
          >
            LINEでログイン
          </button>
        </div>
      </div>
    </div>
  );
}
