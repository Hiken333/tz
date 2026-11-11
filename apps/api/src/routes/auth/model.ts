import { t, type UnwrapModels } from "elysia";

const PublicUser = t.Object({
  id: t.String(),
  email: t.String(),
  name: t.String(),
  role: t.UnionEnum(["admin", "client"]),
  companyId: t.Nullable(t.String()),
});

export const Post = {
  Body: t.Object({
    email: t.String({ minLength: 3, format: "email" }),
    password: t.String({ minLength: 8 }),
  }),
  Response: {
    200: PublicUser,
    401: t.Object({ error: t.String() }),
  },
};
export type Post = UnwrapModels<typeof Post>;

export const MeGet = {
  Response: {
    200: PublicUser,
    401: t.Object({ error: t.String() }),
  },
};
export type MeGet = UnwrapModels<typeof MeGet>;

export const LogoutPost = {
  Response: t.Object({ ok: t.Literal(true) }),
};
export type LogoutPost = UnwrapModels<typeof LogoutPost>;
