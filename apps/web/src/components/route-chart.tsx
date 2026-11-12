type Point = { day: string; value: number };

export function RouteChart({
  series,
  label,
  unit,
}: {
  series: Point[];
  label: string;
  unit: string;
}) {
  if (series.length === 0) {
    return (
      <p className="border border-line bg-plate px-5 py-8 text-ink/80">
        За выбранный период нет точек. Сдвиньте период или выберите другой филиал.
      </p>
    );
  }

  const width = 800;
  const height = 280;
  const padLeft = 56;
  const padRight = 64;
  const padTop = 16;
  const padBottom = 36;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const rawMax = Math.max(...series.map((point) => point.value), 1);
  const max = niceCeil(rawMax);
  const peak = series.reduce((best, point) => (point.value > best.value ? point : best));
  const last = series[series.length - 1];
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((part) => Math.round(max * part));

  const points = series.map((point, index) => {
    const x = padLeft + (index / Math.max(series.length - 1, 1)) * plotWidth;
    const y = padTop + plotHeight - (point.value / max) * plotHeight;
    return { ...point, x, y };
  });

  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const xLabelCount = Math.min(series.length, series.length <= 8 ? series.length : 5);
  const xIndexes = Array.from({ length: xLabelCount }, (_, i) =>
    Math.round((i * (series.length - 1)) / Math.max(xLabelCount - 1, 1)),
  );

  return (
    <figure className="border border-night/20 bg-plate p-4 md:p-5">
      <figcaption className="mb-1 font-[family-name:var(--font-display)] text-xl text-night">
        {label}
      </figcaption>
      <p className="mb-4 max-w-2xl text-sm text-ink/70">
        По вертикали — сколько {unit} было за день, не сумма с начала периода. Самый высокий день:{" "}
        {formatCount(peak.value)}, {formatDay(peak.day)}.
      </p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${label}. От ${formatCount(0)} до ${formatCount(max)} ${unit} в день`}
        className="h-auto w-full"
      >
        {yTicks.map((tick, index) => {
          const y = padTop + plotHeight - (tick / max) * plotHeight;
          return (
            <g key={`${tick}-${index}`}>
              <line
                x1={padLeft}
                x2={width - padRight}
                y1={y}
                y2={y}
                stroke="#cfdad3"
                strokeDasharray={index === 0 ? "0" : "3 5"}
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                fill="#142022"
                fontSize="11"
                fontFamily="inherit"
              >
                {formatCount(tick)}
              </text>
            </g>
          );
        })}
        <polyline
          fill="none"
          stroke="#16343f"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={line}
        />
        <circle cx={points.at(-1)?.x} cy={points.at(-1)?.y} r="5" fill="#d4920a" />
        <text
          x={width - padRight + 8}
          y={(points.at(-1)?.y ?? 0) + 4}
          fill="#16343f"
          fontSize="12"
          fontFamily="inherit"
        >
          {formatCount(last.value)}
        </text>
        {xIndexes.map((index) => {
          const point = points[index];
          return (
            <text
              key={`${point.day}-${index}`}
              x={point.x}
              y={height - 8}
              textAnchor="middle"
              fill="#142022"
              fontSize="11"
              fontFamily="inherit"
            >
              {formatDay(point.day)}
            </text>
          );
        })}
      </svg>
    </figure>
  );
}

function niceCeil(value: number) {
  if (value <= 0) return 1;
  const exp = 10 ** Math.floor(Math.log10(value));
  const scaled = value / exp;
  const nice = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10;
  return nice * exp;
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(
    new Date(value),
  );
}

function formatCount(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}
