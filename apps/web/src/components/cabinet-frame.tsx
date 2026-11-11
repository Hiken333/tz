import type { ReactNode } from "react";
import Link from "next/link";
import { LogoutButton } from "./logout-button";

export function CabinetFrame({
  name,
  role,
  children,
}: {
  name: string;
  role: "admin" | "client";
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <a href="#content" className="skip-link">
        К содержимому
      </a>
      <header className="bg-night text-enamel">
        <div className="mx-auto flex max-w-6xl items-end justify-between gap-6 px-6 py-5">
          <div>
            <p className="text-sm text-enamel/70">Истинный интеллект</p>
            <p className="font-[family-name:var(--font-display)] text-2xl leading-none">
              Кабинет геоприсутствия
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <span>
              {name}
              <span className="ml-2 text-enamel/60">
                {role === "admin" ? "администратор" : "клиент"}
              </span>
            </span>
            <LogoutButton />
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-6 px-6 pb-4 text-sm">
          <Link href="/" className="hover:text-amber">
            Сводка
          </Link>
          <Link href="/branches" className="hover:text-amber">
            Филиалы
          </Link>
          <Link href="/reviews" className="hover:text-amber">
            Отзывы
          </Link>
        </nav>
      </header>
      <main id="content" className="mx-auto max-w-6xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
