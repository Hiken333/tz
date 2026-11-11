import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { users } from "../../db/schema";
import type * as AuthModel from "./model";

export async function verifyLogin(
  email: AuthModel.Post["Body"]["email"],
  password: AuthModel.Post["Body"]["password"],
) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) return null;
  const matches = await Bun.password.verify(password, user.passwordHash);
  if (!matches) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId,
  } satisfies AuthModel.Post["Response"][200];
}
