import { t, type UnwrapModels } from "elysia";

const MetricKey = t.UnionEnum(["cardViews", "siteClicks", "calls", "routesBuilt"]);

export const SummaryGet = {
  Query: t.Object({
    period: t.UnionEnum(["7d", "30d", "90d"]),
    branchId: t.Optional(t.String({ format: "uuid" })),
    metric: t.Optional(MetricKey),
  }),
  Response: {
    200: t.Object({
      period: t.UnionEnum(["7d", "30d", "90d"]),
      branchId: t.Nullable(t.String()),
      totals: t.Object({
        cardViews: t.Number(),
        siteClicks: t.Number(),
        calls: t.Number(),
        routesBuilt: t.Number(),
        avgRating: t.Number(),
        reviewsCount: t.Number(),
      }),
      series: t.Array(
        t.Object({
          day: t.String(),
          value: t.Number(),
        }),
      ),
      metric: MetricKey,
    }),
    401: t.Object({ error: t.String() }),
    403: t.Object({ error: t.String() }),
    404: t.Object({ error: t.String() }),
  },
};
export type SummaryGet = UnwrapModels<typeof SummaryGet>;
