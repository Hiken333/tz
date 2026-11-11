import { Elysia, status } from "elysia";
import { canSeeCompany } from "../../libs/access";
import { sessionAuth } from "../../plugins/auth";
import * as BranchModel from "./model";
import { findBranch, listBranches } from "./service";

export const branchRoutes = new Elysia({ prefix: "/branches" })
  .use(sessionAuth)
  .get(
    "/",
    {
      auth: true,
      query: BranchModel.Get.Query,
      response: BranchModel.Get.Response,
    },
    async ({ actor, query }) => {
      const rows = await listBranches(actor, query.companyId);
      if (rows === "forbidden") return status(403, { error: "Нет доступа к этой компании" });
      return rows;
    },
  )
  .get(
    "/:id",
    {
      auth: true,
      params: BranchModel.ByIdGet.Params,
      response: BranchModel.ByIdGet.Response,
    },
    async ({ actor, params }) => {
      const branch = await findBranch(params.id);
      if (!branch) return status(404, { error: "Филиал не найден" });
      if (!canSeeCompany(actor, branch.companyId)) {
        return status(403, { error: "Нет доступа к этому филиалу" });
      }
      return branch;
    },
  );
