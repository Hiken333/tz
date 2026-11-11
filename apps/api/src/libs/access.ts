import type { Actor } from "./actor";

export type { Actor };

export function canSeeCompany(actor: Actor, companyId: string) {
  if (actor.role === "admin") return true;
  return actor.companyId === companyId;
}

export function visibleCompanyId(actor: Actor, requested?: string) {
  if (actor.role === "client") return actor.companyId;
  return requested ?? null;
}
