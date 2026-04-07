import type { PriceHistoryPoint } from '../../types/marketplace';

interface MarketPriceChartProps {
  data: PriceHistoryPoint[];
  width?: number;
  height?: number;
}

export function MarketPriceChart({ data, width = 260, height = 100 }: MarketPriceChartProps) {
  if (data.length < 2) {
    return (
      <div style={{
        width, height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 4, fontSize: 10,
        color: 'var(--color-text-muted)',
      }}>
        Not enough data for chart
      </div>
    );
  }

  const padding = { top: 8, right: 8, bottom: 18, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const minTime = data[0].timestamp;
  const maxTime = data[data.length - 1].timestamp;
  const timeRange = maxTime - minTime || 1;

  // Build path
  const points = data.map((d, i) => {
    const x = padding.left + (chartW * (d.timestamp - minTime)) / timeRange;
    const y = padding.top + chartH - (chartH * (d.price - minPrice)) / priceRange;
    return { x, y };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  // Trend color: compare first and last price
  const firstPrice = data[0].price;
  const lastPrice = data[data.length - 1].price;
  const lineColor = lastPrice > firstPrice ? '#22c55e' : lastPrice < firstPrice ? '#ef4444' : '#9ca3af';

  // Y-axis labels (3 ticks)
  const yTicks = [minPrice, Math.round((minPrice + maxPrice) / 2), maxPrice];

  // X-axis labels (first and last date)
  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {/* Background */}
      <rect x={0} y={0} width={width} height={height} fill="var(--color-bg-tertiary)" rx={4} />

      {/* Grid lines */}
      {yTicks.map((tick, i) => {
        const y = padding.top + chartH - (chartH * (tick - minPrice)) / priceRange;
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y}
              stroke="#374151" strokeWidth={0.5} strokeDasharray="2,2" />
            <text x={padding.left - 4} y={y + 3} textAnchor="end"
              fill="var(--color-text-muted)" fontSize={8}>
              {tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : tick}
            </text>
          </g>
        );
      })}

      {/* Price line */}
      <path d={pathD} fill="none" stroke={lineColor} strokeWidth={1.5} strokeLinejoin="round" />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2} fill={lineColor} />
      ))}

      {/* X-axis labels */}
      <text x={padding.left} y={height - 2} fill="var(--color-text-muted)" fontSize={8}>
        {formatDate(minTime)}
      </text>
      <text x={width - padding.right} y={height - 2} textAnchor="end" fill="var(--color-text-muted)" fontSize={8}>
        {formatDate(maxTime)}
      </text>
    </svg>
  );
}
