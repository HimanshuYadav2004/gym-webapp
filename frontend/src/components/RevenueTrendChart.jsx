import { useState, useRef, useMemo } from 'react';
import { format } from 'date-fns';
import { formatINR } from '../utils/currency';

const WIDTH = 600;
const HEIGHT = 200;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;
const PAD_X = 8;

const RevenueTrendChart = ({ data }) => {
  const svgRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  const { points, path, areaPath, maxAmount } = useMemo(() => {
    if (!data || data.length === 0) return { points: [], path: '', areaPath: '', maxAmount: 0 };

    const max = Math.max(...data.map((d) => d.amount), 1);
    const plotW = WIDTH - PAD_X * 2;
    const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
    const step = data.length > 1 ? plotW / (data.length - 1) : 0;

    const pts = data.map((d, i) => ({
      x: PAD_X + i * step,
      y: PAD_TOP + plotH - (d.amount / max) * plotH,
      ...d
    }));

    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
    const area = `${linePath} L ${pts[pts.length - 1].x.toFixed(2)} ${PAD_TOP + plotH} L ${pts[0].x.toFixed(2)} ${PAD_TOP + plotH} Z`;

    return { points: pts, path: linePath, areaPath: area, maxAmount: max };
  }, [data]);

  if (!data || data.length === 0 || points.length === 0) {
    return <p className="text-ink-400 text-center py-16 text-sm">No revenue data yet.</p>;
  }

  const total = data.reduce((s, d) => s + d.amount, 0);

  const nearestIndex = (clientX) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * WIDTH;
    let closest = 0;
    let minDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relX);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    return closest;
  };

  const handleMove = (clientX) => setHoverIndex(nearestIndex(clientX));

  const active = hoverIndex !== null ? points[hoverIndex] : null;

  // Show at most 5 date labels along the x-axis, evenly spaced
  const labelCount = Math.min(5, points.length);
  const labelIndices = Array.from({ length: labelCount }, (_, i) =>
    Math.round((i * (points.length - 1)) / Math.max(labelCount - 1, 1))
  );

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <p className="font-display text-2xl sm:text-3xl text-white tracking-wide">{formatINR(total)}</p>
        <p className="text-xs text-ink-500">{data.length} days</p>
      </div>

      <div className="relative -mx-1 mt-3 touch-pan-y">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="w-full h-40 sm:h-48"
          onMouseMove={(e) => handleMove(e.clientX)}
          onMouseLeave={() => setHoverIndex(null)}
          onTouchStart={(e) => handleMove(e.touches[0].clientX)}
          onTouchMove={(e) => handleMove(e.touches[0].clientX)}
          onTouchEnd={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Recessive baseline */}
          <line
            x1={PAD_X} y1={HEIGHT - PAD_BOTTOM} x2={WIDTH - PAD_X} y2={HEIGHT - PAD_BOTTOM}
            stroke="#363c4b" strokeWidth="1"
          />

          <path d={areaPath} fill="url(#revenueFill)" />
          <path d={path} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

          {/* X-axis date labels */}
          {labelIndices.map((i) => (
            <text
              key={i}
              x={points[i].x}
              y={HEIGHT - 8}
              textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
              fontSize="10"
              fill="#5b6478"
            >
              {format(new Date(points[i].date), 'MMM d')}
            </text>
          ))}

          {active && (
            <>
              <line
                x1={active.x} y1={PAD_TOP} x2={active.x} y2={HEIGHT - PAD_BOTTOM}
                stroke="#7d879a" strokeWidth="1" strokeDasharray="3 3"
              />
              <circle cx={active.x} cy={active.y} r="4" fill="#ef4444" stroke="#0c0d11" strokeWidth="2" />
            </>
          )}
        </svg>

        {active && (
          <div
            className="absolute top-0 pointer-events-none bg-ink-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs shadow-lift whitespace-nowrap"
            style={{
              left: `${(active.x / WIDTH) * 100}%`,
              transform: `translateX(${active.x < WIDTH / 2 ? '4px' : 'calc(-100% - 4px)'})`
            }}
          >
            <p className="text-ink-400">{format(new Date(active.date), 'EEE, MMM d')}</p>
            <p className="text-white font-bold">{formatINR(active.amount)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueTrendChart;
