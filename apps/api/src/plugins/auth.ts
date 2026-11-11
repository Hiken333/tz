import { Elysia, status, t } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { users } from "../db/schema";
import type { Actor } from "../libs/actor";

export const sessionCookie = t.Cookie(t.Optional(t.String()), {
  sign: true,
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
});

export const sessionAuth = new Elysia({ name: "session-auth" }).macro({
  auth: {
    cookie: t.Object({ session: sessionCookie }),
    async derive({ cookie }) {
      const userId = cookie.session.value;
      if (!userId) return status(401, { error: "Войдите в кабинет" });
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          companyId: users.companyId,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      if (!user) return status(401, { error: "Сессия больше не действует" });
      const actor: Actor = user;
      return { actor };
    },
  },
});
