import Link from "next/link";
import { CabinetFrame } from "../../components/cabinet-frame";
import { EmptyState } from "../../components/empty-state";
import { serverApi } from "../../lib/api";
import { requireActor } from "../../lib/session";

export default async function BranchesPage() {
  const actor = await requireActor();
  const api = await serverApi();
  const { data, error } = await api.branches.get();
  if (error || !data) throw new Error("Не удалось загрузить филиалы");

  if (data.length === 0) {
    return (
      <CabinetFrame name={actor.name} role={actor.role}>
        <EmptyState
          title="Филиалов нет"
          detail="Добавить точку может только администратор в базе. Пока можно выйти и войти как другая учётка."
          actionHref="/login"
          actionLabel="Сменить учётку"
        />
      </CabinetFrame>
    );
  }

  return (
    <CabinetFrame name={actor.name} role={actor.role}>
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-night">Филиалы</h1>
      <p className="mt-2 mb-8 max-w-2xl text-ink/75">
        Адрес как на карточках карт. Сводка считает выбранную точку или все сразу.
      </p>
      <ul className="divide-y divide-line border-y border-line">
        {data.map((branch) => (
          <li
            key={branch.id}
            className="flex flex-col gap-2 py-5 md:flex-row md:items-baseline md:justify-between"
          >
            <div>
              <p className="font-[family-name:var(--font-display)] text-xl text-night">
                {branch.name}
              </p>
              <p className="text-ink/75">{branch.address}</p>
              <p className="text-sm text-ink/60">{branch.companyName}</p>
            </div>
            <Link
              href={`/?branchId=${branch.id}&period=30d`}
              className="text-sm text-night underline underline-offset-4"
            >
              Открыть статистику филиала
            </Link>
          </li>
        ))}
      </ul>
    </CabinetFrame>
  );
}
