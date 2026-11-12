import Link from "next/link";
import { CabinetFrame } from "../components/cabinet-frame";
import { EmptyState } from "../components/empty-state";
import { RouteChart } from "../components/route-chart";
import { serverApi } from "../lib/api";
import { requireActor } from "../lib/session";

const metricLabels = {
  cardViews: "Просмотры карточек",
  siteClicks: "Переходы на сайт",
  calls: "Звонки",
  routesBuilt: "Построенные маршруты",
} as const;

const metricUnits = {
  cardViews: "просмотров",
  siteClicks: "переходов",
  calls: "звонков",
  routesBuilt: "маршрутов",
} as const;

type Search = {
  period?: string;
  branchId?: string;
  metric?: string;
};

function asPeriod(value: string | undefined) {
  if (value === "7d" || value === "90d") return value;
  return "30d";
}

function asMetric(value: string | undefined) {
  if (value === "siteClicks" || value === "calls" || value === "routesBuilt") return value;
  return "cardViews";
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Search> }) {
  const actor = await requireActor();
  const params = await searchParams;
  const period = asPeriod(params.period);
  const metric = asMetric(params.metric);
  const branchId = params.branchId;
  const api = await serverApi();

  const [branchesResult, summaryResult] = await Promise.all([
    api.branches.get(),
    api.metrics.summary.get({
      query: {
        period,
        metric,
        ...(branchId ? { branchId } : {}),
      },
    }),
  ]);

  if (branchesResult.error) throw new Error("Не удалось загрузить филиалы");
  if (summaryResult.error) throw new Error("Не удалось загрузить показатели");

  const branches = branchesResult.data;
  const summary = summaryResult.data;
  const totals = summary.totals;

  if (branches.length === 0) {
    return (
      <CabinetFrame name={actor.name} role={actor.role}>
        <EmptyState
          title="Пока нет филиалов"
          detail="Для этой учётки нет точек на карте. Обратитесь к администратору, чтобы добавить филиал."
          actionHref="/login"
          actionLabel="Сменить учётку"
        />
      </CabinetFrame>
    );
  }

  return (
    <CabinetFrame name={actor.name} role={actor.role}>
      <form method="get" className="mb-8 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="flex flex-col gap-1 text-sm">
          Филиал
          <select
            name="branchId"
            defaultValue={branchId ?? ""}
            className="border border-night/30 bg-plate px-3 py-2"
          >
            <option value="">Все доступные филиалы</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name} · {branch.address}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Период
          <select
            name="period"
            defaultValue={period}
            className="border border-night/30 bg-plate px-3 py-2"
          >
            <option value="7d">7 дней</option>
            <option value="30d">30 дней</option>
            <option value="90d">90 дней</option>
          </select>
        </label>
        <input type="hidden" name="metric" value={metric} />
        <button type="submit" className="bg-night px-4 py-2 text-sm text-enamel">
          Показать сводку
        </button>
      </form>

      <section className="border border-night bg-plate px-4 py-6 md:px-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-pretty text-night">
          Сумма за период
        </h1>
        <p className="mt-2 mb-8 max-w-2xl text-ink/75">
          Цифры — итог по выбранным филиалам. Нажмите просмотры, сайт, звонки или маршруты: ниже
          откроется график по дням.
        </p>
        <ol className="route-strip">
          <MetricStop
            href={query({ period, branchId, metric: "cardViews" })}
            label="Просмотры"
            value={formatCount(totals.cardViews)}
            variant={metric === "cardViews" ? "selected" : "idle"}
          />
          <MetricStop
            href={query({ period, branchId, metric: "siteClicks" })}
            label="На сайт"
            value={formatCount(totals.siteClicks)}
            variant={metric === "siteClicks" ? "selected" : "idle"}
          />
          <MetricStop
            href={query({ period, branchId, metric: "calls" })}
            label="Звонки"
            value={formatCount(totals.calls)}
            variant={metric === "calls" ? "selected" : "idle"}
          />
          <MetricStop
            href={query({ period, branchId, metric: "routesBuilt" })}
            label="Маршруты"
            value={formatCount(totals.routesBuilt)}
            variant={metric === "routesBuilt" ? "selected" : "idle"}
          />
          <li className="route-stop">
            <div className="track" aria-hidden="true">
              <span className="rail rail-start" />
              <span className="pin" />
              <span className="rail rail-end" />
            </div>
            <p className="text-sm text-ink/70">Рейтинг</p>
            <p className="tabular font-[family-name:var(--font-display)] text-2xl md:text-3xl">
              {totals.avgRating.toFixed(2)}
            </p>
          </li>
          <li className="route-stop">
            <Link href="/reviews" className="block">
              <div className="track" aria-hidden="true">
                <span className="rail rail-start" />
                <span className="pin" />
                <span className="rail rail-end" />
              </div>
              <p className="text-sm text-ink/70">Отзывы</p>
              <p className="tabular font-[family-name:var(--font-display)] text-2xl md:text-3xl">
                {formatCount(totals.reviewsCount)}
              </p>
            </Link>
          </li>
        </ol>
      </section>

      <section className="mt-8">
        <RouteChart
          series={summary.series}
          label={metricLabels[metric]}
          unit={metricUnits[metric]}
        />
      </section>
    </CabinetFrame>
  );
}

function MetricStop({
  href,
  label,
  value,
  variant,
}: {
  href: string;
  label: string;
  value: string;
  variant: "selected" | "idle";
}) {
  return (
    <li className="route-stop" {...(variant === "selected" ? { "data-current": "" } : {})}>
      <Link
        href={href}
        className="block"
        aria-current={variant === "selected" ? "page" : undefined}
      >
        <div className="track" aria-hidden="true">
          <span className="rail rail-start" />
          <span className="pin" />
          <span className="rail rail-end" />
        </div>
        <p className="text-sm text-ink/70">{label}</p>
        <p className="tabular font-[family-name:var(--font-display)] text-2xl md:text-3xl">
          {value}
        </p>
      </Link>
    </li>
  );
}

function query(input: { period: string; branchId?: string; metric: string }) {
  const params = new URLSearchParams({ period: input.period, metric: input.metric });
  if (input.branchId) params.set("branchId", input.branchId);
  return `/?${params.toString()}`;
}

function formatCount(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}
