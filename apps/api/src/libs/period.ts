export const periodValues = ["7d", "30d", "90d"] as const;
export type Period = (typeof periodValues)[number];

const daysByPeriod: Record<Period, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export function periodBounds(period: Period) {
  const days = daysByPeriod[period];
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - (days - 1));
  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  };
}
