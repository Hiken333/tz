import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../../db/client";
import { branches, reviews } from "../../db/schema";
import { canSeeCompany, type Actor } from "../../libs/access";
import { findBranch, ownedBranchIds } from "../branches/service";
import type * as ReviewModel from "./model";

function toReview(row: {
  id: string;
  branchId: string;
  branchName: string;
  authorName: string;
  rating: number;
  body: string;
  status: "new" | "processing" | "done";
  publishedAt: Date;
}) {
  return {
    ...row,
    publishedAt: row.publishedAt.toISOString(),
  } satisfies ReviewModel.Get["Response"][200][number];
}

export async function listReviews(actor: Actor, filters: ReviewModel.Get["Query"]) {
  if (filters.branchId) {
    const branch = await findBranch(filters.branchId);
    if (!branch) return "missing" as const;
    if (!canSeeCompany(actor, branch.companyId)) return "forbidden" as const;
  }

  const ids = await ownedBranchIds(actor, filters.branchId);
  if (ids.length === 0) return [];

  const rows = await db
    .select({
      id: reviews.id,
      branchId: reviews.branchId,
      branchName: branches.name,
      authorName: reviews.authorName,
      rating: reviews.rating,
      body: reviews.body,
      status: reviews.status,
      publishedAt: reviews.publishedAt,
    })
    .from(reviews)
    .innerJoin(branches, eq(branches.id, reviews.branchId))
    .where(
      and(
        inArray(reviews.branchId, ids),
        filters.rating ? eq(reviews.rating, filters.rating) : undefined,
        filters.status ? eq(reviews.status, filters.status) : undefined,
      ),
    )
    .orderBy(desc(reviews.publishedAt));

  return rows.map(toReview);
}

export async function updateReviewStatus(
  actor: Actor,
  id: string,
  nextStatus: ReviewModel.ByIdPatch["Body"]["status"],
) {
  const [row] = await db
    .select({
      id: reviews.id,
      branchId: reviews.branchId,
      branchName: branches.name,
      authorName: reviews.authorName,
      rating: reviews.rating,
      body: reviews.body,
      status: reviews.status,
      publishedAt: reviews.publishedAt,
      companyId: branches.companyId,
    })
    .from(reviews)
    .innerJoin(branches, eq(branches.id, reviews.branchId))
    .where(eq(reviews.id, id))
    .limit(1);

  if (!row) return "missing" as const;
  if (!canSeeCompany(actor, row.companyId)) return "forbidden" as const;

  const [updated] = await db
    .update(reviews)
    .set({ status: nextStatus })
    .where(eq(reviews.id, id))
    .returning();
  if (!updated) return "missing" as const;

  return toReview({
    id: updated.id,
    branchId: updated.branchId,
    branchName: row.branchName,
    authorName: updated.authorName,
    rating: updated.rating,
    body: updated.body,
    status: updated.status,
    publishedAt: updated.publishedAt,
  });
}
