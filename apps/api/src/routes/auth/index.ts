import { Elysia, status, t } from "elysia";
import { sessionAuth, sessionCookie } from "../../plugins/auth";
import * as AuthModel from "./model";
import { verifyLogin } from "./service";

export const auth = new Elysia({ prefix: "/auth" })
  .use(sessionAuth)
  .post(
    "/login",
    {
      body: AuthModel.Post.Body,
      cookie: t.Object({ session: sessionCookie }),
      response: AuthModel.Post.Response,
    },
    async ({ body, cookie }) => {
      const user = await verifyLogin(body.email, body.password);
      if (!user) return status(401, { error: "Неверный email или пароль" });
      cookie.session.value = user.id;
      return user;
    },
  )
  .post(
    "/logout",
    {
      cookie: t.Object({ session: sessionCookie }),
      response: AuthModel.LogoutPost.Response,
    },
    ({ cookie }) => {
      cookie.session.remove();
      return { ok: true as const };
    },
  )
  .get(
    "/me",
    {
      auth: true,
      response: AuthModel.MeGet.Response,
    },
    ({ actor }) => actor,
  );
