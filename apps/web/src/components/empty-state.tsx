import Link from "next/link";

export function EmptyState({
  title,
  detail,
  actionHref,
  actionLabel,
}: {
  title: string;
  detail: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <section className="border border-line bg-plate px-6 py-10">
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-night">{title}</h2>
      <p className="mt-3 max-w-xl text-base leading-7 text-ink/80">{detail}</p>
      <Link href={actionHref} className="mt-6 inline-flex bg-night px-4 py-2 text-sm text-enamel">
        {actionLabel}
      </Link>
    </section>
  );
}
