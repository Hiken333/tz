import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { companies } from "../../db/schema";
import type { Actor } from "../../libs/access";

export async function listCompanies(actor: Actor) {
  if (actor.role === "client" && actor.companyId) {
    return db.select().from(companies).where(eq(companies.id, actor.companyId));
  }
  return db.select().from(companies);
}
