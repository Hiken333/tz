import { treaty } from "@elysia/eden";
import type { App } from "@istinny/api/app";
import { cookies } from "next/headers";
import { cache } from "react";

const apiOrigin = process.env.API_URL ?? "http://localhost:3001";

export const serverApi = cache(async () => {
  const jar = await cookies();
  return treaty<App>(apiOrigin, {
    headers: { cookie: jar.toString() },
    fetch: { cache: "no-store" },
  });
});
