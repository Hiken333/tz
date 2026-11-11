import { and, gte, inArray, lte } from "drizzle-orm";
import { db } from "../../db/client";
import { dailyMetrics } from "../../db/schema";
import { canSeeCompany, type Actor } from "../../libs/access";
import { periodBounds, type Period } from "../../libs/period";
import { findBranch, ownedBranchIds } from "../branches/service";
import type * as MetricsModel from "./model";

type MetricKey = NonNullable<MetricsModel.SummaryGet["Query"]["metric"]>;

export async function summarizeMetrics(
  actor: Actor,
  period: Period,
  branchId: string | undefined,
  metric: MetricKey,
) {
  if (branchId) {
    const branch = await findBranch(branchId);
    if (!branch) return "missing" as const;
    if (!canSeeCompany(actor, branch.companyId)) return "forbidden" as const;
  }

  const ids = await ownedBranchIds(actor, branchId);
  const empty = {
    period,
    branchId: branchId ?? null,
    totals: {
      cardViews: 0,
      siteClicks: 0,
      calls: 0,
      routesBuilt: 0,
      avgRating: 0,
      reviewsCount: 0,
    },
    series: [] as Array<{ day: string; value: number }>,
    metric,
  } satisfies MetricsModel.SummaryGet["Response"][200];

  if (ids.length === 0) return empty;

  const { from, to } = periodBounds(period);
  const rows = await db
    .select({
      day: dailyMetrics.day,
      cardViews: dailyMetrics.cardViews,
      siteClicks: dailyMetrics.siteClicks,
      calls: dailyMetrics.calls,
      routesBuilt: dailyMetrics.routesBuilt,
      avgRating: dailyMetrics.avgRating,
      reviewsCount: dailyMetrics.reviewsCount,
    })
    .from(dailyMetrics)
    .where(
      and(
        inArray(dailyMetrics.branchId, ids),
        gte(dailyMetrics.day, from),
        lte(dailyMetrics.day, to),
      ),
    );

  const totals = {
    cardViews: 0,
    siteClicks: 0,
    calls: 0,
    routesBuilt: 0,
    reviewsCount: 0,
    ratingSum: 0,
  };
  const byDay = new Map<string, number>();

  for (const row of rows) {
    totals.cardViews += row.cardViews;
    totals.siteClicks += row.siteClicks;
    totals.calls += row.calls;
    totals.routesBuilt += row.routesBuilt;
    totals.reviewsCount += row.reviewsCount;
    totals.ratingSum += Number(row.avgRating);
    const key = String(row.day);
    const current = byDay.get(key) ?? 0;
    const value =
      metric === "cardViews"
        ? row.cardViews
        : metric === "siteClicks"
          ? row.siteClicks
          : metric === "calls"
            ? row.calls
            : row.routesBuilt;
    byDay.set(key, current + value);
  }

  const series = [...byDay.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([day, value]) => ({ day, value }));

  return {
    period,
    branchId: branchId ?? null,
    totals: {
      cardViews: totals.cardViews,
      siteClicks: totals.siteClicks,
      calls: totals.calls,
      routesBuilt: totals.routesBuilt,
      avgRating: rows.length === 0 ? 0 : Math.round((totals.ratingSum / rows.length) * 100) / 100,
      reviewsCount: totals.reviewsCount,
    },
    series,
    metric,
  } satisfies MetricsModel.SummaryGet["Response"][200];
}
