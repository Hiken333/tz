import { Elysia, t } from "elysia";
import { env } from "./env";
import { httpCors } from "./plugins/cors";
import { auth } from "./routes/auth";
import { branchRoutes } from "./routes/branches";
import { companyRoutes } from "./routes/companies";
import { metricRoutes } from "./routes/metrics";
import { reviewRoutes } from "./routes/reviews";

export const app = new Elysia({
  cookie: { secrets: env.cookieSecret },
})
  .use(httpCors)
  .get("/health", { response: t.Object({ ok: t.Literal(true) }) }, () => ({ ok: true as const }))
  .use(auth)
  .use(companyRoutes)
  .use(branchRoutes)
  .use(metricRoutes)
  .use(reviewRoutes);

export type App = typeof app;
