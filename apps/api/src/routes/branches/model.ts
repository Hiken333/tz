import { t, type UnwrapModels } from "elysia";

const Branch = t.Object({
  id: t.String(),
  companyId: t.String(),
  companyName: t.String(),
  name: t.String(),
  address: t.String(),
});

export const Get = {
  Query: t.Object({
    companyId: t.Optional(t.String({ format: "uuid" })),
  }),
  Response: {
    200: t.Array(Branch),
    401: t.Object({ error: t.String() }),
    403: t.Object({ error: t.String() }),
  },
};
export type Get = UnwrapModels<typeof Get>;

export const ByIdGet = {
  Params: t.Object({ id: t.String({ format: "uuid" }) }),
  Response: {
    200: Branch,
    401: t.Object({ error: t.String() }),
    403: t.Object({ error: t.String() }),
    404: t.Object({ error: t.String() }),
  },
};
export type ByIdGet = UnwrapModels<typeof ByIdGet>;
