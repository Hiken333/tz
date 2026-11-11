"use client";

import { treaty } from "@elysia/eden";
import type { App } from "@istinny/api/app";

export function browserApi() {
  return treaty<App>(`${window.location.origin}/api-proxy`, {
    fetch: { credentials: "include" },
  });
}
