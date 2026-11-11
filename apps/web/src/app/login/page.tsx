import { redirect } from "next/navigation";
import { LoginForm } from "../../components/login-form";
import { getActor } from "../../lib/session";

export default async function LoginPage() {
  const actor = await getActor();
  if (actor) redirect("/");

  return (
    <main className="mx-auto grid min-h-screen max-w-5xl items-center gap-12 px-6 py-16 md:grid-cols-2">
      <section>
        <p className="text-sm text-night/70">Истинный интеллект</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-tight text-night">
          Кабинет, в котором видно карточку на карте
        </h1>
        <p className="mt-4 max-w-md text-base leading-7 text-ink/80">
          Просмотры, звонки и построенные маршруты по филиалам. Вход только для своей компании.
        </p>
      </section>
      <section className="border border-night/20 bg-plate p-6">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-night">Войти</h2>
        <p className="mt-2 mb-6 text-sm text-ink/70">Клиент: marina@sever.example / client-demo</p>
        <LoginForm />
      </section>
    </main>
  );
}
