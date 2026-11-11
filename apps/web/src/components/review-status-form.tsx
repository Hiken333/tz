"use client";

import { useRouter } from "next/navigation";
import { browserApi } from "../lib/browser-api";

const labels = {
  new: "Новый",
  processing: "В работе",
  done: "Обработан",
} as const;

export function ReviewStatusForm({ id, status }: { id: string; status: keyof typeof labels }) {
  const router = useRouter();
  return (
    <select
      aria-label="Статус обработки"
      defaultValue={status}
      className="border border-night/30 bg-enamel px-2 py-1 text-sm"
      onChange={async (event) => {
        const next = event.target.value as keyof typeof labels;
        const { error } = await browserApi().reviews({ id }).patch({ status: next });
        if (error) {
          event.target.value = status;
          return;
        }
        router.refresh();
      }}
    >
      {Object.entries(labels).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
