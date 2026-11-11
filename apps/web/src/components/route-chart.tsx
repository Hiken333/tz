type Point = { day: string; value: number };

export function RouteChart({ series, label }: { series: Point[]; label: string }) {
  if (series.length === 0) {
    return (
      <p className="border border-line bg-plate px-5 py-8 text-ink/80">
        За выбранный период нет точек. Сдвиньте период или выберите другой филиал.
      </p>
    );
  }

  const width = 720;
  const height = 220;
  const pad = 28;
  const max = Math.max(...series.map((point) => point.value), 1);
  const min = Math.min(...series.map((point) => point.value), 0);
  const span = Math.max(max - min, 1);
  const coords = series.map((point, index) => {
    const x = pad + (index / Math.max(series.length - 1, 1)) * (width - pad * 2);
    const y = height - pad - ((point.value - min) / span) * (height - pad * 2);
    return `${x},${y}`;
  });

  return (
    <figure className="border border-night/20 bg-plate p-4">
      <figcaption className="mb-3 text-sm text-ink/70">{label}</figcaption>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={label}
        className="h-auto w-full"
      >
        <line x1={pad} x2={width - pad} y1={height - pad} y2={height - pad} stroke="#cfdad3" />
        <polyline
          fill="none"
          stroke="#16343f"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={coords.join(" ")}
        />
        <circle
          cx={coords.at(-1)?.split(",")[0]}
          cy={coords.at(-1)?.split(",")[1]}
          r="5"
          fill="#d4920a"
        />
      </svg>
      <div className="mt-2 flex justify-between text-xs text-ink/60">
        <span>{formatDay(series[0].day)}</span>
        <span>{formatDay(series[series.length - 1].day)}</span>
      </div>
    </figure>
  );
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(
    new Date(value),
  );
}
