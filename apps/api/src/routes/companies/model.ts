import { t, type UnwrapModels } from "elysia";

const Company = t.Object({
  id: t.String(),
  name: t.String(),
  city: t.String(),
});

export const Get = {
  Response: {
    200: t.Array(Company),
    401: t.Object({ error: t.String() }),
  },
};
export type Get = UnwrapModels<typeof Get>;
