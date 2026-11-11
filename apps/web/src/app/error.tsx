"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-xl px-6 py-24">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-night">
        Сводка не загрузилась
      </h1>
      <p className="mt-3 text-ink/80">
        API не ответил или вернул ошибку. Проверьте, что база и API запущены, затем откройте
        страницу снова.
      </p>
      <button type="button" onClick={reset} className="mt-6 bg-night px-4 py-2 text-sm text-enamel">
        Повторить загрузку
      </button>
    </main>
  );
}
