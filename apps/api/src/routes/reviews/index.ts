import { Elysia, status } from "elysia";
import { sessionAuth } from "../../plugins/auth";
import * as ReviewModel from "./model";
import { listReviews, updateReviewStatus } from "./service";

export const reviewRoutes = new Elysia({ prefix: "/reviews" })
  .use(sessionAuth)
  .get(
    "/",
    {
      auth: true,
      query: ReviewModel.Get.Query,
      response: ReviewModel.Get.Response,
    },
    async ({ actor, query }) => {
      const rows = await listReviews(actor, query);
      if (rows === "forbidden") return status(403, { error: "Нет доступа к этому филиалу" });
      if (rows === "missing") return status(404, { error: "Филиал не найден" });
      return rows;
    },
  )
  .patch(
    "/:id",
    {
      auth: true,
      params: ReviewModel.ByIdPatch.Params,
      body: ReviewModel.ByIdPatch.Body,
      response: ReviewModel.ByIdPatch.Response,
    },
    async ({ actor, params, body }) => {
      const review = await updateReviewStatus(actor, params.id, body.status);
      if (review === "forbidden") return status(403, { error: "Нет доступа к этому отзыву" });
      if (review === "missing") return status(404, { error: "Отзыв не найден" });
      return review;
    },
  );
