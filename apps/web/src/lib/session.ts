import { redirect } from "next/navigation";
import { cache } from "react";
import { serverApi } from "./api";

export const getActor = cache(async () => {
  const api = await serverApi();
  const { data, error } = await api.auth.me.get();
  if (error || !data) return null;
  return data;
});

export async function requireActor() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  return actor;
}
