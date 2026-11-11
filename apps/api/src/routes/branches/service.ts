import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { branches, companies } from "../../db/schema";
import { canSeeCompany, visibleCompanyId, type Actor } from "../../libs/access";
import type * as BranchModel from "./model";

const branchSelect = {
  id: branches.id,
  companyId: branches.companyId,
  companyName: companies.name,
  name: branches.name,
  address: branches.address,
};

export async function listBranches(actor: Actor, companyId?: string) {
  if (companyId && !canSeeCompany(actor, companyId)) return "forbidden" as const;
  const scope = visibleCompanyId(actor, companyId);
  if (scope) {
    return db
      .select(branchSelect)
      .from(branches)
      .innerJoin(companies, eq(companies.id, branches.companyId))
      .where(eq(branches.companyId, scope));
  }
  return db
    .select(branchSelect)
    .from(branches)
    .innerJoin(companies, eq(companies.id, branches.companyId));
}

export async function findBranch(id: string) {
  const [branch] = await db
    .select(branchSelect)
    .from(branches)
    .innerJoin(companies, eq(companies.id, branches.companyId))
    .where(eq(branches.id, id))
    .limit(1);
  return (branch ?? null) satisfies BranchModel.ByIdGet["Response"][200] | null;
}

export async function ownedBranchIds(actor: Actor, branchId?: string) {
  if (branchId) {
    const branch = await findBranch(branchId);
    if (!branch || !canSeeCompany(actor, branch.companyId)) return [];
    return [branch.id];
  }
  const rows = await db.select({ id: branches.id, companyId: branches.companyId }).from(branches);
  return rows.filter((row) => canSeeCompany(actor, row.companyId)).map((row) => row.id);
}
