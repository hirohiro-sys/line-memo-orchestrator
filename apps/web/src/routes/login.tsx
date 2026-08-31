import { useState, type FormEvent } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Lightbulb, Lock, Mail } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center bg-paper-warmth px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-xl bg-notion-blue">
            <Lightbulb className="size-8 text-pure-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-black">
            MemoHub
          </h1>
          <p className="mt-1 text-body-sm text-ink-black/60">
            LINE連動メモプラットフォーム
          </p>
        </div>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="space-y-4 rounded-xl border border-border bg-pure-white p-6"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-caption font-medium text-ink-black/60"
            >
              メールアドレス
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-black/40" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={DEMO_LOGIN.email}
                autoComplete="email"
                className="w-full rounded-lg border border-border bg-pure-white py-2.5 pr-3.5 pl-10 text-body-sm text-ink-black outline-none transition-colors duration-200 placeholder:text-ink-black/40 focus:border-notion-blue"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-caption font-medium text-ink-black/60"
            >
              パスワード
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-black/40" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-lg border border-border bg-pure-white py-2.5 pr-3.5 pl-10 text-body-sm text-ink-black outline-none transition-colors duration-200 placeholder:text-ink-black/40 focus:border-notion-blue"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-coral/10 px-3 py-2.5">
              <AlertCircle className="size-4 shrink-0 text-coral" />
              <p className="text-caption font-medium text-coral">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-notion-blue px-[15px] py-1.5 text-body-sm font-medium text-pure-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "ログイン中..." : "ログイン"}
          </button>

          <div className="border-t border-border pt-3 text-center">
            <p className="text-[11px] leading-relaxed text-ink-black/40">
              空のままでも、ログインを押すとデモアカウントで入れます
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
