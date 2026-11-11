import { Elysia, status } from "elysia";
import { sessionAuth } from "../../plugins/auth";
import * as MetricsModel from "./model";
import { summarizeMetrics } from "./service";

export const metricRoutes = new Elysia({ prefix: "/metrics" }).use(sessionAuth).get(
  "/summary",
  {
    auth: true,
    query: MetricsModel.SummaryGet.Query,
    response: MetricsModel.SummaryGet.Response,
  },
  async ({ actor, query }) => {
    const summary = await summarizeMetrics(
      actor,
      query.period,
      query.branchId,
      query.metric ?? "cardViews",
    );
    if (summary === "forbidden") return status(403, { error: "Нет доступа к этому филиалу" });
    if (summary === "missing") return status(404, { error: "Филиал не найден" });
    return summary;
  },
);
