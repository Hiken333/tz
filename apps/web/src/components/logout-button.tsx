"use client";

import { useRouter } from "next/navigation";
import { browserApi } from "../lib/browser-api";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-sm text-enamel/80 underline-offset-4 hover:underline"
      onClick={async () => {
        await browserApi().auth.logout.post();
        router.push("/login");
        router.refresh();
      }}
    >
      Выйти
    </button>
  );
}
