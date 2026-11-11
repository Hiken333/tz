import { CabinetFrame } from "../../components/cabinet-frame";
import { EmptyState } from "../../components/empty-state";
import { ReviewStatusForm } from "../../components/review-status-form";
import { serverApi } from "../../lib/api";
import { requireActor } from "../../lib/session";

type Search = {
  branchId?: string;
  rating?: string;
  status?: string;
};

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const actor = await requireActor();
  const params = await searchParams;
  const api = await serverApi();
  const rating = params.rating ? Number(params.rating) : undefined;
  const status =
    params.status === "new" || params.status === "processing" || params.status === "done"
      ? params.status
      : undefined;

  const [branchesResult, reviewsResult] = await Promise.all([
    api.branches.get(),
    api.reviews.get({
      query: {
        ...(params.branchId ? { branchId: params.branchId } : {}),
        ...(rating ? { rating } : {}),
        ...(status ? { status } : {}),
      },
    }),
  ]);

  if (branchesResult.error) throw new Error("Не удалось загрузить филиалы");
  if (reviewsResult.error) throw new Error("Не удалось загрузить отзывы");

  const reviews = reviewsResult.data;
  const branches = branchesResult.data;

  return (
    <CabinetFrame name={actor.name} role={actor.role}>
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-night">Отзывы</h1>
      <p className="mt-2 mb-6 max-w-2xl text-ink/75">
        Фильтр по оценке и статусу обработки. Чужие компании сюда не попадают.
      </p>
      <form method="get" className="mb-8 grid gap-4 md:grid-cols-4 md:items-end">
        <label className="flex flex-col gap-1 text-sm">
          Филиал
          <select
            name="branchId"
            defaultValue={params.branchId ?? ""}
            className="border border-night/30 bg-plate px-3 py-2"
          >
            <option value="">Все свои</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Оценка
          <select
            name="rating"
            defaultValue={params.rating ?? ""}
            className="border border-night/30 bg-plate px-3 py-2"
          >
            <option value="">Любая</option>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Статус
          <select
            name="status"
            defaultValue={status ?? ""}
            className="border border-night/30 bg-plate px-3 py-2"
          >
            <option value="">Любой</option>
            <option value="new">Новый</option>
            <option value="processing">В работе</option>
            <option value="done">Обработан</option>
          </select>
        </label>
        <button type="submit" className="bg-night px-4 py-2 text-sm text-enamel">
          Отфильтровать отзывы
        </button>
      </form>
      {reviews.length === 0 ? (
        <EmptyState
          title="Отзывов нет"
          detail="Снимите фильтр или откройте другой филиал — для выбранных условий записей нет."
          actionHref="/reviews"
          actionLabel="Сбросить фильтры"
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((review) => (
            <li key={review.id} className="border-l-4 border-amber bg-plate px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="font-[family-name:var(--font-display)] text-lg">
                  {review.rating} из 5 · {review.authorName}
                </p>
                <ReviewStatusForm id={review.id} status={review.status} />
              </div>
              <p className="mt-2 text-ink/80">{review.body}</p>
              <p className="mt-3 text-sm text-ink/60">{review.branchName}</p>
            </li>
          ))}
        </ul>
      )}
    </CabinetFrame>
  );
}
