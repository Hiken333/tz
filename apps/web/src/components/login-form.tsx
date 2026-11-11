"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserApi } from "../lib/browser-api";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const form = new FormData(event.currentTarget);
        const email = String(form.get("email") ?? "");
        const password = String(form.get("password") ?? "");
        const { error: loginError } = await browserApi().auth.login.post({ email, password });
        setPending(false);
        if (loginError) {
          setError(
            loginError.status === 401
              ? "Неверный email или пароль. Проверьте данные из README."
              : "Не удалось войти. Проверьте, что API запущен.",
          );
          return;
        }
        router.push("/");
        router.refresh();
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          name="email"
          type="email"
          autoComplete="username"
          spellCheck={false}
          required
          className="border border-night/30 bg-enamel px-3 py-2"
          defaultValue="marina@sever.example"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Пароль
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className="border border-night/30 bg-enamel px-3 py-2"
          defaultValue="client-demo"
        />
      </label>
      {error ? (
        <p
          className="border border-brick/40 bg-brick/10 px-3 py-2 text-sm text-brick"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="bg-night px-4 py-2 text-sm text-enamel disabled:opacity-60"
      >
        {pending ? "Входим…" : "Войти в кабинет"}
      </button>
    </form>
  );
}
