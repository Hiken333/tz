import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-24">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-night">Страницы нет</h1>
      <p className="mt-3 text-ink/80">
        Адрес не совпал с кабинетом. Вернитесь на сводку и выберите филиал оттуда.
      </p>
      <Link href="/" className="mt-6 inline-flex bg-night px-4 py-2 text-sm text-enamel">
        Открыть сводку
      </Link>
    </main>
  );
}
