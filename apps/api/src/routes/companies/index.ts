import { Elysia } from "elysia";
import { sessionAuth } from "../../plugins/auth";
import * as CompanyModel from "./model";
import { listCompanies } from "./service";

export const companyRoutes = new Elysia({ prefix: "/companies" }).use(sessionAuth).get(
  "/",
  {
    auth: true,
    response: CompanyModel.Get.Response,
  },
  ({ actor }) => listCompanies(actor),
);
