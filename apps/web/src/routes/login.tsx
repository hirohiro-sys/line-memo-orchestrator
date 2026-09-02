import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { fetchMe, login } from "@/lib/api";
import { DEMO_LOGIN } from "@/mocks/data";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const user = await fetchMe();
    if (user) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      await login(
        email.trim() || DEMO_LOGIN.email,
        password || DEMO_LOGIN.password,
      );
      await navigate({ to: "/" });
    } catch {
      setError("メールアドレスまたはパスワードが間違っています");
    } finally {
      setPending(false);
    }
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

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-caption text-muted-foreground"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={DEMO_LOGIN.email}
              autoComplete="email"
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-body-sm text-foreground outline-none transition-colors duration-150 placeholder:text-muted-foreground focus:border-foreground"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-caption text-muted-foreground"
            >
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-body-sm text-foreground outline-none transition-colors duration-150 placeholder:text-muted-foreground focus:border-foreground"
            />
          </div>

          {error && <p className="text-caption text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-primary px-3 py-2 text-body-sm font-medium text-primary-foreground transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "ログイン中..." : "ログイン"}
          </button>

          <p className="text-[11px] text-muted-foreground">
            空のままでも、ログインを押すとデモアカウントで入れます
          </p>
        </form>
      </div>
    </div>
  );
}
