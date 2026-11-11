import { t, type UnwrapModels } from "elysia";

const Review = t.Object({
  id: t.String(),
  branchId: t.String(),
  branchName: t.String(),
  authorName: t.String(),
  rating: t.Number(),
  body: t.String(),
  status: t.UnionEnum(["new", "processing", "done"]),
  publishedAt: t.String(),
});

export const Get = {
  Query: t.Object({
    branchId: t.Optional(t.String({ format: "uuid" })),
    rating: t.Optional(t.Numeric({ minimum: 1, maximum: 5 })),
    status: t.Optional(t.UnionEnum(["new", "processing", "done"])),
  }),
  Response: {
    200: t.Array(Review),
    401: t.Object({ error: t.String() }),
    403: t.Object({ error: t.String() }),
    404: t.Object({ error: t.String() }),
  },
};
export type Get = UnwrapModels<typeof Get>;

export const ByIdPatch = {
  Params: t.Object({ id: t.String({ format: "uuid" }) }),
  Body: t.Object({
    status: t.UnionEnum(["new", "processing", "done"]),
  }),
  Response: {
    200: Review,
    401: t.Object({ error: t.String() }),
    403: t.Object({ error: t.String() }),
    404: t.Object({ error: t.String() }),
  },
};
export type ByIdPatch = UnwrapModels<typeof ByIdPatch>;
